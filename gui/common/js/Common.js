/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: Common.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: awoodhc
 Date: 08.27.2012
 __________________________________________________________________________

 Description: IHU GUI Common

 Revisions:
 v0.1 (27-Aug-2012) Create Common to handle all "system-wide" logic
 v0.2 (27-Aug-2012) Added basic logic for "global" controls, multicontroller events, transitions, ctrl clicks, basic BG logic
 v0.3 (28-Aug-2012) Added logic for alerts
 v0.4 (11-Oct-2012) Added logic to hide Home Button while on Home Screen
 v0.5 (04-Nov-2012) Added API to display App Name in Status Bar
                    Added Diag Entry logic
 v0.6 (08-Nov-2012) Added API for Setting the Left Button Style.
 v0.7 (19-Nov-2012) Changed Alert event to conform with MMUI standards. Added API to set the Status Bar Clock with value from MMUI.
 v0.8 (26-Nov-2012) Fixed Diagnostics Entry. Common now counts a sequence to make sure the sequence is complete before resetting.
 v0.9 (03-Dec-2012) Added message table for handling MMUI common messages and handling for LanguageChangeStatus msg
 v1.0 (05-Dec-2012) Added API to set state of status bar icons
 v1.1 (21-Jan-2012) Added new SBN and Wink logic
 __________________________________________________________________________

 */

log.addSrcFile("Common.js", "common");
//log.setLogLevel("common", "debug");

function Common()
{
    log.debug("constructor called...");

    //-- public variables
    this.moduleName = "common"; // (String) Name of this module (used in place of uiaId when instantiating controls)
    this.statusBar = null;      // (Object) Status Bar Control Object
    this.leftBtn = null;        // (Object) Left Button Control Object

    this.cmnCtrlsDisabled = false; // (Boolean) Whether to Status Bar/Left Button are disabled due to a dialog


    //-- private variables

    this._cachedTime = 0;        // (Number) Stores the time value sent from MMUI via GUI_SYSSETTINGS
    this._cachedTemplate = null; // (Object) template currently active in the DOM. Framework updates this.
    this._menuUpReceiverApp = null;    // (String) cached uiaId sent from MMUI when during a transition caused by a Menu Up action
    this._canShowSbns = false;   // (Boolean) true if Common can display SBNs over the cached template

    this._bgDiv1 = null;         // (HTMLElement) the background div
    this._bgDiv2 = null;         // (HTMLElement) used to transition between 2 backgrounds
    this._rightChrome = null;    // (HTMLElement) the div used to display the right-hand chrome
    this._customBgSet = false;    // (Boolean) true if there is a custom bg set by the current template
    this._defaultBgPath = "common/images/background.png"; // (String) the css path to the default bg image
    this._currentBgPath = this._defaultBgPath;            // (String) the css path to the current bg image

    this._wink = null;          // (Object) The active Wink Control Object (null if none displayed)
    this._winkTimeout = guiConfig.winkTimeout;   // (Number) milliseconds a Wink will stay on screen

    this._muteWink = null;       // (Object) The Entertainment Mute Wink Control Object (null if none displayed)

    this._cachedVuiState = null; // (String) Last VUI state sent from MMUI.
    this._vuiHelpDialog = null;   // (Object) The active VUI Help Dialog Control (null if none displayed)
    this._lineNumberData = null; // (Object) Contains data passed from a List pertaining to the VUI line numbers

    this._diagEntrySequence = 0; // (Number) 1 if the Diagnostics entry button sequence has begun. 2 if it has completed.
    this._clockHomeButtonLongPressIntervalId = null;

    this._atSpeed = false; // (Boolean) true if AtSpeed event is received from MMUI
    this._isMuted = false; // (Boolean) true if entertainment audio is currently muted

    this._contextCategory = new ContextCategory(); // (Object) Contains a lookup table to determine a context's category.

    //-- Status Bar Auto-Hide Variables
    // MPP 09/16/2013  SW00107357
    this._displaySbUmpByActivity = false; // (Boolean) Master switch for auto-hide status bar/UMP feature
    this._displaySbUmpActivityTypes = "both"; // (String) "both" for both touch & MC input to count as activity, "touch" for touch-only input
    this._inactivityTimer = null;   // (Object) The timer used to measure (in)activity for auto-hiding the status bar & UMP
    this._onInactivityBinder = this._onInactivity.bind(this);   // (Callback) Bind the timer callback once to save memory
    this._activityDetected = false;   // (Boolean) Flag raised on touch/MC input; lowered when inactivity timer expires
    this._sbRequestedState = "none";  // (String) External request to show/hide status bar
    this._sbDelay_ms = -1;          // (Integer) # of milliseconds before status bar animation starts (external request)
    this._sbDuration_ms = -1;       // (Integer) # of milliseconds status bar animation should take (external request)
    this._defaultSbDelay_ms = 0;    // (Integer) Default delay timing for status bar animation
    this._defaultSbDuration_ms = 500; // (Integer) Default duration timing for status bar animation
    this._defaultHelpPrompt = "SpeechNotAllowed_Help"; // (string) help promp name which requires default help screen

    //-- Status Bar Notification Variables
    /*
     * See _setKnownSbn() function for _knownSbns variable properties
     */
    this._knownSbns = new Object(); // (Object) key'd to SbnId, value is SbnObject with information necessary to display Sbn
    this._sbnIsDisplayed = false;   // (Boolean) Flag indicating whether an SBN is displayed (true) or not (false).
    this._displayedSbn = null;      // (Object) Refernce to the currently displayed Sbn Control.
    this._displayedSbnId = null;    // (String) SbnId of the currently displayed Sbn. null if none is displayed
    this._displayedSbnTimerId = 0;  // (Number) Timer ID used for timed Sbns.
    this._sbnQueue = new Array();   // (Array) Queue of all current Sbns by Id. 0 is next in line to be dispalyed.

    // Default SBN values used where value is not specified in UI Spec.
    var dfltDuration = 2000; // (Number) default number of milliseconds
    var dfltQueue = 0;    // (Number) default number of milliseconds

    // NOTE: State-based SBNs do not expire, but Timed SBNs should be queueTime 0 so that they do not re-appear (exception: driverId)

    this._SBN_TYPES = {        // (Object) contains list of Sbn Priorities by type, defined in System UI Spec

        //replaced old sbn types with new letter based sbn types(As per SCR SW00155262)
        "typeA": {"priority": 1, "timedDuration": 2000, "queueTime": 0},          // 1 is highest priority
        "typeB": {"priority": 2, "timedDuration": dfltDuration, "queueTime": dfltQueue},
        "typeL": {"priority": 3, "timedDuration": 5000, "queueTime": 60000},
        "typeC": {"priority": 4, "timedDuration": dfltDuration, "queueTime": dfltQueue},
        "typeD": {"priority": 5, "timedDuration": 5000, "queueTime": 0},
        "typeE": {"priority": 6, "timedDuration": 5000, "queueTime": 0},
        "typeF": {"priority": 7, "timedDuration": 5000, "queueTime": 0},
        "typeG": {"priority": 8, "timedDuration": 5000, "queueTime": 0},
        "typeI": {"priority": 9, "timedDuration": 5000, "queueTime": 0},
        "typeJ": {"priority": 10, "timedDuration": 5000, "queueTime": 0},
        "typeK": {"priority": 11, "timedDuration": dfltDuration, "queueTime": dfltQueue},
        "unknown": {"priority": 100, "timedDuration": dfltDuration, "queueTime": dfltQueue}
    };

    this._SBN_MAPPING_TABLE = {     // contains mapping of old sbn types with new letter based sbn types(As per SCR SW00155262)
        "volumeStatus" : "typeA",
        "vrStatus" : "typeB",
        "driverId" : "typeL",
        "navigationNear" : "typeC",
        "deviceConnected" : "typeD",
        "entertainmentInfo" : "typeE",
        "errorNotification" : "typeF",
        "btConnecting" : "typeG",
        "deviceRemoved" : "typeI",
        "navigationFar" : "typeJ",
        "systemFailure":  "typeK",
        "unknown": "unknown"
    };

    // Any SBN type in the blacklist will be blocked if it is requested. This is a centralized fix for evolving requirements.
    this._SBN_TYPE_BLACKLIST = [
        "typeK"
    ];

    //@formatter:off
    this._messageTable = {
        "LanguageChangeStatus" : this._LanguageChangeStatusMsgHandler.bind(this),
        "Global.AtSpeed" : this._AtSpeedMsgHandler.bind(this),
        "Global.NoSpeed" : this._NoSpeedMsgHandler.bind(this),
        "Global.PageUp" : this._PageUpDownMsgHandler.bind(this),
        "Global.PageDown" : this._PageUpDownMsgHandler.bind(this),
        "vuiState" : this._vuiStateMsgHandler.bind(this),
        "vuiMicLevel" : this._vuiStateMsgHandler.bind(this),
        "Global.SelectLineNumber" : this._SelectLineNumMsgHandler.bind(this),
        "Global.StartHelp" : this._ShowVuiHelpHandler.bind(this),
        "Global.HideHelp" : this._HideVuiHelpHandler.bind(this),
        "Global.StatusUpdateVolumeOnOff" : this._HandleStatusUpdateVolume.bind(this),
        "Global.MenuUpReceived" : this._MenuUpReceived.bind(this)

    }; // end of this._messageTable
    //@formatter:on


    //-- DOM logic
    // Add the background image to the body
    this._bgDiv1 = document.createElement('div');
    this._rightChrome = document.createElement('div');

    this._bgDiv1.id = "CommonBgImg1";
    this._bgDiv1.className = "CommonBgImg";

    this._rightChrome.id = "CommonRightChrome1";
    this._rightChrome.className = "CommonRightChrome";
    this._rightChrome.style.visibility = "hidden";

    document.body.appendChild(this._bgDiv1);
    document.body.appendChild(this._rightChrome);

    // Add controls to the DOM
    this.addControls();
};

