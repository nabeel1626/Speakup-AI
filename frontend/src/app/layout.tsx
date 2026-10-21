import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono-jb",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SpeakUp AI",
  description: "AI-powered voice mock interviewer with role-specific scoring",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${inter.variable} ${mono.variable}`}
    >
      <body
  className="bg-surface text-on-surface font-body antialiased min-h-screen"
  style={{
    backgroundImage: `
      radial-gradient(ellipse at 20% 10%, rgba(192, 193, 255, 0.04) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 90%, rgba(123, 208, 255, 0.03) 0%, transparent 50%)
    `,
    backgroundAttachment: "fixed",
  }}
>
  {children}
</body>
    </html>
  );
}