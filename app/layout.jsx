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
  // 카카오톡 링크 미리보기 비활성화
  openGraph: {
    type: 'website',
    images: [], // 빈 배열로 설정하여 이미지 없음
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
  other: {
    'kakaotalk-scrap': 'false', // 카카오톡 스크랩 비활성화
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