(function(global) {
  var teddy, // @namespace

      // private utility vars
      consoleWarnings,          // used to overload console.warn for the server-side error gui
      consoleErrors,            // used to overload console.error for the server-side error gui
      fs,                       // server-side filesystem module
      path,                     // server-side utility for manipulating file paths
      contextModels = [],       // stores local models for later consumption by template logic tags
      matchRecursive;           // see below

  /* matchRecursive
   * accepts a string to search and a format (start and end tokens separated by "...").
   * returns an array of matches, allowing nested instances of format.
   *
   * examples:
   *   matchRecursive("test",          "(...)")   -> []
   *   matchRecursive("(t(e)s)()t",    "(...)")   -> ["t(e)s", ""]
   *   matchRecursive("t<e>>st",       "<...>")   -> ["e"]
   *   matchRecursive("t<<e>st",       "<...>")   -> ["e"]
   *   matchRecursive("t<<e>>st",      "<...>")   -> ["<e>"]
   *   matchRecursive("<|t<e<|s|>t|>", "<|...|>") -> ["t<e<|s|>t"]
   *
   * (c) 2007 Steven Levithan <stevenlevithan.com>
   * MIT License
   *
   * altered for use within teddy
   */
  matchRecursive = (function() {
    var formatParts = /^([\S\s]+?)\.\.\.([\S\s]+)/,
        metaChar = /[-[\]{}()*+?.\\^$|,]/g;

    function escape (str) {
      return str.replace(metaChar, '\\$&');
    }

    return function(str, format) {
      var p = formatParts.exec(format),
          opener,
          closer,
          iterator,
          results = [],
          openTokens,
          matchStartIndex,
          match;

      opener = p[1];
      closer = p[2];
      // use an optimized regex when opener and closer are one character each
      iterator = new RegExp(format.length === 5 ? '['+escape(opener+closer)+']' : escape(opener)+'|'+escape(closer), 'g');

      do {
        openTokens = 0;
        while (match = iterator.exec(str)) {
          if (match[0] === opener) {
            if (!openTokens) {
              matchStartIndex = iterator.lastIndex;
            }
            openTokens++;
          }
          else if (openTokens) {
            openTokens--;
            if (!openTokens) {
              results.push(str.slice(matchStartIndex, match.index));
            }
          }
        }
      }
      while (openTokens && (iterator.lastIndex = matchStartIndex));

      return results;
    };
  })();

  teddy = {

    /**
     * public member vars
     */

    // default values for parameters sent to teddy
    params: {
      verbosity: 1,
      templateRoot: './',
      cacheRenders: false,
      defaultCaches: 1,
      templateMaxCaches: {},
      cacheWhitelist: false,
      cacheBlacklist: [],
      compileAtEveryRender: false,
      minify: false,
      maxPasses: 25000
    },

    // compiled templates are stored as object collections, e.g. { "myTemplate.html": "<p>some markup</p>"}
    templates: {},

    // cache of fully rendered temmplates, e.g. { "myTemplate.html": "<p>some markup</p>"}
    renderedTemplates: {},

    /**
     * mutator methods for public member vars
     */

    // mutator method to set verbosity param. takes human-readable string argument and converts it to an integer for more efficient checks against the setting
    setVerbosity: function(v) {
      switch (v) {
        case 'none':
        case 0:
          v = 0;
          break;
        case 'verbose':
        case 2:
          v = 2;
          break;
        case 'DEBUG':
        case 3:
          v = 3;
          break;
        default: // concise
          v = 1;
      }
      teddy.params.verbosity = v;
    },

    // mutator method to set template root param; must be a string
    setTemplateRoot: function(v) {
      teddy.params.templateRoot = String(v);
    },

    // turn on or off the setting to cache template renders
    cacheRenders: function(v) {
      teddy.params.cacheRenders = Boolean(v);
    },

    // mutator method to set default caches param: the number of cached versions of each templates to store by default if cacheRenders is enabled
    setDefaultCaches: function(v) {
      teddy.params.defaultCaches = parseInt(v);
    },

    // mutator method to set max caches for a given registered template
    setMaxCaches: function(template, v) {
      teddy.params.templateMaxCaches[String(template)] = parseInt(v);
    },

    // mutator method to set a whitelist of templates to cache, e.g. { "myTemplate.html": maxCaches} where maxCaches is an integer
    setCacheWhitelist: function(o) {
      var i;
      teddy.params.cacheWhitelist = o;
      for (i in o) {
        teddy.setMaxCaches(i, o[i]);
      }
    },

    // mutator method to set a blacklist of templates not to cache as an array
    setCacheBlacklist: function(a) {
      teddy.params.cacheBlacklist = a;
    },

    // turn on or off the setting to compile templates at every render
    compileAtEveryRender: function(v) {
      teddy.params.compileAtEveryRender = Boolean(v);
    },

    // turn on or off the setting to minify templates using teddy's internal minifier
    minify: function(v) {
      teddy.params.minify = Boolean(v);
    },

    // mutator method to set max passes param: the number of times the parser can iterate over the template
    setMaxPasses: function(v) {
      teddy.params.maxPasses = Number(v);
    },

    // teddy's internal console logging system
    warnings: [],
    errors: [],
    console: {
      warn: function(value) {
        console.warn(value);
        teddy.warnings.push(value);
        consoleWarnings += '<li>' + escapeHtmlEntities(value) + '</li>';
      },
      error: function(value) {
        console.error(value);
        teddy.errors.push(value);
        consoleErrors += '<li>' + escapeHtmlEntities(value) + '</li>';
      }
    },

    /**
     * public methods
     */

    // compiles a template (removes {! comments !} and unnecessary whitespace)
    compile: function(template) {
      var name = template, oldTemplate, comments, l, i, register = false;

      // it's assumed that the argument is already a template string if we're not server-side
      if (typeof template !== 'string') {
        if (teddy.params.verbosity > 1) {
          teddy.console.warn('teddy.compile attempted to compile a template which is not a string.');
        }
        return '';
      }

      // get contents of file if template is a file
      if (template.indexOf('<') === -1 && fs) {
        register = true;
        try {
          template = fs.readFileSync(template, 'utf8');
        }
        catch (e) {
          try {
            template = fs.readFileSync(teddy.params.templateRoot + template, 'utf8');
          }
          catch (e) {
            try {
              template = fs.readFileSync(teddy.params.templateRoot + '/' + template, 'utf8');
            }
            catch (e) {
              // do nothing, attempt to render it as code
              register = false;
            }
          }
        }
      }

      // remove {! comments !} and (optionally) unnecessary whitespace
      do {
        oldTemplate = template;

        if (teddy.params.minify) {
          template = template
            .replace(/[\f\n\r\t\v]*/g, '')
            .replace(/\s{2,}/g, ' ');
        }

        comments = matchRecursive(template, '{!...!}');
        l = comments.length;

        for (i = 0; i < l; i++) {
          template = replaceNonRegex(template, '{!' + comments[i] + '!}', '');
        }
      }
      while (oldTemplate !== template);

      if (register) {
        teddy.templates[name] = template;
        return template;
      }
      else {
        return template.slice(-5) === '.html' ? template.substring(0, template.length - 5) : template;
      }
    },

    // invalidates cache of a given template and model combination
    // if no model is supplied, deletes all caches of the given template
    flushCache: function(template, model) {
      // append extension if not present
      if (template.slice(-5) !== '.html') {
        template += '.html';
      }

      if (model) {
        var renders = teddy.renderedTemplates[template],
            i,
            l,
            render,
            stringyModel,
            renderStringyModel;
        if (renders) {
          l = renders.length;
        }
        else {
          return;
        }
        jsonStringifyCache = [];
        stringyModel = JSON.stringify(model, jsonStringifyRemoveCircularReferences);
        for (i = 0; i < l; i++) {
          render = renders[i];
          jsonStringifyCache = [];
          renderStringyModel = JSON.stringify(render.model, jsonStringifyRemoveCircularReferences);
          if (renderStringyModel === stringyModel) {
            teddy.renderedTemplates[template].splice(i, 1);
          }
        }
      }
      else {
        delete teddy.renderedTemplates[template];
      }
    },

    // parses a template
    render: function(template, model, callback) {
      model = Object.assign({}, model); // make a copy of the model

      // ensure template is a string
      if (typeof template !== 'string') {
        if (teddy.params.verbosity > 1) {
          teddy.console.warn('teddy.render attempted to render a template which is not a string.');
        }
        return '';
      }

      // declare vars
      var renderedTemplate,
          diff,
          loops = [],
          loopCount,
          loop,
          i,
          l,
          el,
          localModel,
          errors,
          passes = 0,
          renders,
          render,
          stringyModel,
          renderStringyModel,
          maxPasses = teddy.params.maxPasses,
          maxPassesError = 'Render aborted due to max number of passes (' + maxPasses + ') exceeded; there is a possible infinite loop in your template logic.';

      // overload console logs
      consoleWarnings = '';
      consoleErrors = '';

      // express.js support
      if (model.settings && model.settings.views) {
        teddy.params.templateRoot = path.resolve(model.settings.views);
      }

      // remove templateRoot from template name if necessary
      if (template.slice(teddy.params.templateRoot.length) === teddy.params.templateRoot) {
        template = template.replace(teddy.params.templateRoot, '');
      }

      // append extension if not present
      if (template.slice(-5) !== '.html') {
        template += '.html';
      }

      // return cached template if one exists
      if (teddy.params.cacheRenders && teddy.templates[template] && (!teddy.params.cacheWhitelist || teddy.params.cacheWhitelist[template]) && teddy.params.cacheBlacklist.indexOf(template) < 0) {
        jsonStringifyCache = [];
        stringyModel = JSON.stringify(model, jsonStringifyRemoveCircularReferences);
        teddy.renderedTemplates[template] = teddy.renderedTemplates[template] || [];
        renders = teddy.renderedTemplates[template];
        l = renders.length;
        for (i = 0; i < l; i++) {
          render = renders[i];
          jsonStringifyCache = [];
          renderStringyModel = JSON.stringify(render.model, jsonStringifyRemoveCircularReferences);
          if (renderStringyModel === stringyModel) {

            // move to last position in the array to mark it as most recently accessed
            teddy.renderedTemplates[template].push(teddy.renderedTemplates[template].splice(i, 1)[0]);
            return render.renderedTemplate;
          }
        }
      }

      // compile template if necessary
      if (!teddy.templates[template] || teddy.params.compileAtEveryRender) {
        renderedTemplate = teddy.compile(template);
      }

      renderedTemplate = teddy.templates[template] || renderedTemplate;

      // prepare to cache the template if caching is enabled and this template is eligible
      if (teddy.params.cacheRenders && teddy.templates[template] && (!teddy.params.cacheWhitelist || teddy.params.cacheWhitelist[template]) && teddy.params.cacheBlacklist.indexOf(template) < 0) {
        teddy.renderedTemplates[template] = teddy.renderedTemplates[template] || [];
        l = teddy.renderedTemplates[template].length;

        // remove first (oldest) item from the array if cache limit is reached
        if ((teddy.params.templateMaxCaches[template] && l >= teddy.params.templateMaxCaches[template]) || (!teddy.params.templateMaxCaches[template] && l >= teddy.params.defaultCaches)) {
          teddy.renderedTemplates[template].shift();
        }
        l = teddy.renderedTemplates[template].push({
          renderedTemplate: '',
          model: Object.assign({}, model)
        });
      }

      if (!renderedTemplate) {
        if (teddy.params.verbosity) {
          teddy.console.warn('teddy.render attempted to render a template which doesn\'t exist: ' + template);
        }
        return '';
      }

      function parseNonLoopedElements() {
        var outerLoops,
            outerLoopsCount;

        function replaceLoops(match) {
          loops.push(match);
          return '{' + loops.length + '_loop}';
        }

        do {
          diff = renderedTemplate;

          // find loops and remove them for now
          outerLoops = matchRecursive(renderedTemplate, '<loop...<\/loop>');
          outerLoopsCount = outerLoops.length;
          for (i = 0; i < outerLoopsCount; i++) {
            renderedTemplate = renderedTemplate.replace('<loop' + outerLoops[i] + '<\/loop>', replaceLoops);
          }

          // parse non-looped conditionals
          renderedTemplate = parseConditionals(renderedTemplate, model);

          // parse non-looped includes
          renderedTemplate = parseIncludes(renderedTemplate, model);

          passes++;
          if (passes >= maxPasses) {
            return false;
          }
        }
        while (diff !== renderedTemplate); // do another pass if this introduced new code to parse
        return true;
      }

      do {
        do {
          if (parseNonLoopedElements()) {

            // parse removed loops
            loopCount = loops.length;
            for (i = 0; i < loopCount; i++) {
              loop = loops[i];
              if (loop) {

                // try for a version of this loop that might have a data model attached to it now
                el = renderedTemplate.match(new RegExp('(?:{' + ( i + 1 ) + '_loop data-local-model=\\\'[\\S\\s]*?\\\'})'));

                if (el && el[0]) {
                  el = el[0];
                  localModel = el.split(' ');
                  localModel = localModel[1].slice(0, -1);
                  loop = loop.replace('>', ' ' + localModel + '>');
                  renderedTemplate = replaceNonRegex(renderedTemplate, el, renderLoop(loop, model));
                }

                // no data model on it, render it vanilla
                else {
                  renderedTemplate = replaceNonRegex(renderedTemplate, '{' + (i + 1) + '_loop}', renderLoop(loop, model));
                }
                loops[i] = null; // this prevents renderLoop from attempting to render it again
              }
            }
          }
          else {
            if (teddy.params.verbosity) {
              teddy.console.error(maxPassesError);
            }
            return maxPassesError;
          }
          passes++;
          if (passes >= maxPasses) {
            if (teddy.params.verbosity) {
              teddy.console.error(maxPassesError);
            }
            return maxPassesError;
          }
        }
        while (diff !== renderedTemplate); // do another pass if this introduced new code to parse

        // clean up any remaining unnecessary <elseif>, <elseunless>, <else>, and orphaned <arg> tags
        renderedTemplate = renderedTemplate.replace(/(?:<elseif[\S\s]*?<\/elseif>|<elseunless[\S\s]*?<\/elseunless>|<else[\S\s]*?<\/else>|<arg[\S\s]*?<\/arg>)/g, '');

        // processes all remaining {vars}
        renderedTemplate = parseVars(renderedTemplate, model);

        passes++;
        if (passes >= maxPasses) {
          if (teddy.params.verbosity) {
            teddy.console.error(maxPassesError);
          }
          return maxPassesError;
        }
      }
      while (diff !== renderedTemplate); // do another pass if this introduced new code to parse

      // clean up temp vars
      contextModels = [];
      passes = 0;

      // if we have no template and we have errors, render an error page
      if (!renderedTemplate && (consoleErrors || consoleWarnings)) {
        renderedTemplate = '<!DOCTYPE html><html lang=\'en\'><head><meta charset=\'utf-8\'><title>Could not parse template</title></head><body><h1>Could not parse template</h1>';
        if (consoleErrors) {
          renderedTemplate += '<p>The following errors occurred while parsing the template:</p>';
          renderedTemplate += '<ul>';
          renderedTemplate += consoleErrors;
          renderedTemplate += '</ul>';
        }
        if (consoleWarnings) {
          renderedTemplate += '<p>The following warnings occurred while parsing the template:</p>';
          renderedTemplate += '<ul>';
          renderedTemplate += consoleWarnings;
          renderedTemplate += '</ul>';
        }
        renderedTemplate += '</body></html>';
        consoleWarnings = '';
        consoleErrors = '';
      }

      // cache the template if caching is enabled and this template is eligible
      if (teddy.params.cacheRenders && teddy.templates[template] && (!teddy.params.cacheWhitelist || teddy.params.cacheWhitelist[template]) && teddy.params.cacheBlacklist.indexOf(template) < 0) {
        teddy.renderedTemplates[template][l - 1].renderedTemplate = renderedTemplate;
      }

      // execute callback if present, otherwise simply return the rendered template string
      if (typeof callback === 'function') {
        if (!errors) {
          callback(null, renderedTemplate);
        }
        else {
          callback(consoleErrors, renderedTemplate);
        }
      }
      else {
        return renderedTemplate;
      }

      /**
       * private methods
       */

      // finds all <include> tags and renders them
      function parseIncludes(renderedTemplate, model) {
        var els = matchRecursive(renderedTemplate, '<include...<\/include>'),
            el,
            l = els ? els.length : 0,
            result,
            i;

        for (i = 0; i < l; i++) {
          el = '<include' + els[i] + '</include>';
          model = applyLocalModel(el, model);
          result = renderInclude(el, model);
          renderedTemplate = replaceNonRegex(renderedTemplate, el, result);
        }

        return renderedTemplate;
      }

      // finds all <if> and <unless> tags and renders them along with any related <elseif>, <elseunless>, and <else> tags
      function parseConditionals(renderedTemplate, model) {
        var conds,
            loopTypesLeft = true,
            findElses = true,
            condString,
            sibling,
            ifsDone = false,
            parts,
            elseCond,
            result,
            onelines,
            el,
            l,
            result,
            i;

        do {
          if (ifsDone) {
            conds = matchRecursive(renderedTemplate, '<unless ...<\/unless>');
            loopTypesLeft = false;
          }
          else {
            conds = matchRecursive(renderedTemplate, '<if ...<\/if>');
          }
          l = conds.length;

          for (i = 0; i < l; i++) {
            condString = conds[i];
            if (ifsDone) {
              condString = '<unless ' + condString + '<\/unless>';
            }
            else {
              condString = '<if ' + condString + '<\/if>';
            }
            parts = [condString];
            findElses = true;
            do {
              sibling = renderedTemplate.match(new RegExp(condString.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&') + '[\\s]*[^.]{12}'));
              if (sibling) {
                sibling = sibling[0];
                sibling = replaceNonRegex(sibling, condString, '');

                if (sibling.replace(/^\s+/, '').substring(0, 8) === '<elseif ') {
                  elseCond = matchRecursive(renderedTemplate, condString + sibling + '...<\/elseif>');
                  elseCond = elseCond ? sibling + replaceNonRegex(elseCond[0], condString, '') + '</elseif>' : null;
                }
                else if (sibling.replace(/^\s+/, '').substring(0, 12) === '<elseunless ') {
                  elseCond = matchRecursive(renderedTemplate, condString + sibling + '...<\/elseunless>');
                  elseCond = elseCond ? sibling + replaceNonRegex(elseCond[0], condString, '') + '</elseunless>' : null;
                }
                else if (sibling.replace(/^\s+/, '').substring(0, 6) === '<else>') {
                  elseCond = matchRecursive(renderedTemplate, condString + sibling + '...<\/else>');
                  elseCond = elseCond ? sibling + replaceNonRegex(elseCond[0], condString, '') + '</else>' : null;
                }
                else {
                  findElses = false;
                  elseCond = false;
                }

                if (elseCond) {
                  parts.push(elseCond);
                  condString += elseCond;
                }
                else {
                  findElses = false;
                }
              }
              else {
                findElses = false;
              }
            }
            while (findElses);

            result = renderConditional(condString, parts, model);
            renderedTemplate = replaceNonRegex(renderedTemplate, condString, result);
          }
          ifsDone = true;
        }
        while (loopTypesLeft);

        // do one line ifs now...
        if (renderedTemplate.indexOf('if-') > -1) {
          onelines = renderedTemplate.match(/[^<]*?if-[^>]+/g);
          l = onelines ? onelines.length : 0;

          for (i = 0; i < l; i++) {
            el = '<' + onelines[i] + '>';
            model = applyLocalModel(el, model);
            result = renderOneLineConditional(el, model);
            renderedTemplate = replaceNonRegex(renderedTemplate, el, result);
          }
        }

        return renderedTemplate;
      }

      // finds alls {vars} in a given document and replaces them with values from the model
      function parseVars(docstring, model) {
        var vars = matchRecursive(docstring, '{...}'),
            l = vars.length,
            i;

        for (i = 0; i < l; i++) {
          docstring = replaceVar(docstring, vars[i]);
        }

        function replaceVar(docstring, match) {
          var localModelString,
              localModel,
              varname,
              ovarname,
              omatch = match,
              nmatch = match,
              dots,
              numDots,
              curVar,
              doRender = true,
              d;

          match = parseVars(match, model);
          nmatch = match;

          match = match.split('data-local-model=\'');
          localModelString = match[1]; // the variable's local model (if any)
          varname = match[0].trim(); // the variable's name (plus any flags)
          ovarname = varname;
          varname = varname.split('|s')[0]; // remove escape flag if present
          if (localModelString) {
            localModel = applyLocalModel('{'+varname+' ' + 'data-local-model=\'' + localModelString + '}', Object.assign({}, model));
          }
          dots = varname.split('.');
          numDots = dots.length;
          curVar = localModel || model;

          for (d = 0; d < numDots; d++) {
            curVar = curVar[dots[d]];
            if (typeof curVar === 'undefined') {
              doRender = false;
              break;
            }
          }

          if (doRender) {
            return replaceNonRegex(docstring, '{' + omatch + '}', renderVar('{' + ovarname + '}', ovarname, curVar));
          }
          else {
            return replaceNonRegex(docstring, '{' + omatch + '}', ('{' + nmatch + '}').replace(/ data-local-model=\'[\S\s]*?\'/, ''));
          }
        }

        return docstring;
      }

      /**
       * Teddy render methods
       */

      // parses a single <include> tag
      function renderInclude(el, model) {
        var src, incdoc, args, argl, argname, argval, i, localModel;

        src = getAttribute(el, 'src');
        if (!src) {
          if (teddy.params.verbosity) {
            teddy.console.warn('<include> element found with no src attribute. Ignoring element.');
          }
          return '';
        }
        else {

          // parse variables which may be included in src attribute
          src = parseVars(src, model);

          // append extension if not present
          if (src.slice(-5) !== '.html') {
            src += '.html';
          }

          // compile included template if necessary
          if (!teddy.templates[src] || teddy.params.compileAtEveryRender) {
            incdoc = teddy.compile(src);
          }

          // get the template as a string
          incdoc = teddy.templates[src] || incdoc;

          // if source is the same as the file name, we consider it a template that doesn't exist
          if (incdoc === src || incdoc + '.html' === src) {
            incdoc = null;
          }

          if (!incdoc) {
            if (teddy.params.verbosity) {
              teddy.console.warn('<include> element found which references a nonexistent template ("' + src + '"). Ignoring element.');
            }
            return '';
          }
          localModel = getAttribute(el, 'data-local-model');

          // extend from the include's own local model
          if (localModel) {
            localModel = contextModels[parseInt(localModel)];
          }
          else {
            localModel = {};
          }

          args = matchRecursive(el, '<arg...<\/arg>');
          argl = args ? args.length : 0;
          for (i = 0; i < argl; i++) {
            args[i] = '<arg' + args[i] + '</arg>';
            argname = args[i].split('<arg ');
            argname = argname[1];

            if (!argname) {
              if (teddy.params.verbosity) {
                teddy.console.warn('<arg> element found with no attribute. Ignoring parent <include> element. (<include src="'+src+'">)');
              }
              return '';
            }

            argname = argname.split('>');
            argname = argname[0];
            argval = getInnerHTML(args[i]);

            // replace template string argument {var} with argument value
            incdoc = renderVar(incdoc, argname, argval, true);

            // add arg to local model
            localModel[argname] = argval;
          }

          if (argl) {
            // apply local model to child conditionals and loops
            incdoc = tagLocalModels(incdoc, localModel);
          }

          return incdoc;
        }
      }

      // finds all <include>, <if>, <elseif>, <unless>, <elseunless>, one line ifs, and <loop> tags and applies their local models
      function tagLocalModels(doc, extraModel) {
        doc = doc.replace(/(?:{[\S\s]*?}|<include[\S\s]*?>|<if[\S\s]*?>|<elseif[\S\s]*?>|<unless[\S\s]*?>|<elseunless[\S\s]*?>|<loop[\S\s]*?>|<[\S\s]if-[\S\s](?:="[\S\s]"|='[\S\s]')[\S\s](?:true=|false=)(?:="[\S\s]"|='[\S\s]')*?>)/g, addTag);

        function addTag(match) {
          var modelNumber = -1,
              localModel = getAttribute(match, 'data-local-model'),
              lastChar = match.charAt(match.length - 1);

          // get existing derivative
          if (localModel) {
            localModel = contextModels[parseInt(localModel)];
          }

          // possibly new derivative
          else {
            localModel = extraModel;
          }
          // check for duplicates
          modelNumber = contextModels.indexOf(localModel);

          // if no duplicates
          if (modelNumber < 0) {
            localModel = Object.assign(localModel, extraModel);
            modelNumber = contextModels.push(localModel);
            modelNumber--;
            return match.replace(lastChar, ' data-local-model=\'' + modelNumber + '\'' + lastChar);
          }
          else if (match.indexOf('data-local-model') === -1) {
            return match.replace(lastChar, ' data-local-model=\'' + modelNumber + '\'' + lastChar);
          }
          else {
            return match;
          }
        }

        return doc;
      }

      // retrieve local model from cache and apply it to full model for parsing
      function applyLocalModel(el, model) {
        var localModel = el.match(/data-local-model=\'[\S\s]*?\'/),
            i;

        if (localModel) {
          localModel = localModel[0];
          localModel = localModel.replace('data-local-model=\'', '');
          localModel = localModel.substring(0, localModel.length);
          localModel = contextModels[parseInt(localModel)];
          for (i in localModel) {
            model[i] = localModel[i];
          }
        }
        return model;
      }

      // parses a single loop tag
      function renderLoop(el, model) {
        var key = getAttribute(el, 'key'),
            val = getAttribute(el, 'val'),
            collection = getAttribute(el, 'through'),
            collectionString = collection,
            loopContent,
            localModel,
            item,
            i,
            key,
            parsedLoop = '';

        if (!val) {
          if (teddy.params.verbosity) {
            teddy.console.warn('loop element found with no "val" attribute. Ignoring element.');
          }
          return '';
        }
        if (!collection) {
          if (teddy.params.verbosity) {
            teddy.console.warn('loop element found with no "through" attribute. Ignoring element.');
          }
          return '';
        }

        model = applyLocalModel(el, model);
        collection = getNestedObjectByString(model, collection);

        if (!collection) {
          if (teddy.params.verbosity > 1) {
            teddy.console.warn('loop element found with undefined value "' + collectionString + '" specified for "through" or "in" attribute. Ignoring element.');
          }

          return '';
        }
        else {
          loopContent = getInnerHTML(el);

          // process loop
          for (i in collection) {
            if (collection.hasOwnProperty(i)) {
              item = collection[i];
              localModel = {};

              // define local model for the iteration
              // if model[val] or model[key] preexist, they will be overwritten by the locally supplied variables
              if (key) {
                model[key] = i;
                localModel[key] = i;
              }
              model[val] = item;
              localModel[val] = item;
              parsedLoop += teddy.render(loopContent, model);
            }
          }

          return parsedLoop;
        }
      }

      // parses a single <if> or <unless> tag and any related <elseif>, <elseunless>, and <else> tags
      function renderConditional(condString, parts, model) {
        var el = parts[0],
            satisfiedCondition = false,
            nextSibling = el;

        // add local vars to model
        model = applyLocalModel(el, model);

        while (!satisfiedCondition) {

          if (evalCondition(el, model)) {
            satisfiedCondition = true;
            return getInnerHTML(el);
          }
          else {
            do {
              nextSibling = parts[parts.indexOf(nextSibling) + 1];
              if (nextSibling && evalCondition(nextSibling, model)) {
                satisfiedCondition = true;
                return getInnerHTML(nextSibling);
              }
            }
            while (nextSibling);

            return '';
          }
        }
      }

      // parses a single one line conditional
      function renderOneLineConditional(el, model) {
        var conditionContent,
            parts = el.split(' if-'),
            part,
            l = parts.length,
            i,
            el = parts[0],
            flip = false,
            extraString = '',

            // One line if statement regexp
            midIfBinaryConditionalRegexp = /(?: if-[\S]*?=(?:"[\S\s]*?"|'[\S\s]*?') )/,
            endIfBinaryConditionalRegexp = /(?: if-[\S]*?=(?:"[\S\s]*?"|'[\S\s]*?')>)/,
            midIfUnaryConditionalRegexp  = /(?: if-[\S]*? )/,
            endIfUnaryConditionalRegexp  = /(?: if-[\S]*?>)/;

        for (i = 1; i < l; i++) {
          part = parts[i];
          if (flip) {
            extraString += ' if-' + part;
          }
          else {
            el += ' if-' + part;
            flip = true;
          }
        }

        if (evalCondition(el, model)) {
          conditionContent = getAttribute(el, 'true');
        }
        else {
          conditionContent = getAttribute(el, 'false');
        }

        // remove conditionals from element
        el = removeAttribute(el, 'true');
        el = removeAttribute(el, 'false');

        // Remove all if-conditionals and append condition eval value
        el = el.replace(midIfBinaryConditionalRegexp, conditionContent ? ' ' + conditionContent + ' ' : ' ');
        el = el.replace(endIfBinaryConditionalRegexp, conditionContent ? ' ' + conditionContent + ' ' : ' ');
        el = el.replace(midIfUnaryConditionalRegexp, conditionContent ? ' ' + conditionContent + ' ' : ' ');
        el = el.replace(endIfUnaryConditionalRegexp, conditionContent ? ' ' + conditionContent + ' ' : ' ');

        // append additional one line content if any
        el += extraString;

        if (el.charAt(el.length - 1) !== '>') {
          el += '>';
        }

        return el;
      }

      // determines if a condition is true for <if>, <unless>, <elseif>, and <elseunless>, and one-liners
      function evalCondition(el, model) {
        el = el.trim();

        var conditionType,
            attrCount = 0,
            conditionAttr,
            attributes,
            length,
            i,
            condition,
            conditionVal,
            modelVal,
            curVar,
            dots,
            numDots,
            d,
            notDone = true,
            condResult,
            truthStack = [];

        conditionType = getNodeName(el);
        attributes = getAttributes(el);
        length = attributes.length;

        if (conditionType === 'else') {
          return true;
        }
        else if (conditionType !== 'if' && conditionType !== 'unless' && conditionType !== 'elseif' && conditionType !== 'elseunless') {

          // it's a one-liner
          conditionType = 'onelineif';
          for (i = 0; i < length; i++) {
            conditionAttr = attributes[i].split('=');
            if (conditionAttr[0].substr(0, 3) === 'if-') {
              conditionVal = conditionAttr[1];
              if (conditionVal) {
                conditionVal = conditionVal.substring(1, conditionVal.length - 1);
                conditionVal = parseVars(conditionVal, model);
              }
              conditionAttr = replaceNonRegex(attributes[i], 'if-', '');
              break;
            }
          }
          return evalStatement();
        }

        // regular conditional, could be multipart
        do {

          // examine each of the condition attributes
          conditionAttr = attributes[attrCount];
          if (conditionAttr) {
            condition = undefined;
            conditionVal = undefined;
            truthStack.push(evalStatement());
            attrCount++;
          }
          else {
            notDone = false;
            length = truthStack.length;
          }
        }
        while (notDone);

        function evalStatement() {
          conditionAttr = conditionAttr.split('=');
          condition = conditionAttr[0];

          var hasNotOperator;
          if (condition.substr(0, 4) === 'not:') {
            hasNotOperator = true;
            condition = condition.substring(4);
          }
          else {
            hasNotOperator = false;
          }

          if (condition === 'or' || condition === 'and' || condition === 'xor') {
            return condition; // this is a logical operator, not a condition to evaluate
          }

          if (conditionVal === undefined) {
            conditionVal = conditionAttr[1];
            if (conditionVal) {
              conditionVal = conditionVal.substring(1, conditionVal.length - 1);
              conditionVal = parseVars(conditionVal, model);
            }
            else {
              conditionVal = condition;
            }
          }

          dots = condition.split('.');
          numDots = dots.length;
          curVar = model;

          for (d = 0; d < numDots; d++) {
            if (typeof curVar !== 'undefined') {
              curVar = curVar[dots[d]];
            }
          }

          modelVal = curVar;

          // force empty arrays and empty objects to be falsey (#44)
          if (modelVal && ((Array.isArray(modelVal) && modelVal.length === 0) || (typeof modelVal === 'object' && Object.keys(modelVal).length === 0 && modelVal.constructor === Object))) {
            modelVal = false;
          }

          if (conditionType === 'if' || conditionType === 'onelineif' || conditionType === 'elseif') {
            if (condition === conditionVal || (conditionType === 'onelineif' && 'if-' + condition === conditionVal)) {
              if (modelVal) {
                return hasNotOperator ? false : true;
              }
              else {
                return hasNotOperator ? true : false;
              }
            }
            else if (modelVal == conditionVal) {
              return hasNotOperator ? false : true;
            }
            else {
              return hasNotOperator ? true : false;
            }
          }
          else {
            if (condition === conditionVal) {
              if (modelVal) {
                return hasNotOperator ? true : false;
              }
              else {
                return hasNotOperator ? false : true;
              }
            }
            else if (modelVal != conditionVal) {
              return hasNotOperator ? false : true;
            }
            else {
              return hasNotOperator ? true : false;
            }
          }
        }

        // loop through the results
        for (i = 0; i < length; i++) {
          condition = truthStack[i];
          condResult = condResult !== undefined ? condResult : truthStack[i - 1];
          if (condition === 'and') {
            condResult = Boolean(condResult && truthStack[i + 1]);
          }
          else if (condition === 'or') {
            condResult = Boolean(condResult || truthStack[i + 1]);
          }
          else if (condition === 'xor') {
            condResult = Boolean((condResult && !truthStack[i + 1]) || (!condResult && truthStack[i + 1]));
          }
        }

        return condResult !== undefined ? condResult : condition;
      }

      // replaces a single {var} with its value from a given model
      function renderVar(str, varname, varval, escapeOverride) {
        if (!isNaN(parseInt(varname))) {
          varname = '[' + varname + ']';
        }

        // escape html entities
        if (varname.slice(-2) !== '|s' && varname.slice(-3) !== '|s`') {
          if (!escapeOverride) {
            varval = escapeHtmlEntities(varval);
          }
        }

        return replaceNonRegex(str, new RegExp('{' + varname.replace(/\|/g, '\\|') + '}', 'g'), varval);
      }
    }
  };

  /**
   * private utility methods
   */

  // gets nested object by string
  function getNestedObjectByString(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1');  // convert indexes to properties
    s = s.replace(/^\./, ''); // strip leading dot
    var a = s.split('.'), n;
    while (a.length) {
      n = a.shift();
      if (n in o) {
        o = o[n];
      }
      else {
        return;
      }
    }
    return o;
  }

  // get all attributes of an element
  function getAttributes(el) {
    var attributes = el.split('>');
    attributes = attributes[0];
    attributes = attributes.substring(attributes.indexOf(' '));
    attributes = attributes.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g);
    return attributes;
  }

  // get a specific attribute from a given element
  function getAttribute(el, attr) {
    var i, l, a, match;
    match = el.match(new RegExp(attr.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&') + '=(\\\'.*?\\\'|\\".*?\\")'));

    if (!match) {
      return false;
    }

    l = match.length;
    for (i = 0; i < l; i++) {
      a = match[i];
      if (a && typeof a === 'string') {
        a = a.trim();
        if (a.substring(0, attr.length) === attr) {
          // got a match
          break;
        }
      }
    }
    a = a.substring(attr.length + 2).slice(0, -1);
    return a;
  }

  // get a specific attribute from a given element
  function removeAttribute(el, attr) {
    attr = attr.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    var newEl = el.replace(new RegExp('(?: (?:' + attr + '(?: |>))| (?:' + attr + '=)(?:\\"([\\S\\s]*?)\\"|\\\'([\\S\\s]*?)\\\')(?: |>))'), ' ');
    if (newEl.charAt(newEl.length - 1) !== '>') {
      newEl = newEl.trim();
      newEl += '>';
    }
    return newEl;
  }

  // gets children of a given element
  function getInnerHTML(el) {
    el = el.trim();

    var nodeName = getNodeName(el);
    el = el.replace(new RegExp('<' + nodeName.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&') + '(?:>| [\\S\\s]*?>)'), '');
    el = el.substring(0, el.lastIndexOf('</' + nodeName + '>'));
    return el.trim();
  }

  // get an element's node name
  function getNodeName(el) {
    var nodeName = el.split(' ');
    nodeName = nodeName[0];
    nodeName = nodeName.split('>');
    nodeName = nodeName[0];
    nodeName = nodeName.substring(1, nodeName.length);
    return nodeName;
  }

  function escapeHtmlEntities(v) {
    if (v && typeof v === 'string') {
      return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&#34;').replace(/'/g, '&#39;');
    }
    else {
      return v;
    }
  }

  function replaceNonRegex(str, find, replace) {
    if (typeof str === 'string') {
      return str.split(find).join(replace);
    }
    else {
      teddy.console.error('teddy: replaceNonRegex passed invalid arguments.');
    }
  }

  function jsonStringifyRemoveCircularReferences(key, value) {
    if (typeof value === 'object' && value !== null) {
      if (jsonStringifyCache.indexOf(value) !== -1) {
        // circular reference found, discard key
        return;
      }
      jsonStringifyCache.push(value);
    }
    return value;
  }

  // expose as a CommonJS module
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = teddy; // makes teddy requirable in server-side JS
    module.exports.__express = teddy.render; // express.js support

    if (require) {
      // server-side module dependencies
      fs = require('fs');
      path = require('path');
    }
  }

  // set env specific vars for client-side
  if (typeof document !== 'undefined' && typeof window !== 'undefined') {
    global.teddy = teddy;

    // IE does not populate console unless the developer tools are opened
    if (typeof console === 'undefined') {
      window.console = {};
      console.log = console.warn = console.error = function() {};
    }

    // Object.assign polyfill
    if (typeof Object.assign !== 'function') {
      Object.assign = function(target, varArgs) { // .length of function is 2
        var i,
            l,
            to,
            nextSource,
            nextKey;

        if (target === null) { // TypeError if undefined or null
          throw new TypeError('Cannot convert undefined or null to object');
        }

        to = Object(target);

        l = arguments.length;
        for (i = 1; i < l; i++) {
          nextSource = arguments[i];

          if (nextSource !== null) { // skip over if undefined or null
            for (nextKey in nextSource) {
              // avoid bugs when hasOwnProperty is shadowed
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }
        return to;
      };
    }
  }
})(this);
