/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: ScreenSettings2Ctrl.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Authors: abrow198, ahanisk
 Date: 11-15-2012
 __________________________________________________________________________

 Description: IHU GUI Screen Settings Control (varient 2 - single context)
 Revisions:
 v0.1: Initial draft
 v0.2: Secondary button added
 v0.3: Added Interfaces to enable / disbale - Adjust Buttons - aalangs
       Separated instantiation logic of Adjust button in separate method -
       instantiateAdjustBtn - aalangs
       Added setcCss class logic for multicontroller issue - aalangs
 v0.4: Fixed event listener issue. Added new API for hiding the PSM button -awoodhc
 __________________________________________________________________________

 */

log.addSrcFile("ScreenSettings2Ctrl.js", "common");

function ScreenSettings2Ctrl(uiaId, parentDiv, controlId, properties)
{  
    log.debug("ScreenSettings2Ctrl constructor called...");
    
    this.uiaId = uiaId;
    this.divElt = null;
    this.controlId = controlId;
    this.parentDiv = parentDiv;
    this._tabsCont;                         // (Object) Background/Parent item for the Tabs and their contents
    this._closeBg;                          // (Object) Semi-transparent background item for behind the close button when tabs are open
    this._tabsVisble = false;               // (Boolean) indicates that tabs should be shown
    this._adjustBtn = null;                 // (Object) button to hide or show the tabs
    this._adjustProperties = null;          // (Object) Adjust button properties when tabs are hidden
    this._adjustBtnFocused = false;         // (Boolean) Ture if the Adjust (or Close) button is focused.
    this._closeProperties = null;           // (Object) Adjust button properties when tabs are visible
    this._secondaryOpenProperties = null;   // (Object) secondary button properties when graphic is hidden
    this._secondaryCloseProperties = null;  // (Object) secondary button properties when graphic is visible
    this._secBtnIsAnimating = false;        // (Boolean) True if the secondary button is currently in an animation
    this._secondaryBtnVisible = false;      // (Boolean) True if secondary butt is displayed. When Tabs are open, this variable should not be checked!
    this._atSpeed;                          // (Boolean) True if speed threshold has been exceeded.
    this._pixelTabWidth = 145;              // (Integer) Width in pixels of the tabs (including margins).
    this._sliderWidth = 670;                // (Integer) Width in pixels of the slider clickable area.
    
    this._currTab = 0;                      // (Number) The index of the currently selected tab
    this._currSliderCont = null;            // The current slider container that is being displayed
    this._currItemConfig = null;            // (Object) [Read-Only] The config for the current slider
    this._currItemConfigValue = 0;          // (Number) Dereferenced value for the slider
    this._sliderContOffsetX = 0;            // (Number) offset of the slider container
    this._handleHalfWidth = 0;              // (Number) width of the current handle
    this._animationCompleteCallback;        // (Function) This stores the callback function passed into startAnimation() by the app.
                                            // ^^ It is called from _aniCompleteHandler(), to notify the app of a completed animation.
    
    //@formatter:off
    this.properties = {
        "style": "top",           // (String) Options "top," "bottom"
        "adjustButtonConfig" : null,    // (Object) passes properties to the adjust/close button
        "tabsButtonConfig" : null,      // (Object) passes specific properties to each of the 5 tabs
        "secondaryButtonConfig" : null, // (Object) Specifies what the secondary button will display, if it is displayed (e.g. PSM Button)
        "secondaryButtonCallback" : null,
        "slideCallback" : null,         // (Function) Called when a slider in the tabs menu is changed
        "secondaryButtonAniTime": 0.5,  // (Number) time in seconds of the animation duration for the secondary button
        "selectCallback" : null,        // (Function) Called when a button in the tabs menu is selected (e.g. Reset All Button)
    };
    //@formatter:on
    
    for (var i in properties)
    {
        this.properties[i] = properties[i];
    }


    this.divElt = document.createElement('div');
    this.divElt.className = "ScreenSettings2Ctrl";
    this.divElt.id = controlId;
    if (this.properties.style === "bottom")
    {
        this.divElt.style.top = "340px";
    }
    
    this._createStructure();
    
    parentDiv.appendChild(this.divElt);
}

