"use client";

import { useRouter } from "next/navigation";
import { FaTrash } from "react-icons/fa";

export default function DeleteButton({ category, id }) {
  const router = useRouter();
  const deleteData = async () => {
    if (confirm("정말로 삭제하시겠습니까?")) {
      try {
        const response = await fetch(`/api/GALLERY/${category}/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          // 캐시 무효화
          await fetch('/api/revalidate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: `/GALLERY/${category}` })
          });
          
          alert("성공적으로 삭제되었습니다.");
          router.push(`/GALLERY/${category}`);
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
    >
      <FaTrash size={20} />
    </button>
  );
}
