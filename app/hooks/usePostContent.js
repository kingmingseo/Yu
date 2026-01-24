import { isHeicFile } from "@/util/fileTypeDetector";
import { convertHeicToWebp } from "@/util/heicImageCompression";
import { compressImage } from "@/util/imageCompression";
import { uploadMultipleImages, uploadSingleImage } from "@/util/imageUpload";
import { getRouteConfig } from "@/util/routeConfig";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function usePostContent({ section, action, category, id, title }) {
  const router= useRouter()
  const [contentImageFiles, setContentImageFiles] = useState([]); // 컨텐츠 파일 객체 저장용
  const [mainImageFile, setMainImageFile] = useState(null); // 메인 이미지 파일 객체 저장용

   // 로딩 상태 추가
  const [isMainImageUploading, setIsMainImageUploading] = useState(false);
  const [isContentImagesUploading, setIsContentImagesUploading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const postData = async () => {
    // 로딩 시작
    setIsPosting(true);

    // 입력값 검증
    if (!title) {
      alert("제목을 입력해주세요.");
      setIsPosting(false);
      return;
    }

    if (!mainImageFile) {
      alert("메인 이미지를 선택해주세요.");
      setIsPosting(false);
      return;
    }

    try {
      // 메인 이미지 S3 업로드
      setIsMainImageUploading(true);
      let processedMainFile;

      if (isHeicFile(mainImageFile)) {
        console.log("HEIC 파일 감지, HEIC 압축기 사용");
        processedMainFile = await convertHeicToWebp(mainImageFile);
      } else {
        console.log("일반 이미지 파일, browser-image-compression 사용");
        processedMainFile = await compressImage(mainImageFile);
      }

      const mainImageUrl = await uploadSingleImage(processedMainFile);
      setIsMainImageUploading(false);

      // 컨텐츠 이미지들 S3 업로드
      let contentImageUrls = [];
      if (contentImageFiles.length > 0) {
        setIsContentImagesUploading(true);

        const processedContentFiles = await Promise.all(
          contentImageFiles.map(async (file) => {
            if (isHeicFile(file)) {
              console.log("HEIC 파일 감지, HEIC 압축기 사용");
              return await convertHeicToWebp(file);
            } else {
              console.log("일반 이미지 파일, browser-image-compression 사용");
              return await compressImage(file);
            }
          })
        );

        contentImageUrls = await uploadMultipleImages(processedContentFiles);
        setIsContentImagesUploading(false);
      }

      // 통합 POST API 엔드포인트 생성
      const config = getRouteConfig(section, action, category, id);

      // S3 URL을 포함한 데이터 전송
      const response = await fetch(config.endpoint, {
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
        await fetch("/api/revalidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: config.revalidatePath }),
        });

        alert("글 작성이 완료되었습니다.");
        router.push(config.redirectPath);
      } else {
        alert("알 수 없는 오류 [글 작성 실패].");
      }
    } catch (error) {
      console.error("Error posting data:", error);
      alert("데이터 전송 중 오류가 발생했습니다.");
    } finally {
      // 로딩 종료
      setIsPosting(false);
      setIsMainImageUploading(false);
      setIsContentImagesUploading(false);
    }
  };
  
  return { postData, isPosting, isMainImageUploading, isContentImagesUploading, contentImageFiles, mainImageFile,setContentImageFiles, setMainImageFile };
}