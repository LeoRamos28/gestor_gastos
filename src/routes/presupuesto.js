const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verificarToken } = require('./auth');

const prisma = new PrismaClient();
const router = express.Router();

router.use(verificarToken);

// Obtener presupuesto 
router.get('/:id_usuario', async (req, res) => {
    const { id_usuario } = req.params;
    try {
        const presupuesto = await prisma.presupuesto.findUnique({
            where: { id_usuario: parseInt(id_usuario) }
        });

        if (!presupuesto) {
            return res.status(404).json({ msg: 'Presupuesto no encontrado' });
        }

        res.json({ presupuesto: presupuesto.cantidad });
    } catch (error) {
        console.error('Error al obtener presupuesto:', error);
        res.status(500).json({ msg: 'Error interno en el servidor' });
    }
});

// Guardar o actualizar el presupuesto
router.post('/', async (req, res) => {
    const { id_usuario, cantidad } = req.body;

    try {
        // Verificar si  tiene un presupuesto
        const presupuestoExistente = await prisma.presupuesto.findUnique({
            where: { id_usuario: parseInt(id_usuario) }
        });

        if (presupuestoExistente) {
            // Si existe, actualizar
            await prisma.presupuesto.update({
                where: { id_usuario: parseInt(id_usuario) },
                data: { cantidad }
            });
        } else {
            // Si no existe, crear uno nuevo
            await prisma.presupuesto.create({
                data: { id_usuario: parseInt(id_usuario), cantidad }
            });
        }

        res.json({ msg: 'Presupuesto guardado correctamente' });
    } catch (error) {
        console.error('Error al guardar presupuesto:', error);
        res.status(500).json({ msg: 'Error interno en el servidor' });
    }
});

module.exports = router;
