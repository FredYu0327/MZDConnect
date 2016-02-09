/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: Debug.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: awoodhc
 Date: 04.30.2012
 __________________________________________________________________________

 Description: IHU GUI Debug Module

 Revisions:
 v0.1 - Initial Revision. (1-May-2012) Text Log and HTML console. Text input is available for Debug methods only.
 v0.2 - New Features. (2-May-2012) General cleanup. Added demo code and MmuiMsg constants. sendMmuiMsg now accepts
        multiple args.
 v0.3 - Restructuring (3-May-2012) Removed extraneous functionality. Added test.js injection. Added hook callback.
 v0.4 (7-June-2012) Debug.js is now set up for multiple <appName>Test.js files and can share the upper debug panel amongst them.
 v0.5 (18-June-2012)  Changed names of Debug "hook" variables to be more descriptive. Removed debug screen function.
 v0.6 (29-June-2012) Changed "Hook" log messages to be more descriptive
 v0.7 (26-July-2012) this.debugPanelEnabled now properly sets the private variable this._debugOn
 v0.8 (24-Aug-2012) Added special "Common" event handling to triggerEvtToMmuiCallbacks function
 v0.9 (19-Oct-2012) DebugMode now applies setTimeout to MMUI messages to simulate round trip to MMUI and back (asynchronous)
 v1.0 (15-Nov-2012) Updated for AppSDK support - aganesar
 __________________________________________________________________________

 */

log.addSrcFile("Debug.js", "framework");

/*
 * =========================
 * Debug's constructor
 * =========================
 * The Debug Console will be set up once in the framework and then should be accessed via framework.debug
 * The Debug Console can be used to log messages, implement custom html, send .json messages to/from the MMUI, etc.
 */
function Debug()
{
    //private constants
    
    // private variables
    this._debugDiv = null; // (HTMLElement) The container div for the debug module
    this._logDiv = null;   // (HTMLElement) The text log for spitting out messages.
    this._debugOn = true;  // (boolean) Used by get/set to track whether the debugger is on
    this._toMmuiCallbackTable = new Object(); // keeps a list of hook functions to call when an event is sent to Mmui
    this._toDbapiCallbackTable = new Object(); // keeps a list of hook functions to call when a request is sent to Dbapi
    this._toAppsdkCallbackTable = new Object(); // keeps a list of hook functions to call when a request is sent to AppSDK
    this._mmuiCallbackAvail = false;  // (boolean) Whether debug has a callback function that will capture messages sent to the Mmui
    this._dbapiCallbackAvail = false;  // (boolean) Whether debug has a callback function that will capture messages sent to the Dbapi    
    this._appsdkCallbackAvail = false;  // (boolean) Whether debug has a callback function that will capture messages sent to the Dbapi
    this._dropDown = null; //(HTMLElement) The dropdown box that is used to select which buttons are displayed in the html div
    this._htmlDiv = null;   // (HTMLElement) The html div for adding buttons, etc.
    this._contextSeqCounter = 1; // Counter to simulate contextSeq member of ctxtChg message.
    this._debugPanels = {}; // Collection of debug panels for loaded apps
    this._goBackStack = [];     // Fake Global Go Back managed by the user with the Push and Pop Context buttons.
 
    //@formatter:off
    //Fake mmui messages
    this._mmuiMsg = new Object();
    this._mmuiMsg.transitionFalse = JSON.stringify( {"msgType": "transition", "enabled": false} );
    this._mmuiMsg.transitionTrue = JSON.stringify( {"msgType": "transition", "enabled": true} );
    //@formatter:on
    

    /*(Boolean) setting this.debugPanelEnabled to false will disable logDebug and contained functionality. Sending Mmui messages
     * and using the hook function (to capture GUI messages) is still possible.
     */
    this.__defineGetter__('debugPanelEnabled', function()
    {
        return this._debugOn;
    });
    this.__defineSetter__('debugPanelEnabled', function(flag)
    {

        if(this._debugOn == flag)
        {
            return;
        }
        
        if(flag)
        {
            //display html divs
            log.info("Adding Debug Panel to DOM.");
            document.body.appendChild(this._debugDiv);
        }
        else
        {
            //remove html divs
            document.body.removeChild(this._debugDiv);
        }
        this._debugOn = flag;
    });
    
    this.init();
}

