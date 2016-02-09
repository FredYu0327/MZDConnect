/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: FuelConsumptionTmplt.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: apeter9
 Date: 1-08-2013
 __________________________________________________________________________

 Description: IHU GUI FuelConsumptionCtrl template

 Revisions:
 v0.1 (01-10-2013)  Initial development (apeter9)
__________________________________________________________________________

 */

log.addSrcFile("FuelConsumptionTmplt.js", "common");

// FuelConsumptionTmplt constructor
function FuelConsumptionTmplt(uiaId, parentDiv, templateId, controlProperties)
{    
    this.divElt = null;
    this.fuelConsumptionCtrl = null;
    this.templateName = "FuelConsumptionTmplt";
    
    this.onScreenClass = "TemplateWithStatusLeft";
    this.offScreenLeftClass = "TemplateWithStatus-OffscreenLeft";
    this.offScreenRightClass = "TemplateWithStatus-OffscreenRight";

    log.debug("  templateId in FuelConsumptionTmplt constructor: " + templateId);

    //@formatter:off
    //set the template properties
    this.properties = {
    	"statusBarVisible" : true,
    	"leftButtonVisible" : false,
    	"hasActivePanel" : false,
    	"isDialog" : false,
    	"customBgImage" : null,
    }
    //@formatter:on

    // create the div for template
    this.divElt = document.createElement('div');
    this.divElt.id = templateId;
    this.divElt.className = "TemplateWithStatusLeft";

    parentDiv.appendChild(this.divElt);

    var fuelConsumptionProperties = controlProperties['FuelConsumptionCtrl'];
    
    this.fuelConsumptionCtrl = framework.instantiateControl(uiaId, this.divElt,
                                                            "FuelConsumptionCtrl",
                                                            fuelConsumptionProperties);
}

/*
 * ===============================
 * Standard Template API functions
 * ===============================
 */

/* (internal - called by the framework)
 * Handles multicontroller events.
 * @param	eventID	(string) any of the â€œInternal event nameâ€? values in IHU_GUI_MulticontrollerSimulation.docx (e.g. 'cw',
 * 'ccw', 'select')
 */
FuelConsumptionTmplt.prototype.handleControllerEvent = function(eventID)
{
    // Route the event to the focused control
    if(this.fuelConsumptionCtrl)
    {
        // Route the event to the focused control
        var response = this.fuelConsumptionCtrl.handleControllerEvent(eventID);
        return response;
    }
}

FuelConsumptionTmplt.prototype.finishPartialActivity = function()
{
    log.debug("FuelConsumptionTmplt: finishPartialActivity() called...");
    this.fuelConsumptionCtrl.finishPartialActivity();
}

FuelConsumptionTmplt.prototype.getContextCapture = function()
{
    log.debug("FuelConsumptionTmplt: getContextCapture() called...");
    var templateContextCapture = this.fuelConsumptionCtrl.getContextCapture();
    return templateContextCapture;
}

FuelConsumptionTmplt.prototype.restoreContext = function(templateContextCapture)
{
    log.debug("FuelConsumptionTmplt: restoreContext() ", templateContextCapture);
    this.fuelConsumptionCtrl.restoreContext(templateContextCapture);
}

/*
 * Called by the app during templateNoLongerDisplayed. Used to perform garbage collection procedures on the template and
 * its controls.
 */
FuelConsumptionTmplt.prototype.cleanUp = function()
{
    this.fuelConsumptionCtrl.cleanUp();
}

framework.registerTmpltLoaded("FuelConsumptionTmplt", ["apps/ecoenergy/controls/FuelConsumption", "common/controls/Ump3", "common/controls/Button"]);