const pokemonList = document.getElementById('pokemonList');
const searchInput = document.getElementById('searchInput');
const pokemonModal = new bootstrap.Modal(document.getElementById('pokemonModal'));

let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Cargar los primeros 10 Pokemones al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    fetchPokemons();
    mostrarFavoritos();
});

// Fetch de los Pokemones
async function fetchPokemons(query = '') {
    let url = 'https://pokeapi.co/api/v2/pokemon?limit=10';
    if (query) {
        url = `https://pokeapi.co/api/v2/pokemon/${query}`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        pokemonList.innerHTML = ''; // Limpiar la lista antes de mostrar nuevos resultados
        if (query) {
            mostrarPokemon(data);
        } else {
            data.results.forEach(async (pokemon) => {
                const pokemonData = await fetch(pokemon.url).then(res => res.json());
                mostrarPokemon(pokemonData);
            });
        }
    } catch (error) {
        console.error('Error al cargar los Pokemones:', error);
    }
}

function mostrarPokemon(pokemon) {
    const col = document.createElement('div');
    col.classList.add('col-md-4');
    
    col.innerHTML = `
        <div class="card">
            <img src="${pokemon.sprites.front_default}" class="card-img-top" alt="${pokemon.name}">
            <div class="card-body text-center">
                <h5 class="card-title text-capitalize">${pokemon.name}</h5>
                <div class="btn-group d-flex justify-content-center">
                    <button class="btn btn-primary btn-sm btn-details mx-1" onclick="verDetalles(${pokemon.id})">Detalles</button>
                    <button class="btn btn-warning btn-sm btn-favorite mx-1" onclick="toggleFavorito(${pokemon.id}, '${pokemon.name}')">
                        ${esFavorito(pokemon.id) ? '- Favoritos' : '+ Favoritos'}
                    </button>
                </div>
            </div>
        </div>
    `;

    pokemonList.appendChild(col);
}


// Ver detalles del Pokémon
function verDetalles(id) {
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        .then(response => response.json())
        .then(pokemon => {
            // Actualizar los detalles del modal con la información del Pokémon
            document.getElementById('pokemonImage').src = pokemon.sprites.front_default;
            document.getElementById('pokemonName').textContent = pokemon.name;

            // Detalles del Pokémon: habilidades, altura y peso
            const abilities = pokemon.abilities.map(ability => ability.ability.name).join(', ');
            const height = pokemon.height;
            const weight = pokemon.weight;

            document.getElementById('pokemonDetails').innerHTML = `
                <p><strong>Habilidades:</strong> ${abilities}</p>
                <p><strong>Altura:</strong> ${height / 10} m</p>
                <p><strong>Peso:</strong> ${weight / 10} kg</p>
            `;

            // Mostrar el modal
            const modal = new bootstrap.Modal(document.getElementById('pokemonModal'));
            modal.show();
        });
}


// Buscar Pokémon por nombre
searchInput.addEventListener('keyup', () => {
    const query = searchInput.value.trim().toLowerCase();
    if (query) {
        fetchPokemons(query);
    } else {
        fetchPokemons();
    }
});

// Función para guardar o quitar Pokémones de favoritos
function toggleFavorito(id, name) {
    let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

    // Si el Pokémon ya está en favoritos, lo quitamos; si no, lo añadimos
    if (favoritos.some(pokemon => pokemon.id === id)) {
        favoritos = favoritos.filter(pokemon => pokemon.id !== id);
    } else {
        favoritos.push({ id, name });
    }

    // Guardar de nuevo en localStorage
    localStorage.setItem('favoritos', JSON.stringify(favoritos));

    // Actualizar la sección de favoritos
    mostrarFavoritos();
}

// Verificar si un Pokémon es favorito
function esFavorito(id) {
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    return favoritos.some(pokemon => pokemon.id === id);
}

// Mostrar la lista de Pokémones favoritos
function mostrarFavoritos() {
    const listaFavoritos = document.getElementById('listaFavoritos');
    listaFavoritos.innerHTML = ''; // Limpiar lista

    // Recuperar los favoritos del localStorage
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

    // Si no hay favoritos, mostrar un mensaje
    if (favoritos.length === 0) {
        listaFavoritos.innerHTML = '<p>No tienes Pokémones favoritos.</p>';
        return;
    }

    // Mostrar cada Pokémon favorito
    favoritos.forEach(favorito => {
        fetch(`https://pokeapi.co/api/v2/pokemon/${favorito.id}`)
            .then(response => response.json())
            .then(pokemon => {
                const col = document.createElement('div');
                col.classList.add('col-md-4', 'mb-4');

                col.innerHTML = `
                    <div class="card">
                        <img src="${pokemon.sprites.front_default}" class="card-img-top" alt="${pokemon.name}">
                        <div class="card-body text-center">
                            <h5 class="card-title text-capitalize">${pokemon.name}</h5>
                            <button class="btn btn-warning btn-favorite" onclick="toggleFavorito(${pokemon.id}, '${pokemon.name}')">${esFavorito(pokemon.id) ? 'Quitar de Favoritos' : 'Agregar a Favoritos'}</button>
                        </div>
                    </div>
                `;

                listaFavoritos.appendChild(col);
            });
    });
}




