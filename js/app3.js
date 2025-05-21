const formulario = document.querySelector('#agregar-gasto');
const gastoListado = document.querySelector('#gastos ul');
const btnFilter = document.getElementById('btn-filter');

let editMode = false; 
let editGastoId; 

eventListeners();

function eventListeners(){
    document.addEventListener('DOMContentLoaded', preguntarPresupuesto);
    formulario.addEventListener('submit', agregarGasto);
    btnFilter.addEventListener('click', filtrarGastos);

}

class Presupuesto {
    constructor(presupuesto){
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto);
        this.gastos = [];
    }

    nuevoGasto(gasto){
        this.gastos = [...this.gastos, gasto];
        this.calcularRestante();
    }

    calcularRestante(){
        const gastado = this.gastos.reduce( (total, gasto) => total + gasto.cantidad, 0);
        this.restante = this.presupuesto - gastado;
    }

    eliminarGasto(id){
        this.gastos = this.gastos.filter(gasto => gasto.id !== id);
        this.calcularRestante();
    }

    editarGasto(id, nuevoGasto){
        this.gastos = this.gastos.map(gasto => gasto.id === id ? nuevoGasto : gasto);
        this.calcularRestante();
    }
}

let presupuesto;

class UI {
    insertarPresupuesto(cantidad){
        const {presupuesto, restante } = cantidad;
        document.querySelector('#total').textContent = presupuesto;
        document.querySelector('#restante').textContent = restante;
    }

    imprimirAlerta(mensaje,tipo){
        const divMensaje = document.createElement('div');
        divMensaje.classList.add('text-center', 'alert');
        if(tipo === 'error'){
            divMensaje.classList.add('alert-danger');
        }else{
            divMensaje.classList.add('alert-success');
        }
        divMensaje.textContent = mensaje;

        const mensajeContenedor = document.querySelector('#mensaje-alerta');
        mensajeContenedor.innerHTML = ''; // Limpiar mensajes anteriores
        document.querySelector('.primario').prepend(divMensaje);

        setTimeout(() => {
            divMensaje.remove();
        }, 3000);
    }

    
    agregarGastoListado(gastos){
        this.limpiarHtml();
        gastos.forEach( gasto => {
            const {cantidad,nombre, categoria, id} = gasto;

            const nuevoGasto =  document.createElement('li');
            nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center';
            nuevoGasto.dataset.id = id;
            nuevoGasto.innerHTML = `${nombre} <span class='badge badge-primary badge-pill'> $${cantidad} </span>  ${categoria}`;

            const btnBorrar = document.createElement('button');
            btnBorrar.classList.add('btn','btn-danger','borrar-gasto');
            btnBorrar.textContent = 'Borrar X';
            btnBorrar.onclick = () => {
                eliminarGasto(id);
            }
            nuevoGasto.appendChild(btnBorrar);

            const btnEditar = document.createElement('button');
            btnEditar.classList.add('btn', 'btn-info', 'editar-gasto', 'ml-2');
            btnEditar.textContent = 'Editar';
            btnEditar.onclick = () => {
                editarGasto(gasto);
            }
            nuevoGasto.appendChild(btnEditar);

            gastoListado.appendChild(nuevoGasto);
        }); 
    }

    limpiarHtml(){
        while(gastoListado.firstChild){
            gastoListado.removeChild(gastoListado.firstChild);
        }
    }

    actualizarRestante(restante){
        document.querySelector('#restante').textContent = restante;
        actualizarBarraProgreso(restante, presupuesto.presupuesto);
    }

    comprobarPresupuesto(presupuestObj){   
        const {presupuesto, restante} = presupuestObj;
        const restanteDiv = document.querySelector('.restante');

        if((presupuesto / 4) > restante){   
            restanteDiv.classList.remove('alert-success','alert-warning');
            restanteDiv.classList.add('alert-danger');
        } else if((presupuesto / 2) > restante){
            restanteDiv.classList.remove('alert-success');
            restanteDiv.classList.add('alert-warning');
        }else{
            restanteDiv.classList.remove('alert-danger','alert-warning');
            restanteDiv.classList.add('alert-success');
        }

        if(restante <= 0){
            this.imprimirAlerta('El Presupuesto se ha agotado', 'error');
            formulario.querySelector('button[type="submit"]').disabled = true;
        }        
    }
}
const ui = new UI();

