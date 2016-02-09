/*
 Copyright 2011 by Johnson Controls
 __________________________________________________________________________

 Filename: websocket.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: agohsmbr
 Date: 10.11.2011
 __________________________________________________________________________

 Description:

 Revisions:
 v0.2 30-May-2012 - Encapsulated Websockets into a JS object -awoodhc
 v0.3 (10-Oct-2012) Increased Websocket retry period to 50ms
 v0.4 (23-Oct-2012) Added brief timeout before attempting to reopen a Websocket that closed or failed to open -awoodhc
 v0.5 (15-Nov-2012) Updated for AppSDK support - aganesar
 __________________________________________________________________________

 */

log.addSrcFile("Websockets.js", "framework");

function Websockets()
{
    this._socketsIntervalId = null;
    
    this._fwkMmuiCallbackSent = false;   // (Boolean) true if framework was already notified that this socket is open
    this._fwkAppSdkCallbackSent = false; // (Boolean) true if framework was already notified that this socket is open
    this._fwkDbApiCallbackSent = false;  // (Boolean) true if framework was already notified that this socket is open
    
    //If after a few tries, we have no connection, we must be testing offline
    this._retries = 0;
    this._errorLimit = 0;
    this._mmuiCloseRetries = 0;
    this._appSdkCloseRetries = 0;
    this._dbapiCloseRetries = 0;
    this._retryLimit = 100;
    this._offline = false;

    // (Boolean) False by default, True only after GuiFramework sends Global.InitGui.
    this._hasInitGui = false;

    // (Array) Non-startup related messages queued while this._hasInitGui is false.
    this._preInitGuiMsgQueue = [];

    // Define websocket objects

    // Set WebSocket IP address based on the GUI Config file Settings (gui/common/js/GuiConfig.js)
    this._appSocket = guiConfig.appsdkSocket;
    this._mmuiSocket = guiConfig.mmuiSocket;
    this._dbapiSocket = guiConfig.dbapiSocket;
    
    this._mmuiWs = null;
    this._appWs = null;
    this._dbapiWs = null;
    
    // Instantiate WebSockets
    log.debug("Websockets debugMode is: " + framework.debugMode);
    if (framework.debugMode == false)
    {
        this._openMmui();
        this._openAppSdk();
        this._openDbapi();
        this._socketsIntervalId = setInterval(this._checkSockets.bind(this), 500);
    }
    else
    { 
        // if debugMode == true, we can skip trying to load the websockets.
        // this should also fix the target error (having to use unknown IP's)
        // setTimeout makes sure systemAppTest.js is loaded before initGui
        setTimeout(function()
        {
            log.warn("Websockets not available in debug mode. Now testing offline.");
            this._offline = true;
            
            framework.mmuiConnected(false);
            this._fwkMmuiCallbackSent = true;
            
            framework.appSdkConnected(false);
            this._fwkAppSdkCallbackSent = true;
            
            framework.dbApiConnected(false);
            this._fwkDbApiCallbackSent = true;

        }.bind(this), 1000);        
    }
}


