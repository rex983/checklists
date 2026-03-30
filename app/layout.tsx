import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/checklist/Toast";
import { Nav } from "@/components/checklist/Nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BBD Customer Checklist — Prototype",
  description: "Auto-generated customer checklists for Big Buildings Direct",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        <ToastProvider>
          {/* Header */}
          <header
            className="sticky top-0 z-50"
            style={{ background: "linear-gradient(135deg,#1a3a5c 0%,#2563eb 100%)" }}
          >
            <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
              <h1 className="text-white text-lg font-bold tracking-tight">
                Big Buildings Direct
              </h1>
              <div className="flex items-center gap-4">
                <Nav />
                <span className="text-white/60 text-sm">Prototype</span>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="max-w-[1200px] mx-auto px-6 py-8">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
