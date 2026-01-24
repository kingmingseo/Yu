"use client";
import GeneralButton from "@/components/common/GeneralButton";
import { useParams, useSearchParams } from "next/navigation";
import { usePostContent } from "@/app/hooks/usePostContent";
import { useState, useEffect } from "react";

export default function WritePage() {
  const [title, setTitle] = useState("");
  // 동적 라우팅 파라미터 가져오기
  const params = useParams();
  const section = params.section;
  
  // Query Parameter 가져오기
  const searchParams = useSearchParams();
  const category = searchParams.get("category"); 
  const id = searchParams.get("id"); 

  //미리보기용 이미지 
  const [mainImage, setMainImage] = useState(null);
  const [contentImages, setContentImages] = useState([]);

  const { postData, isPosting, isMainImageUploading, isContentImagesUploading, contentImageFiles, mainImageFile,setContentImageFiles, setMainImageFile } = usePostContent({ section, action: "create", category, id, title });


  

  // 컴포넌트 언마운트 시 메모리 해제
  useEffect(() => {
    return () => {
      if (mainImage) {
        URL.revokeObjectURL(mainImage);
      }
      contentImages.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [mainImage, contentImages]);

  const handleMainImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 기존 URL 메모리 해제
      if (mainImage) {
        URL.revokeObjectURL(mainImage);
      }
      // 미리보기용 URL만 생성 (S3 업로드 X)
      setMainImage(URL.createObjectURL(file));
      // 파일 객체를 상태에 저장 (Post 시 사용)
      setMainImageFile(file);
    }
  };

  const handleContentImagesUpload = (e) => {
    const files = Array.from(e.target.files);

    // 미리보기용 URL만 생성 (S3 업로드 X)
    const newImages = files.map((file) => URL.createObjectURL(file));
    setContentImages((prev) => [...prev, ...newImages]);
    // 파일 객체들을 상태에 저장 (Post 시 사용)
    setContentImageFiles((prev) => [...prev, ...files]);
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
          className={`block w-full border border-dashed border-gray-500 rounded p-5 text-center cursor-pointer hover:bg-gray-800 relative ${isMainImageUploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
          {mainImage ? (
            <div className="relative group">
              <img
                src={mainImage}
                alt="메인 사진"
                className="mx-auto max-h-64 w-full object-contain"
              />
              {isMainImageUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
              <div
                className={`absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity ${isMainImageUploading ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                onClick={(e) => {
                  e.preventDefault();
                  if (!isMainImageUploading) {
                    // 메인 이미지 URL 메모리 해제
                    URL.revokeObjectURL(mainImage);
                    setMainImage(null); // 메인 이미지 제거
                    setMainImageFile(null); // 파일 객체도 제거
                  }
                }}
              >
                <span className="text-white">
                  {isMainImageUploading ? "업로드 중..." : "Click to Remove"}
                </span>
              </div>
            </div>
          ) : isMainImageUploading ? (
            "업로드 중..."
          ) : (
            "Upload Main Picture"
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
          className={`block w-full border border-dashed border-gray-500 rounded p-5 text-center cursor-pointer hover:bg-gray-800 ${isContentImagesUploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
          {isContentImagesUploading
            ? "업로드 중..."
            : "UPLOAD YOUR PIC (Multiple Items Can Be Selected)"}
        </label>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {contentImages.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`내용 사진 ${index + 1}`}
                className="w-full h-32 object-contain rounded bg-gray-800"
              />
              {isContentImagesUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
              <div
                className={`absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity ${isContentImagesUploading
                  ? "cursor-not-allowed"
                  : "cursor-pointer"
                  }`}
                onClick={() => {
                  if (!isContentImagesUploading) {
                    // 삭제할 이미지 URL 메모리 해제
                    URL.revokeObjectURL(contentImages[index]);
                    setContentImages(
                      contentImages.filter((_, i) => i !== index)
                    );
                    setContentImageFiles(
                      contentImageFiles.filter((_, i) => i !== index)
                    );
                  }
                }}
              >
                <span className="text-white text-center">
                  {isContentImagesUploading
                    ? "업로드 중..."
                    : "Click to Remove"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <GeneralButton
        label="Post"
        ariaLabel="Post"
        onClick={postData}
        isLoading={
          isPosting || isMainImageUploading || isContentImagesUploading
        }
      />
    </div>
  );
}
