import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import MobileFrame from "@/components/layout/MobileFrame";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VocalFlow - Find Your Voice",
  description: "Personalized vocal coaching to elevate your singing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MobileFrame>{children}</MobileFrame>
      </body>
    </html>
  );
}
