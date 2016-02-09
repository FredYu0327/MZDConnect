/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: SbnCtrl.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: agohsmbr
 Date: 01.05.2013
 __________________________________________________________________________

 Description: IHU GUI Sbn (Status Bar Notification) Control

 Revisions:
 v0.1 (05-January-2013) Created Sbn Control
 v0.2 (10-January-2013) Updated Style05:
    - Properly parses "<<" and ">>" into &lt; and &gt;
    - Parses inline graphics passed into text3
    - Collapses left if: No icon and/or no distance
    - text3 will expand to fill and use ellipsis
 __________________________________________________________________________

 */

log.addSrcFile("SbnCtrl.js", "common");

function SbnCtrl(uiaId, parentDiv, controlId, properties)
{
    this.uiaId = uiaId;
    this.controlId = controlId;
    this.parentDiv = parentDiv;
    this.divElt = null;

    // Determinate meter
    this.scrubberX = 0;                     // Horizontal position of right edge of scrubber
    this.sliderWidth = 250;                 // Total pixel width of scrubber
    this.sliderValue = 0;                   // Slider value in non-specific units

    this.iconPath = "common/images/icons/"; // Default icon path to be used when a path is not provided

    this.inlineImages = new Array();        // Array for holding a list of any inline images
                                            // Only used by Style05

    // Audio Levels
    this.tickMarkActiveBg = "common/controls/Sbn/images/VolumeTick_En.png";
    this.tickMarkInactiveBg = "common/controls/Sbn/images/VolumeTic_Ds.png";
    this.audio01TickNum = 64;
    this.audio02TickNum = 64;

    //@formatter:off
    this.properties = {
        sbnStyle : "Style01",
        hasManeuverIcon : null,
        hasManeuverDistance : null,
        appData : null,
        imagePath1 : null,
        imagePath2 : null,
        text1 : null,
        text1Id : null,
        text1SubMap : null,
        text2 : null,
        text2Id : null,
        text2SubMap : null,
        text3 : null,
        text3Id : null,
        text3SubMap : null,
        meter : null,
        "beepTiming": null  // (String) defaults to no beep. can be "beepAtStart", "beepAtEnd", or "beepNone"
    };
    //@formatter:on

    for (var i in properties)
    {
        this.properties[i] = properties[i];
    }

    this._createStructure();
}

SbnCtrl.prototype._init = function()
{
    if (this.properties.beepTiming == "beepAtStart")
    {
        framework.common.beep("Long", "Touch");
    }

    this._updateSbn();
};

