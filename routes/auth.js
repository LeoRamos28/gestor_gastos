const express = require('express');
const bcrypt = require('bcrypt');
const connection = require('../js/db');
const router = express.Router();

// Registro
router.post('/register', async (req, res) => {
  const { nombre, email, password } = req.body;
  if (!nombre || !email || !password) return res.status(400).json({ msg: 'Faltan datos' });

  // Verificar si el email  existe
  connection.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ msg: 'Error en base de datos' });

    if (results.length > 0) {
      return res.status(400).json({ msg: 'El correo ya está en uso' });
    } else {
      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

connection.query(
  'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
  [nombre, email, hashedPassword],
  (err, result) => {
    if (err) {
      console.error('Error al crear usuario:', err); 
      return res.status(500).json({ msg: 'Error al crear usuario' });
    }

    return res.json({ id: result.insertId, nombre, email });
  }
);
    }
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ msg: 'Faltan datos' });

  connection.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ msg: 'Error en base de datos' });

    if (results.length === 0) {
      return res.status(400).json({ msg: 'Usuario no encontrado' });
    }

    const usuario = results[0];
    const match = await bcrypt.compare(password, usuario.password);

    if (!match) {
      return res.status(400).json({ msg: 'Contraseña incorrecta' });
    }

    delete usuario.password;

    return res.json(usuario);
  });
});

module.exports = router;
