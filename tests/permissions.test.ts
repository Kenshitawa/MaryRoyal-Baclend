import { describe, expect, it } from "vitest";
import { Role } from "@prisma/client";
import { can, canInScope } from "../src/lib/permissions";
import { youtubeVideoId } from "../src/lib/learning-videos";

const resources = ["dashboard", "accounts", "staff", "staffAttendance", "learners", "admissions", "learnerAccounts", "attendance", "assessments", "discipline", "finance", "invoices", "payments", "payroll", "feeStructures", "audit", "operations", "guardians", "exports", "teachingLogs", "assignments", "learning", "learningVideos", "complaints", "examSessions", "rubrics", "feeWaivers"] as const;
const actions = ["view", "create", "update", "delete", "approve", "review", "release", "submit"] as const;
const grants: Record<Role, string[]> = {
 [Role.DIRECTOR]: ["dashboard:view","accounts:view","accounts:create","accounts:update","accounts:delete","staff:view","staffAttendance:view","staffAttendance:create","staffAttendance:update","learners:view","learners:delete","admissions:view","admissions:create","admissions:update","admissions:submit","learnerAccounts:create","attendance:view","attendance:create","attendance:update","assessments:view","assessments:approve","assessments:release","discipline:view","discipline:create","discipline:update","finance:view","invoices:view","invoices:create","payments:view","payments:update","payments:approve","payroll:view","payroll:approve","feeStructures:view","feeStructures:create","feeStructures:update","audit:view","operations:view","operations:create","operations:update","guardians:view","guardians:create","guardians:delete","exports:view","teachingLogs:view","teachingLogs:approve","learningVideos:view","learningVideos:create","learningVideos:update","complaints:view","complaints:update","examSessions:view","examSessions:create","examSessions:update","examSessions:approve","rubrics:view","rubrics:create","rubrics:update","feeWaivers:view","feeWaivers:approve"],
 [Role.HEAD_TEACHER]: ["dashboard:view","learners:view","learners:update","learners:approve","staff:view","staffAttendance:view","staffAttendance:create","staffAttendance:update","admissions:view","admissions:approve","attendance:view","assessments:view","assessments:approve","assessments:review","discipline:view","discipline:create","discipline:update","finance:view","invoices:view","payments:view","payments:approve","payroll:view","payroll:create","payroll:update","feeStructures:view","feeStructures:create","feeStructures:update","audit:view","operations:view","teachingLogs:view","teachingLogs:approve","learningVideos:view","learningVideos:create","learningVideos:update","complaints:view","complaints:update","examSessions:view","examSessions:create","examSessions:update","examSessions:approve","rubrics:view","rubrics:create","rubrics:update","feeWaivers:view"],
 [Role.DEPUTY]: ["dashboard:view","staff:view","staffAttendance:view","staffAttendance:create","staffAttendance:update","learners:view","admissions:view","attendance:view","assessments:view","discipline:view","discipline:create","discipline:update","operations:view","operations:create","operations:update","learningVideos:view","learningVideos:create","learningVideos:update","examSessions:view","examSessions:create","examSessions:update","rubrics:view","rubrics:create","rubrics:update"],
 [Role.SECRETARY]: ["dashboard:view","staff:view","staffAttendance:view","learners:view","learners:update","admissions:view","admissions:create","admissions:update","admissions:submit","learnerAccounts:create","finance:view","invoices:view","feeStructures:view"],
 [Role.ACCOUNTANT]: ["dashboard:view","staff:view","staffAttendance:view","learners:view","finance:view","invoices:view","invoices:create","payments:view","payments:create","payments:update","feeStructures:view","feeWaivers:view","feeWaivers:create"],
 [Role.TEACHER]: ["dashboard:view","staff:view","staffAttendance:view","learners:view","attendance:view","attendance:create","attendance:update","assessments:view","assessments:create","assessments:update","discipline:view","operations:view","operations:create","operations:update","teachingLogs:view","teachingLogs:create","assignments:view","assignments:create","assignments:update","learning:view","learning:create","learningVideos:view","learningVideos:create","examSessions:view","rubrics:view"],
 [Role.PARENT]: ["dashboard:view","learners:view","attendance:view","assessments:view","discipline:view","finance:view","invoices:view","payments:view","complaints:create","complaints:view"],
 [Role.LEARNER]: ["dashboard:view","learners:view","attendance:view","assessments:view","assignments:view","learning:view","learning:create","learningVideos:view"]
};

