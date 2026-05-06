(function () {
  'use strict';

  var root = document.getElementById('diamond-widget-root');
  if (!root) return;

  var shop         = root.dataset.shop    || '';
  var apiUrl       = (root.dataset.apiUrl || '').replace(/\/$/, '');
  var perPage      = parseInt(root.dataset.perPage, 10) || 24;
  var showFilters  = root.dataset.showFilters === 'true';
  var primaryColor = root.dataset.primaryColor || '';

  if (perPage < 4)  perPage = 4;
  if (perPage > 50) perPage = 50;

  if (primaryColor) {
    root.style.setProperty('--dw-accent', primaryColor);
  }

  if (!apiUrl) {
    root.innerHTML =
      '<div class="dw-config-error">' +
        '<p>Diamond Browser: set the <strong>API Server URL</strong> in Theme Editor settings to activate this widget.</p>' +
      '</div>';
    return;
  }

  // ─── SESSION ID ───────────────────────────────────────────────────────────
  // Persistent per-browser ID. Buyer's cart keys off this.
  var SID_KEY = 'augmont_diamond_sid';
  function getSessionId() {
    try {
      var sid = localStorage.getItem(SID_KEY);
      if (sid && /^[A-Za-z0-9_-]{8,64}$/.test(sid)) return sid;
      sid = (window.crypto && crypto.randomUUID)
        ? crypto.randomUUID()
        : 'sid-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(SID_KEY, sid);
      return sid;
    } catch (e) {
      return 'sid-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
  }
  var sessionId = getSessionId();

  // ─── CONSTANTS ────────────────────────────────────────────────────────────
  var SHAPES   = ['Round', 'Princess', 'Cushion', 'Oval', 'Pear', 'Emerald', 'Marquise', 'Heart', 'Asscher', 'Radiant'];
  var COLORS   = ['D', 'E', 'F', 'G', 'H', 'I', 'J'];
  var CLARITIES = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2'];
  var CUTS     = ['Excellent', 'Very Good', 'Good', 'Fair'];
  // Certificate (lab) values seen on Augmont prod: GIA, IGI, HRD, No-cert. The
  // "Other" pill collects everything that's not GIA/IGI/HRD (the server
  // post-filters the page since Augmont doesn't expose a "not in" predicate).
  var CERTIFICATES = ['GIA', 'IGI', 'HRD', 'Other'];
  var TREATMENTS = [
    { value: '',          label: 'All' },
    { value: 'natural',   label: 'Natural' },
    { value: 'lab-grown', label: 'Lab-Grown' }
  ];
  var SORTS    = [
    { value: 'price_asc',  label: 'Price: low to high' },
    { value: 'price_desc', label: 'Price: high to low' },
    { value: 'carat_asc',  label: 'Carat: low to high' },
    { value: 'carat_desc', label: 'Carat: high to low' }
  ];
  var CARAT_MIN = 0.25;
  var CARAT_MAX = 5.0;
  var CARAT_STEP = 0.05;
  // URL query-param prefix to avoid collisions with merchant theme params.
  var URL_PREFIX = 'd_';

  // ─── SHAPE SILHOUETTES ────────────────────────────────────────────────────
  // Inline SVG outlines used as placeholders when an image_url fails to
  // decode (Augmont returns viewmydiamonds.com viewer-page URLs, not raw
  // images — see CLAUDE.md lesson #3). Each shape is a simple, recognizable
  // silhouette in light gray; the goal is "looks intentional", not photorealism.
  // viewBox is 0 0 100 100 so all shapes fit the same square card image well.
  var SHAPE_SVGS = {
    round:    '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M14 50 L86 50 M50 14 L50 86 M24.6 24.6 L75.4 75.4 M75.4 24.6 L24.6 75.4" stroke="currentColor" stroke-width="0.6" opacity="0.55"/></svg>',
    oval:     '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse cx="50" cy="50" rx="26" ry="38" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M50 12 L50 88 M30 30 L70 70 M70 30 L30 70" stroke="currentColor" stroke-width="0.6" opacity="0.55"/></svg>',
    princess: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="18" y="18" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M18 18 L82 82 M82 18 L18 82 M50 18 L50 82 M18 50 L82 50" stroke="currentColor" stroke-width="0.6" opacity="0.55"/></svg>',
    cushion:  '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="18" y="18" width="64" height="64" rx="14" ry="14" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M28 28 L72 72 M72 28 L28 72 M50 18 L50 82 M18 50 L82 50" stroke="currentColor" stroke-width="0.6" opacity="0.55"/></svg>',
    emerald:  '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M30 16 L70 16 L84 30 L84 70 L70 84 L30 84 L16 70 L16 30 Z" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M28 28 L72 28 M28 72 L72 72 M28 28 L28 72 M72 28 L72 72 M50 16 L50 84" stroke="currentColor" stroke-width="0.6" opacity="0.55"/></svg>',
    pear:     '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M50 12 C30 30 22 50 28 70 C32 84 42 88 50 88 C58 88 68 84 72 70 C78 50 70 30 50 12 Z" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M50 12 L50 88 M32 50 L68 50 M38 30 L62 30" stroke="currentColor" stroke-width="0.6" opacity="0.55"/></svg>',
    marquise: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M50 12 C70 30 80 50 80 50 C80 50 70 70 50 88 C30 70 20 50 20 50 C20 50 30 30 50 12 Z" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M20 50 L80 50 M50 12 L50 88 M30 30 L70 70 M70 30 L30 70" stroke="currentColor" stroke-width="0.6" opacity="0.55"/></svg>',
    heart:    '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M50 86 C24 64 14 48 14 34 C14 22 24 16 32 16 C40 16 46 22 50 30 C54 22 60 16 68 16 C76 16 86 22 86 34 C86 48 76 64 50 86 Z" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M50 30 L50 80 M28 38 L72 38 M50 30 L24 56 M50 30 L76 56" stroke="currentColor" stroke-width="0.6" opacity="0.55"/></svg>',
    asscher:  '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M28 16 L72 16 L84 28 L84 72 L72 84 L28 84 L16 72 L16 28 Z" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M30 30 L70 30 L70 70 L30 70 Z M40 40 L60 40 L60 60 L40 60 Z M16 28 L84 72 M84 28 L16 72" stroke="currentColor" stroke-width="0.6" opacity="0.55" fill="none"/></svg>',
    radiant:  '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M30 14 L70 14 L86 30 L86 70 L70 86 L30 86 L14 70 L14 30 Z" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M30 30 L70 30 L70 70 L30 70 Z M50 14 L50 86 M14 50 L86 50 M30 30 L14 14 M70 30 L86 14 M70 70 L86 86 M30 70 L14 86" stroke="currentColor" stroke-width="0.6" opacity="0.55" fill="none"/></svg>'
  };

  function svgForShape(shape) {
    var key = String(shape || '').toLowerCase();
    return SHAPE_SVGS[key] || SHAPE_SVGS.round;
  }

  function capShape(s) {
    var str = String(s || '').trim();
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // Aria Morelle convention: title labels stones as "{carat}ct {Shape} Lab Grown Diamond"
  // (their natural variants would say "Natural Diamond"). Augmont's normalized
  // diamond response doesn't surface `treatment`, so default to Lab Grown — that
  // matches the catalog (~99.99% LGD per Phase A). If `d.treatment` ever becomes
  // available, this picks up automatically.
  function diamondTypeLabel(d) {
    var t = d && d.treatment ? String(d.treatment).toLowerCase() : '';
    if (t === 'natural') return 'Natural Diamond';
    return 'Lab Grown Diamond';
  }

  // "Ships by May 20" — Aria Morelle uses a computed date, not a generic
  // window. We promise 14 days from today so the date stays inside the
  // 7-10 business-day commitment with weekend buffer.
  function computedShipsByDate() {
    try {
      var d = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(d);
    } catch (e) {
      // If Intl unavailable, fall back to the previous generic copy. Caller
      // formats around this with "Ships by " / "Ships in" prefix accordingly.
      return null;
    }
  }
  function shipsLineCopy() {
    var date = computedShipsByDate();
    return date ? 'Ships by ' + date : 'Ships in 7-10 business days';
  }

  // ─── STATE ────────────────────────────────────────────────────────────────
  var state = {
    shape: '',
    colors: [],
    clarities: [],
    cuts: [],
    certificates: [],
    treatment: '',     // '' = All, 'natural', or 'lab-grown' (server maps to Augmont)
    hasImage: false,
    minCarat: CARAT_MIN,
    maxCarat: CARAT_MAX,
    sort: 'price_asc'
  };
  var pagination = { from: 1, to: perPage, hasMore: false, total: null };
  var cart = { items: [], count: 0, total: 0, currency: 'USD' };
  var diamondIdsInCart = new Set();
  var loadedDiamonds = []; // accumulated across "Load more" pages
  // Map of stockNum -> diamond object so we can look up the full record when
  // the user opens the modal or a deep link restores ?stone=X on page load.
  var diamondsByStockNum = Object.create(null);
  var requestSeq = 0; // guards against out-of-order responses

  // ─── DOM SCAFFOLD ─────────────────────────────────────────────────────────
  root.innerHTML =
    '<header class="dw-hero">' +
      '<p class="dw-hero__eyebrow">Loose Diamonds</p>' +
      '<h2 class="dw-hero__title">Browse Our Collection</h2>' +
    '</header>' +
    (showFilters ? buildTreatmentTabsHTML() : '') +
    (showFilters ? buildFiltersHTML() : '') +
    '<div class="dw-results-bar">' +
      '<p class="dw-results-bar__count" id="dw-count" aria-live="polite">Loading diamonds…</p>' +
      '<div class="dw-results-bar__sort">' +
        '<label class="dw-results-bar__sort-label" for="dw-sort">Sort</label>' +
        '<select class="dw-select" id="dw-sort">' +
          SORTS.map(function (s) {
            var sel = s.value === state.sort ? ' selected' : '';
            return '<option value="' + s.value + '"' + sel + '>' + s.label + '</option>';
          }).join('') +
        '</select>' +
      '</div>' +
    '</div>' +
    '<div class="dw-grid" id="dw-grid"></div>' +
    '<div class="dw-loadmore" id="dw-loadmore" hidden>' +
      '<button class="dw-btn dw-btn--outline" id="dw-loadmore-btn" type="button">Load more</button>' +
      '<p class="dw-loadmore__count" id="dw-loadmore-count"></p>' +
    '</div>' +
    buildCartTriggerHTML() +
    buildCartPanelHTML() +
    buildCheckoutOverlayHTML() +
    buildViewerOverlayHTML();

  var grid          = root.querySelector('#dw-grid');
  var countEl       = root.querySelector('#dw-count');
  var sortEl        = root.querySelector('#dw-sort');
  var loadMoreWrap  = root.querySelector('#dw-loadmore');
  var loadMoreBtn   = root.querySelector('#dw-loadmore-btn');
  var loadMoreCount = root.querySelector('#dw-loadmore-count');
  var chipsBar      = showFilters ? root.querySelector('#dw-chips') : null;
  var cartTrigger   = root.querySelector('#dw-cart-trigger');
  var cartCount     = root.querySelector('#dw-cart-count');
  var cartPanel     = root.querySelector('#dw-cart-panel');
  var cartBody      = root.querySelector('#dw-cart-body');
  var cartFooter    = root.querySelector('#dw-cart-footer');
  var cartBackdrop  = root.querySelector('#dw-cart-backdrop');
  var checkoutPanel = root.querySelector('#dw-checkout');
  var viewerPanel        = root.querySelector('#dw-viewer');
  var viewerFrame        = root.querySelector('#dw-viewer-frame');
  var viewerCaption      = root.querySelector('#dw-viewer-caption');
  var viewerFallback     = root.querySelector('#dw-viewer-fallback');
  var viewerFallSvg      = root.querySelector('#dw-viewer-fallback-svg');
  var viewerTitle        = root.querySelector('#dw-viewer-title');
  var viewerHeadSpecBody = root.querySelector('#dw-viewer-head-spec-body');
  var viewerSpecs        = root.querySelector('#dw-viewer-specs');
  var viewerPrice        = root.querySelector('#dw-viewer-price');
  var viewerPriceStrikeRow = root.querySelector('#dw-viewer-price-strike-row');
  var viewerPriceStrike  = root.querySelector('#dw-viewer-price-strike');
  var viewerPriceDiscount = root.querySelector('#dw-viewer-price-discount');
  var viewerDiscount     = root.querySelector('#dw-viewer-discount');
  var viewerCertBlock    = root.querySelector('#dw-viewer-cert-block');
  var viewerCertSeal     = root.querySelector('#dw-viewer-cert-seal');
  var viewerCertName     = root.querySelector('#dw-viewer-cert-name');
  var viewerCertNum      = root.querySelector('#dw-viewer-cert-num');
  var viewerCertLink     = root.querySelector('#dw-viewer-cert-link');
  var viewerShips        = root.querySelector('#dw-viewer-ships');
  var viewerAddBtn       = root.querySelector('#dw-viewer-add');
  var viewerExpertBtn    = root.querySelector('#dw-viewer-expert');
  var viewerBackBtn      = root.querySelector('#dw-viewer-back');
  var viewer360Badge     = root.querySelector('#dw-viewer-360-badge');
  var viewerAccordion    = root.querySelector('#dw-viewer-accordion');
  var viewerAccordionTrg = root.querySelector('#dw-viewer-accordion-trigger');
  var viewerDetailsSec   = root.querySelector('#dw-viewer-details-section');
  var viewerTierBtns     = root.querySelectorAll('.dw-viewer__tier-btn');
  // 360° viewer state for tier promotion + history-pop tracking
  var viewerState = {
    diamond: null,    // currently shown stone (full d object)
    tier: null,       // 'video' | 'image' | 'outline'
    timer: null,      // pending tier-promotion timer id
    historyPushed: false,
  };

  readStateFromURL();
  // Restore sort dropdown from URL state (default 'price_asc' otherwise).
  if (sortEl) sortEl.value = state.sort;
  if (showFilters) {
    syncFilterUIFromState();
    syncTreatmentUIFromState();
    var hasImg = root.querySelector('#dw-has-image');
    if (hasImg) hasImg.checked = !!state.hasImage;
    renderChips(); // surface URL-restored filters as chips on first render
    attachFilterListeners();
  }
  attachListeners();
  fetchInitial();
  fetchCart();

  // ─── HTML BUILDERS ────────────────────────────────────────────────────────

  function buildFiltersHTML() {
    return (
      '<section class="dw-filters" role="search" aria-label="Filter diamonds">' +
        '<div class="dw-filters__grid">' +
          // LEFT col: Shape + Colour + Cut + Certificate
          '<div class="dw-filters__col">' +
            buildPillGroup('Shape', 'shape', SHAPES, false) +
            buildPillGroup('Colour', 'colors', COLORS, true) +
            buildPillGroup('Cut', 'cuts', CUTS, true) +
            buildPillGroup('Certificate', 'certificates', CERTIFICATES, true) +
          '</div>' +
          // RIGHT col: Carat + Clarity + hasImage toggle
          // Price filter removed in C-iter1: Augmont upstream does not
          // support price filtering at any naming convention.
          '<div class="dw-filters__col">' +
            buildSliderGroup('Carats', 'carat', CARAT_MIN, CARAT_MAX, CARAT_STEP, 'ct') +
            buildPillGroup('Clarity', 'clarities', CLARITIES, true) +
            buildHasImageToggleHTML() +
          '</div>' +
        '</div>' +
        '<div class="dw-chips" id="dw-chips" hidden></div>' +
      '</section>'
    );
  }

  function buildTreatmentTabsHTML() {
    return (
      '<div class="dw-treatment-tabs" role="tablist" aria-label="Treatment">' +
        TREATMENTS.map(function (t) {
          return '<button type="button" class="dw-treatment-tab" role="tab" data-value="' + escapeAttr(t.value) + '" aria-selected="false">' +
                   escapeHTML(t.label) +
                 '</button>';
        }).join('') +
      '</div>'
    );
  }

  function buildHasImageToggleHTML() {
    return (
      '<div class="dw-fgroup">' +
        '<label class="dw-toggle">' +
          '<input type="checkbox" class="dw-toggle__input" id="dw-has-image">' +
          '<span class="dw-toggle__track" aria-hidden="true"><span class="dw-toggle__thumb"></span></span>' +
          '<span class="dw-toggle__label">Only show diamonds with images</span>' +
        '</label>' +
      '</div>'
    );
  }

  function buildPillGroup(label, key, options, multi) {
    return (
      '<div class="dw-fgroup">' +
        '<h3 class="dw-fgroup__label">' + label + '</h3>' +
        '<div class="dw-pills" data-key="' + key + '" data-multi="' + (multi ? '1' : '0') + '" role="group" aria-label="' + label + '">' +
          options.map(function (opt) {
            return '<button type="button" class="dw-pill" data-value="' + escapeAttr(opt) + '">' + escapeHTML(opt) + '</button>';
          }).join('') +
        '</div>' +
      '</div>'
    );
  }

  function buildSliderGroup(label, key, min, max, step, unit) {
    return (
      '<div class="dw-fgroup">' +
        '<h3 class="dw-fgroup__label">' + label + '</h3>' +
        '<div class="dw-slider" data-key="' + key + '" data-min="' + min + '" data-max="' + max + '" data-step="' + step + '">' +
          '<div class="dw-slider__track" aria-hidden="true">' +
            '<div class="dw-slider__range"></div>' +
          '</div>' +
          '<input class="dw-slider__input dw-slider__input--min" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + min + '" aria-label="' + label + ' minimum">' +
          '<input class="dw-slider__input dw-slider__input--max" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + max + '" aria-label="' + label + ' maximum">' +
        '</div>' +
        '<div class="dw-slider__values">' +
          '<div class="dw-slider__numwrap">' +
            '<input type="number" class="dw-slider__num dw-slider__num--min" min="' + min + '" max="' + max + '" step="' + step + '" value="' + min + '" aria-label="' + label + ' minimum value">' +
            '<span class="dw-slider__numunit">' + escapeHTML(unit) + '</span>' +
          '</div>' +
          '<span class="dw-slider__val-sep" aria-hidden="true">–</span>' +
          '<div class="dw-slider__numwrap">' +
            '<input type="number" class="dw-slider__num dw-slider__num--max" min="' + min + '" max="' + max + '" step="' + step + '" value="' + max + '" aria-label="' + label + ' maximum value">' +
            '<span class="dw-slider__numunit">' + escapeHTML(unit) + '</span>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function buildCartTriggerHTML() {
    return (
      '<button class="dw-cart-trigger" id="dw-cart-trigger" type="button" aria-label="View cart">' +
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' +
          '<path d="M3 5h2l2.4 12.5a1.5 1.5 0 0 0 1.5 1.2h9.7a1.5 1.5 0 0 0 1.5-1.2L21.5 8H6"/>' +
          '<circle cx="9.5" cy="21" r="1.3"/><circle cx="17" cy="21" r="1.3"/>' +
        '</svg>' +
        '<span class="dw-cart-trigger__label">Cart</span>' +
        '<span class="dw-cart-trigger__count" id="dw-cart-count" aria-live="polite">0</span>' +
      '</button>'
    );
  }

  function buildCartPanelHTML() {
    return (
      '<div class="dw-cart-backdrop" id="dw-cart-backdrop" hidden></div>' +
      '<aside class="dw-cart-panel" id="dw-cart-panel" aria-hidden="true" aria-label="Shopping cart">' +
        '<header class="dw-cart-panel__header">' +
          '<h3 class="dw-cart-panel__title">Your Cart</h3>' +
          '<button class="dw-cart-panel__close" id="dw-cart-close" type="button" aria-label="Close cart">&#x2715;</button>' +
        '</header>' +
        '<div class="dw-cart-panel__body" id="dw-cart-body"></div>' +
        '<footer class="dw-cart-panel__footer" id="dw-cart-footer" hidden>' +
          '<div class="dw-cart-panel__subtotal">' +
            '<span>Subtotal</span>' +
            '<strong id="dw-cart-subtotal">$0.00</strong>' +
          '</div>' +
          '<button class="dw-btn dw-btn--solid" id="dw-cart-checkout" type="button">Checkout</button>' +
        '</footer>' +
      '</aside>'
    );
  }

  // ─── DETAIL MODAL HTML (Aria Morelle clone) ──────────────────────────────
  // Structure mirrors the Nivoda-beta diamond detail page:
  //   - Sticky topbar w/ "Back to browse"
  //   - 50/50 grid: image well (sticky-left) + spec/price/buttons + details
  //     accordion (right column, scrolls). The "Diamond details" accordion
  //     lives INSIDE the right column (after the expert button) per iter5;
  //     before iter5 it sat as a full-width sibling below the grid.
  // The 3-tier media tier-controls + auto-promotion logic is preserved exactly;
  // only the surrounding chrome was rebuilt. Static SVG icons are embedded
  // (truck, diamond, chevron, lab seal) so no external asset requests fire.
  function buildViewerOverlayHTML() {
    return (
      '<div class="dw-viewer" id="dw-viewer" role="dialog" aria-modal="true" aria-label="Diamond detail viewer" hidden>' +
        '<div class="dw-viewer__backdrop" id="dw-viewer-backdrop"></div>' +
        '<div class="dw-viewer__panel">' +
          // Sticky top bar: replaces the corner X with a "Back to browse" link
          '<div class="dw-viewer__topbar">' +
            '<button type="button" class="dw-viewer__back" id="dw-viewer-back" aria-label="Close viewer">' +
              '<svg viewBox="0 0 12 12" fill="none" aria-hidden="true">' +
                '<path d="M7.5 2L3.5 6l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
              '</svg>' +
              'Back to browse' +
            '</button>' +
            // Hidden legacy close button — left in for any stray references.
            '<button class="dw-viewer__close" id="dw-viewer-close" type="button" aria-label="Close viewer">&#x2715;</button>' +
          '</div>' +
          '<div class="dw-viewer__layout">' +
            // LEFT: square image well + iframe + 360 badge + tier toggle pills
            '<div class="dw-viewer__media">' +
              '<div class="dw-viewer__media-frame" id="dw-viewer-media-frame">' +
                '<iframe id="dw-viewer-frame" title="Diamond viewer" allow="autoplay; fullscreen" loading="lazy"></iframe>' +
                '<div class="dw-viewer__fallback" id="dw-viewer-fallback" hidden>' +
                  '<div class="dw-viewer__fallback-svg" id="dw-viewer-fallback-svg"></div>' +
                  '<p class="dw-viewer__fallback-msg">Live preview not yet available — Augmont catalog imagery being indexed.</p>' +
                '</div>' +
              '</div>' +
              // Tiny "360" pill bottom-left — only visible while video tier is active
              '<span class="dw-viewer__360-badge" id="dw-viewer-360-badge" aria-hidden="true" hidden>360</span>' +
              // Tier toggle pills bottom-right (manual override of auto-promotion)
              '<div class="dw-viewer__tier-controls" id="dw-viewer-tier-controls">' +
                '<button type="button" class="dw-viewer__tier-btn" data-tier="video" aria-label="Show 360 spin">360</button>' +
                '<button type="button" class="dw-viewer__tier-btn" data-tier="image" aria-label="Show photo">Photo</button>' +
                '<button type="button" class="dw-viewer__tier-btn" data-tier="outline" aria-label="Show outline">Outline</button>' +
              '</div>' +
            '</div>' +
            // RIGHT: rich detail panel — title, spec line, ships, cert, price,
            // buttons, and (iter5) the Diamond details accordion last so it
            // flows in the right-column scroll under the buttons.
            '<div class="dw-viewer__detail" id="dw-viewer-detail">' +
              // Optional discount badge — only renders when MRP > price (Augmont
              // doesn't currently expose this; conditional path stays).
              '<span class="dw-viewer__discount" id="dw-viewer-discount" hidden></span>' +
              '<h2 class="dw-viewer__title" id="dw-viewer-title">Diamond</h2>' +
              // Spec line w/ inline diamond icon: Color / Clarity / Cut
              '<p class="dw-viewer__head-spec" id="dw-viewer-head-spec">' +
                '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">' +
                  '<path d="M3 6L8 1L13 6L8 14.5L3 6Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>' +
                  '<path d="M3 6H13" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>' +
                '</svg>' +
                '<span id="dw-viewer-head-spec-body"></span>' +
              '</p>' +
              // Ships line w/ inline truck icon — uses dedicated `dw-viewer__ships`
              // class (Agent A iter5 CSS) so it can be styled independently
              // from the Color/Clarity/Cut head-spec line.
              '<p class="dw-viewer__ships">' +
                '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">' +
                  '<path d="M1 4h8v6H1z M9 6h3l2 2v2H9z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" fill="none"/>' +
                  '<circle cx="4" cy="11.5" r="1.2" stroke="currentColor" stroke-width="1.2" fill="none"/>' +
                  '<circle cx="11.5" cy="11.5" r="1.2" stroke="currentColor" stroke-width="1.2" fill="none"/>' +
                '</svg>' +
                '<span class="dw-viewer__ships-value" id="dw-viewer-ships">Ships in 7-10 business days</span>' +
              '</p>' +
              // Cert badge block — boxed, hidden when no lab data
              '<div class="dw-viewer__cert-block" id="dw-viewer-cert-block" hidden>' +
                '<div class="dw-viewer__cert-seal" id="dw-viewer-cert-seal" aria-hidden="true"></div>' +
                '<div class="dw-viewer__cert-info">' +
                  '<p class="dw-viewer__cert-name" id="dw-viewer-cert-name">— Certified</p>' +
                  '<p class="dw-viewer__cert-num" id="dw-viewer-cert-num">Certificate Number —</p>' +
                  '<button type="button" class="dw-viewer__cert-link" id="dw-viewer-cert-link">Click to view certificate</button>' +
                '</div>' +
              '</div>' +
              // Price block — left labels, right amounts
              '<div class="dw-viewer__price-block">' +
                '<div class="dw-viewer__price-labels">' +
                  '<p class="dw-viewer__price-label">Price</p>' +
                  '<p class="dw-viewer__price-sublabel">Price only for diamond</p>' +
                '</div>' +
                '<div class="dw-viewer__price-amounts">' +
                  '<p class="dw-viewer__price" id="dw-viewer-price">—</p>' +
                  '<span class="dw-viewer__price-strike-row" id="dw-viewer-price-strike-row" hidden>' +
                    '<span class="dw-viewer__price-strike" id="dw-viewer-price-strike"></span>' +
                    '<span class="dw-viewer__price-discount" id="dw-viewer-price-discount"></span>' +
                  '</span>' +
                '</div>' +
              '</div>' +
              // Action buttons stacked. Add to cart is the loud primary
              // (dw-btn--solid); "Talk to an expert" is a subtle outline.
              '<div class="dw-viewer__actions">' +
                '<button type="button" class="dw-btn dw-btn--solid dw-viewer__add" id="dw-viewer-add">Add to cart</button>' +
                // "Talk to an expert" — opens a pre-filled mailto: with the
                // stone summary (handler in attachListeners). Anti-emoji.
                '<button type="button" class="dw-viewer__expert" id="dw-viewer-expert">Talk to an expert</button>' +
              '</div>' +
              // Diamond details accordion (default open) — iter5 placement:
              // INSIDE the right column under the buttons, scrolls with the
              // page while the LEFT image well stays sticky. Pre-iter5 this
              // sat as a full-width sibling below the 2-col grid; Agent A's
              // CSS supports both placements (`.dw-viewer__detail .dw-viewer__details-section`
              // gets `grid-column: auto` so it doesn't bleed across columns).
              '<div class="dw-viewer__details-section" id="dw-viewer-details-section">' +
                '<section class="dw-viewer__accordion" id="dw-viewer-accordion" data-open="true">' +
                  '<button type="button" class="dw-viewer__accordion-trigger" id="dw-viewer-accordion-trigger" aria-expanded="true" aria-controls="dw-viewer-accordion-body">' +
                    '<span>Diamond details</span>' +
                    '<svg class="dw-viewer__accordion-chevron" viewBox="0 0 14 14" fill="none" aria-hidden="true">' +
                      '<path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
                    '</svg>' +
                  '</button>' +
                  '<div class="dw-viewer__accordion-body" id="dw-viewer-accordion-body">' +
                    '<dl class="dw-viewer__specs" id="dw-viewer-specs"></dl>' +
                  '</div>' +
                '</section>' +
              '</div>' +
            '</div>' +
          '</div>' +
          // Legacy caption hidden via CSS — kept in DOM in case something references it.
          '<p class="dw-viewer__caption" id="dw-viewer-caption" hidden></p>' +
        '</div>' +
      '</div>'
    );
  }

  // Inline lab seal SVGs — minimal, monogrammed octagonal seals so no
  // external assets are loaded. One per lab + a generic fallback.
  var LAB_SEALS = {
    igi: '<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
           '<polygon points="22,3 35,8 40,22 35,36 22,41 9,36 4,22 9,8" stroke="currentColor" stroke-width="1.4" fill="none"/>' +
           '<text x="22" y="26" text-anchor="middle" font-family="Instrument Sans, system-ui, sans-serif" font-size="10" font-weight="600" fill="currentColor" letter-spacing="0.5">IGI</text>' +
         '</svg>',
    gia: '<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
           '<circle cx="22" cy="22" r="19" stroke="currentColor" stroke-width="1.4" fill="none"/>' +
           '<circle cx="22" cy="22" r="14" stroke="currentColor" stroke-width="0.7" fill="none"/>' +
           '<text x="22" y="26" text-anchor="middle" font-family="Instrument Sans, system-ui, sans-serif" font-size="10" font-weight="600" fill="currentColor" letter-spacing="0.5">GIA</text>' +
         '</svg>',
    hrd: '<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
           '<rect x="4" y="4" width="36" height="36" rx="4" stroke="currentColor" stroke-width="1.4" fill="none"/>' +
           '<text x="22" y="26" text-anchor="middle" font-family="Instrument Sans, system-ui, sans-serif" font-size="10" font-weight="600" fill="currentColor" letter-spacing="0.5">HRD</text>' +
         '</svg>',
    generic: '<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
               '<polygon points="22,4 38,12 38,32 22,40 6,32 6,12" stroke="currentColor" stroke-width="1.4" fill="none"/>' +
               '<polygon points="22,12 32,16 32,28 22,32 12,28 12,16" stroke="currentColor" stroke-width="0.6" fill="none" opacity="0.55"/>' +
             '</svg>'
  };
  function svgForLab(lab) {
    var k = String(lab || '').toLowerCase().trim();
    return LAB_SEALS[k] || LAB_SEALS.generic;
  }

  // Inline checkmark glyph for the cart button "Added" / "In cart" states.
  // Anti-emoji rule (taste.md §2): no unicode '✓'. Two-line check, currentColor
  // so it inherits the surrounding button text colour. 12px box pairs with
  // the 14px button text without overhanging the cap-height.
  var CHECK_SVG =
    '<svg class="dw-btn__check" viewBox="0 0 12 12" fill="none" aria-hidden="true" focusable="false">' +
      '<path d="M2.5 6.2L5 8.7L9.5 3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

  function buildCheckoutOverlayHTML() {
    return (
      '<div class="dw-overlay" id="dw-checkout" role="dialog" aria-modal="true" aria-labelledby="dw-checkout-title" hidden>' +
        '<div class="dw-overlay__backdrop" id="dw-checkout-backdrop"></div>' +
        '<div class="dw-overlay__panel">' +
          '<button class="dw-overlay__close" id="dw-checkout-close" type="button" aria-label="Close">&#x2715;</button>' +
          '<h2 class="dw-overlay__title" id="dw-checkout-title">Place Order</h2>' +
          '<p class="dw-overlay__spec" id="dw-checkout-summary"></p>' +
          '<form class="dw-overlay__form" id="dw-checkout-form" novalidate>' +
            '<div class="dw-overlay__field">' +
              '<label for="dw-co-name">Your Name</label>' +
              '<input type="text" id="dw-co-name" name="name" required autocomplete="name" placeholder="Full name">' +
            '</div>' +
            '<div class="dw-overlay__field">' +
              '<label for="dw-co-email">Email Address</label>' +
              '<input type="email" id="dw-co-email" name="email" required autocomplete="email" placeholder="you@example.com">' +
            '</div>' +
            '<div class="dw-overlay__field">' +
              '<label for="dw-co-note">Order note <span class="dw-overlay__optional">(optional)</span></label>' +
              '<textarea id="dw-co-note" name="note" rows="3" placeholder="Any special requests…"></textarea>' +
            '</div>' +
            '<button class="dw-btn dw-btn--solid dw-overlay__submit" type="submit">Place Order</button>' +
          '</form>' +
          '<div class="dw-overlay__thanks" id="dw-checkout-thanks" hidden>' +
            '<svg class="dw-overlay__thanks-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/><path d="M7.5 12l3 3 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            '<p>Order placed — invoice <strong id="dw-checkout-invoice">—</strong>. We&rsquo;ll be in touch.</p>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  // ─── LISTENERS ────────────────────────────────────────────────────────────

  function attachFilterListeners() {
    // Pill grids — single or multi select per data-multi
    var pillGroups = root.querySelectorAll('.dw-pills');
    pillGroups.forEach(function (group) {
      group.addEventListener('click', function (e) {
        var pill = e.target.closest('.dw-pill');
        if (!pill) return;
        var key = group.dataset.key;
        var multi = group.dataset.multi === '1';
        var value = pill.dataset.value;

        if (key === 'shape') {
          state.shape = (state.shape === value) ? '' : value;
        } else if (multi) {
          var arr = state[key];
          var i = arr.indexOf(value);
          if (i >= 0) arr.splice(i, 1); else arr.push(value);
        }
        syncFilterUIFromState();
        renderChips();
        writeStateToURL();
        fetchInitial();
      });
    });

    // Sliders (carat only — price removed in C-iter1)
    initSlider(root.querySelector('.dw-slider[data-key="carat"]'), function (lo, hi) {
      state.minCarat = lo; state.maxCarat = hi;
    });

    // Treatment tabs (single-select)
    var treatmentTabs = root.querySelectorAll('.dw-treatment-tab');
    treatmentTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        state.treatment = tab.dataset.value || '';
        syncTreatmentUIFromState();
        renderChips();
        writeStateToURL();
        fetchInitial();
      });
    });

    // hasImage toggle
    var hasImageInput = root.querySelector('#dw-has-image');
    if (hasImageInput) {
      hasImageInput.addEventListener('change', function () {
        state.hasImage = !!this.checked;
        renderChips();
        writeStateToURL();
        fetchInitial();
      });
    }
  }

  function syncTreatmentUIFromState() {
    var tabs = root.querySelectorAll('.dw-treatment-tab');
    tabs.forEach(function (t) {
      var active = (t.dataset.value || '') === (state.treatment || '');
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  function attachListeners() {
    sortEl.addEventListener('change', function () {
      state.sort = this.value;
      writeStateToURL();
      fetchInitial();
    });
    loadMoreBtn.addEventListener('click', loadMore);

    cartTrigger.addEventListener('click', openCartPanel);
    root.querySelector('#dw-cart-close').addEventListener('click', closeCartPanel);
    cartBackdrop.addEventListener('click', closeCartPanel);

    root.querySelector('#dw-cart-checkout').addEventListener('click', openCheckout);
    root.querySelector('#dw-checkout-close').addEventListener('click', closeCheckout);
    root.querySelector('#dw-checkout-backdrop').addEventListener('click', closeCheckout);
    root.querySelector('#dw-checkout-form').addEventListener('submit', handleCheckoutSubmit);

    // 360° viewer modal close paths — back link (primary), legacy X button,
    // and click-outside on the backdrop. The X is hidden via CSS but kept in
    // the DOM in case any merchant-side script targets it.
    if (viewerBackBtn) viewerBackBtn.addEventListener('click', function () { closeViewer(); });
    var viewerCloseLegacy = root.querySelector('#dw-viewer-close');
    if (viewerCloseLegacy) viewerCloseLegacy.addEventListener('click', function () { closeViewer(); });
    root.querySelector('#dw-viewer-backdrop').addEventListener('click', closeViewer);

    // Accordion toggle for the "Diamond details" section. Default: open.
    if (viewerAccordionTrg) {
      viewerAccordionTrg.addEventListener('click', function () {
        var open = viewerAccordion.getAttribute('data-open') === 'true';
        var next = open ? 'false' : 'true';
        viewerAccordion.setAttribute('data-open', next);
        viewerAccordionTrg.setAttribute('aria-expanded', next);
      });
    }

    // "Talk to an expert" — opens a pre-filled mailto: with the current
    // stone's summary so the buyer doesn't have to retype anything. The
    // accordion no longer holds this fallback (it sits in the right column
    // now and is already visible by default per iter5 placement).
    if (viewerExpertBtn) {
      viewerExpertBtn.addEventListener('click', function () {
        if (!viewerState.diamond) return;
        var d = viewerState.diamond;
        var subject = 'Question about diamond ' + (d.stockNum || '');
        var carat   = d.carat != null ? Number(d.carat).toFixed(2) : '';
        var shape   = capShape(d.shape || 'Diamond');
        var price   = d.price != null ? formatMoney(d.price, d.currency || cart.currency || 'USD') : '';
        var body    = "Hi,\n\nI'm interested in this diamond:\n" +
                      "  Stock " + (d.stockNum || '—') + "\n" +
                      "  " + carat + 'ct ' + shape + ' ' + diamondTypeLabel(d) + "\n" +
                      "  " + price + "\n\nCould you help me?\n\nThanks";
        // TODO: swap email when Estrella domain is live (sales@estrella.diamonds
        // or similar). Placeholder won't deliver but does open the user's
        // mail client with the message ready, which is the desired UX.
        var href = 'mailto:sales@example.com?subject=' + encodeURIComponent(subject) +
                   '&body=' + encodeURIComponent(body);
        window.location.href = href;
      });
    }

    // Cert link — best-effort: scrolls to details where the cert number lives.
    // If we ever expose a per-stone certificate PDF URL, swap to window.open.
    if (viewerCertLink) {
      viewerCertLink.addEventListener('click', function () {
        if (!viewerDetailsSec) return;
        if (viewerAccordion && viewerAccordion.getAttribute('data-open') !== 'true') {
          viewerAccordion.setAttribute('data-open', 'true');
          viewerAccordionTrg.setAttribute('aria-expanded', 'true');
        }
        try {
          viewerDetailsSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (e) {
          viewerDetailsSec.scrollIntoView();
        }
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (!viewerPanel.hidden) closeViewer();
      else if (!checkoutPanel.hidden) closeCheckout();
      else if (cartPanel.classList.contains('is-open')) closeCartPanel();
    });

    // Click delegation: Add-to-cart button takes priority. Anywhere else on
    // a card opens the detail modal (rich layout: video → image → SVG
    // tier fallback + spec table + add-to-cart in panel).
    root.addEventListener('click', function (e) {
      var addBtn = e.target.closest('.dw-card__add');
      if (addBtn) { handleAddClick(addBtn); return; }
      var card = e.target.closest('.dw-card');
      if (card && card.dataset.stockNum) {
        var d = diamondsByStockNum[card.dataset.stockNum] || null;
        openViewer(d, { pushHistory: true });
      }
    });

    // Tier toggle buttons (manual override of automatic tier promotion)
    viewerTierBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!viewerState.diamond) return;
        loadViewerTier(btn.dataset.tier);
      });
    });

    // Modal Add-to-cart respects the same state machine as card-add buttons.
    viewerAddBtn.addEventListener('click', function () {
      var d = viewerState.diamond;
      if (!d || !d.id) return;
      // Reuse handleAddClick by emulating a card-add button. The actual
      // card button (in the grid behind) updates via markCardsInCart()
      // after the cart fetch completes.
      var fakeBtn = document.createElement('button');
      fakeBtn.dataset.id = String(d.id);
      // Drive the in-modal button through the same setButtonState +
      // fetch logic by passing it instead of fakeBtn.
      handleAddClick(viewerAddBtn);
    });

    // Browser back/forward should close the modal cleanly when the URL no
    // longer references a stone.
    window.addEventListener('popstate', function () {
      var sn = currentStoneFromURL();
      if (!sn && !viewerPanel.hidden) {
        // Close without pushing another history entry.
        closeViewer({ syncHistory: false });
      } else if (sn && diamondsByStockNum[sn]) {
        openViewer(diamondsByStockNum[sn], { pushHistory: false });
      }
    });

    cartBody.addEventListener('click', function (e) {
      var btn = e.target.closest('.dw-cart-item__remove');
      if (btn) handleRemoveClick(btn.dataset.id);
    });
  }

  // ─── DUAL-THUMB SLIDER ────────────────────────────────────────────────────
  // Two overlapped <input type=range>; each clamps so they can't cross.

  function initSlider(slider, onChange) {
    if (!slider) return;
    var min = Number(slider.dataset.min);
    var max = Number(slider.dataset.max);
    var step = Number(slider.dataset.step);
    var minInput = slider.querySelector('.dw-slider__input--min');
    var maxInput = slider.querySelector('.dw-slider__input--max');
    var range    = slider.querySelector('.dw-slider__range');
    // Number-input boxes (added Phase D-final 1.8 — two-way bound to the
    // range thumbs). Older spans (.dw-slider__val--min/max) no longer in
    // the DOM but the lookup-and-skip pattern below stays defensive.
    var minNum   = slider.parentElement.querySelector('.dw-slider__num--min');
    var maxNum   = slider.parentElement.querySelector('.dw-slider__num--max');
    var key      = slider.dataset.key;

    function paint() {
      var lo = Number(minInput.value);
      var hi = Number(maxInput.value);
      if (lo > hi - step) lo = hi - step;
      if (hi < lo + step) hi = lo + step;
      var pctLo = ((lo - min) / (max - min)) * 100;
      var pctHi = ((hi - min) / (max - min)) * 100;
      range.style.left  = pctLo + '%';
      range.style.right = (100 - pctHi) + '%';
      // Mirror to number inputs (avoid feedback loops by guarding focus)
      if (minNum && document.activeElement !== minNum) minNum.value = Number(lo).toFixed(2);
      if (maxNum && document.activeElement !== maxNum) maxNum.value = Number(hi).toFixed(2);
      slider._lo = lo;
      slider._hi = hi;
    }

    function commit() {
      paint();
      onChange(slider._lo, slider._hi);
      renderChips();
      writeStateToURL();
      fetchInitial();
    }

    minInput.addEventListener('input', paint);
    maxInput.addEventListener('input', paint);
    minInput.addEventListener('change', commit);
    maxInput.addEventListener('change', commit);

    // Number-input <-> range two-way binding. Clamp + guard against crossing.
    if (minNum) {
      minNum.addEventListener('change', function () {
        var v = clamp(Number(minNum.value), min, max);
        var hi = Number(maxInput.value);
        if (v > hi - step) v = hi - step;
        minInput.value = v;
        commit();
      });
    }
    if (maxNum) {
      maxNum.addEventListener('change', function () {
        var v = clamp(Number(maxNum.value), min, max);
        var lo = Number(minInput.value);
        if (v < lo + step) v = lo + step;
        maxInput.value = v;
        commit();
      });
    }

    // Initial paint from current state values (carat is the only slider
    // remaining after C-iter1 removed the price slider).
    if (key === 'carat') {
      minInput.value = state.minCarat;
      maxInput.value = state.maxCarat;
    }
    paint();
  }

  // ─── FILTER UI <-> STATE ──────────────────────────────────────────────────

  function syncFilterUIFromState() {
    var pillGroups = root.querySelectorAll('.dw-pills');
    pillGroups.forEach(function (group) {
      var key = group.dataset.key;
      group.querySelectorAll('.dw-pill').forEach(function (pill) {
        var v = pill.dataset.value;
        var active = false;
        if (key === 'shape') active = (state.shape === v);
        else if (key === 'colors') active = state.colors.indexOf(v) >= 0;
        else if (key === 'clarities') active = state.clarities.indexOf(v) >= 0;
        else if (key === 'cuts') active = state.cuts.indexOf(v) >= 0;
        else if (key === 'certificates') active = state.certificates.indexOf(v) >= 0;
        pill.classList.toggle('is-active', active);
        pill.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    });
  }

  function clearAllFilters() {
    state.shape = '';
    state.colors = [];
    state.clarities = [];
    state.cuts = [];
    state.certificates = [];
    state.treatment = '';
    state.hasImage = false;
    state.minCarat = CARAT_MIN; state.maxCarat = CARAT_MAX;
    if (showFilters) {
      syncTreatmentUIFromState();
      var hasImg = root.querySelector('#dw-has-image');
      if (hasImg) hasImg.checked = false;
      syncFilterUIFromState();
      // Reset slider visual + inputs
      var sliders = root.querySelectorAll('.dw-slider');
      sliders.forEach(function (s) {
        var minI = s.querySelector('.dw-slider__input--min');
        var maxI = s.querySelector('.dw-slider__input--max');
        minI.value = s.dataset.min; maxI.value = s.dataset.max;
        minI.dispatchEvent(new Event('input'));
        maxI.dispatchEvent(new Event('input'));
      });
    }
    renderChips();
    writeStateToURL();
    fetchInitial();
  }

  function renderChips() {
    if (!chipsBar) return;
    var chips = [];
    if (state.treatment) {
      var tlabel = (state.treatment === 'lab-grown') ? 'Lab-Grown' : 'Natural';
      chips.push({ k: 'treatment', v: '', label: tlabel });
    }
    if (state.shape) chips.push({ k: 'shape', v: state.shape, label: capShape(state.shape) });
    state.colors.forEach(function (c)    { chips.push({ k: 'colors', v: c, label: 'Colour: ' + c }); });
    state.clarities.forEach(function (c) { chips.push({ k: 'clarities', v: c, label: 'Clarity: ' + c }); });
    state.cuts.forEach(function (c)      { chips.push({ k: 'cuts', v: c, label: 'Cut: ' + c }); });
    state.certificates.forEach(function (c) { chips.push({ k: 'certificates', v: c, label: c }); });
    if (state.minCarat > CARAT_MIN || state.maxCarat < CARAT_MAX) {
      chips.push({ k: 'carat', v: '', label: 'Carats: ' + state.minCarat.toFixed(2) + '–' + state.maxCarat.toFixed(2) });
    }
    if (state.hasImage) {
      chips.push({ k: 'hasImage', v: '', label: 'With image' });
    }

    if (chips.length === 0) {
      chipsBar.hidden = true;
      while (chipsBar.firstChild) chipsBar.removeChild(chipsBar.firstChild);
      return;
    }
    chipsBar.hidden = false;
    while (chipsBar.firstChild) chipsBar.removeChild(chipsBar.firstChild);
    chips.forEach(function (c) {
      var el = document.createElement('button');
      el.className = 'dw-chip';
      el.type = 'button';
      el.setAttribute('data-key', c.k);
      el.setAttribute('data-value', c.v);
      el.setAttribute('aria-label', 'Remove ' + c.label);
      el.textContent = c.label;
      var x = document.createElement('span');
      x.className = 'dw-chip__x';
      x.setAttribute('aria-hidden', 'true');
      x.textContent = '✕';
      el.appendChild(x);
      el.addEventListener('click', function () { removeChip(c.k, c.v); });
      chipsBar.appendChild(el);
    });
    var clearAll = document.createElement('button');
    clearAll.className = 'dw-chip__clear';
    clearAll.type = 'button';
    clearAll.textContent = 'Clear all';
    clearAll.addEventListener('click', clearAllFilters);
    chipsBar.appendChild(clearAll);
  }

  function removeChip(k, v) {
    if (k === 'shape') state.shape = '';
    else if (k === 'treatment') state.treatment = '';
    else if (k === 'hasImage') state.hasImage = false;
    else if (k === 'carat') { state.minCarat = CARAT_MIN; state.maxCarat = CARAT_MAX; }
    else {
      var arr = state[k];
      var i = arr.indexOf(v);
      if (i >= 0) arr.splice(i, 1);
    }
    if (showFilters) {
      syncFilterUIFromState();
      syncTreatmentUIFromState();
      var hasImg = root.querySelector('#dw-has-image');
      if (hasImg) hasImg.checked = !!state.hasImage;
    }
    if (k === 'carat') {
      var s = root.querySelector('.dw-slider[data-key="carat"]');
      if (s) {
        var minI = s.querySelector('.dw-slider__input--min');
        var maxI = s.querySelector('.dw-slider__input--max');
        minI.value = s.dataset.min; maxI.value = s.dataset.max;
        minI.dispatchEvent(new Event('input'));
      }
    }
    renderChips();
    writeStateToURL();
    fetchInitial();
  }

  // ─── URL STATE SYNC ───────────────────────────────────────────────────────

  function readStateFromURL() {
    try {
      var params = new URLSearchParams(window.location.search);
      var v;
      if ((v = params.get(URL_PREFIX + 'shape')))      state.shape = v;
      if ((v = params.get(URL_PREFIX + 'color')))      state.colors = v.split(',').filter(Boolean);
      if ((v = params.get(URL_PREFIX + 'clarity')))    state.clarities = v.split(',').filter(Boolean);
      if ((v = params.get(URL_PREFIX + 'cut')))        state.cuts = v.split(',').filter(Boolean);
      if ((v = params.get(URL_PREFIX + 'certificate'))) state.certificates = v.split(',').filter(Boolean);
      if ((v = params.get(URL_PREFIX + 'treatment'))) state.treatment = v;
      if (params.get(URL_PREFIX + 'hasImage') === 'true') state.hasImage = true;
      if ((v = params.get(URL_PREFIX + 'carat_min')))  state.minCarat = clamp(Number(v), CARAT_MIN, CARAT_MAX);
      if ((v = params.get(URL_PREFIX + 'carat_max')))  state.maxCarat = clamp(Number(v), CARAT_MIN, CARAT_MAX);
      if ((v = params.get(URL_PREFIX + 'sort')))       state.sort = v;
    } catch (e) { /* URL parse failure — keep defaults */ }
  }

  function writeStateToURL() {
    try {
      var params = new URLSearchParams(window.location.search);
      // Strip our existing keys
      Array.from(params.keys()).forEach(function (k) {
        if (k.indexOf(URL_PREFIX) === 0) params.delete(k);
      });
      if (state.shape)               params.set(URL_PREFIX + 'shape', state.shape);
      if (state.colors.length)       params.set(URL_PREFIX + 'color', state.colors.join(','));
      if (state.clarities.length)    params.set(URL_PREFIX + 'clarity', state.clarities.join(','));
      if (state.cuts.length)         params.set(URL_PREFIX + 'cut', state.cuts.join(','));
      if (state.certificates.length) params.set(URL_PREFIX + 'certificate', state.certificates.join(','));
      if (state.treatment) params.set(URL_PREFIX + 'treatment', state.treatment);
      if (state.hasImage) params.set(URL_PREFIX + 'hasImage', 'true');
      if (state.minCarat > CARAT_MIN) params.set(URL_PREFIX + 'carat_min', state.minCarat.toFixed(2));
      if (state.maxCarat < CARAT_MAX) params.set(URL_PREFIX + 'carat_max', state.maxCarat.toFixed(2));
      if (state.sort && state.sort !== 'price_asc') params.set(URL_PREFIX + 'sort', state.sort);
      var qs = params.toString();
      var url = window.location.pathname + (qs ? '?' + qs : '') + window.location.hash;
      window.history.replaceState({}, '', url);
    } catch (e) { /* history API unavailable */ }
  }

  // ─── DIAMOND FETCH ────────────────────────────────────────────────────────

  function buildFilterParams() {
    var p = new URLSearchParams();
    p.set('shop', shop);
    if (state.shape)            p.set('shape', state.shape);
    if (state.colors.length)    p.set('color', state.colors.join(','));
    if (state.clarities.length) p.set('clarity', state.clarities.join(','));
    if (state.cuts.length)      p.set('cut', state.cuts.join(','));
    if (state.certificates.length) p.set('certificate', state.certificates.join(','));
    if (state.treatment)        p.set('treatment', state.treatment);
    if (state.hasImage)         p.set('hasImage', 'true');
    // Carat params use camelCase per Augmont contract (verified C-setup
    // task 4a — snake_case is silently ignored upstream). URL prefix params
    // (d_carat_min, d_carat_max) stay snake-cased for readability.
    if (state.minCarat > CARAT_MIN) p.set('minCarat', state.minCarat.toFixed(2));
    if (state.maxCarat < CARAT_MAX) p.set('maxCarat', state.maxCarat.toFixed(2));
    if (state.sort)             p.set('sort', state.sort);
    return p;
  }

  function fetchInitial() {
    pagination.from = 1;
    pagination.to = perPage;
    pagination.hasMore = false;
    pagination.total = null;
    loadedDiamonds = [];
    var seq = ++requestSeq;
    renderSkeletons();
    countEl.textContent = 'Loading diamonds…';
    loadMoreWrap.hidden = true;

    var params = buildFilterParams();
    params.set('from', String(pagination.from));
    params.set('to', String(pagination.to));
    params.set('count', 'true');

    return fetch(apiUrl + '/api/public/diamonds?' + params.toString())
      .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
      .then(function (data) {
        if (seq !== requestSeq) return; // newer request superseded this one
        var diamonds = Array.isArray(data) ? data : (data.diamonds || data.data || []);
        loadedDiamonds = diamonds.slice();
        if (data.pagination) {
          pagination.from = data.pagination.from || pagination.from;
          pagination.to   = data.pagination.to   || pagination.to;
          pagination.hasMore = !!data.pagination.hasMore;
        } else {
          pagination.hasMore = diamonds.length >= perPage;
        }
        if (typeof data.totalCount === 'number') {
          pagination.total = data.totalCount;
        }
        renderResults();
        // If the URL has ?stone=X (share-link / refresh-with-modal-open),
        // re-open that stone now that diamondsByStockNum is populated.
        maybeOpenDeepLinkStone();
      })
      .catch(function (err) {
        if (seq !== requestSeq) return;
        console.error('[diamond-widget]', err);
        renderError();
      });
  }

  function loadMore() {
    if (!pagination.hasMore) return;
    var seq = ++requestSeq;
    var nextFrom = pagination.to + 1;
    var nextTo   = nextFrom + perPage - 1;
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = 'Loading…';

    var params = buildFilterParams();
    params.set('from', String(nextFrom));
    params.set('to', String(nextTo));

    fetch(apiUrl + '/api/public/diamonds?' + params.toString())
      .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
      .then(function (data) {
        if (seq !== requestSeq) return;
        var diamonds = Array.isArray(data) ? data : (data.diamonds || data.data || []);
        loadedDiamonds = loadedDiamonds.concat(diamonds);
        if (data.pagination) {
          pagination.from = data.pagination.from || nextFrom;
          pagination.to   = data.pagination.to   || nextTo;
          pagination.hasMore = !!data.pagination.hasMore;
        } else {
          pagination.from = nextFrom;
          pagination.to = nextTo;
          pagination.hasMore = diamonds.length >= perPage;
        }
        appendCards(diamonds);
        markCardsInCart();
        updateCounters();
        loadMoreBtn.disabled = false;
        loadMoreBtn.textContent = 'Load more';
        if (!pagination.hasMore) loadMoreWrap.hidden = true;
      })
      .catch(function (err) {
        if (seq !== requestSeq) return;
        console.error('[diamond-widget]', err);
        loadMoreBtn.disabled = false;
        loadMoreBtn.textContent = 'Try again';
      });
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────

  function renderResults() {
    if (loadedDiamonds.length === 0) {
      renderEmpty();
      countEl.textContent = '0 diamonds';
      loadMoreWrap.hidden = true;
      return;
    }
    while (grid.firstChild) grid.removeChild(grid.firstChild);
    appendCards(loadedDiamonds);
    markCardsInCart();
    updateCounters();
    loadMoreWrap.hidden = !pagination.hasMore;
  }

  function updateCounters() {
    var loaded = loadedDiamonds.length;
    if (pagination.total != null) {
      countEl.textContent = 'Showing ' + loaded + ' of ' + pagination.total.toLocaleString() + ' diamonds';
      loadMoreCount.textContent = loaded + ' / ' + pagination.total.toLocaleString();
    } else {
      countEl.textContent = 'Showing ' + loaded + ' diamonds';
      loadMoreCount.textContent = loaded + ' loaded';
    }
  }

  function appendCards(diamonds) {
    var frag = document.createDocumentFragment();
    diamonds.forEach(function (d) {
      // Index by stockNum so the modal/deep-link path can resolve
      // d -> full record without re-fetching.
      if (d && d.stockNum) diamondsByStockNum[String(d.stockNum)] = d;
      frag.appendChild(buildCard(d));
    });
    grid.appendChild(frag);
  }

  function buildCard(d) {
    var shapeRaw = String(d.shape   || 'Diamond');
    var shape    = capShape(shapeRaw);
    var carat    = (d.carat != null) ? Number(d.carat) : null;
    var caratStr = carat != null ? carat.toFixed(2) : '—';
    var color    = String(d.color   || '—');
    var clarity  = String(d.clarity || '—');
    var cut      = d.cut ? String(d.cut) : '';
    var price    = (d.price != null) ? Number(d.price) : null;
    var mrp      = (d.mrp != null && Number(d.mrp) > 0) ? Number(d.mrp) : null;
    var image    = String(d.image_url || d.image || '');
    var stockNum = String(d.stockNum || '');
    var id       = String(d.id || d.stoneId || d.stockNum || '');
    var ccyCode  = d.currency || cart.currency || 'USD';

    var article = document.createElement('article');
    article.className = 'dw-card';
    // Card click delegates to openViewer() via attachListeners — these
    // attributes carry the iframe URL inputs and accessible label text.
    article.setAttribute('data-stock-num', stockNum);
    article.setAttribute('data-shape', shape);
    article.setAttribute('data-carat', caratStr);
    article.setAttribute('role', 'button');
    article.setAttribute('tabindex', '0');
    article.setAttribute('aria-label', 'View ' + caratStr + 'ct ' + shape + ' ' + diamondTypeLabel(d) + ' in 360°');

    // Image well
    var imgWrap = document.createElement('div');
    imgWrap.className = 'dw-card__image';
    if (image) {
      var img = document.createElement('img');
      img.setAttribute('src', image);
      img.setAttribute('alt', shape + ' diamond ' + caratStr + 'ct ' + color + ' ' + clarity);
      img.setAttribute('loading', 'lazy');
      img.setAttribute('width', '316'); img.setAttribute('height', '316');
      img.addEventListener('error', function () {
        while (imgWrap.firstChild) imgWrap.removeChild(imgWrap.firstChild);
        imgWrap.appendChild(buildPlaceholder(shapeRaw));
        imgWrap.appendChild(buildViewOverlay());
      });
      imgWrap.appendChild(img);
    } else {
      imgWrap.appendChild(buildPlaceholder(shapeRaw));
    }
    // Hover affordance ("View 360°") sits over both the placeholder and
    // any successfully loaded image. Pure CSS reveals it on hover.
    imgWrap.appendChild(buildViewOverlay());

    // Discount badge — only render if mrp is meaningfully greater than price.
    // Augmont UAT/prod do not currently expose mrp; this stays inert until
    // the data model adds it. Threshold: >2% to avoid rounding noise.
    if (mrp && price && mrp > price * 1.02) {
      var pct = Math.round((1 - price / mrp) * 100);
      var badge = document.createElement('span');
      badge.className = 'dw-card__badge';
      badge.textContent = '-' + pct + '%';
      imgWrap.appendChild(badge);
    }

    // "360" pill — render whenever we have a stockNum, since the modal will
    // attempt the video tier first and auto-fall-back if unavailable. CSS
    // shifts the pill to top-right when a discount badge is also present,
    // so the two never collide.
    if (stockNum) {
      var spinBadge = document.createElement('span');
      spinBadge.className = 'dw-card__360-badge';
      spinBadge.textContent = '360';
      spinBadge.setAttribute('aria-hidden', 'true');
      imgWrap.appendChild(spinBadge);
    }

    article.appendChild(imgWrap);

    var body = document.createElement('div');
    body.className = 'dw-card__body';

    // Title: "0.50ct Cushion Diamond" — "Natural" dropped in C-iter2;
    // Augmont catalog is overwhelmingly LGD and the Treatment tab control
    // disambiguates whichever label the merchant cares about.
    var title = document.createElement('p');
    title.className = 'dw-card__title';
    title.textContent = caratStr + 'ct ' + shape + ' ' + diamondTypeLabel(d);
    body.appendChild(title);

    // Specs line — Color · Clarity · Cut. Middle-dot separator (Aria Morelle
    // convention) reads more editorial than commas, and gives the card a
    // single visual rhythm with the modal head-spec line.
    var specs = document.createElement('p');
    specs.className = 'dw-card__specs';
    var pieces = [];
    // Aria Morelle keeps Cut visible with a literal '-' when missing
    // rather than dropping the column. Match.
    pieces.push(specPair('Color', color));
    pieces.push(specPair('Clarity', clarity));
    pieces.push(specPair('Cut', cut || '-'));
    pieces.forEach(function (frag, i) {
      if (i > 0) {
        var sep = document.createElement('span');
        sep.className = 'dw-card__spec-sep';
        sep.textContent = ' · ';
        specs.appendChild(sep);
      }
      specs.appendChild(frag);
    });
    body.appendChild(specs);

    // Price block — price + (optional MRP strikethrough) + (optional cert badge)
    var priceBlock = document.createElement('div');
    priceBlock.className = 'dw-card__price-block';
    if (price != null) {
      var priceEl = document.createElement('p');
      priceEl.className = 'dw-card__price';
      priceEl.textContent = formatMoney(price, ccyCode);
      priceBlock.appendChild(priceEl);
      if (mrp && mrp > price * 1.02) {
        var strike = document.createElement('p');
        strike.className = 'dw-card__price-strike';
        strike.textContent = formatMoney(mrp, ccyCode);
        priceBlock.appendChild(strike);
      }
    }
    var labRaw = d.lab ? String(d.lab).trim() : '';
    if (labRaw && !/^no[-\s]?cert$/i.test(labRaw)) {
      var certEl = document.createElement('span');
      certEl.className = 'dw-card__cert';
      certEl.textContent = labRaw.toUpperCase() + ' Certified';
      priceBlock.appendChild(certEl);
    }
    body.appendChild(priceBlock);

    // Ships line — Augmont doesn't expose stone-level ship time; hardcoded
    // for visual parity with Nivoda. Plain text, no emoji (taste.md rule).
    var ships = document.createElement('p');
    ships.className = 'dw-card__ships';
    ships.textContent = shipsLineCopy();
    body.appendChild(ships);

    // Add to cart
    var btn = document.createElement('button');
    btn.className = 'dw-btn dw-btn--outline dw-card__add';
    btn.type = 'button';
    btn.setAttribute('data-id', id);
    setButtonState(btn, diamondIdsInCart.has(id) ? 'in-cart' : 'idle');
    body.appendChild(btn);

    article.appendChild(body);
    return article;
  }

  function specPair(label, value) {
    // "Color H" (label space, value bold) — no colon. Reads cleaner inside a
    // middle-dot-separated line, matches Aria Morelle's spec rhythm.
    var f = document.createDocumentFragment();
    var l = document.createElement('span');
    l.className = 'dw-card__spec-label';
    l.textContent = label + ' ';
    var v = document.createElement('strong');
    v.className = 'dw-card__spec-value';
    v.textContent = value;
    f.appendChild(l); f.appendChild(v);
    return f;
  }

  function renderSkeletons() {
    while (grid.firstChild) grid.removeChild(grid.firstChild);
    var n = perPage;
    for (var i = 0; i < n; i++) {
      var sk = document.createElement('div');
      sk.className = 'dw-skeleton';
      sk.innerHTML =
        '<div class="dw-skeleton__image"></div>' +
        '<div class="dw-skeleton__line dw-skeleton__line--lg"></div>' +
        '<div class="dw-skeleton__line"></div>' +
        '<div class="dw-skeleton__line dw-skeleton__line--md"></div>' +
        '<div class="dw-skeleton__btn"></div>';
      grid.appendChild(sk);
    }
  }

  function renderEmpty() {
    while (grid.firstChild) grid.removeChild(grid.firstChild);
    var box = document.createElement('div');
    box.className = 'dw-empty';
    box.innerHTML =
      '<svg class="dw-diamond-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true">' +
        '<polygon points="32,6 58,22 58,42 32,58 6,42 6,22" stroke="currentColor" stroke-width="1.5" fill="none"/>' +
      '</svg>' +
      '<h3 class="dw-empty__title">No diamonds match your filters</h3>' +
      '<p class="dw-empty__msg">Try widening the carat or price range, or removing a filter.</p>';
    var clear = document.createElement('button');
    clear.className = 'dw-btn dw-btn--outline dw-empty__reset';
    clear.type = 'button';
    clear.textContent = 'Clear all filters';
    clear.addEventListener('click', clearAllFilters);
    box.appendChild(clear);
    grid.appendChild(box);
  }

  function renderError() {
    while (grid.firstChild) grid.removeChild(grid.firstChild);
    var box = document.createElement('div');
    box.className = 'dw-error';
    box.innerHTML =
      '<svg class="dw-diamond-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true">' +
        '<polygon points="32,6 58,22 58,42 32,58 6,42 6,22" stroke="currentColor" stroke-width="1.5" fill="none"/>' +
      '</svg>' +
      '<h3 class="dw-error__title">Couldn’t load diamonds</h3>' +
      '<p class="dw-error__msg">Something went wrong on our side. Please try again.</p>';
    var retry = document.createElement('button');
    retry.className = 'dw-btn dw-btn--outline dw-error__retry';
    retry.type = 'button';
    retry.textContent = 'Retry';
    retry.addEventListener('click', fetchInitial);
    box.appendChild(retry);
    grid.appendChild(box);
    countEl.textContent = '';
    loadMoreWrap.hidden = true;
  }

  function buildPlaceholder(shape) {
    var placeholder = document.createElement('div');
    placeholder.className = 'dw-card__img-placeholder';
    placeholder.setAttribute('aria-hidden', 'true');
    // Inline SVG silhouette for the shape — the only branded fallback when
    // Augmont's image_url returns a non-image (HTML viewer page). innerHTML
    // is safe here because SVG_SVGS is a developer-controlled constant
    // (no user input), and rules out the gold-gradient broken-image look.
    placeholder.innerHTML = svgForShape(shape);
    return placeholder;
  }

  function buildViewOverlay() {
    var ov = document.createElement('div');
    ov.className = 'dw-card__view-overlay';
    ov.setAttribute('aria-hidden', 'true');
    var inner = document.createElement('span');
    inner.className = 'dw-card__view-overlay-text';
    inner.textContent = 'View 360°';
    ov.appendChild(inner);
    return ov;
  }

  // ─── CART ─────────────────────────────────────────────────────────────────

  function fetchCart() {
    return fetch(apiUrl + '/api/public/cart?shop=' + encodeURIComponent(shop) + '&sessionId=' + encodeURIComponent(sessionId))
      .then(function (res) { return res.ok ? res.json() : Promise.reject(res); })
      .then(function (data) {
        cart = {
          items:    Array.isArray(data.items) ? data.items : [],
          count:    data.count || 0,
          total:    data.total || 0,
          currency: data.currency || 'USD'
        };
        diamondIdsInCart = new Set(cart.items.map(function (i) { return i.diamondId; }));
        renderCartTrigger();
        if (cartPanel.classList.contains('is-open')) renderCartPanel();
        markCardsInCart();
      })
      .catch(function () { /* silent — empty cart fallback */ });
  }

  function handleAddClick(btn) {
    var diamondId = btn.dataset.id;
    if (!diamondId || btn.dataset.busy === '1') return;
    if (diamondIdsInCart.has(diamondId)) {
      openCartPanel();
      return;
    }
    setButtonState(btn, 'loading');
    fetch(apiUrl + '/api/public/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shop: shop, sessionId: sessionId, productId: diamondId })
    })
      .then(function (res) {
        if (res.status === 503) return res.json().then(function (b) { throw { kind: 'disabled', body: b }; });
        if (!res.ok) return res.json().catch(function () { return {}; }).then(function (b) { throw { kind: 'fail', body: b }; });
        return res.json();
      })
      .then(function (data) {
        setButtonState(btn, 'added');
        diamondIdsInCart.add(diamondId);
        // The /api/public/cart/add response now includes the diamond
        // snapshot (`data.diamond`) and the cart item id (`data.cartItemId`)
        // — see server/routes/cart.js. When present we patch local cart
        // state directly so the cart pill / mini-cart updates instantly
        // without the redundant GET /cart round-trip. If anything looks off
        // (idempotent re-add returning a stale snapshot, missing fields)
        // we fall back to fetchCart() which re-syncs from the server.
        if (data && data.diamond && data.cartItemId && Array.isArray(cart.items)) {
          var alreadyTracked = cart.items.some(function (it) { return it.id === data.cartItemId; });
          if (!alreadyTracked) {
            cart.items.push({
              id: data.cartItemId,
              augmontCartItemId: data.augmontCartItemId,
              diamondId: diamondId,
              diamond: data.diamond
            });
            cart.count = cart.items.length;
            cart.total = Math.round(((cart.total || 0) + Number(data.diamond.price || 0)) * 100) / 100;
            // Per-stone currency may differ from the cart-level currency;
            // keep the existing cart.currency unless empty (defensive).
            if (!cart.currency) cart.currency = data.diamond.currency || 'USD';
            renderCartTrigger();
            if (cartPanel.classList.contains('is-open')) renderCartPanel();
            markCardsInCart();
          }
        } else {
          // Server didn't include the snapshot — fall back to the cart GET.
          return fetchCart();
        }
      })
      .then(function () {
        setTimeout(function () { setButtonState(btn, 'in-cart'); }, 1400);
      })
      .catch(function (err) {
        if (err && err.kind === 'disabled') {
          setButtonState(btn, 'unavailable');
        } else {
          setButtonState(btn, 'error');
          setTimeout(function () { setButtonState(btn, 'idle'); }, 2200);
        }
      });
  }

  function handleRemoveClick(cartItemId) {
    if (!cartItemId) return;
    var row = cartBody.querySelector('[data-cart-item-id="' + cartItemId + '"]');
    if (row) row.classList.add('is-removing');
    fetch(apiUrl + '/api/public/cart/' + encodeURIComponent(cartItemId)
        + '?shop=' + encodeURIComponent(shop) + '&sessionId=' + encodeURIComponent(sessionId), {
      method: 'DELETE'
    })
      .then(function (res) { return res.ok ? res.json() : Promise.reject(res); })
      .then(function () { return fetchCart(); })
      .catch(function () { if (row) row.classList.remove('is-removing'); });
  }

  function handleCheckoutSubmit(e) {
    e.preventDefault();
    var form  = e.target;
    var name  = form.querySelector('#dw-co-name').value.trim();
    var email = form.querySelector('#dw-co-email').value.trim();
    var note  = form.querySelector('#dw-co-note').value.trim();
    if (!name || !email) return;

    var btn = form.querySelector('.dw-overlay__submit');
    btn.disabled = true; btn.textContent = 'Placing…';
    var prevErr = form.querySelector('.dw-overlay__error');
    if (prevErr) prevErr.parentNode.removeChild(prevErr);

    fetch(apiUrl + '/api/public/order/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shop: shop, sessionId: sessionId, customerName: name, customerEmail: email, orderNote: note })
    })
      .then(function (res) {
        if (res.status === 503) return res.json().then(function (b) { throw { kind: 'disabled', body: b }; });
        if (!res.ok) return res.json().catch(function () { return {}; }).then(function (b) { throw { kind: 'fail', body: b }; });
        return res.json();
      })
      .then(function (data) {
        form.hidden = true;
        var thanks = root.querySelector('#dw-checkout-thanks');
        var inv = root.querySelector('#dw-checkout-invoice');
        if (inv) inv.textContent = data.invoiceNumber || data.orderId || '—';
        thanks.hidden = false;
        fetchCart();
      })
      .catch(function (err) {
        btn.disabled = false; btn.textContent = 'Place Order';
        var msg = (err && err.kind === 'disabled')
          ? (err.body && err.body.error) || 'Online checkout is not yet enabled.'
          : (err && err.body && err.body.error) || 'Something went wrong, please try again.';
        var errEl = document.createElement('p');
        errEl.className = 'dw-overlay__error';
        errEl.textContent = msg;
        form.insertBefore(errEl, btn);
      });
  }

  function openCartPanel() {
    cartBackdrop.hidden = false;
    cartPanel.classList.add('is-open');
    cartPanel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    renderCartPanel();
  }

  function closeCartPanel() {
    cartPanel.classList.remove('is-open');
    cartPanel.setAttribute('aria-hidden', 'true');
    cartBackdrop.hidden = true;
    document.body.style.overflow = '';
  }

  function openCheckout() {
    if (cart.items.length === 0) return;
    var summary = cart.items.length === 1
      ? '1 diamond · ' + formatMoney(cart.total, cart.currency)
      : cart.items.length + ' diamonds · ' + formatMoney(cart.total, cart.currency);
    root.querySelector('#dw-checkout-summary').textContent = summary;
    root.querySelector('#dw-checkout-form').hidden = false;
    root.querySelector('#dw-checkout-form').reset();
    root.querySelector('#dw-checkout-thanks').hidden = true;
    var sub = root.querySelector('.dw-overlay__submit');
    sub.disabled = false; sub.textContent = 'Place Order';
    checkoutPanel.hidden = false;
    setTimeout(function () { root.querySelector('#dw-co-name').focus(); }, 50);
  }

  function closeCheckout() { checkoutPanel.hidden = true; }

  // ─── DETAIL MODAL (3-tier viewer + spec panel) ────────────────────────────
  //
  // Open behaviour:
  //   1. Populate the detail panel from the full diamond object.
  //   2. Start at tier=video; iframe src = viewmydiamonds.com/?id=X&type=video.
  //   3. Set a 3.5s tier-promotion timer. If the iframe `load` event fires
  //      before the timer, success — clear the timer.
  //   4. If the timer fires (no load event = hard 404 / blocked / very slow),
  //      promote: video → image → outline (SVG silhouette).
  //   5. The user can manually pick a tier via the three buttons under the
  //      iframe ("360° spin" / "Photo" / "Outline").
  //
  // We can't read iframe content cross-origin, so "No video found" detection
  // is opt-in via the user's manual tier toggle. The timer catches truly
  // failed loads.
  //
  // pushHistory: true on user click; we push ?stone=X to history so back-button
  // closes the modal and a copied URL re-opens the same stone on next load.

  var TIER_VIDEO   = 'video';
  var TIER_IMAGE   = 'image';
  var TIER_OUTLINE = 'outline';

  function openViewer(d, opts) {
    if (!d) return;
    opts = opts || {};
    clearViewerTimer();
    viewerState.diamond = d;

    // Populate detail panel
    var shapeRaw = d.shape || 'Diamond';
    var shape    = capShape(shapeRaw);
    var caratStr = (d.carat != null) ? Number(d.carat).toFixed(2) : '—';
    var color    = d.color   || '—';
    var clarity  = d.clarity || '—';
    var cut      = d.cut     ? String(d.cut) : '';
    var polish   = d.polish  ? String(d.polish) : '';
    var symmetry = d.symmetry ? String(d.symmetry) : '';
    var measurements = d.measurements ? String(d.measurements) : '';
    var labRaw   = d.lab     || '';
    var labClean = labRaw && !/^no[-\s]?cert$/i.test(labRaw) ? String(labRaw).trim() : '';
    var labUpper = labClean ? labClean.toUpperCase() : '';
    var certNum  = d.certificateNumber || d.certNumber || d.reportNumber || '';
    // Default to "Lab Grown Diamond" when treatment is absent — Augmont's
    // catalog is overwhelmingly LGD and Aria Morelle uses this convention
    // in card + modal titles + spec table Type field.
    var treatLabel = diamondTypeLabel(d);
    var price    = (d.price != null) ? Number(d.price) : null;
    var mrp      = (d.mrp != null && Number(d.mrp) > 0) ? Number(d.mrp) : null;
    var ccy      = d.currency || cart.currency || 'USD';

    viewerTitle.textContent = caratStr + 'ct ' + shape + ' ' + treatLabel;
    if (viewerShips) viewerShips.textContent = shipsLineCopy();

    // Header spec line: "Color H · Clarity VS2 · Cut VG"
    while (viewerHeadSpecBody.firstChild) viewerHeadSpecBody.removeChild(viewerHeadSpecBody.firstChild);
    var headPairs = [
      ['Color',   color],
      ['Clarity', clarity],
      ['Cut',     cut || '-']
    ];
    headPairs.forEach(function (pair, i) {
      if (i > 0) {
        var sep = document.createElement('span');
        sep.className = 'dw-viewer__head-spec-sep';
        sep.textContent = ' · ';
        viewerHeadSpecBody.appendChild(sep);
      }
      var l = document.createElement('span');
      l.className = 'dw-viewer__head-spec-label';
      l.textContent = pair[0] + ' ';
      var v = document.createElement('span');
      v.className = 'dw-viewer__head-spec-value';
      v.textContent = pair[1];
      viewerHeadSpecBody.appendChild(l);
      viewerHeadSpecBody.appendChild(v);
    });

    // Discount badge — only when MRP > price (data-driven, off by default)
    if (mrp && price && mrp > price * 1.02) {
      var pctOff = Math.round((1 - price / mrp) * 100);
      viewerDiscount.textContent = '-' + pctOff + '%';
      viewerDiscount.hidden = false;
    } else {
      viewerDiscount.hidden = true;
      viewerDiscount.textContent = '';
    }

    // Cert block — paint only when we actually have lab info. innerHTML use
    // is safe: LAB_SEALS is a developer-controlled inline-SVG constant.
    if (labClean) {
      viewerCertSeal.innerHTML = svgForLab(labClean);
      viewerCertName.textContent = labUpper + ' Certified';
      viewerCertNum.textContent = 'Certificate Number ' + (certNum ? String(certNum) : '—');
      viewerCertBlock.hidden = false;
    } else {
      viewerCertBlock.hidden = true;
      viewerCertSeal.innerHTML = '';
    }

    // Price block + optional MRP strikethrough / discount inline
    viewerPrice.textContent = price != null ? formatMoney(price, ccy) : '—';
    if (mrp && price && mrp > price * 1.02) {
      var pct2 = Math.round((1 - price / mrp) * 100);
      viewerPriceStrike.textContent = formatMoney(mrp, ccy);
      viewerPriceDiscount.textContent = '-' + pct2 + '%';
      viewerPriceStrikeRow.hidden = false;
    } else {
      viewerPriceStrikeRow.hidden = true;
      viewerPriceStrike.textContent = '';
      viewerPriceDiscount.textContent = '';
    }

    // Diamond-details accordion specs — every Augmont field we have.
    while (viewerSpecs.firstChild) viewerSpecs.removeChild(viewerSpecs.firstChild);
    [
      ['Type',         treatLabel],
      ['Shape',        shape],
      ['Carat',        caratStr],
      ['Colour',       color],
      ['Clarity',      clarity],
      ['Cut',          cut || '—'],
      ['Polish',       polish || '—'],
      ['Symmetry',     symmetry || '—'],
      ['Certificate',  labUpper || '—'],
      ['Stock Number', d.stockNum || '—'],
      ['Measurements', measurements || '—']
    ].forEach(function (pair) {
      var dt = document.createElement('dt'); dt.textContent = pair[0];
      var dd = document.createElement('dd'); dd.textContent = String(pair[1]);
      viewerSpecs.appendChild(dt); viewerSpecs.appendChild(dd);
    });

    // Reset accordion to default-open on every new stone open
    if (viewerAccordion) {
      viewerAccordion.setAttribute('data-open', 'true');
      if (viewerAccordionTrg) viewerAccordionTrg.setAttribute('aria-expanded', 'true');
    }

    // Wire the modal Add-to-cart to this stone's id + the right state.
    viewerAddBtn.dataset.id = String(d.id || d.stockNum || '');
    // The button needs both the dw-card__add class (so the cart-state CSS
    // — is-loading/is-added/is-in-cart/is-error/is-unavailable — applies)
    // AND the dw-viewer__add hook for layout. classList add is idempotent.
    viewerAddBtn.classList.add('dw-card__add');
    setButtonState(viewerAddBtn, diamondIdsInCart.has(viewerAddBtn.dataset.id) ? 'in-cart' : 'idle');

    // Open the modal shell
    viewerPanel.setAttribute('aria-label', caratStr + 'ct ' + shape + ' ' + treatLabel + ' detail');
    viewerPanel.hidden = false;
    document.body.style.overflow = 'hidden';

    // Pre-load the SVG silhouette so the outline tier is instant.
    viewerFallSvg.innerHTML = svgForShape(shapeRaw);

    // Start tier 1: video.
    loadViewerTier(TIER_VIDEO);

    // History push so back-button closes modal + share-link re-opens it.
    if (opts.pushHistory && d.stockNum) {
      try {
        var u = new URL(window.location.href);
        u.searchParams.set('stone', d.stockNum);
        window.history.pushState({ stone: d.stockNum }, '', u.pathname + u.search + u.hash);
        viewerState.historyPushed = true;
      } catch (e) { /* history API blocked — fail silent */ }
    }

    // Focus the visible "Back to browse" link so keyboard users land in a
    // sensible spot. The legacy X close button is hidden via CSS, so focusing
    // it would silently strand keyboard focus.
    setTimeout(function () {
      var focusTarget = viewerBackBtn || root.querySelector('#dw-viewer-close');
      if (focusTarget) focusTarget.focus();
    }, 50);
  }

  function loadViewerTier(tier) {
    if (!viewerState.diamond) return;
    clearViewerTimer();
    viewerState.tier = tier;

    // Update tier-button active state
    viewerTierBtns.forEach(function (btn) {
      var on = btn.dataset.tier === tier;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    // The 360 badge sits over the image well — visible only on the video tier.
    if (viewer360Badge) viewer360Badge.hidden = (tier !== TIER_VIDEO);

    var stockNum = viewerState.diamond.stockNum;
    if (tier === TIER_OUTLINE || !stockNum) {
      // Show SVG silhouette fallback. Stop the iframe.
      viewerFrame.setAttribute('src', 'about:blank');
      viewerFrame.style.display = 'none';
      viewerFallback.hidden = false;
      return;
    }

    // Video or image: hide SVG, show iframe, set src.
    viewerFallback.hidden = true;
    viewerFrame.style.display = '';
    var src = 'https://www.viewmydiamonds.com/?id=' +
              encodeURIComponent(stockNum) +
              '&type=' + (tier === TIER_VIDEO ? 'video' : 'image');
    var loadFired = false;
    function onload() {
      loadFired = true;
      viewerFrame.removeEventListener('load', onload);
      // load fired in time — clear timer; trust iframe content.
      clearViewerTimer();
    }
    viewerFrame.addEventListener('load', onload);
    viewerFrame.setAttribute('src', src);

    // 3.5s timer auto-promotes if iframe never fires `load`. Cross-origin
    // iframe content can't be inspected, so we can't detect "No video
    // found" — only hard-fails (timeouts, blocked frames, 404s).
    viewerState.timer = setTimeout(function () {
      viewerState.timer = null;
      viewerFrame.removeEventListener('load', onload);
      if (loadFired) return;
      if (tier === TIER_VIDEO)      loadViewerTier(TIER_IMAGE);
      else if (tier === TIER_IMAGE) loadViewerTier(TIER_OUTLINE);
    }, 3500);
  }

  function clearViewerTimer() {
    if (viewerState.timer) {
      clearTimeout(viewerState.timer);
      viewerState.timer = null;
    }
  }

  function closeViewer(opts) {
    opts = opts || { syncHistory: true };
    clearViewerTimer();
    viewerPanel.hidden = true;
    viewerFrame.setAttribute('src', 'about:blank');
    viewerFrame.style.display = '';
    viewerFallback.hidden = true;
    if (viewer360Badge) viewer360Badge.hidden = true;
    document.body.style.overflow = '';

    // Sync history: if we pushed an entry to open this modal, pop it so
    // the browser back stack stays clean. If we got here via popstate,
    // skip (the browser already moved).
    if (opts.syncHistory !== false && viewerState.historyPushed) {
      try {
        var u = new URL(window.location.href);
        u.searchParams.delete('stone');
        window.history.replaceState({}, '', u.pathname + u.search + u.hash);
      } catch (e) { /* fail silent */ }
    }
    viewerState.historyPushed = false;
    viewerState.diamond = null;
    viewerState.tier = null;
  }

  function currentStoneFromURL() {
    try {
      var p = new URLSearchParams(window.location.search);
      return p.get('stone') || null;
    } catch (e) { return null; }
  }

  // After the initial fetch resolves we may need to deep-link-open a stone.
  // Set up a one-shot watcher: once diamondsByStockNum has the requested
  // stockNum, open the modal. If the requested stone never loads (it's not
  // on page 1), fall through gracefully.
  function maybeOpenDeepLinkStone() {
    var sn = currentStoneFromURL();
    if (!sn) return;
    if (diamondsByStockNum[sn]) {
      openViewer(diamondsByStockNum[sn], { pushHistory: false });
      return;
    }
    // Stone not on page 1; widget could "Load more" until found in the
    // future. For now, the share-link is best-effort.
  }

  function renderCartTrigger() {
    cartCount.textContent = cart.count;
    cartTrigger.classList.toggle('has-items', cart.count > 0);
  }

  function renderCartPanel() {
    while (cartBody.firstChild) cartBody.removeChild(cartBody.firstChild);

    if (cart.items.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'dw-cart-empty';
      empty.innerHTML =
        '<svg class="dw-diamond-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true">' +
          '<polygon points="32,6 58,22 58,42 32,58 6,42 6,22" stroke="currentColor" stroke-width="1.5" fill="none"/>' +
        '</svg>' +
        '<p>No diamonds selected yet</p>';
      cartBody.appendChild(empty);
      cartFooter.hidden = true;
      return;
    }

    cart.items.forEach(function (item) {
      var d = item.diamond || {};
      var row = document.createElement('article');
      row.className = 'dw-cart-item';
      row.setAttribute('data-cart-item-id', item.id);

      var imgWrap = document.createElement('div');
      imgWrap.className = 'dw-cart-item__image';
      if (d.image_url) {
        var img = document.createElement('img');
        img.src = d.image_url;
        img.alt = (d.shape || 'Diamond') + ' ' + (d.carat || '') + 'ct';
        img.loading = 'lazy';
        img.addEventListener('error', function () {
          while (imgWrap.firstChild) imgWrap.removeChild(imgWrap.firstChild);
          imgWrap.appendChild(buildPlaceholder(d.shape || 'round'));
        });
        imgWrap.appendChild(img);
      } else {
        imgWrap.appendChild(buildPlaceholder(d.shape || 'round'));
      }

      var info = document.createElement('div');
      info.className = 'dw-cart-item__info';
      var title = document.createElement('p');
      title.className = 'dw-cart-item__title';
      title.textContent = (d.carat || '—') + 'ct ' + capShape(d.shape || 'Diamond') + ' ' + diamondTypeLabel(d);
      var meta = document.createElement('p');
      meta.className = 'dw-cart-item__meta';
      meta.textContent = (d.color || '—') + ' · ' + (d.clarity || '—');
      var price = document.createElement('p');
      price.className = 'dw-cart-item__price';
      price.textContent = formatMoney(d.price || 0, cart.currency);
      info.appendChild(title); info.appendChild(meta); info.appendChild(price);

      var rm = document.createElement('button');
      rm.className = 'dw-cart-item__remove';
      rm.type = 'button';
      rm.setAttribute('data-id', item.id);
      rm.setAttribute('aria-label', 'Remove from cart');
      rm.textContent = 'Remove';

      row.appendChild(imgWrap);
      row.appendChild(info);
      row.appendChild(rm);
      cartBody.appendChild(row);
    });

    cartFooter.hidden = false;
    var sub = root.querySelector('#dw-cart-subtotal');
    sub.textContent = formatMoney(cart.total, cart.currency);
  }

  function markCardsInCart() {
    var cards = grid.querySelectorAll('.dw-card__add');
    for (var i = 0; i < cards.length; i++) {
      var btn = cards[i];
      if (diamondIdsInCart.has(btn.dataset.id)) {
        setButtonState(btn, 'in-cart');
      } else if (btn.dataset.state === 'in-cart') {
        setButtonState(btn, 'idle');
      }
    }
  }

  function setButtonState(btn, kind) {
    btn.dataset.state = kind;
    btn.classList.remove('is-loading', 'is-added', 'is-error', 'is-in-cart', 'is-unavailable');
    btn.disabled = false;
    btn.dataset.busy = '0';
    // The "added" / "in-cart" states pair an inline check SVG with a label.
    // innerHTML is safe — CHECK_SVG is a developer-controlled constant; the
    // label is hard-coded (no user input flowing into the markup). Other
    // states stay on textContent for clarity + assurance.
    switch (kind) {
      case 'loading':
        btn.classList.add('is-loading'); btn.disabled = true; btn.dataset.busy = '1';
        btn.textContent = 'Adding…';
        break;
      case 'added':
        btn.classList.add('is-added');
        btn.innerHTML = CHECK_SVG + '<span class="dw-btn__label">Added</span>';
        break;
      case 'in-cart':
        btn.classList.add('is-in-cart');
        btn.innerHTML = CHECK_SVG + '<span class="dw-btn__label">In cart</span>';
        break;
      case 'error':
        btn.classList.add('is-error');
        btn.textContent = 'Try again';
        break;
      case 'unavailable':
        btn.classList.add('is-unavailable'); btn.disabled = true;
        btn.textContent = 'Cart not available';
        break;
      default:
        btn.textContent = 'Add to cart';
    }
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────

  function formatMoney(amount, currency) {
    var n = Number(amount) || 0;
    var ccy = (currency || 'USD').toUpperCase();
    try {
      // Append currency code after the symbolised amount ("$43.43 USD") to
      // match Nivoda's convention. Native Intl.NumberFormat with
      // currencyDisplay 'code' would render "USD 43.43" instead, so we
      // build the symbol form and append the code.
      var formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: ccy,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(n);
      return formatted + ' ' + ccy;
    } catch (e) {
      return ccy + ' ' + n.toFixed(2);
    }
  }

  function clamp(n, lo, hi) {
    if (isNaN(n)) return lo;
    return Math.max(lo, Math.min(hi, n));
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function escapeAttr(s) { return escapeHTML(s); }

})();
