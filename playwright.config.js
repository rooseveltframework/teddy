import { devices } from '@playwright/test'

const config = {
  testDir: './test/loaders',
  testMatch: 'playwright.js',
  testIgnore: ['models/*.js', 'tests.js'],
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  // CI related settings
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'line',
  use: {
    actionTimeout: 0,
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome']
      }
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox']
      }
    }
  ]
}

export default config
