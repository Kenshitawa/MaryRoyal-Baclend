import {
  BookOpen,
  BookOpenCheck,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  FileText,
  GraduationCap,
  HeartHandshake,
  LayoutList,
  Library,
  MessageCircle,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";

export type NavigationItem = {
  label: string;
  href: string;
  icon: typeof Users;
};

const navigationByRole: Record<string, NavigationItem[]> = {
  DIRECTOR: [
    { label: "Overview", href: "/dashboard", icon: GraduationCap },
    { label: "Learners", href: "/learners", icon: Users },
    { label: "Admissions", href: "/admissions", icon: ClipboardList },
    { label: "Accounts", href: "/accounts", icon: ShieldCheck },
    { label: "Staff", href: "/staff", icon: Users },
    { label: "Assessments", href: "/assessments", icon: BookOpen },
    { label: "Attendance", href: "/attendance", icon: CalendarCheck },
    { label: "Finance", href: "/finance", icon: Wallet },
    { label: "Welfare", href: "/welfare", icon: HeartHandshake },
    { label: "Reports", href: "/reports", icon: FileText },
    { label: "Timetable", href: "/timetable", icon: CalendarDays },
    { label: "KICD videos", href: "/learning-videos", icon: BookOpenCheck },
    { label: "Complaints", href: "/complaints", icon: MessageCircle },
  ],
  HEAD_TEACHER: [
    { label: "Overview", href: "/dashboard", icon: GraduationCap },
    { label: "Learners", href: "/learners", icon: Users },
    { label: "Admissions", href: "/admissions", icon: ClipboardList },
    { label: "Staff", href: "/staff", icon: Users },
    { label: "Assessments", href: "/assessments", icon: BookOpen },
    { label: "Attendance", href: "/attendance", icon: CalendarCheck },
    { label: "Finance", href: "/finance", icon: Wallet },
    { label: "Welfare", href: "/welfare", icon: HeartHandshake },
    { label: "Reports", href: "/reports", icon: FileText },
    { label: "Timetable", href: "/timetable", icon: CalendarDays },
    { label: "Schemes of work", href: "/schemes", icon: LayoutList },
    { label: "KICD videos", href: "/learning-videos", icon: BookOpenCheck },
    { label: "Weekly teaching log", href: "/teaching-log", icon: ClipboardList },
    { label: "Complaints", href: "/complaints", icon: MessageCircle },
  ],
  DEPUTY: [
    { label: "Overview", href: "/dashboard", icon: GraduationCap },
    { label: "Learners", href: "/learners", icon: Users },
    { label: "Attendance", href: "/attendance", icon: CalendarCheck },
    { label: "Assessments", href: "/assessments", icon: BookOpen },
    { label: "Library", href: "/library", icon: Library },
    { label: "Schemes of work", href: "/schemes", icon: LayoutList },
    { label: "Timetable", href: "/timetable", icon: CalendarDays },
    { label: "Welfare", href: "/welfare", icon: HeartHandshake },
    { label: "KICD videos", href: "/learning-videos", icon: BookOpenCheck },
  ],
  SECRETARY: [
    { label: "Overview", href: "/dashboard", icon: GraduationCap },
    { label: "Learners", href: "/learners", icon: Users },
    { label: "Admissions", href: "/admissions", icon: ClipboardList },
    { label: "Finance", href: "/finance", icon: Wallet },
    { label: "Welfare", href: "/welfare", icon: HeartHandshake },
  ],
  ACCOUNTANT: [
    { label: "Overview", href: "/dashboard", icon: GraduationCap },
    { label: "Finance", href: "/finance", icon: Wallet },
    { label: "Learners", href: "/learners", icon: Users },
  ],
  TEACHER: [
    { label: "Overview", href: "/dashboard", icon: GraduationCap },
    { label: "Attendance", href: "/attendance", icon: CalendarCheck },
    { label: "Assessments", href: "/assessments", icon: BookOpen },
    { label: "Learners", href: "/learners", icon: Users },
    { label: "Assignments", href: "/assignments", icon: ClipboardList },
    { label: "Learning content", href: "/learning-content", icon: BookOpenCheck },
    { label: "KICD videos", href: "/learning-videos", icon: BookOpenCheck },
    { label: "Weekly teaching log", href: "/teaching-log", icon: FileText },
    { label: "Schemes of work", href: "/schemes", icon: LayoutList },
    { label: "Library", href: "/library", icon: Library },
    { label: "Welfare", href: "/welfare", icon: HeartHandshake },
    { label: "Timetable", href: "/timetable", icon: CalendarDays },
  ],
  WELFARE_CHAIR: [
    { label: "Overview", href: "/dashboard", icon: GraduationCap },
    { label: "Welfare", href: "/welfare", icon: HeartHandshake },
  ],
  NON_TEACHING_STAFF: [
    { label: "Overview", href: "/dashboard", icon: GraduationCap },
    { label: "Welfare", href: "/welfare", icon: HeartHandshake },
  ],
  PARENT: [
    { label: "My children", href: "/portal", icon: Users },
    { label: "Complaints", href: "/complaints", icon: MessageCircle },
  ],
  LEARNER: [
    { label: "My learning", href: "/learning", icon: BookOpen },
    { label: "Assignments", href: "/assignments", icon: ClipboardList },
  ],
};

export function getRoleNavigation(role: string): NavigationItem[] {
  return navigationByRole[role] ?? navigationByRole.LEARNER;
}

export function getNavigationHref(label: string, role: string): string | undefined {
  return getRoleNavigation(role).find((item) => item.label === label)?.href;
}