/*
 * =========================
 * Module's init
 * =========================
 */

Debug.prototype.init = function()
{
    log.debug("---Debug module started successfully---");
    this._createDivs();
    this.logDebug("Debug module started successfully");

}
/*
 * =========================
 * Module's private API
 * The following methods should be used only inside
 * this control.
 * =========================
 */

/*
 * Sets up the Debug Console's div display elements
 */
Debug.prototype._createDivs = function()
{
    var debugDiv = document.createElement('div');
    debugDiv.id = "DebugCont";
    this._debugDiv = debugDiv;

    //Create the dropdown box
    var dd = document.createElement('select');
        dd.name = "DebugDropDown";
        dd.id = "DebugDropDown";
        dd.onchange = this._changeBtnDiv.bind(this);
    this._dropDown = dd;

    //Create the upper debug element
    var ht = document.createElement('div');
        ht.id = "DebugHtmlDiv";
        ht.innerHTML = "HTML console ready.<br />";
    this._htmlDiv = ht;

    //Create the lower debug element
    var txt = document.createElement('div');
    //Add a "clear log" button
    var clearBtn = document.createElement('div');
        clearBtn.id = "DebugClear";
        clearBtn.innerHTML = "<a href='#' onclick='javascript:framework.debug.clearLog(); return false;'>clear log</a>";
        txt.id = "DebugLogDiv";
        txt.innerHTML = "Text console ready.<br />";    
    this._logDiv = txt;

    // Create global go back test buttons
    var goBackDiv = document.createElement('div');
    goBackDiv.id = "DebugGoBackDiv";
    goBackDiv.innerHTML = "GoBack Stack: "
        + "<a id='DebugGoBackClear' href=#'>Clear</a> "
        + "<span><select id='DebugGoBackStack' name='DebugGoBackStack'><option style='color:#ccc;'>Select a previous context (Most recent listed first)</option></select></span>";

    this._debugDiv.appendChild(dd);
    this._debugDiv.appendChild(ht);
    this._debugDiv.appendChild(txt);
    this._debugDiv.appendChild(clearBtn);
    this._debugDiv.appendChild(goBackDiv);
    document.body.appendChild(this._debugDiv);

    document.getElementById('DebugGoBackClear').onclick = this.clearFakeGoBackStack.bind(this);
    this._goBackDropDown = document.getElementById('DebugGoBackStack');
    this._goBackDropDown.onchange = this._selectGoBackDropDown.bind(this);
    
    if (guiConfig.screenNameLabelEnabled)
    {
        this._screenNameLabelDiv = document.createElement('div');
        this._screenNameLabelDiv.className = "DebugScreenNameLabel";
        document.body.appendChild(this._screenNameLabelDiv);
    }
    
    if (framework.debugMode)
    {
        utility.loadScript("framework/test/DebugTest.js", null, this._testFileLoaded.bind(this));
    }
}

/*
 * Simulate a go back to the selected context
 */
Debug.prototype._selectGoBackDropDown = function()
{
    if (this._goBackDropDown.selectedIndex > 0)
    {
        var index = this._goBackStack.length - this._goBackDropDown.selectedIndex;
        var context = this._goBackStack[index];
        this._goBackStack.splice(index, 1);
        this._updateGoBackStackDisplay();
        this._goBackDropDown.selectedIndex = 0;
        this.fakeCtxtChgMsgs(context.uiaId, context.ctxtId, context.params, context.contextSeq);
    }
    return false;
}

/*
 * Clear the fake go back stack
 */
Debug.prototype.clearFakeGoBackStack = function()
{
    this._goBackStack = [];
    this._updateGoBackStackDisplay();
    return false;
}

/*
 * Add an entry to the fake go back stack.
 */
Debug.prototype.addToFakeGoBackStack = function(contextSeq, data)
{
    this._goBackStack.push({
        uiaId : data.uiaId,
        ctxtId : data.ctxtId,
        params : data.params,
        contextSeq : contextSeq
    });
    this._updateGoBackStackDisplay();
}

/*
 * Select to go back on the fake go back stack.
 */