/* (internal - called by framework)
 * Instantiates the LeftBtnControl and StatusBarCtrl (usually only happens when the language is changed)
 */
Common.prototype.addControls = function()
{
    log.debug("addControls called.");

    // Status Bar
    if (this.statusBar)//never add more than one instance of these controls
    {
        log.debug("status bar exists");
        // MPP 08/29/2013  SW00127573
        // Refresh status bar, rather than re-instantiating it, when languages change
        //framework.destroyControl(this.statusBar);
        //this.statusBar = null;
        this.statusBar._refresh();
    }
    else
    {
        log.debug("instantiating status bar");
        // create the status bar
        var statusProp = {
            "selectCallback" : this._statusBarClicked.bind(this),
            "longPressCallback" : this._statusBarLongPress.bind(this)
        };

        this.statusBar = framework.instantiateControl(this.moduleName, document.body, "StatusBarCtrl", statusProp);
    }

    // Left Button
    if (this.leftBtn)
    {
        //never add more than one instance of these controls
        //framework.destroyControl(this.leftBtn);
        //this.leftBtn = null;
    }
    else
    {
        // create the left button
        var lftBtnProp =  {"selectCallback" : this._leftBtnSelected.bind(this)};

        this.leftBtn = framework.instantiateControl(this.moduleName, document.body, "LeftBtnCtrl", lftBtnProp);

        this._checkTemplateProperties();
    }
};

/* (internal - called by framework)
 * Destroys the LeftButtonControl and StatusBarCtrl (usually only happens when the language is changed)
 */
Common.prototype.removeControls = function()
{
    if (this.statusBar)
    {
        framework.destroyControl(this.statusBar);
        this.statusBar = null;
    }

    if (this.leftBtn)
    {
        framework.destroyControl(this.leftBtn);
        this.leftBtn = null;
    }

};

/*
 * Checks templates properties for global controls. Called when a language change occurs
 */
Common.prototype._checkTemplateProperties = function()
{
    log.debug("_checkTemplateProperties called.");
    var template = this._cachedTemplate;
    //we should be able to use the cached template here, because when changing languages, we don't change context

    var data;
    if (template)
    {
        data = this._calcTransitionData(template);
    }
    else
    {
        //defaults
        log.debug("    No template could be found. Using default values.");
        data = new Object();
        data.leftButtonVisible = false;
        data.statusBarVisible = true;
    }

    log.debug("   Left Btn Visible: " + data.leftButtonVisible + ", Status Bar Visible: " + data.statusBarVisible);


    if (data.leftButtonVisible)
    {
        this.leftBtn.divElt.style.visibility = 'visible';
    }
    else
    {
        this.leftBtn.divElt.style.visibility = 'hidden';
    }

    if (data.statusBarVisible)
    {
        this.statusBar.divElt.style.visibility = 'visible';
    }
    else
    {
        this.statusBar.divElt.style.visibility = 'hidden';
    }

};

/* (internal)
 * Called by framework when a context change occurs and data is needed.
 * @param   template    (object) The template that will be transitioned to.
 */
Common.prototype.getCommonTransitionData = function(template)
{
    if (template == null)
    {
        log.error("getCommonTransitionData called with null template.");
        return;
    }

    // Terminate any activity timer that may be running so we don't see the
    // previous template's status bar or UMP sliding during the transition
    this._cleanUpInactivityTimer();

    this._updateMuteWinkOnTransition(this._cachedTemplate, template);

    this._closeVuiHelpOnTransition(template);

    // tell left button or the previous template to lose focus before the transition starts
    this.handleControllerEvent('lostFocus');

    // cache template:
    this._cachedTemplate = template;

    // Hide VUI Numbers
    this.leftBtn.hideLineNumbers();

    // Update _canShowSbns variable and hide active SBN if necessary
    this._updateCanShowSbns();

    var data = this._calcTransitionData(template);
    return data;
};

/* (private)
 * Returns an object with common transition data for the upcoming transition
 * @param   template    (object) The template that will be transitioned to.
 * @return  (object) Object containing common transition data
 */
Common.prototype._calcTransitionData = function(template)
{
    if (template.properties.customBgImage)
    {
        if (template.properties.customBgImage != this._currentBgPath)
        {
            this._bgDiv2 = document.createElement('div');
            this._bgDiv2.id = "CommonBgImg2";
            this._bgDiv2.className = "CommonBgImg";
            this._bgDiv2.style.backgroundImage = "url(" + template.properties.customBgImage + ")";
            this._currentBgPath = template.properties.customBgImage;
            document.body.insertBefore(this._bgDiv2, this._bgDiv1);
            this._customBgSet = true;
        }
    }
    else if (this._customBgSet == true) // don't transition to default bg on a dialog
    {
        this._bgDiv2 = document.createElement('div');
        this._bgDiv2.id = "CommonBgImg2";
        this._bgDiv2.className = "CommonBgImg";
        this._bgDiv2.style.backgroundImage = "url(" + this._defaultBgPath + ")";
        this._currentBgPath = this._defaultBgPath;
        document.body.insertBefore(this._bgDiv2, this._bgDiv1);
        this._customBgSet = false;
    }

    // Check for menu up
    var menuUpUsed = false;
    if (this._menuUpReceiverApp)
    {
        if (this._menuUpReceiverApp === this._cachedTemplate.contextInfo.uiaId)
        {
            menuUpUsed = true;
        }
        this._menuUpReceiverApp = null;
    }

    //@formatter:off
    var commonTransitionData = {
        // references to system control objects
        "statusBar" : this.statusBar,
        "leftButton" : this.leftBtn,
        // booleans
        "statusBarVisible" : template.properties.statusBarVisible,
        "leftButtonVisible" : template.properties.leftButtonVisible,
        "menuUpUsed": menuUpUsed,
        // bg data
        "customBgImage" : template.properties.customBgImage,
        "bgDiv1" : this._bgDiv1,
        "bgDiv2" : this._bgDiv2,
        // other
        "rightChrome" : this._rightChrome,
        "rightChromeVisible": (template.properties.rightChromeVisible === true) ? true : false
    };

    if (template.properties.isDialog)
    {
        // Preserve left button visibility from the previous context when going to a dialog context.
        commonTransitionData.leftButtonVisible = this.leftBtn.divElt.style.visibility === "visible";
        commonTransitionData.rightChromeVisible = this._rightChrome.style.visibility === "visible";
    }

    //@formatter:on
    return commonTransitionData;
};

/* (internal)
 * Callback for when the controls transition completes. Currently only used for custom backgrounds
 * @param   transitionData (object) the data that was used during the transition
 */
Common.prototype.commonControlsUpdateComplete = function(transitionData)
{
    if (transitionData.bgDiv2)
    {
        // bgDiv2 transitioned in, so we need to remove bgDiv1
        utility.removeHTMLElement(transitionData.bgDiv1.id);

        this._bgDiv1 = this._bgDiv2;
        this._bgDiv1.id = "CommonBgImg1";
        this._bgDiv2 = null;
    }

    if (framework.getCurrentApp() == "syssettings" && framework.getCurrCtxtId() == "DisplayTab")
    {
        this.statusBar.enableClockBtn(true);
    }
    else
    {
        this.statusBar.enableClockBtn(false);
        this._diagEntrySequence = 0; // reset the sequence on context change
    }

    // Retrieve the types of input that will count as user activity, and then
    // turn on activity monitoring for this context/template (if needed)
    this._displaySbUmpActivityTypes = "both";
    if (this._cachedTemplate.properties.displaySbUmpActivityTypes === "both" ||
             this._cachedTemplate.properties.displaySbUmpActivityTypes === "touch") {
        this._displaySbUmpActivityTypes = this._cachedTemplate.properties.displaySbUmpActivityTypes;
    }

    this._setDisplaySbUmpByActivityEnabled(this._cachedTemplate.properties.displaySbUmpByActivity == true);

    // show SBN if needed
    if (this._canShowSbns)
    {
        // If there's NO SBN displayed
        if (!this._displayedSbnId)
        {
            // ENTRY POINT #2
            // If a new SBN gets displayed, _displaySbnFromQueue will return the ID
            var newSbnId = this._displaySbnFromQueue();

            if (newSbnId)
            {
                // Tell Status Bar about the SBN
                this._sbnIsDisplayed = true;
                this.statusBar.setSbnDisplayed(this._sbnIsDisplayed);

                if (this._cachedTemplate.properties.statusBarVisible)
                {
                    // Snap the status bar visible (only if this template is set to display a status bar)
                    this.statusBar.transitionVisible(0, 0, "slide", true);
                }

                // Notify MMUI to turn on display if needed.
                framework.sendEventToMmui("system", "DisplayOffNotificationEvent", {"payload": {"notificationActive": 1}});
            }

        }
    }

    this.handleControllerEvent('acceptFocusInit');

};

/* (internal - Called by Controls)
 * Sends a "lostFocus" Multicontroller event to the currently focused Control so that the
 * Control calling stealFocus() can gain focus.
 * After calling this API, the calling Control -must- gain focus automatically.
 */
Common.prototype.stealFocus = function()
{
    var response = null;

    if (this.leftBtn.btnInstance.hasFocus)
    {
        response = this.leftBtn.handleControllerEvent("lostFocus");
    }
    else if (this._cachedTemplate && this._cachedTemplate.handleControllerEvent)
    {
        response = this._cachedTemplate.handleControllerEvent("lostFocus");
    }
    else
    {
        log.warn("Cannot steal focus. Common's cached template is either null or does not have handleControllerEvent.");
    }

    return response;
};

