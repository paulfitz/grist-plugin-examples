"use strict";

/* global grist, window */

let amap;
let popups = {};

function forTable(name, rowId) {
  grist.docApi.fetchSelectedTable()
    .then(data => {
      if (!data) {
        console.log("No table found");
        return;
      }
      if (!(data.long && data.lat && data.Name)) {
        console.log("table does not have all needed columns: long, lag, Name");
        return;
      }
      const tiles = L.tileLayer('//server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
	maxZoom: 18,
	attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC'
      });
      if (amap) { amap.remove(); }
      const map = L.map('map', {layers: [tiles]});
      const markers = L.markerClusterGroup();
      const points = [];
      popups = {};
      for (let i = 0; i < data.id.length; i++) {
        if (Math.abs(data.lat[i]) < 0.01 && Math.abs(data.long[i]) < 0.01) {
          continue;
        }
        const pt = new L.LatLng(data.lat[i], data.long[i]);
        const title = data.Name[i];
        const marker = L.marker(pt, { title  });
        points.push(pt);
	marker.bindPopup(title);
	markers.addLayer(marker);
        popups[data.id[i]] = marker;
      }
      map.addLayer(markers);
      map.fitBounds(new L.LatLngBounds(points), {maxZoom: 12, padding: [0, 0]});
      amap = map;
      if (rowId && popups[rowId]) {
        var marker = popups[rowId];
        if (!marker._icon) { marker.__parent.spiderfy(); }
        marker.openPopup();
      }
    });
}

if (grist.on) {
  grist.on('message', (e) => {
    return forTable(e.tableId, e.rowId);
  });
}

grist.ready();

