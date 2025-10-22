import { connectDB } from "@/util/database";

export async function GET() {
  try {
    const client = await connectDB;
    const db = client.db("Yu");
    let intro = await db.collection("Aboutme").find().toArray(); // 데이터 가져오기
    return Response.json(intro); // JSON 형식으로 응답
  } catch (error) {
    console.error("Error fetching data:", error);
    return Response.json({ error: "Failed to fetch data" }, { status: 500 }); // 에러 처리
  }
}

export async function POST(request) {
  try {
    const client = await connectDB;
    const db = client.db("Yu");
    const { intro, src } = await request.json(); // 클라이언트로부터 intro 데이터 받기

    // 데이터베이스에 intro 저장 또는 업데이트
    await db.collection("Aboutme").updateMany(
      {}, // 조건: 첫 번째 문서만 업데이트 (조건 없이 전체 컬렉션 사용 가능)
      { $set: { intro, src } }, // 업데이트할 내용
      { upsert: true } // 문서가 없으면 새로 생성
    );

    return Response.json({ message: "Intro updated successfully!" });
  } catch (error) {
    console.error("Error updating data:", error);
    return Response.json({ error: "Failed to update intro" }, { status: 500 });
  }
}