SbnCtrl.prototype._createStructure = function()
{
    // create the div for control
    this.divElt = document.createElement('div');
        this.divElt.className = "SbnCtrl";
        this.divElt.id = this.controlId;

    // imagePath1
    this.imagePath1 = document.createElement('div');
        this.divElt.appendChild(this.imagePath1);

    // imagePath2
    this.imagePath2 = document.createElement('div');
        this.divElt.appendChild(this.imagePath2);

    // text1
    this.text1 = document.createElement('div');
        this.divElt.appendChild(this.text1);

    // text2
    this.text2 = document.createElement('div');
        this.divElt.appendChild(this.text2);

    // text3
    this.text3 = document.createElement('div');
        this.divElt.appendChild(this.text3);

    // Check for Determinate/Audio Meter
    if (this.properties.meter != null)
    {
        // TODO: Style06, which used a determinate meter, has been
        // depricated. Temporarily left for backward compatibility.
        // [agohsmbr - 03.26.2012]
        if (this.properties.meter.meterType == "determinate")
        {
            // Create divs for determinate meter
            // Create meter div
            this.meter = document.createElement('div');
                this.divElt.appendChild(this.meter);

            // Create meter highlight div
            this.meterHighlight = document.createElement('div');
                this.meter.appendChild(this.meterHighlight);
        }

        // NOTE: [agohsmbr] The two different styles that use tick marks as a meter
        // now both have the same number of tick marks (a.o. 03.26.2012)
        // Leaving them as separate routines in case this changes.
        if (this.properties.meter.meterType == "audio01")
        {
            // Create divs for determinate meter
            // Create meter div
            this.meter = document.createElement('div');
                this.divElt.appendChild(this.meter);

            // Handle "tick" marks
            // NOTE: Initial positioning based on early graphics
            var tickIndex = 0;
            var tickNum = this.audio01TickNum;
            var tickSpacing = 7;
            var leftMostTick = 0;
            var leftPos = 0;

            // Generate "blank" DIVs for tick marks
            for (var i = 0;i < tickNum;i++)
            {
                leftPos = (i * tickSpacing) + leftMostTick;

                this["sbnTick_" + tickIndex] = document.createElement('div');
                    this["sbnTick_" + tickIndex].className = "SbnCtrl_Tick_Mark";
                    this.meter.appendChild(this["sbnTick_" + tickIndex]);
                    this["sbnTick_" + tickIndex].style.left = leftPos + "px";

                tickIndex++;
            }
        }

        if (this.properties.meter.meterType == "audio02")
        {
            log.debug("Creating audio02 meter...");
            // Create divs for determinate meter
            // Create meter div
            this.meter = document.createElement('div');
                this.divElt.appendChild(this.meter);

            // Handle "tick" marks
            // NOTE: Initial positioning based on early graphics
            var tickIndex = 0;
            var tickNum = this.audio02TickNum;
            var tickSpacing = 8;
            var leftMostTick = 0;
            var leftPos = 0;

            // Generate "blank" DIVs for tick marks
            for (var i = 0;i < tickNum;i++)
            {
                leftPos = (i * tickSpacing) + leftMostTick;

                this["sbnTick_" + tickIndex] = document.createElement('div');
                    this["sbnTick_" + tickIndex].className = "SbnCtrl_Tick_Mark";
                    this.meter.appendChild(this["sbnTick_" + tickIndex]);
                    this["sbnTick_" + tickIndex].style.left = leftPos + "px";

                tickIndex++;
            }
        }
    }

    // Assign classNames based on sbnStyle
    switch(this.properties.sbnStyle)
    {
        case "Style01":
            // -- Text Only Notification --
            // text1
            this.text1.className = "SbnCtrl_Style01_Text1";
            break;
        case "Style02":
            // -- Icon and Text Notification --
            // imagePath1
            this.imagePath1.className = "SbnCtrl_Style02_Image1";
            // text1
            this.text1.className = "SbnCtrl_Style02_Text1";
            break;
        case "Style03":
            // -- Audio Level --
            // imagePath1
            this.imagePath1.className = "SbnCtrl_Style03_Image1";
            // text1
            this.text1.className = "SbnCtrl_Style03_Text1";
            // imagePath2
            this.imagePath2.className = "SbnCtrl_Style03_Image2";
            // meter (audio01)
            this.meter.className = "SbnCtrl_Style03_Meter";
            break;
        case "Style04":
            // -- Mic Level --
            // imagePath1
            this.imagePath1.className = "SbnCtrl_Style04_Image1";
            // meter (audio02)
            this.meter.className = "SbnCtrl_Style04_Meter";
            break;
        case "Style05":
            // -- Navigation --
            // imagePath1
            this.imagePath1.className = "SbnCtrl_Style05_Image1";
            // text1
            this.text1.className = "SbnCtrl_Style05_Text1";
            // text2
            this.text2.className = "SbnCtrl_Style05_Text2";
            // text3
            this.text3.className = "SbnCtrl_Style05_Text3";
            break;
        case "Style06":
            // -- Text and Meter --
            // text1
            this.text1.className = "SbnCtrl_Style06_Text1";
            // meter (determinate)
            this.meter.className = "SbnCtrl_Style06_Meter";
            this.meterHighlight.className = "SbnCtrl_Style06_Meter_Highlight";
            break;
        default:
            break;
    }

    this.parentDiv.appendChild(this.divElt);

    this._init();
};

