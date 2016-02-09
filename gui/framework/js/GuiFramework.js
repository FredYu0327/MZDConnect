/*
 Copyright 2011 by Johnson Controls
 __________________________________________________________________________

 Filename: GuiFramework.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: agohsmbr, awoodhc, aganesar
 Date: 10.11.2011
 __________________________________________________________________________

 Description:

 Revisions:
 v0.2 - Adjustments to context change handling
 v0.3 - 29-May-2012 Framework state machine added. Lazy Loading of .js files -awoodhc
 v0.4 - 31-May-2012 Animated transitions added. Callbacks for systemApp controls transitions. -aganesar
 v0.5 - 05-June-2012 Added framework.getCurrentApp function, framework.debugMode. framework.sendEventToMmui -awoodhc
 v0.6 - 18-June-2012 Added comments and function headers to framework -awoodhc
 v0.7 - 19-June-2012 Removed old, unused, AppSdk code. Moved log declaration to Log.js
 v0.8 - 20-June-2012 Added state machine logic for alert, focus stack, data message -awoodhc
 v0.9 - 09-July-2012 Improved framework state timeout error reporting. Added try/catch for parseMmuiMsg -awoodhc
 v1.0 - 17-July-2012 Removed hardcoded template paths. Tmplt paths are now entered in context table (if not common)
                        templateProperties is now properly named ctxtTableEntry -awoodhc
 v1.1 - 23-July-2012 registerAppLoaded takes hasLangSupport as arg and loads dictrionaries if true -awoodhc
 v1.2 (27-Aug-2012) replaced systemApp load logic with common load logic -awoodhc
 v1.3 (28-Aug-2012) Alert messages are now sent to common instead of system. Special treatment for common dictionaries -awoodhc
 v1.4 (29-Aug-2012) State timeout now attempt to continue if failure occurs on language change -awoodhc
 v1.5 (14-Sept-2012) Fixed State Timeout Alert Bug. Added elegant Dictionary load error handling. Changed FWK state names
                        from SYSTEM to CMN. Increased state timeout to 8 seconds. Improved error reporting. -awoodhc
 v1.6 (19-Sept-2012) Fixed bug where Framework would think it was in the wrong App after receiving an invalid context from MMUI -awoodhc
 v1.7 (20-Sept-2012) When not in debugMode, a state timeout now sends GoToHome event to avoid getting stuck in a loop with MMUI -awoodhc
 v1.8 (26-Sept-2012) Added DBAPI interface support -aganesar
 v1.9 (01-Oct-2012) Added AppSdk interface support [change delayed] -avorotp
 v2.0 (08-Oct-2012) Corrected state timeout error reporting when App has variable error during init -awoodhc
 v2.1 (11-Oct-2012) Fixed bug with state machine where 1 Websocket could open without the others -awoodhc
 v2.2 (16-Oct-2012) GuiFramework now ignores empty or null focus stacks sent from MMUI. Framework now correctly processes the focus
                        stack after loading an app if the focus stack message triggered the load. Now will throw an error if "unknown" is found
                        in uiaId of MMUI message. Fixed open dbApi socket issue after Common loads -awoodhc
 v2.3 (04-Nov-2012) templateChange function now checks context properties for sbName or sbNameId to display App Name in Status Bar.
                    When changing language, framework now loads dicts for all loaded Apps with support, instead of only those that have dicts loaded -awoodhc
 v2.4 (15-Nov-2012) Updated for AppSDK support - aganesar
 v2.5 (16-Nov-2012) Removed .toLowerCase() MMUI fixes. Added logic to set Left Button Style based on contextTable information. -awoodhc
v2.6 (03-Dec-2012) GetStartupSettings changes - aganesar
v2.7 (10-Jan-2012) Added argument to instantiateControl that can be set to used for persistent DOM elements -awoodhc
__________________________________________________________________________

 */

log.addSrcFile("GuiFramework.js", "framework");

/*
 * Constructor. Starts the GUI framework. This function should only ever be called once to initialize the GUI.
 */
function GuiFramework()
{
    // Start heartbeat monitor
    if (window["guiManager"])
    {
        this._heartbeatMonitor = new guiManager(); // guiManager is provided by an Opera plugin
        this._heartbeatMonitor.setWarningLevel(1); // this will  enable warnings when the system is slow and close to a heartbeat stoppage
        this._heartbeatIntervalId = setInterval(this._heartbeat.bind(this), 1000);
    }

    //private consts
    this._MAX_ID_NUM = 999;                // (Number) The highest a unique DOM id count will get before it resets to 0
    this._DATA_REQUEST_MAX_AGE = 60000;    // (Number) Expiration time in milliseconds of APPSDK and DBAPI data requests

    this._FWK_STATE_IDLE =                  "idle";
    this._FWK_STATE_YIELD_CPU =             "yieldCpu";
    this._FWK_STATE_LOADING_CMN =           "loadingCommon";
    this._FWK_STATE_LOADING_CMN_GLOBAL_CTRLS = "loadingCommonGlobalCtrls";
    this._FWK_STATE_LOADING_APP =           "loadingApp";
    this._FWK_STATE_LOADING_APP_CTRLS =     "loadingAppCtrls";
    this._FWK_STATE_TMPLT_CHANGE =          "templateChange";
    this._FWK_STATE_LOADING_TMPLT =         "loadingTmplt";
    this._FWK_STATE_LOADING_TMPLT_CTRLS =   "loadingTmpltCtrls";
    this._FWK_STATE_LANG_CHANGE_OUT =       "languageChangeOut";
    this._FWK_STATE_LOADING_DICTS =         "loadingDictionaries";
    this._FWK_STATE_LANG_CHANGE_IN =        "languageChangeIn";

    this._OPERA_SURFACE =                   "JCI_OPERA_PRIMARY";

    //private vars
    this._browserShown = false;             // (Boolean) whether wayland has been called for showing the browser surface
    this._debugMode = false;                // (Boolean) used inside setter/getter only. Do not touch!
    this._updateDebugPanelOnContextChange = true;   // (Boolean) true if transition should update debug panel
    this.jasmineMgr = null;                // (Object) Jasmine Manager Object used for running tests against GUI code
    this._mmuiWsReady = -1;                 // (Number) -1 will indicate not yet ready. true or false (1 or 0) will indicated connected
    this._appSdkWsReady = -1;               // (Number) -1 will indicate not yet ready. true or false will indicated connected
    this._dbApiWsReady = -1;               // (Number) -1 will indicate not yet ready. true or false will indicated connected
    this._processedFilePaths = new Object(); //(Object) Stores all file paths that have already been loaded. Used to make sure we don't load a file twice

    this._filesToLoad = null;               // (Object) Tracks the ctrl/dict files that need to fire registerLoaded before the app or template is fully loaded
                                            // Any entries in _filesToLoad are being processed by framework. Any entries that are set to true have finished loading.
    this._loadingAppJsObj = null;           // (Object) Stoes the message that caused an App load. Used for loading files.

    this._lastAppLoaded = null;             // (String) The last UIAID used to request an App load. Used for error reporting.
    this._lastMmuiMessage = null;           // (Object) Most recently processed MMUI Message. Used for error reporting.

    this._isLanguageChanging = false;       // (Boolean) Indicates whether a language change is currently taking place.
    this._rtlLanguage = false;              // (Boolean) Indicates whether the current language is left-to-right (false) or right-to-left (true) (Arabic/Hebrew)
    this._msgQueue = new Array();           // (Array) Messages from MMUI,AppSDK and DBAPI are queued here while framework is not in idle state
    this._msgQueueYieldPoint = 35;          // (Number) Maximum number of queued messages to process before yielding CPU to Opera
    this._stateTimeoutId = 0;               // (Number) id used to clearTimeout for when framework comes back to idle state
    this._errorWinkControl = null;          // (HTMLElement) displays wink when a state timeout occurs
    this._commonTransitionData = null;      // (Object) temporarily stores system control transition data

    this._dbapiReqIdCtr = 0;                // Request Id Counter for DBAPI requests
    this._dbapiReqCallbacks = new Object();  // (Object) Stores app callbacks associated with DBAPI requests

    this._appsdkReqIdCtr = 0;                // Request Id Counter for APPSDK requests
    this._appsdkReqCallbacks = new Object();  // (Object) Stores app callbacks associated with APPSDK requests

    this._langChangeCompleteCallback = null;
    this.initGuiCalled = false;

    // Array of currently visible Wayland surfaces from GUIFWK's point of view. Initially this is empty.
    this._visibleSurfaces = [];

    this._keybrdInputSurface = this._OPERA_SURFACE; // Wayland surface that receives the keyboard events

    this._sharedDataAttributes = {};        // Object of shared data attributes. See getSharedData/setSharedData.

    this._fwkState = this._FWK_STATE_IDLE; // (String) used inside setter/getter only. Do not touch!

    this.__defineGetter__('_frameworkState', function() // (String) the current state that framework is in (see above for states)
    {
        return this._fwkState;
    });
    this.__defineSetter__('_frameworkState', function(state)
    {
        log.debug("Framework State change requested. Prev: " + this._fwkState, " New: " + state);

        if (this._fwkState != state)
        {
            this._processNewFwkState(state);
        }

    });


    //initialize the frameworkState to idle
    this._frameworkState = this._FWK_STATE_IDLE;

    this._currentAppUiaId = null;               // (String) uiaId of the app that has focus
    this._appInstances = new Object();          // (Object) contains instances of apps currently running in the program

    // Applications Hash
    this._appStack = new Object();              // (Object) contains information on whether an app isLoaded, isActive

    // Focus Stack Array
    this._focusStack = new Array();             // (Array) used to temporarily store the focus list passed from MMUI

    this._currTmpltInstance = null;             // (Object) The currently displayed template instance

    this._templateInstances = new Object();     // (Object) Stores instances of templates that are currently in the DOM

    this._templatesLoaded = new Object();       // (Object) Stores information about loaded templates (e.g. DOM id counter)
    this._controlsLoaded = new Object();        // (Object) Stores information about loaded controls (e.g. DOM id counter)

    this._contextRestoreCache = {};             // (Object) Caches context restore information for global go back support.

    this._statusBarSnapshot = null;             // (Object) Stores information about previous non dialog context.
                                                // if previous context is non dialog and next context is a dialog.
                                                // used for updating StatusBar title and icon.
    //public vars

    this.__defineGetter__('debugMode', function()   // (Boolean) true if framework is running in debugMode (apps should
    {                                               //              check this before loading a Test.js file)
        return this._debugMode;
    });
    this.__defineSetter__('debugMode', function(flag)
    {
        if(this._debugMode == flag)
        {
            return;
        }
        this._debugMode = flag;
    });

    this.__defineGetter__('updateDebugPanelOnContextChange', function()   // (Boolean) true if transition should update debug panel
    {
        return this._updateDebugPanelOnContextChange;
    });
    this.__defineSetter__('updateDebugPanelOnContextChange', function(flag)
    {
        if (this._updateDebugPanelOnContextChange == flag)
        {
            return;
        }
        this._updateDebugPanelOnContextChange = flag;
    });

}

GuiFramework.prototype._heartbeat = function()
{
    if (this._heartbeatMonitor)
    {
        this._heartbeatMonitor.javascriptHeartbeat();
    }
}

/*
 * Called just after framework is instantiated. This logic is separated from the constructor to be sure
 * that all other prototyped objects have immediate access to the global framework variable.
 */
GuiFramework.prototype.init = function()
{
    //Perform any initialization
    log.debug("GuiFramework init()");

    // Start the AppSDK and DBAPI garbage collection timer
    setInterval(this._dataRequestGarbageCollector.bind(this), this._DATA_REQUEST_MAX_AGE);

    //Set parameters from GUI Config file (gui/common/js/GuiConfig.js)
    //Set debugMode flag based on GUI Config Settings
    this.debugMode = guiConfig.debugMode;

    this.debug = new Debug();

    // Disable logs if GUI Config flag is set to true
    if (guiConfig.disableLogs)
    {
        this.debug.disableDragonfly();
    }

    //Set debugPanelEnabled flag based on  GUI Config Settings
    this.debug.debugPanelEnabled = guiConfig.debugPanelEnabled;

    this.websockets = new Websockets();
    this.localize = new Localization();

    // Instantiate Multicontroller
    var theCallback = this._multicontrollerEventHandler.bind(this);
    this.multicontroller = new Multicontroller(theCallback);

    // Instantiate the transition manager
    this.transitionsObj = new Transitions();

    // NOTE: Call to _getStartupSettings() comes from framework once both
    // mmuiWS and appSdkWs are connected AND
    // common JS files have finished loading

    //Add file tags for common right away. framework.common is set during the Common constructor
    this._addAppFiles("common");

    this._offscreenTemplateParent = document.createElement('div');
    this._offscreenTemplateParent.id = "GuiFrameworkOffscreenTemplate";
    document.body.appendChild(this._offscreenTemplateParent);

    if (guiConfig.testMode)
    {
        // load JasemineManager
        utility.loadCss("framework/test/jasmine/JasmineManager.css");
        utility.loadScript("framework/test/jasmine/JasmineManager.js", null, function(){
            this.jasmineMgr = new JasmineManager();
            this.jasmineMgr.start();
        }.bind(this));
    }

}

