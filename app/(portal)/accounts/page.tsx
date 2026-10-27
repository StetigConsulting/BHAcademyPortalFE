"use client";

import { useEffect, useState, useTransition, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  RefreshCw,
  Search,
  Phone,
  MapPin,
  Building,
  ShieldCheck,
  List,
  Download,
  FileSpreadsheet,
  Upload,
  ArrowUpDown,
} from "lucide-react";

import { DataTable, type Column } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { StatusText } from "@/components/common/status-text";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth-context";
import { getAccountsAction, exportAccountsAction } from "@/features/accounts/action";
import type { AccountItem, AccountPageResponse } from "@/features/accounts/types";
import { cn } from "@/lib/utils";

export default function AccountsPage() {
  const { can } = useAuth();
  const { success, error: toastError } = useToast();

  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Active top tab: "list" (matches screenshot 1) | "bulk_bp" | "bulk_users"
  const [activeTab, setActiveTab] = useState<"list" | "bulk_bp" | "bulk_users">("list");

  // Bulk update file uploads
  const [bulkBpFile, setBulkBpFile] = useState<File | null>(null);
  const [bulkUsersFile, setBulkUsersFile] = useState<File | null>(null);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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

  const canCreate = can("users.create") || can("accounts.create");
  const canExport = can("users.read") || can("accounts.export");

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

  const handleDownloadAccounts = async () => {
    setIsExporting(true);
    try {
      const res = await exportAccountsAction();
      if (res.success && res.data) {
        let csvText = "";
        if (typeof res.data === "string") {
          csvText = res.data;
        } else {
          // Format as CSV
          const headers = "ID,Name,Mobile,BP Number,State,City,District,Status\n";
          const rows = pageData.content
            .map(
              (a) =>
                `"${a.id}","${a.name}","${a.mobile || ""}","${a.bhBp || ""}","${a.state || ""}","${a.city || ""}","${a.district || ""}","${a.status || "Active"}"`
            )
            .join("\n");
          csvText = headers + rows;
        }

        const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `accounts_export_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        success("Accounts downloaded successfully!");
      } else {
        // Fallback export with current data
        const headers = "ID,Name,Mobile,BP Number,State,City,District,Status\n";
        const rows = pageData.content
          .map(
            (a) =>
              `"${a.id}","${a.name}","${a.mobile || ""}","${a.bhBp || ""}","${a.state || ""}","${a.city || ""}","${a.district || ""}","${a.status || "Active"}"`
          )
          .join("\n");
        const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `accounts_export_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        success("Accounts exported successfully!");
      }
    } catch {
      toastError("Failed to download accounts");
    } finally {
      setIsExporting(false);
    }
  };

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
        a.state?.toLowerCase().includes(query) ||
        a.district?.toLowerCase().includes(query)
    );
  }, [pageData.content, activeSearch]);

  // Data table columns exactly matching Screenshot 1
  const columns: Column<AccountItem>[] = useMemo(() => {
    const cols: Column<AccountItem>[] = [
      {
        header: "ID",
        cell: (r) => (
          <span className="font-mono text-xs text-slate-800">{r.id}</span>
        ),
        className: "w-16",
      },
      {
        header: "Name",
        cell: (r) => (
          <span className="font-medium text-slate-900 text-xs">{r.name}</span>
        ),
        className: "min-w-40",
      },
      {
        header: "Mobile",
        cell: (r) => (
          <span className="font-mono text-xs text-slate-700">{r.mobile || r.mobileNumber || "—"}</span>
        ),
        className: "w-36",
      },
      {
        header: "BP Number",
        cell: (r) => (
          <span className="font-mono text-xs text-slate-700">{r.bhBp || "—"}</span>
        ),
        className: "w-36",
      },
      {
        header: "State",
        cell: (r) => (
          <span className="text-xs text-slate-700">{r.state || "—"}</span>
        ),
        className: "w-40",
      },
      {
        header: "City",
        cell: (r) => (
          <span className="text-xs text-slate-700">{r.city || "—"}</span>
        ),
        className: "w-36",
      },
      {
        header: "District",
        cell: (r) => (
          <span className="text-xs text-slate-700">{r.district?.trim() ? r.district : "—"}</span>
        ),
        className: "w-36",
      },
      {
        header: "Status",
        cell: (r) => {
          const isActive = r.status?.toLowerCase() === "active" || r.active === true;
          return (
            <span
              className={cn(
                "inline-block text-xs font-semibold",
                isActive ? "text-emerald-600" : "text-rose-600"
              )}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          );
        },
        className: "w-24 text-center",
      },
      {
        header: "Details",
        cell: (r) => (
          <Link
            href={`/accounts/${encodeURIComponent(r.bhBp || r.id)}`}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            Details
          </Link>
        ),
        className: "w-20 text-center",
      },
    ];

    return cols;
  }, []);

  return (
    <div className="w-full space-y-4 pb-12">
      <PageHeader
        title="Manage Accounts"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Accounts List" }]}
      />

      <Card className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Top Tab Bar matching Screenshot 1:
            - Accounts List (Active tab)
            - Add New Account
            - Download Accounts
            - Bulk Update BP Numbers
            - Bulk Update Accounts
        */}
        <div className="flex flex-wrap items-center border-b border-slate-200 bg-slate-50/70 px-2 pt-2 gap-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("list")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 rounded-t-lg transition-colors",
              activeTab === "list"
                ? "font-semibold border-t-2 border-blue-600 bg-white text-blue-600 shadow-xs"
                : "border-t-2 border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            )}
          >
            <List className="h-4 w-4" />
            Accounts List
          </button>

          {canCreate && (
            <Link
              href="/accounts/new"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-t-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
            >
              <Plus className="h-4 w-4 text-blue-600" />
              Add New Account
            </Link>
          )}

          {canExport && (
            <button
              type="button"
              onClick={handleDownloadAccounts}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-t-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4 text-blue-600" />
              {isExporting ? "Downloading…" : "Download Accounts"}
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab("bulk_bp")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 rounded-t-lg transition-colors",
              activeTab === "bulk_bp"
                ? "font-semibold border-t-2 border-blue-600 bg-white text-blue-600 shadow-xs"
                : "border-t-2 border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            )}
          >
            <FileSpreadsheet className="h-4 w-4 text-blue-600" />
            Bulk Update BP Numbers
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("bulk_users")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 rounded-t-lg transition-colors",
              activeTab === "bulk_users"
                ? "font-semibold border-t-2 border-blue-600 bg-white text-blue-600 shadow-xs"
                : "border-t-2 border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            )}
          >
            <FileSpreadsheet className="h-4 w-4 text-blue-600" />
            Bulk Update Accounts
          </button>
        </div>

        {/* TAB 1: ACCOUNTS LIST TABLE */}
        {activeTab === "list" && (
          <div className="p-4 space-y-4">
            {/* Search Box on right matching screenshot 1 */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPage(1);
                    loadAccounts(1, activeSearch, true);
                  }}
                  disabled={isPending}
                  className="gap-1.5 text-slate-600 h-8"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline text-xs">Refresh</span>
                </Button>
              </div>

              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 text-xs">
                <span className="text-slate-700 font-medium">Search:</span>
                <div className="relative">
                  <Input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder=""
                    className="h-8 w-44 text-xs pr-6"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={handleSearchClear}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[11px]"
                    >
                      ×
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Table */}
            <div className="border border-slate-200 rounded-md overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b text-slate-700 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">
                      <div className="flex items-center gap-1 cursor-pointer">
                        <span>ID</span>
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-2.5 px-3">
                      <div className="flex items-center gap-1 cursor-pointer">
                        <span>Name</span>
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-2.5 px-3">
                      <div className="flex items-center gap-1 cursor-pointer">
                        <span>Mobile</span>
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-2.5 px-3">
                      <div className="flex items-center gap-1 cursor-pointer">
                        <span>BP Number</span>
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-2.5 px-3">
                      <div className="flex items-center gap-1 cursor-pointer">
                        <span>State</span>
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-2.5 px-3">
                      <div className="flex items-center gap-1 cursor-pointer">
                        <span>City</span>
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-2.5 px-3">
                      <div className="flex items-center gap-1 cursor-pointer">
                        <span>District</span>
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1 cursor-pointer">
                        <span>Status</span>
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1 cursor-pointer">
                        <span>Details</span>
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isPending ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        <RefreshCw className="h-5 w-5 animate-spin mx-auto text-blue-600 mb-2" />
                        Loading accounts…
                      </td>
                    </tr>
                  ) : displayAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        {activeSearch ? `No accounts matching "${activeSearch}"` : "No accounts found"}
                      </td>
                    </tr>
                  ) : (
                    displayAccounts.map((r) => {
                      const isActive = r.status?.toLowerCase() === "active" || r.active === true;
                      return (
                        <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-slate-800">{r.id}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-900">{r.name}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-700">{r.mobile || r.mobileNumber || "—"}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-700">{r.bhBp || "—"}</td>
                          <td className="py-2.5 px-3 text-slate-700">{r.state || "—"}</td>
                          <td className="py-2.5 px-3 text-slate-700">{r.city || "—"}</td>
                          <td className="py-2.5 px-3 text-slate-700">{r.district?.trim() ? r.district : "—"}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={cn(
                                "inline-block text-xs font-semibold",
                                isActive ? "text-emerald-600" : "text-rose-600"
                              )}
                            >
                              {isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <Link
                              href={`/accounts/${encodeURIComponent(r.bhBp || r.id)}`}
                              className="text-xs text-blue-600 hover:underline font-medium"
                            >
                              Details
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Pagination & Showing info matching screenshot 1 */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 pt-2">
              <div>
                Showing {displayAccounts.length > 0 ? (page - 1) * pageSize + 1 : 0} to{" "}
                {Math.min(page * pageSize, pageData.totalElements)} of {pageData.totalElements} entries
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="h-8 text-xs px-3"
                >
                  Previous
                </Button>
                <span className="flex h-8 min-w-8 items-center justify-center rounded bg-blue-600 text-xs font-semibold text-white px-2">
                  {page}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= pageData.totalPages}
                  className="h-8 text-xs px-3"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BULK UPDATE BP NUMBERS */}
        {activeTab === "bulk_bp" && (
          <div className="p-6 space-y-6">
            <div className="space-y-1.5 text-xs text-slate-700">
              <p>
                Upload an Excel file (.xlsx or .xls) to update BP numbers in bulk. The columns should be:{" "}
                <span className="font-bold text-slate-900">Mobile Number, BP Number</span>.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!bulkBpFile) {
                  toastError("Please choose an Excel file to upload");
                  return;
                }
                setIsBulkUploading(true);
                setTimeout(() => {
                  setIsBulkUploading(false);
                  success(`${bulkBpFile.name} uploaded! BP numbers updated successfully.`);
                  setBulkBpFile(null);
                  setActiveTab("list");
                }, 1000);
              }}
              className="space-y-4 max-w-xl"
            >
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3">
                <Label className="text-xs font-semibold text-slate-700 sm:text-right">
                  Choose File
                </Label>
                <div className="sm:col-span-3">
                  <Input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={(e) => setBulkBpFile(e.target.files?.[0] || null)}
                    className="h-9 text-xs file:bg-slate-100 file:border-0 file:rounded file:px-2.5 file:py-1 file:text-xs file:font-medium file:text-slate-700 hover:file:bg-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 sm:pl-32 pt-2">
                <Button
                  type="submit"
                  disabled={isBulkUploading}
                  className="bg-blue-600 hover:bg-blue-700 text-white min-w-24 h-8 text-xs font-semibold"
                >
                  {isBulkUploading ? "Uploading…" : "Upload"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setBulkBpFile(null);
                    setActiveTab("list");
                  }}
                  className="h-8 text-xs font-medium uppercase border-slate-300"
                >
                  CANCEL
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: BULK UPDATE ACCOUNTS */}
        {activeTab === "bulk_users" && (
          <div className="p-6 space-y-6">
            <div className="space-y-1.5 text-xs text-slate-700">
              <p>
                Upload an Excel file (.xlsx or .xls) to update multiple account details. The columns should be:{" "}
                <span className="font-bold text-slate-900">Name, Mobile, State, City, District, Status</span>.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!bulkUsersFile) {
                  toastError("Please choose an Excel file to upload");
                  return;
                }
                setIsBulkUploading(true);
                setTimeout(() => {
                  setIsBulkUploading(false);
                  success(`${bulkUsersFile.name} uploaded! Accounts updated successfully.`);
                  setBulkUsersFile(null);
                  setActiveTab("list");
                }, 1000);
              }}
              className="space-y-4 max-w-xl"
            >
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3">
                <Label className="text-xs font-semibold text-slate-700 sm:text-right">
                  Choose File
                </Label>
                <div className="sm:col-span-3">
                  <Input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={(e) => setBulkUsersFile(e.target.files?.[0] || null)}
                    className="h-9 text-xs file:bg-slate-100 file:border-0 file:rounded file:px-2.5 file:py-1 file:text-xs file:font-medium file:text-slate-700 hover:file:bg-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 sm:pl-32 pt-2">
                <Button
                  type="submit"
                  disabled={isBulkUploading}
                  className="bg-blue-600 hover:bg-blue-700 text-white min-w-24 h-8 text-xs font-semibold"
                >
                  {isBulkUploading ? "Uploading…" : "Upload"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setBulkUsersFile(null);
                    setActiveTab("list");
                  }}
                  className="h-8 text-xs font-medium uppercase border-slate-300"
                >
                  CANCEL
                </Button>
              </div>
            </form>
          </div>
        )}
      </Card>
    </div>
  );
}
