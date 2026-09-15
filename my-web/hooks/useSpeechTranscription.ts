"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseSpeechTranscriptionReturn {
  isListening: boolean;
  isModelLoading: boolean;
  startListening: () => void;
  stopListening: () => void;
  currentTranscript: string;
  finalChunks: string[];
  error: string | null;
  isSupported: boolean;
}

// كل chunk بياخد 5 ثواني تسجيل، وبعدين يتبعت لـ /api/transcribe
const CHUNK_DURATION_MS = 15000;
// أقل حجم للـ blob عشان نتجاهل الـ chunks الفاضية/الصامتة
const MIN_BLOB_SIZE = 2000;

export function useSpeechTranscription(): UseSpeechTranscriptionReturn {
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [finalChunks, setFinalChunks] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const rotationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isStoppingRef = useRef(false);
  // قفل بسيط عشان نمنع تراكب الطلبات لو الـ API بطيء
  const isTranscribingRef = useRef(false);

  /* ---------- إرسال الـ blob لـ /api/transcribe (Gemini) ---------- */
  const transcribeBlob = useCallback(async (blob: Blob) => {
    if (blob.size < MIN_BLOB_SIZE) return;
    // لو في طلب لسه شغال، تجاهل الـ chunk ده (الـ API أبطأ من 5 ثواني)
    if (isTranscribingRef.current) {
      console.warn("[transcribe] Skipping chunk — previous request still in-flight");
      return;
    }

    isTranscribingRef.current = true;
    try {
      const formData = new FormData();
      formData.append("audio", blob, "chunk.webm");

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data: { text?: string; error?: string } = await response.json();

      if (!response.ok) {
        setError(data.error || "فشل تحويل الصوت إلى نص.");
        return;
      }

      const text = (data.text ?? "").trim();
      if (text.length > 0) {
        setError(null); // امسح أي إيرور سابق بعد نجاح
        setCurrentTranscript(text);
        setFinalChunks((prev) => [...prev, text]);
      }
    } catch (err) {
      console.error("[transcribe] Request failed:", err);
      setError("تعذّر الاتصال بخدمة التحويل.");
    } finally {
      isTranscribingRef.current = false;
    }
  }, []);

  /* ---------- حلقة التسجيل: MediaRecorder → chunk → transcribe ---------- */
  const startRecording = useCallback(() => {
    const stream = streamRef.current;
    if (!stream || isStoppingRef.current) return;

    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";

    const recorder = new MediaRecorder(stream, { mimeType });
    const localChunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) localChunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(localChunks, { type: mimeType });
      void transcribeBlob(blob);

      // ابدأ chunk جديد لو لسه مسجلين
      if (!isStoppingRef.current && streamRef.current) {
        startRecording();
      }
    };

    recorder.start();
    recorderRef.current = recorder;

    if (rotationTimerRef.current) clearTimeout(rotationTimerRef.current);
    rotationTimerRef.current = setTimeout(() => {
      if (recorder.state === "recording") recorder.stop();
    }, CHUNK_DURATION_MS);
  }, [transcribeBlob]);

  /* ---------- Public API ---------- */
  const startListening = useCallback(async () => {
    if (isListening) return;

    setError(null);
    setCurrentTranscript("");
    isStoppingRef.current = false;

    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      setError("متصفحك لا يدعم الميكروفون.");
      setIsSupported(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      setIsListening(true);
      startRecording();
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError("تم رفض الوصول للميكروفون. اسمح به من إعدادات المتصفح.");
      } else if (err instanceof DOMException && err.name === "NotFoundError") {
        setError("لم يتم العثور على ميكروفون.");
      } else {
        setError("تعذّر تشغيل الميكروفون.");
      }
      setIsListening(false);
    }
  }, [isListening, startRecording]);

  const stopListening = useCallback(() => {
    isStoppingRef.current = true;
    if (rotationTimerRef.current) clearTimeout(rotationTimerRef.current);

    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
    }
    recorderRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsListening(false);
  }, []);

  /* ---------- Cleanup على unmount ---------- */
  useEffect(() => {
    return () => {
      isStoppingRef.current = true;
      if (rotationTimerRef.current) clearTimeout(rotationTimerRef.current);
      if (recorderRef.current && recorderRef.current.state === "recording") {
        recorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return {
    isListening,
    // لا يوجد موديل بيتحمل دلوقتي — الـ interface محافظ عليه للـ compat
    isModelLoading: false,
    startListening,
    stopListening,
    currentTranscript,
    finalChunks,
    error,
    isSupported,
  };
}

export default useSpeechTranscription;