import { Router, Request, Response } from 'express';
import { query } from '../db/client';
import { nanoid } from 'nanoid';

const router = Router();

// POST /api/compositions — créer une composition
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, formationId, footballType, players, homeColor, awayColor, notes } = req.body;

    if (!footballType || !['11', '8'].includes(footballType)) {
      return res.status(400).json({ error: 'footballType must be "11" or "8"' });
    }

    const slug = nanoid(12);

    const result = await query(
      `INSERT INTO compositions 
        (slug, title, formation_id, football_type, players, home_color, away_color, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        slug,
        title || 'Ma composition',
        formationId || null,
        footballType,
        JSON.stringify(players || []),
        homeColor || '#3b82f6',
        awayColor || '#ef4444',
        notes || '',
      ]
    );

    res.status(201).json({ data: result[0] });
  } catch (error) {
    console.error('POST /compositions error:', error);
    res.status(500).json({ error: 'Failed to create composition' });
  }
});

// GET /api/compositions/:id — récupérer par UUID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT c.*, f.name as formation_name, f.player_positions as formation_positions
       FROM compositions c
       LEFT JOIN formations f ON c.formation_id = f.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: 'Composition not found' });
    }

    res.json({ data: result[0] });
  } catch (error) {
    console.error('GET /compositions/:id error:', error);
    res.status(500).json({ error: 'Failed to fetch composition' });
  }
});

// PUT /api/compositions/:id — mettre à jour
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, formationId, players, homeColor, awayColor, notes } = req.body;

    const result = await query(
      `UPDATE compositions SET
        title = COALESCE($2, title),
        formation_id = COALESCE($3, formation_id),
        players = COALESCE($4, players),
        home_color = COALESCE($5, home_color),
        away_color = COALESCE($6, away_color),
        notes = COALESCE($7, notes),
        updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [
        id,
        title,
        formationId,
        players ? JSON.stringify(players) : null,
        homeColor,
        awayColor,
        notes,
      ]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: 'Composition not found' });
    }

    res.json({ data: result[0] });
  } catch (error) {
    console.error('PUT /compositions/:id error:', error);
    res.status(500).json({ error: 'Failed to update composition' });
  }
});

// GET /api/share/:slug — récupérer par slug (lien partageable)
router.get('/share/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    const result = await query(
      `SELECT c.*, f.name as formation_name, f.player_positions as formation_positions, f.radar_stats
       FROM compositions c
       LEFT JOIN formations f ON c.formation_id = f.id
       WHERE c.slug = $1`,
      [slug]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: 'Composition not found' });
    }

    res.json({ data: result[0] });
  } catch (error) {
    console.error('GET /share/:slug error:', error);
    res.status(500).json({ error: 'Failed to fetch composition' });
  }
});

export default router;
