"use client"
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import { FaPen, FaTrash } from "react-icons/fa";

export default function Detail() {
  const [data, setData] = useState(null);
  let params = usePathname();
  let paramsTemp = params.split('/');
  let id = paramsTemp[paramsTemp.length - 1];
  console.log(id)
  const session = useSession();
  const router = useRouter();

  const getData = async () => {
    try {
      const response = await fetch(`/api/DAILYLIFE/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        console.error("Failed to fetch data:", response.status);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const deleteData = async () => {
    if (confirm("정말로 삭제하시겠습니까?")) {
      try {
        const response = await fetch(`/api/DAILYLIFE/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          alert("성공적으로 삭제되었습니다.");
          router.push(`/DAILYLIFE}`);
        } else {
          alert("삭제에 실패했습니다.");
        }
      } catch (error) {
        console.error("Error deleting data:", error);
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-extralight mb-7 mt-8">
          {data && data.contentImages ? data.title : ""}
        </h1>

        {/* 메인 이미지 먼저 표시 */}
        {data && data.mainImage && (
          <img
            className="sm:w-3/6 h-full object-cover object-top overflow-hidden mb-10 px-5"
            src={data.mainImage}
            alt="Main Image"
          />
        )}

        {/* 컨텐츠 이미지들 표시 */}
        {data && data.contentImages && data.contentImages.length > 0 ? (
          data.contentImages.map((image, index) => (
            <img
              key={index}
              className="sm:w-3/6 h-full object-cover object-top overflow-hidden mb-10 px-5"
              src={image}
              alt={`Content Image ${index + 1}`}
            />
          ))
        ) : (
          <p>No content images available</p>
        )}
      </div>
      {session && (
        <div className="flex gap-2 fixed bottom-10 right-5 sm:right-10">
          <button
            className="bg-transparent border-2 border-white rounded-full p-3 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
          >
            <FaPen size={20} />
          </button>
          <button
            className="bg-transparent border-2 border-white rounded-full p-3 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
            onClick={deleteData}
          >
            <FaTrash size={20} />
          </button>
        </div>

      )}
    </>
  );
}
