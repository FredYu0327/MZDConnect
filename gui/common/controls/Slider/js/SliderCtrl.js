/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: SliderCtrl.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: ahanisk, agohsmbr
 Date: 12.5.2012
 __________________________________________________________________________

 Description: IHU GUI Slider Control

 Revisions:
 v0.1 (5-Dec-2012) Created Slider Control
 v0.2 (9-Mar-2013) Updates to reflect changes in both UI Spec and designs
    - Added setDisabled() method
    - Added isDisabled property
    - Added handling/logic for disabled state
    - Added "progress" style type
    - Fixed floating point modulus error
v0.3 (24-Mar-2013)
    - Added method to allow for setting of new min, max and increment values
    - Added _externallySet variable to prevent firing selectCallback when
      setValue() is called by the parent app
    - Implemented fast scrubbing
v0.4 (04-Jun-2013)
    - Modified/replaced properties related to tick marks, numbering and labels
    - Added a _createStructure() method for consistency with other controls
    - Added routine to handle the display of tick marks
    - Added routine to handle the display of numbers above tick marks
    - Added additional handling for center marks
    - Added routine to handle left/right labels
    - Added routine to handle the display of +/- graphics
v0.5 (07.18.2013)
    - Added _rotationSettleTimerId to keep track of rotationIdleDetectTime timeouts
    - Incorporated _wasMulticontroller in order to keep track of what even type initiated a callback. _selectMode is often null by the time we need to know.
    - Added rotationIdleDetectTime property with a default of zero
    - Added check for hasActiveState with a log.warn() line about its depriation
    - Removed line that set _hasFocus based on the value of hasActiveState.
    - Modified the _setValue() routine in order to guarantee that when a multicontroller rotationIdleDetectTime timed out, a callback would be called to ensure that a finalAdjustment of true gets sent (see comments)
    - Modified the conditional in the _moveHandle() method such that, even if the new index matches what is already in this.properties.value, if the event was generated via multicontroller, a callback is still initiated. This ensures that a finalAdjustment of true will get sent for multicontroller (see comments)
    - Moved the clearTimeout() for settle time to the top of the _onDownHanlder() so that it fires prior to any other methods.
    - In the _onUpHandler(), moved the line that sets _selectMode to null above the call to _onUpHelper() as this was causing an error.
    - Moved the clearTimeout() for change interval to the top of the _onUpHelper() method so that it would fire prior to any other methods.
    - Added clearTimeout() for change interval to the _settleHandler() method to prevent it from firing in addition to the settle callback.
    - Modified the _slideCallback() method to follow the rules set forth by Karl.
    - Added clearInterval() for rotation settle to the _moveOneIncrement() method.
    - Added _settled = false to _moveOneIncrement() as it is triggered by a cw/ccw
    - Replaced settle timeout in _moveOneIncrement() with rotation settle timeout as it may have a different time value than settle time as per Karl.
 __________________________________________________________________________

 */
log.addSrcFile("SliderCtrl.js", "common");

