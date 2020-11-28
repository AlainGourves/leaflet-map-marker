<?php
// Chargement fichier geoJson
$url = __DIR__.'/js/salles.json';
$json = json_decode(file_get_contents($url, true)); // convert JSON into PHP Assoc Array

// Traitement du FORM --------------------------------
function sanitizeString($var) {
    $var = stripslashes($var);
    $var = htmlentities($var);
    $var = strip_tags($var);
    return $var;
}

function alerte($message){
    return "<span class=\"alerte\">". $message. "</span>";
}

function saveGeoJson($url, $json){
    $jsonFile = fopen($url, "w");
    fputs($jsonFile, json_encode($json));
    fclose($jsonFile);
}

if (isset($_POST['submit'])) {
    // Verif 1 : les champs ne sont pas vides
    if (empty($_POST['nomSalle'])) {
        $message['nomSalle'] = "Saisir un nom.";
    } elseif (empty($_POST['adresseSalle'])) {
        $message['adresseSalle'] = "Saisir une adresse.";
    } elseif (strlen(trim($_POST['sportsSalle'])) == 0) {
        $message['sportsSalle'] = "Saisir le(s) sport(s) pratiqué(s).";
    } elseif (empty($_POST['posSalle'])) {
        $message['posSalle'] = "Placer un marqueur sur la carte.";
        unset($_POST['posSalle']);
    }else{
        $feature = new stdClass; // objet anonyme
        $properties = new stdClass; // objet anonyme
        $geometry = new stdClass; // objet anonyme
        $geometry->type = "Point";
        $feature->type = "Feature";

        $properties->name = sanitizeString($_POST['nomSalle']);
        $properties->address = sanitizeString($_POST['adresseSalle']);
        $tmp = preg_split("/(\s?,\s?)|(\n|\r)/", sanitizeString($_POST['sportsSalle']));
        $sports = [];
        foreach($tmp as $sport){
            if($sport != "") $sports[] = trim($sport);
        }
        $properties->sports = $sports;
        $position = explode(",", sanitizeString($_POST['posSalle']));
        foreach($position as &$pos) {
            $pos = (float)$pos;
        }
        $geometry->coordinates = [$position[1], $position[0]];
        $feature->properties = $properties;
        $feature->geometry = $geometry;

        // MàJ du fichier geoJson
        if(isset($_POST['idSalle']) && is_int((int)$_POST['idSalle'])){
            // modif d'un feature
            $json->features[$_POST['idSalle']] = $feature;
        }else{
            $json->features[] = $feature;
        }

        saveGeoJson($url, $json);
        unset($_POST); // pour ne pas réafficher les infos dans le formulaire après enregistrement
    }
}

if (isset($_GET['action']) && ($_GET['action']=="modifier" || $_GET['action']=="supprimer")) {
    $features = &$json->features; // & : passe par réf. pour que $json soit bien modifié
    $id = $_GET['id'];
    $name = urldecode($_GET['name']);
    if (isset($features[$id])){
        if ($name == $features[$id]->properties->name){

            switch ($_GET['action']) {
                case 'modifier':
                    $modif['idSalle'] = $id;
                    $modif['nomSalle'] = $features[$id]->properties->name;
                    $modif['adresseSalle'] = $features[$id]->properties->address;
                    $modif['posSalle'] = $features[$id]->geometry->coordinates;
                    $modif['sportsSalle'] = implode("\n", $features[$id]->properties->sports);
                break;
                
                case 'supprimer':
                    unset($features[$id]);
                    $features = array_values($features);// reset keys (sinon ça merde)
                break;
                    
                default:
                break;
            }
            saveGeoJson($url, $json);
        }
    }
}


// Calcul affichage --------------------------------
$listeSalles = "";
// Boucle sur les features
$i = 0;
foreach ($json->features as $feature) {
    $listeSalles .= "<article class=\"salle\">\n";
    $listeSalles .= "<header>\n";
    $listeSalles .= "<a href=\"?action=modifier&amp;name=". urlencode($feature->properties->name). "&amp;id=". $i. "#ajoutSalles\" data-name=\"". $feature->properties->name. "\" class=\"btn\">Modif.</a>\n";
    $listeSalles .= "<a href=\"?action=supprimer&amp;name=". urlencode($feature->properties->name). "&amp;id=". $i. "\" data-name=\"". $feature->properties->name. "\" class=\"btn\">Suppr.</a>\n";
    $listeSalles .= "</header>\n";
    $listeSalles .= "<h2>". $feature->properties->name. "</h2>\n";
    $listeSalles .= "<p>". $feature->properties->address. "</p>\n";
    $listeSalles .= "<ul>";
    foreach ($feature->properties->sports as $sport){
        $listeSalles .= "<li class=\"btn\">". $sport. "</li>";
    }
    $listeSalles .= "</ul>\n";
    $listeSalles .= "</article>\n";
    $i++;
}

include_once("admin.html");