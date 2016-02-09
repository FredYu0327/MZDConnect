/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: ButtonCtrl.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: awoodhc
 Date: 07.23.2012
 __________________________________________________________________________

 Description: IHU GUI Text Button Control

 Revisions:
 v0.1 (23-July-2012) Created Button Control
 v0.2 (25-July-2012) Added class handling functionality.
 v0.3 (27-July-2012) Updated handleControllerEvent to handle full functionality
 v0.4 (6-Aug-2012) Fixed bugs in "held" behavior that was causing unusual timeouts/class lists
 v0.5 (13-Aug-2012) Added proper mouse out handling
 v0.6 (28-Aug-2012) Updated select callback
 v0.7 (17-Sept-2012) Added hold and longpress events. properties.canHold replaced by properties.buttonBehavior
 v0.8 (21-Sept-2012) Added Studio touch/move behavior. Ability to group buttons is now available. Highlight can be moved within button groups.
 v0.9 (28-Sept-2012) Added icon APIs -agohsmbr, Fixed Highlight logic on up -awoodhc
 v1.0 (18-Oct-2012) Fixed bug where extra logic occurred after cleanUp. Fixed issue that caused multiple hold start callbacks -awoodhc
 v1.1 (5-Nov-2012) holdTimeout is now a configurable property
 v1.2 (7-Nov-2012) Added API to change the CSS classes and redraw the button
 v1.3 (21-Nov-2012) Added SubMap Support
 v1.4 (07-Dec-2012) Added new "buttonStyle" property which can be set to "checkbox" -agohsmbr
 v1.5 (28-Feb-2013) Changed several variables to private and added getters for variables that should be accessable. -agohsmbr
 v1.6 (08-Apr-2013) Added logic to steal focus and config properties
 __________________________________________________________________________

 */
log.addSrcFile("ButtonCtrl.js", "common");

/*
 * Constructor
 */
