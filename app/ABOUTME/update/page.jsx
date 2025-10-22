"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AboutMeUpdate() {
  const [intro, setIntro] = useState("");
  const router = useRouter();
  let [src, setSrc] = useState();

  const getIntro = async () => {
    try {
      const response = await fetch("/api/aboutme/aboutme", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        setIntro(result[0].intro);
        setSrc(result[0].src);
      } else {
        console.error("Failed to fetch intro:", response.status);
      }
    } catch (error) {
      console.error("Error fetching intro:", error);
    }
  };

  const updateIntro = async () => {
    try {
      const response = await fetch("/api/aboutme/aboutme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intro, src }),
      });

      if (response.ok) {
        alert("수정이 완료 되었습니다");
        await fetch("/api/revalidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: "/ABOUTME" }),
        });
        router.push("/ABOUTME");
      } else {
        alert("알수없는 오류 [수정 실패].");
      }
    } catch (error) {
      console.error("Error updating intro:", error);
      alert("An error occurred.");
    }
  };

  useEffect(() => {
    getIntro();
  }, []);

  return (
    <div className="grid h-screen grid-cols-1 sm:grid-cols-2 w-screen sm:gap-0 gap-5 bg-black z-1">
      <div className="relative flex sm:justify-end justify-center sm:h-3/4 sm:mr-14">
        <div className="relative group sm:w-5/6">
          <img
            src={src}
            alt="Profile Image"
            className="w-full h-full object-cover object-top"
          />
          <label
            htmlFor="image-upload"
            className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <span className="text-white">Click to Change Image</span>
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              let file = e.target.files[0];
              let filename = encodeURIComponent(file.name);
              let res = await fetch("/api/image?file=" + filename);
              res = await res.json();

              const formData = new FormData();
              Object.entries({ ...res.fields, file }).forEach(
                ([key, value]) => {
                  formData.append(key, value);
                }
              );
              let 업로드결과 = await fetch(res.url, {
                method: "POST",
                body: formData,
              });
              console.log(업로드결과);

              if (업로드결과.ok) {
                setSrc(업로드결과.url + "/" + filename);
              } else {
                console.log("실패");
              }
            }}
          />
        </div>
      </div>
      <div className="flex flex-col justify-start sm:ml-14 pl-5 pr-5 sm:mr-14">
        <div className="flex flex-row">
          <h1 className="text-2xl sm:text-4xl font-semibold text-white">
            Yu Gwang Yeong{" "}
            <span className="text-sm sm:text-lg font-extralight ml-2">
              Fashion Model
            </span>
          </h1>
        </div>
        <textarea
          className="h-3/5 w-full text-black sm:mt-4 bg-white rounded-md shadow-md font-semibold leading-relaxed text-sm sm:text-base whitespace-pre-wrap sm:mr-14"
          value={intro}
          onChange={(e) => {
            setIntro(e.target.value);
          }}
        />
        <button
          type="button"
          className="hover:underline focus:outline-none mt-5 border py-3"
          onClick={updateIntro}
        >
          UPDATE
        </button>
      </div>
    </div>
  );
}
