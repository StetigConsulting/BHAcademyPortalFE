"use client";

import { useState } from "react";
import Link from "next/link";
import { List } from "lucide-react";

import { DataTable, type Column } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { StatusText } from "@/components/common/status-text";

type Course = {
  id: number;
  category: string;
  courseName: string;
  courseCode: string;
  module: string;
  featured: boolean;
  inPortal: boolean;
  inTraining: boolean;
  languages: number;
};

const columns: Column<Course>[] = [
  { header: "ID", cell: (r) => r.id },
  { header: "Category", cell: (r) => r.category },
  { header: "Course Name", cell: (r) => r.courseName },
  { header: "Course Code", cell: (r) => r.courseCode },
  { header: "Module", cell: (r) => r.module },
  { header: "Featured", cell: (r) => (r.featured ? "Yes" : "No") },
  { header: "In Portal", cell: (r) => <StatusText active={r.inPortal} /> },
  { header: "In Training", cell: (r) => <StatusText active={r.inTraining} /> },
  { header: "Languages", cell: (r) => r.languages },
  {
    header: "Manage",
    cell: (r) => (
      <Link href={`/courses/${r.id}`} className="text-blue-600 hover:underline">
        Manage
      </Link>
    ),
  },
];

export default function CoursesPage() {
  const [search, setSearch] = useState("");

  const courses: Course[] = [];
  const loading = false;

  return (
    <>
      <PageHeader
        title="Manage Courses"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Courses List" }]}
      />

      <DataTable
        title="Courses List"
        icon={List}
        columns={columns}
        data={courses}
        getRowId={(r) => r.id}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
      />
    </>
  );
}