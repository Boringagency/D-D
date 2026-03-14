import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "D&D 5e Character Tracker",
  description: "Track your D&D 5e characters - HP, spell slots, inventory, and more",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0d0d1a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#0d0d1a] text-[#e8e0d0]">
        {children}
      </body>
    </html>
  );
}
