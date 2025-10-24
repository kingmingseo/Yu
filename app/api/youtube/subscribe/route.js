import { NextResponse } from 'next/server';

// YouTube PubSubHubbub 구독 설정
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

// 구독 해제
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

