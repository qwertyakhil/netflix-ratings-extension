chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ omdbKey: "c7918701" });
});
