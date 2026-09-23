import Link from "next/link";
import { applyAsHost } from "./actions";

export const metadata = {
  title: "Apply to Host | Haven Rush",
};

export default async function HostApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;

  if (success) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center sm:px-8">
        <h1 className="mb-3 font-serif text-2xl font-bold text-sage">Application received.</h1>
        <p className="mb-6 text-[15px] leading-relaxed text-charcoal/70">
          We&apos;ll review it and email you once a decision&apos;s been made. You can check your
          status anytime by logging in.
        </p>
        <Link
          href="/host/login"
          className="inline-block rounded-full bg-sage px-6 py-3 text-sm font-bold text-linen no-underline hover:bg-sage-dark"
        >
          Go to host login
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16 sm:px-8">
      <h1 className="mb-2 font-serif text-2xl font-bold text-sage">Apply to host</h1>
      <p className="mb-8 text-[15px] leading-relaxed text-charcoal/65">
        Tell us about your place and we&apos;ll be in touch. Once approved, you&apos;ll be able to
        log in and build your first experience.
      </p>

      <form action={applyAsHost} className="flex flex-col gap-4">
        <Field id="name" name="name" label="Your name" autoComplete="name" required />
        <Field
          id="email"
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
        />
        <Field
          id="password"
          name="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          required
        />
        <Field id="place" name="place" label="Place or business name" required />
        <div>
          <label htmlFor="description" className="mb-1.5 block text-xs font-bold text-charcoal/60">
            Tell us about it
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            className="w-full rounded-xl border border-charcoal/15 bg-white px-3.5 py-2.5 text-sm text-charcoal outline-none focus:border-sage"
          />
        </div>

        {error && (
          <p className="text-[13px] font-semibold text-red-700">
            {error === "duplicate"
              ? "An application with that email already exists."
              : "Something went wrong. Please check your details and try again."}
          </p>
        )}

        <button
          type="submit"
          className="mt-2 rounded-full bg-sage px-6 py-3 text-sm font-bold text-linen hover:bg-sage-dark"
        >
          Submit application
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] text-charcoal/55">
        Already applied?{" "}
        <Link href="/host/login" className="font-semibold text-sage no-underline hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

function Field({
  id,
  name,
  label,
  type = "text",
  autoComplete,
  required,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-bold text-charcoal/60">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="w-full rounded-xl border border-charcoal/15 bg-white px-3.5 py-2.5 text-sm text-charcoal outline-none focus:border-sage"
      />
    </div>
  );
}
