import React, { useState } from 'react';
import { useTacticStore } from '../../stores/useTacticStore';
import { Player, Foot } from '../../types';

interface PlayerFormProps {
  positionId: string;
  positionLabel: string;
  onClose: () => void;
}

const FOOT_OPTIONS: { value: Foot; label: string; icon: string }[] = [
  { value: 'R', label: 'Droit', icon: '🦵' },
  { value: 'L', label: 'Gauche', icon: '🦵' },
  { value: 'B', label: 'Les deux', icon: '⚡' },
];

const PlayerForm: React.FC<PlayerFormProps> = ({ positionId, positionLabel, onClose }) => {
  const {
    players,
    updatePlayer,
    currentTeam,
    positionAssignments,
    assignPlayerToPosition,
    unassignPosition,
  } = useTacticStore();
  
  const existingPlayer = players.find((p) => p.positionId === positionId);

  const [name, setName] = useState(existingPlayer?.name || '');
  const [number, setNumber] = useState(existingPlayer?.number || 0);
  const [foot, setFoot] = useState<Foot>(existingPlayer?.foot || 'R');

  const handleSave = () => {
    updatePlayer(positionId, { name, number, foot });
    onClose();
  };

  const handleClear = () => {
    unassignPosition(positionId);
    onClose();
  };

  return (
    <div className="player-form-overlay" onClick={onClose}>
      <div className="player-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="player-form-header">
          <div className="player-form-position">
            <span className="position-badge">{positionLabel}</span>
            <h3>Éditer le joueur</h3>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="player-form-body">
          {currentTeam && (
            <div className="form-field">
              <label>Sélectionner de l'effectif ({currentTeam.name})</label>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 6,
                  maxHeight: 130,
                  overflowY: 'auto',
                  marginBottom: 16,
                  padding: '4px 2px',
                  borderBottom: '1px solid var(--color-border)',
                  paddingBottom: 12,
                }}
              >
                {currentTeam.players.map((tp) => {
                  const isAssignedToOther = Object.entries(positionAssignments).some(
                    ([posId, pId]) => pId === tp.id && posId !== positionId
                  );
                  const isAssignedHere = positionAssignments[positionId] === tp.id;
                  const isPreferred = tp.preferredPositions.some(
                    (p) =>
                      p.toUpperCase() === positionId.toUpperCase() ||
                      positionLabel.toUpperCase().includes(p.toUpperCase())
                  );

                  return (
                    <button
                      key={tp.id}
                      type="button"
                      className={`btn-roster-select ${isAssignedHere ? 'active' : ''} ${
                        isPreferred ? 'preferred' : ''
                      }`}
                      style={{
                        padding: '6px 12px',
                        background: isAssignedHere
                          ? 'var(--color-accent-dim)'
                          : 'rgba(255, 255, 255, 0.04)',
                        border: `1px solid ${
                          isAssignedHere
                            ? 'var(--color-accent)'
                            : isPreferred
                            ? 'rgba(0, 212, 255, 0.3)'
                            : 'var(--color-border)'
                        }`,
                        borderRadius: 14,
                        color: isAssignedHere
                          ? 'var(--color-accent)'
                          : isPreferred
                          ? '#00d4ff'
                          : '#f0f2f8',
                        fontSize: 12,
                        fontWeight: isPreferred ? 600 : 400,
                        cursor: 'pointer',
                        opacity: isAssignedToOther ? 0.4 : 1,
                      }}
                      onClick={() => {
                        setName(tp.name);
                        setNumber(tp.number);
                        setFoot(tp.foot);
                        assignPlayerToPosition(positionId, tp.id);
                      }}
                      disabled={isAssignedToOther}
                      title={isAssignedToOther ? 'Déjà placé sur le terrain' : undefined}
                    >
                      {tp.number > 0 ? `${tp.number}. ` : ''}
                      {tp.name} {isPreferred ? '⭐' : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="form-field">
            <label>Nom du joueur</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Mbappé"
              className="form-input"
              autoFocus
              maxLength={30}
            />
          </div>

          <div className="form-field">
            <label>Numéro de maillot</label>
            <input
              type="number"
              value={number || ''}
              onChange={(e) => setNumber(parseInt(e.target.value) || 0)}
              placeholder="ex: 10"
              className="form-input"
              min={1}
              max={99}
            />
          </div>

          <div className="form-field">
            <label>Pied fort</label>
            <div className="foot-options">
              {FOOT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`foot-btn ${foot === opt.value ? 'active' : ''}`}
                  onClick={() => setFoot(opt.value)}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="player-form-footer">
          <button className="btn-clear" onClick={handleClear}>Effacer</button>
          <button className="btn-save" onClick={handleSave}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
};

export default PlayerForm;
