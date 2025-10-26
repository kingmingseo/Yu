import { connectDB } from "@/util/database";
import { ObjectId } from "mongodb";

export async function DELETE(request, { params }) {
  const { id } = await params;

  try {
    const client = await connectDB;
    const db = client.db("Yu");

    // 삭제하기 전에 문서를 먼저 조회하여 videoId 추출
    const documentToDelete = await db.collection("youtube_videos").findOne({
      _id: new ObjectId(id),
    });

    if (!documentToDelete) {
      return Response.json(
        {
          message: "삭제할 데이터를 찾을 수 없습니다.",
        },
        { status: 404 }
      );
    }

    const { videoId } = documentToDelete;

    // YouTube API에서 비디오 삭제 시도
    if (videoId) {
      try {
        // 클라이언트에서 전달받은 Authorization 헤더에서 토큰 추출
        const authHeader = request.headers.get("Authorization");
        const token = authHeader?.replace("Bearer ", "");
        
        if (token) {
          const youtubeResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?id=${videoId}`,
            {
              method: "DELETE",
              headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
              },
            }
          );

          if (!youtubeResponse.ok) {
            console.error("YouTube API 삭제 실패:", youtubeResponse.status);
            // YouTube 삭제 실패 시 전체 작업 중단
            return Response.json(
              {
                message: "YouTube에서 비디오 삭제에 실패했습니다.",
                error: "youtube_delete_failed"
              },
              { status: 400 }
            );
          }
          
          console.log(`YouTube 비디오 삭제 성공: ${videoId}`);
        } else {
          console.warn("OAuth 토큰이 없어 YouTube 삭제를 건너뜁니다.");
        }
      } catch (youtubeError) {
        console.error("YouTube API 삭제 중 오류:", youtubeError);
        return Response.json(
          {
            message: "YouTube API 호출 중 오류가 발생했습니다.",
            error: "youtube_api_error"
          },
          { status: 500 }
        );
      }
    }

    // MongoDB에서 문서 삭제
    const result = await db.collection("youtube_videos").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return Response.json(
        {
          message: "데이터베이스에서 삭제할 데이터를 찾을 수 없습니다.",
        },
        { status: 404 }
      );
    }

    console.log(`YouTube 비디오 삭제 완료: ${id}`);

    return Response.json(
      {
        message: "성공적으로 삭제되었습니다.",
        deletedId: id,
        videoId: videoId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("YouTube 비디오 삭제 오류:", error);
    return Response.json(
      {
        message: "삭제 중 오류가 발생했습니다.",
        error: "database_error"
      },
      { status: 500 }
    );
  }
}
