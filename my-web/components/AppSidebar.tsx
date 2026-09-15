"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  CATEGORY_LABELS,
  STUDENT_FEATURES,
  type Feature,
  type FeatureCategory,
  type FeatureId,
} from "@/lib/features";

interface AppSidebarProps {
  activeFeature: FeatureId;
  onFeatureChange: (id: FeatureId) => void;
}

const CATEGORY_ORDER: FeatureCategory[] = [
  "core",
  "accessibility",
  "ai",
];

export default function AppSidebar({
  activeFeature,
  onFeatureChange,
}: AppSidebarProps) {
  const grouped = React.useMemo(() => {
    const map = new Map<FeatureCategory, Feature[]>();
    for (const cat of CATEGORY_ORDER) map.set(cat, []);
    for (const feature of STUDENT_FEATURES) {
      const list = map.get(feature.category);
      if (list) list.push(feature);
    }
    return map;
  }, []);

  return (
    <aside
      dir="rtl"
      className="sticky top-20 hidden h-[calc(100vh-6rem)] w-64 shrink-0 overflow-y-auto lg:block"
    >
      <nav className="glass space-y-6 rounded-2xl border border-border p-3">
        {CATEGORY_ORDER.map((cat) => {
          const features = grouped.get(cat) ?? [];
          if (features.length === 0) return null;

          return (
            <div key={cat}>
              <h3 className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {CATEGORY_LABELS[cat]}
              </h3>
              <ul className="space-y-1">
                {features.map((feature) => (
                  <FeatureItem
                    key={feature.id}
                    feature={feature}
                    active={feature.id === activeFeature}
                    onClick={() => onFeatureChange(feature.id)}
                  />
                ))}
              </ul>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

/* ------------------------------------------------------------------ */

function FeatureItem({
  feature,
  active,
  onClick,
}: {
  feature: Feature;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = feature.icon;

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-right transition-all",
          active
            ? "bg-primary/10 text-primary"
            : "text-foreground/80 hover:bg-muted/60 hover:text-foreground"
        )}
      >
        {active && (
          <motion.span
            layoutId="sidebar-active-indicator"
            className="absolute inset-y-1 right-0 w-1 rounded-full bg-primary"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}

        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
            active
              ? "bg-primary text-primary-foreground"
              : "bg-muted/60 text-muted-foreground group-hover:bg-muted"
          )}
        >
          <Icon className="h-4 w-4" />
        </span>

        <span className="flex-1 min-w-0">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold">
              {feature.label}
            </span>
            {feature.badge && (
              <span className="shrink-0 rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                {feature.badge}
              </span>
            )}
          </span>
        </span>
      </button>
    </li>
  );
}