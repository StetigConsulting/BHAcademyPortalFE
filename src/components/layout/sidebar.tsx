"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRound } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { navSections } from "./nav-items";
import { useSidebar } from "./sidebar-context";

export function Sidebar({ user }: { user: ReactNode }) {
  const pathname = usePathname();
  const { mobileOpen, desktopCollapsed, closeMobile } = useSidebar();
  const { can } = useAuth();

  return (
    <>
      {mobileOpen && (
        <div
          onClick={closeMobile}
          aria-hidden
          className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-white shadow-xl transition-transform duration-300 ease-in-out lg:shadow-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          desktopCollapsed ? "lg:-translate-x-full" : "lg:translate-x-0"
        )}
      >
        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b px-4">
          <Image
            src="/logo.png"
            alt="AP Colour Academy"
            width={40}
            height={40}
            className="h-10 w-auto"
          />
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            AP Colour Academy
          </span>
        </div>

        {/* Logged-in user */}
        <div className="flex shrink-0 items-center gap-3 border-b px-4 py-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <UserRound className="h-5 w-5" />
          </span>
          <span className="truncate text-sm font-medium text-slate-700">{user}</span>
        </div>

        {/* Links (scrolls if the screen is short) */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {navSections.map((section, i) => {
            // Filter section items according to user permissions
            const visibleItems = section.items.filter((item) =>
              item.permission ? can(item.permission) : true
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={i} className={cn(i > 0 && "mt-3 border-t pt-3")}>
                {section.title && (
                  <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {section.title}
                  </p>
                )}
                <ul className="space-y-0.5">
                  {visibleItems.map(({ label, href, icon: Icon }) => {
                    const active = pathname === href || pathname.startsWith(`${href}/`);
                    return (
                      <li key={href}>
                        <Link
                          href={href}
                          onClick={closeMobile}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            active
                              ? "bg-blue-50 text-blue-700"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          )}
                        >
                          <Icon className="h-[18px] w-[18px] shrink-0" />
                          {label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}