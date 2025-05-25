const jwt = require('jsonwebtoken');
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const connection = require('../db');

const router = express.Router();

//  verificar el token
function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'Token requerido' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) {
      return res.status(403).json({ msg: 'Token inválido o expirado' });
    }

    // Mostrar datos del usuario 
    // console.log("Datos del usuario:", {
    //   id_usuario: usuario.id_usuario,
    //   nombre_usuario: usuario.nombre_usuario,
    //   email: usuario.email
    // });

    // verifica que el token tiene un ID de usuario válido
    if (!usuario.id_usuario) {
      return res.status(403).json({ msg: 'Token sin ID de usuario válido' });
    }

    req.usuario = usuario;
    req.userId = usuario.id_usuario;

    // Continua con la ruta siguiente
    next();
  });
}

// Ruta de registro
router.post('/register', async (req, res) => {
  const { nombre_usuario, email, password } = req.body;
  if (!nombre_usuario || !email || !password) return res.status(400).json({ msg: 'Faltan datos' });

  connection.query('SELECT * FROM usuario WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ msg: 'Error en base de datos' });

    if (results.length > 0) {
      return res.status(400).json({ msg: 'El email ya está en uso' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    connection.query(
      'INSERT INTO usuario (nombre_usuario, email, password_hash) VALUES (?, ?, ?)',
      [nombre_usuario, email, hashedPassword],
      (err, result) => {
        if (err) {
          console.error('Error al crear usuario:', err);
          return res.status(500).json({ msg: 'Error al crear usuario' });
        }
        return res.json({ id: result.insertId, nombre_usuario, email });
      }
    );
  });
});

// Ruta de login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ msg: 'Faltan datos' });

  console.log("Procesando login para:", email); // Agrega logs aquí

  connection.query('SELECT * FROM usuario WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ msg: 'Error en base de datos' });

    console.log("Resultados de consulta:", results);

    if (results.length === 0) return res.status(400).json({ msg: 'Usuario no encontrado' });

    const usuario = results[0];
    const match = await bcrypt.compare(password, usuario.password_hash);
    if (!match) return res.status(400).json({ msg: 'Contraseña incorrecta' });

    console.log("Login exitoso para usuario:", usuario.email);
    delete usuario.password_hash;

    // Generacion del token
    const token = jwt.sign({
      id_usuario: usuario.id_usuario,
      nombre_usuario: usuario.nombre_usuario,
      email: usuario.email
    }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Responder con el token y los datos del usuario 
    return res.json({ usuario: { id_usuario: usuario.id_usuario, nombre_usuario: usuario.nombre_usuario }, token });
  });
});


console.log(router.stack.map(layer => layer.route && layer.route.path));
module.exports = {
  router,
  verificarToken
};