function ButtonCtrl(uiaId, parentDiv, controlId, properties)
{
    this.id = controlId;
    this.uiaId = uiaId;
    this.divElt = null;
    
    //@formatter:off
    this.properties = {
        /*General Config*/   
        "useDebugClasses": false,   // (Boolean) if true, uses debugging css classes to change the look of the button
        "canStealFocus": false,     // (Boolean) true if the button can steal focus from other Controls in the DOM
        "holdTimeout" : 1500,       // (Number) Time in ms before a hold/long press event fires
        "appData" : null,           // (Object) any data the parent control needs assigned to this button. It will be passed back untouched on click
        "label"	: null,             // (String) literal label for the button
        "labelId" : null,     	    // (String) id for the button label (will trigger localization)
        "subMap" : null,            // (Object) Optional subMap to be used with the labelId
        "buttonBehavior" : "shortPressOnly",  // (String) "hold" behavior for the button ("shortPressOnly", "shortAndHold", or "shortAndLong")
        "buttonStyle" : "normal",       // (String) May be "normal" or "checkbox". Defaults to "normal". 
        "checkBoxData" : null,      // (Object) Specifies Boolean isChecked, String checkedValue and String uncheckedValue. May be null.
        "icon" : null,              // (String) String path from index.html to icon file location
        "groupFocusObj" : new Object(),   // (Object) Obj reference shared by all buttons in the group.
                
        /*Callbacks*/
        "onFocusCallback": null,    // (Function) callback for when the button receives Multicontroller focus for any reason
        "selectCallback" : null,    // (Function) callback for when the button is clicked
        "longPressCallback": null,  // (Function) callback for when a long press event occurs
        "holdStartCallback": null,  // (Function) callback for when a hold event starts
        "holdStopCallback": null,   // (Function) callback for when a hold event stops
        
        /* CSS Classes*/
        "enabledClass" : null,      // (String) CSS class to use for the button in "normal state"
        "disabledClass" : null,     // (String) CSS class to use for the button in "disabled state", replaces baseClass
        "focusedClass" : null,      // (String) CSS class to use for the button in "multicontroller focused state", cascades with baseClass
        "downClass" : null,         // (String) CSS class to use for the button in "touched state", cascades with baseClass
        "heldClass" : null,         // (String) CSS class to use for the button in "touched state", cascades with baseClass
        "iconClass" : null    // (String) [optional] CSS class to override default icon class
    };
    //@formatter:on

    for (var i in properties)
    {
        this.properties[i] = properties[i];
    }
    
    /*--------------------------
     * CONTROL PRIVATE PROPERTIES
     */
    
    this._isEnabled = true;         // (Boolean) true if the button can receive user input
    
    this._controllerActive = false; // (Boolean) true if the input mode is Multicontroller
    this._isHighlighted = false;    // (Boolean) true if this button is highlighted
    this._isHeld = false;           // (Boolean) true if this button is in a held state (hold/longpress without release)
    this._isDown = false;           // (Boolean) true if this button is the one the user INITIALLY pressed on. (NOT the same as touch highlight)
    this._hasFocus = false;         // (Boolean) true if this button has multicontroller focus (NOT the same as multicontroller highlight)
    this._holdTimeout = 1500;       // (Number) Hold/Long press timeout in ms - 1.5 sec
    this._holdTimeoutId = 0;        // (Number) ID to clear the timeout with
    
    // Note: All variables in this Object must also be initialized in "Internal Setup" below
    this._groupTouch = {
        "focused": false,           // (Boolean) True if a button in the group has touch focus
        "heldBtn": null,            // (Object) Reference to the button in the group that is in a held state. We need both variables (see this._isHeld) to properly issue callbacks
        "selectMode": null          // (String) Flag used to capture select related input from touch or controller in pairs instead of half controller or half touch.
    };
    
    // Note: This object is used to lookup the expected values for
    // the common beep() eventType based on the value of this._groupTouch.selectMode
    this._beepEventType = {
        "touch" : "Touch",
        "controller" : "Multicontroller"
    };
    
    // Checkbox Variables
    this._isCheckedIcn = "common/controls/Button/images/IcnButtonCheckBox_Checked.png";
    this._isUncheckedIcn = "common/controls/Button/images/IcnButtonCheckBox_Unchecked.png";
    this._isChecked = false;       // (Boolean) true if the checkbox is currently checked
    
    /*--------------------------
     * CONTROL PUBLIC PROPERTIES
     */
    
    this.canStealFocus = this.properties.canStealFocus;
    
    /*--------------------------
     * SETTERS AND GETTERS
     */
    
    this.__defineGetter__('isEnabled', function(){
        return this._isEnabled;
    });
    
    this.__defineGetter__('isHighlighted', function(){
        return this._isHighlighted;
    });
    
    this.__defineGetter__('isHeld', function(){
        return this._isHeld;
    });
    
    this.__defineGetter__('isDown', function(){
        return this._isDown;
    });
    
    this.__defineGetter__('hasFocus', function(){
        return this._hasFocus;
    });
    
    
    /*--------------------------
     * CONTROL INTERNAL SETUP
     */
    
    if (this.properties.useDebugClasses)
    {
        this._setDebugClasses();
    }
    
    if (this.properties.checkBoxData && this.properties.checkBoxData.isChecked === true) // strict equality validates data
    {
        this._isChecked = this.properties.checkBoxData.isChecked;
    }
    
    this._holdTimeout = this.properties.holdTimeout; // configurable hold timeout property
    
    // Initialize the button group Object
    this._groupTouch = this.properties.groupFocusObj;
    this._groupTouch.focused = false;
    this._groupTouch.heldBtn = null;
    this._groupTouch.selectMode = null;

    this.divElt = document.createElement('div');
    this.divElt.id = controlId;
    this.divElt.className = this.properties.enabledClass;
    
    // Check for icon
    if (this.properties.icon)
    {    
        this._iconDiv = document.createElement('div');
        // Determine CSS class for configuring the icon positioning
        if(this.properties.iconClass != null)
        {
            // Class was passed in
            this._iconDiv.className = this.properties.iconClass;
        }
        else
        {
            // Use default
            this._iconDiv.className = "ButtonCtrlIcon"; // This CSS class configures the icon positioning
        }
        this._iconDiv.style.backgroundImage = "url(" + this.properties.icon + ")";
        this.divElt.appendChild(this._iconDiv);
    }
    
    // Check for buttonStyle
    if (this.properties.buttonStyle == "checkbox")
    {
        if (this.properties.buttonBehavior != "shortPressOnly")
        {
            log.warn("The buttonStyle 'checkbox' can only be used with a buttonBehavior of 'shortPressOnly'.");
            this.properties.buttonBehavior = "shortPressOnly";
        }
        
        // This is a "checkbox" button
        this._checkBoxLabelDiv = document.createElement('div');
        this._checkBoxLabelDiv.className = "ButtonCtrlCheckBoxLabel";
        this._checkBoxLabelDiv.id = "checkBoxLabel";
        this.divElt.appendChild(this._checkBoxLabelDiv);
        
        this._checkBoxIconDiv = document.createElement('div');
        this._checkBoxIconDiv.className = "ButtonCtrlCheckBoxIcon";
        this._checkBoxIconDiv.id = "checkBoxIcon";
        
        if (this._isChecked)
        {
            this._checkBoxIconDiv.style.backgroundImage = "url(" + this._isCheckedIcn + ")";
        }
        else
        {
            // Unchecked
            this._checkBoxIconDiv.style.backgroundImage = "url(" + this._isUncheckedIcn + ")";
        }
        
        this.divElt.appendChild(this._checkBoxIconDiv);
    }
    else
    {
        // This is a "normal" button
    }
    
    //Set the label of the button
    if (this.properties.labelId && this.properties.labelId != "")
    {
        this.setLabelId(this.properties.labelId);
    }
    else if (this.properties.label)
    {
        this.setLabel(this.properties.label);
    }
    
    // Add to DOM
    parentDiv.appendChild(this.divElt);

    // Add listeners
    // add "mouse down" handler
    this._downCallback = this._onDownHandler.bind(this);
    this.divElt.addEventListener("mousedown", this._downCallback);
    
    // "mouse up" handler
    this._upCallback = this._onUpHandler.bind(this);
    this.divElt.addEventListener("mouseup", this._upCallback);
    
    // add "mouse over" handler
    this._overCallback = this._onOverHandler.bind(this);
    this.divElt.addEventListener("mouseover", this._overCallback);
    
    // add "mouse out" handler
    this._outCallback = this._onOutHandler.bind(this);
    this.divElt.addEventListener("mouseout", this._outCallback);

}