/*
 * Sends GetStartupSettings event to MMUI.
 */
GuiFramework.prototype._getStartupSettings = function()
{
    log.info("* * * * * GUI is ready.  Sending Global.GetStartupSettings event to MMUI. * * * * *");

    // Global.GetStartupSettings is newly added to get region and units settings from MMUI
    this.sendEventToMmui("common", "Global.GetStartupSettings");
    this.initGuiCalled = false;
    var self = this;
    setTimeout( function()
    {
        if (!self.initGuiCalled)
        {
            log.error("SYS_SETTINGS app didn\'t set all required values before timeout. CPP_GUIFWK is issuing initGui with necessary default values.");
            self.initGuiCalled = true;

            // We do not use strict equality here in case one of these checks return undefined, it will still set the default value
            if (framework.localize.getRegion() == null)
            {
                log.warn("SYS_SETTINGS app didn\'t set region, using Region_NorthAmerica");
                framework.localize.setRegion(framework.localize.REGIONS.NorthAmerica);
            }
            if (framework.localize.getCurrentLanguage() == null)    //Localization currently initializes this to en_US
            {
                log.warn("SYS_SETTINGS app didn\'t set language, using en_US");
                framework.localize.setLanguage("en_US", true);
            }
            if (framework.localize.getKeyboardLanguage() == null)
            {
                log.warn("SYS_SETTINGS app didn\'t set keybaord language, using en_US");
                framework.localize.setKeyboardLanguage("en_US");
            }
            if (framework.localize.getTimeFormat() == null)
            {
                log.warn("SYS_SETTINGS app didn\'t set time format, using 12hrs");
                framework.localize.setTimeFormat(framework.localize.TIME_FORMATS.T12hrs);
            }
            if (framework.localize.getTemperatureUnit() == null)
            {
                log.warn("SYS_SETTINGS app didn\'t set temperature unit, using Fahrenheit");
                framework.localize.setTemperatureUnit(framework.localize.TMPRTURE_UNITS.Fahrenheit);
            }
            if (framework.localize.getDistanceUnit() == null)
            {
                log.warn("SYS_SETTINGS app didn\'t set ditance unit, using Miles");
                framework.localize.setDistanceUnit(framework.localize.DISTANCE_UNITS.Miles);
            }
            if (framework.getSharedData('syssettings', 'VehicleType') == null)
            {
                log.warn("SYS_SETTINGS app didn\'t set VehicleType, using J36");
                framework.localize.setVehicleType("J36");
            }
            self.initGui();
		}
    }, 20000);
};

/*
 * Sends a message to MMUI to let it know that GUI has started successfully.
 */
GuiFramework.prototype.initGui = function()
{
    log.info("* * * * * GUI Settings are received  Sending Global.InitGui event to MMUI. * * * * *");

    this.initGuiCalled = true;

    this.sendEventToMmui("common", "Global.InitGui");
    this.websockets.initGui();
}

/*
 * Sends an event message to MMUI via websockets. If apps have set callbacks using framework.debug, this function
 * will also causes debug to call the callbacks with the message data.
 * @tparam  String  uiaId   The uiaId of the app sending the message.
 * @tparam  String  eventId The id of the event to send to MMUI (eventIds are defined in MMUI documentation)
 * @tparam  Object  params  Object containing other data required for the event (params are defined in MMUI documentation)
 */
GuiFramework.prototype.sendEventToMmui = function(uiaId, eventId, params, fromVui)
{
    // !! WARNING !!
    // The currentUiaId and currentContextId sent along with the MMUI message are not always correct.
    // The best solution is for GUI apps to specify these values but that design was rejected.
    // GUIFWK cannot automatically figure out which GUI app is sending the message, especially for messages:
    // 1) sent from contextIn or contextOut functions.
    // 2) sent during a template transition
    // 3) sent from any asychronous callback that an app is using (such as to support APPSDK or DBAPI)
    // These values are intended to help MMUI figure out how to route Global.* messages sent to common. When MMUI receives such a message
    // it may be in a different context already. However, this solution seems to be little better and just shifts the problem into GUI.
    //
    // I (Brian Ensink) am including this code with the above objections.
    //
    var currentUiaId = this.getCurrentApp();
    var currentContextId = this.getCurrCtxtId();

    this.websockets.sendEventMsg(uiaId, eventId, params, fromVui, currentUiaId, currentContextId);

     // Let debug know about the message
    this.debug.triggerEvtToMmuiCallbacks(uiaId, eventId, params);
}


/*
 * Sends an event message to DBAPI via websockets. If apps have set callbacks using framework.debug, this function
 * will also causes debug to call the callbacks with the message data.
 * @tparam  String  uiaId   The uiaId of the app sending the message.
 * @tparam  String  api   DBAPI plugin name.
 * @tparam  Number  methodName One of the functions present in the DBAPI plugin specified in the first parameter
 * @tparam  Object  params  Object containing other data required
 */
GuiFramework.prototype.sendRequestToDbapi = function(uiaId, callbackFn, api, methodName, params)
{
    this._dbapiReqIdCtr = this._dbapiReqIdCtr + 1;
    // Make api, methodName and requestId as the key and store the app callback
    this._dbapiReqCallbacks[api + methodName + this._dbapiReqIdCtr] = {
        'callback': callbackFn,
        'expires': Date.now() + this._DATA_REQUEST_MAX_AGE,
        'info': uiaId + " " + api + "." + methodName };

    //uiaId parameter is used for locating the app test file's DBAPI simulator
    this.websockets.sendDbapiMsg(uiaId, this._dbapiReqIdCtr, api, methodName, params);
}


/*
 * Calls a method of APPSDK via websockets. If apps have set callbacks using framework.debug, this function
 * will also causes debug to call the callbacks with the message data.
 * @tparam  String   uiaId        The uiaId of the app sending the message.
 * @tparam  Function callbackFn   The function that will handle the response
 * @tparam  String   serviceName  APPSDK service name.
 * @tparam  String   methodName   One of the functions present in the APPSDK plugin
 * @tparam  Object   params       Object containing other data required
 */
GuiFramework.prototype.sendRequestToAppsdk = function(uiaId, callbackFn, serviceName, methodName, params)
{
    // increment the reqId
    this._appsdkReqIdCtr = this._appsdkReqIdCtr + 1;

    // Make methodName and requestId as the key and store the app callback
    this._appsdkReqCallbacks[serviceName + methodName + this._appsdkReqIdCtr] = {
        'callback': callbackFn,
        'expires': Date.now() + this._DATA_REQUEST_MAX_AGE,
        'info': uiaId + " " + serviceName + "." + methodName };

    //uiaId parameter is used for locating the app test file's DBAPI simulator
    this.websockets.sendAppsdkMsg(uiaId, this._appsdkReqIdCtr, serviceName, methodName, params);
}

/*
 * Remove old APPSDK and DBAPI calls that have not received a response after a certain amount of time.
 */
GuiFramework.prototype._dataRequestGarbageCollector = function()
{
    var now = Date.now();
    for (var prop in this._dbapiReqCallbacks)
    {
        if (this._dbapiReqCallbacks.hasOwnProperty(prop) && this._dbapiReqCallbacks[prop].expires < now)
        {
            log.warn("DBAPI request timed out: " + this._dbapiReqCallbacks[prop].info)
            delete this._dbapiReqCallbacks[prop];
        }
    }
    for (var prop in this._appsdkReqCallbacks)
    {
        if (this._appsdkReqCallbacks.hasOwnProperty(prop) && this._appsdkReqCallbacks[prop].expires < now)
        {
            log.warn("APPSDK request timed out: " + this._appsdkReqCallbacks[prop].info)
            delete this._appsdkReqCallbacks[prop];
        }
    }
}

/*
 * Routes a message sent from MMUI to GUI and takes appropriate action based on the message.
 * If framework is not in idle state, the message gets queued to be processed upon returning to idle.
 */
GuiFramework.prototype.routeMmuiMsg = function(jsObject)
{
    //if we're not in idle, we need to queue until later
    if (this._frameworkState != this._FWK_STATE_IDLE)
    {
        // Remove all existing transition enabled false messages from the queue. This must be done only when not IDLE to avoid
        // removing the same transition enabled false message when called from this._processNewFwkState().
        if (jsObject.msgType === "transition" && jsObject.enabled === false)
        {
            var index = this._msgQueue.length - 1;
            while (index >= 0)
            {
                if (this._msgQueue[index].msg.msgType === "transition" && this._msgQueue[index].msg.enabled === false)
                {
                    this._msgQueue.splice(index, 1);
                    log.info("Removed an existing transition false from msgQueue before appending a new transition false message.");
                }
                --index;
            }
        }

        this._msgQueue.push({
             socketType : "mmui",
             msg : jsObject
        });
        return;
    }

    this.debug.logDebug("<font color=#7F0000>From Mmui: " + JSON.stringify(jsObject), "</font>");
    this._lastMmuiMessage = jsObject;

    // Test for an Unknown UIA_uiaId from MMUI
    var pattern = /unknown/gi;
    if (pattern.test(jsObject.uiaId))
    {
        log.error("GUI cannot send a message to an App called 'unknown'. Ignoring message: " + JSON.stringify(jsObject));
        return;
    }

    // Process the message
    switch(jsObject.msgType)
    {
        case "transition":
            this._transitionChange(jsObject.enabled);
            break;
        case "ctxtChg":
            this._contextChange(jsObject);
            break;
        case "focusStack":
            if (!jsObject.appIdList || utility.toType(jsObject.appIdList) != 'array' || jsObject.appIdList.length == 0)
            {
                log.debug("Empty or null focus stack received from MMUI. GUI cannot update to an empty focus stack. Ignoring this message.");
                return;
            }
            else
            {
                // Test for an Unknown UIA_uiaId from MMUI
                for (var i = 0; i < jsObject.appIdList.length; i++)
                {
                    if (pattern.test(jsObject.appIdList[i].id))
                    {
                        log.error("GUI cannot send a message to an App called 'unknown'. Ignoring message: " + jsObject);
                        return;
                    }
                }
            }

            var uiaId = jsObject.appIdList[0].id;

            if (this._appStack[uiaId])
            {
                // top app is already loaded, process the focus stack
                this._focusStackChange(jsObject.appIdList);
            }
            else
            {
                // load the app
                this._addAppFiles(uiaId, jsObject);
            }
            break;
        case "msg":
            if (this._appStack[jsObject.uiaId])
            {
                // app is already loaded, handle the message
                this._handleMessage(jsObject.uiaId, jsObject);
            }
            else
            {
                //load app
                this._addAppFiles(jsObject.uiaId, jsObject);
            }
            break;
        case "alert":
            if (this._appStack[jsObject.uiaId])
            {
                // app is already loaded, show the alert
                this.common.handleAlert(jsObject.uiaId, jsObject.alertId, jsObject.params);
            }
            else
            {
                //load app
                this._addAppFiles(jsObject.uiaId, jsObject);
            }
            break;
        case "noGoBack":
            this._removeContextRestoreData(jsObject.contextSeqs);
            break;
        default:
            // This should never happen
            log.error("Framework has received a MMUI message of invalid type: " + jsObject.msgType);
            break;
    }
}

/*
 * Routes a message sent from DBAPI to GUI and then takes appropriate action based on the message.
 * If framework is not in idle state, the message gets queued to be processed upon returning to idle.
 */
