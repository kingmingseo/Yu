# YouTube 자동 동기화 설정 가이드

## 1. YouTube Data API 설정

### 1.1 Google Cloud Console에서 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. YouTube Data API v3 활성화

### 1.2 API 키 생성
1. "사용자 인증 정보" → "사용자 인증 정보 만들기" → "API 키"
2. API 키 제한 설정 (선택사항)
3. 생성된 API 키를 복사

## 2. YouTube 채널 ID 찾기

### 2.1 방법 1: YouTube Studio
1. [YouTube Studio](https://studio.youtube.com/) 접속
2. 설정 → 채널 → 고급 설정
3. 채널 ID 확인

### 2.2 방법 2: 채널 URL에서 확인
- 채널 URL: `https://www.youtube.com/channel/UCxxxxxxxxxxxxxxxxxxxxxx`
- `UC` 뒤의 문자열이 채널 ID

## 3. 환경변수 설정

`.env.local` 파일에 다음 변수들을 추가하세요:

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

## 4. 웹훅 구독 설정

### 4.1 관리자 페이지 접속
- `/admin/youtube/setup` 페이지로 이동

### 4.2 웹훅 구독 설정
1. "웹훅 구독 설정" 버튼 클릭
2. 성공 메시지 확인

### 4.3 수동 동기화
1. "최신 영상 동기화" 버튼 클릭
2. 기존 영상들이 갤러리에 추가됨

## 5. 작동 방식

### 5.1 자동 동기화
- YouTube에서 새 영상 업로드
- PubSubHubbub 웹훅을 통해 실시간 알림 수신
- 자동으로 갤러리 video 카테고리에 추가

### 5.2 수동 동기화
- 관리자 페이지에서 "최신 영상 동기화" 클릭
- 최대 20개의 최신 영상을 가져와서 갤러리에 추가

## 6. 문제 해결

### 6.1 웹훅 구독 실패
- `NEXTAUTH_URL`이 올바르게 설정되었는지 확인
- `YOUTUBE_VERIFY_TOKEN`이 설정되었는지 확인
- 서버가 외부에서 접근 가능한지 확인 (ngrok 등 사용)

### 6.2 API 키 오류
- YouTube Data API v3가 활성화되었는지 확인
- API 키에 올바른 권한이 있는지 확인
- API 할당량이 초과되지 않았는지 확인

### 6.3 채널 ID 오류
- 채널 ID가 올바른지 확인
- 채널이 공개 상태인지 확인

## 7. 보안 고려사항

- API 키를 안전하게 보관
- 웹훅 시크릿 설정 (선택사항)
- 환경변수 파일을 `.gitignore`에 추가
- 프로덕션 환경에서는 HTTPS 사용 필수

