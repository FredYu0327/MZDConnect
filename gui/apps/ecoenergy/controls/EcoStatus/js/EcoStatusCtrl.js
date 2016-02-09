/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: EcoStatusCtrl.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: abrow198
 Date: 12-03-2012
 __________________________________________________________________________

 Description: IHU GUI EcoStatusCtrl
 
 Revisions: 
 v0.1 (12-03-2012)  Initial implementation (abrow198)
 v0.2 (01-13-2013)  Adding Arrow Animation and Some studio images (atiwarc)
 v0.3 (03-13-2013)  Implementation of UMP Control panel (atiwarc)
 v0.4 (04-24-2013)  Spec Migration to 3.56 (UMP3 support and Spec changes)(atiwarc)
 v0.5 (05-15-2013)  Go back implementation (atiwarc)
 v0.6 (08-01-2013)  Implementation Changed for Arrow Animation and Capacitor Animations(atiwarc)
 v0.7 (16-06-2014)  Implementation of J12(avalajh)
 v0.8 (26-06-2014)  Implementation of tyre roatation image(avalajh)
 v0.9 (25-07-2014)  Changes are made for J12A
 v0.10 (01-10-2014)  Changes are made for IEloop screen. - SW00155995 - avalajh
 v0.11(15-Oct-2014) Changes are done for setdiv- SCR SW00156413(avalajh)
 v0.12(20-Oct-2014) Changes are done for swapping the div element for blue tyres- SCR SW00156323(avalajh)
 v0.13 (6-Nov-2014)  Changes are done for better design- SCR SW00156036(avalajh)
 v0.14 (9-Dec-2014)  Changes are done for smoothing of tire rotation for J12A vehicle on I-ELOOP Display - SCR SW00158916 (Rakesh)
 v0.15 (24-Dec-2014) Changes are done for  Engine icon in blue or in gray depending of the corresponding conditions for J12A vehicle - SCR SW00159253 (Rakesh)
 ________________________________________________________________________

 */

log.addSrcFile("EcoStatusCtrl.js", "common");
// Alternative logging for development (avoid spew from "common")
//log.addSrcFile("EcoStatusCtrl.js", "EcoStatusCtrl");
//log.setLogLevel("EcoStatusCtrl", "debug");

function EcoStatusCtrl(uiaId, parentDiv, controlId, properties)
{
    
this._id=0;
	this._counter = 0;
	
	 this._pattern = [
	["hidden","visible","hidden","hidden","hidden","hidden"],
	["hidden","hidden","visible","hidden","hidden","hidden"],
	["hidden","hidden","hidden","visible","hidden","hidden"],
	["hidden","hidden","hidden","hidden","visible","hidden"],
	["hidden","hidden","hidden","hidden","hidden","visible"]
	 ];
	this.vehicleType = null;
	this.wheelRotate = null;
	this.arrowAnimJ12Timer = null;
	this.wheelPositionY = 0;
	this.arrowAnimationCount = 0;
	this.arrowAnimationCount1 = 0;
	this.arrowAnimationCount2 = 0;
	this.arrowAnimationCount3 = 0;
	this.arrowAnimationCount4 = 0;
	this.arrowAnimationCount5 = 0;
	this.horizontalArrowAnimationCount1 = 0;
	this.horizontalArrowAnimationCount2 = 0;
	this.horizontalArrowAnimationCount3 = 0;
	this.horizontalArrowAnimationCount4 = 0;
	this.horizontalArrowAnimationCount5 = 0;
	this.degenArrowAnimationCount = 0;
    this.uiaId = uiaId;
    this.divElt = parentDiv;
    this.controlId = controlId;
    this.switchViewButtonCtrl = null;
    // Timer used to drive capacitor level low-pass filter animation
    this._capChgLvlTimer = null;
    this._umpPanelStatus = false;
    this._currentChargeLevel = 0;
    this._previousCharge = 0;
    this._chargeLevelTimer = null;
    this.currentChargeMagnitude  = 0;
    this._TRANSPARENT  = '0';
    this._OPAQUE = '1';
    this.regenTimeoutInt = null;
    // Lists of CSS styles for all UI elements (independent of I-STOP mode)
    // in each available control style.
    // NOTE: The list keys must match the names of the HTML objects
    //       created in _createStructure(), so they can be properly
    //       applied via the loop therein.
    //@formatter:off
    this.STYLES =
    {
        "iEloopiStop":
        {
            // i-Eloop UI elements
            "iEloopContainer"               : "EcoStatusCtrl_iEloop_Container",
            "iEloopTitle"                   : "EcoStatusCtrl_iEloop_Title",
            "iEloopCarBottomLayer"          : "EcoStatusCtrl_iEloop_CarBottomLayer",
            "iEloopCarGlow"                 : "EcoStatusCtrlHidden",
            "iEloopChargeShaft"             : "EcoStatusCtrlHidden",
            "iEloopFrontWheelsGlow"         : "EcoStatusCtrlHidden",
            "iEloopBattery"                 : "EcoStatusCtrl_iEloop_Battery_Off",
            "iEloopBatteryGlow"             : "EcoStatusCtrlHidden",
            "iEloopAlternator"              : "EcoStatusCtrl_iEloop_Alternator_Off",
            "iEloopEngine"                  : "EcoStatusCtrlHidden",
            "iEloopWheelToAltCharge"        : "EcoStatusCtrl_iEloop_WheelToAltCharge_01",
            "iEloopAltToBatteryCharge"      : "EcoStatusCtrl_iEloop_AltToBatteryCharge_01",
            "iEloopBatteryToCarDischarge"   : "EcoStatusCtrl_iEloop_BatteryToCarDischarge",
            "iEloopCarTopLayer"             : "EcoStatusCtrl_iEloop_CarTopLayer",
			"carJ12Wheels"					: null,			

            // i-Stop UI elements (mode-independent)
            "iStopContainer"                : "EcoStatusCtrl_iStop_Container",
            "iStopTitle"                    : "EcoStatusCtrl_iStop_Title",

            // Fuel Efficiency UI elements
            "fuelEfficiencyContainer"       : "EcoStatusCtrl_FuelEfficiency_Container",
            "fuelEfficiencyTitle"           : "EcoStatusCtrl_FuelEfficiency_Title",
            "fuelEfficiencyValue"           : "EcoStatusCtrl_FuelEfficiency_Value",
            "fuelEfficiencyUnit"            : "EcoStatusCtrl_FuelEfficiency_Unit",
            "fuelSinceReset"				: "EcoStatusCtrl_FuelEfficiency_SinceReset",
        },
        "iEloopOnly":
        {
            // i-Eloop UI elements
            "iEloopContainer"               : "EcoStatusCtrl_iEloop_Container",
            "iEloopTitle"                   : "EcoStatusCtrl_iEloop_Title",
            "iEloopCarBottomLayer"          : "EcoStatusCtrl_iEloopOnly_iEloop_CarBottomLayer",
            "iEloopCarGlow"                 : "EcoStatusCtrlHidden",
            "iEloopChargeShaft"             : "EcoStatusCtrlHidden",
            "iEloopFrontWheelsGlow"         : "EcoStatusCtrlHidden",
            "iEloopBattery"                 : "EcoStatusCtrl_iEloop_Battery_Off",
            "iEloopBatteryGlow"             : "EcoStatusCtrlHidden",
            "iEloopAlternator"              : "EcoStatusCtrl_iEloop_Alternator_Off",
            "iEloopEngine"                  : "EcoStatusCtrlHidden",
            "iEloopWheelToAltCharge"        : "EcoStatusCtrl_iEloop_WheelToAltCharge_01",
            "iEloopAltToBatteryCharge"      : "EcoStatusCtrl_iEloop_AltToBatteryCharge_01",
            "iEloopBatteryToCarDischarge"   : "EcoStatusCtrl_iEloop_BatteryToCarDischarge",
            "iEloopCarTopLayer"             : "EcoStatusCtrl_iEloop_CarTopLayer",
			"carJ12Wheels"					: null,

            // i-Stop UI elements (mode-independent)
            "iStopContainer"                : "EcoStatusCtrlHidden",
            "iStopTitle"                    : "EcoStatusCtrlHidden",

            // Fuel Efficiency UI elements
            "fuelEfficiencyContainer"       : "EcoStatusCtrl_iEloopOnly_FuelEfficiency_Container",
            "fuelEfficiencyTitle"           : "EcoStatusCtrl_iEloopOnly_FuelEfficiency_Title",
            "fuelEfficiencyValue"           : "EcoStatusCtrl_iEloopOnly_FuelEfficiency_Value",
            "fuelEfficiencyUnit"            : "EcoStatusCtrl_iEloopOnly_FuelEfficiency_Unit",
            "fuelSinceReset"				: "EcoStatusCtrlHidden",
		
        },
        "iStopOnly":
        {
            // i-Eloop UI elements
            "iEloopContainer"               : "EcoStatusCtrl_iEloop_Container",
            "iEloopTitle"                   : "EcoStatusCtrlHidden",
            "iEloopCarBottomLayer"          : "EcoStatusCtrl_iEloop_CarBottomLayer",
            "iEloopCarGlow"                 : "EcoStatusCtrlHidden",
            "iEloopChargeShaft"             : "EcoStatusCtrlHidden",
            "iEloopFrontWheelsGlow"         : "EcoStatusCtrlHidden",
            "iEloopBattery"                 : "EcoStatusCtrlHidden",
            "iEloopBatteryGlow"             : "EcoStatusCtrlHidden",
            "iEloopAlternator"              : "EcoStatusCtrlHidden",
            "iEloopEngine"                  : "EcoStatusCtrl_iEloop_Engine",
            "iEloopWheelToAltCharge"        : "EcoStatusCtrl_iEloop_WheelToAltCharge_01",
            "iEloopAltToBatteryCharge"      : "EcoStatusCtrl_iEloop_AltToBatteryCharge_01",
            "iEloopBatteryToCarDischarge"   : "EcoStatusCtrl_iEloop_BatteryToCarDischarge",
            "iEloopCarTopLayer"             : "EcoStatusCtrl_iEloop_CarTopLayer",
			"carJ12Wheels"					: null,

            // i-Stop UI elements (mode-independent)
            "iStopContainer"                : "EcoStatusCtrl_iStop_Container",
            "iStopTitle"                    : "EcoStatusCtrl_iStop_Title",

            // Fuel Efficiency UI elements
            "fuelEfficiencyContainer"       : "EcoStatusCtrl_FuelEfficiency_Container",
            "fuelEfficiencyTitle"           : "EcoStatusCtrl_FuelEfficiency_Title",
            "fuelEfficiencyValue"           : "EcoStatusCtrl_FuelEfficiency_Value",
            "fuelEfficiencyUnit"            : "EcoStatusCtrl_FuelEfficiency_Unit",
            "fuelSinceReset"				: "EcoStatusCtrl_FuelEfficiency_SinceReset",
	
        },
    };
    //@formatter:on
    
    // Lists of CSS styles for all I-STOP UI elements in each available I-STOP mode.
    // NOTE: The list keys must match the names of the HTML objects
    //       created in _createStructure(), so they can be properly
    //       applied via the loop in setIStopMode().
    //@formatter:off
    this.ISTOP_MODE_STYLES =
    {
        "Status":
        {
            "iStopStatusText"       : "EcoStatusCtrl_iStop_Status_Text",
            "iStopStatusEngine"     : "EcoStatusCtrl_iStop_Status_Engine",
            "iStopStatusBattery"    : "EcoStatusCtrl_iStop_Status_Battery",
            "iStopStatusAC"         : "EcoStatusCtrl_iStop_Status_AC",
            "iStopErrorText"        : "EcoStatusCtrlHidden",
            "iStopTimeFrame"        : "EcoStatusCtrlHidden",
            "iStopTimeTitle"        : "EcoStatusCtrlHidden",
            "iStopTimeValue"        : "EcoStatusCtrlHidden",
            "iStopTimeTotalTitle"   : "EcoStatusCtrlHidden",
            "iStopTimeTotalValue"   : "EcoStatusCtrlHidden",
            
        },
        "Error":
        {
            "iStopStatusText"       : "EcoStatusCtrlHidden",
            "iStopStatusEngine"     : "EcoStatusCtrlHidden",
            "iStopStatusBattery"    : "EcoStatusCtrlHidden",
            "iStopStatusAC"         : "EcoStatusCtrlHidden",
            "iStopErrorText"        : "EcoStatusCtrl_iStop_Error_Text",
            "iStopErrorLine1"       : "EcoStatusCtrl_iStop_Error_Text_Line1",
            "iStopErrorLine2"       : "EcoStatusCtrl_iStop_Error_Text_Line2",
            "iStopTimeFrame"        : "EcoStatusCtrlHidden",
            "iStopTimeTitle"        : "EcoStatusCtrlHidden",
            "iStopTimeValue"        : "EcoStatusCtrlHidden",
            "iStopTimeTotalTitle"   : "EcoStatusCtrlHidden",
            "iStopTimeTotalValue"   : "EcoStatusCtrlHidden",
            "iStopTimeLeftBg"		: "EcoStatusCtrlHidden",
            "iStopTimeRightBg"		: "EcoStatusCtrlHidden"
            
        },
        "Time":
        {
            "iStopStatusText"       : "EcoStatusCtrlHidden",
            "iStopStatusEngine"     : "EcoStatusCtrlHidden",
            "iStopStatusBattery"    : "EcoStatusCtrlHidden",
            "iStopStatusAC"         : "EcoStatusCtrlHidden",
            "iStopErrorText"        : "EcoStatusCtrlHidden",
            "iStopTimeFrame"        : "EcoStatusCtrl_iStop_Time_Frame",
            "iStopTimeLeftBg"		: "EcoStatusCtrl_iStop_Time_Bg_Left",
            "iStopTimeRightBg"		: "EcoStatusCtrl_iStop_Time_Bg_Right",
            "iStopTimeTitle"        : "EcoStatusCtrl_iStop_Time_Title",
            "iStopTimeValue"        : "EcoStatusCtrl_iStop_Time_Value",
            "iStopTimeTotalTitle"   : "EcoStatusCtrl_iStop_Time_TotalTitle",
            "iStopTimeTotalValue"   : "EcoStatusCtrl_iStop_Time_TotalValue"
           
        },
        "Unknown":
        {
            "iStopStatusText"       : "EcoStatusCtrlHidden",
            "iStopStatusEngine"     : "EcoStatusCtrlHidden",
            "iStopStatusBattery"    : "EcoStatusCtrlHidden",
            "iStopStatusAC"         : "EcoStatusCtrlHidden",
            "iStopErrorText"        : "EcoStatusCtrlHidden",
            "iStopTimeFrame"        : "EcoStatusCtrlHidden",
            "iStopTimeTitle"        : "EcoStatusCtrlHidden",
            "iStopTimeValue"        : "EcoStatusCtrlHidden",
            "iStopTimeTotalTitle"   : "EcoStatusCtrlHidden",
            "iStopTimeTotalValue"   : "EcoStatusCtrlHidden",
            "iStopTimeLeftBg"		: "EcoStatusCtrlHidden",
            "iStopTimeRightBg"		: "EcoStatusCtrlHidden"
           
        },
        "NA":
        {
            "iStopStatusText"       : "EcoStatusCtrlHidden",
            "iStopStatusEngine"     : "EcoStatusCtrlHidden",
            "iStopStatusBattery"    : "EcoStatusCtrlHidden",
            "iStopStatusAC"         : "EcoStatusCtrlHidden",
            "iStopErrorText"        : "EcoStatusCtrlHidden",
            "iStopTimeFrame"        : "EcoStatusCtrlHidden",
            "iStopTimeTitle"        : "EcoStatusCtrlHidden",
            "iStopTimeValue"        : "EcoStatusCtrlHidden",
            "iStopTimeTotalTitle"   : "EcoStatusCtrlHidden",
            "iStopTimeTotalValue"   : "EcoStatusCtrlHidden",
            "iStopTimeLeftBg"		: "EcoStatusCtrlHidden",
            "iStopTimeRightBg"		: "EcoStatusCtrlHidden"
            
        },
    }
    //@formatter:on
    this._iStopMode = "Unknown"; // Default mode

    //@formatter:off
    this.properties =
    {
    	"subMap"                   : null,
    	"ctrlStyle"                : "",
    	"selectCallback"           : null,
    	"fuelEfficiencyTitleId"    : "",
    	"fuelEfficiencyTitleText"  : "",
        "switchViewId"             : "",
        "switchViewText"           : "",
    	"fuelEfficiencyData"       : null,
    	"iEloopConfig"             : null,
    	"iEloopData"               : null,
    	"iStopConfig"              : null,
    	"iStopData"                : null,
    	"umpButtonConfig" 		   :  null,
        "defaultSelectCallback"    : null,
        "defaultSlideCallback" 	   : null,
        "defaultHoldStartCallback" : null,
        "defaultHoldStopCallback"  : null,
        "dataList" 				   : null,
        "umpStyle" 				   : null,
        "hasScrubber" 			   : false,
        "umpPanelStatus"		   : false,
		"vehicleType"			   :null,
		"text1Id"				   : null
    };
    //@formatter:on

    // Copy properties from the app
    for (var key in properties)
    {
        this.properties[key] = properties[key];
    }
	
	//preload images 
    this.imagesCount = 0;
	if(this.properties.vehicleType==="SETTINGS_VehicleModelType_J12A")
	{
		this._preload('ArrowCharge01_Flow1_Sprite.png','ArrowCharge01_Flow2_Sprite.png','ArrowCharge02_Flow1_Sprite.png','ArrowCharge02_Flow2_Sprite.png','ArrowCharge03_Flow1_Sprite.png','ArrowCharge03_Flow2_Sprite.png','ArrowCharge04_Flow1_Sprite.png','ArrowCharge04_Flow2_Sprite.png','ArrowCharge05_Flow1_Sprite.png','ArrowCharge05_Flow2_Sprite.png'/*,'HEV_car_glow.png','HEV_car_outline.png','HEV_car_under.png','BatterySprite.png','HEV_battery_charging.png','TyresJ12.png'*/);
	}
    // Create DOM elements
    this._createStructure();
    
    this.wheelAltChargeInterval = null; 
    this.capDisChargeInterval = null;
}

