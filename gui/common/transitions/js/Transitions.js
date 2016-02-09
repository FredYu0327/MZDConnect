/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: Transitions.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: aganesar
 Date: 05.7.2012
 __________________________________________________________________________

 Description: IHU GUI Transitions Module

 Revisions:
 v0.1 (07-May-2012)  Added ActivePanel, LeftButton, StatusBar
 v0.2 Unknown (versions estimated) 
 v0.3 Unknown (versions estimated) 
 v0.4 (19-June-2012) Fixed Active Panel transition bug (no longer visible on main menu) -awoodhc
 v0.5 (28-June-2012) Added transparent background transition logic to _setSysCtrlsVisibility function -awoodhc
 v0.6 (29-June-2012) Added logic for "default" Dialog transitions -awoodhc
 v0.7 (06-July-2012) Added logic to handle GUI restart/refresh - aganesar
 v0.8 (23-July-2012) Switched to CSS Animations from CSS Transitions - aganesar
 v0.9 (27-Aug-2012) Active Panel is dead. Long live Status Bar Notificiations! -awoodhc
 v1.0 (28-Aug-2012) Variable name changes and removal of deprecated logic -awoodhc
 v1.1 (22-Oct-2012) StatusBar now fades when _doGlobalControlsTransition is called. Global controls now snap if snap transition is used -awoodhc
 v1.2 (30-Oct-2012) Fixed fadeOneTemplate to call _doGlobalControlsTransition -awoodhc
 v.13 (10-Jul-2013) Full re-work of Transitions file for new Transitions architecture -awoodhc
 __________________________________________________________________________
 */

// Set the module name for log lines
log.addSrcFile("Transitions.js", "common");
//log.addSrcFile("Transitions.js", "Transitions");
//log.setLogLevel("Transitions", "debug");

/*
 * Constructor
 * The Transitions Manager contains logic to determine the proper animation(s) to use during a context change.
 * As a general rule trigger functions will only apply 1 event listener to the element that will finished its animation last (this is predetermined by
 *     animation timing). This will reduce complexity of callbacks. Once that animation completes, the transitionCompleteCallback will be made.
 * 
 * ! ! ! GUI FRAMEWORK REQUIRES THAT ALL TRANSITIONS MUST COMPLETE ASYNCHRONOUSLY ! ! !
 */
function Transitions()
{ 
    log.debug("browser version " + window.opera.version());
     
    if (window.opera)
    {
        if (window.opera.version() >= 12.10)
        {
            log.debug("GUI Browser version verified. Continuing with startup.");
        }
        else
        {
            log.error("The GUI can only run in Opera version 12.10 or greater. Please re-open the GUI using Opera 12.10+");
        }
    }
    else
    {
        log.fatal("The GUI can only run in the Opera Browser. Please re-open the GUI using Opera 12.10+");
    }

    this._prevApp = null;        // (String) UIA ID of the App associated with the context leaving the screen
    this._prevCtxtId = null;     // (String) Context ID of the context leaving the screen
    this._prevTmpltInst = null;  // (Object) Instance of the template leaving the screen
    
    this._currApp = null;        // (String) UIA ID of the App associated with the context entering the screen
    this._currCtxtId = null;     // (String) Context ID of the context entering the screen
    this._currTmpltInst = null;  // (Object) Instance of the template entering the screen
    
    this._transitionCompleteFwkCallback = null;  // (Function) Called when any transition completes
    this._commonTransitionData = null;  // (Object) Transition Data pertaining to Common Global Controls
    
    this._genObj = new TransitionsGen(this);  // (Object) Code-generated class for transition resolution & execution

    this._transitionsTable = this._genObj.getTransitionTable();  // (Object) Transition table

    this._transitionFunctionsTable = this._genObj.getTransitionFunctionsTable();  // (Object) Transition functions table
    this._transitionExceptionsTable = this._genObj.getTransitionExceptionsTable();  // (Object) Transition map exceptions table
    this._transitionFunctionsBound = new Object();  // (Object) Holds bound versions of transition functions (save memory)

    this._cleanupAfterTransitionBound = this._cleanupAfterTransition.bind(this);  // (Function) Bound timer-based completion callback
    this._animationEndEventCallbackBound = this._animationEndEventCallback.bind(this);  // (Function) Bound event-bsed completion callback

    this._watchdogTimerId = null;  // (Object) ID of timer set up to guarantee transition cleanup processing occurs
    this._WATCHDOG_TIMER_MARGIN_MS = 500;  // (Number) The amount of padding time (in ms) to give the scheduled transition (added to total transition duration)
                                           //  before forcing completion
    this._watchdogTimerCallbackBound = this._watchdogTimerCallback.bind(this);  // (Function) Bound watchdog timer callback

    this._TRANSITION_ELEMENT_PREFIX = "transitionElement_";  // (String) The prefix applied to animation elements (e.g. global control
                                                             // target IDs), so they can be found later in this._animationTargetDescriptions
    this._animationTargetDescriptions = new Object();  // (Object) Stores multiple target descriptions for animation complete listeners
                                                       // (so cleanups & _setGlobalCtrlsVisibility() can occur after last animation completes)
    this._animateGlobalCtrlCompleteBound = this._animateGlobalCtrlComplete.bind(this);  // (Function) The global control animation complete callback
    
    this._ILLEGAL_TRANSITIONS = {   // (Object) List of illegal transitions in format uia.ctxt..uia.ctxt. Note: true means transition is ILLEGAL. TODO: This should be a Gen Obj
        "emnavi.Active..emnavi.NaviPreparing": true
    };
}

