import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { isTokenExpired } from "@/lib/tokens";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const db = getDb();

    const customer = db
      .prepare("SELECT * FROM customers WHERE download_token = ?")
      .get(token) as {
      id: number;
      email: string;
      first_name: string;
      last_name: string;
      download_count: number;
      max_downloads: number;
      token_expires_at: string;
    } | undefined;

    if (!customer) {
      return NextResponse.json(
        { error: "Invalid download link." },
        { status: 404 }
      );
    }

    if (isTokenExpired(customer.token_expires_at)) {
      return NextResponse.json(
        { error: "This download link has expired." },
        { status: 410 }
      );
    }

    return NextResponse.json({
      customerName: customer.first_name,
      email: customer.email,
      downloadsRemaining: customer.max_downloads - customer.download_count,
      expiresAt: customer.token_expires_at,
    });
  } catch (error) {
    console.error("Download info error:", error);
    return NextResponse.json(
      { error: "Server error." },
      { status: 500 }
    );
  }
}
