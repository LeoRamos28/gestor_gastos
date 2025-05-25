export class Usuario{
    constructor(id,nombre_usuario, email, password){
        this.id = id;
        this.nombre = nombre_usuario;
        // this.apellido = apellido;
        this.email = email;
        this.password = password;
    }

    static fromJSON(data){
        return new Usuario(data.id,data.nombre_usuario,data.email,data.password);
    }
}