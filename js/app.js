const API_URL = 'http://localhost:3000/api/gastos';

const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado'));

const formulario = document.querySelector('#agregar-gasto');
const gastoListado = document.querySelector('#gastos ul');
const btnFilter = document.getElementById('btn-filter');

let editMode = false;
let editGastoId;


eventListeners();

function eventListeners() {
    document.addEventListener('DOMContentLoaded', () => {
        preguntarPresupuesto();
        // cargarGastosDesdeBackend();
    });
    formulario.addEventListener('submit', agregarGasto);
    btnFilter.addEventListener('click', filtrarGastos);
}

class Presupuesto {
    constructor(presupuesto) {
        this.presupuesto = Number(presupuesto);
        this.restante = this.presupuesto; 
        this.gastos = [];
    }

    calcularRestante() {
        const gastado = this.gastos.reduce((total, gasto) => total + gasto.cantidad, 0);
        this.restante = this.presupuesto - gastado;
        // console.log(`Gastado: ${gastado}, Restante: ${this.restante}`);

    }
}

let presupuesto;

class UI {
    insertarPresupuesto(cantidad) {
        const { presupuesto, restante } = cantidad;
        document.querySelector('#total').textContent = presupuesto;
        document.querySelector('#restante').textContent = restante;
    }

    imprimirAlerta(mensaje, tipo) {
        Swal.fire({
            text: mensaje,
            icon: tipo === 'error' ? 'error' : tipo,
            confirmButtonText: 'OK',
            timer: 3000,
            timerProgressBar: true
        });
    }

    agregarGastoListado(gastos) {
        this.limpiarHtml();
        gastos.forEach(gasto => {
            const { cantidad, nombre, categoria, id } = gasto;

            const nuevoGasto = document.createElement('li');
            nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center';
            nuevoGasto.dataset.id = id;
            nuevoGasto.innerHTML = `${nombre} <span class='badge badge-primary badge-pill'> $${cantidad} </span>  ${categoria}`;

            const btnBorrar = document.createElement('button');
            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
            btnBorrar.textContent = 'Borrar X';
            btnBorrar.onclick = () => eliminarGasto(id);
            nuevoGasto.appendChild(btnBorrar);

            const btnEditar = document.createElement('button');
            btnEditar.classList.add('btn', 'btn-info', 'editar-gasto', 'ml-2');
            btnEditar.textContent = 'Editar';
            btnEditar.onclick = () => editarGasto(gasto);
            nuevoGasto.appendChild(btnEditar);

            gastoListado.appendChild(nuevoGasto);
        });
    }

    limpiarHtml() {
        while (gastoListado.firstChild) {
            gastoListado.removeChild(gastoListado.firstChild);
        }
    }

    actualizarRestante(restante) {
        document.querySelector('#restante').textContent = restante;
        actualizarBarraProgreso(restante, presupuesto.presupuesto);
    }

    comprobarPresupuesto(presupuestObj) {
        const { presupuesto, restante } = presupuestObj;
        const restanteDiv = document.querySelector('.restante');

        if ((presupuesto / 4) > restante) {
            restanteDiv.classList.remove('alert-success', 'alert-warning');
            restanteDiv.classList.add('alert-danger');
        } else if ((presupuesto / 2) > restante) {
            restanteDiv.classList.remove('alert-success');
            restanteDiv.classList.add('alert-warning');
        } else {
            restanteDiv.classList.remove('alert-danger', 'alert-warning');
            restanteDiv.classList.add('alert-success');
        }

        if (restante <= 0) {
            this.imprimirAlerta('El Presupuesto se ha agotado', 'error');
            formulario.querySelector('button[type="submit"]').disabled = true;
        }
    }
}

