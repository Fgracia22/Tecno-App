let lugares = [];
let map;
let markers = [];
let selectedCategory = null;
let categoriasGlobal = {}; // Store categories for icon rendering

async function cargarLugares() {
    const response = await fetch('lugares.json');
    lugares = await response.json();
    agrupaCategorias();
    renderCategoryBar();
    renderLugares(lugares);
    ponerMarcadores();
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
            renderLugares(lugares.filter(l => l.categoria === categoria));
            ponerMarcadores();
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
    const random = lugares[Math.floor(Math.random() * lugares.length)];
    alert(`El teu plan sorpresa és: ${random.nombre}!`);
    if (map && random.lat && random.lng) {
        map.setView([random.lat, random.lng], 16);
    }
}

function ponerMarcadores() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    let filtered = lugares;
    if (selectedCategory) {
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

    // Agrupem per categoria
    const categorias = {};
    lugaresFiltrados.forEach(lugar => {
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

        // Espai per posar descripció personalitzada de la categoria
        const catDescription = document.createElement('div');
        catDescription.className = 'categoria-descripcio';
        catDescription.innerHTML = `<p>Explora els llocs destacats dins la categoria <strong>${categoria}</strong>.</p>`;
        catDetails.appendChild(catDescription);

        // Afegim llocs dins de cada categoria
        categorias[categoria].forEach(lugar => {
            const lugarDetails = document.createElement('details');
            lugarDetails.className = 'lugar-dropdown';

            const lugarSummary = document.createElement('summary');
            lugarSummary.textContent = lugar.nombre;

            const lugarContent = document.createElement('div');
            lugarContent.className = 'lugar-content';
            lugarContent.innerHTML = `<p>${lugar.descripcion || 'Sense descripció disponible.'}</p>`;

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