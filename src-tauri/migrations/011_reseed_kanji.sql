-- 011_reseed_kanji.sql
-- The kanji catalog grew from the 30-kanji starter set to the full JLPT N5→N1
-- catalog (~2200 kanji). The seeder only populates when the `kanji` table is
-- empty, so existing installs would keep the old 30. Clear it once here so the
-- seeder repopulates the full catalog on next launch. Safe because all SRS
-- progress referencing kanji was already wiped by 009_beta_reset.
DELETE FROM kanji;
