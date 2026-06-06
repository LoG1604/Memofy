import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { FirebaseProvider } from "@/lib/firebase-context";
import { ToastProvider } from "@/components/Toast";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Memofy — AI Memory for Your Meetings",
  description: "Upload meeting recordings and get AI-powered transcripts, summaries and action items.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="referrer" content="no-referrer-when-downgrade" />
      </head>
      <body className={`${inter.variable} antialiased bg-zinc-950 text-white`}>
        <ToastProvider>
          <FirebaseProvider>
            <Navbar />
            <main>{children}</main>
          </FirebaseProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
