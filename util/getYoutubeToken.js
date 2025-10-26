export default async function getYouTubeToken() {
  // 세션 스토리지에서 캐시된 토큰 확인
  const cached = sessionStorage.getItem("yt_token");
  const expiry = sessionStorage.getItem("yt_token_expiry");
  if (cached && expiry && Date.now() < parseInt(expiry)) {
    return cached;
  }
  console.log("새 토큰 요청");
  // 새 토큰 요청
  return new Promise((resolve) => {
    if (!window.google?.accounts?.oauth2) return resolve(null);
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      scope: "https://www.googleapis.com/auth/youtube.force-ssl",
      callback: (resp) => {
        if (resp?.access_token) {
          // 토큰을 세션에 저장 (3000초 = 50분 유효)
          sessionStorage.setItem("yt_token", resp.access_token);
          sessionStorage.setItem(
            "yt_token_expiry",
            String(Date.now() + 3000 * 1000)
          );
          resolve(resp.access_token);
        } else {
          resolve(null);
        }
      },
    });
    
    client.requestAccessToken();
  });
};
