# ISR(Incremental Static Regeneration) 트러블슈팅

## 문제 상황

초기에는 `revalidate = false`와 `revalidate`의 캐시 무효화 시점만 조절하면 ISR이 적용될 줄 알았습니다. 하지만 실제로는 여러 추가 설정이 필요했습니다.

## 핵심 발견사항

### 1. 페이지는 서버 컴포넌트여야 함

```7:7:app/GALLERY/[category]/page.jsx
export const revalidate = false;
```

**문제**: 페이지 전체가 서버 컴포넌트로 렌더링되어야 ISR이 작동합니다.

**해결**: 페이지 컴포넌트를 서버 컴포넌트로 유지하고, 필요한 곳에만 클라이언트 컴포넌트를 사용합니다.

### 2. 동적 라우팅에서는 `generateStaticParams` 필수

```9:21:app/GALLERY/[category]/page.jsx
export async function generateStaticParams() {
  const categories = [
    "LOOKBOOK",
    "POLAROID",
    "BEAUTY",
    "MEDIA",
    "MV",
    "VIDEO",
    "MAGAZINE",
    "PROFILE",
  ];
  return categories.map((category) => ({ category }));
}
```

**문제**: 동적 라우팅(`[category]`)에서 ISR을 사용하려면 빌드 타임에 모든 경로를 생성해야 합니다.

**해결**: `generateStaticParams` 함수를 export하여 빌드 타임에 생성할 경로 목록을 정의합니다.

**동작 방식**:
- 빌드 시: 8개 카테고리 페이지가 정적으로 생성됨
- 런타임: `revalidate = false`이므로 캐시된 페이지 제공
- 캐시 무효화: `/api/revalidate`에서 `revalidatePath()` 호출 시 재생성

### 3. `useSession`은 클라이언트 전용 기능 사용

```1:11:components/common/AddButton.jsx
"use client";
import Link from "next/link";
import { FaPen } from "react-icons/fa";
import { useSession } from "next-auth/react";

export default function AddButton({ category, variant = 'gallery' }) {
  const { data } = useSession();
  const isAdmin = !!data?.user?.admin;

  // 관리자가 아니면 버튼 숨김
  if (!isAdmin) return null;
```

**문제**: 
- `useSession`은 `"use client"` 지시어가 필요합니다 (클라이언트 훅)
- 서버 컴포넌트에서 직접 사용 불가능
- 페이지 전체를 클라이언트 컴포넌트로 만들면 ISR이 작동하지 않음

**해결**: 
- 관리자 전용 버튼을 별도의 클라이언트 컴포넌트로 분리
- 클라이언트 컴포넌트 내부에서만 세션 검증 수행
- 서버 컴포넌트에서 클라이언트 컴포넌트를 import하여 사용

**구조**:
```
Server Component (page.jsx)
  └── Client Component (AddButton.jsx) - useSession 사용
```

### 4. 캐시 무효화 처리

```1:22:app/api/revalidate/route.js
import { revalidatePath } from 'next/cache';

export async function POST(request) {
  try {
    const { path } = await request.json();
    
    if (!path) {
      return Response.json({ message: 'Path is required' }, { status: 400 });
    }

    revalidatePath(path);
    
    return Response.json({ 
      message: 'Path revalidated successfully',
      path: path 
    });
  } catch (error) {
    console.error('Error revalidating path:', error);
    return Response.json({ 
      message: 'Error revalidating path' 
    }, { status: 500 });
  }
}
```

**문제**: ISR 페이지는 캐시되어 있으므로, 데이터 변경 시 캐시를 무효화해야 합니다.

**해결**: 
- 삭제/수정 작업 후 `/api/revalidate` 엔드포인트 호출
- `revalidatePath()`로 해당 경로의 캐시 무효화
- 다음 요청 시 페이지 재생성

## 최종 구조

### Gallery 페이지 (서버 컴포넌트)

