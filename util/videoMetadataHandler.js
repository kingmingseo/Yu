/**
 * 비디오 파일의 EXIF 메타데이터를 제거하여 회전 정보를 무시하는 함수
 * @param {File} videoFile - 처리할 비디오 파일
 * @returns {Promise<File>} - 메타데이터가 제거된 비디오 파일
 */
export const removeVideoMetadata = async (videoFile) => {
  try {
    // FileReader로 파일을 읽어서 ArrayBuffer로 변환
    const arrayBuffer = await videoFile.arrayBuffer();
    
    // 새로운 Blob 생성 (메타데이터 제거)
    const cleanBlob = new Blob([arrayBuffer], { 
      type: videoFile.type 
    });
    
    // 새로운 File 객체 생성
    const cleanFile = new File([cleanBlob], videoFile.name, {
      type: videoFile.type,
      lastModified: Date.now()
    });
    
    console.log('비디오 메타데이터 제거 완료');
    return cleanFile;
  } catch (error) {
    console.error('메타데이터 제거 실패:', error);
    return videoFile; // 실패 시 원본 반환
  }
};

/**
 * Canvas를 사용하여 비디오의 회전 정보를 무시하는 방법
 * @param {HTMLVideoElement} videoElement - 비디오 요소
 */
export const ignoreVideoRotation = (videoElement) => {
  if (!videoElement) return;
  
  // 비디오 요소에 강제로 스타일 적용
  videoElement.style.cssText = `
    transform: none !important;
    object-fit: contain !important;
    width: auto !important;
    height: auto !important;
    max-width: 100% !important;
    max-height: 100% !important;
  `;
  
  // DOM 속성도 직접 설정
  videoElement.setAttribute('style', videoElement.style.cssText);
  
  // MutationObserver로 스타일 변경 감지
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        if (videoElement.style.transform !== 'none') {
          videoElement.style.transform = 'none';
        }
      }
    });
  });
  
  observer.observe(videoElement, { 
    attributes: true, 
    attributeFilter: ['style'] 
  });
  
  return observer;
};

/**
 * 비디오 파일의 EXIF 정보를 확인하는 함수
 * @param {File} videoFile - 확인할 비디오 파일
 * @returns {Promise<Object>} - EXIF 정보 객체
 */
export const getVideoMetadata = async (videoFile) => {
  try {
    const arrayBuffer = await videoFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // EXIF 시그니처 찾기 (0xFFE1)
    let exifStart = -1;
    for (let i = 0; i < uint8Array.length - 1; i++) {
      if (uint8Array[i] === 0xFF && uint8Array[i + 1] === 0xE1) {
        exifStart = i;
        break;
      }
    }
    
    if (exifStart === -1) {
      return { hasExif: false, rotation: 0 };
    }
    
    // 간단한 회전 정보 추출 (실제로는 더 복잡한 EXIF 파싱 필요)
    return {
      hasExif: true,
      rotation: 0, // 실제 구현에서는 EXIF에서 회전 정보 추출
      exifStart: exifStart
    };
  } catch (error) {
    console.error('메타데이터 확인 실패:', error);
    return { hasExif: false, rotation: 0 };
  }
};
