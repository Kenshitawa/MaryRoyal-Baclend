import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { canInScope } from "@/lib/permissions";
import { readSession } from "@/lib/session";
async function actor(){const token=(await cookies()).get("mary_session")?.value;const session=token?await readSession(token):null;if(!session)return null;const user=await db.user.findUnique({where:{id:session.id},select:{id:true,role:true,suspended:true,forcePasswordChange:true}});return user&&!user.suspended&&!user.forcePasswordChange?user:null;}
const itemSchema=z.object({category:z.enum(["TUITION","TRANSPORT","LUNCH","BOARDING","UNIFORM","ACTIVITY","EXAM","OTHER"]),description:z.string().trim().min(2).max(120),amount:z.number().int().positive().max(10_000_000)});
const invoiceSchema=z.object({learnerId:z.string().min(1),term:z.string().regex(/^\d{4} Term [123]$/),dueAt:z.string().datetime().optional(),items:z.array(itemSchema).min(1).max(12)});
export async function GET(){
 const user=await actor();if(!user)return NextResponse.json({error:"Unauthenticated"},{status:401});const schoolScope=canInScope(user.role,"finance","view","school");let linkedIds:string[]|undefined;if(!schoolScope){if(!canInScope(user.role,"finance","view","linked"))return NextResponse.json({error:"Forbidden"},{status:403});const links=await db.guardianLink.findMany({where:{userId:user.id},select:{learnerId:true}});linkedIds=links.map(link=>link.learnerId);}
 const invoices=await db.feeInvoice.findMany({where:linkedIds?{learnerId:{in:linkedIds}}:{},include:{learner:{select:{name:true,admissionNo:true,grade:true}},lines:true,payments:{select:{id:true,receiptNo:true,amount:true,method:true,mpesaCode:true,reference:true,status:true,voidReason:true,createdAt:true},orderBy:{createdAt:"desc"}}},orderBy:{createdAt:"desc"},take:100});
 const data=invoices.map(inv=>{const total=inv.lines.reduce((n,l)=>n+l.amount,0);const paid=inv.payments.filter(p=>p.status==="RECORDED").reduce((n,p)=>n+p.amount,0);return {...inv,total,paid,balance:total-paid-inv.creditApplied};});return NextResponse.json({invoices:data});
}
export async function POST(request:Request){
 const user=await actor();if(!user)return NextResponse.json({error:"Unauthenticated"},{status:401});if(!canInScope(user.role,"finance","create","school"))return NextResponse.json({error:"Forbidden"},{status:403});let body:unknown;try{body=await request.json();}catch{return NextResponse.json({error:"Invalid request."},{status:400});}
 const parsed=invoiceSchema.safeParse(body);if(!parsed.success)return NextResponse.json({error:"Check learner, term and at least one valid fee line."},{status:400});const learner=await db.learner.findUnique({where:{id:parsed.data.learnerId},select:{id:true,archivedAt:true}});if(!learner||learner.archivedAt)return NextResponse.json({error:"Learner not found."},{status:404});const total=parsed.data.items.reduce((n,i)=>n+i.amount,0);
 try{const invoice=await db.$transaction(async tx=>{
  const credits=await tx.feeCredit.findMany({where:{learnerId:learner.id,status:"AVAILABLE",remaining:{gt:0}},orderBy:{createdAt:"asc"}});let remaining=total;let applied=0;
  for(const credit of credits){if(remaining<=0)break;const used=Math.min(remaining,credit.remaining);remaining-=used;applied+=used;const left=credit.remaining-used;await tx.feeCredit.update({where:{id:credit.id},data:{remaining:left,status:left===0?"APPLIED":"AVAILABLE"}});}
  const created=await tx.feeInvoice.create({data:{learnerId:learner.id,term:parsed.data.term,dueAt:parsed.data.dueAt?new Date(parsed.data.dueAt):null,createdById:user.id,creditApplied:applied,lines:{create:parsed.data.items}},include:{learner:{select:{name:true,admissionNo:true,grade:true}},lines:true}});
  await tx.auditEvent.create({data:{actorId:user.id,action:"INVOICE_CREATED",entity:"FeeInvoice",entityId:created.id}});return created;
 });return NextResponse.json({invoice:{...invoice,total,paid:0,balance:total-invoice.creditApplied}},{status:201});}
 catch(error){if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==="P2002")return NextResponse.json({error:"An invoice already exists for this learner and term."},{status:409});return NextResponse.json({error:"Invoice could not be created."},{status:400});}
}
