/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: ClockSettings2Ctrl.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: arve
 Date: 04.25.2013
 __________________________________________________________________________

 Description: IHU GUI ClockSettings2Ctrl

 Revisions:
 v0.1 (25-Apr-2013) Created ClockSettings2Ctrl
 __________________________________________________________________________

* */

log.addSrcFile("ClockSettings2Ctrl.js", "common");

/*
 * Constructor
 */
function ClockSettings2Ctrl(uiaId, parentDiv, controlId, properties)
{    
    this.uiaId = uiaId;             // (String) UIAID of the App using this Control
    this.divElt = null;             // (HTMLElement) Top-level div for this Control
    this.controlId = controlId;     // (String) Unique ID assinged to this Control by GUI Framework

    this.umpCtrl = null;            // (Object) Reference to the UMP

    this._parentDiv = parentDiv;    // (HTMLElement) Parent div assigned to this Control by GUI Framework

    this._ctrlKeyHeld = false;      // (Boolean) Variable to determine whether increment/decrement key is held

    this._currentTimeAsDate = null;  // (Object) Holds the current TimeStamp reveived from App

    // Encapsulate our current time state in an object
    this._currentTime = new Object();
    this._currentTime.hours = 0;
    this._currentTime.minutes = 0;
    this._currentTime.pmFlag = false;        /* true = PM, false = AM */

    this._heldTimerId = null;
    this._heldCallbackTimerCallback = null;

    // UMP button configurations for all control styles.  Different
    // control styles that share buttons reuse these configurations.
    this._umpButtonConfigs          = new Object();

    this._umpButtonConfigs["goBack"] = {
        buttonBehavior              : "shortPressOnly",
        imageBase                   : "IcnUmpBack",
        disabled                    : false,
        appData                     : "goBack",
        label                       : null,
        labelId                     : null,
    };

    this._umpButtonConfigs["hoursDown"] = {
        buttonBehavior              : "shortAndHold",
        imageBase                   : "IcnUmpMinus",
        disabled                    : false,
        appData                     : "hoursDown",
        label                       : null,
        labelId                     : null,
    };

    this._umpButtonConfigs["hoursUp"] = {
        buttonBehavior              : "shortAndHold",
        imageBase                   : "IcnUmpPlus",
        disabled                    : false,
        appData                     : "hoursUp",
        label                       : null,
        labelId                     : null,
    };

    this._umpButtonConfigs["minutesDown"] = {
        buttonBehavior              : "shortAndHold",
        imageBase                   : "IcnUmpMinus",
        disabled                    : false,
        appData                     : "minutesDown",
        label                       : null,
        labelId                     : null,
    };

    this._umpButtonConfigs["minutesUp"] = {
        buttonBehavior              : "shortAndHold",
        imageBase                   : "IcnUmpPlus",
        disabled                    : false,
        appData                     : "minutesUp",
        label                       : null,
        labelId                     : null,
    };
    
    this._umpButtonConfigs["toggleAMPM"] = {
        buttonBehavior              : "shortPressOnly",
        imageBase                   : "IcnUmpAmPm",
        disabled                    : false,
        appData                     : "toggleAMPM",
        label                       : null,
        labelId                     : null,
    };

    // Lists of CSS styles for each available control style.
    // NOTE: The list keys must match the names of the HTML objects
    //       created in _createStructure(), so they can be properly
    //       applied via the loop in setCtrlStyle().
    this._styles = {
        "style12": {
            "ctrlTitle"             : "ClockSettings2CtrlTitle",
            "ctrlBodyFrame"         : "ClockSettings2CtrlBodyFrame",
            "hoursTensDigitFrame"   : "ClockSettings2CtrlHoursTensDigitFrame",
            "hoursTensDigit"        : "ClockSettings2CtrlHoursTensDigit",
            "hoursOnesDigitFrame"   : "ClockSettings2CtrlHoursOnesDigitFrame",
            "hoursOnesDigit"        : "ClockSettings2CtrlHoursOnesDigit",
            "colonSeparatorFrame"   : "ClockSettings2CtrlColonSeparatorFrame",
            "minutesTensDigitFrame" : "ClockSettings2CtrlMinutesTensDigitFrame",
            "minutesTensDigit"      : "ClockSettings2CtrlMinutesTensDigit",
            "minutesOnesDigitFrame" : "ClockSettings2CtrlMinutesOnesDigitFrame",
            "minutesOnesDigit"      : "ClockSettings2CtrlMinutesOnesDigit",
            "amPm"                  : "ClockSettings2CtrlAMPM",
        },
        "style24": {
            "ctrlTitle"             : "ClockSettings2CtrlTitle",
            "ctrlBodyFrame"         : "ClockSettings2CtrlBodyFrame",
            "hoursTensDigitFrame"   : "ClockSettings2CtrlHoursTensDigitFrame",
            "hoursTensDigit"        : "ClockSettings2CtrlHoursTensDigit",
            "hoursOnesDigitFrame"   : "ClockSettings2CtrlHoursOnesDigitFrame",
            "hoursOnesDigit"        : "ClockSettings2CtrlHoursOnesDigit",
            "colonSeparatorFrame"   : "ClockSettings2CtrlColonSeparatorFrame",
            "minutesTensDigitFrame" : "ClockSettings2CtrlMinutesTensDigitFrame",
            "minutesTensDigit"      : "ClockSettings2CtrlMinutesTensDigit",
            "minutesOnesDigitFrame" : "ClockSettings2CtrlMinutesOnesDigitFrame",
            "minutesOnesDigit"      : "ClockSettings2CtrlMinutesOnesDigit",
            "amPm"                  : "ClockSettings2CtrlHidden",
        },
    };

    //@formatter:off
    this.properties = {
        "ctrlStyle": "style12",      // (String) determines whether the Control will display 12-hour or 24-hour time
        "ctrlTitle": "",             // (String) Literal text to display in the Control title
        "ctrlTitleId": "",           // (String) StringID to show localized text in the Control title
        "subMap": "",                // (Object) Optional subMap to be used with ctrlTitleId
        "initialTime": null,         // (Date|String|Number) Initial time to display when the Control is instantiated
        "timeChangedCallback": null, // (Function) Function to call when the user updates the time
        "appData": null,             // (Object) Any data the App needs passed back when the timeChangedCallback is made
        "heldButtonIntervalMs": 250  // (Number) number of milliseconds between time changes while the user holds a +/- button
    };
    //@formatter:on

    for (var i in properties)
    {
        this.properties[i] = properties[i];
    }

    this._createStructure();
}

