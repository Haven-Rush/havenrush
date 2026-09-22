import Image from "next/image";
import { ATTRIBUTION_STATEMENT, SITE_NAME } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="bg-charcoal px-6 py-10 text-linen sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center gap-2.5">
          <Image
            src="/brand/hr_full_crest_final.png"
            alt=""
            width={522}
            height={485}
            className="h-8 w-auto"
          />
          <span className="font-serif text-lg font-bold">{SITE_NAME}</span>
        </div>
        <div className="border-t border-linen/15 pt-4 text-[11px] leading-relaxed text-linen/50">
          {ATTRIBUTION_STATEMENT}
        </div>
      </div>
    </footer>
  );
}
