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

function buttonClassName({ className = "", fullWidth = false }: Pick<MinsiButtonBaseProps, "className" | "fullWidth">) {
  return `${fullWidth ? "w-full " : ""}${className}`.trim();
}

export function MinsiButton(props: MinsiButtonProps) {
  if (typeof (props as MinsiButtonAsLink).href === "string") {
    const { variant: _variant = "primary", size: _size = "md", loading = false, fullWidth = false, className, children, href, ...anchorProps } = props as MinsiButtonAsLink;
    const composedClassName = buttonClassName({ className, fullWidth });

    return (
      <a className={composedClassName} href={href} aria-disabled={loading || anchorProps["aria-disabled"]} {...anchorProps}>
        {children}
      </a>
    );
  }

  const { variant: _variant = "primary", size: _size = "md", loading = false, fullWidth = false, className, children, ...buttonProps } = props as MinsiButtonAsButton;
  const composedClassName = buttonClassName({ className, fullWidth });

  return (
    <button className={composedClassName} disabled={loading || buttonProps.disabled} {...buttonProps}>
      {children}
    </button>
  );
}
