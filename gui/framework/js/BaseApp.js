/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: BaseApp.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: awoodhc
 Date: 27-June-2012
 __________________________________________________________________________

 Description: IHU GUI Base App

 Revisions:
 v0.1 (27-June-2012)  BaseApp created to easily add/change the standard app functions at time of
                     instantiating the app.
 v0.2 (29-June-2012) Changed log lines to include this.uiaId for clarity.
 v0.3 (17-July-2012) Changed name of getTemplatePropertiesforContext to _getContextTableEntry
 v0.4 (19-Nov-2012) Added event for handoff from NativeGUI to templateDisplayed function (run only once)
 __________________________________________________________________________

 */

log.addSrcFile("BaseApp.js", "framework");

/**********************************************
 * Constructor
 *             
 * This file is used by framework to add specific variables and functions to all apps
 * at the time of instantiation.
 * 
 *********************************************/
function BaseApp()
{
    
}

/*
 * Adds standard variables and functions to the app.
 * This function should be called in every app constructor to get the standard
 * variables and functions.
 * @tparam  Object  appInstance  The instance of the app to add variables to (constructor can pass 'this')
 * @tparam  String  uiaId   The uiaId of the app to add variables to
 */
BaseApp.prototype.init = function(appInstance, uiaId)
{
    this._addVariables(appInstance, uiaId);
    this._addFunctions(appInstance);
}

/*
 * Adds standard variables to the given app instance
 * This function should be called by framework when instantiating a new app.
 */
BaseApp.prototype._addVariables = function(appInstance, uiaId)
{
    appInstance.uiaId = uiaId;                     // (String) the uiaId of the app
    appInstance.sbNameIcon = null;
    appInstance._currentContext = null;            // Current context as recieved from MMUI
    appInstance._currentContextTemplate = null;    // Template bound to current context, if any
    appInstance._outgoingContext = null;           // Context that is being transition away from
    appInstance._outgoingContextTemplate = null;   // Template bound to outgoing context, if any
    appInstance._previousContext = null;           // Previous context as recieved from MMUI 
    appInstance._contextChanged = false;           // True if context has changed since last displayed
}

/*
 * Adds standard functions to the given app instance
 * This function should be called by framework when instantiating a new app.
 * This function uses .bind(appInstance) to make sure the app's new function has the correct value for 'this'
 */
BaseApp.prototype._addFunctions = function(appInstance)
{
    appInstance.handleContext = this._handleContext.bind(appInstance);
    appInstance.handleDataMessage = this._handleDataMessage.bind(appInstance);
    appInstance.isContextDifferent = this._isContextDifferent.bind(appInstance);
    appInstance.hasContextChanged = this._hasContextChanged.bind(appInstance);
    appInstance.getContextTableEntry = this._getContextTableEntry.bind(appInstance);
    appInstance.templateReadyToDisplay = this._templateReadyToDisplay.bind(appInstance);
    appInstance.templateDisplayed = this._templateDisplayed.bind(appInstance);
    appInstance.templateNoLongerDisplayed = this._templateNoLongerDisplayed.bind(appInstance);
    appInstance.isContextDifferentFrom = this._isContextDifferentFrom.bind(appInstance);
    appInstance.getCurrentContext = this._getCurrentContext.bind(appInstance);
    appInstance.handleSharedDataChanged = this._handleSharedDataChanged.bind(appInstance);
}

/*************************
 * Standard app functions are below
 * 
 * =========================================
 * 
 * THE BELOW FUNCTION HEADERS REFER TO THE FUNCTION'S PURPOSE AFTER
 * IT HAS BEEN ADDED TO THE APP.
 * 
 * =========================================
 * 
 * Until the function is copied into the app (see this._addFunctions), these 
 * functions are private to baseApp and should not be called directly.
 *************************/

/*
 * Called by framework when testing if a context change is needed
 * @tparam  Object  contextObj  The context object to be tested
 */
