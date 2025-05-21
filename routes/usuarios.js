const express = require('express');
const router = express.Router();



// Simulamos una "base de datos" de usuarios en memoria (por simplicidad)
let usuarios = [
  { id: 1, nombre: 'Juan', email: 'juan@example.com' },
  { id: 2, nombre: 'Ana', email: 'ana@example.com' }
];

// Obtener todos los usuarios
router.get('/', (_req, res) => {
  res.json(usuarios);
});

// Obtener un usuario por id
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
  const { nombre, email } = req.body;
  if (!nombre || !email) {
    return res.status(400).json({ msg: 'Faltan datos' });
  }
  const nuevoUsuario = {
    id: usuarios.length + 1,
    nombre,
    email
  };
  usuarios.push(nuevoUsuario);
  res.status(201).json(nuevoUsuario);
});

// Actualizar usuario
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { nombre, email } = req.body;
  const usuarioIndex = usuarios.findIndex(u => u.id === id);
  if (usuarioIndex === -1) {
    return res.status(404).json({ msg: 'Usuario no encontrado' });
  }
  usuarios[usuarioIndex] = { id, nombre, email };
  res.json(usuarios[usuarioIndex]);
});

// Eliminar usuario
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  usuarios = usuarios.filter(u => u.id !== id);
  res.json({ msg: 'Usuario eliminado' });
});

module.exports = router;
