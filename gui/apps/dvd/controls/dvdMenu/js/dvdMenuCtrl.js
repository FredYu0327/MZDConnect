/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: dvdMenuCtrl.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: aupparv
 Date: 04.17.2013
 __________________________________________________________________________

 Description: IHU GUI dvdMenuCtrl

 Revisions:
 v0.1 (17-April-2013) Created dvdMenuCtrl
 v0.2 (5-June-2013) Added Localization subMap for Buttons and added some
                    SASS variables
 v0.3 (13-June-2013) Removed unnecessary flags and event listerners fixing
                     drag functionality - apopoval
 v0.4 (17-June-2013) Fixed the overlapping Button DIVs using Area-Maps

 v0.5 (18-June-2013) Modified the Hit/Normal State Handling for directional
                     buttons and Disabled dragging of Images.
 __________________________________________________________________________

 */

log.addSrcFile("dvdMenuCtrl.js", "dvd");

function dvdMenuCtrl(uiaId, parentDiv, controlId, properties)
{
    this.uiaId = uiaId;             // (String) UIA ID of the App instantiating this control
    this.parentDiv = parentDiv;     // (HTMLElement) Reference to the parent div of this control
    this.controlId = controlId;     // (String) ID of this control as assigned by GUIFramework
    this.divElt = null;             // (HTMLElement) Reference to the top level div element of this control

    this._controlDraggableArea = null;
    this._imageSrcPath = "apps/dvd/controls/dvdMenu/images/"
    this.buttonStateNormal = {
        'up'     : 'DVD_Ctrl_BtnTop',
        'down'   : 'DVD_Ctrl_BtnBottom',
        'select' : 'Comander_Non_Focus',
        'right'  : 'DVD_Ctrl_BtnRight',
        'left'   : 'DVD_Ctrl_BtnLeft'
    };

    this.buttonStateHit = {
        'up'     : 'DVD_Ctrl_BtnTop_Hit',
        'down'   : 'DVD_Ctrl_BtnBottom_Hit',
        'select' : 'Comander_Hit',
        'right'  : 'DVD_Ctrl_BtnRight_Hit',
        'left'   : 'DVD_Ctrl_BtnLeft_Hit'
    };

    this._showHideTimeoutId = null;
    this.hidden = false;

    this._longTimeout = 1500;
    this._holdTimer = null;
    this._longTimer = null;
    this._dragStartHandler = null;
    this._dragEndHandler = null;
    this._dragMoveHandler = null;

    this._dragging = false;

    this._upperLimitX = 0;
    this._upperLimitY = 0;
    this._lowerLimitX = 0;
    this._lowerLimitY = 0;

    this._styles = {
        "dvdMenuCtrl"        : "dvdMenuCtrl",
        "selectButtonText"   : "dvdMenuDirButtonSelectText",
        "bottomTab"          : "dvdMenuBottomTabCtrl"
    };
    //@formatter:off
    this.properties = {
        "buttonConfig": null,
        "subMap": null,
        "hideAnimationDuration" : 300,
    };
    //@formatter:on

    for(var i in properties)
    {
        this.properties[i] = properties[i];
    }

    this._createStructure();
}

dvdMenuCtrl.prototype._VENDOR = ('opera' in window) ? 'O' : 'webkit';

dvdMenuCtrl.prototype._init = function()
{
    this._dragStartHandler = this._dragStart.bind(this);
    this._dvdMenuBottomTab.addEventListener('mousedown', this._dragStartHandler, false);
    this._initPositionLimits();
};

