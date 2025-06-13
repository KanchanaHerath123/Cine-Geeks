const api = "2b2aa1ab8eeb3f5a2e5e841549c8f078";

const popularMoviesDiv = document.getElementById("popular-movies");
const popularTitle = document.getElementById("popular-title");

const similarMoviesDiv = document.getElementById("similar-movies");
const similarTitle = document.getElementById("similar-title");

const suggestionsDiv = document.getElementById("suggestions");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const movieDetailsDiv = document.getElementById("movie-details");

// Show popular movies on page load
window.onload = () => {
  loadPopularMovies();
};

// Load popular movies (top 10)
function loadPopularMovies() {
  fetch(
    `https://api.themoviedb.org/3/movie/popular?api_key=${api}&language=en-US&page=1`
  )
    .then((res) => res.json())
    .then((data) => {
      const movies = data.results.slice(0, 10);
      renderMoviesGrid(movies, popularMoviesDiv);
      popularTitle.style.display = "block";
      popularMoviesDiv.style.display = "grid";

      // Hide details and similar movies on load
      movieDetailsDiv.style.display = "none";
      similarMoviesDiv.style.display = "none";
      similarTitle.style.display = "none";
    })
    .catch(() => {
      popularMoviesDiv.innerHTML = "<p>Error loading popular movies.</p>";
    });
}

// Render movies grid
function renderMoviesGrid(movies, container) {
  container.innerHTML = "";
  movies.forEach((movie) => {
    const card = document.createElement("div");
    card.className = "movie-card";
    card.title = movie.title;

    const imgSrc = movie.poster_path
      ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
      : "";

    card.innerHTML = `
      <img src="${imgSrc}" alt="${movie.title}" />
      <div class="movie-title">${movie.title}</div>
    `;

    card.addEventListener("click", () => {
      getMovieDetails(movie.id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    container.appendChild(card);
  });
}

// Search button click or Enter keypress
searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query.length > 0) {
    searchMovies(query);
  }
});

searchInput.addEventListener("keyup", (e) => {
  const query = searchInput.value.trim();

  if (query.length > 0) {
    showSuggestions(query);
  } else {
    suggestionsDiv.innerHTML = "";
    suggestionsDiv.style.display = "none";
  }

  if (e.key === "Enter") {
    e.preventDefault();
    searchBtn.click();
    suggestionsDiv.innerHTML = "";
    suggestionsDiv.style.display = "none";
  }
});

// Show suggestions below input
function showSuggestions(query) {
  fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${api}&language=en-US&query=${encodeURIComponent(
      query
    )}&page=1&include_adult=false`
  )
    .then((res) => res.json())
    .then((data) => {
      const movies = data.results.slice(0, 5);
      if (movies.length === 0) {
        suggestionsDiv.style.display = "none";
        return;
      }
      suggestionsDiv.innerHTML = "";
      movies.forEach((movie) => {
        const div = document.createElement("div");
        div.className = "suggestion-item";
        div.textContent = movie.title;
        div.addEventListener("click", () => {
          searchInput.value = movie.title;
          suggestionsDiv.innerHTML = "";
          suggestionsDiv.style.display = "none";
          getMovieDetails(movie.id);
        });
        suggestionsDiv.appendChild(div);
      });
      suggestionsDiv.style.display = "block";
    })
    .catch(() => {
      suggestionsDiv.style.display = "none";
    });
}

// Search movies and show details + similar movies
function searchMovies(query) {
    
  fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${api}&language=en-US&query=${encodeURIComponent(
      query
    )}&page=1&include_adult=false`
  )
    .then((res) => res.json())
    .then((data) => {
      if (data.results.length === 0) {
        alert("No movies found!");
        return;
      }
      // Hide popular movies on search
      popularMoviesDiv.style.display = "none";
      popularTitle.style.display = "none";

      // Take first result for details
      const movie = data.results[0];
      getMovieDetails(movie.id);
    })
    .catch(() => {
      alert("Error searching movies.");
    });
}

// Get movie details and show in movie-details div
function getMovieDetails(id) {
  fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${api}&language=en-US`)
    .then((res) => res.json())
    .then((movie) => {
      movieDetailsDiv.style.display = "block";

      document.getElementById("title").textContent = movie.title || "";
      document.getElementById("year").textContent = movie.release_date
        ? `(${movie.release_date.slice(0, 4)})`
        : "";
      const posterEl = document.getElementById("poster");
      if (movie.poster_path) {
        posterEl.src = `https://image.tmdb.org/t/p/w300${movie.poster_path}`;
        posterEl.alt = movie.title;
      } else {
        posterEl.src = "";
        posterEl.alt = "";
      }
      document.getElementById("plot").textContent = movie.overview || "";
      document.getElementById("genres").textContent = movie.genres
        ? movie.genres.map((g) => g.name).join(", ")
        : "";
      document.getElementById("rating").textContent = movie.vote_average
        ? movie.vote_average + " / 10"
        : "";
      document.getElementById("release-date").textContent = movie.release_date || "";
      document.getElementById("runtime").textContent = movie.runtime
        ? movie.runtime + " mins"
        : "";

      getSimilarMovies(id);
    })
    .catch(() => alert("Error fetching movie details."));
}

// Get and render similar movies (top 10)
function getSimilarMovies(id) {
  fetch(
    `https://api.themoviedb.org/3/movie/${id}/similar?api_key=${api}&language=en-US&page=1`
  )
    .then((res) => res.json())
    .then((data) => {
      const movies = data.results.slice(0, 10);
      if (movies.length > 0) {
        similarTitle.style.display = "block";
        similarMoviesDiv.style.display = "grid";
        renderMoviesGrid(movies, similarMoviesDiv);
      } else {
        similarTitle.style.display = "none";
        similarMoviesDiv.style.display = "none";
      }
    })
    .catch(() => {
      similarMoviesDiv.innerHTML = "<p>Error loading similar movies.</p>";
    });
}
