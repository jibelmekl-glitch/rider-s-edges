-- Ensure the full category list exists (safe no-op if already present)
INSERT INTO public.categories (slug, name, sort_order) VALUES
  ('accessoires-de-moto', 'Accessoires de moto', 1),
  ('atelier-produits-chimiques', 'Atelier et produits chimiques', 2),
  ('batteries', 'Batteries', 3),
  ('cadre', 'Cadre', 4),
  ('chassis', 'Chassis', 5),
  ('echappement', 'Échappement', 6),
  ('etanche', 'Étanche', 7),
  ('filtration', 'Filtration', 8),
  ('kits-entretien', 'Kits entretien', 9),
  ('lubrifiants-additifs', 'Lubrifiants et additifs', 10),
  ('moteur', 'Moteur', 11),
  ('pneus', 'Pneus', 12),
  ('roulements', 'Roulements', 13),
  ('suspensions', 'Suspensions', 14),
  ('systeme-alimentation', 'Système d''alimentation', 15),
  ('freinage', 'Système de freinage', 16),
  ('systeme-electrique', 'Système électrique', 17),
  ('transmission-moto', 'Transmission moto', 18),
  ('pieces-trottinette', 'Pièces pour trottinettes', 19),
  ('gadgets-marchandises', 'Gadgets et marchandises', 20)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.brands (slug, name) VALUES
  ('motobike', 'MOTOBIKE'),
  ('motobike-classic', 'MOTOBIKE CLASSIC'),
  ('apex-performance', 'APEX PERFORMANCE'),
  ('voltmax', 'VOLTMAX'),
  ('ioncell', 'IONCELL'),
  ('redline', 'REDLINE')
ON CONFLICT (slug) DO NOTHING;

-- Extra featured products, same shape/columns as existing catalog rows.
INSERT INTO public.products (reference, ean, name, image_url, brand_id, category_id, price_pro, price_old, tag, featured)
SELECT v.reference, v.ean, v.name, v.image_url,
       (SELECT id FROM public.brands WHERE slug = v.brand_slug),
       (SELECT id FROM public.categories WHERE slug = v.category_slug),
       v.price_pro, v.price_old, v.tag, true
FROM (VALUES
  ('300010021', '8057570091023', 'Étrier de frein avant Apex Iron Brake — titane',        '/images/product-caliper.jpg', 'apex-performance',    'freinage',             85.04, 106.37, 'SMART PRICE'),
  ('300010022', '8057570091030', 'Maître-cylindre de frein Apex Iron Brake — aluminium',  '/images/product-caliper.jpg', 'apex-performance',    'freinage',            144.13, 180.29, 'SMART PRICE'),
  ('300010023', '8057570091047', 'Levier de frein de rechange usiné CNC — noir',          '/images/product-lever.jpg',   'apex-performance',    'freinage',             17.30,  21.64, 'SMART PRICE'),
  ('300010024', '8057570091054', 'Bobine de stator interne Classic — Piaggio Ciao',       '/images/product-stator.jpg',  'motobike-classic',    'systeme-electrique',    4.99,   6.31, 'NOUVEAUTÉS'),
  ('300010025', '8057570091061', 'Klaxon Classic — Piaggio Vespa 150 VBA-VBB',            '/images/product-stator.jpg',  'motobike-classic',    'systeme-electrique',   20.53,  25.61, 'SMART PRICE'),
  ('300010026', '8057570091078', 'Filtre à air haute performance Redline',                '/images/product-caliper.jpg', 'redline',             'filtration',           12.90,  16.20, 'NOUVEAUTÉS'),
  ('300010027', '8057570091085', 'Batterie lithium 12V VoltMax longue durée',             '/images/product-stator.jpg',  'voltmax',             'batteries',            59.90,  74.90, 'SMART PRICE'),
  ('300010028', '8057570091092', 'Batterie IonCell haute puissance',                      '/images/product-stator.jpg',  'ioncell',             'batteries',            64.50,  79.00, 'NOUVEAUTÉS'),
  ('300010029', '8057570091108', 'Kit chaîne de transmission renforcé',                   '/images/product-lever.jpg',   'motobike',            'transmission-moto',    45.00,  56.00, 'OFFRE'),
  ('300010030', '8057570091115', 'Amortisseur arrière réglable',                          '/images/product-lever.jpg',   'motobike',            'suspensions',          89.00, 112.00, 'OFFRE'),
  ('300010031', '8057570091122', 'Roulement de roue renforcé (jeu de 2)',                 '/images/product-caliper.jpg', 'motobike',            'roulements',           14.20,  18.00, 'SMART PRICE'),
  ('300010032', '8057570091139', 'Kit joints moteur complet Classic',                     '/images/product-lever.jpg',   'motobike-classic',    'kits-entretien',        9.90,  12.40, 'NOUVEAUTÉS')
) AS v(reference, ean, name, image_url, brand_slug, category_slug, price_pro, price_old, tag)
ON CONFLICT (reference) DO NOTHING;