/* Adds the debug CSS classes to show highlights even when no class exists.
 * Classes that are passed in will still override debug classes.
 */
ButtonCtrl.prototype._setDebugClasses = function()
{
    // only set the debug classes if no class is already set
    if (this.properties.enabledClass == null)
    {
        this.properties.enabledClass = "ButtonCtrl";
    }
    if (this.properties.disabledClass == null)
    {
        this.properties.disabledClass = "ButtonCtrlDisabled";
    }
    if (this.properties.focusedClass == null)
    {
        this.properties.focusedClass = "ButtonCtrlFocused";
    }
    if (this.properties.downClass == null)
    {
        this.properties.downClass = "ButtonCtrlDown";
    }
    if (this.properties.heldClass == null)
    {
        this.properties.heldClass = "ButtonCtrlHeld";
    }
};

/*
 * Deprecated API. Use setLabel()
 */
ButtonCtrl.prototype.setButtonLabel = function(label)
{
    this.setLabel(label);
};

/*
 * Sets the text label of the Button
 * @param   label   String  Literal string to display on the button
 */
ButtonCtrl.prototype.setLabel = function(label)
{
    this.properties.label = label;
    
    if (this.properties.buttonStyle == "checkbox")
    {
        // This is a "checkbox" style button
        
        this._checkBoxLabelDiv.innerText = "";
        // If the arg is null, clear the label
        if (!label)
        {
            return;
        }
        this._checkBoxLabelDiv.appendChild(document.createTextNode(label));
    }
    else
    {
        // This is a "normal" style button
        
        this.divElt.innerText = "";
        // If the arg is null, clear the label, but don't create a new text node
        if (!label)
        {
            return;
        }
    
        this.divElt.appendChild(document.createTextNode(label));
    }
};

/*
 * Deprecated API. Use setLabelId()
 */
ButtonCtrl.prototype.setButtonLabelId = function(labelId, subMap)
{
    this.setLabelId(labelId, subMap);
};

