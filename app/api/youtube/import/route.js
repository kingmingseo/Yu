import { NextResponse } from 'next/server';
import { connectDB } from '@/util/database';
import { revalidatePath } from 'next/cache';

// Zapier/외부 서비스용: 비디오 ID를 받아 저장
export async function POST(request) {
  try {
    const providedSecret = request.headers.get('x-webhook-secret');
    const configuredSecret = process.env.ZAPIER_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET || process.env.YOUTUBE_WEBHOOK_SECRET;
    if (configuredSecret && providedSecret !== configuredSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body = {};
    try {
      body = await request.json();
    } catch (_) {}

    const videoId = extractVideoIdFromBody(body);
    if (!videoId) {
      return NextResponse.json({ error: 'videoId not found in payload' }, { status: 400 });
    }

    // Zapier가 넘겨줄 수 있는 명시적 분류값
    const explicitCategory = normalizeCategory(body.category);
    const explicitPlaylistId = typeof body.playlistId === 'string' ? body.playlistId.trim() : undefined;

    await fetchVideoAndSaveToGallery(videoId, { explicitCategory, explicitPlaylistId });

    return NextResponse.json({ success: true, videoId, category: explicitCategory || null, playlistId: explicitPlaylistId || null });
  } catch (error) {
    console.error('YouTube import 오류:', error);
    return NextResponse.json({ error: 'Import 실패', details: error.message }, { status: 500 });
  }
}

function extractVideoIdFromBody(body) {
  // 대표적인 Zapier/YouTube 트리거 페이로드 케이스들을 최대한 지원
  const url = body.url || body.link || body.videoUrl || body.permalinkUrl;
  const candidates = [
    body.videoId,
    body.video_id,
    body.id?.videoId,
    body.id,
    body.resource?.videoId,
    body.data?.videoId,
  ].filter(Boolean);

  for (const c of candidates) {
    if (typeof c === 'string' && c.length >= 11) return c;
  }

  if (typeof url === 'string') {
    const m1 = url.match(/[?&]v=([\w-]{11})/); // watch?v=
    if (m1) return m1[1];
    const m2 = url.match(/youtu\.be\/([\w-]{11})/); // youtu.be/
    if (m2) return m2[1];
    const m3 = url.match(/embed\/([\w-]{11})/); // /embed/
    if (m3) return m3[1];
  }

  return null;
}

// 아래 로직은 웹훅과 동일: 비디오 정보 조회 → DB upsert → 경로 리밸리데이트
async function fetchVideoAndSaveToGallery(videoId, { explicitCategory, explicitPlaylistId } = {}) {
  let client;
  try {
    console.log('YouTube 영상 정보 가져오기 시작 (import):', videoId);

    const { google } = await import('googleapis');
    const youtube = google.youtube({ version: 'v3', auth: process.env.YOUTUBE_API_KEY });

    const response = await youtube.videos.list({ part: 'snippet,statistics', id: videoId });
    const video = response.data.items?.[0];
    if (!video) {
      console.log('영상을 찾을 수 없습니다:', videoId);
      return;
    }

    // 분류 우선순위: 명시적 category > 명시적 playlistId 매핑 > 자동 감지
    let category = explicitCategory || mapPlaylistToCategory(explicitPlaylistId) || await findVideoCategory(youtube, videoId);
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
      category: category,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('MongoDB 연결 시도 (import)...');
    client = await connectDB;
    const db = client.db('Yu');

    const existingVideo = await db.collection('youtube_videos').findOne({ videoId });
    if (existingVideo) {
      await db.collection('youtube_videos').updateOne(
        { videoId },
        { $set: { ...videoData, updatedAt: new Date() } }
      );
      console.log('YouTube 영상이 업데이트됨 (import):', { videoId, title: videoData.title, category });
    } else {
      const result = await db.collection('youtube_videos').insertOne(videoData);
      console.log('YouTube 영상이 갤러리에 추가됨 (import):', { videoId, title: videoData.title, category, _id: result.insertedId });
    }

    const routeCategory = category === 'MV' ? 'MV' : 'VIDEO';
    revalidatePath(`/GALLERY/${routeCategory}`);
  } catch (error) {
    console.error('YouTube 영상 정보 가져오기 오류 (import):', error);
  } finally {
    if (client) {
      // 연결 풀 사용 - 명시적 종료 불필요
    }
  }
}

function normalizeCategory(value) {
  if (!value || typeof value !== 'string') return undefined;
  const v = value.trim().toUpperCase();
  if (v === 'MV' || v === 'VIDEO') return v;
  return undefined;
}

function mapPlaylistToCategory(playlistId) {
  if (!playlistId) return undefined;
  const mvId = process.env.YOUTUBE_MV_PLAYLIST_ID?.trim();
  const videoId = process.env.YOUTUBE_VIDEO_PLAYLIST_ID?.trim();
  if (mvId && playlistId === mvId) return 'MV';
  if (videoId && playlistId === videoId) return 'VIDEO';
  return undefined;
}

async function findVideoCategory(youtube, videoId) {
  try {
    const mvPlaylistId = process.env.YOUTUBE_MV_PLAYLIST_ID;
    const videoPlaylistId = process.env.YOUTUBE_VIDEO_PLAYLIST_ID;

    if (mvPlaylistId) {
      const mvResponse = await youtube.playlistItems.list({ part: 'snippet', playlistId: mvPlaylistId, videoId });
      if (mvResponse.data.items && mvResponse.data.items.length > 0) return 'MV';
    }
    if (videoPlaylistId) {
      const videoResponse = await youtube.playlistItems.list({ part: 'snippet', playlistId: videoPlaylistId, videoId });
      if (videoResponse.data.items && videoResponse.data.items.length > 0) return 'VIDEO';
    }
    return 'VIDEO';
  } catch (error) {
    console.error('재생목록 확인 오류 (import):', error);
    return 'VIDEO';
  }
}


