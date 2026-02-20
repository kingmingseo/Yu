export default function robots() {
  const baseUrl = 'https://me-and-yu.vercel.app'; // 실제 도메인으로 교체하세요
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/WRITE/', '/LOGIN/', '/DENY/'],
      },
      // 카카오톡 봇 차단 (링크 미리보기 방지)
      {
        userAgent: 'kakaotalk-scrap',
        disallow: '/',
      },
      {
        userAgent: 'KakaoBot',
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
