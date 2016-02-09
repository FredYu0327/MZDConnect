/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: ecoenergyApp.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: amahajsn
 Date: 04-02-2013
 __________________________________________________________________________

 Description: IHU GUI Ecoenergy application

 Revisions:
 v0.1 (04-02-2013)  Initial development
 v0.2 (03-03-2013)  migration to spec 0.3.51 (atiwarc)
 v0.3 (04-24-2013)  Migration to Spec 0.3.56 (atiwarc)
 v0.4 (27-June-2014)  Changes are done for SCR SW00150054(avalajh)
 v0.5 (8-Sep-2014)  New error is added in control status screen.(avalajh)
 v0.6 (9-Sep-2014)  Changes in reset success handler(avalajh)
 v0.7 (12-Sep-2014) Changes are done for crash in tire rotation and bar values(avalajh)
 v0.8 (15-Sep-2014) Changes are done for HEV Fuel Consumption(avalajh)
 v0.9 (22-Sep-2014) Changes are done for Sbntitle Id(avalajh)
 v0.10 (24-Sep-2014) Changes are done in reset success msg handler- SCR SW00155746(avalajh)
 v0.11(1-Oct-2014) Changes are done for DPF error- SCR SW00155994(avalajh)
 v0.12(15-Oct-2014) Changes are done for setdiv- SCR SW00156413(avalajh)
 v0.13(6-Nov-2014) Changes are done for better design- SCR SW00156036(avalajh)
 v0.14(19-Nov-2014)Changes are done for SCR SW00158191
 __________________________________________________________________________


 */

log.addSrcFile("ecoenergyApp.js", "ecoenergy");
log.setLogLevel("ecoenergy", "debug");

function ecoenergyApp(uiaId) {
    log.debug("Constructor called.");

    // Base application functionality is provided in a common location via this call to baseApp.init().
    // See framework.js/BaseApp.js for details.
    baseApp.init(this, uiaId);
}

/***********************************************************/
/* App Init is a standard function called by the framework */
/***********************************************************/

/*
 * Called just after the app is instantiated by framework.
 * All variables local to this app should be declared in this function
 */
