// routes/categorias.js
const express = require('express');
const router = express.Router();
const db = require('../js/db');

// Obtener todas las categorías
router.get('/', (req, res) => {
  db.query('SELECT * FROM categoria', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

module.exports = router;
