import {test, expect} from '@playwright/test';

async function ready(page) {
  await page.goto('/?lang=pt');
  await page.evaluate(() => document.fonts.ready);
}

test('closing contracts at the actual click with the shared timing', async ({page}) => {
  await ready(page);
  await page.getByRole('button', {name: 'Experimentar', exact: true}).click();
  const close = page.getByRole('button', {name: 'Fechar experiência'});
  await expect(close).toBeFocused();
  const rect = await close.boundingBox();
  await close.click({position: {x: 8, y: 11}});
  const animation = await page.locator('dialog').evaluate(node => {
    const animation = node.getAnimations().find(value => value.effect.getKeyframes().some(frame => frame.clipPath));
    return {duration: animation.effect.getTiming().duration, easing: animation.effect.getTiming().easing,
      last: animation.effect.getKeyframes().at(-1).clipPath};
  });
  expect(animation.duration).toBe(820);
  expect(animation.easing).toBe('cubic-bezier(0.55, 0.055, 0.675, 0.19)');
  const point = /at ([\d.]+)px ([\d.]+)px/.exec(animation.last);
  expect(Math.abs(Number(point[1]) - (rect.x + 8))).toBeLessThanOrEqual(1);
  expect(Math.abs(Number(point[2]) - (rect.y + 11))).toBeLessThanOrEqual(1);
  await expect(page.locator('dialog')).not.toBeVisible();
});

test('Escape contracts at the close control rather than the opening control', async ({page}) => {
  await ready(page);
  await page.getByRole('button', {name: 'Experimentar', exact: true}).click();
  await expect(page.getByRole('button', {name: 'Fechar experiência'})).toBeFocused();
  const rect = await page.locator('#close-experience').boundingBox();
  await page.keyboard.press('Escape');
  const clip = await page.locator('dialog').evaluate(node => node.getAnimations().find(animation => animation.effect.getKeyframes().some(frame => frame.clipPath)).effect.getKeyframes().at(-1).clipPath);
  const point = /at ([\d.]+)px ([\d.]+)px/.exec(clip);
  expect(Math.abs(Number(point[1]) - (rect.x + rect.width / 2))).toBeLessThanOrEqual(1);
  expect(Math.abs(Number(point[2]) - (rect.y + rect.height / 2))).toBeLessThanOrEqual(1);
});

