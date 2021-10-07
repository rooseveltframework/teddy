# Teddy Changelog

## Next version

- Put your changes here...

## 0.5.9

- Fixed an issue where model content could get printed without being escaped even when the `|s` flag is not present.
- Various dependencies bumped.

## 0.5.8

- Fixed bug in client-side support where file extensions would be inappropriately appended to template names in some cases.
- Dropped Node 15 support. Added Node 16 support.
- Various dependencies bumped.

## 0.5.7

- Closed:
  - https://github.com/rooseveltframework/teddy/issues/446
  - https://github.com/rooseveltframework/teddy/issues/431
  - https://github.com/rooseveltframework/teddy/issues/449
  - https://github.com/rooseveltframework/teddy/issues/426
- Dropped Node 12 support.
- Various dependencies bumped.

## 0.5.6

- Closed https://github.com/rooseveltframework/teddy/issues/404
- Various dependencies bumped.

## 0.5.5

- Closed https://github.com/rooseveltframework/teddy/issues/421

## 0.5.4

- Closed https://github.com/rooseveltframework/teddy/issues/412
- Closed https://github.com/rooseveltframework/teddy/pull/418
- Closed many unreported bugs.
- Wrote a test for https://github.com/rooseveltframework/teddy/issues/404
- Wrote a test for https://github.com/rooseveltframework/teddy/issues/357 but upon further investigation now consider it a wontfix.
- Various dependencies bumped.

## 0.5.3

- Fixed some Windows-exclusive bugs related to how newlines are parsed in Windows vs. other operating systems.
- Various dependencies bumped.
- CI improvements.

## 0.5.2

- Undo accidental removal of package-lock.json.

## 0.5.1

- Removed postinstall script since it created a problematic prompt to install webpack-cli during npm installs.

## 0.5.0

- Variables with spaces in them will now be parsed.
- Fixed issue where one line if statements couldn't use variables as part of the condition.
- Fixed issue where recursive variable resolution could cause an infinite loop.
- Signifcant performance improvements.
- Total rewrite into a much cleaner codebase:
  - Less reliance on regex and more reliance on character counting in base algorithm.
  - Code now split into separate files for development but bundled into a single JS file with Webpack during deployment.
- Various dependencies bumped.
- CI improvements.

## 0.4.28 and below

[Here be dragons](https://en.wikipedia.org/wiki/Here_be_dragons)...
