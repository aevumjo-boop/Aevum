
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
  var params = new URLSearchParams(location.search);
  var chosen = params.get("service");
  if (chosen) {
    document.querySelectorAll('input[name="service"]').forEach(function (input) {
      if (input.value === chosen) input.checked = true;
    });
  }
  var form = document.querySelector("form");
  var thanks = document.querySelector(".thanks");
  if (!form || !thanks) return;
  function showError(name, on) {
    var node = form.querySelector('[data-for="' + name + '"]');
    if (node) node.hidden = !on;
    var field = document.getElementById(name === "services" ? "services-group" : name);
    if (field && field.setAttribute) field.setAttribute("aria-invalid", on ? "true" : "false");
  }
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var data = new FormData(form);
    var name = String(data.get("name") || "").trim();
    var email = String(data.get("email") || "").trim();
    var description = String(data.get("description") || "").trim();
    var services = data.getAll("service");
    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    var errors = {
      name: !name,
      email: !emailOk,
      services: services.length === 0,
      description: description.length < 20
    };
    Object.keys(errors).forEach(function (key) { showError(key, errors[key]); });
    if (errors.name || errors.email || errors.services || errors.description) {
      var first = ["name", "email", "services", "description"].find(function (key) { return errors[key]; });
      var target = document.getElementById(first === "services" ? "services-group" : first);
      if (target) target.focus();
      return;
    }
    form.hidden = true;
    thanks.hidden = false;
  });
})();

(function () {
  var area = document.querySelector("#description");
  if (!area) return;
  function syncPlaceholder() {
    var lang = document.documentElement.lang === "ar" ? "ar" : "en";
    area.placeholder = area.getAttribute(lang === "ar" ? "data-placeholder-ar" : "data-placeholder-en");
  }
  var observer = new MutationObserver(syncPlaceholder);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  syncPlaceholder();
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
