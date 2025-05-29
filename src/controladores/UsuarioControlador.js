export class UsuarioControlador {
  async registrarse(nombre_usuario, email, password) {
    try {
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_usuario, email, password })
      });

      if (!res.ok) {
        const errorMessage = await res.json().catch(() => ({ msg: 'Error en el servidor' }));
        console.error('Error en registro:', errorMessage);
        return null;
      }

      return await res.json();
    } catch (error) {
      console.error('Error en registro:', error);
      return null;
    }
  }

  async iniciarSesion(email, password) {
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

        console.log("Respuesta del servidor:", response); // respuesta servidor
          if (!response.ok) {
            const errorMessage = await response.json().catch(() => ({ msg: 'Error en el servidor' }));
            console.error('Error en login:', errorMessage);
            return errorMessage; // mensaje con SweetAlert
      }

      const data = await response.json();
      if (data.token) {
        sessionStorage.setItem('token', data.token); 
        sessionStorage.setItem('usuarioLogueado', JSON.stringify(data.usuario));
      }

      return data;
    } catch (error) {
      console.error('Error en login:', error);
      return null;
    }
  }

  obtenerUsuarioActual() {
    return JSON.parse(sessionStorage.getItem('usuarioLogueado'));
  }

  cerrarSesion() {
    sessionStorage.removeItem('usuarioLogueado');
    sessionStorage.removeItem('token');
  }
}