EcoStatusCtrl.prototype._next = function(count)
{
	this.imagesCount++;
	if(this.imagesCount >= count)
	{
		this.controlDiv.className = "EcoStatusCtrl";
	}
}

EcoStatusCtrl.prototype._preload = function()
{
	var images = new Array();
	var prefix = './apps/ecoenergy/controls/EcoStatus/images/EcoStatus_J12A_Assets/';
	for(var i = 0; i < this._preload.arguments.length; i++)
	{
		images[i] = new Image();
		images[i].src = prefix + this._preload.arguments[i];
		images[i].onload = this._next.bind(this, this._preload.arguments.length);
	}
}
/*******************/
/* Private Methods */
/*******************/ 

EcoStatusCtrl.prototype._init = function()
{
    log.debug("EcoStatusCtrl: _init() called...");	
    if (this.properties.iEloopConfig)
    {
        // Set the i-ELOOP title text
        this.properties.iEloopConfig.iEloopTitleText = this._translateString(this.properties.iEloopConfig.iEloopTitleId,
                                                                             this.properties.iEloopConfig.iEloopTitleText,
                                                                             this.properties.subMap);
        this.iEloopTitle.innerHTML = this._stringToHTML(this.properties.iEloopConfig.iEloopTitleText);

        // Initialize the capacitor level current value (used to drive the animation timer)
        this._currentCapChgLvl = 0;

        // Bind the animation timer callback once (to save memory), since we never change the callback
        this._capChgLvlTimerCallbackHandle = this._capChgLvlTimerCallback.bind(this);
        
        // Initialize charge flow level 
        this._currentChargeLevel = 0;
        
        // Bind the animation timer callback for charge flow level 
        this._chargeLvlTimerCallbackHandle = this._chargeLvlTimerCallback.bind(this);
        
        // Set the i-ELOOP data
		this.setIEloopData(this.properties.iEloopData, true);
    }

    if (this.properties.iStopConfig)
    {
        // Set the i-STOP title text
        this.properties.iStopConfig.iStopTitleText = this._translateString(this.properties.iStopConfig.iStopTitleId,
                                                                           this.properties.iStopConfig.iStopTitleText,
                                                                           this.properties.subMap);
        this.iStopTitle.innerHTML = this._stringToHTML(this.properties.iStopConfig.iStopTitleText);

        // Set the i-STOP time title text (time for this ignition cycle)
        this.properties.iStopConfig.iStopTimeTitleText = this._translateString(this.properties.iStopConfig.iStopTimeTitleId,
                                                                               this.properties.iStopConfig.iStopTimeTitleText,
                                                                               this.properties.subMap);
        this.iStopTimeTitle.innerHTML = this._stringToHTML(this.properties.iStopConfig.iStopTimeTitleText);

        // Set the i-STOP total time title text (time for vehicle lifetime)
        this.properties.iStopConfig.iStopTotalTitleText = this._translateString(this.properties.iStopConfig.iStopTotalTitleId,
                                                                                this.properties.iStopConfig.iStopTotalTitleText,
                                                                                this.properties.subMap);
        this.iStopTimeTotalTitle.innerHTML = this._stringToHTML(this.properties.iStopConfig.iStopTotalTitleText);

        // Set the i-STOP mode directly, based on configuration data
        // (Also sets the status/error/time data)
        
		this.setIStopMode(this.properties.iStopData.iStopMode);
    }

    // Set the fuel efficiency title text
    this.properties.fuelEfficiencyTitleText = this._translateString(this.properties.fuelEfficiencyTitleId,
                                                                    this.properties.fuelEfficiencyTitleText,
                                                                    this.properties.subMap);
    this.properties.fuelEfficiencyTypeText = this._translateString(this.properties.fuelEfficiencyTypeId,
            this.properties.fuelEfficiencyTypeText,
            this.properties.subMap);

    if(this.properties.ctrlStyle === "iEloopOnly")
    {		   	
		var iEloopOnlyTitle = this._translateString(this.properties.text1Id);
    	this.fuelEfficiencyTitle.innerHTML = this._stringToHTML(iEloopOnlyTitle);	
    }
    else
    {
    	this.fuelEfficiencyTitle.innerHTML = this._stringToHTML(this.properties.fuelEfficiencyTitleText);
    	this.fuelSinceReset.innerHTML = this._stringToHTML(this.properties.fuelEfficiencyTypeText);
    }

    // Set the switch view button label
    var buttonLabel = this._translateString(this.properties.switchViewId,
                                            this.properties.switchViewText,
                                            this.properties.subMap);
    this.switchViewButtonCtrl.setButtonLabel(buttonLabel);

    // Set the fuel efficiency data
    this.setFuelEfficiency(this.properties.fuelEfficiencyData);
	if(this.properties.vehicleType==="SETTINGS_VehicleModelType_J12A")
	{
		this._arrowanimationJ12();
	}
	this.setdiv(this.properties.vehicleType);
	
}
EcoStatusCtrl.prototype._changeStyleForJ12 = function()
{

	 this.STYLES.iEloopiStop.iEloopContainer = "EcoStatusCtrl_iEloop_Container_J12";
	 this.STYLES.iEloopiStop.iEloopCarBottomLayer = "EcoStatusCtrl_iEloop_CarBottomLayer_J12";
	 this.STYLES.iEloopiStop.iEloopCarTopLayer = "EcoStatusCtrl_iEloop_CarTopLayer_J12";
	 this.STYLES.iEloopiStop.iEloopAlternator = "EcoStatusCtrl_iEloop_Alternator_Off_J12";
	 this.STYLES.iEloopiStop.iEloopTitle = "EcoStatusCtrl_iEloop_Title_J12";
	 this.STYLES.iEloopiStop.iEloopBatteryToCarDischarge = "EcoStatusCtrl_iEloop_BatteryToCarDischarge_J12";   
	 this.STYLES.iEloopiStop.carJ12Wheels = "TyresJ12";
	 
	 this.STYLES.iEloopOnly.iEloopContainer = "EcoStatusCtrl_iEloop_Container_J12";
	 this.STYLES.iEloopOnly.iEloopCarBottomLayer = "EcoStatusCtrl_iEloopOnly_iEloop_CarBottomLayer_J12";
	 this.STYLES.iEloopOnly.iEloopCarTopLayer = "EcoStatusCtrl_iEloop_CarTopLayer_J12";
	 this.STYLES.iEloopOnly.iEloopAlternator = "EcoStatusCtrl_iEloop_Alternator_Off_J12";
	 this.STYLES.iEloopOnly.iEloopTitle = "EcoStatusCtrl_iEloop_Title_J12";
	 this.STYLES.iEloopOnly.iEloopBatteryToCarDischarge = "EcoStatusCtrl_iEloop_BatteryToCarDischarge_J12";
	 this.STYLES.iEloopOnly.carJ12Wheels = "TyresJ12"; 
	 
	 this.STYLES.iStopOnly.iEloopContainer = "EcoStatusCtrl_iEloop_Container_J12";
	 this.STYLES.iStopOnly.iEloopCarBottomLayer = "EcoStatusCtrl_iEloop_CarBottomLayer_J12";
	 this.STYLES.iStopOnly.iEloopCarTopLayer = "EcoStatusCtrl_iEloop_CarTopLayer_J12";
	 this.STYLES.iStopOnly.iEloopBatteryToCarDischarge = "EcoStatusCtrl_iEloop_BatteryToCarDischarge_J12";
	 this.STYLES.iStopOnly.carJ12Wheels = "TyresJ12"; 
   
}
EcoStatusCtrl.prototype._createStructure = function()
{
    log.debug("creating structure for style: " + this.properties.ctrlStyle);

    // Create the div for control
    this.controlDiv = document.createElement('div');
	if(this.properties.vehicleType==="SETTINGS_VehicleModelType_J12A")
	{
		this.controlDiv.className = "EcoStatusCtrl_J12";
	}
	else
	{
		this.controlDiv.className = "EcoStatusCtrl";
	}


	this.umpPanelDiv = document.createElement('div');
	//(this.properties.umpPanelStatus) ? this.umpPanelDiv.className = "UmpPanelDivEnable" : this.umpPanelDiv.className = "UmpPanelDivDisable";
	this.umpPanelDiv.className = "UmpPanelDivDisable";
    
	/************************************************/
    /* Create DOM structure for i-Eloop UI elements */
    /************************************************/

    // Create div to contain all i-Eloop elements
    this.iEloopContainer = document.createElement('div');

    // Create div for i-Eloop title
    this.iEloopTitle = document.createElement('div');
    this.iEloopContainer.appendChild(this.iEloopTitle);

    // Create divs for car outline & discharge glow
    this.iEloopCarBottomLayer = document.createElement('div');
    this.iEloopContainer.appendChild(this.iEloopCarBottomLayer);
    this.iEloopCarGlow = document.createElement('div');
    this.iEloopContainer.appendChild(this.iEloopCarGlow);
    
    // Create div for glows for axle/driveshaft & front wheels
    this.iEloopChargeShaft = document.createElement('div');
    this.iEloopContainer.appendChild(this.iEloopChargeShaft);    
	this.carJ12Wheels = document.createElement('div');
	this.iEloopContainer.appendChild(this.carJ12Wheels);
	this.iEloopFrontWheelsGlow = document.createElement('div');
    this.iEloopContainer.appendChild(this.iEloopFrontWheelsGlow);
    
    // create div for battery glow 
    this.iEloopBatteryGlow = document.createElement('div');
    this.iEloopContainer.appendChild(this.iEloopBatteryGlow);

    // Create div for battery
    this.iEloopBattery = document.createElement('div');
    this.iEloopContainer.appendChild(this.iEloopBattery);
    
    // Create divs for alternator/engine
    this.iEloopAlternator = document.createElement('div');
    this.iEloopContainer.appendChild(this.iEloopAlternator);
    this.iEloopEngine = document.createElement('div');
    this.iEloopContainer.appendChild(this.iEloopEngine);

    // Create divs for (dis)charging arrows
    this.iEloopWheelToAltCharge = document.createElement('div');
    this.iEloopContainer.appendChild(this.iEloopWheelToAltCharge);
    this.iEloopAltToBatteryCharge = document.createElement('div');
    
    /** Create Div for Charge Elements **/
    if(this.properties.vehicleType==="SETTINGS_VehicleModelType_J12A")
	{
		for(var step = 1; step <= 5 ; step++)
		{
			var el = document.createElement('div');
			el.id = 'EcoStatusChargeLvl'+step;
			el.className = 'EcoStatusCtrl_animFlow2Charge'+step;
			this.iEloopContainer.appendChild(el);
		}
		for(var stepRt = 1; stepRt <= 5 ; stepRt++)
		{
			var ele = document.createElement('div');
			ele.id = 'EcoStatusChargeRightLvl'+stepRt;
			ele.className = 'EcoStatusCtrl_animFlow1Charge'+stepRt;
			this.iEloopContainer.appendChild(ele);
		}
		
	}
	else
	{
		for(var step = 1; step <= 5 ; step++)
		{
			var el = document.createElement('div');
			el.id = 'EcoStatusChargeLvl'+step;
			el.className = 'EcoStatusCtrl_anim'+step;
			this.iEloopContainer.appendChild(el);
		}
		
		for(var stepRt = 1; stepRt <= 5 ; stepRt++)
		{
			var ele = document.createElement('div');
			ele.id = 'EcoStatusChargeRightLvl'+stepRt;
			ele.className = 'EcoStatusCtrl_animRight'+stepRt;
			this.iEloopContainer.appendChild(ele);
		}
		
		for(var stepTop = 1; stepTop <= 5 ; stepTop++)
		{
			var elem = document.createElement('div');
			elem.id = 'EcoStatusChargeTopLvl'+stepTop;
			elem.className = 'EcoStatusCtrl_animTop'+stepTop;
			this.iEloopContainer.appendChild(elem);
		}
    }
    
    if(this.properties.vehicleType==="SETTINGS_VehicleModelType_J12A")
    {       
        this.iEloopBatteryToCarDischarge = document.createElement('div');
        this.iEloopBatteryToCarDischarge.id='EcoStatusDischargeJ12';
        this.iEloopBatteryToCarDischarge.className = 'EcoStatusCtrl_iEloop_BatteryToCarDischarge_J12';
        this.iEloopContainer.appendChild(this.iEloopBatteryToCarDischarge);
        
    }else
    {           
        
        this.iEloopBatteryToCarDischarge = document.createElement('div');
        this.iEloopContainer.appendChild(this.iEloopBatteryToCarDischarge);

        this.iEloopBatteryToCarDischargeLeft = document.createElement('div');   
        this.iEloopBatteryToCarDischargeLeft.className = 'EcoStatusCtrl_iEloop_BatteryToCarDischargeLeft';  
        this.iEloopContainer.appendChild(this.iEloopBatteryToCarDischargeLeft);
        
        this.iEloopBatteryToCarDischargeRight = document.createElement('div');  
        this.iEloopBatteryToCarDischargeRight.className = 'EcoStatusCtrl_iEloop_BatteryToCarDischargeRight';    
        this.iEloopContainer.appendChild(this.iEloopBatteryToCarDischargeRight);    
    }
    
    // Create div for car outline (top layer)
    this.iEloopCarTopLayer = document.createElement('div');
    this.iEloopContainer.appendChild(this.iEloopCarTopLayer);

    // Attach the i-Eloop container to the control
    this.controlDiv.appendChild(this.iEloopContainer);
    
    /***********************************************/
    /* Create DOM structure for i-STOP UI elements */
    /***********************************************/

    // Create div to contain all i-STOP elements
    this.iStopContainer = document.createElement('div');

    // Create div for i-STOP title
    this.iStopTitle = document.createElement('div');
    this.iStopContainer.appendChild(this.iStopTitle);

    // Create span for i-STOP status text
    this.iStopStatusText = document.createElement('span');
    this.iStopContainer.appendChild(this.iStopStatusText);

    // Create div for engine status
    this.iStopStatusEngine = document.createElement('div');
    this.iStopContainer.appendChild(this.iStopStatusEngine);

    // Create div for battery status
    this.iStopStatusBattery = document.createElement('div');
    this.iStopContainer.appendChild(this.iStopStatusBattery);
    
    // Create div for AC status
    this.iStopStatusAC = document.createElement('div');
    this.iStopContainer.appendChild(this.iStopStatusAC);
    
    // Create div for i-STOP error
    this.iStopErrorText = document.createElement('div');
    this.iStopContainer.appendChild(this.iStopErrorText);
    
    // Create Span for i-Stop Error Line 1
    this.iStopErrorLine1 = document.createElement('span');
    this.iStopErrorText.appendChild(this.iStopErrorLine1);
    
    // Create Span for i-Stop Error Line 2
    this.iStopErrorLine2 = document.createElement('span');
    this.iStopErrorText.appendChild(this.iStopErrorLine2);
    
    // Create div for i-STOP time frame
    this.iStopTimeFrame = document.createElement('div');
    
    // Create div for i-STOP Left BG frame 
    this.iStopTimeLeftBg = document.createElement('div');
    this.iStopTimeFrame.appendChild(this.iStopTimeLeftBg);
    
    // Create div for i-STOP Right BG frame 
    this.iStopTimeRightBg = document.createElement('div');
    this.iStopTimeFrame.appendChild(this.iStopTimeRightBg);
    
    // Create div for i-STOP time title
    this.iStopTimeTitle = document.createElement('div');
    this.iStopTimeFrame.appendChild(this.iStopTimeTitle);
    
    // Create div for i-STOP time
    this.iStopTimeValue = document.createElement('div');
    this.iStopTimeFrame.appendChild(this.iStopTimeValue);
    
    // Create div for i-STOP total time title
    this.iStopTimeTotalTitle = document.createElement('div');
    this.iStopTimeFrame.appendChild(this.iStopTimeTotalTitle);
    
    // Create div for i-STOP total time
    this.iStopTimeTotalValue = document.createElement('div');
    this.iStopTimeFrame.appendChild(this.iStopTimeTotalValue);

    // Attach the i-STOP time frame to the i-STOP container
    this.iStopContainer.appendChild(this.iStopTimeFrame);

    // Attach the i-STOP container to the control
    this.controlDiv.appendChild(this.iStopContainer);
        
    /********************************************************/
    /* Create DOM structure for fuel efficiency UI elements */
    /********************************************************/

    // Create div to contain all fuel efficiency elements
    this.fuelEfficiencyContainer = document.createElement('div');

    // Create span for fuel efficiency title
    this.fuelEfficiencyTitle = document.createElement('span');
    this.fuelEfficiencyContainer.appendChild(this.fuelEfficiencyTitle);
    
    // Create span for fuel efficiency value
    this.fuelEfficiencyValue = document.createElement('span');
    this.fuelEfficiencyContainer.appendChild(this.fuelEfficiencyValue);

    // Create span for fuel efficiency unit
    this.fuelEfficiencyUnit = document.createElement('span');
    this.fuelEfficiencyContainer.appendChild(this.fuelEfficiencyUnit);

    // create a div for (Since Reset) text 
    this.fuelSinceReset = document.createElement('div');
    this.controlDiv.appendChild(this.fuelSinceReset);
    
    // Attach the fuel efficiency container to the control
    this.controlDiv.appendChild(this.fuelEfficiencyContainer);

    // Apply control element styles, assuming the control elements' names
    // are used as keys in the CSS style arrays (this.STYLES)
	
	if(this.properties.vehicleType==="SETTINGS_VehicleModelType_J12A")
	{
		this._changeStyleForJ12();
	}
    for (var i in this.STYLES[this.properties.ctrlStyle])
    {
        this[i].className = this.STYLES[this.properties.ctrlStyle][i];
    }

    // Attach control to parent        
    this.divElt.appendChild(this.controlDiv);
    this.divElt.appendChild(this.umpPanelDiv);
    
    var umpConfig = {
        "buttonConfig" : this.properties['umpButtonConfig'],
        "defaultSelectCallback" : this.properties['defaultSelectCallback'],
        "defaultLongPressCallback" : this.properties['defaultLongPressCallback'],
        "defaultScrubberCallback" : this.properties['defaultScrubberCallback'],
        "defaultHoldStartCallback" : this.properties['defaultHoldStartCallback'],
        "defaultHoldStopCallback" : this.properties['defaultHoldStopCallback'],
        "umpStyle" : this.properties['umpStyle'],
        "hasScrubber" : this.properties['hasScrubber'],
        "scrubberConfig" : this.properties['scrubberConfig'],
        "retracted" : true
    };
    //@formatter:on
    log.debug("Instantiating umpCtrl...");
    this.umpCtrl = framework.instantiateControl(this.uiaId, this.umpPanelDiv, "Ump3Ctrl", umpConfig);
    
    
    // Instantiate the "Switch View" button
    //@formatter:off
    var btnInstanceProperties =
    {
        "selectCallback" : this._selectHandler.bind(this),
        "enabledClass" : "EcoStatusCtrl_SwitchView",
        "disabledClass" : null,
        "focusedClass": null,
        "downClass" : "EcoStatusCtrl_SwitchView_Hit",
        "heldClass" : "EcoStatusCtrl_SwitchView_Hit",
        "appData" : this.properties.appData,
    };
    //@formatter:on
    this.switchViewButtonCtrl = framework.instantiateControl(this.uiaId, this.controlDiv, "ButtonCtrl", btnInstanceProperties);
    this._init();
}

