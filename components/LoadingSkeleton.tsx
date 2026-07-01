export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-slate-200 rounded-xl w-1/3" />
      <div className="h-4 bg-slate-100 rounded-xl w-1/2" />
      <div className="grid grid-cols-4 gap-4 mt-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-100 rounded-2xl" />
        ))}
      </div>
      <div className="h-64 bg-slate-100 rounded-2xl mt-4" />
    </div>
  )
}
