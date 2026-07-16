/* LubukResepi — filter/sort helpers shared by the recipes listing page. */

const LubukResepiFilters = (() => {
  function populateSelect(selectEl, items, { valueKey = "name", labelKey = "name", allLabel } = {}) {
    if (!selectEl) return;
    const options = [`<option value="">${LubukResepi.escapeHtml(allLabel)}</option>`];
    items.forEach((item) => {
      options.push(`<option value="${LubukResepi.escapeHtml(item[valueKey])}">${LubukResepi.escapeHtml(item[labelKey])}</option>`);
    });
    selectEl.innerHTML = options.join("");
  }

  function applyFilters(recipes, filters) {
    const q = (filters.q || "").trim().toLowerCase();
    return recipes.filter((recipe) => {
      if (q) {
        const haystack = [recipe.name, ...(recipe.alternative_names || [])].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filters.category && !recipe.category.includes(filters.category)) return false;
      if (filters.country && recipe.country !== filters.country) return false;
      if (filters.community && recipe.community !== filters.community) return false;
      if (filters.difficulty && recipe.difficulty !== filters.difficulty) return false;
      if (filters.maxTime && recipe.total_time > Number(filters.maxTime)) return false;
      return true;
    });
  }

  function sortRecipes(recipes, sortKey) {
    const list = [...recipes];
    switch (sortKey) {
      case "cepat":
        return list.sort((a, b) => a.total_time - b.total_time);
      case "kos":
        return list.sort((a, b) => a.estimated_cost.minimum - b.estimated_cost.minimum);
      case "az":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "pilihan":
        return list.sort((a, b) => (b.featured === true) - (a.featured === true));
      case "terbaru":
      default:
        return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  }

  return { populateSelect, applyFilters, sortRecipes };
})();
