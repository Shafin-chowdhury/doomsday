import { useEffect, useState } from "react";
import MoviesView from "./componants/movieView";
import RewatchPlanView from "./componants/rewatchplanView";
import BookingView from "./componants/bookingView";

const API_BASE = "http://localhost:4000/api";

const POSTERS = [
  "/posters/avengers.jpg",
  "/posters/ironmann.jpeg",
  "/posters/endgame.jpeg",
];

export default function App() {
  const [activeTab, setActiveTab] = useState("movies");
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [targetMovieId, setTargetMovieId] = useState("avengers-doomsday");
  const [rewatchPlan, setRewatchPlan] = useState(null);

  const [selectedCinemaId, setSelectedCinemaId] = useState("cine-1");
  const [groupSize, setGroupSize] = useState("6");
  const [bookingQuote, setBookingQuote] = useState(null);

  async function fetchMovies() {
    const res = await fetch(`${API_BASE}/movies`);
    const data = await res.json();
    setMovies(data);
    return data;
  }

  async function fetchCinemas() {
    const res = await fetch(`${API_BASE}/cinemas`);
    const data = await res.json();
    setCinemas(data);
    return data;
  }

  async function fetchRewatchPlan(movieId) {
    if (!movieId) return;
    const res = await fetch(`${API_BASE}/movies/${movieId}/rewatch-order`);
    if (res.ok) {
      const data = await res.json();
      setRewatchPlan(data);
    }
  }

  async function fetchBookingQuote(cinemaId, size) {
    if (!cinemaId || !size) return;
    const res = await fetch(
      `${API_BASE}/cinemas/${cinemaId}/booking?groupSize=${encodeURIComponent(size)}`
    );
    const data = await res.json();
    setBookingQuote(data);
  }

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const [movieList, cinemaList] = await Promise.all([fetchMovies(), fetchCinemas()]);

        const defaultTarget =
          movieList.find((m) => m.id === "avengers-doomsday")?.id ||
          movieList[0]?.id ||
          "";
        setTargetMovieId(defaultTarget);
        if (defaultTarget) {
          await fetchRewatchPlan(defaultTarget);
        }

        const defaultCinema = cinemaList[0]?.id || "";
        setSelectedCinemaId(defaultCinema);
        if (defaultCinema) {
          await fetchBookingQuote(defaultCinema, 6);
        }
      } catch {
        setErrorMsg("Backend server is not reachable on http://localhost:4000.");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (targetMovieId) {
      fetchRewatchPlan(targetMovieId);
    }
  }, [targetMovieId, movies]);

  async function handleAddMovie(payload) {
    setErrorMsg("");
    const res = await fetch(`${API_BASE}/movies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setErrorMsg(`${res.status} ${data.error || ""}: ${data.message || "Failed to add movie"}`);
      return false;
    }
    await fetchMovies();
    return true;
  }

  async function handleToggleWatched(movie) {
    setErrorMsg("");
    const res = await fetch(`${API_BASE}/movies/${movie.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ watched: !movie.watched }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErrorMsg(`${res.status} ${data.error || ""}: ${data.message || "Failed to update"}`);
      return;
    }
    await fetchMovies();
  }

  async function handleSavePrereqs(movieId, prerequisites) {
    setErrorMsg("");
    const res = await fetch(`${API_BASE}/movies/${movieId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prerequisites }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErrorMsg(
        `${res.status} ${data.error || ""}: ${data.message || "Failed to update prerequisites"}`
      );
      return false;
    }
    await fetchMovies();
    return true;
  }

  async function handleGetQuote(cinemaId, size) {
    setErrorMsg("");
    const res = await fetch(
      `${API_BASE}/cinemas/${cinemaId}/booking?groupSize=${encodeURIComponent(size)}`
    );
    const data = await res.json();
    if (!res.ok) {
      setErrorMsg(`${res.status} ${data.error || ""}: ${data.message || "Invalid booking request"}`);
      return;
    }
    setBookingQuote(data);
  }

  async function handleCreateCinema(payload) {
    setErrorMsg("");
    const res = await fetch(`${API_BASE}/cinemas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setErrorMsg(`${res.status} ${data.error || ""}: ${data.message || "Failed to add cinema"}`);
      return false;
    }
    const updated = await fetchCinemas();
    setSelectedCinemaId(data.id);
    if (updated.length > 0) {
      await fetchBookingQuote(data.id, Number(groupSize) || 6);
    }
    return true;
  }

  const tabs = [
    { id: "movies", label: "1. Movies" },
    { id: "rewatch", label: "2. Rewatch Plan" },
    { id: "booking", label: "3. Booking" },
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 grid grid-cols-1 sm:grid-cols-3 gap-2 opacity-60"
      >
        {POSTERS.map((src) => (
          <div
            key={src}
            className="relative h-full w-full overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950/60 to-slate-950"
          >
            <img
              src={src}
              alt=""
              className="h-full w-full object-cover object-center scale-105"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/70" />
          </div>
        ))}
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-slate-950/65"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-2xl font-semibold uppercase tracking-wider text-amber-400 mb-1">
              <span>Avengers: Doomsday Prep</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Doomsday Ready
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Plan your MCU rewatch order and optimize opening-night group seat bundles.
            </p>
          </div>

          <nav className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 self-start">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setErrorMsg("");
                    setActiveTab(tab.id);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                    active
                      ? "bg-amber-400 text-slate-950 shadow"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </header>

        {errorMsg && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 px-4 py-3.5 text-sm text-rose-200">
            <span>{errorMsg}</span>
            <button
              type="button"
              onClick={() => setErrorMsg("")}
              className="text-xs font-bold text-rose-300 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-12 text-center text-sm text-slate-400">
            Loading Doomsday Ready...
          </div>
        ) : (
          <main>
            {activeTab === "movies" && (
              <MoviesView
                movies={movies}
                onAddMovie={handleAddMovie}
                onToggleWatched={handleToggleWatched}
                onSavePrereqs={handleSavePrereqs}
              />
            )}

            {activeTab === "rewatch" && (
              <RewatchPlanView
                movies={movies}
                targetMovieId={targetMovieId}
                onChangeTargetMovie={setTargetMovieId}
                rewatchPlan={rewatchPlan}
                onToggleWatched={handleToggleWatched}
              />
            )}

            {activeTab === "booking" && (
              <BookingView
                cinemas={cinemas}
                selectedCinemaId={selectedCinemaId}
                onChangeCinema={setSelectedCinemaId}
                groupSize={groupSize}
                onChangeGroupSize={setGroupSize}
                bookingQuote={bookingQuote}
                onGetQuote={handleGetQuote}
                onCreateCinema={handleCreateCinema}
              />
            )}
          </main>
        )}
      </div>
    </div>
  );
}