//@ts-check
// see: https://github.com/craigbuckler/asayer-idbstate

// IndexedDB wrapper class
export class Database {
  // connect to IndexedDB database
  constructor(dbName, dbVersion, dbUpgrade) {
    //@ts-expect-error
    return new Promise((resolve, reject) => {
      // connection object
      this.db = null;

      // no support
      if (!("indexedDB" in window)) reject("not supported");

      // open database
      const dbOpen = indexedDB.open(dbName, dbVersion);

      if (dbUpgrade) {
        // database upgrade event
        dbOpen.onupgradeneeded = (e) => {
          dbUpgrade(dbOpen.result, e.oldVersion, e.newVersion);
        };
      }

      dbOpen.onsuccess = () => {
        this.db = dbOpen.result;
        resolve(this);
      };

      dbOpen.onerror = (e) => {
        //@ts-expect-error
        reject(`IndexedDB error: ${e.target.errorCode}`);
      };
    });
  }

  // store item
  set(storeName, value) {
    return new Promise((resolve, reject) => {
      // new transaction
      const transaction = this.db.transaction(storeName, "readwrite"),
        store = transaction.objectStore(storeName);

      // write record
      store.put(value);

      transaction.oncomplete = () => {
        resolve(true); // success
      };

      transaction.onerror = () => {
        reject(transaction.error); // failure
      };
    });
  }

  // get named item
  get(storeName, name) {
    return new Promise((resolve, reject) => {
      // new transaction
      const transaction = this.db.transaction(storeName, "readonly"),
        store = transaction.objectStore(storeName),
        // read record
        request = store.get(name);

      request.onsuccess = () => {
        resolve(request.result); // success
      };

      request.onerror = () => {
        reject(request.error); // failure
      };
    });
  }
}
