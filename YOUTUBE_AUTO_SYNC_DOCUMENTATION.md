# YouTube 자동 동기화 시스템 완전 가이드

## 📋 목차
1. [시스템 개요](#시스템-개요)
2. [아키텍처 설계](#아키텍처-설계)
3. [코드 상세 분석](#코드-상세-분석)
4. [설정 가이드](#설정-가이드)
5. [사용법](#사용법)
6. [문제 해결](#문제-해결)
7. [보안 고려사항](#보안-고려사항)

---

## 🎯 시스템 개요

### 목적
YouTube 채널에 새 영상이 업로드될 때 자동으로 웹사이트 갤러리의 video 카테고리에 iframe으로 표시하는 시스템

### 핵심 기능
- ✅ **실시간 자동 동기화**: YouTube 업로드 → 즉시 갤러리 추가
- ✅ **수동 동기화**: 기존 영상들을 한 번에 가져오기
- ✅ **웹훅 관리**: 구독 설정/해제
- ✅ **관리자 인터페이스**: 설정 및 모니터링

---

## 🏗️ 아키텍처 설계

### 전체 시스템 플로우
```
YouTube 채널 → PubSubHubbub → 웹훅 → Next.js API → MongoDB → 갤러리 UI
```

### 컴포넌트 구조
```
app/
├── api/youtube/
│   ├── webhook/route.js      # 웹훅 수신 및 처리
│   ├── sync/route.js         # 수동 동기화
│   ├── subscribe/route.js    # 구독 관리
│   └── test-api/route.js     # API 테스트
├── admin/youtube/setup/
│   └── page.jsx              # 관리자 인터페이스
└── components/gallery/
    └── VideoItem.jsx         # 영상 표시 컴포넌트
```

---

## 🔍 코드 상세 분석

### 1. 웹훅 핸들러 (`app/api/youtube/webhook/route.js`)

#### 주요 기능
- YouTube PubSubHubbub 웹훅 수신
- 구독 확인 처리
- XML 데이터 파싱
- 자동 갤러리 추가

#### 코드 분석
```javascript
export async function POST(request) {
  try {
    const body = await request.text();
    
    // 1. 구독 확인 요청 처리
    if (request.headers.get('x-hub-mode') === 'subscribe') {
      const challenge = request.nextUrl.searchParams.get('hub.challenge');
      const verifyToken = request.nextUrl.searchParams.get('hub.verify_token');
      
      // 토큰 검증
      if (verifyToken === process.env.YOUTUBE_VERIFY_TOKEN) {
        console.log('YouTube 웹훅 구독 확인됨:', topic);
        return new Response(challenge, { status: 200 });
      } else {
        return new Response('Forbidden', { status: 403 });
      }
    }
    
    // 2. 실제 알림 데이터 처리
    if (request.headers.get('content-type')?.includes('application/atom+xml')) {
      console.log('YouTube 알림 수신:', body);
      
      // XML에서 영상 ID 추출
      const videoId = extractVideoIdFromXML(body);
      
      if (videoId) {
        // YouTube Data API로 영상 정보 가져와서 저장
        await fetchVideoAndSaveToGallery(videoId);
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('YouTube 웹훅 처리 오류:', error);
    return NextResponse.json({ error: '웹훅 처리 실패' }, { status: 500 });
  }
}
```

#### 핵심 함수들

**XML 파싱 함수**
```javascript
function extractVideoIdFromXML(xmlBody) {
  try {
    const videoIdMatch = xmlBody.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    return videoIdMatch ? videoIdMatch[1] : null;
  } catch (error) {
    console.error('XML 파싱 오류:', error);
    return null;
  }
}
```

**영상 정보 가져오기 및 저장**
```javascript
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
    if (!video) return;
    
    // 데이터베이스에 저장할 객체 생성
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
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // MongoDB에 저장
    const client = await connectDB;
    const db = client.db("Yu");
    const result = await db.collection("video").insertOne(videoData);
    
    console.log('YouTube 영상이 갤러리에 추가됨:', {
      videoId,
      title: videoData.title,
      _id: result.insertedId
    });
    
  } catch (error) {
    console.error('YouTube 영상 정보 가져오기 오류:', error);
  }
}
```

### 2. 동기화 API (`app/api/youtube/sync/route.js`)

#### POST 요청 - 수동 동기화
```javascript
export async function POST(request) {
  try {
    const { maxResults = 10 } = await request.json();
    
    const { google } = await import('googleapis');
    const youtube = google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY
    });
    
    // 채널의 최신 영상들 가져오기
    const searchResponse = await youtube.search.list({
      part: 'snippet',
      channelId: process.env.YOUTUBE_CHANNEL_ID,
      type: 'video',
      order: 'date',
      maxResults: maxResults
    });
    
    const videos = searchResponse.data.items || [];
    const client = await connectDB;
    const db = client.db("Yu");
    
    let addedCount = 0;
    let updatedCount = 0;
    
    // 각 영상 처리
    for (const video of videos) {
      const videoId = video.id.videoId;
      const existingVideo = await db.collection("video").findOne({ videoId });
      
      const videoData = {
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.default?.url,
        videoId: videoId,
        youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        publishedAt: new Date(video.snippet.publishedAt),
        channelTitle: video.snippet.channelTitle,
        updatedAt: new Date()
      };
      
      if (existingVideo) {
        // 기존 영상 업데이트
        await db.collection("video").updateOne(
          { videoId },
          { $set: { ...videoData, updatedAt: new Date() } }
        );
        updatedCount++;
      } else {
        // 새 영상 추가
        await db.collection("video").insertOne({
          ...videoData,
          createdAt: new Date()
        });
        addedCount++;
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `동기화 완료: ${addedCount}개 추가, ${updatedCount}개 업데이트`,
      addedCount,
      updatedCount,
      totalProcessed: videos.length
    });
    
  } catch (error) {
    console.error('YouTube 동기화 오류:', error);
    return NextResponse.json({ 
      error: '동기화 실패', 
      details: error.message 
    }, { status: 500 });
  }
}
```

#### GET 요청 - 채널 정보 조회
```javascript
export async function GET() {
  try {
    const { google } = await import('googleapis');
    const youtube = google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY
    });
    
    const channelId = process.env.YOUTUBE_CHANNEL_ID;
    if (!channelId) {
      return NextResponse.json({ error: 'YouTube 채널 ID가 설정되지 않았습니다' }, { status: 400 });
    }
    
    // 채널 정보 가져오기
    const channelResponse = await youtube.channels.list({
      part: 'snippet,statistics',
      id: channelId
    });
    
    const channel = channelResponse.data.items?.[0];
    if (!channel) {
      return NextResponse.json({ error: '채널을 찾을 수 없습니다' }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      channel: {
        title: channel.snippet.title,
        description: channel.snippet.description,
        subscriberCount: channel.statistics.subscriberCount,
        videoCount: channel.statistics.videoCount,
        viewCount: channel.statistics.viewCount
      }
    });
    
  } catch (error) {
    console.error('YouTube 채널 정보 가져오기 오류:', error);
    return NextResponse.json({ 
      error: '채널 정보 가져오기 실패', 
      details: error.message 
    }, { status: 500 });
  }
}
```

### 3. 구독 관리 API (`app/api/youtube/subscribe/route.js`)

#### POST 요청 - 웹훅 구독 설정
```javascript
export async function POST(request) {
  try {
    const { google } = await import('googleapis');
    const youtube = google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY
    });
    
    const channelId = process.env.YOUTUBE_CHANNEL_ID;
    if (!channelId) {
      return NextResponse.json({ error: 'YouTube 채널 ID가 설정되지 않았습니다' }, { status: 400 });
    }
    
    // 웹훅 URL 설정
    const webhookUrl = `${process.env.NEXTAUTH_URL}/api/youtube/webhook`;
    const verifyToken = process.env.YOUTUBE_VERIFY_TOKEN;
    
    // PubSubHubbub 구독 요청
    const subscribeUrl = 'https://pubsubhubbub.appspot.com/subscribe';
    const topicUrl = `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${channelId}`;
    
    const subscribeData = new URLSearchParams({
      'hub.callback': webhookUrl,
      'hub.topic': topicUrl,
      'hub.verify': 'async',
      'hub.mode': 'subscribe',
      'hub.verify_token': verifyToken,
      'hub.secret': process.env.YOUTUBE_WEBHOOK_SECRET || ''
    });
    
    const response = await fetch(subscribeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: subscribeData.toString()
    });
    
    if (response.ok) {
      console.log('YouTube 웹훅 구독 성공');
      return NextResponse.json({
        success: true,
        message: 'YouTube 웹훅 구독이 설정되었습니다',
        webhookUrl,
        topicUrl
      });
    } else {
      const errorText = await response.text();
      console.error('YouTube 웹훅 구독 실패:', errorText);
      return NextResponse.json({
        error: '웹훅 구독 실패',
        details: errorText
      }, { status: response.status });
    }
    
  } catch (error) {
    console.error('YouTube 구독 설정 오류:', error);
    return NextResponse.json({
      error: '구독 설정 실패',
      details: error.message
    }, { status: 500 });
  }
}
```

#### DELETE 요청 - 웹훅 구독 해제
```javascript
export async function DELETE() {
  try {
    const channelId = process.env.YOUTUBE_CHANNEL_ID;
    if (!channelId) {
      return NextResponse.json({ error: 'YouTube 채널 ID가 설정되지 않았습니다' }, { status: 400 });
    }
    
    const webhookUrl = `${process.env.NEXTAUTH_URL}/api/youtube/webhook`;
    const verifyToken = process.env.YOUTUBE_VERIFY_TOKEN;
    const topicUrl = `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${channelId}`;
    
    const unsubscribeData = new URLSearchParams({
      'hub.callback': webhookUrl,
      'hub.topic': topicUrl,
      'hub.verify': 'async',
      'hub.mode': 'unsubscribe',
      'hub.verify_token': verifyToken,
      'hub.secret': process.env.YOUTUBE_WEBHOOK_SECRET || ''
    });
    
    const response = await fetch('https://pubsubhubbub.appspot.com/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: unsubscribeData.toString()
    });
    
    if (response.ok) {
      console.log('YouTube 웹훅 구독 해제 성공');
      return NextResponse.json({
        success: true,
        message: 'YouTube 웹훅 구독이 해제되었습니다'
      });
    } else {
      const errorText = await response.text();
      console.error('YouTube 웹훅 구독 해제 실패:', errorText);
      return NextResponse.json({
        error: '웹훅 구독 해제 실패',
        details: errorText
      }, { status: response.status });
    }
    
  } catch (error) {
    console.error('YouTube 구독 해제 오류:', error);
    return NextResponse.json({
      error: '구독 해제 실패',
      details: error.message
    }, { status: 500 });
  }
}
```

### 4. 관리자 인터페이스 (`app/admin/youtube/setup/page.jsx`)

#### 주요 기능
- 웹훅 구독 설정/해제
- 수동 동기화 실행
- 채널 정보 확인
- 실시간 상태 모니터링

#### 핵심 함수들

**웹훅 구독 설정**
```javascript
const handleSubscribe = async () => {
  setIsLoading(true);
  setMessage('');
  
  try {
    const response = await fetch('/api/youtube/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    
    const data = await response.json();
    
    if (data.success) {
      setMessage(`✅ ${data.message}`);
    } else {
      setMessage(`❌ ${data.error}: ${data.details}`);
    }
  } catch (error) {
    setMessage(`❌ 오류: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
};
```

**수동 동기화**
```javascript
const handleSync = async () => {
  setIsLoading(true);
  setMessage('');
  
  try {
    const response = await fetch('/api/youtube/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maxResults: 20 }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      setMessage(`✅ ${data.message}`);
    } else {
      setMessage(`❌ ${data.error}: ${data.details}`);
    }
  } catch (error) {
    setMessage(`❌ 오류: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
};
```

### 5. 영상 표시 컴포넌트 (`components/gallery/VideoItem.jsx`)

#### YouTube 영상과 로컬 영상 구분 표시
```javascript
export default function VideoItem({ item, category, session }) {
  // YouTube 영상인지 확인
  const isYouTubeVideo = item.videoId || item.youtubeUrl || item.embedUrl;
  
  return (
    <div className="relative group w-full flex justify-center">
      {isYouTubeVideo ? (
        // YouTube 영상 iframe
        <div className="w-5/6 max-w-lg">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={item.embedUrl || `https://www.youtube.com/embed/${item.videoId}`}
              title={item.title || 'YouTube 영상'}
              className="absolute top-0 left-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {item.title && (
            <div className="mt-2 text-center">
              <h3 className="text-sm font-medium text-gray-300 truncate">{item.title}</h3>
              {item.channelTitle && (
                <p className="text-xs text-gray-500 mt-1">{item.channelTitle}</p>
              )}
            </div>
          )}
        </div>
      ) : item.mainVideo ? (
        // 로컬 영상
        <video
          id="player"
          src={item.mainVideo}
          className="w-3/5 max-w-lg h-auto object-contain"
          controls
          preload="metadata"
          playsInline
          webkit-playsinline="true"
          x-webkit-airplay="allow"
        />
      ) : (
        <div className="w-5/6 max-w-lg h-56 bg-gray-800 flex items-center justify-center text-gray-400">
          영상이 없습니다
        </div>
      )}
      {session && (
        <div className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
          <DeleteButton category={category} id={item._id} />
        </div>
      )}
    </div>
  );
}
```

---

## ⚙️ 설정 가이드

### 1. 환경변수 설정
```env
# YouTube API 설정
YOUTUBE_API_KEY=your_youtube_api_key_here
YOUTUBE_CHANNEL_ID=your_channel_id_here
YOUTUBE_VERIFY_TOKEN=your_verify_token_here
YOUTUBE_WEBHOOK_SECRET=your_webhook_secret_here

# NextAuth 설정
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### 2. 패키지 설치
```bash
npm install googleapis
```

### 3. YouTube Data API 설정
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. YouTube Data API v3 활성화
4. API 키 생성 및 제한 설정

### 4. 채널 ID 찾기
- YouTube Studio → 설정 → 채널 → 고급 설정
- 또는 채널 URL에서 확인: `https://www.youtube.com/channel/UCxxxxxxxxxxxxxxxxxxxxxx`

---

## 🚀 사용법

### 1. 초기 설정
1. `/admin/youtube/setup` 페이지 접속
2. "채널 정보 확인" 클릭하여 연결 테스트
3. "웹훅 구독 설정" 클릭
4. "최신 영상 동기화"로 기존 영상들 가져오기

### 2. 자동 동기화
- YouTube에서 새 영상 업로드
- 자동으로 갤러리에 추가됨 (수동 작업 불필요)

### 3. 수동 동기화
- 관리자 페이지에서 "최신 영상 동기화" 클릭
- 최대 20개의 최신 영상을 가져와서 갤러리에 추가

---

## 🔧 문제 해결

### 1. 웹훅 구독 실패
**원인**: 서버가 외부에서 접근 불가능
**해결**: ngrok 사용
```bash
npm install -g ngrok
ngrok http 3000
# 결과 URL을 NEXTAUTH_URL로 설정
```

### 2. API 키 오류
**원인**: YouTube Data API v3 미활성화 또는 권한 부족
**해결**: Google Cloud Console에서 API 활성화 확인

### 3. 채널 ID 오류
**원인**: 잘못된 채널 ID 또는 비공개 채널
**해결**: 채널 ID 재확인 및 공개 설정 확인

### 4. 웹훅 알림 수신 안됨
**원인**: 구독 해제됨 또는 서버 다운
**해결**: 
1. 구독 상태 재확인
2. 수동 동기화로 백업
3. 서버 상태 확인

---

## 🔒 보안 고려사항

### 1. API 키 보안
- API 키를 환경변수로 관리
- `.env.local` 파일을 `.gitignore`에 추가
- 프로덕션에서는 API 키 제한 설정

### 2. 웹훅 보안
- `YOUTUBE_VERIFY_TOKEN`을 복잡하게 설정
- 웹훅 시크릿 사용 (선택사항)
- HTTPS 사용 필수 (프로덕션)

### 3. 데이터베이스 보안
- MongoDB 연결 보안 설정
- 영상 데이터 검증
- 악성 데이터 필터링

---

## 📊 모니터링 및 로그

### 1. 콘솔 로그 확인
```javascript
// 웹훅 수신 로그
console.log('YouTube 알림 수신:', body);

// 영상 추가 로그
console.log('YouTube 영상이 갤러리에 추가됨:', {
  videoId,
  title: videoData.title,
  _id: result.insertedId
});
```

### 2. 에러 로그 확인
```javascript
// 웹훅 처리 오류
console.error('YouTube 웹훅 처리 오류:', error);

// API 오류
console.error('YouTube 영상 정보 가져오기 오류:', error);
```

### 3. 성능 모니터링
- YouTube API 할당량 사용량 확인
- 웹훅 응답 시간 모니터링
- 데이터베이스 쿼리 성능 확인

---

## 🎯 성공 지표

### 1. 자동 동기화 성공률
- 웹훅 수신 성공률: 95% 이상
- 영상 추가 성공률: 98% 이상

### 2. 응답 시간
- 웹훅 처리 시간: 5초 이내
- API 호출 시간: 3초 이내

### 3. 사용자 경험
- 갤러리 로딩 시간: 2초 이내
- 영상 재생 성공률: 99% 이상

---

## 📝 추가 개선 사항

### 1. 기능 확장
- [ ] 영상 카테고리 자동 분류
- [ ] 썸네일 자동 최적화
- [ ] 영상 메타데이터 확장
- [ ] 다중 채널 지원

### 2. 성능 최적화
- [ ] 캐싱 시스템 도입
- [ ] 배치 처리 최적화
- [ ] 데이터베이스 인덱싱
- [ ] CDN 연동

### 3. 모니터링 강화
- [ ] 실시간 대시보드
- [ ] 알림 시스템
- [ ] 성능 메트릭 수집
- [ ] 자동 복구 시스템

---

## 🏆 결론

이 YouTube 자동 동기화 시스템은 다음과 같은 장점을 제공합니다:

✅ **완전 자동화**: 수동 작업 없이 새 영상이 자동 추가
✅ **실시간 동기화**: 영상 업로드 즉시 갤러리에 반영
✅ **안정성**: 웹훅 실패 시 수동 동기화로 백업
✅ **확장성**: 추가 기능 구현이 용이한 구조
✅ **보안성**: 토큰 기반 인증 및 데이터 검증

이 시스템을 통해 YouTube 채널과 웹사이트 갤러리를 완벽하게 연동할 수 있습니다! 🎉
