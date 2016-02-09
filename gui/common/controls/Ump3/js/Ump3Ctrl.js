/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: Ump3Ctrl.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: agohsmbr
 Date: 09.14.2012
 __________________________________________________________________________

 Description: IHU GUI UMP (Universal Media Player) Control

 Revisions:
 v0.1 (14-September-2012) Created Ump2 Control
 v0.2 (1-October-2012) Added support for "hold" icon states. Added regular
      expression to check for existence of path in an icon's imageBase.
 v0.3 (16-October-2012)
        - Added Scrubber/Slider to control
 v0.4 (29-October-2012)
         - Changed UmpScrubber prototype to UmpScrubber2 to prevent namespace
         collisions with the old UmpScrubber in Ump 1.
 v0.5 (30-October-2012)
         - Modified how imageBase properties are used in multi-state button
         stateArray[]. Now only to be included if the root imageBase does not
         work for one or more individual states.
         - If individual state imageBase properties are included, we do not
         concatenate the state name onto the imageBase. In that case, state 
         is assumed to be managed externally.
v0.6 (14-December-2012)
        - added check to setButtonState() API to prevent crashes if/when an
        invalid buttonId is passed
        - added setDisabled() method for disabling individual buttons
        - added _setButtonIcon() method 
        - Updated multicontroller routine to properly "hop" over disabled
        buttons and/or give focus left/right
v0.7 (15-January-2013) 
        - Corrected a bug that could result in duplicate Umps
        - Modified cleanUp() method to also remove any child ButtonCtrls
          or separators. This prevents duplication when setUmpConfig() is
          called.
        - Moved the z-index value of UmpScrubber into commonVariables and
          set as 7 so as to be below other controls such as Dialog2
        - Added "total time" and "elsapsed time" text boxes to UmpScrubber
v0.8 (23-January-2013)
        - Modified cleanUp() to use framework.destroyControl();
v0.9 (25-January-2013)
        - Updated to Ump3Ctrl
        - Removed UmpScrubber2. Replaced with SliderCtrl
        - Added getFocusCapture() and restoreFocus() methods
v1.0 (11-March-2013)
        - Added long press / hold event handling for multicontroller
        - Updated graphical assets
        - Scrubber can now be touched at any point if enabled
        - Added support for disabled scrubber
        - Added "progress" scrubber mode (no "thumb" or user interaction)
        - Added "hit" state highlight for multicontroller
        - Ump now remembers button focus when bumping from button to scrubber and back
        - Added ability to retract and show Ump
        - Replaced old scrubber style with three new styles from Studio
        - Corrected bug that resulted in an unresponsive scrubber when a new 
          setUmpConfig() call was made
        - Added "buffering" state
v1.1 (09-April-2013)
        - Added support for new focusCallback
        - Added Tooltip prototype
        - Added handling for instantiating and removing tooltips
v1.2 (21-May-2013)
        - Removed line from _removeFocus() method that set buttonSelectIndex to -1
        - Fixed bug that allowed the Commander to select an Ump button when the 
          scrubber had focus.
        - Added fast-tilting for selecting Ump buttons
        
 __________________________________________________________________________

 */

log.addSrcFile("Ump3Ctrl.js", "common");
//log.setLogLevel("common", "debug");

function Ump3Ctrl(uiaId, parentDiv, controlId, properties)
{
    log.debug("Ump3Ctrl() constructor called...");

    this.uiaId = uiaId;                         // 
    this.controlId = controlId;                 //
    this.parentDiv = parentDiv;                 //
    this.properties = properties;               //
    
    this._inputMode = "controllerActive";       //
    this._buttonSelectIndex = -1;               // Number - Keeps track of currently selected Ump button
    this._prevButtonIndex = -1;                 // Number - Used for storing previous button index for deselecting and removing tooltips
    this._iconPath = "common/images/icons/";    // String - Path to common icon files 
    this._retracted = false;                    // Determines initial “retracted” state. May be null. Defaults to false.
    this._umpHasFocus = true;                   // Boolean - Keeps track of whether or not the Ump has focus. Default assumes focus.
    this._scrubberHadFocus = false;             // Boolean - Keeps track of whether or not the scrubber had focus when the ump lost focus.
    this._inRetractTransition = false;          // Boolean - Keeps track of whether or not the Ump is currently in a retract transition
    this._inButtonCallback = false              // Boolean - Used to prevent the Application from setting the button state during a select callback
    
    // Scrubber-specific
    this._elapsedTime = null;                   // String - A pre-formatted time value indicating elapsed play time.
    this._totalTime = null;                     // String - A pre-formatted time value indicating total play time.
    this._scrubberDuration = null;              // Number - A number, in ms, indicating length of audio, if known. Used by multicontroller to scrub in 5s increments.
    this._scrubberIsBuffering = false;          // Boolean - If true, a “barber pole” graphic/animation is shown in place of a progress bar.   
    this._scrubberDisabled = false;             // Boolean - If true, Ump Scrubber is in a disabled state
    this._scrubberFocused = false;              // Boolean - If true, Ump Scrubber has focus
    this._scrubberHandleWidth = 66;             // As of latest Studio design
    this._scrubberVisible = true;               // Boolean - If true, the Ump Scrubber is visible
    
    this._tooltipIndex = 0;                     // Number - incremented each time a new Tooltip is instantiated
    this._tooltipArray = [];                    // Array - Used to keep track of any current instances of Tooltips
    this._tooltipTimeout = 3000;                // Number - Milliseconds until a Tooltip times out
    this._tooltipsEnabled = null;               // Boolean - Determines whether or not to show Tooltips
    this._tooltipTimeoutId = 0;                 // (Number) ID to clear the timeout with
    this._buttonWidth = null;                   // Number - Used to keep track of the current width of Ump buttons
    this._MAX_ID_NUM = 50;                      // Number - Used to limit how large _tooltipIndex value can become
    
    this._tiltTimeout = 1500;                   // (Number) Hold/Long press timeout in ms - 1.5 sec
    this._tiltTimeoutId = 0;                    // (Number) ID to clear the timeout with
    this._isTilted = false;                     // (Boolean) true if the multicontroller is currently tilted left/right.
    this._isFastTilting = false;                // (Boolean) Keeps track of when fast tilting is in-progress.
    this._tiltChangeInterval = 500;             // (NUmber) Time between button changes when fast tilting in ms - 0.5 sec
    this._tiltChangeId = 0;                     // (Number) ID to clear the timeout with
    
    this._minChangeTimerId = null;              // (Number) ID to clear the change timeout with
    this._minChangeInterval = 250;              // (Number) Number of milliseconds between slide callbacks
    
    this._bufferingOnly = false;                // (Boolean) Used when a scrubberStyle only includes a buffering bar
    
    //@formatter:off
    this.properties = {
        "defaultSelectCallback" : null,
        "defaultLongPressCallback" : null,
        "defaultHoldStartCallback" : null,
        "defaultHoldStopCallback" : null,
        "defaultSlideCallback" : null,
        "defaultFocusCallback" : null,
        "retracted" : false,
        "hasScrubber" : false,
        "scrubberVisible" : true,
        "initialButtonFocus" : null,
        "buttonConfig" : null,
        "scrubberConfig" : null
    };
    //@formatter:on

    for(var i in properties)
    {
        this.properties[i] = properties[i];
    }
    
    // Check syssettings for Tooltips setting. 
    var sysTooltipsEnabled = framework.getSharedData("syssettings", "ToolTips");

    log.debug("sysTooltipsEnabled: " + sysTooltipsEnabled);
    
    if (sysTooltipsEnabled === true || sysTooltipsEnabled === false)
    {
        this._tooltipsEnabled = sysTooltipsEnabled;
    }
    else
    {
        // Default to true - This should never happen
        this._tooltipsEnabled = true;
        log.warn("framework.getSharedData(\"syssettings\", \"ToolTips\") returned an invalid value: " + sysTooltipsEnabled + ". Defaulting to tooltips ON.");
    }

    var count = 0;

    for(var i in this.properties["buttonConfig"])
    {
        count++;
    }
    
    // TODO: Instead of adding a buttonCount property to
    // the properties object, set private variable
    this.properties.buttonCount = count;
    
    // If there is a scrubberConfig, check for and set "duration"
    if(this.properties.scrubberConfig && this.properties.scrubberConfig.duration != null)
    {
        this._scrubberDuration = this.properties.scrubberConfig.duration;
    }
    
    // Check for enabled/disabled - Ump needs to know in order to allow/prevent
    // giving focus to the scrubber on bump up.
    if(this.properties.scrubberConfig && this.properties.scrubberConfig.disabled != null)
    {
        this._scrubberDisabled = this.properties.scrubberConfig.disabled;
    }

    this._createStructure();

    // Setup Ump retracted initial state outside of this._createStructure. setUmpConfig() calls
    // this._createStructure and we don't want to setup the initial ump state multiple times.
    this._slideAnimationEndBinder = this._slideAnimationEnd.bind(this);
    this.divElt.addEventListener("animationend", this._slideAnimationEndBinder, false);
 
    this._setRetracted(this.properties.retracted);
}

Ump3Ctrl.prototype.setScrubberVisible = function(isVisible)
{
    log.debug("setScrubberVisible() ", isVisible);
    
    if(this._umpScrubber)
    {        
        if(isVisible)
        {
            if (this._scrubberIsBuffering == true)
            {
                log.info("setScrubberVisible called while in buffering state. Automatically exiting buffering state.")
                this.setBuffering(false);
            }
            
            this._umpScrubber.divElt.style.visibility = "visible";
            this._scrubberVisible = true;
            // NOTE: Do not assume focus.
        }
        else
        {
            this._umpScrubber.divElt.style.visibility = "hidden";
            this._scrubberVisible = false;
            
            // Scrubber cannot retain focus
            if(this._scrubberFocused || this._scrubberHadFocus)
            {
                // Attempt to set focus on previously selected button
                this._buttonFocusHelper(this._buttonSelectIndex);
            }
        }
    }
    else
    {
        log.warn(this.uiaId + ": Ump3Ctrl: setScrubberVisible called with no Ump Scrubber.");
    }
};

Ump3Ctrl.prototype._init = function()
{
    log.debug("Ump3Ctrl: _init() called...");
    
    this.setInputMode(this._inputMode);
    
    if(this.properties.initialButtonFocus != null)
    {
        // Store button focus but don't show it yet
        var buttonIndex = this.properties.buttonConfig[this.properties.initialButtonFocus].buttonIndex;
        this._buttonSelectIndex = buttonIndex;
    }
    else
    {
        // Store default button focus but don't show it yet
        this._buttonSelectIndex = 0;
        if (!this._isValidIndex(this._buttonSelectIndex))
        {
            var firstValid = this._getNextValidIndex("right");
            if (firstValid != null)
            {
                this._buttonSelectIndex = firstValid;
            }
        }
    }
};