ScreenSettings2Ctrl.prototype._createStructure = function()
{   
    // Set up the adjust button. Use a new set of button properties for each state so that we can properly display the graphics
    this._adjustProperties = {
        "enabled": this.properties.adjustButtonConfig.enabled,
        "enabledClass" : "ScreenSettings2CtrlAdjustBtn_En",
        "disabledClass" : "ScreenSettings2CtrlAdjustBtn_Ds",
        "focusedClass" : "ScreenSettings2CtrlAdjustBtn_Focused",
        "downClass" : "ScreenSettings2CtrlAdjustBtn_Down",
        "appData" : this.properties.adjustButtonConfig.appData,
        "selectCallback" : this._adjustSelectHandler.bind(this),
    };    
    this._closeProperties = {
        "enabledClass" : "ScreenSettings2CtrlCloseBtn_En",
        "focusedClass" : "ScreenSettings2CtrlCloseBtn_Focused",
        "downClass" : "ScreenSettings2CtrlCloseBtn_Down",
        "appData" : this.properties.adjustButtonConfig.appData,
        "selectCallback" : this._adjustSelectHandler.bind(this),
    };
    if (this.properties.style === "bottom")
    {
        this._adjustProperties.enabledClass = "ScreenSettings2Ctrl_Bottom_AdjustBtn_En";
        this._adjustProperties.disabledClass = "ScreenSettings2Ctrl_Bottom_AdjustBtn_Ds";
        this._adjustProperties.focusedClass = "ScreenSettings2Ctrl_Bottom_AdjustBtn_Focused";
        this._adjustProperties.downClass = "ScreenSettings2Ctrl_Bottom_AdjustBtn_Down";
        this._closeProperties.enabledClass = "ScreenSettings2Ctrl_Bottom_CloseBtn_En";
        this._closeProperties.focusedClass = "ScreenSettings2Ctrl_Bottom_CloseBtn_Focused";
        this._closeProperties.downClass = "ScreenSettings2Ctrl_Bottom_CloseBtn_Down";
    }

    if (this.properties.secondaryButtonConfig)
    {
        // Set up the secondary button.
        this._secondaryOpenProperties = {
            "enabledClass" : "ScreenSettings2CtrlSecondaryOpenBtn_En",
            "focusedClass" : "ScreenSettings2CtrlSecondaryOpenBtn_Focused",
            "downClass" : "ScreenSettings2CtrlSecondaryOpenBtn_Down",
            "appData" : this.properties.secondaryButtonConfig.appData,
            "selectCallback" : this._secondaryBtnSelectHandler.bind(this),
        };
    
        this._secondaryCloseProperties = {
            "enabledClass" : "ScreenSettings2CtrlSecondaryCloseBtn_En",
            "focusedClass" : "ScreenSettings2CtrlSecondaryCloseBtn_Focused",
            "downClass" : "ScreenSettings2CtrlSecondaryCloseBtn_Down",
            "appData" : this.properties.secondaryButtonConfig.appData,
            "selectCallback" : this._secondaryBtnSelectHandler.bind(this),
        };
    
        this._secondaryBtnVisible = true;
        this._secondaryBtnIsOpened = this.properties.secondaryButtonConfig.startOpened;
        log.debug("secondaryButton state: " + this._secondaryBtnIsOpened);
        this._instantiateSecondaryBtn();
    }

    this._tabsVisible = this.properties.tabsButtonConfig.visible;
    
    this._closeBg = document.createElement('div');
    this._closeBg.className = "ScreenSettings2CtrlCloseBtn_Bg";
    // Create a tabs container
    this._tabsCont = document.createElement('div');
    this._tabsCont.className = "ScreenSettings2CtrlTabsBg";
    if (this._tabsVisible == true)
    {
        this._closeBg.style.display = "block";
        this._tabsCont.style.display = "block";
        this._adjustBtnFocused = false;
    }
    else
    {
        this._closeBg.style.display = "none";
        this._tabsCont.style.display = "none";
    }
    this.divElt.appendChild(this._closeBg)

    // instantiate adjust button
    this._instantiateAdjustBtn();
    
    this._setDefaultFocus();


    // Add tab buttons
    this._tabs = new Array();
    this._groupFocusObj = new Object(); // Used for group touch behavior
    var tabsConfig = this.properties.tabsButtonConfig.tabsConfig;
    for (var i = 0; i < tabsConfig.length; i++)
    {
        // store properties for each tab button
        var tabProperties = {
            "enabledClass" : "ScreenSettings2CtrlTabBtn_En",
            "disabledClass" : "ScreenSettings2CtrlTabBtn_Ds",
            "focusedClass" : "ScreenSettings2CtrlTabBtn_Selected",
            "downClass" : "ScreenSettings2CtrlTabBtn_Down",
            "label" : tabsConfig[i].label,
            "labelId" : tabsConfig[i].labelId,
            "groupFocusObj" : this._groupFocusObj,
            "selectCallback" : this._tabSelectHandler.bind(this),
            "appData" : {"index": i, "data" : tabsConfig[i].appData}
        };
        
        // make each tab a button
        this._tabs[i] = framework.instantiateControl(this.uiaId, this._tabsCont, "ButtonCtrl", tabProperties);
        this._tabs[i].divElt.style.left = (i * this._pixelTabWidth) + "px";
        
        // make a slider container for each tab
        var sliderCont = document.createElement('div');
            sliderCont.className = "ScreenSettings2CtrlSliderContainer";

        var itemConfig = this.properties.tabsButtonConfig.tabsConfig[i].itemConfig;
        
        var sliderTickMarkObject = {
            tickMarkStyle: "ScreenSettings2CtrlTickMarkTop",
            centerMarkTopStyle: "ScreenSettings2CtrlCenterMarkTop01",
            centerMarkBottomStyle: "ScreenSettings2CtrlCenterMarkBottom01",
            showNumbers: false,
            tickIncrement: itemConfig.tickIncrement,
            showCenterMark: true
        };
                
        if (sliderTickMarkObject.tickIncrement == null)
        {
            sliderTickMarkObject.tickIncrement = itemConfig.increment;
        }
            
        var plusMinusObject = {
            plusSignStyle : "ScreenSettings2CtrlPlus",
            minusSignStyle : "ScreenSettings2CtrlMinus"
        };
        
        var itemStyle = itemConfig.style;
        if (itemStyle == 'pivot' || itemStyle == 'slider')
        {
            var sliderProperties = {
                "style": itemConfig.style,
                "slideCallback": this._slideHandler.bind(this),
                "minChangeInterval": itemConfig.minChangeInterval,
                "settleTime": itemConfig.settleTime,
                "rotationIdleDetectTime" : itemConfig.rotationIdleDetectTime,
                "min": itemConfig.min,
                "max": itemConfig.max,
                "increment": itemConfig.increment,
                "value": itemConfig.value,
                "appData": {"realAppData": itemConfig.appData, "ctrlData": {"tab":i}},
                "width": this._sliderWidth,
                // tick information
                "showTickMarks": true,
                "tickMarkObject" : sliderTickMarkObject,
                "showPlusMinus" : true,
                "plusMinusObject" : plusMinusObject,
                "wrapperClass": "ScreenSettings2CtrlSliderBg",
                "fillClass": "ScreenSettings2CtrlSliderFill",
                "handleClass": "ScreenSettings2CtrlSliderHandle",
                "focusedWrapperClass": "ScreenSettings2CtrlSliderBg_Focused",
                "focusedFillClass": "ScreenSettings2CtrlSliderFill_Focused",
                "focusedHandleClass": "ScreenSettings2CtrlSliderHandle_Focused",
                "disabledWrapperClass": "ScreenSettings2CtrlSliderBg_Ds",
                "disabledFillClass": "ScreenSettings2CtrlSliderFill_Ds",
                "disabledHandleClass": "ScreenSettings2CtrlSliderHandle_Ds",
            };
            sliderCont.slider = framework.instantiateControl(this.uiaId, sliderCont, 'SliderCtrl', sliderProperties);
        }
        else if (itemStyle == "oneButton")
        {
            // add button control to container
            var btnProperties = {
                "enabledClass" : "ScreenSettings2CtrlOneBtn_En",
                "disabledClass" : "ScreenSettings2CtrlOneBtn_Ds",
                "focusedClass" : "ScreenSettings2CtrlOneBtn_Focused",
                "downClass" : "ScreenSettings2CtrlOneBtn_Down",
                "labelId" : tabsConfig[i].itemConfig.buttonId,
                "selectCallback" : this._buttonSelectHandler.bind(this),
                "appData" : tabsConfig[i].appData
            };
            
            sliderCont.button1 = framework.instantiateControl(this.uiaId, sliderCont, "ButtonCtrl", btnProperties);
        }
        
        this._tabs[i].sliderCont = sliderCont;
        
        // assert that no more than 5 tabs are being created
        if ((i == 4) && (tabsConfig.length > 5))
        {
            log.error("only 5 tabs can be created");
            break;
        }
    }
    
    if (this._tabsVisible)
    {
        // Set initial tab
        var initialTab = this.properties.tabsButtonConfig.currentlySelectedTab;
        log.debug("initialTab: " + initialTab);
        this._createTab(initialTab);
    }
    
    this.divElt.appendChild(this._tabsCont);
};