dvdMenuCtrl.prototype._createStructure = function()
{
    this._controlDraggableArea = document.createElement("div");
    this._controlDraggableArea.setAttribute('class', 'controlDraggableAreaCtrl');

    this.divElt = document.createElement('div');
    this.divElt.id = this.controlId;
    this.divElt.className = this._styles.dvdMenuCtrl;
    this._controlDraggableArea.appendChild(this.divElt);

    this._dvdMenuBottomTab = document.createElement('div');
    this._dvdMenuBottomTab.className = this._styles.bottomTab;
    this.divElt.appendChild(this._dvdMenuBottomTab);

    for(var buttonId in this.properties["buttonConfig"])
    {
    	var stylePrefix = "dvdMenuDirButton_" + buttonId;
        var buttonConfig = {
            // Set button style
            "useDebugClasses" : false,
            "canStealFocus" : false,
            "onFocusCallback" : null,
            "selectCallback" : this.properties.buttonConfig[buttonId].selectCallBack,
            "longPressCallback" : this.properties.buttonConfig[buttonId].longPressCallback,
            "holdStartCallback" : this.properties.buttonConfig[buttonId].holdStartCallback,
            "holdStopCallback" : this.properties.buttonConfig[buttonId].holdStopCallback,
            "appData" : {"hashId" : buttonId, "originalAppData" : this.properties.buttonConfig[buttonId].appData},
            "canSlideOnto" : false,
            "buttonBehavior" : this.properties.buttonConfig[buttonId].buttonBehavior,
            "enabledClass" : stylePrefix,
            "focusedClass" : null,
            "downClass" : stylePrefix + "_hit",
            "iconClass" : null,
            "icon" : null
        };

        this._instantiateButtons(buttonId, buttonConfig);
    }

    this.parentDiv.appendChild(this._controlDraggableArea);

    this._init();
};

dvdMenuCtrl.prototype._onDownHandler = function(areaRef)
{
     //Handle the Highlighting
     var areaObject = areaRef.target;
     var btnObject = areaRef.target.parentNode.parentNode;
     if(!this._btnHeld)
     {
         btnObject.src = this._imageSrcPath + this.buttonStateHit[areaObject.areaId] + '.png';
         this._btnHeld = true;

         var upHandler = this._onUpHandler.bind(this);
         areaObject.addEventListener('mouseup', upHandler, false);
         areaObject.addEventListener('mouseout', upHandler, false);

         if((btnObject.properties.buttonBehavior === "shortAndLong") || (btnObject.properties.buttonBehavior === "shortAndHold"))
         {
         	 this._longCallBack = this._longPressCallBack.bind(this);
             this._longTimer = setTimeout(this._longCallBack,this._longTimeout,btnObject);
         }
     }

};

dvdMenuCtrl.prototype._longPressCallBack = function(btnObj)
{
	this._onButtonClickBeep('Long', 'Touch');
	clearInterval(this._longTimer);

    if(btnObj.properties.buttonBehavior === "shortAndLong")
    {
    	 btnObj.properties.longPressCallback(btnObj, btnObj.properties.appData.originalAppData, null);
      	 this._longTimer = null;
    }
    else
    {
    	 if(btnObj.properties.buttonBehavior === "shortAndHold")
    	 {
    	 	  btnObj.properties.holdStartCallback(btnObj, btnObj.properties.appData.originalAppData, null);
    	 	  this._longTimer = null;
    	 }
    }
};

dvdMenuCtrl.prototype._shortPressCallBack = function(btnObj)
{
	this._onButtonClickBeep('Short', 'Touch');
	this.properties.buttonConfig[btnObj.properties.appData.hashId].selectCallback(btnObj, btnObj.properties.appData.originalAppData, null);
};

dvdMenuCtrl.prototype._onTextClickDown = function(evt)
{
    this._dispatchTextClickEvents(this._selectBtnArea, 'mousedown', true, true);
    var textClickHandler = this._onTextClickUp.bind(this);
    this._dvdMenuSelectButtonText.addEventListener('mouseup', textClickHandler, false);
    this._dvdMenuSelectButtonText.addEventListener('mouseout', textClickHandler, false);
};

dvdMenuCtrl.prototype._dispatchTextClickEvents = function(target, var_args)
{
    var eventMouse = document.createEvent("MouseEvents");
    eventMouse.initEvent.apply(eventMouse, Array.prototype.slice.call(arguments, 1));
    target.dispatchEvent(eventMouse);
};

dvdMenuCtrl.prototype._onTextClickUp = function(evt)
{
    this._dispatchTextClickEvents(this._selectBtnArea, 'mouseup', true, true);
};

