export default function RewatchPlanView({
  movies,
  targetMovieId,
  onChangeTargetMovie,
  rewatchPlan,
  onToggleWatched,
}) {
  const totalPrereqs = rewatchPlan?.totalPrerequisites ?? 0;
  const watchedCount = rewatchPlan?.watchedCount ?? 0;
  const remainingMinutes = rewatchPlan?.unwatchedRuntimeMinutes ?? 0;
  const progressPercent =
    totalPrereqs > 0 ? Math.round((watchedCount / totalPrereqs) * 100) : 100;

  const hours = Math.floor(remainingMinutes / 60);
  const mins = remainingMinutes % 60;

  return (
    <div className="space-y-6">
      {/* Target Selector & Summary Card */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Rewatch Roadmap</h2>
            <p className="text-sm text-slate-400">
              Prerequisites ordered so every required story comes before what builds on it.
            </p>
          </div>

          <div className="w-full md:w-80">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Target Movie
            </label>
            <select
              value={targetMovieId}
              onChange={(e) => onChangeTargetMovie(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400 cursor-pointer"
            >
              {movies.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} ({m.releaseYear})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Row */}
        {rewatchPlan && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-4">
              <div className="text-xs text-slate-400">Completion Progress</div>
              <div className="mt-1 text-xl font-bold text-white">
                {watchedCount} of {totalPrereqs} watched
              </div>
              <div className="text-xs text-emerald-400 mt-0.5">{progressPercent}% complete</div>
            </div>

            <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-4">
              <div className="text-xs text-slate-400">Remaining Watch Time</div>
              <div className="mt-1 text-xl font-bold text-amber-300">
                {remainingMinutes} min
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {hours > 0 ? `${hours}h ${mins}m left` : `${mins}m left`}
              </div>
            </div>

            <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-4">
              <div className="text-xs text-slate-400">Target Finale</div>
              <div className="mt-1 text-base font-bold text-indigo-300 truncate">
                {rewatchPlan.targetMovie?.title}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Excluded from prerequisite list
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {rewatchPlan && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Rewatch Progress</span>
              <span>
                {watchedCount} / {totalPrereqs}
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </section>

      {/* Ordered Sequence List */}
      {rewatchPlan && (
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-4">
            Recommended Watch Sequence
          </h3>

          {rewatchPlan.rewatchOrder.length === 0 ? (
            <div className="rounded-xl bg-slate-950/70 border border-dashed border-slate-700 p-8 text-center">
              <p className="text-sm font-medium text-slate-200">
                No prerequisites required before {rewatchPlan.targetMovie?.title}!
              </p>
              <p className="text-xs text-slate-400 mt-1">
                You can jump straight into this movie.
              </p>
            </div>
          ) : (
            <ol className="space-y-3">
              {rewatchPlan.rewatchOrder.map((movie, index) => (
                <li
                  key={movie.id}
                  onClick={() => onToggleWatched(movie)}
                  className={`flex items-center justify-between gap-4 p-4 rounded-xl border cursor-pointer transition ${
                    movie.watched
                      ? "bg-emerald-950/20 border-emerald-500/30"
                      : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-800 text-slate-200 text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>

                    <input
                      type="checkbox"
                      checked={Boolean(movie.watched)}
                      onChange={() => {}}
                      onClick={(e) => e.stopPropagation()}
                      readOnly
                      className="h-4 w-4 accent-emerald-400 pointer-events-none"
                    />

                    <div className="truncate">
                      <span
                        className={`text-sm font-semibold ${
                          movie.watched ? "line-through text-slate-400" : "text-white"
                        }`}
                      >
                        {movie.title}
                      </span>
                      <span className="ml-2 text-xs text-slate-400">
                        ({movie.releaseYear})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">
                      {movie.runtime} min
                    </span>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        movie.watched
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-amber-500/10 text-amber-300"
                      }`}
                    >
                      {movie.watched ? "Watched" : "Unwatched"}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}
    </div>
  );
}