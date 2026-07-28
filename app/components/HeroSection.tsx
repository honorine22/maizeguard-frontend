import { ArrowRight, PlayCircle, Upload } from "lucide-react";

type HeroCopy = {
  title: string;
  description: string;
  assessSample: string;
  openDashboard: string;
  stats: Array<[string, string]>;
  qualityCheck: string;
  workflow: string;
};

const defaultCopy: HeroCopy = {
  title: "Know your maize before storage or sale.",
  description:
    "Upload a maize image to get instant quality insights, a confidence score, and practical post-harvest guidance.",
  assessSample: "Assess a sample",
  openDashboard: "Open dashboard",
  stats: [
    ["13.8%", "Maize can be lost after harvest"],
    ["Buyer rejection", "Poor quality can reduce market value"],
    ["Act early", "Know whether to dry, sort, clean, or refer"],
  ],
  qualityCheck: "Quality check",
  workflow: "Post-harvest workflow",
};

export function HeroSection({ copy = defaultCopy }: { copy?: HeroCopy }) {
  return (
    <section id="project" className="relative min-h-screen overflow-hidden bg-black text-white">
      <img
        src="/farmers-maize-harvest-background.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,9,7,0.92)_0%,rgba(5,10,8,0.78)_40%,rgba(7,10,8,0.45)_75%,rgba(7,10,8,0.25)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.05)_40%,rgba(0,0,0,0.7)_100%)]" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-5 pb-16 pt-32 md:px-8 lg:grid-cols-[1fr_360px]">
        <div className="max-w-3xl">
          <h1 className="font-display text-5xl font-normal leading-[1.02] text-white sm:text-6xl md:text-7xl">
            {copy.title}
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/85">
            {copy.description}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="/dashboard/scan"
              className="group inline-flex items-center gap-3 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-black/30 transition hover:-translate-y-0.5 hover:bg-[#2d7447]"
            >
              <Upload className="h-4 w-4" />
              {copy.assessSample}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
            <a
              href="/dashboard"
              className="inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/5 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white hover:text-ink"
            >
              <PlayCircle className="h-4 w-4" />
              {copy.openDashboard}
            </a>
          </div>
          <dl className="mt-12 grid max-w-3xl grid-cols-1 gap-6 border-t border-white/15 pt-6 text-white/80 sm:grid-cols-3">
            {copy.stats.map(([value, label]) => (
              <div key={label}>
                <dt className="font-display text-2xl leading-tight text-white sm:text-3xl">
                  {value}
                </dt>
                <dd className="mt-2 text-sm leading-5">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="hidden lg:block">
          <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/5 p-1 shadow-2xl backdrop-blur">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem]">
              <img
                src="/farmers-maize-harvest-background.jpg"
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-5">
                <p className="font-display text-xl text-white">{copy.qualityCheck}</p>
                <p className="mt-1 text-sm text-white/70">{copy.workflow}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
