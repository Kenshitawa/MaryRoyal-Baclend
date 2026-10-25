"use client";

import { useCallback, useEffect, useState } from "react";
import { KeyRound, Printer } from "lucide-react";

type Learner = { id: string; admissionNo: string; name: string; grade: string; gender: string; admissionStatus: string; hasLearnerLogin: boolean };
type Credentials = { name: string; admissionNo: string; email: string; temporaryPassword: string; suspended: boolean };

export default function LearnerDirectory({ canCreate, canApprove = false }: { canCreate: boolean; canApprove?: boolean }) {
  const [rows, setRows] = useState<Learner[]>([]);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [lastAdmitted, setLastAdmitted] = useState<Learner | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (query: string) => {
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/learners?take=50${query ? `&q=${encodeURIComponent(query)}` : ""}`);
      if (!response.ok) throw new Error(response.status === 403 ? "Your account does not have access to the learner directory." : "Could not load learners.");
      const data = await response.json(); setRows(data.learners);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load learners."); }
    finally { setBusy(false); }
  }, []);

  useEffect(() => { const timer = setTimeout(() => void load(search), 220); return () => clearTimeout(timer); }, [search, load]);

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; setNotice(""); setCredentials(null); setSaving(true);
    try {
      const response = await fetch("/api/learners", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not add learner.");
      const learner: Learner = { ...data.learner, hasLearnerLogin: false };
      setLastAdmitted(learner); setNotice(`${learner.name} was admitted as ${learner.admissionNo}. ${learner.admissionStatus === "PENDING" ? "Sent to the Head Teacher for approval." : "Admission is approved."} Create a learner login only if the family needs one.`);
      form.reset(); setOpen(false); await load(search);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not add learner."); }
    finally { setSaving(false); }
  }

  async function createLogin(learner: Learner) {
    setSaving(true); setError(""); setNotice(""); setCredentials(null);
    try {
      const response = await fetch(`/api/learners/${learner.id}/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({}) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not create learner login.");
      setCredentials({ name: learner.name, admissionNo: learner.admissionNo, email: data.account.email, temporaryPassword: data.temporaryPassword, suspended: data.account.suspended });
      setNotice(`Learner login created for ${learner.name}. Share the one-time details privately.`);
      setLastAdmitted(current => current?.id === learner.id ? { ...current, hasLearnerLogin: true } : current);
      setRows(current => current.map(row => row.id === learner.id ? { ...row, hasLearnerLogin: true } : row));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not create learner login."); }
    finally { setSaving(false); }
  }

  async function approve(learner: Learner) {
    setSaving(true); setError("");
    try {
      const response = await fetch(`/api/learners/${learner.id}/workflow`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "approve" }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "Admission could not be approved.");
      setNotice(`${learner.name}'s admission approved.`); await load(search);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Admission could not be approved."); }
    finally { setSaving(false); }
  }

  function printCredentials() {
    if (!credentials) return;
    const printWindow = window.open("", "_blank", "width=700,height=760");
    if (!printWindow) { setError("Allow pop-up windows to print the learner credential slip."); return; }
    const doc = printWindow.document; doc.title = "Mary Royal School · Learner credentials";
    const style = doc.createElement("style");
    style.textContent = "body{margin:0;padding:40px;background:#f1f5f9;font:16px Arial,sans-serif;color:#10233f}.slip{max-width:560px;margin:0 auto;padding:36px;background:#fff;border:1px solid #dbeafe;border-radius:20px}.brand{display:flex;align-items:center;gap:14px;border-bottom:2px solid #1d4ed8;padding-bottom:20px}.brand img{width:56px;height:56px;object-fit:contain}.brand h1{font-size:20px;margin:0}.brand p{margin:5px 0 0;color:#475569}.label{margin:24px 0 4px;color:#475569;font-size:12px;text-transform:uppercase;letter-spacing:1px}.value{font-size:18px;font-weight:bold;overflow-wrap:anywhere}.pass{padding:14px;background:#eff6ff;border-radius:12px;font:700 20px monospace;overflow-wrap:anywhere}.note{margin-top:26px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;color:#475569}@media print{body{padding:0;background:#fff}.slip{border:1px solid #94a3b8;box-shadow:none}}";
    doc.head.append(style);
    const slip = doc.createElement("main"); slip.className = "slip";
    const brand = doc.createElement("header"); brand.className = "brand";
    const logo = doc.createElement("img"); logo.src = "/mary-royal-logo.png"; logo.alt = "Mary Royal School";
    const identity = doc.createElement("div"); const school = doc.createElement("h1"); school.textContent = "Mary Royal School"; const motto = doc.createElement("p"); motto.textContent = "Hard work pays · Obunga, Kisumu"; identity.append(school, motto); brand.append(logo, identity); slip.append(brand);
    const heading = doc.createElement("h2"); heading.textContent = "Learner sign-in details"; heading.style.marginTop = "26px"; slip.append(heading);
    for (const [label, value] of [["Learner", credentials.name], ["Admission number", credentials.admissionNo], ["Sign-in email", credentials.email], ["Temporary password", credentials.temporaryPassword]]) { const key = doc.createElement("p"); key.className = "label"; key.textContent = label; const detail = doc.createElement("p"); detail.className = label === "Temporary password" ? "pass" : "value"; detail.textContent = value; slip.append(key, detail); }
    const note = doc.createElement("p"); note.className = "note"; note.textContent = `${credentials.suspended ? "This login is suspended until the Head Teacher approves the admission. " : ""}The learner must change the temporary password at first sign-in. Keep these details private.`; slip.append(note); doc.body.replaceChildren(slip);
    setTimeout(() => { printWindow.focus(); printWindow.print(); }, 300);
  }

  return <>
    <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-blue-700">School records</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Learner register</h1><p className="mt-1 text-sm text-slate-500">Find a learner or welcome someone new to Mary Royal.</p></div>{canCreate && <button onClick={() => setOpen(!open)} className="min-h-11 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-800">{open ? "Close form" : "+ Admit learner"}</button>}</header>
    {open && <form onSubmit={create} className="mb-5 grid gap-4 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:grid-cols-2"><div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4 sm:col-span-2"><p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Admission number</p><p className="mt-1 text-sm font-semibold text-slate-800">Assigned automatically: MR-01, MR-02, MR-03…</p></div><label className="text-sm font-semibold text-slate-700">Learner name<input required name="name" maxLength={120} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 p-3" placeholder="Enter full name"/></label><label className="text-sm font-semibold text-slate-700">Grade<select name="grade" className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white p-3">{["PP1","PP2",...Array.from({length:9},(_,i)=>`Grade ${i+1}`)].map(grade=><option key={grade}>{grade}</option>)}</select></label><label className="text-sm font-semibold text-slate-700">Gender<select name="gender" className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white p-3"><option>Female</option><option>Male</option></select></label><button disabled={saving} className="min-h-11 rounded-xl bg-blue-700 px-5 font-bold text-white disabled:opacity-60 sm:col-span-2 sm:w-fit">{saving ? "Saving…" : "Save learner"}</button></form>}
    {notice && <p role="status" className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">{notice}</p>}
    {lastAdmitted && !lastAdmitted.hasLearnerLogin && canCreate && <section className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4"><div><p className="font-bold text-slate-900">Next: set up learner access only if needed</p><p className="mt-1 text-sm text-slate-600">{lastAdmitted.name} · {lastAdmitted.admissionNo}</p></div><button disabled={saving} onClick={() => void createLogin(lastAdmitted)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-bold text-white disabled:opacity-60"><KeyRound size={16}/> Create learner login</button></section>}
    {credentials && <section className="mb-5 rounded-2xl border border-blue-200 bg-blue-50/70 p-5" aria-label="New learner credentials"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-blue-800">Temporary details shown once</p><h2 className="mt-1 text-lg font-extrabold text-slate-900">{credentials.name} · {credentials.admissionNo}</h2><p className="mt-1 text-sm text-slate-600">{credentials.email}</p><p className="mt-2 rounded-lg bg-white px-3 py-2 font-mono text-sm font-bold text-slate-900">{credentials.temporaryPassword}</p><p className="mt-2 text-xs text-slate-600">{credentials.suspended ? "The account activates after Head Teacher admission approval." : "The learner must change this password at first sign-in."}</p></div><button onClick={printCredentials} type="button" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 text-sm font-bold text-blue-800"><Printer size={16}/> Print credentials</button></div></section>}
    {error && <p role="alert" className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <section className="rounded-2xl border border-slate-200/75 bg-white p-4 shadow-sm sm:p-5"><label className="block text-xs font-bold text-slate-700">Search register<input value={search} onChange={event => setSearch(event.target.value)} placeholder="Name, admission number or grade" className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm focus:border-blue-600 focus:bg-white focus:outline-none sm:max-w-md"/></label><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500"><th className="px-3 py-3">Admission No.</th><th className="px-3 py-3">Learner</th><th className="px-3 py-3">Grade</th><th className="px-3 py-3">Gender</th><th className="px-3 py-3">Admission</th><th className="px-3 py-3">Login</th>{canApprove && <th className="px-3 py-3">Review</th>}</tr></thead><tbody>{busy ? <tr><td colSpan={canApprove ? 7 : 6} className="p-8 text-center text-slate-500">Loading learner register…</td></tr> : rows.length === 0 ? <tr><td colSpan={canApprove ? 7 : 6} className="p-8 text-center text-slate-500">No learners found. Add a learner to begin the register.</td></tr> : rows.map(learner => <tr key={learner.id} className="border-b border-slate-50 transition hover:bg-blue-50/30"><td className="whitespace-nowrap px-3 py-3 font-bold text-blue-800">{learner.admissionNo}</td><td className="px-3 py-3 font-medium text-slate-700">{learner.name}</td><td className="px-3 py-3">{learner.grade}</td><td className="px-3 py-3 text-slate-600">{learner.gender}</td><td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${learner.admissionStatus === "PENDING" ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"}`}>{learner.admissionStatus}</span></td><td className="px-3 py-3">{learner.hasLearnerLogin ? <span className="text-xs font-semibold text-emerald-700">Login created</span> : canCreate ? <button disabled={saving} onClick={() => void createLogin(learner)} className="min-h-9 rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-bold text-blue-800 disabled:opacity-60">Create login</button> : <span className="text-xs text-slate-400">Not created</span>}</td>{canApprove && <td className="px-3 py-3">{learner.admissionStatus === "PENDING" && <button disabled={saving} onClick={() => void approve(learner)} className="min-h-9 rounded-lg bg-blue-700 px-3 text-xs font-bold text-white disabled:opacity-60">Approve</button>}</td>}</tr>)}</tbody></table></div></section>
  </>;
}