BaseApp.prototype._handleContext = function(contextObj)
{
    if (this.isContextDifferent(this._currentContext, contextObj) && this._contextTable[contextObj.ctxtId] !== null)
    {
        this._contextChanged = true;
        if (this._currentContextTemplate != null) 
        {
            // Can't clean up yet, need to wait until this context is transitioned off
        }
        else
        {
            // Call cleanup function if needed (e.g. to clean up cached data)
            if (this._currentContext && this._contextTable[this._currentContext.ctxtId] && this._contextTable[this._currentContext.ctxtId].contextOutFunction)
            {
                try
                {
                    this._contextTable[this._currentContext.ctxtId].contextOutFunction(this._currentContext);
                }
                catch (err)
                {
                    log.error("Caught exception in 'contextOutFunction' for " + this.uiaId + " " + this._currentContext.ctxtId);
                    log.writeError(err);
                }
            }                
        }
        // Save old information
        this._previousContext = this._currentContext;
        this._outgoingContext = this._currentContext;
        this._outgoingContextTemplate = this._currentContextTemplate;
        // Set new context
        this._currentContext = contextObj;
        // Context does not have a bound template
        this._currentContextTemplate = null;
        
        // Call setup function if needed (e.g. to set up cached data)
        if (this._currentContext && 
            this._contextTable[this._currentContext.ctxtId] &&
            this._contextTable[this._currentContext.ctxtId].contextInFunction)
        {
            try
            {
                this._contextTable[this._currentContext.ctxtId].contextInFunction(this._currentContext);
            }
            catch (err)
            {
                log.error("Caught exception in 'contextInFunction' for " + this.uiaId + " " + this._currentContext.ctxtId);
                log.writeError(err);
            }
        }                
    }
    else
    {
        // Context is the same but we still need to record the contextSeq number
        this._currentContext.contextSeq = contextObj.contextSeq;
    }
}

/*
 * Called by framework when a data message is sent from Mmui.
 * This will pass the message information into any function the app has set in this._messageTable
 * @tparam  Object  msg     The parsed message object sent from Mmui
 */
BaseApp.prototype._handleDataMessage = function(msg)
{
    if (this._messageTable && this._messageTable[msg.msgId])
    {
        try
        {
            this._messageTable[msg.msgId](msg);
        }
        catch (err)
        {
            log.error("Caught exception in message handler for " + this.uiaId + " " + msg.msgId);
            log.writeError(err);
        }
    }
    else
    {
        log.warn(this.uiaId +  " No message handler for", msg.msgId)
    }                
}

/*
 * Checks if the provided context objects are different
 * @tparam  Object  context1    Context to test against second parameter
 * @tparam  Object  context2    Context to test against first parameter
 */
BaseApp.prototype._isContextDifferent = function(context1, context2)
{
    if(context1 == null || context2 == null)
    {
        return true;
    }
    else
    {
        if (context1.uiaId !== context2.uiaId || 
            context1.ctxtId !== context2.ctxtId ||
            JSON.stringify(context1.params) !== JSON.stringify(context2.params))
        {
            return true;
        }
        else
        {
            return false;
        }
    }
}

/*
 * Checks if the provided context object is different than the current context of this application instance.
 * @tparam  Object  context2    Context to test against
 * @treturn True if context2 is different than the current context of this application. False if they are the same.
 */
BaseApp.prototype._isContextDifferentFrom = function(context2)
{
    return this.isContextDifferent(this._currentContext, context2);
}

/*
 * Called by framework during tansition.
 */
BaseApp.prototype._hasContextChanged = function()
{
    return this._contextChanged;
}

/*
 * Retrieves the entry for the given context from the _contextTable
 * @tparam  (String) ctxtId The context name
 * @treturn (Object) The properties object for the ctxtId context (as defined in the context table in the app constructor)
 */
BaseApp.prototype._getContextTableEntry = function(ctxtId)
{
    if (this._contextTable[ctxtId])
    {
        return this._contextTable[ctxtId];
    }
    else
    {
        return null;
    }
}

/*
 * Called by framework when the new template is ready to display, but has not yet transitioned on screen.
 * If the app has set a readyFunction in the context table, calls the callback.
 * @tparam  Object  The new template object
 */
BaseApp.prototype._templateReadyToDisplay = function(template, readyParams)
{
    // New context has now been absorbed
    this._contextChanged = false;

    // Current template is now set up but not displayed.
    this._currentContextTemplate = template;

    var tmpltFn = this._contextTable[this._currentContext.ctxtId].readyFunction;
    
    if (tmpltFn)
    {
        try
        {
            if (readyParams && readyParams.templateContextCapture)
            {
                tmpltFn(readyParams);
            }
            else
            {
                tmpltFn();
            }
        }
        catch (err)
        {
            log.error("Caught exception in 'readyFunction' for " + this.uiaId + " " + this._currentContext.ctxtId);
            log.writeError(err);
        }
    }    
}

