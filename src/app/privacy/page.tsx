import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, ArrowLeft, Lock, FileCheck, EyeOff, UserCheck } from "lucide-react";
import { ThemeStyleControls } from "@/components/design-system/theme-provider";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/60 via-slate-50 to-white px-4 py-8 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500"
          >
            <ArrowLeft size={14} />
            Back to Sign In
          </Link>
          <ThemeStyleControls compact />
        </div>

        {/* Hero Section */}
        <div className="mt-8 rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-900 via-blue-950 to-slate-950 p-6 text-white shadow-xl shadow-blue-950/10 sm:p-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white p-2 shadow-md">
                <Image
                  src="/mary-royal-logo.png"
                  alt="Mary Royal School logo"
                  width={56}
                  height={56}
                  className="h-full w-full object-contain"
                />
              </span>
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-[11px] font-bold text-blue-200 ring-1 ring-inset ring-blue-400/30">
                  <ShieldCheck size={14} className="text-blue-400" />
                  Kenya Data Protection Act Compliance
                </span>
                <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                  Data Protection &amp; Privacy Notice
                </h1>
                <p className="mt-1 text-xs text-blue-200 sm:text-sm">
                  Mary Royal School · Obunga, Kisumu, Kenya
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Grid Policy Pillars */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="bento-card rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
                <Lock size={18} />
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Strict Least Privilege</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Server-enforced access boundaries</p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Only authorized staff hold access to sensitive learner records. Teachers see only their assigned classes,
              Accountants see only fee balances and invoices without academic or disciplinary notes, and only the Secretary
              and Head Teacher may modify learner profiles.
            </p>
          </div>

          <div className="bento-card rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
                <EyeOff size={18} />
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Child Health &amp; Safety</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Restricted &amp; audited medical notes</p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Medical conditions, allergies, and emergency protocols are strictly shielded. Every access to a learner&apos;s
              health profile generates an immutable audit record logging the viewing staff member and timestamp.
            </p>
          </div>

          <div className="bento-card rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                <UserCheck size={18} />
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Parent Rights &amp; Correction</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Direct office resolution</p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Parents have full visibility into their verified children&apos;s academic assessments, attendance registers,
              and fee statements. Requests for corrections or guardian links may be lodged directly with the Head Teacher or Director.
            </p>
          </div>

          <div className="bento-card rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300">
                <FileCheck size={18} />
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Local-First Storage</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">No third-party cloud trackers</p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Mary Royal School operates a local-first system. Learner data never leaves school-authorized devices or
              safe backups, and external AI or paid tracking services are strictly prohibited.
            </p>
          </div>
        </div>

        {/* Full Notice Content */}
        <div className="glass-card mt-6 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">School Operational Guidelines</h2>
          <div className="mt-4 space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            <p>
              This school portal is designed exclusively to support learning, school administration, and parent-school
              collaboration. It holds learner identity records, daily attendance logs, CBC competency marks, guardian contact
              details, and school fee statements strictly for educational administration.
            </p>
            <p>
              Always protect your password and any downloaded receipts or term report cards. Never leave a session active on a
              shared computer. For data access inquiries or account assistance, please contact the School Office:
            </p>
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/50 dark:bg-blue-950/30">
              <p className="font-bold text-blue-900 dark:text-blue-200">Office of the Director &amp; Head Teacher</p>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                Mary Royal School · Obunga, Kisumu, Kenya · Email: office@maryroyal.ac.ke
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