/*
 * Sets the labelId of the Button Control. LabelId will be localized into current language.
 * @param   labelId String  labelId to be translated and displayed
 * @param   subMap  Object  Optional subMap containing dynamic values to be inserted into the localized text
 */
ButtonCtrl.prototype.setLabelId = function(labelId, subMap)
{
    this.properties.labelId = labelId;
    this.properties.subMap = subMap; // Note: subMap can be passed to localize as null, but we should overwrite each time a new labelId is assigned.

    if (this.properties.labelId && this.properties.labelId != "")
    {
        // Call localize
        this.properties.label = framework.localize.getLocStr(this.uiaId, this.properties.labelId, subMap);
    }

    //Set Default Label of Button
    this.setLabel(this.properties.label);
};

/*
 * Sets the displayed icon of the button.
 * @param   icon    String  Path to the icon from index.html
 */
// NOTE: Depricated by setIcon(). Left for backward compatibility.
ButtonCtrl.prototype.setButtonIcon = function(icon)
{
    log.warn("Button: setButtonIcon() depricated. Use setIcon(). ");
    log.debug("ButtonCtrl: setButtonIcon() ", icon);
    log.debug("   this.divElt.id: " + this.divElt.id);
    this.setIcon(icon);
};

/*
 * Sets the displayed icon of the button.
 * @param   icon    String  Path to the icon from index.html
 */
ButtonCtrl.prototype.setIcon = function(icon)
{
    log.debug("ButtonCtrl: setIcon() ", icon);
    
    log.debug("   this.divElt.id: " + this.divElt.id);
    // Check for existing icon DIV
    if (this._iconDiv)
    {
        // Exists. Change icon.
        this._iconDiv.style.backgroundImage = "url(" + icon + ")";
    }
    else
    {        
        // Does not exist. Create and set icon.
        this._iconDiv = document.createElement('div');

        // Determine CSS class for configuring the icon positioning
        if(this.properties.iconClass != null)
        {
            // Class was passed in
            this._iconDiv.className = this.properties.iconClass;
        }
        else
        {
            // Use default
            this._iconDiv.className = "ButtonCtrlIcon"; // This CSS class configures the icon positioning
        }
        this._iconDiv.style.backgroundImage = "url(" + icon + ")";
        this.divElt.appendChild(this._iconDiv);
    }  
};

/*
 * Deprecated. Use getLabel()
 */
ButtonCtrl.prototype.getButtonLabel = function()
{
    return this.getLabel();
};

/*
 * Returns the current string label of the button.
 */
ButtonCtrl.prototype.getLabel = function()
{
    return this.properties.label;
};

/*Function to make the button enabled or disabled*/
ButtonCtrl.prototype.setEnabled = function(value)
{
    log.debug("Button: setEnabled() ", value);
    
    log.debug("   this.divElt.id: " + this.divElt.id);
    if (value)
    {
        // Enabled
        this.divElt.classList.remove(this.properties.disabledClass);
        
        this._isEnabled = true;
    }
    else
    {
        // Disabled
        this.divElt.classList.add(this.properties.disabledClass);
        
        // Prevent callback on release, if down
        document.body.removeEventListener("mouseup", this._upCallback);
        
        // If the button is currently being held, we need to issue a callback so the App knows to do something
        this._selectEndHandler(true);
        
        this._isEnabled = false;
        this._groupTouch.selectMode = null; // clear groupTouch.selectMode so we don't get stuck
    }
};

/*
 * Sets new CSS classes and redraws the button in its current state.
 * If a class is not given, the class will be set to null.
 * @param   newClasses  Object  should contain the CSS classes as defined in the properties Object
 */