ecoenergyApp.prototype.appInit = function()
{
    if (framework.debugMode) 
    {
        utility.loadScript("apps/ecoenergy/test/ecoenergyAppTest.js");
    }
	this._tireStatus = null;
	this._reverseValue = 0;
	this._vehSpeed = 0;
		
	this._cachedVehicleType = null;	
	this._feature						  ="NONE"
    this._multiplicationFactor            = 0.1;                       //used to get correct floating point value of fuelEfficiency
    this._equippedCtrlStyle               = "iEloopiStop";        // The equipped control style, 
    this._isUmpPanelOpen                   = false;
    this._currentControl                  = null;                                                               //set by a parameter on the context change message
    this._celebrationOnOff                  = "live";
    this._commonImagePath                 = "./apps/ecoenergy/images/";
    this._isEcoContext                    = false;
    this._INVALID_RANGE                   = 65534;
    this._INVALID_RANGE_EvDriveDistance   = 1000000;
    this._INVALID_RANGE_EvOneDriveDistance= 10000;
    //[Settings Context] :: global variable
    this._listLength                      = null;
    this._atSpeedVal                      = null;
    this._graphUnits                      = {
        "currentDriveBarGraphUnit"    : "kml",
        "cumulativeBarGraphUnit"    : "kml" 
    };
    
    this._globalUnit = null;
    this._globalUnitRange = null;
    this._isResetFinished = false;
    this._isResetIconDisabled = false;
	this._cachedResetTripAStatus  = "OFF";
    // Cached data from message handlers
    //@formatter:off

    // Cached data variables for EcoStatus Starts
    
    this._cached_iEloopData = {                                     //Caches the iEloop data
        "dataKnown"                         : true,
        "capChgLvl"                         : 0,                    //used to cache capacitor charging level
        "rgnPwrLvl"                         : 0,                    //used to cache regeneration power level
        "electLdUsgLvl"                     : 0                    //used to cache load uses level
    };
    this._cached_fuelEfficiencyData         = {                     //used to cache Fuel Efficiency Data
        "fuelEfficiency"                    : "--.-",                    //used to cache Fuel Efficiency value
        "fuelEfficiencyUnit"                : ""               //used to cache Fuel Efficiency unit
    };                                                              //It will also used by FuelEfficiency context

    this._cached_iStopMode                  = "Status";             //used to cache iStopMode 
                                                                    //(amongst : Status,error,time,NA,unknown) 

    this._cached_iStopStatusObj             = {                     //used to cache iStop Status data
        "iStopStatusId"                     : "Ready",              //used to cache the iStopStatus condition(Ready/NotReady)
        "iStopStatusText"                   :  null,
        "batteryStatus"                     : "Good",               //used to cache battery Status (good/bad/unknown)
        "engineStatus"                      : "Good",               //used to cache engine Status (good/bad/unknown)
        "acStatus"                          : "Good"               //used to cache A/C Status (good/bad/unknown)
    };
    this._cached_iStopTimeObj               = {                     //used to cache iStop Time data
        "iStopTime"                         : 0,                    //used to cache iStop time value
        "iStopTotalTime"                    : 0                    //used to cache iStop total time value
    };
    this._cached_iStopErrorObj              = {                     //used to cache iStop Error data
        "iStopErrorId"                      : null,                //used to cache iStop Error id value
        "iStopErrorText"                    : "",                   //used to cache iStop Error text
        "istopActivated"                    : null,
        "istopStandbyNotFullfilled"         : null
    };
    this._cached_iStopData                  = {                     //It caches iStop Data
        "iStopMode"                         : this._cached_iStopMode,
        "iStopStatusObj"                    : this._cached_iStopStatusObj,
        "iStopTimeObj"                      : this._cached_iStopTimeObj,
        "iStopErrorObj"                     : this._cached_iStopErrorObj
    };
    //@formatter:on

    // Configuration data
    //@formatter:off
    this._cached_iEloopConfig               = {                        /**Used to set iEloop Configuration**/    
        "iEloopTitleId"                     : "",
        "iEloopTitleText"                   : null
    };
    this._cached_iStopConfig                = {                        /**Used to set iStop Configuration**/
        "iStopTitleId"                      : "",
        "iStopTitleText"                    : null,
        "iStopTimeTitleId"                  : "TotalActive",
        "iStopTimeTitleText"                : null,
        "iStopTotalTitleId"                 : "TotalTimeTitle",
        "iStopTotalTitleText"               : null
    };

    // Cached data variables for EcoStatus Ends

    this._cached_initialCDFEBarValues   = new Array();              // Caches Current Drive Fuel Economy bar graph values Array 
    this._cached_currentCDFEBarValue    = new Array();              // Caches Current Drive Fuel Economy bar graph value
   
    this._cached_initialCDFELineValues  = new Array();              // Caches Current Drive Fuel Economy line graph values Array
    this._cached_currentCDFELineValue   = null;                     // Caches Current Drive Fuel Economy line graph value

    this._cached_initialCFERBarValues   = new Array();              // Caches Cumulative Fuel Economy By Reset bar graph values Array
    this._cached_newCFERBarValue        = null;
    this._cached_currentCFERBarValue    = null;                     // Caches Cumulative Fuel Economy By Reset bar graph value
	this._cached_FuelType				=null;
    this._newLineGraphReady             = false;
    this._newBarGraphReady              = false;
    
    
    this._cached_initialDiscValues = new Array();
    this._cached_currentDiscValue  = new Array();
    this._cached_halfDiscsValue    = new Array();
    this._cached_initialHalfDiscsValue    = new Array();
    this._initialEvMode = new Array();
    this._currentEvMode = new Array();
    
    this._cachedEvDriveDistance = {unitId : 'km', driveDistance : null, percentValue : null};
    this._cachedOneDriveDistance = {unitId : 'km', driveDistance : null, percentValue : null};
    this._cachedHEVBattLevel = 0;
    //@formatter:on

    // Configuration data
    //@formatter:off
    this._currentFuelConfig =            {
    /**Used to set FuelEfficiency context Configuration, This data has to be set only once and
     * will not change dynamically
     */
        "titleId"                       : "CurrentDriveFuelTitle",
        "xAxisLabelId"                  : "ElapsedTimeInMin",
        "xAxisLabelText"                : null,
        "yAxisLabelId"                  : "kml",
        "yAxisLabelText"                : null,
        "yAxisLimitValue"               : 40,
        "initialBarValues"              : this._cached_initialCDFEBarValues,
        "initialLineValues"             : this._cached_initialCDFELineValues
    };
    this._cumulativeFuelConfig =        {
    /**Used to set FuelEfficiency context Configuration, This data has to be set only once and
     */
        "titleId"                       : "CummulativeFuelEconomyReset",
        "xAxisLabelId"                  : "CurrentStatus",
        "xAxisLabelText"                : null,
        "yAxisLabelId"                  : "kml",
        "yAxisLabelText"                : null,
        "yAxisLimitValue"               : 40,
        "initialBarValues"              : this._cached_initialCFERBarValues
    };
    // Cached data variables for FuelConsumption Ends
    
    // Cached data variables for Effectiveness Starts
    this._cached_iStopTime              = {                             //used to cache the istop Time data for Effectiveness context
        "actuationTime"                 : null,
        "stopTime"                      : null,
        "totalTime"                     : null
    };
    
    this._cached_boostRange             = {
        "range"                            : '-- -',
        "unit"                            : ''
    };
    
   this._cached_iEloopEnergy=          {                               //used to cache the iEloopEnergy data for Effectiveness context
        "GeneratedEnergy"               : this._cached_generatedEnergy,
        "TotalEnergy"                   : this._cached_totalEnergy
    };
    this._cached_iEloopEffectiveRate    = null;                        //used to cache the iEloop EffectiveRate 
    this._cached_iStopEffectiveRate     = 0;                        //used to cache the iStop EffectiveRate
    this._cached_treeCurrentLvl         = null;                        //used to cache the tree level value
    this._cached_treeNumber             = '--';                        //used to cache the tree number value
    // Cached data variables for Effectiveness Ends
    
    //cached data variables for settings screen
    this._cachedEndingScreenToggleStatus  = null;                        //used to cache the status of endingscreentoggle button
    this._cachedResetToggleStatus  = null;                               //used to cache the status of resettoggle button
    this._cachedSettingsEnableDisableStatus  = null;                     //used to cache the support of ending screen.
    
    
    //EcoEnergy Setting static list
    this._ecoenergySettingList  = {
          itemCountKnown : true,
          itemCount      : 2,
          items           : [
                                { appData : 'SelectEndingScreen', text1Id : 'IgnitionOff', itemStyle : 'styleOnOff', hasCaret : false, value : 2}, 
                                { appData : 'ResetTripCAFE',      text1Id : 'SyncTripA'  , itemStyle : 'styleOnOff', hasCaret : false, value : 2}] 
  };
    //@formatter:on

    this._umpButtonConfigNoSwitch = new Object();
    // Default config
    // @formatter:off
    //umpButtonConfig for buttons
    
     this._umpButtonConfigNoSwitch["HidePanel"] =
        {
            buttonBehavior : "shortPressOnly",
            imageBase : this._commonImagePath+"IcnUmpHide",
            disabled : false, 
            buttonClass : "normal", 
            appData : "HidePanel",
            labelId : 'HidePanel',
            selectCallback: this._umpDefaultSelectCallback.bind(this)
        };
    
     this._umpButtonConfigNoSwitch["ApplicationsMenu"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : this._commonImagePath+"IcnUmpApps",
        disabled : false, 
        buttonClass : "normal", 
        labelId : "ApplicationsMenu",
        appData : "ApplicationsMenu",
        selectCallback: this._umpDefaultSelectCallback.bind(this)
             
    };
    this._umpButtonConfigNoSwitch["Reset"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase :  this._commonImagePath+"IcnUmp_Reset",
        disabled : false,
        buttonClass : "normal",
        appData : "Reset",
        labelId : 'Reset',
        selectCallback: this._umpDefaultSelectCallback.bind(this)
    };
            
    this._umpButtonConfigNoSwitch["SelectSettings"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : this._commonImagePath+"IcnUmpSettings",
        disabled : false, 
        buttonClass : "normal", 
        appData : "SelectSettings",
        labelId : 'SelectSettings',
        selectCallback: this._umpDefaultSelectCallback.bind(this)
    };
   
    
    /**
     * Ump panel button config for fuel consumption switchview context
     */
    this._umpButtonConfigFuel = new Object();
    
    this._umpButtonConfigFuel["HidePanel"] = this._umpButtonConfigNoSwitch["HidePanel"];
    this._umpButtonConfigFuel["ApplicationsMenu"] = this._umpButtonConfigNoSwitch["ApplicationsMenu"]; 
    
    this._umpButtonConfigFuel["SwitchView"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : this._commonImagePath+"IcnUmp_ScreenSwitch1",
        disabled : false, 
        buttonClass : "normal", 
        appData : "SwitchView",
        labelId : 'SwitchView',
        selectCallback: this._umpDefaultSelectCallback.bind(this)
    };
    
    this._umpButtonConfigFuel["Reset"] = this._umpButtonConfigNoSwitch["Reset"];
    this._umpButtonConfigFuel["SelectSettings"] = this._umpButtonConfigNoSwitch["SelectSettings"];
    
    
    /**
     * Ump panel button config for EcoEffect  context
     */
    this._umpButtonConfigEcoEffect = new Object();
    this._umpButtonConfigEcoEffect["HidePanel"] = this._umpButtonConfigNoSwitch["HidePanel"];
    this._umpButtonConfigEcoEffect["ApplicationsMenu"] = this._umpButtonConfigNoSwitch["ApplicationsMenu"];
    
    this._umpButtonConfigEcoEffect["SwitchView"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : this._commonImagePath+"IcnUmp_ScreenSwitch1",
        disabled : false, 
        buttonClass : "normal", 
        appData : "SwitchView",
        labelId : 'SwitchView',
        selectCallback: this._umpDefaultSelectCallback.bind(this)
    };
    
    this._umpButtonConfigEcoEffect["Reset"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase :  this._commonImagePath+"IcnUmp_Reset",
        disabled : true,
        buttonClass : "normal",
        labelId : 'SwitchView',
        appData : "Reset",
        selectCallback: this._umpDefaultSelectCallback.bind(this)
    };
    
    this._umpButtonConfigEcoEffect["SelectSettings"] = this._umpButtonConfigNoSwitch["SelectSettings"];
    
    /**
     * Ump panel button config for EcoStatus  context
     */
    this._umpButtonConfigEcoStatus = new Object();
    this._umpButtonConfigEcoStatus["HidePanel"] = this._umpButtonConfigNoSwitch["HidePanel"];
    this._umpButtonConfigEcoStatus["ApplicationsMenu"] = this._umpButtonConfigNoSwitch["ApplicationsMenu"];
        
    this._umpButtonConfigEcoStatus["SwitchView"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : this._commonImagePath+"IcnUmp_ScreenSwitch1",
        disabled : false, 
        buttonClass : "normal",
        labelId : 'SwitchView',
        appData : "SwitchView",
        selectCallback: this._umpDefaultSelectCallback.bind(this)
    };
    this._umpButtonConfigEcoStatus["Reset"] = this._umpButtonConfigNoSwitch["Reset"];
    this._umpButtonConfigEcoStatus["SelectSettings"] = this._umpButtonConfigNoSwitch["SelectSettings"];
    
    // HEV constants for EcoFlow patterns 
    this.HEV_NONE = 0;
    this.HEV_FORWARD = 1;
    this.HEV_REVERSE = 2;
    this.HEV_RESERVED = 3;
    
    this._ecoHEVConfig = new Object();
    
    /* 
     * NOTE:
     * Every time a function is bound (using bind()), a new
     * function is created in memory. Whenever possible,
     * only bind the same function once and use reference.
     */
    var contextInCbControlSts               = this._controlStatusContextIn.bind(this);          // ContextIn callback for ControlStatus context
    var readyCbControlSts                   = this._controlStatusReady.bind(this);              // Ready callback for ControlStatus context
    var noLongerDisplayedCbControlSts       = this._controlStatusNoLongerDisplayed(this);       // LongerDisplayed callback for ControlStatus context
    
    var contextInCbFlowSts               = this._ecoFlowContextIn.bind(this);          // ContextIn callback for ControlStatus context
    var readyCbFlowSts                   = this._ecoFlowReady.bind(this);              // Ready callback for ControlStatus context
    
    var contextInCbEffectiveness            = this._effectivenessContextIn.bind(this);          // ContextIn callback for Effectiveness context
    var readyCbEffectiveness                = this._effectivenessReady.bind(this);              // Ready callback for Effectiveness context
    var noLongerDisplayedCbEffectiveness    = this._effectivenessNoLongerDisplayed.bind(this);  // LongerDisplayed callback for Effectiveness context

    var selectCb                            = this._switchSelectHandler.bind(this);             // Get called on click of 'Switch View' Button
    
    var readyCbFuelConsumption                = this._fuelConsumptionReady.bind(this);            
    var contextInCbFuelConsumption            = this._fuelConsumptionContextIn.bind(this);
    
    var readyCbHEVFuelConsumption                = this._HEVfuelConsumptionReady.bind(this);            
    var contextInCbHEVFuelConsumption            = this._HEVfuelConsumptionContextIn.bind(this);
    
    var readyCbHEVFuelConsumptionEnding          = this._HEVfuelConsumptionReadyEnding.bind(this);            
    var contextInCbHEVFuelConsumptionEnding      = this._HEVfuelConsumptionContextInEnding.bind(this);
    
    var contextInEcoSettingscreen            = this._ecoSettingContextIn.bind(this);              // ContextIn callback for EcoSetting context
    var readyEcoSettings                     = this._ecoSettingsReady.bind(this);                 // Ready callback for EcoSetting context
    
	var contextInResetConfirmScreen	           = this._ecoResetConfirmContextIn.bind(this);              // ContextIn callback for ResetConfirm context
    var readyResetConfirm                      = this._ecoResetConfirmReady.bind(this);                 // Ready callback for ResetConfirm context
	
    var contextInResetRetryScreen            = this._ecoResetRetryContextIn.bind(this);              // ContextIn callback for ResetRetry context
    var readyResetRetry                      = this._ecoResetRetryReady.bind(this);                 // Ready callback for ResetRetry context
    
    var contextInCbEffectivenessEnding       = this._effectivenessEndingContextIn.bind(this);          // ContextIn callback for Effectiveness context
    var readyCbEffectivenessEnding           = this._effectivenessEndingReady.bind(this);
    
    var readyCbFuelConsumptionEnding          = this._fuelConsumptionEndingReady.bind(this);            
    var contextInCbFuelConsumptionEnding      = this._fuelConsumptionEndingContextIn.bind(this);
    
    var contextInSettingsRetry				= this._ecoSettingsRetryContextIn.bind(this);
    var readySettingsRetry					= this._ecoSettingsRetryReady.bind(this);  
    // Context table
    //@formatter:off
    this._contextTable = {
        "ControlStatus"             : {
            "template"                  : "EcoStatusTmplt",
            "templatePath"              : "apps/ecoenergy/templates/EcoStatus",
            "sbNameId"                  : "SbnTitleId",
            "controlProperties"     : {
                "EcoStatusCtrl"     : {
                    /* Control configuration independent of control style --
                     * see the "contextInFunction" handler for further
                     * configuration that depends on control style (passed-in
                     * as "equipped" parameter on context change payload)
                     */
                    "subMap"                            : this._subMap,
                    "ctrlStyle"                            : this._equippedCtrlStyle,
                    "selectCallback"                    : selectCb,
                    "fuelEfficiencyTitleId"             : "Average",
                    "fuelEfficiencyTypeId"              : "SinceReset",
					"text1Id"							: "CummulativeFuelEconomy",
                    "iStopConfig"                       : this._cached_iStopConfig,
                    "switchViewId"                      : "SwitchView",
                    "fuelEfficiencyData"                : this._cached_fuelEfficiencyData,
                    "umpButtonConfig" : this._umpButtonConfigEcoStatus,
                    "defaultSelectCallback" : this._umpDefaultSelectCallback.bind(this),
                    "defaultSlideCallback" : null,
                    "defaultHoldStartCallback" : null,
                    "defaultHoldStopCallback" : null,
                    "dataList" : null,
                    "umpStyle" : "fullWidth",
                    "hasScrubber" : false,
					"vehicleType":framework.getSharedData("syssettings","VehicleType"),
                }
            }, // end of list of controlProperties
         
            "contextInFunction"         : contextInCbControlSts,
            "readyFunction"             : readyCbControlSts,
            "noLongerDisplayedFunction" : noLongerDisplayedCbControlSts
        }, // end of "EcoStatus"
        
        "EnergyFlow"             : {
            "template"                  : "EcoFlowTmplt",
            "templatePath"              : "apps/ecoenergy/templates/EcoFlow",
            "sbNameId"                  : "driveMonitor",
            "controlProperties"     : {
                "EcoFlowCtrl"     : {
                    /* Control configuration independent of control style --
                     * see the "contextInFunction" handler for further
                     * configuration that depends on control style (passed-in
                     * as "equipped" parameter on context change payload)
                     */
                    "subMap"                            : this._subMap,
                    "selectCallback"                    : selectCb,
                    "ecoFlowTitleId"             		: "energyFlow",
                    "driveDistanceTitleId"              : "cumulativeEV",
                    "batteryLabelId"              		: "batteryId",
                    "engineLabelId"              		: "engineId",
                    "motorLabelId"              		: "motorId",
                    "driveDistanceObj"                  : this._driveDistance,
                    "ecoHEVConfig"                      : this._ecoHEVConfig,
                    "umpButtonConfig" : this._umpButtonConfigEcoEffect,
                    "defaultSelectCallback" : this._umpDefaultSelectCallback.bind(this),
                    "defaultSlideCallback" : null,
                    "defaultHoldStartCallback" : null,
                    "defaultHoldStopCallback" : null,
                    "dataList" : null,
                    "umpStyle" : "fullWidth",
                    "hasScrubber" : false,
                }
            }, // end of list of controlProperties
        "contextInFunction"         : contextInCbFlowSts,
        "readyFunction"             : readyCbFlowSts
        }, // end of "EcoFlow"
        
        "Effectiveness" : {
            "template" : "EcoEffectTmplt",
            "templatePath": "apps/ecoenergy/templates/EcoEffect",
            "sbNameId" : "SbnTitleId",
            "controlProperties"     : {
                "EcoEffectCtrl"     : {
                    /*
                     * Control configuration independent of control style -- see
                     * the "contextInFunction" handler for further configuration
                     * that depends on control style (passed-in as "equipped"
                     * parameter on context change payload)
                     */
                    "subMap"                            : this._subMap,
                    "selectCallback"                    : selectCb,
                    "mode"                              : "live",
                    "iStopConfig" : 
                    {
                        iStopTitleId                    : "iStopOnTitle",
                        actuationTimeTitleId            : "iStopOn",
                        stopTimeTitleId                 : "StopTimeTitle",
                        totalTimeTitleId                  : "TotalTimeTitle",
                        iStopRangeBoostedId                : "iStopBoost",
                        iStopRangeBoostUnitId           : "--",  
                        actuationTimeValue              : "--", // default value
                        stopTimeValue                   : "--", // default value
                        totalTimeValue                  : "--" // default value
                    },
                                     
                    "umpButtonConfig" : this._umpButtonConfigEcoEffect,
                    "defaultSelectCallback" : this._umpDefaultSelectCallback.bind(this),
                    "defaultSlideCallback" : null,
                    "defaultHoldStartCallback" : null,
                    "defaultHoldStopCallback" : null,
                    "dataList" : null,
                    "umpStyle" : "fullWidth",
                    "hasScrubber" : false,
                }
            }, // end of list of controlProperties
            "contextInFunction"         : contextInCbEffectiveness,
            "readyFunction"             : readyCbEffectiveness,
            "noLongerDisplayedFunction" : noLongerDisplayedCbEffectiveness
        }, // end of "Effectiveness"
        "FuelConsumption" :
        {
            "template"              : "FuelConsumptionTmplt",
            "templatePath"          : "apps/ecoenergy/templates/FuelConsumption",
            "sbNameId"              : "SbnTitleId",
            "controlProperties" :
            {
                "FuelConsumptionCtrl" : 
                {
                    "subMap"                    : this._subMap,
                    "switchViewLabelId"         : "SwitchView",
                    "ctrlStyle"					: "ecostyle",
                    "switchViewButtonCallback"  : selectCb,
                    "fuelEfficiencyTitleId"     : "Average",
                    "fuelEfficiencyTypeId"      : "ThisDrive",
                    "xAxisLabelMinuteId"        : "ElapsedTimeInMin",
                    "oneDriveTextId"			: "OneDrv",
                    "evDistanceTextId"			: "EVDistn",
                    "whUnitId"					: "Wh",
                    "fuelEfficiencyData"        : {"fuelEfficiency" : this._cached_currentCFERBarValue, 
                                                    "fuelEfficiencyUnit" : this._cached_currentCumFuelUnit},
                    "currentFuelConfig"         : this._currentFuelConfig,
                    "cumulativeFuelConfig"      : this._cumulativeFuelConfig,
                    "umpButtonConfig" : this._umpButtonConfigFuel,
                    "defaultSelectCallback" : this._umpDefaultSelectCallback.bind(this),
                    "defaultSlideCallback" : null,
                    "defaultHoldStartCallback" : null,
                    "defaultHoldStopCallback" : null,
                    "dataList" : null,
                    "umpStyle" : "fullWidth",
                    "hasScrubber" : false,
                }
            }, // end of list of controlProperties
            "readyFunction"             : readyCbFuelConsumption,
            "contextInFunction"         : contextInCbFuelConsumption
        }, // end of "FuelConsumption"

        "HEVFuelConsumption" :
        {
            "template"              : "FuelConsumptionTmplt",
            "templatePath"          : "apps/ecoenergy/templates/FuelConsumption",
            "sbNameId"              : "driveMonitor",
            "controlProperties" :
            {
                "FuelConsumptionCtrl" : 
                {
                    "subMap"                    : this._subMap,
                    "switchViewLabelId"         : "SwitchView",
                    "ctrlStyle"					: "hevstyle",
                    "switchViewButtonCallback"  : selectCb,
                    "fuelEfficiencyTitleId"     : "HEVAverage",
                    "fuelEfficiencyTypeId"      : "HEVThisDrive",
                    "xAxisLabelMinuteId"        : "ElapsedTimeInMin",
                    "oneDriveTextId"			: "OneDrv",
                    "evDistanceTextId"			: "EVDistn",
                    "whUnitId"					: "Wh",
                    "fuelEfficiencyData"        : {"fuelEfficiency" : this._cached_currentCFERBarValue, 
                                                    "fuelEfficiencyUnit" : this._cached_currentCumFuelUnit},
                    "currentFuelConfig"         : this._currentFuelConfig,
                    "cumulativeFuelConfig"      : this._cumulativeFuelConfig,
                    "umpButtonConfig" : this._umpButtonConfigFuel,
                    "defaultSelectCallback" : this._umpDefaultSelectCallback.bind(this),
                    "defaultSlideCallback" : null,
                    "defaultHoldStartCallback" : null,
                    "defaultHoldStopCallback" : null,
                    "dataList" : null,
                    "umpStyle" : "fullWidth",
                    "hasScrubber" : false,
                }
            }, // end of list of controlProperties
            "readyFunction"             : readyCbHEVFuelConsumption,
            "contextInFunction"         : contextInCbHEVFuelConsumption
        }, // end of "FuelConsumption"
        
        "EndingHEV" :
        {
            "template"              : "FuelConsumptionTmplt",
            "templatePath"          : "apps/ecoenergy/templates/FuelConsumption",
            "sbNameId"              : "driveMonitor",
            "hideHomeBtn"           : true, 
            "controlProperties" :
            {
                "FuelConsumptionCtrl" : 
                {
                    "subMap"                    : this._subMap,
                    "switchViewLabelId"         : "SwitchView",
                    "ctrlStyle"					: "hevstyle",
                    "mode"                      : 'ending',
                    "switchViewButtonCallback"  : selectCb,
                    "fuelEfficiencyTitleId"     : "HEVAverage",
                    "fuelEfficiencyTypeId"      : "HEVThisDrive",
                    "xAxisLabelMinuteId"        : "ElapsedTimeInMin",
                    "oneDriveTextId"			: "OneDrv",
                    "evDistanceTextId"			: "EVDistn",
                    "whUnitId"					: "Wh",
                    "fuelEfficiencyData"        : {"fuelEfficiency" : this._cached_currentCFERBarValue, 
                                                    "fuelEfficiencyUnit" : this._cached_currentCumFuelUnit},
                    "currentFuelConfig"         : this._currentFuelConfig,
                    "cumulativeFuelConfig"      : this._cumulativeFuelConfig,
                    "umpButtonConfig" : this._umpButtonConfigFuel,
                    "defaultSelectCallback" : this._umpDefaultSelectCallback.bind(this),
                    "defaultSlideCallback" : null,
                    "defaultHoldStartCallback" : null,
                    "defaultHoldStopCallback" : null,
                    "dataList" : null,
                    "umpStyle" : "fullWidth",
                    "hasScrubber" : false,
                }
            }, // end of list of controlProperties
            "readyFunction"             : readyCbHEVFuelConsumptionEnding,
            "contextInFunction"         : contextInCbHEVFuelConsumptionEnding
        }, // end of "HEV FuelConsumption Ending"
        
       //Start of "Setting Context"
        "Settings" :
        {
            "template"                  : "List2Tmplt",
            "sbNameId"                  : "SbnTitleId",
            "leftBtnStyle"              : "goBack",
            "controlProperties"         : 
            {
                "List2Ctrl"             :
                {
                    "dataList"          : this._ecoenergySettingList,
                    titleConfiguration  :'listTitle',
                    title               : 
                    {
                          text1Id   :"Settings",
                          titleStyle:'style02'
                    },
                    "selectCallback" : this._listItemClickCallback.bind(this)
                }
            },
            "readyFunction" : readyEcoSettings,
            "contextInFunction"         : contextInEcoSettingscreen
        },//end of Setting context

		"ResetConfirm" :
		{
			"template"            : "Dialog3Tmplt",
            "sbNameId"            : "SbnTitleId",
            "leftBtnStyle"        : "goBack",
            "controlProperties"   :
            {
                "Dialog3Ctrl"     :
                {
                    "defaultSelectCallback" : this._dialogCtrlClickCallback.bind(this),
                    "contentStyle"          : "style02",
                    "fullScreen"            : false,
                    "buttonCount"           : 2,
                    "buttonConfig" : 
                    {
                        "button1"  :
                        {
                            labelId  : "Back",
                            appData : "Global.Cancel",
                            disabled : false
                        },
                        "button2"  : 
                        {
                            labelId  : "ConfirmBtn",
                            appData  : "Confirm",
                            disabled : false
                        },
                    }, // end of buttonConfig
                    "text1Id"        : "ResetConfirm",
                 } // end of properties for "Dialog3Ctrl"
            }, // end of list of controlProperties
            "readyFunction"          : readyResetConfirm,
            "contextInFunction"      : contextInResetConfirmScreen
        },//end of ResetConfirm context  

      //Start of "ResetRetry Context"
        "ResetRetry" :
        { 
            "template"            : "Dialog3Tmplt",
            "sbNameId"            : "SbnTitleId",
            "leftBtnStyle"        : "goBack",
            "controlProperties"   :
            {
                "Dialog3Ctrl"     :
                {
                    "defaultSelectCallback" : this._dialogCtrlClickCallback.bind(this),
                    "contentStyle"          : "style02",
                    "fullScreen"            : false,
                    "buttonCount"           : 2,
                    "buttonConfig" : 
                    {
                        "button1"  :
                        {
                            labelId  : "CancelBtn",
                            appData : "Global.Cancel",
                            disabled : false
                        },
                        "button2"  : 
                        {
                            labelId  : "RetryBtn",
                            appData  : "Retry",
                            disabled : false
                        },
                    }, // end of buttonConfig
                    "text1Id"        : "ResetUnsuccessful",
                 } // end of properties for "Dialog3Ctrl"
            }, // end of list of controlProperties
            "readyFunction"          : readyResetRetry,
            "contextInFunction"      : contextInResetRetryScreen
        },//end of ResetDialoge context   
        
        
      //Start of "Ending Fuel Consumption Context"
        "EndingFuelConsumption" :
        {
            "template"              : "FuelConsumptionTmplt",
            "templatePath"          : "apps/ecoenergy/templates/FuelConsumption",
            "sbNameId"              : "SbnTitleId",
            "hideHomeBtn"           : true, 
            "controlProperties" :
            {
                "FuelConsumptionCtrl" : 
                {
                    "subMap"                    : this._subMap,
                    "switchViewLabelId"         : "SwitchView",
                    "switchViewButtonCallback"  : selectCb,
                    "mode"                      : 'ending',
                    "xAxisLabelMinuteId"        : "ElapsedTimeInMin",
                    "fuelEfficiencyTitleId"     : "Average",
                    "fuelEfficiencyTypeId"      : "ThisDrive",
					"xAxisLabelMinuteId"        : "ElapsedTimeInMin",
                    "fuelEfficiencyData"        : {"fuelEfficiency" : this._cached_currentCFERBarValue, 
                                                   "fuelEfficiencyUnit" : this._globalUnit},
                    "currentFuelConfig"         : this._currentFuelConfig,
                    "cumulativeFuelConfig"      : this._cumulativeFuelConfig,
                    "umpButtonConfig" : this._umpButtonConfigFuel,
                    "defaultSelectCallback" : this._umpDefaultSelectCallback.bind(this),
                    "defaultSlideCallback" : null,
                    "defaultHoldStartCallback" : null,
                    "defaultHoldStopCallback" : null,
                    "dataList" : null,
                    "umpStyle" : "fullWidth",
                    "hasScrubber" : false,
                }
            }, 
            "readyFunction"             : readyCbFuelConsumptionEnding,
            "contextInFunction"         : contextInCbFuelConsumptionEnding
        },//end of Ending Fuel Consumption context   
        
      //Start of "Ending Eco Effect Context"
        "EndingEffectiveness" :
        {
            "template" : "EcoEffectTmplt",
            "templatePath": "apps/ecoenergy/templates/EcoEffect",
            "sbNameId" : "SbnTitleId",
            "hideHomeBtn"           : true, 
            "controlProperties"     : {
                "EcoEffectCtrl"     : {
                    /*
                     * Control configuration independent of control style -- see
                     * the "contextInFunction" handler for further configuration
                     * that depends on control style (passed-in as "equipped"
                     * parameter on context change payload)
                     */
                    "subMap"                            : this._subMap,
                    "selectCallback"                    : selectCb,
                    "switchViewId"                      : "SwitchView",
                    "mode"                              : 'ending',
                    "iStopConfig" :
                    {
                        iStopTitleId                    : "iStopOnTitle",
                        actuationTimeTitleId            : "iStopOn",
                        stopTimeTitleId                 : "StopTimeTitle",
                        totalTimeTitleId                  : "TotalTimeTitle",
                        iStopRangeBoostedId                : "iStopBoost",
                        iStopRangeBoostUnitId           : "Km",  
                    },
                                     
                    "umpButtonConfig" : this._umpButtonConfigEcoEffect,
                    "defaultSelectCallback" : this._umpDefaultSelectCallback.bind(this),
                    "defaultSlideCallback" : null,
                    "defaultHoldStartCallback" : null,
                    "defaultHoldStopCallback" : null,
                    "dataList" : null,
                    "umpStyle" : "fullWidth",
                    "hasScrubber" : false,
                }
            },
            "contextInFunction"         : contextInCbEffectivenessEnding,
            "readyFunction"             : readyCbEffectivenessEnding
        },//end of EndingEffectiveness context   
        
        
        
      //Start of "SettingsRetry Context"
        "SettingsRetry" :
        { 
            "template"             : "Dialog3Tmplt",
            "sbNameId"             : "SbnTitleId",
            "leftBtnStyle"         : "goBack",
            "controlProperties"    : 
            {
                "Dialog3Ctrl"      : 
                {
                    "defaultSelectCallback" : this._dialogCtrlSettingRetryClickCallback.bind(this),
                    "contentStyle"          : "style02",
                    "fullScreen"            : false,
                    "buttonConfig" : 
                    {
                        "button1"  :
                        {
                            labelId: "CancelBtn",
                            appData : "Global.Cancel",
                            disabled : false
                        },
                        "button2"  :
                        {
                            labelId: "RetryBtn",
                            appData : "Retry",
                            disabled : false
                        },
                    }, // end of buttonConfig
                    "text1Id" : "SettingsRetryMsg",
                 } // end of properties for "Dialog3Ctrl"
            }, // end of dialog of controlProperties
            "contextInFunction"         : contextInSettingsRetry,
            "readyFunction"             : readySettingsRetry
        },//end of settingsretry context  
		
		"Loading" : 
		{
            "template" : "Dialog3Tmplt",
            "sbNameId" : "SbnTitleId" , 
            "controlProperties" : {
                "Dialog3Ctrl" : {
				"defaultSelectCallback" : this._dialogCtrlLoadingClickCallback.bind(this),
                "buttonCount" : 1,
                    "buttonConfig" : {
                        "button1" : {                            
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",                        
                            labelId: "common.ApplicationsMenu",                           
							subMap : null,
                            appData : "SelectApplications",
                            disabled : false
                        },                       
                    }, // end of buttonConfig						
                    "contentStyle" : "style14",
                    "fullScreen" : false,                  
                   // "text1Id" : "LoadEEM",
                    "text1SubMap" : null,
                    "meter" : {"meterType":"indeterminate", "meterPath":"common/images/IndeterminateMeter.png"}
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._LoadingCtxtTmpltReadyToDisplay.bind(this),  
            "contextInFunction" : null, 
            "displayedFunction" : null
        }, // end of "Loading"
		"EcoPreparing" : 
		{
            "sbNameId": "SbnTitleId",
			"template" : "EmNaviBlackTmplt",
            "templatePath": "apps/emnavi/templates/EmNaviBlack",
			"readyFunction" : this._EcoPreparingCtxtTmpltReadyToDisplay.bind(this),	
		}, // end of "Blank"
}; // end of this.contextTable object
    //@formatter:on if(msg && msg.params && msg.params.payload){// Null Check
    this._messageTable = 
    {
		"FuelType"               :   this._setFuelTypeMessageHandler.bind(this),
        //Common Handlers
        "CurrAvgDriveFuelEco"               :   this._setFuelEfficiencyMessageHandler.bind(this),
        "CurrEquippedFeature"               :   this._setCurrEquippedFeatureMessageHandler.bind(this),

        //Handlers for ControlStatus context
        "iStopModeCntrlStatus"              :   this._setIStopModeMessageHandler.bind(this),
        "iStopErrorCntrlStatus"             :   this._setIStopErrorMessageHandler.bind(this),
        "iStopStatCntrlStatus"              :   this._setIStopStatusMessageHandler.bind(this),
        "iELoopCntrlStatus"                 :   this._setIEloopDataMessageHandler.bind(this),
        "iStopTimeCntrlStatus"              :   this._setIStopTotalMessageHandler.bind(this),

        //Handlers for Effectiveness context
        "iStopEffectiveRate"                :   this._setiStopEffectiveRateMsgHandler.bind(this),
        "iStopEffectiveTimeData"            :   this._setiStopTimeMsgHandler.bind(this),
        "iELoopEffectiveData"               :   this._setiEloopEnergyMsgHandler.bind(this),
        "CO2Reduction"                      :   this._setCO2MsgHandler.bind(this),
        "iELoopEffectiveRate"               :   this._setiEloopEffectiveRateMsgHandler.bind(this),
        "TreeData"                          :   this._setTreeDataMsgHandler.bind(this),
        "TotalSavedDistance"                :   this._setBoostRangeHandler.bind(this),

        //Handlers for Fuel Consumption
        "CurrDrvEcoPerInstBarGraph"         :   this._currDrvEcoPerInstBarGraphMessageHandler.bind(this),
        "CumFuelResetEcoGraphData"          :   this._cumFuelResetEcoGraphDataMessageHandler.bind(this),
        "NewCurrDrvEcoPerInstBarGraph"      :   this._newCurrDrvEcoPerInstBarGraphMessageHandler.bind(this),
        "CumulativeAvgFuelEconomy"          :   this._currAvgDriveFuelEcoMessageHandler.bind(this),
        "NewCurrFuelResetEcoGraphData"      :   this._newCurrFuelResetEcoGraphDataMessageHandler.bind(this),
        
        //Handler for Reset failure SBN
        "ResetButtonEnabled"                :   this._resetIconMessageHandler.bind(this),
        "ResetSuccess"                      :   this._resetSuccessMessageHandler.bind(this),
        "SetSyncStatusAndTripA"             :   this._setSyncStatusAndTripA.bind(this),
		"IgnitionStatus"                    :   this._resetTripAHandler.bind(this),
        
        //Speed Threshold Messages
        "Global.AtSpeed"                      : this._AtSpeedMsgHandler.bind(this),
        "Global.NoSpeed"                      : this._NoSpeedMsgHandler.bind(this),
        
        //HEV Messages
        "HEVInitialGraphData"				 : this._initialHEVGraphData.bind(this),
        "HEVInsertNewGraphData"              : this._newHEVBarData.bind(this),
        "RandomEcoFlowPattern"				 : this._ecoFlowPatternHandler.bind(this),
        "BatteryLevelHev"					 : this._ecoHEVBatteryLevelHandler.bind(this),
        "HEVTireRotation"					 : this._tireRotationHandler.bind(this),
        
        // MMUI HEV Messages 
        "CurrDrvHevPerInstBarGraph"          : this._initialHEVGraphData.bind(this),
        "NewCurrDrvHevPerInstBarGraph"       : this._newHEVBarData.bind(this),
        
        "CummEVDriveDist"                    : this._evDriveDistanceHandler.bind(this),
        "HEVOneDriveEvDistance"              : this._evOneDriveDistanceHandler.bind(this),
        "HEVEnergyFlowSignals"               : this._hevFlowPatternHandler.bind(this),
		
		// Control status Message
		"ControlStsTireStatus"               : this._controlStsTireStatusHandler.bind(this),
     };
};

/*****************/
/* App Functions */
/*****************/

// loading In Process Context
ecoenergyApp.prototype._LoadingCtxtTmpltReadyToDisplay = function()
{
     this._flag = true;
	 var sbNameId;
	 var text1Id;
	 
	 if(this._cached_FuelType==1)
	 {
		text1Id = "LoadEEMHEV";
		sbNameId = "driveMonitor";
		
	 }
	 else
	 {
		text1Id = "LoadEEM";
		sbNameId = "SbnTitleId";
	 }
	 
	this._currentContextTemplate.dialog3Ctrl.setText1Id(text1Id);
	framework.common.setSbNameId(this.uiaId, sbNameId); 
	 
};
ecoenergyApp.prototype._EcoPreparingCtxtTmpltReadyToDisplay = function()
{
	 var sbNameId;
	
	 if(this._feature=="HEV")
	 {
		sbNameId = "driveMonitor";	
	 }
	 else
	 {
		sbNameId = "SbnTitleId";
	 }
	framework.common.setSbNameId(this.uiaId, sbNameId); 
};

	

ecoenergyApp.prototype._initialHEVGraphData = function(msg)
{
	log.debug('_initialHEVGraphData called');
	 var  cachedEconomyData = msg.params.payload.CurrDrvFuelHev_BarGraph.EEM_BarGraph_SixtyMinute;
	    if (cachedEconomyData)
	    {
	        for(var value = 0;value<cachedEconomyData.length;value++)
	        {
	            var temp = (cachedEconomyData[value].HEV_Drv1AvlFuelE) * this._multiplicationFactor;
	            this._cached_initialCDFEBarValues[value] = parseFloat((parseFloat(temp)).toFixed(1));
	            
	            this._cached_initialDiscValues[value] = cachedEconomyData[value].HEV_Discs;
	            this._initialEvMode[value] = cachedEconomyData[value].HEV_EVmodeGreen;
	            this._cached_initialHalfDiscsValue[value] = cachedEconomyData[value].HEV_HalfDisc;
	        }
	    }
	 
	    if (this._currentContextTemplate && this._currentContext && (this._currentContext.ctxtId    ===    "HEVFuelConsumption"))
	    {
	        // Update the control to initialize the historical data in the CDFE graph
	        this._initializeHEVCurrentDriveFuelGraph();
	    }   
}
ecoenergyApp.prototype._newHEVBarData = function(msg)
{
	log.debug('_newHEVBarData called');
	 var  cachedEconomyData = msg.params.payload.CurrDrvFuelHevBar_singleReading.EEM_BarGraph_OneMinute;
	 if (cachedEconomyData)
	 {
	        for(var value = 0; value<cachedEconomyData.length;value++)
	        {
	            var temp = (cachedEconomyData[value].HEV_Drv1AvlFuelE) * this._multiplicationFactor;
	            this._cached_currentCDFEBarValue[value] = parseFloat((parseFloat(temp)).toFixed(1));
	            
	            this._cached_currentDiscValue[value] = cachedEconomyData[value].HEV_Discs;
	            this._currentEvMode[value] = cachedEconomyData[value].HEV_EVmodeGreen;
	            this._cached_halfDiscsValue[value] = cachedEconomyData[value].HEV_HalfDisc;
	        }
	    }
	    this._cached_initialCDFEBarValues = this._updateInitialBarValuesCurrentDrive(this._cached_currentCDFEBarValue, this._cached_initialCDFEBarValues);
		this._cached_initialDiscValues = this._updateInitialBarValuesCurrentDrive(this._cached_currentDiscValue, this._cached_initialDiscValues);
		this._initialEvMode = this._updateInitialBarValuesCurrentDrive(this._currentEvMode, this._initialEvMode);
		this._cached_initialHalfDiscsValue = this._updateInitialBarValuesCurrentDrive(this._cached_halfDiscsValue, this._cached_initialHalfDiscsValue);
	    this._newBarGraphReady = true;
	    // Make sure we're active (all contexts)
	    if (this._currentContextTemplate && (this._currentContext.ctxtId    ===    "HEVFuelConsumption"))
	    {
	        // Update the control to insert new historical data into the CDFE graph
	        this._insertHEVCurrentDriveFuelGraph();
	    }
}


ecoenergyApp.prototype._evDriveDistanceHandler = function(msg)
{
	
	if(msg && msg.params.payload)
	{
		 var distance = msg.params.payload.Cumm_EV_Drive_Dist.cummEVDrvDistance;
		 var unit = this._getUnitId(msg.params.payload.Cumm_EV_Drive_Dist.dist_unit);
		 var percent = msg.params.payload.Cumm_EV_Drive_Dist.totRatio;
		 this._cachedEvDriveDistance = new Object();
		 if (distance >= this._INVALID_RANGE_EvDriveDistance)
	     {
			 this._cachedEvDriveDistance.driveDistance = null;
	     }
	     else
	     {
	    	 this._cachedEvDriveDistance.driveDistance = (Math.round(distance) / 10).toFixed(1);
	     }
		
		 if(percent >= 255)
		 {
			 this._cachedEvDriveDistance.percentValue = null;
		 }
		 else
		 {
			 this._cachedEvDriveDistance.percentValue = percent;
		 }
		
		this._cachedEvDriveDistance.unitId = unit;
		
		this._updateEvDistance();
	}
}

ecoenergyApp.prototype._updateEvDistance = function()
{
	 if (this._currentContextTemplate && (this._currentContext.ctxtId    ===    "EnergyFlow"))
	 {
        // Update the control to update the EV drive distance 
	 	this._currentContextTemplate.ecoFlowCtrl.setEvDrvDistance(this._cachedEvDriveDistance);
	 }
}

ecoenergyApp.prototype._evOneDriveDistanceHandler = function(msg)
{
	if(msg && msg.params.payload)
	{
		
		var tempDis = msg.params.payload.OneDriveEvDistance.OneDriveEVDistance;
		var unit = this._getUnitId(msg.params.payload.OneDriveEvDistance.dist_unit);
		var percent = msg.params.payload.OneDriveEvDistance.oneDriveRatio;
		this._cachedOneDriveDistance = new Object();
		
		 if (tempDis >= this._INVALID_RANGE_EvOneDriveDistance)
	     {
			 this._cachedOneDriveDistance.driveDistance = null;
	     }
	     else
	     {
	        	this._cachedOneDriveDistance.driveDistance = (Math.round(tempDis) / 10).toFixed(1);
	     }
		
		 if(percent >= 255)
		 {
			 this._cachedOneDriveDistance.percentValue = null;
		 }
		 else
		 {
			 this._cachedOneDriveDistance.percentValue = percent;
		 }
		this._cachedOneDriveDistance.unitId = unit;
				
		this._updateOneDriveDistance();
	}
}

ecoenergyApp.prototype._updateOneDriveDistance = function()
{
	 if (this._currentContextTemplate && (this._currentContext.ctxtId    ===    "HEVFuelConsumption" || this._currentContext.ctxtId    ===    "EndingHEV"))
	 {
	        // Update the control to update the EV drive distance 
		 	this._currentContextTemplate.fuelConsumptionCtrl.setEvDrvDistance(this._cachedOneDriveDistance);
	 }
}

ecoenergyApp.prototype._hevFlowPatternHandler = function(msg)
{
	if(msg && msg.params && msg.params.payload)
	{
		this._mapHEVSignalFlowData(msg.params.payload.EnergyFlowSignals);
		this._updateEcoFlowPattern();
	}
}

ecoenergyApp.prototype._updateEcoFlowPattern = function()
{
	if(this._currentContextTemplate  && this._currentContext.ctxtId === "EnergyFlow" && this._ecoHEVConfig)
	{
		this._currentContextTemplate.ecoFlowCtrl.setHEVConfig(this._ecoHEVConfig);
	}
}

ecoenergyApp.prototype._ecoFlowPatternHandler = function(msg)
{
	if(msg && msg.params && msg.params.payload)
	{
		if(this._currentContextTemplate)
		{
			this._currentContextTemplate.ecoFlowCtrl.setHEVConfig(msg.params.payload.Eco_Flow_Pattern);
		}
	}
}

ecoenergyApp.prototype._ecoHEVBatteryLevelHandler = function(msg)
{
	
	
	if(msg && msg.params && msg.params.payload)
	{
		var level = msg.params.payload.BatteryLevel;
		 
		switch (level) {
		case 'LEVEL_INVALID':
			 this._cachedHEVBattLevel = 0;
			break;
		case 'LEVEL0':
			 this._cachedHEVBattLevel = 1;
			break;	
		case 'LEVEL1':
			 this._cachedHEVBattLevel = 2;
			break;
		case 'LEVEL2':
			 this._cachedHEVBattLevel = 3;
			break;
		case 'LEVEL3':
			 this._cachedHEVBattLevel = 4;
			break;	
		case 'LEVEL4':
			 this._cachedHEVBattLevel = 5;
			 break;
		case 'LEVEL5':
			 this._cachedHEVBattLevel = 6;
			 break;
		case 'LEVEL6':
			 this._cachedHEVBattLevel = 7;
			 break;
		case 'LEVEL7':
			 this._cachedHEVBattLevel = 8;	
			break;
		}
		
		this._updateHEVBatteryLevel();
	}
	
}

ecoenergyApp.prototype._updateHEVBatteryLevel = function()
{
	if(this._currentContextTemplate && this._currentContext.ctxtId === "EnergyFlow")
	{
		this._currentContextTemplate.ecoFlowCtrl.setBatteryLevel(this._cachedHEVBattLevel);
	}
}

ecoenergyApp.prototype._tireRotationHandler = function(msg)
{
	if(msg && msg.params && msg.params.payload)
	{
		if(this._currentContextTemplate)
		{
			this._currentContextTemplate.ecoFlowCtrl.setTireRotation(msg.params.payload.isReverse);
		}
	}
}

ecoenergyApp.prototype._controlStsTireStatusHandler = function(msg)
{
	if(msg && msg.params && msg.params.payload)
	{			
			this._tireStatus = msg.params.payload.TireStatus;
			this._reverseValue = msg.params.payload.TireStatus.rvrseLmpReq;
			this._vehSpeed = msg.params.payload.TireStatus.vehSpeed;
			if(this._currentContextTemplate && this._currentContextTemplate.ecoStatusCtrl)
			{
				this._currentContextTemplate.ecoStatusCtrl.startTyreRotation(this._reverseValue,this._vehSpeed);		
			}
			
	}
}

/***********  ControlStatus App Functions Starts***********/
ecoenergyApp.prototype._controlStatusContextIn = function(context)
{
    /* 
     * This is a callback function called when we come to ControlStatus Context.
     * Context argument will be the original context change message from MMUI 
     */
	 

	 
    log.debug("ECOENERGYGUI: ControlStatusContextIn() called...");
    
    // Validate the control style
    if ((this._equippedCtrlStyle         !== "iEloopiStop")
            && (this._equippedCtrlStyle     !== "iEloopOnly")
                && (this._equippedCtrlStyle     !== "iStopOnly")) 
    {
        log.warn("Unknown EcoStatus control style received -- defaulting to iEloopiStop");
        this._equippedCtrlStyle = "iEloopiStop";
    }


	this._contextTable['ControlStatus'].controlProperties.EcoStatusCtrl.vehicleType = framework.getSharedData("syssettings","VehicleType");

    /* Set up remaining properties that depend on the control style */
    this._contextTable['ControlStatus'].controlProperties.EcoStatusCtrl.ctrlStyle           = 
            this._equippedCtrlStyle;

    this._contextTable['ControlStatus'].controlProperties.EcoStatusCtrl.iEloopConfig        = 
        (this._equippedCtrlStyle !== "iStopOnly") ? this._cached_iEloopConfig
            : null;

    this._contextTable['ControlStatus'].controlProperties.EcoStatusCtrl.iEloopData          =
        (this._equippedCtrlStyle !== "iStopOnly") ? this._cached_iEloopData
            : null;

    this._contextTable['ControlStatus'].controlProperties.EcoStatusCtrl.iStopConfig         =
        (this._equippedCtrlStyle !== "iEloopOnly") ? this._cached_iStopConfig
            : null;

    this._contextTable['ControlStatus'].controlProperties.EcoStatusCtrl.iStopData           =
        (this._equippedCtrlStyle !== "iEloopOnly") ? this._cached_iStopData
            : null;
    
    if(this._isUmpPanelOpen)
    {
        this._isEcoContext = true; 
    }
	
};

ecoenergyApp.prototype._controlStatusReady = function()
{
    /* 
     * This is a callback function called just before ControlStatus Context.
     */
    log.debug("_ecoenergyReady() called...");
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId ==="ControlStatus")
    {
        this._currentControl = this._currentContextTemplate.ecoStatusCtrl;
		this._cachedVehicleType = framework.getSharedData("syssettings","VehicleType");
		
		//this._currentControl.setdiv(this._cachedVehicleType); /*This function is called from control - SW00156413*/
		
        if(this._globalUnit != null)
        {
        	this._cached_fuelEfficiencyData.fuelEfficiencyUnit = this._getUnitId(this._globalUnit);
        }
        //Populating Control status context with current available cached values
        this._populateControlStatusContext();
        this._togglePanel();
        this._toggleUMPButtons(this._isResetFinished);
        this._disableResetIcon(this._isResetIconDisabled);
		if(this._tireStatus)
		{
			this._currentControl.startTyreRotation(this._reverseValue,this._vehSpeed);			
		}
		
    }
};

ecoenergyApp.prototype._controlStatusNoLongerDisplayed = function()
{
    /* 
     * This is a callback function called just after ControlStatus Context disappear.
     */
};
/***********  ControlStatus App Functions Ends ***********/

/*** Ready and Context in functions for EnergyFlow Context *****/

ecoenergyApp.prototype._ecoFlowContextIn = function(context)
{
	log.debug('_ecoFlowContextIn called');
	if(this._isUmpPanelOpen)
    {
        this._isEcoContext = true; 
    }
};

ecoenergyApp.prototype._ecoFlowReady = function()
{
	log.debug('_ecoFlowReady called');
	this._currentControl = this._currentContextTemplate.ecoFlowCtrl;
	this._togglePanel();
    this._toggleUMPButtons(this._isResetFinished);
    this._currentContextTemplate.ecoFlowCtrl.setBatteryLevel(this._cachedHEVBattLevel);
    this._updateEvDistance();
    if(this._ecoHEVConfig)
    {
    	this._currentContextTemplate.ecoFlowCtrl.setHEVConfig(this._ecoHEVConfig);
    }
};

/***********  Effectiveness App Functions Starts ***********/
/* Context argument will be the original context change message from MMUI */
ecoenergyApp.prototype._effectivenessContextIn = function(context)
{
    log.debug("ECOENERGYGUI: _EffectivenessContextIn() called..");

    /* Set up remaining properties that depend on the control style */
    this._contextTable['Effectiveness'].controlProperties.EcoEffectCtrl.ctrlStyle = this._equippedCtrlStyle;
    if(this._isUmpPanelOpen)
    {
        this._isEcoContext = true;
    }

};

ecoenergyApp.prototype._effectivenessReady = function()
{
    /* 
     * This is a callback function called just before Effectiveness Context.
     */
    log.debug("_ecoenergyReady() called...");
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "Effectiveness"){
        
        this._currentControl = this._currentContextTemplate.ecoEffectCtrl;
        //Populating Effectiveness context with current available cached values
        this._populateEffectivenessContext();
        this._setTreeLvl();
        this._togglePanel();
       // Updating iStopEffRate Data on Effectiveness Context
       this._currentContextTemplate.ecoEffectCtrl
            .setiStopEffRateNoAnimation(this._cached_iStopEffectiveRate);

    }
};

