/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: ScrollDetailCtrl.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: abijweu (ujaval.bijwe@jci.com)
 Date: 13.06.2013
 __________________________________________________________________________

 Description: IHU GUI ScrollDetail Control

 Revisions:
 v0.1 (13-June-2013) Created ScrollDetail Control
 __________________________________________________________________________

 */

log.addSrcFile("ScrollDetailCtrl.js", "common");

//****************************************** ScrollDetailCtrlGlobalData ******************************************  
ScrollDetailCtrlGlobalData = {
    loadBodyScriptRequested : false,
    BODY_SCRIPT_LOAD_EVENT  : "bodyPathScriptLoaded"
}

ScrollDetailCtrlGlobalData.loadBodyScript = function (filePath, controlId)
{
    ScrollDetailCtrlGlobalData.loadBodyScriptRequested = true;
    utility.loadScript(filePath, null, ScrollDetailCtrlGlobalData._bodyScriptLoaded.bind(ScrollDetailCtrlGlobalData, filePath, controlId));
}

ScrollDetailCtrlGlobalData.unloadBodyScript = function (filePath)
{
    ScrollDetailCtrlGlobalData.loadBodyScriptRequested = false;
   
    if (window.hasOwnProperty("ScrollDetailCtrlProperties") && window["ScrollDetailCtrlProperties"] != null)
    {
        utility.removeScript(filePath);
        window["ScrollDetailCtrlProperties"] = null;
    }
}

ScrollDetailCtrlGlobalData._bodyScriptLoaded = function (filePath, controlId)
{
    var currentControl = document.getElementById(controlId);
   
    if (ScrollDetailCtrlGlobalData.loadBodyScriptRequested && currentControl)
    {
        var evt = new CustomEvent( ScrollDetailCtrlGlobalData.BODY_SCRIPT_LOAD_EVENT, { detail : { bubbles: true, cancelable: true } } );
        currentControl.dispatchEvent(evt);
    }
    else
    {
        ScrollDetailCtrlGlobalData.unloadBodyScript(filePath);
    }
}

//****************************************** ScrollDetailCtrlGlobalData ******************************************  




function ScrollDetailCtrl(uiaId, parentDiv, controlId, properties)
{

    this.uiaId = uiaId;                      // (String) Application unique id
    this.controlId = controlId;              // (String) Control unique id
    this.parentDiv = parentDiv;              // (DOM object) Parent div of the control
 
    this._scrollIndicatorWrapper = null;     // (DOM object) Control's scroll indicator wrapper
    this._scrollIndicator = null;            // (DOM object) Control's scroll indicator
    this._scrollAmount = 28;                 // (Integer) Vertical pixel amount to scroll per click (same as Body font size)

    // animation callbacks
    this._scrollerAnimationEndCallback = null;           // (Callback Function) fired when the scroller animation finishes
    this._scrollIndicatorAnimationEndCallback = null;    // (Callback Function) fired when scrollIndicator animation finishes

    // bound callback for file loading
    this._bodyScriptLoadedBound = this._bodyScriptLoaded.bind(this);

    // handlers
    this._touchHandler = null;                           // (Callback Function) fired on any mouse/touch event for touchActiveArea (use for start touch)
    this._dragHandler = null;                            // (Callback Function) fired on any mouse/touch event for document body (use for drag)

    /*
     * ---------------------------------------
     * CONTROL PRIVATE PROPERTIES
     * These change a lot during interactions
     * ---------------------------------------
     */

    this._inDrag = false;               // {Boolean} indicates whether the scrollDetail window is currently being dragged
    this._focused = false;              // {boolean} indicates whether the scrollDetail window is in focus
    this._scrollDisabled = false;       // {Boolean} indicates whether the scrolling is allowed in scrollDetail window
    this._focusRestored = false;        // {Boolean} indicates whether the focus is restored in scrollDetail window (forcefully) by framework.
    this._maskPositionY = 0;            // {Integer} position of the mask
    this._startY = 0;                   // {Integer} y position of the drag start
    this._startTime = 0;                // {Integer} when the dragging started
    this._y = 0;                        // {Integer} current position of the scrollDetailWrapper
    this._minScrollY = 0;               // {Integer} top-most position of the scrollDetailWrapper
    this._maxScrollY = 0;               // {Integer} bottom-most position of the scrollDetailWrapper
    this._trackedEvents = [];           // {Array} tracks the events
    this._lastEventTime = 0;            // {Integer} timestamp of the last handled move event (for event filtering)
    this._indicatorMin = 0;             // {Integer} top-most position of the scroll indicator
    this._indicatorMax = 0;             // {Integer} bottom-most position of the scroll indicator

    //@formatter:off
    this.properties = {
        "controlStyle"                  : "style1",        // (String) Determines the style of ScrollDetail control. Currently supported styles are "style1", "style2" and "style3".
        "scrollDetailIcn"               : null,            // (String) Path of ScrollDetail icon. Used only for style2.
        "scrollDetailTitle"             : "",              // (String) ScrollDetail Title literal string.
        "scrollDetailTitleId"           : null,            // (String) ScrollDetail Title StringId for localization.
        "scrollDetailTitleSubMap"       : null,            // (String) ScrollDetail Title subMap.
        "scrollDetailBody"              : "",              // (String) ScrollDetail body literal string.
        "scrollDetailBodyId"            : null,            // (String) ScrollDetail body StringId for localization.
        "scrollDetailBodySubMap"        : null,            // (String) ScrollDetail body subMap. Determines the scrollDetail sent by sender.
        "scrollDetailBodyPath"          : null,            // (String) Relative path to file containing a scroll detail body object.
        "showScrollIndicator"           : true,            // (Boolean) If set to false means scrollIndicator should not be shown.
        "scrollIndicatorFadeDelay"      : 1000,            // (Integer) Delay for scrollIndicator to fade out.
        "scrollIndicatorMinSize"        : 20,              // (Integer) Min size of scrollIndicator.
        "scrollIndicatorMargin"         : 0,               // (Integer) Margin of the scrollIndicator.
        "swipeThreshold"                : 300,             // (Integer) Swipe Threshold (TBD).
        "swipeAnimationDuration"        : 250,             // (Integer) Duration of swipe animation.
        "eventFilterThreshold"          : (guiConfig.debugMode) ? 0 : 50,  // (Integer) Move event filtering threshold in ms. Move events that are received quicker than this will be disregarded. Tune value for performance.
        /*
         * (Number) the friction factor (per milisecond).
         * This factor is used to precalculate the flick length. Lower numbers
         * make swipe decelerate earlier.
         * original value: 0.998
         */
        "friction"                      : 0.997,

        /*
         * (Number) minimum speed needed before the animation stop (px/ms)
         * This value is used to precalculate the flick length. Larger numbers
         * lead to shorter flicking lengths and durations
         * original value: 0.15
         */
        "minSpeed"                      : 0.15,
    };
    //@formatter:on

    for (var i in properties)
    {
        this.properties[i] = properties[i];
    }

    this._createStructure();
}

