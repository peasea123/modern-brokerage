import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { valid: false, message: "Please enter a code", discount: 0 },
        { status: 400 }
      );
    }

    const sql = getDb();
    const rows = await sql`
      SELECT id, code, description, discount_percent, max_uses, current_uses
      FROM offer_codes
      WHERE UPPER(code) = UPPER(${code}) AND is_active = true
    `;

    if (rows.length === 0) {
      return NextResponse.json({
        valid: false,
        message: "Invalid offer code",
        discount: 0,
      });
    }

    const offerCode = rows[0];

    if (offerCode.max_uses && offerCode.current_uses >= offerCode.max_uses) {
      return NextResponse.json({
        valid: false,
        message: "This offer code has reached its maximum number of uses",
        discount: 0,
      });
    }

    const discountLabel =
      offerCode.discount_percent === 100
        ? "Free access"
        : `${offerCode.discount_percent}% off`;

    return NextResponse.json({
      valid: true,
      message: `${discountLabel} — ${offerCode.description}`,
      discount: offerCode.discount_percent,
    });
  } catch (error) {
    console.error("Code validation error:", error);
    return NextResponse.json(
      { valid: false, message: "Server error", discount: 0 },
      { status: 500 }
    );
  }
}
