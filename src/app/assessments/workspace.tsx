"use client";
import { useCallback, useEffect, useState } from "react";

type Learner = { id: string; name: string; admissionNo: string; grade: string };
type Assessment = {
  id: string; subject: string; score: number; level: string; term: string; strand: string | null;
  competency: string | null; comment: string | null; reviewComment: string | null; status: string; version: number;
  learner: { name: string; admissionNo: string; grade: string };
};

export default function AssessmentWorkspace({subjects,canCreate,canSubmit,canReview,canRelease}:{subjects:string[];canCreate:boolean;canSubmit:boolean;canReview:boolean;canRelease:boolean}) {
  const [learners,setLearners]=useState<Learner[]>([]);
  const [rows,setRows]=useState<Assessment[]>([]);
  const [term,setTerm]=useState("2026 Term 3");
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(true);
  const load=useCallback(async()=>{
    setLoading(true);setError("");
    const [assessmentResponse,learnerResponse]=await Promise.all([
      fetch(`/api/assessments?term=${encodeURIComponent(term)}&take=100`),
      canCreate?fetch("/api/learners?take=100"):Promise.resolve(null)
    ]);
    if(!assessmentResponse.ok){setError("Your account cannot view these assessments.");setRows([]);setLoading(false);return;}
    const data=await assessmentResponse.json();setRows(data.assessments);
    if(learnerResponse?.ok){const learnerData=await learnerResponse.json();setLearners(learnerData.learners);}
    setLoading(false);
  },[term,canCreate]);
  useEffect(()=>{void load();},[load]);

  async function enter(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();const form=event.currentTarget;setError("");setMessage("");
    const values=Object.fromEntries(new FormData(form));
    const response=await fetch("/api/assessments",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({...values,score:Number(values.score)})});
    const data=await response.json();
    if(!response.ok){setError(data.error??"Mark could not be saved.");return;}
    setMessage(`Mark saved as ${data.assessment.level}.`);form.reset();void load();
  }
  async function editScore(row:Assessment){
    const value=window.prompt("Revised mark (0–100)",String(row.score));if(value===null)return;
    const score=Number(value);if(!Number.isFinite(score)||score<0||score>100){setError("Enter a mark between 0 and 100.");return;}
    const response=await fetch("/api/assessments",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({id:row.id,score,strand:row.strand??undefined,competency:row.competency??undefined,comment:row.comment??undefined})});
    const data=await response.json();if(!response.ok){setError(data.error??"Mark could not be updated.");return;}
    setMessage("Mark updated and version history recorded.");void load();
  }
  async function workflow(row:Assessment,action:string){
    setError("");setMessage("");const reason=action==="return"?window.prompt("Reason for returning these marks?"):undefined;
    if(action==="return"&&!reason)return;
    const response=await fetch(`/api/assessments/${row.id}/workflow`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action,...(reason?{reason}:{})})});
    const data=await response.json();if(!response.ok){setError(data.error??"Workflow action failed.");return;}
    setMessage(`Assessment ${action} completed.`);void load();
  }
  return <>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div><h1 className="text-2xl font-bold">CBC assessments</h1><p className="mt-1 text-sm text-slate-500">Enter, review and release competency-based marks.</p></div>
      <label className="text-sm font-medium">Term<select value={term} onChange={e=>setTerm(e.target.value)} className="mt-1 block rounded-lg border bg-white px-3 py-2">{["2026 Term 1","2026 Term 2","2026 Term 3"].map(t=><option key={t}>{t}</option>)}</select></label>
    </div>
    {message&&<p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
    {error&&<p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {canCreate&&<form onSubmit={enter} className="mt-5 grid gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
      <h2 className="font-bold sm:col-span-2 lg:col-span-4">Enter an assessment</h2>
      <label className="text-sm font-medium">Learner<select name="learnerId" required className="mt-1 block w-full rounded-lg border bg-white p-2.5"><option value="">Select learner</option>{learners.map(l=><option key={l.id} value={l.id}>{l.name} · {l.admissionNo} · {l.grade}</option>)}</select></label>
      <label className="text-sm font-medium">Subject<select name="subject" required className="mt-1 block w-full rounded-lg border bg-white p-2.5">{subjects.map(s=><option key={s}>{s}</option>)}</select></label>
      <label className="text-sm font-medium">Score (0–100)<input name="score" type="number" min="0" max="100" step="0.5" required className="mt-1 block w-full rounded-lg border p-2.5"/></label>
      <label className="text-sm font-medium">Term<input name="term" value={term} readOnly className="mt-1 block w-full rounded-lg border bg-slate-50 p-2.5"/></label>
      <label className="text-sm font-medium">Strand<input name="strand" maxLength={100} className="mt-1 block w-full rounded-lg border p-2.5"/></label>
      <label className="text-sm font-medium">Competency<input name="competency" maxLength={160} className="mt-1 block w-full rounded-lg border p-2.5"/></label>
      <label className="text-sm font-medium sm:col-span-2">Teacher comment<input name="comment" maxLength={500} className="mt-1 block w-full rounded-lg border p-2.5"/></label>
      <div className="sm:col-span-2 lg:col-span-4"><button className="rounded-lg bg-blue-700 px-4 py-2.5 font-semibold text-white">Save draft mark</button></div>
    </form>}
    <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm"><table className="w-full min-w-[920px] text-left text-sm">
      <thead><tr className="border-b text-xs uppercase text-slate-500"><th className="px-3 py-3">Learner</th><th className="px-3 py-3">Grade</th><th className="px-3 py-3">Subject</th><th className="px-3 py-3">Score</th><th className="px-3 py-3">CBC level</th><th className="px-3 py-3">Strand / competency</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Action</th></tr></thead>
      <tbody>{loading?<tr><td colSpan={8} className="p-8 text-center text-slate-500">Loading assessments…</td></tr>:rows.length===0?<tr><td colSpan={8} className="p-8 text-center text-slate-500">No marks found for this term.</td></tr>:rows.map(r=><tr key={r.id} className="border-b border-slate-50">
        <td className="px-3 py-3 font-medium">{r.learner.name}<div className="text-xs text-slate-500">{r.learner.admissionNo}</div></td><td className="px-3 py-3">{r.learner.grade}</td><td className="px-3 py-3">{r.subject}</td><td className="px-3 py-3">{r.score}</td><td className="px-3 py-3 font-semibold text-blue-800">{r.level}</td><td className="px-3 py-3">{r.strand??"—"}<div className="text-xs text-slate-500">{r.competency??""}{r.reviewComment&&<span className="block text-xs text-amber-800">Returned: {r.reviewComment}</span>}</div></td><td className="px-3 py-3">{r.status}</td>
        <td className="px-3 py-3"><div className="flex gap-2">{canSubmit&&["DRAFT","RETURNED"].includes(r.status)&&<><button onClick={()=>void editScore(r)} className="rounded-lg border px-2.5 py-1.5 text-xs font-semibold">Edit score</button><button onClick={()=>void workflow(r,"submit")} className="rounded-lg border px-2.5 py-1.5 text-xs font-semibold">Submit</button></>}{canReview&&r.status==="SUBMITTED"&&<><button onClick={()=>void workflow(r,"approve")} className="rounded-lg bg-blue-700 px-2.5 py-1.5 text-xs font-semibold text-white">Approve</button><button onClick={()=>void workflow(r,"return")} className="rounded-lg border px-2.5 py-1.5 text-xs font-semibold">Return</button></>}{canRelease&&r.status==="APPROVED"&&<button onClick={()=>void workflow(r,"release")} className="rounded-lg bg-blue-700 px-2.5 py-1.5 text-xs font-semibold text-white">Release</button>}</div></td>
      </tr>)}</tbody>
    </table></div>
  </>;
}
