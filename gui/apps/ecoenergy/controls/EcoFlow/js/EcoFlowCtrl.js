/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: EcoFlowCtrl.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: atiwarc	
 Date: 06-14-2013
 __________________________________________________________________________

 Description: IHU GUI EcoFlowCtrl
 
 Revisions: 
 v0.1 (06-14-2013)  Initial implementation (atiwarc)
 
 __________________________________________________________________________

 */

log.addSrcFile("EcoFlowCtrl.js", "common");

function EcoFlowCtrl(uiaId, parentDiv, controlId, properties)
{    
    this.uiaId = uiaId;
    this.divElt = parentDiv;
    this.controlId = controlId;
    this.showUmpButtonCtrl = null;
    this._capChgLvlTimer = null;
    // Timer used to drive capacitor level low-pass filter animation
    this._capChgLvlTimer = null;
    this._umpPanelStatus = false;
    this.wheelCount = 0;
    this.motorToBattCount  = 0;
    this.BattToMotorCount = 0;
    this.engineToWheelCount = 0;
    this.motorToWheelCount = 0;
    this.wheelToMotorCount = 0;
    this.wheelRotateAccInt = null;
    
    this._TRANSPARENT = 0;
    this._OPAQUE = 1;
    
    this._currentHEVPattern = 13;
    this.isReverse = false;

	this._ENGINE_PATTERN = [ true, true, true, true, true, true, true, true,true, true, false, false, false ];
	this._REDARROW12_PATTERN = [ 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0 ];
	this._REDARROW1_PATTERN = [ 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0 ];
	this._BLUEARROW12_PATTERN = [ 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0 ];
	this._BLUEARROW1_PATTERN = [ 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0 ];
	this._WHITEARROW12_PATTERN = [ 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0 ];
	this._WHITEARROW1_PATTERN = [ 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0 ];

	this._CHARGINGARROW_PATTERN =    [ 0, 1, 1, 0, 0, 0,1, 0, 1, 1, 0, 1, 0 ];
	this._DISCHARGINGARROW_PATTERN = [ 1, 0, 0, 0, 0, 1,0, 0, 0, 0, 1, 0, 0 ];

	this._BATTERY_PATTERN = [ false, true, true, false, false, false, true,false, true, true, false, true, false ];
    
    // list of class against their div elements to make the UI structure
    this._STYLE = 
    {
    		'ecoFlowContainer' : 'EcoFlowCtrlCarContainer', 
    		'carBottomLayer'   : 'EcoFlowCtrlCarBottomLayer',
    		'carBattery'	   : 'EcoFlowCtrlCarBattery',
    		'carBatteryCharging' : 'EcoFlowCtrlHidden',
    		'batteryCharge'		: 'EcoFlowCtrlBatteryCharge',
    		'batteryDischarge'  : 'EcoFlowCtrlBatteryDisCharge',
    		'alternator'		: 'EcoFlowCtrlAlternator',
    		'wheelToAlternator' : 'EcoFlowCtrlWheelToAlt',
    		'wheelToAlternator1' : 'EcoFlowCtrlWheelToAlt1',
    		'wheelToAlternator2' : 'EcoFlowCtrlWheelToAlt2',
    		'wheelToAlternator3' : 'EcoFlowCtrlWheelToAlt3',
    		'alternatorToWheel' : 'EcoFlowCtrlAltToWheel', 
    		'alternatorToWheel1' : 'EcoFlowCtrlAltToWheel1',
    		'alternatorToWheel2' : 'EcoFlowCtrlAltToWheel2',
    		'alternatorToWheel3' : 'EcoFlowCtrlAltToWheel3', 
    		'engineToAlternator': 'EcoFlowCtrlEngineToAlt',
    		'engine'			: 'EcoFlowCtrlEngine',
    		'engineToWheel'     : 'EcoFlowCtrlEngineToWheel',
    		'engineToWheel1'     : 'EcoFlowCtrlEngineToWheel1',
    		'engineToWheel2'     : 'EcoFlowCtrlEngineToWheel2',
    		'carTopLayer'		: 'EcoFlowCtrlCarTopLayer',
    		'carWheels'			: 'EcoFlowCtrlCarWheels',
    		'batteryLabel'      : 'EcoFlowCtrlBatteryLabel',
    		'motorLabel'        : 'EcoFlowCtrlMotorLabel',
    		'engineLabel'       : 'EcoFlowCtrlEngineLabel',
    		'energyFlowTitle'   : 'EcoFlowCtrlEnergyFlowTitle',
    		'bottomContainer'   : 'EcoFlowCtrlBottomContainer',
    		'drivingDistanceTitle' : 'EcoFlowCtrlDrivingDisTitle',
    		'drivingDistanceValue': 'EcoFlowCtrlDrivingDisValue',
    		'drivingDistancePercent': 'EcoFlowCtrlDrivingDisUnit',
    		'drivingDistanceUnit'   : 'EcoFlowCtrlDrivingDisPercent',
    		'buttonContainer' : 'EcoFlowCtrlButtonContainer'
   };
    
      
    //@formatter:on
    this.properties =
    {
    	"subMap"                   : null,
    	"selectCallback"           : null,
    	"umpButtonConfig" 		   : null,
        "defaultSelectCallback"    : null,
        "defaultSlideCallback" 	   : null,
        "defaultHoldStartCallback" : null,
        "defaultHoldStopCallback"  : null,
        "dataList" 				   : null,
        "umpStyle" 				   : null,
        "hasScrubber" 			   : false,
        "umpPanelStatus"		   : false
    };
    //@formatter:on

    // Copy properties from the app
    for (var key in properties)
    {
        this.properties[key] = properties[key];
    }
       
    //preload images 
    this.imagesCount = 0;
    this._preload('HEV_car_under.png','tire_sprites.png','HEV_car_outline.png', 'battery_hev.png', 'HEV_battery_charging.png','HEV_engine.png');
	 // Create DOM elements
    this._createStructure();
}

