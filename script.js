// script.js - JS modularizado para index.html
const ReportApp = (() => {
    const state = {
        reportesUsuario: [],
        usuarioRegistrado: false,
        datosUsuario: { nombre: '', cerro: 'Cerro Alegre' },
        fotoTomada: false
    };

    const elements = {};

    const selectors = {
        screenRegistro: 'screenRegistro',
        screenReporte: 'screenReporte',
        screenConfirmacion: 'screenConfirmacion',
        screenHistorial: 'screenHistorial',
        regNombre: 'regNombre',
        regCerro: 'regCerro',
        descripcionReporte: 'descripcionReporte',
        categoriaResiduo: 'categoriaResiduo',
        previewFoto: 'previewFoto',
        cerroSeleccionadoUsuario: 'cerroSeleccionadoUsuario',
        listaReportesDinamica: 'listaReportesDinamica',
        sinReportesMsg: 'sinReportesMsg',
        btnRegistrarMock: 'btnRegistrarMock',
        simularTomarFoto: 'simularTomarFoto',
        simularRecargarUbicacion: 'simularRecargarUbicacion',
        btnEnviarReporte: 'btnEnviarReporte',
        irAHistorialDesdeConfirm: 'irAHistorialDesdeConfirm',
        nuevoReporteDesdeConfirm: 'nuevoReporteDesdeConfirm',
        btnNuevoReporteHistorial: 'btnNuevoReporteHistorial',
        btnEmergenciaIncendio: 'btnEmergenciaIncendio',
        btnEmergenciaIncendioHistorial: 'btnEmergenciaIncendioHistorial'
    };

    function $(id) {
        return document.getElementById(id);
    }

    function cacheElements() {
        Object.keys(selectors).forEach((key) => {
            elements[key] = $(selectors[key]);
        });
        elements.navItems = document.querySelectorAll('.nav-item');
        elements.allScreens = [elements.screenRegistro, elements.screenReporte, elements.screenConfirmacion, elements.screenHistorial];
    }

    function init() {
        cacheElements();
        bindEvents();
        updateUserLocation();
    }

    function bindEvents() {
        if (elements.btnRegistrarMock) {
            elements.btnRegistrarMock.addEventListener('click', handleRegistrar);
        }
        if (elements.simularTomarFoto) {
            elements.simularTomarFoto.addEventListener('click', handleTomarFoto);
        }
        if (elements.simularRecargarUbicacion) {
            elements.simularRecargarUbicacion.addEventListener('click', handleRecargarUbicacion);
        }
        if (elements.btnEnviarReporte) {
            elements.btnEnviarReporte.addEventListener('click', handleEnviarReporte);
        }
        if (elements.irAHistorialDesdeConfirm) {
            elements.irAHistorialDesdeConfirm.addEventListener('click', () => mostrarPantalla('screenHistorial'));
        }
        if (elements.nuevoReporteDesdeConfirm) {
            elements.nuevoReporteDesdeConfirm.addEventListener('click', () => mostrarPantalla('screenReporte'));
        }
        if (elements.btnNuevoReporteHistorial) {
            elements.btnNuevoReporteHistorial.addEventListener('click', () => mostrarPantalla('screenReporte'));
        }
        if (elements.navItems) {
            elements.navItems.forEach(item => {
                item.addEventListener('click', handleNavClick);
            });
        }
        if (elements.btnEmergenciaIncendio) {
            elements.btnEmergenciaIncendio.addEventListener('click', emergenciaIncendio);
        }
        if (elements.btnEmergenciaIncendioHistorial) {
            elements.btnEmergenciaIncendioHistorial.addEventListener('click', emergenciaIncendio);
        }
    }

    function handleRegistrar() {
        const nombre = $(selectors.regNombre).value.trim();
        if (nombre === '') {
            alert('Por favor ingresa tu nombre (simulación)');
            return;
        }
        state.datosUsuario.nombre = nombre;
        state.datosUsuario.cerro = $(selectors.regCerro).value;
        state.usuarioRegistrado = true;
        updateUserLocation();
        $(selectors.descripcionReporte).value = '';
        $(selectors.categoriaResiduo).selectedIndex = 0;
        if (elements.previewFoto) elements.previewFoto.innerHTML = '📷 Ninguna imagen seleccionada';
        mostrarPantalla('screenReporte');
    }

    function handleTomarFoto() {
        if (elements.previewFoto) {
            elements.previewFoto.innerHTML = '📸 [Foto capturada] basural ejemplo.jpg ✅';
            state.fotoTomada = true;
        }
    }

    function handleRecargarUbicacion() {
        state.datosUsuario.cerro = getRandomCerro();
        updateUserLocation();
        alert(`Ubicación actualizada a: ${state.datosUsuario.cerro} (simulación GPS)`);
    }

    function handleEnviarReporte() {
        if (!state.usuarioRegistrado) {
            alert('Primero completa el registro.');
            mostrarPantalla('screenRegistro');
            return;
        }
        const categoria = $(selectors.categoriaResiduo).value;
        const descripcion = $(selectors.descripcionReporte).value.trim() || 'Sin descripción detallada';
        const ubicacionCerro = state.datosUsuario.cerro;
        const fotoEstado = state.fotoTomada ? 'Foto simulada adjunta' : 'Sin imagen (mock)';
        agregarReporte(categoria, descripcion, ubicacionCerro, fotoEstado);
        const folioAleatorio = getFolioAleatorio();
        const folioElemento = document.getElementById('folioReporte');
        if (folioElemento) folioElemento.innerText = folioAleatorio;
        mostrarPantalla('screenConfirmacion');
        state.fotoTomada = false;
        if (elements.previewFoto) elements.previewFoto.innerHTML = '📷 Ninguna imagen seleccionada';
        $(selectors.descripcionReporte).value = '';
    }

    function handleNavClick(event) {
        const screenDest = event.currentTarget.getAttribute('data-screen');
        if (screenDest === 'registro') {
            if (state.usuarioRegistrado) {
                alert('Ya estás registrado, puedes reportar o ver historial.');
            } else {
                mostrarPantalla('screenRegistro');
            }
            return;
        }
        if (screenDest === 'reporte') {
            if (!state.usuarioRegistrado) {
                alert('Primero debes completar el registro.');
                mostrarPantalla('screenRegistro');
                return;
            }
            mostrarPantalla('screenReporte');
            updateUserLocation();
            return;
        }
        if (screenDest === 'historial') {
            if (!state.usuarioRegistrado && state.reportesUsuario.length === 0) {
                alert('Regístrate para ver reportes.');
                mostrarPantalla('screenRegistro');
                return;
            }
            mostrarPantalla('screenHistorial');
            return;
        }
    }

    function mostrarPantalla(id) {
        if (!elements.allScreens) return;
        elements.allScreens.forEach(screen => screen?.classList.remove('active-screen'));
        const target = $(id);
        if (target) target.classList.add('active-screen');
        setActiveNav(id);
        if (id === 'screenHistorial') renderizarHistorial();
        if (id === 'screenReporte' && state.usuarioRegistrado) updateUserLocation();
    }

    function setActiveNav(screenId) {
        const navs = document.querySelectorAll('.nav-item');
        navs.forEach(nav => nav.classList.remove('active'));
        if (screenId === 'screenRegistro') document.querySelector('.nav-item[data-screen="registro"]')?.classList.add('active');
        if (screenId === 'screenReporte') document.querySelector('.nav-item[data-screen="reporte"]')?.classList.add('active');
        if (screenId === 'screenHistorial') document.querySelector('.nav-item[data-screen="historial"]')?.classList.add('active');
    }

    function renderizarHistorial() {
        const container = $(selectors.listaReportesDinamica);
        const msgVacio = $(selectors.sinReportesMsg);
        if (!container) return;
        if (state.reportesUsuario.length === 0) {
            if (msgVacio) msgVacio.style.display = 'block';
            container.innerHTML = '';
            return;
        }
        if (msgVacio) msgVacio.style.display = 'none';
        container.innerHTML = state.reportesUsuario.map(rep => {
            const estadoClass = rep.estado === 'Recibido' ? 'estado-recibido' : rep.estado === 'En proceso' ? 'estado-proceso' : 'estado-resuelto';
            return `
                <div class="reporte-item">
                    <div>
                        <strong>#${rep.id}</strong><br>
                        <span class="badge">📅 ${rep.fecha}</span><br>
                        <span>🗑️ ${rep.categoria}</span>
                        <div class="text-muted">${rep.descripcion.substring(0, 45)}${rep.descripcion.length > 45 ? '…' : ''}</div>
                        <div>📍 ${rep.ubicacionCerro}</div>
                        <div class="text-muted">📸 ${rep.fotoSimulada}</div>
                    </div>
                    <div>
                        <span class="estado ${estadoClass}">${rep.estado}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    function agregarReporte(categoria, descripcion, ubicacionCerro, fotoEstado) {
        const newId = (state.reportesUsuario.length + 1).toString().padStart(3, '0');
        const ahora = new Date();
        const fechaStr = `${ahora.getDate()}/${ahora.getMonth() + 1}/${ahora.getFullYear()} ${ahora.getHours()}:${ahora.getMinutes()}`;
        state.reportesUsuario.unshift({
            id: newId,
            fecha: fechaStr,
            categoria,
            descripcion: descripcion || 'Sin descripción adicional',
            estado: 'Recibido',
            ubicacionCerro,
            fotoSimulada: fotoEstado
        });
        renderizarHistorial();
    }

    function updateUserLocation() {
        const spanUbicacion = $(selectors.cerroSeleccionadoUsuario);
        if (spanUbicacion) spanUbicacion.innerText = state.datosUsuario.cerro;
    }

    function getRandomCerro() {
        const cerrosPosibles = ['Cerro Alegre', 'Cerro Concepción', 'Cerro Cordillera', 'Cerro Mariposa', 'Cerro Barón'];
        return cerrosPosibles[Math.floor(Math.random() * cerrosPosibles.length)];
    }

    function getFolioAleatorio() {
        return `VLR-${Math.floor(Math.random() * 900 + 100)}-${new Date().getTime().toString().slice(-4)}`;
    }

    function emergenciaIncendio() {
        alert('🚨 ¡ALERTA DE INCENDIO! 🚨\nEste prototipo simula envío inmediato a bomberos y municipalidad de Valparaíso.\n(Función en Desarrollo)');
    }

    return {
        init,
        mostrarPantalla,
        renderizarHistorial,
        agregarReporte,
        actualizarUbicacionMock: updateUserLocation,
        emergenciaIncendio
    };
})();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ReportApp.init());
} else {
    ReportApp.init();
}

window.ReportApp = ReportApp;
