// Shared runtime for the floating arXiv <-> AlphaXiv buttons.
// This file is injected before the page-specific content scripts
// (see manifest.json) and exposes a tiny helper on `window.__alphaxlick`.
//
// It owns three things:
//   1. reading/writing the extension settings (chrome.storage.local)
//   2. building the floating button, including drag-to-move behavior
//   3. remembering the dragged position and reusing it as the new default

(() => {
  if (window.__alphaxlick) {
    return;
  }

  const STORAGE_KEYS = {
    showArxivButton: "showArxivButton",
    showAlphaXivButton: "showAlphaXivButton",
    arxivButtonPosition: "arxivButtonPosition",
    alphaXivButtonPosition: "alphaXivButtonPosition"
  };

  const DEFAULT_SETTINGS = {
    [STORAGE_KEYS.showArxivButton]: true,
    [STORAGE_KEYS.showAlphaXivButton]: true,
    [STORAGE_KEYS.arxivButtonPosition]: null,
    [STORAGE_KEYS.alphaXivButtonPosition]: null
  };

  const EDGE_MARGIN = 8;
  const DRAG_THRESHOLD = 6;
  const DEFAULT_INSET = "16px";
  const SPA_CHECK_INTERVAL = 1000;
  const RESIZE_DEBOUNCE = 120;

  const BASE_BUTTON_STYLE = {
    position: "fixed",
    top: DEFAULT_INSET,
    right: DEFAULT_INSET,
    bottom: "auto",
    zIndex: "2147483647",
    padding: "10px 14px",
    border: "none",
    borderRadius: "999px",
    color: "#ffffff",
    fontSize: "14px",
    fontFamily: "Arial, sans-serif",
    fontWeight: "600",
    lineHeight: "1.2",
    textAlign: "center",
    textDecoration: "none",
    display: "inline-block",
    boxSizing: "border-box",
    cursor: "pointer",
    boxShadow: "0 6px 18px rgba(0, 0, 0, 0.25)",
    userSelect: "none",
    webkitUserSelect: "none",
    webkitUserDrag: "none",
    touchAction: "none"
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const storageAvailable = () => {
    try {
      return Boolean(chrome && chrome.storage && chrome.storage.local);
    } catch (error) {
      return false;
    }
  };

  async function readSettings() {
    if (!storageAvailable()) {
      return { ...DEFAULT_SETTINGS };
    }
    try {
      const stored = await chrome.storage.local.get(DEFAULT_SETTINGS);
      return { ...DEFAULT_SETTINGS, ...stored };
    } catch (error) {
      return { ...DEFAULT_SETTINGS };
    }
  }

  async function writeSetting(key, value) {
    if (!storageAvailable()) {
      return;
    }
    try {
      await chrome.storage.local.set({ [key]: value });
    } catch (error) {
      // Ignore: the button simply falls back to its default position.
    }
  }

  function watchSettings(callback) {
    if (!storageAvailable()) {
      return;
    }
    try {
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === "local") {
          callback(changes);
        }
      });
    } catch (error) {
      // Ignore: settings sync is a progressive enhancement.
    }
  }

  // Positions are stored as a fraction of the viewport so the button stays
  // in roughly the same spot when the window is resized.
  function normalizePosition(value) {
    if (!value || typeof value !== "object") {
      return null;
    }
    const rx = Number(value.rx);
    const ry = Number(value.ry);
    if (!Number.isFinite(rx) || !Number.isFinite(ry)) {
      return null;
    }
    return { rx: clamp(rx, 0, 1), ry: clamp(ry, 0, 1) };
  }

  function applyPosition(button, position) {
    const width = button.offsetWidth || 160;
    const height = button.offsetHeight || 36;
    const maxLeft = Math.max(EDGE_MARGIN, window.innerWidth - width - EDGE_MARGIN);
    const maxTop = Math.max(EDGE_MARGIN, window.innerHeight - height - EDGE_MARGIN);

    if (!position) {
      // Back to the built-in default: pinned to the top-right corner.
      button.style.left = "";
      button.style.top = DEFAULT_INSET;
      button.style.right = DEFAULT_INSET;
      button.style.bottom = "auto";
      return;
    }

    button.style.left = `${clamp(position.rx * window.innerWidth, EDGE_MARGIN, maxLeft)}px`;
    button.style.top = `${clamp(position.ry * window.innerHeight, EDGE_MARGIN, maxTop)}px`;
    button.style.right = "auto";
    button.style.bottom = "auto";
  }

  function setupFloatingButton(config) {
    const {
      id,
      text,
      title = text,
      accent = "#1f6feb",
      showKey,
      positionKey,
      shouldDisplay,
      getHref
    } = config;

    let enabled = true;
    let position = null;
    let button = null;
    let resizeTimer = 0;

    const isVisible = () => enabled && shouldDisplay();

    // The target URL lives on a real `href`, so middle-click, Ctrl/Cmd+click
    // and the context menu entry "Open link in new tab" all work natively.
    function currentHref() {
      try {
        return getHref() || null;
      } catch (error) {
        return null;
      }
    }

    function refreshHref(element) {
      const href = currentHref();
      if (!href) {
        if (element.hasAttribute("href")) {
          element.removeAttribute("href");
        }
        return;
      }
      if (element.getAttribute("href") !== href) {
        element.setAttribute("href", href);
      }
    }

    function rememberCurrentPosition() {
      if (!button) {
        return;
      }
      const rect = button.getBoundingClientRect();
      position = {
        rx: rect.left / Math.max(1, window.innerWidth),
        ry: rect.top / Math.max(1, window.innerHeight)
      };
      writeSetting(positionKey, position);
    }

    function attachPointerBehavior(element) {
      let dragging = false;
      let didDrag = false;
      let grabOffsetX = 0;
      let grabOffsetY = 0;
      let startX = 0;
      let startY = 0;

      const moveTo = (clientX, clientY) => {
        const maxLeft = Math.max(
          EDGE_MARGIN,
          window.innerWidth - element.offsetWidth - EDGE_MARGIN
        );
        const maxTop = Math.max(
          EDGE_MARGIN,
          window.innerHeight - element.offsetHeight - EDGE_MARGIN
        );
        element.style.left = `${clamp(clientX - grabOffsetX, EDGE_MARGIN, maxLeft)}px`;
        element.style.top = `${clamp(clientY - grabOffsetY, EDGE_MARGIN, maxTop)}px`;
        element.style.right = "auto";
        element.style.bottom = "auto";
      };

      element.addEventListener("pointerdown", (event) => {
        if (event.pointerType === "mouse" && event.button !== 0) {
          // Let the browser handle right-click (context menu) and middle-click.
          return;
        }
        const rect = element.getBoundingClientRect();
        dragging = true;
        didDrag = false;
        startX = event.clientX;
        startY = event.clientY;
        grabOffsetX = event.clientX - rect.left;
        grabOffsetY = event.clientY - rect.top;
        try {
          element.setPointerCapture(event.pointerId);
        } catch (error) {
          // Pointer capture is a nice-to-have.
        }
        // Note: no preventDefault() here, so the native link behavior (and the
        // click default action) stays untouched. Link dragging and text
        // selection are disabled through CSS / the draggable attribute.
      });

      element.addEventListener("pointermove", (event) => {
        if (!dragging) {
          return;
        }
        const moved = Math.max(
          Math.abs(event.clientX - startX),
          Math.abs(event.clientY - startY)
        );
        if (moved >= DRAG_THRESHOLD) {
          didDrag = true;
        }
        if (didDrag) {
          moveTo(event.clientX, event.clientY);
        }
      });

      const endDrag = (event) => {
        if (!dragging) {
          return;
        }
        dragging = false;
        if (event && event.pointerId !== undefined) {
          try {
            element.releasePointerCapture(event.pointerId);
          } catch (error) {
            // Ignore.
          }
        }
        if (didDrag) {
          // Feature 1: dragging the button immediately becomes the new
          // default position for every arXiv/AlphaXiv page from now on.
          rememberCurrentPosition();
        }
      };

      element.addEventListener("pointerup", endDrag);
      element.addEventListener("pointercancel", endDrag);

      element.addEventListener("click", (event) => {
        // Keep the page's own click handlers out of the way, but let the
        // browser run the anchor's default action (same tab, new tab, ...).
        event.stopPropagation();
        if (didDrag) {
          didDrag = false;
          event.preventDefault();
          return;
        }
        if (!element.hasAttribute("href")) {
          event.preventDefault();
        }
      });
    }

    function build() {
      const element = document.createElement("a");
      element.id = id;
      element.textContent = text;
      element.title = title;
      element.setAttribute("aria-label", title);
      element.draggable = false;
      element.setAttribute("draggable", "false");
      refreshHref(element);
      Object.assign(element.style, BASE_BUTTON_STYLE, { background: accent });

      // Hide until the stored position is applied to avoid a visible jump.
      element.style.visibility = "hidden";
      document.documentElement.appendChild(element);
      applyPosition(element, position);
      element.style.visibility = "";

      attachPointerBehavior(element);
      return element;
    }

    function destroy() {
      const existing = document.getElementById(id);
      if (existing) {
        existing.remove();
      }
      button = null;
    }

    function sync() {
      if (!isVisible()) {
        destroy();
        return;
      }
      // Re-create the button if the page removed it (single page apps).
      if (!button || !button.isConnected) {
        button = build();
        return;
      }
      refreshHref(button);
    }

    watchSettings((changes) => {
      if (showKey in changes) {
        enabled = changes[showKey].newValue !== false;
        sync();
      }
      if (positionKey in changes) {
        position = normalizePosition(changes[positionKey].newValue);
        if (button && button.isConnected) {
          applyPosition(button, position);
        }
      }
    });

    window.addEventListener("resize", () => {
      if (!button || !button.isConnected) {
        return;
      }
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => applyPosition(button, position), RESIZE_DEBOUNCE);
    });

    window.addEventListener("popstate", sync);

    async function init() {
      const settings = await readSettings();
      enabled = settings[showKey] !== false;
      position = normalizePosition(settings[positionKey]);
      sync();

      // AlphaXiv and arXiv use client side navigation in places, so keep an
      // eye on the URL instead of relying on a full page reload.
      window.setInterval(sync, SPA_CHECK_INTERVAL);
    }

    init();
  }

  window.__alphaxlick = {
    STORAGE_KEYS,
    DEFAULT_SETTINGS,
    readSettings,
    writeSetting,
    setupFloatingButton
  };
})();