/*******************/
/* Private Methods */
/*******************/ 

EcoFlowCtrl.prototype._init = function()
{
    log.debug("EcoFlowCtrl: _init() called...");
    // Initialize the capacitor level current value (used to drive the animation timer)
    this._currentCapChgLvl = 0;
    // Bind the animation timer callback once (to save memory), since we never change the callback
    this._capChgLvlTimerCallbackHandle = this._capChgLvlTimerCallback.bind(this);
    this._motorToBatteryAnim();
    
}

EcoFlowCtrl.prototype._next = function(count)
{
	this.imagesCount++;
	if(this.imagesCount >= count)
	{
		this.controlDiv.className = "EcoFlowCtrl";
	}
}

EcoFlowCtrl.prototype._preload = function()
{
	var images = new Array();
	var prefix = './apps/ecoenergy/controls/EcoFlow/images/';
	for(var i = 0; i < this._preload.arguments.length; i++)
	{
		images[i] = new Image();
		images[i].src = prefix + this._preload.arguments[i];
		images[i].onload = this._next.bind(this, this._preload.arguments.length);
	}
}

EcoFlowCtrl.prototype._createStructure = function()
{
    // Create the div for control
    this.controlDiv = document.createElement('div');
    this.controlDiv.className = "EcoFlowCtrl EcoFlowCtrlHiddenOpacity";

	this.umpPanelDiv = document.createElement('div');
	this.umpPanelDiv.className = "UmpPanelDivDisable";
    
	/************************************************/
    /* Create DOM structure for UI elements */
    /************************************************/
	
    // Create div to contain all Car elements
    this.ecoFlowContainer = document.createElement('div');
    
    this.carBottomLayer = document.createElement('div');
    this.ecoFlowContainer.appendChild(this.carBottomLayer);
    
    // Create div to contain Capacitor battery
    this.carBattery = document.createElement('div');
    this.ecoFlowContainer.appendChild(this.carBattery);
    
    // Create div to contain the Charging capacitor battery
    this.carBatteryCharging = document.createElement('div');
    this.ecoFlowContainer.appendChild(this.carBatteryCharging);
    
    //Create a div to contain alternator to battery charging arrows
    this.batteryCharge = document.createElement('div');
    this.ecoFlowContainer.appendChild(this.batteryCharge);
    
    // Create a div to contain batter discharging arrows
    this.batteryDischarge = document.createElement('div');
    this.ecoFlowContainer.appendChild(this.batteryDischarge);
    
    //Create a div to contain alternator
    this.alternator = document.createElement('div');
    this.ecoFlowContainer.appendChild(this.alternator);
    
    // Create a div to show charge from Wheels to Alternator
    this.wheelToAlternator = document.createElement('div');
    this.ecoFlowContainer.appendChild(this.wheelToAlternator);
    
    this.wheelToAlternator1 = document.createElement('div');
    this.ecoFlowContainer.appendChild(this.wheelToAlternator1);
    
    this.wheelToAlternator2 = document.createElement('div');
    this.ecoFlowContainer.appendChild(this.wheelToAlternator2);
    
    this.wheelToAlternator3 = document.createElement('div');
    this.ecoFlowContainer.appendChild(this.wheelToAlternator3);
    
    // Create a div to show charge from Alternator to Wheels
    this.alternatorToWheel = document.createElement('div');
    this.ecoFlowContainer.appendChild(this.alternatorToWheel);
    
    this.alternatorToWheel1 = document.createElement('div');
    this.ecoFlowContainer.appendChild(this.alternatorToWheel1);
    
    this.alternatorToWheel2 = document.createElement('div');
    this.ecoFlowContainer.appendChild(this.alternatorToWheel2);
    
    this.alternatorToWheel3 = document.createElement('div');
    this.ecoFlowContainer.appendChild(this.alternatorToWheel3);
    
    
    // Create a div to contain charge from alternator to engine
    this.engineToAlternator = document.createElement('div');
    this.ecoFlowContainer.appendChild(this.engineToAlternator);
     
    
    //Create a div to contain engine 
    this.engine = document.createElement('div');
    this.ecoFlowContainer.appendChild(this.engine);
    
    // Create a div to contain charge arrows from Engine to wheels and vice versa
    this.engineToWheel = document.createElement('div');
    this.ecoFlowContainer.appendChild(this.engineToWheel); 
    
    this.engineToWheel1 = document.createElement('div');
    this.ecoFlowContainer.appendChild(this.engineToWheel1);
    
    this.engineToWheel2 = document.createElement('div');
    this.ecoFlowContainer.appendChild(this.engineToWheel2);
    
    // Create a div to contain Car Top Layer
    this.carTopLayer = document.createElement('div');
    this.ecoFlowContainer.appendChild(this.carTopLayer);
    
    // Create a div to contain side view of both the wheels
    this.carWheels = document.createElement('div');
    this.ecoFlowContainer.appendChild(this.carWheels);
    
    // Create div to contain Energy Flow Title 
    this.energyFlowTitle = document.createElement('div');
    this.properties.energyFlowText =
        this._translateString(this.properties.ecoFlowTitleId,
                              this.properties.energyFlowText,
                              this.properties.subMap);
    this.energyFlowTitle.innerHTML = this.properties.energyFlowText;
    this.ecoFlowContainer.appendChild(this.energyFlowTitle);
    
    // Create a div to show the battery label
    this.batteryLabel = document.createElement('div');
    this.properties.batteryLabelText =
        this._translateString(this.properties.batteryLabelId,
                              this.properties.batteryLabelText,
                              this.properties.subMap);
    this.batteryLabel.innerHTML = this.properties.batteryLabelText;
    this.ecoFlowContainer.appendChild(this.batteryLabel);
    
    // Create a div to show the motor label
    this.motorLabel = document.createElement('div');
    this.properties.motorLabelText =
        this._translateString(this.properties.motorLabelId,
                              this.properties.motorLabelText,
                              this.properties.subMap);
    this.motorLabel.innerHTML = this.properties.motorLabelText;
    this.ecoFlowContainer.appendChild(this.motorLabel);
    
    // Create a div to show the engine label
    this.engineLabel = document.createElement('div');
    this.properties.engineLabelText =
        this._translateString(this.properties.engineLabelId,
                              this.properties.engineLabelText,
                              this.properties.subMap);
    this.engineLabel.innerHTML = this.properties.engineLabelText;
    this.ecoFlowContainer.appendChild(this.engineLabel);
    
    // Append ecoFlow Container to Control Division
    this.controlDiv.appendChild(this.ecoFlowContainer);
    
    // Create a div container to contain the bottom Strip
    this.bottomContainer = document.createElement('div');
    this.controlDiv.appendChild(this.bottomContainer);
    
    //Create a div to contain driving distance title
    this.drivingDistanceTitle = document.createElement('div');
    this.properties.cumulativeDistanceText =
        this._translateString(this.properties.driveDistanceTitleId,
                              this.properties.cumulativeDistanceText,
                              this.properties.subMap);
    this.drivingDistanceTitle.innerHTML = this.properties.cumulativeDistanceText+':';
    this.bottomContainer.appendChild(this.drivingDistanceTitle);
    
    // Create a div to show the driving distance values
    this.drivingDistanceValue = document.createElement('div');
    this.bottomContainer.appendChild(this.drivingDistanceValue);
    
    // Create a div to show the driving distance unit
    this.drivingDistanceUnit = document.createElement('div');
    this.bottomContainer.appendChild(this.drivingDistanceUnit);
    
    // Create a div to show the driving distance percent value
    this.drivingDistancePercent = document.createElement('div');
    this.bottomContainer.appendChild(this.drivingDistancePercent);
    
    // Create a div to contain the Show UMP panel button control
    this.buttonContainer = document.createElement('div');
    this.bottomContainer.appendChild(this.buttonContainer);
    
    // Apply control element style, assuming the control elements' names
    // are used as keys in the CSS style arrays (this.STYLE)
    for (var index in this._STYLE)
    {
    	this[index].className = this._STYLE[index];
    }     
    
    // Append Control Div to parent div for this control
    this.divElt.appendChild(this.controlDiv);
    
    this.divElt.appendChild(this.umpPanelDiv); 
       
    // UMP control configuration
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
    // Instantiate UMP control
    this.umpCtrl = framework.instantiateControl(this.uiaId, this.umpPanelDiv, "Ump3Ctrl", umpConfig);
        
    // Instantiate the "Switch View" button
    //@formatter:off
    var btnInstanceProperties =
    {
        "selectCallback" : this._selectHandler.bind(this),
        "enabledClass" : "EcoFlowCtrlShowUmp",
        "disabledClass" : null,
        "focusedClass": null,
        "downClass" : "EcoFlowCtrlShowUmpHit",
        "heldClass" : "EcoFlowCtrlShowUmpHit",
        "appData" : this.properties.appData,
    };
    //@formatter:on
    this.showUmpButtonCtrl = framework.instantiateControl(this.uiaId, this.buttonContainer, "ButtonCtrl", btnInstanceProperties);
    this._init();
}

