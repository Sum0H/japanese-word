
import React from 'react';
import { Home, Trophy, BookOpen, AlertCircle, XCircle } from 'lucide-react';
import { VocabList, UserAnswer, Word } from '../types';

interface ResultViewProps {
  results: {
    list: VocabList;
    answers: UserAnswer[];
    shuffledWords: Word[];
  };
  onRetry: () => void;
  onRetryIncorrect: (words: Word[]) => void;
  onGoHome: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ results, onRetry, onRetryIncorrect, onGoHome }) => {
  const { list, answers, shuffledWords } = results;

  const evaluation = shuffledWords.map((word, idx) => {
    const answer = answers[idx];
    const isReadingCorrect = answer.userReading.trim() === word.reading.trim();
    const isMeaningCorrect = answer.userMeaning.trim() === word.meaning.trim();
    
    return {
      word,
      answer,
      isReadingCorrect,
      isMeaningCorrect,
      isTotalCorrect: isReadingCorrect && isMeaningCorrect
    };
  });

  const incorrectEntries = evaluation.filter(e => !e.isTotalCorrect);
  const incorrectWords = incorrectEntries.map(e => e.word);
  const correctCount = evaluation.filter(e => e.isTotalCorrect).length;
  const score = Math.round((correctCount / shuffledWords.length) * 100);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Score Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Trophy size={160} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 rounded-full border-8 border-indigo-50 flex items-center justify-center relative">
            <div className="text-4xl font-black text-indigo-600">{score}</div>
            <div className="absolute -bottom-2 bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Score</div>
          </div>
          
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-800">시험 완료!</h2>
            <p className="text-slate-500 mt-1">
              <span className="font-bold text-indigo-600">{shuffledWords.length}개</span> 중 
              <span className="font-bold text-green-600 ml-1">{correctCount}개</span>를 맞히셨습니다.
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
              {incorrectWords.length > 0 && (
                <button 
                  onClick={() => onRetryIncorrect(incorrectWords)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95"
                >
                  <AlertCircle size={18} />
                  오답만 재시험 ({incorrectWords.length})
                </button>
              )}

              <button 
                onClick={onGoHome}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-bold transition-all active:scale-95"
              >
                <Home size={18} />
                홈으로 이동
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Review - Only Incorrect Words */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <BookOpen className="text-slate-400" size={20} />
          오답 노트
        </h3>

        {incorrectEntries.length === 0 ? (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-12 text-center">
            <Trophy className="mx-auto text-green-400 mb-4" size={48} />
            <p className="text-green-700 font-bold text-lg">만점입니다! 틀린 단어가 하나도 없어요.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {incorrectEntries.map((e, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-2xl border-2 border-red-100 bg-red-50/10 p-6 shadow-sm flex flex-col md:flex-row items-start gap-6 transition-all"
              >
                {/* Word Origin (Kanji) */}
                <div className="flex-1 min-w-[120px]">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 h-4 flex items-center">단어 원형</div>
                  <div className="text-3xl font-bold text-slate-900">{e.word.kanji}</div>
                </div>

                {/* Reading Comparison */}
                <div className="flex-1">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 h-4 flex items-center">읽는 법 (후리가나)</div>
                  <div className="space-y-1">
                    <div className={`text-lg font-medium flex items-center gap-2 ${e.isReadingCorrect ? 'text-slate-900' : 'text-red-600 line-through decoration-red-300'}`}>
                      {e.answer.userReading}
                      {!e.isReadingCorrect && <XCircle size={14} className="text-red-400 flex-shrink-0" />}
                    </div>
                    {!e.isReadingCorrect && (
                      <div className="text-lg font-bold text-green-600">
                        → {e.word.reading}
                      </div>
                    )}
                  </div>
                </div>

                {/* Meaning Comparison */}
                <div className="flex-1">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 h-4 flex items-center">뜻 (의미)</div>
                  <div className="space-y-1">
                    <div className={`text-lg font-medium flex items-center gap-2 ${e.isMeaningCorrect ? 'text-slate-900' : 'text-red-600 line-through decoration-red-300'}`}>
                      {e.answer.userMeaning}
                      {!e.isMeaningCorrect && <XCircle size={14} className="text-red-400 flex-shrink-0" />}
                    </div>
                    {!e.isMeaningCorrect && (
                      <div className="text-lg font-bold text-green-600">
                        → {e.word.meaning}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultView;
