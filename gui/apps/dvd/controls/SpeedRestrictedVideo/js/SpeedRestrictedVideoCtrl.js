/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: SpeedRestrictedVideoCtrl.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: apeter9
 Date: 05.01.2013
 __________________________________________________________________________

 Description: IHU GUI SpeedRestrictedVideoCtrl

 Revisions:
 v0.1 (01-May-2013) Initial revision
 __________________________________________________________________________

 */

log.addSrcFile("SpeedRestrictedVideoCtrl.js", "common");
//log.addSrcFile("SpeedRestrictedVideoCtrl.js", "SpeedRestrictedVideoCtrl");
// log.setLogLevel("SpeedRestrictedVideoCtrl", "debug");

function SpeedRestrictedVideoCtrl(uiaId, parentDiv, controlId, properties)
{
    this.uiaId = uiaId;         // (String) UIA ID of the App instantiating this control
    this.controlId = controlId; // (String) ID of this control as assigned by GUIFramework
    this.parentDiv = parentDiv; // (HTMLElement) Reference to the parent div of this control
    this.divElt = null;         // (HTMLElement) Reference to the top level div element of this control

    this.umpCtrl = null;

    //@formatter:off
    this.properties = {
        "text1": null,
        "text1Id": null,
        "text1SubMap": null,
    	"umpConfig": null,
    };
    //@formatter:on

    for (var i in properties)
    {
        this.properties[i] = properties[i];
    }

    this._createStructure();
};

/*
 * ===============================
 * PRIVATE API
 * ===============================
 */
SpeedRestrictedVideoCtrl.prototype._createStructure = function()
{
    // create the div for control
    this.divElt = document.createElement('div');
    this.divElt.classList.add("SpeedRestrictedVideoCtrl");
    this.divElt.classList.add("SpeedRestrictedVideoCtrlBlackBG");
    this.divElt.id = this.controlId;

    // creating warning text area
    this._warningText = document.createElement("div");
    this._warningText.className = "SpeedRestrictedWarning";
    this.divElt.appendChild(this._warningText);

    // creating warning text area
    this._warningTextSpan = document.createElement("span");
    this._setWarningText();
    this._warningText.appendChild(this._warningTextSpan);

    // attach control to parent
    this.parentDiv.appendChild(this.divElt);

    log.debug("Instantiating umpCtrl...");
    this.umpCtrl = framework.instantiateControl(this.uiaId, this.divElt, "Ump3Ctrl", this.properties.umpConfig);
};

SpeedRestrictedVideoCtrl.prototype._setWarningText = function()
{
    if (null != this.properties.text1Id && '' != this.properties.text1Id && undefined != this.properties.text1Id)
    {
        var localizedText = framework.localize.getLocStr(this.uiaId, this.properties.text1Id, this.properties.text1SubMap);
        this._warningTextSpan.appendChild(document.createTextNode(localizedText));
        this.properties.text1 = localizedText;
    }
    else if (null != this.properties.text1 && '' != this.properties.text1 && undefined != this.properties.text1)
    {
        this._warningTextSpan.appendChild(document.createTextNode(this.properties.text1));
    }
    else
    {
        log.warn("SpeedRestrictedVideoCtrl: no text is set. Black screen will appear!");
    }
};

/*
 * ===============================
 * PUBLIC API
 * ===============================
 */
SpeedRestrictedVideoCtrl.prototype.setWarningText = function(text1)
{
    this.properties.text1 = text1;
};

SpeedRestrictedVideoCtrl.prototype.setWarningTextId = function(text1Id, text1SubMap)
{
    this.properties.text1Id = text1Id;
    this.properties.text1SubMap = text1SubMap;
};

SpeedRestrictedVideoCtrl.prototype.handleControllerEvent = function(eventId)
{
    log.debug("SpeedRestrictedVideoCtrl: handleControllerEvent() ", eventId);
    // Pass-through
    if (this.umpCtrl)
    {
        var response = this.umpCtrl.handleControllerEvent(eventId);
        return response;
    }
};

SpeedRestrictedVideoCtrl.prototype.getContextCapture = function()
{
    log.debug("SpeedRestrictedVideoCtrl: getContextCapture() called...");

    var controlContextCapture = this.umpCtrl.getContextCapture();
    return controlContextCapture;
};

SpeedRestrictedVideoCtrl.prototype.restoreContext = function(controlContextCapture)
{
    log.debug("SpeedRestrictedVideoCtrl: restoreContext() ", controlContextCapture);

    this.umpCtrl.restoreContext(controlContextCapture);
};

SpeedRestrictedVideoCtrl.prototype.finishPartialActivity = function()
{
    log.debug("SpeedRestrictedVideoCtrl: finishPartialActivity() called...");

    this.umpCtrl.finishPartialActivity();
};

SpeedRestrictedVideoCtrl.prototype.cleanUp = function(){
    log.debug("SpeedRestrictedVideoCtrl: cleanUp() called...");
    // Now Playing currently has no cleanup
    if (this.umpCtrl)
    {
        this.umpCtrl.cleanUp();
    }
};

framework.registerCtrlLoaded("SpeedRestrictedVideoCtrl");
