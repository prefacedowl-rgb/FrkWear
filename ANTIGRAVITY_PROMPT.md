# FRKWEAR — Full Backend + Back Office (Admin Panel) Build Prompt

> **Project:** FRKWEAR Streetwear Storefront  
> **Stack:** React 19 + Vite + TailwindCSS v4 + Framer Motion (existing frontend)  
> **Task:** Build a complete backend API + full-featured back office admin panel that controls every piece of content and every product on the FRKWEAR storefront, with a Shopify-style analytics dashboard.

---

## 0. Context: What Already Exists

The frontend is a React 19 / Vite SPA using `react-router-dom` (HashRouter), Zustand for cart state, Framer Motion + GSAP for animations, and TailwindCSS v4. Products currently live in a static file `src/data/products.js`. All section images are hard-coded Unsplash URLs inside `src/pages/Home.jsx` and component files.

The goal is to:
1. Replace all static data with a live API driven by a real database.
2. Build a `/admin` back office where every text label, every image, every product, and every countdown date can be changed without touching code.
3. Add a Shopify-style analytics dashboard inside the back office.

---

## 1. Backend — Node.js + Express + Supabase

### 1.1 Tech Stack
- **Runtime:** Node.js 20+
- **Framework:** Express 5
- **Database:** Supabase (PostgreSQL) — accessed via `@supabase/supabase-js` using the **service role key** on the backend
- **Auth:** JSON Web Tokens (JWT) — HS256, 7-day expiry (admin auth is custom JWT, NOT Supabase Auth)
- **Image Storage:** Supabase Storage bucket `frkwear-images` (public bucket) — OR Cloudinary as a fallback
- **File upload middleware:** `multer` (memory storage) → upload buffer to Supabase Storage
- **CORS:** allow `http://localhost:5173` and the production domain

### 1.2 Project Structure

```
backend/
├── server.js               ← Express entry, initialises Supabase client, mounts routers
├── .env                    ← SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, PORT
├── supabase/
│   └── schema.sql          ← SQL migration: all table definitions + RLS policies + seed data
├── lib/
│   └── supabase.js         ← exports createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
├── routes/
│   ├── auth.js             ← POST /api/auth/login
│   ├── products.js         ← CRUD for products
│   ├── content.js          ← GET/PUT for site content keys
│   ├── orders.js           ← GET orders list, PATCH status
│   ├── upload.js           ← POST /api/upload (returns URL)
│   └── analytics.js        ← GET /api/analytics (summary + chart data)
├── middleware/
│   └── auth.js             ← verifyToken middleware (protects all admin routes)
└── seed.js                 ← Upserts the first admin user + default content rows via Supabase client
```

### 1.3 Supabase Database Schema (`supabase/schema.sql`)

Run this SQL in the Supabase SQL Editor (or via `psql`) once to set up all tables:

```sql
-- Admins
create table if not exists admins (
  id          uuid primary key default gen_random_uuid(),
  username    text unique not null,
  password_hash text not null,
  created_at  timestamptz default now()
);

-- Products
create table if not exists products (
  id              text primary key,          -- "frk-001" slug
  name            text not null,
  price           numeric not null,
  compare_price   numeric,
  category        text not null,             -- 'Hoodies' | 'T-Shirts' | 'Full Sets'
  gender          text[] not null default '{}',
  badge           text not null default '',  -- 'NEW' | 'LIMITED' | 'SOLD OUT' | ''
  rating          numeric default 0,
  reviews         integer default 0,
  colors          jsonb not null default '[]',   -- [{name, hex}]
  sizes           text[] not null default '{}',
  images          text[] not null default '{}',
  description     text,
  care_instructions text,
  shipping_note   text,
  in_stock        boolean not null default true,
  featured        boolean not null default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Site Content (flat key-value CMS)
create table if not exists site_content (
  key         text primary key,
  value       jsonb not null,              -- stored as JSON so it can be string, number, or array
  updated_at  timestamptz default now()
);

-- Orders
create table if not exists orders (
  order_id        text primary key,        -- "FRK-20260612-0001"
  items           jsonb not null,          -- [{productId, name, price, quantity, size, color, imageUrl}]
  subtotal        numeric not null,
  shipping        numeric not null default 0,
  total           numeric not null,
  customer        jsonb not null,          -- {name, email, phone, address, city, pincode}
  status          text not null default 'Processing',
  payment_method  text,
  created_at      timestamptz default now()
);

-- Analytics (one row per calendar day)
create table if not exists analytics (
  date                text primary key,    -- "2026-06-12"
  page_views          integer not null default 0,
  add_to_cart_events  integer not null default 0,
  purchases           integer not null default 0,
  revenue             numeric not null default 0
);

-- Auto-update updated_at for products
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_updated_at
  before update on products
  for each row execute procedure set_updated_at();

create trigger site_content_updated_at
  before update on site_content
  for each row execute procedure set_updated_at();
```

