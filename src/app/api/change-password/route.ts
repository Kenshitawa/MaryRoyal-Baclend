import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { readSession } from "@/lib/session";
const schema = z.object({ password: z.string().min(12).max(200) });
export async function POST(request: Request) {
 const token = (await cookies()).get("mary_session")?.value; const session = token ? await readSession(token) : null; if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
 let body: unknown; try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
 const parsed = schema.safeParse(body); if (!parsed.success) return NextResponse.json({ error: "Use at least 12 characters." }, { status: 400 });
 await db.user.update({ where: { id: session.id }, data: { passwordHash: await bcrypt.hash(parsed.data.password, 12), forcePasswordChange: false } });
 await db.auditEvent.create({ data: { actorId: session.id, action: "PASSWORD_CHANGED", entity: "User", entityId: session.id } });
 return NextResponse.json({ ok: true });
}
