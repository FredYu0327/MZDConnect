/*
    Copyright 2012 by Johnson Controls
    __________________________________________________________________________
    
    Filename: ScreenSettings2Tmplt.js
    __________________________________________________________________________
    
    Project: JCI-IHU
    Language: EN
    Author: abrow198
    Date: 11.15.2012
    __________________________________________________________________________
    
    Description: IHU GUI Screen Settings Template (varient 2 - single context)  
    __________________________________________________________________________
    
*/

log.addSrcFile("ScreenSettings2Tmplt.js", "common");

// ScreenSettings2Tmplt constructor
function ScreenSettings2Tmplt(uiaId, parentDiv, templateId, controlProperties)
{    
    this.divElt = null;
    this.screenSettings2Ctrl = null;
    this.templateName = "ScreenSettings2Tmplt";
    
    this.onScreenClass = "TemplateFull";

    log.debug("  templateId in ScreenSettings2Tmplt constructor: " + templateId);

    //@formatter:off
    //set the template properties
    this.properties = {
    	"statusBarVisible" : false,
    	"leftButtonVisible" : false,
    	"hasActivePanel" : false,
    	"isDialog" : false,
    	"customBgImage" : "common/images/FullTransparent.png"
    }
    //@formatter:on

    // create the div for template
    this.divElt = document.createElement('div');
    this.divElt.id = templateId;
    this.divElt.className = "TemplateFull";


    parentDiv.appendChild(this.divElt);
    
    this.screenSettings2Ctrl = framework.instantiateControl(uiaId, this.divElt, "ScreenSettings2Ctrl", controlProperties.ScreenSettings2Ctrl);

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
ScreenSettings2Tmplt.prototype.handleControllerEvent = function(eventID)
{
    // Route the event to the focused control
    if (this.screenSettings2Ctrl)
    {
        // Route the event to the focused control
        var response = this.screenSettings2Ctrl.handleControllerEvent(eventID);
        return response;
    }
};

ScreenSettings2Tmplt.prototype.getContextCapture = function()
{
    return this.screenSettings2Ctrl.getContextCapture();
}
ScreenSettings2Tmplt.prototype.restoreContext = function(restoreData)
{
    this.screenSettings2Ctrl.restoreContext(restoreData);
}

/*
 * (internal) Called by GUI Framework just before a context change occurs.
 * ScreenSettings2 will issue any remaining callbacks before leaving the screen.
 */
ScreenSettings2Tmplt.prototype.finishPartialActivity = function()
{
    this.screenSettings2Ctrl.finishPartialActivity();
}

/*
 * Called by the app during templateNoLongerDisplayed. Used to perform garbage collection procedures on the template and
 * its controls.
 */
ScreenSettings2Tmplt.prototype.cleanUp = function()
{
    this.screenSettings2Ctrl.cleanUp();
};

framework.registerTmpltLoaded("ScreenSettings2Tmplt", ["common/controls/ScreenSettings2", "common/controls/Button", "common/controls/Slider"]);
