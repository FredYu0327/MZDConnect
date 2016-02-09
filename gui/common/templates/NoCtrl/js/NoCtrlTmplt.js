/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: NoCtrlTmplt.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: awoodhc
 Date: 06.28.2012
 __________________________________________________________________________

 Description: IHU GUI Template for Embedded Navigation

 Revisions:
 v0.1 - (28-June-2012) Created NoCtrlTmplt for punching a hole in the screen
 __________________________________________________________________________

 */

log.addSrcFile("NoCtrlTmplt.js", "common");

/*
 * =========================
 * Constructor
 * =========================
 */
function NoCtrlTmplt(uiaId, parentDiv, templateID, controlProperties)
{
    this.divElt = null;
    this.templateName = "NoCtrlTmplt";

    log.debug("  templateID in NoCtrlTmplt constructor: " + templateID);

    //@formatter:off
    //set the template properties
    this.properties = {
        "statusBarVisible" : true,
        "leftButtonVisible" : false,
        "hasActivePanel" : false,
        "isDialog" : false,
        "customBgImage" : null
    }
    //@formatter:on

    // create the div for template
    this.divElt = document.createElement('div');
    this.divElt.id = templateID;
    this.divElt.className = "NoCtrlTmplt";


    parentDiv.appendChild(this.divElt);

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
NoCtrlTmplt.prototype.handleControllerEvent = function(eventID)
{
    log.debug("handleController() called, eventID: " + eventID);

}
/*
 * Called by the app during templateNoLongerDisplayed. Used to perform garbage collection procedures on the template and
 * its controls.
 */
NoCtrlTmplt.prototype.cleanUp = function()
{
    
}

framework.registerTmpltLoaded("NoCtrlTmplt");
