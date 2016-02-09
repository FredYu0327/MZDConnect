/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: audiosettingsApp.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: aalangs
 Date: 25-July-2012
 __________________________________________________________________________

 Description: IHU GUI Audiosettings App

 Revisions:
 v0.1 (31-Jul-2012) New message handlers have been added to handle
                    AudioSettingsStatus and VolumeSettingsStatus - aalangs
 v0.2 (02-Aug-2012) New message handlers have been removed to handle
                    AudioSettingsStatus and VolumeSettingsStatus
                    Control title is updated as per the payload data - aalangs
 v0.3 (07-Aug-2012) AudioSettingsStatus and VolumeSettingsStatus are updated
                    in audio title instead of control title - aalangs
 v0.4 (03-Sep-2012) Merged to match the SCR framework related changes - aalangs
 v0.5 (12-Sep-2012) Merged ump control changes as per SCR - SCR00098475 - aalangs
 v0.6 (24-Sep-2012) Generated English dictionary using dictionary compiler.
                    Closed GENERAL COMMENTS ACROSS APPS given by Arun - arsu
 v0.7 (01-Oct-2012) Updated with sliders & toggle button as per latest doc - arsu
 v0.8 (03-Oct-2012) Review comments closed by Petar - arsu
 v0.9 (12-Oct-2012) AutoVolume Range is changed to 0 to 7 - arsu
 v1.0 (30-Oct-2012) Updated to close SCR SW00100965 as per notes from Douglas
                    & Chris - aalangs, arsu
 v1.1 (31-Oct-2012) Added upadte from Alexander for hiding HUD tab - aalangs
 v1.2 (06-Nov-2012) Updated to - support removing the menu optons if 
                    Bose unavalable or not & removed diagnostic
                    Activation - aalangs
 v1.3 (08-Nov-2012) Added support for App Name in Status Bar - aalangs
 v1.4 (15-Nov-2012) Added volume display patch on Status Bar - aalangs
 v1.5 (20-Nov-2012) Updated to match new common design - aalangs
 v1.6 (26-Nov-2012) Updated to use slider methods as per new ListCtrl design - aalangs
 v1.7 (13-Dec-2012) Updated as per new UI spec changes - aalangs
 v1.8 (07-Jan-2013) Updated to use List2Ctrl - text truncation - aalangs
                    Removed VolumeTab - aalangs
 v1.9 (29-Jan-2013) Added support to remove auto volume when bose is detected
                    - amanthma
 v1.10(29-Jan-2013) Removed check for finalAdjustment in _listMainSlideCallback
                    - amanthma
 v1.10(08-Feb-2013) Added left button style as Go Back - amanthma
 v1.11(27-Feb-2013) Added context validity checks & helper functions - aalangs
 v1.12(21-Mar-2013) Volume requirement change SBN implementation - aalangs
 v1.13(10-Apr-2013) Clock Settings moved to Clock Tab - amanthma
 v1.14(12-Apr-2013) Support removal of HUD tab using shared data - aalangs
 v1.15(19-Apr-2013) Update gui audiosettings app to use string ids of common 
                    dictionary - 3.80 (latest) - aalangs
 v1.16(13-May-2013) Support removal of HUD tab using shared data corrections - aalangs
 v1.17(13-May-2013) Implement Global GoBack - aalangs
 v1.18(15-May-2013) Correction added to HUDStatus check - aalangs
 v1.19(22-May-2013) Convert Amplifier Volume to String when sending to sbnctrl - aalangs
 v1.20(31-May-2013) use registered and trademark symbols for Bose features - aalangs
 v1.21(05-June-2013) GUI App must specify tabsGroup - aalangs
 v1.22(07-June-2013) Use string ids for left and right labels instead of just strings - aalangs
 v1.23(17-June-2013) Max Volume on the GUI is set to 63 instead of 64 for SBNs - aalangs
 v1.24(18-June-2013) GUI_AUDIOSETTINGS Truncation Ideation Updates - aalangs
 v1.25(08-July-2013) Changed the list item style for Fade and Balance to pivot - aalangs
 v1.25(22-July-2013) Updated toggle API for styleOnOff - aalangs
 v1.26(26-July-2013) Updated to show tick marks on sliders - aalangs
 v1.27(26-July-2013) Updated to include missing conditions for Beep etc - aalangs
 v1.28(30-June-2014) Updated to include J03K Bose Configuration
 ________________________________________________________________________

 */

log.addSrcFile("audiosettingsApp.js", "audiosettings");

/*******************************************************************************
 * Start of Base App Implementation
 *
 * Code in this section should not be modified except for function names based
 * on the appname
 ******************************************************************************/

function audiosettingsApp(uiaId)
{
    log.debug("audiosettingsApp constructor called...");
    // Base application functionality is provided in a common location via this
    // call to baseApp.init().
    // See framework/js/BaseApp.js for details.
    baseApp.init(this, uiaId);
    // All feature-specific initialization is done in appInit()
}


/*******************************************************************************
 * Standard App Functions *
 ******************************************************************************/

/*
 * Called just after the app is instantiated by framework.
 */