function SliderCtrl(uiaId, parentDiv, controlId, properties)
{
    log.debug("SliderCtrl: Constructor called...");
    /*This is the constructor of the SliderCtrl Component
     Create, set dimensions and assign default name*/

    this.uiaId = uiaId;                 // (String) UiaId of the Application that instantiated the Slider's parent Control
    this.controlId = controlId;         // (String) Unique ID assigned to this Control instance by GUI Framework
    this.parentDiv = parentDiv;         // (HTMLElement) Parent DIV element as assinged by the parent Control
    this.divElt = null;                 // (HTMLElement) Top-level DIV element of this Control

    this._currSliderIndex = 0;          // (Number) Current index value of the slider (ONLY SET IN _moveHandler())
    this._isBeingUsed = false;          // (Boolean) true if slider is in a held state (hold/longpress without release)
    this._hasFocus = false;             // (Boolean) true if this button has multicontroller focus (NOT the same as multicontroller highlight)
    this._handlePos = null;             // (Number) The current position of the scrubber relative to the left edge for both a slider, and a pivot
    this._leftOffset = 0;               // (Number) The left position of the slider div within the document
    this._minChangeTimerId;             // (Number) ID to clear the change timeout with
    this._settleTimerId;                // (Number) ID to clear the settle timeout with
    this._rotationSettleTimerId;        // (Number) ID to clear the rotation settle timeout with. Used for rotation and tilt left/right

    this._canSend = true;               // (Boolean) if true, control will call slideCallback as soon as an increment is crossed
    this._previouslySent = 0;           // (Number) The last value sent back to the app. Used to prevent callbacks for the an unchanged slider value (ONLY SET IN _slideCallback())
    this._settled = true;               // (Boolean) if false, the slider is no longer being used, but the settleTimer is running
    this._valueFromApp = null;          // (Number) Set to a number when the app calls setValue(), reset to null when set to app's value
    this._isDisabled = false;           // (Boolean) If set to true, the slider is disabled for user input (touch/multicontroller)

    this._holdTimeout = 1500;           // (Number) Hold/Long press timeout in ms - 1.5 sec
    this._holdTimeoutId = 0;            // (Number) ID to clear the timeout with
    this._isTilted = false;             // (Boolean) true if the multicontroller is currently tilted left/right.
    this._scrubChangeInterval = 1000;   // (Number) Fast scrubbing change interval in ms
    this._increment = null;             // (Number) Increment for the slider. Never changes except when set via public API.
    this._tiltHoldIncrement = null;     // (Number) Increment that increases the longer the user holds
    this._moveMin = null;               // (Number) Minimum value for the slider
    this._moveMax = null;               // (Number) Maximum value for the slider
    this._isFastScrubbing = false;      // (Boolean) Keeps track of when fast scrubbing is in-progress.
    this._numFastIntervals = 0;         // (Number) Used to keep track of the number of _scrubChangeIntervals that elapse
    this._selectMode = null;            // (String) Flag used to capture select related input from touch or controller in pairs instead of half controller or half touch.

    //@formatter:off
    this.properties = {
        "style": "slider",              // (String) "pivot", "slider", "progress"
        "canStealFocus": false,         // (Boolean) true if the slider can steal focus from other Controls in the DOM
        "onFocusCallback": null,        // (Function) callback for when the slider receives focus for any reason
        "slideCallback" : null,         // (Function) callback for when a changeIntervalTimeout occurs, or when the scrubber is released
        "holdStartCallback" : null,     // (Function) callback for when a holdStart begins NOTE: Not currently used
        "holdStopCallback" : null,      // (Function) callback for when a holdStop begins NOTE: Not currently used
        "minChangeInterval": 250,       // (Number) Number of milliseconds between slide callbacks
        "settleTime": 1000,             // (Number) Number of milliseconds before the slider will update to its last cached value, once the user stops interacting
        "rotationIdleDetectTime" : 500, // (Number) Number of milliseconds before multicontroller rotation is considered "idle"
        "min": 0,                       // (Number) Minimum value for the slider
        "max": 1,                       // (Number) Maximum value for the slider
        "increment": 0.1,               // (Number) Interval for the slider
        "scrubChangeInterval" : null,   // (Number) Fast scrubbing change interval in ms
        "disabled" : false,             // (Boolean) If true, the slider will use any disabled CSS classes and will no longer be interactable
        "showTickMarks" : false,        // (Boolean) If true, a tickMarkObject must be present containing tick mark properties/styles
        "showLabels" : false,           // (Boolean) If true, a labelObject must be present containing label properties/styles
        "showPlusMinus" : false,        // (Boolean) If true, a plusMinusObject must be present containing properties/styles
        "tickMarkObject" : null,        // (Object) Contains properties and styles for the display of tick marks
        "labelObject" : null,           // (Object) Contains properties and styles for the display of labels
        "plusMinusObject" : null,       // (Object) Contains properties and styles for the display of plus and minus graphics
        "width": 590,                   // (Number) Width (in pixels) of the slidable area (use CSS classes for graphic width)
        "handleWidth": 57,              // (Number) Width (in pixels) of the handles div element
        "value": 0,                     // (Number) Initial value of slider
        "canJump" : true,
        "appData" : null,               // (Object) Any data the app needs assigned to this slider. It will be passed back untouched on callback
        "useDebugClasses" : false,
        "wrapperClass": null,           // (CSS Class) CSS Class passed in to define the appearance of the slider wrapper
        "fillClass": null,              // (CSS Class) CSS Class passed in to define the appearance of the fill
        "handleClass": null,            // (CSS Class) CSS Class passed in to define the appearance of the handle
        "focusedWrapperClass": "SliderCtrlFocusedWrapper",    // (CSS Class) Optional CSS Class to define the appearance of the slider wrapper when the slider has MC focus
        "focusedFillClass": "SliderCtrlFocusedFill",          // (CSS Class) Optional CSS Class to define the appearance of the fill when the slider has MC focus
        "focusedHandleClass": "SliderCtrlFocusedHandle",      // (CSS Class) Optional CSS Class to define the appearance of the handle when the slider has MC focus
        "disabledWrapperClass" : "SliderCtrlDisabledWrapper", // (CSS Class) Optional CSS class to define the appearance of the wrapper when the slider is disabled
        "disabledFillClass" : "SliderCtrlDisabledFill",       // (CSS Class) Optional CSS class to define the appearance of the fill when the slider is disabled
        "disabledHandleClass" : "SliderCtrlDisabledHandle"    // (CSS Class) Optional CSS class to define the appearance of the handle when the slider is disabled
    };
    //@formatter:on

    for (var i in properties)
    {
        if (properties[i] !== undefined)
        {
            this.properties[i] = properties[i];
        }
    }

    // Check for deprecated hasActiveState
    if (this.properties.hasActiveState != null)
    {
        log.warn(this.uiaId + " SliderCtrl: hasActiveState has been deprecated. No longer used.");
    }

    // Check for null rotationIdleDetectTime. Default to zero.
    if (this.properties.rotationIdleDetectTime == null)
    {
        log.warn("rotationIdleDetectTime was null. Setting to default of 0. Unusual behavior may be seen.");
        this.properties.rotationIdleDetectTime = 0;
    }

    if (this.properties.minChangeInterval > this.properties.settleTime)
    {
        log.error(this.uiaId + ": Slider property 'minChangeInterval' should be less than the 'settletime' property!!");
    }
    if (this.properties.rotationIdleDetectTime > 0 && this.properties.minChangeInterval > this.properties.rotationIdleDetectTime)
    {
        log.warn(this.uiaId + ": Slider property 'minChangeInterval' should be less than the 'rotationIdleDetectTime' property!!");
    }
    if (this.properties.rotationIdleDetectTime > this.properties.settleTime)
    {
        log.error(this.uiaId + ": Slider property 'rotationIdleDetectTime' should be less than the 'settletime' property!!");
    }


    if (this.properties.useDebugClasses)
    {
        this._applyDebugClasses();
    }

    this.canStealFocus = this.properties.canStealFocus;

    this._createStructure();
}

