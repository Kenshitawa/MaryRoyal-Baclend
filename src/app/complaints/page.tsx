import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PortalFrame from "@/components/portal-frame";
import { db } from "@/lib/db";
import { readSession } from "@/lib/session";
import { canInScope } from "@/lib/permissions";
import ComplaintsClient from "./complaints-client";

export default async function ComplaintsPage() {
  const token = (await cookies()).get("mary_session")?.value;
  const session = token ? await readSession(token) : null;
  if (!session) redirect("/");
  const user = await db.user.findUnique({ where: { id: session.id }, select: { id: true, name: true, role: true, suspended: true, forcePasswordChange: true } });
  if (!user || user.suspended) redirect("/");
  if (user.forcePasswordChange) redirect("/change-password");
  const scope = user.role === "DIRECTOR" || user.role === "HEAD_TEACHER" ? "school" : user.role === "PARENT" || user.role === "LEARNER" || user.role === "SECRETARY" ? "self" : "assigned";
  if (!canInScope(user.role, "complaints", "view", scope)) redirect("/dashboard");
  const linked = user.role === "PARENT" || user.role === "LEARNER" ? await db.guardianLink.findMany({ where: { userId: user.id, learner: { archivedAt: null, admissionStatus: "APPROVED" } }, include: { learner: { select: { id: true, name: true, grade: true } } }, orderBy: { learner: { name: "asc" } } }) : [];
  const linkedLearners = linked.filter(link => user.role !== "LEARNER" || link.relation === "Learner").map(link => link.learner);
  const learners = user.role === "SECRETARY" ? await db.learner.findMany({ where: { archivedAt: null, admissionStatus: "APPROVED" }, select: { id: true, name: true, grade: true }, orderBy: { name: "asc" }, take: 500 }) : linkedLearners;
  return <PortalFrame active="Complaints"><ComplaintsClient role={user.role} userId={user.id} userName={user.name} learners={learners}/></PortalFrame>;
}