describe("permission matrix", () => {
 it("matches the allowlist for every role, resource and action", () => {
  for (const role of Object.values(Role)) for (const resource of resources) for (const action of actions) {
   expect(can(role, resource, action), `${role} ${resource}:${action}`).toBe(grants[role].includes(`${resource}:${action}`));
  }
 });
 it("limits learner editing strictly to Secretary and Head Teacher", () => {
  expect(can(Role.SECRETARY, "learners", "update")).toBe(true);
  expect(can(Role.HEAD_TEACHER, "learners", "update")).toBe(true);
  expect(can(Role.DIRECTOR, "learners", "update")).toBe(false);
  expect(can(Role.DEPUTY, "learners", "update")).toBe(false);
  expect(can(Role.ACCOUNTANT, "learners", "update")).toBe(false);
  expect(can(Role.TEACHER, "learners", "update")).toBe(false);
  expect(can(Role.PARENT, "learners", "update")).toBe(false);
  expect(can(Role.LEARNER, "learners", "update")).toBe(false);
 });
 it("limits admission logins and account administration", () => {
  expect(can(Role.SECRETARY,"learners","create")).toBe(false);
  expect(can(Role.SECRETARY,"learners","update")).toBe(true);
  expect(can(Role.SECRETARY,"learners","approve")).toBe(false);
  expect(canInScope(Role.SECRETARY,"admissions","create","school")).toBe(true);
  expect(canInScope(Role.SECRETARY,"admissions","submit","school")).toBe(true);
  expect(canInScope(Role.HEAD_TEACHER,"admissions","approve","school")).toBe(true);
  expect(canInScope(Role.DEPUTY,"admissions","view","school")).toBe(true);
  expect(can(Role.ACCOUNTANT,"admissions","view")).toBe(false);
  expect(canInScope(Role.SECRETARY,"learnerAccounts","create","school")).toBe(true);
  expect(can(Role.SECRETARY,"accounts","create")).toBe(false);
  expect(can(Role.DIRECTOR,"accounts","create")).toBe(true);
 });
 it("keeps fee read access distinct from fee entry", () => {
  expect(can(Role.SECRETARY,"invoices","view")).toBe(true);
  expect(can(Role.SECRETARY,"payments","create")).toBe(false);
  expect(can(Role.SECRETARY,"payments","update")).toBe(false);
  expect(can(Role.ACCOUNTANT,"invoices","create")).toBe(true);
  expect(can(Role.ACCOUNTANT,"payments","create")).toBe(true);
  expect(can(Role.ACCOUNTANT,"payroll","view")).toBe(false);
  expect(canInScope(Role.ACCOUNTANT,"finance","view","school")).toBe(true);
  expect(canInScope(Role.PARENT,"finance","view","school")).toBe(false);
 });
 it("keeps classroom marks with teachers and payroll authorization with the Director", () => {
  expect(can(Role.TEACHER,"assessments","create")).toBe(true);
  expect(can(Role.DIRECTOR,"assessments","create")).toBe(false);
  expect(can(Role.DIRECTOR,"assessments","release")).toBe(true);
  expect(can(Role.HEAD_TEACHER,"payroll","create")).toBe(true);
  expect(can(Role.DIRECTOR,"payroll","approve")).toBe(true);
 });
 it("limits complaints to parents and school leadership", () => {
  expect(canInScope(Role.PARENT,"complaints","create","self")).toBe(true);
  expect(canInScope(Role.PARENT,"complaints","view","self")).toBe(true);
  expect(canInScope(Role.DIRECTOR,"complaints","update","school")).toBe(true);
  expect(canInScope(Role.HEAD_TEACHER,"complaints","update","school")).toBe(true);
  for (const role of [Role.DEPUTY,Role.SECRETARY,Role.ACCOUNTANT,Role.TEACHER,Role.LEARNER]) {
   expect(can(role,"complaints","view")).toBe(false);
   expect(can(role,"complaints","create")).toBe(false);
   expect(can(role,"complaints","update")).toBe(false);
  }
 });
 it("keeps KICD videos limited to learners, assigned teachers and school leaders", () => {
  expect(canInScope(Role.LEARNER,"learningVideos","view","self")).toBe(true);
  expect(canInScope(Role.TEACHER,"learningVideos","create","assigned")).toBe(true);
  expect(canInScope(Role.DEPUTY,"learningVideos","create","school")).toBe(true);
  for(const role of [Role.PARENT,Role.SECRETARY,Role.ACCOUNTANT]) expect(can(role,"learningVideos","view")).toBe(false);
 });
 it("keeps parent, learner and teacher records scoped", () => {
  expect(canInScope(Role.TEACHER,"learners","view","assigned")).toBe(true);
  expect(canInScope(Role.TEACHER,"learners","view","school")).toBe(false);
  expect(canInScope(Role.PARENT,"learners","view","linked")).toBe(true);
  expect(canInScope(Role.LEARNER,"learners","view","self")).toBe(true);
  expect(canInScope(Role.ACCOUNTANT,"learners","view","learner-identity")).toBe(true);
  expect(canInScope(Role.ACCOUNTANT,"learners","view","school")).toBe(false);
  expect(canInScope(Role.LEARNER,"learning","view","self")).toBe(true);
  expect(canInScope(Role.LEARNER,"learning","create","self")).toBe(true);
  expect(canInScope(Role.LEARNER,"learning","create","assigned")).toBe(false);
  expect(canInScope(Role.HEAD_TEACHER,"staff","view","school")).toBe(true);
  expect(canInScope(Role.DEPUTY,"staff","view","school")).toBe(false);
  expect(canInScope(Role.LEARNER,"finance","view","linked")).toBe(false);
 });
 it("keeps profile enrichment records within their intended roles", () => {
  for (const role of [Role.DIRECTOR, Role.HEAD_TEACHER, Role.DEPUTY]) {
   expect(canInScope(role, "staffAttendance", "view", "school")).toBe(true);
   expect(canInScope(role, "staffAttendance", "create", "school")).toBe(true);
   expect(canInScope(role, "discipline", "view", "school")).toBe(true);
  }
  for (const role of [Role.SECRETARY, Role.ACCOUNTANT, Role.TEACHER]) {
   expect(canInScope(role, "staffAttendance", "view", "self")).toBe(true);
   expect(canInScope(role, "staffAttendance", "view", "school")).toBe(false);
  }
  expect(canInScope(Role.TEACHER, "discipline", "view", "assigned")).toBe(true);
  expect(canInScope(Role.PARENT, "discipline", "view", "linked")).toBe(true);
  expect(can(Role.ACCOUNTANT, "discipline", "view")).toBe(false);
  expect(can(Role.LEARNER, "discipline", "view")).toBe(false);
  expect(canInScope(Role.ACCOUNTANT, "learners", "view", "learner-identity")).toBe(true);
 });
});

describe("KICD video URL parsing", () => {
 it("accepts supported YouTube URL forms but rejects non-YouTube URLs and malformed ids", () => {
  expect(youtubeVideoId("https://www.youtube.com/watch?v=Abcdefgh_12")).toBe("Abcdefgh_12");
  expect(youtubeVideoId("https://youtu.be/Abcdefgh_12?t=15")).toBe("Abcdefgh_12");
  expect(youtubeVideoId("https://youtube.com/embed/Abcdefgh_12")).toBe("Abcdefgh_12");
  expect(youtubeVideoId("https://example.com/watch?v=Abcdefgh_12")).toBeNull();
  expect(youtubeVideoId("https://youtube.com/watch?v=bad")).toBeNull();
 });
});