SliderCtrl.prototype._createStructure = function()
{
    //wrapper div
    this.divElt = document.createElement('div');
        this.divElt.id = this.controlId;
        this.divElt.className = this.properties.wrapperClass;

    //scrubber bar
    this.fill = document.createElement('div');
        this.fill.className = this.properties.fillClass;
        // force slider fill not to be cetered
        this.fill.classList.add("SliderCtrlFillNoCenter");
        this.divElt.appendChild(this.fill);

    //----------------------------------------------------
    // NOTE: Any tick marks, or other additional elements,
    // must be rendered prior to a handle in order
    // to prevent them showing up on top of it
    //----------------------------------------------------

    // Check for and generate tick marks
    if (this.properties.showTickMarks === true)
    {
        // Check for tickMarkObject
        if (this.properties.tickMarkObject != null)
        {
            // Initialize tick marks
            var tickNum = 0;

            var centerMarksVisible = this.properties.tickMarkObject.showCenterMark;

            // Check for and generate center mark(s)
            if (centerMarksVisible === true)
            {
                this._centerMarkTop = document.createElement('div');
                    this._centerMarkTop.className = this.properties.tickMarkObject.centerMarkTopStyle;
                    this.divElt.appendChild(this._centerMarkTop);

                this._centerMarkBottom = document.createElement('div');
                        this._centerMarkBottom.className = this.properties.tickMarkObject.centerMarkBottomStyle;
                        this.divElt.appendChild(this._centerMarkBottom);
            }

            var leftMostTickX = 1;              // Pixel offset due to progress graphic inside background graphic
            var numTickMarks = 0;               // Number of tick marks that will be displayed
                                                // NOTE: numTickMarks will actually be 1 less than the number displayed
            var tickOffset = 0;                 // pixels distance between tick marks
            var showCenterTickMark = true;      // If an odd number of tick marks, determines if center mark is shown
            var centerTickMark = 0;             // Number of the center tick mark
            var showingTickMarks = true;        // whether or not tick marks are being shown

            // Determine if tick marks will be shown
            if (this.properties.tickMarkObject.tickIncrement > 0)
            {
                // Determine the number of tick marks that will be displayed
                numTickMarks = Math.round((this.properties.max - this.properties.min) / this.properties.tickMarkObject.tickIncrement);

                // Calculate the offset between tick marks
                tickOffset = ((this.properties.width - 4) / numTickMarks);

                //----------------------------------------------------
                // NOTE: If numTickMarks is odd, one will be in the center.
                // If centerMarksVisible is true, we'll want to hide that mark
                //----------------------------------------------------

                // Check for a center tick mark AND center mark condition
                // NOTE: Add 1 to account for right-end tick mark
                if (((numTickMarks + 1) % 2) && centerMarksVisible)
                {
                    // Need to hide the center tick mark
                    showCenterTickMark = false;
                    // Determine the center tick mark number
                    centerTickMark = (numTickMarks / 2);
                }
            }
            else
            {
                // No tick marks to display
                showingTickMarks = false;
            }

            // Instantiate tick marks
            if (showingTickMarks)
            {
                for (var i = 0; i <= numTickMarks; i++)
                {
                    // Determine if we have to hide a center tick mark
                    // Render all relevant tick marks
                    if (showCenterTickMark)
                    {
                        // Render tick mark
                        this["_tickMark_" + i] = document.createElement('div');
                            this["_tickMark_" + i].className = this.properties.tickMarkObject.tickMarkStyle;
                            var thisLeft = (((i * tickOffset) + leftMostTickX));
                            this["_tickMark_" + i].style.left = thisLeft + "px";
                            this.divElt.appendChild(this["_tickMark_" + i]);
                    }
                    else if (i != centerTickMark)
                    {
                        // Render tick mark
                        this["_tickMark_" + i] = document.createElement('div');
                            this["_tickMark_" + i].className = this.properties.tickMarkObject.tickMarkStyle;
                            var thisLeft = (((i * tickOffset) + leftMostTickX));
                            this["_tickMark_" + i].style.left = thisLeft + "px";
                            this.divElt.appendChild(this["_tickMark_" + i]);
                    }
                    else
                    {
                        // Skip this tick mark as a center mark will go here
                    }

                    // If we are displaying numbers, render one for each tick mark
                    if (this.properties.tickMarkObject.showNumbers === true)
                    {
                        // Render number
                        this["_tickNumber_" + i] = document.createElement('div');
                            this["_tickNumber_" + i].className = this.properties.tickMarkObject.numberStyle;
                            // TODO: Need to find a way to get the "width" attribute from
                            // the CSS class so we can divide it by two. For now, hard-
                            // coded half the value here.
                            var thisLeft = ((((i * tickOffset) + leftMostTickX)) - 7);
                            this["_tickNumber_" + i].style.left = thisLeft + "px";
                            this.divElt.appendChild(this["_tickNumber_" + i]);

                        // Set text value
                        this["_tickNumber_" + i].innerText = tickNum;

                        tickNum++;
                    }
                }
            }
            else
            {
                // No tick marks to display. Ergo, do not display numbers.
            }
        }
        else
        {
            log.warn("SliderCtrl: showTickMarks set to true with no tickMarkObject.");
        }
    }

    // Check for and generate labels
    if (this.properties.showLabels === true)
    {
        // Check for labelObject
        if (this.properties.labelObject != null)
        {
            // Initialize labels
           this._leftLabel = document.createElement('div');
                this._leftLabel.className = this.properties.labelObject.leftLabelStyle;
                this.divElt.appendChild(this._leftLabel);

           this._rightLabel = document.createElement('div');
                this._rightLabel.className = this.properties.labelObject.rightLabelStyle;
                this.divElt.appendChild(this._rightLabel);

           this._centerLabel = document.createElement('div');
                this._centerLabel.className = this.properties.labelObject.centerLabelStyle;
                this.divElt.appendChild(this._centerLabel);

           // Determine / localize left label
           var leftLabelText = "";

           if (this.properties.labelObject.leftLabelId)
           {
               // Check for existence of labelId in the local dictionary
               var stringIdExists = framework.localize.testLocStr(this.uiaId, this.properties.labelObject.leftLabelId);
               if (stringIdExists)
               {
                   // String exists. Localize.
                   leftLabelText = framework.localize.getLocStr(this.uiaId, this.properties.labelObject.leftLabelId, this.properties.labelObject.leftSubMap);
               }
               else
               {
                   // String is not in the local dictionary.
                   // Set text to empty and throw a warning.
                   leftLabelText = "";
                   log.warn("SliderCtrl: leftLabelId " + this.properties.labelObject.leftLabelId + " not found in local dictionary.");
               }
           }
           else if (this.properties.labelObject.leftLabelText != null)
           {
               // Use implicit text value
               leftLabelText = this.properties.labelObject.leftLabelText;
           }
           else
           {
               // No text provided. Empty.
               leftLabelText = "";
           }

           // Set label text
           this._leftLabel.innerText = leftLabelText;

           // Determine / localize center label
           var centerLabelText = "";

           if (this.properties.labelObject.centerLabelId)
           {
               // Check for existence of labelId in the local dictionary
               var stringIdExists = framework.localize.testLocStr(this.uiaId, this.properties.labelObject.centerLabelId);
               if (stringIdExists)
               {
                   // String exists. Localize.
                   centerLabelText = framework.localize.getLocStr(this.uiaId, this.properties.labelObject.centerLabelId, this.properties.labelObject.centerSubMap);
               }
               else
               {
                   // String is not in the local dictionary.
                   // Set text to empty and throw a warning.
                   centerLabelText = "";
                   log.warn("SliderCtrl: centerLabelId " + this.properties.labelObject.centerLabelId + " not found in local dictionary.");
               }
           }
           else if (this.properties.labelObject.centerLabelText != null)
           {
               // Use implicit text value
               centerLabelText = this.properties.labelObject.centerLabelText;
           }
           else
           {
               // No text provided. Empty.
               centerLabelText = "";
           }

           // Set label text
           this._centerLabel.innerText = centerLabelText;

           // Determine / localize left label
           var rightLabelText = "";

           if (this.properties.labelObject.rightLabelId)
           {
               // Check for existence of labelId in the local dictionary
               var stringIdExists = framework.localize.testLocStr(this.uiaId, this.properties.labelObject.rightLabelId);
               if (stringIdExists)
               {
                   // String exists. Localize.
                   rightLabelText = framework.localize.getLocStr(this.uiaId, this.properties.labelObject.rightLabelId, this.properties.labelObject.rightSubMap);
               }
               else
               {
                   // String is not in the local dictionary.
                   // Set text to empty and throw a warning.
                   rightLabelText = "";
                   log.warn("SliderCtrl: rightLabelId " + this.properties.labelObject.rightLabelId + " not found in local dictionary.");
               }
           }
           else if (this.properties.labelObject.rightLabelText != null)
           {
               // Use implicit text value
               rightLabelText = this.properties.labelObject.rightLabelText;
           }
           else
           {
               // No text provided. Empty.
               rightLabelText = "";
           }

           // Set label text
           this._rightLabel.innerText = rightLabelText;
        }
        else
        {
            log.warn("SliderCtrl: showLabels set to true with no labelObject.");
        }
    }

    // Check for and generate plus/minus graphics
    if (this.properties.showPlusMinus === true)
    {
        // Check for plusMinusObject
        if (this.properties.plusMinusObject != null)
        {
            // Initialize plus/minus
           this._plusSign = document.createElement('div');
                this._plusSign.className = this.properties.plusMinusObject.plusSignStyle;
                this.divElt.appendChild(this._plusSign);

           this._minusSign = document.createElement('div');
                this._minusSign.className = this.properties.plusMinusObject.minusSignStyle;
                this.divElt.appendChild(this._minusSign);
        }
        else
        {
            log.warn("SliderCtrl: showPlusMinus set to true with no plusMinusObject.");
        }
    }

    //scrubber handle
    // If not in "progress" style, create handle
    if (this.properties.style != "progress")
    {
        this.handle = document.createElement('div');
            this.handle.className = this.properties.handleClass;
            this.divElt.appendChild(this.handle);

        // "mouse down" handler
        if (!this.properties.canJump)
        {
            // "jumping" disallowed. Assign down handler to handle
            this._downCallback = this._onDownHandler.bind(this);
            this.handle.addEventListener("mousedown", this._downCallback, false);
        }
        else
        {
            // "jumping" allowed. Assign to divElt
            this._downCallback = this._onDownHandler.bind(this);
            this.divElt.addEventListener("mousedown", this._downCallback, false);
        }
    }
    else
    {
        // Progress style has no touch input
    }

    if (this.properties.width && this.properties.handleWidth)
    {
        this._sliderWidth = this.properties.width;
        this._sliderHalfWidth = this._sliderWidth / 2;
        this._handleHalfWidth = this.properties.handleWidth / 2;
        this._handleHalfPerc = this._handleHalfWidth / this._sliderWidth * 100;
    }
    else
    {
        log.warn("Properties 'width' and 'handleWidth' must be set!");
    }

    switch(this.properties.style)
    {
        case "pivot":
            this.handle.style.left = (50 - this._handleHalfPerc) + "%";
            this.fill.style.left = "50%";
            break;
        case "slider":
            this.handle.style.left = - this._handleHalfWidth + "px";
            this.fill.style.left = "1px";
            break;
        case "progress":
            // No handle
            this.fill.style.left = "1px";
        default:
            break;
    }

    if (utility.toType(this.properties.increment) == 'number' && this.properties.increment > 0)
    {
        this._increment = this.properties.increment;
        this._tiltHoldIncrement = this._increment;
    }
    else
    {
        log.warn(this.uiaId + " SliderCtrl: Property 'increment' must be given as a non-null positive Number value!");
    }

    if (this.properties.min != null)
    {
        this._moveMin = this.properties.min;
    }
    else
    {
        log.warn(this.uiaId + " SliderCtrl: Null value for 'min' given.");
    }

    if (this.properties.max != null)
    {
        this._moveMax = this.properties.max;
    }
    else
    {
        log.warn(this.uiaId + " SliderCtrl: Null value for 'max' given.");
    }

    // If a scrubChangeInterval value was passed, use instead of default
    if (this.properties.scrubChangeInterval != null)
    {
        this._scrubChangeInterval = this.properties.scrubChangeInterval;
    }

    // Add all DIVs to parent
    this.parentDiv.appendChild(this.divElt);

    // Set slider to inital value
    this.setValue(this.properties.value);

    // Set slider to initial enabled/disabled state
    this.setDisabled(this.properties.disabled);
};

