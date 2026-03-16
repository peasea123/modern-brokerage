import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isTokenExpired } from "@/lib/tokens";
import { CONFIG } from "@/lib/config";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const sql = getDb();

    const rows = await sql`
      SELECT id, email, first_name, last_name, download_count, max_downloads, token_expires_at
      FROM customers
      WHERE download_token = ${token}
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid download link." },
        { status: 404 }
      );
    }

    const customer = rows[0];

    if (isTokenExpired(customer.token_expires_at)) {
      return NextResponse.json(
        { error: "This download link has expired." },
        { status: 410 }
      );
    }

    if (customer.download_count >= customer.max_downloads) {
      return NextResponse.json(
        {
          error: `Download limit reached (${customer.max_downloads} downloads). Please contact support.`,
        },
        { status: 429 }
      );
    }

    // Get the PDF URL from env (set after uploading to Vercel Blob)
    const pdfUrl = CONFIG.pdfBlobUrl;
    if (!pdfUrl) {
      return NextResponse.json(
        { error: "The book file is not yet available. Please check back soon." },
        { status: 404 }
      );
    }

    // Log the download
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    await sql`
      INSERT INTO download_logs (customer_id, ip_address, user_agent)
      VALUES (${customer.id}, ${ip}, ${userAgent})
    `;

    // Increment download count
    await sql`
      UPDATE customers
      SET download_count = download_count + 1, updated_at = NOW()
      WHERE id = ${customer.id}
    `;

    // Fetch the PDF from Vercel Blob and stream it to the user
    const pdfResponse = await fetch(pdfUrl);
    if (!pdfResponse.ok) {
      return NextResponse.json(
        { error: "Failed to retrieve the book file." },
        { status: 500 }
      );
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();
    const fileName = `The-Modern-Brokerage-${customer.first_name}-${customer.last_name}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": pdfBuffer.byteLength.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
