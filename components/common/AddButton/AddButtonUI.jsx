import { useSession } from "next-auth/react";
import Link from "next/link";
import { FaPen } from "react-icons/fa";

/**
 * Presentational Component - 순수 UI 컴포넌트
 * 스토리북에서 직접 사용 가능
 */
export default function AddButtonUI({ category, variant = 'gallery', isAdmin }) {
  // 관리자가 아니면 버튼 숨김
  if (!isAdmin) return null;
  const isVideoCategory = category === "MV" || category === "VIDEO";
  const isAbout = variant === 'aboutme';

  const href = isAbout
    ? "/ABOUTME/update"
    : isVideoCategory
      ? `/WRITE/VIDEO?category=${category}`
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