/*
 * Utility function to look up a translatable string ID and/or accept a default text string.
 */
EcoStatusCtrl.prototype._translateString = function(strId, strText, subMap)
{
//    log.debug("_translateString called: strId = " + strId + ", strText = " + strText);

    var translatedText = null;

    if (strId)
    {
        translatedText = framework.localize.getLocStr(this.uiaId, strId, subMap);
    }
    else if (strText)
    {
        translatedText = strText;
    }

    return translatedText;
}

/*
 * Utility function to make a text string suitable for HTML block-rendering
 */
EcoStatusCtrl.prototype._stringToHTML = function(textStr)
{
//    log.debug("_stringToHTML called: textStr = " + textStr);

    var htmlText;

    if (textStr)
    {
        htmlText = textStr + "<br/>";
    }
    else
    {
        htmlText = "";
    }

    return htmlText;
}

/*
 * Utility function to readably format a duration (expressed in milliseconds)
 * TODO: Use the utility.getDurationPieces() APIs once they're ready in the framework
 */
EcoStatusCtrl.prototype._formatDurationString = function(durationMs, isTotal)
{
    log.debug("_formatDurationString called: durationMs = " + durationMs);

    var durationStr = "";

    if (utility.toType(durationMs) === "number")
    {
        var durationSec = Math.floor(durationMs / 1000);
        var hours       = Math.floor(durationSec / 3600);
        var minutes     = Math.floor((durationSec - (hours * 3600)) / 60);
        var seconds     = durationSec - (hours * 3600) - (minutes * 60);
    
        if (hours > 0)
        {
            durationStr += hours+'<span class="EcoStatusCtrl_timeUnit">h </span>';
        }
        
        if(!isTotal)
        {
        	if ((durationStr !== "") ||
                    (minutes > 0))
                {
                    durationStr += minutes+'<span class="EcoStatusCtrl_timeUnit">m </span>';
                }
        	if ((durationStr !== "") ||
        			(seconds > 0))
        	{
        		durationStr += seconds+'<span class="EcoStatusCtrl_timeUnit">s</span>';
        	}
        }
        else
        {
        	if ((durationStr !== "") ||
                    (minutes > 0))
                {
                    durationStr += minutes+'<span class="EcoStatusCtrl_timeUnit">m </span>';
                }
        	else
        	{
        		durationStr += '0'+'<span class="EcoStatusCtrl_timeUnit">m </span>';
        	}
        }
    }
    else
    {
        log.warn("passed-in duration is not a Date object!");
    }

    log.debug("_formatDurationString returning \"" + durationStr + "\"");
    
    return durationStr;
}

