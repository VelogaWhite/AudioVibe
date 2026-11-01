import { test, expect } from '@playwright/test';
import { setupStudioApiMocks, DEMO_USER } from './helpers/mock-api';

test.describe('Universal System Invariants & Engineering Guardrails (V2)', () => {
  test('Invariant 1 & 2: Never renders HTML5 <audio> player or calls deprecated Spotify /v1/audio-features API', async ({ page }) => {
    const forbiddenAudioFeatureCalls: string[] = [];

    page.on('request', (req) => {
      if (req.url().includes('/v1/audio-features')) {
        forbiddenAudioFeatureCalls.push(req.url());
      }
    });

    await setupStudioApiMocks(page);

    // Check Landing Page
    await page.goto('/');
    await expect(page.locator('audio')).toHaveCount(0);

    // Check Studio Page & AI Generation
    await page.goto(`/studio?userId=${DEMO_USER.id}`);
    await expect(page.getByText(DEMO_USER.displayName)).toBeVisible();
    await page.getByRole('button', { name: '🍃 ผ่อนคลาย' }).click();

    await expect(page.locator('article')).toHaveCount(15);
    await expect(page.locator('audio')).toHaveCount(0);
    expect(forbiddenAudioFeatureCalls).toHaveLength(0);
  });

  test('Invariant 6: Exports only valid 22-character Spotify Track IDs to Spotify Export endpoint', async ({ page }) => {
    let exportedTrackIds: string[] = [];

    await setupStudioApiMocks(page);

    await page.route('**/playlists/export', async (route) => {
      const payload = route.request().postDataJSON() as { trackIds: string[]; playlistId: string };
      exportedTrackIds = payload.trackIds || [];
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          playlistId: payload.playlistId,
          spotifyPlaylistId: '37i9dQZF1DXcBWIGoYBM5M',
        }),
      });
    });

    await page.goto(`/studio?userId=${DEMO_USER.id}`);
    await expect(page.getByText(DEMO_USER.displayName)).toBeVisible();
    await page.getByRole('button', { name: '🎯 สมาธิขั้นสุด' }).click();
    await expect(page.locator('article')).toHaveCount(15);

    await page.getByRole('button', { name: /Export to Spotify/i }).click();
    await expect(page.getByText('Export สำเร็จแล้ว! 🎉')).toBeVisible();

    expect(exportedTrackIds).toHaveLength(15);
    for (const id of exportedTrackIds) {
      expect(id).toMatch(/^[0-9A-Za-z]{22}$/);
    }
  });
});