ecoenergyApp.prototype._effectivenessNoLongerDisplayed = function()
{
};

/***********  Effectiveness App Functions Ends ***********/

/***********  Settings Context Functions Starts ***********/

//Eco setting screen context in function.
//msg will carry the information about ending screen support and toggle button status.
ecoenergyApp.prototype._ecoSettingContextIn = function(msg)
{
    log.debug("_ecoSettingContextIn() called...");
    //cache the info of "ending screen" and "reset" toggle button status. 
     if(msg && msg.params && msg.params.payload && msg.params.payload.settingsEnableDisable && msg.params.payload.endingScreen )
     {
         this._cachedEndingScreenToggleStatus = msg.params.payload.endingScreen;                    //Cache the status of ending screen toggle button.
         this._cachedResetToggleStatus =msg.params.payload.sync;                                    //Cache the status of reset toggle button.
         this._cachedSettingsEnableDisableStatus = msg.params.payload.settingsEnableDisable;        //Cache the data of ending screen support
         log.debug("Ending screen toggle status :: "+this._cachedEndingScreenToggleStatus +"Reset toggle status :: "+this._cachedResetToggleStatus +" Ending screen support :: "+this._cachedSettingsEnableDisableStatus);
    }
		if(this._feature=="HEV")
         {
		 
            this._contextTable['Settings'].sbNameId = "driveMonitor";
         }else
    	 {
    		this._contextTable['Settings'].sbNameId = "SbnTitleId"; 
			
    	 } 
};

