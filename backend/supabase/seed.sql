-- =============================================================================
-- FRKWEAR — Supabase Seed Data
-- Run AFTER schema.sql. Safe to re-run: all statements use ON CONFLICT DO NOTHING
-- or ON CONFLICT (...) DO UPDATE.
--
-- Admin password is hashed with pgcrypto bcrypt (cost 12).
-- bcryptjs.compare() in Node.js is fully compatible with $2a$ hashes produced here.
--
-- Run in: Supabase SQL Editor → paste → Run
-- OR:     node seed.js  (does the same via the Supabase JS client)
-- =============================================================================

-- ===========================================================================
-- 1. ADMIN USER
-- ===========================================================================
-- Uses pgcrypto crypt() to produce a bcrypt $2a$12$... hash.
-- bcryptjs on the backend can verify this hash transparently.

insert into admins (username, password_hash)
values (
  'tirth11',
  crypt('Tirth@2005', gen_salt('bf', 12))
)
on conflict (username) do nothing;


-- ===========================================================================
-- 2. SITE CONTENT  (all CMS keys the frontend and admin panel consume)
-- ===========================================================================
-- Values are stored as JSONB. Plain text strings must be quoted inside the JSON:
--   '"some text"'::jsonb   ← correct  (double quotes inside single quotes)
--   'some text'::jsonb     ← ERROR    (not valid JSON)

insert into site_content (key, value) values
  -- Hero section
  ('hero_subtitle',        '"Limited drops. No reruns. Built different."'::jsonb),
  ('hero_cta_primary',     '"SHOP NOW"'::jsonb),
  ('hero_cta_secondary',   '"EXPLORE DROPS"'::jsonb),

  -- Marquee ticker
  ('marquee_text',         '"FREE SHIPPING ON ORDERS ₹2000+ · LIMITED DROPS · NO RERUNS · Y2K ENERGY ·"'::jsonb),

  -- Showcase / brand intro
  ('showcase_heading',     '"CRAFTED FOR THE CULTURE"'::jsonb),
  ('showcase_body',        '"We don''t do mass production. Each piece is designed digitally in our glitch laboratory and print-on-demand crafted only when you claim it."'::jsonb),

  -- Category banner images (Pick Your Fit section)
  ('category_hoodies_image',  '"https://images.unsplash.com/photo-1556821840-3a63f15732ce?auto=format&fit=crop&w=800&q=80"'::jsonb),
  ('category_tshirts_image',  '"https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80"'::jsonb),
  ('category_fullsets_image', '"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80"'::jsonb),

  -- Weekly Demand carousel
  ('weekly_demand_heading',    '"WEEKLY DEMAND"'::jsonb),
  ('weekly_demand_subheading', '"TRENDING NOW"'::jsonb),

  -- Brand statement section
  ('statement_line1', '"WE DON''T MAKE CLOTHES."'::jsonb),
  ('statement_line2', '"WE MAKE STATEMENTS."'::jsonb),

  -- Feature cards (three cards below the statement)
  ('feature_card1_title', '"100% UNISEX FITS"'::jsonb),
  ('feature_card1_body',  '"Boxy silhouettes crafted to break binary sizing limitations."'::jsonb),
  ('feature_card2_title', '"PRINT ON DEMAND"'::jsonb),
  ('feature_card2_body',  '"Zero inventory waste, stitched only when desired."'::jsonb),
  ('feature_card3_title', '"RAW GRAPHICS"'::jsonb),
  ('feature_card3_body',  '"Heavy screen-printed digital textures that last."'::jsonb),

  -- Gender split panels
  ('gender_him_image', '"https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=800&q=80"'::jsonb),
  ('gender_her_image', '"https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80"'::jsonb),

  -- Drop countdown
  ('next_drop_target_date', '"2026-07-01T00:00:00.000Z"'::jsonb),
  ('next_drop_label',       '"NEXT DROP IN:"'::jsonb),

  -- UGC / culture strip
  ('ugc_heading',           '"THE CULTURE IS WEARING US"'::jsonb),
  ('ugc_instagram_handle',  '"@FRKWEAR"'::jsonb),
  ('ugc_01_image', '"https://images.unsplash.com/photo-1556821840-3a63f15732ce?auto=format&fit=crop&w=300&q=80"'::jsonb),
  ('ugc_02_image', '"https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=300&q=80"'::jsonb),
  ('ugc_03_image', '"https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=300&q=80"'::jsonb),
  ('ugc_04_image', '"https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=300&q=80"'::jsonb),
  ('ugc_05_image', '"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=300&q=80"'::jsonb),
  ('ugc_06_image', '"https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=300&q=80"'::jsonb),

  -- Footer
  ('footer_tagline', '"BUILT DIFFERENT. WORN LOUD."'::jsonb)

