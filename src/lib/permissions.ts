import { Role } from "@prisma/client";
export type Action = "view" | "create" | "update" | "delete" | "approve" | "review" | "release";
export type Resource = "dashboard" | "accounts" | "learners" | "attendance" | "assessments" | "finance" | "invoices" | "payments" | "payroll" | "audit" | "operations" | "guardians" | "exports" | "teachingLogs" | "assignments" | "complaints";
export type DataScope = "school" | "assigned" | "linked" | "self" | "learner-identity" | "academic" | "operations" | "finance";
const matrix: Record<Resource, Partial<Record<Action, Role[]>>> = {
 dashboard: { view: Object.values(Role) },
 accounts: { view: [Role.DIRECTOR], create: [Role.DIRECTOR], update: [Role.DIRECTOR], delete: [Role.DIRECTOR] },
 learners: { view: [Role.DIRECTOR, Role.HEAD_TEACHER, Role.DEPUTY, Role.SECRETARY, Role.TEACHER, Role.PARENT, Role.LEARNER], create: [Role.DIRECTOR, Role.SECRETARY], update: [Role.DIRECTOR, Role.HEAD_TEACHER], approve: [Role.HEAD_TEACHER], delete: [Role.DIRECTOR] },
 attendance: { view: [Role.DIRECTOR, Role.HEAD_TEACHER, Role.DEPUTY, Role.TEACHER, Role.PARENT, Role.LEARNER], create: [Role.DIRECTOR, Role.TEACHER], update: [Role.DIRECTOR, Role.TEACHER] },
 assessments: { view: [Role.DIRECTOR, Role.HEAD_TEACHER, Role.DEPUTY, Role.TEACHER, Role.PARENT, Role.LEARNER], create: [Role.TEACHER], update: [Role.TEACHER], approve: [Role.HEAD_TEACHER, Role.DIRECTOR], review:[Role.HEAD_TEACHER],release:[Role.DIRECTOR] },
 finance: { view: [Role.DIRECTOR, Role.HEAD_TEACHER, Role.SECRETARY, Role.PARENT] },
 invoices: { view: [Role.DIRECTOR, Role.HEAD_TEACHER, Role.SECRETARY, Role.PARENT], create: [Role.HEAD_TEACHER] },
 payments: { view: [Role.DIRECTOR, Role.HEAD_TEACHER, Role.SECRETARY, Role.PARENT], create: [Role.SECRETARY], update: [Role.HEAD_TEACHER, Role.DIRECTOR], approve: [Role.HEAD_TEACHER, Role.DIRECTOR] },
 payroll: { view: [Role.DIRECTOR, Role.HEAD_TEACHER], create: [Role.HEAD_TEACHER], update: [Role.HEAD_TEACHER], approve: [Role.DIRECTOR] },
 audit: { view: [Role.DIRECTOR, Role.HEAD_TEACHER] },
 operations: { view: [Role.DIRECTOR,Role.HEAD_TEACHER,Role.DEPUTY,Role.TEACHER], create: [Role.DIRECTOR,Role.DEPUTY,Role.TEACHER], update: [Role.DIRECTOR,Role.DEPUTY,Role.TEACHER] },
 guardians: { view:[Role.DIRECTOR],create:[Role.DIRECTOR],delete:[Role.DIRECTOR] },
 exports: { view:[Role.DIRECTOR] },
 teachingLogs: { view:[Role.DIRECTOR,Role.HEAD_TEACHER,Role.TEACHER], create:[Role.TEACHER], approve:[Role.DIRECTOR,Role.HEAD_TEACHER] },
 assignments: { view:[Role.TEACHER,Role.LEARNER], create:[Role.TEACHER], update:[Role.TEACHER] },
 complaints: { view:[Role.DIRECTOR,Role.HEAD_TEACHER,Role.DEPUTY,Role.TEACHER,Role.SECRETARY,Role.PARENT,Role.LEARNER], create:[Role.PARENT,Role.LEARNER,Role.HEAD_TEACHER,Role.SECRETARY], update:[Role.DIRECTOR,Role.HEAD_TEACHER,Role.DEPUTY,Role.TEACHER,Role.SECRETARY,Role.PARENT,Role.LEARNER] }
};
const scopes: Record<Resource, Partial<Record<DataScope, Role[]>>> = {
 dashboard: { school: [Role.DIRECTOR], academic: [Role.HEAD_TEACHER], operations: [Role.DEPUTY], finance: [Role.HEAD_TEACHER,Role.SECRETARY], assigned: [Role.TEACHER], linked: [Role.PARENT], self: [Role.LEARNER] },
 accounts: { school: [Role.DIRECTOR] },
 learners: { school: [Role.DIRECTOR, Role.HEAD_TEACHER, Role.DEPUTY, Role.SECRETARY], assigned: [Role.TEACHER], linked: [Role.PARENT], self: [Role.LEARNER] },
 attendance: { school: [Role.DIRECTOR, Role.HEAD_TEACHER, Role.DEPUTY], assigned: [Role.TEACHER], linked: [Role.PARENT], self: [Role.LEARNER] },
 assessments: { school: [Role.DIRECTOR, Role.HEAD_TEACHER, Role.DEPUTY], assigned: [Role.TEACHER], linked: [Role.PARENT], self: [Role.LEARNER] },
 finance: { school: [Role.DIRECTOR, Role.HEAD_TEACHER, Role.SECRETARY], linked: [Role.PARENT] },
 invoices: { school: [Role.DIRECTOR, Role.HEAD_TEACHER, Role.SECRETARY], linked: [Role.PARENT] },
 payments: { school: [Role.DIRECTOR, Role.HEAD_TEACHER, Role.SECRETARY], linked: [Role.PARENT] },
 payroll: { school: [Role.DIRECTOR, Role.HEAD_TEACHER] },
 audit: { school: [Role.DIRECTOR, Role.HEAD_TEACHER] },
 operations: { school: [Role.DIRECTOR,Role.HEAD_TEACHER,Role.DEPUTY], assigned: [Role.TEACHER] },
 guardians: { school:[Role.DIRECTOR] },
 exports: { school:[Role.DIRECTOR] },
 teachingLogs: { school:[Role.DIRECTOR,Role.HEAD_TEACHER], assigned:[Role.TEACHER] },
 assignments: { assigned:[Role.TEACHER], self:[Role.LEARNER] },
 complaints: { school:[Role.DIRECTOR,Role.HEAD_TEACHER], assigned:[Role.DEPUTY,Role.TEACHER], self:[Role.PARENT,Role.LEARNER,Role.SECRETARY] }
};
export function can(role: Role, resource: Resource, action: Action): boolean { return matrix[resource][action]?.includes(role) ?? false; }
export function canInScope(role: Role, resource: Resource, action: Action, scope: DataScope): boolean { return can(role, resource, action) && (scopes[resource][scope]?.includes(role) ?? false); }
export function assertCan(role: Role, resource: Resource, action: Action): void { if (!can(role, resource, action)) throw new Error("FORBIDDEN"); }
export function assertCanInScope(role: Role, resource: Resource, action: Action, scope: DataScope): void { if (!canInScope(role, resource, action, scope)) throw new Error("FORBIDDEN"); }
