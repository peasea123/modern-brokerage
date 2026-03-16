import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { CONFIG } from "@/lib/config";

export async function POST(request: NextRequest) {
  const password = request.headers.get("x-admin-password");
  if (password !== CONFIG.adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!file.name.endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are accepted" },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const blob = await put(CONFIG.pdfFileName, file, {
      access: "public",
      addRandomSuffix: false,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      message: `PDF uploaded successfully. Set PDF_BLOB_URL=${blob.url} in your Vercel environment variables.`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed: " + (error as Error).message },
      { status: 500 }
    );
  }
}
