import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { readSession } from "@/lib/session";
import { can, canInScope } from "@/lib/permissions";
import LearnerDirectory from "./directory";
import PortalFrame from "@/components/portal-frame";
export default async function LearnersPage(){const token=(await cookies()).get("mary_session")?.value;const session=token?await readSession(token):null;if(!session)redirect("/");const user=await db.user.findUnique({where:{id:session.id},select:{role:true,suspended:true,forcePasswordChange:true}});if(!user||user.suspended)redirect("/");if(user.forcePasswordChange)redirect("/change-password");if(!canInScope(user.role,"learners","view","school"))redirect("/dashboard");return <PortalFrame active="Learners"><main className="mx-auto max-w-6xl p-5 pb-28 md:p-8"><LearnerDirectory canCreate={can(user.role,"learners","create")}/></main></PortalFrame>}
