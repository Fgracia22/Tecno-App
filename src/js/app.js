let lugares = [];
let map;
let markers = [];

async function cargarLugares() {
    const response = await fetch('lugares.json');
    lugares = await response.json();
    renderLugares(lugares);  // <--- aquí!
    ponerMarcadores();
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
    const random = lugares[Math.floor(Math.random() * lugares.length)];
    alert(`El teu plan sorpresa és: ${random.nombre}!`);
    if (map && random.lat && random.lng) {
        map.setView([random.lat, random.lng], 16);
    }
}

function ponerMarcadores() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    lugares.forEach(lugar => {
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


function renderLugares(lugares) {
    const list = document.getElementById('lugares-list');
    list.innerHTML = '';

    // Agrupem per categoria
    const categorias = {};
    lugares.forEach(lugar => {
        if (!categorias[lugar.categoria]) {
            categorias[lugar.categoria] = [];
        }
        categorias[lugar.categoria].push(lugar);
    });

    // Creem desplegables per cada categoria
    Object.keys(categorias).forEach(categoria => {
        const catDetails = document.createElement('details');
        catDetails.className = 'categoria-dropdown';
        const catSummary = document.createElement('summary');
        catSummary.textContent = categoria;
        catDetails.appendChild(catSummary);

        categorias[categoria].forEach(lugar => {
            const lugarDetails = document.createElement('details');
            lugarDetails.className = 'lugar-dropdown';

            const lugarSummary = document.createElement('summary');
            lugarSummary.textContent = lugar.nombre;

            const lugarContent = document.createElement('div');
            lugarContent.className = 'lugar-content';
            lugarContent.innerHTML = `<p>${lugar.descripcion || ''}</p>`;

            lugarDetails.appendChild(lugarSummary);
            lugarDetails.appendChild(lugarContent);
            catDetails.appendChild(lugarDetails);
        });

        list.appendChild(catDetails);
    });
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