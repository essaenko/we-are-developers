let database = null;
let dbSetupCompleted = true;

const getDBInstance = async () => {
  if (!database) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('NewsAppDataBase', 1);
      const setupDataBase = (db, transaction) => {
        database = db;

        const store = database.createObjectStore('requests', { autoIncrement: true });
        store.createIndex('id', 'id', { unique: true });
        transaction.oncomplete = () => {
          const transaction = store.clear()
          dbSetupCompleted = true;

          resolve(database);
        }
      }

      request.onsuccess = (event) => {
        database = event.target.result;

        if (dbSetupCompleted) {
          resolve(database);
        }
      }

      request.onerror = (event) => {
        console.warn(`Can't open database with error: `,event);
        reject(`Can't open database`)
      }

      request.onupgradeneeded = (event) => {
        dbSetupCompleted = false
        setupDataBase(event.target.result, event.target.transaction);
      }
    })
  }

  return database;
}

self.addEventListener('install', (event) => {
  event
    .waitUntil(new Promise(async (resolve, reject) => {
      const cache = await caches.open('v1');
      await cache.addAll([
        `/we-are-developers/examples/indexeddb-api/index.html`,
        `/we-are-developers/examples/indexeddb-api/index.js`,
        `/we-are-developers/examples/scripts/index.js`,
        `/we-are-developers/examples/styles/index.css`,
        `/we-are-developers/examples/database/news.json`,
      ])

      const db = await getDBInstance();
      try {
        const response = await fetch('/we-are-developers/examples/database/user.json', { method: 'POST' });
        if (response.status === 200) {
          const user = await response.json();
          const transaction = db.transaction(['requests'], 'readwrite');
          const store = transaction.objectStore('requests');
          transaction.oncomplete = () => {
            resolve();
          }
          transaction.onerror = (event) => {
            console.warn(`Can't process transaction for data base with error: `, event);
            reject(`Can't process transaction for data base`);
          }

          const read = store.get(1);
          read.onsuccess = (event) => {
            if (!event.target.result) {
              const request = store.add(user);
              request.onsuccess = resolve
              request.onerror = (event) => {
                console.error(`Can't add user data to store object with error: `, event);
                reject(`Can't add user data to store object`)
              }
            }
          }
          read.onerror = (event) => {
            console.error(`Can't read user store with error: `, event);
            reject(`Can't read user store`);
          }

        }
      } catch (e) {
        console.error(`Can't add user data to indexed DB with error: `, e);
        throw new Error(`Can't add user data to indexed DB`);
      }
    }))
});

const matchPostRequest = async (request) => {
  if (request.url.includes('user.json')) {
    const db = await getDBInstance();
    const store = db.transaction(['requests'], 'readonly').objectStore('requests');
    const request = store.get(1);

    return new Promise((resolve) => {
      request.onsuccess = (event) => {
        resolve(event.target.result)
      }
      request.onerror = (event) => {
        console.error(`Can't fetch user data with error: `, event);
        resolve(undefined);
      }
    })
  } else {
    return undefined;
  }
}

const cacheFirst = async (request) => {
  if (request.method === 'GET') {
    const cache = await caches.match(request);

    return cache ? cache : fetch(request);
  } else if (request.method === 'POST') {
    const cache = await matchPostRequest(request);

    return cache ? new Response(JSON.stringify(cache), {
      status: 200,
      statusText: 'OK',
      headers: { ...request.clone().headers },
    }) : fetch(request);
  }

  return fetch(request);
}

self.addEventListener('fetch', (event) => {
  event.respondWith(cacheFirst(event.request));
})