ButtonCtrl.prototype.setCssClasses = function(newClasses)
{
    // set classes manually to validate the Object. Don't add any excess variables
    this.properties.enabledClass = newClasses.enabledClass;
    this.properties.disabledClass = newClasses.disabledClass;
    this.properties.focusedClass = newClasses.focusedClass;
    this.properties.downClass = newClasses.downClass;
    this.properties.heldClass = newClasses.heldClass;

    
    // Note: creating an array, means we only have to access the DOM once
    var classList = new Array(); // Array for all class names
    if (this._isEnabled === true)
    {
        if (this.properties.enabledClass != null)
        {
            classList.push(this.properties.enabledClass);
        }
    }
    else
    {
        if (this.properties.disabledClass != null)
        {
            classList.push(this.properties.disabledClass);
        }
    }
    
    if (this._isHighlighted && this.properties.downClass != null)
    {
       classList.push(this.properties.downClass);
    }
    
    if (this._isHeld && this.properties.heldClass != null)
    {
        classList.push(this.properties.heldClass);
    }
    
    if (this._controllerActive && this._hasFocus && this.properties.focusedClass != null)
    {
        classList.push(this.properties.focusedClass);
    }

    this.divElt.setAttribute("class", classList.join(' ')); // set the class list to the concatenated string
};

/*Function to make the highlight of the button ON or OFF*/
ButtonCtrl.prototype._setDownHighlight = function(value)
{
    log.debug("ButtonCtrl: _setDownHighlight() ", value);
    
    log.debug("   this.divElt.id: " + this.divElt.id);
    if (value)
    {
        this.divElt.classList.add(this.properties.downClass);
        this._isHighlighted = true;
    }
    else
    {
        this.divElt.classList.remove(this.properties.downClass);
        this._isHighlighted = false;
    }
};

/*Function to make the highlight of the button ON or OFF*/
ButtonCtrl.prototype._setHeldHighlight = function(value)
{
    log.debug("ButtonCtrl: _setHeldHightlight() ", value);
    log.debug("   this._isHeld: " + this._isHeld);
    
    log.debug("   this.divElt.id: " + this.divElt.id);
    
    if (value && !this._isHeld)
    {
        if (this._isHighlighted)
        {
            this.divElt.classList.remove(this.properties.heldClass);
        }
        
        this.divElt.classList.add(this.properties.heldClass);
        this._isHighlighted = true;
    }
    else if (this._isHeld)
    {
        if (this._isHighlighted)
        {
            this.divElt.classList.add(this.properties.heldClass);
        }
        
        this.divElt.classList.remove(this.properties.heldClass);
        this._isHighlighted = false;
    }
};

/*Function to make the focus highlight of the button ON or OFF*/
ButtonCtrl.prototype._setControllerHighlight = function(value)
{
    log.debug("ButtonCtrl: _setControllerHighlight() ", value);
    
    log.debug("   this.divElt.id: " + this.divElt.id);
    
    if (value)
    {
        this.divElt.classList.add(this.properties.focusedClass);
    }
    else
    {
        this.divElt.classList.remove(this.properties.focusedClass);
    }
};

/* Function that gets called when the mouse down event fires */
ButtonCtrl.prototype._onDownHandler = function(evt)
{
    log.debug("ButtonCtrl: _onDownHandler() ", evt);
    log.debug("   this._groupTouch.selectMode: " + this._groupTouch.selectMode);
    
    log.debug("   this.divElt.id: " + this.divElt.id);

    if (this._groupTouch.selectMode === null)
    {
        if (this._isEnabled === true) // don't get stuck in "touch" mode if disabled
        {
            if (!this._hasFocus && this.canStealFocus)
            {
                framework.common.stealFocus(); // steal focus
                this._acceptFocusHelper(true); // set the highlight
            }
            
            this._groupTouch.selectMode = "touch";
            this._selectStartHandler();

            // _upCallback used here as bound reference. Opera will correctly see a different target element when removing listener
            document.body.addEventListener("mouseup", this._upCallback);
        }
    }
};

/* Function that gets called when the mouse up event fires */
ButtonCtrl.prototype._onUpHandler = function(evt)
{
    log.debug("ButtonCtrl: _onUpHandler() ", evt);
    log.debug("   this._groupTouch.selectMode: " + this._groupTouch.selectMode);
    
    log.debug("   this.divElt.id: " + this.divElt.id);
    
    if (this._groupTouch.selectMode === "touch")
    {
        document.body.removeEventListener("mouseup", this._upCallback);
        
        // If another button in the group is being held, call its end handler first
        if (this._groupTouch.heldBtn)
        {
            this._groupTouch.heldBtn._selectEndHandler();
        }
        // Call this button's end handler
        this._selectEndHandler();
        
        this._groupTouch.selectMode = null;
    }
};

