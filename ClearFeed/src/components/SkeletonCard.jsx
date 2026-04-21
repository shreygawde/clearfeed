export default function SkeletonCard() {
  return (
    <div className="animate-pulse bg-[#121821] rounded-2xl overflow-hidden border border-[#1E293B]">
      
      <div className="w-full h-48 bg-[#1E293B]" />

      <div className="p-4 space-y-3">
        <div className="h-4 bg-[#1E293B] rounded w-3/4" />
        <div className="h-3 bg-[#1E293B] rounded w-1/2" />
        <div className="h-6 bg-[#1E293B] rounded w-20" />
      </div>
    </div>
  );
}