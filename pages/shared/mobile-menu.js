(function () {
  var btn = document.querySelector(".menu-btn");
  var panel = document.querySelector("#mobile-menu");
  if (!btn || !panel) return;
  var y = 0;
  function lock(on) {
    if (on) {
      y = window.scrollY || window.pageYOffset || 0;
      document.body.style.position = "fixed";
      document.body.style.top = "-" + y + "px";
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
    } else {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, y);
    }
  }
  new MutationObserver(function () {
    lock(btn.getAttribute("aria-expanded") === "true");
  }).observe(btn, { attributes: true, attributeFilter: ["aria-expanded"] });
})();
