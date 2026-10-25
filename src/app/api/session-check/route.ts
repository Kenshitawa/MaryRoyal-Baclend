import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { readSession } from "@/lib/session";
import { db } from "@/lib/db";
export async function GET(){ const token=(await cookies()).get("mary_session")?.value;const session=token?await readSession(token):null;if(!session)return NextResponse.json({error:"Unauthenticated"},{status:401});const user=await db.user.findUnique({where:{id:session.id},select:{forcePasswordChange:true}});return NextResponse.json(user??{forcePasswordChange:true}); }
