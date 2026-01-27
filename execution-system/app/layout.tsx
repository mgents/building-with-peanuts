import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Personal Execution System",
  description: "Transform insights into consistent daily behaviors and observable progress",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-neutral-50">
          <Navigation />
          <main className="container mx-auto px-4 py-8 max-w-4xl">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
