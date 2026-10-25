import { Role } from "@prisma/client";
export type Action = "view" | "create" | "update" | "delete" | "approve";
export type Resource = "dashboard" | "accounts" | "learners" | "attendance" | "assessments" | "finance" | "audit";
const matrix: Record<Resource, Partial<Record<Action, Role[]>>> = {
 dashboard: { view: Object.values(Role) },
 accounts: { view: [Role.DIRECTOR], create: [Role.DIRECTOR], update: [Role.DIRECTOR], delete: [Role.DIRECTOR] },
 learners: { view: [Role.DIRECTOR, Role.HEAD_TEACHER, Role.DEPUTY, Role.TEACHER, Role.PARENT, Role.LEARNER, Role.ACCOUNTANT], create: [Role.DIRECTOR], update: [Role.DIRECTOR, Role.HEAD_TEACHER], delete: [Role.DIRECTOR] },
 attendance: { view: [Role.DIRECTOR, Role.HEAD_TEACHER, Role.DEPUTY, Role.TEACHER, Role.PARENT, Role.LEARNER], create: [Role.DIRECTOR, Role.TEACHER], update: [Role.DIRECTOR, Role.TEACHER] },
 assessments: { view: [Role.DIRECTOR, Role.HEAD_TEACHER, Role.DEPUTY, Role.TEACHER, Role.PARENT, Role.LEARNER], create: [Role.DIRECTOR, Role.TEACHER], update: [Role.DIRECTOR, Role.TEACHER], approve: [Role.HEAD_TEACHER, Role.DIRECTOR] },
 finance: { view: [Role.DIRECTOR, Role.ACCOUNTANT, Role.PARENT], create: [Role.DIRECTOR, Role.ACCOUNTANT], update: [Role.DIRECTOR, Role.ACCOUNTANT], approve: [Role.DIRECTOR] },
 audit: { view: [Role.DIRECTOR, Role.HEAD_TEACHER] }
};
export function can(role: Role, resource: Resource, action: Action): boolean { return matrix[resource][action]?.includes(role) ?? false; }
export function assertCan(role: Role, resource: Resource, action: Action): void { if (!can(role, resource, action)) throw new Error("FORBIDDEN"); }
