/*Naves de la sección 1 Hangar*/


const naves = [
    { id: 1, nombre: "X-Wing", tipo: "caza", velocidad: 100, tripulacion: 1, estado: "operativa" },
    { id: 2, nombre: "Millennium Falcon", tipo: "transporte", velocidad: 80, tripulacion: 4, estado: "reparacion" },
    { id: 3, nombre: "A-Wing", tipo: "caza", velocidad: 120, tripulacion: 1, estado: "operativa" },
    { id: 4, nombre: "Nebulon-B", tipo: "fragata", velocidad: 40, tripulacion: 920, estado: "operativa" },
    { id: 5, nombre: "Y-Wing", tipo: "caza", velocidad: 80, tripulacion: 2, estado: "destruida" },
    { id: 6, nombre: "Caza Jedi", tipo: "caza", velocidad: 115, tripulacion: 1, estado: "operativa" },
    { id: 7, nombre: "Razor Crest", tipo: "transporte", velocidad: 75, tripulacion: 2, estado: "destruida" },
    { id: 8, nombre: "Crucero Cabeza Martillo", tipo: "fragata", velocidad: 60, tripulacion: 85, estado: "operativa" },
    { id: 9, nombre: "Transporte Clase LAAT", tipo: "transporte", velocidad: 50, tripulacion: 4, estado: "operativa" },
    { id: 10, nombre: "Nubian 327", tipo: "transporte", velocidad: 110, tripulacion: 8, estado: "operativa" },
    { id: 11, nombre: "Caza Estelar N-1", tipo: "caza", velocidad: 125, tripulacion: 1, estado: "operativa" },
    { id: 12, nombre: "Destructor Venator", tipo: "fragata", velocidad: 45, tripulacion: 7400, estado: "operativa" }
];

// Nos sirve para emparejar el ID de la nave con la ruta de su imagen
const imagenesNaves = {
    1: 'img/ala_x.png', 2: 'img/halcon_milenario_final.png', 3: 'img/ala_a.png',
    4: 'img/nebulon_b.png', 5: 'img/ala_y.png', 6: 'img/caza_jedi.png',
    7: 'img/razor_crest.png', 8: 'img/crucero_cabeza_martillo.png', 9: 'img/transporte_clase_LAAT.png',
    10: 'img/nubian_327.png', 11: 'img/Caza_estelar_N-1.png', 12: 'img/destructor_venator.png'
};

/**
 * Persistencia de datos (LocalStorage)
 * Leemos la memoria del navegador. Si no existe la clave, iniciamos con un array vacío [].
 * JSON.parse convierte el texto guardado en un array de JS para que pueda empezar a trabajar.
 */
let pilotos = JSON.parse(localStorage.getItem('pilotos_rebeldes')) || [];
let misiones = JSON.parse(localStorage.getItem('misiones_rebeldes')) || [];

// Variables de estado global
let ordenAscendente = true; // Controla la dirección del botón de ordenar velocidad
let editando = false;       // Bandera para saber si el formulario de pilotos crea o actualiza

