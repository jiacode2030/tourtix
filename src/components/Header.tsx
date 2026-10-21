import Link from "next/link";
import { auth, signOut } from "@/auth";
import { SignInPrompt } from "./SignInPrompt";

export async function Header() {
  const session = await auth();
  const user = session?.user;
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Tour<span className="text-violet-600">Tix</span>
        </Link>
        <div className="flex items-center gap-3 whitespace-nowrap text-sm sm:gap-4">
          <Link href="/concerts" className="font-medium hover:text-violet-600">
            Concerts
          </Link>
          {user ? (
            <>
              <Link href="/my-artists" className="font-medium hover:text-violet-600">
                My Artists
              </Link>
              <Link href="/settings" className="hidden font-medium hover:text-violet-600 sm:inline">
                Settings
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  title={`Signed in as ${user.email ?? user.name ?? "you"}. Click to sign out.`}
                  className="flex items-center gap-2 font-medium hover:text-violet-600"
                >
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt="" referrerPolicy="no-referrer" className="h-7 w-7 rounded-full" />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-xs text-white">
                      {(user.name ?? "?").charAt(0)}
                    </span>
                  )}
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </form>
            </>
          ) : (
            <SignInPrompt label="Sign in" />
          )}
        </div>
      </nav>
    </header>
  );
}
