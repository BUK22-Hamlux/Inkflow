// IndexedDB singleton for inkflow document storage
// Database: inkflow_db, Version: 1
// Stores: "documents" (keyPath: "id"), "app_settings" (keyPath: "key")

let dbPromise = null;

const openDB = () => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open("inkflow_db", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create documents store with indexes
      if (!db.objectStoreNames.contains("documents")) {
        const documentsStore = db.createObjectStore("documents", {
          keyPath: "id",
        });
        documentsStore.createIndex("lastEditedAt", "lastEditedAt", { unique: false });
        documentsStore.createIndex("createdAt", "createdAt", { unique: false });
      }

      // Create app_settings store
      if (!db.objectStoreNames.contains("app_settings")) {
        db.createObjectStore("app_settings", { keyPath: "key" });
      }
    };
  });

  return dbPromise;
};

export const getAllDocuments = async () => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("documents", "readonly");
      const store = transaction.objectStore("documents");
      const index = store.index("lastEditedAt");
      const request = index.openCursor(null, "prev"); // Sort by lastEditedAt descending

      const results = [];
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch {
    return [];
  }
};

export const saveDocument = async (doc) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("documents", "readwrite");
      const store = transaction.objectStore("documents");

      // Add syncStatus if not present
      const docToSave = {
        ...doc,
        syncStatus: doc.syncStatus || "local",
      };

      const request = store.put(docToSave);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error("Failed to save document:", error);
    return false;
  }
};

export const getDocumentById = async (id) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("documents", "readonly");
      const store = transaction.objectStore("documents");
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch {
    return null;
  }
};

export const deleteDocument = async (id) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("documents", "readwrite");
      const store = transaction.objectStore("documents");
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch {
    return false;
  }
};

export const generateDocId = () => {
  return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getStorageUsage = async () => {
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      const usedBytes = estimate.usage || 0;
      const quotaBytes = estimate.quota || 5 * 1024 * 1024; // Fallback to 5MB
      const usedMB = usedBytes / (1024 * 1024);
      const percentUsed = (usedBytes / quotaBytes) * 100;
      const isFull = usedBytes > quotaBytes * 0.9;

      return {
        usedBytes,
        usedMB: parseFloat(usedMB.toFixed(2)),
        percentUsed: parseFloat(percentUsed.toFixed(1)),
        isFull,
      };
    }
  } catch {
    // Fallback to basic estimation if estimate API fails
  }

  // Fallback return
  return {
    usedBytes: 0,
    usedMB: 0,
    percentUsed: 0,
    isFull: false,
  };
};

const MAX_RECENT_COLORS = 5;

export const getRecentColors = async () => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("app_settings", "readonly");
      const store = transaction.objectStore("app_settings");
      const request = store.get("recent_colors");

      request.onsuccess = () => {
        resolve(request.result?.value || []);
      };
      request.onerror = () => reject(request.error);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch {
    return [];
  }
};

export const addRecentColor = async (hex) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("app_settings", "readwrite");
      const store = transaction.objectStore("app_settings");

      // Get current colors first
      const getRequest = store.get("recent_colors");
      getRequest.onsuccess = () => {
        const current = getRequest.result?.value || [];
        const filtered = current.filter(
          (c) => c.toLowerCase() !== hex.toLowerCase(),
        );
        const updated = [hex, ...filtered].slice(0, MAX_RECENT_COLORS);

        const putRequest = store.put({
          key: "recent_colors",
          value: updated,
        });

        putRequest.onsuccess = () => resolve(updated);
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch {
    return [];
  }
};

export const clearAllDocuments = async () => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("documents", "readwrite");
      const store = transaction.objectStore("documents");
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch {
    return false;
  }
};

/*
 * SYNC ARCHITECTURE NOTE:
 * This IndexedDB setup is designed to sync with a backend in the future.
 * Each document should have a "syncStatus" field to track synchronization state:
 * - "local": Document exists only locally, needs to be synced
 * - "synced": Document is synced with the server
 * - "pending": Document has local changes that need to be pushed to the server
 * 
 * When saving a new document, "syncStatus" defaults to "local".
 * The sync system will use this field to determine which documents need to be
 * pushed to the server and which have conflicts that need resolution.
 */