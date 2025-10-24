import { generateUniqueFilename } from "./filename";
import { compressImage } from "./imageCompression";

/**
 * 단일 이미지를 S3에 업로드하는 함수
 * @param {File} file - 업로드할 이미지 파일
 * @returns {Promise<string>} - 업로드된 이미지의 S3 URL
 */
export const uploadSingleImage = async (file) => {
  try {
    // 이미지 압축
    const compressedFile = await compressImage(file);

    const uniqueFilename = generateUniqueFilename(compressedFile.name);
    const filename = encodeURIComponent(
      uniqueFilename.replace(/\.[^/.]+$/, ".webp")
    );

    // S3 업로드 URL 요청
    let res = await fetch("/api/image?file=" + filename);
    res = await res.json();

    const formData = new FormData();
    Object.entries({ ...res.fields, file: compressedFile }).forEach(
      ([key, value]) => {
        formData.append(key, value);
      }
    );

    let uploadResult = await fetch(res.url, {
      method: "POST",
      body: formData,
    });

    if (uploadResult.ok) {
      return `${uploadResult.url}/${filename}`;
    } else {
      throw new Error("이미지 업로드에 실패했습니다.");
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

/**
 * 여러 이미지를 S3에 업로드하는 함수
 * @param {File[]} files - 업로드할 이미지 파일들
 * @returns {Promise<string[]>} - 업로드된 이미지들의 S3 URL 배열
 */
export const uploadMultipleImages = async (files) => {
  try {
    // 모든 파일을 압축
    const compressedFiles = await Promise.all(
      files.map((file) => compressImage(file))
    );

    const uploadedUrls = await Promise.all(
      compressedFiles.map(async (file) => {
        const uniqueFilename = generateUniqueFilename(file.name);
        const filename = encodeURIComponent(
          uniqueFilename.replace(/\.[^/.]+$/, ".webp")
        );

        let res = await fetch("/api/image?file=" + filename);
        res = await res.json();

        const formData = new FormData();
        Object.entries({ ...res.fields, file }).forEach(([key, value]) => {
          formData.append(key, value);
        });

        let uploadResult = await fetch(res.url, {
          method: "POST",
          body: formData,
        });

        if (uploadResult.ok) {
          return `${uploadResult.url}/${filename}`;
        }
        console.log(uploadResult);
        throw new Error("업로드 실패");
      })
    );

    return uploadedUrls;
  } catch (error) {
    console.error("Error uploading images:", error);
    throw error;
  }
};
