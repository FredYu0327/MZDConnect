/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: List2Tmplt.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: avorotp
 Date:
 __________________________________________________________________________

 Description: IHU GUI Template with List2Ctrl, LeftBtn and StatusBar

 Revisions:
 v0.1
 __________________________________________________________________________

 */

log.addSrcFile("List2Tmplt.js", "common");

/*
 * =========================
 * Constructor
 * =========================
 */
function List2Tmplt(uiaId, parentDiv, templateID, controlProperties)
{
    this.divElt = null;
    this.List2Ctrl = null;
    this.templateName = "List2Tmplt";

    this.onScreenClass = "TemplateWithStatusLeft";
    this.slideOutLeftClass = "TemplateWithStatusLeft-SlideOutLeftClass";
    this.slideInRightClass = "TemplateWithStatusLeft-SlideInRightClass";
    this.slideInLeftClass = "TemplateWithStatusLeft-SlideInLeftClass";
    this.slideOutRightClass = "TemplateWithStatusLeft-SlideOutRightClass";

    log.debug("  templateID in List2Tmplt constructor: " + templateID);

    //@formatter:off
    //set the template properties
    this.properties = {
        "statusBarVisible" : true,
        "leftButtonVisible" : true,
        "rightChromeVisible" : true,
        "hasActivePanel" : false,
        "isDialog" : false,
        "customBgImage" : null
    }
    //@formatter:on

    // create the div for template
    this.divElt = document.createElement('div');
    this.divElt.id = templateID;
    this.divElt.className = "TemplateWithStatusLeft List2Tmplt";


    parentDiv.appendChild(this.divElt);

    var listProperties = controlProperties.List2Ctrl;

    this.list2Ctrl = framework.instantiateControl(uiaId, this.divElt, "List2Ctrl", listProperties);

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
List2Tmplt.prototype.handleControllerEvent = function(eventID)
{
    log.debug("List2Tmplt handleController() called, eventID: " + eventID);

    // Route the event to the focused control
    var response = this.list2Ctrl.handleControllerEvent(eventID);
    return response;
}

/*
 * Called by framework on existing templates at the begining of a context change.
 */
List2Tmplt.prototype.finishPartialActivity = function()
{
    this.list2Ctrl.finishPartialActivity();
}

/*
 * Called by the app during templateNoLongerDisplayed. Used to perform garbage collection procedures on the template and
 * its controls.
 */
List2Tmplt.prototype.cleanUp = function()
{
    this.list2Ctrl.cleanUp();
}

/*
 * Capture data
 * @return {void}
 */
List2Tmplt.prototype.getContextCapture = function()
{
    return {
        controlData : this.list2Ctrl.getContextCapture()
    };
}

/**
 * Restore data
 * @param {object} templateContextCapture
 * @return {void}
 */
List2Tmplt.prototype.restoreContext = function(templateContextCapture)
{
    this.list2Ctrl.restoreContext(templateContextCapture.controlData);
}

framework.registerTmpltLoaded("List2Tmplt", ["common/controls/List2", "common/controls/Tabs", "common/controls/Button", "common/controls/Slider"]);
