/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: Tuner4Ctrl.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: Brian Ensink(briane@spindance.com)
 Author: Mike Petersen (mikep@spindance.com)
 Date: 18-Mar-2013
 __________________________________________________________________________

 Description: IHU GUI Tuner4 Control

 Revisions:
 v0.6 (18-Mar-2013) Changed linear tuner to rotary dial; added "sparse" HD substation support; separated EU-AM(LW) from EU-AM.
 v0.5 (25-Jan-2013) Updated region/band frequences based on Mazda specs. Region RW replaced with two regions: RW5k and RW9k.
 v0.4 (04-Jan-2013) Fixed issues preventing control from displaying on the target. This version does not have swipe or touch support.
 v0.3 (31-Oct-2012) Minor fixes, added additional regions, renamed "US" region to "NA".
 v0.2 (23-Oct-2012) Added proper appData and callback signature.
 v0.1 (22-Oct-2012) New design with fixed needle and frequency band scrolling behind the needle and supports HD substations.
 __________________________________________________________________________

*/
log.addSrcFile("Tuner4Ctrl.js", "common");
//log.setLogLevel("common", "debug");
//log.addSrcFile("Tuner4Ctrl.js", "Tuner4Ctrl");
//log.setLogLevel("Tuner4Ctrl", "debug");

function Tuner4Ctrl(uiaId, parentDiv, controlId, properties)
{
    this.uiaId = uiaId;
    this.divElt = null;
    this.controlId = controlId;

    // Constants
    this._constants = {
                        MAX_HD_SUBSTATION_COUNT : 8,
                        PIXEL_ASPECT_RATIO: 0.9375      // dY/dX for non-square pixels
                      };

    //@formatter:off
    this.properties =
    { 
        // (object) Application data sent on callbacks
        "appData" : null,

        // (string) one of NA, EU, JA, CH, RW5k, RW9k.
        "region" : "NA",

        // (string) one of AM, AM(LW), FM
        "band" : "AM",

        // The initial frequency for the tuner control
        "decimalFrequency" : undefined,

        // The initial HD substation configuration to be shown at instantiation (e.g. presets)
        "hdConfigObj" : null,

        // (function) - callback invoked when the user does a short press on the tune up or tune down button. 
        // Parameters passed to the callback are (this, appData, parameters) where parameters is
        // an object with these members: 
        //      band      - the region/band ID string the tuner is using (e.g. "na-am").
        //      direction - a value either “up” or “down” to indicate which tuner button was pressed
        //      stepCount - the number of discrete frequency steps the needle has moved in the given 
        //                  direction during the hold press.
        //      frequency - the currently tuned decimal frequency, in units of kHz for AM (e.g 540) 
        //                  and Mhz for FM (e.g 96.9)
        "stepCallback" : null,

        // (Number) - Number of milliseconds between stepCallback callbacks.
        "minChangeInterval": 250,

        // (function) - callback invoked when the user starts a hold press on tune up or tune down button.
        // Parameters passed to the callback are (this, appData, parameters) where parameters is
        // an object with these members: 
        //      band      - the region/band ID string the tuner is using (e.g. "na-am").
        //      frequency - the currently tuned decimal frequency, in units of kHz for AM (e.g 540) 
        //                  and Mhz for FM (e.g 96.9)
        "holdStartCallback" : null,

        // (function) - callback invoked when the user ends a hold press on the tune up or tune down button.
        // Parameters passed to the callback are (this, appData, parameters) where parameters is
        // an object with these members: 
        //      band      - the region/band ID string the tuner is using (e.g. "na-am").
        //      direction - a value either “up” or “down” to indicate which tuner button was pressed
        //      stepCount - the number of discrete frequency steps the needle has moved in the given 
        //                  direction during the hold press.
        //      frequency - the currently tuned decimal frequency, in units of kHz for AM (e.g 540) 
        //                  and Mhz for FM (e.g 96.9)
        "holdStopCallback" : null,

        // (function) - callback invoked when the currently displayed frequency has substations and the user
        // tunes up or down to another substation of the same frequency.
        // Parameters passed to the callback are (this, appData, parameters) where parameters is
        // an object with these members: 
        //      band      - the region/band ID string the tuner is using (e.g. "na-am").
        //      direction - a value either “up” or “down” to indicate which tuner button was pressed
        //      frequency - the currently tuned decimal frequency, in units of kHz for AM (e.g 540) 
        //                  and Mhz for FM (e.g 96.9)
        //      substation - the number of the new substation. This will be a value starting with 1 and ranging
        //                   up to the maximum number of substations specified for this frequency
        "hdSubstationChangeCallback" : null,

        // (function) - callback invoked when the control's back button is selected.  Parameters passed
        // to the callback are the usual select arguments (ctrlObj, appData, params).
        "backBtnSelectCallback" : null,

        // (number) - milliseconds between each increment of frequency band displayed behind the tuner needle. 
        // This controls the speed at which the frequency band scrolls during a hold press.
        "holdPressInterval" : 80,

        // (Number) Time in ms before a hold/long press event fires for centeredBtn
        "centeredBtnHoldTimeout" : 1500,

        // (function) - callback invoked when the control's centered button is selected.  Parameters passed
        // to the callback are the usual select arguments (ctrlObj, appData, params).
        "centeredBtnSelectCallback" : null,
        
        // (function) - callback invoked for longPress on the control's centered button.  Parameters passed
        // to the callback are the usual select arguments (ctrlObj, appData, params).
        "centeredBtnLongPressCallback" : null,

        // (number) milliseconds - minimum time after any callback is invoked invocation 
        // before the tuner control will show the effects of a setFrequency call.
        "settleTime" : 1000,
    };
    //@formatter:on

    // Pixel co-ordinate data about the UI that we need to know about programmatically.
    // This data must be kept in sync with the corresponding data in the .scss file!
    //@formatter:off
    this._dialData =
    {
        // The height of the needle bitmap (in pixels)
        "needleHeight" : 130,

        // Dial's center point for needle rotation
        // (We need window coordinates, so add 64-pixel offsets from template)
        "needleCenterX" : 400,
        "needleCenterY" : 253 + 64,

        // Distance from center to base of needle image, in pixels (offset for needle rotation)
        "needleImageOffset" : 22,

        // MPP 08/30/2013  SW00127618
        // Difference between tick mark radii in X and Y directions (in pixels), based
        // on measured distance of 147 pixels from center to outer edge of tick marks
        // along Y-axis (used to compute compensation for non-square pixels)
        "tickMarksOuterRadiusDelta" : 147 * (1 - this._constants.PIXEL_ASPECT_RATIO),

        // The radius of the dial's inner edge, in pixels (limit for mousedown parsing)
        "dialInnerRadius" : 65,

        // The radius of the dial's outer edge, in pixels (limit for mousedown parsing)
        "dialOuterRadius" : 232,
        
        // The Y-coordinate of the bottom of the previous & next buttons
        // (needed to redirect mouse downs on the dial through to the buttons)
        "buttonBottomY" : 57,
        "buttonWidth" : 384,

        // The current dial setting (angle in degrees)
        "dialSetting" : 0,
        
        // Flag indicating whether the needle is currently being dragged
        "needleIsDragging" : false,
    };
    //@formatter:on

    for (var i in properties)
    {
        this.properties[i] = properties[i];
    }

    // Check for deprecated use of "RW" region
    if (this.properties.region === "RW")
    {
        log.warn("Region 'RW' is deprecated.  Use 'RW5k' or 'RW9k' or 'RWOther' instead.  (Defaulting to 'RW5k')");
        this.properties.region = "RW5k";
    }

    // Set the band ID
    this._bandId = this._getBandId();
    log.debug("_bandId = " + this._bandId);
    
    // Set up additional band information so it's available during _createStructure().
    // NOTE: All frequency-related values are in hertz (Hz).
    this._bandData =
    {
        "na-fm":    {"name"         : "na-fm",
                     "low"          : 87700,
                     "high"         : 107900,
                     "stepInc"      : 200,
                     "firstLabel"   : 88000,
                     "lastLabel"    : 108000,
                     "labelInc"     : 2000,
                     "labelDivisor" : 1000,
                     "numDecimals"  : 1
                    },
        "na-am":    {"name"         : "na-am",
                     "low"          : 530,
                     "high"         : 1710,
                     "stepInc"      : 10,
                     "firstLabel"   : 600,
                     "lastLabel"    : 1600,
                     "labelInc"     : 100,
                     "labelDivisor" : 1,
                     "numDecimals"  : 0
                    },
        "eu-fm":    {"name"         : "eu-fm",
                     "low"          : 87500,
                     "high"         : 108000,
                     "stepInc"      : 100,
                     "firstLabel"   : 88000,
                     "lastLabel"    : 108000,
                     "labelInc"     : 2000,
                     "labelDivisor" : 1000,
                     "numDecimals"  : 1
                    },
        "eu-am(lw)":{"name"         : "eu-am(lw)",
                     "low"          : 153,
                     "high"         : 279,
                     "stepInc"      : 9,
                     "firstLabel"   : 150,
                     "lastLabel"    : 280,
                     "labelInc"     : 130,
                     "labelDivisor" : 1,
                     "numDecimals"  : 0
                    },
        "eu-am":    {"name"         : "eu-am",
                     "low"          : 531,
                     "high"         : 1602,
                     "stepInc"      : 9,
                     "firstLabel"   : 600,
                     "lastLabel"    : 1600,
                     "labelInc"     : 100,
                     "labelDivisor" : 1,
                     "numDecimals"  : 0
                    },
        "ja-fm":    {"name"         : "ja-fm",
                     "low"          : 76000,
                     "high"         : 90000,
                     "stepInc"      : 100,
                     "firstLabel"   : 76000,
                     "lastLabel"    : 90000,
                     "labelInc"     : 2000,
                     "labelDivisor" : 1000,
                     "numDecimals"  : 1
                    },
        "ja-am":    {"name"         : "ja-am",
                     "low"          : 522,
                     "high"         : 1629,
                     "stepInc"      : 9,
                     "firstLabel"   : 600,
                     "lastLabel"    : 1600,
                     "labelInc"     : 100,
                     "labelDivisor" : 1,
                     "numDecimals"  : 0
                    },
        "ch-fm":    {"name"         : "ch-fm",
                     "low"          : 87500,
                     "high"         : 108000,
                     "stepInc"      : 100,
                     "firstLabel"   : 88000,
                     "lastLabel"    : 108000,
                     "labelInc"     : 2000,
                     "labelDivisor" : 1000,
                     "numDecimals"  : 1
                    },
        "ch-am(lw)":{"name"         : "ch-am(lw)",
                     "low"          : 153,
                     "high"         : 279,
                     "stepInc"      : 9,
                     "firstLabel"   : 150,
                     "lastLabel"    : 280,
                     "labelInc"     : 130,
                     "labelDivisor" : 1,
                     "numDecimals"  : 0
                    },
        "ch-am":    {"name"         : "ch-am",
                     "low"          : 531,
                     "high"         : 1602,
                     "stepInc"      : 9,
                     "firstLabel"   : 600,
                     "lastLabel"    : 1600,
                     "labelInc"     : 100,
                     "labelDivisor" : 1,
                     "numDecimals"  : 0
                    },
        "rw5k-fm":  {"name"         : "rw5k-fm",
                     "low"          : 87500,
                     "high"         : 108000,
                     "stepInc"      : 100,
                     "firstLabel"   : 88000,
                     "lastLabel"    : 108000,
                     "labelInc"     : 2000,
                     "labelDivisor" : 1000,
                     "numDecimals"  : 1
                    },
        "rw5k-am":  {"name"         : "rw5k-am",
                     "low"          : 530,
                     "high"         : 1620,
                     "stepInc"      : 5,
                     "firstLabel"   : 600,
                     "lastLabel"    : 1600,
                     "labelInc"     : 100,
                     "labelDivisor" : 1,
                     "numDecimals"  : 0
                    },
        "rw9k-fm":  {"name"         : "rw9k-fm",
                     "low"          : 87500,
                     "high"         : 108000,
                     "stepInc"      : 50,
                     "firstLabel"   : 88000,
                     "lastLabel"    : 108000,
                     "labelInc"     : 2000,
                     "labelDivisor" : 1000,
                     "numDecimals"  : 2
                    },
        "rw9k-am":  {"name"         : "rw9k-am",
                     "low"          : 522,
                     "high"         : 1629,
                     "stepInc"      : 9,
                     "firstLabel"   : 600,
                     "lastLabel"    : 1600,
                     "labelInc"     : 100,
                     "labelDivisor" : 1,
                     "numDecimals"  : 0
                    },
        "adr-fm":    {"name"         : "adr-fm",
                     "low"          : 87500,
                     "high"         : 108000,
                     "stepInc"      : 100,
                     "firstLabel"   : 88000,
                     "lastLabel"    : 108000,
                     "labelInc"     : 2000,
                     "labelDivisor" : 1000,
                     "numDecimals"  : 1
                    },
        "adr-am":   {"name"         : "adr-am",
                     "low"          : 531,
                     "high"         : 1602,
                     "stepInc"      : 9,
                     "firstLabel"   : 600,
                     "lastLabel"    : 1600,
                     "labelInc"     : 100,
                     "labelDivisor" : 1,
                     "numDecimals"  : 0
                    },
        "rwother-fm":    
                    {"name"         : "rwother-fm",
                     "low"          : 87500,
                     "high"         : 108000,
                     "stepInc"      : 100,
                     "firstLabel"   : 88000,
                     "lastLabel"    : 108000,
                     "labelInc"     : 2000,
                     "labelDivisor" : 1000,
                     "numDecimals"  : 1
                    },
        "rwother-am(lw)":
                    {"name"         : "rwother-am(lw)",
                     "low"          : 153,
                     "high"         : 279,
                     "stepInc"      : 9,
                     "firstLabel"   : 150,
                     "lastLabel"    : 280,
                     "labelInc"     : 130,
                     "labelDivisor" : 1,
                     "numDecimals"  : 0
                    },
        "rwother-am":
                    {"name"         : "rwother-am",
                     "low"          : 531,
                     "high"         : 1602,
                     "stepInc"      : 9,
                     "firstLabel"   : 600,
                     "lastLabel"    : 1600,
                     "labelInc"     : 100,
                     "labelDivisor" : 1,
                     "numDecimals"  : 0
                    },
    };

    this._dialBands = 
    {
        "na-fm":   {"frequencyBands": [ {
                                          "band": "na-fm",
                                          "minParseAngle": -180,
                                          "maxParseAngle": 180,
                                          "minLabelAngle": -112.5,
                                          "maxLabelAngle": 112.5
                                        } ],
                     "dialStyle": "Style01"
                   },
        "na-am":   {"frequencyBands": [ {
                                          "band": "na-am",
                                          "minParseAngle": -180,
                                          "maxParseAngle": 180,
                                          "minLabelAngle": -112.5,
                                          "maxLabelAngle": 112.5
                                        } ],
                     "dialStyle": "Style01"
                   },
        "eu-fm":   {"frequencyBands": [ {
                                          "band": "eu-fm",
                                          "minParseAngle": -180,
                                          "maxParseAngle": 180,
                                          "minLabelAngle": -112.5,
                                          "maxLabelAngle": 112.5
                                        } ],
                     "dialStyle": "Style01"
                   },
        "eu-am":   {"frequencyBands": [ {
                                          "band": "eu-am(lw)",
                                          "minParseAngle": -180,
                                          "maxParseAngle": -97,
                                          "minLabelAngle": -126,
                                          "maxLabelAngle": -100
                                        },
                                        {
                                          "band": "eu-am",
                                          "minParseAngle": -97,
                                          "maxParseAngle": 180,
                                          "minLabelAngle": -80,
                                          "maxLabelAngle": 120
                                         } ],
                     "dialStyle": "Style03"
                   },
        "ja-fm":   {"frequencyBands": [ {
                                          "band": "ja-fm",
                                          "minParseAngle": -180,
                                          "maxParseAngle": 180,
                                          "minLabelAngle": -112,
                                          "maxLabelAngle": 112
                                        } ],
                     "dialStyle": "Style02"
                   },
        "ja-am":   {"frequencyBands": [ {
                                          "band": "ja-am",
                                          "minParseAngle": -180,
                                          "maxParseAngle": 180,
                                          "minLabelAngle": -112.5,
                                          "maxLabelAngle": 112.5
                                        } ],
                     "dialStyle": "Style01"
                   },
        "ch-fm":   {"frequencyBands": [ {
                                          "band": "ch-fm",
                                          "minParseAngle": -180,
                                          "maxParseAngle": 180,
                                          "minLabelAngle": -112.5,
                                          "maxLabelAngle": 112.5
                                        } ],
                     "dialStyle": "Style01"
                   },
        "ch-am":   {"frequencyBands": [ {
                                          "band": "ch-am(lw)",
                                          "minParseAngle": -180,
                                          "maxParseAngle": -97,
                                          "minLabelAngle": -126,
                                          "maxLabelAngle": -100
                                        },
                                        {
                                          "band": "ch-am",
                                          "minParseAngle": -97,
                                          "maxParseAngle": 180,
                                          "minLabelAngle": -80,
                                          "maxLabelAngle": 120
                                         } ],
                     "dialStyle": "Style03"
                   },
        "rw5k-fm": {"frequencyBands": [ {
                                          "band": "rw5k-fm",
                                          "minParseAngle": -180,
                                          "maxParseAngle": 180,
                                          "minLabelAngle": -112.5,
                                          "maxLabelAngle": 112.5
                                        } ],
                     "dialStyle": "Style01"
                   },
        "rw5k-am": {"frequencyBands": [ {
                                          "band": "rw5k-am",
                                          "minParseAngle": -180,
                                          "maxParseAngle": 180,
                                          "minLabelAngle": -112.5,
                                          "maxLabelAngle": 112.5
                                        } ],
                     "dialStyle": "Style01"
                   },
        "rw9k-fm": {"frequencyBands": [ {
                                          "band": "rw9k-fm",
                                          "minParseAngle": -180,
                                          "maxParseAngle": 180,
                                          "minLabelAngle": -112.5,
                                          "maxLabelAngle": 112.5
                                        } ],
                     "dialStyle": "Style01"
                   },
        "rw9k-am": {"frequencyBands": [ {
                                          "band": "rw9k-am",
                                          "minParseAngle": -180,
                                          "maxParseAngle": 180,
                                          "minLabelAngle": -112.5,
                                          "maxLabelAngle": 112.5
                                        } ],
                     "dialStyle": "Style01"
                   },
        "adr-fm":   {"frequencyBands": [ {
                                          "band": "adr-fm",
                                          "minParseAngle": -180,
                                          "maxParseAngle": 180,
                                          "minLabelAngle": -112.5,
                                          "maxLabelAngle": 112.5
                                        } ],
                     "dialStyle": "Style01"
                   },
        "adr-am":  {"frequencyBands": [ {
                                          "band": "adr-am",
                                          "minParseAngle": -180,
                                          "maxParseAngle": 180,
                                          "minLabelAngle": -112.5,
                                          "maxLabelAngle": 112.5
                                        } ],
                     "dialStyle": "Style01"
                   },
        "rwother-fm":   {"frequencyBands": [ {
                                          "band": "rwother-fm",
                                          "minParseAngle": -180,
                                          "maxParseAngle": 180,
                                          "minLabelAngle": -112.5,
                                          "maxLabelAngle": 112.5
                                        } ],
                     "dialStyle": "Style01"
                   },
        "rwother-am":   {"frequencyBands": [ {
                                          "band": "rwother-am(lw)",
                                          "minParseAngle": -180,
                                          "maxParseAngle": -97,
                                          "minLabelAngle": -126,
                                          "maxLabelAngle": -100
                                        },
                                        {
                                          "band": "rwother-am",
                                          "minParseAngle": -97,
                                          "maxParseAngle": 180,
                                          "minLabelAngle": -80,
                                          "maxLabelAngle": 120
                                         } ],
                     "dialStyle": "Style03"
                   },
    };
    
    // Get the currently-configured dial band data structure
    this._curDialBandData = this._dialBands[this._bandId];
    this._lastFreqBandIdx = this._curDialBandData.frequencyBands.length - 1;

    // Descriptions of the available label styles
    // NOTE:  All angles are in degrees, with 0 degrees = vertical
    this._dialStyleData =
    {
        /* "Normal" style used for most dials */
        "Style01":{"numLabels"     : 11,
                   "className"     : "Tuner4CtrlDialTickMarks11",
                  },
        /* Special style used for JA-FM frequencies */
        "Style02":{"numLabels"     : 8,
                   "className"     : "Tuner4CtrlDialTickMarks08",
                  },
        /* Special style for EU-AM frequencies (both MW & LW bands w/ gap) */
        "Style03":{"numLabels"     : 13,
                   "className"     : "Tuner4CtrlDialTickMarks13",
                  },
        /* Deprecated -- not actively used right now */
        "Style04":{"numLabels"     : 12,
                   "className"     : "Tuner4CtrlDialTickMarks12",
                  },
    };

    // Get the currently-configured label style data structure
    this._curDialStyleData = this._dialStyleData[this._curDialBandData["dialStyle"]];
    
    // Bind the callbacks once (minimize memory usage) so they're available during _createStructure()
    this._windowMouseMoveCallback = this._windowMouseMove.bind(this);
    this._windowMouseUpCallback = this._windowMouseUp.bind(this);
    this._dialMouseDownBinder = this._dialMouseDown.bind(this);
    this._redirectMousedownEventBinder = this._redirectMousedownEventHandler.bind(this);

    // We don't know what our current frequency setting is yet
    this._curFreq = undefined;

    // No known focus yet
    this._hasFocus = false;
    this._dialFocused = false;
    this._controllerActive = false;
    this._centeredBtnDown = false;
    this._centeredBtnHeld = false;
    this._centeredBtnHoldTimerId = null;

    // Cached decimal frequency and HD config object last set by the host radio application.
    // These cached values should never be changed in response to user input but only changed by
    // *public* APIs called from the host radio application.
    this._settleTimeCache = {};

    // Timer ID used to filter step change callbacks to avoid flooding the radio due to rapid controller input.
    // See also minChangeInterval.
    this._pendingStepChangeIntervalId = null;

    this._createStructure();
    parentDiv.appendChild(this.divElt);

    this._init();
}


