/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: TabsCtrl.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: 
 __________________________________________________________________________

 Description: IHU GUI Tabs Control

 Revisions:

 __________________________________________________________________________
 */
log.addSrcFile("TabsCtrl.js", "common");

// Global data to support the preferred tab position depending on whether the user is "tabbing right" or "tabbing left".
// Global data for different groups of tabs is kept separate, see _getTabGroupData().
//
// Example data for a single group:
// {
//    // (String) - Indicates whether the tab position should favor the "second" or "third" position if possible.
//    //   "second" is _X__
//    //   "third" is  __X_
//    favor : ""
// }
var TabsGroupData = {};

function TabsCtrl(uiaId, parentDiv, controlId, properties)
{    
    this.uiaId = uiaId;
    this.parentDiv = parentDiv;
    this.controlId = controlId;
    this.divElt = null;
    
    //@formatter:off
    this.properties = {
        "style" : 'tabsStyle1', // deprecated property
        "tabsConfig" : [],
        "defaultSelectCallback" : null,
        "currentlySelectedTab" : 0,
        "tabsGroup" : null,

        // (Number) Milliseconds to hold the controller left or right before fast-tilt kicks in. Default 1500.
        "tiltHoldTime" : 1500,

        // (Number) Milliseconds between fast-tilt steps. Default 500.
        "tiltStepTime" : 500,

        // (Callback) Invoked on tilt leftStart or rightStart but only when the tilt operation will cause a tab change to take place upon tilt release.
        "tiltStartCallback" : null,
    };
    //@formatter:on
    
    for(var i in properties)
    {
        this.properties[i] = properties[i];
    }
    
    // Private variables
    this._numTabs           = 0;            // (Number) Number of tabs originally configured when the Control was instantiated
    this._groupFocusObj     = new Object(); // (Object) Used for group touch behavior
    this._displayStartIndex;                // (Number) The index of the first tab displayed.
    this._displayEndIndex;                  // (Number) The index of the last tab displayed.

    this._fastTabStartIndex = -1;           // (Number) Index of current tab when the when the user starts tilt left or right.
    this._fastTabDirection = null;          // (String) Direction of fast tabbing, either "left" or "right".
    this._lastControllerStartEvent = "";    // (String) Used to ensure the current tabs control instance doesn't process tilt-release events from a previous tabs control instance.

    this._useSmallerFont = false;           // (Boolean) True suggests that the text in tabs is overflowing, use smaller font.

    this._selectTabBinder = this._selectTabCallback.bind(this);
    
    if (this.properties.tabsGroup === null)
    {
        log.warn("GUI app " + this.uiaId + " must configure a string value in the tabsGroup property.");
    }
    
    this._createStructure(); 
    this.parentDiv.appendChild(this.divElt);
}

TabsCtrl.prototype._getTabGroupData = function()
{
    if (this.properties.tabsGroup)
    {
        if (!TabsGroupData.hasOwnProperty(this.properties.tabsGroup))
        {
            TabsGroupData[this.properties.tabsGroup] = { favor: "" };
        }
        return TabsGroupData[this.properties.tabsGroup];
    }
    return null;
}