// Touch events prototype properties declarations
ScrollDetailCtrl.prototype._USER_EVENT_START = 'mousedown';
ScrollDetailCtrl.prototype._USER_EVENT_END = 'mouseup';
ScrollDetailCtrl.prototype._USER_EVENT_MOVE = 'mousemove';
ScrollDetailCtrl.prototype._USER_EVENT_OUT = 'mouseleave';


/**
 * =========================
 * INIT ROUTINE
 * Any initialization code goes here
 * TAG: internal
 * =========================
 * @return {void}
 */
ScrollDetailCtrl.prototype._init = function()
{
    this.setConfig(this.properties);

    /* ATTACH HANDLERS */
    // Primary event handlers
    // keep reference to the handler
    this._touchHandler = this._start.bind(this);

    // Handle touch events only for active area
    // start
    this._scrollDetailTouchActiveArea.addEventListener(this._USER_EVENT_START, this._touchHandler, false);
};

/**
 * Create default items for ScrollDetail control
 * All the HTML elements are created here
 * depending on scrollDetail style
 * TAG: internal
 * =========================
 * @return {void}
 */
ScrollDetailCtrl.prototype._createStructure = function()
{
    // Create the div for control
    this.divElt = document.createElement('div');
    this.divElt.className = "ScrollDetailCtrl";
    this.divElt.id = this.controlId;

    /**
     * Primary divs in control
     */
    
    // Create "background" - scrollDetail background
    this._scrollDetailBackground = document.createElement('div');
    this._scrollDetailBackground.className = "ScrollDetailCtrlBackground";
    this.divElt.appendChild(this._scrollDetailBackground);

    // Create container
    this._scrollDetailContainer = document.createElement('div');
    this._scrollDetailContainer.className = "ScrollDetailCtrlContainer";
    this.divElt.appendChild(this._scrollDetailContainer);

    // Create "Mask" - scrollDetail pane will scroll within
    this._scrollDetailMask = document.createElement('div');
    this._scrollDetailMask.className = "ScrollDetailCtrlMask";
    this._scrollDetailContainer.appendChild(this._scrollDetailMask);


    /**
     * Secondary divs (part of other divs)
     */

    /* part of _scrollDetailMask starts*/
   
    if (this.properties.showScrollIndicator)
    {
        // Wrapper
        this._scrollIndicatorWrapper = document.createElement('div');
        this._scrollIndicatorWrapper.className = "ScrollDetailCtrlScrollIndicatorWrapper";
        this._scrollDetailMask.appendChild(this._scrollIndicatorWrapper);
        // Indicator
        this._scrollIndicator = document.createElement('div');
        this._scrollIndicator.className = "ScrollDetailCtrlScrollIndicator";
        this._scrollIndicator.style.height = this.properties.scrollIndicatorMinSize + 'px';
        this._scrollIndicator.style.top = this.properties.scrollIndicatorMargin + 'px';
        this._scrollDetailMask.appendChild(this._scrollIndicator);
    }

    // Create "wrapper" - scrollDetail pane
    this._scrollDetailWrapper = document.createElement('div');
    this._scrollDetailWrapper.className = "ScrollDetailCtrlWrapper";
    this._scrollDetailMask.appendChild(this._scrollDetailWrapper);

    /* part of _scrollDetailMask ends*/ 


    // Create container contents
    this._createHeaderContents();
    this._createWrapperContents();
    


    // Create "bodyShadow"
    this._scrollDetailCtrlBodyShadow = document.createElement('div');
    this._scrollDetailCtrlBodyShadow.className = "ScrollDetailCtrlBodyShadow";
    this.divElt.appendChild(this._scrollDetailCtrlBodyShadow);

    // Create "touchActiveArea" - active touch area for scrollDetail window. Used for scroll via touch.
    // handles touch events for scrollDetail window.
    this._scrollDetailTouchActiveArea = document.createElement('div');
    this._scrollDetailTouchActiveArea.className = "ScrollDetailCtrlTouchActiveArea";
    this.divElt.appendChild(this._scrollDetailTouchActiveArea);


    this.parentDiv.appendChild(this.divElt);

    this._init();
};

/**
 * Create Header contents
 * TAG: private
 * =========================
 * @param {void}
 * @return {void}
 */
