import Link from "next/link";
import { auth, signOut } from "@/auth";
import { CloseOnNavigate } from "./CloseOnNavigate";
import { SignInPrompt } from "./SignInPrompt";

const navLink = "font-medium hover:text-violet-600";
const menuLink = "block px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800";

async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/" });
}

function Avatar({ name, image }: { name?: string | null; image?: string | null }) {
  return image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={image} alt="" referrerPolicy="no-referrer" className="h-7 w-7 rounded-full" />
  ) : (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-xs text-white">
      {(name ?? "?").charAt(0)}
    </span>
  );
}

export async function Header() {
  const session = await auth();
  const user = session?.user;
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Tour<span className="text-violet-600">Tix</span>
        </Link>

        {/* Computers and tablets: links in a row. */}
        <div className="hidden items-center gap-4 whitespace-nowrap text-sm sm:flex">
          <Link href="/concerts" className={navLink}>
            Concerts
          </Link>
          {user ? (
            <>
              <Link href="/my-artists" className={navLink}>
                My Artists
              </Link>
              <Link href="/settings" className={navLink}>
                Settings
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  title={`Signed in as ${user.email ?? user.name ?? "you"}`}
                  className={`flex items-center gap-2 ${navLink}`}
                >
                  <Avatar name={user.name} image={user.image} />
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <SignInPrompt label="Sign in" redirectTo="/my-artists" />
          )}
        </div>

        {/* Phones: a menu button. */}
        <CloseOnNavigate className="relative sm:hidden">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium dark:border-zinc-700">
            {user && <Avatar name={user.name} image={user.image} />}
            <span aria-hidden="true">☰</span> Menu
          </summary>
          <div className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-xl border border-zinc-200 bg-white text-sm shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
            <Link href="/" className={menuLink}>
              Search artists
            </Link>
            <Link href="/concerts" className={menuLink}>
              Concerts near you
            </Link>
            {user ? (
              <>
                <Link href="/my-artists" className={menuLink}>
                  My Artists
                </Link>
                <Link href="/settings" className={menuLink}>
                  Settings &amp; notifications
                </Link>
                <form action={signOutAction} className="border-t border-zinc-200 dark:border-zinc-700">
                  <button type="submit" className={`${menuLink} w-full text-left`}>
                    Sign out
                    <span className="block truncate text-xs text-zinc-600 dark:text-zinc-400">{user.email}</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="border-t border-zinc-200 p-3 dark:border-zinc-700">
                <SignInPrompt label="Sign in with Google" redirectTo="/my-artists" />
              </div>
            )}
          </div>
        </CloseOnNavigate>
      </nav>
    </header>
  );
}
