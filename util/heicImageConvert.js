import heic2any from "heic2any";

export const convertHeicToWebp = async (heicFile) => {
  // HEIC를 webp로 변환
  try {
    const convertedBlob = await heic2any({
      blob: heicFile,
      toType: "image/webp",
      quality: 1.0,
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
