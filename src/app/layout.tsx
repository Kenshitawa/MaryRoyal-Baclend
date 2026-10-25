import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import IdleSessionGuard from "@/components/idle-session-guard";
export const metadata: Metadata = { title: "Mary Royal School | Hard work pays", description: "Mary Royal School · Nurturing Excellence Through CBE", applicationName: "Mary Royal SMS", manifest: "/manifest.webmanifest", icons: { icon: "/mary-royal-logo.png" } };
export const viewport: Viewport = { themeColor: "#1d4ed8" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" suppressHydrationWarning><head><Script id="mary-theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: `try { if (localStorage.getItem("mary-theme") === "dark") document.documentElement.dataset.theme = "dark"; } catch {}` }}/></head><body>{children}<IdleSessionGuard /></body></html>; }