on conflict (key) do nothing;


-- ===========================================================================
-- 3. PRODUCTS  (matches src/data/products.js exactly, enriched with full schema)
-- ===========================================================================

insert into products (
  id, name, price, compare_price, category, gender, badge,
  rating, reviews, colors, sizes, images,
  description, care_instructions, shipping_note,
  in_stock, featured
) values

-- frk-001 ─────────────────────────────────────────────────────────────────
(
  'frk-001',
  'CYBERPUNK GLITCH HOODIE',
  1899,
  2499,
  'Hoodies',
  array['Unisex', 'Men', 'Women'],
  'LIMITED',
  4.8,
  142,
  '[
    {"name": "Void Black",   "hex": "#0A0A0A"},
    {"name": "Pixel Violet", "hex": "#7B2FFF"},
    {"name": "Neon Pink",    "hex": "#FF2D78"}
  ]'::jsonb,
  array['S', 'M', 'L', 'XL', 'XXL'],
  array['https://images.unsplash.com/photo-1556821840-3a63f15732ce?auto=format&fit=crop&w=500&q=80'],
  'Ultra-heavyweight 100% cotton hoodie. Features double-layered digital screen print with static glitch overlays. Raw hem, drop shoulder silhouette. Built for Y2K chaos energy.',
  'Wash cold inside out. Hang dry to maintain pixel/glitch overlay printing sharpness.',
  'Stitched on demand. Dispatched within 2–3 business days.',
  true,
  true
),

-- frk-002 ─────────────────────────────────────────────────────────────────
(
  'frk-002',
  'STATIC VOID OVERSIZED TEE',
  999,
  1499,
  'T-Shirts',
  array['Unisex', 'Men', 'Women'],
  'NEW',
  4.9,
  87,
  '[
    {"name": "Void Black",   "hex": "#0A0A0A"},
    {"name": "Acid Lime",    "hex": "#C8FF00"},
    {"name": "Glitch White", "hex": "#F0F0F0"}
  ]'::jsonb,
  array['S', 'M', 'L', 'XL'],
  array['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80'],
  'Heavy 240 GSM pre-shrunk cotton tee. Features neon acid lime typography print on chest, offset pink chromatic glitch logo on spine. Generous street fit.',
  'Wash cold inside out. Hang dry.',
  'Stitched on demand. Dispatched within 2–3 business days.',
  true,
  true
),

-- frk-003 ─────────────────────────────────────────────────────────────────
(
  'frk-003',
  'CHAOS TRACKSET FULL FIT',
  3499,
  4999,
  'Full Sets',
  array['Unisex', 'Men'],
  'LIMITED',
  4.7,
  34,
  '[
    {"name": "Void Black",    "hex": "#0A0A0A"},
    {"name": "Dark Charcoal", "hex": "#141414"}
  ]'::jsonb,
  array['M', 'L', 'XL'],
  array['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80'],
  'Matching brutalist cargo tracks + glitch overlay jacket. Zero border styling, contrast zipper, pixel pink panels, and neon stitch tags. Engineered for comfort, styled for noise.',
  'Machine wash cold. Gentle cycle.',
  'Stitched on demand. Dispatched within 2–3 business days.',
  true,
  true
),

