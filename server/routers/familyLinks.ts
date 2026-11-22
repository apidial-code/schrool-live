import { randomUUID } from "node:crypto";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { router, adminProcedure } from "../_core/trpc.js";
import { getDb } from "../db.js";
import { getSignInOrigin } from "../_core/signInEmail.js";
import { enrollments, parentStudentLinks, studentFileEntries, users } from "../../drizzle/schema.js";
import { sydneyDate } from "../../shared/standardSupport.js";
const id=z.number().int().positive().safe();
const records=adminProcedure.use(async({ctx,next})=>{
  ctx.res.setHeader("Cache-Control","no-store");
  if(ctx.user.accountStatus!=="active")throw new TRPCError({code:"FORBIDDEN",message:"Active Admin required."});
  const db=await getDb();if(!db)throw new TRPCError({code:"INTERNAL_SERVER_ERROR",message:"Family links unavailable."});
  return next({ctx:{...ctx,db}});
});
const change=records.use(({ctx,next})=>{
  if(ctx.req.headers.origin!==getSignInOrigin())throw new TRPCError({code:"FORBIDDEN",message:"Invalid request origin."});return next();
});
export const familyLinksRouter=router({
  get:records.input(z.object({enrollmentId:id}).strict()).query(async({ctx,input})=>{
    const [row]=await ctx.db.select({studentId:enrollments.studentId,parentId:enrollments.parentId,parentEmail:enrollments.parentEmail})
      .from(enrollments).where(eq(enrollments.id,input.enrollmentId)).limit(1);
    if(!row)throw new TRPCError({code:"NOT_FOUND",message:"Enrolment unavailable."});
    const [parent]=row.parentId?await ctx.db.select({id:users.id,name:users.name,email:users.email,role:users.role,accountStatus:users.accountStatus})
      .from(users).where(eq(users.id,row.parentId)).limit(1):[];
    const [link]=row.parentId && row.studentId?await ctx.db.select({status:parentStudentLinks.status,verifiedAt:parentStudentLinks.verifiedAt}).from(parentStudentLinks)
      .where(and(eq(parentStudentLinks.parentId,row.parentId),eq(parentStudentLinks.studentId,row.studentId))).limit(1):[];
    return {...row,parent:parent??null,link:link??null};
  }),
  save:change.input(z.object({enrollmentId:id,action:z.enum(["link","unlink"]),parentName:z.string().trim().min(2).max(255),
    parentEmail:z.string().trim().email().max(254).transform(s=>s.toLowerCase()),evidence:z.string().trim().min(20).max(2000),confirmsVerified:z.literal(true),expectedParentId:id.nullable()}).strict())
    .mutation(async({ctx,input})=>ctx.db.transaction(async(tx:any)=>{
      const [row]=await tx.select().from(enrollments).where(eq(enrollments.id,input.enrollmentId)).limit(1).for("update");
      if(!row?.studentId)throw new TRPCError({code:"PRECONDITION_FAILED",message:"A linked student account is required."});
      if((row.parentId??null)!==input.expectedParentId)throw new TRPCError({code:"CONFLICT",message:"Family link changed. Refresh before continuing."});
      const [student]=await tx.select().from(users).where(eq(users.id,row.studentId)).limit(1);
      if(student?.role!=="student" || student.accountStatus!=="active")throw new TRPCError({code:"PRECONDITION_FAILED",message:"An active student account is required."});
      if(input.action==="unlink") {
        if(!row.parentId)return {linked:false};
        await tx.update(enrollments).set({parentId:null}).where(eq(enrollments.id,row.id));
        await note(tx,row.id,ctx.user.id,"Parent account #"+row.parentId+" access removed for this enrolment. Other enrolments unchanged. Verification: "+input.evidence);
        return {linked:false};
      }
      if(row.parentEmail?.trim().toLowerCase()!==input.parentEmail)throw new TRPCError({code:"PRECONDITION_FAILED",message:"Use the parent email recorded on this enrolment. Resolve any family-detail correction separately."});
      let [parent]=await tx.select().from(users).where(eq(users.email,input.parentEmail)).limit(1).for("update");
      if(parent && (parent.role!=="parent" || parent.accountStatus!=="active"))throw new TRPCError({code:"CONFLICT",message:"This email belongs to another role or an inactive account. Use a separate parent email; existing accounts are not changed."});
      if(!parent) {
        const [created]=await tx.insert(users).values({openId:"parent-"+randomUUID(),name:input.parentName,email:input.parentEmail,role:"parent",accountStatus:"active"});
        parent={id:Number(created.insertId)};
      }
      const [link]=await tx.select().from(parentStudentLinks).where(and(eq(parentStudentLinks.parentId,parent.id),eq(parentStudentLinks.studentId,row.studentId))).limit(1).for("update");
      if(row.parentId===parent.id && link?.status==="active")return {linked:true};
      if(link)await tx.update(parentStudentLinks).set({status:"active",verifiedAt:new Date()}).where(eq(parentStudentLinks.id,link.id));
      else await tx.insert(parentStudentLinks).values({parentId:parent.id,studentId:row.studentId,status:"active",verifiedAt:new Date()});
      await tx.update(enrollments).set({parentId:parent.id}).where(eq(enrollments.id,row.id));
      await note(tx,row.id,ctx.user.id,"Verified parent account #"+parent.id+" ("+input.parentEmail+") linked to student #"+row.studentId+" for this enrolment only. Previous parent account: "+(row.parentId??"none")+". Verification: "+input.evidence+". No email sent; parent uses the normal email sign-in.");
      return {linked:true};
    })),
});
async function note(tx:any,enrollmentId:number,authorId:number,content:string){await tx.insert(studentFileEntries).values({enrollmentId,authorId,requestId:randomUUID(),kind:"note",entryDate:sydneyDate(new Date()),minutes:0,content});}
