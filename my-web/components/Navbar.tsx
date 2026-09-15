"use client";

import React from "react";
import type { ViewMode } from "@/components/MainLayout";

interface NavbarProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function Navbar({ view, onViewChange }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-sky-500 shadow-md">
            <span className="text-lg font-bold text-white">C</span>
          </div>
          <h1 className="text-lg font-extrabold tracking-tight sm:text-xl">
            <span className="text-indigo-600">Caption</span>
            <span className="text-sky-500">Bridge</span>
          </h1>
        </div>

        {/* Live Status */}
        <div className="hidden items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 sm:flex">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
          </span>
          <span className="text-xs font-semibold text-red-700">مباشر</span>
        </div>

        {/* View Switcher */}
        <div className="flex items-center rounded-full bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => onViewChange("student")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all sm:px-4 sm:text-sm ${
              view === "student"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            واجهة الطالب
          </button>
          <button
            type="button"
            onClick={() => onViewChange("teacher")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all sm:px-4 sm:text-sm ${
              view === "teacher"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            واجهة الدكتور
          </button>
        </div>
      </div>
    </header>
  );
}