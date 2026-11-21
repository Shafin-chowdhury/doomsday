const express = require("express");
const crypto = require("crypto");
const { initialMovies, initialCinemas } = require("../data/seedData");
const { hasCycle, getRewatchPlan } = require("../services/graphService");
const { calculateOptimalBundles } = require("../services/bookingService");

const router = express.Router();

let movies = structuredClone(initialMovies);
let cinemas = structuredClone(initialCinemas);

function slugifyId(text) {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base || "item"}-${crypto.randomBytes(3).toString("hex")}`;
}


router.get("/movies", (req, res) => {
  res.json(movies);
});

router.post("/movies", (req, res) => {
  const { title, releaseYear, runtime, prerequisites = [], watched = false } = req.body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "INVALID_INPUT", message: "Title is required." });
  }

  const normalizedTitle = title.trim();
  const duplicate = movies.some(
    (m) => m.title.toLowerCase() === normalizedTitle.toLowerCase()
  );
  if (duplicate) {
    return res.status(409).json({ error: "DUPLICATE_TITLE", message: "Movie title must be unique." });
  }

  const runtimeNum = Number(runtime);
  if (!Number.isInteger(runtimeNum) || runtimeNum < 1 || runtimeNum > 300) {
    return res.status(400).json({ error: "INVALID_RUNTIME", message: "Runtime must be between 1 and 300 minutes." });
  }

  const yearNum = Number(releaseYear);
  if (!Number.isInteger(yearNum) || yearNum < 1888 || yearNum > 2100) {
    return res.status(400).json({ error: "INVALID_YEAR", message: "Valid release year is required." });
  }

  const prereqList = Array.isArray(prerequisites) ? [...new Set(prerequisites)] : [];
  const validMovieIds = new Set(movies.map((m) => m.id));
  for (const pId of prereqList) {
    if (!validMovieIds.has(pId)) {
      return res.status(400).json({ error: "INVALID_PREREQUISITE", message: `Prerequisite '${pId}' does not exist.` });
    }
  }

  const newMovieId = slugifyId(normalizedTitle);
  if (hasCycle(movies, newMovieId, prereqList)) {
    return res.status(409).json({
      error: "CIRCULAR_DEPENDENCY",
      message: "Prerequisites cannot form a circular dependency.",
    });
  }

  const newMovie = {
    id: newMovieId,
    title: normalizedTitle,
    releaseYear: yearNum,
    runtime: runtimeNum,
    prerequisites: prereqList,
    watched: Boolean(watched),
  };

  movies.push(newMovie);
  return res.status(201).json(newMovie);
});

router.patch("/movies/:id", (req, res) => {
  const movieIndex = movies.findIndex((m) => m.id === req.params.id);
  if (movieIndex === -1) {
    return res.status(404).json({ error: "NOT_FOUND", message: "Movie not found." });
  }

  const currentMovie = movies[movieIndex];
  const { title, releaseYear, runtime, prerequisites, watched } = req.body;

  let nextTitle = currentMovie.title;
  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "INVALID_INPUT", message: "Title cannot be empty." });
    }
    nextTitle = title.trim();
    const conflict = movies.some(
      (m) => m.id !== currentMovie.id && m.title.toLowerCase() === nextTitle.toLowerCase()
    );
    if (conflict) {
      return res.status(409).json({ error: "DUPLICATE_TITLE", message: "Movie title must be unique." });
    }
  }

  let nextRuntime = currentMovie.runtime;
  if (runtime !== undefined) {
    const rNum = Number(runtime);
    if (!Number.isInteger(rNum) || rNum < 1 || rNum > 300) {
      return res.status(400).json({ error: "INVALID_RUNTIME", message: "Runtime must be between 1 and 300." });
    }
    nextRuntime = rNum;
  }

  let nextYear = currentMovie.releaseYear;
  if (releaseYear !== undefined) {
    const yNum = Number(releaseYear);
    if (!Number.isInteger(yNum) || yNum < 1888 || yNum > 2100) {
      return res.status(400).json({ error: "INVALID_YEAR", message: "Invalid release year." });
    }
    nextYear = yNum;
  }

  let nextPrereqs = currentMovie.prerequisites;
  if (prerequisites !== undefined) {
    if (!Array.isArray(prerequisites)) {
      return res.status(400).json({ error: "INVALID_PREREQUISITES", message: "Prerequisites must be an array of IDs." });
    }
    nextPrereqs = [...new Set(prerequisites)];
    const validMovieIds = new Set(movies.map((m) => m.id));
    for (const pId of nextPrereqs) {
      if (!validMovieIds.has(pId)) {
        return res.status(400).json({ error: "INVALID_PREREQUISITE", message: `Prerequisite '${pId}' does not exist.` });
      }
    }

    if (hasCycle(movies, currentMovie.id, nextPrereqs)) {
      return res.status(409).json({
        error: "CIRCULAR_DEPENDENCY",
        message: "Updating prerequisites would create a circular dependency.",
      });
    }
  }

  const nextWatched = watched !== undefined ? Boolean(watched) : currentMovie.watched;

  const updatedMovie = {
    ...currentMovie,
    title: nextTitle,
    releaseYear: nextYear,
    runtime: nextRuntime,
    prerequisites: nextPrereqs,
    watched: nextWatched,
  };

  movies[movieIndex] = updatedMovie;
  return res.json(updatedMovie);
});

router.get("/movies/:id/rewatch-order", (req, res) => {
  const plan = getRewatchPlan(movies, req.params.id);
  if (!plan) {
    return res.status(404).json({ error: "NOT_FOUND", message: "Movie not found." });
  }
  return res.json(plan);
});

router.get("/cinemas", (req, res) => {
  res.json(cinemas);
});

router.post("/cinemas", (req, res) => {
  const { name, bundleSizes } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "INVALID_INPUT", message: "Cinema name is required." });
  }

  const normalizedName = name.trim();
  if (cinemas.some((c) => c.name.toLowerCase() === normalizedName.toLowerCase())) {
    return res.status(409).json({ error: "DUPLICATE_NAME", message: "Cinema name must be unique." });
  }

  if (!Array.isArray(bundleSizes) || bundleSizes.length < 1 || bundleSizes.length > 10) {
    return res.status(400).json({
      error: "INVALID_BUNDLE_COUNT",
      message: "A cinema must have between 1 and 10 bundle sizes.",
    });
  }

  const parsedSizes = bundleSizes.map(Number);
  const allValid = parsedSizes.every(
    (n) => Number.isInteger(n) && n >= 1 && n <= 500
  );
  if (!allValid) {
    return res.status(400).json({
      error: "INVALID_BUNDLE_SIZE",
      message: "Each bundle size must be an integer between 1 and 500.",
    });
  }

  const newCinema = {
    id: slugifyId(normalizedName),
    name: normalizedName,
    bundleSizes: [...new Set(parsedSizes)],
  };

  cinemas.push(newCinema);
  return res.status(201).json(newCinema);
});

router.get("/cinemas/:id/booking", (req, res) => {
  const cinema = cinemas.find((c) => c.id === req.params.id);
  if (!cinema) {
    return res.status(404).json({ error: "NOT_FOUND", message: "Cinema not found." });
  }

  const groupSize = Number(req.query.groupSize);
  if (!Number.isInteger(groupSize) || groupSize < 1 || groupSize > 10000) {
    return res.status(400).json({
      error: "INVALID_GROUP_SIZE",
      message: "groupSize query parameter must be an integer between 1 and 10000.",
    });
  }

  const quote = calculateOptimalBundles(cinema.bundleSizes, groupSize);
  return res.json({
    cinemaId: cinema.id,
    cinemaName: cinema.name,
    bundleSizes: cinema.bundleSizes,
    ...quote,
  });
});

module.exports = router;