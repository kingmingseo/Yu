import { connectDB } from "@/util/database";
import { ObjectId } from "mongodb";

export default async function handler(request, response) {
  if (request.method !== "DELETE") {
    response.setHeader("Allow", ["DELETE"]);
    return response.status(405).end(`Method ${request.method} Not Allowed`);
  }

  const { collection, id } = request.query;

  // 유효한 컬렉션인지 확인
  const validCollections = [
    "dailylife", 
    "sponsorship", 
    "lookbook", 
    "polaroid", 
    "beauty", 
    "media", 
    "mv", 
    "video", 
    "magazine", 
    "profile"
  ];
  if (!validCollections.includes(collection)) {
    return response.status(400).json({
      message: "유효하지 않은 컬렉션입니다."
    });
  }

  try {
    const client = await connectDB;
    const db = client.db("Yu");

    const result = await db.collection(collection).deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return response.status(404).json({
        message: "삭제할 데이터를 찾을 수 없습니다."
      });
    }

    console.log(`Deleted document from ${collection}:`, id);
    response.status(200).json({
      message: "성공적으로 삭제되었습니다.",
      deletedId: id,
      collection: collection
    });
  } catch (error) {
    console.error("Delete operation error:", error);
    response.status(500).json({
      message: "삭제 중 오류가 발생했습니다."
    });
  }
}
