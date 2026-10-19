/* Popups die altijd leesbaar zijn.
   - Smal scherm (< 700 px): de info van een punt verschijnt in een paneel onderaan (max. 60% van het scherm, scrolt),
     met een grote ✕. Sluiten: ✕, tik op de kaart, veeg omlaag of Esc. Het gekozen punt licht op en de kaart schuift
     zodat het niet achter het paneel verdwijnt (ook als de kaart gedraaid is).
   - Breed scherm: gewone Leaflet-popups, maar met autoPan rekening houdend met de bovenbalk, max. breedte min(360 px, 90vw),
     max. hoogte met scrollbalk en een grotere sluitknop.
   Laad direct na leaflet.js (en na gmroute.js), vóór de kaartcode. De route-knoppen van gmroute.js zitten gewoon in de inhoud. */
(function () {
  var L = window.L; if (!L || !L.Layer || L.Layer.prototype._psPatched) return;
  var MQ = 700, small = function () { return window.innerWidth < MQ; };
  var css = '#psheet{position:fixed;left:0;right:0;bottom:0;z-index:3000;background:#fff;color:#2b2b2b;border-radius:16px 16px 0 0;' +
    'box-shadow:0 -4px 18px rgba(0,0,0,.28);max-height:60vh;display:flex;flex-direction:column;transform:translateY(105%);transition:transform .22s ease;' +
    'font:14px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;padding-bottom:env(safe-area-inset-bottom)}' +
    '#psheet.on{transform:none}#psheet .ps-grab{flex:0 0 auto;height:22px;display:flex;align-items:center;justify-content:center;touch-action:none;cursor:grab}' +
    '#psheet .ps-grab i{width:42px;height:5px;border-radius:3px;background:#ccc}' +
    '#psheet .ps-x{position:absolute;top:6px;right:8px;width:44px;height:44px;border:0;border-radius:22px;background:#f1f3f5;color:#333;font-size:22px;line-height:44px;cursor:pointer;z-index:2}' +
    '#psheet .ps-body{overflow:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:0 16px 14px}' +
    '#psheet .ps-body h3{margin:0 50px 4px 0;font-size:17px;line-height:1.25}#psheet .ps-body .pop h3{font-size:17px}' +
    '#psheet .ps-body>*:first-child{margin-top:0}' +
    '@media (prefers-reduced-motion:reduce){#psheet{transition:none}}' +
    '.leaflet-marker-icon.ps-sel{filter:drop-shadow(0 0 4px #fff) drop-shadow(0 0 6px #f59f00);z-index:9999 !important}' +
    '.leaflet-container a.leaflet-popup-close-button{width:34px;height:34px;font:24px/32px Tahoma,Verdana,sans-serif;right:2px;top:2px}' +
    '.leaflet-popup-content{max-height:none}.leaflet-popup-scrolled{border:0}' +
    '.leaflet-popup-content-wrapper .leaflet-popup-content{margin-right:30px}';
  function addCss() { if (document.getElementById('ps-css')) return; var s = document.createElement('style'); s.id = 'ps-css'; s.textContent = css; (document.head || document.documentElement).appendChild(s); }
  addCss();
  function topPad() { var t = document.getElementById('topbar') || document.getElementById('top'); var h = 0;
    if (t) { var r = t.getBoundingClientRect(); if (getComputedStyle(t).position === 'fixed' || getComputedStyle(t).position === 'absolute' || getComputedStyle(t).position === 'sticky') h = Math.max(0, r.bottom); }
    return h + 12; }
  // ---- breed scherm: betere popup-opties ----
  var bp = L.Layer.prototype.bindPopup;
  L.Layer.prototype.bindPopup = function (content, opts) {
    var o = L.extend({}, opts || {});
    o.maxWidth = Math.max(200, Math.min(320, Math.round(window.innerWidth * 0.9) - 48)); // + marges/knop ≈ min(360px, 90vw)
    if (!o.maxHeight) o.maxHeight = Math.max(220, Math.round(window.innerHeight * 0.6));
    o.autoPan = true; o.keepInView = false;
    o.autoPanPaddingTopLeft = L.point(12, topPad()); o.autoPanPaddingBottomRight = L.point(12, 16);
    return bp.call(this, content, o);
  };
  // autoPan-marges bepalen op het moment van openen: bovenbalk en een open zijpaneel (bv. ‘Lagen’ rechts) tellen mee.
  function rightPad() { var pn = document.getElementById('panel'); if (!pn || pn.classList.contains('hidden')) return 16;
    var r = pn.getBoundingClientRect(); if (r.width && r.left > window.innerWidth / 2 && r.left < window.innerWidth) return window.innerWidth - r.left + 12; return 16; }
  if (L.Popup && L.Popup.prototype._adjustPan) {
    var ap = L.Popup.prototype._adjustPan;
    L.Popup.prototype._adjustPan = function () { if (this.options) { this.options.autoPanPaddingTopLeft = L.point(12, topPad()); this.options.autoPanPaddingBottomRight = L.point(rightPad(), 16); } return ap.apply(this, arguments); };
  }
  // ---- smal scherm: paneel ----
  var sheet, body, cur = null, curMap = null;
  function build() {
    if (sheet) return; sheet = document.createElement('div'); sheet.id = 'psheet'; sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'false'); sheet.setAttribute('aria-label', 'Informatie over deze plek');
    sheet.innerHTML = '<div class="ps-grab" aria-hidden="true"><i></i></div><button class="ps-x" type="button" aria-label="Sluiten">✕</button><div class="ps-body"></div>';
    document.body.appendChild(sheet); body = sheet.querySelector('.ps-body');
    sheet.querySelector('.ps-x').onclick = function () { close(); };
    ['click', 'dblclick', 'mousedown', 'touchstart', 'wheel', 'pointerdown'].forEach(function (ev) { sheet.addEventListener(ev, function (e) { e.stopPropagation(); }, { passive: true }); });
    // veeg omlaag om te sluiten (op het greepje, of in de inhoud als die bovenaan staat)
    var y0 = null, dy = 0;
    sheet.addEventListener('touchstart', function (e) { if (e.touches.length !== 1) return; var onGrab = e.target.closest('.ps-grab');
      if (onGrab || body.scrollTop <= 0) { y0 = e.touches[0].clientY; dy = 0; sheet.style.transition = 'none'; } }, { passive: true });
    sheet.addEventListener('touchmove', function (e) { if (y0 == null) return; dy = e.touches[0].clientY - y0; if (dy > 0) sheet.style.transform = 'translateY(' + dy + 'px)'; else { y0 = null; sheet.style.transform = ''; } }, { passive: true });
    sheet.addEventListener('touchend', function () { if (y0 == null) return; sheet.style.transition = ''; sheet.style.transform = ''; if (dy > 70) close(); y0 = null; });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && cur) close(); });
    window.addEventListener('resize', function () { if (cur && !small()) { var l = cur; close(true); l.openPopup(); } });
  }
  function highlight(l, on) {
    if (l instanceof L.Marker) { var el = l.getElement && l.getElement(); if (el) el.classList.toggle('ps-sel', on); }
    else if (l instanceof L.CircleMarker && l.setStyle) {
      if (on) { l._psOld = { weight: l.options.weight, color: l.options.color }; l.setStyle({ weight: (l.options.weight || 2) + 3, color: '#f59f00' }); if (l.bringToFront) l.bringToFront(); }
      else if (l._psOld) { l.setStyle(l._psOld); l._psOld = null; }
    }
  }
  function contentOf(l) { var p = l._popup, c = p && (p._content != null ? p._content : p.options && p.options.content);
    if (typeof c === 'function') c = c(l); return c; }
  function keepVisible(map, ll) {
    var sz = map.getSize(), sh = sheet.getBoundingClientRect().height, mr = map.getContainer().getBoundingClientRect();
    var bottom = Math.min(sz.y, window.innerHeight - sh - mr.top) - 28, top = Math.max(0, topPad() - mr.top) + 28;
    var pt = map.latLngToContainerPoint(ll), dy = 0, dx = 0;
    if (pt.y > bottom) dy = pt.y - (top + bottom) / 2; else if (pt.y < top) dy = pt.y - (top + bottom) / 2;
    if (pt.x < 24) dx = pt.x - sz.x / 2; else if (pt.x > sz.x - 24) dx = pt.x - sz.x / 2;
    if (!dx && !dy) return;
    // panBy werkt in schermpixels; bij een gedraaide kaart (leaflet-rotate) rekenen we via het doelpunt.
    var c = map.latLngToContainerPoint(map.getCenter()), target = map.containerPointToLatLng(L.point(c.x + dx, c.y + dy));
    map.panTo(target, { animate: !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches), duration: .3 });
  }
  function open(l) {
    build(); var map = l._map || curMap; if (!map) return false;
    var c = contentOf(l); if (c == null) return false;
    if (cur && cur !== l) close(true);
    body.innerHTML = ''; if (typeof c === 'string') body.innerHTML = c; else if (c.nodeType) body.appendChild(c); else body.textContent = String(c);
    body.scrollTop = 0; cur = l; curMap = map; highlight(l, true);
    sheet.classList.add('on'); sheet.style.transform = '';
    map.closePopup();
    map.fire('popupopen', { popup: l._popup, sheet: true }); l.fire('popupopen', { popup: l._popup, sheet: true });
    if (!map._psClick) { map._psClick = true; map.on('click', function () { if (cur && cur._map === map) close(); }); }
    var ll = l.getLatLng ? l.getLatLng() : (l.getCenter ? l.getCenter() : null);
    if (ll) setTimeout(function () { keepVisible(map, ll); }, 30);
    setTimeout(function () { var x = sheet.querySelector('.ps-x'); if (x && document.activeElement === document.body) try { x.focus({ preventScroll: true }); } catch (e) {} }, 0);
    return true;
  }
  function close(silent) {
    if (!sheet) return; var l = cur; sheet.classList.remove('on'); sheet.style.transform = ''; cur = null;
    if (l) { highlight(l, false); if (!silent && l._map) { l._map.fire('popupclose', { popup: l._popup, sheet: true }); l.fire('popupclose', { popup: l._popup, sheet: true }); } }
  }
  var op = L.Layer.prototype.openPopup, cp = L.Layer.prototype.closePopup, iso = L.Layer.prototype.isPopupOpen;
  L.Layer.prototype.openPopup = function (latlng) {
    if (small() && this._popup && !(this._popup.options && this._popup.options.noSheet) && (this instanceof L.Marker || this instanceof L.Path) && this._map) {
      if (open(this)) return this;
    }
    return op.apply(this, arguments);
  };
  L.Layer.prototype.closePopup = function () { if (cur === this) { close(); return this; } return cp.apply(this, arguments); };
  L.Layer.prototype.isPopupOpen = function () { return cur === this || iso.apply(this, arguments); };
  L.Layer.prototype._psPatched = true;
  window.PopSheet = { open: open, close: close, current: function () { return cur; }, isSmall: small };
})();