dvdMenuCtrl.prototype._onUpHandler = function(areaRef)
{
     var areaObject = areaRef.target;
     var btnObject = areaRef.target.parentNode.parentNode;
     if(this._btnHeld)
     {
         //Call Button Specific Callback
         if(btnObject.properties.buttonBehavior === "shortPressOnly")
         {
             this._shortPressCallBack(btnObject);
         }
         else
         {
         	 if(((btnObject.properties.buttonBehavior === "shortAndLong") || (btnObject.properties.buttonBehavior === "shortAndHold")) && (this._longTimer != null))
         	 {
         	 	  clearInterval(this._longTimer);
         	 	  this._shortPressCallBack(btnObject);
         	 }
         }

         btnObject.src = this._imageSrcPath + this.buttonStateNormal[areaObject.areaId] + '.png';
         if((btnObject.properties.buttonBehavior === "shortAndHold") && (this._longTimer === null))
         {
             btnObject.properties.holdStopCallback(btnObject, btnObject.properties.appData.originalAppData, null);
         }
         this._longTimer = null;
         this._btnHeld = false;

         var downHandler = null;
         areaObject.removeEventListener('mouseup', downHandler, false);
         areaObject.removeEventListener('mouseout', downHandler, false);
     }

};

dvdMenuCtrl.prototype._onButtonClickBeep = function(beepType, eventCause)
{
    if(framework.common.beep)
    {
        framework.common.beep(beepType, eventCause);
    }
};