/*
 * Manages the default focus on Adjust and Secondary Button (PSM)
 */

ScreenSettings2Ctrl.prototype._setDefaultFocus = function()
{
    // If tabs are visible, do nothing. Focus will default to a tab item
    if (!this._tabsVisible)
    {
        
        if (this.properties.secondaryButtonConfig != null)
        {
            this._adjustBtnFocused = false;
            this._secondaryBtn.handleControllerEvent("controllerActive");
            this._secondaryBtn.handleControllerEvent("acceptFocusInit");
        }
        else if (this.properties.adjustButtonConfig.enabled == true)
        {
            this._adjustBtnFocused = true;
            this._adjustBtn.handleControllerEvent("controllerActive");
            this._adjustBtn.handleControllerEvent("acceptFocusInit");
        }
        else
        {
            // Do nothing
        }
    }
}

/*
 * Initialize the tab at the given index
 */
//TODO: rename to _openTab()
ScreenSettings2Ctrl.prototype._createTab = function(tabIndex)
{
    if (this._currTab > -1) //make sure focus is NOT leaving the close button
    {   // focus is moving from one tab to another
        // close the previous tab
        this._tabs[this._currTab].handleControllerEvent("lostFocus");

        if (this._currSliderCont)
        {
            this._currSliderCont.classList.add('hidden');
        }
    }
    else 
    {   //focus is leaving the Close button
        this._adjustBtnFocused = false;
        this._adjustBtn.handleControllerEvent("lostFocus");
    }
   
    // highlight the current tab
    this._currTab = tabIndex;
    this._tabs[this._currTab].handleControllerEvent("controllerActive");
    this._tabs[this._currTab].handleControllerEvent("acceptFocusInit");
    
    // set default values
    this._currItemConfig = this.properties.tabsButtonConfig.tabsConfig[this._currTab].itemConfig;
    if (!this._currItemConfig)
    {
        log.error("tabsConfig does not have entry for itemConfig at Tab: " + this._currTab);
    }
    if (!this._currItemConfig.min)
    {
        this._currItemConfig.min = 0;
    }
    if (!this._currItemConfig.max)
    {
        this._currItemConfig.min = 1;
    }
    if (!this._currItemConfig.increment)
    {
        this._currItemConfig.increment = 0.1;
    }
    
    // create tab  contents
    this._currItemConfigValue = this._currItemConfig.value;
    if (this._currItemConfig.style == "pivot" || this._currItemConfig.style == "slider")
    {
        log.debug("creating slider in the current tab...");
        var newSliderCont = this._tabs[this._currTab].sliderCont;
        this._tabsCont.appendChild(newSliderCont);
        newSliderCont.slider.handleControllerEvent("acceptFocusInit");
    }
    else if (this._currItemConfig.style == "oneButton")
    {
        log.debug("creating button in the current tab...");
        var newSliderCont = this._tabs[this._currTab].sliderCont;
        this._tabsCont.appendChild(newSliderCont);
        newSliderCont.button1.handleControllerEvent("controllerActive");
        newSliderCont.button1.handleControllerEvent("acceptFocusInit");
    }

    this._currSliderCont = this._tabs[this._currTab].sliderCont;    
    this._currSliderCont.classList.remove('hidden');
}

