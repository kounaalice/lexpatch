"use client";

import Link from "next/link";
import { W100_FIELDS, W100_FIELD_GROUPS, getFieldByCode, getFieldGroup } from "@/lib/w100-data";

interface W100GridProps {
  /** "cc" = 100分野グリッド, "tt" = 100話題グリッド */
  mode: "cc" | "tt";
  /** TT モード時の CC コード */
  ccCode?: string;
  /** TT モード時の話題データ */
  topics?: { code: string; name: string }[];
  /** クリック時のベースURL */
  basePath?: string;
}

export function W100Grid({ mode, ccCode, topics, basePath = "/w100" }: W100GridProps) {
  if (mode === "cc") {
    return <CCGrid basePath={basePath} />;
  }
  return <TTGrid ccCode={ccCode!} topics={topics ?? []} basePath={basePath} />;
}

function CCGrid({ basePath }: { basePath: string }) {
  return (
    <div>
      {/* グループヘッダー付き 10×10 表示 */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-1">
        {W100_FIELD_GROUPS.map((group) => (
          <div key={group.id} className="col-span-2 sm:col-span-5 lg:col-span-10 mt-4 first:mt-0">
            <div
              className="text-xs font-bold px-2 py-1 rounded-t"
              style={{ color: group.color, backgroundColor: group.bg }}
            >
              {group.range} {group.label}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-1">
              {W100_FIELDS.filter((f) => f.groupId === group.id).map((field) => (
                <Link
                  key={field.code}
                  href={`${basePath}/${field.code}`}
                  className="block p-2 rounded border text-center transition-colors hover:shadow-md"
                  style={{
                    borderColor: group.color + "30",
                    backgroundColor: group.bg,
                  }}
                >
                  <span className="block text-lg font-bold" style={{ color: group.color }}>
                    {field.code}
                  </span>
                  <span className="block text-[10px] sm:text-xs leading-tight text-[var(--text-secondary)]">
                    {field.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// TT グループ定義（全CC共通の概念階層）
const TT_GROUP_LABELS = [
  "基礎・定義",
  "理論・分類",
  "歴史・変遷",
  "制度・ガバナンス",
  "設計・方法論",
  "実務・運用",
  "事例・応用",
  "データ・評価",
  "教育・普及",
  "未来・退避",
];

// TT 各コードの共通デフォルト名（CC固有データがない場合のフォールバック）
const TT_DEFAULT_NAMES: Record<string, string> = {
  "00": "定義・用語",
  "01": "基本概念",
  "02": "基礎要素",
  "03": "原則・前提",
  "04": "分類・類型",
  "05": "主要領域",
  "06": "関連概念",
  "07": "基礎技能",
  "08": "入門的理解",
  "09": "総合概論",
  "10": "学問体系論",
  "11": "分類・区分論",
  "12": "統合・学際理論",
  "13": "メタ理論",
  "14": "システム論",
  "15": "情報・モデル論",
  "16": "記号・言語論",
  "17": "哲学的基盤",
  "18": "数理的基盤",
  "19": "理論的枠組み",
  "20": "古代〜前近代",
  "21": "中世・近世",
  "22": "近代初期",
  "23": "近代発展期",
  "24": "日本の歴史",
  "25": "制度史",
  "26": "変革・転換",
  "27": "20世紀展開",
  "28": "デジタル化",
  "29": "21世紀の変遷",
  "30": "政策・戦略",
  "31": "国際制度",
  "32": "組織・機関",
  "33": "法制度",
  "34": "教育制度",
  "35": "公共資源",
  "36": "知財・権利",
  "37": "標準・規格",
  "38": "コミュニケーション",
  "39": "公共管理",
  "40": "設計原理",
  "41": "マッピング手法",
  "42": "検索・探索設計",
  "43": "可視化",
  "44": "データベース設計",
  "45": "メタデータ設計",
  "46": "編集・索引手法",
  "47": "カリキュラム設計",
  "48": "アーキテクチャ",
  "49": "マネジメント手法",
  "50": "実務概要",
  "51": "運用手順",
  "52": "品質管理",
  "53": "リスク管理",
  "54": "プロジェクト管理",
  "55": "コスト管理",
  "56": "人材・組織運用",
  "57": "ツール・技術",
  "58": "パフォーマンス管理",
  "59": "改善・最適化",
  "60": "代表的事例",
  "61": "国内事例",
  "62": "海外事例",
  "63": "先進的事例",
  "64": "失敗事例・教訓",
  "65": "比較分析",
  "66": "ベストプラクティス",
  "67": "応用展開",
  "68": "分野横断応用",
  "69": "ケーススタディ",
  "70": "統計・指標",
  "71": "データ収集法",
  "72": "分析手法",
  "73": "評価基準",
  "74": "ベンチマーク",
  "75": "定量評価",
  "76": "定性評価",
  "77": "影響評価",
  "78": "モニタリング",
  "79": "データ公開・共有",
  "80": "教育概論",
  "81": "教材・教授法",
  "82": "資格・認定",
  "83": "生涯学習",
  "84": "普及・啓発",
  "85": "市民教育",
  "86": "専門教育",
  "87": "オンライン教育",
  "88": "国際教育",
  "89": "教育評価",
  "90": "未来展望",
  "91": "技術的予測",
  "92": "社会的展望",
  "93": "課題・リスク",
  "94": "倫理的課題",
  "95": "持続可能性",
  "96": "次世代構想",
  "97": "実験的試み",
  "98": "フロンティア",
  "99": "退避・アーカイブ",
};

function TTGrid({
  ccCode,
  topics,
  basePath,
}: {
  ccCode: string;
  topics: { code: string; name: string }[];
  basePath: string;
}) {
  const field = getFieldByCode(ccCode);
  const group = field ? getFieldGroup(field.groupId) : null;
  const color = group?.color ?? "#374151";
  const bg = group?.bg ?? "#F3F4F6";

  return (
    <div>
      {TT_GROUP_LABELS.map((groupLabel, gi) => {
        const rangeStart = gi * 10;
        const rangeCodes = Array.from({ length: 10 }, (_, i) =>
          String(rangeStart + i).padStart(2, "0"),
        );

        return (
          <div key={gi} className="mb-4">
            <div
              className="text-xs font-bold px-2 py-1 rounded-t"
              style={{ color, backgroundColor: bg }}
            >
              {rangeCodes[0]}-{rangeCodes[9]} {groupLabel}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-1">
              {rangeCodes.map((ttCode) => {
                const topic = topics.find((t) => t.code === ttCode);
                const displayName = topic?.name ?? TT_DEFAULT_NAMES[ttCode] ?? groupLabel;
                const hasSpecific = !!topic;
                return (
                  <Link
                    key={ttCode}
                    href={`${basePath}/${ccCode}/${ttCode}`}
                    className="block p-2 rounded border text-center transition-colors hover:shadow-md"
                    style={{ borderColor: color + "20", backgroundColor: bg }}
                  >
                    <span className="block text-sm font-bold" style={{ color }}>
                      {ttCode}
                    </span>
                    <span
                      className="block text-[10px] leading-tight"
                      style={{
                        color: hasSpecific ? "var(--text-primary)" : "var(--text-secondary)",
                      }}
                    >
                      {displayName}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
