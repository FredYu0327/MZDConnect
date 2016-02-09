/*
 Copyright 2013 by Johnson Controls
 __________________________________________________________________________

 Filename: CoordinatesTmplt.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: ayonchn
 Date: 03.22.2013
 __________________________________________________________________________

 Description: IHU GUI Template for Embedded Navigation

 Revisions:
 v0.1 - (13-March-2013) Created CoordinatesTmplt for showing coordinates if Navigation is not available
 __________________________________________________________________________

 */

log.addSrcFile("CoordinatesTmplt.js", "emnavi");

/*
 * =========================
 * Constructor
 * =========================
 */
function CoordinatesTmplt(uiaId, parentDiv, templateID, controlProperties)
{
    this.divElt = null;
    this.templateName = "CoordinatesTmplt";

    this.onScreenClass = "CoordinatesTmplt";

    log.debug("  templateID in CoordinatesTmplt constructor: " + templateID);

    //@formatter:off
    //set the template properties
    this.properties = {
        "statusBarVisible" : true,
        "leftButtonVisible" : true,
        "hasActivePanel" : false,
        "isDialog" : false,
    }
    //@formatter:on

    // create the div for template
    this.divElt = document.createElement('div');
    this.divElt.id = templateID;
    this.divElt.className = "TemplateWithStatusLeft CoordinatesTmplt";


    parentDiv.appendChild(this.divElt);

    var coordinatesProperties = controlProperties.CoordinatesCtrl;

    this.coordinatesCtrl = framework.instantiateControl(uiaId, this.divElt, "CoordinatesCtrl", coordinatesProperties);
}

/*
 * =========================
 * Standard Template API functions
 * =========================
 */

/* (internal - called by the framework)
 * Handles multicontroller events.
 * @param   eventID (string) any of the “Internal event name” values in IHU_GUI_MulticontrollerSimulation.docx (e.g. 'cw',
 * 'ccw', 'select')
 */
CoordinatesTmplt.prototype.handleControllerEvent = function(eventID)
{
    log.debug("handleController() called, eventID: " + eventID);

    // Route the event to the focused control
    var response = this.coordinatesCtrl.handleControllerEvent(eventID);
    return response;
}
/*
 * Called by the app during templateNoLongerDisplayed. Used to perform garbage collection procedures on the template and
 * its controls.
 */
CoordinatesTmplt.prototype.cleanUp = function()
{
    this.coordinatesCtrl.cleanUp();
}

framework.registerTmpltLoaded("CoordinatesTmplt", ["apps/emnavi/controls/Coordinates"]);
