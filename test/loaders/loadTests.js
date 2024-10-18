// filters which tests to run based on the presence of "only" or "skip"
export function loadTests (testGroups) {
  // handle when "only" has been added to some tests in a test group
  if (testGroups.some(group => group.tests.some(test => test?.only))) {
    testGroups = testGroups.filter(group => group.tests.some(test => test.only))
  }

  // handle when "skip" has been added to a test group itself
  if (testGroups.some(group => group.skip)) {
    testGroups = testGroups.filter(group => !group.skip)
  }

  // handle when "only" has been added to a test group itself
  if (testGroups.some(group => group.only)) {
    testGroups = testGroups.filter(group => group.only)
  }

  // examine the tests themselves for "only" and "skip"
  for (const group of testGroups) {
    // check for test skip
    if (group.tests.some(test => test.skip)) {
      group.tests = group.tests.filter(test => !test.skip)
    }

    // check for test only
    if (group.tests.some(test => test.only)) {
      group.tests = group.tests.filter(test => test.only)
    }
  }

  return testGroups
}
