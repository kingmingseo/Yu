import Link from "next/link";
import { FaPen } from "react-icons/fa";
import React from "react";
import { connectDB } from "@/util/database";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Image from "next/image";
import DeleteButton from "@/components/common/DeleteButton";

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
            <div
              key={index}
              className="flex flex-col w-full h-full justify-center items-center"
            >
              {category === 'MV' || category === 'VIDEO' ? (
                // MV, VIDEO 카테고리는 영상 직접 표시 (링크 없음) + 삭제 버튼 오버레이
                <div className="relative group w-full flex justify-center">
                  {item.mainVideo ? (
                    <video
                      src={item.mainVideo}
                      className="w-3/5 max-w-lg h-auto object-contain"
                      controls
                      preload="metadata"
                    />
                  ) : (
                    <div className="w-5/6 max-w-lg h-56 bg-gray-800 flex items-center justify-center text-gray-400">
                      영상이 없습니다
                    </div>
                  )}
                  {session && (
                    <div className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <DeleteButton category={category} id={String(item._id)} />
                    </div>
                  )}
                </div>
              ) : (
                // 다른 카테고리는 이미지 표시 (개별 페이지로 이동)
                <Link
                  href={`/GALLERY/${category}/${item._id}`}
                  className="flex items-center justify-center w-full h-full"
                >
                  <Image
                    src={item.mainImage} // DB에 저장된 이미지 URL
                    alt={item.title}
                    width={400}
                    height={600}
                    className="sm:w-5/6 h-auto object-contain"
                  />
                </Link>
              )}
              <h1 className="mt-1 sm:mt-3 text-sm sm:text-lg font-extralight text-center">
                {item.title}
              </h1>
            </div>
          ))
        ) : (
          // 게시물이 없을 경우
          <div className="col-span-2 font-extralight text-center white text-4xl py-20">
            Empty Content
          </div>
        )}

        {session && (
          <div className="fixed bottom-10 right-5 sm:right-10">
            <Link href={
              category === 'MV' || category === 'VIDEO' 
                ? `/WRITE/VIDEO?category=${category.toLowerCase()}`
                : `/WRITE/GALLERY?category=${category}`
            }>
              <button 
                className="bg-transparent border-2 border-white rounded-full p-3 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                aria-label={
                  category === 'MV' || category === 'VIDEO' 
                    ? "영상 업로드" 
                    : "갤러리 게시물 작성"
                }
              >
                <FaPen size={20} />
              </button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
