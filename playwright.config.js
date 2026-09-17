import { devices } from '@playwright/test'

const config = {
  testDir: './test',
  // the loader runs teddy's own suite in a browser; the component specs load what teddy rendered into one and ask the browser what it made of it
  testMatch: ['loaders/playwright.js', 'browser/*.js'],
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
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari']
      }
    }
  ]
}

export default config
