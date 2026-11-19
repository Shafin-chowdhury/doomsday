import { useState } from "react";

export default function MoviesView({
  movies,
  onAddMovie,
  onToggleWatched,
  onSavePrereqs,
}) {
  const [title, setTitle] = useState("");
  const [releaseYear, setReleaseYear] = useState("2025");
  const [runtime, setRuntime] = useState("120");
  const [selectedPrereqs, setSelectedPrereqs] = useState([]);

  const [editingMovieId, setEditingMovieId] = useState(null);
  const [editPrereqIds, setEditPrereqIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const movieTitleById = Object.fromEntries(movies.map((m) => [m.id, m.title]));

  function toggleId(list, setList, id) {
    if (list.includes(id)) {
      setList(list.filter((item) => item !== id));
    } else {
      setList([...list, id]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    const ok = await onAddMovie({
      title,
      releaseYear: Number(releaseYear),
      runtime: Number(runtime),
      prerequisites: selectedPrereqs,
    });
    setSubmitting(false);
    if (ok) {
      setTitle("");
      setSelectedPrereqs([]);
    }
  }

  function openEditor(movie) {
    setEditingMovieId(movie.id);
    setEditPrereqIds(movie.prerequisites || []);
  }

  async function handleSaveEditor(movieId) {
    const ok = await onSavePrereqs(movieId, editPrereqIds);
    if (ok) {
      setEditingMovieId(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* Add Movie Form Card */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Add New Movie</h2>
            <p className="text-sm text-slate-400">
              Runtime must be between 1 and 300 minutes. Movie titles must be unique.
            </p>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
            DAG Node
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Movie Title
              </label>
              <input
                type="text"
                placeholder="e.g. Thunderbolts*"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Release Year
              </label>
              <input
                type="number"
                value={releaseYear}
                onChange={(e) => setReleaseYear(e.target.value)}
                required
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Runtime (1–300 min)
              </label>
              <input
                type="number"
                min={1}
                max={300}
                value={runtime}
                onChange={(e) => setRuntime(e.target.value)}
                required
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Prerequisites (Watch these first)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-44 overflow-y-auto p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              {movies.map((m) => {
                const checked = selectedPrereqs.includes(m.id);
                return (
                  <label
                    key={m.id}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs cursor-pointer transition border ${
                      checked
                        ? "bg-amber-500/15 border-amber-400/50 text-amber-200"
                        : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleId(selectedPrereqs, setSelectedPrereqs, m.id)}
                      className="accent-amber-400 rounded"
                    />
                    <span className="truncate">{m.title}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-semibold text-sm transition cursor-pointer"
            >
              {submitting ? "Saving..." : "+ Add Movie"}
            </button>
          </div>
        </form>
      </section>

      {/* Movie Catalog List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            MCU Catalog <span className="text-sm font-normal text-slate-400">({movies.length} movies)</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {movies.map((movie) => {
            const isEditing = editingMovieId === movie.id;
            const prereqNames =
              movie.prerequisites && movie.prerequisites.length > 0
                ? movie.prerequisites.map((id) => movieTitleById[id] || id)
                : [];

            return (
              <div
                key={movie.id}
                className={`rounded-2xl border p-4 transition ${
                  movie.watched
                    ? "bg-emerald-950/20 border-emerald-500/30"
                    : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <input
                      type="checkbox"
                      checked={Boolean(movie.watched)}
                      onChange={() => onToggleWatched(movie)}
                      className="mt-1 h-4 w-4 accent-emerald-400 cursor-pointer rounded"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`font-semibold text-base ${
                            movie.watched ? "line-through text-slate-400" : "text-white"
                          }`}
                        >
                          {movie.title}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          {movie.releaseYear}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          {movie.runtime} min
                        </span>
                        {movie.watched && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            Watched
                          </span>
                        )}
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                        <span>Prerequisites:</span>
                        {prereqNames.length === 0 ? (
                          <span className="text-slate-500 italic">None</span>
                        ) : (
                          prereqNames.map((name) => (
                            <span
                              key={name}
                              className="px-2 py-0.5 rounded bg-slate-800/90 text-amber-200/90 border border-slate-700/70"
                            >
                              {name}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => (isEditing ? setEditingMovieId(null) : openEditor(movie))}
                    className="self-start sm:self-center px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                  >
                    {isEditing ? "Close" : "Edit Prerequisites"}
                  </button>
                </div>

                {isEditing && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                    <p className="text-xs font-medium text-amber-300">
                      Select prerequisites for <span className="underline">{movie.title}</span>:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      {movies.map((other) => {
                        const checked = editPrereqIds.includes(other.id);
                        return (
                          <label
                            key={other.id}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer ${
                              checked
                                ? "bg-amber-500/15 text-amber-200"
                                : "text-slate-300 hover:bg-slate-900"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleId(editPrereqIds, setEditPrereqIds, other.id)}
                              className="accent-amber-400"
                            />
                            <span className="truncate">{other.title}</span>
                          </label>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingMovieId(null)}
                        className="px-3.5 py-1.5 rounded-xl text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEditor(movie.id)}
                        className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer"
                      >
                        Save Prerequisites
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}