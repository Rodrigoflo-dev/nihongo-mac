-- 018_cosmetics.sql
-- Buyable profile cosmetics (avatars + profile-card backgrounds), purchased with
-- coins via the existing purchase_reward flow. Ownership = a row in
-- reward_purchases. Two avatars and two backgrounds stay FREE (not listed here).
-- INSERT OR IGNORE so existing installs stay consistent.

INSERT OR IGNORE INTO rewards (id, key, name, description, icon, cost, kind, metadata) VALUES
    -- Avatars (kana/kanji tiles)
    (20, 'av_a-chikara', 'Avatar 力',       'Avatar con el kanji de Fuerza.',          'user', 20,  'avatar', '{"avatar":"a-chikara"}'),
    (21, 'av_a-michi',   'Avatar 道',       'Avatar con el kanji de Camino.',          'user', 30,  'avatar', '{"avatar":"a-michi"}'),
    (22, 'av_a-hana',    'Avatar 花',       'Avatar con el kanji de Flor.',            'user', 40,  'avatar', '{"avatar":"a-hana"}'),
    (23, 'av_a-ryu',     'Avatar 竜',       'Avatar con el kanji de Dragón.',          'user', 120, 'avatar', '{"avatar":"a-ryu"}'),
    -- Avatars (animated 3D orbs)
    (24, 'av_o-aurora',  'Avatar Aurora 3D','Orbe 3D animado en violeta-cian.',        'user', 60,  'avatar', '{"avatar":"o-aurora"}'),
    (25, 'av_o-sakura',  'Avatar Sakura 3D','Orbe 3D animado rosado.',                 'user', 90,  'avatar', '{"avatar":"o-sakura"}'),
    (26, 'av_o-matcha',  'Avatar Matcha 3D','Orbe 3D animado verde.',                  'user', 90,  'avatar', '{"avatar":"o-matcha"}'),
    (27, 'av_o-koi',     'Avatar Koi 3D',   'Orbe 3D animado rojo-naranja.',           'user', 130, 'avatar', '{"avatar":"o-koi"}'),
    (28, 'av_o-void',    'Avatar Vacío 3D', 'Orbe 3D animado oscuro.',                 'user', 200, 'avatar', '{"avatar":"o-void"}'),
    -- Profile-card backgrounds
    (29, 'bg_grid',      'Fondo Rejilla',   'Fondo de rejilla neón para tu perfil.',   'image', 25,  'background', '{"bg":"grid"}'),
    (30, 'bg_sakura',    'Fondo Sakura',    'Fondo rosado para tu perfil.',            'image', 50,  'background', '{"bg":"sakura"}'),
    (31, 'bg_matcha',    'Fondo Matcha',    'Fondo verde para tu perfil.',             'image', 50,  'background', '{"bg":"matcha"}'),
    (32, 'bg_sunset',    'Fondo Atardecer', 'Fondo cálido para tu perfil.',            'image', 60,  'background', '{"bg":"sunset"}');
