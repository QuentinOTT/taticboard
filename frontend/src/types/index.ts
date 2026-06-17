// ─── Formation Types ──────────────────────────────────────────

export interface PlayerPosition {
  id: string;
  label: string;
  x: number; // 0 → 1 normalized
  y: number; // 0 → 1 normalized
}

export interface RadarStats {
  attack: number;      // 0–100
  defense: number;     // 0–100
  pressing: number;    // 0–100
  possession: number;  // 0–100
  transition: number;  // 0–100
}

export interface Formation {
  id: string;
  name: string;
  type: '11' | '8';
  description: string;
  how_to_play: string;
  how_to_attack_against: string;
  how_to_defend_against: string;
  strengths: string[];
  weaknesses: string[];
  best_counter_formations: string[];
  key_player_roles: Record<string, string>;
  famous_teams: string[];
  radar_stats: RadarStats;
  player_positions: PlayerPosition[];
  created_at?: string;
}

// ─── Player / Composition Types ───────────────────────────────

export type Foot = 'L' | 'R' | 'B';

export interface Player {
  positionId: string;
  name: string;
  number: number;
  foot: Foot;
}

// ─── Team / Roster Types ──────────────────────────────────────

export interface TeamPlayer {
  id: string;
  name: string;
  number: number;
  preferredPositions: string[];  // ex: ["LW", "ST", "RW"]
  foot: Foot;
  avatarColor: string;
}

export interface Team {
  id: string;
  name: string;
  football_type: FootballType;
  players: TeamPlayer[];
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Composition {
  id: string;
  slug: string;
  title: string;
  formation_id: string | null;
  football_type: '11' | '8';
  players: Player[];
  home_color: string;
  away_color: string;
  notes: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  formation_name?: string;
  formation_positions?: PlayerPosition[];
}

// ─── Canvas / Editor Types ────────────────────────────────────

export interface CanvasDimensions {
  width: number;
  height: number;
}

export interface DragPosition {
  positionId: string;
  x: number; // pixel
  y: number; // pixel
}

// ─── UI Types ─────────────────────────────────────────────────

export type FootballType = '11' | '8';

export type TacticsTab = 'analysis' | 'strengths' | 'counter';

export type CompareFormationSide = 'left' | 'right';

// ─── API Types ────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  count?: number;
}

export interface ApiError {
  error: string;
}
