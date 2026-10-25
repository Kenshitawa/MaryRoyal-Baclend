"use client";
export function PrintButton(){return <button onClick={()=>window.print()} className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white print:hidden">Print or save PDF</button>}
