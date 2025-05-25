const express = require('express');
const router = express.Router();

const { verificarToken } = require('./auth');  



// verificar usuario registrado
router.get('/perfil', (req, res) => {
  res.json({
    msg: 'Este es tu perfil',
    usuario: req.usuario
  });
});

// obtener todos los usuarios
router.get('/', (_req, res) => {
  res.json(usuarios);
});

// obtener un usuario por id
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const usuario = usuarios.find(u => u.id === id);
  if (!usuario) {
    return res.status(404).json({ msg: 'Usuario no encontrado' });
  }
  res.json(usuario);
});

// Crear un nuevo usuario
router.post('/', (req, res) => {
  const { nombre_usuario, email } = req.body;
  if (!nombre_usuario || !email) {
    return res.status(400).json({ msg: 'Faltan datos' });
  }
  const nuevoUsuario = {
    id: usuarios.length + 1,
    nombre_usuario,
    email
  };
  usuarios.push(nuevoUsuario);
  res.status(201).json(nuevoUsuario);
});

// actualizar usuario
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { nombre_usuario, email } = req.body;
  const usuarioIndex = usuarios.findIndex(u => u.id === id);
  if (usuarioIndex === -1) {
    return res.status(404).json({ msg: 'Usuario no encontrado' });
  }
  usuarios[usuarioIndex] = { id, nombre_usuario, email };
  res.json(usuarios[usuarioIndex]);
});

// Eliminar usuario
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  usuarios = usuarios.filter(u => u.id !== id);
  res.json({ msg: 'Usuario eliminado' });
});

module.exports = router;