dvdMenuCtrl.prototype._instantiateButtons = function(buttonId, buttonConfig)
{
    var selectCallBack = this._onDownHandler.bind(this);
    switch (buttonId)
    {
        case "up":
             this._dvdMenuUpDiv = document.createElement("div");
             this._dvdMenuUpDiv.className = buttonConfig.enabledClass;
             this._dvdMenuUpButton = document.createElement("img");
             this._dvdMenuUpButton.ondragstart = function(){ return false;}
             this._dvdMenuUpButton.src = this._imageSrcPath + this.buttonStateNormal[buttonId] + '.png';
             this._dvdMenuUpButton.properties = {
            // Set button style
            "useDebugClasses" : null,
            "canStealFocus" : null,
            "onFocusCallback" : null,
            "selectCallback" : null,
            "longPressCallback" : null,
            "holdStartCallback" : null,
            "holdStopCallback" : null,
            "appData" : null,
            "canSlideOnto" : null,
            "buttonBehavior" : null,
            "enabledClass" : null,
            "focusedClass" : null,
            "downClass" : null,
            "iconClass" : null,
            "icon" : null
             };

             for(var i in buttonConfig)
             {
                 this._dvdMenuUpButton.properties[i] = buttonConfig[i];
             }
             this._dvdMenuUpButton.useMap = '#upDvdMenuButton';
             this._upBtnMap = document.createElement("map");
             this._upBtnMap.name = 'upDvdMenuButton';
             this._upBtnArea = document.createElement("area");
             this._upBtnArea.shape = 'poly';
             this._upBtnArea.areaId = buttonId;
             this._upBtnArea.coords = '40 70 0 27 25 9 60 0 95 9 121 28 77 70';

             this._upBtnArea.addEventListener('mousedown',selectCallBack,false);
             this._upBtnMap.appendChild(this._upBtnArea);
             this._dvdMenuUpButton.appendChild(this._upBtnMap);
             this._dvdMenuUpDiv.appendChild(this._dvdMenuUpButton);
             this.divElt.appendChild(this._dvdMenuUpDiv);
             break;
        case "down":
             this._dvdMenuBottomDiv = document.createElement("div");
             this._dvdMenuBottomDiv.className = buttonConfig.enabledClass;
             this._dvdMenuDownButton = document.createElement("img");
             this._dvdMenuDownButton.ondragstart = function(){ return false;}
             this._dvdMenuDownButton.src = this._imageSrcPath + this.buttonStateNormal[buttonId] + '.png';

             this._dvdMenuDownButton.properties = {
            // Set button style
            "useDebugClasses" : null,
            "canStealFocus" : null,
            "onFocusCallback" : null,
            "selectCallback" : null,
            "longPressCallback" : null,
            "holdStartCallback" : null,
            "holdStopCallback" : null,
            "appData" : null,
            "canSlideOnto" : null,
            "buttonBehavior" : null,
            "enabledClass" : null,
            "focusedClass" : null,
            "downClass" : null,
            "iconClass" : null,
            "icon" : null
             };

             for(var i in buttonConfig)
             {
                 this._dvdMenuDownButton.properties[i] = buttonConfig[i];
             }
             this._dvdMenuDownButton.useMap = '#downDvdMenuButton';
             this._downBtnMap = document.createElement("map");
             this._downBtnMap.name = 'downDvdMenuButton';
             this._downBtnArea = document.createElement("area");
             this._downBtnArea.shape = 'poly';
             this._downBtnArea.areaId = buttonId;
             this._downBtnArea.coords = '60 92 25 83 0 64 39 22 79 22 121 64 93 83';

             this._downBtnArea.addEventListener('mousedown',selectCallBack,false);
             this._downBtnMap.appendChild(this._downBtnArea);
             this._dvdMenuDownButton.appendChild(this._downBtnMap);
             this._dvdMenuBottomDiv.appendChild(this._dvdMenuDownButton);
             this.divElt.appendChild(this._dvdMenuBottomDiv);
             break;
        case "select":
             this._dvdMenuSelectDiv = document.createElement("div");
             this._dvdMenuSelectDiv.className = buttonConfig.enabledClass;
             this._dvdMenuSelectButton = document.createElement("img");
             this._dvdMenuSelectButton.ondragstart = function(){ return false;}
             this._dvdMenuSelectButton.src = this._imageSrcPath + this.buttonStateNormal[buttonId] + '.png';

             this._dvdMenuSelectButton.properties = {
            // Set button style
            "useDebugClasses" : null,
            "canStealFocus" : null,
            "onFocusCallback" : null,
            "selectCallback" : null,
            "longPressCallback" : null,
            "holdStartCallback" : null,
            "holdStopCallback" : null,
            "appData" : null,
            "canSlideOnto" : null,
            "buttonBehavior" : null,
            "enabledClass" : null,
            "focusedClass" : null,
            "downClass" : null,
            "iconClass" : null,
            "icon" : null
             };

             for(var i in buttonConfig)
             {
                 this._dvdMenuSelectButton.properties[i] = buttonConfig[i];
             }
             this._dvdMenuSelectButton.useMap = '#selectDvdMenuButton';
             this._selectBtnMap = document.createElement("map");
             this._selectBtnMap.name = 'selectDvdMenuButton';
             this._selectBtnArea = document.createElement("area");
             this._selectBtnArea.shape = 'circle';
             this._selectBtnArea.areaId = buttonId;
             this._selectBtnArea.coords = '45 45 40';

             this._selectBtnArea.addEventListener('mousedown',selectCallBack,false);
             this._selectBtnMap.appendChild(this._selectBtnArea);
             this._dvdMenuSelectButton.appendChild(this._selectBtnMap);

             this._dvdMenuSelectButtonText = document.createElement("span");
             this._dvdMenuSelectButtonText.className = this._styles.selectButtonText;
             var textClickHandler = this._onTextClickDown.bind(this);
             this._dvdMenuSelectButtonText.addEventListener('mousedown',textClickHandler,false);
             if(this.properties.buttonConfig[buttonId].label)
             {
                 this._dvdMenuSelectButtonText.innerText = this.properties.buttonConfig[buttonId].label;
             }
             else if(this.properties.buttonConfig[buttonId].labelId)
             {
                 this._dvdMenuSelectButtonText.innerText = framework.localize.getLocStr(this.uiaId, this.properties.buttonConfig[buttonId].labelId, this.properties.subMap);
             }
             this._dvdMenuSelectDiv.appendChild(this._dvdMenuSelectButton);
             this._dvdMenuSelectDiv.appendChild(this._dvdMenuSelectButtonText);
             this.divElt.appendChild(this._dvdMenuSelectDiv);
             break;
        case "right":
             this._dvdMenuRightDiv = document.createElement("div");
             this._dvdMenuRightDiv.className = buttonConfig.enabledClass;
             this._dvdMenuRightButton = document.createElement("img");
             this._dvdMenuRightButton.ondragstart = function(){ return false;}
             this._dvdMenuRightButton.src = this._imageSrcPath + this.buttonStateNormal[buttonId] + '.png';

             this._dvdMenuRightButton.properties = {
            // Set button style
            "useDebugClasses" : null,
            "canStealFocus" : null,
            "onFocusCallback" : null,
            "selectCallback" : null,
            "longPressCallback" : null,
            "holdStartCallback" : null,
            "holdStopCallback" : null,
            "appData" : null,
            "canSlideOnto" : null,
            "buttonBehavior" : null,
            "enabledClass" : null,
            "focusedClass" : null,
            "downClass" : null,
            "iconClass" : null,
            "icon" : null
             };

             for(var i in buttonConfig)
             {
                 this._dvdMenuRightButton.properties[i] = buttonConfig[i];
             }
             this._dvdMenuRightButton.useMap = '#rightDvdMenuButton';
             this._rightBtnMap = document.createElement("map");
             this._rightBtnMap.name = 'rightDvdMenuButton';
             this._rightBtnArea = document.createElement("area");
             this._rightBtnArea.shape = 'poly';
             this._rightBtnArea.areaId = buttonId;
             this._rightBtnArea.coords = '62 130 22 87 21 45 62 0 76 23 87 63 76 108';

             this._rightBtnArea.addEventListener('mousedown',selectCallBack,false);
             this._rightBtnMap.appendChild(this._rightBtnArea);
             this._dvdMenuRightButton.appendChild(this._rightBtnMap);
             this._dvdMenuRightDiv.appendChild(this._dvdMenuRightButton);
             this.divElt.appendChild(this._dvdMenuRightDiv);
             break;
        case "left":
             this._dvdMenuLeftDiv = document.createElement("div");
             this._dvdMenuLeftDiv.className = buttonConfig.enabledClass;
             this._dvdMenuLeftButton = document.createElement("img");
             this._dvdMenuLeftButton.ondragstart = function(){ return false;}
             this._dvdMenuLeftButton.src = this._imageSrcPath + this.buttonStateNormal[buttonId] + '.png';

             this._dvdMenuLeftButton.properties = {
            // Set button style
            "useDebugClasses" : null,
            "canStealFocus" : null,
            "onFocusCallback" : null,
            "selectCallback" : null,
            "longPressCallback" : null,
            "holdStartCallback" : null,
            "holdStopCallback" : null,
            "appData" : null,
            "canSlideOnto" : null,
            "buttonBehavior" : null,
            "enabledClass" : null,
            "focusedClass" : null,
            "downClass" : null,
            "iconClass" : null,
            "icon" : null
             };

             for(var i in buttonConfig)
             {
                 this._dvdMenuLeftButton.properties[i] = buttonConfig[i];
             }

             this._dvdMenuLeftButton.useMap = '#leftDvdMenuButton';
             this._leftBtnMap = document.createElement("map");
             this._leftBtnMap.name = 'leftDvdMenuButton';
             this._leftBtnArea = document.createElement("area");
             this._leftBtnArea.shape = 'poly';
             this._leftBtnArea.areaId = buttonId;
             this._leftBtnArea.coords = '67 44 18 2 5 42 0 65 5 93 26 130 67 85';

             this._leftBtnArea.addEventListener('mousedown',selectCallBack,false);
             this._leftBtnMap.appendChild(this._leftBtnArea);
             this._dvdMenuLeftButton.appendChild(this._leftBtnMap);
             this._dvdMenuLeftDiv.appendChild(this._dvdMenuLeftButton);
             this.divElt.appendChild(this._dvdMenuLeftDiv);
             break;
        default:
            // No action
            break;
    }
};

