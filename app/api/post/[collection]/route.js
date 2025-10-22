import { connectDB } from "@/util/database";

export async function POST(request, { params }) {
  const { collection } = params;

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

    // 요청 본문에서 데이터 추출
    const { title, mainImage, contentImages } = await request.json();

    // 필수 필드 검증 (컨텐츠 이미지는 선택사항)
    if (!title || !mainImage) {
      return Response.json({
        message: "제목과 메인 이미지는 필수입니다.",
        details: {
          hasTitle: !!title,
          hasMainImage: !!mainImage
        }
      }, { status: 400 });
    }

    // 데이터베이스에 삽입할 문서 생성
    const document = {
      title,
      mainImage,
      contentImages: contentImages || [], // 빈 배열로 기본값 설정
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 컬렉션에 문서 삽입
    const result = await db.collection(collection).insertOne(document);

    return Response.json({
      message: "성공적으로 생성되었습니다.",
      insertedId: result.insertedId,
      collection: collection
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating post:", error);
    return Response.json({
      message: "생성 중 오류가 발생했습니다."
    }, { status: 500 });
  }
}
