import type { HTMLAttributes, ReactNode } from "react";

export interface GlassCardProps extends HTMLAttributes<HTMLElement> {
  as?: "div" | "section" | "article" | "aside";
  className?: string;
  children: ReactNode;
}

export function GlassCard({ as: Component = "div", className = "", children, ...props }: GlassCardProps) {
  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  );
}
