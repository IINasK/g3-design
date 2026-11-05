import {defineConfig} from '@playwright/test';
import {fileURLToPath} from 'node:url';

export default defineConfig({
  testDir: '.', testMatch: ['demo.spec.mjs', 'behavior.spec.mjs'], timeout: 45000, workers: 1,
  reporter: [['list']], use: {baseURL: 'http://127.0.0.1:4174', headless: true, screenshot: 'only-on-failure'},
  projects: [
    {name: 'desktop', use: {browserName: 'chromium', viewport: {width: 1240, height: 900}, deviceScaleFactor: 1}},
    {name: 'mobile', use: {browserName: 'chromium', viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true}},
  ],
  webServer: {command: `"${process.execPath}" tests/serve-demo.mjs`, cwd: fileURLToPath(new URL('../', import.meta.url)), url: 'http://127.0.0.1:4174', reuseExistingServer: !process.env.CI},
});
