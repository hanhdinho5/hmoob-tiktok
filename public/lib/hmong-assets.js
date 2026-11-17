/* Approved local assets only; a missing replacement preserves the existing game. */
(() => {
  let manifest = {};
  const cache = new Map();
  const pending = new Set();
  let voiceBusyUntil = 0;
  const approved = asset => asset?.approved === true && typeof asset.src === 'string' && /^\/assets\/[a-zA-Z0-9_./-]+$/.test(asset.src) && !asset.src.includes('..') && (asset.license || asset.permission);
  const ready = fetch('/assets/hmong/manifest.json').then(response => {
    if (!response.ok) throw new Error('Asset manifest unavailable');
    return response.json();
  }).then(data => { manifest = data; }).catch(error => { console.warn('[HmongAssets]', error.message); });
  function characters(fallback) {
    return fallback.map((src, index) => approved(manifest.characters?.[index]) ? manifest.characters[index].src : src);
  }
  async function voice(event, sound) {
    const item = manifest.audio?.[event];
    const now = performance.now();
    if (HmongI18n.language !== 'hmn' || !approved(item) || !sound.enabled || now < voiceBusyUntil || pending.size) return;
    // A supplied recording also requires approved wording (not only an approved file).
    if (!item.textKey || HmongI18n.t(item.textKey) === item.textKey) return;
    if (!HmongI18n.isReviewed(item.textKey)) return;
    const context = sound.ensureContext();
    if (!context) return;
    voiceBusyUntil = now + 3500;
    try {
      if (!cache.has(item.src)) {
        pending.add(item.src);
        const response = await fetch(item.src);
        if (!response.ok) throw new Error('Recording unavailable');
        cache.set(item.src, await context.decodeAudioData(await response.arrayBuffer()));
      }
      if (!sound.enabled || HmongI18n.language !== 'hmn') return;
      const source = context.createBufferSource();
      source.buffer = cache.get(item.src);
      source.connect(sound.master);
      source.start();
      voiceBusyUntil = performance.now() + Math.max(3500, source.buffer.duration * 1000);
    } catch (error) {
      console.warn('[HmongAssets] Cannot play recording:', error.message);
    } finally { pending.delete(item.src); }
  }
  window.HmongAssets = { ready, characters, voice, background: fallback => approved(manifest.background) ? manifest.background.src : fallback };
})();
