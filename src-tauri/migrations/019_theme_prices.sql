-- 019_theme_prices.sql
-- Make app themes harder to unlock (cost more coins + higher levels in the UI).
-- Themes are a long-term reward for learning, so they should feel earned.

UPDATE rewards SET cost = 120 WHERE key = 'theme_matcha';
UPDATE rewards SET cost = 200 WHERE key = 'theme_sunset';
UPDATE rewards SET cost = 320 WHERE key = 'theme_sakura';
UPDATE rewards SET cost = 450 WHERE key = 'theme_koi';
UPDATE rewards SET cost = 600 WHERE key = 'theme_sumi';
