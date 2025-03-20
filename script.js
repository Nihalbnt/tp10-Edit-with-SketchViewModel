require([
    "esri/config",
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/layers/GraphicsLayer",
    "esri/widgets/Sketch",
    "esri/widgets/Sketch/SketchViewModel"
], function (
    esriConfig,
    Map,
    MapView,
    FeatureLayer,
    GraphicsLayer,
    Sketch,
    SketchViewModel
) {
    esriConfig.apiKey =
      "AAPTxy8BH1VEsoebNVZXo8HurIJbcyg--Z0NSed8P7Wqjib8XaB6ReHxsI9uVRBG4mOQjGo86DS-uaJIhkMBuxeMMH-GAoiwXzENrEPWpPxnbsntw0GAMRqK9iXPTDHlRRHyAptGrpjdyimQml6PYg9APpvW00A45Zv-aUZvOAbaDAgMBpsk3isc9Isf2olkX3QDmhGnhJTD6zwrI01GRT4RStyyFO8epz5bSlSuQNIO3oc5M7A2_RbvNrkEQ-xRQIwtAT1_HNOoAM8o";
       // Création de la couche graphique
    const coucheGraphique = new GraphicsLayer();
   
    const map = new Map({
      basemap: "arcgis-topographic",
     
    });
   
    const view = new MapView({
      map: map,
      center: [-7.62, 33.59],
          zoom: 13,
          container: "viewDiv",
     
    });
    const featureLayer = new FeatureLayer({
        url: "https://services5.arcgis.com/FlfGDAZ77bDVEcE9/arcgis/rest/services/site_acceuil/FeatureServer",
        outFields: ["*"],
 
   
     });
 
  map.add(featureLayer);
 
  const projeBtn = document.getElementById("projeBtn");    
 
    view.ui.add(projeBtn,"bottom-left");
 
    let sketchVmodel;
    view.when(() => {
        // Initialisation du SketchViewModel
        sketchVmodel = new SketchViewModel({
            layer: coucheGraphique,
            view: view
        });
 
        // Gestion de l'événement "create"
        sketchVmodel.on("create", (event) => {
            if (event.state === "complete") {
                coucheGraphique.remove(event.graphic);
                featureLayer.applyEdits({  // Correction : utilisation de featureLayer au lieu de projets
                    addFeatures: [event.graphic]
                }).then((result) => {
                    console.log("Ajout réussi :", result);
                }).catch((error) => {
                    console.error("Erreur lors de l'ajout :", error);
                });
            }
        });
    });
 
    // Gestion du bouton pour dessiner un polygone
    projeBtn.onclick = () => {
        if (sketchVmodel) {
            sketchVmodel.create("polygon");
        } else {
            console.error("SketchViewModel non initialisé.");
        }
    };
 
    // 📌 Suppression d'une entité avec Control + Shift + Click
    view.on("click", (event) => {
        if (event.native.ctrlKey && event.native.shiftKey) {
            view.hitTest(event).then((response) => {
                if (response.results.length > 0) {
                    const result = response.results.find(res => res.graphic.layer === featureLayer);
                    
                    if (result) {
                        const graphic = result.graphic;
                        const objectId = graphic.attributes?.objectId;

                        if (objectId) {
                            featureLayer.applyEdits({
                                deleteFeatures: [{ objectId }]
                            }).then((result) => {
                                console.log("Suppression réussie :", result);
                            }).catch((error) => {
                                console.error("Erreur lors de la suppression :", error);
                            });
                        } else {
                            console.error("L'entité sélectionnée ne possède pas d'objectId.");
                        }
                    } else {
                        console.warn("Aucune entité sélectionnée pour la suppression.");
                    }
                }
            });
        }
    });

});