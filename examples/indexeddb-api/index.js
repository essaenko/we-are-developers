document.addEventListener('DOMContentLoaded', async () => {
  await navigator.serviceWorker.register('../indexed-db-api-worker.js');
})