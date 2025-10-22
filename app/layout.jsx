import AudioPlayer from "@/components/bgmplayer";
import ".//globals.css";
import MarginWrapper from "@/components/marginwrapper";
import Navigation from "@/components/navigation";
import Providers from "@/components/provider"

export const metadata = {
  title: 'Yu',
  description: "Korean fashion model Yu Gwang Yeong's official portfolio. Discover her latest work, gallery, daily life, and professional modeling services.",
  keywords: ['Korean fashion model', 'Yu Gwang Yeong', 'fashion portfolio', 'modeling', 'Korea', 'fashion', 'photography'],
  authors: [{ name: 'Yu Gwang Yeong' }],
  creator: 'Yu Gwang Yeong',
  publisher: 'Yu Gwang Yeong',
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
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://your-domain.com',
    title: 'Yu Gwang Yeong - Korean Fashion Model',
    description: "Korean fashion model Yu Gwang Yeong's official portfolio. Discover her latest work, gallery, daily life, and professional modeling services.",
    siteName: 'Yu Gwang Yeong',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yu Gwang Yeong - Korean Fashion Model',
    description: "Korean fashion model Yu Gwang Yeong's official portfolio.",
    creator: '@yu_gwang0',
  },
  verification: {
    google: 'your-google-verification-code', // Google Search Console에서 받은 코드로 교체
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
        </Providers>
      </body>
    </html>
  );
}