import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { readSession } from "@/lib/session";
import { can, canInScope } from "@/lib/permissions";
import PortalFrame from "@/components/portal-frame";
import { cbcLevel } from "@/lib/grading";
import { Edit3, FileDown, ShieldAlert, History, Clock } from "lucide-react";

const money = (amount: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(amount);

const date = (value: Date | null) =>
  value ? new Intl.DateTimeFormat("en-KE", { dateStyle: "medium", timeZone: "Africa/Nairobi" }).format(value) : "Not recorded";

const dateTime = (value: Date | null) =>
  value ? new Intl.DateTimeFormat("en-KE", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Nairobi" }).format(value) : "Not recorded";

function Card({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 border-b border-slate-100 py-2.5 text-sm last:border-0 dark:border-slate-800">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-800 dark:text-slate-200">{value || "—"}</span>
    </div>
  );
}

export default async function LearnerProfilePage({ params }: { params: Promise<{ id: string }> }) {
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

  const learner = await db.learner.findUnique({
    where: { id },
    include: {
      profile: {
        select: {
          dateOfBirth: true,
          nationality: true,
          upiNumber: true,
          stream: true,
          admissionDate: true,
          previousSchool: true,
          previousClass: true,
          religion: true,
          languagesSpoken: true,
          county: true,
          subCounty: true,
          ward: true,
          village: true,
          physicalAddress: true,
          landmark: true,
          distanceToSchoolKm: true,
          transportMeans: true,
          feePayer: true,
          updatedAt: true,
          guardians: { orderBy: [{ primaryContact: "desc" }, { createdAt: "asc" }] },
          emergencyContacts: true,
          pickupPersons: true
        }
      },
      admissionDraft: {
        select: {
          id: true,
          createdById: true,
          submittedAt: true,
          documents: { where: { category: "PASSPORT_PHOTO" }, take: 1, select: { id: true } }
        }
      }
    }
  });

  if (!learner || learner.archivedAt) notFound();

  let allowed = canInScope(actor.role, "learners", "view", "school");
  let assignedSubjects: string[] = [];
  if (!allowed && canInScope(actor.role, "learners", "view", "assigned")) {
    const assignments = await db.teacherAssignment.findMany({ where: { teacherId: actor.id, grade: learner.grade }, select: { subject: true } });
    const classTeacher = await db.classTeacherAssignment.findFirst({ where: { teacherId: actor.id, grade: learner.grade }, select: { id: true } });
    allowed = assignments.length > 0 || !!classTeacher;
    assignedSubjects = assignments.map((assignment) => assignment.subject);
  }

  if (!allowed && (canInScope(actor.role, "learners", "view", "linked") || canInScope(actor.role, "learners", "view", "self"))) {
    allowed = !!(await db.guardianLink.findFirst({
      where: {
        userId: actor.id,
        learnerId: learner.id,
        relation: canInScope(actor.role, "learners", "view", "self") ? "Learner" : undefined
      },
      select: { id: true }
    }));
  }

  const identityOnly = canInScope(actor.role, "learners", "view", "learner-identity");
  allowed ||= identityOnly;

  if (!allowed || (learner.admissionStatus !== "APPROVED" && !canInScope(actor.role, "learners", "view", "school"))) {
    await db.auditEvent.create({ data: { actorId: actor.id, action: "ACCESS_DENIED", entity: "LearnerProfile", entityId: learner.id } });
    redirect("/dashboard");
  }

  // Edit rights strictly for Secretary and Head Teacher
  const canEditLearner = can(actor.role, "learners", "update");

  const healthAllowed =
    canInScope(actor.role, "learners", "view", "school") ||
    (actor.role === "TEACHER" &&
      !!(await db.classTeacherAssignment.findFirst({ where: { teacherId: actor.id, grade: learner.grade }, select: { id: true } })));

  const healthRecord = healthAllowed
    ? await db.learnerProfile.findUnique({
        where: { learnerId: learner.id },
        select: {
          knownConditions: true,
          allergies: true,
          currentMedication: true,
          specialNeeds: true,
          bloodGroup: true,
          doctorOrHospital: true,
          immunizationStatus: true,
          healthInsurance: true
        }
      })
    : null;

  if (healthAllowed) {
    await db.auditEvent.create({
      data: { actorId: actor.id, action: "HEALTH_PROFILE_ACCESSED", entity: "LearnerProfile", entityId: learner.id }
    });
  }

  const fullProfileScope = canInScope(actor.role, "learners", "view", "school");
  const admissionDocuments =
    learner.admissionDraft && fullProfileScope
      ? await db.admissionDocument.findMany({
          where: { draftId: learner.admissionDraft.id },
          select: { id: true, category: true, originalName: true, contentType: true, sizeBytes: true }
        })
      : [];

  const disciplineAllowed =
    canInScope(actor.role, "discipline", "view", "school") ||
    (actor.role === "TEACHER" && allowed) ||
    (actor.role === "PARENT" && canInScope(actor.role, "discipline", "view", "linked"));

  const academicAllowed =
    !identityOnly &&
    (canInScope(actor.role, "assessments", "view", "school") ||
      canInScope(actor.role, "assessments", "view", "assigned") ||
      canInScope(actor.role, "assessments", "view", "linked") ||
      canInScope(actor.role, "assessments", "view", "self"));

  const feeAllowed = canInScope(actor.role, "finance", "view", "school") || canInScope(actor.role, "finance", "view", "linked");

  const [attendance, assessments, invoices, learnerLogin, discipline, editHistoryEvents] = await Promise.all([
    !identityOnly
      ? db.attendance.findMany({ where: { learnerId: learner.id }, orderBy: { date: "desc" }, take: 60, select: { date: true, status: true } })
      : [],
    academicAllowed
      ? db.assessment.findMany({
          where: {
            learnerId: learner.id,
            status: { in: ["RELEASED", ...(canInScope(actor.role, "assessments", "view", "school") ? ["DRAFT", "SUBMITTED", "APPROVED"] : [])] },
            ...(actor.role === "TEACHER" ? { subject: { in: assignedSubjects } } : {})
          },
          orderBy: [{ term: "desc" }, { subject: "asc" }],
          select: { subject: true, score: true, term: true, strand: true, competency: true, comment: true, status: true, createdAt: true }
        })
      : [],
    feeAllowed
      ? db.feeInvoice.findMany({
          where: { learnerId: learner.id },
          include: { lines: true, payments: { where: { status: "RECORDED" }, select: { amount: true } } },
          orderBy: { createdAt: "desc" }
        })
      : [],
    !identityOnly
      ? db.guardianLink.findFirst({ where: { learnerId: learner.id, relation: "Learner" }, select: { userId: true } })
      : null,
    disciplineAllowed
      ? db.disciplineIncident.findMany({
          where: { learnerId: learner.id, ...(actor.role === "PARENT" ? { parentNotifiedAt: { not: null } } : {}) },
          orderBy: { incidentAt: "desc" },
          take: 25,
          select: {
            id: true,
            incidentAt: true,
            category: true,
            severity: true,
            summary: true,
            actionTaken: true,
            status: true,
            parentNotifiedAt: true,
            followUpAt: true,
            recordedBy: { select: { name: true } }
          }
        })
      : [],
    // Edit history: audit events for changes made to this learner
    canInScope(actor.role, "learners", "view", "school")
      ? db.auditEvent.findMany({
          where: {
            entity: "Learner",
            entityId: learner.id,
            action: { in: ["LEARNER_PROFILE_UPDATED", "ADMISSION_RECORD_VIEWED", "HEALTH_PROFILE_ACCESSED"] }
          },
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { actor: { select: { name: true, role: true } } }
        })
      : []
  ]);

  const receiptsAllowed = canInScope(actor.role, "payments", "view", "school") || canInScope(actor.role, "payments", "view", "linked");
  const receipts =
    feeAllowed && receiptsAllowed
      ? await db.feePayment.findMany({
          where: { status: { in: ["RECORDED", "VOID"] }, invoice: { learnerId: learner.id } },
          orderBy: { createdAt: "desc" },
          take: 50,
          select: { id: true, receiptNo: true, amount: true, status: true, createdAt: true, invoice: { select: { term: true } } }
        })
      : [];

  const attendanceCounts = attendance.reduce((counts, row) => {
    const key = row.status.toLowerCase();
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  const invoiceRows = invoices.map((invoice) => {
    const total = invoice.lines.reduce((sum, line) => sum + line.amount, 0) - invoice.creditApplied;
    const paid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
    return { invoice, total, paid, balance: Math.max(0, total - paid) };
  });

  const outstanding = invoiceRows.reduce((sum, row) => sum + row.balance, 0);
  const passportPhoto = learner.admissionDraft?.documents[0];
  const age = learner.profile?.dateOfBirth
    ? Math.max(0, Math.floor((Date.now() - learner.profile.dateOfBirth.getTime()) / 31_557_600_000))
    : null;

  const assessmentTrends = [...new Set(assessments.map((item) => item.subject))]
    .map((subject) => ({
      subject,
      results: assessments.filter((item) => item.subject === subject && item.status === "RELEASED").sort((a, b) => a.term.localeCompare(b.term))
    }))
    .filter((row) => row.results.length > 0);

  const timeline = [
    ...(learner.admissionDraft?.submittedAt ? [{ at: learner.admissionDraft.submittedAt, label: "Admission submitted", detail: learner.admissionStatus }] : []),
    ...attendance.slice(0, 8).map((row) => ({ at: row.date, label: "Attendance recorded", detail: row.status })),
    ...assessments
      .filter((row) => row.status === "RELEASED")
      .slice(0, 8)
      .map((row) => ({ at: row.createdAt, label: "Result released", detail: `${row.subject} · ${row.term} · ${cbcLevel(row.score)}` })),
    ...invoices
      .slice(0, 5)
      .map((invoice) => ({ at: invoice.createdAt, label: "Fee invoice issued", detail: `${invoice.term} · ${money(invoice.lines.reduce((sum, line) => sum + line.amount, 0))}` })),
    ...discipline.slice(0, 5).map((row) => ({ at: row.incidentAt, label: "Discipline follow-up", detail: row.summary }))
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 20);

  const showGuardians = !identityOnly || actor.role === "ACCOUNTANT";
  const showResidence = fullProfileScope;
  const showEmergency = fullProfileScope || actor.role === "PARENT";
  const relationTitle = actor.role === "PARENT" ? "My child" : actor.role === "LEARNER" ? "My profile" : "Learner profile";

  // Master Brief R5 Tabs:
  // "tabs for biography, parents, residence, health, documents, attendance, academics, fees and history"
  const profileTabs: [string, string, boolean][] = [
    ["biography", "Biography", !identityOnly],
    ["guardians", "Parents & Guardians", showGuardians],
    ["residence", "Residence", showResidence],
    ["health", "Health", healthAllowed],
    ["documents", "Documents", !!learner.admissionDraft && fullProfileScope],
    ["attendance", "Attendance", !identityOnly],
    ["academics", "Academics", academicAllowed],
    ["fees", "Fees", feeAllowed],
    ["discipline", "Discipline", disciplineAllowed],
    ["history", "History & Audits", fullProfileScope]
  ].filter((tab) => tab[2]) as [string, string, boolean][];

  return (
    <PortalFrame active="Learners">
      <main className="mx-auto max-w-7xl space-y-6 p-4 pb-28 sm:p-6 md:p-8">
        {/* Hero Header with Photo, Name, Admission No, Grade */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a2352] via-[#123e85] to-[#1e54be] p-6 text-white shadow-xl sm:p-8">
          <div aria-hidden="true" className="absolute -right-16 -top-16 h-64 w-64 rounded-full border-[32px] border-white/5" />
          <div aria-hidden="true" className="absolute -bottom-24 right-48 h-56 w-56 rounded-full bg-blue-400/10 blur-2xl" />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              {passportPhoto ? (
                <Image
                  src={`/api/learners/${learner.id}/photo`}
                  width={96}
                  height={96}
                  unoptimized
                  alt={`Passport photo of ${learner.name}`}
                  className="h-24 w-24 rounded-2xl border-2 border-white/40 bg-white object-cover shadow-lg"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="grid h-24 w-24 place-items-center rounded-2xl border-2 border-white/30 bg-white/10 text-3xl font-black"
                >
                  {learner.name
                    .split(/\s+/)
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
              )}
              <div>
                <Link
                  href={actor.role === "PARENT" ? "/portal" : actor.role === "LEARNER" ? "/learning" : "/learners"}
                  className="mb-2 inline-flex items-center text-xs font-semibold text-blue-200 transition hover:text-white"
                >
                  ← {actor.role === "PARENT" ? "My children" : actor.role === "LEARNER" ? "My learning" : "Learner Register"}
                </Link>
                <p className="text-[11px] font-bold uppercase tracking-[.18em] text-blue-200">{relationTitle}</p>
                <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-4xl">{learner.name}</h1>
                <p className="mt-1.5 text-xs text-blue-100 sm:text-sm">
                  <span className="font-mono font-bold">{learner.admissionNo}</span> · {learner.grade}
                  {learner.profile?.stream ? ` · Stream ${learner.profile.stream}` : ""} ·{" "}
                  <span className="rounded-md bg-white/15 px-2 py-0.5 font-semibold text-white">
                    {learner.admissionStatus.toLowerCase()}
                  </span>
                  {age !== null ? ` · Age ${age}` : ""}
                </p>
              </div>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Only Secretary & Head Teacher see the Edit Profile button */}
              {canEditLearner && (
                <Link
                  href={`/learners/${learner.id}/edit`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/40 bg-white/20 px-4 py-2.5 text-xs font-bold text-white shadow-sm backdrop-blur transition hover:bg-white/30"
                >
                  <Edit3 size={14} /> Edit Profile
                </Link>
              )}

              {/* Download Admission Form PDF */}
              {learner.admissionDraft && canInScope(actor.role, "admissions", "view", "school") && (
                <Link
                  href={`/api/admissions/${learner.admissionDraft.id}/form`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-blue-800 shadow-sm transition hover:bg-blue-50"
                >
                  <FileDown size={14} /> Download Admission PDF
                </Link>
              )}
            </div>
          </div>

          {identityOnly && (
            <p className="mt-4 max-w-2xl text-xs text-blue-100/90">
              Finance View: Limited to basic learner identity and fee summary.
            </p>
          )}
        </div>

        {/* Section Navigation Tabs */}
        <nav
          aria-label="Learner profile sections"
          className="sticky top-16 z-20 -mx-1 flex gap-1.5 overflow-x-auto rounded-2xl border border-slate-200/90 bg-white/95 p-2 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/95"
        >
          {profileTabs.map(([target, label]) => (
            <a
              key={target}
              href={`#${target}`}
              className="shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-blue-50 hover:text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Class & Stream</p>
            <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">
              {learner.grade} {learner.profile?.stream ? `(${learner.profile.stream})` : ""}
            </p>
          </div>
          {!identityOnly && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Attendance</p>
              <p className="mt-1 text-lg font-black text-emerald-600 dark:text-emerald-400">
                {attendanceCounts.present ?? 0} Present
              </p>
              <p className="text-[10px] text-slate-500">{attendanceCounts.absent ?? 0} Absent · {attendanceCounts.late ?? 0} Late</p>
            </div>
          )}
          {academicAllowed && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Released Marks</p>
              <p className="mt-1 text-lg font-black text-blue-700 dark:text-blue-400">
                {assessments.filter((item) => item.status === "RELEASED").length} Subjects
              </p>
            </div>
          )}
          {feeAllowed && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Outstanding Balance</p>
              <p className={`mt-1 text-lg font-black ${outstanding > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600"}`}>
                {money(outstanding)}
              </p>
            </div>
          )}
        </div>

        {/* Tab Cards */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Tab 1: Biography */}
          {!identityOnly && (
            <Card id="biography" title="1. Biography & School Identity">
              <Row label="Full Name" value={learner.name} />
              <Row label="Admission Number" value={<span className="font-mono font-bold">{learner.admissionNo}</span>} />
              <Row label="Class / Grade" value={learner.grade} />
              <Row label="Stream" value={learner.profile?.stream} />
              <Row label="Gender" value={learner.gender} />
              <Row label="Date of Birth" value={date(learner.profile?.dateOfBirth ?? null)} />
              <Row label="Age" value={age !== null ? `${age} years` : null} />
              <Row label="Nationality" value={learner.profile?.nationality} />
              <Row label="UPI / NEMIS" value={learner.profile?.upiNumber} />
              <Row label="Admission Date" value={date(learner.profile?.admissionDate ?? null)} />
              <Row label="Previous School" value={learner.profile?.previousSchool} />
              <Row label="Previous Class" value={learner.profile?.previousClass} />
              <Row label="Languages Spoken" value={learner.profile?.languagesSpoken} />
              <Row label="Religion" value={learner.profile?.religion} />
            </Card>
          )}

          {/* Tab 2: Parents & Guardians */}
          {showGuardians && (
            <Card id="guardians" title="2. Parents & Guardians">
              {learner.profile?.guardians.length ? (
                learner.profile.guardians.map((guardian) => (
                  <div key={guardian.id} className="border-b border-slate-100 py-3 last:border-0 dark:border-slate-800">
                    <p className="font-bold text-slate-900 dark:text-white">
                      {guardian.fullName}{" "}
                      <span className="text-xs font-normal text-slate-500">
                        · {guardian.relationship}
                        {guardian.primaryContact ? " (Primary Contact)" : ""}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                      Phone: <span className="font-semibold text-blue-700 dark:text-blue-400">{guardian.phone}</span>
                      {guardian.alternatePhone ? ` · Alt: ${guardian.alternatePhone}` : ""}
                      {guardian.email ? ` · ${guardian.email}` : ""}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">No guardian contacts recorded.</p>
              )}

              {showEmergency && (
                <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Emergency & Authorized Pick-Up</h3>
                  {learner.profile?.emergencyContacts.map((c) => (
                    <Row key={c.id} label={`Emergency · ${c.relationship}`} value={`${c.fullName} (${c.phone})`} />
                  ))}
                  {learner.profile?.pickupPersons.map((p) => (
                    <Row key={p.id} label={`Pick-Up · ${p.relationship}`} value={`${p.fullName} (${p.phone})`} />
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Tab 3: Residence */}
          {showResidence && (
            <Card id="residence" title="3. Residence & Location">
              <Row label="County" value={learner.profile?.county} />
              <Row label="Sub-County" value={learner.profile?.subCounty} />
              <Row label="Ward / Estate" value={learner.profile?.ward} />
              <Row label="Village / Area" value={learner.profile?.village} />
              <Row label="Physical Address" value={learner.profile?.physicalAddress} />
              <Row label="Landmark" value={learner.profile?.landmark} />
              <Row label="Distance to School" value={learner.profile?.distanceToSchoolKm ? `${learner.profile.distanceToSchoolKm} km` : null} />
              <Row label="Means of Transport" value={learner.profile?.transportMeans} />
            </Card>
          )}

          {/* Tab 4: Health (Restricted) */}
          {healthAllowed && (
            <Card id="health" title="4. Restricted Health Information">
              <div className="mb-3 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                <ShieldAlert size={16} className="shrink-0 text-amber-700" />
                <span>Confidential medical data. Viewing this section appends an immutable record to the audit trail.</span>
              </div>
              <Row label="Blood Group" value={healthRecord?.bloodGroup} />
              <Row label="Known Conditions" value={healthRecord?.knownConditions} />
              <Row label="Allergies" value={healthRecord?.allergies} />
              <Row label="Current Medication" value={healthRecord?.currentMedication} />
              <Row label="Special Needs" value={healthRecord?.specialNeeds} />
              <Row label="Preferred Clinic / Doctor" value={healthRecord?.doctorOrHospital} />
              <Row label="Immunization Status" value={healthRecord?.immunizationStatus} />
              <Row label="Health Insurance (SHA / NHIF)" value={healthRecord?.healthInsurance} />
            </Card>
          )}

          {/* Tab 5: Documents */}
          {!identityOnly && learner.admissionDraft && fullProfileScope && (
            <Card id="documents" title="5. Documents & Uploads">
              {admissionDocuments.length ? (
                admissionDocuments.map((doc) => (
                  <a
                    key={doc.id}
                    href={`/api/admissions/${learner.admissionDraft!.id}/documents/${doc.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mb-2 flex items-center justify-between rounded-xl border border-slate-100 p-3 text-xs transition hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-800 dark:hover:border-slate-700"
                  >
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{doc.category.replaceAll("_", " ")}</span>
                      <span className="ml-2 font-mono text-[10px] text-slate-400">{doc.originalName}</span>
                    </div>
                    <span className="font-bold text-blue-700 dark:text-blue-400">Download →</span>
                  </a>
                ))
              ) : (
                <p className="text-xs text-slate-500">No supporting documents uploaded.</p>
              )}
            </Card>
          )}

          {/* Tab 6: Attendance */}
          {!identityOnly && (
            <Card id="attendance" title="6. Attendance Summary & History">
              <div className="mb-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <span className="text-[11px] font-semibold uppercase">Present</span>
                  <strong className="block text-xl font-black">{attendanceCounts.present ?? 0}</strong>
                </div>
                <div className="rounded-xl bg-rose-50 p-3 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
                  <span className="text-[11px] font-semibold uppercase">Absent</span>
                  <strong className="block text-xl font-black">{attendanceCounts.absent ?? 0}</strong>
                </div>
                <div className="rounded-xl bg-amber-50 p-3 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                  <span className="text-[11px] font-semibold uppercase">Late</span>
                  <strong className="block text-xl font-black">{attendanceCounts.late ?? 0}</strong>
                </div>
              </div>
              {attendance.slice(0, 10).map((row, idx) => (
                <Row key={`${row.date.toISOString()}-${idx}`} label={date(row.date)} value={row.status} />
              ))}
            </Card>
          )}

          {/* Tab 7: Academics & CBC Performance */}
          {academicAllowed && (
            <Card id="academics" title="7. CBC Assessment & Progress">
              {assessmentTrends.map(({ subject, results }) => {
                const average = Math.round(results.reduce((sum, res) => sum + res.score, 0) / results.length);
                return (
                  <div key={subject} className="mb-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 dark:text-white">{subject}</h3>
                      <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300">
                        Avg: {average}% · {cbcLevel(average)}
                      </span>
                    </div>
                    <div className="flex h-20 items-end gap-2 border-b border-slate-200 pb-1 dark:border-slate-700">
                      {results.map((res, i) => (
                        <div key={`${res.term}-${i}`} className="flex h-full flex-1 flex-col justify-end">
                          <div
                            title={`${res.term}: ${res.score}%`}
                            className="mx-auto w-full max-w-10 rounded-t-md bg-blue-600 dark:bg-blue-500"
                            style={{ height: `${Math.max(10, Math.min(100, res.score))}%` }}
                          />
                          <span className="mt-1 truncate text-center text-[9px] text-slate-500">{res.term.slice(5)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {assessments.length ? (
                assessments.map((item, idx) => (
                  <div key={`${item.term}-${item.subject}-${idx}`} className="border-b border-slate-100 py-3 last:border-0 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        {item.subject} <span className="text-xs font-normal text-slate-500">· {item.term}</span>
                      </p>
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        {item.score}% ({cbcLevel(item.score)})
                      </span>
                    </div>
                    {item.strand && (
                      <p className="mt-1 text-xs text-slate-500">
                        Strand: {item.strand} {item.competency ? `· ${item.competency}` : ""}
                      </p>
                    )}
                    {item.comment && <p className="mt-1 text-xs italic text-slate-600 dark:text-slate-400">&ldquo;{item.comment}&rdquo;</p>}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">No released assessment results found.</p>
              )}
            </Card>
          )}

          {/* Tab 8: Fees */}
          {feeAllowed && (
            <Card id="fees" title="8. Fees & Invoices">
              <div className="mb-4 rounded-xl bg-blue-50/70 p-4 dark:bg-blue-950/40">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Outstanding</p>
                <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{money(outstanding)}</p>
              </div>

              {invoiceRows.length ? (
                invoiceRows.map(({ invoice, total, paid, balance }) => (
                  <div key={invoice.id} className="border-b border-slate-100 py-3 last:border-0 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{invoice.term}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          balance === 0
                            ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : paid > 0
                            ? "bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        }`}
                      >
                        {balance === 0 ? "Fully Paid" : paid > 0 ? "Partially Paid" : "Unpaid"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Billed {money(total)} · Paid {money(paid)} · Balance {money(balance)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">No fee invoices recorded.</p>
              )}

              {receiptsAllowed && (
                <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Confirmed Receipts</h3>
                  {receipts.length ? (
                    receipts.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between border-b border-slate-100 py-2 text-xs last:border-0 dark:border-slate-800"
                      >
                        <div>
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{payment.receiptNo}</span>
                          <span className="ml-2 text-slate-500">{payment.invoice.term} · {money(payment.amount)}</span>
                        </div>
                        <Link href={`/receipts/${payment.id}`} className="font-bold text-blue-700 hover:underline dark:text-blue-400">
                          View Receipt →
                        </Link>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">No confirmed receipts available.</p>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* Tab 9: Edit History & Audits */}
          {fullProfileScope && (
            <Card id="history" title="9. Edit History & Profile Audits">
              <div className="mb-3 flex items-center gap-1.5 text-xs text-slate-500">
                <History size={14} className="text-blue-600" />
                <span>Immutable audit trail of profile edits and accesses (Secretary, Head Teacher & Director only).</span>
              </div>

              {editHistoryEvents.length ? (
                <div className="space-y-3">
                  {editHistoryEvents.map((evt) => (
                    <div key={evt.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {evt.action.replaceAll("_", " ")}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">{dateTime(evt.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Actor: <strong className="text-slate-700 dark:text-slate-300">{evt.actor?.name ?? "System"}</strong> ({evt.actor?.role ?? "UNKNOWN"})
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No edit events recorded yet.</p>
              )}
            </Card>
          )}
        </div>
      </main>
    </PortalFrame>
  );
}
