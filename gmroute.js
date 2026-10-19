/* Verdun 14–18 – route-links naar Google Maps.
   GMR.html(lat, lng) geeft een knop ‘🧭 Route in Google Maps’ (auto) + een kleine link ‘🚶 te voet’.
   Geen vertrekpunt: Google Maps gebruikt dan je huidige locatie.
   Op gewone pagina's krijgt elke knop a.lk naar kaart.html#LAT,LNG,ZOOM automatisch een route-link erachter. */
(function () {
  'use strict';
  var f6 = function (x) { return (+x).toFixed(6); };
  function url(lat, lng, mode) {
    return 'https://www.google.com/maps/dir/?api=1&destination=' + f6(lat) + ',' + f6(lng) + '&travelmode=' + (mode || 'driving');
  }
  function html(lat, lng) {
    return '<span class="gmr"><a class="gmr-car" href="' + url(lat, lng, 'driving') + '" target="_blank" rel="noopener">🧭 Route in Google Maps</a>' +
      '<a class="gmr-walk" href="' + url(lat, lng, 'walking') + '" target="_blank" rel="noopener" title="Wandelroute in Google Maps">🚶 te voet</a></span>';
  }
  function css() {
    if (document.getElementById('gmr-css')) return;
    var st = document.createElement('style'); st.id = 'gmr-css';
    st.textContent = '.gmr{display:inline-flex;flex-wrap:wrap;align-items:center;gap:4px 8px;vertical-align:middle}' +
      '.gmr a.gmr-car{background:#1a73e8;color:#fff!important;text-decoration:none;font-weight:700;font-size:12.5px;line-height:1.2;border-radius:12px;padding:5px 10px;white-space:nowrap}' +
      '.gmr a.gmr-walk{color:#1a73e8!important;font-size:12px;font-weight:600;text-decoration:underline;white-space:nowrap}' +
      '.gmrow{margin-top:8px}';
    (document.head || document.documentElement).appendChild(st);
  }
  var RE = /^kaart\.html#(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?),\d+$/;
  function auto(root) {
    css();
    var n = 0, as = (root || document).querySelectorAll('a.lk[href^="kaart.html#"]');
    for (var i = 0; i < as.length; i++) {
      var a = as[i], m = RE.exec(a.getAttribute('href'));
      if (!m || a.getAttribute('data-gmr')) continue;
      a.setAttribute('data-gmr', '1');
      a.insertAdjacentHTML('afterend', html(m[1], m[2])); n++;
    }
    return n;
  }
  // Leaflet: elke punt-popup (L.Marker, L.CircleMarker, L.Circle) krijgt de route-knop met de eigen coördinaten.
  // Laad dit bestand direct na leaflet.js. Uitzondering: bindPopup(inhoud, {noRoute: true}).
  function patchLeaflet() {
    var L = window.L;
    if (!L || !L.Layer || L.Layer.prototype._gmrPatched) return;
    var bp = L.Layer.prototype.bindPopup;
    L.Layer.prototype.bindPopup = function (content, opts) {
      if (typeof content === 'string' && !(opts && opts.noRoute) && (this instanceof L.Marker || this instanceof L.CircleMarker) &&
          content.indexOf('class="gmr"') < 0 && this.getLatLng) {
        var ll = this.getLatLng();
        if (ll) {
          var add = '<div class="gmrow">' + html(ll.lat, ll.lng) + '</div>';
          var bi = content.indexOf('<span class="badge"'), be = bi < 0 ? -1 : content.indexOf('</span>', bi);
          if (be >= 0) content = content.slice(0, be + 7) + add + content.slice(be + 7);   // direct onder titel/badge
          else if (/^<div class="pop">[\s\S]*<\/div>$/.test(content)) content = content.slice(0, -6) + add + '</div>';
          else content = content + add;
        }
      }
      return bp.call(this, content, opts);
    };
    L.Layer.prototype._gmrPatched = true;
  }
  patchLeaflet();
  window.GMR = { url: url, html: html, css: css, auto: auto, patchLeaflet: patchLeaflet };
  css();
  if (!window.GMR_NO_AUTO) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { auto(); });
    else auto();
  }
})();