/*
 * Callback for "Switch View" button selections -- when called, trigger the
 * configured application callback.
 */
EcoStatusCtrl.prototype._selectHandler = function(buttonObj, appData, params)
{
    if (typeof(this.properties.selectCallback) === "function")
    {
        this.properties.selectCallback(this, appData, null);
        
    }
    else
    {
        log.warn("EcoStatusCtrl: no valid selectCallback configured");
    }
}

// Utility function to start up the clock timer for the capacitor low-pass filter animation
EcoStatusCtrl.prototype._capChgLvlTimerStart = function()
{
    // Make sure a callback handle has been configured (e.g. the current style supports i-ELOOP)
    if (utility.toType(this._capChgLvlTimerCallbackHandle) === "function")
    {
        // If the timer's not already running, ...
        if (this._capChgLvlTimer == null)
        {
            log.debug("Starting _capChgLvlTimer...");

            // ... start a timer to take the next step in the animation
            this._capChgLvlTimer = setInterval(this._capChgLvlTimerCallbackHandle,
                                              600);
        }
    }
    else
    {
        log.warn("No timer callback available for the capacitor level low-pass filter animation!");
    }
}

EcoStatusCtrl.prototype._getReceivedChargeLevel = function()
{
	var receivedChargeLvl = 0; 
	var rgnPwrLvl = this.properties.iEloopData.rgnPwrLvl;
	
    if(rgnPwrLvl == 1 || rgnPwrLvl == 2)
    {
    	receivedChargeLvl = 1;
    }
    else if(rgnPwrLvl == 3 || rgnPwrLvl == 4)
    {
    	receivedChargeLvl = 2;
    }
    else if(rgnPwrLvl == 5 || rgnPwrLvl == 6)
    {
    	receivedChargeLvl = 3;
    }
    else if(rgnPwrLvl == 7 || rgnPwrLvl == 8)
    {
    	receivedChargeLvl = 4;
    }
    else if(rgnPwrLvl == 9 || rgnPwrLvl == 10)
    {
    	receivedChargeLvl = 5;
    }
    
    return receivedChargeLvl;
}

EcoStatusCtrl.prototype._chargeLvlTimerCallback = function()
{
	if(this.properties.iEloopData)
	{
		
		var receivedChargeLvl = this._getReceivedChargeLevel(); 
		var delta = receivedChargeLvl -   this._currentChargeLevel;
        if(delta == 0)
        {
		
        	// Cleanup the arrow time interval
        	this._chargeLvlTimerCleanup();
        }
        else if(Math.abs(delta) == 1)
        {
		
        	this._currentChargeLevel = receivedChargeLvl;
        	
        	// Timer start for charge level flow
        	this._chargeLvlTimerStart();
        }
        else
        {
		
        	this._currentChargeLevel += (delta > 0) ? 1 : -1;
        	// make sure charge flow animation are running
        	this._chargeLvlTimerStart();

        }
        if(this._currentChargeLevel > 0)
        {
		
			this._keyframeChargeAnimation('REGENERATION',this._currentChargeLevel);
			this._previousCharge = this._currentChargeLevel;
        }
	}
	else
	{
	
		// Clean up any active timer forcharge flow animation
		this._chargeLvlTimerCleanup();
		this._currentChargeLevel = 0;
	}
}


//Utility function to start up the clock timer for the chargeFlow Level animation
EcoStatusCtrl.prototype._chargeLvlTimerStart = function()
{
    // Make sure a callback handle has been configured (e.g. the current style supports i-ELOOP)
    if (utility.toType(this._chargeLvlTimerCallbackHandle) === "function")
    {
        // If the timer's not already running, ...
        if (this._chargeLevelTimer  == null)
        {
            // ... start a timer to take the next step in the animation
			if(this.properties.vehicleType!="SETTINGS_VehicleModelType_J12A")
			{
			
				this._chargeLevelTimer = setInterval(this._chargeLvlTimerCallbackHandle,
                                             600);
			}
        }
    }
    else
    {
        log.warn("No timer callback available for the charge flow level animation!");
    }
}

EcoStatusCtrl.prototype._chargeLvlTimerCleanup = function()
{
	if(this._chargeLevelTimer != null)
	{
		clearInterval(this._chargeLevelTimer);
		this._chargeLevelTimer  = null;
	}
}
/*******************************************************/

