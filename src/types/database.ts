// Supabase generated types (手動定義版)
// supabase gen types typescript で自動生成に切り替え可

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// ─── JSONB column helper types ──────────────────────────
/** projects.members JSONB のエントリ */
export interface ProjectMember {
  name: string;
  org?: string;
  role?: string;
}

/** projects.tasks JSONB のエントリ */
export interface ProjectTask {
  id: string;
  title: string;
  assignee?: string;
  done?: boolean;
  due?: string;
  dueTime?: string;
  status?: string;
  category?: string;
}

/** ws_approvals.steps JSONB のエントリ */
export interface ApprovalStep {
  step: number;
  approver_id: string;
  approver_name?: string;
  status: string;
  comment?: string;
  acted_at?: string;
}

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
        Insert: Omit<Database["public"]["Tables"]["laws"]["Row"], "fetched_at"> & {
          fetched_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["laws"]["Insert"]>;
        Relationships: [];
      };
      canons: {
        Row: {
          id: string;
          law_id: string;
          version: string;
          articles: Json;
          released_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["canons"]["Row"], "id" | "released_at"> & {
          id?: string;
          released_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["canons"]["Insert"]>;
        Relationships: [];
      };
      patches: {
        Row: {
          id: string;
          canon_id: string | null;
          law_id: string | null;
          law_title: string | null;
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
        Insert: Omit<
          Database["public"]["Tables"]["patches"]["Row"],
          | "id"
          | "created_at"
          | "updated_at"
          | "canon_id"
          | "law_title"
          | "law_id"
          | "description"
          | "author_id"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          canon_id?: string | null;
          law_title?: string | null;
          law_id?: string | null;
          description?: string | null;
          author_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["patches"]["Insert"]>;
        Relationships: [];
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
        Insert: Omit<Database["public"]["Tables"]["sources"]["Row"], "id" | "sort_order"> & {
          id?: string;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["sources"]["Insert"]>;
        Relationships: [];
      };
      discussions: {
        Row: {
          id: string;
          patch_id: string;
          target_line: string;
          summary: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["discussions"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["discussions"]["Insert"]>;
        Relationships: [];
      };
      discussion_comments: {
        Row: {
          id: string;
          discussion_id: string;
          author_id: string | null;
          content: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["discussion_comments"]["Row"],
          "id" | "created_at"
        > & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["discussion_comments"]["Insert"]>;
        Relationships: [];
      };
      votes: {
        Row: {
          id: string;
          patch_id: string;
          user_id: string;
          vote: "agree" | "disagree" | "abstain";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["votes"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["votes"]["Insert"]>;
        Relationships: [];
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
        Insert: Omit<Database["public"]["Tables"]["lint_results"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["lint_results"]["Insert"]>;
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          law_ids: string[];
          bookmarks: Json;
          owner_name: string | null;
          status: string;
          references: Json;
          tasks: Json;
          approvals: Json;
          activity_log: Json;
          members: Json;
          phase_deadlines: Json;
          visibility: string;
          access_password_hash: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["projects"]["Row"],
          | "id"
          | "created_at"
          | "updated_at"
          | "status"
          | "references"
          | "tasks"
          | "approvals"
          | "activity_log"
          | "members"
          | "phase_deadlines"
          | "visibility"
          | "access_password_hash"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          status?: string;
          references?: Json;
          tasks?: Json;
          approvals?: Json;
          activity_log?: Json;
          members?: Json;
          phase_deadlines?: Json;
          visibility?: string;
          access_password_hash?: string;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
        Relationships: [];
      };
      project_notes: {
        Row: {
          id: string;
          project_id: string;
          content: string;
          author_name: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["project_notes"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["project_notes"]["Insert"]>;
        Relationships: [];
      };
      commentaries: {
        Row: {
          id: string;
          law_id: string;
          law_title: string | null;
          article_title: string;
          content: string;
          author_name: string | null;
          member_id: string | null;
          sources: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["commentaries"]["Row"],
          "id" | "created_at" | "updated_at" | "sources" | "law_title" | "member_id"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          sources?: Json;
          law_title?: string | null;
          member_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["commentaries"]["Insert"]>;
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          action: string;
          actor_id: string | null;
          actor_name: string | null;
          actor_ip: string | null;
          resource_type: string | null;
          resource_id: string | null;
          detail: Json;
          created_at: string;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          actor_name?: string | null;
          actor_ip?: string | null;
          resource_type?: string | null;
          resource_id?: string | null;
          detail?: Json;
          id?: string;
          created_at?: string;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          actor_name?: string | null;
          actor_ip?: string | null;
          resource_type?: string | null;
          resource_id?: string | null;
          detail?: Json;
        };
        Relationships: [];
      };
      // ─── 会員・認証 ─────────────────────────────────────
      member_profiles: {
        Row: {
          id: string;
          name: string;
          org: string;
          org_type: string | null;
          bio: string | null;
          experience: string | null;
          preferred_areas: string[] | null;
          password_hash: string;
          role: string | null;
          email: string | null;
          notification_prefs: Json | null;
          situation_profile: Json | null;
          gaming_profile: Json | null;
          auth_provider: string | null;
          auth_provider_id: string | null;
          avatar_url: string | null;
          email_verified: boolean | null;
          password_reset_token: string | null;
          password_reset_expires: string | null;
          login_attempts: number | null;
          locked_until: string | null;
          session_nonce: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          org?: string;
          password_hash: string;
          id?: string;
          org_type?: string | null;
          bio?: string | null;
          experience?: string | null;
          preferred_areas?: string[] | null;
          role?: string | null;
          email?: string | null;
          notification_prefs?: Json | null;
          situation_profile?: Json | null;
          gaming_profile?: Json | null;
          auth_provider?: string | null;
          auth_provider_id?: string | null;
          avatar_url?: string | null;
          email_verified?: boolean | null;
          password_reset_token?: string | null;
          password_reset_expires?: string | null;
          login_attempts?: number | null;
          locked_until?: string | null;
          session_nonce?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["member_profiles"]["Insert"]>;
        Relationships: [];
      };
      member_follows: {
        Row: {
          id: string;
          follower_id: string | null;
          following_id: string | null;
          member_id: string | null;
          target_type: string | null;
          target_id: string | null;
          target_title: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id?: string | null;
          following_id?: string | null;
          member_id?: string | null;
          target_type?: string | null;
          target_id?: string | null;
          target_title?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["member_follows"]["Insert"]>;
        Relationships: [];
      };
      // ─── お問い合わせ ───────────────────────────────────
      contacts: {
        Row: {
          id: string;
          name: string;
          email: string;
          organization: string | null;
          subject: string | null;
          message: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["contacts"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["contacts"]["Insert"]>;
        Relationships: [];
      };
      // ─── コミュニティ ───────────────────────────────────
      communities: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string | null;
          law_ids: string[] | null;
          owner_member_id: string | null;
          visibility: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          id?: string;
          description?: string | null;
          category?: string | null;
          law_ids?: string[] | null;
          owner_member_id?: string | null;
          visibility?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["communities"]["Insert"]>;
        Relationships: [];
      };
      community_members: {
        Row: {
          id: string;
          community_id: string;
          member_id: string;
          joined_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["community_members"]["Row"],
          "id" | "joined_at"
        > & { id?: string; joined_at?: string };
        Update: Partial<Database["public"]["Tables"]["community_members"]["Insert"]>;
        Relationships: [];
      };
      community_messages: {
        Row: {
          id: string;
          community_id: string;
          member_id: string;
          content: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["community_messages"]["Row"],
          "id" | "created_at"
        > & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["community_messages"]["Insert"]>;
        Relationships: [];
      };
      // ─── 通知 ───────────────────────────────────────────
      notifications: {
        Row: {
          id: string;
          member_id: string;
          type: string;
          title: string;
          body: string | null;
          link: string | null;
          project_id: string | null;
          is_read: boolean | null;
          sender_member_id: string | null;
          content: string | null;
          target_type: string | null;
          target_filter: Json | null;
          created_at: string;
        };
        Insert: {
          member_id: string;
          title: string;
          id?: string;
          type?: string;
          body?: string | null;
          link?: string | null;
          project_id?: string | null;
          is_read?: boolean | null;
          sender_member_id?: string | null;
          content?: string | null;
          target_type?: string | null;
          target_filter?: Json | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
        Relationships: [];
      };
      notification_reads: {
        Row: {
          id: string;
          notification_id: string;
          member_id: string;
          read_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["notification_reads"]["Row"],
          "id" | "read_at"
        > & { id?: string; read_at?: string };
        Update: Partial<Database["public"]["Tables"]["notification_reads"]["Insert"]>;
        Relationships: [];
      };
      // ─── プロジェクトメッセージ ─────────────────────────
      project_messages: {
        Row: {
          id: string;
          project_id: string;
          author_name: string;
          content: string;
          visibility: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["project_messages"]["Row"],
          "id" | "created_at"
        > & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["project_messages"]["Insert"]>;
        Relationships: [];
      };
      // ─── 添付ファイル ───────────────────────────────────
      attachments: {
        Row: {
          id: string;
          context_type: string;
          context_id: string;
          filename: string;
          original_name: string;
          content_type: string;
          size_bytes: number;
          r2_key: string;
          uploaded_by: string | null;
          uploaded_by_name: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["attachments"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["attachments"]["Insert"]>;
        Relationships: [];
      };
      // ─── 判例 ───────────────────────────────────────────
      precedents: {
        Row: {
          id: string;
          lawsuit_id: string;
          trial_type: string;
          case_number: string;
          case_name: string;
          court_name: string;
          date: string;
          result_type: string | null;
          result: string | null;
          article_info: string | null;
          gist: string | null;
          case_gist: string | null;
          ref_law: string | null;
          detail_url: string;
          pdf_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["precedents"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["precedents"]["Insert"]>;
        Relationships: [];
      };
      precedent_law_refs: {
        Row: {
          id: string;
          precedent_id: string;
          law_id: string;
          law_name: string;
          article: string;
          paragraph: string | null;
          item: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["precedent_law_refs"]["Row"],
          "id" | "created_at"
        > & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["precedent_law_refs"]["Insert"]>;
        Relationships: [];
      };
      // ─── 溶け込み法令 ───────────────────────────────────
      consolidated_laws: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          law_num: string | null;
          description: string | null;
          books: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["consolidated_laws"]["Row"],
          "id" | "created_at" | "updated_at"
        > & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["consolidated_laws"]["Insert"]>;
        Relationships: [];
      };
      // ─── 法令アラート ───────────────────────────────────
      law_alert_log: {
        Row: {
          id: string;
          law_id: string;
          law_title: string;
          law_num: string;
          alert_type: string;
          law_date: string;
          discovered_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["law_alert_log"]["Row"],
          "id" | "discovered_at"
        > & { id?: string; discovered_at?: string };
        Update: Partial<Database["public"]["Tables"]["law_alert_log"]["Insert"]>;
        Relationships: [];
      };
      law_alert_sends: {
        Row: {
          id: string;
          alert_log_id: string;
          member_id: string;
          send_type: string;
          sent_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["law_alert_sends"]["Row"], "id" | "sent_at"> & {
          id?: string;
          sent_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["law_alert_sends"]["Insert"]>;
        Relationships: [];
      };
      law_digest_tracker: {
        Row: {
          member_id: string;
          last_digest_sent: string | null;
        };
        Insert: {
          member_id: string;
          last_digest_sent?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["law_digest_tracker"]["Insert"]>;
        Relationships: [];
      };
      // ─── タスクアラート ─────────────────────────────────
      task_alert_sends: {
        Row: {
          id: string;
          project_id: string;
          task_id: string;
          member_id: string | null;
          alert_type: string;
          sent_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["task_alert_sends"]["Row"], "id" | "sent_at"> & {
          id?: string;
          sent_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["task_alert_sends"]["Insert"]>;
        Relationships: [];
      };
      // ─── 議事録 ─────────────────────────────────────────
      meeting_minutes: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          meeting_date: string;
          attendees: Json | null;
          agenda: string | null;
          decisions: string | null;
          action_items: Json | null;
          author_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["meeting_minutes"]["Row"],
          "id" | "created_at" | "updated_at"
        > & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["meeting_minutes"]["Insert"]>;
        Relationships: [];
      };
      // ─── ワークスペース ─────────────────────────────────
      ws_forms: {
        Row: {
          id: string;
          workspace_id: string | null;
          member_id: string;
          title: string;
          description: string | null;
          fields: Json;
          settings: Json | null;
          status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["ws_forms"]["Row"],
          "id" | "created_at" | "updated_at"
        > & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["ws_forms"]["Insert"]>;
        Relationships: [];
      };
      ws_form_responses: {
        Row: {
          id: string;
          form_id: string;
          respondent_name: string | null;
          respondent_email: string | null;
          data: Json;
          submitted_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["ws_form_responses"]["Row"],
          "id" | "submitted_at"
        > & { id?: string; submitted_at?: string };
        Update: Partial<Database["public"]["Tables"]["ws_form_responses"]["Insert"]>;
        Relationships: [];
      };
      ws_approvals: {
        Row: {
          id: string;
          workspace_id: string | null;
          requester_id: string;
          title: string;
          description: string | null;
          category: string | null;
          status: string | null;
          steps: Json;
          current_step: number | null;
          attachments: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["ws_approvals"]["Row"],
          | "id"
          | "created_at"
          | "updated_at"
          | "workspace_id"
          | "description"
          | "category"
          | "status"
          | "current_step"
          | "attachments"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          workspace_id?: string | null;
          description?: string | null;
          category?: string | null;
          status?: string | null;
          current_step?: number | null;
          attachments?: Json | null;
        };
        Update: Partial<Database["public"]["Tables"]["ws_approvals"]["Insert"]>;
        Relationships: [];
      };
      ws_bulletins: {
        Row: {
          id: string;
          workspace_id: string | null;
          author_id: string;
          title: string;
          content: string;
          category: string | null;
          pinned: boolean | null;
          published_at: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["ws_bulletins"]["Row"],
          "id" | "published_at" | "created_at"
        > & { id?: string; published_at?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["ws_bulletins"]["Insert"]>;
        Relationships: [];
      };
      ws_bulletin_reads: {
        Row: {
          bulletin_id: string;
          member_id: string;
          read_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["ws_bulletin_reads"]["Row"], "read_at"> & {
          read_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ws_bulletin_reads"]["Insert"]>;
        Relationships: [];
      };
      ws_circulars: {
        Row: {
          id: string;
          workspace_id: string | null;
          author_id: string;
          title: string;
          content: string;
          target_member_ids: string[];
          deadline: string | null;
          status: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["ws_circulars"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ws_circulars"]["Insert"]>;
        Relationships: [];
      };
      ws_circular_confirmations: {
        Row: {
          circular_id: string;
          member_id: string;
          confirmed_at: string;
          comment: string | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["ws_circular_confirmations"]["Row"],
          "confirmed_at"
        > & { confirmed_at?: string };
        Update: Partial<Database["public"]["Tables"]["ws_circular_confirmations"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
