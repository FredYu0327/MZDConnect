/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: OffScreenCtrl.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: apopoval
 Date: 29.10.2012
 __________________________________________________________________________

 Description: IHU GUI Off Screen Control

 Revisions:
 v0.1 (3-Oct-2012) Created OffScreen Control 
 v0.2 (8-Oct-2012) debug.log changed to log.debug
 v0.3 (26-Mar-2013) Copied and updated control from syssettings (aensinb)
 __________________________________________________________________________

 */

log.addSrcFile("OffScreenCtrl.js", "common");

function OffScreenCtrl(uiaId, parentDiv, controlId, properties)
{  
    log.debug("OffScreenCtrl constructor called...");
	
    this.uiaId = uiaId;
    this.divElt = null;
    this.controlId = controlId;
    
    this.properties = {
        // (Object) - Application data
        "appData" : null,

        // (Function) - Invoked when the user touches the screen or controller.
    	"userActivityCallback" : null,

        // (Boolean) - If true the clock will be displayed. Default is false.
        "showClock" : false
    };
    
    for(var i in properties)
    
{        this.properties[i] = properties[i];
    }

    this._touchHandlerBinder = this._touchHandler.bind(this);

    this._createStructure();    
    parentDiv.appendChild(this.divElt);

    this.updateClock();
};

OffScreenCtrl.prototype._createStructure = function()
{
    this.divElt = document.createElement('div');
    this.divElt.className = "OffScreenCtrl";
    this.divElt.id = this.controlId;

    document.body.addEventListener("mousedown", this._touchHandlerBinder);

    if (this.properties.showClock)
    {
        // Create a clock element and use the CSS class from the StatusBarCtrl to ensure the DisplayOff clock is identical.
        this._clock = document.createElement('div');
        this._clock.className = 'StatusBarCtrlClock';
        this.divElt.appendChild(this._clock);
    }
};

OffScreenCtrl.prototype._touchHandler = function(evt)
{
    this._invokeUserActivityCallback();
};

OffScreenCtrl.prototype._invokeUserActivityCallback = function()
{
    if (this.properties.userActivityCallback != null)
    {
        this.properties.userActivityCallback(this, this.properties.appData, {});
    }
}

/*
 * Update the clock displayed based on the status bar's clock
 */
OffScreenCtrl.prototype.updateClock = function()
{
    if (this.properties.showClock)
    {
        // Copy contents of StatusBarCtrl clock to ensure the DisplayOff clock is identical.
        this._clock.innerHTML = framework.common.statusBar.clock.innerHTML;
    }
}

OffScreenCtrl.prototype.handleControllerEvent = function(eventId)
{
    /*
     * returns
     * - giveFocusLeft (control retains highlight unless it later gets lostFocus event)
     * - giveFocusRight
     * - giveFocusUp
     * - giveFocusDown
     * - consumed (always returned on select event, and if control adjusted highlight)
     * - ignored (returned only if control doesn't know about focus)
     */
    var response = "ignored";
    switch (eventId)
    {
        // Ignore these controller events.
        case "select":
        case "left":
        case "right":
        case "up":
        case "down":
            break;

        // Invoke user activity callback for these controller events.
        case "cw":
        case "ccw":
        case "selectStart":
        case "leftStart":
        case "rightStart":
        case "upStart":
        case "downStart":
            response = "consumed";
            this._invokeUserActivityCallback();
            break;
    }
    return response;
};

OffScreenCtrl.prototype.cleanUp = function()
{
    log.debug("OffScreenCtrl Cleanup called.");

    document.body.removeEventListener("mousedown", this._touchHandlerBinder);
};

// tell framework that the control has finished loading
framework.registerCtrlLoaded("OffScreenCtrl"); 