/* (internal - Called by framework)
 * Handles multicontroller events, specifically the left event for the leftBtn
 * @param   eventID (string) any of the “Internal event name” values in IHU_GUI_MulticontrollerSimulation.docx (e.g. 'cw',
 * 'ccw', 'select')
 * @return  true if common 'consumed' the tui event. false otherwise.
 */
Common.prototype.handleControllerEvent = function(eventId, firstEvent)
{
    if (eventId == "goBack") // Note: "goBack" event sent from Multicontroller.js indicates the TUI back key has been pressed
    {
        framework.sendEventToMmui("common", "Global.GoBack");
    }

    // The first event is thrown away, but "controllerActive" is still passed to the template/control to change its highlight
    // Thus, "ccw" will come in with firstEvent true, but "controllerActive" will also come in separately with firstEvent false
    if (firstEvent)
    {
        log.debug("    firstEvent detected. Ignoring.");
        return;
    }

    // Test whether one of Common/Global controls has multicontroller focus and react accordingly

    if (this._cachedTemplate && this._cachedTemplate.handleControllerEvent)
    {
        // always pass along controller active and touch active
        if (eventId != "touchActive" && eventId != "controllerActive")
        {
            if (this.leftBtn.btnInstance.hasFocus)
            {
                var response = this.leftBtn.handleControllerEvent(eventId);
                if (response == "giveFocusRight")
                {
                    var response = this._cachedTemplate.handleControllerEvent("acceptFocusFromLeft");
                    if (response == "consumed")
                    {
                        this.leftBtn.handleControllerEvent("lostFocus");
                    }
                }
            }
            else
            {
                var response = this._cachedTemplate.handleControllerEvent(eventId);
                if (response == "giveFocusLeft" && this._cachedTemplate.properties.leftButtonVisible)
                {
                    this.leftBtn.handleControllerEvent("acceptFocusFromRight");
                    this._cachedTemplate.handleControllerEvent("lostFocus");
                }
            }
        }
        else
        {
            // always pass along controller active and touch active
            if (this.leftBtn) // left button check to prevent race conditions during language change
            {
                this.leftBtn.handleControllerEvent(eventId);
            }
            // _cachedTemplate is checked above
            this._cachedTemplate.handleControllerEvent(eventId);

        }

    }
    else
    {
        log.warn("Common's cached template is either null or does not have handleControllerEvent.");
    }
};

/* (internal - Called by framework)
 * Handles alert messages from framework, sent by MMUI.
 */
Common.prototype.handleAlert = function(uiaId, alertId, params)
{
    log.debug("handleAlert called.");

    // MMUI should never send two alerts at once. This is a backup check.
    if (this._wink)
    {
        return;
    }

    var app = framework.getAppInstance(uiaId);
    var properties = null;

    if (app && app.getWinkProperties) // check for App method
    {
        properties = app.getWinkProperties(alertId, params);
    }

    // NOTE: Even though we can't show the Wink, I still call into the GUI App (above) in case they have logic that needs to be done
    if (!this._canShowSbns)
    {
        // We're in a context that can't show Winks. Immediately Ack
        framework.websockets.sendAlertCompleteMsg(uiaId, alertId);
        return;
    }

    if (!properties) // if no properties are set, use the default paragraph style
    {
        // legacy wink. Use paragraph style.
        log.info("No properties returned by app: " + uiaId + ". Using default Wink style.");
        properties = {
            "style": "style03",
            "text1Id": alertId
        };
    }

    // no matter what, common should set these properties
    properties.winkTimeout = this._winkTimeout;
    properties.alertId = alertId;
    properties.completeCallback = this._alertComplete.bind(this);

    this._wink = framework.instantiateControl(uiaId, document.body, 'WinkCtrl', properties);

};

/* Called by framework when a data message is sent from Mmui.
 * This will pass the message information into any function the app has set in this._messageTable
 * @tparam  Object  msg     The parsed message object sent from Mmui
 */
Common.prototype.handleDataMessage = function(msg)
{
    log.debug("GUI COMMON" +  " handleDataMessage called for", msg.msgId);

    if (this._messageTable && this._messageTable[msg.msgId])
    {
        this._messageTable[msg.msgId](msg);
    }
    else
    {
        log.warn("GUI COMMON" +  " No message handler for", msg.msgId);
    }
};


/*
 * Handler for LanguageChangeStatus message
 * @tparam  Object  msg     The parsed message object sent from Mmui
 */
Common.prototype._LanguageChangeStatusMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.languageID)
    {
        var langCode = framework.localize.getLangInGuiFormat(msg.params.payload.languageID);
    }

    if (msg && msg.params && msg.params.payload && msg.params.payload.status)
    {
        var status = msg.params.payload.status;
    }

    var bStatus = false;

    if (status == "Success")
    {
        bStatus = true;
    }
    else
    {
        bStatus = false;
    }

    // Call unload dictionaries
    framework.localize.unloadDictionaries(langCode,bStatus);
};

/*
 * Handler for AtSpeed message
 * @tparam  Object  msg     The parsed message object sent from Mmui
 */
Common.prototype._AtSpeedMsgHandler = function(msg)
{
    log.info("Common.prototype._AtSpeedMsgHandler called",msg);
    this._atSpeed = true;
    framework.sendMsgToFocusedApp(msg);
};

/*
 * Handler for NoSpeed message
 * @tparam  Object  msg     The parsed message object sent from Mmui
 */
Common.prototype._NoSpeedMsgHandler = function(msg)
{
    log.info("Common.prototype._NoSpeedMsgHandler called",msg);
    this._atSpeed = false;
    framework.sendMsgToFocusedApp(msg);
};

/*
 * Handler for PageUp & PageDown messages
 * @tparam  Object  msg     The parsed message object sent from Mmui
 */
Common.prototype._PageUpDownMsgHandler = function(msg)
{
    log.debug("Common.prototype._PageUpDownMsgHandler called", msg);

    // Assume no list exists
    var result = "NoList";
    var eventName = null;
    var apiName = null;

    // Determine the result event name, based on the incoming message
    // (independent of anything to do with a list)
    switch (msg.msgId)
    {
        case "Global.PageUp":
            eventName = "Global.PageUpResult";
            apiName = "pageUp";
            break;
        case "Global.PageDown":
            eventName = "Global.PageDownResult";
            apiName = "pageDown";
            break;
        default:
            log.error("_PageUpDownMsgHandler called with non-pagination event!");
            break;
    }

    // If we have a list and an API on it to call, ...
    if (this._cachedTemplate && this._cachedTemplate.templateName === "List2Tmplt" && this._cachedTemplate.list2Ctrl && apiName)
    {
        // ... call that API!
        response = this._cachedTemplate.list2Ctrl[apiName]();
        result = response.charAt(0).toUpperCase() + response.slice(1);  // make sure first letter is uppercase
    }

    // Compose result & send to MMUI
    if (eventName)
    {
        var params = {
            "payload": {
                "pageStatus": result
            }
        };

        framework.sendEventToMmui("common", eventName, params);
    }
};

/*
 * Handler for VUI Mic messages
 * @tparam  Object  msg     The parsed message object sent from Mmui
 */
Common.prototype._vuiStateMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload)
    {
        if (msg.msgId == "vuiState")
        {
            var showLineNumbers = false;
            this._cachedVuiState = msg.params.payload.state;
            // End the current SBN in case we need to change styles
            this.endStateSbn(this.moduleName, "StateSbn_vuiState", "typeB", properties);
            switch(this._cachedVuiState)
            {
                case "Not Ready": // intentional fall-through
                case "Idle":
                case "Playing Out of Session Alert":
                    // Do nothing. SBN is automatically ended
                    break;
                case "Playing Prompt":
                    // Show "Wait for Tone" SBN
                    var properties = {
                        "sbnStyle": "Style02",
                        "imagePath1": "IcnSbnMicClosed.png",
                        "text1Id": "common.SbnWaitForTone"
                    };
                    this.showStateSbn(this.moduleName, "StateSbn_vuiState", "typeB", properties);
                    showLineNumbers = true;
                    break;
                case "Listening":
                    // Show sound meter SBN starting at 0
                    var properties = {
                        "sbnStyle": "Style04",
                        "imagePath1": "IcnSbnMicOpen.png",
                        "meter": {"meterType": "audio02", "min": 0, "max": 4000, "currentValue": 0}
                    };
                    this.showStateSbn(this.moduleName, "StateSbn_vuiState", "typeB", properties);
                    showLineNumbers = true;
                    break;
                case "Processing": // Intentional fallthrough. Show SBN with icon only
                case "Playing Terminating Prompt":
                    // Show SBN with icon only
                    var properties = {
                        "sbnStyle": "Style02",
                        "imagePath1": "IcnSbnMicClosed.png",
                        "text1": null
                    };
                    this.showStateSbn(this.moduleName, "StateSbn_vuiState", "typeB", properties);
                    break;
                default:
                    log.warn("Unknown VUI State was sent to GUI: " + this._cachedVuiState);
                    break;
            }

            this._showHideLineNumbers(showLineNumbers);
        }
        else if (msg.msgId == "vuiMicLevel")
        {
            var micLevel = parseInt(msg.params.payload.micLevel);
            // clamp the micLevel value. SBN meter does not support negative numbers
            micLevel += 3000;
            // Adjust very low mic values to show 1-2 bars
            if (micLevel < -2100)
            {
                micLevel = 50;
            }
            else if (micLevel < 100)
            {
                micLevel = 100;
            }

            if (this._cachedVuiState == "Listening")
            {
                // Update state-based SBN with current mic level
                var properties = {
                    "sbnStyle": "Style04",
                    "imagePath1": "IcnSbnMicOpen.png",
                    "meter": {"meterType": "audio02", "min": 0, "max": 4000, "currentValue": micLevel}
                };
                this.showStateSbn(this.moduleName, "StateSbn_vuiState", "typeB", properties);
            }
        }
    }
};

