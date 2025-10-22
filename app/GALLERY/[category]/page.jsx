import Link from "next/link";
import { FaPen } from "react-icons/fa";
import React from "react";
import { connectDB } from "@/util/database";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import Image from "next/image";

export const revalidate = false;

export async function generateMetadata({ params }) {
  const category = params.category;
  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
  
  return {
    title: `${categoryTitle} Gallery`,
    description: `Explore ${categoryTitle} photography by Korean fashion model Yu Gwang Yeong. Professional modeling portfolio and fashion photography.`,
    keywords: ['Korean fashion model', 'Yu Gwang Yeong', 'gallery', categoryTitle, 'fashion photography', 'modeling portfolio'],
    openGraph: {
      title: `${categoryTitle} Gallery - Yu Gwang Yeong`,
      description: `Explore ${categoryTitle} photography by Korean fashion model Yu Gwang Yeong. Professional modeling portfolio and fashion photography.`,
      type: 'website',
    },
  };
}

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
            <Link href={`/WRITE/GALLERY?category=${category}`}>
              <button 
                className="bg-transparent border-2 border-white rounded-full p-3 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                aria-label="갤러리 게시물 작성"
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
