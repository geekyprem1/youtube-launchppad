import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CreatorOS AI — All-in-One YouTube Growth Engine",
  description: "AI-powered platform to research, create, grow and monetize your YouTube channel",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