// Callback function to implement the capacitor low-pass filter animation
EcoStatusCtrl.prototype._capChgLvlTimerCallback = function()
{

    // If we have a target capacitor level, ...
    if (this.properties.iEloopData.capChgLvl != null)
    {
        // ... figure out how far away from the current level we are
        var delta = this.properties.iEloopData.capChgLvl - this._currentCapChgLvl;
        if (delta == 0)
        {
            // The animation is done -- we're at the target capacitor level.
            // Clean up any timer that might have brought us here.
            this._capChgLvlTimerCleanup();
        }
        else if (Math.abs(delta) == 1)
        {
            // We're adjacent to the target capacitor level, so go ahead & just set it.
            this._currentCapChgLvl = this.properties.iEloopData.capChgLvl;

            // Make sure the animation timer is running, so we pace any other capacitor
            // level changes properly (e.g. a rapid series of setIEloopData() calls with
            // capacitor levels changing by 1 each time)
            this._capChgLvlTimerStart();
        }
        else
        {
            // We're far enough away from the target to animate the transition.
            // Update our current capacitor level towards the target
            this._currentCapChgLvl += (delta > 0) ? 1 : -1;

            // Make sure the timer's running to continue the animation
            this._capChgLvlTimerStart();
        }
 
        // Update the capacitor charge level display
        if (this._currentCapChgLvl > 0)
        {
			if(this.properties.vehicleType==="SETTINGS_VehicleModelType_J12A")
			{
				this.iEloopBattery.className = "EcoStatusCtrlCarBattery_J12_0"+ this._currentCapChgLvl;
			}
			else
			{
				this.iEloopBattery.className = "EcoStatusCtrl_iEloop_Battery_0"+ this._currentCapChgLvl;
			}
        }
        else
        {
			if(this.properties.vehicleType==="SETTINGS_VehicleModelType_J12A")
			{
				this.iEloopBattery.className = "EcoStatusCtrlCarBattery_J12";
			}
			else
			{
				this.iEloopBattery.className = "EcoStatusCtrl_iEloop_Battery_Off";
			}
        }
    }
    else
    {
        // Otherwise, stop any capacitor low-pass filter animation
        this._capChgLvlTimerCleanup();

        // Forget our current capChgLvl
        this._currentCapChgLvl = 0;
		
        // Turn the capacitor charge level display off
		if(this.properties.vehicleType==="SETTINGS_VehicleModelType_J12A")
		{
			this.iEloopBattery.className = "EcoStatusCtrlCarBattery_J12";
		}
		else
		{
			this.iEloopBattery.className = "EcoStatusCtrl_iEloop_Battery_Off";
		}
    }

}

// Utility function to clean up the clock timer for the capacitor low-pass filter animation
EcoStatusCtrl.prototype._capChgLvlTimerCleanup = function()
{
    if (this._capChgLvlTimer != null)
    {
        log.debug("Cleaning up _capChgLvlTimer...");

        // Turn off the timer triggering time modification events
        clearInterval(this._capChgLvlTimer);
        this._capChgLvlTimer = null;
    }
}

EcoStatusCtrl.prototype._regenCleanUp = function()
{
	if(this._chargeLevelTimer != null)
	{
		this._chargeLvlTimerCleanup();
	}
	this.currentChargeMagnitude = 0;
	this._currentChargeLevel = 0;
	if(this.properties.vehicleType==="SETTINGS_VehicleModelType_J12A")
	{
		for(var i = 1; i <=5; i++)
		{
			var elementReg = document.getElementById('EcoStatusChargeLvl'+i);
			var rightElementReg = document.getElementById('EcoStatusChargeRightLvl'+i);		
			elementReg.style.visibility = "hidden";
			rightElementReg.style.visibility = "hidden";
		}
	}
	else
	{		
		for(var i = 1; i <=5; i++)
		{
			var elementReg = document.getElementById('EcoStatusChargeLvl'+i);
			var topElementReg = document.getElementById('EcoStatusChargeTopLvl'+i);
			var rightElementReg = document.getElementById('EcoStatusChargeRightLvl'+i);	
			elementReg.style.opacity = this._TRANSPARENT;
			topElementReg.style.opacity = this._TRANSPARENT;
			rightElementReg.style.opacity = this._TRANSPARENT;
		}
	}
}
EcoStatusCtrl.prototype._arrowanimationJ12 = function()
{
	if(this.arrowAnimJ12Timer==null)
	{
		this.arrowAnimJ12Timer = setInterval(this._startArrowAnimtions.bind(this), 20);
	}
}


EcoStatusCtrl.prototype._findCurrentId = function()
{
	var receivedChargeLvl = this._getReceivedChargeLevel(); 
	var delta = receivedChargeLvl -   this._currentChargeLevel;
	
	if(delta == 0)
	{

	}
	else if(Math.abs(delta) == 1)
	{
		this._currentChargeLevel = receivedChargeLvl;
		this._id = this._currentChargeLevel;
	}
	else
	{
		this._currentChargeLevel += (delta > 0) ? 1 : -1;
		this._id = this._currentChargeLevel;
	}
	this._id = this._currentChargeLevel;
}



EcoStatusCtrl.prototype._startArrowAnimtions = function(amit,charge)
{

	var degenelement = document.getElementById('EcoStatusDischargeJ12');
   	
	var element1 = document.getElementById('EcoStatusChargeLvl1');
	var element2 = document.getElementById('EcoStatusChargeLvl2');
	var element3 = document.getElementById('EcoStatusChargeLvl3');
	var element4 = document.getElementById('EcoStatusChargeLvl4');
	var element5 = document.getElementById('EcoStatusChargeLvl5');
	
	var horizontalElement1 = document.getElementById('EcoStatusChargeRightLvl1');
	var horizontalElement2 = document.getElementById('EcoStatusChargeRightLvl2');
	var horizontalElement3 = document.getElementById('EcoStatusChargeRightLvl3');
	var horizontalElement4 = document.getElementById('EcoStatusChargeRightLvl4');
	var horizontalElement5 = document.getElementById('EcoStatusChargeRightLvl5');
	
	var id = this._id;
	switch(this._animationType)
	{
	case "REGENERATION":
		this._counter = this._counter+1;
		if((this._counter%30)==0)
		{
			this._counter = 0;
			this._findCurrentId();
			id=this._id;	
			
		}
		this._showAnimation(id);		
	break;
	case "DEGENERATION":
		this._regenCleanUp();
		degenelement.style.visibility ="visible";	
		this._showAnimation();
	break;
	default : 
		degenelement.style.visibility ="hidden";
		this._regenCleanUp();
	break;
	}	
}

EcoStatusCtrl.prototype._showAnimation = function(level)
{
	var degenelement = document.getElementById('EcoStatusDischargeJ12');
    
	var element1 = document.getElementById('EcoStatusChargeLvl1');
	var element2 = document.getElementById('EcoStatusChargeLvl2');
	var element3 = document.getElementById('EcoStatusChargeLvl3');
	var element4 = document.getElementById('EcoStatusChargeLvl4');
	var element5 = document.getElementById('EcoStatusChargeLvl5');
	
	var horizontalElement1 = document.getElementById('EcoStatusChargeRightLvl1');
	var horizontalElement2 = document.getElementById('EcoStatusChargeRightLvl2');
	var horizontalElement3 = document.getElementById('EcoStatusChargeRightLvl3');
	var horizontalElement4 = document.getElementById('EcoStatusChargeRightLvl4');
	var horizontalElement5 = document.getElementById('EcoStatusChargeRightLvl5');
	
	if(this._animationType == "REGENERATION")
	{
		degenelement.style.visibility ="hidden";
		element1.style.visibility = this._pattern[0][level];
		element2.style.visibility = this._pattern[1][level];
		element3.style.visibility = this._pattern[2][level];
		element4.style.visibility = this._pattern[3][level];
		element5.style.visibility = this._pattern[4][level];
		horizontalElement1.style.visibility = this._pattern[0][level];
		horizontalElement2.style.visibility = this._pattern[1][level];
		horizontalElement3.style.visibility = this._pattern[2][level];
		horizontalElement4.style.visibility = this._pattern[3][level];
		horizontalElement5.style.visibility = this._pattern[4][level];
	
	
		element1.style.backgroundPosition = '0px -'+this.arrowAnimationCount1+'px';
		element2.style.backgroundPosition = '0px -'+this.arrowAnimationCount2+'px';
		element3.style.backgroundPosition = '0px -'+this.arrowAnimationCount3+'px';
		element4.style.backgroundPosition = '0px -'+this.arrowAnimationCount4+'px';
		element5.style.backgroundPosition = '0px -'+this.arrowAnimationCount5+'px';
		
		horizontalElement1.style.backgroundPosition = '0px -'+this.horizontalArrowAnimationCount1+'px';
		horizontalElement2.style.backgroundPosition = '0px -'+this.horizontalArrowAnimationCount2+'px';
		horizontalElement3.style.backgroundPosition = '0px -'+this.horizontalArrowAnimationCount3+'px';
		horizontalElement4.style.backgroundPosition = '0px -'+this.horizontalArrowAnimationCount4+'px';
		horizontalElement5.style.backgroundPosition = '0px -'+this.horizontalArrowAnimationCount5+'px';
		
		if(this.horizontalArrowAnimationCount1 == 1615)
		{
			this.horizontalArrowAnimationCount1 = 0;
		}
		else
		{
			this.horizontalArrowAnimationCount1 += 95;
		}
		
		if(this.horizontalArrowAnimationCount2 == 1615)
		{
			this.horizontalArrowAnimationCount2 = 0;
		}
		else
		{
			this.horizontalArrowAnimationCount2 += 95;
		}
		
		if(this.horizontalArrowAnimationCount3 == 1615)
		{
			this.horizontalArrowAnimationCount3 = 0;
		}
		else
		{
			this.horizontalArrowAnimationCount3 += 95;
		}
		
		if(this.horizontalArrowAnimationCount4 == 1615)
		{
			this.horizontalArrowAnimationCount4 = 0;
		}
		else
		{
			this.horizontalArrowAnimationCount4 += 95;
		}
		
		if(this.horizontalArrowAnimationCount5 == 1615)
		{
			this.horizontalArrowAnimationCount5 = 0;
		}
		else
		{
			this.horizontalArrowAnimationCount5 += 95;
		}
		
		//For vertical Arrows
		if(this.arrowAnimationCount1 == 3570)
		{
			this.arrowAnimationCount1 = 0;
		}
		else
		{
			this.arrowAnimationCount1 += 210;
		}
		
		if(this.arrowAnimationCount2 == 3570)
		{
			this.arrowAnimationCount2 = 0;
		}
		else
		{
			this.arrowAnimationCount2 += 210;
		}
		
		if(this.arrowAnimationCount3 == 3570)
		{
			this.arrowAnimationCount3 = 0;
		}
		else
		{
			this.arrowAnimationCount3 += 210;
		}
		
		if(this.arrowAnimationCount4 == 3570)
		{
			this.arrowAnimationCount4 = 0;
		}
		else
		{
			this.arrowAnimationCount4 += 210;
		}
		
		if(this.arrowAnimationCount5 == 3570)
		{
			this.arrowAnimationCount5 = 0;
		}
		else
		{
			this.arrowAnimationCount5 += 210;
		}
		
		this.currentChargeMagnitude = level;
		
	}
	else if(this._animationType == "DEGENERATION")
	{
		degenelement.style.backgroundPosition = '0px -'+this.degenArrowAnimationCount+'px';
		if(this.degenArrowAnimationCount == 4250)
		{
			this.degenArrowAnimationCount = 0;
		}
		else
		{
			this.degenArrowAnimationCount += 250;
		}
	}
}




