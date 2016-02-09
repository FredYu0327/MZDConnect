/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: tvApp.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: apopoval
 Date: 18-Oct-2012
 __________________________________________________________________________

 Description: IHU GUI TV App

 Revisions:
 v0.1 (18-Oct-2012) Initial Version using 3.5 UI spec
 v0.2 (26-Oct-2012) Added surfaces manipulation
 v0.3 (16-Jan-2013) Updated key event focus management
 v0.4 (16-Jan-2013) Surface changed from NATGUI_SURFACE to BACKUPCAM_SURFACE_ID
 v0.4 (22-Feb-2013) Added 3.8 dictionaries
 v0.5 (16-Jan-2013) Surface changed from BACKUPCAM_SURFACE_ID to TV_TOUCH_SURFACE (SW00118851)
 v1.0 (06-Jun-2013) Added EmBroadcastNotification context and SBNs (SW00116257)
 v1.1 (12-Jun-2013) Removed surface manipulation (SW00121212)
 v1.2 (21-Jun-2013) Added VideoSettings context, migrated to ScreenSettings2 (SW00121544)
 v1.3 (24-Jun-2013) Updated events (SW00122226)
 v1.4 (16-Jul-2013) Migrated to Dialog3 (SW00124001)
 v1.5 (21-Jul-2013) Re-added surface manipulation (SW00125340)
 v1.5 (21-Jul-2013) Added TV channel msg handler, used as sbName (SW00123072)
 v1.6 (18-Sep-2013) Added msg handler for Video Settings memorizing (SW00132480)
 v1.7 (29-Oct-2013) Added msg handler for AtSpeed/NoSpeed event (SW00136158)
 __________________________________________________________________________

 */
log.addSrcFile("tvApp.js", "tv");

function tvApp(uiaId)
{
    log.debug("Constructor called.");

    // Base application functionality is provided in a common location via this call to baseApp.init().
    // See framework/js/BaseApp.js for details.
    baseApp.init(this, uiaId);
}


/**************************
 * App Init is standard function called by framework *
 **************************/

/*
 * Called just after the app is instantiated by framework.
 * All variables local to this app should be declared in this function
 */