GuiFramework.prototype.routeDbapiMsg = function(jsObject)
{
    //if we're not in idle, we need to queue until later
    if (this._frameworkState != this._FWK_STATE_IDLE)
    {
        this._msgQueue.push({
            socketType : "dbapi",
            msg : jsObject
        });
        return;
    }
    this.debug.logDebug("<font color=#7F0000>From DBAPI: " + JSON.stringify(jsObject), "</font>");

    if (jsObject.msgType == "methodResponse")
    {
        var callbackFnKey = jsObject.msgContent.api + jsObject.msgContent.methodName + jsObject.msgContent.reqId;
        if (this._dbapiReqCallbacks[callbackFnKey])
        {
            var callbackFn = this._dbapiReqCallbacks[callbackFnKey].callback;

            // Remove the callback from the hash
            delete this._dbapiReqCallbacks[callbackFnKey];
            if (typeof callbackFn == "function")
            {
                try
                {
                    callbackFn(jsObject);
                }
                catch (err)
                {
                    log.error("Caught exception in framework.routeDbapiMsg with msgData '" + JSON.stringify(jsObject) + "'");
                    log.writeError(err);
                }
            }
            else
            {
                log.error("Matching App callback for DBAPI response not found for ", callbackFnKey);
            }
        }
    }
    else
    {
        log.error("Framework has received a DBAPI message of invalid type: " + jsObject.msgType);
    }
}

/*
 * Routes a message sent from APPSDK to GUI and then takes appropriate action based on the message.
 * If framework is not in idle state, the message gets queued to be processed upon returning to idle.
 */
GuiFramework.prototype.routeAppsdkMsg = function(jsObject)
{
    //if we're not in idle, we need to queue until later
    if (this._frameworkState != this._FWK_STATE_IDLE)
    {
        this._msgQueue.push({
             socketType : "appsdk",
             msg : jsObject
         });
        return;
    }
    this.debug.logDebug("<font color=#7F0000>From APPSDK: " + JSON.stringify(jsObject), "</font>");

    if (jsObject.msgType === "methodResponse" || jsObject.msgType === "methodErrorResponse")
    {
        // get the callback function
        var callbackFnKey = jsObject.serviceName + jsObject.methodName + jsObject.reqId;
        if (this._appsdkReqCallbacks[callbackFnKey])
        {
            var callbackFn = this._appsdkReqCallbacks[callbackFnKey].callback;

            // Remove the callback from the hash
            delete this._appsdkReqCallbacks[callbackFnKey];
            if (typeof callbackFn == "function")
            {
                try
                {
                    callbackFn(jsObject);
                }
                catch (err)
                {
                    log.error("Caught exception in framework.routeAppsdkMsg with msgData '" + JSON.stringify(jsObject) + "'");
                    log.writeError(err);
                }
            }
            else
            {
                log.error("Matching App callback for APPSDK response not found for ", callbackFnKey);
            }
        }
    }
    else
    {
        // This should never happen
        log.error("Framework has received a APPSDK message of invalid type: " + jsObject.msgType);
    }
}

/*
 * Callback handler for Multicontroller.js. Except in certain cases, passes the event on to the current template.
 * @tparam  String  tuiEvent    The multicontroller event that occurred (see Multicontroller.js for definitions)
 * @tparam  Boolean firstMultiEvent     true if this is the first multicontroller event upon switching modes from touch to multi
 */
GuiFramework.prototype._multicontrollerEventHandler = function(tuiEvent, firstMultiEvent)
{
    if (tuiEvent !== "controllerActive" && tuiEvent !== "touchActive" && this.getInputEnabled() === false)
    {
    	//block multicontroller input
        return;
    }

    if (this.common)
    {
        this.common.handleControllerEvent(tuiEvent, firstMultiEvent);
    }
}

/*
 * Stores the app in this._appStack for data retrieval when checking isLoaded or isActive
 * @tparam  String  uiaId   the app uiaId that was just loaded and needs a data entry in this._appStack
 */
GuiFramework.prototype._storeAppLoaded = function(uiaId)
{
	this._appStack[uiaId] = {
            isActive :	false,
            isLoaded : 	true // denotes whether app has loaded and is available for reference
	};
}

/*
 * Called when framework receives a ctxtChg message from MMUI
 * @tparam  Object  jsObject    The JSON-parsed message data from MMUI
 */
GuiFramework.prototype._contextChange = function(jsObject)
{
    log.debug("GuiFramework._contextChange(" + jsObject.ctxtId + ", " + jsObject.uiaId + ")");

    var ctxtId = jsObject.ctxtId;
    var uiaId = jsObject.uiaId;
    var isLoaded = false;

    if (ctxtId === "Idle")
    {
    	// Do not proceed with context change
    	return;
    }

    if (uiaId in this._appStack)
    {
        isLoaded = true;
    }

    if (!isLoaded) // Load the app if it is not loaded
    {
        // load js files
        this._addAppFiles(uiaId, jsObject);
    }
    else
    {
        // app already loaded just call handle context
        this._callHandleContext(jsObject);
    }

}

/*
 * Called when framework receives a focus stack message from MMUI
 * @tparam  Object  appIdList contains data pertaining to what app should be at the top of the focus stack
 */
GuiFramework.prototype._focusStackChange = function(appIdList)
{
    this._prevFocusStack = [];
    this._prevFocusStack = this._focusStack;
    // Empty this._focusStack array
    this._focusStack = [];

    // Set new focus stack
    this._focusStack = appIdList;

    for (var i = 0; i < this._focusStack.length; i++)
    {
        log.debug("    this._focusStack[" + i + "].id: " + this._focusStack[i].id);
    }
}

/*
 * Called when framework receives a transition message from MMUI.
 * If transition is false and the context has changed, this function instantiates a new template and begins
 * processing the transition.
 * @tparam  Boolean enabled     true if MMUI is sending transition messages.
 */

GuiFramework.prototype._transitionChange = function(enabled)
{
    if (!enabled)
    {
        if (!this._focusStack || this._focusStack.length == 0)
        {
            log.warn("GUI's internal focus stack is empty. Stopping GUI transition change.");
            return;
        }

        var newUiaId = this._focusStack[0].id;

        // check for a focus stack change
        var appChanged = false;
        if (this._currentAppUiaId != newUiaId)
        {
            appChanged = true;
        }

        var instance = this._appInstances[newUiaId];
        if (instance)
        {
            log.debug("    appChanged?", appChanged, "hasContextChanged?", instance.hasContextChanged());
            if (appChanged || instance.hasContextChanged())
            {
                if (this._currTmpltInstance)
                {
                    // Special check added to prevent issues with rapid context changes
                    // isContextDifferentFrom() will pull out only needed data
                    if (instance.isContextDifferentFrom(this._currTmpltInstance.contextInfo) == false)
                    {
                        log.info("MMUI tried to send GUI to the same context it's already in. Ignoring transition.");
                        log.info("Framework thinks we're in:", JSON.stringify(this._currTmpltInstance.contextInfo), "and App thinks we're in", JSON.stringify(instance.getCurrentContext()));
                        return;
                    }
                }
                // Lookup current context properties
                var ctxtObj = instance.getCurrentContext();
                if (!ctxtObj)
                {
                    log.warn("App's current context is null or undefined. MMUI never sent a context to App: " + newUiaId);
                    return;
                }
                var currCtxtIdToCheck = this._currTmpltInstance ? this._currTmpltInstance.contextInfo.ctxtId : null; //TODO: This variable could be reused?
                if (this.transitionsObj.isTransitionLegal(this._currentAppUiaId, currCtxtIdToCheck, newUiaId, ctxtObj.ctxtId) == false)
                {
                    log.error("The requested transition is ILLEGAL and will be IGNORED. GUI MIGHT BE OUT OF SYNC WITH MMUI! This is probably bad!!");
                    return;
                }
                var ctxtTableEntry = instance.getContextTableEntry(ctxtObj.ctxtId);
                if (!ctxtTableEntry)
                {
                    log.warn("ctxtTableEntry returned by App " + newUiaId + " is either null or undefined. Cannot go to unknown context: " + ctxtObj.ctxtId);
                }
                else
                {
                    var tempTemplate = this.instantiateTemplate(newUiaId, this._offscreenTemplateParent, ctxtTableEntry.template, ctxtTableEntry.controlProperties, ctxtTableEntry.templatePath);

                    if (!tempTemplate)
                    {
                        log.debug(this._frameworkState + " Waiting for template to load.");
                        // exit function here. A load is required. When load completes, _transitionChange will be called again.
                        return;
                    }

                    // Cache some values to be used later by this._captureContext() and transitions.
                    tempTemplate.contextInfo = {
                        uiaId : newUiaId,
                        ctxtId : instance.getCurrentContext().ctxtId,
                        contextSeq : instance.getCurrentContext().contextSeq,
                        params : utility.deepCopy(instance.getCurrentContext().params),
                        newKeybrdInputSurface : this._OPERA_SURFACE,
                        newVisibleSurfaces : [],
                        leftButtonStyle : ctxtTableEntry.leftBtnStyle             //leftButtonStyle property added to access the left button style present in context
                    };
                    if (ctxtTableEntry.contextFocusGroup)
                    {
                        if ( typeof ctxtTableEntry.contextFocusGroup === "string")
                        {
                            tempTemplate.contextInfo.contextFocusGroup = ctxtTableEntry.contextFocusGroup;
                        }
                        else
                        {
                            log.warn("Attempt to set contextFocusGroup to a non-string value by " + tempTemplate.contextInfo.uiaId + " for context " + tempTemplate.contextInfo.ctxtId);
                        }
                    }
                    if (ctxtTableEntry.properties)
                    {
                        if (ctxtTableEntry.properties.keybrdInputSurface)
                        {
                            tempTemplate.contextInfo.newKeybrdInputSurface = ctxtTableEntry.properties.keybrdInputSurface;
                        }
                        if (ctxtTableEntry.properties.visibleSurfaces)
                        {
                            tempTemplate.contextInfo.newVisibleSurfaces = ctxtTableEntry.properties.visibleSurfaces;
                        }
                    }
                    // If the app has set custom template properties, copy them into the template instance
                    if (ctxtTableEntry.properties)
                    {
                        for (var key in ctxtTableEntry.properties)
                        {
                            tempTemplate.properties[key] = ctxtTableEntry.properties[key];
                        }
                    }

                    // if the new template is a dialog, store the prev template's properties
                    if (this._shouldUseSnapshot(tempTemplate))
                    {
                        // new context is a dialog

                        // capture snapshot
                        if (this._currTmpltInstance)
                        {
                            // capture template snapshot
                            // set to snapshot if snapshot is !null
                            tempTemplate.properties.snapshotTmpltDivElt = this._currTmpltInstance.properties.snapshotTmpltDivElt || this._currTmpltInstance.divElt;


                            // capture status bar snapshot
                            if (!this._currTmpltInstance.properties.isDialog)
                            {
                                //store previous non dialog context's name and icon.
                                this._statusBarSnapshot = new Object();
                                var tempPrevContextStore = this._appInstances[this._currentAppUiaId].getContextTableEntry(this._currTmpltInstance.contextInfo.ctxtId);
                                if (tempPrevContextStore)
                                {
                                    this._statusBarSnapshot.sbNameId = tempPrevContextStore.sbNameId;
                                    this._statusBarSnapshot.sbName = tempPrevContextStore.sbName;
                                    this._statusBarSnapshot.sbNameImage = tempPrevContextStore.sbNameImage;
                                    this._statusBarSnapshot.sbNameSubMap = tempPrevContextStore.sbNameSubMap;
                                }

                                this._statusBarSnapshot.appUiaId = this._currentAppUiaId;
                                this._statusBarSnapshot.ctxtId = this._currTmpltInstance.contextInfo.ctxtId;
                            }
                            
                            var tempDataObj = new Object();
                            if (this._statusBarSnapshot == null)
                            {
                                // these being used down the line as part of _statusBarSnapshot.
                                tempDataObj.appUiaId = null;
                                tempDataObj.ctxtId = null;
                            }
                            else
                            {
                                tempDataObj = this._statusBarSnapshot;
                            }

                            // set status bar
                            if (this._isStatusBarDataValid(newUiaId, instance.getCurrentContext().ctxtId, ctxtTableEntry))
                            {
                                // set status bar dialog's (new context) status bar data
                                this._setStatusBar(newUiaId, instance.getCurrentContext().ctxtId, ctxtTableEntry);
                            }
                            else if (this._isStatusBarDataValid(tempDataObj.appUiaId, tempDataObj.ctxtId, tempDataObj))
                            {
                                // set status bar with snapshot - current dialog context does not have status bar properties
                                // No title text/image specified for the dialog
                                // switch to preserved sb icon and title
                                this._setStatusBar(tempDataObj.appUiaId, tempDataObj.ctxtId, tempDataObj);
                            }
                            else
                            {
                                // Clear status bar - no data
                                // If no title and icon information is preserved, clear existing info
                                this._resetStatusBar();
                            }

                        }
                        // No  leftbutton for dialog context
                        // Note: Don't change the left button style while in a Dialog. Left Button is not usable in a Dialog
                    }
                    else
                    {
                        // not a Dialog
                        // Context to change to non-dialog - clear snapshot.
                        // check why template snapshot is cleared after transition completed. Any specific usecase?
                        if (this._statusBarSnapshot)
                        {
                            this._statusBarSnapshot = null;
                        }

                        // set status bar for current context
                        if (this._isStatusBarDataValid(newUiaId, instance.getCurrentContext().ctxtId, ctxtTableEntry))
                        {
                            this._setStatusBar(newUiaId, instance.getCurrentContext().ctxtId, ctxtTableEntry);
                        }
                        else
                        {
                            // Clear status bar - no data
                            this._resetStatusBar();
                        }

                    }

                    // Show statusbar home button as required by this context.

                    if (ctxtTableEntry.hideHomeBtn === true)
                    {
                        this.common.showSbHomeButton(false);
                    }
                    else
                    {
                        this.common.showSbHomeButton(true);
                    }

                    //set the current app id to new app id
                    this._currentAppUiaId = newUiaId;

                    // prevTmpltInstance is the template we are transitionaing away from and
                    // this._currTmpltInstance is set to the template we are transitioning to
                    var prevTmpltInstance = this._currTmpltInstance;
                    this._currTmpltInstance = tempTemplate;
                    this._templateInstances[this._currTmpltInstance.divElt.id] = {
                        "instance" : tempTemplate,
                        "uiaId" : this._currentAppUiaId
                    };

                    if (appChanged && prevTmpltInstance)
                    {
                        // A context change to a new app requires calling finishPartialActivity() on a the previously displayed template.
                        if (typeof prevTmpltInstance.finishPartialActivity === 'function')
                        {
                            prevTmpltInstance.finishPartialActivity();
                        }

                        this._captureContext(prevTmpltInstance);
                    }

                    // Restore context code for global go back support
                    var readyParams = {
                        skipRestore : false
                    };
                    var cachedRestoreData = this._getContextRestoreData(instance.getCurrentContext());
                    if (cachedRestoreData)
                    {
                        readyParams.templateContextCapture = cachedRestoreData.templateContextCapture;
                    }

                    if (this._currentAppUiaId in this._appStack)
                    {
                        this._appInstances[this._currentAppUiaId].templateReadyToDisplay(this._currTmpltInstance, readyParams);
                    }

                    if (cachedRestoreData && !readyParams.skipRestore)
                    {
                        var commonParams = {
                            skipRestore : false,
                            commonContextCapture : cachedRestoreData.commonContextCapture
                        };
                        framework.common.restoreContext(commonParams);

                        if (!commonParams.skipRestore && typeof this._currTmpltInstance.restoreContext === 'function' && readyParams.templateContextCapture !== null)
                        {
                            this._currTmpltInstance.restoreContext(readyParams.templateContextCapture) // Must pass readyParams.templateContextCapture here because app readyFunction may have modified it.
                        }
                    }

                    if (!cachedRestoreData)
                    {
                        // Look for a context table focus group
                        if (prevTmpltInstance
                            && this._currTmpltInstance
                            && prevTmpltInstance.contextInfo.uiaId === this._currTmpltInstance.contextInfo.uiaId
                            && prevTmpltInstance.templateName === this._currTmpltInstance.templateName
                            && utility.toType(prevTmpltInstance.contextInfo.contextFocusGroup) === "string"
                            && prevTmpltInstance.contextInfo.contextFocusGroup === this._currTmpltInstance.contextInfo.contextFocusGroup
                            && typeof prevTmpltInstance.getContextCapture === "function"
                            && typeof this._currTmpltInstance.restoreContext === "function")
                        {
                            var capture = prevTmpltInstance.getContextCapture();
                            if (capture)
                            {
                                this._currTmpltInstance.restoreContext(capture);
                            }
                        }
                    }

                    this._commonTransitionData = this.common.getCommonTransitionData(this._currTmpltInstance);
                    if (cachedRestoreData)
                    {
                        this._commonTransitionData.goBackUsed = true;
                    }
                    else
                    {
                        this._commonTransitionData.goBackUsed = false;
                    }

                    this._frameworkState = this._FWK_STATE_TMPLT_CHANGE;

                    this._showTemplateSurfaces(this._currTmpltInstance);

                    var theCallback = this._templateTransitionCompleteCallback.bind(this);
                    this.transitionsObj.doTemplateTransition(prevTmpltInstance, this._currTmpltInstance, document.body, theCallback, this._commonTransitionData);
                }
            }
        }
        else
        {
            log.error("App Object could not be found in this._appInstances during _transitionChange for: " + this._currentAppUiaId);
            return;
        }
    }
}