/*******************/
/* Private Methods */
/*******************/

ClockSettings2Ctrl.prototype._init = function()
{
    this.setClockSettings2Config(this.properties);
};

ClockSettings2Ctrl.prototype._createStructure = function()
{
    // create the div for control
    this.divElt = document.createElement('div');
        this.divElt.className = "ClockSettings2Ctrl";
    
    // create div for control body
    this._ctrlBodyFrame = document.createElement('div');
        this.divElt.appendChild(this._ctrlBodyFrame);

    // create div for control title
    this._ctrlTitle = document.createElement('div');
        this._ctrlBodyFrame.appendChild(this._ctrlTitle);

    // create div & span for hours tens digit
    this._hoursTensDigitFrame = document.createElement('div');
        this._ctrlBodyFrame.appendChild(this._hoursTensDigitFrame);
    
    this._hoursTensDigit = document.createElement("span"); 
        this._hoursTensDigitFrame.appendChild(this._hoursTensDigit);

    // create div & span for hours ones digit
    this._hoursOnesDigitFrame = document.createElement('div');
        this._ctrlBodyFrame.appendChild(this._hoursOnesDigitFrame);
    
    this._hoursOnesDigit = document.createElement("span"); 
        this._hoursOnesDigitFrame.appendChild(this._hoursOnesDigit);

    // create div for colon separator (between hours & minutes)
    this._colonSeparatorFrame = document.createElement('div');
        this._ctrlBodyFrame.appendChild(this._colonSeparatorFrame);

    // create div & span for minutes tens digit
    this._minutesTensDigitFrame = document.createElement('div');
        this._ctrlBodyFrame.appendChild(this._minutesTensDigitFrame);
   
    this._minutesTensDigit = document.createElement("span"); 
        this._minutesTensDigitFrame.appendChild(this._minutesTensDigit);

    // create div & span for minutes ones digit
    this._minutesOnesDigitFrame = document.createElement('div');
        this._ctrlBodyFrame.appendChild(this._minutesOnesDigitFrame);
    
    this._minutesOnesDigit = document.createElement("span"); 
        this._minutesOnesDigitFrame.appendChild(this._minutesOnesDigit);

    // create div for am/pm indicator
    this._amPm = document.createElement("div"); 
        this._ctrlBodyFrame.appendChild(this._amPm);

    // attach control to parent        
    this._parentDiv.appendChild(this.divElt);

    // Instantiate the UMP with the appropriate configuration
    log.debug("Instantiating umpCtrl...");
    
    //@formatter:off
    this._umpConfig =
    {
        "buttonConfig" :
        {
            "goBack"                : this._umpButtonConfigs["goBack"],
            "hoursDown"             : this._umpButtonConfigs["hoursDown"],
            "hoursUp"               : this._umpButtonConfigs["hoursUp"],
            "minutesDown"           : this._umpButtonConfigs["minutesDown"],
            "minutesUp"             : this._umpButtonConfigs["minutesUp"],
            "toggleAMPM"            : this._umpButtonConfigs["toggleAMPM"]
        },
        "defaultSelectCallback"     : this._umpDefaultSelectCallback.bind(this),
        "defaultHoldStartCallback"  : this._umpDefaultHoldStartCallback.bind(this),
        "defaultHoldStopCallback"   : this._umpDefaultHoldStopCallback.bind(this),
        "retracted"                 : false,
        "tooltipsEnabled"           : true,
    };
    //@formatter:on
    
    this.umpCtrl = framework.instantiateControl(this.uiaId, this.divElt, "Ump3Ctrl", this._umpConfig);
    
    // enable/disable the AM/PM button
    this.umpCtrl.setButtonDisabled("toggleAMPM", (this.properties.ctrlStyle !== "style12"));
    
    this._init();
};

