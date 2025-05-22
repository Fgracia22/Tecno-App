let lugares = [];
let map;
let markers = [];
let selectedCategory = null;
let categoriasGlobal = {}; // Store categories for icon rendering

// Add this helper function:
function getBoundsForLugares(lugaresArr) {
    const points = lugaresArr.filter(l => l.lat && l.lng).map(l => [l.lat, l.lng]);
    if (points.length === 0) return null;
    return L.latLngBounds(points);
}

async function cargarLugares() {
    const response = await fetch('lugares.json');
    lugares = await response.json();
    agrupaCategorias();
    renderCategoryBar();
    renderLugares(lugares);
    ponerMarcadores();
    // Fit map to all points
    const bounds = getBoundsForLugares(lugares);
    if (bounds) map.fitBounds(bounds, { padding: [30, 30] });
}

function agrupaCategorias() {
    categoriasGlobal = {};
    lugares.forEach(lugar => {
        if (!categoriasGlobal[lugar.categoria]) {
            categoriasGlobal[lugar.categoria] = [];
        }
        categoriasGlobal[lugar.categoria].push(lugar);
    });
}

function renderCategoryBar() {
    const bar = document.getElementById('category-bar');
    bar.innerHTML = '';

    // Prepare for images: use emoji or image URL
    const iconMap = {
        'Natura': { emoji: '🌳', img: 'img/natura.png' },
        'Restauració': { emoji: '🍽️', img: 'img/restauracio.png' },
        'Cultura': { emoji: '🏛️', img: 'img/cultura.png' },
        'Allotjament': { emoji: '🏨', img: 'img/allotjament.png' },
        'Botigues': { emoji: '🏪', img: 'img/botiga.png' },
        'Serveis': { emoji: '⭐', img: 'img/serveis.png' },
        // Add more as needed
    };

    // "All" button
    const allBtn = document.createElement('div');
    allBtn.className = 'category-icon' + (selectedCategory === null ? ' selected' : '');
    allBtn.title = 'Totes les categories';
    allBtn.textContent = '🔎';
    bar.appendChild(allBtn);
    allBtn.addEventListener('click', () => {
        selectedCategory = null;
        renderCategoryBar();
        renderLugares(lugares);
        ponerMarcadores();
        // Fit map to all points
        const bounds = getBoundsForLugares(lugares);
        if (bounds) map.fitBounds(bounds, { padding: [30, 30] });
    });

    Object.keys(categoriasGlobal).forEach(categoria => {
        const icon = document.createElement('div');
        icon.className = 'category-icon' + (selectedCategory === categoria ? ' selected' : '');
        icon.title = categoria;

        // Mostra la imatge si existeix, sinó mostra l’emoji
        if (iconMap[categoria]?.img) {
            const img = document.createElement('img');
            img.src = iconMap[categoria].img;
            img.alt = categoria;
            icon.appendChild(img);
        } else {
            icon.textContent = iconMap[categoria]?.emoji || '📍';
        }

        icon.addEventListener('click', () => {
            selectedCategory = categoria;
            renderCategoryBar();
            const filtered = lugares.filter(l => l.categoria === categoria);
            renderLugares(filtered);
            ponerMarcadores();
            // Fit map to category points
            const bounds = getBoundsForLugares(filtered);
            if (bounds) map.fitBounds(bounds, { padding: [30, 30] });
        });
        bar.appendChild(icon);
    });
}

function mostrarLugares() {
    const lista = document.getElementById('lugares-list');
    lista.innerHTML = '';
    lugares.forEach(lugar => {
        const li = document.createElement('li');
        li.textContent = `${lugar.nombre} - ${lugar.categoria}`;
        lista.appendChild(li);
    });
}

