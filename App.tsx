
import React, { useState, useEffect } from 'react';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { VocabList, ViewState, Word, UserAnswer } from './types';
import Dashboard from './components/Dashboard';
import ListDetail from './components/ListDetail';
import TestSession from './components/TestSession';
import ResultView from './components/ResultView';

const App: React.FC = () => {
  const [lists, setLists] = useState<VocabList[]>(() => {
    const saved = localStorage.getItem('kotoba-lists');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [activeTestWords, setActiveTestWords] = useState<Word[]>([]);
  const [testResults, setTestResults] = useState<{
    list: VocabList;
    answers: UserAnswer[];
    shuffledWords: Word[];
  } | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('kotoba-lists', JSON.stringify(lists));
  }, [lists]);

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
    if (confirm('이 단어장 목록을 정말 삭제하시겠습니까?')) {
      setLists(prev => prev.filter(l => l.id !== id));
      if (selectedListId === id) setSelectedListId(null);
    }
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
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('HOME')}>
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              < BookOpen size={20} />
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
      </main>
    </div>
  );
};

export default App;
