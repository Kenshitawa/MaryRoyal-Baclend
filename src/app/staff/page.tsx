import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PortalFrame from "@/components/portal-frame";
import { db } from "@/lib/db";
import { readSession } from "@/lib/session";
import { canInScope } from "@/lib/permissions";
import { Users, Mail, Phone, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";

export default async function StaffDirectoryPage() {
  const token = (await cookies()).get("mary_session")?.value;
  const session = token ? await readSession(token) : null;
  if (!session) redirect("/");

  const user = await db.user.findUnique({
    where: { id: session.id },
    select: { id: true, role: true, suspended: true, forcePasswordChange: true }
  });
  if (!user || user.suspended) redirect("/");
  if (user.forcePasswordChange) redirect("/change-password");
  if (!canInScope(user.role, "staff", "view", "school")) redirect("/dashboard");

  const staff = await db.user.findMany({
    where: { role: { notIn: ["PARENT", "LEARNER"] }, suspended: false },
    select: { id: true, name: true, email: true, role: true, phone: true },
    orderBy: [{ role: "asc" }, { name: "asc" }]
  });

  return (
    <PortalFrame active="Staff">
      <main className="mx-auto max-w-6xl space-y-6 p-4 pb-28 sm:p-6 md:p-8">
        {/* Hero Section */}
        <div className="bento-card relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 p-6 text-white shadow-xl shadow-blue-950/10 sm:p-8 dark:border-blue-900/50">
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-400/20 px-3 py-1 text-xs font-bold text-blue-200 ring-1 ring-inset ring-blue-300/30">
                <ShieldCheck size={14} className="text-blue-300" />
                Staff Directory · Director &amp; Leadership
              </span>
              <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                School Faculty &amp; Staff
              </h1>
              <p className="mt-1 text-xs text-blue-100 sm:text-sm">
                Active team members, teaching assignments, contact details, and qualifications.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur">
                <Users size={16} />
                {staff.length} Active Staff
              </span>
            </div>
          </div>
        </div>

        {/* Staff Bento Cards Grid */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((member) => (
            <Link
              key={member.id}
              href={`/staff/${member.id}`}
              className="bento-card group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-blue-700"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-base font-black text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
                    {member.name
                      .split(/\s+/)
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                    {member.role.replaceAll("_", " ")}
                  </span>
                </div>

                <h2 className="mt-3 truncate text-base font-bold text-slate-900 group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-400">
                  {member.name}
                </h2>

                <div className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <p className="flex items-center gap-1.5 truncate">
                    <Mail size={13} className="shrink-0 text-slate-400" />
                    {member.email}
                  </p>
                  {member.phone && (
                    <p className="flex items-center gap-1.5 truncate">
                      <Phone size={13} className="shrink-0 text-slate-400" />
                      {member.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-blue-700 dark:border-slate-800 dark:text-blue-400">
                <span>View Full Profile</span>
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-1"
                />
              </div>
            </Link>
          ))}
        </section>

        {staff.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <UserCheck size={32} className="mx-auto text-slate-300 dark:text-slate-600" />
            <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
              No active staff accounts yet.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Create staff accounts in the Accounts panel to populate the directory.
            </p>
          </div>
        )}
      </main>
    </PortalFrame>
  );
}
