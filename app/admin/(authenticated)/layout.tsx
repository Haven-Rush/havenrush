import Link from "next/link";
import { logout } from "@/app/admin/actions";

export default function AdminShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-charcoal/10 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/admin" className="flex items-center gap-2.5 no-underline">
            <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-sage font-serif text-[13px] font-bold text-honey">
              HR
            </span>
            <span className="font-serif text-base font-bold text-sage">Admin</span>
          </Link>
          <div className="flex items-center gap-5 text-[13px]">
            <Link href="/" className="font-semibold text-charcoal/60 no-underline hover:text-sage">
              View site
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-full border border-charcoal/15 px-3.5 py-1.5 font-bold text-charcoal/70 hover:border-charcoal/30"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
