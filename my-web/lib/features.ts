import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Bell,
  BookOpen,
  Brain,
  FileText,
  Languages,
  Layers,
  MessageSquare,
  Mic,
  Users,
} from "lucide-react";

export type FeatureId =
  | "captions"
  | "mindmap"
  | "glossary"
  | "qa"
  | "translation"
  | "summary"
  | "flashcards"
  | "keywords"
  | "sounds"
  | "teacher";

export type FeatureCategory = "core" | "ai" | "accessibility" | "teacher";

export interface Feature {
  id: FeatureId;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
  category: FeatureCategory;
  badge?: "جديد" | "قريباً";
}

export const STUDENT_FEATURES: Feature[] = [
  {
    id: "captions",
    label: "الكلام المباشر",
    shortLabel: "الكلام",
    description: "تحويل كلام الدكتور إلى نص مكتوب في الوقت الفعلي",
    icon: Mic,
    category: "core",
  },
  {
    id: "mindmap",
    label: "الخريطة الذهنية",
    shortLabel: "الخريطة",
    description: "رسم تلقائي لشجرة الموضوعات والفروع المرتبطة",
    icon: Brain,
    category: "core",
  },
  {
    id: "glossary",
    label: "المعجم الأكاديمي",
    shortLabel: "المعجم",
    description: "شرح مبسط لكل مصطلح أكاديمي ذُكر في المحاضرة",
    icon: BookOpen,
    category: "core",
  },
  {
    id: "keywords",
    label: "الكلمات المهمة",
    shortLabel: "الكلمات",
    description: "تنبيه فوري عند ذكر كلمات مفتاحية مثل (امتحان، واجب)",
    icon: AlertTriangle,
    category: "accessibility",
    badge: "جديد",
  },
  {
    id: "sounds",
    label: "التنبيهات الصوتية",
    shortLabel: "الأصوات",
    description: "كشف الأصوات المهمة (باب، تليفون، جرس) وتنبيهك بصرياً",
    icon: Bell,
    category: "accessibility",
    badge: "جديد",
  },
  {
    id: "qa",
    label: "أسئلة AI",
    shortLabel: "أسئلة",
    description: "اسأل عن أي جزء من الشرح واحصل على إجابة فورية",
    icon: MessageSquare,
    category: "ai",
    badge: "جديد",
  },
  {
    id: "translation",
    label: "الترجمة الفورية",
    shortLabel: "ترجمة",
    description: "ترجمة المصطلحات الإنجليزية إلى العربية فوراً",
    icon: Languages,
    category: "ai",
    badge: "جديد",
  },
  {
    id: "summary",
    label: "ملخص المحاضرة",
    shortLabel: "الملخص",
    description: "ملخص ذكي لأهم النقاط في نهاية كل محاضرة",
    icon: FileText,
    category: "ai",
    badge: "جديد",
  },
  {
    id: "flashcards",
    label: "كروت المراجعة",
    shortLabel: "كروت",
    description: "توليد كروت مراجعة وأسئلة من محتوى المحاضرة",
    icon: Layers,
    category: "ai",
    badge: "جديد",
  },
];

export const TEACHER_FEATURES: Feature[] = [
  {
    id: "teacher",
    label: "لوحة الدكتور",
    shortLabel: "الدكتور",
    description: "استقبال أسئلة واستفسارات الطلاب أثناء المحاضرة",
    icon: Users,
    category: "teacher",
  },
];

export const ALL_FEATURES: Feature[] = [
  ...STUDENT_FEATURES,
  ...TEACHER_FEATURES,
];

export function getFeature(id: FeatureId): Feature {
  return ALL_FEATURES.find((f) => f.id === id) ?? STUDENT_FEATURES[0];
}

export const CATEGORY_LABELS: Record<FeatureCategory, string> = {
  core: "الأساسيات",
  accessibility: "إمكانية الوصول",
  ai: "الميزات الذكية",
  teacher: "لوحة الدكتور",
};