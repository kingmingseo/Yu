"use client"
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Detail() {
  const [data, setData] = useState(null);
  let params = usePathname();
  let paramsTemp = params.split('/');
  let category = paramsTemp[paramsTemp.length - 2];
  let id = paramsTemp[paramsTemp.length - 1];

  const getData = async () => {
    try {
      const response = await fetch(`/api/GALLERY/${category}/${id}`, {
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

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-extralight mb-7 mt-8">{data && data.contentImages ? data.title : ""}</h1>
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
          <p>No content images available</p>  // contentImages가 없을 경우 메시지 표시
        )}
      </div>
    </>
  );
}
