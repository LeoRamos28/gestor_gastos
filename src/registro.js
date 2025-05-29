import { UsuarioControlador } from './controladores/UsuarioControlador.js';

const form = document.getElementById('registro-form');

form.addEventListener('submit', async e => {
  e.preventDefault();

  const nombre_usuario = document.getElementById('nombre').value.trim();
  const email = document.getElementById('email-reg').value.trim();
  const password = document.getElementById('password-reg').value.trim();
  const ctrl = new UsuarioControlador();

  try {
    const nuevo = await ctrl.registrarse(nombre_usuario, email, password);
    if (nuevo && nuevo.token && nuevo.usuario) {
      localStorage.setItem('token', nuevo.token);
      localStorage.setItem('usuarioLogueado', JSON.stringify(nuevo.usuario));

      await Swal.fire({
        title: `¡Bienvenido, ${nuevo.usuario.nombre_usuario}!`,
        text: 'Te has registrado con éxito.',
        icon: 'success',
        confirmButtonText: 'Continuar',
      });

      window.location.href = '/login.html';
    } else if (nuevo) {
      localStorage.setItem('usuarioLogueado', JSON.stringify(nuevo));
      await Swal.fire({
        title: `¡Bienvenido, ${nuevo.nombre_usuario}!`,
        text: 'Te has registrado con éxito.',
        icon: 'success',
        confirmButtonText: 'Continuar',
      });
      window.location.href = '/login.html';
    } else {
      await Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Ese correo ya está en uso',
      });
    }
  } catch (err) {
    console.error('Error en registro:', err);
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al registrar usuario',
    });
  }
});
