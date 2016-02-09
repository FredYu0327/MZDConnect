/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: mobile911App.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: ayonchn
 Date: 08.31.2012
 __________________________________________________________________________

 Description: IHU GUI Emergency Call app

 Revisions:
 v0.1 - (31-August-2012) - initial version - ayonchn
 v0.2 - (23-August-2013) - Dictionaries updated for all languages
 v0.3 - (13-Jun-2014) - GUI_MOBILE911: MY15 Graphic Asset Update and Clean Up
  ______________________________ ____________________________________________

 */

log.addSrcFile("mobile911App.js", "mobile911");

function mobile911App(uiaId)
{

    log.debug("constructor called...");

    // Base application functionality is provided in a common location via this call to baseApp.init().
    // See framework/js/BaseApp.js for details.
    baseApp.init(this, uiaId);

    // All feature-specific initialization is done in appInit()
}

/**************************
 * Standard App Functions *
 **************************/

/*
 * Called just after the app is instantiated by framework.
 */
mobile911App.prototype.appInit = function()
{
    log.debug(" mobile911 appInit  called...");

    if (framework.debugMode)
    {
        framework.debugMode = true;
        utility.loadScript("apps/mobile911/test/mobile911AppTest.js");
    }

    // cache
    this._cachePSAPInfo = "Show";
    this._timeout = null;
    this._interval = null;
    this._secondsCounter = 0;
    this._imagePath = "./common/images/icons/IcnContactImage911.png";

    // Default config
    // TODO: Set the correct images or atleast images with labels!

    this._callConnectingButtonConfig = new Object();

    this._callConnectingButtonConfig["HangUp"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpHangup",
        disabled : false,
        appData : "HangUp",
    };

    this._callConnectingButtonConfig["Barge"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpBargeIn",
        disabled : true,
        appData : "Barge",
    };

    this._callConnectingButtonConfig["Transfer"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpPhoneRoute_Handset",
        disabled : null,
        appData : "Transfer",
    };

    this._callConnectedButtonConfig = new Object();

    this._callConnectedButtonConfig["HangUp"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpHangup",
        disabled : false,
        appData : "HangUp",
    };

    this._callConnectedButtonConfig["Barge"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpBargeIn",
        disabled : false,
        appData : "Barge",
    };

    this._callConnectedButtonConfig["Transfer"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpPhoneRoute_Handset",
        disabled : null,
        appData : "Transfer",
    };

    this._callOnMobileDeviceButtonConfig = new Object();

    this._callOnMobileDeviceButtonConfig["HangUp"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpHangup",
        disabled : false,
        appData : "HangUp",
    };

    this._callOnMobileDeviceButtonConfig["Transfer"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpPhoneRoute_Vehicle",
        disabled : null,
        appData : "Transfer",
    };

    //@formatter:off
    this._contextTable = {
        "CollisionDetectedDialog" : {
            "sbNameId": this.uiaId,
            "sbNameIcon": "IcnSbnComm.png",
            "hideHomeBtn": true,
            "template" : "Dialog3Tmplt",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "titleStyle" : "titleStyle01",
                    "titleId": "CollisionDetected",
                    contentStyle : "style02",
                    buttonCount : 1,
                    buttonConfig : {
                        button1 : {
                            labelId : "CancelCall",
                            appData : "HangUp",
                            selectCallback :  this._dialogCtrlClickCallback.bind(this)
                        }
                    },
                    text1Id: 'PlaceCall',
                    text1SubMap: {counter: '10'}
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "readyFunction" : null,
            "contextInFunction": this._CollisionDetectedInFunction.bind(this),
            "contextOutFunction" : this._CollisionDetectedOutFunction.bind(this),
            "displayedFunction": null
        }, // end of "CollisionDetectedDialog"

        "Active911CallConnecting" : {
            "sbNameId": this.uiaId,
            "sbNameIcon": "IcnSbnComm.png",
            "hideHomeBtn": true,
            "template" : "InCall2Tmplt",
            "controlProperties": {
                "InCall2Ctrl" : {
                    "ctrlStyle" : "Mobile911",
                    "ctrlTitleId" : "Connecting",
                    "mobile911Details" : {
                        "serviceName" : "911",
                        "iconPath" : "common/images/icons/IcnListPhone_En.png",
                        "imagePath" : "common/images/icons/IcnContactImage911.png",
                        "showElapsed" : true,
                    },
                    "umpConfig": {
                            "buttonConfig" : {
                            "HangUp": this._callConnectingButtonConfig["HangUp"],
                            "Barge": this._callConnectingButtonConfig["Barge"],
                            "Transfer": this._callConnectingButtonConfig["Transfer"],
                        },
                        "defaultSelectCallback" : this._umpDefaultSelectCallback.bind(this),
                        "hasScrubber": false,
                        "initialButtonFocus": "HangUp",
                        "umpStyle": "fullWidth"
                    },
                }, // end of properties for "InCallCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._Active911CallConnectingCtxtReady.bind(this),
            "displayedFunction" : null,
        },

        "Active911CallConnected" :{
            "sbNameId": this.uiaId,
            "sbNameIcon": "IcnSbnComm.png",
            "hideHomeBtn": true,
            "template" : "InCall2Tmplt",
            "controlProperties": {
                "InCall2Ctrl" : {
                    "ctrlStyle" : "Mobile911",
                    "ctrlTitleId" : "Connected",
                    "mobile911Details" : {
                        "serviceName" : "911",
                        messageTextId: "ProvidesInformation",
                        "iconPath" : "common/images/icons/IcnListPhone_En.png",
                        "imagePath" : "common/images/icons/IcnContactImage911.png",
                        "showElapsed" : true,
                    },
                    "umpConfig": {
                        "buttonConfig" : {
                            "HangUp": this._callConnectedButtonConfig["HangUp"],
                            "Barge": this._callConnectedButtonConfig["Barge"],
                            "Transfer" : this._callConnectedButtonConfig["Transfer"],
                        },
                        "defaultSelectCallback" : this._umpDefaultSelectCallback.bind(this),
                        "umpStyle" : "fullWidth",
                        "initialButtonFocus": "HangUp",
                        "hasScrubber" : false,
                    },
                }, // end of properties for "InCallCtrl"
            }, // end of list of controlProperties
            "contextOutFunction" : this._Active911CallConnectedCtxtOut.bind(this),
            "displayedFunction": this._Active911CallConnectedCtxtTmpltDisplayed.bind(this),
            "readyFunction": this._Active911CallConnectedCtxtTmpltReadyToDisplay.bind(this),
        }, // end of "InCallActiveCall911Connected"

        "CallOnMobileDevice" : {
            "sbNameId": this.uiaId,
            "sbNameIcon": "IcnSbnComm.png",
            "hideHomeBtn": true,
            "template" : "InCall2Tmplt",
            "controlProperties": {
                "InCall2Ctrl" : {
                    "ctrlStyle" : "Mobile911",
                    "ctrlTitleId" : "CallOnHandset",
                    "mobile911Details" : {
                        "imagePath" : "common/images/icons/IcnContactImage911.png",
                        "showElapsed" : false,
                    },
                    "umpConfig": {
                        "buttonConfig" : {
                            "HangUp": this._callOnMobileDeviceButtonConfig["HangUp"],
                            "Transfer": this._callOnMobileDeviceButtonConfig["Transfer"],
                        },
                        "defaultSelectCallback" : this._umpDefaultSelectCallback.bind(this),
                        "umpStyle" : "fullWidth",
                        "initialButtonFocus": "HangUp",
                        "hasScrubber" : false,
                    },
                }, // end of properties for "InCallCtrl"
            }, // end of list of controlProperties
            "displayedFunction": this._CallOnMobileDeviceCtxtTmpltDisplayed.bind(this),
            "readyFunction": this._CallOnMobileDeviceReady.bind(this)
        }, // end of "CallOnMobileDevice"

        "SearchingFor911Phone" : {
            sbNameId : this.uiaId,
            "sbNameIcon": "IcnSbnComm.png",
            "hideHomeBtn": true,
            "template" : "Dialog3Tmplt",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "contentStyle" : "style03",
                    "fullScreen" : false,
                    "titleStyle" : "titleStyle01",
                    "titleId" : "CollisionDetected",
                    buttonCount : 1,
                    buttonConfig : {
                        button1 : {
                            labelId : "common.Cancel",
                            appData : "Global.Cancel",
                            selectCallback :  this._dialogCtrlClickCallback.bind(this)
                        }
                    },
                    text1Id : "SearchingDevice",
                    "meter" : {"meterType":"indeterminate", "meterPath":"common/images/IndeterminateMeter.png"}
                } // end of properties for "Style03aDialog"
            }, // end of list of controlProperties
        }, // EOF SearchingFor911Phone

        "PhoneNotFound" : {
            "sbNameId": this.uiaId,
            "sbNameIcon": "IcnSbnComm.png",
            "hideHomeBtn": true,
            "template" : "Dialog3Tmplt",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    contentStyle : "style02",
                    "titleStyle" : "titleStyle01",
                    "titleId" : "CollisionDetected",
                    buttonCount : 1,
                    buttonConfig : {
                        button1 : {
                            labelId : "common.Ok",
                            appData : "HangUp",
                            selectCallback :  this._dialogCtrlClickCallback.bind(this)
                        }
                    },
                    text1Id: 'NoDevice'
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
        }, // end of "PhoneNotFound"
        "NoConnectionUsePhoneAlert" : {
            "sbNameId": this.uiaId,
            "sbNameIcon": "IcnSbnComm.png",
            "hideHomeBtn": true,
            "template" : "Dialog3Tmplt",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    contentStyle : "style02",
                    "titleStyle" : "titleStyle01",
                    "titleId" : "EndingEmergency",
                    buttonCount : 2,
                    initialFocus: 1,
                    buttonConfig : {
                        button1 : {
                            labelId : "Back",
                            appData : "HangUp",
                            selectCallback :  this._dialogCtrlClickCallback.bind(this)
                        },
                        button2 : {
                            labelId : "Retry",
                            appData : "Retry",
                            selectCallback :  this._dialogCtrlClickCallback.bind(this)
                        }
                    },
                    text1Id: 'AttemptsTimout',
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
        }, // end of "NoConnectionUsePhoneAlert"
        "NoConnectionRetryingAlert" : {
            "sbNameId": this.uiaId,
            "sbNameIcon": "IcnSbnComm.png",
            "hideHomeBtn": true,
            "template" : "Dialog3Tmplt",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    contentStyle : "style02",
                    "titleStyle" : "titleStyle01",
                    "titleId" : "CollisionDetected",
                    text1Id: 'CouldNotConnect',
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
        }, // end of "NoConnectionRetryingAlert"

    }; // end of this._contextTable
    //@formatter:on


    //@formatter:off
    this._messageTable = {
        "TimeIn" : this._timeInMessageHandler.bind(this),
        "StartElapsedTimeCount" : this._startElapsedTimeCountMsgHandler.bind(this),
        "ShowPSAPInfoInscription": this._ShowPSAPInfoInscriptionMsgHandler.bind(this),
        "EndElapsedTimeCount": this._EndElapsedTimeCountMsgHandler.bind(this),
    }; // end of this._messageTable
    //@formatter:on

}