ClockSettings2Ctrl.prototype._updateClockDisplay = function()
{
    log.debug("_updateClockDisplay called...");

    // Check for the CtrlStyle and update the pmFlag
    if (this.properties.ctrlStyle === "style12")
    {
        this._currentTime.pmFlag = (this._currentTime.hours > 11);
    }

    // Display the time on the control
    this._displayTime();

    var ampmText = framework.localize.getLocStr(this.uiaId, this._currentTime.pmFlag ? "common.TimeLabelPm" : "common.TimeLabelAm", this._subMap);

    // Set the ampmText and show that if ctrlstyle is style12
    this._amPm.innerText = ampmText;
};

/*
 * Function to display the time on the control
 */
ClockSettings2Ctrl.prototype._displayTime = function()
{
    log.debug("_displayTime called...");

    var displayHours = this._currentTime.hours;

    // calculate the display hous based on currentTime.hours
    if (this.properties.ctrlStyle === "style12")
    {
        if (this._currentTime.hours > 12)
        {
            displayHours = this._currentTime.hours - 12;
        }
        else if (this._currentTime.hours == 0)
        {
            displayHours = 12;
        }
    }

    var hoursTensDigit = Math.floor(displayHours / 10);
    var hoursOnesDigit = displayHours % 10;
    var minutesTensDigit = Math.floor(this._currentTime.minutes / 10);
    var minutesOnesDigit = this._currentTime.minutes % 10;

    this._hoursTensDigit.innerText = hoursTensDigit;
    this._hoursOnesDigit.innerText = hoursOnesDigit;
    this._minutesTensDigit.innerText = minutesTensDigit;
    this._minutesOnesDigit.innerText = minutesOnesDigit;

    /* Check added to stop updating AM/PM if user is adjusting hours in style12 CtrlStyle
     * If pmFlag is set (PM) then update the currentTime to 24 hrs format which will be sent to app
     * If pmFlag is not set (AM) change the currentTime to displayHours
     */ 
    if (this.properties.ctrlStyle === "style12")
    {
        // Case for PM (pmFlag is set)
        if(this._currentTime.pmFlag === true)
        {
            // Change the currentTime.hours to 24 hrs format if hours value < 12
            if (this._currentTime.hours < 12)
            {
                this._currentTime.hours = this._currentTime.hours + 12;
            }
            else
            {
                // Do not change the currenTime.hours as the time is in 24 hrs format
            }
        }
        // Case for AM (pmFlag is not set)
        else if(this._currentTime.pmFlag === false)
        {
          // Set displayHours as the currentTime
          this._currentTime.hours = displayHours;

          /* If the currentTime.hours is 12 then make it as Zero (0)
           * Ctrl receives the time as 0 hours from App which Ctrl will update as 12 AM
           */
          if(this._currentTime.hours === 12)
          {
              this._currentTime.hours = 0;
          }
          else
          {
              // The currentTime is already set. Do nothing
          }
        }
        else
        {
            // Do nothing
        }
    }
    else
    {
        // CtrlStyle is style24 and hence send the currentTime as adjusted
    }
};

