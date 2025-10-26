import { connectDB } from '@/util/database';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) return Response.json({ error: 'id required' }, { status: 400 });

    const client = await connectDB;
    const db = client.db('Yu');
    const doc = await db.collection('youtube_videos').findOne({ _id: new (await import('mongodb')).ObjectId(id) });
    if (!doc) return Response.json({ error: 'not found' }, { status: 404 });
    return Response.json({ videoId: doc.videoId });
  } catch (e) {
    return Response.json({ error: 'failed' }, { status: 500 });
  }
}


