export class Usuario {
    constructor(id, nombre_usuario, email, password) {
        this.id = id;
        this.nombre = nombre_usuario;
        this.email = email;
        this.password = password;
    }

    static async obtenerPorId(id) {
        const data = await prisma.usuario.findUnique({
            where: { id_usuario: id }
        });

        if (!data) throw new Error('Usuario no encontrado');
        return new Usuario(data.id_usuario, data.nombre_usuario, data.email, data.password_hash);
    }

    static async crearUsuario(nombre_usuario, email, password_hash) {
        const nuevoUsuario = await prisma.usuario.create({
            data: { nombre_usuario, email, password_hash }
        });

        return new Usuario(nuevoUsuario.id_usuario, nuevoUsuario.nombre_usuario, nuevoUsuario.email, nuevoUsuario.password_hash);
    }

    static fromJSON(data) {
        return new Usuario(data.id_usuario, data.nombre_usuario, data.email, data.password_hash);
    }
}
