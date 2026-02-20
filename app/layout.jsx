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
  // Open Graph 완전 제거 - 카카오톡 링크 미리보기 방지
  openGraph: {
    images: [], // 빈 배열로 설정하여 이미지 태그 생성 방지
    // 다른 필드도 명시적으로 제거
    url: undefined,
    siteName: undefined,
  },
  // icons도 제거하여 favicon 등이 OG 이미지로 사용되지 않도록
  icons: {
    icon: [],
    apple: [],
  },
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