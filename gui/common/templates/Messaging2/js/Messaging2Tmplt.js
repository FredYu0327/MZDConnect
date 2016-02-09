/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: Messaging2Tmplt.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: abijweu
 Date: 03.04.2013
 __________________________________________________________________________

 Description: IHU GUI Messaging2 Control template

 Revisions:
 v0.1 (04-March-2013) Created Messaging2 Template
 __________________________________________________________________________

 */

log.addSrcFile("Messaging2Tmplt.js", "common");

// Messaging2Tmplt constructor
function Messaging2Tmplt(uiaId, parentDiv, templateId, controlProperties)
{
    this.divElt = null;                       // (DOM object) Template container
    this.Messaging2Ctrl = null;               // (DOM object) Messaging control used in template
    this.templateName = "Messaging2Tmplt";    // (String) Name of the template

    this.onScreenClass = "TemplateWithStatusLeft";                          // TODO:TBD
    this.offScreenLeftClass = "TemplateWithStatusLeft-OffscreenLeft ";      // TODO:TBD
    this.offScreenRightClass = "TemplateWithStatusLeft-OffscreenRight";     // TODO:TBD

    log.debug("  templateId in Messaging2Tmplt constructor: " + templateId);

    //@formatter:off
    //set the template properties
    this.properties = {
        "statusBarVisible"   : true,    // (Boolean) If true status bar is visible in template, set always true.
        "leftButtonVisible"  : false,   // (Boolean) If true left button is visible in template, set always false.
        "hasActivePanel"     : false,   // (Boolean) If true active pane is visible in template, set always false.
        "isDialog"           : false,   // (Boolean) If true dialog is available in template, set always false.
        "customBgImage"      : null     // (String) Backgound image path
    }
    //@formatter:on

    // create the div for template
    this.divElt           = document.createElement('div');
    this.divElt.id        = templateId;
    this.divElt.className = "TemplateWithStatus";


    parentDiv.appendChild(this.divElt);

    var messaging2Properties = controlProperties['Messaging2Ctrl'];

    this.messaging2Ctrl = framework.instantiateControl(uiaId, this.divElt, "Messaging2Ctrl", messaging2Properties);

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

Messaging2Tmplt.prototype.handleControllerEvent = function(eventID)
{
    // Route the event to the focused control
    if (this.messaging2Ctrl)
    {
        // Route the event to the focused control
        var response = this.messaging2Ctrl.handleControllerEvent(eventID);
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
Messaging2Tmplt.prototype.getContextCapture = function()
{
    // TODO: Check if to capture some template properties/data
    var templateContextCapture = {
        messaging2CtrlContextObj    : this.messaging2Ctrl.getContextCapture()
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
Messaging2Tmplt.prototype.restoreContext = function(templateContextCapture)
{
    // TODO: Check if to set some template properties/data
    this.messaging2Ctrl.restoreContext(templateContextCapture.messaging2CtrlContextObj);
}

/*
 * Called by framework on existing templates at the begining of a context change.
 */
Messaging2Tmplt.prototype.finishPartialActivity = function()
{
    this.messaging2Ctrl.finishPartialActivity();
}

/*
 * @return the embedded Ump control
 */
Messaging2Tmplt.prototype.getUmpCtrl = function()
{
    if (this.messaging2Ctrl)
    {
        return this.messaging2Ctrl._umpCtrl;
    }
    return null;
}

/*
 * Called by GUI_COMMON when user activity is detected (automatically showing the UMP)
 * for templates where the "displaySbUmpByActivity" property is true
 */
Messaging2Tmplt.prototype.onActivityShowing = function(delay_ms, duration_ms)
{
    log.info("Messaging2Tmplt onActivityShowing() called");
    if (this.messaging2Ctrl &&
        this.messaging2Ctrl.umpCtrl)
    {
        this.messaging2Ctrl.umpCtrl.transitionSlide(delay_ms, duration_ms, "up");
    }
}

/*
 * Called by GUI_COMMON when user inactivity is detected (automatically hiding the UMP)
 * for templates where the "displaySbUmpByActivity" property is true
 */
Messaging2Tmplt.prototype.onActivityHiding = function(delay_ms, duration_ms)
{
    log.info("Messaging2Tmplt onActivityHiding() called");
    if (this.messaging2Ctrl &&
        this.messaging2Ctrl.umpCtrl)
    {
        this.messaging2Ctrl.umpCtrl.transitionSlide(delay_ms, duration_ms, "down");
    }
}

/*
 * Called by the app during templateNoLongerDisplayed. Used to perform garbage collection procedures on the template and
 * its controls.
 */
Messaging2Tmplt.prototype.cleanUp = function()
{
    this.messaging2Ctrl.cleanUp();
}

framework.registerTmpltLoaded("Messaging2Tmplt", ["common/controls/Messaging2", "common/controls/Ump3", "common/controls/Button"]);
