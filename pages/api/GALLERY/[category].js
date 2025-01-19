import { connectDB } from "@/util/database";

export default async function handler(request, respond) {
  const { category } = request.query; // 동적 경로에서 카테고리 추출
  const client = await connectDB;
  const db = client.db("Yu");

  if (request.method === "GET") {
    try {
      console.log(request);
      const data = await db.collection(category.toLowerCase())
        .find()
        .sort({ _id: -1 })  // _id 기준으로 내림차순 정렬 (최신 데이터가 먼저)
        .toArray();
      console.log(data);
      respond.status(200).json(data);
    } catch (error) {
      console.error("Database error:", error);
      respond.status(500).json({ message: "Internal server error" });
    }
  } else if (request.method === "POST") {
    try {
      const { title, mainImage, contentImages } = request.body;
      const newPost = {
        title,
        mainImage,
        contentImages,
      };

      await db.collection(category.toLowerCase()).insertOne(newPost);

      respond.status(200).json({ message: "Post created successfully" });
    } catch (error) {
      console.error("Database error:", error);
      respond.status(500).json({ message: "Internal server error" });
    }
  } else {
    respond.setHeader("Allow", ["GET", "POST"]);
    respond.status(405).end(`Method ${request.method} Not Allowed`);
  }
}