audiosettingsApp.prototype.appInit = function()
{
    if (framework.debugMode)
    {
        utility.loadScript("apps/audiosettings/test/audiosettingsAppTest.js");
    }
    
    framework.subscribeToSharedData(this.uiaId, "vehsettings", "HudInstalled");
    
    //cache values, default is 0, if no response from MMUI
    this._cachedBassValue = 0;
    this._cachedTrebleValue = 0;
    this._cachedFaderValue = 0;
    this._cachedBalanceValue = 0;
    
    //Default OFF - Toggle Buttons
    this._cachedAudioCenterPoint = false;
    this._cachedAudioPilot = false;
    this._cachedBeepStatus = false;
    
    this._BeepValue = 2;
    this._centerPointValue = 2;
    this._audioPilotValue = 2;
    
    this._cachedAutoVolume = 0;
    
    this.cachedVolumeAmp = 0;
    this.cachedSource = null;
    
    //Status of Bose availability. Default -  not available
    this._boseAvailablityStatus = 0;
    // Status of HUD - default - not-installed - SW00129074
    this._HUDInstalledStatus = false;
    
    this._isListChanged = false;
    this._listLength = 6;
	
	
	this._cachedVehicleType = null;
    
    var AudioSettings_TMO1 = {
        tickIncrement : 1,
        showCenterMark : true,
        showNumbers : false,
    };
    
    var AudioSettings_TMO2 = {
        tickIncrement : 1,
        showCenterMark : false,
        showNumbers : true,
    };
    
    var AudioSettings_LO1 = {
        leftLabelText : "-6",
        centerLabelText : "0",
        rightLabelText : "+6",
    };
    
    var AudioSettings_LO2 = {
        leftLabelId : "Front",
        rightLabelId : "Back",
    };
    
    var AudioSettings_LO3 = {
        leftLabelId : "Left",
        rightLabelId : "Right",
    };
    
    var AudioSettings_LO4 = {
        leftLabelId : "common.Off",
        rightLabelId : "",
    };
    
    
    var items = [];
    
    items.push(
        { itemStyle:"style12", hasCaret:false, pivot:true, min:-6, max:6, value:this._cachedBassValue, increment:1, showTickMarks:true, tickMarkObject:AudioSettings_TMO1, showLabels:true, labelObject:AudioSettings_LO1, appData:"SetAudioBass", text1Id : "Bass" },
        { itemStyle:"style12", hasCaret:false, pivot:true, min:-6, max:6, value:this._cachedTrebleValue, increment:1, showTickMarks:true, tickMarkObject:AudioSettings_TMO1, showLabels:true, labelObject:AudioSettings_LO1, appData:"SetAudioTreble", text1Id : "Treble" },
        { itemStyle:"style12", hasCaret:false, pivot:true, min:-8, max:8, value:this._cachedFaderValue, increment:1, showTickMarks:false, tickMarkObject:"", showLabels:true, labelObject:AudioSettings_LO2, appData:"SetAudioFader", text1Id : "Fade" },
        { itemStyle:"style12", hasCaret:false, pivot:true, min:-8, max:8, value:this._cachedBalanceValue, increment:1, showTickMarks:false, tickMarkObject:"", showLabels:true, labelObject:AudioSettings_LO3, appData:"SetAudioBalance", text1Id : "Balance" },
        { itemStyle:"styleOnOff", appData:"SetAudioCenterpoint", text1Id : "CenterPoint", hasCaret : false, value:this._centerPointValue }
    );
    
    // Check if the region is Japan or other
    if (framework.localize.getRegion() === framework.localize.REGIONS.Japan)
    {
        items.push(
            { itemStyle:"styleOnOff", appData:"SetAudioAudioPilot", text1Id : "AudioPilotJPN", hasCaret : false, value:this._audioPilotValue },
            { itemStyle:"styleOnOff", appData:"SetBeepOnOff", text1Id : "Beep", hasCaret : false, value:this._BeepValue }
        );
    }
    else
    {
        items.push(
            { itemStyle:"styleOnOff", appData:"SetAudioAudioPilot", text1Id : "AudioPilot", hasCaret : false, value:this._audioPilotValue},
            { itemStyle:"styleOnOff", appData:"SetBeepOnOff", text1Id : "Beep", hasCaret : false, value:this._BeepValue }
        );
    }

    //SoundTab Datalist
    this._SoundTabDataList = {
        itemCountKnown : true,
        itemCount : items.length,
        items: items
    };
    
    //SoundTab Datalist, if Bose is not available
    this._SoundTabDataListWithNoBose = {
        itemCountKnown : true,
        itemCount : 6,
        items: [
            { itemStyle:"style12", hasCaret:false, pivot:true, min:-6, max:6, value:this._cachedBassValue, increment:1, showTickMarks:true, tickMarkObject:AudioSettings_TMO1, showLabels:true, labelObject:AudioSettings_LO1, appData:"SetAudioBass", text1Id : "Bass" },
            { itemStyle:"style12", hasCaret:false, pivot:true, min:-6, max:6, value:this._cachedTrebleValue, increment:1, showTickMarks:true, tickMarkObject:AudioSettings_TMO1, showLabels:true, labelObject:AudioSettings_LO1, appData:"SetAudioTreble", text1Id : "Treble" },
            { itemStyle:"style12", hasCaret:false, pivot:true, min:-8, max:8, value:this._cachedFaderValue, increment:1, showTickMarks:false, tickMarkObject:"", showLabels:true, labelObject:AudioSettings_LO2, appData:"SetAudioFader", text1Id : "Fade" },
            { itemStyle:"style12", hasCaret:false, pivot:true, min:-8, max:8, value:this._cachedBalanceValue, increment:1, showTickMarks:false, tickMarkObject:"", showLabels:true, labelObject:AudioSettings_LO3, appData:"SetAudioBalance", text1Id : "Balance" },
            { itemStyle:'style12', hasCaret:false, pivot:false, min:0, max:7, value:this._cachedAutoVolume, increment:1, showTickMarks:true, tickMarkObject:AudioSettings_TMO2, showLabels:false, labelObject:"", appData:'SetAudioAutoVolume', text1Id : "AutoVolume" },
            { itemStyle:"styleOnOff", appData:"SetBeepOnOff", text1Id : "Beep", hasCaret : false, value:2 }
        ]
    };
	
	
	//J12 Vehicle Type
	 var itemsJ12 = [];
    
    itemsJ12.push(
        { itemStyle:"style12", hasCaret:false, pivot:true, min:-6, max:6, value:this._cachedBassValue, increment:1, showTickMarks:true, tickMarkObject:AudioSettings_TMO1, showLabels:true, labelObject:AudioSettings_LO1, appData:"SetAudioBass", text1Id : "Bass" },
        { itemStyle:"style12", hasCaret:false, pivot:true, min:-6, max:6, value:this._cachedTrebleValue, increment:1, showTickMarks:true, tickMarkObject:AudioSettings_TMO1, showLabels:true, labelObject:AudioSettings_LO1, appData:"SetAudioTreble", text1Id : "Treble" },
        { itemStyle:"style12", hasCaret:false, pivot:true, min:-8, max:8, value:this._cachedFaderValue, increment:1, showTickMarks:false, tickMarkObject:"", showLabels:true, labelObject:AudioSettings_LO2, appData:"SetAudioFader", text1Id : "Fade" },
        { itemStyle:"style12", hasCaret:false, pivot:true, min:-8, max:8, value:this._cachedBalanceValue, increment:1, showTickMarks:false, tickMarkObject:"", showLabels:true, labelObject:AudioSettings_LO3, appData:"SetAudioBalance", text1Id : "Balance" }
    );
    
    // Check if the region is Japan or other
    if (framework.localize.getRegion() === framework.localize.REGIONS.Japan)
    {
        itemsJ12.push(
            { itemStyle:"styleOnOff", appData:"SetAudioAudioPilot", text1Id : "AudioPilotJPN", hasCaret : false, value:this._audioPilotValue },
            { itemStyle:"styleOnOff", appData:"SetBeepOnOff", text1Id : "Beep", hasCaret : false, value:this._BeepValue }
        );
    }
    else
    {
        itemsJ12.push(
            { itemStyle:"styleOnOff", appData:"SetAudioAudioPilot", text1Id : "AudioPilot", hasCaret : false, value:this._audioPilotValue},
            { itemStyle:"styleOnOff", appData:"SetBeepOnOff", text1Id : "Beep", hasCaret : false, value:this._BeepValue }
        );
    }

    //SoundTab Datalist
    this._SoundTabDataListForJ12 = {
        itemCountKnown : true,
        itemCount : itemsJ12.length,
        items: itemsJ12
    };


    this.tabClick = this._buttonClickCallback.bind(this);

    //Tabs Config
    this._tabsConfig = 
    [
        {
            "selectCallback" : this.tabClick,
            "label"         : null,
            "labelId"       : "common.HUDTab",
            "subMap"        : null,
            "tabStyle" : "tabsStyle2",
            "appData" : "HUD"
        },
        {
            "selectCallback" : this.tabClick,
            "label"         : null,
            "labelId"       : "common.DisplayTab",
            "subMap"        : null,
            "tabStyle" : "tabsStyle2",
            "appData" : "Display"
        },
        {
            "selectCallback" : this.tabClick,
            "label"         : null,
            "labelId"       : "Safety",
            "subMap"        : null,
            "tabStyle" : "tabsStyle2",
            "appData" : "Safety"
        },
        {
            "selectCallback" : this.tabClick,
            "label"         : null,
            "labelId"       : "common.SoundTab",
            "subMap"        : null,
            "tabStyle" : "tabsStyle2",
            "appData" : "Sound" 
        },
        {
            "selectCallback" : this.tabClick,
            "label"         : null,
            "labelId"       : "Clock",
            "subMap"        : null,
            "tabStyle" : "tabsStyle2",
            "appData" : "Clock" 
        },
        {
            "selectCallback" : this.tabClick,
            "label"         : null,
            "labelId"       : "common.VehicleTab",
            "subMap"        : null,
            "tabStyle" : "tabsStyle2",
            "appData" : "Vehicle"
        },
        {
            "selectCallback" : this.tabClick,
            "label"         : null,
            "labelId"       : "common.DevicesTab",
            "subMap"        : null,
            "tabStyle" : "tabsStyle2",
            "appData" : "Devices"
        },
        {
            "selectCallback" : this.tabClick,
            "label"         : null,
            "labelId"       : "common.SystemTab",
            "subMap"        : null,
            "tabStyle" : "tabsStyle2",
            "appData" : "System"
        }
    ]

    this._tabsConfigNoHUD = 
    [ 
        {
            "selectCallback" : this.tabClick,
            "label"         : null,
            "labelId"       : "common.DisplayTab",
            "subMap"        : null,
            "tabStyle" : "tabsStyle2",
            "appData" : "Display"
        },
        {
            "selectCallback" : this.tabClick,
            "label"         : null,
            "labelId"       : "Safety",
            "subMap"        : null,
            "tabStyle" : "tabsStyle2",
            "appData" : "Safety"
        },
        {
            "selectCallback" : this.tabClick,
            "label"         : null,
            "labelId"       : "common.SoundTab",
            "subMap"        : null,
            "tabStyle" : "tabsStyle2",
            "appData" : "Sound" 
        },
        {
            "selectCallback" : this.tabClick,
            "label"         : null,
            "labelId"       : "Clock",
            "subMap"        : null,
            "tabStyle" : "tabsStyle2",
            "appData" : "Clock" 
        },
        {
            "selectCallback" : this.tabClick,
            "label"         : null,
            "labelId"       : "common.VehicleTab",
            "subMap"        : null,
            "tabStyle" : "tabsStyle2",
            "appData" : "Vehicle"
        },
        {
            "selectCallback" : this.tabClick,
            "label"         : null,
            "labelId"       : "common.DevicesTab",
            "subMap"        : null,
            "tabStyle" : "tabsStyle2",
            "appData" : "Devices"
        },
        {
            "selectCallback" : this.tabClick,
            "label"         : null,
            "labelId"       : "common.SystemTab",
            "subMap"        : null,
            "tabStyle" : "tabsStyle2",
            "appData" : "System"
        }
    ]


    // context table
    // @formatter:off
    this._contextTable = {
        //SoundTab Context
        "SoundTab" : {
            "template" : "List2Tmplt",
            "sbNameId" : "Settings",
            "controlProperties": {
                "List2Ctrl" : {
                    "dataList": this._SoundTabDataList,
                    smallItemText : true,
                    titleConfiguration : "tabsTitle",
                    tabsButtonConfig : {"style":"tabsStyle2", "defaultSelectCallback":null, "tabsConfig": "", "tabsGroup":"settings"},
                    numberedList : false,
                    selectCallback : this._listItemClickCallback.bind(this),
                    slideCallback : this._listMainSlideCallback.bind(this) // this is called when an slider is dragged 
                } // end of properties for "ListCtrl"
            }, // end of list of controlProperties
            "leftBtnStyle": "goBack",
            "contextInFunction" : this._SoundTabCtxtIn.bind(this),
            "readyFunction" : this._SoundTabCtxtTmpltReadyToDisplay.bind(this),
        } // end of "SoundTab"
    };
    // end of this._contextTable
    //@formatter:on

    //message table
    //@formatter:off
    this._messageTable =
    {
        "BassSetting" : this._BassStatusMsgHandler.bind(this),
        "TrebleSetting" : this._TrebleStatusMsgHandler.bind(this),
        "FaderSetting" : this._FaderStatusMsgHandler.bind(this),
        "BalanceSetting" : this._BalanceStatusMsgHandler.bind(this),
        "AutoVolumeSetting" : this._AutoVolumeStatusMsgHandler.bind(this),
        "CenterPointSetting" : this._AudioCenterPointStatusMsgHandler.bind(this),
        "AudioPilotSetting" : this._AudioAutoPilotStatusMsgHandler.bind(this),
        "BeepSettings" : this._BeepStatusMsgHandler.bind(this),
        //Bose avaialble or not msg
        "BoseAvailable" : this._BoseAvailableMsgHandler.bind(this),
        //Volume Display on SBN
        "AmplifierVolumeSetting" : this._AmplifierVolumeSettingMsgHandler.bind(this),
    };   // end of this._messageTable

    // @formatter:on
}