### 1.4 Seed Script (`seed.js`)

Uses the Supabase client (service role) to upsert on first run.

**Admin user:**
```
username: tirth11
password: Tirth@2005   (bcrypt hash, saltRounds 12 — store hash in password_hash column)
```

**Default site_content rows** — upsert `{key, value}` pairs:

| key | value (stored as JSON string in jsonb) |
|---|---|
| `hero_subtitle` | `"Limited drops. No reruns. Built different."` |
| `hero_cta_primary` | `"SHOP NOW"` |
| `hero_cta_secondary` | `"EXPLORE DROPS"` |
| `marquee_text` | `"FREE SHIPPING ON ORDERS ₹2000+ · LIMITED DROPS · NO RERUNS · Y2K ENERGY ·"` |
| `showcase_heading` | `"CRAFTED FOR THE CULTURE"` |
| `showcase_body` | `"We don't do mass production. Each piece is designed digitally in our glitch laboratory and print-on-demand crafted only when you claim it."` |
| `category_hoodies_image` | `"https://images.unsplash.com/photo-1556821840-3a63f15732ce?auto=format&fit=crop&w=800&q=80"` |
| `category_tshirts_image` | `"https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80"` |
| `category_fullsets_image` | `"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80"` |
| `weekly_demand_heading` | `"WEEKLY DEMAND"` |
| `weekly_demand_subheading` | `"TRENDING NOW"` |
| `statement_line1` | `"WE DON'T MAKE CLOTHES."` |
| `statement_line2` | `"WE MAKE STATEMENTS."` |
| `feature_card1_title` | `"100% UNISEX FITS"` |
| `feature_card1_body` | `"Boxy silhouettes crafted to break binary sizing limitations."` |
| `feature_card2_title` | `"PRINT ON DEMAND"` |
| `feature_card2_body` | `"Zero inventory waste, stitched only when desired."` |
| `feature_card3_title` | `"RAW GRAPHICS"` |
| `feature_card3_body` | `"Heavy screen-printed digital textures that last."` |
| `gender_him_image` | `"https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=800&q=80"` |
| `gender_her_image` | `"https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80"` |
| `next_drop_target_date` | `"2026-07-01T00:00:00.000Z"` |
| `next_drop_label` | `"NEXT DROP IN:"` |
| `ugc_heading` | `"THE CULTURE IS WEARING US"` |
| `ugc_instagram_handle` | `"@FRKWEAR"` |
| `ugc_01_image` | `"https://images.unsplash.com/photo-1556821840-3a63f15732ce?auto=format&fit=crop&w=300&q=80"` |
| `ugc_02_image` | `"https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=300&q=80"` |
| `ugc_03_image` | `"https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=300&q=80"` |
| `ugc_04_image` | `"https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=300&q=80"` |
| `ugc_05_image` | `"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=300&q=80"` |
| `ugc_06_image` | `"https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=300&q=80"` |
| `footer_tagline` | `"BUILT DIFFERENT. WORN LOUD."` |

### 1.5 Supabase Client (`lib/supabase.js`)

