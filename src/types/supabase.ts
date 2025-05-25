// src/types/supabase.ts
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      // 必要に応じてテーブル定義を追加
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}