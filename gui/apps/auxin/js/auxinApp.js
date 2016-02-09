/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: auxinApp.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: TCS
 Date: 30-August-2012
 __________________________________________________________________________

 Description: IHU GUI AuxIn App

 Revisions:
 v0.1 (30-August-2012 )   AuxIn App created with Nowplaying - arsu
 v0.2 (12-September-2012) Merged to match the SCR framework related changes
                          Updated to use new UMP updates - arsu
 v0.3 (24-September-2012) Generated English dictionary using dictionary compiler - arsu
                          Closed GENERAL COMMENTS ACROSS APPS given by Arun - arsu
 v0.4 (30-October-2012)   Changes added for controlTitle - arsu
 v0.5 (31-December-2012)  Changed to Nowplayingtempalte3 - arsu
 v0.6 (02-Jan-2012)       Context Name changed to AuxInActive as per the new event sheet - arsu
 v0.7 (31-May-2013)       Album art window is removed - arsu
 __________________________________________________________________________

 */
log.addSrcFile("auxinApp.js", "auxin");

 /**********************************************
 * Start of Base App Implementation
 *
 * Code in this section should not be modified
 * except for function names based on the appname
 *********************************************/

function auxinApp(uiaId)
{
    log.debug("auxinApp App constructor called...");

    baseApp.init(this, uiaId);
}

/**************************
 * Standard App Functions *
 **************************/
/*
 * Called just after the app is instantiated by framework.
 */
auxinApp.prototype.appInit = function()
{

    log.debug(" auxinApp appInit  called...");

    if (framework.debugMode)
    {
        utility.loadScript("apps/auxin/test/auxinAppTest.js");
    }

    this._umpButtonConfig = new Object();
    // Default config
    //@formatter:off
    this._umpButtonConfig["SelectSource"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpEntMenu",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectSource"
    };
    this._umpButtonConfig["SelectSettings"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpEqualizer",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectSettings"
    };

    //@formatter:off
    this._contextTable = {
        "AuxInActive" : {
            "template" : "NowPlaying4Tmplt",
            "sbNameId" : "AuxIn",
            "controlProperties": {
                "NowPlayingCtrl" : {
                    "ctrlStyle"     : "Style0",
                    "umpConfig" : {
                        "buttonConfig" : this._umpButtonConfig,
                        "fullConfig"    : true,
                        "defaultSelectCallback" : this._umpDefaultSelectCallback.bind(this),
                        "umpStyle" : "fullWidth",
                        "hasScrubber" : false,
                        "dataList": null
                    }
                } // end of properties for "NowPlayingCtrl"
            }, // end of list of controlProperties
            "readyFunction" : null,
            "contextInFunction" : null,
            "displayedFunction": null
        },
    };
    //@formatter:off
    this._messageTable = {
        "Sbn_DeviceStatus" : this._Sbn_DeviceStatusInfoMsgHandler.bind(this)
    };// end of this._messageTable
    //@formatter:on
}

/***************************
 * Control callbacks
 ***************************/

//Ump control for button select
auxinApp.prototype._umpDefaultSelectCallback = function(ctrlObj, appData, params)
{
    log.debug("auxinApp _umpDefaultSelectCallback called...");
    framework.sendEventToMmui(this.uiaId, appData);
}

/**************************
 * Message handlers
 **************************/

//Display the song info in SBN
auxinApp.prototype._Sbn_DeviceStatusInfoMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.status)
    {
        var state = msg.params.payload.status;
        this._showDeviceStatusSBN(state);
    }
}

/***************************
 * Helper Functions
 ***************************/
/*******************************************************************************
 * This function is called by Common whenever a msgType="alert" comes from MMUI *
 * This function should return a properties Object to use for the WinkCtrl *
 *******************************************************************************/

auxinApp.prototype.getWinkProperties = function(alertId, params)
{
    log.debug("common is looking for wink properties:", alertId, params);
    var winkProperties = null;
    switch (alertId)
    {
        case "GUI_AuxRemoved_Alert" :
            winkProperties = {
                "style": "style03",
                "text1Id": "AuxRemoved"
            };
            break;
        default:
            break;
    }
    // return the properties to Common
    return winkProperties;
}

//showing status bar notification for AUX inserted and Removed
auxinApp.prototype._showDeviceStatusSBN = function(state)
{
    if(state)
    {
        var sbnText = null;
        switch(state)
        {
            case "DISCONNECTED":
                sbnText = "AuxRemoved";
                break;
            case "CONNECTED_IDLE":
                sbnText = "AuxInserted";
                break;
            default:
                break;
        }
        if(sbnText)
        {
            framework.common.startTimedSbn(this.uiaId, "AUXState", "entertainmentInfo",
            { sbnStyle : "Style02",imagePath1 : "common/images/icons/IcnListBtConnType_Music.png",text1Id : sbnText , text2 : null });
        }
    }
}


 /**************************
 * Framework register
 **************************/
framework.registerAppLoaded("auxin",null,true);