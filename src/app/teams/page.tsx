import Link from "next/link";
import { Shield } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { getTeams } from "@/lib/queries";

export default async function TeamsPage() {
  const teams = await getTeams();

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
        <p className="text-muted-foreground">{teams.length} franchises with draft history in this dataset</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {teams.map((team) => (
          <Link key={team.id} href={`/teams/${team.id}`}>
            <Card className="h-full transition-colors hover:bg-accent">
              <CardContent className="flex items-center gap-2 py-4">
                <Shield className="size-4 shrink-0 text-muted-foreground" />
                <span className="text-sm font-medium">{team.name}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