Ump3Ctrl.prototype._createStructure = function()
{
    log.debug("_createStructure() called...");
    // create the div for control
    if(!this.divElt)
    {
        this.divElt = document.createElement('div');
            this.divElt.className = "Ump3Ctrl";
            this.divElt.id = this.controlId;
    }
    
    if(!this._umpBackground)
    {
    this._umpBackground = document.createElement('div');
        this._umpBackground.className = "Ump3CtrlBackground";
        this.divElt.appendChild(this._umpBackground);
    }
    
    log.debug("this.properties.hasScrubber: " + this.properties.hasScrubber);
    
    
    // Configure scrubber based on style and instantiate
    if(this.properties.hasScrubber && !this._umpScrubber)
    {
        log.debug("hasScrubber...");
        // NOTE: sliderProperties created and modified for internal UMP purposes. this.properties.scrubberConfig is considered read-only.
        log.debug("   Making deep copy of this.properties.scrubberConfig: ", this.properties.scrubberConfig);
        var sliderProperties = utility.deepCopy(this.properties.scrubberConfig);
        
        // Determine property set based on style
        var scrubberStyle = sliderProperties.scrubberStyle;
        
        // Set width property
        switch(scrubberStyle)
        {
            case "Style01":
                sliderProperties.width = 578; // Actual 578
                break;
            case "Style02":
                sliderProperties.width = 664; // Actual 664
                break;
            case "Style03":
                sliderProperties.width = 750; // Actual 750
                break;
            default:
                break;    
        }
        
        // Set handle width property
        sliderProperties.handleWidth = this._scrubberHandleWidth;
        
        // Create buffer div
        if(!this.scrubberBuffer)
        {
            this.scrubberBuffer = document.createElement('div');
                this.scrubberBuffer.className = "Ump3CtrlBuffer" + scrubberStyle;
                this.divElt.appendChild(this.scrubberBuffer);
        }
        
        // Initially hide buffer
        this.scrubberBuffer.style.visibility = "hidden";
        
        // Wrapper styles
        sliderProperties.wrapperClass = "UmpScrubber" + scrubberStyle;
        sliderProperties.focusedWrapperClass = "UmpScrubberFocusedWrapper" + scrubberStyle;
        sliderProperties.disabledWrapperClass = "UmpScrubberDisabledWrapper" + scrubberStyle;
        
        // Fill styles
        sliderProperties.fillClass = "UmpScrubberFill" + scrubberStyle;
        sliderProperties.focusedFillClass = "UmpScrubberFocusedFill" + scrubberStyle;
        sliderProperties.disabledFillClass = "UmpScrubberDisabledFill" + scrubberStyle;
        
        // Handle styles
        sliderProperties.handleClass = "UmpScrubberHandle" + scrubberStyle,
        sliderProperties.focusedHandleClass = "UmpScrubberFocusedHandle" + scrubberStyle;
        sliderProperties.disabledHandleClass = "UmpScrubberDisabledHandle" + scrubberStyle;
        
        sliderProperties.onFocusCallback = this._scrubberFocusCallback.bind(this);
        sliderProperties.canStealFocus = true;
        
        // Check SliderCtrl style
        // NOTE: Karl.S preferred "mode" as the property name for the "scrubber"
        // in the Ump. This was to avoid confusion with "scrubberStyle". 
        // However, in the SliderCtrl, the equivalent property
        // ended up being named "style". In order to prevent breaking any
        // existing app, pass the value of the mode property into the
        // SliderCtrl's style property.
        
        if (sliderProperties.mode == "progress")
        {
            sliderProperties.style = "progress";
        }
        else
        {
            // Check for "pivot"
            if (sliderProperties.mode == "pivot")
            {
                log.warn("Ump3Ctrl: Ump scrubber cannot use SliderCtrl's 'pivot' style. Defaulting to 'slider'.");
                sliderProperties.style = "slider";
            }
            // default to "slider" if not specified
            sliderProperties.style = "slider";
        }
        
        // Create scrubber instance
        this._umpScrubber = framework.instantiateControl(this.uiaId, this.divElt, "SliderCtrl", sliderProperties);
        
        // Set any post-instantiation scrubber settings
        
        // Check for progress style
        if(sliderProperties.mode == "progress")
        {
            // A SliderCtrl with a "progress" style cannot be interacted with
            // Disable scrubber
            this.setScrubberDisabled(true);
        }
        
        // Check for buffering
        if(sliderProperties.buffering != null)
        {
            this.setBuffering(sliderProperties.buffering);
        }
        
        // Set visibility
        this.setScrubberVisible(this.properties.scrubberVisible);
    }
    else
    {
        // Check for buffering-only styles: style04 / style05
        log.debug("   Checking for buffering-only...");
        
        if(this.properties.scrubberConfig && !this._umpScrubber)
        {
            // hasScrubber is false but we received a scrubberConfig.
            var sliderProperties = utility.deepCopy(this.properties.scrubberConfig);
            
            // Determine property set based on style
            var scrubberStyle = sliderProperties.scrubberStyle;
            log.debug("   scrubberStyle: " + scrubberStyle);
            
            if(scrubberStyle == "Style04" || scrubberStyle == "Style05")
            {
                this._bufferingOnly = true;
                
                // Create buffer div
                if(!this.scrubberBuffer)
                {
                    this.scrubberBuffer = document.createElement('div');
                        this.scrubberBuffer.className = "Ump3CtrlBuffer" + scrubberStyle;
                        this.divElt.appendChild(this.scrubberBuffer);
                }
                
                log.debug("   sliderProperties.buffering: " + sliderProperties.buffering);
                
                // Check for buffering state
                if(sliderProperties.buffering != null)
                {
                    this.setBuffering(sliderProperties.buffering);
                }
                
                if(this.properties.scrubberConfig.scrubberStyle == "Style05")
                {
                    // If Style05, only elapsed time shown
                    if(!this._elapsedTimeLabel)
                    {
                        this._elapsedTimeLabel = document.createElement('div');
                            this._elapsedTimeLabel.className = "Ump3CtrlElapsedTime";
                            this.divElt.appendChild(this._elapsedTimeLabel);
                    }
                }
            }
            else
            {
                log.warn("Ump3Ctrl: scrubberConfig passed with a value of hasScrubber = false. Only buffering styles Style04 and Style05 may be used in this case.");
            }
        }
    }
    
    // Create elapsed and total time based on scrubber style
    if(this.properties.hasScrubber)
    {
        // NOTE: this.properties.scrubberConfig is considered read-only below
        if(this.properties.scrubberConfig.scrubberStyle == "Style01")
        {
            // If Style01, both elapsed and total time shown
            if(!this._elapsedTimeLabel)
            {
                this._elapsedTimeLabel = document.createElement('div');
                    this._elapsedTimeLabel.className = "Ump3CtrlElapsedTime";
                    this.divElt.appendChild(this._elapsedTimeLabel);
            }
            
            if(!this._totalTimeLabel)
            {
                this._totalTimeLabel = document.createElement('div');
                    this._totalTimeLabel.className = "Ump3CtrlTotalTime";
                    this.divElt.appendChild(this._totalTimeLabel);
            }
        }
        else if(this.properties.scrubberConfig.scrubberStyle == "Style02")
        {
            // If Style02, only elapsed time shown
            if(!this._elapsedTimeLabel)
            {
                this._elapsedTimeLabel = document.createElement('div');
                    this._elapsedTimeLabel.className = "Ump3CtrlElapsedTime";
                    this.divElt.appendChild(this._elapsedTimeLabel);
            }
        }
        else
        {
            // Neither elapsed or total time shown
        }
    }
    else
    {
        // Elapsed time may be used without a scrubber present
        if(!this._elapsedTimeLabel)
        {
            this._elapsedTimeLabel = document.createElement('div');
                this._elapsedTimeLabel.className = "Ump3CtrlElapsedTime";
                this.divElt.appendChild(this._elapsedTimeLabel);
        }
    }

    // Determine button settings and create buttons
    var stylePrefix = "Ump3Ctrl" + this.properties.buttonCount + "Button";

    var buttonIndex = 0;
    
    this._buttonWidth = Math.round(800 / this.properties.buttonCount);

    var selectCallback = this._selectCallback.bind(this);
    var longPressCallback = this._longPressCallback.bind(this);
    var holdStartCallback = this._holdStartCallback.bind(this);
    var holdStopCallback = this._holdStopCallback.bind(this);
    var focusCallback = this._focusCallback.bind(this);

    this._slideAnimationEndBinder = this._slideAnimationEnd.bind(this);

    // Determine ButtonCtrl properties for each button and instantiate
    var indexNum = 0;
    for(var i in this.properties["buttonConfig"])
    {       
        this.properties["buttonConfig"][i].buttonIndex = indexNum;
        indexNum++;

        if(this.properties["buttonConfig"][i].autoStateChange === undefined)
        {
            this.properties["buttonConfig"][i].autoStateChange = true;
        }
        // Temporarily store the original value of appData from the app.
        var originalAppData = this.properties.buttonConfig[i].appData;
        
        var thisButtonConfig = {
            // Set button style
            "useDebugClasses" : false,
            "canStealFocus" : true,
            "onFocusCallback" : focusCallback,
            "selectCallback" : selectCallback,
            "longPressCallback" : longPressCallback,
            "holdStartCallback" : holdStartCallback,
            "holdStopCallback" : holdStopCallback,
            "appData" : {"hashId" : i, "originalAppData" : originalAppData}, // Temporarily add hashId to identify button calls
            "canSlideOnto" : false,
            "buttonBehavior" : this.properties.buttonConfig[i].buttonBehavior,
            "enabledClass" : stylePrefix + "_En",
            "disabledClass" : stylePrefix + "_Ds",
            "focusedClass" : stylePrefix + "_focused",
            "downClass" : stylePrefix + "_down",
            "heldClass" : stylePrefix + "_held",
            "iconClass" : "Ump3CtrlButtonIcon",
            "icon" : null
        };
        
        var leftPos = buttonIndex * this._buttonWidth;

        // Instantiate button        
        this["umpBtnCtrl_" + buttonIndex] = framework.instantiateControl(this.uiaId, this.divElt, "ButtonCtrl", thisButtonConfig);
            this["umpBtnCtrl_" + buttonIndex].divElt.style.left = leftPos + "px";

        // Add button separator
        if(buttonIndex != 0 && buttonIndex != this.properties.buttonCount)
        {
            this["umpBtnCtrlSeparator_" + buttonIndex] = document.createElement('div');
                this["umpBtnCtrlSeparator_" + buttonIndex].className = "Ump3CtrlSeparator";
                this.divElt.appendChild(this["umpBtnCtrlSeparator_" + buttonIndex]);
                this["umpBtnCtrlSeparator_" + buttonIndex].style.left = (leftPos - 1) + "px";
        }

        // Set button to match current inputMode
        this["umpBtnCtrl_" + buttonIndex].handleControllerEvent(this._inputMode);
        
        // Set enabled/disabled
        if(this.properties.buttonConfig[i].disabled != null)
        {
            this.setButtonDisabled(i, this.properties.buttonConfig[i].disabled);
        }
        
        // Set button icon
        this._setButtonIcon(i);

        buttonIndex++;
    }
    
    // Once buttons are built, place chrome arc on top
    if(!this._umpBgArc)
    {
        this._umpBgArc = document.createElement('div');
            this._umpBgArc.className = "Ump3CtrlBgArch";
            this.divElt.appendChild(this._umpBgArc);
    }
    else
    {
        // Remove and re-create to make sure the arc is on top
        // Remove
        this.divElt.removeChild(this._umpBgArc);
        // Re-create
        this._umpBgArc = document.createElement('div');
            this._umpBgArc.className = "Ump3CtrlBgArch";
            this.divElt.appendChild(this._umpBgArc);
    }
    
    // Build a button array and sort on buttonIndex
    // NOTE: Only necessary for multicontroller to skip over disabled
    // buttons when moving left/ccw
    this._buttonArray = [];
    for(var i in this.properties.buttonConfig)
    {
        this._buttonArray.push(this.properties.buttonConfig[i]);
    }
    
    function compare(a,b) {
        if (a.buttonIndex < b.buttonIndex)
            return -1;
        if (a.buttonIndex > b.buttonIndex)
            return 1;
        return 0;
    }
    
    this._buttonArray.sort(compare);
    
    if(this.divElt.parentNode == null)
    {
        this.parentDiv.appendChild(this.divElt);
    }

    this._init();
};

Ump3Ctrl.prototype._getIconPath = function(icon)
{
    var iconHasBackslashes = (/\/|\\/).test(icon);
    var iconPath = "";
        
    if(!iconHasBackslashes)
    {
        // Use common path
        iconPath = this._iconPath;
    }
    else
    {
        // The imageBase is specifying the path. Leave empty
    }
    
    return iconPath;
};

Ump3Ctrl.prototype.setButtonFocus = function(hashId)
{
    log.debug("Ump3Ctrl: setButtonFocus() ", hashId);
    
    // NOTE: if setButtonFocus() is being called, it is 
    // assumed that the button should be immediately focused
    // and, if focused, scrubber will lose focus
    if(this.properties.buttonConfig[hashId].disabled != true)
    {        
        // Get new button index
        var buttonIndex = this.properties.buttonConfig[hashId].buttonIndex;        
        this._buttonFocusHelper(buttonIndex);
    }
};

Ump3Ctrl.prototype.setUmpConfig = function(buttonConfig)
{
    log.debug("Ump3Ctrl: setUmpConfig(): ", buttonConfig);
    // Remove any current focus (will also remove any tooltip)
    this._buttonFocusHelper(-1);
    
    // Cleanup any previous button configuration
    this._cleanUpButtons();
    
    // Re-set min/max/increment in case they were modified
    // due to a previous call to setScrubberDuration
    if (this._umpScrubber)
    {
        this._umpScrubber.setMoveIncrement(0, 1, 0.1);
    }

    this.properties["buttonConfig"] = buttonConfig;
    
    // Check for previous initialButtonFocus value
    // Remove if found. New focus can be set via 
    // the setButtonFocus() method if needed.
    if(this.properties.initialButtonFocus)
    {
        this.properties.initialButtonFocus = null;
    }

    var count = 0;

    for(var i in this.properties["buttonConfig"])
    {
        count++;
    }

    this.properties.buttonCount = count;
    
    // Since we could have any number of buttons in the
    // new configuration, we cannot use the previous
    // button index value. Default to left-most.
    if (this.properties.buttonCount > 0)
    {
        // -1 used to indicate no button focus specified
        this._buttonSelectIndex = -1;
    }
    else
    {
        log.warn("Ump3Ctrl: setUmpConfig() was called with zero buttons.");
    }

    this._createStructure();
    
    // After we're done, make sure to set the button focus for the new config
    this._buttonFocusHelper(this._buttonSelectIndex);
};