/* 
 * This is a callback function called just before Setting Context.
 */
ecoenergyApp.prototype._ecoSettingsReady = function()
{
    this._atSpeedVal = framework.common.getAtSpeedValue();                                        //get the status of speed threshold from the framework.
    
    if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "Settings")
    {
        this._populateSettingList();
    }
    this._isEcoContext = false;
    this._isUmpPanelOpen = false;
};
/***********  Settings Context Functions Ends ***********/

/***********  ResetRetry context Functions start ***********/

ecoenergyApp.prototype._ecoResetRetryReady = function()
{
     log.debug("_ecoResetRetryReady  called..." );
     
};

ecoenergyApp.prototype._ecoResetRetryContextIn = function()
{
    log.debug("_ecoResetRetryContextIn  called..." );
    this._isResetFinished = false;
    if(this._feature=="HEV")
    {
       this._contextTable['ResetRetry'].sbNameId = "driveMonitor";
    }else
	 {
		this._contextTable['ResetRetry'].sbNameId = "SbnTitleId"; 
	 }
};

/***********  ResetRetry context Functions Ends ***********/

/***********  ResetConfirm context Functions start ***********/

ecoenergyApp.prototype._ecoResetConfirmContextIn = function()
{
	log.debug("_ecoResetConfirmContextIn  called..." );
    this._isResetFinished = false;
    if(this._feature=="HEV")
    {
       this._contextTable['ResetRetry'].sbNameId = "driveMonitor";
    }else
	 {
		this._contextTable['ResetRetry'].sbNameId = "SbnTitleId"; 
	 }
};

ecoenergyApp.prototype._ecoResetConfirmReady = function()
{
	log.debug("_ecoResetConfirmReady  called..." );
};

/***********  ResetConfirm context Functions Ends ***********/

/***********  SettingsRetry context Functions start ***********/
ecoenergyApp.prototype._ecoSettingsRetryContextIn = function()
{
     log.debug("_ecoSettingRetryContextIn  called..." );
     if(this._feature=="HEV")
     {
        this._contextTable['SettingsRetry'].sbNameId = "driveMonitor";
     }else
 	 {
 		this._contextTable['SettingsRetry'].sbNameId = "SbnTitleId"; 
 	 }
};

ecoenergyApp.prototype._ecoSettingsRetryReady = function()
{
     log.debug("_ecoSettingsRetryReady  called..." );
     
}; 
/***********  SettingsRetry context Functions start ***********/







/**************** Ending Screen Context Functions starts **************/

ecoenergyApp.prototype._effectivenessEndingContextIn = function(msg)
{
    log.debug("contextInCbEffectivenessEnding() called...");
     if(msg && msg.params && msg.params.payload && msg.params.payload.celebrationCriteria)
     {
             if(msg.params.payload.celebrationCriteria)
             {
                 this._contextTable['EndingEffectiveness'].sbNameId = "CelebrationMessage";
             }
     }else
	 {
/* When Celebration is OFF, Setting Title in Status Bar */
		this._contextTable['EndingEffectiveness'].sbNameId = "SbnTitleId"; 
	 }
};

ecoenergyApp.prototype._fuelConsumptionEndingContextIn = function(msg)
{
    log.debug("_fuelConsumptionEndingContextIn() called...");
     if(msg && msg.params && msg.params.payload && msg.params.payload.celebrationCriteria)
     {
         if(msg.params.payload.celebrationCriteria)
        {
        	 /* No Celebration Text For Fuel Consumption Ending */
        	 // this._contextTable['EndingFuelConsumption'].sbNameId = "CelebrationMessage";
        }
     }
	this._cumulativeFuelConfig =  this._saveUnitInformation(this._globalUnit, this._cumulativeFuelConfig);
    this._currentFuelConfig =  this._saveUnitInformation(this._globalUnit, this._currentFuelConfig);
    this._contextTable['EndingFuelConsumption'].controlProperties.FuelConsumptionCtrl.cumulativeFuelConfig = this._cumulativeFuelConfig;
    this._contextTable['EndingFuelConsumption'].controlProperties.FuelConsumptionCtrl.currentFuelConfig = this._currentFuelConfig;
};

ecoenergyApp.prototype._effectivenessEndingReady = function(msg)
{
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EndingEffectiveness"){
        
        this._currentControl = this._currentContextTemplate.ecoEffectCtrl;
        //Populating Effectiveness context with current available cached values
        this._populateEffectivenessContext();
        this._setTreeLvl();
        // Updating iStopEffRate Data on Effectiveness Context
        this._currentContextTemplate.ecoEffectCtrl
             .setiStopEffRateNoAnimation(this._cached_iStopEffectiveRate);
    }
    // start the ending timer 
    this._startEndingTimer();
};

ecoenergyApp.prototype._fuelConsumptionEndingReady = function(msg)
{
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EndingFuelConsumption")
    {
		var obj = new Object();
        obj = this._saveUnitInformation(this._globalUnit, obj);
        this._currentContextTemplate.fuelConsumptionCtrl.setUnitInformation(obj);
		
        if(this._cached_currentCDFEBarValue)
        {
            this._initializeCurrentDriveFuelGraph();
        }
        if(this._cached_initialCFERBarValues)
        {
            this._initializeCumulativeFuelGraph();
        }
        this._setFuelConsmnFuelEfficiency();
        this._currentControl = this._currentContextTemplate.fuelConsumptionCtrl;
        this._updateCurrentCumulativeFuelGraph(this._cached_fuelEfficiencyData.fuelEfficiency, this._globalUnitRange);
    }
    // start the ending
    this._startEndingTimer();
};



/***************** Ending Screen context Functions end ***************/
/*************************************************************************************************/
              /******************* Message Handlers *******************/
