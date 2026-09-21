import { login } from "./actions";

export const metadata = {
  title: "Admin Login | Haven Rush",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-2xl border border-charcoal/10 bg-white p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-[10px] bg-sage font-serif text-[15px] font-bold text-honey">
            HR
          </div>
          <h1 className="font-serif text-xl font-bold text-sage">Haven Rush Admin</h1>
        </div>

        <form action={login} className="flex flex-col gap-4">
          <input type="hidden" name="next" value={next ?? "/admin"} />
          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-bold text-charcoal/60">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              className="w-full rounded-xl border border-charcoal/15 bg-white px-3.5 py-2.5 text-sm text-charcoal outline-none focus:border-sage"
            />
          </div>
          {error && <p className="text-[13px] font-semibold text-red-700">Incorrect password.</p>}
          <button
            type="submit"
            className="rounded-full bg-sage px-6 py-3 text-sm font-bold text-linen hover:bg-sage-dark"
          >
            Log in
          </button>
        </form>
      </div>
    </div>
  );
}
