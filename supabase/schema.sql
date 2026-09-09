-- NHL Draft Explorer — normalized schema
-- Replaces the flat `nhldraft` table used by the assignment-2 Streamlit app.

create table if not exists teams (
  id serial primary key,
  name text not null unique
);

create table if not exists amateur_teams (
  id serial primary key,
  name text not null unique
);

create table if not exists players (
  id serial primary key,
  name text not null,
  nationality text,
  position_detail text,
  primary_position text,
  amateur_team_id integer references amateur_teams (id)
);

create table if not exists draft_picks (
  id integer primary key, -- source CSV `id`
  year integer not null,
  overall_pick integer not null,
  round integer not null,
  team_id integer not null references teams (id),
  player_id integer not null references players (id)
);

create table if not exists player_stats (
  player_id integer primary key references players (id),
  age_at_draft integer,
  to_year integer,
  games_played integer,
  goals integer,
  assists integer,
  points integer,
  plus_minus integer,
  penalties_minutes integer,
  goalie_games_played integer,
  goalie_wins integer,
  goalie_losses integer,
  goalie_ties_overtime integer,
  save_percentage numeric,
  goals_against_average numeric,
  point_shares numeric
);

create index if not exists idx_draft_picks_year on draft_picks (year);
create index if not exists idx_draft_picks_team on draft_picks (team_id);
create index if not exists idx_draft_picks_player on draft_picks (player_id);
create index if not exists idx_players_position on players (primary_position);
create index if not exists idx_players_name on players (name);

alter table teams enable row level security;
alter table amateur_teams enable row level security;
alter table players enable row level security;
alter table draft_picks enable row level security;
alter table player_stats enable row level security;

create policy "public read teams" on teams for select using (true);
create policy "public read amateur_teams" on amateur_teams for select using (true);
create policy "public read players" on players for select using (true);
create policy "public read draft_picks" on draft_picks for select using (true);
create policy "public read player_stats" on player_stats for select using (true);
