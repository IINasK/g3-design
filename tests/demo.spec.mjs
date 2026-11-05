import {test, expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
const {version} = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));

async function ready(page, query = '?lang=pt') {
  await page.goto('/' + query);
  await page.evaluate(() => document.fonts.ready);
}

test('installation action shares the button geometry and keeps its arrow inside', async ({page}) => {
  for (const width of [320, 390, 700, 1240]) {
    await page.setViewportSize({width, height: 900});
    for (const lang of ['pt', 'en']) {
      await ready(page, '?lang=' + lang);
      const link = page.locator('.text-link');
      await link.hover();
      await page.waitForTimeout(270);
      const geometry = await link.evaluate(node => {
        const box = node.getBoundingClientRect(), text = node.querySelector('span').getBoundingClientRect(), icon = node.querySelector('svg').getBoundingClientRect();
        const first = document.querySelector('#explore').getBoundingClientRect();
        return {height: box.height, primaryHeight: first.height, left: text.left - box.left, right: box.right - icon.right,
          aligned: Math.abs((text.top + text.bottom) / 2 - (icon.top + icon.bottom) / 2), radius: parseFloat(getComputedStyle(node).borderRadius), overflow: document.documentElement.scrollWidth - innerWidth};
      });
      expect(geometry.height).toBe(geometry.primaryHeight);
      expect(geometry.left).toBeGreaterThanOrEqual(16);
      expect(geometry.right).toBeGreaterThanOrEqual(16);
      expect(geometry.radius).toBeGreaterThanOrEqual(geometry.height / 2);
      expect(geometry.aligned).toBeLessThanOrEqual(1);
      expect(geometry.overflow).toBe(0);
    }
  }
  await page.locator('.text-link').click();
  await expect(page).toHaveURL(/#install$/);
});

test('card and expansion keep separate areas in both languages', async ({page}) => {
  for (const lang of ['pt', 'en']) {
    await ready(page, '?lang=' + lang);
    const geometry = await page.evaluate(() => {
      const card = document.querySelector('.sample-card').getBoundingClientRect();
      const trigger = document.querySelector('.expand-chip').getBoundingClientRect();
      const frame = document.querySelector('.visual').getBoundingClientRect();
      return {gap: trigger.top - card.bottom, inside: trigger.bottom <= frame.bottom - 8};
    });
    expect(geometry.gap, 'The card must not overlap the expansion control').toBeGreaterThanOrEqual(12);
    expect(geometry.inside).toBe(true);
  }
});

test('translated controls, URL and reload preserve language', async ({page}) => {
  await ready(page);
  await page.getByRole('button', {name: 'EN', exact: true}).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByLabel('Project name')).toHaveAttribute('placeholder', 'Aurora Studio');
  await expect(page.getByRole('button', {name: 'Switch theme'})).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', {name: 'Try the experience'})).toBeVisible();
  await page.getByRole('button', {name: 'PT', exact: true}).click();
  await expect(page.getByLabel('Nome do projeto')).toBeVisible();
});

test('text editing stays local and treats markup as text', async ({page}) => {
  const requests = [];
  page.on('request', request => { if (request.method() !== 'GET') requests.push(request.url()); });
  await ready(page);
  await page.getByRole('button', {name: 'Aplicar', exact: true}).click();
  await expect(page.getByLabel('Nome do projeto')).toBeFocused();
  await expect(page.getByLabel('Nome do projeto')).toHaveAttribute('aria-invalid', 'true');
  const literal = '<img src=x onerror="alert(1)">';
  await page.getByLabel('Nome do projeto').fill(literal);
  await page.getByRole('button', {name: 'Aplicar', exact: true}).click();
  await expect(page.locator('#sample-title')).toHaveText(literal);
  await expect(page.locator('#sample-title img')).toHaveCount(0);
  expect(requests).toEqual([]);
});

test('expansion, keyboard, view changes and return focus work', async ({page}) => {
  await ready(page);
  await page.getByRole('button', {name: 'Expandir experiência'}).click();
  await expect(page.locator('dialog')).toBeVisible();
  await expect(page.getByRole('button', {name: 'Fechar experiência'})).toBeFocused();
  await page.getByRole('button', {name: /Os detalhes/}).click();
  await expect(page.getByRole('heading', {name: 'Precisão que se sente.'})).toBeVisible();
  await page.getByRole('button', {name: /O movimento/}).click();
  await expect(page.getByRole('heading', {name: 'Vida, na medida certa.'})).toBeVisible();
  const rect = await page.locator('dialog').boundingBox();
  const size = page.viewportSize();
  expect(rect.x).toBe(0); expect(rect.y).toBe(0);
  expect(rect.width).toBe(size.width); expect(rect.height).toBe(size.height);
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog')).not.toBeVisible();
  await expect(page.getByRole('button', {name: 'Expandir experiência'})).toBeFocused();
});

