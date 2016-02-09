/*
 Copyright 2013 by Johnson Controls
 __________________________________________________________________________

 Filename: DialPad2Tmplt.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: ayonchn
 Date: 04.16.2013
 __________________________________________________________________________

 Description: IHU GUI Template with DialPad and StatusBar

 Revisions:
 v0.1 - (16-April-2013)
 __________________________________________________________________________

 */

log.addSrcFile("DialPad2Tmplt.js", "common");

/*
 * =========================
 * Constructor
 * =========================
 */
function DialPad2Tmplt(uiaId, parentDiv, templateID, controlProperties)
{
    this.divElt = null;
    this.DialPad2Ctrl = null;
    this.templateName = "DialPad2Tmplt";

    this.onScreenClass = "DialPadTemplateWithStatusLeft";
    this.offScreenLeftClass = "DialPadTemplateWithStatusLeft-OffscreenLeft";
    this.offScreenRightClass = "DialPadTemplateWithStatusLeft-OffscreenRight";

    log.debug("  templateID in DialPad2Tmplt constructor: " + templateID);

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
    this.divElt.id = templateID;
    this.divElt.className = "DialPad2Tmplt TemplateWithStatus";

    if (controlProperties.DialPad2Ctrl.ctrlStyle == "DialpadStyle01")
    {
        this.properties.isDialog = true;
        this.divElt.classList.add("DialPad2Dialog");
        this.divElt.classList.add("DialPad2DialogBkgd");
    }
    else if (controlProperties.DialPad2Ctrl.ctrlStyle == "DialpadStyle03")
    {
        this.properties.isDialog = false; // NOTE: Making dialpad style3 non dialog: SW00153538
        this.divElt.classList.add("DialPad2Dialog");
    }
    else
    {
        // NOTE: DialpadStyle02 is the default style. If the control style is not correct, empty ot null the property will be interpreted as DialpadStyle02
        this.properties.leftButtonVisible = true;
    }

    parentDiv.appendChild(this.divElt);

    var dialPadProperties = controlProperties.DialPad2Ctrl;

    this.dialPad2Ctrl = framework.instantiateControl(uiaId, this.divElt, "DialPad2Ctrl", dialPadProperties);

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
DialPad2Tmplt.prototype.handleControllerEvent = function(eventID)
{
    log.debug("DialPad2Tmplt handleController() called, eventID: " + eventID);

    // Route the event to the focused control
    var response = this.dialPad2Ctrl.handleControllerEvent(eventID);
    return response;
};

/*
 * Capture data
 * @return {void}
 */
DialPad2Tmplt.prototype.getContextCapture = function()
{
    return {
        controlData : this.dialPad2Ctrl.getContextCapture()
    };
};

/**
 * Restore data
 * @param {object} templateContextCapture
 * @return {void}
 */
DialPad2Tmplt.prototype.restoreContext = function(templateContextCapture)
{
    this.dialPad2Ctrl.restoreContext(templateContextCapture.controlData);
};

/*
 * Called by the app during templateNoLongerDisplayed. Used to perform garbage collection procedures on the template and
 * its controls.
 */
DialPad2Tmplt.prototype.cleanUp = function()
{
    this.dialPad2Ctrl.cleanUp();
};

framework.registerTmpltLoaded("DialPad2Tmplt", ["common/controls/DialPad2"]);
