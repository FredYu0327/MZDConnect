/**
 * @author arve
 */

log.addSrcFile("ClockSettings2Tmplt.js", "common");

// ClockSettings2Tmplt constructor
function ClockSettings2Tmplt(uiaId, parentDiv, templateId, controlProperties)
{
    this.divElt              = null;
    this.clockSettings2Ctrl  = null;
    this.templateName        = "ClockSettings2Tmplt";

    this.onScreenClass       = "TemplateWithStatusLeft";
    this.offScreenLeftClass  = "TemplateWithStatus-OffscreenLeft";
    this.offScreenRightClass = "TemplateWithStatus-OffscreenRight";

    log.debug("  templateId in ClockSettings2Tmplt constructor: " + templateId);

    //@formatter:off
    //set the template properties
    this.properties = {
        "statusBarVisible"   : true,
        "leftButtonVisible"  : false,
        "hasActivePanel"     : false,
        "isDialog"           : false,
        "customBgImage"      : null,
    }
    //@formatter:on

    // create the div for template
    this.divElt = document.createElement('div');
    this.divElt.id = templateId;
    this.divElt.className = "TemplateWithStatus";


    parentDiv.appendChild(this.divElt);

    var clockSettingsProperties = controlProperties['ClockSettings2Ctrl'];
    
    this.clockSettings2Ctrl = framework.instantiateControl(uiaId, this.divElt, "ClockSettings2Ctrl", clockSettingsProperties);

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
ClockSettings2Tmplt.prototype.handleControllerEvent = function(eventID)
{
    // Route the event to the focused control
    if(this.clockSettings2Ctrl) 
    {
        // Route the event to the focused control
        var response = this.clockSettings2Ctrl.handleControllerEvent(eventID);
        return response;
    }
}

/**
 * Captures the current focus/context information of the template.
 * Called when framework switches the context from this template to another template.
 * The information will be returned in the form of a special object specific to the template.
 * This object will have all the required information to restore focus/context on template and its controls.
 * This object can be used by framework to restore back the focus/context.
 * TAG: public
 * =========================
 * @param {void}
 * @return {templateContextCapture} - object with current focus/context information of the template.
 */
ClockSettings2Tmplt.prototype.getContextCapture = function()
{
    // TODO: Check if to capture some template properties/data
    var templateContextCapture = {
        clockSettings2CtrlContextObj    : this.clockSettings2Ctrl.getContextCapture()
    };
    return templateContextCapture;
}

/**
 * Restores the control with the earlier captured focus/context information which was captured using getContextCapture() function.
 * Called when framework switches back to the previous context from the new context.
 * The information is passed in the same structured object form as returned by getContextCapture() function.
 * This object is the returned value to the last getContextCapture() function.
 * This object will have the required information to restore back to the state when getContextCapture() was called.
 * TAG: public
 * =========================
 * @param {templateContextCapture} - object with previously captured focus/context information of the control
 * @return {void}
 */
ClockSettings2Tmplt.prototype.restoreContext = function(templateContextCapture)
{
    // TODO: Check if to set some template properties/data
    this.clockSettings2Ctrl.restoreContext(templateContextCapture.clockSettings2CtrlContextObj);
}

/*
 * @return the embedded Ump control
 */
ClockSettings2Tmplt.prototype.getUmpCtrl = function()
{
    if (this.clockSettings2Ctrl)
    {
        return this.clockSettings2Ctrl.umpCtrl;
    }
    return null;
}

/*
 * Called by GUI_COMMON when user activity is detected (automatically showing the UMP)
 * for templates where the "displaySbUmpByActivity" property is true
 */
ClockSettings2Tmplt.prototype.onActivityShowing = function(delay_ms, duration_ms)
{
    log.info("ClockSettings2Tmplt onActivityShowing() called");
    if (this.clockSettings2Ctrl &&
        this.clockSettings2Ctrl.umpCtrl)
    {
        this.clockSettings2Ctrl.umpCtrl.transitionSlide(delay_ms, duration_ms, "up");
    }
}

/*
 * Called by GUI_COMMON when user inactivity is detected (automatically hiding the UMP)
 * for templates where the "displaySbUmpByActivity" property is true
 */
ClockSettings2Tmplt.prototype.onActivityHiding = function(delay_ms, duration_ms)
{
    log.info("ClockSettings2Tmplt onActivityHiding() called");
    if (this.clockSettings2Ctrl &&
        this.clockSettings2Ctrl.umpCtrl)
    {
        this.clockSettings2Ctrl.umpCtrl.transitionSlide(delay_ms, duration_ms, "down");
    }
}

/*
 * Called by the app during templateNoLongerDisplayed. Used to perform garbage collection procedures on the template and
 * its controls.
 */
ClockSettings2Tmplt.prototype.cleanUp = function()
{
    this.clockSettings2Ctrl.cleanUp();
}

framework.registerTmpltLoaded("ClockSettings2Tmplt", ["common/controls/ClockSettings2", "common/controls/Ump3", "common/controls/Button"]);
