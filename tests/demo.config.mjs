import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir: '.', testMatch: 'demo.spec.mjs', timeout: 45000, workers: 1,
  reporter: [['list']], use: {baseURL: 'http://127.0.0.1:4173', headless: true, screenshot: 'only-on-failure'},
  projects: [
    {name: 'desktop', use: {browserName: 'chromium', viewport: {width: 1240, height: 900}, deviceScaleFactor: 1}},
    {name: 'mobile', use: {browserName: 'chromium', viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true}},
  ],
  webServer: {command: 'python -m http.server 4173 --bind 127.0.0.1 --directory docs', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI},
});
