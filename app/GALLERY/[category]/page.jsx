import React from "react";
import { connectDB } from "@/util/database";
import GalleryItem from "@/components/gallery/GalleryItem";
import EmptyState from "@/components/gallery/EmptyState";
import AddButtonContainer from "@/components/common/AddButton/AddButtonContainer";

export const revalidate = false;

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
        className={`px-4 grid gap-x-6 sm:gap-y-32 gap-y-16 pb-32 sm:mt-10 mt-5 justify-between ${category === "MV" || category === "VIDEO"
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
        <AddButtonContainer category={category} />
      </div>
    </>
  );
}
