"use client";

import React from "react";
import { motion } from "motion/react";
import { BookOpen, Hand, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface GlossaryTerm {
  term: string;
  definition: string;
}

interface GlossaryPanelProps {
  terms: GlossaryTerm[];
  onAction: (action: "ask" | "re-explain") => void;
}

export default function GlossaryPanel({ terms, onAction }: GlossaryPanelProps) {
  return (
    <div dir="rtl" className="w-full space-y-6">
      {/* Terms Grid */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">المصطلحات الأساسية</h2>
        </div>

        {terms.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
            لا توجد مصطلحات بعد
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {terms.map((item, index) => (
              <motion.div
                key={item.term}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                  ease: "easeOut",
                }}
              >
                <Card className="glass flex h-full flex-col border-border bg-transparent shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                  <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                    <div
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary"
                    >
                      {item.term.charAt(0).toUpperCase()}
                    </div>
                    <CardTitle className="text-base font-bold leading-tight">
                      {item.term}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.definition}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section className="glass rounded-2xl border border-border p-4 sm:p-6">
        <h3 className="mb-4 text-sm font-bold">إجراءات سريعة</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button
            type="button"
            onClick={() => onAction("ask")}
            className="h-16 gap-3 bg-linear-to-l from-amber-500 to-orange-500 text-base font-bold text-white shadow-md hover:from-amber-600 hover:to-orange-600"
          >
            <Hand className="h-5 w-5" />
            عايز أسأل ✋
          </Button>
          <Button
            type="button"
            onClick={() => onAction("re-explain")}
            className="h-16 gap-3 bg-linear-to-l from-teal-600 to-emerald-600 text-base font-bold text-white shadow-md hover:from-teal-700 hover:to-emerald-700"
          >
            <RefreshCw className="h-5 w-5" />
            أعد الشرح 🔄
          </Button>
        </div>
      </section>
    </div>
  );
}