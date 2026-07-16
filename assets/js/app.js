/* LubukResepi — shared utilities used across all pages. */

const LubukResepi = (() => {
  const DATA_CACHE = {};

  async function fetchJSON(path) {
    if (DATA_CACHE[path]) return DATA_CACHE[path];
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Gagal memuatkan ${path}`);
    const json = await res.json();
    DATA_CACHE[path] = json;
    return json;
  }

  function loadRecipes() {
    return fetchJSON("data/recipes.json").then((recipes) => recipes.filter((r) => r.published));
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function debounce(fn, wait = 250) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  }

  function formatTime(minutes) {
    if (minutes === null || minutes === undefined) return "-";
    if (minutes === 0) return "Tiada masak";
    if (minutes < 60) return `${minutes} minit`;
    const hrs = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest === 0 ? `${hrs} jam` : `${hrs} jam ${rest} minit`;
  }

  function formatCost(cost) {
    if (!cost) return "-";
    return `RM${cost.minimum} - RM${cost.maximum}`;
  }

  function formatQuantity(qty) {
    if (qty === null || qty === undefined) return "";
    const rounded = Math.round(qty * 100) / 100;
    return Number.isInteger(rounded) ? String(rounded) : String(rounded.toFixed(2)).replace(/0+$/, "").replace(/\.$/, "");
  }

  function scaleIngredients(ingredients, originalServings, newServings) {
    const factor = newServings / originalServings;
    return ingredients.map((ing) => ({
      ...ing,
      quantity: typeof ing.quantity === "number" ? ing.quantity * factor : ing.quantity,
    }));
  }

  function communityOrCountry(recipe) {
    const parts = [];
    if (recipe.community) parts.push(recipe.community);
    if (recipe.country) parts.push(recipe.country);
    return parts.join(" · ");
  }

  function recipeCardHTML(recipe) {
    const tags = [];
    if (recipe.country) tags.push(`<span class="badge badge-country">${escapeHtml(recipe.country)}</span>`);
    if (recipe.community) tags.push(`<span class="badge">${escapeHtml(recipe.community)}</span>`);
    if (recipe.difficulty) tags.push(`<span class="badge">${escapeHtml(recipe.difficulty)}</span>`);

    return `
      <a class="recipe-card" href="recipe.html?slug=${encodeURIComponent(recipe.slug)}">
        <div class="recipe-card-media" style="background:${escapeHtml(recipe.color || "#f2b441")}22;">
          ${
            recipe.image
              ? `<img src="${escapeHtml(recipe.image)}" alt="${escapeHtml(recipe.name)}" loading="lazy">`
              : `<span aria-hidden="true">${recipe.emoji || "🍽️"}</span>`
          }
          ${recipe.featured ? '<span class="badge-featured">⭐ Pilihan</span>' : ""}
        </div>
        <div class="recipe-card-body">
          <h3 class="recipe-card-title">${escapeHtml(recipe.name)}</h3>
          <div class="recipe-card-meta">
            <span>⏱️ ${formatTime(recipe.total_time)}</span>
            <span>🍽️ ${recipe.servings} org</span>
            <span>💰 ${formatCost(recipe.estimated_cost)}</span>
          </div>
          <div class="recipe-card-tags">${tags.join("")}</div>
        </div>
      </a>
    `;
  }

  function initNav() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".main-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
    nav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function initFooterYear() {
    const el = document.getElementById("footer-year");
    if (el) el.textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initFooterYear();
  });

  return {
    fetchJSON,
    loadRecipes,
    escapeHtml,
    getParam,
    debounce,
    formatTime,
    formatCost,
    formatQuantity,
    scaleIngredients,
    communityOrCountry,
    recipeCardHTML,
  };
})();
