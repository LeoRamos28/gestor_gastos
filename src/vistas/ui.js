export class UI {
    insertarPresupuesto({ presupuesto, restante }) {
        document.querySelector('#total').textContent = presupuesto ?? 0; 
        document.querySelector('#restante').textContent = restante ?? 0;
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

    actualizarUI(presupuesto) {
        this.insertarPresupuesto(presupuesto);
        this.actualizarRestante(presupuesto.restante, presupuesto.presupuesto);
        this.comprobarPresupuesto(presupuesto);
    }

    agregarGastoListado(gastos, eliminarGasto, editarGasto) {
    const gastoListado = document.querySelector('#gastos ul');
    this.limpiarHtml(gastoListado); // Limpia la lista antes de agregar nuevos elementos

    gastos.forEach(gasto => {
        console.log("Gasto recibido en UI:", gasto);

        const { monto, nombre, categoria, id_gasto } = gasto;
        const nuevoGasto = document.createElement('li');
        nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center';
        nuevoGasto.dataset.id = id_gasto;

        const categoriaTexto = categoria?.nombre_categoria || categoria || 'Sin categoría';

        nuevoGasto.textContent = nombre + " ";

        const badge = document.createElement('span');
        badge.className = 'nuevo-gasto';
        badge.textContent = `$${monto}`;
        nuevoGasto.appendChild(badge);
        nuevoGasto.append(` ${categoriaTexto}`);
        

        // Contenedor de botones para evitar duplicados
        const btnContainer = document.createElement('div');
        btnContainer.classList.add('btn-container');
        
        // Botón borrar
        const btnBorrar = document.createElement('button');
        btnBorrar.classList.add('btn', 'btn-danger');
        btnBorrar.textContent = 'Borrar';
        btnBorrar.onclick = () => eliminarGasto(id_gasto);
        btnContainer.appendChild(btnBorrar);

        // Botón editar
        const btnEditar = document.createElement('button');
        btnEditar.classList.add('btn', 'btn-info', 'ml-2');
        btnEditar.textContent = 'Editar';
        btnEditar.onclick = () => editarGasto(gasto);
        btnContainer.appendChild(btnEditar);

        nuevoGasto.appendChild(btnContainer);
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
        if (!presupuesto || presupuesto === 0) return; // evitar division por cero

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
        } else {
            document.querySelector('#agregar-gasto button[type="submit"]').disabled = false;
        }
    }
}
