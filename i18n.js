let currentLang = localStorage.getItem("lang") || "ru";

function t(key) {
  return LOCALES[currentLang]?.[key] || key;
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = t(key);
  });
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);

  document.documentElement.lang = lang;

  applyTranslations();
}

window.setLanguage = setLanguage;
