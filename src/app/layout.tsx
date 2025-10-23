import type { Metadata } from "next";
import "./globals.css";
import { Chewy } from "next/font/google";

export const metadata: Metadata = {
  title: "Party Room Booker",
  description: "Book amazing parties with ease",
};

const chewy = Chewy({ subsets: ["latin"], weight: "400", display: "swap" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={chewy.className}>{children}</body>
    </html>
  );
}
