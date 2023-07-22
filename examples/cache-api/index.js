document.addEventListener('DOMContentLoaded', async () => {
  await navigator.serviceWorker.register('../cache-api-worker.js');
})