/**************************
 * General App Functions
 **************************/

audiosettingsApp.prototype.sharedDataChanged = function(uiaId, name, value)
{
    log.debug("In sharedDataChanged.." + uiaId + "name.." + name + "value.." + value);
    
    this._HUDInstalledStatus = value;
    
    if (uiaId == "vehsettings" && name == "HudInstalled")
    {
        if(!value)
        {
            this._contextTable.SoundTab.controlProperties.List2Ctrl.tabsButtonConfig.currentlySelectedTab = 2;
            this._contextTable.SoundTab.controlProperties.List2Ctrl.tabsButtonConfig.numTabs = 7;
            this._contextTable.SoundTab.controlProperties.List2Ctrl.tabsButtonConfig.tabsConfig = this._tabsConfigNoHUD; 
        }
        else
        {
            this._contextTable.SoundTab.controlProperties.List2Ctrl.tabsButtonConfig.currentlySelectedTab = 3;
            this._contextTable.SoundTab.controlProperties.List2Ctrl.tabsButtonConfig.numTabs = 8;
            this._contextTable.SoundTab.controlProperties.List2Ctrl.tabsButtonConfig.tabsConfig = this._tabsConfig; 
        }
    }
}

/**************************
 * Context handlers
 **************************/

//Context in function called before the template is instantiated
audiosettingsApp.prototype._SoundTabCtxtIn = function()
{
   var HUDStatus = framework.getSharedData("vehsettings", "HudInstalled");;
   
   log.debug("In _SoundTabCtxtIn..._HUDInstalledStatus.." + this._HUDInstalledStatus + "HUDStatus.." + HUDStatus); 
   
    if(HUDStatus === true || HUDStatus === false)
    {
       this._HUDInstalledStatus = HUDStatus;
    }
    
    log.debug("this._HUDInstalledStatus.." + this._HUDInstalledStatus);
    
    if(this._HUDInstalledStatus === false)
    {
        this._contextTable.SoundTab.controlProperties.List2Ctrl.tabsButtonConfig.currentlySelectedTab = 2; 
        this._contextTable.SoundTab.controlProperties.List2Ctrl.tabsButtonConfig.numTabs = 7;
        this._contextTable.SoundTab.controlProperties.List2Ctrl.tabsButtonConfig.tabsConfig = this._tabsConfigNoHUD; 
    }
    else if(this._HUDInstalledStatus === true)
    {
        this._contextTable.SoundTab.controlProperties.List2Ctrl.tabsButtonConfig.currentlySelectedTab = 3;
        this._contextTable.SoundTab.controlProperties.List2Ctrl.tabsButtonConfig.numTabs = 8;
        log.info(this._contextTable.SoundTab.controlProperties.List2Ctrl.tabsButtonConfig.numTabs);
        this._contextTable.SoundTab.controlProperties.List2Ctrl.tabsButtonConfig.tabsConfig = this._tabsConfig; 
    } 
}
 