/*
 * Sends the updated time to the app
 */
ClockSettings2Ctrl.prototype._updateTime = function()
{
    log.debug("_updateTime called...");

    // Create the Date object we'll return to the control's parent application
    var updatedDateTime = new Date();

    if (this._currentTimeAsDate != null)
    {
        updatedDateTime = this._currentTimeAsDate;
    }

    // Update the hours & minutes with the freshly-updated values
    updatedDateTime.setHours(this._currentTime.hours);
    updatedDateTime.setMinutes(this._currentTime.minutes);

    // If we have a valid callback...
    if (typeof(this.properties.timeChangedCallback) === 'function')
    {
        var params = {
            "updatedDateTime": updatedDateTime
        };
        // Call the callback & pass the updated Date 
        this.properties.timeChangedCallback(this, this.properties.appData, params);
    }
};

ClockSettings2Ctrl.prototype._decrementHours = function()
{
    this._currentTime.hours--;

    if (this._currentTime.hours < 0)
    {
        this._currentTime.hours = 23;
    }

    // Do not update AM/PM. Update only the adjusted time on the control
    this._displayTime();
};

ClockSettings2Ctrl.prototype._incrementHours = function()
{

    this._currentTime.hours++;

    if (this._currentTime.hours > 23)
    {
        this._currentTime.hours = 0;
    }

    // Do not update AM/PM. Update only the adjusted time on the control
    this._displayTime();
};

ClockSettings2Ctrl.prototype._decrementMinutes = function()
{

    this._currentTime.minutes--;

    if (this._currentTime.minutes < 0)
    {
        this._currentTime.minutes = 59;
    }

    this._displayTime();
};

ClockSettings2Ctrl.prototype._incrementMinutes = function()
{

    this._currentTime.minutes++;

    if (this._currentTime.minutes > 59)
    {
        this._currentTime.minutes = 0;
    }

    this._displayTime();
};

ClockSettings2Ctrl.prototype._toggleAMPM = function()
{
    // Switch from AM to PM by adding 12 hours and re-clamping to valid range (0,23)
    this._currentTime.hours = (this._currentTime.hours + 12) % 24;
    this._updateClockDisplay();
};

// Unified handler for all UMP "select" button presses.
ClockSettings2Ctrl.prototype._umpDefaultSelectCallback = function(ctrlObj, appData, params)
{
    log.debug("_umpDefaultSelectCallback called...", ctrlObj, appData, params);

    // Use the appData field to determine which control was pressed,
    // then adjust the time accordingly and notify the control's parent
    // application of the updated time.
    if (appData === "hoursDown")
    {
        this._decrementHours();
        this._updateTime();
    }
    else if (appData === "hoursUp")
    {
        this._incrementHours();
        this._updateTime();
    }
    else if (appData === "minutesDown")
    {
        this._decrementMinutes();
        this._updateTime();
    }
    else if (appData === "minutesUp")
    {
        this._incrementMinutes();
        this._updateTime();
    }
    else if (appData === "toggleAMPM")
    {
        this._toggleAMPM();
        this._updateTime();
    }
    else if (appData === "goBack")
    {
        framework.sendEventToMmui("Common", "Global.GoBack");
    }

};

