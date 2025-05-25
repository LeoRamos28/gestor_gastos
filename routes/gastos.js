const express = require('express');
const router = express.Router();
const db = require('../js/db');
const { verificarToken } = require('./auth'); 

router.use(verificarToken); 

router.get('/', (req, res) => {
  const userId = req.userId;

  const query = `
    SELECT 
      Gasto.id_gasto AS id,
      Gasto.nombre,
      Gasto.monto AS cantidad,
      Categoria.nombre_categoria AS categoria
    FROM Gasto
    INNER JOIN Categoria ON Gasto.id_categoria = Categoria.id_categoria
    WHERE Gasto.id_usuario = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error al obtener gastos:', err);
      return res.status(500).json({ msg: 'Error al obtener los gastos' });
    }
    res.json(results);
  });
});


// Agregar gasto
router.post('/', (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ msg: "Usuario no autenticado" });
  }
  const { nombre, cantidad, categoria } = req.body;
  const userId = req.userId;

  const queryCategoria = 'SELECT id_categoria FROM Categoria WHERE nombre_categoria = ?';
  db.query(queryCategoria, [categoria], (err, rows) => {
    if (err) {
      console.error('Error al buscar categoría:', err);
      return res.status(500).json({ msg: 'Error al buscar categoría' });
    }

    if (rows.length === 0) {
      return res.status(400).json({ msg: 'Categoría no encontrada' });
    }

    const id_categoria = rows[0].id_categoria;

    const insertQuery = `
      INSERT INTO Gasto (nombre, monto, fecha, id_usuario, id_categoria)
      VALUES (?, ?, NOW(), ?, ?)
    `;
    db.query(insertQuery, [nombre, cantidad, req.userId, id_categoria], (err, result) => {
      if (err) {
        console.error('Error al insertar gasto:', err);
        return res.status(500).json({ msg: 'Error al guardar el gasto' });
      }

      res.status(201).json({
        id: result.insertId,
        nombre,
        cantidad,
        categoria
      });
    });
  });
});

// Editar gasto 
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, cantidad, categoria } = req.body;

  const queryCategoria = 'SELECT id_categoria FROM Categoria WHERE nombre_categoria = ?';
  db.query(queryCategoria, [categoria], (err, rows) => {
    if (err) {
      console.error('Error al buscar categoría:', err);
      return res.status(500).json({ msg: 'Error al buscar categoría' });
    }

    if (rows.length === 0) {
      return res.status(400).json({ msg: 'Categoría no encontrada' });
    }

    const id_categoria = rows[0].id_categoria;

    const updateQuery = `
      UPDATE Gasto
      SET nombre = ?, monto = ?, id_categoria = ?
      WHERE id_gasto = ? AND id_usuario = ?
    `;
    db.query(updateQuery, [nombre, cantidad, id_categoria, id, req.userId], (err, result) => {
      if (err) {
        console.error('Error al editar gasto:', err);
        return res.status(500).json({ msg: 'Error al actualizar el gasto' });
      }

      res.json({ id, nombre, cantidad, categoria });
    });
  });
});

// Eliminar gasto
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const deleteQuery = `
    DELETE FROM Gasto WHERE id_gasto = ? AND id_usuario = ?
  `;
  db.query(deleteQuery, [id, req.userId], (err, result) => {
    if (err) {
      console.error('Error al eliminar gasto:', err);
      return res.status(500).json({ msg: 'Error al eliminar el gasto' });
    }

    res.json({ id });
  });
});

module.exports = router;