/*
 *  Public APIs
 */

/*
 * Set the movement increment of the slider.
 * @param min   Number  Minimum value on the slider's scale
 * @param max   Number  Maximum value on the slider's scale
 * @param increment Number  Decimal increment that the slider will snap to
 */
SliderCtrl.prototype.setMoveIncrement = function(min, max, increment)
{
    log.debug("SliderCtrl: setMoveIncrement() ", min, max, increment);
    this._moveMin = min;
    this._moveMax = max;
    this._increment = increment;
}

/*
 * Updates the index value of the slider.
 * @param value Number  New index value. This must be an appropriate value along the slider's increment scale.
 */
SliderCtrl.prototype.setValue = function(value)
{
    log.debug("SliderCtrl: setValue() ", value);

    if (utility.toType(value) != 'number')
    {
        log.error(this.uiaId + ": SliderCtrl setValue() called with bad value: " + value + " This API only accepts type: Number.");
        return;
    }

    var handleIndex = this._getIndexSnapValue(value);
    if (handleIndex != value)
    {
        log.warn(value + " is not an increment on this slider. Slider value set to closest increment: " + handleIndex);
    }

    // Cache the value from the App in case the Slider is in use
    this._valueFromApp = handleIndex;
    this._setValueHelper();
};

/*
 * Gets the current index value of the slider
 * @return  Number  The slider's current value
 */
SliderCtrl.prototype.getValue = function()
{
    return this._currSliderIndex;
};

/*
 * Enables or Disables the slider
 * @param disabled  Boolean True if the slider should be disabled
 */
SliderCtrl.prototype.setDisabled = function(disabled)
{
    log.debug("SliderCtrl: setDisabled() ", disabled);

    this._isDisabled = disabled;

    if (disabled)
    {
        log.debug("Slider is disabled...");
        clearInterval(this._rotationSettleTimerId);
        this._endUserInput(this._currSliderIndex);

        if (this._hasFocus)
        {
            this._setFocusHighlight(false);
        }

        // Add any disabled classes
        if (this.properties.style != "progress")
        {
            this.handle.classList.add(this.properties.disabledHandleClass);
        }

        this.fill.classList.add(this.properties.disabledFillClass);
        this.divElt.classList.add(this.properties.disabledWrapperClass);
    }
    else
    {
        // Remove any disabled classes
        if (this.properties.style != "progress")
        {
            this.handle.classList.remove(this.properties.disabledHandleClass);
        }

        this.fill.classList.remove(this.properties.disabledFillClass);
        this.divElt.classList.remove(this.properties.disabledWrapperClass);

        if (this._hasFocus)
        {
            this._setFocusHighlight(true);
        }
    }

    this._selectMode = null; // clear _selectMode so we don't get stuck
};

