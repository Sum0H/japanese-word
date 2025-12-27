
import React, { useState, useRef } from 'react';
import { Plus, Trash2, Play, BookOpen, Clock, Settings2, Download, Upload } from 'lucide-react';
import { VocabList } from '../types';
import CreateListModal from './CreateListModal';

interface DashboardProps {
  lists: VocabList[];
  onCreate: (title: string, description: string) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  onStartTest: (list: VocabList) => void;
  onImport: (lists: VocabList[]) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ lists, onCreate, onDelete, onSelect, onStartTest, onImport }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (lists.length === 0) {
      alert('내보낼 단어장이 없습니다.');
      return;
    }
    const dataStr = JSON.stringify(lists, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `iriona-boja-backup-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          const isValid = json.every(item => item.id && item.title && Array.isArray(item.words));
          if (isValid) {
            onImport(json);
          } else {
            alert('올바른 단어장 형식의 파일이 아닙니다.');
          }
        } else {
          alert('단어장 목록 파일은 배열 형식이어야 합니다.');
        }
      } catch (error) {
        alert('파일을 읽는 중 오류가 발생했습니다.');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">나의 단어장 목록</h2>
          <p className="text-slate-500 text-sm mt-1">학습할 단어장을 선택하거나 새로 만들어보세요.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleImportClick}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm active:scale-95"
            title="JSON 파일에서 불러오기"
          >
            <Upload size={18} />
            <span className="hidden sm:inline">불러오기</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json" 
            className="hidden" 
          />
          
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm active:scale-95"
            title="JSON 파일로 저장하기"
          >
            <Download size={18} />
            <span className="hidden sm:inline">저장하기</span>
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm active:scale-95"
          >
            <Plus size={20} />
            <span>단어장 추가</span>
          </button>
        </div>
      </div>

      {isModalOpen && (
        <CreateListModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreate={onCreate}
        />
      )}

      {lists.length === 0 ? (
        <div className="bg-white border-2 border-dashed rounded-2xl p-16 text-center">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="text-slate-300" size={40} />
          </div>
          <p className="text-slate-500 text-lg mb-2">아직 생성된 단어장이 없습니다.</p>
          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="text-indigo-600 font-bold hover:underline text-lg"
            >
              첫 번째 단어장을 만들어보세요!
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase">
                <tr>
                  <th className="px-6 py-4">이름</th>
                  <th className="px-6 py-4 text-center">단어 수</th>
                  <th className="px-6 py-4 text-center">생성일</th>
                  <th className="px-6 py-4 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lists.map(list => (
                  <tr key={list.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div 
                        onClick={() => onSelect(list.id)} 
                        className="cursor-pointer"
                      >
                        <div className="font-bold text-slate-800 text-base group-hover:text-indigo-600 transition-colors">
                          {list.title}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                        {list.words.length}개
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-slate-400">
                      <div className="flex items-center justify-center gap-1.5">
                        <Clock size={14} />
                        {new Date(list.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => onSelect(list.id)}
                          title="단어 관리"
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                          <Settings2 size={18} />
                        </button>
                        <button 
                          onClick={() => onStartTest(list)}
                          title="시험 보기"
                          disabled={list.words.length === 0}
                          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                        >
                          <Play size={18} fill="currentColor" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(list.id);
                          }}
                          title="삭제"
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