ScrollDetailCtrl.prototype._createHeaderContents = function()
{
    if (this.properties.controlStyle != "style3")
    {
        // Create Header
        this._scrollDetailHeaderBackground = document.createElement('div');
        this._scrollDetailHeaderBackground.className = "ScrollDetailCtrlHeadBack";
        
        if (this._scrollDetailMask)
        {
            this._scrollDetailContainer.insertBefore(this._scrollDetailHeaderBackground, this._scrollDetailMask);
        }
        else
        {
            this._scrollDetailContainer.appendChild(this._scrollDetailHeaderBackground);
        }
        

        // Create Title Container
        this._scrollDetailTitleContainer = document.createElement('div');
        this._scrollDetailTitleContainer.className = "ScrollDetailCtrlTitleContainer";
        this._scrollDetailHeaderBackground.appendChild(this._scrollDetailTitleContainer);

        if (this.properties.controlStyle == "style2")
        {
            // Create Icon
            this._scrollDetailIcn = document.createElement('div');
            this._scrollDetailIcn.className = "ScrollDetailCtrlIcn";
            this._scrollDetailTitleContainer.appendChild(this._scrollDetailIcn);
        }
        
        // Create Title
        this._scrollDetailTitleLine = document.createElement('div');
        this._scrollDetailTitleLine.className = "ScrollDetailCtrlTitleLine";
        this._scrollDetailTitleContainer.appendChild(this._scrollDetailTitleLine);
    }
}

/**
 * Create wrapper contents
 * TAG: private
 * =========================
 * @param {void}
 * @return {void}
 */
ScrollDetailCtrl.prototype._createWrapperContents = function()
{
     // part of _scrollDetailWrapper starts
     
    var styleSuffix = "_";
    styleSuffix = styleSuffix + this.properties.controlStyle; 

    // Create Body
    this._scrollDetailBody = document.createElement('div');
    this._scrollDetailBody.className = "ScrollDetailCtrlBody" + styleSuffix;
    this._scrollDetailWrapper.appendChild(this._scrollDetailBody);
    
    // part of _scrollDetailWrapper ends
}

/**
 * Set scrollDetail control configuration
 * All the properties of the scrollDetail control can be
 * reset and set again.
 * TAG: public
 * =========================
 * @param {Object} - properties to configure
 * @return {void}
 */
ScrollDetailCtrl.prototype.setConfig = function(config)
{
    this._cleanUpLoadedScript();
    
    // To check change in "controlStyle"
    var style = this.properties.controlStyle;

    for (var i in config)
    {
        this.properties[i] = config[i];
    }

    if (this.properties.controlStyle != style)
    {
        log.info("Value of ScrollDetail property 'controlStyle' is changed to \'" + this.properties.controlStyle + "\' through setConfig().");
        this._restructureContainer();
    }

    // Set data

    if (this._scrollDetailIcn)
    {
        this._scrollDetailIcn.style.backgroundImage = "url(" + this.properties.scrollDetailIcn + ")";
    }


    if (this._scrollDetailTitleLine)
    {
        if (this._isFieldValueValid("Title"))
        {
            if (this.properties.scrollDetailTitleId)
            {
                this.properties.scrollDetailTitle = this._getLocalizedString(this.properties.scrollDetailTitleId, this.properties.scrollDetailTitleSubMap);
            }
        }
        else
        {
            this.properties.scrollDetailTitle = "";
        }
        this._scrollDetailTitleLine.innerText = this.properties.scrollDetailTitle;
    }

    // Adjust mask height to feet within available space.
    this._scrollDetailMask.style.height = this.divElt.offsetHeight - this._scrollDetailMask.offsetTop + "px";
    if (this._scrollDetailBody)
    {
        if (this._isFieldValueValid("Body"))
        {
            if (this.properties.scrollDetailBodyPath)
            {
                this.properties.scrollDetailBody = "";
                ScrollDetailCtrlGlobalData.loadBodyScript(this.properties.scrollDetailBodyPath, this.controlId);
                this.divElt.addEventListener(ScrollDetailCtrlGlobalData.BODY_SCRIPT_LOAD_EVENT, this._bodyScriptLoadedBound, false);
            }
            else if (this.properties.scrollDetailBodyId)
            {
                this.properties.scrollDetailBody = this._getLocalizedString(this.properties.scrollDetailBodyId, this.properties.scrollDetailBodySubMap);
            }
        }
        else
        {
            this.properties.scrollDetailBody = "";
        }

        this._scrollDetailBody.innerText = this.properties.scrollDetailBody;
    
         // spacer to add at the end of body
        this._scrollDetailBodySpacer = document.createElement('div');
        this._scrollDetailBodySpacer.className = "ScrollDetailCtrlBodySpacer";
        this._scrollDetailBody.appendChild(this._scrollDetailBodySpacer);
    }

    if (!this.properties.scrollDetailBodyPath)
    {
        // Set scrollbar
        this._resetScrollDetailScroller();
        this._setScrollIndicator();
    }
    // else wait for script to be loaded
};

ScrollDetailCtrl.prototype._bodyScriptLoaded = function()
{
    if (window.hasOwnProperty("ScrollDetailCtrlProperties"))
    {
        var props = window["ScrollDetailCtrlProperties"];
        if (props.hasOwnProperty("scrollDetailBody"))
        {
            var text = props["scrollDetailBody"];
            this._scrollDetailBody.innerText = text;
            this._resetScrollDetailScroller();
            this._setScrollIndicator();
        }
    }
}

/**
 * Destroy and re-create container contents
 * TAG: private
 * =========================
 * @param {void}
 * @return {void}
 */
