"use client";

import { useEffect, useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { Plus, RefreshCw, Search, Phone, MapPin, Building, ShieldCheck } from "lucide-react";

import { DataTable, type Column } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { StatusText } from "@/components/common/status-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth-context";
import { getAccountsAction } from "@/features/accounts/action";
import type { AccountItem, AccountPageResponse } from "@/features/accounts/types";

export default function AccountsPage() {
  const { can } = useAuth();
  const { success, error: toastError } = useToast();

  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [pageData, setPageData] = useState<AccountPageResponse>({
    content: [],
    page: 1,
    size: pageSize,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
    hasNext: false,
    hasPrevious: false,
  });

  const [isPending, startTransition] = useTransition();

  // Permission flags (for future Create/Update/Delete accounts)
  const canCreate = can("users.create");

  const loadAccounts = (
    targetPage = page,
    searchTerm = activeSearch,
    showSuccessToast = false
  ) => {
    startTransition(async () => {
      const res = await getAccountsAction({
        page: targetPage,
        size: pageSize,
        search: searchTerm,
      });

      if (res.success && res.data) {
        setPageData(res.data);
        if (showSuccessToast) {
          success("Accounts refreshed successfully");
        }
      } else {
        toastError(res.error || "Failed to load accounts");
      }
    });
  };

  useEffect(() => {
    loadAccounts(page, activeSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, activeSearch]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(searchInput.trim());
  };

  const handleSearchClear = () => {
    setSearchInput("");
    setPage(1);
    setActiveSearch("");
  };

  // Client-side fallback filter in case the backend returns full page or partial match
  const displayAccounts = useMemo(() => {
    if (!activeSearch.trim()) return pageData.content;
    const query = activeSearch.toLowerCase();
    return pageData.content.filter(
      (a) =>
        a.name?.toLowerCase().includes(query) ||
        a.id?.toLowerCase().includes(query) ||
        a.bhBp?.toLowerCase().includes(query) ||
        a.mobile?.includes(query) ||
        a.city?.toLowerCase().includes(query) ||
        a.state?.toLowerCase().includes(query)
    );
  }, [pageData.content, activeSearch]);

  const columns: Column<AccountItem>[] = useMemo(() => {
    const cols: Column<AccountItem>[] = [
      {
        header: "Account ID",
        cell: (r) => (
          <span className="font-mono text-xs font-semibold text-slate-800">{r.id || r.bhBp}</span>
        ),
        className: "w-36",
      },
      {
        header: "Name",
        cell: (r) => (
          <div>
            <p className="font-medium text-slate-900">{r.name}</p>
            {r.bhBp && r.bhBp !== r.id && (
              <span className="text-[11px] font-mono text-slate-400">BP: {r.bhBp}</span>
            )}
          </div>
        ),
      },
      {
        header: "Mobile",
        cell: (r) => (
          <div className="flex items-center gap-1.5 text-xs text-slate-700">
            <Phone className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-mono">{r.mobile || "—"}</span>
          </div>
        ),
        className: "w-36",
      },
      {
        header: "City",
        cell: (r) => (
          <div className="flex items-center gap-1.5 text-xs text-slate-700">
            <Building className="h-3.5 w-3.5 text-slate-400" />
            <span>{r.city || "—"}</span>
          </div>
        ),
        className: "w-36",
      },
      {
        header: "State",
        cell: (r) => (
          <div className="flex items-center gap-1.5 text-xs text-slate-700">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            <span>{r.state || "—"}</span>
          </div>
        ),
        className: "w-40",
      },
      {
        header: "District / Region",
        cell: (r) => (
          <span className="text-xs text-slate-600">
            {r.district?.trim() ? r.district : "—"}
          </span>
        ),
        className: "w-36",
      },
      {
        header: "Status",
        cell: (r) => (
          <StatusText active={r.status?.toLowerCase() === "active"} />
        ),
        className: "w-24 text-center",
      },
    ];

    return cols;
  }, []);

  return (
    <>
      <PageHeader
        title="Manage Accounts"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Accounts" }]}
      />

      <DataTable
        title="Accounts List"
        logoSrc="/logo.png"
        columns={columns}
        data={displayAccounts}
        getRowId={(r) => r.id}
        loading={isPending}
        emptyMessage={activeSearch ? `No accounts matching "${activeSearch}"` : "No accounts found"}
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input beside Refresh */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <Input
                placeholder="Search accounts..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="h-8 w-44 pl-8 pr-14 text-xs sm:w-56"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleSearchClear}
                  className="absolute right-8 text-[11px] text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
              <Button type="submit" variant="ghost" size="sm" className="hidden">
                Search
              </Button>
            </form>

            {/* Refresh button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadAccounts(page, activeSearch, true)}
              disabled={isPending}
              className="gap-1.5 text-slate-600"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            {/* Add Account button (shown if user has users.create permission) */}
            {canCreate && (
              <Button asChild size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/accounts/new">
                  <Plus className="h-4 w-4" />
                  Add Account
                </Link>
              </Button>
            )}
          </div>
        }
        pagination={{
          page,
          pageSize,
          totalElements: pageData.totalElements,
          totalPages: pageData.totalPages,
          onPageChange: handlePageChange,
        }}
      />
    </>
  );
}
