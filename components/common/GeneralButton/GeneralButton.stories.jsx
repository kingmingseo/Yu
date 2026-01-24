import GeneralButton from './GeneralButton';

const meta = {
  title: "Common/GeneralButton",
  component: GeneralButton,
  argTypes: {
    isLoading: {
      control: 'boolean',
      description: '로딩 상태',
    },
    label: {
      control: 'text',
      description: '버튼 라벨',
    },
    onClick: {
      action: 'clicked',  // Actions 패널에 클릭 이벤트 로그 표시
      description: '클릭 이벤트 핸들러',
    },
  },
}

export default meta;

// 일반 버튼
export const Normal = {
  args: {
    isLoading: false,
    label: 'Button',
    onClick: () => {
      alert('Button clicked');
    },
  },
};

// 로딩 중 상태
export const Loading = {
  args: {
    isLoading: true,
  },
};








