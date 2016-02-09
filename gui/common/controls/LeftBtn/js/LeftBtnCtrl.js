/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: LeftBtnCtrl.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: awoodhc
 Date: 06.4.2012
 __________________________________________________________________________

 Description: IHU GUI System App

 Revisions:
 v0.1 (6-June-2012)  Created file based on TextBtnCtrl to handle new Left Button functions
 v0.2 (13-Aug-2012) Modified to instantiate a Button Control
 v0.3 (04-Sept-2012) Corrected addSrcFile. Added public method to set selectCallback.
 v0.4 (07-Nov-2012) Added APIs to change style from go back to menu up.
 v0.5 (03-Dec-2012) Added API to get the current left button style.
 __________________________________________________________________________

 */

log.addSrcFile("LeftBtnCtrl.js", "common");

/*
 * Constructor
 */
function LeftBtnCtrl(uiaId, parentDiv, controlId, properties)
{
    // public variables
    this.id = controlId;
    this.divElt = null;
    
    this.uiaId = uiaId;
    
    // private variables
    this._currStyle = "goBack"; // (String) Used to track the current style of the left button (menuUp, goBack, or [legacy] goLeft)

    this._vuiNumbersCont = null; // container to hold the vui numbers and chrome arc
    this._subDivs = new Array(); // subdivs array which is used to create various number divs
    this._numbersShown = false; // flag to check whether numbers are shown on the LeftBtnCtrl or not
    this._vuiNumberDivsPresent = false; //flag to determine whether numbers divs are available or not
    this._numberCount = 0; //flag to determine the count of number divs created
    this._aniCompleteCallback = this._aniCompleteHandler.bind(this); // bound reference to the function

    this._GO_BACK_CSS = {  // Stores CSS class names for the GoBack button
        "enabledClass" : "LeftBtnCtrlBackBtn",
        "disabledClass" : "LeftBtnCtrlBackBtnDisabled",
        "focusedClass" : "LeftBtnCtrlBackBtnFocused",
        "downClass" : "LeftBtnCtrlBackBtnDown"
    };
    
    this._MENU_UP_CSS = {  // Stores CSS class names for the MenuUp button
        "enabledClass" : "LeftBtnCtrlMoveUpBtn",
        "disabledClass" : "LeftBtnCtrlMoveUpBtnDisabled",
        "focusedClass" : "LeftBtnCtrlMoveUpBtnFocused",
        "downClass" : "LeftBtnCtrlMoveUpBtnDown"
    };

    //@formatter:off
    this.properties = {
    	"selectCallback"	: null, 	// (Function) called when the button is selected
    };
    //@formatter:on

    for (var i in properties)
    {
        this.properties[i] = properties[i];
    }

    this.divElt = document.createElement('div');
    
    this.divElt.id = controlId;
    this.divElt.className = "LeftBtnCtrl";
    
    //@formatter:off
    var btnInstanceProperties = {
        "canStealFocus": true,
        "selectCallback" : this._selectHandler.bind(this),
        "enabledClass" : this._GO_BACK_CSS.enabledClass,
        "disabledClass" : this._GO_BACK_CSS.disabledClass,
        "focusedClass": this._GO_BACK_CSS.focusedClass,
        "downClass" : this._GO_BACK_CSS.downClass,
        "heldClass" : null,
        "appData" : this.properties.appData // pass any app data on
    };
    //@formatter:on
    
    // Instantiate Button Control (LeftBtnCtrl is essentially a 'wrapper')
    this.btnInstance = framework.instantiateControl(this.uiaId, this.divElt, "ButtonCtrl", btnInstanceProperties, "LeftBtn_");
    
    // append to the DOM once this.btnInstance is already in this.divElt
    parentDiv.appendChild(this.divElt);
}

/*
 * Assigns the callback function for a select event
 * @param   callback    Function    function to call when the LeftBtnCtrl is selected
 */
LeftBtnCtrl.prototype.setCallback = function(callback)
{
    if (callback != null)
    {
        this.properties.selectCallback = callback;
    }
}

/* (internal) Called by Template
 * Handles multicontroller events passed down from the template
 * @param   eventId String  the multicontroller event
 */
LeftBtnCtrl.prototype.handleControllerEvent = function(eventId)
{
    log.debug("handleControllerEvent called", eventId);
    
    var response = this.btnInstance.handleControllerEvent(eventId);
    return response;
}