/************************************************************************************************/


ecoenergyApp.prototype._setIEloopDataMessageHandler = function(msg)
{
    /*
     * Handler set the i-ELOOP data.
     * (This data would normally come from MMUI)
     */
    if (msg && msg.params && msg.params.payload && msg.params.payload.iELoop_CntrlStatus)// Null Check
    {
        // Cache a copy of the passed-in data
        switch (msg.params.payload.iELoop_CntrlStatus.capacitor)
        {
            case "LVL_0":
                this._cached_iEloopData.capChgLvl = 0;
                break;
            case "LVL_1":
                this._cached_iEloopData.capChgLvl = 1;
                break;
            case "LVL_2":
                this._cached_iEloopData.capChgLvl = 2;
                break;
            case "LVL_3":
                this._cached_iEloopData.capChgLvl = 3;
                break;
            case "LVL_4":
                this._cached_iEloopData.capChgLvl = 4;
                break;
            case "LVL_5":
                this._cached_iEloopData.capChgLvl = 5;
                break;
            case "LVL_6":
                this._cached_iEloopData.capChgLvl = 6;
                break;
            default:
                log.warn("Case not matched = "+msg.params.payload.iELoop_CntrlStatus.capacitor);
                break;
        }
        
        switch (msg.params.payload.iELoop_CntrlStatus.motor_generator)
        {
            case "NO":
                this._cached_iEloopData.rgnPwrLvl = 0;
                break;
            case "LEVEL1":
                this._cached_iEloopData.rgnPwrLvl = 1;
                break;
            case "LEVEL2":
                this._cached_iEloopData.rgnPwrLvl = 2;
                break;
            case "LEVEL3":
                this._cached_iEloopData.rgnPwrLvl = 3;
                break;
            case "LEVEL4":
                this._cached_iEloopData.rgnPwrLvl = 4;
                break;
            case "LEVEL5":
                this._cached_iEloopData.rgnPwrLvl = 5;
                break;
            case "LEVEL6":
                this._cached_iEloopData.rgnPwrLvl = 6;
                break;
            case "LEVEL7":
                this._cached_iEloopData.rgnPwrLvl = 7;
                break;
            case "LEVEL8":
                this._cached_iEloopData.rgnPwrLvl = 8;
                break;
            case "LEVEL9":
                this._cached_iEloopData.rgnPwrLvl = 9;
                break;
            case "LEVEL10":
                this._cached_iEloopData.rgnPwrLvl = 10;
                break;
            default:
            	this._cached_iEloopData.rgnPwrLvl = -1;
                log.warn("Unexpected rgnPwrLvl value received value = "
                            +msg.params.payload.iELoop_CntrlStatus.motor_generator);
                break;
        }
 
        this._cached_iEloopData.electLdUsgLvl = msg.params.payload.iELoop_CntrlStatus.CapToElc_B_Actl;
       
        log.debug("setIEloopDataMessageHandler() called ");
        // Make sure we're active (all contexts)
        if (this._currentContext && this._currentContextTemplate
                && this._currentContext.ctxtId    ===    "ControlStatus")
        {
        	  // Updating iEloopData Data on ControlStatus Context
            this._currentContextTemplate.ecoStatusCtrl
                .setIEloopData(this._cached_iEloopData);
        }
    }
};

ecoenergyApp.prototype._setIStopModeMessageHandler = function(msg)
{
    /*
     * Handler the i-STOP display mode (viz. Status, Time, Error, None).
     * (This data would normally come from MMUI)
     */
    if (msg && msg.params && msg.params.payload && msg.params.payload.iStop_ModeStatus)// Null Check
    {
        // Cache a copy of the passed-in data
        switch (msg.params.payload.iStop_ModeStatus)
        {
            case "TIME":
                this._cached_iStopMode    = "Time";
                break;
            case "ERROR":
                this._cached_iStopMode  = "Error";
                break;
            case "STATUS":
                this._cached_iStopMode    = "Status";
                break;
            case "NONE":
                this._cached_iStopMode    = "None";
                break;
            default:
                log.warn("ECOENERGYGUI: iStopMode value did not matched with switch case values");
                break;
        }
        
        // Make sure we're active (all contexts)
        if (this._currentContext && this._currentContextTemplate
                && this._currentContext.ctxtId    ===    "ControlStatus")
        {
        	// Updating iStopMode Data on ControlStatus Context
        	this._currentContextTemplate.ecoStatusCtrl
            .setIStopMode(this._cached_iStopMode);
        }
    }
};



ecoenergyApp.prototype._setIStopStatusMessageHandler = function(msg)
{    
    /*
     * Handler set the i-STOP status(Ready/Not Ready, engineStatus, batteryStatus, acStatus).
     * (This data would normally come from MMUI)
     */
    if (msg && msg.params && msg.params.payload && msg.params.payload.iStop_StatCntrlStatus)// Null Check
    {
        // Cache a copy of the passed-in data if we are in correct context    
        //this._cached_iStopStatusObj.engineStatus    = (msg.params.payload.iStop_StatCntrlStatus.
        //                                                    gasolinedieselStandby.enginetypeStandy===true)?"Good":"Bad";

        //this._cached_iStopStatusObj.batteryStatus   = (msg.params.payload.iStop_StatCntrlStatus.
        //                                                    batterystandby.batteryStandby===true)?"Good":"Bad";

        //this._cached_iStopStatusObj.acStatus        = (msg.params.payload.iStop_StatCntrlStatus.
        //                                                    heaterstandby.heaterControlStandby===true)?"Good":"Bad";

        
		this._cached_iStopStatusObj.engineStatus = this._getiStopStatus(msg.params.payload.iStop_StatCntrlStatus.gasolinedieselStandby.enginetypeStandy);
		this._cached_iStopStatusObj.batteryStatus = this._getiStopStatus(msg.params.payload.iStop_StatCntrlStatus.batterystandby.batteryStandby);
		this._cached_iStopStatusObj.acStatus = this._getiStopStatus(msg.params.payload.iStop_StatCntrlStatus.heaterstandby.heaterControlStandby);
		var readySts =  msg.params.payload.iStop_StatCntrlStatus.istopStatus.istpStatus;
		if(readySts === "TRUE")
		{
			this._cached_iStopStatusObj.iStopStatusId   = "Ready";
		}
		else if(readySts === "FALSE")
		{
			this._cached_iStopStatusObj.iStopStatusId   = "NotReady";
		}	
		else
		{
			this._cached_iStopStatusObj.iStopStatusId   = readySts;
		}

		this._cached_iStopStatusObj.iStopStatusText = null;

        log.debug("setIStopStatusMessageHandler() called .... Engine = "+this._cached_iStopStatusObj.engineStatus
                +"  Battery  = "+this._cached_iStopStatusObj.batteryStatus
                        +"  AC = "+this._cached_iStopStatusObj.acStatus
                                +"Sratus = "+this._cached_iStopStatusObj.iStopStatusId);

        // Make sure we're active (all contexts)
        if (this._currentContext && this._currentContextTemplate
                && this._currentContext.ctxtId    ===    "ControlStatus")
        {
        	// Updating iStopStatus Data on ControlStatus Context
            this._currentContextTemplate.ecoStatusCtrl
                .setIStopStatus(this._cached_iStopStatusObj, null);
        }
    }
};

ecoenergyApp.prototype._setIStopErrorMessageHandler = function(msg)
{
    /*
     * Handler to set the i-STOP error data.
     * (This data would normally come from MMUI)
     */
    if (msg && msg.params && msg.params.payload)// Null Check
    {
        log.debug("setIStopErrorMessageHandler() called: "
                + msg.params.payload.iStop_ErrorCntrlStatus.istop_denied_condition);

        // Cache a copy of the passed-in data
        // get the enum from the mmui and display the messages accordingly.
       
        switch (msg.params.payload.iStop_ErrorCntrlStatus.istop_denied_condition)
        {
        case "POWER_STEERING":
            this._cached_iStopErrorObj.iStopErrorId1 = "ErrorSteering";
            this._cached_iStopErrorObj.iStopErrorId = "ErrorActivated";
            break;
        case "BRAKE":
            this._cached_iStopErrorObj.iStopErrorId1 ="ErrorBrake";
            this._cached_iStopErrorObj.iStopErrorId = "ErrorReady";
            break;
        case "SHIFT_LEVER_POSITION":
            this._cached_iStopErrorObj.iStopErrorId1 ="ErrorShift";
            this._cached_iStopErrorObj.iStopErrorId = "ErrorReady";
            break;
        case "ENGINE_RESTART_USING_KEY":
            this._cached_iStopErrorObj.iStopErrorId1 ="ErrorEngineRestart";
            this._cached_iStopErrorObj.iStopErrorId = "ErrorReady";
            break;
        case "NOT_AVAILABLE":
            this._cached_iStopErrorObj.iStopErrorId ="ErrorUnknown";
            this._cached_iStopErrorObj.iStopErrorId1 = null;
            break;
		case "STEERING_WHEEL_TO_CENTRE":
            this._cached_iStopErrorObj.iStopErrorId ="DPFissue";
            this._cached_iStopErrorObj.iStopErrorId1 = "DPFissue2";
            break;
            default:
                log.warn(" In Default Case ");
                break;
        }


        this._cached_iStopErrorObj.istopActivated               =    msg.params.payload.iStop_ErrorCntrlStatus.
                                                                    istopActivated; 
        this._cached_iStopErrorObj.istopStandbyNOtFullfilled    =    msg.params.payload.iStop_ErrorCntrlStatus.
                                                                    istopStandbyNOtFullfilled; 
        // Make sure we're active (all contexts)
        if ( this._currentContextTemplate && this._currentContext
                && this._currentContext.ctxtId    ===    "ControlStatus") 
        {
        	 // Updating iStopError Data on ControlStatus Context
            this._currentContextTemplate.ecoStatusCtrl
                .setIStopError(this._cached_iStopErrorObj, null);
        }
    }
};
ecoenergyApp.prototype._setIStopTotalMessageHandler = function(msg)
{
    /*
     * Handler to set the i-STOP vehicle life time data.
     * (This data would normally come from MMUI)
     */
    if (msg && msg.params && msg.params.payload)
    {// Null Check
        var convertToMilliSeconds = 1000; // used to convert seconds value to milliseconds as control requires it in milliseconds

        // Cache a copy of the passed-in data
        this._cached_iStopTimeObj.iStopTime         = msg.params.payload.iStop_TimeStatus.
                                                            iStop_timeIG * (convertToMilliSeconds);
        this._cached_iStopTimeObj.iStopTotalTime    = msg.params.payload.iStop_TimeStatus.
                                                            iStopTotalTime * (convertToMilliSeconds);
        log.debug("setIStopTotalMessageHandler() called: "
                + msg.params.payload.iStop_TimeStatus.iStop_timeIG + " ms");

        // Make sure we're active (all contexts)
        if (this._currentContext && this._currentContextTemplate
                && this._currentContext.ctxtId    ===    "ControlStatus")
        {
        	 // Updating iStopTime Data on ControlStatus Context
            this._currentContextTemplate.ecoStatusCtrl
                .setIStopTime(this._cached_iStopTimeObj);
        }
    }
};

/*************************  Handlers for Control Status Ends ********************************************/

/*************************  Handlers for FuelConsumption Starts ************************************/
/***************************************************************************************************/

ecoenergyApp.prototype._fuelConsumptionReady = function()
{
    
    log.debug("_fuelConsumptionReady() called...");
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "FuelConsumption")
    {
        var obj = new Object();
        obj = this._saveUnitInformation(this._globalUnit, obj);
        this._currentContextTemplate.fuelConsumptionCtrl.setUnitInformation(obj);
        if(this._cached_currentCDFEBarValue)
        {
            this._initializeCurrentDriveFuelGraph();
        }
        if(this._cached_initialCFERBarValues)
        {
            this._initializeCumulativeFuelGraph();
        }
        this._setFuelConsmnFuelEfficiency();
        this._currentControl = this._currentContextTemplate.fuelConsumptionCtrl;
        this._togglePanel();
        this._toggleUMPButtons(this._isResetFinished);
        this._disableResetIcon(this._isResetIconDisabled);
        this._updateCurrentCumulativeFuelGraph(this._cached_fuelEfficiencyData.fuelEfficiency, this._globalUnitRange);
        
    }
}

ecoenergyApp.prototype._fuelConsumptionContextIn = function(msg)
{
    log.debug("_fuelConsumptionContextIn() called...");
    if (this._equippedCtrlStyle === "NONE")
    {
        log.warn("NONE control style received -- going to No Switch Mode of Fuel Consumption");
        this._contextTable['FuelConsumption'].controlProperties.FuelConsumptionCtrl.umpButtonConfig = this._umpButtonConfigNoSwitch; 
    }
    else
    {
        this._contextTable['FuelConsumption'].controlProperties.FuelConsumptionCtrl.umpButtonConfig = this._umpButtonConfigFuel;
    }
    this._cumulativeFuelConfig =  this._saveUnitInformation(this._globalUnit, this._cumulativeFuelConfig);
    this._currentFuelConfig =  this._saveUnitInformation(this._globalUnit, this._currentFuelConfig);
    this._contextTable['FuelConsumption'].controlProperties.FuelConsumptionCtrl.cumulativeFuelConfig = this._cumulativeFuelConfig;
    this._contextTable['FuelConsumption'].controlProperties.FuelConsumptionCtrl.currentFuelConfig = this._currentFuelConfig;
    if(this._isUmpPanelOpen)
    {
        this._isEcoContext = true; 
    }
 }


ecoenergyApp.prototype._HEVfuelConsumptionReady = function()
{
	 log.debug("_HEVfuelConsumptionReady() called...");
	 
	 var obj = new Object();
     obj = this._saveUnitInformation(this._globalUnit, obj);
     this._currentContextTemplate.fuelConsumptionCtrl.setUnitInformation(obj);
     
	 this._currentControl = this._currentContextTemplate.fuelConsumptionCtrl;
	 if(this._cached_initialDiscValues)
	 {
			this._initializeHEVCurrentDriveFuelGraph();
	 }	 
	 this._setFuelConsmnFuelEfficiency();
	 this._updateCurrentCumulativeFuelGraph(this._cached_fuelEfficiencyData.fuelEfficiency, 40);
	 this._togglePanel();
     this._toggleUMPButtons(this._isResetFinished);
     this._disableResetIcon(this._isResetIconDisabled);
     this._updateOneDriveDistance();
}

ecoenergyApp.prototype._HEVfuelConsumptionContextIn = function(msg)
{
	 log.debug("_HEVfuelConsumptionContextIn() called...");
	 if(this._isUmpPanelOpen)
	 {
	        this._isEcoContext = true; 
	 }
}

ecoenergyApp.prototype._HEVfuelConsumptionReadyEnding = function()
{
	 log.debug("_HEVfuelConsumptionReadyEnding() called...");
	 this._currentControl = this._currentContextTemplate.fuelConsumptionCtrl;
	 
	 var obj = new Object();
     obj = this._saveUnitInformation(this._globalUnit, obj);
     this._currentContextTemplate.fuelConsumptionCtrl.setUnitInformation(obj);
	 
	 if(this._cached_initialDiscValues)
	 {
			this._initializeHEVCurrentDriveFuelGraph();
	 }
	 this._setFuelConsmnFuelEfficiency();
	 this._updateOneDriveDistance();
	 this._updateCurrentCumulativeFuelGraph(this._cached_fuelEfficiencyData.fuelEfficiency, 40);
	 // start the ending
	 this._startEndingTimer();
}

ecoenergyApp.prototype._HEVfuelConsumptionContextInEnding = function(msg)
{
	 log.debug("_HEVfuelConsumptionContextInEnding() called...");
	//this._cumulativeFuelConfig =  this._saveUnitInformation(this._globalUnit, this._cumulativeFuelConfig);
    //this._currentFuelConfig =  this._saveUnitInformation(this._globalUnit, this._currentFuelConfig);
    //this._contextTable['EndingHEV'].controlProperties.FuelConsumptionCtrl.cumulativeFuelConfig = this._cumulativeFuelConfig;
    //this._contextTable['EndingHEV'].controlProperties.FuelConsumptionCtrl.currentFuelConfig = this._currentFuelConfig;
}


