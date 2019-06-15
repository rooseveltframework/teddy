# How to contribute to Teddy

## Before opening a pull request

- Be sure all tests pass: `npm t`.
- Ensure 100% code coverage and write new tests if necessary: `npm run coverage`.
- Add your changes to `CHANGELOG.md`.

## Release process

If you are a maintainer of Teddy, please follow the following release procedure:

- Merge all desired pull requests into master.
- Bump `package.json` to a new version and run `npm i` to generate a new `package-lock.json`.
- Alter CHANGELOG "Next version" section and stamp it with the new version.
- Paste contents of CHANGELOG into new version commit.
- Open and merge a pull request with those changes.
- Tag the merge commit as the a new release version number.
- Publish commit to npm.
