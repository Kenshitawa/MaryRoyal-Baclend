"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, MessageCircle, Send } from "lucide-react";

type Child = { id: string; name: string; grade: string };
type Reply = { id: string; message: string; createdAt: string; author: { id: string; name: string; role: string } };
type Complaint = { id: string; subject: string; category: string; audience: string; status: string; reporterName: string | null; createdAt: string; openedBy: { id: string; name: string; role: string }; assignedTo: { id: string; name: string; role: string } | null; replies: Reply[] };
const recipientOptions = [{ role: "HEAD_TEACHER", label: "Head Teacher" }, { role: "DIRECTOR", label: "Director" }, { role: "BOTH", label: "Both school leaders" }];
const statusLabels: Record<string, string> = { RECEIVED: "Received", IN_REVIEW: "In review", RESOLVED: "Resolved" };

export default function ComplaintsClient({ role, userId, userName, learners }: { role: string; userId: string; userName: string; learners: Child[] }) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [childId, setChildId] = useState(learners[0]?.id ?? "");
  const [category, setCategory] = useState("OTHER"); const [subject, setSubject] = useState(""); const [message, setMessage] = useState(""); const [recipientRole, setRecipientRole] = useState("HEAD_TEACHER");
  const [replies, setReplies] = useState<Record<string, string>>({}); const [notice, setNotice] = useState(""); const [busy, setBusy] = useState(false);
  const isParent = role === "PARENT";

  const refresh = useCallback(async () => { const response = await fetch("/api/complaints"); if (response.ok) setComplaints((await response.json()).complaints); }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  async function create(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setNotice("");
    try {
      const response = await fetch("/api/complaints", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ category, subject, message, recipientRole, learnerId: childId }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error);
      setMessage(""); setSubject(""); setCategory("OTHER"); setNotice("Your concern was sent to school leadership."); await refresh();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Complaint could not be sent."); }
    finally { setBusy(false); }
  }

  async function reply(complaint: Complaint) {
    const text = replies[complaint.id]?.trim(); if (!text) return; setBusy(true); setNotice("");
    try {
      const response = await fetch(`/api/complaints/${complaint.id}/replies`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error);
      setReplies(old => ({ ...old, [complaint.id]: "" })); setNotice("Reply sent to the parent."); await refresh();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Reply could not be sent."); }
    finally { setBusy(false); }
  }

  async function setStatus(complaint: Complaint, status: string) {
    setBusy(true); setNotice("");
    try {
      const response = await fetch(`/api/complaints/${complaint.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error);
      setNotice(`Complaint marked ${statusLabels[status].toLowerCase()}.`); await refresh();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Status could not be updated."); }
    finally { setBusy(false); }
  }

  return <main className="mx-auto max-w-5xl p-4 pb-28 sm:p-7">
    <header className="mb-6 rounded-2xl bg-gradient-to-br from-blue-900 to-blue-700 p-6 text-white"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white/15"><MessageCircle size={22}/></span><div><p className="text-sm text-blue-100">Mary Royal support desk</p><h1 className="text-2xl font-extrabold">Parent concerns</h1></div></div><p className="mt-3 max-w-2xl text-sm leading-relaxed text-blue-100">{isParent ? "Share a concern privately with the Head Teacher, Director, or both. Track replies and follow-up here." : "Review parent concerns, update their status, and reply with the next steps."}</p></header>
    {notice && <p role="status" className="mb-5 rounded-xl bg-blue-50 p-3 text-sm text-blue-900">{notice}</p>}
    {isParent && <form onSubmit={create} className="mb-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2"><div className="sm:col-span-2"><h2 className="text-lg font-extrabold">Send a concern</h2><p className="mt-1 text-sm text-slate-500">Only the selected school leaders can review this conversation.</p></div><label className="text-sm font-semibold">Learner concerned<select required value={childId} onChange={event => setChildId(event.target.value)} className="mt-1 block min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3"><option value="">Choose learner</option>{learners.map(child => <option key={child.id} value={child.id}>{child.name} · {child.grade}</option>)}</select></label><label className="text-sm font-semibold">Send to<select value={recipientRole} onChange={event => setRecipientRole(event.target.value)} className="mt-1 block min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3">{recipientOptions.map(item => <option key={item.role} value={item.role}>{item.label}</option>)}</select></label><label className="text-sm font-semibold">Category<select value={category} onChange={event => setCategory(event.target.value)} className="mt-1 block min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3"><option value="ACADEMIC">Learning and academics</option><option value="FEES">Fees</option><option value="SAFETY">Safety</option><option value="WELLBEING">Learner wellbeing</option><option value="OTHER">Other</option></select></label><label className="text-sm font-semibold">Subject<input required minLength={3} maxLength={120} value={subject} onChange={event => setSubject(event.target.value)} className="mt-1 block min-h-11 w-full rounded-xl border border-slate-200 px-3"/></label><label className="text-sm font-semibold sm:col-span-2">How can we help?<textarea required minLength={5} maxLength={2500} rows={4} value={message} onChange={event => setMessage(event.target.value)} placeholder="Describe your concern" className="mt-1 block w-full rounded-xl border border-slate-200 p-3"/></label><button disabled={busy || !childId} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 font-bold text-white disabled:opacity-50 sm:col-span-2 sm:w-fit"><Send size={15}/> Send to leadership</button></form>}
    <section className="space-y-4">{complaints.map(complaint => <article key={complaint.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-blue-700">{complaint.category.replaceAll("_", " ")} · {complaint.reporterName ?? complaint.openedBy.name}</p><h2 className="mt-1 text-lg font-extrabold">{complaint.subject}</h2><p className="mt-1 text-xs text-slate-500">To {complaint.audience === "BOTH" ? "Head Teacher and Director" : complaint.assignedTo?.name ?? complaint.audience.replaceAll("_", " ")}</p></div><div className="flex items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-bold ${complaint.status === "RESOLVED" ? "bg-emerald-50 text-emerald-800" : complaint.status === "IN_REVIEW" ? "bg-amber-50 text-amber-800" : "bg-blue-50 text-blue-800"}`}>{statusLabels[complaint.status] ?? complaint.status}</span>{!isParent && <select aria-label={`Update ${complaint.subject} status`} value={complaint.status} disabled={busy} onChange={event => void setStatus(complaint, event.target.value)} className="min-h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold"><option value="RECEIVED">Received</option><option value="IN_REVIEW">In review</option><option value="RESOLVED">Resolved</option></select>}</div></div><div className="mt-4 space-y-3">{complaint.replies.map(item => <div key={item.id} className={`max-w-[92%] rounded-xl p-3 ${item.author.id === userId ? "ml-auto bg-blue-700 text-white" : "bg-slate-50 text-slate-800"}`}><p className="text-[11px] font-bold">{item.author.name} · {item.author.role.replaceAll("_", " ")}</p><p className="mt-1 whitespace-pre-wrap text-sm">{item.message}</p><time className="mt-2 block text-right text-[10px] opacity-70">{new Intl.DateTimeFormat("en-KE", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Nairobi" }).format(new Date(item.createdAt))}</time></div>)}</div>{!isParent && <div className="mt-4 flex flex-col gap-2 sm:flex-row"><input value={replies[complaint.id] ?? ""} onChange={event => setReplies(old => ({ ...old, [complaint.id]: event.target.value }))} maxLength={2500} placeholder="Write a reply to the parent" className="min-h-11 flex-1 rounded-xl border border-slate-200 px-3 text-sm"/><button disabled={busy || !replies[complaint.id]?.trim()} onClick={() => void reply(complaint)} className="min-h-11 rounded-xl bg-blue-700 px-4 text-sm font-bold text-white disabled:opacity-50">Reply to parent</button></div>}</article>)}{complaints.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><CheckCircle2 className="mx-auto text-blue-500"/><p className="mt-3 font-bold text-slate-800">{isParent ? "No concerns yet" : "Inbox is clear"}</p><p className="mt-1 text-sm text-slate-500">{isParent ? "If you need support, send a private message to school leadership above." : "New parent concerns will appear here."}</p></div>}</section>
    <p className="pt-4 text-center text-xs text-slate-400">Signed in as {userName}. Urgent safeguarding concerns should also be reported directly to school leadership.</p>
  </main>;
}
