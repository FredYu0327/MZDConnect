/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: TestTmplt.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: avorotp
 Date: 06.25.2012
 __________________________________________________________________________

 Description: IHU GUI Template with Test, LeftBtn, and StatusBar

 Revisions:
 v0.1 - (25-June-2012)
 __________________________________________________________________________

 */

log.addSrcFile("TestTmplt.js", "common");

/*
 * =========================
 * Constructor
 * =========================
 */
function TestTmplt(uiaId, parentDiv, templateID, controlProperties)
{
    this.divElt = null;
    this.TestCtrl = null;
    this.templateName = "TestTmplt";

    this.onScreenClass = "TestTemplateWithStatusLeft";
    this.offScreenLeftClass = "TestTemplateWithStatusLeft-OffscreenLeft";
    this.offScreenRightClass = "TestTemplateWithStatusLeft-OffscreenRight";

    log.debug("  templateID in TestTmplt constructor: " + templateID);

    //@formatter:off
    //set the template properties
    this.properties = {
        "statusBarVisible" : false,
        "leftButtonVisible" : false,
        "hasActivePanel" : false,
        "isDialog" : false,
        "customBgImage" : null
    }
    //@formatter:on

    // create the div for template
    this.divElt = document.createElement('div');
    this.divElt.id = templateID;
    this.divElt.className = "TemplateFull";


    parentDiv.appendChild(this.divElt);

    var testProperties = controlProperties.TestCtrl;    

    this.testCtrl = framework.instantiateControl(uiaId, this.divElt, "TestCtrl", testProperties);

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
TestTmplt.prototype.handleControllerEvent = function(eventID)
{
    log.debug("TestTmplt handleController() called, eventID: " + eventID);

    // Route the event to the focused control
    this.testCtrl.handleControllerEvent(eventID);
}
/*
 * Called by the app during templateNoLongerDisplayed. Used to perform garbage collection procedures on the template and
 * its controls.
 */
TestTmplt.prototype.cleanUp = function()
{
    this.testCtrl.cleanUp();
}

framework.registerTmpltLoaded("TestTmplt", ["apps/diag/controls/Test"]);
