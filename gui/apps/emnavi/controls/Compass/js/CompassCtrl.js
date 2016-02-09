/*
 Copyright 2013 by Johnson Controls
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: avorotp
 Date: 03-July-2013
 __________________________________________________________________________

 Description: IHU GUI Compass Control
 Revisions:
 v0.1 (03-Jul-2013) - Initial version
 v0.2 (09-Oct-2013) - Updated compass control with the latest graphic assets
 v0.3 (22-Oct-2013) - Update compass control to support RTL text flow
 __________________________________________________________________________

 */

log.addSrcFile("CompassCtrl.js", "common");

/**
 * =========================
 * CONSTRUCTOR
 * =========================
 * Compass control is showing current location (latitutde, longitude and altitutde/elevation)
 * as well as the direction of moving in the form of a analog compass.
 * TAG: framework
 * =========================
 * @param {string} - uiaid of the owning app
 * @param {html element} - control parent
 * @param {string} - control id
 * @param {object} - control properties
 * @return {CompassCtrl}
 */
function CompassCtrl(uiaId, parentDiv, ctrlId, properties)
{

    /*
     * ---------------------------------------
     * DEFAULT CONTROL CONFIGURATION
     * ---------------------------------------
     */

    // set default properties
    this.properties = {
        latitude : '---',
        longitude : '---',
        elevation : '---',
        additionalText : '',
        additionalTextId : '',
        additionalTextSubMap : null,
        direction : 'n',

        step : 124,
        stepCount : 14,
        transitionDuration : 1000,

    };

    // Merge with user configuration
    for (var i in properties)
    {
       this.properties[i] = properties[i];
    }

    /*
     * ---------------------------------------
     * CONTROL PUBLIC PROPERTIES
     * ---------------------------------------
     */
    // set compass properties
    this.id = ctrlId;                   // control's id
    this.parentDiv = parentDiv;            // control's immediate parent DOM element
    this.uiaId = uiaId;                    // uiaId of the owning app

    /*
     * ---------------------------------------
     * CONTROL PRIVATE PROPERTIES
     * ---------------------------------------
     */
    this._currentDir = this.properties.direction;
    this._prevDir = this._currentDir;
    this._scrollerWidth = this.properties.step * this.properties.stepCount;
    this._scrollerAnimationEndCallback = null;
    this._fade_in_from = 0;
	this._fade_out_from = 10;

    /*
     * ---------------------------------------
     * SETTERS AND GETTERS
     * These control various public and private properties
     * TODO if needed
     * ---------------------------------------
     */

    // initialize
    this.init();

}

/**
 * =========================
 * COMPASS PROTOTYPE PROPERTIES
 * =========================
 */

// Main compass definition. Order is important
CompassCtrl.prototype._compass = {
    n :  { type:'major', key: 'n',  label:'N',  fullname : 'north',     heading : 0,   rad : 0 * Math.PI / 180,   next:1, prev:7, index:0 },
    ne : { type:'minor', key: 'ne', label:'NE', fullname : 'northeast', heading : 45,  rad : 45 * Math.PI / 180,  next:2, prev:0, index:1 },
    e :  { type:'major', key: 'e',  label:'E',  fullname : 'east',      heading : 90,  rad : 90 * Math.PI / 180,  next:3, prev:1, index:2 },
    se : { type:'minor', key: 'se', label:'SE', fullname : 'southeast', heading : 135, rad : 135 * Math.PI / 180, next:4, prev:2, index:3 },
    s :  { type:'major', key: 's',  label:'S',  fullname : 'south',     heading : 180, rad : 180 * Math.PI / 180, next:5, prev:3, index:4 },
    sw : { type:'minor', key: 'sw', label:'SW', fullname : 'southwest', heading : 225, rad : 225 * Math.PI / 180, next:6, prev:4, index:5 },
    w :  { type:'major', key: 'w',  label:'W',  fullname : 'west',      heading : 270, rad : 270 * Math.PI / 180, next:7, prev:5, index:6 },
    nw : { type:'minor', key: 'nw', label:'NW', fullname : 'northwest', heading : 315, rad : 315 * Math.PI / 180, next:0, prev:6, index:7 },
};
// Vendor prefix
CompassCtrl.prototype._VENDOR = ('opera' in window) ? 'O' : 'webkit';


