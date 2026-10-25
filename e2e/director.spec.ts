import { expect, test } from "@playwright/test";
let testLearnerAdmission="";
let testOutOfScopeLearnerId="";
test("Director signs in, changes temporary password when required, and manages learners and accounts", async ({ page }) => {
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
 const outOfScope=await page.evaluate(async(admissionNo)=>{const response=await fetch("/api/learners",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({admissionNo,name:"Scope Test Learner",grade:"Grade 9",gender:"Male"})});return response.json();},`E2E-SCOPE-${Date.now()}`) as {learner:{id:string}};
 testOutOfScopeLearnerId=outOfScope.learner.id;
});
test("unauthenticated users cannot read learner data", async ({ request }) => {
 const response = await request.get("/api/learners");
 expect(response.status()).toBe(401);
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
  const learners=await api.get("/api/learners");
  const canViewLearners=["headteacher","deputy","teacher","accountant"].includes(role);
  expect(learners.status()).toBe(canViewLearners?200:403);
  if(role==="accountant"&&learners.ok()){
   const result=await learners.json() as {learners:Array<Record<string,unknown>>};
   expect(Object.keys(result.learners[0]??{}).sort()).toEqual(["admissionNo","grade","id","name"]);
  }
  const assessments=await api.get("/api/assessments");
  const canViewAssessments=["headteacher","deputy","teacher"].includes(role);
  expect(assessments.status()).toBe(canViewAssessments?200:403);
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
