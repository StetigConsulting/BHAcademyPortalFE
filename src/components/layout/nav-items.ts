import {
  BarChart3,
  ClipboardList,
  GraduationCap,
  HelpCircle,
  Layers,
  LayoutDashboard,
  Lightbulb,
  Link2,
  List,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  permission?: string | string[];
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

export const navSections: NavSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "dashboard.read" },
    ],
  },
  {
    items: [
      { label: "Courses List", href: "/courses", icon: List, permission: "courses.read" },
      { label: "Categories List", href: "/categories", icon: Layers, permission: "categories.read" },
      { label: "Accounts", href: "/accounts", icon: Users, permission: "users.read" },
      { label: "FAQs", href: "/faqs", icon: HelpCircle, permission: "faqs.read" },
    ],
  },
  {
    items: [
      { label: "New Zoom Meet. Link", href: "/zoom/new", icon: Link2, permission: "sessions.read" },
      { label: "Zoom Meeting Links", href: "/zoom/links", icon: Link2, permission: "sessions.read" },
      { label: "Send Assessment Link", href: "/assessments/send", icon: Link2, permission: "courses.read" },
      { label: "Assessment Links", href: "/assessments/links", icon: ClipboardList, permission: "courses.read" },
      { label: "Assessment Results", href: "/assessments/results", icon: Lightbulb, permission: "audit.read" },
    ],
  },
  {
    items: [{ label: "Trainers", href: "/trainers", icon: GraduationCap, permission: "users.read" }],
  },
  {
    title: "Reports & Logs",
    items: [
      { label: "Participants Results", href: "/reports/participants", icon: BarChart3, permission: "audit.read" },
      { label: "Assessment Summary", href: "/reports/summary", icon: BarChart3, permission: "audit.read" },
    ],
  },
];