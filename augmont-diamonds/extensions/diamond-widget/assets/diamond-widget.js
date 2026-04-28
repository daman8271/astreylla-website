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
  var currentDiamondDetails = null;

  root.innerHTML =
    '<h2 class="dw-heading">Browse Our Diamond Collection</h2>' +
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
        '<span class="dw-filters__heading">Filter By:</span>' +
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
      if (btn) openOverlay(btn.dataset.id, btn.dataset.spec, btn.dataset);
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

  function openOverlay(id, spec, details) {
    currentDiamond = id;
    currentDiamondDetails = {
      shape:   (details && details.shape)   || '',
      carat:   (details && details.carat)   || '',
      color:   (details && details.color)   || '',
      clarity: (details && details.clarity) || '',
      price:   (details && details.price)   || ''
    };
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
    currentDiamondDetails = null;
  }

  function handleEnquirySubmit(e) {
    e.preventDefault();
    var form    = e.target;
    var name    = form.querySelector('#dw-enq-name').value.trim();
    var email   = form.querySelector('#dw-enq-email').value.trim();
    var message = form.querySelector('#dw-enq-message').value.trim();
    if (!name || !email) return;

    var submitBtn = form.querySelector('.dw-overlay__submit');
    submitBtn.disabled    = true;
    submitBtn.textContent = 'Sending…';

    var prevErr = form.querySelector('.dw-overlay__error');
    if (prevErr) prevErr.parentNode.removeChild(prevErr);

    fetch(apiUrl + '/api/public/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shop:           shop,
        diamondId:      currentDiamond,
        name:           name,
        email:          email,
        message:        message,
        diamondDetails: currentDiamondDetails
      })
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.hidden = true;
        overlay.querySelector('#dw-overlay-thanks').hidden = false;
      })
      .catch(function () {
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Send Enquiry';
        var errEl = document.createElement('p');
        errEl.className   = 'dw-overlay__error';
        errEl.textContent = 'Something went wrong, please try again.';
        form.insertBefore(errEl, submitBtn);
      });
  }

  // ─── FETCH ────────────────────────────────────────────────────────────────

  function fetchDiamonds() {
    renderSpinner();

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

  function renderSpinner() {
    grid.innerHTML =
      '<div class="dw-loading" role="status" aria-live="polite" aria-busy="true">' +
        '<div class="dw-spinner" aria-hidden="true"></div>' +
        '<p class="dw-loading__msg">Loading diamonds…</p>' +
      '</div>';
  }

  function renderCards(diamonds) {
    while (grid.firstChild) grid.removeChild(grid.firstChild);

    diamonds.forEach(function (d) {
      var shape   = String(d.shape   || d.Shape   || 'Diamond');
      var carat   = String(d.carat   || d.Carat   || '—');
      var color   = String(d.color   || d.Color   || '—');
      var clarity = String(d.clarity || d.Clarity || '—');
      var price   = d.price   || d.Price   || d.rate  || null;
      var image   = String(d.image   || d.image_url || d.img  || '');
      var id      = String(d.id      || d.diamond_id || d.stock_no || '');
      var spec    = shape + ' · ' + carat + 'ct · ' + color + ' · ' + clarity;

      var article = document.createElement('article');
      article.className = 'dw-card';

      var imgWrap = document.createElement('div');
      imgWrap.className = 'dw-card__image';
      if (image) {
        var img = document.createElement('img');
        img.setAttribute('src', image);
        img.setAttribute('alt', shape + ' diamond ' + carat + 'ct ' + color + ' ' + clarity);
        img.setAttribute('loading', 'lazy');
        img.setAttribute('width', '300');
        img.setAttribute('height', '300');
        imgWrap.appendChild(img);
      } else {
        var placeholder = document.createElement('div');
        placeholder.className = 'dw-card__img-placeholder';
        placeholder.setAttribute('aria-hidden', 'true');
        var placeholderText = document.createElement('span');
        placeholderText.className = 'dw-card__img-placeholder-text';
        placeholderText.textContent = shape;
        placeholder.appendChild(placeholderText);
        imgWrap.appendChild(placeholder);
      }
      article.appendChild(imgWrap);

      var body = document.createElement('div');
      body.className = 'dw-card__body';

      var shapePara = document.createElement('p');
      shapePara.className = 'dw-card__shape';
      shapePara.textContent = shape;
      body.appendChild(shapePara);

      var dl = document.createElement('dl');
      dl.className = 'dw-card__specs';
      [['Carat', carat], ['Colour', color], ['Clarity', clarity]].forEach(function (pair) {
        var row = document.createElement('div');
        row.className = 'dw-card__spec-row';
        var dt = document.createElement('dt');
        dt.textContent = pair[0];
        var dd = document.createElement('dd');
        dd.textContent = pair[1];
        row.appendChild(dt);
        row.appendChild(dd);
        dl.appendChild(row);
      });
      body.appendChild(dl);

      if (price) {
        var pricePara = document.createElement('p');
        pricePara.className = 'dw-card__price';
        pricePara.textContent = '₹ ' + formatPrice(price);
        body.appendChild(pricePara);
      }

      var btn = document.createElement('button');
      btn.className = 'dw-card__enquire';
      btn.type = 'button';
      btn.setAttribute('data-id', id);
      btn.setAttribute('data-spec', spec);
      btn.setAttribute('data-shape', shape);
      btn.setAttribute('data-carat', carat);
      btn.setAttribute('data-color', color);
      btn.setAttribute('data-clarity', clarity);
      btn.setAttribute('data-price', price || '');
      btn.textContent = 'Enquire';
      body.appendChild(btn);

      article.appendChild(body);
      grid.appendChild(article);
    });
  }

  function renderEmpty() {
    grid.innerHTML =
      '<div class="dw-empty">' +
        diamondSVG() +
        '<p class="dw-empty__msg">No diamonds match your filters. Try adjusting your search.</p>' +
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