/*
 * (Internal)
 * Called by Framework to check if a transition must be ignored by rule of law (spec).
 * Determines whether the transition is legal to perform.
 */
Transitions.prototype.isTransitionLegal = function(currentUiaId, newUiaId, currentCtxtId, newCtxtId)
{
    for (var i = 0; i < arguments.length; i++)
    {
        if (arguments[i] == null)
        {
            arguments[i] = "null";
        }
    }
    var key = currentUiaId.concat(".", newUiaId, "..", currentCtxtId, ".", newCtxtId);

    if (this._ILLEGAL_TRANSITIONS[key])
    {
        return false;
    }
    else
    {
        return true;
    }
};

/*
 * (Internal)
 * Called by Framework to start a new transition.
 * Determines the correct trigger function to call for the context change.
 */
Transitions.prototype.doTemplateTransition = function(prevTemplate, currentTemplate, destParent, completeCallback, commonTransitionData)
{
    log.info("Transitions.doTemplateTransition called. Common transition data: statusBarVisible:" + commonTransitionData.statusBarVisible 
        + ", leftButtonVisible:" + commonTransitionData.leftButtonVisible
        + ", rightChromeVisible:" + commonTransitionData.rightChromeVisible
        + ", menuUpUsed:" + commonTransitionData.menuUpUsed
        + ", goBackUsed:" + commonTransitionData.goBackUsed);
    log.debug("    arguments:", arguments);

    if (prevTemplate)
    {
        // Note: prevTemplate is null at startup
        this._prevApp = prevTemplate.contextInfo.uiaId;
        this._prevCtxtId = prevTemplate.contextInfo.ctxtId;
        this._prevTmpltInst = prevTemplate;
    }
    
    if (currentTemplate == null)
    {
        log.error("Cannot transition to null template!");
        return;
    }
    
    this._currApp = currentTemplate.contextInfo.uiaId;
    this._currCtxtId = currentTemplate.contextInfo.ctxtId;
    this._currTmpltInst = currentTemplate;
    
    this._transitionCompleteFwkCallback = completeCallback;
    this._commonTransitionData = commonTransitionData;

    // Look for a special-case transition for this src/dst app/ctxt
    var transitionElements = this._getTransitionMapException(this._prevApp, this._prevCtxtId, this._currApp, this._currCtxtId);
    if (!transitionElements) {
        // Exception not found -- resolve required transition, based on templates & common transition data
        transitionElements = this._resolveTransitionBetweenTemplates(this._prevTmpltInst,
                                                                     this._currTmpltInst,
                                                                     this._commonTransitionData);
    }

    log.info("'" + transitionElements.transitionName + "' transition. " + this._prevApp + "." + this._prevCtxtId + " >>> " + this._currApp + "." + this._currCtxtId);

    var transitionFunction = transitionElements.functionRef;
    var transitionDuration_ms = transitionElements.duration_ms;
    var initClass = transitionElements.initClass;

    // Add init class and pop the "bubble" (reparent the template)
    this._currTmpltInst.divElt.classList.add(initClass);
    destParent.appendChild(this._currTmpltInst.divElt);
    
    // Note: if the previous template is a dialog, we need to call endTransitionTo early, so the new template is ready before the fade
    if (this._prevTmpltInst && this._prevTmpltInst.properties.isDialog == true)
    {
        if (this._currTmpltInst.endTransitionTo)
        {
            this._currTmpltInst.endTransitionTo();
        }
    }
    
    // Note: If the new template is a dialog, leave the old template as it was
    if (this._currTmpltInst.properties.isDialog == false) 
    {
        if (this._prevTmpltInst && this._prevTmpltInst.startTransitionFrom)
        {
            this._prevTmpltInst.startTransitionFrom();
        }
    }

    // Set a watchdog timer to guarantee completion of the transition
    log.debug("Setting transition watchdog timer to " + (transitionDuration_ms + this._WATCHDOG_TIMER_MARGIN_MS) + "ms");
    this._watchdogTimerId = setTimeout(this._watchdogTimerCallbackBound, transitionDuration_ms + this._WATCHDOG_TIMER_MARGIN_MS);    

    if (transitionFunction) {
        transitionFunction(this._prevTmpltInst,
                           this._currTmpltInst,
                           this._commonTransitionData);
    } else {
        log.error("doTemplateTransition(): no transition function found!");
    }
};

/*
 * Helper function. Makes a callback to framework to signal that the transition has completed
 */
Transitions.prototype._makeCompleteCallbackToFwk = function()
{
    // Note: if the previous template is a dialog, we already called this function, so there's no need to call it again
    if (this._prevTmpltInst == null || (this._prevTmpltInst && this._prevTmpltInst.properties.isDialog == false))
    {
        if (this._currTmpltInst.endTransitionTo)
        {
            this._currTmpltInst.endTransitionTo();
        }
    }
    
    if (typeof this._transitionCompleteFwkCallback == 'function')
    {
        this._transitionCompleteFwkCallback();
    }
};