/* Function to do common work after a mouse down or a controller selectStart */
ButtonCtrl.prototype._selectStartHandler = function()
{
    log.debug("ButtonCtrl: _selectStartHandler() called...");
    
    log.debug("   this.divElt.id: " + this.divElt.id);    
    
    if (this._isEnabled === true)
    {
        this._isDown = true;
        this._setDownHighlight(true);
        
        this._groupTouch.focused = true;
        
        if (this.properties.buttonBehavior == "shortAndHold" || this.properties.buttonBehavior == "shortAndLong")
        {
            // set a timeout, if the button is still down at the end, set the hold state
            this._holdTimeoutId = setTimeout(this._onLongPressHandler.bind(this), this._holdTimeout);
        }
    }
};

/* 
 * Function to do common work for a mouse up or controller select 
 * @param   disabledCall    Boolean True if this is a forced callback due to the button being disabled (defaults to false)
 */
ButtonCtrl.prototype._selectEndHandler = function(disabledCall)
{
    log.debug("ButtonCtrl: _selectEndHandler() ", disabledCall);
    
    log.debug("   this.divElt.id: " + this.divElt.id);
    
    if (this._isEnabled === true)
    {   
        // Temp store these variables so that we can safely alter them before calling the callbacks
        var wasGroupFocus = this._groupTouch.focused;
        var wasHighlighted = this._isHighlighted;
        var wasHeld = this._isHeld;
        
        this._setDownHighlight(false);
        this._setHeldHighlight(false);
        clearTimeout(this._holdTimeoutId);
        
        this._isDown = false;
        this._isHeld = false;
        this._groupTouch.heldBtn = null;
        this._groupTouch.focused = false;
        
        if (wasGroupFocus)
        {
            if (wasHighlighted)
            {
                if ((!wasHeld || this.properties.buttonBehavior == "shortPressOnly") && disabledCall !== true) // if this function was called due to disabled, do not issue the selectCallback
                {
                    this._selected();
                }
                else if (wasHeld && this.properties.buttonBehavior == "shortAndHold")
                {
                    if (typeof this.properties.holdStopCallback == 'function')
                    {
                        this.properties.holdStopCallback(this, this.properties.appData, {"holdEvent": "stop"});
                    }
                }
            }            
        }
    }
    else
    {
        log.debug("Button disabled. No callback.");
    }
}

/* Called if the user holds the button down for a while. Only used when buttonBehavior is set
 * to "shortAndHold" or "shortAndLong"
 */
ButtonCtrl.prototype._onLongPressHandler = function()
{
    log.debug("ButtonCtrl: _onLongPressHandler() called...");
    
    log.debug("   this.divElt.id: " + this.divElt.id);
    
    if (this._isEnabled === true)
    {
        if (this._isDown || this._groupTouch.focused)
        {
            this._setHeldHighlight(true);
            this._isHeld = true;
            this._groupTouch.heldBtn = this;
        }
        
        //Callbacks
        if (this.properties.buttonBehavior == "shortAndHold")
        {
            if (typeof this.properties.holdStartCallback == 'function')
            {
                // Fire "beep" only if a callback exists
                this._beep("Long", this._beepEventType[this._groupTouch.selectMode]);
                this.properties.holdStartCallback(this, this.properties.appData, {"holdEvent": "start"});
            }
        }
        else if (this.properties.buttonBehavior == "shortAndLong")
        {
            if (typeof this.properties.longPressCallback == 'function')
            {
                // Fire "beep" only if a callback exists
                this._beep("Long", this._beepEventType[this._groupTouch.selectMode]);
                this.properties.longPressCallback(this, this.properties.appData, null);
            }
        }
    }
};

