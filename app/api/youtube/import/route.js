import { NextResponse } from 'next/server';
import { connectDB } from '@/util/database';
import { revalidatePath } from 'next/cache';

// 업로드 완료 후 videoId를 받아 메타 정보를 저장하는 전용 API
export async function POST(request) {
  try {
    const { videoId, category } = await request.json();
    if (!videoId || typeof videoId !== 'string') {
      return NextResponse.json({ error: 'videoId is required' }, { status: 400 });
    }

    const normalizedCategory = normalizeCategory(category) || 'VIDEO';

    // YouTube 메타 조회
    const { google } = await import('googleapis');
    const youtube = google.youtube({ version: 'v3', auth: process.env.YOUTUBE_API_KEY });
    const response = await youtube.videos.list({ part: 'snippet,statistics', id: videoId });
    const video = response.data.items?.[0];
    if (!video) {
      return NextResponse.json({ error: 'Video not found on YouTube' }, { status: 404 });
    }

    const videoData = {
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.default?.url,
      videoId: videoId,
      youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      publishedAt: new Date(video.snippet.publishedAt),
      channelTitle: video.snippet.channelTitle,
      viewCount: video.statistics?.viewCount || 0,
      likeCount: video.statistics?.likeCount || 0,
      category: normalizedCategory,
      updatedAt: new Date(),
    };

    // DB upsert
    const client = await connectDB;
    const db = client.db('Yu');
    const existing = await db.collection('youtube_videos').findOne({ videoId });
    if (existing) {
      await db.collection('youtube_videos').updateOne(
        { videoId },
        { $set: videoData }
      );
    } else {
      await db.collection('youtube_videos').insertOne({ ...videoData, createdAt: new Date() });
    }

    // 경로 리밸리데이트
    const routeCategory = normalizedCategory === 'MV' ? 'MV' : 'VIDEO';
    revalidatePath(`/GALLERY/${routeCategory}`);

    return NextResponse.json({ success: true, videoId, category: normalizedCategory });
  } catch (error) {
    console.error('YouTube 업로드 저장 API 오류:', error);
    return NextResponse.json({ error: 'Save failed', details: error.message }, { status: 500 });
  }
}

function normalizeCategory(value) {
  if (!value || typeof value !== 'string') return undefined;
  const v = value.trim().toUpperCase();
  if (v === 'MV' || v === 'VIDEO') return v;
  return undefined;
}


