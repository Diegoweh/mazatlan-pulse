import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-4 py-16 text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="text-black/70 dark:text-white/70">
        That page may have been archived — events come down after they happen.
      </p>
      <Link href="/" className="inline-block underline">
        Back to the homepage
      </Link>
    </div>
  );
}
