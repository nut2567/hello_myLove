import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";

type BaseButtonLinkProps = {
  children: ReactNode;
  variant?: "primary" | "secondary";
};

type InternalButtonLinkProps = BaseButtonLinkProps & {
  external?: false;
  href: Route;
};

type ExternalButtonLinkProps = BaseButtonLinkProps & {
  external: true;
  href: string;
  rel?: string;
  target?: string;
};

type ButtonLinkProps = InternalButtonLinkProps | ExternalButtonLinkProps;

const variants = {
  primary: "pixel-button",
  secondary: "pixel-button-secondary",
};

export function ButtonLink(props: ButtonLinkProps) {
  const { children, variant = "primary" } = props;
  const className = `${variants[variant]} h-11 px-5 text-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200`;

  if (props.external) {
    return (
      <a
        className={className}
        href={props.href}
        rel={props.rel}
        target={props.target}
      >
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
