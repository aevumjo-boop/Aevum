
(function () {
  var key = "aevum-lang";
  function apply(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = document.documentElement.getAttribute(lang === "ar" ? "data-title-ar" : "data-title-en");
    document.querySelectorAll("[data-en]").forEach(function (el) {
      el.textContent = el.getAttribute(lang === "ar" ? "data-ar" : "data-en");
    });
    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-set-lang") === lang ? "true" : "false");
    });
    var menuBtn = document.querySelector(".menu-btn");
    if (menuBtn) {
      var open = menuBtn.getAttribute("aria-expanded") === "true";
      menuBtn.setAttribute("aria-label", open ? (lang === "ar" ? "إغلاق" : "Close") : (lang === "ar" ? "القائمة" : "Menu"));
    }
    try { localStorage.setItem(key, lang); } catch (err) {}
  }
  var saved = "en";
  try { saved = localStorage.getItem(key) || "en"; } catch (err) {}
  apply(saved === "ar" ? "ar" : "en");
  document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
    btn.addEventListener("click", function () { apply(btn.getAttribute("data-set-lang")); });
  });
  var menuBtn = document.querySelector(".menu-btn");
  var panel = document.querySelector(".menu-panel");
  if (menuBtn && panel) {
    menuBtn.addEventListener("click", function () {
      var open = menuBtn.getAttribute("aria-expanded") !== "true";
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      panel.classList.toggle("is-open", open);
      apply(document.documentElement.lang === "ar" ? "ar" : "en");
    });
  }
  var reveals = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    reveals.forEach(function (node) { node.classList.add("is-in"); });
  } else {
    var watcher = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        watcher.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (node) { watcher.observe(node); });
  }
})();

(function () {
  var header = document.querySelector(".site-header");
  if (!header) return;
  function sync() {
    header.classList.toggle("is-scrolled", window.scrollY > 10);
  }
  sync();
  window.addEventListener("scroll", sync, { passive: true });
})();
