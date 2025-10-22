export default function robots() {
  const baseUrl = 'https://me-and-yu.vercel.app'; // 실제 도메인으로 교체하세요
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/WRITE/', '/LOGIN/', '/DENY/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