//SoundTab Context Handler
audiosettingsApp.prototype._SoundTabCtxtTmpltReadyToDisplay = function(readyParams)
{
    var datalist = this._SoundTabDataList; 
    
    log.debug("In _SoundTabCtxtTmpltReadyToDisplay..");
	this._updateDataList();

    if (readyParams)
    {
        if(this._isListChanged === true)
        {
            readyParams.skipRestore = true;
            log.debug("skipRestore??..." + readyParams.skipRestore);
        }
    }
}


/**************************
 * Message handlers
 **************************/

// BassStatusMsgHandler
audiosettingsApp.prototype._BassStatusMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.audioBass != null)
    {
        this._cachedBassValue = msg.params.payload.audioBass;

        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "SoundTab")
        {
            // Set the slider value with actual value
            this._updateSlider(0, this._cachedBassValue)
        }
    }
}

// TrebleStatusMsgHandler
audiosettingsApp.prototype._TrebleStatusMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.audioTreble != null)
    {
        this._cachedTrebleValue = msg.params.payload.audioTreble;
        
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "SoundTab")
        {
            // Set the slider value with actual value
            this._updateSlider(1, this._cachedTrebleValue)
        }
    }
}

// FaderStatusMsgHandler
audiosettingsApp.prototype._FaderStatusMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.audioFader != null)
    {
        this._cachedFaderValue = msg.params.payload.audioFader;
       
       if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "SoundTab")
        {
            // Set the slider value with actual value
            this._updateSlider(2, this._cachedFaderValue)
        }
    }
}

