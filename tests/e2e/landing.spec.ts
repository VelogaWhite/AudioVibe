import { test, expect } from '@playwright/test';

test.describe('Page 1: Landing Page & Navigation Flow', () => {
  test('renders branding, slogan, Spotify OAuth link, and feature badges', async ({ page }) => {
    await page.goto('/');

    // 1. Brand Badge & Title
    await expect(page.getByText('Intelligent Music Generator V2')).toBeVisible();
    await expect(page.locator('h1')).toContainText('AudioVibe');

    // 2. Slogan
    await expect(page.getByText('“Play music... With your style”')).toBeVisible();

    // 3. Primary Call-To-Action: Spotify OAuth Login
    const connectLink = page.getByRole('link', { name: /Connect to your Spotify account/i });
    await expect(connectLink).toBeVisible();
    await expect(connectLink).toHaveAttribute('href', /\/auth\/spotify\/login$/);

    // 4. 3 Feature Badges
    await expect(page.getByText('7-Axis Radar')).toBeVisible();
    await expect(page.getByText('AI Recommend')).toBeVisible();
    await expect(page.getByText('Spotify Sync')).toBeVisible();
  });

  test('navigates directly to Unified Playlist Studio via quick demo button', async ({ page }) => {
    await page.goto('/');

    const studioLink = page.getByRole('link', { name: /เข้าสู่ Studio ตรง/i });
    await expect(studioLink).toBeVisible();
    await studioLink.click();

    await expect(page).toHaveURL(/\/studio$/);
    await expect(page.getByRole('heading', { name: 'AudioVibe Studio' })).toBeVisible();
    await expect(page.getByText('กรุณาเข้าสู่ระบบ Spotify ก่อนใช้งาน Studio')).toBeVisible();
  });
});
