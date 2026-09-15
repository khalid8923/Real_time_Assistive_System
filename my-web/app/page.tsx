"use client";

import React, { useCallback, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Construction } from "lucide-react";
import AppShell, { type ViewMode } from "@/components/AppShell";
import SpeechInput, { type AnalysisData } from "@/components/SpeechInput";
import MindMap from "@/components/MindMap";
import GlossaryPanel from "@/components/GlossaryPanel";
import { getFeature, type FeatureId } from "@/lib/features";

interface Notification {
  id: number;
  action: string;
  time: string;
}

export default function Page() {
  const [view, setView] = useState<ViewMode>("student");
  const [activeFeature, setActiveFeature] = useState<FeatureId>("captions");
  const [analyzedData, setAnalyzedData] = useState<AnalysisData | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastSentFeedback, setLastSentFeedback] = useState<string | null>(null);

  const handleAnalyze = useCallback((data: AnalysisData) => {
    setAnalyzedData(data);
  }, []);

  const handleAction = useCallback((action: "ask" | "re-explain") => {
    const text = action === "ask" ? "عايز أسأل ✋" : "أعد الشرح 🔄";
    const newNotif: Notification = {
      id: Date.now(),
      action: text,
      time: new Date().toLocaleTimeString("ar-EG", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setLastSentFeedback(`تم إرسال "${text}" للدكتور`);
    window.setTimeout(() => setLastSentFeedback(null), 2500);
  }, []);

  const renderFeature = () => {
    switch (activeFeature) {
      case "captions":
        return <SpeechInput onAnalyze={handleAnalyze} />;
      case "mindmap":
        return <MindMap data={analyzedData} />;
      case "glossary":
        return (
          <GlossaryPanel
            terms={analyzedData?.terms || []}
            onAction={handleAction}
          />
        );
      default:
        return <ComingSoon featureId={activeFeature} />;
    }
  };

  return (
    <AppShell
      activeFeature={activeFeature}
      onFeatureChange={setActiveFeature}
      view={view}
      onViewChange={setView}
      isLive={true}
    >
      {view === "student" ? (
        <div dir="rtl">{renderFeature()}</div>
      ) : (
        <div
          className="glass rounded-2xl border border-border p-6"
          dir="rtl"
        >
          <h2 className="mb-6 text-xl font-bold">لوحة إشعارات الدكتور</h2>
          {notifications.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">
              لا توجد إشعارات من الطلاب حالياً.
            </p>
          ) : (
            <div className="space-y-4">
              {notifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/10 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-lg">
                      🔔
                    </span>
                    <span className="font-semibold">{notif.action}</span>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {notif.time}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Feedback toast */}
      <AnimatePresence>
        {lastSentFeedback && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-border bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-2xl"
          >
            ✓ {lastSentFeedback}
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

/* ------------------------------------------------------------------ */

function ComingSoon({ featureId }: { featureId: FeatureId }) {
  const feature = getFeature(featureId);

  return (
    <div className="glass flex min-h-[60vh] flex-col items-center justify-center gap-6 rounded-2xl border border-border p-12 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Construction className="h-10 w-10 text-primary" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{feature.label}</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          {feature.description}
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        <span className="text-xs font-semibold text-primary">
          قريباً — جارٍ التطوير
        </span>
      </div>
    </div>
  );
}