import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { CONFIG } from "@/lib/config";

export async function GET(request: NextRequest) {
  // Simple password auth via header
  const password = request.headers.get("x-admin-password");
  if (password !== CONFIG.adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = getDb();

    const customers = await sql`
      SELECT id, email, first_name, last_name, organization, role,
             city, state, country, phone, how_heard,
             payment_method, offer_code, amount_paid,
             download_count, created_at
      FROM customers ORDER BY created_at DESC
    `;

    const statsRows = await sql`
      SELECT
        COUNT(*)::int as total_customers,
        COALESCE(SUM(amount_paid), 0)::numeric as total_revenue,
        COUNT(CASE WHEN payment_method = 'offer_code' THEN 1 END)::int as offer_code_count,
        COUNT(CASE WHEN payment_method = 'stripe' THEN 1 END)::int as paid_count,
        COALESCE(SUM(download_count), 0)::int as total_downloads
      FROM customers
    `;

    const offerCodes = await sql`
      SELECT * FROM offer_codes ORDER BY created_at DESC
    `;

    return NextResponse.json({
      customers,
      stats: statsRows[0],
      offerCodes,
    });
  } catch (error) {
    console.error("Admin API error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

// Create new offer code
export async function POST(request: NextRequest) {
  const password = request.headers.get("x-admin-password");
  if (password !== CONFIG.adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { code, description, discountPercent, maxUses } =
      await request.json();

    if (!code || !description) {
      return NextResponse.json(
        { error: "Code and description are required" },
        { status: 400 }
      );
    }

    const sql = getDb();
    await sql`
      INSERT INTO offer_codes (code, description, discount_percent, max_uses)
      VALUES (${code.toUpperCase()}, ${description}, ${discountPercent || 100}, ${maxUses || null})
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin create code error:", error);
    return NextResponse.json(
      { error: "Server error or duplicate code" },
      { status: 500 }
    );
  }
}