/*
 *  UTILITIES
 */
SliderCtrl.prototype._applyDebugClasses = function()
{
    if (this.properties.wrapperClass == null)
    {
        this.properties.wrapperClass = "SliderCtrl";
    }

    if (this.properties.fillClass == null)
    {
        this.properties.fillClass = "SliderCtrlFill";
    }

    if (this.properties.handleClass == null)
    {
        this.properties.handleClass = "SliderCtrlHandle";
    }

    if (this.properties.focusedWrapperClass == null)
    {
        this.properties.focusedWrapperClass = "SliderCtrlFocusedWrapper";
    }

    if (this.properties.focusedFillClass == null)
    {
        this.properties.focusedFillClass = "SliderCtrlFocusedFill";
    }

    if (this.properties.focusedHandleClass == null)
    {
        this.properties.focusedHandleClass = "SliderCtrlFocusedHandle";
    }

    if (this.properties.disabledWrapperClass == null)
    {
        this.properties.disabledWrapperClass = "SliderCtrlDisabledWrapper";
    }

    if (this.properties.disabledFillClass == null)
    {
        this.properties.disabledFillClass = "SliderCtrlDisabledFill";
    }

    if (this.properties.disabledHandleClass == null)
    {
        this.properties.disabledHandleClass = "SliderCtrlDisabledHandle";
    }

};

/*
 * Helper function that checks for settled condition and sets cached value, if any.
 * This function will not do anything unless the slider has settled. This is only called by
 * the public setValue() API or upon the settleTimer completing.
 */
SliderCtrl.prototype._setValueHelper = function()
{
    log.debug("SliderCtrl: _setValueHelper() called...");

    // only set if settleTimer has expired and the slider is no longer being interacted with
    if (this._isBeingUsed === false && this._settled === true)
    {
        if (this._valueFromApp != null)
        {
            // Use cached value, if possible. (called from public setValue())
            this._snapToIndex(this._valueFromApp);
            // NOTE: This value was set by the App. There's no reason to issue a callback with the same value.

            this._valueFromApp = null;
        }
    }
    else
    {
        // do nothing. This function will be called again when settle time completes
    }
};

/*Function to set the focus highlight of the slider*/
SliderCtrl.prototype._setFocusHighlight = function(highlight)
{
    log.debug("SliderCtrl: _setFocusHighlight() highlight?", highlight);
    if (highlight)
    {
        if (!this._isDisabled)
        {
            if (this.properties.style != "progress")
            {
                this.handle.classList.add(this.properties.focusedHandleClass);
            }

            this.fill.classList.add(this.properties.focusedFillClass);
            this.divElt.classList.add(this.properties.focusedWrapperClass);
        }
    }
    else
    {
        if (this.properties.style != "progress")
        {
            this.handle.classList.remove(this.properties.focusedHandleClass);
        }
        this.fill.classList.remove(this.properties.focusedFillClass);
        this.divElt.classList.remove(this.properties.focusedWrapperClass);
    }

};

/*return the closest interval the handle will snap to given value*/
SliderCtrl.prototype._getIndexSnapValue = function(value)
{
    var snap;
    snap = Math.round(value / this._increment) * this._increment;
    snap = this._toFixedDecimals(snap);   // fix for wrong js division

     //check that snap is within [min, max], otherwise set to min/max
    if (snap <= this._moveMin)
    {
        return this._moveMin;
    }
    else if (snap >= this._moveMax)
    {
        return this._moveMax;
    }

    return snap;
};

/*
 * Returns a precentage given a particular index
 * @param index     Number  Index value representation of the slider's position
 * @return          Number  Percentage representation of the slider's position
 */
SliderCtrl.prototype._indexToPercentage = function(index)
{
    return this._toFixedDecimals( (index - this._moveMin) / (this._moveMax - this._moveMin) );
};

/*
 * Returns an index given a percentage
 * @param percent   Number  Percentage representation of the slider's position
 * @return          Number  Index value representation of the slider's position
 */
SliderCtrl.prototype._percentToIndex = function(percent)
{
    return this._moveMin + percent * (this._moveMax - this._moveMin);
};

/*
 * Calculates the pixel value of an increment and calls _moveHandle()
 */
SliderCtrl.prototype._snapToIndex = function(index)
{
    log.debug("SliderCtrl: _snapToIndex() ", index);

    if (isNaN(index))
    {
        log.error("_snapToIndex called with NaN!");
    }

    index = this._getIndexSnapValue(index);
    var sliderPercentage = this._indexToPercentage(index);
    this._moveHandle(sliderPercentage);
};

/* Actaully moves the handle and fill to a percentage offset
*  Updates this._handlePos and this._currSliderIndex
*/
SliderCtrl.prototype._moveHandle = function(percent)
{
    if (isNaN(percent))
    {
        log.error("_moveHandle called with NaN!");
    }

    var xPerc = percent * 100;
    if (xPerc < 0)
    {
        log.debug("   trying to move left of slider...");
        xPerc = 0;
    }
    if (xPerc > 100)
    {
        log.debug("   trying to move right of slider...");
        xPerc = 100;
    }

    this._handlePos = xPerc;

    // Do not use strict equality (!==). Value here may be undefined or null.
    if(this.properties != null)
    {
        // If not in "progress" style, position the handle
        if (this.properties.style != "progress")
        {
            this.handle.style.left = ((xPerc - this._handleHalfPerc) / 100 * this._sliderWidth) + "px";
        }

        if (this.properties.style == 'pivot')
        {
            if (xPerc < 50)
            {
                this.fill.style.left = (this._sliderWidth * xPerc) / 100 + "px";
                // patch - should be fixed in better way
                if (this.fill.currentStyle.left == "")
                {
                    // Enters this block during context change as "this.fill.currentStyle" object doesn't gets updated.
                    this.fill.style.width = (this._sliderHalfWidth - (this._sliderWidth * xPerc) / 100 ) + "px";
                }
                else
                {
                    this.fill.style.width = (this._sliderHalfWidth - parseInt(this.fill.currentStyle.left)) + "px";
                }
                this.fill.classList.add("SliderCtrlPivotFillLeft");
            }
            else
            {
                this.fill.style.left = this._sliderHalfWidth + "px";
                this.fill.style.width = ((this._sliderWidth * xPerc) / 100 - this._sliderHalfWidth) + "px";
                this.fill.classList.remove("SliderCtrlPivotFillLeft");
            }
        }
        else
        {
            this.fill.style.width = xPerc * this._sliderWidth / 100 + "px";
        }
    }

    var newIndex = this._percentToIndex(percent);
        newIndex = this._getIndexSnapValue(newIndex);

    if (newIndex !== this._currSliderIndex)
    {
        log.debug("    Index has changed. _currSliderIndex: " + this._currSliderIndex + " >>> newIndex: " + newIndex);
        this._currSliderIndex = newIndex; // update the currSliderIndex so that it's always in sync with the display
    }

};


