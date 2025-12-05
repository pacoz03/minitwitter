'use client';

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  label: string;
  count: number;
}

const TabButton = ({ isActive, onClick, label, count }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={`flex-1 py-4 text-center text-sm font-medium transition-colors relative hover:bg-white/5 ${
      isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
    }`}
  >
    <span>{label}</span>
    <span className="ml-1 text-xs opacity-70">({count})</span>
    {isActive && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full" />}
  </button>
);

export default TabButton;
