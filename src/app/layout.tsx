import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/Providers";
import { PublicLayout } from "@/components/layout/PublicLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AuraAI - Generate Stunning AI Images & Videos",
  description: "Transform your ideas into breathtaking visuals with AuraAI. Powered by cutting-edge AI models for image and video generation.",
  keywords: ["AI image generation", "AI video generation", "text to image", "text to video", "AI art", "AI creator"],
  openGraph: {
    title: "AuraAI - Generate Stunning AI Images & Videos",
    description: "Transform your ideas into breathtaking visuals with AuraAI. Powered by cutting-edge AI.",
    type: "website",
    siteName: "AuraAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "AuraAI - AI Image & Video Generation",
    description: "Create stunning AI images and videos from text prompts.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        <Providers>
          <PublicLayout>{children}</PublicLayout>
        </Providers>
      </body>
    </html>
  );
}