function planSorpresa() {
    if (lugares.length === 0) return;

    // Filtra per categories principals
    const visitar = lugares.filter(l => l.categoria === 'Cultura' || l.categoria === 'Natura');
    const menjar = lugares.filter(l => l.categoria === 'Restauració');
    const dormir = lugares.filter(l => l.categoria === 'Allotjament');

    // Si falta alguna categoria, mostra un missatge d'error
    if (visitar.length === 0 || menjar.length === 0 || dormir.length === 0) {
        alert('No hi ha prou llocs per fer un pla complet!');
        return;
    }

    // Tria un lloc aleatori de cada categoria
    const llocVisitar = visitar[Math.floor(Math.random() * visitar.length)];
    const llocMenjar = menjar[Math.floor(Math.random() * menjar.length)];
    const llocDormir = dormir[Math.floor(Math.random() * dormir.length)];

    // Missatges personalitzats
    const missatge =
        `El teu pla sorpresa per avui:\n\n` +
        `🌄 Visitar: ${llocVisitar.nombre}\n   ➔ ${llocVisitar.descripcion}\n\n` +
        `🍽️ Menjar a: ${llocMenjar.nombre}\n   ➔ ${llocMenjar.descripcion}\n\n` +
        `🏨 Dormir a: ${llocDormir.nombre}\n   ➔ ${llocDormir.descripcion}`;

    alert(missatge);

    // Deselect category and show only the 3 chosen places
    selectedCategory = null;
    renderCategoryBar();

    // Mostra només els 3 llocs triats
    const seleccionats = [llocVisitar, llocMenjar, llocDormir];
    renderLugares(seleccionats);
    ponerMarcadores(seleccionats);

    // Centra el mapa al mig dels 3 punts
    const bounds = getBoundsForLugares(seleccionats);
    if (map && bounds) {
        map.fitBounds(bounds, { padding: [30, 30] });
    }
}

function ponerMarcadores(lugaresArr) {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    let filtered = lugaresArr || lugares;
    if (!lugaresArr && selectedCategory) {
        filtered = lugares.filter(l => l.categoria === selectedCategory);
    }
    filtered.forEach(lugar => {
        if (lugar.lat && lugar.lng) {
            const marker = L.marker([lugar.lat, lugar.lng])
                .addTo(map)
                .bindPopup(`<b>${lugar.nombre}</b><br>${lugar.categoria}`);
            markers.push(marker);
        }
    });
}

function initMap() {
    map = L.map('map').setView([41.8777, 2.8936], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    cargarLugares();
}

function renderLugares(lugaresFiltrados) {
    const list = document.getElementById('lugares-list');
    list.innerHTML = '';

    if (selectedCategory === null) {
        // Agrupem per categoria i fem desplegables
        const categorias = {};
        lugaresFiltrados.forEach(lugar => {
            if (!categorias[lugar.categoria]) {
                categorias[lugar.categoria] = [];
            }
            categorias[lugar.categoria].push(lugar);
        });

        Object.keys(categorias).forEach(categoria => {
            const catDetails = document.createElement('details');
            catDetails.className = 'categoria-dropdown';

            const catSummary = document.createElement('summary');
            catSummary.textContent = categoria;
            catDetails.appendChild(catSummary);

            const catDescription = document.createElement('div');
            catDescription.className = 'categoria-descripcio';
            catDescription.innerHTML = `<p>Explora els llocs destacats dins la categoria <strong>${categoria}</strong>.</p>`;
            catDetails.appendChild(catDescription);

            categorias[categoria].forEach(lugar => {
                const lugarDetails = document.createElement('details');
                lugarDetails.className = 'lugar-dropdown';

                const lugarSummary = document.createElement('summary');
                lugarSummary.textContent = lugar.nombre;

                lugarSummary.addEventListener('click', (e) => {
                    if (map && lugar.lat && lugar.lng) {
                        map.setView([lugar.lat, lugar.lng], 16, { animate: true });
                    }
                });

                const lugarContent = document.createElement('div');
                lugarContent.className = 'lugar-content';
                lugarContent.innerHTML = `<p>${lugar.descripcion || 'Sense descripció disponible.'}</p>`;

                lugarDetails.appendChild(lugarSummary);
                lugarDetails.appendChild(lugarContent);
                catDetails.appendChild(lugarDetails);
            });

            list.appendChild(catDetails);
        });
    } else {
        // Mostra només els dropdowns dels llocs d'aquesta categoria, sense el dropdown gran de categoria
        lugaresFiltrados.forEach(lugar => {
            const lugarDetails = document.createElement('details');
            lugarDetails.className = 'lugar-dropdown';

            const lugarSummary = document.createElement('summary');
            lugarSummary.textContent = lugar.nombre;

            lugarSummary.addEventListener('click', (e) => {
                if (map && lugar.lat && lugar.lng) {
                    map.setView([lugar.lat, lugar.lng], 16, { animate: true });
                }
            });

            const lugarContent = document.createElement('div');
            lugarContent.className = 'lugar-content';
            lugarContent.innerHTML = `<p>${lugar.descripcion || 'Sense descripció disponible.'}</p>`;

            lugarDetails.appendChild(lugarSummary);
            lugarDetails.appendChild(lugarContent);
            list.appendChild(lugarDetails);
        });
    }
}




document.getElementById('sorpresaBtn').addEventListener('click', planSorpresa);

window.addEventListener('DOMContentLoaded', initMap);

// Service Worker registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    });
}