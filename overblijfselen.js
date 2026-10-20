/* Laag ‘Overblijfselen’: fysieke WOI-resten (bunkers, schuilplaatsen, ruïnes, kraters, geschut- en observatieposten)
   uit OpenStreetMap (© OpenStreetMap-bijdragers, ODbL 1.0), opgehaald via de Overpass API en gefilterd op WOI
   (zie overblijfselen.json: veld 'bron' en 'opgehaald'). Uit OSM: niet elk object is gecontroleerd en veel resten
   liggen op privéterrein.
   Gebruik: REMAINS.init(map, {url:'overblijfselen.json', toggle:'tgRem', legend:'remLeg', pane:'remM'})
   Hash ‘#rem’ of ‘&rem’ zet de laag meteen aan. */
(function () {
  'use strict';
  var K = {
    bunker:  {l: 'Bunker / schuilplaats', c: '#495057', s: '<path d="M2 20h20v2H2zM4 19l2.2-9h11.6l2.2 9zM8 13h8v2H8zM9 6h6v3H9z"/>'},
    geschut: {l: 'Geschut / observatiepost', c: '#364fc7', s: '<path d="M3 20h18v2H3zM5 19a7 7 0 0 1 14 0zM12 11 21 4l1 1.5-8.3 7z"/>'},
    krater:  {l: 'Krater / slagveld', c: '#d9480f', s: '<path d="M1 14c2-4 6-5 11-5s9 1 11 5c-2 4-6 5-11 5s-9-1-11-5zm5 0c1.5 1.6 3.5 2 6 2s4.5-.4 6-2c-1.5-1.6-3.5-2-6-2s-4.5.4-6 2zM4 7l2 2M12 3v3M20 7l-2 2" stroke="#fff" stroke-width="1.6"/>'},
    ruine:   {l: 'Ruïne', c: '#8d5b3b', s: '<path d="M3 21V10l3-2v4l2-2v11zm7 0V7l3 1v3l2-1v11zm7 0v-8l2-2 2 1v9z"/>'}
  };
  var ORDER = ['bunker', 'geschut', 'krater', 'ruine'];
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]; }); }
  function css() {
    if (document.getElementById('rem-css')) return;
    var st = document.createElement('style'); st.id = 'rem-css';
    st.textContent = '.rmk{width:22px;height:22px;border-radius:6px;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center}' +
      '.rmk svg{width:15px;height:15px;fill:#fff}' +
      '.rmc{border-radius:50%;background:rgba(73,80,87,.85);color:#fff;font:700 12px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,.5)}' +
      '.remleg{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:12px;color:#444;margin:2px 0 4px}.remleg span{display:inline-flex;align-items:center;gap:4px}' +
      '.remleg i{display:inline-block;width:12px;height:12px;border-radius:3px;border:1.5px solid #fff;box-shadow:0 0 0 1px #bbb}' +
      '.pop .osm{font-size:12px;color:#555}';
    document.head.appendChild(st);
  }
  function icon(k) {
    var t = K[k] || K.bunker;
    return L.divIcon({className: '', iconSize: [22, 22], iconAnchor: [11, 11], popupAnchor: [0, -10],
      html: '<div class="rmk" style="background:' + t.c + '"><svg viewBox="0 0 24 24">' + t.s + '</svg></div>'});
  }
  function popup(o) {
    var t = K[o.k] || K.bunker, typ = { n: 'node', w: 'way', r: 'relation' }[o.i[0]], id = o.i.slice(1);
    var h = '<div class="pop"><h3>' + esc(o.n || o.t) + '</h3><span class="badge" style="background:' + t.c + '">' + esc(o.n ? o.t : t.l) + '</span>';
    if (o.d) h += '<p class="osm"><b>Beschrijving (OSM):</b> ' + esc(o.d) + '</p>';
    if (o.dt) h += '<p class="osm"><b>Datum (OSM):</b> ' + esc(o.dt) + '</p>';
    if (o.w) { var m = /^([a-z]{2}):(.+)$/.exec(o.w); if (m) h += '<p class="osm"><a href="https://' + m[1] + '.wikipedia.org/wiki/' + encodeURIComponent(m[2].replace(/ /g, '_')) + '" target="_blank" rel="noopener">Wikipedia (' + m[1] + ')</a></p>'; }
    h += '<p class="osm">⚠️ Vaak op privéterrein of in het bos: alleen bekijken vanaf de openbare weg of het pad. Munitie gezien? Niet aanraken.</p>';
    h += '<p class="src">Bron: <a href="https://www.openstreetmap.org/' + typ + '/' + id + '" target="_blank" rel="noopener">OpenStreetMap ' + typ + ' ' + id + '</a> · © OpenStreetMap-bijdragers, ODbL. Niet elk object is gecontroleerd.</p></div>';
    return h;
  }
  function init(map, opts) {
    opts = opts || {}; css();
    var tg = document.getElementById(opts.toggle || 'tgRem'), leg = document.getElementById(opts.legend || 'remLeg');
    var group = L.layerGroup([], {attribution: 'Overblijfselen: © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>-bijdragers (ODbL)'});
    var data = null, markers = [], loading = null, CL = opts.clusterBelow || 14, CELL = 60;
    var spane = opts.shapePane || 'remS'; if (!map.getPane(spane)) { map.createPane(spane, map.getPane('rotatePane') || undefined); map.getPane(spane).style.zIndex = 415; }
    var pane = opts.pane; if (pane && !map.getPane(pane)) { map.createPane(pane, map.getPane('norotatePane') || undefined); map.getPane(pane).style.zIndex = opts.zIndex || 590; }
    function load() {
      if (loading) return loading;
      loading = fetch(opts.url || 'overblijfselen.json').then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (j) {
        data = j;
        markers = j.f.map(function (o) {
          var m = L.marker([o.la, o.lo], {icon: icon(o.k), title: o.n || o.t, pane: pane || 'markerPane', riseOnHover: true});
          m.bindPopup(popup(o), {maxWidth: 320}); m._rk = o.k;
          if (o.g) {   // vlak of lijn uit OSM: de echte vorm vanaf zoom o.gz, daarvoor het icoon
            var st = {pane: spane, color: (K[o.k] || K.bunker).c, weight: 2.5, opacity: .95, fillOpacity: .45};
            var sh = o.gp ? L.polygon(o.g, st) : L.polyline(o.g, st);
            var ph = popup(o); if (window.GMR) ph = ph.replace('</span>', '</span><div class="gmrow">' + GMR.html(o.la, o.lo) + '</div>');
            sh.bindPopup(ph, {maxWidth: 320, noRoute: true}); m._shape = sh; m._gz = o.gz;
          }
          return m;
        });
        if (leg) {
          var c = {}; j.f.forEach(function (o) { c[o.k] = (c[o.k] || 0) + 1; });
          leg.innerHTML = '<div class="remleg">' + ORDER.filter(function (k) { return c[k]; }).map(function (k) { return '<span><i style="background:' + K[k].c + '"></i>' + K[k].l + ' (' + c[k] + ')</span>'; }).join('') + '</div>' +
            'Samen ' + j.f.length + ' WOI-resten uit OpenStreetMap (opgehaald ' + esc(j.opgehaald || '') + '). Uitgezoomd gebundeld in grijze bolletjes met een getal (tik om in te zoomen). Resten die in OSM als vlak zijn ingetekend (' + j.f.filter(function (o) { return o.g; }).length + ', o.a. bunkers en forten) krijgen ver ingezoomd (zoom 15–18, naargelang de grootte) hun echte vorm in plaats van het icoon. Zie ook de lidar-laag.';
        }
        return j;
      }).catch(function (e) { loading = null; if (leg) leg.textContent = 'Overblijfselen konden niet geladen worden (' + e.message + ').'; throw e; });
      return loading;
    }
    function draw() {
      if (!data || !map.hasLayer(group)) return;
      group.clearLayers();
      var z = map.getZoom();
      if (z >= CL) { markers.forEach(function (m) { group.addLayer(m._shape && z >= m._gz ? m._shape : m); }); return; }
      var cells = {};
      markers.forEach(function (m) {
        var p = map.project(m.getLatLng(), z), key = Math.floor(p.x / CELL) + ':' + Math.floor(p.y / CELL);
        (cells[key] = cells[key] || []).push(m);
      });
      Object.keys(cells).forEach(function (key) {
        var a = cells[key];
        if (a.length === 1) { group.addLayer(a[0]); return; }
        var la = 0, lo = 0; a.forEach(function (m) { var ll = m.getLatLng(); la += ll.lat; lo += ll.lng; });
        var ll = L.latLng(la / a.length, lo / a.length), sz = a.length < 10 ? 28 : (a.length < 50 ? 34 : 40);
        var cm = L.marker(ll, {pane: pane || 'markerPane', title: a.length + ' overblijfselen – tik om in te zoomen',
          icon: L.divIcon({className: '', iconSize: [sz, sz], iconAnchor: [sz / 2, sz / 2], html: '<div class="rmc" style="width:' + sz + 'px;height:' + sz + 'px">' + a.length + '</div>'})});
        cm.on('click', function () { var b = L.latLngBounds(a.map(function (m) { return m.getLatLng(); })); map.fitBounds(b.pad(0.3), {maxZoom: Math.max(CL, z + 2)}); });
        group.addLayer(cm);
      });
    }
    map.on('zoomend', draw);
    function on() { group.addTo(map); return load().then(draw); }
    function off() { map.removeLayer(group); }
    if (tg) {
      tg.addEventListener('change', function () { tg.checked ? on() : off(); });
      if (/(^#|&)rem\b/.test(location.hash)) tg.checked = true;
      if (tg.checked) on();
    }
    window.REMAINS.layer = group; window.REMAINS.on = on; window.REMAINS.off = off;
    window.REMAINS.data = function () { return data; };
    return group;
  }
  /* Loopgraaf-iconen: groepeert loopgraafsegmenten (binnen ~300 m) tot plekken; uitgezoomd één icoon per plek
     (gebundeld als het er veel zijn), vanaf zoom showAt de echte lijnen. */
  var TC = '#7a4a1e', TS = '<path d="M1 15h4v-5h4v7h4v-7h4v5h6v3h-9v-5h-2v7H7v-7H5v5H1z"/>';
  function trenches(map, opts) {
    css();
    var layer = opts.layer, tg = document.getElementById(opts.toggle || 'tgTrench'), showAt = opts.showAt || 15, R300 = opts.radius || 300;
    var pane = opts.pane || 'trM'; if (!map.getPane(pane)) { map.createPane(pane, map.getPane('norotatePane') || undefined); map.getPane(pane).style.zIndex = 585; }
    var it = [];
    layer.eachLayer(function (l) { var b = l.getBounds(); it.push({b: b, c: b.getCenter(), n: (l.feature && l.feature.properties && (l.feature.properties.naam || l.feature.properties.name)) || ''}); });
    var par = it.map(function (_, i) { return i; });
    function f(i) { while (par[i] !== i) { par[i] = par[par[i]]; i = par[i]; } return i; }
    var cell = {}, dg = R300 / 111000;
    it.forEach(function (o, i) { var k = Math.floor(o.c.lat / dg) + ':' + Math.floor(o.c.lng / (dg * 1.6)); (cell[k] = cell[k] || []).push(i); o.k = k; });
    it.forEach(function (o, i) {
      var a = o.k.split(':').map(Number);
      for (var dx = -1; dx <= 1; dx++) for (var dy = -1; dy <= 1; dy++) (cell[(a[0] + dx) + ':' + (a[1] + dy)] || []).forEach(function (j) {
        if (j > i && map.distance(o.c, it[j].c) < R300) par[f(i)] = f(j); });
    });
    var G = {};
    it.forEach(function (o, i) { var r = f(i); (G[r] = G[r] || {n: 0, b: L.latLngBounds(o.b.getSouthWest(), o.b.getNorthEast()), la: 0, lo: 0, names: {}}); var g = G[r];
      g.n++; g.b.extend(o.b); g.la += o.c.lat; g.lo += o.c.lng; if (o.n) g.names[o.n] = 1; });
    var sites = opts.sites || [];
    var groups = Object.keys(G).map(function (k) { var g = G[k]; g.c = L.latLng(g.la / g.n, g.lo / g.n);
      var best = null, bd = 800; sites.forEach(function (p) { var d = map.distance(g.c, [p.lat, p.lng]); if (d < bd) { bd = d; best = p.naam; } }); g.site = best; return g; });
    function desc(g) {
      var nm = Object.keys(g.names);
      return '<div class="pop"><h3>Loopgraafresten' + (g.site ? ' bij ' + esc(g.site) : '') + '</h3><span class="badge" style="background:' + TC + '">' + g.n + ' segment' + (g.n > 1 ? 'en' : '') + '</span>' +
        (nm.length ? '<p class="osm"><b>Namen:</b> ' + esc(nm.slice(0, 6).join(', ')) + (nm.length > 6 ? ' …' : '') + '</p>' : '') +
        '<p class="osm">Vanaf zoom ' + showAt + ' zie je de lijnen zelf. Zet de lidar-laag aan voor het reliëf.</p>' + (opts.src ? '<p class="src">' + opts.src + '</p>' : '') + '</div>';
    }
    function zoomTo(g) { map.fitBounds(g.b.pad(0.25), {maxZoom: 17}); if (map.getZoom() < showAt) map.setView(g.c, showAt);
      setTimeout(function () { L.popup({maxWidth: 300, noRoute: true}).setLatLng(g.c).setContent(desc(g)).openOn(map); }, 350); }
    var icn = L.divIcon({className: '', iconSize: [24, 24], iconAnchor: [12, 12], html: '<div class="rmk trk" style="background:' + TC + ';border-radius:50%"><svg viewBox="0 0 24 24">' + TS + '</svg></div>'});
    groups.forEach(function (g) {
      g.m = L.marker(g.c, {icon: icn, pane: pane, title: 'Loopgraafresten (' + g.n + ' segment' + (g.n > 1 ? 'en' : '') + ')' + (g.site ? ' bij ' + g.site : '') + ' – tik om in te zoomen'});
      g.m.on('click', function () { zoomTo(g); });
    });
    var icons = L.layerGroup();
    function upd() {
      var on = !tg || tg.checked, z = map.getZoom();
      if (!on) { map.removeLayer(layer); map.removeLayer(icons); return; }
      if (z >= showAt) { map.removeLayer(icons); layer.addTo(map); return; }
      map.removeLayer(layer); icons.clearLayers(); icons.addTo(map);
      var cells = {};
      groups.forEach(function (g) { var p = map.project(g.c, z), k = Math.floor(p.x / 64) + ":" + Math.floor(p.y / 64); (cells[k] = cells[k] || []).push(g); });
      Object.keys(cells).forEach(function (k) {
        var a = cells[k]; if (a.length === 1) { icons.addLayer(a[0].m); return; }
        var la = 0, lo = 0, n = 0, b = L.latLngBounds(a[0].b.getSouthWest(), a[0].b.getNorthEast());
        a.forEach(function (g) { la += g.c.lat; lo += g.c.lng; n += g.n; b.extend(g.b); });
        var sz = a.length < 10 ? 28 : 34;
        var cm = L.marker([la / a.length, lo / a.length], {pane: pane, title: a.length + ' plekken met loopgraafresten – tik om in te zoomen',
          icon: L.divIcon({className: '', iconSize: [sz, sz], iconAnchor: [sz / 2, sz / 2], html: '<div class="rmc" style="width:' + sz + 'px;height:' + sz + 'px;background:rgba(122,74,30,.9)">' + a.length + '</div>'})});
        cm.on('click', function () { map.fitBounds(b.pad(0.2), {maxZoom: Math.min(showAt - 1, z + 3)}); });
        icons.addLayer(cm);
      });
    }
    if (tg) tg.addEventListener('change', upd);
    map.on('zoomend', upd); upd();
    var leg = opts.legend && document.getElementById(opts.legend);
    if (leg) leg.innerHTML = '<span class="remleg"><span><i style="background:' + TC + ';border-radius:50%"></i>' + groups.length + ' plekken met loopgraafresten</span></span> Uitgezoomd één bruin icoon per plek (segmenten binnen ' + R300 + ' m samen; bruine bolletjes met getal = meerdere plekken). Vanaf zoom ' + showAt + ' de lijnen zelf.';
    return {groups: groups, update: upd, icons: icons};
  }
  window.REMAINS = {init: init, trenches: trenches, kinds: K};
})();