ecoenergyApp.prototype._currDrvEcoPerInstBarGraphMessageHandler = function(msg)
{
/*
 * Handler to initialize the Current Drive Fuel Economy Bar Graph.
 * (Values will be received from MMUI).
 */
    log.debug("CurrDrvEcoPerInstBarGraphMessageHandler() called");

    // Cache a copy of the passed-in data
    var  cachedEconomyData = msg.params.payload.CurrDrvFuelEco_BarGraph.EEM_CurDrvAvgFuelEco;
    if (cachedEconomyData)
    {
        for(var value = 0;value<cachedEconomyData.length;value++)
        {           
		    var temp = (cachedEconomyData[value].Drv1AvlFuelE)* this._multiplicationFactor; 
			this._cached_initialCDFEBarValues[value] = parseFloat(parseFloat(temp).toFixed(1));
        }
    }
    // Make sure we're active (all contexts)
    if (this._currentContext && this._currentContextTemplate
            && (this._currentContext.ctxtId    ===    "FuelConsumption" || this._currentContext.ctxtId    ===    "EndingFuelConsumption"))
    {
        // Update the control to initialize the historical data in the CDFE graph
        this._initializeCurrentDriveFuelGraph();
    }
};


ecoenergyApp.prototype._newCurrDrvEcoPerInstBarGraphMessageHandler = function(msg)
{
    /*
     * Handler to insert a new value into the Current Drive Fuel Economy bar graph.
     * (This data would normally come from MMUI)
     */
    // Cache a copy of the passed-in data
    var  cachedEconomyData = msg.params.payload.CurrDrvFuelEcoBar_singleReading.CurDrvSingleReading;
    if (cachedEconomyData)
    {
        for(var value = 0;value<cachedEconomyData.length;value++)
        {
            var temp = (cachedEconomyData[value].Drv1AvlFuelE)* this._multiplicationFactor;
			this._cached_currentCDFEBarValue[value] = parseFloat(parseFloat(temp).toFixed(1));
        }
    }
    this._cached_initialCDFEBarValues = this._updateInitialBarValuesCurrentDrive(this._cached_currentCDFEBarValue, this._cached_initialCDFEBarValues);
     this._newBarGraphReady = true;
    // Make sure we're active (all contexts)
    if (this._currentContext && this._currentContextTemplate
            && (this._currentContext.ctxtId    ===    "FuelConsumption" || this._currentContext.ctxtId    ===    "EndingFuelConsumption"))
    {
        // Update the control to insert new historical data into the CDFE graph
        this._insertCurrentDriveFuelGraph();
    }
};


ecoenergyApp.prototype._cumFuelResetEcoGraphDataMessageHandler = function(msg)
{
    /*
     * Handler to initialize the Cumulative Fuel Reset Economy Graph graph.
     * (This data would normally come from MMUI)
     */
    log.debug("cumFuelResetEcoGraphDataMessageHandler() called");

    // Cache a copy of the passed-in data
    var cachedEconomyData = msg.params.payload.CumFuelResetEcoGraph.EEM_cumAvgFuelEffAfterReset;
    var temp;
    if (cachedEconomyData)
    {
        for (var value = 0;value<cachedEconomyData.length;value++)
        {
            temp = cachedEconomyData[value].cumlAvgEfficiency;
            this._cached_initialCFERBarValues[value] = parseFloat(Math.round(temp) / 10).toFixed(1);
        }
    }

    // Make sure we're active (all contexts)
    if (this._currentContext && this._currentContextTemplate
            && (this._currentContext.ctxtId    ===    "FuelConsumption" || this._currentContext.ctxtId    ===    "EndingFuelConsumption" || this._currentContext.ctxtId    ===    "HEVFuelConsumption"))
    {
        // Update the control to initialize the historical data in the CFER graph
        this._initializeCumulativeFuelGraph();
    }
};

ecoenergyApp.prototype._currAvgDriveFuelEcoMessageHandler = function(msg)
{
    /*
     * Handler to update the "Current" bar value in the Cumulative Fuel Reset Economy graph.
     * (This data would normally come from MMUI)
     */
    // Cache a copy of the passed-in data
    
    if(msg && msg.params && msg.params.payload)
    {
        this._globalUnit = msg.params.payload.CumulativeAvgFuelEco.cumlEff_unit;
        var temp = msg.params.payload.CumulativeAvgFuelEco.cntrlstat_fuelEff.cumlAvgEfficiency;
        var unitObj = new Object();
        unitObj = this._saveUnitInformation(this._globalUnit, unitObj);
        this._globalUnitRange = unitObj.yAxisLimitValue;
       
        if (temp >= this._INVALID_RANGE)
        {
            this._cached_fuelEfficiencyData.fuelEfficiency = null;
        }
        else
        {
        	this._cached_fuelEfficiencyData.fuelEfficiency = parseFloat(Math.round(temp) / 10).toFixed(1);
        }
        this._cached_fuelEfficiencyData.fuelEfficiencyUnit = this._getUnitId(this._globalUnit);
        this._cached_currentCumFuelUnit = this._getUnitId(this._globalUnit);
        
      
    }
    // Make sure we're active (all contexts)
    if (this._currentContext && this._currentContextTemplate)
    {
        // Update the control to change the fuel efficiency
        if (this._currentContext.ctxtId  ===  "ControlStatus")
        {
        	// Updating FuelEfficiency Data on ControlStatus Context
            this._currentContextTemplate.ecoStatusCtrl
                .setFuelEfficiency(this._cached_fuelEfficiencyData);
        }
        else if ((this._currentContext.ctxtId  === "FuelConsumption") || (this._currentContext.ctxtId  === "EndingFuelConsumption")) 
        {
            this._updateCurrentCumulativeFuelGraph(this._cached_fuelEfficiencyData.fuelEfficiency, this._globalUnitRange);
        }
        else if((this._currentContext.ctxtId  === "HEVFuelConsumption") || (this._currentContext.ctxtId  === "EndingHEV"))
        {
        	this._updateCurrentCumulativeFuelGraph(this._cached_fuelEfficiencyData.fuelEfficiency, 40); // 40 is HEV unit range which is fixed.
        } 
        else
        {
            log.debug("We are not in ControlStatus or FuelConsumption context, so not populating the data");
        }
    }
};

ecoenergyApp.prototype._newCurrFuelResetEcoGraphDataMessageHandler = function(msg)
{
    /*
     * Handler to insert a new value into the Cumulative Fuel Reset Economy graph.
     * (This data would normally come from MMUI)
     */
    // Cache a copy of the passed-in data
    var temp = msg.params.payload.CurrFuelResetEcoGraph.cumlAvgEfficiency;
    this._cached_newCFERBarValue = parseFloat(Math.round(temp) / 10).toFixed(1);
    log.debug("newCurrFuelResetEcoGraphDataMessageHandler() called: currentBarValue = " 
                + this._cached_newCFERBarValue);
    this._cached_fuelEfficiencyData.fuelEfficiency = 0.0;
    this._cached_initialCFERBarValues = this._updateInitialBarValues(this._cached_newCFERBarValue, this._cached_initialCFERBarValues);
    // Make sure we're active (all contexts)
    if (this._currentContext && this._currentContextTemplate
            && (this._currentContext.ctxtId    ===    "FuelConsumption" || this._currentContext.ctxtId    ===    "EndingFuelConsumption" || this._currentContext.ctxtId    ===    "HEVFuelConsumption"))
    {
        // Update the control to insert new historical data into the CFER graph
        this._insertNewCumulativeFuelGraph();
    }
};

/*************************** Handlers for FuelConsumption Ends *******************************/


/*************************** Handlers for Effectiveness Starts *******************************/
/*********************************************************************************************/

ecoenergyApp.prototype._setCO2MsgHandler = function(msg)
{
    /*
     * Handler to set iStopTime value.
     * (This data would normally come from MMUI)
     */
    // Make sure the received msg is not null
    if (msg && msg.params && msg.params.payload)
    {// Null Check
        
        // Cache a copy of the passed-in data
        this._cachedDataResponseCO2 = msg.params.payload.CO2_Reduction.reduction_CO2;
        
        log.info("setCO2MsgHandler() called CO2 Value = "+this._cachedDataResponseCO2);
        
        // Make sure we're active (all contexts)
        if (this._currentContext && this._currentContextTemplate
                && (this._currentContext.ctxtId    ===    "Effectiveness"  || this._currentContext.ctxtId    ===    "EndingEffectiveness"))
        {
            // Update the control to change the CO2 value
            this._populateEffectivenessContext();
        }
    }
};

ecoenergyApp.prototype._setiEloopEnergyMsgHandler = function(msg)
{
        // Cache a copy of the passed-in data
    if (msg && msg.params && msg.params.payload)
    {// Null Check
        // Cache a copy of the passed-in data
        this._cached_generatedEnergy.energyValue    = msg.params.payload.iEloop_EffectiveData.effectiveness_RgnPwrTotal.RgnPwrTotal;
        this._cached_totalEnergy.energyValue        = msg.params.payload.iEloop_EffectiveData.effectiveness_ElecLoadTotal.ElecLoadTotal;
        this._cached_generatedEnergy.energyUnit     = msg.params.payload.iEloop_EffectiveData.RegnPowr_unit;
        this._cached_totalEnergy.energyUnit         = msg.params.payload.iEloop_EffectiveData.ElecLoad_unit;
        log.debug("setiEloopEnergyMsgHandler() called");
        // Make sure we're active (all contexts)
        if (this._currentContext && this._currentContextTemplate
                && (this._currentContext.ctxtId    ===    "Effectiveness" || this._currentContext.ctxtId    ===    "EndingEffectiveness"))
        {
            // Update the control to change the iEloopEnergy values
            this._populateEffectivenessContext();
        }
    }
};

ecoenergyApp.prototype._setiStopTimeMsgHandler = function(msg) {
    /*
     * Handler to set iStopTime value.
     * (This data would normally come from MMUI)
     */
    if (msg && msg.params && msg.params.payload)
    {// Null Check{
        // Cache a copy of the passed-in data on effectiveness context
        this._cached_iStopTime.actuationTime    = msg.params.payload.iStop_EffectiveTime.
                                                        effectiveness_iStop_time.iStop_timeIG * 1000;
        this._cached_iStopTime.stopTime         = msg.params.payload.iStop_EffectiveTime.
                                                        effectiveness_iStop_time.iStopTotalTime * 1000;
        this._cached_iStopTime.totalTime        = msg.params.payload.iStop_EffectiveTime.
                                                        effectiveness_TotStpTime.tot_time_veh_stopped * 1000;
        log.debug("setiStopTimeMsgHandler() called");
        // Make sure we're active (all contexts)
        if (this._currentContext && this._currentContextTemplate
                && (this._currentContext.ctxtId    ===    "Effectiveness" || this._currentContext.ctxtId    ===    "EndingEffectiveness"))
        {
            // Update the control to change the iStopTime value
            this._populateEffectivenessContext();
        }
    }
};

ecoenergyApp.prototype._setiEloopEffectiveRateMsgHandler = function(msg)
{
    /*
     * Handler to set iEloopEffectiveRate value on effectiveness context.
     * (This data would normally come from MMUI)
     */
    if (msg && msg.params && msg.params.payload)
    {// Null Check
        // Cache a copy of the passed-in data
        this._cached_iEloopEffectiveRate = msg.params.payload.iELoop_EffectiveRate.iEloopEffectiveRate;
        
        log.debug("setiEloopEffectiveRateMsgHandler() called iEloopEffectiveRate = "+
                this._cached_iEloopEffectiveRate);
        
        // Make sure we're active (all contexts)
        if (this._currentContext && this._currentContextTemplate
                && (this._currentContext.ctxtId    ===    "Effectiveness"  || this._currentContext.ctxtId    ===    "EndingEffectiveness"))
        {
            // Update the control to change the iEloopEffectiveRate value
            // this._populateEffectivenessContext();
        }
    }
};
ecoenergyApp.prototype._setiStopEffectiveRateMsgHandler = function(msg)
{
    /*
     * Handler to set iStopEffectiveRate value on effectiveness context.
     * (This data would normally come from MMUI)
     */
    if (msg && msg.params && msg.params.payload)
    {// Null Check
        // Cache a copy of the passed-in data
        if((this._cached_iStopEffectiveRate == msg.params.payload.iStop_EffectiveRate.iStop_effective_rate) && this._cached_iStopEffectiveRate !== null )
        {
            
        }
        else
        {
               this._cached_iStopEffectiveRate = msg.params.payload.iStop_EffectiveRate.iStop_effective_rate;
            log.debug("setiStopEffectiveRateMsgHandler() called _cached_iStopEffectiveRate = "+
                        this._cached_iStopEffectiveRate);
            // Make sure we're active (all contexts)
            if (this._currentContext && this._currentContextTemplate
                    && (this._currentContext.ctxtId    ===    "Effectiveness" || this._currentContext.ctxtId    ===    "EndingEffectiveness"))
            {
                 // Updating iStopEffRate Data on Effectiveness Context
                this._currentContextTemplate.ecoEffectCtrl
                        .setiStopEffRate(this._cached_iStopEffectiveRate);
            }
        }    
    }
};
ecoenergyApp.prototype._setTreeDataMsgHandler = function(msg)
{    /*
     * Handler to set Tree data value on effectiveness context.
     * (This data would normally come from MMUI)
     */
    log.debug("setTreeDataMsgHandler() called");
    // Make sure the received msg is not null
    if (msg && msg.params && msg.params.payload)
    {
        // Cache a copy of the passed-in data
        if(this._cached_treeCurrentLvl!=msg.params.payload.LeavesIcon_growth)
        {
            this._cached_treeCurrentLvl = msg.params.payload.LeavesIcon_growth;
            this._setTreeLvl();
        }
        this._cached_treeNumber = msg.params.payload.TreeGrowth.TreeIcon_growth;
        // Make sure we're active (all contexts)
        log.info(" Tree current level ::"+this._cached_treeCurrentLvl);
        if (this._currentContext && this._currentContextTemplate
                && (this._currentContext.ctxtId    ===    "Effectiveness"  || this._currentContext.ctxtId    ===    "EndingEffectiveness"))
        {
            // Update the control to change the tree number value
            this._populateEffectivenessContext();
        }
    }
};

// handler function for receiving the boost range from MMUI 
ecoenergyApp.prototype._setBoostRangeHandler = function(msg)
{
    log.debug("_setBoostRangeHandler() called");
    // Make sure the received msg is not null
    if (msg && msg.params && msg.params.payload)
    {
        var temp = msg.params.payload.DistanceSaved.TotSvdDistance;
        this._cached_boostRange.range = parseFloat(Math.round(temp) / 10).toFixed(1);
        this._cached_boostRange.unit = this._getUnitId(msg.params.payload.DistanceSaved.TotSvdDistance_unit);
        
        if (this._currentContext && this._currentContextTemplate
                && (this._currentContext.ctxtId    ===    "Effectiveness" || this._currentContext.ctxtId    ===    "EndingEffectiveness"))
        {
            // Update the control to change boost range and unit
            this._currentContextTemplate.ecoEffectCtrl.setIstopBoostRange(
                    this._cached_boostRange.range, this._cached_boostRange.unit);
        }
    }    
};
/*************************** Handlers for Effectiveness Ends *******************************/

/************************** Function of Settings Context  Starts ****************************/


ecoenergyApp.prototype._listItemClickCallback = function(listCtrlObj, appData,
        params) 
        {
    
            switch(appData)
            {
                case "SelectEndingScreen": 
                    switch(params.additionalData)
                    {
                        case 1:
                            this._cachedEndingScreenToggleStatus = "ON";
                            framework.sendEventToMmui(this.uiaId, "SetEndingScreenOnOff",
                                    { payload : {endingScreen : "ON"}});
                        break;
                        case 2:
                            this._cachedEndingScreenToggleStatus = "OFF";
                            framework.sendEventToMmui(this.uiaId, "SetEndingScreenOnOff",
                                    { payload : { endingScreen : "OFF"}});
                            break;
                        default:
                            log.debug("In default case");
                            break;
                    }
                    break;
                case "ResetTripCAFE":
                     switch(params.additionalData)
                        {
                            case 1:
                                this._cachedResetToggleStatus = 1;
                                framework.sendEventToMmui(this.uiaId, "SetSyncOnOff",
                                        { payload : {syncOnOff: 1}});
                                break;
                            case 2:
                                this._cachedResetToggleStatus = 0;
                                framework.sendEventToMmui(this.uiaId, "SetSyncOnOff",
                                        { payload : { syncOnOff: 0}});
                                break;
                            default:
                                log.debug("In default case");
                                break;
                        }
                    break;
                default:
                    log.debug("In inner switch default case ");
                    break;
            }
};