Ump3Ctrl.prototype._setButtonIcon = function(buttonId)
{
    log.debug("_setButtonIcon() called...");
    
    var buttonSuffix = "";
    var buttonImage = "";

    // Check for presence of "disabled" property 
    if(this.properties["buttonConfig"][buttonId].disabled != null)
    {
        if(this.properties["buttonConfig"][buttonId].disabled)
        {
            // Disabled
            buttonSuffix = "_Ds";
        }
        else
        {
            // Enabled
            buttonSuffix = "_En";
        }
    }

    // Get iconPath
    var iconPath = this._getIconPath(this.properties["buttonConfig"][buttonId].imageBase);
    
    /* Determine iconPath and imageBase */
    // Is this a multi-state button?
    if(this.properties["buttonConfig"][buttonId].stateArray)
    {
        // What is the stateArray index for the currentlyActive state?
        var stateIndex = 0;
        
        for(var n = 0;n < this.properties["buttonConfig"][buttonId].stateArray.length;n++)
        {
            if(this.properties["buttonConfig"][buttonId].stateArray[n].state == this.properties["buttonConfig"][buttonId].currentState)
            {
                // We have a match
                stateIndex = n;
                break;
            }
        }
        
        // Does a non-standard imagePath value exist for the
        // currentlyActive state?
        if(this.properties["buttonConfig"][buttonId].stateArray[stateIndex].imageBase)
        { 
            // Determine iconPath
            var iconPath = this._getIconPath(this.properties["buttonConfig"][buttonId].stateArray[stateIndex].imageBase);
            
            // Concatenate imageBase and suffix (but not the state)
            buttonImage = iconPath + this.properties["buttonConfig"][buttonId].stateArray[stateIndex].imageBase + buttonSuffix + ".png"; 
        }
        else
        {
            // Standard naming conventions apply.
            // Determine iconPath
            var iconPath = this._getIconPath(this.properties["buttonConfig"][buttonId].imageBase);
            
            // Concatenate imageBase and state
            buttonImage = iconPath + this.properties.buttonConfig[buttonId].imageBase + "_" + this.properties["buttonConfig"][buttonId].stateArray[stateIndex].state + buttonSuffix + ".png"; 
        }
    }
    else
    {
        // Single state button
        // Determine image path
        var iconPath = this._getIconPath(this.properties["buttonConfig"][buttonId].imageBase);
        
        buttonImage = iconPath + this.properties.buttonConfig[buttonId].imageBase + buttonSuffix + ".png";
    }
    
    var buttonIndex = 0;
    var buttonExists = false;
    
    // Find button in hash
    for(var key in this.properties.buttonConfig)
    {
        if(key == buttonId)
        {            
            // Set icon
            this["umpBtnCtrl_" + buttonIndex].setIcon(buttonImage);
            
            buttonExists = true;
            break;
        }
        buttonIndex++;
    }
    
    if(!buttonExists)
    {
        log.error(this.uiaId + ": The specified button, '" + buttonId + "' not found in buttonConfig.");
    }
};

Ump3Ctrl.prototype.setButtonDisabled = function(buttonId, disabled)
{
    log.debug("setButtonDisabled() ", buttonId, disabled);
    
    var buttonIndex = 0;
    var buttonExists = false;
    
    // Find button in hash
    for(key in this.properties.buttonConfig)
    {
        if(key == buttonId)
        {
            // Check existence of "disabled" property
            if(this.properties.buttonConfig[key].disabled != null)
            {
                // Update "disabled" property
                this.properties.buttonConfig[key].disabled = disabled;
                if(disabled)
                {
                    this["umpBtnCtrl_" + buttonIndex].setEnabled(false);
                }
                else
                {
                    this["umpBtnCtrl_" + buttonIndex].setEnabled(true);
                }
                
                buttonExists = true;
                
                // Set icon
                this._setButtonIcon(buttonId);
            }
            else
            {
                // This button has no disabled icon. Cannot be disabled.
                log.error("The specified button, " + buttonId + " has no disabled icon.");
            }
            break;
        }
        buttonIndex++;
    }
    
    if(!buttonExists)
    {
        log.error("The specified button, " + buttonId + " not found in buttonConfig.");
    }
};

Ump3Ctrl.prototype.setButtonState = function(hashId, state)
{   
    log.debug("setButtonState() ", hashId, state);
    var buttonIndex = 0;
    var buttonExists = false;
    
    for(var i in this.properties["buttonConfig"])
    {
        if(i == hashId)
        {
            buttonExists = true;
            break;
        }
        else
        {
            buttonIndex++;
        }
    }
    
    if(!buttonExists)
    {
        log.error("The specified button, " + hashId + " not found in buttonConfig.");
    }
    else
    {
        // A flag variable is used to prevent the Application from setting the button state
        if(!this._inButtonCallback)
        { 
            // Verify that this button is a multi-state button
            if(this.properties["buttonConfig"][hashId].stateArray)
            {
                if (state != this.properties.buttonConfig[hashId].currentState)
                {
                    // Remove Tooltip
                    // NOTE: Remove Tooltip whether the button has focus or not
                    // as it will no longer be correct
                    // NOTE: Because this routine does not change the button focus,
                    // we must explicitly call _removeTooltip().
                    this._removeTooltip(hashId);
                
                
                    // Determine next state
                    // Toggle/iterate to next icon...
                    var buttonImage = "";
                    var buttonSuffix = "";
                    
                    // Check for presence of "disabled" property 
                    if(this.properties["buttonConfig"][hashId].disabled != null)
                    {
                        if(this.properties["buttonConfig"][hashId].disabled)
                        {
                            // Disabled
                            buttonSuffix = "_Ds";
                        }
                        else
                        {
                            // Enabled
                            buttonSuffix = "_En";
                        }
                    }
                    
                    // Find the state
                    for(var i=0;i<this.properties.buttonConfig[hashId].stateArray.length;i++)
                    {
                        if(this.properties.buttonConfig[hashId].stateArray[i].state == state)
                        {
                            // Set state                
            
                            // Does a non-standard imagePath value exist for this state?
                            if(this.properties.buttonConfig[hashId].stateArray[i].imageBase)
                            {                    
                                // Determine iconPath
                                var iconPath = this._getIconPath(this.properties["buttonConfig"][hashId].stateArray[i].imageBase);
                            
                                // Concatenate imageBase and suffix (but not the state)
                                buttonImage = iconPath + this.properties["buttonConfig"][hashId].stateArray[i].imageBase + buttonSuffix + ".png";
                            }
                            else
                            {
                                // Standard naming conventions apply.
                                // Determine iconPath
                                var iconPath = this._getIconPath(this.properties["buttonConfig"][hashId].imageBase);
                                
                                // Concatenate imageBase and state
                                buttonImage = iconPath + this.properties.buttonConfig[hashId].imageBase + "_" + this.properties["buttonConfig"][hashId].stateArray[i].state + buttonSuffix + ".png"; 
                            }
            
                            // Update currentState
                            this.properties.buttonConfig[hashId].currentState = this.properties.buttonConfig[hashId].stateArray[i].state;
                            
                            break;
                        }
                    }
                    
                    this["umpBtnCtrl_" + buttonIndex].setIcon(buttonImage);
                    
                    // If this button currently has focus, show new Tooltip
                    if(this.properties.buttonConfig[hashId].buttonIndex == this._buttonSelectIndex)
                    {
                        // Show Tooltip
                        // NOTE: Because the button focus does not change, we must
                        // explicitly call _showTooltip() here.
                        this._showTooltip(hashId);
                    }
                }
                else
                {
                    // Button is already in this state
                }
            }
            else
            {
                // This is not a multi-state button  
            }
        }
        else
        {
            // This is called from the selectCallBack, ignore the call
            log.warn(this.uiaId + " attempted to call setButtonState() from within a selectCallback. Improper API usage! UMP manages button state. This call should be removed.");
        }
    }
};

Ump3Ctrl.prototype.setInputMode = function(mode)
{
    log.debug("Ump3Ctrl: setInputMode() called ", mode);
    this._inputMode = mode;
    switch(mode)
    {
        case "controllerActive":
            // Enable highlight
            break;
        case "touchActive":
            // Hide highlight
            break;
        default:
            // invalid option
            break;
    }
};

Ump3Ctrl.prototype._isValidIndex = function(index)
{
    log.debug("Ump3Ctrl: _isValidIndex() ", index);
    log.debug("this.properties.buttonCount: " + this.properties.buttonCount);
    log.debug("this._buttonArray.length: " + this._buttonArray.length);

    var isValid = true;
    
    if((index < this.properties.buttonCount) && index != null)
    {
        if(this._buttonArray[index].disabled == true)
        {
            isValid = false;
        }
    }
    else
    {
        // index is out of bounds
        isValid = false;
    }
    
    return isValid;
};

Ump3Ctrl.prototype._getNextValidIndex = function(direction)
{
    log.debug("_getNextValidIndex()", direction);

    var currentIndex = this._buttonSelectIndex;
    
    // Determine which row we are in
    var start = 0;
    var end = (this.properties.buttonCount - 1);    
    var buttonIndex;
    var nextValid = null;
   
   if(direction == "right")
    {
        buttonIndex = start;
        for(var i=start;i<=end;i++)
        {
            if(buttonIndex == (currentIndex + 1))
            {
                // Found match
                if(this._buttonArray[i].disabled == true){
                    // skip
                    currentIndex++;
                    
                    if(currentIndex > end){
                        // There is no next valid to the right
                        break;
                    }
                    else
                    {
                        // Check next button...
                    }
                }
                else
                {
                    nextValid = buttonIndex;
                    break;
                }
            }
            else
            {
                // Keep checking
            }
            buttonIndex++;
        }
    }
    
    if(direction == "left")
    {
        buttonIndex = end;
        
        for(var i = end; i >= start; i--)
        {
            if(buttonIndex == (currentIndex - 1))
            {
                // Check for disabled button
                if(this._buttonArray[i].disabled == true)
                {
                    // Cannot be selected. Skip.
                    currentIndex--;

                    // Keep checking...
                }
                else
                {
                    // Button can be selected. Choose.
                    nextValid = buttonIndex;
                    break;
                }
            }
            else
            {
                // Keep checking...
            }
            
            buttonIndex--;
        }
    }
    
    return nextValid;

};

Ump3Ctrl.prototype._getButtonHashId = function(buttonIndex)
{
    log.debug("Ump3Ctrl: _getButtonHashId() ", buttonIndex);
    var hashId;
    
    for(var i in this.properties["buttonConfig"])
    {       
        if(this.properties["buttonConfig"][i].buttonIndex == buttonIndex)
        {
            hashId = i;
            break;
        }
    }
    
    return hashId;
};