/* (internal) Called by Framework
 * Changes the style of the Left Button
 * @param   style   Style to set the left button to (goBack, menuUp [or legacy goLeft])
 */
LeftBtnCtrl.prototype.setStyle = function(style)
{
    if (this._currStyle == style)
    {
        return;
    }
    
    if (style == "goBack")
    {
        this.btnInstance.setCssClasses(this._GO_BACK_CSS);
    }
    else if (style == "menuUp")
    {
        this.btnInstance.setCssClasses(this._MENU_UP_CSS);
    }
    else
    {
        log.error("Cannot set Left Button to unknown style: " + style + ". Expected \"menuUp\" or \"goBack\"");
        return; // take no action and exit
    }
    
    this._currStyle = style;
};

/*
 * (internal) Called by Common
 * Gets the current style of the Left Button
 */
LeftBtnCtrl.prototype.getStyle = function()
{
    return this._currStyle;
};

/*
 * Callback for when the button instance is selected
 */
LeftBtnCtrl.prototype._selectHandler = function(ctrlObj, appData, params)
{
    if (utility.toType(this.properties.selectCallback) == 'function')
    {
        var params = {
            "style" : this._currStyle
        };
        this.properties.selectCallback(this, appData, params);
    }
};

/* Shows the LineNumbers on LeftBtnCtrl based on the style and count
 * @param style (String) - the style of the chrome
 * @param count (Integer) - the count of numbers to be displayed to the user
 */
LeftBtnCtrl.prototype.showLineNumbers = function(count, style)
{
    //checks whether the style passed is a valid style
    if((style === "Style01") || (style === "Style02") || (style === "Style03") || (style === "Style04") || 
       (style === "Style06") || (style === "Style07") || (style === "Style08") || (style === "Style09"))
    {
        //Creating divs and adding numbers to it based on count and style
        switch(count)
        {
            case 1 :
            case 2 :
            case 3 :
                //create divs based on count and add style based on style
                this._createVuiNumberDivs(count, style);
                
                break;

            case 4 :
                //Check whether the number count is available in the style, if not, do not create divs and show warning message
                if((style === "Style01") || (style === "Style02") || (style === "Style03") || (style === "Style04") || (style === "Style06") || (style === "Style07"))
                {
                    //create divs based on count and add style based on style
                    this._createVuiNumberDivs(count, style);
                }
                else
                {
                    //number count is not available for the style received
                    log.warn("The number count doesn't match with style");
                }
                break;

            case 5 :
                //Check whether the number count is available in the style, if not, do not create divs and show warning message
                if((style === "Style02") || (style === "Style03") || (style === "Style04"))
                {
                    //create divs based on count and add style based on style
                    this._createVuiNumberDivs(count, style);
                }
                else
                {
                    //number count is not available for the style received
                    log.warn("The number count doesn't match with style");
                }
                
                break;

            case 6 :
                //Check whether the number count is available in the style, if not, do not create divs and show warning message.
                if(style === "Style04")
                {
                    //create divs based on count and add style based on style
                    this._createVuiNumberDivs(count, style);
                }
                else
                {
                    //number count is not available for the style received
                    log.warn("The number count doesn't match with style");
                }
                break;

            default :
                //the number count is not supported
                log.warn("The number count exceeds maximum count of numbers that can be displayed");
                break;
        }
    }
    else
    {
        log.warn("The Style is not supported");
    }
}

/* Create divs based on the count and add various styles based on style
 * @param count (Integer) - the count of numbers to be displayed
 * @param style (String) - the style in which the numbers needs to be displayed
 */