// Utility function to start up the UMP held-button clock timer
ClockSettings2Ctrl.prototype._heldTimerStart = function()
{
    log.debug("_heldTimerStart called...");

    this._heldTimerId = setInterval(this._heldCallbackTimerCallback, this.properties.heldButtonIntervalMs);
};

// Utility function to clean up the UMP held-button clock timer
ClockSettings2Ctrl.prototype._heldTimerCleanup = function(clearCallbackFlag)
{
    log.debug("_heldTimerCleanup called: clearCallbackFlag = " + clearCallbackFlag);

    if (this._heldTimerId != null)
    {
        // Turn off the timer triggering time modification events
        clearInterval(this._heldTimerId);
        this._heldTimerId = null;
    }

    if (clearCallbackFlag)
    {
        // If requested, clear the timer callback
        this._heldCallbackTimerCallback = null;
    }
};

ClockSettings2Ctrl.prototype._umpDefaultHoldStartCallback = function(ctrlObj, appData, params)
{
    log.debug("_umpDefaultHoldStartCallback() called...", ctrlObj, appData, params);

    //Set the flag to TRUE so that the new time from MMUI will be ignored when key is held
    this._ctrlKeyHeld = true;

    // Use the appData field to determine which control was pressed,
    // and start a timer to call the appropriate time modification
    // function.  We do NOT notify the application of these updates,
    // to avoid hammering the low-level API's with time update calls;
    // wait for the HoldStop events to do that.
    if (appData === "hoursDown")
    {
        this._decrementHours();
        this._updateTime();
        this._heldCallbackTimerCallback = this._decrementHours.bind(this);
    }
    else if (appData === "hoursUp")
    {
        this._incrementHours();
        this._updateTime();
        this._heldCallbackTimerCallback = this._incrementHours.bind(this);
    }
    else if (appData === "minutesDown")
    {
        this._decrementMinutes();
        this._updateTime();
        this._heldCallbackTimerCallback = this._decrementMinutes.bind(this);
    }
    else if (appData === "minutesUp")
    {
        this._incrementMinutes();
        this._updateTime();
        this._heldCallbackTimerCallback = this._incrementMinutes.bind(this);
    }

    if (this._heldCallbackTimerCallback != null)
    {
        this._heldTimerStart();
    }
};

ClockSettings2Ctrl.prototype._umpDefaultHoldStopCallback = function(ctrlObj, appData, params)
{
    log.debug("_umpDefaultHoldStopCallback() called..." + ctrlObj + appData + params);

    //Clear the flag so that the new time if received from MMUI will be updated
    this._ctrlKeyHeld = false;

    // Clean up the UMP held-button timer
    this._heldTimerCleanup(true);

    // Notify the control's parent application of the updated time
    this._updateTime();
};

/******************/
/* Public Methods */
/******************/

ClockSettings2Ctrl.prototype.setClockSettings2Config = function(config)
{
    log.debug("ClockSettings2Ctrl: setClockSettings2Config() called...");

    // Control style
    this.setCtrlStyle(config.ctrlStyle);

    // Control Title and TitleId

    if (config.ctrlTitleId)
    {
        this.setCtrlTitleId(config.ctrlTitleId, config.subMap);
    }
    else if (config.ctrlTitle)
    {
        this.setCtrlTitle(config.ctrlTitle);
    }

    // Initialize the clock display from the system clock
    this.setCurrentTime(config.initialTime);

    // Set the held button interval
    this.setHeldButtonInterval(config.heldButtonIntervalMs);
};

ClockSettings2Ctrl.prototype.setCtrlStyle = function(ctrlStyle)
{
    log.debug("ClockSettings2Ctrl: setCtrlStyle() called...");

    // Control style
    if (ctrlStyle && ((ctrlStyle === "style12") || (ctrlStyle === "style24")))
    {
        this.properties.ctrlStyle = ctrlStyle;

        // Apply control element styles, assuming the control elements' names
        // are used as keys in the CSS style arrays (this._styles)
        for (var i in this._styles[this.properties.ctrlStyle])
        {
            this["_" + i].className = this._styles[this.properties.ctrlStyle][i];
        }

        // Update the UMP based on the current control style
        if (this.umpCtrl)
        {

            log.debug("  setCtrlStyle(): using UMP setButtonDisabled()");

            // enable/disable the AM/PM button
            this.umpCtrl.setButtonDisabled("toggleAMPM", (this.properties.ctrlStyle !== "style12"));
        }

        // Refresh the display
        this._updateClockDisplay();
    }
    else
    {
        log.warn("ClockSettings2 ctrlStyle must be one of 'style12' or 'style24'");
    }
};