Debug.prototype.goBackOnFakeGoBackStack = function()
{

    var context = null;
    if (this._goBackStack.length == 0)
    {
        context = framework.getCurrAppInstance()._currentContextTemplate.contextInfo;
    }
    else
    {
        context = this._goBackStack.pop();
        this._updateGoBackStackDisplay();

        this.fakeCtxtChgMsgs(context.uiaId, context.ctxtId, context.params, context.contextSeq);
    }
    return context;
}

/*
 * Update the go back drop down list with the current fake go back stack.
 */
Debug.prototype._updateGoBackStackDisplay = function()
{
    // Remove old children
    while (this._goBackDropDown.children.length > 1)
    {
        this._goBackDropDown.removeChild(this._goBackDropDown.children[1]);
    }

    // Add new children
    for (var i = this._goBackStack.length - 1; i >= 0; i--)
    {
        var c = this._goBackStack[i];
        var params = "";
        if (c.params)
        {
            params = " params:" + JSON.stringify(c.params);
        }
        this._goBackDropDown.innerHTML += "<option>" + c.uiaId + " " + c.ctxtId + " " + c.contextSeq + " " + params + "</option>";
    }
}

/*
 * Sets the upper debug panel to "debug home" content after the DebugTest.js file loads
 * @tparam  Event   evt The onload event data
 */
Debug.prototype._testFileLoaded = function(evt)
{
    var debugTest = new DebugTest();
    framework.debugTest = debugTest;
    //automatically display the debug buttons
    // create a fake event with a fake source element to help us
    var srcElement = {"value": "Debug Home"};
    var fakeEvt = {"srcElement": srcElement};
    this._changeBtnDiv(fakeEvt);
}

/*
 * Called by Framework at the end of a context change
 */
Debug.prototype.contextChanged = function(uiaId, ctxtId)
{
    if (uiaId && ctxtId)
    {
        if (guiConfig.screenNameLabelEnabled && this._screenNameLabelDiv)
        {
            this._screenNameLabelDiv.innerText = uiaId + "." + ctxtId;
        }
        
    }
}

/*
 * Changes the visible text inside the debug drop down div to the given value.
 * If changeBtns is true, will also change the button div to show the correct buttons
 */
Debug.prototype.changeDropDownText = function(value, changeBtns) 
{

    if (!this.debugPanelEnabled)
    {
        return;
    }
    
    var ddl = document.getElementById("DebugDropDown");

    var srcElement = {"value": value};
    var fakeEvt = {"srcElement": srcElement};
    //TODO: It would be better if this function did not get called if the app didn't change
    
    for (var i = 0; i < ddl.options.length; i++) 
    {
        if (ddl.options[i].value == value) 
        {
            if (ddl.selectedIndex != i) 
            {
                ddl.selectedIndex = i;

                if (changeBtns)
                {
                    this._changeBtnDiv(fakeEvt);
                }

            }
            break;
        }
    }

 }


/*
 * Changes the upper debug panel content when a new selection is made in the dropdown panel
 * @tparam  Event   evt The onchange event data
 */
Debug.prototype._changeBtnDiv = function(evt)
{
    if (!this._debugOn)
    {
        return;
    }
    var uiaId = evt.srcElement.value;
    
    var content = this._debugPanels[uiaId];
    this._htmlDiv.innerHTML = content;
}

/*
 * =========================
 * Module's public API
 * The followig methods are available for
 * public access.
 * =========================
 */

/*
 * Sends a message from the fake MMUI to the framework.
 * Multiple arguments can be passed and each message will be sent in order.
 * If an array of .json objects is passed, the function will send each message in order.
 * @tparam  Mixed   data (.json String || Array of .json strings) the message, e.g. JSON.stringify({"msgType":"transition","enabled":true} );
 * @tparam  ...     This function will accept multiple arguments and send each message in order.
 */
Debug.prototype.sendMmuiMsg = function(data)
{
    if (arguments.length > 1)
    {
        //is the data a list of objects?
        for (var i = 0; i < arguments.length; i++)
        {
            log.debug("Debug.sendMmuiMsg arguments passed as: ", arguments[i]);
            framework.routeMmuiMsg(JSON.parse(arguments[i]));
        }
        return;
    }

    if (Object.prototype.toString.call(data) == '[object Array]')
    {
        //is the data an array?
        for (var j = 0; j < data.length; j++)
        {
            framework.routeMmuiMsg(JSON.parse(data[j]));
        }
        return;
    }
    //otherwise we have 1 object to send
    framework.routeMmuiMsg(JSON.parse(data));
}

