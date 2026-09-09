import { getSupabaseServerClient } from "@/lib/supabase";

export type DraftPick = {
  id: number;
  year: number;
  overall_pick: number;
  round: number;
  team: { id: number; name: string } | null;
  player: {
    id: number;
    name: string;
    nationality: string | null;
    primary_position: string | null;
  } | null;
};

const PICK_SELECT = `
  id, year, overall_pick, round,
  team:teams ( id, name ),
  player:players ( id, name, nationality, primary_position )
`;

export async function getYearRange() {
  const supabase = getSupabaseServerClient();
  const [{ data: min }, { data: max }] = await Promise.all([
    supabase.from("draft_picks").select("year").order("year", { ascending: true }).limit(1).single(),
    supabase.from("draft_picks").select("year").order("year", { ascending: false }).limit(1).single(),
  ]);
  return { min: min?.year ?? 1963, max: max?.year ?? 2022 };
}

export async function getOverviewStats() {
  const supabase = getSupabaseServerClient();
  const [{ count: pickCount }, { count: playerCount }, { count: teamCount }, { min, max }] = await Promise.all([
    supabase.from("draft_picks").select("*", { count: "exact", head: true }),
    supabase.from("players").select("*", { count: "exact", head: true }),
    supabase.from("teams").select("*", { count: "exact", head: true }),
    getYearRange(),
  ]);
  return {
    pickCount: pickCount ?? 0,
    playerCount: playerCount ?? 0,
    teamCount: teamCount ?? 0,
    yearMin: min,
    yearMax: max,
  };
}

export async function getPositionBreakdown() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.from("players").select("primary_position");
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const key = row.primary_position ?? "Other";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts, ([position, count]) => ({ position, count }));
}

export async function getPicksPerYearByPosition() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("draft_picks")
    .select("year, player:players(primary_position)");
  const byYear = new Map<number, Record<string, number>>();
  for (const row of data ?? []) {
    const player = Array.isArray(row.player) ? row.player[0] : row.player;
    const pos = player?.primary_position ?? "Other";
    const entry = byYear.get(row.year) ?? {};
    entry[pos] = (entry[pos] ?? 0) + 1;
    byYear.set(row.year, entry);
  }
  return Array.from(byYear, ([year, positions]) => ({ year, ...positions })).sort((a, b) => a.year - b.year);
}

export async function getPickValueByRound() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("draft_picks")
    .select("round, player_id");
  const { data: stats } = await supabase.from("player_stats").select("player_id, point_shares");
  const shareByPlayer = new Map((stats ?? []).map((s) => [s.player_id, s.point_shares]));

  const byRound = new Map<number, { sum: number; n: number }>();
  for (const row of data ?? []) {
    const share = shareByPlayer.get(row.player_id);
    if (share == null) continue;
    const entry = byRound.get(row.round) ?? { sum: 0, n: 0 };
    entry.sum += Number(share);
    entry.n += 1;
    byRound.set(row.round, entry);
  }
  return Array.from(byRound, ([round, { sum, n }]) => ({ round, avgPointShares: n ? sum / n : 0 }))
    .filter((r) => r.round <= 10)
    .sort((a, b) => a.round - b.round);
}

export async function getDraftPicksForYear(year: number) {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("draft_picks")
    .select(PICK_SELECT)
    .eq("year", year)
    .order("overall_pick", { ascending: true });
  return (data ?? []) as unknown as DraftPick[];
}

export type PlayerSearchParams = {
  q?: string;
  position?: string;
  page: number;
  pageSize: number;
};

export async function searchPlayers({ q, position, page, pageSize }: PlayerSearchParams) {
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("players")
    .select(
      "id, name, nationality, primary_position, draft_picks(year, overall_pick, team:teams(name)), player_stats(games_played, points, point_shares)",
      { count: "exact" }
    );

  if (q) query = query.ilike("name", `%${q}%`);
  if (position && position !== "all") query = query.eq("primary_position", position);

  const from = (page - 1) * pageSize;
  const { data, count } = await query
    .order("name", { ascending: true })
    .range(from, from + pageSize - 1);

  return { players: data ?? [], total: count ?? 0 };
}

export async function getPlayer(id: number) {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("players")
    .select(
      "id, name, nationality, position_detail, primary_position, amateur_team:amateur_teams(name), draft_picks(year, overall_pick, round, team:teams(id,name)), player_stats(*)"
    )
    .eq("id", id)
    .single();
  return data;
}

export async function getTeams() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.from("teams").select("id, name").order("name");
  return data ?? [];
}

export async function getTeam(id: number) {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.from("teams").select("id, name").eq("id", id).single();
  const { data: picks } = await supabase
    .from("draft_picks")
    .select(PICK_SELECT)
    .eq("team_id", id)
    .order("year", { ascending: false })
    .order("overall_pick", { ascending: true });
  return { team: data, picks: (picks ?? []) as unknown as DraftPick[] };
}