/*
 * Helper function.  Check the transition map exceptions for a particular src/dst app/ctxt combination
 */
Transitions.prototype._getTransitionMapException = function(srcApp, srcCtxt, dstApp, dstCtxt) {
    var transitionElements = null;

    // Get the transition exception lookup key based on src/dst app/ctxt
    var tmeKey = this._getTransitionMapExceptionKey(srcApp, srcCtxt, dstApp, dstCtxt);
    log.debug("tmeKey = " + tmeKey);

    // Do the lookup
    var transitionName = this._transitionExceptionsTable[tmeKey];

    // Did we find something?
    if (utility.toType(transitionName) === "string")
    {
        log.debug("_getTransitionMapException(): Exception found for " + tmeKey);

        // Yes -- form the transition elements object to be returned
        transitionElements = this._getBoundTransitionFunction(transitionName);
        transitionElements.initClass = this._getInitClassForTransition(transitionName);
    }
    
    return transitionElements;
}

/*
 * Helper function.  Resolves template-to-template transitions into a function call & init class,
 * based on the templates & common transition data.
 */
Transitions.prototype._resolveTransitionBetweenTemplates = function(prevTemplate, currTemplate, cmnTransData)
{
    log.debug("_resolveTransitionBetweenTemplates(prevTemplate, currTemplate, cmnTransData)",
              prevTemplate, currTemplate, cmnTransData);

    // Determine the category for each template
    var prevTemplateCategory = this._genObj.getTemplateCategory(prevTemplate);
    var currTemplateCategory = this._genObj.getTemplateCategory(currTemplate);
    var transitionKey;

    // Get the transition key, derived from the categories from the prev/current templates
    if (utility.toType(prevTemplateCategory) === "string") {
        transitionKey = prevTemplateCategory + "." + currTemplateCategory;
    } else {
        // Special case for initial startup screens, where no previous template exists
        transitionKey = "None." + currTemplateCategory;
    }

    // Get the name of the transition, based on the transition key
    var transitionName = this._transitionsTable[transitionKey];
    if ((utility.toType(transitionName) !== "string") ||
        (transitionName === "NA")) {
        // If no transition was found, default to crossfade
        log.warn("_resolveTransitionBetweenTemplates(): Transition name \"" + transitionName + "\" not defined for key \"" + transitionKey +
                 "\" -- defaulting to \"Crossfade\"");
        transitionName = "Crossfade";
    }

    // Get the elements of the transition (function, init class), resolving any ambiguities
    // with additional information from the templates & common transition data
    var transitionElements = this._genObj.getTransitionFunction(transitionName, prevTemplate, currTemplate, cmnTransData);
    log.debug("_resolveTransitionBetweenTemplates(): transitionElements: ", transitionElements);

    return transitionElements;
};


/**********************/
/* Category resolvers */
/**********************/

/*
 * Get the transition category (either "DialPad" or "Dialog") for a DialPad2 template
 */
Transitions.prototype._getDialPad2Category = function(templateObj) {
    var category = undefined;

    // Validate the incoming template is of the right type
    if ((utility.toType(templateObj) === "object") &&
            (templateObj.templateName === "DialPad2Tmplt")) {
        if (templateObj.properties.isDialog) {
            category = "Dialog";
        } else {
            category = "DialPad";
        }
    }
    else
    {
        log.warn("_getDialPad2Category called with a non-DialPad2Tmplt template!");
    }
    
    return category;
};

/*
 * Get the transition category (either "List" or "Tabbed List") for a List2 template
 */
Transitions.prototype._getList2Category = function(templateObj) {
    var category = undefined;

    // Validate the incoming template is of the right type
    if ((utility.toType(templateObj) === "object") &&
            (templateObj.templateName === "List2Tmplt")) {
        if (utility.toType(templateObj.list2Ctrl.tabsCtrl) === "object") {
            category = "Tabbed List";
        } else {
            category = "List";
        }
    }
    else
    {
        log.warn("_getList2Category called with a non-List2Tmplt template!");
    }
    
    return category;
};

/*
 * Get the transition category (either "Startup / Ending", "DVD / TV", or "Backup / Parking") for a NoCtrl template
 */
Transitions.prototype._getNoCtrlCategory = function(templateObj) {
    var category = undefined;

    // Validate the incoming template is of the right type
    if ((utility.toType(templateObj) === "object") &&
            (templateObj.templateName === "NoCtrlTmplt")) {
        if (templateObj.contextInfo.uiaId === "system") {
            category = "Startup / Ending";
        } else if (templateObj.contextInfo.uiaId === "tv") {
            category = "DVD / TV";
        } else {
            category = "Backup / Parking";
        }
    }
    else
    {
        log.warn("_getNoCtrlCategory called with a non-NoCtrlTmplt template!");
    }
    
    return category;
};

/*
 * Get the transition category (either "DVD / TV" or "Detail with UMP") for a NowPlaying4 template
 */
