import { PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  reporter: process.env.CI ? 'github' : 'list'
};
export default config
