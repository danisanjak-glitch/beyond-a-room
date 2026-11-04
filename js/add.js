/* "Add your own links" page: validate, send to the private Google Form, go back home. */
(function () {
  "use strict";

  var BAR = window.BAR;
  var cfg = window.BAR_CONFIG || {};
  var COOLDOWN_MS = 10000;
  var REDIRECT_MS = 2600;

  var form = document.getElementById("link-form");
  var input = document.getElementById("url");
  var button = document.getElementById("submit");
  var statusEl = document.getElementById("form-status");
  var lastMessageKey = null;

  function say(key, kind) {
    lastMessageKey = key;
    statusEl.setAttribute("data-kind", kind || "");
    statusEl.textContent = key ? BAR.t(key) : "";
  }

  BAR.onLang = function () {
    input.setAttribute("placeholder", BAR.t("placeholder"));
    if (lastMessageKey) statusEl.textContent = BAR.t(lastMessageKey);
  };
  BAR.applyLang();

  /* Returns a clean http(s) URL string, or null if the text is not a valid web address. */
  function cleanUrl(raw) {
    var text = String(raw || "").trim();
    if (!text || /\s/.test(text)) return null;
    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(text)) text = "https://" + text; // allow "example.com"

    var u;
    try { u = new URL(text); } catch (e) { return null; }

    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (u.username || u.password) return null;
    var host = u.hostname;
    if (host.length > 253 || host.indexOf(".") === -1) return null;
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return null; // no raw IP addresses
    var tld = host.split(".").pop();
    if (!/^([a-z]{2,}|xn--[a-z0-9-]+)$/i.test(tld)) return null;
    return u.href;
  }

  function configured() {
    return cfg.formAction && cfg.fieldName &&
      cfg.formAction.indexOf("YOUR_FORM_ID") === -1 &&
      cfg.fieldName !== "entry.0000000000";
  }

  function succeed() {
    say("success", "success");
    input.value = "";
    input.disabled = true;
    button.disabled = true;
    setTimeout(function () { window.location.href = "index.html"; }, REDIRECT_MS);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    input.removeAttribute("aria-invalid");

    // Hidden honeypot: a person never fills it. Pretend success, send nothing.
    if (form.elements.website && form.elements.website.value) { succeed(); return; }

    var raw = input.value.trim();
    if (!raw) { input.setAttribute("aria-invalid", "true"); say("errEmpty", "error"); input.focus(); return; }

    var url = cleanUrl(raw);
    if (!url) { input.setAttribute("aria-invalid", "true"); say("errInvalid", "error"); input.focus(); return; }

    var lastSent = Number(BAR.store.get("sessionStorage", "bar-last-submit") || 0);
    if (Date.now() - lastSent < COOLDOWN_MS) { say("errWait", "error"); return; }

    if (!configured()) { say("errConfig", "error"); return; }

    button.disabled = true;
    say("sending", "");

    var body = new URLSearchParams();
    body.append(cfg.fieldName, url);

    // Google Forms does not allow reading the reply from another site (no-cors),
    // so success means "the request left the browser". The README explains how to test it.
    fetch(cfg.formAction, { method: "POST", mode: "no-cors", body: body })
      .then(function () {
        BAR.store.set("sessionStorage", "bar-last-submit", String(Date.now()));
        succeed();
      })
      .catch(function () {
        button.disabled = false;
        say("errNetwork", "error");
      });
  });

  input.addEventListener("input", function () { input.removeAttribute("aria-invalid"); });

  BAR.ready(function () { BAR.setStage("home"); });
})();