// Use smaller font in tab buttons if needed.
TabsCtrl.prototype._checkTabButtonTextOverflow = function()
{
    var tabTextboxWidth;
    var baseBtnStyle;
    
    if (this._numTabs === 2)
    {
        tabTextboxWidth = 338;                  // Tabs textbox width for 2 tabs
        baseBtnStyle = "TabsCtrlStyle2Button";  // BtnStyle for 2 tabs
    }
    else if (this._numTabs === 3)
    {
        tabTextboxWidth = 229;                  // Tabs textbox width for 3 tabs
        baseBtnStyle = "TabsCtrlStyle3Button";  // BtnStyle for 3 tabs
    }
    else if (this._numTabs >= 4)
    {
        tabTextboxWidth = 136;                  // Tabs textbox width for 4 or more tabs
        baseBtnStyle = "TabsCtrlStyle4Button";  // BtnStyle for 4 tabs
    }
    
    // create temp tab
    
    // Configuration properties for ButtonCtrl instances
    var buttonCtrlConfig = {
        "selectCallback" : null,
        "groupFocusObj" : this._groupFocusObj,
        "appData" : 1,
        "buttonBehavior" : "shortPressOnly",
        "enabledClass" : baseBtnStyle + "Enabled",
        "disabledClass" : baseBtnStyle + "Disabled",
        "downClass" : baseBtnStyle + "Down"
    };

    var tempTabBtn = framework.instantiateControl(this.uiaId, this.parentDiv, "ButtonCtrl", buttonCtrlConfig);
    
    var tempLabelSpan = document.createElement("span");
    tempTabBtn.divElt.appendChild(tempLabelSpan);
    tempLabelSpan.className = "TabsCtrlLabelSpan";
    // Add helper style for measuring the text
    tempLabelSpan.classList.add("TabsCtrlOverflowCheckHelper");
    
    // check for length restriction
    for(var i = 0; i < this._numTabs; i++)
    {
        // Check the pixel length of all tabs text with tabs width
        if (this.properties.tabsConfig[i].labelId)
        {
            tempLabelSpan.innerText = framework.localize.getLocStr(this.uiaId, this.properties.tabsConfig[i].labelId, this.properties.tabsConfig[i].subMap);
        }
        else if (this.properties.tabsConfig[i].label)
        {
            tempLabelSpan.innerText = this.properties.tabsConfig[i].label;
        }

        if (tempLabelSpan.clientWidth >= tabTextboxWidth)
        {
            this._useSmallerFont = true;
            break;
        }
        else
        {
            continue;
        }
    }
    
    framework.destroyControl(tempTabBtn);
    delete tempTabBtn;
}

TabsCtrl.prototype._createStructure = function()
{
    // create the div for control
    this.divElt = document.createElement('div');
    
    if (utility.toType(this.properties.tabsConfig) == 'array')
    {
        if (this.properties.tabsConfig.length > 0)
        {
            this._numTabs = this.properties.tabsConfig.length;
        }
        else
        {
            log.error("Tabs Control 'tabsConfig' must contain at least one Tab");
            return;
        }
    }
    else
    {
        log.error("Tabs Control property 'tabsConfig' must be given as type 'array'");
        return;
    }
    

    if (this._numTabs === 2)
    {
        // No arrow buttons
        this.divElt.className = "TabsCtrlStyle2";
    }
    else if (this._numTabs === 3)
    {
        // No arrow buttons
        this.divElt.className = "TabsCtrlStyle3";
    }
    else if (this._numTabs === 4)
    {
        // No arrow buttons
        this.divElt.className = "TabsCtrlStyle4";
    }    
    else if (this._numTabs > 4) // Left/Right Arrows needed
    {
        // Arrow buttons
        this.divElt.className = "TabsCtrlStyle4";

        var leftArrowButtonConfig = {
            "selectCallback" : this._arrowButtonSelect.bind(this),
            "groupFocusObj" : this._groupFocusObj,
            "appData" : "left",
            "buttonBehavior" : "shortPressOnly",
            "enabledClass" : "TabsCtrlStyle4PrevBtn",
            "disabledClass" : "TabsCtrlStyle4PrevBtn",
            "downClass" : "TabsCtrlStyle4PrevNextBtnHit",
        };
        this.leftArrow = framework.instantiateControl(this.uiaId, this.divElt, "ButtonCtrl", leftArrowButtonConfig);

        var rightArrowButtonConfig = {
            "selectCallback" : this._arrowButtonSelect.bind(this),
            "groupFocusObj" : this._groupFocusObj,
            "appData" : "right",
            "buttonBehavior" : "shortPressOnly",
            "enabledClass" : "TabsCtrlStyle4NextBtn",
            "disabledClass" : "TabsCtrlStyle4NextBtn",
            "downClass" : "TabsCtrlStyle4PrevNextBtnHit",
        };
        this.rightArrow = framework.instantiateControl(this.uiaId, this.divElt, "ButtonCtrl", rightArrowButtonConfig);
    }

    // Check if tab text from tabConfig overflows tab width.
    // Check must be done before creating actual tabs in setTabConfig().
    this._checkTabButtonTextOverflow();

    this._setTabsConfig(this.properties.tabsConfig);

    var mask = document.createElement('div');
    mask.className = "TabsCtrlBottomMask";
    this.divElt.appendChild(mask);
}