/**
 * =========================
 * INIT ROUTINE
 * Any initialization code goes here
 * TAG: internal
 * =========================
 * @return {void}
 */
CompassCtrl.prototype.init = function()
{
    /* CREATE ELEMENTS */

    // Container element
    this.divElt = document.createElement('div');
    this.divElt.id = this.id;
    this.divElt.className = 'CompassCtrl';

    // DOM Elements
    var tmp, compassInfo, textWrapper, latWrapper, lonWrapper, elWrapper;
    this._ctrlText = null;
    this._ctrlLatitude = null;
    this._ctrlLongitude = null;
    this._ctrlElevation = null;

    this._mask = null;
    this._scroller = null;
    this._compassNeedle = null;

    // create letter containers pool
    this._letterContainers = {};
    var tmp;
    for (var i=0; i<this.properties.stepCount-1; i++)
    {
        tmp = document.createElement('div');
        tmp.classList.add('heading');
        tmp.classList.add('heading-' + i);
        this._letterContainers['heading_' + i] = tmp;
    }
    this._headingWrapper = document.createElement('div');
    this._headingWrapper.className = 'headingWrapper';
    for (var i in this._letterContainers)
    {
        this._headingWrapper.appendChild(this._letterContainers[i]);
    }

    // Create scroller mask and scroller
    this._mask = document.createElement('div');
    this._mask.className = 'compassMask';
    this._rail = document.createElement('div');
    this._rail.className = 'compassRail';
    this._scroller = document.createElement('div');
    this._scroller.className = 'compassScroller';
    this._compassNeedle = document.createElement('div');
    this._compassNeedle.className = 'compassNeedle';
    this._scroller.appendChild(this._headingWrapper);
    this._mask.appendChild(this._rail);
    this._mask.appendChild(this._compassNeedle);
    this._mask.appendChild(this._scroller);


    // Create info container
    compassInfo = document.createElement('div');
    compassInfo.className = 'compassInfo';

    // Create text
    textWrapper = document.createElement('div');
    textWrapper.className = 'textWrapper';
    this._ctrlText = document.createElement('div');
    this._ctrlText.className = 'text';
    if (this.properties.additionalTextId)
    {
        this._ctrlText.innerText = framework.localize.getLocStr(this.uiaId, this.properties.additionalTextId, this.properties.additionalTextSubMap);
    }
    else if (this.properties.additionalText)
    {
        this._ctrlText.innerText = this.properties.additionalText;
    }
    textWrapper.appendChild(this._ctrlText);

    // Create latitude
    latWrapper = document.createElement('div');
    latWrapper.className = 'latWrapper';
    tmp = document.createElement('div');
    tmp.className = 'latTitle';
    tmp.appendChild(document.createTextNode(framework.localize.getLocStr(this.uiaId, 'Latitude')));
    latWrapper.appendChild(tmp);
    this._ctrlLatitude = document.createElement('div');
    this._ctrlLatitude.className = 'lat';
    this._ctrlLatitude.innerText = this.properties.latitude;
    latWrapper.appendChild(this._ctrlLatitude);

    // Create longtitude
    lonWrapper = document.createElement('div');
    lonWrapper.className = 'lonWrapper';
    tmp = document.createElement('div');
    tmp.className = 'lonTitle';
    tmp.appendChild(document.createTextNode(framework.localize.getLocStr(this.uiaId, 'Longitude')));
    lonWrapper.appendChild(tmp);
    this._ctrlLongitude = document.createElement('div');
    this._ctrlLongitude.className = 'lon';
    this._ctrlLongitude.innerText = this.properties.latitude;
    lonWrapper.appendChild(this._ctrlLongitude);

    // Create elevation
    elWrapper = document.createElement('div');
    elWrapper.className = 'elWrapper';
    tmp = document.createElement('div');
    tmp.className = 'elTitle';
    tmp.appendChild(document.createTextNode(framework.localize.getLocStr(this.uiaId, 'Elevation')));
    elWrapper.appendChild(tmp);
    this._ctrlElevation = document.createElement('div');
    this._ctrlElevation.className = 'el';
    this._ctrlElevation.innerText = this.properties.latitude;
    elWrapper.appendChild(this._ctrlElevation);

    // Create foreground
    this._foreground = document.createElement('div');
    this._foreground.className = 'compassForeground';

    // Add it to the DOM
    this.divElt.appendChild(this._mask);
    compassInfo.appendChild(textWrapper);
    compassInfo.appendChild(latWrapper);
    compassInfo.appendChild(lonWrapper);
    compassInfo.appendChild(elWrapper);
    this.divElt.appendChild(compassInfo);
    this.divElt.appendChild(this._foreground);
    this.parentDiv.appendChild(this.divElt);

    // initial fill of the containers
    this._updateContainers();

};