Tuner4Ctrl.prototype._init = function()
{
    //This flag is used to set last cached value(last user input) once settle time expires.
    this._canSetAppFreq = true;   

    // Flag indicating whether a properties.selectFrequencyCallback is currently pending
    this._hasPendingCallback = false;

    // A setTimeout() ID used to temporarily delay a call to setFrequency before updaing the display
    this._pendingSetFrequencyTimeoutId = null;

    // The setInterval ID used during button-hold and used to cancel the interval when user releases the button.
    this._buttonHoldIntervalId = null;

    // Precompute information about each frequency band on the current dial
    log.debug("Precompute band data:");
    for (var i = 0; i <= this._lastFreqBandIdx; i++)
    {
        var curDialBandData = this._curDialBandData.frequencyBands[i];
        var curBandData = this._bandData[curDialBandData.band];
        curBandData.bandIdx = i;
        log.debug("Band #" + i + ":");

        // Compute the freq span for the current band
        curBandData.freqSpan = curBandData["high"] - curBandData["low"];
        curBandData.midFreqKHz = (curBandData["lastLabel"] + curBandData["firstLabel"]) / 2;
        log.debug("  freqSpan = " + curBandData.freqSpan);
        log.debug("  midFreqKHz = " + curBandData.midFreqKHz);
    
        // Compute the label span for the current band
        curBandData.labelSpan = curBandData["lastLabel"] - curBandData["firstLabel"];
        log.debug("  labelSpan = " + curBandData.freqSpan);

        var degreesPerKHz = (curDialBandData["maxLabelAngle"] - curDialBandData["minLabelAngle"]) /
                            curBandData.labelSpan;
        log.debug("  degreesPerKHz = " + degreesPerKHz);

        // Compute the minimum & maximum needle angles for the current band (to clamp needle travel).
        curBandData.minAngle = curDialBandData["minLabelAngle"] -
                                (curBandData["firstLabel"] - curBandData["low"]) * degreesPerKHz;
        curBandData.maxAngle = curDialBandData["maxLabelAngle"] +
                                (curBandData["high"] - curBandData["lastLabel"]) * degreesPerKHz;
        curBandData.angleSpan = curBandData.maxAngle - curBandData.minAngle;

        log.debug("  minAngle = " + curBandData.minAngle);
        log.debug("  maxAngle = " + curBandData.maxAngle);
        log.debug("  angleSpan = " + curBandData.angleSpan);
    
        // Compute the number of available frequencies for the current band (incl. endpoints)
        curBandData.freqCount = Math.floor(curBandData.freqSpan / curBandData["stepInc"]) + 1;
        log.debug("  freqCount = " + curBandData.freqCount);

        // Precompute the stations
        curBandData.stationFreqs = new Array();
        for (var j = 0; j < curBandData.freqCount; j++)
        {
            var normalizedFreqKHz = curBandData["stepInc"] * j;
            var stationFreq = this._freqFromKHz(curBandData["low"] + normalizedFreqKHz,
                                                curBandData);

            curBandData.stationFreqs[j] = stationFreq;
            log.debug("    " + j +
                      ": freq = " + curBandData.stationFreqs[j].kHz +
                      ", dialAngle = " + curBandData.stationFreqs[j].dialAngle);
        }
    }

    // The square of the dial's inner & outer radii (to avoid sqrt() in distance calculation on mousedown)
    this._dialData.innerRadiusSquared = this._dialData.dialInnerRadius * this._dialData.dialInnerRadius;
    this._dialData.outerRadiusSquared = this._dialData.dialOuterRadius * this._dialData.dialOuterRadius;

    // Give ourselves focus, since the framework isn't doing it right now (2013/03/22)
    this.handleControllerEvent("acceptFocusInit");

    // Set the initial frequency of the control. Intentionally call the public API setFrequency
    // to initialize this._settleTimeCache.
    if (typeof this.properties.decimalFrequency === 'number')
    {
        // Use the external setter
        this.setFrequency(this.properties.decimalFrequency,
                          this.properties.hdConfigObj);
    }
    else
    {
        // Initialize the displayed frequency to the lowest frequency in the first band.
        var bandData = this._bandData[this._curDialBandData.frequencyBands[0].band];
        var freq = this._freqFromKHz(bandData.low, bandData);
        this.setFrequency(freq.dec, 
                          this.properties.hdConfigObj);
    }
}

