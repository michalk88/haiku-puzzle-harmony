
export interface Haiku {
  id: string;
  title: string;
  line1_words: string[];
  line2_words: string[];
  line3_words: string[];
  created_at: string;
}

export interface CompletedHaiku {
  id: string;
  user_id: string;
  haiku_id: string;
  created_at: string;
  originalHaiku?: Haiku;
}