/*
 * Get the POS of the given element. POS is relative to the top left corner of the HTML document.
 */
//TODO: remove unused function
ScreenSettings2Ctrl.prototype._getPos = function(el) 
{
    // Walk up the document tree, looping through all parent elements
    for (var lx=0, ly=0; el != null; el = el.offsetParent)
    {
        lx += el.offsetLeft;
        ly += el.offsetTop;
    }
            
    return {x: lx, y: ly};
};

/*
 * Handler for when the adjust button is clicked. Toggles the visibility of tabs.
 */
ScreenSettings2Ctrl.prototype._adjustSelectHandler = function(e)
{
    if (!this._adjustBtn.isEnabled)
    {
        return; //ignore events if button is disabled
    }

    if (typeof this.properties.adjustButtonConfig.selectCallback == 'function')
    {
        var appData = this.properties.appData;
        var params = {"opened": this._tabsVisible};
        this.properties.adjustButtonConfig.selectCallback(this, appData, params);
        this._tabsVisible = !this._tabsVisible;        
    }
};

/*
 * Called when a tab is selected. Switches to the selected tab.
 */
ScreenSettings2Ctrl.prototype._tabSelectHandler = function(ctrlRef, appData, params)
{
    log.debug("_tabSelectHandler called, appData.index: " + appData.index);
    
    this._createTab(appData.index);
};

/*
 * Button select handler for buttons inside the tabs. Sends result to the app using a callback.
 */
ScreenSettings2Ctrl.prototype._buttonSelectHandler = function(ctrlRef, appData, params)
{
    if (this.properties.selectCallback != null)
    {
        var appData = this.properties.tabsButtonConfig.tabsConfig[this._currTab].itemConfig.appData;
        var params = {"buttonIndex": this._currTab, "tabsShown": this._tabsVisible}; // TODO: are these params even needed here?
        this.properties.selectCallback(this, appData, params);
    }
}

/*
 * Handler for SliderCtrl object within tabs
 */
ScreenSettings2Ctrl.prototype._slideHandler = function(ctrlRef, appData, params)
{
    log.debug("Screensettings _slideHandler called: ", ctrlRef, appData, params);
    
    var tabIndex = appData.ctrlData.tab;
    if (tabIndex != null)
    {        
        if (typeof this.properties.slideCallback == 'function')
        {
            this.properties.slideCallback(this, appData.realAppData, params);
        }
    }
}

/*
 * Handler for the secondary button. Sends a callback to the app and moves the button
 */
ScreenSettings2Ctrl.prototype._secondaryBtnSelectHandler = function(btnRef, btnData, params)
{
    // if the button is animating ignore this event
    if (this._secBtnIsAnimating == true)
    {
        return;
    }
    
    if (this._adjustBtnFocused)
    {
        this._adjustBtnFocused = false;
        this._adjustBtn.handleControllerEvent("lostFocus");
        this._secondaryBtn.handleControllerEvent("controllerActive");
        this._secondaryBtn.handleControllerEvent("acceptFocusFromLeft");
    }
    
    log.debug("secondaryButton state: " + this._secondaryBtnIsOpened);
    //callback to app that button was selected
    if (typeof this.properties.secondaryButtonCallback == 'function')
    {
        var appData = this.properties.secondaryButtonConfig.appData;
        var params = {"opened": this._secondaryBtnIsOpened};
        this.properties.secondaryButtonCallback(this, appData, params);
    }    
}

/*
 * Starts the animation of the secondary button.
 * @param   action  String  Either "open" or "close" indicating the direction the secondary button should animate
 * @param   callback    Function    Optional Callback to be made when the animation completes
 */
