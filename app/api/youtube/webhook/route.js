import { NextResponse } from 'next/server';
import { connectDB } from '@/util/database';
import { revalidatePath } from 'next/cache';

// YouTube PubSubHubbub 웹훅 처리
export async function POST(request) {
  try {
    const body = await request.text();
    const contentType = request.headers.get('content-type') || '';
    
    console.log('POST 요청 수신 - 헤더:', Object.fromEntries(request.headers.entries()));
    console.log('POST 요청 수신 - Content-Type:', contentType);
    console.log('POST 요청 수신 - Body(앞 200자):', body.substring(0, 200));
    
    // YouTube에서 보내는 구독 확인 요청 처리 (GET 요청에서 처리됨)
    // POST 요청은 실제 알림 데이터만 처리
    
    // 실제 알림 데이터 처리
    const isXmlLike = /atom\+xml|application\/xml|text\/xml/i.test(contentType);
    if (isXmlLike || body.includes('<feed')) {
      // XML 파싱하여 새로운 영상 정보 추출
      const videoId = extractVideoIdFromXML(body);
      
      if (videoId) {
        console.log('비디오 ID 추출됨:', videoId);
        // YouTube Data API를 통해 영상 정보 가져오기
        await fetchVideoAndSaveToGallery(videoId);
      } else {
        console.log('비디오 ID 추출 실패 - 본문에 yt:videoId가 없거나 형식이 다릅니다.');
      }
    } else {
      console.log('XML 형식이 아닌 요청으로 판단됨 - Content-Type:', contentType);
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
    // 표준: <yt:videoId>VIDEO_ID</yt:videoId>
    const videoIdMatch = xmlBody.match(/<yt:videoId>([^<]+)<\/yt:videoId>/i);
    if (videoIdMatch) return videoIdMatch[1];
    
    // 보조: 링크에서 추출 https://www.youtube.com/watch?v=VIDEO_ID
    const linkMatch = xmlBody.match(/https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([\w-]{11})/i);
    if (linkMatch) return linkMatch[1];
    
    // tombstone(삭제) 이벤트 등은 스킵
    return null;
  } catch (error) {
    console.error('XML 파싱 오류:', error);
    return null;
  }
}

// YouTube Data API를 통해 영상 정보 가져와서 갤러리에 저장
async function fetchVideoAndSaveToGallery(videoId) {
  let client;
  try {
    console.log('YouTube 영상 정보 가져오기 시작:', videoId);
    
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
    
    console.log('영상 정보 조회 성공:', video.snippet.title);
    
    // 영상이 속한 재생목록 찾기
    const category = await findVideoCategory(youtube, videoId);
    console.log('영상 카테고리 결정:', category);
    
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
    
    // MongoDB 연결 시도
    console.log('MongoDB 연결 시도...');
    client = await connectDB;
    const db = client.db("Yu");
    console.log('MongoDB 연결 성공');
    
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

    // 갤러리 경로 캐시 무효화
    const routeCategory = category === 'MV' ? 'MV' : 'VIDEO';
    revalidatePath(`/GALLERY/${routeCategory}`);
    
  } catch (error) {
    console.error('YouTube 영상 정보 가져오기 오류:', error);
    
    // MongoDB 연결 오류인 경우 재시도 로직 추가
    if (error.name === 'MongoNetworkTimeoutError' || error.name === 'MongoServerSelectionError') {
      console.log('MongoDB 연결 오류 - 재시도 시도...');
      // 재시도 로직은 나중에 구현
    }
  } finally {
    // 클라이언트 연결 정리 (필요한 경우)
    if (client) {
      // MongoDB 클라이언트는 연결 풀을 사용하므로 명시적 종료 불필요
    }
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
  // URL에서 쿼리 직접 파싱 (일부 프록시/플랫폼에서 dot 키 이슈 대응)
  const url = new URL(request.url);
  const params = url.searchParams;
  
  // hub.* 우선, 그 외 대체 키들도 허용
  const mode = params.get('hub.mode') || params.get('hub_mode') || params.get('mode');
  const challenge = params.get('hub.challenge') || params.get('hub_challenge') || params.get('challenge');
  const verifyToken = params.get('hub.verify_token') || params.get('hub_verify_token') || params.get('verify_token') || params.get('verifyToken') || params.get('token');
  
  console.log('GET 요청 수신 - URL:', request.url);
  console.log('GET 요청 수신 - mode:', mode);
  console.log('GET 요청 수신 - challenge:', challenge);
  console.log('GET 요청 수신 - verifyToken:', verifyToken);
  console.log('GET 요청 수신 - 환경변수 토큰:', process.env.YOUTUBE_VERIFY_TOKEN);
  console.log('GET 요청 수신 - 토큰 일치 여부:', verifyToken === process.env.YOUTUBE_VERIFY_TOKEN);
  
  if ((mode === 'subscribe' || mode === 'unsubscribe') && verifyToken === process.env.YOUTUBE_VERIFY_TOKEN) {
    console.log('YouTube 웹훅 구독 확인 성공');
    return new Response(challenge ?? '', { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }
  
  console.log('YouTube 웹훅 구독 확인 실패 - 403 반환');
  return new Response('Forbidden', { status: 403 });
}

