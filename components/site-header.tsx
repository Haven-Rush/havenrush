"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/events", label: "Events" },
  { href: "/agents", label: "For Agents & Hosts" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-charcoal/8 bg-linen/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5 px-6 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/brand/hr_full_crest_final.png"
            alt=""
            width={522}
            height={485}
            className="h-10 w-auto"
            priority
          />
          <span className="font-serif text-xl font-bold text-sage">Haven Rush</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-6 text-[13px] font-bold">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`border-b-2 py-1 no-underline ${
                  active
                    ? "border-sage text-sage"
                    : "border-transparent text-charcoal/75 hover:text-sage"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/events"
          className="whitespace-nowrap rounded-full bg-sage px-5 py-2.5 text-[13px] font-bold text-linen no-underline hover:bg-sage-dark"
        >
          Find a Hunt
        </Link>
      </div>
    </header>
  );
}
