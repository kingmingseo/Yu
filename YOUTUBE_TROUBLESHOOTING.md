# YouTube 자동 동기화 문제 해결 가이드

## 🚨 자주 발생하는 문제들

### 1. 웹훅 구독 실패

#### 증상
```
❌ 웹훅 구독 실패
❌ 구독 확인 요청 실패
❌ 403 Forbidden 오류
```

#### 원인 분석
1. **서버가 외부에서 접근 불가능**
2. **잘못된 NEXTAUTH_URL 설정**
3. **토큰 검증 실패**

#### 해결 방법

**1단계: 로컬 개발 환경 확인**
```bash
# ngrok 설치 및 실행
npm install -g ngrok
ngrok http 3000

# 결과 URL을 NEXTAUTH_URL로 설정
NEXTAUTH_URL=https://abc123.ngrok.io
```

**2단계: 환경변수 확인**
```env
# .env.local 파일 확인
NEXTAUTH_URL=https://your-domain.com
YOUTUBE_VERIFY_TOKEN=your_secret_token_here
```

**3단계: 웹훅 URL 테스트**
```bash
# 웹훅 URL이 접근 가능한지 확인
curl https://your-domain.com/api/youtube/webhook
```

---

### 2. API 키 오류

#### 증상
```
❌ YouTube Data API 키 오류
❌ 403 Forbidden
❌ API 할당량 초과
```

#### 원인 분석
1. **YouTube Data API v3 미활성화**
2. **API 키 권한 부족**
3. **API 할당량 초과**

#### 해결 방법

**1단계: Google Cloud Console 확인**
```
1. Google Cloud Console 접속
2. 프로젝트 선택
3. "API 및 서비스" → "사용 설정된 API"
4. "YouTube Data API v3" 활성화 확인
```

**2단계: API 키 권한 확인**
```
1. "사용자 인증 정보" → API 키 선택
2. "API 제한사항" 설정
3. "YouTube Data API v3" 선택
4. "IP 주소 제한" 설정 (선택사항)
```

**3단계: 할당량 확인**
```
1. Google Cloud Console → "할당량"
2. "YouTube Data API v3" 선택
3. 일일 할당량 사용량 확인
4. 필요시 할당량 증가 요청
```

---

### 3. 채널 ID 오류

#### 증상
```
❌ 채널을 찾을 수 없습니다
❌ 404 Not Found
❌ 잘못된 채널 ID
```

#### 원인 분석
1. **잘못된 채널 ID**
2. **비공개 채널**
3. **채널이 삭제됨**

#### 해결 방법

**1단계: 채널 ID 재확인**
```bash
# 방법 1: YouTube Studio
YouTube Studio → 설정 → 채널 → 고급 설정

# 방법 2: 채널 URL에서 확인
https://www.youtube.com/channel/UCxxxxxxxxxxxxxxxxxxxxxx
# UC 뒤의 문자열이 채널 ID
```

**2단계: 채널 공개 설정 확인**
```
1. YouTube Studio 접속
2. 설정 → 채널 → 기본 설정
3. "채널 공개" 설정 확인
4. "영상 공개" 설정 확인
```

**3단계: API 테스트**
```bash
# 채널 정보 조회 테스트
curl http://localhost:3000/api/youtube/test-api
```

---

### 4. 웹훅 알림 수신 안됨

#### 증상
```
❌ 새 영상 업로드해도 갤러리에 추가 안됨
❌ 웹훅 알림이 오지 않음
❌ 자동 동기화 작동 안함
```

#### 원인 분석
1. **웹훅 구독이 해제됨**
2. **서버가 다운됨**
3. **YouTube 서버 문제**

#### 해결 방법

**1단계: 구독 상태 확인**
```bash
# 관리자 페이지에서 구독 상태 확인
/admin/youtube/setup 페이지 접속
```

**2단계: 수동 동기화로 테스트**
```bash
# 수동 동기화 실행
curl -X POST http://localhost:3000/api/youtube/sync \
  -H "Content-Type: application/json" \
  -d '{"maxResults": 5}'
```

**3단계: 웹훅 재구독**
```
1. "웹훅 구독 해제" 클릭
2. "웹훅 구독 설정" 클릭
3. 구독 확인 메시지 확인
```

---

### 5. 영상이 갤러리에 표시 안됨

#### 증상
```
❌ 영상이 데이터베이스에 저장됨
❌ 갤러리에서 영상이 보이지 않음
❌ iframe이 로드되지 않음
```

#### 원인 분석
1. **VideoItem 컴포넌트 오류**
2. **데이터베이스 쿼리 오류**
3. **iframe 로딩 오류**

#### 해결 방법

