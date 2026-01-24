"use client";

import { useRouter } from "next/navigation";
import { FaTrash } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { useDeleteContent } from "@/app/hooks/useDeleteContent";

export default function DeleteButtonUI({ category, id, section = "GALLERY" , isAdmin }) {
  const { deleteData } = useDeleteContent({ section, action: "delete", category, id });

  // 관리자가 아니면 버튼 숨김
  if (!isAdmin) return null;
  return (
    <div className="fixed bottom-10 right-5 sm:right-10">
      <button
        className="bg-transparent border-2 border-white rounded-full p-3 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
        onClick={deleteData}
        aria-label="게시물 삭제"
      >
        <FaTrash size={20} />
      </button>
    </div>
  );
}
