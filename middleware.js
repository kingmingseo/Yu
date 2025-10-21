import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const loginUrl = new URL("/DENY", req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (!token.user || !token.user.admin) {
    const denyUrl = new URL("/DENY", req.url);
    return NextResponse.redirect(denyUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/ABOUTME/update", 
    "/WRITE/:section",     // 통합 작성 페이지 (GALLERY, DAILYLIFE)
    "/GALLERY/:category/:id/update"  // GALLERY 업데이트 페이지
  ],
};
