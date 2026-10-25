import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PortalFrame from "@/components/portal-frame";
import { db } from "@/lib/db";
import { readSession } from "@/lib/session";
import ProfileSettings from "./profile-settings";

export default async function ProfilePage() {
  const token = (await cookies()).get("mary_session")?.value; const session = token ? await readSession(token) : null;
  if (!session) redirect("/");
  const user = await db.user.findUnique({ where: { id: session.id }, select: { id: true, name: true, email: true, role: true, avatarUrl: true, suspended: true, forcePasswordChange: true } });
  if (!user || user.suspended) redirect("/"); if (user.forcePasswordChange) redirect("/change-password");
  return <PortalFrame active="Profile"><main className="mx-auto max-w-5xl p-5 pb-28 md:p-8"><div className="mb-6"><p className="text-xs font-bold uppercase tracking-wider text-blue-700">Your account</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight">Profile & security</h1><p className="mt-2 text-sm text-slate-500">Update your photo and keep your account secure.</p></div><ProfileSettings name={user.name} email={user.email} role={user.role} initialAvatar={user.avatarUrl}/></main></PortalFrame>;
}
