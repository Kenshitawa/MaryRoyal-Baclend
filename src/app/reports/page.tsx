import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { readSession } from "@/lib/session";
import { canInScope } from "@/lib/permissions";
import PortalFrame from "@/components/portal-frame";
import { Download, Users, BookOpenCheck, ReceiptText, FileBarChart2 } from "lucide-react";

export default async function ReportsPage() {
  const token = (await cookies()).get("mary_session")?.value;
  const session = token ? await readSession(token) : null;
  if (!session) redirect("/");

  const user = await db.user.findUnique({
    where: { id: session.id },
    select: { role: true, suspended: true, forcePasswordChange: true },
  });
  if (!user || user.suspended) redirect("/");
  if (user.forcePasswordChange) redirect("/change-password");
  if (!canInScope(user.role, "exports", "view", "school")) redirect("/dashboard");

  const [learners, assessments, invoices] = await Promise.all([
    db.learner.count({ where: { archivedAt: null } }),
    db.assessment.count({ where: { status: "RELEASED" } }),
    db.feeInvoice.count(),
  ]);

  const totals = [
    {
      label: "Active Learners",
      value: learners,
      icon: Users,
      description: "Enrolled across all grades",
      tone: "blue",
    },
    {
      label: "Released Assessments",
      value: assessments,
      icon: BookOpenCheck,
      description: "CBC marks visible to families",
      tone: "emerald",
    },
    {
      label: "Fee Invoices",
      value: invoices,
      icon: ReceiptText,
      description: "All term invoices",
      tone: "amber",
    },
  ];

  const toneStyles: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  };

  return (
    <PortalFrame active="Reports">
      <main className="mx-auto max-w-6xl space-y-6 p-4 pb-28 sm:p-6 lg:p-8">
        {/* Hero Header */}
        <div className="bento-card overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 p-6 text-white shadow-xl shadow-blue-950/10 sm:p-8 dark:border-blue-900/50">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-400/20 px-3 py-1 text-xs font-bold text-blue-200 ring-1 ring-inset ring-blue-300/30">
                <FileBarChart2 size={14} className="text-blue-300" />
                School Insights &amp; Data Exports
              </span>
              <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Reports &amp; Exports</h1>
              <p className="mt-1 text-xs text-blue-100 sm:text-sm">
                School record summaries and secure exports for compliance and review. All exports are audit-logged.
              </p>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <section className="grid gap-4 sm:grid-cols-3" aria-label="School data summary">
          {totals.map(({ label, value, icon: Icon, description, tone }) => (
            <article
              key={label}
              className="bento-card flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90"
            >
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
                <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">{value}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">{description}</p>
              </div>
              <span className={`grid h-11 w-11 place-items-center rounded-xl ${toneStyles[tone]}`}>
                <Icon size={20} />
              </span>
            </article>
          ))}
        </section>

        {/* Available Exports */}
        <section className="bento-card rounded-2xl border border-slate-200/90 bg-white/95 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Available Exports</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Director-only exports. Every download is recorded in the audit trail.
          </p>

          <div className="mt-5 space-y-3">
            {/* Learner Register Export */}
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  <Download size={20} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Learner Register (CSV)</h3>
                  <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Includes admission number, full name, class/grade, gender, and admission date. Suitable for county
                    reporting and internal audits.
                  </p>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                    {learners} active learners · Audit-logged
                  </p>
                </div>
              </div>
              <a
                href="/api/reports/learners"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-700/20 transition hover:bg-blue-800"
              >
                <Download size={15} />
                Download CSV
              </a>
            </div>

            {/* Released Assessment Report */}
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:border-blue-200 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900/90">
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400">
                  <FileBarChart2 size={20} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Released Assessment Report (CSV)
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    CBC competency scores, performance descriptors (EE/ME/AE/BE), strands, and teacher remarks.
                  </p>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                    {assessments} released records
                  </p>
                </div>
              </div>
              <a
                href="/api/reports/assessments"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-700/20 transition hover:bg-purple-800"
              >
                <Download size={15} />
                Download CSV
              </a>
            </div>

            {/* Fee Collections Summary */}
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:border-blue-200 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900/90">
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <FileBarChart2 size={20} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Fee Collections &amp; Balances Summary (CSV)
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Term-by-term invoice totals, credit adjustments, amounts paid, and net outstanding balances.
                  </p>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    {invoices} invoices tracked
                  </p>
                </div>
              </div>
              <a
                href="/api/reports/finance"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-700/20 transition hover:bg-emerald-800"
              >
                <Download size={15} />
                Download CSV
              </a>
            </div>
          </div>
        </section>
      </main>
    </PortalFrame>
  );
}
