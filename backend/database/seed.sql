-- Seed data for NutriTrip

-- Default guest user (for non-authenticated usage)
INSERT OR IGNORE INTO users (id, name, email) VALUES
  ('guest', 'Guest User', 'guest@nutritrip.local');