/*
 * Public function left in place to not break the build.
 */
TabsCtrl.prototype.setTabsConfig = function()
{
    log.warn("The setTabsConfig API has been deprecated.");
}

// Function sets the tabs button config, passing proper classes to button
TabsCtrl.prototype._setTabsConfig = function(config)
{
    // Destroy old buttons before creating new ones
    for(var i = 0; i < this._numTabs; i++)
    {
        if (this["tabBtnCtrl" + i])
        {
            framework.destroyControl(this["tabBtnCtrl" + i]);
            delete this["tabBtnCtrl" + i];
        }
    }

    // Image drop-shadow spans out 10 pixels to the
    // left and right. Adjust so images line up with
    // background button delimiters
    var dropShadowOffset;
    var tabBtnWidth;
    var tabOffset;
    var baseBtnStyle;
    var arrowBtnOffset;

    if (this._numTabs != config.length)
    {
        log.warn("Cannot change the number of Tabs after instantiation");
    }
    
    if (this._numTabs === 2)          // 2 Tabs - Phone
    {
        dropShadowOffset = 15;
        tabBtnWidth = 354;
        tabOffset = dropShadowOffset;
        baseBtnStyle = "TabsCtrlStyle2Button";
    }
    else if (this._numTabs === 3)     // 3 Tabs - Favorites
    {
        dropShadowOffset = 16;
        tabBtnWidth = 238;
        tabOffset = dropShadowOffset;
        baseBtnStyle = "TabsCtrlStyle3Button";
    }
    
    else if (this._numTabs >= 4)     // 4 or more Tabs - Settings
    {
        arrowBtnOffset = 84;
        dropShadowOffset = 0;
        tabBtnWidth = 143;
        tabOffset = dropShadowOffset + arrowBtnOffset;
        baseBtnStyle = "TabsCtrlStyle4Button";
    }

    this._displayStartIndex = this._getDisplayStartIndex(config);    
    this._displayEndIndex = this._displayStartIndex + 3;
    if (this._displayEndIndex > config.length - 1)
    {
        this._displayEndIndex = config.length - 1;
    }
    var displayedButtonCount = 0;

    log.debug("Showing buttons " + this._displayStartIndex + " to " + this._displayEndIndex);

    for(var i = this._displayStartIndex; i <= this._displayEndIndex; i++)
    {
        config[i].left = ((displayedButtonCount * tabBtnWidth) + tabOffset);

        // Configuration properties for ButtonCtrl instances
        var buttonCtrlConfig = {
            "selectCallback" : this._selectTabBinder,
            "groupFocusObj" : this._groupFocusObj,
            "appData" : i,
            "buttonBehavior" : "shortPressOnly",
            "enabledClass" : baseBtnStyle + ((i === this.properties.currentlySelectedTab) ? "EnabledCurrent" : "Enabled"),
            "disabledClass" : baseBtnStyle + "Disabled",
            "downClass" : baseBtnStyle + ((i === this.properties.currentlySelectedTab) ? "DownCurrent" : "Down")
        };

        this["tabBtnCtrl" + i] = framework.instantiateControl(this.uiaId, this.divElt, "ButtonCtrl", buttonCtrlConfig);
        this["tabBtnCtrl" + i].divElt.style.left = config[i].left + "px";
        
        this["labelSpan" + i] = document.createElement("span");
        this["labelSpan" + i].className = "TabsCtrlLabelSpan";

        if (this._useSmallerFont === true)
        {
            this["tabBtnCtrl" + i].divElt.classList.add('TabsCtrlSmallerFontSize');
        }

        this["tabBtnCtrl" + i].divElt.appendChild(this["labelSpan" + i]);


        // Add text to tab
        if (config[i].labelId)
        {
            this["labelSpan" + i].innerText = framework.localize.getLocStr(this.uiaId, config[i].labelId, config[i].subMap);
        }
        else if (config[i].label)
        {
            this["labelSpan" + i].innerText = config[i].label;
        }
        if (config[i].disabled === true)
        {
            this["tabBtnCtrl" + i].setEnabled(false);
        }
        this._setTabButtonIcon(i);

        displayedButtonCount++;
    }

    this._enableArrows();
}