/*
 * Handler for SelectLineNumber message
 * @tparam  Object  msg     The parsed message object sent from Mmui
 */
Common.prototype._SelectLineNumMsgHandler = function(msg)
{
    log.debug("Common.prototype._SelectLineNumMsgHandler called", msg);

    if (msg && msg.params && msg.params.payload)
    {
        var number = msg.params.payload.lineNumber;
    }
    else
    {
        return;
    }

    var result = "NoList"; // status to send back to MMUI (default to NoList)

    // Is the current template a list?
    if (this._cachedTemplate && this._cachedTemplate.templateName == "List2Tmplt")
    {
        // Does the list have data and support VUI?
        if (this._cachedTemplate.list2Ctrl.dataList && this._cachedTemplate.list2Ctrl.dataList.vuiSupport == true)
        {
            log.info("Sending Line Number to List: " + number);
            // List will return a result
            var response = this._cachedTemplate.list2Ctrl.selectLine(number);

            if (response == "selected")
            {
                return; // No event from Common if "selected" is response
            }

            result = response.charAt(0).toUpperCase() + response.slice(1); // first letter uppercase
        }
    }

    log.info("SelectLineResult is ", number, result);
    var params = {
        "payload" : {
            "lineNumber": number,
            "lineStatus": result
        }
    };
    framework.sendEventToMmui("common", "Global.SelectLineResult", params);
};

/*
 * Handler for Global.StartHelp message
 * @tparam  Object  msg     The parsed message object sent from Mmui
 */
Common.prototype._ShowVuiHelpHandler = function(msg)
{
    log.debug("Common.prototype._ShowVuiHelpHandler called", msg);

    // Hide any currently displayed VUI Help
    this._HideVuiHelpHandler(msg);

    // Validate that this help overlay request is for the currently displayed context.
    if (framework.getCurrentApp() === msg.params.payload.currentUiaId &&
        framework.getCurrCtxtId() === msg.params.payload.currentContextId)
    {
        // Try to load a VUI Help configuration and display it if found
        var targetUiaId = msg.params.payload.uiaId;
        var helpPromptName = msg.params.payload.helpPromptName;
        var dialogProperties = this._getVuiHelpDialogConfiguration(targetUiaId, helpPromptName);
        if (dialogProperties)
        {
            this._vuiHelpDialog = framework.instantiateControl(dialogProperties.uiaId, document.body, 'Dialog3Ctrl', dialogProperties.dialogConf);
            this._vuiHelpDialog.divElt.classList.add("Dialog3Ctrl_Style19_NoTemplateInstance");

            // Add properties to the control to record the uiaId and contextId. See also _closeVuiHelpOnTransition().
            this._vuiHelpDialog._uiaId = msg.params.payload.currentUiaId;
            this._vuiHelpDialog._contextId = msg.params.payload.currentContextId;
        }
    }
    else
    {
        log.warn("Ignoring Global.StartHelp message because GUI is in context '"
            + framework.getCurrentApp()
            + " "
            + framework.getCurrCtxtId()
            + "' but the message is for a different context: "
            + JSON.stringify(msg));
    }
};

/*
 * Handler for Global.HideHelp message
 * @tparam  Object  msg     (optional) The parsed message object sent from Mmui
 */
Common.prototype._HideVuiHelpHandler = function(msg)
{
    log.debug("Common.prototype._HideVuiHelpHandler called");

    if (this._vuiHelpDialog)
    {
        framework.destroyControl(this._vuiHelpDialog);
        this._vuiHelpDialog = null;
    }
};

/*
 * Close Vui Help at the start of a transition to a new template if that template represents a different context.
 */
Common.prototype._closeVuiHelpOnTransition = function(template)
{
    if (this._vuiHelpDialog
        && template
        && template.contextInfo.uiaId != this._vuiHelpDialog._uiaId
        && template.contextInfo.ctxtId != this._vuiHelpDialog._contextId)
    {
        this._HideVuiHelpHandler(null);
    }
};

/*
 * Returns a configuration object for a VUI help dialog3 control prompt from an app's dictionary.
 * Returns null if no prompt text is found in the dictionary.
 * @tparam String uiaId The application requesting the VUI help.
 * @tparam String helpPromptName The name of the help prompt to look for in the dictionary.
 */
Common.prototype._getVuiHelpDialogConfiguration = function(uiaId, helpPromptName)
{
    var config = {
        dialogConf: {
            contentStyle: "style19",
            titleStyle : "titleStyle03"
        },
        uiaId: uiaId
    };
    var found = false;

    // When help prompt name which requires default default help screen is received show system/Home help screen
    if (this._defaultHelpPrompt === helpPromptName)
    {
        helpPromptName = "HomeScreen_Help";
        uiaId = "system";
        config.uiaId = uiaId;
    }

    // Dictionary strings for a VUI help prompt have specific computable stringIds.
    for (var i = 1; i <= 5; ++i)
    {
        var leftStringId = "VrHelp_" + helpPromptName + "_Left" + i;
        if (framework.localize.testLocStr(uiaId, leftStringId))
        {
            config.dialogConf["text" + i.toString() + "Id"] = leftStringId;
            found = true;
        }

        var rightStringId = "VrHelp_" + helpPromptName + "_Right" + i;
        if (framework.localize.testLocStr(uiaId, rightStringId))
        {
            config.dialogConf["text" + (i + 5).toString() + "Id"] = rightStringId;
        }
    }

    if (found)
    {
        var titleId = "VrHelp_" + helpPromptName + "_Title";
        if (framework.localize.testLocStr(uiaId, titleId))
        {
            config.dialogConf.titleId = titleId;
        }
        else
        {
            // No title found in dictionary -- use default title
            config.dialogConf.titleId = "common.VuiHelpDefaultTitle";
        }
    }

    return (found) ? config : null;
};

/*
 * Function called by apps to determine if vehicle is at speed
 * @return Boolean true if vehicle is at speed
 */
Common.prototype.getAtSpeedValue = function()
{
    return this._atSpeed;
};

/*
 * Tells the status bar to show/hide the Home button
 * @param show Boolean     true if the home button should be displayed. false if it should be hidden.
 */
Common.prototype.showSbHomeButton = function(show)
{
    this.statusBar.showHomeBtn(show);
};

/*
 * (internal) Called by framework. Sets the App name text/image in the status bar
 * @param label String  Literal text name or image path to display in the status bar
 */
Common.prototype.setSbName = function(label)
{
    // setAppName() will differentiate between text & imagery
    this.statusBar.setAppName(label);
};

/*
 * (internal) Called by framework. Sets the translated App name text in the status bar
 * @param uiaId     String  UiaId of the App the string should be translated for
 * @param labelId   String  StringID to be translated
 * @param subMap    Object  Optional subMap to be placed in the text
 */
Common.prototype.setSbNameId = function(uiaId, labelId, subMap)
{
    this.statusBar.setAppNameId(uiaId, labelId, subMap);
};

/*
 * (internal) Called by framework. Sets the icon between the Home Button and the App Name in the status bar
 * @param   path    String  Path from index.html to icon. Pass null to remove current icon
 */
Common.prototype.setSbDomainIcon = function(path)
{
    this.statusBar.setDomainIcon(path);
};

/*
 * Updates the state of a Status Bar Icon
 * @param   name    String  Base Icon name ("Batt", "PhoneSignal", "Roaming", "Traffic", "WifiSignal", "Music", "Bluetooth", "Message")
 * @param   visible Boolean True if the icon should be shown. False if it should be hidden
 * @param   state   String  (Optional) String corrsponding to the state of the icon ("00", "01", "02", "03", "04", "05")
 */
Common.prototype.setSbIcon = function(name, visible, state)
{
    this.statusBar.setIcon(name, visible, state);
};

/*
 * Utility API for enabling/disabling auto-hide behavior for status bar & UMP
 * @param isEnabled     Boolean Auto-hides the status bar and UMP by internal inactivity timer (when true)
 */
Common.prototype._setDisplaySbUmpByActivityEnabled = function(isEnabled)
{
    this._displaySbUmpByActivity = isEnabled;

    if (this._displaySbUmpByActivity) {
        // remove any existing non-transparent div
        if (this._nonTransparentDiv)
        {
            utility.removeHTMLElement(this._nonTransparentDiv);
            this._nonTransparentDiv = null;
        }

        // create a non-transparent div so that opera receives touch events
        this._nonTransparentDiv = document.createElement('div');
        this._nonTransparentDiv.className = "CommonNonTransparentDiv";
        document.body.insertBefore(this._nonTransparentDiv, document.body.firstChild);

        // Detect activity to kick everything off
        this.activityDetected(true, null);
    }
    else
    {
        // Remove the non-transparent div
        utility.removeHTMLElement(this._nonTransparentDiv);
        this._nonTransparentDiv = null;

        // Shut down any timer we may have running
        this._cleanUpInactivityTimer();

        // Set the activity flag to "true" to force status bar & UMP visibility
        this._activityDetected = true;
        this._updateSbUmpVisibility();

        // Reset the activity detected flag
        this._activityDetected = false;
    }

    // Ignore any prior external show/hide requests
    this._sbRequestedState = "none";
};

