//Definimos objeto clase producto con sus cuatro caracteristicas: ID (para la seleccion del usuario), nombre, precio y cantidad (a determinar por el usuario);
class producto {
    constructor (id, nombre, precio) {
        this.id = parseFloat(id);
        this.nombre = nombre;
        this.precio = parseFloat(precio);
        this.cantidad = parseFloat(0);
    }
}

//Definimos objeto clase carta con caracteristicas a exportar desde un objeto clase producto creado mediante JSON y con un metodo descuento para aplicar cuando corresponda;
class carta {
    constructor (obj) {
        this.id = parseFloat(obj.id);
        this.nombre = obj.nombre;
        this.precio = parseFloat(obj.precio);
        this.cantidad = parseFloat(obj.cantidad);
    }
    descuento() {
        this.precio = this.precio*0.9;
    }
}

//Empezamos a crear el HTML

//Pusheamos un titulo, una introduccion y un aviso de que comprando doce o mas empanadas se tiene un descuento
let introduccion = document.createElement("div");
introduccion.className="container_fluid introduccion"
introduccion.innerHTML = `<h1 class=introduccion__titulo>Bienvenido a la tienda de empandas</h3> 
<p class=introduccion__texto>¿Qué desea comprar en esta visita? ¡Recuerde que si compra doce o mas empanadas tienen un 10% de descuento!</p>`;
document.body.appendChild(introduccion);


//Creamos un formulario HTML que contenga las cards del menu ,un boton para enviar los datos y generar un resumen de compra y otro boton para limpiar el resumen de compra:
let formulario = document.createElement("form");
formulario.className = "container_fluid formulario"
document.body.appendChild(formulario);


//Creamos las cards
fetch('menu.json')
    .then( (res) => menu=res.json())
    .then ( (data) => {
        data.forEach((item) =>{
            let card = document.createElement("div");
            card.className = "card"
            card.innerHTML = `<h3 class=card__titulo>ID: ${item.id}</h3> 
            <p class=card__texto>${item.nombre}</p> 
            <p class=card__texto>$${item.precio}</p>
            <p><label for="input${item.id}">Cantidad: <input type="number" min="0" class="cantidad" id="input${item.id}"></label></p>`;
            formulario.appendChild(card);
        })
        //Creamos un boton para enviar el formulario con el carrito de compra
        let boton = document.createElement("label");
        boton.innerHTML =`<input type="submit" class="enviar" id="comprar" value="Comprar">`;
        formulario.appendChild(boton);

        //Agregamos un segundo boton para borrar el resumen de la compra anterior
        let boton2 = document.createElement("label");
        boton2.innerHTML =`<input type="button" class="boton" value="Limpiar compra">`;
        formulario.appendChild(boton2);

        //Añadimos un evento para cuando se envia el formulario
        formulario.addEventListener("submit", enviarFormulario);

        //Añadimos un evento al boton limpiar compra para que borre el html del resumen de la compra
        boton2.addEventListener ("click", limpiarCompra);
    })


function enviarFormulario (evento) {
    evento.preventDefault();
    sessionStorage.clear(); //Limpiamos la memoria de sesion
    let miFormulario = evento.target

    //Queremos una variable que sea igual a la cantidad de inputs que tiene el usuario para comprar la comida/bebida. Lo calculamos con la cantidad de hijos que tiene el formulario
    let cantidades = miFormulario.children.length-2 //Compensamos por la existencia de los dos botones que no son inputs numericos
    for (let i=0; i<cantidades; i++){
        let comprados = miFormulario.children[i].children[3].children[0].children[0].value; //Extraemos el valor de cada input
        if (comprados<1){
            menu[i].cantidad=0 //Si el usuario escribio 0 o no escribio nada (null) guardamos 0 como cantidad de compra
        }
        else{
            menu[i].cantidad=comprados //Si el usuario SI escribio la cantidad a comprar entonces la guardamos
        }
    }

    //Guardamos el array menú con sus cantidades de compra en el sessionStorage mediante un JSON
    const enJSON = JSON.stringify(menu);
    guardarSesion("Carrito", enJSON);

    //Creamos un array exportando el contenido del sessionStorage y luego creamos un array carrito con la compra del usuario en forma de objetos clase carta
    const almacenados = JSON.parse(sessionStorage.getItem("Carrito"));
    let carrito = []
    for (const objeto of almacenados){
        carrito.push(new carta(objeto));
    }

    //Funcion aplicar descuento
    carrito=aplicarDescuento(carrito);

    //Funcion mostrar compra
    mostrarCompra(carrito);
}

