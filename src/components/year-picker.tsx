"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function YearPicker({ year, min, max }: { year: number; min: number; max: number }) {
  const router = useRouter();
  const [value, setValue] = React.useState(String(year));

  React.useEffect(() => setValue(String(year)), [year]);

  function go(y: number) {
    const clamped = Math.min(max, Math.max(min, y));
    router.push(`/draft/${clamped}`);
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={() => go(year - 1)} disabled={year <= min}>
        <ChevronLeft className="size-4" />
      </Button>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(Number(value) || year);
        }}
        className="flex items-center gap-2"
      >
        <Input
          className="w-24 text-center"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          inputMode="numeric"
        />
      </form>
      <Button variant="outline" size="icon" onClick={() => go(year + 1)} disabled={year >= max}>
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