/**************************
 * Context handlers
 **************************/
mobile911App.prototype._Active911CallConnectingCtxtReady = function ()
{
    this._callConnectedButtonConfig["Barge"].disabled = false;
    this._currentContextTemplate.inCall2Ctrl.setMobile911ElapsedTime(0);
}

mobile911App.prototype._CollisionDetectedInFunction = function ()
{
    this._stopTimeout();
    this._stopInterval();
    this._secondsCounter = 0;
}

mobile911App.prototype._CollisionDetectedOutFunction = function()
{
    this._stopTimeout();
    this._stopInterval();
    this._secondsCounter = 0;
    this._contextTable["CollisionDetectedDialog"].controlProperties.Dialog3Ctrl.text1SubMap = {counter: '10'};
}

mobile911App.prototype._Active911CallConnectedCtxtTmpltReadyToDisplay = function ()
{
    this._currentContextTemplate.inCall2Ctrl.setMobile911ElapsedTime(this._secondsCounter);
    this._populateCallConnected(this._cachePSAPInfo);
}

mobile911App.prototype._Active911CallConnectedCtxtTmpltDisplayed = function()
{
    log.debug("mobile911App _Active911CallConnectedCtxtTmpltDisplayed called...");
}

mobile911App.prototype._Active911CallConnectedCtxtOut = function()
{
    // this._stopInterval();
}

