import { connectDB } from "@/util/database";

export async function POST(request, { params }) {
  const { collection } = await params;

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
    "profile",
  ];

  if (!validCollections.includes(collection)) {
    return Response.json(
      {
        message: "유효하지 않은 컬렉션입니다.",
      },
      { status: 400 }
    );
  }

  try {
    const client = await connectDB;
    const db = client.db("Yu");

    // 요청 본문에서 데이터 추출
    const { title, mainImage, mainVideo, contentImages, contentVideos } =
      await request.json();

    // 컬렉션 타입에 따른 필수 필드 검증
    if (collection === "mv" || collection === "video") {
      // MV, VIDEO 컬렉션은 mainVideo 필수
      if (!title || !mainVideo) {
        return Response.json(
          {
            message: "제목과 메인 영상은 필수입니다.",
            details: {
              hasTitle: !!title,
              hasMainVideo: !!mainVideo,
            },
          },
          { status: 400 }
        );
      }
    } else {
      // 다른 컬렉션은 mainImage 필수
      if (!title || !mainImage) {
        return Response.json(
          {
            message: "제목과 메인 이미지는 필수입니다.",
            details: {
              hasTitle: !!title,
              hasMainImage: !!mainImage,
            },
          },
          { status: 400 }
        );
      }
    }

    // 데이터베이스에 삽입할 문서 생성
    const document = {
      title,
      mainImage: mainImage || null,
      mainVideo: mainVideo || null,
      contentImages: contentImages || [],
      contentVideos: contentVideos || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 컬렉션에 문서 삽입
    const result = await db.collection(collection).insertOne(document);

    // 클라이언트(AddButton/작성 폼)에서 경로 무효화 처리

    return Response.json(
      {
        message: "성공적으로 생성되었습니다.",
        insertedId: result.insertedId,
        collection: collection,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating post:", error);
    return Response.json(
      {
        message: "생성 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