/*
 * Sends a message from the fake DBAPI to the framework.
 * Multiple arguments can be passed and each message will be sent in order.
 * If an array of .json objects is passed, the function will send each message in order.
 * @tparam  Mixed   data (.json String || Array of .json strings) from DBAPI
 * @tparam  ...     This function will accept multiple arguments and send each message in order.
 */
Debug.prototype.sendDbapiMsg = function(data)
{    
    if (arguments.length > 1)
    {
        //is the data a list of objects?
        for (var i = 0; i < arguments.length; i++)
        {
            log.debug("Debug.sendDbapiMsg arguments passed as: ", arguments[i]);
            framework.routeDbapiMsg(JSON.parse(arguments[i]));
        }
        return;
    }

    if (Object.prototype.toString.call(data) == '[object Array]')
    {
        //is the data an array?
        for (var j = 0; j < data.length; j++)
        {
            framework.routeDbapiMsg(JSON.parse(data[j]));
        }
        return;
    }
    //otherwise we have 1 object to send
    framework.routeDbapiMsg(JSON.parse(data));
}

/*
 * Sends a message from the fake APPSDK to the framework.
 * Multiple arguments can be passed and each message will be sent in order.
 * If an array of .json objects is passed, the function will send each message in order.
 * @tparam  Mixed   data (.json String || Array of .json strings) from APPSDK
 * @tparam  ...     This function will accept multiple arguments and send each message in order.
 */
Debug.prototype.sendAppsdkMsg = function(data)
{
    if (arguments.length > 1)
    {
        //is the data a list of objects?
        for (var i = 0; i < arguments.length; i++)
        {
            log.debug("Debug.sendAppsdkMsg arguments passed as: ", arguments[i]);
            framework.routeAppsdkMsg(JSON.parse(arguments[i]));
        }
        return;
    }

    if (Object.prototype.toString.call(data) == '[object Array]')
    {
        //is the data an array?
        for (var j = 0; j < data.length; j++)
        {
            framework.routeAppsdkMsg(JSON.parse(data[j]));
        }
        return;
    }
    //otherwise we have 1 object to send
    framework.routeAppsdkMsg(JSON.parse(data));
}

/*
 * Creates and sends fake mmui messages for a context change using the provided data
 * @tparam  String  uiaId
 * @tparam  String  ctxtId
 * @tparam  Object  params
 * @tparam  Number  Optional context sequence number. If not provided the default next number in sequence will be used.
 */
Debug.prototype.fakeCtxtChgMsgs = function(uiaId, ctxtId, params, contextSeq)
{
    var currAppId = framework.getCurrentApp();

    if (!contextSeq)
    {
        contextSeq = this._contextSeqCounter;
        this._contextSeqCounter += 1;
    }

    //formatter:off
    var ctxtChgMsg = JSON.stringify( {"msgType": "ctxtChg", "ctxtId": ctxtId, "uiaId": uiaId, "params": params, "contextSeq": contextSeq} );
    var focusStackMsg = JSON.stringify( {"msgType": "focusStack", "appIdList": [ {"id": uiaId}, {"id": currAppId} ]} );
    //formatter:on
    this.sendMmuiMsg(this._mmuiMsg.transitionTrue, ctxtChgMsg, focusStackMsg, this._mmuiMsg.transitionFalse);
}

/*
 * Creates and sends a fake MMUI message for a data message.
 * @tparam  String  uiaId   The uiaId of the app the data message is intended for
 * @tparam  String  msgId   The msgId of the message event
 * @tparam  Object  params  The parameters of the message to send
 */
Debug.prototype.fakeMsgTypeMsg = function(uiaId, msgId, params)
{
    //The following is a sample data message that mmui could send to twobtn1App:
    //var twobtn1Data = JSON.stringify( {"msgType":"msg", "uiaId":"twobtn1", "msgId":"twobtn1AppText", "params":{"label":[{"label":"App1Button1"}, {"label":"App1Button2"}]}} );
    
    var msgTypeMsg = JSON.stringify( {"msgType": "msg", "uiaId": uiaId, "msgId": msgId, "params": params} );
    this.sendMmuiMsg(msgTypeMsg);
}