dvdMenuCtrl.prototype._initPositionLimits = function()
{
    var lowerLimits = this._controlDraggableArea.parentNode;
    this._draggableY = lowerLimits.offsetTop;
    this._lowerLimitX = 0;
    this._lowerLimitY = this._draggableY;
    this._upperLimitX = (this._controlDraggableArea.clientWidth - this.divElt.clientWidth);
    this._upperLimitY = (this._controlDraggableArea.clientHeight - (this.divElt.clientHeight - (this._dvdMenuBottomTab.clientHeight/2))) + (this._draggableY - (this._dvdMenuBottomTab.clientHeight/2));
};

dvdMenuCtrl.prototype._dragStart = function(evt){
   this._dragEndHandler = this._dragEnd.bind(this);
   this.divElt.addEventListener('mouseup',this._dragEndHandler,false);
   this._dragMoveHandler = this._drag.bind(this);
   this._controlDraggableArea.addEventListener('mousemove',this._dragMoveHandler,false);
   this._dragStartHandler = null;
   this._dragging = true;
   /*
    * Add Hit Class
    */
   this._dvdMenuBottomTab.classList.add("dvdMenuBottomTabCtrl_hit");
};

dvdMenuCtrl.prototype._dragEnd = function(evt){
    this._controlDraggableArea.removeEventListener('mousemove',this._dragMoveHandler,false);
    this._dragMoveHandler = null;
    this.divElt.removeEventListener('mouseup',this._dragEndHandler,false);
    this._dragEndHandler = null;
    this._dragStartHandler = this._dragStart.bind(this);
    this._dragging = false;
    /*
     * Remove Hit Class
     */
    this._dvdMenuBottomTab.classList.remove("dvdMenuBottomTabCtrl_hit");
};

