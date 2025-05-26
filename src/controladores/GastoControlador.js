import { Presupuesto } from '../modelos/Presupuesto.js';
import { UI } from '../vistas/ui.js';

const API_URL = 'http://localhost:3000/api/gastos';
const token = localStorage.getItem('token');
const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado'));
const ui = new UI();

let presupuesto;
let editMode = false;
let editGastoId = null;

export function iniciarApp() {
    document.addEventListener('DOMContentLoaded', () => {
        configurarPresupuesto();
        document.querySelector('#agregar-gasto').addEventListener('submit', agregarGasto);
        document.getElementById('btn-filter').addEventListener('click', filtrarGastos);
        document.getElementById('btn-logout').addEventListener('click', logout);

        document.getElementById('btn-add-expense').addEventListener('click', () => {
            document.getElementById('form-overlay').classList.add('active');
        });

        document.getElementById('btn-cancel-form').addEventListener('click', () => {
            document.getElementById('form-overlay').classList.remove('active');
        });
    });
}

function configurarPresupuesto() {
    const input = document.getElementById('input-presupuesto');
    const btnSet = document.getElementById('btn-set-presupuesto');
    const btnEdit = document.getElementById('btn-edit-presupuesto');

    btnSet.addEventListener('click', () => {
        const cantidad = Number(input.value);
        if (isNaN(cantidad) || cantidad <= 0) {
            ui.imprimirAlerta('Por favor, ingresa un presupuesto válido', 'error');
            return;
        }
        presupuesto = new Presupuesto(cantidad);
        ui.insertarPresupuesto(presupuesto);
        cargarGastosDesdeBackend();
        btnSet.style.display = 'none';
        btnEdit.style.display = 'inline';
    });

    btnEdit.addEventListener('click', () => {
        input.disabled = false;
        input.focus();
        btnSet.style.display = 'inline';
        btnEdit.style.display = 'none';
    });
}


async function cargarGastosDesdeBackend() {
    try {
        const res = await fetch(API_URL, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            throw new Error('Error al cargar gastos');
        }

        const gastos = await res.json();
        gastos.forEach(g => g.cantidad = Number(g.cantidad));
        presupuesto.gastos = gastos;
        presupuesto.calcularRestante();
        ui.agregarGastoListado(gastos, eliminarGasto, editarGasto);
        ui.actualizarRestante(presupuesto.restante, presupuesto.presupuesto);
        ui.comprobarPresupuesto(presupuesto);
    } catch (error) {
        ui.imprimirAlerta('Error al cargar gastos', 'error');
        console.error('Error al cargar gastos:', error);
    }
}

// Función para agregar 
async function agregarGasto(e) {
    e.preventDefault();
    const nombre = document.querySelector('#gasto').value;
    const cantidad = Number(document.querySelector('#cantidad').value);
    const categoria = document.querySelector('#categoria').value;

    if (!nombre || !cantidad || !categoria || isNaN(cantidad) || cantidad <= 0) {
        ui.imprimirAlerta('Todos los campos son obligatorios', 'error');
        return;
    }

    const gasto = { nombre, cantidad, categoria, id_usuario: usuarioLogueado.id_usuario };
    const url = editMode ? `${API_URL}/${editGastoId}` : API_URL;
    const method = editMode ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(gasto)
        });

        if (!res.ok) {
            const errorDetails = await res.json();
            // console.error('Error al guardar gasto:', errorDetails);
            ui.imprimirAlerta(errorDetails.msg || 'Error al guardar el gasto', 'error');
            return;
        }

        ui.imprimirAlerta(editMode ? 'Gasto editado' : 'Gasto agregado', 'success');
        
        reset();
        cargarGastosDesdeBackend();
    } catch (error) {
        // console.error('Error de red o del servidor:', error);
        ui.imprimirAlerta('Error al guardar gasto', 'error');
    }
}

// Función para resetear el formulario y los estados
function reset() {
    editMode = false;
    editGastoId = null;
    document.querySelector('#agregar-gasto').reset();
    document.getElementById('form-overlay').classList.remove('active');
}

// Función para editar 
function editarGasto(gasto) {
    document.querySelector('#gasto').value = gasto.nombre;
    document.querySelector('#cantidad').value = gasto.cantidad;
    document.querySelector('#categoria').value = gasto.categoria;

    editMode = true;
    editGastoId = gasto.id;
    document.querySelector('#agregar-gasto button[type="submit"]').textContent = 'Guardar Cambios';
    document.getElementById('form-overlay').classList.add('active');
}

// Función para eliminar un gasto
async function eliminarGasto(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            const errorDetails = await res.json();
            ui.imprimirAlerta(errorDetails.msg || 'Error al eliminar gasto', 'error');
            return;
        }

        ui.imprimirAlerta('Gasto eliminado', 'success');
        cargarGastosDesdeBackend(); // Recargar la lista despues de eliminar el gasto
    } catch (error) {
        ui.imprimirAlerta('Error al eliminar gasto', 'error');
        console.error(error);
    }
}
async function filtrarGastos() {
    const categoria = document.getElementById('filter-category').value.toLowerCase();
    try {
        const res = await fetch(API_URL, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const gastos = await res.json();
        const filtrados = categoria ? gastos.filter(g => g.categoria.toLowerCase() === categoria) : gastos;
        ui.agregarGastoListado(filtrados, eliminarGasto, editarGasto);

        if (!filtrados.length) {
            ui.imprimirAlerta('No se encontraron gastos con esa categoría', 'error');
        }
    } catch {
        ui.imprimirAlerta('Error al filtrar gastos', 'error');
    }
}

function logout() {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡Cerrar sesión!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuarioLogueado');
            window.location.href = '/';
        }
    });
}
