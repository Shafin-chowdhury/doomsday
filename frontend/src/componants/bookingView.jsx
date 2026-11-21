import { useState } from "react";

export default function BookingView({
  cinemas,
  selectedCinemaId,
  onChangeCinema,
  groupSize,
  onChangeGroupSize,
  bookingQuote,
  onGetQuote,
  onCreateCinema,
}) {
  const [newName, setNewName] = useState("");
  const [newBundlesText, setNewBundlesText] = useState("2, 5");
  const [creating, setCreating] = useState(false);

  const selectedCinema = cinemas.find((c) => c.id === selectedCinemaId);

  function handleQuoteSubmit(e) {
    e.preventDefault();
    onGetQuote(selectedCinemaId, Number(groupSize));
  }

  async function handleAddCinema(e) {
    e.preventDefault();
    setCreating(true);
    const parsedBundles = newBundlesText
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => !Number.isNaN(n));

    const ok = await onCreateCinema({
      name: newName,
      bundleSizes: parsedBundles,
    });
    setCreating(false);
    if (ok) {
      setNewName("");
    }
  }

  return (
    <div className="space-y-8">
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Opening-Night Watch Party Quote</h2>
          <p className="text-sm text-slate-400">
            Find the fewest seat bundles that match your exact group size with zero wasted seats.
          </p>
        </div>

        <form onSubmit={handleQuoteSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Select Cinema
            </label>
            <select
              value={selectedCinemaId}
              onChange={(e) => onChangeCinema(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-400 cursor-pointer"
            >
              {cinemas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — [{c.bundleSizes.join(", ")}]
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Group Size (1–10,000)
            </label>
            <input
              type="number"
              min={1}
              max={10000}
              value={groupSize}
              onChange={(e) => onChangeGroupSize(e.target.value)}
              required
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-400"
            />
          </div>

          <div className="md:col-span-3 flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-semibold text-sm transition cursor-pointer"
            >
              Calculate Bundles
            </button>
          </div>
        </form>

        {selectedCinema && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span>Available bundles at {selectedCinema.name}:</span>
            {selectedCinema.bundleSizes.map((size) => (
              <span
                key={size}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-rose-300 font-medium"
              >
                {size} seats
              </span>
            ))}
          </div>
        )}

        {bookingQuote && (
          <div className="pt-2">
            {!bookingQuote.possible ? (
              <div className="rounded-2xl bg-rose-950/30 border border-rose-500/40 p-5">
                <div className="text-base font-bold text-rose-300">Not possible</div>
                <p className="text-xs text-rose-200/80 mt-1">
                  No combination of bundle sizes [{bookingQuote.bundleSizes?.join(", ")}] adds up to
                  exactly {bookingQuote.groupSize} seats.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl bg-emerald-950/25 border border-emerald-500/35 p-5 space-y-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-emerald-300 font-semibold">
                      Optimal Quote
                    </span>
                    <h3 className="text-xl font-bold text-white mt-0.5">
                      {bookingQuote.totalBundles}{" "}
                      {bookingQuote.totalBundles === 1 ? "bundle" : "bundles"} for{" "}
                      {bookingQuote.groupSize} seats
                    </h3>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    0 empty seats wasted
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {bookingQuote.breakdown.map((item) => (
                    <div
                      key={item.bundleSize}
                      className="rounded-xl bg-slate-950/90 border border-slate-800 p-3.5 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs text-slate-400">Bundle of {item.bundleSize}</div>
                        <div className="text-base font-bold text-white mt-0.5">
                          {item.bundleSize} × {item.count}
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-900 text-emerald-300">
                        {item.subtotalSeats} seats
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-base font-semibold text-white mb-1">Add a New Cinema</h3>
        <p className="text-xs text-slate-400 mb-4">
          Enter 1 to 10 comma-separated bundle sizes (each 1–500 seats).
        </p>

        <form onSubmit={handleAddCinema} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5">
            <input
              type="text"
              placeholder="Cinema Name (e.g. Cineworld IMAX)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
            />
          </div>
          <div className="md:col-span-4">
            <input
              type="text"
              placeholder="Bundle sizes (e.g. 2, 5, 10)"
              value={newBundlesText}
              onChange={(e) => setNewBundlesText(e.target.value)}
              required
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
            />
          </div>
          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={creating}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition cursor-pointer"
            >
              {creating ? "Adding..." : "+ Add Cinema"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}