```javascript
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY   // service role bypasses RLS on the backend
)
```

Import `supabase` in every route file instead of using Mongoose models.

### 1.6 API Endpoints

All database operations use `supabase.from('table_name').select/insert/update/delete(...)`.

#### Auth
```
POST   /api/auth/login          → { username, password } → { token, expiresIn }
GET    /api/auth/verify         → [protected] → { ok: true }
```

Login implementation: `supabase.from('admins').select('*').eq('username', username).single()` → bcrypt compare → sign JWT.

#### Products (all write routes protected)
```
GET    /api/products            → returns all products array
GET    /api/products/:id        → single product
POST   /api/products            → [protected] create product
PUT    /api/products/:id        → [protected] update full product
DELETE /api/products/:id        → [protected] delete product
PATCH  /api/products/:id/badge  → [protected] { badge: "NEW"|"LIMITED"|"SOLD OUT"|"" }
```

#### Site Content (key-value CMS)
```
GET    /api/content             → returns all content keys as { key: value } object
GET    /api/content/:key        → single value
PUT    /api/content/:key        → [protected] { value: ... } update one key
POST   /api/content/bulk        → [protected] { updates: [{key, value}] } batch upsert
```

Bulk upsert: `supabase.from('site_content').upsert(updates, { onConflict: 'key' })`.

#### File Upload
```
POST   /api/upload              → [protected] multipart/form-data field "image"
                                → returns { url: "https://..." }
```

Upload to Supabase Storage:
```javascript
const { data, error } = await supabase.storage
  .from('frkwear-images')
  .upload(`products/${Date.now()}_${file.originalname}`, file.buffer, {
    contentType: file.mimetype,
    upsert: false
  })
const { data: { publicUrl } } = supabase.storage
  .from('frkwear-images')
  .getPublicUrl(data.path)
return res.json({ url: publicUrl })
```

Create the `frkwear-images` bucket in the Supabase dashboard as a **public** bucket before first upload.

#### Orders
```
GET    /api/orders              → [protected] paginated order list, ?page=1&limit=20
GET    /api/orders/:orderId     → [protected] single order
PATCH  /api/orders/:orderId     → [protected] { status: "Processing"|"Shipped"|"Delivered"|"Cancelled" }
POST   /api/orders              → PUBLIC (called by checkout flow) create order
```

Order ID generation: `"FRK-" + new Date().toISOString().slice(0,10).replace(/-/g,'') + "-" + String(count+1).padStart(4,'0')`.

#### Analytics
```
GET    /api/analytics/summary   → [protected] { totalRevenue, totalOrders, totalProducts,
                                   conversionRate, avgOrderValue, topProducts[5] }
GET    /api/analytics/chart     → [protected] ?range=7d|30d|90d
                                   returns [{ date, revenue, orders, pageViews }]
GET    /api/analytics/realtime  → [protected] { activeVisitors, todayRevenue, todayOrders }
POST   /api/analytics/event     → PUBLIC { event: "page_view"|"add_to_cart"|"purchase",
                                   productId?, revenue?, sessionId }
```

Analytics event upsert (increment columns):
```javascript
const today = new Date().toISOString().slice(0, 10)
await supabase.rpc('increment_analytics', { p_date: today, p_field: columnName, p_amount: value })
```

Define a Postgres function `increment_analytics` in `schema.sql`:
```sql
create or replace function increment_analytics(p_date text, p_field text, p_amount numeric)
returns void language plpgsql as $$
begin
  insert into analytics (date, page_views, add_to_cart_events, purchases, revenue)
  values (p_date, 0, 0, 0, 0)
  on conflict (date) do nothing;

  execute format(
    'update analytics set %I = %I + $1 where date = $2',
    p_field, p_field
  ) using p_amount, p_date;
end;
$$;
```

---

## 2. Data Shapes (replacing Mongoose schemas)

All data is stored in PostgreSQL via Supabase. Column names use `snake_case` (Postgres convention). When returning JSON from Express routes, convert to `camelCase` if needed to keep the frontend interface unchanged, **or** update frontend field references to match `snake_case` — be consistent and pick one approach at the start.

