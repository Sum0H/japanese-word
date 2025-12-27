
import React, { useState, useEffect } from 'react';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { VocabList, ViewState, Word, UserAnswer } from './types';
import Dashboard from './components/Dashboard';
import ListDetail from './components/ListDetail';
import TestSession from './components/TestSession';
import ResultView from './components/ResultView';

const App: React.FC = () => {
  // 1. 단어장 목록 복구
  const [lists, setLists] = useState<VocabList[]>(() => {
    const saved = localStorage.getItem('kotoba-lists');
    return saved ? JSON.parse(saved) : [];
  });
  
  // 2. 현재 화면 상태 복구 (TEST나 RESULT 상태로 시작하는 것은 불안정하므로 HOME/DETAIL로 유도)
  const [currentView, setCurrentView] = useState<ViewState>(() => {
    const savedView = localStorage.getItem('kotoba-current-view') as ViewState;
    if (savedView === 'TEST' || savedView === 'RESULT') return 'HOME';
    return savedView || 'HOME';
  });

  // 3. 선택된 단어장 ID 복구
  const [selectedListId, setSelectedListId] = useState<string | null>(() => {
    return localStorage.getItem('kotoba-selected-list-id');
  });

  const [activeTestWords, setActiveTestWords] = useState<Word[]>([]);
  const [testResults, setTestResults] = useState<{
    list: VocabList;
    answers: UserAnswer[];
    shuffledWords: Word[];
  } | null>(null);

  // 데이터 지속성 유지 (Persistence Effects)
  useEffect(() => {
    localStorage.setItem('kotoba-lists', JSON.stringify(lists));
  }, [lists]);

  useEffect(() => {
    localStorage.setItem('kotoba-current-view', currentView);
  }, [currentView]);

  useEffect(() => {
    if (selectedListId) {
      localStorage.setItem('kotoba-selected-list-id', selectedListId);
    } else {
      localStorage.removeItem('kotoba-selected-list-id');
    }
  }, [selectedListId]);

  const handleCreateList = (title: string, description: string) => {
    const newList: VocabList = {
      id: crypto.randomUUID(),
      title,
      description,
      words: [],
      createdAt: Date.now(),
    };
    setLists([newList, ...lists]);
  };

  const handleDeleteList = (id: string) => {
    setLists(prev => prev.filter(l => l.id !== id));
    if (selectedListId === id) setSelectedListId(null);
  };

  const handleUpdateWords = (listId: string, words: Word[]) => {
    setLists(lists.map(l => l.id === listId ? { ...l, words } : l));
  };

  const handleUpdateListMetadata = (listId: string, title: string, description: string) => {
    setLists(lists.map(l => l.id === listId ? { ...l, title, description } : l));
  };

  const handleImportLists = (newLists: VocabList[]) => {
    setLists(prev => [...newLists, ...prev]);
    alert(`${newLists.length}개의 단어장을 성공적으로 가져왔습니다.`);
  };

  const startTest = (list: VocabList, wordsOverride?: Word[]) => {
    const wordsToTest = wordsOverride || list.words;
    if (wordsToTest.length === 0) {
      alert('학습할 단어가 없습니다.');
      return;
    }
    setSelectedListId(list.id);
    setActiveTestWords(wordsToTest);
    setCurrentView('TEST');
  };

  const finishTest = (list: VocabList, answers: UserAnswer[], shuffledWords: Word[]) => {
    setTestResults({ list, answers, shuffledWords });
    setCurrentView('RESULT');
  };

  const currentList = lists.find(l => l.id === selectedListId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navigation Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => setCurrentView('HOME')}
          >
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <BookOpen size={20} />
            </div>
            <h1 className="text-xl font-bold text-indigo-900">일어나 보자</h1>
          </div>
          {currentView !== 'HOME' && (
            <button 
              onClick={() => setCurrentView('HOME')}
              className="text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">메인으로</span>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {currentView === 'HOME' && (
          <Dashboard 
            lists={lists} 
            onCreate={handleCreateList} 
            onDelete={handleDeleteList}
            onSelect={(id) => {
              setSelectedListId(id);
              setCurrentView('LIST_DETAIL');
            }}
            onStartTest={(list) => startTest(list)}
            onImport={handleImportLists}
          />
        )}

        {currentView === 'LIST_DETAIL' && currentList && (
          <ListDetail 
            list={currentList} 
            onUpdateWords={(words) => handleUpdateWords(currentList.id, words)}
            onUpdateMetadata={(title, description) => handleUpdateListMetadata(currentList.id, title, description)}
            onStartTest={() => startTest(currentList)}
          />
        )}

        {currentView === 'TEST' && currentList && (
          <TestSession 
            list={currentList} 
            words={activeTestWords}
            onFinish={(answers, shuffledWords) => finishTest(currentList, answers, shuffledWords)}
            onCancel={() => setCurrentView('HOME')}
          />
        )}

        {currentView === 'RESULT' && testResults && (
          <ResultView 
            results={testResults} 
            onRetry={() => startTest(testResults.list)}
            onRetryIncorrect={(words) => startTest(testResults.list, words)}
            onGoHome={() => setCurrentView('HOME')}
          />
        )}

        {/* 선택된 리스트가 사라졌을 경우(삭제 등) 홈으로 복구하는 안전장치 */}
        {currentView === 'LIST_DETAIL' && !currentList && (
          <div className="text-center py-20">
            <p className="text-slate-500 mb-4">선택된 단어장을 찾을 수 없습니다.</p>
            <button 
              onClick={() => setCurrentView('HOME')}
              className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold"
            >
              홈으로 돌아가기
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
