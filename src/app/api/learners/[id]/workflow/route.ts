import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { readSession } from "@/lib/session";
import { canInScope } from "@/lib/permissions";

const actionSchema = z.object({ action: z.literal("approve") });
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get("mary_session")?.value;
  const session = token ? await readSession(token) : null;
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const actor = await db.user.findUnique({ where: { id: session.id }, select: { id: true, role: true, suspended: true, forcePasswordChange: true } });
  if (!actor || actor.suspended || actor.forcePasswordChange) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  if (!canInScope(actor.role, "learners", "approve", "school")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (!actionSchema.safeParse(body).success) return NextResponse.json({ error: "Invalid approval action." }, { status: 400 });
  const { id } = await params;
  const learner = await db.learner.findUnique({ where: { id }, select: { id: true, admissionStatus: true } });
  if (!learner) return NextResponse.json({ error: "Admission not found." }, { status: 404 });
  if (learner.admissionStatus !== "PENDING") return NextResponse.json({ error: "This admission has already been reviewed." }, { status: 409 });
  const updated = await db.$transaction(async tx => {
    const row = await tx.learner.update({ where: { id }, data: { admissionStatus: "APPROVED", admissionApprovedById: actor.id, admissionApprovedAt: new Date() } });
    const learnerAccount = await tx.guardianLink.findFirst({ where: { learnerId: id, relation: "Learner" }, select: { userId: true } });
    if (learnerAccount) {
      await tx.user.update({ where: { id: learnerAccount.userId }, data: { suspended: false } });
      await tx.auditEvent.create({ data: { actorId: actor.id, action: "LEARNER_ACCOUNT_ACTIVATED", entity: "User", entityId: learnerAccount.userId } });
    }
    await tx.auditEvent.create({ data: { actorId: actor.id, action: "ADMISSION_APPROVED", entity: "Learner", entityId: row.id } });
    return row;
  });
  return NextResponse.json({ learner: updated });
}
