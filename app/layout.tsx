import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Attack Métrics Hub",
  description: "Plataforma de análisis táctico de fútbol",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-noise`}
      >
        {/* Fondo con grid sutil */}
        <div className="fixed inset-0 bg-grid pointer-events-none opacity-30" />
        
        {/* Contenido principal */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