mobile911App.prototype._CallOnMobileDeviceCtxtTmpltDisplayed = function ()
{
    this._callConnectedButtonConfig["Barge"].disabled = true;
}

mobile911App.prototype._CallOnMobileDeviceReady = function ()
{
    this._currentContextTemplate.inCall2Ctrl.setInCallOnHandset(true);
}

/**************************
 * Message handlers
 **************************/

mobile911App.prototype._timeInMessageHandler = function(msg)
{
    if (this._currentContext && this._currentContext.ctxtId == 'CollisionDetectedDialog')
    {
        this._secondsCounter = parseInt(msg.params.payload.Duration);
        var text1Id = this._contextTable.CollisionDetectedDialog.controlProperties.Dialog3Ctrl.text1Id;
        var submap = {counter: this._secondsCounter};
        if (this._currentContextTemplate)
        {
            this._currentContextTemplate.dialog3Ctrl.setText1Id(text1Id, submap);
        }
        else
        {
            this._contextTable["CollisionDetectedDialog"].controlProperties.Dialog3Ctrl.text1SubMap = submap;
        }
        this._startInterval(1000, this._callingCountdown);
    }
}

mobile911App.prototype._startElapsedTimeCountMsgHandler = function (msg)
{
    if (this._secondsCounter != 0)
    {
        this._stopInterval();
    }

    this._secondsCounter = 0;
    this._startInterval(1000, this._conversationSecondsCounter);
}

