"use client";

import { useCallback, useEffect, useState } from "react";

type Row = { id: string; name: string; admissionNo: string; status: "PRESENT" | "ABSENT" | "LATE" };
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Nairobi", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

export default function AttendanceClient({ grades }: { grades: string[] }) {
  const [grade, setGrade] = useState(grades[0] ?? "");
  const [date, setDate] = useState(today());
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const load = useCallback(async () => {
    if (!grade) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/attendance?grade=${encodeURIComponent(grade)}&date=${date}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setRows(data.learners);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Attendance failed to load.");
    } finally { setBusy(false); }
  }, [grade, date]);
  useEffect(() => { void load(); }, [load]);
  function setStatus(id: string, status: Row["status"]) { setRows(old => old.map(row => row.id === id ? { ...row, status } : row)); }
  async function save() {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/attendance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ grade, date, records: rows.map(({ id, status }) => ({ learnerId: id, status })) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMessage(`Attendance saved for ${data.saved} learners.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Attendance could not be saved."); }
    finally { setBusy(false); }
  }
  return <main className="mx-auto max-w-5xl p-5 pb-28 md:p-8">
    <a href="/dashboard" className="text-sm font-semibold text-blue-700">← Dashboard</a>
    <header className="my-6"><p className="text-sm font-semibold text-blue-700">Classroom</p><h1 className="mt-1 text-3xl font-bold">Daily attendance</h1><p className="mt-2 text-slate-500">Mark present, absent or late. Changes are recorded in the access log.</p></header>
    <section className="flex flex-wrap gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <label className="text-sm font-semibold">Class<select value={grade} onChange={event => setGrade(event.target.value)} className="mt-1 block rounded-xl border border-slate-200 p-3">{grades.map(item => <option key={item}>{item}</option>)}</select></label>
      <label className="text-sm font-semibold">Date<input type="date" value={date} max={today()} onChange={event => setDate(event.target.value)} className="mt-1 block rounded-xl border border-slate-200 p-3" /></label>
    </section>
    {message && <p role="status" className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-900">{message}</p>}
    {rows.length === 0 ? <div className="mt-5 rounded-2xl bg-white p-8 text-center text-sm text-slate-500">{busy ? "Loading class register…" : "No learners found for this class."}</div> : <section className="mt-5 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="divide-y divide-slate-100">{rows.map((row, index) => <article key={row.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><span className="mr-3 text-xs text-slate-400">{index + 1}</span><span className="font-semibold">{row.name}</span><span className="ml-2 text-sm text-slate-500">{row.admissionNo}</span></div><div className="flex gap-1 rounded-xl bg-slate-50 p-1">{(["PRESENT", "ABSENT", "LATE"] as const).map(status => <button type="button" aria-pressed={row.status === status} key={status} onClick={() => setStatus(row.id, status)} className={`min-h-10 rounded-lg px-3 text-xs font-semibold ${row.status === status ? "bg-blue-700 text-white" : "text-slate-600 hover:bg-white"}`}>{status[0] + status.slice(1).toLowerCase()}</button>)}</div></article>)}</div>
      <div className="sticky bottom-0 border-t border-slate-100 bg-white p-4"><button disabled={busy || rows.length === 0} onClick={() => void save()} className="w-full rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white disabled:opacity-50">Save attendance</button></div>
    </section>}
  </main>;
}
