"use client";

import * as React from "react";
import { Check, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";
import { THEMES } from "@/lib/themes";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click.
  React.useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape.
  React.useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="تغيير المظهر"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-all hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
          open && "bg-white/15 text-white"
        )}
      >
        <Palette className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="animate-[cbDropdownIn_180ms_ease-out] absolute left-0 top-full z-50 mt-2 w-72 origin-top-left overflow-hidden rounded-2xl border border-white/10 bg-[#141326]/95 p-2 shadow-2xl backdrop-blur-xl"
        >
          <div className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-white/40">
            اختر المظهر
          </div>

          {THEMES.map((t) => {
            const active = t.id === theme;
            return (
              <button
                key={t.id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setTheme(t.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl p-3 text-right transition-colors",
                  active ? "bg-white/10" : "hover:bg-white/5"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br text-lg",
                    t.previewGradient
                  )}
                >
                  {t.emoji}
                </span>

                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      {t.label}
                    </span>
                    {active && (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-white/50">
                    {t.tagline}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}