// BalanceStatusMsgHandler
audiosettingsApp.prototype._BalanceStatusMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.audioBalance != null)
    {
        this._cachedBalanceValue  = msg.params.payload.audioBalance;
        
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "SoundTab")
        {
            // Set the slider value with actual value
            log.info("Cached Balance value is: " + this._cachedBalanceValue);
			this._updateSlider(3, this._cachedBalanceValue)
        }
    }
}

// AutoVolumeStatusMsgHandler
audiosettingsApp.prototype._AutoVolumeStatusMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.audioAutoVolume != null)
    {
        this._cachedAutoVolume = msg.params.payload.audioAutoVolume;
        
       if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "SoundTab")
        {
            // Set the slider value with actual value
            this._updateSlider(4, this._cachedAutoVolume)
        }
    }
}

// AudioCenterPointStatusMsgHandler
audiosettingsApp.prototype._AudioCenterPointStatusMsgHandler = function(msg)
{
    if (msg.params && msg.params.payload && msg.params.payload.audioCenterPoint != null)
    {
        this._cachedAudioCenterPoint = msg.params.payload.audioCenterPoint;
        
        if (this._cachedAudioCenterPoint === true)
        {
            this._centerPointValue = 1;
        }
        else if(this._cachedAudioCenterPoint === false)
        {
            this._centerPointValue = 2;
        }
        
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "SoundTab")
        {
            if(this._boseAvailablityStatus === 0)
            {
                log.info("No Audio Center Point support");
            }
            else if(this._boseAvailablityStatus === 1)
            {
                // Set the toggle button value with actual value
				this._updateToggleButton(this._IndexOfCenterPoint, this._centerPointValue);
            }
        }
    }
}

// AudioAutoPilotStatusMsgHandler
audiosettingsApp.prototype._AudioAutoPilotStatusMsgHandler = function(msg)
{
    if (msg.params && msg.params.payload && msg.params.payload.audioAudioPilot != null)
    {
        this._cachedAudioPilot = msg.params.payload.audioAudioPilot;
        
        if (this._cachedAudioPilot === true)
        {
            this._audioPilotValue = 1;
        }
        else if(this._cachedAudioPilot === false)
        {
           this._audioPilotValue = 2;
        }
        
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "SoundTab")
        {
            if(this._boseAvailablityStatus === 0)
            {
                log.info("No Audio Pilot support");
            }
            else if(this._boseAvailablityStatus === 1)
            {
				this._updateToggleButton(this._IndexOfAudioPilot, this._audioPilotValue);
            }
        }
    }
}


