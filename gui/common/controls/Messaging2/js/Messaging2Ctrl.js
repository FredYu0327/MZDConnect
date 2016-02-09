/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: Messaging2Ctrl.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: abijweu (ujaval.bijwe@jci.com)
 Date: 03.04.2013
 __________________________________________________________________________

 Description: IHU GUI Messaging2 Control

 Revisions:
 v0.1 (04-March-2013) Created Messaging2 Control from MessagingCtrl
    - Corrected code for "to" field
    - Added "Cc" field
    - cosmatic changes
 __________________________________________________________________________

 */

log.addSrcFile("Messaging2Ctrl.js", "common");

function Messaging2Ctrl(uiaId, parentDiv, controlId, properties)
{

    this.uiaId = uiaId;                      // (String) Application unique id
    this.controlId = controlId;              // (String) Control unique id
    this.parentDiv = parentDiv;              // (DOM object) Parent div of the control

    this._scrollIndicatorWrapper = null;     // (DOM object) Control's scroll indicator wrapper
    this._scrollIndicator = null;            // (DOM object) Control's scroll indicator
    this._scrollAmount = 28;                 // (Integer) Vertical pixel amount to scroll per click

    // animation callbacks
    this._scrollerAnimationEndCallback = null;           // (Callback Function) fired when the scroller animation finishes
    this._scrollIndicatorAnimationEndCallback = null;    // (Callback Function) fired when scrollIndicator animation finishes

    // handlers
    this._touchHandler = null;                           // (Callback Function) fired on any mouse/touch event for touchActiveArea (use for start touch)
    this._dragHandler = null;                            // (Callback Function) fired on any mouse/touch event for document body (use for drag)

    /*
     * ---------------------------------------
     * CONTROL PRIVATE PROPERTIES
     * These change a lot during interactions
     * ---------------------------------------
     */

    this._inDrag = false;           // {Boolean} indicates whether the messaging window is currently being dragged
    this._messageFocused = false;   // {boolean} indicates whether the message window is in focus
    this._maskPositionY = 0;        // {Integer} position of the mask
    this._startY = 0;               // {Integer} y position of the drag start
    this._startTime = 0;            // {Integer} when the dragging started
    this._y = 0;                    // {Integer} current position of the messageWrapper
    this._minScrollY = 0;           // {Integer} top-most position of the messageWrapper
    this._maxScrollY = 0;           // {Integer} bottom-most position of the messageWrapper
    this._trackedEvents = [];       // {Array} tracks the events
    this._lastEventTime = 0;        // {Integer} timestamp of the last handled move event (for event filtering)
    this._indicatorMin = 0;         // {Integer} top-most position of the scroll indicator
    this._indicatorMax = 0;         // {Integer} bottom-most position of the scroll indicator


    //@formatter:off
    this.properties = {
        "umpConfig"                     : null,            // (Object) Determines configuration for internal ump control instance. Please refer UMP3 control SDD for more details
        "messageStyle"                  : "email",         // (String) Determines the style of messaging control. Currently supported styles are "email" and "sms". Cannot be changed after instantiation.
        "messageTimestamp"              : "",              // (String) Timestamp to be shown above the messaging window.
        "messageSender"                 : "",              // (String) Message sender literal string. Will have senders name.
        "messageSenderId"               : null,            // (String) Message sender StringId for localization.
        "messageSenderSubMap"           : null,            // (String) Message sender subMap. Will have senders name.
        "messageSenderIcon"             : "",              // (String) Message sender Icon path.
        "messageRecipients"             : "",              // (String) Message recipients literal string. Recipients separated by comma in string.
        "messageRecipientsId"           : null,            // (String) Message recipients StringId for localization.
        "messageRecipientsSubMap"       : null,            // (String) Message recipients subMap. Determine list of recipients. Recipients separated by comma in string.
        "messageRecipientsCc"           : "",              // (String) Message carbon/courtesy Copy (Cc) recipients literal string. Recipients separated by comma in string.
        "messageRecipientsCcId"         : null,            // (String) Message carbon/courtesy Copy (Cc) recipients StringId for localization.
        "messageRecipientsCcSubMap"     : null,            // (String) Message carbon/courtesy Copy (Cc) recipients subMap. Determine list of carbon/courtesy Copy (Cc) recipients. Recipients separated by comma in string.
        "messageSubject"                : "",              // (String) Message subject literal string.
        "messageSubjectId"              : null,            // (String) Message subject StringId for localization.
        "messageSubjectSubMap"          : null,            // (String) Message subject subMap. Determines the message subject.
        "messageHasAttachments"         : false,           // (Boolean) If set to true means there are attachments to message.
        "noAttachmentSupportText"       : "",              // (String) No Attachment supported literal string.
        "noAttachmentSupportTextId"     : null,            // (String) StringId for No Attachment supported string. Used for localization.
        "noAttachmentSupportTextSubMap" : null,            // (String) SubMap for No Attachment supported.
        "noAttachmentSupportIcon"       : null,            // (String) Path for No Attachment Supported Icon.
        "catchedRestrictedSpeed"        : false,           // (Boolean) If set to true means vehicle speed reached restricted limit.
        "speedRestrictionMsg"           : "",              // (String) Restricted Speed Message literal string.
        "speedRestrictionMsgId"         : null,            // (String) StringId for Restricted Speed Message . Used for localization.
        "speedRestrictionMsgSubMap"     : null,            // (String) SubMap for Restricted Speed Message.
        "messageBody"                   : "",              // (String) Message body literal string.
        "messageBodyId"                 : null,            // (String) Message body StringId for localization.
        "messageBodySubMap"             : null,            // (String) Message body subMap. Determines the message sent by sender.
        "showScrollIndicator"           : true,            // (Boolean) If set to false means scrollIndicator should not be shown.
        "scrollIndicatorFadeDelay"      : 1000,            // (Integer) Delay for scrollIndicator to fade out.
        "scrollIndicatorMinSize"        : 20,              // (Integer) Min size of scrollIndicator.
        "scrollIndicatorMargin"         : 0,               // (Integer) Margin of the scrollIndicator.
        "swipeThreshold"                : 300,             // (Integer) Swipe Threshold (TBD).
        "swipeAnimationDuration"        : 250,             // (Integer) Duration of swipe animation.
        "eventFilterThreshold"          : (guiConfig.debugMode) ? 0 : 50,  // (Integer) Move event filtering threshold in ms. Move events that are received quicker than this will be disregarded. Tune value for performance.
        /*
         * (Integer) the friction factor (per milisecond).
         * This factor is used to precalculate the flick length. Lower numbers
         * make swipe decelerate earlier.
         * original value: 0.998
         */
        "friction"                      : 0.997,

        /*
         * (Integer) minimum speed needed before the animation stop (px/ms)
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
Messaging2Ctrl.prototype._USER_EVENT_START = 'mousedown';
Messaging2Ctrl.prototype._USER_EVENT_END = 'mouseup';
Messaging2Ctrl.prototype._USER_EVENT_MOVE = 'mousemove';
Messaging2Ctrl.prototype._USER_EVENT_OUT = 'mouseleave';


/**
 * =========================
 * INIT ROUTINE
 * Any initialization code goes here
 * TAG: internal
 * =========================
 * @return {void}
 */
Messaging2Ctrl.prototype._init = function()
{
    this.setConfig(this.properties);

    /* ATTACH HANDLERS */
    // Primary event handlers
    // keep reference to the handler
    this._touchHandler = this._start.bind(this);

    // Handle touch events only for active area
    // start
    this._messageTouchActiveArea.addEventListener(this._USER_EVENT_START, this._touchHandler, false);
}

/**
 * Create default items for Messaging2 control
 * All the HTML elements are created here
 * depending on message style
 * TAG: internal
 * =========================
 * @return {void}
 */
Messaging2Ctrl.prototype._createStructure = function()
{
    // Create the div for control
    this.divElt = document.createElement('div');
    this.divElt.className = "Messaging2Ctrl";
    this.divElt.id = this.controlId;

    /**
     * Primary divs in control
     */

    // Create "background" - message background
    this._messageBackground = document.createElement('div');
    this._messageBackground.className = "Messaging2CtrlBackground";
    this.divElt.appendChild(this._messageBackground);

    // Create "mask" - message pane will scroll within if the
    // style is "email". Static if "sms".
    this._messageMask = document.createElement('div');
    this._messageMask.className = "Messaging2CtrlMask";
    this.divElt.appendChild(this._messageMask);

    // Create "Scroll indicator" - indicates position of current message view in overall message
    if (this.properties.showScrollIndicator)
    {
        this._scrollIndicatorWrapper = document.createElement('div');
        this._scrollIndicatorWrapper.className = "Messaging2CtrlScrollIndicatorWrapper";
        this.divElt.appendChild(this._scrollIndicatorWrapper);

        this._scrollIndicator = document.createElement('div');
        this._scrollIndicator.className = "Messaging2CtrlScrollIndicator";
        this._scrollIndicator.style.height = this.properties.scrollIndicatorMinSize + 'px';
        this._scrollIndicator.style.top = this.properties.scrollIndicatorMargin + 'px';
        this.divElt.appendChild(this._scrollIndicator);
    }

    // TODO: ump is instantiated later (down) to solve alignment issues with tooltip (temporary fix)

    /**
     * Secondary divs (part of other divs)
     */

    /* part of _messageMask starts*/

    // Create "wrapper" - message pane
    this._messageWrapper = document.createElement('div');
    this._messageWrapper.className = "Messaging2CtrlWrapper";
    this._messageMask.appendChild(this._messageWrapper);

    // part of _messageWrapper starts

    /**********************Header start************************/

    // Create "common" divs
    // These are used by both Email and SMS styles
    this._messageTimestamp = document.createElement('div');
    this._messageTimestamp.className = "Messaging2CtrlTimestamp";
    this._messageWrapper.appendChild(this._messageTimestamp);

    this._messageSenderIcon = document.createElement('div');
    this._messageSenderIcon.className = "Messaging2CtrlSenderIcon";
    this._messageWrapper.appendChild(this._messageSenderIcon);

    // Construct the "From:" line...
    this._messageFromLine = document.createElement('div');
    this._messageFromLine.className  = "Messaging2CtrlFromLine";
    this._messageWrapper.appendChild(this._messageFromLine);

    this._messageFromLineDivider = document.createElement('span');
    this._messageFromLineDivider.className  = "Messaging2CtrlFromLineDivider";
    this._messageWrapper.appendChild(this._messageFromLineDivider);


    // Create style-specific divs
    if (this.properties.messageStyle == "email")
    {
        // Construct "Subject: " line...
        this._messageSubjectLine = document.createElement('div');
        this._messageWrapper.appendChild(this._messageSubjectLine);

        this._messageSubjectLineDivider = document.createElement('span');
        this._messageWrapper.appendChild(this._messageSubjectLineDivider);

        // Construct "To:" line...
        this._messageRecipientsLine = document.createElement('div');
        this._messageRecipientsLine.className = "Messaging2CtrlRecipientsLine";
        this._messageWrapper.appendChild(this._messageRecipientsLine);

        this._messageRecipientsLineDivider = document.createElement('span');
        this._messageWrapper.appendChild(this._messageRecipientsLineDivider);

        // Construct "Cc:" line...
        this._messageRecipientsCcLine = document.createElement('div');
        this._messageRecipientsCcLine.className = "Messaging2CtrlRecipientsCcLine";
        this._messageWrapper.appendChild(this._messageRecipientsCcLine);

        this._messageRecipientsCcLineDivider = document.createElement('span');
        this._messageRecipientsCcLineDivider.className = "Messaging2CtrlRecipientsCcLineDivider";
        this._messageWrapper.appendChild(this._messageRecipientsCcLineDivider);
    }
    else
    {
        // SMS has no To, Cc or Subject
    }


    /**********************Header end************************/

    this._messageBody = document.createElement('div');
    this._messageWrapper.appendChild(this._messageBody);

    // part of _messageWrapper ends

    /* part of _messageMask ends*/


    this.parentDiv.appendChild(this.divElt);


    // Add ump to Messaging control

    // Add any umpConfig properties needed by Messaging2
    this.properties.umpConfig.defaultFocusCallback = this._umpFocusHandler.bind(this);

    // Create "Internal ump control" - provides facilty to navigate between app's other screens and messaging2Ctrl
    this._umpCtrl = framework.instantiateControl(this.uiaId, this.divElt, "Ump3Ctrl", this.properties.umpConfig);


    // Create "touchActiveArea" - active touch area for message window. Used for scroll via touch.
    // handles touch events for message window.
    // Touch events for UMP are handled directly by UMP
    this._messageTouchActiveArea = document.createElement('div');
    this._messageTouchActiveArea.className = "Messaging2CtrlTouchActiveArea";
    this.divElt.appendChild(this._messageTouchActiveArea);


    this._init();
}

/**
 * Set messaging2 control configuration
 * All the properties of the messaging control can be
 * reset and set again ecept messageStyle and umpConfig.
 * TAG: public
 * =========================
 * @param {Object} - properties to configure
 * @return {void}
 */
Messaging2Ctrl.prototype.setConfig = function(config)
{

    if (config.messageStyle && (config.messageStyle != this.properties.messageStyle))
    {
        log.warn("Messaging2Ctrl: setConfig() called with a different messageStyle than what was set at instantiation.");
    }
    else
    {

        for (var i in config )
        {
            this.properties[i] = config[i];
        }

        // TODO: Logics/Blocks on messageStyle checks can be combined into one later if they do not result in complex prograaming or readabilty issues.
        if ((this.properties.messageStyle != "email") && (this.properties.messageStyle != "sms"))
        {
            log.warn("Messaging2Ctrl does not support invalid style: " + this.properties.messageStyle);
            return;
        }

        this._messageSenderIcon.style.backgroundImage = "url(" + this.properties.messageSenderIcon + ")";
        this._messageTimestamp.innerText = this.properties.messageTimestamp;

        if (this._isFieldValueValid("From"))
        {
            if (this.properties.messageSenderId)
            {
                this.properties.messageSender = this._getLocalizedString(this.properties.messageSenderId, this.properties.messageSenderSubMap);
            }
            this._messageFromLine.innerText = this.properties.messageSender;
        }

        if (this.properties.catchedRestrictedSpeed)
        {
            if (this._isFieldValueValid("SpeedRestrictionMsg"))
            {
                if (this.properties.speedRestrictionMsgId)
                {
                    this.properties.speedRestrictionMsg = this._getLocalizedString(this.properties.speedRestrictionMsgId, this.properties.speedRestrictionMsgSubMap);
                }
                this.properties.messageBody = this.properties.speedRestrictionMsg;
            }
            else
            {
                log.error("Messaging2Ctrl: Catched restricted speed but speedRestrictionMsg data not valid. text = " + this.properties.speedRestrictionMsg  + ", id = " + this.properties.speedRestrictionMsgId);
            }
        }
        else if (this._isFieldValueValid("Body"))
        {
            if (this.properties.messageBodyId)
            {
                this.properties.messageBody = this._getLocalizedString(this.properties.messageBodyId, this.properties.messageBodySubMap);
            }
        }
        else
        {
            this.properties.messageBody = "";
        }

        this._messageBody.innerText = this.properties.messageBody;

        // set css styles
        var styleSuffix = "";

        if (this.properties.messageStyle == "sms")
        {
            // only 'from' field
            // Will need one line
            styleSuffix = "_style1";
        }
        else if (this.properties.messageStyle == "email")
        {
            if (this._isFieldValueValid("To") && this._isFieldValueValid("Cc"))
            {
                // 'from', 'to', ''cc', 'subject' fields
                // Will need four lines
                styleSuffix = "_style4";
            }
            else if (this._isFieldValueValid("To"))
            {
                // 'from', 'to', 'subject' fields
                // Will need three lines
                styleSuffix = "_style3";
            }
            else if (this._isFieldValueValid("Subject"))
            {
                // 'from', 'subject' fields
                // Will need two lines
                styleSuffix = "_style2";
            }
            else
            {
                // 'from' fields
                // Will need one line
                styleSuffix = "_style1";
            }
        }

        this._messageBody.className = "Messaging2CtrlBody" + styleSuffix;

        // fill in data
        if (this.properties.messageStyle == "email")
        {
            // Email style has a subject line
            if (this._isFieldValueValid("Subject"))
            {
                this._messageSubjectLine.className = "Messaging2CtrlSubjectLine";
                this._messageSubjectLineDivider.className = "Messaging2CtrlSubjectLineDivider";
                if (this.properties.messageSubjectId)
                {
                    this.properties.messageSubject = this._getLocalizedString(this.properties.messageSubjectId, this.properties.messageSubjectSubMap);
                }
                this._messageSubjectLine.innerText = this.properties.messageSubject;
            }
            else
            {
                this._messageSubjectLine.innerText = "";
                this._messageSubjectLineDivider.className = "";
            }

            if (this._isFieldValueValid("To"))
            {
                this._messageRecipientsLineDivider.className = "Messaging2CtrlRecipientsLineDivider";
                if (this.properties.messageRecipientsId)
                {
                    this.properties.messageRecipients = this._getLocalizedString(this.properties.messageRecipientsId, this.properties.messageRecipientsSubMap);
                }
                this._messageRecipientsLine.innerText = this.properties.messageRecipients;

                if (this._isFieldValueValid("Cc"))
                {
                     this._messageRecipientsCcLineDivider.className = "Messaging2CtrlRecipientsCcLineDivider";
                    if (this.properties.messageRecipientsCcId)
                    {
                        this.properties.messageRecipientsCc = this._getLocalizedString(this.properties.messageRecipientsCcId, this.properties.messageRecipientsCcSubMap);
                    }
                    this._messageRecipientsCcLine.innerText = this.properties.messageRecipientsCc;
                }
                else
                {
                    this._messageRecipientsCcLine.innerText = "";
                    this._messageRecipientsCcLineDivider.className = "";
                }
            }
            else
            {
                this._messageRecipientsLine.innerText = "";
                this._messageRecipientsLineDivider.className = "";
                this._messageRecipientsCcLine.innerText = "";
                this._messageRecipientsCcLineDivider.className = "";
            }
        }


        if (this.properties.messageHasAttachments && !this.properties.catchedRestrictedSpeed)
        {
            this._messageAttachment = document.createElement('div');
            this._messageAttachment.className = "Messaging2CtrlAttachment";

            if (this.properties.noAttachmentSupportIcon)
            {
                this._messageAttachmentIcon = document.createElement('div');
                this._messageAttachmentIcon.className = "Messaging2CtrlAttachmentIcon";
                this._messageAttachmentIcon.style.backgroundImage = "url(" + this.properties.noAttachmentSupportIcon + ")";
                this._messageAttachment.appendChild(this._messageAttachmentIcon);
            }

            if (this._isFieldValueValid("AttachmentText"))
            {
                this._messageAttachmentText = document.createElement('div');
                this._messageAttachmentText.className = "Messaging2CtrlAttachmentText";

                if (this.properties.noAttachmentSupportTextId)
                {
                    this.properties.noAttachmentSupportText = this._getLocalizedString(this.properties.noAttachmentSupportTextId, this.properties.noAttachmentSupportTextSubMap);
                }
                this._messageAttachmentText.innerText = this.properties.noAttachmentSupportText;

                this._messageAttachment.appendChild(this._messageAttachmentText);
            }

            this._messageBody.appendChild(this._messageAttachment);
        }

        // spacer to add at the end of body so that last line of body text is not hidden behind top curve of ump.
        this._messageBodySpacer = document.createElement('div');
        this._messageBodySpacer.className = "Messaging2CtrlBodySpacer";
        this._messageBody.appendChild(this._messageBodySpacer);

        // Set scrollbar
        this._resetMessageScroller();
        this._setScrollIndicator();

    }
}

/**
 * Captures the current focus/context information of the control.
 * Called when framework switches the context from this control to another control.
 * The information will be returned in the form of a special object specific to the control.
 * This object will have all the required information to restore focus/context on control and its subcontrols.
 * This object can be used by framework to restore back the focus/context.
 * TAG: public
 * =========================
 * @param {void}
 * @return {controlContextCapture} - object with current focus/context information of the control.
 */
Messaging2Ctrl.prototype.getContextCapture = function()
{
    var controlContextCapture = {
        messageFocused : this._messageFocused,
        umpContext     : this._umpCtrl.getContextCapture()
    };
    return controlContextCapture;
}

/**
 * Restores the control with the earlier captured focus/context information which was captured using getContextCapture() function.
 * Called when framework switches back to the previous context from the new context.
 * The information is passed in the same structured object form as returned by getContextCapture() function.
 * This object is the returned value to the last getContextCapture() function.
 * This object will have the required information to restore back to the state when getContextCapture() was called.
 * TAG: public
 * =========================
 * @param {controlContextCapture} - object with previously captured focus/context information of the control
 * @return {void}
 */
Messaging2Ctrl.prototype.restoreContext = function(controlContextCapture)
{
    // Check if focus to be restored on the control or subControl
    // Set the corresponding properties of control and subControl.

    if (controlContextCapture.messageFocused)
    {
        framework.common.stealFocus();                                  // steal focus from other apps/cpntrols
        var response = this._sendControllerEventToUmp("lostFocus");     // remove default focus on ump
        this._setMessageFocus(true);                                    // set the focus highlight on message window
    }
    else
    {
        this._umpCtrl.restoreContext(controlContextCapture.umpContext);
    }
}

/**
 * Reset private data for message Scroller
 * TAG: internal
 * =========================
 * @param {void}
 * @return {void}
 */
Messaging2Ctrl.prototype._resetMessageScroller = function()
{
    // Reset Scroll animation data.
    this._resetScrollerAnimation();
    this._resetScrollIndicatorAnimation();

    // Reset all properties for private Scroll and touch to default.
    this._inDrag = false;

    if (this._messageFocused)
    {
        this._setMessageFocus(false);
        // TODO:check required or not (after restore and steal focus implementation)
        var response = this._sendControllerEventToUmp("acceptFocusFromTop");
    }

    this._maskPositionY = 0;
    this._startY = 0;
    this._startTime = 0;
    this._y = 0;
    this._minScrollY = 0;
    this._maxScrollY = 0;
    this._trackedEvents = [];
    this._indicatorMin = 0;
    this._indicatorMax = 0;

    // Reset _messageWrapper's and _scrollIndicator's scroll properties.
    this._messageWrapper.style.top =  this._minScrollY + 'px';
    this._scrollIndicator.style.top = this.properties.scrollIndicatorMargin + 'px';
    this._scrollIndicator.style.height = this.properties.scrollIndicatorMinSize + 'px';
}

/**
 * Add or remove focus on message window
 * TAG: internal
 * =========================
 * @param {boolien} - true - set, false - remove
 * @return {void}
 */
Messaging2Ctrl.prototype._setMessageFocus = function(focus)
{
    this._messageFocused = focus;
    if (focus)
    {
        this._messageBackground.classList.add('focus');

        if (this._scrollIndicator)
        {
            this._scrollIndicator.classList.add('focus');
        }
    }
    else
    {
        this._resetScrollerAnimation();
        this._messageBackground.classList.remove('focus');

        if (this._scrollIndicator)
        {
            this._resetScrollIndicatorAnimation();
            this._scrollIndicator.classList.remove('focus');
        }
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
Messaging2Ctrl.prototype._getLocalizedString = function(labelId, subMap)
{
    return framework.localize.getLocStr(this.uiaId, labelId, subMap);
};

/**
 * check if provided message fields are valid or not
 * TAG: internal
 * =========================
 * @param {String} - Type of message fiels e.g. from, to, cc, subject, message
 * @return {Boolean} - True if valid
 */
Messaging2Ctrl.prototype._isFieldValueValid = function(fieldType)
{
    var valid = false;

    switch (fieldType)
    {
        case "From":
            valid = (this.properties.messageSender && this.properties.messageSender != "") || (this.properties.messageSenderId && this.properties.messageSenderId != "");
            break;
        case "To":
            valid = (this.properties.messageRecipients && this.properties.messageRecipients != "") || (this.properties.messageRecipientsId && this.properties.messageRecipientsId != "");
            break;
        case "Cc":
            valid = (this.properties.messageRecipientsCc && this.properties.messageRecipientsCc != "") || (this.properties.messageRecipientsCcId && this.properties.messageRecipientsCcId != "");
            break;
        case "Subject":
            valid = (this.properties.messageSubject && this.properties.messageSubject != "") || (this.properties.messageSubjectId && this.properties.messageSubjectId != "");
            break;
        case "Body":
            valid = (this.properties.messageBody && this.properties.messageBody != "") || (this.properties.messageBodyId && this.properties.messageBodyId != "");
            break;
        case "AttachmentText":
            valid = (this.properties.noAttachmentSupportText && this.properties.noAttachmentSupportText != "") || (this.properties.noAttachmentSupportTextId && this.properties.noAttachmentSupportTextId != "");
            break;
        case "SpeedRestrictionMsg":
            valid = (this.properties.speedRestrictionMsg && this.properties.speedRestrictionMsg != "") || (this.properties.speedRestrictionMsgId && this.properties.speedRestrictionMsgId != "");
            break;
        default:
            valid = false;
            break;
    }

    return valid;
}

/**
 * focus call back from internal ump control
 * TAG: internal
 * =========================
 * @param {umpRef} - Reference to ump control object
 * @param {appData} - Associated appData
 * @param {params} - Params determines focus related properties
 * @return {void}
 */
Messaging2Ctrl.prototype._umpFocusHandler = function(umpRef, appData, params)
{
    if (params && params.focusStolen && params.focusStolen == true)
    {
        this._setMessageFocus(false);
    }
}

/**
 * Multicontroller event handler
 * TAG: public
 * =========================
 * @param {string} - multicontroller event
 * @return {string} - event consumed state
 */
Messaging2Ctrl.prototype.handleControllerEvent = function(eventId)
{
    var response = "ignored";

    switch(eventId)
    {
        case "acceptFocusInit":        // intentional fallthrough. these cases have the same behavior
        case "acceptFocusFromLeft":
        case "acceptFocusFromRight":
        case "acceptFocusFromTop":
        case "acceptFocusFromBottom":
            {
                this._setMessageFocus(false);
                // pass event to UMP
                response = this._sendControllerEventToUmp(eventId);
            }
            break;
        case "lostFocus":
            {
                if (this._messageFocused)
                {
                    // remove focused style from message window
                    this._setMessageFocus(false);
                    response = "consumed";
                }
                else
                {
                    // pass event to UMP
                    response = this._sendControllerEventToUmp(eventId);
                }
            }
            break;
        case "touchActive":
            {
                // pass event to UMP
                response = this._sendControllerEventToUmp(eventId);
            }
            break;
        case "controllerActive":
            {
                // pass event to UMP
                response = this._sendControllerEventToUmp(eventId);
            }
            break;
        default:
            {
                // all events dependant on scroll enabled value
                if (this._messageFocused)
                {
                    response = this._handleControllerEventInMessage(eventId);
                }
                else
                {
                    response = this._sendControllerEventToUmp(eventId);
                }
            }
            break;
    }

    return response;
}

/**
 * Multicontroller event handler for message window
 * TAG: internal
 * =========================
 * @param {string} - multicontroller event
 * @return {string} - event consumed state
 */
Messaging2Ctrl.prototype._handleControllerEventInMessage = function(eventId)
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
            response = this._scrollInMessage("down");
            break;
        case "ccw":
            // Rotate Left (CCW)
            // go up
            response = this._scrollInMessage("up");
            break;
        case "left":
            response = "giveFocusLeft";
            break;
        case "right":
            response = "giveFocusRight";
            break;
        case "down":
            // remove focus from message
            this._setMessageFocus(false);
            response = this._sendControllerEventToUmp("acceptFocusFromTop");
            break;
        case "up":
            response = "giveFocusUp";
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
}

/**
 * Scroll the message in message window on multicontroller events
 * TAG: internal
 * =========================
 * @param {string} - direction to scroll
 * @return {string} - event consumed state
 */
Messaging2Ctrl.prototype._scrollInMessage = function(direction)
{
    var response = "consumed";

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
}

/**
 * Send multicontroller events to ump with some special handeling as applicable.
 * TAG: internal
 * =========================
 * @param {string} - multicontroller event
 * @return {string} - event consumed state from ump Or updated response by control after handeling specific ump responses
 */
Messaging2Ctrl.prototype._sendControllerEventToUmp = function(eventId)
{
    var response = null;

    if (this._umpCtrl)
    {
        response = this._umpCtrl.handleControllerEvent(eventId);
        // TODO: Workaround so that focus from ump will not be shifted to other controls on CW or CCW
        // should be handled correctly with ump3 and hence to remove then.
        if ( (eventId === "cw") || (eventId === "ccw") )
        {
            response = "consumed";
        }
        response = this._handleControllerEventResponseFromUmp(response)
    }
    else
    {
        response = "consumed";
    }

    return response;
}

/**
 * Handle multicontroller responses from ump
 * TAG: internal
 * =========================
 * @param {string} - responses from ump for multicontroller events passed to it
 * @return {string} - updated consumed state from control after handeling the ump responses
 */
Messaging2Ctrl.prototype._handleControllerEventResponseFromUmp = function(response)
{
    /*
     * handle
     * - giveFocusLeft (control retains highlight unless it later gets lostFocus event)
     * - giveFocusRight
     * - giveFocusUp
     * - giveFocusDown
     * - consumed (always returned on select event, and if control adjusted highlight)
     * - ignored (returned only if control doesn't know about focus)
     */

    switch(response)
    {
        case "giveFocusLeft":
            // do nothing
            // pass on
            break;
        case "giveFocusRight":
            // do nothing
            // pass on
            break;
        case "giveFocusUp":
            // message to get focus
            this._setMessageFocus(true);
            // TODO: check if the focus information from ump need to be stored for future focusRestore.
            // If on giving focus to UMP, it has to return to same umpbutton as earlier then store current ump focus and use focusRestore later
            // Else ump will return to default umpbutton  as currently implemented.

            // send lost focus to ump
            response = this._sendControllerEventToUmp("lostFocus");
            break;
        case "giveFocusDown":
            // do nothing
            // pass on
            break;
        case "consumed":
            // do nothing
            // pass on
            break;
        case "ignored":
            // do nothing
            // pass on
            break;
        default:
            // No action
            response = "ignored";
            break;
    }

    return response;
}

/**
 * Set the scrollIndicator for message.
 * ScrollIndicator is used only for messageStyle email for now.
 * Not required in messageStyle sms as size is not more than 160 chars usually.
 * TAG: internal
 * =========================
 * @param {Void}
 * @return {Void}
 */
Messaging2Ctrl.prototype._setScrollIndicator = function()
{
    if (!this.properties.showScrollIndicator)
    {
        return;
    }

    // determine scroll indicator size
    var indicatorSize = Math.round(this._messageWrapper.scrollHeight * (this._messageWrapper.scrollHeight / this._messageMask.scrollHeight));

    this._scrollIndicator.style.height = this._m.max(indicatorSize, this.properties.scrollIndicatorMinSize) + 'px';

    this._indicatorMin = this.properties.scrollIndicatorMargin;
    this._indicatorMax = this._messageMask.offsetHeight - this._scrollIndicator.offsetHeight - this.properties.scrollIndicatorMargin;

    // update _maxScrollY
    this._maxScrollY = this._messageWrapper.scrollHeight - this._messageMask.scrollHeight;
}


/**
 * Update the scrollIndicator for message on message drag
 * Used with no animation. ie. during drag/scroll
 * TAG: internal
 * =========================
 * @param {Void}
 * @return {Void}
 */
Messaging2Ctrl.prototype._dragUpdateScrollIndicator = function()
{
    log.debug("_dragUpdateScrollIndicator() called...");

    if (!this.properties.showScrollIndicator)
    {
        return;
    }

    // determine scroll indicator position
    var indicatorPos = Math.round(this._indicatorMax * (this._messageWrapper.offsetTop / this._maxScrollY));

    // constrain position
    indicatorPos = this._m.max(indicatorPos, this._indicatorMin);

    // set new position
    if (this._scrollIndicator)
    {
        this._scrollIndicator.style.top = indicatorPos + 'px';
    }
}

/**
 * Scroll by fixed amount in a requested direction
 * TAG: internal
 * =========================
 * @param {String} - Direction to scroll
 * @return {Void}
 */
Messaging2Ctrl.prototype._scroll = function(direction)
{
    var newPos = parseInt(this._messageWrapper.style.top);            // calculate new position based on the item index

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
}

// TODO: No Swipe for multicontroller. Only scroll. Check if needed later.
/**
 * Do the actual scroll
 * TAG: internal
 * =========================
 * @param {integer} - new position of the scroller in px.
 * @return {void}
 */
Messaging2Ctrl.prototype._performScroll = function(pos)
{
    // constrain it to scroll bounds
    pos = this._m.max(this._m.min(pos, 0), this._maxScrollY);
    // make it snappy
    this._snap(pos);
};

/**
 * Update the scrollIndicator for message at the end of message drag.
 * Called on scroll animation (flick or scroll ad-hoc)
 * TAG: internal
 * =========================
 * @param {integer} the new position of the scroller
 * @param {integer} the time for animation to the new position
 * @return {integer} the new scroll indicator position
 */
Messaging2Ctrl.prototype._updateScrollIndicator = function(pos, time)
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
    this._scrollIndicator.style.top = newPos + 'px';
}

/**
 * Local Math implementation
 * TAG: internal, utility
 * =========================
 */
Messaging2Ctrl.prototype._m = {
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
}

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
Messaging2Ctrl.prototype._dragEventHandler = function(e)
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
 * Start Touch on message
 * TAG: touch-only, internal
 * =========================
 * @param {event} - raw touch/mouse event
 * @return {void}
 */
Messaging2Ctrl.prototype._start = function(e)
{
    /* Steal focus on touch interaction */

    if (!this._messageFocused)
    {
        framework.common.stealFocus();        // steal focus
        this._setMessageFocus(true);          // set the focus highlight
    }

    /* Other touch interaction handeling */

    // get mask position
    this._maskPositionY = this._getPosition(this._messageMask);

    // get relative mouse position
    var relativeY = e.pageY - this._maskPositionY;

    if (relativeY < 0)
    {
        return;
    }

    // get current y
    this._y = this._messageWrapper.offsetTop;
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
 * Move touch on message
 * TAG: touch-only, internal
 * =========================
 * @param {event} - raw touch/mouse event
 * @return {void}
 */
Messaging2Ctrl.prototype._move = function(e)
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

    // we have a vertical drag and the message can be scrolled
    // calculate the scroller's new position and constrain it into bounds
    var newPos = this._m.max(this._maxScrollY, this._m.min(this._y + deltaY, this._minScrollY));

    // drag the scroller if in bounds
    this._messageWrapper.style.top = newPos + 'px';
    // update scroll indicator
    this._dragUpdateScrollIndicator();
    // track event only for vertical drag
    this._trackEvent(e);
};

/**
 * End of touch on message
 * TAG: touch-only, internal
 * =========================
 * @param {event} - raw touch/mouse event
 * @return {void}
 */
Messaging2Ctrl.prototype._end = function(e)
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
        this._snap(this._messageWrapper.offsetTop);
    }
};

