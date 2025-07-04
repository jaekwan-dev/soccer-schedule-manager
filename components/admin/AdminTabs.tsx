interface AdminTabsProps {
  mainTab: 'matches' | 'members';
  setMainTab: (tab: 'matches' | 'members') => void;
}

export default function AdminTabs({ mainTab, setMainTab }: AdminTabsProps) {
  return (
    <div className="flex gap-1 mb-4">
      <button
        onClick={() => setMainTab('matches')}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
          mainTab === 'matches'
            ? 'bg-blue-100 text-blue-700 border border-blue-200'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
      >
        경기 관리
      </button>
      <button
        onClick={() => setMainTab('members')}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
          mainTab === 'members'
            ? 'bg-green-100 text-green-700 border border-green-200'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
      >
        팀원 관리
      </button>
    </div>
  );
} 