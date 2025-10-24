import imageCompression from "browser-image-compression";

/**
 * 이미지를 압축하는 함수
 * @param {File} file - 압축할 이미지 파일
 * @returns {Promise<File>} - 압축된 이미지 파일
 */
export const compressImage = async (file) => {
  const options = {
    maxSizeMB: 1, // 최대 파일 크기 1MB
    maxWidthOrHeight: 1920, // 최대 해상도 1920px
    useWebWorker: false, // 웹 워커 비활성화 (타임아웃 방지)
    fileType: 'image/webp', // WebP 포맷으로 변환
    quality: 0.7, // 품질 70% (더 강한 압축)
    initialQuality: 0.8, // 초기 품질
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

/**
 * 여러 이미지를 동시에 압축하는 함수
 * @param {File[]} files - 압축할 이미지 파일들
 * @returns {Promise<File[]>} - 압축된 이미지 파일들
 */
export const compressImages = async (files) => {
  return await Promise.all(
    files.map(file => compressImage(file))
  );
};
