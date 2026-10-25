import { expect, test } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { unlink } from "node:fs/promises";
import path from "node:path";
const cleanupDb = new PrismaClient();
let testLearnerAdmission="";
let testOutOfScopeLearnerId="";
let testAssessmentId="";
let testAvatarUrl="";
let attendanceFixture:{learnerId:string;date:string;previousStatus:string|null}|null=null;
let testLoginIp=1;
function loginHeaders(){return {"x-forwarded-for":`198.51.100.${testLoginIp++}`};}
test.beforeAll(async()=>{await cleanupDb.user.updateMany({where:{email:{in:["director@maryroyal.ac.ke","headteacher@maryroyal.ac.ke","deputy@maryroyal.ac.ke","secretary@maryroyal.ac.ke","teacher@maryroyal.ac.ke","parent@maryroyal.ac.ke","learner@maryroyal.ac.ke"]}},data:{failedLogins:0,suspended:false}})});
test.afterAll(async()=>{
 const testLearners=await cleanupDb.learner.findMany({where:{OR:[{name:{startsWith:"Demo Learner "}},{name:{startsWith:"E2E Secretary "}},{name:"Scope Test Learner"},{name:"Role Probe Learner"},{admissionNo:{startsWith:"E2E-"}}]},select:{id:true}});
 const learnerIds=testLearners.map(row=>row.id);
 if(learnerIds.length)await cleanupDb.$transaction(async tx=>{
  const invoices=await tx.feeInvoice.findMany({where:{learnerId:{in:learnerIds}},select:{id:true}});const invoiceIds=invoices.map(row=>row.id);
  await tx.feeCredit.deleteMany({where:{learnerId:{in:learnerIds}}});
  if(invoiceIds.length)await tx.feePayment.deleteMany({where:{invoiceId:{in:invoiceIds}}});
  await tx.feeInvoice.deleteMany({where:{learnerId:{in:learnerIds}}});
  await tx.assessment.deleteMany({where:{learnerId:{in:learnerIds}}});
  await tx.attendance.deleteMany({where:{learnerId:{in:learnerIds}}});
  const learnerAccounts=await tx.guardianLink.findMany({where:{learnerId:{in:learnerIds},relation:"Learner"},select:{userId:true}});const learnerAccountIds=learnerAccounts.map(link=>link.userId);if(learnerAccountIds.length){await tx.guardianLink.deleteMany({where:{userId:{in:learnerAccountIds}}});await tx.user.deleteMany({where:{id:{in:learnerAccountIds}}})}
  await tx.guardianLink.deleteMany({where:{learnerId:{in:learnerIds}}});
  await tx.learningResource.deleteMany({where:{title:{startsWith:"E2E learning "}}});
  await tx.assignment.deleteMany({where:{title:{startsWith:"E2E Assignment "}}});
  await tx.teachingLog.deleteMany({where:{topics:{startsWith:"E2E teaching log "}}});
  await tx.learner.deleteMany({where:{id:{in:learnerIds}}});
 });
 const testUsers=await cleanupDb.user.findMany({where:{OR:[{email:{startsWith:"teacher-"}},{email:{startsWith:"parent-"}},{name:"Demo Newly Created Teacher"},{name:"Demo Linked Parent"}]},select:{id:true,email:true}});
 const generatedUsers=testUsers.filter(user=>/^teacher-\d+@maryroyal\.ac\.ke$/.test(user.email)||/^parent-\d+@maryroyal\.ac\.ke$/.test(user.email));const userIds=generatedUsers.map(row=>row.id);
 if(userIds.length){await cleanupDb.teacherAssignment.deleteMany({where:{teacherId:{in:userIds}}});await cleanupDb.guardianLink.deleteMany({where:{userId:{in:userIds}}});await cleanupDb.user.deleteMany({where:{id:{in:userIds}}})}
 const testComplaints=await cleanupDb.complaint.findMany({where:{subject:{startsWith:"E2E Secretary "}},select:{id:true}});if(testComplaints.length){const ids=testComplaints.map(item=>item.id);await cleanupDb.complaintReply.deleteMany({where:{complaintId:{in:ids}}});await cleanupDb.complaint.deleteMany({where:{id:{in:ids}}})}
 await cleanupDb.payrollEntry.deleteMany({where:{reference:"PAYROLL-E2E-01"}});
 if(attendanceFixture){const date=new Date(`${attendanceFixture.date}T00:00:00.000Z`);if(attendanceFixture.previousStatus)await cleanupDb.attendance.upsert({where:{learnerId_date:{learnerId:attendanceFixture.learnerId,date}},create:{learnerId:attendanceFixture.learnerId,date,status:attendanceFixture.previousStatus},update:{status:attendanceFixture.previousStatus}});else await cleanupDb.attendance.deleteMany({where:{learnerId:attendanceFixture.learnerId,date}})}
 if(testAvatarUrl.startsWith("/uploads/avatars/")&&!testAvatarUrl.includes("..")){await cleanupDb.user.updateMany({where:{avatarUrl:testAvatarUrl},data:{avatarUrl:null}});await unlink(path.join(process.cwd(),"public",testAvatarUrl.slice(1))).catch(()=>undefined)}
 await cleanupDb.$disconnect();
});
test("Director signs in, changes temporary password when required, and manages learners and accounts", async ({ page, playwright }) => {
 test.setTimeout(180_000);
 await page.emulateMedia({reducedMotion:"reduce"});
 await page.goto("/");
 await page.getByLabel("Email address").fill("director@maryroyal.ac.ke");
 const login = async (password:string) => { await page.getByLabel("Password",{exact:true}).fill(password); const responsePromise=page.waitForResponse(response=>response.url().endsWith("/api/login")); await page.getByRole("button", { name: "Sign in securely" }).click(); return responsePromise; };
 let response=await login("MaryRoyal2026!");
 if(!response.ok()) { await expect(page.getByRole("button", { name: "Sign in securely" })).toBeEnabled(); response=await login("MaryRoyalTest2026!"); }
 expect(response.ok()).toBeTruthy();
 if(await page.getByLabel("New password").count()){
  await page.getByLabel("New password").fill("MaryRoyalTest2026!");
  await page.getByRole("button", { name: "Update password" }).click();
 }
 await expect(page.getByRole("heading", { name: /Good (morning|afternoon)/ })).toBeVisible();
 const profile=await page.request.get("/api/profile");expect(profile.ok()).toBeTruthy();expect((await profile.json()).profile.email).toBe("director@maryroyal.ac.ke");
 const profilePhoto=await page.request.post("/api/profile",{multipart:{photo:{name:"profile.png",mimeType:"image/png",buffer:Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/qXcAAAAASUVORK5CYII=","base64")}}});expect(profilePhoto.status()).toBe(200);testAvatarUrl=(await profilePhoto.json()).avatarUrl;expect(testAvatarUrl).toMatch(/^\/uploads\/avatars\/[a-f0-9-]+\.png$/);
 const directorMarkWrite=await page.request.post("/api/assessments",{data:{learnerId:"not-a-learner",subject:"English",score:75,term:"2026 Term 3"}});expect(directorMarkWrite.status()).toBe(403);
 await expect(page.locator("body")).toHaveAttribute("data-theme-ready","true");await page.getByRole("button",{name:"Switch to dark mode"}).click();await expect(page.locator("html")).toHaveAttribute("data-theme","dark");await page.reload();await expect(page.locator("html")).toHaveAttribute("data-theme","dark");await expect(page.getByRole("button",{name:"Switch to light mode"})).toBeVisible();await page.getByRole("button",{name:"Switch to light mode"}).click();
 const sidebar=page.locator(".school-sidebar");const topBefore=await sidebar.boundingBox();await page.evaluate(()=>window.scrollTo(0,500));const topAfter=await sidebar.boundingBox();expect(topBefore?.y).toBe(0);expect(topAfter?.y).toBe(0);const lightNavColor=await sidebar.evaluate(el=>getComputedStyle(el).backgroundColor);await page.getByRole("button",{name:"Switch to dark mode"}).click();const darkNavColor=await sidebar.evaluate(el=>getComputedStyle(el).backgroundColor);expect(darkNavColor).not.toBe(lightNavColor);await page.getByRole("button",{name:"Switch to light mode"}).click();await page.setViewportSize({width:390,height:844});await expect(page.getByRole("navigation",{name:"Mobile navigation"})).toBeVisible();const mobileWidth=await page.evaluate(()=>document.documentElement.scrollWidth);expect(mobileWidth).toBeLessThanOrEqual(390);await page.setViewportSize({width:1280,height:900});
 await page.goto("/learners");
 await page.evaluate(()=>{document.documentElement.style.scrollBehavior="auto";window.scrollTo(0,0)});
 await expect(page.getByRole("heading",{name:"Learner register"})).toBeVisible();
 await expect(page.getByRole("cell",{name:"Achieng Otieno"})).toBeVisible();
 await page.getByRole("button", { name: "+ Admit learner" }).click();
 const learnerName=`Demo Learner ${Date.now()}`;
 await page.getByLabel("Learner name").fill(learnerName);
 await page.getByLabel("Grade").selectOption("Grade 4");
 await page.getByLabel("Gender").selectOption("Female");
 await page.getByRole("button", { name: "Save learner" }).click();
 await expect(page.getByRole("cell", { name: learnerName })).toBeVisible();
 const learnerRow=page.getByRole("row").filter({hasText:learnerName});testLearnerAdmission=(await learnerRow.getByRole("cell").first().innerText()).trim();expect(testLearnerAdmission).toMatch(/^MR-\d+$/);
  const credentialSlip=page.getByRole("region",{name:"New learner credentials"});await expect(credentialSlip).toContainText("@learners.maryroyal.ac.ke");await expect(credentialSlip.getByRole("button",{name:"Print credentials"})).toBeVisible();
 const teacherEmail=`teacher-${Date.now()}@maryroyal.ac.ke`;
 await page.goto("/accounts");
 await page.getByLabel("Full name").fill("Demo Newly Created Teacher");
 await page.getByLabel("Email").fill(teacherEmail);
 await page.getByLabel("Role").selectOption("TEACHER");
 await page.getByRole("button", { name: "Create", exact: true }).click();
 const tempText=await page.getByRole("status").innerText();
 const temporaryPassword=tempText.split("\n").find(line=>line.includes(teacherEmail))?.split(" · ")[1]?.trim()??"";
 expect(temporaryPassword.length).toBeGreaterThanOrEqual(12);
 await expect(page.locator("article").filter({hasText:teacherEmail})).toBeVisible();
 const parentEmail=`parent-${Date.now()}@maryroyal.ac.ke`;
 await page.getByLabel("Full name").fill("Demo Linked Parent");await page.getByLabel("Email").fill(parentEmail);await page.getByLabel("Role").selectOption("PARENT");await page.getByRole("button",{name:"Create",exact:true}).click();
 const parentText=await page.getByRole("status").innerText();const parentPassword=parentText.split("\n").find(line=>line.includes(parentEmail))?.split(" · ")[1]?.trim()??"";
 const linked=await page.evaluate(async({email,admissionNo})=>{const accounts=await fetch("/api/accounts").then(r=>r.json());const learners=await fetch(`/api/learners?q=${admissionNo}`).then(r=>r.json());const account=accounts.accounts.find((item:{email:string;id:string})=>item.email===email);const learner=learners.learners[0];const response=await fetch("/api/guardians",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:account.id,learnerId:learner.id,relation:"Parent"})});return {status:response.status,name:learner.name}}, {email:parentEmail,admissionNo:testLearnerAdmission});expect(linked.status).toBe(201);
 const csv=await page.request.get("/api/reports/learners");expect(csv.status()).toBe(200);expect(csv.headers()["content-type"]).toContain("text/csv");expect(await csv.text()).toContain(testLearnerAdmission);const exportAudit=await page.request.get("/api/audit?action=DATA_EXPORTED");expect(exportAudit.ok()).toBeTruthy();expect((await exportAudit.text())).toContain("DATA_EXPORTED");
 testAssessmentId=await page.evaluate(async()=>{const data=await fetch("/api/assessments?term=2026%20Term%201").then(r=>r.json());return data.assessments[0].id});
 const parentApi=await playwright.request.newContext({baseURL:"http://127.0.0.1:3000",extraHTTPHeaders:loginHeaders()});const parentLogin=await parentApi.post("/api/login",{data:{email:parentEmail,password:parentPassword}});expect(parentLogin.ok()).toBeTruthy();const parentChanged=await parentApi.post("/api/change-password",{data:{password:"PortalTest2026!"}});expect(parentChanged.ok()).toBeTruthy();const parentLearners=await parentApi.get("/api/learners");const parentLearnerData=await parentLearners.json() as {learners:Array<{name:string}>};expect(parentLearnerData.learners.map(item=>item.name)).toEqual([linked.name]);const parentPortal=await parentApi.get("/portal");expect(await parentPortal.text()).toContain(linked.name);await parentApi.dispose();
 const outOfScope=await page.evaluate(async(admissionNo)=>{const response=await fetch("/api/learners",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({admissionNo,name:"Scope Test Learner",grade:"Grade 9",gender:"Male"})});return response.json();},`E2E-SCOPE-${Date.now()}`) as {learner:{id:string}};
 testOutOfScopeLearnerId=outOfScope.learner.id;
});
test("unauthenticated users cannot read learner data", async ({ request }) => {
 const response = await request.get("/api/learners");
 expect(response.status()).toBe(401);
 expect((await request.get("/privacy")).status()).toBe(200);
});
test("root page applies saved dark theme before render without browser errors",async({page})=>{
 const errors:string[]=[];page.on("console",message=>{if(message.type()==="error")errors.push(message.text())});page.on("pageerror",error=>errors.push(error.message));
 await page.addInitScript(()=>window.localStorage.setItem("mary-theme","dark"));await page.goto("/");
 await expect(page.locator("html")).toHaveAttribute("data-theme","dark");
 const background=await page.locator("body").evaluate(element=>getComputedStyle(element).backgroundColor);expect(background).toBe("rgb(10, 18, 34)");
 expect(errors).toEqual([]);
});
test("non-director roles receive only the account and learner access configured for them", async ({ playwright }) => {
 test.setTimeout(90_000);
 const roles=["headteacher","deputy","secretary","teacher","parent","learner"] as const;
 for(const role of roles){
  const api=await playwright.request.newContext({baseURL:"http://127.0.0.1:3000",extraHTTPHeaders:loginHeaders()});
  const email=`${role}@maryroyal.ac.ke`;
  let login=await api.post("/api/login",{data:{email,password:"MaryRoyal2026!"}});
  if(!login.ok()) login=await api.post("/api/login",{data:{email,password:"PortalTest2026!"}});
  expect(login.ok(),`${role} demo login`).toBeTruthy();
  if(login.ok()&&(await login.json()).forcePasswordChange){
   const changed=await api.post("/api/change-password",{data:{password:"PortalTest2026!"}});
   expect(changed.ok(),`${role} forced password change`).toBeTruthy();
  }
  const accounts=await api.get("/api/accounts");
  expect(accounts.status(),`${role} must not view accounts`).toBe(403);
  expect((await api.post("/api/accounts",{data:{name:"Unauthorized Test",email:`deny-${role}@example.invalid`,role:"TEACHER"}})).status()).toBe(403);
  expect((await api.patch("/api/accounts",{data:{id:"not-a-real-account",action:"suspend"}})).status()).toBe(403);
  const learners=await api.get("/api/learners");
  const canViewLearners=["headteacher","deputy","secretary","teacher","parent","learner"].includes(role);
  expect(learners.status()).toBe(canViewLearners?200:403);
  const admissionAttempt=await api.post("/api/learners",{data:{admissionNo:`DENY-${role}`,name:role==="secretary"?"Role Probe Learner":"Unauthorized",grade:"Grade 4",gender:"Male"}});expect(admissionAttempt.status()).toBe(role==="secretary"?201:403);
  const assessments=await api.get("/api/assessments");
  const canViewAssessments=["headteacher","deputy","teacher","parent","learner"].includes(role);
  expect(assessments.status()).toBe(canViewAssessments?200:403);
  const finance=await api.get("/api/finance/invoices");expect(finance.status()).toBe(["headteacher","secretary","parent"].includes(role)?200:403);
  const payroll=await api.get("/api/finance/payroll");expect(payroll.status()).toBe(role==="headteacher"?200:403);
  const payrollWrite=await api.post("/api/finance/payroll",{data:{staffId:"not-a-staff",period:"2027-01",grossAmount:50000,deductions:5000}});expect(payrollWrite.status()).toBe(role==="headteacher"?400:403);
  expect((await api.get("/api/guardians")).status()).toBe(403);
  expect((await api.post("/api/guardians",{data:{userId:"not-a-user",learnerId:"not-a-learner"}})).status()).toBe(403);
  expect((await api.delete("/api/guardians",{data:{id:"not-a-link"}})).status()).toBe(403);
  expect((await api.get("/api/reports/learners")).status()).toBe(403);
  expect((await api.get("/api/audit")).status()).toBe(role==="headteacher"?200:403);
  const createMark=await api.post("/api/assessments",{data:{learnerId:testOutOfScopeLearnerId,subject:"English",score:55,term:"2026 Term 3"}});expect(createMark.status()).toBe(403);
  const editMark=await api.patch("/api/assessments",{data:{id:testAssessmentId,score:55}});expect(editMark.status()).toBe(role==="teacher"?409:403);
  const markWorkflow=await api.post(`/api/assessments/${testAssessmentId}/workflow`,{data:{action:"release"}});expect(markWorkflow.status()).toBe(403);
  const financeWrite=await api.post("/api/finance/payments",{data:{invoiceId:"not-an-invoice",amount:100,method:"CASH"}});expect(financeWrite.status()).toBe(role==="secretary"?404:403);
  const attendanceWrite=await api.post("/api/attendance",{data:{grade:"Grade 4",date:new Date().toISOString().slice(0,10),records:[{learnerId:testOutOfScopeLearnerId,status:"ABSENT"}]}});expect(attendanceWrite.status()).toBe(403);
  const complaints=await api.get("/api/complaints");expect(complaints.status(),`${role} complaint access`).toBe(role==="learner"?403:200);
  if(["parent","learner"].includes(role)){const linked=await learners.json() as {learners:Array<{id:string;name:string}>};const linkedIds=new Set(linked.learners.map(row=>row.id));const result=await assessments.json() as {assessments:Array<{learnerId:string;status:string}>};expect(result.assessments.length).toBeGreaterThan(0);expect(result.assessments.every(row=>linkedIds.has(row.learnerId)&&row.status==="RELEASED")).toBeTruthy();const portal=await api.get("/portal");expect(portal.ok()).toBeTruthy();const html=await portal.text();expect(html).toContain(linked.learners[0].name);expect(html).not.toContain("Faith Akoth");if(role==="learner")expect(html).not.toContain("Fee statements");}
  const attendance=await api.get(`/api/attendance?grade=Grade%204&date=${new Date().toISOString().slice(0,10)}`);expect(attendance.status()).toBe(["headteacher","deputy","teacher"].includes(role)?200:403);
  await api.dispose();
 }
});
test("teacher marks require assignment, Head Teacher approval, and Director release", async ({ playwright }) => {
 async function login(email:string,passwords:string[]){
  const api=await playwright.request.newContext({baseURL:"http://127.0.0.1:3000",extraHTTPHeaders:loginHeaders()});let response;
  for(const password of passwords){response=await api.post("/api/login",{data:{email,password}});if(response.ok())break;}
  expect(response?.ok(),`${email} login`).toBeTruthy();
  if(response?.ok()&&(await response.json()).forcePasswordChange){const changed=await api.post("/api/change-password",{data:{password:"PortalTest2026!"}});expect(changed.ok(),`${email} first password change`).toBeTruthy();}
  return api;
 }
 const teacher=await login("teacher@maryroyal.ac.ke",["PortalTest2026!","MaryRoyal2026!"]);
 const learnerResult=await teacher.get("/api/learners?take=100");expect(learnerResult.ok()).toBeTruthy();
 const learnerData=await learnerResult.json() as {learners:Array<{id:string;admissionNo:string;grade:string}>};
 const learner=learnerData.learners.find(item=>item.admissionNo===testLearnerAdmission);expect(learner).toBeTruthy();
 const idor=await teacher.post("/api/assessments",{data:{learnerId:testOutOfScopeLearnerId,subject:"English",score:60,term:"2026 Term 3"}});expect(idor.status()).toBe(403);
 const created=await teacher.post("/api/assessments",{data:{learnerId:learner!.id,subject:"English",score:77,term:"2026 Term 3",strand:"Reading",competency:"Reads with understanding",comment:"Good progress."}});
 expect(created.status()).toBe(201);const assessment=(await created.json()).assessment as {id:string};
 const submitted=await teacher.post(`/api/assessments/${assessment.id}/workflow`,{data:{action:"submit"}});expect(submitted.status()).toBe(200);
 const locked=await teacher.patch("/api/assessments",{data:{id:assessment.id,score:80}});expect(locked.status()).toBe(409);
 const head=await login("headteacher@maryroyal.ac.ke",["PortalTest2026!","MaryRoyal2026!"]);
 const approved=await head.post(`/api/assessments/${assessment.id}/workflow`,{data:{action:"approve"}});expect(approved.status()).toBe(200);
 const director=await login("director@maryroyal.ac.ke",["MaryRoyalTest2026!","MaryRoyal2026!"]);
 const released=await director.post(`/api/assessments/${assessment.id}/workflow`,{data:{action:"release"}});expect(released.status()).toBe(200);
 const final=await director.get("/api/assessments?term=2026%20Term%203");const finalData=await final.json() as {assessments:Array<{id:string;status:string}>};expect(finalData.assessments.find(row=>row.id===assessment.id)?.status).toBe("RELEASED");
 await teacher.dispose();await head.dispose();await director.dispose();
});
test("Secretary admissions and complaints reach leadership; payments await confirmation and Director authorizes payroll",async({playwright})=>{
 async function login(email:string){const api=await playwright.request.newContext({baseURL:"http://127.0.0.1:3000",extraHTTPHeaders:loginHeaders()});let response;for(const password of ["PortalTest2026!","MaryRoyal2026!","MaryRoyalTest2026!"]){response=await api.post("/api/login",{data:{email,password}});if(response.ok())break;}expect(response?.ok(),email).toBeTruthy();if(response?.ok()&&(await response.json()).forcePasswordChange){const changed=await api.post("/api/change-password",{data:{password:"PortalTest2026!"}});expect(changed.ok()).toBeTruthy()}return api}
 const head=await login("headteacher@maryroyal.ac.ke");const secretary=await login("secretary@maryroyal.ac.ke");const director=await login("director@maryroyal.ac.ke");const teacher=await login("teacher@maryroyal.ac.ke");
 const admissionName=`E2E Secretary ${Date.now()}`;const admission=await secretary.post("/api/learners",{data:{name:admissionName,grade:"Grade 4",gender:"Female"}});expect(admission.status()).toBe(201);const admissionData=await admission.json() as {learner:{id:string;admissionStatus:string;admissionNo:string};credentials:{email:string;temporaryPassword:string}};const applicant=admissionData.learner;expect(applicant.admissionStatus).toBe("PENDING");expect(applicant.admissionNo).toMatch(/^MR-\d+$/);expect(admissionData.credentials.email).toBe(`${applicant.admissionNo.toLowerCase()}@learners.maryroyal.ac.ke`);const student=await playwright.request.newContext({baseURL:"http://127.0.0.1:3000",extraHTTPHeaders:loginHeaders()});expect((await student.post("/api/login",{data:{email:admissionData.credentials.email,password:admissionData.credentials.temporaryPassword}})).status()).toBe(401);expect((await secretary.post(`/api/learners/${applicant.id}/workflow`,{data:{action:"approve"}})).status()).toBe(403);const approvedAdmission=await head.post(`/api/learners/${applicant.id}/workflow`,{data:{action:"approve"}});expect(approvedAdmission.ok()).toBeTruthy();expect(await (await director.get(`/api/learners?q=${encodeURIComponent(applicant.admissionNo)}`)).text()).toContain(admissionName);const learnerLogin=await student.post("/api/login",{data:{email:admissionData.credentials.email,password:admissionData.credentials.temporaryPassword}});expect(learnerLogin.ok()).toBeTruthy();expect((await learnerLogin.json()).forcePasswordChange).toBe(true);expect((await student.post("/api/change-password",{data:{password:"LrnPortalTest2026!"}})).ok()).toBeTruthy();expect((await student.get("/api/complaints")).status()).toBe(403);expect((await student.get("/api/learning/resources")).ok()).toBeTruthy();const resourceBody={title:`E2E learning video ${Date.now()}`,description:"A short class video shared for this learning test.",grade:"Grade 4",subject:"Mathematics",kind:"VIDEO",url:"https://www.youtube.com/watch?v=dQw4w9WgXcQ"};expect((await teacher.post("/api/learning/resources",{data:resourceBody})).status()).toBe(201);expect((await teacher.post("/api/learning/resources",{data:{...resourceBody,title:`E2E learning other grade ${Date.now()}`,grade:"Grade 5",subject:"Science"}})).status()).toBe(201);const learnerResources=await student.get("/api/learning/resources");const visibleResources=(await learnerResources.json()).resources as Array<{title:string;grade:string}>;expect(visibleResources.some(row=>row.title===resourceBody.title&&row.grade==="Grade 4")).toBe(true);expect(visibleResources.some(row=>row.title.includes("other grade"))).toBe(false);const game=await student.post("/api/learning/activity",{data:{gameKey:"NUMBER_QUEST",score:4,maxScore:5}});expect(game.status()).toBe(201);const savedGame=await cleanupDb.learningGameAttempt.findFirst({where:{learnerId:applicant.id,gameKey:"NUMBER_QUEST"},select:{score:true,maxScore:true}});expect(savedGame).toEqual({score:4,maxScore:5});const learningPage=await student.get("/learning");expect(learningPage.status()).toBe(200);const learningHtml=await learningPage.text();expect(learningHtml).not.toContain("Complaints");expect(learningHtml).toContain("Recent best scores");const classwork=await student.get("/api/assignments");expect(classwork.ok()).toBeTruthy();await student.dispose();
 const subject=`E2E Secretary ${Date.now()}`;const complaint=await secretary.post("/api/complaints",{data:{subject,message:"Parent called about a school matter and requested follow-up.",recipientRole:"DIRECTOR",reporterName:"Demo Parent",reporterRole:"PARENT"}});expect(complaint.status()).toBe(201);const complaintId=((await complaint.json()).complaint as {id:string}).id;expect(await (await secretary.get("/api/complaints")).text()).toContain(subject);expect(await (await director.get("/api/complaints")).text()).toContain(subject);expect((await director.post(`/api/complaints/${complaintId}/replies`,{data:{message:"Received and assigned for follow-up."}})).status()).toBe(201);
 const list=await head.get("/api/learners?take=100");const data=await list.json() as {learners:Array<{id:string;admissionNo:string}>};const learner=data.learners.find(x=>x.admissionNo===testLearnerAdmission);expect(learner).toBeTruthy();
 const first=await head.post("/api/finance/invoices",{data:{learnerId:learner!.id,term:"2026 Term 3",items:[{category:"TUITION",description:"Term tuition",amount:10000}]}});expect(first.status()).toBe(201);const firstInvoice=(await first.json()).invoice as {id:string};
 const code=`MP${Date.now().toString().slice(-10)}`;const payment=await secretary.post("/api/finance/payments",{data:{invoiceId:firstInvoice.id,amount:12000,method:"MPESA",mpesaCode:code}});expect(payment.status()).toBe(201);const paymentData=(await payment.json()) as {payment:{id:string;receiptNo:string;status:string};creditAmount:number};expect(paymentData.payment.status).toBe("PENDING");expect(paymentData.creditAmount).toBe(0);expect((await secretary.get(`/receipts/${paymentData.payment.id}`)).status()).toBe(404);
 const duplicate=await secretary.post("/api/finance/payments",{data:{invoiceId:firstInvoice.id,amount:100,method:"MPESA",mpesaCode:code}});expect(duplicate.status()).toBe(409);
 const confirmed=await head.post(`/api/finance/payments/${paymentData.payment.id}/confirm`,{data:{}});expect(confirmed.ok()).toBeTruthy();expect((await confirmed.json()).creditAmount).toBe(2000);expect((await secretary.get(`/receipts/${paymentData.payment.id}`)).ok()).toBeTruthy();
 const second=await head.post("/api/finance/invoices",{data:{learnerId:learner!.id,term:"2026 Term 2",items:[{category:"TUITION",description:"Prior term tuition",amount:10000}]}});expect(second.status()).toBe(201);const secondData=(await second.json()).invoice as {id:string;creditApplied:number;balance:number};expect(secondData.creditApplied).toBe(2000);expect(secondData.balance).toBe(8000);
 const cash=await secretary.post("/api/finance/payments",{data:{invoiceId:secondData.id,amount:1000,method:"CASH"}});expect(cash.status()).toBe(201);const cashData=(await cash.json()).payment as {id:string};const confirmedCash=await head.post(`/api/finance/payments/${cashData.id}/confirm`,{data:{}});expect(confirmedCash.ok()).toBeTruthy();const secretaryVoid=await secretary.post(`/api/finance/payments/${cashData.id}/void`,{data:{reason:"Duplicate entry correction"}});expect(secretaryVoid.status()).toBe(403);const noReason=await head.post(`/api/finance/payments/${cashData.id}/void`,{data:{reason:"short"}});expect(noReason.status()).toBe(400);const voided=await head.post(`/api/finance/payments/${cashData.id}/void`,{data:{reason:"Duplicate entry correction"}});expect(voided.ok()).toBeTruthy();
 const payrollData=await (await head.get("/api/finance/payroll")).json() as {staff:Array<{id:string}>};const payroll=await head.post("/api/finance/payroll",{data:{staffId:payrollData.staff[0].id,period:`${2000+Math.floor(Date.now()/1000)%7999}-01`,grossAmount:50000,deductions:5000}});expect(payroll.status()).toBe(201);const payrollEntry=(await payroll.json()).entry as {id:string;netAmount:number};expect(payrollEntry.netAmount).toBe(45000);const forbiddenRelease=await head.patch("/api/finance/payroll",{data:{action:"mark-paid",id:payrollEntry.id,reference:"PAYROLL-E2E-01"}});expect(forbiddenRelease.status()).toBe(403);const paid=await director.patch("/api/finance/payroll",{data:{action:"mark-paid",id:payrollEntry.id,reference:"PAYROLL-E2E-01"}});expect(paid.ok()).toBeTruthy();expect((await paid.json()).entry.status).toBe("PAID");
 await head.dispose();await secretary.dispose();await director.dispose();await teacher.dispose();
});
test("teacher records attendance only for an assigned class and cannot tamper with another class",async({playwright})=>{
 const api=await playwright.request.newContext({baseURL:"http://127.0.0.1:3000",extraHTTPHeaders:loginHeaders()});let login=await api.post("/api/login",{data:{email:"teacher@maryroyal.ac.ke",password:"PortalTest2026!"}});if(!login.ok())login=await api.post("/api/login",{data:{email:"teacher@maryroyal.ac.ke",password:"MaryRoyal2026!"}});expect(login.ok()).toBeTruthy();if((await login.json()).forcePasswordChange)await api.post("/api/change-password",{data:{password:"PortalTest2026!"}});
 const learnerData=await (await api.get("/api/learners?take=100")).json() as {learners:Array<{id:string;grade:string}>};const learner=learnerData.learners.find(item=>item.grade==="Grade 4");expect(learner).toBeTruthy();const date=new Date().toISOString().slice(0,10);const day=new Date(`${date}T00:00:00.000Z`);const existingAttendance=await cleanupDb.attendance.findUnique({where:{learnerId_date:{learnerId:learner!.id,date:day}}});attendanceFixture={learnerId:learner!.id,date,previousStatus:existingAttendance?.status??null};const saved=await api.post("/api/attendance",{data:{grade:"Grade 4",date,records:[{learnerId:learner!.id,status:"ABSENT"}]}});expect(saved.status()).toBe(200);const updated=await api.get(`/api/attendance?grade=Grade%204&date=${date}`);expect(updated.ok()).toBeTruthy();const updatedData=await updated.json() as {learners:Array<{id:string;status:string}>};expect(updatedData.learners.find(item=>item.id===learner!.id)?.status).toBe("ABSENT");const idor=await api.post("/api/attendance",{data:{grade:"Grade 9",date,records:[{learnerId:learner!.id,status:"PRESENT"}]}});expect(idor.status()).toBe(403);await api.dispose();
});

