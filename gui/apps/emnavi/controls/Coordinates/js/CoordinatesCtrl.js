/*
 Copyright 2013 by Johnson Controls
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: ayonchn
 Date: 22-March-2013
 __________________________________________________________________________

 Description: IHU GUI Coordinates Control
 Revisions:
 v0.1 (22-March-2013) - create basic control for showing coordinates. NOTE: Not following any Studio design because there isn't.
 __________________________________________________________________________

 */

log.addSrcFile("CoordinatesCtrl.js", "common");

/*
 * =========================
 * Constructor
 * =========================
 * Coordinates control is showing current location (latitutde, longitude and altitutde/elevation)
 */
function CoordinatesCtrl(uiaId, parentDiv, ctrlId, properties)
{
    
    /*This is the constructor of the CoordinatesCtrl Component
     Create, set dimensions and assign default name*/

    this.id = ctrlId;
    this.divElt = null;
    this.uiaId = null;
    this.parentDiv = null;
    
    //@formatter:off
    this.properties = {
        "latitude": "---",
        "longitude": "---",
        "elevation": "---",
        "additionalText": "",
        "additionalTextId": "",
        "additionalTextSubMap": null,
    };
    //@formatter:on
    for (var i in properties)
    {
       this.properties[i] = properties[i];
    }

    // set control's properties
    this.id = ctrlId;            // control's id
    this.parentDiv = parentDiv;    // control's immediate parent DOM element
    this.uiaId = uiaId;            // uiaId of the owning app
    log.debug("Coordinates Control constructor called with uiaId " + this.uiaId);
    this._latitude = null;
    this._longitude = null;
    this._elevation = null;
    
    // initialize
    this.init();
    
}

/*
 * =========================
 * Control's init
 * =========================
 */

CoordinatesCtrl.prototype.init = function() 
{
    /* CREATE ELEMENTS */
    
    // create control's container
    this.divElt = document.createElement('div');
    this.divElt.id = this.id;
    this.divElt.className = 'CoordinatesCtrl';
    
    this._titleId = "YourLocation";
    this._ctrlLatitude = null;
    this._ctrlLongitude = null;
    this._ctrlElevation = null;
    this._ctrlAdditionalText = null;
    
    this._createTitle();
    this._createLocation();
    this._createElevation();
    this._createAdditionalText();
    
    // Add it to the DOM
    this.parentDiv.appendChild(this.divElt);
}

CoordinatesCtrl.prototype._createTitle = function ()
{
    var ctrlTitle = document.createElement("div");
    ctrlTitle.className = "CoordinatesCtrlTitle";
    ctrlTitle.appendChild(document.createTextNode(framework.localize.getLocStr(this.uiaId, this._titleId)));
    this.divElt.appendChild(ctrlTitle);
}

CoordinatesCtrl.prototype._createLocation = function ()
{
    var locationWrapper = document.createElement("div");
    locationWrapper.classList.add("latLongContainer");
    this._createLatitude(locationWrapper);
    this._createLongitude(locationWrapper);
    this.divElt.appendChild(locationWrapper);
}

CoordinatesCtrl.prototype._createLatitude = function (wrapper)
{
    var latitudeTitle = document.createElement("div");
    latitudeTitle.className = "latitudeTitle";
    latitudeTitle.appendChild(document.createTextNode(framework.localize.getLocStr(this.uiaId, "Latitude")));
    wrapper.appendChild(latitudeTitle);
    
    this._ctrlLatitude = document.createElement("div");
    this._ctrlLatitude.className = "latitudeValue";
    this._ctrlLatitude.innerText = this.properties.latitude;
    wrapper.appendChild(this._ctrlLatitude);
}

CoordinatesCtrl.prototype._createLongitude = function (wrapper)
{
    var longitudeTitle = document.createElement("div");
    longitudeTitle.className = "longitudeTitle";
    longitudeTitle.appendChild(document.createTextNode(framework.localize.getLocStr(this.uiaId, "Longitude")));
    wrapper.appendChild(longitudeTitle);
    
    this._ctrlLongitude = document.createElement("div");
    this._ctrlLongitude.className = "longitudeValue";
    this._ctrlLongitude.innerText = this.properties.longitude;
    wrapper.appendChild(this._ctrlLongitude);
}

CoordinatesCtrl.prototype._createElevation = function ()
{
    var elevationWrapper = document.createElement("div");
    elevationWrapper.className = "elevationContainer";
    
    var elevationTitle = document.createElement("dvi");
    elevationTitle.className = "elevationTitle";
    elevationTitle.appendChild(document.createTextNode(framework.localize.getLocStr(this.uiaId, "Elevation")));
    elevationWrapper.appendChild(elevationTitle);
    
    this._ctrlElevation = document.createElement("div");
    this._ctrlElevation.className = "elevationValue";
    this._ctrlElevation.innerText = this.properties.elevation;
    elevationWrapper.appendChild(this._ctrlElevation);
    
    this.divElt.appendChild(elevationWrapper);
}

CoordinatesCtrl.prototype._createAdditionalText = function ()
{
    this._ctrlAdditionalText = document.createElement("div");
    this._ctrlAdditionalText.className = "additionalText";
    if (this.properties.additionalTextId)
    {
        this._ctrlAdditionalText.innerText = framework.localize.getLocStr(this.uiaId, this.properties.additionalTextId);
    }
    else if (this.properties.additionalText)
    {
        this._ctrlAdditionalText.innerText = this.properties.additionalText;
    }
    
    this.divElt.appendChild(this._ctrlAdditionalText);
}

/*
 * =========================
 * Public APIs
 * =========================
 */
CoordinatesCtrl.prototype.setLatitude = function (latValue)
{
    this._ctrlLatitude.innerText = latValue;
}

CoordinatesCtrl.prototype.setLatitudeId = function (latValue, latSubMap)
{
    this._ctrlLatitude.innerText = framework.localize.getLocStr(this.uiaId, latValue, latSubMap);
}

CoordinatesCtrl.prototype.setLongitude = function (lonValue)
{
    this._ctrlLongitude.innerText = lonValue;
}

CoordinatesCtrl.prototype.setLongitudeId = function (lonValue, lonSubMap)
{
    this._ctrlLongitude.innerText = framework.localize.getLocStr(this.uiaId, lonValue, lonSubMap);
}

CoordinatesCtrl.prototype.setElevation = function (eleValue)
{
    this._ctrlElevation.innerText = eleValue;
}

CoordinatesCtrl.prototype.setElevationId = function (eleValue, eleSubMap)
{
    this._ctrlElevation.innerText = framework.localize.getLocStr(this.uiaId, eleValue, eleSubMap);
}

CoordinatesCtrl.prototype.setAditionalText = function (additionalText)
{
    this._ctrlAdditionalText.innerText = additionalText;
}

CoordinatesCtrl.prototype.setAditionalTextId = function (additionalTextId, additionalTextSubMap)
{
    this._ctrlAdditionalText.innerText = framework.localize.getLocStr(this.uiaId, additionalTextId, additionalTextSubMap);
}

/* 
 * =========================
 * MULTICONTROLLER 
 * ========================= 
 */
CoordinatesCtrl.prototype.handleControllerEvent = function(eventID) 
{
    log.debug("CoordinatesCtrl: handleController() called, eventID: " + eventID);
    
    return "giveFocusLeft";
};

/*
 * =========================
 * GARBAGE COLLECTION
 * =========================
 */

CoordinatesCtrl.prototype.cleanUp = function()
{
    // No event listeners
}

// Register Loaded with Framework
framework.registerCtrlLoaded('CoordinatesCtrl');
