// 1. Datos (He añadido URLs de imagen reales para el ejemplo, pero puedes usar tus emojis)
// He simplificado el estado para que sea 'operativa', 'reparacion', 'destruida'
const naves = [
  { id: 1, nombre: "X-Wing", tipo: "caza", velocidad: 100, tripulacion: 1, estado: "operativa", imagen: "🚀" },
  { id: 2, nombre: "Millennium Falcon", tipo: "transporte", velocidad: 80, tripulacion: 4, estado: "reparacion", imagen: "🛸" },
  { id: 3, nombre: "A-Wing", tipo: "caza", velocidad: 120, tripulacion: 1, estado: "operativa", imagen: "⚡" },
  { id: 4, nombre: "Nebulon-B", tipo: "fragata", velocidad: 40, tripulacion: 920, estado: "operativa", imagen: "🚢" },
  { id: 5, nombre: "Y-Wing", tipo: "caza", velocidad: 80, tripulacion: 2, estado: "destruida", imagen: "💥" },
  { id: 6, nombre: "Caza Jedi", tipo: "caza", velocidad: 115, tripulacion: 1, estado: "operativa", imagen: "✨" },
  { id: 7, nombre: "Razor Crest", tipo: "transporte", velocidad: 75, tripulacion: 2, estado: "destruida", imagen: "🔫" },
  { id: 8, nombre: "Crucero Cabeza Martillo", tipo: "fragata", velocidad: 60, tripulacion: 85, estado: "operativa", imagen: "🔨" },
  { id: 9, nombre: "Transporte Clase LAAT", tipo: "transporte", velocidad: 50, tripulacion: 4, estado: "operativa", imagen: "🚁" },
  { id: 10, nombre: "Nubian 327", tipo: "transporte", velocidad: 110, tripulacion: 8, estado: "operativa", imagen: "💎" },
  { id: 11, nombre: "Caza Estelar N-1", tipo: "caza", velocidad: 125, tripulacion: 1, estado: "operativa", imagen: "💛" },
  { id: 12, nombre: "Destructor Venator", tipo: "fragata", velocidad: 45, tripulacion: 7400, estado: "operativa", imagen: "🏟️" }
];

// He añadido la URL de las imágenes para que se vea mejor, si prefieres usar los emojis,
// cambia 'imagenUrl' por 'imagen' en renderizarTarjetas.
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

let ordenAscendente = true;

// 2. Funciones Principales (Iguales que antes, salvo renderizar)
function actualizarHangar() {
  const busqueda = document.getElementById('buscador').value.toLowerCase();
  const tipoSeleccionado = document.getElementById('filtroTipo').value;

  let navesFiltradas = naves.filter(nave => {
    const coincideNombre = nave.nombre.toLowerCase().includes(busqueda);
    const coincideTipo = tipoSeleccionado === "todos" || nave.tipo === tipoSeleccionado;
    return coincideNombre && coincideTipo;
  });

  renderizarTarjetas(navesFiltradas);
  actualizarContador(navesFiltradas.length);
}

function ordenarPorVelocidad() {
  ordenAscendente = !ordenAscendente;
  naves.sort((a, b) => ordenAscendente ? a.velocidad - b.velocidad : b.velocidad - a.velocidad);
  actualizarHangar();
}

function actualizarContador(total) {
  document.getElementById('contador').textContent = total;
}

// 3. NUEVO: Renderizado enfocado en la imagen/clic
function renderizarTarjetas(listaNaves) {
  const contenedor = document.getElementById('contenedor-naves');
  contenedor.innerHTML = ""; 

  listaNaves.forEach(nave => {
    const itemHangar = document.createElement('div');
    itemHangar.className = 'nave-item';
    
    // Crear la imagen o el emoji grande
    const imgContenedor = document.createElement('div');
    imgContenedor.className = 'nave-imagen-click';
    
    // USAR IMAGEN REAL (descomenta si usas las URLs de arriba)
    imgContenedor.innerHTML = `<img src="${imagenesNaves[nave.id]}" alt="${nave.nombre}">`;
    
    // O USAR EMOJI (descomenta si prefieres los emojis originales)
    // imgContenedor.innerHTML = `<span class="emoji-grande">${nave.imagen}</span>`;

    // 4. NUEVO: Evento de clic en la imagen
    imgContenedor.addEventListener('click', () => mostrarDetallesNave(nave.id));

    itemHangar.appendChild(imgContenedor);
    contenedor.appendChild(itemHangar);
  });
}

// 5. NUEVO: Función que llena y muestra la Modal
function mostrarDetallesNave(naveId) {
    // Buscar la nave por ID
    const nave = naves.find(n => n.id === naveId);
    if (!nave) return;

    const modal = document.getElementById('modal-nave');
    const contenedorDetalles = document.getElementById('detalles-nave');

    // Inyectar el HTML de detalles
    contenedorDetalles.innerHTML = `
        <div class="detalle-header">
            <img src="${imagenesNaves[nave.id]}" alt="${nave.nombre}" class="detalle-img">
            <h2>${nave.nombre}</h2>
            <span class="estado-tag estado-${nave.estado}">${nave.estado}</span>
        </div>
        <div class="detalle-info">
            <p><strong>Clasificación:</strong> ${nave.tipo.toUpperCase()}</p>
            <p><strong>Velocidad Máxima:</strong> ${nave.velocidad} MGLT</p>
            <p><strong>Tripulación:</strong> ${nave.tripulacion} personas</p>
        </div>
    `;

    // Mostrar la modal añadiendo una clase CSS
    modal.classList.add('mostrar');
}

// 6. Funciones para Cerrar la Modal
function cerrarModal() {
    document.getElementById('modal-nave').classList.remove('mostrar');
}

// Event Listeners y Carga Inicial
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('buscador').addEventListener('input', actualizarHangar);
    document.getElementById('filtroTipo').addEventListener('change', actualizarHangar);
    document.getElementById('btnOrden').addEventListener('click', ordenarPorVelocidad);

    // Cerrar modal al hacer clic en la X
    document.querySelector('.cerrar-modal').addEventListener('click', cerrarModal);
    
    // Cerrar modal al hacer clic fuera del contenido blanco
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('modal-nave');
        if (event.target === modal) {
            cerrarModal();
        }
    });

    actualizarHangar(); // Carga inicial
});