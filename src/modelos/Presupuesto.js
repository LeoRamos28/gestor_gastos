export class Presupuesto {
    constructor(presupuesto, usuarioId) {
        this.presupuesto = Number(presupuesto);
        this.restante = this.presupuesto;
        this.usuarioId = usuarioId;
        this.gastos = [];
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