Ump3Ctrl.prototype.handleControllerEvent = function(eventId)
{
    log.debug("Ump3Ctrl: handleControllerEvent() called...", eventId);

    //response will be return value at end of function
    var response = null;

    switch(eventId)
    {
        case "acceptFocusInit": //intentional fallthrough. these cases have the same behavior
        case "acceptFocusFromLeft":
        case "acceptFocusFromRight":
        case "acceptFocusFromTop":
        case "acceptFocusFromBottom":
            log.debug("Ump3Ctrl: handleControllerEvent accepting focus...");
            
            this._umpHasFocus = true;
            /*
                Determine what should have focus (scrubber / button) and
                make sure the other does not.
            */ 
            if(this._umpScrubber && (this._scrubberFocused || this._scrubberHadFocus))
            {
                // Give focus to scrubber
                this._scrubberFocusHelper(true);
            }
            else
            {
                // Give focus to button
                if(this._buttonSelectIndex >= 0)
                {
                    // A value already exists for button focus
                    // Set focus
                    this._buttonFocusHelper(this._buttonSelectIndex);
                }
                else
                {
                    // No previous focus value exists.
                    // Attempt default to left-most button.
                    var buttonIndex = 0;
                    // Set focus   
                    this._buttonFocusHelper(buttonIndex);
                }
                
                // Consumed
                response = "consumed";
            }
            break;
        case "lostFocus":
            this._removeFocus();
            response = "consumed";
            break;
        case "touchActive":
            // input mode change to touch
            this.setInputMode(eventId);
            // Pass event to all button controls
            var buttonIndex = 0;
            for(var i in this.properties["buttonConfig"])
            {
                this["umpBtnCtrl_" + buttonIndex].handleControllerEvent(eventId);
                buttonIndex++;
            }
            
            if(this._umpScrubber)
            {
                // Pass event to scrubber
                this._umpScrubber.handleControllerEvent(eventId);
            }
            
            response = "consumed";
            break;
        case "controllerActive":
            // input mode change to multicontroller
            this.setInputMode(eventId);
            // Pass event to all button controls
            var buttonIndex = 0;
            for(var i in this.properties["buttonConfig"])
            {
                this["umpBtnCtrl_" + buttonIndex].handleControllerEvent(eventId);
                buttonIndex++;
            }
            
            if(this._umpScrubber)
            {
                // Pass event to scrubber
                this._umpScrubber.handleControllerEvent(eventId);
            }
            
            response = "consumed";
            break;
        case "cw":
            // Rotate Right (CW)
            // Check to see if the Ump is currently retract(ed/ing).
            if (this._retracted || this._inRetractTransition)
            {
                // The Ump is retracted. Ignore.
                
                // Ignored
                response = "ignored";
            }
            else
            {
                if(this._umpScrubber && (this._scrubberFocused || this._scrubberHadFocus))
                {
                    // Scrubber exists and has focus...
                    // Pass event to slider
                    response = this._umpScrubber.handleControllerEvent(eventId);
                }
                else
                {
                    // Go to next valid button
                    response = this._buttonMoveHelper("right");
                }
            }
            break;
        case "ccw":
            // Rotate Left (CCW)
            // Check to see if the Ump is currently retract(ed/ing).
            if (this._retracted || this._inRetractTransition)
            {
                // The Ump is retracted. Ignore.
                
                // Ignored
                response = "ignored";
            }
            else
            {
                if(this._umpScrubber && (this._scrubberFocused || this._scrubberHadFocus))
                {
                    // Scrubber exists and has focus...
                    // Pass event to slider
                    response = this._umpScrubber.handleControllerEvent(eventId);
                }
                else
                {    
                    // Go to next valid button
                    response = this._buttonMoveHelper("left");
                }
            }
            break;
        case "select":
            // Select (release)
            if (this._retracted && !this._inRetractTransition)
            {
                // The Ump is retracted. Ignore.
                this.setRetracted(false);
                
                // Ignored
                response = "ignored";
            }
            else
            {
                // If scrubber has focus
                if(this._umpScrubber && (this._scrubberFocused || this._scrubberHadFocus))
                {
                    // Scrubber has focus...attempt to move focus to previously focused button
                    
                    // Make sure the button is still enabled
                    if(this["umpBtnCtrl_" + this._buttonSelectIndex].isEnabled)
                    {
                        // Fire beep
                        this._beep("Short", "Multicontroller");
                        
                        // Set focus   
                        this._buttonFocusHelper(this._buttonSelectIndex);
                        
                        response = "consumed";
                    }
                    else
                    {
                        // The selected button is disabled should not move from anywhere else
                        // NOTE: ButtonCtrl now prevents this event from firing if disabled
                    }
                }
                else
                {
                    response = this["umpBtnCtrl_" + this._buttonSelectIndex].handleControllerEvent("select");
                }
            }
            break;
        case "selectStart":
            // Select Start (press down)
            // Check to see if the Ump is currently retract(ed/ing).
            if (this._retracted || this._inRetractTransition)
            {
                // The Ump is retracted. Ignore.
                // The "select" event will handle bring up the Ump.
                // Ignored
                response = "ignored";
            }
            else
            {
                // If scrubber has focus
                if(this._umpScrubber && (this._scrubberFocused || this._scrubberHadFocus))
                {
                    // Scrubber has focus...
                    // Pass event to slider
                    response = this._umpScrubber.handleControllerEvent(eventId);
                }
                else
                {
                    response = this["umpBtnCtrl_" + this._buttonSelectIndex].handleControllerEvent("selectStart");
                }
            }
            break;
        case "left":
            // Tilt Left
            // Check to see if the Ump is currently retract(ed/ing).
            if (this._retracted || this._inRetractTransition)
            {
                // Ump is retracted. Ignore.
                // The "select" event will handle bring up the Ump.
                // Ignored.
                response = "ignored";
            }
            else
            {
                // Check for fast-tilting
                clearTimeout(this._tiltTimeoutId);
                if(this._isFastTilting)
                {
                    // Consume event.
                    clearTimeout(this._tiltChangeId);
                    this._isFastTilting = false;
                    this._isTilted = false;
                    response = "consumed";
                }
                else if(!this._umpScrubber || (!this._scrubberFocused && !this._scrubberHadFocus))
                {
                    // If scrubber does not have focus...
                    // Go to next valid button
                    response = this._buttonMoveHelper("left");
                }
                else
                {
                    
                    // Scrubber has focus...
                    // Pass event to slider
                    response = this._umpScrubber.handleControllerEvent(eventId);
                }
            }
            break;
        case "leftStart":
            // Left Start
            // Check to see if the Ump is currently retract(ed/ing).
            if (this._retracted || this._inRetractTransition)
            {
                // Ump is retracted. Ignore.
                // The "select" event will handle bring up the Ump.
                // Ignored.
                response = "ignored";
            }
            else
            {
                if(this._umpScrubber && (this._scrubberFocused || this._scrubberHadFocus))
                {
                    // Send to scrubber
                    response = this._umpScrubber.handleControllerEvent("leftStart");               
                }
                else
                {
                    // Implement "fast move"
                    this._tiltStartHandler("left");
                }
            }
            break;
        case "right":
            // Tilt Right
            // Check to see if the Ump is currently retract(ed/ing).
            if (this._retracted || this._inRetractTransition)
            {
                // Ump is retracted. Ignore.
                // The "select" event will handle bring up the Ump.
                // Ignored.
                response = "ignored";
            }
            else
            {
                // Check for fast-tilting
                clearTimeout(this._tiltTimeoutId);
                if(this._isFastTilting)
                {
                    // Consume event.
                    clearTimeout(this._tiltChangeId);
                    this._isFastTilting = false;
                    this._isTilted = false;
                    response = "consumed";
                }
                else if(!this._umpScrubber || (!this._scrubberFocused && !this._scrubberHadFocus))
                {
                    // If the scrubber does not have focus...
                    // Go to next valid button
                    response = this._buttonMoveHelper("right");
                }
                else
                {
                   // Scrubber has focus...
                   // Pass event to slider
                   response = this._umpScrubber.handleControllerEvent(eventId);
                }
            }
            break;
        case "rightStart":
            // rightStart
            // Check to see if the Ump is currently retract(ed/ing).
            if (this._retracted || this._inRetractTransition)
            {
                // Ump is retracted. Ignore.
                // The "select" event will handle bring up the Ump.
                // Ignored.
                response = "ignored";
            }
            else
            {
                if(this._umpScrubber && (this._scrubberFocused || this._scrubberHadFocus))
                {
                    // Send to scrubber
                    response = this._umpScrubber.handleControllerEvent("rightStart"); 
                }
                else
                {
                    // Implement "fast move"
                    this._tiltStartHandler("right");
                }
            }
            break;
        case "up":
            // Tilt Up
            // Check to see if the Ump is currently retracted.
            if (this._retracted || this._inRetractTransition)
            {
                // Un-retract the Ump. This will also result in restoring focus.
                //this.setRetracted(false);
                
                // Consumed
                response = "ignored";
            }
            else
            {
                // If there is a scrubber and is not focused...
                if(this._umpScrubber && (!this._scrubberFocused && !this._scrubberHadFocus))
                {                
                    if(!this._scrubberDisabled)
                    {
                        // Give scrubber focus
                        this._scrubberFocusHelper(true);
                        
                        response = "consumed";
                    }
                    else
                    {
                        // Ignore. Leave currently focused button.
                        response = "ignored";
                    }
                }
                else
                {
                    // Ump buttons have focus
                    response = "giveFocusUp";
                }
            }
            break;
        case "upStart":
            // Up Start
            break;
        case "down":
            // Tilt Down
            // Check to see if the Ump is currently retracted.
            if (this._retracted || this._inRetractTransition)
            {
                // Un-retract the Ump. This will also result in restoring focus.
                //this.setRetracted(false);
                
                // Consumed
                response = "ignored";
            }
            else
            {
                // If there is a scrubber and it has focus...
                if(this._umpScrubber && (this._scrubberFocused || this._scrubberHadFocus))
                {                
                    log.debug("   down - scrubber exists and has focus...");               
                    // Attempt to set focus on previously selected button  
                    this._buttonFocusHelper(this._buttonSelectIndex);
                    
                    // Consumed
                    response = "consumed";
                }
                else
                {
                    // Ump buttons have focus
                    response = "giveFocusDown";
                }
            }
            break;
        case "downStart":
            // Down Start
            break;
        default:
            // No action
            break;
    }

    /*
     * returns
     * - giveFocusLeft (control retains highlight unless it later gets lostFocus event)
     * - giveFocusRight
     * - giveFocusUp
     * - giveFocusDown
     * - consumed (always returned on select event, and if control adjusted highlight)
     * - ignored (returned only if control doesn't know about focus)
     */

    return(response);
};

/*Function that begins waiting for a "long tilt" timeout */
Ump3Ctrl.prototype._tiltStartHandler = function(direction)
{
    log.debug("Ump3Ctrl: _tiltStartHandler() ", direction);
    this._isTilted = true;
    
    // set a timeout, if the multicontroller is still tilted at the end, set the hold state
    // Check for previous timeout. Clear if found.
    if(this._tiltTimeoutId)
    {
        clearTimeout(this._tiltTimeoutId);
    }
    this._tiltTimeoutId = setTimeout(this._onLongTiltHandler.bind(this, direction), this._tiltTimeout);
};

/*Function that is called if a multicontroller "long tilt" occurs */
Ump3Ctrl.prototype._onLongTiltHandler = function(direction)
{
    log.debug("Ump3Ctrl: _onLongTiltHandler() ", direction);
    if(this._isTilted)
    {
        this._isFastTilting = true;
    }
    
    // Set currently selected button as previously selected button
    var prevBtnIndex = this._buttonSelectIndex;
    var shouldBeep = true;
    
    if(direction == "right")
    {
        // Check for next valid button index to the right...
        var nextValidIndex = this._getNextValidIndex("right");
        
        if((prevBtnIndex + 1) <= (this.properties.buttonCount - 1) && nextValidIndex != null)
        {
            // Found a valid index 
        }
        else
        {
            // There is no further to go. Do nothing.
            shouldBeep = false;
        }
    }
    else if(direction == "left")
    {
        // Check for next valid button index to the left...
        var nextValidIndex = this._getNextValidIndex("left");                
        if((prevBtnIndex - 1) >= 0 && nextValidIndex != null)
        {
            // Found a valid index
        }
        else
        {
            // There is no further to go. Do nothing.
            shouldBeep = false;
        }
    }
    
    if(shouldBeep)
    {
        // Fire "beep" only if fast-tilting is possible
        // NOTE: Fast tilt is only possible with Multicontroller
        this._beep("Long", "Multicontroller");
    }
    
    // Unlike longPress or holdStart, the event needs to be
    // fired repeatedly at 0.5sec intervals and is internal.    
    this._fastTiltHandler(direction);
};

/*Function that begins fast tilting */
Ump3Ctrl.prototype._fastTiltHandler = function(direction)
{
    log.debug("Ump3Ctrl: _fastTiltHandler() ", direction);
    if(this._isTilted)
    {
        // Go to next valid button
        // NOTE: In this case, the value of "response" is ignored.
        response = this._buttonMoveHelper(direction);
        
        if(this._tiltChangeId)
        {
            clearTimeout(this._tiltChangeId);
        }
        
        this._tiltChangeId = setTimeout(this._fastTiltHandler.bind(this, direction), this._tiltChangeInterval);
    }
};

