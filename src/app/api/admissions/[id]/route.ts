import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { assertCanInScope } from "@/lib/permissions";
import { readSession } from "@/lib/session";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get("mary_session")?.value;
  const session = token ? await readSession(token) : null;
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const user = await db.user.findUnique({ where: { id: session.id }, select: { id: true, role: true, suspended: true, forcePasswordChange: true } });
  if (!user || user.suspended || user.forcePasswordChange) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  try { assertCanInScope(user.role, "admissions", "view", "school"); } catch { await db.auditEvent.create({ data: { actorId: user.id, action: "ACCESS_DENIED", entity: "AdmissionDraft" } }); return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
  const { id } = await params;
  const draft = await db.admissionDraft.findUnique({ where: { id }, include: { documents: { select: { id: true, category: true, originalName: true, contentType: true, sizeBytes: true, createdAt: true } }, learner: { select: { id: true, name: true, grade: true, admissionStatus: true } } } });
  if (!draft) return NextResponse.json({ error: "Admission draft not found." }, { status: 404 });
  if (user.role === "HEAD_TEACHER" && draft.status === "DRAFT") return NextResponse.json({ error: "This draft is not available for review." }, { status: 404 });
  if (user.role === "SECRETARY" && draft.createdById !== user.id) { await db.auditEvent.create({ data: { actorId: user.id, action: "ACCESS_DENIED", entity: "AdmissionDraft", entityId: id } }); return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
  let payload: unknown = {};
  try { payload = JSON.parse(draft.payload) as unknown; } catch { /* An invalid legacy payload should not break admission access. */ }
  const learnerLogin = draft.learnerId ? await db.guardianLink.findFirst({ where: { learnerId: draft.learnerId, relation: "Learner" }, select: { id: true } }) : null;
  await db.auditEvent.create({ data: { actorId: user.id, action: "ADMISSION_RECORD_VIEWED", entity: "AdmissionDraft", entityId: id } });
  if (payload && typeof payload === "object" && "health" in payload) await db.auditEvent.create({ data: { actorId: user.id, action: "HEALTH_DATA_ACCESSED", entity: "AdmissionDraft", entityId: id } });
  return NextResponse.json({ draft: { id: draft.id, admissionNo: draft.admissionNo, currentStep: draft.currentStep, status: draft.status, createdAt: draft.createdAt, updatedAt: draft.updatedAt, submittedAt: draft.submittedAt, learner: draft.learner ? { ...draft.learner, hasLearnerLogin: Boolean(learnerLogin) } : null, documents: draft.documents, payload } });
}
