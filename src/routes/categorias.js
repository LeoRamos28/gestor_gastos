const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Obtener categorías
router.get('/', async (_req, res) => {
  try {
    const categorias = await prisma.categoria.findMany();
    res.json(categorias);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ msg: 'Error al obtener las categorías' });
  }
});

// Agregar  categoria
router.post('/', async (req, res) => {
  const { nombre_categoria } = req.body;

  try {
    const nuevaCategoria = await prisma.categoria.create({
      data: { nombre_categoria }
    });

    res.status(201).json(nuevaCategoria);
  } catch (error) {
    console.error('Error al agregar categoría:', error);
    res.status(500).json({ msg: 'Error al agregar la categoría' });
  }
});

// Editar una categoria
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre_categoria } = req.body;

  try {
    const categoriaActualizada = await prisma.categoria.update({
      where: { id_categoria: parseInt(id) },
      data: { nombre_categoria }
    });

    res.json(categoriaActualizada);
  } catch (error) {
    console.error('Error al editar categoría:', error);
    res.status(500).json({ msg: 'Error al editar la categoría' });
  }
});

// Eliminar una categoria
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.categoria.delete({
      where: { id_categoria: parseInt(id) }
    });

    res.json({ msg: 'Categoría eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ msg: 'Error al eliminar la categoría' });
  }
});

module.exports = router;
