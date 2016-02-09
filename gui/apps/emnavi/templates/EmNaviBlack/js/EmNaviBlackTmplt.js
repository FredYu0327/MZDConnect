/*
 Copyright 2013 by Johnson Controls
 __________________________________________________________________________

 Filename: EmNaviBlackTmplt.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: ayonchn
 Date: 03.13.2013
 __________________________________________________________________________

 Description: IHU GUI Template for Embedded Navigation

 Revisions:
 v0.1 - (13-March-2013) Created EmNaviBlackTmplt for punching a hole in the screen
 __________________________________________________________________________

 */

log.addSrcFile("EmNaviBlackTmplt.js", "emnavi");

/*
 * =========================
 * Constructor
 * =========================
 */
function EmNaviBlackTmplt(uiaId, parentDiv, templateID, controlProperties)
{
    this.divElt = null;
    this.templateName = "EmNaviBlackTmplt";

    this.onScreenClass = "EmNaviBlackTmplt";

    log.debug("  templateID in EmNaviBlackTmplt constructor: " + templateID);

    //@formatter:off
    //set the template properties
    this.properties = {
        "statusBarVisible" : true,
        "leftButtonVisible" : false,
        "hasActivePanel" : false,
        "isDialog" : false,
    }
    //@formatter:on

    // create the div for template
    this.divElt = document.createElement('div');
    this.divElt.id = templateID;
    this.divElt.className = "EmNaviBlackTmplt";


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
EmNaviBlackTmplt.prototype.handleControllerEvent = function(eventID)
{
    log.debug("handleController() called, eventID: " + eventID);

}
/*
 * Called by the app during templateNoLongerDisplayed. Used to perform garbage collection procedures on the template and
 * its controls.
 */
EmNaviBlackTmplt.prototype.cleanUp = function()
{
    
}

framework.registerTmpltLoaded("EmNaviBlackTmplt");
