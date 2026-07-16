/* MasakApa — recipes.html listing page: filters, sort, search-by-name. */

document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("recipe-grid");
  const emptyState = document.getElementById("empty-state");
  const resultsCount = document.getElementById("results-count");
  const searchInput = document.getElementById("filter-q");
  const categorySelect = document.getElementById("filter-category");
  const countrySelect = document.getElementById("filter-country");
  const communitySelect = document.getElementById("filter-community");
  const difficultySelect = document.getElementById("filter-difficulty");
  const timeSelect = document.getElementById("filter-time");
  const sortSelect = document.getElementById("filter-sort");
  const resetBtn = document.getElementById("filter-reset");

  let allRecipes = [];

  try {
    const [recipes, categories, countries, communities] = await Promise.all([
      MasakApa.loadRecipes(),
      MasakApa.fetchJSON("data/categories.json"),
      MasakApa.fetchJSON("data/countries.json"),
      MasakApa.fetchJSON("data/communities.json"),
    ]);
    allRecipes = recipes;

    MasakApaFilters.populateSelect(categorySelect, categories, { valueKey: "name", labelKey: "name", allLabel: "Semua Kategori" });
    MasakApaFilters.populateSelect(countrySelect, countries, { valueKey: "name", labelKey: "name", allLabel: "Semua Negara" });
    MasakApaFilters.populateSelect(communitySelect, communities, { valueKey: "name", labelKey: "name", allLabel: "Semua Kaum" });
  } catch (err) {
    grid.innerHTML = `<div class="empty-state"><span class="empty-emoji">⚠️</span>Gagal memuatkan resepi. Sila cuba semula.</div>`;
    console.error(err);
    return;
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get("q")) searchInput.value = params.get("q");
  if (params.get("category")) categorySelect.value = params.get("category");
  if (params.get("country")) countrySelect.value = params.get("country");
  if (params.get("community")) communitySelect.value = params.get("community");

  function currentFilters() {
    return {
      q: searchInput.value,
      category: categorySelect.value,
      country: countrySelect.value,
      community: communitySelect.value,
      difficulty: difficultySelect.value,
      maxTime: timeSelect.value,
    };
  }

  function render() {
    const filtered = MasakApaFilters.applyFilters(allRecipes, currentFilters());
    const sorted = MasakApaFilters.sortRecipes(filtered, sortSelect.value);

    resultsCount.textContent = `${sorted.length} resepi dijumpai`;

    if (sorted.length === 0) {
      grid.innerHTML = "";
      emptyState.hidden = false;
      return;
    }
    emptyState.hidden = true;
    grid.innerHTML = sorted.map(MasakApa.recipeCardHTML).join("");
  }

  const debouncedRender = MasakApa.debounce(render, 200);

  searchInput.addEventListener("input", debouncedRender);
  [categorySelect, countrySelect, communitySelect, difficultySelect, timeSelect, sortSelect].forEach((el) => {
    el.addEventListener("change", render);
  });

  resetBtn.addEventListener("click", () => {
    searchInput.value = "";
    [categorySelect, countrySelect, communitySelect, difficultySelect, timeSelect].forEach((el) => (el.value = ""));
    sortSelect.value = "terbaru";
    render();
  });

  render();
});