mobile911App.prototype._ShowPSAPInfoInscriptionMsgHandler = function (msg)
{
    this._cachePSAPInfo = msg.params.payload.showPSAPInfo;
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "Active911CallConnected")
    {
        this._populateCallConnected(this._cachePSAPInfo);
    }
}

mobile911App.prototype._EndElapsedTimeCountMsgHandler = function (msg)
{
    this._stopInterval();
    this._stopTimeout();
}

/**************************
 * Control callbacks
 **************************/

// Dialog Control
mobile911App.prototype._dialogCtrlClickCallback = function(dialogBtnCtrlObj, appData, extraParams)
{
    log.debug("mobile911 _dialogCtrlClickCallback called...");
    log.debug("   for context" + this._currentContext.ctxtId);
    log.debug("   btnData: "+ appData);

    switch(this._currentContext.ctxtId)
    {
        case "CollisionDetectedDialog" :
            switch(appData)
            {
                case 'HangUp':
                    this._stopTimeout();
                    this._stopInterval();
                    this._secondsCounter = 0;
                    framework.sendEventToMmui(this.uiaId, "HangUp");
                    break;
            }
            break;
        case "PhoneNotFound" :
            switch(appData)
            {
                case 'HangUp':
                    framework.sendEventToMmui(this.uiaId, "HangUp");
                    break;
            }
            break;
        case "NoConnectionUsePhoneAlert" :
            switch(appData)
            {
                case 'HangUp':
                    this._stopInterval();
                    this._secondsCounter = 0;
                    // framework.sendEventToMmui(this.uiaId, "HangUp");
                    framework.sendEventToMmui("common", "Global.GoBack");
                    break;
                case "Retry" :
                    framework.sendEventToMmui(this.uiaId, "SelectRetry");
                    break;
            }
            break;
        case "SearchingFor911Phone" :
            switch(appData)
            {
                case 'Global.Cancel':
                    // framework.sendEventToMmui(this.uiaId, "HangUp");
                    framework.sendEventToMmui("common", "Global.Cancel");
                    break;
            }
            break;
        default:
            log.warn("mobile911App: Unknown context", this._currentContext.ctxtId);
            break;
    }
}
// EOF: Dialog Control