ScrollDetailCtrl.prototype._restructureContainer = function()
{
    // Remove header and mask and recreate them
    // Add container as a placeholder (parent div) for header and mask to preserve DOM structure when config changes


    if (this._scrollDetailBody)
    {
        // Remove body
        // Removes wrapper body
        this._scrollDetailBody.parentNode.removeChild(this._scrollDetailBody);
        this._scrollDetailBody = null;
    }
    
    if (this._scrollDetailHeaderBackground)
    {
        // Remove Header
        // Header also removes icon and title internally
        this._scrollDetailHeaderBackground.parentNode.removeChild(this._scrollDetailHeaderBackground);
        this._scrollDetailHeaderBackground = null;
    }
    
    // Re-create Header contents
    this._createHeaderContents();
    // Re-create wrapper contents
    this._createWrapperContents();
}
/**
 * Reset private data for scrollDetail Scroller
 * TAG: internal
 * =========================
 * @param {void}
 * @return {void}
 */
ScrollDetailCtrl.prototype._resetScrollDetailScroller = function()
{
    // Reset Scroll animation data.
    this._resetScrollerAnimation();
    this._resetScrollIndicatorAnimation();

    // Reset all properties for private Scroll and touch to default.
    this._inDrag = false;

    this._maskPositionY = 0;
    this._startY = 0;
    this._startTime = 0;
    this._y = 0;
    this._minScrollY = 0;
    this._maxScrollY = 0;
    this._trackedEvents = [];
    this._indicatorMin = 0;
    this._indicatorMax = 0;

    // Reset _scrollDetailWrapper's and _scrollIndicator's scroll properties.
    this._scrollDetailWrapper.style.top =  this._minScrollY + 'px';
    this._scrollIndicator.style.top = this.properties.scrollIndicatorMargin + 'px';
   
};

/**
 * Add or remove focus on scrollDetail window
 * TAG: internal
 * =========================
 * @param {boolien} - true - set, false - remove
 * @return {void}
 */
ScrollDetailCtrl.prototype._setFocus = function(focus)
{
    this._focused = focus;
    if (focus)
    {
        this._scrollDetailBackground.classList.add('focus');
    }
    else
    {
        this._resetScrollerAnimation();
        this._scrollDetailBackground.classList.remove('focus');

        if (this._scrollIndicator)
        {
            this._resetScrollIndicatorAnimation();
        }
    }
}

/**
 * Set focus helper
 * TAG: internal
 * =========================
 * @param {boolien} - true - set, false - remove
 * @return {void}
 */
ScrollDetailCtrl.prototype._setFocusHelper = function(focus)
{
    if (focus)
    {
        if (!this._focused && !this._scrollDisabled)
        {
            framework.common.stealFocus();        // steal focus
            this._setFocus(true);
        }
    }
    else
    {
        this._setFocus(false);
    }
}

/**
 * Get localization entry for a string id
 * TAG: internal
 * =========================
 * @param {String} - String id of the label
 * @param {String} - SubMap for the label
 * @return {string} - localized string
 */
ScrollDetailCtrl.prototype._getLocalizedString = function(labelId, subMap)
{
    return framework.localize.getLocStr(this.uiaId, labelId, subMap);
};

/**
 * check if provided scrollDetail fields are valid or not
 * TAG: internal
 * =========================
 * @param {String} - Type of scrollDetail fiels e.g. from, to, cc, subject, scrollDetail
 * @return {Boolean} - True if valid
 */
ScrollDetailCtrl.prototype._isFieldValueValid = function(fieldType)
{
    var valid = false;

    switch (fieldType)
    {
        case "Title":
            valid = (this.properties.scrollDetailTitle && this.properties.scrollDetailTitle != "") || (this.properties.scrollDetailTitleId && this.properties.scrollDetailTitleId != "");
            break;
        case "Body":
            valid = (this.properties.scrollDetailBody && this.properties.scrollDetailBody != "") || (this.properties.scrollDetailBodyId && this.properties.scrollDetailBodyId != "") || (this.properties.scrollDetailBodyPath);
            break;
        default:
            valid = false;
            break;
    }

    return valid;
};

/**
 * Multicontroller event handler
 * TAG: public
 * =========================
 * @param {string} - multicontroller event
 * @return {string} - event consumed state
 */
ScrollDetailCtrl.prototype.handleControllerEvent = function(eventId)
{
    var response = "ignored";

    switch(eventId)
    {
        case "acceptFocusInit":
            if (this._focusRestored || !this._scrollDisabled)
            {
                // 1. focus given with restore, not remove even if scroll is disabled
                // 2. No focus given and scroll is not disabled

                this._setFocus(true);
                response = "consumed";
            }
            else
            {
                // Bad Hack: volunterily gives focus to left button
                response = "giveFocusLeft";
            }
            break;
        case "acceptFocusFromLeft":        // intentional fallthrough. these cases have the same behavior
        case "acceptFocusFromRight":
        case "acceptFocusFromtTop":
        case "acceptFocusFromBottom":
            if (this._scrollDisabled)
            {
                // Bad Hack: volunterily gives focus to left button
                response = "giveFocusLeft";
            }
            else
            {
                this._setFocus(true);
                response = "consumed";
            }
            break;
        case "lostFocus":
            this._setFocus(false);
            response = "consumed";
            break;
        case "touchActive":
            response = "consumed";
            break;
        case "controllerActive":
            response = "consumed";
            break;
        default:
            if (this._focused)
            {
                // all events dependant on scroll enabled value
                response = this._handleControllerEventInScrollDetail(eventId);
            }
            else
            {
                response = "consumed";
            }
            break;
    }

    return response;
};

/**
 * Multicontroller event handler for scrollDetail window
 * TAG: internal
 * =========================
 * @param {string} - multicontroller event
 * @return {string} - event consumed state
 */
