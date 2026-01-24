import { FaTrash } from "react-icons/fa";

/**
 * Presenter Component - 순수 UI, 훅 사용 안 함
 * 스토리북에서 사용
 */
export default function VideoDeleteButtonUI({ onDelete, isAdmin }) {
  // 관리자가 아니면 버튼 숨김
  if (!isAdmin) return null;

  return (
    <button
      className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2 transition-all"
      onClick={onDelete}
      aria-label="영상 삭제"
    >
      <FaTrash size={16} />
    </button>
  );
}
