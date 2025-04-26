/* global $, L */
$(function () {
    if (window.mapInitialized) return;
    window.mapInitialized = true;
  
    /* ───────────────── 1. base map ───────────────── */
    const map = L.map('map', {
      minZoom: 2,
      maxZoom: 18,
      maxBounds: [[-90, -180], [90, 180]],
      maxBoundsViscosity: 1.0
    }).setView([20, 0], 3);
  
    L.tileLayer(
      'https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png',
      {
        attribution: '© Stadia Maps • Stamen • OpenMapTiles • OSM',
        maxZoom: 18,
        tileSize: 256,
        noWrap: true
      }
    ).addTo(map);
  
    const WORLD = { center: [20, 0], zoom: 3 };
  
    /* ───────────────── 2. overlay helpers ─────────── */
    const $overlay = $('#news-overlay');
    function resetView () {
      $overlay.fadeOut(200);
      map.setView(WORLD.center, WORLD.zoom);
    }
    $('#close-overlay').on('click', resetView);
    $(document).on('keyup', e => { if (e.key === 'Escape') resetView(); });
  
    /* ───────────────── 3. load data ───────────────── */
    const borders =
      'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson';
  
    $.getJSON(borders).done(geo => {
      $.getJSON('/get_exchanges').done(exchanges => {
  
        const findEx = c =>
          exchanges.find(v => v.host === c || v.associated.includes(c));
  
        function style (feat) {
          const c = feat.properties.NAME_EN || feat.properties.NAME || '';
          const ex = findEx(c);
          let fill = '#e0e0e0', op = 0.5;
          if (ex) {
            if (ex.host === c) { fill = ex.hostColor; op = 0.92; }
            else               { fill = ex.assocColor; op = 0.65; }
          }
          return { fillColor: fill, color: 'white', weight: 1, opacity: 1, fillOpacity: op };
        }
  
        L.geoJSON(geo, {
          style,
          onEachFeature: (feat, layer) => {
            const country = feat.properties.NAME_EN || feat.properties.NAME || '';
            const ex      = findEx(country);
  
            /* zoom + overlay only if an exchange exists */
            if (ex) {
              layer.on('click', () => {
                const b = layer.getBounds();
                const lngSpan = Math.abs(b.getEast() - b.getWest());
                const crossesIDL = lngSpan > 180;
  
                let targetZoom;
                if (crossesIDL || lngSpan > 120) {
                  targetZoom = Math.min(map.getZoom() + 2, 8);   // mega-country
                } else {
                  targetZoom = Math.min(
                    map.getBoundsZoom(b) + 1,
                    map.getZoom() + 2,
                    8
                  );
                }
  
                map.setView(b.getCenter(), targetZoom, { animate: true });
  
                $('#news-left, #news-right').html(
                  `<h4>${country}</h4>
                   <p class="text-muted">News feed coming soon…</p>`
                );
                $overlay.fadeIn(200);
              });
            }
  
            /* popup shown for every country */
            layer.bindPopup(
              `<b>${country}</b><br>` +
              (ex ? `Exchange: ${ex.name}` : 'No associated exchange')
            );
          }
        }).addTo(map);
      });
    });
  });
  