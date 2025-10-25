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
    const { intro, src, index } = await request.json(); // 클라이언트로부터 데이터 받기

    // index가 제공된 경우 (개별 이미지 저장/업데이트)
    if (index !== undefined) {
      // 기존 문서가 있는지 확인하고 업데이트 또는 새로 생성
      const existingDoc = await db
        .collection("Aboutme")
        .findOne({ index: index });

      if (existingDoc) {
        // 기존 문서 업데이트 (이미지 대체)
        await db
          .collection("Aboutme")
          .updateOne(
            { index: index },
            { $set: { intro, src, index, updatedAt: new Date() } }
          );
        console.log(`Updated existing image at index ${index}`);
      } else {
        // 새 문서 생성
        await db.collection("Aboutme").insertOne({
          intro,
          src,
          index,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`Created new image at index ${index}`);
      }
    }

    return Response.json({ message: "Data updated successfully!" });
  } catch (error) {
    console.error("Error updating data:", error);
    return Response.json({ error: "Failed to update data" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const client = await connectDB;
    const db = client.db("Yu");
    const { index } = await request.json();

    if (index !== undefined) {
      // 특정 index의 이미지 삭제
      const result = await db.collection("Aboutme").deleteOne({ index: index });
      console.log(`Deleted image at index ${index}, result:`, result);

      if (result.deletedCount > 0) {
        return Response.json({
          message: `Image at index ${index} deleted successfully!`,
        });
      } else {
        return Response.json(
          { message: `No image found at index ${index}` },
          { status: 404 }
        );
      }
    }
  } catch (error) {
    console.error("Error deleting data:", error);
    return Response.json({ error: "Failed to delete data" }, { status: 500 });
  }
}
