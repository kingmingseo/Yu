export const dynamic = "force-dynamic";

// 카카오톡 링크 미리보기용 (이미지/OG 없이 텍스트만)
export default function KakaoPreviewPage({ searchParams }) {
  const from = searchParams?.from ? String(searchParams.from) : "/";
  return (
    <main
      style={{
        padding: 16,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
      }}
    >
      <p>Yu</p>
      <p>{from}</p>
    </main>
  );
}