/*
 * Creates and sends a fake DBAPI message for a data message.
 * @tparam  String  api         The uiaId of the app the data message is intended for
 * @tparam  String  methodName  The dbapi methodName that will be called
 * @tparam  Object  reqId       The reqId of the message to send
 * @tparam  Object  params      The parameters of the message to send
 */
Debug.prototype.fakeDbapiMethodResponse = function(api, methodName, reqId, params)
{
    //The following is a sample data message that mmui could send to testdbapi app:
    //var twobtn1Data = JSON.stringify( {"msgType":"msg", "uiaId":"twobtn1", "msgId":"twobtn1AppText", "params":{"label":[{"label":"App1Button1"}, {"label":"App1Button2"}]}} );
    log.debug("Debug.prototype.fakeDbapiMethodResponse called");
    
    var methodResponse = JSON.stringify( {"msgType": "methodResponse", "msgContent": {"api": api, "methodName": methodName, "reqId": reqId, "params": params}} );
    this.sendDbapiMsg(methodResponse);
}

/*
 * Creates and sends a fake APPSDK message for a data message.
 * @tparam  String  methodName   The methodName that was called
 * @tparam  String  serviceName  The name of the AppSDK plugin
 * @tparam  String  reqId        The reqId of the method request
 * @tparam  Object  params       The parameters of the message to send
 */
Debug.prototype.fakeAppsdkMethodResponse = function(serviceName, methodName, reqId, params)
{
    log.debug("Debug.prototype.fakeAppsdkMethodResponse called");
    
    var methodResponse = JSON.stringify( {"msgType": "methodResponse", "serviceName": serviceName, "methodName": methodName, "reqId": reqId, "params": params} );
    this.sendAppsdkMsg(methodResponse);
}


/*
 * Sets the callback function that will capture messages sent to the MMUI
 * @tparam  String      uiaId   uiaId of the app the test file is created for (e.g. "system" for "systemAppTest.js")
 * @tparam  Function    method  the function to be called when a gui-to-mui message is intercepted
 */
Debug.prototype.setEvtToMmuiCallback = function(uiaId, method)
{
    this._toMmuiCallbackTable[uiaId] = method;
    this._mmuiCallbackAvail = true;
    
    // automatically display the debug buttons (except for system app, and apps that send messages before InitGui)
    if (uiaId != "system" && uiaId != "syssettings" && uiaId != "vehsettings")
    {
        this.changeDropDownText(uiaId, true);
    }
}

/*
 * Sets the callback function that will capture messages sent to the DBAPI
 * @tparam  String      uiaId   uiaId of the app the test file is created for (e.g. "system" for "systemAppTest.js")
 * @tparam  Function    method  the function to be called when a gui-to-dbapi message is intercepted
 */
Debug.prototype.setReqToDbapiCallback = function(uiaId, method)
{
    this._toDbapiCallbackTable[uiaId] = method;
    this._dbapiCallbackAvail = true;   
}

/*
 * Sets the callback function that will capture messages sent to the APPSDK
 * @tparam  String      uiaId   uiaId of the app the test file is created for (e.g. "system" for "systemAppTest.js")
 * @tparam  Function    method  the function to be called when a gui-to-appsdk message is intercepted
 */
Debug.prototype.setReqToAppsdkCallback = function(uiaId, method)
{
    this._toAppsdkCallbackTable[uiaId] = method;
    this._appsdkCallbackAvail = true;   
}

/*
 * Calls all callback functions in this._toMmuiCallbackTable, giving priority to the app matching uiaId
 * Apps that "use up" the event should return true to avoid multiple fake mmui responses.
 * @tparam  String  uiaId   current app uiaId
 * @tparam  String  eventId Id of event sent to Mmui
 * @tparam  Object  params  parameters of event sent to Mmui
 */
Debug.prototype.triggerEvtToMmuiCallbacks = function(uiaId, eventId, params)
{
    // Use a timeout here to create an asynchronous event, simulating the round-trip to MMUI.
    // The asynchronous event will create a new thread in JavaScript, allowing any code to complete
    // before the MMUI callbacks are made.
    setTimeout(this._evtToMmuiCallbacks.bind(this, uiaId, eventId, params), 0);
}

