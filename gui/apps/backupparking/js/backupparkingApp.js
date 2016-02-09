/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: backupparkingApp.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: aalangs
 Date: 25 Sep 2012
 __________________________________________________________________________

 Description: IHU GUI Backupparking App
 
 Revisions:
 v0.1 (25-September-2012) Developed App for phase 1 scope with workarounds
                          - aalangs
 v0.2 (12-October-2012)   Initial Version with new controls - aalangs
 v0.3 (15-October-2012)   Added BUC surface display suggested by Chris for 
                          all contexts to display transparent image on 
                          target - aalangs
 v0.4 (16-October-2012)   Merged all the helper functions using 
                          "setSliderValue" - aalangs
 v0.5 (17-October-2012)   Removed status bar for NoctrlTmplt - aalangs
 v0.6 (23-October-2012)   Added NativeGUI surface to be shown up - aalangs
                          Fixed flickering issues mentioned by Petar & 
                          closed review comments - aalangs
 v0.7 (14-December-2012)  Added PSM Toggle button support and updated
                          Control properties - aalangs
 v0.8 (20-December-2012)  Updated as per latest event manager and control
                          updates - aalangs
 v0.9 (10-January-2013)   Updated to handle surface management changes in gui 
                          framework - aalangs
 v1.0 (28-January-2013)   Updated to correct "properties" in ParkingSensorDisplay
                          & Added message to handle MiniView Status - aalangs
 v1.1 (20-February-2013)  Added AtSpeed behavior to enable/disable Adjust 
                          button - aalangs
 v1.2 (26-February-2013)  Removed logic of - disabling "close" button - aalangs
 v1.3 (26-February-2013)  Hide the Home button icon for multiple context(s) - aalangs
 v1.4 (19-March-2013)     Removed Manual Override of Log Level - debug - aalangs
 v1.5 (19-April-3013)     Filtering Interval of sending slider events to MMUI needs 
                          to be updated to 250ms instead of 2s - aalangs
 v1.6 (22-April-2013)     In No Video Signal Context if PSM mode is off, use 
                          ScreenSetting2Ctrl interfaces to hide PSM Button - aalangs
 v1.7 (23-April-2013)     Remove labelIds of Adjust and PSM button from the 
                          icons as per 3.90 UI spec - aalangs
 v1.8 (17-June-2013)      Used common dictionary for tab names - aalangs
 v1.9 (10-September-2013) Updated VideoSettings for AtSpeed - aalangs
__________________________________________________________________________
 */
 
log.addSrcFile("backupparkingApp.js", "backupparking");

