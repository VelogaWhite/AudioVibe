import { test, expect } from '@playwright/test';
import { setupStudioApiMocks, DEMO_USER } from './helpers/mock-api';

test.describe('Journey 2: Manual-First Flow & Radar Chart Conditional Hiding', () => {
  test.beforeEach(async ({ page }) => {
    await setupStudioApiMocks(page);
  });

  test('creates a new playlist, searches Spotify tracks, adds track, and keeps 7-Axis Radar Chart hidden', async ({ page }) => {
    await page.goto(`/studio?userId=${DEMO_USER.id}`);
    await expect(page.getByText(DEMO_USER.displayName)).toBeVisible();

    // 1. Create a new playlist via prompt dialog
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('prompt');
      await dialog.accept('Night Drive Manual Mix');
    });
    await page.getByRole('button', { name: /New Playlist/i }).click();

    await expect(page.getByText('สร้างเพลย์ลิสต์ "Night Drive Manual Mix" สำเร็จแล้ว')).toBeVisible();
    await expect(page.getByText('ยังไม่มีเพลงในเพลย์ลิสต์นี้')).toBeVisible();

    // 2. Verify Universal Invariant 3: Radar Chart MUST be hidden in MANUAL_MANAGER mode
    await expect(page.getByText('(ซ่อนกราฟเมื่อจัดการแบบ Manual)')).toBeVisible();
    await expect(page.getByText('7-Axis Audio Vibe Vector Profile')).toHaveCount(0);

    // 3. Search Spotify for "Blinding Lights"
    const searchInput = page.getByPlaceholder('ค้นหาชื่อเพลง ศิลปิน หรืออัลบั้ม...');
    await searchInput.fill('Blinding Lights');
    await page.getByRole('button', { name: 'ค้นหา' }).click();

    await expect(page.getByText('Blinding Lights')).toBeVisible();
    await expect(page.getByText(/The Weeknd/)).toBeVisible();

    // 4. Add track from search results
    const addButtons = page.getByRole('button', { name: 'Add' });
    await addButtons.first().click();

    // Verify feedback badge "Added!" and track added to playlist
    await expect(page.getByRole('button', { name: 'Added!' })).toBeVisible();
    await expect(page.getByText('เพิ่ม "Blinding Lights" เข้าเพลย์ลิสต์แล้ว')).toBeVisible();
    await expect(page.locator('article')).toHaveCount(1);

    // 5. Confirm Radar Chart remains hidden after adding manual Spotify track
    await expect(page.getByText('7-Axis Audio Vibe Vector Profile')).toHaveCount(0);
  });

  test('hides 7-Axis Radar Chart immediately when switching from AI playlist to Manual playlist selector', async ({ page }) => {
    await page.goto(`/studio?userId=${DEMO_USER.id}`);
    await expect(page.getByText(DEMO_USER.displayName)).toBeVisible();

    // 1. Trigger AI Recommendation so Radar Chart appears
    await page.getByRole('button', { name: '🌧️ เหงาๆ' }).click();
    await expect(page.getByText('7-Axis Audio Vibe Vector Profile')).toBeVisible();

    // 2. Select another playlist from Sidebar dropdown (#playlist-select)
    const playlistSelect = page.locator('#playlist-select');
    await playlistSelect.selectOption('pl-starter-01');

    // 3. Verify mode switches to MANUAL_MANAGER and hides Radar Chart immediately
    await expect(page.getByText('(ซ่อนกราฟเมื่อจัดการแบบ Manual)')).toBeVisible();
    await expect(page.getByText('7-Axis Audio Vibe Vector Profile')).toHaveCount(0);
  });
});
