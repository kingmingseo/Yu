import AudioPlayer from "@/components/bgmplayer";
import ".//globals.css";
import MarginWrapper from "@/components/marginwrapper";
import Navigation from "@/components/navigation";
import Providers from "@/components/provider"
import { Analytics } from "@vercel/analytics/next"

export const metadata = {
  title: 'Yu',
  description: "Korean fashion model Yu Gwang Yeong's official portfolio. Discover her latest work, gallery, daily life, and professional modeling services.",
  keywords: ['Korean fashion model', 'Yu Gwang Yeong', 'fashion portfolio', 'modeling', 'Korea', 'fashion', 'photography'],
  authors: [{ name: 'Yu Gwang Yeong' }],
  creator: 'Yu Gwang Yeong',
  publisher: 'Yu Gwang Yeong',
  // 카카오톡 링크 미리보기 완전 비활성화 - Open Graph 제거
  // openGraph를 아예 정의하지 않으면 Next.js가 자동 생성하지 않음
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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