/*
 * Public API for external applications (e.g. TV) to request that the status bar be shown
 * @param delay_ms      Integer The number of milliseconds to wait before starting the status bar animation
 * @param duration_ms   Integer The number of milliseconds the status bar animation should take to complete
 * @param receipt_cb    Function The function to call to signal receipt of the request
 */
Common.prototype.requestStatusBarShown = function(delay_ms, duration_ms, receipt_cb)
{
    log.debug("requestStatusBarShown(" + delay_ms + ", " + duration_ms + ")");

    // Cache requested status bar timings
    if ((utility.toType(delay_ms) == "number") &&
            (delay_ms >= 0)) {
        // Store custom delay timing
        this._sbDelay_ms = delay_ms;
    }
    else {
        // Store default delay timing
        this._sbDelay_ms = this._defaultSbDelay_ms;
    }
    if ((utility.toType(duration_ms) == "number") &&
            (duration_ms >= 0)) {
        // Store custom duration timing
        this._sbDuration_ms = duration_ms;
    }
    else {
        // Store default duration timing
        this._sbDuration_ms = this._defaultSbDuration_ms;
    }

    // Remember the external request
    this._sbRequestedState = "shown";

    // Update the controls' visibility
    this._updateSbUmpVisibility();

    // If a receipt callback was provided, ...
    if (utility.toType(receipt_cb) === "function") {
        // Call it to signal receipt of the request
        receipt_cb();
    }
};

/*
 * Public API for external applications (e.g. TV) to request that the status bar be hidden
 * @param delay_ms      Integer The number of milliseconds to wait before starting the status bar animation
 * @param duration_ms   Integer The number of milliseconds the status bar animation should take to complete
 * @param receipt_cb    Function The function to call to signal receipt of the request
 */
Common.prototype.requestStatusBarHidden = function(delay_ms, duration_ms, receipt_cb)
{
    log.debug("requestStatusBarHidden(" + delay_ms + ", " + duration_ms + ")");

    // Cache requested status bar timings
    if ((utility.toType(delay_ms) === "number") &&
            (delay_ms >= 0)) {
        // Store custom delay timing
        this._sbDelay_ms = delay_ms;
    }
    else {
        // Store default delay timing
        this._sbDelay_ms = this._defaultSbDelay_ms;
    }
    if ((utility.toType(duration_ms) === "number") &&
            (duration_ms >= 0)) {
        // Store custom duration timing
        this._sbDuration_ms = duration_ms;
    }
    else {
        // Store default duration timing
        this._sbDuration_ms = this._defaultSbDuration_ms;
    }

    // Remember the external request
    this._sbRequestedState = "hidden";

    // Update the controls' visibility
    this._updateSbUmpVisibility();

    // If a receipt callback was provided, ...
    if (utility.toType(receipt_cb) == "function") {
        // Call it to signal receipt of the request
        receipt_cb();
    }
};

/*
 * Public hook for notification (from Multicontroller.js) about user activity (touch/keyboard/multicontroller input)
 * @param isActive  (Boolean) Flag indicating if activity is detected (true) or not (false)
 * @param evt       (Object) The Opera event that generated the activity
 * @param tuiEvent  (String) If this is a multicontroller action, the corresponding eventId will be passed
 */
Common.prototype.activityDetected = function(isActive, evt, tuiEvent)
{
    // If we're using local timing ...
    if (this._displaySbUmpByActivity)
    {
        // Get the current position & height of the status bar
        // (so we can detect if we've selected it or not)
        var det = this.statusBar.divElt.offsetTop;
        var deh = this.statusBar.divElt.offsetHeight;

        var legalEvent = false; // will be set to true if this event can trigger activity given the configuration

        // If we have no event, or we have a legal event and the status bar itself wasn't selected, ...
        if (evt == null)
        {
            // null event is used for special case private calls within Common.js
            legalEvent = true;
        }
        else if (evt.type == "mouseup" || evt.type == "mousedown")
        {
            // mouse events can trigger on "touch" or "both", but only if they are not on the Status Bar
            if (this._displaySbUmpActivityTypes == "both" || this._displaySbUmpActivityTypes == "touch")
            {
                if (evt.pageX <= 800)
                {
                    if (evt.pageY >= (det + deh))
                    {
                        legalEvent = true;
                    }
                    else if (evt.type == "mouseup")
                    {
                        // mouse up occurred in the status bar. Very specific case to account for touch-and-drag
                        legalEvent = true;
                    }
                }
            }

        }
        else if (evt.type == "keydown" || evt.type == "keyup" || evt.type == "mousewheel")
        {
            // Multicontroller event can only trigger if the activity type is "both"
            if (this._displaySbUmpActivityTypes == "both")
            {
                legalEvent = true;
            }
        }

        if (legalEvent)
        {
            log.debug("activityDetected()", isActive, evt);

            // Check if the activity state has changed
            var stateChanged = (this._activityDetected != isActive);

            // Update the internal activity state
            this._activityDetected = isActive;

            // (Re)start the timer to measure inactivity
            if (this._activityDetected) {
                // a press down via touch or MC should not trigger the Inactivity timeout
                var triggerTimer = true;
                if (evt != null)
                {
                    if (evt.type == "mousedown")
                    {
                        triggerTimer = false;
                    }
                    else if (evt.type == "keydown")
                    {
                        // Exception: rotations should still trigger the Inactivity timeout
                        if (tuiEvent != "cw" && tuiEvent != "ccw")
                        {
                            triggerTimer = false;
                        }
                    }
                }

                if (triggerTimer == false)
                {
                    // just clean up the timer
                    this._cleanUpInactivityTimer();
                }
                else
                {
                    this._startInactivityTimer();
                }
            }

            // If the activity state changed, ...
            if (stateChanged) {
                // ... update the controls' visibility
                this._updateSbUmpVisibility();
            }
        }
    }
};

Common.prototype._startInactivityTimer = function()
{
    // Clean up any existing inactivity timer
    this._cleanUpInactivityTimer();

    if (this._displaySbUmpByActivity) {
        // (Re)start inactivity timer for a 3-second wait
        this._inactivityTimer = setTimeout(this._onInactivityBinder, 3000);
    }
};

Common.prototype._onInactivity = function()
{
    // Clear the timer that got us here
    this._cleanUpInactivityTimer();

    if (this._displaySbUmpByActivity) {
        // Local inactivity timer has expired -- lower the flag
        this._activityDetected = false;

        // Update the controls' visibility
        this._updateSbUmpVisibility();
    }
};

Common.prototype._cleanUpInactivityTimer = function()
{
    if (this._inactivityTimer != null) {
        // Clean up any existing inactivity timer
        clearTimeout(this._inactivityTimer);
        this._inactivityTimer = null;
    }
};

Common.prototype._updateSbUmpVisibility = function()
{
    if (this._displaySbUmpByActivity || this._sbRequestedState != "none")
    {
        log.debug("_updateSbUmpVisibility()");
        log.debug("this._sbRequestedState = " + this._sbRequestedState);
        log.debug("this._activityDetected = " + this._activityDetected);
        log.debug("this._sbnIsDisplayed = " + this._sbnIsDisplayed);

        // Default values for status bar animation timing
        var delay_ms = this._defaultSbDelay_ms;
        var duration_ms = this._defaultSbDuration_ms;

        // Are the conditions right for showing the status bar?
        if ((this._cachedTemplate.properties.statusBarVisible) && ((this._sbRequestedState === "shown") || this._activityDetected || this._sbnIsDisplayed)) {
            // Yes -- show it
            if (this._sbRequestedState === "shown") {
                // Use custom timings from external request
                delay_ms = this._sbDelay_ms;
                duration_ms = this._sbDuration_ms;
            }

            // Show the status bar
            this.statusBar.transitionVisible(delay_ms, duration_ms, "slide", true);
        }
        else if ((this._sbRequestedState == "hidden" || !this._activityDetected) && !this._sbnIsDisplayed) {
            // No -- hide it
            if (this._sbRequestedState == "hidden") {
                // Use custom timings from external request
                delay_ms = this._sbDelay_ms;
                duration_ms = this._sbDuration_ms;
            }

            // Hide the status bar
            this.statusBar.transitionVisible(delay_ms, duration_ms, "slide", false);
        }

        if (this._activityDetected) {
            // Call template's "showing started" callback, if available
            if (utility.toType(this._cachedTemplate["onActivityShowing"]) == "function") {
                this._cachedTemplate.onActivityShowing(delay_ms, duration_ms);
            }
        }
        else {
            // Call template's "hiding started" callback, if available
            if (utility.toType(this._cachedTemplate["onActivityHiding"]) == "function") {
                this._cachedTemplate.onActivityHiding(delay_ms, duration_ms);
            }
        }

        // Reset the externally-requested timings to default -- if the status bar was actually shown/hidden
        // on this call, the timings were already used.  Otherwise, the status bar couldn't be changed (e.g.
        // an SBN was displayed), so the timings need to be reset for the next pass.
        this._sbDelay_ms = this._defaultSbDelay_ms;
        this._sbDuration_ms = this._defaultSbDuration_ms;
    }
};

/*
 * Adds a timed Sbn with the given properties to the Status Bar queue
 */
Common.prototype.startTimedSbn = function(uiaId, sbnId, type, properties)
{
    log.debug("Timed SBN requested by " + uiaId + " with id: " + sbnId);

    var uniqueId = uiaId + sbnId;
    this._requestNewSbn(uiaId, uniqueId, type, properties, true);
};

/*
 * Removes a timed Sbn with the given properties to the Status Bar queue
 */
