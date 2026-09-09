"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const POSITIONS = [
  { value: "all", label: "All positions" },
  { value: "C", label: "Center" },
  { value: "LW", label: "Left Wing" },
  { value: "RW", label: "Right Wing" },
  { value: "D", label: "Defense" },
  { value: "G", label: "Goalie" },
  { value: "Other", label: "Other" },
];

export function PlayersFilterBar({ q, position }: { q: string; position: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const [pending, setPending] = React.useState(q);
  React.useEffect(() => setPending(q), [q]);

  React.useEffect(() => {
    const handle = setTimeout(() => {
      if (pending !== q) updateParam("q", pending);
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search players by name…"
          className="pl-8"
          value={pending}
          onChange={(e) => setPending(e.target.value)}
        />
      </div>
      <Select value={position} onValueChange={(v) => updateParam("position", v ?? "all")}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Position" />
        </SelectTrigger>
        <SelectContent>
          {POSITIONS.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