Ump3Ctrl.prototype._buttonMoveHelper = function(direction)
{
    log.debug("Ump3Ctrl: _buttonMoveHelper() ", direction);
    
    var response = "consumed";

    if(direction == "right")
    {
        // Check for next valid button index to the right...
        var nextValidIndex = this._getNextValidIndex("right");
        
        if(nextValidIndex != null)
        {

            // Set focus
            this._buttonFocusHelper(nextValidIndex);
            response = "consumed";
        }
        else
        {
            // Ran out of buttons. Attempt to give focus right.
            response = "giveFocusRight";
        }
    }
    else if(direction == "left")
    {
        // Check for next valid button index to the left...
        var nextValidIndex = this._getNextValidIndex("left");                
        
        if(nextValidIndex != null)
        {   
            // Set focus
            this._buttonFocusHelper(nextValidIndex);        
            response = "consumed";
        }
        else
        {
            // Ran out of buttons. Attempt to giveFocusLeft
            response = "giveFocusLeft";
        }
    }
    else
    {
        log.warn("Ump3Ctrl: _buttonMoveHelper() only accepts \'left\' or \'right\' as a parameter.");
        response = "ignored";
    }
    
    return response;
};

Ump3Ctrl.prototype._scrubberFocusHelper = function(makeFocused, isTemporary)
{
    log.debug("Ump3Ctrl._scrubberFocusHelper() ", makeFocused, isTemporary);
    /*
     * isTemporary [optional]
     * We have some situations where we remove focus from every thing
     * (i.e. Ump retracted) but we need to remember what HAD focus. In
     * these cases, isTemporary should be set to true so that the
     * _scrubberHadFocus flag will be properly set.
     */
    
    if(!isTemporary)
    {
        isTemporary = false;
    }
        
    log.debug("   isTemporary: " + isTemporary);
    
    if(this._umpScrubber)
    {
        if(makeFocused === true)
        {
            // Make sure the scrubber is not disabled, buffering or hidden
            if(!this._scrubberDisabled && !this._scrubberIsBuffering && this._scrubberVisible)
            { 
                log.debug("   Setting scrubber focus to true...");
                // Set scrubber focused
                this._scrubberFocused = true;
                
                // Set focus history (used when restoring focus)
                this._scrubberHadFocus = true;
                
                // Give scrubber focus
                this._umpScrubber.handleControllerEvent("acceptFocusInit");
                
                // Remove any focused buttons
                var buttonIndex = -1;
                this._buttonFocusHelper(buttonIndex);
            }
            else
            {
                // Scrubber cannot accept focus currently
                log.debug("Scrubber cannot accept focus currently.");
                log.debug("   this._scrubberDisabled: " + this._scrubberDisabled);
                log.debug("   this._scrubberIsBuffering: " + this._scrubberIsBuffering);
            }            
        }
        else
        {
            // Set scrubber focused
            this._scrubberFocused = false;
            
            // Set focus history (used when restoring focus)
            if(isTemporary && this._scrubberHadFocus)
            {
                // Keep value of _scrubberHadFocus
                
                // Remove any focused buttons as focus will be
                // restored to the scrubber
                var buttonIndex = -1;  
                this._buttonFocusHelper(buttonIndex);
            }
            else
            {
                // The scrubber is permanently losing focus
                this._scrubberHadFocus = false;
            }
            
            // Remove scrubber focus
            this._umpScrubber.handleControllerEvent("lostFocus");
        }
    }
    else
    {
        log.warn("Ump3Ctrl: _scrubberFocusHelper() called with no scrubber instance.");
    }
    
    log.debug("   this._scrubberFocused: " + this._scrubberFocused);
    log.debug("   this._scrubberHadFocus: " + this._scrubberHadFocus);
};

Ump3Ctrl.prototype._minChangeHandler = function()
{
    log.debug("minChangeHandler() called...");
    
    if(this._umpScrubber && this._scrubberFocused)
    {
        // Scrubber now has focus. Don't display tooltip.
    }
    else
    {
        // Show Tooltip
        // NOTE: A Tooltip may already be visible for this button.
        // If so, the Tooltip routine will properly ignore.
        if (this._buttonSelectIndex != -1)
        {   
            var hashId = this._getButtonHashId(this._buttonSelectIndex);
            if (hashId != null)
            {
                this._showTooltip(hashId);
            }
        }
    }
};

/*
 *  _buttonFocusHelper takes a zero-based buttonIndex value.
 *  All other buttons will lose focus. The buttonIndex passed
 *  will be given focus. Tooltips are also managed.
 */
Ump3Ctrl.prototype._buttonFocusHelper = function(buttonIndex,ignoreDisabled)
{
    log.debug("Ump3Ctrl: _buttonFocusHelper() ", buttonIndex);
    log.debug("this._buttonSelectIndex: " + this._buttonSelectIndex);
    
    // Clear any previous timeout
    clearTimeout(this._minChangeTimerId);
    
    // Determine previously focused button, if any
    if(this._buttonSelectIndex >= 0)
    {
        // Store the current focus
        this._prevButtonIndex = this._buttonSelectIndex;
    }
    else
    {
        // There was no previous index value
        this._prevButtonIndex = -1;
    }
    
    // (Boolean) flag to keep track of whether or not an enabled
    // button was found. Initially assume this to be true.
    var foundValidIndex = true;        
    
    if(buttonIndex != -1)
    {
        if(this._umpScrubber)
        {
            // Remove any possible scrubber focus
            this._scrubberFocusHelper(false);
        }
        
        // Check for enabled/disabled
        // ignoreDisabled === true, Avoid shifting the focus on the button when disabled through selectCallback
        if(this._isValidIndex(buttonIndex) || ignoreDisabled === true)
        {            
            // Set global button index.
            // NOTE: This value may already be correctly set, but not always.
            this._buttonSelectIndex = buttonIndex;
            
            if (!this._retracted && !this._inRetractTransition)
            {
                // // Show focus highlight
                // NOTE: Button may already have focus. If so, the
                // ButtonCtrl will properly ignore.
                this["umpBtnCtrl_" + this._buttonSelectIndex].handleControllerEvent("acceptFocusInit");
                
                // Tooltip will wait for minChangeInterval before being rendered
            }
        }
        else
        {
            // This button cannot recieve focus either because it is disabled
            // or there are no more buttons in the direction being moved.
            
            // Start at the current position and look for the next valid
            // button to the right
            var nextValidIndex = this._getNextValidIndex("right");
            
            if((buttonIndex + 1) <= (this.properties.buttonCount - 1) && nextValidIndex != null)
            {                
                // Set focus   
                this._buttonFocusHelper(nextValidIndex);
            }
            else
            {
                /************************/
                /**** MPP 10/23/2013 ****/
                /************************/
                /* Infinite recursion problem when all buttons, including index 0, are disabled */
                /* Pegs CPU, prevents watchdog response, crashes Opera */
                
                // No valid index to the right
                //this.buttonFocusHelper(0);

                // MPP's fix: check for at least one valid index before recurring
                // Is at least one button enabled?
                var anyButtonEnabled = false;
                
                for (var btnIdx = 0; btnIdx < this.properties.buttonCount; btnIdx++)
                {
                    // NOTE: Replaced call to _isValidIndex with simply checking
                    // the ButtonCtrl's getter. Slightly less overhead.
                    if(this["umpBtnCtrl_" + btnIdx].isEnabled)
                    {
                        anyButtonEnabled = true;
                        break;
                    }
                }

                if (anyButtonEnabled)
                {                    
                    // Attempt defaulting to left-most button until an
                    // enabled button is found.
                    this._buttonSelectIndex = 0;
                    this._buttonFocusHelper(this._buttonSelectIndex);
                }
                else
                {
                    // There are no enabled buttons.
                    foundValidIndex = false;
                    
                    // There appear to be no valid (enabled) buttons currently. However,
                    // SOMETHING has to have focus regardless.
                    if(this._prevButtonIndex >= 0)
                    {
                        // Leave focus on previously focused button
                    }
                    else
                    {
                        // Nothing had focus AND no buttons are enabled.
                        // Default to focus on left-most button.
                        this._buttonSelectIndex = 0;
                        
                        if (!this._retracted && !this._inRetractTransition)
                        {
                            // Show focus highlight
                            this["umpBtnCtrl_" + this._buttonSelectIndex].handleControllerEvent("acceptFocusInit");
                        }
                    }
                    
                }
                /************************/
                /**** MPP 10/23/2013 ****/
                /************************/
            }
        }
    }
    else
    {
        // We are removing focus from all Ump buttons.
        // NOTE: When removing focus froma all buttons, we do NOT
        // want to clear the value of _buttonSelectIndex. It will
        // be needed to properly restore focus later.
        this["umpBtnCtrl_" + this._prevButtonIndex].handleControllerEvent("lostFocus");
        
        // We also do not want to remove focus from the scrubber as
        // this may be why all Ump buttons are losing focus.

        // Remove Tooltip
        this._removeTooltip(this._getButtonHashId(this._buttonSelectIndex));
    }
    
    // Check to see if a valid index was found and focus was moved.
    // If so, remove any existing tooltip from previously focused button.
    if(foundValidIndex && (this._buttonSelectIndex != this._prevButtonIndex))
    {
        // Deselect previous button
        if (this._prevButtonIndex != -1)
        {
            var btnResponse = this["umpBtnCtrl_" + this._prevButtonIndex].handleControllerEvent("lostFocus");

            // Remove Tooltip
            this._removeTooltip(this._getButtonHashId(this._prevButtonIndex));
        }
    }
    else
    {
        // Either there was no valid (enabled) button or the same button
        // ended up with focus as when this method was called.
        // Do nothing.
    }
    
    // Start timeout until next focus change can be made
    this._minChangeTimerId = setTimeout(this._minChangeHandler.bind(this), this._minChangeInterval);
};

Ump3Ctrl.prototype._removeFocus = function()
{
    log.debug("_removeFocus() called...");
    // Hide highlight on any/all buttons and Scrubber, if present
    this._umpHasFocus = false;
    
    log.debug("   this._umpScrubber: "+ this._umpScrubber);
    log.debug("   this._scrubberFocused: "+ this._scrubberFocused);
    log.debug("   this._scrubberHadFocus: "+ this._scrubberHadFocus);
    log.debug("   this._buttonSelectIndex: "+ this._buttonSelectIndex);
    
    if(this._umpScrubber && (this._scrubberFocused || this._scrubberHadFocus))
    {
        // When removing focus here, we do not want to permanently
        // remove the scrubber's focus if it had it
        this._scrubberFocusHelper(false, true);
    }
    else
    {
        if(this._umpScrubber)
        {
            // Although the scrubber doesn't have focus,
            // this will clear out historical state values
            this._scrubberFocusHelper(false);
        }
    }
    
    // Clear any/all Ump button focus
    var buttonIndex = -1;            
    // Set focus 
    this._buttonFocusHelper(buttonIndex);
};

Ump3Ctrl.prototype._restoreFocus = function()
{
    log.debug("Ump3Ctrl: _restoreFocus() called...");
    log.debug("   this._umpScrubber: "+ this._umpScrubber);
    log.debug("   this._scrubberFocused: "+ this._scrubberFocused);
    log.debug("   this._scrubberHadFocus: "+ this._scrubberHadFocus);
    log.debug("   this._buttonSelectIndex: "+ this._buttonSelectIndex);
    
    if(this._umpScrubber && this._scrubberHadFocus === true)
    {
        log.debug("      Scrubber exists and had focus.");
        // Scrubber exists and previously had focus. Set focus.
        this._scrubberFocusHelper(true);        
    }else{
        log.debug("      Set button focus.");
        // Restore focus to previously focused button
        this._buttonFocusHelper(this._buttonSelectIndex);
    }
};

/*
 * Called by a ButtonCtrl when that button is selected via touch or Multicontroller
 */
