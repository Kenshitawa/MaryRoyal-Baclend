import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Mary Royal School | Nurturing Excellence Through CBE", description: "Mary Royal School management portal", applicationName: "Mary Royal SMS", manifest: "/manifest.webmanifest", icons: { icon: "/logo.svg" } };
export const viewport: Viewport = { themeColor: "#1d4ed8" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