function preguntarPresupuesto(){
    const presupuestoUsuario = prompt('¿Cuál es tu presupuesto?');

    if(presupuestoUsuario === '' || presupuestoUsuario === null || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0){
        window.location.reload();
    }
    presupuesto = new Presupuesto(presupuestoUsuario);
    ui.insertarPresupuesto(presupuesto);
    // Initialize progress bar on load
    actualizarBarraProgreso(0, presupuesto.presupuesto);
}

function agregarGasto(e){
    e.preventDefault();

    const nombre = document.querySelector('#gasto').value;
    const cantidad = Number(document.querySelector('#cantidad').value);
    const categoria = document.querySelector('#categoria').value; 

    if(nombre === '' || cantidad === '' || categoria === ''){
        ui.imprimirAlerta('Ambos campos son obligatorios', 'error');
        return;
    } else if(cantidad <= 0 || isNaN(cantidad)){
        ui.imprimirAlerta('Cantidad no válida', 'error');
        return;
    }
    const gasto = editMode // 
        ? { nombre, cantidad, categoria, id: editGastoId }
        : { nombre, cantidad, categoria, id: Date.now() };
    if(editMode){
        presupuesto.editarGasto(editGastoId, gasto);
        imprimirAlerta('Gasto editado con éxito', 'success');
        
        // Resetear modo edición
        editMode = false;
        editGastoId = null;
        formulario.querySelector('button[type="submit"]').textContent = 'Agregar';

    } else {
        presupuesto.nuevoGasto(gasto);
        imprimirAlerta('Gasto agregado con éxito', 'success');
    }

    // Cerrar el formulario después de guardar
    formOverlay.classList.remove('active'); 
    btnAddExpense.style.display = 'flex';


    const { gastos, restante } = presupuesto;
    ui.agregarGastoListado(gastos);
    ui.actualizarRestante(restante);
    ui.comprobarPresupuesto(presupuesto);
    formulario.reset();

    formOverlay.classList.remove('active'); 
    btnAddExpense.style.display = 'flex';
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
    
    ui.imprimirAlerta('Editando gasto...', 'info');
}

function eliminarGasto(id){
    presupuesto.eliminarGasto(id);
    const {gastos, restante} = presupuesto;
    ui.agregarGastoListado(gastos);
    ui.actualizarRestante(restante);
    ui.comprobarPresupuesto(presupuesto);

    imprimirAlerta('Gasto eliminado ', 'success');
}


function filtrarGastos() {
    const categoriaFiltrada = document.getElementById('filter-category').value.toLowerCase();
    
    const gastosFiltrados = categoriaFiltrada 
        ? presupuesto.gastos.filter(gasto => gasto.categoria.toLowerCase() === categoriaFiltrada) 
        : presupuesto.gastos;

    if (!Array.isArray(gastosFiltrados)) {
        console.error('gastosFiltrados no es un array:', gastosFiltrados);
        return;
    }

    ui.agregarGastoListado(gastosFiltrados);
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

    // Actualiza el texto con el porcentaje
    texto.textContent = porcentajeFormateado + '%';
}



function imprimirAlerta(mensaje, tipo){
    Swal.fire({
        text: mensaje,
        icon: tipo === 'error' ? 'error' : 'success',
        confirmButtonText: 'OK',
        timer: 3000,
        timerProgressBar: true
    });
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

  if (window.editMode) {
    window.editMode = false;
    window.editGastoId = null;
    document.querySelector('#agregar-gasto button[type="submit"]').textContent = 'Agregar';
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && formOverlay.classList.contains('active')) {
    btnCancelForm.click();
  }
});