/*
 *  HANDLERS
 */

/* Function that gets called when the down event fires */
SliderCtrl.prototype._onDownHandler = function(evt)
{
    log.debug(this.divElt.id + " _onDownHandler  called. this._selectMode", this._selectMode, "pageX is", evt.pageX);
    if (this._selectMode === null)
    {
        if (this._isDisabled === false)
        {
            // Clear any current settleTime timer
            clearTimeout(this._settleTimerId);

            if (!this._hasFocus && this.canStealFocus)
            {
                framework.common.stealFocus(); // steal focus
                this._acceptFocusHelper(true); // set the highlight
            }

            this._selectMode = "touch";

            // Fire "beep" when handle is touched
            this._beep("Short", "Touch");

            this._isBeingUsed = true;

            this._leftOffset = this.divElt.offsetLeft;
            var parent = this.divElt.parentElement;

            while (parent != null)
            {
                this._leftOffset += parent.offsetLeft;
                parent = parent.parentElement;
            }

            var relativeX = evt.pageX - this._leftOffset;
            var sliderPercentage = relativeX / this._sliderWidth;

            this._moveHandle(sliderPercentage);
            this._slideCallbackHelper();

            this._docMoveCallback = this._onMoveHandler.bind(this);
            this._docUpCallback = this._onUpHandler.bind(this);
            document.body.addEventListener("mousemove", this._docMoveCallback);
            document.body.addEventListener("mouseup", this._docUpCallback);
        }
    }
};

/* Function that gets called after a down event occurs and a mousemove event fires */
SliderCtrl.prototype._onMoveHandler = function(evt)
{
    //get x position.
    var relativeX = evt.pageX - this._leftOffset;
    var sliderPercentage = relativeX / this._sliderWidth;

    this._moveHandle(sliderPercentage);
    this._slideCallbackHelper();
};

/* Function that gets called when the up event fires */
SliderCtrl.prototype._onUpHandler = function(evt)
{
    log.debug(this.divElt.id + " _onUpHandler called at X position: " + evt.pageX);

    if (this._selectMode === "touch")
    {
        var relativeX = evt.pageX - this._leftOffset;
        var proposedIndex = this._percentToIndex(relativeX / this._sliderWidth);
        this._selectMode = null;
        this._endUserInput(proposedIndex);
    }
};

/*
 * Handler for _rotationSettleTimerId. Basically, this gives me a well-defined log point.
 */
SliderCtrl.prototype._rotateIdleHandler = function()
{
    log.debug("_rotateIdleHandler called()");
    this._endUserInput(this._currSliderIndex);
};

/*
 * Helper function to clean up after user is finished giving input
 * Called when the user is touching and release, or the slider gets disabled,
 * or the rotationIdleTimer expires, or from finishPartialActivities
 */
SliderCtrl.prototype._endUserInput = function(proposedIndex)
{
    log.debug("_endUserInput() proposedIndex:", proposedIndex);
    // Clear timers
    clearTimeout(this._rotationSettleTimerId);

    // Clear the minChangeInterval because the user is done making changes and we don't
    // want to make any redundant callback
    clearTimeout(this._minChangeTimerId);
    this._canSend = true;

    clearTimeout(this._holdTimeoutId);

    if (this._isFastScrubbing)
    {
        clearTimeout(this._scrubTimeoutId);
        this._tiltHoldIncrement = this._increment;
        this._isFastScrubbing = false;
    }

    if (this._docUpCallback)
    {
        //remove document level listeners
        document.body.removeEventListener("mousemove", this._docMoveCallback);
        document.body.removeEventListener("mouseup", this._docUpCallback);
        this._docUpCallback = null;
    }

    // snapToIndex (might be needed for touch)
    var newIndex = this._getIndexSnapValue(proposedIndex);
    this._snapToIndex(newIndex);

    // Set flags, and issue callback if needed
    if (this._isBeingUsed)
    {
        this._isBeingUsed = false;
        this._settled = false; // no longer being used, set settled false immediately as a "state holder"
        this._isTilted = false;
        this._slideCallback();

        // We just issued a finalAdjustment=true callback, so we need to start the settleTimer
        clearTimeout(this._settleTimerId); // only one settleTimer can be running at a time
        log.debug("    ---> Starting settleTimer!");
        this._settleTimerId = setTimeout(this._settleHandler.bind(this), this.properties.settleTime);
    }

};

/*
 * Function that releases the slider and sets the slider to new index
 * @param index (Number) New index value. This must be an appropriate value along the slider's increment scale.
*/
SliderCtrl.prototype.scrubberRelease = function(index)
{
    log.debug("In scrubberRelease()",index);
    if (isNaN(index))
    {
        index = this._currSliderIndex;
    }

    // Clear timers
    clearTimeout(this._rotationSettleTimerId);
    clearTimeout(this._minChangeTimerId);
    clearTimeout(this._holdTimeoutId);
    this._isBeingUsed = false;

    // Remove document level listeners
    // Clear the selectMode
    this._selectMode = null;
    this._endUserInput(index);
}

/*Function called by settle interval to check for settled condition*/
SliderCtrl.prototype._settleHandler = function()
{
    log.debug(this.divElt.id + " ---> _settleHandler() called...");
    clearTimeout(this._minChangeTimerId);
    this._settled = true;

    this._setValueHelper();
};

/*
 * Handler called when the minChangeInterval timer completes.
 * This mechanism is used to prevent flooding the Application with slideCallbacks.
 */
SliderCtrl.prototype._minChangeHandler = function()
{
    log.debug("minChangeInterval expired. _currSliderIndex: " + this._currSliderIndex + " _previouslySent: " + this._previouslySent);
    if (this._currSliderIndex !== this._previouslySent)
    {
        clearTimeout(this._minChangeTimerId);
        this._slideCallback();
        this._minChangeTimerId = setTimeout(this._minChangeHandler.bind(this), this.properties.minChangeInterval);
    }
    else
    {
        this._canSend = true;
    }
};

