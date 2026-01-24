import { FaInstagram, FaYoutube } from "react-icons/fa"; // 아이콘 추가
import { connectDB } from "@/util/database";
import Link from "next/link";
import ImageSlider from "@/components/ImageSlider";
import AddButton from "@/components/common/AddButton/AddButtonContainer";

export const revalidate = false;
export const dynamic = 'force-static';

export default async function Aboutme() {
  const client = await connectDB;
  const db = client.db("Yu");
  const data = await db.collection("Aboutme").find().toArray();
  console.log(data);
  return (
    <>
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 py-6">
          {/* 메인 프로필 영역 */}
          <div className="flex flex-col items-center space-y-8">
            {/* 이미지 슬라이더 */}
            <div className="w-full max-w-2xl">
              <ImageSlider
                images={Array.from({ length: 5 }, (_, index) => {
                  const item = data.find((d) => d.index === index);
                  return item
                    ? {
                      src: item.src,
                      alt: item.alt || "프로필 이미지",
                    }
                    : null;
                }).filter(Boolean)}
                autoPlay={true}
                interval={4000}
              />
            </div>

            {/* 이름 섹션 */}
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-extralight">Yu Gwang Yeong</h1>
              <h2 className="text-lg font-extralight text-gray-300">유광영</h2>

              {/* 소셜 미디어 아이콘 */}
              <div className="flex justify-center space-x-6">
                <a
                  href="https://www.instagram.com/yu_gwang0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-pink-400 transition-colors duration-300"
                  aria-label="Instagram"
                >
                  <FaInstagram size={24} />
                </a>
                <a
                  href="https://www.youtube.com/@yu_gwang0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-red-500 transition-colors duration-300"
                  aria-label="YouTube"
                >
                  <FaYoutube size={24} />
                </a>
              </div>
            </div>

            {/* 기본 정보 섹션 */}
            <div className="w-full max-w-md">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Height</p>
                  <p className="text-lg font-extralight">182cm</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Shoes</p>
                  <p className="text-lg font-extralight">275mm</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">3 Size</p>
                  <p className="text-lg font-extralight">32-27-35</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Hair</p>
                  <p className="text-lg font-extralight">Black</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">상의</p>
                  <p className="text-lg font-extralight">100~105</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">하의</p>
                  <p className="text-lg font-extralight">30</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Eyes</p>
                  <p className="text-lg font-extralight">Black</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AddButton variant="aboutme" />
    </>
  );
}
