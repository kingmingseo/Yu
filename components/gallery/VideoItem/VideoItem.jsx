"use client";
import VideoDeleteButtonContainer from "@/components/common/VideoDeleteButton/VideoDeleteButtonContainer";
import VideoDeleteButtonUI from "@/components/common/VideoDeleteButton/VideoDeleteButtonUI";
import { useState } from "react";

/**
 * VideoItem - 실제 앱과 스토리북 둘 다 사용
 * 
 * @param {object} item - 비디오 데이터
 * @param {string} category - 카테고리
 * @param {boolean} [isAdmin] - 관리자 여부 (스토리북용, 선택적)
 * @param {function} [onDelete] - 삭제 핸들러 (스토리북용, 선택적)
 */
export default function VideoItem({ item, category, isAdmin, onDelete }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = () => {
    setLoading(true);
    if (onDelete) {
      onDelete();
    }
  };

  // isAdmin과 onDelete가 제공되면 스토리북 모드 (UI만 사용)
  const isStorybookMode = isAdmin !== undefined && onDelete !== undefined;

  return (
    <div className="relative group w-full flex justify-center">
      <div className="w-5/6 max-w-3xl">
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={
              item.embedUrl || `https://www.youtube.com/embed/${item.videoId}`
            }
            title={item.title || "YouTube 영상"}
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          {/* 영상 우상단에 삭제 버튼 */}
          <div className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
            {isStorybookMode ? (
              // 스토리북 모드: UI만 사용
              <VideoDeleteButtonUI
                onDelete={handleDelete}
                isAdmin={isAdmin}
              />
            ) : (
              // 실제 앱 모드: Container 사용
              <VideoDeleteButtonContainer
                category={category}
                id={item._id}
                onDelete={() => setLoading(true)}
                onDeleteComplete={() => setLoading(false)}
              />
            )}
          </div>
          {/* 로딩 스피너 - 삭제 중일 때만 표시 */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
              <div className="flex flex-col items-center">
                <p className="text-white mt-4 text-lg font-medium">
                  삭제 중...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
