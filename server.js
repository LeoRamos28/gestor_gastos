require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { router: authRoutes, verificarToken } = require('./src/routes/auth');

const usuariosRoutes = require('./src/routes/usuarios');
const gastosRoutes = require('./src/routes/gastos');
const categoriasRoutes = require('./src/routes/categorias'); 
const perfilRoutes = require('./src/routes/usuarios'); // #NUEVO
const presupuestoRoutes = require('./src/routes/presupuesto');

const app = express();
const port = 3000;

app.use(express.json());
app.use('/api/presupuestos', presupuestoRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/perfil', verificarToken, perfilRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/gastos', verificarToken, gastosRoutes);
app.use('/api/categorias', verificarToken, categoriasRoutes);
// app.use('/api/categorias', categoriasRoutes); 

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'public', 'inicio.html'));
});

app.get('/api', (req, res) => {
  const condicion = true;

  if (condicion){
    res.send({
      success: true,
      message : "API esta funcionando correctamente",

    });
  }else {
    res.send({
      success: false,
      message : "API no esta funcionando"
  });
}
});
// app.get('/api', (req, res) => {
// //   res.send('API está funcionando correctamente');
// });

app.use(express.static(path.join(__dirname, 'public')));
app.use('/src', express.static(path.join(__dirname, 'src')));


app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
