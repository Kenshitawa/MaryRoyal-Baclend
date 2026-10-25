import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
const db = new PrismaClient();
async function main() {
  const email = "director@maryroyal.ac.ke";
  const existing = await db.user.findUnique({ where: { email } });
  if (!existing) await db.user.create({ data: { name: "Mary Royal Director", email, passwordHash: await bcrypt.hash("MaryRoyal2026!", 12), role: Role.DIRECTOR, forcePasswordChange: true } });
  const learners = [
    ["MR-2026-001", "Achieng Otieno", "Grade 4", "Female"],
    ["MR-2026-002", "Brian Ouma", "Grade 4", "Male"],
    ["MR-2026-003", "Faith Akoth", "Grade 5", "Female"],
    ["MR-2026-004", "Kevin Onyango", "Grade 5", "Male"],
    ["MR-2026-005", "Lilian Atieno", "Grade 6", "Female"]
  ];
  for (const [admissionNo, name, grade, gender] of learners) await db.learner.upsert({ where: { admissionNo }, create: { admissionNo, name, grade, gender }, update: {} });
}
main().finally(() => db.$disconnect());