// BeepStatusMsgHandler
audiosettingsApp.prototype._BeepStatusMsgHandler = function(msg)
{
    if (msg.params && msg.params.payload && msg.params.payload.enableBeepOnOff !=null)
    {
        this._cachedBeepStatus = msg.params.payload.enableBeepOnOff;
        
             
        if (this._cachedBeepStatus === true)
        {
            this._BeepValue = 1;
        }
        else if (this._cachedBeepStatus === false)
        {
            this._BeepValue = 2;
        }

        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "SoundTab")
        {
			this._updateToggleButton(this._IndexOfBeep, this._BeepValue);
        }
    }
}

// Display volume on status bar
audiosettingsApp.prototype._AmplifierVolumeSettingMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.volumeAmplifier !=null)
    {
        this.cachedVolumeAmp = msg.params.payload.volumeAmplifier;
        //Convert to string as control expects string
        this.cachedVolumeAmp = this.cachedVolumeAmp.toString();
        
        if(msg.params.payload.source)
        {
            this.cachedSource = msg.params.payload.source;
        }
        
        var sbnConfig = null;
        var min = 0;
        var max = 63;
		var max_navi = 62;

        switch(this.cachedSource)
        {
            case "TV" :
            case "DVD" :
            case "AUX" :
            case "VOLUME" :
                sbnConfig = {
                    sbnStyle : "Style03",
                    hasManeuverIcon : null,
                    hasManeuverDistance : null,
                    appData : null,
                    imagePath1 : "IcnSbnEnt.png",
                    text1 : this.cachedVolumeAmp,
                    meter : {"meterType" : "audio01", "min" : min, "max" : max, "currentValue" : this.cachedVolumeAmp}
                };
                break;
            case "BTHF" : 
                sbnConfig = {
                    sbnStyle : "Style03",
                    hasManeuverIcon : null,
                    hasManeuverDistance : null,
                    appData : null,
                    imagePath1 : "IcnListBtConnType_Phone.png",
                    imagePath2 : "",
                    text1 : this.cachedVolumeAmp,
                    meter : {"meterType" : "audio01", "min" : min, "max" : max, "currentValue" : this.cachedVolumeAmp}
                };
                break;
            case "NAVI" :
			var naviAudio = this.cachedVolumeAmp;
				if(naviAudio<1)
				{
					naviAudio = 1;
				}
                sbnConfig = {
                    sbnStyle : "Style03",
                    hasManeuverIcon : null,
                    hasManeuverDistance : null,
                    appData : null,
                    imagePath1 : "IcnTabNav_En.png",
                    imagePath2 : "",
                    text1 : (naviAudio-1)+"",
                    meter : {"meterType" : "audio01", "min" : min, "max" : max_navi, "currentValue" : naviAudio-1}
                };
                break;
            case "RINGTONE" :
                sbnConfig = {
                    sbnStyle : "Style03",
                    hasManeuverIcon : null,
                    hasManeuverDistance : null,
                    appData : null,
                    imagePath1 : "IcnUmpMic.png",
                    imagePath2 : "",
                    text1 : this.cachedVolumeAmp,
                    meter : {"meterType" : "audio01", "min" : min, "max" : max, "currentValue" : this.cachedVolumeAmp}
                };
                break;
            default :
                break;
        }
        framework.common.startTimedSbn(this.uiaId, "AmplifierVolumeSetting", "volumeStatus", sbnConfig);
    }
}

// BoseAvailableMsgHandler
audiosettingsApp.prototype._BoseAvailableMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.status != null)
    {
        this._boseAvailablityStatus = msg.params.payload.status;
		
		this._updateDataList();
    }
}


/*******************************************************************************
 * Control callbacks
 ******************************************************************************/
// This is called every time an item is selected
audiosettingsApp.prototype._listItemClickCallback = function(listCtrlObj, appData, params)
{
    log.debug("_listItemClickCallback");
    
    switch(appData)
    {
        case "SetAudioCenterpoint" :
            var extraData = params.additionalData;
            var cachedCenterpoint = null;
            if (extraData === 1)
            {
                cachedCenterpoint = true;
            }
            else if (extraData === 2)
            {
                cachedCenterpoint = false;
            }
            if(cachedCenterpoint != null)
            {
                framework.sendEventToMmui(this.uiaId, appData,{ payload : { audioCenterpoint : cachedCenterpoint }});
            }
            break;
        case "SetAudioAudioPilot" :
            var extraData = params.additionalData;
            var cachedAudiopilot = null;
            if (extraData === 1)
            {
                cachedAudiopilot = true;
            }
            else if (extraData === 2)
            {
                cachedAudiopilot = false;
            }
            if(cachedAudiopilot != null)
            {
                framework.sendEventToMmui(this.uiaId, appData,{ payload : { audioAudioPilot : cachedAudiopilot }});
            }
            break;
        case "SetBeepOnOff" :
            var extraData = params.additionalData;
            var cachedBeep = null;
            if (extraData  === 1)
            {
                cachedBeep = true;
            }
            else if (extraData === 2)
            {
                cachedBeep = false;
            }
            if(cachedBeep != null)
            {
                framework.sendEventToMmui(this.uiaId, appData,{ payload : { enableBeepOnOff : cachedBeep }});
            }
            break;
        default:
            break;
    }
}

