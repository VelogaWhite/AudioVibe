ALTER TABLE "tracks"
  ALTER COLUMN "album_name" DROP NOT NULL,
  ALTER COLUMN "album_cover_url" DROP NOT NULL;

ALTER TABLE "tracks" DROP COLUMN "preview_url";

ALTER TABLE "audio_features"
  DROP COLUMN "tempo",
  DROP COLUMN "loudness";

ALTER TABLE "playlists"
  ADD COLUMN "display_mode" TEXT NOT NULL DEFAULT 'MANUAL_MANAGER';
