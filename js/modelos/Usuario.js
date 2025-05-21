export class Usuario{
    constructor(id,nombre, apellido, email, password){
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
        this.password = password;
    }

    static fromJSON(data){
        return new Usuario(data.id,data.nombre,data.apellido,data.email,data.password);
    }
}