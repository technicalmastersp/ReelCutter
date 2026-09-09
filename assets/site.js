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
  function normalizePath(path) {
    path = path.replace(/index\.html$/, "");
    path = path.replace(/\/$/, "");
    return path || "/";
  }

  var here = normalizePath(location.pathname);

  document.querySelectorAll(".nav-links a").forEach(function (a) {
    // Use a.pathname (browser-resolved absolute path), not
    // a.getAttribute("href") (the raw relative string as written in the
    // HTML, e.g. "../about.html") — comparing the raw string against
    // location.pathname never matched except by accident.
    var hrefPath = normalizePath(a.pathname);
    var isExact = hrefPath === here;
    var isParent = hrefPath !== "/" && here.indexOf(hrefPath + "/") === 0;
    if (isExact || isParent) {
      a.classList.add("active");
    }
  });
})();