/************************** Function of Settings screen  Ends ****************************/

/**************************  Function of ResetRetry screen starts ***********************/
//called once the user clicks on "Reset" / "Retry" button.
ecoenergyApp.prototype._dialogCtrlClickCallback = function(dialogBtnCtrlObj, appData, params)
{
   log.debug("_dialogSelectCallback  called..." +appData);
   if(this._currentContext.ctxtId)
    {
        switch (appData)
        {
            case "Retry":
                framework.sendEventToMmui(this.uiaId, "SelectReset");
                this._isResetFinished = true;
                break;
            case "Global.Cancel":
                framework.sendEventToMmui("Common", "Global.Cancel");
                this._isResetFinished = false;
                break;
			case "Confirm":
			framework.sendEventToMmui(this.uiaId, "SelectReset", null);
            this._isResetFinished = true;
            this._toggleUMPButtons(this._isResetFinished);
			break;
        }
    }
};

/***********   Function of ResetRetry screen ends ***********/



/**************************  Function of SettingRetry screen starts ***********************/
//called once the user clicks on "Reset" / "Retry" button.
ecoenergyApp.prototype._dialogCtrlSettingRetryClickCallback = function(dialogBtnCtrlObj, appData, params)
{
 log.debug("_dialogSelectCallback  called..." +appData);
 if(this._currentContext.ctxtId)
    {
        switch (appData)
        {
            case "Retry":
	            if(this._cachedResetToggleStatus === 1)
	    		{
	       		 this._cachedResetToggleStatus = 0;
	       		}
	           	else
	       		{
	       		 this._cachedResetToggleStatus = 1;
	       		}
	           	log.debug("[_dialogCtrlSettingRetryClickCallback] about to send toggel status :: "+this._cachedResetToggleStatus);
                framework.sendEventToMmui(this.uiaId, "SelectRetry",{ payload : {syncOnOff: this._cachedResetToggleStatus}});
                break;
            case "Global.Cancel":
                framework.sendEventToMmui("Common", "Global.Cancel");
                break;
        }
    }
};

//
ecoenergyApp.prototype._dialogCtrlLoadingClickCallback = function(dialogBtnCtrlObj, appData, params)
{
 log.debug("_dialogCtrlLoadingClickCallback  called..." +appData);
 if(this._currentContext.ctxtId)
    {
        switch (appData)
        {           
            case "SelectApplications":
                framework.sendEventToMmui("system", "SelectApplications");
                break;
        }
    }
};
/***********   Function of SettingRetry screen ends ***********/



/*************************** Common Handlers ***********************************************/
/*******************************************************************************************/
ecoenergyApp.prototype._setFuelTypeMessageHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload)
    {
        this._cached_FuelType    = msg.params.payload.FuelType;
    }
};

ecoenergyApp.prototype._setFuelEfficiencyMessageHandler = function(msg)
{
    /*
     * Handler to set the fuel efficency data.
     * (This data would normally come from MMUI)
     */
    if (msg && msg.params && msg.params.payload)
    {// Null Check
        // Cache a copy of the passed-in data
        this._cached_currentCFERBarValue    = msg.params.payload.CurrentAvgFuelEco.CurdrvAvlFuel.
                                                                    Drv1AvlFuelE * this._multiplicationFactor;
        this._cached_currentCFERBarValue = this._cached_currentCFERBarValue.toFixed(1);
        this._cached_currentCumFuelUnit = this._getUnitId(this._globalUnit);
        // Make sure we're active (all contexts)
        if (this._currentContext && this._currentContextTemplate
                && (this._currentContext.ctxtId    ===    "FuelConsumption" || this._currentContext.ctxtId    ===    "EndingFuelConsumption"  || this._currentContext.ctxtId    ===    "HEVFuelConsumption"))
        {
            // Update the control to change the fuel efficiency
                this._setFuelConsmnFuelEfficiency();
        }
    }
};

ecoenergyApp.prototype._setCurrEquippedFeatureMessageHandler = function(msg)
{
    /*
     * Handler for setting current CurrEquippedFeature value (viz iEloopiStop,iStopOnly,iEloopOnly)
     * (This data would normally come from MMUI)
     */
        if (msg && msg.params && msg.params.payload)
        {// Null Check
            log.debug("setCurrEquippedFeatureMessageHandler() called: "
                    + msg.params.payload.CurrFeature);
            // Cache a copy of the passed-in data and set the corresponding context value 
            switch (msg.params.payload.CurrFeature)
            {
                case "ISTOP_IELOOP":
                	log.debug("ECOENERGYGUI: CurrFeature value is iEloopiStop");
                    this._equippedCtrlStyle = "iEloopiStop";
                    this._contextTable['FuelConsumption'].controlProperties.FuelConsumptionCtrl.umpButtonConfig = this._umpButtonConfigFuel;
                    break;
                case "IELOOP":
                    this._equippedCtrlStyle = "iEloopOnly";      
					this._contextTable['FuelConsumption'].controlProperties.FuelConsumptionCtrl.umpButtonConfig = this._umpButtonConfigFuel;				
                    break;
                case "ISTOP":
                    this._equippedCtrlStyle = "iStopOnly";
					this._contextTable['FuelConsumption'].controlProperties.FuelConsumptionCtrl.umpButtonConfig = this._umpButtonConfigFuel;
                    break;
                case "NONE":
                    this._equippedCtrlStyle = "NONE";
                    log.debug("ECOENERGYGUI: CurrFeature value is None");
                    this._contextTable['FuelConsumption'].controlProperties.FuelConsumptionCtrl.umpButtonConfig = this._umpButtonConfigNoSwitch; 
                    break;
                default:
					this._equippedCtrlStyle = "iEloopiStop";
					this._contextTable['FuelConsumption'].controlProperties.FuelConsumptionCtrl.umpButtonConfig = this._umpButtonConfigFuel;
                    log.warn("ECOENERGYGUI: CurrFeature value did not matched with switch case values");
                    break;
            }
            this._feature= msg.params.payload.CurrFeature;
        }
};

ecoenergyApp.prototype._resetSuccessMessageHandler = function(msg)
{
    this._isResetFinished = false;
    if (this._currentContextTemplate && this._currentControl)
    {
        this._toggleUMPButtons(this._isResetFinished);
		if(this._isUmpPanelOpen)
		{
			this._currentControl.toggleUmpPanel("showPanel");
			this._isUmpPanelOpen = true;
		}		
    }
}

ecoenergyApp.prototype._resetIconMessageHandler = function(msg)
{
	if(msg && msg.params && msg.params.payload)
    {
    	var status = msg.params.payload.ResetButton;
    	this._isResetIconDisabled = (status === 'DISABLED' ? true : false);
    }
	if (this._currentContextTemplate && this._currentControl)
	{
		this._disableResetIcon(this._isResetIconDisabled);
	}
}

ecoenergyApp.prototype._switchSelectHandler = function(controlObj, appData, params)
{
   this._currentControl.toggleUmpPanel("showPanel");
   this._isUmpPanelOpen = true;
}

ecoenergyApp.prototype._setSyncStatusAndTripA = function(msg)
{
    //Do not put check for "SyncStatus" , since the value for "ON" is 0.
    if(msg &&  msg.params && msg.params.payload)
    {
        this._cachedResetToggleStatus = msg.params.payload.SyncStatus;
    }
    if(this._currentContextTemplate)
    {
        this._populateSettingList();   
    }                                                     // update setting screen with new reset toggle value.
};

/**
 *  
 * _AtSpeedMsgHandler message handler.Called when the speed exceeds threshold value.
 */
ecoenergyApp.prototype._AtSpeedMsgHandler = function(msg) 
{
    this._atSpeedVal = true;
    if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "Settings")
    {
        log.debug("[AtSpeedMsgHandler] :: about to populatelist with atspeed condtn :: "+this._atSpeedVal);
        this._populateSettingList();
    }
};

/**
 *  
 * _NoSpeed message handler.Called when the speed is normal
 */
ecoenergyApp.prototype._NoSpeedMsgHandler = function(msg)
{
    this._atSpeedVal = false;
    if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "Settings")
    {
        log.debug("[NoSpeedMsgHandler] :: about to populatelist with atspeed condtn :: "+this._atSpeedVal);
        this._populateSettingList();
        
    }
};

//showAmbientGrayOut Message Handler
ecoenergyApp.prototype._resetTripAHandler = function(msg)
{
	log.info("_resetTripAHandler handler called");
	if(msg.params.payload.IgnSts)
    {
		log.info("msg.params.payload.IgnSts " + msg.params.payload.IgnSts);
		this._cachedResetTripAStatus = msg.params.payload.IgnSts;
    }
	else
	{
		log.info("In else :: msg.params.payload.IgnSts " + msg.params.payload.IgnSts);
	}
	if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "Settings")
    {
        this._populateSettingList();
        
    }
};
/*************************** Common Handlers Ends ***********************************************/
    
/*************************** Helper Functions start ****************************************/
/*******************************************************************************************/
ecoenergyApp.prototype._populateControlStatusContext     = function()
{
    /*
     *This function used to populate data on ControlStatus Context
     */
    if (this._currentContextTemplate && this._currentContextTemplate.ecoStatusCtrl)
    {// Null Check 
        
            // Updating FuelEfficiency Data on ControlStatus Context
            this._currentContextTemplate.ecoStatusCtrl
                .setFuelEfficiency(this._cached_fuelEfficiencyData);

            // Updating iStopMode Data on ControlStatus Context
            this._currentContextTemplate.ecoStatusCtrl
                .setIStopMode(this._cached_iStopMode);

            // Updating iStopError Data on ControlStatus Context
            this._currentContextTemplate.ecoStatusCtrl
                .setIStopError(this._cached_iStopErrorObj, null);

            // Updating iStopStatus Data on ControlStatus Context
            this._currentContextTemplate.ecoStatusCtrl
                .setIStopStatus(this._cached_iStopStatusObj, null);

            // Updating iEloopData Data on ControlStatus Context
            this._currentContextTemplate.ecoStatusCtrl
                .setIEloopData(this._cached_iEloopData, true);

            // Updating iStopTime Data on ControlStatus Context
            this._currentContextTemplate.ecoStatusCtrl
                .setIStopTime(this._cached_iStopTimeObj);
        }
    };
    
ecoenergyApp.prototype._populateEffectivenessContext     = function()
{
    /*
     *This function used to populate data on Effectiveness Context
     */
    if (this._currentContextTemplate && this._currentContextTemplate.ecoEffectCtrl)
    {// Null Check 

            // Updating iStopEffTime Data on Effectiveness Context
            this._currentContextTemplate.ecoEffectCtrl
                .setiStopEffTime(this._cached_iStopTime.actuationTime, 
                        this._cached_iStopTime.stopTime,this._cached_iStopTime.totalTime);

            // Updating TreeNumber Data on Effectiveness Context
            this._currentContextTemplate.ecoEffectCtrl
                .setTreeNumber(this._cached_treeNumber);
            
            // Update Boost Range with Unit    
            this._currentContextTemplate.ecoEffectCtrl.setIstopBoostRange(
                    this._cached_boostRange.range, this._cached_boostRange.unit);
        }
    };
ecoenergyApp.prototype._setTreeLvl     = function()
    {
        if (this._currentContextTemplate && this._currentContextTemplate.ecoEffectCtrl)
        {// Null Check 
            this._currentContextTemplate.ecoEffectCtrl
            .setTreeCurrLevel(this._cached_treeCurrentLvl);
        }
    };
    
ecoenergyApp.prototype._setFuelConsmnFuelEfficiency      = function()
    {
        if (this._currentContextTemplate && this._currentContextTemplate.fuelConsumptionCtrl)
        {// Null Check
            // Updating FuelEfficiency Data on fuelConsumption Context
            this._currentContextTemplate.fuelConsumptionCtrl
                .setFuelEfficiency({"fuelEfficiency"                 : this._cached_currentCFERBarValue, //used to cache Fuel Efficiency value
                                    "fuelEfficiencyUnit"             : this._cached_currentCumFuelUnit});// cached already from the Handler
        }
    };
ecoenergyApp.prototype._initializeCurrentDriveFuelGraph  = function()
    {
        if (this._currentContextTemplate && this._currentContextTemplate.fuelConsumptionCtrl)
        {// Null Check
            // Initializing Current Drive Fuel Graph on fuelConsumption Context
            var rightBarGraph = [];
            var leftBarGraph = [];
            var j = 0;
            for(var i = 0 ; i < this._cached_initialCDFEBarValues.length; i++)
            {
                if(i < 10)
                {
                    rightBarGraph[i] = this._cached_initialCDFEBarValues[i];
                }
                else
                {
                    leftBarGraph[j] = this._cached_initialCDFEBarValues[i];
                    j++;
                    
                }
            }
            this._currentContextTemplate.fuelConsumptionCtrl
            .initializeCurrentDriveFuelGraph(this._cached_initialCDFEBarValues);
           this._currentContextTemplate.fuelConsumptionCtrl
                .initializeCurrentDriveFuelGraphRight(leftBarGraph);
        }
    };
    
 ecoenergyApp.prototype._initializeHEVCurrentDriveFuelGraph  = function()
    {
        if (this._currentContextTemplate && this._currentContextTemplate.fuelConsumptionCtrl)
        {// Null Check
            // Initializing Current Drive Fuel Graph on fuelConsumption Context
            var rightBarGraph = [];
            var leftBarGraph = [];
            
            var rightDiscValue = [];
            var leftDiscValue = [];
            
            var rightHalfDiscs = [];
            var leftHalfDiscs = [];
            var leftEvModes = [];
            
            var j = 0;
            for(var i = 0 ; i < this._cached_initialCDFEBarValues.length; i++)
            {
                if(i < 10)
                {
                    rightBarGraph[i] = this._cached_initialCDFEBarValues[i];
                    rightDiscValue[i] = this._cached_initialDiscValues[i];
                    rightHalfDiscs[i] = this._cached_initialHalfDiscsValue[i];
                }
                else
                {
                    leftBarGraph[j] = this._cached_initialCDFEBarValues[i];
                    leftDiscValue[j] = this._cached_initialDiscValues[i];
                    leftHalfDiscs[j] = this._cached_initialHalfDiscsValue[i];
                    leftEvModes[j] = this._initialEvMode[i];
                    j++;
                }
            }
            this._currentContextTemplate.fuelConsumptionCtrl
            .initialiseHEVFuelGraph(this._cached_initialCDFEBarValues, this._cached_initialDiscValues, this._initialEvMode, this._cached_initialHalfDiscsValue);
           this._currentContextTemplate.fuelConsumptionCtrl
                .initializeHEVCurrentDriveFuelGraphRight(leftBarGraph, leftDiscValue, leftHalfDiscs, leftEvModes);
        }
    };
    
ecoenergyApp.prototype._initializeCumulativeFuelGraph  = function()
    {
        if (this._currentContextTemplate && this._currentContextTemplate.fuelConsumptionCtrl)
        {// Null Check
            // Updating Cumulative Fuel Graph Value on fuelConsumption Context
            this._currentContextTemplate.fuelConsumptionCtrl.
                initializeCumulativeFuelGraph(this._cached_initialCFERBarValues);
        }
    };
	
ecoenergyApp.prototype._insertCurrentDriveFuelGraph  = function(){
        var currenBarGraphLeft = [];
        if (this._currentContextTemplate)
        {// Null Check
            // Inserting new Current Drive Fuel Graph Value on fuelConsumption Context
            if(this._newBarGraphReady)
            {
                this._currentContextTemplate.fuelConsumptionCtrl
                .insertCurrentDriveFuelGraph(this._cached_currentCDFEBarValue[0],
                        this._cached_currentCDFELineValue);
                
                for(var i = 0 ; i < (this._cached_currentCDFEBarValue.length)-1; i++)
                {
                    currenBarGraphLeft[i] = this._cached_currentCDFEBarValue[i+1];
                }
                this._currentContextTemplate.fuelConsumptionCtrl.initializeCurrentDriveFuelGraphRight(currenBarGraphLeft);
                this._newBarGraphReady      = false;
            }
        }
    };
    