Ump3Ctrl.prototype._selectCallback = function(buttonRef, btnData, btnParams)
{
    log.debug("Ump3Ctrl: _selectCallback() ", buttonRef, btnData, btnParams);

    var umpParams = null;
    
    var hashId = btnData.hashId;
    
    // Check for disabled...
    // TODO: No longer need to check for disabled as a disabled 
    // button will never fire a selectCallback
    if(this.properties.buttonConfig[hashId].disabled != true)
    {        
        // Is this a multi-state button?
        if(this.properties.buttonConfig[hashId].stateArray && this.properties.buttonConfig[hashId].autoStateChange == true){
            // Toggle/iterate to next icon...
            var buttonImage = "";
            var buttonSuffix = "";
            
            // Check for presence of "disabled" property 
            if(this.properties["buttonConfig"][hashId].disabled != null)
            {
                if(this.properties["buttonConfig"][hashId].disabled)
                {
                    // Disabled
                    buttonSuffix = "_Ds";
                }
                else
                {
                    // Enabled
                    buttonSuffix = "_En";
                }
            }
            
            // What is the next state?
            for(var i=0;i<this.properties.buttonConfig[hashId].stateArray.length;i++)
            {
                if(this.properties.buttonConfig[hashId].stateArray[i].state == this.properties.buttonConfig[hashId].currentState)
                {
                    // Would the next array location be out-of-bounds?
                    if((i + 1) > (this.properties.buttonConfig[hashId].stateArray.length - 1))
                    {
                        // Out-of-bounds. Move back to beginning of stateArray
                        // Does a non-standard imagePath value exist for the
                        // currentlyActive state?
                        if(this.properties.buttonConfig[hashId].stateArray[0].imageBase)
                        {
                            // Determine iconPath
                            var iconPath = this._getIconPath(this.properties["buttonConfig"][hashId].stateArray[0].imageBase);
                            
                            // Concatenate imageBase and suffix (but not the state)
                            buttonImage = iconPath + this.properties["buttonConfig"][hashId].stateArray[0].imageBase + buttonSuffix + ".png";
                        }
                        else
                        {
                            // Standard naming conventions apply.
                            // Determine iconPath
                            var iconPath = this._getIconPath(this.properties["buttonConfig"][hashId].imageBase);
                            
                            // Concatenate imageBase and state
                            buttonImage = iconPath + this.properties.buttonConfig[hashId].imageBase + "_" + this.properties["buttonConfig"][hashId].stateArray[0].state + buttonSuffix + ".png"; 
                        }
                        
                        umpParams = {"state" : this.properties.buttonConfig[hashId].stateArray[0].state};
    
                        // Update currentState
                        this.properties.buttonConfig[hashId].currentState = this.properties.buttonConfig[hashId].stateArray[0].state;
                    }
                    else
                    {
                        // In-bounds. Use next state                
                        if(this.properties.buttonConfig[hashId].stateArray[i+1].imageBase)
                        {
                            // Determine iconPath
                            var iconPath = this._getIconPath(this.properties["buttonConfig"][hashId].stateArray[i+1].imageBase);
                            
                            // Concatenate imageBase and suffix (but not the state)
                            buttonImage = iconPath + this.properties["buttonConfig"][hashId].stateArray[i+1].imageBase + buttonSuffix + ".png";
                        }
                        else
                        {
                            // Standard naming conventions apply.
                            // Determine iconPath
                            var iconPath = this._getIconPath(this.properties["buttonConfig"][hashId].imageBase);
                            
                            // Concatenate imageBase and state
                            buttonImage = iconPath + this.properties.buttonConfig[hashId].imageBase + "_" + this.properties["buttonConfig"][hashId].stateArray[i+1].state + buttonSuffix + ".png"; 
                        }
    
                        umpParams = {"state" : this.properties.buttonConfig[hashId].stateArray[i+1].state};
    
                        // Update currentState
                        this.properties.buttonConfig[hashId].currentState = this.properties.buttonConfig[hashId].stateArray[i+1].state;
                    }
    
                    break;
                }
            }
    
            buttonRef.setIcon(buttonImage);
        }
        
        umpParams = {"state" : this.properties.buttonConfig[hashId].currentState};
        
        // Flag variable set to prevent the Application from setting the button state 
        if(this.properties.buttonConfig[hashId].autoStateChange == true)
        {
            this._inButtonCallback = true;
        }
        
        // If this button has a selectCallback, call it
        if(typeof(this.properties.buttonConfig[hashId].selectCallback) == 'function')
        {
            // NOTE: Beep is handled by ButtonCtrl
            this.properties.buttonConfig[hashId].selectCallback(this, btnData.originalAppData, umpParams);
        }
        else
        {
            // NOTE: Beep is handled by ButtonCtrl
            this.properties.defaultSelectCallback(this, btnData.originalAppData, umpParams);
        }
        
        // Resetting the flag variable
        this._inButtonCallback = false;
        
        // NOTE: Wait until any possible state change has completed 
        // to set focus. This guarantees a correct Tooltip value.
        
        // Set new buttonSelectIndex
        var buttonIndex = this.properties.buttonConfig[hashId].buttonIndex;
        // Set focus to show tooltips
        // Avoid shifting the focus on the button when disabled through selectCallback
        this._buttonFocusHelper(buttonIndex,true);
    }
    else
    {
        // This button is disabled. Ignore input.
    }
};

Ump3Ctrl.prototype._longPressCallback = function(buttonRef, btnData, btnParams)
{
    log.debug("Ump3Ctrl: _longPressCallback() ", buttonRef, btnData, btnParams);
    // NOTE: If the multicontroller highlight is elsewhere,
    // do we move it here on select? Assuming yes for now.
   
    var umpParams = null;

    var hashId = btnData.hashId;
    
    // Check for disabled...
    // TODO: May no longer need to check for disabled as the
    // ButtonCtrl will not issue a callback if disabled.
    if(this.properties.buttonConfig[hashId].disabled != true)
    {
        // Set new buttonSelectIndex
        var buttonIndex = this.properties.buttonConfig[hashId].buttonIndex;  
        // Set focus   
        this._buttonFocusHelper(buttonIndex);
    
        if(typeof(this.properties.buttonConfig[hashId].longPressCallback) == 'function')
        {
            // NOTE: Beep is handled by ButtonCtrl
            this.properties.buttonConfig[hashId].longPressCallback(this, btnData.originalAppData, umpParams);
        }
        else
        {
            // NOTE: Beep is handled by ButtonCtrl
            this.properties.defaultLongPressCallback(this, btnData.originalAppData, umpParams);
        }
    }
    else
    {
        // This button is disabled. Ignore input.
    }
};

Ump3Ctrl.prototype._holdStartCallback = function(buttonRef, btnData, btnParams)
{
    log.debug("Ump3Ctrl _holdStartCallback() called...", buttonRef, btnData, btnParams);

    // NOTE: If the multicontroller highlight is elsewhere,
    // do we move it here on select? Assuming yes for now. 
    
    var umpParams = null;

    var hashId = btnData.hashId;
    
    // Check for disabled...
    // TODO: We should no longer need to check for disabled as
    // ButtonCtrl will not fire hold start if disabled.
    if(this.properties.buttonConfig[hashId].disabled != true)
    {
        // Set new buttonSelectIndex
        var buttonIndex = this.properties.buttonConfig[hashId].buttonIndex;  
        // Set focus   
        this._buttonFocusHelper(buttonIndex);
    
        // Assume "hold" state
        // Toggle/iterate to next icon...
        var buttonImage = this._iconPath + this.properties.buttonConfig[hashId].imageBase + "_Hd" + ".png";
    
        buttonRef.setIcon(buttonImage);
        
        if(typeof(this.properties.buttonConfig[hashId].holdStartCallback) == 'function')
        {
            // NOTE: Beep is handled by ButtonCtrl
            this.properties.buttonConfig[hashId].holdStartCallback(this, btnData.originalAppData, umpParams);
        }
        else
        {
            // NOTE: Beep is handled by ButtonCtrl
            this.properties.defaultHoldStartCallback(this, btnData.originalAppData, umpParams);
        }
    }
    else
    {
        // This button is disabled. Ignore input.
    }
};

Ump3Ctrl.prototype._holdStopCallback = function(buttonRef, btnData, btnParams)
{
    log.debug("Ump3Ctrl _holdStopCallback() called...", buttonRef, btnData, btnParams); 
    
    var umpParams = null;

    var hashId = btnData.hashId;

    var buttonImage = "";
    var buttonSuffix = "";
    
    // Check for presence of "disabled" property 
    if(this.properties["buttonConfig"][hashId].disabled != null)
    {
        if(this.properties["buttonConfig"][hashId].disabled)
        {
            // Disabled
            buttonSuffix = "_Ds";
        }
        else
        {
            // Enabled
            buttonSuffix = "_En";
        }
    }

    // Return to previous state
    // Is this a multi-state button?
    if(this.properties.buttonConfig[hashId].stateArray){
        // Toggle/iterate to next icon...
        
        // What is the currentState?
        for(var i=0;i<this.properties.buttonConfig[hashId].stateArray.length;i++)
        {
            if(this.properties.buttonConfig[hashId].stateArray[i].state == this.properties.buttonConfig[hashId].currentState)
            {
                // Does a non-standard imagePath value exist for the
                // currentlyActive state?
                if(this.properties.buttonConfig[hashId].stateArray[i].imageBase)
                {                    
                    // Determine iconPath
                    var iconPath = this._getIconPath(this.properties["buttonConfig"][hashId].stateArray[i].imageBase);
                    
                    // Concatenate imageBase and suffix (but not the state)
                    buttonImage = iconPath + this.properties["buttonConfig"][hashId].stateArray[i].imageBase + buttonSuffix + ".png";
                }
                else
                {
                    // Standard naming conventions apply.
                    // Determine iconPath
                    var iconPath = this._getIconPath(this.properties["buttonConfig"][hashId].imageBase);
                    
                    // Concatenate imageBase and state
                    buttonImage = iconPath + this.properties.buttonConfig[hashId].imageBase + "_" + this.properties["buttonConfig"][hashId].stateArray[i].state + buttonSuffix + ".png"; 
                }
                
                umpParams = {"state" : this.properties.buttonConfig[hashId].stateArray[i].state};

                break;
            }
        }
    }
    else
    {
        // Single state button
        // Determine image path
        var iconPath = this._getIconPath(this.properties["buttonConfig"][hashId].imageBase);
        
        buttonImage = iconPath + this.properties.buttonConfig[hashId].imageBase + buttonSuffix + ".png";   
    }
    
    buttonRef.setIcon(buttonImage);
    
    if(typeof(this.properties.buttonConfig[hashId].holdStopCallback) == 'function')
    {
        this.properties.buttonConfig[hashId].holdStopCallback(this, btnData.originalAppData, umpParams);
    }
    else
    {
        this.properties.defaultHoldStopCallback(this, btnData.originalAppData, umpParams);
    }
};

/*
 * Called by the SliderCtrl when it gains focus for any reason
 */
Ump3Ctrl.prototype._scrubberFocusCallback = function(scrubberRef, scrubberData, scrubberParams)
{
    log.debug("Ump3Ctrl: _scrubberFocusCallback() called...", scrubberRef, scrubberData, scrubberParams);
    if (scrubberParams.focusStolen == true)
    {
        // If scrubber is receiving focus, we assume
        // that the Ump should have focus
        this._umpHasFocus = true;
        
        // Update focus variables
        this._scrubberFocusHelper(true);
    }
};

Ump3Ctrl.prototype._focusCallback = function(buttonRef, btnData, btnParams)
{
    log.debug("Ump3Ctrl: _focusCallback() ", buttonRef, btnData, btnParams);    
    
    var umpParams = null;
    
    var hashId = btnData.hashId;
    
    // If a button is receiving focus, we assume
    // that the Ump should have focus
    this._umpHasFocus = true;
    
    if (btnParams.focusStolen == true)
    {       
        // Set new button index
        var buttonIndex = this.properties.buttonConfig[hashId].buttonIndex;
        
        // Set focus   
        this._buttonFocusHelper(buttonIndex);
    }
    
    // If this button has a focusCallback, call it
    if(typeof(this.properties.buttonConfig[hashId].focusCallback) == 'function')
    {
        this.properties.buttonConfig[hashId].focusCallback(this, btnData.originalAppData, umpParams);
    }
    else
    {
        if(typeof(this.properties.defaultFocusCallback) == 'function')
        {
            this.properties.defaultFocusCallback(this, btnData.originalAppData, umpParams);
        }
    }
};

Ump3Ctrl.prototype.setRetracted = function(retracted)
{
    log.debug("Ump3Ctrl: setRetracted() ", retracted);
    
    if(retracted === true)
    {
        // Remove focus
        this._removeFocus();
    }
    else
    {
        // Restore focus
        this._restoreFocus();
    }
    
    this.transitionSlide(0, 500, retracted ? "down" : "up");
};

Ump3Ctrl.prototype._setRetracted = function(retracted)
{
    log.debug("Ump3Ctrl: _setRetracted() ", retracted);
    this._inRetractTransition = false;
    
    if(retracted == false)
    {
        // Restore focus
        this._restoreFocus();
    }
    else
    {
        // By the time we get here, focus has already been removed
    }
    
    this._retracted = retracted;
    
    if(this._retracted)
    {
        this.divElt.classList.remove("RetractedFalse");
        this.divElt.classList.add("RetractedTrue");
    }
    else
    {
        this.divElt.classList.remove("RetractedTrue");
        this.divElt.classList.add("RetractedFalse");
    }
};

