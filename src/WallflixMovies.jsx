import { useEffect, useState, useRef } from "react";
import "./WallflixMovies.css";

const API_KEY = "b50d9fb1";

function NavBar({ children, onLogoClick }) {
  return (
    <nav className="nav-bar">
      <Logo onClick={onLogoClick} />
      {children}
    </nav>
  );
}

function Logo({ onClick }) {
  return (
    <div className="logo" onClick={onClick} style={{ cursor: "pointer" }}>
      <span role="img">🍿</span>
      <h1>WALLFLIX</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

export default function WallflixMovies({ onMovieSelect, onBack }) {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const topRef = useRef(null);

  const fetchMovies = async (searchQuery = "", pageNum = 1) => {
    setIsLoading(true);
    try {
      // If no search query, fetch recent movies by year
      const url = searchQuery 
        ? `https://www.omdbapi.com/?apikey=${API_KEY}&s=${searchQuery}&page=${pageNum}`
        : `https://www.omdbapi.com/?apikey=${API_KEY}&s=2023&page=${pageNum}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.Response === "True") {
        // Always sort by newest first
        const sortedMovies = data.Search.sort((a, b) => b.Year.localeCompare(a.Year));
        setMovies(sortedMovies);
      } else {
        setMovies([]);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);


  useEffect(() => {
    fetchMovies(query, page);
  }, [query, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setPage(1);
      scrollToTop();
    }
  };

  const handleNext = () => {
    setPage((p) => p + 1);
    scrollToTop();
  };

  const handlePrev = () => {
    setPage((p) => Math.max(1, p - 1));
    scrollToTop();
  };

  const handleLogoClick = () => {
    setQuery(""); 
    setPage(1); 
    fetchMovies(); 
    scrollToTop();
  };

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <NavBar onLogoClick={handleLogoClick}>
        <form onSubmit={handleSearch} className="search-form">
          <Search query={query} setQuery={setQuery} />
        </form>
        <NumResults movies={movies} />
      </NavBar>

      <div className="wallflix-container">
        <div ref={topRef}></div>

        {isLoading ? (
          <div className="loader">Loading...</div>
        ) : (
          <>
            <div className="movie-grid">
              {movies.map((movie) => (
                <div
  key={movie.imdbID}
  className="movie-card"
 onClick={() => {
  if (onMovieSelect) onMovieSelect(movie.imdbID);
}}
>
  <img
    src={movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x450?text=No+Poster"}
    alt={movie.Title}
    className="poster"
  />
  <div className="movie-info">
    <h3>{movie.Title}</h3>
    <p>{movie.Year}</p>
    <p className="imdb">⭐ IMDb</p>
  </div>
</div>
              ))}
            </div>

            {movies.length > 0 && (
              <div className="pagination">
                <button 
                  onClick={() => {
                    setPage(1);
                    scrollToTop();
                  }} 
                  disabled={page === 1}
                >
                  First
                </button>
                <button onClick={handlePrev} disabled={page === 1}>
                  ⬅ Prev
                </button>
                <span>Page {page}</span>
                <button onClick={handleNext}>Next ➡</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}