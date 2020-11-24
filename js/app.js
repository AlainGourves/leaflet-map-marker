const formSalle = document.querySelector("#ajoutSalles form");
const nomSalle = document.querySelector("#nomSalle");
const adresseSalle = document.querySelector("#adresseSalle");
const posSalle = document.querySelector("#posSalle");
const sportsSalle = document.querySelector("#sportsSalle");

// Dialogue Confirm
const dialogue = document.querySelector(".overlay");
const dialogueOui = document.querySelector('#ouiSalle');
const dialogueNon = document.querySelector('#nonSalle');

const url = "js/salles.json";

let mapSalles, myMap, marker, markerArray;

const attribution = "fond de carte par&nbsp;<a href=\"http://www.openstreetmap.fr/mentions-legales/\" target=\"_blank\" rel=\"nofollow noopener\" data-saferedirecturl=\"https://www.google.com/url?q=http://www.openstreetmap.fr/mentions-legales/&amp;source=gmail&amp;ust=1549536187967000&amp;usg=AFQjCNFnpX0mkyom6on-dpH6CUoxPBmVvQ\">OpenStreetMap France</a>, sous&nbsp;<a href=\"http://creativecommons.org/licenses/by-sa/2.0/fr/\" target=\"_blank\" rel=\"nofollow noopener\" data-saferedirecturl=\"https://www.google.com/url?q=http://creativecommons.org/licenses/by-sa/2.0/fr/&amp;source=gmail&amp;ust=1549536187967000&amp;usg=AFQjCNGylyk2k1uD6Cjh4C5kjLYM9ADqdw\">licence CC BY-SA</a>&nbsp;»";
const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";


// fonctions pour la carte des salles
function infoSalle(layer) {
    let props = layer.feature.properties;
    let content = '<h4>'+ props.name +'</h4>';
    content += '<p>' + props.address + '</p>'
    content += '<p>';
    props.sports.forEach(e => {
        content += '<span class="btn">' + e + '</span>'
    });
    content += '</p>';
    layer.bindPopup(content, {closeButton: false});
}

function onEachFeature(feature, layer) {
    layer.addTo(markerArray);
    infoSalle(layer);
}

// fonctions pour l'ajout de salles
function zoomTo(map, pos){
    let markerBounds = L.latLngBounds([pos]);
    map.fitBounds(markerBounds, {maxZoom: 15});
}

function onMapLoad(){
    if(typeof markerOldPos !== 'undefined'){
        // cas d'une modif
        marker.setLatLng(markerOldPos);
        zoomTo(myMap, markerOldPos);
    }
}

function position(pos){
    posSalle.value = pos.lat + ', ' + pos.lng;
    posSalle.dataset.lat = pos.lat;
    posSalle.dataset.lng = pos.lng;
    getAddress(pos);
}

async function getAddress(pos){
    const urlGeoAPI = `https://api-adresse.data.gouv.fr/reverse/?lon=${pos.lng}&lat=${pos.lat}`;
    const response = await fetch(urlGeoAPI);
    const data = await response.json();
    adresseSalle.value = data.features[0].properties.name;
}

function reponseDialogue(){
    return new Promise(function(resolve, reject){
        dialogueOui.addEventListener('click', function(){
            resolve();
        });
        dialogueNon.addEventListener('click', function(){
            reject();
        })
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

    mapSalles = L.map("mapSalles").setView([48.087, -1.66], 18);

    L.tileLayer(tileUrl, { attribution }).addTo(mapSalles);
    const scale = L.control.scale({
        metric: true,
        imperial: false
    })
    scale.addTo(mapSalles);
    markerArray = new L.featureGroup();

    getData(url);

    // Ajout de salles
    myMap = L.map("mapAjout");
    L.tileLayer(tileUrl, { attribution }).addTo(myMap);

    marker = L.marker([0,0], { draggable: true}).addTo(myMap);

    myMap.on('load', onMapLoad);
    myMap.setView([48.087, -1.66], 15);

    myMap.on('click', function(e){
        let pos = e.latlng;
        marker.setLatLng(pos);
        zoomTo(this, pos);
        position(pos);
    });

    L.DomEvent.on(marker, 'dragend', () => {
        pos = marker.getLatLng();
        position(pos);
    });

    // Btns "modif"
    let btnMdif = document.querySelectorAll('a[href*=supprimer]');
    btnMdif.forEach(b => {
        b.addEventListener('click', e => {
            e.preventDefault();
            let destination = e.target.href;
            dialogue.querySelector('span').textContent = e.target.dataset.name;
            dialogue.style.setProperty('display', 'block');
            reponseDialogue()
                .then(function(e){
                    window.location = destination;
                })
                .catch(function(){
                    console.log("La réponse était 'Non'");
                })
                .then(function(){
                    dialogue.style.setProperty('display', 'none');
                })
        })
    })
});