function backupparkingApp(uiaId)
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
backupparkingApp.prototype.appInit = function()
{
    log.debug("backupparkingApp appInit  called...");

    if (framework.debugMode)
    {
        utility.loadScript("apps/backupparking/test/backupparkingAppTest.js");
    }
    
    //set flag so that animation is done only on press PSM button
    this._miniViewHideRequested = false;
    
    // cache Mini View PSD status
    this._miniViewPSDStatus = "MiniViewOn";
    
    // Store PSM hidden status
    this._PSMHidden = false;
    
    //cache values, default is 0, if no response from MMUI
    this._cachedBrightnessValue = 0;
    this._cachedContrastValue = 0;
    this._cachedTintValue = 0;
    this._cachedColorValue = 0;
    
    // cache vehicle speed
    this._cachedSpeed = null;
    
    // Video Settings tab value
    this.videoSettingsTab = true;

    //Tabs Config
    this._tabsConfig = [
        {
            "labelId" : "common.BrightnessTab",
            "itemConfig" :
            {
                style: "pivot",
                minChangeInterval: 250,
                settleTime: 1000,
                min: -5,
                max: 5,
                increment: 1,
                value: 0,
                appData: {eventName : "SetBrightnessValue", params : "brightnessValue"},
                hasActiveState: false
            }
        },
        {
            "labelId" : "common.ContrastTab",
            "itemConfig" :
            {
                style: "pivot",
                minChangeInterval: 250,
                settleTime: 1000,
                min: -5,
                max: 5,
                increment: 1,
                value: 0,
                appData: {eventName : "SetContrastValue", params : "contrastValue"},
                hasActiveState: false
            }
        },
        {
            "labelId" : "common.TintTab",
            "itemConfig" :
            {
                style: "pivot",
                minChangeInterval: 250,
                settleTime: 1000,
                min: -5,
                max: 5,
                increment: 1,
                value: 0,
                appData: {eventName : "SetTintValue", params : "tintValue"},
                hasActiveState: false
            }
        },
        {
            "labelId" : "common.ColorTab",
            "itemConfig" :
            {
                style: "pivot",
                minChangeInterval: 250,
                settleTime: 1000,
                min: -5,
                max: 5,
                increment: 1,
                value: 0,
                appData: {eventName : "SetColorValue", params : "colorValue"},
                hasActiveState: false
            }
        },
        {
            "labelId"       : "common.ResetTab",
            "itemConfig"    : { appData : "ResetAll", style : "oneButton", buttonId : "ResetSettings" }
        }
    ];
    
    //Context table
    //@formatter:off
    this._contextTable = {
       
        /**
         * This context shows only camera surface.
         * has PS:                 no
         * has camera:             yes
         * has video signal:     yes
         * show video surface:    no
         * show natgui surface:    yes
         */
        // BackupCameraDisplay 
        "BackupCameraDisplay" : {
            "hideHomeBtn" : true,
            "template" : "ScreenSettings2Tmplt",
            "properties": {
                "keybrdInputSurface" : "JCI_OPERA_PRIMARY", 
                "visibleSurfaces" :  ["NATGUI_SURFACE"]    // Do not include JCI_OPERA_PRIMARY in this list                
            },
            "controlProperties": {
                "ScreenSettings2Ctrl" : {
                    adjustButtonConfig : {"enabled": true, "adjustLabelId": "", "closeLabelId": "", "selectCallback": this._adjustBtnHandler.bind(this)},
                    tabsButtonConfig : {"visible": false, "currentlySelectedTab": 0, "tabsConfig": this._tabsConfig},
                    secondaryButtonConfig : null,   //These parameters are null (or omitted)
                    secondaryButtonCallback : null, //to not include a secondary button in this context
                    slideCallback : this._slideHandler.bind(this), // called when an item is dragged
                    selectCallback : this._selectHandler.bind(this), // called when a button is pressed
                    secondaryButtonAniTime : 0.5,
                } // end of properties for "ScreenSettings2Ctrl" 
            },
            "readyFunction" : this._BackupCameraDisplayReadyToDisplay.bind(this),
            "displayedFunction": this._BackupCameraDisplayCtxtTmpltDisplayed.bind(this)
        }, // end of "BackupCameraDisplay"
       
       /**
        * This contexts shows only the PSD
        * has PS:                 yes
        * has camera:             no
        * has video signal:       n/a
        * show video surface:     no
        * show natgui surface:    yes
        */
       // ParkingSensorDisplay 
        "ParkingSensorDisplay" : {
            "hideHomeBtn" : true,
            "template" : "NoCtrlTmplt",
            // set custom properties for this template
            "properties" : {
                "statusBarVisible" : false,
                "customBgImage" : "common/images/FullTransparent.png",
                "keybrdInputSurface" : "JCI_OPERA_PRIMARY", 
                "visibleSurfaces" :  ["NATGUI_SURFACE"]    // Do not include JCI_OPERA_PRIMARY in this list            
            },// end of list of controlProperties
            "displayedFunction" : this._ParkingSensorDisplayCtxtTmpltDisplayed.bind(this)
        }, // end of "ParkingSensorDisplay" 
        
        /**
         * This context shows PSD and camera
         * has PS:                 yes
         * has camera:             yes
         * has video signal:       yes
         * show video surface:     yes
         * show natgui surface:    yes
         */
        // BUCAndPSMDisplay 
        "BUCAndPSMDisplay" : {
            "hideHomeBtn" : true,
            "template" : "ScreenSettings2Tmplt",
            "properties": {
                "keybrdInputSurface" : "JCI_OPERA_PRIMARY", 
                "visibleSurfaces" :  ["NATGUI_SURFACE"]    // Do not include JCI_OPERA_PRIMARY in this list                
            },
            "controlProperties": {
                "ScreenSettings2Ctrl" : {
                    adjustButtonConfig : {"enabled": true, "adjustLabelId": "", "closeLabelId": "", "selectCallback": this._adjustBtnHandler.bind(this)},
                    tabsButtonConfig : {"visible": false, "currentlySelectedTab": 0, "tabsConfig": this._tabsConfig},
                    secondaryButtonConfig : {"openLabelId": "", "closeLabelId": "", "startOpened": true, appData: "secondaryBtn"},
                    secondaryButtonAniTime : 0.5,
                    secondaryButtonCallback : this._secondaryButtonHandler.bind(this), // called when the secondary button is pressed
                    slideCallback : this._slideHandler.bind(this), // this is called when an item is dragged
                    selectCallback : this._selectHandler.bind(this), // this is called when a button is pressed
                } // end of properties for "ScreenSettings2Ctrl"                           
            }, // end of list of controlProperties
            "readyFunction" : this._BUCAndPSMDisplayReadyToDisplay.bind(this),
            "displayedFunction": this._BUCAndPSMDisplayCtxtTmpltDisplayed.bind(this)
        }, // end of "BUCAndPSMDisplay"
        
        /**
         * This context displays no video signal
         * has PS:                 no
         * has camera:             yes
         * has video signal:     no
         * show video surface:    yes
         * show natgui surface:    yes
         */
        // NoVideoSignalNotification 
        "NoVideoSignalNotification" : {
            "hideHomeBtn" : true,
            "template" : "ScreenSettings2Tmplt",
            "properties": {
                "keybrdInputSurface" : "JCI_OPERA_PRIMARY", 
                "visibleSurfaces" :  ["NATGUI_SURFACE"]    // Do not include JCI_OPERA_PRIMARY in this list                
            },
            "controlProperties": {
                "ScreenSettings2Ctrl" : {
                    adjustButtonConfig : {"enabled": false, "adjustLabelId": "", "closeLabelId": "", "selectCallback": this._adjustBtnHandler.bind(this)},
                    tabsButtonConfig : {"visible": false, "currentlySelectedTab": 0, "tabsConfig": this._tabsConfig},
                    secondaryButtonConfig : {"openLabelId": "", "closeLabelId": "", "startOpened": true, appData: "secondaryBtn"},
                    secondaryButtonAniTime : 0.5,
                    secondaryButtonCallback : this._secondaryButtonHandler.bind(this), // called when the secondary button is pressed
                    slideCallback : this._slideHandler.bind(this), // called when an item is dragged
                    selectCallback : this._selectHandler.bind(this), // called when a button is pressed
                } // end of properties for "ScreenSettings2Ctrl" 
            },
            "readyFunction" : this._NoVideoSignalNotificationReadyToDisplay.bind(this),
            "displayedFunction": this._NoVideoSignalNotificationCtxtTmpltDisplayed.bind(this)
        }, // end of "NoVideoSignalNotification"
        
        // VideoSettings 
        "VideoSettings" : {
            "hideHomeBtn" : true,
            "template" : "ScreenSettings2Tmplt",
            "properties": {
                "keybrdInputSurface" : "JCI_OPERA_PRIMARY", 
                "visibleSurfaces" :  ["NATGUI_SURFACE"]    // Do not include JCI_OPERA_PRIMARY in this list                
            },
            "controlProperties": {
                "ScreenSettings2Ctrl" : {
                    adjustButtonConfig : {"enabled": true, "adjustLabelId": "", "closeLabelId": "", "selectCallback": this._adjustBtnHandler.bind(this)},
                    tabsButtonConfig : {"visible": true, "currentlySelectedTab": 0, "tabsConfig": this._tabsConfig},
                    secondaryButtonAniTime : 0.5,
                    secondaryButtonConfig : null,   //These parameters are null (or omitted),
                    secondaryButtonCallback : null, //to not include a secondary button in this context
                    slideCallback : this._slideHandler.bind(this),
                    selectCallback : this._selectHandler.bind(this), // called when a button is pressed
                } // end of properties for "ScreenSettings2Ctrl"                           
            }, // end of list of controlProperties
            "readyFunction" : this._VideoSettingsCtxtTmpltReadyToDisplay.bind(this),
        } // end of "VideoSettings"
    }; //EOF context table
    //@formatter:on
    
    //@formatter:off
    //message table
    this._messageTable =
    {
        "BrightnessSetting" : this._BrightnessSettingsMsgHandler.bind(this),
        "ColorSetting" : this._ColorSettingsMsgHandler.bind(this),
        "ContrastSetting" : this._ContrastSettingsMsgHandler.bind(this),
        "TintSetting" : this._TintSettingsMsgHandler.bind(this),
        //MiniView Status Msg
        "MiniViewStatus" : this._MiniViewStatusMsgHandler.bind(this),
        //Speed Handlers
        "Global.AtSpeed" : this._AtSpeedMsgHandler.bind(this),
        "Global.NoSpeed" : this._NoSpeedMsgHandler.bind(this)
    }; // EOF message table
}


