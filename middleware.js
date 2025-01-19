import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const loginUrl = new URL("/DENY", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // 토큰이 있지만 user가 없거나 admin 속성이 없는 경우
  if (!token.user || !token.user.admin) {
    const denyUrl = new URL("/DENY", req.url);
    return NextResponse.redirect(denyUrl);  // 권한 없는 경우 DENY 페이지로 리다이렉트
  }

  return NextResponse.next(); // 요청 진행
}

export const config = {
  matcher: ["/ABOUTME/update", "/GALLERY/:segment/write"], // 미들웨어를 적용할 경로
};