ButtonCtrl.prototype._onOverHandler = function(evt)
{
    //log.debug("mouse over event. isDown?", this._isDown, "Group focus?", this._groupTouch.focused, "group held?", this._groupTouch.heldBtn);
    if (this._isEnabled === true && this._groupTouch.selectMode === "touch")
    {
        if (this._isDown || this._groupTouch.focused)
        {
            // Make sure this button is not already being held and no button in the group is already being held
            if (!(this._isHeld || this._groupTouch.heldBtn))
            {
                this._setDownHighlight(true);
                
                if (!this._hasFocus && this.canStealFocus)
                {
                    framework.common.stealFocus(); // steal focus
                    this._acceptFocusHelper(true); // set the highlight
                }
                
                if (this.properties.buttonBehavior == "shortAndHold" || this.properties.buttonBehavior == "shortAndLong")
                {
                    clearTimeout(this._holdTimeoutId); // Clearing the timer if any before reset
                    // set a timeout, if the button is still down at the end, set the hold state
                    this._holdTimeoutId = setTimeout(this._onLongPressHandler.bind(this), this._holdTimeout);
                }
            }
            
        }
    }
    
};

ButtonCtrl.prototype._onOutHandler = function(evt)
{
    if (this._isEnabled === true && this._groupTouch.selectMode === "touch")
    {
        if (this._isDown || this._groupTouch.focused)
        {
            if (!this._isHeld)
            {
                this._setDownHighlight(false);
                this._setHeldHighlight(false);
                clearTimeout(this._holdTimeoutId);
            }
        }
    }
};

ButtonCtrl.prototype._selected = function()
{
    log.debug("ButtonCtrl: _selected() called...");
    
    log.debug("   this.divElt.id: " + this.divElt.id);
    
    if (typeof this.properties.selectCallback == 'function')
    {
        if (this.properties.buttonStyle == "checkbox")
        {
            var params = {};
            // Toggle checked state
            if (this._isChecked)
            {
                this._isChecked = false;
                if (this.properties.checkBoxData) // validate data
                {
                    params.checkBoxValue = this.properties.checkBoxData.uncheckedValue;
                }

                this._checkBoxIconDiv.style.backgroundImage = "url(" + this._isUncheckedIcn + ")";
            }
            else
            {
                this._isChecked = true;
                if (this.properties.checkBoxData) // validate data
                {
                    params.checkBoxValue = this.properties.checkBoxData.checkedValue;
                }

                this._checkBoxIconDiv.style.backgroundImage = "url(" + this._isCheckedIcn + ")";
            }

            // Fire "beep" only if callback exists (checked above)
            this._beep("Short", this._beepEventType[this._groupTouch.selectMode]);
            this.properties.selectCallback(this, this.properties.appData, params);
        }
        else // normal button
        {
            // Fire "beep" only if callback exists (checked above)
            this._beep("Short", this._beepEventType[this._groupTouch.selectMode]);
            this.properties.selectCallback(this, this.properties.appData, null);
        }
    }
    
};

/* (internal - called by the framework)
 * Handles multicontroller events.
 * @param   eventID (string) any of the “Internal event name” values in IHU_GUI_MulticontrollerSimulation.docx (e.g. 'cw',
 * 'ccw', 'select')
 */
