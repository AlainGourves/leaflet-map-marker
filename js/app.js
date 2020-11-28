const url = "js/salles.json";

let mapSalles, myMap, marker, markerArray;

const attribution = "fond de carte par&nbsp;<a href=\"http://www.openstreetmap.fr/mentions-legales/\" target=\"_blank\" rel=\"nofollow noopener\" data-saferedirecturl=\"https://www.google.com/url?q=http://www.openstreetmap.fr/mentions-legales/&amp;source=gmail&amp;ust=1549536187967000&amp;usg=AFQjCNFnpX0mkyom6on-dpH6CUoxPBmVvQ\">OpenStreetMap France</a>, sous&nbsp;<a href=\"http://creativecommons.org/licenses/by-sa/2.0/fr/\" target=\"_blank\" rel=\"nofollow noopener\" data-saferedirecturl=\"https://www.google.com/url?q=http://creativecommons.org/licenses/by-sa/2.0/fr/&amp;source=gmail&amp;ust=1549536187967000&amp;usg=AFQjCNGylyk2k1uD6Cjh4C5kjLYM9ADqdw\">licence CC BY-SA</a>&nbsp;»";
const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";


// fonctions pour la carte des salles
function infoSalle(layer) {
    let props = layer.feature.properties;
    let content = '<h4>'+ props.name +'</h4>';
    content += '<p>' + props.address + '</p>'
    content += '<ul>';
    props.sports.forEach(e => {
        content += '<li class="btn">' + e + '</li>'
    });
    content += '</ul>';
    layer.bindPopup(content, {closeButton: false});
}

function onEachFeature(feature, layer) {
    layer.addTo(markerArray);
    infoSalle(layer);
    layer.on({
        click: function(){
            this.openPopup();
        }
    });
}

window.addEventListener("load", e => {
    async function getData(url){
        const response = await fetch(url);
        const data = await response.json();
        L.geoJson(data, {
            onEachFeature: onEachFeature
        }).addTo(mapSalles);
        mapSalles.fitBounds(markerArray.getBounds(), { padding: [10,10]});
    }

    mapSalles = L.map("mapSalles", {
        center: [48.087, -1.66],
        minZoom: 4
    });

    L.tileLayer(tileUrl, { attribution }).addTo(mapSalles);
    const scale = L.control.scale({
        metric: true,
        imperial: false
    })
    scale.addTo(mapSalles);
    markerArray = new L.featureGroup();

    getData(url);
});