const ui = new UI();
function preguntarPresupuesto() {
    const inputPresupuesto = document.getElementById('input-presupuesto');
    const btnSetPresupuesto = document.getElementById('btn-set-presupuesto');
    const btnEditPresupuesto = document.getElementById('btn-edit-presupuesto');
    btnSetPresupuesto.addEventListener('click', () => {
        const presupuestoUsuario = Number(inputPresupuesto.value);
        if (isNaN(presupuestoUsuario) || presupuestoUsuario <= 0) {
            ui.imprimirAlerta('Por favor, ingresa un presupuesto válido', 'error');
            return;
        }
        presupuesto = new Presupuesto(presupuestoUsuario);
        ui.insertarPresupuesto(presupuesto);
        actualizarBarraProgreso(0, presupuesto.presupuesto);
        
        cargarGastosDesdeBackend();
        btnEditPresupuesto.style.display = 'inline';
        btnSetPresupuesto.style.display = 'none';
    });

    btnEditPresupuesto.addEventListener('click', () => {
        inputPresupuesto.disabled = false;
        inputPresupuesto.focus();
        btnSetPresupuesto.style.display = 'inline';
        btnEditPresupuesto.style.display = 'none';
    });
}
async function cargarGastosDesdeBackend() {
    try {
        const res = await fetch(API_URL);
        const gastos = await res.json();

        gastos.forEach(gasto => {
            gasto.cantidad = Number(gasto.cantidad); 
        });
        
        presupuesto.gastos = gastos;
        presupuesto.calcularRestante();
        ui.agregarGastoListado(gastos);
        ui.actualizarRestante(presupuesto.restante);
        ui.comprobarPresupuesto(presupuesto);
    } catch (error) {
        console.error('Error cargando gastos:', error);
        ui.imprimirAlerta('Error al cargar gastos', 'error');
    }
}
async function agregarGasto(e) {
    e.preventDefault();

    const nombre = document.querySelector('#gasto').value;
    const cantidad = Number(document.querySelector('#cantidad').value);
    const categoria = document.querySelector('#categoria').value;

    if (nombre === '' || cantidad === '' || categoria === '') {
        ui.imprimirAlerta('Todos los campos son obligatorios', 'error');
        return;
    } else if (cantidad <= 0 || isNaN(cantidad)) {
        ui.imprimirAlerta('Cantidad no válida', 'error');
        return;
    }

    const gasto = { nombre, cantidad, categoria };

    try {
        if (editMode) {
            gasto.id = editGastoId;
            await fetch(`${API_URL}/${editGastoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(gasto)
            });
            ui.imprimirAlerta('Gasto editado con éxito', 'success');
        } else {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(gasto)
            });
            ui.imprimirAlerta('Gasto agregado con éxito', 'success');
        }


        formulario.reset();
        editMode = false;
        editGastoId = null;
        formulario.querySelector('button[type="submit"]').textContent = 'Agregar';

        await cargarGastosDesdeBackend();
        formulario.reset();
        formOverlay.classList.remove('active');
        btnAddExpense.style.display = 'flex';
    } catch (error) {
        console.error('Error guardando gasto:', error);
        ui.imprimirAlerta('Error al guardar gasto', 'error');
    }
}

function editarGasto(gasto) {
    const { nombre, cantidad, categoria, id } = gasto;

    document.querySelector('#gasto').value = nombre;
    document.querySelector('#cantidad').value = cantidad;
    document.querySelector('#categoria').value = categoria;

    editMode = true;
    editGastoId = id;

    formulario.querySelector('button[type="submit"]').textContent = 'Guardar Cambios';

    formOverlay.classList.add('active');
    btnAddExpense.style.display = 'none';

}

async function eliminarGasto(id) {
    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        await cargarGastosDesdeBackend();
        ui.imprimirAlerta('Gasto eliminado', 'success');
    } catch (error) {
        console.error('Error al eliminar gasto:', error);
        ui.imprimirAlerta('Error al eliminar gasto', 'error');
    }
}

async function filtrarGastos() {
    const categoriaFiltrada = document.getElementById('filter-category').value.toLowerCase();
    try {
        const res = await fetch(API_URL);
        const gastos = await res.json();
        const filtrados = categoriaFiltrada
            ? gastos.filter(gasto => gasto.categoria.toLowerCase() === categoriaFiltrada)
            : gastos;

        if (filtrados.length === 0) {
            ui.imprimirAlerta('No se encontraron gastos con esa categoría', 'error');
            ui.agregarGastoListado([]); 
            return;
        }

        ui.agregarGastoListado(filtrados);
    } catch (error) {
        console.error('Error al filtrar:', error);
        ui.imprimirAlerta('Error al filtrar gastos', 'error');
    }
}


function actualizarBarraProgreso(restante, presupuesto) {
    const circle = document.querySelector(".CircularProgressbar-path");
    const texto = document.querySelector(".CircularProgressbar-text");
    const porcentajeRestante = (restante / presupuesto) * 100;
    const porcentajeFormateado = Math.max(0, Math.min(100, porcentajeRestante.toFixed(2)));
    const maxOffset = 289.027;

    circle.style.strokeDashoffset = maxOffset - (porcentajeFormateado / 100 * maxOffset);
    circle.style.stroke = 'rgb(59, 130, 246)';
    texto.style.fill = 'rgb(59, 130, 246)';
    texto.textContent = porcentajeFormateado + '%';
}

const btnAddExpense = document.getElementById('btn-add-expense');
const formOverlay = document.getElementById('form-overlay');
const btnCancelForm = document.getElementById('btn-cancel-form');
const gastoInput = document.getElementById('gasto');
const form = document.getElementById('agregar-gasto');

btnAddExpense.addEventListener('click', () => {
    formOverlay.classList.add('active');
    gastoInput.focus();
    btnAddExpense.style.display = 'none';
});

btnCancelForm.addEventListener('click', () => {
    formOverlay.classList.remove('active');
    btnAddExpense.style.display = 'flex';
    form.reset();

    if (editMode) {
        editMode = false;
        editGastoId = null;
        formulario.querySelector('button[type="submit"]').textContent = 'Agregar';
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && formOverlay.classList.contains('active')) {
        btnCancelForm.click();
    }
});

document.getElementById('btn-logout').addEventListener('click', () => {
  localStorage.removeItem('usuarioLogueado'); // elimina sesión local
  window.location.href = 'login.html';       // redirige a login
});


// const mensajeDiv = document.getElementById('mensaje-bienvenida');

// if (response.msg) {
//   alert(response.msg);
// } else {
//   localStorage.setItem('usuarioLogueado', JSON.stringify(response));
//   mensajeDiv.textContent = `¡Bienvenido, ${response.nombre}! Has iniciado sesión con éxito.`;

//   setTimeout(() => {
//     window.location.href = 'index.html';
//   }, 2000);  // Espera 2 segundos para que vean el mensaje
// }


// const mensajeDiv = document.getElementById('mensaje-registro');

// if (nuevo) {
//   localStorage.setItem('usuarioLogueado', JSON.stringify(nuevo));
//   mensajeDiv.textContent = `¡Bienvenido, ${nuevo.nombre}! Te has registrado con éxito.`;

//   setTimeout(() => {
//     window.location.href = 'index.html';
//   }, 2000);
// } else {
//   alert('Ese correo ya está en uso');
// }
