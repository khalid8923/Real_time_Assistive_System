/**
 * app/api/transcribe/route.ts
 *
 * Speech-to-text endpoint backed by Groq (Whisper Large V3 Turbo).
 * Receives a short audio chunk (webm/opus) and returns the transcribed text.
 *
 * Setup:
 *   Set GROQ_API_KEY in .env.local
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/audio/transcriptions";
const GROQ_MODEL = "whisper-large-v3-turbo";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

const TRANSCRIPTION_PROMPT =
  "The speaker is a university professor explaining an academic topic in Arabic (Egyptian or Modern Standard Arabic). " +
  "Preserve technical terms in their original language if spoken in English (e.g., 'Linear Algebra').";

interface ErrorResponse {
  error: string;
}

interface SuccessResponse {
  text: string;
}

interface GroqResponse {
  text?: string;
  error?: { message?: string };
}

function jsonError(
  message: string,
  status: number
): NextResponse<ErrorResponse> {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("[transcribe] GROQ_API_KEY is not set.");
    return jsonError("Server misconfiguration. Please contact support.", 500);
  }

  const trimmedKey = apiKey.trim();
  console.log(
    `[transcribe] 🔑 Key check → length=${trimmedKey.length} ` +
    `startsWith=${trimmedKey.slice(0, 8)}... ` +
    `hasArabic=${/[\u0600-\u06FF]/.test(trimmedKey)} ` +
    `hasSpace=${/\s/.test(trimmedKey)}`
  );

  if (/[\u0600-\u06FF]/.test(trimmedKey) || /\s/.test(trimmedKey)) {
    console.error(
      "[transcribe] ✗ Key contains invalid characters (Arabic or whitespace)."
    );
    return jsonError("Server misconfiguration. Please contact support.", 500);
  }

  // 2. اقرأ الـ multipart form data.
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Request must be multipart/form-data.", 400);
  }

  const audio = formData.get("audio");
  if (!(audio instanceof Blob)) {
    return jsonError('Missing "audio" file in form data.', 400);
  }

  if (audio.size === 0) {
    return jsonError("Audio file is empty.", 400);
  }

  if (audio.size > MAX_FILE_SIZE) {
    return jsonError("Audio file is too large.", 413);
  }

  // 3. جهّز الـ FormData لـ Groq (بدون base64 — Groq يقبل الملف مباشرة).
  const groqForm = new FormData();
  // اسم الملف مهم — بعض APIs ترفض بدون extension.
  groqForm.append("file", audio, "chunk.webm");
  groqForm.append("model", GROQ_MODEL);
  groqForm.append("language", "ar");
  groqForm.append("response_format", "json");
  groqForm.append("temperature", "0");
  groqForm.append("prompt", TRANSCRIPTION_PROMPT);

  const startedAt = Date.now();
  console.log(
    `[transcribe] ← Sending ${(audio.size / 1024).toFixed(1)} KB to ${GROQ_MODEL}`
  );

  // 4. أرسل لـ Groq.
  try {
    const res = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: groqForm,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(
        `[transcribe] ✗ Groq API error: ${res.status}\n${errorText}`
      );

      if (res.status === 401 || res.status === 403) {
        return jsonError(
          "Server misconfiguration. Please contact support.",
          500
        );
      }
      if (res.status === 429) {
        return jsonError(
          "خدمة التحويل مشغولة حالياً. استنى شوية وحاول تاني.",
          429
        );
      }
      return jsonError("فشل تحويل الصوت إلى نص. حاول مرة أخرى.", 502);
    }

    const data = (await res.json()) as GroqResponse;

    const text = (data.text ?? "").trim();

    const elapsed = Date.now() - startedAt;
    console.log(
      `[transcribe] ✓ ${elapsed}ms | text=${text.length} chars`
    );

    return NextResponse.json({ text }, { status: 200 });
  } catch (error) {
    console.error("[transcribe] Request failed:", error);
    return jsonError("تعذّر الاتصال بخدمة التحويل.", 502);
  }
}