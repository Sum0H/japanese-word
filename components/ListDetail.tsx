
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Search, Edit2, Check, X, CheckSquare, Square } from 'lucide-react';
import { Word, VocabList } from '../types';

interface ListDetailProps {
  list: VocabList;
  onUpdateWords: (words: Word[]) => void;
  onUpdateMetadata: (title: string, description: string) => void;
  onStartTest: () => void;
}

const ListDetail: React.FC<ListDetailProps> = ({ list, onUpdateWords, onUpdateMetadata, onStartTest }) => {
  const [newKanji, setNewKanji] = useState('');
  const [newReading, setNewReading] = useState('');
  const [newMeaning, setNewMeaning] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Selection state for batch actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Metadata Editing State
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [editedTitle, setEditedTitle] = useState(list.title);
  const [editedDescription, setEditedDescription] = useState(list.description);

  // Word Editing State
  const [editingWordId, setEditingWordId] = useState<string | null>(null);
  const [editKanji, setEditKanji] = useState('');
  const [editReading, setEditReading] = useState('');
  const [editMeaning, setEditMeaning] = useState('');
  const [focusTarget, setFocusTarget] = useState<'kanji' | 'reading' | 'meaning' | null>(null);

  // Refs for focusing
  const kanjiEditRef = useRef<HTMLInputElement>(null);
  const readingEditRef = useRef<HTMLInputElement>(null);
  const meaningEditRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditedTitle(list.title);
    setEditedDescription(list.description);
  }, [list.title, list.description]);

  // Handle focusing when starting to edit a word
  useEffect(() => {
    if (editingWordId) {
      if (focusTarget === 'kanji') kanjiEditRef.current?.focus();
      else if (focusTarget === 'reading') readingEditRef.current?.focus();
      else if (focusTarget === 'meaning') meaningEditRef.current?.focus();
    }
  }, [editingWordId, focusTarget]);

  const handleSaveMetadata = () => {
    if (!editedTitle.trim()) return;
    onUpdateMetadata(editedTitle.trim(), editedDescription.trim());
    setIsEditingMetadata(false);
  };

  const handleCancelMetadata = () => {
    setEditedTitle(list.title);
    setEditedDescription(list.description);
    setIsEditingMetadata(false);
  };

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKanji.trim() || !newReading.trim() || !newMeaning.trim()) return;
    
    const newWord: Word = {
      id: crypto.randomUUID(),
      kanji: newKanji.trim(),
      reading: newReading.trim(),
      meaning: newMeaning.trim(),
    };

    onUpdateWords([newWord, ...list.words]);
    setNewKanji('');
    setNewReading('');
    setNewMeaning('');
    
    const input = document.getElementById('word-input');
    input?.focus();
  };

  const startEditingWord = (word: Word, field: 'kanji' | 'reading' | 'meaning') => {
    setEditingWordId(word.id);
    setEditKanji(word.kanji);
    setEditReading(word.reading);
    setEditMeaning(word.meaning);
    setFocusTarget(field);
  };

  const cancelEditingWord = () => {
    setEditingWordId(null);
    setFocusTarget(null);
  };

  const saveEditedWord = (id: string) => {
    if (!editKanji.trim() || !editReading.trim() || !editMeaning.trim()) return;
    
    const updatedWords = list.words.map(w => 
      w.id === id 
        ? { ...w, kanji: editKanji.trim(), reading: editReading.trim(), meaning: editMeaning.trim() } 
        : w
    );
    
    onUpdateWords(updatedWords);
    setEditingWordId(null);
    setFocusTarget(null);
  };

  const removeWord = (id: string) => {
    onUpdateWords(list.words.filter(w => w.id !== id));
    const newSelected = new Set(selectedIds);
    newSelected.delete(id);
    setSelectedIds(newSelected);
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    onUpdateWords(list.words.filter(w => !selectedIds.has(w.id)));
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredWords.length && filteredWords.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredWords.map(w => w.id)));
    }
  };

  const filteredWords = list.words.filter(w => 
    w.kanji.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.reading.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1">
          {isEditingMetadata ? (
            <div className="space-y-3 bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm animate-in zoom-in-95 duration-200">
              <input 
                type="text" 
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="단어장 이름"
                className="w-full text-2xl font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                autoFocus
              />
              <textarea 
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="단어장 설명 (선택)"
                rows={2}
                className="w-full text-slate-500 bg-slate-50 px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
              />
              <div className="flex gap-2">
                <button 
                  onClick={handleSaveMetadata}
                  className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all"
                >
                  <Check size={16} /> 저장
                </button>
                <button 
                  onClick={handleCancelMetadata}
                  className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-slate-200 transition-all"
                >
                  <X size={16} /> 취소
                </button>
              </div>
            </div>
          ) : (
            <div className="group relative pr-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-2">
                {list.title}
                <button 
                  onClick={() => setIsEditingMetadata(true)}
                  className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  title="단어장 정보 수정"
                >
                  <Edit2 size={18} />
                </button>
              </h2>
              <p className="text-slate-500 mt-1 text-sm sm:text-base">{list.description || '설명이 없습니다.'}</p>
            </div>
          )}
        </div>
        <button 
          onClick={onStartTest}
          disabled={list.words.length === 0}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center shadow-lg shadow-indigo-100 transition-all active:scale-95 whitespace-nowrap"
        >
          <span>시험 시작</span>
        </button>
      </div>

      {/* Word Registration Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Plus className="text-indigo-500" size={20} />
          단어 등록하기
        </h3>
        <form onSubmit={handleAddWord} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">원형 (한자)</label>
            <input 
              id="word-input"
              type="text" 
              value={newKanji}
              onChange={(e) => setNewKanji(e.target.value)}
              placeholder="예: 食べる"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">읽는 법 (후리가나)</label>
            <input 
              type="text" 
              value={newReading}
              onChange={(e) => setNewReading(e.target.value)}
              placeholder="예: たべる"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              required
            />
          </div>
          <div className="relative">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">뜻 (의미)</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newMeaning}
                onChange={(e) => setNewMeaning(e.target.value)}
                placeholder="예: 먹다"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                required
              />
              <button 
                type="submit"
                className="bg-indigo-600 text-white px-5 rounded-lg font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap shadow-sm"
              >
                등록
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Word List Search & Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-[150px]">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="단어 검색..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 outline-none text-sm text-slate-600 bg-transparent"
            />
          </div>
          
          <div className="flex items-center gap-3">
            {selectedIds.size > 0 && (
              <button 
                onClick={handleBatchDelete}
                className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold hover:bg-red-100 transition-all animate-in slide-in-from-right-2"
              >
                <Trash2 size={16} />
                <span>{selectedIds.size}개 삭제</span>
              </button>
            )}
            <div className="text-[10px] sm:text-xs font-medium text-slate-400">
              총 {list.words.length}개
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-[10px] sm:text-xs font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="px-2 sm:px-4 py-3 sm:py-4 w-10 sm:w-12 text-center whitespace-nowrap">
                  <button 
                    onClick={toggleSelectAll}
                    className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-400"
                  >
                    {selectedIds.size === filteredWords.length && filteredWords.length > 0 
                      ? <CheckSquare size={16} className="text-indigo-600" /> 
                      : <Square size={16} />
                    }
                  </button>
                </th>
                <th className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap">원형</th>
                <th className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap">읽는 법</th>
                <th className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap">뜻</th>
                <th className="px-2 sm:px-6 py-3 sm:py-4 text-center whitespace-nowrap w-20 sm:w-24">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                    {searchTerm ? '검색 결과가 없습니다.' : '등록된 단어가 없습니다.'}
                  </td>
                </tr>
              ) : (
                filteredWords.map(word => (
                  <tr key={word.id} className={`transition-all ${editingWordId === word.id ? 'bg-indigo-50/50 shadow-inner' : selectedIds.has(word.id) ? 'bg-indigo-50/30' : 'hover:bg-slate-50/80'}`}>
                    <td className="px-2 sm:px-4 py-3 sm:py-4 text-center">
                       <button 
                        onClick={() => toggleSelect(word.id)}
                        className="p-1 hover:bg-indigo-100 rounded transition-colors text-slate-300"
                      >
                        {selectedIds.has(word.id) 
                          ? <CheckSquare size={16} className="text-indigo-600" /> 
                          : <Square size={16} />
                        }
                      </button>
                    </td>
                    {editingWordId === word.id ? (
                      <>
                        <td className="px-2 sm:px-6 py-2">
                          <input 
                            ref={kanjiEditRef}
                            type="text" 
                            value={editKanji}
                            onChange={(e) => setEditKanji(e.target.value)}
                            className="w-full px-2 py-1.5 text-base sm:text-lg font-bold text-black bg-white border-2 border-indigo-400 rounded-md outline-none transition-all shadow-sm"
                            onKeyDown={(e) => e.key === 'Enter' && saveEditedWord(word.id)}
                          />
                        </td>
                        <td className="px-2 sm:px-6 py-2">
                          <input 
                            ref={readingEditRef}
                            type="text" 
                            value={editReading}
                            onChange={(e) => setEditReading(e.target.value)}
                            className="w-full px-2 py-1.5 text-sm sm:text-md font-medium text-indigo-600 bg-white border-2 border-indigo-400 rounded-md outline-none transition-all shadow-sm"
                            onKeyDown={(e) => e.key === 'Enter' && saveEditedWord(word.id)}
                          />
                        </td>
                        <td className="px-2 sm:px-6 py-2">
                          <input 
                            ref={meaningEditRef}
                            type="text" 
                            value={editMeaning}
                            onChange={(e) => setEditMeaning(e.target.value)}
                            className="w-full px-2 py-1.5 text-xs sm:text-sm text-slate-600 bg-white border-2 border-indigo-400 rounded-md outline-none transition-all shadow-sm"
                            onKeyDown={(e) => e.key === 'Enter' && saveEditedWord(word.id)}
                          />
                        </td>
                        <td className="px-2 sm:px-6 py-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button 
                              onClick={() => saveEditedWord(word.id)}
                              className="text-white bg-green-500 hover:bg-green-600 p-1.5 rounded-lg transition-all"
                            >
                              <Check size={16} />
                            </button>
                            <button 
                              onClick={cancelEditingWord}
                              className="text-slate-500 bg-slate-200 hover:bg-slate-300 p-1.5 rounded-lg transition-all"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td 
                          className="px-2 sm:px-6 py-3 sm:py-4 font-bold text-slate-800 text-base sm:text-lg cursor-pointer hover:bg-indigo-50 transition-colors group/cell whitespace-nowrap max-w-[80px] sm:max-w-none"
                          onClick={() => startEditingWord(word, 'kanji')}
                        >
                          <div className="truncate" title={word.kanji}>{word.kanji}</div>
                        </td>
                        <td 
                          className="px-2 sm:px-6 py-3 sm:py-4 text-indigo-600 font-medium text-sm sm:text-base cursor-pointer hover:bg-indigo-50 transition-colors group/cell whitespace-nowrap max-w-[80px] sm:max-w-none"
                          onClick={() => startEditingWord(word, 'reading')}
                        >
                          <div className="truncate" title={word.reading}>{word.reading}</div>
                        </td>
                        <td 
                          className="px-2 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600 cursor-pointer hover:bg-indigo-50 transition-colors group/cell whitespace-nowrap max-w-[100px] sm:max-w-none"
                          onClick={() => startEditingWord(word, 'meaning')}
                        >
                          <div className="truncate" title={word.meaning}>{word.meaning}</div>
                        </td>
                        <td className="px-2 sm:px-6 py-3 sm:py-4 text-center">
                          <div className="flex items-center justify-center gap-0.5 sm:gap-1 opacity-40 hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => startEditingWord(word, 'kanji')}
                              className="text-slate-400 hover:text-indigo-600 p-1 rounded-lg hover:bg-indigo-50 transition-all"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={() => removeWord(word.id)}
                              className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ListDetail;