Common.prototype.cancelTimedSbn = function(uiaId, sbnId, type)
{
    var uniqueId = uiaId + sbnId;

    if (utility.toType(sbnId) != 'string' || !this._knownSbns[uniqueId])
    {
        log.debug("Cannot cancel unknown sbnId: " + sbnId + " for App: " + uiaId);
        return;
    }

    // set the expiration to the current time. this will remove the SBN when it comes up in queue, but
    // will not remove it if it is already being displayed
    this._knownSbns[uniqueId].expiration = new Date().getTime();
};

/*
 * Adds a state-based Sbn with the given properties to the Status Bar queue
 */
Common.prototype.showStateSbn = function(uiaId, sbnId, type, properties)
{
    log.debug("State-based SBN requested by " + uiaId + " with id: " + sbnId);

    var uniqueId = uiaId + sbnId;
    this._requestNewSbn(uiaId, uniqueId, type, properties, false);
};

/*
 * Removes a state-based Sbn with the given properties to the Status Bar queue
 */
Common.prototype.endStateSbn = function(uiaId, sbnId, type)
{
    var uniqueId = uiaId + sbnId;

    if (utility.toType(sbnId) != 'string' || !this._knownSbns[uniqueId])
    {
        log.debug("Cannot end unknown sbnId: " + sbnId + " for App: " + uiaId);
        return;
    }

    log.debug("Ending State SBN: " + sbnId + " for App: " + uiaId);

    // If it is currently being displayed, remove it
    if (uniqueId == this._displayedSbnId)
    {
        this._removeDisplayedSbn();
    }
    else if (this._sbnQueue.indexOf(uniqueId) != -1)
    {
        // if in queue, remove from queue
        this._sbnQueue.splice(this._sbnQueue.indexOf(uniqueId), 1);
    }

    // if none displayed, display first in queue
    if (!this._displayedSbnId)
    {
        this._displaySbnFromQueue();
    }
};

/*
 * Sets how many numbers are shown in the LeftButton chrome. Called by List any time
 * the visible line count changes
 * @param   count   Number  Integer indicating how many line numbers should be shown.
 * @param   style   String  Left Button VUI Number style (see Left Button SDD for information)
 */
Common.prototype.setLineNumbers = function(count, style)
{
    if (utility.toType(count) != 'number' || utility.toType(style) != 'string')
    {
        log.warn("Type error: setLineNumbers must be called with count as integer and style as string");
        return;
    }

    this._lineNumberData = {"count": count, "style": style};

    var showLineNumbers = false;
    switch(this._cachedVuiState)
    {
        case "Not Ready":
            break;
        case "Idle":
            break;
        case "Playing Out of Session Alert":
            break;
        case "Playing Prompt":
            // Show "Wait for Tone" SBN
            showLineNumbers = true;
            break;
        case "Listening":
            // Show sound meter SBN starting at 0
            showLineNumbers = true;
            break;
        case "Processing":
            // Show SBN with no text or meter
            break;
        case "Playing Terminating Prompt":
            // Show SBN with no text or meter
            break;
        default:
            break;
    }

    this._showHideLineNumbers(showLineNumbers);
};

/*
 * Show or hide the line numbers.
 * @param showLineNumbers (Boolean) Show line numbers if the current template supports line numbers.
 */
Common.prototype._showHideLineNumbers = function(showLineNumbers)
{
    if (showLineNumbers == true && this._lineNumberData != null)
    {
        // validate that this is a List and the List is configured to show line numbers
        if (this._cachedTemplate && this._cachedTemplate.templateName == "List2Tmplt")
        {
            if ((this._cachedTemplate.list2Ctrl.dataList) &&
                (this._cachedTemplate.list2Ctrl.dataList.vuiSupport == true) &&
                (this._cachedTemplate.list2Ctrl.properties.numberedList == true) &&
                (this._cachedTemplate.list2Ctrl.dataList.hasOwnProperty('itemCount') && this._cachedTemplate.list2Ctrl.dataList.itemCount > 0))
            {
                this.leftBtn.showLineNumbers(this._lineNumberData.count, this._lineNumberData.style);
            }

        }
    }
    else
    {
        this.leftBtn.hideLineNumbers();
    }
};

/*
 * Update this._canShowSbns based on a the cached template.
 */
Common.prototype._updateCanShowSbns = function()
{
    if (this._cachedTemplate.contextInfo.uiaId == "system" && this._cachedTemplate.contextInfo.ctxtId == "DisplayOff")
    {
        // A special case where the context does not have a status bar but we still need to show SBNs.
        this._canShowSbns = true;
    }
    else if (this._cachedTemplate.properties.statusBarVisible == false)
    {
        // Do not display SBNs if there is no status bar
        this._canShowSbns = false;
    }
    else if (this._cachedTemplate.contextInfo.uiaId == "ecoenergy" &&
            (this._cachedTemplate.contextInfo.ctxtId == "EndingFuelConsumption" || this._cachedTemplate.contextInfo.ctxtId == "EndingEffectiveness"))
    {
        this._canShowSbns = false;
    }
    else
    {
        this._canShowSbns = true;
    }

    log.debug("Can show SBNs?", this._canShowSbns);

    if (this._canShowSbns == false)
    {
        // Remove and requeue any displayed SBN
        if (this._displayedSbnId)
        {
            var temp = this._removeDisplayedSbn();
            this._addSbnToQueue(temp, "top");
        }

        // Also remove any displayed Wink
        this._removeWinkHelper();
    }
};

/*
 * helper function to check whether given sbn type is valid
 * @param   type  String  type of the SBN
 */
Common.prototype._isValidSbnType = function(type)
{
    var isValidSbnType = false;
    if (this._SBN_TYPES[type] != null)
    {
        isValidSbnType = true;
    }
    return isValidSbnType;
};

/*
 * helper function to check whether given sbn type is old one
 * @param   type  String  old type of the SBN
 */
Common.prototype._isValidConversionType = function(type)
{
    var isValidConversionType = false;
    if (this._SBN_MAPPING_TABLE[type] != null)
    {
        isValidConversionType = true;
    }
    return isValidConversionType;
};

/*
 * helper function to convert old sbn type into valid type
 * @param   type  String  old type of the SBN
 */
Common.prototype._convertToValidSbnType = function(type)
{
    var validType;
    if (this._isValidConversionType(type))
    {
        validType = this._SBN_MAPPING_TABLE[type];
    }
    else
    {
        validType = "unknown";
        log.error("SBN type " + type + " is not valid. Using " + validType + " as a default. See System Specs for possible sbn types");
    }
    return validType;
};

/*
 * Helper function to reduce duplicate logic
 */
Common.prototype._requestNewSbn = function(uiaId, sbnId, type, properties, isTimed)
{
    if (utility.toType(sbnId) != 'string')
    {
        log.error("Given sbnId was not of valid type 'string'. Please give valid sbnId.");
        return;
    }

    if (utility.toType(type) != 'string')
    {
        log.error("Given SBN type must be a string from the table in GUI Common. See Common SDD for possible types.");
    }

    if (false == this._isValidSbnType(type))
    {
        type = this._convertToValidSbnType(type);
    }

    //blacklist will now contain new letter based sbn type, so this check is moved after the type conversion
    if (this._SBN_TYPE_BLACKLIST.indexOf(type) != -1)
    {
        log.debug("Request for blacklisted SBN type:", type, "has been blocked");
        return;
    }

    // if already in queue or displayed, update sbn
    if (sbnId == this._displayedSbnId)
    {
        this._setKnownSbn(uiaId, sbnId, type, properties, isTimed);
        this._displayedSbn.setSbnConfig(properties); // Call API to do live update on Control

        if (isTimed)
        {
            // extend the timer
            clearTimeout(this._displayedSbnTimerId);
            this._displayedSbnTimerId = setTimeout(this._sbnFinished.bind(this), this._knownSbns[sbnId].duration);
        }
    }
    else if (this._sbnQueue.indexOf(sbnId) != -1)
    {
        this._setKnownSbn(uiaId, sbnId, type, properties, isTimed);
    }
    else // if !in queue and !displayed, it's new and we need to check it for priority
    {
        this._setKnownSbn(uiaId, sbnId, type, properties, isTimed);

        // If there's an SBN currently displayed...
        if (this._displayedSbnId)
        {
            // Get priority level of this sbnId
            var priority = this._knownSbns[sbnId].priority;
            var queueTime = this._SBN_TYPES[type] != null ? this._SBN_TYPES[type].queueTime : this._SBN_TYPES.unknown.queueTime;
            var replaceDisplayed = false;

            if (queueTime > 0)
            {
                // these SBNs DO queue and therefore SBNs of the same priority level should NOT clobber each other
                if (priority < this._knownSbns[this._displayedSbnId].priority) // lower # is higher priority
                {
                    replaceDisplayed = true;
                }
            }
            else
            {
                // these SBNs do NOT queue and therefore SBNs of the same priority level should clobber each other
                if (priority <= this._knownSbns[this._displayedSbnId].priority) // lower # is higher priority
                {
                    replaceDisplayed = true;
                }
            }

            if (replaceDisplayed == true)
            {
                // call to this._removeDisplayedSbn() will set this._displayedSbnId to null and return displayed Id
                var temp = this._removeDisplayedSbn();

                this._displaySbn(sbnId); // the new one has higher priority and should be displayed

                this._addSbnToQueue(temp, "top"); // old SBN has been replaced and should be added to the queue (top if same priority level)
            }
            else
            {
                // new sbnId has lower priority and gets queued
                this._addSbnToQueue(sbnId, "bottom");
            }

        }
        else // display the new SBN. Some SBNs never go in the queue
        {
            if (!this._canShowSbns)
            {
                this._addSbnToQueue(sbnId, "bottom");
            }
            else
            {
                // Tell Status Bar about the SBN
                this._sbnIsDisplayed = true;
                this.statusBar.setSbnDisplayed(this._sbnIsDisplayed);

                if (this._cachedTemplate.properties.statusBarVisible)
                {
                    // Snap the status bar visible (only if this template is set to display a status bar)
                    this.statusBar.transitionVisible(0, 0, "slide", true);
                }

                // ENTRY POINT #1
                // immediately display this SBN without adding it to the queue
                this._displaySbn(sbnId);

                // Notify MMUI to turn on display if needed.
                framework.sendEventToMmui("system", "DisplayOffNotificationEvent", {"payload": {"notificationActive": 1}});
            }
        }
    }

    if (this._canShowSbns && !this._displayedSbnId)
    {
        this._displaySbnFromQueue(); // The new SBN should be the first in queue (if something was displayed)
    }
};