/**
 * =========================
 * Set direction of the compass.
 * This will trigger an animation and state change.
 * TAG: internal
 * =========================
 * @param {string} - N | E | S | W | NE | SE | NW | SW
 * @return {string} - the new direction
 */
CompassCtrl.prototype._setDirection = function (direction)
{
    var direction = direction.toLowerCase();

    if (!this._compass.hasOwnProperty(direction))
    {
        log.warn('CompassCtrl: invalid direction: ' + direction);
        return this._currentDir;
    }

    // get nearest path
    var pathObj = this._getNearestDirOffset(direction);

    // save prev direction and set new direction
    this._prevDir = this._currentDir;
    this._currentDir = direction;

    // animate
    if (pathObj && pathObj.steps > 0)
    {
        this._animate(pathObj.steps, pathObj.ccw);
    }

    return this._currentDir;
};

/**
 * =========================
 * Perform animation of the scrolling element.
 * Maximum animation that can be performed is 180deg, e.g. N -> S
 * TAG: internal
 * =========================
 * @param {integer} - how many steps
 * @param {Boolean} - in which direction (True for CCW)
 * @return {void}
 */
CompassCtrl.prototype._animate = function(steps, direction)
{
    // get current position and offset
    var currentPos = this._scroller.offsetLeft;
    var offset = steps * this.properties.step;

    // direction = True -> CCW
    var newPos = (direction) ? currentPos + offset : currentPos - offset;

    // attach event listeners to the scroller
    this._scrollerAnimationEndCallback = this._animationEndCallback.bind(this, steps, direction);
    this._scroller.style[this._VENDOR + 'TransitionDuration'] = this.properties.transitionDuration + 'ms';
    this._scroller.addEventListener(this._VENDOR + 'TransitionEnd', this._scrollerAnimationEndCallback, false);
    this._scroller.style.left = newPos + 'px';
};

/**
 * =========================
 * Callback on animation end
 * TAG: internal
 * =========================
 * @param {integer} - how many steps
 * @param {Boolean} - in which direction (True for CCW)
 * @return {void}
 */
CompassCtrl.prototype._animationEndCallback = function(steps, direction)
{
    // remove event listeners from the scroller and update display
    this._scroller.removeEventListener(this._VENDOR + 'TransitionEnd', this._scrollerAnimationEndCallback, false);
    this._scrollerAnimationEndCallback = null;
    this._updateDisplay(steps, direction);
};

/**
 * =========================
 * Updates the display afeter the animation ends.
 * This will return the main scrolling element to
 * initial position and will also call the heading
 * containers to get redrawn.
 * TAG: internal
 * =========================
 * @param {integer} - how many steps
 * @param {Boolean} - in which direction (True for CCW)
 * @return {void}
 */
