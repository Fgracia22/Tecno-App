let lugares = [];
let map;
let markers = [];

async function cargarLugares() {
    const response = await fetch('lugares.json');
    lugares = await response.json();
    mostrarLugares();
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

// Function to handle the dropdown for each place
function renderLugares(lugares) {
    const list = document.getElementById('lugares-list');
    list.innerHTML = '';
    lugares.forEach(lugar => {
        const details = document.createElement('details');
        details.className = 'lugar-dropdown';

        const summary = document.createElement('summary');
        summary.textContent = lugar.nombre;

        const content = document.createElement('div');
        content.className = 'lugar-content';
        content.innerHTML = `
            <p>${lugar.descripcion}</p>
            <!-- Add more fields as needed -->
        `;

        details.appendChild(summary);
        details.appendChild(content);
        list.appendChild(details);
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