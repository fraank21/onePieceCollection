"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, BookOpen, TrendingUp } from "lucide-react";

const links = [
  { href: "/", label: "Colección", icon: LayoutGrid },
  { href: "/decks", label: "Decks", icon: BookOpen },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white">
          <TrendingUp className="text-red-500" size={24} />
          <span>TCG Collection</span>
        </Link>

        <nav className="flex gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-red-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
