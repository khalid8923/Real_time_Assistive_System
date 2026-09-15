"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, Loader2, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSpeechTranscription } from "@/hooks/useSpeechTranscription";

export interface AnalysisData {
  topic: string;
  children: { id: number; name: string }[];
  terms: { id: number; term: string; definition: string }[];
}

interface SpeechInputProps {
  onAnalyze: (data: AnalysisData) => void;
}

interface ApiTerm {
  term: string;
  definition: string;
}

interface ApiAnalysisResponse {
  topic: string;
  children: string[];
  terms: ApiTerm[];
  error?: string;
}

export default function SpeechInput({ onAnalyze }: SpeechInputProps) {
const {
  isListening,
  isModelLoading,
  startListening,
  stopListening,
  currentTranscript,
  finalChunks,
  error: speechError,
} = useSpeechTranscription();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const lastProcessedChunkIndexRef = useRef<number>(0);

  const toggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      setAnalysisError(null);
      startListening();
    }
  };

  useEffect(() => {
    if (finalChunks.length === 0) return;
    if (lastProcessedChunkIndexRef.current >= finalChunks.length) return;

    const newChunks = finalChunks.slice(lastProcessedChunkIndexRef.current);
    lastProcessedChunkIndexRef.current = finalChunks.length;

    const processChunks = async () => {
      setIsAnalyzing(true);
      setAnalysisError(null);

      for (const chunk of newChunks) {
        try {
          const response = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chunk }),
          });

          const data: ApiAnalysisResponse = await response.json();

          if (!response.ok) {
            setAnalysisError(data.error || "فشل تحليل النص.");
            continue;
          }

          if (!data.topic) continue;

          const analysisData: AnalysisData = {
            topic: data.topic,
            children: data.children.map((name, index) => ({
              id: index + 1,
              name,
            })),
            terms: data.terms.map((term, index) => ({
              id: index + 1,
              term: term.term,
              definition: term.definition,
            })),
          };

          onAnalyze(analysisData);
        } catch {
          setAnalysisError("تعذّر الاتصال بخدمة التحليل. حاول مرة أخرى.");
        }
      }

      setIsAnalyzing(false);
    };

    processChunks();
  }, [finalChunks, onAnalyze]);

  const combinedError = speechError || analysisError;

  return (
    <Card
      dir="rtl"
      className="glass w-full border-border bg-transparent shadow-sm"
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <Sparkles className="h-5 w-5 text-primary" />
          إدخال الشرح الصوتي
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="relative">
          <textarea
            value={currentTranscript}
            readOnly
            placeholder="استمع لشرح الدكتور هنا..."
            rows={8}
            dir="rtl"
            className="w-full resize-none rounded-xl border border-border bg-muted/30 p-4 text-right text-sm leading-relaxed placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {isListening && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-[#E1432C]/10 px-2.5 py-1"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E1432C] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#E1432C]" />
              </span>
              <span className="text-[10px] font-bold text-[#E1432C]">
                يسجّل
              </span>
            </motion.div>
          )}
        </div>

        <AnimatePresence>
          {combinedError && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive"
            >
              {combinedError}
            </motion.p>
          )}
        </AnimatePresence>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 border-t border-border bg-muted/20 sm:flex-row-reverse sm:justify-between">
        <Button
          type="button"
          variant={isListening ? "destructive" : "outline"}
          onClick={toggleMic}
          disabled={isModelLoading}
          className="relative w-full gap-2 overflow-hidden sm:w-auto"
        >
          {isModelLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              جارٍ تحميل النموذج...
            </>
          ) : isListening ? (
            <>
              <MicOff className="h-4 w-4" />
              إيقاف الميكروفون
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              تشغيل الميكروفون
            </>
          )}
          {isListening && (
            <span className="absolute inset-0 -z-10 animate-pulse bg-destructive/20" />
          )}
        </Button>

        <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
          {isAnalyzing && (
            <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              جارٍ التحليل...
            </span>
          )}
          <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold">
            {finalChunks.length} مقطع
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}