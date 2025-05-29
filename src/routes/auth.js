const express = Require('express');
const jwt = Require('jsonwebtoken');
Require('dotenv').config();
const bcrypt = Require('bcrypt');
const { PrismaClient } = Require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();



// Generar JWT
    const token = jwt.sign({
      id_usuario: usuario.id_usuario,
      nombre_usuario: usuario.nombre_usuario,
      email: usuario.email
    }, process.env.JWT_SECRET, { expiresIn: '1h' });


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

    // Continuar con la ruta siguiente
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
    // Verificar si el email ya está en uso
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

    // Responder sin la contraseña
    delete usuario.password_hash;
    res.json({ usuario: { id_usuario: usuario.id_usuario, nombre_usuario: usuario.nombre_usuario }, token });

  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ msg: 'Error interno' });
  }
});


// console.log(router.stack.map(layer => layer.route && layer.route.path));
module.exports = {
  router,
  verificarToken
};
