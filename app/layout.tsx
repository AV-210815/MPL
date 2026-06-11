import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ConditionalMain from "@/components/ConditionalMain";
import { Bebas_Neue, Rajdhani, Oswald } from "next/font/google";

const bebasNeue = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas" });
const rajdhani = Rajdhani({ weight: ["400", "600", "700"], subsets: ["latin"], variable: "--font-rajdhani" });
const oswald = Oswald({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--font-oswald" });

export const metadata: Metadata = {
  title: "MPL — Maple Premier League",
  description: "Apartment cricket league stats tracker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full antialiased ${bebasNeue.variable} ${rajdhani.variable} ${oswald.variable}`}>
      <body className="min-h-full flex flex-col bg-[#0d0d1a] text-gray-100">
        <Navbar />
        <ConditionalMain>{children}</ConditionalMain>
      </body>
    </html>
  );
}
