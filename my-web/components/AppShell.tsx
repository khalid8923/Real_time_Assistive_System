"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import AppSidebar from "@/components/AppSidebar";
import {
  STUDENT_FEATURES,
  TEACHER_FEATURES,
  type FeatureId,
} from "@/lib/features";

export type ViewMode = "student" | "teacher";

interface AppShellProps {
  children: React.ReactNode;
  activeFeature: FeatureId;
  onFeatureChange: (id: FeatureId) => void;
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  isLive?: boolean;
}

export default function AppShell({
  children,
  activeFeature,
  onFeatureChange,
  view,
  onViewChange,
  isLive = true,
}: AppShellProps) {
  const mobileFeatures =
    view === "student" ? STUDENT_FEATURES : TEACHER_FEATURES;

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      {/* ============================= TOP BAR ============================= */}
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#101826]/95 backdrop-blur-xl"
      >
        <div className="mx-auto flex w-full max-w-350 items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 flex-col items-start justify-center gap-1 rounded-md border border-white/20 bg-white/5 px-2"
            >
              <span className="h-0.75 w-full rounded-full bg-white" />
              <span className="h-0.75 w-3/5 rounded-full bg-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold tracking-tight text-white sm:text-lg">
                CaptionBridge
              </span>
              <span className="hidden text-[10px] font-medium text-white/50 sm:block">
                جسر التواصل للطلاب الصم
              </span>
            </div>
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Badge
              variant="outline"
              aria-live="polite"
              className={cn(
                "hidden items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium sm:flex",
                isLive
                  ? "border-[#E1432C]/30 bg-[#E1432C]/15 text-[#FF8A75]"
                  : "border-white/15 bg-white/5 text-white/60"
              )}
            >
              <span className="relative flex h-2 w-2">
                {isLive && (
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#E1432C] opacity-75 motion-safe:animate-ping" />
                )}
                <span
                  className={cn(
                    "relative inline-flex h-2 w-2 rounded-full",
                    isLive ? "bg-[#E1432C]" : "bg-white/50"
                  )}
                />
              </span>
              {isLive ? "مباشر" : "غير متصل"}
            </Badge>

            <ThemeSwitcher />

            <div
              role="group"
              aria-label="تبديل واجهة التطبيق"
              className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1"
            >
              <Button
                type="button"
                size="sm"
                variant="ghost"
                aria-pressed={view === "student"}
                onClick={() => onViewChange("student")}
                className={cn(
                  "rounded-full px-3 text-xs font-medium transition-colors sm:px-4 sm:text-sm",
                  view === "student"
                    ? "bg-white text-[#101826] hover:bg-white hover:text-[#101826]"
                    : "bg-transparent text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <span className="hidden sm:inline">واجهة الطالب</span>
                <span className="sm:hidden">طالب</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                aria-pressed={view === "teacher"}
                onClick={() => onViewChange("teacher")}
                className={cn(
                  "rounded-full px-3 text-xs font-medium transition-colors sm:px-4 sm:text-sm",
                  view === "teacher"
                    ? "bg-white text-[#101826] hover:bg-white hover:text-[#101826]"
                    : "bg-transparent text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <span className="hidden sm:inline">واجهة الدكتور</span>
                <span className="sm:hidden">دكتور</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ============================= BODY ============================= */}
      <div className="mx-auto flex w-full max-w-350 flex-1 gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Sidebar (desktop only) */}
        {view === "student" && (
          <AppSidebar
            activeFeature={activeFeature}
            onFeatureChange={onFeatureChange}
          />
        )}

        {/* Main canvas */}
        <main className="flex-1 min-w-0">
          <motion.div
            key={`${view}-${activeFeature}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* ============================= MOBILE BOTTOM BAR ============================= */}
      {view === "student" && (
        <nav
          dir="rtl"
          className="sticky bottom-0 z-40 w-full border-t border-border bg-background/95 backdrop-blur-xl lg:hidden"
        >
          <div className="flex items-center gap-1 overflow-x-auto px-2 py-2">
            {mobileFeatures.map((feature) => {
              const Icon = feature.icon;
              const active = feature.id === activeFeature;
              return (
                <button
                  key={feature.id}
                  type="button"
                  onClick={() => onFeatureChange(feature.id)}
                  className={cn(
                    "flex shrink-0 flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/60"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">
                    {feature.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}