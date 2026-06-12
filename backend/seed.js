import bcrypt from 'bcryptjs';
import { supabase } from './lib/supabase.js';

const DEFAULT_CONTENT = [
  { key: 'hero_subtitle', value: 'Limited drops. No reruns. Built different.' },
  { key: 'hero_cta_primary', value: 'SHOP NOW' },
  { key: 'hero_cta_secondary', value: 'EXPLORE DROPS' },
  { key: 'marquee_text', value: 'FREE SHIPPING ON ORDERS ₹2000+ · LIMITED DROPS · NO RERUNS · Y2K ENERGY ·' },
  { key: 'showcase_heading', value: 'CRAFTED FOR THE CULTURE' },
  { key: 'showcase_body', value: "We don't do mass production. Each piece is designed digitally in our glitch laboratory and print-on-demand crafted only when you claim it." },
  { key: 'category_hoodies_image', value: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?auto=format&fit=crop&w=800&q=80' },
  { key: 'category_tshirts_image', value: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80' },
  { key: 'category_fullsets_image', value: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80' },
  { key: 'weekly_demand_heading', value: 'WEEKLY DEMAND' },
  { key: 'weekly_demand_subheading', value: 'TRENDING NOW' },
  { key: 'statement_line1', value: "WE DON'T MAKE CLOTHES." },
  { key: 'statement_line2', value: 'WE MAKE STATEMENTS.' },
  { key: 'feature_card1_title', value: '100% UNISEX FITS' },
  { key: 'feature_card1_body', value: 'Boxy silhouettes crafted to break binary sizing limitations.' },
  { key: 'feature_card2_title', value: 'PRINT ON DEMAND' },
  { key: 'feature_card2_body', value: 'Zero inventory waste, stitched only when desired.' },
  { key: 'feature_card3_title', value: 'RAW GRAPHICS' },
  { key: 'feature_card3_body', value: 'Heavy screen-printed digital textures that last.' },
  { key: 'gender_him_image', value: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=800&q=80' },
  { key: 'gender_her_image', value: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80' },
  { key: 'next_drop_target_date', value: '2026-07-01T00:00:00.000Z' },
  { key: 'next_drop_label', value: 'NEXT DROP IN:' },
  { key: 'ugc_heading', value: 'THE CULTURE IS WEARING US' },
  { key: 'ugc_instagram_handle', value: '@FRKWEAR' },
  { key: 'ugc_01_image', value: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?auto=format&fit=crop&w=300&q=80' },
  { key: 'ugc_02_image', value: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=300&q=80' },
  { key: 'ugc_03_image', value: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=300&q=80' },
  { key: 'ugc_04_image', value: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=300&q=80' },
  { key: 'ugc_05_image', value: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=300&q=80' },
  { key: 'ugc_06_image', value: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=300&q=80' },
  { key: 'footer_tagline', value: 'BUILT DIFFERENT. WORN LOUD.' }
];

async function seed() {
  try {
    console.log('Seeding Supabase Database...');

    // 1. Seed Admin User
    const adminUsername = 'tirtht11';
    const adminPassword = 'tirth@2005';
    
    // Check if admin already exists
    const { data: adminCheck, error: adminErr } = await supabase
      .from('admins')
      .select('*')
      .eq('username', adminUsername);

    if (adminErr) {
      console.warn('Could not read admins table. Check if schema was initialized:', adminErr);
      throw adminErr;
    }

    if (!adminCheck || adminCheck.length === 0) {
      console.log(`Creating default admin user: ${adminUsername}...`);
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(adminPassword, salt);
      
      const { error: insertErr } = await supabase
        .from('admins')
        .insert([{ username: adminUsername, password_hash: passwordHash }]);
        
      if (insertErr) throw insertErr;
      console.log('Admin user successfully created.');
    } else {
      console.log('Admin user already exists. Skipping...');
    }

    // 2. Seed Site Content
    console.log('Seeding site content keys...');
    const contentPayload = DEFAULT_CONTENT.map(item => ({
      key: item.key,
      value: item.value,
      updated_at: new Date().toISOString()
    }));

    const { error: contentErr } = await supabase
      .from('site_content')
      .upsert(contentPayload, { onConflict: 'key' });

    if (contentErr) throw contentErr;
    console.log('Site content keys seeding completed.');

    // 3. Seed Mock Products if empty
    const { count, error: countErr } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (countErr) throw countErr;

    if (count === 0) {
      console.log('No products found in DB. Seeding initial mock products...');
      const mockProducts = [
        {
          id: "frk-001",
          name: "CYBERPUNK GLITCH HOODIE",
          price: 1899,
          compare_price: 2499,
          category: "Hoodies",
          gender: ["Unisex", "Men", "Women"],
          badge: "LIMITED",
          rating: 4.8,
          reviews: 142,
          colors: [{ name: "Void Black", hex: "#0A0A0A" }, { name: "Pixel Violet", hex: "#7B2FFF" }, { name: "Neon Pink", hex: "#FF2D78" }],
          sizes: ["S", "M", "L", "XL", "XXL"],
          images: ["https://images.unsplash.com/photo-1556821840-3a63f15732ce?auto=format&fit=crop&w=500&q=80"],
          description: "Ultra-heavyweight 100% cotton hoodie. Features double-layered digital screen print with static glitch overlays. Raw hem, drop shoulder silhouette. Built for Y2K chaos energy.",
          care_instructions: "Wash cold inside out. Hang dry to maintain pixel/glitch overlay printing sharpness.",
          shipping_note: "Stitched on demand. Dispatched within 2-3 business days.",
          in_stock: true,
          featured: true
        },
        {
          id: "frk-002",
          name: "STATIC VOID OVERSIZED TEE",
          price: 999,
          compare_price: 1499,
          category: "T-Shirts",
          gender: ["Unisex", "Men", "Women"],
          badge: "NEW",
          rating: 4.9,
          reviews: 87,
          colors: [{ name: "Void Black", hex: "#0A0A0A" }, { name: "Acid Lime", hex: "#C8FF00" }, { name: "Glitch White", hex: "#F0F0F0" }],
          sizes: ["S", "M", "L", "XL"],
          images: ["https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80"],
          description: "Heavy 240 GSM pre-shrunk cotton tee. Features neon acid lime typography print on chest, offset pink chromatic glitch logo on spine. Generous street fit.",
          care_instructions: "Wash cold inside out. Hang dry.",
          shipping_note: "Stitched on demand. Dispatched within 2-3 business days.",
          in_stock: true,
          featured: true
        },
        {
          id: "frk-003",
          name: "CHAOS TRACKSET FULL FIT",
          price: 3499,
          compare_price: 4999,
          category: "Full Sets",
          gender: ["Unisex", "Men"],
          badge: "LIMITED",
          rating: 4.7,
          reviews: 34,
          colors: [{ name: "Void Black", hex: "#0A0A0A" }, { name: "Dark Charcoal", hex: "#141414" }],
          sizes: ["M", "L", "XL"],
          images: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80"],
          description: "Matching brutalist cargo tracks + glitch overlay jacket. Zero border styling, contrast zipper, pixel pink panels, and neon stitch tags. Engineered for comfort, styled for noise.",
          care_instructions: "Machine wash cold. Gentle cycle.",
          shipping_note: "Stitched on demand. Dispatched within 2-3 business days.",
          in_stock: true,
          featured: true
        },
        {
          id: "frk-004",
          name: "PIXEL ABERRATION SWEATER",
          price: 2199,
          compare_price: 2999,
          category: "Hoodies",
          gender: ["Unisex", "Men", "Women"],
          badge: "NEW",
          rating: 4.6,
          reviews: 51,
          colors: [{ name: "Pixel Violet", hex: "#7B2FFF" }, { name: "Neon Pink", hex: "#FF2D78" }],
          sizes: ["S", "M", "L", "XL"],
          images: ["https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=500&q=80"],
          description: "Knit heavy rib sweatshirt with custom RGB color split woven texture. Acid chartreuse cuff accents and Bebas Neue graphic overlays.",
          care_instructions: "Hand wash cold. Dry flat.",
          shipping_note: "Stitched on demand. Dispatched within 2-3 business days.",
          in_stock: true,
          featured: true
        },
        {
          id: "frk-005",
          name: "DECAY GRAPHIC TEE",
          price: 899,
          compare_price: 1299,
          category: "T-Shirts",
          gender: ["Unisex", "Men", "Women"],
          badge: "NEW",
          rating: 4.5,
          reviews: 112,
          colors: [{ name: "Glitch White", hex: "#F0F0F0" }, { name: "Void Black", hex: "#0A0A0A" }],
          sizes: ["S", "M", "L", "XL", "XXL"],
          images: ["https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=500&q=80"],
          description: "Washed distress tee showcasing the FRKWEAR static manifesto logo. Lightweight but sturdy, perfect fit for layering under tactical jackets.",
          care_instructions: "Machine wash warm inside out.",
          shipping_note: "Stitched on demand. Dispatched within 2-3 business days.",
          in_stock: true,
          featured: true
        },
        {
          id: "frk-006",
          name: "TACTICAL VOID HOODIE",
          price: 2499,
          compare_price: 3299,
          category: "Hoodies",
          gender: ["Unisex", "Men"],
          badge: "LIMITED",
          rating: 5.0,
          reviews: 29,
          colors: [{ name: "Void Black", hex: "#0A0A0A" }],
          sizes: ["M", "L", "XL", "XXL"],
          images: ["https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=500&q=80"],
          description: "High-grade technical fleece hoodie. Features modular Velcro utility patches, signature lime glow trim, and high density Y2K screen prints on sleeves.",
          care_instructions: "Wash inside out. Tumble dry low.",
          shipping_note: "Stitched on demand. Dispatched within 2-3 business days.",
          in_stock: true,
          featured: true
        }
      ];

      const { error: prodErr } = await supabase
        .from('products')
        .insert(mockProducts);

      if (prodErr) throw prodErr;
      console.log('Seeded 6 mock products.');
    } else {
      console.log('Products already exist in DB. Skipping products seed...');
    }

    console.log('Database seeding successfully finished.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
