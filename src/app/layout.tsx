// app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "../providers/ReduxProvider";
import LayoutGatekeeper from "./LayoutGatekeeper"; // <-- Import the gatekeeper

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Tuma Control Hub",
  description: "Instant Money Transfer",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          ${outfit.variable}
          antialiased
        `}
      >
        <ReduxProvider>
          {/* 
            The Gatekeeper wraps the children. It will decide whether
            to apply the ProtectedLayout based on the current URL.
          */}
          <LayoutGatekeeper>{children}</LayoutGatekeeper>
        </ReduxProvider>
      </body>
    </html>
  );
}