// Now Playing Control callback
mobile911App.prototype._umpDefaultSelectCallback = function(umpCtrlObj, appData, params)
{
    log.debug("mobile911 _umpDefaultSelectCallback called...");
    log.debug("   for context" + this._currentContext.ctxtId);
    log.debug("   btnData: "+ appData);

    switch(this._currentContext.ctxtId)
    {
        case "Active911CallConnecting" :
            switch(appData)
            {
                case 'HangUp':
                    framework.sendEventToMmui(this.uiaId, "HangUp");
                    break;
                case 'Transfer':
                    framework.sendEventToMmui(this.uiaId, "TransferToHandset");
                    break;
            }
            break;
        case "Active911CallConnected" :
            switch(appData)
            {
                case 'HangUp':
                    this._stopInterval();
                    this._secondsCounter = 0;
                    framework.sendEventToMmui(this.uiaId, "HangUp");
                    break;
                case 'Barge' :
                    framework.sendEventToMmui(this.uiaId, "BargeIntoCall");
                    this._callConnectedButtonConfig["Barge"].disabled = true;
                    this._currentContextTemplate.inCall2Ctrl.umpCtrl.setButtonDisabled("Barge", true);
                    break;
                case 'Transfer' :
                        framework.sendEventToMmui(this.uiaId, "TransferToHandset");
                    break;
            }
            break;
        case "CallOnMobileDevice":
            switch(appData)
            {
                case "HangUp":
                    this._stopInterval();
                    this._secondsCounter = 0;
                    framework.sendEventToMmui(this.uiaId, "HangUp");
                    break;
                case "Transfer":
                    framework.sendEventToMmui(this.uiaId, "TransferFromHandset");
                    break;
            }
            break;
        default:
            log.warn("mobile911App: Unknown context", this._currentContext.ctxtId);
            break;
    }
}
// EOF: Now Playing Control


/**************************
 * Helper functions
 **************************/
mobile911App.prototype._populateCallConnected = function (status)
{
    if (status == "Show")
    {
        this._currentContextTemplate.inCall2Ctrl.setMobile911Config({serviceName: "911", messageTextId: "ProvidesInformation"});
    }
    else
    {
        this._currentContextTemplate.inCall2Ctrl.setMobile911Config({serviceName: "911", messageText: ""});
    }
    this._cachePSAPInfo = null;
}

mobile911App.prototype._startTimeout = function(time, callback, params)
{
    if(typeof callback == "function" && time != null && time != undefined && (this._timeout == null || this._timeout == undefined))
    {
        this._timeout = setTimeout(callback.bind(this, params), time);
    }
    else if(typeof callback == "function" && time != null && time != undefined && (this._timeout != null && this._timeout != undefined))
    {
        log.warn('Setting new timeout will cause loosing control on previously set timeout!');
        this._timeout = setTimeout(callback.bind(this, params), time);
    }
    else
    {
        log.warn('mobile911: worng set parameters');
    }
}

mobile911App.prototype._stopTimeout = function()
{
    clearTimeout(this._timeout);
    this._timeout = null;
}

mobile911App.prototype._startInterval = function(time, callback, params)
{
    if(typeof callback == "function" && time != null && time != undefined && (this._interval == null || this._interval == undefined))
    {
        this._interval = setInterval(callback.bind(this, params), time);
    }
    else if(typeof callback == "function" && time != null && time != undefined && (this._interval != null && this._interval != undefined))
    {
        log.warn('Setting new interval will cause loosing control on previously set inteval!');
        this._interval = setInterval(callback.bind(this, params), time);
    }
    else
    {
        log.warn('mobile911: worng set parameters');
    }
}

mobile911App.prototype._stopInterval = function()
{
    var that = this;
    clearInterval(that._interval);
    this._interval = null;
}

mobile911App.prototype._callingCountdown = function()
{
    if (this._currentContext && this._currentContext.ctxtId == 'CollisionDetectedDialog')
    {
        this._secondsCounter = this._secondsCounter - 1;
        var text1Id = this._contextTable.CollisionDetectedDialog.controlProperties.Dialog3Ctrl.text1Id;
        var submap = {counter: this._secondsCounter};
        if (this._currentContextTemplate)
        {
            this._currentContextTemplate.dialog3Ctrl.setText1Id(text1Id, submap);
        }
        else
        {
            this._contextTable["CollisionDetectedDialog"].controlProperties.Dialog3Ctrl.text1SubMap = submap;
        }
        if(this._secondsCounter == 0)
        {
            this._stopInterval();
        }
    }
}

mobile911App.prototype._conversationSecondsCounter = function()
{
    this._secondsCounter++;
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == 'Active911CallConnected')
    {
        this._currentContextTemplate.inCall2Ctrl.setMobile911ElapsedTime(this._secondsCounter);
    }
    else if (this._currentContext && this._currentContext.ctxtId == "Idle")
    {
        this._stopInterval();
        this._secondsCounter = 0;
    }
}

/**************************
 * Framework register
 **************************/
framework.registerAppLoaded("mobile911", null, true);
