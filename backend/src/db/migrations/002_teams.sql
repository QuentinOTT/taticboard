-- ============================================================
-- TacticBoard — Migration 002
-- Table teams : gestion des équipes et rosters de joueurs
-- ============================================================

CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  football_type VARCHAR(2) NOT NULL CHECK (football_type IN ('11', '8')),
  -- players JSONB array: [{id, name, number, preferredPositions, foot, avatarColor}]
  players JSONB NOT NULL DEFAULT '[]',
  color VARCHAR(7) NOT NULL DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teams_type ON teams(football_type);
