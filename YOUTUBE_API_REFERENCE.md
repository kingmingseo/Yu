# YouTube 자동 동기화 API 레퍼런스

## 📡 API 엔드포인트 목록

### 1. 웹훅 수신 (`/api/youtube/webhook`)

#### POST - YouTube 알림 수신
```http
POST /api/youtube/webhook
Content-Type: application/atom+xml
```

**요청 본문 (XML)**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015">
  <entry>
    <yt:videoId>ABC123DEF456</yt:videoId>
    <title>새로운 영상 제목</title>
    <link rel="alternate" href="https://www.youtube.com/watch?v=ABC123DEF456"/>
  </entry>
</feed>
```

**응답**
```json
{
  "success": true
}
```

#### GET - 구독 확인
```http
GET /api/youtube/webhook?hub.mode=subscribe&hub.challenge=abc123&hub.verify_token=my_token
```

**응답**
```
abc123
```

---

### 2. 동기화 관리 (`/api/youtube/sync`)

#### POST - 수동 동기화
```http
POST /api/youtube/sync
Content-Type: application/json

{
  "maxResults": 20
}
```

**응답**
```json
{
  "success": true,
  "message": "동기화 완료: 5개 추가, 3개 업데이트",
  "addedCount": 5,
  "updatedCount": 3,
  "totalProcessed": 8
}
```

#### GET - 채널 정보 조회
```http
GET /api/youtube/sync
```

**응답**
```json
{
  "success": true,
  "channel": {
    "title": "채널명",
    "description": "채널 설명",
    "subscriberCount": "1000",
    "videoCount": "50",
    "viewCount": "100000"
  }
}
```

---

### 3. 구독 관리 (`/api/youtube/subscribe`)

#### POST - 웹훅 구독 설정
```http
POST /api/youtube/subscribe
```

**응답**
```json
{
  "success": true,
  "message": "YouTube 웹훅 구독이 설정되었습니다",
  "webhookUrl": "https://yoursite.com/api/youtube/webhook",
  "topicUrl": "https://www.youtube.com/xml/feeds/videos.xml?channel_id=UCxxxxx"
}
```

#### DELETE - 웹훅 구독 해제
```http
DELETE /api/youtube/subscribe
```

**응답**
```json
{
  "success": true,
  "message": "YouTube 웹훅 구독이 해제되었습니다"
}
```

---

### 4. API 테스트 (`/api/youtube/test-api`)

#### GET - API 연결 테스트
```http
GET /api/youtube/test-api
```

**응답**
```json
{
  "success": true,
  "channel": {
    "id": "UCxxxxx",
    "title": "채널명",
    "subscriberCount": "1000",
    "videoCount": "50",
    "viewCount": "100000"
  },
  "recentVideos": [
    {
      "videoId": "ABC123DEF456",
      "title": "영상 제목",
      "publishedAt": "2024-01-15T10:30:00Z",
      "thumbnail": "https://i.ytimg.com/vi/ABC123DEF456/hqdefault.jpg",
      "url": "https://www.youtube.com/watch?v=ABC123DEF456"
    }
  ]
}
```

---

## 🗄️ 데이터베이스 스키마

### video 컬렉션
```javascript
{
  _id: ObjectId("..."),
  videoId: "ABC123DEF456",                    // YouTube 영상 ID
  title: "영상 제목",                          // 영상 제목
  description: "영상 설명...",                 // 영상 설명
  thumbnail: "https://i.ytimg.com/vi/...",     // 썸네일 URL
  youtubeUrl: "https://www.youtube.com/watch?v=ABC123DEF456",  // YouTube URL
  embedUrl: "https://www.youtube.com/embed/ABC123DEF456",      // 임베드 URL
  publishedAt: ISODate("2024-01-15T10:30:00Z"), // 업로드 날짜
  channelTitle: "채널명",                     // 채널명
  viewCount: 1000,                            // 조회수
  likeCount: 50,                              // 좋아요 수
  createdAt: ISODate("2024-01-15T10:30:05Z"), // 생성일
  updatedAt: ISODate("2024-01-15T10:30:05Z")  // 수정일
}
```

---

## 🔧 환경변수

### 필수 환경변수
```env
YOUTUBE_API_KEY=your_youtube_api_key_here
YOUTUBE_CHANNEL_ID=your_channel_id_here
YOUTUBE_VERIFY_TOKEN=your_verify_token_here
NEXTAUTH_URL=http://localhost:3000
```

### 선택적 환경변수
```env
YOUTUBE_WEBHOOK_SECRET=your_webhook_secret_here
```

---

## 📊 에러 코드

### HTTP 상태 코드
- `200` - 성공
- `400` - 잘못된 요청 (필수 파라미터 누락)
- `403` - 권한 없음 (토큰 검증 실패)
- `404` - 리소스 없음 (채널을 찾을 수 없음)
- `500` - 서버 오류 (API 오류, 데이터베이스 오류)

### 에러 응답 형식
```json
{
  "error": "에러 메시지",
  "details": "상세 에러 정보",
  "troubleshooting": {
    "checkApiKey": "YouTube Data API v3가 활성화되었는지 확인하세요",
    "checkChannelId": "채널 ID가 올바른지 확인하세요"
  }
}
```

---

## 🔄 워크플로우

### 1. 초기 설정
```
1. 환경변수 설정
2. 패키지 설치 (googleapis)
3. YouTube API 키 생성
4. 채널 ID 확인
```

### 2. 구독 설정
```
1. POST /api/youtube/subscribe 호출
2. YouTube가 GET /api/youtube/webhook으로 확인 요청
3. 구독 완료
```

### 3. 자동 동기화
```
1. YouTube에서 새 영상 업로드
2. YouTube가 POST /api/youtube/webhook으로 알림 전송
3. XML 데이터에서 영상 ID 추출
4. YouTube Data API로 상세 정보 조회
5. MongoDB에 저장
6. 갤러리에 자동 반영
```

### 4. 수동 동기화
```
1. POST /api/youtube/sync 호출
2. YouTube Data API로 최신 영상들 조회
3. 각 영상의 상세 정보 조회
4. MongoDB에 저장/업데이트
5. 갤러리에 반영
```

---

## 🛡️ 보안 고려사항

### 1. 토큰 검증
```javascript
// 웹훅 수신 시 토큰 검증
const verifyToken = request.nextUrl.searchParams.get('hub.verify_token');
if (verifyToken !== process.env.YOUTUBE_VERIFY_TOKEN) {
  return new Response('Forbidden', { status: 403 });
}
```

### 2. API 키 보안
- API 키를 환경변수로 관리
- `.env.local` 파일을 `.gitignore`에 추가
- 프로덕션에서는 API 키 제한 설정

### 3. HTTPS 사용
- 프로덕션 환경에서는 HTTPS 필수
- 웹훅 URL이 HTTPS로 시작해야 함

---

## 📈 성능 최적화

### 1. API 할당량 관리
- YouTube Data API 일일 할당량: 10,000 units
- 한 번의 동기화당 약 100 units 사용
- 과도한 사용 방지를 위한 제한 필요

### 2. 데이터베이스 최적화
```javascript
// videoId로 인덱스 생성
db.video.createIndex({ "videoId": 1 })

