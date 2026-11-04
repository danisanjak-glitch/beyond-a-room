/* Shared behaviour for every page: safe storage, language, background video, stages. */
(function () {
  "use strict";

  var BAR = (window.BAR = window.BAR || {});

  /* ---------- Storage that never throws (private mode, blocked storage) ---------- */
  BAR.store = {
    get: function (area, key) {
      try { return window[area].getItem(key); } catch (e) { return null; }
    },
    set: function (area, key, value) {
      try { window[area].setItem(key, value); } catch (e) { /* ignore */ }
    }
  };

  /* ---------- Language ---------- */
  var LANGS = ["en", "fr", "es"];
  var LANG_KEY = "bar-lang";
  BAR.lang = LANGS.indexOf(BAR.store.get("localStorage", LANG_KEY)) > -1
    ? BAR.store.get("localStorage", LANG_KEY)
    : "en";

  BAR.t = function (key) {
    var dict = window.BAR_I18N[BAR.lang] || window.BAR_I18N.en;
    return dict[key] != null ? dict[key] : window.BAR_I18N.en[key] || key;
  };

  BAR.applyLang = function () {
    document.documentElement.lang = BAR.lang;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = BAR.t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      el.setAttribute("aria-label", BAR.t(el.getAttribute("data-i18n-aria")));
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      el.setAttribute("placeholder", BAR.t(el.getAttribute("data-i18n-placeholder")));
    });
    document.querySelectorAll("[data-lang]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-lang") === BAR.lang));
    });
    if (typeof BAR.onLang === "function") BAR.onLang();
  };

  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest("[data-lang]");
    if (!btn) return;
    BAR.lang = btn.getAttribute("data-lang");
    BAR.store.set("localStorage", LANG_KEY, BAR.lang);
    BAR.applyLang();
  });

  /* ---------- Background video ---------- */
  var video = document.getElementById("bg");
  BAR.video = video;

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  BAR.reduceMotion = reduceMotion;

  if (video) {
    // A lighter file for small screens saves mobile data.
    var small = Math.min(window.innerWidth, window.innerHeight) <= 720;
    video.src = small ? "assets/background-480.mp4" : "assets/background-720.mp4";
    video.muted = true; // the video file is silent; the sound is a separate track
    if (!reduceMotion) {
      var p = video.play();
      if (p && p.catch) p.catch(function () { /* autoplay blocked: poster stays visible */ });
    }
  }

  /* ---------- Stages: elements with data-stages fade in/out together ---------- */
  BAR.setStage = function (stage) {
    document.body.setAttribute("data-stage", stage);
    document.querySelectorAll("[data-stages]").forEach(function (el) {
      var on = el.getAttribute("data-stages").split(" ").indexOf(stage) > -1;
      el.classList.toggle("is-on", on);
    });
  };

  /* Apply the language straight away, then show the first stage on the next frame
     so the fade-in is visible. */
  BAR.applyLang();
  BAR.ready = function (fn) {
    requestAnimationFrame(function () { requestAnimationFrame(fn); });
  };
})();