/**********************
 * Context Handlers *
 **********************/

//BackupCameraDisplay ctxt
backupparkingApp.prototype._BackupCameraDisplayReadyToDisplay = function()
{
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "BackupCameraDisplay")
    {
        this._cachedSpeed = framework.common.getAtSpeedValue();
        
        if(this._cachedSpeed != null)
        {
            this._updateAtSpeed();
        }
    }
}
 
// Send an event to MMUI to notify that Adjust button is now available in displayed function
backupparkingApp.prototype._BackupCameraDisplayCtxtTmpltDisplayed = function()
{
    // Send an event to MMUI to notify that Adjust button is enabled now
    framework.sendEventToMmui(this.uiaId, "AdjustAvailable", {"payload": {"adjustButtonStatus": 1}});
}

// Send an event to MMUI to notify that Adjust button is now disabled
backupparkingApp.prototype._ParkingSensorDisplayCtxtTmpltDisplayed = function()
{
    // Send an event to MMUI to notify that Adjust button is disabled now
    framework.sendEventToMmui(this.uiaId, "AdjustAvailable", {"payload": {"adjustButtonStatus": 0}});
}

// BUCAndPSMDisplay context
backupparkingApp.prototype._BUCAndPSMDisplayReadyToDisplay = function()
{
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "BUCAndPSMDisplay")
    {
        // get speed value from fwk
        this._cachedSpeed = framework.common.getAtSpeedValue();
        if(this._cachedSpeed != null)
        {
            // Update the adjust button
            this._updateAtSpeed();
        }
        this._updateMiniViewStatus();
    }
}

