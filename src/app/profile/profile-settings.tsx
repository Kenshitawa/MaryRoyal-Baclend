"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { Camera, KeyRound, ShieldCheck } from "lucide-react";

export default function ProfileSettings({ name, email, role, initialAvatar }: { name: string; email: string; role: string; initialAvatar: string | null }) {
  const input = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState(initialAvatar);
  const [photoMessage, setPhotoMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setPhotoMessage("");
    const photo = input.current?.files?.[0]; if (!photo) { setPhotoMessage("Choose a photo first."); setBusy(false); return; }
    const data = new FormData(); data.set("photo", photo);
    const response = await fetch("/api/profile", { method: "POST", body: data }); const result = await response.json();
    if (response.ok) { setAvatar(result.avatarUrl); setPhotoMessage("Profile photo updated."); }
    else setPhotoMessage(result.error ?? "The photo could not be saved.");
    setBusy(false);
  }
  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setPasswordMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/change-password", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ currentPassword: form.get("currentPassword"), password: form.get("password") }) });
    const result = await response.json(); setBusy(false);
    if (response.ok) { setPasswordMessage("Password changed. Your current device remains signed in."); event.currentTarget.reset(); }
    else setPasswordMessage(result.error ?? "Check your current password and new password.");
  }
  return <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <div className="flex items-center gap-4"><div className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-blue-100 text-xl font-bold text-blue-800">{avatar ? <Image src={avatar} alt={`${name}'s profile photo`} fill sizes="80px" className="object-cover" unoptimized/> : name.split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase()}<span className="absolute bottom-0 right-0 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-blue-700 text-white"><Camera size={13}/></span></div><div><h2 className="font-bold text-slate-900">{name}</h2><p className="mt-1 text-sm text-slate-500">{role.replaceAll("_", " ")}</p></div></div>
      <p className="mt-5 text-sm text-slate-600">{email}</p>
      <form onSubmit={upload} className="mt-6 border-t border-slate-100 pt-5"><label htmlFor="photo" className="mb-2 block text-sm font-semibold">Profile photo</label><input ref={input} id="photo" name="photo" type="file" accept="image/png,image/jpeg,image/webp" className="block min-h-11 w-full rounded-xl border border-slate-200 p-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-semibold file:text-blue-800"/><p className="mt-2 text-xs text-slate-500">PNG, JPEG or WebP · up to 2 MB.</p><button disabled={busy} className="mt-4 min-h-11 rounded-xl bg-blue-700 px-4 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-60">Save photo</button>{photoMessage&&<p role="status" className="mt-3 text-sm text-blue-800">{photoMessage}</p>}</form>
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700"><KeyRound size={19}/></span><div><h2 className="font-bold text-slate-900">Change password</h2><p className="mt-1 text-xs text-slate-500">Use at least 12 characters.</p></div></div><form onSubmit={changePassword} className="mt-5 space-y-4"><label className="block text-sm font-medium">Current password<input name="currentPassword" type="password" autoComplete="current-password" required minLength={1} className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 px-3"/></label><label className="block text-sm font-medium">New password<input name="password" type="password" autoComplete="new-password" required minLength={12} className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 px-3"/></label><button disabled={busy} className="min-h-11 rounded-xl bg-blue-700 px-4 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-60">Update password</button>{passwordMessage&&<p role="status" className="text-sm text-blue-800">{passwordMessage}</p>}</form><div className="mt-7 flex gap-3 rounded-xl bg-blue-50 p-4 text-sm text-blue-900"><ShieldCheck size={18} className="mt-0.5 shrink-0"/><p>For your protection, you are signed out after 10 minutes without activity.</p></div></section>
  </div>;
}