-- frk-004 ─────────────────────────────────────────────────────────────────
(
  'frk-004',
  'PIXEL ABERRATION SWEATER',
  2199,
  2999,
  'Hoodies',
  array['Unisex', 'Men', 'Women'],
  'NEW',
  4.6,
  51,
  '[
    {"name": "Pixel Violet", "hex": "#7B2FFF"},
    {"name": "Neon Pink",    "hex": "#FF2D78"}
  ]'::jsonb,
  array['S', 'M', 'L', 'XL'],
  array['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=500&q=80'],
  'Knit heavy rib sweatshirt with custom RGB color split woven texture. Acid chartreuse cuff accents and Bebas Neue graphic overlays.',
  'Hand wash cold. Dry flat.',
  'Stitched on demand. Dispatched within 2–3 business days.',
  true,
  true
),

-- frk-005 ─────────────────────────────────────────────────────────────────
(
  'frk-005',
  'DECAY GRAPHIC TEE',
  899,
  1299,
  'T-Shirts',
  array['Unisex', 'Men', 'Women'],
  'NEW',
  4.5,
  112,
  '[
    {"name": "Glitch White", "hex": "#F0F0F0"},
    {"name": "Void Black",   "hex": "#0A0A0A"}
  ]'::jsonb,
  array['S', 'M', 'L', 'XL', 'XXL'],
  array['https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=500&q=80'],
  'Washed distress tee showcasing the FRKWEAR static manifesto logo. Lightweight but sturdy, perfect fit for layering under tactical jackets.',
  'Machine wash warm inside out.',
  'Stitched on demand. Dispatched within 2–3 business days.',
  true,
  true
),

-- frk-006 ─────────────────────────────────────────────────────────────────
(
  'frk-006',
  'TACTICAL VOID HOODIE',
  2499,
  3299,
  'Hoodies',
  array['Unisex', 'Men'],
  'LIMITED',
  5.0,
  29,
  '[
    {"name": "Void Black", "hex": "#0A0A0A"}
  ]'::jsonb,
  array['M', 'L', 'XL', 'XXL'],
  array['https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=500&q=80'],
  'High-grade technical fleece hoodie. Features modular Velcro utility patches, signature lime glow trim, and high density Y2K screen prints on sleeves.',
  'Wash inside out. Tumble dry low.',
  'Stitched on demand. Dispatched within 2–3 business days.',
  true,
  true
)

on conflict (id) do nothing;


-- ===========================================================================
-- 4. SAMPLE ORDERS  (gives the analytics dashboard real data to display)
-- ===========================================================================

insert into orders (order_id, items, subtotal, shipping, total, customer, status, payment_method, created_at) values

(
  'FRK-20260601-0001',
  '[
    {"productId":"frk-001","name":"CYBERPUNK GLITCH HOODIE","price":1899,"quantity":1,"size":"L","color":"#0A0A0A","imageUrl":"https://images.unsplash.com/photo-1556821840-3a63f15732ce?auto=format&fit=crop&w=500&q=80"}
  ]'::jsonb,
  1899, 0, 1899,
  '{"name":"Arjun Mehta","email":"arjun@example.com","phone":"9823456789","address":"12 Link Road","city":"Mumbai","pincode":"400050"}'::jsonb,
  'Delivered', 'upi',
  '2026-06-01 10:30:00+05:30'
),

(
  'FRK-20260603-0002',
  '[
    {"productId":"frk-002","name":"STATIC VOID OVERSIZED TEE","price":999,"quantity":2,"size":"M","color":"#C8FF00","imageUrl":"https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80"},
    {"productId":"frk-005","name":"DECAY GRAPHIC TEE","price":899,"quantity":1,"size":"L","color":"#0A0A0A","imageUrl":"https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=500&q=80"}
  ]'::jsonb,
  2897, 99, 2996,
  '{"name":"Priya Sharma","email":"priya@example.com","phone":"9811223344","address":"45 Koramangala 5th Block","city":"Bangalore","pincode":"560095"}'::jsonb,
  'Delivered', 'card',
  '2026-06-03 14:15:00+05:30'
),