/*
 * Helper function to add Sbns to the queue
 * @param   sbnId   String  Unique ID of the SBN to add to the queue
 * @param   queueOrder  String  Identifies where to place an SBN in case they are the same priority level ("top" or "bottom")
 */
Common.prototype._addSbnToQueue = function(sbnId, queueOrder)
{
    if (sbnId == null)
    {
        log.error("_addSbnToQueue: Cannot add null sbnId to queue.");
        return;
    }
    if (!this._knownSbns[sbnId])
    {
        log.error("Attempt to add Sbn to queue failed: Could not identify Sbn", sbnId, "in knownSbns variable.");
        return;
    }

    var currTime = new Date().getTime();
    // state-based SBNs do not expire. An SBN that is Timed and expired does not need to be added to the queue. It would just be removed later anyway.
    if (this._knownSbns[sbnId].isTimed && currTime >= this._knownSbns[sbnId].expiration)
    {
        log.debug("SBN", sbnId, "has expired. No reason to add it to queue");
        return;
    }

    // Get priority level of this sbnId
    var priority = this._knownSbns[sbnId].priority;

    // Use queuePos so we don't modify the array while looping through it.
    var queuePos = this._sbnQueue.length;  // default to Array.length so that splice will add it to the end of the Array.

    // Add to queue in appropriate spot
    for (var i = 0; i < this._sbnQueue.length; i++)
    {
        if (queueOrder == "top")
        {
            if (priority <= this._knownSbns[this._sbnQueue[i]].priority) // lower # is higher priority
            {
                // insert into queue
                queuePos = i;
                break; // cut in line and we're done
            }
        }
        else
        {
            if (priority < this._knownSbns[this._sbnQueue[i]].priority) // lower # is higher priority
            {
                // insert into queue
                queuePos = i;
                break; // cut in line and we're done
            }
        }

    }

    this._sbnQueue.splice(queuePos, 0, sbnId); // at queuePos, remove 0, add sbnId

};

/*
 * Helper function that creates or updates an Sbn Object to add to/update the knownSbns variable.
 */
Common.prototype._setKnownSbn = function(uiaId, sbnId, type, properties, isTimed)
{
    var expiration = new Date();
    var priority = 0;
    var duration = 0;

    // if type is known, use its properties
    if (!this._SBN_TYPES[type])
    {
        log.warn("Priority level of Sbn type: " + type + " is unknown. Setting priority to lowest level.");
        type = "unknown";
    }

    expiration.setTime(expiration.getTime() + this._SBN_TYPES[type].queueTime);
    priority = this._SBN_TYPES[type].priority;
    duration = this._SBN_TYPES[type].timedDuration;

    this._knownSbns[sbnId] = {
        "uiaId" : uiaId,
        "type": type,
        "priority": priority,
        "isTimed": isTimed,
        "duration": duration, // duration is only used for timed Sbns
        "expiration": expiration.getTime(), // Set an expiration time stamp for each Sbn
        "properties": properties
    };
};

/*
 * Immediately displays the SBN with the given sbnId
 */
Common.prototype._displaySbn = function(sbnId)
{
    if (!this._knownSbns[sbnId])
    {
        log.error("Cannot display requested SBN: " + sbnId + ". SBN cannot be found in knownSbns variable.");
        return;
    }

    if (!this._canShowSbns)
    {
        // safety check. We should never get here.
        log.debug("Cannot show new SBNs in this context.");
        return;
    }

    log.info("Displaying new sbn: " + sbnId);
    this._displayedSbnId = sbnId;
    this._displayedSbn = framework.instantiateControl(this._knownSbns[sbnId].uiaId, document.body, "SbnCtrl", this._knownSbns[sbnId].properties);
    if (this._knownSbns[sbnId].isTimed)
    {
        this._displayedSbnTimerId = setTimeout(this._sbnFinished.bind(this), this._knownSbns[sbnId].duration);
    }
};

/*
 * Immediately destroys and removes the currently displayed SBN
 * @return  String  Returns the sbnId of the SBN that was removed
 */
Common.prototype._removeDisplayedSbn = function()
{
    log.info("Removing currently displayed SBN: " + this._displayedSbnId);
    clearTimeout(this._displayedSbnTimerId);
    framework.destroyControl(this._displayedSbn);

    var removedId = this._displayedSbnId;
    this._displayedSbn = null;
    this._displayedSbnId = null;

    return removedId;
};

/*
 * Chooses the first active SBN off the queue and displays it.
 * @return  String  The ID of the new SBN that gets displayed. null of no SBN is displayed.
 */
Common.prototype._displaySbnFromQueue = function()
{
    var newSbnToDisplay = null;
    if (!this._canShowSbns)
    {
        // safety check. We should never get here.
        log.debug("Cannot show queued SBNs in this context.");
        return newSbnToDisplay;
    }

    if (this._sbnQueue.length == 0)
    {
        // nothing to display: EXIT POINT #1
        this._sbnIsDisplayed = false;
        this.statusBar.setSbnDisplayed(this._sbnIsDisplayed);
        this._updateSbUmpVisibility();

        // Notify MMUI to turn off display if needed.
        framework.sendEventToMmui("system", "DisplayOffNotificationEvent", {"payload": {"notificationActive": 0}});
        return newSbnToDisplay;
    }

    var sbnId = null;
    var flaggedForRemoval = new Array();

    // check expiration
    var currTime = new Date().getTime();

    for (var i = 0; i < this._sbnQueue.length; i++)
    {
        sbnId = this._sbnQueue[i];

        // state-based SBNs do not expire. An SBN in the queue that is state-based or -not- expired should be displayed immediately
        if (this._knownSbns[sbnId].isTimed && currTime >= this._knownSbns[sbnId].expiration)
        {
            flaggedForRemoval.push(sbnId);
        }
        else
        {
            this._displaySbn(sbnId);
            newSbnToDisplay = sbnId;
            flaggedForRemoval.push(sbnId);
            break;
        }
    }

    // splice any expired SBNs from the queue
    for (var j = 0; j < flaggedForRemoval.length; j++)
    {
        this._sbnQueue.splice(this._sbnQueue.indexOf(flaggedForRemoval[j]), 1); // remove from queue

        if (flaggedForRemoval[j] != this._displayedSbnId)
        {
            delete this._knownSbns[flaggedForRemoval[j]]; // delete from known Sbns
        }
    }

    flaggedForRemoval = null;

    if (this._sbnQueue.length == 0 && !this._displayedSbnId)
    {
        // no more SBNs to display: EXIT POINT #2
        this._sbnIsDisplayed = false;
        this.statusBar.setSbnDisplayed(this._sbnIsDisplayed);
        this._updateSbUmpVisibility();

        // Notify MMUI to turn off display if needed.
        framework.sendEventToMmui("system", "DisplayOffNotificationEvent", {"payload": {"notificationActive": 0}});
    }

    return newSbnToDisplay;
};

/*
 * Callback for when a timed SBN completes
 */
Common.prototype._sbnFinished = function()
{
    this._removeDisplayedSbn();
    this._displaySbnFromQueue();
};

/*
 * (internal) Called by framework. Sets the style of the left button to
 * either "goBack" or "menuUp"
 */
Common.prototype.setLeftBtnStyle = function(style)
{
    this.leftBtn.setStyle(style);
};

/*
 * Updates the clock to display the value given. Value should be given in Unix format
 * @param   milliseconds    Number  the current time in number of milliseconds in a date string since midnight of January 1, 1970
 */
Common.prototype.updateSbClock = function(milliseconds)
{
    var type = utility.toType(milliseconds);
    if (type != 'number' && type != 'date')
    {
        log.warn("Common.updateSbClock can only accept an argument of type Number or Date");
        return;
    }

    this._cachedTime = milliseconds;
    this.statusBar.updateClock(milliseconds);

    // Update the clock in the OffScreen control if it that is the current template
    if (this._cachedTemplate && this._cachedTemplate.templateName == "OffScreenTmplt" && this._cachedTemplate.updateClock)
    {
        this._cachedTemplate.updateClock();
    }
};

Common.prototype.getCurrentTime = function()
{
    var type = utility.toType(this._cachedTime);
    var time = 0;

    if (type == 'number')
    {
        time = this._cachedTime;
    }
    else if (type == 'date')
    {
        time = this._cachedTime.getTime();
    }

    return time;
};

/*
 * Removes the wink from the screen. This is called after the wink times out
 * @param   ctrlObj Object  Reference to the Wink Control Object.
 * @param   appData Object  App data stored by Common
 * @param   params  Object  Additional params passed by WinkCtrl
 */
Common.prototype._alertComplete = function(ctrlObj, appData, params)
{
    log.debug("Wink complete: " + ctrlObj.properties.alertId);

    this._removeWinkHelper();
};

