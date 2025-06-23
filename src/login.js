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
    // guarda token separado
    localStorage.setItem('token', response.token);

    // guarda datos del usuario
    localStorage.setItem('usuarioLogueado', JSON.stringify(response.usuario));

    Swal.fire({
      icon: 'success',
      title: `¡Bienvenido, ${response.usuario.nombre_usuario}!`,
      text: 'Has iniciado sesión con éxito.',
      confirmButtonText: 'Continuar'
    }).then(() => {
      window.location.href = '/index.html';
    });
  }
});

/* 
Captura el submit del formulario.

Obtiene email y password del formulario.

Llama a UsuarioControlador.iniciarSesion(email, password) para autenticar.

Muestra error con SweetAlert si la respuesta tiene msg.

Si es exitoso, guarda token y usuario en localStorage.

Muestra alerta de éxito y redirige a la página principal.*/