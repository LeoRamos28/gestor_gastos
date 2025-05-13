const formulario = document.querySelector('#agregar-gasto');
const gastoListado = document.querySelector('#gastos ul');
let editMode = false; 
let editGastoId; 

eventListeners();

function eventListeners(){
    document.addEventListener('DOMContentLoaded', preguntarPresupuesto);
    formulario.addEventListener('submit', agregarGasto);
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

        document.querySelector('.primario').insertBefore(divMensaje, formulario);

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
        ui.imprimirAlerta('Gasto editado con éxito');
        editMode = false;
        editGastoId = null;
        formulario.querySelector('button[type="submit"]').textContent = 'Agregar Gasto';
    } else {
            presupuesto.nuevoGasto(gasto);
            ui.imprimirAlerta('Gasto agregado');
        }

        const { gastos, restante } = presupuesto;
        ui.agregarGastoListado(gastos);
        ui.actualizarRestante(restante);
        ui.comprobarPresupuesto(presupuesto);
        formulario.reset();
    }
//     if(editMode){
//         // Editar gasto existente
//         const gastoEditado = {
//             nombre,
//             cantidad,
//             categoria,
//             id: editGastoId
//         };
//         presupuesto.editarGasto(editGastoId, gastoEditado);
//         ui.imprimirAlerta('Gasto editado con éxito');
//         editMode = false;
//         editGastoId = null;
//         formulario.querySelector('button[type="submit"]').textContent = 'Agregar Gasto'; // Cambiar texto botón
//     } else {
//         // Agregar nuevo gasto
//         const gasto = {nombre, cantidad, categoria, id: Date.now()};
//         presupuesto.nuevoGasto(gasto);
//         ui.imprimirAlerta('Gasto agregado');
//     }

//     const {gastos, restante} = presupuesto;
//     ui.agregarGastoListado(gastos);
//     ui.actualizarRestante(restante);
//     ui.comprobarPresupuesto(presupuesto);
//     formulario.reset();
// }

function eliminarGasto(id){
    presupuesto.eliminarGasto(id);
    const {gastos, restante} = presupuesto;
    ui.agregarGastoListado(gastos);
    ui.actualizarRestante(restante);
    ui.comprobarPresupuesto(presupuesto);
}

function editarGasto(gasto) {
    const { nombre, cantidad, categoria, id } = gasto;
    document.querySelector('#gasto').value = nombre;
    document.querySelector('#cantidad').value = cantidad;
    document.querySelector('#categoria').value = categoria; 

    editMode = true;
    editGastoId = id;
    formulario.querySelector('button[type="submit"]').textContent = 'Guardar Cambios';
}
