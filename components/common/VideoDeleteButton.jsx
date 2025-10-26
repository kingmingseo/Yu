"use client";

import { useRouter } from "next/navigation";
import { FaTrash } from "react-icons/fa";
import { useSession } from "next-auth/react";

export default function VideoDeleteButton({ category, id }) {
  const router = useRouter();
  const { data } = useSession();
  const isAdmin = !!data?.user?.admin;

  // 관리자가 아니면 버튼 숨김
  if (!isAdmin) return null;

  const getYouTubeToken = async () => {
    // 세션 스토리지에서 캐시된 토큰 확인
    const cached = sessionStorage.getItem("yt_token");
    const expiry = sessionStorage.getItem("yt_token_expiry");
    if (cached && expiry && Date.now() < parseInt(expiry)) {
      return cached;
    }

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

  const deleteData = async () => {
    if (confirm("정말로 삭제하시겠습니까?")) {
      try {
        // YouTube에서도 삭제 시도 (OAuth 토큰 필요)
        try {
          const token = await getYouTubeToken();
          if (token) {
            // 서버에서 videoId를 찾기 위해 간단 조회 후 삭제
            const metaRes = await fetch(`/api/youtube/video-meta?id=${id}`);
            if (metaRes.ok) {
              const { videoId } = await metaRes.json();
              if (videoId) {
                await fetch(
                  `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}`,
                  {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                  }
                ).catch(() => {});
              }
            }
          }
        } catch (_) {}

        // DB에서 삭제
        const apiEndpoint = `/api/delete/youtube_videos/${id}`;

        const response = await fetch(apiEndpoint, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const redirectPath = `/GALLERY/${category}`;

          // 캐시 무효화
          await fetch("/api/revalidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: redirectPath }),
          });

          alert("성공적으로 삭제되었습니다.");
          router.push(redirectPath);
        } else {
          alert("삭제에 실패했습니다.");
        }
      } catch (error) {
        console.error("Error deleting data:", error);
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <button
      className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2 transition-all"
      onClick={deleteData}
      aria-label="영상 삭제"
    >
      <FaTrash size={16} />
    </button>
  );
}