GuiFramework.prototype._setStatusBar = function(uiaId, ctxId, dataObj)
{
    if ((uiaId == null) || (ctxId == null) || (dataObj == null))
    {
        var dataCheck = dataObj == null ? "null": "obj";
        log.error("GuiFramework._setStatusBar: data invalid/null : uiaId, ctxId, dataObj: " + uiaId + " " + ctxId + " " + dataCheck );
        return;
    }
    
    if (dataObj.sbNameId)
    {
        this.common.setSbNameId(uiaId, dataObj.sbNameId, dataObj.sbNameSubMap);
    }
    else if (dataObj.sbName)
    {
        this.common.setSbName(dataObj.sbName);
    }
    else if (dataObj.sbNameImage)
    {
        // Show statusbar image in app title position, as required by this context
        // Status bar will differentiate between text & images
        this.common.setSbName(dataObj.sbNameImage);
    }
    // Update the status bar domain icon
    this.common.setSbDomainIcon(this.common.getContextCategorySbIcon(this.common.getContextCategory(uiaId, ctxId)));
}

GuiFramework.prototype._resetStatusBar = function()
{
    // Make sure icon is hidden
    this.common.setSbDomainIcon(null);
    // Make sure any text is hidden
    this.common.setSbName(null);
}

GuiFramework.prototype._isStatusBarDataValid = function(uiaId, ctxId, dataObj)
{
    if (uiaId && ctxId && dataObj &&
        (((dataObj.sbNameId) || (dataObj.sbName) || (dataObj.sbNameImage)) && (this.common.getContextCategorySbIcon(this.common.getContextCategory(uiaId, ctxId)))))
    {
        return true;
    }
    else
    {
       return false;
    }
}

/*
 * Detect whether we should do a normal transition or capture a "snapshot" of the previous template's DOM elements.
 */
GuiFramework.prototype._shouldUseSnapshot = function(tempTemplate)
{
    if (tempTemplate.properties.isDialog)
    {
        // Detect if any surfaces will be hidden by this transition. If so we never use a snapshot for a transition to a dialog.
        var willHideAnySurface = false;
        var newVisibleSurfaces = [];
        if (tempTemplate.properties.visibleSurfaces)
        {
            newVisibleSurfaces = tempTemplate.properties.visibleSurfaces;
        }
        for(var i = 0; i < this._visibleSurfaces.length; i++)
        {
            if (this._visibleSurfaces[i] !== this._OPERA_SURFACE && newVisibleSurfaces.indexOf(this._visibleSurfaces[i]) == -1)
            {
                willHideAnySurface = true;
                break;
            }
        }

        return !willHideAnySurface;
    }
    return false;
}

/*
 * Capture the context information to restore it later after a go back.
 * @tparam Object templateInstance The old template instance
 */
GuiFramework.prototype._captureContext = function(templateInstance)
{
    log.debug("_captureContext of " + JSON.stringify(templateInstance.contextInfo));
    if (templateInstance)
    {
        var data = {
            uiaId : templateInstance.contextInfo.uiaId,
            ctxtId : templateInstance.contextInfo.ctxtId,
            timeStamp : Date.now(),
            templateContextCapture : null,
            commonContextCapture : framework.common.getContextCapture()
        };

        log.debug("_captureContext: " + data.uiaId + " " + data.ctxtId + " " + templateInstance.contextInfo.contextSeq + " " + templateInstance.divElt.id);

        if (typeof templateInstance.getContextCapture === 'function')
        {
            data.templateContextCapture = templateInstance.getContextCapture();
        }

        if (data.uiaId === "system" && data.ctxtId === "HomeScreen")
        {
            // Clear cached context restore data
            this._contextRestoreCache = {};
            if (this._debugMode)
            {
                this.debug.clearFakeGoBackStack();
            }
        }

        this._contextRestoreCache[templateInstance.contextInfo.contextSeq] = data;

        if (this._debugMode)
        {
            this.debug.addToFakeGoBackStack(templateInstance.contextInfo.contextSeq, data);
        }
    }
}

GuiFramework.prototype._getContextRestoreData = function(context)
{
    log.debug("_getContextRestoreData for " + context.contextSeq);
    var data = this._contextRestoreCache[context.contextSeq];
    if (data && data.uiaId === context.uiaId && data.ctxtId === context.ctxtId)
    {
        return data;
    }
    return null;
}

GuiFramework.prototype._removeContextRestoreData = function(contextSeqs)
{
    log.debug("_removeContextRestoreData " + JSON.stringify(contextSeqs));
    if (utility.toType(contextSeqs) === "number")
    {
        delete this._contextRestoreCache[contextSeqs];
    }
    else if (utility.toType(contextSeqs) === "array")
    {
        for (var i = 0; i < contextSeqs.length; ++i)
        {
            delete this._contextRestoreCache[contextSeqs[i]];
        }
    }
}

/*
 * Called when framework receives a msgType: "message" from MMUI.
 * Passes the message on to the appropriate app.
 * @tparam  String  uiaId   the uiaId of the app that the message is intended for.
 * @tparam  Object  msg     the message data sent from MMUI (may contain a payload)
 */
GuiFramework.prototype._handleMessage = function(uiaId, msg)
{
    try
    {
        // Note: we already check in routeMmuiMsg if the app is loaded
        //If uiaId is common it requires special handling
        if (uiaId == "common")
        {
            this.common.handleDataMessage(msg);
        }
        else
        {
            this._appInstances[uiaId].handleDataMessage(msg);
        }
    }
    catch (err)
    {
        log.error("Caught exception in framework._handleMessage for " + this.uiaId);
        log.writeError(err);
    }
}

GuiFramework.prototype._callHandleContext = function(contextObj)
{
    var current = this.getCurrAppInstance();
    if (current && current.uiaId === contextObj.uiaId)
    {
        if (current.isContextDifferentFrom(contextObj))
        {
            // The context change is for the app currently in focus so call finishPartialActivity().
            if (this._currTmpltInstance && typeof this._currTmpltInstance.finishPartialActivity === 'function')
            {
                this._currTmpltInstance.finishPartialActivity();
            }

            this._captureContext(this._currTmpltInstance);
        }
        else
        {
            // This is a duplicate context change for the currently focused app. For example, the user is spamming the Navi hard key.
            // We must use the contextSeq number from this new context for any future Go Back so we must update the contextInfo values
            // cached on the current template instance.
            if (this._currTmpltInstance)
            {
                this._currTmpltInstance.contextInfo.contextSeq = contextObj.contextSeq;
            }
        }
    }

    var instance = null;
    instance = this._appInstances[contextObj.uiaId];
    if(instance != null)
    {
        instance.handleContext(contextObj);
    }
}

/*
 * Called when framework needs to instantiate a new App.
 * Instantiates the app, calls the app's appInit() and stores the new app instance in this._appInstances
 * @tparam  String  uiaId   The uiaId of the app that needs to be started.
 */
GuiFramework.prototype._initApp = function(uiaId)
{
    //window[uiaId] interprets to the constructor name of the app e.g: usbaudioApp(uiaId)
    log.debug("Framework._initApp called with uiaId:", uiaId);
    var newId = uiaId + "App";
    if (!window[newId])
    {
        log.warn("    \"" + newId + "\" could not be found in namespace window.");
    }
    var tempInstance = new window[newId](uiaId);

    tempInstance.appInit();
    this._appInstances[uiaId] = tempInstance;
}

/*
 * Instantiates a new control and assigns it a unique DOM id.
 * @tparam  String      uiaId   The uiaId of the app that owns the control
 * @tparam  HTMLElement parentDiv   The parentDiv the control should add itself to
 * @tparam  String      name    The name of the control
 * @tparam  Object      properties  The control properties to be passed in to the control's constructor
 * @tparam  String      persistentName  (Optional) Unique Name passed for a child Control that will persist in the DOM (e.g. "_StatusBar", "_LeftBtn") across multiple contexts
 * @treturn Object      controlObj  The newly created control instance.
 */
