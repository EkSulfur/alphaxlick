// Content script for AlphaXiv pages.
// Injects a floating button that opens the matching arXiv HTML page
// (https://arxiv.org/html/<id>). Works on the AlphaXiv abstract and PDF views.
// Whether the button is shown can be toggled from the extension popup.

(() => {
  const lib = window.__alphaxlick;
  if (!lib) {
    return;
  }

  const BUTTON_ID = "alphaxiv-to-arxiv-html-button";
  const SUPPORTED_PAGE = /^https?:\/\/(?:www\.)?alphaxiv\.org\/(?:abs|pdf|overview)\/[^\s?#/]+/i;

  function isSupportedAlphaXivPage(url) {
    return SUPPORTED_PAGE.test(url);
  }

  function toArxivHtmlUrl(alphaXivUrl) {
    const match = alphaXivUrl.match(
      /^https?:\/\/(?:www\.)?alphaxiv\.org\/(?:abs|pdf|overview)\/([^\s?#]+)/i
    );
    if (!match) {
      return null;
    }
    const paperId = match[1].replace(/\/+$/, "");
    return `https://arxiv.org/html/${paperId}`;
  }

  lib.setupFloatingButton({
    id: BUTTON_ID,
    text: "Open arXiv HTML",
    title: "Open this paper's arXiv HTML page",
    accent: "#b31b1b",
    showKey: lib.STORAGE_KEYS.showAlphaXivButton,
    positionKey: lib.STORAGE_KEYS.alphaXivButtonPosition,
    shouldDisplay: () => isSupportedAlphaXivPage(window.location.href),
    // The URL is used as the anchor's href, so the browser can open it in a
    // new tab/window via the context menu, middle-click or Ctrl/Cmd+click.
    getHref: () => toArxivHtmlUrl(window.location.href)
  });
})();
