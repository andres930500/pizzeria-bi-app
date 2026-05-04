"use client";

import Link from "next/link";
import { BarChart3, Home, Pizza, Settings } from "lucide-react";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/ventas", label: "Ventas", icon: Pizza },
  { href: "/dashboard", label: "Panel BI", icon: BarChart3 },
  { href: "/admin", label: "Admin", icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-white/70 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#C75B3A] text-xs font-semibold text-white">
            PB
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">Pizzeria BI</p>
            <p className="text-xs text-slate-500">Overview diario</p>
          </div>
        </div>

        <nav className="hidden items-center gap-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 md:flex">
          {links.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 transition ${
                  isActive ? "text-slate-900" : "text-slate-500"
                } hover:text-slate-900`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-400">Usuario</p>
            <p className="text-sm font-semibold text-slate-700">Equipo BI</p>
          </div>
          <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-900 text-xs font-semibold text-white">
            EB
          </div>
        </div>
      </div>
    </header>
  );
}
