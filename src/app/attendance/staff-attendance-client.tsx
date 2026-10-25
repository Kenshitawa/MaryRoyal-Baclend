"use client";

import { useEffect, useMemo, useState } from "react";

type Staff = { id: string; name: string; role: string; staffNumber: string | null };
type Status = "PRESENT" | "ABSENT" | "LATE";
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Nairobi", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

export default function StaffAttendanceClient({ staff }: { staff: Staff[] }) {
  const [date, setDate] = useState(today());
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    void fetch(`/api/attendance/staff?date=${date}`).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      if (active) setStatus(Object.fromEntries((data.records as Array<{ staffId: string; status: Status }>).map((row) => [row.staffId, row.status])));
    }).catch((error: unknown) => { if (active) setMessage(error instanceof Error ? error.message : "Could not load the staff register."); });
    return () => { active = false; };
  }, [date]);
  const summary = useMemo(() => Object.values(status).reduce((counts, value) => ({ ...counts, [value]: (counts[value] ?? 0) + 1 }), {} as Record<string, number>), [status]);
  async function save() {
    setBusy(true); setMessage("");
    try {
      const records = staff.filter((person) => status[person.id]).map((person) => ({ staffId: person.id, status: status[person.id], note: note || undefined }));
      const response = await fetch("/api/attendance/staff", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ date, records }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMessage(`Staff attendance saved for ${data.records.length} people.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Staff attendance could not be saved."); }
    finally { setBusy(false); }
  }
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-blue-700">Staff register</p><h2 className="mt-1 text-xl font-bold">Staff attendance</h2><p className="mt-1 text-sm text-slate-500">Record today’s presence and check-in status.</p></div><label className="text-sm font-semibold">Date<input type="date" value={date} max={today()} onChange={(event) => setDate(event.target.value)} className="mt-1 block rounded-xl border border-slate-200 p-2.5 dark:border-slate-700 dark:bg-slate-800"/></label></div>
    <div className="my-4 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-800">Present {summary.PRESENT ?? 0}</span><span className="rounded-full bg-amber-50 px-3 py-1.5 font-semibold text-amber-900">Late {summary.LATE ?? 0}</span><span className="rounded-full bg-red-50 px-3 py-1.5 font-semibold text-red-800">Absent {summary.ABSENT ?? 0}</span></div>
    {!staff.length ? <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-800">No active staff accounts to record.</p> : <div className="divide-y divide-slate-100 dark:divide-slate-800">{staff.map((person) => <div key={person.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="font-semibold">{person.name}</p><p className="text-xs text-slate-500">{person.role.replaceAll("_", " ")}{person.staffNumber ? ` · ${person.staffNumber}` : ""}</p></div><div className="flex gap-1 rounded-xl bg-slate-50 p-1 dark:bg-slate-800">{(["PRESENT", "LATE", "ABSENT"] as const).map((value) => <button key={value} type="button" aria-pressed={status[person.id] === value} onClick={() => setStatus((current) => ({ ...current, [person.id]: value }))} className={`min-h-10 rounded-lg px-3 text-xs font-semibold ${status[person.id] === value ? value === "ABSENT" ? "bg-red-700 text-white" : value === "LATE" ? "bg-amber-500 text-white" : "bg-emerald-700 text-white" : "text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700"}`}>{value[0] + value.slice(1).toLowerCase()}</button>)}</div></div>)}</div>}
    <div className="mt-3 flex flex-col gap-3 sm:flex-row"><label className="flex-1 text-sm font-medium">Register note (optional)<input value={note} onChange={(event) => setNote(event.target.value)} maxLength={240} className="mt-1 block w-full rounded-xl border border-slate-200 p-2.5 dark:border-slate-700 dark:bg-slate-800" placeholder="Short context for this register"/></label><button type="button" disabled={busy || Object.keys(status).length === 0} onClick={() => void save()} className="min-h-11 self-end rounded-xl bg-blue-700 px-5 py-2.5 font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : "Save staff attendance"}</button></div>
    {message && <p role="status" className="mt-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-900 dark:bg-blue-950 dark:text-blue-100">{message}</p>}
  </section>;
}
