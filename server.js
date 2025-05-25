require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const path = require('path');
const { router: authRoutes, verificarToken } = require('./routes/auth');

const usuariosRoutes = require('./routes/usuarios');
const gastosRoutes = require('./routes/gastos');
const categoriasRoutes = require('./routes/categorias'); 

const app = express();
const port = 3000;

app.use(express.json());



app.use('/api/usuarios', usuariosRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/gastos', verificarToken, gastosRoutes);
app.use('/api/categorias', categoriasRoutes); 

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.use(express.static(path.join(__dirname)));


app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
