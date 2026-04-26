import type { Metadata } from "next";
import { metadata as rootMetadata } from "@/components/root-metadata";
import "./globals.css";

export const metadata: Metadata = {
  ...rootMetadata,
  title: "MindBridge — Your AI Mental Health Companion",
  description: "AI-powered mental health companion that helps you track emotions, talk safely, and connect to real support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Raleway:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}