GuiFramework.prototype.instantiateControl = function(uiaId, parentDiv, name, properties, persistentName)
{

    var controlObj = null;
    var isLoaded = false;

    if (this._controlsLoaded[name] != null && (this._controlsLoaded[name].isLoaded == true))
    {
        isLoaded = true;
    }

    if (!isLoaded)
    {
        // this should never happen. We load controls at app/template level
        log.warn("Needed control: \"" + name + "\" has not been loaded.");
    }
    else
    {
        var controlID = null;

        if (persistentName && utility.toType(persistentName) == 'string') // redundant null check avoids function call to improve performance
        {
            this._controlsLoaded[name].nameCounter = (this._controlsLoaded[name].nameCounter + 1) % this._MAX_ID_NUM; // Note: this will return the ID to 1 if it reaches the Max
            controlID = persistentName + name + this._controlsLoaded[name].nameCounter;
        }
        else
        {
            this._controlsLoaded[name].nameCounter = (this._controlsLoaded[name].nameCounter + 1) % this._MAX_ID_NUM; // Note: this will return the ID to 1 if it reaches the Max
            controlID = name + this._controlsLoaded[name].nameCounter;
        }
        //window[name] interprets to the constructor name of the control e.g: TwoBtnCtrl(this._controlsLoaded[name].nameCounter),properties)
        controlObj = new window[name](uiaId, parentDiv, controlID, properties); //Control now appends itself to the DOM
    }

    return controlObj;
}

/*
 * Calls a control's cleanUp function and removes the control's HTMLElement from the DOM.
 * @tparam  Object  controlObj  The control to be destroyed.
 */
GuiFramework.prototype.destroyControl = function(controlObj)
{
    if (!controlObj)
    {
        return;
    }

    log.debug("GuiFramework.prototype.destroyControl called for control: " + controlObj.divElt.id);

    controlObj.cleanUp();
    utility.removeHTMLElement(controlObj.divElt);
}

/*
 * Instantiates a new template and assigns it a unique DOM id.
 * @tparam  String      uiaId   The uiaId of the app that owns the template
 * @tparam  HTMLElement parentDiv   The parentDiv the template should add itself to
 * @tparam  String      name    The name of the template
 * @tparam  Object      properties  The template control properties to be passed in to the template's constructor
 * @tparam  String      path    (optional) The path to the template (if a common template, this will be null)
 * @treturn Object      templateObj  The newly created template instance.
 */
GuiFramework.prototype.instantiateTemplate = function(uiaId, parentDiv, name, properties, path)
{
    var templateObj = null;
    var isLoaded = false;

    if (this._templatesLoaded[name] != null && (this._templatesLoaded[name].isLoaded == true))
    {
        isLoaded = true;
    }

    if (!isLoaded)
    {
        this._addTmpltFiles(name, path);
        return null;
    }
    else
    {
        this._templatesLoaded[name].nameCounter = (this._templatesLoaded[name].nameCounter + 1) % this._MAX_ID_NUM;
        var divEltId = name + (this._templatesLoaded[name].nameCounter);

        log.info("instantiate template " + divEltId + " for uiaId " + uiaId);

        //window[name] interprets to the constructor name of the template e.g:
        // TwoBtnTmplt(uiaId,parentDiv,divEltId,properties)
        if (!window[name])
        {
            log.warn("    \"" + name + "\" could not be found in namespace window");
        }
        templateObj = new window[name](uiaId, parentDiv, divEltId, properties);
        //this._modifyTemplate(templatObj); ???
        var oldFunction = null;
        if (typeof templateObj.getContextCapture == 'function')
        {
            log.debug("Adding replacement function to template");
            oldFunction = templateObj.getContextCapture.bind(templateObj);
            templateObj.getContextCapture = function() {
                log.debug("Replacement function called. Performing deep copy.", this);
                var obj = oldFunction();
                var copy = utility.deepCopy(obj);
                return copy;
            }.bind(templateObj);
        }
    }
    return templateObj;
}

GuiFramework.prototype.showOperaSurface = function()
{
    // Add opera to the list of surfaces and fade-in.
    if (this._visibleSurfaces.indexOf(this._OPERA_SURFACE) === -1)
    {
        this._visibleSurfaces.push(this._OPERA_SURFACE);
        utility.setRequiredSurfaces(this._visibleSurfaces, true);
    }
}

/*
 * Add visible surfaces based on the contextInfo cookie cached on the template.
 */
GuiFramework.prototype._showTemplateSurfaces = function(someTemplate)
{
    var surfaces = someTemplate.contextInfo.newVisibleSurfaces;
    
    for(var i = 0; i < surfaces.length; i++)
    {
        if (this._visibleSurfaces.indexOf(surfaces[i]) === -1)
        {
            this._visibleSurfaces.push(surfaces[i]);
        }
    }

    // Avoid setting the required surfaces when transitioning to backupparking. NativeGuiCtrl will have
    // already hidden Opera to show the backup camera. If we call this now it will again show Opera but
    // we have not yet displayed the correct backupparking context.
    if (someTemplate.contextInfo.uiaId !== "backupparking")
    {
        utility.setRequiredSurfaces(this._visibleSurfaces, false);
    }
}

/*
 * Hide surfaces based on the contextInfo cookie cached on the template.
 * @returns True if any surface was hidden or false if no surfaces were hidden.
 */
GuiFramework.prototype._hideTemplateSurfaces = function(someTemplate)
{
    var surfaces = someTemplate.contextInfo.newVisibleSurfaces;
    var dirty = false;
    for (var i = this._visibleSurfaces.length - 1; i >= 0; --i)
    {
        // Never hide Opera.
        if (this._visibleSurfaces[i] !== this._OPERA_SURFACE && surfaces.indexOf(this._visibleSurfaces[i]) === -1)
        {
            this._visibleSurfaces.splice(i, 1);
            dirty = true;
        }
    }

    utility.setRequiredSurfaces(this._visibleSurfaces, false);

    if (someTemplate.contextInfo.newKeybrdInputSurface != this._keybrdInputSurface)
    {
        utility.setInputSurface(someTemplate.contextInfo.newKeybrdInputSurface);
        this._keybrdInputSurface = someTemplate.contextInfo.newKeybrdInputSurface;
    }

    return dirty;
}

/*
 * Callback for the end of a template transition.
 * Calls the old template's cleanUp function and removes its HTML from the DOM. Special exceptions are made for Dialogs.
 */
GuiFramework.prototype._templateTransitionCompleteCallback = function()
{
    log.info("template transition complete for " + this._currTmpltInstance.divElt.id);

    if (this._frameworkState == this._FWK_STATE_TMPLT_CHANGE)
    {
        var anySurfaceHidden = this._hideTemplateSurfaces(this._currTmpltInstance);

        for (var key in this._templateInstances)
        {
            if (this._currTmpltInstance && this._currTmpltInstance.divElt.id != key)
            {
                var tmpltInstObj = this._templateInstances[key];
                delete this._templateInstances[key];

                this._appInstances[tmpltInstObj.uiaId].templateNoLongerDisplayed(tmpltInstObj.instance);

                // Check to see if the context change involves a dialog
                if (this._currTmpltInstance.properties.isDialog && !anySurfaceHidden)
                {
                    if (tmpltInstObj.instance.properties.isDialog) //old template is a dialog
                    {
                        tmpltInstObj.instance.cleanUp();
                        // Remove old template div from body
                        utility.removeHTMLElement(key);
                    }
                    else // old template is not a dialog
                    {
                        this.common.cmnCtrlsDisabled = true;
                        tmpltInstObj.instance.cleanUp();
                    }
                }
                else
                {
                    if (tmpltInstObj.instance.properties.isDialog) //old template is a dialog
                    {
                        this.common.cmnCtrlsDisabled = false;
                        // remove template snapshot
                        if (tmpltInstObj.instance.properties.snapshotTmpltDivElt)
                        {
                            utility.removeHTMLElement(tmpltInstObj.instance.properties.snapshotTmpltDivElt);
                        }
                    }
                    //call template.cleanUp BEFORE we remove from DOM, but AFTER any properties logic
                    tmpltInstObj.instance.cleanUp();
                    //Remove old template div from body
                    utility.removeHTMLElement(key);
                }
            }
        }

        this.common.commonControlsUpdateComplete(this._commonTransitionData);

        this.debug.contextChanged(this._currTmpltInstance.contextInfo.uiaId, this._currTmpltInstance.contextInfo.ctxtId);

        // automatically switch the debug buttons (unless we changed to system app)
        if (this.debugMode && this._updateDebugPanelOnContextChange && this._currentAppUiaId != "system")
        {
            this.debug.changeDropDownText(this._currentAppUiaId, true);
        }

        // all cleaned up, now return to idle and process any queued MMUI messages
        this._frameworkState = this._FWK_STATE_IDLE;

        this._appInstances[this._currentAppUiaId].templateDisplayed(this._currTmpltInstance);

        // Set the template to the current multicontroller mode
        this._multicontrollerEventHandler(this.multicontroller.getMode());
    }
    else
    {
        log.debug("Ignoring transition end callback call in GuiFramework.transitionCompleteCallback");
    }

}

/*
 * Changes the current localized language setting. A context change must occur after language changes so
 * that all text is refreshed in the new language
 * @tparam  String  languageCode    The language code to switch to (e.g. "en_US" or "fr_FR")
 * @tparam  Function callbackFn     Invoked after language change success or failure.
 */
GuiFramework.prototype.changeLanguage = function(languageCode, callbackFn)
{
    log.debug("GuiFramework.prototype.changeLanguage  called ", languageCode, callbackFn);

    this._langChangeCompleteCallback = callbackFn;
	this._frameworkState = this._FWK_STATE_LANG_CHANGE_OUT;

    // Remove the statusBar and LeftButton
    // MPP 08/29/2013  SW00127573
    // No longer re-creating the status bar & left button on language change;
    // just refresh the status bar to re-translate everything
    //this.common.removeControls();

    this._isLanguageChanging = true;

    // Change style information based on display language setting
    this._setLanguageSpecificStyling(languageCode);

     // Load the new dictionaries
     // For all apps that are loaded and have lang support, attempt to reload the corresponding dict in the new language.
    var appDicts = this.localize.getAppsWithLangSupport();

    if (appDicts.length > 0)
    {
	    this._frameworkState = this._FWK_STATE_LOADING_DICTS;

        //add new dictionary scripts
        this._filesToLoad = new Object();
	    for(var i = 0; i < appDicts.length; i++)
	    {
	    	var uiaId = appDicts[i];
	    	log.debug("    Reloading Dictionary for: " + uiaId);
	        var dictPath = null;
            if (window["guiResources"] && guiResources.DICTIONARY_LIST[uiaId])
            {
                dictPath = "resources/js/" + uiaId + "/" + uiaId + "AppDict_" + languageCode + ".js";
                log.debug("Loading file from GUI Resources directory at: " + dictPath);
            }
            else
            {
    	        if (uiaId == "common")
    	        {
    	           dictPath = "common/js/commonAppDict_" + languageCode + ".js";
    	        }
    	        else
    	        {
    	           dictPath = "apps/" + uiaId + "/js/" + uiaId + "AppDict_" + languageCode + ".js";
    	        }
            }

	        this._filesToLoad[uiaId+languageCode] = false;
	        utility.loadScript(dictPath, {"lang":languageCode});
	    }
    }
    else
    {
        this._dictsLoaded(true);
    }
}

/*
 * DEPRECATED FUNCTIONALITY
 * Creates a basic "loading" screen to display while a language change occurrs and templates are
 * reinstantiated.
 * @tparam  String  displayText The text to display on the loading screen
 */
GuiFramework.prototype._createLoadingScreen = function(displayText)
{
    log.warn("_createLoadingScreen has been deprecated in favor of a full loading context in the syssettings application.");
    var loadScreen = document.createElement('div');
    loadScreen.id = 'languageLoadScreen';
    loadScreen.innerHTML = displayText;
    document.body.appendChild(loadScreen);
}

/*
 * Used to change the CSS styling per language (may also be used to update DOM lang attribute)
 * Currently this function only changes a document property.
 * In the future, this function might reload the stylesheets for all currently loaded Controls.
 * @param   languageCode    String  The GUI language code to set styling for (e.g. "en_US" or "fr_FR")
 */