//Funcion flecha para guardar los elementos del array menú al sessionStorage
const guardarSesion = (clave, valor) => { sessionStorage.setItem(clave, valor) };


//Funcion para aplicar el descuento si se compraron 12 o mas empanadas
function aplicarDescuento (array){
    let sumador=0
    for (let i=0; i<3; i++){
        sumador+=array[i].cantidad //Sumamos las cantidades de los objetos del array que sean empanadas
    }
    if (sumador>=12){
        for (let i=0; i<3; i++){
        array[i].descuento(); //Si la suma es mayor o igual a 12 aplicamos el metodo descuento SOLO a las empanadas
        }
    }
    return array;
}

//Funcion para mostrar en html el detalle de la compra
function mostrarCompra (array){
    //Ejecutamos una funcion que borre el resumen de la compra anterior
    limpiarCompra ();

    //Creamos un div con un titulo que contenga el resumen de la compra
    let resumen = document.createElement("div");
    resumen.className = "container_lg resumen"
    resumen.innerHTML = `<h2 class="resumen__titulo">Su compra es:<h2/>`
    document.body.appendChild(resumen);

    //Agregamos los datos de la compra
    let total = 0
    for (const item of array) {
        if (item.cantidad>0){
        let subTotal = item.precio*item.cantidad
        total+=subTotal
        let renglon = document.createElement("div");
        renglon.innerHTML = `<h3 class=card__titulo>ID: ${item.id}</h3> 
        <p class=card__texto>${item.nombre}</p> 
        <p class=card__texto>${item.cantidad} x $${item.precio}</p>
        <p class=card__texto>Subtotal: $${subTotal}</p>`;
        resumen.appendChild(renglon);
        }
    }
    let final = document.createElement("div");
    final.innerHTML = `<p class=card__texto><b>Total:</b> $${total}</p>`;
    resumen.appendChild(final);
    let boton3 = document.createElement("label");
    boton3.innerHTML =`<input type="button" class="boton" value="Confirmar compra">`;
    resumen.appendChild(boton3);

    //Agregamos un evento que muestre un Sweet Alert al tocar el boton de confirmar compra
    boton3.addEventListener("click", confirmarCompra);
}

//Funcion para limpiar el resumen de compra
function limpiarCompra(){
    let borrar=document.querySelector(".resumen") //Creamos un nodo con los elementos clase resumen 
    if (borrar !== null){
        borrar.remove(); //Si existe algun elemento con clase resumen, lo borramos
    }
}

//Funcion para mostrar el Sweet Alert
function confirmarCompra(){
    Swal.fire({
        title: '¡Pedido confirmado!',
        icon: 'success',
        html: `<p>Estamos preparando tu pedido, el cadete te lo entregará en aproximadamente 30 minutos =)</p>`,
        footer: `<p class="text-center">¡No olvides seguirnos en nuestras redes!<br>
        <a href="https://www.instagram.com" target="_blank"><i class="px-2 fa-brands fa-instagram"></i></a>
        <a href="https://es-la.facebook.com" target="_blank"><i class="px-2 fa-brands fa-facebook"></i></a></p>`
    }).then((result) => {
        if (result.isConfirmed) {
            limpiarCompra(); //Cuando el usuario salga del alert limpiamos el resumen de la compra
          }
      })
}