Transitions.prototype._getNowPlaying4Category = function(templateObj) {
    var category = undefined;

    // Validate the incoming template is of the right type
    if ((utility.toType(templateObj) === "object") &&
            (templateObj.templateName === "NowPlaying4Tmplt")) {
        if (templateObj.nowPlaying4Ctrl.properties.ctrlStyle === "Style0") {
            category = "DVD / TV";
        } else {
            category = "Detail with UMP";
        }
    }
    else
    {
        log.warn("_getNowPlaying4Category called with a non-NowPlaying4Tmplt template!");
    }
    
    return category;
};

/*
 * Get the transition category (either "Backup / Parking" or "DVD / TV Screen Settings") for a ScreenSettings2 template
 */
Transitions.prototype._getScreenSettings2Category = function(templateObj) {
    var category = undefined;

    // Validate the incoming template is of the right type
    if ((utility.toType(templateObj) === "object") &&
            (templateObj.templateName === "ScreenSettings2Tmplt")) {
        if (templateObj.contextInfo.uiaId === "backupparking") {
            category = "Backup / Parking";
        } else {
            category = "DVD / TV Screen Settings";
        }
    }
    else
    {
        log.warn("_getScreenSettings2Category called with a non-ScreenSettings2Tmplt template!");
    }
    
    return category;
};

/*
 * Get the transition category (either "Gap2 Ending" or "Detail with UMP") for an Idm template
 */
Transitions.prototype._getIdmCategory = function(templateObj) {
    var category = undefined;

    // Validate the incoming template is of the right type
    if ((utility.toType(templateObj) === "object") &&
            (templateObj.templateName === "IdmTmplt")) {
        if (templateObj.idmCtrl.properties.mode === "ending") {     // TODO: Flesh out this check once Idm exists!
            category = "Gap2 Ending";
        } else {
            category = "Detail with UMP";
        }
    }
    else
    {
        log.warn("_getIdmCategory called with a non-IdmTmplt template!");
    }
    
    return category;
};

/*
 * Get the transition category (either "Gap2 Ending" or "Detail with UMP") for an EcoEffect template
 */
Transitions.prototype._getEcoEffectCategory = function(templateObj) {
    var category = undefined;

    // Validate the incoming template is of the right type
    if ((utility.toType(templateObj) === "object") &&
            (templateObj.templateName === "EcoEffectTmplt")) {
        if (templateObj.ecoEffectCtrl.properties.mode === "ending") {
            category = "Gap2 Ending";
        } else {
            category = "Detail with UMP";
        }
    }
    else
    {
        log.warn("_getEcoEffectCategory called with a non-EcoEffectTmplt template!");
    }
    
    return category;
};


/*********************************/
/* Transition Function resolvers */
/*********************************/

/*
 * Get the transition name for a list-to-list transition
 * (Called by generated code)
 */
Transitions.prototype._getListToListTransition = function(prevTemplateObj, currTemplateObj, cmnTransData) {
    log.debug("_getListToListTransition(prevTemplateObj, currTemplateObj, cmnTransData): ",
              prevTemplateObj, currTemplateObj, cmnTransData);

    var transitionName = undefined;

    // Validate the incoming objects as List2 templates
    if ((prevTemplateObj.templateName === "List2Tmplt") &&
            (currTemplateObj.templateName === "List2Tmplt")) {
        // Dereference contextInfo data from templates
        var prevApp = prevTemplateObj.contextInfo.uiaId;
        var prevCtxt = prevTemplateObj.contextInfo.ctxtId;
        var currApp = currTemplateObj.contextInfo.uiaId;
        var currCtxt = currTemplateObj.contextInfo.ctxtId;

        // Look up the templates' context categories based on apps & contexts
        var prevCtxtCategory = framework.common.getContextCategory(prevApp, prevCtxt);
        var currCtxtCategory = framework.common.getContextCategory(currApp, currCtxt);

        if (prevCtxtCategory === currCtxtCategory) {
            // Slide transition within app/ctxt group -- check further for direction
            if (cmnTransData.goBackUsed || cmnTransData.menuUpUsed) {
                transitionName = "Slide Right ";
            } else {
                transitionName = "Slide Left ";
            }

            // Finally, determine whether the left button is 
            // present or not in both prev & current templates,
            // and adjust the transition name accordingly.
            transitionName += (prevTemplateObj.properties.leftButtonVisible ? "Y" : "N");
            transitionName += (currTemplateObj.properties.leftButtonVisible ? "Y" : "N");
        } else {
            // Otherwise, "Crossfade" is used
            transitionName = "Crossfade";
        }
    }
    else
    {
        log.warn("_getListToListTransition called without two List2Tmplt objects!");
    }
    
    return transitionName;
};

/*
 * Get the transition name for a detail-to-detail transition
 * (Called by generated code)
 */
Transitions.prototype._getDetailToDetailTransition = function(prevTemplateObj, currTemplateObj, cmnTransData) {
    var transitionName = undefined;

    // Validate the incoming objects as NowPlaying4 templates
    if ((prevTemplateObj.templateName === "NowPlaying4Tmplt") &&
            (currTemplateObj.templateName === "NowPlaying4Tmplt")) {
        if (prevTemplateObj.contextInfo.uiaId === currTemplateObj.contextInfo.uiaId) {
            transitionName = "Snap";
        } else {
            transitionName = "UMP Depart + Crossfade + UMP Arrive";
        }
    }
    else
    {
        log.warn("_getDetailToDetailTransition called without two NowPlaying4Tmplt objects!");
    }
    
    return transitionName;
};


