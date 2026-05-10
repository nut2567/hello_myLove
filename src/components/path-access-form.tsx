"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type PathAccessFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  errorMessage?: string;
  initialModalOpen?: boolean;
  initialPath?: string;
};

function normalizePath(value: string): string {
  const normalized = value.trim().replace(/\\/g, "/").replace(/^\/+/, "");
  const segments = normalized.split("/").filter(Boolean);

  return segments.length === 1 ? segments[0].toLowerCase() : "";
}

export function PathAccessForm({
  action,
  errorMessage,
  initialModalOpen = false,
  initialPath = "",
}: PathAccessFormProps) {
  const normalizedInitialPath = normalizePath(initialPath);
  const [path, setPath] = useState(normalizedInitialPath);
  const [pendingPath, setPendingPath] = useState(normalizedInitialPath);
  const [isModalOpen, setIsModalOpen] = useState(
    initialModalOpen && normalizedInitialPath.length > 0,
  );
  const passwordRef = useRef<HTMLInputElement>(null);
  const shouldShowError = errorMessage && pendingPath === normalizedInitialPath;

  useEffect(() => {
    if (isModalOpen) {
      passwordRef.current?.focus();
    }
  }, [isModalOpen]);

  function handlePathSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedPath = normalizePath(path);

    if (!normalizedPath) {
      return;
    }

    setPendingPath(normalizedPath);
    setIsModalOpen(true);
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <form className="grid w-full max-w-lg gap-4" onSubmit={handlePathSubmit}>
        <label
          className="text-sm font-medium leading-6 text-foreground"
          htmlFor="path"
        >
          Enter your private path
        </label>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <input
            autoCapitalize="none"
            autoComplete="off"
            className="h-12 min-w-0 rounded-md border border-border bg-surface px-4 text-base text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/25"
            id="path"
            inputMode="url"
            name="path"
            onChange={(event) => setPath(event.target.value)}
            placeholder="Example /mint"
            required
            spellCheck={false}
            type="text"
            value={path}
          />
          <button
            className="inline-flex h-12 items-center justify-center rounded-md border border-accent bg-accent px-5 text-sm font-semibold text-accent-foreground shadow-sm transition-colors hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            type="submit"
          >
            Continue
          </button>
        </div>
      </form>

      {isModalOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 px-6 py-8 backdrop-blur-sm"
          role="dialog"
        >
          <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-soft">
            <div>
              <p className="text-sm font-semibold uppercase tracking-normal text-accent">
                Password
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-normal text-foreground">
                Unlock /{pendingPath}
              </h2>
            </div>

            <form action={action} className="mt-6 grid gap-4">
              <input name="path" type="hidden" value={pendingPath} />
              <label
                className="text-sm font-medium leading-6 text-foreground"
                htmlFor="pin"
              >
                Enter password
              </label>
              {shouldShowError ? (
                <p
                  className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-300"
                  role="alert"
                >
                  {errorMessage}
                </p>
              ) : null}
              <input
                autoComplete="current-password"
                className="h-12 min-w-0 rounded-md border border-border bg-background px-4 text-base text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/25"
                id="pin"
                name="pin"
                placeholder="Password"
                ref={passwordRef}
                required
                type="password"
              />
              <div className="flex flex-wrap gap-3">
                <button
                  className="inline-flex h-11 items-center justify-center rounded-md border border-accent bg-accent px-5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  type="submit"
                >
                  Unlock
                </button>
                <button
                  className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-surface px-5 text-sm font-semibold text-foreground transition-colors hover:border-accent/40 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  onClick={() => setIsModalOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}