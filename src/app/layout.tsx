import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Life Curve Engine",
  description: "A minimal life resource allocation simulator."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
