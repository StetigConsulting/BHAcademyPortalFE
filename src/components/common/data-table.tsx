"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type Column<T> = {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  title: string;
  icon: LucideIcon;
  columns: Column<T>[];
  data: T[];
  getRowId: (row: T) => string | number;
  loading?: boolean;
  search?: string;
  onSearchChange?: (value: string) => void;
  emptyMessage?: string;
};

export function DataTable<T>({
  title,
  icon: Icon,
  columns,
  data,
  getRowId,
  loading = false,
  search,
  onSearchChange,
  emptyMessage = "No records found",
}: DataTableProps<T>) {
  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-sm">
      {/* Tab-style title strip */}
      <div className="border-b px-2 pt-2">
        <div className="inline-flex items-center gap-2 border-t-2 border-blue-500 px-4 py-3 text-sm font-medium text-slate-700">
          <Icon className="h-4 w-4" />
          {title}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {onSearchChange && (
          <div className="mb-4 flex items-center justify-end gap-2">
            <label htmlFor="table-search" className="text-sm font-semibold text-slate-700">
              Search:
            </label>
            <Input
              id="table-search"
              value={search ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 w-full sm:w-56"
            />
          </div>
        )}

        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow className="border-b-2 border-blue-500 hover:bg-transparent">
              {columns.map((col) => (
                <TableHead key={col.header} className={cn("font-bold text-slate-900", col.className)}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-10 text-center text-slate-500">
                  Loading…
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-10 text-center text-slate-500">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={getRowId(row)}>
                  {columns.map((col) => (
                    <TableCell key={col.header} className={col.className}>
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}