import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  ClipboardList,
  FilePlus2,
  Search,
  FileCheck2,
  Clock,
  CheckCircle2,
  Filter
} from "lucide-react";
import PortalFrame from "@/components/portal-frame";
import { db } from "@/lib/db";
import { canInScope } from "@/lib/permissions";
import { readSession } from "@/lib/session";
import { LearnerLink } from "@/components/learner-link";

export default async function AdmissionsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const token = (await cookies()).get("mary_session")?.value;
  const session = token ? await readSession(token) : null;
  if (!session) redirect("/");

  const user = await db.user.findUnique({
    where: { id: session.id },
    select: { id: true, role: true, suspended: true, forcePasswordChange: true }
  });
  if (!user || user.suspended) redirect("/");
  if (user.forcePasswordChange) redirect("/change-password");
  if (!canInScope(user.role, "admissions", "view", "school")) redirect("/dashboard");

  const params = await searchParams;
  const q = params.q?.trim().slice(0, 80) ?? "";
  const status = ["DRAFT", "SUBMITTED", "ENROLLED"].includes(params.status ?? "")
    ? params.status
    : undefined;

  const admissions = await db.admissionDraft.findMany({
    where: {
      ...(user.role === "SECRETARY" ? { createdById: user.id } : {}),
      ...(user.role === "HEAD_TEACHER"
        ? { status: { in: ["SUBMITTED", "ENROLLED"] } }
        : status
        ? { status }
        : {}),
      ...(q
        ? {
            OR: [
              { admissionNo: { contains: q } },
              { learner: { name: { contains: q } } }
            ]
          }
        : {})
    },
    select: {
      id: true,
      admissionNo: true,
      status: true,
      currentStep: true,
      updatedAt: true,
      submittedAt: true,
      learner: { select: { id: true, name: true, grade: true } },
      documents: { select: { category: true } }
    },
    orderBy: { updatedAt: "desc" },
    take: 100
  });

  const canCreate = canInScope(user.role, "admissions", "create", "school");
  const counts = {
    draft: admissions.filter((row) => row.status === "DRAFT").length,
    submitted: admissions.filter((row) => row.status === "SUBMITTED").length,
    enrolled: admissions.filter((row) => row.status === "ENROLLED").length
  };

  return (
    <PortalFrame active="Admissions">
      <main className="mx-auto max-w-7xl space-y-6 p-4 pb-28 sm:p-6 lg:p-8">
        {/* Header Hero */}
        <div className="bento-card overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 p-6 text-white shadow-xl shadow-blue-950/10 sm:p-8 dark:border-blue-900/50">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-400/20 px-3 py-1 text-xs font-bold text-blue-200 ring-1 ring-inset ring-blue-300/30">
                <FileCheck2 size={14} className="text-blue-300" />
                Admissions Desk · Mary Royal School
              </span>
              <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                Learner Admissions &amp; Enrollment
              </h1>
              <p className="mt-1 text-xs text-blue-100 sm:text-sm">
                7-step guided admission packets, guardian verification, document vaults, and official admission letters.
              </p>
            </div>

            {canCreate && (
              <Link
                href="/admissions/new"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold text-blue-900 shadow-lg shadow-blue-950/20 transition hover:bg-blue-50"
              >
                <FilePlus2 size={16} />
                Start New Admission
              </Link>
            )}
          </div>
        </div>

        {/* Bento Metric Cards */}
        <section className="grid gap-4 sm:grid-cols-3" aria-label="Admission counts">
          <div className="bento-card flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Incomplete Drafts</p>
              <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{counts.draft}</p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <Clock size={18} />
            </span>
          </div>

          <div className="bento-card flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Submitted for Approval</p>
              <p className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">{counts.submitted}</p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <ClipboardList size={18} />
            </span>
          </div>

          <div className="bento-card flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Enrolled Learners</p>
              <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">{counts.enrolled}</p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 size={18} />
            </span>
          </div>
        </section>

        {/* Filter Controls */}
        <form className="bento-card flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-end dark:border-slate-800 dark:bg-slate-900/90">
          <label className="flex-1 text-xs font-bold text-slate-700 dark:text-slate-300">
            Search by learner or admission number
            <div className="relative mt-1.5">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                name="q"
                defaultValue={q}
                maxLength={80}
                placeholder="e.g. MR-12 or Achieng"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-xs font-medium text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
              />
            </div>
          </label>

          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Status
            <select
              name="status"
              defaultValue={status ?? ""}
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-medium text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 sm:w-52 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
            >
              <option value="">All statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="ENROLLED">Enrolled</option>
            </select>
          </label>

          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-800"
          >
            <Filter size={14} />
            Apply Filters
          </button>
        </form>

        {/* Admissions Table List */}
        <section className="bento-card overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
          <div className="hidden grid-cols-[1.1fr_1.5fr_.8fr_.7fr_1fr] gap-4 border-b border-slate-100 bg-slate-50/80 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 sm:grid dark:border-slate-800 dark:bg-slate-800/50">
            <span>Admission</span>
            <span>Learner</span>
            <span>Documents</span>
            <span>Updated</span>
            <span>Status</span>
          </div>

          {admissions.length ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {admissions.map((record) => (
                <div
                  key={record.id}
                  className="grid gap-2 px-4 py-4 transition hover:bg-blue-50/40 sm:grid-cols-[1.1fr_1.5fr_.8fr_.7fr_1fr] sm:items-center sm:gap-4 sm:px-5 dark:hover:bg-blue-950/20"
                >
                  <div>
                    {record.learner ? (
                      <LearnerLink id={record.learner.id} admissionNo={record.admissionNo} />
                    ) : (
                      <Link
                        href={`/admissions/${record.id}`}
                        className="font-mono text-xs font-bold text-blue-700 hover:underline dark:text-blue-400"
                      >
                        {record.admissionNo}
                      </Link>
                    )}
                  </div>

                  <div>
                    {record.learner ? (
                      <LearnerLink id={record.learner.id} name={record.learner.name} />
                    ) : (
                      <Link
                        href={`/admissions/${record.id}`}
                        className="text-xs font-bold text-slate-900 hover:underline dark:text-white"
                      >
                        Admission draft
                      </Link>
                    )}
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      {record.learner?.grade ?? `Step ${record.currentStep} of 7`}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {record.documents.length} document{record.documents.length === 1 ? "" : "s"}
                  </p>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Intl.DateTimeFormat("en-KE", {
                      dateStyle: "medium",
                      timeZone: "Africa/Nairobi"
                    }).format(record.updatedAt)}
                  </p>

                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                        record.status === "DRAFT"
                          ? "bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                          : record.status === "SUBMITTED"
                          ? "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      }`}
                    >
                      {record.status}
                    </span>

                    <Link
                      href={`/admissions/${record.id}`}
                      className="inline-flex items-center text-xs font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-400"
                      aria-label={`Open admission ${record.admissionNo}`}
                    >
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-14 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <ClipboardList size={26} />
              </span>
              <h2 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                {q || status ? "No admissions match these filters" : "No admission records yet"}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-xs text-slate-500 dark:text-slate-400">
                {q || status
                  ? "Try a different search term or clear the status filter."
                  : "Start an admission draft with learner identity, guardian details, and school documents."}
              </p>
              {canCreate && !q && (
                <Link
                  href="/admissions/new"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-700/20 hover:bg-blue-800"
                >
                  <FilePlus2 size={16} /> Start the first admission
                </Link>
              )}
            </div>
          )}
        </section>
      </main>
    </PortalFrame>
  );
}
