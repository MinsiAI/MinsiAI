"use client";

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type MinsiButtonBaseProps = {
  variant?: "primary" | "soft" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
};

type MinsiButtonAsButton = MinsiButtonBaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type MinsiButtonAsLink = MinsiButtonBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
  };

export type MinsiButtonProps = MinsiButtonAsButton | MinsiButtonAsLink;

function buttonClassName({ variant = "primary", size = "md", className = "", fullWidth = false }: Pick<MinsiButtonBaseProps, "variant" | "size" | "className" | "fullWidth">) {
  const classNames = className.split(/\s+/).filter(Boolean);
  const usesStandardButton = classNames.length === 0 || classNames.includes("minsi-button");
  const standardClassNames = usesStandardButton ? ["minsi-button", `minsi-button-${variant}`, `minsi-button-${size}`] : [];

  return Array.from(new Set([...standardClassNames, fullWidth ? "w-full" : "", ...classNames].filter(Boolean))).join(" ");
}

export function MinsiButton(props: MinsiButtonProps) {
  if (typeof (props as MinsiButtonAsLink).href === "string") {
    const { variant = "primary", size = "md", loading = false, fullWidth = false, className, children, href, ...anchorProps } = props as MinsiButtonAsLink;
    const composedClassName = buttonClassName({ variant, size, className, fullWidth });

    return (
      <a className={composedClassName} href={href} aria-disabled={loading || anchorProps["aria-disabled"]} {...anchorProps}>
        {children}
      </a>
    );
  }

  const { variant = "primary", size = "md", loading = false, fullWidth = false, className, children, ...buttonProps } = props as MinsiButtonAsButton;
  const composedClassName = buttonClassName({ variant, size, className, fullWidth });

  return (
    <button className={composedClassName} disabled={loading || buttonProps.disabled} {...buttonProps}>
      {children}
    </button>
  );
}
