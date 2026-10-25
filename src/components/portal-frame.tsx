import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BookOpen, CalendarCheck, FileText, GraduationCap, LogOut, ScrollText, ShieldCheck, Users, Wallet, Eye } from "lucide-react";
import { db } from "@/lib/db";
import { readSession } from "@/lib/session";
import ThemeToggle from "@/components/theme-toggle";

const route: Record<string, string> = { Overview: "/dashboard", Learners: "/learners", Accounts: "/accounts", Assessments: "/assessments", Attendance: "/attendance", Finance: "/finance", Reports: "/reports", "Audit log": "/audit", Profile: "/profile" };
const roleTitle: Record<string, string> = { DIRECTOR: "Director", HEAD_TEACHER: "Head Teacher", DEPUTY: "Deputy Head Teacher", ACCOUNTANT: "Accountant", TEACHER: "Teacher", PARENT: "Parent", LEARNER: "Learner" };
const links: Record<string, { label: string; icon: typeof Users }[]> = {
  DIRECTOR: [{ label: "Overview", icon: GraduationCap }, { label: "Learners", icon: Users }, { label: "Accounts", icon: ShieldCheck }, { label: "Assessments", icon: BookOpen }, { label: "Attendance", icon: CalendarCheck }, { label: "Finance", icon: Wallet }, { label: "Reports", icon: FileText }, { label: "Audit log", icon: ScrollText }],
  HEAD_TEACHER: [{ label: "Overview", icon: GraduationCap }, { label: "Learners", icon: Users }, { label: "Assessments", icon: BookOpen }, { label: "Attendance", icon: CalendarCheck }, { label: "Audit log", icon: ScrollText }],
  DEPUTY: [{ label: "Overview", icon: GraduationCap }, { label: "Learners", icon: Users }, { label: "Attendance", icon: CalendarCheck }, { label: "Assessments", icon: BookOpen }],
  ACCOUNTANT: [{ label: "Overview", icon: GraduationCap }, { label: "Finance", icon: Wallet }],
  TEACHER: [{ label: "Overview", icon: GraduationCap }, { label: "Attendance", icon: CalendarCheck }, { label: "Assessments", icon: BookOpen }, { label: "Learners", icon: Users }],
  PARENT: [{ label: "My children", icon: Users }], LEARNER: [{ label: "My learning", icon: BookOpen }]
};

export default async function PortalFrame({ children, active }: { children: React.ReactNode; active: string }) {
  const token = (await cookies()).get("mary_session")?.value;
  const session = token ? await readSession(token) : null;
  if (!session) redirect("/");
  const user = await db.user.findUnique({ where: { id: session.id }, select: { name: true, role: true, avatarUrl: true, suspended: true, forcePasswordChange: true } });
  if (!user || user.suspended) redirect("/");
  if (user.forcePasswordChange) redirect("/change-password");
  const nav = links[user.role] ?? links.LEARNER;
  return <div className="min-h-screen lg:flex">
    <aside className="school-sidebar fixed inset-y-0 left-0 z-30 hidden h-screen w-[250px] shrink-0 flex-col overflow-y-auto border-r border-slate-200/80 bg-[#f1f6ff] px-4 py-6 lg:flex"><a href="/dashboard" className="mb-9 flex items-center gap-3 px-2"><Image src="/mary-royal-logo.png" alt="Mary Royal School" width={42} height={42}/><span><b className="block text-sm tracking-tight text-slate-900">Mary Royal School</b><span className="text-[10px] text-slate-500">Obunga · Kisumu</span></span></a><p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">Workspace</p><nav aria-label="Main navigation" className="space-y-1">{nav.map(({ label, icon: Icon }) => <a key={label} href={route[label] ?? "/portal"} aria-current={active === label ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-semibold transition ${active === label ? "bg-blue-50 text-blue-800" : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"}`}><Icon size={18}/>{label}{active === label && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600"/>}</a>)}</nav><div className="mt-auto rounded-2xl bg-gradient-to-br from-blue-800 to-blue-600 p-4 text-white"><p className="text-sm font-bold">Hard work pays</p><p className="mt-1 text-xs leading-relaxed text-blue-100">Nurturing Excellence Through CBE</p></div></aside>
    <div className="min-w-0 flex-1 lg:ml-[250px]"><header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-slate-200/75 bg-white/90 px-4 backdrop-blur-xl sm:px-7 lg:px-10"><div className="flex items-center gap-2 lg:hidden"><Image src="/mary-royal-logo.png" alt="Mary Royal School" width={34} height={34}/><span className="text-sm font-extrabold">Mary Royal</span></div><div className="hidden text-xs text-slate-500 lg:block">Mary Royal School <span className="mx-2 text-slate-300">/</span><span className="font-semibold text-slate-700">{active}</span></div><div className="flex items-center gap-2 sm:gap-3"><ThemeToggle compact/>{user.role === "DIRECTOR" && <a href="/audit" aria-label="Security activity" title="Security activity" className="grid h-9 w-9 place-items-center rounded-xl text-blue-800 transition hover:bg-blue-50"><Eye size={17}/></a>}<span className="hidden text-right sm:block"><span className="block text-xs font-bold text-slate-800">{user.name}</span><span className="text-[10px] text-slate-500">{roleTitle[user.role] ?? user.role}</span></span><a href="/profile" aria-label="Open profile and security settings" className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-blue-100 text-xs font-bold text-blue-800 ring-1 ring-blue-200">{user.avatarUrl ? <Image src={user.avatarUrl} alt="" fill sizes="36px" className="object-cover" unoptimized/> : user.name.split(/\s+/).map(part => part[0]).slice(0,2).join("").toUpperCase()}</a><form action="/api/logout" method="post"><button aria-label="Sign out" className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"><LogOut size={17}/></button></form></div></header><div className="min-h-[calc(100vh-68px)]">{children}</div></div>
    <nav aria-label="Mobile navigation" className="mobile-nav fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-slate-200/80 bg-white/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(15,35,70,.07)] backdrop-blur lg:hidden">{nav.slice(0,4).map(({ label, icon: Icon }) => <a key={label} href={route[label] ?? "/portal"} aria-current={active === label ? "page" : undefined} className={`flex min-h-12 min-w-16 flex-1 flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-semibold ${active === label ? "text-blue-700" : "text-slate-500"}`}><Icon size={18}/>{label}</a>)}</nav>
  </div>;
}
