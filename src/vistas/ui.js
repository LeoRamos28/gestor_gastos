export class UI {
    insertarPresupuesto({ presupuesto, restante }) {
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

    agregarGastoListado(gastos, eliminarGasto, editarGasto) {
        const gastoListado = document.querySelector('#gastos ul');
        this.limpiarHtml(gastoListado);
        gastos.forEach(gasto => {
            const { cantidad, nombre, categoria, id } = gasto;
            const nuevoGasto = document.createElement('li');
            nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center';
            nuevoGasto.dataset.id = id;
            nuevoGasto.innerHTML = `${nombre} <span class='badge badge-primary badge-pill'> $${cantidad} </span>  ${categoria}`;

            const btnBorrar = document.createElement('button');
            btnBorrar.classList.add('btn', 'btn-danger');
            btnBorrar.textContent = 'Borrar X';
            btnBorrar.onclick = () => eliminarGasto(id);
            nuevoGasto.appendChild(btnBorrar);

            const btnEditar = document.createElement('button');
            btnEditar.classList.add('btn', 'btn-info', 'ml-2');
            btnEditar.textContent = 'Editar';
            btnEditar.onclick = () => editarGasto(gasto);
            nuevoGasto.appendChild(btnEditar);

            gastoListado.appendChild(nuevoGasto);
        });
    }

    limpiarHtml(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    actualizarRestante(restante, presupuesto) {
        document.querySelector('#restante').textContent = restante;
        const porcentajeRestante = Math.max(0, Math.min(100, (restante / presupuesto) * 100)).toFixed(2);
        const circle = document.querySelector(".CircularProgressbar-path");
        const texto = document.querySelector(".CircularProgressbar-text");
        const maxOffset = 289.027;
        circle.style.strokeDashoffset = maxOffset - (porcentajeRestante / 100 * maxOffset);
        texto.textContent = porcentajeRestante + '%';
    }

    comprobarPresupuesto({ presupuesto, restante }) {
        const restanteDiv = document.querySelector('.restante');
        restanteDiv.className = 'restante alert'; 

        if (restante <= presupuesto / 4) {
            restanteDiv.classList.add('alert-danger');
        } else if (restante <= presupuesto / 2) {
            restanteDiv.classList.add('alert-warning');
        } else {
            restanteDiv.classList.add('alert-success');
        }

        if (restante <= 0) {
            this.imprimirAlerta('El presupuesto se ha agotado', 'error');
            document.querySelector('#agregar-gasto button[type="submit"]').disabled = true;
        }
    }
}
