// Theme toggle
(function () {
  var ACTIVE_CLASSES = ["bg-surface-alt/80", "text-accent", "font-semibold"];
  var INACTIVE_CLASSES = ["hover:bg-surface-alt", "text-text"];

  function applyTheme(theme) {
    var root = document.documentElement;
    if (theme === "system") {
      var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);
    } else {
      root.classList.toggle("dark", theme === "dark");
    }
    localStorage.setItem("theme", theme);

    // Update active states in theme dropdowns
    document.querySelectorAll("[data-theme-option]").forEach(function (btn) {
      var isActive = btn.getAttribute("data-theme-option") === theme;
      var iconSpan = btn.querySelector("span.shrink-0");
      var checkSpan = btn.querySelector("span.text-accent:last-child");

      if (isActive) {
        INACTIVE_CLASSES.forEach(function (c) { btn.classList.remove(c); });
        ACTIVE_CLASSES.forEach(function (c) { btn.classList.add(c); });
        if (iconSpan) { iconSpan.classList.remove("opacity-70"); iconSpan.classList.add("opacity-100"); }
        if (!checkSpan) {
          var check = document.createElement("span");
          check.className = "text-accent";
          check.innerHTML = "\u2713";
          btn.appendChild(check);
        }
      } else {
        ACTIVE_CLASSES.forEach(function (c) { btn.classList.remove(c); });
        INACTIVE_CLASSES.forEach(function (c) { btn.classList.add(c); });
        if (iconSpan) { iconSpan.classList.remove("opacity-100"); iconSpan.classList.add("opacity-70"); }
        if (checkSpan) checkSpan.remove();
      }
    });

    // Update theme icon in trigger button
    var iconMap = { light: "sun", dark: "moon", system: "laptop" };
    document.querySelectorAll("[data-theme-icon]").forEach(function (el) {
      el.innerHTML = window._icons[iconMap[theme]] || "";
    });
  }

  var stored = localStorage.getItem("theme") || "system";
  document.addEventListener("DOMContentLoaded", function () {
    applyTheme(stored);

    document.querySelectorAll("[data-theme-option]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyTheme(btn.getAttribute("data-theme-option"));
      });
    });
  });
})();

// Dropdowns
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-dropdown]").forEach(function (dropdown) {
      var trigger = dropdown.querySelector("[data-dropdown-trigger]");
      var menu = dropdown.querySelector("[data-dropdown-menu]");
      if (!trigger || !menu) return;

      trigger.addEventListener("click", function (e) {
        e.stopPropagation();
        // Close all other dropdowns
        document.querySelectorAll("[data-dropdown-menu]").forEach(function (m) {
          if (m !== menu) m.classList.add("hidden");
        });
        menu.classList.toggle("hidden");
      });

      menu.addEventListener("click", function () {
        menu.classList.add("hidden");
      });
    });

    document.addEventListener("mousedown", function (e) {
      document.querySelectorAll("[data-dropdown]").forEach(function (dropdown) {
        if (!dropdown.contains(e.target)) {
          var menu = dropdown.querySelector("[data-dropdown-menu]");
          if (menu) menu.classList.add("hidden");
        }
      });
    });
  });
})();

// Sidebar
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var sidebar = document.getElementById("sidebar");
    var backdrop = document.getElementById("sidebar-backdrop");
    if (!sidebar) return;

    function openSidebar() {
      sidebar.classList.remove("translate-x-full");
      sidebar.classList.add("translate-x-0");
      if (backdrop) backdrop.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    }

    function closeSidebar() {
      sidebar.classList.add("translate-x-full");
      sidebar.classList.remove("translate-x-0");
      if (backdrop) backdrop.classList.add("hidden");
      document.body.style.overflow = "";
    }

    document.querySelectorAll("[data-sidebar-open]").forEach(function (btn) {
      btn.addEventListener("click", openSidebar);
    });

    document.querySelectorAll("[data-sidebar-close]").forEach(function (btn) {
      btn.addEventListener("click", closeSidebar);
    });

    if (backdrop) {
      backdrop.addEventListener("click", closeSidebar);
    }

    sidebar.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeSidebar);
    });
  });
})();

// Expandable item cards
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-expandable]").forEach(function (card) {
      var trigger = card.querySelector("[data-expandable-trigger]");
      var preview = card.querySelector("[data-expandable-preview]");
      var content = card.querySelector("[data-expandable-content]");
      var chevron = card.querySelector("[data-expandable-chevron]");
      if (!trigger || !content) return;

      trigger.addEventListener("click", function () {
        var isExpanded = !content.classList.contains("hidden");
        content.classList.toggle("hidden");
        if (preview) preview.classList.toggle("hidden", !isExpanded);
        if (chevron) chevron.classList.toggle("rotate-180");
      });
    });
  });
})();

// Language picker
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-lang-switch]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var newLang = btn.getAttribute("data-lang-switch");
        var segments = window.location.pathname.split("/");
        if (segments.length > 1) {
          segments[1] = newLang;
          window.location.href = segments.join("/");
        }
      });
    });
  });
})();
