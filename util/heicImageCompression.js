import heic2any from "heic2any";

export const convertHeicToWebp = async (heicFile) => {
  // HEIC를 JPEG/PNG로 변환
  try {
    const convertedBlob = await heic2any({
      blob: heicFile,
      toType: "image/webp",
      quality: 0.8,
    });

    return new File(
      [convertedBlob],
      heicFile.name.replace(/\.heic$/i, ".webp"),
      {
        type: "image/webp",
      }
    );
  } catch (error) {
    console.error("Error converting HEIC to WebP:", error);
    throw error;
  }
};
