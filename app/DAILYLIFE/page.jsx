import { FaPen } from "react-icons/fa";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { connectDB } from "@/util/database";
import Link from "next/link";
import Image from "next/image";

export const revalidate = false; // ISR: 무한 캐시

export const metadata = {
  title: 'Daily Life',
  description: 'Follow Yu Gwang Yeong\'s daily life as a Korean fashion model. Behind-the-scenes moments, lifestyle, and personal updates.',
  keywords: ['Korean fashion model', 'Yu Gwang Yeong', 'daily life', 'lifestyle', 'behind the scenes', 'model life'],
  openGraph: {
    title: 'Daily Life - Yu Gwang Yeong',
    description: 'Follow Yu Gwang Yeong\'s daily life as a Korean fashion model. Behind-the-scenes moments, lifestyle, and personal updates.',
    type: 'website',
  },
};

export default async function DailyLife() {
  const session = await getServerSession(authOptions);
  const client = await connectDB;
  const db = client.db("Yu");
  const data = await db.collection("dailylife").find().sort({ _id: -1 }).toArray();

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
            <div className="col-span-2 font-extralight text-center text-4xl py-20">
              Empty Content
            </div>
          )}
        </div>

        {session && (
          <div className="fixed bottom-10 right-5 sm:right-10">
            <Link href="/WRITE/DAILYLIFE">
              <button 
                className="bg-transparent border-2 border-white rounded-full p-3 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                aria-label="일상 게시물 작성"
              >
                <FaPen size={20} />
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* 우측 빈 1열 (모바일에서는 hidden) */}
      <div className="hidden sm:block"></div>
    </div>
  );
}
