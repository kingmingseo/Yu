"use client";
import VideoDeleteButton from "@/components/common/VideoDeleteButton";
import { useState } from "react";

export default function VideoItem({ item, category }) {
  const [loading, setLoading] = useState(false);

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
            <VideoDeleteButton
              category={category}
              id={item._id}
              onDelete={() => setLoading(true)}
              onDeleteComplete={() => setLoading(false)}
            />
          </div>
          {/* 로딩 스피너 - 삭제 중일 때만 표시 */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
                <p className="text-white mt-4 text-lg font-medium">삭제 중...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