// This is called every time a slider is dragged 
audiosettingsApp.prototype._listMainSlideCallback = function(listCtrlObj, appData, params)
{
    log.debug("_listMainSlideCallback.." + appData);
    
    var value = params.value;
    var level = parseInt(value);
    var finalAdjustment = params.finalAdjustment;
    
    switch(appData)
    {
        case "SetAudioBass" :
            if (!isNaN(level))
            {  
                framework.sendEventToMmui(this.uiaId, appData, {payload : {audioBass : level }});
            }
            break;
        case "SetAudioTreble" :
            if (!isNaN(level))
            {
                framework.sendEventToMmui(this.uiaId, appData, {payload : {audioTreble : level }});
            }
            break;
        case "SetAudioFader" :
            if (!isNaN(level))
            {
                framework.sendEventToMmui(this.uiaId, appData, { payload : { audioFader : level }});
            }
            break;
        case "SetAudioBalance" :
            if (!isNaN(level))
            {
                framework.sendEventToMmui(this.uiaId, appData, { payload : { audioBalance : level }});
            }
            log.info("Audio balance sent is: "+level);
			break;
        case "SetAudioAutoVolume" :
            if (!isNaN(level))
            {
                framework.sendEventToMmui(this.uiaId, appData, { payload : { audioAutoVolume : level }});
            }
            break;
        default:
            break;
    }
}


// Tabs control click callback
audiosettingsApp.prototype._buttonClickCallback = function(listCtrlObj, appData, params)
{
    log.debug(" _buttonClickCallback  called...", appData);
    framework.sendEventToMmui("Common", "Global.IntentSettingsTab",{payload:{settingsTab:appData}}); // Changed event name as per latest update in common MMUI (common change)
}

/**************************
 * Helper functions
 **************************/
 
// Helper function for listcontrol item update
audiosettingsApp.prototype._populateListCtrl = function(dataList)
{
    log.debug("In _populateListCtrl.." + this._listLength + "dataList.." + dataList.items.length); 
    
    if(dataList.items.length !=  this._listLength)
    {
        this._isListChanged = true;
        this._listLength = dataList.items.length;
    }
    else
    {
        this._isListChanged = false;
    }
    
    log.debug("this._isListChanged.." + this._isListChanged);
    
	if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "SoundTab")
    {
        var tmplt = this._currentContextTemplate; 
        var length = dataList.itemCount;
        tmplt.list2Ctrl.setDataList(dataList); // set the data list as item count is reduced / added now
        tmplt.list2Ctrl.updateItems(0, length - 1);
    }
	else
	{
		log.info("Either no context loaded or Context is not SoundTab");
	}
} 

// Helper function for slider update
audiosettingsApp.prototype._updateSlider = function(index, value)
{
    if(this._currentContextTemplate)
    {
        var tmplt = this._currentContextTemplate;
        if(index === 4)
        {
            // store the value of item for data list, when Bose is not available
            this._SoundTabDataListWithNoBose.items[index].value = value;
        }
        else
        {
            // store the value of item for data list, when Bose is available
            this._SoundTabDataList.items[index].value = value;
            // store the value of item for data list, when Bose is not available
            this._SoundTabDataListWithNoBose.items[index].value = value;
        }        
        // Set the slider value with actual value
        tmplt.list2Ctrl.setSliderValue(index, value);
    }
}

// Helper function for toggle update
audiosettingsApp.prototype._updateToggleButton = function(index, value)
{
    log.info("In _updateToggleButton" + value + index);
    
    if(this._currentContextTemplate)
    {
        var tmplt = this._currentContextTemplate; 
        
        if(this._boseAvailablityStatus === 1)
        {
            if(index === 4 || index === 5 || index === 6)
            {
                this._SoundTabDataList.items[index].value = value;
            }
            else
            {
                log.warn("No Toggle buttons");
            }
        }
        else if(this._boseAvailablityStatus === 0)
        {
            if(index === 5)
            {
                this._SoundTabDataListWithNoBose.items[index].value = value;
            }
            else
            {
                log.warn("No Toggle buttons");
            }
        }
        else
        {
            log.warn("Invalid Bose Status");
        }
        // Set the slider value with actual value
        tmplt.list2Ctrl.setToggleValue(index, value);
    }
}