Tuner4Ctrl.prototype._createStructure = function()
{ 
    // create the div for control
    this.divElt = document.createElement('div');
        this.divElt.className = "Tuner4Ctrl";

    // Previous button
    var prevBtnConf = {
        "selectCallback" : this._tunePrev.bind(this),
        "appData" : "down",
        "label" : "",
        "labelId" : null,
        "subMap" : null,
        "buttonBehavior" : "shortAndHold",
        "holdStartCallback" : this._buttonHoldStart.bind(this),
        "holdStopCallback" : this._buttonHoldStop.bind(this),
        "disabledClass" : "Tuner4CtrlPrevButtonDisabled",
        "enabledClass" : "Tuner4CtrlPrevButtonEnabled",
        "focusedClass" : "Tuner4CtrlPrevButtonFocused",
        "downClass" : "Tuner4CtrlPrevButtonDown",
        "heldClass" : "Tuner4CtrlPrevButtonHeld"
    };
    this._prevFreqBtn = framework.instantiateControl(this.uiaId, this.divElt, "ButtonCtrl", prevBtnConf);
    this._prevFreqBtn.setButtonIcon("common/controls/Tuner4/images/ArrowLeft.png");

    // Next button
    var nextBtnConf = {
        "selectCallback" : this._tuneNext.bind(this),
        "appData" : "up",
        "label" : "",
        "labelId" : null,
        "subMap" : null,
        "buttonBehavior" : "shortAndHold",
        "holdStartCallback" : this._buttonHoldStart.bind(this),
        "holdStopCallback" : this._buttonHoldStop.bind(this),
        "disabledClass" : "Tuner4CtrlNextButtonDisabled",
        "enabledClass" : "Tuner4CtrlNextButtonEnabled",
        "focusedClass" : "Tuner4CtrlNextButtonFocused",
        "downClass" : "Tuner4CtrlNextButtonDown",
        "heldClass" : "Tuner4CtrlNextButtonHeld"
    };
    this._nextFreqBtn = framework.instantiateControl(this.uiaId, this.divElt, "ButtonCtrl", nextBtnConf);
    this._nextFreqBtn.setButtonIcon("common/controls/Tuner4/images/ArrowRight.png");

    // Left/back button
    var leftBtnConf = {
        "selectCallback" : this._handleLeftSelected.bind(this),
        "appData" : "left",
        "label" : "",
        "labelId" : null,
        "subMap" : null,
        "buttonBehavior" : "shortPressOnly",
        "enabledClass" : "Tuner4CtrlLeftButtonEnabled",
        "focusedClass" : "Tuner4CtrlLeftButtonFocused",
        "downClass" : "Tuner4CtrlLeftButtonDown"
    };
    this._leftBtn = framework.instantiateControl(this.uiaId, this.divElt, "ButtonCtrl", leftBtnConf);

    this._dial = document.createElement('div');
    	this._dial.className = "Tuner4CtrlBackgroundDialBg";
    	this.divElt.appendChild(this._dial);

    // Dial background
    this._dialBackground = document.createElement('div');
        this._dialBackground.className = "Tuner4CtrlDialBg";
        this._dialBackground.addEventListener("mousedown", this._redirectMousedownEventBinder, false);
        this.divElt.appendChild(this._dialBackground);

    // Tick marks
    this._dialTickMarks = document.createElement('div');
        this._dialTickMarks.className = this._curDialStyleData["className"];
        this.divElt.appendChild(this._dialTickMarks);

    // Frequency labels
    this._createFreqLabels();

/*
    // Guide lines for dial hub center point
    this.centerXGuide = document.createElement('div');
        this.centerXGuide.className = "Tuner4CtrlCenterXGuide";
        this.divElt.appendChild(this.centerXGuide);
    this.centerYGuide = document.createElement('div');
        this.centerYGuide.className = "Tuner4CtrlCenterYGuide";
        this.divElt.appendChild(this.centerYGuide);
*/

    // Current frequency display
    this._stationLabel = document.createElement('div');
        if ((this._bandId === "ch-fm") ||
            (this._bandId === "rw9k-fm"))
        {
            this._stationLabel.className = "Tuner4CtrlStationLabel5Digit";
        }
        else
        {
            this._stationLabel.className = "Tuner4CtrlStationLabel4Digit";
        }
        this.divElt.appendChild(this._stationLabel);

    // HD icon frame
    this._hdIconFrame = document.createElement('div');
    this._hdIconFrame.className = "Tuner4CtrlHidden";
        this.divElt.appendChild(this._hdIconFrame);

    // HD icon image
    this._hdIconImage = document.createElement('img');
    this._hdIconImage.className = "Tuner4CtrlHidden";
        this._hdIconFrame.appendChild(this._hdIconImage);

    // HD substation indicators
    for (var hdSubstNum = 1; hdSubstNum <= this._constants.MAX_HD_SUBSTATION_COUNT; hdSubstNum++)
    {
        this["hdSubstNum" + hdSubstNum] = document.createElement('div');
        this["hdSubstNum" + hdSubstNum].className = "Tuner4CtrlHdSubst" + hdSubstNum;
        this["hdSubstNum" + hdSubstNum].style.left = (40 + ((hdSubstNum - 1) * 18)) + "px";
        this["hdSubstNum" + hdSubstNum].innerText = "" + hdSubstNum;
        this._hdIconFrame.appendChild(this["hdSubstNum" + hdSubstNum]);
    }

    // Needle
    this._needle = document.createElement('img');
        this._needle.id = "Tuner4CtrlNeedle";
        this._needle.src = "common/controls/Tuner4/images/TunerCtrlNeedle.png";
        this._needle.className = "Tuner4CtrlNeedle";

        // MPP 08/30/2013  SW00127618
        // Because of non-square pixels, needle origin must be set based on angle
        // so we can't set it here
        //this._needle.style.OTransformOrigin = "50% " + (((this._dialData.needleHeight + this._dialData.needleImageOffset) / this._dialData.needleHeight) * 100) + "%";
        this.divElt.appendChild(this._needle);

/*
    // Needle guide line
    this._needleGuide = document.createElement('div');
        this._needleGuide.id = "Tuner4CtrlNeedleGuide";
        this._needleGuide.className = "Tuner4CtrlNeedleGuide";
        this.divElt.appendChild(this._needleGuide);
*/

    // Selection mask
    this._selectionMask = document.createElement('div');
        this._selectionMask.className = "Tuner4CtrlSelectionMask";
        this._selectionMask.addEventListener("mousedown", this._dialMouseDownBinder, false);
        this.divElt.appendChild(this._selectionMask);
}

// Create the DOM structure for the current label style (frequency labels)
Tuner4Ctrl.prototype._createFreqLabels = function()
{
    var numLabels = this._curDialStyleData["numLabels"];
    var labelIdx = 0;
    for (var i = 0; i <= this._lastFreqBandIdx; i++)
    {
        var curDialBandData = this._curDialBandData.frequencyBands[i];
        var curBandData = this._bandData[curDialBandData.band];
        var dialStyle = this._curDialBandData.dialStyle; 
        var curLabelText = curBandData["firstLabel"];
        var labelDivisor = curBandData["labelDivisor"];
        for (var bandLabelIdx = 0; (curLabelText <= curBandData["lastLabel"]) &&
                                   (labelIdx < numLabels); bandLabelIdx++, labelIdx++)
        {
            var curLabel = document.createElement('div');
    
            curLabel.className = "Tuner4Ctrl_" + dialStyle + "_FreqLabel" + (labelIdx + 1);
            curLabel.innerText = "" + (curLabelText / labelDivisor);
            this.divElt.appendChild(curLabel);
    
            curLabelText += curBandData["labelInc"];
        }
    }
}

// Generate the band ID (region/band string) used to index our hard-coded _dialBands table
Tuner4Ctrl.prototype._getBandId = function()
{
    var bandId = (this.properties.region + "-" + this.properties.band).toLowerCase();

    return bandId;
}

// Update the internal representation of the dial's frequency setting
Tuner4Ctrl.prototype._updateCurrentFrequency = function(freq)
{
    if (freq &&
        ((typeof this._curFreq === 'undefined') ||
         (this._curFreq.kHz != freq.kHz)))
    {
        this._curFreq = freq;
//        log.debug("New frequency: " + this._curFreq.kHz + " (" + this._curFreq.dialAngle + " deg)");

        this._setNeedleByFrequency(this._curFreq);
        this.setStationLabel(freq.lbl);
    }
}

// Start or clear and restart the settle time timer.
Tuner4Ctrl.prototype._startSettleTimer = function()
{
    log.debug("(re)starting settle timer");

    this._canSetAppFreq = false;
    clearTimeout(this._pendingSetFrequencyTimeoutId);
    this._pendingSetFrequencyTimeoutId = window.setTimeout((function() {            
        
        log.debug("Settle time timer expired.");
        this._pendingSetFrequencyTimeoutId = null;
        this._canSetAppFreq = true;
        var freq = this._freqFromDec(this._settleTimeCache.decimalFrequency)
        this._setFrequency(freq, this._settleTimeCache.hdConfigObj);

    }).bind(this), this.properties.settleTime);
}

/*
 * HD-related internal functions
 */

Tuner4Ctrl.prototype._updateHdSubstationStyles = function()
{
    if (this.properties.hdConfigObj)
    {
        // Scan all of the substation configurations
        for (var i = 1; i <= this._constants.MAX_HD_SUBSTATION_COUNT; i++)
        {
            // Local copy of the current substation configuration
            var hdSubst = this.properties.hdConfigObj.hdSubstList[i - 1];

            // If the substation is active while the tuner is unlocked, ...
            if ((hdSubst === "Active") &&
                this.properties.hdConfigObj.hdStatus !== "Locked")
            {
                // ... override the configuation so it appears inactive
                hdSubst = "Inactive";
            }

            // Set the class name based on the substation configuration
            switch (hdSubst)
            {
                case "Active":
                    // HD substation number is visible and highlighted
                    this["hdSubstNum" + i].className = "Tuner4CtrlHdSubst" + i + "Active";
                    break;
                case "Inactive":
                    // HD substation number is visible, but greyed out
                    this["hdSubstNum" + i].className = "Tuner4CtrlHdSubst" + i;
                    break;
                default:
                    // Anything else ("Unavailable" or "Undefined") is hidden (gap in display)
                    this["hdSubstNum" + i].className = "Tuner4CtrlHidden";
                    break;
            }
        }
    }
    else
    {
        // Scan all of the substation configurations & hide the displays
        for (var i = 1; i <= this._constants.MAX_HD_SUBSTATION_COUNT; i++)
        {
            this["hdSubstNum" + i].className = "Tuner4CtrlHidden";
        }
    }
}

