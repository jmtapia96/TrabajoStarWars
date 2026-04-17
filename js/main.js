// --- DATOS INICIALES ---
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

const imagenesNaves = {
    1: 'img/ala_x.png',
    2: 'img/halcon_milenario_final.png',
    3: 'img/ala_a.png',
    4: 'img/nebulon_b.png',
    5: 'img/ala_y.png',
    6: 'img/caza_jedi.png',
    7: 'img/razor_crest.png',
    8: 'img/crucero_cabeza_martillo.png',
    9: 'img/transporte_clase_LAAT.png',
    10: 'img/nubian_327.png',
    11: 'img/Caza_estelar_N-1.png',
    12: 'img/destructor_venator.png'
};

let pilotos = JSON.parse(localStorage.getItem('pilotos_rebeldes')) || [];
let ordenAscendente = true;
let editando = false;

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    // Eventos Hangar
    document.getElementById('buscador').addEventListener('input', actualizarHangar);
    document.getElementById('filtroTipo').addEventListener('change', actualizarHangar);
    document.getElementById('btnOrden').addEventListener('click', ordenarPorVelocidad);
    
    // Eventos Modal
    document.querySelector('.cerrar-modal').addEventListener('click', cerrarModal);
    window.addEventListener('click', (e) => { if (e.target.id === 'modal-nave') cerrarModal(); });

    // Eventos Pilotos
    document.getElementById('form-piloto').addEventListener('submit', gestionarFormulario);
    document.getElementById('btn-cancelar').addEventListener('click', limpiarFormulario);

    // Carga inicial de datos
    actualizarHangar();
    rellenarSelectorNaves();
    renderizarPilotos();
});

// --- LÓGICA DEL HANGAR ---
function actualizarHangar() {
    const busqueda = document.getElementById('buscador').value.toLowerCase();
    const tipo = document.getElementById('filtroTipo').value;

    const filtradas = naves.filter(n => 
        n.nombre.toLowerCase().includes(busqueda) && (tipo === "todos" || n.tipo === tipo)
    );

    renderizarTarjetas(filtradas);
    document.getElementById('contador').textContent = filtradas.length;
}

function renderizarTarjetas(lista) {
    const contenedor = document.getElementById('contenedor-naves');
    contenedor.innerHTML = "";
    lista.forEach(n => {
        const div = document.createElement('div');
        div.className = 'nave-item';
        div.innerHTML = `<img src="${imagenesNaves[n.id]}" alt="${n.nombre}" style="width:100%">`;
        div.onclick = () => mostrarDetallesNave(n.id);
        contenedor.appendChild(div);
    });
}

function ordenarPorVelocidad() {
    ordenAscendente = !ordenAscendente;
    naves.sort((a, b) => ordenAscendente ? a.velocidad - b.velocidad : b.velocidad - a.velocidad);
    actualizarHangar();
}

function mostrarDetallesNave(id) {
    const n = naves.find(x => x.id === id);
    const contenedor = document.getElementById('detalles-nave');
    contenedor.innerHTML = `
        <div class="detalle-header">
            <img src="${imagenesNaves[n.id]}" class="detalle-img">
            <h2>${n.nombre}</h2>
            <span class="estado-tag estado-${n.estado}">${n.estado}</span>
        </div>
        <p><strong>Tipo:</strong> ${n.tipo.toUpperCase()}</p>
        <p><strong>Velocidad:</strong> ${n.velocidad} MGLT</p>
        <p><strong>Tripulación:</strong> ${n.tripulacion}</p>`;
    document.getElementById('modal-nave').classList.add('mostrar');
}

function cerrarModal() { document.getElementById('modal-nave').classList.remove('mostrar'); }

// --- LÓGICA DE PILOTOS ---
function rellenarSelectorNaves() {
    const select = document.getElementById('piloto-nave');
    select.innerHTML = '<option value="">Asignar Nave</option>';
    naves.forEach(n => select.innerHTML += `<option value="${n.nombre}">${n.nombre}</option>`);
}

function gestionarFormulario(e) {
    e.preventDefault();
    const id = document.getElementById('piloto-id').value;
    const datos = {
        id: id ? parseInt(id) : Date.now(),
        nombre: document.getElementById('piloto-nombre').value,
        rango: document.getElementById('piloto-rango').value,
        nave: document.getElementById('piloto-nave').value,
        victorias: parseInt(document.getElementById('piloto-victorias').value),
        estado: document.getElementById('piloto-estado').value
    };

    if (editando) pilotos = pilotos.map(p => p.id === datos.id ? datos : p);
    else pilotos.push(datos);

    localStorage.setItem('pilotos_rebeldes', JSON.stringify(pilotos));
    renderizarPilotos();
    limpiarFormulario();
}

function renderizarPilotos() {
    const lista = document.getElementById('lista-pilotos');
    lista.innerHTML = "";
    pilotos.forEach(p => {
        lista.innerHTML += `
            <tr class="estado-${p.estado}">
                <td>${p.nombre}</td>
                <td>${p.rango}</td>
                <td>${p.nave}</td>
                <td>${p.victorias}</td>
                <td>${p.estado.toUpperCase()}</td>
                <td>
                    <button onclick="prepararEdicion(${p.id})">✏️</button>
                    <button onclick="eliminarPiloto(${p.id})">🗑️</button>
                </td></tr>`;
    });
}

function eliminarPiloto(id) {
    if (confirm("¿Eliminar?")) {
        pilotos = pilotos.filter(p => p.id !== id);
        localStorage.setItem('pilotos_rebeldes', JSON.stringify(pilotos));
        renderizarPilotos();
    }
}

function prepararEdicion(id) {
    const p = pilotos.find(x => x.id === id);
    document.getElementById('piloto-id').value = p.id;
    document.getElementById('piloto-nombre').value = p.nombre;
    document.getElementById('piloto-rango').value = p.rango;
    document.getElementById('piloto-nave').value = p.nave;
    document.getElementById('piloto-victorias').value = p.victorias;
    document.getElementById('piloto-estado').value = p.estado;
    editando = true;
    document.getElementById('btn-guardar-piloto').textContent = "Actualizar";
    document.getElementById('btn-cancelar').style.display = "inline";
}

function limpiarFormulario() {
    document.getElementById('form-piloto').reset();
    document.getElementById('piloto-id').value = "";
    editando = false;
    document.getElementById('btn-guardar-piloto').textContent = "Registrar";
    document.getElementById('btn-cancelar').style.display = "none";
}