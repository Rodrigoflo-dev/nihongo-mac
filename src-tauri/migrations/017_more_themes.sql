-- 017_more_themes.sql
-- Make Matcha and Atardecer buyable too (every theme except the base Aether is
-- now unlockable by purchase OR by reaching its level). INSERT OR IGNORE keeps
-- existing installs consistent.

INSERT OR IGNORE INTO rewards (id, key, name, description, icon, cost, kind, metadata) VALUES
    (8, 'theme_matcha', 'Tema Matcha', 'Desbloquea un tema verde con hojas de té flotando.', 'palette', 50, 'theme', '{"theme":"matcha"}'),
    (9, 'theme_sunset', 'Tema Atardecer', 'Desbloquea un tema cálido con rayos y motas doradas.', 'palette', 60, 'theme', '{"theme":"sunset"}');
