/* global $,L */
$(function(){
    if(window.mapInitialized)return;
    window.mapInitialized=true;
  
    const map=L.map('map',{minZoom:2,maxZoom:18,
      maxBounds:[[ -90,-180],[90,180]],maxBoundsViscosity:1}).setView([0,0],3);
  
    L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png',
      {attribution:'© Stadia Maps • Stamen • OpenMapTiles • OSM',
       maxZoom:18,tileSize:256,noWrap:true}).addTo(map);
  
    const borders='https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson';
  
    $.getJSON(borders).done(g=>{
      $.getJSON('/get_exchanges').done(ex=>{
        function style(f){
          const c=f.properties.NAME_EN||f.properties.NAME||'';
          const e=ex.find(v=>v.host===c||v.associated.includes(c));
          let fill='#e0e0e0',op=.5;
          if(e){if(e.host===c){fill=e.hostColor;op=.9}else{fill=e.assocColor;op=.6}}
          return{fillColor:fill,color:'white',weight:1,opacity:1,fillOpacity:op};
        }
        L.geoJSON(g,{
          style,
          onEachFeature:(f,l)=>{
            const c=f.properties.NAME_EN||f.properties.NAME||'';
            const e=ex.find(v=>v.host===c||v.associated.includes(c));
            l.bindPopup(`<b>${c}</b><br>${e?`Exchange: ${e.name}`:'No associated exchange'}`);
          }
        }).addTo(map);
      });
    });
  });
  