import aws from "aws-sdk";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get('file');

  aws.config.update({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
    region: "ap-northeast-2",
    signatureVersion: "v4",
  });

  const s3 = new aws.S3();
  const url = await s3.createPresignedPost({
    Bucket: process.env.BUCKET_NAME,
    Fields: { key: file },
    Expires: 60, // seconds
    Conditions: [
      // 영상 파일 크기 제한 (500MB)
      ["content-length-range", 0, 524288000],
    ],
  });

  return Response.json(url);
}
