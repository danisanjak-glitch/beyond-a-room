/* Landing page: entry gate, one-time sound introduction, concept overlay,
   and the "Explore a random web" button. */
(function () {
  "use strict";

  var BAR = window.BAR;
  var SEEN_KEY = "bar-seen-v1"; // set once the visitor has been through the introduction
  var AUDIO_SRC = "assets/intro.m4a";

  var $ = function (id) { return document.getElementById(id); };
  var seen = BAR.store.get("localStorage", SEEN_KEY) === "1";

  /* =====================================================================
     Introduction flow:  gate -> intro (sound) -> concept -> home
     Returning visitors go straight to home, with no sound.
     ===================================================================== */
  var audio = null;
  var introStartedAt = 0;
  var fadeTimer = null;

  function goAfterIntro() {
    if (seen) { BAR.setStage("home"); return; }
    BAR.setStage("concept");
    $("concept-ok").focus({ preventScroll: true });
  }

  function stopAudio() {
    if (!audio) return;
    var a = audio;
    audio = null;
    var vol = a.volume;
    clearInterval(fadeTimer);
    fadeTimer = setInterval(function () { // short fade-out so the cut is never abrupt
      vol -= 0.1;
      if (vol <= 0) { clearInterval(fadeTimer); a.pause(); a.removeAttribute("src"); a.load(); }
      else { a.volume = vol; }
    }, 60);
  }

  function finishIntro() {
    if (document.body.getAttribute("data-stage") !== "intro") return;
    stopAudio();
    goAfterIntro();
  }

  function enterWithSound(ev) {
    ev.stopPropagation(); // this same tap must not also count as "skip"
    audio = new Audio(AUDIO_SRC);
    audio.preload = "auto";
    audio.addEventListener("ended", finishIntro);
    audio.addEventListener("error", finishIntro);

    // Restart the video so picture and sound begin together.
    if (BAR.video) {
      try { BAR.video.currentTime = 0; } catch (e) { /* ignore */ }
      if (!BAR.reduceMotion) { var vp = BAR.video.play(); if (vp && vp.catch) vp.catch(function () {}); }
    }

    var playing = audio.play();
    BAR.setStage("intro");
    introStartedAt = Date.now();
    if (playing && playing.catch) playing.catch(finishIntro); // sound refused: carry on silently
  }

  function enterSilently(ev) {
    ev.stopPropagation();
    goAfterIntro();
  }

  // Tap or click anywhere during the introduction to skip it.
  document.addEventListener("click", function (e) {
    if (document.body.getAttribute("data-stage") !== "intro") return;
    if (Date.now() - introStartedAt < 400) return;
    if (e.target.closest && e.target.closest(".chip-btn")) return; // the mute button
    finishIntro();
  });
  document.addEventListener("keydown", function (e) {
    if (document.body.getAttribute("data-stage") !== "intro") return;
    if (e.key === "Escape" || e.key === " " || e.key === "Enter") {
      if (e.target.closest && e.target.closest(".chip-btn")) return;
      e.preventDefault();
      finishIntro();
    }
  });

  // Mute toggle
  var muteBtn = $("mute");
  function renderMute() {
    var muted = !!(audio && audio.muted) || muteBtn.getAttribute("data-muted") === "1";
    muteBtn.setAttribute("aria-pressed", String(muted));
    muteBtn.textContent = BAR.t(muted ? "unmute" : "mute");
  }
  muteBtn.addEventListener("click", function () {
    var muted = muteBtn.getAttribute("data-muted") !== "1";
    muteBtn.setAttribute("data-muted", muted ? "1" : "0");
    if (audio) audio.muted = muted;
    renderMute();
  });

  $("enter-sound").addEventListener("click", enterWithSound);
  $("enter-silent").addEventListener("click", enterSilently);
  $("concept-ok").addEventListener("click", function () {
    seen = true;
    BAR.store.set("localStorage", SEEN_KEY, "1");
    BAR.setStage("home");
    $("explore").focus({ preventScroll: true });
  });

  /* =====================================================================
     Explore a random web
     links.txt is loaded once up front, so the click itself stays
     synchronous. That keeps browsers from blocking the new tab.
     ===================================================================== */
  var links = [];
  var bag = [];
  var last = BAR.store.get("sessionStorage", "bar-last") || null;
  var status = $("explore-status");
  var linksFailed = false;

  function parseLinks(text) {
    var seenUrls = {};
    return text.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(function (l) {
      if (!l || l.charAt(0) === "#") return false;
      try {
        var u = new URL(l);
        if (u.protocol !== "http:" && u.protocol !== "https:") return false;
      } catch (e) { return false; }
      if (seenUrls[l]) return false;
      seenUrls[l] = true;
      return true;
    });
  }

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  /* Shuffle-bag: every link is used once before any link repeats,
     and a new round never starts with the link just shown. */
  function nextLink() {
    if (!links.length) return null;
    if (!bag.length) {
      bag = shuffle(links.slice());
      if (links.length > 1 && bag[bag.length - 1] === last) {
        var swap = bag[0]; bag[0] = bag[bag.length - 1]; bag[bag.length - 1] = swap;
      }
    }
    last = bag.pop();
    BAR.store.set("sessionStorage", "bar-last", last);
    return last;
  }

  function showLinksError() {
    status.setAttribute("data-kind", "error");
    status.textContent = BAR.t("linksError");
  }

  fetch("links.txt", { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(function (text) {
      links = parseLinks(text);
      if (!links.length) throw new Error("empty");
    })
    .catch(function () { linksFailed = true; });

  $("explore").addEventListener("click", function (e) {
    var url = nextLink();
    if (!url) {
      e.preventDefault();
      if (linksFailed) showLinksError();
      return;
    }
    status.textContent = "";
    this.href = url; // the browser then follows the link in a new tab (target="_blank")
  });

  BAR.onLang = function () {
    renderMute();
    if (status.getAttribute("data-kind") === "error" && status.textContent) showLinksError();
  };

  /* ---------- Start ---------- */
  BAR.applyLang();
  BAR.ready(function () {
    if (seen) BAR.setStage("home");
    else BAR.setStage("gate");
  });
})();
