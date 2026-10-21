"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

// A <details> dropdown that closes itself when the page changes.
export function CloseOnNavigate({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();
  const search = useSearchParams();
  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname, search]);
  return (
    <details ref={ref} className={className}>
      {children}
    </details>
  );
}
