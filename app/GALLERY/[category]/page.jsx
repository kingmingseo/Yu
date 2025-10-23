import React from "react";
import { connectDB } from "@/util/database";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import GalleryItem from "@/components/gallery/GalleryItem";
import EmptyState from "@/components/gallery/EmptyState";
import AddButton from "@/components/gallery/AddButton";

export const revalidate = false;


export default async function Gallery({ params }) {
  const { category } = await params;

  const client = await connectDB;
  const db = client.db("Yu");
  const data = await db
    .collection(category.toLowerCase())
    .find()
    .sort({ _id: -1 }) // _id 기준으로 내림차순 정렬 (최신 데이터가 먼저)
    .toArray();
  const session = await getServerSession(authOptions);

  return (
    <>
      <div className="px-4 grid grid-cols-2 gap-x-6 sm:gap-y-32 gap-y-16 pb-32 sm:mt-10 mt-5 justify-between ">
        {data && data.length > 0 ? (
          // 게시물이 있을 경우
          [...data].map((item, index) => (
            <GalleryItem
              key={index}
              item={item}
              category={category}
              session={session}
            />
          ))
        ) : (
          // 게시물이 없을 경우
          <EmptyState />
        )}

        {session && <AddButton category={category} />}
      </div>
    </>
  );
}
