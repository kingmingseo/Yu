"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link"; // Link 컴포넌트 import
import { FaPen } from "react-icons/fa";
import { useEffect, useState } from "react";

export default function Gallery() {
  let category = usePathname();
  category = category.split("/").pop();
  const router = useRouter();
  const { data: session } = useSession();
  const [data, setData] = useState();

  const writeNewPost = () => {
    router.push(`/WRITE/GALLERY?category=${category}`);
  };

  const getData = async (category) => {
    try {
      const response = await fetch(`/api/GALLERY/${category}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        setData(result);

      } else {
        console.error("Failed to fetch intro:", response.status);
      }
    } catch (error) {
      console.error("Error fetching intro:", error);
    }
  };

  useEffect(() => {
    getData(category);
  }, []);

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
                <img
                  src={item.mainImage} // DB에 저장된 이미지 URL
                  alt={item.title}
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
            <button
              onClick={writeNewPost}
              className="bg-transparent border-2 border-white rounded-full p-3 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
            >
              <FaPen size={20} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