/*
 * Called by framework when a new template is displayed and has finished transitioning on screen.
 * If the app has set a displayedFunction in the context table, calls the callback.
 * @tparam  Object  The new template object.
 */
BaseApp.prototype._templateDisplayed = function(template)
{
    var tmpltFn = this._contextTable[this._currentContext.ctxtId].displayedFunction;
    if (tmpltFn)
    {
        try
        {
            tmpltFn();
        }
        catch (err)
        {
            log.error("Caught exception in 'displayedFunction' for " + this.uiaId + " " + this._currentContext.ctxtId);
            log.writeError(err);
        }
    }
    
    // call wayland to show browser surface (run only once)
    if (!framework._browserShown)
    {
        framework.showOperaSurface();
        framework._browserShown = true;
        
        // After the transition completes, GUI is ready, and NativeGui should hand over
        // all surface management
        setTimeout(function()
        {
            log.info("* * * * * Sending InitializeGuiComplete event to MMUI_System. * * * * *");
            framework.sendEventToMmui("system", "InitializeGuiComplete");
        }, 1000);
    }
}

/*
 * Called by framework when the template has transitioned off screen and is destroyed.
 * This is called just prior to cleanUp() and the Html being removed from the DOM.
 * If the app has set a noLongerDisplayedFunction in the context table, calls the callback.
 * @tparam  Object  template    The templated object that was transitioned off
 */
BaseApp.prototype._templateNoLongerDisplayed = function(template)
{
    if (template == this._outgoingContextTemplate)
    {
        var tmpltFn = this._contextTable[this._outgoingContext.ctxtId].noLongerDisplayedFunction;
        if (tmpltFn)
        {
            try
            {
                tmpltFn(template, true);
            }
            catch (err)
            {
                log.error("Caught exception in 'noLongerDisplayedFunction' for " + this.uiaId + " " + this._outgoingContext.ctxtId);
                log.writeError(err);
            }
        }
        // Call cleanup function if needed (e.g. to clean up cached data)
        if (this._outgoingContext && 
            this._contextTable[this._outgoingContext.ctxtId] &&
            this._contextTable[this._outgoingContext.ctxtId].contextOutFunction)
        {
            try
            {
                this._contextTable[this._outgoingContext.ctxtId].contextOutFunction(this._outgoingContext);
            }
            catch (err)
            {
                log.error("Caught exception in 'contextOutFunction' for " + this.uiaId + " " + this._outgoingContext.ctxtId);
                log.writeError(err);
            }
        }                
    }
    // Any outgoing context transition is now done, clean up vars to make sure
    this._outgoingContext = null;
    this._outgoingContextTemplate = null;
    
    if (template == this._currentContextTemplate)
    {
        var tmpltFn = this._contextTable[this._currentContext.ctxtId].noLongerDisplayedFunction;
        if (tmpltFn)
        {
            try
            {
                tmpltFn(template, true);
            }
            catch (err)
            {
                log.error("Caught exception in 'noLongerDisplayedFunction' for " + this.uiaId + " " + this._currentContext.ctxtId);
                log.writeError(err);
            }
        }
        // Template for current context is no longer displayed (this app lost focus)
        this._currentContextTemplate = null;
    }
}

/*
 * Return the current context of this app.
 */
BaseApp.prototype._getCurrentContext = function()
{
    return this._currentContext;
}

/*
 * Called by the framework when a shared data value has changed and "this" app is
 * currently in focus.
 * @tparam String uiaId The application that primarily owns the value.
 * @tparam String name The name of the value.
 * @tparam Object value The new value of the attribute.
 */
BaseApp.prototype._handleSharedDataChanged = function(uiaId, name, value)
{
    if (typeof this.sharedDataChanged === 'function')
    {
        try
        {
            this.sharedDataChanged(uiaId, name, value);
        }
        catch (err)
        {
            log.error("Caught exception in 'sharedDataChanged' function of " + this.uiaId);
            log.writeError(err);
        }
    }
}
