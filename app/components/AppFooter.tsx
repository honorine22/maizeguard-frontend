import { Leaf } from "lucide-react";

type FooterCopy = {
  prototype: string;
  privacyPolicy: string;
  dataSources: string;
  decisionSupport: string;
};

const defaultCopy: FooterCopy = {
  prototype: "Field assessment prototype",
  privacyPolicy: "Privacy Policy",
  dataSources: "Data sources",
  decisionSupport: "Post-harvest decision support",
};

export function AppFooter({ copy = defaultCopy }: { copy?: FooterCopy }) {
  return (
    <footer className="border-t border-border bg-white px-5 py-10 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 text-sm text-ink-soft">
        <div className="flex items-center gap-2">
          <Leaf className="h-4 w-4 text-primary" />
          <span className="font-medium text-ink">MaizeGuard Rwanda</span>
          <span>{copy.prototype}</span>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <a
            href="/privacy-policy"
            className="font-semibold text-primary transition hover:underline"
          >
            {copy.privacyPolicy}
          </a>
          <a
            href="/#data"
            className="font-semibold text-ink-soft transition hover:text-primary"
          >
            {copy.dataSources}
          </a>
          <p>{copy.decisionSupport}</p>
        </div>
      </div>
    </footer>
  );
}