ButtonCtrl.prototype.handleControllerEvent = function(eventId)
{
    log.debug("ButtonCtrl: handleController() ", eventId);
    
    log.debug("   this.divElt.id: " + this.divElt.id);
    
    //response will be return value at end of function
    var response = null;
    
    switch(eventId)
    {
        case "touchActive":
        	/*
            if (this._controllerActive && this._hasFocus)
            {
                this._setControllerHighlight(false);
            }
            */
            this._controllerActive = false;
            response = "consumed";
            break;
        case "controllerActive":
            this._controllerActive = true;
            if (this._hasFocus)
            {
                this._setControllerHighlight(true);
            }
            response = "consumed";
            break;
        case "selectStart":
            if (this._groupTouch.selectMode === null)
            {
                this._groupTouch.selectMode = "controller";
                this._selectStartHandler();
            }
            response = "consumed";
            break;
        case "select":
            if (this._groupTouch.selectMode === "controller")
            {
                this._selectEndHandler();
                this._groupTouch.selectMode = null;
            }
            response = "consumed";
            break;
        case "left":
            if (this._hasFocus)
            {
                response = "giveFocusLeft";
            }
            else
            {
                response = "ignored";
            }
            break;
        case "right":
            if (this._hasFocus)
            {
                response = "giveFocusRight";
            }
            else
            {
                response = "ignored";
            }
            break;
        case "down":
            if (this._hasFocus)
            {
                response = "giveFocusDown";
            }
            else
            {
                response = "ignored";
            }
            break;
        case "up":
            if (this._hasFocus)
            {
                response = "giveFocusUp";
            }
            else
            {
                response = "ignored";
            }
            break;
        case "cw":
            if (this._hasFocus)
            {
                response = "giveFocusCw";
            }
            else
            {
                response = "ignored";
            }
            break;
        case "ccw":
            if (this._hasFocus)
            {
                response = "giveFocusCcw";
            }
            else
            {
                response = "ignored";
            }
            break;
        case "acceptFocusInit": //intentional fallthrough. these cases have the same behavior
        case "acceptFocusFromLeft":  //intentional fallthrough. these cases have the same behavior
        case "acceptFocusFromRight":
        case "acceptFocusFromTop":
        case "acceptFocusFromBottom":
            log.debug(this.divElt.id + " is accepting focus. Currently hasFocus? ", this._hasFocus, "controllerActive? ", this._controllerActive);
            this._acceptFocusHelper(false);
            response = "consumed";
            break;
        case "lostFocus":
            log.debug("ButtonCtrl: lostFocus");
            
            log.debug("   this.divElt.id: " + this.divElt.id);
            
            this._hasFocus = false;
            if (this._controllerActive)
            {
                this._setControllerHighlight(false);
            }
            response = "consumed";
            break;
        default:
            break;
        
    }
    
    return response;

};

ButtonCtrl.prototype._acceptFocusHelper = function(stolen)
{
    log.debug("ButtonCtrl: _acceptFocusHelper() ", stolen);
    
    log.debug("   this.divElt.id: " + this.divElt.id);
    
    var hadFocusBefore = this._hasFocus;
    
    this._hasFocus = true;
    if (this._controllerActive)
    {
        this._setControllerHighlight(true);
    }
    
    if (hadFocusBefore == true)
    {
        // If this control already had focus, take no further action
        log.debug("This control already hd focus. Take no further action.");
        return;
    }
    
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
 * Button will issue any remaining callbacks before leaving the screen.
 */
ButtonCtrl.prototype.finishPartialActivity = function()
{
    log.debug("ButtonCtrl: finishPartialActivity() called...");
    
    log.debug("   this.divElt.id: " + this.divElt.id);
    // If currently held, call holdStopCallback
    
    if (this._groupTouch.selectMode === "touch")
    {
        document.body.removeEventListener("mouseup", this._upCallback);
        
        this._selectEndHandler(true); // treat this like a disabledCall
        this._groupTouch.selectMode = null;
    }
    else if (this._groupTouch.selectMode === "controller")
    {
        this._selectEndHandler(true);
        this._groupTouch.selectMode = null;
    }
    
};

/**
 * (internal) Cause an audible beep to be played
 * @param (String) Indicates a short press or a long press. Valid values are “Short” and “Long”.
 * @param (String) Indicates the user interaction that caused the beep. Valid values are “Touch”, “Multicontroller”, and “Hardkey”.
 */
ButtonCtrl.prototype._beep = function(pressType, eventCause)
{
    log.debug("ButtonCtrl: _beep() ", pressType, eventCause);
    // check for beep API
    if (framework.common.beep && eventCause != null)
    {
        // call beep
        framework.common.beep(pressType, eventCause);
    }
}

/*
 * Clean Up function must be called by the parent Control.
 */
ButtonCtrl.prototype.cleanUp = function()
{
    log.debug("ButtonCtrl: cleanUp() called...");
    
    log.debug("   this.divElt.id: " + this.divElt.id);
    
    this.divElt.removeEventListener("mousedown", this._downCallback);
    this.divElt.removeEventListener("mouseup", this._upCallback);
    this.divElt.removeEventListener("mouseout", this._outCallback);
    this.divElt.removeEventListener("mouseover", this._overCallback);

    // Safety check. The browser will not do anything if there is no listener
    document.body.removeEventListener("mouseup", this._upCallback);
    this._upCallback = null;

    clearTimeout(this._holdTimeoutId);
    delete this.properties;
};

framework.registerCtrlLoaded("ButtonCtrl");