```23:77:app/GALLERY/[category]/page.jsx
export default async function Gallery({ params }) {
  const { category } = await params;

  const client = await connectDB;
  const db = client.db("Yu");

  let data;

  // M/V나 VIDEO 카테고리인 경우 통합 컬렉션에서 가져오기
  if (category === "MV" || category === "VIDEO") {
    data = await db
      .collection("youtube_videos")
      .find({ category: category })
      .sort({ _id: -1 }) // _id 기준으로 내림차순 정렬 (최신 데이터가 먼저)
      .toArray();
  } else {
    // 다른 카테고리는 기존 방식 유지
    data = await db
      .collection(category.toLowerCase())
      .find()
      .sort({ _id: -1 })
      .toArray();
  }

  // MongoDB ObjectId를 문자열로 변환하여 직렬화
  const serializedData = data.map((item) => ({
    ...item,
    _id: item._id.toString(),
    createdAt: item.createdAt ? item.createdAt.toISOString() : null,
    updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null,
  }));

  return (
    <>
      {/* 비디오나 MV카테고리인 경우 모바일에서는 1열로 보여주고 데스크탑은 기존2열 유지 */}
      <div
        className={`px-4 grid gap-x-6 sm:gap-y-32 gap-y-16 pb-32 sm:mt-10 mt-5 justify-between ${
          category === "MV" || category === "VIDEO"
            ? "grid-cols-1 sm:grid-cols-2"
            : "grid-cols-2"
        }`}
      >
        {serializedData && serializedData.length > 0 ? (
          // 게시물이 있을 경우
          serializedData.map((item, index) => (
            <GalleryItem key={index} item={item} category={category} />
          ))
        ) : (
          // 게시물이 없을 경우
          <EmptyState />
        )}
        <AddButton category={category} />
      </div>
    </>
  );
}
```

### AddButton (클라이언트 컴포넌트)

```1:36:components/common/AddButton.jsx
"use client";
import Link from "next/link";
import { FaPen } from "react-icons/fa";
import { useSession } from "next-auth/react";

export default function AddButton({ category, variant = 'gallery' }) {
  const { data } = useSession();
  const isAdmin = !!data?.user?.admin;

  // 관리자가 아니면 버튼 숨김
  if (!isAdmin) return null;
  const isVideoCategory = category === "MV" || category === "VIDEO";
  const isAbout = variant === 'aboutme';

  const href = isAbout
    ? "/ABOUTME/update"
    : isVideoCategory
      ? `/WRITE/VIDEO?category=${category}`
      : `/WRITE/GALLERY?category=${category}`;

  const ariaLabel = isAbout
    ? "소개 페이지 편집"
    : isVideoCategory ? "영상 업로드" : "갤러리 게시물 작성";

  return (
    <div className="fixed bottom-10 right-5 sm:right-10">
      <Link href={href}>
        <button
          className="bg-transparent border-2 border-white rounded-full p-3 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
          aria-label={ariaLabel}
        >
          <FaPen size={20} />
        </button>
      </Link>
    </div>
  );
}
```

## 핵심 포인트 요약

1. ✅ **서버 컴포넌트 유지**: ISR을 위해 페이지는 반드시 서버 컴포넌트
2. ✅ **generateStaticParams**: 동적 라우팅에서 빌드 타임 경로 생성
3. ✅ **클라이언트 컴포넌트 분리**: `useSession` 같은 클라이언트 훅 사용 시 별도 컴포넌트로 분리
4. ✅ **캐시 무효화**: 데이터 변경 시 `revalidatePath()` 호출
5. ✅ **세션 검증 로직**: 클라이언트 컴포넌트 내부에서 수행

## 문제 해결 완료

- [x] ISR이 정상 작동함
- [x] 관리자 버튼이 클라이언트 컴포넌트에서만 표시됨
- [x] 서버 컴포넌트와 클라이언트 컴포넌트가 적절히 분리됨
- [x] 캐시 무효화가 동작함