/*
 * Sets literal text to be displayed in the title
 * @params  ctrlTitle   String  Literal text to be displayed
 */
ClockSettings2Ctrl.prototype.setCtrlTitle = function(ctrlTitle)
{
    log.debug("ClockSettings2Ctrl: setCtrlTitle() called...");

    this.properties.ctrlTitle = ctrlTitle;
            
    if (utility.toType(ctrlTitle) == 'string')
    {

        this._ctrlTitle.innerText = this.properties.ctrlTitle;
    }
    else
    {
        this._ctrlTitle.innerText = "";
    }
};

/*
 * Sets localized text to be displayed in the title
 * @param   ctrlTitleId String  String ID to be localized
 * @params  subMap  Object  Optional subMap to use with the String ID
 */
ClockSettings2Ctrl.prototype.setCtrlTitleId = function(ctrlTitleId, subMap)
{
    log.debug("ClockSettings2Ctrl: setCtrlTitleId() called...");

    this.properties.ctrlTitleId = ctrlTitleId;
    this.properties.subMap = subMap;

    if (utility.toType(ctrlTitleId) == 'string')
    {
        this.properties.ctrlTitle = framework.localize.getLocStr(this.uiaId, this.properties.ctrlTitleId, this.properties.subMap);
        this._ctrlTitle.innerText = this.properties.ctrlTitle;
    }
    else
    {
        this._ctrlTitle.innerText = "";
    }
};

ClockSettings2Ctrl.prototype.setCurrentTime = function(currentTime)
{
    //check whether increment/decrement key is held by the user
    //if held do not update the time
    if (this._ctrlKeyHeld === false)
    {
        log.debug("ClockSettings2Ctrl: setCurrentTime() called...");

        var currentTimeType = utility.toType(currentTime);
        log.debug("  currentTimeType = " + currentTimeType);

        // If the passed-in object is a number, ...
        if (currentTimeType === "number")
        {
            // ... treat it as UTCmilliseconds
            this._currentTimeAsDate = new Date(currentTime);
        }
        // Or, if the passed-in object is a string, ...
        else if (currentTimeType === "string")
        {
            // ... attempt to parse a Date out of it
            var ms = Date.parse(currentTime);

            if (!isNaN(ms))
            {
                this._currentTimeAsDate = new Date(ms);
            }
        }
        else if (currentTimeType === 'date')
        {
            this._currentTimeAsDate = currentTime;
        }
        else
        {
            // Otherwise, if the passed-in object isn't a Date object, ...
            log.warn(this.uiaId + ": Call made to setCurrentTime with invalid argument:", currentTime, "Using system time as default.");

            // ... create a new Date (defaults to current system time)
            this._currentTimeAsDate = new Date();
        }

        this._currentTime.hours = this._currentTimeAsDate.getHours();
        this._currentTime.minutes = this._currentTimeAsDate.getMinutes();

        this._updateClockDisplay();
    }
    else
    {
        // do not update time as the user is holding increment/decrement key
    }
};

ClockSettings2Ctrl.prototype.setHeldButtonInterval = function(heldButtonIntervalMs)
{
    log.debug("ClockSettings2Ctrl: setHeldButtonInterval() called: heldButtonIntervalMs = " + heldButtonIntervalMs);

    // If we got a new held interval...
    if ((heldButtonIntervalMs != null) &&
        (typeof(heldButtonIntervalMs) === "number"))
    {
        // Make sure it's an integer
        heldButtonIntervalMs = Math.floor(heldButtonIntervalMs);

        // Make sure it's in range
        if (heldButtonIntervalMs < 10)
        {
            // Enforce a minimum 10ms held button interval
            heldButtonIntervalMs = 10;
        }
        else if (heldButtonIntervalMs > 1500)
        {
            // Enforce a maximum 1500ms held button interval (the hold start delay on buttons)
            heldButtonIntervalMs = 1500;
        }

        // Remember it
        this.properties.heldButtonIntervalMs = heldButtonIntervalMs;

        // Is there a held callback timer currently running?
        if (this._heldTimerId != null)
        {
            // Yes -- stop it without clearing the callback (so we can restart it)
            this._heldTimerCleanup(false);

            // If we've got a callback function to invoke periodically...
            if (this._heldCallbackTimerCallback != null)
            {
                // Restart the timer with the new held interval
                this._heldTimerStart();
            }
        }
    }
};