/*
 * Helper function for triggerEvtToMmuiCallbacks. This is called after the timeout completes
 */
Debug.prototype._evtToMmuiCallbacks = function(uiaId, eventId, params)
{
    var consumed = false;
    
    if (!this._mmuiCallbackAvail)
    {
        return;
    }
    
    if (uiaId == "Common")
    {
        if (eventId == "Global.InitGui")
        {
            //InitGui is unique. No app is available before it is sent
            consumed = this._toMmuiCallbackTable.debug("debug", eventId, params);
            return;
        }
        
        uiaId = framework.getCurrentApp();
        if (!uiaId)
        {
            log.error("Debug cannot retrieve current app instance.");
        }
        log.debug("Common event found. uiaId reset to: ", uiaId);
    }
    
    // consume all Global.GoBack events in debug internally
    if (eventId == "Global.GoBack")
    {
        this.goBackOnFakeGoBackStack();
        consumed = true;
    }
    //Give first priortiy to the app with uiaId matching the gui-to-mmui message
    else if (this._toMmuiCallbackTable[uiaId])
    {
        log.debug("Gui-to-Mmui Event was sent to: " + uiaId);
        consumed = this._toMmuiCallbackTable[uiaId](uiaId, eventId, params);
    }
    
    //Give second priortiy to systemApp (unless systemApp was the matching uiaId)
    if (!consumed && this._toMmuiCallbackTable.system && uiaId != "system")
    {
        log.debug("Gui-to-Mmui Event was sent to: system");
        consumed = this._toMmuiCallbackTable.system(uiaId, eventId, params);
    }
    
    if (consumed)
    {
        return;
    }
    
    //If after that, no app's test file consumed the message, try any other app with a hook function
    for (var key in this._toMmuiCallbackTable)
    {
        if (key == uiaId || key == "system")
        {
            //skip these two uiaIds because they've already been checked.
            continue;
        }
        //get the callback function
        var func = this._toMmuiCallbackTable[key];
        
        log.debug("Gui-to-Mmui Event was sent to: " + key);
        //call the callback, then check if the event was consumed
        consumed = func(uiaId, eventId, params);
        
        if (consumed)
        {
            break;
        }
    }
    
    if (!consumed && eventId == "Global.GoLeft")
    {
        log.warn("No Entry found for Global.GoLeft event in current context: " + framework.getCurrentApp() + " "  + framework._currentContext);
    }
}


/*
 * Calls callback hook for DBAPI for the app specified in uiaId parameter, if exists.
 * @tparam  String  uiaId   current app uiaId
 * @tparam  String  msg   DBAPI msg.
 */
Debug.prototype.triggerReqToDbapiCallback = function(uiaId, msg)
{
    // Use a timeout here to create an asynchronous event, simulating the round-trip to DBAPI.
    // The asynchronous event will create a new thread in JavaScript, allowing any code to complete
    // before the DBAPI callbacks are made.
    setTimeout(this._reqToDbapiCallback.bind(this, uiaId, msg), 0); 
}

/*
 * Helper function for triggerReqToDbapiCallback. This is called after the timeout completes
 */
Debug.prototype._reqToDbapiCallback = function(uiaId, msg)
{
    var consumed = false;
        
    if (!this._dbapiCallbackAvail)
    {
        return;
    }

    // If a callback hook for DBAPI exists for an app, call it 
    if ( typeof this._toDbapiCallbackTable[uiaId] == "function")
    {
        log.debug("Gui-to-Dbapi Event was sent to: " + uiaId + " test file");
        this._toDbapiCallbackTable[uiaId](msg);
    }
}


/*
 * Calls callback hook for APPSDK for the app specified in uiaId parameter, if exists.
 * @tparam  String  uiaId   current app uiaId
 * @tparam  String  msg   APPSDK msg.
 */
Debug.prototype.triggerReqToAppsdkCallback = function(uiaId, msg)
{
    // Use a timeout here to create an asynchronous event, simulating the round-trip to AppSDK.
    // The asynchronous event will create a new thread in JavaScript, allowing any code to complete
    // before the AppSDK callbacks are made.   
    
    setTimeout(this._reqToAppsdkCallback.bind(this, uiaId, msg), 0);
} 

