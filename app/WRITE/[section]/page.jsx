"use client";
import GeneralButton from "@/components/common/GeneralButton";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import imageCompression from "browser-image-compression";

export default function WritePage() {
  const [title, setTitle] = useState("");
  const router = useRouter();
  const [mainImage, setMainImage] = useState(null); // 미리보기용
  const [mainImageUrl, setMainImageUrl] = useState(""); // S3 URL용
  const [contentImages, setContentImages] = useState([]); // 미리보기용
  const [contentImageUrls, setContentImageUrls] = useState([]); // S3 URL용
  
  // 로딩 상태 추가
  const [isMainImageUploading, setIsMainImageUploading] = useState(false);
  const [isContentImagesUploading, setIsContentImagesUploading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  
  // 업로드 취소를 위한 AbortController
  const [mainImageAbortController, setMainImageAbortController] = useState(null);
  const [contentImagesAbortController, setContentImagesAbortController] = useState(null);

  // 동적 라우팅 파라미터 가져오기
  const params = useParams();
  const section = params.section;

  // Query Parameter 가져오기 (GALLERY용 category)
  const searchParams = useSearchParams();
  const category = searchParams.get("category"); // GALLERY일 때만 사용

  // 이미지 압축 함수
  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1, // 최대 파일 크기 500KB (더 작게)
      maxWidthOrHeight: 1920, // 최대 해상도 1920px
      useWebWorker: false, // 웹 워커 비활성화 (타임아웃 방지)
      fileType: 'image/webp', // WebP 포맷으로 변환
      quality: 0.6, // 품질 60% (더 강한 압축)
      initialQuality: 0.7, // 초기 품질
      alwaysKeepResolution: false, // 해상도 조정 허용
    };

    try {
      // 모든 파일을 압축
      console.log('이미지 압축 시작...');
      const compressedFile = await imageCompression(file, options);
      console.log('압축 전:', file.size, 'bytes');
      console.log('압축 후:', compressedFile.size, 'bytes');
      console.log('압축률:', ((1 - compressedFile.size / file.size) * 100).toFixed(1) + '%');
      return compressedFile;
    } catch (error) {
      console.error('이미지 압축 실패:', error);
      console.log('원본 파일로 진행');
      return file; // 압축 실패 시 원본 파일 반환
    }
  };

  const handleMainImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // 기존 업로드 취소
      if (mainImageAbortController) {
        mainImageAbortController.abort();
      }
      
      // 새로운 AbortController 생성
      const abortController = new AbortController();
      setMainImageAbortController(abortController);
      
      // 로딩 시작
      setIsMainImageUploading(true);

      // S3 업로드 로직
      try {
        // 이미지 압축
        const compressedFile = await compressImage(file);
        
        // 미리보기용 URL 생성 (압축된 파일로)
        setMainImage(URL.createObjectURL(compressedFile));
        
        const filename = encodeURIComponent(compressedFile.name.replace(/\.[^/.]+$/, ".webp"));
        let res = await fetch("/api/image?file=" + filename, {
          signal: abortController.signal
        });
        res = await res.json();

        const formData = new FormData();
        Object.entries({ ...res.fields, file: compressedFile }).forEach(([key, value]) => {
          formData.append(key, value);
        });

        let uploadResult = await fetch(res.url, {
          method: "POST",
          body: formData,
          signal: abortController.signal
        });

        if (uploadResult.ok) {
          const s3Url = `${uploadResult.url}/${filename}`;
          setMainImageUrl(s3Url);
        } else {
          alert("이미지 업로드에 실패했습니다.");
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log("메인 이미지 업로드가 취소되었습니다.");
        } else {
          console.error("Error uploading image:", error);
          alert("이미지 업로드 중 오류가 발생했습니다.");
        }
      } finally {
        // 로딩 종료
        setIsMainImageUploading(false);
        setMainImageAbortController(null);
      }
    }
  };

  const handleContentImagesUpload = async (e) => {
    const files = Array.from(e.target.files);

    // 기존 업로드 취소
    if (contentImagesAbortController) {
      contentImagesAbortController.abort();
    }
    
    // 새로운 AbortController 생성
    const abortController = new AbortController();
    setContentImagesAbortController(abortController);

    // 로딩 시작
    setIsContentImagesUploading(true);

    try {
      // 모든 파일을 압축
      const compressedFiles = await Promise.all(
        files.map(file => compressImage(file))
      );
      
      // 미리보기용 URL 생성 (압축된 파일들로)
      const newImages = compressedFiles.map(file => URL.createObjectURL(file));
      setContentImages(prev => [...prev, ...newImages]);

      const uploadedUrls = await Promise.all(
        compressedFiles.map(async (file) => {
          const filename = encodeURIComponent(file.name.replace(/\.[^/.]+$/, ".webp"));
          let res = await fetch("/api/image?file=" + filename, {
            signal: abortController.signal
          });
          res = await res.json();

          const formData = new FormData();
          Object.entries({ ...res.fields, file }).forEach(([key, value]) => {
            formData.append(key, value);
          });

          let uploadResult = await fetch(res.url, {
            method: "POST",
            body: formData,
            signal: abortController.signal
          });

          if (uploadResult.ok) {
            return `${uploadResult.url}/${filename}`;
          }
          throw new Error("업로드 실패");
        })
      );

      setContentImageUrls((prev) => [...prev, ...uploadedUrls]);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log("컨텐츠 이미지 업로드가 취소되었습니다.");
      } else {
        console.error("Error uploading images:", error);
        alert("이미지 업로드 중 오류가 발생했습니다.");
      }
    } finally {
      // 로딩 종료
      setIsContentImagesUploading(false);
      setContentImagesAbortController(null);
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

    if (!mainImageUrl) {
      alert("메인 이미지를 업로드해주세요.");
      setIsPosting(false);
      return;
    }

    // 업로드 중인 이미지가 있는지 확인
    if (isContentImagesUploading) {
      alert("컨텐츠 이미지 업로드가 완료될 때까지 기다려주세요.");
      setIsPosting(false);
      return;
    }


    // 통합 POST API 엔드포인트 생성
    const collection = section === "GALLERY" ? category.toLowerCase() : section.toLowerCase();
    const apiEndpoint = `/api/post/${collection}`;

    // 동적 리다이렉트 경로 생성
    const redirectPath =
      section === "GALLERY" ? `/GALLERY/${category}` : `/${section}`;



    // S3 URL을 포함한 데이터 전송
    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          mainImage: mainImageUrl,
          contentImages: contentImageUrls,
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
      <h1 className="text-2xl font-extralight mb-5">New Post</h1>

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
        <label htmlFor="main-image" className="block text-sm font-medium mb-1">
          Main Picture
          {isMainImageUploading && (
            <span className="ml-2 text-yellow-400">업로드 중...</span>
          )}
        </label>
        <input
          type="file"
          id="main-image"
          accept="image/*"
          className="hidden"
          onChange={handleMainImageUpload}
          disabled={isMainImageUploading || isPosting}
        />
        <label
          htmlFor="main-image"
          className={`block w-full border border-dashed border-gray-500 rounded p-5 text-center cursor-pointer hover:bg-gray-800 relative ${
            isMainImageUploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {mainImage ? (
            <div className="relative group">
              <img
                src={mainImage}
                alt="메인 사진"
                className="mx-auto max-h-48 object-contain"
              />
              {isMainImageUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
              <div
                className={`absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity ${
                  isMainImageUploading ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  if (!isMainImageUploading) {
                    setMainImage(null); // 메인 이미지 제거
                  }
                }}
              >
                <span className="text-white">
                  {isMainImageUploading ? "업로드 중..." : "Click to Remove"}
                </span>
              </div>
            </div>
          ) : (
            isMainImageUploading ? "업로드 중..." : "Upload Main Picture"
          )}
        </label>
      </div>

      <div className="mb-5 w-full">
        <label
          htmlFor="content-images"
          className="block text-sm font-medium mb-1"
        >
          Content Picture (선택사항)
          {isContentImagesUploading && (
            <span className="ml-2 text-yellow-400">업로드 중...</span>
          )}
        </label>
        <input
          type="file"
          id="content-images"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleContentImagesUpload}
          disabled={isContentImagesUploading || isPosting}
        />
        <label
          htmlFor="content-images"
          className={`block w-full border border-dashed border-gray-500 rounded p-5 text-center cursor-pointer hover:bg-gray-800 ${
            isContentImagesUploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isContentImagesUploading ? "업로드 중..." : "UPLOAD YOUR PIC (Multiple Items Can Be Selected)"}
        </label>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {contentImages.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`내용 사진 ${index + 1}`}
                className="w-full h-32 object-cover rounded"
              />
              {isContentImagesUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
              <div
                className={`absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity ${
                  isContentImagesUploading ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
                onClick={() => {
                  if (!isContentImagesUploading) {
                    setContentImages(contentImages.filter((_, i) => i !== index));
                    setContentImageUrls(
                      contentImageUrls.filter((_, i) => i !== index)
                    );
                  }
                }}
              >
                <span className="text-white text-center">
                  {isContentImagesUploading ? "업로드 중..." : "Click to Remove"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <GeneralButton 
        label="Post" 
        onClick={postData}
        isLoading={isPosting || isMainImageUploading || isContentImagesUploading}
      />
    </div>
  );
}
