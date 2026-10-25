export default function Loading() {
  return <main aria-busy="true" aria-live="polite" aria-label="Loading page" className="min-h-[70vh] bg-slate-50 p-4 sm:p-7 dark:bg-slate-950">
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="h-5 w-36 animate-pulse rounded-lg bg-blue-100 dark:bg-blue-950" />
      <div className="space-y-3"><div className="h-9 w-64 max-w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"/><div className="h-4 w-96 max-w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800"/></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"/>)}</div>
      <div className="grid gap-5 lg:grid-cols-2">{Array.from({ length: 2 }, (_, index) => <div key={index} className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"/>)}</div>
      <p className="sr-only">Loading school information</p>
    </div>
  </main>;
}
