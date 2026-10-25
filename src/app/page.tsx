import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { readSession } from "@/lib/session";
import { Role } from "@prisma/client";
import LoginForm from "./login-form";
export default async function Home() {
 const token = (await cookies()).get("mary_session")?.value;
 if (token) { const user = await readSession(token); if (user) redirect("/dashboard"); }
 return <main className="min-h-screen grid lg:grid-cols-2 bg-white"><section className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-blue-800 to-blue-600 text-white p-16"><div className="text-sm font-semibold tracking-[.22em]">MARY ROYAL SCHOOL</div><div><div className="mb-6 h-16 w-16 rounded-2xl bg-white/15 grid place-items-center text-3xl">✦</div><h1 className="text-5xl font-semibold leading-tight">Nurturing Excellence Through CBE</h1><p className="mt-5 max-w-md text-blue-100">A trusted home for learning, growth and partnership in Obunga, Kisumu.</p></div><p className="text-sm text-blue-100">© 2026 Mary Royal School · Kisumu, Kenya</p></section><section className="flex items-center justify-center p-6"><div className="w-full max-w-md"><div className="mb-10 lg:hidden text-blue-700 font-bold tracking-widest">MARY ROYAL SCHOOL</div><h2 className="text-3xl font-bold">Welcome back</h2><p className="mt-2 text-slate-500">Sign in to your school portal.</p><LoginForm/><p className="mt-10 text-center text-xs text-slate-400">Secure access for the Mary Royal School community</p></div></section></main>;
}
