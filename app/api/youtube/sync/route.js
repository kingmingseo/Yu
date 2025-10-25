import { NextResponse } from 'next/server';
import { connectDB } from '@/util/database';
import { revalidatePath } from 'next/cache';

// 재생목록 기반 동기화 API
export async function POST(request) {
  try {
    const { maxResults = 10 } = await request.json();
    
    const { google } = await import('googleapis');
    const youtube = google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY
    });
    
    // 재생목록 ID들 가져오기
    const mvPlaylistId = process.env.YOUTUBE_MV_PLAYLIST_ID;
    const videoPlaylistId = process.env.YOUTUBE_VIDEO_PLAYLIST_ID;
    
    if (!mvPlaylistId || !videoPlaylistId) {
      return NextResponse.json({ 
        error: '재생목록 ID가 설정되지 않았습니다',
        requiredEnvVars: [
          'YOUTUBE_MV_PLAYLIST_ID',
          'YOUTUBE_VIDEO_PLAYLIST_ID'
        ]
      }, { status: 400 });
    }
    
    const client = await connectDB;
    const db = client.db("Yu");
    
    let totalAdded = 0;
    let totalUpdated = 0;
    
    // M/V 재생목록 동기화
    console.log('M/V 재생목록 동기화 시작...');
    const mvResult = await syncPlaylist(youtube, mvPlaylistId, 'MV', maxResults, db);
    totalAdded += mvResult.added;
    totalUpdated += mvResult.updated;
    
    // VIDEO 재생목록 동기화
    console.log('VIDEO 재생목록 동기화 시작...');
    const videoResult = await syncPlaylist(youtube, videoPlaylistId, 'VIDEO', maxResults, db);
    totalAdded += videoResult.added;
    totalUpdated += videoResult.updated;
    
    // MV/VIDEO 페이지 캐시 무효화
    revalidatePath('/GALLERY/MV');
    revalidatePath('/GALLERY/VIDEO');

    return NextResponse.json({
      success: true,
      message: `재생목록 동기화 완료: ${totalAdded}개 추가, ${totalUpdated}개 업데이트`,
      results: {
        MV: mvResult,
        VIDEO: videoResult
      },
      totalAdded,
      totalUpdated
    });
    
  } catch (error) {
    console.error('재생목록 동기화 오류:', error);
    return NextResponse.json({ 
      error: '재생목록 동기화 실패', 
      details: error.message 
    }, { status: 500 });
  }
}

// 재생목록 동기화 함수
async function syncPlaylist(youtube, playlistId, category, maxResults, db) {
  try {
    // 재생목록의 영상들 가져오기
    const playlistResponse = await youtube.playlistItems.list({
      part: 'snippet',
      playlistId: playlistId,
      maxResults: maxResults
    });
    
    const playlistItems = playlistResponse.data.items || [];
    let added = 0;
    let updated = 0;
    
    for (const item of playlistItems) {
      const videoId = item.snippet.resourceId.videoId;
      
      // 영상 상세 정보 가져오기
      const videoResponse = await youtube.videos.list({
        part: 'snippet,statistics',
        id: videoId
      });
      
      const video = videoResponse.data.items?.[0];
      if (!video) continue;
      
      // 기존 영상 확인
      const existingVideo = await db.collection("youtube_videos").findOne({ 
        videoId: videoId 
      });
      
      const videoData = {
        videoId: videoId,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.default?.url,
        youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        publishedAt: new Date(video.snippet.publishedAt),
        channelTitle: video.snippet.channelTitle,
        viewCount: video.statistics?.viewCount || 0,
        likeCount: video.statistics?.likeCount || 0,
        playlistId: playlistId,
        category: category,
        updatedAt: new Date()
      };
      
      if (existingVideo) {
        // 기존 영상 업데이트
        await db.collection("youtube_videos").updateOne(
          { videoId: videoId },
          { 
            $set: {
              ...videoData,
              updatedAt: new Date()
            }
          }
        );
        updated++;
      } else {
        // 새 영상 추가
        await db.collection("youtube_videos").insertOne({
          ...videoData,
          createdAt: new Date()
        });
        added++;
      }
    }
    
    return { added, updated, total: playlistItems.length };
    
  } catch (error) {
    console.error(`${category} 재생목록 동기화 오류:`, error);
    return { added: 0, updated: 0, total: 0, error: error.message };
  }
}

// GET - 재생목록 정보 조회
export async function GET() {
  try {
    const { google } = await import('googleapis');
    const youtube = google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY
    });
    
    const mvPlaylistId = process.env.YOUTUBE_MV_PLAYLIST_ID;
    const videoPlaylistId = process.env.YOUTUBE_VIDEO_PLAYLIST_ID;
    
    if (!mvPlaylistId || !videoPlaylistId) {
      return NextResponse.json({ 
        error: '재생목록 ID가 설정되지 않았습니다' 
      }, { status: 400 });
    }
    
    const playlists = [];
    
    // M/V 재생목록 정보
    try {
      const mvResponse = await youtube.playlists.list({
        part: 'snippet,contentDetails',
        id: mvPlaylistId
      });
      const mvPlaylist = mvResponse.data.items?.[0];
      if (mvPlaylist) {
        playlists.push({
          id: mvPlaylist.id,
          title: mvPlaylist.snippet.title,
          description: mvPlaylist.snippet.description,
          thumbnail: mvPlaylist.snippet.thumbnails?.high?.url,
          itemCount: mvPlaylist.contentDetails.itemCount,
          category: 'MV'
        });
      }
    } catch (error) {
      console.error('M/V 재생목록 정보 가져오기 오류:', error);
    }
    
    // VIDEO 재생목록 정보
    try {
      const videoResponse = await youtube.playlists.list({
        part: 'snippet,contentDetails',
        id: videoPlaylistId
      });
      const videoPlaylist = videoResponse.data.items?.[0];
      if (videoPlaylist) {
        playlists.push({
          id: videoPlaylist.id,
          title: videoPlaylist.snippet.title,
          description: videoPlaylist.snippet.description,
          thumbnail: videoPlaylist.snippet.thumbnails?.high?.url,
          itemCount: videoPlaylist.contentDetails.itemCount,
          category: 'VIDEO'
        });
      }
    } catch (error) {
      console.error('VIDEO 재생목록 정보 가져오기 오류:', error);
    }
    
    return NextResponse.json({
      success: true,
      playlists
    });
    
  } catch (error) {
    console.error('재생목록 정보 가져오기 오류:', error);
    return NextResponse.json({ 
      error: '재생목록 정보 가져오기 실패', 
      details: error.message 
    }, { status: 500 });
  }
}
