/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: EcoFlowTmplt.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: atiwarc
 Date: 06-14-2012
 __________________________________________________________________________

 Description: IHU GUI EcoFlow Template
 __________________________________________________________________________

 */

log.addSrcFile("EcoFlowTmplt.js", "EcoFlowTmplt");
log.setLogLevel("EcoFlowTmplt", "debug");

// EcoFlowTmplt constructor
function EcoFlowTmplt(uiaId, parentDiv, templateId, controlProperties)
{    
    this.divElt = null;
    this.EcoStatusCtrl = null;
    this.templateName = "EcoFlowTmplt";
    
    this.onScreenClass = "TemplateWithStatus";
    this.offScreenLeftClass = "TemplateWithStatus-OffscreenLeft ";
    this.offScreenRightClass = "TemplateWithStatus-OffscreenRight";

    log.debug(" templateId in EcoFlowTmplt constructor: " + templateId);

    //@formatter:off
    //set the template properties
    this.properties =
    {
    	"statusBarVisible" : true,
    	"leftButtonVisible" : false,
    	"hasActivePanel" : false,
    	"isDialog" : false,
    	"customBgImage" : null
    }
    //@formatter:on

    // create the div for template
    this.divElt = document.createElement('div');
    this.divElt.id = templateId;
    this.divElt.className = "TemplateWithStatus";

    parentDiv.appendChild(this.divElt);

    var ecoFlowProperties = controlProperties['EcoFlowCtrl'];
    
    this.ecoFlowCtrl = framework.instantiateControl(uiaId, this.divElt, "EcoFlowCtrl", ecoFlowProperties);
}

/*
 * =========================
 * Standard Template API functions
 * =========================
 */

/* (internal - called by the framework)
 * Handles multicontroller events.
 */

EcoFlowTmplt.prototype.handleControllerEvent = function(eventID)
{
    // Route the event to the focused control
    if (this.ecoFlowCtrl)
    {
        // Route the event to the focused control
        var response = this.ecoFlowCtrl.handleControllerEvent(eventID);
        return response;
    }
}

EcoFlowTmplt.prototype.finishPartialActivity = function()
{
    log.debug("EcoFlowTmplt: finishPartialActivity() called...");
    this.ecoFlowCtrl.finishPartialActivity();
}

EcoFlowTmplt.prototype.getContextCapture = function()
{
    log.debug("EcoFlowTmplt: getContextCapture() called...");
    var templateContextCapture = this.ecoFlowCtrl.getContextCapture();
    return templateContextCapture;
}

EcoFlowTmplt.prototype.restoreContext = function(templateContextCapture)
{
    log.debug("EcoFlowTmplt: restoreContext() ", templateContextCapture);
    this.ecoFlowCtrl.restoreContext(templateContextCapture);
}


/*
 * Called by the app during templateNoLongerDisplayed. Used to perform garbage collection procedures on the template and
 * its controls.
 */
EcoFlowTmplt.prototype.cleanUp = function()
{
    this.ecoFlowCtrl.cleanUp();
};

framework.registerTmpltLoaded("EcoFlowTmplt", ["apps/ecoenergy/controls/EcoFlow", "common/controls/Ump3", "common/controls/Button"]);