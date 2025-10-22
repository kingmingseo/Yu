import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { path } = await request.json();

    // 캐시 무효화
    revalidatePath(path);

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        revalidated: false,
        error: err.message,
      },
      { status: 500 }
    );
  }
}