// Decides which tab should appear on the left and returns that index.
TabsCtrl.prototype._getDisplayStartIndex = function(config)
{
    if (this._numTabs <= 4)
    {
        return 0;
    }
    else
    {
        var startIndex = this.properties.currentlySelectedTab;

        // Look at Tabs group history if available
        var groupData = this._getTabGroupData();
        if (groupData)
        {
            if (groupData.favor === "" || groupData.favor === "second")
            {
                // Try to show the current tab in second position: _x__
                startIndex = startIndex - 1;
            }
            else if (groupData.favor === "third")
            {
                // Try to show current tab in third position: __x_
                startIndex = startIndex - 2;
            }
        }

        // Validate startIndex
        if (startIndex < 0)
        {
            startIndex = 0;
        }
        else if (startIndex > (config.length - 4))
        {
            startIndex = config.length - 4;
        }

        return startIndex;
    }
}

TabsCtrl.prototype._enableArrows = function()
{
    if (this._numTabs > 4)
    {
        this._enableLeftArrow(this._getPrevOffscreenTabIndex() !== -1);
        this._enableRightArrow(this._getNextOffscreenTabIndex() !== -1);
    }
}

TabsCtrl.prototype._enableLeftArrow = function(isEnabled)
{
    if (isEnabled)
    {
        this.leftArrow.setEnabled(true);
        this.leftArrow.setCssClasses({
            enabledClass: "TabsCtrlStyle4PrevBtn",
            downClass: "TabsCtrlStyle4PrevNextBtnHit"
        });
        
        this.leftArrow.setButtonIcon("common/controls/Tabs/images/Tab_ArrowLeft.png");            
    }
    else
    {
        this.leftArrow.setEnabled(false);

        this.leftArrow.setCssClasses({
            disabledClass: "TabsCtrlStyle4PrevBtn"
        });            
        
        this.leftArrow.setButtonIcon("common/controls/Tabs/images/Tab_ArrowLeft_Ds.png");
    }
}

TabsCtrl.prototype._enableRightArrow = function(isEnabled)
{
    if (isEnabled)
    {
        this.rightArrow.setEnabled(true);
        this.rightArrow.setCssClasses({
            enabledClass: "TabsCtrlStyle4NextBtn",
            downClass: "TabsCtrlStyle4PrevNextBtnHit"
        });
        
        this.rightArrow.setButtonIcon("common/controls/Tabs/images/Tab_ArrowRight.png");
    }
    else
    {
        this.rightArrow.setEnabled(false);
        this.rightArrow.setCssClasses({
            disabledClass: "TabsCtrlStyle4NextBtn"
        });
        
        this.rightArrow.setButtonIcon("common/controls/Tabs/images/Tab_ArrowRight_Ds.png");
    }
}

TabsCtrl.prototype.setTabDisabled = function(index, disabled)
{
    this.properties.tabsConfig[index].disabled = disabled;
    var button = this["tabBtnCtrl" + index];
    if (typeof button !== 'undefined')
    {
        this["tabBtnCtrl" + index].setEnabled(!disabled);
        this._setTabButtonIcon(index);
    }
    this._enableArrows();
}

TabsCtrl.prototype._setTabButtonIcon = function(index)
{
    var config = this.properties.tabsConfig[index];
    if (typeof config.imageBase === 'string')
    {
        var hasPath = (/\/|\\/).test(config.imageBase);
        var icon; 
        if (hasPath)
        {
            icon = config.imageBase;
        }
        else
        {
            icon = "common/images/icons/" + config.imageBase;
        }

        if (config.disabled === true || config.disabled === false)
        {
            // Use the button's current enabled state instead of config.disabled here
            if (this["tabBtnCtrl" + index].isEnabled)
            {
                icon = icon + "_En.png";
            }
            else
            {
                icon = icon + "_Ds.png";
            }
        }
        else
        {
            icon = icon + ".png";
        }

        this["tabBtnCtrl" + index].setButtonIcon(icon);
    }
}

