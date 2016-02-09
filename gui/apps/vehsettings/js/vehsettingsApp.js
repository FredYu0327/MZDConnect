
/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: vehsettingsApp.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: apopoval
 Date: 02.10.2012
 __________________________________________________________________________

 Description:   IHU GUI vehsettings App

 Revisions:
 v0.1 (02-Oct-2012) vehsettingsApp created for initial testing of active panel content (HUD Tab only)  
 v0.2 (08-Oct-2012) Added message handlers according to the latest json file (HUD Tab only)  
 v0.3 (15-Oct-2012) tabsConfig appData and style changed (preview image), Range and increment of sliders is set 
 v0.4 (17-Oct-2012) HudTab renamed to HUDTab, empty tabs removed from tabctrl, removed slideCallback from sliders
 v0.5 (18-Oct-2012) +VehicleSettingsTab
 v0.6 (19-Oct-2012) disable/enable controls on atSpeed msg and depending on other control's value, Sound and Volume tabs added
 v0.7 (23-Oct-2012) Tabs appdata changed
 v0.8 (24-Oct-2012) MIDisplay renamed to MultiInfoDisplay
 v0.9 (29-Oct-2012) Removed slideEndCallback
 v1.1 (31-Oct-2012) Added HudInstalled message handling, added missing contexts
 v1.2 (01-Nov-2012) Added inSpeed message handling, added missing contexts
 v1.3 (02-Nov-2012) AutoDoorLockRelockTime renamed to AutoRelockTimer, inSpeed updated
 v1.4 (05-Nov-2012) Added {vehicleSetting}_Installed message handlers
 v1.5 (09-Nov-2012) Added many missing message handlers
 v1.6 (13-Nov-2012) Added BSM_Volume, RVM_Volume, localization, inSpeed replaced with AtSpeed and NoSpeed
 v1.7 (19-Nov-2012) Added LDWS reset and LDWSmode
 v1.8 (20-Nov-2012) _tabsConfig changedvv 
 v1.9 (26-Nov-2012) Added range labels to Position and Intensity sliders
 v2.0 (27-Nov-2012) KeyboardCtrl changes, added status bar text indicating where you are, switched from "Global.SelectSettingsTab" to "Global.IntentSettingsTab"
 v2.1 (29-Nov-2012) Added RSSSensitivity slider ranges
 v2.2 (06-Dec-2012) Added dynamic showing/hiding Buzzer settings in LDWS ctxt
 v2.3 (07-Dec-2012) Using LaneDepartureWarningSystem RVMBuzzerVolume and BSMBuzzerVolume textIDs
 v2.4 (11-Dec-2012) Removed MultiInfoDisplay from VehicleSettingsTab due to 3.8 UI specs
 v2.5 (02-Jan-2013) Changed text labels for DRSS and SBS
 v2.6 (08-Jan-2013) Started implementing UI Specs v3.55
 v2.7 (09-Jan-2013) HUDtab implemented according UI Specs v3.55
 v2.7 (10-Jan-2013) VehicleSettingsTab implemented according UI Specs v3.55
 v2.8 (12-Jan-2013) Contexts and messages updated
 v2.9 (14-Jan-2013) UI Specs v3.55 updates
 v3.0 (15-Jan-2013) UI v3.55 stabilzed
 v3.1 (17-Jan-2013) Removed HUD Tilt control placeholder to match the new UI specs, DoorLockMode label on/off bugfix, Slider ranges updated, reset dialogs send global events
 v3.2 (18-Jan-2013) Removed obselete contexts and functions
 v3.3 (24-Jan-2013) SafetyTab issue fixed by setting all msg payload names to "evData"
 v3.4 (24-Jan-2013) SetAutoWiper renamed to SetRainSensingWiper, SetDRSSWarningSensitivity renamed to SetDRSSDistance, Added Set and GetDaytimeRunningLights, Golighting fixed
 v3.5 (25-Jan-2013) Message names matched to MMUI, removed obselete contexts and messages
 v3.6 (02-Feb-2013) Added off option in Keyless lock beep volume
 v3.7 (02-Feb-2013) Add SBSSCBS
 v3.8 (04-Feb-2013) Corrected "SetLDWSSound" to "SetBuzzerSetting".
 v3.9 (04-Feb-2013) Disable Vehicle Settings when ignition is off.
 v4.0 (04-Feb-2013) Added support for AutoTransmission in Door Lock Mode.
 v4.1 (05-Feb-2013) Added dynamic list handling in Lighting Context.
 v4.2 (11-Feb-2013) Added event id when brightness is auto mode
 v4.3 (11-Feb-2013) Added support for dynamic list in Turn & Safety Tab
 v4.3.1 (22-Feb-2013) LDWS Timing & Warning setting values corrected as per PFS(SW00108927)
 v4.3.2 (22-Feb-2013) Handled scenarios when both SBS & SCBS are installed
 v4.4 (25-Feb-2013) Handled Reset screens
 v4.5 (25-Feb-2013) Vehicle speed handling
 v4.6 (26-Feb-2013) Corrected message ids for HUD tab, added handler for calibration
 v4.7 (05-Mar-2013) Grey out settings based on public can bus unless ignition is on for 2 second
 v4.8 (06-Mar-2013) At speed handling
 v4.9 (07-Mar-2013) Correcting HUD tab message Id ans HUD Open/close behavior
 v5.0 (08-Mar-2013) Corrected handling of getAdjustedValueforDataListSafetyTab & 
                    getAdjustedValueforDataListLighting for boundary check
 v5.1 (08-Mar-2013) corrected slider style for brighness, height & calibration of HUD Tab
 v5.2 (20-Mar-2013) corrected handling of menu removable settings
 v5.3 (20-Mar-2013) Handling of HUD control available message
 v5.4 (20-Mar-2013) Handling initial values under radio button selection lists
 v5.5 (25-Mar-2013) Removed loading of deprecated controls causing GUI to crash.
 v5.6 (26-Mar-2013) Removal of reset option when all other setting entries have been removed for the context in focus.
 v5.7 (26-Mar-2013) Corrected to update the mode, warning distance & volume settings under SBS/SCBS settings.
 v5.8 (10-Apr-2013) Added support for Clock Tab
 v5.9 (16-Apr-2013) Added support for HUDInstalled shared data
 v6.0 (16-Apr-2013) Added support for CanStatus message shared data
 v6.1 (16-Apr-2013) Sending Ignition status to other GUI app
 v6.2 (17-Apr-2013) Support for speed restriction
_v7.0 (23-Apr-2013) Using string id's of common dictionary______________________________________________________________________________________
 v7.1 (24-Apr-2013) Updated atSpeed behaviour of the vehicle tab 
 v8.0 (9-May-2013) Updated HUD error message
 v8.1 (13-May-2013) Removal of HUD tab
 v8.2 (13-May-2013) Global Go back implementation.
 v9.1 (5-June-2013) Tabs group implementation
 v10.1(6-June-2013) Default options for the reset set to "No"
 v10.2(6-June-2013)sbNameId changed to settings inplace of Tooltip ICNUmpsettings
 v10.3(7-June-2013)voltage status message added for safety and vehicle tab enabling/disabling
 v10.4(7-June-2013)Door Lock Mode On/Off texts corrected
 v11.1(14-June-2013)HUD controlled allowed message's operation altered.
 v12.0(21-June-2013)Truncation issue fixed:small item text and new toggle behaviour added.
 v13.0(2-July-2013)Menuitemselectcallback's implementation changed as per the requirement of the latest common.
 v14.0(4-July-2013)Dialog3 implementation.
 v15.0(10-July-2013)Corrected loading meter in the Safety tab.
 v16.0(22-Aug-2013)removed speed restriction in HUD tab, warning speed is not supported in EU region for SBS & SBS/SCBS
 v16.1(27-Aug-2013)Corrected toggle behaviour
 v16.2(27-Aug-2013)Corrected toggle behaviour for LDWS
 v16.3(05-Sep-2013)Logic implemented in GUI to prevent two same messages from menu calls to the lower layer
 v16.4(24-Sep-2013)Corrected missing braces in getAdjustedValueForDataListDoorLock()
 v16.5(01-Oct-2013)Corrected label Ids under Door Locks for Unlock mode setting(SW00133928)
 v16.6(01-Oct-2013)Added checks in messagehandlers of installed messages to avoid menu flickering
 v16.7(07-Oct-2013)Initialized the default auto doorlock cache values to 0 and indentation corrections
 v16.8(27-June-2014) AutoDoorLock priority implementation ( AT6, AT5 and MT)
 v16.9(11-July-2014) Timing and Warning values corrected
 v17.0(11-July-2014) When 'Low' is clicked on LAS and LDWS screen for 'Vibration / Beep' value should go as 3 instead of 2
 v17.1(11-July-2014) Changes done for error 'Lane-KeepAssistSystem' string id not found in dictionary
 v17.2(6-Aug-2014) Changes done for Sensitivity string id in LAS screen depending on region and Intervention settings.
 v17.3(8-Aug-2014) On - Off display of Auto Door Lock Mode in Door Lock Settings corrected.
 v17.4(12-Aug-2014) Parking Sensor Indication added on Safety tab.
 v17.5(13-Aug-2014) LASEarly and LASLate strings used from dictionary for LAS screen.
 v17.6(27-Aug-2014) Switching Btw Sensitivity and Warning by Intervention Status in LAS.
 v17.7(10-Sep-2014) Speed restriction applied for CHLT screen
 v17.8(1-Nov-2014) Updated enabling of items for Ignition On while AtSpeed
*/


log.addSrcFile("vehsettingsApp.js", "vehsettings");

function vehsettingsApp(uiaId)
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
vehsettingsApp.prototype.appInit = function()
{
    log.debug("vehsettingsApp appInit  called...");
    
    if (framework.debugMode)
    {
        utility.loadScript("apps/vehsettings/test/vehsettingsAppTest.js");
    } 
    /* 
     * NOTE:
     * Every time a function is bound (using bind()), a new
     * function is created in memory. Whenever possible,
     * only bind the same function once and use reference.
     */
    this.statusArraySafetyTab = new Array();
    this.statusArrayVehicleTab = new Array();
    this.statusArrayTurn = new Array();
    this.statusArrayDoorLock = new Array();
    this.statusArray = new Array();
    this.listItemClick = this._menuItemSelectCallback.bind(this);
    this.listItemSlide = this._menuItemSlideCallback.bind(this); 
    this.dialogBtnClick = this._dialogDefaultSelectCallback.bind(this);
    this.tabClick = this._tabClickCallback.bind(this);
    this.populateListCtrl = this._populateListCtrl.bind(this);
     
    // Safety
    this._cachedDA = null;
	this._cachedPSI = null;
    // message cache HUD tab
    this._cachedHudOnOffStatus = null; 
    this._cachedHudTilt = null; 
    this._cachedHudAutoIntensityOnOff = null; 
    this._cachedHudIntensity = null; 
    this._cachedHudIntensityAuto = null;
    this._cachedHudCalibration = null;
    this._cachedHudTurnByTurn = null; 
    this._cachedHudError = 0;
    
    // message cache VehicleSettingsTab
    this._cachedBSMBuzzerVolume = null;
    this._cachedRVMBuzzerVolume = null;

    // message cache HeadlightOffTimer
    this._cachedHeadlightOffTimer = null; 
    
    this._cachedMID_MRCC = null;
    
    this._cachedDRSS_DRSS = null;
    this._cachedDRSS_DRSSSensitivity = null;
    
    this._cachedFOW_Warning = null;
    this._cachedFOW_Distance = null;
    this._cachedFOW_BuzzerVolume = null;
    
    this._latestValueHudNavigation = 2;
    this._latestValueTurnSignalIndicatorVolume = 1;
    this._latestValue3FlashTurnSignal = 2;
    this._latestValueAutoHeadlightSensitivity = 3;
    this._latestValueHeadlightOffTimer = 2;
    this._latestValueInteriorLightTimeoutDoorClosed = 2;
    this._latestValueAutoDoorLockMT = 3;
    this._latestValueAutoDoorLockAT = 5;
    this._latestValueAutoDoorLockAT6 = "AT6_Off";
    this._latestValueAutoDoorLock = 3;
    this._latestValueAutoRelockTimer = 2;
    this._latestValueKeylessLockBeepVol = 2;
    this._latestValueInteriorLightTimeoutDoorOpen = 2;
    this._latestValueHeadLightOnWarning = 1;
    this._latestValueHBC = 1;
    this._latestValueAHBC = 1;
    this._latestValueAFS = 1;
    this._latestValueCHLT = "CHL_120_SEC";
    this._latestValueLHL = "LHL_Off";
    this._latestValueLDWSTiming = 1;
    this._latestValueHudHeight = 0;
    this._latestValueHudBrightnessCalibration = 0;
    this._latestValueHudBrightness = 0;
    this._latestValueHudBrightnessControl = 1;
    this._latestValueRainSensingWiper = 2;
    this._cachedSBS_BrakeSupport = null;
    this._cachedSBS_Distance = null;
    this._cachedSBS_BuzzerVolume = null;
    this._cachedSBS_CityBrakeSystem = null;
    
    this._cachedHeadlight_HighBeamControll = null;
    this._cachedHeadlight_HBCSensitivity = null;
    this._cachedHeadlight_DaytimeLights = null;
    this._cachedHeadlight_HeadlightOnWaring = null;
    this._cachedHeadlight_HeadlightOffTimer = null;
    this._cachedHeadlight_AutoHeadlightsSensitivity = null;
    
    this._cachedAFS = null;
        
    this._cachedKeyless_WalkAwayLock = null;
    this._cachedKeyless_UnlockMode = null;
    this._cachedKeyless_ChimeVolume = null;
    
    this._cachedLDWS_SensitivityForWideRange = null;
    this._cachedLDWS_SensitivityWarningCancelation = null;
    this._cachedLDWS_BuzzerSetting = null;
    this._cachedLDWS_BuzzerVolume = null;
    this._cachedLAS_SoundVolume = null;
	this._cachedLAS_SoundVibrationVolume = null;
	this._cachedLAS_SounBeepVolume = null;
	this._cachedLAS_SoundRumbleVolume = null;
    this._cachedLDWS_RumbleStripsVolume = null;
    this._cachedLDWS_Mode = null;

    // set the default value as not available: SCR SW00134359
    this._cachedVehicle_AutoDoorLockInstalledAT = 0;
    this._cachedVehicle_AutoDoorLockInstalledAT6 = 0;
    this._cachedVehicle_AutoDoorLockInstalledMT = 0;
    
    this._cachedSafety_AutoWiper = null;
    this._cachedSafety_InterioLightTimeoutDoorOpen = null;
    this._cachedSafety_InterioLightTimeoutDoorClosed = null;
    this._cachedSafety_3flashTurnSignal = null;
    this._cachedSafety_TurnSignalIndicatorVolume = null;
    this._cachedSafety_AutoDoorLock = null;
    this._cachedSafety_AutoDoorLockChimeVolume = null;
    this._cachedSafety_AutoRelockTimer = null; 
    this._cachedLDWSTiming = null;
    this._cachedLDWSWarning = null; 
    this._cachedSBCSMode = null;
    this._cachedSBCSWarningDistance = null;
    this._cachedSBCSVolume = null; 
    this._cachedRVM_Volume = null;
    this._cachedBSM_Volume = null; 
    this._latestValueDaytimeRunningLights = 1;
    //INSTALLED
    this._cachedDRSS_Installed = null;
    this._cachedSBS_Installed = null;
    this._cachedSCBS_Installed = null;
    this.cachedLaneAssistSystem = null;
    this.cachedDriverAlert = null;
	this.cachedParkingSensorIndication = null;
    this._cachedFOW_Installed = null;
    this._cachedRVM_Installed = null;
    this._cachedBSM_Installed = null;
    this._cachedLDW_Installed = null;
    this._cachedHeadlight_Installed = null; 
    this._cachedSafety_Installed = null; 
    this._latestValueWalkAwayLock = 2;
    this._latestValueRVMBuzzerVolume = 2;
    this._latestValueBSMBuzzerVolume = 2;
    this._latestValueUnlockMode = 1;
    this._latestValueDRSSDistance = 1;
    this._latestValueFOW = 1;
    this._latestValueFOWDistance = 1;
    this._latestValueFOWBuzzerVolume = 1;
    this._latestValueSBSDistance = 1;
    this._latestValueBuzzerSetting = 1;
    this._latestValueSBSBuzzerVolume = 1;
    this._latestValueSBS = 2;
    this._latestValueLDWSBuzzerVolume = 1;
    this._latestValueLASVolume = 1;
    this._latestValueLDWSRumbleVolume = 1;
    this._latestValueSCBS = 2;
    this._latestValueLDWSWarning = 1;
    this._latestValueLDWSNATiming = 1;
    this._latestValueHudOpenClose = 2;
    this._cachedAutoWiper_Installed = null;
    this._cachedLightTimeoutDoorOpen_Installed = null;
    this._cachedLightTimeoutDoorClosed_Installed = null;
    this._cachedAutoDoorLock_Installed = null;
    this._cachedHeadOffTimer_Installed = null;
    this._cachedHeadlightAutoSensitivity_Installed = null;
    this._latestValueDRSS = 1;
    this._latestValueDA = "DA_On";
	this._latestValuePSI = 1;
    this._cachedThreeFlash_Installed = null;
    this._cachedTurnSignalVolume_Installed = null;
    this._cachedHBC_Installed = null;
    this._cachedAHBC_Installed = null;
    this._cachedHeadlightON_Installed = null;
    this._cachedAutoDoorRelock_Installed = null;
    this._cachedWalkAway_Installed = null;
    this._cachedAutoRelockTimer_Installed = null;
    this._cachedUnlockMode_Installed = null;
    this._cachedBuzzerAnswerback_Installed = null;
    this._cachedAutoTransmissionMode = null;
    this.cachedUnlockModeValue = null;
    this.cachedWalkAwayValue = null;
    this.cachedDoorReLockValue = null;
    this.cachedHeadLightOnValue = null;
    this.cachedHBCValue = null;
    this.cachedAHBCValue = null;
    this.cachedHeadAutoValue = null;
    this.cachedHeadOffTimerValue = null;
    this.cachedLightTimeoutDoorClosed = null;
    this.cachedDayTimeRunningLight = null;
    this.cachedLightTimeoutDoorOpen = null;
    // other cache 
    this._indexSound = null;
    this._indexWarning = null;
    this._indexTiming = null;
    this._cachedListLength = null;
    this._isListChanged = false;
    this._cachedLanguage = null; 
    this._cachedPresetMessagesList = null;
    this._cachedMessageIndex = null;
    this._cachedMessageText = null;  
    this._cachedKeyboardIntent = null;  
    this._currentListItemIndex = null;
    this._headLightOnCount = 1;
    this._ignitionStatus = 1;
    this._delayStatus = "disabled";
    this._CANStatus = true;    
    this._HUDInstalledStatus = false;
    this._cachedvoltageStatus = 1;
    this._cachedHudControlAllowed = 1;
    this._cachedIntervention = 2;
    this._cachedLASAlert = 2;
	this._cachedLASTiming = 1;
	this._cachedLASSound = 1;
	this._LDWSSoundIndex = 3;
	
    //slider tick and label
    var vehSettings_TM01 = {
            tickIncrement : 1,
            showCenterMark : true,
            showNumbers : false,
        };
        
    var vehSettings_LM01 = {
            leftLabelText : "-",
            centerLabelText : "0",
            rightLabelText : "+",
        };
    var vehSettings_TM03 = {
                tickIncrement : 1,
                showCenterMark : true,
                showNumbers : false,
        };
            
    var vehSettings_LM03 = {
                leftLabelText : "-",
                centerLabelText : "0",
                rightLabelText : "+",
        };
    var vehSettings_TM04 = {
            tickIncrement : 1,
            showCenterMark : true,
            showNumbers : false,
        };
        
    var vehSettings_LM04 = {
            leftLabelText : "-",
            centerLabelText : "0",
            rightLabelText : "+",
        };
    
    //Speed Handling in HUD Tab
    this.cachedSpeed = null;
    //HUD TAB 
    this._HUDTabCtxtDataListBrightnessControlOn = {
        itemCountKnown : true,
        itemCount : 6,
        items: [ 
            { appData : 'SetHudHeight', text1Id : 'Height', hasCaret : false, itemStyle : 'style12', tickMarkObject:vehSettings_TM01, labelObject:vehSettings_LM01, showLabels:true, showTickMarks:true, value : 0, increment: 1, min:-13, max: 13 }, 
            { appData : 'SetHudBrightnessControl', text1Id : 'BrightnessControl', button1Id : "Auto", button2Id : "Manual", hasCaret : false, itemStyle : 'style10', value : 1},  
            { appData : 'SetHudBrightness', text1Id : 'Brightness', hasCaret : false, itemStyle : 'style12', tickMarkObject:vehSettings_TM03, labelObject:vehSettings_LM03, showLabels:true, showTickMarks:true, value : 0, increment: 1, min:-20, max: 20 }, 
            { appData : 'SetHudNavigation', text1Id : 'Navigation', hasCaret : false, itemStyle : 'styleOnOff', value : 2},
            { appData : 'SetHudOpenClose', text1Id : 'HeadsUpDisplay', hasCaret : false, itemStyle : 'styleOnOff', value : 2},
            { appData : 'GoHUDReset', text1Id : 'common.Tooltip_IcnUmpReset', hasCaret : false, itemStyle : 'style01'},  
        ]
    };
    this._HUDTabCtxtDataListBrightnessControlOff = {
        itemCountKnown : true,
        itemCount : 6,
        items: [ 
            { appData : 'SetHudBrightness', text1Id : 'Brightness', hasCaret : false, itemStyle : 'style12', tickMarkObject : vehSettings_TM03, labelObject : vehSettings_LM03, showLabels : true, showTickMarks : true, value : 0, increment: 1, min:-20, max: 20 }, 
            { appData : 'SetHudBrightnessCalibration', text1Id : 'Calibration', hasCaret : false, itemStyle : 'style12', tickMarkObject : vehSettings_TM04, labelObject : vehSettings_LM04, showLabels : true, showTickMarks:true, value : 0, increment: 1, min:-2, max: 2 },  
        ]
    };
     
   //SAFETY TAB
    this._SafetyTabCtxtDataList = {
        itemCountKnown : true,
        itemCount : 11,
        items: [ 
            { appData : 'SelectDRSS', text1Id : 'DRSS',hasCaret : false, itemStyle : 'style01'}, 
            { appData : 'GoSBS', text1Id : 'SmartBrakeSupport',hasCaret : false, itemStyle : 'style01', disabled : false},  
            { appData : 'GoSBS_SCBS', text1Id : 'SBSSCBS',hasCaret : false, itemStyle : 'style01', disabled : false}, 
            { appData : 'SetSCBS', text1Id : 'SCBS', hasCaret : false, itemStyle : 'styleOnOff', value : 2},
            { appData : 'GoFOW', text1Id : 'ForwardObstructionWarning',hasCaret : false, itemStyle : 'style01'},  
            { appData : 'SelectRVMBuzzerVolume', text1Id : 'RVMBuzzerVolume', label1Id : 'Low', hasCaret : true, itemStyle : 'style06' , disabled : false}, 
            { appData : 'SelectBSMBuzzerVolume', text1Id : 'BSMBuzzerVolume',label1Id : 'Low', hasCaret : true, itemStyle : 'style06' , disabled : false}, 
            { appData : 'SelectLaneDepartureWarning' , text1Id : 'LaneDepartureWarningSystem',hasCaret : false, itemStyle : 'style01'}, 
            { appData : 'GoLAS' , text1Id : 'LaneKeepAssistSystem',hasCaret : false, itemStyle : 'style01'},       
            { appData : 'SetDA' , text1Id : 'DriverAlert',hasCaret : false, itemStyle : 'styleOnOff', value : 1},
			{ appData : 'SetParkingSensor' , text1Id : 'ParkingSensorIndication',hasCaret : false, itemStyle : 'styleOnOff', value : 1},
        ]
    };
    this._SafetyTabCtxtDataListImmutable = {
            itemCountKnown : true,
            itemCount : 11,
            items: [ 
                { appData : 'SelectDRSS', text1Id : 'DRSS',hasCaret : false, itemStyle : 'style01'}, 
                { appData : 'GoSBS', text1Id : 'SmartBrakeSupport',hasCaret : false, itemStyle : 'style01', disabled : false},  
                { appData : 'GoSBS_SCBS', text1Id : 'SBSSCBS',hasCaret : false, itemStyle : 'style01', disabled : false}, 
                { appData : 'SetSCBS', text1Id : 'SCBS', hasCaret : false, itemStyle : 'styleOnOff', value : 2},
                { appData : 'GoFOW', text1Id : 'ForwardObstructionWarning',hasCaret : false, itemStyle : 'style01'},  
                { appData : 'SelectRVMBuzzerVolume', text1Id : 'RVMBuzzerVolume', label1Id : 'Low', hasCaret : true, itemStyle : 'style06' , disabled : false}, 
                { appData : 'SelectBSMBuzzerVolume', text1Id : 'BSMBuzzerVolume',label1Id : 'Low', hasCaret : true, itemStyle : 'style06' , disabled : false}, 
                { appData : 'SelectLaneDepartureWarning' , text1Id : 'LaneDepartureWarningSystem',hasCaret : false, itemStyle : 'style01'}, 
                { appData : 'GoLAS' , text1Id : 'LaneKeepAssistSystem',hasCaret : false, itemStyle : 'style01'},       
                { appData : 'SetDA' , text1Id : 'DriverAlert',hasCaret : false, itemStyle : 'styleOnOff', value : 1},         
				{ appData : 'SetParkingSensor' , text1Id : 'ParkingSensorIndication',hasCaret : false, itemStyle : 'styleOnOff', value : 1},
        ]
        }; 
   //VEHICLE SETTINGS TAB
    this._VehicleSettingsTabCtxtDataList = {
        itemCountKnown : true,
        itemCount : 4,
        items: [ 
            { appData : 'SetRainSensingWiper', text1Id : 'AutoWiper', itemStyle : 'styleOnOff', hasCaret : false, value : 2},
            { appData : 'GoDoorLock', text1Id : 'DoorLock',hasCaret : false, itemStyle : 'style01', disabled : false},  
            { appData : 'GoTurnSettings', text1Id : 'Turn',hasCaret : false, itemStyle : 'style01', disabled : false},  
            { appData : 'GoLighting', text1Id : 'Lighting',hasCaret : false, itemStyle : 'style01', disabled : false},  
        ]
    };
    this._VehicleSettingsTabCtxtDataListImmutable = {
        itemCountKnown : true,
        itemCount : 4,
        items: [ 
            { appData : 'SetRainSensingWiper', text1Id : 'AutoWiper', itemStyle : 'styleOnOff', hasCaret : false, value : 2},
            { appData : 'GoDoorLock', text1Id : 'DoorLock',hasCaret : false, itemStyle : 'style01', disabled : false},  
            { appData : 'GoTurnSettings', text1Id : 'Turn',hasCaret : false, itemStyle : 'style01', disabled : false},  
            { appData : 'GoLighting', text1Id : 'Lighting',hasCaret : false, itemStyle : 'style01', disabled : false},  
        ]
    };
   //TURN SETTINGS
    this._TurnSettingsCtxtDataList = {
        itemCountKnown : true,
        itemCount : 3,
        items: [ 
            { appData : 'Set3FlashTurnSignal', text1Id : 'ThreeFlashTurnSignal',hasCaret : false,itemStyle : 'styleOnOff', value : 2}, 
            { appData : 'SetTurnSignalIndicatorVolume', text1Id : 'TurnSignalIndicatorVolume',button1Id : "High", button2Id : "Low", hasCaret : false, itemStyle : 'style10', value : 1},  
            { appData : 'GoTurnReset', text1Id : "common.Tooltip_IcnUmpReset", hasCaret : false, itemStyle : 'style01'},  
        ]
    };
    
    this._TurnSettingsCtxtDataListImmutable = {
    itemCountKnown : true,
    itemCount : 3,
    items: [ 
        { appData : 'Set3FlashTurnSignal', text1Id : 'ThreeFlashTurnSignal',hasCaret : false,itemStyle : 'styleOnOff',value : 2}, 
        { appData : 'SetTurnSignalIndicatorVolume', text1Id : 'TurnSignalIndicatorVolume', button1Id : "High", button2Id : "Low", hasCaret : false, itemStyle : 'style10', value : 1}, 
        { appData : 'GoTurnReset', text1Id : "common.Tooltip_IcnUmpReset", hasCaret : false, itemStyle : 'style01'},  
      ]
};
    //LIGHTING 
    this._LightingCtxtDataList = {
        itemCountKnown : true,
        itemCount : 11,
        items: [ 
            { appData : 'SelectInteriorLightTimeoutDoorOpen', text1Id : 'InterioLightsTimeOutDoorsOpen', label1Id : '_30m', hasCaret : true, itemStyle : 'style06' },
            { appData : 'SelectInteriorLightTimeoutDoorClosed', text1Id : 'InterioLightsTimeOutDoorsClosed', label1Id : '_30s', hasCaret : true, itemStyle : 'style06' },  
            { appData : 'SetHBC', text1Id : 'HighBeamControl',hasCaret : false,itemStyle : 'styleOnOff', value : 2},
            { appData : 'SetAFS', text1Id : 'AdaptiveFront-lightingSystem',hasCaret : false,itemStyle : 'styleOnOff', value : 2},
            { appData : 'SetHeadlightOnWarning', text1Id : 'LightOnReminderVolume',  button1Id : "High", button2Id : "Low" , button3Id : "common.Off", hasCaret : false, itemStyle : 'style11', value : 1},  
            { appData : 'SelectHeadlightOffTimer', text1Id : 'HeadlightOffTimer', label1Id : '_90s', hasCaret : true, itemStyle : 'style06' },
            { appData : 'GoCHLT', text1Id : 'ComingHomeLightsTimer', label1Id : '_90s', hasCaret : true, itemStyle : 'style06' },
            { appData : 'SetLHL', text1Id : 'LeavingHomeLights',hasCaret : false, itemStyle : 'styleOnOff', value : 2},
            { appData : 'SetDaytimeRunningLights', text1Id : 'DaytimeRunningLights',hasCaret : false,itemStyle : 'styleOnOff', value : 2},
            { appData : 'GoAutoHeadlightOn', text1Id : 'AutoHeadlightOn',  label1Id : 'Medium', hasCaret : true, itemStyle : 'style06'},
            { appData : 'GoLightingReset', text1Id : 'common.Tooltip_IcnUmpReset', hasCaret : false, itemStyle : 'style01'},  
        ]
    }; 
    this._LightingCtxtDataListImmutable =  {
            itemCountKnown : true,
            itemCount : 11,
            items: [ 
                { appData : 'SelectInteriorLightTimeoutDoorOpen', text1Id : 'InterioLightsTimeOutDoorsOpen', label1Id : '_30m', hasCaret : true, itemStyle : 'style06' },
                { appData : 'SelectInteriorLightTimeoutDoorClosed', text1Id : 'InterioLightsTimeOutDoorsClosed', label1Id : '_30s', hasCaret : true, itemStyle : 'style06' },  
                { appData : 'SetHBC', text1Id : 'HighBeamControl',hasCaret : false,itemStyle : 'styleOnOff', value : 2},
                { appData : 'SetAFS', text1Id : 'AdaptiveFront-lightingSystem',hasCaret : false,itemStyle : 'styleOnOff', value : 2},
                { appData : 'SetHeadlightOnWarning', text1Id : 'LightOnReminderVolume',  button1Id : "High", button2Id : "Low" , button3Id : "common.Off", hasCaret : false, itemStyle : 'style11', value : 1},  
                { appData : 'SelectHeadlightOffTimer', text1Id : 'HeadlightOffTimer', label1Id : '_90s', hasCaret : true, itemStyle : 'style06' },
                { appData : 'GoCHLT', text1Id : 'ComingHomeLightsTimer', label1Id : '_90s', hasCaret : true, itemStyle : 'style06' },
                { appData : 'SetLHL', text1Id : 'LeavingHomeLights',hasCaret : false, itemStyle : 'styleOnOff', value : 2},
                { appData : 'SetDaytimeRunningLights', text1Id : 'DaytimeRunningLights',hasCaret : false,itemStyle : 'styleOnOff', value : 2},
                { appData : 'GoAutoHeadlightOn', text1Id : 'AutoHeadlightOn',  label1Id : 'Medium', hasCaret : true, itemStyle : 'style06' },
                { appData : 'GoLightingReset', text1Id : 'common.Tooltip_IcnUmpReset', hasCaret : false, itemStyle : 'style01'},  
            ]
        };
   //DOOR LOCK
    this._DoorLockCtxtDataList = {
        itemCountKnown : true,
        itemCount : 6,
        items: [  
            { appData : 'GoDoorLockMode', text1Id : 'DoorLockMode', label1Id : 'common.On', hasCaret : true, itemStyle : 'style06' },  
            { appData : 'GoKeylessLockBeepVol', text1Id : 'KeylessLockBeepVol', label1Id : 'Med', hasCaret : true, itemStyle : 'style06' },  
            { appData : 'GoDoorRelockTime', text1Id : 'DoorRelockTime', label1Id : '_60s', hasCaret : true, itemStyle : 'style06' },               
            { appData : 'GoUnlockMode', text1Id : 'UnlockMode',  label1Id : "_Driver'sDoor", hasCaret : true, itemStyle : 'style06' }, 
            { appData : 'SetWalkAwayLock', text1Id : 'WalkAwayLock',hasCaret : false,itemStyle : 'styleOnOff',value : 2},
            { appData : 'GoDoorLockReset', text1Id : 'common.Tooltip_IcnUmpReset', hasCaret : false, itemStyle : 'style01'}, 
   
        ]
    };
    this._DoorLockCtxtDataListImmutable = {
            itemCountKnown : true,
            itemCount : 6,
            items: [  
                { appData : 'GoDoorLockMode', text1Id : 'DoorLockMode', label1Id : 'common.On', hasCaret : true, itemStyle : 'style06' },  
                { appData : 'GoKeylessLockBeepVol', text1Id : 'KeylessLockBeepVol', label1Id : 'Med', hasCaret : true, itemStyle : 'style06' },  
                { appData : 'GoDoorRelockTime', text1Id : 'DoorRelockTime', label1Id : '_60s', hasCaret : true, itemStyle : 'style06' },               
                { appData : 'GoUnlockMode', text1Id : 'UnlockMode',  label1Id : "_Driver'sDoor", hasCaret : true, itemStyle : 'style06' }, 
                { appData : 'SetWalkAwayLock', text1Id : 'WalkAwayLock',hasCaret : false,itemStyle : 'styleOnOff',value : 2},
                { appData : 'GoDoorLockReset', text1Id : 'common.Tooltip_IcnUmpReset', hasCaret : false, itemStyle : 'style01'}, 
            ]
        };
    //DoorLockMode
    this._DoorLockModeAutoTransmission6CtxtDataList = {
        itemCountKnown : true,
        itemCount : 6,
        items: [  
            { appData : 'SetAutoDoorLockAT6', text1Id : 'LockShiftFromPUnlockInPark', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'}, 
            { appData : 'SetAutoDoorLockAT6', text1Id : 'LockShiftFromP', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'},
            { appData : 'SetAutoDoorLockAT6', text1Id : 'LockUnlock', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'}, 
            { appData : 'SetAutoDoorLockAT6', text1Id : 'LockWhenDrivingUnlockIGNoff', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'}, 
            { appData : 'SetAutoDoorLockAT6', text1Id : 'LockWhenDriving', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'},  
            { appData : 'SetAutoDoorLockAT6', text1Id : 'common.Off', image1:'tick', checked:true, hasCaret : false, itemStyle : 'style03'}, 
        ] 
    };
    this._DoorLockModeAutoTransmissionCtxtDataList = {
        itemCountKnown : true,
        itemCount : 5,
        items: [  
            //for automatic transmissions >>>>>
            { appData : 'SetAutoDoorLockAT', text1Id : 'LockShiftFromPUnlockInPark', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'}, 
            { appData : 'SetAutoDoorLockAT', text1Id : 'LockShiftFromP', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'},   
            //for automatic transmissions <<<<<
            { appData : 'SetAutoDoorLockAT', text1Id : 'LockWhenDrivingUnlockIGNoff', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'}, 
            { appData : 'SetAutoDoorLockAT', text1Id : 'LockWhenDriving', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'},  
            { appData : 'SetAutoDoorLockAT', text1Id : 'common.Off', image1:'tick', checked:true, hasCaret : false, itemStyle : 'style03'}, 
        ] 
    };
    //DoorLockMode
    this._DoorLockModeManualTransmissionCtxtDataList = {
        itemCountKnown : true,
        itemCount : 3,
        items: [  
            //for manual transmissions >>>>>
            { appData : 'SetAutoDoorLockMT', text1Id : 'LockWhenDrivingUnlockIGNoff', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'}, 
            { appData : 'SetAutoDoorLockMT', text1Id : 'LockWhenDriving', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'},  
            { appData : 'SetAutoDoorLockMT', text1Id : 'common.Off', image1:'tick', checked:true, hasCaret : false, itemStyle : 'style03'}, 
        ] 
    };
  //DoorLockMode
    this._DoorLockModeNullDataList = {
        itemCountKnown : true,
        itemCount : 0,
        items: []
     };
    
    //KeylessLockBeepVol
    this._KeylessLockBeepVolCtxtDataList = {
        itemCountKnown : true,
        itemCount : 4,
        items: [ 
            { appData : 'SetKeylessLockBeepVol', text1Id : 'High', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'}, 
            { appData : 'SetKeylessLockBeepVol', text1Id : 'Medium', image1:'tick', checked:true, hasCaret : false, itemStyle : 'style03'}, 
            { appData : 'SetKeylessLockBeepVol', text1Id : 'Low', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'},  
            { appData : 'SetKeylessLockBeepVol', text1Id : 'common.Off', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'},  
        ]
    };
    //DoorRelockTime
    this._DoorRelockTimeCtxtDataList = {
        itemCountKnown : true,
        itemCount : 3,
        items: [  
            { appData : 'SetAutoRelockTimer', text1Id : '_90seconds', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'}, 
            { appData : 'SetAutoRelockTimer', text1Id : '_60seconds', image1:'tick', checked:true, hasCaret : false, itemStyle : 'style03'}, 
            { appData : 'SetAutoRelockTimer', text1Id : '_30seconds', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'},   
        ] 
    };
   //UnlockMode
    this._UnlockModeCtxtDataList = {
        itemCountKnown : true,
        itemCount : 2,
        items: [ 
            { appData : 'SetUnlockMode', text1Id : 'OnceAllDoors', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'}, 
            { appData : 'SetUnlockMode', text1Id : 'OnceDriversDoorTwiceAllDoors', image1:'tick', checked:true, hasCaret : false, itemStyle : 'style03'},   
        ]
    };
   //DRSS SETTINGS 
    this._DistanceRecoSupportSystemCtxtDataList = {
        itemCountKnown : true,
        itemCount : 3,
        items: [ 
            { appData : 'SetDRSS', text1Id : 'Mode', hasCaret : false, itemStyle : 'styleOnOff', value : 1}, 
            { appData : 'SetDRSSDistance', text1Id : 'WarningDistance', button1Id : "Far", button2Id : "Middle" , button3Id : "Near", hasCaret : false, itemStyle : 'style11', value : 1}, 
            { appData : 'GoDRSSReset', text1Id : 'common.Tooltip_IcnUmpReset', hasCaret : false, itemStyle : 'style01'}, 
        ]
    };
    
    //LAS
    this._LASCtxtDataList = {
            itemCountKnown : true,
            itemCount : 7,
            items: [ 
				{ appData : 'SetLASIntervention', text1Id : 'Intervention',hasCaret : false, itemStyle : 'styleOnOff', value : 2},
				{ appData : 'GoLASTiming', text1Id : 'AlertTiming', label1Id : 'Adaptive', hasCaret : true, itemStyle : 'style06' }, 
				{ appData : 'SetLDWSWarning', text1Id : 'Sensitivity', button1Id : "Often", button2Id : "Med" , button3Id : "Rare", hasCaret : false, itemStyle : 'style11', value : 1},
				{ appData : 'SetLASAlert', text1Id : 'LaneDepartureAlert',hasCaret : false, itemStyle : 'styleOnOff', value : 1},               
				{ appData : 'GoLASSound', text1Id : 'LASSound', label1Id : 'Vibration',hasCaret : true, itemStyle : 'style06'}, 
				{ appData : 'SetLASSoundVol', text1Id : 'VibrationStrength', button1Id : "High_Vibration", button2Id : "Low_Vibration", hasCaret : false, itemStyle : 'style10', value : 1},
				{ appData : 'GoLASReset', text1Id : 'common.Tooltip_IcnUmpReset', hasCaret : false, itemStyle : 'style01'}, 
           ]
        };  

    
    //LAS No Sound
    this._LASNoSoundCtxtDataList = {
            itemCountKnown : true,
            itemCount : 5,
            items: [ 
                { appData : 'SetLASIntervention', text1Id : 'Intervention',hasCaret : false, itemStyle : 'styleOnOff', value : 1},
                { appData : 'SetLASAlert', text1Id : 'LaneDepartureAlert',hasCaret : false, itemStyle : 'styleOnOff', value : 1},
                { appData : 'GoLASTiming', text1Id : 'Timing', label1Id : 'Adaptive', hasCaret : true, itemStyle : 'style06' }, 
                { appData : 'SetLDWSWarning', text1Id : 'Sensitivity', button1Id : "Often", button2Id : "Med" , button3Id : "Rare", hasCaret : false, itemStyle : 'style11', value : 1},
                { appData : 'GoLASReset', text1Id : 'common.Tooltip_IcnUmpReset', hasCaret : false, itemStyle : 'style01'}, 
           ]
        };
    
    //LAS Not Installed::: Deprecated
    this._LASNotInstalledCtxtDataList = {
            itemCountKnown : true,
            itemCount : 5,
            items: [ 
                { appData : 'GoLASTiming', text1Id : 'Timing', label1Id : 'Adaptive', hasCaret : true, itemStyle : 'style06' }, 
                { appData : 'SetLDWSWarning', text1Id : 'Warning', button1Id : "Often", button2Id : "Med" , button3Id : "Rare", hasCaret : false, itemStyle : 'style11', value : 1},
                { appData : 'GoLASSound', text1Id : 'Sound', label1Id : 'Vibration',hasCaret : false, itemStyle : 'style06'}, 
                { appData : 'SetLASSoundVol', text1Id : 'VibrationStrength', button1Id : "High_Vibration", button2Id : "Low_Vibration", hasCaret : false, itemStyle : 'style10', value : 1},
                { appData : 'GoLASReset', text1Id : 'common.Tooltip_IcnUmpReset', hasCaret : false, itemStyle : 'style01'}, 
           ]
        };
    
  //LAS Not Installed No  Sound 
    this._LASNotInstalledNoSoundCtxtDataList = {
            itemCountKnown : true,
            itemCount : 3,
            items: [ 
                { appData : 'GoLASTiming', text1Id : 'Timing', label1Id : 'Adaptive', hasCaret : true, itemStyle : 'style06' }, 
                { appData : 'SetLDWSWarning', text1Id : 'Sensitivity', button1Id : "Often", button2Id : "Med" , button3Id : "Rare", hasCaret : false, itemStyle : 'style11', value : 1},
                { appData : 'GoLASReset', text1Id : 'common.Tooltip_IcnUmpReset', hasCaret : false, itemStyle : 'style01'}, 
           ]
        };
    
    //Intervention not enabled
    this._InterventiondisabledCtxtDataList = {
            itemCountKnown : true,
            itemCount : 6,
            items: [ 
                { appData : 'SetLASIntervention', text1Id : 'Intervention',hasCaret : false, itemStyle : 'styleOnOff', value : 2},
                { appData : 'GoLASTiming', text1Id : 'Timing', label1Id : 'Adaptive', hasCaret : true, itemStyle : 'style06' }, 
                { appData : 'SetLDWSWarning', text1Id : 'Sensitivity', button1Id : "Often", button2Id : "Med" , button3Id : "Rare", hasCaret : false, itemStyle : 'style11', value : 1},
                { appData : 'GoLASSound', text1Id : 'LASSound', label1Id : 'Vibration',hasCaret : false, itemStyle : 'style06'}, 
                { appData : 'SetLASSoundVol', text1Id : 'VibrationStrength', button1Id : "High_Vibration", button2Id : "Low_Vibration", hasCaret : false, itemStyle : 'style10', value : 1},
                { appData : 'GoLASReset', text1Id : 'common.Tooltip_IcnUmpReset', hasCaret : false, itemStyle : 'style01'}, 
           ]
        };
    
    //Intervention not enabled Sound not installed
    this._InterventiondisabledNoSoundCtxtDataList = {
            itemCountKnown : true,
            itemCount : 6,
            items: [ 
                { appData : 'SetLASIntervention', text1Id : 'Intervention',hasCaret : false, itemStyle : 'styleOnOff', value : 1},
                { appData : 'GoLASTiming', text1Id : 'Timing', label1Id : 'Adaptive', hasCaret : true, itemStyle : 'style06' }, 
                { appData : 'SetLDWSWarning', text1Id : 'Sensitivity', button1Id : "Often", button2Id : "Med" , button3Id : "Rare", hasCaret : false, itemStyle : 'style11', value : 1},
                { appData : 'GoLASReset', text1Id : 'common.Tooltip_IcnUmpReset', hasCaret : false, itemStyle : 'style01'}, 
           ]
        };
    
    this._LASSoundHelper = {
        itemCountKnown : true,
            itemCount : 3,
            items: [ 
                { appData : 'SetLASSoundVol', text1Id : 'VibrationStrength', button1Id : "High_Vibration", button2Id : "Low_Vibration", hasCaret : false, itemStyle : 'style10', value : 1},
                { appData : 'SetLASSoundVol', text1Id : 'BeepVolume', button1Id : "High", button2Id : "Low", hasCaret : false, itemStyle : 'style10', value : 1},
                { appData : 'SetLASSoundVol', text1Id : 'RumbleVolume', button1Id : "High", button2Id : "Mid" , button3Id : "Low", hasCaret : false, itemStyle : 'style11', value : 1},
            ]
    };
    
    
    this._LASCtxtDataListHelper = {
            itemCountKnown : true,
            itemCount : 7,
            items: [ 
                { appData : 'GoLASTiming', text1Id : 'Timing', label1Id : 'Adaptive', hasCaret : true, itemStyle : 'style06' }, 
                { appData : 'SetLDWSTiming', text1Id : 'Timing', button1Id : "AtLine", button2Id : "BeforeLine", hasCaret : false, itemStyle : 'style10', value : 1},
                { appData : 'SetLDWSWarning', text1Id : 'Sensitivity', button1Id : "Often", button2Id : "Med" , button3Id : "Rare", hasCaret : false, itemStyle : 'style11', value : 1},
                { appData : 'SetLDWSWarning', text1Id : 'Sensitivity', button1Id : "High_SensitivityLAS", button2Id : "Low_SensitivityLAS" , hasCaret : false, itemStyle : 'style10', value : 1},
                { appData : 'SetLASSoundVol', text1Id : 'BeepVolume', button1Id : "High", button2Id : "Low", hasCaret : false, itemStyle : 'style10', value : 1},
                { appData : 'SetLASSoundVol', text1Id : 'RumbleVolume', button1Id : "High", button2Id : "Mid" , button3Id : "Low", hasCaret : false, itemStyle : 'style11', value : 1},
                { appData : 'SetLASSoundVol', text1Id : 'VibrationStrength', button1Id : "High_Vibration", button2Id : "Low_Vibration", hasCaret : false, itemStyle : 'style10', value : 1},
           ]
        };
    //LAS Timing Data List
    this._LASTimingCtxtDataList = {
            itemCountKnown : true,
            itemCount : 4,
            items: [ 
                { appData : 'SetLDWSTiming', text1Id : 'Adaptive', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'}, 
                { appData : 'SetLDWSTiming', text1Id : 'LASEarly', image1:'tick', checked:true, hasCaret : false, itemStyle : 'style03'}, 
                { appData : 'SetLDWSTiming', text1Id : 'Med', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'},  
                { appData : 'SetLDWSTiming', text1Id : 'LASLate', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'},  
            ]
        };
    
    //Forward Obstruction Warning settings 
    this._ForwardObstructionWarningCtxtDataList = {
        itemCountKnown : true,
        itemCount : 4,
        items: [ 
            { appData : 'SetFOW', text1Id : 'Mode',hasCaret : false, itemStyle : 'styleOnOff', value : 1},
            { appData : 'SetFOWDistance', text1Id : 'WarningDistance', button1Id : "Near", button2Id : "Far", hasCaret : false, itemStyle : 'style10', value : 1},
            { appData : 'SetFOWBuzzerVolume', text1Id : 'Volume', button1Id : "High", button2Id : "Low" , button3Id : 'common.Off', hasCaret : false, itemStyle : 'style11', value : 1},
            { appData : 'ResetFOWSettings', text1Id : 'common.Tooltip_IcnUmpReset',hasCaret : false, itemStyle : 'style01'}, 
        ]
    };
    //LDWS settings 
    this._LDWSCtxtDataList = {
        itemCountKnown : true,
        itemCount : 5,
        items: [ 
            { appData : 'GoLDWSTiming', text1Id : 'Timing', label1Id : 'Adaptive', hasCaret : true, itemStyle : 'style06'},
            { appData : 'SetLDWSWarning', text1Id : 'Warning', button1Id : "Often", button2Id : "Med" , button3Id : "Rare", hasCaret : false, itemStyle : 'style11', value : 1}, 
            { appData : 'SetBuzzerSetting', text1Id : 'Sound', button1Id : "Beep", button2Id : "RumbleStrips", hasCaret : false, itemStyle : 'style10', value : 1},
            { appData : 'SetLDWSBuzzerVolume', text1Id : 'BeepVolume', button1Id : "High", button2Id : "Low", hasCaret : false, itemStyle : 'style10', value : 1},
            { appData : 'GoLDWSReset', text1Id : 'common.Tooltip_IcnUmpReset', hasCaret : false, itemStyle : 'style01'}, 
        ]
    };
    
    this._LDWSCtxtDataListNotInstalled = {
        itemCountKnown : true,
        itemCount : 4,
        items: [ 
            { appData : 'GoLDWSTiming', text1Id : 'Timing', label1Id : 'Adaptive', hasCaret : true, itemStyle : 'style06'},
            { appData : 'SetLDWSWarning', text1Id : 'Warning', button1Id : "Often", button2Id : "Med" , button3Id : "Rare", hasCaret : false, itemStyle : 'style11', value : 1}, 
            { appData : 'SetLDWSBuzzerVolume', text1Id : 'BeepVolume', button1Id : "High", button2Id : "Low", hasCaret : false, itemStyle : 'style10', value : 1},
            { appData : 'GoLDWSReset', text1Id : 'common.Tooltip_IcnUmpReset', hasCaret : false, itemStyle : 'style01'}, 
        ]
    };
    
    this._LDWSCtxtDataListHelper = {
        itemCountKnown : true,
        itemCount : 6,
        items: [ 
            { appData : 'GoLDWSTiming', text1Id : 'Timing', label1Id : 'Adaptive', hasCaret : true, itemStyle : 'style06'},
            { appData : 'SetLDWSTiming', text1Id : 'Timing', button1Id : "AtLine", button2Id : "BeforeLine", hasCaret : false, itemStyle : 'style10', value : 1 },
            { appData : 'SetLDWSWarning', text1Id : 'Warning', button1Id : "Often", button2Id : "Med" , button3Id : "Rare", hasCaret : false, itemStyle : 'style11', value : 1}, 
            { appData : 'SetLDWSWarning', text1Id : 'Warning', button1Id : "High", button2Id : "Low", hasCaret : false, itemStyle : 'style10', value : 1},
            { appData : 'SetLDWSBuzzerVolume', text1Id : 'BeepVolume', button1Id : "High", button2Id : "Low", hasCaret : false, itemStyle : 'style10', value : 1},
            { appData : 'SetLDWSRumbleVolume', text1Id : 'RumbleVolume', button1Id : "High", button2Id : "Mid" , button3Id : "Low", hasCaret : false, itemStyle : 'style11', value : 1},
            
        ]
    };
    //LDWS Timing
    this._LDWSTimingCtxtDataList = {
        itemCountKnown : true,
        itemCount : 4,
        items: [ 
            { appData : 'SetLDWSTiming', text1Id : 'Adaptive', image1:'tick', checked:true, hasCaret : false, itemStyle : 'style03'}, 
            { appData : 'SetLDWSTiming', text1Id : 'Early', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'}, 
            { appData : 'SetLDWSTiming', text1Id : 'Medium', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'}, 
            { appData : 'SetLDWSTiming', text1Id : 'Late', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'}, 
        ]
    };
    
    this._LASSoundCtxtDataList = {
        itemCountKnown : true,
        itemCount : 3,
        items: [ 
               { appData : 'SetLASSound', text1Id : 'Vibration_Line', image1:'tick', checked:false,hasCaret : false, itemStyle : 'style03'}, 
               { appData : 'SetLASSound', text1Id : 'Beep_Line', image1:'tick', checked:true, hasCaret : false, itemStyle : 'style03'},
               { appData : 'SetLASSound', text1Id : 'RumbleStrips_line', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'},
        ]
    };

    //HeadlightOffTimer
    this._HeadlightOffTimerCtxtDataList = {
        itemCountKnown : true,
        itemCount : 5,
        items: [ 
            { appData : 'SetHeadlightOffTimer', text1Id : '_120seconds', image1:'tick', checked:false,hasCaret : false, itemStyle : 'style03'}, 
            { appData : 'SetHeadlightOffTimer', text1Id : '_90seconds', image1:'tick', checked:true, hasCaret : false, itemStyle : 'style03'}, 
            { appData : 'SetHeadlightOffTimer', text1Id : '_60seconds', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'},  
            { appData : 'SetHeadlightOffTimer', text1Id : '_30seconds', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'}, 
            { appData : 'SetHeadlightOffTimer', text1Id : 'common.Off', image1:'tick', checked:false,  hasCaret : false, itemStyle : 'style03'}, 
        ] 
    };
    
    //CHLT
    this._CHLTCtxtDataList = {
        itemCountKnown : true,
        itemCount : 5,
        items: [ 
            { appData : 'SetCHLT', text1Id : '_120seconds', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'}, 
            { appData : 'SetCHLT', text1Id : '_90seconds', image1:'tick', checked:true, hasCaret : false, itemStyle : 'style03'}, 
            { appData : 'SetCHLT', text1Id : '_60seconds', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'},  
            { appData : 'SetCHLT', text1Id :'_30seconds', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'}, 
            { appData : 'SetCHLT', text1Id :'common.Off', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'}, 
        ] 
    };
    
    //AutoHeadlightSensitivity
    this._AutoHeadlightOnCtxtDataList = {
        itemCountKnown : true,
        itemCount : 5,
        items: [ 
            { appData : 'SetAutoHeadlightSensitivity', text1Id : 'Light', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'}, 
            { appData : 'SetAutoHeadlightSensitivity', text1Id : 'MediumLight', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'}, 
            { appData : 'SetAutoHeadlightSensitivity', text1Id : 'Medium', image1:'tick', checked:true, hasCaret : false, itemStyle : 'style03'},  
            { appData : 'SetAutoHeadlightSensitivity', text1Id : 'MediumDark', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'}, 
            { appData : 'SetAutoHeadlightSensitivity', text1Id : 'Dark', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'}, 
        ] 
    };
 
    //SmartBrakeSupport
    this._SmartBrakeSupportCtxtDataList = {
        itemCountKnown : true,
        itemCount : 4,
        items: [ 
            { appData : 'SetSBS', text1Id : 'Mode', hasCaret : false, itemStyle : 'styleOnOff', value : 2},
            { appData : 'SetSBSDistance', text1Id : 'WarningDistance', button1Id : "Near", button2Id : "Far", hasCaret : false, itemStyle : 'style10', value : 1},
            { appData : 'SetSBSBuzzerVolume', text1Id : 'Volume', button1Id : "High", button2Id : "Low" , button3Id : "common.Off", hasCaret : false, itemStyle : 'style11', value : 1},  
            { appData : 'GoSBSReset', text1Id : 'common.Tooltip_IcnUmpReset', hasCaret : false, itemStyle : 'style01' },  
        ] 
    };
    
    //SmartCityBreakSystem
    this._SmartCityBreakSystemCtxtDataList = {
        itemCountKnown : true,
        itemCount : 4,
        items: [ 
            { appData : 'SetSCBS', text1Id : 'Mode',hasCaret : false, itemStyle : 'styleOnOff', value : 2},
            { appData : 'SetSBSDistance', text1Id : 'WarningDistance', button1Id : "Near", button2Id : "Far", hasCaret : false, itemStyle : 'style10', value : 1},
            { appData : 'SetSBSBuzzerVolume', text1Id : 'Volume', button1Id : "High", button2Id : "Low" , button3Id : "common.Off", hasCaret : false, itemStyle : 'style11', value : 1},  
            { appData : 'GoSBS_SCBSReset', text1Id : 'common.Tooltip_IcnUmpReset', hasCaret : false, itemStyle : 'style01' },  
        ] 
    };
    
  //SmartBrakeSupport
    this._SmartBrakeSupportHelperCtxtDataList = {
        itemCountKnown : true,
        itemCount : 3,
        items: [ 
            { appData : 'SetSBS', text1Id : 'Mode', hasCaret : false, itemStyle : 'styleOnOff', value : 2},
            { appData : 'SetSBSBuzzerVolume', text1Id : 'Volume', button1Id : "High", button2Id : "Low" , button3Id : "common.Off", hasCaret : false, itemStyle : 'style11', value : 1},  
            { appData : 'GoSBSReset', text1Id : 'common.Tooltip_IcnUmpReset', hasCaret : false, itemStyle : 'style01' },  
        ] 
    };
    this._SmartCityBreakSystemHelperCtxtDataList = {
            itemCountKnown : true,
            itemCount : 3,
            items: [ 
                { appData : 'SetSCBS', text1Id : 'Mode',hasCaret : false, itemStyle : 'styleOnOff', value : 2},
                { appData : 'SetSBSBuzzerVolume', text1Id : 'Volume', button1Id : "High", button2Id : "Low" , button3Id : "common.Off", hasCaret : false, itemStyle : 'style11', value : 1},  
                { appData : 'GoSBS_SCBSReset', text1Id : 'common.Tooltip_IcnUmpReset', hasCaret : false, itemStyle : 'style01' },  
            ] 
        };
    //RearviewMonitorBuzzerVolume
    this._RearviewMonitorBuzzerVolumeCtxtDataList = {
        itemCountKnown : true,
        itemCount : 3,
        items: [ 
            { appData : 'SetRVMBuzzerVolume', text1Id : 'High', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'}, 
            { appData : 'SetRVMBuzzerVolume', text1Id : 'Low', image1:'tick', checked:true, hasCaret : false, itemStyle : 'style03'}, 
            { appData : 'SetRVMBuzzerVolume', text1Id : 'common.Off', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'},  
        ]
    };

    //BlindSpotMonitorBuzzerVolume
    this._BlindSpotMonitorBuzzerVolumeCtxtDataList = {
        itemCountKnown : true,
        itemCount : 3,
        items: [ 
            { appData : 'SetBSMBuzzerVolume', text1Id : 'High', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'}, 
            { appData : 'SetBSMBuzzerVolume', text1Id : 'Low', image1:'tick', checked:true, hasCaret : false, itemStyle : 'style03'}, 
            { appData : 'SetBSMBuzzerVolume', text1Id : 'common.Off', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'},  
        ]
    };
     
    //IntLightTimeoutDoorClosed
    this._IntLightTimeoutDoorClosedCtxtDataList = {
        itemCountKnown : true,
        itemCount : 4,
        items: [ 
            { appData : 'SetInteriorLightTimeoutDoorClosed', text1Id : '_60seconds', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'}, 
            { appData : 'SetInteriorLightTimeoutDoorClosed', text1Id : '_30seconds', image1:'tick', checked:true, hasCaret : false, itemStyle : 'style03'}, 
            { appData : 'SetInteriorLightTimeoutDoorClosed', text1Id : '_15seconds', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'},  
            { appData : 'SetInteriorLightTimeoutDoorClosed', text1Id :'_7p5seconds', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'}, 
        ] 
    };
 
    //InteriorLightTimeoutDoorOpen
    this._InteriorLightTimeoutDoorOpenCtxtDataList = {
        itemCountKnown : true,
        itemCount : 3,
        items: [ 
            { appData : 'SetInteriorLightTimeoutDoorOpen', text1Id : '_60minutes', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'}, 
            { appData : 'SetInteriorLightTimeoutDoorOpen', text1Id : '_30minutes', image1:'tick', checked:true, hasCaret : false, itemStyle : 'style03'}, 
            { appData : 'SetInteriorLightTimeoutDoorOpen', text1Id : '_10minutes', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'},   
        ] 
    };

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
    
    // TABS BUTTON CONFIGURATION, HUD_INSTALLED OFFSETS
    this._HUDTabBtnConfig = {"style":"tabsStyle2", "defaultSelectCallback":null, "currentlySelectedTab":0, "tabsConfig": this._tabsConfig, tabsGroup : "settings"},
    this._SafetyTabBtnConfig = {"style":"tabsStyle2", "defaultSelectCallback":null, "currentlySelectedTab":2, "tabsConfig": this._tabsConfig, tabsGroup : "settings"}; 
    this._VehicleSettingsTabBtnConfig = {"style":"tabsStyle2", "defaultSelectCallback":null, "currentlySelectedTab":5, "tabsConfig": this._tabsConfig, tabsGroup : "settings"}; 

    
    //Context table
    //@formatter:off
    this._contextTable = { 
        "HUDTab" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack",
            "sbNameId" : "Settings",
            "controlProperties": {
                "List2Ctrl" : {
                    "dataList": this._HUDTabCtxtDataListBrightnessControlOn,
                    titleConfiguration : 'tabsTitle', 
                    tabsButtonConfig : {"style":"tabsStyle2", "defaultSelectCallback":null, "currentlySelectedTab":4, "tabsConfig":this._tabsConfig, tabsGroup : "settings"},
                    selectCallback : this.listItemClick,  
                    slideCallback : this.listItemSlide,   
                    minChangeInterval : 1000,
                    toggleMinChangeInterval : 1000,
                    rotationIdleDetectTime : 1250,
                    settleTime : 1500,
                    toggleSettleTime : 1500,
                    "smallItemText" : true,
                } // end of properties for "List2Ctrl"                                       
            }, // end of list of controlProperties
            "readyFunction" : this._HUDTabCtxtTmpltReadyToDisplay.bind(this),
            "contextInFunction" : this._HUDTabCtxtIn.bind(this),
            // "displayedFunction": this.ctxtTmpltDisplayed
        }, // end of "HUDTab"
        
        
        "SafetyTab" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack",
            "sbNameId" : "Settings",
            "controlProperties": {
                "List2Ctrl" : {
                    // "dataList": this._SafetyTabCtxtDataList,
                    "dataList": this._SafetyTabCtxtDataList,
                    titleConfiguration : 'tabsTitle', 
                    tabsButtonConfig : {"style":"tabsStyle2", "defaultSelectCallback":null, "currentlySelectedTab":4, "tabsConfig":this._tabsConfig, tabsGroup : "settings"},
                    selectCallback : this.listItemClick,  
                    slideCallback : this.listItemSlide,  
                    toggleMinChangeInterval : 1000,
                    toggleSettleTime : 1500,
                    "smallItemText" : true,
                } // end of properties for "List2Ctrl"                                       
            }, // end of list of controlProperties
            "readyFunction" : this._SafetyTabCtxtTmpltReadyToDisplay.bind(this),
            "contextInFunction" : this._SafetyTabTabCtxtIn.bind(this),
            // "displayedFunction": this.ctxtTmpltDisplayed
        }, // end of "SafetyTab"
        
        "VehicleSettingsTab" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack",
            "sbNameId" : "Settings",
            "controlProperties": {
                "List2Ctrl" : {
                    "dataList": this._VehicleSettingsTabCtxtDataList,
                    titleConfiguration : 'tabsTitle', 
                    tabsButtonConfig : {"style":"tabsStyle2", "defaultSelectCallback":null, "currentlySelectedTab":4, "tabsConfig":this._tabsConfig, tabsGroup : "settings"},
                    selectCallback : this.listItemClick,  
                    slideCallback : this.listItemSlide,  
                    toggleMinChangeInterval : 1000,
                    toggleSettleTime : 1500,
                    "smallItemText" : true,
                } // end of properties for "List2Ctrl"                                       
            }, // end of list of controlProperties
            "readyFunction" : this._VehicleSettingsTabCtxtTmpltReadyToDisplay.bind(this),
            "contextInFunction" : this._VehicleSettingsTabCtxtIn.bind(this),
            // "displayedFunction": this.ctxtTmpltDisplayed
        }, // end of "VehicleSettingsTab"
 
        "DRSS" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack",
            "sbNameId" : "Safetysettings",
            "controlProperties": {
                "List2Ctrl" : {                                                            
                    "dataList": this._DistanceRecoSupportSystemCtxtDataList, 
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',  
                        text1Id : 'DistanceRecognitionSupportSystem', 
                    },
                    "smallItemText" : true,
                    selectCallback : this.listItemClick,  
                    slideCallback : this.listItemSlide,  
                    toggleMinChangeInterval : 1000,
                    toggleSettleTime : 1500,
                    needDataCallback : null   // Not needed, no dynamic list data
                } // end of properties for "List2Ctrl"                                      
            }, // end of list of controlProperties
            "readyFunction" : this._DistanceRecoSupportSystemCtxtTmpltReadyToDisplay.bind(this),
            // "displayedFunction": this.ctxtTmpltDisplayed  
        }, // end of "DRSS"
        
        "LAS" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack",
            "sbNameId" : "Safetysettings",
            "controlProperties": {
                "List2Ctrl" : {                                                            
                    "dataList": this._LASCtxtDataList, 
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',  
                        text1Id : 'LaneKeepAssistSystem', 
                    },
                    "smallItemText" : true,
                    selectCallback : this.listItemClick,  
                    slideCallback : this.listItemSlide,  
                    toggleMinChangeInterval : 1000,
                    toggleSettleTime : 1500,
                    needDataCallback : null   // Not needed, no dynamic list data
                } // end of properties for "List2Ctrl"                                      
            }, // end of list of controlProperties
            "readyFunction" : this._LASCtxtTmpltReadyToDisplay.bind(this),
            // "displayedFunction": this.ctxtTmpltDisplayed  
        }, // end of "DRSS"
        
        "LASSound" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack",
            "sbNameId" : "Safetysettings",
            "controlProperties": {
                "List2Ctrl" : {                                                            
                    "dataList": this._LASSoundCtxtDataList, 
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',  
                        text1Id : 'LASSound', 
                    },
                    "smallItemText" : true,
                    selectCallback : this.listItemClick,  
                    slideCallback : this.listItemSlide,  
                    toggleMinChangeInterval : 1000,
                    toggleSettleTime : 1500,
                    needDataCallback : null   // Not needed, no dynamic list data
                } // end of properties for "List2Ctrl"                                      
            }, // end of list of controlProperties
            "readyFunction" : this._LASSoundCtxtTmpltReadyToDisplay.bind(this),
             //"displayedFunction": this.ctxtTmpltDisplayed  
        }, // end of "DRSS"
        
        "LASTiming" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack",
            "sbNameId" : "Safetysettings",
            "controlProperties": {
                "List2Ctrl" : {                                                            
                    "dataList": this._LASTimingCtxtDataList, 
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',  
                        text1Id : 'LASTiming', 
                    },
                    "smallItemText" : true,
                    selectCallback : this.listItemClick,  
                    slideCallback : this.listItemSlide,  
                    toggleMinChangeInterval : 1000,
                    toggleSettleTime : 1500,
                    needDataCallback : null   // Not needed, no dynamic list data
                } // end of properties for "List2Ctrl"                                      
            }, // end of list of controlProperties
			"contextInFunction" : this._LASTimingCtxtTmpltcontextInFunction.bind(this),
            "readyFunction" : this._LASTimingCtxtTmpltReadyToDisplay.bind(this),
            // "displayedFunction": this.ctxtTmpltDisplayed  
        }, // end of "DRSS"
        "FOW" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack",
            "sbNameId" : "Safetysettings",
            "controlProperties": {
                "List2Ctrl" : {                                                            
                    "dataList": this._ForwardObstructionWarningCtxtDataList, 
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',  
                        text1Id : 'ForwardObstructionWarning',
                    },
                    "smallItemText" : true,
                    selectCallback : this.listItemClick,  
                    toggleMinChangeInterval : 1000,
                    toggleSettleTime : 1500,
                    needDataCallback : null   // Not needed, no dynamic list data
                } // end of properties for "List2Ctrl"                                      
            }, // end of list of controlProperties
            "readyFunction" : this._ForwardObstructionWarningCtxtTmpltReadyToDisplay.bind(this),
            // "displayedFunction": this.ctxtTmpltDisplayed  
        }, // end of "FOW"
        
        "LDWS" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack",
            "sbNameId" : "Safetysettings",
            "controlProperties": {
                "List2Ctrl" : {                                                            
                    // "dataList": this._LDWSCtxtDataListBuzzer, 
                    "dataList": this._LDWSCtxtDataList, 
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',  
                        text1Id : 'LaneDepartureWarningSystem',
                    },
                    "smallItemText" : true,
                    selectCallback : this.listItemClick,  
                    toggleMinChangeInterval : 1000,
                    toggleSettleTime : 1500,
                    needDataCallback : null   // Not needed, no dynamic list data
                } // end of properties for "List2Ctrl"                                      
            }, // end of list of controlProperties
            "readyFunction" : this._LDWSCtxtTmpltReadyToDisplay.bind(this),
            // "displayedFunction": this.ctxtTmpltDisplayed  
        }, // end of "LDWS"
        
        "LDWSTiming" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack",
            "sbNameId" : "Safetysettings",
            "controlProperties": {
                "List2Ctrl" : {                                                            
                    "dataList": this._LDWSTimingCtxtDataList, 
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',  
                        text1Id : 'LDWSTiming',
                    },
                    checkMinChangeInterval : 1000,
                    checkSettleTime : 1500,
                    "smallItemText" : true,
                    selectCallback : this.listItemClick,  
                    needDataCallback : null   // Not needed, no dynamic list data
                } // end of properties for "List2Ctrl"                                      
            }, // end of list of controlProperties
            "readyFunction" : this._LDWSTimingCtxtTmpltReadyToDisplay.bind(this),
            // "displayedFunction": this.ctxtTmpltDisplayed  
        }, // end of "LDWSTiming"
        
        "HeadlightOffTimer" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack",
            "sbNameId" : "VehicleSettings",
            "controlProperties": {
                "List2Ctrl" : {                                                            
                    "dataList": this._HeadlightOffTimerCtxtDataList, 
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',  
                        text1Id : 'HeadlightOffTimer',
                    },
                    checkMinChangeInterval : 1000,
                    checkSettleTime : 1500,
                    "smallItemText" : true,
                    selectCallback : this.listItemClick,  
                    needDataCallback : null   // Not needed, no dynamic list data
                } // end of properties for "List2Ctrl"                                      
            }, // end of list of controlProperties
            "readyFunction" : this._HeadlightOffTimerCtxtTmpltReadyToDisplay.bind(this),
            // "displayedFunction": this.ctxtTmpltDisplayed  
        }, // end of "HeadlightOffTimer"
        
        "CHLT"  : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack",
            "sbNameId" : "VehicleSettings",
            "controlProperties": {
                "List2Ctrl" : {                                                            
                    "dataList": this._CHLTCtxtDataList, 
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',  
                        text1Id : 'ComingHomeLightsTimer',
                    },
					"smallItemText" : true,
                    checkMinChangeInterval : 1000,
                    checkSettleTime : 1500,
                    selectCallback : this.listItemClick,  
                    needDataCallback : null   // Not needed, no dynamic list data
                } // end of properties for "List2Ctrl"                                      
            }, // end of list of controlProperties
            "readyFunction" : this._CHLTCtxtTmpltReadyToDisplay.bind(this),
            // "displayedFunction": this.ctxtTmpltDisplayed  
        }, // end of "CHLT"
        
        "AutoHeadlightOn" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack",
            "sbNameId" : "VehicleSettings",
            "controlProperties": {
                "List2Ctrl" : {                                                            
                    "dataList": this._AutoHeadlightOnCtxtDataList, 
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',  
                        text1Id : 'AutoHeadlightOn',
                    },
                    checkMinChangeInterval : 1000,
                    checkSettleTime : 1500,
                    "smallItemText" : true,
                    selectCallback : this.listItemClick,  
                    needDataCallback : null   // Not needed, no dynamic list data
                } // end of properties for "List2Ctrl"                                      
            }, // end of list of controlProperties
            "readyFunction" : this._AutoHeadlightSensitivityCtxtTmpltReadyToDisplay.bind(this),
            // "displayedFunction": this.ctxtTmpltDisplayed  
        }, // end of "AutoHeadlightOn"
        
        "SBS" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack",
            "sbNameId" : "Safetysettings",
            "controlProperties": {
                "List2Ctrl" : {                                                            
                    "dataList": this._SmartBrakeSupportCtxtDataList, 
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',  
                        text1Id : 'SmartBrakeSupport',
                    },
                    "smallItemText" : true,
                    selectCallback : this.listItemClick,  
                    toggleMinChangeInterval : 1000,
                    toggleSettleTime : 1500,
                    needDataCallback : null   // Not needed, no dynamic list data
                } // end of properties for "List2Ctrl"                                      
            }, // end of list of controlProperties
            "readyFunction" : this._SmartBrakeSupportCtxtTmpltReadyToDisplay.bind(this),
            // "displayedFunction": this.ctxtTmpltDisplayed  
        }, // end of "SBS"
        
        "SBS_SCBS" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack",
            "sbNameId" : "Safetysettings",
            "controlProperties": {
                "List2Ctrl" : {                                                            
                    "dataList": this._SmartCityBreakSystemCtxtDataList, 
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',  
                        text1Id : 'SBSSCBS',
                    },
                    "smallItemText" : true,
                    selectCallback : this.listItemClick,  
                    toggleMinChangeInterval : 1000,
                    toggleSettleTime : 1500,
                    needDataCallback : null   // Not needed, no dynamic list data
                } // end of properties for "List2Ctrl"                                      
            }, // end of list of controlProperties
            "readyFunction" : this._SmartCityBreakSystemCtxtTmpltReadyToDisplay.bind(this),
            // "displayedFunction": this.ctxtTmpltDisplayed  
        }, // end of "SBS_SCBS"
       
        "RVMVolume" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack",
            "sbNameId" : "Safetysettings",
            "controlProperties": {
                "List2Ctrl" : {                                                            
                    "dataList": this._RearviewMonitorBuzzerVolumeCtxtDataList, 
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',  
                        text1Id : 'RVMBuzzerVolume',
                    },
                    checkMinChangeInterval : 1000,
                    checkSettleTime : 1500,
                    "smallItemText" : true,
                    selectCallback : this.listItemClick,  
                    needDataCallback : null   // Not needed, no dynamic list data
                } // end of properties for "List2Ctrl"                                      
            }, // end of list of controlProperties
            "readyFunction" : this._RearviewMonitorBuzzerVolumeCtxtTmpltReadyToDisplay.bind(this),
            // "displayedFunction": this.ctxtTmpltDisplayed  
        }, // end of "RVMVolume"
        
        "BSMVolume" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack",
            "sbNameId" : "Safetysettings",
            "controlProperties": {
                "List2Ctrl" : {                                                            
                    "dataList": this._BlindSpotMonitorBuzzerVolumeCtxtDataList, 
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',  
                        text1Id : 'BSMBuzzerVolume',
                    },
                    checkMinChangeInterval : 1000,
                    checkSettleTime : 1500,
                    "smallItemText" : true,
                    selectCallback : this.listItemClick,  
                    needDataCallback : null   // Not needed, no dynamic list data
                } // end of properties for "List2Ctrl"                                      
            }, // end of list of controlProperties
            "readyFunction" : this._BlindSpotMonitorBuzzerVolumeCtxtTmpltReadyToDisplay.bind(this),
            // "displayedFunction": this.ctxtTmpltDisplayed  
        }, // end of "BSMVolume"
        "IntLightTimeoutDoorClosed" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack",
            "sbNameId" : "VehicleSettings",
            "controlProperties": {
                "List2Ctrl" : {                                                            
                    "dataList": this._IntLightTimeoutDoorClosedCtxtDataList, 
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',  
                        text1Id : 'InterioLightsTimeOutDoorsClosed',
                    },
                    checkMinChangeInterval : 1000,
                    checkSettleTime : 1500,
                    "smallItemText" : true,
                    selectCallback : this.listItemClick,  
                    needDataCallback : null   // Not needed, no dynamic list data
                } // end of properties for "List2Ctrl"                                      
            }, // end of list of controlProperties
            "readyFunction" : this._IntLightTimeoutDoorClosedCtxtTmpltReadyToDisplay.bind(this),
            // "displayedFunction": this.ctxtTmpltDisplayed  
        }, // end of "IntLightTimeoutDoorClosed"
        
        "IntLightTimeoutDoorOpen" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack",
            "sbNameId" : "VehicleSettings",
            "controlProperties": {
                "List2Ctrl" : {                                                            
                    "dataList": this._InteriorLightTimeoutDoorOpenCtxtDataList, 
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',  
                        text1Id : 'InterioLightsTimeOutDoorsOpen',
                    },
                    checkMinChangeInterval : 1000,
                    checkSettleTime : 1500,
                    selectCallback : this.listItemClick,  
                    "smallItemText" : true,
                    needDataCallback : null   // Not needed, no dynamic list data
                } // end of properties for "List2Ctrl"                                      
            }, // end of list of controlProperties
            "readyFunction" : this._InteriorLightTimeoutDoorOpenCtxtTmpltReadyToDisplay.bind(this),
            // "displayedFunction": this.ctxtTmpltDisplayed  
        }, // end of "IntLightTimeoutDoorOpen"

        "DoorLock" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack",
            "sbNameId" : "VehicleSettings",
            "controlProperties": {
                "List2Ctrl" : {                                                            
                    "dataList": this._DoorLockCtxtDataList, 
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',  
                        text1Id : 'DoorLock',
                    },
                    "smallItemText" : true,
                    toggleMinChangeInterval : 1000,
                    toggleSettleTime : 1500,
                    selectCallback : this.listItemClick,  
                    needDataCallback : null   // Not needed, no dynamic list data
                } // end of properties for "List2Ctrl"                                      
            }, // end of list of controlProperties
            "readyFunction" : this._AutoDoorLockCtxtTmpltReadyToDisplay.bind(this),
            // "displayedFunction": this.ctxtTmpltDisplayed  
        }, // end of "DoorLock"
         
        "DoorLockMode" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack",
            "sbNameId" : "VehicleSettings",
            "controlProperties": {
                "List2Ctrl" : {                                                            
                    "dataList": this._DoorLockModeManualTransmissionCtxtDataList, //Defaulting to Manualtransmssion
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',  
                        text1Id : 'DoorLockMode',
                    },
                    checkMinChangeInterval : 1000,
                    checkSettleTime : 1500,
                    selectCallback : this.listItemClick,   
                    "smallItemText" : true,
                } // end of properties for "List2Ctrl"                                      
            }, // end of list of controlProperties
            "readyFunction" : this._DoorLockModeCtxtTmpltReadyToDisplay.bind(this),
            // "displayedFunction": this.ctxtTmpltDisplayed  
        }, // end of "DoorLock"
        
        "KeylessLockBeepVol" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack",
            "sbNameId" : "VehicleSettings",
            "controlProperties": {
                "List2Ctrl" : {                                                            
                    "dataList": this._KeylessLockBeepVolCtxtDataList, 
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',  
                        text1Id : 'KeylessLockBeepVol',
                    },
                    selectCallback : this.listItemClick,  
                    checkMinChangeInterval : 1000,
                    checkSettleTime : 1500,
                    "smallItemText" : true,
                    needDataCallback : null   // Not needed, no dynamic list data
                } // end of properties for "List2Ctrl"                                      
            }, // end of list of controlProperties
            "readyFunction" : this._KeylessLockBeepVolCtxtTmpltReadyToDisplay.bind(this),
            // "displayedFunction": this.ctxtTmpltDisplayed  
        }, // end of "KeylessLockBeepVol"
         
        "DoorRelockTime" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack",
            "sbNameId" : "VehicleSettings",
            "controlProperties": {
                "List2Ctrl" : {                                                            
                    "dataList": this._DoorRelockTimeCtxtDataList, 
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',  
                        text1Id : 'DoorRelockTime',
                    },
                    selectCallback : this.listItemClick,  
                    checkMinChangeInterval : 1000,
                    checkSettleTime : 1500,
                    "smallItemText" : true,
                    needDataCallback : null   // Not needed, no dynamic list data
                } // end of properties for "List2Ctrl"                                      
            }, // end of list of controlProperties
            "readyFunction" : this._DoorRelockTimeCtxtTmpltReadyToDisplay.bind(this),
            // "displayedFunction": this.ctxtTmpltDisplayed  
        }, // end of "DoorRelockTime"
        
        "UnlockMode" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack",
            "sbNameId" : "VehicleSettings",
            "controlProperties": {
                "List2Ctrl" : {                                                            
                    "dataList": this._UnlockModeCtxtDataList, 
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',  
                        text1Id : 'UnlockMode',
                    },
                    selectCallback : this.listItemClick,  
                    checkMinChangeInterval : 1000,
                    checkSettleTime : 1500,
                    "smallItemText" : true,
                    needDataCallback : null   // Not needed, no dynamic list data
                } // end of properties for "List2Ctrl"                                      
            }, // end of list of controlProperties
            "readyFunction" : this._UnlockModeCtxtTmpltReadyToDisplay.bind(this),
            // "displayedFunction": this.ctxtTmpltDisplayed  
        }, // end of "UnlockMode"
         
         
        "TurnSettings" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack",
            "sbNameId" : "VehicleSettings",
            "controlProperties": {
                "List2Ctrl" : {                                                            
                    "dataList": this._TurnSettingsCtxtDataList, 
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',  
                        text1Id : 'TurnSettings',
                    },
                    selectCallback : this.listItemClick,   
                    toggleMinChangeInterval : 1000,
                    toggleSettleTime : 1500,
                    "smallItemText" : true,
                } // end of properties for "List2Ctrl"                                      
            }, // end of list of controlProperties
            "readyFunction" : this._TurnSettingsCtxtTmpltReadyToDisplay.bind(this),
            // "displayedFunction": this.ctxtTmpltDisplayed  
        }, // end of "TurnSettings"
        
        "Lighting" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack",
            "sbNameId" : "VehicleSettings",
            "controlProperties": {
                "List2Ctrl" : {                                                            
                    "dataList": this._LightingCtxtDataList, 
                    titleConfiguration : 'listTitle',
                    // thickItems: true,
                    title : {
                        titleStyle : 'style02',  
                        text1Id : 'Lighting',
                    },
                    selectCallback : this.listItemClick,  
                    toggleMinChangeInterval : 1000,
                    toggleSettleTime : 1500,
                    "smallItemText" : true,
                    needDataCallback : null   // Not needed, no dynamic list data
                } // end of properties for "List2Ctrl"                                      
            }, // end of list of controlProperties
            "readyFunction" : this._LightingCtxtTmpltReadyToDisplay.bind(this),
            // "displayedFunction": this.ctxtTmpltDisplayed  
        }, // end of "Lighting"

        //=========================== RESET CONTEXTS =======================
        "DRSSReset" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Settings",
            "leftBtnStyle" : "goBack",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    contentStyle : "style02", 
                    defaultSelectCallback :  this._dialogDefaultSelectCallback.bind(this),
                    buttonCount : 2,
                    buttonConfig : {
                        button1 : {
                            labelId : "common.No", 
                            appData : "no" 
                        },
                        button2 : {
                            labelId : "common.Yes", 
                            appData : "yes" 
                        }
                    },
                    text1Id : 'DRSSReset',     
                    "fullScreen" : true,
                } // end of properties for "DialogCtrl"                                       
            }, // end of list of controlProperties 
            "readyFunction" : this._DRSSResetCtxtTmpltReadyToDisplay.bind(this),
        }, // end of "DRSSReset"
        
        "DRSSResetProgress" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Settings",
            "leftBtnStyle" : "goBack",
            "controlProperties": {
                "Dialog3Ctrl" : { 
                    contentStyle : "style14",  
                    text1Id : 'DRSSResetProgress',    
                    "fullScreen" : true,
                    "meter" : {"meterType":"indeterminate", "meterPath":"common/images/IndeterminateMeter.png"},
                } // end of properties for "DialogCtrl"                                       
            }, // end of list of controlProperties 
        }, // end of "DRSSResetProgress"
        
        "DRSSResetError" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Settings",
            "leftBtnStyle" : "goBack",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    contentStyle : "style02", 
                    defaultSelectCallback :  this._dialogDefaultSelectCallback.bind(this),
                    buttonCount : 2,
                    buttonConfig : {
                        button1 : {
                            labelId : "common.Yes", 
                            appData : "yes" 
                        },
                        button2 : {
                            labelId : "common.No", 
                            appData : "no" 
                        }
                    },
                    text1Id : 'DRSSResetError',     
                    "fullScreen" : true,
                } // end of properties for "DialogCtrl"                                       
            }, // end of list of controlProperties 
            "readyFunction" : this._DRSSResetErrorCtxtTmpltReadyToDisplay.bind(this),
        }, // end of "DRSSResetError"
        
        "SBSReset" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Settings",
            "leftBtnStyle" : "goBack",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    contentStyle : "style02", 
                    defaultSelectCallback :  this._dialogDefaultSelectCallback.bind(this),
                    buttonCount : 2,
                    buttonConfig : {
                        button1 : {
                            labelId : "common.No", 
                            appData : "no" 
                        },
                        button2 : {
                            labelId : "common.Yes", 
                            appData : "yes" 
                        }
                    },
                    text1Id : 'SBSReset',     
                    "fullScreen" : true,
                } // end of properties for "DialogCtrl"                                       
            }, // end of list of controlProperties 
            "readyFunction" : this._SBSResetCtxtTmpltReadyToDisplay.bind(this),
        }, // end of "SBSReset"
        
        "SBSResetProgress" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Settings",
            "leftBtnStyle" : "goBack",
            "controlProperties": {
                "Dialog3Ctrl" : { 
                    contentStyle : "style14",  
                    text1Id : 'SBSResetProgress',    
                    "fullScreen" : true,
                    "meter" : {"meterType":"indeterminate", "meterPath":"common/images/IndeterminateMeter.png"},
                } // end of properties for "DialogCtrl"                                       
            }, // end of list of controlProperties 
        }, // end of "SBSResetProgress"
        
        "SBSResetError" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Settings",
            "leftBtnStyle" : "goBack",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    contentStyle : "style02", 
                    defaultSelectCallback :  this._dialogDefaultSelectCallback.bind(this),
                    buttonCount : 2,
                    buttonConfig : {
                        button1 : {
                            labelId : "common.Yes", 
                            appData : "yes" 
                        },
                        button2 : {
                            labelId : "common.No", 
                            appData : "no" 
                        }
                    },
                    text1Id : 'SBSResetError',     
                    "fullScreen" : true,
                } // end of properties for "DialogCtrl"                                       
            }, // end of list of controlProperties 
            "readyFunction" : this._SBSResetErrorCtxtTmpltReadyToDisplay.bind(this),
        }, // end of "SBSResetError"
        
        "SBS_SCBSReset" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Settings",
            "leftBtnStyle" : "goBack",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    contentStyle : "style02", 
                    defaultSelectCallback :  this._dialogDefaultSelectCallback.bind(this),
                    buttonCount : 2,
                    buttonConfig : {
                        button1 : {
                            labelId : "common.No", 
                            appData : "no" 
                        },
                        button2 : {
                            labelId : "common.Yes", 
                            appData : "yes" 
                        }
                    },
                    text1Id : 'SBS_SCBSReset',     
                    "fullScreen" : true,
                } // end of properties for "DialogCtrl"                                       
            }, // end of list of controlProperties 
            "readyFunction" : this._SBS_SCBSResetCtxtTmpltReadyToDisplay.bind(this),
        }, // end of "SBS_SCBSReset"
        
        "SBS_SCBSResetProgress" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Settings",
            "leftBtnStyle" : "goBack",
            "controlProperties": {
                "Dialog3Ctrl" : { 
                    contentStyle : "style14",  
                    text1Id : 'SBS_SCBSResetProgress',    
                    "fullScreen" : true,
                    "meter" : {"meterType":"indeterminate", "meterPath":"common/images/IndeterminateMeter.png"},
                } // end of properties for "DialogCtrl"                                       
            }, // end of list of controlProperties 
        }, // end of "SBS_SCBSResetProgress"
        
        "SBS_SCBSResetError" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Settings",
            "leftBtnStyle" : "goBack",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    contentStyle : "style02", 
                    defaultSelectCallback :  this._dialogDefaultSelectCallback.bind(this),
                    buttonCount : 2,
                    buttonConfig : {
                        button1 : {
                            labelId : "common.No", 
                            appData : "no" 
                        },
                        button2 : {
                            labelId : "common.Yes", 
                            appData : "yes" 
                        }
                    },
                    text1Id : 'SBS_SCBSResetError',     
                    "fullScreen" : true,
                } // end of properties for "DialogCtrl"                                       
            }, // end of list of controlProperties 
            "readyFunction" : this._SBS_SCBSResetErrorCtxtTmpltReadyToDisplay.bind(this),
        }, // end of "SBS_SCBSResetError"

        "FOWReset" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Settings",
            "leftBtnStyle" : "goBack",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    contentStyle : "style02", 
                    defaultSelectCallback :  this._dialogDefaultSelectCallback.bind(this),
                    buttonCount : 2,
                    buttonConfig : {
                        button1 : {
                            labelId : "common.No", 
                            appData : "no" 
                        },
                        button2 : {
                            labelId : "common.Yes", 
                            appData : "yes" 
                        }
                    },
                    text1Id : 'FOWReset',     
                    "fullScreen" : true,
                } // end of properties for "DialogCtrl"                                       
            }, // end of list of controlProperties 
            "readyFunction" : this._FOWResetCtxtTmpltReadyToDisplay.bind(this),
        }, // end of "FOWReset"
        
        "FOWResetProgress" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Settings",
            "leftBtnStyle" : "goBack",
            "controlProperties": {
                "Dialog3Ctrl" : { 
                    contentStyle : "style14",  
                    text1Id : 'FOWResetProgress',    
                    "fullScreen" : true,
                    "meter" : {"meterType":"indeterminate", "meterPath":"common/images/IndeterminateMeter.png"},
                } // end of properties for "DialogCtrl"                                       
            }, // end of list of controlProperties 
        }, // end of "FOWResetProgress"
        
        "FOWResetError" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Settings",
            "leftBtnStyle" : "goBack",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    contentStyle : "style02", 
                    defaultSelectCallback :  this._dialogDefaultSelectCallback.bind(this),
                    buttonCount : 2,
                    buttonConfig : {
                        button1 : {
                            labelId : "common.No", 
                            appData : "no" 
                        },
                        button2 : {
                            labelId : "common.Yes", 
                            appData : "yes" 
                        }
                    },
                    text1Id : 'FOWResetError',     
                    "fullScreen" : true,
                } // end of properties for "DialogCtrl"                                       
            }, // end of list of controlProperties 
            "readyFunction" : this._FOWResetErrorCtxtTmpltReadyToDisplay.bind(this),
        }, // end of "FOWResetError"

        "LDWSReset" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Settings",
            "leftBtnStyle" : "goBack",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    contentStyle : "style02", 
                    defaultSelectCallback :  this._dialogDefaultSelectCallback.bind(this),
                    buttonCount : 2,
                    buttonConfig : {
                        button1 : {
                            labelId : "common.No", 
                            appData : "no" 
                        },
                        button2 : {
                            labelId : "common.Yes", 
                            appData : "yes" 
                        }
                    },
                    text1Id : 'LDWSReset',     
                    "fullScreen" : true,
                } // end of properties for "DialogCtrl"                                       
            }, // end of list of controlProperties 
            "readyFunction" : this._LDWSResetCtxtTmpltReadyToDisplay.bind(this),
        }, // end of "LDWSReset"
        
        "LDWSResetProgress" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Settings",
            "leftBtnStyle" : "goBack",
            "controlProperties": {
                "Dialog3Ctrl" : { 
                    contentStyle : "style14",  
                    text1Id : 'LDWSResetProgress',    
                    "fullScreen" : true,
                    "meter" : {"meterType":"indeterminate", "meterPath":"common/images/IndeterminateMeter.png"},
                } // end of properties for "DialogCtrl"                                       
            }, // end of list of controlProperties 
        }, // end of "LDWSResetProgress"
        
        "LDWSResetError" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Settings",
            "leftBtnStyle" : "goBack",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    contentStyle : "style02", 
                    defaultSelectCallback :  this._dialogDefaultSelectCallback.bind(this),
                    buttonCount : 2,
                    buttonConfig : {
                        button1 : {
                            labelId : "common.No", 
                            appData : "no" 
                        },
                        button2 : {
                            labelId : "common.Yes", 
                            appData : "yes" 
                        }
                    },
                    text1Id : 'LDWSResetError',     
                    text2Id : 'LDWSResetErrorConfirmation',
                    "fullScreen" : true,
                } // end of properties for "DialogCtrl"                                       
            }, // end of list of controlProperties 
            "readyFunction" : this._LDWSResetErrorCtxtTmpltReadyToDisplay.bind(this),
        }, // end of "LDWSResetError"
        
        "LightingReset" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Settings",
            "leftBtnStyle" : "goBack",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    contentStyle : "style02", 
                    defaultSelectCallback :  this._dialogDefaultSelectCallback.bind(this),
                    buttonCount : 2,
                    buttonConfig : {
                        button1 : {
                            labelId : "common.No", 
                            appData : "no" 
                        },
                        button2 : {
                            labelId : "common.Yes", 
                            appData : "yes" 
                        }
                    },
                    text1Id : 'LightingReset',     
                    "fullScreen" : true,
                } // end of properties for "DialogCtrl"                                       
            }, // end of list of controlProperties 
            "readyFunction" : this._LightingResetCtxtTmpltReadyToDisplay.bind(this),
        }, // end of "LightingReset"
        
        "LightingResetProgress" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Settings",
            "leftBtnStyle" : "goBack",
            "controlProperties": {
                "Dialog3Ctrl" : { 
                    contentStyle : "style14",  
                    text1Id : 'LightingResetProgress',    
                    "fullScreen" : true,
                    "meter" : {"meterType":"indeterminate", "meterPath":"common/images/IndeterminateMeter.png"},
                } // end of properties for "DialogCtrl"                                       
            }, // end of list of controlProperties 
        }, // end of "LightingResetProgress"
        
        "LightingResetError" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Settings",
            "leftBtnStyle" : "goBack",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    contentStyle : "style02", 
                    defaultSelectCallback :  this._dialogDefaultSelectCallback.bind(this),
                    buttonCount : 2,
                    buttonConfig : {
                        button1 : {
                            labelId : "common.No", 
                            appData : "no" 
                        },
                        button2 : {
                            labelId : "common.Yes", 
                            appData : "yes" 
                        }
                    },
                    text1Id : 'LightingResetError',     
                    "fullScreen" : true,
                } // end of properties for "DialogCtrl"                                       
            }, // end of list of controlProperties 
            "readyFunction" : this._LightingResetErrorCtxtTmpltReadyToDisplay.bind(this),
        }, // end of "LightingResetError"
        
        
        "DoorLockReset" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Settings",
            "leftBtnStyle" : "goBack",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    contentStyle : "style02", 
                    defaultSelectCallback :  this._dialogDefaultSelectCallback.bind(this),
                    buttonCount : 2,
                    buttonConfig : {
                        button1 : {
                            labelId : "common.No", 
                            appData : "no" 
                        },
                        button2 : {
                            labelId : "common.Yes", 
                            appData : "yes" 
                        }
                    },
                    text1Id : 'DoorLockReset',     
                    "fullScreen" : true,
                } // end of properties for "DialogCtrl"                                       
            }, // end of list of controlProperties 
            "readyFunction" : this._DoorLockResetCtxtTmpltReadyToDisplay.bind(this),
        }, // end of "DoorLockReset"
        
        "DoorLockResetProgress" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Settings",
            "leftBtnStyle" : "goBack",
            "controlProperties": {
                "Dialog3Ctrl" : { 
                    contentStyle : "style14",  
                    "fullScreen" : true,
                    "meter" : {"meterType":"indeterminate", "meterPath":"common/images/IndeterminateMeter.png"},
                    text1Id : 'DoorLockResetProgress',    
                } // end of properties for "DialogCtrl"                                       
            }, // end of list of controlProperties 
        }, // end of "DoorLockResetProgress"
        
        "DoorLockResetError" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Settings",
            "leftBtnStyle" : "goBack",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    contentStyle : "style02", 
                    defaultSelectCallback :  this._dialogDefaultSelectCallback.bind(this),
                    buttonCount : 2,
                    buttonConfig : {
                        button1 : {
                            labelId : "common.No", 
                            appData : "no" 
                        },
                        button2 : {
                            labelId : "common.Yes", 
                            appData : "yes" 
                        }
                    },
                    text1Id : 'DoorLockResetError',     
                    "fullScreen" : true,
                } // end of properties for "DialogCtrl"                                       
            }, // end of list of controlProperties 
            "readyFunction" : this._DoorLockResetErrorCtxtTmpltReadyToDisplay.bind(this),
        }, // end of "DoorLockResetError"

        "TurnReset" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Settings",
            "leftBtnStyle" : "goBack",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    contentStyle : "style02", 
                    defaultSelectCallback :  this._dialogDefaultSelectCallback.bind(this),
                    buttonCount : 2,
                    buttonConfig : {
                        button1 : {
                            labelId : "common.No", 
                            appData : "no" 
                        },
                        button2 : {
                            labelId : "common.Yes", 
                            appData : "yes" 
                        }
                    },
                    text1Id : 'TurnReset',     
                    "fullScreen" : true,
                } // end of properties for "DialogCtrl"                                       
            }, // end of list of controlProperties 
            "readyFunction" : this._TurnResetCtxtTmpltReadyToDisplay.bind(this),
        }, // end of "TurnReset"
        
        "TurnProgress" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Settings",
            "leftBtnStyle" : "goBack",
            "controlProperties": {
                "Dialog3Ctrl" : { 
                    contentStyle : "style14", 
                    "fullScreen" : true,
                    "meter" : {"meterType":"indeterminate", "meterPath":"common/images/IndeterminateMeter.png"},
                    text1Id : 'TurnProgress',    
                } // end of properties for "DialogCtrl"                                       
            }, // end of list of controlProperties 
        }, // end of "TurnProgress"
        
        "TurnResetError" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Settings",
            "leftBtnStyle" : "goBack",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    contentStyle : "style02", 
                    defaultSelectCallback :  this._dialogDefaultSelectCallback.bind(this),
                    buttonCount : 2,
                    buttonConfig : {
                        button1 : {
                            labelId : "common.No", 
                            appData : "no" 
                        },
                        button2 : {
                            labelId : "common.Yes", 
                            appData : "yes" 
                        }
                    },
                    text1Id : 'TurnResetError',     
                    "fullScreen" : true,
                } // end of properties for "DialogCtrl"                                       
            }, // end of list of controlProperties 
            "readyFunction" : this._TurnResetErrorCtxtTmpltReadyToDisplay.bind(this),
        }, // end of "TurnResetError"
        

        "HUDReset" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Settings",
            "leftBtnStyle" : "goBack",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    contentStyle : "style02", 
                    defaultSelectCallback :   this._dialogDefaultSelectCallback.bind(this),
                    buttonCount : 2,
                    buttonConfig : {
                        button1 : {
                            labelId : "common.No", 
                            appData : "no" 
                        },
                        button2 : {
                            labelId : "common.Yes", 
                            appData : "yes" 
                        }
                    },
                    text1Id : 'HUDReset',     
                    "fullScreen" : true,
                } // end of properties for "DialogCtrl"                                       
            }, // end of list of controlProperties 
            "readyFunction" : this._HUDResetResetCtxtTmpltReadyToDisplay.bind(this),
        }, // end of "HUDReset"
        
        "HUDProgress" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Settings",
            "leftBtnStyle" : "goBack",
            "controlProperties": {
                "Dialog3Ctrl" : { 
                    contentStyle : "style14",  
                    "fullScreen" : true,
                    "text1Id" : 'HUDResetProgress',
                    "meter" : {"meterType":"indeterminate", "meterPath":"common/images/IndeterminateMeter.png"},
                } // end of properties for "DialogCtrl"                                       
            }, // end of list of controlProperties 
        }, // end of "HUDProgress"
        
        "HUDResetError" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Settings",
            "leftBtnStyle" : "goBack",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    contentStyle : "style02", 
                    defaultSelectCallback :  this._dialogDefaultSelectCallback.bind(this),
                    buttonCount : 2,
                    buttonConfig : {
                        button1 : {
                            labelId : "common.No", 
                            appData : "no" 
                        },
                        button2 : {
                            labelId : "common.Yes", 
                            appData : "yes" 
                        }
                    },
                    text1Id : 'HUDResetError',     
                    "fullScreen" : true,
                } // end of properties for "DialogCtrl"                                       
            }, // end of list of controlProperties 
            "readyFunction" : this._HUDResetResetErrorCtxtTmpltReadyToDisplay.bind(this),
        }, // end of "HUDResetError" 
    
        
        "LASReset" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Settings",
            "leftBtnStyle" : "goBack",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    contentStyle : "style02", 
                    defaultSelectCallback :  this._dialogDefaultSelectCallback.bind(this),
                    buttonCount : 2,
                    buttonConfig : {
                        button1 : {
                            labelId : "common.No", 
                            appData : "no" 
                        },
                        button2 : {
                            labelId : "common.Yes", 
                            appData : "yes" 
                        }
                    },
                    text1Id : 'LASDefaultValues',     
                    "fullScreen" : true,
                } // end of properties for "DialogCtrl"                                       
            }, // end of list of controlProperties 
            "readyFunction" : this._LASResetCtxtTmpltReadyToDisplay.bind(this),
        }, // end of "LASReset"
        
        "LASResetProgress" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Settings",
            "leftBtnStyle" : "goBack",
            "controlProperties": {
                "Dialog3Ctrl" : { 
                    contentStyle : "style14",  
                    text1Id : 'ChangingLASSettings',    
                    "fullScreen" : true,
                    "meter" : {"meterType":"indeterminate", "meterPath":"common/images/IndeterminateMeter.png"},
                } // end of properties for "DialogCtrl"                                       
            }, // end of list of controlProperties 
        }, // end of "LASResetProgress"
        
        "LASResetError" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Settings",
            "leftBtnStyle" : "goBack",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    contentStyle : "style02", 
                    defaultSelectCallback :  this._dialogDefaultSelectCallback.bind(this),
                    buttonCount : 2,
                    buttonConfig : {
                        button1 : {
                            labelId : "common.No", 
                            appData : "no" 
                        },
                        button2 : {
                            labelId : "common.Yes", 
                            appData : "yes" 
                        }
                    },
                    text1Id : 'ErrorLASSettings',     
                    //text2Id : 'LASResetErrorConfirmation',
                    "fullScreen" : true,
                } // end of properties for "DialogCtrl"                                       
            }, // end of list of controlProperties 
            "readyFunction" : this._LASResetErrorCtxtTmpltReadyToDisplay.bind(this),
        }, // end of "LASResetError"

        
        
        
        
        
        
        
    //=========================== END RESET CONTEXTS =======================
    }; // 
    //@formatter:on 
    this._messageTable = {
        //HUD: ----------------------------------------------------------------------
        "Hud_Installed" : this._HudInstalledMsgHandler.bind(this),  
        "HUDHeight" : this._HudTiltMsgHandler.bind(this), 
        "HUDDisplay" : this._HudOnOffStatusMsgHandler.bind(this),
        "HUDBrightness" : this._HudIntensityMsgHandler.bind(this), 
        "HUDNavigation" : this._HudTurnByTurnMsgHandler.bind(this),   
        "HUDBrightnessControl" : this._HudAutoIntensityOnOffMsgHandler.bind(this), 
        "HUDCalibration"  : this._HudCalibrationMsgHandler.bind(this), 
        "Hud_ControlAllowed" : this._HudControlAllowedMsgHandler.bind(this),
        "HUDError" : this._HudErrorMsgHandler.bind(this),
        //SAFETY: ----------------------------------------------------------------------
        "GetLASIntervention" : this._InterventionMsgHandler.bind(this),
        "GetLASAlert" : this._LASAlertMsgHandler.bind(this),
        "GetDA" : this._DA_InstalledMsgHandler.bind(this),
		"ParkingSensor_Installed": this._PSI_InstalledMsgHandler.bind(this),
		"GetParkingSensor": this._ParkingSensorIndicationMsgHandler.bind(this),
		"SBS_Installed" : this._SBS_InstalledMsgHandler.bind(this),  
        "FOW_Installed" : this._FOW_InstalledMsgHandler.bind(this),
        "RVM_Installed" : this._RVM_InstalledMsgHandler.bind(this),  
        "BSM_Installed" : this._BSM_InstalledMsgHandler.bind(this),  
        "LDW_Installed" : this._LDW_InstalledMsgHandler.bind(this), 
        "DRSS_Installed" : this._DRSS_InstalledMsgHandler.bind(this),  
        "SCBS_Installed" : this._SCBS_InstalledMsgHandler.bind(this),  
        "Safety_Installed" : this._Safety_InstalledMsgHandler.bind(this),  //TODO: LOGIC NOT IMPLEMENTED 
        "GetDRSS" : this._DRSS_DRSSMsgHandler.bind(this),
        "GetFOW" : this._FOW_WarningMsgHandler.bind(this),
        "GetSBS" : this._SBS_BrakeSupportMsgHandler.bind(this),
        "GetSBSDistance" : this._SBS_DistanceMsgHandler.bind(this),
        "GetSCBS" : this._SBS_CityBrakeSystemMsgHandler.bind(this),
        "GetFOWDistance" : this._FOW_DistanceMsgHandler.bind(this),
        "GetBSMBuzzerVolume" : this._BSM_VolumeMsgHandler.bind(this), 
        "GetRVMBuzzerVolume" : this._RVM_VolumeMsgHandler.bind(this), 
        "GetSBSBuzzerVolume" : this._SBS_BuzzerVolumeMsgHandler.bind(this),
        "GetBuzzerSetting" : this._LDWS_BuzzerSettingMsgHandler.bind(this),
        "GetDRSSDistance" : this._DRSS_DRSSSensitivityMsgHandler.bind(this),
        "GetFOWBuzzerVolume" : this._FOW_BuzzerVolumeMsgHandler.bind(this), 
        "GetLDWSBuzzerVolume" : this._LDWS_BuzzerVolumeMsgHandler.bind(this),
        "GetLASSoundVol":this._LAS_SoundVolumeMsgHandler.bind(this),
        "GetLDWSTiming" : this._LDWS_SensitivityForWideRangeMsgHandler.bind(this),
        "GetLASSound" : this._LAS_SoundMsgHandler.bind(this),       
        "GetLDWSRumbleVolume" : this._LDWS_RumbleStripsVolumeMsgHandler.bind(this),
        "GetLDWSWarning" : this._LDWS_SensitivityWarningCancelationMsgHandler.bind(this),
        //VEHICLE: ----------------------------------------------------------------------
        "GetUnlockMode" : this._Keyless_UnlockModeMsgHandler.bind(this),
        "GetHBC" : this._Headlight_HighBeamControllMsgHandler.bind(this),
        "GetAFS": this._AFSMsgHandler.bind(this),
        "GetAutoDoorLockAT" : this._Vehicle_AutoDoorLockAT_MsgHandler.bind(this),
        "GetAutoDoorLockAT6" : this._Vehicle_AutoDoorLockAT6_MsgHandler.bind(this),
        "GetAutoDoorLockMT" : this._Vehicle_AutoDoorLockMT_MsgHandler.bind(this),
        "GetWalkAwayLock" : this._Keyless_WalkAwayLockMsgHandler.bind(this),
        "GetRainSensingWiper" : this._Safety_AutoWiperMsgHandler.bind(this), 
        "AutoWiper_Installed": this._AutoWiper_InstalledMsgHandler.bind(this), 
        "GetAutoRelockTimer" : this._Safety_AutoRelockTimerMsgHandler.bind(this),
        "Get3FlashTurnSignal" : this._Safety_3flashTurnSignalMsgHandler.bind(this),
        "GetDRL" : this._GetDaytimeRunningLightsMsgHandler.bind(this),
        "GetHeadlightOffTimer" : this._Headlight_HeadlightOffTimerMsgHandler.bind(this),
        "GetHeadlightOnWarning" : this._Headlight_HeadlightOnWaringMsgHandler.bind(this),
        "GetCHLT" : this._CHLTMsgHandler.bind(this),
        "GetLHL" : this._LHLMsgHandler.bind(this),
        "GetKeylessLockBeepVol" : this._Safety_AutoDoorLockChimeVolumeMsgHandler.bind(this), 
        "GetTurnSignalIndicatorVolume" : this._Safety_TurnSignalIndicatorVolumeMsgHandler.bind(this), 
        "GetAutoHeadlightSensitivity" : this._Headlight_AutoHeadlightsSensitivityMsgHandler.bind(this),
        "GetInteriorLightTimeoutDoorOpen" : this._Safety_InterioLightTimeoutDoorOpenMsgHandler.bind(this),
        "GetInteriorLightTimeoutDoorClosed" : this._Safety_InterioLightTimeoutDoorClosedMsgHandler.bind(this), 
        //TODO: LOGIC NOT IMPLEMENTED ----------------------------------------------------------------------
        "set_failed": this._set_failedMsgHandler.bind(this),
        "HBC_Installed" : this._HBC_InstalledMsgHandler.bind(this),
        "AHBC_Installed" : this._AHBC_InstalledMsgHandler.bind(this),
        "LDWSSound_Installed" : this._LDWSSound_InstalledMsgHandler.bind(this),
        "AFS_Installed": this._AFS_InstalledMsgHandler.bind(this),
        "WalkAway_Installed" : this._WalkAway_InstalledMsgHandler.bind(this),
        "ThreeFlash_Installed" : this._ThreeFlash_InstalledMsgHandler.bind(this),
        "UnlockMode_Installed" : this._UnlockMode_InstalledMsgHandler.bind(this),
        "HeadlightON_Installed" : this._HeadlightON_InstalledMsgHandler.bind(this),
        "AutoDoorLockAT6_Installed" : this._AutoDoorLockAT6_InstalledMsgHandler.bind(this),
        "CHLT_Installed" : this._CHLT_InstalledMsgHandler.bind(this),
        "LHL_Installed" : this._LHL_InstalledMsgHandler.bind(this),
        "AutoDoorLockAT_Installed" : this._AutoDoorLockAT_InstalledMsgHandler.bind(this),
        "AutoDoorLockMT_Installed" : this._AutoDoorLockMT_InstalledMsgHandler.bind(this),
        "HeadOffTimer_Installed" : this._HeadOffTimer_InstalledMsgHandler.bind(this),
        "AutoDoorRelock_Installed" : this._AutoDoorRelock_InstalledMsgHandler.bind(this),
        "TurnSignalVolume_Installed" : this._TurnSignalVolume_InstalledMsgHandler.bind(this),
        "BuzzerAnswerback_Installed" : this._BuzzerAnswerback_InstalledMsgHandler.bind(this),
        "LightTimeoutDoorOpen_Installed" : this._LightTimeoutDoorOpen_InstalledMsgHandler.bind(this),
        "LightTimeoutDoorClosed_Installed" : this._LightTimeoutDoorClosed_InstalledMsgHandler.bind(this),
        "HeadlightAutoSensitivity_Installed" : this._HeadlightAutoSensitivity_InstalledMsgHandler.bind(this),
        "DRL_Installed" : this._DayTimeRunningLight_InstalledMsgHandler.bind(this),
        "DA_Installed" :  this._DriverAlert_InstalledMsgHandler.bind(this),
        "LAS_Installed" :  this._LaneAssistSystem_InstalledMsgHandler.bind(this),
        "VoltageStatus" : this._VoltageStatusMsgHandler.bind(this), 
        //OBSELETE?----------------------------------------------------------------------
        "HeadLight_Installed" : this._HeadLight_InstalledMsgHandler.bind(this),   //does MMUI still use this?
        "IgnitionStatus" : this._IgnitionStatus_MsgHandler.bind(this),
        "Global.AtSpeed" : this._AtSpeedMsgHandler.bind(this),  
        "Global.NoSpeed" : this._NoSpeedMsgHandler.bind(this),
        "CanStatus" : this._CANStatusMsgHandler.bind(this)
    };
    // end of this._messageTable
    // @formatter:on
    this.populateStatusArrayLighting(); //For Lighting
    this.populateStatusArrayDoorLock();//For Door lock 
    this.populateStatusArrayTurn();//For Turn
    this.populateStatusArrayAutoWiper();
    this.populateStatusArraySafetyTab();
    
    //Set default values for Shared Data at initialization
    framework.setSharedData(this.uiaId, "HudInstalled", false);
    framework.setSharedData(this.uiaId, "IgnitionStatus", true);
    framework.setSharedData(this.uiaId, "CanStatus", true);
}


 
/**************************
 * Context handlers
 **************************/
// HUDTab Context
vehsettingsApp.prototype._HUDTabCtxtTmpltReadyToDisplay = function(params)
{
    log.debug("_HUDTabCtxtTmpltReadyToDisplay called..."); 
    
    this.populateListCtrl(this._currentContextTemplate); 
    if (this._isListChanged === true)
    {
        if (params && params.skipRestore != undefined)
        {
            params.skipRestore = true;
        }
        this._isListChanged = false;
    }
}

// SafetyTab Context
vehsettingsApp.prototype._SafetyTabCtxtTmpltReadyToDisplay = function(params)
{
    log.debug("_SafetyTabCtxtTmpltReadyToDisplay called...");   
    this.populateListCtrl(this._currentContextTemplate);  

    if (this._isListChanged === true)
    {
        if (params && params.skipRestore != undefined)
        {
            params.skipRestore = true;
        }
        this._isListChanged = false;
    }
}

// VehicleSettingsTab Context
vehsettingsApp.prototype._VehicleSettingsTabCtxtTmpltReadyToDisplay = function(params)
{
    log.debug("_VehicleSettingsTabCtxtTmpltReadyToDisplay called...");   
    this.cachedSpeed = framework.common.getAtSpeedValue();
    if (this.cachedSpeed != null)
        this._DisableSpeedRestricted();
    this.populateListCtrl(this._currentContextTemplate);  
    if (this._isListChanged === true)
    {
        if (params && params.skipRestore != undefined)
        {
            params.skipRestore = true;
        }
        this._isListChanged = false;
    }
}

// MIDSettings Context
vehsettingsApp.prototype._MIDSettingsCtxtTmpltReadyToDisplay = function()
{
    log.debug("_MIDSettingsCtxtTmpltReadyToDisplay called...");
    this.populateListCtrl(this._currentContextTemplate);     
}

// DistanceRecoSupportSystem Context
vehsettingsApp.prototype._DistanceRecoSupportSystemCtxtTmpltReadyToDisplay = function()
{
    log.debug("_DistanceRecoSupportSystemCtxtTmpltReadyToDisplay called...");
    this.populateListCtrl(this._currentContextTemplate); 
}

//LAS
vehsettingsApp.prototype._LASCtxtTmpltReadyToDisplay = function()
{
    log.debug("_LASCtxtTmpltReadyToDisplay called...");
    this.populateListCtrl(this._currentContextTemplate);
}


// ForwardObstructionWarning Context
vehsettingsApp.prototype._LASSoundCtxtTmpltReadyToDisplay = function()
{
    log.debug("_LASSoundCtxtTmpltReadyToDisplay called...");
    this.populateListCtrl(this._currentContextTemplate); 
    
}

// ForwardObstructionWarning Context
vehsettingsApp.prototype._ForwardObstructionWarningCtxtTmpltReadyToDisplay = function()
{
    log.debug("_ForwardObstructionWarningCtxtTmpltReadyToDisplay called...");
    this.populateListCtrl(this._currentContextTemplate); 
    
}

// LDWS Context
vehsettingsApp.prototype._LDWSCtxtTmpltReadyToDisplay = function()
{
    log.debug("_LDWSCtxtTmpltReadyToDisplay called...");
    if(framework.localize.getRegion() == "Region_NorthAmerica")
    {
        this._currentContextTemplate.list2Ctrl.dataList.items[0] = this._LDWSCtxtDataListHelper.items[1];
        this._currentContextTemplate.list2Ctrl.dataList.items[1] = this._LDWSCtxtDataListHelper.items[3];
    }
    else
    {
        this._currentContextTemplate.list2Ctrl.dataList.items[0] = this._LDWSCtxtDataListHelper.items[0];
        this._currentContextTemplate.list2Ctrl.dataList.items[1] = this._LDWSCtxtDataListHelper.items[2];
    }

    this._currentContextTemplate.list2Ctrl.updateItems(0,4);
    this.populateListCtrl(this._currentContextTemplate); 
    
}

// LDWSTiming Context
vehsettingsApp.prototype._LDWSTimingCtxtTmpltReadyToDisplay = function()
{
    log.debug("_LDWSTimingCtxtTmpltReadyToDisplay called...");   
    this.populateListCtrl(this._currentContextTemplate);  
}

//LASTiming Context
vehsettingsApp.prototype._LASTimingCtxtTmpltcontextInFunction = function()
{
    log.debug("_LASTimingCtxtTmpltcontextInFunction called...");   
	var LASTimingCtxtDataList = null;
	if(this._cachedIntervention === 1)
	{
		this._contextTable["LASTiming"]["controlProperties"]["List2Ctrl"]["title"]["text1Id"] = "InterventionTiming";
		 LASTimingCtxtDataList = {
			itemCountKnown : true,
			itemCount : 2,
			items: [ 
				{ appData : 'SetLDWSTiming', text1Id : 'LASEarly', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'}, 
				{ appData : 'SetLDWSTiming', text1Id : 'LASLate', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'}, 
			]
		};
	}
	else
	{
		this._contextTable["LASTiming"]["controlProperties"]["List2Ctrl"]["title"]["text1Id"] = "AlertTiming";
		LASTimingCtxtDataList = {
			itemCountKnown : true,
			itemCount : 4,
			items: [ 
				{ appData : 'SetLDWSTiming', text1Id : 'Adaptive', image1:'tick', checked:true, hasCaret : false, itemStyle : 'style03'}, 
				{ appData : 'SetLDWSTiming', text1Id : 'LASEarly', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'}, 
				{ appData : 'SetLDWSTiming', text1Id : 'Med', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'}, 
				{ appData : 'SetLDWSTiming', text1Id : 'LASLate', image1:'tick', checked:false, hasCaret : false, itemStyle : 'style03'}, 
			]
		};
	}
	this._contextTable["LASTiming"]["controlProperties"]["List2Ctrl"]["dataList"] = LASTimingCtxtDataList;
}

//LASTiming Context
vehsettingsApp.prototype._LASTimingCtxtTmpltReadyToDisplay = function()
{
    log.debug("_LASTimingCtxtTmpltReadyToDisplay called...");   
    this.populateListCtrl(this._currentContextTemplate);  
}

// _HeadlightOffTimer  Context
vehsettingsApp.prototype._HeadlightOffTimerCtxtTmpltReadyToDisplay = function()
{
    log.debug("_HeadlightOffTimerCtxtTmpltReadyToDisplay called...");
    this.populateListCtrl(this._currentContextTemplate); 
    
}

//CHLT
vehsettingsApp.prototype._CHLTCtxtTmpltReadyToDisplay = function()
{
    if(this._currentContextTemplate)
    {
		if (this.cachedSpeed != null)
        {
			this._DisableSpeedRestricted();
		}
		
		log.debug("_CHLTCtxtTmpltReadyToDisplay called...");
        this.populateListCtrl(this._currentContextTemplate);
    }
}

// AutoHeadlightSensitivity Context
vehsettingsApp.prototype._AutoHeadlightSensitivityCtxtTmpltReadyToDisplay = function()
{
    log.debug("_AutoHeadlightSensitivityCtxtTmpltReadyToDisplay called...");
    this.populateListCtrl(this._currentContextTemplate); 
    
}
// KeylessSettings Context
vehsettingsApp.prototype._KeylessSettingsCtxtTmpltReadyToDisplay = function()
{
    log.debug("_KeylessSettingsCtxtTmpltReadyToDisplay called...");
    this.populateListCtrl(this._currentContextTemplate); 
    
}

//  SmartBrakeSupport Context
vehsettingsApp.prototype._SmartBrakeSupportCtxtTmpltReadyToDisplay = function()
{
    log.debug("_SmartBrakeSupportCtxtTmpltReadyToDisplay called...");
    if (framework.localize.getRegion() == "Region_Europe")
    {
        this._currentContextTemplate.list2Ctrl.setDataList(this._SmartBrakeSupportHelperCtxtDataList);
        this.populateListCtrl(this._currentContextTemplate);
    }
    else
    {
        this.populateListCtrl(this._currentContextTemplate);
    }
}
//  SmartCityBreakSystem Context
vehsettingsApp.prototype._SmartCityBreakSystemCtxtTmpltReadyToDisplay = function()
{
    log.debug("_SmartCityBreakSystemCtxtTmpltReadyToDisplay called...");
    if (framework.localize.getRegion() == "Region_Europe")
    {
        this._currentContextTemplate.list2Ctrl.setDataList(this._SmartCityBreakSystemHelperCtxtDataList);
        this.populateListCtrl(this._currentContextTemplate);
    }
    else
    {
        this.populateListCtrl(this._currentContextTemplate);
    } 
}


//  RearviewMonitorBuzzerVolume Context
vehsettingsApp.prototype._RearviewMonitorBuzzerVolumeCtxtTmpltReadyToDisplay = function()
{
    log.debug("_RearviewMonitorBuzzerVolumeCtxtTmpltReadyToDisplay called...");
    this.populateListCtrl(this._currentContextTemplate); 
    
}

//  BlindSpotMonitorBuzzerVolume Context
vehsettingsApp.prototype._BlindSpotMonitorBuzzerVolumeCtxtTmpltReadyToDisplay = function()
{
    log.debug("_BlindSpotMonitorBuzzerVolumeCtxtTmpltReadyToDisplay called...");
    this.populateListCtrl(this._currentContextTemplate); 
    
}

// IntLightTimeoutDoorClosed Context
vehsettingsApp.prototype._IntLightTimeoutDoorClosedCtxtTmpltReadyToDisplay = function()
{
    log.debug("_IntLightTimeoutDoorClosedCtxtTmpltReadyToDisplay called...");
    this.populateListCtrl(this._currentContextTemplate); 
    
}

// InteriorLightTimeoutDoorOpen Context
vehsettingsApp.prototype._InteriorLightTimeoutDoorOpenCtxtTmpltReadyToDisplay = function()
{
    log.debug("_InteriorLightTimeoutDoorOpenCtxtTmpltReadyToDisplay called...");
    this.populateListCtrl(this._currentContextTemplate); 
    
}

// AutoDoorLockChimeVolume Context
vehsettingsApp.prototype._KeylessLockBeepVolCtxtTmpltReadyToDisplay = function()
{
    log.debug("_KeylessLockBeepVolCtxtTmpltReadyToDisplay called...");
    this.populateListCtrl(this._currentContextTemplate); 
    
}
 
// DoorRelockTime Context
vehsettingsApp.prototype._DoorRelockTimeCtxtTmpltReadyToDisplay = function()
{
    log.debug("_DoorRelockTimeCtxtTmpltReadyToDisplay called...");
    this.populateListCtrl(this._currentContextTemplate); 
    
}
// UnlockMode Context
vehsettingsApp.prototype._UnlockModeCtxtTmpltReadyToDisplay = function()
{
    log.debug("_UnlockModeCtxtTmpltReadyToDisplay called...");
    this.populateListCtrl(this._currentContextTemplate); 
    
}

// AutoDoorLock Context
vehsettingsApp.prototype._AutoDoorLockCtxtTmpltReadyToDisplay = function(params)
{
    log.debug("_AutoDoorLockCtxtTmpltReadyToDisplay called...");
    this.cachedSpeed = framework.common.getAtSpeedValue();
    if (this.cachedSpeed != null)
        this._DisableSpeedRestricted();
    this.populateListCtrl(this._currentContextTemplate);
    if (this._isListChanged === true)
    {
        if (params && params.skipRestore != undefined)
        {
            params.skipRestore = true;
        }
        this._isListChanged = false;
    }
}
//Lighting Context
vehsettingsApp.prototype._LightingCtxtTmpltReadyToDisplay = function(params)
{
    log.debug("_LightingCtxtTmpltReadyToDisplay called...");
    this.cachedSpeed = framework.common.getAtSpeedValue();
    if (this.cachedSpeed != null)
        this._DisableSpeedRestricted();
    this.populateListCtrl(this._currentContextTemplate);
    if (this._isListChanged === true)
    {
        if (params && params.skipRestore != undefined)
        {
            params.skipRestore = true;
        }
        this._isListChanged = false;
    }
}

// DoorLockMode Context
vehsettingsApp.prototype._DoorLockModeCtxtTmpltReadyToDisplay = function(params)
{
    log.debug("_DoorLockModeCtxtTmpltReadyToDisplay called...");
    this.populateListCtrl(this._currentContextTemplate); 
    
    if (this._isListChanged === true)
    {
        if (params && params.skipRestore != undefined)
        {
            params.skipRestore = true;
        }
        this._isListChanged = false;
    }
}
// TurnSettings Context
vehsettingsApp.prototype._TurnSettingsCtxtTmpltReadyToDisplay = function(params)
{
    log.debug("_TurnSettingsCtxtTmpltReadyToDisplay called...");
    this.populateListCtrl(this._currentContextTemplate); 
    if (this._isListChanged === true)
    {
        if (params && params.skipRestore != undefined)
        {
            params.skipRestore = true;
        }
        this._isListChanged = false;
    }
    this.cachedSpeed = framework.common.getAtSpeedValue();
    if (this.cachedSpeed != null)
        this._DisableSpeedRestricted();    
}
//DoorLock Reset
vehsettingsApp.prototype._DoorLockResetCtxtTmpltReadyToDisplay = function()
{
    log.debug("vehsettingsApp _DoorLockResetCtxtTmpltReadyToDisplay called...");
    this.cachedSpeed = framework.common.getAtSpeedValue();
    if (this.cachedSpeed != null)
        this._DisableSpeedRestricted();
    if(this._currentContextTemplate)
    {
        this._populateDialogCtrl(this._currentContextTemplate); 
    }   
}
// //DoorLock Reset Error
vehsettingsApp.prototype._DoorLockResetErrorCtxtTmpltReadyToDisplay = function()
{
    log.debug("vehsettingsApp _DoorLockResetCtxtTmpltReadyToDisplay called...");
    this.cachedSpeed = framework.common.getAtSpeedValue();
    if (this.cachedSpeed != null)
        this._DisableSpeedRestricted();
    if(this._currentContextTemplate)
    {
        this._populateDialogCtrl(this._currentContextTemplate); 
    }   
}
//Turn Reset
vehsettingsApp.prototype._TurnResetCtxtTmpltReadyToDisplay= function()
{
    log.debug("vehsettingsApp _TurnResetCtxtTmpltReadyToDisplay called...");
    this.cachedSpeed = framework.common.getAtSpeedValue();
    if (this.cachedSpeed != null)
        this._DisableSpeedRestricted();
    if(this._currentContextTemplate)
    {
        this._populateDialogCtrl(this._currentContextTemplate); 
    }   
}
//Turn ResetError
vehsettingsApp.prototype._TurnResetErrorCtxtTmpltReadyToDisplay= function()
{
    log.debug("vehsettingsApp _TurnResetErrorCtxtTmpltReadyToDisplay called...");

    this.cachedSpeed = framework.common.getAtSpeedValue();
    if (this.cachedSpeed != null)
        this._DisableSpeedRestricted();
    if(this._currentContextTemplate)
    {
        this._populateDialogCtrl(this._currentContextTemplate); 
    }   
}
//HUDReset
vehsettingsApp.prototype._HUDResetResetCtxtTmpltReadyToDisplay= function()
{
    log.debug("vehsettingsApp _TurnResetErrorCtxtTmpltReadyToDisplay called...");
    if(this._currentContextTemplate)
    {
        this._populateDialogCtrl(this._currentContextTemplate); 
    }   
}
//HUDResetError
vehsettingsApp.prototype._HUDResetResetErrorCtxtTmpltReadyToDisplay= function()
{
    log.debug("vehsettingsApp _TurnResetErrorCtxtTmpltReadyToDisplay called...");
    if(this._currentContextTemplate)
    {
        this._populateDialogCtrl(this._currentContextTemplate); 
    }   
}
//LightingReset
vehsettingsApp.prototype._LightingResetCtxtTmpltReadyToDisplay= function()
{
    log.debug("vehsettingsApp _TurnResetErrorCtxtTmpltReadyToDisplay called...");
    this.cachedSpeed = framework.common.getAtSpeedValue();
    if (this.cachedSpeed != null)
        this._DisableSpeedRestricted();
    if(this._currentContextTemplate)
    {
        this._populateDialogCtrl(this._currentContextTemplate); 
    }   
}
//LightingResetError
vehsettingsApp.prototype._LightingResetErrorCtxtTmpltReadyToDisplay= function()
{
    log.debug("vehsettingsApp _TurnResetErrorCtxtTmpltReadyToDisplay called...");
    this.cachedSpeed = framework.common.getAtSpeedValue();
    if (this.cachedSpeed != null)
        this._DisableSpeedRestricted();
    if(this._currentContextTemplate)
    {
        this._populateDialogCtrl(this._currentContextTemplate); 
    }   
}

vehsettingsApp.prototype._DRSSResetCtxtTmpltReadyToDisplay= function()
{
    if(this._currentContextTemplate)
    {
        this._populateDialogCtrl(this._currentContextTemplate); 
    }
}
vehsettingsApp.prototype._DRSSResetErrorCtxtTmpltReadyToDisplay= function()
{
    if(this._currentContextTemplate)
    {
        this._populateDialogCtrl(this._currentContextTemplate); 
    }
}
vehsettingsApp.prototype._SBSResetCtxtTmpltReadyToDisplay= function()
{
    if(this._currentContextTemplate)
    {
        this._populateDialogCtrl(this._currentContextTemplate); 
    }   
}
vehsettingsApp.prototype._SBSResetErrorCtxtTmpltReadyToDisplay= function()
{
    if(this._currentContextTemplate)
    {
        this._populateDialogCtrl(this._currentContextTemplate); 
    }
}
vehsettingsApp.prototype._SBS_SCBSResetCtxtTmpltReadyToDisplay= function()
{
    if(this._currentContextTemplate)
    {
        this._populateDialogCtrl(this._currentContextTemplate); 
    }
}
vehsettingsApp.prototype._SBS_SCBSResetErrorCtxtTmpltReadyToDisplay= function()
{
    if(this._currentContextTemplate)
    {
        this._populateDialogCtrl(this._currentContextTemplate); 
    }
}
vehsettingsApp.prototype._FOWResetErrorCtxtTmpltReadyToDisplay= function()
{
    if(this._currentContextTemplate)
    {
        this._populateDialogCtrl(this._currentContextTemplate); 
    }
}
vehsettingsApp.prototype._FOWResetCtxtTmpltReadyToDisplay= function()
{
    if(this._currentContextTemplate)
    {
        this._populateDialogCtrl(this._currentContextTemplate); 
    }
}
vehsettingsApp.prototype._LDWSResetCtxtTmpltReadyToDisplay= function()
{
    if(this._currentContextTemplate)
    {
        this._populateDialogCtrl(this._currentContextTemplate); 
    }
}
vehsettingsApp.prototype._LDWSResetErrorCtxtTmpltReadyToDisplay= function()
{
    if(this._currentContextTemplate)
    {
        this._populateDialogCtrl(this._currentContextTemplate); 
    }
}
vehsettingsApp.prototype._LASResetCtxtTmpltReadyToDisplay= function()
{
    if(this._currentContextTemplate)
    {
        this._populateDialogCtrl(this._currentContextTemplate); 
    }
}
vehsettingsApp.prototype._LASResetErrorCtxtTmpltReadyToDisplay= function()
{
    if(this._currentContextTemplate)
    {
        this._populateDialogCtrl(this._currentContextTemplate); 
    }
}
/*******************************************************************************
 * Message handlers
 ******************************************************************************/
// Safety
vehsettingsApp.prototype._DA_InstalledMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined)
    {
        log.info("DA msg Handler called with msg" + msg);
        this._cachedDA = msg.params.payload.evData; 
        // populate
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "SafetyTab")
            {
                //this._currentContextTemplate.list2Ctrl.setToggleValue(9,this._cachedDA);
                this.populateListCtrl(this._currentContextTemplate);
            }
        }
    }
}
vehsettingsApp.prototype._LASAlertMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined)
    {
        log.info("LASalert msg handler called with msg" + msg);
        this._cachedLASAlert = msg.params.payload.evData; 
        // populate
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "LAS")
            {
                //this._currentContextTemplate.list2Ctrl.setToggleValue(1,this._cachedLASAlert);
                this.populateListCtrl(this._currentContextTemplate);
            }
        }
    }
}
vehsettingsApp.prototype._ParkingSensorIndicationMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.parkingSensorSetting != null && msg.params.payload.parkingSensorSetting != undefined)
    {
        log.info("ParkingSensorIndication msg handler called with msg" + msg.params.payload.parkingSensorSetting);
        this._cachedPSI = msg.params.payload.parkingSensorSetting; 
        // populate
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "SafetyTab")
            {
                this.populateListCtrl(this._currentContextTemplate);
            }
        }
    }
}
vehsettingsApp.prototype._InterventionMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined)
    {
        log.info("Intervention msg handler called with msg" + msg);
        this._cachedIntervention = msg.params.payload.evData; 
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "LAS")
            {
                //this._currentContextTemplate.list2Ctrl.setToggleValue(0,this._cachedIntervention);
                this.populateListCtrl(this._currentContextTemplate);
            }
        }
    }
}
// HudOnOffStatus
vehsettingsApp.prototype._HudOnOffStatusMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined)
    {
        log.info("_HudOnOffStatusMsgHandler called with msg" + msg);
        this._cachedHudOnOffStatus = msg.params.payload.evData; 
        // populate
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "HUDTab")
            {
                this._currentContextTemplate.list2Ctrl.setToggleValue(4,this._cachedHudOnOffStatus);
                this.populateListCtrl(this._currentContextTemplate);
            }
        }
    }
}

vehsettingsApp.prototype._HudControlAllowedMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined)
    {
        log.info("._HudControlAllowedMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedHudControlAllowed = msg.params.payload.evData; 
        // populate
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "HUDTab")
            {
                this.populateListCtrl(this._currentContextTemplate);
            }
        }
    }
}
// HudTilt
vehsettingsApp.prototype._HudTiltMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined)
    {
        log.info("_HudTiltMsgHandler called with msg" + msg);
        this._cachedHudTilt = msg.params.payload.evData; 
        // populate
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "HUDTab")
            {
                if (this._cachedHudTilt != null && this._cachedHudTilt != undefined)
                {                
                    this._currentContextTemplate.list2Ctrl.setSliderValue(0,this._cachedHudTilt); 
                    //this.populateListCtrl(this._currentContextTemplate);
                }
             }
        }
    }
}
// HudAutoIntensityOnOff
vehsettingsApp.prototype._HudAutoIntensityOnOffMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined)
    {
        log.info("_HudAutoIntensityOnOffMsgHandler called with msg" + msg);
        this._cachedHudAutoIntensityOnOff = msg.params.payload.evData; 
        // populate
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "HUDTab")
            {
                this.populateListCtrl(this._currentContextTemplate);
            }
        }
    }
}

// HudIntensity
vehsettingsApp.prototype._HudIntensityMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined)
    {
        log.info("_HudIntensityMsgHandler called with msg" + msg);
        
        this._cachedHudIntensity = msg.params.payload.evData; 
        // populate
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "HUDTab")
            {
                if (this._cachedHudIntensity != null && this._cachedHudIntensity != undefined)
                {
                    this._currentContextTemplate.list2Ctrl.setSliderValue(2,this._cachedHudIntensity);
                }
                //this.populateListCtrl(this._currentContextTemplate);
            }
        }
    }
}

vehsettingsApp.prototype._HudCalibrationMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined)
    {
        log.info("_HudIntensityMsgHandler called with msg" + msg);
        this._cachedHudCalibration = msg.params.payload.evData; 
        // populate
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "HUDTab")
            {
                if (this._cachedHudCalibration != null && this._cachedHudCalibration != undefined)
                {
                    this._currentContextTemplate.list2Ctrl.setSliderValue(2,this._cachedHudCalibration); 
                    //this.populateListCtrl(this._currentContextTemplate);
                }
            }
        }
    }
}

// HudTurnByTurn
vehsettingsApp.prototype._HudTurnByTurnMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined)
    {
        log.info("_HudTurnByTurnMsgHandler called with msg" + msg);
        this._cachedHudTurnByTurn = msg.params.payload.evData; 
        // populate
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "HUDTab")
            {
                this._currentContextTemplate.list2Ctrl.setToggleValue(3,this._cachedHudTurnByTurn);
                //this.populateListCtrl(this._currentContextTemplate);
            }
        }
    }
}

// HudInstalled
vehsettingsApp.prototype._HudInstalledMsgHandler = function(msg)
{ 
    if(msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined)
    {
        log.info("_HudInstalledMsgHandler called with msg:" + msg.params.payload.evData); 
        if (msg && msg.params.payload)
        {
            if (msg.params.payload.evData == 0)
            {
                framework.setSharedData(this.uiaId, "HudInstalled", false);
                this._HUDInstalledStatus = false;
                this._HudInstalledStatusHandler();
            }
            else
            {
                framework.setSharedData(this.uiaId, "HudInstalled", true);
                this._HUDInstalledStatus = true;
                this._HudInstalledStatusHandler();   
            }
        }
    }
}

//HUD error
vehsettingsApp.prototype._HudErrorMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined)
    {
        log.info("_HudErrorMsgHandler called with msg:" + msg.params.payload.evData); 
        if (msg && msg.params.payload)
        {
            this._cachedHudError = msg.params.payload.evData;  
            if (this._currentContext && this._currentContextTemplate)
            {
                if (this._currentContext.ctxtId === "HUDTab")
                {
                    this.populateListCtrl(this._currentContextTemplate);
                }
            }
        }
    }
}

vehsettingsApp.prototype._AutoWiper_InstalledMsgHandler = function(msg)
{ 
    if(msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined)
    {
        log.info("_AutoWiper_InstalledMsgHandler called with msg:" + msg.params.payload.evData); 
        if (msg && msg.params.payload && msg.params.payload.evData != this._cachedAutoWiper_Installed)
        {
            this._cachedAutoWiper_Installed = msg.params.payload.evData;
            if (this._cachedAutoWiper_Installed === 1)
            {
                this.statusArrayVehicleTab[0] = true;
            }
            else
            {
                this.statusArrayVehicleTab[0] = false;
            }
            if (this._currentContext && this._currentContextTemplate)
            {
                if (this._currentContext.ctxtId === "VehicleSettingsTab")
                {
                    this.populateListCtrl(this._currentContextTemplate);
                }
            }
        }
    }
}
vehsettingsApp.prototype._LightTimeoutDoorOpen_InstalledMsgHandler = function(msg)
{ 
    if(msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined && msg.params.payload.evData != this.cachedLightTimeoutDoorOpen)
    {
        this.cachedLightTimeoutDoorOpen = msg.params.payload.evData;
        if (this.cachedLightTimeoutDoorOpen === 1)
        {
            this.statusArray[0] = true;
        }
        else
        {
            this.statusArray[0] = false;
        }
        
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "Lighting" || this._currentContext.ctxtId === "VehicleSettingsTab")
            {
                this.populateListCtrl(this._currentContextTemplate);
            }
        }
    }
}
vehsettingsApp.prototype._DayTimeRunningLight_InstalledMsgHandler = function(msg)
{ 
    if(msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined && msg.params.payload.evData != this.cachedDayTimeRunningLight)
    {
        this.cachedDayTimeRunningLight = msg.params.payload.evData;
        if (this.cachedDayTimeRunningLight === 1)
        {
            this.statusArray[8] = true;
        }
        else
        {
            this.statusArray[8] = false;
        }
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "Lighting" || this._currentContext.ctxtId === "VehicleSettingsTab")
            {
                this.populateListCtrl(this._currentContextTemplate);
            }
        }
    }
}


vehsettingsApp.prototype._LightTimeoutDoorClosed_InstalledMsgHandler = function(msg)
{ 
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined && msg.params.payload.evData != this.cachedLightTimeoutDoorClosed)
    {
        this.cachedLightTimeoutDoorClosed = msg.params.payload.evData;
        if (this.cachedLightTimeoutDoorClosed === 1)
        {
            this.statusArray[1] = true;
        }
        else
        {
            this.statusArray[1] = false;
        }
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "Lighting" || this._currentContext.ctxtId === "VehicleSettingsTab")
            {
                this.populateListCtrl(this._currentContextTemplate);
            }
        }
    }
}

vehsettingsApp.prototype._AutoDoorLockAT6_InstalledMsgHandler = function(msg)
{ 
    log.info("_AutoDoorLockAT6_InstalledMsgHandler called with msg" + msg);
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined && msg.params.payload.evData != this._cachedVehicle_AutoDoorLockInstalledAT6)
    {
        this._cachedVehicle_AutoDoorLockInstalledAT6 = msg.params.payload.evData; 
        // populate
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "DoorLockMode" || this._currentContext.ctxtId === "DoorLock" || this._currentContext.ctxtId === "VehicleSettingsTab")
            {
                if (this._cachedVehicle_AutoDoorLockInstalledAT6 != null && this._cachedVehicle_AutoDoorLockInstalledAT6 != undefined)
                {                
                    this.populateListCtrl(this._currentContextTemplate);
                }
            }
        }  
    }
}


vehsettingsApp.prototype._AutoDoorLockAT_InstalledMsgHandler = function(msg)
{ 
    log.info("_AutoDoorLockAT_InstalledMsgHandler called with msg" + msg);
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined && msg.params.payload.evData != this._cachedVehicle_AutoDoorLockInstalledAT)
    {
        this._cachedVehicle_AutoDoorLockInstalledAT = msg.params.payload.evData; 
        // populate
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "DoorLockMode" || this._currentContext.ctxtId === "DoorLock" || this._currentContext.ctxtId === "VehicleSettingsTab")
            {
                if (this._cachedVehicle_AutoDoorLockInstalledAT != null && this._cachedVehicle_AutoDoorLockInstalledAT != undefined)
                {                
                    this.populateListCtrl(this._currentContextTemplate);
                }
            }
        }  
    }
}

vehsettingsApp.prototype._AutoDoorLockMT_InstalledMsgHandler = function(msg)
{ 
    log.info("_AutoDoorLockMT_InstalledMsgHandler called with msg" + msg);
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined && msg.params.payload.evData != this._cachedVehicle_AutoDoorLockInstalledMT)
    {
        this._cachedVehicle_AutoDoorLockInstalledMT = msg.params.payload.evData;
        // populate
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "DoorLockMode" || this._currentContext.ctxtId === "DoorLock" || this._currentContext.ctxtId === "VehicleSettingsTab")
            {
                if (this._cachedVehicle_AutoDoorLockInstalledMT != null && this._cachedVehicle_AutoDoorLockInstalledMT != undefined)
                {                
                    this.populateListCtrl(this._currentContextTemplate);
                }
            }
        }
     }
}

vehsettingsApp.prototype._HeadOffTimer_InstalledMsgHandler = function(msg)
{ 
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined && msg.params.payload.evData != this.cachedHeadOffTimerValue)
    {
        this.cachedHeadOffTimerValue = msg.params.payload.evData;
        if (this.cachedHeadOffTimerValue === 1)
        {
            this.statusArray[5] = true;
        }
        else
        {
            this.statusArray[5] = false;
        }
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "Lighting" || this._currentContext.ctxtId === "VehicleSettingsTab")
            {
                this.populateListCtrl(this._currentContextTemplate);
            }
        }
    }
}

vehsettingsApp.prototype._HeadlightAutoSensitivity_InstalledMsgHandler = function(msg)
{ 
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined && msg.params.payload.evData != this.cachedHeadAutoValue)
    {
        this.cachedHeadAutoValue = msg.params.payload.evData;
        if (this.cachedHeadAutoValue === 1)
        {
            this.statusArray[9] = true;
        }
        else
        {
            this.statusArray[9] = false;
        } 
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "Lighting" || this._currentContext.ctxtId === "VehicleSettingsTab")
            {
                this.populateListCtrl(this._currentContextTemplate);
            }
        }
    }
}

vehsettingsApp.prototype._ThreeFlash_InstalledMsgHandler = function(msg)
{ 

    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined && msg.params.payload.evData != this._cachedThreeFlash_Installed)
    {
        log.info("_ThreeFlash_InstalledMsgHandler called with msg:" + msg.params.payload.evData); 
        this._cachedThreeFlash_Installed = msg.params.payload.evData;
        if (this._cachedThreeFlash_Installed === 1)
        {
            this.statusArrayTurn[0] = true;
        }
        else
        {
            this.statusArrayTurn[0] = false;
        } 
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "TurnSettings" || this._currentContext.ctxtId === "VehicleSettingsTab")
            {
                this.populateListCtrl(this._currentContextTemplate);
            }
        }
    }
}
vehsettingsApp.prototype._TurnSignalVolume_InstalledMsgHandler = function(msg)
{ 
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined && msg.params.payload.evData != this._cachedTurnSignalVolume_Installed)
    {
        log.info("_TurnSignalVolume_InstalledMsgHandler called with msg:" + msg.params.payload.evData); 
        this._cachedTurnSignalVolume_Installed = msg.params.payload.evData;
        if (this._cachedTurnSignalVolume_Installed === 1)
        {
            this.statusArrayTurn[1] = true;
        }
        else
        {
            this.statusArrayTurn[1] = false;
        } 
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "TurnSettings" || this._currentContext.ctxtId === "VehicleSettingsTab")
            {
                this.populateListCtrl(this._currentContextTemplate);
            }
        }
    }
}

vehsettingsApp.prototype._set_failedMsgHandler = function(msg)
{ 
    log.info("_set_failedMsgHandler called with msg:" + msg.params.payload.evData); 
    //TODO: Implement logic
}

vehsettingsApp.prototype.checkHBC_and_AHBC = function()
{
    if(this.cachedHBCValue === 1)
    {
        if(this.cachedAHBCValue === 1)
        {
            this.statusArray[2] = false;
        }
        else
        {
            this.statusArray[2] = true;
            this.textChange = 1;
        }
    }
    else
    {
        if(this.cachedAHBCValue === 1)
        {
            this.statusArray[2] = true;
            this.textChange = 2;
        }
        else
        {
            this.statusArray[2] = false;
        }
    }
}

vehsettingsApp.prototype._HBC_InstalledMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined && msg.params.payload.evData != this.cachedHBCValue)
    {
        this.cachedHBCValue = msg.params.payload.evData;
        this.checkHBC_and_AHBC();
        /*if (this.cachedHBCValue === 1)
        {
            this.statusArray[2] = true;
        }
        else
        {
            this.statusArray[2] = false;
        }*/
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "Lighting" || this._currentContext.ctxtId === "VehicleSettingsTab")
            {
                this.populateListCtrl(this._currentContextTemplate);
            }
        }
     }
}

vehsettingsApp.prototype._AHBC_InstalledMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined && msg.params.payload.evData != this.cachedAHBCValue)
    {
        this.cachedAHBCValue = msg.params.payload.evData;
        this.checkHBC_and_AHBC();
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "Lighting" || this._currentContext.ctxtId === "VehicleSettingsTab")
            {
                this.populateListCtrl(this._currentContextTemplate);
            }
        }
     }
}

vehsettingsApp.prototype._AFS_InstalledMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined && msg.params.payload.evData != this.cachedAFSValue)
    {
        this.cachedAFSValue = msg.params.payload.evData;
        if (this.cachedAFSValue === 1)
        {
            this.statusArray[3] = true;
        }
        else
        {
            this.statusArray[3] = false;
        }
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "Lighting" || this._currentContext.ctxtId === "VehicleSettingsTab")
            {
                this.populateListCtrl(this._currentContextTemplate);
            }
        }
     }
}

vehsettingsApp.prototype._HeadlightON_InstalledMsgHandler = function(msg)
{ 
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined && msg.params.payload.evData != this.cachedHeadLightOnValue)
    {
        this.cachedHeadLightOnValue = msg.params.payload.evData;
        if (this.cachedHeadLightOnValue === 1)
        {
            this.statusArray[4] = true;
        }
        else
        {
            this.statusArray[4] = false;
        }
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "Lighting" || this._currentContext.ctxtId === "VehicleSettingsTab")
            {
                this.populateListCtrl(this._currentContextTemplate);
            }
        } 
    }
}

vehsettingsApp.prototype._CHLT_InstalledMsgHandler = function(msg)
{ 
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined && msg.params.payload.evData != this.cachedCHLTValue)
    {
        this.cachedCHLTValue = msg.params.payload.evData;
        if (this.cachedCHLTValue === 1)
        {
            this.statusArray[6] = true;
        }
        else
        {
            this.statusArray[6] = false;
        }
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "Lighting")
            {
                this.populateListCtrl(this._currentContextTemplate);
            }
        } 
    }
}

vehsettingsApp.prototype._LHL_InstalledMsgHandler = function(msg)
{ 
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined && msg.params.payload.evData != this.cachedLHLValue)
    {
        this.cachedLHLValue = msg.params.payload.evData;
        if (this.cachedLHLValue === 1)
        {
            this.statusArray[7] = true;
        }
        else
        {
            this.statusArray[7] = false;
        }
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "Lighting")
            {
                this.populateListCtrl(this._currentContextTemplate);
            }
        } 
    }
}

vehsettingsApp.prototype._AutoDoorRelock_InstalledMsgHandler = function(msg)
{ 
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined && msg.params.payload.evData != this.cachedDoorReLockValue)
    {
        this.cachedDoorReLockValue = msg.params.payload.evData;
        if (this.cachedDoorReLockValue === 1)
        {
            this.statusArrayDoorLock[2] = true;
        }
        else
        {
            this.statusArrayDoorLock[2] = false;
        }
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "DoorLock" || this._currentContext.ctxtId === "VehicleSettingsTab")
            {
                this.populateListCtrl(this._currentContextTemplate);
            }
        }
    }
}
vehsettingsApp.prototype._WalkAway_InstalledMsgHandler = function(msg)
{ 
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined && msg.params.payload.evData != this.cachedWalkAwayValue)
    {
        this.cachedWalkAwayValue = msg.params.payload.evData;
        if (this.cachedWalkAwayValue === 1)
        {
            this.statusArrayDoorLock[4] = true;
        }
        else
        {
            this.statusArrayDoorLock[4] = false;
        }
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "DoorLock" || this._currentContext.ctxtId === "VehicleSettingsTab")
            {
                this.populateListCtrl(this._currentContextTemplate);
            }
        }
    }
}

vehsettingsApp.prototype._UnlockMode_InstalledMsgHandler = function(msg)
{ 
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined && msg.params.payload.evData != this.cachedUnlockModeValue)
    {
        this.cachedUnlockModeValue = msg.params.payload.evData;
        if (this.cachedUnlockModeValue === 1)
        {
            this.statusArrayDoorLock[3] = true;
        }
        else
        {
            this.statusArrayDoorLock[3] = false;
        }
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "DoorLock" || this._currentContext.ctxtId === "VehicleSettingsTab")
            {
                this.populateListCtrl(this._currentContextTemplate);
            }
        } 
    }
}

vehsettingsApp.prototype._BuzzerAnswerback_InstalledMsgHandler = function(msg)
{ 
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined && msg.params.payload.evData != this._cachedBuzzerAnswerback_Installed)
    {
        log.info("_BuzzerAnswerback_InstalledMsgHandler called with msg:" + msg.params.payload.evData); 
        this._cachedBuzzerAnswerback_Installed = msg.params.payload.evData;
        if (this._cachedBuzzerAnswerback_Installed === 1)
        {
            this.statusArrayDoorLock[1] = true;
        }
        else
        {
            this.statusArrayDoorLock[1] = false;
        }
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "DoorLock" || this._currentContext.ctxtId === "VehicleSettingsTab")
            {
                this.populateListCtrl(this._currentContextTemplate);
            }
        }
    }
}
 // HeadLight_Installed
vehsettingsApp.prototype._HeadLight_InstalledMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_HeadLight_InstalledMsgHandler called with msg:" + msg.params.payload.evData); 
        this._cachedHeadlight_Installed = msg.params.payload.evData;   
    }
}
// Safety_Installed
vehsettingsApp.prototype._Safety_InstalledMsgHandler = function(msg)
{ 
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_Safety_InstalledMsgHandler called with msg:" + msg.params.payload.evData); 
        this._cachedSafety_Installed = msg.params.payload.evData;   
    }
}

// BSM_Installed
vehsettingsApp.prototype._BSM_InstalledMsgHandler = function(msg)
{ 
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined && msg.params.payload.evData != this._cachedBSM_Installed)
    {
        log.info("_BSM_InstalledMsgHandler called with msg:" + msg.params.payload.evData); 
        this._cachedBSM_Installed = msg.params.payload.evData; 
        if (this._cachedBSM_Installed === 1)
        {
            this.statusArraySafetyTab[6] = true;
        }
        else
        {
            this.statusArraySafetyTab[6] = false;
        }
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "SafetyTab")
            {
                this.populateListCtrl(this._currentContextTemplate);
            }
        } 
    }
}

// LDW_Installed
vehsettingsApp.prototype._LDW_InstalledMsgHandler = function(msg)
{ 
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined && msg.params.payload.evData != this._cachedLDW_Installed)
    {
    log.info("_LDW_InstalledMsgHandler called with msg:" + msg.params.payload.evData); 
        this._cachedLDW_Installed = msg.params.payload.evData; 
        if (this._cachedLDW_Installed === 1)
        {
            this.statusArraySafetyTab[7] = true;
        }
        else
        {
            this.statusArraySafetyTab[7] = false;
        }
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "SafetyTab")
            {
                this.populateListCtrl(this._currentContextTemplate);
            }
        }
    }
}
// RVM_Installed
vehsettingsApp.prototype._RVM_InstalledMsgHandler = function(msg)
{ 
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined && msg.params.payload.evData != this._cachedRVM_Installed)
    {
        log.info("_RVM_InstalledMsgHandler called with msg:" + msg.params.payload.evData); 
        this._cachedRVM_Installed = msg.params.payload.evData;   
        if (this._cachedRVM_Installed === 1)
        {
            this.statusArraySafetyTab[5] = true;
        }
        else
        {
            this.statusArraySafetyTab[5] = false;
        }
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "SafetyTab")
            {
                this.populateListCtrl(this._currentContextTemplate);
            }
        }
    }
}
 
// FOW_Installed
vehsettingsApp.prototype._FOW_InstalledMsgHandler = function(msg)
{ 
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined && msg.params.payload.evData != this._cachedFOW_Installed)
    {
        log.info("_FOW_InstalledMsgHandler called with msg:" + msg.params.payload.evData); 
        this._cachedFOW_Installed = msg.params.payload.evData;  
        if (this._cachedFOW_Installed === 1)
        {
            this.statusArraySafetyTab[4] = true;
        }
        else
        {
            this.statusArraySafetyTab[4] = false;
        }
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "SafetyTab")
            {
                this.populateListCtrl(this._currentContextTemplate);
            }
        }
    }
}


// DRSS_Installed
vehsettingsApp.prototype._DRSS_InstalledMsgHandler = function(msg)
{  
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined && msg.params.payload.evData != this._cachedDRSS_Installed)
    {
        log.info("_DRSS_InstalledMsgHandler called with msg:" + msg.params.payload.evData); 
        this._cachedDRSS_Installed = msg.params.payload.evData;
        if (this._cachedDRSS_Installed === 1)
        {
            this.statusArraySafetyTab[0] = true;
        }
        else
        {
            this.statusArraySafetyTab[0] = false;
        }
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "SafetyTab")
            {
                this.populateListCtrl(this._currentContextTemplate);
            }
        }
    }
}
//LAS Sound
vehsettingsApp.prototype._LASSound_InstalledMsgHandler = function(msg)
{ 
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined && msg.params.payload.evData != this._cachedLASSound_Installed)
    {
        log.info("_LASSound_InstalledMsgHandler called with msg:" + msg.params.payload.evData);  
        this._cachedLASSound_Installed = msg.params.payload.evData;
        
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "LAS")
            {
                this.populateListCtrl(this._currentContextTemplate);
            }
        }
    }
}

// SBS_Installed
vehsettingsApp.prototype._SBS_InstalledMsgHandler = function(msg)
{ 
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined && msg.params.payload.evData != this._cachedSBS_Installed)
    {
        log.info("_SBS_InstalledMsgHandler called with msg:" + msg.params.payload.evData);  
        this._cachedSBS_Installed = msg.params.payload.evData;
        if (this._cachedSBS_Installed === 1)
        {
            this.statusArraySafetyTab[1] = true;
        }
        else
        {
            this.statusArraySafetyTab[1] = false;
        }
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "SafetyTab")
            {
                this.populateListCtrl(this._currentContextTemplate);
            }
        }
    }
}
// SCBS_Installed
vehsettingsApp.prototype._SCBS_InstalledMsgHandler = function(msg)
{  
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined && msg.params.payload.evData != this._cachedSCBS_Installed)
    {
        log.info("_SCBS_InstalledMsgHandler called with msg:" + msg.params.payload.evData); 
        this._cachedSCBS_Installed = msg.params.payload.evData;
        if (this._cachedSCBS_Installed === 1)
        {
            this.statusArraySafetyTab[3] = true;
        }
        else
        {
            this.statusArraySafetyTab[3] = false;
        }
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "SafetyTab")
            {
                this.populateListCtrl(this._currentContextTemplate);
            }
        }
    }
}
//Lane Assist System Installed
vehsettingsApp.prototype._LaneAssistSystem_InstalledMsgHandler = function(msg)
{ 
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined && msg.params.payload.evData != this.cachedLaneAssistSystem)
    {
        this.cachedLaneAssistSystem = msg.params.payload.evData;
        if (this.cachedLaneAssistSystem === 1)
        {
            this.statusArraySafetyTab[8] = true;
        }
        else
        {
            this.statusArraySafetyTab[8] = false;
        }
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "SafetyTab")
            {
                this.populateListCtrl(this._currentContextTemplate);
            }
        }
    }
}
// Driver alert Installed
vehsettingsApp.prototype._DriverAlert_InstalledMsgHandler = function(msg)
{ 
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined && msg.params.payload.evData != this.cachedDriverAlert)
    {
        this.cachedDriverAlert = msg.params.payload.evData;
        if (this.cachedDriverAlert === 1)
        {
            this.statusArraySafetyTab[9] = true;
        }
        else
        {
            this.statusArraySafetyTab[9] = false;
        }
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "SafetyTab")
            {
                this.populateListCtrl(this._currentContextTemplate);
            }
        }
    }
}
vehsettingsApp.prototype._PSI_InstalledMsgHandler = function(msg)
{ 
    if (msg && msg.params && msg.params.payload && msg.params.payload.parkingSensorConfig != null && msg.params.payload.parkingSensorConfig != undefined && msg.params.payload.parkingSensorConfig != this.cachedParkingSensorIndication)
    {
        this.cachedParkingSensorIndication = msg.params.payload.parkingSensorConfig;
        if (this.cachedParkingSensorIndication === "Installed")
        {
            this.statusArraySafetyTab[10] = true;
        }
        else
        {
            this.statusArraySafetyTab[10] = false;
        }
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "SafetyTab")
            {
                this.populateListCtrl(this._currentContextTemplate);
            }
        }
    }
}

// DRSS_DRSS
vehsettingsApp.prototype._DRSS_DRSSMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_DRSS_DRSSMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedDRSS_DRSS = msg.params.payload.evData; 
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "DRSS")
            {
                if (this._cachedDRSS_DRSS != null)
                {
                    this._currentContextTemplate.list2Ctrl.setToggleValue(0,this._cachedDRSS_DRSS);
                }
                this._currentContextTemplate.list2Ctrl.updateItems(0,0);
            }
        }
    }
}
// DRSS_DRSSSensitivity
vehsettingsApp.prototype._DRSS_DRSSSensitivityMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_DRSS_DRSSSensitivityMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedDRSS_DRSSSensitivity = msg.params.payload.evData; 
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "DRSS")
            {
                if (this._cachedDRSS_DRSSSensitivity != null)
                {
                    this._currentContextTemplate.list2Ctrl.setToggleValue(1,this._cachedDRSS_DRSSSensitivity);
                }
                this._currentContextTemplate.list2Ctrl.updateItems(1,1);
            }
        }
    }
}

// FOW_Warning
vehsettingsApp.prototype._FOW_WarningMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_FOW_WarningMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedFOW_Warning = msg.params.payload.evData; 
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "FOW")
            {
                if (this._cachedFOW_Warning != null)
                {
                    this._currentContextTemplate.list2Ctrl.setToggleValue(0,this._cachedFOW_Warning);
                    this._currentContextTemplate.list2Ctrl.updateItems(0,0);
                }
            }
        }
    }
}
// FOW_Distance
vehsettingsApp.prototype._FOW_DistanceMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_FOW_DistanceMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedFOW_Distance = msg.params.payload.evData; 
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "FOW")
            {
                if (this._cachedFOW_Distance != null)
                {
                    this._currentContextTemplate.list2Ctrl.setToggleValue(1,this._cachedFOW_Distance);
                }
                this._currentContextTemplate.list2Ctrl.updateItems(1,1);
            }
        }
    }
}
// FOW_BuzzerVolume
vehsettingsApp.prototype._FOW_BuzzerVolumeMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_FOW_BuzzerVolumeMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedFOW_BuzzerVolume = msg.params.payload.evData; 
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "FOW")
            {
                if (this._cachedFOW_BuzzerVolume != null)
                {
                    this._currentContextTemplate.list2Ctrl.setToggleValue(2,this._cachedFOW_BuzzerVolume);
                    this._currentContextTemplate.list2Ctrl.updateItems(2,2);
                }
            }
        }
    }
}
// SBS_BrakeSupport
vehsettingsApp.prototype._SBS_BrakeSupportMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_SBS_BrakeSupportMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedSBS_BrakeSupport = msg.params.payload.evData;
        this._cachedSBCSMode = msg.params.payload.evData;
        if (this._currentContext && this._currentContextTemplate)
        {
            switch (this._currentContext.ctxtId)
            {
                case "SBS": 
                    if (this._cachedSBS_BrakeSupport != null)
                    {
                        this._currentContextTemplate.list2Ctrl.setToggleValue(0,this._cachedSBS_BrakeSupport);
                        this._currentContextTemplate.list2Ctrl.updateItems(0,0);
                    }    
                    break;
                case "SBS_SCBS":
                    if (this._cachedSBCSMode != null)
                    {
                        this._currentContextTemplate.list2Ctrl.setToggleValue(0,this._cachedSBCSMode);
                        this._currentContextTemplate.list2Ctrl.updateItems(0,0);   
                    } 
                    break;
                default:
                    break;
            }
        }
    }
}
// SBS_Distance
vehsettingsApp.prototype._SBS_DistanceMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_SBS_DistanceMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedSBS_Distance = msg.params.payload.evData;
        this._cachedSBCSWarningDistance = msg.params.payload.evData;
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext && this._currentContextTemplate)
            {
                switch (this._currentContext.ctxtId)
                {
                    case "SBS": 
                        if (this._cachedSBS_BrakeSupport != null)
                        {
                            this._currentContextTemplate.list2Ctrl.setToggleValue(1,this._cachedSBS_Distance);
                            this._currentContextTemplate.list2Ctrl.updateItems(1,1);
                        }    
                        break;
                    case "SBS_SCBS":
                        if (this._cachedSBCSMode != null)
                        {
                            this._currentContextTemplate.list2Ctrl.setToggleValue(1,this._cachedSBCSWarningDistance);
                            this._currentContextTemplate.list2Ctrl.updateItems(1,1);   
                        } 
                        break;
                    default:
                        break;
                }
            }
        }
    }
}
// SBS_BuzzerVolume
vehsettingsApp.prototype._SBS_BuzzerVolumeMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_SBS_BuzzerVolumeMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedSBS_BuzzerVolume = msg.params.payload.evData;
        this._cachedSBCSVolume = msg.params.payload.evData;
        if (this._currentContext && this._currentContextTemplate)
        {
            switch (this._currentContext.ctxtId)
            {
                case "SBS": 
                    if (this._cachedSBS_BuzzerVolume != null)
                    {
                        if (framework.localize.getRegion() == "Region_Europe")
                        {    
                            this._currentContextTemplate.list2Ctrl.setToggleValue(1,this._cachedSBS_BuzzerVolume);
                        }
                        else
                        {
                            this._currentContextTemplate.list2Ctrl.setToggleValue(2,this._cachedSBS_BuzzerVolume);
                        }
                    }    
                    break;
                case "SBS_SCBS":
                    if (this._cachedSBCSVolume != null)
                    {
                        if (framework.localize.getRegion() == "Region_Europe")
                        {    
                            this._currentContextTemplate.list2Ctrl.setToggleValue(1,this._cachedSBCSVolume);
                        }
                        else
                        {
                            this._currentContextTemplate.list2Ctrl.setToggleValue(2,this._cachedSBCSVolume);
                        }
                    } 
                    break;
                default:
                    break;
            }
        }
    }
}
// SBS_CityBrakeSystem
vehsettingsApp.prototype._SBS_CityBrakeSystemMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_SBS_CityBrakeSystemMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedSBS_CityBrakeSystem = msg.params.payload.evData; 
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "SafetyTab" &&
                this._smartCityBreakToggleIndex != null && this._smartCityBreakToggleIndex != undefined &&
                this._cachedSBS_CityBrakeSystem != null && this._cachedSBS_CityBrakeSystem != undefined )
            {
                this._currentContextTemplate.list2Ctrl.setToggleValue(this._smartCityBreakToggleIndex,this._cachedSBS_CityBrakeSystem);
            }
        }
    }
}
// Headlight_HighBeamControll
vehsettingsApp.prototype._Headlight_HighBeamControllMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_Headlight_HighBeamControllMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedHeadlight_HighBeamControll = msg.params.payload.evData; 
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "Lighting" && 
                this._highBeamControlToggleIndex != null && this._highBeamControlToggleIndex != undefined &&
                this._cachedHeadlight_HighBeamControll != null && this._cachedHeadlight_HighBeamControll != undefined)
            {
                this._currentContextTemplate.list2Ctrl.setToggleValue(this._highBeamControlToggleIndex,this._cachedHeadlight_HighBeamControll);
            }
        }
    }
}
vehsettingsApp.prototype._AFSMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_AFSMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedAFS = msg.params.payload.evData;
        if(this._cachedAFS == 1)
        {
            this._cachedAFS = 2;
        }
        else
        {
            this._cachedAFS = 1;
        }   
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "Lighting" && 
                this._AFSToggleIndex != null && this._AFSToggleIndex != undefined &&
                this._cachedAFS != null && this._cachedAFS != undefined)
            {
                this._currentContextTemplate.list2Ctrl.setToggleValue(this._AFSToggleIndex,this._cachedAFS);
            }
        }
    }
}

// Headlight_HBCSensitivity
vehsettingsApp.prototype._Headlight_HBCSensitivityMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_Headlight_HBCSensitivityMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedHeadlight_HBCSensitivity = msg.params.payload.evData; 
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "Lighting")
            {
                this.populateListCtrl(this._currentContextTemplate);
            }
        }
    }
}
// Headlight_HeadlightOnWaring
vehsettingsApp.prototype._Headlight_HeadlightOnWaringMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_Headlight_HeadlightOnWaringMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedHeadlight_HeadlightOnWaring = msg.params.payload.evData; 
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "Lighting" && 
                this._lightReminderToggleIndex != null && this._lightReminderToggleIndex != undefined 
                && this._cachedHeadlight_HeadlightOnWaring != null && this._cachedHeadlight_HeadlightOnWaring != undefined)
            {
                this._currentContextTemplate.list2Ctrl.setToggleValue(this._lightReminderToggleIndex,this._cachedHeadlight_HeadlightOnWaring);
            }
        }
    }
}
// Headlight_HeadlightOffTimer
vehsettingsApp.prototype._Headlight_HeadlightOffTimerMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_Headlight_HeadlightOffTimerMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedHeadlight_HeadlightOffTimer = msg.params.payload.evData; 
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "Lighting" || this._currentContext.ctxtId === "HeadlightOffTimer")
            {
                if (this._cachedHeadlight_HeadlightOffTimer != null)
                { 
                    //this._currentContextTemplate.list2Ctrl.setTick(this._cachedHeadlight_HeadlightOffTimer - 1, true);
                    this.populateListCtrl(this._currentContextTemplate);
                }
            }
        }
    }
}

//CHLT
vehsettingsApp.prototype._CHLTMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_CHLTMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedCHLT = msg.params.payload.evData; 
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "Lighting" || this._currentContext.ctxtId === "CHLT")
            {
                if (this._cachedCHLT != null)
                { 
                    //this._currentContextTemplate.list2Ctrl.setTick(this._cachedHeadlight_HeadlightOffTimer - 1, true);
                    this.populateListCtrl(this._currentContextTemplate);
                }
            }
        }
    }
}

//LHL
vehsettingsApp.prototype._LHLMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_Headlight_HighBeamControllMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedLHL = msg.params.payload.evData; 
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "Lighting" && 
                this._LHLToggleIndex != null && this._LHLToggleIndex != undefined &&
                this._cachedLHL != null && this._cachedLHL != undefined)
            {
				switch(this._cachedLHL)
				{
					case "LHL_On":
						this._currentContextTemplate.list2Ctrl.setToggleValue(this._LHLToggleIndex,1);
						break;
					case "LHL_Off":
						this._currentContextTemplate.list2Ctrl.setToggleValue(this._LHLToggleIndex,2);
						break;
				}
            }
        }
    }
}

// Headlight_AutoHeadlightsSensitivity
vehsettingsApp.prototype._Headlight_AutoHeadlightsSensitivityMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_Headlight_AutoHeadlightsSensitivityMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedHeadlight_AutoHeadlightsSensitivity = msg.params.payload.evData; 
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "Lighting" || this._currentContext.ctxtId === "AutoHeadlightOn")
            {
                if (this._cachedHeadlight_AutoHeadlightsSensitivity != null)
                { 
                    //this._currentContextTemplate.list2Ctrl.setTick(this._cachedHeadlight_AutoHeadlightsSensitivity - 1 , true);
                    this.populateListCtrl(this._currentContextTemplate);
                }
            }
        }
    }
}

vehsettingsApp.prototype._GetDaytimeRunningLightsMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_GetDaytimeRunningLightsMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedHeadlight_DaytimeLights = msg.params.payload.evData; 
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "Lighting" && 
                this._dayTimeRunningLightToggleIndex != null && this._dayTimeRunningLightToggleIndex != undefined &&
                this._cachedHeadlight_DaytimeLights != null && this._cachedHeadlight_DaytimeLights != undefined )
            {
                this._currentContextTemplate.list2Ctrl.setToggleValue(this._dayTimeRunningLightToggleIndex,this._cachedHeadlight_DaytimeLights);
            }
        }
    }
}


// Keyless_WalkAwayLock
vehsettingsApp.prototype._Keyless_WalkAwayLockMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_Keyless_WalkAwayLockMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedKeyless_WalkAwayLock = msg.params.payload.evData; 
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "DoorLock" && 
                this._walkAwayLockToggleIndex != null && this._walkAwayLockToggleIndex != undefined && 
                this._cachedKeyless_WalkAwayLock != null && this._cachedKeyless_WalkAwayLock != undefined )
            {
                this._currentContextTemplate.list2Ctrl.setToggleValue(this._walkAwayLockToggleIndex,this._cachedKeyless_WalkAwayLock);
            }
        }
    }
}

// Keyless_UnlockMode
vehsettingsApp.prototype._Keyless_UnlockModeMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_Keyless_UnlockModeMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedKeyless_UnlockMode = msg.params.payload.evData; 
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "UnlockMode" || this._currentContext.ctxtId === "DoorLock")
            {
                if (this._cachedKeyless_UnlockMode != null)
                { 
                    //this._currentContextTemplate.list2Ctrl.setTick(this._cachedKeyless_UnlockMode - 1, true);
                    this.populateListCtrl(this._currentContextTemplate);
                }
            }
        }
    }
}
// Keyless_ChimeVolume
vehsettingsApp.prototype._Keyless_ChimeVolumeMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_Keyless_ChimeVolumeMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedKeyless_ChimeVolume = msg.params.payload.evData; 
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "KeylessSettings")
            {
                if (this._cachedKeyless_ChimeVolume != null)
                {
                    //this._currentContextTemplate.list2Ctrl.setTick(this._cachedKeyless_ChimeVolume -1, true);
                    this.populateListCtrl(this._currentContextTemplate);
                }
            }
        }
    }
}

//LAS sound
vehsettingsApp.prototype._LAS_SoundMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_LAS_SoundMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedLASSound = msg.params.payload.evData; 
        //alert(this._cachedLASSound);
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "LAS")
            {
                if (this._cachedLASSound != null)
                {
                    this.populateListCtrl(this._currentContextTemplate);
                }
            }
        }
    }
}
// LDWS_SensitivityForWideRange
vehsettingsApp.prototype._LDWS_SensitivityForWideRangeMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.debug("_LDWS_SensitivityForWideRangeMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedLDWSTiming = msg.params.payload.evData; 
        this._cachedLASTiming = msg.params.payload.evData;
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "LDWS" || this._currentContext.ctxtId === "LDWSTiming")
            {
                if (this._cachedLDWSTiming != null)
                {
                    if (framework.localize.getRegion() != "Region_NorthAmerica")
                    {
                        this._currentContextTemplate.list2Ctrl.setTick(this._cachedLDWSTiming -1, true);
                        if (this._currentContext.ctxtId === "LDWS")
                        {    
                            this.populateListCtrl(this._currentContextTemplate);
                        }
                    }
                    else
                    {
                        switch(this._cachedLDWSTiming)
                        {
                            case 3:
                                this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexTiming,1);
                                break;
                            case 2:
                                this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexTiming,2);
                                break;
                            default:
                                log.debug("Invalid LDWS Timing Value : " + this._cachedLDWSTiming);
                                break;
                        }
                        this._currentContextTemplate.list2Ctrl.updateItems(this._indexTiming,this._indexTiming);
                    }
                }
            }
            if (this._currentContext.ctxtId === "LAS" || this._currentContext.ctxtId === "LASTiming")
            {
                if (this._cachedLASTiming != null)
                {
                    if (framework.localize.getRegion() != "Region_NorthAmerica")
                    {
						if(this._cachedIntervention === 1)
						{
							var LASTimingTemp = this._cachedLASTiming / 2;
						}
						this._currentContextTemplate.list2Ctrl.setTick(LASTimingTemp -1, true);
                        if (this._currentContext.ctxtId === "LAS")
                        {    
                            this.populateListCtrl(this._currentContextTemplate);
                        }
                    }
                    else
                    {
                        switch(this._cachedLASTiming)
                        {
                            case 3:
                                this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexTiming,1);
                                break;
                            case 2:
                                this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexTiming,2);
                                break;
                            default:
                                log.debug("Invalid LDWS Timing Value : " + this._cachedLASTiming);
                                break;
                        }
                        this._currentContextTemplate.list2Ctrl.updateItems(this._indexTiming,this._indexTiming);
                    }
                }
            }
        }
    }
}
// LDWS_SensitivityWarningCancelation
vehsettingsApp.prototype._LDWS_SensitivityWarningCancelationMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_LDWS_SensitivityWarningCancelationMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedLDWS_SensitivityWarningCancelation = msg.params.payload.evData; 
        this._cachedLDWSWarning = msg.params.payload.evData;
        this._cachedLASWarning = msg.params.payload.evData;
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "LDWS")
            {
                if (this._cachedLDWSWarning != null)
                {
                    if (framework.localize.getRegion() === "Region_NorthAmerica")
                    {
                        switch(this._cachedLDWSWarning)
                        {
                            case 1:
                                this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexWarning,1);
                                break;
                            case 4:
                                this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexWarning,2);
                                break;
                            default:
                                log.debug("Invalid LDWS Warning Value : " + this._cachedLDWSWarning);
                                break;
                        }
                        this._currentContextTemplate.list2Ctrl.updateItems(this._indexWarning,this._indexWarning);       
                    }
                    else
                    {
                        switch(this._cachedLDWSWarning)
                        {
                            case 1:
                                this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexWarning,1);
                                break;
                            case 3:
                                this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexWarning,2);
                                break;
                            case 4:
                                this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexWarning,3);
                                break;
                            default:
                                log.debug("Invalid LDWS Warning Value : " + this._cachedLDWSWarning);
                                break;
                        }
                        this._currentContextTemplate.list2Ctrl.updateItems(this._indexWarning,this._indexWarning);
                    }
                }
            }
            if (this._currentContext.ctxtId === "LAS")
            {
                if (this._cachedLASWarning != null)
                {
                    if (framework.localize.getRegion() === "Region_NorthAmerica")
                    {
                        switch(this._cachedLASWarning)
                        {
                            case 1:
                                this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexWarning,1);
                                break;
                            case 4:
                                this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexWarning,2);
                                break;
                            default:
                                log.debug("Invalid LDWS Warning Value : " + this._cachedLASWarning);
                                break;
                        }
                        this._currentContextTemplate.list2Ctrl.updateItems(this._indexWarning,this._indexWarning);       
                    }
                    else
                    {
                        switch(this._cachedLASWarning)
                        {
                            case 1:
                                this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexWarning,1);
                                break;
                            case 3:
                                this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexWarning,2);
                                break;
                            case 4:
                                this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexWarning,3);
                                break;
                            default:
                                log.debug("Invalid LDWS Warning Value : " + this._cachedLASWarning);
                                break;
                        }
                        this._currentContextTemplate.list2Ctrl.updateItems(this._indexWarning,this._indexWarning);
                    }
                }
            }
        }
    }
}
vehsettingsApp.prototype._LDWSSound_InstalledMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {        
        if(this._cachedLDWSSound_Installed != msg.params.payload.evData)
        {
        this._cachedLDWSSound_Installed = msg.params.payload.evData;		
		if(this._cachedLDWSSound_Installed)
		{
			this._LDWSSoundIndex = 3;
		}
		else
		{
			this._LDWSSoundIndex = 2;
		}
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "LAS" || this._currentContext.ctxtId === "LASTiming" || this._currentContext.ctxtId === "LDWS" || this._currentContext.ctxtId === "SafetyTab")
            {
                this.populateListCtrl(this._currentContextTemplate);
            }
		}
		}
    }
}
// LDWS_BuzzerSetting
vehsettingsApp.prototype._LDWS_BuzzerSettingMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_LDWS_BuzzerSettingMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedLDWS_BuzzerSetting = msg.params.payload.evData; 
        this._cachedLASSound = msg.params.payload.evData;
        this._cachedLAS_BuzzerSetting = msg.params.payload.evData; 
        this._LDWSCtxtDataList.items[2].value = this._cachedLDWS_BuzzerSetting; 
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "LDWS")
        {
			this._currentContextTemplate.list2Ctrl.setToggleValue(2,this._cachedLDWS_BuzzerSetting);
			if (this._cachedLDWS_BuzzerSetting != null)
            {		
                if (this._cachedLDWS_BuzzerSetting === 1)
                {
                    if(this._cachedLDWSSound_Installed === 1)
                    {
                        this._currentContextTemplate.list2Ctrl.dataList.items[3] = this._LDWSCtxtDataListHelper.items[4];
						if(this._cachedLDWS_BuzzerVolume === 1 || this._cachedLDWS_BuzzerVolume === 2)
						{
							this._currentContextTemplate.list2Ctrl.dataList.items[3].value = 1;
						}
						else
						{
							this._currentContextTemplate.list2Ctrl.dataList.items[3].value = 2;
						}
						this._currentContextTemplate.list2Ctrl.updateItems(3,3);
                    }
                    else if(this._cachedLDWSSound_Installed === 0)
                    {
                        this._currentContextTemplate.list2Ctrl.dataList.items[2] = this._LDWSCtxtDataListHelper.items[4];
						this._currentContextTemplate.list2Ctrl.dataList.items[2].value = this._cachedLDWS_BuzzerVolume;
						this._currentContextTemplate.list2Ctrl.updateItems(2,2);
                    }
					
                }
                else if (this._cachedLDWS_BuzzerSetting === 2)
                {
                    if(this._cachedLDWSSound_Installed === 1)
                    {
                        this._currentContextTemplate.list2Ctrl.dataList.items[3] = this._LDWSCtxtDataListHelper.items[5];
						this._currentContextTemplate.list2Ctrl.dataList.items[3].value = this._cachedLDWS_RumbleStripsVolume;
						this._currentContextTemplate.list2Ctrl.updateItems(3,3);
                    }
                    else if(this._cachedLDWSSound_Installed === 0)
                    {
                        this._currentContextTemplate.list2Ctrl.dataList.items[2] = this._LDWSCtxtDataListHelper.items[4];
						this._currentContextTemplate.list2Ctrl.dataList.items[2].value = this._cachedLDWS_RumbleStripsVolume;
						this._currentContextTemplate.list2Ctrl.updateItems(2,2);
                    }
                }           			
            }
        }
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "LASSound")
        {
            this.populateListCtrl(this._currentContextTemplate);
        }
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "LAS")
        {
            this.populateListCtrl(this._currentContextTemplate);
        }
    }
}
// LDWS_BuzzerVolume and LAS Beep Volume
vehsettingsApp.prototype._LDWS_BuzzerVolumeMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {         
        this._cachedLAS_BuzzerVolume = msg.params.payload.evData;
		this._cachedLDWS_BuzzerVolume = msg.params.payload.evData;
        if (this._currentContext && this._currentContextTemplate)
        {
		   if (this._currentContext.ctxtId === "LDWS")
            {
				if (this._cachedLDWS_BuzzerSetting === 1)
                {
					if(this._cachedLDWSSound_Installed === 1)
					{
						if(this._cachedLDWS_BuzzerVolume === 1 || this._cachedLDWS_BuzzerVolume === 2)
						{
							this._currentContextTemplate.list2Ctrl.setToggleValue(3,1);
						}
						else
						{
							this._currentContextTemplate.list2Ctrl.setToggleValue(3,2);
						}
					}
					else if(this._cachedLDWSSound_Installed === 0)
					{
						this._currentContextTemplate.list2Ctrl.setToggleValue(2,this._cachedLDWS_BuzzerVolume);
					} 
				}
            }
            else if (this._currentContext.ctxtId === "LAS")
            {
				if (this._cachedLDWS_BuzzerVolume != null && this._cachedLDWS_BuzzerSetting !== 3)
                { 
					var LASVolumeChange = 1; //default is set to High
					switch(this._cachedLDWS_BuzzerVolume)
					{
						case 1 : 
							LASVolumeChange = 1; //High
							this._cachedLAS_SoundVibrationVolume = LASVolumeChange;
							break;
						case 2 : 
							LASVolumeChange = 1; //High
							this._cachedLAS_SounBeepVolume = LASVolumeChange;
							break;
						case 3 : 
							LASVolumeChange = 2; //Low
							this._cachedLAS_SoundRumbleVolume = LASVolumeChange;
							break;
						default:
							break;
					}
					log.info("Set Beep/Vib :: "+LASVolumeChange);
					this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexSound,LASVolumeChange);
                }
				else if(this._cachedLDWS_BuzzerVolume != null)
				{
					log.info("Set Rumble :: "+this._cachedLDWS_BuzzerVolume);
					this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexSound,this._cachedLDWS_BuzzerVolume);
				}
                this._currentContextTemplate.list2Ctrl.updateItems(this._indexSound,this._indexSound);
            }
        }
    }
}
vehsettingsApp.prototype._LAS_SoundVolumeMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_LAS_SoundVolumeMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedLAS_SoundVolume = msg.params.payload.evData;
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "LAS")
            {
				if(this._cachedLASSound === 1)
				{
					this._cachedLAS_SoundVibrationVolume = msg.params.payload.evData;
					if(this._cachedLAS_SoundVibrationVolume === 1 || this._cachedLAS_SoundVibrationVolume === 2)
					{
						this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexSound,1);
					}
					else
					{
						this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexSound,2);
					}
				}
				else if(this._cachedLASSound === 2)
				{
					this._cachedLAS_SounBeepVolume = msg.params.payload.evData;
					if(this._cachedLAS_SounBeepVolume === 1 || this._cachedLAS_SounBeepVolume === 2)
					{
						this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexSound,1);
					}
					else
					{
						this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexSound,2);
					}
				}
				else if(this._cachedLASSound === 3)
				{
					this._cachedLAS_SoundRumbleVolume = msg.params.payload.evData;
					this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexSound,this._cachedLAS_SoundRumbleVolume);
				}
                this._currentContextTemplate.list2Ctrl.updateItems(this._indexSound,this._indexSound);
            }
        }
    }
}
// LDWS_RumbleStripsVolume
vehsettingsApp.prototype._LDWS_RumbleStripsVolumeMsgHandler = function(msg)
{
	if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {        
        this._cachedLAS_RumbleStripsVolume = msg.params.payload.evData;
		
		this._cachedLDWS_RumbleStripsVolume = msg.params.payload.evData; 
		this._cachedLDWS_BuzzerVolume = msg.params.payload.evData;
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "LDWS")
            {
				if (this._cachedLDWS_RumbleStripsVolume != null && this._cachedLDWS_BuzzerSetting === 2)
				{
					this._currentContextTemplate.list2Ctrl.setToggleValue(3,this._cachedLDWS_RumbleStripsVolume);
				}
            }
            else if (this._currentContext.ctxtId === "LAS")
            {
				
				switch(this._cachedLASSound)
				{
					case 1 : 
						this._cachedLAS_SoundVibrationVolume = msg.params.payload.evData;
						break;
					case 2 : 
						this._cachedLAS_SounBeepVolume = msg.params.payload.evData;
						break;
					case 3 : 
						this._cachedLAS_SoundRumbleVolume = msg.params.payload.evData;
						break;
					default:
						break;
				}
								
				
				if (this._cachedLDWS_RumbleStripsVolume != null && this._cachedLDWS_BuzzerSetting === 3)
                {
                    this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexSound,this._cachedLDWS_RumbleStripsVolume);
                }
                this._currentContextTemplate.list2Ctrl.updateItems(this._indexSound,this._indexSound);
            }
        }
    }
}

// Safety_AutoWiper
vehsettingsApp.prototype._Safety_AutoWiperMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_Safety_AutoWiperMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedSafety_AutoWiper = msg.params.payload.evData; 
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "VehicleSettingsTab" &&
                this._autoWiperToggleIndex != null && this._autoWiperToggleIndex != undefined &&
                this._cachedSafety_AutoWiper != null && this._cachedSafety_AutoWiper != undefined )
            {
                this._currentContextTemplate.list2Ctrl.setToggleValue(this._autoWiperToggleIndex,this._cachedSafety_AutoWiper);
            }
        }
    }
}
// Safety_InterioLightTimeoutDoorOpen
vehsettingsApp.prototype._Safety_InterioLightTimeoutDoorOpenMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_Safety_InterioLightTimeoutDoorOpenMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedSafety_InterioLightTimeoutDoorOpen = msg.params.payload.evData; 
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "Lighting" || this._currentContext.ctxtId === "IntLightTimeoutDoorOpen")
            {
                if (this._cachedSafety_InterioLightTimeoutDoorOpen != null)
                {
                    //this._currentContextTemplate.list2Ctrl.setTick(this._cachedSafety_InterioLightTimeoutDoorOpen - 1, true);
                    this.populateListCtrl(this._currentContextTemplate);
                }
            }
        }
    }
}
// Safety_InterioLightTimeoutDoorClosed
vehsettingsApp.prototype._Safety_InterioLightTimeoutDoorClosedMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_Safety_InterioLightTimeoutDoorClosedMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedSafety_InterioLightTimeoutDoorClosed = msg.params.payload.evData; 
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "Lighting" || this._currentContext.ctxtId === "IntLightTimeoutDoorClosed")
            {
                if (this._cachedSafety_InterioLightTimeoutDoorClosed != null)
                {
                    //this._currentContextTemplate.list2Ctrl.setTick(this._cachedSafety_InterioLightTimeoutDoorClosed-1, true);
                    this.populateListCtrl(this._currentContextTemplate);
                }
            }
        }
    }
}
// Safety_3flashTurnSignal
vehsettingsApp.prototype._Safety_3flashTurnSignalMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_Safety_3flashTurnSignalMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedSafety_3flashTurnSignal = msg.params.payload.evData; 
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "TurnSettings" && 
                this._3flashTurnSettingsToggleIndex != null && this._3flashTurnSettingsToggleIndex != undefined &&
                this._cachedSafety_3flashTurnSignal != null && this._cachedSafety_3flashTurnSignal != undefined )
            {
                this._currentContextTemplate.list2Ctrl.setToggleValue(this._3flashTurnSettingsToggleIndex,this._cachedSafety_3flashTurnSignal);
            }
        }
    }
}
// Safety_TurnSignalIndicatorVolume
vehsettingsApp.prototype._Safety_TurnSignalIndicatorVolumeMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_Safety_TurnSignalIndicatorVolumeMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedSafety_TurnSignalIndicatorVolume = msg.params.payload.evData; 
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "TurnSettings" && 
                this._cachedSafety_TurnSignalIndicatorVolume != null && this._cachedSafety_TurnSignalIndicatorVolume != undefined &&
                this._turnSignalVolumeToggleIndex != null && this._turnSignalVolumeToggleIndex != undefined )
            {
                this._currentContextTemplate.list2Ctrl.setToggleValue(this._turnSignalVolumeToggleIndex,this._cachedSafety_TurnSignalIndicatorVolume);
            }
        }
    }
}
// Safety_AutoDoorLock
vehsettingsApp.prototype._Vehicle_AutoDoorLockAT_MsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
       log.info("_Safety_AutoDoorLockMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedGet_AutoDoorLockAT = msg.params.payload.evData; 
        // populate
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "DoorLock" || this._currentContext.ctxtId === "DoorLockMode")
            {
                if (this._cachedGet_AutoDoorLockAT != null)
                {
                    //this._currentContextTemplate.list2Ctrl.setTick(this._cachedSafety_AutoDoorLock-1, true);
                    this.populateListCtrl(this._currentContextTemplate);
                }
            }
        }
    }
}

vehsettingsApp.prototype._Vehicle_AutoDoorLockAT6_MsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_Safety_AutoDoor6LockMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedGet_AutoDoorLockAT6 = msg.params.payload.evData; 
        // populate
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "DoorLock" || this._currentContext.ctxtId === "DoorLockMode")
            {
                if (this._cachedGet_AutoDoorLockAT6 != null)
                {
                    //this._currentContextTemplate.list2Ctrl.setTick(this._cachedSafety_AutoDoorLock-1, true);
                    this.populateListCtrl(this._currentContextTemplate);
                }
            }
        }
    }
}

vehsettingsApp.prototype._Vehicle_AutoDoorLockMT_MsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_Safety_AutoDoorLockMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedGet_AutoDoorLockMT = msg.params.payload.evData; 
        // populate
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "DoorLock" || this._currentContext.ctxtId === "DoorLockMode")
            {
                if (this._cachedGet_AutoDoorLockMT != null)
                {
                    //this._currentContextTemplate.list2Ctrl.setTick(this._cachedSafety_AutoDoorLock-1, true);
                    this.populateListCtrl(this._currentContextTemplate);
                }
            }
        }
    }
}

// Safety_AutoDoorLockChimeVolume
vehsettingsApp.prototype._Safety_AutoDoorLockChimeVolumeMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_Safety_AutoDoorLockChimeVolumeMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedSafety_AutoDoorLockChimeVolume = msg.params.payload.evData; 
        // populate
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "DoorLock" || this._currentContext.ctxtId === "KeylessLockBeepVol")
            {
                if (this._cachedSafety_AutoDoorLockChimeVolume != null)
                {
                    //this._currentContextTemplate.list2Ctrl.setTick(this._cachedSafety_AutoDoorLockChimeVolume -1, true);
                    this.populateListCtrl(this._currentContextTemplate);
                    // this._currentContextTemplate.list2Ctrl.updateItems(0,this._KeylessLockBeepVolCtxtDataList.itemCount - 1);
                }
            }
        }
    }
}
// Safety_AutoRelockTimer
vehsettingsApp.prototype._Safety_AutoRelockTimerMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_Safety_AutoRelockTimerMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedSafety_AutoRelockTimer = msg.params.payload.evData; 
        // populate
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "DoorLock" || this._currentContext.ctxtId === "DoorRelockTime")
            {
                if (this._cachedSafety_AutoRelockTimer != null)
                { 
                    //this._currentContextTemplate.list2Ctrl.setTick(this._cachedSafety_AutoRelockTimer-1, true);
                    this.populateListCtrl(this._currentContextTemplate);
                }
            }
        }
    }
}

// RVM_Volume
vehsettingsApp.prototype._RVM_VolumeMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_RVM_VolumeMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedRVMBuzzerVolume = msg.params.payload.evData; 
        // populate
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "SafetyTab" || this._currentContext.ctxtId === "RVMVolume")
            {
                if (this._cachedRVMBuzzerVolume != null)
                {
                    //this._currentContextTemplate.list2Ctrl.setTick(this._cachedRVMBuzzerVolume-1, true);
                    this.populateListCtrl(this._currentContextTemplate);
                }
            }
        }
    }
}

// BSM_Volume
vehsettingsApp.prototype._BSM_VolumeMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.evData != null && msg.params.payload.evData != undefined )
    {
        log.info("_BSM_VolumeMsgHandler called with msg" + msg.params.payload.evData);
        this._cachedBSMBuzzerVolume = msg.params.payload.evData; 
        // populate
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "SafetyTab" || this._currentContext.ctxtId === "BSMVolume")
            {
                if (this._cachedBSMBuzzerVolume != null)
                {
                    //this._currentContextTemplate.list2Ctrl.setTick(this._cachedBSMBuzzerVolume-1, true);
                    this.populateListCtrl(this._currentContextTemplate);
                }
            }
        }
    }
}
vehsettingsApp.prototype._AtSpeedMsgHandler = function(msg)
{
    log.info("_AtSpeedMsgHandler called "); 
    if(msg)
    {
         this.cachedSpeed = true;
         this._DisableSpeedRestricted(); 
    }

}
// NoSpeed
vehsettingsApp.prototype._NoSpeedMsgHandler = function(msg)
{
    log.info("_NoSpeedMsgHandler called "); 
    if (msg)
    {
       this.cachedSpeed = false;
       this._DisableSpeedRestricted(); 
    }
    
}
//VehicleTab Contextin Functions
vehsettingsApp.prototype._VehicleSettingsTabCtxtIn = function()
{
    this._HudInstalledStatusHandler();
}
//SafetyTab Contextin Functions
vehsettingsApp.prototype._SafetyTabTabCtxtIn = function()
{
    this._HudInstalledStatusHandler();
}
//HUDTab Contextin Functions
vehsettingsApp.prototype._HUDTabCtxtIn = function()
{
    this._HudInstalledStatusHandler();
}

vehsettingsApp.prototype._VoltageStatusMsgHandler = function(msg)
{
    log.info("_HudErrorMsgHandler called with msg:" + msg.params.payload.evData); 
    if (msg && msg.params.payload)
    {
       this._cachedvoltageStatus = msg.params.payload.evData;  
       if (this._currentContext && this._currentContextTemplate)
       {
           this.populateListCtrl(this._currentContextTemplate);
           this._populateDialogCtrl(this._currentContextTemplate);
       }
    }
}
/**************************
 * Helper functions
 **************************/
//populate List control
vehsettingsApp.prototype._populateListCtrl = function(tmplt)
{
    var items = new Array();
    switch (this._currentContext.ctxtId)            
    {
        case "HUDTab": 
            this._latestValueHudBrightnessControl = this._cachedHudAutoIntensityOnOff;
            this._latestValueHudHeight = this._cachedHudTilt;
            this._latestValueHudBrightnessCalibration = this._cachedHudCalibration;
            this._latestValueHudBrightness = this._cachedHudIntensity;
            this._latestValueHudNavigation = this._cachedHudTurnByTurn;
            this._latestValueHudOpenClose = this._cachedHudOnOffStatus;
            var listLength = this._HUDTabCtxtDataListBrightnessControlOn.itemCount;
            if (framework.debugMode && this._cachedHudAutoIntensityOnOff === null) 
            {
                this._cachedHudAutoIntensityOnOff = 1;
            } 
            //Show     Calibration or Brightness depending on BrightnessControl value
            if (this._cachedHudAutoIntensityOnOff === 1)
            {
                tmplt.list2Ctrl.dataList.items[2] = this._HUDTabCtxtDataListBrightnessControlOff.items[1];
                if (this._cachedHudCalibration != undefined && this._cachedHudCalibration != null) 
                {
                    tmplt.list2Ctrl.dataList.items[2].value = this._cachedHudCalibration;  
                } 
                tmplt.list2Ctrl.updateItems(2,2);   
            }
            else if(this._cachedHudAutoIntensityOnOff === 2)
            {
                tmplt.list2Ctrl.dataList.items[2] = this._HUDTabCtxtDataListBrightnessControlOff.items[0];
                if (this._cachedHudIntensity != undefined && this._cachedHudIntensity != null) 
                {
                    tmplt.list2Ctrl.dataList.items[2].value = this._cachedHudIntensity;
                } 
                tmplt.list2Ctrl.updateItems(2,2);    
            }  
            //0 HEIGHT
            if (this._cachedHudTilt != null && this._cachedHudTilt != undefined) 
            { 
                tmplt.list2Ctrl.dataList.items[0].value = this._cachedHudTilt; 
            }
            
            //1 BRIGHTNESS CONTROL
            if (this._cachedHudAutoIntensityOnOff) 
            {
                tmplt.list2Ctrl.dataList.items[1].value = this._cachedHudAutoIntensityOnOff;  
            } 
            
            //3 NAVIGATION
            if (this._cachedHudTurnByTurn) 
            { 
                tmplt.list2Ctrl.dataList.items[3].value = this._cachedHudTurnByTurn; 
            }

            //4 HeadsUpDisplay
            if (this._cachedHudControlAllowed === 0 || this._cachedHudError === 1  || this._cachedvoltageStatus === 0 )
            {
                for (var controlHUD = 0; controlHUD < 6; controlHUD++)
                {
                     tmplt.list2Ctrl.dataList.items[controlHUD].disabled = true;
                }
            }
            else
            {
                for (var controlHUD = 0; controlHUD < 6; controlHUD++)
                {
                    tmplt.list2Ctrl.dataList.items[controlHUD].disabled = false;
                }
                if (tmplt.list2Ctrl.dataList.items[4].disabled != true && this._cachedHudOnOffStatus) 
                { 
                    tmplt.list2Ctrl.dataList.items[4].value = this._cachedHudOnOffStatus; 
                    if (this._cachedHudOnOffStatus === 1 && this._cachedHudControlAllowed === 1 && this._cachedvoltageStatus === 1)
                    {
                        tmplt.list2Ctrl.dataList.items[0].disabled = false;
                        tmplt.list2Ctrl.dataList.items[1].disabled = false;
                        tmplt.list2Ctrl.dataList.items[2].disabled = false;
                        tmplt.list2Ctrl.dataList.items[3].disabled = false;
                        tmplt.list2Ctrl.dataList.items[5].disabled = false;
                    }
                    if (this._cachedHudOnOffStatus === 2)
                    {
                        tmplt.list2Ctrl.dataList.items[0].disabled = true;
                        tmplt.list2Ctrl.dataList.items[1].disabled = true;
                        tmplt.list2Ctrl.dataList.items[2].disabled = true;
                        tmplt.list2Ctrl.dataList.items[3].disabled = true;
                        tmplt.list2Ctrl.dataList.items[5].disabled = true;
                    } 
                } 
            } 
            if (tmplt.list2Ctrl.dataList.itemCount) 
            { 
                tmplt.list2Ctrl.updateItems(0,tmplt.list2Ctrl.dataList.itemCount - 1); 
            }    
            if (this._currentListItemIndex != null)
            {
                tmplt.list2Ctrl.topItem = this._currentListItemIndex;
                this._currentListItemIndex = null;
            }
            if (tmplt.list2Ctrl.dataList.itemCount !=  listLength)
            {
                this._isListChanged = true;
            }
            break;  
        case "SafetyTab":
            //DYNAMIC LIST
            this._latestValueDA = this._cachedDA;
            this._latestValueSCBS = this._cachedSBS_CityBrakeSystem;
            var listLength = this._SafetyTabCtxtDataList.itemCount;
            var tempArraySafetyTab = new Array();
            tempArraySafetyTab = this.getAdjustedValueforDataListSafetyTab();
            tmplt.list2Ctrl.dataList.items = tempArraySafetyTab;
            tmplt.list2Ctrl.dataList.itemCount = tempArraySafetyTab.length;
            
            //if any of the status is disable, disable all the settings
            if ((this._delayStatus === "disabled") || (this._CANStatus === false) || (this._cachedvoltageStatus === 0))
            {
                for(var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = true;
                }
            }
            else if ((this._delayStatus === "enabled") && (this._CANStatus === true) && (this._cachedvoltageStatus === 1))
            {//if both of the status are enable, enable all the settings
                for (var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = false;
                }
            }

            this._currentContextTemplate.list2Ctrl.setDataList(tmplt.list2Ctrl.dataList);
            if (tmplt.list2Ctrl.dataList.itemCount) 
            { 
                tmplt.list2Ctrl.updateItems(0,tmplt.list2Ctrl.dataList.itemCount - 1); 
            } 
            if (tmplt.list2Ctrl.dataList.itemCount == 0)
            {
                this._currentContextTemplate.list2Ctrl.setLoading(false);
            }
            if (tmplt.list2Ctrl.dataList.itemCount !=  listLength)
            {
                this._isListChanged = true;
            }
            break;
        case "VehicleSettingsTab":
         if (this._cachedVehicle_AutoDoorLockInstalledAT === 0 && this._cachedVehicle_AutoDoorLockInstalledMT === 0 && this._cachedVehicle_AutoDoorLockInstalledAT6 === 0)
            {
                this.statusArrayDoorLock[0] = false;
            }
            else
            {
                this.statusArrayDoorLock[0] = true; 
            }
            this._latestValueRainSensingWiper = this._cachedSafety_AutoWiper;
            var listLength = this._VehicleSettingsTabCtxtDataList.itemCount;
            var tempArrayVehicleTab = new Array();//For vehicle tab's removable entries
            tempArrayVehicleTab = this.getAdjustedValueforDataListVehicleTab();
            tmplt.list2Ctrl.dataList.items = tempArrayVehicleTab;
            tmplt.list2Ctrl.dataList.itemCount = tempArrayVehicleTab.length;
            //if any of the status is disable, disable all the settings
            if ((this._delayStatus === "disabled") || (this._CANStatus === false) || (this._cachedvoltageStatus === 0))
            {
                for(var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = true;
                }
            }
            else if ((this._delayStatus === "enabled") && (this._CANStatus === true) && (this._cachedvoltageStatus === 1))
            {//if both of the status are enable, enable all the settings
                for (var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = false;
                }
               var index = 0;
               //Auto Wiper
               if (this.statusArrayVehicleTab[0] === true)
               {
                   tmplt.list2Ctrl.dataList.items[index].disabled = this.cachedSpeed;
                   index++;
               }
             //Door Lock
               if (this.statusArrayVehicleTab[1] === true)
               {
                   tmplt.list2Ctrl.dataList.items[index].disabled = this.cachedSpeed;
                   index++;
               }
             //Turn
               if (this.statusArrayVehicleTab[2] === true)
               {
                   tmplt.list2Ctrl.dataList.items[index].disabled = this.cachedSpeed;
                   index++;
               }
             //Lighting
               if (this.statusArrayVehicleTab[3] === true)
               {
                   
                   if ((this.statusArray[2] === true) || (this.statusArray[3] === true))
                   {
                   tmplt.list2Ctrl.dataList.items[index].disabled = false;
                   }
                   else if((this.statusArray[2] === false) && (this.statusArray[3] === false))
                   {
                   tmplt.list2Ctrl.dataList.items[index].disabled = this.cachedSpeed;
                   }
                   //tmplt.list2Ctrl.dataList.items[index].disabled = this.cachedSpeed;
                   index++;
               }
            }
            this._currentContextTemplate.list2Ctrl.setDataList(tmplt.list2Ctrl.dataList);
            if (tmplt.list2Ctrl.dataList.itemCount) 
            { 
                tmplt.list2Ctrl.updateItems(0,tmplt.list2Ctrl.dataList.itemCount - 1); 
            } 
            if (tmplt.list2Ctrl.dataList.itemCount == 0)
            {
                this._currentContextTemplate.list2Ctrl.setLoading(false);
            }
            if (tmplt.list2Ctrl.dataList.itemCount !=  listLength)
            {
                this._isListChanged = true;
            }
            break; 
        case "TurnSettings": 
            this._latestValueTurnSignalIndicatorVolume = this._cachedSafety_TurnSignalIndicatorVolume;
            this._latestValue3FlashTurnSignal = this._cachedSafety_3flashTurnSignal;
            var listLength = this._TurnSettingsCtxtDataList.itemCount;
            var tempArray2 = new Array();
            tempArray2 = this.getAdjustedValueforDataListTurn(tmplt.list2Ctrl.dataList.items);
            tmplt.list2Ctrl.dataList.items = tempArray2;
            tmplt.list2Ctrl.dataList.itemCount = tempArray2.length;
            this._currentContextTemplate.list2Ctrl.setDataList(tmplt.list2Ctrl.dataList);
            this._currentContextTemplate.list2Ctrl.updateItems(0,tempArray2.length - 1);             
            if ((this._delayStatus === "disabled") || (this._CANStatus === false) || (this._cachedvoltageStatus === 0))
            {
                for(var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = true;
                }
            }
            else if ((this._delayStatus === "enabled") && (this._CANStatus === true) && (this._cachedvoltageStatus === 1))
            {//if both of the status are enable, enable all the settings
                for (var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = false;
                }
                var index = 0;
                //3 flash turn
                if (this.statusArrayTurn[0] === true)
                {
                    tmplt.list2Ctrl.dataList.items[index].disabled = this.cachedSpeed;
                    index++;
                }
              //Turn signal volume
                if (this.statusArrayTurn[1] === true)
                {
                    tmplt.list2Ctrl.dataList.items[index].disabled = this.cachedSpeed;
                    index++;
                }
              //Turn reset
                if (this.statusArrayTurn[2] === true)
                {
                    tmplt.list2Ctrl.dataList.items[index].disabled = this.cachedSpeed;
                    index++;
                }
            }
            if (tmplt.list2Ctrl.dataList.itemCount) 
            { 
                this._currentContextTemplate.list2Ctrl.setDataList(tmplt.list2Ctrl.dataList);
                tmplt.list2Ctrl.updateItems(0,tmplt.list2Ctrl.dataList.itemCount - 1); 
            }
            if (tmplt.list2Ctrl.dataList.itemCount == 0)
            {
                this._currentContextTemplate.list2Ctrl.setLoading(false);
            }
            if (tmplt.list2Ctrl.dataList.itemCount !=  listLength)
            {
                this._isListChanged = true;
            }
            break;  
        case "Lighting":
            this._latestValueHBC = this._cachedHeadlight_HighBeamControll;
            this._latestValueAFS = this._cachedAFS;
            this._latestValueDaytimeRunningLights = this._cachedHeadlight_DaytimeLights;
            this._latestValueHeadLightOnWarning = this._cachedHeadlight_HeadlightOnWaring;
            this._latestValueCHLT = this._cachedCHLT;
            this._latestValueLHL = this._cachedLHL;
            var listLength = this._LightingCtxtDataList.itemCount;
            var tempArray = new Array();
            tempArray = this.getAdjustedValueforDataListLighting(tmplt.list2Ctrl.dataList.items);
            tmplt.list2Ctrl.dataList.items = tempArray;
            tmplt.list2Ctrl.dataList.itemCount = tempArray.length;
            //this._currentContextTemplate.list2Ctrl.setDataList(tmplt.list2Ctrl.dataList);
            //this._currentContextTemplate.list2Ctrl.updateItems(0,tempArray.length - 1); 
            if ((this._delayStatus === "disabled") || (this._CANStatus === false) || (this._cachedvoltageStatus === 0))
            {
                for(var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = true;
                }
            }
            else if ((this._delayStatus === "enabled") && (this._CANStatus === true) && (this._cachedvoltageStatus === 1))
            {//if both of the status are enable, enable all the settings
                for (var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = false;
                }
                var index = 0;
                //Light Time out door open
                if (this.statusArray[0] === true)
                {
                    tmplt.list2Ctrl.dataList.items[index].disabled = this.cachedSpeed;
                    index++;
                }
              //Light Time Out Door closed
                if (this.statusArray[1] === true)
                {
                    tmplt.list2Ctrl.dataList.items[index].disabled = this.cachedSpeed;
                    index++;
                }
              //High Beam Control
                if (this.statusArray[2] === true)
                {
                    //Do not apply atSpeed.
                    index++;
                }
              //AFS
                if (this.statusArray[3] === true)
                {
                    //Do not apply atSpeed.
                    index++;
                }
              //Headlight On
                if (this.statusArray[4] === true)
                {
                    tmplt.list2Ctrl.dataList.items[index].disabled = this.cachedSpeed;
                    index++;
                }
                //Headlight off Timer
                if (this.statusArray[5] === true)
                {
                    tmplt.list2Ctrl.dataList.items[index].disabled = this.cachedSpeed;
                    index++;
                }
                //CHLT
                if (this.statusArray[6] === true)
                {
                    tmplt.list2Ctrl.dataList.items[index].disabled = this.cachedSpeed;
                    index++;
                }
                //LHL
                if (this.statusArray[7] === true)
                {
                    tmplt.list2Ctrl.dataList.items[index].disabled = this.cachedSpeed;
                    index++;
                }
              //Daytime Running light
                if (this.statusArray[8] === true)
                {
                    tmplt.list2Ctrl.dataList.items[index].disabled = this.cachedSpeed;
                    index++;
                }
              //Auto Headlight On
                if (this.statusArray[9] === true)
                {
                    tmplt.list2Ctrl.dataList.items[index].disabled = this.cachedSpeed;
                    index++;
                }
                //Reset
                if (this.statusArray[10] === true)
                {
                    tmplt.list2Ctrl.dataList.items[index].disabled = this.cachedSpeed;
                    index++;
                }
            }
            this._currentContextTemplate.list2Ctrl.setDataList(tmplt.list2Ctrl.dataList);
            if (tmplt.list2Ctrl.dataList.itemCount) 
            { 
                tmplt.list2Ctrl.updateItems(0,tmplt.list2Ctrl.dataList.itemCount - 1); 
            } 
            if (tmplt.list2Ctrl.dataList.itemCount == 0)
            {
                this._currentContextTemplate.list2Ctrl.setLoading(false);
            }
            if (tmplt.list2Ctrl.dataList.itemCount !=  listLength)
            {
                this._isListChanged = true;
            }
            break;
        //DoorLock    
        case "DoorLock":
            this._latestValueWalkAwayLock = this._cachedKeyless_WalkAwayLock;
            var listLength = this._DoorLockCtxtDataList.itemCount;
            if (this._cachedVehicle_AutoDoorLockInstalledAT6 === 0 && this._cachedVehicle_AutoDoorLockInstalledAT === 0 && this._cachedVehicle_AutoDoorLockInstalledMT === 0 )
            {
                this.statusArrayDoorLock[0] = false;
            }
            else
            {
                this.statusArrayDoorLock[0] = true; 
            }
            var tempArrayDoorLock = new Array();
            tempArrayDoorLock = this.getAdjustedValueForDataListDoorLock(tmplt.list2Ctrl.dataList.items);
            tmplt.list2Ctrl.dataList.items = tempArrayDoorLock;
            tmplt.list2Ctrl.dataList.itemCount = tempArrayDoorLock.length;
            //this._currentContextTemplate.list2Ctrl.setDataList(tmplt.list2Ctrl.dataList);
            //this._currentContextTemplate.list2Ctrl.updateItems(0,tempArrayDoorLock.length - 1);              
            if ((this._delayStatus === "disabled") || (this._CANStatus === false) || (this._cachedvoltageStatus === 0))
            {
                for(var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = true;
                }
            }
            else if ((this._delayStatus === "enabled") && (this._CANStatus === true) && (this._cachedvoltageStatus === 1))
            {//if both of the status are enable, enable all the settings
                for (var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = false;
                }
                var index = 0;
                //Door Lock Mode
                if (this.statusArrayDoorLock[0] === true)
                {
                    tmplt.list2Ctrl.dataList.items[index].disabled = this.cachedSpeed;
                    index++;
                }
              //Keyless Lock Beep Volume
                if (this.statusArrayDoorLock[1] === true)
                {
                    tmplt.list2Ctrl.dataList.items[index].disabled = this.cachedSpeed;
                    index++;
                }
              //Door Relock Time
                if (this.statusArrayDoorLock[2] === true)
                {
                    tmplt.list2Ctrl.dataList.items[index].disabled = this.cachedSpeed;
                    index++;
                }
              //Unlock Mode
                if (this.statusArrayDoorLock[3] === true)
                {
                    tmplt.list2Ctrl.dataList.items[index].disabled = this.cachedSpeed;
                    index++;
                }
                //Walk Away Lock
                if (this.statusArrayDoorLock[4] === true)
                {
                    tmplt.list2Ctrl.dataList.items[index].disabled = this.cachedSpeed;
                    index++;
                }
              //Reset
                if (this.statusArrayDoorLock[5] === true)
                {
                    tmplt.list2Ctrl.dataList.items[index].disabled = this.cachedSpeed;
                    index++;
                }
            }
            this._currentContextTemplate.list2Ctrl.setDataList(tmplt.list2Ctrl.dataList);
            if (tmplt.list2Ctrl.dataList.itemCount) 
            { 
                tmplt.list2Ctrl.updateItems(0,tmplt.list2Ctrl.dataList.itemCount - 1); 
            } 
            if (tmplt.list2Ctrl.dataList.itemCount == 0)
            {
                this._currentContextTemplate.list2Ctrl.setLoading(false);
            }
            if (tmplt.list2Ctrl.dataList.itemCount !=  listLength)
            {
                this._isListChanged = true;
            }
            break; 
        case "DoorLockMode": 
            this._latestValueAutoDoorLock = this._cachedSafety_AutoDoorLock;
            this._cachedListLength = this._DoorLockModeManualTransmissionCtxtDataList.itemCount;
            this._latestValueAutoDoorLockAT6 = this._cachedGet_AutoDoorLockAT6;
            this._latestValueAutoDoorLockAT = this._cachedGet_AutoDoorLockAT;
            this._latestValueAutoDoorLockMT = this._cachedGet_AutoDoorLockMT;
            if (this._cachedVehicle_AutoDoorLockInstalledAT6 === 1)
            {
                this._currentContextTemplate.list2Ctrl.setDataList(this._DoorLockModeAutoTransmission6CtxtDataList);
                if (tmplt.list2Ctrl.dataList.itemCount) 
                { 
                    tmplt.list2Ctrl.updateItems(0,tmplt.list2Ctrl.dataList.itemCount - 1);
                }
				switch(this._cachedGet_AutoDoorLockAT6)
				{
					case "AT6_Shift_OutOfPark_UnlockInPark":
						tmplt.list2Ctrl.setTick(0, true);
						break;
					case "AT6_Shift_OutOfPark":
						tmplt.list2Ctrl.setTick(1, true);
						break;
					case "AT6_Driving_Unlock_In_Park":
						tmplt.list2Ctrl.setTick(2, true);
						break;
					case "AT6_DrivingUnlock_IGN_Off":
						tmplt.list2Ctrl.setTick(3, true);
						break;
					case "AT6_Driving":
						tmplt.list2Ctrl.setTick(4, true);
						break;
					case "AT6_Off":
						tmplt.list2Ctrl.setTick(5, true);
						break;
				}
                //tmplt.list2Ctrl.setTick(this._cachedGet_AutoDoorLockAT6-1, true);
            }
            else if (this._cachedVehicle_AutoDoorLockInstalledAT === 1)
            {
                this._currentContextTemplate.list2Ctrl.setDataList(this._DoorLockModeAutoTransmissionCtxtDataList);
                if (tmplt.list2Ctrl.dataList.itemCount) 
                { 
                    tmplt.list2Ctrl.updateItems(0,tmplt.list2Ctrl.dataList.itemCount - 1); 
                }
                tmplt.list2Ctrl.setTick(this._cachedGet_AutoDoorLockAT-1, true);
            }
            else if (this._cachedVehicle_AutoDoorLockInstalledMT === 1 )
            {
                this._currentContextTemplate.list2Ctrl.setDataList(this._DoorLockModeManualTransmissionCtxtDataList);
                if (tmplt.list2Ctrl.dataList.itemCount) 
                { 
                    tmplt.list2Ctrl.updateItems(0,tmplt.list2Ctrl.dataList.itemCount - 1); 
                }
                tmplt.list2Ctrl.setTick(this._cachedGet_AutoDoorLockMT-1, true);
            }
                else if (this._cachedVehicle_AutoDoorLockInstalledAT === 0 && this._cachedVehicle_AutoDoorLockInstalledMT === 0 && this._cachedVehicle_AutoDoorLockInstalledAT6 === 0 )
                {
                    //var listLength = this._DoorLockModeManualTransmissionCtxtDataList.itemCount;
                    this._currentContextTemplate.list2Ctrl.setDataList(this._DoorLockModeNullDataList);
                }
            else
            {
                log.error("Auto and Manual door Lock mode cannot be installed simultaneously.Invalid case");
            }
            if ((this._delayStatus === "disabled") || (this._CANStatus === false) || (this._cachedvoltageStatus === 0))
            {
                for(var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = true;
                }
            }
            else if ((this._delayStatus === "enabled") && (this._CANStatus === true) && (this._cachedvoltageStatus === 1))
            {//if both of the status are enable, enable all the settings
                for (var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = false;
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = this.cachedSpeed;
                }
            }
            if (tmplt.list2Ctrl.dataList.itemCount) 
            { 
                tmplt.list2Ctrl.updateItems(0,tmplt.list2Ctrl.dataList.itemCount - 1); 
            }
            if (tmplt.list2Ctrl.dataList.itemCount != this._cachedListLength)
            {
                this._isListChanged = true;
            }
            break; 
        case "KeylessLockBeepVol":
            this._latestValueKeylessLockBeepVol = this._cachedSafety_AutoDoorLockChimeVolume;
            if (this._cachedSafety_AutoDoorLockChimeVolume != null)
            {
                tmplt.list2Ctrl.setTick(this._cachedSafety_AutoDoorLockChimeVolume-1, true);
               // this._currentContextTemplate.list2Ctrl.updateItems(0,this._KeylessLockBeepVolCtxtDataList.itemCount - 1);
            }
            if ((this._delayStatus === "disabled") || (this._CANStatus === false) || (this._cachedvoltageStatus === 0))
            {
                for(var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = true;
                }
            }
            else if ((this._delayStatus === "enabled") && (this._CANStatus === true) && (this._cachedvoltageStatus === 1))
            {//if both of the status are enable, enable all the settings
                for (var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = false;
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = this.cachedSpeed;
                }
            }
            this._currentContextTemplate.list2Ctrl.setDataList(tmplt.list2Ctrl.dataList);
            if (tmplt.list2Ctrl.dataList.itemCount) 
            { 
                tmplt.list2Ctrl.updateItems(0,tmplt.list2Ctrl.dataList.itemCount - 1); 
            }
           // this._currentContextTemplate.list2Ctrl.updateItems(0,tmplt.list2Ctrl.dataList.itemCount - 1);
            break; 
        case "DoorRelockTime":
            this._latestValueAutoRelockTimer = this._cachedSafety_AutoRelockTimer; 
            if (this._cachedSafety_AutoRelockTimer != null)
            { 
                tmplt.list2Ctrl.setTick(this._cachedSafety_AutoRelockTimer-1, true);
            }
            if ((this._delayStatus === "disabled") || (this._CANStatus === false) || (this._cachedvoltageStatus === 0))
            {
                for(var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = true;
                }
            }
            else if ((this._delayStatus === "enabled") && (this._CANStatus === true) && (this._cachedvoltageStatus === 1))
            {//if both of the status are enable, enable all the settings
                for (var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = false;
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = this.cachedSpeed;
                }
            }

            if (tmplt.list2Ctrl.dataList.itemCount) 
            {
                this._currentContextTemplate.list2Ctrl.setDataList(tmplt.list2Ctrl.dataList);
                tmplt.list2Ctrl.updateItems(0,tmplt.list2Ctrl.dataList.itemCount - 1); 
            }
            break;
        case "UnlockMode":
            this._latestValueUnlockMode = this._cachedKeyless_UnlockMode;
            if (this._cachedKeyless_UnlockMode != null)
            { 
                tmplt.list2Ctrl.setTick(this._cachedKeyless_UnlockMode-1, true);
            }
            if ((this._delayStatus === "disabled") || (this._CANStatus === false) || (this._cachedvoltageStatus === 0))
            {
                for(var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = true;
                }
            }
            else if ((this._delayStatus === "enabled") && (this._CANStatus === true) && (this._cachedvoltageStatus === 1))
            {//if both of the status are enable, enable all the settings
                for (var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = false;
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = this.cachedSpeed;
                }
            }

            if (tmplt.list2Ctrl.dataList.itemCount) 
            {
                this._currentContextTemplate.list2Ctrl.setDataList(tmplt.list2Ctrl.dataList); 
                tmplt.list2Ctrl.updateItems(0,tmplt.list2Ctrl.dataList.itemCount - 1); 
            }
            break; 
        case "BSMVolume":
            this._latestValueBSMBuzzerVolume = this._cachedBSMBuzzerVolume;
            if (this._cachedBSMBuzzerVolume != null)
            {
                tmplt.list2Ctrl.setTick(this._cachedBSMBuzzerVolume-1, true);
            }
            if ((this._delayStatus === "disabled") || (this._CANStatus === false) || (this._cachedvoltageStatus === 0))
            {
                for(var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = true;
                }
            }
            else if ((this._delayStatus === "enabled") && (this._CANStatus === true) && (this._cachedvoltageStatus === 1))
            {//if both of the status are enable, enable all the settings
                for (var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = false;
                }
            }

            if (tmplt.list2Ctrl.dataList.itemCount) 
            { 
                this._currentContextTemplate.list2Ctrl.setDataList(tmplt.list2Ctrl.dataList);
                tmplt.list2Ctrl.updateItems(0,tmplt.list2Ctrl.dataList.itemCount - 1); 
            }
            break;
        case "RVMVolume":
            this._latestValueRVMBuzzerVolume = this._cachedRVMBuzzerVolume;
            if (this._cachedRVMBuzzerVolume != null)
            {
                tmplt.list2Ctrl.setTick(this._cachedRVMBuzzerVolume-1, true);
                
            }
            if ((this._delayStatus === "disabled") || (this._CANStatus === false) || (this._cachedvoltageStatus === 0))
            {
                for(var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = true;
                }
            }
            else if ((this._delayStatus === "enabled") && (this._CANStatus === true) && (this._cachedvoltageStatus === 1))
            {//if both of the status are enable, enable all the settings
                for (var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = false;
                }
            }

            if (tmplt.list2Ctrl.dataList.itemCount) 
            { 
                this._currentContextTemplate.list2Ctrl.setDataList(tmplt.list2Ctrl.dataList);
                tmplt.list2Ctrl.updateItems(0,tmplt.list2Ctrl.dataList.itemCount - 1); 
            }
            break;
        case "LDWSTiming":
            this._latestValueLDWSTiming = this._cachedLDWSTiming;
            if (this._cachedLDWSTiming != null)
            {
                if (framework.localize.getRegion() != "Region_NorthAmerica")
                {
                    tmplt.list2Ctrl.setTick(this._cachedLDWSTiming-1, true);
                }
            }
            if ((this._delayStatus === "disabled") || (this._CANStatus === false) || (this._cachedvoltageStatus === 0))
            {
                for(var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = true;
                }
            }
            else if ((this._delayStatus === "enabled") && (this._CANStatus === true) && (this._cachedvoltageStatus === 1))
            {//if both of the status are enable, enable all the settings
                for (var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = false;
                }
            }

            if (tmplt.list2Ctrl.dataList.itemCount) 
            { 
                this._currentContextTemplate.list2Ctrl.setDataList(tmplt.list2Ctrl.dataList);
                tmplt.list2Ctrl.updateItems(0,tmplt.list2Ctrl.dataList.itemCount - 1); 
            }
            break;
        
        case "HeadlightOffTimer":
            this._latestValueHeadlightOffTimer = this._cachedHeadlight_HeadlightOffTimer; 
            if (this._cachedHeadlight_HeadlightOffTimer != null)
            { 
                tmplt.list2Ctrl.setTick(this._cachedHeadlight_HeadlightOffTimer-1, true);
            }
            if ((this._delayStatus === "disabled") || (this._CANStatus === false) || (this._cachedvoltageStatus === 0))
            {
                for(var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = true;
                }
            }
            else if ((this._delayStatus === "enabled") && (this._CANStatus === true) && (this._cachedvoltageStatus === 1))
            {//if both of the status are enable, enable all the settings
                for (var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = false;
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = this.cachedSpeed;
                }
            }

            if (tmplt.list2Ctrl.dataList.itemCount) 
            { 
                this._currentContextTemplate.list2Ctrl.setDataList(tmplt.list2Ctrl.dataList);
                tmplt.list2Ctrl.updateItems(0,tmplt.list2Ctrl.dataList.itemCount - 1); 
            }
            break;
        case "AutoHeadlightOn": 
            this._latestValueAutoHeadlightSensitivity = this._cachedHeadlight_AutoHeadlightsSensitivity;
            if (this._cachedHeadlight_AutoHeadlightsSensitivity != null)
            { 
                tmplt.list2Ctrl.setTick(this._cachedHeadlight_AutoHeadlightsSensitivity-1, true);
            }
            if ((this._delayStatus === "disabled") || (this._CANStatus === false) || (this._cachedvoltageStatus === 0))
            {
                for(var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = true;
                }
            }
            else if ((this._delayStatus === "enabled") && (this._CANStatus === true) && (this._cachedvoltageStatus === 1))
            {//if both of the status are enable, enable all the settings
                for (var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = false;
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = this.cachedSpeed;
                }
            }

            if (tmplt.list2Ctrl.dataList.itemCount) 
            { 
                this._currentContextTemplate.list2Ctrl.setDataList(tmplt.list2Ctrl.dataList);
                tmplt.list2Ctrl.updateItems(0,tmplt.list2Ctrl.dataList.itemCount - 1); 
            }
            break;
        
        case "IntLightTimeoutDoorOpen":
            this._latestValueInteriorLightTimeoutDoorOpen = this._cachedSafety_InterioLightTimeoutDoorOpen;
            if (this._cachedSafety_InterioLightTimeoutDoorOpen != null)
            {
                tmplt.list2Ctrl.setTick(this._cachedSafety_InterioLightTimeoutDoorOpen-1, true);
            }
            if ((this._delayStatus === "disabled") || (this._CANStatus === false) || (this._cachedvoltageStatus === 0))
            {
                for(var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = true;
                }
            }
            else if ((this._delayStatus === "enabled") && (this._CANStatus === true) && (this._cachedvoltageStatus === 1))
            {//if both of the status are enable, enable all the settings
                for (var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = false;
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = this.cachedSpeed;
                }
            }

            if (tmplt.list2Ctrl.dataList.itemCount) 
            { 
                this._currentContextTemplate.list2Ctrl.setDataList(tmplt.list2Ctrl.dataList);
                tmplt.list2Ctrl.updateItems(0,tmplt.list2Ctrl.dataList.itemCount - 1); 
            }
            break;  
        case "IntLightTimeoutDoorClosed":
            this._latestValueInteriorLightTimeoutDoorClosed = this._cachedSafety_InterioLightTimeoutDoorClosed;
            if (this._cachedSafety_InterioLightTimeoutDoorClosed != null)
            {
                tmplt.list2Ctrl.setTick(this._cachedSafety_InterioLightTimeoutDoorClosed - 1, true);
            }
            if ((this._delayStatus === "disabled") || (this._CANStatus === false) || (this._cachedvoltageStatus === 0))
            {
                for(var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = true;
                }
            }
            else if ((this._delayStatus === "enabled") && (this._CANStatus === true) && (this._cachedvoltageStatus === 1))
            {//if both of the status are enable, enable all the settings
                for (var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = false;
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = this.cachedSpeed;
                }
            }

            if (tmplt.list2Ctrl.dataList.itemCount) 
            { 
                this._currentContextTemplate.list2Ctrl.setDataList(tmplt.list2Ctrl.dataList);
                tmplt.list2Ctrl.updateItems(0,tmplt.list2Ctrl.dataList.itemCount - 1); 
            }
            break;  
        case "DRSS":
            this._latestValueDRSSDistance = this._cachedDRSS_DRSSSensitivity;
            this._latestValueDRSS = this._cachedDRSS_DRSS;
            if (this._cachedDRSS_DRSS != null)
            {
                tmplt.list2Ctrl.dataList.items[0].value = this._cachedDRSS_DRSS; 
            }
            if (this._cachedDRSS_DRSSSensitivity != null)
            {
                tmplt.list2Ctrl.dataList.items[1].value = this._cachedDRSS_DRSSSensitivity; 
            }
            tmplt.list2Ctrl.updateItems(0,1);
            if ((this._delayStatus === "disabled") || (this._CANStatus === false) || (this._cachedvoltageStatus === 0))
            {
                for(var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = true;
                }
            }
            else if ((this._delayStatus === "enabled") && (this._CANStatus === true) && (this._cachedvoltageStatus === 1))
            {//if both of the status are enable, enable all the settings
                for (var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = false;
                }
            }

            if (tmplt.list2Ctrl.dataList.itemCount) 
            { 
                this._currentContextTemplate.list2Ctrl.setDataList(tmplt.list2Ctrl.dataList);
                tmplt.list2Ctrl.updateItems(0,tmplt.list2Ctrl.dataList.itemCount - 1); 
            }
            break;  
        case "SBS":
            this._latestValueSBS = this._cachedSBS_BrakeSupport;
            this._latestValueSBSBuzzerVolume = this._cachedSBS_BuzzerVolume;
            this._latestValueSBSDistance = this._cachedSBS_Distance;
            if (framework.localize.getRegion() == "Region_Europe")
            {
                if (this._cachedSBS_BrakeSupport != null)
                {
                    tmplt.list2Ctrl.dataList.items[0].value = this._cachedSBS_BrakeSupport; 
                }
                if (this._cachedSBS_Distance != null)
                {
                    tmplt.list2Ctrl.dataList.items[1].value = this._cachedSBS_BuzzerVolume; 
                } 
            }
            else
            {
                if (this._cachedSBS_BrakeSupport != null)
                {
                    tmplt.list2Ctrl.dataList.items[0].value = this._cachedSBS_BrakeSupport; 
                }
                if (this._cachedSBS_Distance != null)
                {
                    tmplt.list2Ctrl.dataList.items[1].value = this._cachedSBS_Distance; 
                }
                if (this._cachedSBS_BuzzerVolume != null)
                {
                    tmplt.list2Ctrl.dataList.items[2].value = this._cachedSBS_BuzzerVolume; 
                } 
            }
            if ((this._delayStatus === "disabled") || (this._CANStatus === false) || (this._cachedvoltageStatus === 0))
            {
                for(var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = true;
                }
            }
            else if ((this._delayStatus === "enabled") && (this._CANStatus === true) && (this._cachedvoltageStatus === 1))
            {//if both of the status are enable, enable all the settings
                for (var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = false;
                }
            }

            if (tmplt.list2Ctrl.dataList.itemCount) 
            { 
                tmplt.list2Ctrl.updateItems(0,tmplt.list2Ctrl.dataList.itemCount - 1); 
            }
            break; 
        case "SBS_SCBS":
            this._latestValueSBS = this._cachedSBCSMode;
            this._latestValueSBSBuzzerVolume = this._cachedSBCSVolume;
            this._latestValueSBSDistance = this._cachedSBCSWarningDistance;
            if (framework.localize.getRegion() == "Region_Europe")
            {
                if (this._cachedSBCSMode != null)
                {
                    tmplt.list2Ctrl.dataList.items[0].value = this._cachedSBCSMode; 
                }   
                if (this._cachedSBCSVolume != null)
                {
                    tmplt.list2Ctrl.dataList.items[1].value = this._cachedSBCSVolume; 
                }
            }
            else
            {
                if (this._cachedSBCSMode != null)
                {
                    tmplt.list2Ctrl.dataList.items[0].value = this._cachedSBCSMode; 
                }
                if (this._cachedSBCSWarningDistance != null)
                {
                    tmplt.list2Ctrl.dataList.items[1].value = this._cachedSBCSWarningDistance; 
                }
                if (this._cachedSBCSVolume != null)
                {
                    tmplt.list2Ctrl.dataList.items[2].value = this._cachedSBCSVolume; 
                } 
            }
            if ((this._delayStatus === "disabled") || (this._CANStatus === false) || (this._cachedvoltageStatus === 0))
            {
                for(var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = true;
                }
            }
            else if ((this._delayStatus === "enabled") && (this._CANStatus === true) && (this._cachedvoltageStatus === 1))
            {//if both of the status are enable, enable all the settings
                for (var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = false;
                }
            }

            if (tmplt.list2Ctrl.dataList.itemCount) 
            { 
                tmplt.list2Ctrl.updateItems(0,tmplt.list2Ctrl.dataList.itemCount - 1); 
            }
            break;  
        case "FOW":
            this._latestValueFOWBuzzerVolume = this._cachedFOW_BuzzerVolume;
            this._latestValueFOWDistance = this._cachedFOW_Distance;
            this._latestValueFOW = this._cachedFOW_Distance;
            if (this._cachedFOW_Warning != null)
            {
                tmplt.list2Ctrl.dataList.items[0].value = this._cachedFOW_Warning; 
            }
            if (this._cachedFOW_Distance != null)
            {
                tmplt.list2Ctrl.dataList.items[1].value = this._cachedFOW_Distance; 
            }
            if (this._cachedFOW_BuzzerVolume != null)
            {
                tmplt.list2Ctrl.dataList.items[2].value = this._cachedFOW_BuzzerVolume; 
            }
            tmplt.list2Ctrl.updateItems(0,2);
            if ((this._delayStatus === "disabled") || (this._CANStatus === false) || (this._cachedvoltageStatus === 0))
            {
                for(var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = true;
                }
            }
            else if ((this._delayStatus === "enabled") && (this._CANStatus === true) && (this._cachedvoltageStatus === 1))
            {//if both of the status are enable, enable all the settings
                for (var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = false;
                }
            }

            if (tmplt.list2Ctrl.dataList.itemCount) 
            { 
                this._currentContextTemplate.list2Ctrl.setDataList(tmplt.list2Ctrl.dataList);
                tmplt.list2Ctrl.updateItems(0,tmplt.list2Ctrl.dataList.itemCount - 1); 
            }
            break;  
        case "LAS":
            this._latestValueLASVolume = this._cachedLAS_SoundVolume;
            this._latestValueLASIntervention = this._cachedIntervention;
            this._latestValueLASAlert = this._cachedLASAlert;
            this._latestValueLASWarning = this._cachedLASWarning; 
            this._latestValueLASBuzzerSetting = this._cachedLAS_BuzzerSetting;
            this._latestValueLASTiming = this._cachedLASTiming;
            this._latestValueLASNATiming = this._cachedLASNATiming;
            log.info("Cached LAS System : "+ this.cachedLaneAssistSystem+ " Cached Intervention : " +this._cachedIntervention);
			if(this._cachedIntervention > 2)//Intervention should not be greater than 2 so setting it to 2 to handle error condition from MMUI.
			{
				this._cachedIntervention = 2;
			}
            if (this.cachedLaneAssistSystem === 1 && this._cachedIntervention === 1)
            {
				var LASVolumeChange = 1; //default is set to High
				this._currentContextTemplate.list2Ctrl.setDataList(this._LASCtxtDataList);
				if (framework.localize.getRegion() === "Region_NorthAmerica")
				{
					tmplt.list2Ctrl.dataList.items[1] = this._LASCtxtDataListHelper.items[1];
					tmplt.list2Ctrl.dataList.items[2] = this._LASCtxtDataListHelper.items[3];
					this._indexSound = 5;
					this._indexWarning = 2;
					this._indexTiming = 1;
					tmplt.list2Ctrl.dataList.items[this._indexWarning].button1Id = "High_SensitivityLAS";
					tmplt.list2Ctrl.dataList.items[this._indexWarning].button2Id = "Low_SensitivityLAS";
				}
				else
				{
					tmplt.list2Ctrl.dataList.items[1] = this._LASCtxtDataListHelper.items[0];
					tmplt.list2Ctrl.dataList.items[2] = this._LASCtxtDataListHelper.items[2];
					this._indexSound = 5;
					this._indexWarning = 2;
					this._indexTiming = 1;
					tmplt.list2Ctrl.dataList.items[this._indexWarning].button1Id = "High_SensitivityLAS";
					tmplt.list2Ctrl.dataList.items[this._indexWarning].button2Id = "Medium_SensitivityLAS";
					tmplt.list2Ctrl.dataList.items[this._indexWarning].button3Id = "Low_SensitivityLAS";
				}
				if (this._cachedLDWS_BuzzerVolume != null && this._cachedLDWS_BuzzerSetting !== 3)
                { 
					switch(this._cachedLDWS_BuzzerVolume)
					{
						case 1 : 
							LASVolumeChange = 1; //High
							this._cachedLAS_SoundVibrationVolume = LASVolumeChange;
							break;
						case 2 : 
							LASVolumeChange = 1; //High
							this._cachedLAS_SounBeepVolume = LASVolumeChange;
							break;
						case 3 : 
							LASVolumeChange = 2; //Low
							this._cachedLAS_SoundRumbleVolume = LASVolumeChange;
							break;
						default:
							break;
					}
					log.info("Set Beep/Vib :: "+LASVolumeChange);
                }
				else if(this._cachedLDWS_BuzzerVolume != null)
				{
					log.info("Set Rumble :: "+this._cachedLDWS_BuzzerVolume);
					LASVolumeChange = this._cachedLDWS_BuzzerVolume; //High
				}

				if(this._cachedLASSound === 1)
				{
					tmplt.list2Ctrl.dataList.items[5] = this._LASSoundHelper.items[0];
					
				}
				else if(this._cachedLASSound === 2)
				{
					tmplt.list2Ctrl.dataList.items[5] = this._LASSoundHelper.items[1];
					
				}
				else if(this._cachedLASSound === 3)
				{
					tmplt.list2Ctrl.dataList.items[5] = this._LASSoundHelper.items[2];
					
				}
				
				if(LASVolumeChange != null && LASVolumeChange != undefined)
				{
					tmplt.list2Ctrl.dataList.items[5].value = LASVolumeChange;
					log.info("this._cachedLASVolume :: "+LASVolumeChange);
				}
				
				if (this._cachedLASAlert != null && this._cachedLASAlert != undefined) 
				{ 
					tmplt.list2Ctrl.dataList.items[3].value = this._cachedLASAlert; 
					log.info("Alert checked"+this._cachedLASAlert)
				}
				if (this._cachedIntervention != null && this._cachedIntervention != undefined) 
				{ 
					tmplt.list2Ctrl.dataList.items[0].value = this._cachedIntervention; 
				}
				if (this._cachedLASTiming != null && this._cachedLASTiming != undefined) 
				{ 
					tmplt.list2Ctrl.dataList.items[1].value = this._cachedLASTiming; 
				}
				if (this._cachedLASWarning != null && this._cachedLASWarning != undefined) 
				{ 
					tmplt.list2Ctrl.dataList.items[2].value = this._cachedLASWarning;
				}
				if (this._cachedLAS_SoundVolume != null && this._cachedLAS_SoundVolume != undefined) 
				{ 
					tmplt.list2Ctrl.dataList.items[4].value = this._cachedLAS_SoundVolume;
					tmplt.list2Ctrl.dataList.items[4].hasCaret = true;
				}
				
				//If Intervention ON and Alert OFF disabled the AlertType and Volume. Intervention is ON here so just check for Alert
				if(this._cachedLASAlert === 2)
				{
					tmplt.list2Ctrl.dataList.items[4].disabled = true;
					tmplt.list2Ctrl.dataList.items[4].hasCaret = false;
					tmplt.list2Ctrl.dataList.items[4].label1Id = null;
					tmplt.list2Ctrl.dataList.items[4].label1 = " ";
					tmplt.list2Ctrl.dataList.items[5].disabled = true;
					tmplt.list2Ctrl.dataList.items[5].itemStyle = "style01";
				}
				else
				{
					tmplt.list2Ctrl.dataList.items[4].disabled = false;
					tmplt.list2Ctrl.dataList.items[4].hasCaret = true;
					tmplt.list2Ctrl.dataList.items[4].label1 = null;
					tmplt.list2Ctrl.dataList.items[5].disabled = false;
					if(this._cachedLASSound === 3)
					{
						tmplt.list2Ctrl.dataList.items[5].itemStyle = "style11";
					}
					else
					{
						tmplt.list2Ctrl.dataList.items[5].itemStyle = "style10";

					}
				}

				tmplt.list2Ctrl.dataList.items[this._indexWarning].text1Id = "Sensitivity";
				tmplt.list2Ctrl.dataList.items[this._indexTiming].text1Id = "InterventionTiming";

				this._currentContextTemplate.list2Ctrl.updateItems(0,tmplt.list2Ctrl.dataList.itemCount - 1);
            }
            else if (this.cachedLaneAssistSystem === 1 && this._cachedIntervention === 2)
            {
				var LASVolumeChange = 1; //default is set to High                   
			    this._currentContextTemplate.list2Ctrl.setDataList(this._InterventiondisabledCtxtDataList);
			    if (framework.localize.getRegion() === "Region_NorthAmerica")
				{
					tmplt.list2Ctrl.dataList.items[1] = this._LASCtxtDataListHelper.items[1];
					tmplt.list2Ctrl.dataList.items[2] = this._LASCtxtDataListHelper.items[3];
					this._indexSound = 4;
					this._indexWarning = 2;
					this._indexTiming = 1;
					tmplt.list2Ctrl.dataList.items[this._indexWarning].button1Id = "Often_Int_OFF";
					tmplt.list2Ctrl.dataList.items[this._indexWarning].button2Id = "Rare_Int_OFF";
				}
				else
				{
					tmplt.list2Ctrl.dataList.items[1] = this._LASCtxtDataListHelper.items[0];
					tmplt.list2Ctrl.dataList.items[2] = this._LASCtxtDataListHelper.items[2];
					this._indexSound = 4;
					this._indexWarning = 2;
					this._indexTiming = 1;
					tmplt.list2Ctrl.dataList.items[this._indexWarning].button1Id = "Often_Int_OFF";
					tmplt.list2Ctrl.dataList.items[this._indexWarning].button2Id = "Medium_Int_OFF";
					tmplt.list2Ctrl.dataList.items[this._indexWarning].button3Id = "Rare_Int_OFF";
				}
				if (this._cachedLDWS_BuzzerVolume != null && this._cachedLDWS_BuzzerSetting !== 3)
                { 
					
					switch(this._cachedLDWS_BuzzerVolume)
					{
						case 1 : 
							LASVolumeChange = 1; //High
							this._cachedLAS_SoundVibrationVolume = LASVolumeChange;
							break;
						case 2 : 
							LASVolumeChange = 1; //High
							this._cachedLAS_SounBeepVolume = LASVolumeChange;
							break;
						case 3 : 
							LASVolumeChange = 2; //Low
							this._cachedLAS_SoundRumbleVolume = LASVolumeChange;
							break;
						default:
							break;
					}
					log.info("Set Beep/Vib :: "+LASVolumeChange);
                }
				else if(this._cachedLDWS_BuzzerVolume != null)
				{
					
					log.info("Set Rumble :: "+this._cachedLDWS_BuzzerVolume);
					LASVolumeChange = this._cachedLDWS_BuzzerVolume; //High
				}
					
                        if(this._cachedLASSound === 1)
                        {
                            tmplt.list2Ctrl.dataList.items[4] = this._LASSoundHelper.items[0];
							tmplt.list2Ctrl.dataList.items[4].itemStyle = "style10";
							
							tmplt.list2Ctrl.dataList.items[4].hasCaret = false;
						}
                        else if(this._cachedLASSound === 2)
                        {
                            tmplt.list2Ctrl.dataList.items[4] = this._LASSoundHelper.items[1];
							tmplt.list2Ctrl.dataList.items[4].itemStyle = "style10";
							
							tmplt.list2Ctrl.dataList.items[4].hasCaret = false;
						}
                        else if(this._cachedLASSound === 3)
                        {
                            tmplt.list2Ctrl.dataList.items[4] = this._LASSoundHelper.items[2];
							tmplt.list2Ctrl.dataList.items[4].itemStyle = "style11";
							
							tmplt.list2Ctrl.dataList.items[4].hasCaret = false;
						}
						
						if(LASVolumeChange != null && LASVolumeChange != undefined)
						{
							tmplt.list2Ctrl.dataList.items[4].value = LASVolumeChange;
							log.info("this._cachedLASVolume :: "+LASVolumeChange);
						}
						
						
                        if (this._cachedLASAlert != null && this._cachedLASAlert != undefined) 
                        { 
                            tmplt.list2Ctrl.dataList.items[1].value = this._cachedLASAlert; 
                        }
                        if (this._cachedIntervention != null && this._cachedIntervention != undefined) 
                        { 
                            tmplt.list2Ctrl.dataList.items[0].value = this._cachedIntervention; 
                        }
                        if (this._cachedLASTiming != null && this._cachedLASTiming != undefined) 
                        { 
                            tmplt.list2Ctrl.dataList.items[1].value = this._cachedLASTiming; 
                        }
                        if (this._cachedLASWarning != null && this._cachedLASWarning != undefined) 
                        { 
                            tmplt.list2Ctrl.dataList.items[2].value = this._cachedLASWarning; 
                        }
						tmplt.list2Ctrl.dataList.items[4].disabled = false;
						tmplt.list2Ctrl.dataList.items[5].disabled = false;
						
						tmplt.list2Ctrl.dataList.items[this._indexWarning].text1Id = "Sensitivity_Intervention_OFF";
						tmplt.list2Ctrl.dataList.items[this._indexTiming].text1Id = "AlertTiming";
                        
						this._currentContextTemplate.list2Ctrl.updateItems(0,tmplt.list2Ctrl.dataList.itemCount - 1);
            }
            
            for (var i = 0; i < tmplt.list2Ctrl.dataList.itemCount; i++) 
            {
                if (tmplt.list2Ctrl.dataList.items[i].appData === "SetLDWSTiming")
                {
                    if (this._cachedLDWSTiming != null)
                    {
                        //if (framework.localize.getRegion() === "Region_NorthAmerica")
                        {
                            switch(this._cachedLDWSTiming)
                            {
                                case 3:
                                    this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexTiming,1);
                                    this._latestValueLDWSNATiming = 1;
                                    break;
                                case 2:
                                    this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexTiming,2);
                                    this._latestValueLDWSNATiming = 2;
                                    break;
                                default:
                                    log.debug("Invalid LDWS Timing Value : " + this._cachedLDWSTiming);
                                    break;
                            }
                        }
                    }
                }
                else if (tmplt.list2Ctrl.dataList.items[i].appData === "GoLASTiming")
                {
                    if (this._cachedLASTiming != null)
                    {
                        switch (this._cachedLASTiming)
                        { 
                            case 1:
								if(this._cachedIntervention === 1)
								{
									tmplt.list2Ctrl.dataList.items[i].label1Id = "LASEarly";  
								}
								else
								{
									tmplt.list2Ctrl.dataList.items[i].label1Id = "Adaptive";  
								}
                                break;
                            case 2:
                                tmplt.list2Ctrl.dataList.items[i].label1Id = "LASEarly"; 
                                break; 
                            case 3:
								if(this._cachedIntervention === 1)
								{
									tmplt.list2Ctrl.dataList.items[i].label1Id = "LASLate";  
								}
								else
								{
									tmplt.list2Ctrl.dataList.items[i].label1Id = "Med";  
								}								
                                break;  
                            case 4:
                                tmplt.list2Ctrl.dataList.items[i].label1Id = "LASLate";  
                                break;
                            default:
                                break;
                        }   
                        this._currentContextTemplate.list2Ctrl.setTick(this._cachedLASTiming -1, true);                        
                    }                           
                }
                else if (tmplt.list2Ctrl.dataList.items[i].appData === "GoLASSound")
                {
                    if (this._cachedLASSound != null && (!(this._cachedIntervention === 1 && this._cachedLASAlert === 2 )))
                    {
                        switch (this._cachedLASSound)
                        { 
                            case 1:
                                tmplt.list2Ctrl.dataList.items[i].label1Id = "Vibration";  
                                break;
                            case 2:
                                tmplt.list2Ctrl.dataList.items[i].label1Id = "Beep"; 
                                break; 
                            case 3:
                                tmplt.list2Ctrl.dataList.items[i].label1Id = "RumbleStrips";   
                                break;  
                            default:
                                break;
                        }       
						tmplt.list2Ctrl.dataList.items[i].hasCaret = true;
                    }
                }               
            }
            if (this._cachedLASWarning != null)
            {
                if (framework.localize.getRegion() === "Region_NorthAmerica")
                {
                    switch(this._cachedLASWarning)
                    {
                        case 1:
                            this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexWarning,1);
                            this._latestValueLASWarning = 1;
                            break;
                        case 4:
                            this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexWarning,2);
                            this._latestValueLASWarning = 2;
                            break;
                        default:
                            log.debug("Invalid LDWS Warning Value : " + this._cachedLASWarning);
                            break;
                    }
                }
                else
                {
                    switch(this._cachedLASWarning)
                    {
                        case 1:
                            this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexWarning,1);
                            break;
                        case 3:
                            this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexWarning,2);
                            break;
                        case 4:
                            this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexWarning,3);
                            break;
                        default:
                            log.debug("Invalid LDWS Warning Value : " + this._cachedLASWarning);
                            break;
                    }
                }
            }
            this._currentContextTemplate.list2Ctrl.updateItems(0,tmplt.list2Ctrl.dataList.itemCount - 1);
            break;
        case "LDWS":
            this._latestValueBuzzerSetting = this._cachedLDWS_BuzzerSetting;
            this._latestValueLDWSTiming = this._cachedLDWSTiming;
            this._latestValueLDWSBuzzerVolume = this._cachedLDWS_BuzzerVolume;
            this._latestValueLDWSRumbleVolume = this._cachedLDWS_RumbleStripsVolume;
			this._indexSound = 2;
			this._indexWarning = 1;
			this._indexTiming = 0;
			if (this._cachedLDWSSound_Installed === 0)
            {
                this._currentContextTemplate.list2Ctrl.setDataList(this._LDWSCtxtDataListNotInstalled);
                this._currentContextTemplate.list2Ctrl.updateItems(0,tmplt.list2Ctrl.dataList.itemCount - 1); 
				
				if (framework.localize.getRegion() === "Region_NorthAmerica"){
				tmplt.list2Ctrl.dataList.items[0] =  this._LDWSCtxtDataListHelper.items[1];
				tmplt.list2Ctrl.dataList.items[1] =  this._LDWSCtxtDataListHelper.items[3];
				}
				else{
				tmplt.list2Ctrl.dataList.items[0] =  this._LDWSCtxtDataListHelper.items[0];
				tmplt.list2Ctrl.dataList.items[1] =  this._LDWSCtxtDataListHelper.items[2];
				}
            }
            else if (this._cachedLDWSSound_Installed === 1)
            {
                this._currentContextTemplate.list2Ctrl.setDataList(this._LDWSCtxtDataList);
                this._currentContextTemplate.list2Ctrl.updateItems(0,tmplt.list2Ctrl.dataList.itemCount - 1); 
            }
            if (this._cachedLDWS_BuzzerSetting != null)
            { 
                //tmplt.list2Ctrl.dataList.items[2].value = this._cachedLDWS_BuzzerSetting;       
                if (this._cachedLDWS_BuzzerSetting === 1)
                {
                    if(this._cachedLDWSSound_Installed === 1)
                    {
                        tmplt.list2Ctrl.dataList.items[3] = this._LDWSCtxtDataListHelper.items[4];
                    }
                    else if(this._cachedLDWSSound_Installed === 0)
                    {
                        tmplt.list2Ctrl.dataList.items[2] = this._LDWSCtxtDataListHelper.items[4];
                    }
                }
                else if (this._cachedLDWS_BuzzerSetting === 2)
                {
                    if(this._cachedLDWSSound_Installed === 1)
                    {
                        tmplt.list2Ctrl.dataList.items[3] = this._LDWSCtxtDataListHelper.items[5];
                    }
                    else if(this._cachedLDWSSound_Installed === 0)
                    {
                        tmplt.list2Ctrl.dataList.items[2] = this._LDWSCtxtDataListHelper.items[4];
                    }
                } 
            }
           
            if ((this._delayStatus === "disabled") || (this._CANStatus === false) || (this._cachedvoltageStatus === 0))
            {
                for(var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = true;
                }
            }
            else if ((this._delayStatus === "enabled") && (this._CANStatus === true) && (this._cachedvoltageStatus === 1))
            {//if both of the status are enable, enable all the settings
                for (var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = false;
                }
            }

            if (tmplt.list2Ctrl.dataList.itemCount) 
            { 
                this._currentContextTemplate.list2Ctrl.setDataList(tmplt.list2Ctrl.dataList);
                tmplt.list2Ctrl.updateItems(0,tmplt.list2Ctrl.dataList.itemCount - 1); 
            }
            
            for (var i = 0; i < tmplt.list2Ctrl.dataList.itemCount; i++) 
            {
                if (tmplt.list2Ctrl.dataList.items[i].appData === "SetLDWSTiming")
                {
                    if (this._cachedLDWSTiming != null)
                    {
                        //if (framework.localize.getRegion() === "Region_NorthAmerica")
                        {
                            switch(this._cachedLDWSTiming)
                            {
                                case 3:
                                    this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexTiming,1);
                                    this._latestValueLDWSNATiming = 1;
                                    break;
                                case 2:
                                    this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexTiming,2);
                                    this._latestValueLDWSNATiming = 2;
                                    break;
                                default:
                                    log.debug("Invalid LDWS Timing Value : " + this._cachedLDWSTiming);
                                    break;
                            }
                        }
                    }
                }
                else if (tmplt.list2Ctrl.dataList.items[i].appData === "GoLDWSTiming")
                {
                    if (this._cachedLDWSTiming != null)
                    {
                        switch (this._cachedLDWSTiming)
                        { 
                            case 1:
                                tmplt.list2Ctrl.dataList.items[i].label1Id = "Adaptive";  
                                break;
                            case 2:
                                tmplt.list2Ctrl.dataList.items[i].label1Id = "Early"; 
                                break; 
                            case 3:
                                tmplt.list2Ctrl.dataList.items[i].label1Id = "Medium";   
                                break;  
                            case 4:
                                tmplt.list2Ctrl.dataList.items[i].label1Id = "Late";  
                                break;
                            default:
                                break;
                        }   
                        this._currentContextTemplate.list2Ctrl.setTick(this._cachedLDWSTiming -1, true);                        
                    }                           
                } 
            }
            if (this._cachedLDWSWarning != null)
            {
                if (framework.localize.getRegion() === "Region_NorthAmerica")
                {
                    switch(this._cachedLDWSWarning)
                    {
                        case 1:
                            this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexWarning,1);
                            this._latestValueLDWSWarning = 1;
                            break;
                        case 4:
                            this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexWarning,2);
                            this._latestValueLDWSWarning = 2;
                            break;
                        default:
                            log.debug("Invalid LDWS Warning Value : " + this._cachedLDWSWarning);
                            break;
                    }
                }
                else
                {
                    switch(this._cachedLDWSWarning)
                    {
                        case 1:
                            this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexWarning,1);
                            break;
                        case 3:
                            this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexWarning,2);
                            break;
                        case 4:
                            this._currentContextTemplate.list2Ctrl.setToggleValue(this._indexWarning,3);
                            break;
                        default:
                            log.debug("Invalid LDWS Warning Value : " + this._cachedLDWSWarning);
                            break;
                    }
                }
            }
            // Handle Buzzer setting first, as it determines the list used
            if(this._cachedLDWSSound_Installed === 1)
            {            
                if (this._cachedLDWS_SensitivityForWideRange != null)
                {
                    switch (this._cachedLDWS_SensitivityForWideRange)
                    { 
                        case 1:
                            tmplt.list2Ctrl.dataList.items[2].button1Id = "Beep";  
                            break;
                        case 2:
                            tmplt.list2Ctrl.dataList.items[2].button1Id = "RumbleStrips"; 
                            break; 
                        default:
                            break;
                     } 
                }
            }
            else
            {
            /*do nothing*/
            }
            if (this._cachedLDWS_BuzzerVolume != null && this._cachedLDWS_BuzzerSetting === 1)
            {
                if(this._cachedLDWSSound_Installed === 1)
                {   
					if(this._cachedLDWS_BuzzerVolume === 1 || this._cachedLDWS_BuzzerVolume === 2)
					{
						this._currentContextTemplate.list2Ctrl.setToggleValue(3,1);
					}
					else
					{
						this._currentContextTemplate.list2Ctrl.setToggleValue(3,2);
					}
                }
                else if (this._cachedLDWSSound_Installed === 0)
                {
                    this._currentContextTemplate.list2Ctrl.setToggleValue(2,this._cachedLDWS_BuzzerVolume);
                }
            }
            // Set RumbleStrips value
            if (this._cachedLDWS_RumbleStripsVolume != null && this._cachedLDWS_BuzzerSetting === 2)
            {
                if(this._cachedLDWSSound_Installed === 1)
                {
                    this._currentContextTemplate.list2Ctrl.setToggleValue(3,this._cachedLDWS_RumbleStripsVolume);
                }
                else if (this._cachedLDWSSound_Installed === 0)
                {
                    /*do nothing*///this._currentContextTemplate.list2Ctrl.setToggleValue(2,this._cachedLDWS_RumbleStripsVolume);
                }
            }
            tmplt.list2Ctrl.updateItems(0,tmplt.list2Ctrl.dataList.itemCount - 1);
            break;
        case "VehicleSettingsTab":

            if (this._cachedHeadlight_HighBeamControll != null)
            {
                tmplt.list2Ctrl.dataList.items[0].value = this._cachedHeadlight_HighBeamControll; 
            }
            if (this._cachedHeadlight_HBCSensitivity)
            {
                tmplt.list2Ctrl.dataList.items[1].value = this._cachedHeadlight_HBCSensitivity; 
            }
            break;
        case "CHLT" :
            if (this._cachedCHLT != null)
            {
                switch (this._cachedCHLT)
				{
					case "CHL_120_SEC":
						tmplt.list2Ctrl.setTick(0, true);
						break;
					case "CHL_90_SEC":
						tmplt.list2Ctrl.setTick(1, true);
						break; 
					case "CHL_60_SEC":
						tmplt.list2Ctrl.setTick(2, true);
						break; 
					case "CHL_30_SEC":
						tmplt.list2Ctrl.setTick(3, true);
						break; 
					case "CHL_OFF":
						tmplt.list2Ctrl.setTick(4, true);
						break; 
					default:
                    break;
				}
				
				
				
            }
            break;
        case "LASSound" :
            if (this._cachedLAS_BuzzerSetting != null)
            {
                tmplt.list2Ctrl.setTick(this._cachedLAS_BuzzerSetting-1, true);
            }
            break; 
        case "LASTiming" :
			if (this._cachedLASTiming != null)
            {
				var tempLASTiming = this._cachedLASTiming;
				if(this._cachedIntervention === 1)
				{
					if(tempLASTiming % 2 !== 0)
					{
						tempLASTiming = tempLASTiming + 1;
					}
					tempLASTiming = tempLASTiming / 2;
				}
				this._currentContextTemplate.list2Ctrl.setTick(tempLASTiming -1, true);
            }
            break;
		default :
			break;
    } 
}
vehsettingsApp.prototype._populateDialogCtrl = function(tmplt)
{
    var disableSpeedRestricted = framework.common.getAtSpeedValue();
    switch(this._currentContext.ctxtId)
    {
        case "HUDReset" :
        case "HUDResetError" :   
            if (this._cachedvoltageStatus === 1)
            {
                tmplt.dialog3Ctrl.setDisabled("button1",false);
                tmplt.dialog3Ctrl.setDisabled("button2",false);
            }
            if (this._cachedvoltageStatus === 0)
            {
                tmplt.dialog3Ctrl.setDisabled("button1",false);
                tmplt.dialog3Ctrl.setDisabled("button2",true);
            }
            break;
        case "DRSSReset" : 
            break;
        case "DRSSResetError" : 
            break;
        case "SBSReset" : 
            break;
        case "SBSResetError" : 
            break;
        case "SBS_SCBSReset" : 
            break;
        case "SBS_SCBSResetError" : 
            break;
        case "FOWResetError" : 
            break;
        case "FOWReset" : 
            break;
        case "LDWSReset" : 
            break;
        case "LDWSResetError" : 
            break;
        case "LASReset" : 
        break;
        case "LASResetError" : 
        break;
        case "DoorLockReset" :
        case "DoorLockResetError" : 
        case "TurnReset" : 
        case "TurnResetError" : 
        case "LightingReset" : 
        case "LightingResetError" : 
           if (this._cachedvoltageStatus === 1)
           {
               tmplt.dialog3Ctrl.setDisabled("button1",false);
               tmplt.dialog3Ctrl.setDisabled("button2",this.cachedSpeed);
           }
           if (this._cachedvoltageStatus === 0)
           {
               tmplt.dialog3Ctrl.setDisabled("button1",false);
               tmplt.dialog3Ctrl.setDisabled("button2",true);
           }
           break;
    }  
}
/**************************
 * App Functions *
 **************************/
/*
 * Callback from List2Ctrl when a tab button is clicked.
 */
vehsettingsApp.prototype._tabClickCallback = function(btnRef, appData, params)
{ 
    log.debug(" _tabClickCallback  called...", appData); 
    framework.sendEventToMmui("Common", "Global.IntentSettingsTab", { payload : { settingsTab : appData} } );    
}

// Click callback for the dialog
vehsettingsApp.prototype._dialogDefaultSelectCallback = function(dialogBtnCtrlObj, appData, params)
{
    log.debug("_dialogDefaultSelectCallback  called...", dialogBtnCtrlObj.properties.label, appData);
    
    switch(this._currentContext.ctxtId)
    {
        case 'DisplaySettingsReset':
        case "DRSSReset" :  
        case "DRSSResetError" :  
        case "SBSReset" :   
        case "SBSResetError" :  
        case "SBS_SCBSReset" :  
        case "SBS_SCBSResetError" :   
        case "FOWReset" :  
        case "FOWResetError" :
        case "LDWSReset" :
        case "LDWSResetError" :  
        case "LightingReset" :  
        case "LightingResetError" :  
        case "DoorLockReset" :  
        case "DoorLockResetError" : 
        case "TurnReset" :  
        case "TurnResetError" :  
        case "HUDReset" :  
        case "HUDResetError" :
        case "LASReset" :
        case "LASResetError" :      
            switch(appData)
            {
                case 'yes':
                    framework.sendEventToMmui("common", "Global.Yes"); 
                    break;
                case 'no': 
                    framework.sendEventToMmui("common", "Global.No"); 
                    break;
                default:
                    break;
            } 
            break;  
        default:
            break; 
    }
}


/*
 * Select callback for the list menus
 * @param   listCtrlObj (Object) Reference to the list control that was clicked
 * @param   appData (Object) Item data that was passed into the list control when it was was populated
 * @param   params  (Object) Object that contains additional data about the list item that was clicked
 */
vehsettingsApp.prototype._menuItemSelectCallback = function(listCtrlObj, appData, params)
{
    log.debug("_menuItemSelectCallback called for context " + this._currentContext.ctxtId);

    switch(appData)
    {  
        //HUD TAB   
        case 'SetHudHeight' :  
        case 'SetHudBrightnessCalibration':
        case 'GoLASSound': 
            framework.sendEventToMmui(this.uiaId, "GoLASSound");
            break;
        case 'GoLASReset': 
            framework.sendEventToMmui(this.uiaId, "GoLASReset");
            break;          
        case 'SetHudBrightness': 
            //slider, pass
            break;  
        case 'SetHudBrightnessControl' :
            if (!params.additionalData)
            {
                log.info("_menuItemSelectCallback called with params.additionalData as null for AppData : "+ appData);
                break;
            }
            if (params.additionalData != this._latestValueHudBrightnessControl)
            {
                this._latestValueHudBrightnessControl = params.additionalData;
                framework.sendEventToMmui(this.uiaId, "SetHudBrightnessControl",  { payload : { evData : params.additionalData} } ); 
            }
            this._cachedHudAutoIntensityOnOff = params.additionalData;  
            if (this._cachedHudAutoIntensityOnOff == 1)
            {
                this._currentContextTemplate.list2Ctrl.dataList.items[2] = this._HUDTabCtxtDataListBrightnessControlOff.items[1];
                if(this._cachedHudCalibration !=null && this._cachedHudCalibration != undefined)
                {
                    this._currentContextTemplate.list2Ctrl.dataList.items[2].value = this._cachedHudCalibration;
                }
            }
            else if(this._cachedHudAutoIntensityOnOff == 2)
            {
                this._currentContextTemplate.list2Ctrl.dataList.items[2] = this._HUDTabCtxtDataListBrightnessControlOff.items[0];
                if (this._cachedHudIntensity !=null && this._cachedHudIntensity !=undefined)
                {
                    this._currentContextTemplate.list2Ctrl.dataList.items[2].value = this._cachedHudIntensity;
                }
            } 
            if (this._cachedHudIntensity !=null && this._cachedHudIntensity !=undefined)
            {
                //this._currentContextTemplate.list2Ctrl.dataList.items[2].value = this._cachedHudIntensity;
            }
            this._currentContextTemplate.list2Ctrl.updateItems(2,2);   
            break; 

        case 'SetHudNavigation':
            if (!params.additionalData)
            {
                log.info("_menuItemSelectCallback called with params.additionalData as null for AppData : "+ appData);
                break;
            }
            if (params.additionalData != this._latestValueHudNavigation)
            {    
                this._latestValueHudNavigation = params.additionalData;
                framework.sendEventToMmui(this.uiaId, "SetHudNavigation", { payload : { evData : params.additionalData} } );  
            }
            this._cachedHudTurnByTurn = params.additionalData;  
            break;
        case "SetHudOpenClose":
            if (!params.additionalData)
            {
                log.info("_menuItemSelectCallback called with params.additionalData as null for AppData : "+ appData);
                break;
            }
            if (params.additionalData != this._latestValueHudOpenClose)
            {    
                this._latestValueHudOpenClose = params.additionalData;
                framework.sendEventToMmui(this.uiaId, "SetHudOpenClose", { payload : { evData : params.additionalData} } );  
            }
            this._cachedHudOnOffStatus = params.additionalData;   
            if (this._cachedHudOnOffStatus === 1 && this._cachedHudControlAllowed === 1)
            {
                this._currentContextTemplate.list2Ctrl.dataList.items[0].disabled = false;
                this._currentContextTemplate.list2Ctrl.dataList.items[1].disabled = false;
                this._currentContextTemplate.list2Ctrl.dataList.items[2].disabled = false;
                this._currentContextTemplate.list2Ctrl.dataList.items[3].disabled = false;     
                this._currentContextTemplate.list2Ctrl.dataList.items[5].disabled = false;
            }
            if (this._cachedHudOnOffStatus === 2)
            {
                this._currentContextTemplate.list2Ctrl.dataList.items[0].disabled = true;
                this._currentContextTemplate.list2Ctrl.dataList.items[1].disabled = true;
                this._currentContextTemplate.list2Ctrl.dataList.items[2].disabled = true;
                this._currentContextTemplate.list2Ctrl.dataList.items[3].disabled = true;    
                this._currentContextTemplate.list2Ctrl.dataList.items[5].disabled = true;
            } 
            this._currentContextTemplate.list2Ctrl.updateItems(0,5); 
            break;  
        //SAFETY
        
        case 'SetDA':
            if (!params.additionalData)
            {
                log.info("_menuItemSelectCallback called with params.additionalData as null for AppData : "+ appData);
                break;
            }
            if (params.additionalData != this._latestValueDA)
            {    
                switch(params.additionalData)
				{
					case 1:
						this._latestValueDA = "DA_On";
						break;
					case 2:
						this._latestValueDA = "DA_Off";
						break;
				}
                framework.sendEventToMmui(this.uiaId, "SetDA", { payload : { evData :this._latestValueDA } } );  
            }
            this._cachedDA = this._latestValueDA;  
            break;
        case 'SetParkingSensor':
            if (!params.additionalData)
            {
                log.info("_menuItemSelectCallback called with params.additionalData as null for AppData : "+ appData);
                break;
            }
            if (params.additionalData != this._latestValuePSI)
            {    
                this._latestValuePSI = params.additionalData;
				var parkingValue = null; // default set as Off
				switch(this._latestValuePSI)
				{
					case 1:
						parkingValue = "On";
						break;
					case 2:
						parkingValue = "Off";
						break;
					default :
						parkingValue = "Off";
				}
					
                framework.sendEventToMmui(this.uiaId, "SetParkingSensor", { payload : { parkingSensorSetting : parkingValue} } );  
            }
            this._cachedPSI = parkingValue;  
            break;
        case 'SetLASIntervention':
            if (!params.additionalData)
            {
                log.info("_menuItemSelectCallback called with params.additionalData as null for AppData : "+ appData);
                break;
            }
            if (params.additionalData != this._latestValueLASIntervention)
            {    
                this._latestValueLASIntervention = params.additionalData;
                framework.sendEventToMmui(this.uiaId, "SetLASIntervention", { payload : { evData : params.additionalData} } );  
            }
            //this._latestValueLASIntervention = params.additionalData;
            //framework.sendEventToMmui(this.uiaId, "SetLASIntervention", { payload : { evData : params.additionalData} } );  
            this._cachedIntervention = params.additionalData;  
			this.populateListCtrl(this._currentContextTemplate);
            break;
        
        case 'SetLASAlert':
            if (!params.additionalData)
            {
                log.info("_menuItemSelectCallback called with params.additionalData as null for AppData : "+ appData);
                break;
            }
            if (params.additionalData != this._latestValueLASAlert)
            {    
                this._latestValueLASAlert = params.additionalData;
                framework.sendEventToMmui(this.uiaId, "SetLASAlert", { payload : { evData : params.additionalData} } );  
            }
            this._cachedLASAlert = params.additionalData; 
			this.populateListCtrl(this._currentContextTemplate);			
            break;
        
        case "SetSCBS":
            if (!params.additionalData)
            {
                log.info("_menuItemSelectCallback called with params.additionalData as null for AppData : "+ appData);
                break;
            }
			//Removed below checked because "this._latestValueSCBS" is not updated properly when GUI received GetSCBS from MMUI.
			//Failing one use case, when GUI will not send the SetSCBS but because of CAN onchange MMUI can send the GetSCBS.
            //if (params.additionalData != this._latestValueSCBS)
            {
                this._latestValueSCBS = params.additionalData; 
                framework.sendEventToMmui(this.uiaId, "SetSCBS", { payload : { evData : params.additionalData} } );   
            }   
            this._cachedSBS_CityBrakeSystem = params.additionalData;    
            break;  
        //DRSS
        case "SetDRSS":
            if (!params.additionalData)
            {
                log.info("_menuItemSelectCallback called with params.additionalData as null for AppData : "+ appData);
                break;
            }
            if (params.additionalData != this._latestValueDRSS)
            {
                this._latestValueDRSS = params.additionalData;
                framework.sendEventToMmui(this.uiaId, "SetDRSS", { payload : { evData : params.additionalData} } );   
            }
            this._cachedDRSS_DRSS = params.additionalData;    
            break; 
        case "SetDRSSDistance":
            if (!params.additionalData)
            {
                log.info("_menuItemSelectCallback called with params.additionalData as null for AppData : "+ appData);
                break;
            }
            if (params.additionalData != this._latestValueDRSSDistance)
            {
                this._latestValueDRSSDistance = params.additionalData;
                framework.sendEventToMmui(this.uiaId, "SetDRSSDistance", { payload : { evData : params.additionalData} } );   
            }  
            this._cachedDRSS_DRSSSensitivity = params.additionalData;    
            break;  
        //FOW
        case "SetFOW":
            if (!params.additionalData)
            {
                log.info("_menuItemSelectCallback called with params.additionalData as null for AppData : "+ appData);
                break;
            }
            if (params.additionalData != this._latestValueFOW)
            {    
                this._latestValueFOW = params.additionalData;
                framework.sendEventToMmui(this.uiaId, "SetFOW", { payload : { evData : params.additionalData} } );   
            }
            this._cachedFOW_Warning = params.additionalData;    
            break; 
        case "SetFOWDistance":
            if (!params.additionalData)
            {
                log.info("_menuItemSelectCallback called with params.additionalData as null for AppData : "+ appData);
                break;
            }
            if (params.additionalData != this._latestValueFOWDistance)
            {
                this._latestValueFOWDistance = params.additionalData;
                framework.sendEventToMmui(this.uiaId, "SetFOWDistance", { payload : { evData : params.additionalData} } );   
            }
            this._cachedFOW_Distance = params.additionalData;    
            break; 
        case "SetFOWBuzzerVolume":
            if (!params.additionalData)
            {
                log.info("_menuItemSelectCallback called with params.additionalData as null for AppData : "+ appData);
                break;
            }
            if (params.additionalData != this._latestValueFOWBuzzerVolume)
            {    
                this._latestValueFOWBuzzerVolume = params.additionalData;
                framework.sendEventToMmui(this.uiaId, "SetFOWBuzzerVolume", { payload : { evData : params.additionalData} } );   
            }
            this._cachedFOW_BuzzerVolume = params.additionalData;    
            break;  
        case "SetLDWMode":
            if (!params.additionalData)
            {
                log.info("_menuItemSelectCallback called with params.additionalData as null for AppData : "+ appData);
                break;
            }
            framework.sendEventToMmui(this.uiaId, "SetLDWMode", { payload : { ldwEnable : params.additionalData} } );   
            this._cachedLDWS_Mode = params.additionalData;    
            break; 
        case "SetLDWSBuzzerVolume":
            if (!params.additionalData)
            {
                log.info("_menuItemSelectCallback called with params.additionalData as null for AppData : "+ appData);
                break;
            }
			this._latestValueLDWSBuzzerVolume = params.additionalData;
			if(params.additionalData === 2)
			{
				this._latestValueLDWSBuzzerVolume = 3;
			}
			framework.sendEventToMmui(this.uiaId, "SetLDWSBuzzerVolume", { payload : { evData : this._latestValueLDWSBuzzerVolume} } );   
            this._cachedLDWS_BuzzerVolume = this._latestValueLDWSBuzzerVolume;   
            break; 
        case "SetLASSoundVol":
            if (!params.additionalData)
            {
                log.info("_menuItemSelectCallback called with params.additionalData as null for AppData : "+ appData);
                break;
            }
			this._latestValueLASVolume = params.additionalData;
			if(this._cachedLASSound)
			{
					
						if(this._cachedLASSound === 1)
						{
							if(params.additionalData === 2)
							{
								this._latestValueLASVolume = 3;
							}
							this._cachedLAS_SoundVibrationVolume = this._latestValueLASVolume;
						}
						else if(this._cachedLASSound === 2)
						{
							if(params.additionalData === 2)
							{
								this._latestValueLASVolume = 3;
							}
							this._cachedLAS_SoundBeepVolume = this._latestValueLASVolume;
						}
						else if(this._cachedLASSound === 3)
						{
							this._cachedLAS_SoundRumbleVolume = this._latestValueLASVolume;
						}
			}
			framework.sendEventToMmui(this.uiaId, "SetLASSoundVol", { payload : { evData : this._latestValueLASVolume} } );   
            this._cachedLAS_SoundVolume = this._latestValueLASVolume;
            break;
            
        case "SetLDWSRumbleVolume":
			if (!params.additionalData)
            {
                log.info("_menuItemSelectCallback called with params.additionalData as null for AppData : "+ appData);
                break;
            }
			this._latestValueLDWSRumbleVolume = params.additionalData;
			framework.sendEventToMmui(this.uiaId, "SetLDWSRumbleVolume", { payload : { evData : params.additionalData} } );   
            this._cachedLDWS_RumbleStripsVolume = params.additionalData;    
            break;  
        case "SetSBS":
            if (!params.additionalData)
            {
                log.info("_menuItemSelectCallback called with params.additionalData as null for AppData : "+ appData);
                break;
            }
            if (params.additionalData != this._latestValueSBS)
            {
                this._latestValueSBS = params.additionalData; 
                framework.sendEventToMmui(this.uiaId, "SetSBS", { payload : { evData : params.additionalData} } );   
            }
            this._cachedSBS_BrakeSupport = params.additionalData;    
            break; 
        case "SetSBCS":
            if (!params.additionalData)
            {
                log.info("_menuItemSelectCallback called with params.additionalData as null for AppData : "+ appData);
                break;
            }
            framework.sendEventToMmui(this.uiaId, "SetSBCS", { payload : { evData : params.additionalData} } );   
            this._cachedSBCSMode = params.additionalData;    
            break; 
        case "SetSBCSDistance":
            if (!params.additionalData)
            {
                log.info("_menuItemSelectCallback called with params.additionalData as null for AppData : "+ appData);
                break;
            }
            framework.sendEventToMmui(this.uiaId, "SetSBCSDistance", { payload : { evData : params.additionalData} } );   
            this._cachedSBCSWarningDistance = params.additionalData;    
            break; 
        case "SetSBCSBuzzerVolume":
            if (!params.additionalData)
            {
                log.info("_menuItemSelectCallback called with params.additionalData as null for AppData : "+ appData);
                break;
            }
            framework.sendEventToMmui(this.uiaId, "SetSBCSBuzzerVolume", { payload : { evData : params.additionalData} } );   
            this._cachedSBCSVolume = params.additionalData;    
            break;  
        //LDWS
        case "SetLDWSTiming":
            //For Other regions
            if (framework.localize.getRegion() != "Region_NorthAmerica")
            {
                log.info("this._latestValueLDWSTiming : "+this._latestValueLDWSTiming);
				log.info("params.itemIndex value +1 : "+(params.itemIndex+1));
				//if ((params.itemIndex + 1) != this._latestValueLDWSTiming)
                {    
                    this._latestValueLASTiming = params.itemIndex + 1;
                    this._latestValueLDWSTiming = params.itemIndex + 1;
					
					if(this._cachedIntervention === 1)
					{
						this._latestValueLASTiming = this._latestValueLASTiming * 2;
					}
					
                    framework.sendEventToMmui(this.uiaId, "SetLDWSTiming", { payload : { evData : this._latestValueLASTiming } } ); 
                }
                this._cachedLDWSTiming = this._latestValueLASTiming ;
            }
            //For NA region
            else
            {
                //if (params.additionalData != this._latestValueLDWSNATiming)
                {    
                    if (params.additionalData == 1)
                    {
                        this._latestValueLASNATiming = params.additionalData;
                        this._latestValueLDWSNATiming = params.additionalData;
                        params.additionalData = 3;
                        framework.sendEventToMmui(this.uiaId, "SetLDWSTiming", { payload : { evData : 3 } } );
                        this._cachedLDWSTiming = 3;
                        this._cachedLASTiming = 3;
                    }
                    else if(params.additionalData == 2)
                    {
                        this._latestValueLASNATiming = params.additionalData;
                        this._latestValueLDWSNATiming = params.additionalData;
                        framework.sendEventToMmui(this.uiaId, "SetLDWSTiming", { payload : { evData : 2 } } );
                        this._cachedLDWSTiming = 2;                    
                        this._cachedLASTiming = 2;
                    }
                }
            }
            break; 
        case "SetLDWSWarning":
            if (!params.additionalData)
            {
                log.info("_menuItemSelectCallback called with params.additionalData as null for AppData : "+ appData);
                break;
            }
            if (framework.localize.getRegion() == "Region_NorthAmerica") 
            {
                if (params.additionalData != this._latestValueLDWSWarning)
                {
                    if (params.additionalData == 1)
                    {
                        this._latestValueLASWarning = params.additionalData;
                        this._latestValueLDWSWarning = params.additionalData;
                        framework.sendEventToMmui(this.uiaId, "SetLDWSWarning", { payload : { evData : params.additionalData} } ); 
                    }
                    else if(params.additionalData == 2)
                    {
                        this._latestValueLASWarning = params.additionalData;
                        this._latestValueLDWSWarning = params.additionalData;
                        params.additionalData = 4;
                        framework.sendEventToMmui(this.uiaId, "SetLDWSWarning", { payload : { evData : params.additionalData} } );     
                    }
                }
             }
            else 
            {
                if (params.additionalData != this._latestValueLDWSWarning)
                {
                    
                    if (params.additionalData == 1)
                    {
                        this._latestValueLASWarning = params.additionalData;
                        this._latestValueLDWSWarning = params.additionalData;
                        framework.sendEventToMmui(this.uiaId, "SetLDWSWarning", { payload : { evData : params.additionalData} } ); 
                    }
                    if (params.additionalData == 2)
                    {
                        this._latestValueLASWarning = params.additionalData;
                        this._latestValueLDWSWarning = params.additionalData;
                        params.additionalData = 3;
                        framework.sendEventToMmui(this.uiaId, "SetLDWSWarning", { payload : { evData : params.additionalData  } } ); 
                    }
                    else if(params.additionalData == 3)
                    {
                        this._latestValueLASWarning = params.additionalData;
                        this._latestValueLDWSWarning = params.additionalData;
                        params.additionalData = 4;
                        framework.sendEventToMmui(this.uiaId, "SetLDWSWarning", { payload : { evData : params.additionalData  } } ); 
                    }
                 }
             }
            this._cachedLASWarning = params.additionalData ;
            this._cachedLDWSWarning = params.additionalData ;
            break; 
        case "SetBuzzerSetting":
            if (!params.additionalData)
            {
                log.info("_menuItemSelectCallback called with params.additionalData as null for AppData : "+ appData);
                break;
            }
            if (params.additionalData != this._latestValueBuzzerSetting)
            {    
                this._latestValueLASBuzzerSetting = params.additionalData;
                this._latestValueBuzzerSetting = params.additionalData;
				framework.sendEventToMmui(this.uiaId, "SetBuzzerSetting", { payload : { evData : params.additionalData  } } );
				if ( params.additionalData == 1 )
				{
					   if ( this._cachedLDWS_RumbleStripsVolume == 2)
						   {
							  this._cachedLDWS_BuzzerVolume=1;                                     
						   }                   
				}
            }
            this._cachedLAS_BuzzerSetting = params.additionalData ;
            this._cachedLDWS_BuzzerSetting = params.additionalData ;
            break; 
        case "SetSBSDistance":
            if (!params.additionalData)
            {
                log.info("_menuItemSelectCallback called with params.additionalData as null for AppData : "+ appData);
                break;
            }
            if (params.additionalData != this._latestValueSBSDistance)
            {
                this._latestValueSBSDistance = params.additionalData;
                framework.sendEventToMmui(this.uiaId, "SetSBSDistance", { payload : { evData : params.additionalData} } );   
            }
            this._cachedSBS_Distance = params.additionalData;    
            break; 
        case "SetSBSBuzzerVolume":
            if (!params.additionalData)
            {
                log.info("_menuItemSelectCallback called with params.additionalData as null for AppData : "+ appData);
                break;
            }
            if (params.additionalData != this._latestValueSBSBuzzerVolume)
            {    
                this._latestValueSBSBuzzerVolume = params.additionalData;
                framework.sendEventToMmui(this.uiaId, "SetSBSBuzzerVolume", { payload : { evData : params.additionalData} } );   
            }
            this._cachedSBS_BuzzerVolume = params.additionalData;    
            break;  
        case "SetWalkAwayLock":
            if (!params.additionalData)
            {
                log.info("_menuItemSelectCallback called with params.additionalData as null for AppData : "+ appData);
                break;
            }
            if (params.additionalData != this._latestValueWalkAwayLock)
            {
                this._latestValueWalkAwayLock = params.additionalData;
                framework.sendEventToMmui(this.uiaId, "SetWalkAwayLock", { payload : { evData : params.additionalData} } );   
            }   
            this._cachedKeyless_WalkAwayLock = params.additionalData;    
            break; 

        // VEHICLE SETTINGS TAB
        case "SetRainSensingWiper":
            if (!params.additionalData)
            {
                log.info("_menuItemSelectCallback called with params.additionalData as null for AppData : "+ appData);
                break;
            }
            if (params.additionalData != this._latestValueRainSensingWiper)
            {
                this._latestValueRainSensingWiper = params.additionalData;
                framework.sendEventToMmui(this.uiaId, "SetRainSensingWiper", { payload : { evData : params.additionalData} } );
            }
            this._cachedSafety_AutoWiper = params.additionalData;    
            break;    
        //TURN SETTINGS
        case "Set3FlashTurnSignal":
            if (!params.additionalData)
            {
                log.info("_menuItemSelectCallback called with params.additionalData as null for AppData : "+ appData);
                break;
            }
            if (params.additionalData != this._latestValue3FlashTurnSignal)
            {    
                this._latestValue3FlashTurnSignal = params.additionalData;
                framework.sendEventToMmui(this.uiaId, "Set3FlashTurnSignal", { payload : { evData : params.additionalData} } );   
            }
            this._cachedSafety_3flashTurnSignal = params.additionalData;    
            break; 
        case "SetTurnSignalIndicatorVolume":
            if (!params.additionalData)
            {
                log.info("_menuItemSelectCallback called with params.additionalData as null for AppData : "+ appData);
                break;
            }
            if (params.additionalData != this._latestValueTurnSignalIndicatorVolume)
            {    
                this._latestValueTurnSignalIndicatorVolume = params.additionalData;
                framework.sendEventToMmui(this.uiaId, "SetTurnSignalIndicatorVolume", { payload : { evData : params.additionalData} } );   
            }
            this._cachedSafety_TurnSignalIndicatorVolume = params.additionalData;    
            break;   
        case "SetHBC":
            if (!params.additionalData)
            {
                log.info("_menuItemSelectCallback called with params.additionalData as null for AppData : "+ appData);
                break;
            }
            if (params.additionalData != this._latestValueHBC)
            {    
                this._latestValueHBC = params.additionalData;
                framework.sendEventToMmui(this.uiaId, "SetHBC", { payload : { evData : params.additionalData} } );   
            }
            this._cachedHeadlight_HighBeamControll = params.additionalData;    
            break;  
        case "SetAFS":
            if (!params.additionalData)
            {
                log.info("_menuItemSelectCallback called with params.additionalData as null for AppData : "+ appData);
                break;
            }  
            this._latestValueAFS = params.additionalData;
            if(this._latestValueAFS == 1)
            {
                this._latestValueAFS = 2;
            }
            else
            {
                this._latestValueAFS = 1;
            }
            framework.sendEventToMmui(this.uiaId, "SetAFS", { payload : { evData : this._latestValueAFS} } );   
            this._cachedAFS = this._latestValueAFS;    
            break;      
        case "SetDaytimeRunningLights":
            if (!params.additionalData)
            {
                log.info("_menuItemSelectCallback called with params.additionalData as null for AppData : "+ appData);
                break;
            }
            if (params.additionalData != this._latestValueDaytimeRunningLights)
            {
                this._latestValueDaytimeRunningLights = params.additionalData;
                framework.sendEventToMmui(this.uiaId, "SetDaytimeRunningLights", { payload : { evData : params.additionalData} } );   
            }
            this._cachedHeadlight_DaytimeLights = params.additionalData;    
            break; 
        case "SetHeadlightOnWarning":
            if (!params.additionalData)
            {
                log.info("_menuItemSelectCallback called with params.additionalData as null for AppData : "+ appData);
                break;
            }
            if (params.additionalData != this._latestValueHeadLightOnWarning)
            {
                this._latestValueHeadLightOnWarning = params.additionalData;
                framework.sendEventToMmui(this.uiaId, "SetHeadlightOnWarning", { payload : { evData : params.additionalData} } );
            }
            this._cachedHeadlight_HeadlightOnWaring = params.additionalData;    
            break;
        case "SetRVMBuzzerVolume":
            if ((params.itemIndex + 1) != this._latestValueRVMBuzzerVolume)
            {    
                this._latestValueRVMBuzzerVolume = params.itemIndex + 1;
                framework.sendEventToMmui(this.uiaId, "SetRVMBuzzerVolume", { payload : { evData : params.itemIndex + 1} } ); 
            }
            this._cachedRVMBuzzerVolume = params.itemIndex + 1;
            break; 

        case "GoDRSSReset":
            framework.sendEventToMmui(this.uiaId, "GoDRSSReset");    
            break; 
        case 'GoHUDReset' :
            framework.sendEventToMmui(this.uiaId, "GoHUDReset");  
            break;  
        case "SelectDRSS":
            framework.sendEventToMmui(this.uiaId, "SelectDRSS");      
            break; 
        case "GoSBS":
            framework.sendEventToMmui(this.uiaId, "GoSBS");      
            break; 
        case "GoSBS_SCBS":
            framework.sendEventToMmui(this.uiaId, "GoSBS_SCBS");      
            break; 
        case "GoFOW":
            framework.sendEventToMmui(this.uiaId, "GoFOW");      
            break; 
        case "SelectRVMBuzzerVolume":
            framework.sendEventToMmui(this.uiaId, "SelectRVMBuzzerVolume");      
            break; 
        case "SelectBSMBuzzerVolume":
            framework.sendEventToMmui(this.uiaId, "SelectBSMBuzzerVolume");      
            break; 
        case "ResetFOWSettings":
            framework.sendEventToMmui(this.uiaId, "ResetFOWSettings");     
            break;  
        case "GoLAS":
            framework.sendEventToMmui(this.uiaId, "GoLAS");      
            break;
        //VEHICLE SETTINGS TAB
        case 'GoDoorLock':
            framework.sendEventToMmui(this.uiaId, "GoDoorLock");  
            break;  
        case 'GoTurnSettings':
            framework.sendEventToMmui(this.uiaId, "GoTurnSettings");  
            break;      
        case 'GoLighting':
            framework.sendEventToMmui(this.uiaId, "GoLighting");   
            break;  
        //LDWS
        case "GoLDWSTiming":
            framework.sendEventToMmui(this.uiaId, "GoLDWSTiming");   
            break;
        case "GoLASTiming":
            framework.sendEventToMmui(this.uiaId, "GoLASTiming");   
            break;          
        case 'GoLDWSReset':
            framework.sendEventToMmui(this.uiaId, "GoLDWSReset");   
            break;    
        case 'GoSBSReset':
            framework.sendEventToMmui(this.uiaId, "GoSBSReset");   
            break;  
        case 'GoSBS_SCBSReset':
            framework.sendEventToMmui(this.uiaId, "GoSBS_SCBSReset");   
            break;   
        case 'SelectLaneDepartureWarning':
            framework.sendEventToMmui(this.uiaId, "SelectLaneDepartureWarning");   
            break;    
        //LIGHTING 
        case "SelectInteriorLightTimeoutDoorOpen":
            framework.sendEventToMmui(this.uiaId, "SelectInteriorLightTimeoutDoorOpen");   
            break; 
        case "SelectInteriorLightTimeoutDoorClosed":
            framework.sendEventToMmui(this.uiaId, "SelectInteriorLightTimeoutDoorClosed");   
            break; 
        case "SelectHeadlightOffTimer":
            framework.sendEventToMmui(this.uiaId, "SelectHeadlightOffTimer");   
            break;  
        case 'GoAutoHeadlightOn':
            framework.sendEventToMmui(this.uiaId, "GoAutoHeadlightOn");   
            break; 
        case 'GoLightingReset':    
            framework.sendEventToMmui(this.uiaId, "GoLightingReset");   
            break;      
        //TURN
        case "GoTurnReset":
            framework.sendEventToMmui(this.uiaId, "GoTurnReset");   
            break;  
        //DOOR LOCK
        case 'GoDoorLockMode':
            framework.sendEventToMmui(this.uiaId, "GoDoorLockMode");   
            break; 
        case 'GoKeylessLockBeepVol':
            framework.sendEventToMmui(this.uiaId, "GoKeylessLockBeepVol");   
            break; 
        case 'GoDoorRelockTime':
            framework.sendEventToMmui(this.uiaId, "GoDoorRelockTime");   
            break; 
        case 'GoUnlockMode':
            framework.sendEventToMmui(this.uiaId, "GoUnlockMode");   
            break; 
        case 'GoDoorLockReset':
            framework.sendEventToMmui(this.uiaId, "GoDoorLockReset");   
            break;  
        case "SetUnlockMode":
            if ((params.itemIndex + 1) != this._latestValueUnlockMode)
            {    
                this._latestValueUnlockMode = params.itemIndex + 1;
                framework.sendEventToMmui(this.uiaId, "SetUnlockMode", { payload : { evData : params.itemIndex + 1 } } );  
            }
            this._cachedKeyless_UnlockMode = params.itemIndex + 1;
            break;        
        case "SetBSMBuzzerVolume":
            if ((params.itemIndex + 1) != this._latestValueBSMBuzzerVolume)
            {    
                this._latestValueBSMBuzzerVolume = params.itemIndex + 1;
                framework.sendEventToMmui(this.uiaId, "SetBSMBuzzerVolume", { payload : { evData : params.itemIndex + 1} } ); 
            }
            this._cachedBSMBuzzerVolume = params.itemIndex + 1;
            break;
        case "SetSensitivityForWideRange":
            framework.sendEventToMmui(this.uiaId, "SetSensitivityForWideRange", { payload : { evData : params.itemIndex + 1   } } ); 
            listCtrlObj.setRadio(params.itemIndex, true);
            this._cachedLDWS_SensitivityForWideRange = params.itemIndex + 1  ;
            break; 
        case "SetSensitivityForWarningDetect":
            framework.sendEventToMmui(this.uiaId, "SetSensitivityForWarningDetect", { payload : { evData : params.itemIndex + 1  } } ); 
            listCtrlObj.setRadio(params.itemIndex, true);
            this._cachedLDWS_SensitivityWarningCancelation = params.itemIndex + 1 ;
            break; 
        case "SetHeadlightOffTimer":
            if (params.itemIndex + 1 != this._latestValueHeadlightOffTimer)
            {    
                this._latestValueHeadlightOffTimer = params.itemIndex + 1;
                framework.sendEventToMmui(this.uiaId, "SetHeadlightOffTimer", { payload : { evData : params.itemIndex + 1  } } ); 
            }
            this._cachedHeadlight_HeadlightOffTimer = params.itemIndex + 1 ;
            break;
        case "SetCHLT" :
          
			switch(params.itemIndex)
			{
				case 0:
					this._latestValueCHLT="CHL_120_SEC";
					break;
				case 1:
					this._latestValueCHLT="CHL_90_SEC";
					break;
				case 2:
					this._latestValueCHLT="CHL_60_SEC";
					break;
				case 3:
					this._latestValueCHLT="CHL_30_SEC";
					break;
				case 4:
					this._latestValueCHLT="CHL_OFF";
					break;
			}
			 framework.sendEventToMmui(this.uiaId, "SetCHLT", { payload : { evData : this._latestValueCHLT  } } ); 
            break;
        case "GoCHLT" :
            framework.sendEventToMmui(this.uiaId, "GoCHLT");  
            break;
        case "SetLHL" :
            switch(params.additionalData)
			{
				case 1:
					this._latestValueLHL ="LHL_On";
					break;
				case 2:
					this._latestValueLHL ="LHL_Off";
					break;
			}
			framework.sendEventToMmui(this.uiaId, "SetLHL", { payload : { evData : this._latestValueLHL} } ); 
            break;
            case "SetAutoHeadlightSensitivity":
            if (params.itemIndex + 1 != this._latestValueAutoHeadlightSensitivity)
            {    
                this._latestValueAutoHeadlightSensitivity = params.itemIndex + 1;
                framework.sendEventToMmui(this.uiaId, "SetAutoHeadlightSensitivity", { payload : { evData : params.itemIndex + 1  } } ); 
            }
            this._cachedHeadlight_AutoHeadlightsSensitivity = params.itemIndex + 1 ;
            break; 
        case "SetBuzzerAnswerBackVolume":
            framework.sendEventToMmui(this.uiaId, "SetBuzzerAnswerBackVolume", { payload : { evData : params.itemIndex + 1  } } ); 
            this._cachedKeyless_ChimeVolume = params.itemIndex + 1 ;
            break;  
        case "SetInteriorLightTimeoutDoorOpen":
            if ((params.itemIndex + 1) != this._latestValueInteriorLightTimeoutDoorOpen)
            {    
                this._latestValueInteriorLightTimeoutDoorOpen = params.itemIndex + 1;
                framework.sendEventToMmui(this.uiaId, "SetInteriorLightTimeoutDoorOpen", { payload : { evData : params.itemIndex + 1  } } ); 
            }
            this._cachedSafety_InterioLightTimeoutDoorOpen = params.itemIndex + 1 ;
            break;
        case "SetInteriorLightTimeoutDoorClosed":
            if ((params.itemIndex + 1) != this._latestValueInteriorLightTimeoutDoorClosed)
            {    
                this._latestValueInteriorLightTimeoutDoorClosed = params.itemIndex + 1;
                framework.sendEventToMmui(this.uiaId, "SetInteriorLightTimeoutDoorClosed", { payload : { evData : params.itemIndex + 1  } } ); 
            }
            this._cachedSafety_InterioLightTimeoutDoorClosed = params.itemIndex + 1 ;
            break; 
        case "SetAutoDoorLockAT":
            if ((params.itemIndex + 1) != this._latestValueAutoDoorLockAT)
            {
                this._latestValueAutoDoorLockAT = params.itemIndex + 1;
                framework.sendEventToMmui(this.uiaId, "SetAutoDoorLockAT", { payload : { evData : params.itemIndex + 1  } } );
            }
            this._cachedGet_AutoDoorLockAT = params.itemIndex + 1 ;
            break;   
        case "SetAutoDoorLockAT6":
			switch(params.itemIndex)
			{
				case 0:
					this._latestValueAutoDoorLockAT6 = "AT6_Shift_OutOfPark_UnlockInPark";
					break;
				case 1:
					this._latestValueAutoDoorLockAT6 = "AT6_Shift_OutOfPark";
					break;
				case 2:
					this._latestValueAutoDoorLockAT6 = "AT6_Driving_Unlock_In_Park";
					break;
				case 3:
					this._latestValueAutoDoorLockAT6 = "AT6_DrivingUnlock_IGN_Off";
					break;
				case 4:
					this._latestValueAutoDoorLockAT6 = "AT6_Driving";
					break;
				case 5:
					this._latestValueAutoDoorLockAT6 = "AT6_Off";
					break;
			}
			framework.sendEventToMmui(this.uiaId, "SetAutoDoorLockAT6", { payload : { evData : this._latestValueAutoDoorLockAT6 } } );
            break;  
        case "SetAutoDoorLockMT":
            if ((params.itemIndex + 1) != this._latestValueAutoDoorLockMT)
            {
                this._latestValueAutoDoorLockMT = params.itemIndex + 1;
                framework.sendEventToMmui(this.uiaId, "SetAutoDoorLockMT", { payload : { evData : params.itemIndex + 1  } } ); 
            }
            this._cachedGet_AutoDoorLockMT = params.itemIndex + 1 ;
            break;
        case "SetKeylessLockBeepVol":
            if ((params.itemIndex + 1) != this._latestValueKeylessLockBeepVol)
            {    
                this._latestValueKeylessLockBeepVol = params.itemIndex + 1;
                framework.sendEventToMmui(this.uiaId, "SetKeylessLockBeepVol", { payload : { evData : params.itemIndex + 1  } } ); 
            }
            this._cachedSafety_AutoDoorLockChimeVolume = params.itemIndex + 1 ;
            break;
        case "SetAutoRelockTimer":
            if ((params.itemIndex + 1) != this._latestValueAutoRelockTimer)
            {    
                this._latestValueAutoRelockTimer = params.itemIndex + 1;
                framework.sendEventToMmui(this.uiaId, "SetAutoRelockTimer", { payload : { evData : params.itemIndex + 1  } } ); 
            }
            this._cachedSafety_AutoRelockTimer = params.itemIndex + 1 ;
            break;
        case "SetLASSound":
            framework.sendEventToMmui(this.uiaId, "SetLASSound", { payload : { evData : params.itemIndex + 1  } } );
            break;          
        default:  
            log.error("NO ACTION TAKEN FOR " + appData);
            break;
    }

}
vehsettingsApp.prototype._menuItemSlideCallback = function(listCtrlObj, appData, params)
{
    log.debug("_menuItemSlideCallback called for context " + this._currentContext.ctxtId);
    switch(appData)
    { 
        //HUD
        case 'SetHudHeight' :
            if (this._cachedHudTilt != params.value && params.value != null)
            {
                if (this._currentContextTemplate && params.value != this._latestValueHudHeight)
                {
                    this._latestValueHudHeight = params.value;
                    framework.sendEventToMmui(this.uiaId, "SetHudHeight",  { payload : { evData : params.value} } ); 
                }
                this._cachedHudTilt = params.value; 
            } 
            break;
        case 'SetHudBrightnessCalibration':
            if (this._cachedHudCalibration != params.value && params.value != null)
            {
                if (this._currentContextTemplate && params.value != this._latestValueHudBrightnessCalibration)
                {
                    this._latestValueHudBrightnessCalibration = params.value;
                    framework.sendEventToMmui(this.uiaId, "SetHudCalibration",  { payload : { evData : params.value} } );
                } 
                this._cachedHudCalibration = params.value; 
            } 
            break;
        case 'SetHudBrightness':
            if (this._cachedHudIntensity != params.value && params.value != null)
            {
                if (this._currentContextTemplate && params.value != this._latestValueHudBrightness)
                {
                    this._latestValueHudBrightness = params.value;
                    framework.sendEventToMmui(this.uiaId, "SetHudBrightness",  { payload : { evData : params.value} } ); 
                } 
                this._cachedHudIntensity = params.value;
            } 
            break;
        default:
            log.error("NO ACTION TAKEN FOR " + appData);
            break;
    }
}

//Ignition off message handler
vehsettingsApp.prototype._IgnitionStatus_MsgHandler = function(msg)
{
    if (msg && msg.params.payload)
    {
        this._ignitionStatus = msg.params.payload.evData;
        if (this._ignitionStatus === 0)
        {
            if (this.ignitionTimer != 0)
            {
                //clear if a timer is started
                clearTimeout(this.ignitionTimer);
            }
            framework.setSharedData(this.uiaId, "IgnitionStatus", false);
            
            this._delayStatus = "disabled";
        }
    }
    if (this._currentContext && this._currentContextTemplate)
    {
        var tmplt = this._currentContextTemplate;
        if (this._currentContext.ctxtId === "VehicleSettingsTab" || 
                this._currentContext.ctxtId === "SafetyTab" || 
                this._currentContext.ctxtId === "DRSS" || 
                this._currentContext.ctxtId === "FOW" || 
                this._currentContext.ctxtId === "LDWS" || 
                this._currentContext.ctxtId === "RVMVolume" || 
                this._currentContext.ctxtId === "BSMVolume" || 
                this._currentContext.ctxtId === "SBS_SCBS" || 
                this._currentContext.ctxtId === "SBS" || 
                this._currentContext.ctxtId === "KeylessLockBeepVol" || 
                this._currentContext.ctxtId === "DoorLockMode" || 
                this._currentContext.ctxtId === "DoorLock" || 
                this._currentContext.ctxtId === "IntLightTimeoutDoorOpen" || 
                this._currentContext.ctxtId === "IntLightTimeoutDoorClosed" || 
                this._currentContext.ctxtId === "AutoHeadlightOn" || 
                this._currentContext.ctxtId === "HeadlightOffTimer" || 
                this._currentContext.ctxtId === "DoorRelockTime" || 
                this._currentContext.ctxtId === "UnlockMode" || 
                this._currentContext.ctxtId === "TurnSettings" || 
                this._currentContext.ctxtId === "Lighting") 
        {
            if (this._ignitionStatus === 0) 
            {
                for (var tempcount = 0; tempcount < tmplt.list2Ctrl.dataList.itemCount; tempcount++)
                {
                    tmplt.list2Ctrl.dataList.items[tempcount].disabled = true;
                }
                tmplt.list2Ctrl.updateItems(0, tmplt.list2Ctrl.dataList.itemCount - 1);
                if (tmplt.list2Ctrl.dataList.itemCount == 0)
                {
                    tmplt.list2Ctrl.setLoading(false);
                }
            }
            else if (this._ignitionStatus === 1)
            {
                if (this.ignitionTimer != 0)
                {
                    //clear if a timer is started
                    clearTimeout(this.ignitionTimer);
                }
                //restart the timer
                this.ignitionTimer = setTimeout(this._timeOutIgnition.bind(this),2000);
            }
        }
        else
        {
            if (this._ignitionStatus === 1)
            {
                if (this.ignitionTimer != 0)
                {
                    //clear if a timer is started
                    clearTimeout(this.ignitionTimer);
                }
                //restart the timer
                this.ignitionTimer = setTimeout(this._timeOutIgnition.bind(this),2000);
            }
        }
    }
    else
    {
        if (this._ignitionStatus === 1)
        {
            if (this.ignitionTimer != 0)
            {
                //clear if a timer is started
                clearTimeout(this.ignitionTimer);
            }
            //restart the timer
            this.ignitionTimer = setTimeout(this._timeOutIgnition.bind(this),2000);
        }
    }
}

vehsettingsApp.prototype._timeOutIgnition = function()
{ 
    this._delayStatus = "enabled";
    this.ignitionTimer = 0;
    //store the ignition status to framework ( 2 sec delay is always handled in Veh settings)
    framework.setSharedData(this.uiaId, "IgnitionStatus", true);
    if (this._currentContext && this._currentContextTemplate && (this._currentContext.ctxtId === "VehicleSettingsTab" || this._currentContext.ctxtId === "SafetyTab" || this._currentContext.ctxtId === "DRSS" || this._currentContext.ctxtId === "FOW" || this._currentContext.ctxtId === "LDWS" || this._currentContext.ctxtId === "RVMVolume" || this._currentContext.ctxtId === "BSMVolume" || this._currentContext.ctxtId === "SBS_SCBS" || this._currentContext.ctxtId === "SBS" || this._currentContext.ctxtId === "KeylessLockBeepVol" || this._currentContext.ctxtId === "DoorLockMode" || this._currentContext.ctxtId === "DoorLock" || this._currentContext.ctxtId === "IntLightTimeoutDoorOpen" || this._currentContext.ctxtId === "IntLightTimeoutDoorClosed" || this._currentContext.ctxtId === "AutoHeadlightOn" || this._currentContext.ctxtId === "HeadlightOffTimer" || this._currentContext.ctxtId === "BuzzerAnswerBackVol" || this._currentContext.ctxtId === "DoorRelockTime" || this._currentContext.ctxtId === "UnlockMode" || this._currentContext.ctxtId === "TurnSettings" || this._currentContext.ctxtId === "Lighting" || this._currentContext.ctxtId === "SensitivityForWarningCancel" || this._currentContext.ctxtId === "SensitivityForWideRange"))
    {
        if (this._CANStatus === true && this.cachedSpeed === false) // if CAN status is active and AtSpeed is false, then only enable
        {
            for (var tempcount = 0; tempcount < this._currentContextTemplate.list2Ctrl.dataList.itemCount; tempcount++)
            {
                this._currentContextTemplate.list2Ctrl.dataList.items[tempcount].disabled = false;
            }
            this._currentContextTemplate.list2Ctrl.setDataList(this._currentContextTemplate.list2Ctrl.dataList);
            //this._currentContextTemplate.list2Ctrl.updateItems(0,this._currentContextTemplate.list2Ctrl.dataList.itemCount - 1);
            if (this._currentContextTemplate.list2Ctrl.dataList.itemCount) 
            { 
                this._currentContextTemplate.list2Ctrl.updateItems(0,this._currentContextTemplate.list2Ctrl.dataList.itemCount - 1); 
            } 
            switch(this._currentContextTemplate.templateName)
            {
                case "List2Tmplt" :
                    if (this._currentContextTemplate.list2Ctrl.dataList.itemCount == 0)
                    {
                        this._currentContextTemplate.list2Ctrl.setLoading(false);
                    }
                break;
                default:
                break;
            }
        }
		else if(this._CANStatus === true && this.cachedSpeed == true)
		{
			this._DisableSpeedRestricted();
		}
           /* if (this._currentContextTemplate.list2Ctrl.dataList.itemCount == 0)
            {
                this._currentContextTemplate.list2Ctrl.setLoading(false);
            }*/
    }
}

//For vehicle tab
vehsettingsApp.prototype.getTrueCountsVehicleTab = function()
{
    var temp = new Array();
    var index = 0;
    if (this.statusArrayTurn[1] === false && this.statusArrayTurn[0] === false)//For turn
    {
        this.statusArrayVehicleTab[2] = false;
    }
    if (this.statusArrayTurn[1] === true || this.statusArrayTurn[0] === true)//For turn
    {
        this.statusArrayVehicleTab[2] = true;
    }
    if (this.statusArrayDoorLock[4] === false && this.statusArrayDoorLock[3] === false && this.statusArrayDoorLock[1] === false && this.statusArrayDoorLock[2] === false && this.statusArrayDoorLock[0] === false)
    {
        this.statusArrayVehicleTab[1] = false;
    }
    if (this.statusArrayDoorLock[4] === true || this.statusArrayDoorLock[3] === true || this.statusArrayDoorLock[1] === true || this.statusArrayDoorLock[2] === true || this.statusArrayDoorLock[0] === true)
    {
        this.statusArrayVehicleTab[1] = true;
    }
    if (this.statusArray[3] === false && this.statusArray[2] === false && this.statusArray[6] === false && this.statusArray[1] === false && this.statusArray[5] === false && this.statusArray[0] === false && this.statusArray[4] === false && this.statusArray[7] === false)
    {
        this.statusArrayVehicleTab[3] = false;
    }
    if (this.statusArray[3] === true || this.statusArray[2] === true || this.statusArray[6] === true || this.statusArray[1] === true || this.statusArray[5] === true || this.statusArray[0] === true || this.statusArray[4] === true || this.statusArray[7] === true)
    {
        this.statusArrayVehicleTab[3] = true;    
    }    
    for (var j = 0; j < this.statusArrayVehicleTab.length; j++)
    {
        if (this.statusArrayVehicleTab[j] === true)
        {
            temp[index] = j;    
            index++;
        }        
    }
    return temp;
}
vehsettingsApp.prototype.getAdjustedValueforDataListVehicleTab = function()
{
    var trueArrayAutoWiper = this.getTrueCountsVehicleTab();
    var indexCount = 0;
    var tempArrayAutoWiper = new Array();
    for (var i = 0; i < trueArrayAutoWiper.length; i++)    
    {
        indexCount = trueArrayAutoWiper[i];
        tempArrayAutoWiper[i] =  this._VehicleSettingsTabCtxtDataListImmutable.items[indexCount];
        if ((indexCount === 0) && (this._cachedSafety_AutoWiper != null))//3 flash turn signal
        {
            this._autoWiperToggleIndex = i;
            tempArrayAutoWiper[i].value = this._cachedSafety_AutoWiper; 
        }
        
     }
     return tempArrayAutoWiper;
}

vehsettingsApp.prototype.populateStatusArrayAutoWiper = function()
{
     for (var truecount = 0; truecount < 4; truecount++)
     {
        this.statusArrayVehicleTab[truecount] = false;
     }
}


//For Turn
vehsettingsApp.prototype.getTrueCountsTurn = function()
{
    var temp = new Array();
    var index = 0;
    if (this.statusArrayTurn[1] === false && this.statusArrayTurn[0] === false)//For turn
    {
        this.statusArrayTurn[2] = false;
    }
    if (this.statusArrayTurn[1] === true || this.statusArrayTurn[0] === true)//For turn
    {
        this.statusArrayTurn[2] = true;
    }
    for (var j = 0; j < this.statusArrayTurn.length; j++)
    {
        if (this.statusArrayTurn[j] === true)
        {
            temp[index] =  j;    
            index++;
        }        
    }
    return temp;
}

vehsettingsApp.prototype.getAdjustedValueforDataListTurn = function(dataList)
{
    var trueArrayTurn = this.getTrueCountsTurn();

    var indexCount = 0;
    var tempArray2 = new Array();
    for (var i = 0; i < trueArrayTurn.length; i++)    
    {
        indexCount = trueArrayTurn[i];
        tempArray2[i] = this._TurnSettingsCtxtDataListImmutable.items[indexCount];

        if ((indexCount === 0) && (this._cachedSafety_3flashTurnSignal != null))//3 flash turn signal
        {
            tempArray2[i].value = this._cachedSafety_3flashTurnSignal; 
            this._3flashTurnSettingsToggleIndex = i;
        }
        else if ((indexCount === 1) && (this._cachedSafety_TurnSignalIndicatorVolume != null))//HeadlightOnWaring
        {
            tempArray2[i].value = this._cachedSafety_TurnSignalIndicatorVolume; 
            this._turnSignalVolumeToggleIndex = i;
        }
    }
     
    return tempArray2;
}

vehsettingsApp.prototype.populateStatusArrayTurn = function()
{
     for(var truecount = 0; truecount < 3; truecount++)
     {
        this.statusArrayTurn[truecount] = false;
     }
}

vehsettingsApp.prototype.getTrueCountsDoorLock = function()
{
    var temp = new Array();
    var index = 0;
    if (this.statusArrayDoorLock[4] === false && this.statusArrayDoorLock[3] === false && this.statusArrayDoorLock[1] === false && this.statusArrayDoorLock[2] === false && this.statusArrayDoorLock[0] === false)
    {
        this.statusArrayDoorLock[5] = false;
    }
    if (this.statusArrayDoorLock[4] === true || this.statusArrayDoorLock[3] === true || this.statusArrayDoorLock[1] === true || this.statusArrayDoorLock[2] === true || this.statusArrayDoorLock[0] === true)
    {
        this.statusArrayDoorLock[5] = true;
    }
    for(var j = 0; j < this.statusArrayDoorLock.length; j++)
    {
        if(this.statusArrayDoorLock[j] == true)
        {
            temp[index] =  j;    
            index++;
        }        
    }
    return temp;
}

vehsettingsApp.prototype.getAdjustedValueForDataListDoorLock = function(dataList)
{
    var trueArray1 = this.getTrueCountsDoorLock();
    var indexCount;
    var tempArrayDoorLock = new Array();
    for(var i = 0; i < trueArray1.length; i++)    
    {
        indexCount = trueArray1[i];
        tempArrayDoorLock[i] = this._DoorLockCtxtDataListImmutable.items[indexCount];
        
        if (indexCount === 0)
        {
            if(this._cachedVehicle_AutoDoorLockInstalledAT6 === 1)
            {
                if (this._cachedGet_AutoDoorLockAT6 === "AT6_Off")
                {
                    tempArrayDoorLock[i].label1Id = "common.Off";// framework.localize.getLocStr("common","Off") ;
                }
                else if (this._cachedGet_AutoDoorLockAT6)
                {
                    tempArrayDoorLock[i].label1Id = "common.On"; //framework.localize.getLocStr("common","On");
                }
            }
            else
            {
        
                if (this._cachedVehicle_AutoDoorLockInstalledAT === 1 && this._cachedVehicle_AutoDoorLockInstalledMT === 0)// auto transmission
                {
                    if (this._cachedGet_AutoDoorLockAT === 5)
                    {
                        tempArrayDoorLock[i].label1Id = "common.Off";// framework.localize.getLocStr("common","Off") ;
                    }
                    else if (this._cachedGet_AutoDoorLockAT >= 1 && this._cachedGet_AutoDoorLockAT <= 4)
                    {
                        tempArrayDoorLock[i].label1Id = "common.On"; //framework.localize.getLocStr("common","On");
                    }
                }
                else if (this._cachedVehicle_AutoDoorLockInstalledAT === 0 && this._cachedVehicle_AutoDoorLockInstalledMT === 1)//manual transmission
                {
                    if (this._cachedGet_AutoDoorLockMT === 3)
                    {
                        tempArrayDoorLock[i].label1Id = "common.Off";
                    }
                    else if (this._cachedGet_AutoDoorLockMT === 1 || this._cachedGet_AutoDoorLockMT === 2)
                    {
                        tempArrayDoorLock[i].label1Id = "common.On";
                    }
                }
				else if (this._cachedVehicle_AutoDoorLockInstalledAT === 1 && this._cachedVehicle_AutoDoorLockInstalledMT === 1)// If both installed then preference should be given to AT 
				{
					if (this._cachedGet_AutoDoorLockAT === 5)
					{
                        tempArrayDoorLock[i].label1Id = "common.Off";// framework.localize.getLocStr("common","Off") ;
					}
					else if (this._cachedGet_AutoDoorLockAT >= 1 && this._cachedGet_AutoDoorLockAT <= 4)
					{
                     tempArrayDoorLock[i].label1Id = "common.On"; //framework.localize.getLocStr("common","On");
					}
				}
            }
        }  
        else if (indexCount === 1 && this._cachedSafety_AutoDoorLockChimeVolume != null)
        {
            switch (this._cachedSafety_AutoDoorLockChimeVolume)
            {
                case 1:
                    tempArrayDoorLock[i].label1Id = "High";
                    break;
                case 2:
                    tempArrayDoorLock[i].label1Id = "Med";
                    break; 
                case 3:
                    tempArrayDoorLock[i].label1Id = "Low";
                    break;  
                case 4:
                    tempArrayDoorLock[i].label1Id = "common.Off";
                    break;
                default:
                    break;
             }  
        }  
        else if (indexCount === 2 && this._cachedSafety_AutoRelockTimer != null)
        {
            switch (this._cachedSafety_AutoRelockTimer)
            {
                case 1:
                    tempArrayDoorLock[i].label1Id ="_90s";
                    break;
                case 2:
                    tempArrayDoorLock[i].label1Id ="_60s";
                    break; 
                case 3:
                    tempArrayDoorLock[i].label1Id ="_30s";
                    break;
                default:
                    break;  
            }  
        }  
        else if (indexCount === 3 && this._cachedKeyless_UnlockMode != null)
        {
            switch (this._cachedKeyless_UnlockMode)
            {
                case 1:
                    tempArrayDoorLock[i].label1Id = "_AllDoors";
                    break;
                case 2:
                    tempArrayDoorLock[i].label1Id = "_Driver'sDoor";
                    break;
                default:
                    break;                
            }  
        }  
        else if (indexCount === 4 && this._cachedKeyless_WalkAwayLock != null)
        {
            tempArrayDoorLock[i].value = this._cachedKeyless_WalkAwayLock;
            this._walkAwayLockToggleIndex = i;
        }
    }
    return tempArrayDoorLock;
}

vehsettingsApp.prototype.populateStatusArrayDoorLock = function()
{
    for (var truecount = 0; truecount < 6; truecount++)
    {
        this.statusArrayDoorLock[truecount] = false;
    }
}

vehsettingsApp.prototype.getTrueCounts = function()//Lighting
{
    var temp = new Array();
    var index = 0;
    if (this.statusArray[0] === false && this.statusArray[1] === false && this.statusArray[2] === false && this.statusArray[3] === false && this.statusArray[4] === false && this.statusArray[5] === false && this.statusArray[6] === false && this.statusArray[7] === false && this.statusArray[8] === false && this.statusArray[9] === false)
    {
        //this.statusArray[7] = false;
        this.statusArray[10] = false;
    }
    if (this.statusArray[0] === true || this.statusArray[1] === true || this.statusArray[2] === true || this.statusArray[3] === true || this.statusArray[4] === true || this.statusArray[5] === true || this.statusArray[6] === true || this.statusArray[7] === true || this.statusArray[8] === true || this.statusArray[9] === true)
    {
        //this.statusArray[7] = true;
        this.statusArray[10] = true;
    }   
    for (var j= 0; j < this.statusArray.length; j++)
    {
        if(this.statusArray[j] === true)
        {
            temp[index] =  j;    
            index++;
        }        
    }
    return temp;
}

vehsettingsApp.prototype.getAdjustedValueforDataListLighting = function(dataList)
{
    var trueArray = this.getTrueCounts();
    var indexCount;
    var tempArray = new Array();
    for (var i = 0; i < trueArray.length; i++)    
    {
        indexCount = trueArray[i];
        tempArray[i] = this._LightingCtxtDataListImmutable.items[indexCount];
        if ((indexCount === 0) && (this._cachedSafety_InterioLightTimeoutDoorOpen != null))
        {
            switch (this._cachedSafety_InterioLightTimeoutDoorOpen)
            {
                case 1:
                    tempArray[i].label1Id = "_60m";
                    break;
                case 2:
                    tempArray[i].label1Id = "_30m";
                    break; 
                case 3:
                    tempArray[i].label1Id = "_10m";
                    break;
                default:
                    break;
            }  
        }  
        else if ((indexCount === 1) && (this._cachedSafety_InterioLightTimeoutDoorClosed != null))
        {
            switch (this._cachedSafety_InterioLightTimeoutDoorClosed)
            {
                case 1:
                    tempArray[i].label1Id =  "_60s";
                    break;
                case 2:
                    tempArray[i].label1Id = "_30s";
                    break; 
                case 3:
                    tempArray[i].label1Id = "_15s";
                    break;  
                case 4:
                    tempArray[i].label1Id = "_7p5s";
                    break;
                default:
                    break;
            }
        }
        else if (indexCount === 2) //High Beam Control
        {
        if(this.textChange == 1)
        {
            tempArray[i].text1Id = "HighBeamControl";
        }
        else if(this.textChange == 2)
        {
            tempArray[i].text1Id = "AHBC";
        }
            if (this._cachedHeadlight_HighBeamControll === null)
                tempArray[i].value = 1; // set to ON
            else
                tempArray[i].value = this._cachedHeadlight_HighBeamControll;
            this._highBeamControlToggleIndex = i;
        }   
        else if (indexCount === 3) //AFS
        {
            if (this._cachedAFS === null)
                tempArray[i].value = 1; // set to ON
            else
                tempArray[i].value = this._cachedAFS;
            this._AFSToggleIndex = i;
        }  
        else if (indexCount === 4) //HeadlightOnWaring
        {
            if (this._cachedHeadlight_HeadlightOnWaring === null)
                tempArray[i].value = 1; // set to High
            else
                tempArray[i].value = this._cachedHeadlight_HeadlightOnWaring;
            this._lightReminderToggleIndex = i;
        }    
        else if ((indexCount === 5) && (this._cachedHeadlight_HeadlightOffTimer != null))
        {
            switch (this._cachedHeadlight_HeadlightOffTimer)
            {
                case 1:
                    tempArray[i].label1Id = "_120s";
                    break;
                case 2:
                    tempArray[i].label1Id = "_90s";
                    break; 
                case 3:
                    tempArray[i].label1Id = "_60s";
                    break;  
                case 4:
                    tempArray[i].label1Id = "_30s";
                    break;
                case 5:
                    tempArray[i].label1Id = "common.Off";
                    break;
                default:
                    break;
            }
        }
        else if ((indexCount === 6) && (this._cachedCHLT != null))  //CHLT
        {
            switch (this._cachedCHLT)
            {
                case "CHL_120_SEC":
                    tempArray[i].label1Id = "_120s";
                    break;
                case "CHL_90_SEC":
                    tempArray[i].label1Id = "_90s";
                    break; 
                case "CHL_60_SEC":
                    tempArray[i].label1Id = "_60s";
                    break;  
                case "CHL_30_SEC":
                    tempArray[i].label1Id = "_30s";
                    break;
                case "CHL_OFF":
                    tempArray[i].label1Id = "common.Off";
                    break;
                default:
                    break;
            }
        }
        else if (indexCount === 7)  //LHL
        {
            if (this._cachedLHL === null)
                tempArray[i].value = 1; // set to ON
            else
				switch(this._cachedLHL)
				{
					case "LHL_On":
						tempArray[i].value = 1;
						break;
					case "LHL_Off":
						tempArray[i].value = 2;
						break;
						
				}
            this._LHLToggleIndex = i;
        } 
        else if (indexCount === 8) //DayTimeRunningLight
        {
            if (this._cachedHeadlight_DaytimeLights === null)
                tempArray[i].value = 1; // set to ON
            else
                tempArray[i].value = this._cachedHeadlight_DaytimeLights;
            this._dayTimeRunningLightToggleIndex = i;
        }   
        else if ((indexCount === 9) && (this._cachedHeadlight_AutoHeadlightsSensitivity != null))
        {
            switch (this._cachedHeadlight_AutoHeadlightsSensitivity)
            {
                case 1:
                    tempArray[i].label1Id = "Light" ;
                    break;
                case 2:
                    tempArray[i].label1Id = "MediumLight";
                    break; 
                case 3:
                    tempArray[i].label1Id = "Medium";
                    break;  
                case 4:
                    tempArray[i].label1Id = "MediumDark";
                    break;  
                case 5:
                    tempArray[i].label1Id = "Dark";
                    break; 
                default:
                    break;
            }
        }
    }
    return tempArray;
}
vehsettingsApp.prototype.populateStatusArrayLighting = function()
{
    for (var truecount = 0; truecount < 11; truecount++)
    {
        this.statusArray[truecount] = false;
    }
}

vehsettingsApp.prototype.getTrueCountsSafetyTab = function()
{
    var temp = new Array();
    var index = 0;
    var statusArraySafetyTabCopy = new Array();
    for (i = 0; i <= this.statusArraySafetyTab.length; i++)
    {
        statusArraySafetyTabCopy[i] = this.statusArraySafetyTab[i];
    }
    if (this.statusArraySafetyTab[1] === true
            || this.statusArraySafetyTab[3] === true)
    {
        statusArraySafetyTabCopy[2] = false;
    }
    if (this.statusArraySafetyTab[1] === true
            && this.statusArraySafetyTab[3] === true)
    {
        statusArraySafetyTabCopy[1] = false;
        statusArraySafetyTabCopy[3] = false;
        statusArraySafetyTabCopy[2] = true;
    }
    if (this.statusArraySafetyTab[1] === false
            && this.statusArraySafetyTab[3] === false)
    {
        statusArraySafetyTabCopy[2] = false;
    }
    for (var j = 0; j < statusArraySafetyTabCopy.length; j++)
    {
        if (statusArraySafetyTabCopy[j] === true)
        {
            temp[index] =  j;    
            index++;
        }        
    }
    return temp;
}
vehsettingsApp.prototype.getAdjustedValueforDataListSafetyTab = function()
{
    var trueArray4 = this.getTrueCountsSafetyTab();

    var indexCount;
    var tempArraySafetyTab = new Array();
    for (var i = 0 ; i < trueArray4.length; i++)    
    {
        indexCount = trueArray4[i];
        tempArraySafetyTab[i] =  this._SafetyTabCtxtDataListImmutable.items[indexCount];
        if (tempArraySafetyTab[i].appData === "SetSCBS")
        {
            this._smartCityBreakToggleIndex = i;
            if (this._cachedSBS_CityBrakeSystem != null)
            {
                tempArraySafetyTab[i].value = this._cachedSBS_CityBrakeSystem;
            } 
        }
        if (tempArraySafetyTab[i].appData === "SetDA")
        {
            
             log.info("Inside getAdjustedValueforDataListSafetyTab :tempArraySafetyTab[i].appData ::"+tempArraySafetyTab[i].appData);
            
            if (this._cachedDA != null)
            {
                log.info("changing DA value to "+this._cachedDA +" at  index = "+i);
                switch(this._cachedDA)
				{
					case "DA_On":
						tempArraySafetyTab[i].value = 1;
						break;
					case "DA_Off":
						tempArraySafetyTab[i].value = 2;
						break;
				}
				
                
            } 
        }
		if (tempArraySafetyTab[i].appData === "SetParkingSensor")
        {
            
             log.info("Inside getAdjustedValueforDataListSafetyTab :tempArraySafetyTab[i].appData ::"+tempArraySafetyTab[i].appData);
            
            if (this._cachedPSI != null)
            {
                log.info("changing PSI value to "+this._cachedPSI +" at  index = "+i);
                switch(this._cachedPSI)
				{
					case "On":
						tempArraySafetyTab[i].value = 1;
						break;
					case "Off":
						tempArraySafetyTab[i].value = 2;
						break;
					default:
						tempArraySafetyTab[i].value = 2; //default setting to Off
						break;
				}
            } 
        }
        if (tempArraySafetyTab[i].appData === "SelectRVMBuzzerVolume"  )
        {
            switch (this._cachedRVMBuzzerVolume)
            {
                case 1:
                    tempArraySafetyTab[i].label1Id = "High";
                    break;
                case 2:
                    tempArraySafetyTab[i].label1Id = "Low";
                    break; 
                case 3:
                    tempArraySafetyTab[i].label1Id = "common.Off";
                    break;
                default:
                    break;
             }  
        }
        if (tempArraySafetyTab[i].appData === "SelectBSMBuzzerVolume")
        {
            switch (this._cachedBSMBuzzerVolume)
            {
                case 1:
                    tempArraySafetyTab[i].label1Id = "High";
                    break;
                case 2:
                    tempArraySafetyTab[i].label1Id = "Low";
                    break; 
                case 3:
                    tempArraySafetyTab[i].label1Id = "common.Off";
                    break;
                default:
                    break;
            }  
        } 
        if ((indexCount === 3) && (this._cachedSBS_CityBrakeSystem != null))//SCBS
        {
            tempArraySafetyTab[i].value = this._cachedSBS_CityBrakeSystem; 
        }
        
        if ((indexCount === 5) && (this._cachedRVMBuzzerVolume != null))//RVM
        {
            tempArraySafetyTab[i].value = this._cachedRVMBuzzerVolume; 
        }
    }
    return tempArraySafetyTab;
}

vehsettingsApp.prototype.populateStatusArraySafetyTab = function()
{
    for (var truecount = 0; truecount < 11; truecount++)
    {
        this.statusArraySafetyTab[truecount] = false;
	}
}

vehsettingsApp.prototype._DisableSpeedRestricted = function()
{  
    if (this._currentContext && this._currentContextTemplate) 
    {
        switch (this._currentContext.ctxtId)
        {
            case "VehicleSettingsTab" : 
                this._VehicleSettingsTabCtxtDataListImmutable.items[0].disabled = this.cachedSpeed;
                this._VehicleSettingsTabCtxtDataListImmutable.items[1].disabled = this.cachedSpeed;
                this._VehicleSettingsTabCtxtDataListImmutable.items[2].disabled = this.cachedSpeed;
                this._VehicleSettingsTabCtxtDataListImmutable.items[3].disabled = this.cachedSpeed;
                this.populateListCtrl(this._currentContextTemplate);
                break;
            case "TurnSettings" : 
                this._TurnSettingsCtxtDataListImmutable.items[0].disabled = this.cachedSpeed;
                this._TurnSettingsCtxtDataListImmutable.items[1].disabled = this.cachedSpeed;
                this._TurnSettingsCtxtDataListImmutable.items[2].disabled = this.cachedSpeed;
                this.populateListCtrl(this._currentContextTemplate);
                break;
            case "Lighting":
                this._LightingCtxtDataListImmutable.items[0].disabled = this.cachedSpeed;
                this._LightingCtxtDataListImmutable.items[1].disabled = this.cachedSpeed;
                this._LightingCtxtDataListImmutable.items[4].disabled = this.cachedSpeed;
                this._LightingCtxtDataListImmutable.items[5].disabled = this.cachedSpeed;
                this._LightingCtxtDataListImmutable.items[6].disabled = this.cachedSpeed;
                this._LightingCtxtDataListImmutable.items[7].disabled = this.cachedSpeed;
                this._LightingCtxtDataListImmutable.items[8].disabled = this.cachedSpeed;
                this.populateListCtrl(this._currentContextTemplate); 
                break;
            case "DoorLock":
                this._DoorLockCtxtDataListImmutable.items[0].disabled = this.cachedSpeed; 
                this._DoorLockCtxtDataListImmutable.items[1].disabled = this.cachedSpeed;
                this._DoorLockCtxtDataListImmutable.items[2].disabled = this.cachedSpeed; 
                this._DoorLockCtxtDataListImmutable.items[3].disabled = this.cachedSpeed;
                this._DoorLockCtxtDataListImmutable.items[4].disabled = this.cachedSpeed; 
                this._DoorLockCtxtDataListImmutable.items[5].disabled = this.cachedSpeed;
                this.populateListCtrl(this._currentContextTemplate);
                break;
            case "DoorLockMode":
                this.populateListCtrl(this._currentContextTemplate);
                break;
            case "KeylessLockBeepVol":
                this.populateListCtrl(this._currentContextTemplate);
                break;
            case "DoorRelockTime":
                this.populateListCtrl(this._currentContextTemplate);
                break;
            case "UnlockMode" : 
                this.populateListCtrl(this._currentContextTemplate);
                break;
            case "HeadlightOffTimer" : 
                this.populateListCtrl(this._currentContextTemplate);
                break;
            case "IntLightTimeoutDoorOpen" : 
                this.populateListCtrl(this._currentContextTemplate);
                break;
            case "IntLightTimeoutDoorClosed" : 
                this.populateListCtrl(this._currentContextTemplate);
                break;
            case "AutoHeadlightOn" : 
                this.populateListCtrl(this._currentContextTemplate);
                break;
            case "DoorLockReset" :
            case "DoorLockResetError" : 
            case "TurnReset" : 
            case "TurnResetError" :     
            case "LightingReset" : 
            case "LightingResetError" : 
                this._populateDialogCtrl(this._currentContextTemplate);
				break;
			case "CHLT" : 
				var listLength = this._currentContextTemplate.list2Ctrl.dataList.items.length;
				if(this.cachedSpeed)
				{
					for (var i = 0; i < listLength; i++)
					{
						this._currentContextTemplate.list2Ctrl.dataList.items[i].disabled = true;
					}
				}
				else
				{
					for (var i = 0; i < listLength; i++)
					{
						this._currentContextTemplate.list2Ctrl.dataList.items[i].disabled = false;
					}
				}
				this._currentContextTemplate.list2Ctrl.updateItems(0,this._currentContextTemplate.list2Ctrl.dataList.itemCount - 1); 
                break;
            default:
                log.debug("no case found");
                break;
        }  
    }
 }
 
vehsettingsApp.prototype._CANStatusMsgHandler = function(msg)
{  
    if (msg && msg.params.payload)
    {
        //store the ignition status to framework
        if (msg.params.payload.evData === 0)
        {
            framework.setSharedData(this.uiaId, "CanStatus", false);
            this._CANStatus = false;
        }
        else if (msg.params.payload.evData === 1)
        {
            framework.setSharedData(this.uiaId, "CanStatus", true);
            this._CANStatus = true;
        }    
    }
    
    if (this._currentContext && this._currentContextTemplate) 
    {
            if (this._currentContext.ctxtId === "VehicleSettingsTab" || 
                this._currentContext.ctxtId === "SafetyTab" || 
                this._currentContext.ctxtId === "DRSS" || 
                this._currentContext.ctxtId === "FOW" || 
                this._currentContext.ctxtId === "LDWS" || 
                this._currentContext.ctxtId === "RVMVolume" || 
                this._currentContext.ctxtId === "BSMVolume" || 
                this._currentContext.ctxtId === "SBS_SCBS" || 
                this._currentContext.ctxtId === "SBS" || 
                this._currentContext.ctxtId === "KeylessLockBeepVol" || 
                this._currentContext.ctxtId === "DoorLockMode" || 
                this._currentContext.ctxtId === "DoorLock" || 
                this._currentContext.ctxtId === "IntLightTimeoutDoorOpen" || 
                this._currentContext.ctxtId === "IntLightTimeoutDoorClosed" || 
                this._currentContext.ctxtId === "AutoHeadlightOn" || 
                this._currentContext.ctxtId === "HeadlightOffTimer" || 
                this._currentContext.ctxtId === "DoorRelockTime" || 
                this._currentContext.ctxtId === "UnlockMode" || 
                this._currentContext.ctxtId === "TurnSettings" || 
                this._currentContext.ctxtId === "Lighting" ) 
            {
                //var topItem = this._currentContextTemplate.list2Ctrl.topItem; // Save position 
                //this._currentContextTemplate.list2Ctrl.hideFocus();
                this.populateListCtrl(this._currentContextTemplate);
                //this._currentContextTemplate.list2Ctrl.restoreFocus(); // Restore the focus
                //this._currentContextTemplate.list2Ctrl.topItem = topItem; // Restore position 
            }
        }
    }

vehsettingsApp.prototype._HudInstalledStatusHandler = function()
{
    if (this._HUDInstalledStatus == true)
    {
        this._contextTable.VehicleSettingsTab.controlProperties.List2Ctrl.tabsButtonConfig.tabsConfig = this._tabsConfig;  
        this._contextTable.HUDTab.controlProperties.List2Ctrl.tabsButtonConfig.tabsConfig = this._tabsConfig;  
        this._contextTable.SafetyTab.controlProperties.List2Ctrl.tabsButtonConfig.tabsConfig = this._tabsConfig;  
        
        this._contextTable.HUDTab.controlProperties.List2Ctrl.tabsButtonConfig.currentlySelectedTab = 0;    
        this._contextTable.VehicleSettingsTab.controlProperties.List2Ctrl.tabsButtonConfig.currentlySelectedTab = 5;  
        this._contextTable.SafetyTab.controlProperties.List2Ctrl.tabsButtonConfig.currentlySelectedTab = 2;    
    }
    else
    {
        this._contextTable.VehicleSettingsTab.controlProperties.List2Ctrl.tabsButtonConfig.tabsConfig = this._tabsConfigNoHUD;  
        this._contextTable.SafetyTab.controlProperties.List2Ctrl.tabsButtonConfig.tabsConfig = this._tabsConfigNoHUD;    
        
        this._contextTable.VehicleSettingsTab.controlProperties.List2Ctrl.tabsButtonConfig.currentlySelectedTab = 4;   
        this._contextTable.SafetyTab.controlProperties.List2Ctrl.tabsButtonConfig.currentlySelectedTab = 1; 
    }    

}
//Tell framework this .js file has finished loading
framework.registerAppLoaded("vehsettings", null, true);

