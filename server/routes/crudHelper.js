const pool = require('../db');
const authMiddleware = require('../middleware/auth');

function createCrudRoutes(tableName, orderBy = 'id') {
  const router = require('express').Router();

  // Apply auth to all CRUD routes
  router.use(authMiddleware);

  router.get('/export', async (req, res) => {
    try { const r=await pool.query(`SELECT * FROM ${tableName} ORDER BY ${orderBy} DESC LIMIT 500`); const {filterRecords,toCsv}=require('../domain/taskPolicy'); const rows=filterRecords(r.rows,req.query||{});
      if(String(req.query.format||'json').toLowerCase()==='csv'){ res.setHeader('Content-Type','text/csv'); res.setHeader('Content-Disposition','attachment; filename="export.csv"'); return res.send(toCsv(rows)); }
      res.json({exported_at:new Date().toISOString(),count:rows.length,records:rows}); } catch(err){ res.status(500).json({error:err.message}); }
  });
  // GET all with pagination (+ search/filter on main list)
  router.get('/', async (req, res) => {
    try {
      const page = Math.max(parseInt(req.query.page) || 1, 1);
      const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
      const offset = (page - 1) * limit;
      if (req.query.search||req.query.q||req.query.status||req.query.difficulty) {
        const all=await pool.query(`SELECT * FROM ${tableName} ORDER BY ${orderBy} DESC LIMIT 500`);
        const {filterRecords}=require('../domain/taskPolicy'); const rows=filterRecords(all.rows,req.query);
        return res.json({data:rows.slice(offset,offset+limit),pagination:{page,limit,total:rows.length,totalPages:Math.ceil(rows.length/limit)}});
      }
      const countResult = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
      const total = parseInt(countResult.rows[0].count);
      const result = await pool.query(
        `SELECT * FROM ${tableName} ORDER BY ${orderBy} DESC LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      res.json({
        data: result.rows,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET one
  router.get('/:id', async (req, res) => {
    try {
      const result = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST create
  router.post('/', async (req, res) => {
    try {
      const keys = Object.keys(req.body);
      const values = Object.values(req.body);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const columns = keys.join(', ');
      const result = await pool.query(
        `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT update
  router.put('/:id', async (req, res) => {
    try {
      const keys = Object.keys(req.body);
      const values = Object.values(req.body);
      const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
      values.push(req.params.id);
      const result = await pool.query(
        `UPDATE ${tableName} SET ${sets}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
        values
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE
  router.delete('/:id', async (req, res) => {
    try {
      const result = await pool.query(`DELETE FROM ${tableName} WHERE id = $1 RETURNING *`, [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json({ message: 'Deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}

module.exports = createCrudRoutes;
