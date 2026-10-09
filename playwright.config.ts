import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e', testMatch: '**/*.spec.ts', fullyParallel: false, workers: 1,
  timeout: 90_000, expect: { timeout: 15_000 }, globalTimeout: 10 * 60_000,
  retries: 0, reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:3020', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'escritorio', use: { browserName: 'chromium', viewport: { width: 1440, height: 900 } } },
    { name: 'movil', use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: { command: 'npx tsx e2e/servidor.ts', url: 'http://127.0.0.1:3020/dashboard/presupuestos',
    timeout: 120_000, reuseExistingServer: false },
})
