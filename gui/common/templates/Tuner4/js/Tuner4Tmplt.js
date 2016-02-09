/**
 * @author Brandon Gohsman
 * @author Brian Ensink (briane@spindance.com)
 * @author Mike Petersen (mikep@spindance.com)
 */

log.addSrcFile("Tuner4Tmplt.js", "common");

// Tuner4Tmplt constructor
function Tuner4Tmplt(uiaId, parentDiv, templateId, controlProperties)
{    
    this.divElt = null;
    this.Tuner4Ctrl = null;
    this.templateName = "Tuner4Tmplt";

    this.onScreenClass = "TemplateWithStatus";
    this.slideOutLeftClass = "TemplateWithStatus-SlideOutLeftClass";
    this.slideInRightClass = "TemplateWithStatus-SlideInRightClass";
    this.slideInLeftClass = "TemplateWithStatus-SlideInLeftClass";
    this.slideOutRightClass = "TemplateWithStatus-SlideOutRightClass";

    log.debug("  templateId in Tuner4Tmplt constructor: " + templateId);

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
    this.divElt.id = templateId;
    this.divElt.className = "TemplateWithStatus";


    parentDiv.appendChild(this.divElt);

    var tunerProperties = controlProperties['Tuner4Ctrl'];
    
    this.tuner4Ctrl = framework.instantiateControl(uiaId, this.divElt, "Tuner4Ctrl", tunerProperties);

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
Tuner4Tmplt.prototype.handleControllerEvent = function(eventID)
{
    log.debug(" Tuner4Tmplt.prototype.handleControllerEvent " + eventID);
    
    // Route the event to the focused control
    if(this.tuner4Ctrl){
        // Route the event to the focused control
        var response = this.tuner4Ctrl.handleControllerEvent(eventID);
        return response;
    }
}

Tuner4Tmplt.prototype.getContextCapture = function()
{
    var capture = {};
    if (this.tuner4Ctrl)
    {
        capture.controlContext = this.tuner4Ctrl.getContextCapture();
    }
    return capture;
}

Tuner4Tmplt.prototype.restoreContext = function(templateContextCapture)
{
    if (templateContextCapture && templateContextCapture.controlContext && this.tuner4Ctrl)
    {
        this.tuner4Ctrl.restoreContext(templateContextCapture.controlContext);
    }
}

Tuner4Tmplt.prototype.finishPartialActivity = function()
{
    if (this.tuner4Ctrl)
    {
        this.tuner4Ctrl.finishPartialActivity();
    }
}

/*
 * Called by the app during templateNoLongerDisplayed. Used to perform garbage collection procedures on the template and
 * its controls.
 */
Tuner4Tmplt.prototype.cleanUp = function()
{
    this.tuner4Ctrl.cleanUp();
}

framework.registerTmpltLoaded("Tuner4Tmplt", ["common/controls/Tuner4", "common/controls/Button"]);
