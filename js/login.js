import { UsuarioControlador } from './controladores/UsuarioControlador.js';

const form = document.getElementById('login-form');
form.addEventListener('submit', async e => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const ctrl = new UsuarioControlador();

  const response = await ctrl.iniciarSesion(email, password);
  if (response.msg) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: response.msg
    });
  } else {
    localStorage.setItem('usuarioLogueado', JSON.stringify(response));
    Swal.fire({
      icon: 'success',
      title: `¡Bienvenido, ${response.nombre}!`,
      text: 'Has iniciado sesión con éxito.',
      confirmButtonText: 'Continuar'
    }).then(() => {
      window.location.href = 'index.html';  // o a la página principal después del login
    });
  }
});
