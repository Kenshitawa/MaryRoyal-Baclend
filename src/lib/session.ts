import { SignJWT, jwtVerify } from "jose";
const secret = new TextEncoder().encode(process.env.SESSION_SECRET ?? "development-secret-change-me-please-32");
export async function makeSession(user: { id: string; role: string; forcePasswordChange: boolean }) { return new SignJWT({ role: user.role, forcePasswordChange: user.forcePasswordChange }).setProtectedHeader({ alg: "HS256" }).setSubject(user.id).setIssuedAt().setExpirationTime("8h").sign(secret); }
export async function readSession(token: string) { try { const { payload } = await jwtVerify(token, secret); return { id: payload.sub!, role: String(payload.role), forcePasswordChange: Boolean(payload.forcePasswordChange) }; } catch { return null; } }