Tuner4Ctrl.prototype._setHdLogoImage = function(imagePath)
{
    log.debug("_setHdLogoImage() called: " + imagePath);

    if (imagePath)
    {
        this._hdIconImage.src = imagePath;

        // Show the HD icon
        this._hdIconFrame.className = "Tuner4CtrlHdIconFrame";
        this._hdIconImage.className = "Tuner4CtrlHdIconImage";
    }
    else
    {
        // Remove any current branding image (all styles)
        this._hdIconImage.src = "";

        // Make sure we've flushed any HD substation display configuration
        this.properties.hdConfigObj = null;
        this._updateHdSubstationStyles();

        // Hide the control title icon
        this._hdIconFrame.className = "Tuner4CtrlHidden";
        this._hdIconImage.className = "Tuner4CtrlHidden";
    }
}

// Get the currently-active HD substation, or 'undefined' if none are active
// or the hdStatus is not "Locked".
Tuner4Ctrl.prototype._getActiveHdSubstation = function()
{
    log.debug("_getActiveHdSubstation():");

    var activeSubstNum = undefined;

    if (this.properties.hdConfigObj &&
        (this.properties.hdConfigObj.hdStatus === "Locked"))
    {
        // Is a preset active?
        if (this.properties.hdConfigObj.hdSubstPresetNum)
        {
            // Yes -- return it as the active HD substation
            activeSubstNum = this.properties.hdConfigObj.hdSubstPresetNum;
        }
        else
        {
            // Scan the substations, looking for an active one
            for (var i = 0; i < this._constants.MAX_HD_SUBSTATION_COUNT; i++)
            {
                if (this.properties.hdConfigObj.hdSubstList[i] === "Active")
                {
                    activeSubstNum = i + 1;
                    break;
                }
            }
        }
    }
    
    log.debug("  found active HD substation: " + activeSubstNum);

    return activeSubstNum;
}

// Given an HD substation and a direction ("up" or "down"), get the adjacent
// one (active or inactive).
// Returns: an HD substation number (1-MAX_HD_SUBSTATION_COUNT), or 'undefined'
//          if none are available in the indicated direction.
//          NOTE: if an HD preset is active, we only know about the one HD
//                substation; no adjacent substation will be available
Tuner4Ctrl.prototype._getAdjacentHdSubstation = function(substNum, direction)
{
    log.debug("_getAdjacentHdSubstation(substNum = " + substNum + ", direction = " + direction + ")");

    // Assume no adjacent HD substation is available
    var adjSubstNum = undefined;
    var inc = (direction === "up" ? 1 : -1);

    // Make sure HD is configured, there is no active preset
    // and the given substation number is valid
    if (this.properties.hdConfigObj &&
        (typeof this.properties.hdConfigObj.hdSubstPresetNum === 'undefined') &&
        (utility.toType(substNum) == 'number') &&
        (substNum >= 1) &&
        (substNum <= this._constants.MAX_HD_SUBSTATION_COUNT))
    {
        // Scan the HD substation list in the given direction (if there are 
        for (var i = substNum + inc; (i >= 1) && (i <= this._constants.MAX_HD_SUBSTATION_COUNT); i += inc)
        {
            // Skip over unavailable HD substations
            if (this.properties.hdConfigObj.hdSubstList[i - 1] != "Unavailable")
            {
                // Found an active/inactive substation -- we're done
                adjSubstNum = i;
                break;
            }
        }
    }
    
    return adjSubstNum;
}

/*
 * Internal version of setFrequency() public API, using internal frequency object
 * representation.
 */
Tuner4Ctrl.prototype._setFrequency = function(freq, hdConfigObj)
{
    log.debug("_setFrequency(" + freq.kHz + ")");

    if (this._canSetAppFreq)
    {
	    // Update the current frequency
	    this._updateCurrentFrequency(freq);
	    log.debug("_setFrequency(). Frequency set: -" + freq.kHz);            
	
	    // Configure the HD substations
	    this.setHdConfig(hdConfigObj);
	
	    // Make sure the previous frequency is set
	    this._previousFreq = this._curFreq;        
    }
}


/*
 * Touch interaction handlers (buttons, dragging, etc.)
 */
 
Tuner4Ctrl.prototype._handleLeftSelected = function(controlRef, appData, params)
{
    log.debug("_handleLeftSelected()");

    // Make sure the left/back button has the multicontroller focus
    if (this._hasFocus)
    {
        if (this._dialFocused)
        {
            // Dial has focus -- need to give it to the left/back button
            this.handleControllerEvent("left");
        }
        else
        {
            // Left/back button already has focus -- do nothing here
        }
    }

    if (typeof this.properties.backBtnSelectCallback === 'function')
    {
        // Invoke the calling application's callback (no params)
        this.properties.backBtnSelectCallback(this, this.properties.appData, null);
    }
}

Tuner4Ctrl.prototype._buttonHoldStart = function(controlRef, appData, params)
{
    if (this._buttonHoldIntervalId === null)
    {
        // Remove any HD configuration
        if (this.properties.hdConfigObj)
        {
            this._setHdStatus("Disabled");
        }

        // Prevent setFrequency during holds of tune button
        this._canSetAppFreq = false;
        clearTimeout(this._pendingSetFrequencyTimeoutId);
        
        this._invokeHoldStartCallback(true);

        var self = this;
        if (appData === "down")
        {
            self._tickDown();
            this._buttonHoldIntervalId = setInterval(function() {
                var tunerTarget = self._tickDown(); 
                self.setStationLabel(tunerTarget.freq.lbl);
            }, this.properties.holdPressInterval);
        }
        else if (appData === "up")
        {
            self._tickUp();
            this._buttonHoldIntervalId = setInterval(function() {
                var tunerTarget = self._tickUp(); 
                self.setStationLabel(tunerTarget.freq.lbl);
            }, this.properties.holdPressInterval);
        }
    }
}

Tuner4Ctrl.prototype._dragStart = function(controlRef, appData, params)
{
    // Remove any HD configuration
    if (this.properties.hdConfigObj)
    {
        this._setHdStatus("Disabled");
    }

    // We've started to drag the needle
    this._dialData["needleIsDragging"] = true;

    // Act like a hold-button start
    this._invokeHoldStartCallback(false);
}

// Guts of hold/drag handler, computing the direction & stepCounts for the app callbacks.
Tuner4Ctrl.prototype._getDragOrButtonHoldChanges = function(appData)
{
    var dragHoldChanges = new Object();

    // Compute stepCount
    var curFreq = this._curFreq;
    var prevFreq = this._previousFreq;

    if (curFreq.band.bandIdx == prevFreq.band.bandIdx)
    {
        // Change occurred entirely within a single band -- which direction?
        if (curFreq.stationIdx >= prevFreq.stationIdx)
        {
            // Up
            dragHoldChanges.direction = "up";
            dragHoldChanges.stepCount = curFreq.stationIdx - prevFreq.stationIdx;
        }
        else
        {
            // Down
            dragHoldChanges.direction = "down";
            dragHoldChanges.stepCount = prevFreq.stationIdx - curFreq.stationIdx;
        }
    }
    else if (curFreq.band.bandIdx > prevFreq.band.bandIdx)
    {
        // Up across bands
        dragHoldChanges.direction = "up";
        dragHoldChanges.stepCount = (prevFreq.band.freqCount - (prevFreq.stationIdx + 1)) +
                                    (curFreq.stationIdx + 1);
        for (var i = prevFreq.band.bandIdx + 1; i <= curFreq.band.bandIdx - 1; i++)
        {
            // Completely skipped this band -- add all of its stations
            dragHoldChanges.stepCount += this._curDialBandData.frequencyBands[i].freqCount;
        }
    }
    else
    {
        // Down across bands
        dragHoldChanges.direction = "down";
        dragHoldChanges.stepCount = (curFreq.band.freqCount - (curFreq.stationIdx + 1)) +
                                    (prevFreq.stationIdx + 1);
        for (var i = curFreq.band.bandIdx + 1; i <= prevFreq.band.bandIdx - 1; i++)
        {
            // Completely skipped this band -- add all of its stations
            dragHoldChanges.stepCount += this._curDialBandData.frequencyBands[i].freqCount;
        }
    }
    
    return dragHoldChanges;
}

Tuner4Ctrl.prototype._buttonHoldStop = function(controlRef, appData, params)
{
    if (this._buttonHoldIntervalId !== null)
    {
        // Compute stepCount
        var dragHoldChanges = this._getDragOrButtonHoldChanges(appData);

        // Notify the calling app about the hold stop
        this._invokeHoldStopCallback(dragHoldChanges.direction,
                                     dragHoldChanges.stepCount);
        
        clearInterval(this._buttonHoldIntervalId);
        this._buttonHoldIntervalId = null;
    }
}

Tuner4Ctrl.prototype._dragStop = function(controlRef, appData, params)
{
    // Remove any HD configuration
    if (this.properties.hdConfigObj)
    {
        this._setHdStatus("Disabled");
    }

    // Compute stepCount
    var dragHoldChanges = this._getDragOrButtonHoldChanges(appData);

    // We're done dragging the needle
    this._dialData["needleIsDragging"] = false;

    // Act like a hold-button stop
    this._invokeHoldStopCallback(dragHoldChanges.direction,
                                 dragHoldChanges.stepCount);
}

// Handles a user input to tune to the previous frequency.
Tuner4Ctrl.prototype._tunePrev = function(controlRef, appData, params)
{
    var tunerTarget = this._tickDown();
    this._handleStepChange("down", 1, tunerTarget);
}

Tuner4Ctrl.prototype._tickDown = function()
{
    var tunerTarget = new Object();
    var newHDSubst = undefined;

    // Make sure the dial has multicontroller focus
    if (!this._dialFocused)
    {
        this.handleControllerEvent("acceptFocusInit");
    }

    // If there's an active HD substation...
    var activeHDSubst = this._getActiveHdSubstation();
    if (activeHDSubst)
    {
        // ... try to get the next one down
        newHDSubst = this._getAdjacentHdSubstation(activeHDSubst, "down");
        if (newHDSubst)
        {
            // The next HD substation is available, so return it immediately
            // (do not modify analog frequency or needle position)
            tunerTarget.freq = this._freqFromKHz(this._curFreq.kHz,
                                                 this._curFreq.band);
            tunerTarget.hdSubstation = newHDSubst;
            return tunerTarget;
        }
        else
        {
            // We've left the range of HD substations -- turn off HD
            this._setHdStatus("Disabled");
        }
    }
    else if (this.properties.hdConfigObj)
    {
        // We're configured for HD, but nothing's active (tuner not locked or
        // no substations available -- make sure HD is disabled
        this._setHdStatus("Disabled");
    }

    // Compute the new frequency, with wrap-around (if necessary)
    var newFreq;
    var curBandData = this._curFreq.band;
    var curStationIdx = this._curFreq.stationIdx;
    if (curStationIdx > 0)
    {
        // Decrement within band
        newFreq = curBandData.stationFreqs[curStationIdx - 1];
    }
    else if (curBandData.bandIdx > 0)
    {
        // Jump to end of previous band
        curBandData = this._bandData[this._curDialBandData.frequencyBands[curBandData.bandIdx - 1].band];
        newFreq = curBandData.stationFreqs[curBandData.freqCount - 1];
    }
    else
    {
        // Wrap around to end of last band
        curBandData = this._bandData[this._curDialBandData.frequencyBands[this._lastFreqBandIdx].band];
        newFreq = curBandData.stationFreqs[curBandData.freqCount - 1];
    }

    // Update the current frequency setting
    this._updateCurrentFrequency(newFreq);

    tunerTarget.freq = newFreq;
    tunerTarget.hdSubstation = newHDSubst;
    return tunerTarget;
}

// Handles a user input to tune to the next frequency.
Tuner4Ctrl.prototype._tuneNext = function(controlRef, appData, params)
{
    var tunerTarget = this._tickUp();
    this._handleStepChange("up", 1, tunerTarget);
}