/**
 * Touch is out of bound (with respect to message area)
 * TAG: touch-only, internal
 * =========================
 * @param {event} - raw touch/mouse event
 * @return {void}
 */
Messaging2Ctrl.prototype._out = function(e)
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
Messaging2Ctrl.prototype._setDragEvents = function(set)

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
}

/**
 * =========================
 * Other helper methods
 * =========================
 */
/**
 * Get current position of the message
 * TAG: internal, utility
 * =========================
 * @param {HTML Element} - Message
 * @return {Integer} - top position
 */
Messaging2Ctrl.prototype._getPosition = function(obj)
{
    var currentTop = 0;
    if (obj.parentElement )
    {
        do {
            currentTop += obj.offsetTop;
        } while (obj = obj.offsetParent );
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
Messaging2Ctrl.prototype._trackEvent = function(e)
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
Messaging2Ctrl.prototype._getLastMove = function()
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
Messaging2Ctrl.prototype._getSwipeDuration = function(moveSpec)
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
Messaging2Ctrl.prototype._getSwipeLength = function(moveSpec, swipeDuration)
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
Messaging2Ctrl.prototype._scrollerAnimationEnd = function()
{
    this._resetScrollerAnimation();
};

/**
 * Scroll indicator animation end callback
 * TAG: internal
 * =========================
 * @return {void}
 */
Messaging2Ctrl.prototype._scrollIndicatorAnimationEnd = function()
{
    this._resetScrollIndicatorAnimation();
};

/**
 * Reset scroller animation end callback
 * TAG: internal
 * =========================
 * @return {void}
 */
Messaging2Ctrl.prototype._resetScrollerAnimation = function()
{
    if (this._scrollerAnimationEndCallback)
    {
        this._messageWrapper.style['OTransitionDuration'] = '0ms';
        this._messageWrapper.removeEventListener('OTransitionEnd', this._scrollerAnimationEndCallback, false);
        this._scrollerAnimationEndCallback = null;
    }
};

/**
 * Reset scroll indicator animation end callback
 * TAG: internal
 * =========================
 * @return {void}
 */
Messaging2Ctrl.prototype._resetScrollIndicatorAnimation = function()
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
Messaging2Ctrl.prototype._animateScroll = function(pos, time)
{
    if (time == undefined || time == null)
    {
        time = this.properties.swipeAnimationDuration;
    }

    // reset animation (previous, if any)
    this._resetScrollerAnimation();

    // animate scroller
    this._messageWrapper.style['OTransitionDuration'] = time + 'ms';
    this._scrollerAnimationEndCallback = this._scrollerAnimationEnd.bind(this);
    this._messageWrapper.addEventListener('OTransitionEnd', this._scrollerAnimationEndCallback, false);
    this._messageWrapper.style.top = pos + 'px';

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
Messaging2Ctrl.prototype._getSnapPosition = function(pos)
{
    if (pos >= this._maxScrollY - this._scrollAmount)
    {
        return pos;
    }
    else
    {
        return this._scrollAmount * (Math.round(pos / this._scrollAmount));
    }
};

/**
 * Scroll to an even snap position
 * TAG: internal
 * =========================
 * @param {integer} - new position of the scroller in px.
 * @return {void}
 */
Messaging2Ctrl.prototype._snap = function(pos)
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
Messaging2Ctrl.prototype._startSwipe = function()
{
    // physics calculations

    var moveSpec = this._getLastMove();
    var swipeDuration = this._getSwipeDuration(moveSpec);
    var swipeLength = this._getSwipeLength(moveSpec, swipeDuration);
    var factor = swipeLength / moveSpec.length;
    var swipeVector = moveSpec.length * factor;

    // get the old position
    var oldPos = this._messageWrapper.offsetTop + swipeVector;

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

/*
 * Finish partial activity.
 */
Messaging2Ctrl.prototype.finishPartialActivity = function()
{
    if (this._umpCtrl)
    {
        // delete the assigned callback reference so that it's not stored in the App's context table
        delete this.properties.umpConfig.defaultFocusCallback;
        this._umpCtrl.finishPartialActivity();
    }
};

Messaging2Ctrl.prototype.cleanUp = function()
{
    log.debug("Messaging2Ctrl.js cleanUp() called...");

    // remove touch events listners
    this._messageTouchActiveArea.removeEventListener(this._USER_EVENT_START, this._touchHandler, false);

    // reset touch events for drag
    this._setDragEvents(false);

    // remove other event listners
    this._messageWrapper.removeEventListener('OTransitionEnd', this._scrollerAnimationEndCallback, false);

    if (this._scrollIndicator)
    {
        this._scrollIndicator.removeEventListener('OTransitionEnd', this._scrollIndicatorAnimationEndCallback, false);
    }


    //internal

    if (this.umpCtrl)
    {
        this._umpCtrl.cleanUp();
    }
}

framework.registerCtrlLoaded("Messaging2Ctrl");

