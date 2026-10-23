import Link from "next/link";

// Shown next to every sign-in button so people see the terms before they sign in.
export function SignInNotice({ className = "" }: { className?: string }) {
  return (
    <p className={`mx-auto max-w-sm text-xs text-muted ${className}`}>
      By signing in, you agree to our{" "}
      <Link href="/terms" className="underline hover:text-fg">
        Terms
      </Link>{" "}
      and{" "}
      <Link href="/privacy" className="underline hover:text-fg">
        Privacy Policy
      </Link>
      . You must be 13 or older.
    </p>
  );
}
