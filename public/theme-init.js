// Apply the saved appearance before the first paint, independently of game saves.
try {
  document.documentElement.dataset.theme =
    localStorage.getItem('electric-cards:theme') === 'light' ? 'light' : 'dark';
} catch {
  document.documentElement.dataset.theme = 'dark';
}
