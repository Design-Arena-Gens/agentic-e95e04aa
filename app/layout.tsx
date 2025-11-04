import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Travel Memory Agents",
  description:
    "Coordinate premium trips with specialized agents that remember flights and hotel requirements."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