test('all four established palettes are available and survive language changes', async ({page}) => {
  await ready(page);
  await page.getByRole('button', {name: 'Mudar tema'}).click();
  await expect(page.locator('[data-palette-choice]')).toHaveCount(4);
  for (const id of ['lavanda', 'noite', 'escuro', 'claro']) {
    const picker = page.locator('#theme-picker');
    if (await picker.isHidden()) await page.getByRole('button', {name: 'Mudar tema'}).click();
    await page.locator(`[data-palette-choice="${id}"]`).click();
    await expect(page.locator('html')).toHaveAttribute('data-palette', id);
  }
  await page.getByRole('button', {name: 'EN', exact: true}).click();
  await page.getByRole('button', {name: 'Switch theme'}).click();
  await expect(page.getByRole('button', {name: 'Corporate Dark', exact: true})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', {name: 'Switch theme'})).toBeFocused();
});

test('language uses a travelling capsule with the established landing curve', async ({page}) => {
  await ready(page);
  const capsule = page.locator('[data-seletor-capsula]');
  await expect(capsule).toHaveCount(1);
  await page.getByRole('button', {name: 'EN', exact: true}).click();
  const sample = await capsule.evaluate(node => {
    const animation = node.getAnimations()[0];
    return {duration: animation.effect.getTiming().duration, frames: animation.effect.getKeyframes()};
  });
  expect(sample.duration).toBe(360);
  expect(sample.frames[1].offset).toBe(.18);
  expect(sample.frames[2].offset).toBe(.48);
  expect(sample.frames[0].easing).toBe('cubic-bezier(0.65, 0, 0.8, 0.3)');
  await page.waitForTimeout(80);
  const beforeReverse = await capsule.evaluate(node => new DOMMatrixReadOnly(getComputedStyle(node).transform).m41);
  await page.getByRole('button', {name: 'PT', exact: true}).click();
  await expect(page.getByRole('button', {name: 'PT', exact: true})).toHaveAttribute('aria-pressed', 'true');
  const afterReverse = await capsule.evaluate(node => new DOMMatrixReadOnly(getComputedStyle(node).transform).m41);
  expect(Math.abs(beforeReverse - afterReverse)).toBeLessThan(15);
  await expect.poll(() => capsule.evaluate(node => Math.abs(new DOMMatrixReadOnly(getComputedStyle(node).transform).m41))).toBeLessThan(.1);
});

test('hover light grows from the pointer and leaves no painted residue', async ({page}, info) => {
  test.skip(info.project.name !== 'desktop', 'Hover requires a fine pointer.');
  await ready(page);
  const button = page.getByRole('button', {name: 'Aplicar', exact: true});
  await expect(button).toHaveClass(/pinta/);
  const box = await button.boundingBox();
  await page.mouse.move(box.x + 9, box.y + 12);
  await expect(button).toHaveClass(/iluminado/);
  const state = await button.evaluate(node => ({x: parseFloat(node.style.getPropertyValue('--pinta-x')), y: parseFloat(node.style.getPropertyValue('--pinta-y')), target: parseFloat(node.style.getPropertyValue('--pinta-alvo'))}));
  expect(Math.abs(state.x - 9)).toBeLessThanOrEqual(1);
  expect(Math.abs(state.y - 12)).toBeLessThanOrEqual(1);
  expect(state.target).toBeGreaterThan(50);
  await page.mouse.move(0, 0);
  await expect(button).not.toHaveClass(/iluminado/);
  await expect(button).not.toHaveClass(/apagando/);
});

test('pointer movement reaches the shared wave physics', async ({page}, info) => {
  test.skip(info.project.name !== 'desktop', 'This case measures mouse parallax.');
  await page.addInitScript(() => {
    window.__waveTranslations = [];
    const original = CanvasRenderingContext2D.prototype.translate;
    CanvasRenderingContext2D.prototype.translate = function(x, y) {
      if (this.canvas.id === 'hero-waves' && Math.abs(x) < 30 && Math.abs(y) < 30 && Math.hypot(x, y) > .05) window.__waveTranslations.push([x, y]);
      return original.call(this, x, y);
    };
  });
  await ready(page);
  const area = await page.locator('.visual').boundingBox();
  await page.mouse.move(area.x + area.width - 30, area.y + area.height - 75);
  await page.waitForTimeout(350);
  expect(await page.evaluate(() => window.__waveTranslations.length)).toBeGreaterThan(0);
});

test('waves respond to touch without cancelling page scroll', async ({page}, info) => {
  test.skip(info.project.name !== 'mobile', 'Touch dispatch requires the mobile context.');
  await page.addInitScript(() => {
    window.__touchTrace = {moves: 0, prevented: false, translations: 0};
    document.addEventListener('pointermove', event => { if (event.pointerType === 'touch') { window.__touchTrace.moves++; window.__touchTrace.prevented ||= event.defaultPrevented; } });
    const translate = CanvasRenderingContext2D.prototype.translate;
    CanvasRenderingContext2D.prototype.translate = function(x, y) {
      if (this.canvas.id === 'hero-waves' && Math.abs(x) < 30 && Math.abs(y) < 30 && Math.hypot(x, y) > .05) window.__touchTrace.translations++;
      return translate.call(this, x, y);
    };
  });
  await ready(page);
  await page.locator('.visual').scrollIntoViewIfNeeded();
  const box = await page.locator('.visual').boundingBox();
  const cdp = await page.context().newCDPSession(page);
  const x = Math.round(box.x + box.width - 15), y = Math.round(box.y + 80);
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y}]});
  await page.waitForTimeout(220);
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: x - 2, y: y - 2}]});
  await page.waitForTimeout(160);
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
  const state = await page.evaluate(() => window.__touchTrace);
  expect(state.moves).toBeGreaterThan(0); expect(state.translations).toBeGreaterThan(0); expect(state.prevented).toBe(false);
  await cdp.detach();
});

test('disabling motion stops pointer physics and finite selectors', async ({page}) => {
  await page.addInitScript(() => {
    const raf = requestAnimationFrame.bind(window); window.__motionFrames = 0;
    window.requestAnimationFrame = callback => raf(time => { window.__motionFrames++; callback(time); });
  });
  await ready(page);
  await page.getByRole('button', {name: 'Experimentar', exact: true}).click();
  await expect(page.locator('#close-experience')).toBeFocused();
  await page.locator('#motion-enabled').uncheck();
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog')).not.toBeVisible();
  const area = await page.locator('.visual').boundingBox();
  await page.mouse.move(area.x + area.width - 15, area.y + 80);
  await page.getByRole('button', {name: 'EN', exact: true}).click();
  const frames = await page.evaluate(() => window.__motionFrames);
  await page.waitForTimeout(180);
  expect(await page.evaluate(() => window.__motionFrames)).toBe(frames);
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});