CompassCtrl.prototype._updateDisplay = function(steps, direction)
{
    // remove duration
    this._scroller.style[this._VENDOR + 'TransitionDuration'] = '0ms';

    // update background
    if ('major' === this._compass[this._currentDir].type)
    {
        this._scroller.style.backgroundPosition = (this.properties.step / 2) + 'px 100%';
    }
    else
    {
        this._scroller.style.backgroundPosition = (this.properties.step + (this.properties.step / 2)) + 'px 100%';
    }

    // update position
    this._scroller.style.left = (-(this._scrollerWidth - this._mask.clientWidth) / 2) + 'px';

    // update containers
    this._updateContainers();
};

/**
 * =========================
 * Redraw heading containers based on current direction.
 * This is essential for ensuring infinite scrolling.
 * TAG: internal
 * =========================
 * @return {void}
 */
CompassCtrl.prototype._updateContainers = function()
{
    // empty everything
    for (var i in this._letterContainers)
    {
        this._letterContainers[i].classList.remove('major');
        this._letterContainers[i].classList.remove('minor');
        this._letterContainers[i].innerHTML = '';
    }

    var rewindCount = 6;
    var startingElement = this._compass[this._currentDir];
    var prevEl, nextEl;
    var keys = Object.keys(this._compass);
    var offset = 0;
    var centerIndex = 6;

    // fill the center element
    var currentDirIndex = keys.indexOf(this._currentDir);
    this._letterContainers['heading_' + (centerIndex + offset)].innerHTML = this._compass[keys[currentDirIndex]].label;
    this._letterContainers['heading_' + (centerIndex + offset)].classList.add( 'major' === this._compass[keys[currentDirIndex]].type ? 'major' : 'minor' );

    // fill the next and prev elements
    offset++;
    nextEl = this._compass[keys[startingElement.next]];
    prevEl = this._compass[keys[startingElement.prev]];
    this._letterContainers['heading_' + (centerIndex + offset)].innerHTML = nextEl.label;
    this._letterContainers['heading_' + (centerIndex + offset)].classList.add( 'major' === nextEl.type ? 'major' : 'minor' );
    this._letterContainers['heading_' + (centerIndex - offset)].innerHTML = prevEl.label;
    this._letterContainers['heading_' + (centerIndex - offset)].classList.add( 'major' === prevEl.type ? 'major' : 'minor' );

    // fill all the rest
    for (var i=0; i<rewindCount-1; i++)
    {
        offset++;
        nextEl = this._compass[keys[nextEl.next]];
        prevEl = this._compass[keys[prevEl.prev]];
        this._letterContainers['heading_' + (centerIndex + offset)].innerHTML = nextEl.label;
        this._letterContainers['heading_' + (centerIndex + offset)].classList.add( 'major' === nextEl.type ? 'major' : 'minor' );
        this._letterContainers['heading_' + (centerIndex - offset)].innerHTML = prevEl.label;
        this._letterContainers['heading_' + (centerIndex - offset)].classList.add( 'major' === prevEl.type ? 'major' : 'minor' );
    }
};


/**
 * =========================
 * Get closest path to the specified direction
 * TAG: internal
 * =========================
 * @param {string}
 * @param {string}
 * @return {object} - count, ccw
 */