/*Helper function that determines whether to fire a slideCallback*/
SliderCtrl.prototype._slideCallbackHelper = function()
{
    log.debug("SliderCtrl: _slideCallbackHelper() called...");
    if (this._currSliderIndex !== this._previouslySent)
    {
        // an increment has been crossed
        if (this._canSend)
        {
            this._slideCallback();

            // minChangeInterval only applies to callbacks sent while the slider is being used
            // The last callback (finalAdjustment = true) should be sent without resetting the minChange timer
            if (this._isBeingUsed === true)
            {
                this._canSend = false;

                // The same change interval is used for both touch and multicontroller
                // to prevent event flooding
                this._minChangeTimerId = setTimeout(this._minChangeHandler.bind(this), this.properties.minChangeInterval);
            }

        }
        else
        {
            // Wait for the minChangeInterval to complete, which calls _slideCallback...
            // ...directly if a change has occured since the last callback.
        }

    }
};

/*
 * Helper function that determines finalAdjustem and
 * calls the App's slideCallback function.
 */
SliderCtrl.prototype._slideCallback = function()
{
    log.debug("SliderCtrl: _slideCallback() called...");

    // This value is considered 'sent' whether the Application has a callback set or not. We will not repeatedly send values.
    this._previouslySent = this._currSliderIndex;

    log.debug("   this._isBeingUsed: " + this._isBeingUsed);
    log.debug("   this._selectMode: " + this._selectMode);

    if (typeof this.properties.slideCallback == 'function')
    {
        // Begin assuming not final adjustment
        var isFinal = false;

        /*
         * Cases resulting in finalAdjustment == true:
         * -------------------------------------------
         * - this._isBeingUsed == false
         */

        if (this._isBeingUsed === false)
        {
            // Final
            isFinal = true;
        }

        if (isFinal === true)
        {
            // Clear select mode
            this._selectMode = null;
        }

        log.debug("   isFinal: " + isFinal);

        var params = {"value": this._currSliderIndex, "finalAdjustment": isFinal};

        this.properties.slideCallback(this, this.properties.appData, params);
    }
    else if (this.properties.style != "progress")
    {
        log.warn("No slider callback was set for Slider control from uiaID:", this.uiaId);
    }
};

/*
 * Function that begins waiting for a "long tilt" timeout
 * @param   direction   STRING  "left" or "right"
 */
SliderCtrl.prototype._tiltStartHandler = function(direction)
{
    log.debug("SliderCtrl: _tiltStartHandler() ", direction);
    this._isTilted = true;
    this._moveOneIncrement(direction);

    // set a timeout, if the multicontroller is still tilted at the end, set the hold state
    // Check for previous timeout. Clear if found.
    if (this._holdTimeoutId)
    {
        clearTimeout(this._holdTimeoutId);
    }
    this._holdTimeoutId = setTimeout(this._onLongTiltHandler.bind(this, direction), this._holdTimeout);
};

/*Function that is called if a multicontroller "long tilt" occurs */
SliderCtrl.prototype._onLongTiltHandler = function(direction)
{
    log.debug("SliderCtrl: _onLongTiltHandler() ", direction);
    if (this._isTilted)
    {
        this._isBeingUsed = true;
        this._isFastScrubbing = true;
    }

    // Fire "beep" when handle is touched
    this._beep("Long", "Multicontroller");

    // Reset fast interval counter (1 because we already moved in _tiltStartHandler())
    this._numFastIntervals = 1;

    // Unlike longPress or holdStart, the event needs to be
    // fired repeatedly at 1sec intervals and is internal.
    this._fastScrubHandler(direction);
};

/*Function that begins fast scrubbing */
SliderCtrl.prototype._fastScrubHandler = function(direction)
{
    log.debug("SliderCtrl: _fastScrubHandler() ", direction);
    if (this._isTilted && this._isBeingUsed)
    {
        // Still scrubbing...
        this._moveOneIncrement(direction);

        // Increment fast interval counter
        this._numFastIntervals++;

        // Check to see if 5 sec has elapsed
        if (this._numFastIntervals == 5)
        {
            // Ensure that the new move increment would not exceed 1/8 of total duration
            if ((this._tiltHoldIncrement * 2) <= ((this._moveMax - this._moveMin) / 8))
            {
                // Increase move increment by 200%
                this._tiltHoldIncrement = (this._tiltHoldIncrement * 2);

                // Ensure that the _tiltHoldIncrement falls on the slider's increments (safety check)
                this._tiltHoldIncrement = this._getIndexSnapValue(this._tiltHoldIncrement);
            }

            // Reset fast interval counter
            this._numFastIntervals = 0;
        }

        // Check for any existing scrub timeout. Clear if exists.
        if (this._scrubTimeoutId)
        {
            clearTimeout(this._scrubTimeoutId);
        }

        this._scrubTimeoutId = setTimeout(this._fastScrubHandler.bind(this, direction), this._scrubChangeInterval);
    }
};

/*
 * Function to move the slider a single increment value
 * @param   direction   STRING  'left' or 'right'
 * @param   eventId     STRING  (Optional) Event Id that cause the move. Determines whether to use rotationIdleTime
 */
SliderCtrl.prototype._moveOneIncrement = function(direction, eventId)
{
    log.debug("SliderCtrl: _moveOneIncrement() ", direction, eventId);
    clearTimeout(this._settleTimerId);
    clearInterval(this._rotationSettleTimerId);

    if (!this._isDisabled)
    {
        var newIndex = this._currSliderIndex;

        if (direction != 'stay') // stay is used to NOT move, but start the rotationIdle timer
        {
            if (direction == 'left')
            {
                newIndex -= this._tiltHoldIncrement; // This will be the same as _increment unless we're in a tilt-hold
            }
            else if (direction == 'right')
            {
                newIndex += this._tiltHoldIncrement;
            }
            else
            {
                log.error('_moveOneIncrement only accepts \'left\' or \'right\' as a direction');
            }

            this._isBeingUsed = true;

            this._snapToIndex(newIndex);
            this._slideCallbackHelper();
        }

        // Set rotationIdleDetectTime timeout
        var acceptedIds = ['cw', 'ccw', 'right', 'left'];
        if (acceptedIds.indexOf(eventId) != -1)
        {
            this._rotationSettleTimerId = setTimeout(this._rotateIdleHandler.bind(this), this.properties.rotationIdleDetectTime);
        }
    }
};

/*
 * Returns a fixed decimal number value
 */
