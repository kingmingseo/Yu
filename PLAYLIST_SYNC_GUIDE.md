# YouTube 재생목록 기반 자동 분류 시스템 가이드

## 🎵 시스템 개요

하나의 YouTube 계정에서 재생목록을 분리하여 M/V와 VIDEO 카테고리로 자동 분류하는 시스템입니다.

### 📋 작동 방식

```
YouTube 채널
├── M/V 재생목록 → M/V 카테고리 갤러리
└── VIDEO 재생목록 → VIDEO 카테고리 갤러리
```

---

## ⚙️ 설정 방법

### 1. 환경변수 설정

`.env.local` 파일에 다음 변수들을 추가하세요:

```env
# YouTube API 설정
YOUTUBE_API_KEY=your_youtube_api_key_here
YOUTUBE_VERIFY_TOKEN=your_verify_token_here
NEXTAUTH_URL=http://localhost:3000

# 재생목록 ID 설정
YOUTUBE_MV_PLAYLIST_ID=your_mv_playlist_id_here
YOUTUBE_VIDEO_PLAYLIST_ID=your_video_playlist_id_here
```

### 2. 재생목록 ID 찾기

#### 방법 1: YouTube Studio
1. [YouTube Studio](https://studio.youtube.com/) 접속
2. 재생목록 → 원하는 재생목록 선택
3. URL에서 재생목록 ID 확인: `https://www.youtube.com/playlist?list=PLxxxxxxxxxxxxxxxxxxxxxx`

#### 방법 2: 재생목록 URL에서 확인
- 재생목록 URL: `https://www.youtube.com/playlist?list=PLxxxxxxxxxxxxxxxxxxxxxx`
- `PL` 뒤의 문자열이 재생목록 ID

### 3. 재생목록 설정

#### M/V 재생목록
- 뮤직비디오나 공식 영상들을 포함
- 재생목록 ID를 `YOUTUBE_MV_PLAYLIST_ID`에 설정

#### VIDEO 재생목록  
- 일반 영상들을 포함
- 재생목록 ID를 `YOUTUBE_VIDEO_PLAYLIST_ID`에 설정

---

## 🚀 사용법

### 1. 초기 설정
1. `/admin/youtube/playlist-setup` 페이지 접속
2. "재생목록 정보 확인" 클릭하여 설정 확인
3. "재생목록 동기화" 클릭하여 기존 영상들 가져오기

### 2. 웹훅 설정
1. `/admin/youtube/setup` 페이지 접속
2. "웹훅 구독 설정" 클릭
3. 자동 분류 시스템 활성화

### 3. 자동 분류
- YouTube에서 새 영상 업로드
- 재생목록에 추가하면 자동으로 해당 카테고리에 분류
- 갤러리에서 자동으로 표시

---

## 🔄 작동 과정

### 1. 영상 업로드 시
```
1. YouTube에서 새 영상 업로드
2. 재생목록에 영상 추가
3. 웹훅이 영상 ID 수신
4. 재생목록 확인하여 카테고리 결정
5. 해당 카테고리 갤러리에 자동 추가
```

### 2. 수동 동기화 시
```
1. 관리자가 "재생목록 동기화" 클릭
2. 각 재생목록의 영상들 조회
3. 영상 상세 정보 가져오기
4. 카테고리별로 분류하여 저장
5. 갤러리에 반영
```

---

## 📊 데이터 구조

### 통합 컬렉션: `youtube_videos`
```javascript
{
  _id: ObjectId("..."),
  videoId: "ABC123DEF456",
  title: "영상 제목",
  description: "영상 설명",
  thumbnail: "https://i.ytimg.com/vi/...",
  youtubeUrl: "https://www.youtube.com/watch?v=ABC123DEF456",
  embedUrl: "https://www.youtube.com/embed/ABC123DEF456",
  publishedAt: ISODate("2024-01-15T10:30:00Z"),
  channelTitle: "채널명",
  viewCount: 1000,
  likeCount: 50,
  category: "MV", // 또는 "VIDEO"
  playlistId: "PLxxxxxxxxxxxxxxxxxxxxxx",
  createdAt: ISODate("2024-01-15T10:30:05Z"),
  updatedAt: ISODate("2024-01-15T10:30:05Z")
}
```

### 갤러리 표시
- **M/V 카테고리**: `category: "MV"`인 영상들만 표시
- **VIDEO 카테고리**: `category: "VIDEO"`인 영상들만 표시

---

## 🎯 장점

### 1. 자동 분류
- ✅ 재생목록에 따라 자동으로 카테고리 분류
- ✅ 수동 작업 없이 정확한 분류
- ✅ 실시간 자동 동기화

### 2. 통합 관리
- ✅ 하나의 컬렉션에서 모든 영상 관리
- ✅ 중복 방지 및 효율적인 저장
- ✅ 일관된 데이터 구조

### 3. 유연성
- ✅ 재생목록 변경 시 자동 반영
- ✅ 새로운 카테고리 추가 가능
- ✅ 기존 시스템과 호환

---

## 🔧 문제 해결

### 1. 재생목록을 찾을 수 없음
- 재생목록 ID가 올바른지 확인
- 재생목록이 공개 상태인지 확인
- 재생목록에 영상이 있는지 확인

### 2. 자동 분류가 안됨
- 웹훅이 제대로 구독되었는지 확인
- 재생목록 ID가 올바르게 설정되었는지 확인
- 영상이 재생목록에 추가되었는지 확인

### 3. 갤러리에 표시 안됨
- 데이터베이스에 영상이 저장되었는지 확인
- 카테고리 필드가 올바르게 설정되었는지 확인
- 갤러리 페이지가 올바른 컬렉션을 조회하는지 확인

---

## 📈 확장 가능성

### 1. 추가 카테고리
```javascript
// 새로운 카테고리 추가
YOUTUBE_LIVE_PLAYLIST_ID=your_live_playlist_id_here
YOUTUBE_SHORTS_PLAYLIST_ID=your_shorts_playlist_id_here
```

### 2. 다중 채널 지원
```javascript
// 여러 채널의 재생목록 지원
YOUTUBE_CHANNEL_2_MV_PLAYLIST_ID=...
YOUTUBE_CHANNEL_2_VIDEO_PLAYLIST_ID=...
```

### 3. 고급 분류
- 태그 기반 분류
- 키워드 기반 분류
- AI 기반 자동 분류

---

## 🎉 완료!

이제 YouTube 재생목록을 기반으로 한 자동 분류 시스템이 완성되었습니다!

- ✅ **자동 분류**: 재생목록에 따라 M/V와 VIDEO로 자동 분류
- ✅ **실시간 동기화**: 새 영상 업로드 시 자동 분류
- ✅ **통합 관리**: 하나의 시스템에서 모든 영상 관리
- ✅ **유연한 확장**: 새로운 카테고리 추가 가능

이 시스템을 통해 YouTube 채널의 영상들을 체계적으로 관리하고 갤러리에 자동으로 분류하여 표시할 수 있습니다! 🎬✨
