import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { readSession } from "@/lib/session";
import { canInScope } from "@/lib/permissions";
import PortalFrame from "@/components/portal-frame";
import { Download, Users, BookOpenCheck, ReceiptText } from "lucide-react";

export default async function ReportsPage() {
  const token = (await cookies()).get("mary_session")?.value; const session = token ? await readSession(token) : null; if (!session) redirect("/");
  const user = await db.user.findUnique({ where: { id: session.id }, select: { role: true, suspended: true, forcePasswordChange: true } });
  if (!user || user.suspended) redirect("/"); if (user.forcePasswordChange) redirect("/change-password"); if (!canInScope(user.role, "exports", "view", "school")) redirect("/dashboard");
  const [learners, assessments, invoices] = await Promise.all([db.learner.count({ where: { archivedAt: null } }), db.assessment.count({ where: { status: "RELEASED" } }), db.feeInvoice.count()]);
  const totals = [{ label: "Active learners", value: learners, icon: Users }, { label: "Released assessment records", value: assessments, icon: BookOpenCheck }, { label: "Fee invoices", value: invoices, icon: ReceiptText }];
  return <PortalFrame active="Reports"><main className="mx-auto max-w-6xl p-5 pb-28 md:p-8"><header className="mb-7"><p className="text-xs font-bold uppercase tracking-[.16em] text-blue-700">School insights</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Reports & exports</h1><p className="mt-2 text-sm text-slate-500">A quick snapshot of school records and a secure learner register export.</p></header><section className="grid gap-3 sm:grid-cols-3">{totals.map(({ label, value, icon: Icon }) => <article key={label} className="rounded-2xl border border-slate-200/75 bg-white p-5 shadow-sm"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700"><Icon size={19}/></span><p className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900">{value}</p><p className="mt-1 text-xs font-semibold text-slate-500">{label}</p></article>)}</section><section className="mt-5 flex flex-col gap-5 rounded-2xl border border-slate-200/75 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-700"><Download size={21}/></span><div><h2 className="font-extrabold text-slate-900">Learner register</h2><p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-500">CSV includes admission number, learner name, class and gender. Export access is restricted to the Director and recorded in the audit log.</p></div></div><a href="/api/reports/learners" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-bold text-white shadow-md shadow-blue-700/15 transition hover:bg-blue-800"><Download size={16}/> Download CSV</a></section></main></PortalFrame>;
}