SliderCtrl.prototype._toFixedDecimals = function(number)
{
    return Math.round(number * 100) / 100;
};

/* (internal - called by the framework)
 * Handles multicontroller events.
 *
 * @param   eventID (string) any of the “Internal event name” values in IHU_GUI_MulticontrollerSimulation.docx (e.g. 'cw',
 * 'ccw', 'select')
 */
SliderCtrl.prototype.handleControllerEvent = function(eventId)
{
    log.debug(this.divElt.id + " handleController() called, eventID: " + eventId);

    //response will be return value at end of function
    var response = "ignored";

    switch(eventId)
    {
        case "touchActive":
            //not sure what to do
            response = 'consumed';
            break;
        case "controllerActive":
            //not sure what to do
            response = 'consumed';
            break;
        case "select":
            if (this._selectMode === "controller")
            {
                this._selectMode = null;
                response = 'consumed';
            }
            break;
        case "selectStart":
            if (this._selectMode === null)
            {
                this._selectMode = "controller";
            }
            // No action
            break;
        case "left":
            clearTimeout(this._holdTimeoutId);
            if (this._selectMode === "controller")
            {
                this._selectMode = null;
            }
            if (this._isFastScrubbing)
            {
                // _endUserInput will reset tilt-hold variables
                this._endUserInput(this._currSliderIndex);
            }
            else if (this.properties.style != "progress")
            {
                this._moveOneIncrement('stay', eventId);
            }
            break;
        case "leftStart":
            if (this._selectMode === null && this._isDisabled == false)
            {
                if (this.properties.style != "progress")
                {
                    this._selectMode = "controller";
                    this._tiltStartHandler("left");
                    response = "consumed";
                }
            }
            break;
        case "right":
            clearTimeout(this._holdTimeoutId);
            if (this._selectMode === "controller")
            {
                this._selectMode = null;
            }
            if (this._isFastScrubbing)
            {
                // _endUserInput will reset tilt-hold variables
                this._endUserInput(this._currSliderIndex);
            }
            else if (this.properties.style != "progress")
            {
                this._moveOneIncrement('stay', eventId);
            }
            break;
        case "rightStart":
            if (this._selectMode === null && this._isDisabled == false)
            {
                if (this.properties.style != "progress")
                {
                    this._selectMode = "controller";
                    this._tiltStartHandler("right");
                    response = "consumed";
                }
            }
            break;
        case "down":
            if (this._selectMode === "controller")
            {
                this._selectMode = null;
            }
            response = 'giveFocusDown';
            break;
        case "downStart":
            // No action
            response = "ignored";
            break;
        case "up":
            if (this._selectMode === "controller")
            {
                this._selectMode = null;
            }
            response = 'giveFocusUp';
            break;
        case "upStart":
            // No action
            response = "ignored";
            break;
        case "cw":
            if (this._selectMode === null && this._isDisabled == false)
            {
                if (this.properties.style != "progress")
                {
                    this._moveOneIncrement('right', eventId);
                    response = "consumed";
                }
            }
            break;
        case "ccw":
            if (this._selectMode === null && this._isDisabled == false)
            {
                if (this.properties.style != "progress")
                {
                    this._moveOneIncrement('left', eventId);
                    response = "consumed";
                }
            }
            break;
        case "acceptFocusInit":    //intentional fallthrough. these cases have the same behavior
        case "acceptFocusFromLeft":
        case "acceptFocusFromRight":
        case "acceptFocusFromTop":
        case "acceptFocusFromBottom":
            //set highlight
            this._acceptFocusHelper(false);
            this._selectMode = null; // clear _selectMode so we don't get stuck
            response = 'consumed';

            break;
        case "lostFocus":
            //remove highlight
            if(this._hasFocus == true)
            {
                this._setFocusHighlight(false);
                this._hasFocus = false;
                this._endUserInput(this._currSliderIndex);
                this._selectMode = null; // clear _selectMode so we don't get stuck
                response = 'consumed';
            }
            else
            {
                response = 'ignored';
            }
            break;
        default:
            // No action
            break;
    }

    return response;
};

/*
 * Function that sets up slider when focus is accepted and
 * optionally calls a focusCallback if focus was stolen
*/
SliderCtrl.prototype._acceptFocusHelper = function(stolen)
{
    log.debug("SliderCtrl: _acceptFocusHelper() focus was stolen?", stolen);
    this._hasFocus = true;
    this._setFocusHighlight(true);

    if (typeof this.properties.onFocusCallback == 'function')
    {
        var params = {
            "focusStolen": stolen === true
        };
        this.properties.onFocusCallback(this, this.properties.appData, params);
    }
};

/*
 * (internal) Called by GUI Framework just before a context change occurs.
 * Slider will issue any remaining callbacks before leaving the screen.
 */
SliderCtrl.prototype.finishPartialActivity = function()
{
    log.debug("SliderCtrl: finishPartialActivity() called...");

    // Mimmick onUp event
    log.debug("   this._currSliderIndex: " + this._currSliderIndex);
    if (!this._isDisabled && this.handle)
    {
        // call up helper with last handle index
        this._endUserInput(this._currSliderIndex);
    }
};

/**
 * (private) Cause an audible beep to be played
 * @param (String) Indicates a short press or a long press. Valid values are “Short” and “Long”.
 * @param (String) Indicates the user interaction that caused the beep. Valid values are “Touch”, “Multicontroller”, and “Hardkey”.
 */
SliderCtrl.prototype._beep = function(pressType, eventCause)
{
    // check for beep API
    if (framework.common.beep && eventCause != null)
    {
        // call beep
        framework.common.beep(pressType, eventCause);
    }
};

/*Function called by parent control to perform any cleanup before control is destroyed */
SliderCtrl.prototype.cleanUp = function()
{
    if (this.handle)
    {
        this.handle.removeEventListener("mousedown", this._downCallback); // remove "down" from both handle and divElt to be safe
    }
    this.divElt.removeEventListener("mousedown", this._downCallback);
    this.divElt.removeEventListener("mouseup", this._upCallback);
    this.divElt.removeEventListener("mousemove", this._moveCallback);

    if (this._docUpCallback)
    {
        document.body.removeEventListener("mouseup", this._docUpCallback);
        document.body.removeEventListener("mousemove", this._docMoveCallback);
    }

    clearTimeout(this._minChangeTimerId);
    clearTimeout(this._settleTimerId);
    clearTimeout(this._rotationSettleTimerId);

    delete this.properties;
};

// Register Loaded with Framework
framework.registerCtrlLoaded("SliderCtrl");
