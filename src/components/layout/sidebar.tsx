"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, UserRound } from "lucide-react";
import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { navSections, type NavSection } from "./nav-items";
import { useSidebar } from "./sidebar-context";

function CollapsibleNavSection({
  section,
  pathname,
  closeMobile,
  can,
}: {
  section: NavSection;
  pathname: string;
  closeMobile: () => void;
  can: (perm: string | string[]) => boolean;
}) {
  const visibleItems = section.items.filter((item) =>
    item.permission ? can(item.permission) : true
  );

  const isAnyChildActive = visibleItems.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  const [isOpen, setIsOpen] = useState(true);

  if (visibleItems.length === 0) return null;

  const Icon = section.icon;

  return (
    <div className="mt-3 border-t pt-3">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200 transition-colors"
      >
        <span className="flex items-center gap-2.5">
          {Icon && <Icon className="h-4 w-4 text-slate-700" />}
          <span>{section.title}</span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-600 transition-transform duration-200",
            isOpen ? "rotate-0" : "-rotate-90"
          )}
        />
      </button>

      {isOpen && (
        <ul className="mt-1 space-y-0.5 pl-2">
          {visibleItems.map(({ label, href, icon: ItemIcon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={closeMobile}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <ItemIcon className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

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
            if (section.collapsible) {
              return (
                <CollapsibleNavSection
                  key={section.title || i}
                  section={section}
                  pathname={pathname}
                  closeMobile={closeMobile}
                  can={can}
                />
              );
            }

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