ScrollDetailCtrl.prototype._handleControllerEventInScrollDetail = function(eventId)
{

    var response = null;
    switch(eventId)
    {
        case "select":
            response = "consumed";
            break;
        case "cw":
            // Rotate Right (CW)
            // go down
            response = this._scrollInScrollDetail("down");
            break;
        case "ccw":
            // Rotate Left (CCW)
            // go up
            response = this._scrollInScrollDetail("up");
            break;
        case "left":
            response = "giveFocusLeft";
            break;
        case "right":
            response = "giveFocusRight";
            break;
        case "down":
            // go down
            response = this._scrollInScrollDetail("down");
            break;
        case "up":
            // go up
            response = this._scrollInScrollDetail("up");
            break;
        case "selectStart":        // intentional fallthrough. these cases have the same behavior
        case "leftStart":
        case "rightStart":
        case "downStart":
        case "upStart":
            response = "consumed";
            break;
        default:
            response = "ignored";
            break;
    }

    return response;
};

/**
 * Scroll the scrollDetail in scrollDetail window on multicontroller events
 * TAG: internal
 * =========================
 * @param {string} - direction to scroll
 * @return {string} - event consumed state
 */
ScrollDetailCtrl.prototype._scrollInScrollDetail = function(direction)
{
    var response = "consumed";

    if (this._scrollDisabled)
    {
        // No scroll if scroll is disabled 
        return;
    }

    switch(direction)
    {
        case "up":
            this._scroll(direction);
            break;
        case "down":
            this._scroll(direction);
            break;
        default:
            response = "ignored";
            break;
    }
    return response;
};


/**
 * Set the scrollIndicator for scrollDetail.
 * ScrollIndicator is used only for scrollDetailStyle email for now.
 * Not required in scrollDetailStyle sms as size is not more than 160 chars usually.
 * TAG: internal
 * =========================
 * @param {Void}
 * @return {Void}
 */
ScrollDetailCtrl.prototype._setScrollIndicator = function()
{
    if (!this.properties.showScrollIndicator)
    {
        return;
    }

    // determine scroll indicator size
    var indicatorSize = Math.round(this._scrollDetailWrapper.scrollHeight * (this._scrollDetailWrapper.scrollHeight / this._scrollDetailMask.scrollHeight));

    this._scrollIndicator.style.height = this._m.max(indicatorSize, this.properties.scrollIndicatorMinSize) + 'px';

    this._indicatorMin = this.properties.scrollIndicatorMargin;
    this._indicatorMax = this._scrollDetailMask.offsetHeight - this._scrollIndicator.offsetHeight - this.properties.scrollIndicatorMargin;

    // update _maxScrollY
    this._maxScrollY = this._scrollDetailWrapper.scrollHeight - this._scrollDetailMask.scrollHeight;

    if (this._scrollDetailWrapper.scrollHeight >= this._scrollDetailMask.scrollHeight)
    {
        this._scrollIndicator.style.opacity = 0;
        this._scrollIndicatorWrapper.style.opacity = 0;
        
        this._scrollDisabled = true;
    }
    else
    {
        this._scrollIndicator.style.opacity = 1;
        this._scrollIndicatorWrapper.style.opacity = 1;
        
        this._scrollDisabled = false;
    }
};


/**
 * Update the scrollIndicator for scrollDetail on scrollDetail drag
 * Used with no animation. ie. during drag/scroll
 * TAG: internal
 * =========================
 * @param {Void}
 * @return {Void}
 */
ScrollDetailCtrl.prototype._dragUpdateScrollIndicator = function()
{
    log.debug("_dragUpdateScrollIndicator() called...");

    if (!this.properties.showScrollIndicator)
    {
        return;
    }

    // determine scroll indicator position
    var indicatorPos = Math.round(this._indicatorMax * (this._scrollDetailWrapper.offsetTop / this._maxScrollY));

    // constrain position
    indicatorPos = this._m.max(indicatorPos, this._indicatorMin);

    // set new position
    if (this._scrollIndicator && !isNaN(indicatorPos))
    {
        this._scrollIndicator.style.top = indicatorPos + 'px';
    }
};

/**
 * Scroll by fixed amount in a requested direction
 * TAG: internal
 * =========================
 * @param {String} - Direction to scroll
 * @return {Void}
 */
ScrollDetailCtrl.prototype._scroll = function(direction)
{
    var newPos = parseInt(this._scrollDetailWrapper.style.top);            // calculate new position based on the item index

    if (isNaN(newPos))
    {
        newPos = 0;
    }

    switch (direction)
    {
        case "up":
            newPos = newPos + this._scrollAmount;
            this._performScroll(newPos);                              // do the scroll
            break;
        case "down":
            newPos = newPos - this._scrollAmount;
            this._performScroll(newPos);                              // do the scroll
            break;
        default:
            break;
    }
};

// TODO: No Swipe for multicontroller. Only scroll. Check if needed later.
/**
 * Do the actual scroll
 * TAG: internal
 * =========================
 * @param {integer} - new position of the scroller in px.
 * @return {void}
 */
ScrollDetailCtrl.prototype._performScroll = function(pos)
{
    // constrain it to scroll bounds
    pos = this._m.max(this._m.min(pos, 0), this._maxScrollY);
    // make it snappy
    this._snap(pos);
};

/**
 * Update the scrollIndicator for scrollDetail at the end of scrollDetail drag.
 * Called on scroll animation (flick or scroll ad-hoc)
 * TAG: internal
 * =========================
 * @param {integer} the new position of the scroller
 * @param {integer} the time for animation to the new position
 * @return {integer} the new scroll indicator position
 */
ScrollDetailCtrl.prototype._updateScrollIndicator = function(pos, time)
{
    log.debug("_updateScrollIndicator() called...");

    if (!this._scrollIndicator)
    {
        return;
    }

    if (!time)
    {
        time = this.properties.swipeAnimationDuration;
    }

    // determine scroll indicator new position
    var newRelativePos = pos / this._maxScrollY;
    var newPos = Math.round(newRelativePos * (this._indicatorMax - this._indicatorMin));

    // reset animation (previous, if any)
    this._resetScrollIndicatorAnimation();

    // start animation
    this._scrollIndicator.style['OTransitionDuration'] = time + 'ms';
    this._scrollIndicatorAnimationEndCallback = this._scrollIndicatorAnimationEnd.bind(this);
    this._scrollIndicator.addEventListener('OTransitionEnd', this._scrollIndicatorAnimationEndCallback, false);
    
    if (!isNaN(newPos))
    {
        this._scrollIndicator.style.top = newPos + 'px';
    }
};