TabsCtrl.prototype._arrowButtonSelect = function(controlRef, appData, params)
{
    var groupData = this._getTabGroupData();
    if (appData === "left" && this._displayStartIndex > 0)
    {
        if (groupData)
        {
            groupData.favor = "third";
        }
        this._invokeCallbackForTab(this._getPrevOffscreenTabIndex());
    }
    else if (appData === "right" && this._displayEndIndex < this.properties.tabsConfig.length - 1)
    {
        if (groupData)
        {
            groupData.favor = "second";
        }
        this._invokeCallbackForTab(this._getNextOffscreenTabIndex());
    }
}

// Returns index of the first enabled tab left of this._displayStartIndex
TabsCtrl.prototype._getPrevOffscreenTabIndex = function()
{
    for (var i = this._displayStartIndex - 1; i >= 0; --i)
    {
        if (!this.properties.tabsConfig[i].disabled)
        {
            return i;
        }
    }

    return -1;
}

// Returns index of the first enabled tab right of this._displayEndIndex
TabsCtrl.prototype._getNextOffscreenTabIndex = function()
{
    for (var i = this._displayEndIndex + 1; i < this.properties.tabsConfig.length; ++i)
    {
        if (!this.properties.tabsConfig[i].disabled)
        {
            return i;
        }
    }
    return -1;
}

TabsCtrl.prototype._fastTabTo = function(newTabIndex)
{
    this.properties.currentlySelectedTab = newTabIndex;
    this._setTabsConfig(this.properties.tabsConfig);

    // Invoke the the selected tabs callback now if we are have reached the left-most or right-most tab.
    if (this._fastTabDirection === "left" && this._getPrevTabIndex() === -1)
    {
        this._invokeCallbackForTab(this.properties.currentlySelectedTab);
    }
    else if (this._fastTabDirection === "right" && this._getNextTabIndex() === -1)
    {
        this._invokeCallbackForTab(this.properties.currentlySelectedTab);
    }
}

TabsCtrl.prototype._startFastTabHoldTimer = function()
{
    if (typeof this.properties.tiltStartCallback === 'function')
    {
        this.properties.tiltStartCallback(this, this.properties.appData, null);
    }
    this._fastTabHoldTimerId = setTimeout(this._startFastTabIntervalTimer.bind(this), this.properties.tiltHoldTime);
}

TabsCtrl.prototype._startFastTabIntervalTimer = function()
{
    this._fastTabStep();
    this._fastTabIntervalId = setInterval(this._fastTabStep.bind(this), this.properties.tiltStepTime);
}

TabsCtrl.prototype._fastTabStep = function()
{
    // Move to the prev/next tab if possible
    var newTabIndex = -1;
    if (this._fastTabDirection === "left")
    {
        newTabIndex = this._getPrevTabIndex();
    }
    else if (this._fastTabDirection === "right")
    {
        newTabIndex = this._getNextTabIndex();
    }

    if (newTabIndex !== -1)
    {
        this._fastTabTo(newTabIndex);
    }
}

TabsCtrl.prototype._cancelFastTab = function()
{
    this._lastControllerStartEvent = "";
    clearTimeout(this._fastTabHoldTimerId);
    clearInterval(this._fastTabIntervalId);
    this._fastTabHoldTimerId = null;
    this._fastTabIntervalId = null;
}