dvdMenuCtrl.prototype._drag = function(evt){
   if(this._dragging){
       var posX = evt.clientX;
       var posY = evt.clientY;

       var adjustHorizontalPosition   = this.divElt.clientWidth/2;
       var adjustVerticalPosition     = this.divElt.clientHeight - (this._dvdMenuBottomTab.clientHeight/2);

       posX = posX - adjustHorizontalPosition;
       posY = posY - adjustVerticalPosition;

       this._dragDvdMenuCtrl(posX, posY);
   }
};

dvdMenuCtrl.prototype._dragDvdMenuCtrl = function(positionX, positionY)
{
   if((positionX > this._lowerLimitX) && (positionX < this._upperLimitX))
   {
      this.divElt.style.left = positionX + 'px';
   }
   else
   {
      if(positionX >= this._upperLimitX)
      {
         this.divElt.style.left = this._upperLimitX;
      }
   }

   if((positionY > this._lowerLimitY) && (positionY < this._upperLimitY))
   {
      this.divElt.style.top = (positionY - this._draggableY) + 'px';
   }
   else
   {
      if(positionY >= this._upperLimitY)
      {
         this.divElt.style.top = this._upperLimitY;
      }
   }
};

/**
 * Internal helper for hiding the DvdMenuCtrl
 * @param {Boolean}
 * @param {Integer}
 */
dvdMenuCtrl.prototype._setHidden = function(showHide, duration_ms)
{
    // cast to Boolean
    var isHidden = Boolean(showHide);

    // set transition duration
    if (duration_ms > 0)
    {
        this.divElt.style[this._VENDOR + 'TransitionDuration'] = duration_ms + 'ms';
    }
    else
    {
        this.divElt.style[this._VENDOR + 'TransitionDuration'] = '0ms';
    }

    // set visibility
    if (isHidden)
    {
        this.divElt.classList.add('hidden');
        this.hidden = true;
    }
    else
    {
        this.divElt.classList.remove('hidden');
        this.hidden = false;
    }

    // reset timeout id
    if (null != this._showHideTimeoutId)
    {
        clearTimeout(this._showHideTimeoutId);
    }
    this._showHideTimeoutId = null;
};

