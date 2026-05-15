import type { Route } from "next";
import Link from "next/link";

type ModelOption = {
  accent: string;
  description: string;
  href: Route;
  name: string;
  preview: string;
};

const modelOptions: ModelOption[] = [
  {
    accent: "bg-cyan-300",
    description: "Interactive 3D NMC logo scene.",
    href: "/th/model/logo",
    name: "Logo",
    preview: "NMC",
  },
  {
    accent: "bg-lime-300",
    description: "Robot prototype model preview.",
    href: "/th/model/robot",
    name: "Robot",
    preview: "BOT",
  },
  {
    accent: "bg-pink-300",
    description: "Dinosaur prototype model preview.",
    href: "/th/model/dino",
    name: "Dino",
    preview: "DNO",
  },
];

export default function ModelPickerPage() {
  return (
    <section className="flex flex-1 bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-6 py-12 sm:py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-black uppercase text-accent">Model</p>
          <h1 className="mt-3 text-3xl font-black uppercase text-foreground sm:text-5xl">
            Choose a model
          </h1>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {modelOptions.map((model) => (
            <Link
              key={model.name}
              className="pixel-panel pixel-panel-boot group flex min-h-72 flex-col p-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200"
              href={model.href}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-black uppercase text-cyan-200">
                  {model.name}
                </span>
                <span
                  aria-hidden="true"
                  className={`h-4 w-4 border-2 border-white ${model.accent}`}
                />
              </div>

              <div className="mt-6 flex aspect-square w-full items-center justify-center border-4 border-white bg-[#050816] shadow-soft transition-colors group-hover:bg-[#09090b]">
                <span className="text-4xl font-black tracking-normal text-white sm:text-5xl">
                  {model.preview}
                </span>
              </div>

              <p className="mt-5 text-sm leading-6 text-muted-foreground">
                {model.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
