import DeleteButtonUI from './DeleteButtonUI';

const meta = {
  title: "Common/DeleteButton",
  component: DeleteButtonUI,
  argTypes: {
    isAdmin: {
      control: 'boolean',
      description: '관리자 여부',
    },
    onDelete: {
      action: 'clicked',
      description: '삭제 버튼 클릭 핸들러',
    },
  },
} 

export default meta;

// 관리자 상태 - 버튼 보임
export const Admin = {
  args: {
    isAdmin: true,
    onDelete: () => {
      alert('삭제 버튼 클릭됨 (스토리북)');
      console.log('Delete clicked in Storybook');
    },
  },
};

// 일반 사용자 상태 - 버튼 안 보임
export const NonAdmin = {
  args: {
    isAdmin: false,
    onDelete: () => console.log('This should not be visible'),
  },
};