ScreenSettings2Ctrl.prototype.startAnimation = function(action, callback)
{   
    if (!this._secondaryBtn || !this._secondaryBtnVisible)
    {
        log.warn("Cannot start secondary button animation when secondary button is not visible.")
        return;
    }
    
    if (this._secBtnIsAnimating == true)
    {
        log.warn("Cannot start 2 secondary button animations at the same time.");
        return;
    }
    
    this._secBtnIsAnimating = true;
    
    this._animationCompleteCallback = callback;
    this._secBtnAniCompleteCallback = this._aniCompleteHandler.bind(this);
    this._secondaryBtn.divElt.addEventListener("animationEnd", this._secBtnAniCompleteCallback, false);
    this._secondaryBtn.divElt.style.animationDuration = this.properties.secondaryButtonAniTime + "s";

    //add animation class...
    if (action == 'close')
    {
        this._secondaryBtnIsOpened = false;
        this._secondaryBtn.divElt.classList.add("ScreenSettings2CtrlSlidePsmClosed");
    }
    else
    {
        this._secondaryBtnIsOpened = true;
        this._secondaryBtn.divElt.classList.add("ScreenSettings2CtrlSlidePsmOpen");
    }
}

/*
 * Callback for when the secondary button animation completes
 */
ScreenSettings2Ctrl.prototype._aniCompleteHandler = function(evt)
{
    this._secondaryBtn.divElt.removeEventListener("animationEnd", this._secBtnAniCompleteCallback);
    this._secBtnAniCompleteCallback = null;
    
    if (this._secondaryBtn.divElt.classList.contains("ScreenSettings2CtrlSlidePsmClosed"))
    {
        this._secondaryBtn.setCssClasses(this._secondaryOpenProperties);
        this._secondaryBtn.divElt.classList.remove("ScreenSettings2CtrlSlidePsmClosed");
    }
    else if (this._secondaryBtn.divElt.classList.contains("ScreenSettings2CtrlSlidePsmOpen"))
    {
        this._secondaryBtn.setCssClasses(this._secondaryCloseProperties);
        this._secondaryBtn.divElt.classList.remove("ScreenSettings2CtrlSlidePsmOpen");
    }
    
    if (typeof this._animationCompleteCallback == 'function' && this._secondaryBtnVisible) // if the button is not visible, don't make the callback
    {
        var appData = this.properties.secondaryButtonConfig.appData;
        var params = {"opened": this._secondaryBtnIsOpened};
        this._animationCompleteCallback(this, appData, params);
    }
    
    this._secBtnIsAnimating = false;
}

/*
 * Instantiates Adjust Button
 */
ScreenSettings2Ctrl.prototype._instantiateAdjustBtn = function()
{
    if (this._tabsVisible == true)
    {
        this._adjustBtn = framework.instantiateControl(this.uiaId, this.divElt, "ButtonCtrl", this._closeProperties);
    }
    else
    {
        this._adjustBtn = framework.instantiateControl(this.uiaId, this.divElt, "ButtonCtrl", this._adjustProperties);
    }

    if (this.properties.adjustButtonConfig.enabled == null)
    {
        this.properties.adjustButtonConfig.enabled = false;
    }
    
    this._adjustBtn.setEnabled(this.properties.adjustButtonConfig.enabled);
}

/*
 * Instantiates the secondary button
 */
ScreenSettings2Ctrl.prototype._instantiateSecondaryBtn = function()
{
    if (this._secondaryBtnIsOpened)
    {
        this._secondaryBtn = framework.instantiateControl(this.uiaId, this.divElt, "ButtonCtrl", this._secondaryCloseProperties);
    }
    else
    {
        this._secondaryBtn = framework.instantiateControl(this.uiaId, this.divElt, "ButtonCtrl", this._secondaryOpenProperties);
    }
    
    if (!this._secondaryBtnVisible)
    {
        this._secondaryBtn.divElt.style.display = "none";
    }
}

/*
 * Sets value of the slider
 */
ScreenSettings2Ctrl.prototype._sliderSetValue = function(tabIndex, value, finalAdjustment)
{
    var valueChanged = false;
    if (this._currItemConfigValue != value)
    {
        this._currItemConfigValue = value;
        valueChanged = true;
    }
    
    if (finalAdjustment == true)
    {
        this._tabs[tabIndex].sliderCont.slider.setValue(value);
    }

    return valueChanged;
};

/*
 * Enable / Disable PSM Open / Close Button & Hide / Show of PSM
 */
ScreenSettings2Ctrl.prototype.setSecondaryBtnOpened = function(position)
{
    log.debug("In setSecondaryBtnOpened..position.." + position);
    
    if (this.properties.secondaryButtonConfig == null)
    {
        log.warn("cannot set secondaryBtn when the configuration is null");
        return;
    }
    
    // store the prev state
    this._prevState = this._secondaryBtnIsOpened;
    // store new position
    this._secondaryBtnIsOpened = position;
    
    // if prev position is different than new position, update the button properties
    // set new CSS class
    if (this._prevState != this._secondaryBtnIsOpened)
    {
        this._aniCompleteHandler();
        
        if (!this._secondaryBtnIsOpened)
        {
            this._secondaryBtn.setCssClasses(this._secondaryOpenProperties);
        }
        else
        {
            this._secondaryBtn.setCssClasses(this._secondaryCloseProperties);
        } 
    }
}