GuiFramework.prototype._setLanguageSpecificStyling = function(languageCode)
{
    this._rtlLanguage = false;
    if (languageCode == "ar_SA" || languageCode == "he_IL")
    {
        this._rtlLanguage = true;
    }

    if (this._rtlLanguage == true)
    {
        log.info("Right-to-Left Language detected. Changing styling to match.");
//        document.body.style.direction = "rtl";

        // Add RTL-specific style sheets for all loaded controls (extend/override LTR style sheets)
        var links = document.getElementsByTagName("link");
        for (var linkIdx = links.length - 1; linkIdx >= 0; linkIdx--)
        {
            var curLink = links[linkIdx];

            // If the link is a style sheet, ...
            if (curLink.rel === "stylesheet")
            {
                // ... and the URL isn't already for a RTL style sheet, ...
                var hr = curLink.href;
                if (hr.search("_rtl.css") == -1)
                {
                    // ... get the URL for the RTL version of the style sheet
                    var new_hr = hr.replace(".css", "_rtl.css");

                    // Load the RTL style sheet
                    utility.loadCss(new_hr);
                }
            }
        }
    }
    else
    {
        // Note: Default case is LTR
        log.info("Left-to-Right Language detected. Changing styling to match.");
//        document.body.style.direction = "ltr";

        // Remove RTL-specific style sheets for all loaded controls
        var links = document.getElementsByTagName("link");
        for (var linkIdx = links.length - 1; linkIdx >= 0; linkIdx--)
        {
            var curLink = links[linkIdx];

            // If the link is an RTL style sheet, ...
            if ((curLink.rel === "stylesheet") &&
                (curLink.href.search("_rtl.css") != -1))
            {
                // ... remove the RTL style sheet from the DOM
                curLink.parentNode.removeChild(curLink);
            }
        }
    }
}

/*
 * Called after all dictionaries have been loaded after a language change.
 * Reinstantiates previously displayed templates and removes the language change notice.
 */
GuiFramework.prototype._dictsLoaded = function(status)
{
    log.debug("GuiFramework.prototype._dictsLoaded  called with status "+ status);

	this._isLanguageChanging = false;
    this.common.addControls();
    this._frameworkState = this._FWK_STATE_IDLE;
    this._langChangeCompleteCallback(status);

    // Set the template to the current multicontroller mode
    this._multicontrollerEventHandler(this.multicontroller.getMode());
}

/*
 * Returns true if multicontroller/touch input should be available.
 * @treturn     Boolean     enabled     true if multicontroller/touch input is enabled per the current framework state
 */
GuiFramework.prototype.getInputEnabled = function()
{
    var enabled = true;
    switch (this._frameworkState)
    {
        case this._FWK_STATE_IDLE:
            enabled = true;
            break;
        case this._FWK_STATE_YIELD_CPU:
            enabled = false;
            break;
        case this._FWK_STATE_LOADING_CMN:
            enabled = false;
            break;
        case this._FWK_STATE_LOADING_CMN_GLOBAL_CTRLS:
            enabled = false;
            break;
        case this._FWK_STATE_LOADING_APP:
            enabled = false;
            break;
        case this._FWK_STATE_LOADING_APP_CTRLS:
            enabled = false;
            break;
        case this._FWK_STATE_TMPLT_CHANGE:
            enabled = false;
            break;
        case this._FWK_STATE_LOADING_TMPLT:
            enabled = false;
            break;
        case this._FWK_STATE_LOADING_TMPLT_CTRLS:
            enabled = false;
            break;
        case this._FWK_STATE_LANG_CHANGE_OUT:
            enabled = false;
            break;
        case this._FWK_STATE_LOADING_DICTS:
            enabled = false;
            break;
        case this._FWK_STATE_LANG_CHANGE_IN:
            enabled = false;
            break;
        default:
            enabled = true;
            break;
    }
    return enabled;
}

/*
 * Returns true if the current template is a dialog or not true if it is not a dialog.
 */
GuiFramework.prototype.isCurrentTemplateDialog = function()
{
    if (this._currTmpltInstance && this._currTmpltInstance.properties)
    {
        return this._currTmpltInstance.properties.isDialog;
    }
    return false;
}

/*
 * Gets the uiaId of the current App. Returns null if no app is found.
 * @treturn String  this._currentAppUiaId    the uiaId of the app that has focus
 */
GuiFramework.prototype.getCurrentApp = function()
{
    return this._currentAppUiaId;
}

/*
 * Gets the instance of the current app. Returns null if no app is found.
 * @treturn  Object  appInstance the instance of the app that has focus
 */
GuiFramework.prototype.getCurrAppInstance = function()
{
    return this._appInstances[this._currentAppUiaId];
}

/*
 * Gets the instance of the app with the given uiaId. Returns null if no app is found.
 * @tparam  String  uiaId   the uiaId of the app to get an instance for.
 * @treturn Object  appInstance the instance of the app requested by uiaId. Returns null if no app is with a matching uiaId
 */
GuiFramework.prototype.getAppInstance = function(uiaId)
{
    return this._appInstances[uiaId];
}

/*
 * Gets the ID of the current context of the currently displayed template
 * @treturn String  the ctxtId or null if there is no current template.
 */
GuiFramework.prototype.getCurrCtxtId = function()
{
    if (this._currTmpltInstance)
    {
        return this._currTmpltInstance.contextInfo.ctxtId;
    }
    return null;
}

/*
 * Gets the sequence number of the current context of the currently displayed template
 * @treturn String  the contextSeq or null if there is no current template.
 */
GuiFramework.prototype.getCurrCtxtSeqNo = function()
{
    if (this._currTmpltInstance)
    {
        return this._currTmpltInstance.contextInfo.contextSeq;
    }
    return null;
}

/*
 * Called by GUI COMMON to pass the msg to the focused app
 * @param msg Message from MMUI
 */
GuiFramework.prototype.sendMsgToFocusedApp = function(msg)
{
    log.debug("GuiFramework.prototype.sendMsgToFocusedApp called");
    var instance = this.getCurrAppInstance();
    if (instance)
    {
        instance.handleDataMessage(msg);
    }
    else
    {
        log.debug("Cannot send message to focused App because the current App Instance is null.");
    }
}

/*
 * **********************
 * Framework loading functions
 * **********************
 */

/*
 * Adds app .css, .js, and dictionary files (in that order) to the DOM.
 * Generally after calling this function, framework will be waiting for the files to report back that they have loaded
 * @tparam  String  uiaId   the uiaId of the app to load files for.
 * @tparam  String  mmuiMsgObj  the MMUI message Object that caused the app load (not needed for system App)
 */
GuiFramework.prototype._addAppFiles = function(uiaId, mmuiMsgObj)
{
    log.debug("framework._addAppFiles called for: " + uiaId);

    var appName = null;
    var path = null;
    var jsPath = null;
    var cssPath = null;
    var cssRtlPath = null;

    this._lastAppLoaded = uiaId;

    if (uiaId == "common")
    {
        this._frameworkState = this._FWK_STATE_LOADING_CMN;

        appName = uiaId;

        // common is unique. "common" is not a uiaId, but we're using it here for convenience
        path = uiaId;
        jsPath = "common/js/Common.js";
    }
    else
    {
        this._frameworkState = this._FWK_STATE_LOADING_APP;

        appName = uiaId + "App";

        // file path is predictable (e.g. apps/system/)
        path = "apps/" + uiaId;
        jsPath = path + "/js/" + appName + ".js";
    }

    // Set the CSS paths
    cssPath = path + "/css/" + appName + ".css";
    cssRtlPath = path + "/css/" + appName + "_rtl.css";

    // store the js object for when the app finishes loading
    this._loadingAppJsObj = mmuiMsgObj;

    utility.loadCss(cssPath);
    if (this._rtlLanguage)
    {
        utility.loadCss(cssRtlPath);
    }
    utility.loadScript(jsPath);

    this._filesToLoad = new Object();
    this._filesToLoad[appName] = false;

}

/*
 * Adds template css, and .js files (in that order) to the DOM.
 * Generally after calling this function, framework will be waiting for the js file to report back that it has loaded
 * @tparam  String  templateName   the name of the template to load files for (e.g. ListTmplt)
 * @tparam  String  path    (optional) the path to an app-specific template root folder (not needed for common templates)
 */
GuiFramework.prototype._addTmpltFiles = function(templateName, path)
{
    log.debug("framework._addTmpltFiles called for: " + templateName);
    this._frameworkState = this._FWK_STATE_LOADING_TMPLT;

    if (!path)
    {
        log.debug("Full template path not given. Assuming template is in common...");
        var templateBase = templateName.split("Tmplt")[0]; // remove "Tmplt"
        path = "common/templates/" + templateBase;
    }
    else
    {
        // test that the path matches the name
        var endOfPath = path.slice(path.lastIndexOf("/") + 1) + "Tmplt";
        if (endOfPath != templateName)
        {
            log.warn("Template name and template path do not match. Possible typo in context table.");
        }
    }

    var cssPath = path + "/css/" + templateName + ".css";
    var cssRtlPath = path + "/css/" + templateName + "_rtl.css";
    var jsPath = path + "/js/" + templateName + ".js";

    utility.loadCss(cssPath);
    if (this._rtlLanguage)
    {
        utility.loadCss(cssRtlPath);
    }
    utility.loadScript(jsPath);
    this._filesToLoad = new Object();
    this._filesToLoad[templateName] = false;
}

/*
 * Tells framework that the requested app .js file has finished loading. Provides unique behavior for system app.
 * @tparam  String  uiaId    The uiaId of the app that finished loading (i.e. system).
 * @tparam  Array   controlList     Optional array of controls the app instantiates directly (i.e. not instantiated by
 *                                      a template the app uses)
 * @tparam  Boolean hasLangSupport  true if the app has dictionary files for language support
 */
GuiFramework.prototype.registerCommonLoaded = function(controlList, hasLangSupport)
{
    log.debug("registerCommonLoaded called");
    this._filesToLoad["common"] = true;

    if (controlList)
    {
        this._frameworkState = this._FWK_STATE_LOADING_CMN_GLOBAL_CTRLS;

        for (var i = 0; i < controlList.length; i++)
        {
            //load all controls not yet loaded
            var str = controlList[i];
            if (!this._processedFilePaths[str])
            {
                var strEnd = str.slice(str.lastIndexOf("/") + 1) + "Ctrl"; //get the last part of the path
                var jsPath = str + "/js/" + strEnd + ".js";
                var cssPath = str + "/css/" + strEnd + ".css";
                var cssRtlPath = str + "/css/" + strEnd + "_rtl.css";
                this._filesToLoad[strEnd] = false;

                //load all files in the given path
                utility.loadCss(cssPath);
                if (this._rtlLanguage)
                {
                    utility.loadCss(cssRtlPath);
                }
                utility.loadScript(jsPath);
                this._processedFilePaths[str] = true;
            }
        }
    }

    if (window["guiResources"] && guiResources.DICTIONARY_LIST["common"])
    {
        this.localize.addLangSupport("common");
        var lang = this.localize.getCurrentLanguage();
        var dictPath = "resources/js/common/commonAppDict_" + lang + ".js";

        this._filesToLoad["common"+lang] = false;
        utility.loadScript(dictPath, {"lang":lang});
    }
    else if (hasLangSupport)
    {
        this.localize.addLangSupport("common");
        var lang = this.localize.getCurrentLanguage();
        var dictPath = "common/js/commonAppDict_" + lang + ".js";

        this._filesToLoad["common"+lang] = false;
        utility.loadScript(dictPath, {"lang":lang});
    }

    //if there's no control list, or all controls in the list are already loaded, go directly to finishedLoading
    var allLoaded = true;

    for (var file in this._filesToLoad)
    {
        if (!this._filesToLoad[file])
        {
            log.debug("    File has not yet loaded. Waiting for file to load: " + file);
            allLoaded = false;
            break;
        }
    }

    //If we get through the object and all files are true, we can continue
    if (allLoaded)
    {
        this._commonFinishedLoading();
    }

}

/*
 * Tells framework that the requested app .js file has finished loading. This should be called as the last line of an app's .js file
 * @tparam   String  uiaId    The uiaId of the app that finished loading (e.g. system).
 * @tparam   Array   controlList     Optional array of controls the app instantiates directly (i.e. not instantiated by
 *                                      a template the app uses)
 * @tparam  Boolean hasLangSupport  true if the app has dictionary files for language support
 */
