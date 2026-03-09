/**
 * 議事録メモ — 型定義
 */

export interface MeetingActionItem {
  description: string;
  assignee?: string;
  taskId?: string;
  done?: boolean;
}

export interface MeetingMinutes {
  id: string;
  project_id: string;
  title: string;
  meeting_date: string;
  attendees: string[];
  agenda: string | null;
  decisions: string | null;
  action_items: MeetingActionItem[];
  author_name: string | null;
  created_at: string;
  updated_at: string;
}