/*
 * Used to hide/show the secondary button. If called while an animation is in progress, the button will snap to the end of the animation.
 * @param   hide    Boolean True if the secondary button should not be displayed. False if it should be displayed.
 */
ScreenSettings2Ctrl.prototype.hideSecondaryBtn = function(hide)
{
    if (!this._secondaryBtn)
    {
        log.warn("Cannot hide/show a secondary button in a context that does not have a secondary button config.");
        return;
    }

    if (hide)
    {
        if (this._secondaryBtnVisible)
        {
            this._secondaryBtn.divElt.style.display = "none";
            this._secondaryBtnVisible = false;
        }
    }
    else
    {
        
        if (!this._secondaryBtnVisible)
        {
            this._secondaryBtn.divElt.style.display = "block";
            this._secondaryBtnVisible = true;
        }
    }
    
    this._aniCompleteHandler();
}

/*
 * Enable / Disable Buttons, Tabs, and Sliders
 * @param   atSpeed   Boolean True if spreed restriction threshold has been exceeded. False otherwise.
 */
ScreenSettings2Ctrl.prototype.setAtSpeed = function(atSpeed)
{
    this._atSpeed = atSpeed;
    var isEnabled;
    
    if (atSpeed)
    {
        isEnabled = false;
    }
    else
    {
        isEnabled = true;
    }
    
    if (this._tabsVisible)
    {
        if (this.properties.tabsButtonConfig == null)
        {
            log.warn("Cannot enable/disable Tabs when the configuration is null");
            return;
        }
        
        if (atSpeed)
        {
            if (!this._adjustBtnFocused)
            {
                //Set focus on Close button, disable tabs
                this._moveFocusToCloseBtn(isEnabled);
                this._currTab = -1;
            }
            else
            {
                for (var tab in this._tabs)
                {
                    this._tabs[tab].setEnabled(isEnabled);
                }
            }
        }
        else
        {
            //re-enable the tabs
            for (var tab in this._tabs)
            {
                this._tabs[tab].setEnabled(isEnabled);
            }
        }
    }
    else
    {
        if (this.properties.adjustButtonConfig == null)
        {
            log.warn("Cannot enable/disable Adjust Button when the configuration is null");
            return;
        }
        
        //just disable/enable the adjustBtn
        this._adjustBtn.setEnabled(isEnabled);
    }
}

/*
 * Enable / Disable Adjust button
 * @param   value   Boolean True if the Adjust Button should be enabled. False if it should be disabled.
 */
ScreenSettings2Ctrl.prototype.setAdjustBtnEnabled = function(value)
{
    if (this.properties.adjustButtonConfig == null)
    {
        log.warn("Cannot set Adjust Button when the configuration is null");
        return;
    }
    
    log.debug("setAdjustBtnEnabled.. " + value);
    
    // Call API of ButtonCtrl as we have single adjust button property
    // Close button should never be disabled
    if (this._tabsVisible == false)
    {
        this._adjustBtn.setEnabled(value);
    }
}

ScreenSettings2Ctrl.prototype._moveFocusToCloseBtn = function(isEnabled)
{
    // unfocus tab button, focus adjust button
    this._tabs[this._currTab].handleControllerEvent("lostFocus");
    this._adjustBtnFocused = true;
    this._adjustBtn.handleControllerEvent("controllerActive");
    this._adjustBtn.handleControllerEvent("acceptFocusFromRight");
    for (var tab in this._tabs)
    {
        var sliderCont = this._tabs[tab].sliderCont;
        if (sliderCont.parentElement)
        {
            this._tabsCont.removeChild(sliderCont);
        }
        if (isEnabled !== undefined && isEnabled !== null) //optional param specified if called form atSpeed handler
        {
            this._tabs[tab].setEnabled(isEnabled);
        }
    }
}

/*
 * Retrieve a slider's value
 */
ScreenSettings2Ctrl.prototype._getSliderValue = function(tabIndex)
{
    return this._tabs[tabIndex].sliderCont.slider.getValue();
}

/*
 * Refresh a slider's value
 */
ScreenSettings2Ctrl.prototype.update = function(tabIndex, value)
{
    this._sliderSetValue(tabIndex, value, true);
}

/*
 * Called by the parent when a multicontroller event occurs
 */
