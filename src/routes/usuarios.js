const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verificarToken } = require('./auth');

const prisma = new PrismaClient();
const router = express.Router();


// verificar usuario registrado

router.get('/perfil', verificarToken, async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: req.usuario.id_usuario }
    });

    if (!usuario) {
      return res.status(401).json({ msg: 'Acceso denegado.' });
    }

    res.json({
      msg: `Bienvenido, Tus datos son los siguientes:`,
      usuario
    });
  } catch (error) {
    res.status(500).json({ msg: 'Error al obtener el perfil' });
  }
});

router.get('/', async (_req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ msg: 'Error al obtener los usuarios' });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: parseInt(req.params.id) }
    });

    if (!usuario) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ msg: 'Error al obtener el usuario' });
  }
});


// Crear un nuevo usuario
router.post('/', async (req, res) => {
  const { nombre_usuario, email, password_hash } = req.body;

  if (!nombre_usuario || !email || !password_hash) {
    return res.status(400).json({ msg: 'Faltan datos' });
  }

  try {
    const nuevoUsuario = await prisma.usuario.create({
      data: { nombre_usuario, email, password_hash }
    });

    res.status(201).json(nuevoUsuario);
  } catch (error) {
    res.status(500).json({ msg: 'Error al crear usuario' });
  }
});
// actualizar usuario
router.put('/:id', async (req, res) => {
  const { nombre_usuario, email } = req.body;

  try {
    const usuarioActualizado = await prisma.usuario.update({
      where: { id_usuario: parseInt(req.params.id) },
      data: { nombre_usuario, email }
    });

    res.json(usuarioActualizado);
  } catch (error) {
    res.status(500).json({ msg: 'Error al actualizar usuario' });
  }
});
// Eliminar usuario
router.delete('/:id', async (req, res) => {
  try {
    await prisma.usuario.delete({
      where: { id_usuario: parseInt(req.params.id) }
    });

    res.json({ msg: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ msg: 'Error al eliminar usuario' });
  }
});

module.exports = router;