// 중복 방지
const existingVideo = await db.collection("video").findOne({ videoId });
```

### 3. 캐싱 전략
- 채널 정보 캐싱
- 영상 메타데이터 캐싱
- 썸네일 이미지 최적화

---

## 🔍 디버깅

### 1. 로그 확인
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

### 2. API 테스트
```bash
# API 연결 테스트
curl http://localhost:3000/api/youtube/test-api

# 수동 동기화 테스트
curl -X POST http://localhost:3000/api/youtube/sync \
  -H "Content-Type: application/json" \
  -d '{"maxResults": 5}'
```

### 3. 웹훅 테스트
```bash
# ngrok으로 로컬 서버 노출
ngrok http 3000

# 웹훅 URL 확인
echo $NEXTAUTH_URL/api/youtube/webhook
```

---

## 🎯 모니터링 지표

### 1. 성공률
- 웹훅 수신 성공률: 95% 이상
- 영상 추가 성공률: 98% 이상
- API 호출 성공률: 99% 이상

### 2. 응답 시간
- 웹훅 처리 시간: 5초 이내
- API 호출 시간: 3초 이내
- 데이터베이스 쿼리 시간: 1초 이내

### 3. 사용량
- YouTube API 할당량 사용량
- 웹훅 알림 수신 횟수
- 동기화된 영상 수

---

이 API 레퍼런스를 통해 YouTube 자동 동기화 시스템을 완벽하게 이해하고 활용할 수 있습니다! 🚀