Tuner4Ctrl.prototype._tickUp = function()
{
    var tunerTarget = new Object();
    var newHDSubst = undefined;

    // Make sure the dial has multicontroller focus
    if (!this._dialFocused)
    {
        this.handleControllerEvent("acceptFocusInit");
    }

    // If there's an active HD substation...
    var activeHDSubst = this._getActiveHdSubstation();
    if (activeHDSubst)
    {
        // ... try to get the next one up
        newHDSubst = this._getAdjacentHdSubstation(activeHDSubst, "up");
        if (newHDSubst)
        {
            // The next HD substation is available, so return it immediately
            // (do not modify analog frequency or needle position)
            tunerTarget.freq = this._curFreq;
            tunerTarget.hdSubstation = newHDSubst;
            return tunerTarget;
        }
        else
        {
            // We've left the range of HD substations -- turn off HD
            this._setHdStatus("Disabled");
        }
    }
    else if (this.properties.hdConfigObj)
    {
        // We're configured for HD, but nothing's active (tuner not locked or
        // no substations available -- make sure HD is disabled
        this._setHdStatus("Disabled");
    }

    // Compute the new frequency, with wrap-around (if necessary)
    var newFreq;
    var curBandData = this._curFreq.band;
    var curStationIdx = this._curFreq.stationIdx;
    if (curStationIdx < curBandData.freqCount - 1)
    {
        // Increment within band
        newFreq = curBandData.stationFreqs[curStationIdx + 1];
    }
    else if (curBandData.bandIdx < this._lastFreqBandIdx)
    {
        // Jump to beginning of next band
        curBandData = this._bandData[this._curDialBandData.frequencyBands[curBandData.bandIdx + 1].band];
        newFreq = curBandData.stationFreqs[0];
    }
    else
    {
        // Wrap around to beginning of first band
        curBandData = this._bandData[this._curDialBandData.frequencyBands[0].band];
        newFreq = curBandData.stationFreqs[0];
    }

    // Update the current frequency setting
    this._updateCurrentFrequency(newFreq);

    tunerTarget.freq = newFreq;
    tunerTarget.hdSubstation = newHDSubst;
    return tunerTarget;
}


/*
 * Called to handle a controller or button or touch input from the user that results in a step change.
 */
Tuner4Ctrl.prototype._handleStepChange = function(direction, stepCount, tunerTarget)
{
    this._startSettleTimer();

    // Invoke the step or HD callback
    if (this.properties.hdConfigObj)
    {
        if (typeof this.properties.hdSubstationChangeCallback === 'function')
        {
            this._previousFreq = this._curFreq;

            var stepChangeInfo = {
                callbackType : "HD",
                params : { 
                    band: this._curFreq.band["name"],
                    direction: direction, 
                    frequency: this._curFreq.dec,
                    substation: tunerTarget.hdSubstation
                }
            };
            this._setActiveHdSubstation(tunerTarget.hdSubstation);
            this._queueStepChangeCallback(stepChangeInfo);
        }
    }
    else
    {
        if (typeof this.properties.stepCallback === 'function')
        {
            this._previousFreq = this._curFreq;

            var stepChangeInfo = {
                callbackType : "notHD",
                params : { 
                    band: this._curFreq.band["name"],
                    direction: direction, 
                    stepCount: stepCount, 
                    frequency: this._curFreq.dec 
                }
            };
            this._queueStepChangeCallback(stepChangeInfo);
        }
    }
}

Tuner4Ctrl.prototype._queueStepChangeCallback = function(stepChangeInfo)
{
    if (this._pendingStepChangeIntervalId === null)
    {
        this._doInvokeStepChangeCallback(stepChangeInfo);
        this._pendingStepChangeIntervalId = setInterval(this._pendingStepChangeIntervalHandler.bind(this), this.properties.minChangeInterval);
        this._pendingStepChangeInfo = null;
    }
    else
    {
        // Add stepChangeInfo to _pendingStepChangeInfo

        log.debug("Accumulate step change info: adding " + stepChangeInfo.params.direction + " " + stepChangeInfo.params.stepCount + " " + stepChangeInfo.params.frequency);
        if (this._pendingStepChangeInfo)
        {
            log.debug("  before: " + this._pendingStepChangeInfo.params.direction + " " + this._pendingStepChangeInfo.params.stepCount + " " + this._pendingStepChangeInfo.params.frequency + " " + this._pendingStepChangeInfo.params.substation);
        }
        else
        {
            log.debug("  before: null");
        }

        if (this._pendingStepChangeInfo === null)
        {
            this._pendingStepChangeInfo = stepChangeInfo;
        }
        else if (this._pendingStepChangeInfo.callbackType === stepChangeInfo.callbackType)
        {
            this._pendingStepChangeInfo.params.frequency = stepChangeInfo.params.frequency;         // It is ok that one of these
            this._pendingStepChangeInfo.params.substation = stepChangeInfo.params.substation;       // is 'undefined' here.

            if (this._pendingStepChangeInfo.params.direction === stepChangeInfo.params.direction)
            {
                this._pendingStepChangeInfo.params.stepCount += stepChangeInfo.params.stepCount;
            }
            else
            {
                this._pendingStepChangeInfo.params.stepCount -= stepChangeInfo.params.stepCount;
                if (this._pendingStepChangeInfo.params.stepCount === 0)
                {
                    this._pendingStepChangeInfo = null;
                }
                else if (this._pendingStepChangeInfo.params.stepCount < 0)
                {
                    // Flip direction
                    this._pendingStepChangeInfo.params.stepCount = Math.abs(this._pendingStepChangeInfo.params.stepCount);
                    if (this._pendingStepChangeInfo.params.direction === "up")
                    {
                        this._pendingStepChangeInfo.params.direction = "down";
                    }
                    else
                    {
                        this._pendingStepChangeInfo.params.direction = "up";
                    }
                }
            }
        }
        else // if (this._pendingStepChangeInfo.callbackType !== stepChangeInfo.callbackType)
        {
            // We have swtiched between HD to nonHD. Issue the pending step callback and start accumulating new stepChangeInfo.
            this._doInvokeStepChangeCallback(this._pendingStepChangeInfo);
            this._pendingStepChangeInfo = stepChangeInfo;
            clearInterval(this._pendingStepChangeIntervalId);
            this._pendingStepChangeIntervalId = setInterval(this._pendingStepChangeIntervalHandler.bind(this), this.properties.minChangeInterval);
        }

        if (this._pendingStepChangeInfo)
        {
            log.debug("  after : " + this._pendingStepChangeInfo.params.direction + " " + this._pendingStepChangeInfo.params.stepCount + " " + this._pendingStepChangeInfo.params.frequency + " " + this._pendingStepChangeInfo.params.substation);
        }
        else
        {
            log.debug("  after : null");
        }
    }
}

Tuner4Ctrl.prototype._doInvokeStepChangeCallback = function(stepChangeInfo)
{
    if (stepChangeInfo.callbackType === "HD")
    {
        if (typeof this.properties.hdSubstationChangeCallback === 'function')
        {
            this.properties.hdSubstationChangeCallback(this, this.properties.appData, stepChangeInfo.params);
        }
    }
    else
    {
        if (typeof this.properties.stepCallback === 'function')
        {
            this.properties.stepCallback(this, this.properties.appData, stepChangeInfo.params);
        }
    }
}

Tuner4Ctrl.prototype._invokeHoldStartCallback = function(usingButton)
{
    // Flush any pending step change callbacks now before issuing a hold/drag callback.
    if (this._pendingStepChangeIntervalId)
    {
        clearInterval(this._pendingStepChangeIntervalId);
        this._pendingStepChangeIntervalId = null;

        if (this._pendingStepChangeInfo)
        {
            this._doInvokeStepChangeCallback(this._pendingStepChangeInfo);
            this._pendingStepChangeInfo = null;
        }
    }

    if (typeof this.properties.holdStartCallback === 'function')
    {
        if (usingButton)
        {
            this._previousFreq = this._curFreq;
        }

        var params = { 
            band: this._curFreq.band["name"],
            frequency: this._curFreq.dec
        };
        this.properties.holdStartCallback(this, this.properties.appData, params);
    }
}

Tuner4Ctrl.prototype._pendingStepChangeIntervalHandler = function()
{
    if (this._pendingStepChangeInfo)
    {
        this._doInvokeStepChangeCallback(this._pendingStepChangeInfo);
        this._pendingStepChangeInfo = null;
    }
    else
    {
        clearInterval(this._pendingStepChangeIntervalId);
        this._pendingStepChangeIntervalId = null;
    }
}

Tuner4Ctrl.prototype._invokeHoldStopCallback = function(direction, stepCount)
{
    this._startSettleTimer();
    if (typeof this.properties.holdStopCallback === 'function')
    {
        this._previousFreq = this._curFreq;

        var params = { 
            band: this._curFreq.band["name"],
            direction: direction, 
            stepCount: stepCount, 
            frequency: this._curFreq.dec 
        };
        this.properties.holdStopCallback(this, this.properties.appData, params);
    }
}


/*
 * Frequency object functions
 */

// Construct a frequency object from a kHz frequency number
Tuner4Ctrl.prototype._freqFromKHz = function(freqKHz, band)
{
    var freq = new Object();

    // If we were given the frequency band, ...
    if (band)
    {
        // ... store it with the frequency
        freq.band = band;
    }
    else
    {
        // Otherwise, if there's only one frequency band on the dial, ...
        if (this._lastFreqBandIdx == 0)
        {
            // ... use it
            freq.band = this._bandData[this._curDialBandData.frequencyBands[0].band];
        }
        else
        {
            var minDistToBand = Number.MAX_VALUE;
            var closestBandData = undefined;
            
            // Otherwise, examine all of the available frequency bands
            for (var i = 0; i <= this._lastFreqBandIdx; i++)
            {
                var curDialBandData = this._curDialBandData.frequencyBands[i];
                var curBandData = this._bandData[curDialBandData.band];

                // If the given frequency is in the band's range
                if ((freqKHz >= curBandData["low"]) &&
                    (freqKHz <= curBandData["high"]))
                {
                    // Found the band -- stop looking
                    closestBandData = curBandData;
                    break;
                }
                else
                {
                    var distToBand;
                    // Measure the "distance" from the given frequency to the current band
                    if (freqKHz < curBandData["low"])
                    {
                        distToBand = curBandData["low"] - freqKHz;
                    }
                    else
                    {
                        distToBand = freqKHz - curBandData["high"];
                    }

                    // Closest so far?
                    if (distToBand < minDistToBand)
                    {
                        // Yes -- remember it
                        minDistToBand = distToBand;
                        closestBandData = curBandData;
                    }
                }
            }

            // Take the closest frequency band
            freq.band = closestBandData;
        }
    }

    // Clamp/quantize the frequency to the band
    if (freqKHz < freq.band["low"])
    {
        freq.kHz = freq.band["low"];
        freq.stationIdx = 0;
    }
    else if (freqKHz > freq.band["high"])
    {
        freq.kHz = freq.band["high"];
        freq.stationIdx = freq.band["freqCount"] - 1;
    }
    else
    {
        // Get the index of the nearest valid frequency in the band
        freq.stationIdx = Math.floor(((freqKHz - freq.band["low"]) / freq.band["stepInc"]) + 0.5);

        // Finally, get the actual frequency
        freq.kHz = freq.band["low"] + (freq.stationIdx * freq.band["stepInc"]);
    }

    // Convert the kHz frequency to decimal & string representations
    freq.dec = freq.kHz / freq.band["labelDivisor"];
    freq.lbl = freq.dec.toFixed(freq.band["numDecimals"]);

    // Get the frequency's angular position on the dial
    var normalizedFreqKHz = freq.band["stepInc"] * freq.stationIdx / freq.band.freqSpan;
    freq.dialAngle = (normalizedFreqKHz * freq.band.angleSpan) + freq.band.minAngle;

    // MPP 08/30/2013  SW00127618
    // Precompute the cosine of the angle (for non-square pixel compensation)
    var dialAngleRadians = freq.dialAngle * Math.PI / 180;
    freq.cosDialAngle = Math.cos(dialAngleRadians);
    
    return freq;
}

