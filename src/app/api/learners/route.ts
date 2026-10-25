import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { assertCan, canInScope } from "@/lib/permissions";
import { readSession } from "@/lib/session";
import { cookies } from "next/headers";
const learnerInput = z.object({ admissionNo: z.string().trim().min(3).max(24).regex(/^[A-Za-z0-9-]+$/), name: z.string().trim().min(2).max(120), grade: z.enum(["PP1","PP2","Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9"]), gender: z.enum(["Female","Male"]) });
async function currentRole() { const token = (await cookies()).get("mary_session")?.value; const session = token ? await readSession(token) : null; if (!session) return null; const user = await db.user.findUnique({ where: { id: session.id }, select: { id: true, role: true, suspended: true, forcePasswordChange: true } }); return user && !user.suspended && !user.forcePasswordChange ? user : null; }
export async function GET(request: Request) {
 const user = await currentRole(); if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
 try { assertCan(user.role, "learners", "view"); } catch { await db.auditEvent.create({ data: { actorId: user.id, action: "ACCESS_DENIED", entity: "Learner" } }); return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
 const { searchParams } = new URL(request.url); const parsed = z.object({ q: z.string().max(80).optional(), take: z.coerce.number().int().min(1).max(100).default(25), cursor: z.string().optional() }).safeParse(Object.fromEntries(searchParams)); if (!parsed.success) return NextResponse.json({ error: "Invalid filters." }, { status: 400 });
 const q = parsed.data.q?.trim(); let gradeScope: string[] | undefined; let linkedIds: string[] | undefined;
 if (!canInScope(user.role, "learners", "view", "school")) {
  if (canInScope(user.role, "learners", "view", "assigned")) { const assignments=await db.teacherAssignment.findMany({where:{teacherId:user.id},select:{grade:true}}); gradeScope=[...new Set(assignments.map(a=>a.grade))]; }
  else if (canInScope(user.role, "learners", "view", "learner-identity")) { /* Accountant identity-only scope is enforced by the selected fields below. */ }
  else if (canInScope(user.role,"learners","view","linked")||canInScope(user.role,"learners","view","self")) { const links=await db.guardianLink.findMany({where:{userId:user.id},select:{learnerId:true}});linkedIds=links.map(link=>link.learnerId); }
  else return NextResponse.json({ error: "Forbidden" }, { status: 403 });
 }
 const where: Prisma.LearnerWhereInput = { archivedAt: null, ...(gradeScope ? {grade:{in:gradeScope}} : {}), ...(linkedIds ? {id:{in:linkedIds}} : {}), ...(q ? { OR: [{ name: { contains: q } }, { admissionNo: { contains: q } }, { grade: { contains: q } }] } : {}) };
 const safeIdentityOnly = canInScope(user.role, "learners", "view", "learner-identity");
 const learners = await db.learner.findMany({ where, select: { id: true, admissionNo: true, name: true, grade: true, ...(!safeIdentityOnly ? {gender:true} : {}) }, orderBy: { admissionNo: "asc" }, take: parsed.data.take + 1, ...(parsed.data.cursor ? { cursor: { id: parsed.data.cursor }, skip: 1 } : {}) });
 const hasMore = learners.length > parsed.data.take; const rows = learners.slice(0, parsed.data.take); return NextResponse.json({ learners: rows, nextCursor: hasMore ? rows.at(-1)?.id : null });
}
export async function POST(request: Request) {
 const user = await currentRole(); if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
 try { assertCan(user.role, "learners", "create"); } catch { await db.auditEvent.create({ data: { actorId: user.id, action: "ACCESS_DENIED", entity: "Learner" } }); return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
 let input: unknown; try { input = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
 const parsed = learnerInput.safeParse(input); if (!parsed.success) return NextResponse.json({ error: "Check the admission number, name, grade, and gender." }, { status: 400 });
 try { const learner = await db.$transaction(async (tx) => { const row = await tx.learner.create({ data: parsed.data }); await tx.auditEvent.create({ data: { actorId: user.id, action: "LEARNER_CREATED", entity: "Learner", entityId: row.id } }); return row; }); return NextResponse.json({ learner }, { status: 201 }); }
 catch { return NextResponse.json({ error: "That admission number is already in use." }, { status: 409 }); }
}

