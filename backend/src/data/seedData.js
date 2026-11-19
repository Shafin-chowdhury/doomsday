// backend/src/data/seedData.js
const initialMovies = [
  { id: "iron-man", title: "Iron Man", releaseYear: 2008, runtime: 126, prerequisites: [], watched: false },
  { id: "cap-first-avenger", title: "Captain America: The First Avenger", releaseYear: 2011, runtime: 124, prerequisites: [], watched: false },
  { id: "the-avengers", title: "The Avengers", releaseYear: 2012, runtime: 143, prerequisites: ["iron-man", "cap-first-avenger"], watched: false },
  { id: "civil-war", title: "Captain America: Civil War", releaseYear: 2016, runtime: 147, prerequisites: ["the-avengers"], watched: false },
  { id: "thor-ragnarok", title: "Thor: Ragnarok", releaseYear: 2017, runtime: 130, prerequisites: [], watched: false },
  { id: "infinity-war", title: "Avengers: Infinity War", releaseYear: 2018, runtime: 149, prerequisites: ["civil-war", "thor-ragnarok"], watched: false },
  { id: "endgame", title: "Avengers: Endgame", releaseYear: 2019, runtime: 181, prerequisites: ["infinity-war"], watched: false },
  { id: "avengers-doomsday", title: "Avengers: Doomsday", releaseYear: 2026, runtime: 165, prerequisites: ["endgame"], watched: false },
];

const initialCinemas = [
  { id: "cine-1", name: "Star Cineplex Bashundhara", bundleSizes: [1, 3, 4] },
  { id: "cine-2", name: "Blockbuster Jamuna", bundleSizes: [2, 5] },
  { id: "cine-3", name: "Lion Cinemas", bundleSizes: [6, 9, 20] },
  { id: "cine-4", name: "Grand Multiplex", bundleSizes: [4, 6] },
];

module.exports = { initialMovies, initialCinemas };