import { NextResponse } from 'next/server';
import { connectDB } from '@/util/database';

// YouTube PubSubHubbub 웹훅 처리
export async function POST(request) {
  try {
    const body = await request.text();
    
    // YouTube에서 보내는 구독 확인 요청 처리
    if (request.headers.get('x-hub-mode') === 'subscribe') {
      const challenge = request.nextUrl.searchParams.get('hub.challenge');
      const topic = request.nextUrl.searchParams.get('hub.topic');
      const verifyToken = request.nextUrl.searchParams.get('hub.verify_token');
      
      // 토큰 검증 (환경변수에서 설정)
      if (verifyToken === process.env.YOUTUBE_VERIFY_TOKEN) {
        console.log('YouTube 웹훅 구독 확인됨:', topic);
        return new Response(challenge, { status: 200 });
      } else {
        console.log('YouTube 웹훅 토큰 검증 실패');
        return new Response('Forbidden', { status: 403 });
      }
    }
    
    // 실제 알림 데이터 처리
    if (request.headers.get('content-type')?.includes('application/atom+xml')) {
      console.log('YouTube 알림 수신:', body);
      
      // XML 파싱하여 새로운 영상 정보 추출
      const videoId = extractVideoIdFromXML(body);
      
      if (videoId) {
        // YouTube Data API를 통해 영상 정보 가져오기
        await fetchVideoAndSaveToGallery(videoId);
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('YouTube 웹훅 처리 오류:', error);
    return NextResponse.json({ error: '웹훅 처리 실패' }, { status: 500 });
  }
}

// XML에서 비디오 ID 추출
function extractVideoIdFromXML(xmlBody) {
  try {
    const videoIdMatch = xmlBody.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    return videoIdMatch ? videoIdMatch[1] : null;
  } catch (error) {
    console.error('XML 파싱 오류:', error);
    return null;
  }
}

// YouTube Data API를 통해 영상 정보 가져와서 갤러리에 저장
async function fetchVideoAndSaveToGallery(videoId) {
  try {
    const { google } = await import('googleapis');
    
    // YouTube Data API 클라이언트 설정
    const youtube = google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY
    });
    
    // 영상 정보 가져오기
    const response = await youtube.videos.list({
      part: 'snippet,statistics',
      id: videoId
    });
    
    const video = response.data.items?.[0];
    if (!video) {
      console.log('영상을 찾을 수 없습니다:', videoId);
      return;
    }
    
    // 영상이 속한 재생목록 찾기
    const category = await findVideoCategory(youtube, videoId);
    
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
    
    // MongoDB에 저장 (통합 컬렉션)
    const client = await connectDB;
    const db = client.db("Yu");
    
    // 기존 영상 확인
    const existingVideo = await db.collection("youtube_videos").findOne({ videoId });
    
    if (existingVideo) {
      // 기존 영상 업데이트
      await db.collection("youtube_videos").updateOne(
        { videoId },
        { 
          $set: {
            ...videoData,
            updatedAt: new Date()
          }
        }
      );
      console.log('YouTube 영상이 업데이트됨:', {
        videoId,
        title: videoData.title,
        category: category
      });
    } else {
      // 새 영상 추가
      const result = await db.collection("youtube_videos").insertOne(videoData);
      console.log('YouTube 영상이 갤러리에 추가됨:', {
        videoId,
        title: videoData.title,
        category: category,
        _id: result.insertedId
      });
    }
    
  } catch (error) {
    console.error('YouTube 영상 정보 가져오기 오류:', error);
  }
}

// 영상이 속한 재생목록을 찾아서 카테고리 결정
async function findVideoCategory(youtube, videoId) {
  try {
    const mvPlaylistId = process.env.YOUTUBE_MV_PLAYLIST_ID;
    const videoPlaylistId = process.env.YOUTUBE_VIDEO_PLAYLIST_ID;
    
    // M/V 재생목록에서 영상 찾기
    if (mvPlaylistId) {
      const mvResponse = await youtube.playlistItems.list({
        part: 'snippet',
        playlistId: mvPlaylistId,
        videoId: videoId
      });
      
      if (mvResponse.data.items && mvResponse.data.items.length > 0) {
        return 'MV';
      }
    }
    
    // VIDEO 재생목록에서 영상 찾기
    if (videoPlaylistId) {
      const videoResponse = await youtube.playlistItems.list({
        part: 'snippet',
        playlistId: videoPlaylistId,
        videoId: videoId
      });
      
      if (videoResponse.data.items && videoResponse.data.items.length > 0) {
        return 'VIDEO';
      }
    }
    
    // 기본값 (재생목록에 없으면 VIDEO로 분류)
    return 'VIDEO';
    
  } catch (error) {
    console.error('재생목록 확인 오류:', error);
    return 'VIDEO'; // 오류 시 기본값
  }
}

// GET 요청 처리 (웹훅 구독 확인용)
export async function GET(request) {
  const mode = request.nextUrl.searchParams.get('hub.mode');
  const challenge = request.nextUrl.searchParams.get('hub.challenge');
  const verifyToken = request.nextUrl.searchParams.get('hub.verify_token');
  
  if (mode === 'subscribe' && verifyToken === process.env.YOUTUBE_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  
  return new Response('Forbidden', { status: 403 });
}

