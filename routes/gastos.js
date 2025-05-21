const express = require('express');

const router = express.Router();
const db = require('../js/db');

// Obtener gastos
router.get('/', (req, res) => {
  db.query('SELECT * FROM gastos', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// agregar gasto
router.post('/', (req, res) => {
  const { nombre, cantidad, categoria } = req.body;
  db.query('INSERT INTO gastos (nombre, cantidad, categoria) VALUES (?, ?, ?)',
    [nombre, cantidad, categoria],
    (err, result) => {
      if (err) throw err;
      res.json({ id: result.insertId, nombre, cantidad, categoria });
    });
});

// editar gasto
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, cantidad, categoria } = req.body;
  db.query('UPDATE gastos SET nombre = ?, cantidad = ?, categoria = ? WHERE id = ?',
    [nombre, cantidad, categoria, id],
    (err) => {
      if (err) throw err;
      res.json({ id, nombre, cantidad, categoria });
    });
});

// eliminar gasto
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM gastos WHERE id = ?', [id], (err) => {
    if (err) throw err;
    res.json({ id });
  });
});


module.exports = router;