Common.prototype._removeWinkHelper = function()
{
    if (this._wink)
    {
        log.info("wink is", this._wink);
        framework.websockets.sendAlertCompleteMsg(this._wink.uiaId, this._wink.properties.alertId);

        framework.destroyControl(this._wink);
        this._wink = null;
    }
};

/*
 * Callback for when the Status Bar is clicked
 * @param   ctrlObj (Object) Reference to the button control object in status bar that was clicked
 * @param   appData (Object) Data passed in by the app when the control was instantiated
 * @param   params  (Object) Optional params passed by the control object
 */
Common.prototype._statusBarClicked = function(ctrlObj, appData, params)
{
    log.debug("status bar clicked", ctrlObj, appData, params);
    if (params.statusBtn == "home")
    {
        if (this._diagEntrySequence != 2 ) // 2 here indicates the sequence was completed
        {
            framework.sendEventToMmui("common", "Global.IntentHome");
        }
    }

};

/*
 * Callback for when the Status Bar is long pressed
 * @param   ctrlObj (Object) Reference to the button control object in status bar that was clicked
 * @param   appData (Object) Data passed in by the app when the control was instantiated
 * @param   params  (Object) Optional params passed by the control object
 */
Common.prototype._statusBarLongPress = function(ctrlObj, appData, params)
{
    if (params.statusBtn == "clock")
    {
        log.info("Clock Long Press Detected.");
        this._diagEntrySequence = 1;
        // clear exisiting timeout if any
        clearTimeout(this._clockHomeButtonLongPressIntervalId);
        //time interval between clock button long press and home button long press should be less than 9 secs
        this._clockHomeButtonLongPressIntervalId = setTimeout(this._statusBarLongPressTimerHandler.bind(this),9000);
    }
    else if (params.statusBtn == "home" && this._diagEntrySequence == 1 && this._clockHomeButtonLongPressIntervalId)
    {
        log.info("Entering Diagnostics App");
        this._diagEntrySequence = 2;
        framework.sendEventToMmui("syssettings", "SelectDiagnostics");
    }

};

Common.prototype._statusBarLongPressTimerHandler = function()
{
    this._clockHomeButtonLongPressIntervalId = null;
    this._diagEntrySequence = 0;
};

/*
 * Callback for when the left button is pressed.
 * @param   controlObj   (object) Reference to the LeftBtn that was pressed
 */
Common.prototype._leftBtnSelected = function(controlObj, appData, params)
{
    this._leftBtnSelectEvent(params.style);
};

/*
 * Helper function to reduce duplicate logic. Called when the left button is selected either
 * via touch or multicontroller -OR- when the TUI Left Hard Key is pressed.
 * @param   style   String  Style of the left button (determines which event to send to MMUI)
 */
Common.prototype._leftBtnSelectEvent = function(style)
{
    if (this.cmnCtrlsDisabled)
    {
        return;
    }

    // Send an appropriate event based on the current style of the left button
    switch (style)
    {
        case "goLeft": // legacy behavior TODO: remove when all Apps have updated
            framework.sendEventToMmui("common", "Global.GoLeft");
            break;
        case "goBack": // go back to the previous screen
            framework.sendEventToMmui("common", "Global.GoBack");
            break;
        case "menuUp": // go up one menu level
            framework.sendEventToMmui("common", "Global.MenuUp");
            break;
        default:
            log.warn("There is no defined event for left button style: " + style);
            break;
    }
};

Common.prototype.getContextCapture = function()
{
    return {
        leftBtnHasFocus : this.leftBtn.divElt.style.visibility === 'visible' && this.leftBtn.btnInstance.hasFocus
    };
};

Common.prototype.restoreContext = function(restoreData)
{
    if (restoreData.commonContextCapture && restoreData.commonContextCapture.leftBtnHasFocus)
    {
        restoreData.skipRestore = true;
    }
};

/*
 * Cause an audible beep to be played.
 * @param pressType (String) Indicates a short press or a long press. Valid values are “Short” and “Long”.
 * @param eventCause (String) Indicates the user interaction that caused the beep. Valid values are “Touch”, “Multicontroller”, and “Hardkey”.
 */
Common.prototype.beep = function(pressType, eventCause)
{
    var validPressTypes = [ "Short", "Long" ];
    if (utility.toType(pressType) !== "string" || validPressTypes.indexOf(pressType) === -1)
    {
        log.warn("Invalid pressType parameter passed to common.beep(). Valid values are 'Short' or 'Long'.");
        return;
    }

    var validEventCauses = [ "Touch", "Multicontroller", "Hardkey" ];
    if (utility.toType(eventCause) !== "string" || validEventCauses.indexOf(eventCause) === -1)
    {
        log.warn("Invalid eventCause parameter passed to common.beep(). Valid values are 'Touch' or 'Multicontroller' or 'Hardkey'");
        return;
    }

    if (pressType == "Short" && eventCause == "Multicontroller")
    {
        // do not send this
        return;
    }

    var args = {
        "payload" : {
            "pressType" : pressType,
            "eventCause" : eventCause
        }
    };

    log.info("Sending PlayAudioBeep", pressType, eventCause);
    framework.sendEventToMmui("audiosettings", "PlayAudioBeep", args);
};

/*
 * Mute message handler
 */
Common.prototype._HandleStatusUpdateVolume = function(msg)
{
    if (msg && msg.params && msg.params.payload)
    {
        var isMuted = msg.params.payload.volumeOnOffStatus === "VolumeOff";
        if (isMuted !== this._isMuted)
        {
            this._isMuted = isMuted;
            this._isMutedChanged();
        }
    }
};

/*
 * Called when the value of _isMuted changes
 */
Common.prototype._isMutedChanged = function()
{
    var action = this._getMuteOverlayAction();
    switch (action)
    {
        case "wink":
            this._showMuteWink(3000);
            break;

        case "persistentWink":
            this._showMuteWink(null);
            break;

        case "sbn":
            this._showMuteSbn();
            break;

        default:
            this._hideMuteWink();
            this._hideMuteSbn();
            break;

    }
};

Common.prototype._showMuteSbn = function()
{
    var properties = {
        sbnStyle: "Style02",
    };

    if (this._isMuted)
    {
        properties.imagePath1 = "IcnSbnMuteOn.png";
        properties.text1Id = "common.muteOn";
    }
    else
    {
        properties.imagePath1 = "IcnSbnMuteOff.png";
        properties.text1Id = "common.muteOff";
    }

    this.startTimedSbn("common", "TimedSbn_StatusUpdateVolumeOnOff", "typeA", properties);
};

Common.prototype._hideMuteSbn = function()
{
    this.cancelTimedSbn("common", "TimedSbn_StatusUpdateVolumeOnOff", "typeA");
};

Common.prototype._showMuteWink = function(winkTimeout)
{
    var properties = {
        "style": "style05",
        "image1": "common/images/icons/IcnWinkUnMute.png",
        "winkTimeout": winkTimeout,
        "alertId": "",
        "completeCallback": this._muteWinkComplete.bind(this)
    };

    if (this._isMuted)
    {
        properties.image1 = "common/images/icons/IcnWinkMute.png";
    }

    var newWink = framework.instantiateControl("common", document.body, "WinkCtrl", properties);

    // If there's a Wink currently displayed (e.g. persistentWink), get rid of it
    this._hideMuteWink();
    this._muteWink = newWink;
};

Common.prototype._hideMuteWink = function()
{
    if (this._muteWink)
    {
        framework.destroyControl(this._muteWink);
        this._muteWink = null;
    }
};

Common.prototype._muteWinkComplete = function()
{
    this._hideMuteWink();
};

/*
 * Returns one of: "persistentWink", "wink", "sbn"
 */
Common.prototype._getMuteOverlayAction = function()
{
    if (this._cachedTemplate && this._cachedTemplate.templateName === "NowPlaying4Tmplt")
    {
        if (this._isMuted)
        {
            return "persistentWink";
        }
        else
        {
            return "wink";
        }
    }
    else
    {
        var uiaId = framework.getCurrentApp();
        var ctxtId = framework.getCurrCtxtId();
        if (this.getContextCategory(uiaId, ctxtId) === "Entertainment")
        {
            return "wink";
        }
    }
    return "sbn";
};

Common.prototype._updateMuteWinkOnTransition = function(prevTepmlate, currTemplate)
{
    if (this._isMuted && currTemplate && currTemplate.templateName === "NowPlaying4Tmplt")
    {
        this._showMuteWink(null);
    }
    else
    {
        this._hideMuteWink();
    }
};

/*
 * Process Global.MenuUpReceived messages.
 */
Common.prototype._MenuUpReceived = function(msg)
{
    if (msg && msg.params && msg.params.payload)
    {
        this._menuUpReceiverApp = msg.params.payload.receiverApp;
    }
};

/*
 * Utility function to get the context category (domain) for a given application/context
 * @param uiaId   Application ID
 * @param ctxtId  Context ID
 * @returns Domain string value (e.g. "Applications", "Communication", "Entertainment")
 */
Common.prototype.getContextCategory = function(uiaId, ctxtId)
{
    return this._contextCategory.getContextCategory(uiaId, ctxtId);
};

/*
 * Utility function to get the status bar icon for a given context category (domain)
 * @param domain  Domain string value (e.g. "Applications", "Communication", "Entertainment")
 * @returns Icon image file name
 */
Common.prototype.getContextCategorySbIcon = function(domain)
{
    return this._contextCategory.getContextCategorySbIcon(domain);
};

framework.registerCommonLoaded(["common/controls/StatusBar",
     "common/controls/LeftBtn",
     "common/controls/Wink",
     "common/controls/Button",
     "common/controls/Dialog3",
     "common/controls/Sbn"], true);
