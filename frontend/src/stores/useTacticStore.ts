import { create } from 'zustand';
import { Formation, Player, Composition, FootballType, Team, TeamPlayer, translatePosition } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';

// ─── Store Types ─────────────────────────────────────────────

interface DraggedPosition {
  positionId: string;
  x: number;
  y: number;
}

interface TacticStore {
  // ── Formation / Pitch state ──
  formations: Formation[];
  currentFormation: Formation | null;
  compareFormation: Formation | null;
  footballType: FootballType;
  players: Player[];
  draggedPositions: Record<string, DraggedPosition>;
  composition: Composition | null;
  sidebarOpen: boolean;
  compareMode: boolean;
  isLoading: boolean;
  error: string | null;
  activeTab: 'analysis' | 'strengths' | 'counter';

  // ── Team / Roster state ──
  teams: Team[];
  currentTeam: Team | null;
  positionAssignments: Record<string, string>; // positionId → teamPlayerId
  rosterPanelOpen: boolean;
  selectedRosterPlayerId: string | null;

  // ── Formation actions ──
  loadFormations: () => Promise<void>;
  setFormation: (formation: Formation) => void;
  setCompareFormation: (formation: Formation | null) => void;
  setFootballType: (type: FootballType) => void;
  updatePlayerPosition: (positionId: string, x: number, y: number) => void;
  resetPositions: () => void;
  updatePlayer: (positionId: string, data: Partial<Player>) => void;
  toggleSidebar: () => void;
  toggleCompareMode: () => void;
  setActiveTab: (tab: 'analysis' | 'strengths' | 'counter') => void;
  saveComposition: (title: string) => Promise<string>;
  loadComposition: (slug: string) => Promise<void>;

  // ── Team actions ──
  loadTeams: () => Promise<void>;
  setCurrentTeam: (team: Team | null) => void;
  saveTeam: (data: { name: string; footballType: FootballType; players: TeamPlayer[]; color: string }) => Promise<Team>;
  updateTeam: (id: string, data: Partial<{ name: string; players: TeamPlayer[]; color: string; footballType: FootballType }>) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
  assignPlayerToPosition: (positionId: string, teamPlayerId: string) => void;
  unassignPosition: (positionId: string) => void;
  autoAssignTeam: () => void;
  clearAssignments: () => void;
  toggleRosterPanel: () => void;
  selectRosterPlayer: (id: string | null) => void;
}

// ─── Store Implementation ─────────────────────────────────────

