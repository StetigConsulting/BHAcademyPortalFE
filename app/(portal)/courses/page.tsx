"use client";

import { useEffect, useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { Plus, RefreshCw, Search, Image as ImageIcon, Award, Video, Clock } from "lucide-react";

import { DataTable, type Column } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { StatusText } from "@/components/common/status-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth-context";
import { getCoursesAction } from "@/features/courses/action";
import type { CourseItem, CoursePageResponse } from "@/features/courses/types";

export default function CoursesPage() {
  const { can } = useAuth();
  const { success, error: toastError } = useToast();

  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [pageData, setPageData] = useState<CoursePageResponse>({
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

  // Permission flags (for future Create/Update/Delete buttons)
  const canCreate = can("courses.create");

  const loadCourses = (
    targetPage = page,
    searchTerm = activeSearch,
    showSuccessToast = false
  ) => {
    startTransition(async () => {
      const res = await getCoursesAction({
        page: targetPage,
        size: pageSize,
        search: searchTerm,
        sort: "ASC",
      });

      if (res.success && res.data) {
        setPageData(res.data);
        if (showSuccessToast) {
          success("Courses refreshed successfully");
        }
      } else {
        toastError(res.error || "Failed to load courses");
      }
    });
  };

  useEffect(() => {
    loadCourses(page, activeSearch);
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

  const columns: Column<CourseItem>[] = useMemo(() => {
    const cols: Column<CourseItem>[] = [
      {
        header: "ID",
        cell: (r) => <span className="font-mono text-xs font-semibold text-slate-700">#{r.id}</span>,
        className: "w-16 text-center",
      },
      {
        header: "Image",
        cell: (r) => {
          const validImg = r.imageUrl && r.imageUrl.startsWith("http");
          return (
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50">
              {validImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.imageUrl}
                  alt={r.courseName}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <ImageIcon className="h-4 w-4 text-slate-400" />
              )}
            </div>
          );
        },
        className: "w-16",
      },
      {
        header: "Course Name",
        cell: (r) => (
          <div className="max-w-xs space-y-0.5">
            <p className="font-medium text-slate-900 leading-snug">{r.courseName}</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                {r.categoryName || r.categoryId}
              </span>
              {r.courseNameHi && (
                <span className="text-[11px] text-slate-500 font-normal truncate max-w-[180px]">
                  {r.courseNameHi}
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        header: "Level",
        cell: (r) => {
          if (!r.courseLevel) return <span className="text-xs text-slate-400">—</span>;

          const level = r.courseLevel.toLowerCase();
          const badgeClass =
            level === "basic"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : level === "intermediate"
              ? "bg-sky-50 text-sky-700 border-sky-200"
              : "bg-purple-50 text-purple-700 border-purple-200";

          return (
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${badgeClass}`}
            >
              {r.courseLevel}
            </span>
          );
        },
        className: "w-28 text-center",
      },
      {
        header: "Mode",
        cell: (r) => (
          <span className="text-xs font-medium text-slate-700">
            {r.mode || "Virtual"}
          </span>
        ),
        className: "w-20 text-center",
      },
      {
        header: "Duration",
        cell: (r) => (
          <div className="flex items-center gap-1 text-xs text-slate-700">
            <Clock className="h-3 w-3 text-slate-400" />
            <span>{r.duration ? `${r.duration} m` : "—"}</span>
          </div>
        ),
        className: "w-24",
      },
      {
        header: "Videos",
        cell: (r) => (
          <div className="flex items-center gap-1 text-xs text-slate-700">
            <Video className="h-3 w-3 text-slate-400" />
            <span>{r.noOfVideos ?? 0}</span>
          </div>
        ),
        className: "w-20",
      },
      {
        header: "Points",
        cell: (r) => (
          <span className="inline-flex items-center rounded bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
            {r.points ?? 0} pts
          </span>
        ),
        className: "w-20 text-center",
      },
      {
        header: "Certifications",
        cell: (r) => (
          <div className="flex items-center gap-1 text-xs text-slate-700">
            <Award className="h-3 w-3 text-amber-500" />
            <span>{r.noOfCertifications ? Number(r.noOfCertifications).toLocaleString() : 0}</span>
          </div>
        ),
        className: "w-28",
      },
      {
        header: "Status",
        cell: (r) => <StatusText active={r.status === "ACTIVE"} />,
        className: "w-24 text-center",
      },
    ];

    return cols;
  }, []);

  return (
    <>
      <PageHeader
        title="Manage Courses"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Courses List" }]}
      />

      <DataTable
        title="Courses List"
        logoSrc="/logo.png"
        columns={columns}
        data={pageData.content}
        getRowId={(r) => r.id}
        loading={isPending}
        emptyMessage={activeSearch ? `No courses matching "${activeSearch}"` : "No courses found"}
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input beside Refresh */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <Input
                placeholder="Search courses..."
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
              onClick={() => loadCourses(page, activeSearch, true)}
              disabled={isPending}
              className="gap-1.5 text-slate-600"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            {/* Add Course button visible only if user has courses.create permission */}
            {canCreate && (
              <Button asChild size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/courses/new">
                  <Plus className="h-4 w-4" />
                  Add Course
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