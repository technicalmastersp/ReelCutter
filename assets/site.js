(function () {
  "use strict";
  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  // Highlight the current page in the nav
  var here = location.pathname.replace(/index\.html$/, "");
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    var href = a.getAttribute("href").replace(/index\.html$/, "");
    if (href === here || (href !== "/" && here.indexOf(href) === 0)) {
      a.classList.add("active");
    }
  });
})();