// Send an event to MMUI to notify that Adjust button is now disabled
backupparkingApp.prototype._BUCAndPSMDisplayCtxtTmpltDisplayed = function()
{
    // Send an event to MMUI to notify that Adjust button is enabled now
    framework.sendEventToMmui(this.uiaId, "AdjustAvailable", {"payload": {"adjustButtonStatus": 1}});
}

// NoVideoSignalNotification context
backupparkingApp.prototype._NoVideoSignalNotificationReadyToDisplay = function()
{
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "NoVideoSignalNotification")
    {
        this._updateMiniViewStatus();
    }
}

// Send an event to MMUI to notify that Adjust button is now disabled
backupparkingApp.prototype._NoVideoSignalNotificationCtxtTmpltDisplayed = function()
{
    // Send an event to MMUI to notify that Adjust button is disabled now
    framework.sendEventToMmui(this.uiaId, "AdjustAvailable", {"payload": {"adjustButtonStatus": 0}});
}

// VideoSettings context
backupparkingApp.prototype._VideoSettingsCtxtTmpltReadyToDisplay = function()
{
    // Update the current slider value before display
    if(this._currentContext && this._currentContext.ctxtId && this._currentContext.ctxtId === "VideoSettings")
    {
        var currTabValue = null;
        
        // get speed value from fwk
        this._cachedSpeed = framework.common.getAtSpeedValue();
        
        if(this._cachedSpeed != null)
        {
            // Update the adjust button
            this._updateAtSpeed();
        }

        if(this.videoSettingsTab)
        {
            for(var i = 0 ; i < 4; i++)
            {
                var currTabValue = this._tabsConfig[i].itemConfig.appData;
                // Check what is the value of selected tab and update it with cached slider value 
                switch(currTabValue)
                {
                    case "SetBrightnessValue" : 
                        this._updateSliderValue(0, this._cachedBrightnessValue);
                        break;
                    case "SetContrastValue" :
                        this._updateSliderValue(1, this._cachedContrastValue);
                        break;
                    case "SetTintValue" :
                        this._updateSliderValue(2, this._cachedTintValue);
                        break;
                    case "SetColorValue" :
                        this._updateSliderValue(3, this._cachedColorValue);
                        break;
                    default : 
                        log.info("No slider update is required...");
                        break;
                }
            }
        }
        else
        {
            log.warn("Video Settings can not be displayed as speed exceeded the limit");
        }
    }
}

