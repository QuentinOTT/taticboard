import React, { useState } from 'react';
import { useTacticStore } from '../../stores/useTacticStore';
import { Formation, FootballType } from '../../types';

const RADAR_LABELS: Record<string, string> = {
  attack: 'Attaque',
  defense: 'Défense',
  pressing: 'Pressing',
  possession: 'Possession',
  transition: 'Transition',
};

interface FormationCardProps {
  formation: Formation;
  isSelected: boolean;
  onSelect: () => void;
  onCompare: () => void;
  isCompare: boolean;
}

const FormationCard: React.FC<FormationCardProps> = ({
  formation,
  isSelected,
  onSelect,
  onCompare,
  isCompare,
}) => {
  const topStat = Object.entries(formation.radar_stats || {}).reduce(
    (max, [k, v]) => (v > max.v ? { k, v } : max),
    { k: '', v: 0 }
  );

  return (
    <div
      className={`formation-card ${isSelected ? 'selected' : ''} ${isCompare ? 'compare' : ''}`}
      onClick={onSelect}
    >
      <div className="formation-card-header">
        <span className="formation-name">{formation.name}</span>
        <span className="formation-type-badge">{formation.type}v{formation.type}</span>
      </div>
      <div className="formation-card-stats">
        <div className="stat-bar">
          <span className="stat-label">{RADAR_LABELS[topStat.k] || 'Non défini'}</span>
          <div className="stat-track">
            <div className="stat-fill" style={{ width: `${topStat.v}%` }} />
          </div>
          <span className="stat-val">{topStat.v}</span>
        </div>
      </div>
      <div className="formation-card-footer">
        <span className="formation-desc-short">
          {formation.description.slice(0, 60)}…
        </span>
        <button
          className={`compare-btn ${isCompare ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); onCompare(); }}
          title="Comparer cette formation"
        >
          ⚡
        </button>
      </div>
    </div>
  );
};

// ─── Mini pitch preview ───────────────────────────────────────
const MiniPitchPreview: React.FC<{ formation: Formation }> = ({ formation }) => {
  const W = 80, H = 110;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      <rect x={2} y={2} width={W-4} height={H-4} rx={2} fill="#2d5a27" stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
      <line x1={2} y1={H/2} x2={W-2} y2={H/2} stroke="rgba(255,255,255,0.3)" strokeWidth={0.8} />
      {formation.player_positions.map((pos) => (
        <g key={pos.id}>
          <circle
            cx={2 + pos.x * (W-4)}
            cy={2 + pos.y * (H-4)}
            r={4}
            fill="#3b82f6"
            stroke="white"
            strokeWidth={1}
          />
        </g>
      ))}
    </svg>
  );
};

// ─── Main FormationPanel ──────────────────────────────────────
const FormationPanel: React.FC = () => {
  const {
    formations,
    currentFormation,
    compareFormation,
    footballType,
    compareMode,
    setFormation,
    setCompareFormation,
    setFootballType,
    toggleCompareMode,
    isLoading,
  } = useTacticStore();

  const [search, setSearch] = useState('');

  const filtered = formations.filter(
    (f) =>
      f.type === footballType &&
      f.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleTypeChange = (type: FootballType) => {
    setFootballType(type);
  };

  return (
    <aside className="formation-panel">
      {/* Header */}
      <div className="panel-header">
        <div className="panel-logo">
          <span className="logo-icon">⚽</span>
          <span className="logo-text">TacticBoard</span>
        </div>
      </div>

      {/* Football type toggle */}
      <div className="type-toggle">
        <button
          className={`type-btn ${footballType === '11' ? 'active' : ''}`}
          onClick={() => handleTypeChange('11')}
        >
          11v11
        </button>
        <button
          className={`type-btn ${footballType === '8' ? 'active' : ''}`}
          onClick={() => handleTypeChange('8')}
        >
          8v8
        </button>
      </div>

      {/* Compare mode toggle */}
      <button
        className={`compare-mode-toggle ${compareMode ? 'active' : ''}`}
        onClick={toggleCompareMode}
      >
        {compareMode ? '✕ Quitter le mode comparaison' : '⚡ Comparer deux formations'}
      </button>

      {/* Search */}
      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Rechercher une formation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Formation list */}
      <div className="formation-list">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner" />
            <span>Chargement des formations...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">Aucune formation trouvée</div>
        ) : (
          filtered.map((formation) => (
            <div key={formation.id} className="formation-list-item">
              <div className="formation-list-preview">
                <MiniPitchPreview formation={formation} />
              </div>
              <FormationCard
                formation={formation}
                isSelected={currentFormation?.id === formation.id}
                onSelect={() => setFormation(formation)}
                onCompare={() =>
                  setCompareFormation(
                    compareFormation?.id === formation.id ? null : formation
                  )
                }
                isCompare={compareFormation?.id === formation.id}
              />
            </div>
          ))
        )}
      </div>

      {/* Selected formation preview */}
      {currentFormation && (
        <div className="selected-preview">
          <div className="selected-preview-header">
            <span>Formation sélectionnée</span>
            <strong>{currentFormation.name}</strong>
          </div>
          {currentFormation.famous_teams.slice(0, 2).map((team) => (
            <div key={team} className="famous-team-chip">🌍 {team}</div>
          ))}
        </div>
      )}
    </aside>
  );
};

export default FormationPanel;