/*********************/
/* Utility Functions */
/*********************/

/*
 * Put the src/dst app/ctxt data into the key format for the transition map exception table
 */
Transitions.prototype._getTransitionMapExceptionKey = function(srcApp, srcCtxt, dstApp, dstCtxt) {
    // Check for missing source app/ctxt (e.g. start-up transitions)
    if (utility.toType(srcApp) !== "string") {
        srcApp = "None";
    }
    if (utility.toType(srcCtxt) !== "string") {
        srcCtxt = "None";
    }

    // Form the transition exception key
    var key = srcApp + "." + srcCtxt + ".." + dstApp + "." + dstCtxt;
    
    return key;
}

/*
 * Get a bound reference to the function that executes a named transition
 */
Transitions.prototype._getBoundTransitionFunction = function(transitionName) {
    var transitionFunctionRef = null;

    if (!transitionName) {
        log.warn("_getBoundTransitionFunction(): no transition name found, defaulting to Crossfade");
        transitionName = "Crossfade";
    }

    // Check if transition function is defined for transitionName in _transitionFunctionsTable, else default to cross fade
    if ( typeof (this._transitionFunctionsTable[transitionName]) === "undefined" || this._transitionFunctionsTable[transitionName] === null) {
        // If no valid transition function was found, default to crossfade
        log.warn("_getBoundTransitionFunction(): Transition name \"" + transitionName + "\" not found in _transitionFunctionsTable -- defaulting to \"Crossfade\"");
        transitionName = "Crossfade";
    }

    // Look up the transition function corresponding to the named transition,
    // now that ambiguities have been resolved
    var transitionFunctionName = this._transitionFunctionsTable[transitionName].functionName;
    var transitionDuration_ms = this._transitionFunctionsTable[transitionName].duration_ms;

    // Make sure the named function exists
    if (utility.toType(this._genObj[transitionFunctionName]) === "function") {
        // Function exists -- is it bound yet?
        if (!this._transitionFunctionsBound[transitionFunctionName]) {
            // No -- bind it once (save memory)
            // NOTE -- we bind it to the generated object, NOT "this" object!
            this._transitionFunctionsBound[transitionFunctionName] = this._genObj[transitionFunctionName].bind(this._genObj);
        }

        // Set the return value to the bound function
        transitionFunctionRef = this._transitionFunctionsBound[transitionFunctionName];
    } else {
        log.error("_getBoundTransitionFunction(): Function \"" + transitionFunctionName + "\" doesn't exist -- can't bind!");
    }
    
    return {
        "transitionName" : transitionName,
        "transitionFunctionName" : transitionFunctionName,
        "functionRef" : transitionFunctionRef,
        "duration_ms" : transitionDuration_ms
    };
}


/*
 * Determine the name of the init class to apply to a template, before the transition starts
 */
Transitions.prototype._getInitClassForTransition = function(transitionName) {
    if (transitionName.search("Slide Left") != -1) {
        initClass = "Transitions_Init_OffscreenRight";
    } else if  (transitionName.search("Slide Right") != -1) {
        initClass = "Transitions_Init_OffscreenLeft";
    } else {
        initClass = "Transitions_Init_CenterTransparent";
    }
    
    return initClass;
};


/*******************************/
/* Global Controls Transitions */
/*******************************/

/*
 * Called to do a transition on common controls and the background image.
 * This gets called before a transition starts.
 */
