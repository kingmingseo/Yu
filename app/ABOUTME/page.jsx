import { FaPen, FaInstagram, FaYoutube } from "react-icons/fa"; // 아이콘 추가
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { connectDB } from "@/util/database";
import Link from "next/link";

export const revalidate = false;

export default async function Aboutme() {
  const client = await connectDB;
  const db = client.db("Yu");
  const data = await db.collection("Aboutme").find().toArray();
  const session = await getServerSession(authOptions);
  console.log(session);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 w-screen h-screen sm:gap-0 gap-5 bg-black">
      <div className="flex sm:justify-end justify-center sm:h-3/4 sm:mr-14">
        <img
          src={data[0].src}
          className="sm:w-5/6 object-contain object-top overflow-hidden"
        />
      </div>
      <div className="flex flex-col justify-start sm:ml-14 pl-5 pr-5 sm:mr-14">
        <div className="flex flex-row">
          <h1 className="text-2xl sm:text-4xl font-semibold text-white">
            Yu Gwang Yeong
            <p className="text-sm sm:text-lg font-extralight ml-0">
              Fashion Model
            </p>
          </h1>
          {/* SNS 아이콘 추가 */}
          <div className="sm:static absolute right-2 sm:right-10 flex sm:mt-4 mx-4 mt-1 space-x-2">
            <a
              href="https://www.instagram.com/yu_gwang0/" // Instagram 링크
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-pink-500 transition-all"
            >
              <FaInstagram size={24} />
            </a>
            <a
              href="https://www.youtube.com/@yu_gwang0" // YouTube 링크
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-red-500 transition-all"
            >
              <FaYoutube size={24} />
            </a>
          </div>
        </div>
        <pre className="mt-4 h-3/4 bg-black rounded-md shadow-md font-semibold leading-relaxed text-sm sm:text-base whitespace-pre-wrap sm:mr-14">
          {data[0]?.intro || ""}
        </pre>
      </div>
      {/* session이 있을 때만 버튼 표시 */}
      {session && (
        <div className="fixed bottom-10 right-10">
          <Link href="/ABOUTME/update">
            <button className="bg-transparent border-2 border-white rounded-full p-3 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
              <FaPen size={20} />
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
