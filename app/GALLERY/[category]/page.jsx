"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaPen } from "react-icons/fa";
import { useEffect, useState } from "react";

export default function Gallery() {
  let category = usePathname();
  category = category.split("/").pop();
  const router = useRouter();
  const { data: session } = useSession();
  const [data, setData] = useState();

  const writeNewPost = () => {
    router.push(`/GALLERY/${category}/write`);
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
              className="flex flex-col w-full h- object-cover justify-center items-center"
            >
              <a href={`/GALLERY/${category}/${item._id}`} className="flex flex-col items-center w-full h-full">
                <img
                  src={item.mainImage} // DB에 저장된 이미지 URL
                  alt={item.title}
                  className="sm:w-5/6 h-full object-cover object-top overflow-hidden"
                />
                <h1 className="mt-3 text-sm sm:text-base font-extralight text-center">{item.title}</h1>
              </a>
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