ScreenSettings2Ctrl.prototype.handleControllerEvent = function(eventId)
{
    //response will be return value at end of function
    var response = null;

    if (this._atSpeed && this._tabsVisible && (eventId !== "select" && eventId !== "selectStart"))
    {
        response = "ignored";
    }
    else
    {
        switch(eventId)
        {
            case "acceptFocusInit": //intentional fallthrough. these cases have the same behavior
            case "acceptFocusFromLeft":
            case "acceptFocusFromRight":
            case "acceptFocusFromtTop":
            case "acceptFocusFromBottom":
                this._setDefaultFocus();
                response = "consumed";
                break;
            case "lostFocus":
                // TODO: Hide highlight on any/all buttons
                
                response = "consumed"
                break;
            case "touchActive":
                // input mode change to touch
                response = "ignored";
                break;
            case "controllerActive":
                // input mode change to multicontroller
                response = "ignored";
                break;
            case "cw":
                // Rotate Right (CW)
                if (this._tabsVisible && this._currTab > -1
                    && (this.properties.tabsButtonConfig.tabsConfig[this._currTab].itemConfig.style == "pivot"
                    || this.properties.tabsButtonConfig.tabsConfig[this._currTab].itemConfig.style == "slider"))
                {
                    this._tabs[this._currTab].sliderCont.slider.handleControllerEvent(eventId);
                }
                break;
            case "ccw":
                // Rotate Left (CCW)
                if (this._tabsVisible && this._currTab > -1
                    && (this.properties.tabsButtonConfig.tabsConfig[this._currTab].itemConfig.style == "pivot"
                    || this.properties.tabsButtonConfig.tabsConfig[this._currTab].itemConfig.style == "slider"))
                {
                    this._tabs[this._currTab].sliderCont.slider.handleControllerEvent(eventId);
                }
                break;
            case "selectStart":
                // Select 
                if (this._tabsVisible)
                {
                    //select either the close button, or the reset button
                    if (this._currTab == -1)
                    {
                        this._adjustBtn.handleControllerEvent(eventId);
                    }
                    else if (this.properties.tabsButtonConfig.tabsConfig[this._currTab].itemConfig.style == "oneButton")
                    {
                        this._tabs[this._currTab].sliderCont.button1.handleControllerEvent(eventId);
                    }
                }
                else if (this.properties.secondaryButtonConfig)
                {
                    // select either the adjust button, or the secondary button
                    if (this._adjustBtnFocused)
                    {
                        this._adjustBtn.handleControllerEvent(eventId);
                    }
                    else
                    {
                        this._secondaryBtn.handleControllerEvent(eventId);
                    }
                }
                else
                {
                    // no tabs, no secondary button.. only the adjust button is left
                    this._adjustBtn.handleControllerEvent(eventId);
                }
                response = 'consumed';
                break;
            case "select":
                // Select (press down) button's handleControllerEvent() calls the proper handler (the selectCallback from properties)
                if (this._tabsVisible)
                {
                    //select either the close button, or the reset button
                    if (this._currTab == -1)
                    {
                        this._adjustBtn.handleControllerEvent(eventId);
                    }
                    else if (this.properties.tabsButtonConfig.tabsConfig[this._currTab].itemConfig.style == "oneButton")
                    {
                        this._tabs[this._currTab].sliderCont.button1.handleControllerEvent(eventId);
                    }
                }
                else if (this.properties.secondaryButtonConfig)
                {
                    // select either the adjust button, or the secondary button
                    if (this._adjustBtnFocused)
                    {
                        this._adjustBtn.handleControllerEvent(eventId);
                    }
                    else
                    {
                        this._secondaryBtn.handleControllerEvent(eventId);
                    }
                }
                else
                {
                    // no tabs, no secondary button.. only the adjust button is left
                    this._adjustBtn.handleControllerEvent(eventId);
                }
                response = 'consumed';
                break;
            case "leftStart":
                // Tilt Left Hold
                break;
            case "left":
                // Tilt Left
                if (this._tabsVisible)
                {
                    if (this._currTab > 0)
                    {
                        var callback = this._tabs[this._currTab - 1].properties.selectCallback;
                        if (callback != null)
                        {
                            var newTab = this._tabs[this._currTab - 1];
                            var appData = newTab.properties.appData;
                            
                            var params = {"buttonIndex": appData.index, "tabsShown": true};
                            callback(this, appData, params);
                        }
                        response = 'consumed';
                    }
                    else if (this._currTab == 0)
                    {
                        // bump left from tab 0 indicates we need to go to the close button (special scenario)
                        this._moveFocusToCloseBtn();
                        this._currTab--;
                        response = 'consumed';
                    }
                    else
                    {
                        response = 'giveFocusLeft';
                    }
                }
                else
                {
                    if (this.properties.secondaryButtonConfig)
                    {
                        if (this._adjustBtn.isEnabled)
                        {
                            if (!this._adjustBtnFocused)
                            {
                                this._adjustBtnFocused = true;
                                this._secondaryBtn.handleControllerEvent("lostFocus");
                                this._adjustBtn.handleControllerEvent("controllerActive");
                                this._adjustBtn.handleControllerEvent("acceptFocusFromRight");
                                response = 'consumed';
                            }
                            else
                            {
                                response = 'giveFocusLeft';
                            }
                        }
                        else
                        {
                            response = 'giveFocusLeft';             
                        }
                    }
                    else
                    {
                        response = 'giveFocusLeft';
                    }
                }
                break;
            case "rightStart":
                // Tilt Right
                break;
            case "right":
                if (this._tabsVisible)
                {
                    if (this._currTab == -1)
                    {
                        this._adjustBtnFocused = false;
                        this._adjustBtn.handleControllerEvent("lostFocus");
                        //_showTab will show sliderCont in next tab
                        response = 'consumed';
                    }
                    if (this._currTab < this._tabs.length - 1)
                    {
                        var callback = this._tabs[this._currTab + 1].properties.selectCallback;
                        if (callback != null)
                        {
                            var newTab = this._tabs[this._currTab + 1];
                            var appData = newTab.properties.appData;
                            
                            var params = {"buttonIndex": appData.index, "tabsShown": true};
                            callback(this, appData, params);
                            response = 'consumed';
                        }
                    }
                    else
                    {
                        response = 'giveFocusRight';
                    }
                }
                else
                {
                    if (this.properties.secondaryButtonConfig)
                    {
                        if (this.properties.adjustButtonConfig.enabled)
                        {
                            if (!this._adjustBtnFocused)
                            {
                                response = 'giveFocusRight';
                            }
                            else
                            {
                                this._adjustBtnFocused = false;
                                this._adjustBtn.handleControllerEvent("lostFocus");
                                this._secondaryBtn.handleControllerEvent("controllerActive");
                                this._secondaryBtn.handleControllerEvent("acceptFocusFromLeft");
                                response = 'consumed';
                            }
                        }
                        else
                        {
                            response = 'giveFocusRight';             
                        }
                    }
                    else
                    {
                        response = 'giveFocusRight';
                    }
                }
                break;
            case "upStart":
                // Tilt Up Hold
                break;
            case "up":
                // Tilt Up
                response = "giveFocusUp";
                break;
            case "downStart":
                // Tilt Down
                break;
            case "down":
                // Tilt Down
                response = "giveFocusDown";
                break;
            default:
                // No action
                break;
        }
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

ScreenSettings2Ctrl.prototype.getContextCapture = function()
{
    log.debug("getContextCapture called", this._tabs);

    return {
        isSecondaryVisible: this._secondaryBtnVisible,
        adjustFocusState: this._adjustBtnFocused,
        currentTab: this._currTab
    };
}

ScreenSettings2Ctrl.prototype.restoreContext = function(focusState)
{
    log.debug("restoreContext called", focusState);

    this._secondaryBtnVisible = focusState.isSecondaryVisible;
    this._adjustBtnFocused = focusState.adjustFocusState;
    this._currTab = 0;  //this is set in _createTab, and if they aren't visible it should be 0 anyway

    if (focusState.currentTab >= 0)
    {
        this._createTab(focusState.currentTab);
    }
    else
    {
        this._moveFocusToCloseBtn();
        this._currTab = -1;
    }
    
    if (!this._tabsVisible && this._secondaryBtnVisible && !this._adjustBtnFocused)
    {
        //move focus from adjust button (default) to secondary button
        //this._adjustBtn is already set to false, otherwise it wouldn't get past the check
        this._adjustBtn.handleControllerEvent("lostFocus");
        this._secondaryBtn.handleControllerEvent("controllerActive");
        this._secondaryBtn.handleControllerEvent("acceptFocusFromLeft");
    }
}

/*
 * (internal) Called by GUI Framework just before a context change occurs.
 * ScreenSettings2 will issue any remaining callbacks before leaving the screen.
 */
ScreenSettings2Ctrl.prototype.finishPartialActivity = function()
{
    log.debug("ScreenSettings2Ctrl: finishPartialActivity() called...");
    
    // if animation isn't complete, make call to _aniCompleteHandler()
    if (this._secondaryBtnVisible && this._secBtnIsAnimating)
    {
        this._aniCompleteHandler();
    }
    
    if (this._tabsVisible && this._currTab > -1
        && (this.properties.tabsButtonConfig.tabsConfig[this._currTab].itemConfig.style == "pivot"
        || this.properties.tabsButtonConfig.tabsConfig[this._currTab].itemConfig.style == "slider"))
    {
        this._tabs[this._currTab].sliderCont.slider.finishPartialActivity();
    }
}

/*
 * Garbage collection
 */
ScreenSettings2Ctrl.prototype.cleanUp = function()
{
    log.debug("Screen Settings 2 Cleanup called. Calling Button Cleanups.");
    this._adjustBtn.cleanUp();
    
    if (this._secondaryBtn)
    {
        // Clean up animation listener in case of context change during animation
        this._secondaryBtn.divElt.removeEventListener("animationEnd", this._secBtnAniCompleteCallback);
        this._secondaryBtn.cleanUp();
    }
    
    // clean up the tab buttons
    for (var key in this._tabs)
    {
        this._tabs[key].cleanUp();
        if (this._tabs[key].sliderCont.button1)
        {
            log.debug("Cleaning up a button1");
            this._tabs[key].sliderCont.button1.cleanUp();
        }
        else if (this._tabs[key].sliderCont.slider)
        {
            log.debug("Cleaning up a slider");
            this._tabs[key].sliderCont.slider.cleanUp();
        }
    }
};

// tell framework that the control has finished loading
framework.registerCtrlLoaded("ScreenSettings2Ctrl");