/**
 * Con esta lina nos aseguramos que el HTML este cargado completamente antes de que el JavaScript haga lo suyo
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Modo oscuro/claro ---
    // 1. Al cargar la web, comprobamos si el usuario ya tenía guardado el tema 'claro' y lo mostramos si fuera el caso
    if (localStorage.getItem('tema_rebelde') === 'claro') {
        document.body.classList.add('light-mode');
    }
    
    // 2. Evento click en el logotipo de la rebelión
    document.getElementById('btn-tema').addEventListener('click', () => {
        // toggle() pone la clase si no está, y la quita si ya la tiene
        document.body.classList.toggle('light-mode'); 
        const esClaro = document.body.classList.contains('light-mode');
        // Guardamos la preferencia en localStorage para futuras visitas
        localStorage.setItem('tema_rebelde', esClaro ? 'claro' : 'oscuro');
    });

    // Iniciar la web mostrando el Hangar por defecto
    mostrarSeccion('hangar');

    // --- Eventos del DOM ---
    // Hangar
    document.getElementById('buscador').addEventListener('input', actualizarHangar); // Busca "en tiempo real" al teclear
    document.getElementById('filtroTipo').addEventListener('change', actualizarHangar);
    document.getElementById('btnOrden').addEventListener('click', ordenarPorVelocidad);
    
    // Modal
    document.querySelector('.cerrar-modal').addEventListener('click', cerrarModal);
    window.addEventListener('click', (e) => { if (e.target.id === 'modal-nave') cerrarModal(); });

    // Pilotos
    document.getElementById('form-piloto').addEventListener('submit', gestionarFormularioPiloto); // Intercepta el 'submit'
    document.getElementById('btn-cancelar').addEventListener('click', limpiarFormularioPiloto);

    // Misiones
    document.getElementById('form-mision').addEventListener('submit', guardarMision);
    document.getElementById('filtro-dificultad').addEventListener('change', renderizarMisiones);

    // --- RENDERIZADOS INICIALES ---
    // Llamamos a las funciones que "pintan" los datos en el HTML por primera vez
    actualizarHangar();
    rellenarSelectorNaves();
    renderizarPilotos();
    renderizarMisiones();
});

//--------------------------------------------
// 1. Navegación de una sola pagina, esta parte es para ocultar y mostrar las secciones
//--------------------------------------------

function mostrarSeccion(idSeccion) {
    // 1. Seleccionamos todos los <section> dentro del <main> y los ocultamos
    const secciones = document.querySelectorAll('main > section');
    secciones.forEach(sec => {
        sec.classList.remove('seccion-activa');
        sec.classList.add('seccion-oculta');
    });

    // 2. Quitamos la clase "activo" (la línea amarilla) de todos los botones del menú
    const botonesNav = document.querySelectorAll('.btn-nav');
    botonesNav.forEach(btn => btn.classList.remove('activo'));

    // 3. Mostramos la sección seleccionada
    document.getElementById(idSeccion).classList.remove('seccion-oculta');
    document.getElementById(idSeccion).classList.add('seccion-activa');
    
    // 4. Activamos el botón correspondiente en el menú superior
    const navId = 'nav-' + idSeccion.replace('panel-', '').replace('registro-', '');
    if(document.getElementById(navId)) document.getElementById(navId).classList.add('activo');

    // 5. Automatizaciones al entrar a ciertas secciones:
    // Si entro en misiones, recargo los pilotos activos en el selector por si he añadido alguno nuevo
    if(idSeccion === 'panel-misiones') rellenarSelectorPilotosActivos();
    // Si entro en dashboard, recalculo todos los totales (Requisito del PDF)
    if(idSeccion === 'dashboard') actualizarDashboard(); 
}

//--------------------------------------------
// 2. Filtros y DOM del Hangar
//--------------------------------------------
function actualizarHangar() {
    const busqueda = document.getElementById('buscador').value.toLowerCase();
    const tipo = document.getElementById('filtroTipo').value;

    // Uso de .filter recorre el array y devuelve un array nuevo solo con las naves que cumplen las condiciones
    const filtradas = naves.filter(n =>
        n.nombre.toLowerCase().includes(busqueda) && (tipo === "todos" || n.tipo === tipo)
    );

    renderizarTarjetas(filtradas);
    document.getElementById('contador').textContent = filtradas.length;
}

function renderizarTarjetas(lista) {
    const contenedor = document.getElementById('contenedor-naves');
    contenedor.innerHTML = ""; // Vaciamos el contenedor
    
    // Uso de .forEach para iterar sobre el array y crear los elementos <div>
    lista.forEach(n => {
        const div = document.createElement('div');
        div.className = 'nave-item';
        // onerror se usa por si la imagen no existe en la carpeta img/, pone un cohete por defecto
        div.innerHTML = `<img src="${imagenesNaves[n.id]}" alt="${n.nombre}" style="width:100%" onerror="this.outerHTML='<span style=\\'font-size:3rem;\\'>🚀</span>'">`;
        div.onclick = () => mostrarDetallesNave(n.id); // Al hacer click, abre la modal
        contenedor.appendChild(div);
    });
}

function ordenarPorVelocidad() {
    ordenAscendente = !ordenAscendente; // Alterna entre true y false para elegir si ascendente o descendente
    // Uso de .sort compara a y b. Si devuelve positivo, b va antes. Si devuelve negativo, entonces a va antes.
    naves.sort((a, b) => ordenAscendente ? a.velocidad - b.velocidad : b.velocidad - a.velocidad);
    actualizarHangar(); // actualizamos las tarjetas
}

function mostrarDetallesNave(id) {
    // Con el .find buscamos el primer elemento que coincida con el ID
    const n = naves.find(x => x.id === id);
    const contenedor = document.getElementById('detalles-nave');
    // Rellenamos el HTML interno de la ventana modal con el inner
    contenedor.innerHTML = `
        <div class="detalle-header">
            <h2>${n.nombre}</h2>
            <span class="dificultad-tag">${n.estado}</span>
        </div>
        <p><strong>Tipo:</strong> ${n.tipo.toUpperCase()}</p>
        <p><strong>Velocidad:</strong> ${n.velocidad} MGLT</p>
        <p><strong>Tripulación:</strong> ${n.tripulacion}</p>`;
    document.getElementById('modal-nave').classList.add('mostrar'); // Muestra la modal
}

function cerrarModal() { 
    document.getElementById('modal-nave').classList.remove('mostrar');
}

//--------------------------------------------
// 3. CRUD y LocalStorage de Pilotos
//--------------------------------------------
function rellenarSelectorNaves() {
    const select = document.getElementById('piloto-nave');
    select.innerHTML = '<option value="">Asignar Nave</option>';
    naves.forEach(n => select.innerHTML += `<option value="${n.nombre}">${n.nombre}</option>`);
}

function gestionarFormularioPiloto(e) {
    e.preventDefault(); // Evita que la página se recargue al enviar el formulario

    const id = document.getElementById('piloto-id').value;
    // Capturamos los datos del DOM en un objeto
    const datos = {
        id: id ? parseInt(id) : Date.now(), // Si no hay ID, generamos uno único con Date.now()
        nombre: document.getElementById('piloto-nombre').value,
        rango: document.getElementById('piloto-rango').value,
        nave: document.getElementById('piloto-nave').value,
        victorias: parseInt(document.getElementById('piloto-victorias').value),
        estado: document.getElementById('piloto-estado').value
    };

    if (editando) {
        // Usamos el.map para sustituir el objeto antiguo por el nuevo modificado
        pilotos = pilotos.map(p => p.id === datos.id ? datos : p);
    } else {
        // Operación CREATE
        pilotos.push(datos);
    }

    // Persistencia: Convertimos el array a string y lo guardamos
    localStorage.setItem('pilotos_rebeldes', JSON.stringify(pilotos));
    renderizarPilotos();
    limpiarFormularioPiloto();
}

function renderizarPilotos() {
    const lista = document.getElementById('lista-pilotos');
    lista.innerHTML = "";
    pilotos.forEach(p => {
        // Generamos filas de tabla <tr> dinámicamente
        lista.innerHTML += `
            <tr class="estado-${p.estado}">
                <td>${p.nombre}</td>
                <td>${p.rango}</td>
                <td>${p.nave}</td>
                <td>${p.victorias}</td>
                <td>${p.estado.toUpperCase()}</td>
                <td>
                    <button onclick="prepararEdicionPiloto(${p.id})">✏️</button>
                    <button onclick="eliminarPiloto(${p.id})">🗑️</button>
                </td></tr>`;
    });
}

function eliminarPiloto(id) {
    // confirm lanza la alerta del navegador para confirmar la accion, en este caso de eliminar el piloto.
    if (confirm("¿Eliminar piloto?")) {
        // Operación DELETE: Sobrescribimos el array filtrando el ID que queremos borrar
        pilotos = pilotos.filter(p => p.id !== id);
        localStorage.setItem('pilotos_rebeldes', JSON.stringify(pilotos));
        renderizarPilotos();
    }
}

function prepararEdicionPiloto(id) {
    // Actualizar pilotos: Buscamos los datos y los metemos en el formulario
    const p = pilotos.find(x => x.id === id);
    document.getElementById('piloto-id').value = p.id;
    document.getElementById('piloto-nombre').value = p.nombre;
    document.getElementById('piloto-rango').value = p.rango;
    document.getElementById('piloto-nave').value = p.nave;
    document.getElementById('piloto-victorias').value = p.victorias;
    document.getElementById('piloto-estado').value = p.estado;
    
    // Cambiamos el estado de la interfaz para que el usuario sepa que está editando y se muestren los datos actuales del piloto para su edicion
    editando = true;
    document.getElementById('btn-guardar-piloto').textContent = "Actualizar";
    document.getElementById('btn-cancelar').style.display = "inline";
    mostrarSeccion('registro-pilotos');
}

function limpiarFormularioPiloto() {
    document.getElementById('form-piloto').reset(); // Vacía los inputs
    document.getElementById('piloto-id').value = "";
    editando = false;
    document.getElementById('btn-guardar-piloto').textContent = "Registrar Piloto";
    document.getElementById('btn-cancelar').style.display = "none";
}

//--------------------------------------------
// 4. Misiones (Tablero Kanban)
//--------------------------------------------
function rellenarSelectorPilotosActivos() {
    const select = document.getElementById('mision-piloto');
    select.innerHTML = '<option value="">Asignar Piloto Activo</option>';
    // Esto obliga que solo los pilotos con estado activo pueden asignarse a misiones
    const activos = pilotos.filter(p => p.estado === 'activo');
    activos.forEach(p => select.innerHTML += `<option value="${p.nombre}">${p.nombre} (${p.rango})</option>`);
}

function guardarMision(e) {
    e.preventDefault();
    const nuevaMision = {
        id: Date.now(),
        nombre: document.getElementById('mision-nombre').value,
        descripcion: document.getElementById('mision-descripcion').value,
        piloto: document.getElementById('mision-piloto').value,
        dificultad: document.getElementById('mision-dificultad').value,
        fecha: document.getElementById('mision-fecha').value,
        estado: 'pendiente' // Para que siempre inicien las misiones como pendientes
    };

    misiones.push(nuevaMision);
    localStorage.setItem('misiones_rebeldes', JSON.stringify(misiones));
    document.getElementById('form-mision').reset();
    renderizarMisiones();
}

function renderizarMisiones() {
    // 1. Limpiamos las 3 columnas
    document.getElementById('contenedor-pendiente').innerHTML = '';
    document.getElementById('contenedor-curso').innerHTML = '';
    document.getElementById('contenedor-completada').innerHTML = '';

    // 2. Aplicamos el filtro de dificultad a todo el tablero
    const filtro = document.getElementById('filtro-dificultad').value;
    const misionesFiltradas = misiones.filter(m => filtro === 'todas' || m.dificultad === filtro);

    let cPendientes = 0, cCurso = 0, cCompletadas = 0;

    // 3. Repartimos las tarjetas en la columna correspondiente usando if/else
    misionesFiltradas.forEach(m => {
        const div = document.createElement('div');
        div.className = 'mision-card';
        div.innerHTML = `
            <h4>${m.nombre}</h4>
            <p><em>${m.descripcion}</em></p>
            <p><strong>Piloto:</strong> ${m.piloto}</p>
            <p><strong>Fecha:</strong> ${m.fecha}</p>
            <span class="dificultad-tag dificultad-${m.dificultad.replace('í', 'i')}">${m.dificultad}</span>
            <div class="acciones-mision">
                ${m.estado !== 'pendiente' ? `<button onclick="moverMision(${m.id}, 'retroceder')">⬅️</button>` : ''}
                <button onclick="eliminarMision(${m.id})" style="background:var(--color-peligro); color:white; border:none;">🗑️</button>
                ${m.estado !== 'completada' ? `<button onclick="moverMision(${m.id}, 'avanzar')">➡️</button>` : ''}
            </div>
        `;

        if (m.estado === 'pendiente') { document.getElementById('contenedor-pendiente').appendChild(div); cPendientes++; }
        else if (m.estado === 'curso') { document.getElementById('contenedor-curso').appendChild(div); cCurso++; }
        else if (m.estado === 'completada') { document.getElementById('contenedor-completada').appendChild(div); cCompletadas++; }
    });

    // 4. Escribimos los contadores en las cabeceras
    document.getElementById('contador-pendiente').textContent = cPendientes;
    document.getElementById('contador-curso').textContent = cCurso;
    document.getElementById('contador-completada').textContent = cCompletadas;
}

function moverMision(id, accion) {
    const mision = misiones.find(m => m.id === id);
    if (!mision) return;

    // Nos permite mover las misiones (tarjeta) en los diferentes contenedores de izquierda a derecha haciendo que pase de pdte a en curso o completada
    if (accion === 'avanzar') {
        if (mision.estado === 'pendiente') mision.estado = 'curso';
        else if (mision.estado === 'curso') mision.estado = 'completada';
    } else if (accion === 'retroceder') {
        if (mision.estado === 'completada') mision.estado = 'curso';
        else if (mision.estado === 'curso') mision.estado = 'pendiente';
    }
    
    // Guardamos estado y volvemos a mostrar las tarjetas
    localStorage.setItem('misiones_rebeldes', JSON.stringify(misiones));
    renderizarMisiones();
}

function eliminarMision(id) {
    if (confirm('¿Borrar misión de los registros?')) {
        misiones = misiones.filter(m => m.id !== id);
        localStorage.setItem('misiones_rebeldes', JSON.stringify(misiones));
        renderizarMisiones();
    }
}

//--------------------------------------------
// 5. Dashboard (Estadísticas y DOM)
//--------------------------------------------
function actualizarDashboard() {
    // Naves: Usamos .filter().length para contar cuántas cumplen la condición correspondiente segun su estado(operativa, en reparacion o destruida)
    document.getElementById('dash-naves-total').textContent = naves.length;
    document.getElementById('dash-naves-op').textContent = naves.filter(n => n.estado === 'operativa').length;
    document.getElementById('dash-naves-rep').textContent = naves.filter(n => n.estado === 'reparacion').length;
    document.getElementById('dash-naves-des').textContent = naves.filter(n => n.estado === 'destruida').length;

    // Hacemos uso de .reduce(). para comparar todas las naves y se queda con el objeto que tenga el numero mas alto en su atributo de 'velocidad'
    const naveRapida = naves.reduce((max, nave) => (nave.velocidad > max.velocidad) ? nave : max, naves[0]);
    document.getElementById('dash-nave-rapida').textContent = naveRapida ? `${naveRapida.nombre} (${naveRapida.velocidad} MGLT)` : "No hay datos";

    // Para los pilotos, le damos el mismo uso del .filter().lenght que en el de las naves
    document.getElementById('dash-pilotos-total').textContent = pilotos.length;
    document.getElementById('dash-pilotos-act').textContent = pilotos.filter(p => p.estado === 'activo').length;
    document.getElementById('dash-pilotos-her').textContent = pilotos.filter(p => p.estado === 'herido').length;
    document.getElementById('dash-pilotos-kia').textContent = pilotos.filter(p => p.estado === 'KIA').length;

    // Aqui usamos el .reduce para buscar al piloto con la máxima cantidad de victorias)
    if (pilotos.length > 0) {
        const mejorPiloto = pilotos.reduce((max, p) => (p.victorias > max.victorias) ? p : max, pilotos[0]);
        document.getElementById('dash-mejor-piloto').textContent = `${mejorPiloto.nombre} (${mejorPiloto.victorias} victorias)`;
    //en caso de que el array de pilotos este vacio osea no haya ningun piloto, mostramos directamente el siguiente mensaje
    } else {
        document.getElementById('dash-mejor-piloto').textContent = "No hay pilotos registrados";
    }

    // Misiones
    const mTotal = misiones.length;
    const mCompletadas = misiones.filter(m => m.estado === 'completada').length;
    
    document.getElementById('dash-misiones-total').textContent = mTotal;
    document.getElementById('dash-misiones-pen').textContent = misiones.filter(m => m.estado === 'pendiente').length;
    document.getElementById('dash-misiones-cur').textContent = misiones.filter(m => m.estado === 'curso').length;
    document.getElementById('dash-misiones-com').textContent = mCompletadas;

    // Aqui calculamos el % de la barra de progreso
    let porcentaje = 0;
    if (mTotal > 0) {
        porcentaje = Math.round((mCompletadas / mTotal) * 100);
    }
    
    const barraProgreso = document.getElementById('barra-progreso');
    
    // El setTimeout nos permite darle tiempo al css a aplicar el movimiento suave de la subida de %
    setTimeout(() => {
        barraProgreso.style.width = `${porcentaje}%`;
        barraProgreso.textContent = `${porcentaje}%`;
    }, 100);
}