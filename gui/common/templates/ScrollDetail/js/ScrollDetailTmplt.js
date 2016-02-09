/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: ScrollDetailTmplt.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: abijweu
 Date: 09.05.2013
 __________________________________________________________________________

 Description: IHU GUI ScrollDetail Control template

 Revisions:
 v0.1 (09-May-2013) Created ScrollDetail Template
 __________________________________________________________________________

 */

log.addSrcFile("ScrollDetailTmplt.js", "common");

// ScrollDetailTmplt constructor
function ScrollDetailTmplt(uiaId, parentDiv, templateId, controlProperties)
{
    this.divElt = null;                         // (DOM object) Template container
    this.ScrollDetailCtrl = null;               // (DOM object) Messaging control used in template
    this.templateName = "ScrollDetailTmplt";    // (String) Name of the template

    this.onScreenClass = "TemplateWithStatusLeft";
    this.slideOutLeftClass = "TemplateWithStatusLeft-SlideOutLeftClass";
    this.slideInRightClass = "TemplateWithStatusLeft-SlideInRightClass";
    this.slideInLeftClass = "TemplateWithStatusLeft-SlideInLeftClass";
    this.slideOutRightClass = "TemplateWithStatusLeft-SlideOutRightClass";


    log.debug("  templateId in ScrollDetailTmplt constructor: " + templateId);

    //@formatter:off
    //set the template properties
    this.properties = {
        "statusBarVisible"   : true,    // (Boolean) If true status bar is visible in template, set always true.
        "leftButtonVisible"  : true,    // (Boolean) If true left button is visible in template, set always true.
        "rightChromeVisible" : true,    // (Boolean) If true right chrome is visible in template, set always true.
        "hasActivePanel"     : false,   // (Boolean) If true active pane is visible in template, set always false.
        "isDialog"           : false,   // (Boolean) If true dialog is available in template, set always false.
        "customBgImage"      : null     // (String) Backgound image path
    }
    //@formatter:on

    // create the div for template
    this.divElt           = document.createElement('div');
    this.divElt.id        = templateId;
    this.divElt.className = "TemplateWithStatusLeft ScrollDetailTmplt";


    parentDiv.appendChild(this.divElt);

    var scrollDetailProperties = controlProperties['ScrollDetailCtrl'];

    this.scrollDetailCtrl = framework.instantiateControl(uiaId, this.divElt, "ScrollDetailCtrl", scrollDetailProperties);

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

ScrollDetailTmplt.prototype.handleControllerEvent = function(eventID)
{
    // Route the event to the focused control
    if (this.scrollDetailCtrl)
    {
        // Route the event to the focused control
        var response = this.scrollDetailCtrl.handleControllerEvent(eventID);
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
ScrollDetailTmplt.prototype.getContextCapture = function()
{
    var templateContextCapture = {
        scrollDetailCtrlContextObj    : this.scrollDetailCtrl.getContextCapture()
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
ScrollDetailTmplt.prototype.restoreContext = function(templateContextCapture)
{
    this.scrollDetailCtrl.restoreContext(templateContextCapture.scrollDetailCtrlContextObj);
}

/*
 * Called by the app during templateNoLongerDisplayed. Used to perform garbage collection procedures on the template and
 * its controls.
 */
ScrollDetailTmplt.prototype.cleanUp = function()
{
    this.scrollDetailCtrl.cleanUp();
}

framework.registerTmpltLoaded("ScrollDetailTmplt", ["common/controls/ScrollDetail", "common/controls/Button"]);
