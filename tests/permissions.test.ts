import { describe, expect, it } from "vitest";
import { Role } from "@prisma/client";
import { can, canInScope } from "../src/lib/permissions";
const roles = Object.values(Role);
const resources = ["dashboard", "accounts", "learners", "attendance", "assessments", "finance", "audit", "operations", "guardians"] as const;
const actions = ["view", "create", "update", "delete", "approve"] as const;
const grants: Record<Role, string[]> = {
 [Role.DIRECTOR]: ["dashboard:view","accounts:view","accounts:create","accounts:update","accounts:delete","learners:view","learners:create","learners:update","learners:delete","attendance:view","attendance:create","attendance:update","assessments:view","assessments:create","assessments:update","assessments:approve","finance:view","finance:create","finance:update","finance:approve","audit:view","operations:view","operations:create","operations:update","guardians:view","guardians:create","guardians:delete"],
 [Role.HEAD_TEACHER]: ["dashboard:view","learners:view","learners:update","attendance:view","assessments:view","assessments:approve","audit:view","operations:view"],
 [Role.DEPUTY]: ["dashboard:view","learners:view","attendance:view","assessments:view","operations:view","operations:create","operations:update"],
 [Role.ACCOUNTANT]: ["dashboard:view","learners:view","finance:view","finance:create","finance:update"],
 [Role.TEACHER]: ["dashboard:view","learners:view","attendance:view","attendance:create","attendance:update","assessments:view","assessments:create","assessments:update","operations:view","operations:create","operations:update"],
 [Role.PARENT]: ["dashboard:view","learners:view","attendance:view","assessments:view","finance:view"],
 [Role.LEARNER]: ["dashboard:view","learners:view","attendance:view","assessments:view"]
};
describe("permission matrix", () => {
 it("matches the allowlist for every role, resource and action", () => {
  for (const role of roles) for (const resource of resources) for (const action of actions) {
   expect(can(role, resource, action), `${role} ${resource}:${action}`).toBe(grants[role].includes(`${resource}:${action}`));
  }
 });
 it("does not grant accountants academic, attendance, audit or messaging access", () => {
  expect(can(Role.ACCOUNTANT,"assessments","view")).toBe(false);
  expect(can(Role.ACCOUNTANT,"attendance","view")).toBe(false);
  expect(can(Role.ACCOUNTANT,"audit","view")).toBe(false);
 });
 it("keeps learner access within role scope", () => {
  expect(canInScope(Role.TEACHER,"learners","view","assigned")).toBe(true);
  expect(canInScope(Role.TEACHER,"learners","view","school")).toBe(false);
  expect(canInScope(Role.PARENT,"learners","view","linked")).toBe(true);
  expect(canInScope(Role.LEARNER,"learners","view","self")).toBe(true);
  expect(canInScope(Role.ACCOUNTANT,"learners","view","learner-identity")).toBe(true);
  expect(canInScope(Role.ACCOUNTANT,"learners","view","school")).toBe(false);
 });
});
