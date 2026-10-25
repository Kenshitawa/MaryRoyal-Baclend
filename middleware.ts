import { NextResponse, type NextRequest } from "next/server";
import { readSession } from "@/lib/session";
export async function middleware(request: NextRequest) {
 const path = request.nextUrl.pathname;
 if (path.startsWith("/api/login") || path.startsWith("/api/logout") || path === "/" || path.startsWith("/_next") || path === "/favicon.ico") return NextResponse.next();
 const token = request.cookies.get("mary_session")?.value; const session = token ? await readSession(token) : null;
 if (!session) return path.startsWith("/api/") ? NextResponse.json({ error: "Unauthenticated" }, { status: 401 }) : NextResponse.redirect(new URL("/", request.url));
 if (session.forcePasswordChange && path !== "/change-password" && !path.startsWith("/api/change-password")) return path.startsWith("/api/") ? NextResponse.json({ error: "Password change required" }, { status: 403 }) : NextResponse.redirect(new URL("/change-password", request.url));
 return NextResponse.next();
}
export const config = { matcher: ["/dashboard/:path*", "/change-password", "/api/:path*"] };