export const useTacticStore = create<TacticStore>((set, get) => ({
  // ── Initial State ──
  formations: [],
  currentFormation: null,
  compareFormation: null,
  footballType: '11',
  players: [],
  draggedPositions: {},
  composition: null,
  sidebarOpen: true,
  compareMode: false,
  isLoading: false,
  error: null,
  activeTab: 'analysis',

  // Team state
  teams: [],
  currentTeam: null,
  positionAssignments: {},
  rosterPanelOpen: false,
  selectedRosterPlayerId: null,

  // ── Load all formations from API ──
  loadFormations: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/formations`);
      if (!res.ok) throw new Error('Failed to load formations');
      const json = await res.json();
      set({ formations: json.data, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // ── Set current formation & reset dragged positions ──
  setFormation: (formation: Formation) => {
    set({
      currentFormation: formation,
      draggedPositions: {},
      positionAssignments: {},
      players: formation.player_positions.map((pos) => ({
        positionId: pos.id,
        name: '',
        number: 0,
        foot: 'R',
      })),
    });
  },

  setCompareFormation: (formation) => {
    set({ compareFormation: formation });
  },

  setFootballType: (type) => {
    const { formations } = get();
    const filtered = formations.filter((f) => f.type === type);
    set({
      footballType: type,
      currentFormation: filtered[0] || null,
      compareFormation: null,
      draggedPositions: {},
      positionAssignments: {},
      players: filtered[0]
        ? filtered[0].player_positions.map((pos) => ({
            positionId: pos.id,
            name: '',
            number: 0,
            foot: 'R' as const,
          }))
        : [],
    });
  },

  // ── Update drag position (pixel coords) ──
  updatePlayerPosition: (positionId, x, y) => {
    set((state) => ({
      draggedPositions: {
        ...state.draggedPositions,
        [positionId]: { positionId, x, y },
      },
    }));
  },

  resetPositions: () => {
    set({ draggedPositions: {}, positionAssignments: {} });
  },

  updatePlayer: (positionId, data) => {
    set((state) => ({
      players: state.players.map((p) =>
        p.positionId === positionId ? { ...p, ...data } : p
      ),
    }));
  },

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleCompareMode: () => set((s) => ({ compareMode: !s.compareMode, compareFormation: null })),
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleRosterPanel: () => set((s) => ({ rosterPanelOpen: !s.rosterPanelOpen })),
  selectRosterPlayer: (id) => set({ selectedRosterPlayerId: id }),

  // ── Save composition ──
  saveComposition: async (title: string): Promise<string> => {
    const { currentFormation, footballType, players, draggedPositions, positionAssignments } = get();
    const res = await fetch(`${API_URL}/api/compositions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        formationId: currentFormation?.id || null,
        footballType,
        players,
        customPositions: Object.values(draggedPositions),
        positionAssignments,
      }),
    });
    if (!res.ok) throw new Error('Failed to save composition');
    const json = await res.json();
    set({ composition: json.data });
    return json.data.slug as string;
  },

  loadComposition: async (slug: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/share/${slug}`);
      if (!res.ok) throw new Error('Composition not found');
      const json = await res.json();
      const comp: Composition = json.data;
      set({ composition: comp, footballType: comp.football_type, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // ── Team actions ──

  loadTeams: async () => {
    try {
      const res = await fetch(`${API_URL}/api/teams`);
      if (!res.ok) throw new Error('Failed to load teams');
      const json = await res.json();
      set({ teams: json.data });
    } catch (error) {
      console.error('loadTeams error:', error);
    }
  },

  setCurrentTeam: (team) => {
    set({ currentTeam: team, positionAssignments: {}, rosterPanelOpen: !!team });
    // If team has a football type, switch to it
    if (team && team.football_type) {
      const { formations } = get();
      const filtered = formations.filter((f) => f.type === team.football_type);
      if (filtered.length > 0) {
        set({ footballType: team.football_type });
      }
    }
  },

  saveTeam: async (data) => {
    const res = await fetch(`${API_URL}/api/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        footballType: data.footballType,
        players: data.players,
        color: data.color,
      }),
    });
    if (!res.ok) throw new Error('Failed to save team');
    const json = await res.json();
    const newTeam = json.data as Team;
    set((s) => ({ teams: [newTeam, ...s.teams] }));
    return newTeam;
  },

  updateTeam: async (id, data) => {
    const res = await fetch(`${API_URL}/api/teams/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        footballType: data.footballType,
        players: data.players,
        color: data.color,
      }),
    });
    if (!res.ok) throw new Error('Failed to update team');
    const json = await res.json();
    const updated = json.data as Team;
    set((s) => ({
      teams: s.teams.map((t) => (t.id === id ? updated : t)),
      currentTeam: s.currentTeam?.id === id ? updated : s.currentTeam,
    }));
  },

  deleteTeam: async (id) => {
    const res = await fetch(`${API_URL}/api/teams/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete team');
    set((s) => ({
      teams: s.teams.filter((t) => t.id !== id),
      currentTeam: s.currentTeam?.id === id ? null : s.currentTeam,
    }));
  },

  // ── Assign a roster player to a formation position ──
  assignPlayerToPosition: (positionId, teamPlayerId) => {
    const { currentTeam, positionAssignments } = get();
    if (!currentTeam) return;
    const player = currentTeam.players.find((p) => p.id === teamPlayerId);
    if (!player) return;

    // Remove the player from any other position first
    const cleaned: Record<string, string> = {};
    for (const [pos, pid] of Object.entries(positionAssignments)) {
      if (pid !== teamPlayerId) cleaned[pos] = pid;
    }
    cleaned[positionId] = teamPlayerId;

    set({ positionAssignments: cleaned });

    // Also update the players array with this player's info
    get().updatePlayer(positionId, {
      name: player.name,
      number: player.number,
      foot: player.foot,
    });
  },

  unassignPosition: (positionId) => {
    set((s) => {
      const cleaned = { ...s.positionAssignments };
      delete cleaned[positionId];
      return { positionAssignments: cleaned };
    });
    get().updatePlayer(positionId, { name: '', number: 0, foot: 'R' });
  },

  // ── Auto-assign roster players to positions based on preferred positions ──
  autoAssignTeam: () => {
    const { currentTeam, currentFormation } = get();
    if (!currentTeam || !currentFormation) return;

    const positions = currentFormation.player_positions;
    const rosterPlayers = [...currentTeam.players];
    const assignments: Record<string, string> = {};
    const usedPlayerIds = new Set<string>();

    // First pass: exact preferred position match
    for (const pos of positions) {
      const match = rosterPlayers.find(
        (p) =>
          !usedPlayerIds.has(p.id) &&
          p.preferredPositions.some(
            (pp) => {
              const transPos = translatePosition(pos.label).toUpperCase();
              const transPp = translatePosition(pp).toUpperCase();
              return transPp === transPos || transPos.includes(transPp) || transPp.includes(transPos);
            }
          )
      );
      if (match) {
        assignments[pos.id] = match.id;
        usedPlayerIds.add(match.id);
      }
    }

    // Second pass: fill remaining positions with unassigned players
    const unassignedPositions = positions.filter((p) => !assignments[p.id]);
    const unassignedPlayers = rosterPlayers.filter((p) => !usedPlayerIds.has(p.id));

    for (let i = 0; i < unassignedPositions.length && i < unassignedPlayers.length; i++) {
      assignments[unassignedPositions[i].id] = unassignedPlayers[i].id;
      usedPlayerIds.add(unassignedPlayers[i].id);
    }

    set({ positionAssignments: assignments });

    // Update the players array with roster info
    for (const [posId, playerId] of Object.entries(assignments)) {
      const player = currentTeam.players.find((p) => p.id === playerId);
      if (player) {
        get().updatePlayer(posId, {
          name: player.name,
          number: player.number,
          foot: player.foot,
        });
      }
    }
  },

  clearAssignments: () => {
    const { currentFormation } = get();
    set({ positionAssignments: {} });
    if (currentFormation) {
      set({
        players: currentFormation.player_positions.map((pos) => ({
          positionId: pos.id,
          name: '',
          number: 0,
          foot: 'R' as const,
        })),
      });
    }
  },
}));
