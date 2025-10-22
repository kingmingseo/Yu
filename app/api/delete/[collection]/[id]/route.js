import { connectDB } from "@/util/database";
import { ObjectId } from "mongodb";

export async function DELETE(request, { params }) {
  const { collection, id } = await params;

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
    return Response.json({
      message: "유효하지 않은 컬렉션입니다."
    }, { status: 400 });
  }

  try {
    const client = await connectDB;
    const db = client.db("Yu");

    const result = await db.collection(collection).deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return Response.json({
        message: "삭제할 데이터를 찾을 수 없습니다."
      }, { status: 404 });
    }

    console.log(`Deleted document from ${collection}:`, id);
    return Response.json({
      message: "성공적으로 삭제되었습니다.",
      deletedId: id,
      collection: collection
    }, { status: 200 });

  } catch (error) {
    console.error("Delete operation error:", error);
    return Response.json({
      message: "삭제 중 오류가 발생했습니다."
    }, { status: 500 });
  }
}