### products table columns
```
id, name, price, compare_price, category, gender (text[]), badge, rating, reviews,
colors (jsonb), sizes (text[]), images (text[]), description, care_instructions,
shipping_note, in_stock, featured, created_at, updated_at
```

### site_content table columns
```
key (text PK), value (jsonb), updated_at
```

### orders table columns
```
order_id (text PK), items (jsonb), subtotal, shipping, total,
customer (jsonb), status, payment_method, created_at
```

### analytics table columns
```
date (text PK), page_views, add_to_cart_events, purchases, revenue
```

---

## 3. Frontend Changes — Wire Up to API

### 3.1 Create `src/lib/api.js`

Central API client that reads from `import.meta.env.VITE_API_URL` (default `http://localhost:4000`). Export:
- `getProducts()` → `GET /api/products`
- `getProduct(id)` → `GET /api/products/:id`
- `getContent()` → `GET /api/content` → cached in a React context `ContentContext`
- `trackEvent(event, data)` → `POST /api/analytics/event`

### 3.2 Create `src/context/ContentContext.jsx`

```
ContentProvider fetches GET /api/content once on mount, stores as a flat object.
Export hook: useContent(key, fallback) → returns value or fallback while loading.
```

Wrap `<App>` with `<ContentProvider>`.

### 3.3 Replace all static strings in `Home.jsx`

Every hard-coded string and image URL must become a `useContent(key, defaultValue)` call. Exact mapping:

| Current Hard-coded Value | Content Key |
|---|---|
| `"Limited drops. No reruns. Built different."` | `hero_subtitle` |
| `"SHOP NOW"` (CTA) | `hero_cta_primary` |
| `"EXPLORE DROPS"` (CTA) | `hero_cta_secondary` |
| Hoodie card backgroundImage URL | `category_hoodies_image` |
| T-Shirts card backgroundImage URL | `category_tshirts_image` |
| Full Sets card backgroundImage URL | `category_fullsets_image` |
| `"WEEKLY DEMAND"` | `weekly_demand_heading` |
| `"TRENDING NOW"` | `weekly_demand_subheading` |
| `"WE DON'T MAKE CLOTHES."` | `statement_line1` |
| `"WE MAKE STATEMENTS."` | `statement_line2` |
| Feature card 1 title/body | `feature_card1_title` / `feature_card1_body` |
| Feature card 2 title/body | `feature_card2_title` / `feature_card2_body` |
| Feature card 3 title/body | `feature_card3_title` / `feature_card3_body` |
| Him panel backgroundImage URL | `gender_him_image` |
| Her panel backgroundImage URL | `gender_her_image` |
| UGC tile 1-6 image URLs | `ugc_01_image` … `ugc_06_image` |
| `"THE CULTURE IS WEARING US"` | `ugc_heading` |
| `"TAG US @FRKWEAR FOR A FEATURE"` | `ugc_instagram_handle` |

### 3.4 Drop Countdown — Replace Static Timer

Replace the hard-coded `{ days: 3, hours: 12 … }` initial state with a countdown computed from `useContent('next_drop_target_date')`. Parse it as a Date and compute `days/hours/minutes/seconds` dynamically. If the date is in the past, show "DROP IS LIVE" instead.

### 3.5 Products — Replace Static Import

In `Shop.jsx` and `Product.jsx`, replace `import { products } from '../data/products'` with a `useEffect` call to `getProducts()` with loading + error states. Show a lime skeleton loader while fetching.

### 3.6 Add `/admin` Route to `App.jsx`

```jsx
// NOT wrapped in PageTransition or StickyNav/Footer
<Route path="/admin/*" element={<AdminApp />} />
```

`AdminApp` is a completely separate React sub-tree that handles its own routing, layout, and auth.

---

## 4. Admin Panel (`/admin`) — Full Specification

### 4.1 Tech: Same React + TailwindCSS, separate admin layout

