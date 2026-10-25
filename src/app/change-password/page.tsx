import ChangePasswordForm from "./change-password-form";
import Image from "next/image";
import ThemeToggle from "@/components/theme-toggle";
export default function Page(){return <main className="relative grid min-h-screen place-items-center bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-white p-5"><div className="absolute right-5 top-5"><ThemeToggle compact/></div><div className="w-full max-w-md"><div className="mb-5 flex items-center gap-3"><Image src="/mary-royal-logo.png" width={42} height={42} alt="Mary Royal School"/><div><p className="font-extrabold text-slate-900">Mary Royal School</p><p className="text-xs text-slate-500">Secure account setup</p></div></div><ChangePasswordForm/></div></main>}
