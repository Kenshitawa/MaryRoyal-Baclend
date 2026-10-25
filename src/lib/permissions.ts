import { Role } from "@prisma/client";
export type Action = "view" | "create" | "update" | "delete" | "approve";
export type Resource = "dashboard" | "accounts" | "learners" | "attendance" | "assessments" | "finance" | "audit" | "operations" | "guardians";
export type DataScope = "school" | "assigned" | "linked" | "self" | "learner-identity" | "academic" | "operations" | "finance";
const matrix: Record<Resource, Partial<Record<Action, Role[]>>> = {
 dashboard: { view: Object.values(Role) },
 accounts: { view: [Role.DIRECTOR], create: [Role.DIRECTOR], update: [Role.DIRECTOR], delete: [Role.DIRECTOR] },
 learners: { view: [Role.DIRECTOR, Role.HEAD_TEACHER, Role.DEPUTY, Role.TEACHER, Role.PARENT, Role.LEARNER, Role.ACCOUNTANT], create: [Role.DIRECTOR], update: [Role.DIRECTOR, Role.HEAD_TEACHER], delete: [Role.DIRECTOR] },
 attendance: { view: [Role.DIRECTOR, Role.HEAD_TEACHER, Role.DEPUTY, Role.TEACHER, Role.PARENT, Role.LEARNER], create: [Role.DIRECTOR, Role.TEACHER], update: [Role.DIRECTOR, Role.TEACHER] },
 assessments: { view: [Role.DIRECTOR, Role.HEAD_TEACHER, Role.DEPUTY, Role.TEACHER, Role.PARENT, Role.LEARNER], create: [Role.DIRECTOR, Role.TEACHER], update: [Role.DIRECTOR, Role.TEACHER], approve: [Role.HEAD_TEACHER, Role.DIRECTOR] },
 finance: { view: [Role.DIRECTOR, Role.ACCOUNTANT, Role.PARENT], create: [Role.DIRECTOR, Role.ACCOUNTANT], update: [Role.DIRECTOR, Role.ACCOUNTANT], approve: [Role.DIRECTOR] },
 audit: { view: [Role.DIRECTOR, Role.HEAD_TEACHER] },
 operations: { view: [Role.DIRECTOR,Role.HEAD_TEACHER,Role.DEPUTY,Role.TEACHER], create: [Role.DIRECTOR,Role.DEPUTY,Role.TEACHER], update: [Role.DIRECTOR,Role.DEPUTY,Role.TEACHER] },
 guardians: { view:[Role.DIRECTOR],create:[Role.DIRECTOR],delete:[Role.DIRECTOR] }
};
const scopes: Record<Resource, Partial<Record<DataScope, Role[]>>> = {
 dashboard: { school: [Role.DIRECTOR], academic: [Role.HEAD_TEACHER], operations: [Role.DEPUTY], finance: [Role.ACCOUNTANT], assigned: [Role.TEACHER], linked: [Role.PARENT], self: [Role.LEARNER] },
 accounts: { school: [Role.DIRECTOR] },
 learners: { school: [Role.DIRECTOR, Role.HEAD_TEACHER, Role.DEPUTY], assigned: [Role.TEACHER], linked: [Role.PARENT], self: [Role.LEARNER], "learner-identity": [Role.ACCOUNTANT] },
 attendance: { school: [Role.DIRECTOR, Role.HEAD_TEACHER, Role.DEPUTY], assigned: [Role.TEACHER], linked: [Role.PARENT], self: [Role.LEARNER] },
 assessments: { school: [Role.DIRECTOR, Role.HEAD_TEACHER, Role.DEPUTY], assigned: [Role.TEACHER], linked: [Role.PARENT], self: [Role.LEARNER] },
 finance: { school: [Role.DIRECTOR, Role.ACCOUNTANT], linked: [Role.PARENT] },
 audit: { school: [Role.DIRECTOR, Role.HEAD_TEACHER] },
 operations: { school: [Role.DIRECTOR,Role.HEAD_TEACHER,Role.DEPUTY], assigned: [Role.TEACHER] },
 guardians: { school:[Role.DIRECTOR] }
};
export function can(role: Role, resource: Resource, action: Action): boolean { return matrix[resource][action]?.includes(role) ?? false; }
export function canInScope(role: Role, resource: Resource, action: Action, scope: DataScope): boolean { return can(role, resource, action) && (scopes[resource][scope]?.includes(role) ?? false); }
export function assertCan(role: Role, resource: Resource, action: Action): void { if (!can(role, resource, action)) throw new Error("FORBIDDEN"); }
export function assertCanInScope(role: Role, resource: Resource, action: Action, scope: DataScope): void { if (!canInScope(role, resource, action, scope)) throw new Error("FORBIDDEN"); }
