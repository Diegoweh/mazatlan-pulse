import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-shell mx-auto max-w-lg space-y-5 text-center">
      <p className="eyebrow">404</p>
      <h1 className="font-display text-4xl text-navy">Wrong stop</h1>
      <p className="leading-relaxed text-ink/75">
        That page may have been archived — events come down after they happen.
      </p>
      <Link href="/" className="btn-primary inline-block px-5 py-2.5 text-sm">
        Back to the homepage
      </Link>
    </div>
  );
}
