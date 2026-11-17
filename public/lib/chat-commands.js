/* Keyword recognition, independent of UI locale. This is not automatic translation. */
(() => {
  let commands = { intents: {} };
  function normalize(value) {
    return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd').toLowerCase().trim().replace(/[.!?…]+$/u, '').trim().replace(/\s+/g, ' ');
  }
  const matches = (item, text) => [...(item.vi || []), ...(item.hmn || [])].some(alias => normalize(alias) === text);
  function intent(comment) {
    const text = normalize(comment);
    if (!text) return null;
    for (const [name, item] of Object.entries(commands.intents)) if (matches(item, text)) return name;
    return null;
  }
  const ready = fetch('/locales/chat-commands.json').then(response => {
    if (!response.ok) throw new Error('Chat commands unavailable');
    return response.json();
  }).then(data => { commands = data; }).catch(error => console.warn('[HmongChat]', error.message));
  window.HmongChat = { normalize, intent, ready };
})();
