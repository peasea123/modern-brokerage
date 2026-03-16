import { NextRequest, NextResponse } from "next/server";
import { initializeDatabase } from "@/lib/db";
import { CONFIG } from "@/lib/config";

export async function POST(request: NextRequest) {
  const password = request.headers.get("x-admin-password");
  if (password !== CONFIG.adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await initializeDatabase();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Database setup error:", error);
    return NextResponse.json(
      { error: "Failed to initialize database: " + (error as Error).message },
      { status: 500 }
    );
  }
}
