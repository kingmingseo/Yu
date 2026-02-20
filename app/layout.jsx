import AudioPlayer from "@/components/bgmplayer";
import ".//globals.css";
import MarginWrapper from "@/components/marginwrapper";
import Navigation from "@/components/navigation";
import Providers from "@/components/provider"
import { Analytics } from "@vercel/analytics/next"

// Open Graph 이미지 완전 제거
export const metadata = {
  // Next.js가 자동으로 생성하는 Open Graph 태그 제거
  openGraph: {
    images: [], // 빈 배열로 설정하여 og:image 태그 생성 방지
  },
  // icons도 제거하여 favicon이 OG 이미지로 사용되지 않도록
  icons: {
    icon: [],
    apple: [],
  },
};

export default async function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <Navigation />
          <MarginWrapper>{children}</MarginWrapper> {/* 경로에 따라 마진 처리 */}
          <AudioPlayer />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}