/**************************
 * Message handlers
 **************************/

//BrightnessTab Message Handler
backupparkingApp.prototype._BrightnessSettingsMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.videoBrightness != null)
    {
        // cache the value sent by MMUI for later use
        this._cachedBrightnessValue = msg.params.payload.videoBrightness;
        this._tabsConfig[0].itemConfig.value = this._cachedBrightnessValue;
        // Update the slider value if context matches
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "VideoSettings")
        {
            if(this._tabsConfig[0].itemConfig.appData.eventName === "SetBrightnessValue")
            {
                this._updateSliderValue(0, this._cachedBrightnessValue);
            }
        }
    }
}

//ContrastTab Message Handler
backupparkingApp.prototype._ContrastSettingsMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.videoContrast != null)
    {
        // cache the value sent by MMUI for later use
        this._cachedContrastValue = msg.params.payload.videoContrast;
        this._tabsConfig[1].itemConfig.value = this._cachedContrastValue;
        // Update the slider value if context matches
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "VideoSettings")
        {
            if(this._tabsConfig[1].itemConfig.appData.eventName === "SetContrastValue")
            {
                this._updateSliderValue(1, this._cachedContrastValue);
            }
        }
    }
}

//TintTab Message Handler
backupparkingApp.prototype._TintSettingsMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.videoTint != null)
    {
        // cache the value sent by MMUI for later use
        this._cachedTintValue = msg.params.payload.videoTint;
        this._tabsConfig[2].itemConfig.value = this._cachedTintValue;
        // Update the slider value if context matches
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "VideoSettings")
        {
            if(this._tabsConfig[2].itemConfig.appData.eventName === "SetTintValue")
            {
                this._updateSliderValue(2, this._cachedTintValue);
            }
        }
    }
}

//Color Tab Message Handler
backupparkingApp.prototype._ColorSettingsMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.videoColor != null)
    {
        // cache the value sent by MMUI for later use
        this._cachedColorValue = msg.params.payload.videoColor;
        this._tabsConfig[3].itemConfig.value = this._cachedColorValue;
        // Update the slider value if context matches
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "VideoSettings")
        {
            if(this._tabsConfig[3].itemConfig.appData.eventName === "SetColorValue")
            {
                this._updateSliderValue(3, this._cachedColorValue);
            }
        }
    }
}

