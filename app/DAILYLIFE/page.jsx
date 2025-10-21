"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaPen } from "react-icons/fa";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function DailyLife() {
  const router = useRouter();
  const { data: session } = useSession();
  const [data, setData] = useState();

  const writeNewPost = () => {
    router.push(`/WRITE/DAILYLIFE`);
  };

  const getData = async () => {
    try {
      const response = await fetch(`/api/DAILYLIFE/dailylife`, {
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
    getData();
  }, []);

  return (
    <div className="grid grid-cols-7 gap-4 px-4 sm:px-0">
      {/* 좌측 빈 1열 (모바일에서는 hidden) */}
      <div className="hidden sm:block"></div>

      {/* 가운데 5열 */}
      <div className="col-span-7 sm:col-span-5">
        <div className="grid grid-cols-2 gap-x-6 sm:gap-y-32 gap-y-16 pb-32 sm:mt-10 mt-5 justify-between">
          {data && data.length > 0 ? (
            // 게시물이 있을 경우
            [...data].map((item, index) => (
              <div
                key={index}
                className="flex flex-col w-full justify-center items-center"
              >
                <Link
                  href={`/DAILYLIFE/${item._id}`}
                  className="flex flex-col justify-center items-center w-full h-full"
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
            <div className="col-span-2 font-extralight text-center text-4xl py-20">
              Empty Content
            </div>
          )}
        </div>

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

      {/* 우측 빈 1열 (모바일에서는 hidden) */}
      <div className="hidden sm:block"></div>
    </div>
  );
}
