import { neon } from "@neondatabase/serverless";

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
        "Create a Neon database at https://neon.tech and add the connection string."
    );
  }
  return neon(databaseUrl);
}

/**
 * Run the initial schema migration and seed default offer codes.
 * Call this from /api/admin/setup or run manually.
 */
export async function initializeDatabase() {
  const sql = getDb();

  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      organization TEXT,
      role TEXT,
      city TEXT,
      state TEXT,
      country TEXT DEFAULT 'US',
      phone TEXT,
      how_heard TEXT,
      payment_method TEXT NOT NULL DEFAULT 'offer_code',
      offer_code TEXT,
      amount_paid NUMERIC(10,2) NOT NULL DEFAULT 0,
      stripe_session_id TEXT,
      download_token TEXT NOT NULL UNIQUE,
      download_count INTEGER NOT NULL DEFAULT 0,
      max_downloads INTEGER NOT NULL DEFAULT 5,
      token_expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS offer_codes (
      id SERIAL PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      description TEXT,
      discount_percent INTEGER NOT NULL DEFAULT 100,
      max_uses INTEGER,
      current_uses INTEGER NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS download_logs (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER NOT NULL REFERENCES customers(id),
      ip_address TEXT,
      user_agent TEXT,
      downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // Seed default offer codes if none exist
  const result = await sql`SELECT COUNT(*)::int as count FROM offer_codes`;
  if (result[0].count === 0) {
    await sql`INSERT INTO offer_codes (code, description, discount_percent, max_uses) VALUES
      ('STUDENT2026', 'Student complimentary access', 100, NULL),
      ('ARES2026', 'ARES member discount', 100, NULL),
      ('REVIEW2026', 'Reviewer copy', 100, 50)
    `;
  }

  return { success: true, message: "Database initialized successfully." };
}