**1단계: 데이터베이스 확인**
```javascript
// MongoDB에서 영상 데이터 확인
db.video.find({}).sort({_id: -1}).limit(5)
```

**2단계: VideoItem 컴포넌트 확인**
```javascript
// components/gallery/VideoItem.jsx
const isYouTubeVideo = item.videoId || item.youtubeUrl || item.embedUrl;
console.log('YouTube 영상 여부:', isYouTubeVideo);
```

**3단계: 갤러리 페이지 확인**
```javascript
// app/GALLERY/[category]/page.jsx
console.log('갤러리 데이터:', serializedData);
```

---

## 🔧 고급 문제 해결

### 1. 성능 최적화

#### 문제: API 호출이 느림
```javascript
// 해결: 병렬 처리
const promises = videos.map(video => 
  youtube.videos.list({
    part: 'snippet,statistics',
    id: video.id.videoId
  })
);
const responses = await Promise.all(promises);
```

#### 문제: 데이터베이스 쿼리가 느림
```javascript
// 해결: 인덱스 생성
db.video.createIndex({ "videoId": 1 });
db.video.createIndex({ "createdAt": -1 });
```

### 2. 에러 핸들링 강화

#### 웹훅 처리 에러
```javascript
export async function POST(request) {
  try {
    // 웹훅 처리 로직
  } catch (error) {
    console.error('웹훅 처리 오류:', error);
    
    // 에러 알림 (선택사항)
    await sendErrorNotification(error);
    
    return NextResponse.json({ 
      error: '웹훅 처리 실패' 
    }, { status: 500 });
  }
}
```

#### API 호출 에러
```javascript
async function fetchVideoAndSaveToGallery(videoId) {
  try {
    // API 호출 로직
  } catch (error) {
    console.error('YouTube 영상 정보 가져오기 오류:', error);
    
    // 재시도 로직 (선택사항)
    if (error.code === 'QUOTA_EXCEEDED') {
      console.log('API 할당량 초과, 나중에 재시도');
      return;
    }
    
    throw error;
  }
}
```

### 3. 모니터링 설정

#### 로그 수집
```javascript
// 웹훅 수신 로그
console.log('YouTube 알림 수신:', {
  timestamp: new Date().toISOString(),
  videoId: extractVideoIdFromXML(body),
  body: body.substring(0, 200) + '...'
});

// 영상 추가 로그
console.log('YouTube 영상이 갤러리에 추가됨:', {
  timestamp: new Date().toISOString(),
  videoId,
  title: videoData.title,
  _id: result.insertedId
});
```

#### 성능 메트릭
```javascript
// API 호출 시간 측정
const startTime = Date.now();
const response = await youtube.videos.list({...});
const endTime = Date.now();
console.log(`API 호출 시간: ${endTime - startTime}ms`);
```

---

## 🚀 프로덕션 배포 체크리스트

### 1. 환경변수 확인
```env
✅ YOUTUBE_API_KEY=production_api_key
✅ YOUTUBE_CHANNEL_ID=production_channel_id
✅ YOUTUBE_VERIFY_TOKEN=secure_random_token
✅ NEXTAUTH_URL=https://your-domain.com
✅ NEXTAUTH_SECRET=secure_random_secret
```

### 2. 보안 설정
```
✅ HTTPS 사용
✅ API 키 제한 설정
✅ 웹훅 시크릿 설정
✅ 환경변수 파일 보안
```

### 3. 성능 최적화
```
✅ 데이터베이스 인덱스 생성
✅ API 할당량 모니터링
✅ 에러 핸들링 강화
✅ 로그 시스템 구축
```

### 4. 모니터링 설정
```
✅ 웹훅 수신 상태 모니터링
✅ API 호출 성공률 모니터링
✅ 데이터베이스 성능 모니터링
✅ 사용자 경험 모니터링
```

---

## 📞 지원 및 도움

### 1. 로그 확인 방법
```bash
# 개발 환경
npm run dev

# 프로덕션 환경
npm run start

# 로그 파일 확인
tail -f logs/app.log
```

### 2. 디버깅 도구
```javascript
// API 테스트
fetch('/api/youtube/test-api')
  .then(res => res.json())
  .then(data => console.log(data));

// 수동 동기화 테스트
fetch('/api/youtube/sync', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ maxResults: 5 })
})
.then(res => res.json())
.then(data => console.log(data));
```

### 3. 문제 보고
문제가 지속되면 다음 정보를 포함하여 보고하세요:
- 에러 메시지
- 로그 파일
- 환경변수 설정 (민감한 정보 제외)
- 재현 단계

---

이 문제 해결 가이드를 통해 YouTube 자동 동기화 시스템의 모든 문제를 해결할 수 있습니다! 🎯
