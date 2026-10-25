import { expect, test } from "@playwright/test";
let testLearnerAdmission="";
let testOutOfScopeLearnerId="";
let testAssessmentId="";
test("Director signs in, changes temporary password when required, and manages learners and accounts", async ({ page, playwright }) => {
 await page.goto("/");
 await page.getByLabel("Email address").fill("director@maryroyal.ac.ke");
 const login = async (password:string) => { await page.getByLabel("Password").fill(password); const responsePromise=page.waitForResponse(response=>response.url().endsWith("/api/login")); await page.getByRole("button", { name: "Sign in" }).click(); return responsePromise; };
 let response=await login("MaryRoyal2026!");
 if(!response.ok()) { await expect(page.getByRole("button", { name: "Sign in" })).toBeEnabled(); response=await login("MaryRoyalTest2026!"); }
 expect(response.ok()).toBeTruthy();
 await expect(page).toHaveURL(/(change-password|dashboard)/);
 if(page.url().includes("change-password")){
  await page.getByLabel("New password").fill("MaryRoyalTest2026!");
  await page.getByRole("button", { name: "Update password" }).click();
 }
 await expect(page).toHaveURL(/dashboard/);
 await expect(page.getByRole("heading", { name: /Good morning/ })).toBeVisible();
 await page.goto("/learners");
 await page.getByRole("button", { name: "Add learner" }).click();
 testLearnerAdmission=`E2E-${Date.now()}`;
 await page.getByLabel("Admission number").fill(testLearnerAdmission);
 const learnerName=`Demo Learner ${Date.now()}`;
 await page.getByLabel("Learner name").fill(learnerName);
 await page.getByLabel("Grade").selectOption("Grade 4");
 await page.getByLabel("Gender").selectOption("Female");
 await page.getByRole("button", { name: "Save learner" }).click();
 await expect(page.getByRole("status")).toContainText("added to the register");
 await expect(page.getByRole("cell", { name: learnerName })).toBeVisible();
 const teacherEmail=`teacher-${Date.now()}@maryroyal.ac.ke`;
 await page.goto("/accounts");
 await page.getByLabel("Full name").fill("Demo Newly Created Teacher");
 await page.getByLabel("Email").fill(teacherEmail);
 await page.getByLabel("Role").selectOption("TEACHER");
 await page.getByRole("button", { name: "Create account" }).click();
 const tempText=await page.getByRole("status").innerText();
 const temporaryPassword=tempText.split(" · ")[1].trim().split(/\s+/)[0];
 expect(temporaryPassword.length).toBeGreaterThanOrEqual(12);
 await expect(page.getByRole("cell", { name: teacherEmail })).toBeVisible();
 const parentEmail=`parent-${Date.now()}@maryroyal.ac.ke`;
 await page.getByLabel("Full name").fill("Demo Linked Parent");await page.getByLabel("Email").fill(parentEmail);await page.getByLabel("Role").selectOption("PARENT");await page.getByRole("button",{name:"Create account"}).click();
 const parentText=await page.getByRole("status").innerText();const parentPassword=parentText.split(" · ")[1].trim().split(/\s+/)[0];
 const linked=await page.evaluate(async({email,admissionNo})=>{const accounts=await fetch("/api/accounts").then(r=>r.json());const learners=await fetch(`/api/learners?q=${admissionNo}`).then(r=>r.json());const account=accounts.accounts.find((item:{email:string;id:string})=>item.email===email);const learner=learners.learners[0];const response=await fetch("/api/guardians",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:account.id,learnerId:learner.id,relation:"Parent"})});return {status:response.status,name:learner.name}}, {email:parentEmail,admissionNo:testLearnerAdmission});expect(linked.status).toBe(201);
 const csv=await page.request.get("/api/reports/learners");expect(csv.status()).toBe(200);expect(csv.headers()["content-type"]).toContain("text/csv");expect(await csv.text()).toContain(testLearnerAdmission);const exportAudit=await page.request.get("/api/audit?action=DATA_EXPORTED");expect(exportAudit.ok()).toBeTruthy();expect((await exportAudit.text())).toContain("DATA_EXPORTED");
 testAssessmentId=await page.evaluate(async()=>{const data=await fetch("/api/assessments?term=2026%20Term%201").then(r=>r.json());return data.assessments[0].id});
 const parentApi=await playwright.request.newContext({baseURL:"http://127.0.0.1:3000"});const parentLogin=await parentApi.post("/api/login",{data:{email:parentEmail,password:parentPassword}});expect(parentLogin.ok()).toBeTruthy();const parentChanged=await parentApi.post("/api/change-password",{data:{password:"PortalTest2026!"}});expect(parentChanged.ok()).toBeTruthy();const parentLearners=await parentApi.get("/api/learners");const parentLearnerData=await parentLearners.json() as {learners:Array<{name:string}>};expect(parentLearnerData.learners.map(item=>item.name)).toEqual([linked.name]);const parentPortal=await parentApi.get("/portal");expect(await parentPortal.text()).toContain(linked.name);await parentApi.dispose();
 const outOfScope=await page.evaluate(async(admissionNo)=>{const response=await fetch("/api/learners",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({admissionNo,name:"Scope Test Learner",grade:"Grade 9",gender:"Male"})});return response.json();},`E2E-SCOPE-${Date.now()}`) as {learner:{id:string}};
 testOutOfScopeLearnerId=outOfScope.learner.id;
});
test("unauthenticated users cannot read learner data", async ({ request }) => {
 const response = await request.get("/api/learners");
 expect(response.status()).toBe(401);
 expect((await request.get("/privacy")).status()).toBe(200);
});
test("non-director roles receive only the account and learner access configured for them", async ({ playwright }) => {
 const roles=["headteacher","deputy","accountant","teacher","parent","learner"] as const;
 for(const role of roles){
  const api=await playwright.request.newContext({baseURL:"http://127.0.0.1:3000"});
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
  const canViewLearners=["headteacher","deputy","teacher","accountant","parent","learner"].includes(role);
  expect(learners.status()).toBe(canViewLearners?200:403);
  expect((await api.post("/api/learners",{data:{admissionNo:`DENY-${role}`,name:"Unauthorized",grade:"Grade 4",gender:"Male"}})).status()).toBe(403);
  if(role==="accountant"&&learners.ok()){
   const result=await learners.json() as {learners:Array<Record<string,unknown>>};
   expect(Object.keys(result.learners[0]??{}).sort()).toEqual(["admissionNo","grade","id","name"]);
  }
  const assessments=await api.get("/api/assessments");
  const canViewAssessments=["headteacher","deputy","teacher","parent","learner"].includes(role);
  expect(assessments.status()).toBe(canViewAssessments?200:403);
  const finance=await api.get("/api/finance/invoices");expect(finance.status()).toBe(["accountant","parent"].includes(role)?200:403);
  expect((await api.get("/api/guardians")).status()).toBe(403);
  expect((await api.post("/api/guardians",{data:{userId:"not-a-user",learnerId:"not-a-learner"}})).status()).toBe(403);
  expect((await api.delete("/api/guardians",{data:{id:"not-a-link"}})).status()).toBe(403);
  expect((await api.get("/api/reports/learners")).status()).toBe(403);
  expect((await api.get("/api/audit")).status()).toBe(role==="headteacher"?200:403);
  const createMark=await api.post("/api/assessments",{data:{learnerId:testOutOfScopeLearnerId,subject:"English",score:55,term:"2026 Term 3"}});expect(createMark.status()).toBe(403);
  const editMark=await api.patch("/api/assessments",{data:{id:testAssessmentId,score:55}});expect(editMark.status()).toBe(role==="teacher"?409:403);
  const markWorkflow=await api.post(`/api/assessments/${testAssessmentId}/workflow`,{data:{action:"release"}});expect(markWorkflow.status()).toBe(403);
  const financeWrite=await api.post("/api/finance/payments",{data:{invoiceId:"not-an-invoice",amount:100,method:"CASH"}});expect(financeWrite.status()).toBe(role==="accountant"?404:403);
  const attendanceWrite=await api.post("/api/attendance",{data:{grade:"Grade 4",date:new Date().toISOString().slice(0,10),records:[{learnerId:testOutOfScopeLearnerId,status:"ABSENT"}]}});expect(attendanceWrite.status()).toBe(403);
  if(["parent","learner"].includes(role)){const linked=await learners.json() as {learners:Array<{id:string;name:string}>};const linkedIds=new Set(linked.learners.map(row=>row.id));const result=await assessments.json() as {assessments:Array<{learnerId:string;status:string}>};expect(result.assessments.length).toBeGreaterThan(0);expect(result.assessments.every(row=>linkedIds.has(row.learnerId)&&row.status==="RELEASED")).toBeTruthy();const portal=await api.get("/portal");expect(portal.ok()).toBeTruthy();const html=await portal.text();expect(html).toContain(linked.learners[0].name);expect(html).not.toContain("Faith Akoth");if(role==="learner")expect(html).not.toContain("Fee statements");}
  const attendance=await api.get(`/api/attendance?grade=Grade%204&date=${new Date().toISOString().slice(0,10)}`);expect(attendance.status()).toBe(["headteacher","deputy","teacher"].includes(role)?200:403);
  await api.dispose();
 }
});
test("teacher marks require assignment, Head Teacher approval, and Director release", async ({ playwright }) => {
 async function login(email:string,passwords:string[]){
  const api=await playwright.request.newContext({baseURL:"http://127.0.0.1:3000"});let response;
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
test("accountant invoices, records M-Pesa, carries credit forward, and voids with an audit reason",async({playwright})=>{
 const api=await playwright.request.newContext({baseURL:"http://127.0.0.1:3000"});let login=await api.post("/api/login",{data:{email:"accountant@maryroyal.ac.ke",password:"PortalTest2026!"}});if(!login.ok())login=await api.post("/api/login",{data:{email:"accountant@maryroyal.ac.ke",password:"MaryRoyal2026!"}});expect(login.ok()).toBeTruthy();if((await login.json()).forcePasswordChange){const changed=await api.post("/api/change-password",{data:{password:"PortalTest2026!"}});expect(changed.ok()).toBeTruthy()}
 const list=await api.get("/api/learners?take=100");const data=await list.json() as {learners:Array<{id:string;admissionNo:string}>};const learner=data.learners.find(x=>x.admissionNo===testLearnerAdmission);expect(learner).toBeTruthy();
 const first=await api.post("/api/finance/invoices",{data:{learnerId:learner!.id,term:"2026 Term 3",items:[{category:"TUITION",description:"Term tuition",amount:10000}]}});expect(first.status()).toBe(201);const firstInvoice=(await first.json()).invoice as {id:string};
 const code=`MP${Date.now().toString().slice(-10)}`;const payment=await api.post("/api/finance/payments",{data:{invoiceId:firstInvoice.id,amount:12000,method:"MPESA",mpesaCode:code}});expect(payment.status()).toBe(201);const paymentData=(await payment.json()) as {payment:{id:string;receiptNo:string};creditAmount:number};expect(paymentData.creditAmount).toBe(2000);expect(paymentData.payment.receiptNo).toMatch(/^MRR-\d{4}-\d{6}$/);expect((await api.get(`/receipts/${paymentData.payment.id}`)).ok()).toBeTruthy();
 const duplicate=await api.post("/api/finance/payments",{data:{invoiceId:firstInvoice.id,amount:100,method:"MPESA",mpesaCode:code}});expect(duplicate.status()).toBe(409);
 const second=await api.post("/api/finance/invoices",{data:{learnerId:learner!.id,term:"2026 Term 2",items:[{category:"TUITION",description:"Prior term tuition",amount:10000}]}});expect(second.status()).toBe(201);const secondData=(await second.json()).invoice as {id:string;creditApplied:number;balance:number};expect(secondData.creditApplied).toBe(2000);expect(secondData.balance).toBe(8000);
 const cash=await api.post("/api/finance/payments",{data:{invoiceId:secondData.id,amount:1000,method:"CASH"}});expect(cash.status()).toBe(201);const cashData=(await cash.json()).payment as {id:string};const noReason=await api.post(`/api/finance/payments/${cashData.id}/void`,{data:{reason:"short"}});expect(noReason.status()).toBe(400);const voided=await api.post(`/api/finance/payments/${cashData.id}/void`,{data:{reason:"Duplicate entry correction"}});expect(voided.ok()).toBeTruthy();
 await api.dispose();
});
test("teacher records attendance only for an assigned class and cannot tamper with another class",async({playwright})=>{
 const api=await playwright.request.newContext({baseURL:"http://127.0.0.1:3000"});let login=await api.post("/api/login",{data:{email:"teacher@maryroyal.ac.ke",password:"PortalTest2026!"}});if(!login.ok())login=await api.post("/api/login",{data:{email:"teacher@maryroyal.ac.ke",password:"MaryRoyal2026!"}});expect(login.ok()).toBeTruthy();if((await login.json()).forcePasswordChange)await api.post("/api/change-password",{data:{password:"PortalTest2026!"}});
 const learnerData=await (await api.get("/api/learners?take=100")).json() as {learners:Array<{id:string;grade:string}>};const learner=learnerData.learners.find(item=>item.grade==="Grade 4");expect(learner).toBeTruthy();const date=new Date().toISOString().slice(0,10);const saved=await api.post("/api/attendance",{data:{grade:"Grade 4",date,records:[{learnerId:learner!.id,status:"ABSENT"}]}});expect(saved.status()).toBe(200);const register=await api.get(`/api/attendance?grade=Grade%204&date=${date}`);expect(register.ok()).toBeTruthy();const registerData=await register.json() as {learners:Array<{id:string;status:string}>};expect(registerData.learners.find(item=>item.id===learner!.id)?.status).toBe("ABSENT");const idor=await api.post("/api/attendance",{data:{grade:"Grade 9",date,records:[{learnerId:learner!.id,status:"PRESENT"}]}});expect(idor.status()).toBe(403);await api.dispose();
});
