// ===== Controller Tier 2026 — minimal vanilla JS =====
(function () {
  "use strict";

  // --- Google Ads conversion tracking for "Buy on Amazon" clicks ---
  // Paste your conversion LABEL below — it's the part AFTER the slash in the
  // event snippet Google gives you, e.g. send_to: 'AW-18198960301/AbC-D_efG12'
  // means the label is "AbC-D_efG12". Until a label is set, tracking is off.
  var GADS_CONVERSION_LABEL = "J7H_COupo7YcEK2x-OVD";

  document.querySelectorAll(".btn-buy").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (typeof window.gtag !== "function" || !GADS_CONVERSION_LABEL) return;
      // Unique per click. We have no real Amazon order ID (the purchase happens
      // off-site), so this both clears Google's "missing transaction_id" warning
      // and keeps each click counted as its own conversion.
      var txnId = "buy-" + Date.now() + "-" + Math.floor(Math.random() * 1e6);
      window.gtag("event", "conversion", {
        send_to: "AW-18198960301/" + GADS_CONVERSION_LABEL,
        value: 1.0,
        currency: "USD",
        transaction_id: txnId,
        // Which controller was clicked — handy in your Google Ads reports
        item: (btn.closest(".card") &&
               btn.closest(".card").querySelector("h3") &&
               btn.closest(".card").querySelector("h3").textContent) || "unknown"
      });
    });
  });

  // --- Comparison table: tap a row to jump to its full review ---
  document.querySelectorAll(".compare tbody tr").forEach(function (row) {
    row.addEventListener("click", function (e) {
      // Let real links behave normally
      if (e.target.closest("a")) return;
      var target = row.getAttribute("data-target");
      if (target) {
        var el = document.getElementById(target);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          el.style.outline = "2px solid var(--accent)";
          setTimeout(function () { el.style.outline = ""; }, 1200);
        }
      }
    });
  });

  // --- Platform filter: table rows + cards ---
  var chips = document.querySelectorAll(".chip");
  var rows = document.querySelectorAll(".compare tbody tr");
  var cards = document.querySelectorAll(".card");

  function applyFilter(filter) {
    var toggle = function (el) {
      var platforms = (el.getAttribute("data-platforms") || "").split(/\s+/);
      var show = filter === "all" || platforms.indexOf(filter) !== -1;
      el.classList.toggle("is-hidden", !show);
    };
    rows.forEach(toggle);
    cards.forEach(toggle);
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("active"); });
      chip.classList.add("active");
      applyFilter(chip.getAttribute("data-filter"));
    });
  });

  // --- Active-section highlight in the nav ---
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav a"));
  var sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) { l.classList.remove("active"); });
            var active = navLinks.find(function (l) {
              return l.getAttribute("href") === "#" + entry.target.id;
            });
            if (active) active.classList.add("active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) { observer.observe(s); });
  }
})();
