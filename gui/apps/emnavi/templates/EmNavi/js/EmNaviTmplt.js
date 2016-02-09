/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: EmNaviTmplt.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: awoodhc
 Date: 06.28.2012
 __________________________________________________________________________

 Description: IHU GUI Template for Embedded Navigation

 Revisions:
 v0.1 - (28-June-2012) Created EmNaviTmplt for punching a hole in the screen
 __________________________________________________________________________

 */

log.addSrcFile("EmNaviTmplt.js", "emnavi");

/*
 * =========================
 * Constructor
 * =========================
 */
function EmNaviTmplt(uiaId, parentDiv, templateID, controlProperties)
{
    this.divElt = null;
    this.templateName = "EmNaviTmplt";

    this.onScreenClass = "EmNaviTmplt";

    log.debug("  templateID in EmNaviTmplt constructor: " + templateID);

    //@formatter:off
    //set the template properties
    this.properties = {
        "statusBarVisible" : true,
        "leftButtonVisible" : false,
        "hasActivePanel" : false,
        "isDialog" : false,
        "customBgImage" : "none",
    };
    //@formatter:on

    // create the div for template
    this.divElt = document.createElement('div');
    this.divElt.id = templateID;
    this.divElt.className = "EmNaviTmplt";


    parentDiv.appendChild(this.divElt);

    var nowPlayingInfoProperties = controlProperties.NowPlayingInfoCtrl;

    this.nowPlayingInfoCtrl = framework.instantiateControl(uiaId, this.divElt, "NowPlayingInfoCtrl", nowPlayingInfoProperties);
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
EmNaviTmplt.prototype.handleControllerEvent = function(eventID)
{
    log.debug("handleController() called, eventID: " + eventID);

}
/*
 * Called by the app during templateNoLongerDisplayed. Used to perform garbage collection procedures on the template and
 * its controls.
 */
EmNaviTmplt.prototype.cleanUp = function()
{
    
}

framework.registerTmpltLoaded("EmNaviTmplt", ["apps/emnavi/controls/NowPlayingInfo"]);
