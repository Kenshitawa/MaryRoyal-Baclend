import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import PortalFrame from "@/components/portal-frame";
import { db } from "@/lib/db";
import { readSession } from "@/lib/session";
import { canInScope } from "@/lib/permissions";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  Mail,
  Phone,
  ShieldAlert,
  ShieldCheck,
  User,
  Wallet
} from "lucide-react";

const currency = (value: number) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0
  }).format(value);

export default async function StaffProfilePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = (await cookies()).get("mary_session")?.value;
  const session = token ? await readSession(token) : null;
  if (!session) redirect("/");

  const actor = await db.user.findUnique({
    where: { id: session.id },
    select: { id: true, role: true, suspended: true, forcePasswordChange: true }
  });
  if (!actor || actor.suspended) redirect("/");
  if (actor.forcePasswordChange) redirect("/change-password");

  if (actor.id !== id && !canInScope(actor.role, "staff", "view", "school")) {
    await db.auditEvent.create({
      data: { actorId: actor.id, action: "ACCESS_DENIED", entity: "StaffProfile", entityId: id }
    });
    redirect("/dashboard");
  }

  const staff = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
      role: true,
      suspended: true,
      forcePasswordChange: true,
      staffNumber: true,
      tscNumber: true,
      qualifications: true,
      employmentTitle: true,
      createdAt: true
    }
  });

  if (!staff || ["PARENT", "LEARNER"].includes(staff.role)) notFound();

  const [assignments, classTeacher, payroll, logs, login, attendance] = await Promise.all([
    db.teacherAssignment.findMany({
      where: { teacherId: id },
      orderBy: [{ grade: "asc" }, { subject: "asc" }],
      select: { grade: true, subject: true }
    }),
    db.classTeacherAssignment.findMany({
      where: { teacherId: id },
      select: { grade: true }
    }),
    actor.role === "DIRECTOR"
      ? db.payrollEntry.findMany({
          where: { staffId: id },
          orderBy: { period: "desc" },
          take: 12,
          select: {
            period: true,
            grossAmount: true,
            deductions: true,
            netAmount: true,
            status: true,
            paidAt: true
          }
        })
      : [],
    db.teachingLog.findMany({
      where: { teacherId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        topics: true,
        reflection: true,
        grade: true,
        subject: true,
        status: true,
        createdAt: true
      }
    }),
    db.auditEvent.findFirst({
      where: { entity: "User", entityId: id, action: "LOGIN_SUCCEEDED" },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true }
    }),
    db.staffAttendance.findMany({
      where: { staffId: id },
      orderBy: { date: "desc" },
      take: 60,
      select: { date: true, status: true, checkInAt: true, note: true }
    })
  ]);

  const currentUser = actor.id === id;
  const roleLabel = staff.role
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  return (
    <PortalFrame active={currentUser ? "Profile" : "Staff"}>
      <main className="mx-auto max-w-5xl space-y-6 p-4 pb-28 sm:p-6 md:p-8">
        {/* Back navigation */}
        <Link
          href={currentUser ? "/profile" : "/staff"}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500"
        >
          <ArrowLeft size={14} />
          {currentUser ? "Back to Profile" : "Back to Staff Directory"}
        </Link>

        {/* Profile Hero Banner */}
        <section className="bento-card rounded-3xl border border-blue-100 bg-gradient-to-br from-[#0c234b] via-blue-900 to-indigo-950 p-6 text-white shadow-xl shadow-blue-950/15 sm:p-8 dark:border-blue-900/50">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              {staff.avatarUrl ? (
                <Image
                  src={staff.avatarUrl}
                  width={88}
                  height={88}
                  unoptimized
                  alt={staff.name}
                  className="h-20 w-20 rounded-2xl border-2 border-white/30 object-cover shadow-lg"
                />
              ) : (
                <div
                  className="grid h-20 w-20 place-items-center rounded-2xl bg-white/15 text-2xl font-black text-white shadow-lg backdrop-blur"
                  aria-hidden="true"
                >
                  {staff.name
                    .split(/\s+/)
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
              )}
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-400/20 px-3 py-1 text-xs font-bold text-blue-200 ring-1 ring-inset ring-blue-300/30">
                  <ShieldCheck size={13} /> {roleLabel}
                </span>
                <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
                  {staff.name}
                </h1>
                <p className="mt-1 text-xs text-blue-100 sm:text-sm">
                  {staff.employmentTitle || roleLabel} · {staff.email}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                  staff.suspended
                    ? "bg-rose-500/20 text-rose-200 ring-1 ring-rose-400/30"
                    : "bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/30"
                }`}
              >
                {staff.suspended ? <ShieldAlert size={13} /> : <CheckCircle2 size={13} />}
                {staff.suspended ? "Suspended" : "Active Member"}
              </span>

              {actor.role === "DIRECTOR" && (
                <Link
                  href="/accounts"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-blue-900 shadow-sm transition hover:bg-blue-50"
                >
                  <User size={13} /> Manage Account
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Bento Grid: Contact, Access & Assignments */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Contact and credentials */}
          <section className="bento-card rounded-2xl border border-slate-200/90 bg-white/95 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <Briefcase size={16} className="text-blue-600 dark:text-blue-400" />
              Credentials &amp; Access
            </h2>
            <div className="mt-4 divide-y divide-slate-100 text-xs dark:divide-slate-800">
              <div className="flex justify-between py-2.5">
                <span className="text-slate-500">Email Address</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{staff.email}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-slate-500">Phone Number</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{staff.phone || "Not recorded"}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-slate-500">Staff Payroll ID</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{staff.staffNumber || "Not recorded"}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-slate-500">TSC Registration</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{staff.tscNumber || "Not recorded"}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-slate-500">Qualifications</span>
                <span className="max-w-[65%] text-right font-semibold text-slate-800 dark:text-slate-200">
                  {staff.qualifications || "Standard Primary Teaching Certificate"}
                </span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-slate-500">Last Sign-in</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {login
                    ? new Intl.DateTimeFormat("en-KE", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: "Africa/Nairobi"
                      }).format(login.createdAt)
                    : "No sign-in recorded"}
                </span>
              </div>
            </div>
          </section>

          {/* Teaching assignments */}
          <section className="bento-card rounded-2xl border border-slate-200/90 bg-white/95 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <GraduationCap size={16} className="text-indigo-600 dark:text-indigo-400" />
              Teaching &amp; Class Assignments
            </h2>

            {classTeacher.length > 0 && (
              <div className="mt-4 space-y-2">
                {classTeacher.map((item) => (
                  <div
                    key={`class-${item.grade}`}
                    className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/80 p-3 text-xs font-bold text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300"
                  >
                    <span>Class Teacher</span>
                    <span className="rounded-lg bg-blue-700 px-2.5 py-1 text-white">{item.grade}</span>
                  </div>
                ))}
              </div>
            )}

            {assignments.length > 0 ? (
              <div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-100 text-xs dark:divide-slate-800 dark:border-slate-800">
                {assignments.map((item) => (
                  <div
                    key={`${item.grade}-${item.subject}`}
                    className="flex items-center justify-between p-3 text-slate-700 dark:text-slate-300"
                  >
                    <span className="font-medium">{item.subject}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{item.grade}</span>
                  </div>
                ))}
              </div>
            ) : classTeacher.length === 0 ? (
              <p className="mt-4 text-xs text-slate-500">No subject or class assignments recorded.</p>
            ) : null}
          </section>
        </div>

        {/* Daily Teaching Notes */}
        <section className="bento-card rounded-2xl border border-slate-200/90 bg-white/95 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <Calendar size={16} className="text-blue-600 dark:text-blue-400" />
            Recent Daily Teaching Logs
          </h2>

          {logs.length > 0 ? (
            <div className="mt-4 space-y-3">
              {logs.map((log, index) => (
                <div
                  key={`${log.createdAt.toISOString()}-${index}`}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold text-slate-900 dark:text-white">{log.topics}</p>
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {log.status}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    {log.grade} · {log.subject} ·{" "}
                    {new Intl.DateTimeFormat("en-KE", {
                      dateStyle: "medium",
                      timeZone: "Africa/Nairobi"
                    }).format(log.createdAt)}
                  </p>
                  {log.reflection && (
                    <p className="mt-2 text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Reflection:</span>{" "}
                      {log.reflection}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-xs text-slate-500">No teaching logs recorded yet.</p>
          )}
        </section>

        {/* Staff Attendance and Punctuality */}
        <section className="bento-card rounded-2xl border border-slate-200/90 bg-white/95 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Clock size={16} className="text-emerald-600 dark:text-emerald-400" />
                Attendance &amp; Punctuality Register
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {attendance.length} recent sign-in records
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="rounded-full bg-emerald-50 px-3 py-1 font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Present {attendance.filter((r) => r.status === "PRESENT").length}
              </span>
              <span className="rounded-full bg-amber-50 px-3 py-1 font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                Late {attendance.filter((r) => r.status === "LATE").length}
              </span>
            </div>
          </div>

          {attendance.length > 0 ? (
            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {attendance.map((row, index) => (
                <div
                  key={`${row.date.toISOString()}-${index}`}
                  className="flex items-center justify-between py-2.5 text-xs"
                >
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {new Intl.DateTimeFormat("en-KE", {
                      dateStyle: "medium",
                      timeZone: "Africa/Nairobi"
                    }).format(row.date)}
                    {row.checkInAt &&
                      ` · In at ${new Intl.DateTimeFormat("en-KE", {
                        timeStyle: "short",
                        timeZone: "Africa/Nairobi"
                      }).format(row.checkInAt)}`}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      row.status === "PRESENT"
                        ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : row.status === "LATE"
                        ? "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        : "bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                    }`}
                  >
                    {row.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-xs text-slate-500">No staff attendance records logged.</p>
          )}
        </section>

        {/* Director-Only Payroll Section */}
        {actor.role === "DIRECTOR" && (
          <section className="bento-card rounded-2xl border border-slate-200/90 bg-white/95 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <Wallet size={16} className="text-emerald-600 dark:text-emerald-400" />
              Payroll Disbursement History (Director Confidential)
            </h2>
            {payroll.length > 0 ? (
              <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
                {payroll.map((entry) => (
                  <div
                    key={entry.period}
                    className="flex items-center justify-between py-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{entry.period}</span>
                      <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {entry.status}
                      </span>
                    </div>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      {currency(entry.netAmount)} net
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-500">No payroll entries recorded for this staff member.</p>
            )}
          </section>
        )}
      </main>
    </PortalFrame>
  );
}