//Helper Function to create datalist for SoundTab as per the VehicleModelType
audiosettingsApp.prototype._updateDataList = function()
{
	this._cachedVehicleType = framework.getSharedData("syssettings","VehicleType");

	log.info("In updateDataList vehicle type = .. "+this._cachedVehicleType + " , Bose Status : "+this._boseAvailablityStatus);
	if(this._cachedVehicleType =="SETTINGS_VehicleModelType_J03A" || this._cachedVehicleType =="SETTINGS_VehicleModelType_J03K" 
		|| this._cachedVehicleType =="SETTINGS_VehicleModelType_J03J" || this._cachedVehicleType =="SETTINGS_VehicleModelType_J03E" 
		|| this._cachedVehicleType =="SETTINGS_VehicleModelType_J03G" || this._cachedVehicleType =="SETTINGS_VehicleModelType_J03F"
		|| this._cachedVehicleType =="SETTINGS_VehicleModelType_J03W" || this._cachedVehicleType =="SETTINGS_VehicleModelType_J03AE")
	{
		this._IndexOfCenterPoint = -1; //-1 because Center Point is Invalid data for below datalist
		this._IndexOfAudioPilot = -1; //-1 because Audio Point is Invalid data for below datalist
		this._IndexOfBeep = 5;
		// For J03 platform - display will be same for BoseAMP available or not .
		this._SoundTabDataListWithNoBose.items[0].value = this._cachedBassValue;
        this._SoundTabDataListWithNoBose.items[1].value = this._cachedTrebleValue;
        this._SoundTabDataListWithNoBose.items[2].value = this._cachedFaderValue;
        this._SoundTabDataListWithNoBose.items[3].value = this._cachedBalanceValue;
        this._SoundTabDataListWithNoBose.items[4].value = this._cachedAutoVolume; 
        this._SoundTabDataListWithNoBose.items[5].value = this._BeepValue;
        
        this._populateListCtrl(this._SoundTabDataListWithNoBose);
	
	
	}
	else if(this._cachedVehicleType =="SETTINGS_VehicleModelType_J12" || this._cachedVehicleType =="SETTINGS_VehicleModelType_J12AE" || this._cachedVehicleType =="SETTINGS_VehicleModelType_J12F" || this._cachedVehicleType =="SETTINGS_VehicleModelType_J12A") // To be confirmed
	{
		// if Bose is not avaialble, then update list items with new data list
		if(this._boseAvailablityStatus === 0)
		{
			this._IndexOfCenterPoint = -1; //-1 because Center Point is Invalid data for below datalist
			this._IndexOfAudioPilot = -1; //-1 because Audio Point is Invalid data for below datalist
			this._IndexOfBeep = 5;
			
			//SoundTab Datalist, if Bose is not available : update the cached values
			this._SoundTabDataListWithNoBose.items[0].value = this._cachedBassValue;
			this._SoundTabDataListWithNoBose.items[1].value = this._cachedTrebleValue;
			this._SoundTabDataListWithNoBose.items[2].value = this._cachedFaderValue;
			this._SoundTabDataListWithNoBose.items[3].value = this._cachedBalanceValue;
			this._SoundTabDataListWithNoBose.items[4].value = this._cachedAutoVolume; 
			this._SoundTabDataListWithNoBose.items[5].value = this._BeepValue;
			
			this._populateListCtrl(this._SoundTabDataListWithNoBose);
		}
		else
		{
			this._IndexOfCenterPoint = -1; //-1 because Center Point is Invalid data for below datalist
			this._IndexOfAudioPilot = 4;
			this._IndexOfBeep = 5;
			
			//SoundTab Datalist, if Bose is available : update the cached values
			this._SoundTabDataListForJ12.items[0].value = this._cachedBassValue;
			this._SoundTabDataListForJ12.items[1].value = this._cachedTrebleValue;
			this._SoundTabDataListForJ12.items[2].value = this._cachedFaderValue;
			this._SoundTabDataListForJ12.items[3].value = this._cachedBalanceValue;
			this._SoundTabDataListForJ12.items[4].value = this._audioPilotValue;
			this._SoundTabDataListForJ12.items[5].value = this._BeepValue;
			
			this._populateListCtrl(this._SoundTabDataListForJ12);
		}
	
	}
	else
	{
	    // if Bose is not avaialble, then update list items with new data list
		if(this._boseAvailablityStatus === 0)
		{
			
			this._IndexOfCenterPoint = -1; //-1 because Center Point is Invalid data for below datalist
			this._IndexOfAudioPilot = -1; //-1 because Audio Point is Invalid data for below datalist
			this._IndexOfBeep = 5;
			//SoundTab Datalist, if Bose is not available : update the cached values
			this._SoundTabDataListWithNoBose.items[0].value = this._cachedBassValue;
			this._SoundTabDataListWithNoBose.items[1].value = this._cachedTrebleValue;
			this._SoundTabDataListWithNoBose.items[2].value = this._cachedFaderValue;
			this._SoundTabDataListWithNoBose.items[3].value = this._cachedBalanceValue;
			this._SoundTabDataListWithNoBose.items[4].value = this._cachedAutoVolume; 
			this._SoundTabDataListWithNoBose.items[5].value = this._BeepValue;
			
			this._populateListCtrl(this._SoundTabDataListWithNoBose);
		}
		else
		{
			this._IndexOfCenterPoint = 4;
			this._IndexOfAudioPilot = 5;
			this._IndexOfBeep = 6;
			
			//SoundTab Datalist, if Bose is available : update the cached values
			this._SoundTabDataList.items[0].value = this._cachedBassValue;
			this._SoundTabDataList.items[1].value = this._cachedTrebleValue;
			this._SoundTabDataList.items[2].value = this._cachedFaderValue;
			this._SoundTabDataList.items[3].value = this._cachedBalanceValue;
			this._SoundTabDataList.items[4].value = this._centerPointValue; 
			this._SoundTabDataList.items[5].value = this._audioPilotValue;
			this._SoundTabDataList.items[6].value = this._BeepValue;
			
			this._populateListCtrl(this._SoundTabDataList);
		}
	}
}

// Tell framework that audiosettings app has finished loading
framework.registerAppLoaded("audiosettings", null, true);