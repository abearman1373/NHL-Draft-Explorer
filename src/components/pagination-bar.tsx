"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PaginationBar({ page, totalPages }: { page: number; totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function hrefFor(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    return `${pathname}?${params.toString()}`;
  }

  const navClass = cn(buttonVariants({ variant: "outline", size: "sm" }));
  const disabledClass = "pointer-events-none opacity-50";

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-muted-foreground">
        Page {page} of {Math.max(totalPages, 1)}
      </p>
      <div className="flex gap-2">
        <Link
          href={hrefFor(Math.max(1, page - 1))}
          aria-disabled={page <= 1}
          className={cn(navClass, page <= 1 && disabledClass)}
        >
          <ChevronLeft className="size-4" /> Prev
        </Link>
        <Link
          href={hrefFor(Math.min(totalPages, page + 1))}
          aria-disabled={page >= totalPages}
          className={cn(navClass, page >= totalPages && disabledClass)}
        >
          Next <ChevronRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
