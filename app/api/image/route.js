import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { requireAdmin } from "@/lib/adminAuth";

const s3Client = new S3Client({
  region: "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
  },
});

export async function GET(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const file = searchParams.get("file");
  const fileType = searchParams.get("fileType") || "application/octet-stream";

  const url = await createPresignedPost(s3Client, {
    Bucket: process.env.BUCKET_NAME,
    Key: file,
    Fields: {
      "Content-Type": fileType,
    },
    Expires: 60,
    Conditions: [
      { "Content-Type": fileType },
      ["content-length-range", 0, 52428800],
    ],
  });

  return Response.json(url);
}
