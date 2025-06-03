import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins, Manrope, Outfit } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "../providers/ReduxProvider";

// Load Google Fonts correctly using next/font/google
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  weight: ["400", "600", "700"],
  subsets: ["latin"],
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
          ${poppins.variable}
          ${manrope.variable}
          ${outfit.variable}
          antialiased
        `}
      >
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
