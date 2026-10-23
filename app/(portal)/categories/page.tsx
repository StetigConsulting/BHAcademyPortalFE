"use client";

import { useState } from "react";
import Link from "next/link";
import { List } from "lucide-react";

import { DataTable, type Column } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { StatusText } from "@/components/common/status-text";

type Category = {
  id: number;
  name: string;
  displayOrder: number;
  featured: boolean;
  active: boolean;
  courseCount: number;
};

const columns: Column<Category>[] = [
  { header: "ID", cell: (r) => r.id },
  { header: "Category Name", cell: (r) => r.name },
  { header: "Display Order", cell: (r) => r.displayOrder },
  { header: "Featured", cell: (r) => (r.featured ? "Yes" : "No") },
  { header: "Status", cell: (r) => <StatusText active={r.active} /> },
  {
    header: "Category Courses",
    cell: (r) => (
      <Link href={`/courses?category=${r.id}`} className="text-blue-600 hover:underline">
        Courses ({r.courseCount})
      </Link>
    ),
  },
];

export default function CategoriesPage() {
  const [search, setSearch] = useState("");

  const categories: Category[] = [];
  const loading = false;

  return (
    <>
      <PageHeader
        title="Manage Categories"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Categories List" }]}
      />

      <DataTable
        title="Categories List"
        icon={List}
        columns={columns}
        data={categories}
        getRowId={(r) => r.id}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
      />
    </>
  );
}