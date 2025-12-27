
export interface Word {
  id: string;
  kanji: string;      // 원형
  reading: string;    // 읽는 법
  meaning: string;    // 뜻
}

export interface VocabList {
  id: string;
  title: string;
  description: string;
  words: Word[];
  createdAt: number;
}

export interface UserAnswer {
  wordId: string;
  userReading: string;
  userMeaning: string;
}

export type ViewState = 'HOME' | 'LIST_DETAIL' | 'TEST' | 'RESULT';
