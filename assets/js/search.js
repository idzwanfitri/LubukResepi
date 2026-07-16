/* MasakApa — search.html: smart recipe search based on ingredients on hand. */

document.addEventListener("DOMContentLoaded", async () => {
  const pickerEl = document.getElementById("ingredient-picker");
  const customInput = document.getElementById("ingredient-custom");
  const resultsEl = document.getElementById("match-results");
  const resultsCount = document.getElementById("match-count");
  const clearBtn = document.getElementById("ingredient-clear");

  let recipes = [];
  let ingredients = [];
  const selected = new Set();

  try {
    [recipes, ingredients] = await Promise.all([
      MasakApa.loadRecipes(),
      MasakApa.fetchJSON("data/ingredients.json"),
    ]);
  } catch (err) {
    resultsEl.innerHTML = `<div class="empty-state"><span class="empty-emoji">⚠️</span>Gagal memuatkan data. Sila cuba semula.</div>`;
    console.error(err);
    return;
  }

  const byCategory = {};
  ingredients.forEach((ing) => {
    byCategory[ing.category] = byCategory[ing.category] || [];
    byCategory[ing.category].push(ing);
  });

  pickerEl.innerHTML = Object.keys(byCategory)
    .map(
      (cat) => `
      <div class="ingredient-category">
        <h3>${MasakApa.escapeHtml(cat)}</h3>
        <div class="chip-row">
          ${byCategory[cat]
            .map(
              (ing) => `
              <label class="chip" data-name="${MasakApa.escapeHtml(ing.name.toLowerCase())}">
                <input type="checkbox" class="visually-hidden" value="${MasakApa.escapeHtml(ing.name)}">
                ${MasakApa.escapeHtml(ing.name)}
              </label>`
            )
            .join("")}
        </div>
      </div>`
    )
    .join("");

  pickerEl.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", (e) => {
      e.preventDefault();
      const checkbox = chip.querySelector("input");
      checkbox.checked = !checkbox.checked;
      chip.classList.toggle("is-active", checkbox.checked);
      const name = checkbox.value.toLowerCase();
      if (checkbox.checked) selected.add(name);
      else selected.delete(name);
      renderResults();
    });
  });

  function customNames() {
    return customInput.value
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }

  customInput.addEventListener(
    "input",
    MasakApa.debounce(() => renderResults(), 250)
  );

  clearBtn.addEventListener("click", () => {
    selected.clear();
    customInput.value = "";
    pickerEl.querySelectorAll(".chip").forEach((chip) => {
      chip.classList.remove("is-active");
      chip.querySelector("input").checked = false;
    });
    renderResults();
  });

  function haveIngredient(recipeIngredientName, ownedNames) {
    const target = recipeIngredientName.toLowerCase();
    return ownedNames.some((owned) => target.includes(owned) || owned.includes(target));
  }

  function computeMatch(recipe, ownedNames) {
    const required = recipe.ingredients.filter((ing) => !ing.optional);
    const have = required.filter((ing) => haveIngredient(ing.name, ownedNames));
    const missing = required.filter((ing) => !haveIngredient(ing.name, ownedNames));
    const percent = required.length === 0 ? 0 : Math.round((have.length / required.length) * 100);
    return { percent, have, missing, required };
  }

  function levelFor(percent) {
    if (percent === 100) return { cls: "match-level-full", label: "Boleh masak sekarang" };
    if (percent >= 75) return { cls: "match-level-almost", label: "Hampir lengkap" };
    if (percent >= 50) return { cls: "match-level-partial", label: "Perlukan beberapa bahan" };
    return { cls: "match-level-low", label: "Cadangan alternatif" };
  }

  function renderResults() {
    const ownedNames = [...selected, ...customNames()];

    if (ownedNames.length === 0) {
      resultsEl.innerHTML = `<div class="empty-state"><span class="empty-emoji">🥕</span>Pilih atau taip bahan yang ada di dapur anda untuk mula mencari resepi.</div>`;
      resultsCount.textContent = "";
      return;
    }

    const scored = recipes
      .map((recipe) => ({ recipe, match: computeMatch(recipe, ownedNames) }))
      .filter((r) => r.match.percent > 0)
      .sort((a, b) => b.match.percent - a.match.percent || a.recipe.total_time - b.recipe.total_time);

    if (scored.length === 0) {
      resultsEl.innerHTML = `<div class="empty-state"><span class="empty-emoji">🔍</span>Tiada resepi sepadan dengan bahan yang dipilih. Cuba tambah bahan lain.</div>`;
      resultsCount.textContent = "";
      return;
    }

    resultsCount.textContent = `${scored.length} resepi sepadan`;

    resultsEl.innerHTML = scored
      .map(({ recipe, match }) => {
        const level = levelFor(match.percent);
        const missingNames = match.missing.map((i) => MasakApa.escapeHtml(i.name)).join(", ");
        return `
        <a class="match-result-card" href="recipe.html?slug=${encodeURIComponent(recipe.slug)}">
          <div class="match-emoji" style="background:${MasakApa.escapeHtml(recipe.color || "#f2b441")}22;">${recipe.emoji || "🍽️"}</div>
          <div class="match-result-body">
            <div class="recipe-card-title">${MasakApa.escapeHtml(recipe.name)}</div>
            <div class="match-percent ${level.cls}">${match.percent}% · ${level.label}</div>
            <div class="progress-bar"><div class="progress-bar-fill" style="width:${match.percent}%"></div></div>
            ${
              match.missing.length > 0
                ? `<div class="match-missing">Bahan diperlukan: ${missingNames}</div>`
                : `<div class="match-missing">Semua bahan utama sudah ada!</div>`
            }
          </div>
        </a>`;
      })
      .join("");
  }

  renderResults();
});