/*
 * Sets the +/- icon style based on the status received
 * @param   disabledStatus specifies whether icon needs to be enabled or disabled
 */
ClockSettings2Ctrl.prototype.setAdjustEnabled = function(disabledStatus)
{
    // check for the disabledStatus
    if (disabledStatus === true) // disable the buttons if disabledStatus is true
    {
        if(this.umpCtrl)
        {
            // disable the ump buttons
            this.umpCtrl.setButtonDisabled("hoursDown", true);
            this.umpCtrl.setButtonDisabled("hoursUp", true);
            this.umpCtrl.setButtonDisabled("minutesDown", true);
            this.umpCtrl.setButtonDisabled("minutesUp", true);
            
            if (this.properties.ctrlStyle === "style12")
            {
                this.umpCtrl.setButtonDisabled("toggleAMPM", true);
            }
        }
    }

    if (disabledStatus === false) // enable the buttons if disabledStatus is false
    {
        if (this.umpCtrl)
        {
            // enable the ump buttons
            this.umpCtrl.setButtonDisabled("hoursDown", false);
            this.umpCtrl.setButtonDisabled("hoursUp", false);
            this.umpCtrl.setButtonDisabled("minutesDown", false);
            this.umpCtrl.setButtonDisabled("minutesUp", false);
            
            if (this.properties.ctrlStyle === "style12")
            {
                this.umpCtrl.setButtonDisabled("toggleAMPM", false);
            }
        }
    }
};

ClockSettings2Ctrl.prototype.handleControllerEvent = function(eventId)
{
    // Pass-through
    if (this.umpCtrl)
    {
        var response = this.umpCtrl.handleControllerEvent(eventId);
        return response;
    }
};

/**
 * Captures the current focus/context information of the control.
 * Called when framework switches the context from this control to another control.
 * The information will be returned in the form of a special object specific to the control.
 * This object will have all the required information to restore focus/context on control and its subcontrols.
 * This object can be used by framework to restore back the focus/context.
 * TAG: public
 * =========================
 * @param void
 * @return controlContextCapture - object with current focus/context information of the control.
 */
ClockSettings2Ctrl.prototype.getContextCapture = function()
{
    var controlContextCapture = {
        umpFocusObj    : this.umpCtrl.getContextCapture(),
    };
    return controlContextCapture;
};

/**
 * Restores the control with the earlier captured focus/context information which was captured using getContextCapture() function.
 * Called when framework switches back to the previous context from the new context.
 * The information is passed in the same structured object form as returned by getContextCapture() function.
 * This object is the returned value to the last getContextCapture() function.
 * This object will have the required information to restore back to the state when getContextCapture() was called.
 * TAG: public
 * =========================
 * @param controlContextCapture - object with previously captured focus/context information of the control
 * @return void
 */
ClockSettings2Ctrl.prototype.restoreContext = function(controlContextCapture)
{
    if (controlContextCapture.umpFocusObj)
    {
        this.umpCtrl.restoreContext(controlContextCapture.umpFocusObj);
    }
    else
    {
        //do nothing
    }
};

ClockSettings2Ctrl.prototype.cleanUp = function()
{
    // Clean up any UMP held-button timer that may be running (and its callback)
    this._heldTimerCleanup(true);

    //Clear the flag so that the new time if received from MMUI will be updated
    this._ctrlKeyHeld = false;

    // Clean up the UMP
    if (this.umpCtrl)
    {
        this.umpCtrl.cleanUp();
    }
};

framework.registerCtrlLoaded("ClockSettings2Ctrl");
