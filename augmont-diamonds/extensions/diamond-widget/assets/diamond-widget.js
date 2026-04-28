(function () {
  'use strict';

  var root = document.getElementById('diamond-widget-root');
  if (!root) return;

  var shop      = root.dataset.shop    || '';
  var apiUrl    = (root.dataset.apiUrl || '').replace(/\/$/, '');
  var perPage   = parseInt(root.dataset.perPage, 10) || 12;
  var showFilters = root.dataset.showFilters === 'true';
  var primaryColor = root.dataset.primaryColor || '';

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

  var state = { shape: '', minCarat: '', maxCarat: '', color: '', clarity: '', page: 1 };
  var currentDiamond = null;

  root.innerHTML =
    (showFilters ? buildFiltersHTML() : '') +
    '<div class="dw-grid" id="dw-grid"></div>' +
    buildOverlayHTML();

  var grid    = root.querySelector('#dw-grid');
  var overlay = root.querySelector('#dw-overlay');

  if (showFilters) attachFilterListeners();
  attachOverlayListeners();
  fetchDiamonds();

  // ─── HTML BUILDERS ────────────────────────────────────────────────────────

  function buildFiltersHTML() {
    return (
      '<div class="dw-filters" role="search" aria-label="Filter diamonds">' +
        '<div class="dw-filters__group">' +
          '<label class="dw-filters__label" for="dw-shape">Shape</label>' +
          '<select class="dw-filters__select" id="dw-shape">' +
            '<option value="">All Shapes</option>' +
            '<option value="round">Round</option>' +
            '<option value="princess">Princess</option>' +
            '<option value="oval">Oval</option>' +
            '<option value="cushion">Cushion</option>' +
            '<option value="emerald">Emerald</option>' +
            '<option value="pear">Pear</option>' +
            '<option value="marquise">Marquise</option>' +
            '<option value="radiant">Radiant</option>' +
          '</select>' +
        '</div>' +
        '<div class="dw-filters__group dw-filters__group--carat">' +
          '<label class="dw-filters__label">Carat</label>' +
          '<div class="dw-filters__carat-range">' +
            '<input class="dw-filters__input" id="dw-min-carat" type="number" placeholder="Min" min="0.01" step="0.01" aria-label="Minimum carat">' +
            '<span class="dw-filters__carat-sep" aria-hidden="true">–</span>' +
            '<input class="dw-filters__input" id="dw-max-carat" type="number" placeholder="Max" min="0.01" step="0.01" aria-label="Maximum carat">' +
          '</div>' +
        '</div>' +
        '<div class="dw-filters__group">' +
          '<label class="dw-filters__label" for="dw-color">Colour</label>' +
          '<select class="dw-filters__select" id="dw-color">' +
            '<option value="">All Colours</option>' +
            '<option value="D">D</option><option value="E">E</option>' +
            '<option value="F">F</option><option value="G">G</option>' +
            '<option value="H">H</option><option value="I">I</option>' +
            '<option value="J">J</option>' +
          '</select>' +
        '</div>' +
        '<div class="dw-filters__group">' +
          '<label class="dw-filters__label" for="dw-clarity">Clarity</label>' +
          '<select class="dw-filters__select" id="dw-clarity">' +
            '<option value="">All Clarities</option>' +
            '<option value="FL">FL</option><option value="IF">IF</option>' +
            '<option value="VVS1">VVS1</option><option value="VVS2">VVS2</option>' +
            '<option value="VS1">VS1</option><option value="VS2">VS2</option>' +
            '<option value="SI1">SI1</option><option value="SI2">SI2</option>' +
          '</select>' +
        '</div>' +
        '<button class="dw-filters__clear" id="dw-clear" type="button">Clear filters</button>' +
      '</div>'
    );
  }

  function buildOverlayHTML() {
    return (
      '<div class="dw-overlay" id="dw-overlay" role="dialog" aria-modal="true" aria-labelledby="dw-overlay-title" hidden>' +
        '<div class="dw-overlay__backdrop" id="dw-overlay-backdrop"></div>' +
        '<div class="dw-overlay__panel">' +
          '<button class="dw-overlay__close" id="dw-overlay-close" type="button" aria-label="Close">&#x2715;</button>' +
          '<h2 class="dw-overlay__title" id="dw-overlay-title">Enquire About This Diamond</h2>' +
          '<p class="dw-overlay__spec" id="dw-overlay-spec"></p>' +
          '<form class="dw-overlay__form" id="dw-enquiry-form" novalidate>' +
            '<div class="dw-overlay__field">' +
              '<label for="dw-enq-name">Your Name</label>' +
              '<input type="text" id="dw-enq-name" name="name" required autocomplete="name" placeholder="Full name">' +
            '</div>' +
            '<div class="dw-overlay__field">' +
              '<label for="dw-enq-email">Email Address</label>' +
              '<input type="email" id="dw-enq-email" name="email" required autocomplete="email" placeholder="you@example.com">' +
            '</div>' +
            '<div class="dw-overlay__field">' +
              '<label for="dw-enq-message">Message <span class="dw-overlay__optional">(optional)</span></label>' +
              '<textarea id="dw-enq-message" name="message" rows="3" placeholder="I am interested in this diamond&#8230;"></textarea>' +
            '</div>' +
            '<button class="dw-overlay__submit" type="submit">Send Enquiry</button>' +
          '</form>' +
          '<div class="dw-overlay__thanks" id="dw-overlay-thanks" hidden>' +
            '<svg class="dw-overlay__thanks-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/><path d="M7.5 12l3 3 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            '<p>Thank you — we&rsquo;ll be in touch shortly.</p>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  // ─── LISTENERS ────────────────────────────────────────────────────────────

  function attachFilterListeners() {
    root.querySelector('#dw-shape').addEventListener('change', function () {
      state.shape = this.value; state.page = 1; fetchDiamonds();
    });
    root.querySelector('#dw-color').addEventListener('change', function () {
      state.color = this.value; state.page = 1; fetchDiamonds();
    });
    root.querySelector('#dw-clarity').addEventListener('change', function () {
      state.clarity = this.value; state.page = 1; fetchDiamonds();
    });
    root.querySelector('#dw-min-carat').addEventListener('change', function () {
      state.minCarat = this.value; state.page = 1; fetchDiamonds();
    });
    root.querySelector('#dw-max-carat').addEventListener('change', function () {
      state.maxCarat = this.value; state.page = 1; fetchDiamonds();
    });
    root.querySelector('#dw-clear').addEventListener('click', clearFilters);
  }

  function attachOverlayListeners() {
    overlay.querySelector('#dw-overlay-backdrop').addEventListener('click', closeOverlay);
    overlay.querySelector('#dw-overlay-close').addEventListener('click', closeOverlay);
    overlay.querySelector('#dw-enquiry-form').addEventListener('submit', handleEnquirySubmit);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !overlay.hidden) closeOverlay();
    });

    root.addEventListener('click', function (e) {
      var btn = e.target.closest('.dw-card__enquire');
      if (btn) openOverlay(btn.dataset.id, btn.dataset.spec);
    });
  }

  function clearFilters() {
    state.shape = ''; state.color = ''; state.clarity = '';
    state.minCarat = ''; state.maxCarat = ''; state.page = 1;
    if (showFilters) {
      root.querySelector('#dw-shape').value    = '';
      root.querySelector('#dw-color').value    = '';
      root.querySelector('#dw-clarity').value  = '';
      root.querySelector('#dw-min-carat').value = '';
      root.querySelector('#dw-max-carat').value = '';
    }
    fetchDiamonds();
  }

  // ─── OVERLAY ──────────────────────────────────────────────────────────────

  function openOverlay(id, spec) {
    currentDiamond = id;
    overlay.querySelector('#dw-overlay-spec').textContent = spec || '';
    overlay.querySelector('#dw-overlay-thanks').hidden = true;
    overlay.querySelector('#dw-enquiry-form').hidden   = false;
    overlay.querySelector('#dw-enquiry-form').reset();
    overlay.hidden = false;
    overlay.querySelector('#dw-enq-name').focus();
    document.body.style.overflow = 'hidden';
  }

  function closeOverlay() {
    overlay.hidden = true;
    document.body.style.overflow = '';
    currentDiamond = null;
  }

  function handleEnquirySubmit(e) {
    e.preventDefault();
    var form  = e.target;
    var name  = form.querySelector('#dw-enq-name').value.trim();
    var email = form.querySelector('#dw-enq-email').value.trim();
    if (!name || !email) return;

    // POST endpoint wired in Phase 5 — for now log and show confirmation
    console.log('[diamond-widget] enquiry', {
      diamondId: currentDiamond,
      name: name,
      email: email,
      message: form.querySelector('#dw-enq-message').value.trim()
    });

    form.hidden = true;
    overlay.querySelector('#dw-overlay-thanks').hidden = false;
  }

  // ─── FETCH ────────────────────────────────────────────────────────────────

  function fetchDiamonds() {
    renderSkeleton();

    var params = new URLSearchParams({ shop: shop, per_page: perPage, page: state.page });
    if (state.shape)    params.set('shape',     state.shape);
    if (state.color)    params.set('color',     state.color);
    if (state.clarity)  params.set('clarity',   state.clarity);
    if (state.minCarat) params.set('min_carat', state.minCarat);
    if (state.maxCarat) params.set('max_carat', state.maxCarat);

    fetch(apiUrl + '/api/public/diamonds?' + params.toString())
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        var diamonds = Array.isArray(data) ? data : (data.diamonds || data.data || []);
        diamonds.length === 0 ? renderEmpty() : renderCards(diamonds);
      })
      .catch(function (err) {
        console.error('[diamond-widget]', err);
        renderError();
      });
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────

  function renderSkeleton() {
    grid.innerHTML = Array(6).fill(0).map(function () {
      return (
        '<article class="dw-card dw-card--skeleton" aria-hidden="true">' +
          '<div class="dw-card__image dw-card__image--skel"></div>' +
          '<div class="dw-card__body">' +
            '<div class="dw-skel-line dw-skel-line--sm"></div>' +
            '<div class="dw-skel-line"></div>' +
            '<div class="dw-skel-line dw-skel-line--sm"></div>' +
            '<div class="dw-skel-line dw-skel-line--price"></div>' +
            '<div class="dw-skel-line dw-skel-line--btn"></div>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  function renderCards(diamonds) {
    grid.innerHTML = diamonds.map(function (d) {
      var shape   = d.shape   || d.Shape   || 'Diamond';
      var carat   = d.carat   || d.Carat   || '—';
      var color   = d.color   || d.Color   || '—';
      var clarity = d.clarity || d.Clarity || '—';
      var price   = d.price   || d.Price   || d.rate  || null;
      var image   = d.image   || d.image_url || d.img  || '';
      var id      = d.id      || d.diamond_id || d.stock_no || '';
      var spec    = shape + ' · ' + carat + 'ct · ' + color + ' · ' + clarity;

      return (
        '<article class="dw-card">' +
          '<div class="dw-card__image">' +
            (image
              ? '<img src="' + image + '" alt="' + shape + ' diamond ' + carat + 'ct ' + color + ' ' + clarity + '" loading="lazy" width="300" height="300">'
              : '<div class="dw-card__img-placeholder" aria-hidden="true">' + diamondSVG() + '</div>'
            ) +
          '</div>' +
          '<div class="dw-card__body">' +
            '<p class="dw-card__shape">' + shape + '</p>' +
            '<dl class="dw-card__specs">' +
              '<div class="dw-card__spec-row"><dt>Carat</dt><dd>' + carat + '</dd></div>' +
              '<div class="dw-card__spec-row"><dt>Colour</dt><dd>' + color + '</dd></div>' +
              '<div class="dw-card__spec-row"><dt>Clarity</dt><dd>' + clarity + '</dd></div>' +
            '</dl>' +
            (price ? '<p class="dw-card__price">₹ ' + formatPrice(price) + '</p>' : '') +
            '<button class="dw-card__enquire" type="button" data-id="' + id + '" data-spec="' + spec + '">Enquire</button>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  function renderEmpty() {
    grid.innerHTML =
      '<div class="dw-empty">' +
        diamondSVG() +
        '<p class="dw-empty__msg">No diamonds match your filters.</p>' +
        '<button class="dw-empty__reset" type="button">Clear filters</button>' +
      '</div>';
    var btn = grid.querySelector('.dw-empty__reset');
    if (btn) btn.addEventListener('click', clearFilters);
  }

  function renderError() {
    grid.innerHTML =
      '<div class="dw-error">' +
        '<p class="dw-error__msg">Unable to load diamonds. Please try again.</p>' +
        '<button class="dw-error__retry" type="button">Retry</button>' +
      '</div>';
    grid.querySelector('.dw-error__retry').addEventListener('click', fetchDiamonds);
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────

  function formatPrice(n) {
    return Number(n).toLocaleString('en-IN');
  }

  function diamondSVG() {
    return (
      '<svg class="dw-diamond-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<polygon points="32,6 58,22 58,42 32,58 6,42 6,22" stroke="currentColor" stroke-width="1.5" fill="none"/>' +
        '<line x1="6"  y1="22" x2="32" y2="34" stroke="currentColor" stroke-width="1"/>' +
        '<line x1="58" y1="22" x2="32" y2="34" stroke="currentColor" stroke-width="1"/>' +
        '<line x1="32" y1="6"  x2="32" y2="34" stroke="currentColor" stroke-width="1"/>' +
        '<line x1="6"  y1="42" x2="32" y2="34" stroke="currentColor" stroke-width="1"/>' +
        '<line x1="58" y1="42" x2="32" y2="34" stroke="currentColor" stroke-width="1"/>' +
      '</svg>'
    );
  }

})();
