import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { generateDownloadToken, getTokenExpiryDate } from "@/lib/tokens";
import { CONFIG } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      organization,
      role,
      city,
      state,
      country,
      phone,
      howHeard,
      offerCode,
      paymentMethod,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { success: false, error: "First name, last name, and email are required." },
        { status: 400 }
      );
    }

    const db = getDb();
    let amountPaid = CONFIG.bookPrice;

    // Validate offer code if using one
    if (paymentMethod === "offer_code") {
      if (!offerCode) {
        return NextResponse.json(
          { success: false, error: "Offer code is required." },
          { status: 400 }
        );
      }

      const code = db
        .prepare(
          "SELECT * FROM offer_codes WHERE UPPER(code) = UPPER(?) AND is_active = 1"
        )
        .get(offerCode) as {
        id: number;
        discount_percent: number;
        max_uses: number | null;
        current_uses: number;
      } | undefined;

      if (!code) {
        return NextResponse.json(
          { success: false, error: "Invalid offer code." },
          { status: 400 }
        );
      }

      if (code.max_uses && code.current_uses >= code.max_uses) {
        return NextResponse.json(
          { success: false, error: "This offer code has been fully redeemed." },
          { status: 400 }
        );
      }

      amountPaid = CONFIG.bookPrice * (1 - code.discount_percent / 100);

      // Increment usage
      db.prepare(
        "UPDATE offer_codes SET current_uses = current_uses + 1 WHERE id = ?"
      ).run(code.id);
    }

    // For Stripe payment method (stubbed)
    if (paymentMethod === "stripe") {
      if (CONFIG.stripeEnabled) {
        // TODO: Create Stripe Checkout Session
        // Return stripe checkout URL
        return NextResponse.json({
          success: false,
          error: "Payment processing is being configured. Please use an offer code for now.",
        });
      } else {
        // Stub: allow through for testing (remove in production)
        return NextResponse.json({
          success: false,
          error:
            "Payment processing is coming soon. Please use an offer code for immediate access, or check back shortly.",
        });
      }
    }

    // Generate download token
    const downloadToken = generateDownloadToken();
    const tokenExpiresAt = getTokenExpiryDate();

    // Insert customer record
    db.prepare(
      `INSERT INTO customers (
        email, first_name, last_name, organization, role,
        city, state, country, phone, how_heard,
        payment_method, offer_code, amount_paid,
        download_token, token_expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      email,
      firstName,
      lastName,
      organization || null,
      role || null,
      city || null,
      state || null,
      country || "US",
      phone || null,
      howHeard || null,
      paymentMethod,
      offerCode || null,
      amountPaid,
      downloadToken,
      tokenExpiresAt
    );

    return NextResponse.json({
      success: true,
      downloadToken,
      message: "Access granted! Redirecting to download page...",
    });
  } catch (error) {
    console.error("Purchase error:", error);
    return NextResponse.json(
      { success: false, error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
