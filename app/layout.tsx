import type { Metadata } from "next";
import { Geist_Mono, Nunito } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { AppToaster } from "@/components/Toaster";
import "./globals.css";

const geistSans = Nunito({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pizzeria BI",
  description: "Panel de inteligencia para ventas de pizzeria",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <Navbar />
        <AppToaster />
        <main className="flex-1 pt-28">{children}</main>
      </body>
    </html>
  );
}
