import { Router, Request, Response } from 'express';
import { query } from '../db/client';
import { randomUUID } from 'crypto';

const router = Router();

// GET /api/teams — liste toutes les équipes
router.get('/', async (_req: Request, res: Response) => {
  try {
    const teams = await query(
      `SELECT id, name, football_type, players, color, created_at, updated_at
       FROM teams ORDER BY created_at DESC`
    );
    res.json({ data: teams, count: teams.length });
  } catch (error) {
    console.error('GET /teams error:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// GET /api/teams/:id — détail d'une équipe
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query(`SELECT * FROM teams WHERE id = $1`, [req.params.id]);
    if (result.length === 0) return res.status(404).json({ error: 'Team not found' });
    res.json({ data: result[0] });
  } catch (error) {
    console.error('GET /teams/:id error:', error);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// POST /api/teams — créer une équipe
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, footballType, players, color } = req.body;
    if (!name || !footballType) {
      return res.status(400).json({ error: 'name and footballType are required' });
    }

    // Ensure each player has an id
    const playersWithIds = (players || []).map((p: Record<string, unknown>) => ({
      id: p.id || randomUUID(),
      name: p.name || '',
      number: p.number || 0,
      preferredPositions: p.preferredPositions || [],
      foot: p.foot || 'R',
      avatarColor: p.avatarColor || '#3b82f6',
    }));

    const result = await query(
      `INSERT INTO teams (name, football_type, players, color)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, footballType, JSON.stringify(playersWithIds), color || '#3b82f6']
    );
    res.status(201).json({ data: result[0] });
  } catch (error) {
    console.error('POST /teams error:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// PUT /api/teams/:id — mettre à jour une équipe
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, footballType, players, color } = req.body;

    // Ensure player ids
    const playersWithIds = players
      ? players.map((p: Record<string, unknown>) => ({
          id: p.id || randomUUID(),
          name: p.name || '',
          number: p.number || 0,
          preferredPositions: p.preferredPositions || [],
          foot: p.foot || 'R',
          avatarColor: p.avatarColor || '#3b82f6',
        }))
      : null;

    const result = await query(
      `UPDATE teams SET
        name = COALESCE($2, name),
        football_type = COALESCE($3, football_type),
        players = COALESCE($4, players),
        color = COALESCE($5, color),
        updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [
        req.params.id,
        name || null,
        footballType || null,
        playersWithIds ? JSON.stringify(playersWithIds) : null,
        color || null,
      ]
    );
    if (result.length === 0) return res.status(404).json({ error: 'Team not found' });
    res.json({ data: result[0] });
  } catch (error) {
    console.error('PUT /teams/:id error:', error);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

// DELETE /api/teams/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query(`DELETE FROM teams WHERE id = $1 RETURNING id`, [req.params.id]);
    if (result.length === 0) return res.status(404).json({ error: 'Team not found' });
    res.json({ data: { deleted: true } });
  } catch (error) {
    console.error('DELETE /teams/:id error:', error);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

export default router;
