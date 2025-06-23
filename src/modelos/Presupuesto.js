export class Presupuesto {
    constructor(presupuesto, usuarioId) {
    this.presupuesto = Number(presupuesto); // Valor total del presupuesto
    this.restante = this.presupuesto;       // Al inicio, el restante es igual al presupuesto
    this.usuarioId = usuarioId;             // ID del usuario al que pertenece
    this.gastos = [];                       // Lista de gastos asociados al usuario
}


    async cargarGastos() {
        try {
            this.gastos = await prisma.gasto.findMany({
                where: { id_usuario: this.usuarioId }
            });

            this.gastos.forEach(g => g.monto = Number(g.monto));
            this.calcularRestante();
        } catch (error) {
            console.error('Error al cargar gastos:', error);
        }
    }

    calcularRestante() {
        const gastado = this.gastos.reduce((total, gasto) => total + gasto.monto, 0);
        this.restante = this.presupuesto - gastado;
    }
}


/* 
findMany : obtener multiples registros
Consulta la base de datos con Prisma para obtener todos los gastos del usuario.

Convierte el monto de cada gasto a número (por si viene como string).

Llama a calcularRestante() para actualizar el valor restante del presupuesto.
*/


/*
Suma todos los montos de los gastos registrados.

Resta ese total del presupuesto original.

Guarda el resultado como restante.


Elemento	Función
prisma.gasto.findMany()	Consulta en la tabla gasto todos los registros de un usuario.
reduce()	Suma todos los montos de los gastos.
Number()	Convierte strings a números reales, para evitar errores en cálculos.

*/