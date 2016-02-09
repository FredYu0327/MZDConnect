/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: MainMenuTmplt.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: awoodhc
 Date: 05.7.2012
 __________________________________________________________________________

 Description: IHU GUI Main Menu Template

 Revisions:
 v0.1 - (7-May-2012)
 __________________________________________________________________________

 */

log.addSrcFile("MainMenuTmplt.js", "system");

/*
 * =========================
 * Constructor
 * =========================
 * MainMenuTmplt for the System Application
 */
function MainMenuTmplt(uiaId, parentDiv, templateID, controlProperties)
{
    log.debug("Instantiating Main Menu Template");
    this.divElt = null;
    this.mainMenuControl = null;
    this.templateName = "MainMenuTmplt";
    this.onScreenClass = "TemplateWithStatus";
    this.offScreenLeftClass = "TemplateWithStatus-OffscreenLeft";
    this.offScreenRightClass = "TemplateWithStatus-OffscreenRight";


    log.debug("  templateID in MainMenuTmplt constructor: " + templateID);

    //@formatter:off
    //set the template properties
    this.properties = {
    	"statusBarVisible" : true,
    	"leftButtonVisible" : false,
    	"hasActivePanel" : false,
    	"isDialog" : false
    }
    //@formatter:on

    // create the div for template
    this.divElt = document.createElement('div');
    this.divElt.id = templateID;
    this.divElt.className = 'TemplateWithStatus';
    this.divElt.classList.add("MainMenuTmplt");
  
    parentDiv.appendChild(this.divElt);

    var mainMenuProperties = controlProperties.MainMenuCtrl;

    this.mainMenuControl = framework.instantiateControl(uiaId, this.divElt, "MainMenuCtrl", mainMenuProperties);

}

/*
 * =========================
 * Standard Template internal functions
 * =========================
 */

/* (internal - called by the framework)
 * Handles multicontroller events.
 * @param	eventID	(string) any of the “Internal event name” values in IHU_GUI_MulticontrollerSimulation.docx (e.g. 'cw',
 * 'ccw', 'select')
 */
MainMenuTmplt.prototype.handleControllerEvent = function(eventId)
{
    log.debug("MainMenuTmplt handleController() called, eventId: " + eventId);

    // Route the event to the focused control
    this.mainMenuControl.handleControllerEvent(eventId);
}

MainMenuTmplt.prototype.startTransitionFrom = function()
{
    if (this.mainMenuControl)
    {
        this.mainMenuControl.startTransitionFrom();
    }
}

MainMenuTmplt.prototype.endTransitionTo = function()
{
    if (this.mainMenuControl)
    {
        this.mainMenuControl.endTransitionTo();
    }
}

MainMenuTmplt.prototype.getContextCapture = function()
{
    var capture = {};
    if (this.mainMenuControl)
    {
        capture.controlContext = this.mainMenuControl.getContextCapture();
    }
    return capture;
}

MainMenuTmplt.prototype.restoreContext = function(templateContextCapture)
{
    if (templateContextCapture && templateContextCapture.controlContext && this.mainMenuControl)
    {
        this.mainMenuControl.restoreContext(templateContextCapture.controlContext);
    }
}

MainMenuTmplt.prototype.finishPartialActivity = function()
{
    if (this.mainMenuControl)
    {
        this.mainMenuControl.finishPartialActivity();
    }
}

/*
 * Called by the app during templateNoLongerDisplayed. Used to perform garbage collection procedures on the template and
 * its controls.
 */
MainMenuTmplt.prototype.cleanUp = function()
{
    this.mainMenuControl.cleanUp();
    delete this.properties;
}

framework.registerTmpltLoaded("MainMenuTmplt", ["apps/system/controls/MainMenu"]);
