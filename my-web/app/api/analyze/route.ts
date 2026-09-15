/**
 * app/api/analyze/route.ts
 *
 * Real-time academic text analysis endpoint backed by Google Gemini.
 * Receives a chunk of live-transcribed academic text and returns a strict
 * JSON breakdown: main topic, related sub-topics, and key terms.
 *
 * Setup:
 *   Set GEMINI_API_KEY in .env.local
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const GEMINI_MODEL = "gemini-3.6-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const MAX_CHUNK_LENGTH = 6000;

const SYSTEM_PROMPT = `You are an academic analysis engine embedded in a real-time captioning tool for deaf and hard-of-hearing students. You receive short chunks of live-transcribed lecture or classroom speech. These chunks may be incomplete sentences, contain transcription errors, or lack punctuation.

For each chunk, identify:
1. "topic": the main academic subject being discussed, as a short phrase (a few words).
2. "children": related sub-topics, concepts, or ideas mentioned or implied in the chunk.
3. "terms": key academic vocabulary or discipline-specific terms present in the chunk, each with a brief, clear, student-friendly definition.

Rules:
- Base your analysis only on the given chunk. Do not invent content that is not present or implied in it.
- If the chunk is too short, vague, filler, or off-topic (small talk, class-management remarks, transitions like "okay, let's move on") to identify a meaningful academic topic, return "topic" as an empty string and empty arrays for "children" and "terms".
- Keep every definition to a single, short sentence written for a student audience.
- Do not repeat the same term twice.
- Respond ONLY with JSON matching the provided schema. No prose, no markdown.`;

// Gemini structured output schema — enforces exact shape on the model side.
const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    topic: {
      type: "string",
      description:
        "Concise phrase naming the main topic. Empty string if no clear academic topic.",
    },
    children: {
      type: "array",
      items: { type: "string" },
      description: "Related sub-topics or concepts branching from the topic.",
    },
    terms: {
      type: "array",
      items: {
        type: "object",
        properties: {
          term: { type: "string" },
          definition: { type: "string" },
        },
        required: ["term", "definition"],
      },
      description:
        "Key academic terms with short student-friendly definitions.",
    },
  },
  required: ["topic", "children", "terms"],
} as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TermDefinition {
  term: string;
  definition: string;
}

interface AnalysisResult {
  topic: string;
  children: string[];
  terms: TermDefinition[];
}

interface ErrorResponse {
  error: string;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function isValidAnalysisResult(data: unknown): data is AnalysisResult {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;

  if (typeof obj.topic !== "string") return false;

  if (
    !Array.isArray(obj.children) ||
    !obj.children.every((c) => typeof c === "string")
  ) {
    return false;
  }

  if (!Array.isArray(obj.terms)) return false;
  for (const entry of obj.terms) {
    if (typeof entry !== "object" || entry === null) return false;
    const t = entry as Record<string, unknown>;
    if (typeof t.term !== "string" || typeof t.definition !== "string") {
      return false;
    }
  }

  return true;
}

function jsonError(
  message: string,
  status: number
): NextResponse<ErrorResponse> {
  return NextResponse.json({ error: message }, { status });
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(
  request: NextRequest
): Promise<NextResponse<AnalysisResult | ErrorResponse>> {
  // 1. Server config check.
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[analyze] GEMINI_API_KEY is not set.");
    return jsonError("Server misconfiguration. Please contact support.", 500);
  }

  // 2. Parse body.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be valid JSON.", 400);
  }

  if (typeof body !== "object" || body === null || !("chunk" in body)) {
    return jsonError(
      'Request body must include a "chunk" field of type string.',
      400
    );
  }

  const rawChunk = (body as Record<string, unknown>).chunk;
  if (typeof rawChunk !== "string") {
    return jsonError('The "chunk" field must be a string.', 400);
  }

  const chunk = rawChunk.trim();
  if (chunk.length === 0) {
    return jsonError('The "chunk" field cannot be empty.', 400);
  }
  if (chunk.length > MAX_CHUNK_LENGTH) {
    return jsonError(
      `The "chunk" field exceeds the maximum allowed length of ${MAX_CHUNK_LENGTH} characters.`,
      413
    );
  }

  // 3. Call Gemini with structured output.
  const geminiBody = {
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    contents: [
      {
        role: "user",
        parts: [
          { text: `Analyze this transcribed text chunk:\n"""${chunk}"""` },
        ],
      },
    ],
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 1024,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  };

  try {
    const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("[analyze] Gemini API error:", res.status, errorText);

      if (res.status === 400 || res.status === 403) {
        return jsonError(
          "Server misconfiguration. Please contact support.",
          500
        );
      }
      if (res.status === 429) {
        return jsonError("خدمة التحليل مشغولة حالياً. حاول بعد لحظات.", 429);
      }
      return jsonError("فشل تحليل النص. حاول مرة أخرى.", 502);
    }

    const data: {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
        finishReason?: string;
      }>;
      promptFeedback?: { blockReason?: string };
    } = await res.json();

    // Blocked content → return empty analysis (treat as no-op).
    if (data.promptFeedback?.blockReason) {
      console.warn(
        "[analyze] Gemini blocked content:",
        data.promptFeedback.blockReason
      );
      return NextResponse.json(
        { topic: "", children: [], terms: [] },
        { status: 200 }
      );
    }

    const candidate = data.candidates?.[0];
    const rawText =
      candidate?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";

    if (rawText.trim().length === 0) {
      console.error(
        "[analyze] Empty response from Gemini. finishReason:",
        candidate?.finishReason
      );
      return jsonError("التحليل ما رجّعش نتيجة. حاول مرة أخرى.", 502);
    }

    // Parse JSON safely.
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      console.error("[analyze] Failed to parse JSON from Gemini:", rawText);
      return jsonError("التحليل ما رجّعش صيغة صحيحة. حاول مرة أخرى.", 502);
    }

    // Validate.
    if (!isValidAnalysisResult(parsed)) {
      console.error(
        "[analyze] Result failed schema validation:",
        JSON.stringify(parsed)
      );
      return jsonError("نتيجة التحليل مش مطابقة للصيغة المتوقعة.", 502);
    }

    // Success.
    return NextResponse.json(parsed, { status: 200 });
  } catch (error) {
    console.error("[analyze] Request failed:", error);
    return jsonError("تعذّر الاتصال بخدمة التحليل.", 502);
  }
}