/*
 * Utility function to look up a translatable string ID and/or accept a default text string.
 */
EcoFlowCtrl.prototype._translateString = function(strId, strText, subMap)
{
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
EcoFlowCtrl.prototype._stringToHTML = function(textStr)
{
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
 * Utility function to readable format a duration (expressed in milliseconds)
 * TODO: Use the utility.getDurationPieces() APIs once they're ready in the framework
 */
EcoFlowCtrl.prototype._formatDurationString = function(durationMs)
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
            durationStr += hours + "h";
        }
        if ((durationStr !== "") ||
            (minutes > 0))
        {
            durationStr += minutes + "m";
        }
        if ((durationStr !== "") ||
            (seconds > 0))
        {
            durationStr += seconds + "s";
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
EcoFlowCtrl.prototype._selectHandler = function(buttonObj, appData, params)
{
    if (typeof(this.properties.selectCallback) === "function")
    {
        this.properties.selectCallback(this, appData, null);
        
    }
    else
    {
        log.warn("EcoFlowCtrl: no valid selectCallback configured");
    }
}

// Utility function to start up the clock timer for the capacitor low-pass filter animation
EcoFlowCtrl.prototype._capChgLvlTimerStart = function()
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

// Callback function to implement the capacitor low-pass filter animation
EcoFlowCtrl.prototype._capChgLvlTimerCallback = function()
{
    // If we have a target capacitor level, ...
    if (this.properties.capChgLvl != null)
    {
        // ... figure out how far away from the current level we are
        var delta = this.properties.capChgLvl - this._currentCapChgLvl;
        if (delta == 0)
        {
            // The animation is done -- we're at the target capacitor level.
            // Clean up any timer that might have brought us here.
            this._capChgLvlTimerCleanup();
        }
        else if (Math.abs(delta) == 1)
        {
            // We're adjacent to the target capacitor level, so go ahead & just set it.
            this._currentCapChgLvl = this.properties.capChgLvl;

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
            this.carBattery.className = "EcoFlowCtrlCarBattery0" + this._currentCapChgLvl;
        }
        else
        {
            this.carBattery.className = "EcoFlowCtrlCarBattery";
        }
    }
    else
    {
        // Otherwise, stop any capacitor low-pass filter animation
        this._capChgLvlTimerCleanup();

        // Forget our current capChgLvl
        this._currentCapChgLvl = 0;
		
        // Turn the capacitor charge level display off
        this.carBattery.className = "EcoFlowCtrlCarBattery";
    }
}

// Utility function to clean up the clock timer for the capacitor low-pass filter animation
EcoFlowCtrl.prototype._capChgLvlTimerCleanup = function()
{
    if (this._capChgLvlTimer != null)
    {
        log.debug("Cleaning up _capChgLvlTimer...");

        // Turn off the timer triggering time modification events
        clearInterval(this._capChgLvlTimer);
        this._capChgLvlTimer = null;
    }
}

EcoFlowCtrl.prototype._animateAccWheels = function()
{
	this.wheelRotateAccInt = setInterval(this._startWheelAnim.bind(this), 40);
}

EcoFlowCtrl.prototype._startWheelAnim = function()
{
	if(this.isReverse)
	{	
		this.carWheels.style.backgroundPosition = '0px -'+this.wheelCount+'px';
		if(this.wheelCount <= 0)
		{
			this.wheelCount = 672;
		}
		else
		{
			this.wheelCount -= 96;
		}
	}
	else
	{
		this.carWheels.style.backgroundPosition = '0px -'+this.wheelCount+'px';
		if(this.wheelCount == 672)
		{
			this.wheelCount = 0;
		}
		else
		{
			this.wheelCount += 96;
		}
	}
}

EcoFlowCtrl.prototype._stopTireRotation = function()
{
	if(this.wheelRotateAccInt != null)
	{
		clearInterval(this.wheelRotateAccInt);
		this.wheelRotateAccInt = null;
	}
}

EcoFlowCtrl.prototype._motorToBatteryAnim = function()
{
	
	this.motorToBattInt = setInterval(this._startArrowAnimtions.bind(this), 20);
}

EcoFlowCtrl.prototype._startMotorToBatteryAnim = function()
{
	this.batteryCharge.style.backgroundPosition = '0px -'+this.motorToBattCount+'px';
	if(this.motorToBattCount == 690)
	{
		this.motorToBattCount = 0;
	}
	else
	{
		this.motorToBattCount += 30;
	}
}

EcoFlowCtrl.prototype._startArrowAnimtions = function()
{
	// Battery Charging Arrows Blue
	this.batteryCharge.style.backgroundPosition = '0px -'+this.motorToBattCount+'px';
	if(this.motorToBattCount == 690)
	{
		this.motorToBattCount = 0;
	}
	else
	{
		this.motorToBattCount += 30;
	}
	
	// Battery Discharging Arrows White
	this.batteryDischarge.style.backgroundPosition = '0px -'+this.BattToMotorCount+'px';
	if(this.BattToMotorCount == 690)
	{
		this.BattToMotorCount = 0;
	}
	else
	{
		this.BattToMotorCount += 30;
	}
	
	// Engine to Wheels(1-2) Arrows Red
	this.engineToWheel1.style.backgroundPosition = '0px -'+this.engineToWheelCount+'px';
	if(this.engineToWheelCount == 2760)
	{
		this.engineToWheelCount = 0;
	}
	else
	{
		this.engineToWheelCount += 120;
	}
	
	// Engine to Motor Arrows Red
	
	
	
	// Wheel to Motor(1-2) Arrows Blue
	this.wheelToAlternator2.style.backgroundPosition = '0px -'+this.wheelToMotorCount+'px';
	if(this.wheelToMotorCount == 2760)
	{
		this.wheelToMotorCount = 0;
	}
	else
	{
		this.wheelToMotorCount += 120;
	}
	
	// Wheel to Motor(1) Arrows Blue
	
	// Motor to Wheels (1-2) Arrows White
	this.alternatorToWheel2.style.backgroundPosition = '0px -'+this.motorToWheelCount+'px';
	if(this.motorToWheelCount == 2760)
	{
		this.motorToWheelCount = 0;
	}
	else
	{
		this.motorToWheelCount += 120;
	}
	
	// Wheel to Motor(1) Arrows White
}

EcoFlowCtrl.prototype._getPattern = function(configObj)
{
	var engineTireActive = configObj.engineTireActive;
	var engineMotorActive = configObj.engineMotorActive;
	var motorTireActive = configObj.motorTireActive;
	var motorBatteryActive = configObj.motorBatteryActive;
	    
	
	if((engineTireActive === true) && (engineMotorActive === true)  &&  motorTireActive === 'MotorToTire' && motorBatteryActive === 'BattToMotor')
	{
		return 1;
	}
	else if((engineTireActive === true)  && (engineMotorActive === true)   &&  motorTireActive === 'MotorToTire' && motorBatteryActive === 'MotorToBatt')
	{
		return 2;
	}
	else if((engineTireActive === true)  && (engineMotorActive === true)  &&  motorTireActive === 'NONE' && motorBatteryActive === 'MotorToBatt')
	{
		return 3;
	}
	else if((engineTireActive === true)   && (engineMotorActive === true) &&  motorTireActive === 'MotorToTire' && motorBatteryActive === 'NONE')
	{
		return 4;
	}
	else if((engineTireActive === true)  && (engineMotorActive === false)  &&  motorTireActive === 'NONE' && motorBatteryActive === 'NONE')
	{
		return 5;
	}
	else if( (engineTireActive === false)  && (engineMotorActive === true)  &&  motorTireActive === 'MotorToTire' && motorBatteryActive === 'BattToMotor')
	{
		return 6;
	}
	else if((engineTireActive === false) && (engineMotorActive === true)   &&  motorTireActive === 'MotorToTire' && motorBatteryActive === 'MotorToBatt')
	{
		return 7;
	}
	
	else if((engineTireActive === false)  && (engineMotorActive === true)   &&  motorTireActive === 'MotorToTire' && motorBatteryActive === 'NONE')
	{
		return 8;
	}
	else if( (engineTireActive === false)  && (engineMotorActive === true)   &&  motorTireActive === 'TireToMotor' && motorBatteryActive === 'MotorToBatt')
	{
		return 9;
	}
	else if((engineTireActive === false)   && (engineMotorActive === true)  &&  motorTireActive === 'NONE' && motorBatteryActive === 'MotorToBatt')
	{
		return 10;
	}
	else if((engineTireActive === false)  && (engineMotorActive === false)   &&  motorTireActive === 'MotorToTire' && motorBatteryActive === 'BattToMotor')
	{
		return 11;
	}
	else if((engineTireActive === false)   && (engineMotorActive === false)   &&  motorTireActive === 'TireToMotor' && motorBatteryActive === 'MotorToBatt')
	{
		return 12;
	}
	else if((engineTireActive === false)  && (engineMotorActive === false)   &&  motorTireActive === 'NONE' && motorBatteryActive === 'NONE')
	{
		return 13;
	}
	else
	{
		return 13;
	}
	
}

EcoFlowCtrl.prototype._setHEVPattern = function(pattern)
{
	
	// Red arrows 1-2
	this.engineToWheel1.style.opacity = this._REDARROW12_PATTERN[pattern];

	//Red Arrows 1
	this.engineToAlternator.style.opacity = this._REDARROW1_PATTERN[pattern];

	// White Arrows 1-2
	this.alternatorToWheel2.style.opacity = this._WHITEARROW12_PATTERN[pattern];

	// White Arrows 1
	this.alternatorToWheel1.style.opacity = this._WHITEARROW1_PATTERN[pattern];

	// Blue Arrows 1-2
	this.wheelToAlternator2.style.opacity = this._BLUEARROW12_PATTERN[pattern];

	// Blue Arrows 1
	this.wheelToAlternator1.style.opacity = this._BLUEARROW1_PATTERN[pattern];

	// Battery Charging 
	this.batteryCharge.style.opacity = this._CHARGINGARROW_PATTERN[pattern];

	// Battery Discharging
	this.batteryDischarge.style.opacity = this._DISCHARGINGARROW_PATTERN[pattern];
		
}



/******************/
/* Public Methods */
/******************/

EcoFlowCtrl.prototype.setHEVConfig = function(ecoHEVConfig)
{
	var pattern = this._getPattern(ecoHEVConfig) - 1;
    if(this._currentHEVPattern !== pattern)
	{
		this._setHEVPattern(pattern);
		this._currentHEVPattern = pattern;
	}
    var isPatternValid = ((pattern >= 0 && pattern <= 11) ? true : false); 
    
    if(isPatternValid)
    {	
		if(((ecoHEVConfig.engineTireActive === true) || ((ecoHEVConfig.motorTireActive === "MotorToTire") || (ecoHEVConfig.motorTireActive === "TireToMotor"))) && (ecoHEVConfig.vehicleSpeed >= 1))
		{
			this.isReverse = ecoHEVConfig.reverseRequested;
			
			if(this.isReverse === true || this.isReverse === false)
			{
				if(this.wheelRotateAccInt === null)
				{
					
					this._animateAccWheels();
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
		
		// Engine Glow
		if((ecoHEVConfig.engineTireActive === true) || (ecoHEVConfig.engineMotorActive === true))
		{
			this.engine.className = 'EcoFlowCtrlEngineGlow';
		}
		else
		{
			this.engine.className = 'EcoFlowCtrlEngine';
		}
		
		// Capacitor Glow
		if(ecoHEVConfig.motorBatteryActive === 'MotorToBatt')
		{
			this.carBatteryCharging.className = 'EcoFlowCtrlBatteryCharging';
		}
		else
		{
			this.carBatteryCharging.className = 'EcoFlowCtrlHidden';
		}
	}
    else
    {
    	this._stopTireRotation();
    	this.engine.className = 'EcoFlowCtrlEngine';
    	this.carBatteryCharging.className = 'EcoFlowCtrlHidden';
    }
}

EcoFlowCtrl.prototype.setBatteryLevel = function(currentLevel)
{
	 
	   this.properties.capChgLvl = currentLevel;
	
       this._currentCapChgLvl = currentLevel;
       
    	if (this._currentCapChgLvl > 0)
        {
    		this.carBattery.className = "EcoFlowCtrlCarBattery0" + this._currentCapChgLvl;
        }
        else
        {
            this.carBattery.className = "EcoFlowCtrlCarBattery";
        }
}


EcoFlowCtrl.prototype.setEvDrvDistance = function(driveDistance)
{
	var unitId = driveDistance.unitId;
	var unitText = this._translateString(unitId, unitId, this.properties.subMap);
	this.drivingDistanceUnit.innerHTML = this._stringToHTML(unitText);
	
	if(driveDistance.driveDistance != null)
	{
		this.drivingDistanceValue.innerHTML = this._stringToHTML(driveDistance.driveDistance);
	}
	else
	{
		this.drivingDistanceValue.innerHTML = this._stringToHTML("--.-");
	}
	
	if(driveDistance.percentValue != null)
	{
		this.drivingDistancePercent.innerHTML = this._stringToHTML("("+driveDistance.percentValue+"%)");
	}
	else
	{
		this.drivingDistancePercent.innerHTML = this._stringToHTML("(--)");
	}
	
	
}


// Dummy API 
EcoFlowCtrl.prototype.setTireRotation = function(isReverse)
{
	this.isReverse = isReverse;
	if(this.wheelRotateAccInt == null)
	{
		this._animateAccWheels();
	}
}

 /*
  * toggle Ump panel | status == "hidePanel" OR status == "showPanel"
  */
EcoFlowCtrl.prototype.toggleUmpPanel = function(status)
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

EcoFlowCtrl.prototype.getContextCapture = function()
{
    log.debug("EcoFlowCtrl: getContextCapture() called...");
    if(this.umpCtrl)
    {
    	var controlContextCapture = this.umpCtrl.getContextCapture();
    	return controlContextCapture;
    }
};


EcoFlowCtrl.prototype.finishPartialActivity = function()
{
    log.debug("EcoFlowCtrl: finishPartialActivity() called...");
    if(this.umpCtrl)
    {
    	this.umpCtrl.finishPartialActivity();
    }
}


/**
 * Context restore
 * TAG: framework, public
 * =========================
 * @return {object} - capture data
 */

EcoFlowCtrl.prototype.restoreContext = function(controlContextCapture)
{
    log.debug("EcoFlowCtrl: restoreContext() "+ controlContextCapture);
    if(this.umpCtrl)
    {
    	this.umpCtrl.restoreContext(controlContextCapture);
    }
};


/*
 * Forward all multicontroller events to our only child control, the "SwitchView" button
 */
EcoFlowCtrl.prototype.handleControllerEvent = function(eventId)
{
    log.debug("EcoFlowCtrl: handleControllerEvent() called: " + eventId);
    var response;
    // Pass-through
    if(this._umpPanelStatus && this.umpCtrl)
    {
    	response = this.umpCtrl.handleControllerEvent(eventId);
        return response;
    }
    else if(!this._umpPanelStatus && this.showUmpButtonCtrl)
    {
        response = this.showUmpButtonCtrl.handleControllerEvent(eventId);
        return response;
    }
    
    
}

EcoFlowCtrl.prototype.cleanUp = function()
{
    // Clean up any capacitor level low-pass animation timer that may be running
    this._capChgLvlTimerCleanup(true);

    // Clean up the child button control
    if (this.showUmpButtonCtrl)
    {
        this.showUmpButtonCtrl.cleanUp();
    }
    if(this.umpCtrl)
     {
     	this.umpCtrl.cleanUp();
     }
}
framework.registerCtrlLoaded("EcoFlowCtrl");