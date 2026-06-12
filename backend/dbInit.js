import { query } from './db.js';

export async function initDB() {
  console.log('Verifying database tables in Supabase PostgreSQL...');
  try {
    // 1. admins
    await query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. products
    await query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price NUMERIC NOT NULL,
        compare_price NUMERIC,
        category VARCHAR(255) NOT NULL,
        gender TEXT[] NOT NULL,
        badge VARCHAR(50),
        rating NUMERIC DEFAULT 0,
        reviews INTEGER DEFAULT 0,
        colors JSONB NOT NULL,
        sizes TEXT[] NOT NULL,
        images TEXT[] NOT NULL,
        description TEXT NOT NULL,
        care_instructions TEXT,
        shipping_note TEXT,
        in_stock BOOLEAN DEFAULT TRUE,
        featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. site_content
    await query(`
      CREATE TABLE IF NOT EXISTS site_content (
        key VARCHAR(255) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. orders
    await query(`
      CREATE TABLE IF NOT EXISTS orders (
        order_id VARCHAR(255) PRIMARY KEY,
        items JSONB NOT NULL,
        subtotal NUMERIC NOT NULL,
        shipping NUMERIC NOT NULL,
        total NUMERIC NOT NULL,
        customer JSONB NOT NULL,
        status VARCHAR(100) DEFAULT 'Processing',
        payment_method VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. analytics
    await query(`
      CREATE TABLE IF NOT EXISTS analytics (
        date DATE PRIMARY KEY,
        page_views INTEGER DEFAULT 0,
        add_to_cart_events INTEGER DEFAULT 0,
        purchases INTEGER DEFAULT 0,
        revenue NUMERIC DEFAULT 0
      );
    `);

    console.log('Database tables successfully verified/created.');
  } catch (error) {
    console.error('Error initializing database tables:', error);
    throw error;
  }
}
