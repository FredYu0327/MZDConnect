/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: EcoStatusTmplt.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: abrow198
 Date: 12-03-2012
 __________________________________________________________________________

 Description: IHU GUI EcoStatus Template
 __________________________________________________________________________

 */

log.addSrcFile("EcoStatusTmplt.js", "EcoStatusTmplt");
log.setLogLevel("EcoStatusTmplt", "debug");

// EcoStatusTmplt constructor
function EcoStatusTmplt(uiaId, parentDiv, templateId, controlProperties)
{    
    this.divElt = null;
    this.EcoStatusCtrl = null;
    this.templateName = "EcoStatusTmplt";
    
    this.onScreenClass = "TemplateWithStatus";
    this.offScreenLeftClass = "TemplateWithStatus-OffscreenLeft ";
    this.offScreenRightClass = "TemplateWithStatus-OffscreenRight";

    log.debug("  templateId in EcoStatusTmplt constructor: " + templateId);

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

    var ecoStatusProperties = controlProperties['EcoStatusCtrl'];
    
    this.ecoStatusCtrl = framework.instantiateControl(uiaId, this.divElt, "EcoStatusCtrl", ecoStatusProperties);
}

/*
 * =========================
 * Standard Template API functions
 * =========================
 */

/* (internal - called by the framework)
 * Handles multicontroller events.
 * @param	eventID	(string) any of the â€œInternal event nameâ€? values in IHU_GUI_MulticontrollerSimulation.docx (e.g. 'cw',
 * 'ccw', 'select')
 */
EcoStatusTmplt.prototype.handleControllerEvent = function(eventID)
{
    // Route the event to the focused control
    if (this.ecoStatusCtrl)
    {
        // Route the event to the focused control
        var response = this.ecoStatusCtrl.handleControllerEvent(eventID);
        return response;
    }
}

EcoStatusTmplt.prototype.finishPartialActivity = function()
{
    log.debug("EcoEffectTmplt: finishPartialActivity() called...");
    this.ecoStatusCtrl.finishPartialActivity();
}

EcoStatusTmplt.prototype.getContextCapture = function()
{
    log.debug("EcoEffectTmplt: getContextCapture() called...");
    var templateContextCapture = this.ecoStatusCtrl.getContextCapture();
    return templateContextCapture;
}

EcoStatusTmplt.prototype.restoreContext = function(templateContextCapture)
{
    log.debug("EcoStatusTmplt: restoreContext() ", templateContextCapture);
    this.ecoStatusCtrl.restoreContext(templateContextCapture);
}


/*
 * Called by the app during templateNoLongerDisplayed. Used to perform garbage collection procedures on the template and
 * its controls.
 */
EcoStatusTmplt.prototype.cleanUp = function()
{
    this.ecoStatusCtrl.cleanUp();
};

framework.registerTmpltLoaded("EcoStatusTmplt", ["apps/ecoenergy/controls/EcoStatus", "common/controls/Ump3", "common/controls/Button"]);