/*
 * Slide the control up or down.
 * @param delay (Number) Time in ms before the transition starts.
 * @param duration (Number) Time in ms to animate the actual ump.
 * @param direction (String) A value "up" or "down".
 */ 
Ump3Ctrl.prototype.transitionSlide = function(delay, duration, direction)
{
    log.debug("transitionSlide " + delay + " " + duration + " " + direction);

    if (typeof delay === "number" && typeof duration === "number" && typeof direction === "string")
    {
        var retract = (direction === "down");
        if (this._retracted !== retract)
        {
            this._inRetractTransition = true;
    
            if (this.divElt.classList.contains("SlideDown") || this.divElt.classList.contains("SlideUp"))
            {
                log.debug("ending slide animation early");
                this._slideAnimationEnd();
                this.divElt.parentNode.appendChild(this.divElt);
            }

            this._retracted = retract;

            if (delay === 0 && duration === 0)
            {
                this._setRetracted(this._retracted);
            }
            else
            {
                if (this._retracted)
                {
                    this.divElt.classList.add("SlideDown");
                    this.divElt.style.animationDelay = delay.toString() + "ms";
                    this.divElt.style.animationDuration = duration.toString() + "ms";
                }
                else
                {
                    this.divElt.classList.add("SlideUp");
                    this.divElt.style.animationDelay = delay.toString() + "ms";
                    this.divElt.style.animationDuration = duration.toString() + "ms";
                }
            }
        }
    }
    else
    {
        log.error("Invalid parameters passed to Ump3Ctrl.transitionSlide.");
    }
};

Ump3Ctrl.prototype._slideAnimationEnd = function()
{
    log.debug("Ump3Ctrl: _slideAnimationEnd: ");
    if (this.divElt.classList.contains("SlideDown"))
    {
        this._setRetracted(true);    
    }
    else if (this.divElt.classList.contains("SlideUp"))
    {
        this._setRetracted(false);
    }

    this.divElt.classList.remove("SlideDown");
    this.divElt.classList.remove("SlideUp");
};

Ump3Ctrl.prototype.setTooltipsEnabled = function(tooltipsEnabled)
{
    log.warn("Ump3Ctrl: setTooltipsEnabled() was called and is a depricated API.");
};

/*
 * Slider-specific functions
 */
Ump3Ctrl.prototype.setScrubberDuration = function(duration)
{
    log.debug("Ump3Ctrl: setScrubberDuration() ", duration);
    if(this._umpScrubber)
    {
        // Take the duration that was passed and determine a new
        // increment value based on 5 sec intervals
        this._scrubberDuration = duration;
        
        // Determine how many 5sec increments exist
        var scrubIntervals = (this._scrubberDuration / 5000);
        
        var newMin = 0;                         // ms
        var newMax = this._scrubberDuration;    // ms
        
        // Derive new increment from min and max    
        var newIncrement = ((newMax - newMin) / scrubIntervals);
    
        this._umpScrubber.setMoveIncrement(newMin, newMax, newIncrement);
    }
    else
    {
        log.warn(this.uiaId + ": Ump3Ctrl received setScrubberDuration() with no Scrubber present.");
    }
};

Ump3Ctrl.prototype.updateScrubber = function(progress)
{
    log.debug("Ump3Ctrl: updateScrubber() ", progress);

    // Pass through to scrubber, if instantiated
    if(this._umpScrubber)
    {
        this._umpScrubber.setValue(progress);
    }
};

Ump3Ctrl.prototype.setElapsedTime = function(elapsedTime)
{
    log.debug("setElapsedTime() called: ", elapsedTime);
    if(this.properties.scrubberConfig.scrubberStyle != "Style03")
    {
        this._elapsedTime = elapsedTime;    
        this._elapsedTimeLabel.innerText = this._elapsedTime;
    }
    else
    {
        // Elapsed time only displayed for Style01 and Style02
        log.warn(this.uiaId + ": Ump3Ctrl setElapsedTime() not supported for scrubber Style03");
    }
};

Ump3Ctrl.prototype.setTotalTime = function(totalTime)
{
    log.debug("setTotalTime() called: ", totalTime);
    this._totalTime = totalTime;
    
    if(this.properties.scrubberConfig.scrubberStyle == "Style01")
    {
        this._totalTimeLabel.innerText = this._totalTime;
    }
    else
    {
        log.warn(this.uiaId + ": Ump3Ctrl setTotalTime() only supported for scrubber Style01");
    }
};

Ump3Ctrl.prototype.setBuffering = function(buffering)
{
    log.debug("Ump3Ctrl: setBuffering() ", buffering);
    this._scrubberIsBuffering = buffering;
    
    log.debug("   this._bufferingOnly: " + this._bufferingOnly);
    
    if(this._bufferingOnly || this._umpScrubber)
    {
        log.debug("   Set buffering visibility...");
        if(this._scrubberIsBuffering)
        {
            log.debug("      Showing buffering...");
            if(!this._bufferingOnly)
            {
                // Note: this._scrubberVisible is not updated as this is used to determine what happens when setBuffering(false) is called.
                this._umpScrubber.divElt.style.visibility = "hidden";
            }
            this.scrubberBuffer.style.visibility = "visible";
            
            if(this._umpScrubber && (this._scrubberFocused || this._scrubberHadFocus))
            {
                // Move focus down to Ump
                this.handleControllerEvent("down");
            }
        }
        else
        {
            log.debug("      Hiding buffering...");
            if(!this._bufferingOnly && this._scrubberVisible)
            {
                this._umpScrubber.divElt.style.visibility = "visible";
            }
            this.scrubberBuffer.style.visibility = "hidden";
        }
    }
    else
    {
        log.warn(this.uiaId + ": Ump3Ctrl Received setBuffering() with no active scrubber or buffering-only style.");
    }
};

Ump3Ctrl.prototype.setScrubberDisabled = function(disabled)
{
    log.debug("Ump3Ctrl: setScrubberDisabled() ", disabled);
    
    this._scrubberDisabled = disabled;
    
    if(this._umpScrubber)
    {
        log.debug("   setting scrubber to disabled...");
        this._umpScrubber.setDisabled(this._scrubberDisabled);
        
        log.debug("   this._scrubberFocused: " + this._scrubberFocused);
        log.debug("   this._scrubberHadFocus: " + this._scrubberHadFocus);
        
        if(this._scrubberFocused || this._scrubberHadFocus)
        {
            // Attempt re-focusing previously focused Ump button
            this._buttonFocusHelper(this._buttonSelectIndex);
        }
    }
    else
    {
        log.warn("Ump3Ctrl: Received setScrubberDisabled() with no active scrubber.");
    }
};

/*
 * Release the Scrubber and set the slider to new index
 * @param index (Number) New index value. This must be an appropriate value along the slider's increment scale.
 */
Ump3Ctrl.prototype.releaseScrubber = function(index)
{
    log.debug("Ump3Ctrl: releaseScrubber() ", index);
    this._umpScrubber.scrubberRelease(index);
};

Ump3Ctrl.prototype._showTooltip = function(hashId)
{
    if (hashId == null)
    {
        log.error("_showTooltip called with undefined hashId. Cannot show tooltip.");
        return;
    }
    log.debug("Ump3Ctrl: _showTooltip() ", hashId);
    // Check to see if a tooltip with this hashId already exists. 
    // If so, remove before re-creating.
    // NOTE: Each button has a single hashId, even if it has 
    // multiple states. 
    
    // NOTE: If tooltips are not currently enabled OR the Ump
    // is in a retract transition, do not show tooltip.
    log.debug("   this._tooltipsEnabled: " + this._tooltipsEnabled);
    log.debug("   this._inRetractTransition: " + this._inRetractTransition);
    
    if(this._tooltipsEnabled && !this._inRetractTransition && !this._retracted){
    
        var needNewTooltip = true;
        // Check if Tooltip already exists for this button
        for(var i=0;i<this._tooltipArray.length;i++)
        {
            if (this._tooltipArray[i].getHashId() == hashId)
            {
                log.debug("   Tooltip exists for this button...");
                // Check for multi-state button
                if(this.properties.buttonConfig[hashId].stateArray != null && this.properties.buttonConfig[hashId].autoStateChange == true)
                {
                    log.debug("      ...multi-state button. Ump is changing button state so change Tooltip.");
                    // Multi-state button. Replace any existing Tooltip with next state.
                    // NOTE: Because button focus is not changing, we must 
                    // explicitly call _removeTooltip().
                    needNewTooltip = true;
                    this._removeTooltip(hashId);
                }
                else
                {
                    log.debug("      ...single-state /Multi State button where button state is not changed. Ignore."); 
                    needNewTooltip = false;
                }
                break;
            }
        }
        
        log.debug("   needNewTooltip: " + needNewTooltip);
        
        if (needNewTooltip)
        {
            // Determine and localize Tooltip label
            var tooltipLabel;
            var stringId;
                
            // Check for multi-state button
            if(this.properties.buttonConfig[hashId].stateArray != null)
            {
                // This is a multi-state button
                var hasCustomLabel = false;
                
                // Check for individual state labelId's
                for(var i=0;i<this.properties.buttonConfig[hashId].stateArray.length;i++)
                {
                    if(this.properties.buttonConfig[hashId].stateArray[i].state == this.properties.buttonConfig[hashId].currentState)
                    {
                        // Check for labelId
                        if (this.properties.buttonConfig[hashId].stateArray[i].labelId != null)
                        {
                            // Test for existence of stringId
    		                var stringIdExists = framework.localize.testLocStr(this.uiaId, this.properties.buttonConfig[hashId].stateArray[i].labelId);
                            
                            if (stringIdExists === true)
                            {
                                // Found labelId. Attempt to localize
                                tooltipLabel = framework.localize.getLocStr(this.uiaId, this.properties.buttonConfig[hashId].stateArray[i].labelId, null);
                            }
                            else
                            {
                                // No label or dictionary entry was found
                                tooltipLabel = null;
                            }
                            
                            hasCustomLabel = true;
                            
                            break;
                        }
                        else if (this.properties.buttonConfig[hashId].stateArray[i].label != null)
                        {
                            tooltipLabel = this.properties.buttonConfig[hashId].stateArray[i].label;
                            hasCustomLabel = true;
                        }
                    }
                }
                
                // If no labelId was found, use concatenation method
                if (!hasCustomLabel)
                {
                    // What is the current state?
                    stringId = "Tooltip_" + this.properties.buttonConfig[hashId].imageBase + "_" + this.properties.buttonConfig[hashId].currentState;
                    
                    // Test for existence of stringId
                    var stringIdExists = framework.localize.testLocStr("common", stringId);
                    
                    if (stringIdExists === true)
                    {
                        // Localize from Common
                        tooltipLabel = framework.localize.getLocStr("common", stringId, null);
                    }
                    else
                    {
                        // No label or dictionary entry was found
                        tooltipLabel = null;
                    }
                }
            }
            else
            {
                // This is not a multi-state button
                // Check for possible custom label 
                if (this.properties.buttonConfig[hashId].labelId != null)
                {
                    // Test for existence of stringId
    		        var stringIdExists = framework.localize.testLocStr(this.uiaId, this.properties.buttonConfig[hashId].labelId);
                    
                    if (stringIdExists === true)
                    {
                    	// A labelId was specified. Attempt to localize.
                    	tooltipLabel = framework.localize.getLocStr(this.uiaId, this.properties.buttonConfig[hashId].labelId, null);
                    }
                    else
                    {
                        // No label or dictionary entry was found
                        tooltipLabel = null;
                    }
                }
                else if (this.properties.buttonConfig[hashId].label != null)
                {
                    tooltipLabel = this.properties.buttonConfig[hashId].label;
                }
                else
                {
                    stringId = "Tooltip_" + this.properties.buttonConfig[hashId].imageBase;
                    
                    // Test for existence of stringId
                    var stringIdExists = framework.localize.testLocStr("common", stringId);
                    
                    if (stringIdExists == true)
                    {
                    	// Localize from Common
                    	tooltipLabel = framework.localize.getLocStr("common", stringId, null);
                    }
                    else
                    {
                        // No label or dictionary entry was found
                        tooltipLabel = null;
                    }
                }
            }
            
            if (tooltipLabel != null)
            {
                // Get reference to parent button
                var buttonIndex = this.properties.buttonConfig[hashId].buttonIndex;
                
                //@formatter:off
                var tooltipConfig = {
                    "tooltipIndex" : this._tooltipIndex,
                    "buttonIndex" : buttonIndex,
                    "hashId" : hashId,
                    "label" : tooltipLabel,
                    "buttonWidth" : this._buttonWidth
                };
                //@formatter:on
                
                // Instantiate Tooltip
                var tooltip = new Ump3Tooltip(this.uiaId, this.divElt, "Ump3CtrlTooltip" + this._tooltipIndex, tooltipConfig);
                
                // Add Tooltip reference to array
                this._tooltipArray.push(tooltip);
                
                // this._tooltipIndex++;
                
                this._tooltipIndex = (this._tooltipIndex + 1) % this._MAX_ID_NUM; // Note: this will return the ID to 1 if it reaches the Max
                
                // Start timeout
                this._startTooltipTimeout(hashId);
            }
        }
        else
        {
            // This button is already displaying tooltip. Allow to timeout.
        }
    }
    else
    {
        // Tooltips are disabled.
    }
};