dvdMenuCtrl.prototype.handleControllerEvent = function(eventId)
{
    log.debug("dvdMenuCtrl: handleControllerEvent " + eventId);

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
    var response = "ignored";
    switch (eventId)
    {
        case "acceptFocusInit":
        case "acceptFocusFromLeft":
        case "acceptFocusFromRight":
        case "acceptFocusFromtTop":
        case "acceptFocusFromBottom":
        case "lostFocus":
        case "touchActive":
        case "controllerActive":
        case "down":
        case "cw":
        case "up":
        case "ccw":
        case "selectStart":
        case "select":
        case "selectHold":
        case "leftHold":
        case "leftStart":
        case "left":
        case "rightHold":
        case "rightStart":
        case "right":
        case "upHold":
        case "downHold":
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
    return response;
};

/*
 * Captures the current focus/context information of the control.
 * Called when framework switches the context from this control to another control.
 * The information will be returned in the form of a special object specific to the control.
 * This object will have all the required information to restore focus/context on control and its subcontrols.
 * This object can be used by framework to restore back the focus/context.
 * TAG: public
 * =========================
 * @param {void}
 * @return {templateContextCapture} - object with current focus/context information of the template.
 */
dvdMenuCtrl.prototype.getContextCapture = function()
{
    log.debug("dvdMenuCtrl: getContextCapture() called...");
    // Return controlContextCapture
    //@formatter:off
    var controlContextCapture = {
        "dvdMenuCtrlLeft" : this.divElt.style.top,
        "dvdMenuCtrlTop" : this.divElt.style.left,
    }
    //@formatter:on

    return controlContextCapture;
};

/**
 * Public API for showing/hiding the control.
 * Called by DvdMenuTmplt
 * @param {string} - 'show' | 'hide'
 * @param {integer} - delay time for showing/hiding
 * @param {duration} - duration of the showing/hiding animation
 * @return {void}
 */
dvdMenuCtrl.prototype.showHideControl = function(showHide, delay_ms, duration_ms)
{
    // validate input
    if ('show' !== showHide && 'hide' !== showHide)
    {
        log.warn('DvdMenuCtrl: only "show" or "hide" arguments are supported. "' + showHide + '" passed.');
        return;
    }

    // clear any previous timeouts
    clearTimeout(this._showHideTimeoutId);
    this._showHideTimeoutId = null;

    // show
    if ('show' === showHide)
    {
        if (delay_ms > 0)
        {
            // after delay_ms
            this._showHideTimeoutId = setTimeout(this._setHidden.bind(this, false, duration_ms), delay_ms);
        }
        else
        {
            // immediately
            this._setHidden(false, duration_ms)
        }
    }
    // hide
    else
    {
        if (delay_ms > 0)
        {
            // after delay_ms
            this._showHideTimeoutId = setTimeout(this._setHidden.bind(true, false, duration_ms), delay_ms);
        }
        else
        {
            // immediately
            this._setHidden(true, duration_ms)
        }
    }
};

/**
 * Public API for showing/hiding the control.
 * @param {Boolean} - True for hidden
 * @return {void}
 */
dvdMenuCtrl.prototype.setHidden = function(isHidden)
{
    // cast to Boolean
    var isHidden = Boolean(isHidden);
    this._setHidden(isHidden, this.properties.hideAnimationDuration);
};


/*
 * Restores the control with the earlier captured focus/context information which was captured using getContextCapture() function.
 * Called when framework switches back to the previous context from the new context.
 * The information is passed in the same structured object form as returned by getContextCapture() function.
 * This object is the returned value to the last getContextCapture() function.
 * This object will have the required information to restore back to the state when getContextCapture() was called.
 * TAG: public
 * =========================
 * @param {templateContextCapture} - object with previously captured focus/context information of the template
 * @return {void}
 */
dvdMenuCtrl.prototype.restoreContext = function(controlContextCapture)
{
    // TODO: Check if focus to be restored on the control or subControl
    // Set the corresponding properties of control and subControl.
    this.divElt.style.left = controlContextCapture.dvdMenuCtrlLeft;
    this.divElt.style.top = controlContextCapture.dvdMenuCtrlTop;
};

dvdMenuCtrl.prototype.cleanUp = function()
{
    log.debug("dvdMenuCtrl: cleanUp() called...");
    this._dvdMenuBottomTab.removeEventListener("mousedown", this._dragStartHandler);
    this.divElt.removeEventListener("mouseup", this._dragEndHandler);
    this._controlDraggableArea.removeEventListener("mousemove", this._dragMoveHandler);

    // clear show/hide timeout
    clearTimeout(this._showHideTimeoutId);
    this._showHideTimeoutId = null;

    delete this.properties;
};

framework.registerCtrlLoaded("dvdMenuCtrl");