Websockets.prototype._checkSockets = function()
{
    //check for gate-racing errors
    if (!this._mmuiWs)
    {
        this._errorLimit++;
        if (this._errorLimit > 50)
        {
            log.error("Unable to create MMUI WebSocket. Make sure the browser has WebSockets enabled. Or possibly another error has occurred. Check the console.");
            clearInterval(this._socketsIntervalId);
            return;
        }
        this._openMmui();
    }
    if (!this._appWs)
    {
        this._errorLimit++;
        if (this._errorLimit > 50)
        {
            log.error("Unable to create AppSDK WebSocket. Make sure the browser has WebSockets enabled. Or possibly another error has occurred. Check the console.");
            clearInterval(this._socketsIntervalId);
            return;
        }
        this._openAppSdk();
    }
    if (!this._dbapiWs)
    {
        this._errorLimit++;
        if (this._errorLimit > 50)
        {
            log.error("Unable to create DBAPI WebSocket. Make sure the browser has WebSockets enabled. Or possibly another error has occurred. Check the console.");
            clearInterval(this._socketsIntervalId);
            return;
        }
        this._openDbapi();
    }    
    
    //check if the websockets are ready
    log.debug("this._mmuiWs.readyState: " + this._mmuiWs.readyState + "; this._appWs.readyState: " + this._appWs.readyState + "; this._dbapiWs.readyState: " + this._dbapiWs.readyState);
    
    if (this._mmuiWs.readyState == 1 && !this._fwkMmuiCallbackSent)
    {
        framework.mmuiConnected(true);
        this._fwkMmuiCallbackSent = true;
    }
    if (this._appWs.readyState == 1 && !this._fwkAppSdkCallbackSent)
    {
        framework.appSdkConnected(true);
        this._fwkAppSdkCallbackSent = true;
    }
    if (this._dbapiWs.readyState == 1 && !this._fwkDbApiCallbackSent)
    {
        framework.dbApiConnected(true);
        this._fwkDbApiCallbackSent = true;
    }    
    
    
    if (this._fwkMmuiCallbackSent && this._fwkAppSdkCallbackSent && this._fwkDbApiCallbackSent)
    {
        // All sockets are open. Framework will initialize
        clearInterval(this._socketsIntervalId);
    }
    
    this._retries++;
    if (this._retries >= this._retryLimit)
    {
        log.warn("Websockets retry limit reached. Now testing offline.");
        this._offline = true;
        
        framework.mmuiConnected(false);
        this._fwkMmuiCallbackSent = true;
        
        framework.appSdkConnected(false);
        this._fwkAppSdkCallbackSent = true;
        
        framework.dbApiConnected(false);
        this._fwkDbApiCallbackSent = true;        
        
        clearInterval(this._socketsIntervalId);
    }
}

Websockets.prototype._openMmui = function()
{
    log.debug("Websockets._openMmui called.");
    this._mmuiWs = new WebSocket(this._mmuiSocket.uri, this._mmuiSocket.protocol);

    this._mmuiWs.onopen = function()
    {
        log.info("MMUI websocket open");
    }

    this._mmuiWs.onmessage = function(e)
    {
        var jsObject = null;
        try
        {
            jsObject = JSON.parse(e.data);
        }
        catch (err)
        {
            log.error("Unable to parse incoming MMUI message: '" + e.data + "'");
            return;
        }

        if (this._hasInitGui)
        {
            log.debug("MMUI message received: " + e.data);
            framework.routeMmuiMsg(jsObject);
        }
        else
        {
            // Prior to Global.InitGui we only process startup-related messages and queue the rest for later.
            if (jsObject.msgType === "msg" && jsObject.uiaId === "syssettings")
            {
                log.debug("MMUI message received: " + e.data);
                framework.routeMmuiMsg(jsObject);
            }
            else
            {
                log.debug("MMUI message queued: " + e.data);
                this._preInitGuiMsgQueue.push(jsObject);
            }
        }
    }.bind(this);

    this._mmuiWs.onerror = function(e)
    {
        if (this._fwkMmuiCallbackSent)
        {
            log.error("MMUI websocket error: " + e.error);
        }
        else
        {
            log.info("Waiting for MMUI websocket to be ready ...");
        }
    }

    this._mmuiWs.onclose = function(e)
    {
        if (this._fwkMmuiCallbackSent)
        {
            log.warn("MMUI websocket closed or could not be opened.");
            log.warn("   e.wasClean: " + e.wasClean);
            log.warn("   e.reason: " + e.reason);
            log.warn("   e.code: " + e.code);

            // Only restart after socket has successfully been connected and now closed unexpectedly.
            framework._showFatalErrorWink("Websocket Closed Error", "Search for 'websocket' in the log for more details.");
            framework._restartCMU("MMUI websocket crash");
        }

        if (!this._offline)
        {
            //Try to reconnect after a brief time
            setTimeout(function()
            {
                this._mmuiWs = null;
                this._openMmui();
                this._mmuiCloseRetries++;
                if (this._mmuiCloseRetries >= this._retryLimit)
                {
                    log.warn("Websockets retry limit reached. Now in offline mode.");
                    this._offline = true;
                }
            }.bind(this), 500);
            
        }
    }.bind(this);
}

// Called by GuiFramework when it issues Global.InitGui. This function flushes the queue and 
// will cause websockets to stop queueing non-startup related messages.
Websockets.prototype.initGui = function()
{
    log.info("Websockets.initGui now flushing queue with " + this._preInitGuiMsgQueue.length + " non-startup messages.");;
    if (!this._hasInitGui)
    {
        // Flush the queued messages to framework.
        this._hasInitGui = true;
        for (var i = 0; i < this._preInitGuiMsgQueue.length; ++i)
        {
            log.debug("websockets queued message " + i + ": " + this._preInitGuiMsgQueue[i]);
            framework.routeMmuiMsg(this._preInitGuiMsgQueue[i]);
        }
        this._preInitGuiMsgQueue = [];
    }
}

