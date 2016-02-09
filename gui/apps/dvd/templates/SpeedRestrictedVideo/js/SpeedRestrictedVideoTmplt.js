/**
 * @author Brandon Gohsman
 */

log.addSrcFile("SpeedRestrictedVideoTmplt.js", "common");
//log.addSrcFile("SpeedRestrictedVideoTmplt.js", "SpeedRestrictedVideoTmplt");
//log.setLogLevel("SpeedRestrictedVideoTmplt", "debug");

// SpeedRestrictedVideoTmplt constructor
function SpeedRestrictedVideoTmplt(uiaId, parentDiv, templateId, controlProperties)
{
    this.divElt = null;
    this.speedRestrictedVideoCtrl = null;
    this.templateName = "SpeedRestrictedVideoTmplt";

    this.onScreenClass = "TemplateWithStatus";
    this.offScreenLeftClass = "TemplateWithStatus-OffscreenLeft ";
    this.offScreenRightClass = "TemplateWithStatus-OffscreenRight";

    log.debug("  templateId in SpeedRestrictedVideoTmplt constructor: " + templateId);

    //@formatter:off
    //set the template properties
    this.properties = {
    	"statusBarVisible" : true,
    	"leftButtonVisible" : false,
    	"hasActivePanel" : false,
    	"isDialog" : false,
    	"customBgImage" : "common/images/FullTransparent.png",
    };
    //@formatter:on

    // create the div for template
    this.divElt = document.createElement('div');
    this.divElt.id = templateId;
    this.divElt.className = "TemplateWithStatus";


    parentDiv.appendChild(this.divElt);

    var speedRestricredVideoProperties = controlProperties['SpeedRestrictedVideoCtrl'];

    this.speedRestrictedVideoCtrl = framework.instantiateControl(uiaId, this.divElt, "SpeedRestrictedVideoCtrl", speedRestricredVideoProperties);

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
SpeedRestrictedVideoTmplt.prototype.handleControllerEvent = function(eventId)
{
    log.debug("SpeedRestrictedVideoTmplt: handleControllerEvent() ", eventId);

    // Route the event to the focused control
    if (this.speedRestrictedVideoCtrl)
    {
        // Route the event to the focused control
        var response = this.speedRestrictedVideoCtrl.handleControllerEvent(eventId);
        return response;
    }
};

SpeedRestrictedVideoTmplt.prototype.getContextCapture = function()
{
    log.debug("SpeedRestrictedVideoTmplt: getContextCapture() called...");

    // Delegate to the NowPlaying control
    var templateContextCapture = this.speedRestrictedVideoCtrl.getContextCapture();
    return templateContextCapture;
};

SpeedRestrictedVideoTmplt.prototype.restoreContext = function(templateContextCapture)
{
    log.debug("SpeedRestrictedVideoTmplt: restoreContext() called: ", templateContextCapture);

    this.speedRestrictedVideoCtrl.restoreContext(templateContextCapture);
};

SpeedRestrictedVideoTmplt.prototype.finishPartialActivity = function()
{
    log.debug("SpeedRestrictedVideoTmplt: finishPartialActivity() called...");

    this.speedRestrictedVideoCtrl.finishPartialActivity();
};

/*
 * @return the embedded Ump control
 */
SpeedRestrictedVideoTmplt.prototype.getUmpCtrl = function()
{
    if (this.speedRestrictedVideoCtrl)
    {
        return this.speedRestrictedVideoCtrl.umpCtrl;
    }
    return null;
};

/*
 * Called by GUI_COMMON when user activity is detected (automatically showing the UMP)
 * for templates where the "displaySbUmpByActivity" property is true
 */
SpeedRestrictedVideoTmplt.prototype.onActivityShowing = function(delay_ms, duration_ms)
{
    log.debug("SpeedRestrictedVideoTmplt onActivityShowing() called");
    if (this.speedRestrictedVideoCtrl &&
        this.speedRestrictedVideoCtrl.umpCtrl)
    {
        this.speedRestrictedVideoCtrl.umpCtrl.transitionSlide(delay_ms, duration_ms, "up");
    }
};

/*
 * Called by GUI_COMMON when user inactivity is detected (automatically hiding the UMP)
 * for templates where the "displaySbUmpByActivity" property is true
 */
SpeedRestrictedVideoTmplt.prototype.onActivityHiding = function(delay_ms, duration_ms)
{
    log.debug("SpeedRestrictedVideoTmplt onActivityHiding() called");
    if (this.speedRestrictedVideoCtrl &&
        this.speedRestrictedVideoCtrl.umpCtrl)
    {
        this.speedRestrictedVideoCtrl.umpCtrl.transitionSlide(delay_ms, duration_ms, "down");
    }
};

/*
 * Called by the app during templateNoLongerDisplayed. Used to perform garbage collection procedures on the template and
 * its controls.
 */
SpeedRestrictedVideoTmplt.prototype.cleanUp = function()
{
    log.debug("SpeedRestrictedVideoTmplt: cleanUp() called...");

    this.speedRestrictedVideoCtrl.cleanUp();
};

framework.registerTmpltLoaded("SpeedRestrictedVideoTmplt", ["apps/dvd/controls/SpeedRestrictedVideo", "common/controls/Ump3", "common/controls/Slider", "common/controls/Button"]);
