"use client";

import Link from "next/link";
import { getFieldGroup } from "@/lib/w100-data";
import type { W100Field } from "@/lib/w100-types";

interface W100FieldCardProps {
  field: W100Field;
  topicCount?: number;
}

export function W100FieldCard({ field, topicCount }: W100FieldCardProps) {
  const group = getFieldGroup(field.groupId);
  if (!group) return null;

  return (
    <Link
      href={`/w100/${field.code}`}
      className="block rounded-lg border p-4 transition-all hover:shadow-lg hover:-translate-y-0.5"
      style={{ borderColor: group.color + "30", backgroundColor: group.bg }}
    >
      <div className="flex items-start justify-between">
        <span className="text-2xl font-black" style={{ color: group.color }}>
          {field.code}
        </span>
        {topicCount !== undefined && (
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ color: group.color, backgroundColor: group.color + "15" }}
          >
            {topicCount} topics
          </span>
        )}
      </div>
      <h3 className="mt-1 font-bold text-sm leading-snug" style={{ color: group.color }}>
        {field.name}
      </h3>
      {field.description && (
        <p className="mt-1 text-xs text-[var(--text-secondary)] line-clamp-2">
          {field.description}
        </p>
      )}
    </Link>
  );
}