/**
 * Local Math implementation
 * TAG: internal, utility
 * =========================
 */
ScrollDetailCtrl.prototype._m = {
    min : function(a, b)
    {
        return (!isNaN(a) && !isNaN(b) ) ?  // if both arguments are numbers
        a < b ? a : b                       // return the lower
        : NaN;                              // else return NaN (just like the Math class)
    },

    max : function(a, b)
    {
        return (!isNaN(a) && !isNaN(b) ) ?  // if both arguments are numbers
        a > b ? a : b                       // return the higher
        : NaN;                              // else return NaN (just like the Math class)
    },

    abs : function(a)
    {
        return (!isNaN(a) ) ?               // if the argument is a number
        a < 0 ? -a : a                      // return the abs
        : NaN;                              // else return NaN (just like the Math class)
    }
};

/**
 * =========================
 * TOUCH EVENT HANDLERS
 * - Event detection and custom event dispatching
 * - Start/Move/End/Out event handling
 * =========================
 */

/**
 * Handle any touch event for drag and dispatch appropriate
 * custom event. Actual event processing is done in the
 * respective handlers of the custom events. The original
 * event object is attached to the custom event in its
 * event property.
 * =========================
 * @param {event} - any touch event
 * @return {void}
 */
ScrollDetailCtrl.prototype._dragEventHandler = function(e)
{
    switch (e.type)
    {
        case this._USER_EVENT_MOVE :
            this._move(e);
            break;
        case this._USER_EVENT_END :
            this._end(e);
            break;
        case this._USER_EVENT_OUT :
            this._out(e);
            break;
    }
};

/**
 * Start Touch on scrollDetail
 * TAG: touch-only, internal
 * =========================
 * @param {event} - raw touch/mouse event
 * @return {void}
 */
ScrollDetailCtrl.prototype._start = function(e)
{
    /* Steal focus on touch interaction */

    // Set focus (conditional)
    this._setFocusHelper(true);

    if (this._scrollDisabled)
    {
        // No scroll if scroll is disabled 
        return;
    }

    /* Other touch interaction handling */
    // get mask position
    this._maskPositionY = this._getPosition(this._scrollDetailMask);

    // get relative mouse position
    var relativeY = e.pageY - this._maskPositionY;

    if (relativeY < 0)
    {
        return;
    }

    // get current y
    this._y = this._scrollDetailWrapper.offsetTop;
    this._startY = relativeY;
    this._startTime = new Date().getTime();

    // reset earlier tracked events if any
    this._trackedEvents = [];
    // track event
    this._trackEvent(e);

    // raise _inDrag flag
    this._inDrag = true;
    this._setDragEvents(true);
};

/**
 * Move touch on scrollDetail
 * TAG: touch-only, internal
 * =========================
 * @param {event} - raw touch/mouse event
 * @return {void}
 */
ScrollDetailCtrl.prototype._move = function(e)
{
    if (!this._inDrag)
    {
        return;
    }

    // perform event filtering
    if (this.properties.eventFilterThreshold > 0)
    {
        // skip event
        if (e.timeStamp-this._lastEventTime <= this.properties.eventFilterThreshold)
        {
            return false;
        }

        // record time
        this._lastEventTime = e.timeStamp;
    }

    // get relative mouse position
    var relativeY = e.pageY - this._maskPositionY;

    // calculate travelled distance
    var deltaY = relativeY - this._startY;

    // we have a vertical drag and the scrollDetail can be scrolled
    // calculate the scroller's new position and constrain it into bounds
    var newPos = this._m.max(this._maxScrollY, this._m.min(this._y + deltaY, this._minScrollY));

    // drag the scroller if in bounds
    this._scrollDetailWrapper.style.top = newPos + 'px';
    // update scroll indicator
    this._dragUpdateScrollIndicator();
    // track event only for vertical drag
    this._trackEvent(e);
};

/**
 * End of touch on scrollDetail
 * TAG: touch-only, internal
 * =========================
 * @param {event} - raw touch/mouse event
 * @return {void}
 */
ScrollDetailCtrl.prototype._end = function(e)
{
    if (!this._inDrag)
    {
        // this is called without having a drag
        return;
    }

    this._inDrag = false;
    this._setDragEvents(false);

    // detect swipe motion
    var endTime  = new Date().getTime();
    var velocity = endTime - this._startTime;
    if (velocity < this.properties.swipeThreshold)
    {
        // swipte detected
        this._startSwipe();
    }
    else
    {
        // regular drag -> snap to item bounds
        this._snap(this._scrollDetailWrapper.offsetTop);
    }
};

/**
 * Touch is out of bound (with respect to scrollDetail area)
 * TAG: touch-only, internal
 * =========================
 * @param {event} - raw touch/mouse event
 * @return {void}
 */
ScrollDetailCtrl.prototype._out = function(e)
{
    this._end(e);
};


/**
 * Add/remove touch events listners on document body for drag
 * TAG: touch-only, internal
 * =========================
 * @param {Boolian} - true = add, false = remove
 * @return {Void}
 */
