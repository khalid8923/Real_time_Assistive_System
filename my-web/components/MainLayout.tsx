"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import ThemeSwitcher from "@/components/ThemeSwitcher";

/**
 * CaptionBridge brand palette used in this file:
 * Caption Navy  #101826  - fixed brand color for the top bar, independent of the host app's theme
 * Signal Red    #E1432C  - reserved exclusively for the live broadcast indicator
 * Every other color below inherits the host app's shadcn/ui theme tokens.
 */

export type ViewMode = "student" | "teacher";

interface MainLayoutProps {
  children: React.ReactNode;
  isLive?: boolean;
  defaultView?: ViewMode;
  onViewChange?: (view: ViewMode) => void;
}

export default function MainLayout({
  children,
  isLive = true,
  defaultView = "student",
  onViewChange,
}: MainLayoutProps) {
  const handleViewChange = React.useCallback(
    (nextView: ViewMode) => {
      onViewChange?.(nextView);
    },
    [onViewChange]
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="sticky top-0 z-50 w-full bg-[#101826]"
      >
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 flex-col items-start justify-center gap-1 rounded-md border border-white/20 bg-white/5 px-2"
            >
              <span className="h-0.75 w-full rounded-full bg-white" />
              <span className="h-0.75 w-3/5 rounded-full bg-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white sm:text-xl">
              CaptionBridge
            </span>
          </div>

          {/* Right cluster: Live + ThemeSwitcher + View switcher */}
          <div className="flex flex-1 flex-wrap items-center justify-end gap-3 sm:flex-none sm:gap-4">
            <Badge
              variant="outline"
              aria-live="polite"
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
                isLive
                  ? "border-[#E1432C]/30 bg-[#E1432C]/15 text-[#FF8A75]"
                  : "border-white/15 bg-white/5 text-white/60"
              )}
            >
              <span className="relative flex h-2 w-2">
                {isLive ? (
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#E1432C] opacity-75 motion-safe:animate-ping" />
                ) : null}
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
                aria-pressed={defaultView === "student"}
                onClick={() => handleViewChange("student")}
                className={cn(
                  "rounded-full px-3 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#101826] sm:px-4 sm:text-sm",
                  defaultView === "student"
                    ? "bg-white text-[#101826] hover:bg-white hover:text-[#101826]"
                    : "bg-transparent text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                واجهة الطالب
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                aria-pressed={defaultView === "teacher"}
                onClick={() => handleViewChange("teacher")}
                className={cn(
                  "rounded-full px-3 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#101826] sm:px-4 sm:text-sm",
                  defaultView === "teacher"
                    ? "bg-white text-[#101826] hover:bg-white hover:text-[#101826]"
                    : "bg-transparent text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                واجهة الدكتور
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        >
          <Card className="glass w-full border-border bg-transparent p-6 shadow-none sm:p-8">
            {children}
          </Card>
        </motion.div>
      </main>
    </div>
  );
}