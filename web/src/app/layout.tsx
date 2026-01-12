import type { Metadata } from "next";
import Navbar from "../components/Navbar";
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
      <body className="bg-gray-50 min-h-screen flex flex-col">
        <Navbar />
        <main className="app-container flex-grow">{children}</main>
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="app-container py-6 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Attest. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