Websockets.prototype._openAppSdk = function()
{
    log.debug("Websockets._openAppSdk called.");
    this._appWs = new WebSocket(this._appSocket.uri, this._appSocket.protocol);

    this._appWs.onopen = function()
    {
        log.info("APPSDK websocket open");
    }

    this._appWs.onmessage = function(e)
    {
        var jsObject = null;
        try
        {
            jsObject = JSON.parse(e.data);
        }
        catch (err)
        {
            log.error("Unable to parse incoming APPSDK message: '" + e.data + "'");
            return;
        }

        log.debug("APPSDK message received: " + e.data);               
        framework.routeAppsdkMsg(jsObject);
    }

    this._appWs.onerror = function(e)
    {
        if (this._fwkAppSdkCallbackSent)
        {
            log.error("APPSDK websocket error: " + e.error);
        }
        else
        {
            log.info("Waiting for APPSDK websocket to be ready ...");
        }
    }

    this._appWs.onclose = function(e)
    {
        if (this._fwkAppSdkCallbackSent)
        {   
            log.warn("APPSDK websocket closed or could not be opened.");
            log.warn("   e.wasClean: " + e.wasClean);
            log.warn("   e.reason: " + e.reason);
            log.warn("   e.code: " + e.code);

            // Only restart after socket has successfully been connected and now closed unexpectedly.
            framework._showFatalErrorWink("Websocket Closed Error", "Search for 'websocket' in the log for more details.");
            framework._restartCMU("APPSDK websocket crash");
        }
        if (!this._offline)
        {
            //Try to reconnect after a brief time
            setTimeout(function() {
                this._appWs = null;
                this._openAppSdk();
                this._appSdkCloseRetries++;
                if (this._appSdkCloseRetries >= this._retryLimit)
                {
                    log.warn("Websockets retry limit reached. Now in offline mode.");
                    this._offline = true;
                }
            }.bind(this), 500);
        }
    }.bind(this);
}

Websockets.prototype._openDbapi = function()
{
    log.debug("Websockets._openDbapi called.");
    this._dbapiWs = new WebSocket(this._dbapiSocket.uri, this._dbapiSocket.protocol);

    this._dbapiWs.onopen = function()
    {
        log.info("DBAPI websocket open");
    }

    this._dbapiWs.onmessage = function(e)
    {
        var jsObject = null;
        try
        {
            jsObject = JSON.parse(e.data);
        }
        catch (err)
        {
            log.error("Unable to parse incoming DBAPI message: '" + e.data + "'");
            return;
        }

        log.debug("DBAPI message received: " + e.data);
        framework.routeDbapiMsg(jsObject);
    }

    this._dbapiWs.onerror = function(e)
    {
        if (this._fwkDbApiCallbackSent)
        {
            log.error("DBAPI websocket error: " + e.error);
        }
        else
        {
            log.info("Waiting for DBAPI websocket to be ready ...");
        }
    }

    this._dbapiWs.onclose = function(e)
    {
        if (this._fwkDbApiCallbackSent)
        {
            log.warn("DBAPI webscoket closed or could not be opened.");
            log.warn("   e.wasClean: " + e.wasClean);
            log.warn("   e.reason: " + e.reason);
            log.warn("   e.code: " + e.code);

            // Only restart after socket has successfully been connected and now closed unexpectedly.
            framework._showFatalErrorWink("Websocket Closed Error", "Search for 'websocket' in the log for more details.");
            framework._restartCMU("DBAPI websocket crash");
        }

        if (!this._offline)
        {
            //Try to reconnect after a brief time
            setTimeout(function() {
                this._dbapiWs = null;
                this._openDbapi();
                this._dbapiCloseRetries++;
                if (this._dbapiCloseRetries >= this._retryLimit)
                {
                    log.warn("Websockets retry limit reached. Now in offline mode.");
                    this._offline = true;
                }
            }.bind(this), 500);
        }
    }.bind(this);
}



