"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import ConnectWallet from "./ConnectWallet";
import ConnectWallet from "./ConnectWallet";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bootstrapAuth();
  }, [pathname]);

  const bootstrapAuth = async () => {
    try {
      const session = await api.auth.session.valid.get();

      if (!session.data?.data?.valid) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      setIsAuthenticated(true);

      const userRes = await api.auth.user.get();
      if (userRes.data?.success) {
        setUser(userRes.data.data);
      }
    } catch {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    try {
      await api.auth.sign_out.post();
      setIsAuthenticated(false);
      setUser(null);
      setIsMenuOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Projects", href: "/projects" },
    { name: "Agencies", href: "/agencies" },
  ];

  const getUserMenuItems = () => {
    if (!user) return [];

    const baseRoute = user.role === "Agency" ? "/agency" : "/government";

    return [
      {
        name: "Dashboard",
        href: `${baseRoute}`,
      },
      {
        name: "My Proposals",
        href: `${baseRoute}/proposals`,
      },
      //{
      //  name: "Profile",
      //  href: `${baseRoute}/profile`,
      //},
    ];
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
          <div className="flex items-center gap-4">
            <ConnectWallet />
            {isAuthenticated && user ? (
              <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">
                  {getInitials(user.name)}
                </div>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    isMenuOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-100">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                    <p className="text-xs text-blue-600 mt-1 capitalize">
                      {user.role}
                    </p>
                  </div>

                  {getUserMenuItems().map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}

                  <div className="border-t border-gray-200 mt-1 pt-1">
                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                </div>
              )}
            </div>
          ) : (
              <Link
                href="/auth"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
