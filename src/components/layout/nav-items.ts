import {
  BarChart3,
  ClipboardList,
  GraduationCap,
  Layers,
  LayoutDashboard,
  Lightbulb,
  Link2,
  List,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { label: string; href: string; icon: LucideIcon };
export type NavSection = { title?: string; items: NavItem[] };

export const navSections: NavSection[] = [
  {
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    items: [
      { label: "Courses List", href: "/courses", icon: List },
      { label: "Categories List", href: "/categories", icon: Layers },
      { label: "Users List", href: "/users", icon: Users },
    ],
  },
  {
    items: [
      { label: "New Zoom Meet. Link", href: "/zoom/new", icon: Link2 },
      { label: "Zoom Meeting Links", href: "/zoom/links", icon: Link2 },
      { label: "Send Assessment Link", href: "/assessments/send", icon: Link2 },
      { label: "Assessment Links", href: "/assessments/links", icon: ClipboardList },
      { label: "Assessment Results", href: "/assessments/results", icon: Lightbulb },
    ],
  },
  {
    items: [{ label: "Trainers", href: "/trainers", icon: GraduationCap }],
  },
  {
    title: "Reports & Logs",
    items: [
      { label: "Participants Results", href: "/reports/participants", icon: BarChart3 },
      { label: "Assessment Summary", href: "/reports/summary", icon: BarChart3 },
    ],
  },
];