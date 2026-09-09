import Link from "next/link";
import { CircleDot } from "lucide-react";

import { ModeToggle } from "@/components/mode-toggle";

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/players", label: "Players" },
  { href: "/teams", label: "Teams" },
];

export function NavBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <CircleDot className="size-5 text-primary" />
          <span>NHL Draft Explorer</span>
        </Link>
        <nav className="flex items-center gap-1">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {link.label}
            </Link>
          ))}
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}
