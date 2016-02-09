/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: EcoEffectTmplt.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: abrow198
 Date: 12-03-2012
 __________________________________________________________________________

 Description: IHU GUI EcoEffect Template
 __________________________________________________________________________

 */

log.addSrcFile("EcoEffectTmplt.js", "EcoEffectTmplt");
log.setLogLevel("EcoEffectTmplt", "debug");

// EcoEffectTmplt constructor
function EcoEffectTmplt(uiaId, parentDiv, templateId, controlProperties)
{    
    this.divElt = null;
    this.EcoEffectCtrl = null;
    this.templateName = "EcoEffectTmplt";
    
    this.onScreenClass = "TemplateWithEffect";
    this.offScreenLeftClass = "TemplateWithEffect-OffscreenLeft ";
    this.offScreenRightClass = "TemplateWithEffect-OffscreenRight";

    log.debug("  templateId in EcoEffectTmplt constructor: " + templateId);

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

    var ecoEffectProperties = controlProperties['EcoEffectCtrl'];
    
    this.ecoEffectCtrl = framework.instantiateControl(uiaId, this.divElt, "EcoEffectCtrl", ecoEffectProperties);
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
EcoEffectTmplt.prototype.handleControllerEvent = function(eventID)
{
    // Route the event to the focused control
    if (this.ecoEffectCtrl)
    {
        // Route the event to the focused control
        var response = this.ecoEffectCtrl.handleControllerEvent(eventID);
        return response;
    }
}

EcoEffectTmplt.prototype.finishPartialActivity = function()
{
    log.debug("EcoEffectTmplt: finishPartialActivity() called...");
    this.ecoEffectCtrl.finishPartialActivity();
}

EcoEffectTmplt.prototype.getContextCapture = function()
{
    log.debug("EcoEffectTmplt: getContextCapture() called...");
    var templateContextCapture = this.ecoEffectCtrl.getContextCapture();
    return templateContextCapture;
}

EcoEffectTmplt.prototype.restoreContext = function(templateContextCapture)
{
    log.debug("EcoEffectTmplt: restoreContext() ", templateContextCapture);
    this.ecoEffectCtrl.restoreContext(templateContextCapture);
}

/*
 * Called by the app during templateNoLongerDisplayed. Used to perform garbage collection procedures on the template and
 * its controls.
 */
EcoEffectTmplt.prototype.cleanUp = function()
{
    this.ecoEffectCtrl.cleanUp();
}

framework.registerTmpltLoaded("EcoEffectTmplt", ["apps/ecoenergy/controls/EcoEffect", "common/controls/Ump3", "common/controls/Button"]);