Create `src/admin/` directory with its own router, components, and pages. Uses same Tailwind config but different color palette: dark charcoal `#0F0F0F`, accent lime `#C8FF00`, card background `#1A1A1A`, text white.

### 4.2 Authentication

**Login page at `/admin` (when not authenticated):**
- Full-screen dark page
- FRKWEAR logo in lime at top center
- "BACK OFFICE" subtitle in muted text
- Username input + Password input (styled with lime focus border)
- "LOGIN" button in lime
- On submit: `POST /api/auth/login` → store JWT in `localStorage` as `frkwear_admin_token`
- If token present and valid → redirect to `/admin/dashboard`
- If wrong credentials → red inline error: `"INVALID CREDENTIALS. ACCESS DENIED."`

**Initial credentials:**
```
Username: tirth11
Password: Tirth@2005
```

**All admin routes** check for valid JWT. If expired/missing → redirect to `/admin` login.

### 4.3 Admin Layout

Persistent sidebar (collapsible on mobile) + top bar:

**Sidebar nav items:**
```
⬡  DASHBOARD          /admin/dashboard
📦 PRODUCTS           /admin/products
🎨 SITE CONTENT       /admin/content
🛍️  ORDERS            /admin/orders
📊 ANALYTICS          /admin/analytics
⚙️  SETTINGS           /admin/settings
```

**Top bar:** "FRKWEAR BACK OFFICE" logo left, `"Logged in as tirth11"` + logout button right.

---

### 4.4 Page: Dashboard (`/admin/dashboard`)

Shopify-style summary dashboard. Four stat cards at top:

| Card | Data |
|---|---|
| **Total Revenue** | Sum of all delivered order totals, formatted `₹XX,XXX` |
| **Total Orders** | Count of all orders |
| **Products Live** | Count of in-stock products |
| **Avg Order Value** | totalRevenue / totalOrders |

Below the cards:
- **Revenue Chart** (last 30 days): line chart using `recharts` library. X-axis = date, Y-axis = ₹ revenue. Lime colored line on dark grid.
- **Recent Orders Table**: last 5 orders with columns: Order ID, Customer Name, Total, Status (color-coded badge), Date. Clicking a row opens the order detail.
- **Top Products**: horizontal bar chart or ranked list showing top 5 products by units sold.

---

### 4.5 Page: Products (`/admin/products`)

**List View:**
- Table with columns: Thumbnail (40×50px), Name, Category, Price, Badge, Stock, Actions
- Filter bar at top: All / Hoodies / T-Shirts / Full Sets
- Search input (filters by name)
- "ADD NEW PRODUCT" button top-right → opens Add Product form

**Add / Edit Product Form (full page or slide-over panel):**

All fields from the products table:
- **Name** — text input
- **Price (₹)** — number input
- **Compare Price (₹)** — number input (optional, shows strikethrough)
- **Category** — dropdown: Hoodies / T-Shirts / Full Sets
- **Gender** — multi-select checkboxes: Men / Women / Unisex
- **Badge** — dropdown: NEW / LIMITED / SOLD OUT / None
- **Featured** — toggle (appears in Weekly Demand carousel)
- **In Stock** — toggle
- **Sizes** — multi-select checkbox grid: XS / S / M / L / XL / XXL
- **Colors** — dynamic add/remove list. Each entry: color name text input + hex color picker
- **Images** — multi-image uploader. Click to upload → calls `POST /api/upload` → appends URL to images array. First image = main. Drag to reorder. Click ✕ to remove. Max 6 images.
- **Description** — textarea (rich plain text, no markdown needed)
- **Care Instructions** — textarea
- **Shipping Note** — textarea
- **Save Product** button → `POST /api/products` (create) or `PUT /api/products/:id` (edit)

**Delete** — shows confirmation modal: `"DELETE [PRODUCT NAME]? THIS CANNOT BE UNDONE."` with CANCEL / CONFIRM buttons.

---

### 4.6 Page: Site Content (`/admin/content`)

