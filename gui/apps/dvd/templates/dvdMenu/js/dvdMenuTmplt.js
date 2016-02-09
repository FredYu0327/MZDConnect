/**
 * @author aupparv
 */

log.addSrcFile("dvdMenuTmplt.js", "dvd");

// dvdMenuTmplt constructor
function dvdMenuTmplt(uiaId, parentDiv, templateId, controlProperties)
{
    this.divElt = null;
    this.dvdMenuCtrl = null;
    this.templateName = "dvdMenuTmplt";

    log.debug("  templateId in dvdMenuTmplt constructor: " + templateId);

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

    var dvdMenuProperties = controlProperties['dvdMenuCtrl'];

    this.dvdMenuCtrl = framework.instantiateControl(uiaId, this.divElt, "dvdMenuCtrl", dvdMenuProperties);

}

/*
 * =========================
 * Standard Template API functions
 * =========================
 */
/*
 * Captures the current focus/context information of the control.
 * Called when framework switches the context from this control to another control.
 * The information will be returned in the form of a special object specific to the control.
 * This object will have all the required information to restore focus/context on control and its subcontrols.
 * This object can be used by framework to restore back the focus/context.
 * TAG: public
 * =========================
 * @param {void}
 * @return {templateContextCapture} - object with current focus/context information of the template.
 */
dvdMenuTmplt.prototype.getContextCapture = function()
{
    templateContextCapture = this.dvdMenuCtrl.getContextCapture();
    return templateContextCapture;
}

/*
 * Restores the control with the earlier captured focus/context information which was captured using getContextCapture() function.
 * Called when framework switches back to the previous context from the new context.
 * The information is passed in the same structured object form as returned by getContextCapture() function.
 * This object is the returned value to the last getContextCapture() function.
 * This object will have the required information to restore back to the state when getContextCapture() was called.
 * TAG: public
 * =========================
 * @param {templateContextCapture} - object with previously captured focus/context information of the template
 * @return {void}
 */
dvdMenuTmplt.prototype.restoreContext = function(templateContextCapture)
{
    // TODO: Check if focus to be restored on the control or subControl
    // Set the corresponding properties of control and subControl.
    if (this.dvdMenuCtrl)
    {
        this.dvdMenuCtrl.restoreContext(templateContextCapture);
    }
}

dvdMenuTmplt.prototype.handleControllerEvent = function(eventID)
{
    // Route the event to the focused control
    if (this.dvdMenuCtrl){
        // Route the event to the focused control
        var response = this.dvdMenuCtrl.handleControllerEvent(eventID);
        return response;
    }
}


/*
 * Called by GUI_COMMON when user activity is detected (automatically showing the DvdMenuControl)
 * for templates where the "displaySbUmpByActivity" property is true
 */
dvdMenuTmplt.prototype.onActivityShowing = function(delay_ms, duration_ms)
{
    log.info("dvdMenuTmplt onActivityShowing() called");
    if (this.dvdMenuCtrl)
    {
        this.dvdMenuCtrl.showHideControl('show', delay_ms, duration_ms);
    }
}

/*
 * Called by GUI_COMMON when user inactivity is detected (automatically hiding the DvdMenuControl)
 * for templates where the "displaySbUmpByActivity" property is true
 */
dvdMenuTmplt.prototype.onActivityHiding = function(delay_ms, duration_ms)
{
    log.info("dvdMenuTmplt onActivityHiding() called");
    if (this.dvdMenuCtrl)
    {
        this.dvdMenuCtrl.showHideControl('hide', delay_ms, duration_ms);
    }
}


/*
 * Called by the app during templateNoLongerDisplayed. Used to perform garbage collection procedures on the template and
 * its controls.
 */
dvdMenuTmplt.prototype.cleanUp = function()
{
    this.dvdMenuCtrl.cleanUp();
}

framework.registerTmpltLoaded("dvdMenuTmplt", ["apps/dvd/controls/dvdMenu"]);
