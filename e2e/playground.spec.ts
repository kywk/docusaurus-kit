import { expect, test } from '@playwright/test';

test('renders every diagram with Pele', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto('/docs');

  const diagrams = page.locator('svg.pele');
  await expect(diagrams).toHaveCount(7);
  await expect(diagrams.first()).toBeVisible();

  // Wide diagrams are scaled down, so Pele should show zoom controls.
  await expect(page.locator('.pele-zoom')).toHaveCount(2);

  // Diagrams must never cover the zoom controls.
  const overlap = await page.evaluate(() => {
    const containers = [...document.querySelectorAll('.docusaurus-mermaid-container')];
    return containers.some((container) => {
      const zoom = container.querySelector('.pele-zoom');
      const svg = container.querySelector('svg');
      if (!zoom || !svg) {
        return false;
      }
      return zoom.getBoundingClientRect().left < svg.getBoundingClientRect().right;
    });
  });
  expect(overlap).toBe(false);

  expect(pageErrors).toEqual([]);
});

test('restyles diagrams when the color mode changes', async ({ page }) => {
  await page.goto('/docs');
  await expect(page.locator('svg.pele').first()).toBeVisible();

  const background = () =>
    page
      .locator('.docusaurus-mermaid-container')
      .first()
      .evaluate((element) => getComputedStyle(element).getPropertyValue('--pele-bg').trim());

  const light = await background();
  await page.getByRole('button', { name: /switch between dark and light mode/i }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  const dark = await background();
  expect(dark).not.toBe(light);
  await expect(page.locator('svg.pele').first()).toBeVisible();
});
