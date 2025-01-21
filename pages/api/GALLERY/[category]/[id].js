import { connectDB } from "@/util/database";
import { ObjectId } from "mongodb";

export default async function handler(request, respond) {
  const { id, category } = request.query;
  const client = await connectDB;
  const db = client.db("Yu");

  if (request.method === "GET") {
    try {
      const data = await db.collection(category.toLowerCase()).findOne({
        _id: new ObjectId(id)
      });

      if (!data) {
        return respond.status(404).json({ message: "데이터를 찾을 수 없습니다." });
      }

      console.log("Retrieved data:", data);
      respond.status(200).json(data);
    } catch (error) {
      console.error("Database error:", error);
      respond.status(500).json({ message: "Internal server error" });
    }
  }

  else if (request.method === "DELETE") {
    try {
      const result = await db.collection(category.toLowerCase()).deleteOne({
        _id: new ObjectId(id)
      });

      if (result.deletedCount === 0) {
        return respond.status(404).json({
          message: "삭제할 데이터를 찾을 수 없습니다."
        });
      }

      console.log(`Deleted document from ${category.toLowerCase()}:`, id);
      respond.status(200).json({
        message: "성공적으로 삭제되었습니다.",
        deletedId: id
      });
    } catch (error) {
      console.error("Delete operation error:", error);
      respond.status(500).json({
        message: "삭제 중 오류가 발생했습니다."
      });
    }
  }

  else {
    respond.setHeader("Allow", ["GET", "DELETE"]);
    respond.status(405).end(`Method ${request.method} Not Allowed`);
  }
}