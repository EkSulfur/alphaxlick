// Content script for arXiv pages.
// Injects a floating button that opens the matching AlphaXiv page on the
// abstract, PDF and HTML views. The button can be dragged, and the dragged
// position is saved as the new default by common.js.

(() => {
  const lib = window.__alphaxlick;
  if (!lib) {
    return;
  }

  const BUTTON_ID = "arxiv-to-alphaxiv-button";

  // Matches new style ids (2401.12345v2) and old style ids (hep-th/9901001v1),
  // and ignores any extra path segments or anchors that follow them.
  const ARXIV_ID = "(?:\\d{4}\\.\\d{4,5}|[a-z][a-z-]*(?:\\.[a-z]{2})?\\/\\d{7})(?:v\\d+)?";
  const PAPER_PAGE = new RegExp(`^https?://arxiv\\.org/(abs|pdf|html)/(${ARXIV_ID})`, "i");

  // The arXiv HTML view has no matching AlphaXiv HTML view, so it maps to the
  // AlphaXiv abstract page (abs / pdf keep their own view).
  const ALPHAXIV_VIEW_FOR_ARXIV_VIEW = {
    abs: "abs",
    pdf: "pdf",
    html: "abs"
  };

  function isSupportedArxivPage(url) {
    return PAPER_PAGE.test(url);
  }

  function toAlphaXivUrl(arxivUrl) {
    const match = arxivUrl.match(PAPER_PAGE);
    if (!match) {
      return null;
    }
    const view = ALPHAXIV_VIEW_FOR_ARXIV_VIEW[match[1].toLowerCase()] || "abs";
    return `https://alphaxiv.org/${view}/${match[2]}`;
  }

  lib.setupFloatingButton({
    id: BUTTON_ID,
    text: "Open in AlphaXiv",
    title: "Open this paper on AlphaXiv",
    accent: "#1f6feb",
    showKey: lib.STORAGE_KEYS.showArxivButton,
    positionKey: lib.STORAGE_KEYS.arxivButtonPosition,
    shouldDisplay: () => isSupportedArxivPage(window.location.href),
    // The URL is used as the anchor's href, so the browser can open it in a
    // new tab/window via the context menu, middle-click or Ctrl/Cmd+click.
    getHref: () => toAlphaXivUrl(window.location.href)
  });
})();
