'use client';

import { useState } from 'react';
import GeneralButton from '@/components/common/GeneralButton';

export default function YouTubeSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [channelInfo, setChannelInfo] = useState(null);

  // YouTube 웹훅 구독 설정
  const handleSubscribe = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/youtube/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

  // YouTube 웹훅 구독 해제
  const handleUnsubscribe = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/youtube/subscribe', {
        method: 'DELETE',
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

  // 재생목록 기반 동기화
  const handleSync = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/youtube/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

  // 재생목록 정보 가져오기
  const handleGetPlaylistInfo = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/youtube/sync');
      const data = await response.json();
      
      if (data.success) {
        setChannelInfo(data.playlists);
        setMessage('✅ 재생목록 정보를 가져왔습니다');
      } else {
        setMessage(`❌ ${data.error}: ${data.details}`);
      }
    } catch (error) {
      setMessage(`❌ 오류: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-4">
            YouTube 재생목록 자동 동기화
          </h1>
          <p className="text-sm sm:text-lg font-extralight text-gray-300">
            재생목록 기반 자동 분류 시스템
          </p>
        </div>
        
        <div className="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-white">시스템 개요</h2>
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              <p><span className="text-blue-400 font-medium">M/V 카테고리</span>: 지정된 재생목록의 영상들</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <p><span className="text-green-400 font-medium">VIDEO 카테고리</span>: 다른 재생목록의 영상들</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
              <p>웹훅 구독을 설정하면 새로운 영상이 자동으로 분류되어 갤러리에 추가됩니다</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
              <p>수동 동기화로 기존 재생목록의 영상들을 한 번에 가져올 수 있습니다</p>
            </div>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-8 border ${
            message.includes('✅') 
              ? 'bg-green-900/20 border-green-500 text-green-300' 
              : 'bg-red-900/20 border-red-500 text-red-300'
          }`}>
            <div className="flex items-center space-x-2">
              <span className="text-lg">
                {message.includes('✅') ? '✅' : '❌'}
              </span>
              <span className="font-medium">{message}</span>
            </div>
          </div>
        )}

        {channelInfo && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {channelInfo.map((playlist, index) => (
              <div key={index} className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-3 h-3 rounded-full ${
                    playlist.category === 'MV' ? 'bg-blue-400' : 'bg-green-400'
                  }`}></div>
                  <h3 className="text-lg font-semibold text-white">
                    {playlist.category} 재생목록
                  </h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">제목:</span>
                    <p className="font-medium text-white text-right">{playlist.title}</p>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">영상 수:</span>
                    <p className="font-medium text-white">{playlist.itemCount}개</p>
                  </div>
                  <div className="py-2">
                    <span className="text-gray-400 text-xs">재생목록 ID:</span>
                    <p className="font-mono text-xs text-gray-300 mt-1 break-all">{playlist.id}</p>
                  </div>
                  {playlist.description && (
                    <div className="py-2">
                      <span className="text-gray-400 text-xs">설명:</span>
                      <p className="text-gray-300 text-xs mt-1">{playlist.description}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <h3 className="text-lg font-semibold text-white">웹훅 관리</h3>
            </div>
            <p className="text-sm text-gray-300 mb-6">
              YouTube에서 새로운 영상이 업로드될 때 자동으로 알림을 받습니다.
            </p>
            <div className="space-y-3">
              <GeneralButton
                onClick={handleSubscribe}
                isLoading={isLoading}
                label="웹훅 구독 설정"
                ariaLabel="YouTube 웹훅 구독 설정"
              />
              <GeneralButton
                onClick={handleUnsubscribe}
                isLoading={isLoading}
                label="웹훅 구독 해제"
                ariaLabel="YouTube 웹훅 구독 해제"
              />
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <h3 className="text-lg font-semibold text-white">수동 동기화</h3>
            </div>
            <p className="text-sm text-gray-300 mb-6">
              기존 영상들을 수동으로 갤러리에 추가하거나 정보를 업데이트합니다.
            </p>
            <div className="space-y-3">
              <GeneralButton
                onClick={handleSync}
                isLoading={isLoading}
                label="최신 영상 동기화"
                ariaLabel="YouTube 재생목록 동기화"
              />
              <GeneralButton
                onClick={handleGetPlaylistInfo}
                isLoading={isLoading}
                label="재생목록 정보 확인"
                ariaLabel="YouTube 재생목록 정보 조회"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 bg-gray-900 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <h3 className="text-lg font-semibold text-white">필요한 환경변수</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <span className="text-gray-400">YOUTUBE_API_KEY</span>
              <span className="text-yellow-400 font-mono">YouTube Data API 키</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <span className="text-gray-400">YOUTUBE_MV_PLAYLIST_ID</span>
              <span className="text-yellow-400 font-mono">M/V 재생목록 ID</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <span className="text-gray-400">YOUTUBE_VIDEO_PLAYLIST_ID</span>
              <span className="text-yellow-400 font-mono">VIDEO 재생목록 ID</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <span className="text-gray-400">YOUTUBE_VERIFY_TOKEN</span>
              <span className="text-yellow-400 font-mono">웹훅 검증 토큰</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-400">NEXTAUTH_URL</span>
              <span className="text-yellow-400 font-mono">사이트 URL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