EcoStatusCtrl.prototype._keyframeChargeAnimation = function(iEloopSts, chargeLevel)
{

	// Enums as REGENERATION, DEGENERATION, BALANCED, NONE
	var prevElement = document.getElementById('EcoStatusChargeLvl'+this.currentChargeMagnitude);
	var prevTopElement = document.getElementById('EcoStatusChargeTopLvl'+this.currentChargeMagnitude);
	var prevRightElement = document.getElementById('EcoStatusChargeRightLvl'+this.currentChargeMagnitude);
	
	switch (iEloopSts) 
	{
	
		case 'REGENERATION':
			// set degen to transparent
			this.iEloopBatteryToCarDischarge.style.opacity = this._TRANSPARENT;
			this.iEloopBatteryToCarDischargeLeft.style.opacity = this._TRANSPARENT;
			this.iEloopBatteryToCarDischargeRight.style.opacity = this._TRANSPARENT;
		
			var element = document.getElementById('EcoStatusChargeLvl'+chargeLevel);
			var topElement = document.getElementById('EcoStatusChargeTopLvl'+chargeLevel);
			var rightElement = document.getElementById('EcoStatusChargeRightLvl'+chargeLevel);
			
				
			if(prevElement && prevTopElement && prevRightElement)
			{
				prevElement.style.opacity = this._TRANSPARENT;
				prevTopElement.style.opacity = this._TRANSPARENT;
				prevRightElement.style.opacity = this._TRANSPARENT;
			}
			
			if(element && topElement && rightElement)
			{
				element.style.opacity = this._OPAQUE;
				topElement.style.opacity = this._OPAQUE;
				rightElement.style.opacity = this._OPAQUE;
			}
			this.currentChargeMagnitude = chargeLevel;
			
			break;
		case 'DEGENERATION':
			this._regenCleanUp();
			this.iEloopBatteryToCarDischarge.style.opacity = this._OPAQUE;
			this.iEloopBatteryToCarDischargeLeft.style.opacity = this._OPAQUE;
			this.iEloopBatteryToCarDischargeRight.style.opacity = this._OPAQUE;			
			break;		
		case 'BALANCED':
		case 'NONE':
			this.iEloopBatteryToCarDischarge.style.opacity = this._TRANSPARENT;
			this.iEloopBatteryToCarDischargeLeft.style.opacity = this._TRANSPARENT;
			this.iEloopBatteryToCarDischargeRight.style.opacity = this._TRANSPARENT;
			this._regenCleanUp();
			break;
			
		default:
			
			this.iEloopBatteryToCarDischarge.style.opacity = this._TRANSPARENT;
			this.iEloopBatteryToCarDischargeLeft.style.opacity = this._TRANSPARENT;
			this.iEloopBatteryToCarDischargeRight.style.opacity = this._TRANSPARENT;
			this._regenCleanUp();
			break;
	}
	
}

/******************/
/* Public Methods */
/******************/


EcoStatusCtrl.prototype.setIEloopData = function(iEloopData, isInitializing)
{
    log.debug("EcoStatusCtrl: setIEloopData() called: iEloopData = { " +
                "dataKnown=" + iEloopData.dataKnown +
                ", capChgLvl=" + iEloopData.capChgLvl +
                ", rgnPwrLvl=" + iEloopData.rgnPwrLvl +
                ", electLdUsgLvl=" + iEloopData.electLdUsgLvl + " }");

    // Purge any "remembered" data, except for capacitor level (for low-pass filter animation)

    // Make sure we have an i-ELoop data object, but DO NOT purge the "remembered" data.
    // Instead, re-use the same object, so we can remember the capChgLvl for the animation.
    if(this.properties.iEloopData == null)
    {
        this.properties.iEloopData = new Object();
    }
    
    if (iEloopData)
    {
        // Remember the passed-in data
        this.properties.iEloopData.dataKnown     = iEloopData.dataKnown;
        this.properties.iEloopData.capChgLvl     = iEloopData.capChgLvl;
        this.properties.iEloopData.rgnPwrLvl     = iEloopData.rgnPwrLvl;
        this.properties.iEloopData.electLdUsgLvl = iEloopData.electLdUsgLvl;

        // If we're actually in a style that displays I-ELOOP data, ...
        if (this.properties.ctrlStyle != "iStopOnly")
        {
            if(this.properties.iEloopData.dataKnown)
            {
                
				if(isInitializing)
                {
                	this._currentCapChgLvl = iEloopData.capChgLvl;
                	if(this.properties.vehicleType==="SETTINGS_VehicleModelType_J12A")
					{
						if (this._currentCapChgLvl > 0)
						{
							this.iEloopBattery.className = "EcoStatusCtrlCarBattery_J12_0" + this._currentCapChgLvl;
						}
						else
						{
							this.iEloopBattery.className = "EcoStatusCtrlCarBattery_J12";
						}
					}
					else
					{
						if (this._currentCapChgLvl > 0)
						{
							this.iEloopBattery.className = "EcoStatusCtrl_iEloop_Battery_0" + this._currentCapChgLvl;
						}
						else
						{
							this.iEloopBattery.className = "EcoStatusCtrl_iEloop_Battery_Off";
						}
					}
                }
                else
                {
                           
	            	// If no capacitor level animation timer's already running, ...
	                if (this._capChgLvlTimer == null)
	                {
	                    // ... call the animation timer callback to do the work of
	                    // animating the transition to the targeted capacitor level
	                    this._capChgLvlTimerCallback();
	                }
	                else
	                {
	                    // There's already an animation timer running, and we've
	                    // already updated the target capacitor level.  Let the
	                    // timer expire & trigger the callback, continuing the
	                    // animation
	                }
                }
    
                // Check for regeneration/discharging display
                var delta = this.properties.iEloopData.rgnPwrLvl;
                if (delta > 0)
                {
					if(this.properties.vehicleType==="SETTINGS_VehicleModelType_J12A")
					{
						this.iEloopAlternator.className = "EcoStatusCtrl_iEloop_Alternator_On_J12";
					}
					else
					{
						this.iEloopAlternator.className = "EcoStatusCtrl_iEloop_Alternator_On";
					}
                    // Compute an index for the charging arrow graphics, based on the max. delta value (10)
                    // and the max. charge arrow graphic index (6).  This should map delta values (0-10) to
                    // charge indices (0-6).
                    var chargeIdx  = 0;	
                    if(delta == 1 || delta == 2)
                    {
                    	chargeIdx = 1;
                    }
                    else if(delta == 3 || delta == 4)
                    {
                    	chargeIdx = 2;
                    }
                    else if(delta == 5 || delta == 6)
                    {
                    	chargeIdx = 3;
                    }
                    else if(delta == 7 || delta == 8)
                    {
                    	chargeIdx = 4;
                    }
                    else if(delta == 9 || delta == 10)
                    {
                    	chargeIdx = 5;
                    }
                    
					if( isInitializing === true)
                    {
						if(this._currentChargeLevel != chargeIdx)
                    	{
                    		this._currentChargeLevel = chargeIdx;
							if(this.properties.vehicleType!="SETTINGS_VehicleModelType_J12A")
							{
								this._keyframeChargeAnimation('REGENERATION', chargeIdx);
							}
							else
							{
								this._animationType="REGENERATION";			
								this._showAnimation(chargeIdx);
							}
                    	}
                    }
                    else
                    {
						if(this.properties.vehicleType!="SETTINGS_VehicleModelType_J12A")
						{
							if(this._chargeLevelTimer == null)
							{
								this._chargeLvlTimerCallback();
							}
						}
						else
						{
							this._animationType="REGENERATION";
							this._startArrowAnimtions(true);
						}
                    	
                    }
                    
                    // Regenerating
                    this.iEloopCarGlow.className                = "EcoStatusCtrlHidden";
					if(this.properties.vehicleType==="SETTINGS_VehicleModelType_J12A")
					{
						this.iEloopFrontWheelsGlow.className        = "EcoStatusCtrl_iEloop_FrontWheelsGlow_J12";
						this.iEloopBatteryGlow.className            = "EcoStatusCtrl_iEloop_Battery_Glow_J12";
					}
					else
					{
						this.iEloopFrontWheelsGlow.className        = "EcoStatusCtrl_iEloop_FrontWheelsGlow";
						this.iEloopBatteryGlow.className            = "EcoStatusCtrl_iEloop_Battery_Glow";
						this.iEloopChargeShaft.className            = "EcoStatusCtrl_iEloop_ChargeShaft";
					}
                    
                   
                }
				
                else if (delta == 0 && this.properties.iEloopData.electLdUsgLvl == "YES")
                {
                	// Discharging
					if((this.vehicleType == "SETTINGS_VehicleModelType_J03A") || (this.vehicleType == "SETTINGS_VehicleModelType_J03E"))
					{
						this.iEloopCarGlow.className            = "EcoStatusCtrl_iEloop_CarGlow_J03A";
						
					}
					else if((this.vehicleType == "SETTINGS_VehicleModelType_J03K") ||(this.vehicleType=="SETTINGS_VehicleModelType_J53"))
					{
						this.iEloopCarGlow.className            = "EcoStatusCtrl_iEloop_CarGlow_J03K";
					}
					else if((this.vehicleType == "SETTINGS_VehicleModelType_J71") ||(this.vehicleType=="SETTINGS_VehicleModelType_J36"))
					{
						this.iEloopCarGlow.className            = "EcoStatusCtrl_iEloop_CarGlow_J7136";
					}
					else if(this.vehicleType == "SETTINGS_VehicleModelType_J12A")
					{
						this.iEloopCarGlow.className                = "EcoStatusCtrl_iEloop_CarGlow_J12";
					}
					else
					{
						this.iEloopCarGlow.className                = "EcoStatusCtrl_iEloop_CarGlow";
					}
					
                    this.iEloopChargeShaft.className            = "EcoStatusCtrlHidden";
                    this.iEloopFrontWheelsGlow.className        = "EcoStatusCtrlHidden";
					if(this.vehicleType === "SETTINGS_VehicleModelType_J12A")
					{
						this.iEloopAlternator.className             = "EcoStatusCtrl_iEloop_Alternator_Off_J12";
					}
					else
					{
						this.iEloopAlternator.className             = "EcoStatusCtrl_iEloop_Alternator_Off";
					}				
                    this.iEloopBatteryGlow.className            = "EcoStatusCtrlHidden";
					
					if(this.properties.vehicleType!="SETTINGS_VehicleModelType_J12A")
					{
						this._keyframeChargeAnimation('DEGENERATION');
					}
					else
					{
						this._animationType="DEGENERATION";
						this._startArrowAnimtions();
					}
                    
                }
                else 
                {
                	// Balanced -- no net energy flow
                    this.iEloopCarGlow.className                = "EcoStatusCtrlHidden";
                    this.iEloopChargeShaft.className            = "EcoStatusCtrlHidden";
                    this.iEloopFrontWheelsGlow.className        = "EcoStatusCtrlHidden";
					if(this.vehicleType === "SETTINGS_VehicleModelType_J12A")
					{
						this.iEloopAlternator.className             = "EcoStatusCtrl_iEloop_Alternator_Off_J12";
					}
					else
					{
						this.iEloopAlternator.className             = "EcoStatusCtrl_iEloop_Alternator_Off";
					}
                    this.iEloopBatteryGlow.className            = "EcoStatusCtrlHidden";
					if(this.properties.vehicleType!="SETTINGS_VehicleModelType_J12A")
					{
						this._keyframeChargeAnimation('BALANCED');
					}
					else
					{
						this._animationType="BALANCED";
						this._startArrowAnimtions();
					}
                    
                }
            }
            else
            {
			
                // We've lost any knowledge of the i-ELOOP data -- blank everything
                this.iEloopCarGlow.className                = "EcoStatusCtrlHidden";
                this.iEloopChargeShaft.className            = "EcoStatusCtrlHidden";
                this.iEloopFrontWheelsGlow.className        = "EcoStatusCtrlHidden";
				if(this.vehicleType === "SETTINGS_VehicleModelType_J12A")
				{
					this.iEloopAlternator.className             = "EcoStatusCtrl_iEloop_Alternator_Off_J12";
				}
				else
				{
					this.iEloopAlternator.className             = "EcoStatusCtrl_iEloop_Alternator_Off";
				}
                this.iEloopBatteryGlow.className            = "EcoStatusCtrlHidden";
                // Stop any capacitor low-pass filter animation & forget our current capChgLvl
               
			   this._capChgLvlTimerCleanup();
                this._currentCapChgLvl = 0;
				
				if(this.properties.vehicleType!="SETTINGS_VehicleModelType_J12A")
				{
					this._keyframeChargeAnimation('NONE');
				}
				else
				{
					this._animationType="NONE";
					this._startArrowAnimtions();
				}
                
            }
        }
        else
        {
            log.warn("Control style does not support i-ELOOP -- not updating display");
        }
    }
    else
    {
        log.warn("No iEloopData object received!");
    }
}

