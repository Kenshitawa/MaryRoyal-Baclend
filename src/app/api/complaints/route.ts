import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { readSession } from "@/lib/session";
import { canInScope } from "@/lib/permissions";

async function actor() {
  const token = (await cookies()).get("mary_session")?.value;
  const session = token ? await readSession(token) : null;
  if (!session) return null;
  const user = await db.user.findUnique({ where: { id: session.id }, select: { id: true, name: true, role: true, suspended: true, forcePasswordChange: true } });
  return user && !user.suspended && !user.forcePasswordChange ? user : null;
}
export async function GET() {
  const user = await actor();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const scope = user.role === "DIRECTOR" || user.role === "HEAD_TEACHER" ? "school" : user.role === "PARENT" || user.role === "LEARNER" || user.role === "SECRETARY" ? "self" : "assigned";
  if (!canInScope(user.role, "complaints", "view", scope)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const where = scope === "school" ? {} : scope === "self" ? { openedById: user.id } : { assignedToId: user.id };
  const complaints = await db.complaint.findMany({ where, include: { openedBy: { select: { id: true, name: true, role: true } }, assignedTo: { select: { id: true, name: true, role: true } }, replies: { include: { author: { select: { id: true, name: true, role: true } } }, orderBy: { createdAt: "asc" } } }, orderBy: { updatedAt: "desc" }, take: 100 });
  return NextResponse.json({ complaints });
}
const schema = z.object({ subject: z.string().trim().min(3).max(120), message: z.string().trim().min(5).max(2500), recipientRole: z.enum(["TEACHER", "HEAD_TEACHER", "DEPUTY", "DIRECTOR"]), learnerId: z.string().min(1).optional(), reporterName: z.string().trim().min(2).max(120).optional(), reporterRole: z.enum(["PARENT", "LEARNER", "HEAD_TEACHER"]).optional() });
export async function POST(request: Request) {
  const user = await actor();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const scope = user.role === "PARENT" || user.role === "LEARNER" || user.role === "SECRETARY" ? "self" : "school";
  if (!canInScope(user.role, "complaints", "create", scope)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Add a subject, message and the staff member who should receive this complaint." }, { status: 400 });
  const learnerId = parsed.data.learnerId;
  let reporterName = user.name;
  let reporterRole = user.role;
  if (user.role === "PARENT" || user.role === "LEARNER") {
    if (!learnerId) return NextResponse.json({ error: "Choose the learner this complaint concerns." }, { status: 400 });
    const link = await db.guardianLink.findUnique({ where: { userId_learnerId: { userId: user.id, learnerId } }, include: { learner: { select: { grade: true, admissionStatus: true } } } });
    if (!link || link.learner.admissionStatus !== "APPROVED") return NextResponse.json({ error: "That learner is not linked to your account." }, { status: 403 });
    if (user.role === "LEARNER" && link.relation !== "Learner") return NextResponse.json({ error: "Learner account scope could not be verified." }, { status: 403 });
  } else if (user.role === "SECRETARY") {
    if (!parsed.data.reporterName || !parsed.data.reporterRole) return NextResponse.json({ error: "Enter the name and role of the person who raised this complaint." }, { status: 400 });
    reporterName = parsed.data.reporterName;
    reporterRole = parsed.data.reporterRole;
  }
  let assignedToId: string | null = null;
  if (parsed.data.recipientRole === "TEACHER") {
    if (!learnerId) return NextResponse.json({ error: "Choose the learner so the correct class teacher can be contacted." }, { status: 400 });
    const learner = await db.learner.findUnique({ where: { id: learnerId }, select: { grade: true, admissionStatus: true } });
    if (!learner || learner.admissionStatus !== "APPROVED") return NextResponse.json({ error: "Learner was not found." }, { status: 404 });
    assignedToId = (await db.classTeacherAssignment.findUnique({ where: { grade: learner.grade }, select: { teacherId: true } }))?.teacherId ?? null;
  } else {
    assignedToId = (await db.user.findFirst({ where: { role: parsed.data.recipientRole, suspended: false }, select: { id: true } }))?.id ?? null;
  }
  if (!assignedToId) return NextResponse.json({ error: "No active staff member is assigned to receive this complaint." }, { status: 409 });
  const complaint = await db.$transaction(async tx => {
    const row = await tx.complaint.create({ data: { subject: parsed.data.subject, message: parsed.data.message, audience: parsed.data.recipientRole, reporterName, reporterRole, openedById: user.id, assignedToId, learnerId } });
    await tx.complaintReply.create({ data: { complaintId: row.id, authorId: user.id, message: parsed.data.message } });
    await tx.auditEvent.create({ data: { actorId: user.id, action: "COMPLAINT_CREATED", entity: "Complaint", entityId: row.id } });
    return row;
  });
  return NextResponse.json({ complaint }, { status: 201 });
}
