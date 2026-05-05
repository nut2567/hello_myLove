import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";

type BaseButtonLinkProps = {
  children: ReactNode;
  variant?: "primary" | "secondary";
};

type ExternalButtonLinkProps = BaseButtonLinkProps & {
  external: true;
  href: string;
};

type InternalButtonLinkProps = BaseButtonLinkProps & {
  external?: false;
  href: Route;
};

type ButtonLinkProps = ExternalButtonLinkProps | InternalButtonLinkProps;

const variants = {
  primary:
    "border-accent bg-accent text-accent-foreground hover:bg-accent/90",
  secondary:
    "border-border bg-surface text-foreground hover:border-accent/40 hover:bg-muted",
};

export function ButtonLink(props: ButtonLinkProps) {
  const { children, variant = "primary" } = props;
  const className = `inline-flex h-11 items-center justify-center rounded-md border px-5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${variants[variant]}`;

  if (props.external) {
    return (
      <a className={className} href={props.href} rel="noreferrer" target="_blank">
        {children}
      </a>
    );
  }

  return (
    <Link className={className} href={props.href}>
      {children}
    </Link>
  );
}
