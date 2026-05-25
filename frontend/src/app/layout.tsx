import type { Metadata } from "next";
import localFont from "next/font/local";
import { Quicksand, Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { LevelUpProvider } from "@/lib/LevelUpProvider";
import AppShell from "@/components/AppShell";

const nunito = localFont({
  src: "../../public/fonts/nunito.regular.ttf",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--font-nunito",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-quicksand",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-outfit",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "EcoPoint Campus",
  description:
    "Sistem Bank Sampah untuk Mahasiswa - Save the Earth, One Point at a Time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${nunito.variable} ${quicksand.variable} ${outfit.variable} ${plusJakartaSans.variable}`}
    >
      <body>
        <AuthProvider>
          <LevelUpProvider>
            <AppShell>{children}</AppShell>
          </LevelUpProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