Ump3Ctrl.prototype._startTooltipTimeout = function(hashId)
{    
    log.debug("Ump3Ctrl: _startTooltipTimeout() ", hashId);
    // Start new timeout interval
    var thisTimeout = this._removeTooltip.bind(this, hashId);
    var timeoutInterval = setTimeout(thisTimeout, this._tooltipTimeout);
    
    for(var i=0;i<this._tooltipArray.length;i++)
    {
        if(this._tooltipArray[i].getHashId() == hashId)
        {
            this._tooltipArray[i].timeoutInterval = timeoutInterval;
            break;
        }
    }
};

Ump3Ctrl.prototype._removeTooltip = function(hashId)
{
    log.debug("Ump3: _removeTooltip() ", hashId);
    // Iterate through array and find tooltip reference
    
    for(var i=0;i<this._tooltipArray.length;i++)
    {
        if(this._tooltipArray[i].getHashId() == hashId)
        {
            log.debug("   removing Tooltip for " + hashId);
            // Clear interval
            clearTimeout(this._tooltipArray[i].timeoutInterval);

            // Fade out Tooltip
            this._tooltipArray[i].divElt.style.opacity = 0;
            
            // Remove Tooltip
            utility.removeHTMLElement(this._tooltipArray[i].divElt.id);
            this._tooltipArray[i] = null;
            
            // Remove reference from array
            this._tooltipArray.splice(i,1);
            break;
        }
    }
};

Ump3Ctrl.prototype._cleanUpButtons = function()
{
    log.debug("Ump3Ctrl: _cleanUpButtons() called...");
    // Cleanup/remove any previous configuration
    var buttonIndex = 0;
    for(var i in this.properties.buttonConfig)
    {        
        // Remove ButtonCtrl
        // NOTE: destroyControl() will call the control' cleanUp() method
        framework.destroyControl(this["umpBtnCtrl_" + buttonIndex]);
        
        // Check for and remove separator
        if (buttonIndex != 0 && buttonIndex != this.properties.buttonCount)
        {
            this.divElt.removeChild(this["umpBtnCtrlSeparator_" + buttonIndex]);
        }

        buttonIndex++;
    }
};

Ump3Ctrl.prototype.finishPartialActivity = function()
{
    log.debug("Ump3Ctrl: finishPartialActivity() called...");
    // If the Ump has focus at all...
    // Is the scrubber or a button focused?
    if(this._umpHasFocus)
    {
        if(this._umpScrubber && this._scrubberFocused)
        {
            // Scrubber has focus. Finish partial activity.
            this._umpScrubber.finishPartialActivity();
        }
        else
        {
            if(this._buttonSelectIndex >= 0)
            {
                // A button has focus. Finish partial activity.
                this["umpBtnCtrl_" + this._buttonSelectIndex].finishPartialActivity();
            }
        }
    }
    else
    {
        // Some other control outside of Ump has focus
        log.debug("   Ump does not have focus. No partial activity to finish.");
    }
};

Ump3Ctrl.prototype.getContextCapture = function()
{
    log.debug("Ump3Ctrl: getContextCapture() called...");
    // Return controlContextCapture
    //@formatter:off
    var controlContextCapture = {
        "umpHasFocus" : this._umpHasFocus,
        "scrubberFocused" : this._scrubberFocused,
        "scrubberHadFocus" : this._scrubberHadFocus,
        "buttonIndex" : this._buttonSelectIndex
    };
    //@formatter:on
    
    log.debug("   controlContextCapture.umpHasFocus: " + controlContextCapture.umpHasFocus);
    log.debug("   controlContextCapture.scrubberFocused: " + controlContextCapture.scrubberFocused);
    log.debug("   controlContextCapture.scrubberHadFocus: " + controlContextCapture.scrubberHadFocus);
    log.debug("   controlContextCapture.buttonIndex: " + controlContextCapture.buttonIndex);
    
    return controlContextCapture;
};

Ump3Ctrl.prototype.restoreContext = function(controlContextCapture)
{
    log.debug("Ump3Ctrl: restoreContext() ", controlContextCapture);
    // TODO: Once transitions notifications exist, focus should
    // wait to be set until notification is received.
    
    // Set Ump focus
    this._umpHasFocus = controlContextCapture.umpHasFocus;    
    this._scrubberFocused = controlContextCapture.scrubberFocused;
    this._scrubberHadFocus = controlContextCapture.scrubberHadFocus;
    // this._buttonSelectIndex = controlContextCapture.buttonIndex;
    
    var buttonIndex = controlContextCapture.buttonIndex;
    
    log.debug("   this._umpHasFocus: " + this._umpHasFocus);
    log.debug("   this._scrubberFocused: " + this._scrubberFocused);
    log.debug("   this._scrubberHadFocus: " + this._scrubberHadFocus);
    log.debug("   buttonIndex: " + buttonIndex);
    
    // Restore controlContextCapture
    // If the Ump has focus, restore focus highlight.
    if(this._umpHasFocus === true)
    {
        log.debug("      Ump has focus...determine which child to highlight...");
        // Ump has focus. Determine what to highlight...
        if(this._umpScrubber && (this._scrubberFocused === true ||  this._scrubberHadFocus === true))
        {
            log.debug("      ...Ump scrubber had focus.");
            // Scrubber exists and previously had focus. Set focus.
            this._scrubberFocusHelper(true);
        }
        else
        {
            // Scrubber was not focused or does not exist. Set button focus.    
            log.debug("      ...Srubber was not focused. Determine button focus...");
            if(buttonIndex >= 0)
            {
                log.debug("      ...button index exists...");
                // Restore button focus/highlight
                if(this["umpBtnCtrl_" + buttonIndex])
                {
                    log.debug("      ...button has been instantiated...");
                    if(!this["umpBtnCtrl_" + buttonIndex].isEnabled)
                    {
                        log.debug("      ...button is disabled. Use default select process.");
                        // Button is instantiated but is disabled.
                        // Set default focus.
                        buttonIndex = 0;
                        this._buttonFocusHelper(buttonIndex);
                    }
                    else
                    {
                        log.debug("      ...set button focus.");
                        // Set button focus
                        this._buttonFocusHelper(buttonIndex);
                    }
                }
                else
                {
                    log.debug("Button has not been instantiated yet.");
                    // Button has not been instantiated yet. Ignore.
                    // NOTE: This case should only happen if the Ump config
                    // has changed
                }
            }
        }
    }
};

/**
 * (private) Cause an audible beep to be played
 * @param (String) Indicates a short press or a long press. Valid values are “Short” and “Long”.
 * @param (String) Indicates the user interaction that caused the beep. Valid values are “Touch”, “Multicontroller”, and “Hardkey”.
 */
Ump3Ctrl.prototype._beep = function(pressType, eventCause)
{
    log.debug("Ump3Ctrl: _beep() ", pressType, eventCause);
    // check for beep API
    if (framework.common.beep && eventCause != null)
    {
        // call beep
        framework.common.beep(pressType, eventCause);
    }
};

Ump3Ctrl.prototype.cleanUp = function()
{
    log.debug("Ump3Ctrl: cleanUp() called...");
    // Cleanup/remove any previous configuration
    clearTimeout(this._tiltChangeId);
    clearTimeout(this._tiltTimeoutId);
    clearTimeout(this._minChangeTimerId);
    
    var buttonIndex = 0;
    for(var i in this.properties.buttonConfig)
    {        
        // Call buttons' cleanUp() method
        this["umpBtnCtrl_" + buttonIndex].cleanUp();

        buttonIndex++;
    }

    if(this._umpScrubber)
    {
        this._umpScrubber.cleanUp();
    }

    this.divElt.removeEventListener("animationend", this._slideAnimationEndBinder);
};

function Ump3Tooltip(uiaId, parentDiv, controlId, properties)
{
    log.debug("Ump3Tooltip() constructor called...");
    
    this.uiaId = uiaId;                         // 
    this.controlId = controlId;                 //
    this.parentDiv = parentDiv;                 //
    this.properties = properties;               //
    
    this._pointWidth = 36;                      // Pixel width of the "point" below the Tooltip balloon
    this._leftBackgroundWidth = 49;             // Pixel width of the left background graphic
    this._rightBackgroundWidth = 99;            // Pixel width of the right background graphic
    
    //@formatter:off
    this.properties = {
        "tooltipIndex" : null,
        "buttonIndex" : null,
        "hashId" : null,
        "label" : null,
        "buttonWidth" : null
    };
    //@formatter:on
    
    for(var i in properties)
    {
        this.properties[i] = properties[i];
    }
    
    this._createStructure();
}

Ump3Tooltip.prototype.getHashId = function()
{
    log.debug("Ump3Tooltip: getHashId() called...");
    return this.properties.hashId;
};

Ump3Tooltip.prototype._init = function()
{
    // Fade in Tooltip
    this.divElt.style.opacity = 1;
};

Ump3Tooltip.prototype._createStructure = function()
{    
    log.debug("Ump3Tooltip: _creatStructure() called...");
    // Build tooltip
    this.divElt = document.createElement('div');
        this.divElt.className = "Ump3CtrlTooltip";
        this.divElt.id = this.controlId;
        
    this.tooltipBalloon = document.createElement('div');
        this.tooltipBalloon.className = "Ump3CtrlTooltipBalloon";
        this.divElt.appendChild(this.tooltipBalloon);
    
    this.tooltipPoint = document.createElement('div');
        this.tooltipPoint.className = "Ump3CtrlTooltipPoint";
        this.divElt.appendChild(this.tooltipPoint);
    
    // Set the label text
    this.tooltipBalloon.innerText = this.properties.label;
    
    this.parentDiv.appendChild(this.divElt);
    
    // Get the width of the Tooltip with text and padding
    var tooltipWidth = this.divElt.offsetWidth;
    
    // Check for out-of-bounds
    if(tooltipWidth > 800)
    {
        // TODO: Constrain and truncate with ellipsis
        // NOTE: Current CSS DIV structure won't work with
        // ellipsis.
    }
    
    // Calculate width of middle background image
    var middleWidth = (tooltipWidth - (this._leftBackgroundWidth + this._rightBackgroundWidth));
    
    // Set middle background size
    // NOTE: Because there are multiple backgrounds, all must be set together
    this.tooltipBalloon.style.backgroundSize = "49px 86px, 99px 86px, " + middleWidth + "px 86px";
    
    // Conditionally position Tooltip balloon
    // Use the button's index and buttonWidth to determine where the button's left edge is
    var buttonX = this.properties.buttonIndex * this.properties.buttonWidth;
    // Calculate the button's center
    var buttonCenter = ((this.properties.buttonWidth / 2) + buttonX);
    
    var tooltipOffset = 0;
    
    // Attempt to center Tooltip over parent button
    if((buttonCenter - (tooltipWidth / 2)) < 0)
    {
        // Tooltip would run off left side of the screen
        tooltipOffset = 0;
    }
    else if(((buttonCenter - (tooltipWidth / 2)) + tooltipWidth) > 800)
    {
        // Tooltip would run off right side of screen
        tooltipOffset = (800 - tooltipWidth);
    }
    else
    {
        // Tooltip can be centered over button
        tooltipOffset = (buttonCenter - (tooltipWidth / 2));
    }
    
    this.divElt.style.left = tooltipOffset + "px";
    
    // Position balloon point centered over parent button
    // Calculate tooltip point position
    var pointX = ((buttonCenter - (this._pointWidth / 2)) - tooltipOffset);
    
    this.tooltipPoint.style.left = pointX + "px";

    this._init();
};

framework.registerCtrlLoaded("Ump3Ctrl");
