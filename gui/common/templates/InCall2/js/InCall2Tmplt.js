/**
 * @author Mike Petersen
 */

log.addSrcFile("InCall2Tmplt.js", "common");

// InCall2Tmplt constructor
function InCall2Tmplt(uiaId, parentDiv, templateId, controlProperties)
{    
    this.divElt = null;
    this.InCall2Ctrl = null;
    this.templateName = "InCall2Tmplt";
    
    this.onScreenClass = "TemplateWithStatus";
    this.offScreenLeftClass = "TemplateWithStatus-OffscreenLeft ";
    this.offScreenRightClass = "TemplateWithStatus-OffscreenRight";

    log.debug("  templateId in InCall2Tmplt constructor: " + templateId);

    //@formatter:off
    //set the template properties
    this.properties = {
    	"statusBarVisible" : true,
    	"leftButtonVisible" : false,
    	"hasActivePanel" : false,
    	"isDialog" : false,
    	"customBgImage" : null
    };
    //@formatter:on

    // create the div for template
    this.divElt = document.createElement('div');
    this.divElt.id = templateId;
    this.divElt.className = "TemplateWithStatus";


    parentDiv.appendChild(this.divElt);

    var inCall2Properties = controlProperties['InCall2Ctrl'];
    
    this.inCall2Ctrl = framework.instantiateControl(uiaId, this.divElt, "InCall2Ctrl", inCall2Properties);

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
InCall2Tmplt.prototype.handleControllerEvent = function(eventID)
{
    // Route the event to the focused control
    if(this.inCall2Ctrl){
        // Route the event to the focused control
        var response = this.inCall2Ctrl.handleControllerEvent(eventID);
        return response;
    }
}

/*
 * Captures the current focus/context information of the control.
 * Called when framework switches the context from this control to another control.
 * The information will be returned in the form of a special object specific to the control.
 * This object will have all the required information to restore focus/context on control and its subcontrols.
 * This object can be used by framework to restore back the focus/context.
 * TAG: public
 * =========================
 * @param {void}
 * @return {templateContextCapture} - object with current focus/context information of the template.
 */
InCall2Tmplt.prototype.getContextCapture = function()
{
    var templateContextCapture =  this.inCall2Ctrl.getContextCapture();
    return templateContextCapture;
}

/*
 * Restores the control with the earlier captured focus/context information which was captured using getContextCapture() function.
 * Called when framework switches back to the previous context from the new context.
 * The information is passed in the same structured object form as returned by getContextCapture() function.
 * This object is the returned value to the last getContextCapture() function.
 * This object will have the required information to restore back to the state when getContextCapture() was called.
 * TAG: public
 * =========================
 * @param {templateContextCapture} - object with previously captured focus/context information of the template
 * @return {void}
 */
InCall2Tmplt.prototype.restoreContext = function(templateContextCapture)
{
    // TODO: Check if focus to be restored on the control or subControl
    // Set the corresponding properties of control and subControl.
    this.inCall2Ctrl.restoreContext(templateContextCapture);
}

/*
 * @return the embedded Ump control
 */
InCall2Tmplt.prototype.getUmpCtrl = function()
{
    if (this.inCall2Ctrl)
    {
        return this.inCall2Ctrl.umpCtrl;
    }
    return null;
}

/*
 * Called by GUI_COMMON when user activity is detected (automatically showing the UMP)
 * for templates where the "displaySbUmpByActivity" property is true
 */
InCall2Tmplt.prototype.onActivityShowing = function(delay_ms, duration_ms)
{
    log.info("InCall2Tmplt onActivityShowing() called");
    if (this.inCall2Ctrl &&
        this.inCall2Ctrl.umpCtrl)
    {
        this.inCall2Ctrl.umpCtrl.transitionSlide(delay_ms, duration_ms, "up");
    }
}

/*
 * Called by GUI_COMMON when user inactivity is detected (automatically hiding the UMP)
 * for templates where the "displaySbUmpByActivity" property is true
 */
InCall2Tmplt.prototype.onActivityHiding = function(delay_ms, duration_ms)
{
    log.info("InCall2Tmplt onActivityHiding() called");
    if (this.inCall2Ctrl &&
        this.inCall2Ctrl.umpCtrl)
    {
        this.inCall2Ctrl.umpCtrl.transitionSlide(delay_ms, duration_ms, "down");
    }
}

/*
 * Called by the app during templateNoLongerDisplayed. Used to perform garbage collection procedures on the template and
 * its controls.
 */
InCall2Tmplt.prototype.cleanUp = function()
{
    this.inCall2Ctrl.cleanUp();
}

framework.registerTmpltLoaded("InCall2Tmplt", ["common/controls/InCall2", "common/controls/Ump3"]);