//MiniView Status Message Handler
backupparkingApp.prototype._MiniViewStatusMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.miniViewPSD)
    {
        // cache the value sent by MMUI for later use
        this._miniViewPSDStatus = msg.params.payload.miniViewPSD;
        
        // Update the Mini View value if context matches
        if (this._currentContext && this._currentContextTemplate && 
                this._currentContext.ctxtId === "BUCAndPSMDisplay" || this._currentContext.ctxtId === "NoVideoSignalNotification")
        {
            this._updateMiniViewStatus();
        }
    }
}

// At Speed - true
backupparkingApp.prototype._AtSpeedMsgHandler = function(msg)
{
    if (msg)
    {
        // cache the value sent by GUI common for later use
        this._cachedSpeed = true;
        // Update the context if matches
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId)
        {
            switch(this._currentContext.ctxtId)
            {
                case "BackupCameraDisplay" :
                case "BUCAndPSMDisplay" :
                case "VideoSettings" :
                    this._updateAtSpeed();
                    break;
                default :
                    log.warn("No action in this ctxt..." + this._currentContext.ctxtId);
                    break;
            }
        }
    }
}

// At Speed - false
backupparkingApp.prototype._NoSpeedMsgHandler = function(msg)
{
    if (msg)
    {
        // cache the value sent by GUI common for later use
        this._cachedSpeed = false;
        // Update the context if matches
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId)
        {
            switch(this._currentContext.ctxtId)
            {
                case "BackupCameraDisplay" :
                case "BUCAndPSMDisplay" :
                case "VideoSettings" :
                    this._updateAtSpeed();
                    break;
                default :
                    log.warn("No action in this ctxt..." + this._currentContext.ctxtId);
                    break;
            }
        }
    }
}

/**************************
 * CONTROL HANDLERS *
 **************************/

/*
 * Callback for sliders within the tabs
 */
backupparkingApp.prototype._slideHandler = function(ctrlObj, appData, params)
{
    var eventName = appData.eventName;

    switch(eventName)
    {
        case "SetBrightnessValue" : 
            framework.sendEventToMmui(this.uiaId, eventName, {"payload": {"brightnessValue" : params.value, "final": params.finalAdjustment}});
            break;
        case "SetContrastValue" : 
            framework.sendEventToMmui(this.uiaId, eventName, {"payload": {"contrastValue" : params.value, "final": params.finalAdjustment}});
            break;
        case "SetTintValue" : 
            framework.sendEventToMmui(this.uiaId, eventName, {"payload": {"tintValue" : params.value, "final": params.finalAdjustment}});
            break;
        case "SetColorValue" : 
            framework.sendEventToMmui(this.uiaId, eventName, {"payload": {"colorValue" : params.value, "final": params.finalAdjustment}});
            break;
        default : 
            log.warn("No event has been defined");
            break;
    }
}

/*
 * Callback for items within the tabs (e.g. Reset All Button)
 */
backupparkingApp.prototype._selectHandler = function(ctrlObj, appData, params)
{
    framework.sendEventToMmui(this.uiaId, appData, {});
}

/*
 * Callback for the adjust button
 */
backupparkingApp.prototype._adjustBtnHandler = function(ctrlObj, appData, params)
{
    if(params.opened == false)
    {
        framework.sendEventToMmui(this.uiaId, "SelectVideoSettings", params);
    }
    else if(params.opened == true)
    {
        framework.sendEventToMmui(this.uiaId, "SelectClose", params);
    }
}

/*
 * Callback for the secondary button
 */
