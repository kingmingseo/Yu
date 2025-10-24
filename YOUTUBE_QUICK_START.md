# YouTube 자동 동기화 빠른 시작 가이드

## 🚀 5분 만에 설정하기

### 1️⃣ 패키지 설치
```bash
npm install googleapis
```

### 2️⃣ 환경변수 설정
`.env.local` 파일에 추가:
```env
YOUTUBE_API_KEY=your_api_key_here
YOUTUBE_CHANNEL_ID=your_channel_id_here
YOUTUBE_VERIFY_TOKEN=my_secret_token_123
NEXTAUTH_URL=http://localhost:3000
```

### 3️⃣ YouTube API 키 생성
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 → YouTube Data API v3 활성화
3. API 키 생성

### 4️⃣ 채널 ID 찾기
- YouTube Studio → 설정 → 채널 → 고급 설정
- 또는 채널 URL: `https://www.youtube.com/channel/UCxxxxxxxxx`

### 5️⃣ 관리자 페이지 접속
- `/admin/youtube/setup` 페이지로 이동
- "웹훅 구독 설정" 클릭
- "최신 영상 동기화" 클릭

### 6️⃣ 완료! 🎉
이제 YouTube에서 새 영상을 업로드하면 자동으로 갤러리에 추가됩니다!

---

## 🔧 문제 해결

### ❌ "API 키 오류"
- YouTube Data API v3가 활성화되었는지 확인
- API 키에 올바른 권한이 있는지 확인

### ❌ "채널을 찾을 수 없습니다"
- 채널 ID가 올바른지 확인
- 채널이 공개 상태인지 확인

### ❌ "웹훅 구독 실패"
- `NEXTAUTH_URL`이 올바르게 설정되었는지 확인
- 로컬 개발 시 ngrok 사용: `ngrok http 3000`

### ❌ "영상이 추가되지 않음"
- 웹훅이 제대로 구독되었는지 확인
- 수동 동기화로 테스트

---

## 📱 사용법

### 자동 동기화
1. YouTube에서 새 영상 업로드
2. 자동으로 갤러리에 추가됨 ✨

### 수동 동기화
1. `/admin/youtube/setup` 접속
2. "최신 영상 동기화" 클릭
3. 기존 영상들이 갤러리에 추가됨

---

## 🎯 핵심 기능

- ✅ **실시간 자동 동기화**: 새 영상 업로드 시 즉시 갤러리 추가
- ✅ **수동 동기화**: 기존 영상들을 한 번에 가져오기
- ✅ **iframe 표시**: YouTube 영상을 갤러리에서 직접 재생
- ✅ **관리자 인터페이스**: 설정 및 모니터링
- ✅ **보안**: 토큰 기반 인증

---

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. 환경변수가 올바르게 설정되었는지
2. YouTube API 키가 유효한지
3. 채널 ID가 정확한지
4. 서버가 외부에서 접근 가능한지

더 자세한 내용은 `YOUTUBE_AUTO_SYNC_DOCUMENTATION.md`를 참고하세요!
