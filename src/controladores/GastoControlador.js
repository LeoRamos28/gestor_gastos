import { Presupuesto } from '../modelos/Presupuesto.js';
import { UI } from '../vistas/ui.js';

// const API_URL = 'http://localhost:3000/api/gastos';
const API_URL = 'http://localhost:3000/api';
const token = localStorage.getItem('token');
const usuarioLogueado = JSON.parse(sessionStorage.getItem('usuarioLogueado'));
const ui = new UI();

let presupuesto;
let editMode = false;
let editGastoId = null;
let filtroActivo = ''; //

export function iniciarApp() {
    document.addEventListener('DOMContentLoaded', async () => {
    configurarPresupuesto();
    await cargarPresupuestoDesdeBackend(); // Cargar presupuesto al iniciar
    
    const categorias = ["Alimentos", "Educacion", "Entretenimiento", "Hogar", "Indumentaria", "Salud", "Vivienda", "Otros"];
    const selectCategoria = document.getElementById("categoria");
    const selectFiltro = document.getElementById("filter-category");
    
    selectCategoria.innerHTML = '<option value="" disabled selected>Selecciona una categoría</option>'; // Asegura que la primera opción siempre está presente
    selectFiltro.innerHTML = '<option value="">Todas las categorías</option>';  
     
    categorias.forEach(categoria => {
        const optionCategoria = document.createElement("option");
        optionCategoria.value = categoria;
        optionCategoria.textContent = categoria;
        selectCategoria.appendChild(optionCategoria);

        const optionFiltro = document.createElement("option");
        optionFiltro.value = categoria;
        optionFiltro.textContent = categoria;
        selectFiltro.appendChild(optionFiltro);
    });

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

async function cargarPresupuestoDesdeBackend() {
    try {
        const res = await fetch(`http://localhost:3000/api/presupuestos/${usuarioLogueado.id_usuario}`, 
        // const res = await fetch(`${API_URL}/presupuestos/${usuarioLogueado.id_usuario}`,
             {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('No se encontró un presupuesto guardado');

        const data = await res.json();
        presupuesto = new Presupuesto(data.presupuesto);
        ui.insertarPresupuesto(presupuesto);
        await cargarGastosDesdeBackend(); // Cargar automáticamente los gastos

        document.getElementById('btn-set-presupuesto').style.display = 'none';
        document.getElementById('btn-edit-presupuesto').style.display = 'inline';
        document.getElementById('input-presupuesto').disabled = true;

    } catch (error) {
        console.warn('Error al cargar el presupuesto:', error);
        ui.imprimirAlerta('No se encontró un presupuesto guardado, ingresa uno', 'error');
    }
}

function configurarPresupuesto() {
    const input = document.getElementById('input-presupuesto');
    const btnSet = document.getElementById('btn-set-presupuesto');
    const btnEdit = document.getElementById('btn-edit-presupuesto');

    btnSet.addEventListener('click', async () => {
        const cantidad = Number(input.value);
        if (isNaN(cantidad) || cantidad <= 0) {
            ui.imprimirAlerta('Por favor, ingresa un presupuesto válido', 'error');
            return;
        }

        presupuesto = new Presupuesto(cantidad);
        ui.insertarPresupuesto(presupuesto);
        await guardarPresupuestoEnBackend(cantidad);
        await cargarGastosDesdeBackend();

    Swal.fire({
            icon: 'success',
            title: 'Presupuesto actualizado',
            // text: `El presupuesto se ha actualizado}`,
            confirmButtonText: 'Aceptar'
        });

        btnSet.style.display = 'none';
        btnEdit.style.display = 'inline';
        input.disabled = true;
    });


    btnEdit.addEventListener('click', () => {
        input.disabled = false;
        input.focus();
        btnSet.style.display = 'inline';
        btnEdit.style.display = 'none';
    });
}

async function guardarPresupuestoEnBackend(cantidad) {
    try {
        await fetch(`${API_URL}/presupuestos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ id_usuario: usuarioLogueado.id_usuario, cantidad })
        });

    } catch (error) {
        console.error('Error al guardar el presupuesto:', error);
        ui.imprimirAlerta('Error al guardar presupuesto', 'error');
    }
}

export async function cargarGastosDesdeBackend() {
    if (!presupuesto) {
        console.error('Error: presupuesto no está definido. No se puede cargar gastos.');
        ui.imprimirAlerta('Configura un presupuesto antes de cargar gastos.', 'error');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/gastos`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });

        if (!res.ok) throw new Error(await res.text());

        const gastos = await res.json();
        presupuesto.gastos = gastos.map(g => ({ ...g, monto: Number(g.monto) }));
        presupuesto.calcularRestante();
        ui.actualizarUI(presupuesto);
        ui.agregarGastoListado(presupuesto.gastos, eliminarGasto, editarGasto);

    } catch (error) {
        console.error('Error al cargar gastos:', error);
        ui.imprimirAlerta('Error al cargar gastos', 'error');
    }
}

// Función para agregar o editar gasto
async function agregarGasto(e) {
    e.preventDefault();
    const nombre = document.querySelector('#gasto').value;
    const monto = Number(document.querySelector('#monto').value);
    const categoria = document.querySelector('#categoria').value;

    if (!nombre || !monto || !categoria || isNaN(monto) || monto <= 0) {
        ui.imprimirAlerta('Todos los campos son obligatorios', 'error');
        return;
    }

    const gasto = { nombre, monto, categoria, id_usuario: usuarioLogueado.id_usuario };
    // const url = editMode ? `${API_URL}/${editGastoId}` : API_URL;
    const url = editMode ? `${API_URL}/gastos/${editGastoId}` : `${API_URL}/gastos`;
    console.log("Editando gasto con ID:", editGastoId);


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
            ui.imprimirAlerta(errorDetails.msg || 'Error al guardar el gasto', 'error');
            return;
        }

        ui.imprimirAlerta(editMode ? 'Gasto editado' : 'Gasto agregado', 'success');
        reset();
        await recargarGastos();

    } catch (error) {
        ui.imprimirAlerta('Error al guardar gasto', 'error');
    }
}

// resetear el formulario y los estados
function reset() {
    editMode = false;
    editGastoId = null;
    document.querySelector('#agregar-gasto').reset();
    document.getElementById('form-overlay').classList.remove('active');
}

// editar gasto: precarga el formulario y habilita modo edición
function editarGasto(gasto) {
    document.querySelector('#gasto').value = gasto.nombre;
    document.querySelector('#monto').value = gasto.monto;

    const categoriaInput = document.querySelector('#categoria');
    if (typeof gasto.categoria === 'object' && gasto.categoria !== null) {
        categoriaInput.value = gasto.categoria.nombre_categoria;
    } else {
        categoriaInput.value = gasto.categoria;
    }

    editMode = true;
    editGastoId = gasto.id_gasto;
    document.querySelector('#agregar-gasto button[type="submit"]').textContent = 'Guardar Cambios';
    document.getElementById('form-overlay').classList.add('active');
}

// eliminar gasto
async function eliminarGasto(id_gasto) {
    try {
        const res = await fetch(`${API_URL}/gastos/${id_gasto}`, { // <-- Cambia la ruta
        // const res = await fetch(`${API_URL}/${id_gasto}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

           if (!res.ok) {
            const errorDetails = await res.json();
            ui.imprimirAlerta(errorDetails.msg || 'Error al eliminar gasto', 'error');
            return;
        }

        ui.imprimirAlerta('Gasto eliminado', 'success');
        await recargarGastos();

    } catch (error) {
        ui.imprimirAlerta('Error al eliminar gasto', 'error');
        console.error(error);
    }
}

// filtrar gastos y mostrar en UI
async function filtrarGastos() {
    filtroActivo = document.getElementById('filter-category').value.toLowerCase();

    try {
        const res = await fetch(`${API_URL}/gastos?categoria=${filtroActivo}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(await res.text());

        const gastos = await res.json();

        const filtrados = filtroActivo
            ? gastos.filter(g =>
                g.categoria?.nombre_categoria?.toLowerCase() === filtroActivo
            )
            : gastos;

        ui.agregarGastoListado(filtrados, eliminarGasto, editarGasto);

        if (!filtrados.length) {
            ui.imprimirAlerta('No se encontraron gastos con esa categoría', 'error');
        }
    } catch (error) {
        console.error('Error al filtrar gastos:', error);
        ui.imprimirAlerta('Error al filtrar gastos', 'error');
    }
}

// recargar gastos segun filtro activo o sin filtro
async function recargarGastos() {
    if (filtroActivo) {
        await filtrarGastos();
    } else {
        await cargarGastosDesdeBackend();
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



// function resetPresupuesto() {
//     // Reiniciar el objeto presupuesto
//     presupuesto = null;

//     // Limpiar UI: presupuesto y restante a 0
//     ui.insertarPresupuesto({ presupuesto: 0, restante: 0 });

//     // Limpiar lista de gastos en UI
//     const gastoListado = document.querySelector('#gastos ul');
//     ui.limpiarHtml(gastoListado);

//     // Habilitar input presupuesto para nuevo ingreso
//     const input = document.getElementById('input-presupuesto');
//     input.disabled = false;
//     input.value = '';

//     // Mostrar botón para setear presupuesto, ocultar editar
//     document.getElementById('btn-set-presupuesto').style.display = 'inline';
//     document.getElementById('btn-edit-presupuesto').style.display = 'none';

//     // Otras limpiezas: deshabilitar botón submit gastos si aplica
//     document.querySelector('#agregar-gasto button[type="submit"]').disabled = true;

//     // Opcional: limpiar gastos guardados o variables de estado
//     // Por ejemplo, si tienes editMode, editGastoId, etc.
//     editMode = false;
//     editGastoId = null;

//     // Mostrar mensaje o alerta (opcional)
//     ui.imprimirAlerta('Presupuesto reiniciado. Ingresa un nuevo presupuesto.', 'success');
// }