Organized into **tabbed sections** matching the website layout. Each tab is a section of the homepage or shared UI:

#### Tab 1: Hero Section
- Subtitle text input (maps to `hero_subtitle`)
- Primary CTA label input (maps to `hero_cta_primary`)
- Secondary CTA label input (maps to `hero_cta_secondary`)

#### Tab 2: Category Banners (Pick Your Fit)
Three banner rows, each with:
- Section label: "HOODIES BANNER" / "T-SHIRTS BANNER" / "FULL SETS BANNER"
- Current image preview (200px wide)
- "CHANGE IMAGE" button → opens image uploader → calls `POST /api/upload` → saves URL to content key
- Alt text input

#### Tab 3: Weekly Demand
- Section heading input (`weekly_demand_heading`)
- Subheading/label input (`weekly_demand_subheading`)
- Note below: `"Products shown are controlled by the 'Featured' toggle on each product in the Products section."`

#### Tab 4: Brand Statement
- Line 1 text input (`statement_line1`)
- Line 2 text input (`statement_line2`)
- Three feature card editors (title + body for each of cards 1, 2, 3)

#### Tab 5: Gender Split (For Him / For Her)
- "FOR HIM" panel image uploader + preview (`gender_him_image`)
- "FOR HER" panel image uploader + preview (`gender_her_image`)

#### Tab 6: Next Drop Countdown
- Target date + time picker (`next_drop_target_date`) — datetime-local HTML input
- Countdown label input (`next_drop_label`)
- Live preview showing how many days/hours/minutes/seconds remain from now to selected date

#### Tab 7: Culture Section (UGC Strip)
- Section heading input (`ugc_heading`)
- Instagram handle input (`ugc_instagram_handle`)
- **6 image slots** labeled UGC_01 through UGC_06, each with:
  - Current image preview (thumbnail)
  - "REPLACE" button → image uploader → saves to `ugc_0X_image` key

#### Tab 8: Marquee Ticker
- Ticker text input (`marquee_text`) — full string with `·` separators

**Save button** on each tab → calls `POST /api/content/bulk` with all changed keys. Show success toast: green `"CONTENT SAVED ✓"` or red `"SAVE FAILED — TRY AGAIN"`.

---

### 4.7 Page: Orders (`/admin/orders`)

**Order List:**
- Table columns: Order ID, Date, Customer Name, Items (count), Total, Payment, Status
- Status is a color-coded badge:
  - Processing → yellow
  - Shipped → blue
  - Delivered → lime/green
  - Cancelled → red
- Filters: All / Processing / Shipped / Delivered / Cancelled
- Search by Order ID or customer name
- Click any row → opens Order Detail panel

**Order Detail (slide-over or modal):**
- Full order info: customer name, email, phone, delivery address
- Ordered items list with product image, name, size, color, qty, price
- Order total breakdown: subtotal + shipping + total
- Status dropdown with SAVE button → `PATCH /api/orders/:orderId`

---

### 4.8 Page: Analytics (`/admin/analytics`)

Shopify-style analytics. Three time-range tabs: **7 Days / 30 Days / 90 Days**

**Section 1: Overview Cards** (same as Dashboard but with date range filter applied)
- Revenue, Orders, Avg Order Value, Conversion Rate

**Section 2: Revenue Chart**
- Area chart (recharts AreaChart) — revenue over selected period
- Lime-colored fill with opacity 0.2 below the line

**Section 3: Sales by Category**
- Donut/pie chart (recharts PieChart): Hoodies / T-Shirts / Full Sets share of revenue
- Each segment a different accent color

**Section 4: Top Products Table**
- Rank | Product | Units Sold | Revenue | % of Total Revenue
- Clicking a row navigates to `Edit Product` page for that product

**Section 5: Orders by Status**
- Horizontal stacked bar: how many orders in each status state

**Section 6: Traffic + Funnel**
- Page Views → Add to Carts → Purchases funnel with drop-off percentages
- Values from the analytics event tracking system

