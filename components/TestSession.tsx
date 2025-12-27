
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Check, ArrowRight, BookOpen, Home } from 'lucide-react';
import { VocabList, Word, UserAnswer } from '../types';

interface TestSessionProps {
  list: VocabList;
  words: Word[];
  onFinish: (answers: UserAnswer[], shuffledWords: Word[]) => void;
  onCancel: () => void;
}

const TestSession: React.FC<TestSessionProps> = ({ list, words, onFinish, onCancel }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [readingInput, setReadingInput] = useState('');
  const [meaningInput, setMeaningInput] = useState('');
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  
  // Create shuffled words once on mount or when words prop changes
  const shuffledWords = useMemo(() => {
    return [...words].sort(() => Math.random() - 0.5);
  }, [words]);

  const readingInputRef = useRef<HTMLInputElement>(null);
  const currentWord = shuffledWords[currentIndex];

  useEffect(() => {
    // Focus the first input when word changes
    readingInputRef.current?.focus();
  }, [currentIndex]);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!readingInput.trim() || !meaningInput.trim()) return;

    const newAnswer: UserAnswer = {
      wordId: currentWord.id,
      userReading: readingInput.trim(),
      userMeaning: meaningInput.trim(),
    };

    const newAnswers = [...answers, newAnswer];
    
    if (currentIndex < shuffledWords.length - 1) {
      setAnswers(newAnswers);
      setReadingInput('');
      setMeaningInput('');
      setCurrentIndex(currentIndex + 1);
    } else {
      onFinish(newAnswers, shuffledWords);
    }
  };

  const handleExit = () => {
    if (confirm('진행중인 시험을 중단하고 메인 화면으로 돌아가시겠습니까?')) {
      window.location.href = 'index.html';
    }
  };

  const progress = ((currentIndex) / shuffledWords.length) * 100;

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col">
      {/* Top Header */}
      <div className="bg-slate-800 px-6 py-4 flex items-center justify-between shadow-lg">
        <div 
          className="flex items-center gap-3 cursor-pointer group transition-opacity hover:opacity-80"
          onClick={handleExit}
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <BookOpen size={20} />
          </div>
          <div>
            <h3 className="text-white font-bold leading-tight group-hover:text-indigo-200 transition-colors">{list.title} - 시험</h3>
            <p className="text-slate-400 text-xs">전체 {shuffledWords.length}단어 중 {currentIndex + 1}번째</p>
          </div>
        </div>
        <button 
          onClick={handleExit}
          className="text-slate-400 hover:text-white p-2 hover:bg-slate-700 rounded-full transition-all"
          title="시험 중단"
        >
          <X size={24} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-slate-700">
        <div 
          className="h-full bg-indigo-500 transition-all duration-300 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Test Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-900 to-slate-800 overflow-y-auto">
        <div className="w-full max-w-xl flex flex-col items-center space-y-12">
          
          {/* Main Flashcard Display (Center) */}
          <div className="text-center animate-in zoom-in-95 duration-300">
            <div className="text-slate-500 text-sm font-bold mb-2 uppercase tracking-[0.2em]">원형</div>
            <h1 className="text-7xl md:text-9xl font-bold text-white tracking-wider mb-2 drop-shadow-2xl">
              {currentWord.kanji}
            </h1>
          </div>

          {/* Input Area (Bottom) */}
          <form onSubmit={handleNext} className="w-full space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-slate-400 text-xs font-bold uppercase ml-1">읽는 법</label>
                <input 
                  ref={readingInputRef}
                  type="text" 
                  value={readingInput}
                  onChange={(e) => setReadingInput(e.target.value)}
                  placeholder="후리가나 입력"
                  className="w-full h-16 bg-slate-800 border-2 border-slate-700 rounded-2xl text-white px-6 text-xl focus:border-indigo-500 focus:ring-0 outline-none transition-all placeholder:text-slate-600 shadow-inner"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <label className="text-slate-400 text-xs font-bold uppercase ml-1">뜻</label>
                <input 
                  type="text" 
                  value={meaningInput}
                  onChange={(e) => setMeaningInput(e.target.value)}
                  placeholder="한국어 뜻 입력"
                  className="w-full h-16 bg-slate-800 border-2 border-slate-700 rounded-2xl text-white px-6 text-xl focus:border-indigo-500 focus:ring-0 outline-none transition-all placeholder:text-slate-600 shadow-inner"
                  autoComplete="off"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={!readingInput.trim() || !meaningInput.trim()}
              className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-2xl text-xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-indigo-900/20 mt-4"
            >
              <span>{currentIndex === shuffledWords.length - 1 ? '시험 종료' : '다음 단어'}</span>
              <ArrowRight size={24} />
            </button>
            
            <div className="flex flex-col items-center gap-3 mt-6">
              <p className="text-center text-slate-500 text-sm">
                Enter키를 누르면 다음으로 넘어갑니다.
              </p>
              <button 
                type="button"
                onClick={handleExit}
                className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-400 text-sm font-medium transition-colors"
              >
                <Home size={14} />
                메인 페이지로 돌아가기
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TestSession;
