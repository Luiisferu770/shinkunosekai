document.addEventListener("DOMContentLoaded", function () {

    /* =========================
       1️⃣ CARRUSEL HERO
    ========================== */

    const slides = document.querySelectorAll(".carousel-item");
    const prevButton = document.querySelector(".prev");
    const nextButton = document.querySelector(".next");
    const dotsContainer = document.querySelector(".carousel-dots");

    if (slides.length > 0) {

        let currentIndex = 0;
        let autoSlideInterval;

        // Genera los puntos del carrusel
        if (dotsContainer) {
            dotsContainer.innerHTML = "";
            slides.forEach((_, i) => {
                const dot = document.createElement("span");
                if (i === 0) dot.classList.add("active");
                dot.addEventListener("click", () => {
                    goToSlide(i);
                    resetAutoSlide();
                });
                dotsContainer.appendChild(dot);
            });
        }

        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.toggle("active", i === index);
            });
            if (dotsContainer) {
                dotsContainer.querySelectorAll("span").forEach((dot, i) => {
                    dot.classList.toggle("active", i === index);
                });
            }
        }

        function goToSlide(index) {
            currentIndex = index;
            showSlide(currentIndex);
        }

        function nextSlide() {
            currentIndex = (currentIndex + 1) % slides.length;
            showSlide(currentIndex);
        }

        function prevSlide() {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            showSlide(currentIndex);
        }

        function startAutoSlide() {
            autoSlideInterval = setInterval(nextSlide, 8000);
        }

        function resetAutoSlide() {
            clearInterval(autoSlideInterval);
            startAutoSlide();
        }

        if (prevButton) {
            prevButton.addEventListener("click", () => {
                prevSlide();
                resetAutoSlide();
            });
        }

        if (nextButton) {
            nextButton.addEventListener("click", () => {
                nextSlide();
                resetAutoSlide();
            });
        }

        showSlide(currentIndex);
        startAutoSlide();
    }


    /* =========================
       2️⃣ MENÚ HAMBURGUESA
    ========================== */

    const toggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".nav-menu");

    if (toggle && nav) {
        toggle.addEventListener("click", () => {
            nav.classList.toggle("active");
        });

        document.querySelectorAll(".nav-menu a").forEach(link => {
            link.addEventListener("click", () => {
                nav.classList.remove("active");
            });
        });
    }


    /* =========================
       3️⃣ CARGAR ANIMES + FLIP
    ========================== */

    const container = document.querySelector(".anime-container");

    if (container) {
        // data-source: archivo JSON a cargar (por defecto animes.json)
        // data-target: página de detalle a la que apunta cada tarjeta (por defecto ver.html)
        const fuenteJson = container.dataset.source || "animes.json";
        const paginaDestino = container.dataset.target || "ver.html";

        fetch(fuenteJson)
            .then(response => response.json())
            .then(data => {
                container.innerHTML = "";

                data.forEach((anime, index) => {
                    let rutaImagen = anime.imagen;
                    if (rutaImagen && !rutaImagen.startsWith("img/")) {
                        rutaImagen = `img/${rutaImagen}`;
                    }
                    if (!anime.imagen || anime.imagen === "img") {
                        rutaImagen = "img/placeholder.jpg";
                    }

                    let rutaFondo = anime.fondo || rutaImagen;
                    if (rutaFondo && !rutaFondo.startsWith("img/")) {
                        rutaFondo = `img/${rutaFondo}`;
                    }

                    const card = document.createElement("div");
                    card.classList.add("flip-card");
                    card.dataset.titulo = anime.titulo.toLowerCase();
                    card.style.transitionDelay = `${Math.min(index * 0.05, 1)}s`;

                    card.innerHTML = `
                        <div class="flip-inner">
                            <div class="flip-front">
                                <img src="${rutaImagen}" alt="${anime.titulo}" loading="lazy"
                                     onerror="handleImgError(this, '${anime.titulo.replace(/'/g, "\\'")}')">
                            </div>
                            <div class="flip-back">
                                <div class="flip-bg" style="background-image: url('${rutaFondo}')"></div>
                                <div class="overlay">
                                    <h3>${anime.titulo}</h3>
                                    <p>${anime.descripcion}</p>
                                    <button onclick="verAnime('${anime.titulo.replace(/'/g, "\\'")}', '${paginaDestino}')">
                                        Comenzar a ver
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    container.appendChild(card);

                    // Verifica el fondo; si falla, usa placeholder generado
                    const flipBgEl = card.querySelector(".flip-bg");
                    precargarOFallback(rutaFondo, anime.titulo, (urlFinal) => {
                        flipBgEl.style.backgroundImage = `url('${urlFinal}')`;
                    });
                });

                activarObserver();
            })
            .catch(error => console.error(`Error cargando ${fuenteJson}:`, error));
    }

    /* =========================
       4️⃣ FLIP EN MÓVIL
    ========================== */

    document.addEventListener("click", function (e) {

        const clickedCard = e.target.closest(".flip-card");

        document.querySelectorAll(".flip-inner").forEach(inner => {
            if (!clickedCard || !inner.contains(clickedCard)) {
                inner.classList.remove("flip-mobile");
            }
        });

        if (clickedCard) {
            const inner = clickedCard.querySelector(".flip-inner");
            inner.classList.toggle("flip-mobile");
        }

    });


    /* =========================
       5️⃣ OBSERVER ANIMACIÓN
    ========================== */

    function activarObserver() {
        const cards = document.querySelectorAll(".flip-card");
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show");
                }
            });
        }, { threshold: 0.15 });

        cards.forEach(card => observer.observe(card));
    }


    /* =========================
       6️⃣ BUSCADOR DEL HEADER (todas las páginas)
       Busca en animes.json + peliculas.json a la vez
    ========================== */

    const buscadorHeader = document.getElementById("buscador-header");
    const headerResultsList = document.getElementById("header-search-results");

    if (buscadorHeader && headerResultsList) {

        let catalogoCache = null;

        Promise.all([
            fetch("animes.json").then(r => r.json()).catch(() => []),
            fetch("peliculas.json").then(r => r.json()).catch(() => [])
        ]).then(([animes, peliculas]) => {
            catalogoCache = [
                ...animes.map(a => ({ ...a, _tipo: "anime" })),
                ...peliculas.map(p => ({ ...p, _tipo: "pelicula" }))
            ];
        });

        buscadorHeader.addEventListener("input", () => {
            const texto = buscadorHeader.value.trim().toLowerCase();

            if (!texto) {
                headerResultsList.classList.remove("show");
                headerResultsList.innerHTML = "";
                return;
            }

            if (!catalogoCache) return;

            const coincidencias = catalogoCache
                .filter(a => a.titulo.toLowerCase().includes(texto))
                .slice(0, 8);

            headerResultsList.innerHTML = "";

            if (coincidencias.length === 0) {
                headerResultsList.innerHTML = `<div class="search-result-empty">Sin resultados para "${buscadorHeader.value}"</div>`;
            } else {
                coincidencias.forEach(item => {
                    let rutaImagen = item.imagen;
                    if (rutaImagen && !rutaImagen.startsWith("img/")) {
                        rutaImagen = `img/${rutaImagen}`;
                    }

                    const destino = item._tipo === "pelicula" ? "ver-pelicula.html" : "ver.html";
                    const etiqueta = item._tipo === "pelicula" ? " 🎬" : "";

                    const a = document.createElement("a");
                    a.classList.add("search-result-item");
                    a.href = `${destino}?titulo=${encodeURIComponent(item.titulo)}`;
                    a.innerHTML = `
                        <img src="${rutaImagen}" alt="${item.titulo}" loading="lazy"
                             onerror="handleImgError(this, '${item.titulo.replace(/'/g, "\\'")}')">
                        <span>${item.titulo}${etiqueta}</span>
                    `;
                    headerResultsList.appendChild(a);
                });
            }

            headerResultsList.classList.add("show");
        });

        document.addEventListener("click", (e) => {
            if (!e.target.closest(".nav-search")) {
                headerResultsList.classList.remove("show");
            }
        });
    }


    /* =========================
       8️⃣ FILAS HORIZONTALES (Home estilo streaming)
       "Nuestras Recomendaciones", "Recién Agregados", "Populares", "Películas"
    ========================== */

    initRowCarousels();


    /* =========================
       9️⃣ SESIÓN DE PRUEBA (LOGIN)
    ========================== */

    actualizarEstadoSesion();

});


function initRowCarousels() {

    const filas = document.querySelectorAll(".row-carousel");
    if (!filas.length) return;

    Promise.all([
        fetch("animes.json").then(r => r.json()).catch(() => []),
        fetch("peliculas.json").then(r => r.json()).catch(() => [])
    ]).then(([animes, peliculas]) => {

        filas.forEach(fila => {
            const track = fila.querySelector(".row-track");
            const esPeliculas = fila.dataset.source === "peliculas";
            const catalogo = esPeliculas ? peliculas : animes;
            const destino = esPeliculas ? "ver-pelicula.html" : "ver.html";

            let items;

            if (fila.dataset.titles) {
                // Lista curada de títulos específicos (recomendaciones, populares, etc.)
                const listaTitulos = fila.dataset.titles.split(",").map(t => t.trim().toLowerCase());
                items = listaTitulos
                    .map(t => catalogo.find(x => x.titulo.toLowerCase() === t))
                    .filter(Boolean);
            } else {
                // Sin lista curada: toma los primeros N del catálogo
                const limite = parseInt(fila.dataset.limit) || 14;
                items = catalogo.slice(0, limite);
            }

            track.innerHTML = "";

            items.forEach(item => {
                let rutaImagen = item.imagen;
                if (rutaImagen && !rutaImagen.startsWith("img/")) {
                    rutaImagen = `img/${rutaImagen}`;
                }

                const card = document.createElement("div");
                card.classList.add("row-card");
                card.innerHTML = `
                    <img src="${rutaImagen}" alt="${item.titulo}" loading="lazy"
                         onerror="handleImgError(this, '${item.titulo.replace(/'/g, "\\'")}')">
                    <div class="row-card-label">${item.titulo}</div>
                `;
                card.addEventListener("click", () => {
                    location.assign(`${destino}?titulo=${encodeURIComponent(item.titulo)}`);
                });
                track.appendChild(card);
            });

            // Botones de flecha (desktop)
            const prevBtn = fila.querySelector(".row-prev");
            const nextBtn = fila.querySelector(".row-next");
            const distancia = 340;

            if (prevBtn) {
                prevBtn.addEventListener("click", () => {
                    track.scrollBy({ left: -distancia, behavior: "smooth" });
                });
            }
            if (nextBtn) {
                nextBtn.addEventListener("click", () => {
                    track.scrollBy({ left: distancia, behavior: "smooth" });
                });
            }

            // Arrastre manual con el mouse (drag-to-scroll), como Crunchyroll/Netflix
            let arrastrando = false;
            let xInicial = 0;
            let scrollInicial = 0;

            track.addEventListener("mousedown", (e) => {
                arrastrando = true;
                track.classList.add("dragging");
                xInicial = e.pageX;
                scrollInicial = track.scrollLeft;
            });

            ["mouseleave", "mouseup"].forEach(evento => {
                track.addEventListener(evento, () => {
                    arrastrando = false;
                    track.classList.remove("dragging");
                });
            });

            track.addEventListener("mousemove", (e) => {
                if (!arrastrando) return;
                e.preventDefault();
                const diferencia = e.pageX - xInicial;
                track.scrollLeft = scrollInicial - diferencia;
            });
        });
    });
}


/* =========================
   IMÁGENES FALTANTES → PLACEHOLDER BONITO
   En vez del ícono roto de "imagen no encontrada", generamos
   una tarjeta con el título del anime mientras subes la imagen real.
========================= */

function envolverTexto(texto, maxCaracteres) {
    const palabras = texto.split(" ");
    const lineas = [];
    let lineaActual = "";

    palabras.forEach(palabra => {
        if ((lineaActual + " " + palabra).trim().length > maxCaracteres) {
            lineas.push(lineaActual.trim());
            lineaActual = palabra;
        } else {
            lineaActual = (lineaActual + " " + palabra).trim();
        }
    });
    if (lineaActual) lineas.push(lineaActual.trim());
    return lineas;
}

function placeholderDataUri(titulo) {
    const lineas = envolverTexto(titulo || "Sin título", 16).slice(0, 4);
    const inicioY = 250 - (lineas.length - 1) * 16;
    const tspans = lineas
        .map((linea, i) => `<tspan x="200" y="${inicioY + i * 32}">${linea}</tspan>`)
        .join("");

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="500">
            <defs>
                <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#ff00ff"/>
                    <stop offset="100%" stop-color="#00ffff"/>
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="#0d1330"/>
            <rect width="100%" height="100%" fill="url(#g)" opacity="0.12"/>
            <text fill="white" font-size="24" font-family="Poppins, Arial, sans-serif"
                  font-weight="bold" text-anchor="middle">${tspans}</text>
        </svg>
    `.trim();

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function handleImgError(imgEl, titulo) {
    imgEl.onerror = null;
    imgEl.src = placeholderDataUri(titulo);
}

function precargarOFallback(url, titulo, callback) {
    const test = new Image();
    test.onload = () => callback(url);
    test.onerror = () => callback(placeholderDataUri(titulo));
    test.src = url;
}


/* =========================
   VER ANIME
========================= */

function verAnime(nombre, pagina) {
    const destino = pagina || "ver.html";
    location.assign(`${destino}?titulo=${encodeURIComponent(nombre)}`);
}


/* =========================
   SESIÓN DE PRUEBA — helpers globales
   (usan localStorage, así que la "sesión" vive en el navegador del usuario)
========================= */

function iniciarSesionDemo(nombre) {
    const usuario = (nombre && nombre.trim()) || "Invitado";
    localStorage.setItem("shinkuUsuarioDemo", usuario);
    actualizarEstadoSesion();
}

function cerrarSesionDemo() {
    localStorage.removeItem("shinkuUsuarioDemo");
    actualizarEstadoSesion();
    if (document.getElementById("logged-in-box")) {
        location.assign("login.html");
    }
}

function obtenerUsuarioDemo() {
    return localStorage.getItem("shinkuUsuarioDemo");
}

function actualizarEstadoSesion() {
    const navLogin = document.getElementById("nav-login");
    const usuario = obtenerUsuarioDemo();

    if (navLogin) {
        const link = navLogin.querySelector("a");
        if (usuario) {
            navLogin.classList.add("logged-in");
            if (link) {
                link.textContent = `👤 ${usuario}`;
                link.href = "login.html";
            }
        } else {
            navLogin.classList.remove("logged-in");
            if (link) {
                link.textContent = "Iniciar Sesion";
                link.href = "login.html";
            }
        }
    }

    // Si estamos en login.html, mostramos el estado correcto
    const loginForm = document.getElementById("login-form-box");
    const loggedBox = document.getElementById("logged-in-box");

    if (loginForm && loggedBox) {
        if (usuario) {
            loginForm.style.display = "none";
            loggedBox.style.display = "block";
            const nombreSpan = document.getElementById("nombre-usuario-demo");
            const avatarSpan = document.getElementById("avatar-usuario-demo");
            if (nombreSpan) nombreSpan.textContent = usuario;
            if (avatarSpan) avatarSpan.textContent = usuario.charAt(0).toUpperCase();
        } else {
            loginForm.style.display = "block";
            loggedBox.style.display = "none";
        }
    }
}


