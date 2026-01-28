import AddButtonUI from './AddButtonUI';

const meta = {
  title: "Common/AddButton",
  component: AddButtonUI,
  tags: ['autodocs'],
  argTypes: {
    isAdmin: {
      control: 'boolean',
      description: '관리자 여부',
    },
    category: {
      control: 'text',
      description: '카테고리',
    },
    variant: {
      control: 'select',
      options: ['gallery', 'aboutme'],
      description: '버튼 변형',
    },
  },
} 

export default meta;

// 관리자로 로그인한 상태
export const Admin = {
  args: {
    isAdmin: true,
    category: 'GALLERY',
    variant: 'gallery',
  },
};

export const NonAdmin = {
  args: {
    isAdmin: false,
    category: 'GALLERY',
    variant: 'gallery',
  },
};




