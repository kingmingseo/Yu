"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import getYouTubeToken from "@/util/getYoutubeToken";
import VideoDeleteButtonUI from "./VideoDeleteButtonUI";

/**
 * Container Component - 모든 훅과 로직 처리
 * 실제 페이지에서 사용
 */
export default function VideoDeleteButtonContainer({
  category,
  id,
  onDelete,
  onDeleteComplete,
}) {
  const router = useRouter();
  const { data } = useSession();
  const isAdmin = !!data?.user?.admin;

  const deleteData = async () => {
    if (confirm("정말로 삭제하시겠습니까?")) {
      onDelete();
      try {
        // YouTube 토큰 가져오기
        const token = await getYouTubeToken();
        // 원자적 삭제 API 호출 (YouTube + DB 동시 삭제)
        const response = await fetch(`/api/delete/youtube-video/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
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
          const errorData = await response.json();
          console.error("삭제 실패:", errorData);

          // 구체적인 오류 메시지 표시
          if (errorData.error === "youtube_delete_failed") {
            alert(
              "YouTube에서 비디오 삭제에 실패했습니다. 권한을 확인해주세요."
            );
          } else if (errorData.error === "youtube_api_error") {
            alert("YouTube API 호출 중 오류가 발생했습니다.");
          } else {
            alert("삭제에 실패했습니다.");
          }
        }
      } catch (error) {
        console.error("Error deleting data:", error);
        alert("삭제 중 오류가 발생했습니다.");
      }
      onDeleteComplete();
    }
  };

  return <VideoDeleteButtonUI onDelete={deleteData} isAdmin={isAdmin} />;
}
