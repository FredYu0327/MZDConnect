/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: Dialog3Tmplt.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: agohsmbr
 Date: 12.7.2012
 __________________________________________________________________________

 Description: IHU GUI Template for Dialog3

 Revisions:
 v0.1 - (25-April-2013) Initial Revision
 __________________________________________________________________________

 */

log.addSrcFile("Dialog3Tmplt.js", "common");

// Dialog3Tmplt constructor
function Dialog3Tmplt(uiaId, parentDiv, templateId, properties)
{    
    this.divElt = null;
    this.dialog3Ctrl = null;
    this.templateName = "Dialog3Tmplt";

    log.debug("  templateId in Dialog3Tmplt constructor: " + templateId);

    //@formatter:off
    //set the template properties
    this.properties = {
    	"statusBarVisible" : true,
    	"leftButtonVisible" : true,
    	"hasActivePanel" : false,
    	"isDialog" : true,
    	"customBgImage" : null
    };
    //@formatter:on

    // create the div for template
    this.divElt = document.createElement('div');
    this.divElt.id = templateId;
    if (properties['Dialog3Ctrl'].fullScreen == true)
    {
        this.divElt.className = "TemplateFull Dialog3Tmplt";
        this.properties.statusBarVisible = false;
    }
    else
    {
        this.divElt.className = "TemplateWithStatus Dialog3Tmplt";
        this.properties.statusBarVisible = true;
    }

    // MPP 10/2/2013  SW00131994
    // Remove dialog flag for "style09" (e.g. aha/pandora/stitcher loading screens) to allow
    // updates of the status bar title & domain icon (which only occur for non-dialog transitions)
    if (properties['Dialog3Ctrl'].contentStyle === "style09")
    {
        this.properties.isDialog = false;
    }

    parentDiv.appendChild(this.divElt);

    var dialogProperties = properties['Dialog3Ctrl'];
    
    this.dialog3Ctrl = framework.instantiateControl(uiaId, this.divElt, "Dialog3Ctrl", dialogProperties);

}

/*
 * =========================
 * Standard Template API functions
 * =========================
 */

/* (internal - called by the framework)
 * Handles multicontroller events.
 * @param	eventId	(string) any of the “Internal event name” values in IHU_GUI_MulticontrollerSimulation.docx (e.g. 'cw',
 * 'ccw', 'select')
 */
Dialog3Tmplt.prototype.handleControllerEvent = function(eventId)
{
    // Route the event to the focused control
    if (this.dialog3Ctrl)
    {
        this.dialog3Ctrl.handleControllerEvent(eventId);
    }
}

Dialog3Tmplt.prototype.getContextCapture = function()
{
    log.debug("getContextCapture() called...");

    // Delegate to the NowPlaying control
    var templateContextCapture = this.dialog3Ctrl.getContextCapture();
    return templateContextCapture;
}

Dialog3Tmplt.prototype.restoreContext = function(templateContextCapture)
{
    log.debug("restoreContext() called: ", templateContextCapture);

    this.dialog3Ctrl.restoreContext(templateContextCapture);
}

Dialog3Tmplt.prototype.finishPartialActivity = function()
{
    log.debug("finishPartialActivity() called...");

    this.dialog3Ctrl.finishPartialActivity();
}

/*
 * Called by the app during templateNoLongerDisplayed. Used to perform garbage collection procedures on the template and
 * its controls.
 */
Dialog3Tmplt.prototype.cleanUp = function()
{
    this.dialog3Ctrl.cleanUp();
}

// NOTE: Will soon need to use List2Ctrl
framework.registerTmpltLoaded("Dialog3Tmplt", ["common/controls/Dialog3", "common/controls/Button"]);