All chart tooltips match the FRKWEAR dark aesthetic: dark background `#1A1A1A`, lime text, sharp corners (no border-radius).

---

### 4.9 Page: Settings (`/admin/settings`)

- **Change Password** form: Current Password + New Password + Confirm New Password → `PUT /api/auth/password` (updates `password_hash` in the `admins` table)
- **API Status** panel: shows green/red dot for Supabase connection (ping `supabase.from('admins').select('count')`) and Supabase Storage connection
- **Clear Analytics Cache** button
- **Danger Zone:** "CLEAR ALL ANALYTICS DATA" — red button, double-confirm modal → `DELETE FROM analytics` via Supabase client

---

## 5. Image Upload Flow

1. Admin clicks image upload area in any content or product form
2. Native `<input type="file" accept="image/*">` opens (or drag-drop zone)
3. On file select → `POST /api/upload` with `Authorization: Bearer <token>` header and `multipart/form-data`
4. Backend: `multer` (memory storage) receives file buffer → uploads to Supabase Storage bucket `frkwear-images` → calls `getPublicUrl` → returns `{ url: "https://<project>.supabase.co/storage/v1/object/public/frkwear-images/..." }`
5. Frontend: updates the relevant content key or product images array in local state
6. User clicks Save → persists to DB

---

## 6. Frontend Integration: ProductCarousel "Weekly Demand"

In `Home.jsx` the `ProductCarousel` currently receives the full static `products` array. After the backend is wired:

```jsx
const [featured, setFeatured] = useState([])
useEffect(() => {
  getProducts().then(all => setFeatured(all.filter(p => p.featured)))
}, [])
```

Pass `featured` to `<ProductCarousel products={featured} />`.

---

## 7. Checkout → Order Creation

In `Checkout.jsx`, on form submission, call `POST /api/orders` with the full order payload from cart state + customer form inputs. On success response with `orderId`, navigate to `/order-confirmed?id={orderId}`.

---

## 8. Analytics Event Tracking

Add `trackEvent` calls in the frontend:

| Where | Event | Extra Data |
|---|---|---|
| Every page mount in `PageTransition.jsx` | `page_view` | `{ path: location.pathname }` |
| `Product.jsx` handleAddToCart | `add_to_cart` | `{ productId, price }` |
| `Checkout.jsx` on successful order | `purchase` | `{ revenue: total }` |

Backend aggregates these into the `analytics` table daily using the `increment_analytics` Postgres function.

---

## 9. Environment Variables

### Backend `.env`
```
PORT=4000
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
JWT_SECRET=frkwear_ultra_secret_change_this_in_prod
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:4000
```

> **Note:** The frontend only talks to the Express API, never directly to Supabase. The service role key must never be exposed to the browser.

---

## 10. Package Dependencies to Add

### Backend
```
express bcryptjs jsonwebtoken cors dotenv multer
@supabase/supabase-js express-async-errors express-rate-limit
```

### Frontend (admin)
```
recharts
```
(Already has: react, react-router-dom, framer-motion, tailwindcss, lucide-react)

---

## 11. Security Requirements

- All `PUT`, `POST`, `DELETE`, `PATCH` routes on `/api/products`, `/api/content`, `/api/orders`, `/api/upload`, `/api/analytics` require valid JWT.
- Passwords stored as bcrypt hash (saltRounds=12) — never plain text. Stored in `admins.password_hash`.
- JWT secret min 32 characters, loaded from env var.
- `multer` file type validation: accept only `image/jpeg`, `image/png`, `image/webp`. Max 5MB.
- CORS restricted to known frontend origin(s).
- Rate limit `/api/auth/login`: max 5 requests per 15 minutes per IP (`express-rate-limit`).
- `SUPABASE_SERVICE_ROLE_KEY` is backend-only — never shipped to the browser. Frontend has no direct Supabase access.
- Supabase RLS can be left permissive on all tables since the service role key bypasses RLS; security is enforced entirely at the Express layer.

---

## 12. Admin UI Design Rules

