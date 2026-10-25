import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
const db = new PrismaClient();
async function main() {
  const accounts = [
    ["director@maryroyal.ac.ke", "Mary Royal Director", Role.DIRECTOR],
    ["headteacher@maryroyal.ac.ke", "Demo Head Teacher", Role.HEAD_TEACHER],
    ["deputy@maryroyal.ac.ke", "Demo Deputy Head", Role.DEPUTY],
    ["accountant@maryroyal.ac.ke", "Demo Accountant", Role.ACCOUNTANT],
    ["teacher@maryroyal.ac.ke", "Demo Teacher", Role.TEACHER],
    ["parent@maryroyal.ac.ke", "Demo Parent", Role.PARENT],
    ["learner@maryroyal.ac.ke", "Demo Learner", Role.LEARNER]
  ] as const;
  const passwordHash = await bcrypt.hash("MaryRoyal2026!", 12);
  for (const [email, name, role] of accounts) {
    if (!await db.user.findUnique({ where: { email } })) await db.user.create({ data: { name, email, passwordHash, role, forcePasswordChange: true } });
  }
  const roster = [
    ["Achieng Otieno","Female"],["Brian Ouma","Male"],["Faith Akoth","Female"],["Kevin Onyango","Male"],["Lilian Atieno","Female"],
    ["Moses Odhiambo","Male"],["Joyce Auma","Female"],["Collins Ochieng","Male"],["Esther Anyango","Female"],["David Omondi","Male"],
    ["Mercy Adhiambo","Female"],["Peter Ouma","Male"],["Ruth Akinyi","Female"],["Samuel Okoth","Male"],["Brenda Awino","Female"],
    ["Dennis Otieno","Male"],["Grace Atieno","Female"],["Mark Ochieng","Male"],["Diana Auma","Female"],["Victor Onyango","Male"],
    ["Sarah Akoth","Female"],["George Odhiambo","Male"],["Leah Anyango","Female"],["Felix Omondi","Male"],["Cynthia Adhiambo","Female"],
    ["Eric Ouma","Male"],["Naomi Akinyi","Female"],["Joseph Okoth","Male"],["Stella Awino","Female"],["Martin Otieno","Male"]
  ] as const;
  for (const [index, [name, gender]] of roster.entries()) {
    const grade = `Grade ${Math.floor(index / 10) + 4}`;
    const admissionNo = `MR-2026-${String(index + 1).padStart(3, "0")}`;
    await db.learner.upsert({ where: { admissionNo }, create: { admissionNo, name, grade, gender }, update: {} });
  }
}
main().finally(() => db.$disconnect());