Transitions.prototype._doGlobalControlsTransition = function(globalCtrlsCfg) {
    log.debug("_doGlobalControlsTransition(globalCtrlsCfg): ", globalCtrlsCfg);

    if (utility.toType(globalCtrlsCfg) === "object") {
        this._commonTransitionData = globalCtrlsCfg.commonTransitionData;
        var bgDiv2 = this._commonTransitionData.bgDiv2;

        if (globalCtrlsCfg.snapFlag) {
            // Take care of status bar, left button & right chrome visibility immediately
            this._setGlobalCtrlsVisibility();
            
            // System Background Image
            if (bgDiv2) // if bgDiv2 is not null, snap to the new BG
            {
                log.debug("_doGlobalControlsTransition(snap): Snapping to new BG image");
                var bgDiv1 = this._commonTransitionData.bgDiv1;
                bgDiv1.style.visibility = "hidden";
                bgDiv2.style.visibility = "visible";
            }
        } else {
            // System Background Image
            if (bgDiv2) // if bgDiv2 is not null, fade to the new BG
            {
                log.debug("_doGlobalControlsTransition(): Transitioning to new BG image");
                var bgDiv1 = this._commonTransitionData.bgDiv1;
                if (globalCtrlsCfg.bckgrndOut) {
                    this._animateGlobalCtrl(bgDiv1, globalCtrlsCfg.bckgrndOut);
                } else {
                    log.warn("_doGlobalControlsTransition(): No bckgrndOut transition configured");
                }
                if (globalCtrlsCfg.bckgrndIn) {
                    this._animateGlobalCtrl(bgDiv2, globalCtrlsCfg.bckgrndIn);
                } else {
                    log.warn("_doGlobalControlsTransition(): No bckgrndIn transition configured");
                }
            }

            // Status Bar
/*
            var statusBar = this._commonTransitionData.statusBar;
            if (statusBar)
            {
                if (this._commonTransitionData.statusBarVisible &&
                    (statusBar.divElt.style.visibility == "hidden"))
                {
                    log.debug("Showing status bar");
                    if (globalCtrlsCfg.statusBarIn) {
                        this._animateGlobalCtrl(statusBar.divElt, globalCtrlsCfg.statusBarIn);
                    } else {
                        log.warn("_doGlobalControlsTransition(): No statusBarIn transition configured");
                    }
                }
                else if (!this._commonTransitionData.statusBarVisible &&
                    (statusBar.divElt.style.visibility == "visible"))
                {
                    log.debug("Hiding status bar");
                    if (globalCtrlsCfg.statusBarOut) {
                        this._animateGlobalCtrl(statusBar.divElt, globalCtrlsCfg.statusBarOut);
                    } else {
                        log.warn("_doGlobalControlsTransition(): No statusBarOut transition configured");
                    }
                }
            }
*/

            // Left Button
            var leftBtn = this._commonTransitionData.leftButton;
            if (leftBtn)
            {
                var leftButtonStyle = this._currTmpltInst.contextInfo.leftButtonStyle;
                if(this._commonTransitionData.leftButtonVisible)
                {
                    log.debug("Showing left button");
                    if (globalCtrlsCfg.leftButtonIn) {
                  	    // set leftbutton style for current non dialog context
                        if (leftButtonStyle) {
                            framework.common.setLeftBtnStyle(leftButtonStyle);
                        } else {
                            framework.common.setLeftBtnStyle("goBack");
                        }
                        //Back button needs to be animated when its visibility was hidden
                        if(leftBtn.divElt.style.visibility == "hidden") {
                            this._animateGlobalCtrl(leftBtn.divElt, globalCtrlsCfg.leftButtonIn);
                        }
                    } else {
                        log.warn("_doGlobalControlsTransition(): No leftButtonIn transition configured");
                    }
                }
                else if (!this._commonTransitionData.leftButtonVisible &&
                    (leftBtn.divElt.style.visibility == "visible"))
                {
                    log.debug("Hiding left button");
                    if (globalCtrlsCfg.leftButtonOut) {
                        this._animateGlobalCtrl(leftBtn.divElt, globalCtrlsCfg.leftButtonOut);     
                    } else {
                        log.warn("_doGlobalControlsTransition(): No leftButtonOut transition configured");
                    }
                }
            }

            // Right Chrome
            var rightChrome = this._commonTransitionData.rightChrome;
            if (utility.toType(rightChrome) === "htmldivelement")
            {
                if ((this._commonTransitionData.rightChromeVisible === true) &&
                    (rightChrome.style.visibility == "hidden"))
                {
                    log.debug("Showing right chrome");
                    if (globalCtrlsCfg.rightChromeIn) {
                        this._animateGlobalCtrl(rightChrome, globalCtrlsCfg.rightChromeIn);
                    } else {
                        log.warn("_doGlobalControlsTransition(): No rightChromeIn transition configured");
                    }
                }
                else if ((this._commonTransitionData.rightChromeVisible === false) &&
                    (rightChrome.style.visibility == "visible"))
                {
                    log.debug("Hiding right chrome");
                    if (globalCtrlsCfg.rightChromeOut) {
                        this._animateGlobalCtrl(rightChrome, globalCtrlsCfg.rightChromeOut);     
                    } else {
                        log.warn("_doGlobalControlsTransition(): No rightChromeOut transition configured");
                    }
                }
            }
        }   // end if (globalCtrlsCfg.snapFlag)
    }   // end if (utility.toType(globalCtrlsCfg === "object")
};  // end _doGlobalControlsTransition

/*
 * Does a slide/fade animation on a global control
 * @param   target      HTMLElement the div to animate
 * @param   className   Name of the animation class to be applied to the control
 * @param   cleanupFlag True if callback should call _setGlobalCtrlsVisibility() to clean up the controls' states.
 */
Transitions.prototype._animateGlobalCtrl = function(target, className) {
    log.debug("_animateGlobalCtrl(" + target.id + ", " + className + ") called");
    
    // Make sure the div is visible first before doing the animation.
    target.style.visibility = 'visible';

    // Apply the named animation class to the target
    target.classList.add(className);
    
    // Store unique references for each div that gets animated
    this._animationTargetDescriptions[this._TRANSITION_ELEMENT_PREFIX + target.id] = {
            "target" : target,
            "className" : className,
            "isIncomplete" : true
        };
    target.addEventListener('animationend', this._animateGlobalCtrlCompleteBound);
};  // end _animateGlobalCtrl()

/*
 * Callback handler for _animateGlobalCtrl
 */
