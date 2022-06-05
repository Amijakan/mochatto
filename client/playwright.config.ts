import { PlaywrightTestConfig } from '@playwright/test'

// Reference: https://playwright.dev/docs/test-advanced#launching-a-development-web-server-during-the-tests
const config: PlaywrightTestConfig = {
  webServer: {
    command: 'yarn dev',
    port: 4500,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
  reporter: process.env.CI ? 'github' : 'list'
};
export default config