test('responsive fields and focus stay inside their frame', async ({page}) => {
  for (const width of [320, 390, 700, 701, 950, 1240]) {
    await page.setViewportSize({width, height: 900});
    await ready(page);
    await page.getByLabel('Nome do projeto').focus();
    const geometry = await page.evaluate(() => {
      const input = document.querySelector('#project-name').getBoundingClientRect();
      const card = document.querySelector('.sample-card').getBoundingClientRect();
      const small = [...document.querySelectorAll('button')].filter(node => {
        const rect = node.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
      }).map(node => node.textContent.trim() || node.getAttribute('aria-label'));
      return {overflow: document.documentElement.scrollWidth - innerWidth, left: input.left - card.left, right: card.right - input.right, small};
    });
    expect(geometry.overflow, `Horizontal overflow at ${width}px`).toBeLessThanOrEqual(0);
    expect(geometry.left).toBeGreaterThanOrEqual(5); expect(geometry.right).toBeGreaterThanOrEqual(5);
    expect(geometry.small, `Touch targets at ${width}px`).toEqual([]);
  }
});

test('agent commands and clipboard match the selected target', async ({page, context}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await ready(page);
  await expect(page.locator('[data-version]')).toHaveText(version);
  await expect(page.locator('[data-i18n="status"]')).toContainText(version);
  for (const [label, id] of [['Claude Code', 'claude-code'], ['Codex', 'codex'], ['Cursor', 'cursor'], ['Gemini CLI', 'gemini-cli'], ['GitHub Copilot', 'github-copilot'], ['Antigravity', 'antigravity']]) {
    await page.getByRole('button', {name: label, exact: true}).click();
    await expect(page.locator('#install-command')).toContainText('--agent ' + id);
    await expect(page.locator('#install-command')).toContainText(`https://github.com/IINasK/g3-design/tree/v${version}`);
  }
  await page.getByRole('button', {name: 'Copiar comando'}).click();
  await expect(page.locator('#copy-feedback')).toHaveText('Comando copiado.');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('--agent antigravity');
});

test('reduced motion settles immediately without a continuous frame loop', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.addInitScript(() => {
    const original = window.requestAnimationFrame.bind(window);
    window.__frames = 0;
    window.requestAnimationFrame = callback => original(time => { window.__frames++; callback(time); });
  });
  await ready(page);
  const before = await page.evaluate(() => window.__frames);
  await page.waitForTimeout(180);
  expect(await page.evaluate(() => window.__frames)).toBe(before);
  await page.getByRole('button', {name: 'Experimentar', exact: true}).click();
  await expect(page.getByRole('button', {name: 'Fechar experiência'})).toBeFocused();
  await expect(page.locator('#motion-enabled')).toBeDisabled();
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog')).not.toBeVisible();
});

test('repeated openings release observers and animation resources', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.addInitScript(() => {
    window.__observers = {ResizeObserver: 0, IntersectionObserver: 0};
    for (const key of Object.keys(window.__observers)) {
      const Original = window[key];
      window[key] = class extends Original {
        counted = false;
        observe(...args) { if (!this.counted) { this.counted = true; window.__observers[key]++; } return super.observe(...args); }
        disconnect() { if (this.counted) { this.counted = false; window.__observers[key]--; } return super.disconnect(); }
      };
    }
  });
  await ready(page);
  const before = await page.evaluate(() => ({...window.__observers}));
  for (let i = 0; i < 12; i++) {
    await page.getByRole('button', {name: 'Experimentar', exact: true}).click();
    await page.getByRole('button', {name: 'Fechar experiência'}).click();
    await expect(page.locator('dialog')).not.toBeVisible();
  }
  expect(await page.evaluate(() => window.__observers)).toEqual(before);
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});

test('wave painting pauses while the expanding mask is in motion', async ({page}) => {
  await page.addInitScript(() => {
    const original = window.requestAnimationFrame.bind(window);
    window.__callbacks = 0;
    window.requestAnimationFrame = callback => original(time => { window.__callbacks++; callback(time); });
  });
  await ready(page);
  await page.getByRole('button', {name: 'Experimentar', exact: true}).click();
  const before = await page.evaluate(() => window.__callbacks);
  await page.waitForTimeout(120);
  expect(await page.evaluate(() => window.__callbacks)).toBe(before);
  await expect(page.getByRole('button', {name: 'Fechar experiência'})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog')).not.toBeVisible();
});

test('light and dark previews load without script or CSP errors', async ({page}, info) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await ready(page, '?lang=en');
  await page.getByRole('button', {name: 'Switch theme'}).click();
  await page.getByRole('button', {name: 'Corporate Dark', exact: true}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.screenshot({path: info.outputPath('dark.png'), fullPage: true});
  await page.getByRole('button', {name: 'Switch theme'}).click();
  await page.getByRole('button', {name: 'Corporate', exact: true}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(errors).toEqual([]);
});
