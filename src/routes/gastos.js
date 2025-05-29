const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verificarToken } = require('./auth');

const prisma = new PrismaClient();
const router = express.Router();

router.use(verificarToken);

router.get('/', async (req, res) => {
  try {
    const gastos = await prisma.gasto.findMany({
      where: { id_usuario: req.userId },
      select: {
        id_gasto: true,
        nombre: true,
        monto: true,
        fecha: true,
        id_usuario: true,
        categoria: { select: { nombre_categoria: true } } 
      }
    });

    console.log("Gastos enviados al frontend:", JSON.stringify(gastos, null, 2));
    res.json(gastos);
  } catch (error) {
    console.error('Error al obtener gastos:', error);
    res.status(500).json({ msg: 'Error interno en el servidor' });
  }
});



// Agregar gasto
router.post('/', async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ msg: "Usuario no autenticado" });
  }

  const { nombre, monto, categoria } = req.body;

  try {
    console.log("Solicitud recibida:", req.body); // Verificar los datos recibidos
    const categoriaEncontrada = await prisma.categoria.findUnique({
      where: { nombre_categoria: categoria }
    });

    if (!categoriaEncontrada) {
      return res.status(400).json({ msg: 'Categoría no encontrada' });
    }

    const nuevoGasto = await prisma.gasto.create({
      data: {
        nombre,
        monto: monto,
        fecha: new Date(),
        id_usuario: req.userId,
        id_categoria: categoriaEncontrada.id_categoria
      }
    });
        console.log("Gasto registrado:", nuevoGasto); // Verifica qué se está guardando

    res.status(201).json(nuevoGasto);
  } catch (error) {
    console.error('Error al insertar gasto:', error);
    res.status(500).json({ msg: 'Error al guardar el gasto' });
  }
});

// Editar gasto 
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, monto, categoria } = req.body;

  try {
    const categoriaEncontrada = await prisma.categoria.findUnique({
      where: { nombre_categoria: categoria }
    });

    if (!categoriaEncontrada) {
      return res.status(400).json({ msg: 'Categoría no encontrada' });
    }

    const gastoActualizado = await prisma.gasto.update({
      where: { id_gasto: parseInt(id) },
      data: {
        nombre,
        monto: monto,
        id_categoria: categoriaEncontrada.id_categoria
      }
    });

    res.json(gastoActualizado);
  } catch (error) {
    console.error('Error al actualizar gasto:', error);
    res.status(500).json({ msg: 'Error al actualizar el gasto' });
  }
});

// Eliminar gasto
router.delete('/:id', async (req, res) => {
  try {
    await prisma.gasto.delete({
      where: { id_gasto: parseInt(req.params.id) }
    });

    res.json({ msg: 'Gasto eliminado' });
  } catch (error) {
    console.error('Error al eliminar gasto:', error);
    res.status(500).json({ msg: 'Error al eliminar el gasto' });
  }
});

module.exports = router;