backupparkingApp.prototype._secondaryButtonHandler = function(ctrlObj, appData, params)
{
    log.debug("backupparkingApp _secondaryButtonHandler called: " + params.opened);
    // Check validity of ctxt to avoid GUI State Time Out Err
    if(this._currentContextTemplate)
    {
        if (params.opened == false)
        {
            // Send an event to MMUI to notify MiniViewOn
            this._currentContextTemplate.screenSettings2Ctrl.startAnimation("open", this._secondaryBtnAnimationComplete.bind(this));
        }
        else
        {
            // Send an event to MMUI to notify MiniViewOff
            this._miniViewHideRequested = true;
            framework.sendEventToMmui(this.uiaId, "MiniViewOff");
        }
    }
}

/*
 * Callback for the secondary button animation complete
 */
backupparkingApp.prototype._secondaryBtnAnimationComplete = function(ctrlObj, appData, params)
{
    log.debug("_secondaryBtnAnimationComplete called..");
    // check if current context is - BUCAndPSMDisplay
    if(this._currentContext && this._currentContext.ctxtId && 
       (this._currentContext.ctxtId === "BUCAndPSMDisplay" || this._currentContext.ctxtId === "NoVideoSignalNotification" ))
    {
        if (params.opened == true)
        {
            // Send an event to MMUI to notify MiniViewOn
            framework.sendEventToMmui(this.uiaId, "MiniViewOn");
        }
    }
}

/**************************
 * Helper functions
 **************************/

//Helper function for setting slider value for tabs
backupparkingApp.prototype._updateSliderValue = function(index, sliderValue)
{
    // Check validity of ctxt to avoid GUI State Time Out Err
    if(this._currentContextTemplate)
    {
        var tmplt = this._currentContextTemplate;
        // Call public API of screenSettings2Ctrl and update the slider value            
        tmplt.screenSettings2Ctrl.update(index, sliderValue);
    }
}

//Helper function for setting MiniView button status - PSM - show or hide
backupparkingApp.prototype._updateMiniViewStatus = function()
{
    // Check validity of ctxt to avoid GUI State Time Out Err
    if(this._currentContextTemplate)
    {
        var tmplt = this._currentContextTemplate;
        switch(this._miniViewPSDStatus)
        {
            case "miniViewOn" :
                if(this._PSMHidden)
                {
                    tmplt.screenSettings2Ctrl.hideSecondaryBtn(false);
                }
                // Call public API of screenSettings2Ctrl and update MiniView Button status value
                tmplt.screenSettings2Ctrl.setSecondaryBtnOpened(true);
                break;
            case "miniViewOff" :
                if(this._PSMHidden)
                {
                    tmplt.screenSettings2Ctrl.hideSecondaryBtn(false);
                }
                // Call public API of screenSettings2Ctrl and update MiniView Button status value
                tmplt.screenSettings2Ctrl.setSecondaryBtnOpened(false);
                if(this._miniViewHideRequested === true)
                {
                    this._miniViewHideRequested = false;
                    // Animation part
                    tmplt.screenSettings2Ctrl.startAnimation("close",this._secondaryBtnAnimationComplete.bind(this));
                }
                break;
            case "noPS" : 
                tmplt.screenSettings2Ctrl.hideSecondaryBtn(true);
                this._PSMHidden = true;
                break;
            default : 
                log.warn("Invalid State...");
                break;
        }
    }
}

// Update the adjust button - enable / disable based on status
backupparkingApp.prototype._updateAtSpeed = function()
{
    if(this._currentContextTemplate)
    {
        var tmplt = this._currentContextTemplate;
        if(!this._cachedSpeed)
        {
            // Call public API of screenSettings2Ctrl and update Adjust Button status value
            tmplt.screenSettings2Ctrl.setAtSpeed(false);
            this.videoSettingsTab = true;
        }
        else
        {
            // Call public API of screenSettings2Ctrl and update Adjust Button status value
            tmplt.screenSettings2Ctrl.setAtSpeed(true);
            this.videoSettingsTab = false;
        }
    }
}


//Tell framework this .js file has finished loading, it has no controls to load, and it has no dictionaries
framework.registerAppLoaded("backupparking", null, true);
