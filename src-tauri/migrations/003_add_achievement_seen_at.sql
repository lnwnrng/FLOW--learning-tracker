-- Add seen_at column for achievement notification state
ALTER TABLE achievements ADD COLUMN seen_at TEXT;
UPDATE achievements SET seen_at = unlocked_at WHERE seen_at IS NULL;
