"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { generateUniqueFilename } from "@/util/filename";
import GeneralButton from "@/components/common/GeneralButton";

export default function AboutMeUpdate() {
  const router = useRouter();
  const [images, setImages] = useState(Array(5).fill(""));
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const getIntro = async () => {
    try {
      const response = await fetch("/api/aboutme", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.length > 0) {
          // index 순서대로 이미지 배열 생성
          const newImages = Array(5).fill("");
          result.forEach((item) => {
            if (item.index !== undefined && item.index >= 0 && item.index < 5) {
              newImages[item.index] = item.src || "";
            }
          });
          setImages(newImages);
        }
      } else {
        console.error("Failed to fetch intro:", response.status);
      }
    } catch (error) {
      console.error("Error fetching intro:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateIntro = async () => {
    setIsUpdating(true);
    try {
      // 각 이미지를 개별적으로 처리
      for (let i = 0; i < images.length; i++) {
        if (images[i]) {
          let imageUrl = images[i];

          // 파일 객체인 경우 S3에 업로드
          if (typeof images[i] !== "string") {
            const uniqueFilename = generateUniqueFilename(images[i].name);
            let filename = encodeURIComponent(uniqueFilename);
            let res = await fetch("/api/image?file=" + filename);
            res = await res.json();

            const formData = new FormData();
            Object.entries({ ...res.fields, file: images[i] }).forEach(
              ([key, value]) => {
                formData.append(key, value);
              }
            );

            let 업로드결과 = await fetch(res.url, {
              method: "POST",
              body: formData,
            });

            if (업로드결과.ok) {
              imageUrl = 업로드결과.url + "/" + filename;
            } else {
              console.error(`Failed to upload image ${i + 1}`);
              continue;
            }
          }

          // DB에 저장
          const response = await fetch("/api/aboutme", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              src: imageUrl,
              index: i,
            }),
          });

          if (!response.ok) {
            console.error(`Failed to save image ${i + 1}`);
          }
        }
      }

      alert("수정이 완료 되었습니다");
      await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "/ABOUTME" }),
      });
      router.push("/ABOUTME");
    } catch (error) {
      console.error("Error updating intro:", error);
      alert("An error occurred.");
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    getIntro();
  }, []);

  const handleImageUpload = (file, index) => {
    // 파일 객체만 저장하고 S3 업로드는 POST 시에만
    setUploadingIndex(index);
    const newImages = [...images];
    newImages[index] = file; // 파일 객체 저장
    setImages(newImages);

    // 업로드 시뮬레이션 (실제로는 POST 시에 업로드)
    setTimeout(() => {
      setUploadingIndex(null);
    }, 1000);
  };

  const handleImageDelete = async (index) => {
    if (confirm(`이미지 ${index + 1}을 삭제하시겠습니까?`)) {
      try {
        const response = await fetch("/api/aboutme", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ index: index }),
        });

        if (response.ok) {
          const newImages = [...images];
          newImages[index] = "";
          setImages(newImages);

          // 캐시 무효화
          await fetch("/api/revalidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: "/ABOUTME" }),
          });

          console.log(`Image at index ${index} deleted successfully`);
          alert("이미지가 삭제되었습니다.");
        } else {
          const errorData = await response.json();
          console.error("Delete failed:", errorData);
          alert(
            `이미지 삭제에 실패했습니다: ${
              errorData.message || "Unknown error"
            }`
          );
        }
      } catch (error) {
        console.error("Error deleting image:", error);
        alert("이미지 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* 헤더 */}
        <div className="mb-12">
          <h1 className="text-3xl font-extralight mb-4">About Me 수정</h1>
          <p className="text-sm font-extralight text-gray-400">
            프로필 이미지를 업로드하세요 (최대 5개)
          </p>
        </div>

        {/* 이미지 업로드 섹션 */}
        <div className="mb-12">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center space-y-4">
                <svg
                  className="animate-spin h-8 w-8 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                <span className="text-sm text-gray-400 font-extralight">
                  이미지 로딩 중...
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="relative group">
                  <div className="relative w-full h-64 bg-gray-800 border-2 border-dashed border-gray-600 overflow-hidden">
                    {uploadingIndex === index ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center space-y-3">
                          <svg
                            className="animate-spin h-6 w-6 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8H4z"
                            ></path>
                          </svg>
                          <span className="text-xs text-gray-400">
                            업로드 중...
                          </span>
                        </div>
                      </div>
                    ) : images[index] ? (
                      <img
                        src={
                          typeof images[index] === "string"
                            ? images[index]
                            : URL.createObjectURL(images[index])
                        }
                        alt={`Profile Image ${index + 1}`}
                        className="w-full h-full object-contain bg-gray-900"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <span>이미지 {index + 1}</span>
                      </div>
                    )}

                    {uploadingIndex !== index && (
                      <>
                        <label
                          htmlFor={`image-upload-${index}`}
                          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <span className="text-white text-sm">
                            클릭하여 업로드
                          </span>
                        </label>

                        {/* 삭제 버튼 */}
                        {images[index] && (
                          <button
                            onClick={() => handleImageDelete(index)}
                            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="이미지 삭제"
                          >
                            ×
                          </button>
                        )}
                      </>
                    )}

                    <input
                      id={`image-upload-${index}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingIndex === index}
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleImageUpload(e.target.files[0], index);
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    이미지 {index + 1}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 업데이트 버튼 */}
        <div className="flex justify-center">
          <div className="w-48">
            <GeneralButton
              onClick={updateIntro}
              label="업데이트"
              ariaLabel="About Me 업데이트"
              isLoading={isUpdating}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
