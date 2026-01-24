import { FaTrash } from "react-icons/fa";

/**
 * Presenter Component - 순수 UI, 훅 사용 안 함
 * 스토리북에서 사용
 */
export default function DeleteButtonUI({ onDelete, isAdmin }) {
  // 관리자가 아니면 버튼 숨김
  if (!isAdmin) return null;

  return (
    <div className="fixed bottom-10 right-5 sm:right-10">
      <button
        className="bg-transparent border-2 border-white rounded-full p-3 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
        onClick={onDelete}
        aria-label="게시물 삭제"
      >
        <FaTrash size={20} />
      </button>
    </div>
  );
}