GuiFramework.prototype.registerAppLoaded = function(uiaId, controlList, hasLangSupport)
{
    log.debug("GuiFramework.registerAppLoaded called for: " + uiaId);

    this._filesToLoad[uiaId + "App"] = true;
    if (controlList)
    {
        this._frameworkState = this._FWK_STATE_LOADING_APP_CTRLS;

        for (var i = 0; i < controlList.length; i++)
        {
            //load all controls not yet loaded
            var str = controlList[i];
            if (!this._processedFilePaths[str])
            {
                var strEnd = str.slice(str.lastIndexOf("/") + 1) + "Ctrl"; //get the last part of the path
                var jsPath = str + "/js/" + strEnd + ".js";
                var cssPath = str + "/css/" + strEnd + ".css";
                var cssRtlPath = str + "/css/" + strEnd + "_rtl.css";
                this._filesToLoad[strEnd] = false;

                //load all files in the given path
                utility.loadCss(cssPath);
                if (this._rtlLanguage)
                {
                    utility.loadCss(cssRtlPath);
                }
                utility.loadScript(jsPath);
                this._processedFilePaths[str] = true;
            }
        }
    }

    if (window["guiResources"] && guiResources.DICTIONARY_LIST[uiaId])
    {

        this.localize.addLangSupport(uiaId);
        var lang = this.localize.getCurrentLanguage();
        var dictPath = "resources/js/" + uiaId + "/" + uiaId + "AppDict_" + lang + ".js";
        log.debug("Loading file from GUI Resources directory at: " + dictPath);

        this._filesToLoad[uiaId+lang] = false;
        utility.loadScript(dictPath, {"lang":lang});
    }
    else if (hasLangSupport)
    {
        this.localize.addLangSupport(uiaId);
        var lang = this.localize.getCurrentLanguage();
        var dictPath = "apps/" + uiaId + "/js/" + uiaId + "AppDict_" + lang + ".js";

        this._filesToLoad[uiaId+lang] = false;
        utility.loadScript(dictPath, {"lang":lang});
    }

    //if there's no control list, or all controls in the list are already loaded, go directly to finishedLoading
    var allLoaded = true;

    for (var file in this._filesToLoad)
    {
        if (!this._filesToLoad[file])
        {
            log.debug("    File has not yet loaded. Waiting for file to load: " + file);
            allLoaded = false;
            break;
        }
    }
    //If we get through the object and all files are true, we can continue
    if (allLoaded)
    {
        this._appFinishedLoading();
    }

}

/*
 * Tells framework that the requested template has finished loading.
 * This should be called as the last line of a template's .js file.
 * @tparam   String  templateName   The name of the template whose .js file finished loading (e.g. "ListTmplt").
 * @tparam   Array   controlList     Optional array of controls the template instantiates directly or indirectly (i.e
 *                                      includes any controls used by controls used by the template)
 */
GuiFramework.prototype.registerTmpltLoaded = function(templateName, controlList)
{
    log.debug("GuiFramework.registerTmpltLoaded called for: " + templateName);
    this._filesToLoad[templateName] = true;

    this._templatesLoaded[templateName] = {isLoaded:true, nameCounter:0};
    if (controlList)
    {
        this._frameworkState = this._FWK_STATE_LOADING_TMPLT_CTRLS;

        for (var i = 0; i < controlList.length; i++)
        {
            //load all controls not yet loaded
            var str = controlList[i];
            if (!this._processedFilePaths[str])
            {
                var strEnd = str.slice(str.lastIndexOf("/") + 1) + "Ctrl"; //get the last part of the path
                var jsPath = str + "/js/" + strEnd + ".js";
                var cssPath = str + "/css/" + strEnd + ".css";
                var cssRtlPath = str + "/css/" + strEnd + "_rtl.css";
                this._filesToLoad[strEnd] = false;

                //load all files in the given path
                utility.loadCss(cssPath);
                if (this._rtlLanguage)
                {
                    utility.loadCss(cssRtlPath);
                }
                utility.loadScript(jsPath);
                this._processedFilePaths[str] = true;
            }
            else
            {
                log.debug("    Control is already loaded. Skipping to next control.");
            }

        }
    }

    //if there's no control list, or all controls in the list are already loaded, go directly to finishedLoading
    var allLoaded = true;
    for (var file in this._filesToLoad)
    {
        if (!this._filesToLoad[file])
        {
            log.debug("    File has not yet loaded. Waiting for file to load: " + file);
            allLoaded = false;
            break;
        }
    }
    //If we get through the object and all files are true, we can continue
    if (allLoaded)
    {
        this._tmpltFinishedLoading();
    }
}

/*
 * Tells framework that the requested control has finished loading.
 * This should be called as the last line of a control's .js file
 * @tparam  String  controlName The name of the control that has finished loading (e.g. "ListCtrl")
 */
GuiFramework.prototype.registerCtrlLoaded = function(controlName)
{
    log.debug("GuiFramework.registerCtrlLoaded called for: " + controlName);
    this._controlsLoaded[controlName] = {isLoaded:true, nameCounter:0};
    this._filesToLoad[controlName] = true;
    var allLoaded = true;
    for (var file in this._filesToLoad)
    {
        if (!this._filesToLoad[file])
        {
            log.debug("    File has not yet loaded. Waiting for file to load: " + file);
            allLoaded = false;
            break;
        }
    }
    //If we get through the object and all files are true, we can continue
    if (allLoaded)
    {
        if (this._frameworkState == this._FWK_STATE_LOADING_APP_CTRLS)
        {
            this._appFinishedLoading();
        }
        else if (this._frameworkState == this._FWK_STATE_LOADING_TMPLT_CTRLS)
        {
            this._tmpltFinishedLoading();
        }
        else if (this._frameworkState == this._FWK_STATE_LOADING_CMN_GLOBAL_CTRLS)
        {
            this._commonFinishedLoading();
        }
    }
}

/*
 * Tells framework that the requested dictionary file has finished loading.
 * This should be called as the last line of a dictionary's .js file
 * @tparam  String  uiaId   the uiaId of the app that the dictionary belongs to.
 * @tparam  String  langCode    the language code of the dictionary that finished loading (e.g. "en_US" or "fr_FR")
 */
GuiFramework.prototype.registerAppDictLoaded = function(uiaId, langCode)
{
    log.debug("GuiFramework.registerAppDictLoaded for: " + uiaId + " " + langCode);
    this.localize.loadAppDict(uiaId);
    this._filesToLoad[uiaId+langCode] = true;
    var allLoaded = true;
    for (var file in this._filesToLoad)
    {
        if (!this._filesToLoad[file])
        {
            log.debug("    File has not yet loaded. Waiting for file to load: " + file);
            allLoaded = false;
            break;
        }
    }

    //If we get through the object and all files are true, we can continue
    if (allLoaded)
    {
    	if (this._frameworkState == this._FWK_STATE_LOADING_APP || this._frameworkState == this._FWK_STATE_LOADING_APP_CTRLS)
    	{
        	this._appFinishedLoading();
		}
		else if (this._frameworkState == this._FWK_STATE_LOADING_DICTS)
		{
			this._dictsLoaded(true);
		}
		else if(this._frameworkState == this._FWK_STATE_LOADING_CMN || this._frameworkState == this._FWK_STATE_LOADING_CMN_GLOBAL_CTRLS)
        {
            this._commonFinishedLoading();
        }
    }
}


/*
 * Called by framework when common app and all its controls are loaded.
 */
GuiFramework.prototype._commonFinishedLoading = function()
{
    log.debug("_commonFinishedLoading called");
    var name = "common";
    this.localize.loadAppDict(name);

    this._storeAppLoaded(name);

    //Instantiate common
    this.common = new Common();

    this._frameworkState = this._FWK_STATE_IDLE;

    //if we get this callback, we know this common is loaded. Check the WebSockets.
    if ((this._mmuiWsReady == true && this._appSdkWsReady == true && this._dbApiWsReady == true) || this.debugMode == true)
    {
        this._getStartupSettings();
    }

}

/*
 * Called by framework when an app and all its controls are loaded.
 * Calls initApp and sets the framework state back to idle
 */
GuiFramework.prototype._appFinishedLoading = function()
{
    log.debug("GuiFramework._appFinishedLoading called");
    var jsObject = this._loadingAppJsObj
    var uiaId = null;
    if (jsObject.msgType == "focusStack")
    {
        uiaId = jsObject.appIdList[0].id;
    }
    else
    {
        uiaId = jsObject.uiaId;
    }

    this._storeAppLoaded(uiaId);
    log.debug("this._appStack[uiaId] ", this._appStack[uiaId]);

    //Initializing app after loading
    this._initApp(uiaId);

    log.debug("Loading app object is", jsObject);

    //Check to see what message caused the app to load
    switch (jsObject.msgType)
    {
        case "ctxtChg":
            // App load was triggered by MMUI context message. Need to call _callHandleContext().
             this._callHandleContext(jsObject);
            break;
        case "focusStack":
            // App load was triggered by MMUI focus stack message. Need to call _focusStackChange().
            this._focusStackChange(jsObject.appIdList);
            break;
        case "msg":
            // App load was triggered by MMUI data message. Need to call this._appInstances[uiaId].handleContext()
            this._handleMessage(jsObject.uiaId, jsObject);
            break;
        case "alert":
            // Display the alert
            this.common.handleAlert(jsObject.uiaId, jsObject.alertId, jsObject.params);
            break;
        default:
            log.error("Cannot determine what caused the app to load. Framework is unsure what to do next. Make sure the message object was passed to framework._addAppFiles.");
            break;
    }
    // In any case, the app is done loading, so we can set this back to null
    this._loadingAppJsObj = null;

    if (guiConfig.testMode)
    {
        // notify jasmine manager
        this.jasmineMgr.appLoaded(uiaId);
    }

    //now at idle, continue processing MMUI Messages
    this._frameworkState = this._FWK_STATE_IDLE;

}

/*
 * Called when a template and all its controls are loaded.
 */
GuiFramework.prototype._tmpltFinishedLoading = function()
{
    this._frameworkState = this._FWK_STATE_TMPLT_CHANGE;
    this._transitionChange(false);
}

/*
 * Called whenever this._frameworkState is set.
 * If framework is set to idle, this function will begin processing queued MMUI messages until framework leaves idle state or
 * the queue is empty again.
 * If framework state leaves idle, this function starts a timer, which will call this._stateTimeout if framework is
 * out of idle for too long (this would signify some error has occurred).
 * @tparam  String  state   The new state to set framework to.
 */
GuiFramework.prototype._processNewFwkState = function(state)
{
    if (!state)
    {
        log.error("    Cannot set this._frameworkState to undefined!");
        return;
    }
    this._fwkState = state;

    // We should never get to idle twice, because of the state != this._fwkState return check in the setter
    if (state == this._FWK_STATE_IDLE)
    {
        log.debug("    framework._frameworkState set to Idle. Checking MMUI queue.");
        log.debug("    queue length " + this._msgQueue.length);
        log.debug("    " + JSON.stringify(this._msgQueue));
        //clear the state timeout
        clearTimeout(this._stateTimeoutId);
        //process any queued MMUI messages
        if (this._msgQueue.length > 0)
        {
            var i = 0;
            for (i; i < this._msgQueue.length; i++)
            {
                if (i < this._msgQueueYieldPoint)
                {
                    log.debug("    Parsing queued Messages " + i + " socketType is: " + this._msgQueue[i].socketType);
                    switch (this._msgQueue[i].socketType)
                    {
                        case "mmui":
                            this.routeMmuiMsg(this._msgQueue[i].msg); //FIFO
                            break;

                        case "dbapi":
                            this.routeDbapiMsg(this._msgQueue[i].msg); //FIFO
                            break;

                        case "appsdk":
                            this.routeAppsdkMsg(this._msgQueue[i].msg); //FIFO
                            break;

                        default:
                            log.warn("Invalid socket type message present in GUI Busy queue")
                            break;
                    }
                }
                else
                {
                    log.debug("Hit yield point limit at", i);
                    this._yieldCpuToOpera();
                    break; // break the loop here so that we don't iterate i below.
                    
                }
                // if after parsing the mmui message, we are not idle, break the loop
                if (this._fwkState != this._FWK_STATE_IDLE)
                {
                    i++;
                    // breaking the loop does not iterate i, so we do it manually.
                    break;
                }

            }
            //remove any messages that were processed, AFTER we exit the loop.
            this._msgQueue.splice(0, i);

            log.debug("    _msgQueue now has length: " + this._msgQueue.length + ". Total messages spliced: " + i);
        }
    }
    else
    {
        clearTimeout(this._stateTimeoutId);

        // Use a shorter timeout duration during language change.
        var duration = this._isLanguageChanging ? 2000 : 8000;
        var err = new Error();
        err.message = "State changed to " + this._fwkState + ". Last MMUI message processed: " + JSON.stringify(this._lastMmuiMessage);
        var self = this;
        this._stateTimeoutId = setTimeout(function() {
            self._stateTimeout(err);
        }, duration);
    }
}

