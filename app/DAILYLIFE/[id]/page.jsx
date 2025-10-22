import { FaPen, FaTrash } from "react-icons/fa";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { connectDB } from "@/util/database";
import { ObjectId } from "mongodb";
import DeleteButton from "@/components/common/DeleteButton";
import Link from "next/link";
import Image from "next/image";

export const revalidate = false; // ISR: 무한 캐시

export default async function Detail({ params }) {
  const { id } = await params; 
  
  const session = await getServerSession(authOptions);
  const client = await connectDB;
  const db = client.db("Yu");
  const data = await db.collection("dailylife").findOne({ _id: new ObjectId(id) });

  return (
    <>
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-extralight mb-7 mt-8">
          {data && data.contentImages ? data.title : ""}
        </h1>

        {/* 메인 이미지 먼저 표시 */}
        {data && data.mainImage && (
          <Image
            className="sm:w-1/3 w-full h-full object-cover mb-10 px-5"
            src={data.mainImage}
            alt={data.title}
            width={400}
            height={600}
          />
        )}

        {/* 컨텐츠 이미지들 표시 */}
        {data && data.contentImages && data.contentImages.length > 0 ? (
          data.contentImages.map((image, index) => (
            <Image
              key={index}
              className="sm:w-1/3 w-full h-full object-cover mb-10 px-5"
              src={image}
              alt={`${data.title} content ${index + 1}`}
              width={400}
              height={600}
            />
          ))
        ) : (
          <p>No content images available</p>
        )}
      </div>
      {session && (
        <div className="flex gap-2 fixed bottom-10 right-5 sm:right-10">
          <Link href={`/DAILYLIFE/${id}/update`}>
            <button className="bg-transparent border-2 border-white rounded-full p-3 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
              <FaPen size={20} />
            </button>
          </Link>
          <DeleteButton category="dailylife" id={id} section="DAILYLIFE" />
        </div>
      )}
    </>
  );
}
