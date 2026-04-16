const SkeletonCard = () => (
  <li
    className="bg-editor border border-border-toolbar rounded-2xl p-4 flex items-center gap-4 animate-pulse"
    aria-hidden="true"
  >
    <div className="w-10 h-10 rounded-xl bg-accent-secondary shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="w-2/5 h-3 bg-border-input rounded-full" />
      <div className="w-3/5 h-2.5 bg-border-toolbar rounded-full" />
    </div>
    <div className="w-12 h-2.5 bg-border-toolbar rounded-full shrink-0" />
  </li>
);

export default SkeletonCard;
