# How to contribute

## Setting up your development environment

- Install dependencies: `npm ci`.
- Install the browsers the client-side tests run against: `npx playwright install`.

The client-side test suite runs against Chromium, Firefox, and WebKit.

On Linux, WebKit needs some system libraries that may not be present. If a browser fails to launch, Playwright will name the packages it needs; on Debian and Ubuntu, `sudo npx playwright install-deps` installs them for you.

## Before opening a pull request

- Be sure all tests pass: `npm t`.
- Ensure good test coverage and write new tests if necessary: `npm run coverage`.
  - The server and client halves of the suite cover different parts of Teddy and neither can reach all of it, so `npm run coverage` reports which lines neither half executes. Run `npm run coverage-server` or `npm run coverage-client` on their own if you only need one half, then `npm run coverage-report` to see the combined picture.
- The caching tests measure how long a render takes, which is worth seeing when you are working on caching or performance and is noise the rest of the time. Set `TEDDY_TEST_TIMINGS` to print those measurements: `TEDDY_TEST_TIMINGS=1 npm run test-server`.
- If you changed anything that affects how fast Teddy renders, run the benchmarks: `npm run benchmark`. Make sure to generate a benchmarking baseline against the main branch first. This has to be done on your own hardware so that there is an apples to apples comparison for the benchmarks to benchmark against to see if your changes alter Teddy's performance profile in any significant way.
- Add your changes to `CHANGELOG.md`.

## Release process

If you are a maintainer, please follow the following release procedure:

- Merge all desired pull requests into main.
- Run `npm run build` to generate a new dist bundle.
- Run `npm run benchmark` to refresh `benchmarker/BENCHMARKS.md`.
- Bump `package.json` to a new version and run `npm i` to generate a new `package-lock.json`.
- Add new version to CHANGELOG.
- Paste contents of CHANGELOG into new version commit.
- Open and merge a pull request with those changes.
- Tag the merge commit as the a new release version number.
- Publish commit to npm.
- Submit a pull request to the Roosevelt website [following the instructions here](https://github.com/rooseveltframework/roosevelt-website/blob/main/CONTRIBUTING.md).
