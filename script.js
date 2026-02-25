document.addEventListener("DOMContentLoaded", function () {

    /* =========================
       1️⃣ CARRUSEL
    ========================== */

    const slides = document.querySelectorAll(".carousel-item");
    const prevButton = document.querySelector(".prev");
    const nextButton = document.querySelector(".next");

    if (slides.length > 0 && prevButton && nextButton) {

        let currentIndex = 0;
        let autoSlideInterval;

        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.style.display = i === index ? "flex" : "none";
            });
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
            autoSlideInterval = setInterval(nextSlide, 15000);
        }

        function resetAutoSlide() {
            clearInterval(autoSlideInterval);
            startAutoSlide();
        }

        prevButton.addEventListener("click", () => {
            prevSlide();
            resetAutoSlide();
        });

        nextButton.addEventListener("click", () => {
            nextSlide();
            resetAutoSlide();
        });

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
   3️⃣ CARGAR ANIMES + FLIP (CORREGIDO)
========================== */

const container = document.querySelector(".anime-container");

if (container) {
    fetch("animes.json")
        .then(response => response.json())
        .then(data => {
            container.innerHTML = "";

            data.forEach((anime, index) => {
                // VALIDACIÓN DE RUTA: 
                // Si la imagen no empieza con "img/", se lo agregamos automáticamente
                let rutaImagen = anime.imagen;
                if (rutaImagen && !rutaImagen.startsWith("img/")) {
                    rutaImagen = `img/${rutaImagen}`;
                }

                // Si no hay imagen o el campo está vacío, ponemos una por defecto
                if (!anime.imagen || anime.imagen === "img") {
                    rutaImagen = "img/placeholder.jpg"; // Crea una imagen genérica para errores
                }

                let rutaFondo = anime.fondo || rutaImagen; // Si no hay fondo, usa la portada
                if (rutaFondo && !rutaFondo.startsWith("img/")) {
                    rutaFondo = `img/${rutaFondo}`;
                }

                const card = document.createElement("div");
                card.classList.add("flip-card");
                card.style.transitionDelay = `${index * 0.1}s`;

                card.innerHTML = `
                    <div class="flip-inner">
                        <div class="flip-front">
                            <img src="${rutaImagen}" alt="${anime.titulo}">
                        </div>
                        <div class="flip-back" style="background-image: url('${rutaFondo}')">
                            <div class="overlay">
                                <h3>${anime.titulo}</h3>
                                <p>${anime.descripcion}</p>
                                <button onclick="verAnime('${anime.titulo}')">
                                    Comenzar a ver
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });

            activarObserver();
        })
        .catch(error => console.error("Error cargando JSON:", error));
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

});


/* =========================
   VER ANIME
========================= */

function verAnime(nombre) {
    location.assign(`ver.html?id=${encodeURIComponent(nombre)}`);
}