ScrollDetailCtrl.prototype._setDragEvents = function(set)
{
    if (set)
    {
        if (!this._dragHandler)
        {
            // Primary event handlers
            // keep reference to the handler
            this._dragHandler = this._dragEventHandler.bind(this);

            // Add touch event listners
            // move
            document.body.addEventListener(this._USER_EVENT_MOVE, this._dragHandler, false);
            // end
            document.body.addEventListener(this._USER_EVENT_END, this._dragHandler, false);
            // out
            document.body.addEventListener(this._USER_EVENT_OUT, this._dragHandler, false);
        }
    }
    else
    {
        if (this._dragHandler)
        {
            // Remove touch event listners
            // move
            document.body.removeEventListener(this._USER_EVENT_MOVE, this._dragHandler, false);
            // end
            document.body.removeEventListener(this._USER_EVENT_END, this._dragHandler, false);
            // out
            document.body.removeEventListener(this._USER_EVENT_OUT, this._dragHandler, false);

            // reset the reference to the handler
            this._dragHandler = null;
        }
    }
};

/**
 * =========================
 * Other helper methods
 * =========================
 */
/**
 * Get current position of the scrollDetail
 * TAG: internal, utility
 * =========================
 * @param {HTML Element} - ScrollDetail
 * @return {Integer} - top position
 */
