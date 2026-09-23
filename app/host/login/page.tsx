import Link from "next/link";
import { login } from "./actions";

export const metadata = {
  title: "Host Login | Haven Rush",
};

export default async function HostLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-16 sm:px-8">
      <div className="w-full max-w-sm rounded-2xl border border-charcoal/10 bg-white p-8">
        <div className="mb-6 text-center">
          <h1 className="font-serif text-xl font-bold text-sage">Host login</h1>
        </div>

        <form action={login} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-bold text-charcoal/60">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoFocus
              autoComplete="email"
              className="w-full rounded-xl border border-charcoal/15 bg-white px-3.5 py-2.5 text-sm text-charcoal outline-none focus:border-sage"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-bold text-charcoal/60">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-charcoal/15 bg-white px-3.5 py-2.5 text-sm text-charcoal outline-none focus:border-sage"
            />
          </div>
          {error && (
            <p className="text-[13px] font-semibold text-red-700">
              Incorrect email or password.
            </p>
          )}
          <button
            type="submit"
            className="rounded-full bg-sage px-6 py-3 text-sm font-bold text-linen hover:bg-sage-dark"
          >
            Log in
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] text-charcoal/55">
          Haven&apos;t applied yet?{" "}
          <Link href="/host/apply" className="font-semibold text-sage no-underline hover:underline">
            Apply to host
          </Link>
        </p>
      </div>
    </div>
  );
}