LeftBtnCtrl.prototype._createVuiNumberDivs = function(count, style)
{
    // Create VUI container and chromeArc if they are not created
    if (this._vuiNumberDivsPresent === false)
    {
        this._vuiNumbersCont = document.createElement('div');

        // Adding vuiNumbersCont class
        this._vuiNumbersCont.className = "LeftBtnCtrl_VUI_NumberStyle";

        // Adding ChromeArc
        this.divChromeArc = document.createElement('div');
        this.divChromeArc.className = "LeftBtnCtrl_ChromeArc";

        // Append chromeArc to the VUINumberCont
        this._vuiNumbersCont.appendChild(this.divChromeArc);
        
        // Append vuiNumberCont to the BtnInstance DivElt
        this.btnInstance.divElt.appendChild(this._vuiNumbersCont);

        // make vui divs present as TRUE so that number container and chrome arc will not be created again
        this._vuiNumberDivsPresent = true;
    }
    else
    {
        // Remove the number divs if already present
        if (this._numberCount > 0)
        {
            for (var i = 1; i <= this._numberCount; i++)
            {
                this._vuiNumbersCont.removeChild(this._subDivs[i]);
            }
        }
    }

    // Creating the number divs based on count
    for (var i = 1; i <= count; i++)
    {
        this._subDivs[i] = document.createElement('div');
        this._subDivs[i].className = "LeftBtnCtrl_" + style + "_image0" + i;
        this._vuiNumbersCont.appendChild(this._subDivs[i]);
    }

    // Adding animation to the div that is created
    if (this._numbersShown === false)
    {
        this._fadeIn();
        this._numbersShown = true;
    }
    else
    {
        // do nothing
    }

    // store the count received so that number divs can be removed if new count is received
    this._numberCount = count;
}

/* 
 * Hides the LineNumbers on LeftBtnCtrl
 */
LeftBtnCtrl.prototype.hideLineNumbers = function()
{
    //Add Fadeout animation class only if vuinumbersCont is present
    if (this._vuiNumbersCont)
    {
        var result = this._aniCleanUpHelper(); // if currently animating, remove any animation classes
        this._vuiNumbersCont.addEventListener("animationEnd", this._aniCompleteCallback, false);
    
        if (result == 'fadeIn')
        {
            //re-append the div to cause a DOM redraw so the animation is properly restarted
            this.btnInstance.divElt.appendChild(this._vuiNumbersCont);
        }
        // Adding class for fadeout effect
        this._vuiNumbersCont.classList.add('LeftBtnCtrlFadeOut');
    
        this._numbersShown = false;
    }
}

/* 
 * Adds Fade IN effect to the div
 */
LeftBtnCtrl.prototype._fadeIn = function()
{
    var result = this._aniCleanUpHelper(); // if currently animating, remove any animation classes
    this._vuiNumbersCont.addEventListener("animationEnd", this._aniCompleteCallback, false);

    if (result == 'fadeOut')
    {
        //re-append the div to cause a DOM redraw so the animation is properly restarted
        this.btnInstance.divElt.appendChild(this._vuiNumbersCont);
    }
    // Adding fadeIn class
    this._vuiNumbersCont.classList.add('LeftBtnCtrlFadeIn');
}

/*
 * Animation complete handler
 * removes the animation classes
 */
LeftBtnCtrl.prototype._aniCompleteHandler = function(evt)
{
    evt.srcElement.removeEventListener("animationEnd", this._aniCompleteCallback);
    
    var result = this._aniCleanUpHelper();
    
    if (result == 'fadeOut')
    {
        this._vuiNumberDivsPresent = false;
        // Remove the container div
        this.btnInstance.divElt.removeChild(this._vuiNumbersCont);
        this._vuiNumbersCont = null;
    }
}

/*
 * Helper function called to remove animation classes
 * @return  String 'fadeIn' indicates that the fade in class was removed. 'fadeOut' indicates that the fade out class was removed.
 */
LeftBtnCtrl.prototype._aniCleanUpHelper = function()
{
    var cleaned = null;
    // removing fade in class
    if (this._vuiNumbersCont)
    {
        if (this._vuiNumbersCont.classList.contains('LeftBtnCtrlFadeIn'))
        {
            this._vuiNumbersCont.classList.remove('LeftBtnCtrlFadeIn');
            cleaned = 'fadeIn';
        }
    
        // removing fade out class
        else if (this._vuiNumbersCont.classList.contains('LeftBtnCtrlFadeOut'))
        {
            this._vuiNumbersCont.classList.remove('LeftBtnCtrlFadeOut');
            cleaned = 'fadeOut';
        }
    }
    return cleaned;
}

/* (internal) Called by Template
 * Called by the template when framework cleans up the template.
 */
LeftBtnCtrl.prototype.cleanUp = function()
{
    //removing animation eventlistener 
    if (this._vuiNumbersCont)
    {
        this._vuiNumbersCont.removeEventListener("animationEnd", this._aniCompleteCallback);
    }
    this.btnInstance.cleanUp();
    delete this.properties;
    this.selectCallback = null;
}

// Tell framework the control has loaded
framework.registerCtrlLoaded("LeftBtnCtrl");
