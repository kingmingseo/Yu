import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req) {
  const { pathname } = req.nextUrl;
  const ua = req.headers.get("user-agent") || "";
  const isKakao =
    ua.includes("KakaoBot") ||
    ua.includes("kakaotalk-scrap") ||
    ua.includes("Daum");

  // 카카오 크롤러는 이미지/OG 없는 페이지로 보내기 (미리보기 차단 목적)
  // 무한루프/정적 파일은 제외
  const isAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap") ||
    pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|mp3|mp4|css|js)$/);

  if (isKakao && !isAsset && pathname !== "/kakao-preview") {
    const url = req.nextUrl.clone();
    url.pathname = "/kakao-preview";
    // 어떤 URL을 미리보기하려던 건지 남김(디버깅/확장용)
    url.searchParams.set("from", pathname);
    return NextResponse.rewrite(url);
  }

  // 아래는 기존 관리자 보호 로직 (특정 경로만)
  const isProtected =
    pathname === "/ABOUTME/update" ||
    pathname.startsWith("/WRITE/") ||
    pathname.endsWith("/update");

  if (!isProtected) {
    return NextResponse.next();
  }

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
    "/:path*", // 카카오 크롤러 rewrite를 위해 전체 경로에서 실행
  ],
};