CompassCtrl.prototype._getNearestDirOffset = function(target, current)
{
    // validate input
    if (undefined == target || null == target || typeof target !== 'string')
    {
        log.warn('CompassCtrl: please specify direction (String)');
        return null;
    }

    // validate current dir
    var current = (undefined == current || null == current) ? this._currentDir : current;

    // check for the same target
    if (target === current)
    {
        return { steps : 0, ccw : false };
    }

    // LOOK FOR NEAREST PATH
    var keys = Object.keys(this._compass);
    var _compassHalf = this._compass.length / 2;
    var targetObj = this._compass[target];

    // check cw
    var countCW = 0;
    var currentObj = this._compass[current];
    while (currentObj.next != targetObj.index)
    {
        currentObj = this._compass[keys[currentObj.next]];
        countCW++;
    }
    countCW++;

    // do not check CCW if CW works
    if (countCW <= _compassHalf)
    {
        return { steps : countCW, ccw : false };
    }

    // check ccw
    var countCCW = 0;
    currentObj = this._compass[current];
    while (currentObj.prev != targetObj.index)
    {
        currentObj = this._compass[keys[currentObj.prev]];
        countCCW++;
    }
    countCCW++;

    // get direction and steps
    var direction = countCW > countCCW ? true : false;
    var steps = Math.min(countCW, countCCW);

    return { steps : steps, ccw : direction };
};


/*
 * =========================
 * Public APIs
 * =========================
 */

// Set compass direction
CompassCtrl.prototype.setDirection = function (direction)
{
    return this._setDirection(direction);
};

// Toggle needle visibility
CompassCtrl.prototype.setNeedleVisible = function (state)
{
	var state = Boolean(state);

    if (state)
    {
    	this._mask.classList.remove('disabled')
    }
    else
    {
    	this._mask.classList.add('disabled')
    }
};

// Set latitude text
CompassCtrl.prototype.setLatitude = function (latValue)
{
    this._ctrlLatitude.innerText = latValue;
};

// Set latitude text id
CompassCtrl.prototype.setLatitudeId = function (latValue, latSubMap)
{
    this._ctrlLatitude.innerText = framework.localize.getLocStr(this.uiaId, latValue, latSubMap);
};

// Set longtitude text
CompassCtrl.prototype.setLongitude = function (lonValue)
{
    this._ctrlLongitude.innerText = lonValue;
};

// Set longtitude text id
CompassCtrl.prototype.setLongitudeId = function (lonValue, lonSubMap)
{
    this._ctrlLongitude.innerText = framework.localize.getLocStr(this.uiaId, lonValue, lonSubMap);
};

// Set elevation text
CompassCtrl.prototype.setElevation = function (eleValue)
{
    this._ctrlElevation.innerText = eleValue;
};

// Set elevation text id
CompassCtrl.prototype.setElevationId = function (eleValue, eleSubMap)
{
    this._ctrlElevation.innerText = framework.localize.getLocStr(this.uiaId, eleValue, eleSubMap);
};

// Set additional text
CompassCtrl.prototype.setAditionalText = function (additionalText)
{
    this._ctrlText.innerText = additionalText;
};

// Set additional text id
CompassCtrl.prototype.setAditionalTextId = function (additionalTextId, additionalTextSubMap)
{
    this._ctrlText.innerText = framework.localize.getLocStr(this.uiaId, additionalTextId, additionalTextSubMap);
};


/**
 * =========================
 * MULTICONTROLLER
 * =========================
 * Main multicontroller handler
 * TAG: multicontroller-only, public
 * =========================
 * @param {string} - multicontroller event
 * @return {string} - event consumed
 */
CompassCtrl.prototype.handleControllerEvent = function(eventID)
{
    log.debug('CompassCtrl: handleController() called, eventID: ' + eventID);
    retValue = 'giveFocusLeft';
    return retValue;
};


/**
 * =========================
 * GARBAGE COLLECTION
 * - Clear listeners
 * - Clean up subcontrols
 * - Clear timeouts
 * TAG: framework
 * =========================
 * @return {void}
 */
CompassCtrl.prototype.cleanUp = function()
{
    this._scroller.removeEventListener(this._VENDOR + 'TransitionEnd', this._scrollerAnimationEndCallback, false);
    this._scrollerAnimationEndCallback = null;
};

// Register Loaded with Framework
framework.registerCtrlLoaded('CompassCtrl');
