import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SoundProvider } from "@/components/sound-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pasteur Zach Fomum — Agent Vocal",
  description:
    "Agent vocal intelligent inspiré par les enseignements du Pasteur Zacharias Tanee Fomum.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SoundProvider>{children}</SoundProvider>
      </body>
    </html>
  );
}
