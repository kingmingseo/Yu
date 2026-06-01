import aws from "aws-sdk";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

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
      ["content-length-range", 0, 52428800], //파일용량 50MB 까지 제한
    ],
  });

  return Response.json(url);
}
