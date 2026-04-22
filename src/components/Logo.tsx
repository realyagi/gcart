import logoSrc from "@/assets/ggcart-logo.jpg";

export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/40 to-accent/40 blur-md opacity-70" />
      <img
        src={logoSrc}
        alt="AI GGCart logo"
        className="relative h-full w-full rounded-xl object-cover shadow-lg ring-1 ring-white/10"
        draggable={false}
      />
    </div>
  );
}
