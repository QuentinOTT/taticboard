-- ============================================================
-- TacticBoard — Database Migration 001
-- Initial schema
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Formations (seeded, read-only for users) ────────────────
CREATE TABLE IF NOT EXISTS formations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(30) NOT NULL,
  type VARCHAR(2) NOT NULL CHECK (type IN ('11', '8')),
  description TEXT NOT NULL DEFAULT '',
  how_to_play TEXT NOT NULL DEFAULT '',
  how_to_attack_against TEXT NOT NULL DEFAULT '',
  how_to_defend_against TEXT NOT NULL DEFAULT '',
  strengths JSONB NOT NULL DEFAULT '[]',
  weaknesses JSONB NOT NULL DEFAULT '[]',
  best_counter_formations JSONB NOT NULL DEFAULT '[]',
  key_player_roles JSONB NOT NULL DEFAULT '{}',
  famous_teams JSONB NOT NULL DEFAULT '[]',
  radar_stats JSONB NOT NULL DEFAULT '{}',
  player_positions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Compositions (user-created) ────────────────────────────
CREATE TABLE IF NOT EXISTS compositions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(12) UNIQUE NOT NULL,
  title VARCHAR(100) NOT NULL DEFAULT 'Ma composition',
  formation_id UUID REFERENCES formations(id) ON DELETE SET NULL,
  football_type VARCHAR(2) NOT NULL CHECK (football_type IN ('11', '8')),
  players JSONB NOT NULL DEFAULT '[]',
  home_color VARCHAR(7) NOT NULL DEFAULT '#3b82f6',
  away_color VARCHAR(7) NOT NULL DEFAULT '#ef4444',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for slug lookups (share links)
CREATE INDEX IF NOT EXISTS idx_compositions_slug ON compositions(slug);
CREATE INDEX IF NOT EXISTS idx_formations_type ON formations(type);
