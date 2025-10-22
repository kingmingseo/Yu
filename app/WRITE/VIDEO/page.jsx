"use client";
import GeneralButton from "@/components/common/GeneralButton";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function VideoWritePage() {
  const [title, setTitle] = useState("");
  const router = useRouter();
  const [mainVideo, setMainVideo] = useState(null); // 미리보기용
  const [mainVideoUrl, setMainVideoUrl] = useState(""); // S3 URL용
  
  // 로딩 상태
  const [isMainVideoUploading, setIsMainVideoUploading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  // Query Parameter 가져오기
  const searchParams = useSearchParams();
  const category = searchParams.get("category"); // mv 또는 video

  // 메인 영상 업로드 함수
  const handleMainVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // 파일 크기 체크 (500MB)
      if (file.size > 500 * 1024 * 1024) {
        alert("영상 파일은 500MB 이하여야 합니다.");
        return;
      }

      // 지원하는 영상 포맷 체크 (더 유연하게)
      const supportedFormats = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo', 'video/avi'];
      const fileExtension = file.name.toLowerCase().split('.').pop();
      const supportedExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi'];
      
      if (!supportedFormats.includes(file.type) && !supportedExtensions.includes(fileExtension)) {
        alert("지원하는 영상 포맷: MP4, WebM, OGG, MOV, AVI");
        return;
      }

      // 로딩 시작
      setIsMainVideoUploading(true);

      try {
        // 미리보기용 URL 생성
        setMainVideo(URL.createObjectURL(file));

        const filename = encodeURIComponent(file.name);
        let res = await fetch("/api/video?file=" + filename);
        res = await res.json();

        const formData = new FormData();
        Object.entries({ ...res.fields, file }).forEach(([key, value]) => {
          formData.append(key, value);
        });

        let uploadResult = await fetch(res.url, {
          method: "POST",
          body: formData
        });

        if (uploadResult.ok) {
          const s3Url = `${uploadResult.url}/${filename}`;
          setMainVideoUrl(s3Url);
        } else {
          console.log(uploadResult);
          alert("영상 업로드에 실패했습니다.");
        }
      } catch (error) {
        console.error("Error uploading video:", error);
        alert("영상 업로드 중 오류가 발생했습니다.");
      } finally {
        // 로딩 종료
        setIsMainVideoUploading(false);
      }
    }
  };

  const postData = async () => {
    // 로딩 시작
    setIsPosting(true);

    // 입력값 검증
    if (!title) {
      alert("제목을 입력해주세요.");
      setIsPosting(false);
      return;
    }

    if (!mainVideoUrl) {
      alert("메인 영상을 업로드해주세요.");
      setIsPosting(false);
      return;
    }

    // 업로드 중인 영상이 있는지 확인
    if (isMainVideoUploading) {
      alert("영상 업로드가 완료될 때까지 기다려주세요.");
      setIsPosting(false);
      return;
    }

    // API 엔드포인트
    const apiEndpoint = `/api/post/${category}`;

    // 리다이렉트 경로
    const redirectPath = `/GALLERY/${category.toUpperCase()}`;

    // S3 URL을 포함한 데이터 전송
    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          mainVideo: mainVideoUrl,
        }),
      });

      if (response.ok) {
        // 캐시 무효화
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: redirectPath })
        });
        
        alert("글 작성이 완료되었습니다.");
        router.push(redirectPath);
      } else {
        alert("알 수 없는 오류 [글 작성 실패].");
      }
    } catch (error) {
      console.error("Error posting data:", error);
      alert("데이터 전송 중 오류가 발생했습니다.");
    } finally {
      // 로딩 종료
      setIsPosting(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-5 bg-black min-h-screen text-white max-w-4xl mx-auto">
      <h1 className="text-2xl font-extralight mb-5">
        New {category?.toUpperCase()} Video
      </h1>

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
          disabled={isPosting}
        />
      </div>

      <div className="mb-5 w-full">
        <label htmlFor="main-video" className="block text-sm font-medium mb-1">
          Main Video
          {isMainVideoUploading && (
            <span className="ml-2 text-yellow-400">업로드 중...</span>
          )}
        </label>
        <input
          type="file"
          id="main-video"
          accept="video/*"
          className="hidden"
          onChange={handleMainVideoUpload}
          disabled={isMainVideoUploading || isPosting}
        />
        <label
          htmlFor="main-video"
          className={`block w-full border border-dashed border-gray-500 rounded p-5 text-center cursor-pointer hover:bg-gray-800 relative ${
            isMainVideoUploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {mainVideo ? (
            <div className="relative group">
              <video
                src={mainVideo}
                controls
                className="mx-auto max-h-48 w-full object-contain"
                playsInline
              />
              {isMainVideoUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
              <div
                className={`absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity ${
                  isMainVideoUploading ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  if (!isMainVideoUploading) {
                    setMainVideo(null); // 메인 영상 제거
                  }
                }}
              >
                <span className="text-white">
                  {isMainVideoUploading ? "업로드 중..." : "Click to Remove"}
                </span>
              </div>
            </div>
          ) : (
            isMainVideoUploading ? "업로드 중..." : "Upload Main Video (MP4, WebM, OGG, MOV)"
          )}
        </label>
      </div>

      <div className="flex w-full">
        <GeneralButton
          label={isPosting ? "Posting..." : "Post"}
          onClick={postData}
          isLoading={isPosting}
          disabled={isPosting}
        />
        
      </div>
    </div>
  );
}
