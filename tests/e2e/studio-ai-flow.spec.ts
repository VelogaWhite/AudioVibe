import { test, expect } from '@playwright/test';
import { setupStudioApiMocks, DEMO_USER } from './helpers/mock-api';

test.describe('Journey 1: AI-First Flow (Mood Presets, 7-Axis Radar Chart & Spotify Export)', () => {
  test.beforeEach(async ({ page }) => {
    await setupStudioApiMocks(page);
  });

  test('generates 15 AI tracks via Mood Preset, switches dynamic theme, displays 7-Axis Radar Chart, and exports to Spotify', async ({ page }) => {
    await page.goto(`/studio?userId=${DEMO_USER.id}`);

    // 1. Verify User Profile in Sidebar
    await expect(page.getByText(DEMO_USER.displayName)).toBeVisible();
    await expect(page.getByText(`Spotify: ${DEMO_USER.spotifyId}`)).toBeVisible();

    // 2. Click Mood Preset "💖 คลั่งรัก" and verify Dynamic Theme switches to LOVE (#0d0208 -> rgb(13, 2, 8))
    const lovePresetBtn = page.getByRole('button', { name: '💖 คลั่งรัก' });
    await expect(lovePresetBtn).toBeVisible();
    await lovePresetBtn.click();

    // Verify dynamic background color changes to LOVE theme
    const bgElement = page.locator('div[aria-hidden="true"]').first();
    await expect(bgElement).toHaveCSS('background-color', 'rgb(13, 2, 8)');

    // 3. Verify 15 recommended tracks are loaded into the new AI Playlist
    await expect(page.getByText('AI แนะนำสำเร็จ! พบ 15 เพลงที่เข้ากับมิติเสียง')).toBeVisible();
    await expect(page.locator('article')).toHaveCount(15);
    await expect(page.getByText('98% Match')).toBeVisible();

    // 4. Verify Conditional Rendering: AI_ANALYTICS mode displays 7-Axis Radar Chart
    await expect(page.getByText('แสดงกราฟมิติเสียง AI')).toBeVisible();
    await expect(page.getByText('7-Axis Audio Vibe Vector Profile')).toBeVisible();
    await expect(page.getByText('AI Target Vector')).toBeVisible();

    // 5. Click "Export to Spotify" and verify ExportSuccessModal
    const exportBtn = page.getByRole('button', { name: /Export to Spotify/i });
    await expect(exportBtn).toBeEnabled();
    await exportBtn.click();

    await expect(page.getByText('Export สำเร็จแล้ว! 🎉')).toBeVisible();
    const openSpotifyLink = page.getByRole('link', { name: /Open in Spotify/i });
    await expect(openSpotifyLink).toHaveAttribute(
      'href',
      'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
    );

    // Close modal and verify playlist status badge updates to Exported
    await page.getByRole('button', { name: 'ปิดหน้าต่าง' }).click();
    await expect(page.getByText('✓ Exported to Spotify')).toBeVisible();
    await expect(page.getByRole('button', { name: /Sync with Spotify/i })).toBeVisible();
  });

  test('supports custom Natural Language Prompt and switches theme based on keywords', async ({ page }) => {
    await page.goto(`/studio?userId=${DEMO_USER.id}`);
    await expect(page.getByText(DEMO_USER.displayName)).toBeVisible();

    const promptInput = page.getByPlaceholder(/บอกอารมณ์ด้วยภาษาธรรมชาติ/i);
    await promptInput.fill('ขอเพลงมันส์ๆ เบสหนักๆ ปาร์ตี้สุดเหวี่ยง');
    await page.getByRole('button', { name: 'สร้าง' }).click();

    // Verify FIRE theme (#140502 -> rgb(20, 5, 2))
    const bgElement = page.locator('div[aria-hidden="true"]').first();
    await expect(bgElement).toHaveCSS('background-color', 'rgb(20, 5, 2)');

    // Verify 15 tracks and Radar Chart
    await expect(page.locator('article')).toHaveCount(15);
    await expect(page.getByText('7-Axis Audio Vibe Vector Profile')).toBeVisible();
  });
});