EcoStatusCtrl.prototype.setFuelEfficiency = function(fuelEfficiencyData)
{
    log.debug("EcoStatusCtrl: setFuelEfficiency() called: fuelEfficiency = " +
                fuelEfficiencyData.fuelEfficiency + " " +
                fuelEfficiencyData.fuelEfficiencyUnit);

    // Purge any "remembered" data
    this.properties.fuelEfficiencyData = new Object();

    if (fuelEfficiencyData &&
        (fuelEfficiencyData.fuelEfficiency || fuelEfficiencyData.fuelEfficiency == 0)&&
        fuelEfficiencyData.fuelEfficiencyUnit)
    {
        // Remember the passed-in data
        this.properties.fuelEfficiencyData.fuelEfficiency = fuelEfficiencyData.fuelEfficiency;
        this.properties.fuelEfficiencyData.fuelEfficiencyUnit = fuelEfficiencyData.fuelEfficiencyUnit;

     // Translate & display the unit string
        var unitStr = this._translateString(this.properties.fuelEfficiencyData.fuelEfficiencyUnit,
                                            this.properties.fuelEfficiencyData.fuelEfficiencyUnit,
                                            this.properties.subMap);
        
        if(this.properties.ctrlStyle !== "iEloopOnly")
        {
        	 // Update the numeric value display
			            this.fuelEfficiencyValue.innerHTML = this.properties.fuelEfficiencyData.fuelEfficiency
					+ "<span>" + unitStr + "</span>";
        }
        else
        {
        	// Update the numeric value display
            this.fuelEfficiencyValue.innerHTML = this.properties.fuelEfficiencyData.fuelEfficiency;
        	this.fuelEfficiencyUnit.innerHTML = this._stringToHTML(unitStr);
        }
        
        
    }
    else if(fuelEfficiencyData.fuelEfficiencyUnit)
    {
    	this.properties.fuelEfficiencyData.fuelEfficiencyUnit = fuelEfficiencyData.fuelEfficiencyUnit;
    	var unitId = this._translateString(this.properties.fuelEfficiencyData.fuelEfficiencyUnit,
                this.properties.fuelEfficiencyData.fuelEfficiencyUnit,
                this.properties.subMap);
    	 if(this.properties.ctrlStyle !== "iEloopOnly")
         {
         	 // Update the numeric value display
 			            this.fuelEfficiencyValue.innerHTML = '--.-'
 					+ "<span>" + unitId + "</span>";
         }
         else
         {
        	 // Update the numeric value display
             this.fuelEfficiencyValue.innerHTML = '--.-';
         	this.fuelEfficiencyUnit.innerHTML = this._stringToHTML(unitId);
         }
    }
    else
    {
        log.warn("Invalid fuel efficiency data received -- blanking display");
        this.fuelEfficiencyValue.innerHTML = "--.-";
        this.fuelEfficiencyUnit.innerHTML = "";
    }
}

EcoStatusCtrl.prototype.setIStopMode = function(mode)
{
    log.debug("EcoStatusCtrl: setIStopMode() called: mode = \"" + mode + "\"");

    // If we've been given a recognized mode, ...
    if (this.ISTOP_MODE_STYLES[mode])
    {
        // .. remember it
        this._iStopMode = mode;

        // If we're actually in a style that displays I-STOP data, ...
        if ((this.properties.ctrlStyle != "iEloopOnly"))
        {
            // ... apply control element styles, assuming the control elements' names
            // are used as keys in the CSS style arrays (this.ISTOP_MODE_STYLES)
            for (var i in this.ISTOP_MODE_STYLES[this._iStopMode])
            {
                this[i].className = this.ISTOP_MODE_STYLES[this._iStopMode][i];
            }
    
            // Set the i-STOP status/error/time data
            switch (this._iStopMode)
            {
                case "Status":
                    this.setIStopStatus(this.properties.iStopData.iStopStatusObj, this.properties.subMap);
                    if(this.properties.ctrlStyle == "iStopOnly")
                    {
						if(this.properties.vehicleType=="SETTINGS_VehicleModelType_J12A")
						{
							this.iEloopEngine.className = "EcoStatusCtrl_iEloop_Engine_J12";
						}
						else
						{
							this.iEloopEngine.className = "EcoStatusCtrl_iEloop_Engine";
						}
                    }
                    break;
                case "Error":
                    this.setIStopError(this.properties.iStopData.iStopErrorObj, this.properties.subMap);
                    if(this.properties.ctrlStyle == "iStopOnly")
                    {
						if(this.properties.vehicleType=="SETTINGS_VehicleModelType_J12A")
						{
							this.iEloopEngine.className = "EcoStatusCtrl_iEloop_Engine_J12";
						}
						else
						{
							this.iEloopEngine.className = "EcoStatusCtrl_iEloop_Engine";
						}
                    }
                    break;
                case "Time":
                    this.setIStopTime(this.properties.iStopData.iStopTimeObj);
                    if(this.properties.ctrlStyle == "iStopOnly")
                    {
						if(this.properties.vehicleType=="SETTINGS_VehicleModelType_J12A")
						{
							this.iEloopEngine.className = "EcoStatusCtrl_iEloop_EngineGlow_J12";
						}
						else
						{
							this.iEloopEngine.className = "EcoStatusCtrl_iEloop_EngineGlow";
						}
                    }
                    break;
                default:
                	if(this.properties.ctrlStyle == "iStopOnly")
                    {
						if(this.properties.vehicleType=="SETTINGS_VehicleModelType_J12A")
						{
							this.iEloopEngine.className = "EcoStatusCtrl_iEloop_Engine_J12";
						}
						else
						{
							this.iEloopEngine.className = "EcoStatusCtrl_iEloop_Engine";
						}
                    }
                    break;
            }
        }
        else
        {
            log.warn("Control style does not support i-STOP -- not updating display");
        }
    }
    else
    {
        log.warn("Missing or invalid i-STOP mode!");
    }
}

EcoStatusCtrl.prototype.setIStopStatus = function(iStopStatusObj, subMap)
{
    log.debug("EcoStatusCtrl: setIEloopData() called: iStopStatusObj = { " +
                "iStopStatusId=" + iStopStatusObj.iStopStatusId +
                ", iStopStatusText=" + iStopStatusObj.iStopStatusText +
                ", engineStatus=" + iStopStatusObj.engineStatus +
                ", batteryStatus=" + iStopStatusObj.batteryStatus +
                ", acStatus=" + iStopStatusObj.acStatus + " }");

    // Purge any "remembered" data
    this.properties.iStopStatusObj = new Object();

    if (iStopStatusObj)
    {
        // Remember the passed-in data
        this.properties.iStopStatusObj.iStopStatusId   = iStopStatusObj.iStopStatusId;
        this.properties.iStopStatusObj.iStopStatusText = iStopStatusObj.iStopStatusText;
        this.properties.iStopStatusObj.engineStatus    = iStopStatusObj.engineStatus;
        this.properties.iStopStatusObj.batteryStatus   = iStopStatusObj.batteryStatus;
        this.properties.iStopStatusObj.acStatus        = iStopStatusObj.acStatus;

        // If we're actually in a style that displays I-STOP data, ...
        if ((this.properties.ctrlStyle != "iEloopOnly"))
        {
            // ... make sure we're in "Status" mode
            if (this._iStopMode === "Status")
            {
                // Update engine status
                if (this.properties.iStopStatusObj.engineStatus === "Good")
                {
					if(this.properties.vehicleType=="SETTINGS_VehicleModelType_J12A")
					{
						this.iStopStatusEngine.className = "EcoStatusCtrl_iStop_Status_Engine_Glow_J12";
					}
					else
					{
						this.iStopStatusEngine.className = "EcoStatusCtrl_iStop_Status_Engine_Glow";
					}
                }
                else if (this.properties.iStopStatusObj.engineStatus === "Bad")
                {
					if(this.properties.vehicleType=="SETTINGS_VehicleModelType_J12A")
					{
						this.iStopStatusEngine.className = "EcoStatusCtrl_iStop_Status_Engine_J12";
					}
					else
					{
						this.iStopStatusEngine.className = "EcoStatusCtrl_iStop_Status_Engine";
					}
                }
                else
                {
                    this.iStopStatusEngine.className = "EcoStatusCtrlHidden";
                }
    
                // Update battery status
                if (this.properties.iStopStatusObj.batteryStatus === "Good")
                {
                    this.iStopStatusBattery.className = "EcoStatusCtrl_iStop_Status_Battery_Glow";
                }
                else if (this.properties.iStopStatusObj.batteryStatus === "Bad")
                {
                    this.iStopStatusBattery.className = "EcoStatusCtrl_iStop_Status_Battery";
                }
                else
                {
                    this.iStopStatusBattery.className = "EcoStatusCtrlHidden";
                }
    
                // Update AC status
                if (this.properties.iStopStatusObj.acStatus === "Good")
                {
                    this.iStopStatusAC.className = "EcoStatusCtrl_iStop_Status_AC_Glow";
                }
                else if (this.properties.iStopStatusObj.acStatus === "Bad")
                {
                    this.iStopStatusAC.className = "EcoStatusCtrl_iStop_Status_AC";
                }
                else
                {
                    this.iStopStatusAC.className = "EcoStatusCtrlHidden";
                }
    
                // Update i-STOP status text
                if( this.properties.iStopStatusObj.iStopStatusId !== "DISPLAY_OFF")
                {
                	this.iStopStatusText.className = "EcoStatusCtrl_iStop_Status_Text";
                	this.properties.iStopStatusObj.iStopStatusText = this._translateString(this.properties.iStopStatusObj.iStopStatusId,
                			this.properties.iStopStatusObj.iStopStatusText,
                			subMap);
                	this.iStopStatusText.innerHTML = this._stringToHTML(this.properties.iStopStatusObj.iStopStatusText);
                }
                else
                {
                	this.iStopStatusText.className = "EcoStatusCtrlHidden";
                }
                
            }
            else
            {
                log.warn("Not in i-STOP \"Status\" mode -- not updating display");
            }
        }
        else
        {
            log.warn("Control style does not support i-STOP -- not updating display");
        }
    }
    else
    {
        log.warn("No iStopStatus object available!");
    }
}