SbnCtrl.prototype._updateSbn = function()
{
    // Determine which fields/items to update
    switch(this.properties.sbnStyle)
    {
        case "Style01":
            // -- Text Only Notification --
            // text1
            this._setText1();
            break;
        case "Style02":
            // -- Icon and Text Notification --
            // imagePath1
            this._setImage1();
            // text1
            this._setText1();
            break;
        case "Style03":
            // -- Audio Level --
            // imagePath1
            this._setImage1();
            // text1
            this._setText1();
            // imagePath2
            this._setImage2();
            // meter (audio01)
            this._setMeter();
            break;
        case "Style04":
            // -- Mic Level --
            // imagePath1
            this._setImage1();
            // meter (audio02)
            this._setMeter();
            break;
        case "Style05":
            // -- Navigation --
            // imagePath1
            this._setImage1();
            // text1
            this._setText1();
            // text2
            this._setText2();
            // text3
            this._setText3();
            break;
        case "Style06":
            // -- Text and Meter --
            // text1
            this._setText1();
            // meter (determinate)
            this._setMeter();
            break;
        default:
            break;
    }
};

/*
 * Helper function. Used for styles that have only 1 or more text divs.
 */
SbnCtrl.prototype._setText1 = function()
{
    // Check for Style05
    if (this.properties.sbnStyle == "Style05" && !this.properties.hasManeuverDistance)
    {
        // Is Style05 and has no maneuver distance. Collapse div.
        this.text1.innerText = "";
    }
    else if (this.properties.sbnStyle == "Style01" || this.properties.sbnStyle == "Style02")
    {
         // For sbn style01 and style02, text concatenation support is provided.
        
         // Attempt localization for text1
        if (this.properties.text1Id)
        {
            this.properties.text1 = framework.localize.getLocStr(this.uiaId, this.properties.text1Id, this.properties.text1SubMap);
            
        }
                
        // Attempt localization for text2
        if (this.properties.text2Id)
        {
            this.properties.text2 = framework.localize.getLocStr(this.uiaId, this.properties.text2Id, this.properties.text2SubMap);
            
        }
        
        // if both text1 and text2 are not null then concatenate them with single space between them
        // else use the one which is not null
        if (this.properties.text1 && this.properties.text2) 
        {
           this.text1.innerText = this.properties.text1 + ' ' +  this.properties.text2; 
        }
        else if (this.properties.text1) 
        {
            this.text1.innerText = this.properties.text1;
        }
        else if (this.properties.text2) 
        {
            this.text1.innerText = this.properties.text2;
        }
        else 
        {
            log.info(this.uiaId, "passed both text1 and text2 as null");
        }
    }
    else
    {
        // Either not in Style05, Style01 , Style02 or hasManeuverDistance

        // Attempt localization
        if (this.properties.text1Id)
        {
            this.properties.text1 = framework.localize.getLocStr(this.uiaId, this.properties.text1Id, this.properties.text1SubMap);
            this.text1.innerText = this.properties.text1;
        }
        else if (this.properties.text1)
        {
            this.text1.innerText = this.properties.text1;
        }
    }
};

/*
 * Helper function. Used for styles that have only 2 or more text divs.
 */
SbnCtrl.prototype._setText2 = function()
{
    // Check for Style05
    if (this.properties.sbnStyle == "Style05" && !this.properties.hasManeuverDistance)
    {
        // Is Style05 and has no maneuver distance. Collapse div.
        this.text2.innerText = "";
    }
    else
    {
        // Either not in Style05 or hasManeuverDistance

        // Attempt localization
        if (this.properties.text2Id)
        {
            this.properties.text2 = framework.localize.getLocStr(this.uiaId, this.properties.text2Id, this.properties.text2SubMap);
            this.text2.innerText = this.properties.text2;
        }
        else if (this.properties.text2)
        {
            this.text2.innerText = this.properties.text2;
        }
    }
};

/*
 * Helper function. Used for styles that have only 3 or more text divs.
 */