ScrollDetailCtrl.prototype._getPosition = function(obj)
{
    var currentTop = 0;
    if (obj.parentElement)
    {
        do {
            currentTop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return currentTop;
    }
};

/**
 * Tracks all properties needed for scrolling.
 * We're tracking only the last two events for the moment
 * TAG: touch-only, internal
 * =========================
 * @param {MouseEvent} - MouseMove event
 * @return {void}
 */
ScrollDetailCtrl.prototype._trackEvent = function(e)
{
    // use shallow copy
    var trackedEvents = this._trackedEvents;
    trackedEvents[0] = trackedEvents[1];
    trackedEvents[1] = {
        y: e.pageY,
        timeStamp: new Date().getTime()
    };
};

/**
 * Get last user touch gesture
 * TAG: touch-only, internal
 * =========================
 * @return {object}
 */
ScrollDetailCtrl.prototype._getLastMove = function()
{
    var trackedEvents = this._trackedEvents,
        event0 = trackedEvents[0],
        event1 = trackedEvents[1];
    if (!event0)
    {
        return { duration: 0, length: 0, speed: 0, direction : 1 };
    }

    var direction = (event1.y - event0.y < 0) ? -1 : 1;
    var duration = event1.timeStamp - event0.timeStamp;
    var length = this._m.abs(event1.y - event0.y);
    var speed = length / duration;

    return { duration: duration, length: length, speed: speed, direction: direction };
};

/**
 * Get swipe duration
 * TAG: touch-only, internal
 * =========================
 * @param {object}
 * @return {integer} - swipe duration in milliseconds for a given speed
 */
ScrollDetailCtrl.prototype._getSwipeDuration = function(moveSpec)
{
    /*
     * The duration is computed as follows:
     * variables:
     *      m = minimum speed before stopping = properties.minSpeed
     *      d = duration
     *      s = speed = pixelsPerMilisecond
     *      f = friction per milisecond = properties.friction
     *
     * The minimum speed is computed as follows:
     *      m = s * f ^ d
     * as the minimum speed is given and we need the duration we
     * can solve the equation for d:
     *      <=> d = log(m/s) / log(f)
     */
    var pixelsPerMilisecond = moveSpec.speed;
    var duration =  Math.log(
                        this.properties.minSpeed /
                        pixelsPerMilisecond
                    ) /
                    Math.log(this.properties.friction);
    return duration > 0 ? Math.round(duration) : 0;
};

/**
 * Get swipe distance
 * TAG: touch-only, internal
 * =========================
 * @param {object}
 * @param {integer}
 * @return {integer} - swipe duration in milliseconds for a given speed
 */
ScrollDetailCtrl.prototype._getSwipeLength = function(moveSpec, swipeDuration)
{
    /*
     * The amount of pixels to scroll is the sum of the distance covered every
     * milisecond of the flicking duration.
     * Because the distance is decelerated by the friction factor, the speed
     * at a given time t is:
     *      pixelsPerMilisecond * friction^t
     * and the distance covered is:
     *      d = distance
     *      s = initial speed = pixelsPerMilisecond
     *      t = time = duration
     *      f = friction per milisecond = properties.friction
     *
     *      d = sum of s * f^n for n between 0 and t
     *      <=> d = s * (sum of f^n for n between 0 and t)
     *  which is a geometric series and thus can be simplified to:
     *      d = s *  (1 - f^(d+1)) / (1 - f)
     */

    var initialSpeed = moveSpec.speed;
    var factor = (1 - Math.pow(this.properties.friction, swipeDuration + 1)) / (1 - this.properties.friction);

    return initialSpeed * factor * moveSpec.direction;
};

/**
 * =========================
 * ANIMATION FUNCTIONS
 * =========================
 */

/**
 * Scroller animation end callback
 * TAG: internal
 * =========================
 * @return {void}
 */
ScrollDetailCtrl.prototype._scrollerAnimationEnd = function()
{
    this._resetScrollerAnimation();
};

/**
 * Scroll indicator animation end callback
 * TAG: internal
 * =========================
 * @return {void}
 */
ScrollDetailCtrl.prototype._scrollIndicatorAnimationEnd = function()
{
    this._resetScrollIndicatorAnimation();
};

/**
 * Reset scroller animation end callback
 * TAG: internal
 * =========================
 * @return {void}
 */
ScrollDetailCtrl.prototype._resetScrollerAnimation = function()
{
    if (this._scrollerAnimationEndCallback)
    {
        this._scrollDetailWrapper.style['OTransitionDuration'] = '0ms';
        this._scrollDetailWrapper.removeEventListener('OTransitionEnd', this._scrollerAnimationEndCallback, false);
        this._scrollerAnimationEndCallback = null;
    }
};

/**
 * Reset scroll indicator animation end callback
 * TAG: internal
 * =========================
 * @return {void}
 */
ScrollDetailCtrl.prototype._resetScrollIndicatorAnimation = function()
{
    if (this._scrollIndicatorAnimationEndCallback)
    {
        this._scrollIndicator.style['OTransitionDuration'] = '0ms';
        this._scrollIndicator.removeEventListener('OTransitionEnd', this._scrollIndicatorAnimationEndCallback, false);
        this._scrollIndicatorAnimationEndCallback = null;
    }
};

/**
 * Animate the scroll
 * TAG: internal
 * =========================
 * @param {integer} - new position of the scroller in px.
 * @param {duration} - duration of the scrolling animation
 * @return {void}
 */
ScrollDetailCtrl.prototype._animateScroll = function(pos, time)
{
    if (time == undefined || time == null)
    {
        time = this.properties.swipeAnimationDuration;
    }

    // reset animation (previous, if any)
    this._resetScrollerAnimation();

    // animate scroller
    this._scrollDetailWrapper.style['OTransitionDuration'] = time + 'ms';
    this._scrollerAnimationEndCallback = this._scrollerAnimationEnd.bind(this);
    this._scrollDetailWrapper.addEventListener('OTransitionEnd', this._scrollerAnimationEndCallback, false);
    this._scrollDetailWrapper.style.top = pos + 'px';

    // update scollIndicator
    this._updateScrollIndicator(pos, time);
};

/** SNAPPING **/

/**
 * Get snap position depending on the new scroller position
 * TAG: internal
 * =========================
 * @param {integer} - new position of the scroller in px.
 * @return {integer} - position snapped to the nearest item edge
 */
ScrollDetailCtrl.prototype._getSnapPosition = function(pos)
{
    return this._scrollAmount * (Math.round(pos / this._scrollAmount));
};

/**
 * Scroll to an even snap position
 * TAG: internal
 * =========================
 * @param {integer} - new position of the scroller in px.
 * @return {void}
 */
ScrollDetailCtrl.prototype._snap = function(pos)
{
    var snapPos = this._getSnapPosition(pos);
    // start animation
    this._animateScroll(snapPos);
};

/** SWIPING AND PHYSICS **/
/**
 * Perform swipe based on physics definition
 * TAG: touch-only, internal
 * =========================
 * @return {void}
 */
ScrollDetailCtrl.prototype._startSwipe = function()
{
    // physics calculations

    var moveSpec = this._getLastMove();
    var swipeDuration = this._getSwipeDuration(moveSpec);
    var swipeLength = this._getSwipeLength(moveSpec, swipeDuration);
    var factor = swipeLength / moveSpec.length;
    var swipeVector = moveSpec.length * factor;

    // get the old position
    var oldPos = this._scrollDetailWrapper.offsetTop + swipeVector;

    /* ANIMATE THE SCROLLER */
    var newPos = this._m.min(this._m.max(oldPos, this._maxScrollY), 0);

    // make it snappy
    newPos = this._getSnapPosition(newPos);

    // start animation
    if (!isNaN(newPos)) // only if newPos is a number
    {
        this._animateScroll(newPos, swipeDuration);
    }

};


/**
 * Captures the current focus/context information of the template.
 * Called when framework switches the context from this template to another template.
 * The information will be returned in the form of a special object specific to the template.
 * This object will have all the required information to restore focus/context on template and its controls.
 * This object can be used by framework to restore back the focus/context.
 * TAG: public
 * =========================
 * @param {void}
 * @return {templateContextCapture} - object with current focus/context information of the template.
 */
ScrollDetailCtrl.prototype.getContextCapture = function()
{
    // nothing to capture
    // added for future purpose
    var scrollDetailCtrlContextObj = {
        "focused" : this._focused
    };
    return scrollDetailCtrlContextObj;
};

/**
 * Restores the control with the earlier captured focus/context information which was captured using getContextCapture() function.
 * Called when framework switches back to the previous context from the new context.
 * The information is passed in the same structured object form as returned by getContextCapture() function.
 * This object is the returned value to the last getContextCapture() function.
 * This object will have the required information to restore back to the state when getContextCapture() was called.
 * TAG: public
 * =========================
 * @param {templateContextCapture} - object with previously captured focus/context information of the control
 * @return {void}
 */
ScrollDetailCtrl.prototype.restoreContext = function(scrollDetailCtrlContextObj)
{
    if (scrollDetailCtrlContextObj.focused)
    {
        framework.common.stealFocus();        // steal focus
        this._setFocus(true);

        // to handle init focus unambiguously
        // Note: should not alter value of scrollDisabled, will have adverse effect when focus moves (e.g. to left button and back.)
        this._focusRestored = true;
    }
};

ScrollDetailCtrl.prototype._cleanUpLoadedScript = function()
{
    if (this.properties.scrollDetailBodyPath)
    {
        ScrollDetailCtrlGlobalData.unloadBodyScript(this.properties.scrollDetailBodyPath);
    }
}

ScrollDetailCtrl.prototype.cleanUp = function()
{
    log.debug("ScrollDetailCtrl.js cleanUp() called...");

    // remove touch events listners
    this._scrollDetailTouchActiveArea.removeEventListener(this._USER_EVENT_START, this._touchHandler, false);

    // reset touch events for drag
    this._setDragEvents(false);

    // remove other event listners
    this.divElt.removeEventListener(ScrollDetailCtrlGlobalData.BODY_SCRIPT_LOAD_EVENT, this._bodyScriptLoadedBound, false);

    this._scrollDetailWrapper.removeEventListener('OTransitionEnd', this._scrollerAnimationEndCallback, false);

    if (this._scrollIndicator)
    {
        this._scrollIndicator.removeEventListener('OTransitionEnd', this._scrollIndicatorAnimationEndCallback, false);
    }

    this._cleanUpLoadedScript();
};

framework.registerCtrlLoaded("ScrollDetailCtrl");

