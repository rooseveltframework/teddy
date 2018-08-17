// Definitions for Teddy API
declare namespace teddy {
  export function compile (template: string): string;
  export function render (template: string, model: object): string;
  export function setTemplateRoot (path: string): void;
  export function setVerbosity (n: number): void;
  export function cacheRenders (b: boolean): void;
  export function setDefaultCaches (n: number): void;
  export function setMaxCaches (template: string, n: number): void;
  export function setCacheWhitelist (o: object): void;
  export function setCacheBlacklist (templateArray: string[]): void;
  export function setDefaultParams (): void;
  export function flushCache (template: string): void;
  export function flushCache (template: string, model: object): void;
  export function setMaxPasses (n: number): void;
  export function compileAtEveryRender (b: boolean): void;
  export function minify (b: boolean): void;

  export var templates: object;
}

export = teddy;