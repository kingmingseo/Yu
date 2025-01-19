import { connectDB } from "@/util/database";

export default async function aboutme(request, response) {
  const client = await connectDB;
  const db = client.db("Yu");

  if (request.method === "GET") {
    try {
      let intro = await db.collection("Aboutme").find().toArray(); // 데이터 가져오기
      return response.status(200).json(intro); // JSON 형식으로 응답
    } catch (error) {
      console.error("Error fetching data:", error);
      return response.status(500).json({ error: "Failed to fetch data" }); // 에러 처리
    }
  }

  else if (request.method === "POST") {
    try {
      const { intro, src } = request.body; // 클라이언트로부터 intro 데이터 받기

      // 데이터베이스에 intro 저장 또는 업데이트
      await db.collection("Aboutme").updateMany(
        {}, // 조건: 첫 번째 문서만 업데이트 (조건 없이 전체 컬렉션 사용 가능)
        { $set: { intro, src } }, // 업데이트할 내용
        { upsert: true } // 문서가 없으면 새로 생성
      );

      return response.status(200).json({ message: "Intro updated successfully!" });
    } catch (error) {
      console.error("Error updating data:", error);
      return response.status(500).json({ error: "Failed to update intro" });
    }
  }

  else {
    return response.status(405).json({ error: "Method not allowed" });
  }
}
