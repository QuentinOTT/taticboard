import { Router, Request, Response } from 'express';
import { query } from '../db/client';

const router = Router();

// GET /api/formations — liste toutes les formations (filtre par type optionnel)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    
    let sql = `
      SELECT 
        id, name, type, description,
        strengths, weaknesses, famous_teams,
        radar_stats, player_positions,
        best_counter_formations
      FROM formations
    `;
    const params: string[] = [];

    if (type === '11' || type === '8') {
      sql += ' WHERE type = $1';
      params.push(type);
    }

    sql += ' ORDER BY type ASC, name ASC';

    const formations = await query(sql, params);
    res.json({ data: formations, count: formations.length });
  } catch (error) {
    console.error('GET /formations error:', error);
    res.status(500).json({ error: 'Failed to fetch formations' });
  }
});

// GET /api/formations/:id — détail complet d'une formation
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const formations = await query(
      `SELECT * FROM formations WHERE id = $1`,
      [id]
    );

    if (formations.length === 0) {
      return res.status(404).json({ error: 'Formation not found' });
    }

    res.json({ data: formations[0] });
  } catch (error) {
    console.error('GET /formations/:id error:', error);
    res.status(500).json({ error: 'Failed to fetch formation' });
  }
});

export default router;