// Construct a frequency object from a decimal frequency number
Tuner4Ctrl.prototype._freqFromDec = function(freqDec, band)
{
    var freq = new Object();
    var freqKHz;

    // If we were given the frequency band, ...
    if (band)
    {
        // ... store it with the frequency
        freq.band = band;
    }
    else
    {
        // Otherwise, if there's only one frequency band on the dial, ...
        if (this._lastFreqBandIdx == 0)
        {
            // ... use it
            freq.band = this._bandData[this._curDialBandData.frequencyBands[0].band];
        }
        else
        {
            var minDistToBand = Number.MAX_VALUE;
            var closestBandData = undefined;
            var closestBandFreqKHz;
            
            // Otherwise, examine all of the available frequency bands
            for (var i = 0; i <= this._lastFreqBandIdx; i++)
            {
                var curDialBandData = this._curDialBandData.frequencyBands[i];
                var curBandData = this._bandData[curDialBandData.band];

                // Get intermediate kHz-frequency for band comparisons
                freqKHz = Math.floor(parseFloat(freqDec.toFixed(curBandData["numDecimals"])) *
                            curBandData["labelDivisor"]);

                // If the given frequency is in the band's range
                if ((freqKHz >= curBandData["low"]) &&
                    (freqKHz <= curBandData["high"]))
                {
                    // Found the band -- stop looking
                    closestBandData = curBandData;
                    closestBandFreqKHz = freqKHz;
                    break;
                }
                else
                {
                    var distToBand;
                    // Measure the "distance" from the given frequency to the current band
                    if (freqKHz < curBandData["low"])
                    {
                        distToBand = curBandData["low"] - freqKHz;
                    }
                    else
                    {
                        distToBand = freqKHz - curBandData["high"];
                    }

                    // Closest so far?
                    if (distToBand < minDistToBand)
                    {
                        // Yes -- remember it
                        minDistToBand = distToBand;
                        closestBandData = curBandData;
                        closestBandFreqKHz = freqKHz;
                    }
                }
            }

            // Take the closest frequency band
            freq.band = closestBandData;
            freqKHz = closestBandFreqKHz;
        }
    }

    // Convert the decimal frequency to kHz (if we haven't already)
    if (typeof freqKHz === 'undefined')
    {
        freqKHz = Math.floor(parseFloat(freqDec.toFixed(freq.band["numDecimals"])) *
                    freq.band["labelDivisor"]);
    }

    // Clamp/quantize the frequency to the band
    if (freqKHz < freq.band["low"])
    {
        freq.kHz = freq.band["low"];
        freq.stationIdx = 0;
        freq.dec = freq.kHz / freq.band["labelDivisor"];
        freq.lbl = freq.dec.toFixed(freq.band["numDecimals"]);
        log.warn("Given decimal frequency " + freqDec + " is too low for band \"" +
                 freq.band["name"] + "\" -- adjusting it to " + freq.lbl);
    }
    else if (freqKHz > freq.band["high"])
    {
        freq.kHz = freq.band["high"];
        freq.stationIdx = freq.band["freqCount"] - 1;
        freq.dec = freq.kHz / freq.band["labelDivisor"];
        freq.lbl = freq.dec.toFixed(freq.band["numDecimals"]);
        log.warn("Given decimal frequency " + freqDec + " is too high for band \"" +
                 freq.band["name"] + "\" -- adjusting it to " + freq.lbl);
    }
    else
    {
        // Get the index of the nearest valid frequency in the band
        freq.stationIdx = Math.floor(((freqKHz - freq.band["low"]) / freq.band["stepInc"]) + 0.5);

        // Finally, get the actual kHz-frequency
        freq.kHz = freq.band["low"] + (freq.stationIdx * freq.band["stepInc"]);

        // Populate the (clamped, quantized) decimal & string representations
        freq.dec = freq.kHz / freq.band["labelDivisor"];
        freq.lbl = freq.dec.toFixed(freq.band["numDecimals"]);
    }

    // Get the frequency's angular position on the dial
    var normalizedFreqKHz = freq.band["stepInc"] * freq.stationIdx / freq.band.freqSpan;
    freq.dialAngle = (normalizedFreqKHz * freq.band.angleSpan) + freq.band.minAngle;

    // MPP 08/30/2013  SW00127618
    // Precompute the cosine of the angle (for non-square pixel compensation)
    var dialAngleRadians = freq.dialAngle * Math.PI / 180;
    freq.cosDialAngle = Math.cos(dialAngleRadians);
    
    return freq;
}


/*
 * Mouse/touch interactions on the dial.
 *
 * For aesthetic reasons, most region/band dials do not label the actual endpoints of
 * their frequency ranges.  For example, North American AM spans 530-1720 kHz, but the
 * labels extend from 600-1600 kHz over 225 degrees of arc.  It is therefore necessary
 * to map the full frequency range onto the labeled arc, so we can map coordinates from
 * mouse/touch events to frequencies.
 */
 
// Handles touch/mouse down on the dial.
Tuner4Ctrl.prototype._dialMouseDown = function(evt)
{
    var dx = (evt.clientX - this._dialData.needleCenterX) / this._constants.PIXEL_ASPECT_RATIO; // Adjust for non-square pixels!
    var dy = (this._dialData.needleCenterY - evt.clientY);          // Y-axis inverted!
    var dx2dy2 = (dx * dx) + (dy * dy);

    // If we're on the circular part of the dial...
    if (dx2dy2 <= this._dialData.outerRadiusSquared)
    {
        // ... it's a legal touch -- make sure we have multicontroller focus
        if (!this._dialFocused)
        {
            this.handleControllerEvent("acceptFocusInit");
        }

        // Spin the dial if we're between the inner & outer dial boundaries
        if (dx2dy2 >= this._dialData.innerRadiusSquared)
        {
            this._updateNeedleFromMouse(dx, dy);

            // Clear settle time here and set a flag to prevent apps from updating the needle position. A new
            // settle timer will be created and again allow updates when the user releases the mouse.
            this._canSetAppFreq = false;
            clearTimeout(this._pendingSetFrequencyTimeoutId);
    
            // Start a timer to distinquish between a click and an actual drag operation.
            this._dragStartTimerId = setTimeout(this._dragStartTimerHandler.bind(this), 250);
        }
        else
        {
            // Use centered button actions if we're within the inner dial boundaries
            this._centeredBtnDownHandler();
        }

        // Install global mouse up and move handlers
        window.addEventListener('mousemove', this._windowMouseMoveCallback, false);
        window.addEventListener('mouseup', this._windowMouseUpCallback, false);
        this._mouseMoveAndUpAreBound = true;

    }
    else if (dx2dy2 > this._dialData.outerRadiusSquared)
    {
        // We're off the dial -- check to see if we need
        // to redirect the event to an underlying control
        this._redirectMousedownEventHandler(evt);
    }
}

Tuner4Ctrl.prototype._centeredBtnDownHandler = function()
{
    // show hit
    this._setHitHighlight(true);

    // start timer to check for hold
    this._centeredBtnHoldTimerId = setTimeout(this._centeredBtnHoldTimerHandler.bind(this), this.properties.centeredBtnHoldTimeout);
}

Tuner4Ctrl.prototype._dragStartTimerHandler = function()
{
    this._dragStart(this, "touch", null);
    this._dragStartTimerId = null;
}

Tuner4Ctrl.prototype._centeredBtnHoldTimerHandler = function()
{
    this._setHeldHighlight(true);
    this._centeredBtnHoldTimerId = null;
    
    if (this.properties.centeredBtnLongPressCallback)
    {
        this.properties.centeredBtnLongPressCallback(this, this.properties.appData, null);
    }
}

Tuner4Ctrl.prototype._updateNeedleFromMouse = function(dx, dy)
{
    // Since the needle is defined vertically (our dial's axis of symmetry),
    // we interchange the X & Y coordinates for the arctangent calculation.
    // This exchange, along with the sign flips on "dy" (for the inverted Y-axis),
    // makes the angles come out right.
    var angleInRadians = Math.atan2(dx, dy);
    var angleInDegrees = angleInRadians * 180 / Math.PI;

    //log.debug("updateNeedleFromMouse: dx = " + dx + ", dy = " + dy + ", angleInRadians = " + angleInRadians + ", angleInDegrees = " + angleInDegrees);

    // Now that we have the angle, set the needle position
    this._setNeedleByAngle(angleInDegrees);
}

// Front-end to setting the frequency based on an angular displacement
// (e.g. from mouse/touch).  Map the angle to the current region/band's frequency
// range, then quantize/clamp it to a legal frequency
Tuner4Ctrl.prototype._setNeedleByAngle = function(angleInDegrees)
{
    // Find the band, given the angle
    var curBandData;
    if (this._lastFreqBandIdx == 0)
    {
        // Only one band on the dial -- use it
        curBandData = this._bandData[this._curDialBandData.frequencyBands[0].band];
    }
    else
    {
        // Multiple bands on the dial -- scan them to
        // find the band whose sector holds our angle
        for (var i = 0; i <= this._lastFreqBandIdx; i++)
        {
            var curDialBandData = this._curDialBandData.frequencyBands[i];
            if ((curDialBandData.minParseAngle <= angleInDegrees) &&
                (curDialBandData.maxParseAngle >= angleInDegrees))
            {
                // Found it!
                curBandData = this._bandData[curDialBandData.band];
                break;
            }
        }
    }

    // Clamp the angle to the band's sector
    if (angleInDegrees < curBandData.minAngle) { angleInDegrees = curBandData.minAngle; }
    if (angleInDegrees > curBandData.maxAngle) { angleInDegrees = curBandData.maxAngle; }

    // Map the angle to the current region/band's frequency range
    var normalizedAngle = (angleInDegrees - curBandData.minAngle) / curBandData.angleSpan;
    var normalizedFreq = normalizedAngle * curBandData.freqSpan;

    // Get the nearest station index, based on our region/band & available step size
    var stationIdx = Math.floor((normalizedFreq / curBandData["stepInc"]) + 0.5);

    // Finally, we've got the frequency -- update our property settings
    var freq = curBandData.stationFreqs[stationIdx];
    this._updateCurrentFrequency(freq);
}

Tuner4Ctrl.prototype._setNeedleByFrequency = function(freq)
{
    if (freq)
    {
        var angleInDegrees = freq.dialAngle;
        var cosAngle = freq.cosDialAngle;
        
        // MPP 08/30/2013  SW00127618
        // Adjust needle image offset based on angle for Studio-stretched tick marks (for non-square pixels),
        // using the delta in radius between vertical & horizontal orientations
        var imgOffset = this._dialData.needleImageOffset - (this._dialData.tickMarksOuterRadiusDelta * cosAngle);
        var originY = (((this._dialData.needleHeight + imgOffset) / this._dialData.needleHeight) * 100);

        // Compute the scaled needle length required for non-square pixels.
        // Should vary from 1.0 at 0 degrees (vertical) to PIXEL_ASPECT_RATIO
        // at 90 degrees (horizontal)
        var yScale = this._constants.PIXEL_ASPECT_RATIO + ((1.0 - this._constants.PIXEL_ASPECT_RATIO) * cosAngle);
//        log.debug("Setting needle angle to " + angleInDegrees + ", imgOffset = " + imgOffset + ", originY = " + originY + ", yScale = " + yScale);

        var needle = document.getElementById('Tuner4CtrlNeedle');

        // Set the needle image's origin for rotation/scaling
        needle.style.OTransformOrigin = "50% " + originY + "%";

        // Set the needle's scale & rotation (scale first, then rotation to avoid skew)
        needle.style.OTransform = "rotate(" + angleInDegrees + "deg) scaleY(" + yScale + ")";

/*
        // Scale/rotate the needle guide line
        var needleGuide = document.getElementById('Tuner4CtrlNeedleGuide');
        needleGuide.style.OTransformOrigin = "50% " + originY + "%";
        needleGuide.style.OTransform = "rotate(" + angleInDegrees + "deg) scaleY(" + yScale + ")";
*/
    }
}

// Handles mouse move events during a touch or drag
Tuner4Ctrl.prototype._windowMouseMove = function(evt)
{
    var dx = (evt.clientX - this._dialData.needleCenterX) / this._constants.PIXEL_ASPECT_RATIO; // Adjust for non-square pixels!
    var dy = (this._dialData.needleCenterY - evt.clientY);          // Y-axis inverted!

    if (this._centeredBtnDown)
    {
        var dx2dy2 = (dx * dx) + (dy * dy);

        // Use centered button actions if we're outside the inner dial boundaries
        if (dx2dy2 >= this._dialData.innerRadiusSquared)
        {
            this._resetCenteredBtnData();
        }
    }
    else
    {
        // Spin the dial, even if we've wandered off the dial
        this._updateNeedleFromMouse(dx, dy);
    
        evt.stopPropagation();
    }
}

