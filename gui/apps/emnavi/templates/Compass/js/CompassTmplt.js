/*
 Copyright 2013 by Johnson Controls
 __________________________________________________________________________

 Filename: CompassTmplt.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: avorotp
 Date: 03-July-2013
 __________________________________________________________________________

 Description: IHU GUI Template for Compass

 Revisions:
 v0.1 - (03-July-2013) Initial version
 v0.2 - (17-Dec-2014) GUI_EMNAVI update arc image for compass control. (SW00153395)
 __________________________________________________________________________

 */

log.addSrcFile("CompassTmplt.js", "emnavi");

/*
 * =========================
 * Constructor
 * =========================
 */
function CompassTmplt(uiaId, parentDiv, templateID, controlProperties)
{
    this.divElt = null;
    this.templateName = "CompassTmplt";

    this.onScreenClass = "CompassTmplt";

    log.debug("  templateID in CompassTmplt constructor: " + templateID);

    //@formatter:off
    //set the template properties
    this.properties = {
        "statusBarVisible" : true,
        "leftButtonVisible" : true,
		"rightChromeVisible" : true,
        "hasActivePanel" : false,
        "isDialog" : false,
    }
    //@formatter:on

    // create the div for template
    this.divElt = document.createElement('div');
    this.divElt.id = templateID;
    this.divElt.className = "TemplateWithStatusLeft CompassTmplt";


    parentDiv.appendChild(this.divElt);

    var compassProperties = controlProperties.CompassCtrl;

    this.compassCtrl = framework.instantiateControl(uiaId, this.divElt, "CompassCtrl", compassProperties);
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
CompassTmplt.prototype.handleControllerEvent = function(eventID)
{
    log.debug("handleController() called, eventID: " + eventID);

    // Route the event to the focused control
    var response = this.compassCtrl.handleControllerEvent(eventID);
    return response;
}
/*
 * Called by the app during templateNoLongerDisplayed. Used to perform garbage collection procedures on the template and
 * its controls.
 */
CompassTmplt.prototype.cleanUp = function()
{
    this.compassCtrl.cleanUp();
}

framework.registerTmpltLoaded("CompassTmplt", ["apps/emnavi/controls/Compass"]);
