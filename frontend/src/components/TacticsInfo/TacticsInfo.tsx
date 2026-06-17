import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useTacticStore } from '../../stores/useTacticStore';
import { Formation, translatePosition } from '../../types';

// ─── Radar Chart ──────────────────────────────────────────────
interface FormationRadarProps {
  formation: Formation;
  color?: string;
}

const FormationRadar: React.FC<FormationRadarProps> = ({ formation, color = '#00d4ff' }) => {
  const data = [
    { subject: 'Attaque', value: formation.radar_stats.attack },
    { subject: 'Défense', value: formation.radar_stats.defense },
    { subject: 'Pressing', value: formation.radar_stats.pressing },
    { subject: 'Possession', value: formation.radar_stats.possession },
    { subject: 'Transition', value: formation.radar_stats.transition },
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.1)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11, fontFamily: 'Inter' }}
        />
        <Radar
          name={formation.name}
          dataKey="value"
          stroke={color}
          fill={color}
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            background: '#1a1d27',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            color: 'white',
            fontFamily: 'Inter',
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

// ─── Tab button ───────────────────────────────────────────────
interface TabButtonProps {
  label: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, icon, isActive, onClick }) => (
  <button
    className={`tactics-tab-btn ${isActive ? 'active' : ''}`}
    onClick={onClick}
  >
    <span>{icon}</span>
    <span>{label}</span>
  </button>
);

// ─── Strength/Weakness list ───────────────────────────────────
interface StrengthListProps {
  items: string[];
  type: 'strength' | 'weakness';
}

const StrengthList: React.FC<StrengthListProps> = ({ items, type }) => (
  <ul className={`sw-list ${type}`}>
    {items.map((item, i) => (
      <li key={i} className="sw-item">
        <span className="sw-icon">{type === 'strength' ? '✅' : '⚠️'}</span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

// ─── TacticsInfo Main Component ───────────────────────────────
const TacticsInfo: React.FC = () => {
  const { currentFormation, activeTab, setActiveTab, sidebarOpen, toggleSidebar, formations } = useTacticStore();

  if (!currentFormation) {
    return (
      <aside className="tactics-panel empty">
        <div className="tactics-empty">
          <div className="tactics-empty-icon">📋</div>
          <p>Sélectionnez une formation pour voir son analyse tactique</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className={`tactics-panel ${sidebarOpen ? 'open' : 'collapsed'}`}>
      {/* Toggle button */}
      <button className="sidebar-toggle" onClick={toggleSidebar} title="Réduire le panneau">
        {sidebarOpen ? '›' : '‹'}
      </button>

      {sidebarOpen && (
        <>
          {/* Header */}
          <div className="tactics-header">
            <div className="tactics-formation-name">
              <span className="tactics-icon">📋</span>
              <h2>{currentFormation.name}</h2>
            </div>
            <span className="tactics-type-badge">{currentFormation.type}v{currentFormation.type}</span>
          </div>

          {/* Radar chart */}
          <div className="tactics-radar">
            <FormationRadar formation={currentFormation} />
          </div>

          {/* Stat bars */}
          <div className="tactics-stats">
            {Object.entries(currentFormation.radar_stats).map(([key, val]) => (
              <div key={key} className="stat-row">
                <span className="stat-key">{key}</span>
                <div className="stat-track-full">
                  <div
                    className="stat-fill-full"
                    style={{
                      width: `${val}%`,
                      background: val >= 80 ? '#22c55e' : val >= 60 ? '#00d4ff' : '#f59e0b',
                    }}
                  />
                </div>
                <span className="stat-number">{val}</span>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="tactics-tabs">
            <TabButton label="Analyse" icon="📊" isActive={activeTab === 'analysis'} onClick={() => setActiveTab('analysis')} />
            <TabButton label="Forces" icon="💪" isActive={activeTab === 'strengths'} onClick={() => setActiveTab('strengths')} />
            <TabButton label="Contres" icon="🔄" isActive={activeTab === 'counter'} onClick={() => setActiveTab('counter')} />
          </div>

          {/* Tab content */}
          <div className="tactics-content">

            {/* Analysis tab */}
            {activeTab === 'analysis' && (
              <div className="tab-content">
                <div className="tactics-section">
                  <h3 className="section-title">
                    <span>📋</span> Description
                  </h3>
                  <p className="section-text">{currentFormation.description}</p>
                </div>

                <div className="tactics-section">
                  <h3 className="section-title">
                    <span>🎮</span> Comment jouer ce système
                  </h3>
                  <p className="section-text">{currentFormation.how_to_play}</p>
                </div>

                <div className="tactics-section">
                  <h3 className="section-title">
                    <span>⚔️</span> Comment attaquer contre ce schéma
                  </h3>
                  <p className="section-text highlight-attack">{currentFormation.how_to_attack_against}</p>
                </div>

                <div className="tactics-section">
                  <h3 className="section-title">
                    <span>🛡️</span> Comment défendre contre ce schéma
                  </h3>
                  <p className="section-text highlight-defend">{currentFormation.how_to_defend_against}</p>
                </div>

                <div className="tactics-section">
                  <h3 className="section-title">
                    <span>🌍</span> Équipes célèbres
                  </h3>
                  <div className="famous-teams">
                    {currentFormation.famous_teams.map((team) => (
                      <span key={team} className="famous-team-badge">⚽ {team}</span>
                    ))}
                  </div>
                </div>

                <div className="tactics-section">
                  <h3 className="section-title">
                    <span>🎯</span> Rôles clés par poste
                  </h3>
                  <div className="role-list">
                    {Object.entries(currentFormation.key_player_roles).map(([pos, desc]) => (
                      <div key={pos} className="role-item">
                        <span className="role-pos">{translatePosition(pos)}</span>
                        <span className="role-desc">{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Strengths tab */}
            {activeTab === 'strengths' && (
              <div className="tab-content">
                <div className="tactics-section">
                  <h3 className="section-title"><span>💪</span> Forces</h3>
                  <StrengthList items={currentFormation.strengths} type="strength" />
                </div>
                <div className="tactics-section">
                  <h3 className="section-title"><span>⚠️</span> Faiblesses</h3>
                  <StrengthList items={currentFormation.weaknesses} type="weakness" />
                </div>
              </div>
            )}

            {/* Counter formations tab */}
            {activeTab === 'counter' && (
              <div className="tab-content">
                <div className="tactics-section">
                  <h3 className="section-title"><span>🔄</span> Formations qui contrent le {currentFormation.name}</h3>
                  <p className="section-hint">Cliquez sur une formation pour la visualiser</p>
                  <div className="counter-formations">
                    {currentFormation.best_counter_formations.map((name) => {
                      const found = formations.find((f) => f.name === name);
                      return (
                        <button
                          key={name}
                          className="counter-chip"
                          onClick={() => found && useTacticStore.getState().setFormation(found)}
                        >
                          <span className="counter-icon">⚡</span>
                          {name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="tactics-section counter-explanation">
                  <h3 className="section-title"><span>⚔️</span> Pourquoi ces formations contrent ?</h3>
                  <p className="section-text">{currentFormation.how_to_attack_against}</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </aside>
  );
};

export default TacticsInfo;
