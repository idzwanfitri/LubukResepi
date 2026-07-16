/* MasakApa — recipe.html detail page: load by slug, servings scaler, related recipes. */

document.addEventListener("DOMContentLoaded", async () => {
  const root = document.getElementById("recipe-detail");
  const slug = MasakApa.getParam("slug");

  if (!slug) {
    root.innerHTML = notFoundHTML();
    return;
  }

  let recipes = [];
  try {
    recipes = await MasakApa.loadRecipes();
  } catch (err) {
    root.innerHTML = `<div class="empty-state"><span class="empty-emoji">⚠️</span>Gagal memuatkan resepi.</div>`;
    console.error(err);
    return;
  }

  const recipe = recipes.find((r) => r.slug === slug);
  if (!recipe) {
    root.innerHTML = notFoundHTML();
    return;
  }

  document.title = `${recipe.name} — MasakApa`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", recipe.description);

  let currentServings = recipe.servings;

  function ingredientsHTML(servings) {
    const scaled = MasakApa.scaleIngredients(recipe.ingredients, recipe.servings, servings);
    return scaled
      .map((ing) => {
        const qty = MasakApa.formatQuantity(ing.quantity);
        const qtyText = qty ? `${qty} ${MasakApa.escapeHtml(ing.unit)}` : MasakApa.escapeHtml(ing.unit);
        return `
        <li>
          <span class="ingredient-name">
            ${MasakApa.escapeHtml(ing.name)}${ing.preparation ? ` <span class="ingredient-optional">(${MasakApa.escapeHtml(ing.preparation)})</span>` : ""}
            ${ing.optional ? '<span class="ingredient-optional"> · pilihan</span>' : ""}
          </span>
          <span class="ingredient-qty">${qtyText}</span>
        </li>`;
      })
      .join("");
  }

  function tagsHTML() {
    const tags = [];
    if (recipe.country) tags.push(`<span class="badge badge-country">${MasakApa.escapeHtml(recipe.country)}</span>`);
    if (recipe.community) tags.push(`<span class="badge">${MasakApa.escapeHtml(recipe.community)}</span>`);
    (recipe.dietary_tags || []).forEach((t) => tags.push(`<span class="badge">${MasakApa.escapeHtml(t)}</span>`));
    (recipe.category || []).forEach((c) => tags.push(`<span class="badge">${MasakApa.escapeHtml(c)}</span>`));
    return tags.join("");
  }

  function relatedHTML() {
    const related = recipes
      .filter((r) => r.slug !== recipe.slug && (r.country === recipe.country || r.category.some((c) => recipe.category.includes(c))))
      .slice(0, 4);
    if (related.length === 0) return "";
    return `
      <div class="recipe-section">
        <h2>Resepi Berkaitan</h2>
        <div class="recipe-grid">${related.map(MasakApa.recipeCardHTML).join("")}</div>
      </div>`;
  }

  root.innerHTML = `
    <nav class="breadcrumb"><a href="index.html">Utama</a> / <a href="recipes.html">Resepi</a> / ${MasakApa.escapeHtml(recipe.name)}</nav>
    <div class="recipe-hero">
      <div class="recipe-hero-media" style="background:${MasakApa.escapeHtml(recipe.color || "#f2b441")}22;">
        <span aria-hidden="true">${recipe.emoji || "🍽️"}</span>
      </div>
      <div class="recipe-hero-info">
        <h1 class="recipe-title">${MasakApa.escapeHtml(recipe.name)}</h1>
        <p class="recipe-desc">${MasakApa.escapeHtml(recipe.description)}</p>
        <div class="chip-row">${tagsHTML()}</div>
        <div class="recipe-meta-grid">
          <div class="meta-tile"><span class="meta-label">Penyediaan</span><span class="meta-value">${MasakApa.formatTime(recipe.prep_time)}</span></div>
          <div class="meta-tile"><span class="meta-label">Memasak</span><span class="meta-value">${MasakApa.formatTime(recipe.cook_time)}</span></div>
          <div class="meta-tile"><span class="meta-label">Kesukaran</span><span class="meta-value">${MasakApa.escapeHtml(recipe.difficulty)}</span></div>
          <div class="meta-tile"><span class="meta-label">Anggaran Kos</span><span class="meta-value">${MasakApa.formatCost(recipe.estimated_cost)}</span></div>
        </div>
        <div class="recipe-actions">
          <div class="servings-control">
            <button type="button" id="servings-minus" aria-label="Kurangkan hidangan">−</button>
            <span><strong id="servings-value">${currentServings}</strong> hidangan</span>
            <button type="button" id="servings-plus" aria-label="Tambahkan hidangan">+</button>
          </div>
          <button type="button" class="btn btn-outline" id="print-btn">🖨️ Cetak</button>
          <button type="button" class="btn btn-outline" id="share-btn">🔗 Kongsi</button>
        </div>
      </div>
    </div>

    <div class="recipe-section">
      <h2>Bahan-Bahan</h2>
      <ul class="ingredient-list" id="ingredient-list">${ingredientsHTML(currentServings)}</ul>
    </div>

    <div class="recipe-section">
      <h2>Cara Memasak</h2>
      <ol class="steps-list">
        ${recipe.steps
          .map(
            (step) => `
          <li>
            <span class="step-number">${step.number}</span>
            <span>${MasakApa.escapeHtml(step.instruction)}</span>
          </li>`
          )
          .join("")}
      </ol>
    </div>

    ${
      recipe.substitutions && recipe.substitutions.length
        ? `<div class="recipe-section">
            <h2>Bahan Pengganti</h2>
            <ul class="subs-list">
              ${recipe.substitutions.map((s) => `<li><strong>${MasakApa.escapeHtml(s.ingredient)}</strong> → ${MasakApa.escapeHtml(s.substitute)}</li>`).join("")}
            </ul>
          </div>`
        : ""
    }

    ${
      recipe.tips && recipe.tips.length
        ? `<div class="recipe-section">
            <h2>Tips</h2>
            <ul class="tips-list">${recipe.tips.map((t) => `<li>💡 ${MasakApa.escapeHtml(t)}</li>`).join("")}</ul>
          </div>`
        : ""
    }

    ${relatedHTML()}
  `;

  const servingsValue = document.getElementById("servings-value");
  const ingredientList = document.getElementById("ingredient-list");

  document.getElementById("servings-minus").addEventListener("click", () => {
    if (currentServings <= 1) return;
    currentServings -= 1;
    servingsValue.textContent = currentServings;
    ingredientList.innerHTML = ingredientsHTML(currentServings);
  });

  document.getElementById("servings-plus").addEventListener("click", () => {
    currentServings += 1;
    servingsValue.textContent = currentServings;
    ingredientList.innerHTML = ingredientsHTML(currentServings);
  });

  document.getElementById("print-btn").addEventListener("click", () => window.print());

  document.getElementById("share-btn").addEventListener("click", async () => {
    const shareData = { title: recipe.name, text: recipe.description, url: window.location.href };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        /* user cancelled share — no action needed */
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Pautan resepi disalin ke papan klip!");
    }
  });

  function notFoundHTML() {
    return `<div class="empty-state"><span class="empty-emoji">🔍</span>Resepi tidak dijumpai. <a href="recipes.html">Kembali ke senarai resepi</a>.</div>`;
  }
});
