import { describe, expect, it } from "vitest";
import { Role } from "@prisma/client";
import { can, canInScope } from "../src/lib/permissions";

const resources = ["dashboard", "accounts", "learners", "attendance", "assessments", "finance", "invoices", "payments", "payroll", "audit", "operations", "guardians", "exports", "teachingLogs", "assignments", "learning", "complaints"] as const;
const actions = ["view", "create", "update", "delete", "approve", "review", "release"] as const;
const grants: Record<Role, string[]> = {
 [Role.DIRECTOR]: ["dashboard:view","accounts:view","accounts:create","accounts:update","accounts:delete","learners:view","learners:create","learners:update","learners:delete","attendance:view","attendance:create","attendance:update","assessments:view","assessments:approve","assessments:release","finance:view","invoices:view","payments:view","payments:update","payments:approve","payroll:view","payroll:approve","audit:view","operations:view","operations:create","operations:update","guardians:view","guardians:create","guardians:delete","exports:view","teachingLogs:view","teachingLogs:approve","complaints:view","complaints:update"],
 [Role.HEAD_TEACHER]: ["dashboard:view","learners:view","learners:update","learners:approve","attendance:view","assessments:view","assessments:approve","assessments:review","finance:view","invoices:view","invoices:create","payments:view","payments:update","payments:approve","payroll:view","payroll:create","payroll:update","audit:view","operations:view","teachingLogs:view","teachingLogs:approve","complaints:view","complaints:create","complaints:update"],
 [Role.DEPUTY]: ["dashboard:view","learners:view","attendance:view","assessments:view","operations:view","operations:create","operations:update","complaints:view","complaints:update"],
 [Role.SECRETARY]: ["dashboard:view","learners:view","learners:create","finance:view","invoices:view","payments:view","payments:create","complaints:view","complaints:create","complaints:update"],
 [Role.TEACHER]: ["dashboard:view","learners:view","attendance:view","attendance:create","attendance:update","assessments:view","assessments:create","assessments:update","operations:view","operations:create","operations:update","teachingLogs:view","teachingLogs:create","assignments:view","assignments:create","assignments:update","learning:view","learning:create","complaints:view","complaints:update"],
 [Role.PARENT]: ["dashboard:view","learners:view","attendance:view","assessments:view","finance:view","invoices:view","payments:view","complaints:create","complaints:view","complaints:update"],
 [Role.LEARNER]: ["dashboard:view","learners:view","attendance:view","assessments:view","assignments:view","learning:view","learning:create"]
};
describe("permission matrix", () => {
 it("matches the allowlist for every role, resource and action", () => {
  for (const role of Object.values(Role)) for (const resource of resources) for (const action of actions) {
   expect(can(role, resource, action), `${role} ${resource}:${action}`).toBe(grants[role].includes(`${resource}:${action}`));
  }
 });
 it("keeps Director approval above Secretary admission and fee entry", () => {
  expect(can(Role.SECRETARY,"learners","create")).toBe(true);
  expect(can(Role.SECRETARY,"learners","approve")).toBe(false);
  expect(can(Role.HEAD_TEACHER,"learners","approve")).toBe(true);
  expect(can(Role.SECRETARY,"payments","create")).toBe(true);
  expect(can(Role.SECRETARY,"invoices","create")).toBe(false);
  expect(can(Role.HEAD_TEACHER,"invoices","create")).toBe(true);
  expect(can(Role.HEAD_TEACHER,"payments","approve")).toBe(true);
  expect(can(Role.DIRECTOR,"invoices","create")).toBe(false);
 });
 it("keeps classroom marks with teachers and payroll authorization with the Director", () => {
  expect(can(Role.TEACHER,"assessments","create")).toBe(true);
  expect(can(Role.DIRECTOR,"assessments","create")).toBe(false);
  expect(can(Role.DIRECTOR,"assessments","release")).toBe(true);
  expect(can(Role.HEAD_TEACHER,"payroll","create")).toBe(true);
  expect(can(Role.DIRECTOR,"payroll","approve")).toBe(true);
 });
 it("keeps learner and family access scoped", () => {
  expect(canInScope(Role.TEACHER,"learners","view","assigned")).toBe(true);
  expect(canInScope(Role.TEACHER,"learners","view","school")).toBe(false);
  expect(canInScope(Role.PARENT,"learners","view","linked")).toBe(true);
  expect(canInScope(Role.LEARNER,"learners","view","self")).toBe(true);
  expect(canInScope(Role.LEARNER,"learning","view","self")).toBe(true);
  expect(canInScope(Role.LEARNER,"learning","create","self")).toBe(true);
  expect(canInScope(Role.LEARNER,"learning","create","assigned")).toBe(false);
  expect(can(Role.LEARNER,"complaints","view")).toBe(false);
  expect(can(Role.LEARNER,"complaints","create")).toBe(false);
  expect(canInScope(Role.PARENT,"finance","view","school")).toBe(false);
  expect(canInScope(Role.LEARNER,"finance","view","linked")).toBe(false);
 });
});
