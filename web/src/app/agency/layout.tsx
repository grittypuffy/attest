"use client";

import { SquaresFour, Briefcase, FileText, User } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const MENU_ITEMS = [
  { text: "Dashboard", icon: <SquaresFour size={24} />, path: "/agency" },
  {
    text: "My Proposals",
    icon: <Briefcase size={24} />,
    path: "/agency/proposals",
  },
  //{ text: "My Proposals", icon: <FileText size={24} />, path: "/agency/proposals" },
  //{ text: "Profile", icon: <User size={24} />, path: "/agency/profile" },
];

export default function AgencyLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="fixed inset-0 z-50 flex bg-gray-50 overflow-hidden mt-18">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-20">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 bg-white">
          <span className="text-xl font-bold text-blue-600 tracking-tight">
            Agency Portal
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {MENU_ITEMS.map((item) => {
              const isActive = pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 group ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span
                      className={
                        isActive
                          ? "text-blue-600"
                          : "text-gray-400 group-hover:text-gray-600"
                      }
                    >
                      {item.icon}
                    </span>
                    <span
                      className={`font-medium ${isActive ? "font-semibold" : ""}`}
                    >
                      {item.text}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              BR
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                BuildRight
              </p>
              <p className="text-xs text-gray-500 truncate">Agency Account</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50/50">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10">
          <h1 className="text-lg font-semibold text-gray-900">
            {MENU_ITEMS.find((item) => item.path === pathname)?.text ||
              "Dashboard"}
          </h1>
        </header>

        {/* Page Content Scrollable Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