Transitions.prototype._animateGlobalCtrlComplete = function(evt) {
    log.debug("_animateGlobalCtrlComplete called", evt);

    var target = evt.srcElement;
    // Remove the event listener that got us here
    target.removeEventListener('animationend', this._animateGlobalCtrlCompleteBound);
    if (target && target.id && (this._animationTargetDescriptions[this._TRANSITION_ELEMENT_PREFIX + target.id]))
    {
        // Mark the target as completed
        this._animationTargetDescriptions[this._TRANSITION_ELEMENT_PREFIX + target.id].isIncomplete = false;
    }
    
    // Check if the entire transition is complete yet
    this._checkTransitionComplete();
};  // end _animateGlobalCtrlComplete()

/*
 * Immediately sets the visibilty of global controls based on the commonTransitionData.
 * Called after global controls transition completes.
 */
Transitions.prototype._setGlobalCtrlsVisibility = function() {
    log.debug("_setGlobalCtrlsVisibility() called");

    // Status Bar
    if (utility.toType(this._commonTransitionData.statusBar) === "object")
    {
        if (this._commonTransitionData.statusBarVisible)
        {
            //this._commonTransitionData.statusBar.divElt.style.visibility = 'visible';
            this._commonTransitionData.statusBar.transitionVisible(0, 0, "fade", true);
            log.debug("this._commonTransitionData.statusBarVisible is true");
        }
        else
        {
            //this._commonTransitionData.statusBar.divElt.style.visibility = 'hidden';
            this._commonTransitionData.statusBar.transitionVisible(0, 0, "fade", false);
            log.debug("this._commonTransitionData.statusBarVisible is false");
        }
    }

    // Left Button
    if (utility.toType(this._commonTransitionData.leftButton) === "object")
    {
        if (this._commonTransitionData.leftButtonVisible)
        {
            this._commonTransitionData.leftButton.divElt.style.visibility = 'visible';
            log.debug("this._commonTransitionData.leftButtonVisible is true");
        }
        else
        {
            this._commonTransitionData.leftButton.divElt.style.visibility = 'hidden';
            log.debug("this._commonTransitionData.leftButtonVisible is false");
        }
    }

    // Right Chrome
    if (utility.toType(this._commonTransitionData.rightChrome) === "htmldivelement")
    {
        if (this._commonTransitionData.rightChromeVisible)
        {
            this._commonTransitionData.rightChrome.style.visibility = 'visible';
            log.debug("this._commonTransitionData.rightChromeVisible is true");
        }
        else
        {
            this._commonTransitionData.rightChrome.style.visibility = 'hidden';
            log.debug("this._commonTransitionData.rightChromeVisible is false");
        }
    }
};  // end _setGlobalCtrlsVisibility()


/***************************/
/* Post-transition cleanup */
/***************************/

/*
 * Utility function to remove any transition classes (init & animation) from a DOM node (e.g. template divElt).
 * ASSUMES ALL TRANSITION CSS CLASSES ARE PREFIXED WITH "Transitions_"!
 */
Transitions.prototype._stripTransitionCSSClasses = function(domnode) {
    log.debug("_stripTransitionCSSClasses() called");

    // Scan the DOM node's list of CSS classes
    var classesToRemove = new Array();
    var numClassesToRemove = 0;
    var numClasses = domnode.classList.length;
    var classIdx = 0;
    for (; classIdx < numClasses; classIdx++) {
        var curClass = domnode.classList.item(classIdx);
        // Is the current class a transition init/animation class?
        if (curClass.indexOf("Transitions_") == 0)
        {
            // Yes -- remember it for removal
            classesToRemove[numClassesToRemove++] = curClass;
        }
    }
    for (classIdx = 0; classIdx < numClassesToRemove; classIdx++) {
        // Remove all of the transition classes we found
        domnode.classList.remove(classesToRemove[classIdx]);
    }
};  // end _stripTransitionCSSClasses()

/*
 * Utility function invoked by animation functions that need a timer to schedule their cleanup
 * (e.g. last element to finish is an UMP slide)
 */
Transitions.prototype._setCleanupByTimer = function(duration_ms) {
    log.debug("_setCleanupByTimer(" + duration_ms + ")");
    // Store unique reference for timer-based non-global-control animation (e.g. UMP slide).
    this._animationTargetDescriptions[this._TRANSITION_ELEMENT_PREFIX + "Non-Global-Control"] = {
        "target" : null,
        "className" : null,
        "isIncomplete" : true
    };

    // Set timer to schedule cleanup
    setTimeout(this._cleanupAfterTransitionBound, duration_ms);
};  // end _setCleanupByTimer()

/*
 * Common post-transition cleanup code
 */
Transitions.prototype._cleanupAfterTransition = function() {
    log.debug("_cleanupAfterTransition()");
    // Mark the target as completed
    if (this._animationTargetDescriptions[this._TRANSITION_ELEMENT_PREFIX + "Non-Global-Control"])
    {
        this._animationTargetDescriptions[this._TRANSITION_ELEMENT_PREFIX + "Non-Global-Control"].isIncomplete = false;
    }
    // Check if the entire transition is complete yet
    this._checkTransitionComplete();
};  // end _cleanupAfterTransition()

/*
 * Utility function invoked by animation functions that rely on animationend events from browser
 * to schedule their cleanup (e.g. last element to finish is the current template fade/slide)
 */
