/* ================================
   Global State & DOM
================================ */
let currentResults = [];
let isSingleResult = false;

const searchInput = document.getElementById("searchInput");
const qtySelect = document.getElementById("qtySelect");
const sortSelect = document.getElementById("sortSelect");

const grid = document.getElementById("results-grid");
const loadingState = document.getElementById("loading-state");
const emptyState = document.getElementById("empty-state");
const resultsMeta = document.getElementById("results-meta");
const targetMpnDisplay = document.getElementById("target-mpn");
const resultCount = document.getElementById("result-count");
const API_BASE = "https://xuanlabs-passive-tool.onrender.com";

/* ================================
   Utilities
================================ */
function formatCurrency(num) {
  if (num === null || num === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 3
  }).format(num);
}

function getBadgeClass(status) {
  if (status.includes("Reference")) return "badge-safe";
  if (status.includes("Cheapest") || status.includes("Best")) return "badge-safe";
  if (status.includes("Good")) return "badge-warn";
  return "badge-risk";
}

/* ================================
   Render Results
================================ */
function renderResults() {
  const qty = parseInt(qtySelect.value);
  const sort = sortSelect.value;

  let sorted = [...currentResults];

  // Sorting (disable price sort for single result)
  if (!isSingleResult) {
    if (sort === "price_asc") {
      sorted.sort((a, b) => {
        if (a.prices[qty] == null) return 1;
        if (b.prices[qty] == null) return -1;
        return a.prices[qty] - b.prices[qty];
      });
    } else if (sort === "price_desc") {
      sorted.sort((a, b) => {
        if (a.prices[qty] == null) return 1;
        if (b.prices[qty] == null) return -1;
        return b.prices[qty] - a.prices[qty];
      });
    } else {
      sorted.sort((a, b) => b.score - a.score);
    }
  }

  grid.innerHTML = "";

  sorted.forEach(item => {
    const price = item.prices[qty];
    const bulkPrice = item.prices[1000];
    const badgeClass = getBadgeClass(item.status);

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="card-header">
        <div class="mpn-block">
          <span class="mpn">${item.mpn}</span>
          <span class="manufacturer">${item.manufacturer}</span>
        </div>
        <span class="badge ${badgeClass}">${item.status}</span>
      </div>

      <div class="specs-grid">
        <div class="spec-item"><span class="spec-label">Cap</span><span class="spec-value">${item.specs.capacitance}</span></div>
        <div class="spec-item"><span class="spec-label">Volt</span><span class="spec-value">${item.specs.voltage}</span></div>
        <div class="spec-item"><span class="spec-label">Diel</span><span class="spec-value">${item.specs.dielectric}</span></div>
        <div class="spec-item"><span class="spec-label">Case</span><span class="spec-value">${item.specs.case}</span></div>
        <div class="spec-item"><span class="spec-label">Tol</span><span class="spec-value">${item.specs.tolerance}</span></div>
        <div class="spec-item"><span class="spec-label">Temp</span><span class="spec-value">${item.specs.temp}</span></div>
      </div>

      <div class="pricing-section">
        <div class="unit-price-block">
          <span class="price-label">Unit Price (Qty ${qty})</span>
          <span class="unit-price">${formatCurrency(price)}</span>
        </div>
        <div class="bulk-price">
          <div>Best Bulk Price</div>
          <div style="font-weight:700">${formatCurrency(bulkPrice)}</div>
          <div style="font-size:0.65rem;color:var(--text-muted)">AT QTY 1,000</div>
        </div>
      </div>

      <div class="card-footer">
        <span class="stock ${item.stock > 1000 ? "in-stock" : "low-stock"}">
          ${item.stock.toLocaleString()} units available
        </span>
        <a href="${item.datasheet}" target="_blank" class="datasheet-link">Datasheet</a>
      </div>
    `;

    grid.appendChild(card);
  });
}

/* ================================
   Search Handler (MPN + Description)
================================ */
async function handleSearch() {
  const query = searchInput.value.trim();
  if (!query) return;

  emptyState.classList.add("hidden");
  resultsMeta.classList.add("hidden");
  grid.innerHTML = "";
  loadingState.classList.remove("hidden");

  const qty = parseInt(qtySelect.value);

  try {
    const res = await fetch(
      `${API_BASE}/search?part_number=${encodeURIComponent(query)}&qty=${qty}`,
      { method: "POST" }
    );

    const data = await res.json();
    loadingState.classList.add("hidden");

    if (!data.results || data.results.length === 0) {
      emptyState.classList.remove("hidden");
      return;
    }

    isSingleResult = data.results.length === 1;

    const referencePrice =
      !isSingleResult && data.results[0]?.price_at_qty
        ? data.results[0].price_at_qty
        : null;

    currentResults = data.results.map((p) => ({
      mpn: p.mpn,
      manufacturer: p.manufacturer || "—",
      datasheet: p.datasheet,
      stock: parseInt(p.stock || 0),

      specs: {
        capacitance: p.capacitance_uF ? `${p.capacitance_uF} µF` : "—",
        voltage: p.voltage_V ? `${p.voltage_V} V` : "—",
        dielectric: p.dielectric || "—",
        case: p.package || "—",
        tolerance: p.tolerance_pct ? `±${p.tolerance_pct}%` : "—",
        temp: p.temperature || "—"
      },

      prices: {
        1: p.unit_price ?? null,
        100: p.price_at_qty ?? null,
        1000: p.best_price ?? null
      },

      score: p.score ?? 0,

      status: isSingleResult
        ? "Reference component"
        : p.is_cheapest_safe
            ? "Cheapest safe"
            : p.score >= 80
                ? "Best drop-in"
                : p.score >= 50
                    ? "Good alternative"
                    : "Risky replacement"
    }));

    resultsMeta.classList.remove("hidden");
    targetMpnDisplay.textContent = query.toUpperCase();

    resultCount.textContent = isSingleResult
      ? "Reference component found – no alternatives returned"
      : `${currentResults.length} alternatives identified`;

    renderResults();

  } catch (err) {
    console.error(err);
    loadingState.classList.add("hidden");
    emptyState.classList.remove("hidden");
  }
}

/* ================================
   Event Listeners
================================ */
qtySelect.addEventListener("change", renderResults);
sortSelect.addEventListener("change", renderResults);

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleSearch();
});
