import { uuid } from "./uuid";
/**
 * チェックリストテンプレート — 法改正対応手順の定型タスク
 * situations.ts / categories.ts と同パターンの静的データファイル
 */

export interface ChecklistTemplateTask {
  title: string;
  description?: string;
  /** プロジェクト開始日からの相対日数 */
  relativeDeadlineDays?: number;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  description: string;
  category: "law_amendment" | "public_comment" | "regulation_update" | "application";
  icon: string;
  tasks: ChecklistTemplateTask[];
}

export const CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  {
    id: "law_impact_assessment",
    name: "法改正影響調査",
    description: "法令改正の影響を調査し、対応方針を策定するための標準手順",
    category: "law_amendment",
    icon: "\uD83D\uDD0D",
    tasks: [
      {
        title: "改正法令の特定・概要把握",
        description: "官報・e-Gov等で改正内容を確認",
        relativeDeadlineDays: 3,
      },
      {
        title: "現行規定との比較（新旧対照表作成）",
        description: "改正前後の条文を対比し変更点を整理",
        relativeDeadlineDays: 7,
      },
      {
        title: "影響範囲の洗い出し",
        description: "自社業務・契約・社内規程への影響を特定",
        relativeDeadlineDays: 14,
      },
      {
        title: "関連部署へのヒアリング",
        description: "実務への影響について各部署に確認",
        relativeDeadlineDays: 21,
      },
      {
        title: "影響度評価（高・中・低）",
        description: "対応の優先度と緊急度を判定",
        relativeDeadlineDays: 25,
      },
      {
        title: "対応方針の策定",
        description: "必要な対応策と実施スケジュールを策定",
        relativeDeadlineDays: 30,
      },
      {
        title: "報告書の作成",
        description: "経営層向けの影響調査報告書を作成",
        relativeDeadlineDays: 35,
      },
      {
        title: "経営層への報告・承認取得",
        description: "対応方針について経営判断を仰ぐ",
        relativeDeadlineDays: 40,
      },
    ],
  },
  {
    id: "public_comment",
    name: "パブコメ対応",
    description: "パブリックコメント（意見公募手続）への対応手順",
    category: "public_comment",
    icon: "\uD83D\uDCDD",
    tasks: [
      {
        title: "パブコメ公示の確認",
        description: "e-Gov等で募集要項・期間・提出先を確認",
        relativeDeadlineDays: 2,
      },
      {
        title: "改正案の分析・論点整理",
        description: "改正案の内容を精読し、意見すべき論点を整理",
        relativeDeadlineDays: 10,
      },
      {
        title: "意見案の起草",
        description: "各論点について意見・理由・対案を文書化",
        relativeDeadlineDays: 20,
      },
      {
        title: "社内レビュー・承認",
        description: "法務部門・関係部署の確認を経て最終稿に",
        relativeDeadlineDays: 25,
      },
      { title: "意見の提出", description: "期限内にe-Gov等で電子提出", relativeDeadlineDays: 28 },
      {
        title: "結果の確認・フォローアップ",
        description: "結果公示後、反映状況を確認し社内共有",
        relativeDeadlineDays: 60,
      },
    ],
  },
  {
    id: "internal_regulation",
    name: "社内規程改定",
    description: "法令改正に伴う社内規程・マニュアルの改定手順",
    category: "regulation_update",
    icon: "\uD83D\uDCCB",
    tasks: [
      {
        title: "改定対象規程の洗い出し",
        description: "改正法令に関連する社内規程・マニュアルを特定",
        relativeDeadlineDays: 5,
      },
      {
        title: "改定案の起草",
        description: "法令改正内容を反映した修正案を作成",
        relativeDeadlineDays: 15,
      },
      {
        title: "法務部門レビュー",
        description: "法的整合性・表現の適切さを法務で確認",
        relativeDeadlineDays: 20,
      },
      {
        title: "関係部署との調整",
        description: "実務運用面の問題がないか各部署と調整",
        relativeDeadlineDays: 25,
      },
      {
        title: "承認手続き（取締役会等）",
        description: "規程改定に必要な社内承認を取得",
        relativeDeadlineDays: 35,
      },
      {
        title: "規程の公示・社内周知",
        description: "改定規程を社内ポータル等で公示・周知",
        relativeDeadlineDays: 40,
      },
      {
        title: "研修の実施",
        description: "改定内容について対象者へ研修を実施",
        relativeDeadlineDays: 50,
      },
    ],
  },
  {
    id: "filing_application",
    name: "届出・申請対応",
    description: "法令に基づく届出・申請・報告の対応手順",
    category: "application",
    icon: "\uD83D\uDCE8",
    tasks: [
      {
        title: "届出・申請要否の確認",
        description: "法令要件を確認し、届出義務の有無を判定",
        relativeDeadlineDays: 3,
      },
      {
        title: "必要書類の確認・準備",
        description: "添付書類一覧を作成し、必要資料を収集",
        relativeDeadlineDays: 10,
      },
      {
        title: "申請書の作成",
        description: "所定様式に従い申請書を作成",
        relativeDeadlineDays: 15,
      },
      {
        title: "社内承認の取得",
        description: "申請内容について社内決裁を取得",
        relativeDeadlineDays: 20,
      },
      {
        title: "提出（窓口 or 電子申請）",
        description: "期限内に管轄行政機関へ提出",
        relativeDeadlineDays: 25,
      },
      {
        title: "受理確認・控え保管",
        description: "受理番号を記録し、控え書類を保管",
        relativeDeadlineDays: 28,
      },
    ],
  },
];

/** テンプレートIDで取得 */
export function getTemplateById(id: string): ChecklistTemplate | undefined {
  return CHECKLIST_TEMPLATES.find((t) => t.id === id);
}

/** テンプレートからProjectTask配列を生成 */
export function generateTasksFromTemplate(
  template: ChecklistTemplate,
  startDate?: string,
): Array<{
  id: string;
  title: string;
  done: boolean;
  description?: string;
  due?: string;
}> {
  const start = startDate ? new Date(startDate) : new Date();

  return template.tasks.map((t) => {
    const task: {
      id: string;
      title: string;
      done: boolean;
      description?: string;
      due?: string;
    } = {
      id: uuid(),
      title: t.title,
      done: false,
    };

    if (t.description) task.description = t.description;

    if (t.relativeDeadlineDays !== undefined) {
      const due = new Date(start);
      due.setDate(due.getDate() + t.relativeDeadlineDays);
      task.due = due.toISOString().slice(0, 10);
    }

    return task;
  });
}