Tuner4Ctrl.prototype._windowMouseUp = function(evt)
{
    if (this._centeredBtnDown) 
    {
        this._centeredBtnUpHandler();
    }
    else
    {
        this._windowMouseUpHelper();
    }
}

Tuner4Ctrl.prototype._centeredBtnUpHandler = function()
{
    if (!this._centeredBtnHeld && this.properties.centeredBtnSelectCallback)
    {
        this.properties.centeredBtnSelectCallback(this, this.properties.appData, null);
    }
    this._resetCenteredBtnData();
}


Tuner4Ctrl.prototype._resetCenteredBtnData = function()
{
    this._setHitHighlight(false);
    this._setHeldHighlight(false);

    if (this._centeredBtnHoldTimerId)
    {
        clearTimeout(this._centeredBtnHoldTimerId);
        this._centeredBtnHoldTimerId = null;
    }

    // Remove global mouse up and move handlers
    window.removeEventListener('mousemove', this._windowMouseMoveCallback, false);
    window.removeEventListener('mouseup', this._windowMouseUpCallback, false);
    this._mouseMoveAndUpAreBound = false;
}
// Handles mouse up events after a touch or drag or swipe.
Tuner4Ctrl.prototype._windowMouseUpHelper = function()
{
    // Remove global mouse up and move handlers
    window.removeEventListener('mousemove', this._windowMouseMoveCallback, false);
    window.removeEventListener('mouseup', this._windowMouseUpCallback, false);
    this._mouseMoveAndUpAreBound = false;

    if (this._dragStartTimerId)
    {
        // Timer did not yet expire so interpret this user input as a click.
        clearTimeout(this._dragStartTimerId);

        // Remove any HD configuration
        if (this.properties.hdConfigObj)
        {
            this._setHdStatus("Disabled");
        }

        // Compute stepCount
        var clickChanges = this._getDragOrButtonHoldChanges();
        this._handleStepChange(clickChanges.direction, clickChanges.stepCount, null);
    }
    else
    {
        // Simulate a held-button release
        this._dragStop(this, "touch");
    }
}


/*
 * Event creation & redirection utilities
 *
 * The Studio design partially overlays the "up" and "down" buttons with the
 * frequency dial.  Because of the extents of the dial image, mouse/touch
 * events that are not actually on the circular dial, but land on top of the
 * buttons, must be redirected to those controls as if the dial wasn't there.
 * (Utility code courtesy of StackOverflow.com)
 */
Tuner4Ctrl.prototype._mouseEvent = function(type, sx, sy, cx, cy)
{
    var evt;
    var e = {
                bubbles: true,
                cancelable: (type != "mousemove"),
                view: window,
                detail: 0,
                screenX: sx,
                screenY: sy,
                clientX: cx,
                clientY: cy,
                ctrlKey: false,
                altKey: false,
                shiftKey: false,
                metaKey: false,
                button: 0,
                relatedTarget: undefined
            };

    if (typeof(document.createEvent) == "function")
    {
        evt = document.createEvent("MouseEvents");
        evt.initMouseEvent(type, e.bubbles, e.cancelable, e.view, e.detail,
                           e.screenX, e.screenY, e.clientX, e.clientY,
                           e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
                           e.button, document.body.parentNode);
    }
    else if (document.createEventObject)
    {
        evt = document.createEventObject();
        for (prop in e)
        {
            evt[prop] = e[prop];
        }
        evt.button = { 0:1, 1:4, 2:2 }[evt.button] || evt.button;
    }

    return evt;
}

Tuner4Ctrl.prototype._dispatchEvent = function(el, evt)
{
    if (el.dispatchEvent)
    {
        el.dispatchEvent(evt);
    }
    else
    {
        el.fireEvent('on' + evt.eventName, evt);
    }
    
    return evt;
}

// Event handler attached to the dial background image to redirect mouse events
// intended for the "up" and "down" buttons to those controls.
Tuner4Ctrl.prototype._redirectMousedownEventHandler = function(evt)
{
    log.debug("Mousedown event on dial background");

    // Is the click in the button area (compensating for status bar area)?
    if (((evt.clientY - 60) <= this._dialData["buttonBottomY"]) &&
        (Math.abs(evt.clientX - 400) <= this._dialData["buttonWidth"]))
    {
        if (event.initMouseEvent)
        {
            var newEvt = this._mouseEvent("mousedown", evt.screenX, evt.screenY, evt.clientX, evt.clientY);
            var targetDiv;
    
            if (newEvt.clientX > 400)
            {
                log.debug(  "    Redirecting to NEXT button");
                targetDiv = document.getElementsByClassName("Tuner4CtrlNextButtonEnabled")[0];
            }
            else
            {
                log.debug(  "    Redirecting to PREV button");
                targetDiv = document.getElementsByClassName("Tuner4CtrlPrevButtonEnabled")[0];
            }
    
            if (targetDiv)
            {
                this._dispatchEvent(targetDiv, newEvt);
            }
        }
    }
}


/*
 * Multicontroller support
 */

Tuner4Ctrl.prototype._setControllerHighlight = function(value)
{
    if (value)
    {
        this._dialBackground.classList.add("Tuner4CtrlDialBg_Focus");
    }
    else
    {
        this._dialBackground.classList.remove("Tuner4CtrlDialBg_Focus");
    }
}

Tuner4Ctrl.prototype._setHitHighlight = function(value)
{
    if (value)
    {
        this._centeredBtnDown = true;
        this._dialBackground.classList.add("Tuner4CtrlDialBg_Hit");
    }
    else
    {
        this._centeredBtnDown = false;
        this._dialBackground.classList.remove("Tuner4CtrlDialBg_Hit");
    }
}

Tuner4Ctrl.prototype._setHeldHighlight = function(value)
{
    if (value)
    {
        this._centeredBtnHeld = true;
        this._dialBackground.classList.add("Tuner4CtrlDialBg_Held");
    }
    else
    {
        this._centeredBtnHeld = false;
        this._dialBackground.classList.remove("Tuner4CtrlDialBg_Held");
    }
}

