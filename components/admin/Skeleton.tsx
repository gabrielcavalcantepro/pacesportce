export default function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-[#1e1e1e] via-[#2a2a2a] to-[#1e1e1e] bg-[length:200%_100%] animate-shimmer rounded-lg ${className}`}
    />
  );
}
