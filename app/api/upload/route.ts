// app/api/upload/route.ts
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // 🔥 REQUIRED

export async function POST(request: Request) {
  try {
    console.log("📤 Upload request received");

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    console.log("Token exists:", !!token);

    if (!token) {
      return NextResponse.json(
        { error: "BLOB_READ_WRITE_TOKEN not configured" },
        { status: 500 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const blob = await put(file.name, file, {
      access: "public",
      token,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("❌ Upload error:", error);

    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