/*
 * Called if framework is out of idle state for too long. (See this._processNewFwkState for setTimeout)
 */
GuiFramework.prototype._stateTimeout = function(err)
{
    log.error("State Timeout Error: Framework never returned to IDLE state from: " + this._frameworkState);
    log.info("Before the error, GUI was in App: " + this._currentAppUiaId + " and context: " + this.getCurrCtxtId());
    log.writeError(err);

    // Log any messages stuck in the mmuiMsgQueue
    // Create a non-reference copy of the array so we get the correct log line
    var queue = this._msgQueue.slice();

    if (queue && queue.length > 0)
    {
        if (guiConfig.pcLogging)
        {
            log.info("    Message queue contains: ", queue);
        }
        else
        {
            log.info("    Message queue contains: ", JSON.stringify(queue));
        }

    }

    var someFileFailed = false;
    var nonDictFailedToLoad = false;
    // Log the list of files that were requested to load but did not reply
    for (var i in this._filesToLoad)
    {
        // A file being in the this._filesToLoad, but === false would indicate we needed it to load, but it did not load
        // Only .js files can be checked in this way. Currently, .css files cannot.
        if (this._filesToLoad[i] === false)
        {
            someFileFailed = true;
            log.warn("    Requested file failed to load: " + i);
            if (i.indexOf("_") == -1) // only dictionary keys have an underscore
            {
                nonDictFailedToLoad = true;
            }
        }
    }

    // Special case error handling for App dictionaries
    if (this._frameworkState == this._FWK_STATE_LOADING_APP || this._frameworkState == this._FWK_STATE_LOADING_APP_CTRLS)
    {
        if (someFileFailed)
        {
            // if nonDictFailedToLoad is false, then only dictionary files failed to load
            if (!nonDictFailedToLoad && Object.keys(this._filesToLoad).length > 0)
            {
                log.error("Framework has timed out due to 1 or more dictionaries not loading. Check console for list of files.");
                log.error("App dictionary files can be generated to prevent this timeout. App will display stringIds for this language until dictionary is added.");
                this._appFinishedLoading(); // change state as though the app finished loading correctly
                return;
            }
        }
    }
    else if (this._frameworkState == this._FWK_STATE_LOADING_DICTS)
    {
        log.error("Framework has timed out due to 1 or more dictionaries not loading. Apps will display stringIds for this language until dictionary is added. Attempting to return to IDLE state.");

        // If the config is set as ignore dictionary load failure send success or send failed
        if (guiConfig.ignoreDictsFailure)
        {
            this._dictsLoaded(true);
        }
        else
        {
            this._dictsLoaded(false);
        }
        return;
    }

    this._showFatalErrorWink("State Timeout Error", "Search for 'State Timeout' in the log for more details.");

    switch (this._frameworkState)
    {
        case this._FWK_STATE_LOADING_CMN:
        case this._FWK_STATE_LOADING_CMN_GLOBAL_CTRLS:
            if (someFileFailed)
            {
                log.error("Framework has timed out: GUI Common Module could not be loaded. The GUI may not have started.");
            }
            else
            {
                log.error("Framework has timed out: Files were loaded, but some error occurred while trying to start the GUI Common Module. The GUI may not have started.");
            }
            break;
        case this._FWK_STATE_LOADING_APP:
            if (someFileFailed)
            {
                log.error("Framework has timed out: Some " + this._lastAppLoaded + " App file failed to load. Check the log for which file.");
            }
            else
            {
                log.error("Framework has timed out: App files loaded, but some other error occurred while attempting to initialize the App: " + this._lastAppLoaded);
            }
            break;
        case this._FWK_STATE_LOADING_APP_CTRLS:
            if (someFileFailed)
            {
                log.error("Framework has timed out: " + this._lastAppLoaded + " App requested control files that failed to load.");
            }
            else
            {
                log.error("Framework has timed out: Control files loaded, but some other error occurred while attempting to instantiate the Control.");
            }
            break;
        case this._FWK_STATE_TMPLT_CHANGE:
            log.error("Framework has timed out: Transition failed. Possibly, there is an error in the App's template ready functions. Or the system could be out of memory.");
            break;
        default:
            break;
    }

    if (this.debugMode)
    {
        log.error("Framework has timed out while in debug mode. Attempting to return to IDLE state.");

        // Go to IDLE state and hope for the best
        this._frameworkState = this._FWK_STATE_IDLE;
    }
    else
    {
        // Reload the page in order to restart the GUI
        log.error("Framework has timed out while not in debug mode. Attempting to restart GUI.");

        // Wait briefly so the error message shows
        setTimeout(function() {
            this._restartCMU("State Timeout");
        }.bind(this), 1000);
    }
}

/*
 * Show an error in a wink control. This is only used internally by GUIFWK to show a error before
 * reloading the entire GUI (such as state timeout or websocket failure).
 */
GuiFramework.prototype._showFatalErrorWink = function(text1, text2)
{
    if (guiConfig.showFrameworkErrorAlerts)
    {
        var properties = {
            winkTimeout : 1000,
            style : "style04",
            text1 : text1,
            text2 : text2,
            completeCallback : function(){
                this.destroyControl(this._errorWinkControl);
            }.bind(this),
        }
        this._errorWinkControl = this.instantiateControl("common", document.body, "WinkCtrl", properties);
    }
}

/*
 * In production this function restarts the CMU in response to a fatal error.
 */
GuiFramework.prototype._restartCMU = function(reason)
{
    if (this._heartbeatMonitor)
    {
        log.error("* * * * FATAL ERROR - RESTARTING CMU : " + reason);
        clearInterval(this._heartbeatIntervalId);
        this._heartbeatMonitor.forceExit();
    }
}

/*
 * This function enters the YIELD_CPU state and sets a timeout of 0 to return to IDLE at the next
 * chance Opera gets.
 */
GuiFramework.prototype._yieldCpuToOpera = function()
{
    this._frameworkState = this._FWK_STATE_YIELD_CPU;
    setTimeout(function() {
        this._frameworkState = this._FWK_STATE_IDLE;
    }.bind(this), 0);
};

/*
 * Called by Websockets.js when the MMUI WebSocket connection has been established.
 * Also called if the WebSocket connection cannot be established (indicates testing mode without WebSockets)
 * @tparam  Boolean     connected   true if the WebSocket connected succesfully. false if in test (debug) mode
 */
GuiFramework.prototype.mmuiConnected = function(connected)
{
    log.debug("GuiFramework.mmuiConnected called " + connected);
    // if we get this callback, we know this Ws is ready. Check the other WebSockets and Common Loaded.
    this._mmuiWsReady = connected;
    if ((this._appSdkWsReady == true && this._dbApiWsReady == true) && this._appStack.hasOwnProperty("common"))
    {
        this._getStartupSettings();
    }
}

/*
 * Called by Websockets.js when the AppSdk WebSocket connection has been established.
 * Also called if the WebSocket connection cannot be established (indicates testing mode without WebSockets)
 * @tparam  Boolean     connected   true if the WebSocket connected succesfully. false if in test (debug) mode
 */
GuiFramework.prototype.appSdkConnected = function(connected)
{
    log.debug("GuiFramework.appSdkConnected called " + connected);
    //if we get this callback, we know this Ws is ready. Check the other WebSockets and Common Loaded.
    this._appSdkWsReady = connected;
    if ((this._mmuiWsReady == true && this._dbApiWsReady == true) && this._appStack.hasOwnProperty("common"))
    {
        this._getStartupSettings();
    }
}

/*
 * Called by Websockets.js when the DBAPI WebSocket connection has been established.
 * Also called if the WebSocket connection cannot be established (indicates testing mode without WebSockets)
 * @tparam  Boolean     connected   true if the WebSocket connected succesfully. false if in test (debug) mode
 */
GuiFramework.prototype.dbApiConnected = function(connected)
{
    log.debug("GuiFramework.dbApiConnected called " + connected);
    //if we get this callback, we know this Ws is ready. Check the other WebSockets and CommonLoaded.
    this._dbApiWsReady = connected;
    if ((this._mmuiWsReady == true && this._appSdkWsReady == true) && this._appStack.hasOwnProperty("common"))
    {
        this._getStartupSettings();
    }
}

/*
 * Set a shared attribte which can be accessed by other GUI components.
 * @tparam String uiaId The application that primarily owns the value.
 * @tparam String name The name of the value.
 * @tparam Object value Any object or value for the attribute.
 */
GuiFramework.prototype.setSharedData = function(uiaId, name, value)
{
    if (typeof uiaId === 'string' && typeof name === 'string')
    {
        this._lookupSharedDataInfo(uiaId, name).value = value;
        this._onSharedDataValueChanged(uiaId, name);
    }
    else
    {
        log.warn("setSharedData called with invalid uiaId or name.");
    }
}

/*
 * Lookup and return an object containing the shared data value and subscribers.
 * If no object is found this function will initialize and add one.
 */
GuiFramework.prototype._lookupSharedDataInfo = function(uiaId, name)
{
    var key = uiaId + name;
    if (!this._sharedDataAttributes.hasOwnProperty(key))
    {
        this._sharedDataAttributes[key] = {
            value: undefined,
            subscribers: []
        };
    }
    return this._sharedDataAttributes[key];
}

/*
 * Inform all subscribers and the current in-focus app of a shared attribute value change.
 */
GuiFramework.prototype._onSharedDataValueChanged = function(uiaId, name)
{
    var key = uiaId + name;
    var instance = this.getCurrAppInstance();
    if (instance)
    {
        instance.handleSharedDataChanged(uiaId, name, this._sharedDataAttributes[key].value);
    }

    for (var i = 0; i < this._sharedDataAttributes[key].subscribers.length; ++i)
    {
        if (this._sharedDataAttributes[key].subscribers[i] !== this._currentAppUiaId)
        {
            var appInstance = this.getAppInstance(this._sharedDataAttributes[key].subscribers[i]);
            if (appInstance)
            {
                appInstance.handleSharedDataChanged(uiaId, name, this._sharedDataAttributes[key].value);
            }
        }
    }
}

/*
 * Get a shared attribute previously set by a call to setSharedData.
 * @tparam String uiaId The application that primarily owns the value.
 * @tparam String name The name of the value.
 * @treturn Object The value of the attribute or undefined if the uiaId-name was not found.
 */
GuiFramework.prototype.getSharedData = function(uiaId, name)
{
    if (typeof uiaId === 'string' && typeof name === 'string')
    {
        return this._lookupSharedDataInfo(uiaId, name).value;
    }
    else
    {
        log.warn("getSharedData called with invalid uiaId or name.");
    }
}

/*
 * Subscribe to a shared attribute so that an app will always
 * be informed when a shared value changes.
 * @tparam String uiaId The application that is subscribing
 * @tparam String sharedDataUiaId The application that primarily owns the value.
 * @tparam String sharedDataName The name of the value.
 */
GuiFramework.prototype.subscribeToSharedData = function(uiaId, sharedDataUiaId, sharedDataName)
{
    if (typeof uiaId === 'string' && typeof sharedDataUiaId === 'string' && typeof sharedDataName === 'string')
    {
        var info = this._lookupSharedDataInfo(sharedDataUiaId, sharedDataName);
        if (info.subscribers.indexOf(uiaId) === -1)
        {
            info.subscribers.push(uiaId);
        }
    }
    else
    {
        log.warn("subscribeToSharedData called with invalid uiaId or sharedDataUiaId or sharedDataName");
    }
}

/*
 * Unsubscribe from a shared attribute.
 * @tparam String uiaId The application that is unsubscribing
 * @tparam String sharedDataUiaId The application that primarily owns the value.
 * @tparam String sharedDataName The name of the value.
 */
GuiFramework.prototype.unsubscribeToSharedData = function(uiaId, sharedDataUiaId, sharedDataName)
{
    if (typeof uiaId === 'string' && typeof sharedDataUiaId === 'string' && typeof sharedDataName === 'string')
    {
        var info = this._lookupSharedDataInfo(sharedDataUiaId, sharedDataName);
        var index = info.subscribers.indexOf(uiaId);
        if (index !== -1)
        {
            info.subscribers.splice(index, 1);
        }
    }
    else
    {
        log.warn("subscribeToSharedData called with invalid uiaId or sharedDataUiaId or sharedDataName");
    }
}
