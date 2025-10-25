"use client";
import Link from "next/link";
import { FaPen } from "react-icons/fa";
import { useSession } from "next-auth/react";

export default function AddButton({ category, variant = 'gallery' }) {
  const { data } = useSession();
  const isAdmin = !!data?.user?.admin;

  // 관리자가 아니면 버튼 숨김
  if (!isAdmin) return null;
  const isVideoCategory = category === "MV" || category === "VIDEO";
  const isAbout = variant === 'aboutme';

  const href = isAbout
    ? "/ABOUTME/update"
    : isVideoCategory
      ? `/WRITE/VIDEO?category=${category.toLowerCase()}`
      : `/WRITE/GALLERY?category=${category}`;

  const ariaLabel = isAbout
    ? "소개 페이지 편집"
    : isVideoCategory ? "영상 업로드" : "갤러리 게시물 작성";

  return (
    <div className="fixed bottom-10 right-5 sm:right-10">
      <Link href={href}>
        <button
          className="bg-transparent border-2 border-white rounded-full p-3 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
          aria-label={ariaLabel}
        >
          <FaPen size={20} />
        </button>
      </Link>
    </div>
  );
}