EcoStatusCtrl.prototype.setIStopError = function(iStopErrorObj, subMap)
{
    log.debug("EcoStatusCtrl: setIStopError() called: iStopErrorObj = { " +
                "iStopErrorId=" + iStopErrorObj.iStopErrorId +
                ", iStopErrorText=" + iStopErrorObj.iStopErrorText + " }");

    // Purge any "remembered" data
    this.properties.iStopErrorObj = new Object();

    if (iStopErrorObj)
    {
        // Remember the passed-in data
        this.properties.iStopErrorObj.iStopErrorId   = iStopErrorObj.iStopErrorId;
        this.properties.iStopErrorObj.iStopErrorText = iStopErrorObj.iStopErrorText;
        
        this.properties.iStopErrorObj.iStopErrorId1   = iStopErrorObj.iStopErrorId1;
        this.properties.iStopErrorObj.iStopErrorText = iStopErrorObj.iStopErrorText1;

        // If we're actually in a style that displays I-STOP data, ...
        if ((this.properties.ctrlStyle != "iEloopOnly"))
        {
            // ... make sure we're in "Error" mode
            if (this._iStopMode === "Error")
            {
                // Update i-STOP error text
            	this.properties.iStopErrorObj.iStopErrorText = this._translateString(this.properties.iStopErrorObj.iStopErrorId,
                                                                                     this.properties.iStopErrorObj.iStopErrorText,
                                                                                     subMap);
                this.iStopErrorLine1.innerHTML = this._stringToHTML(this.properties.iStopErrorObj.iStopErrorText);
                if(this.properties.iStopErrorObj.iStopErrorId1)
                {
                	this.iStopErrorLine2.className = 'EcoStatusCtrl_iStop_Error_Text_Line2';
                	this.properties.iStopErrorObj.iStopErrorText1 = this._translateString(this.properties.iStopErrorObj.iStopErrorId1,
                			this.properties.iStopErrorObj.iStopErrorText1,
                			subMap);
                	this.iStopErrorLine2.innerHTML = this._stringToHTML(this.properties.iStopErrorObj.iStopErrorText1);
                	
                	this.iStopErrorLine1.className = 'EcoStatusCtrl_iStop_Error_Text_Line1';
                }
                else
                {
                	this.iStopErrorLine1.className = 'EcoStatusCtrl_iStop_Error_Text_LineCenter';
                	this.iStopErrorLine2.className = 'EcoStatusCtrlHidden';
                }
            }
            else
            {
                log.warn("Not in i-STOP \"Error\" mode -- not updating display");
            }
        }
        else
        {
            log.warn("Control style does not support i-STOP -- not updating display");
        }
    }
    else
    {
        log.warn("No iStopError object available!");
    }
}

EcoStatusCtrl.prototype.setIStopTime = function(iStopTimeObj)
{
    log.debug("EcoStatusCtrl: setIStopTime() called: iStopTimeObj = { " +
                "iStopTime=" + iStopTimeObj.iStopTime +
                ", iStopTotalTime=" + iStopTimeObj.iStopTotalTime + " }");

    // Purge any "remembered" data
    this.properties.iStopTimeObj = new Object();

    if (iStopTimeObj)
    {
        // Remember the passed-in data
        this.properties.iStopTimeObj.iStopTime      = iStopTimeObj.iStopTime;
        this.properties.iStopTimeObj.iStopTotalTime = iStopTimeObj.iStopTotalTime;

        // If we're actually in a style that displays I-STOP data, ...
        if ((this.properties.ctrlStyle != "iEloopOnly"))
        {
            // ... make sure we're in "Time" mode
            if (this._iStopMode === "Time")
            {
                // Update Time
                if (this.properties.iStopTimeObj.iStopTime != null)
                {
                    this.iStopTimeValue.innerHTML = this._formatDurationString(this.properties.iStopTimeObj.iStopTime, false);
                }
                else
                {
                    this.iStopTimeValue.innerHTML = "--";
                }
                
                // Update Total Time
                if (this.properties.iStopTimeObj.iStopTotalTime != null)
                {
                    this.iStopTimeTotalValue.innerHTML = this._formatDurationString(this.properties.iStopTimeObj.iStopTotalTime, true);
                }
                else
                {
                    this.iStopTimeTotalValue.innerHTML = "--";
                } 
            }
            else
            {
                log.warn("Not in i-STOP \"Time\" mode -- not updating display");
            }
        }
        else
        {
            log.warn("Control style does not support i-STOP -- not updating display");
        }
    }
    else
    {
        log.warn("No iStopTime object available!");
    }
}

 /*
  * toggle Ump panel | status == "hidePanel" OR status == "showPanel"
  */
EcoStatusCtrl.prototype.toggleUmpPanel = function(status)
{
	
	if(status == "hidePanel")
	{
		this.umpPanelDiv.className = "UmpPanelDivDisable";
		this.umpCtrl.setRetracted(true);
		this._umpPanelStatus = false;
	}
	else if(status == "showPanel")
	{
		this.umpPanelDiv.className = "UmpPanelDivEnable";
		this.umpCtrl.setRetracted(false);
		this._umpPanelStatus = true;
	}
	else
	{
		log.warn("_triggerUmpPanel called with an unxpected argument: "+status);
	}
}


/**
 * Context capture
 * TAG: framework, public
 * =========================
 * @return {object} - capture data
 */

EcoStatusCtrl.prototype.getContextCapture = function()
{
    log.debug("EcoStatusCtrl: getContextCapture() called...");
    var controlContextCapture = this.umpCtrl.getContextCapture();
    return controlContextCapture;
};


EcoStatusCtrl.prototype.finishPartialActivity = function()
{
    log.debug("EcoStatusCtrl: finishPartialActivity() called...");
    this.umpCtrl.finishPartialActivity();
}


/**
 * Context restore
 * TAG: framework, public
 * =========================
 * @return {object} - capture data
 */

EcoStatusCtrl.prototype.restoreContext = function(controlContextCapture)
{
    log.debug("EcoStatusCtrl: restoreContext() "+ controlContextCapture);
    this.umpCtrl.restoreContext(controlContextCapture);
};


/*
 * Forward all multicontroller events to our only child control, the "SwitchView" button
 */
EcoStatusCtrl.prototype.handleControllerEvent = function(eventId)
{
    log.debug("EcoStatusCtrl: handleControllerEvent() called: " + eventId);
    var response;
    // Pass-through
    if(this._umpPanelStatus && this.umpCtrl)
    {
    	response = this.umpCtrl.handleControllerEvent(eventId);
        return response;
    }
    else if(!this._umpPanelStatus && this.switchViewButtonCtrl)
    {
        response = this.switchViewButtonCtrl.handleControllerEvent(eventId);
        return response;
    }
    
    
}

EcoStatusCtrl.prototype._stopArrowAnimation = function()
{
	if(this.arrowAnimJ12Timer != null)
	{
		clearInterval(this.arrowAnimJ12Timer);
		this.arrowAnimJ12Timer = null;
	}
}

EcoStatusCtrl.prototype.cleanUp = function()
{
    // Clean up any capacitor level low-pass animation timer that may be running
	this._stopArrowAnimation();
	this._capChgLvlTimerCleanup(true);

    // Clean up the child button control
    if (this.switchViewButtonCtrl)
    {
        this.switchViewButtonCtrl.cleanUp();
    }
    //this._clearRegenDegenIntervals('both');
    if(this.umpCtrl)
    {
     this.umpCtrl.cleanUp();
    }
}


EcoStatusCtrl.prototype.setdiv = function(value)
{
	this.vehicleType = value;
	if((this.vehicleType == "SETTINGS_VehicleModelType_J03A") || (this.vehicleType == "SETTINGS_VehicleModelType_J03E"))
	{
		this.iEloopCarBottomLayer.className=this.iEloopCarBottomLayer.className+"_J03A";
		this.iEloopCarTopLayer.className=this.iEloopCarTopLayer.className+"_J03A";
		this.iEloopBatteryToCarDischargeLeft.className = "EcoStatusCtrl_iEloop_BatteryToCarDischargeLeft_J03A";
		this.iEloopBatteryToCarDischargeRight.className = "EcoStatusCtrl_iEloop_BatteryToCarDischargeRight_J03A";
	}
	else if((this.vehicleType=="SETTINGS_VehicleModelType_J03K") ||(this.vehicleType=="SETTINGS_VehicleModelType_J53"))
	{
		this.iEloopCarBottomLayer.className=this.iEloopCarBottomLayer.className+"_J03K";
		this.iEloopCarTopLayer.className=this.iEloopCarTopLayer.className+"_J03K";
		this.iEloopBatteryToCarDischargeLeft.className = "EcoStatusCtrl_iEloop_BatteryToCarDischargeLeft_J03K";
		this.iEloopBatteryToCarDischargeRight.className = "EcoStatusCtrl_iEloop_BatteryToCarDischargeRight_J03K";
	}
	else if((this.vehicleType=="SETTINGS_VehicleModelType_J36") ||(this.vehicleType=="SETTINGS_VehicleModelType_J71"))
	{
		this.iEloopCarBottomLayer.className=this.iEloopCarBottomLayer.className+"_J7136";
		this.iEloopCarTopLayer.className=this.iEloopCarTopLayer.className+"_J7136";
		this.iEloopBatteryToCarDischargeLeft.className = "EcoStatusCtrl_iEloop_BatteryToCarDischargeLeft";
		this.iEloopBatteryToCarDischargeRight.className = "EcoStatusCtrl_iEloop_BatteryToCarDischargeRight";
	}
	else if(this.properties.vehicleType=="SETTINGS_VehicleModelType_J12A")
	{
		/*DO nothing and do not remove this*/
	}
	else
	{
		this.iEloopCarBottomLayer.className="EcoStatusCtrl_iEloop_CarBottomLayer";
		this.iEloopCarTopLayer.className="EcoStatusCtrl_iEloop_CarTopLayer";
		this.iEloopBatteryToCarDischargeLeft.className = "EcoStatusCtrl_iEloop_BatteryToCarDischargeLeft";
		this.iEloopBatteryToCarDischargeRight.className = "EcoStatusCtrl_iEloop_BatteryToCarDischargeRight";
	}
}


EcoStatusCtrl.prototype.startTyreRotation = function(reverseValue , vehSpeed)
{
	this.isReverse = reverseValue;	
	if(vehSpeed >= 1)
	{
		if((this.isReverse == true) || (this.isReverse == false))
		{
			if(this.wheelRotate === null)
			{
				this.wheelRotate = setInterval(this._startWheelAnimation.bind(this), 40);
			}
		}
		else
		{
			this._stopTireRotation();
		}	
	}
	else
	{		
		this._stopTireRotation();
	}	
}


EcoStatusCtrl.prototype._startWheelAnimation = function()
{
	if(this.isReverse == true)
	{	
		this.carJ12Wheels.style.backgroundPosition = '0px -'+this.wheelPositionY+'px';
		if(this.wheelPositionY <= 0)
		{
			this.wheelPositionY = 536;
		}
		else
		{
			this.wheelPositionY -= 67;
		}
	}
	else
	{
		this.carJ12Wheels.style.backgroundPosition = '0px -'+this.wheelPositionY+'px';
		if(this.wheelPositionY == 536)
		{
			this.wheelPositionY = 0;
		}
		else
		{
			this.wheelPositionY += 67;
		}
	}
}

EcoStatusCtrl.prototype._stopTireRotation = function()
{
	if(this.wheelRotate != null)
	{
		clearInterval(this.wheelRotate);
		this.wheelRotate = null;
	}
}
framework.registerCtrlLoaded("EcoStatusCtrl");