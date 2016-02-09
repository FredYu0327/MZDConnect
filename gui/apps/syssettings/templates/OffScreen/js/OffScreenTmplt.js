/*
    Copyright 2012 by Johnson Controls
    __________________________________________________________________________
    
    Filename: OffScreenTmplt.js
    __________________________________________________________________________
    
    Project: JCI-IHU
    Language: EN
    Author: apopoval
    Date: 29.10.2012
    __________________________________________________________________________
    
    Description: IHU GUI Off Screen Template
    
    Revisions:
    v0.1 - Initial Revision    
    __________________________________________________________________________
    
*/

log.addSrcFile("OffScreenTmplt.js", "common");

// OffScreenTmplt constructor
function OffScreenTmplt(uiaId, parentDiv, templateId, controlProperties)
{    
    this.divElt = null;
    this.offScreenCtrl = null;
    this.templateName = "OffScreenTmplt";
    
    this.onScreenClass = "TemplateFull";

    log.debug("  templateId in OffScreenTmplt constructor: " + templateId);

    //@formatter:off
    //set the template properties
    this.properties = {
    	"statusBarVisible" : false,
    	"leftButtonVisible" : false,
    	"hasActivePanel" : false,
    	"isDialog" : false,
    	"customBgImage" : "common/images/FullTransparent.png"
    }
    //@formatter:on

    // create the div for template
    this.divElt = document.createElement('div');
    this.divElt.id = templateId;
    this.divElt.className = "TemplateFull";


    parentDiv.appendChild(this.divElt);
    
    this.offScreenCtrl = framework.instantiateControl(uiaId, this.divElt, "OffScreenCtrl", controlProperties.OffScreenCtrl);

}

/*
 * =========================
 * Standard Template API functions
 * =========================
 */

/* (internal - called by the framework)
 * Handles multicontroller events.
 * @param	eventID	(string) any of the “Internal event name” values in IHU_GUI_MulticontrollerSimulation.docx (e.g. 'cw',
 * 'ccw', 'select')
 */
OffScreenTmplt.prototype.handleControllerEvent = function(eventID)
{
    // Route the event to the focused control
    if (this.offScreenCtrl)
    {
        // Route the event to the focused control
        var response = this.offScreenCtrl.handleControllerEvent(eventID);
        return response;
    }
};
/*
 * Called by the app during templateNoLongerDisplayed. Used to perform garbage collection procedures on the template and
 * its controls.
 */
OffScreenTmplt.prototype.cleanUp = function()
{
    this.offScreenCtrl.cleanUp();
};

framework.registerTmpltLoaded("OffScreenTmplt", ["apps/syssettings/controls/OffScreen"]);
