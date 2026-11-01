import { test, expect } from '@playwright/test';
import { setupStudioApiMocks, DEMO_USER } from './helpers/mock-api';

test.describe('Journey 3: Hybrid Flow & Track/Playlist Management Actions', () => {
  test.beforeEach(async ({ page }) => {
    await setupStudioApiMocks(page);
  });

  test('reorders tracks using Move Up / Move Down buttons and removes track with Trash button', async ({ page }) => {
    await page.goto(`/studio?userId=${DEMO_USER.id}`);
    await expect(page.getByText(DEMO_USER.displayName)).toBeVisible();

    // Initial tracks: 1. Die With A Smile, 2. BIRDS OF A FEATHER
    const trackTitles = page.locator('article h4');
    await expect(trackTitles).toHaveCount(2);
    await expect(trackTitles.nth(0)).toHaveText('Die With A Smile');
    await expect(trackTitles.nth(1)).toHaveText('BIRDS OF A FEATHER');

    // 1. Click "เลื่อนลง" on first track
    const moveDownBtn = page.locator('article').first().locator('button[title="เลื่อนลง"]');
    await moveDownBtn.click();

    await expect(page.getByText('จัดลำดับเพลงเรียบร้อยแล้ว')).toBeVisible();
    await expect(trackTitles.nth(0)).toHaveText('BIRDS OF A FEATHER');
    await expect(trackTitles.nth(1)).toHaveText('Die With A Smile');

    // 2. Click "ลบเพลงออกจากเพลย์ลิสต์" (Trash button) on first track
    const removeBtn = page.locator('article').first().locator('button[title="ลบเพลงออกจากเพลย์ลิสต์"]');
    await removeBtn.click();

    await expect(page.getByText('ลบเพลงออกจากเพลย์ลิสต์แล้ว')).toBeVisible();
    await expect(trackTitles).toHaveCount(1);
    await expect(trackTitles.nth(0)).toHaveText('Die With A Smile');
  });

  test('renames and deletes active playlist from Sidebar controls', async ({ page }) => {
    await page.goto(`/studio?userId=${DEMO_USER.id}`);
    await expect(page.getByText(DEMO_USER.displayName)).toBeVisible();

    // 1. Rename Playlist
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('prompt');
      await dialog.accept('Renamed Roadtrip Vibes');
    });
    await page.getByRole('button', { name: 'Rename' }).click();

    await expect(page.getByText('เปลี่ยนชื่อเป็น "Renamed Roadtrip Vibes" สำเร็จ')).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Renamed Roadtrip Vibes' })).toBeVisible();

    // 2. Delete Playlist
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });
    await page.getByRole('button', { name: 'Delete' }).click();

    await expect(page.getByText('ลบเพลย์ลิสต์เรียบร้อยแล้ว')).toBeVisible();
    await expect(page.getByText('ยังไม่ได้เลือกเพลย์ลิสต์')).toBeVisible();
  });
});
