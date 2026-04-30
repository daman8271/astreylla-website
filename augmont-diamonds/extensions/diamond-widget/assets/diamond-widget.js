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

  // ─── STATE ────────────────────────────────────────────────────────────────
  var state = { shape: '', minCarat: '', maxCarat: '', color: '', clarity: '', page: 1 };
  var cart  = { items: [], count: 0, total: 0, currency: 'USD' };
  var diamondIdsInCart = new Set();

  // ─── DOM ──────────────────────────────────────────────────────────────────
  root.innerHTML =
    '<h2 class="dw-heading">Browse Our Diamond Collection</h2>' +
    (showFilters ? buildFiltersHTML() : '') +
    '<div class="dw-grid" id="dw-grid"></div>' +
    buildCartTriggerHTML() +
    buildCartPanelHTML() +
    buildCheckoutOverlayHTML();

  var grid           = root.querySelector('#dw-grid');
  var cartTrigger    = root.querySelector('#dw-cart-trigger');
  var cartCount      = root.querySelector('#dw-cart-count');
  var cartPanel      = root.querySelector('#dw-cart-panel');
  var cartBody       = root.querySelector('#dw-cart-body');
  var cartFooter     = root.querySelector('#dw-cart-footer');
  var cartBackdrop   = root.querySelector('#dw-cart-backdrop');
  var checkoutPanel  = root.querySelector('#dw-checkout');

  if (showFilters) attachFilterListeners();
  attachCartListeners();
  fetchDiamonds();
  fetchCart();

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

  function buildCartTriggerHTML() {
    return (
      '<button class="dw-cart-trigger" id="dw-cart-trigger" type="button" aria-label="View cart">' +
        '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">' +
          '<path d="M3 5h2l2.4 12.5a1.5 1.5 0 0 0 1.5 1.2h9.7a1.5 1.5 0 0 0 1.5-1.2L21.5 8H6"/>' +
          '<circle cx="9.5" cy="21" r="1.3"/><circle cx="17" cy="21" r="1.3"/>' +
        '</svg>' +
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
          '<button class="dw-cart-panel__checkout" id="dw-cart-checkout" type="button">Checkout</button>' +
        '</footer>' +
      '</aside>'
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
            '<button class="dw-overlay__submit" type="submit">Place Order</button>' +
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

  function attachCartListeners() {
    cartTrigger.addEventListener('click', openCartPanel);
    root.querySelector('#dw-cart-close').addEventListener('click', closeCartPanel);
    cartBackdrop.addEventListener('click', closeCartPanel);

    root.querySelector('#dw-cart-checkout').addEventListener('click', openCheckout);
    root.querySelector('#dw-checkout-close').addEventListener('click', closeCheckout);
    root.querySelector('#dw-checkout-backdrop').addEventListener('click', closeCheckout);
    root.querySelector('#dw-checkout-form').addEventListener('submit', handleCheckoutSubmit);

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (!checkoutPanel.hidden) closeCheckout();
      else if (cartPanel.classList.contains('is-open')) closeCartPanel();
    });

    // Card add buttons (delegated)
    root.addEventListener('click', function (e) {
      var btn = e.target.closest('.dw-card__add');
      if (btn) handleAddClick(btn);
    });

    // Cart remove buttons (delegated)
    cartBody.addEventListener('click', function (e) {
      var btn = e.target.closest('.dw-cart-item__remove');
      if (btn) handleRemoveClick(btn.dataset.id);
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

  // ─── CART API CALLS ───────────────────────────────────────────────────────

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
      // already in cart — open panel as a cue
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
        if (!res.ok) return res.json().catch(function(){return{};}).then(function (b) { throw { kind: 'fail', body: b }; });
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
      .catch(function () {
        if (row) row.classList.remove('is-removing');
      });
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
        if (!res.ok) return res.json().catch(function(){return{};}).then(function (b) { throw { kind: 'fail', body: b }; });
        return res.json();
      })
      .then(function (data) {
        form.hidden = true;
        var thanks = root.querySelector('#dw-checkout-thanks');
        var inv = root.querySelector('#dw-checkout-invoice');
        if (inv) inv.textContent = data.invoiceNumber || data.orderId || '—';
        thanks.hidden = false;
        // Cart is now empty server-side. Refresh local state.
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

  // ─── PANEL OPEN/CLOSE ─────────────────────────────────────────────────────

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
      ? '1 diamond · ' + cart.currency + ' ' + cart.total.toFixed(2)
      : cart.items.length + ' diamonds · ' + cart.currency + ' ' + cart.total.toFixed(2);
    root.querySelector('#dw-checkout-summary').textContent = summary;
    root.querySelector('#dw-checkout-form').hidden = false;
    root.querySelector('#dw-checkout-form').reset();
    root.querySelector('#dw-checkout-thanks').hidden = true;
    var sub = root.querySelector('.dw-overlay__submit');
    sub.disabled = false; sub.textContent = 'Place Order';
    checkoutPanel.hidden = false;
    setTimeout(function () { root.querySelector('#dw-co-name').focus(); }, 50);
  }

  function closeCheckout() {
    checkoutPanel.hidden = true;
  }

  // ─── RENDER: CART TRIGGER + PANEL ─────────────────────────────────────────

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
        img.src = d.image_url; img.alt = (d.shape || 'Diamond') + ' ' + (d.carat || '') + 'ct';
        img.loading = 'lazy';
        imgWrap.appendChild(img);
      }

      var info = document.createElement('div');
      info.className = 'dw-cart-item__info';
      var title = document.createElement('p');
      title.className = 'dw-cart-item__title';
      title.textContent = (d.shape || 'Diamond') + ' · ' + (d.carat || '—') + 'ct';
      var meta = document.createElement('p');
      meta.className = 'dw-cart-item__meta';
      meta.textContent = (d.color || '—') + ' · ' + (d.clarity || '—');
      var price = document.createElement('p');
      price.className = 'dw-cart-item__price';
      price.textContent = cart.currency + ' ' + Number(d.price || 0).toFixed(2);
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
    sub.textContent = cart.currency + ' ' + Number(cart.total).toFixed(2);
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
      case 'in-cart':     btn.classList.add('is-in-cart');                            btn.textContent = 'In Cart'; break;
      case 'error':       btn.classList.add('is-error');                              btn.textContent = 'Try Again'; break;
      case 'unavailable': btn.classList.add('is-unavailable'); btn.disabled = true;   btn.textContent = 'Cart not available'; break;
      default:            btn.textContent = 'Add to Cart';
    }
  }

  // ─── DIAMOND FETCH + CARDS ────────────────────────────────────────────────

  function fetchDiamonds() {
    renderSpinner();
    var params = new URLSearchParams({ shop: shop, per_page: perPage, page: state.page });
    if (state.shape)    params.set('shape',     state.shape);
    if (state.color)    params.set('color',     state.color);
    if (state.clarity)  params.set('clarity',   state.clarity);
    if (state.minCarat) params.set('min_carat', state.minCarat);
    if (state.maxCarat) params.set('max_carat', state.maxCarat);

    fetch(apiUrl + '/api/public/diamonds?' + params.toString())
      .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
      .then(function (data) {
        var diamonds = Array.isArray(data) ? data : (data.diamonds || data.data || []);
        if (diamonds.length === 0) renderEmpty();
        else { renderCards(diamonds); markCardsInCart(); }
      })
      .catch(function (err) { console.error('[diamond-widget]', err); renderError(); });
  }

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
      var shape   = String(d.shape   || 'Diamond');
      var carat   = String(d.carat   || '—');
      var color   = String(d.color   || '—');
      var clarity = String(d.clarity || '—');
      var price   = d.price || null;
      var image   = String(d.image_url || d.image || '');
      var id      = String(d.id || '');

      var article = document.createElement('article');
      article.className = 'dw-card';

      var imgWrap = document.createElement('div');
      imgWrap.className = 'dw-card__image';
      if (image) {
        var img = document.createElement('img');
        img.setAttribute('src', image);
        img.setAttribute('alt', shape + ' diamond ' + carat + 'ct ' + color + ' ' + clarity);
        img.setAttribute('loading', 'lazy');
        img.setAttribute('width', '300'); img.setAttribute('height', '300');
        imgWrap.appendChild(img);
      } else {
        var placeholder = document.createElement('div');
        placeholder.className = 'dw-card__img-placeholder';
        placeholder.setAttribute('aria-hidden', 'true');
        var phText = document.createElement('span');
        phText.className = 'dw-card__img-placeholder-text';
        phText.textContent = shape;
        placeholder.appendChild(phText);
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
        var dt = document.createElement('dt'); dt.textContent = pair[0];
        var dd = document.createElement('dd'); dd.textContent = pair[1];
        row.appendChild(dt); row.appendChild(dd); dl.appendChild(row);
      });
      body.appendChild(dl);

      if (price) {
        var pricePara = document.createElement('p');
        pricePara.className = 'dw-card__price';
        pricePara.textContent = (cart.currency || 'USD') + ' ' + formatPrice(price);
        body.appendChild(pricePara);
      }

      var btn = document.createElement('button');
      btn.className = 'dw-card__add';
      btn.type = 'button';
      btn.setAttribute('data-id', id);
      setButtonState(btn, diamondIdsInCart.has(id) ? 'in-cart' : 'idle');
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

  function formatPrice(n) { return Number(n).toLocaleString('en-IN'); }

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
