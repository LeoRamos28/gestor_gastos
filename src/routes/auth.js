const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

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

    // verificar que el token tiene un ID valido
    if (!usuario.id_usuario) {
      return res.status(403).json({ msg: 'Token sin ID de usuario válido' });
    }

    req.usuario = usuario;
    req.userId = usuario.id_usuario;

    next();
  });
}

// Ruta de registro
router.post('/register', async (req, res) => {
  const { nombre_usuario, email, password } = req.body;

  if (!nombre_usuario || !email || !password) {
    return res.status(400).json({ msg: 'Faltan datos' });
  }

  try {
    // Verificar si el email ya esta en uso
    const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });

    if (usuarioExistente) {
      return res.status(400).json({ msg: 'El email ya está en uso' });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const nuevoUsuario = await prisma.usuario.create({
      data: { nombre_usuario, email, password_hash: hashedPassword }
    });

    res.json({ id: nuevoUsuario.id_usuario, nombre_usuario, email });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ msg: 'Error interno' });
  }
});

// Ruta de login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
      console.log("Intentando login para:", email);

  if (!email || !password) {
    return res.status(400).json({ msg: 'Faltan datos' });
  }

  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
        console.log("Usuario encontrado:", usuario);
    if (!usuario) {
      return res.status(400).json({ msg: 'Usuario no encontrado' });
    }

    const match = await bcrypt.compare(password, usuario.password_hash);
    if (!match) {
      return res.status(400).json({ msg: 'Contraseña incorrecta' });
    }

    // Generar JWT
    const token = jwt.sign({
      id_usuario: usuario.id_usuario,
      nombre_usuario: usuario.nombre_usuario,
      email: usuario.email
    }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Responder sin la contraseña
    delete usuario.password_hash;
    res.json({ usuario: { id_usuario: usuario.id_usuario, nombre_usuario: usuario.nombre_usuario }, token });

  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ msg: 'Error interno' });
  }
});

module.exports = {
  router,
  verificarToken
};



/* 
Verifica si el cliente incluyó un token en el header Authorization.

Usa jwt.verify() para comprobar que el token es válido.

Si es válido, adjunta los datos del usuario a la solicitud (req.usuario y req.userId) y deja pasar a la siguiente ruta.

Recibe nombre, email y contraseña.

Verifica que no haya un usuario con el mismo email.

Encripta la contraseña con bcrypt.

Crea un nuevo usuario en la base de datos con prisma.usuario.create.

Devuelve los datos del nuevo usuario (sin contraseña).

Recibe email y contraseña del usuario.

Busca el usuario por email.

Compara la contraseña con el hash guardado en base de datos.

Si coincide:

Genera un JWT con los datos del usuario.

Devuelve el token y los datos del usuario (sin la contraseña).

Este código define un módulo de autenticación en un servidor Node.js con Express usando:

🧠 JWT (JSON Web Tokens) para manejo de sesiones.

🔐 bcrypt para encriptar contraseñas.

🧱 Prisma para interactuar con una base de datos.

📦 dotenv para cargar variables sensibles como JWT_SECRET.

*/