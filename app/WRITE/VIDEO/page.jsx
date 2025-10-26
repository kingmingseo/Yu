"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GeneralButton from "@/components/common/GeneralButton";
import Script from "next/script";
import getYouTubeToken from "@/util/getYoutubeToken";

function VideoWriteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "VIDEO"; // MV | VIDEO
  const [title, setTitle] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="flex flex-col items-center p-5 bg-black min-h-screen text-white max-w-4xl mx-auto">
      {/* Google Identity Services for OAuth token client (YouTube upload) */}
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
      />
      <h1 className="text-2xl font-extralight mb-5">New Video</h1>
      {/* 제목 입력 */}
      <div className="mb-5 w-full">
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title
        </label>
        <input
          type="text"
          id="title"
          className="w-full border border-gray-500 rounded p-2 bg-black text-white placeholder-gray-500"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isUploading}
        />
      </div>

      {/* 영상 파일 업로드 */}
      <div className="mb-5 w-full">
        <label htmlFor="video-file" className="block text-sm font-medium mb-1">
          Video File
        </label>
        <input
          type="file"
          id="video-file"
          accept="video/*"
          className="hidden"
          onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
          disabled={isUploading}
        />
        <label
          htmlFor="video-file"
          className={`block w-full border border-dashed border-gray-500 rounded p-5 text-center cursor-pointer hover:bg-gray-800 ${
            isUploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {videoFile ? (
            <div className="relative group">
              <p className="text-white">{videoFile.name}</p>
              <div
                className={`mt-2 text-sm ${
                  isUploading ? "cursor-not-allowed" : "cursor-pointer"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  if (!isUploading) {
                    setVideoFile(null);
                  }
                }}
              >
                <span className="text-gray-400 hover:text-white">
                  {isUploading ? "업로드 중..." : "Click to Remove"}
                </span>
              </div>
            </div>
          ) : isUploading ? (
            "업로드 중..."
          ) : (
            "Select Video File"
          )}
        </label>
      </div>
      <GeneralButton
        label="Post"
        ariaLabel="Post"
        onClick={async () => {
          if (!title) {
            alert("제목을 입력해주세요.");
            return;
          }
          if (!videoFile) {
            alert("영상 파일을 선택해주세요.");
            return;
          }
          if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
            alert("NEXT_PUBLIC_GOOGLE_CLIENT_ID 환경변수가 필요합니다.");
            return;
          }

          setIsUploading(true);
          try {
            // OAuth 토큰 발급
            const accessToken = await getYouTubeToken();

            // 업로드 메타데이터
            const metadata = {
              snippet: { title: title || videoFile.name },
              status: { privacyStatus: "public" },
            };

            // 1) 업로드 세션 생성
            const initRes = await fetch(
              "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json; charset=UTF-8",
                  "X-Upload-Content-Length": String(videoFile.size),
                  "X-Upload-Content-Type": videoFile.type || "video/*",
                },
                body: JSON.stringify(metadata),
              }
            );
            if (!initRes.ok) throw new Error("업로드 세션 생성 실패");
            const uploadUrl = initRes.headers.get("location");
            if (!uploadUrl) throw new Error("업로드 URL 없음");

            // 2) 실제 업로드
            const uploadRes = await fetch(uploadUrl, {
              method: "PUT",
              headers: { "Content-Type": videoFile.type || "video/*" },
              body: videoFile,
            });
            if (!uploadRes.ok) throw new Error("비디오 업로드 실패");
            const json = await uploadRes.json();
            const videoId = json.id;

            // 업로드 성공 → 메타 저장 호출
            const saveRes = await fetch("/api/youtube/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ videoId, category }),
            });
            if (!saveRes.ok) {
              const t = await saveRes.text();
              throw new Error(`저장 실패: ${t}`);
            }

            // 캐시 무효화
            await fetch("/api/revalidate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                path: `/GALLERY/${category.toUpperCase}`,
              }),
            });

            alert("영상이 성공적으로 업로드되었습니다.");
            router.push(`/GALLERY/${category}`);
          } catch (e) {
            alert(`업로드 실패: ${e.message}`);
          } finally {
            setIsUploading(false);
          }
        }}
        isLoading={isUploading}
      />
    </div>
  );
}

export default function VideoWritePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-black text-white">
          Loading...
        </div>
      }
    >
      <VideoWriteContent />
    </Suspense>
  );
}
