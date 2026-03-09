"use client";

import Link from "next/link";
import { getFieldByCode, getFieldGroup } from "@/lib/w100-data";

interface W100BreadcrumbProps {
  ccCode?: string;
  ttCode?: string;
  fieldName?: string;
  topicName?: string;
}

export function W100Breadcrumb({ ccCode, ttCode, fieldName, topicName }: W100BreadcrumbProps) {
  const field = ccCode ? getFieldByCode(ccCode) : null;
  const group = field ? getFieldGroup(field.groupId) : null;

  return (
    <nav className="flex items-center gap-1 text-sm text-[var(--text-secondary)] mb-4 flex-wrap">
      <Link href="/w100" className="hover:text-[var(--accent)] transition-colors">
        W100
      </Link>

      {ccCode && (
        <>
          <span className="mx-1">/</span>
          {ttCode ? (
            <Link href={`/w100/${ccCode}`} className="hover:text-[var(--accent)] transition-colors">
              <span
                className="inline-block px-1.5 py-0.5 rounded text-xs font-bold"
                style={{ color: group?.color, backgroundColor: group?.bg }}
              >
                CC{ccCode}
              </span>
              <span className="ml-1">{fieldName ?? field?.name}</span>
            </Link>
          ) : (
            <span>
              <span
                className="inline-block px-1.5 py-0.5 rounded text-xs font-bold"
                style={{ color: group?.color, backgroundColor: group?.bg }}
              >
                CC{ccCode}
              </span>
              <span className="ml-1 text-[var(--text-primary)]">{fieldName ?? field?.name}</span>
            </span>
          )}
        </>
      )}

      {ttCode && (
        <>
          <span className="mx-1">/</span>
          <span className="text-[var(--text-primary)]">
            <span
              className="inline-block px-1.5 py-0.5 rounded text-xs font-bold"
              style={{ color: group?.color, backgroundColor: group?.bg }}
            >
              TT{ttCode}
            </span>
            {topicName && <span className="ml-1">{topicName}</span>}
          </span>
        </>
      )}
    </nav>
  );
}
