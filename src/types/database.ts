// Supabase generated types (手動定義版)
// supabase gen types typescript で自動生成に切り替え可

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      laws: {
        Row: {
          law_id: string;
          law_title: string;
          law_num: string;
          law_type: string;
          raw_json: Json;
          structured: Json;
          fetched_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["laws"]["Row"], "fetched_at"> & { fetched_at?: string };
        Update: Partial<Database["public"]["Tables"]["laws"]["Insert"]>;
      };
      canons: {
        Row: {
          id: string;
          law_id: string;
          version: string;
          articles: Json;
          released_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["canons"]["Row"], "id" | "released_at"> & { id?: string; released_at?: string };
        Update: Partial<Database["public"]["Tables"]["canons"]["Insert"]>;
      };
      patches: {
        Row: {
          id: string;
          canon_id: string;
          title: string;
          description: string | null;
          author_id: string | null;
          patch_type: "A" | "C";
          status: "下書き" | "議論中" | "投票中" | "反映済" | "却下";
          plain_text: string;
          structured: Json;
          target_articles: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["patches"]["Row"], "id" | "created_at" | "updated_at" | "canon_id"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          canon_id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["patches"]["Insert"]>;
      };
      sources: {
        Row: {
          id: string;
          patch_id: string;
          tier: "一次" | "準一次" | "二次" | "三次";
          label: string;
          url: string | null;
          excerpt: string | null;
          sort_order: number;
        };
        Insert: Omit<Database["public"]["Tables"]["sources"]["Row"], "id"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["sources"]["Insert"]>;
      };
      discussions: {
        Row: {
          id: string;
          patch_id: string;
          target_line: string;
          summary: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["discussions"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["discussions"]["Insert"]>;
      };
      discussion_comments: {
        Row: {
          id: string;
          discussion_id: string;
          author_id: string | null;
          content: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["discussion_comments"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["discussion_comments"]["Insert"]>;
      };
      votes: {
        Row: {
          id: string;
          patch_id: string;
          user_id: string;
          vote: "agree" | "disagree" | "abstain";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["votes"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["votes"]["Insert"]>;
      };
      lint_results: {
        Row: {
          id: string;
          patch_id: string;
          severity: "error" | "warn" | "info" | "pass";
          rule_name: string;
          message: string;
          target_line: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["lint_results"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["lint_results"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