ecoenergyApp.prototype._insertHEVCurrentDriveFuelGraph  = function(){
        var currenBarGraphLeft = [];
        var currentDiscGraphLeft = [];
        var currentHalfDiscLeft = []; 
        var currentEvModeLeft = [];
        if (this._currentContextTemplate)
        {// Null Check
            // Inserting new Current Drive Fuel Graph Value on fuelConsumption Context
            //if(this._newBarGraphReady)
            //{
               this._currentContextTemplate.fuelConsumptionCtrl
					.insertHEVFuelGraph(this._cached_currentCDFEBarValue[0],
							this._cached_currentDiscValue[0], this._currentEvMode[0], this._cached_halfDiscsValue[0]);
                for(var i = 0 ; i < (this._cached_currentCDFEBarValue.length)-1; i++)
                {
                    currenBarGraphLeft[i] = this._cached_currentCDFEBarValue[i+1];
                    currentDiscGraphLeft[i] = this._cached_currentDiscValue[i+1];
                    currentHalfDiscLeft[i] = this._cached_halfDiscsValue[i+1];
                    currentEvModeLeft[i] = this._currentEvMode[i+1];
                }
                this._currentContextTemplate.fuelConsumptionCtrl.initializeHEVCurrentDriveFuelGraphRight(currenBarGraphLeft,currentDiscGraphLeft, currentHalfDiscLeft, currentEvModeLeft);
            //    this._newBarGraphReady      = false;
           // }
        }
    };    
    
ecoenergyApp.prototype._updateCurrentCumulativeFuelGraph  = function(value,unitvalue)
    {
        if (this._currentContextTemplate && this._currentContextTemplate.fuelConsumptionCtrl)
        {    
            if ((this._currentContext.ctxtId  === "HEVFuelConsumption") || (this._currentContext.ctxtId  === "EndingHEV"))
            {
            	this._currentContextTemplate.fuelConsumptionCtrl
                .updateCurrentCumulativeFuelGraph(value, 40);            
            }
            else
            {
            	this._currentContextTemplate.fuelConsumptionCtrl
                .updateCurrentCumulativeFuelGraph(value, this._globalUnitRange);           
            } 
            // Updating Current Cumulative Fuel Graph on fuelConsumption Context
           
        }
    };
ecoenergyApp.prototype._insertNewCumulativeFuelGraph  = function()
    {
        if (this._currentContextTemplate && this._currentContextTemplate.fuelConsumptionCtrl)// Null Check
        {
            // Inserting new Current Drive Fuel Graph value on fuelConsumption Context
            this._currentContextTemplate.fuelConsumptionCtrl
                .insertCurrentCumulativeFuelGraph(this._cached_newCFERBarValue);
           
        }
    };

ecoenergyApp.prototype._umpDefaultSelectCallback = function(ctrlObj, appData, params)
{
    switch(appData)
    {
        case "ApplicationsMenu":
            framework.sendEventToMmui(this.uiaId, "SelectSourceMenu", null);
            break;
            
        case "Reset":
            //framework.sendEventToMmui(this.uiaId, "SelectReset", null);
			framework.sendEventToMmui(this.uiaId, "ResetConfirm", null);
            this._isResetFinished = true;
            this._toggleUMPButtons(this._isResetFinished);
            break;
            
        case "SwitchView":
            framework.sendEventToMmui(this.uiaId, "SelectSwitchView", null);
            break;
            
        case "SelectSettings":
             framework.sendEventToMmui(this.uiaId, "SelectSettings", null);
            break;
            
        case "HidePanel":
            this._currentControl.toggleUmpPanel("hidePanel");
            this._isUmpPanelOpen = false;
            break;
            
        default:
            log.warn("Can not identify the AppData..Something went wrong !!!"); 
    }
    
}

// To disable/enable the current UMP panel button when RESET is pressed or RESET Sucess
ecoenergyApp.prototype._toggleUMPButtons = function(status)
{
    if(this._currentContextTemplate && this._currentControl)
    {
        if(this._currentContext.ctxtId === 'ControlStatus')
        {
            for(var item in this._umpButtonConfigEcoStatus)
            {
                this._umpButtonConfigEcoStatus[item].disabled = status;
                this._currentControl.umpCtrl.setButtonDisabled(item,status);
            }
        }
        else if(this._currentContext.ctxtId === 'FuelConsumption')
        {
            if(this._equippedCtrlStyle === "NONE")
            {
                for(var item in this._umpButtonConfigNoSwitch)
                {
                    this._umpButtonConfigNoSwitch[item].disabled = status;
                    this._currentControl.umpCtrl.setButtonDisabled(item,status);
                }
            }
            else
            {
                for(var item in this._umpButtonConfigFuel)
                {
                    this._umpButtonConfigFuel[item].disabled = status;
                    this._currentControl.umpCtrl.setButtonDisabled(item,status);
                }
            }
        }
        else if(this._currentContext.ctxtId === 'HEVFuelConsumption')
        {
            if(this._equippedCtrlStyle === "NONE")
            {
                for(var item in this._umpButtonConfigNoSwitch)
                {
                    this._umpButtonConfigNoSwitch[item].disabled = status;
                    this._currentControl.umpCtrl.setButtonDisabled(item,status);
                }
            }
            else
            {
                for(var item in this._umpButtonConfigFuel)
                {
                    this._umpButtonConfigFuel[item].disabled = status;
                    this._currentControl.umpCtrl.setButtonDisabled(item,status);
                }
            }
        }             
    }
}


//utility function to disable only ump reset icon
ecoenergyApp.prototype._disableResetIcon = function(status)
{
	if(!this._isResetFinished)
	{
		if(this._currentContextTemplate && this._currentControl)
		{
			if(this._currentContext.ctxtId === 'ControlStatus')
			{
				this._umpButtonConfigEcoStatus["Reset"].disabled = status;
				this._currentControl.umpCtrl.setButtonDisabled("Reset",status);
			}

			else if(this._currentContext.ctxtId === 'FuelConsumption')
			{
				if(this._equippedCtrlStyle === "NONE")
				{
					this._umpButtonConfigNoSwitch["Reset"].disabled = status;
					this._currentControl.umpCtrl.setButtonDisabled("Reset",status);
				}
				else
				{
					this._umpButtonConfigFuel["Reset"].disabled = status;
					this._currentControl.umpCtrl.setButtonDisabled("Reset",status);
				}
			}
			else if(this._currentContext.ctxtId === 'HEVFuelConsumption')
			{
				if(this._equippedCtrlStyle === "NONE")
				{
					this._umpButtonConfigNoSwitch["Reset"].disabled = status;
					this._currentControl.umpCtrl.setButtonDisabled("Reset",status);
				}
				else
				{
					this._umpButtonConfigFuel["Reset"].disabled = status;
					this._currentControl.umpCtrl.setButtonDisabled("Reset",status);
				}
			}
		}	
	}	
}



// To show the UMP panel if it was open in the previous context...
ecoenergyApp.prototype._togglePanel = function()
{
    if(this._isEcoContext)
    {
        this._currentControl.toggleUmpPanel("showPanel");
        this._isEcoContext = false;
    }
}
// Saving the unit info and deciding on the limit as per the unit when fuelconsmp context is received...
ecoenergyApp.prototype._saveUnitInformation = function(unit, obj)
{
	this._cachedVehicleType = framework.getSharedData("syssettings","VehicleType");
	
	if(this._cachedVehicleType == "SETTINGS_VehicleModelType_J36")
	{
		switch(unit)
		{
			case "KMPERLIT":
				obj.yAxisLimitValue = 25;
				obj.yAxisLabelId = "kml";
				break;
				
			case "L100KM":
				obj.yAxisLimitValue = 15;
				obj.yAxisLabelId = "lkm";
				break;
			case "USMILESPERGAL":
				obj.yAxisLimitValue = 60;
				obj.yAxisLabelId = "mpg";
				break;
				
			case "UKMILESPERGAL":
				obj.yAxisLimitValue = 70;
				obj.yAxisLabelId = "mpg";
				break;    
				
			default:
				obj.yAxisLimitValue = 25;
				obj.yAxisLabelId = "kml";
				break;
		}
	}
	else if((this._cachedVehicleType == "SETTINGS_VehicleModelType_J03A") 
			|| (this._cachedVehicleType == "SETTINGS_VehicleModelType_J03K")
			|| (this._cachedVehicleType == "SETTINGS_VehicleModelType_J03E") 
			|| (this._cachedVehicleType == "SETTINGS_VehicleModelType_J03J")
			|| (this._cachedVehicleType == "SETTINGS_VehicleModelType_J03G")) //SW00158191
	{
		switch(unit)
		{
			case "KMPERLIT":
				obj.yAxisLimitValue = 30;
				obj.yAxisLabelId = "kml";
				break;
				
			case "L100KM":
				obj.yAxisLimitValue = 15;
				obj.yAxisLabelId = "lkm";
				break;
			case "USMILESPERGAL":
				obj.yAxisLimitValue = 70;
				obj.yAxisLabelId = "mpg";
				break;
				
			case "UKMILESPERGAL":
				obj.yAxisLimitValue = 85;
				obj.yAxisLabelId = "mpg";
				break;    
				
			default:
				obj.yAxisLimitValue = 30;
				obj.yAxisLabelId = "kml";
				break;
		}
	}
	else 
	{
		switch(unit)
		{
			case "KMPERLIT":
				obj.yAxisLimitValue = 25;
				obj.yAxisLabelId = "kml";
				break;
				
			case "L100KM":
				obj.yAxisLimitValue = 15;
				obj.yAxisLabelId = "lkm";
				break;
			case "USMILESPERGAL":
				obj.yAxisLimitValue = 60;
				obj.yAxisLabelId = "mpg";
				break;
				
			case "UKMILESPERGAL":
				obj.yAxisLimitValue = 70;
				obj.yAxisLabelId = "mpg";
				break;    
				
			default:
				obj.yAxisLimitValue = 25;
				obj.yAxisLabelId = "kml";
				break;
		}
    }
	if (this._currentContextTemplate && this._currentContext)
	{
 		if((this._currentContext.ctxtId === "HEVFuelConsumption")||(this._currentContext.ctxtId === "EndingHEV"))
		{
        // In HEVFuelConsumption the Y graph limit is always 40
    	 obj.yAxisLimitValue = 40;
		}
    }  
    return obj;
};

ecoenergyApp.prototype._getUnitId = function(unit)
{
    var unitId;
    switch(unit)
    {
        case "KMPERLIT":
            unitId = "kml";
            break;
            
        case "mpg":
            unitId = "mpg";
            break;
            
        case "L100KM":
            unitId = "lkm";
            break;
            
        case "USMILESPERGAL":
            unitId = "mpg";
            break;
            
        case "UKMILESPERGAL":
            unitId = "mpg";
            break;    
        
        case "KM":
            unitId = "Km";
            break;
            
        case "MILE":
            unitId = "Miles";
            break;
            
        case "KG":
            unitId = "Kg";
            break;
            
        default:
            unitId = "kml";
    }
    return unitId;
}

//helper fuction to populate the ecoenergy setting list
ecoenergyApp.prototype._populateSettingList = function()
{
    var dataListItems  = this._ecoenergySettingList.items;
    log.debug("Vehicle crossed threshold speed ::" +this._atSpeedVal);
    
    log.debug("[populateSettingList] Ending screen toggle status :: "+this._cachedEndingScreenToggleStatus +"Reset toggle status :: "+this._cachedResetToggleStatus +" Ending screen support :: "+this._cachedSettingsEnableDisableStatus);
    //set endingscreen toggle button and reset toggle button "on"  or "off" state  wrt gui click/ update from MMUI. 
    if(this._cachedEndingScreenToggleStatus === "ON")
    {
        dataListItems[0].value = 1;
    }
    else if(this._cachedEndingScreenToggleStatus === "OFF")
    {
        dataListItems[0].value = 2;
    }

    if(this._cachedResetToggleStatus == 1)
    {
        dataListItems[1].value = 1;
    }
    else if(this._cachedResetToggleStatus === 0)
    {
        dataListItems[1].value = 2;
    }
    
    //check for vehicle speed if it excceds the threshold range then greyout the ecosetting list items. 
    //else if ending screen support is not thr than disable first item in the list.
    // if both the above condition doesn't satisfy then display the complete enabled list.
    if(this._cachedResetTripAStatus === "OFF")
    {
        	dataListItems[1].disabled = true;
    }
	else if(this._cachedResetTripAStatus === "ON")
    {
		    dataListItems[1].disabled = false; 
	}

    if (this._atSpeedVal)
    {
         for (var listItem in dataListItems)
         {
                dataListItems[listItem].disabled = true;
         }
    }
   else
    {
       //if system supports ending screen, enable ending screen toggle button alse diable it.
        if(this._cachedSettingsEnableDisableStatus == "NOTENABLED")
        {
            dataListItems[0].disabled=true;
        }
        else
        {
            dataListItems[0].disabled= false;
        }
    }
	
    dataList =
    { itemCountKnown : true, itemCount : dataListItems.length, items : dataListItems };
    
    this._listLength = dataList.itemCount - 1;
    
   //set datalist on listcontrol
    this._currentContextTemplate.list2Ctrl.setDataList(dataList);
    this._currentContextTemplate.list2Ctrl.updateItems(0, this._listLength);
};

// utility function to get the istop status message based on MMUI enum
ecoenergyApp.prototype._getiStopStatus = function(msg) 
{
	switch(msg)
	{
		case 'TRUE':
				return "Good";
			break;
		case 'FALSE':
				return "Bad";
			break;
		case 'DISPLAY_OFF':
				return "DisplayOff";
			break;
		default:
				return "DisplayOff";
	}
}

// Start the timer for Ending screen for 5 seconds
ecoenergyApp.prototype._startEndingTimer = function() 
{
    this.endingTimer = setTimeout(this._stopEndingTimer.bind(this), 5000);
};

// Send event to mmui and clear the ending timeout
ecoenergyApp.prototype._stopEndingTimer = function() 
{
    framework.sendEventToMmui(this.uiaId, "EndingTimeout", null);
    clearTimeout(this.endingTimer);
    this.endingTimer = null;
};

// Update the initial bar values based on Current bars 
ecoenergyApp.prototype._updateInitialBarValues = function(barValue, initialArray) 
{    
    var index =  initialArray.length-1;
    for(; index > 0; index--)
    {
        initialArray[index] = initialArray[index-1];
    }
    initialArray[0] = barValue;
    return initialArray;
};

//Update the initial bar values based on Current bars for CurrentDrive
ecoenergyApp.prototype._updateInitialBarValuesCurrentDrive = function(barValue, initialArray) 
{    
    var index,indexLeft; 
    for(index = 9; index > 0; index--)
    {
        initialArray[index] = initialArray[index-1];
    }
    initialArray[0] = barValue[0];
    
    for(indexLeft = 10; indexLeft < 15; indexLeft++ )
    {
        initialArray[indexLeft] = barValue[indexLeft - 9];
    }
    
    return initialArray;
};

// Utility function to MAP the MMUI ecoHEV signals to Control Obj 
ecoenergyApp.prototype._mapHEVSignalFlowData = function(hevConfig)
{ 
	var mapEnumEngTire = [false, true, undefined];
	var mapEnumEngMotor = [false, true, undefined];
	var mapEnumMotorTire = ['NONE', 'MotorToTire', 'TireToMotor'];
	var mapEnumMotorBatt = ['NONE', 'MotorToBatt', 'BattToMotor'];
	var mapRevRequest = [false, true, undefined, undefined];
	
	this._ecoHEVConfig.engineTireActive = mapEnumEngTire[hevConfig.ecoEngTire];
	this._ecoHEVConfig.engineMotorActive = mapEnumEngMotor[hevConfig.ecoEngMotor];
	this._ecoHEVConfig.motorTireActive = mapEnumMotorTire[hevConfig.ecoMotorTire];
	this._ecoHEVConfig.motorBatteryActive = mapEnumMotorBatt[hevConfig.ecoMotorBatt];
	this._ecoHEVConfig.reverseRequested = mapRevRequest[hevConfig.rvrseLmpReq];
	this._ecoHEVConfig.vehicleSpeed =	hevConfig.vehSpeed;	
	
};

/*************************** Helper Functions ends ****************************************/

framework.registerAppLoaded("ecoenergy", null, true);