SbnCtrl.prototype._setText3 = function()
{
    // If we are in Style05, check for inline graphic text
    var hasInlineImage = false;
    var inlineText;
    var inlineStr = "";

    // Clear any previous array values
    // Note: "typeof" doesn't work here. Using utility.toType to get correct type reporting
    if(utility.toType(this.inlineImages) == "array")
    {
        // Clear any previous indices
        this.inlineImages.length = 0;
    }

    if (this.properties.sbnStyle == "Style05" && this.properties.text3 != null && this.properties.text3 != "")
    {
        // Check for inline graphic
        // var str = "</tmp/roadshileld1.bmp>Funny Road Even </tmp/roadshield1.bmp>Funnier </tmp/roadshield2.bmp>Road Another </tmp/roadshield2.bmp>Road";
        inlineStr = this.properties.text3;

        // Replace any escaped "<" or ">" symbols with...escaped symbols
        inlineStr = inlineStr.replace(/\<\</g, "&lt;");
        inlineStr = inlineStr.replace(/\>\>/g, "&gt;");

        // Find all images and store in array
        this.inlineImages = inlineStr.match(/\<(.*?)\>/g);

        if (this.inlineImages != null)
        {
            for (var i = 0;i < this.inlineImages.length;i++){
                // Strip off '<' and '>' from array values
                this.inlineImages[i] = this.inlineImages[i].replace("<", "");
                this.inlineImages[i] = this.inlineImages[i].replace(">", "");

                // Replace inline graphic(s) in current string
                inlineStr = inlineStr.replace("<" + this.inlineImages[i] + ">","<img src='" + this.inlineImages[i] + '?' + new Date().getTime() + "' class='SbnCtrlInlineGraphic'>");
            }

            hasInlineImage = true;
        }
    }

    if (hasInlineImage)
    {
        // Contains inline graphics. Do not attempt localization
        this.text3.innerHTML = inlineStr;
    }
    else
    {
        // Attempt localization
        if (this.properties.text3Id)
        {
            this.properties.text3 = framework.localize.getLocStr(this.uiaId, this.properties.text3Id, this.properties.text3SubMap);
            this.text3.innerText = this.properties.text3;
        }
        else if (this.properties.text3)
        {
            this.text3.innerText = this.properties.text3;
        }
    }
};

SbnCtrl.prototype._setImage1 = function()
{
    // Check for Style05...
    if (this.properties.sbnStyle == "Style05" && !this.properties.hasManeuverIcon)
    {
        // Is Style05 and has no icon. Shrink to a width of zero.
        this.imagePath1.style.width = 0;
    }
    else
    {
        // Either not in Style05 or hasManeuverIcon
        this.imagePath1.style.width = 56 + "px";
    }

    if (this.properties.imagePath1)
    {
        // Get iconPath
        var iconPath = this._getIconPath(this.properties.imagePath1);

        this.imagePath1.style.backgroundImage = "url(" + iconPath + this.properties.imagePath1 + ")";
    }
};

SbnCtrl.prototype._setImage2 = function()
{
    if (this.properties.imagePath2)
    {
        // Get iconPath
        var iconPath = this._getIconPath(this.properties.imagePath2);

        this.imagePath2.style.backgroundImage = "url(" + iconPath + this.properties.imagePath2 + ")";
    }
};

SbnCtrl.prototype.setSbnConfig = function(sbnConfig)
{
    log.debug("setSbnConfig() called...");

    for (var key in sbnConfig)
    {
        if (sbnConfig[key] != null && key != "sbnStyle")
        {
            this.properties[key] = sbnConfig[key];
        }
    }

    this._updateSbn();
};

SbnCtrl.prototype._setMeter = function()
{
    switch(this.properties.meter.meterType)
    {
        case "determinate":
            this._setSliderValue(this.properties.meter.currentValue);
            break;
        case "audio01":
        case "audio02":
            this._setAudioLevel(this.properties.meter.currentValue);
            break;
        case "indeterminate":
            // NOTE: Currently unused
            log.warn("SbnCtrl: the 'indeterminate' meter style is currently not supported.");
            break;
        default:
            break;
    }
};