tvApp.prototype.appInit = function()
{
    log.debug("tvApp appInit  called...");

    if (framework.debugMode)
    {
        utility.loadScript("apps/tv/test/tvAppTest.js");
    }


    this.buttonClick = this._tabSelectHandler.bind(this);

    //cache

    this._cachedVideoSettings = null;
    this._cachedStatusBarSettings = null;


    //Tabs Config
    this._tabsConfig = [
        {
            "labelId"       : "Brightness",
            "itemConfig"	:
            {
                style: "pivot",
                minChangeInterval: 250,
                settleTime: 1000,
                min: -5,
                max: 5,
                increment: 1,
                value: 0,
                appData: "brightnessTab",
                hasActiveState: false
            }
        },
        {
            "labelId"       : "Contrast",
            "itemConfig"	:
            {
                style: "pivot",
                minChangeInterval: 250,
                settleTime: 1000,
                min: -5,
                max: 5,
                increment: 1,
                value: 0,
                appData: "contrastTab",
                hasActiveState: false
            }
        },
        {
            "labelId"       : "Tint",
            "itemConfig" 	:
            {
                style: "pivot",
                minChangeInterval: 250,
                settleTime: 1000,
                min: -5,
                max: 5,
                increment: 1,
                value: 0,
                appData: "tintTab",
                hasActiveState: false
            }
        },
        {
            "labelId"       : "Color",
            "itemConfig"	:
            {
                style: "pivot",
                minChangeInterval: 250,
                settleTime: 1000,
                min: -5,
                max: 5,
                increment: 1,
                value: 0,
                appData: "colorTab",
                hasActiveState: false
            }
        },
        {
            "labelId"    	: "Reset",
            "itemConfig"	: { appData : "ResetAll", style : "oneButton", buttonId : "ResetAll" }
        }
    ];

    var closeButtonAppData = {
        bumpToClose : "GoToCloseAdjustmentCtxt", // Real event ID is unknown. Check with MMUI team to determine real event ID.
        selectClose: "SelectClose" // Event ID will be different depending on callback received. UI Spec behavior is unusual.
    };

    //Context table
    //@formatter:off
    this._contextTable = {
        "TVScreen" : {
            sbNameId : "sbNameId",
            template : "NoCtrlTmplt",
            properties: {
                customBgImage : "common/images/FullTransparent.png",
                keybrdInputSurface : "TV_TOUCH_SURFACE",
                visibleSurfaces : ["TV_TOUCH_SURFACE"]
            },
        "readyFunction" : this._TVScreenCtxtReady.bind(this),
        "noLongerDisplayedFunction" : this._TVScreenCtxtNoLongerDisplayed.bind(this)
        }, // end of "TVScreen"

        "NoVideoSignal" : {
            sbNameId : "sbNameId",
            template : "Dialog3Tmplt",
            controlProperties: {
                Dialog3Ctrl : {
                    contentStyle : "style02",
                    fullScreen : true,
                    defaultSelectCallback :  this._dialogDefaultSelectCallback.bind(this),
                    buttonCount : 1,
                    buttonConfig : {
                        button1 : {
                            labelId : "common.Ok",
                            appData : "ok"
                        },
                    },
                    text1Id : 'NoVideoSignalAvailable',
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "readyFunction" : null,
            "contextInFunction" : null,
            "displayedFunction": null
        }, // end of "NoVideoSignal"

        "EmBroadcastNotification" : {
            sbNameId : "sbNameId",
            template : "Dialog3Tmplt",
            controlProperties: {
                Dialog3Ctrl : {
                    fullScreen : true,
                    contentStyle : "style02",
                    defaultSelectCallback :  this._dialogDefaultSelectCallback.bind(this),
                    buttonCount : 2,
                    buttonConfig : {
                        button1 : {
                            labelId : "common.Cancel",
                            appData : "cancel"
                        },
                        button2 : {
                            labelId : "View",
                            appData : "view"
                        },
                    },
                    text1Id : 'EmBroadcastNotification',
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "readyFunction" : null,
            "contextInFunction" : null,
            "displayedFunction": null
        }, // end of "EmBroadcastNotification"

        "VideoSettings" : {
            template : "ScreenSettings2Tmplt",
            properties: {
                visibleSurfaces : ["TV_TOUCH_SURFACE"]
            },
            controlProperties: {
                ScreenSettings2Ctrl : {
                    style : "bottom",
                    adjustButtonConfig : {"enabled": true, "selectCallback": this._adjustBtnHandler.bind(this)},
                    tabsButtonConfig : {"visible": true, "currentlySelectedTab": 0, "tabsConfig": this._tabsConfig},
                    secondaryButtonConfig : null,   //These parameters are null (or omitted),
                    secondaryButtonCallback : null, //to not include a secondary button in this context
                    secondaryButtonAniTime : null,
                    slideCallback : this._slideHandler.bind(this), // called when an item is dragged
                    selectCallback : this._selectHandler.bind(this), // called when a button is pressed
                } // end of properties for "ScreenSettings2Ctrl"
            }, // end of list of controlProperties

            "contextInFunction" : this._VideoSettingsInFunction.bind(this),
              "readyFunction" : this._ScreenSettings2ReadyToDisplay.bind(this)
        },

    }; //
    //@formatter:on


    /* ------------------------------
     * MESSAGE TABLE
     * Message handlers
     * ------------------------------
     */
    //@formatter:off
    this._messageTable = {
        "TVMode"                 : this._TVModeMsgHandler.bind(this),
        "TimedSbn_NoVideoSignal" : this._TimedSbn_NoVideoSignalMsgHandler.bind(this),
        "SendVideoSettingsValues" : this._SendVideoSettingsValuesMsgHandler.bind(this),
        "StatusBarRequested" : this._StatusBarRequestedMsgHandler.bind(this),

        "Global.AtSpeed" : this._speedMsgHandler.bind(this),
        "Global.NoSpeed" : this._speedMsgHandler.bind(this)
    }; // end of this._messageTable
    //@formatter:on



};


/**************************
 * Message handlers *
 **************************/
tvApp.prototype._speedMsgHandler = function(msg)
{
    log.debug("speed msg handler called");
    var atSpeed = framework.common.getAtSpeedValue();
    if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "VideoSettings")
    {
        this._currentContextTemplate.screenSettings2Ctrl.setAtSpeed(atSpeed);
    }

}

tvApp.prototype._TimedSbn_NoVideoSignalMsgHandler = function(msg)
{
    log.debug("_TimedSbn_NoVideoSignalMsgHandler");
    framework.common.startTimedSbn(this.uiaId, "TvNoVideoSignal", "entertainmentInfo", {sbnStyle: "Style02", imagePath1: "common/images/icons/IcnSbMusic.png", text1Id: "LostVideoSignal"});

}
tvApp.prototype._TVModeMsgHandler = function(msg)
{
    log.debug("_TVModeMsgHandler ", msg);

    this._cacheCurrentChannel = msg.params.payload.mode;

    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "TVScreen")
    {
        if(this._cacheCurrentChannel)
        {
            framework.common.setSbName(framework.localize.getLocStr("tv", "sbNameId") + this._cacheCurrentChannel);
        }
        else
        {
            framework.common.setSbName(framework.localize.getLocStr("tv", "sbNameId"));
        }
    }

}

tvApp.prototype._SendVideoSettingsValuesMsgHandler = function(msg)
{
    this._cachedVideoSettings = msg.params.payload.VideoSettings;
    if(this._currentContextTemplate && this._currentContextTemplate.contextInfo && this._currentContextTemplate.contextInfo.ctxtId && this._currentContextTemplate.contextInfo.ctxtId == "VideoSettings")
    {
        this._currentContextTemplate.screenSettings2Ctrl.update(0, this._cachedVideoSettings.brightness);
        this._currentContextTemplate.screenSettings2Ctrl.update(1, this._cachedVideoSettings.contrast);
        this._currentContextTemplate.screenSettings2Ctrl.update(2, this._cachedVideoSettings.tint);
        this._currentContextTemplate.screenSettings2Ctrl.update(3, this._cachedVideoSettings.color);
    }

}

tvApp.prototype._StatusBarRequestedMsgHandler = function(msg)
{
    this._cachedStatusBarSettings = msg.params.payload.display;

    if (!framework.common.requestStatusBarHidden)
    {
        return;
    }

    if(this._currentContext && this._currentContextTemplate && this._currentContextTemplate.contextInfo.ctxtId && this._currentContextTemplate.contextInfo.ctxtId === "TVScreen")
    {
        if(this._cachedStatusBarSettings != null)
        {
            if(msg.params.payload.display === 0)
            {
                framework.common.requestStatusBarHidden(100, 100, this._StatusBarRequestedCallback.bind(this));
            }
            if(msg.params.payload.display == 1)
            {
                  framework.common.requestStatusBarShown(100, 100, this._StatusBarRequestedCallback.bind(this));
            }
        }
    }
}



/**************************
 * Context Functions *
 **************************/
tvApp.prototype._TVScreenCtxtReady = function()
{
    log.debug("TVScreen context is ready to display");
    if(this._cacheCurrentChannel)
    {
        framework.common.setSbName(framework.localize.getLocStr("tv", "sbNameId") + this._cacheCurrentChannel);
    }
    else
    {
        framework.common.setSbName(framework.localize.getLocStr("tv", "sbNameId"));
    }
}

tvApp.prototype._TVScreenCtxtNoLongerDisplayed = function()
{
    log.debug("TVScreen context is no longer displayed");
}

tvApp.prototype._ScreenSettings2ReadyToDisplay = function(msg)
{
    log.debug("In _ScreenSettings2NoSecondBtnReadyToDisplay...");

    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId)
    {
        switch(this._currentContext.ctxtId)
        {
            case "VideoSettings" :
                this._cachedAtSpeed = framework.common.getAtSpeedValue();
                if (this._cachedAtSpeed != null)
                {
                    this._currentContextTemplate.screenSettings2Ctrl.setAtSpeed(this._cachedAtSpeed);
                }
                if(this._cachedVideoSettings != null)
                {
                    if(this._cachedVideoSettings.brightness != null)
                    {
                        this._currentContextTemplate.screenSettings2Ctrl.update(0, this._cachedVideoSettings.brightness);
                    }
                    if(this._cachedVideoSettings.contrast != null)
                    {
                        this._currentContextTemplate.screenSettings2Ctrl.update(1, this._cachedVideoSettings.contrast);
                    }
                    if(this._cachedVideoSettings.tint != null)
                    {
                        this._currentContextTemplate.screenSettings2Ctrl.update(2, this._cachedVideoSettings.tint);
                    }
                    if(this._cachedVideoSettings.color != null)
                    {
                        this._currentContextTemplate.screenSettings2Ctrl.update(3, this._cachedVideoSettings.color);
                    }
                }
                break;
            default :
                log.warn("No action in this context... " + this._currentContext.ctxtId);
                break;
        }
    }
}

tvApp.prototype._VideoSettingsInFunction = function(ctxtData)
{
    if(ctxtData != null && ctxtData.params != null && ctxtData.params.payload != null && ctxtData.params.payload.VideoSettings != null)
    {
        this._cachedVideoSettings = ctxtData.params.payload.VideoSettings;
    }
}

/**************************
 * App Functions *
 **************************/

tvApp.prototype._dialogDefaultSelectCallback = function(dialogBtnCtrlObj, appData, params)
{
    log.debug("_dialogDefaultSelectCallback  called...", dialogBtnCtrlObj.properties.label, appData);

    switch(this._currentContext.ctxtId)
    {
        case 'NoVideoSignal':
            switch(appData)
            {
                case 'ok':
                    framework.sendEventToMmui("Common", "Global.Yes");
                    break;
            }
            break;
        case 'EmBroadcastNotification':
            switch(appData)
            {
                case 'view':
                    framework.sendEventToMmui("tv", "SelectView");
                    break;
                case 'cancel':
                    framework.sendEventToMmui("Common", "Global.Cancel");
                    break;
            }
            break;
        }
}


/**************************
 * CONTROL HANDLERS *
 **************************/

/*
 * Called when a tab is selected.
 * Note: This is also assigned as the callback when the adjust/close button is selected. The index for
 *          the adjust/select button is given as -1.
 */
tvApp.prototype._tabSelectHandler = function(ctrlObj, appData, params)
{
    log.debug(" _tabSelectHandler  called...", ctrlObj.divElt.className, appData, params);

    // Currently using a switch here to demonstrate behavior. However,
    // using proper appData, a switch may not be needed.


    //FIXME: For testing purposes only, to be removed
    switch (appData)
    {
      case "SelectAdjust" :
          framework.sendEventToMmui("Common", "Global.GoBack");
          // params.buttonIndex = null;
          break;
    }


    // switch (params.buttonIndex)
    // {
        // case -1: //buttonIndex is -1 when the adjust/close button is selected
            // if (params.tabsShown == true)
            // {
                //// button is close button
                // if (params.bumpToClose == true)
                // {
                    // framework.sendEventToMmui(this.uiaId, appData.bumpToClose);
                // }
                // else
                // {
                    // framework.sendEventToMmui(this.uiaId, appData.selectClose);
                // }

            // }
            // else
            // {
                //// button is adjust button
                // framework.sendEventToMmui(this.uiaId, appData);
            // }
            // break;
        // case 0: // first tab selected
            // framework.sendEventToMmui(this.uiaId, "SelectTab", {payload:{cameraTab:appData}});
            // break;
        // case 1: // second tab selected
            // framework.sendEventToMmui(this.uiaId, "SelectTab", {payload:{cameraTab:appData}});
            // break;
        // case 2: // third tab selected
            // framework.sendEventToMmui(this.uiaId, "SelectTab", {payload:{cameraTab:appData}});
            // break;
        // case 3: // fourth tab selected
            // framework.sendEventToMmui(this.uiaId, "SelectTab", {payload:{cameraTab:appData}});
            // break;
        // case 4: // fifth tab selected
            // framework.sendEventToMmui(this.uiaId, "SelectTab", {payload:{cameraTab:appData}});
            // break;
    // }
}

/*
 * Callback for sliders within the tabs
 */
tvApp.prototype._slideHandler = function(ctrlObj, appData, params)
{
    log.debug(" _slideHandler  called...", appData, params);

    switch (appData)
    {
      case "brightnessTab" :
          framework.sendEventToMmui(this.uiaId, "SetBrightnessValue", {"payload": {"brightnessValue": params.value, "final": params.finalAdjustment}})
          break;
      case "contrastTab" :
          framework.sendEventToMmui(this.uiaId, "SetContrastValue", {"payload": {"contrastValue": params.value, "final": params.finalAdjustment}})
          break;
      case "tintTab" :
          framework.sendEventToMmui(this.uiaId, "SetTintValue", {"payload": {"tintValue": params.value, "final": params.finalAdjustment}})
          break;
      case "colorTab" :
          framework.sendEventToMmui(this.uiaId, "SetColorValue", {"payload": {"colorValue": params.value, "final": params.finalAdjustment}})
          break;
    }

}


tvApp.prototype._adjustBtnHandler = function(ctrlObj, appData, params)
{
    log.debug("_adjustBtnHandler called: " + appData, params);

    framework.sendEventToMmui(this.uiaId, "SelectClose");

    // if (params.opened == false)
    // {
        // framework.sendEventToMmui(this.uiaId, "OpenAdjust", params);
    // }
    // else
    // {
        // framework.sendEventToMmui(this.uiaId, "CloseAdjust", params);
    // }
}

tvApp.prototype._selectHandler = function(ctrlObj, appData, params)
{
    log.debug("_itemSelectHandler called: " + appData, params);

    framework.sendEventToMmui(this.uiaId, appData, {});
}


/*
 * Callback for items within the tabs (e.g. Reset All Button)
 */
tvApp.prototype._itemSelectHandler = function(ctrlObj, appData, params)
{
    log.debug(" _itemSelectHandler  called...", appData, params);
}

tvApp.prototype._StatusBarRequestedCallback = function()
{
    if(this._cachedStatusBarSettings != null)
    {
        log.debug("status bar callback called with value " + this._cachedStatusBarSettings);
        this._cachedStatusBarSettings === 1 ? framework.sendEventToMmui(this.uiaId, "RequestStatusBar", {"payload" : {"display" : 1 }}) :
        framework.sendEventToMmui(this.uiaId, "RequestStatusBar", {"payload" : {"display" : 0 }});
    }
}

//Tell framework this .js file has finished loading, it has no controls to load, and it has no dictionaries
framework.registerAppLoaded("tv", null, true);
