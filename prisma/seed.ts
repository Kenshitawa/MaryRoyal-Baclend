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
  const teacher = await db.user.findUniqueOrThrow({ where: { email: "teacher@maryroyal.ac.ke" } });
  for (const grade of ["Grade 4", "Grade 5", "Grade 6"]) {
    for (const subject of ["English", "Mathematics", "Science"]) {
      await db.teacherAssignment.upsert({ where: { teacherId_grade_subject: { teacherId: teacher.id, grade, subject } }, create: { teacherId: teacher.id, grade, subject }, update: {} });
    }
  }
  const learners = await db.learner.findMany({ where: { archivedAt: null }, orderBy: { admissionNo: "asc" } });
  const parent = await db.user.findUniqueOrThrow({ where: { email: "parent@maryroyal.ac.ke" } });
  const learnerAccount = await db.user.findUniqueOrThrow({ where: { email: "learner@maryroyal.ac.ke" } });
  for (const child of learners.slice(0, 2)) await db.guardianLink.upsert({ where: { userId_learnerId: { userId: parent.id, learnerId: child.id } }, create: { userId: parent.id, learnerId: child.id, relation: "Parent" }, update: {} });
  if (learners[0]) await db.guardianLink.upsert({ where: { userId_learnerId: { userId: learnerAccount.id, learnerId: learners[0].id } }, create: { userId: learnerAccount.id, learnerId: learners[0].id, relation: "Learner" }, update: {} });
  for (const [index, learner] of learners.entries()) {
    for (const subject of ["English", "Mathematics", "Science"]) {
      for (const [termIndex, term] of ["2026 Term 1", "2026 Term 2"].entries()) {
        if (await db.assessment.findFirst({ where: { learnerId: learner.id, subject, term } })) continue;
        const score = 45 + ((index * 7 + subject.length * 3 + termIndex * 5) % 51);
        const status = termIndex === 0 ? "RELEASED" : "DRAFT";
        const assessment = await db.assessment.create({ data: { learnerId: learner.id, enteredById: teacher.id, subject, score, term, strand: subject === "Mathematics" ? "Number" : "Communication and collaboration", competency: `Apply ${subject.toLowerCase()} skills`, comment: "Keep practising and asking thoughtful questions.", status } });
        await db.assessmentHistory.create({ data: { assessmentId: assessment.id, actorId: teacher.id, version: 1, newScore: score } });
      }
    }
  }
}
main().finally(() => db.$disconnect());
