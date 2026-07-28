import { ExternalLink, FlaskConical } from "lucide-react";
import { datasetSources } from "../lib/maizeguard";

type PublicDataCopy = {
  badge: string;
  title: string;
  description: string;
};

const defaultCopy: PublicDataCopy = {
  badge: "Public training data",
  title: "Public datasets prepared for the maize quality model.",
  description:
    "Local farmer images are kept for manual testing only. Training relies on public datasets to keep the model workflow consistent and reproducible.",
};

export function PublicDataSection({ copy = defaultCopy }: { copy?: PublicDataCopy }) {
  return (
    <section id="data" className="px-5 py-20 md:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] bg-white shadow-sm">
        <div className="grid gap-10 p-6 md:grid-cols-[0.85fr_1.15fr] md:items-end md:p-10">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-bold uppercase text-primary">
              <FlaskConical className="h-3.5 w-3.5" />
              {copy.badge}
            </p>
            <h2 className="mt-5 font-display text-3xl font-semibold leading-tight text-ink md:text-4xl">
              {copy.title}
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-ink-soft">
              {copy.description}
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {datasetSources.map((source) => (
              <a
                key={source.name}
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="group relative flex flex-col rounded-2xl border border-border bg-surface-2 p-5 transition hover:-translate-y-1 hover:border-clay/40 hover:bg-white hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-clay/10 text-clay">
                    <FlaskConical className="h-4 w-4" />
                  </div>
                  <ExternalLink className="h-4 w-4 text-ink-soft transition group-hover:text-clay" />
                </div>
                <p className="mt-5 font-display text-lg font-semibold text-ink">{source.name}</p>
                <p className="mt-1 text-xs font-bold uppercase text-primary">{source.purpose}</p>
                <p className="mt-3 text-sm leading-6 text-ink-soft">{source.detail}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
