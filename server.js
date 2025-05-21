const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const gastosRoutes = require('./routes/gastos');
const categoriasRoutes = require('./routes/categorias'); // <-- NUEVO

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/usuarios', usuariosRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/gastos', gastosRoutes);
app.use('/api/categorias', categoriasRoutes); // <-- NUEVO

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.use(express.static(path.join(__dirname)));

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
