export type Theme = "classic" | "focus" | "immersive";

export interface ThemeMeta {
  id: Theme;
  label: string;
  tagline: string;
  description: string;
  emoji: string;
  previewGradient: string;
  accentColor: string;
}

export const DEFAULT_THEME: Theme = "classic";
export const THEME_STORAGE_KEY = "cb-theme";

export const THEMES: ThemeMeta[] = [
  {
    id: "classic",
    label: "الكلاسيكي",
    tagline: "تجربة نظيفة ومألوفة",
    description:
      "تصميم فاتح وهادئ، مناسب للاستخدام اليومي والقراءة الطويلة.",
    emoji: "🎯",
    previewGradient: "from-slate-100 via-slate-50 to-white",
    accentColor: "#6366f1",
  },
  {
    id: "focus",
    label: "التركيز",
    tagline: "مينيمال وتباين عالي",
    description:
      "بدون زخرفة ولا ألوان صارخة — مصمم للطلاب اللي عايزين يركزوا 100%.",
    emoji: "📚",
    previewGradient: "from-zinc-100 via-white to-zinc-50",
    accentColor: "#0a0a0a",
  },
  {
    id: "immersive",
    label: "الغامر",
    tagline: "داكن وتجربة سينمائية",
    description:
      "زجاج شفاف، تدرجات بنفسجية، وتأثيرات ضوئية — تجربة عصرية بالكامل.",
    emoji: "🌌",
    previewGradient: "from-[#1a1a2e] via-[#2b2344] to-[#0f0f1a]",
    accentColor: "#a855f7",
  },
];

export function isTheme(value: unknown): value is Theme {
  return (
    typeof value === "string" &&
    THEMES.some((t) => t.id === value)
  );
}

export function getThemeMeta(id: Theme): ThemeMeta {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}