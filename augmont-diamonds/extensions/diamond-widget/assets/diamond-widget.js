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
  var viewerPanel   = root.querySelector('#dw-viewer');
  var viewerFrame   = root.querySelector('#dw-viewer-frame');
  var viewerCaption = root.querySelector('#dw-viewer-caption');

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
    var unitLeft = unit === '$';
    var fmt = function (v) { return unitLeft ? unit + Math.round(v) : v + ' ' + unit; };
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
          '<span class="dw-slider__val dw-slider__val--min">' + fmt(min) + '</span>' +
          '<span class="dw-slider__val-sep">–</span>' +
          '<span class="dw-slider__val dw-slider__val--max">' + fmt(max) + '</span>' +
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

  function buildViewerOverlayHTML() {
    return (
      '<div class="dw-viewer" id="dw-viewer" role="dialog" aria-modal="true" aria-label="Diamond 360° viewer" hidden>' +
        '<div class="dw-viewer__backdrop" id="dw-viewer-backdrop"></div>' +
        '<div class="dw-viewer__panel">' +
          '<button class="dw-viewer__close" id="dw-viewer-close" type="button" aria-label="Close viewer">&#x2715;</button>' +
          '<div class="dw-viewer__frame-wrap">' +
            '<iframe id="dw-viewer-frame" title="Diamond 360° viewer" allow="autoplay; fullscreen" loading="lazy"></iframe>' +
          '</div>' +
          '<p class="dw-viewer__caption" id="dw-viewer-caption">Live 360° viewer from Augmont. Stones without uploaded media will display “No video found”.</p>' +
        '</div>' +
      '</div>'
    );
  }

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

    // 360° viewer modal close paths
    root.querySelector('#dw-viewer-close').addEventListener('click', closeViewer);
    root.querySelector('#dw-viewer-backdrop').addEventListener('click', closeViewer);

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (!viewerPanel.hidden) closeViewer();
      else if (!checkoutPanel.hidden) closeCheckout();
      else if (cartPanel.classList.contains('is-open')) closeCartPanel();
    });

    // Click delegation: Add-to-cart button takes priority. Anywhere else on
    // a card opens the 360° viewer modal (CLAUDE.md lesson #3 — Augmont
    // image_url is an HTML viewer page, so we open it in a real iframe).
    root.addEventListener('click', function (e) {
      var addBtn = e.target.closest('.dw-card__add');
      if (addBtn) { handleAddClick(addBtn); return; }
      var card = e.target.closest('.dw-card');
      if (card && card.dataset.stockNum) openViewer(card.dataset.stockNum, card.dataset.shape, card.dataset.carat);
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
    var minLabel = slider.parentElement.querySelector('.dw-slider__val--min');
    var maxLabel = slider.parentElement.querySelector('.dw-slider__val--max');
    var key      = slider.dataset.key;

    function fmt(v) {
      if (key === 'price') return '$' + Math.round(v).toLocaleString();
      return Number(v).toFixed(2) + ' ct';
    }

    function paint() {
      var lo = Number(minInput.value);
      var hi = Number(maxInput.value);
      if (lo > hi - step) lo = hi - step;
      if (hi < lo + step) hi = lo + step;
      var pctLo = ((lo - min) / (max - min)) * 100;
      var pctHi = ((hi - min) / (max - min)) * 100;
      range.style.left  = pctLo + '%';
      range.style.right = (100 - pctHi) + '%';
      minLabel.textContent = fmt(lo);
      maxLabel.textContent = fmt(hi);
      // Expose computed values for state sync
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
    diamonds.forEach(function (d) { frag.appendChild(buildCard(d)); });
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
    article.setAttribute('aria-label', 'View ' + caratStr + 'ct ' + shape + ' Diamond in 360°');

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

    article.appendChild(imgWrap);

    var body = document.createElement('div');
    body.className = 'dw-card__body';

    // Title: "0.50ct Cushion Diamond" — "Natural" dropped in C-iter2;
    // Augmont catalog is overwhelmingly LGD and the Treatment tab control
    // disambiguates whichever label the merchant cares about.
    var title = document.createElement('p');
    title.className = 'dw-card__title';
    title.textContent = caratStr + 'ct ' + shape + ' Diamond';
    body.appendChild(title);

    // Specs line
    var specs = document.createElement('p');
    specs.className = 'dw-card__specs';
    var pieces = [];
    pieces.push(specPair('Colour', color));
    pieces.push(specPair('Clarity', clarity));
    if (cut) pieces.push(specPair('Cut', cut));
    pieces.forEach(function (frag, i) {
      if (i > 0) specs.appendChild(document.createTextNode(', '));
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
    ships.textContent = 'Ships in 7-10 business days';
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
    var f = document.createDocumentFragment();
    var l = document.createElement('span');
    l.className = 'dw-card__spec-label';
    l.textContent = label + ': ';
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
      .then(function () {
        setButtonState(btn, 'added');
        diamondIdsInCart.add(diamondId);
        return fetchCart();
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

  // ─── 360° VIEWER MODAL ────────────────────────────────────────────────────
  // Loads viewmydiamonds.com (the source of d.image_url) inside an iframe so
  // buyers can spin/zoom the stone. Iframe src is set ON OPEN and removed ON
  // CLOSE so we don't leave 24+ background connections hanging.

  function openViewer(stockNum, shapeLabel, caratStr) {
    if (!stockNum) return;
    var src = 'https://www.viewmydiamonds.com/?id=' + encodeURIComponent(stockNum) + '&type=image';
    viewerFrame.setAttribute('src', src);
    viewerPanel.setAttribute('aria-label', (caratStr ? caratStr + 'ct ' : '') + (shapeLabel || 'Diamond') + ' 360° viewer');
    viewerPanel.hidden = false;
    document.body.style.overflow = 'hidden';
    // Move focus to the close button so keyboard users can dismiss easily.
    setTimeout(function () { root.querySelector('#dw-viewer-close').focus(); }, 50);
  }

  function closeViewer() {
    viewerPanel.hidden = true;
    // Removing src on close stops any live iframe playback and frees the
    // connection — important since the viewer page does not auto-pause.
    viewerFrame.setAttribute('src', 'about:blank');
    document.body.style.overflow = '';
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
      title.textContent = (d.carat || '—') + 'ct ' + capShape(d.shape || 'Diamond');
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
    switch (kind) {
      case 'loading':     btn.classList.add('is-loading');     btn.disabled = true;  btn.dataset.busy = '1'; btn.textContent = 'Adding…'; break;
      case 'added':       btn.classList.add('is-added');                              btn.textContent = 'Added ✓'; break;
      case 'in-cart':     btn.classList.add('is-in-cart');                            btn.textContent = 'In cart'; break;
      case 'error':       btn.classList.add('is-error');                              btn.textContent = 'Try again'; break;
      case 'unavailable': btn.classList.add('is-unavailable'); btn.disabled = true;   btn.textContent = 'Cart not available'; break;
      default:            btn.textContent = 'Add to cart';
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
