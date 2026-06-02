import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

export async function POST(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { title, fileSize, fileType, accessToken } = await request.json();

    if (!title || !fileSize || !accessToken) {
      return NextResponse.json(
        { error: "title, fileSize and accessToken are required" },
        { status: 400 }
      );
    }

    const metadata = {
      snippet: { title },
      status: { privacyStatus: "public" },
    };

    const initRes = await fetch(
      "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
          "X-Upload-Content-Length": String(fileSize),
          "X-Upload-Content-Type": fileType || "video/*",
        },
        body: JSON.stringify(metadata),
      }
    );

    if (!initRes.ok) {
      const details = await initRes.text();
      return NextResponse.json(
        { error: "YouTube upload session creation failed", details },
        { status: initRes.status }
      );
    }

    const uploadUrl = initRes.headers.get("location");
    if (!uploadUrl) {
      return NextResponse.json(
        { error: "YouTube upload URL was not returned" },
        { status: 502 }
      );
    }

    return NextResponse.json({ uploadUrl });
  } catch (error) {
    console.error("YouTube upload session API error:", error);
    return NextResponse.json(
      { error: "Upload session creation failed", details: error.message },
      { status: 500 }
    );
  }
}
