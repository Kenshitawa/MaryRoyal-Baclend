import { expect, test } from "@playwright/test";
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
 await page.getByLabel("Admission number").fill(`E2E-${Date.now()}`);
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
  const canViewSchoolRegister=["headteacher","deputy"].includes(role);
  expect(learners.status()).toBe(canViewSchoolRegister?200:403);
  await api.dispose();
 }
});
