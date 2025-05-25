export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {};
    Views: {};
    Functions: {};
    Enums: {};
  };
};
