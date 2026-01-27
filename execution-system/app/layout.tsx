import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

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
      <body className="font-sans antialiased">
        <div className="min-h-screen bg-zinc-800">
          <Navigation />
          <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
