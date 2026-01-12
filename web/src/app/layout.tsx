import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Attest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="app-container bg-gray-100 h-screen">{children}</body>
    </html>
  );
}