test("assigned teachers publish work, learners submit it, and school leaders confirm teaching logs",async({playwright})=>{
 async function login(email:string){const api=await playwright.request.newContext({baseURL:"http://127.0.0.1:3000",extraHTTPHeaders:loginHeaders()});let response;for(const password of ["PortalTest2026!","MaryRoyal2026!","MaryRoyalTest2026!"]){response=await api.post("/api/login",{data:{email,password}});if(response.ok())break;}expect(response?.ok(),email).toBeTruthy();if(response?.ok()&&(await response.json()).forcePasswordChange){const changed=await api.post("/api/change-password",{data:{password:"PortalTest2026!"}});expect(changed.ok()).toBeTruthy()}return api}
 const teacher=await login("teacher@maryroyal.ac.ke");const learner=await login("learner@maryroyal.ac.ke");const head=await login("headteacher@maryroyal.ac.ke");const director=await login("director@maryroyal.ac.ke");
 const suffix=String(Date.now());const autoTitle=`E2E Assignment auto ${suffix}`;const auto=await teacher.post("/api/assignments",{data:{title:autoTitle,instructions:"Solve this one-step equation and submit the value of x.",grade:"Grade 4",subject:"Mathematics",maxScore:10,answerKey:"x = 2",autoMark:true}});expect(auto.status()).toBe(201);const autoId=((await auto.json()).assignment as {id:string}).id;
 const learnerWork=await learner.get("/api/assignments");expect(learnerWork.ok()).toBeTruthy();const learnerAssignments=(await learnerWork.json()).assignments as Array<{id:string;title:string;submissions:Array<{status:string}>;answerKey?:string}>;const delivered=learnerAssignments.find(item=>item.id===autoId);expect(delivered?.title).toBe(autoTitle);expect(delivered?.answerKey).toBeUndefined();const autoSubmit=await learner.post(`/api/assignments/${autoId}/submissions`,{data:{response:" X = 2 "}});expect(autoSubmit.status()).toBe(201);expect((await autoSubmit.json()).submission.score).toBe(10);expect((await learner.post(`/api/assignments/${autoId}/submissions`,{data:{response:"x = 2"}})).status()).toBe(409);
 const manualTitle=`E2E Assignment manual ${suffix}`;const manual=await teacher.post("/api/assignments",{data:{title:manualTitle,instructions:"Write one sentence explaining your answer.",grade:"Grade 4",subject:"English",maxScore:20,autoMark:false}});expect(manual.status()).toBe(201);const manualId=((await manual.json()).assignment as {id:string}).id;expect((await learner.post(`/api/assignments/${manualId}/submissions`,{data:{response:"I used the place-value method."}})).status()).toBe(201);const inbox=(await (await teacher.get("/api/assignments")).json()).assignments as Array<{id:string;submissions:Array<{learnerId:string;status:string}>}>;const returned=inbox.find(item=>item.id===manualId)?.submissions[0];expect(returned?.status).toBe("SUBMITTED");expect((await teacher.patch(`/api/assignments/${manualId}/submissions`,{data:{learnerId:returned!.learnerId,score:18,feedback:"Clear explanation."}})).status()).toBe(200);expect((await teacher.patch(`/api/assignments/${manualId}/submissions`,{data:{learnerId:returned!.learnerId,score:19}})).status()).toBe(409);
 const topics=`E2E teaching log ${suffix}: covered fractions and learner practice.`;const logResponse=await teacher.post("/api/teaching-logs",{data:{grade:"Grade 4",subject:"Mathematics",topics}});expect(logResponse.status()).toBe(201);const log=((await logResponse.json()).log as {id:string;status:string});expect(log.status).toBe("SUBMITTED");expect((await learner.get("/api/teaching-logs")).status()).toBe(403);const headLogs=(await (await head.get("/api/teaching-logs")).json()).logs as Array<{id:string;topics:string}>;expect(headLogs.some(item=>item.id===log.id&&item.topics===topics)).toBeTruthy();expect((await head.patch("/api/teaching-logs",{data:{id:log.id,action:"confirm"}})).ok()).toBeTruthy();const directorLogs=(await (await director.get("/api/teaching-logs")).json()).logs as Array<{id:string;status:string}>;expect(directorLogs.find(item=>item.id===log.id)?.status).toBe("CONFIRMED");
 await teacher.dispose();await learner.dispose();await head.dispose();await director.dispose();
});
