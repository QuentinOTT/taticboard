import React from 'react';
import { useTacticStore } from '../../stores/useTacticStore';
import { useNavigate } from 'react-router-dom';

const RosterPanel: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentTeam,
    currentFormation,
    positionAssignments,
    rosterPanelOpen,
    toggleRosterPanel,
    assignPlayerToPosition,
    unassignPosition,
    autoAssignTeam,
    clearAssignments,
    setCurrentTeam,
  } = useTacticStore();

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {currentTeam ? (
          <>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="roster-action-btn" onClick={autoAssignTeam} style={{ padding: '8px 12px', fontSize: 12 }}>
                ⚡ Auto-placer
              </button>
              <button className="roster-action-btn" onClick={clearAssignments} style={{ padding: '8px 12px', fontSize: 12 }}>
                ↺ Réinitialiser
              </button>
              <button className="roster-action-btn" onClick={() => navigate('/team')} style={{ padding: '8px 12px', fontSize: 12 }}>
                ✏️ Gérer
              </button>
            </div>
            
            <div className="roster-players" style={{ display: 'block', padding: 0 }}>
              <div className="roster-hint" style={{ marginBottom: 12 }}>
                Pour placer : cliquez sur un joueur sur le terrain et choisissez-le dans l'effectif.
              </div>
              
              <div className="mobile-roster-list">
                {currentTeam.players.map((player) => {
                  const assignedPos = Object.entries(positionAssignments).find(
                    ([, pid]) => pid === player.id
                  )?.[0];

                  return (
                    <div
                      key={player.id}
                      className={`mobile-roster-card ${assignedPos ? 'selected' : ''}`}
                    >
                      <div className="roster-player-avatar" style={{ background: player.avatarColor, width: 24, height: 24, fontSize: 10, flexShrink: 0 }}>
                        {player.number || '—'}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {player.name}
                        </span>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
                          {player.preferredPositions.slice(0, 2).join(' · ')}
                        </span>
                      </div>
                      {assignedPos && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span className="navbar-formation-badge" style={{ fontSize: 9, padding: '1px 5px' }}>{assignedPos}</span>
                          <button
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: 14, cursor: 'pointer', padding: 4 }}
                            onClick={() => unassignPosition(assignedPos)}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="roster-no-team-body" style={{ padding: '24px 0', textAlign: 'center' }}>
            <p style={{ marginBottom: 12, color: 'rgba(240,242,248,0.5)' }}>Aucune équipe chargée</p>
            <button className="btn-save" onClick={() => navigate('/team')}>
              👥 Créer ou charger une équipe
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!rosterPanelOpen && !currentTeam) return null;

  return (
    <div className={`roster-panel ${rosterPanelOpen ? 'open' : 'collapsed'}`}>
      {/* Toggle bar */}
      <div className="roster-panel-toggle" onClick={toggleRosterPanel}>
        <div className="roster-toggle-left">
          {currentTeam ? (
            <>
              <div className="roster-team-dot" style={{ background: currentTeam.color }} />
              <span className="roster-team-name">{currentTeam.name}</span>
              <span className="roster-team-count">
                {Object.keys(positionAssignments).length}/{currentTeam.players.length} placés
              </span>
            </>
          ) : (
            <span className="roster-no-team">Aucune équipe chargée</span>
          )}
        </div>
        <div className="roster-toggle-actions">
          {currentTeam && (
            <>
              <button
                className="roster-action-btn"
                onClick={(e) => { e.stopPropagation(); autoAssignTeam(); }}
                title="Placer automatiquement les joueurs selon leur poste préférentiel"
              >
                ⚡ Auto-placer
              </button>
              <button
                className="roster-action-btn"
                onClick={(e) => { e.stopPropagation(); clearAssignments(); }}
                title="Effacer toutes les assignations"
              >
                ↺ Réinitialiser
              </button>
              <button
                className="roster-action-btn"
                onClick={(e) => { e.stopPropagation(); navigate('/team'); }}
                title="Gérer mes équipes"
              >
                ✏️ Modifier
              </button>
              <button
                className="roster-action-btn danger"
                onClick={(e) => { e.stopPropagation(); setCurrentTeam(null); }}
                title="Décharger l'équipe"
              >
                ✕
              </button>
            </>
          )}
          <span className="roster-toggle-icon">{rosterPanelOpen ? '▼' : '▲'}</span>
        </div>
      </div>

      {/* Player list */}
      {rosterPanelOpen && currentTeam && (
        <div className="roster-players">
          <div className="roster-hint">
            Cliquez sur un joueur pour le sélectionner, puis cliquez sa position sur le terrain
          </div>
          <div className="roster-player-list">
            {currentTeam.players.map((player) => {
              const assignedPos = Object.entries(positionAssignments).find(
                ([, pid]) => pid === player.id
              )?.[0];

              return (
                <div
                  key={player.id}
                  className={`roster-player-chip ${assignedPos ? 'assigned' : ''}`}
                  title={
                    player.preferredPositions.length > 0
                      ? `Postes : ${player.preferredPositions.join(', ')}`
                      : 'Aucun poste préférentiel'
                  }
                >
                  <div className="roster-player-avatar" style={{ background: player.avatarColor }}>
                    {player.number || '—'}
                  </div>
                  <div className="roster-player-info">
                    <span className="roster-player-name">{player.name || 'Sans nom'}</span>
                    <span className="roster-player-meta">
                      {player.foot === 'R' ? '🦵D' : player.foot === 'L' ? '🦵G' : '⚡'}
                      {player.preferredPositions.length > 0 && (
                        <span className="roster-player-positions">
                          {player.preferredPositions.slice(0, 3).join(' · ')}
                        </span>
                      )}
                    </span>
                  </div>
                  {assignedPos && (
                    <div className="roster-assigned-badge">
                      <span className="assigned-pos">{assignedPos}</span>
                      <button
                        className="unassign-btn"
                        onClick={() => unassignPosition(assignedPos)}
                        title="Retirer de ce poste"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!currentFormation && (
            <div className="roster-no-formation">
              Sélectionnez une formation pour placer vos joueurs
            </div>
          )}
        </div>
      )}

      {rosterPanelOpen && !currentTeam && (
        <div className="roster-no-team-body">
          <p>Aucune équipe chargée</p>
          <button className="btn-save" onClick={() => navigate('/team')}>
            👥 Créer ou charger une équipe
          </button>
        </div>
      )}
    </div>
  );
};

export default RosterPanel;
