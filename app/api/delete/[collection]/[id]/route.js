import { connectDB } from "@/util/database";
import { ObjectId } from "mongodb";
import aws from "aws-sdk";

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

    // 삭제하기 전에 문서를 먼저 조회하여 S3 URL들을 추출
    const documentToDelete = await db.collection(collection).findOne({
      _id: new ObjectId(id)
    });

    if (!documentToDelete) {
      return Response.json({
        message: "삭제할 데이터를 찾을 수 없습니다."
      }, { status: 404 });
    }

    // S3 파일 삭제를 위한 설정
    aws.config.update({
      accessKeyId: process.env.ACCESS_KEY,
      secretAccessKey: process.env.SECRET_KEY,
      region: "ap-northeast-2",
      signatureVersion: "v4",
    });

    const s3 = new aws.S3();
    const bucketName = process.env.BUCKET_NAME;

    // S3에서 삭제할 파일 URL들 수집
    const s3UrlsToDelete = [];
    
    // mainImage URL 추가
    if (documentToDelete.mainImage && documentToDelete.mainImage.includes('amazonaws.com')) {
      s3UrlsToDelete.push(documentToDelete.mainImage);
    }

    // contentImages URL들 추가
    if (documentToDelete.contentImages && Array.isArray(documentToDelete.contentImages)) {
      documentToDelete.contentImages.forEach(imageUrl => {
        if (imageUrl && imageUrl.includes('amazonaws.com')) {
          s3UrlsToDelete.push(imageUrl);
        }
      });
    }

    // video URL 추가 (비디오 컬렉션인 경우)
    if (documentToDelete.video && documentToDelete.video.includes('amazonaws.com')) {
      s3UrlsToDelete.push(documentToDelete.video);
    }

    // S3에서 파일들 삭제
    if (s3UrlsToDelete.length > 0) {
      console.log(`S3에서 ${s3UrlsToDelete.length}개 파일 삭제 시작:`, s3UrlsToDelete);
      
      const deletePromises = s3UrlsToDelete.map(url => {
        // URL에서 S3 키 추출
        const urlParts = url.split('/');
        const key = urlParts.slice(3).join('/'); // 버킷명 이후의 경로
        
        return s3.deleteObject({
          Bucket: bucketName,
          Key: key
        }).promise().catch(error => {
          console.error(`S3 파일 삭제 실패 (${key}):`, error);
          // 개별 파일 삭제 실패는 전체 삭제를 중단하지 않음
        });
      });

      await Promise.all(deletePromises);
      console.log('S3 파일 삭제 완료');
    }

    // MongoDB에서 문서 삭제
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
      collection: collection,
      deletedS3Files: s3UrlsToDelete.length
    }, { status: 200 });

  } catch (error) {
    console.error("Delete operation error:", error);
    return Response.json({
      message: "삭제 중 오류가 발생했습니다."
    }, { status: 500 });
  }
}
