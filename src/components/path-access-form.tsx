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
          Enter your name เพื่อไปยังหน้าเฉพาะของคุณที่เข้าถึงได้
        </label>
        <div className="grid gap-4 font-mono sm:grid-cols-[minmax(0,1fr)_auto]">
          <input
            autoCapitalize="none"
            autoComplete="off"
            className="pixel-input h-14 px-4 text-base"
            id="path"
            inputMode="url"
            name="path"
            onChange={(event) => setPath(event.target.value)}
            placeholder="Example /nut"
            required
            spellCheck={false}
            type="text"
            value={path}
          />
          <button
            className="pixel-button h-14 px-5 text-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200"
            type="submit"
          >
            Continue
          </button>
        </div>
      </form>

      {isModalOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/72 px-6 py-8 backdrop-blur-sm"
          role="dialog"
        >
          <div className="pixel-panel pixel-panel-boot pixel-scan-panel w-full max-w-md p-6">
            <div>
              <p className="text-sm font-black uppercase tracking-normal text-cyan-200">
                Password
              </p>
              <h2 className="mt-3 text-2xl font-black tracking-normal text-white">
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
                  className="border-4 border-red-300 bg-red-950 px-3 py-2 text-sm font-bold text-red-100 shadow-[4px_4px_0_#7f1d1d]"
                  role="alert"
                >
                  {errorMessage}
                </p>
              ) : null}
              <input
                autoComplete="current-password"
                className="pixel-input h-12 px-4 text-base"
                id="pin"
                name="pin"
                placeholder="Password"
                ref={passwordRef}
                required
                type="password"
              />
              <div className="flex flex-wrap gap-3">
                <button
                  className="pixel-button h-11 px-5 text-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200"
                  type="submit"
                >
                  Unlock
                </button>
                <button
                  className="pixel-button-secondary h-11 px-5 text-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fuchsia-200"
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
