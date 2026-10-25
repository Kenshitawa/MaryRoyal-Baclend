import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Mary Royal School | Nurturing Excellence Through CBE", description: "Mary Royal School management portal", applicationName: "Mary Royal SMS" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
