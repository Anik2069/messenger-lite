import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppToastContainer } from "@/lib/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "messenger lite",
  description:
    "Messenger Lite is a minimalist, web-based chat application. Built for users who prefer a fast, responsive, and data-efficient messaging experience, this project focuses on delivering core chat functionalities without the distractions of a full-featured messenger.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <AppToastContainer />
      </body>
    </html>
  );
}
