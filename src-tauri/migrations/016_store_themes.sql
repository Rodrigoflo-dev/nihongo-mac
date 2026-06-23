-- 016_store_themes.sql
-- Tienda: add more unlockable accent themes. The app re-skins via data-accent
-- (matcha/sunset/aether are free in the UI; sakura/sumi/koi are bought here).
-- INSERT OR IGNORE so re-runs and existing installs stay consistent.

INSERT OR IGNORE INTO rewards (id, key, name, description, icon, cost, kind, metadata) VALUES
    (7, 'theme_koi', 'Tema Koi', 'Desbloquea un tema visual rojo-naranja inspirado en las carpas koi.', 'palette', 80, 'theme', '{"theme":"koi"}');
