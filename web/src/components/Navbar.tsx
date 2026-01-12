"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Projects", href: "/projects" },
    { name: "Agencies", href: "/agencies" },
  ];

  return (
    <nav className="bg-white shadow-sm mb-8">
      <div className="app-container py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-gray-900">
          Attest
        </Link>
        <div className="flex items-center space-x-8">
          <div className="flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  pathname === item.href ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <Link
            href="/auth"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
          >
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}
