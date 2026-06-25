// i18n.js

async function initLanguage() {
  const supported = ["en", "ru"];

  let lang = navigator.language
    .toLowerCase()
    .split("-")[0];

  if (!supported.includes(lang)) {
    lang = "en";
  }

  let translations;

  try {
    const response = await fetch(`./locales/${lang}.json`);
    translations = await response.json();
  } catch {
    const response = await fetch("./locales/en.json");
    translations = await response.json();
  }

  window.i18n = translations;

  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = translations[key] || key;
  });

  document.dispatchEvent(
    new CustomEvent("i18n-ready")
  );
}

window.i18n = {};

window.t = function (key, vars = {}) {
  let text = window.i18n[key] || key;

  Object.keys(vars).forEach(name => {
    text = text.replace(`{${name}}`, vars[name]);
  });

  return text;
};

initLanguage();