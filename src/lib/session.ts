import { SignJWT, jwtVerify } from "jose";
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret || sessionSecret.length < 32) throw new Error("SESSION_SECRET must be set to at least 32 characters. Run npm run setup.");
const secret = new TextEncoder().encode(sessionSecret);
export async function makeSession(user: { id: string; role: string; forcePasswordChange: boolean }) { return new SignJWT({ role: user.role, forcePasswordChange: user.forcePasswordChange }).setProtectedHeader({ alg: "HS256" }).setSubject(user.id).setIssuedAt().setExpirationTime("8h").sign(secret); }
export async function readSession(token: string) { try { const { payload } = await jwtVerify(token, secret); return { id: payload.sub!, role: String(payload.role), forcePasswordChange: Boolean(payload.forcePasswordChange) }; } catch { return null; } }
