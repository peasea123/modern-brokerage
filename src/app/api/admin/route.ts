import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { CONFIG } from "@/lib/config";

export async function GET(request: NextRequest) {
  // Simple password auth via header
  const password = request.headers.get("x-admin-password");
  if (password !== CONFIG.adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();

    const customers = db
      .prepare(
        `SELECT id, email, first_name, last_name, organization, role,
                city, state, country, phone, how_heard,
                payment_method, offer_code, amount_paid,
                download_count, created_at
         FROM customers ORDER BY created_at DESC`
      )
      .all();

    const stats = db
      .prepare(
        `SELECT
          COUNT(*) as total_customers,
          SUM(amount_paid) as total_revenue,
          SUM(CASE WHEN payment_method = 'offer_code' THEN 1 ELSE 0 END) as offer_code_count,
          SUM(CASE WHEN payment_method = 'stripe' THEN 1 ELSE 0 END) as paid_count,
          SUM(download_count) as total_downloads
         FROM customers`
      )
      .get();

    const offerCodes = db
      .prepare("SELECT * FROM offer_codes ORDER BY created_at DESC")
      .all();

    return NextResponse.json({ customers, stats, offerCodes });
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

    const db = getDb();
    db.prepare(
      "INSERT INTO offer_codes (code, description, discount_percent, max_uses) VALUES (?, ?, ?, ?)"
    ).run(code.toUpperCase(), description, discountPercent || 100, maxUses || null);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin create code error:", error);
    return NextResponse.json(
      { error: "Server error or duplicate code" },
      { status: 500 }
    );
  }
}
