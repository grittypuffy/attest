"use client";

import {
  Buildings,
  CheckCircle,
  FilePlus,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function GovernmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/government", icon: Buildings },
    {
      name: "Create Project",
      href: "/government/projects/create",
      icon: FilePlus,
    },
    {
      name: "Create Agency",
      href: "/government/agencies/create",
      icon: UsersThree,
    },
    {
      name: "Approve Proposals",
      href: "/government/proposals",
      icon: CheckCircle,
    },
    // Phases approval might be better nested under projects or proposals, but keeping it top-level for now as requested
    { name: "Approve Phases", href: "/government/phases", icon: CheckCircle },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 justify-center w-full">
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900">Government Portal</h2>
          <p className="text-xs text-gray-500 mt-1">Official Administration</p>
        </div>
        <nav className="px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
