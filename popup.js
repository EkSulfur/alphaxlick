// Popup UI for the extension.
// Shows a one-click jump for the current tab and the on/off switches for the
// floating buttons.

const STORAGE_KEYS = {
  showArxivButton: "showArxivButton",
  showAlphaXivButton: "showAlphaXivButton",
  arxivButtonPosition: "arxivButtonPosition",
  alphaXivButtonPosition: "alphaXivButtonPosition"
};

const ARXIV_ID = "(?:\\d{4}\\.\\d{4,5}|[a-z][a-z-]*(?:\\.[a-z]{2})?\\/\\d{7})(?:v\\d+)?";
const ARXIV_PATTERN = new RegExp(`^https?://arxiv\\.org/(abs|pdf|html)/(${ARXIV_ID})`, "i");
const ALPHAXIV_PATTERN = /^https?:\/\/(?:www\.)?alphaxiv\.org\/(abs|pdf|overview)\/([^\s?#]+)/i;

// arXiv HTML pages map to the AlphaXiv abstract page.
const ALPHAXIV_VIEW_FOR_ARXIV_VIEW = {
  abs: "abs",
  pdf: "pdf",
  html: "abs"
};

const ui = {
  status: document.getElementById("status"),
  primary: document.getElementById("primary"),
  toggleArxiv: document.getElementById("toggle-arxiv"),
  toggleAlphaXiv: document.getElementById("toggle-alphaxiv"),
  reset: document.getElementById("reset")
};

let targetUrl = null;

function toAlphaXivUrl(arxivUrl) {
  const match = arxivUrl.match(ARXIV_PATTERN);
  if (!match) {
    return null;
  }
  const view = ALPHAXIV_VIEW_FOR_ARXIV_VIEW[match[1].toLowerCase()] || "abs";
  return `https://alphaxiv.org/${view}/${match[2]}`;
}

function toArxivHtmlUrl(alphaXivUrl) {
  const match = alphaXivUrl.match(ALPHAXIV_PATTERN);
  if (!match) {
    return null;
  }
  return `https://arxiv.org/html/${match[2].replace(/\/+$/, "")}`;
}

async function loadSettings() {
  try {
    const settings = await chrome.storage.local.get({
      [STORAGE_KEYS.showArxivButton]: true,
      [STORAGE_KEYS.showAlphaXivButton]: true
    });
    ui.toggleArxiv.checked = settings[STORAGE_KEYS.showArxivButton] !== false;
    ui.toggleAlphaXiv.checked = settings[STORAGE_KEYS.showAlphaXivButton] !== false;
  } catch (error) {
    ui.toggleArxiv.checked = true;
    ui.toggleAlphaXiv.checked = true;
  }
}

async function loadActiveTab() {
  let url = "";
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    url = (tab && tab.url) || "";
  } catch (error) {
    url = "";
  }

  if (ARXIV_PATTERN.test(url)) {
    targetUrl = toAlphaXivUrl(url);
    ui.status.textContent = "当前页面：arXiv 论文页";
    ui.primary.textContent = "在 AlphaXiv 打开这篇论文";
  } else if (ALPHAXIV_PATTERN.test(url)) {
    targetUrl = toArxivHtmlUrl(url);
    ui.status.textContent = "当前页面：AlphaXiv 论文页";
    ui.primary.textContent = "打开这篇论文的 arXiv HTML";
  } else {
    targetUrl = null;
    ui.status.textContent = "当前页面不是受支持的 arXiv / AlphaXiv 论文页";
    ui.primary.textContent = "当前页面不支持跳转";
  }

  ui.primary.disabled = !targetUrl;
}

ui.primary.addEventListener("click", async () => {
  if (!targetUrl) {
    return;
  }
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      await chrome.tabs.update(tab.id, { url: targetUrl });
      window.close();
    }
  } catch (error) {
    ui.status.textContent = "跳转失败，请重试。";
  }
});

ui.toggleArxiv.addEventListener("change", () => {
  chrome.storage.local.set({ [STORAGE_KEYS.showArxivButton]: ui.toggleArxiv.checked });
});

ui.toggleAlphaXiv.addEventListener("change", () => {
  chrome.storage.local.set({ [STORAGE_KEYS.showAlphaXivButton]: ui.toggleAlphaXiv.checked });
});

ui.reset.addEventListener("click", async () => {
  try {
    await chrome.storage.local.remove([
      STORAGE_KEYS.arxivButtonPosition,
      STORAGE_KEYS.alphaXivButtonPosition
    ]);
    ui.reset.textContent = "位置已重置";
  } catch (error) {
    ui.reset.textContent = "重置失败，请重试";
  }
  window.setTimeout(() => {
    ui.reset.textContent = "重置浮动按钮位置";
  }, 1200);
});

loadSettings();
loadActiveTab();
