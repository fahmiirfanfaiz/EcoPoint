import type { Metadata } from "next";
import localFont from "next/font/local";
import { Quicksand, Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/lib/auth/AuthContext";

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
          <div className="flex min-h-screen w-full flex-col">
            <Navbar />
            <main className="w-full flex-1">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
