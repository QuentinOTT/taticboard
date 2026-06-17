import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import toast from 'react-hot-toast';
import { useTacticStore } from '../stores/useTacticStore';
import { TeamPlayer, FootballType } from '../types';
import { useIsMobile } from '../hooks/useIsMobile';

// ─── Couleurs d'avatar disponibles ───────────────────────────
const AVATAR_COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b',
  '#8b5cf6', '#06b6d4', '#ec4899', '#f97316',
  '#14b8a6', '#6366f1',
];

// ─── Postes disponibles par type ─────────────────────────────
const POSITIONS_11 = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST', 'CF', 'WB'];
const POSITIONS_8  = ['GK', 'CB', 'LB', 'RB', 'CM', 'CAM', 'LW', 'RW', 'ST'];

// ─── Composant : ligne de joueur éditable ─────────────────────
interface PlayerRowProps {
  player: TeamPlayer;
  positions: string[];
  onChange: (updated: TeamPlayer) => void;
  onRemove: () => void;
  index: number;
}

const PlayerRow: React.FC<PlayerRowProps> = ({ player, positions, onChange, onRemove, index }) => {
  const togglePos = (pos: string) => {
    const current = player.preferredPositions;
    const updated = current.includes(pos)
      ? current.filter((p) => p !== pos)
      : [...current, pos];
    onChange({ ...player, preferredPositions: updated });
  };

  return (
    <div className="player-row">
      {/* Avatar color picker */}
      <div className="player-row-index">
        <div className="avatar-preview" style={{ background: player.avatarColor }}>
          {player.number > 0 ? player.number : index + 1}
        </div>
        <input
          type="color"
          value={player.avatarColor}
          onChange={(e) => onChange({ ...player, avatarColor: e.target.value })}
          className="color-input"
          title="Couleur du joueur"
        />
      </div>

      {/* Numéro */}
      <input
        type="number"
        value={player.number || ''}
        onChange={(e) => onChange({ ...player, number: parseInt(e.target.value) || 0 })}
        placeholder="#"
        className="player-row-input number-input"
        min={1}
        max={99}
      />

      {/* Nom */}
      <input
        type="text"
        value={player.name}
        onChange={(e) => onChange({ ...player, name: e.target.value })}
        placeholder="Nom du joueur"
        className="player-row-input name-input"
        maxLength={30}
      />

      {/* Pied fort */}
      <div className="foot-selector">
        {(['R', 'L', 'B'] as const).map((f) => (
          <button
            key={f}
            className={`foot-mini-btn ${player.foot === f ? 'active' : ''}`}
            onClick={() => onChange({ ...player, foot: f })}
            title={f === 'R' ? 'Droit' : f === 'L' ? 'Gauche' : 'Les deux'}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Postes préférentiels */}
      <div className="preferred-positions">
        {positions.map((pos) => (
          <button
            key={pos}
            className={`pos-chip ${player.preferredPositions.includes(pos) ? 'active' : ''}`}
            onClick={() => togglePos(pos)}
          >
            {pos}
          </button>
        ))}
      </div>

      {/* Supprimer */}
      <button className="remove-player-btn" onClick={onRemove} title="Supprimer le joueur">
        ✕
      </button>
    </div>
  );
};

// ─── Page TeamManager ─────────────────────────────────────────
const TeamManager: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { teams, loadTeams, saveTeam, updateTeam, deleteTeam, setCurrentTeam } = useTacticStore();

  const [footballType, setFootballType] = useState<FootballType>('11');
  const [teamName, setTeamName] = useState('');
  const [teamColor, setTeamColor] = useState('#3b82f6');
  const [players, setPlayers] = useState<TeamPlayer[]>([]);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const positions = footballType === '11' ? POSITIONS_11 : POSITIONS_8;
  const maxPlayers = footballType === '11' ? 20 : 14;

  useEffect(() => {
    loadTeams();
  }, []);

  const addPlayer = () => {
    if (players.length >= maxPlayers) {
      toast.error(`Maximum ${maxPlayers} joueurs pour le football à ${footballType}`);
      return;
    }
    setPlayers((prev) => [
      ...prev,
      {
        id: uuid(),
        name: '',
        number: prev.length + 1,
        preferredPositions: [],
        foot: 'R',
        avatarColor: AVATAR_COLORS[prev.length % AVATAR_COLORS.length],
      },
    ]);
  };

  const handleSave = async () => {
    if (!teamName.trim()) {
      toast.error('Entrez un nom pour votre équipe');
      return;
    }
    if (players.length === 0) {
      toast.error('Ajoutez au moins un joueur');
      return;
    }

    setIsSaving(true);
    try {
      if (editingTeamId) {
        await updateTeam(editingTeamId, {
          name: teamName,
          footballType,
          players,
          color: teamColor,
        });
        toast.success('Équipe mise à jour ! ✅');
      } else {
        await saveTeam({ name: teamName, footballType, players, color: teamColor });
        toast.success('Équipe sauvegardée ! 🎉');
      }
      resetForm();
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setTeamName('');
    setTeamColor('#3b82f6');
    setPlayers([]);
    setEditingTeamId(null);
  };

  const handleEdit = (team: typeof teams[0]) => {
    setEditingTeamId(team.id);
    setTeamName(team.name);
    setFootballType(team.football_type);
    setTeamColor(team.color);
    setPlayers(team.players);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette équipe définitivement ?')) return;
    try {
      await deleteTeam(id);
      toast.success('Équipe supprimée');
      if (editingTeamId === id) resetForm();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleUseInEditor = (team: typeof teams[0]) => {
    setCurrentTeam(team);
    navigate('/editor');
    toast.success(`Équipe "${team.name}" chargée dans l'éditeur !`);
  };

  return (
    <div className="team-manager-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <button className="nav-btn" onClick={() => navigate('/')}>
            {isMobile ? '←' : '← Accueil'}
          </button>
          <button className="nav-btn" onClick={() => navigate('/editor')}>
            ⚽ {isMobile ? 'Éditer' : 'Éditeur'}
          </button>
          {!isMobile && <span className="navbar-title">Gestionnaire d&apos;équipe</span>}
        </div>
      </nav>

      <div className="team-manager-layout">
        {/* ── Formulaire de création/édition ── */}
        <section className="team-form-section">
          <div className="team-form-header">
            <h2>{editingTeamId ? '✏️ Modifier l\'équipe' : '➕ Créer une équipe'}</h2>
            {editingTeamId && (
              <button className="btn-clear" onClick={resetForm}>Annuler</button>
            )}
          </div>

          {/* Infos équipe */}
          <div className="team-meta">
            <div className="team-meta-field">
              <label>Nom de l&apos;équipe</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="ex: FC Mon Club"
                className="form-input"
                maxLength={100}
              />
            </div>

            <div className="team-meta-field">
              <label>Couleur maillot</label>
              <div className="color-picker-row">
                <input
                  type="color"
                  value={teamColor}
                  onChange={(e) => setTeamColor(e.target.value)}
                  className="team-color-input"
                />
                <div className="color-presets">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      key={c}
                      className={`color-preset ${teamColor === c ? 'active' : ''}`}
                      style={{ background: c }}
                      onClick={() => setTeamColor(c)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="team-meta-field">
              <label>Format</label>
              <div className="type-toggle" style={{ margin: 0 }}>
                <button className={`type-btn ${footballType === '11' ? 'active' : ''}`} onClick={() => setFootballType('11')}>
                  11v11
                </button>
                <button className={`type-btn ${footballType === '8' ? 'active' : ''}`} onClick={() => setFootballType('8')}>
                  8v8
                </button>
              </div>
            </div>
          </div>

          {/* Légende des colonnes */}
          <div className="player-table-header">
            <span style={{ width: 52 }}>Avatar</span>
            <span style={{ width: 52 }}>#</span>
            <span style={{ flex: 1 }}>Nom</span>
            <span style={{ width: 80 }}>Pied</span>
            <span style={{ flex: 2 }}>Postes préférentiels (cliquer pour sélectionner)</span>
            <span style={{ width: 32 }}></span>
          </div>

          {/* Liste de joueurs */}
          <div className="player-table">
            {players.map((player, i) => (
              <PlayerRow
                key={player.id}
                player={player}
                positions={positions}
                index={i}
                onChange={(updated) =>
                  setPlayers((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
                }
                onRemove={() => setPlayers((prev) => prev.filter((p) => p.id !== player.id))}
              />
            ))}

            {players.length === 0 && (
              <div className="player-table-empty">
                Aucun joueur — cliquez &quot;Ajouter un joueur&quot; pour commencer
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="team-form-actions">
            <button className="btn-add-player" onClick={addPlayer} disabled={players.length >= maxPlayers}>
              + Ajouter un joueur ({players.length}/{maxPlayers})
            </button>
            <button className="btn-save" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Sauvegarde...' : editingTeamId ? '✅ Enregistrer les modifications' : '💾 Sauvegarder l\'équipe'}
            </button>
          </div>
        </section>

        {/* ── Liste des équipes sauvegardées ── */}
        <section className="saved-teams-section">
          <h2>🏟️ Mes équipes ({teams.length})</h2>

          {teams.length === 0 ? (
            <div className="no-teams">
              <div style={{ fontSize: 48 }}>⚽</div>
              <p>Aucune équipe sauvegardée.<br />Créez votre première équipe ci-dessus !</p>
            </div>
          ) : (
            <div className="teams-grid">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className={`team-card ${selectedTeamId === team.id ? 'selected' : ''}`}
                  style={{ borderColor: selectedTeamId === team.id ? team.color : undefined }}
                >
                  <div className="team-card-header">
                    <div className="team-card-color" style={{ background: team.color }} />
                    <div className="team-card-info">
                      <h3>{team.name}</h3>
                      <span className="team-card-meta">
                        {team.football_type}v{team.football_type} · {team.players.length} joueurs
                      </span>
                    </div>
                  </div>

                  {/* Aperçu des joueurs */}
                  <div className="team-players-preview">
                    {team.players.slice(0, 11).map((p) => (
                      <div key={p.id} className="player-preview-chip" style={{ background: p.avatarColor }}>
                        <span className="player-preview-number">{p.number}</span>
                        <span className="player-preview-name">{p.name.split(' ').pop()?.slice(0, 8)}</span>
                        {p.preferredPositions[0] && (
                          <span className="player-preview-pos">{p.preferredPositions[0]}</span>
                        )}
                      </div>
                    ))}
                    {team.players.length > 11 && (
                      <div className="player-preview-more">+{team.players.length - 11}</div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="team-card-actions">
                    <button
                      className="team-action-btn primary"
                      onClick={() => handleUseInEditor(team)}
                    >
                      ⚽ Utiliser dans l&apos;éditeur
                    </button>
                    <button
                      className="team-action-btn"
                      onClick={() => handleEdit(team)}
                    >
                      ✏️ Modifier
                    </button>
                    <button
                      className="team-action-btn danger"
                      onClick={() => handleDelete(team.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default TeamManager;
