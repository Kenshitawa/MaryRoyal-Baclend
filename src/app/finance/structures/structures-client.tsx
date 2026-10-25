"use client";

import { useCallback, useEffect, useState } from "react";

type FeeLine = { id?: string; category: string; description: string; amount: number; optional: boolean };
type Structure = { id: string; grade: string; term: string; version: number; effectiveFrom: string; active: boolean; createdBy: { name: string }; lines: FeeLine[] };
const categories = ["TUITION", "TRANSPORT", "LUNCH", "BOARDING", "UNIFORM", "ACTIVITY", "EXAM", "OTHER"];
const formatKes = (amount: number) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(amount);

export default function FeeStructuresClient({ canManage }: { canManage: boolean }) {
  const [structures, setStructures] = useState<Structure[]>([]);
  const [grade, setGrade] = useState("Grade 4");
  const [term, setTerm] = useState(`${new Date().getFullYear()} Term 1`);
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().slice(0, 10));
  const [lines, setLines] = useState<FeeLine[]>([{ category: "TUITION", description: "Tuition fees", amount: 0, optional: false }]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const refresh = useCallback(async () => {
    const response = await fetch("/api/finance/structures");
    if (response.ok) setStructures(((await response.json()) as { structures: Structure[] }).structures);
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  function updateLine(index: number, patch: Partial<FeeLine>) { setLines(current => current.map((line, i) => i === index ? { ...line, ...patch } : line)); }
  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/finance/structures", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ grade, term, effectiveFrom, lines }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Fee structure could not be saved.");
      setMessage(`${grade} · ${term} fee structure saved as version ${result.structure.version}.`);
      await refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Fee structure could not be saved."); }
    finally { setBusy(false); }
  }
  return <main className="mx-auto max-w-6xl p-5 pb-24 md:p-8">
    <a href="/finance" className="text-sm font-semibold text-blue-700">← Finance</a>
    <header className="mb-7 mt-4"><p className="text-sm font-semibold text-blue-700">Finance · school fee settings</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Fee structures</h1><p className="mt-2 text-slate-500">Head Teacher and Director set the approved charges. Secretary and Accountant can review them.</p></header>
    {message && <p role="status" className="mb-5 rounded-xl bg-blue-50 p-4 text-sm font-medium text-blue-900">{message}</p>}
    {canManage && <form onSubmit={save} className="mb-7 space-y-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
      <h2 className="text-lg font-bold text-slate-900">Create a fee structure or new version</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="text-sm font-semibold">Class / grade<input required minLength={2} maxLength={20} value={grade} onChange={e => setGrade(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3" /></label>
        <label className="text-sm font-semibold">Term<input required pattern="\d{4} Term [123]" value={term} onChange={e => setTerm(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3" /></label>
        <label className="text-sm font-semibold">Effective from<input required type="date" value={effectiveFrom} onChange={e => setEffectiveFrom(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3" /></label>
      </div>
      <div className="space-y-3"><div className="flex items-center justify-between"><h3 className="font-semibold text-slate-800">Fee items</h3><button type="button" onClick={() => setLines(current => [...current, { category: "OTHER", description: "", amount: 0, optional: false }])} className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-800">Add fee item</button></div>
        {lines.map((line, index) => <div key={index} className="grid gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-[1fr_1.4fr_.8fr_auto_auto] sm:items-end">
          <label className="text-xs font-semibold text-slate-600">Category<select value={line.category} onChange={e => updateLine(index, { category: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5">{categories.map(category => <option key={category}>{category}</option>)}</select></label>
          <label className="text-xs font-semibold text-slate-600">Description<input required minLength={2} maxLength={120} value={line.description} onChange={e => updateLine(index, { description: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5" /></label>
          <label className="text-xs font-semibold text-slate-600">Amount · KES<input required type="number" min={line.optional ? 0 : 1} step="1" value={line.amount || ""} onChange={e => updateLine(index, { amount: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5" /></label>
          <label className="flex items-center gap-2 pb-2 text-xs font-semibold text-slate-700"><input type="checkbox" checked={line.optional} onChange={e => updateLine(index, { optional: e.target.checked })} />Optional</label>
          <button type="button" disabled={lines.length === 1} onClick={() => setLines(current => current.filter((_, i) => i !== index))} className="rounded-lg px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-40">Remove</button>
        </div>)}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"><p className="text-sm text-slate-600">Compulsory total: <strong className="text-slate-900">{formatKes(lines.reduce((sum, line) => sum + (!line.optional ? line.amount : 0), 0))}</strong></p><button disabled={busy} className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white shadow-sm disabled:opacity-50">{busy ? "Saving…" : "Save fee structure"}</button></div>
    </form>}
    <section className="space-y-4"><div><h2 className="text-xl font-bold text-slate-900">Approved structures</h2><p className="mt-1 text-sm text-slate-500">Each saved change creates a version. Existing invoices retain their issued amounts.</p></div>
      {structures.length === 0 ? <div className="rounded-2xl border border-dashed border-blue-200 bg-white p-10 text-center"><p className="font-semibold text-slate-800">No fee structure has been added yet</p><p className="mt-1 text-sm text-slate-500">The Head Teacher or Director can set charges by class and term.</p></div> : <div className="grid gap-4 lg:grid-cols-2">{structures.map(structure => { const required = structure.lines.filter(line => !line.optional).reduce((sum, line) => sum + line.amount, 0); return <article key={structure.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-bold text-slate-900">{structure.grade}<span className="ml-2 text-sm font-medium text-slate-500">{structure.term}</span></h3><p className="mt-1 text-xs text-slate-500">Version {structure.version} · Effective {new Date(structure.effectiveFrom).toLocaleDateString("en-KE")} · By {structure.createdBy.name}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${structure.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{structure.active ? "Current" : "Previous"}</span></div><div className="my-4 divide-y divide-slate-100">{structure.lines.map(line => <div key={line.id} className="flex justify-between gap-4 py-2.5 text-sm"><span className="text-slate-700">{line.description}{line.optional && <small className="ml-2 text-slate-400">Optional</small>}</span><strong className="whitespace-nowrap text-slate-900">{formatKes(line.amount)}</strong></div>)}</div><div className="border-t border-slate-100 pt-3 text-sm font-semibold text-slate-800">Compulsory total <span className="float-right">{formatKes(required)}</span></div></article>; })}</div>}
    </section>
  </main>;
}
