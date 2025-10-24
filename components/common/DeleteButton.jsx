"use client";

import { useRouter } from "next/navigation";
import { FaTrash } from "react-icons/fa";

export default function DeleteButton({ category, id, section = "GALLERY" }) {
  const router = useRouter();
  const deleteData = async () => {
    if (confirm("정말로 삭제하시겠습니까?")) {
      try {
        // 컬렉션명 결정
        const collection = section === "DAILYLIFE" 
          ? "dailylife"
          : section === "SPONSORSHIP"
          ? "sponsorship"
          : (category === 'MV' || category === 'VIDEO')
          ? "youtube_videos"
          : category.toLowerCase();
        
        // 통합 API 엔드포인트
        const apiEndpoint = `/api/delete/${collection}/${id}`;
        
        const response = await fetch(apiEndpoint, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          // 리다이렉트 경로 결정
          const redirectPath = section === "DAILYLIFE" 
            ? "/DAILYLIFE" 
            : section === "SPONSORSHIP"
            ? "/SPONSORSHIP"
            : `/GALLERY/${category}`;
          
          // 캐시 무효화
          await fetch('/api/revalidate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: redirectPath })
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
      className="bg-transparent border-2 border-white rounded-full p-3 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
      onClick={deleteData}
      aria-label="게시물 삭제"
    >
      <FaTrash size={20} />
    </button>
  );
}
