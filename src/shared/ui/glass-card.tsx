import type { ComponentPropsWithoutRef } from "react";

type GlassCardProps = ComponentPropsWithoutRef<"section">;

export function GlassCard({ className = "", ...props }: GlassCardProps) {
  return (
    <section
      className={`rounded-3xl border border-white/25 bg-white/15 shadow-[0_18px_60px_rgba(18,28,61,0.16)] backdrop-blur-2xl ${className}`}
      {...props}
    />
  );
}
