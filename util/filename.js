// 고유한 파일명 생성
export function generateUniqueFilename(originalName) {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split(".").pop();
  return `image_${timestamp}_${randomString}.${extension}`;
}
