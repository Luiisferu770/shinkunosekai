const urlParams = new URLSearchParams(window.location.search);
const animeNombre = urlParams.get("anime");
const episodioNumero = parseInt(urlParams.get("ep"));

fetch("animes.json")
    .then(response => response.json())
    .then(data => {
        const anime = data.find(a => a.nombre === animeNombre);

        if (anime) {
            const episodio = anime.episodios.find(ep => ep.numero === episodioNumero);

            if (episodio) {
                document.getElementById("episodio-info").innerHTML = `
                    <h1>${anime.nombre} - Episodio ${episodio.numero}</h1>
                    <h2>${episodio.titulo}</h2>
                    <p>${episodio.descripcion}</p>
                `;

                document.getElementById("volver-anime").href = `ver.htm?id=${encodeURIComponent(anime.nombre)}`;
            } else {
                document.getElementById("episodio-info").innerHTML = "<p>Episodio no encontrado.</p>";
            }
        } else {
            document.getElementById("episodio-info").innerHTML = "<p>Anime no encontrado.</p>";
        }
    })
    .catch(error => console.error("Error cargando el JSON:", error));
