export class UsuarioControlador {
 async registrarse(nombre, email, password) {
  const res = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ nombre, email, password })
  });

  if (!res.ok) {
    const error = await res.json();
    console.error('Error en registro:', error);
    return null;
  }

  return await res.json(); 
}


  async iniciarSesion(email, password) {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return await response.json();
  }

  obtenerUsuarioActual() {
    return JSON.parse(localStorage.getItem('usuarioLogueado'));
  }

  cerrarSesion() {
    localStorage.removeItem('usuarioLogueado');
  }
}
