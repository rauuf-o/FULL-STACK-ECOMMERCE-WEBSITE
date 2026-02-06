// app/api/upload/route.ts
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.log("📤 Upload request received");

    // Debug: Check if token exists
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    console.log("Token exists:", !!token);

    if (!token) {
      return NextResponse.json(
        { error: "BLOB_READ_WRITE_TOKEN not configured" },
        { status: 500 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("📁 Uploading file:", file.name, "Size:", file.size);

    // Upload to Vercel Blob with explicit token
    const blob = await put(file.name, file, {
      access: "public",
      token: token, // ✅ Explicitly pass the token
    });

    console.log("✅ Upload successful:", blob.url);
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("❌ Upload error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Upload failed",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