/*
 * Helper function for triggerReqToAppsdkCallback. This is called after the timeout completes
 */
Debug.prototype._reqToAppsdkCallback = function(uiaId, msg)
{
    
    var consumed = false;
    
    if (!this._appsdkCallbackAvail)
    {
        return;
    }

    // If a callback hook for APPSDK exists for an app, call it 
    if ( typeof this._toAppsdkCallbackTable[uiaId] == "function")
    {
        log.debug("Gui-to-Appsdk Event was sent to: " + uiaId + " test file");
        this._toAppsdkCallbackTable[uiaId](msg);
    }      
}


/*
 * Used to add HTML elements to the htmlDiv
 * @param   code    (string) html code that will be appended to the div.
 *
 */
Debug.prototype.appendHTML = function(code)
{
    if(!this._debugOn)
    {
        return;
    }
    //create a "true array" from the arguments object
    var args = Array.prototype.slice.call(arguments);
    var str = args.join();
    this._htmlDiv.innerHTML += str;
}
/*
 * Creates an entry in the dropdown menu for the supplied uiaId, with the supplied html block
 * @tparam  String    uiaId   The uiaId of the app to create test buttons for
 * @tparam  String    htmlBlock   The block of html code to add the the debug window
 * @tparam  String    color   (optional) hex notation to set the color of the app name in the dropdown menu (e.g. #FF0000 for red)
 */
Debug.prototype.createDebugBtns = function(uiaId, htmlBlock, color)
{
    // Store the htmlBlock and onDisplayed callback function
    this._debugPanels[uiaId] = htmlBlock;
    
    // create a new entry in the drop-down box
    var newEntry;
    if (color)
    {
        newEntry = "<option style=\"color:" + color + "\" value=\"" + uiaId + "\">" + uiaId + "</option>";
    }
    else
    {
        newEntry = "<option value=\"" + uiaId + "\">" + uiaId + "</option>";
    }
    this._dropDown.innerHTML += newEntry;
}

/*
 * Appends a new element to the htmlDiv. If sticky is set to true, appends it to the debugDiv instead, making sure it
 * will not be cleared by any other html code.
 * @param   div     (node)  the html element to append
 * @param   sticky  (boolean)   if true, adds the div to the html element to the debugDiv so that it 'sticks around' even
 * after calling clearHTML();
 */
Debug.prototype.appendChild = function(div, sticky)
{
    if (!this._debugOn)
    {
        return;
    }
    if (sticky)
    {
        this._debugDiv.appendChild(div);
    }
    else
    {
        this._htmlDiv.appendChild(div);
    }
}
/*
 * Used to display Debug messages
 * The message can be in the format "my " + var + " message"; -OR- format "my", var, "message"; The latter will add
 * spaces automatically.
 * @param   msg     (string) Message to send to the console.
 * @param   ...     (string) This function will accept multiple arguments and join each one onto the message.
 */
Debug.prototype.logDebug = function(msg)
{
    if(!this._debugOn)
    {
        return;
    }
    var autoScroll = false;
    //create a "true array" from the arguments object
    var args = Array.prototype.slice.call(arguments);
    var str = "> " + args.join(' ') + "<br />";

    // only auto-scroll if already at the bottom
    if (this._logDiv.scrollTop >= (this._logDiv.scrollHeight - this._logDiv.offsetHeight + 19))
    {
        autoScroll = true;
    }
    
    this._logDiv.innerHTML += str;
    
    if (autoScroll)
    {
        this._logDiv.scrollTop = (this._logDiv.scrollHeight - this._logDiv.offsetHeight + 19); // 19 is a fudge-factor for borders/margins
    }
}

/*
 * Clears the htmlDiv.
 */
Debug.prototype.clearHTML = function()
{
    if (!this._debugOn)
    {
        return;
    }
    this._htmlDiv.innerHTML = "";
}

/*
 * Clears the logDiv.
 */
Debug.prototype.clearLog = function()
{
    if (!this._debugOn)
    {
        return;
    }
    this._logDiv.innerHTML = "";
}

/*
 * Redefines console functions so that they do not trigger anything in code.
 * Error messages will still show.
 */
Debug.prototype.disableDragonfly = function()
{
    console.log = function(){};
    console.warn = function(){};
    console.info = function(){};
}
