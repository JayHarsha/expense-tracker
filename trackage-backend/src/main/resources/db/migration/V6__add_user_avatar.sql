-- Small profile picture stored inline as a data URL (client resizes before upload,
-- so this stays a few tens of KB at most).
ALTER TABLE users ADD COLUMN avatar TEXT;
