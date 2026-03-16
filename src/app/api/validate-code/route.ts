import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { valid: false, message: "Please enter a code", discount: 0 },
        { status: 400 }
      );
    }

    const db = getDb();
    const offerCode = db
      .prepare(
        "SELECT * FROM offer_codes WHERE UPPER(code) = UPPER(?) AND is_active = 1"
      )
      .get(code) as {
      id: number;
      code: string;
      description: string;
      discount_percent: number;
      max_uses: number | null;
      current_uses: number;
    } | undefined;

    if (!offerCode) {
      return NextResponse.json({
        valid: false,
        message: "Invalid offer code",
        discount: 0,
      });
    }

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