Transitions.prototype._setCleanupByEventListener = function(domElement) {
    log.debug("_setCleanupByEventListener(domElement): ", domElement);
    // Store unique reference for non-global-control animation (e.g. templates).  Note that even
    // though we record the DOM element, we don't use the target/className mechanism here to
    // clean up templates, but use _stripTransitionCSSClasses() instead.  We record the DOM element
    // to verify that the animation event target is really for us, and not something else (e.g. UMP).
    this._animationTargetDescriptions[this._TRANSITION_ELEMENT_PREFIX + "Non-Global-Control"] = {
        "target" : domElement,
        "className" : null,
        "isIncomplete" : true
    };

    // Add event listener to schedule cleanup
    domElement.addEventListener('animationend', this._animationEndEventCallbackBound);
};  // end _setCleanupByEventListener()

/*
 * Post-transition cleanup code invoked by event-listener-based animation functions
 */
Transitions.prototype._animationEndEventCallback = function(evt) {
    log.debug("_animationEndEventCallback(evt): ", evt);

    // Is this event for us?
    if ((this._animationTargetDescriptions[this._TRANSITION_ELEMENT_PREFIX + "Non-Global-Control"]) &&
       (this._animationTargetDescriptions[this._TRANSITION_ELEMENT_PREFIX + "Non-Global-Control"].target) &&
       (this._animationTargetDescriptions[this._TRANSITION_ELEMENT_PREFIX + "Non-Global-Control"].target.id === evt.target.id)) {
        // Yes -- clean up the event listener that got us here
        evt.srcElement.removeEventListener('animationend', this._animationEndEventCallbackBound);
    
        // Call post-transition function for common cleanups
        this._cleanupAfterTransition();
    }
};  // end _animationEndEventCallback()

/*
 * Utility function to check the status of all pending animations and
 * initiate cleanup if all animations have completed.  Called each time
 * an animation completes (or is scheduled by timer to complete).
 */
Transitions.prototype._checkTransitionComplete = function() {
    // Iterate over all of the "transitionTarget_" objects in the 
    // callback object and tally all the incomplete ones
    var incompleteCount = 0;
    for (var key in this._animationTargetDescriptions) {
        if ((this._animationTargetDescriptions.hasOwnProperty(key)) &&
                (key.search(this._TRANSITION_ELEMENT_PREFIX) == 0)) {
            //log.debug("    isIncomplete = " + this._animationTargetDescriptions[key].isIncomplete);
            if (this._animationTargetDescriptions[key].isIncomplete) {
                incompleteCount++;
            }
        }
    }
    
    // Is the transition finished (all elements completed)?
    if (incompleteCount == 0) {
        // Yes -- make sure the watchdog timer is disabled
        log.debug("checkTransitionComplete(): transition complete, clearing watchdog timer");
        clearTimeout(this._watchdogTimerId);
        this._watchdogTimerId = null;

        // Clean everything up & notify the framework 
        this._transitionCompleted();
    }
};  // end _checkTransitionComplete()

Transitions.prototype._watchdogTimerCallback = function() {
    log.warn("Transitions watchdog timer fired -- forcing transition completion!");

    // Clean up the (now invalid) ID of the timer that got us here
    this._watchdogTimerId = null;
    
    // Force the transition to complete
    this._transitionCompleted();
};  // end _watchdogTimerCallback()

/*
 * Utility function to clean everything up & signal the framework that the transition has finished
 */
Transitions.prototype._transitionCompleted = function() {
    log.debug("_transitionCompleted()");
    // Clean up the animation target descriptions object
    for (var key in this._animationTargetDescriptions) {
        if ((this._animationTargetDescriptions.hasOwnProperty(key)) &&
                (key.search(this._TRANSITION_ELEMENT_PREFIX) == 0)) {
            if (this._animationTargetDescriptions[key].target &&
                    this._animationTargetDescriptions[key].className) {
                // Remove the transition classes from all of the targets (including this last one) 
                log.debug("    Removing class: " + this._animationTargetDescriptions[key].className);
                this._animationTargetDescriptions[key].target.classList.remove(this._animationTargetDescriptions[key].className);
            }

            delete this._animationTargetDescriptions[key];
        }
    }

    // Make sure the global controls visibility is correctly set
    this._setGlobalCtrlsVisibility();

    // Clean up the current template's transition classes
    this._stripTransitionCSSClasses(this._currTmpltInst.divElt);

    // MPP 09/27/2013
    // Make sure to remove transition classes from any dialog snapshots as well
    if (this._currTmpltInst.properties.isDialog &&
            this._currTmpltInst.properties.snapshotTmpltDivElt) {
        this._stripTransitionCSSClasses(this._currTmpltInst.properties.snapshotTmpltDivElt);
    }

    // Note: if the previous template is a dialog, we already called this function, so there's no need to call it again
    if (this._prevTmpltInst == null || (this._prevTmpltInst && this._prevTmpltInst.properties.isDialog == false))
    {
        if (this._currTmpltInst.endTransitionTo)
        {
            this._currTmpltInst.endTransitionTo();
        }
    }
    
    // Call the user-defined transition complete function (if any)
    if (typeof this._transitionCompleteFwkCallback == 'function')
    {
        this._transitionCompleteFwkCallback();
    }
}; // end _transitionCompleted()
