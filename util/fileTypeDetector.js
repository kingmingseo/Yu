/**
 * 파일 확장자가 HEIC인지 확인하는 함수
 * @param {File} file - 확인할 파일
 * @returns {boolean} - HEIC 파일 여부
 */
export const isHeicFile = (file) => {
  const fileName = file.name.toLowerCase();
  return fileName.endsWith('.heic') || fileName.endsWith('.heif');
};