(
  'FRK-20260605-0003',
  '[
    {"productId":"frk-003","name":"CHAOS TRACKSET FULL FIT","price":3499,"quantity":1,"size":"XL","color":"#0A0A0A","imageUrl":"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80"}
  ]'::jsonb,
  3499, 0, 3499,
  '{"name":"Rohan Das","email":"rohan@example.com","phone":"9900112233","address":"7 Salt Lake Sector V","city":"Kolkata","pincode":"700091"}'::jsonb,
  'Shipped', 'upi',
  '2026-06-05 09:00:00+05:30'
),

(
  'FRK-20260607-0004',
  '[
    {"productId":"frk-006","name":"TACTICAL VOID HOODIE","price":2499,"quantity":1,"size":"M","color":"#0A0A0A","imageUrl":"https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=500&q=80"},
    {"productId":"frk-004","name":"PIXEL ABERRATION SWEATER","price":2199,"quantity":1,"size":"S","color":"#7B2FFF","imageUrl":"https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=500&q=80"}
  ]'::jsonb,
  4698, 0, 4698,
  '{"name":"Sneha Kulkarni","email":"sneha@example.com","phone":"9988776655","address":"22 Baner Road","city":"Pune","pincode":"411045"}'::jsonb,
  'Delivered', 'card',
  '2026-06-07 17:45:00+05:30'
),

(
  'FRK-20260609-0005',
  '[
    {"productId":"frk-002","name":"STATIC VOID OVERSIZED TEE","price":999,"quantity":3,"size":"L","color":"#F0F0F0","imageUrl":"https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80"}
  ]'::jsonb,
  2997, 0, 2997,
  '{"name":"Karan Nair","email":"karan@example.com","phone":"9876001122","address":"55 Anna Nagar","city":"Chennai","pincode":"600040"}'::jsonb,
  'Processing', 'cod',
  '2026-06-09 11:20:00+05:30'
),

(
  'FRK-20260611-0006',
  '[
    {"productId":"frk-001","name":"CYBERPUNK GLITCH HOODIE","price":1899,"quantity":1,"size":"XL","color":"#7B2FFF","imageUrl":"https://images.unsplash.com/photo-1556821840-3a63f15732ce?auto=format&fit=crop&w=500&q=80"},
    {"productId":"frk-005","name":"DECAY GRAPHIC TEE","price":899,"quantity":2,"size":"M","color":"#F0F0F0","imageUrl":"https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=500&q=80"}
  ]'::jsonb,
  3697, 0, 3697,
  '{"name":"Isha Verma","email":"isha@example.com","phone":"9700334455","address":"8 Hauz Khas Village","city":"Delhi","pincode":"110016"}'::jsonb,
  'Delivered', 'upi',
  '2026-06-11 08:10:00+05:30'
)

on conflict (order_id) do nothing;


-- ===========================================================================
-- 5. SAMPLE ANALYTICS  (one row per day, last 14 days)
-- ===========================================================================

insert into analytics (date, page_views, add_to_cart_events, purchases, revenue) values
  ('2026-05-30', 210, 38, 4,  7496),
  ('2026-05-31', 185, 27, 2,  3798),
  ('2026-06-01', 310, 55, 6, 11394),
  ('2026-06-02', 275, 41, 3,  5697),
  ('2026-06-03', 422, 78, 9, 17082),
  ('2026-06-04', 190, 30, 2,  3798),
  ('2026-06-05', 360, 62, 7, 13293),
  ('2026-06-06', 290, 48, 5,  9495),
  ('2026-06-07', 511, 91, 12, 22776),
  ('2026-06-08', 340, 57, 6, 11394),
  ('2026-06-09', 280, 44, 4,  7592),
  ('2026-06-10', 195, 29, 2,  3798),
  ('2026-06-11', 465, 83, 10, 18970),
  ('2026-06-12', 130, 20, 1,  1899)
on conflict (date) do nothing;
