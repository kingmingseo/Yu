import VideoItem from './VideoItem';

const meta = {
  title: "Gallery/VideoItem",
  component: VideoItem,
  argTypes: {
    isAdmin: {
      control: 'boolean',
      description: '관리자 여부 (true면 삭제 버튼 보임)',
    },
    onDelete: {
      action: 'deleted',
      description: '삭제 버튼 클릭 핸들러',
    },
  },
}

export default meta;

// 관리자 상태 - 삭제 버튼 보임
export const Admin = {
  args: {
    item: {
      _id: '123',
      title: 'Amazing YouTube Video',
      videoId: 'dQw4w9WgXcQ',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    },
    category: 'VIDEO',
    isAdmin: true,
    onDelete: () => {
      console.log('Delete button clicked in Storybook');
      alert('삭제 버튼 클릭됨 (스토리북)');
    },
  },
};

// 일반 사용자 상태 - 삭제 버튼 안 보임
export const NonAdmin = {
  args: {
    item: {
      _id: '456',
      title: 'Another Great Video',
      videoId: 'jNQXAC9IVRw',
      embedUrl: 'https://www.youtube.com/embed/jNQXAC9IVRw',
    },
    category: 'MV',
    isAdmin: false,
    onDelete: () => {},
  },
};




