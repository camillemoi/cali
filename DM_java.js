var closePopup = document.getElementById("popupclose");
var overlay = document.getElementById("overlay");
var popup = document.getElementById("popup");
var button = document.getElementById("button");
closePopup.onclick = function() {
  overlay.style.display = 'none';
  popup.style.display = 'none';
};
button.onclick = function() {
  overlay.style.display = 'block';
  popup.style.display = 'block';
}

var map = L.map('map');
var osmUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
var osmAttrib = 'Map data ©️ CartoDB contributors';

var osm = new L.TileLayer(osmUrl, {attribution: osmAttrib}).addTo(map);

function getColorpoly(valuepoly) {
  return valuepoly > 50 ? '#AC4B1C' :
          valuepoly > 35  ? '#FCA652' :
          valuepoly > 20  ? '#FFD57E' :
          valuepoly >  0 ? '#FFEFA0' :
                      '#F3F0D7';
}

function stylepoly(features) {
  return {
      fillColor: getColorpoly(features.properties.evol),
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '1',
      fillOpacity: 0.7
  };
}

var housing = L.geoJSON(zips, {
  onEachFeature : function (features, price) {
      price.bindTooltip("Quartier : "+ features.properties.name + " - Evolution : " + features.properties.evol +"%", {
  direction: 'up',
  permanent: false,
  sticky: true,
  opacity: 0.75,
  className: 'tooltip_quartiers' 
});
      price.on('click', function(zoom){
          var leaflet_obj = zoom.target;
          map.fitBounds(leaflet_obj.getBounds());
      });
      price.on('click', function(new_house){
          var quartier1 = new_house.target;
          price.setStyle({
              fillColor: "white",
              weight : 5,
              opacity : 1,
              color : "red",
              fillOpacity : 0
          });
      });
      price.on('mouseout', function(old_house){
          var quartier2 = old_house.target;
          housing.resetStyle(quartier2);
      });
  },
  style: stylepoly
  }).addTo(map);


  function getColor(value) {
    return value == 801 ? '#0D1DCE' :
            value == 802  ? '#DA0606' :
            value == 805  ? '#B4249D' :
            value == 803  ? '#21C20A' :
            value == 804 ? '#D5CF24' :
            value == 806 ? '#80E5E4' :
                        '#A8A8A8';
}

function stylemetro(features) {
    return {
        weight: 5,
        opacity: 0.7,
        color: getColor(features.properties.OBJECTID),
        dashArray: '1',
        fillOpacity: 1
    };
}

var metro_la = L.geoJSON(metro, {
    onEachFeature: mouse_events_metro,
    style: stylemetro,
})
.bindPopup('<a href="https://www.metro.net/riding/schedules/">Site officiel & horaires</a>', {className: 'pop_metro'})
.addTo(map);

function mouse_events_metro(feature, line){
    line.on('mouseover', function(bigline){
        var obj_line1 = bigline.target;
        line.setStyle({weight : 10});
    });
    line.on('mouseout', function(smalline){
        var obj_line2 = smalline.target;
        metro_la.resetStyle(smalline.target);
    });
}

var myAIcon = L.icon({
  iconUrl: 'metro.png',
  iconSize: [30, 30]
});

var raw = [];
for (var j = 0; j < metro_mov.features.length; j++) {
    for (var i = 0; i < metro_mov.features[j].geometry.coordinates[0].length; i++) {
      var tmp = [];
      tmp[0] = metro_mov.features[j].geometry.coordinates[0][i][1];
      tmp[1] = metro_mov.features[j].geometry.coordinates[0][i][0];
      raw.push(tmp);
    }
}

var coords = L.polyline(raw),
    animatedMarker = L.animatedMarker(coords.getLatLngs(), {
      style: myAIcon,
      distance: 50,
      interval: 30,
      autoStart: true,
      icon: myAIcon
})
map.addLayer(animatedMarker);

var radiusTransparent = 500;
var radiusVisible = 2000;

var studioicon = L.icon({
  iconUrl: 'cinema.png',
  iconSize: [40, 40]
});
  