TabsCtrl.prototype.handleControllerEvent = function(eventId)
{
    // NOTE: In theory, TabsCtrl will NEVER recieve a
    // multicontroller event apart from "left" or "right"
    // It cannot be selected and cannot have focus
    var retVal = "ignored";

    switch (eventId) 
    {
        case "leftStart":
            this._lastControllerStartEvent = eventId;

            var groupData = this._getTabGroupData();
            if (groupData)
            {
                groupData.favor = "second";
            }

            this._fastTabStartIndex = this.properties.currentlySelectedTab;
            this._fastTabDirection = "left";

            var newTabIndex = this._getPrevTabIndex();
            if (newTabIndex !== -1)
            {
                this._fastTabTo(newTabIndex);
                this._startFastTabHoldTimer();
            }

            retVal = "consumed";
            break;

        case "left":
            if (this._lastControllerStartEvent === "leftStart")
            {
                this._cancelFastTab();
                if (this.properties.currentlySelectedTab !== this._fastTabStartIndex)
                {
                    this._invokeCallbackForTab(this.properties.currentlySelectedTab);
                    retVal = "consumed";
                }
                else
                {
                    retVal = "giveFocusLeft";
                }
            }
            this._lastControllerStartEvent = "";
            break;

        case "rightStart":
            this._lastControllerStartEvent = eventId;

            var groupData = this._getTabGroupData();
            if (groupData)
            {
                groupData.favor = "third";
            }

            this._fastTabStartIndex = this.properties.currentlySelectedTab;
            this._fastTabDirection = "right";

            var newTabIndex = this._getNextTabIndex();
            if (newTabIndex !== -1)
            {
                this._fastTabYieldFocus = false;
                this._fastTabTo(newTabIndex);
                this._startFastTabHoldTimer();
            }
            else
            {
                this._fastTabYieldFocus = true;
            }

            retVal = "consumed";
            break;

        case "right":
            if (this._lastControllerStartEvent === "rightStart")
            {
                this._cancelFastTab();
                if (this.properties.currentlySelectedTab !== this._fastTabStartIndex)
                {
                    this._invokeCallbackForTab(this.properties.currentlySelectedTab);
                    retVal = "consumed";
                }
                else
                {
                    retVal = "giveFocusRight";
                }
            }
            this._lastControllerStartEvent = "";
            break;

        default:
            break;
    }

    return retVal;
    /*
     * returns
     * - giveFocusLeft (control retains highlight unless it later gets lostFocus event)
     * - giveFocusRight
     * - giveFocusUp
     * - giveFocusDown
     * - consumed (always returned on select event, and if control adjusted highlight)
     * - ignored (returned only if control doesn't know about focus)
     */
}

// Callback invoked when user touches a tab button.
TabsCtrl.prototype._selectTabCallback = function(controlRef, appData, params)
{
    var index = appData;
    var groupData = this._getTabGroupData();
    if (groupData)
    {
        if (index < this.properties.currentlySelectedTab)
        {
            groupData.favor = "second";
        }
        else if (index > this.properties.currentlySelectedTab)
        {
            groupData.favor = "third";
        }
    }
    this._invokeCallbackForTab(index);
}

// Invoke the callback into the host app for the given tab index.
TabsCtrl.prototype._invokeCallbackForTab = function(index)
{
    if (0 <= index && index < this.properties.tabsConfig.length)
    {
        var appData = this.properties.tabsConfig[index].appData;
        var callback = this.properties.tabsConfig[index].selectCallback;
        if (typeof callback !== 'function')
        {
            callback = this.properties.defaultSelectCallback;
        }

        if (typeof callback === 'function')
        {
            callback(this, appData, null);
        }
    }
}

// Returns index of the first enabled tab left of the current tab or -1 if none found.
TabsCtrl.prototype._getPrevTabIndex = function()
{
    for (var i = this.properties.currentlySelectedTab - 1; i >= 0; --i)
    {
        if (!this.properties.tabsConfig[i].disabled)
        {
            return i;
        }
    }

    return -1;
}

// Returns index of the first enabled tab right of the current tab or -1 if none found.
TabsCtrl.prototype._getNextTabIndex = function()
{
    for (var i = this.properties.currentlySelectedTab + 1; i < this.properties.tabsConfig.length; ++i)
    {
        if (!this.properties.tabsConfig[i].disabled)
        {
            return i;
        }
    }
    return -1;
}

TabsCtrl.prototype.finishPartialActivity = function()
{
    this._cancelFastTab();
}

TabsCtrl.prototype.cleanUp = function()
{
    log.debug("TabsCtrl: cleanUp() called...");

    this._cancelFastTab();

    if (this.leftArrow) 
    {
        this.leftArrow.cleanUp();
    }

    if (this.rightArrow)
    {
        this.rightArrow.cleanUp();
    }

    for(var i = 0; i < this._numTabs; i++)
    {
        if (this["tabBtnCtrl" + i])
        {
            this["tabBtnCtrl" + i].cleanUp();
        }
    }
}

framework.registerCtrlLoaded("TabsCtrl");
