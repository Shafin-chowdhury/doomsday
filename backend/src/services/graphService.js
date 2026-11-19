// backend/src/services/graphService.js

function buildMovieMap(movies) {
  const map = new Map();
  for (const movie of movies) {
    map.set(movie.id, movie);
  }
  return map;
}

/**
 * Checks if setting `proposedPrereqIds` as prerequisites for `movieId`
 * creates a cycle (either self-loop or indirect cycle through ancestors).
 */
function hasCycle(movies, movieId, proposedPrereqIds = []) {
  const movieMap = buildMovieMap(movies);

  // Direct self-dependency check
  if (movieId && proposedPrereqIds.includes(movieId)) {
    return true;
  }

  // Simulate updated prerequisites in a temporary map
  const tempPrereqs = new Map();
  for (const [id, movie] of movieMap.entries()) {
    tempPrereqs.set(id, [...(movie.prerequisites || [])]);
  }
  if (movieId) {
    tempPrereqs.set(movieId, [...proposedPrereqIds]);
  }

  // If `movieId` is already in the graph, check if any proposed prerequisite
  // can reach `movieId` going backwards through prerequisites.
  if (movieId) {
    const visited = new Set();

    function canReachTarget(currentId) {
      if (currentId === movieId) return true;
      if (visited.has(currentId)) return false;
      visited.add(currentId);

      const prereqs = tempPrereqs.get(currentId) || [];
      for (const pId of prereqs) {
        if (canReachTarget(pId)) {
          return true;
        }
      }
      return false;
    }

    for (const startPrereqId of proposedPrereqIds) {
      if (canReachTarget(startPrereqId)) {
        return true;
      }
    }
  }

  // Also check if the overall graph has any cycle using 3-state DFS
  // 0 = unvisited, 1 = visiting (on stack), 2 = visited
  const state = new Map();

  function dfs(id) {
    const currentState = state.get(id) || 0;
    if (currentState === 1) return true; // Back-edge found -> cycle
    if (currentState === 2) return false;

    state.set(id, 1);
    const prereqs = tempPrereqs.get(id) || [];
    for (const pId of prereqs) {
      if (dfs(pId)) return true;
    }
    state.set(id, 2);
    return false;
  }

  for (const id of tempPrereqs.keys()) {
    if (dfs(id)) return true;
  }

  return false;
}

/**
 * Returns all ancestor prerequisites of `targetMovieId` in valid watch order
 * (prerequisites appear before movies that depend on them), excluding `targetMovieId`.
 */
function getRewatchPlan(movies, targetMovieId) {
  const movieMap = buildMovieMap(movies);
  const targetMovie = movieMap.get(targetMovieId);

  if (!targetMovie) {
    return null;
  }

  // Step 1: Collect all ancestor IDs (excluding the target movie itself)
  const ancestorIds = new Set();

  function collectAncestors(currentId) {
    const movie = movieMap.get(currentId);
    if (!movie) return;

    for (const prereqId of movie.prerequisites || []) {
      if (prereqId !== targetMovieId && !ancestorIds.has(prereqId)) {
        ancestorIds.add(prereqId);
        collectAncestors(prereqId);
      }
    }
  }

  collectAncestors(targetMovieId);

  // Step 2: Post-order DFS over ancestors so every prerequisite is visited
  // before the movie that requires it.
  const visited = new Set();
  const orderedMovies = [];

  function topoVisit(currentId) {
    if (visited.has(currentId)) return;
    visited.add(currentId);

    const movie = movieMap.get(currentId);
    if (!movie) return;

    for (const prereqId of movie.prerequisites || []) {
      if (ancestorIds.has(prereqId)) {
        topoVisit(prereqId);
      }
    }

    orderedMovies.push(movie);
  }

  for (const id of ancestorIds) {
    topoVisit(id);
  }

  let watchedCount = 0;
  let unwatchedRuntimeMinutes = 0;

  for (const m of orderedMovies) {
    if (m.watched) {
      watchedCount += 1;
    } else {
      unwatchedRuntimeMinutes += Number(m.runtime || 0);
    }
  }

  return {
    targetMovie,
    rewatchOrder: orderedMovies,
    totalPrerequisites: orderedMovies.length,
    watchedCount,
    unwatchedRuntimeMinutes,
  };
}

module.exports = {
  hasCycle,
  getRewatchPlan,
};