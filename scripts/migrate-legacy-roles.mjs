import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
try {
  // Accountant access is retired. Preserve the old account/history, migrate it
  // to the least-privileged staff role, and suspend it for Director review.
  await db.$executeRawUnsafe('UPDATE "User" SET "role" = ?, "suspended" = 1 WHERE "role" = ?', "HEAD_TEACHER", "ACCOUNTANT");
} catch (error) {
  const message = error instanceof Error ? error.message : "";
  if (!message.includes("no such table") && !message.includes("does not exist")) throw error;
} finally {
  await db.$disconnect();
}