Tuner4Ctrl.prototype.handleControllerEvent = function(eventId)
{
    log.debug("handleControllerEvent " + eventId);
    
    var retCode = "ignored";

    /*
     * eventID
     * - acceptFocusInit (sent on instantiation)
     * - acceptFocusFromLeft
     * - acceptFocusFromRight
     * - acceptFocusFromtTop
     * - acceptFocusFromBottom
     * - lostFocus
     * - touchActive
     * ...
     */
    
    switch (eventId) 
    {
        case "acceptFocusInit":
        case "acceptFocusFromLeft":
        case "acceptFocusFromRight":
        case "acceptFocusFromTop":
        case "acceptFocusFromTop":
        case "acceptFocusFromBottom":
            this._hasFocus = true;
            this._dialFocused = true;
            this._setControllerHighlight(true);
            this._leftBtn.handleControllerEvent("lostFocus");
            retCode = "consumed";
            break;
        case "lostFocus":
            this._hasFocus = false;
            this._dialFocused = false;
            this._setControllerHighlight(false);
            retCode = "consumed";
            break;
        case "touchActive":
            // input mode change to touch
            this._controllerActive = false;

            // forward event to left button
            retCode = this._leftBtn.handleControllerEvent(eventId);
            break;
        case "controllerActive":
            // input mode change to multicontroller
            this._controllerActive = true;

            // forward event to left button
            retCode = this._leftBtn.handleControllerEvent(eventId);
            break;
        case "down":
            // Tilt Down
            break;
        case "cw":
            // Rotate Right (CW)
            if (this._hasFocus)
            {
                if (this._dialFocused)
                {
                    this._tuneNext();
                    retCode = "consumed";
                }
                else
                {
                    // forward event to left button
                    retCode = this._leftBtn.handleControllerEvent(eventId);
                }
            }
            break;
        case "up":
            // Tilt Up
            break;
        case "ccw":
            // Rotate Left (CCW)
            if (this._hasFocus)
            {
                if (this._dialFocused)
                {
                    this._tunePrev();
                    retCode = "consumed";
                }
                else
                {
                    // forward event to left button
                    retCode = this._leftBtn.handleControllerEvent(eventId);
                }
            }
            break;
        case "select":
            // select (released)
            if (this._hasFocus)
            {
                if (this._dialFocused)
                {
                    this._centeredBtnUpHandler();
                    retCode = "consumed";
                }
                else
                {
                    // forward event to left button
                    retCode = this._leftBtn.handleControllerEvent(eventId);
                }
            }
            break;        
        case "selectStart":
            // selectStart (press)
            if (this._hasFocus)
            {
                if (this._dialFocused)
                {
                    this._centeredBtnDownHandler();
                    retCode = "consumed";
                }
                else
                {
                    // forward event to left button
                    retCode = this._leftBtn.handleControllerEvent(eventId);
                }
            }
            break;
        case "selectHold":
        case "leftHold":
        case "rightHold":
        case "upHold":
        case "downHold":
            // Select (press down)
            if (this._hasFocus)
            {
                if (this._dialFocused)
                {
                    // Do nothing
                    retCode = "consumed";
                }
                else
                {
                    // forward event to left button
                    retCode = this._leftBtn.handleControllerEvent(eventId);
                }
            }
            break;            
        case "left":
            // Tilt Left
            if (this._hasFocus)
            {
                if (this._dialFocused)
                {
                    this._leftBtn.handleControllerEvent("acceptFocusFromRight");
                    this._dialFocused = false;
                    this._setControllerHighlight(false);
                    retCode = "consumed";
                }
                else
                {
                    // Left button has focus
                    retCode = this._leftBtn.handleControllerEvent(eventId);
                }
            }
            break;
        case "right":
            // Tilt Right
            if (this._hasFocus)
            {
                if (this._dialFocused)
                {
                    retCode = "giveFocusRight";
                }
                else
                {
                    // Left button has focus
                    this._leftBtn.handleControllerEvent("lostFocus");
                    this._dialFocused = true;
                    this._setControllerHighlight(true);
                    retCode = "consumed";
                }
            }
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
    return retCode;
}


/***************/
/* Public APIs */
/***************/

// Sets the current tuner value to the specified frequency.  Note that the control
// will use the closest legal frequency for the configured region/band.
// decimalFrequency - specified in units of kHz for AM (e.g 540) and Mhz for FM (e.g 96.9).
// hdConfigObj - OPTIONAL - specify the HD substation configuration at the given frequency
//              (see setHdConfig() API below for details).
Tuner4Ctrl.prototype.setFrequency = function(decimalFrequency, hdConfigObj)
{
    log.debug("setFrequency(" + decimalFrequency + ")");
    
    if (typeof decimalFrequency === 'number')
    {
    	this._settleTimeCache.decimalFrequency = decimalFrequency;
    	this._settleTimeCache.hdConfigObj = this.deepCopy(hdConfigObj);

        // Validate and convert decimalFrequency parameter
        // to internal frequency-object representation
        var freq = this._freqFromDec(decimalFrequency);
        
        // Call internal _setFrequency
        this._setFrequency(freq, hdConfigObj);
    }
    else
    {
        log.warn("Please call Tuner4ctrl.setFrequency() with a valid decimalFrequency number.");
    }

}

// Utility function to retrieve the current frequency & HD substation from the control.
Tuner4Ctrl.prototype.getFrequency = function()
{
    log.debug("getFrequency() called");
    
    var curFreq = new Object();
    curFreq.band = this._curFreq.band["name"];
    curFreq.frequency = this._curFreq.dec;
    curFreq.frequencyLabel = this._curFreq.lbl;
    curFreq.substation = this._getActiveHdSubstation();

    return curFreq;
}

// Sets the label shown for the tuned frequency
Tuner4Ctrl.prototype.setStationLabel = function(label)
{
    this._stationLabel.innerText = label;
}

/*
 * Fully configure the HD substation display.  This display consists of an "HD" logo
 * and up to 8 substation numbers ("1" through "8"), indicating available digital
 * audio substations.
 *
 * Arguments:
 *  hdConfigObj - An object with the following component fields:
 *      hdSubstAry - An array of substation configuration strings, one per substation,
 *                   with one of the following values:
 *                   "Active" - The currently-tuned substation.  If the HD tuner status
 *                      is "Locked", this substation will be highlighted.
 *                      NOTE: Only one substation can be active at a time.  If two
 *                            substations are marked "Active", the lower-numbered
 *                            one will be configured as "Inactive" (see below).
 *                   "Inactive" - A substation that has been detected by the HD tuner
 *                      (and is available for listening), but is not currently playing.
 *                   "Unavailable" - A substation that hasn't been detected yet by the
 *                      HD tuner.  "Unavailable" substation labels will not be displayed.
 *                      (Unrecognized configuration strings are treated as "Unavailable".)
 *
 *                   Substation [n] in the array corresponds to substation number (n+1);
 *                   displayed substation numbers are one-based (1-8).  For example: to
 *                   show substation #3 as the currently-playing substation, set
 *                   substAry[2] = "Active" in your application.
 *      hdStatus - A string indicating the status of the HD tuner's signal lock.  See
 *                   setHdStatus() below for details.
 *      hdSubstPresetNum - A substation number supplied when responding to a user's
 *                   preset selection, triggering special display handling (see
 *                   "Usage" below for details).
 *
 * Usage:
 *  Because the available subchannels are not known until the HD radio actually tunes
 *  to a particular frequency (for up to four seconds), an application should call
 *  setHdConfig() with an updated substation list whenever substations are detected or
 *  lost (e.g. due to changing reception conditions).
 *
 *  If an HD substation is tuned because of a user's preset selection, the display
 *  needs to indicate that substation's availability before it can be detected by the
 *  radio hardware. To this end, setting the "hdSubstPresetNum" will give a display
 *  consisting solely of the "HD" logo and that single substation, without the normal
 *  "gaps" for unavailable substations.  (This display is still subject to the tuner
 *  lock status rules -- see setHdStatus() below for details.)
 *
 *  It is expected that "hdSubstPresetNum" will NOT be used in later calls to
 *  setHdConfig(), once the HD tuner starts detecting substations normally (allowing
 *  multiple substations to appear, with gaps for unavailable substations).
 */
Tuner4Ctrl.prototype.setHdConfig = function(hdConfigObj)
{
    log.debug("setHdConfig() called...");

    if (hdConfigObj)
    {
        // Initialize the internal HD configuration object
        this.properties.hdConfigObj = new Object();
        this.properties.hdConfigObj.hdSubstList = new Array();

        // If we have a valid HD substation preset number, ...
        if (hdConfigObj.hdSubstPresetNum &&
            (utility.toType(hdConfigObj.hdSubstPresetNum) == 'number') &&
            (hdConfigObj.hdSubstPresetNum >= 1) &&
            (hdConfigObj.hdSubstPresetNum <= this._constants.MAX_HD_SUBSTATION_COUNT))
        {
            log.debug("  preset found: " + hdConfigObj.hdSubstPresetNum);

            // ... special initialization!
            // Set HD substation configuration for preset in first slot to "Active"
            this.properties.hdConfigObj.hdSubstList[0] = "Active";
            for (var i = 1; i < this._constants.MAX_HD_SUBSTATION_COUNT; i++)
            {
                // Other HD substations are unavailable
                this.properties.hdConfigObj.hdSubstList[i] = "Unavailable";
            }

            // Remember we've got a preset
            this.properties.hdConfigObj.hdSubstPresetNum = hdConfigObj.hdSubstPresetNum;

            // Update the displayed label to match the preset number
            this["hdSubstNum1"].innerText = "" + hdConfigObj.hdSubstPresetNum;
        }
        else if (utility.toType(hdConfigObj.hdSubstList) == 'array')
        {
            log.debug("  no preset found:");

            var activeSubstNum = null;

            // No preset defined -- initialize the HD substation configuration normally
            // Configure the first 8 substation definitions (at most)
            for (var i = 0; i < this._constants.MAX_HD_SUBSTATION_COUNT; i++)
            {
                if (hdConfigObj.hdSubstList[i] && 
                    ((hdConfigObj.hdSubstList[i] === "Active") ||
                     (hdConfigObj.hdSubstList[i] === "Inactive") ||
                     (hdConfigObj.hdSubstList[i] === "Unavailable")))
                {
                    // Copy valid configurations as-is to internal array
                    this.properties.hdConfigObj.hdSubstList[i] = hdConfigObj.hdSubstList[i];
                    if (hdConfigObj.hdSubstList[i] === "Active")
                    {
                        // Track the new active HD substation (by number, not index)
                        activeSubstNum = i + 1;
                    }
                }
                else
                {
                    // Anything else (incl. null) is unavailable
                    this.properties.hdConfigObj.hdSubstList[i] = "Unavailable";
                }
            }

            if (activeSubstNum)
            {
                // We've got an active HD substation -- set it
                this.setActiveHdSubstation(activeSubstNum);
            }    

            // Make sure the first slot's displayed label is correct
            // (if we're following a call to setHdConfig() for a preset)
            this["hdSubstNum1"].innerText = "1";
        }

        // Update the global HD tuner lock status
        // (also updates the appearance of all of the HD substation styles)
        this._setHdStatus(hdConfigObj.hdStatus);
    }

    this._settleTimeCache.hdConfigObj = this.deepCopy(this.properties.hdConfigObj);
}
 
/*
 * Update the control based on the status of the HD radio tuner.  Use this API
 * anytime the radio hardware notifies the application (via MMUI) of a change
 * in the HD tuner state.
 * Arguments:
 *  hdStatus - A string describing one of the available HD tuner states, as
 *             follows:
 *      "Locked"   - HD tuner is locked on; audio is available.  The "HD" logo
 *                   and the currently "Active" substation (if any) are
 *                   highlighted.
 *      "NoLock"   - HD tuner is searching for signal.  The "HD" logo & all
 *                   known substations are greyed out.
 *      "Disabled" - HD tuner has taken too long to lock on, or user has
 *                   turned off HD radio feature;  no digital substations are
 *                   available.  All substations and the "HD" logo disappear.
 *                   The user must re-tune radio to try again.
 *
 *  NOTE: Calling setHdStatus() with "Disabled" will purge the control's
 *        internal HD substation configuration.  You must call setHdConfig()
 *        again (with a substation list or preset number) to see the HD
 *        substation display again -- just setting the tuner status with this
 *        API will not be sufficient.
 */                                             
Tuner4Ctrl.prototype.setHdStatus = function(hdStatus)
{
    log.debug("setHdStatus(" + hdStatus + ")");

    this._setHdStatus(hdStatus);
    this._settleTimeCache.hdConfigObj = this.deepCopy(this.properties.hdConfigObj);
}

/*
 * Internal version of setHdStatus that does not update this._settleTimeCache.
 */
Tuner4Ctrl.prototype._setHdStatus = function(hdStatus)
{
    if (this.properties.hdConfigObj)
    {
        // Cache the status update
        this.properties.hdConfigObj.hdStatus = hdStatus;

        switch(this.properties.hdConfigObj.hdStatus)
        {
            case "Locked":
                // Display the enabled Airbiquity HD logo
                this._setHdLogoImage("common/controls/Tuner4/images/Logo_HD.png");
                break;

            case "NoLock":
                // Display the disabled Airbiquity HD logo
                this._setHdLogoImage("common/controls/Tuner4/images/Logo_HD_Gray.png");
                break;

            case "Disabled":
                // The HD tuner lock has timed out or been turned off --
                // discard all HD configuration information & hide everything
                this.properties.hdConfigObj = null;

                // Remove the Airbiquity HD logo & substation display
                this._setHdLogoImage();
                break;

            default:
                log.warn("setHdStatus(): invalid status \"" + hdStatus +
                         "\" received");
                break;
        }

        // Update the appearance of all of the HD substation styles
        this._updateHdSubstationStyles();
    }
}

/*
 * Utility method to set the active HD substation.  May be useful when the
 * substation configuration list hasn't changed (e.g. tune up/down).
 * Arguments:
 *  substNum - The HD substation number to activate.
 *             NOTE: Substation numbers are one-based (1-8),
 *                   not zero-based (0-7)!
 */
Tuner4Ctrl.prototype.setActiveHdSubstation = function(substNum)
{
    log.debug("setActiveHdSubstation(" + substNum + ")");

    this._setActiveHdSubstation(substNum);
    this._settleTimeCache.hdConfigObj = this.deepCopy(this.properties.hdConfigObj);
}

/*
 * Internal version of _setActiveHdSubstation that does not update this._settleTimeCache.
 */
Tuner4Ctrl.prototype._setActiveHdSubstation = function(substNum)
{
    // Make sure HD is configured & the given substation number is valid
    if (this.properties.hdConfigObj &&
        (utility.toType(substNum) == 'number') &&
        (substNum >= 1) &&
        (substNum <= this._constants.MAX_HD_SUBSTATION_COUNT))
    {
        // Is there a preset active?
        if (this.properties.hdConfigObj.hdSubstPresetNum)
        {
            // Yes -- move the preset to its rightful position
            this.properties.hdConfigObj.hdSubstList[this.properties.hdConfigObj.hdSubstPresetNum - 1] =
                this.properties.hdConfigObj.hdSubstList[0];

            // Clean up the first slot
            this.properties.hdConfigObj.hdSubstList[0] = "Unavailable";
            this["hdSubstNum1"].innerText = "1";

            // Discard the preset definition
            this.properties.hdConfigObj.hdSubstPresetNum = undefined;
        }

        for (var i = 0; i < this._constants.MAX_HD_SUBSTATION_COUNT; i++)
        {
            // Find other substation(s) that are currently active ...
            if ((substNum != (i + 1)) &&
                (this.properties.hdConfigObj.hdSubstList[i] === "Active"))
            {
                // ... and make sure they're inactive (only one active substation at a time)
                this.properties.hdConfigObj.hdSubstList[i] = "Inactive";
            }
        }

        // Set the indicated substation as active
        this.properties.hdConfigObj.hdSubstList[substNum - 1] = "Active";

        // Update the appearance of all of the HD substation styles
        this._updateHdSubstationStyles();
    }
}

Tuner4Ctrl.prototype.getContextCapture = function()
{
    var capture = {};
    capture.hasFocus = this._hasFocus;
    capture.dialFocused = this._dialFocused;
    capture.leftBtnFocused = this._leftBtn.hasFocus;
    return capture;
}

Tuner4Ctrl.prototype.restoreContext = function(capture)
{
    if (capture && capture.hasFocus)
    {
        if (capture.dialFocused)
        {
            this._dialFocused = true;
            this._setControllerHighlight(true);
        }
        else if (capture.leftBtnFocused)
        {
            this._leftBtn.handleControllerEvent("acceptFocusInit");
            this._dialFocused = false;
            this._setControllerHighlight(false);            
        }
    }
}

/*
 * Wrap utility.deepCopy to also handle null and 'undefined' 
 */
Tuner4Ctrl.prototype.deepCopy = function(obj)
{
    if (obj)
    {
        return utility.deepCopy(obj);
    }
    else
    {
        // obj is null or undefined
        return obj;
    }
}

Tuner4Ctrl.prototype.finishPartialActivity = function()
{
    if (this._mouseMoveAndUpAreBound)
    {
        if (!this._centeredBtnDown)
        {
            // A touch operation must be finished.
            this._windowMouseUpHelper();
        }
    }

    this._buttonHoldStop();    
    this._resetCenteredBtnData();

    if (this._pendingStepChangeInfo)
    {
        this._doInvokeStepChangeCallback(this._pendingStepChangeInfo);
        this._pendingStepChangeInfo = null;
        clearInterval(this._pendingStepChangeIntervalId);
    }

    if (this._pendingSetFrequencyTimeoutId)
    {
        clearTimeout(this._pendingSetFrequencyTimeoutId);
        this._pendingSetFrequencyTimeoutId = null;
    }
}

Tuner4Ctrl.prototype.cleanUp = function()
{
    log.debug("Tuner4Ctrl: cleanUp() called...");

    this._buttonHoldStop();
    this._resetCenteredBtnData();
    this._prevFreqBtn.cleanUp();
    this._nextFreqBtn.cleanUp();
    this._leftBtn.cleanUp();
}

/*
 * Register control
 */
framework.registerCtrlLoaded("Tuner4Ctrl");
