// Background service worker for the extension.
// Its only job is to make sure the default settings exist the first time the
// extension is installed, so the popup and content scripts agree on defaults.

const DEFAULT_SETTINGS = {
  showArxivButton: true,
  showAlphaXivButton: true,
  arxivButtonPosition: null,
  alphaXivButtonPosition: null
};

chrome.runtime.onInstalled.addListener(async () => {
  try {
    const stored = await chrome.storage.local.get(DEFAULT_SETTINGS);
    await chrome.storage.local.set({ ...DEFAULT_SETTINGS, ...stored });
  } catch (error) {
    // Ignore: the popup and content scripts apply the same defaults anyway.
  }
});
