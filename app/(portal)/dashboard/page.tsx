import {
  CheckCircle2,
  Link2,
  MapPin,
  MessagesSquare,
  PlayCircle,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/features/dashboard/components/stat-card";

const BLUE = "bg-cyan-600 text-white";
const YELLOW = "bg-amber-400 text-slate-900";
const GREEN = "bg-emerald-600 text-white";
const RED = "bg-rose-600 text-white";

// Add `value` to each item once your dashboard API is ready.
const stats = [
  { label: "Users/Participants", href: "/users", icon: Users, color: BLUE },
  { label: "Links Shared", href: "/zoom/links", icon: Link2, color: YELLOW },
  { label: "Assessments Taken (Trainer)", href: "/assessments/results", icon: CheckCircle2, color: GREEN },
  { label: "Assessments Taken (Self)", href: "/assessments/results", icon: CheckCircle2, color: GREEN },
  { label: "Cities", href: "/cities", icon: MapPin, color: YELLOW },
  { label: "Courses", href: "/courses", icon: PlayCircle, color: GREEN },
  { label: "Active Languages", href: "/languages", icon: MessagesSquare, color: RED },
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" breadcrumbs={[{ label: "Dashboard" }]} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
    </>
  );
}