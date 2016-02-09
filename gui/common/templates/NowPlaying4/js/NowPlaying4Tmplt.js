/**
 * @author Brandon Gohsman
 */

log.addSrcFile("NowPlaying4Tmplt.js", "common");
//log.addSrcFile("NowPlaying4Tmplt.js", "NowPlaying4Tmplt");
//log.setLogLevel("NowPlaying4Tmplt", "debug");

// NowPlaying4Tmplt constructor
function NowPlaying4Tmplt(uiaId, parentDiv, templateId, controlProperties)
{    
    this.divElt = null;
    this.NowPlaying4Ctrl = null;
    this.templateName = "NowPlaying4Tmplt";
    
    this.onScreenClass = "TemplateWithStatus";
    this.offScreenLeftClass = "TemplateWithStatus-OffscreenLeft ";
    this.offScreenRightClass = "TemplateWithStatus-OffscreenRight";

    log.debug("  templateId in NowPlaying4Tmplt constructor: " + templateId);

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
    this.divElt.id = templateId;
    this.divElt.className = "TemplateWithStatus";


    parentDiv.appendChild(this.divElt);

    var nowPlayingProperties = controlProperties['NowPlayingCtrl'];
    
    this.nowPlaying4Ctrl = framework.instantiateControl(uiaId, this.divElt, "NowPlaying4Ctrl", nowPlayingProperties);

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
NowPlaying4Tmplt.prototype.handleControllerEvent = function(eventId)
{
    log.debug("NowPlaying4Tmplt: handleControllerEvent() ", eventId);

    // Route the event to the focused control
    if (this.nowPlaying4Ctrl)
    {
        // Route the event to the focused control
        var response = this.nowPlaying4Ctrl.handleControllerEvent(eventId);
        return response;
    }
}

NowPlaying4Tmplt.prototype.getContextCapture = function()
{
    log.debug("NowPlaying4Tmplt: getContextCapture() called...");

    // Delegate to the NowPlaying control
    var templateContextCapture = this.nowPlaying4Ctrl.getContextCapture();
    return templateContextCapture;
}

NowPlaying4Tmplt.prototype.restoreContext = function(templateContextCapture)
{
    log.debug("NowPlaying4Tmplt: restoreContext() called: ", templateContextCapture);

    this.nowPlaying4Ctrl.restoreContext(templateContextCapture);
}

NowPlaying4Tmplt.prototype.finishPartialActivity = function()
{
    log.debug("NowPlaying4Tmplt: finishPartialActivity() called...");

    this.nowPlaying4Ctrl.finishPartialActivity();
}

/*
 * @return the embedded Ump control
 */
NowPlaying4Tmplt.prototype.getUmpCtrl = function()
{
    if (this.nowPlaying4Ctrl)
    {
        return this.nowPlaying4Ctrl.umpCtrl;
    }
    return null;
}

/*
 * Called by GUI_COMMON when user activity is detected (automatically showing the UMP)
 * for templates where the "displaySbUmpByActivity" property is true
 */
NowPlaying4Tmplt.prototype.onActivityShowing = function(delay_ms, duration_ms)
{
    log.debug("NowPlaying4Tmplt onActivityShowing() called");
    if (this.nowPlaying4Ctrl &&
        this.nowPlaying4Ctrl.umpCtrl)
    {
        this.nowPlaying4Ctrl.umpCtrl.transitionSlide(delay_ms, duration_ms, "up");
    }
}

/*
 * Called by GUI_COMMON when user inactivity is detected (automatically hiding the UMP)
 * for templates where the "displaySbUmpByActivity" property is true
 */
NowPlaying4Tmplt.prototype.onActivityHiding = function(delay_ms, duration_ms)
{
    log.debug("NowPlaying4Tmplt onActivityHiding() called");
    if (this.nowPlaying4Ctrl &&
        this.nowPlaying4Ctrl.umpCtrl)
    {
        this.nowPlaying4Ctrl.umpCtrl.transitionSlide(delay_ms, duration_ms, "down");
    }
}

/*
 * Called by the app during templateNoLongerDisplayed. Used to perform garbage collection procedures on the template and
 * its controls.
 */
NowPlaying4Tmplt.prototype.cleanUp = function()
{
    log.debug("NowPlaying4Tmplt: cleanUp() called...");
    
    this.nowPlaying4Ctrl.cleanUp();
}

framework.registerTmpltLoaded("NowPlaying4Tmplt", ["common/controls/NowPlaying4", "common/controls/Ump3", "common/controls/Slider", "common/controls/Button"]);
