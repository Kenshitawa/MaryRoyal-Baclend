import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PortalFrame from "@/components/portal-frame";
import { db } from "@/lib/db";
import { readSession } from "@/lib/session";
import { canInScope } from "@/lib/permissions";
export default async function StaffDirectoryPage() {
  const token = (await cookies()).get("mary_session")?.value;
  const session = token ? await readSession(token) : null;
  if (!session) redirect("/");
  const user = await db.user.findUnique({ where: { id: session.id }, select: { id: true, role: true, suspended: true, forcePasswordChange: true } });
  if (!user || user.suspended) redirect("/");
  if (user.forcePasswordChange) redirect("/change-password");
  if (!canInScope(user.role, "staff", "view", "school")) redirect("/dashboard");
  const staff = await db.user.findMany({ where: { role: { notIn: ["PARENT", "LEARNER"] }, suspended: false }, select: { id: true, name: true, email: true, role: true, phone: true }, orderBy: [{ role: "asc" }, { name: "asc" }] });
  return <PortalFrame active="Staff"><main className="mx-auto max-w-6xl space-y-5 p-4 pb-28 sm:p-6 md:p-8"><header><p className="text-xs font-bold uppercase tracking-[.16em] text-blue-700">School team</p><h1 className="mt-2 text-3xl font-extrabold">Staff profiles</h1><p className="mt-2 text-sm text-slate-500">Review role, contact information, class assignments and teaching notes.</p></header><section className="grid gap-3 md:grid-cols-2">{staff.map((member) => <Link key={member.id} href={`/staff/${member.id}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="truncate text-lg font-bold">{member.name}</h2><p className="mt-1 text-sm text-slate-500">{member.email}</p>{member.phone && <p className="mt-1 text-sm text-slate-500">{member.phone}</p>}</div><span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-800">{member.role.replaceAll("_", " ")}</span></div><p className="mt-4 text-sm font-semibold text-blue-700">Open staff profile →</p></Link>)}</section>{staff.length === 0 && <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No active staff accounts yet.</p>}</main></PortalFrame>;
}
