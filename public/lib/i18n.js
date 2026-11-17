/* Text-only localization. Unreviewed Hmong always falls back to Vietnamese. */
(() => {
  const allowed = new Set(['hmn', 'vi']);
  const params = new URLSearchParams(location.search);
  let stored;
  try { stored = localStorage.getItem('hmongLiveLanguage'); } catch {}
  let language = params.get('lang') || stored || 'hmn';
  if (!allowed.has(language)) language = 'hmn';
  let vi = {}, hmn = {};
  const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
  const variables = text => [...text.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
  function t(key, values = {}) {
    const fallback = has(vi, key) ? vi[key] : key;
    const item = has(hmn, key) ? hmn[key] : null;
    const reviewed = item && ['approved', 'user-provided'].includes(item.status) && typeof item.text === 'string' && item.text.trim();
    const text = language === 'hmn' && reviewed && variables(item.text) === variables(fallback) ? item.text : fallback;
    return text.replace(/\{(\w+)\}/g, (match, name) => has(values, name) ? String(values[name]) : match);
  }
  function apply() {
    // Mixed-language pages retain an honest base lang while each text marks its own language.
    document.documentElement.lang = 'vi';
    document.documentElement.dataset.language = language;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      // If dictionaries fail, preserve the readable static Vietnamese already in HTML.
      if (!has(vi, key)) return;
      el.textContent = t(key);
      el.lang = language === 'hmn' && hmn[key]?.text === t(key) ? 'hmn' : 'vi';
    });
    for (const attr of ['placeholder', 'aria-label', 'content', 'title']) {
      document.querySelectorAll(`[data-i18n-${attr}]`).forEach(el => {
        const key = el.getAttribute(`data-i18n-${attr}`);
        if (has(vi, key)) el.setAttribute(attr, t(key));
      });
    }
    document.querySelectorAll('[data-language-picker]').forEach(el => { el.value = language; });
  }
  function setLanguage(next) {
    if (!allowed.has(next)) return;
    language = next;
    try { localStorage.setItem('hmongLiveLanguage', next); } catch {}
    const url = new URL(location.href);
    url.searchParams.set('lang', next);
    history.replaceState(null, '', url);
    apply();
    window.dispatchEvent(new CustomEvent('languagechange'));
  }
  const ready = Promise.all(['/locales/vi.json', '/locales/hmn.json'].map(async (path, index) => {
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`Cannot load ${path}`);
      const data = await response.json();
      if (index === 0) vi = data; else hmn = data;
    } catch (error) { console.error('[i18n]', error); }
  }));
  function isReviewed(key) {
    return has(vi, key) && has(hmn, key) && ['approved', 'user-provided'].includes(hmn[key]?.status) && typeof hmn[key].text === 'string' && Boolean(hmn[key].text.trim()) && variables(hmn[key].text) === variables(vi[key]);
  }
  window.HmongI18n = { t, ready, apply, setLanguage, isReviewed, get language() { return language; } };
  document.addEventListener('DOMContentLoaded', async () => {
    await ready;
    apply();
    document.querySelectorAll('[data-language-picker]').forEach(el => el.addEventListener('change', () => setLanguage(el.value)));
  });
})();
