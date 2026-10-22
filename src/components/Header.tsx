import { LogOut, Menu, Search } from "lucide-react";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { CloseOnNavigate } from "./CloseOnNavigate";
import { SignInPrompt } from "./SignInPrompt";
import { ThemeToggle } from "./ThemeToggle";

const navLink = "rounded-full px-3 py-2 text-sm font-medium text-muted hover:bg-surface hover:text-fg";
const menuLink = "flex min-h-12 items-center px-4 text-[15px] hover:bg-surface";

async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/" });
}

function Avatar({ name, image }: { name?: string | null; image?: string | null }) {
  return image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={image} alt="" referrerPolicy="no-referrer" className="h-8 w-8 rounded-full" />
  ) : (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-sm font-semibold">
      {(name ?? "?").charAt(0)}
    </span>
  );
}

export async function Header() {
  const session = await auth();
  const user = session?.user;
  return (
    <header className="header-shadow sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Tour<span className="text-accent">Tix</span>
        </Link>

        {/* Computers and tablets */}
        <div className="hidden items-center gap-1 sm:flex">
          <Link href="/concerts" className={navLink}>
            Concerts
          </Link>
          {user && (
            <>
              <Link href="/my-artists" className={navLink}>
                My Artists
              </Link>
              <Link href="/settings" className={navLink}>
                Settings
              </Link>
            </>
          )}
          <ThemeToggle />
          {user ? (
            <form action={signOutAction}>
              <button type="submit" title={`Signed in as ${user.email ?? user.name ?? "you"}. Sign out`} className="ml-1 flex items-center">
                <Avatar name={user.name} image={user.image} />
              </button>
            </form>
          ) : (
            <SignInPrompt label="Sign in" redirectTo="/my-artists" />
          )}
        </div>

        {/* Phones */}
        <div className="flex items-center gap-1 sm:hidden">
          <Link href="/" aria-label="Search artists" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-surface">
            <Search size={20} aria-hidden />
          </Link>
          <CloseOnNavigate className="relative">
            <summary
              aria-label="Menu"
              className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full hover:bg-surface"
            >
              {user ? <Avatar name={user.name} image={user.image} /> : <Menu size={22} aria-hidden />}
            </summary>
            <div className="reveal-panel absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-2xl border border-line bg-bg py-1 shadow-xl">
              <Link href="/concerts" className={menuLink}>
                Concerts near you
              </Link>
              {user ? (
                <>
                  <Link href="/my-artists" className={menuLink}>
                    My Artists
                  </Link>
                  <Link href="/settings" className={menuLink}>
                    Settings &amp; alerts
                  </Link>
                </>
              ) : null}
              <div className="border-t border-line px-2 py-1">
                <ThemeToggle withLabel />
              </div>
              {user ? (
                <form action={signOutAction} className="border-t border-line">
                  <button type="submit" className={`${menuLink} w-full gap-3 text-left`}>
                    <LogOut size={18} aria-hidden />
                    <span>
                      Sign out
                      <span className="block truncate text-xs text-muted">{user.email}</span>
                    </span>
                  </button>
                </form>
              ) : (
                <div className="border-t border-line p-3">
                  <SignInPrompt label="Sign in with Google" redirectTo="/my-artists" />
                </div>
              )}
            </div>
          </CloseOnNavigate>
        </div>
      </nav>
    </header>
  );
}
