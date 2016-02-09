/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: TreeTmplt.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: atiwarc
 Date: 05.02.2013
 __________________________________________________________________________

 Description: IHU GUI Template with Test, LeftBtn, and StatusBar

 __________________________________________________________________________

 */
log.addSrcFile("TrafficTmplt.js", "common");
/*
 * =========================
 * Constructor
 * =========================
 */
function TrafficTmplt(uiaId, parentDiv, templateID, controlProperties)
{
    this.divElt = null;
    this.templateName = "TrafficTmplt";

    this.onScreenClass = "TestTemplateWithStatusLeft";
    this.offScreenLeftClass = "TestTemplateWithStatusLeft-OffscreenLeft";
    this.offScreenRightClass = "TestTemplateWithStatusLeft-OffscreenRight";

    log.debug("  templateID in treeTmplt constructor: " + templateID);

    //@formatter:off
    //set the template properties
    this.properties = {
        "statusBarVisible" : true,
        "leftButtonVisible" : true,
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

    var properties = controlProperties.TrafficCtrl;

    this.trafficCtrl = framework.instantiateControl(uiaId, this.divElt, "TrafficCtrl", properties);

}

/* (internal - called by the framework)
 * Handles multicontroller events.
 * @param   eventID (string) any of the “Internal event name” values in IHU_GUI_MulticontrollerSimulation.docx (e.g. 'up',
 * 'down')
 */
TrafficTmplt.prototype.handleControllerEvent = function(eventID)
{
    log.debug("TrafficTmplt handleController() called, eventID: " + eventID);
    if(this.trafficCtrl)
    {
        // Route the event to the focused control
        var response = this.trafficCtrl.handleControllerEvent(eventID);
        return response;
    }
}

TrafficTmplt.prototype.cleanUp = function()
{
    this.trafficCtrl.cleanUp();
}

framework.registerTmpltLoaded("TrafficTmplt", ["apps/hdtrafficimage/controls/Traffic"]);