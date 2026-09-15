import type { Metadata } from "next";
import { Cairo, Amiri } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DEFAULT_THEME, THEME_STORAGE_KEY } from "@/lib/themes";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-sans",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CaptionBridge | ترجمة فورية للطلاب الصم",
  description:
    "تطبيق ويب مساعد في الوقت الفعلي للطلاب الصم — ترجمة الكلام، خريطة ذهنية، ومعجم مصطلحات أكاديمية.",
};

/**
 * Inline script that runs before React hydrates. It reads the persisted
 * theme from localStorage and applies `data-theme` to <html> immediately,
 * preventing a flash of the wrong theme on first paint.
 */
const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
    var valid = ['classic', 'focus', 'immersive'];
    var theme = valid.indexOf(stored) !== -1 ? stored : '${DEFAULT_THEME}';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', '${DEFAULT_THEME}');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      data-theme={DEFAULT_THEME}
      className={`${cairo.variable} ${amiri.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${cairo.className} min-h-screen bg-background text-foreground antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}