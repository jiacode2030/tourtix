import { Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { SignInPrompt } from "./SignInPrompt";

export function Header() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Tour<span className="text-violet-600">Tix</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Show when="signed-in">
            <Link href="/my-artists" className="font-medium hover:text-violet-600">
              My Artists
            </Link>
            <Link href="/settings" className="font-medium hover:text-violet-600">
              Settings
            </Link>
            <UserButton />
          </Show>
          <Show when="signed-out">
            <SignInPrompt label="Sign in" />
          </Show>
        </div>
      </nav>
    </header>
  );
}
