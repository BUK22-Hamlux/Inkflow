const STORAGE_KEY = "inkflow_documents";
const STORAGE_LIMIT_BYTES = 5 * 1024 * 1024; // 5MB

export const getAllDocuments = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY || "[]");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
};

export const saveDocument = (doc) => {
  try {
    const all = getAllDocuments();
    const existingIndex = all.findIndex((d) => d.id === doc.id);

    if (existingIndex >= 0) {
      all[existingIndex] = { ...all[existingIndex], ...doc };
    } else {
      all.unshift(doc);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return true;
  } catch (error) {
    if (error.name === "QuotaExceededError") {
      console.error("localStorage is full. Cannot save document.");
    }
    return false;
  }
};

export const getDocumentById = (id) => {
  try {
    const all = getAllDocuments();
    return all.find((d) => d.id === id) ?? null;
  } catch {
    return null;
  }
};

export const deleteDocument = (id) => {
  try {
    const all = getAllDocuments();
    const filtered = all.filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
};

export const generateDocId = () => {
  return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getStorageUsage = () => {
  try {
    let totalBytes = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      totalBytes += (key.length + value.length) * 2;
    }

    const usedMB = totalBytes / (1024 * 1024);
    const percentUsed = (totalBytes / STORAGE_LIMIT_BYTES) * 100;
    const isFull = totalBytes > STORAGE_LIMIT_BYTES * 0.9;

    return {
      usedBytes: totalBytes,
      usedMB: parseFloat(usedMB.toFixed(2)),
      percentUsed: parseFloat(percentUsed.toFixed(1)),
      isFull,
    };
  } catch {
    return {
      usedBytes: 0,
      usedMB: 0,
      percentUsed: 0,
      isFull: false,
    };
  }
};