SbnCtrl.prototype._setAudioLevel = function(value)
{
    // Iterate over tick mark DIV's and set background
    // based on currentValue of meter.
    log.debug("_setAudioLevel() ", value);

    var tickIndex = 0;
    var tickNum;
    var numActiveTicks;

    // Check for passed value and store
    if (value != null)
    {
        // New audio level was passed
        if(this.properties.meter)
        {
            this.properties.meter.currentValue = value;
        }
        else
        {
            log.warn("SbnCtrl: received setAudioLevel value with no meter object.");
        }
    }
    else
    {
        // Assume value was set via setSbnConfig() and use those values
    }

    // NOTE: [agohsmbr] The two different styles that use tick marks as a meter
    // now both have the same number of tick marks (a.o. 03.26.2012)
    // Leaving them as separate routines in case this changes.
    if (this.properties.meter != null)
    {
        var totalAudioTravel = (this.properties.meter.max - this.properties.meter.min);

        if (this.properties.meter.meterType == "audio01")
        {
            tickNum = this.audio01TickNum;

            // Calculate threshold
            numActiveTicks = Math.round((this.properties.meter.currentValue / totalAudioTravel) * tickNum);
        }
        else if (this.properties.meter.meterType == "audio02")
        {
            tickNum = this.audio02TickNum;

            // Calculate threshold
            numActiveTicks = Math.round((this.properties.meter.currentValue / totalAudioTravel) * tickNum);
        }

        // Iterate over tick marks
        // Use threshold to conditionally set backgrounds
        for (var i = 0;i < tickNum;i++)
        {
            if((tickIndex + 1) <= numActiveTicks)
            {
                // Active
                this["sbnTick_" + tickIndex].style.backgroundImage="url(" + this.tickMarkActiveBg + ")";
            }
            else
            {
                // Inactive
                this["sbnTick_" + tickIndex].style.backgroundImage="url(" + this.tickMarkInactiveBg + ")";
            }
            tickIndex++;
        }
    }
    else
    {
        log.warn("SbnCtrl setAudioLevel() was called with no meter object.");
    }
};

SbnCtrl.prototype.setInputMode = function(mode)
{
    // NOTE: setInputMode() left only to catch any
    // errant input events sent to SbnCtrl
    log.warn("SbnCtrl should not receive input events.");
};

SbnCtrl.prototype.handleControllerEvent = function(eventId)
{
    // NOTE: handleControllerEvent() left only to catch any
    // errant multicontroller events sent to SbnCtrl
    log.warn("SbnCtrl should not receive multicontroller events.");
    return "ignored";
};

SbnCtrl.prototype._setSliderValue = function(value)
{
    // Set value
    this.sliderValue = value;

    // Update slider
    this._updateScrubber();
};

SbnCtrl.prototype._getIconPath = function(icon)
{
    var iconHasBackslashes = (/\/|\\/).test(icon);
    var iconPath = "";

    if (!iconHasBackslashes)
    {
        // Use common path
        iconPath = this.iconPath;
    }
    else
    {
        // The imageBase is specifying the path. Leave empty
    }

    return iconPath;
};

SbnCtrl.prototype._updateScrubber = function()
{
    // Determine scrubberX (in pixels) based on the value of this.sliderValue
    this.scrubberX = (this.sliderWidth * this.sliderValue) / this.properties.meter.max;

    // Check for out-of-bounds
    if (this.scrubberX > this.sliderWidth)
    {
        this.scrubberX = this.sliderWidth;
    }
    if (this.scrubberX < 0)
    {
        this.scrubberX = 0;
    }

    // Set width of progress bar
    this.meterHighlight.style.width = this.scrubberX + "px";
};

SbnCtrl.prototype.cleanUp = function()
{
    if (this.properties.beepTiming == "beepAtEnd")
    {
        framework.common.beep("Long", "Touch");
    }
};

framework.registerCtrlLoaded("SbnCtrl");