Websockets.prototype.sendAppsdkMsg = function(uiaId, requestId, serviceName, methodName, params)
{
    if(params == undefined || params == null)
    {
        params = "{}";
    }
    
    //@formatter:off
    var msg = {
        "msgType" : "method",
        "serviceName": serviceName,
        "methodName": methodName,   
        "reqId": requestId,       
        "params": params     
     };

    //@formatter:on
    // create a string version of the object
    var jsonString = JSON.stringify(msg);
    // log this message in the debugger
    framework.debug.logDebug("<font color=#003388>To AppSDK:", jsonString, "</font>");

    log.debug("Sending APPSDK message: " + jsonString);    
    
    if(this._appWs && this._appWs.readyState == 1)
    {
        this._appWs.send(jsonString);
    }
    else
    {
        if (!framework.debugMode)
        {
            log.error("Failed to send APPSDK message because websocket is closed: " + jsonString);
        }
    }
    
    // let debug know about the message    
    framework.debug.triggerReqToAppsdkCallback(uiaId, msg);
}

Websockets.prototype.sendDbapiMsg = function(uiaId, requestId, api, methodName, params)
{
    if(params == undefined || params == null)
    {
        params = "{}";
    }  

    //@formatter:off
    var msg = {
        "msgType" : "method",
        "msgContent": 
            { 
                "api": api,
                "methodName": methodName,   
                "reqId": requestId,           
                "params": params
            }
     };
    //@formatter:on
    //create a string version of the object
    var jsonString = JSON.stringify(msg);
    //log this message in the debugger
    framework.debug.logDebug("<font color=#003388>To Dbapi:", jsonString, "</font>");

    log.debug("Sending DBAPI message: " + jsonString);
    
    if(this._dbapiWs && this._dbapiWs.readyState == 1)
    {
        this._dbapiWs.send(jsonString);
    }
    else
    {
        if (!framework.debugMode)
        {
            log.error("Failed to send DBAPI message because websocket is closed: " + jsonString);
        }
    }

    //let debug know about the message    
    framework.debug.triggerReqToDbapiCallback(uiaId, msg);
}


Websockets.prototype.sendEventMsg = function(uiaId, eventId, params, fromVui, currentUiaId, currentContextId)
{   
    if (params == undefined || params == null)
    {
        params = "{}";
    }

    if (fromVui == undefined || fromVui == null)
    {
        fromVui = false;
    }

    if (currentUiaId == undefined || currentUiaId == null)
    {
        currentUiaId = "";
    }

    if (currentContextId == undefined || currentContextId == null)
    {
        currentContextId = "";
    }
    
    //@formatter:off
    var msg = {
        "msgType" : "event",
        "eventId" : eventId,
        "uiaId" : uiaId,
        "params" : params,
        "fromVui" : fromVui, 
        "currentUiaId" : currentUiaId,
        "currentContextId" : currentContextId
    };
    //@formatter:on

    //create a string version of the object
    var jsonString = JSON.stringify(msg);
    //log this message in the debugger
    framework.debug.logDebug("<font color=#003388>To Mmui:", jsonString, "</font>");

    log.debug("Sending MMUI message: " + jsonString);

    // Events only go from GUI to MMUI
    if(this._mmuiWs && this._mmuiWs.readyState == 1)
    {    
        this._mmuiWs.send(jsonString);
    }
    else
    {
        if (!framework.debugMode)
        {
            log.error("Failed to send MMUI message because websocket is closed: " + jsonString);
        }
    }
}

/*
 * (internal) Called by Common when an Alert completes.
 */
Websockets.prototype.sendAlertCompleteMsg = function(uiaId, alertId, params)
{   
    if (params == undefined || params == null)
    {
        params = "{}";
    }

    //@formatter:off
    var msg = {
        "msgType" : "alertComplete",
        "alertId" : alertId,
        "uiaId" : uiaId,
        "params" : params
    };
    //@formatter:on
    //create a string version of the object
    var jsonString = JSON.stringify(msg);
    //log this message in the debugger
    framework.debug.logDebug("<font color=#003388>To Mmui:", jsonString, "</font>");

    log.debug("Sending MMUI message: " + jsonString);

    // Events only go from GUI to MMUI
    if(this._mmuiWs && this._mmuiWs.readyState == 1)
    {
        this._mmuiWs.send(jsonString);
    }
    else
    {
        if (!framework.debugMode)
        {
            log.error("Failed to send MMUI message because websocket is closed: " + jsonString);
        }
    }
}
