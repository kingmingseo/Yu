import { connectDB } from "@/util/database";
import { ObjectId } from "mongodb";
import Image from "next/image";
import { notFound } from "next/navigation";
import isValidObjectId from "@/util/checkObjectId";
import DeleteButtonContainer from "@/components/common/DeleteButton/DeleteButtonContainer";

export const revalidate = false;
export const dynamic = 'force-static';

export default async function Detail({ params }) {
  const { id, category } = await params;
  if (!isValidObjectId(id)) {
    return notFound();
  }

  const client = await connectDB;
  const db = client.db("Yu");
  const data = await db
    .collection(category.toLowerCase())
    .findOne({ _id: new ObjectId(id) });

  return (
    <>
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-extralight mb-7 mt-8">
          {data && data.contentImages ? data.title : ""}
        </h1>

        {/* 메인 이미지 먼저 표시 */}
        {data && data.mainImage && (
          <Image
            className="sm:w-3/6 w-full h-full object-cover mb-10 px-5"
            src={data.mainImage}
            alt={data.title}
            width={600}
            height={800}
          />
        )}

        {/* 컨텐츠 이미지들 표시 */}
        {data && data.contentImages && data.contentImages.length > 0 ? (
          data.contentImages.map((image, index) => (
            <Image
              key={index}
              className="sm:w-3/6 w-full h-full object-cover mb-10 px-5"
              src={image}
              alt={`${data.title} content ${index + 1}`}
              width={600}
              height={800}
            />
          ))
        ) : (
          <></>
        )}
      </div>
      <DeleteButtonContainer category={category} id={id} />
    </>
  );
}
