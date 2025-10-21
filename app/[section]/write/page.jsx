"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function WritePage() {
  const [title, setTitle] = useState("");
  const router = useRouter();
  const [mainImage, setMainImage] = useState(null);  // 미리보기용
  const [mainImageUrl, setMainImageUrl] = useState(''); // S3 URL용
  const [contentImages, setContentImages] = useState([]); // 미리보기용
  const [contentImageUrls, setContentImageUrls] = useState([]); // S3 URL용

  // 동적 라우팅 파라미터 가져오기
  const params = useParams();
  const section = params.section;  
  
  // Query Parameter 가져오기 (GALLERY용 category)
  const searchParams = useSearchParams();
  const category = searchParams.get('category');  // GALLERY일 때만 사용
  
  // 디버깅
  console.log('=== Write Page Debug ===');
  console.log('params:', params);
  console.log('section:', section);
  console.log('category:', category);
  console.log('searchParams:', Object.fromEntries(searchParams.entries()));
  
  const handleMainImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // 미리보기용 URL 생성
      setMainImage(URL.createObjectURL(file));

      // S3 업로드 로직
      try {
        const filename = encodeURIComponent(file.name);
        let res = await fetch('/api/image?file=' + filename);
        res = await res.json();

        const formData = new FormData();
        Object.entries({ ...res.fields, file }).forEach(([key, value]) => {
          formData.append(key, value);
        });

        let uploadResult = await fetch(res.url, {
          method: 'POST',
          body: formData,
        });

        if (uploadResult.ok) {
          const s3Url = `${uploadResult.url}/${filename}`;
          setMainImageUrl(s3Url);
        } else {
          alert('이미지 업로드에 실패했습니다.');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('이미지 업로드 중 오류가 발생했습니다.');
      }
    }
  };

  const handleContentImagesUpload = async (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => URL.createObjectURL(file));
    setContentImages((prev) => [...prev, ...newImages]);

    try {
      const uploadedUrls = await Promise.all(
        files.map(async (file) => {
          const filename = encodeURIComponent(file.name);
          let res = await fetch('/api/image?file=' + filename);
          res = await res.json();

          const formData = new FormData();
          Object.entries({ ...res.fields, file }).forEach(([key, value]) => {
            formData.append(key, value);
          });

          let uploadResult = await fetch(res.url, {
            method: 'POST',
            body: formData,
          });

          if (uploadResult.ok) {
            return `${uploadResult.url}/${filename}`;
          }
          throw new Error('업로드 실패');
        })
      );

      setContentImageUrls((prev) => [...prev, ...uploadedUrls]);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    }
  };

  const postData = async () => {
    // 입력값 검증
    if (!title) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (!mainImageUrl) {
      alert("메인 이미지를 업로드해주세요.");
      return;
    }

    if (contentImageUrls.length === 0) {
      alert("내용 이미지를 최소 하나 업로드해주세요.");
      return;
    }

    // 동적 API 엔드포인트 생성
    const apiEndpoint = section === 'GALLERY' 
      ? `/api/GALLERY/${category}`
      : `/api/${section}/${section.toLowerCase()}`;
    
    // 동적 리다이렉트 경로 생성
    const redirectPath = section === 'GALLERY'
      ? `/GALLERY/${category}`
      : `/${section}`;
      
    // S3 URL을 포함한 데이터 전송
    try {
      const response = await fetch(apiEndpoint, {
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
        router.push(redirectPath);
      } else {
        alert("알 수 없는 오류 [글 작성 실패].");
      }
    } catch (error) {
      console.error("Error posting data:", error);
      alert("데이터 전송 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex flex-col items-center p-5 bg-black min-h-screen text-white max-w-4xl mx-auto">
      <h1 className="text-2xl font-extralight mb-5">New Post</h1>

      <div className="mb-5 w-full">
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title
        </label>
        <input
          type="text"
          id="title"
          className="w-full border border-gray-500 rounded p-2 bg-black text-white placeholder-gray-500"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="mb-5 w-full">
        <label htmlFor="main-image" className="block text-sm font-medium mb-1">
          Main Picture
        </label>
        <input
          type="file"
          id="main-image"
          accept="image/*"
          className="hidden"
          onChange={handleMainImageUpload}
        />
        <label
          htmlFor="main-image"
          className="block w-full border border-dashed border-gray-500 rounded p-5 text-center cursor-pointer hover:bg-gray-800 relative"
        >
          {mainImage ? (
            <div className="relative group">
              <img
                src={mainImage}
                alt="메인 사진"
                className="mx-auto max-h-48 object-contain"
              />
              <div
                className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  setMainImage(null); // 메인 이미지 제거
                }}
              >
                <span className="text-white">Click to Remove</span>
              </div>
            </div>
          ) : (
            "Upload Main Picture"
          )}
        </label>
      </div>

      <div className="mb-5 w-full">
        <label htmlFor="content-images" className="block text-sm font-medium mb-1">
          Content Picture
        </label>
        <input
          type="file"
          id="content-images"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleContentImagesUpload}
        />
        <label
          htmlFor="content-images"
          className="block w-full border border-dashed border-gray-500 rounded p-5 text-center cursor-pointer hover:bg-gray-800"
        >
          UPLOAD YOUR PIC <br></br>(Multiple Items Can Be Selected)
        </label>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {contentImages.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`내용 사진 ${index + 1}`}
                className="w-full h-32 object-cover rounded"
              />
              <div
                className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => {
                  setContentImages(contentImages.filter((_, i) => i !== index));
                  setContentImageUrls(contentImageUrls.filter((_, i) => i !== index));
                }}
              >
                <span className="text-white text-center">Click to Remove</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        className="border w-full border-white text-white px-4 py-2 rounded hover:bg-white hover:text-black transition mx-auto block"
        onClick={postData}
      >
        Post
      </button>
    </div>
  );
}
