import { ATTRIBUTION_STATEMENT, SITE_NAME } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="bg-charcoal px-6 py-10 text-linen sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 font-serif text-lg font-bold">{SITE_NAME}</div>
        <div className="border-t border-linen/15 pt-4 text-[11px] leading-relaxed text-linen/50">
          {ATTRIBUTION_STATEMENT}
        </div>
      </div>
    </footer>
  );
}
