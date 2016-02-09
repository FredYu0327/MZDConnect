/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: IdmTmplt.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: atiwarc
 Date: 04-01-2012
 __________________________________________________________________________

 Description: IHU GUI Idm Template
 __________________________________________________________________________

 */

log.addSrcFile("IdmTmplt.js", "IdmTmplt");
//log.setLogLevel("IdmTmplt", "debug");

// IdmTmplt constructor
function IdmTmplt(uiaId, parentDiv, templateId, controlProperties)
{    
    this.divElt = null;
    this.IdmCtrl = null;
    this.templateName = "IdmTmplt";
    
    this.onScreenClass = "TemplateWithEffect";
    this.offScreenLeftClass = "TemplateWithEffect-OffscreenLeft ";
    this.offScreenRightClass = "TemplateWithEffect-OffscreenRight";

    log.info("  templateId in IdmTmplt constructor: " + templateId);

    //@formatter:off
    //set the template properties
    this.properties =
    {
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

    var idmProperties = controlProperties['IdmCtrl'];
    
    this.idmCtrl = framework.instantiateControl(uiaId, this.divElt, "IdmCtrl", idmProperties);
}

/*
 * =========================
 * Standard Template API functions
 * =========================
 */

/* (internal - called by the framework)
 * Handles multicontroller events.
 * @param	eventID	(string) any of the â€œInternal event nameâ€� values in IHU_GUI_MulticontrollerSimulation.docx (e.g. 'cw',
 * 'ccw', 'select')
 */
IdmTmplt.prototype.handleControllerEvent = function(eventID)
{
	log.info("handleControllerEvent event for idm template is called" + eventID);
    // Route the event to the focused control
    if (this.idmCtrl)
    {
    	log.info("handleControllerEvent event for idm template is called inside idmctrl");
        // Route the event to the focused control
        var response = this.idmCtrl.handleControllerEvent(eventID);
        log.info("handleControllerEvent event for idm template is called inside idmctrl response =" + response);
        return response;
    }
};

IdmTmplt.prototype.finishPartialActivity = function()
{
    log.debug("IdmTmplt: finishPartialActivity() called...");
    this.idmCtrl.finishPartialActivity();
};

IdmTmplt.prototype.getContextCapture = function()
{
    log.debug("IdmTmplt: getContextCapture() called...");
    var templateContextCapture = this.idmCtrl.getContextCapture();
    return templateContextCapture;
};

IdmTmplt.prototype.restoreContext = function(templateContextCapture)
{
    log.debug("IdmTmplt: restoreContext() ", templateContextCapture);
    this.idmCtrl.restoreContext(templateContextCapture);
};


/*
 * Called by the app during templateNoLongerDisplayed. Used to perform garbage collection procedures on the template and
 * its controls.
 */
IdmTmplt.prototype.cleanUp = function()
{
	this.idmCtrl.cleanUp();
};

framework.registerTmpltLoaded("IdmTmplt", ["apps/idm/controls/Idm", "common/controls/Ump3", "common/controls/Button"]);
