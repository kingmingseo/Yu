import { isHeicFile } from "@/util/fileTypeDetector";
import { convertHeicToWebp } from "@/util/heicImageConvert";
import { compressImage } from "@/util/imageCompression";
import { uploadMultipleImages, uploadSingleImage } from "@/util/imageUpload";
import { getRouteConfig } from "@/util/routeConfig";
import { useRouter } from "next/navigation";
import { useState } from "react";

const MAX_ORIGINAL_UPLOAD_SIZE = 5 * 1024 * 1024;

const processImageForUpload = async (file) => {
  if (file.size <= MAX_ORIGINAL_UPLOAD_SIZE) {
    console.log("5MB 이하 이미지, 원본 업로드:", file.name, file.size);
    return file;
  }

  console.log("5MB 초과 이미지, 압축 후 업로드:", file.name, file.size);

  if (isHeicFile(file)) {
    const convertedFile = await convertHeicToWebp(file);
    return convertedFile.size > MAX_ORIGINAL_UPLOAD_SIZE
      ? await compressImage(convertedFile)
      : convertedFile;
  }

  return await compressImage(file);
};

export function usePostContent({ section, action, category, id, title }) {
  const [contentImageFiles, setContentImageFiles] = useState([]);
  const [mainImageFile, setMainImageFile] = useState(null);
  const [isMainImageUploading, setIsMainImageUploading] = useState(false);
  const [isContentImagesUploading, setIsContentImagesUploading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const router = useRouter()

  const postData = async () => {
    setIsPosting(true);

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
      setIsMainImageUploading(true);
      const processedMainFile = await processImageForUpload(mainImageFile);
      const mainImageUrl = await uploadSingleImage(processedMainFile);
      setIsMainImageUploading(false);

      let contentImageUrls = [];
      if (contentImageFiles.length > 0) {
        setIsContentImagesUploading(true);
        const processedContentFiles = await Promise.all(
          contentImageFiles.map((file) => processImageForUpload(file))
        );
        contentImageUrls = await uploadMultipleImages(processedContentFiles);
        setIsContentImagesUploading(false);
      }

      const config = getRouteConfig(section, action, category, id);

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
        alert("글 작성이 완료되었습니다.");
        router.push(config.redirectPath);
        router.refresh(); 
      } else {
        alert("알 수 없는 오류 [글 작성 실패].");
      }
    } catch (error) {
      console.error("Error posting data:", error);
      alert("데이터 전송 중 오류가 발생했습니다.");
    } finally {
      setIsPosting(false);
      setIsMainImageUploading(false);
      setIsContentImagesUploading(false);
    }
  };

  return {
    postData,
    isPosting,
    isMainImageUploading,
    isContentImagesUploading,
    contentImageFiles,
    mainImageFile,
    setContentImageFiles,
    setMainImageFile,
  };
}
