const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener categorías
router.get('/', (req, res) => {
  db.query('SELECT * FROM Categoria', (err, results) => {
    if (err) {
      console.error('Error al obtener categorías:', err);
      return res.status(500).json({ msg: 'Error al obtener las categorías' });
    }
    res.json(results);
  });
});

// Agregar  categoria
router.post('/', (req, res) => {
  const { nombre_categoria } = req.body;
  db.query('INSERT INTO Categoria (nombre_categoria) VALUES (?)',
    [nombre_categoria],
    (err, result) => {
      if (err) {
        console.error('Error al agregar categoría:', err);
        return res.status(500).json({ msg: 'Error al agregar la categoría' });
      }
      res.status(201).json({ id: result.insertId, nombre_categoria });
    });
});

// Editar una categoria
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nombre_categoria } = req.body;

  db.query('UPDATE Categoria SET nombre_categoria = ? WHERE id_categoria = ?',
    [nombre_categoria, id],
    (err) => {
      if (err) {
        console.error('Error al editar categoría:', err);
        return res.status(500).json({ msg: 'Error al editar la categoría' });
      }
      res.json({ id, nombre_categoria });
    });
});

// Eliminar una categoria
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM Categoria WHERE id_categoria = ?', [id], (err) => {
    if (err) {
      console.error('Error al eliminar categoría:', err);
      return res.status(500).json({ msg: 'Error al eliminar la categoría' });
    }
    res.json({ msg: 'Categoría eliminada correctamente', id });
  });
});

module.exports = router;