function setBufferVisible(buffer, setVisible) {
  if (setVisible) {
    buffer.setStyle({color : '#006080', fillColor : '#99ccff', 
    fillOpacity : 0.3, opacity : 1, weight : 1});
    buffer.setRadius(radiusVisible);
    }
  else {
    buffer.setStyle({color : '#006080', fillColor : '#99ccff', fillOpacity : 0, opacity : 0, weight : 1});
    buffer.setRadius(radiusTransparent);
  }
}

var info1 = document.getElementById("studio_name");
  info1.style.display = 'none';
var info2 = document.getElementById("studio_resume");
  info2.style.display = 'none';

function showStudioInfo(name, resume, switchon) {
  info1.innerHTML = name;
  info1.style.display = switchon;
  info2.innerHTML = resume;
  info2.style.display = switchon;
}

var visibleBuffer = null;
var studios_marker = L.geoJSON(studios, {
  pointToLayer: function (feature, latlng){
    var smallIcon = L.icon({
      iconUrl: ''+ feature.properties.Name +'.png',
      iconSize: [80, 60]
    });
    var marker = L.marker(latlng, {icon: studioicon});
    marker.smallIcon = smallIcon;
    marker.feature = feature;
    marker.on('mouseover', function(evt) {
      marker.setIcon(marker.smallIcon);
      var properties = marker.feature.properties;
      showStudioInfo(properties.Name, properties.resume, 'block');
    });
    marker.on('mouseout', function(evt){
      marker.setIcon(studioicon);
      showStudioInfo('', '', 'none');
    });

    var buffer = new L.circle(latlng, radiusTransparent, {color : '#006080', fillColor : '#99ccff', fillOpacity : 0, opacity : 0, weight : 1});
    buffer.on('mouseover', function(evt){
      if (visibleBuffer) {
        setBufferVisible(visibleBuffer, false);
      }
      setBufferVisible(buffer, true);
      visibleBuffer = buffer;
    });
    buffer.on('mouseout', function(evt){
      var distance = map.distance(evt.latlng, latlng);
      if (distance > radiusVisible) {
        setBufferVisible(buffer, false);
      }
    });
    
    var markerGroup = L.layerGroup([buffer, marker]);
    return markerGroup;
  }
}).addTo(map);

map.fitBounds(metro_la.getBounds());

var baseLayers = {
    "Carto DB": osm
   };
var overlays = {
    "Studios de Cinéma": studios_marker,
    "Lignes de métro": metro_la,
    "Quartiers": housing
   };
L.control.layers(baseLayers, overlays).addTo(map);

housing.bringToBack()
metro_la.bringToFront()
studios_marker.bringToFront()

var legend = L.control({ position: "bottomright" });

legend.onAdd = function(mapleg) {
  var div = L.DomUtil.create("div", "legend");
  div.innerHTML += "<h4>Studios</h4>";
  div.innerHTML += '<i class="icon" style="background-image: url(cinema.png);background-repeat: no-repeat;"></i><span>Studios</span><br>';
  div.innerHTML += "<h4>Lignes de métro</h4>";
  div.innerHTML += '<i style="background: #0D1DCE"></i><span>Blue Line</span><br>';
  div.innerHTML += '<i style="background: #DA0606"></i><span>Red Line</span><br>';
  div.innerHTML += '<i style="background: #B4249D"></i><span>Purple Line</span><br>';
  div.innerHTML += '<i style="background: #21C20A"></i><span>Green Line</span><br>';
  div.innerHTML += '<i style="background: #D5CF24"></i><span>Gold Line</span><br>';
  div.innerHTML += '<i style="background: #80E5E4"></i><span>Expo Line</span><br>';
  div.innerHTML += "<h4> Augmentation du prix de l'immobilier 2016-2021</h4>";
  div.innerHTML += '<i style="background: #AC4B1C"></i><span>Plus de 50%</span><br>';
  div.innerHTML += '<i style="background: #FCA652"></i><span>35-50%</span><br>';
  div.innerHTML += '<i style="background: #FFD57E"></i><span>20-35%</span><br>';
  div.innerHTML += '<i style="background: #FFEFA0"></i><span>0-20%</span><br>';
  div.innerHTML += '<i style="background: #F3F0D7"></i><span>Données inconnues</span><br>';

  return div;
};

legend.addTo(map);