Match the FRKWEAR aesthetic inside the admin but make it functional:

- Background: `#0F0F0F`
- Cards/panels: `#1A1A1A` with `1px solid rgba(200,255,0,0.15)` border
- Primary accent: lime `#C8FF00`
- Danger: `#FF2D78` (pink)
- Font: inherit the same font stack (Bebas Neue for headings, body font for labels)
- All buttons: sharp corners (no border-radius)
- Success toast: slide in from top-right, lime background, void text, auto-dismiss 3s
- Error toast: same slide-in, pink background
- Confirm modals: full-screen dark overlay, centered card, destructive action always in pink

---

## 13. File Tree After Implementation

```
FRKWEAR/
├── backend/                   ← NEW: Express API server
│   ├── server.js
│   ├── seed.js
│   ├── .env
│   ├── lib/
│   │   └── supabase.js        ← Supabase client (service role)
│   ├── supabase/
│   │   └── schema.sql         ← Run once in Supabase SQL Editor
│   ├── routes/
│   └── middleware/
├── src/
│   ├── admin/                 ← NEW: Admin SPA sub-tree
│   │   ├── AdminApp.jsx       ← sub-router, auth gate
│   │   ├── components/
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── TopBar.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── ImageUploader.jsx
│   │   │   └── Toast.jsx
│   │   └── pages/
│   │       ├── Login.jsx
│   │       ├── Dashboard.jsx
│   │       ├── Products.jsx
│   │       ├── ProductForm.jsx
│   │       ├── Content.jsx
│   │       ├── Orders.jsx
│   │       ├── Analytics.jsx
│   │       └── Settings.jsx
│   ├── context/
│   │   ├── SplashContext.jsx  (existing)
│   │   └── ContentContext.jsx ← NEW
│   ├── lib/
│   │   └── api.js             ← NEW
│   ├── pages/
│   │   ├── Home.jsx           ← MODIFIED (useContent hooks)
│   │   ├── Shop.jsx           ← MODIFIED (API fetch)
│   │   ├── Product.jsx        ← MODIFIED (API fetch)
│   │   └── Checkout.jsx       ← MODIFIED (POST order)
│   ├── data/
│   │   └── products.js        ← kept as fallback only
│   └── App.jsx                ← MODIFIED (add /admin route + ContentProvider)
└── ANTIGRAVITY_PROMPT.md
```

---

## 14. Running Locally

```bash
# Step 0: Set up Supabase
# 1. Create a project at supabase.com
# 2. Run supabase/schema.sql in the Supabase SQL Editor
# 3. Create a public storage bucket named "frkwear-images" in the Supabase dashboard
# 4. Copy your project URL and service role key into backend/.env

# Terminal 1: Backend
cd backend
npm install
node seed.js    # upserts admin user + default content rows (run once)
npm run dev     # nodemon server.js on port 4000

# Terminal 2: Frontend
cd ..
npm install     # (recharts added)
npm run dev     # Vite on port 5173
```

Admin panel: `http://localhost:5173/#/admin`  
Login: `tirth11` / `Tirth@2005`

---

## 15. Deployment Notes

- Backend: deploy to Railway / Render / VPS. Set all env vars (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `FRONTEND_URL`).
- Database: Supabase hosts the PostgreSQL database — no separate DB deployment needed. Run `schema.sql` once via the Supabase SQL Editor.
- Storage: Supabase Storage hosts uploaded images — no Cloudinary account needed.
- Frontend: `npm run build` → deploy `dist/` to Vercel / Netlify / GitHub Pages.
- Update `VITE_API_URL` to production backend URL before building.
- Update `FRONTEND_URL` in backend `.env` to production frontend domain for CORS.
- Change `JWT_SECRET` to a strong random 64-char string in production.
- **Change the admin password** immediately after first deployment via Settings → Change Password.

---

*This document is the complete specification for the FRKWEAR backend + back office system. Every section of the storefront, every product field, and every piece of content is covered. Build this exactly as specified.*
