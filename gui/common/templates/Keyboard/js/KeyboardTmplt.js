/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: KeyboardTmpl.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: ayonchn
 Date: 07.25.2012
 __________________________________________________________________________

 Description: IHU GUI Template with Keyboard, LeftBtn, and StatusBar

 Revisions:
 __________________________________________________________________________

 */

log.addSrcFile("KeyboardTmplt.js", "common");

/*
 * =========================
 * Constructor
 * =========================
 */
function KeyboardTmplt(uiaId, parentDiv, templateID, controlProperties)
{
    this.divElt = null;
    this.KeyboardCtrl = null;
    this.templateName = "KeyboardTmplt";
    
    // this.onScreenClass = "TemplateWithStatus";
    // this.offScreenLeftClass = "TemplateWithStatus-OffscreenLeft ";
    // this.offScreenRightClass = "TemplateWithStatusLeft-OffscreenRight";

    log.debug("  templateID in KeyboardTmplt constructor: " + templateID);

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
    this.divElt.id = templateID;
    this.divElt.className = "TemplateWithStatus";


    parentDiv.appendChild(this.divElt);

    var keyboardProperties = controlProperties.KeyboardCtrl;    

    this.keyboardCtrl = framework.instantiateControl(uiaId, this.divElt, "KeyboardCtrl", keyboardProperties);

}

/*
 * =========================
 * Standard Template API functions
 * =========================
 */

/* (internal - called by the framework)
 * The two following functions handle focus restore.
 * See corresponding function in the control for further details
 */
KeyboardTmplt.prototype.getContextCapture = function()
{
    return this.keyboardCtrl.getContextCapture();
}

KeyboardTmplt.prototype.restoreContext = function(restoreData)
{
    this.keyboardCtrl.restoreContext(restoreData);
}

/* (internal - called by the framework)
 * Handles multicontroller events.
 * @param   eventID (string) any of the �Internal event name� values in IHU_GUI_MulticontrollerSimulation.docx (e.g. 'cw',
 * 'ccw', 'select')
 */
KeyboardTmplt.prototype.handleControllerEvent = function(eventID)
{
    log.debug("KeyboardTmplt handleController() called, eventID: " + eventID);

    // Route the event to the focused control
    this.keyboardCtrl.handleControllerEvent(eventID);
}
/*
 * Called by the app during templateNoLongerDisplayed. Used to perform garbage collection procedures on the template and
 * its controls.
 */
KeyboardTmplt.prototype.cleanUp = function()
{
    this.keyboardCtrl.cleanUp();
}

framework.registerTmpltLoaded("KeyboardTmplt", ["common/controls/Keyboard"]);
