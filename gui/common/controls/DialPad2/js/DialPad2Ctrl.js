/*
 Copyright 2013 by Johnson Controls
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: ayonchn
 __________________________________________________________________________

 Description: IHU GUI Dialpad2 Control
 Revisions:
 v0.1 (16-April-2013)
 __________________________________________________________________________

 */

log.addSrcFile("DialPad2Ctrl.js", "common");

/*
 * =========================
 * Constructor
 * =========================
 * DialPad control is a virtual dialpad that allows entering of numeric input in a
 * field that can later be used as a phone
 */
function DialPad2Ctrl(uiaId, parentDiv, ctrlId, properties)
{

    /*This is the constructor of the DialPad2Ctrl Component
     Create, set dimensions and assign default name*/

    this.controlId = ctrlId;
    this.divElt = null;
    this.uiaId = null;
    this.parentDiv = null;

    //@formatter:off
    this.properties = {
        "defaultSelectCallback" : null,         // (function)
        "value" : null,                         // (string)
        "appData" : null,
        "ctrlStyle" : "DialpadStyle02",         // (string) Possible values - "DialpadStyle01", "DialpadStyle02", "DialpadStyle03"
        "longPressTimeOut" : 1500,              // timout for long press
        "isPassword": false,
        "maxDigits": 0,                         // Input maximum digits count. Only for style02. 0 means infinite number of digits
    };
    //@formatter:on
    for (var i in properties)
    {
       this.properties[i] = properties[i];
    }

    // set control's properties
    this.controlId = ctrlId;            // control's id
    this.parentDiv = parentDiv;    // control's immediate parent DOM element
    this.uiaId = uiaId;            // uiaId of the owning app
    log.debug("DialPad Control constructor called with uiaId " + this.uiaId);

    // cache current and prev focused elements
    this._currentFocusedBtnDOM = null;
    this._prevFocusedBtnDOM = null;

    this._longPressTimeoutId = null; // (Number) Unique ID assinged by setTimeout(). Used to clear the timer.
    // ignoring the click event if long press event starts

    // control DOM elements
    this._input = null;
    this._btnCall = null;
    this._btnClear = null;
    this._btnCloseDtmf = null;
    this._leftBtn = null;
    this._btns = null; // (Array) Array of keypad buttons (0-9, #, *)
    this._digitIndent = 19;
    this._caretOffset = 16;
    this._caretPinOffset = 46;
    this._pinDigitIndent = 95;
    this._prevInputWidth = null;
    this._dialpadInputValue = '';
    this._digitTransformTimeout = null;
    this._focusRestore = false;
    this._atSpeed = false;
    this._maxDigitsExceeded = false;
    this._longPressBeep = false;
    this._buttonOnFocus = null;
    this._focusInitialized = false;

    // ok button state
    this._okEnabled = true;

    this._enBtnsStrings = ["+", "", "ABC", "DEF", "GHI", "JKL", "MNO", "PQRS", "TUV", "WXYZ"];

    // handlers
    this._selectCallback = this._selectCallback.bind(this);
    this._clearHandler = this._clearHandler.bind(this);
    this._btnSelectCallback = this._btnSelectCallback.bind(this);
    this._pinBtnSelectCallback = this._pinBtnSelectCallback.bind(this);
    this._mouseDown = this._mouseDown.bind(this);
    this._mouseUp = this._mouseUp.bind(this);
    this._mouseEnter = this._mouseEnter.bind(this);
    this._mouseLeave = this._mouseLeave.bind(this);
    this._mouseDocumentUp = this._mouseDocumentUpCallback.bind(this);

    // initialize
    this.init();

}

/*
 * =========================
 * Control's prototype properties
 * =========================
 */

DialPad2Ctrl.prototype._MOUSEDOWNEVENT      = 'mousedown';
DialPad2Ctrl.prototype._MOUSEUPEVENT        = 'mouseup';
DialPad2Ctrl.prototype._MOUSEENTEREVENT     = 'mouseenter';
DialPad2Ctrl.prototype._MOUSELEAVEEVENT     = 'mouseleave';

/*
 * =========================
 * Control's init
 * =========================
 */

DialPad2Ctrl.prototype.init = function()
{
    /* CREATE ELEMENTS */

    // create control's container
    this.divElt = document.createElement('div');
    this.divElt.id = this.controlId;
    this.divElt.className = 'DialPad2Ctrl';

    // Add different set of buttons and callback to them, depending on the type of the DialPad2Ctrl
    switch(this.properties.ctrlStyle)
    {
        case "DialpadStyle01":
            this._buildDtmfDialPad();
            break;
        case "DialpadStyle02":
            this._buildPhoneDialPad();
            break;
        case "DialpadStyle03":
            this._buildPinCodeDialPad();
            break;
        default:
            this.properties.ctrlStyle = "DialpadStyle02";
            this._buildPhoneDialPad();
            break;
    }

    // Add it to the DOM
    this.parentDiv.appendChild(this.divElt);

    if (this.properties.ctrlStyle != "DialpadStyle03")
    {
        this._initCaretAndInput();
    }
};

DialPad2Ctrl.prototype._buildPhoneDialPad = function ()
{
    this.divElt.classList.add("DialpadStyle02");

    this._addBackground();

    this._addClearBtn();

    this._addDialBtns();

    this._addBtnsStrings();

    this._addCallBtn();

    this._validateMaxDigits();

    this._addStandartInput();

    this._prevInputWidth = this._inputSpan.clientWidth;
};

DialPad2Ctrl.prototype._buildDtmfDialPad = function ()
{
    if (this.properties.maxDigits != 0 && this.properties.maxDigits != null)
    {
        this.properties.maxDigits = 0;
        log.warn("DialPad2Ctrl: maxDigits propery is not valid for DialpadStyle01");
    }

    this.divElt.classList.add("DialpadStyle01");

    this._addFakeUmp();

    this._addBackground();

    // this._addLeftBtn();

    this._addStandartInput();

    this._addDialBtns();

    this._addBtnsStrings();

    this._addCloseDtmfBtn();

    this._prevInputWidth = this._inputSpan.clientWidth;
};

DialPad2Ctrl.prototype._buildPinCodeDialPad = function ()
{
    if (this.properties.maxDigits != 0 && this.properties.maxDigits != null)
    {
        this.properties.maxDigits = 0;
        log.warn("DialPad2Ctrl: maxDigits propery is not valid for DialpadStyle03");
    }

    this.divElt.classList.add("DialpadStyle03");

    this._addBackground();

    // this._addLeftBtn();

    this._addPinStyleInput();

    this._addClearBtn();

    this._addDialBtns();
};

DialPad2Ctrl.prototype._addStandartInput = function ()
{
    // input
    this._input = document.createElement('div');
    this._input.className = 'inputDiv';

    // input text wrapper
    this._inputSpan = document.createElement('span');
    this._inputSpan.className = 'inputSpan';
    this._inputSpan.style.left = "16px";
    var validateInput = this._validateInput(this.properties.value);
    this._dialpadInputValue = this.properties.value;
    if (validateInput == "valid" && this.properties.isPassword == true)
    {
        for (var i = 0; i < this.properties.value.length; i++)
        {
            this._inputSpan.innerText += "●";
        }
    }
    else if (validateInput == "valid")
    {
        this._inputSpan.innerText = this.properties.value;
    }
    else if (validateInput == "empty")
    {
        this._inputSpan.innerText = "";
        this._dialpadInputValue = "";
    }
    this._input.appendChild(this._inputSpan);

    // fade divs
    this._leftFade = document.createElement('div');
    this._leftFade.className = 'inputFade';
    this._input.appendChild(this._leftFade);

    // input caret
    this._caret = document.createElement('div');
    this._caret.className = 'caret';
    this._caret.style.left = (this._caretOffset-1) + "px";
    var currentInputValue = this._inputSpan.innerText;
    this._input.appendChild(this._caret);
    this._checkMaxDigits();

    this.divElt.appendChild(this._input);
};

DialPad2Ctrl.prototype._addPinStyleInput = function ()
{
    this._input = document.createElement('div');
    this._input.className = 'pinStyleInput';
    this.divElt.appendChild(this._input);

    var validateInput = this._validateInput(this.properties.value);
    // Create the four holders for the PIN number
    this.pinHolders = new Array(4);
    for (var i=0; i<4; i++)
    {
        this.pinHolders[i] = document.createElement('span');
        this.pinHolders[i].className = "pinHolder";
        if (validateInput == "valid" && this.properties.isPassword == true)
        {
            if (this.properties.value[i] != null && this.properties.value[i] != undefined)
            {
                this.pinHolders[i].innerText = "●";
                this._dialpadInputValue += this.properties.value[i];
            }
            else
            {
                this.pinHolders[i].innerText = "";
                this._okEnabled = false;
            }
        }
        else if (validateInput == "valid" && this.properties.isPassword != true)
        {
            if (this.properties.value[i] != null && this.properties.value[i] != undefined)
            {
                this.pinHolders[i].innerText = this.properties.value[i];
                this._dialpadInputValue += this.properties.value[i];
            }
            else
            {
                this.pinHolders[i].innerText = "";
                this._okEnabled = false;
            }
        }
        else if (validateInput == "empty")
        {
            this._okEnabled = false;
        }

        this._input.appendChild(this.pinHolders[i]);
    }
    this._caret = document.createElement('div');
    this._caret.className = 'caret';
    var indentIndex = 0;
    var fullCode = false;
    if (validateInput == "valid" && this.properties.value.length > 4)
    {
        indentIndex = 3;
        fullCode = true;
    }
    else if (validateInput == "valid")
    {
        indentIndex = this.properties.value.length;
    }
    var additionalIndent = 0;
    if (fullCode)
    {
        additionalIndent = 10;
    }
    this._caret.style.left = this._caretPinOffset + (indentIndex * this._pinDigitIndent) + additionalIndent + "px";
    this._input.appendChild(this._caret);
    // this._movePinCaret();
};

DialPad2Ctrl.prototype._addClearBtn = function ()
{
    this._btnClear = document.createElement('div');
    this._btnClear.className = 'btn clear';
    this._btnClear.setAttribute('data-value', "clear");
    this._btnClear.setAttribute('data-ref', "clear");
    var image = document.createElement("img");
    image.src = "common/controls/DialPad2/images/Delete_Btn.png";
    this._btnClear.appendChild(image);
    this._btnClear.addEventListener(this._MOUSEDOWNEVENT, this._mouseDown, false);
    this.divElt.appendChild(this._btnClear);
};

DialPad2Ctrl.prototype._addCallBtn = function ()
{
    this._btnCall = document.createElement('div');
    this._btnCall.className = "btn callBtn";
    this._btnCall.setAttribute('data-value', "call");
    this._btnCall.setAttribute('data-ref', "call");
    this._btnCall.addEventListener(this._MOUSEDOWNEVENT, this._mouseDown, false);
    this.divElt.appendChild(this._btnCall);
};

DialPad2Ctrl.prototype._addDialBtns = function ()
{
    // buttons
    this._btns = new Array();
    for (var i=0; i<12; i++)
    {
        var temp = document.createElement('div');
        temp.classList.add('btn');

        if (i<10)
        {
            temp.appendChild(document.createTextNode(i));
            temp.classList.add('btn' + i);
            temp.setAttribute('data-value', i);
            temp.setAttribute('data-ref', ("btn"+i));
        }
        else if (i<11)
        {
            temp = this._addBottomLeftBtn(temp);
        }
        else if (i<12)
        {
            temp = this._addBottomRightBtn(temp);
        }

        this._btns[i] = temp;
        this._btns[i].addEventListener(this._MOUSEDOWNEVENT, this._mouseDown, false);

        this.divElt.appendChild(temp);
    }
};

DialPad2Ctrl.prototype._addBottomLeftBtn = function (btn)
{
    if (this.properties.ctrlStyle != "DialpadStyle03")
    {
        btn.appendChild(document.createTextNode('*'));
        btn.classList.add('btnAsterisk');
        btn.setAttribute('data-value', '*');
        btn.setAttribute('data-ref', "asterisk");
    }
    else if (this.properties.ctrlStyle == "DialpadStyle03")
    {
        btn.classList.add('btnCancel');
        btn.classList.add('small');
        btn.setAttribute('data-value', 'smallCancel');
        btn.setAttribute('data-ref', "smallCancel");
        var image = document.createElement("img");
        image.src = "common/controls/DialPad2/images/Icn_Delete.png";
        btn.appendChild(image);
    }

    return btn;
};

DialPad2Ctrl.prototype._addBottomRightBtn = function (btn)
{
    if (this.properties.ctrlStyle != "DialpadStyle03")
    {
        btn.appendChild(document.createTextNode('#'));
        btn.classList.add('btnSharp');
        btn.setAttribute('data-value', '#');
        btn.setAttribute('data-ref', "sharp");
    }
    else if (this.properties.ctrlStyle == "DialpadStyle03")
    {
        btn.classList.add('btnOK');
        btn.classList.add('small');
        btn.setAttribute('data-value', 'smallOK');
        btn.setAttribute('data-ref', "smallOK");
        var image = document.createElement("img");
        image.src = "common/controls/DialPad2/images/Icn_Send.png";
        btn.appendChild(image);
        this._setButtonEnabled(btn, this._okEnabled);
    }

    return btn;
};

DialPad2Ctrl.prototype._addCloseDtmfBtn = function ()
{
    this._btnCloseDtmf = document.createElement('div');
    this._btnCloseDtmf.className = "btn closeDtmf";
    this._btnCloseDtmf.setAttribute('data-value', "closeDtmf");
    this._btnCloseDtmf.setAttribute('data-ref', "closeDtmf");
    this._btnCloseDtmf.addEventListener(this._MOUSEDOWNEVENT, this._mouseDown, false);
    var image = document.createElement("img");
    image.src = "common/images/icons/IcnUmpDialpad_En.png";
    this._btnCloseDtmf.appendChild(image);
    this.divElt.appendChild(this._btnCloseDtmf);
};

DialPad2Ctrl.prototype._addBtnsStrings = function ()
{
    var sp;
    for (var i=0; i<10; i++)
    {
        sp = document.createElement('span');
        sp.appendChild(document.createTextNode(this._enBtnsStrings[i]));
        this._btns[i].appendChild(sp);
    }
};

DialPad2Ctrl.prototype._addFakeUmp = function ()
{
    var fakeUmp = document.createElement("div");
    fakeUmp.classList.add("DialPadFakeUmp");
    var fakeArc = document.createElement("div");
    fakeArc.classList.add("DialPadFakeUmpArc");
    this.divElt.appendChild(fakeUmp);
    this.divElt.appendChild(fakeArc);
};

DialPad2Ctrl.prototype._addBackground = function ()
{
    var background = document.createElement("div");
    background.classList.add("ctrlBackground");
    this.divElt.appendChild(background);
};

DialPad2Ctrl.prototype._addLeftBtn = function ()
{
    this._leftBtn = document.createElement('div');
    this._leftBtn.classList.add("btn");
    this._leftBtn.classList.add("leftBtn");
    this._leftBtn.setAttribute('data-value', "leftBtn");
    this._leftBtn.setAttribute('data-ref', "leftBtn");
    this._leftBtn.addEventListener(this._MOUSEDOWNEVENT, this._mouseDown, false);
    this.divElt.appendChild(this._leftBtn);
};
/*
 * =========================
 * Control's public API
 * The followig methods can be used outside
 * this control.
 * =========================
 */
/**
 * Context capture
 * TAG: framework, public
 * =========================
 * @return {object} - capture data
 */
DialPad2Ctrl.prototype.getContextCapture = function()
{
    var returnObj = {
        inputValue : this.getInputValue(),
        focussedItem : "btn5"
    };
    if (this._currentFocusedBtnDOM && this._currentFocusedBtnDOM.getAttribute("data-ref"))
    {
        returnObj.focussedItem = this._currentFocusedBtnDOM.getAttribute("data-ref");
    }

    return returnObj;
};

/**
 * Context restore
 * TAG: framework, public
 * =========================
 * @return {object} - capture data
 */
DialPad2Ctrl.prototype.setAtSpeed = function (atSpeed)
{
    if (atSpeed == true)
    {
        // this._removeFocused();
        clearTimeout(this._longPressTimeoutId);
        this._atSpeed = true;
        this._disableDialBtns();
        this._disableClearBtn();
        this._disableCallBtn();
    }
    else
    {
        this._atSpeed = false;
        if (this._maxDigitsExceeded == false)
        {
            this._enableDialBtns();
        }

        this._enableClearBtn();
        this._enableCallBtn();
    }
};

DialPad2Ctrl.prototype.restoreContext = function(restoreData)
{
    // validate input
    if (!restoreData.hasOwnProperty('inputValue') || !restoreData.hasOwnProperty('focussedItem'))
    {
        log.info('No data to restore');
        return;
    }

    this.properties.value = restoreData.inputValue;
    var focussedItem = null;

    for (var i=0; i<this._btns.length; i++)
    {
        if (this._btns[i].getAttribute("data-ref") === restoreData.focussedItem)
        {
            focussedItem = this._btns[i];
            break;
        }
    }
    if (!focussedItem)
    {
        if (this._btnCall && this._btnCall.getAttribute("data-ref") === restoreData.focussedItem)
        {
            focussedItem = this._btnCall;
        }
        else if (this._btnClear && this._btnClear.getAttribute("data-ref") === restoreData.focussedItem)
        {
            focussedItem = this._btnClear;
        }
        if (this._btnCloseDtmf && this._btnCloseDtmf.getAttribute("data-ref") === restoreData.focussedItem)
        {
            focussedItem = this._btnCloseDtmf;
        }
        else if (this._leftBtn && this._leftBtn.getAttribute("data-ref") === restoreData.focussedItem)
        {
            focussedItem = this._leftBtn;
        }
    }
    this._focusRestore = true;
    // overwrite control properties
    this.setInputValue(restoreData.inputValue);
    this._makeFocused(focussedItem);
};

DialPad2Ctrl.prototype.setInputValue = function (value)
{
    this._dialpadInputValue = "";
    var validateInput = this._validateInput(value);
    if (validateInput == "valid" && this.properties.ctrlStyle == "DialpadStyle02" && this.properties.maxDigits != 0 && value.length > this.properties.maxDigits)
    {
        value = value.substring(0, this.properties.maxDigits);
    }

    if (this.properties.ctrlStyle != "DialpadStyle03")
    {
        this._moveCaret(true);
        if (validateInput == "valid" && this.properties.isPassword == true)
        {
            this._dialpadInputValue = value;
            this._inputSpan.innerText = "";
            for (var i = 0; i < value.length; i++)
            {
                this._inputSpan.innerText += "●";
            }
            this._moveCaret();
        }
        else if (validateInput == "valid" && this.properties.isPassword != true)
        {
            this._dialpadInputValue = value;
            this._inputSpan.innerText = value;
            this._moveCaret();
        }
        else if (validateInput == "empty")
        {
            this._inputSpan.innerText = "";
            this._moveCaret(true);
        }
        this._checkMaxDigits();
    }
    else if (this.properties.ctrlStyle == "DialpadStyle03")
    {
        for (var i = 0; i < 4; i++)
        {
            this._setPinHolder(this.pinHolders[i], "");
            this._movePinCaret();
        }

        if (validateInput == "valid")
        {
            for (var i=0; i < 4; i++)
            {
                if (value[i] != undefined)
                {
                    this._setPinHolder(this.pinHolders[i], value[i]);
                }
                else
                {
                    break;
                }
            }
        }
        else if (validateInput == "empty")
        {
            for (var i=0; i < 4; i++)
            {
                this._setPinHolder(this.pinHolders[i], "");
            }
        }
        if (this.properties.isPassword == true)
        {
            clearTimeout(this._digitTransformTimeout);
            var holderToTransform = this._getLastFullPinHolder();
            this._transformPinStyleDigitToDot(holderToTransform);
        }
        this._movePinCaret();
    }
};

// Get the digits typed so far
DialPad2Ctrl.prototype.getInputValue = function ()
{
    return this._dialpadInputValue;
};

DialPad2Ctrl.prototype.addOneDigit = function (digit)
{
    var validate = this._validateInput(digit);
    if (validate == "valid" && digit.length == 1)
    {
        switch(this.properties.ctrlStyle)
        {
            case "DialpadStyle01":
                this._dialpadInputValue += digit;
                this._inputSpan.innerText += digit;
                this._moveCaret();
                var params = {"input":digit, "btnSelected":"Tone"};
                if (typeof this.properties.defaultSelectCallback == 'function')
                {
                    this.properties.defaultSelectCallback(this, this.properties.appData, params);
                }
                else
                {
                    log.info("DialPad Control: there is no \"defaultSelectCallback\" registered!");
                }
                break;
            case "DialpadStyle03":
                var holder = this._getFirstEmptyPinHolder();
                this._setPinHolder(holder, digit);
                this._movePinCaret();
                break;
            default:
                if (this._maxDigitsExceeded == false)
                {
                    this._dialpadInputValue += digit;
                    if (this.properties.isPassword == true)
                    {
                        this._addPasswordDigit(digit);
                    }
                    else
                    {
                        this._inputSpan.innerText += digit;
                    }
                    this._moveCaret();
                    this._checkMaxDigits();
                }
                else
                {
                    log.warn("DialPad2Ctrl: max digits are exceeded.");
                }
                break;
        }
    }
    else
    {
        log.warn("DialPad control: the parameter should be a single char");
    }
};

DialPad2Ctrl.prototype.removeOneDigit = function ()
{
    switch (this.properties.ctrlStyle)
    {
        case "DialpadStyle01":
            log.warn("DailPad control: cannot delete digits in Dtmf dial pad");
            break;
        case "DialpadStyle03":
            var holder = this._getLastFullPinHolder();
            this._clearPinHolder(holder);
            this._movePinCaret();
            break;
        default:
            this._dialpadInputValue = this._dialpadInputValue.substr(0, this._inputSpan.innerText.length-1);
            var val = this._inputSpan.innerText.substr(0, this._inputSpan.innerText.length-1);
            this._inputSpan.innerText = val;
            this._moveCaret();
            this._checkMaxDigits();
            break;
    }
};

/*
 * =========================
 * Control's private API
 * The followig methods should be used only inside
 * this control.
 * =========================
 */
DialPad2Ctrl.prototype._checkMaxDigits = function (target)
{
    if (this.properties.ctrlStyle == "DialpadStyle02" && this.properties.maxDigits != 0 && this._dialpadInputValue.length >= this.properties.maxDigits && this._maxDigitsExceeded == false && this._atSpeed == false)
    {
        this._maxDigitsExceeded = true;
        this._removeActive(target);
        this._makeFocused(target);
        this._disableDialBtns(target);
    }
    else if (this.properties.ctrlStyle == "DialpadStyle02" && this.properties.maxDigits != 0 && this._dialpadInputValue.length < this.properties.maxDigits && this._maxDigitsExceeded == true && this._atSpeed == false)
    {
        this._maxDigitsExceeded = false;
        this._enableDialBtns();
    }
};

DialPad2Ctrl.prototype._validateMaxDigits = function ()
{
    if ((typeof(this.properties.maxDigits) == "number" && this.properties.maxDigits < 0) || typeof(this.properties.maxDigits) != "number")
    {
        this.properties.maxDigits = 0;
    }

    if (this.properties.maxDigits != 0 && this._validateInput(this.properties.value) == "valid")
    {
        this.properties.value = this.properties.value.substring(0, this.properties.maxDigits);
    }
};

DialPad2Ctrl.prototype._disableDialBtns = function (target)
{
    for(var i = 0; i < this._btns.length; i++)
    {
        this._btns[i].classList.add("disabled");
    }

    if (this.properties.ctrlStyle == "DialpadStyle03")
    {
        this._btns[10].classList.remove("disabled");
    }
    if (this.properties.ctrlStyle == "DialpadStyle02" && this._currentFocusedBtnDOM)
    {
        this._makeFocused(this._currentFocusedBtnDOM);
    }
};

DialPad2Ctrl.prototype._disableClearBtn = function ()
{
    if (this._btnClear)
    {
        this._btnClear.classList.add("disabled");
    }
};

DialPad2Ctrl.prototype._disableCallBtn = function ()
{
    if (this._btnCall)
    {
        this._btnCall.classList.add("disabled");
    }
};

DialPad2Ctrl.prototype._enableDialBtns = function ()
{
    for(var i = 0; i < this._btns.length - 1; i++)
    {
        this._btns[i].classList.remove("disabled");
    }

    if (this._okEnabled)
    {
        this._btns[11].classList.remove("disabled");
    }
};

DialPad2Ctrl.prototype._enableClearBtn = function ()
{
    if (this._btnClear)
    {
        this._btnClear.classList.remove("disabled");
    }
};

DialPad2Ctrl.prototype._enableCallBtn = function ()
{
    if (this._btnCall)
    {
        this._btnCall.classList.remove("disabled");
    }
};

DialPad2Ctrl.prototype._initCaretAndInput = function ()
{
    if (this.properties.value != null || this.properties.value != undefined || this.properties.value != "")
    {
        if ((this._inputSpan.clientWidth + this._caretOffset) > this._input.clientWidth)
        {
            this._inputSpan.style.left = (- this._inputSpan.clientWidth - this._caretOffset + this._input.clientWidth) + "px";
            this._caret.style.left = (- this._caretOffset + this._input.clientWidth + 2) + "px";
        }
        else
        {
            this._caret.style.left = (this._inputSpan.clientWidth + this._caretOffset + 2) + "px";
        }
        this._prevInputWidth = this._inputSpan.clientWidth;
    }
};

DialPad2Ctrl.prototype._movePinCaret = function ()
{
    var emptyPinHolder = this._getFirstEmptyPinHolder();
    if (emptyPinHolder)
    {
        this._caret.style.left = this._caretPinOffset + emptyPinHolder.offsetLeft + "px";
    }
    else
    {
        emptyPinHolder = this._getLastFullPinHolder();
        if (emptyPinHolder)
        {
            this._caret.style.left = this._caretPinOffset + emptyPinHolder.offsetLeft + 10 + "px";
        }
    }
};

DialPad2Ctrl.prototype._moveCaret = function (atStartPoint)
{
    if ((this._input.clientWidth - this._inputSpan.clientWidth - 10 - 16) < 0)
    {
        this._inputSpan.style.left = (this._input.clientWidth - this._inputSpan.clientWidth - 10) + "px";
    }
    else
    {
        this._inputSpan.style.left = "16px";
    }
};

DialPad2Ctrl.prototype._validateInput = function (value)
{
    var returnValue = null;
    if (value == null || value == undefined || value == "")
    {
        log.info("DialPad: input value is set to empty.");
        returnValue = "empty";
    }
    else if (utility.toType(value) != "string")
    {
        log.warn("DialPad control: invalid input value type. The type should be 'string'.");
        returnValue = "notString";
    }
    else
    {
        returnValue = "valid";
    }

    return returnValue;
};

DialPad2Ctrl.prototype._setButtonEnabled = function (button, enabled)
{
    if (button && enabled)
    {
        button.classList.remove("disabled");
    }
    else if (button && !button.classList.contains("disabled"))
    {
        button.classList.add("disabled");
    }
};

DialPad2Ctrl.prototype._btnSelectCallback = function(e)
{
    // set value
    if (this.properties.ctrlStyle != "DialpadStyle03" && !this._atSpeed && !this._maxDigitsExceeded)
    {
        var val = e.currentTarget.getAttribute('data-value');
        this._dialpadInputValue += val;
        if (this.properties.isPassword == true)
        {
            this._addPasswordDigit(val);
        }
        else
        {
            this._inputSpan.innerText += val;
        }

        this._moveCaret();
        if (val == "+")
        {
            e.currentTarget.setAttribute('data-value', "0");
        }
        var params = {"input":val, "btnSelected":"Tone"};
        if (typeof this.properties.defaultSelectCallback == 'function')
        {
            this.properties.defaultSelectCallback(this, this.properties.appData, params);
        }
        else
        {
            log.info("DialPad Control: there is no \"defaultSelectCallback\" registered!");
        }
        this._checkMaxDigits(e.currentTarget);
    }
    else if (!this._maxDigitsExceeded)
    {
        this._pinBtnSelectCallback(e);
    }
};

DialPad2Ctrl.prototype._pinBtnSelectCallback = function (e)
{
    var val = e.currentTarget.getAttribute('data-value');

    if (val != "smallCancel" && val != "smallOK" && !this._atSpeed)
    {
        var holder = this._getFirstEmptyPinHolder();
        if (holder != null && holder != undefined)
        {
            var params = {"input":val, "btnSelected":"Tone"};
            if (typeof this.properties.defaultSelectCallback == 'function')
            {
                this.properties.defaultSelectCallback(this, this.properties.appData, params);
            }
            else
            {
                log.info("DialPad Control: there is no \"defaultSelectCallback\" registered!");
            }
        }
        this._setPinHolder(holder, val);
        this._movePinCaret();
    }
    else if (val == "smallOK" && this._okEnabled && !this._atSpeed)
    {
        this._selectCallback("OK");
    }
    else if (val == "smallCancel")
    {
        this._selectCallback("Cancel");
    }
};

DialPad2Ctrl.prototype._selectCallback = function(btnType)
{
    if (!this._atSpeed || btnType == "CloseDtmf" || btnType == "Cancel")
    {
        // fire the callback
        var params = {"input":this.getInputValue(), "btnSelected":btnType};

        if (typeof this.properties.defaultSelectCallback == 'function')
        {
            this.properties.defaultSelectCallback(this, this.properties.appData, params);
        }
        else
        {
            log.info("DialPad Control: there is no \"defaultSelectCallback\" registered!");
        }
    }
};

DialPad2Ctrl.prototype._clearHandler = function()
{
    if (!this._atSpeed)
    {
        // clear last digit
        var deletedDigit;
        if (this.properties.ctrlStyle != "DialpadStyle03" && this._dialpadInputValue != null && this._dialpadInputValue != undefined)
        {
            deletedDigit = this._dialpadInputValue.substr(-1, 1);
            this._dialpadInputValue = this._dialpadInputValue.substr(0, this._dialpadInputValue.length - 1);
            var val = this._inputSpan.innerText.substr(0, this._inputSpan.innerText.length-1);
            this._inputSpan.innerText = val;
            this._moveCaret();
            this._checkMaxDigits();
        }
        else if (this.properties.ctrlStyle == "DialpadStyle03")
        {
            var holder = this._getLastFullPinHolder();
            if (holder != null && holder != undefined)
            {
                deletedDigit = this._clearPinHolder(holder);
                this._movePinCaret();
            }
        }

        var params = {"input":deletedDigit, "btnSelected":"Clear"};
        if (deletedDigit)
        {
            if (typeof this.properties.defaultSelectCallback == 'function')
            {
                this.properties.defaultSelectCallback(this, this.properties.appData, params);
            }
            else
            {
                log.info("DialPad Control: there is no \"defaultSelectCallback\" registered!");
            }
        }
    }
};

DialPad2Ctrl.prototype._getFirstEmptyPinHolder = function ()
{
    var returnValue = null;

    for (var i=0; i<this.pinHolders.length; i++)
    {
        if (this.pinHolders[i].innerText == "")
        {
            returnValue = this.pinHolders[i];
            break;
        }
    }

    return returnValue;
};

DialPad2Ctrl.prototype._getLastFullPinHolder = function ()
{
    var returnValue = null;

    for (var i=0; i<this.pinHolders.length; i++)
    {
        if (this.pinHolders[i].innerText == "")
        {
            break;
        }
        returnValue = this.pinHolders[i];
    }

    return returnValue;
};

DialPad2Ctrl.prototype._clearPinHolder = function (holder)
{
    clearTimeout(this._digitTransformTimeout);
    var returnValue = null;
    if (holder != null && holder.innerText)
    {
        returnValue = this._dialpadInputValue.substr(-1, 1);
        this._dialpadInputValue = this._dialpadInputValue.substr(0, this._dialpadInputValue.length - 1);
        holder.innerText = "";
    }
    var firstEmptyHolder = this._getFirstEmptyPinHolder();
    if (firstEmptyHolder != null)
    {
        this._okEnabled = false;
    }
    else
    {
        this._okEnabled = true;
    }
    this._setButtonEnabled(this._btns[11], this._okEnabled);

    return returnValue;
};

DialPad2Ctrl.prototype._addPasswordDigit = function (digit)
{
    clearTimeout(this._digitTransformTimeout);
    this._transformDigitToDot();
    this._inputSpan.innerText += digit;
    var transform = this._transformDigitToDot.bind(this);
    this._digitTransformTimeout = setTimeout(transform, 2000);
};

DialPad2Ctrl.prototype._transformDigitToDot = function ()
{
    var str = this._inputSpan.innerText.substr(-1, 1);
    if (str != "●" && str)
    {
        this._inputSpan.innerText = this._inputSpan.innerText.replace(str, "●");
    }
};

DialPad2Ctrl.prototype._transformPinStyleDigitToDot = function (holder)
{
    if (holder != null && holder.innerText != "●")
    {
        holder.innerText = "●";
    }
};

DialPad2Ctrl.prototype._setPinHolder = function (holder, value)
{
    if (holder != null && value != null && value != "" && this.properties.isPassword == true)
    {
        var holderToTransform = this._getLastFullPinHolder();
        this._transformPinStyleDigitToDot(holderToTransform);
        clearTimeout(this._digitTransformTimeout);
        holder.innerText = value;
        this._dialpadInputValue += value;
        var transform = this._transformPinStyleDigitToDot.bind(this, holder);
        this._digitTransformTimeout = setTimeout(transform, 2000);
    }
    else if (holder != null && value != null && value != "" && this.properties.isPassword != true)
    {
        holder.innerText = value;
        this._dialpadInputValue += value;
    }
    else if (holder != null && value != null && value == "")
    {
        this._clearPinHolder(holder);
    }

    var firstEmptyHolder = this._getFirstEmptyPinHolder();
    if (firstEmptyHolder != null)
    {
        this._okEnabled = false;
    }
    else
    {
        this._okEnabled = true;
    }
    this._setButtonEnabled(this._btns[11], this._okEnabled);
};

DialPad2Ctrl.prototype._localizeString = function (stringId, subMap)
{
    return framework.localize.getLocStr(this.uiaId, stringId, subMap);
};

DialPad2Ctrl.prototype._makeActive = function (target)
{
    if (target != null)
    {
        target.classList.add("active");
    }
};

DialPad2Ctrl.prototype._removeActive = function (target)
{
    if (target != null)
    {
        target.classList.remove("active");
    }
};

DialPad2Ctrl.prototype._mouseDown = function (e)
{
    var target = this._getDOMElementRef(e.currentTarget);
    if (!target.classList.contains("disabled"))
    {
        if (this._currentFocusedBtnDOM != null)
        {
            this._removeFocused();
        }
        else
        {
            framework.common.stealFocus();
        }
        this._makeActive(target);

        // set long press timer
        clearTimeout(this._longPressTimeoutId);
        this._longPressTimeoutId = null;
        this._longPressTimeoutId = setTimeout(this._longPressHandler.bind(this, target, "Touch"), this.properties.longPressTimeOut);

        target.addEventListener(this._MOUSEENTEREVENT, this._mouseEnter, false);
        target.addEventListener(this._MOUSELEAVEEVENT, this._mouseLeave, false);
        target.addEventListener(this._MOUSEUPEVENT, this._mouseUp, false);
        document.addEventListener(this._MOUSEUPEVENT, this._mouseDocumentUp, false);
        this._buttonOnFocus = target;
    }
};

DialPad2Ctrl.prototype._mouseUp = function (e)
{
    var target = this._getDOMElementRef(e.currentTarget);
    if (target == this._buttonOnFocus)
    {
        clearTimeout(this._longPressTimeoutId);
        this._longPressTimeoutId = null;

        this._removeActive(target);

        this._makeFocused(e.currentTarget);

        this._triggerButtonSelectCallback(target, "Touch");
    }
};

DialPad2Ctrl.prototype._mouseDocumentUpCallback = function (e)
{
    if (this._buttonOnFocus != null)
    {
        this._buttonOnFocus.removeEventListener(this._MOUSEENTEREVENT, this._mouseEnter, false);
        this._buttonOnFocus.removeEventListener(this._MOUSELEAVEEVENT, this._mouseLeave, false);
        this._buttonOnFocus.removeEventListener(this._MOUSEUPEVENT, this._mouseUp, false);
        this._buttonOnFocus = null;
    }
    document.removeEventListener(this._MOUSEUPEVENT, this._mouseDocumentUp, false);
};

DialPad2Ctrl.prototype._mouseEnter = function (e)
{
    var target = this._getDOMElementRef(e.currentTarget);

    if (target.classList.contains("focused"))
    {
        target.classList.remove("focused");
    }
    this._makeActive(target);
};

DialPad2Ctrl.prototype._mouseLeave = function (e)
{
    var target = this._getDOMElementRef(e.currentTarget);

    clearTimeout(this._longPressTimeoutId);
    this._longPressTimeoutId = null;

    this._removeActive(target);
    if (!target.classList.contains("focused"))
    {
        target.classList.add("focused");
        this._currentFocusedBtnDOM = target;
    }
};

DialPad2Ctrl.prototype._longPressHandler = function (target, eventCause)
{
    if (this.properties.ctrlStyle != "DialpadStyle01" && this.properties.ctrlStyle != "DialpadStyle03" && target.getAttribute("data-value") == 0)
    {
        framework.common.beep('Long', eventCause);
        this._longPressBeep = true;
        target.setAttribute("data-value", "+");
        var mouseupev = document.createEvent("HTMLEvents");
        mouseupev.initEvent("mouseup", true, true);

        target.dispatchEvent(mouseupev);
        // if long press called ignor the click event after that
        this._checkMaxDigits();
    }
    else if (target.getAttribute("data-value") == "clear" && this.properties.ctrlStyle != "DialpadStyle03")
    {
        framework.common.beep('Long', eventCause);
        this._longPressBeep = true;
        var val = this.getInputValue();
        var params = {"input":val, "btnSelected":"Clear"};
        this.setInputValue("");
        if (typeof this.properties.defaultSelectCallback == 'function')
        {
            this.properties.defaultSelectCallback(this, this.properties.appData, params);
        }
        else
        {
            log.info("DialPad Control: there is no \"defaultSelectCallback\" registered!");
        }
        this._checkMaxDigits();
    }
    else if (target.getAttribute("data-value") == "clear" && this.properties.ctrlStyle == "DialpadStyle03")
    {
        framework.common.beep('Long', eventCause);
        this._longPressBeep = true;
        var val = this.getInputValue();
        var params = {"input":val, "btnSelected":"Clear"};
        for (var i = 0; i < 4; i++)
        {
            this._setPinHolder(this.pinHolders[i], "");
            this._movePinCaret();
        }
        if (typeof this.properties.defaultSelectCallback == 'function')
        {
            this.properties.defaultSelectCallback(this, this.properties.appData, params);
        }
        else
        {
            log.info("DialPad Control: there is no \"defaultSelectCallback\" registered!");
        }
    }
};

DialPad2Ctrl.prototype._getDOMElementRef = function (DOMEl)
{
    var refName = DOMEl.getAttribute("data-ref");
    var ref = null;
    switch (refName)
    {
        case "btn0":
            ref = this._btns[0];
            break;
        case "btn1":
            ref = this._btns[1];
            break;
        case "btn2":
            ref = this._btns[2];
            break;
        case "btn3":
            ref = this._btns[3];
            break;
        case "btn4":
            ref = this._btns[4];
            break;
        case "btn5":
            ref = this._btns[5];
            break;
        case "btn6":
            ref = this._btns[6];
            break;
        case "btn7":
            ref = this._btns[7];
            break;
        case "btn8":
            ref = this._btns[8];
            break;
        case "btn9":
            ref = this._btns[9];
            break;
        case "clear":
            ref = this._btnClear;
            break;
        case "asterisk":
            ref = this._btns[10];
            break;
        case "sharp":
            ref = this._btns[11];
            break;
        case "call":
            ref = this._btnCall;
            break;
        case "smallCancel":
            ref = this._btns[10];
            break;
        case "smallOK":
            ref = this._btns[11];
            break;
        case "closeDtmf":
            ref = this._btnCloseDtmf;
            break;
        case "leftBtn":
            ref = this._leftBtn;
        default:
            log.warn("DalPadCtrl: undefined btn");
            break;
    }

    return ref;
};

DialPad2Ctrl.prototype._makeFocused = function (target)
{
    if (this._focusInitialized === true || this._focusRestore === true)
    {
        // remove if any other button is focused by accident
        var activeBtns = document.getElementsByClassName("focused");
        for (var i = 0; i < activeBtns.length; i++)
        {
            activeBtns[i].classList.remove("focused");
        }

        this._currentFocusedBtnDOM = target;
        if (target != null)
        {
            target.classList.add("focused");
        }
        else
        {
            target = this._setDefaultFocusedBtn();
        }
    }

    return target;
};

DialPad2Ctrl.prototype._setDefaultFocusedBtn = function ()
{
    returnValue = null;

    if (this.properties.ctrlStyle === "DialpadStyle02")
    {
        if (this.properties.maxDigits != 0 && this.properties.maxDigits != null && this.properties.maxDigits != undefined && this._maxDigitsExceeded === true && this._atSpeed === false)
        {
            // default focused btn is call btn
            this._currentFocusedBtnDOM = this._btnCall;
            this._currentFocusedBtnDOM.classList.add("focused");
            retrunValue = this._btnCall;
        }
        else if (this._maxDigitsExceeded === false && this._atSpeed === false)
        {
            // when all btns enabled default focused one is 1
            this._currentFocusedBtnDOM = this._btns[1];
            this._currentFocusedBtnDOM.classList.add("focused");
            retrunValue = this._btns[1];
        }
        else
        {
            // No enabled button to focus. Give focus to the left button
        }
    }
    else
    {
        if (this._atSpeed === true && this.properties.ctrlStyle === "DialpadStyle01")
        {
            // default focused btn is closeDtmf
            this._currentFocusedBtnDOM = this._btnCloseDtmf;
            this._currentFocusedBtnDOM.classList.add("focused");
            retrunValue = this._btnCloseDtmf;
        }
        else if (this._atSpeed === true && this.properties.ctrlStyle === "DialpadStyle03")
        {
            // default focused btn is cancel
            this._currentFocusedBtnDOM = this._btns[10];
            this._currentFocusedBtnDOM.classList.add("focused");
            retrunValue = this._btns[10];
        }
        else
        {
            // when all btns enabled default focused one is 1
            this._currentFocusedBtnDOM = this._btns[1];
            this._currentFocusedBtnDOM.classList.add("focused");
            retrunValue = this._btns[1];
        }
    }

    return returnValue;
};

DialPad2Ctrl.prototype._removeFocused = function (leaveCurrentEl)
{
    if (this._currentFocusedBtnDOM != null)
    {
        this._currentFocusedBtnDOM.classList.remove("focused");
    }

    if (!leaveCurrentEl)
    {
        this._prevFocusedBtnDOM = this._currentFocusedBtnDOM;
        this._currentFocusedBtnDOM = null;
    }
};

DialPad2Ctrl.prototype._getFocused = function ()
{
    this._makeFocused(this._btns[1]);
};

DialPad2Ctrl.prototype._getLeftBtn = function ()
{
    var returnValue = "consumed";
    if (this._currentFocusedBtnDOM != null)
    {
        var value = this._currentFocusedBtnDOM.getAttribute("data-value");
        switch (value)
        {
            case "1":
            case "4":
            case "7":
            case "*":
            case "smallCancel":
                returnValue = "giveFocusLeft";
            break;
            case "0":
                this._removeFocused();
                this._makeFocused(this._btns[10]);
                break;
            case "#":
            case "smallOK":
                this._removeFocused();
                this._makeFocused(this._btns[0]);
                break;
            case "ok":
            case "call":
                var prevBtn = this._prevFocusedBtnDOM;
                this._removeFocused();
                var prevValue;
                if (prevBtn)
                {
                    prevValue = prevBtn.getAttribute("data-value");
                }
                if (prevValue == "3" || prevValue == "6" || prevValue == "9" || prevValue == "#" || prevValue == "smallOK")
                {
                    this._makeFocused(prevBtn);
                }
                else
                {
                    this._makeFocused(this._btns[3]);
                }
                break;
            case "clear":
                // returnValue = "giveFocusLeft";
                // no action
                returnValue = "ignored";
                break;
            case "closeDtmf":
                var prevBtn = this._prevFocusedBtnDOM;
                this._removeFocused();
                if (prevBtn)
                {
                    this._makeFocused(prevBtn);
                }
                else
                {
                    this._makeFocused(this._btns[11]);
                }
                break;
            default:
                var index = parseInt(value) - 1;
                this._removeFocused();
                this._makeFocused(this._btns[index]);
                break;
        }
    }
    else
    {
        this._getFocused();
    }
    return returnValue;
};

DialPad2Ctrl.prototype._getRightBtn = function ()
{
    var returnValue = "consumed";
    if (this._currentFocusedBtnDOM != null)
    {
        var value = this._currentFocusedBtnDOM.getAttribute("data-value");
        switch (value)
        {
            case "3":
            case "6":
            case "9":
            case "#":
            case "smallOK":
                if (this._btnCall)
                {
                    this._removeFocused();
                    this._makeFocused(this._btnCall);
                }
                else if (this._btnCloseDtmf)
                {
                    this._removeFocused();
                    this._makeFocused(this._btnCloseDtmf);
                }
                else
                {
                    returnValue = "ignored";
                }
                break;
            case "0":
                if (this.properties.ctrlStyle != "DialpadStyle03" || this._okEnabled)
                {
                    this._removeFocused();
                    this._makeFocused(this._btns[11]);
                }
                else
                {
                    // no action
                    returnValue = "ignored";
                }
                break;
            case "*":
            case "smallCancel":
                this._removeFocused();
                this._makeFocused(this._btns[0]);
                break;
            case "ok":
            case "call":
                returnValue = "ignored";
                break;
            case "clear":
                returnValue = "ignored";
                break;
            case "closeDtmf":
                returnValue = "ignored";
                break;
            default:
                var index = parseInt(value) + 1;
                this._removeFocused();
                this._makeFocused(this._btns[index]);
                break;
        }
    }
    else
    {
        this._getFocused();
    }
    return returnValue;
};

DialPad2Ctrl.prototype._getUpBtn = function ()
{
    var returnValue = "consumed";
    if (this._currentFocusedBtnDOM != null)
    {
        var value = this._currentFocusedBtnDOM.getAttribute("data-value");
        switch (value)
        {
            case "1":
            case "2":
            case "3":
                if (this._btnClear)
                {
                    this._removeFocused();
                    this._makeFocused(this._btnClear);
                }
                else
                {
                    returnValue = "ignored";
                }
                break;
            case "call":
                if (this._btnClear)
                {
                    this._removeFocused();
                    this._makeFocused(this._btnClear);
                }
                else
                {
                    returnValue = "ignored";
                }
                break;
            case "ok":
            case "clear":
                returnValue = "ignored";
                break;
            case "*":
            case "smallCancel":
                this._removeFocused();
                this._makeFocused(this._btns[7]);
                break;
            case "0":
                this._removeFocused();
                this._makeFocused(this._btns[8]);
                break;
            case "#":
            case "smallOK":
                this._removeFocused();
                this._makeFocused(this._btns[9]);
                break;
            case "closeDtmf":
                returnValue = "ignored";
                break;
            default:
                var index = parseInt(value) - 3;
                this._removeFocused();
                this._makeFocused(this._btns[index]);
                break;
        }
    }
    else
    {
        this._getFocused();
    }
    return returnValue;
};

DialPad2Ctrl.prototype._getDownBtn = function ()
{
    var returnValue = "consumed";
    if (this._currentFocusedBtnDOM != null)
    {
        var value = this._currentFocusedBtnDOM.getAttribute("data-value");
        switch (value)
        {
            case "closeDtmf":
            case "call":
            case "ok":
            case "*":
            case "0":
            case "#":
            case "smallOK":
            case "smallCancel":
                returnValue = "ignored";
                break;
            case "clear":
                var prevBtn = this._prevFocusedBtnDOM;
                this._removeFocused();
                var prevValue;
                if (prevBtn)
                {
                    prevValue = prevBtn.getAttribute("data-value");
                }
                if (prevValue == "1" || prevValue == "2" || prevValue == "3" || prevValue == "call")
                {
                    this._makeFocused(prevBtn);
                }
                else
                {
                    this._makeFocused(this._btns[1]);
                }
                break;
            case "7":
                this._removeFocused();
                this._makeFocused(this._btns[10]);
                break;
            case "8":
                this._removeFocused();
                this._makeFocused(this._btns[0]);
                break;
            case "9":
                if (this.properties.ctrlStyle != "DialpadStyle03" || this._okEnabled)
                {
                    this._removeFocused();
                    this._makeFocused(this._btns[11]);
                }
                else
                {
                    // no action
                    returnValue = "ignored";
                }
                break;
            default:
                var index = parseInt(value) + 3;
                this._removeFocused();
                this._makeFocused(this._btns[index]);
                break;
        }
    }
    else
    {
        this._getFocused();
    }
    return returnValue;
};

DialPad2Ctrl.prototype._getNextBtn = function ()
{
    var returnValue = "consumed";
    if (this._currentFocusedBtnDOM != null)
    {
        var value = this._currentFocusedBtnDOM.getAttribute("data-value");
        switch (value)
        {
            case "9":
                this._removeFocused();
                this._makeFocused(this._btns[10]);
                break;
            case "*":
            case "smallCancel":
                this._removeFocused();
                this._makeFocused(this._btns[0]);
                break;
            case "0":
                if (this.properties.ctrlStyle != "DialpadStyle03" || this._okEnabled)
                {
                    this._removeFocused();
                    this._makeFocused(this._btns[11]);
                }
                else
                {
                    // no action
                    returnValue = "ignored";
                }
                break;
            case "#":
                this._removeFocused();
                if (this._btnCall != null)
                {
                    this._makeFocused(this._btnCall);
                }
                else if (this._btnCloseDtmf != null)
                {
                    this._makeFocused(this._btnCloseDtmf);
                }
                break;
            case "smallOK":
                // no action
                returnValue = "ignored";
                break;
            case 'call':
                // no actoin
                returnValue = "ignored";
                break;
            case "clear":
                this._removeFocused();
                this._makeFocused(this._btns[1]);
                break;
            case "closeDtmf":
                // no action
                returnValue = "ignored";
                break;
            default:
                this._removeFocused();
                var index = parseInt(value) + 1;
                this._makeFocused(this._btns[index]);
                break;
        }
    }
    else
    {
        this._getFocused();
    }

    return returnValue;
};

DialPad2Ctrl.prototype._getPrevBtn = function ()
{
    var returnValue = "consumed";
    if (this._currentFocusedBtnDOM != null)
    {
        var value = this._currentFocusedBtnDOM.getAttribute("data-value");
        switch (value)
        {
            case "1":
                if (this._btnClear)
                {
                    this._removeFocused();
                    this._makeFocused(this._btnClear);
                }
                break;
            case "*":
            case "smallCancel":
                this._removeFocused();
                this._makeFocused(this._btns[9]);
                break;
            case "0":
                this._removeFocused();
                this._makeFocused(this._btns[10]);
                break;
            case "#":
            case "smallOK":
                this._removeFocused();
                this._makeFocused(this._btns[0]);
                break;
            case 'call':
                this._removeFocused();
                this._makeFocused(this._btns[11]);
                break;
            case 'ok':
                this._removeFocused();
                this._makeFocused(this._btns[11]);
                break;
            case "clear":
                // no action
                returnValue = "ignored";
                break;
            case "closeDtmf":
                this._removeFocused();
                this._makeFocused(this._btns[11]);
                break;
            default:
                this._removeFocused();
                var index = parseInt(value) - 1;
                this._makeFocused(this._btns[index]);
                break;
        }
    }
    else
    {
        this._getFocused();
    }
};

DialPad2Ctrl.prototype._focusLastBtn = function ()
{
    var prevBtn = this._prevFocusedBtnDOM;
    if (prevBtn != null)
    {
        this._removeFocused();
        this._makeFocused(prevBtn);
    }
    else if (this._focusRestore != true)
    {
        this._removeFocused();
        this._makeFocused(this._btns[1]);
    }
};

DialPad2Ctrl.prototype._multicontrollerSelect = function ()
{
    if (this._currentFocusedBtnDOM)
    {
        this._triggerButtonSelectCallback(this._currentFocusedBtnDOM, "Multicontroller");
    }
};

DialPad2Ctrl.prototype._triggerButtonSelectCallback = function (button, eventCause)
{
    if (!this._longPressBeep)
        {
            framework.common.beep('Short', eventCause);
        }
        else
        {
            this._longPressBeep = false;
        }

        var value = button.getAttribute("data-value");
        switch (value)
        {
            case "call":
                this._selectCallback("Call");
                break;
            case "ok":
                this._selectCallback("OK");
                break;
            case "closeDtmf":
                this._selectCallback("CloseDtmf");
                break;
            case "clear":
                this._clearHandler();
                break;
            default:
                if (this._currentFocusedBtnDOM != null && this._currentFocusedBtnDOM != undefined)
                {
                    this._btnSelectCallback({currentTarget: this._currentFocusedBtnDOM});
                }
                else
                {
                    this._btnSelectCallback({currentTarget: button});
                }
                break;
        }
};

/*
 * =========================
 * MULTICONTROLLER
 * =========================
 */
DialPad2Ctrl.prototype.handleControllerEvent = function(eventID)
{
    log.debug("DialPad2Ctrl: handleController() called, eventID: " + eventID);
    var returnValue = "consumed";
    clearTimeout(this._longPressTimeoutId);
    this._longPressTimeoutId = null;
    if (this._buttonOnFocus != null)
    {
        // stop any touch interaction
        this._removeActive(this._buttonOnFocus);
        this._buttonOnFocus.removeEventListener(this._MOUSEENTEREVENT, this._mouseEnter, false);
        this._buttonOnFocus.removeEventListener(this._MOUSELEAVEEVENT, this._mouseLeave, false);
        this._buttonOnFocus.removeEventListener(this._MOUSEUPEVENT, this._mouseUp, false);
        this._currentFocusedBtnDOM = this._buttonOnFocus;
        this._buttonOnFocus = null;
    }
    else
    {
        this._removeActive(this._currentFocusedBtnDOM);
    }

    if (this._atSpeed)
    {
        switch(eventID)
        {
            case "acceptFocusInit":
            case "acceptFocusFromLeft":
            case "acceptFocusFromRight":
            case "acceptFocusFromtTop":
            case "acceptFocusFromBottom":
                this._focusInitialized = true;
                if (this._focusRestore != true)
                {
                    if (this.properties.ctrlStyle == "DialpadStyle03")
                    {
                        this._makeFocused(this._btns[10]);
                        returnValue = "consumed";
                    }
                    else if (this.properties.ctrlStyle == "DialpadStyle01")
                    {
                        this._makeFocused(this._btnCloseDtmf);
                        returnValue = "consumed";
                    }
                    else
                    {
                        returnValue = "giveFocusLeft";
                    }
                }
                break;
            case "lostFocus":
                // Hide highlight
                this._removeFocused();
                break;
            case "selectStart":
                if (this._currentFocusedBtnDOM && this._currentFocusedBtnDOM.classList.contains("disabled") != true)
                {
                    this._removeFocused(true);
                    this._makeActive(this._currentFocusedBtnDOM);
                    this._longPressTimeoutId = setTimeout(this._longPressHandler.bind(this, this._currentFocusedBtnDOM, "Multicontroller"), this.properties.longPressTimeOut);
                }
                break;
            case "select":
                // Select (press down)
                if (this._currentFocusedBtnDOM && this._currentFocusedBtnDOM.classList.contains("disabled") != true)
                {
                    this._makeFocused(this._currentFocusedBtnDOM);
                    this._multicontrollerSelect();
                }
                break;
            case "down":
                if (this.properties.ctrlStyle == "DialpadStyle03")
                {
                    if (this._currentFocusedBtnDOM &&
                        this._currentFocusedBtnDOM.getAttribute("data-ref") != "btn0" &&
                        this._currentFocusedBtnDOM.getAttribute("data-ref") != "smallOK" &&
                        this._currentFocusedBtnDOM.getAttribute("data-ref") != "smallCancel")
                        {
                            this._removeFocused();
                            this._makeFocused(this._btns[10]);
                            returnValue = "consumed";
                        }
                        else
                        {
                            returnValue = "ignored";
                        }
                }
                else
                {
                    returnValue = "ignored";
                }
                break;
            case "right":
                // Tilt Up
                if (this.properties.ctrlStyle == "DialpadStyle01")
                {
                    this._removeFocused();
                    this._makeFocused(this._btnCloseDtmf);
                    returnValue = "consumed";
                }
                else
                {
                    returnValue = "ignored";
                }
                break;
            case "left":
                if (this.properties.ctrlStyle == "DialpadStyle02")
                {
                    this._removeFocused();
                    returnValue = "giveFocusLeft";
                }
                else if (this.properties.ctrlStyle == "DialpadStyle03")
                {
                    if (this._currentFocusedBtnDOM &&
                        (this._currentFocusedBtnDOM.getAttribute("data-ref") == "btn0" ||
                        this._currentFocusedBtnDOM.getAttribute("data-ref") == "smallOK"))
                        {
                            this._makeFocused(this._btns[10]);
                            returnValue = "consumed";
                        }
                        else
                        {
                            returnValue = "ignored";
                        }
                }
                else
                {
                    returnValue = "ignored";
                }
                break;
            case "cw":
                // Rotate Right (CW)
                if (this.properties.ctrlStyle == "DialpadStyle03")
                {
                    if (this._currentFocusedBtnDOM &&
                        this._currentFocusedBtnDOM.getAttribute("data-ref") != "smallCancel" &&
                        this._currentFocusedBtnDOM.getAttribute("data-ref") != "smallOK" &&
                        this._currentFocusedBtnDOM.getAttribute("data-ref") != "btn0")
                        {
                            this._makeFocused(this._btns[10]);
                            returnValue = "consumed";
                        }
                        else
                        {
                            returnValue = "ignored";
                        }
                }
                else if (this.properties.ctrlStyle == "DialpadStyle01")
                {
                    this._makeFocused(this._btnCloseDtmf);
                    returnValue = "consumed";
                }
                else
                {
                    returnValue = "ignored";
                }
                break;
            case "ccw":
                // Rotate Left (CCW)
                if (this.properties.ctrlStyle == "DialpadStyle01")
                {
                    returnValue = "ignored";
                }
                else if (this.properties.ctrlStyle == "DialpadStyle03")
                {
                    if (this._currentFocusedBtnDOM &&
                        (this._currentFocusedBtnDOM.getAttribute("data-ref") == "btn0" ||
                        this._currentFocusedBtnDOM.getAttribute("data-ref") == "smallOK"))
                        {
                            this._makeFocused(this._btns[10]);
                            returnValue = "consumed";
                        }
                        else
                        {
                            returnValue = "ignored";
                        }
                }
                else
                {
                    returnValue = "giveFocusLeft";
                }
                break;
            default:
                returnValue = "ignored";
        }
    }
    else if (this._maxDigitsExceeded)
    {
        switch(eventID)
        {
            case "acceptFocusInit":
            case "acceptFocusFromLeft":
            case "acceptFocusFromRight":
            case "acceptFocusFromtTop":
            case "acceptFocusFromBottom":
                this._focusInitialized = true;
                // if (this.properties.ctrlStyle == "DialpadStyle02" && this._prevFocusedBtnDOM && this._prevFocusedBtnDOM.getAttribute("data-ref") == "clear")
                // {
                    // this._makeFocused(this._btnClear);
                    // returnValue = "consumed";
                // }
                // else
                if (this._focusRestore != true)
                {
                    if (this.properties.ctrlStyle == "DialpadStyle02")
                    {
                        this._makeFocused(this._btnCall);
                        returnValue = "consumed";
                    }
                    else
                    {
                        returnValue = "ignored";
                    }
                }
                break;
            case "lostFocus":
                // Hide highlight
                this._removeFocused();
                break;
            case "up":
                // Tilt Up
                if (this.properties.ctrlStyle == "DialpadStyle02" && this._currentFocusedBtnDOM && this._currentFocusedBtnDOM.getAttribute("data-ref") == "call")
                {
                    this._makeFocused(this._btnClear);
                    returnValue = "consumed";
                }
                else
                {
                    returnValue = "ignored";
                }
                break;
            case "down":
                if (this.properties.ctrlStyle == "DialpadStyle02" && this._currentFocusedBtnDOM && this._currentFocusedBtnDOM.getAttribute("data-ref") == "clear")
                {
                    this._makeFocused(this._btnCall);
                    returnValue = "consumed";
                }
                else
                {
                    returnValue = "ignored";
                }
                break;
            case "right":
                // Tilt Up
                if (this.properties.ctrlStyle == "DialpadStyle02" && this._currentFocusedBtnDOM && this._currentFocusedBtnDOM.getAttribute("data-ref") != "clear")
                {
                    this._makeFocused(this._btnCall);
                    returnValue = "consumed";
                }
                else
                {
                    returnValue = "ignored";
                }
                break;
            case "left":
                if (this._currentFocusedBtnDOM && this._currentFocusedBtnDOM.getAttribute("data-ref") != "clear")
                {
                    this._removeFocused();
                    returnValue = "giveFocusLeft";
                }
                // else if (this._currentFocusedBtnDOM.getAttribute("data-ref") == "clear")
                // {
                    // this._removeFocused();
                    // returnValue = "giveFocusLeft";
                // }
                else
                {
                    returnValue = "ignored";
                }
                break;
            case "cw":
                // Rotate Right (CW)
                if (this.properties.ctrlStyle == "DialpadStyle02" && this._currentFocusedBtnDOM && this._currentFocusedBtnDOM.getAttribute("data-ref") != "call")
                {
                    this._makeFocused(this._btnCall);
                    returnValue = "consumed";
                }
                else
                {
                    returnValue = "ignored";
                }
                break;
            case "ccw":
                if (this._currentFocusedBtnDOM && this._currentFocusedBtnDOM.getAttribute("data-ref") != "clear")
                {
                    // Rotate Left (CCW)
                    this._makeFocused(this._btnClear);
                    returnValue = "consumed";
                }
                else
                {
                    returnValue = "ignored";
                }
                break;
            case "selectStart":
                if (this._currentFocusedBtnDOM && this._currentFocusedBtnDOM.classList.contains("disabled") != true)
                {
                    this._removeFocused(true);
                    this._makeActive(this._currentFocusedBtnDOM);
                    this._longPressTimeoutId = setTimeout(this._longPressHandler.bind(this, this._currentFocusedBtnDOM, "Multicontroller"), this.properties.longPressTimeOut);
                }
                break;
            case "select":
                // Select (press down)
                if (this._currentFocusedBtnDOM && this._currentFocusedBtnDOM.classList.contains("disabled") != true)
                {
                    this._makeFocused(this._currentFocusedBtnDOM);
                    this._multicontrollerSelect();
                }
                break;
            default:
                returnValue = "ignored";
        }
    }
    else
    {
        switch(eventID)
        {
            case "acceptFocusInit":
            case "acceptFocusFromLeft":
            case "acceptFocusFromRight":
            case "acceptFocusFromtTop":
            case "acceptFocusFromBottom":
                this._focusInitialized = true;
                this._focusLastBtn();
                break;
            case "lostFocus":
                // Hide highlight
                this._removeFocused();
                break;
            case "touchActive":
                // input mode change to touch
                returnValue = "ignored";
                break;
            case "controllerActive":
                // input mode change to multicontroller:
                this._focusLastBtn();
                break;
            case "cw":
                // Rotate Right (CW)
                returnValue = this._getNextBtn();
                break;
            case "ccw":
                // Rotate Left (CCW)
                returnValue = this._getPrevBtn();
                break;
            case "selectHold":
                // Select Hold
                returnValue = "ignored";
                break;
            case "selectStart":
                if (this._currentFocusedBtnDOM && this._currentFocusedBtnDOM.classList.contains("disabled") != true)
                {
                    this._removeFocused(true);
                    this._makeActive(this._currentFocusedBtnDOM);
                    this._longPressTimeoutId = setTimeout(this._longPressHandler.bind(this, this._currentFocusedBtnDOM, "Multicontroller"), this.properties.longPressTimeOut);
                }
                break;
            case "select":
                // Select (press down)
                if (this._currentFocusedBtnDOM && this._currentFocusedBtnDOM.classList.contains("disabled") != true)
                {
                    this._makeFocused(this._currentFocusedBtnDOM);
                    this._multicontrollerSelect();
                }
                break;
            case "leftHold":
                // Tilt Left Hold
                returnValue = "ignored";
                break;
            case "left":
                // Tilt Left
                returnValue = this._getLeftBtn();
                break;
            case "rightHold":
                // Tilt Right
                returnValue = "ignored";
                break;
            case "right":
                // Tilt Right
                returnValue = this._getRightBtn();
            case "upHold":
                // Tilt Up Hold
                returnValue = "ignored";
                break;
            case "up":
                // Tilt Up
                returnValue = this._getUpBtn();
                break;
            case "downHold":
                // Tilt Down
                returnValue = "ignored";
                break;
            case "down":
                // Tilt Down
                returnValue = this._getDownBtn();
            default:
                // No action
                returnValue = "ignored";
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
    return returnValue;
};

/*
 * =========================
 * GARBAGE COLLECTION
 * =========================
 */
DialPad2Ctrl.prototype._cleanCallBtn = function ()
{
    if (this._btnCall != null)
    {
        this._btnCall.removeEventListener(this._MOUSEDOWNEVENT, this._mouseDown, false);
    }
};

DialPad2Ctrl.prototype._cleanClearBtn = function ()
{
    if (this._btnClear != null)
    {
        this._btnClear.removeEventListener(this._MOUSEDOWNEVENT, this._mouseDown, false);
    }
};

DialPad2Ctrl.prototype._cleanLeftBtn = function ()
{
    if (this._leftBtn != null)
    {
        this._leftBtn.removeEventListener(this._MOUSEDOWNEVENT, this._mouseDown, false);
    }
};

DialPad2Ctrl.prototype._cleanCloseDtmfBtn = function ()
{
    if (this._btnCloseDtmf != null)
    {
        this._btnCloseDtmf.removeEventListener(this._MOUSEDOWNEVENT, this._mouseDown, false);
    }
};

DialPad2Ctrl.prototype.cleanUp = function()
{
    // remove event listeners

    this._cleanCallBtn();

    this._cleanClearBtn();

    this._cleanLeftBtn();

    this._cleanCloseDtmfBtn();

    // Clean the keypad buttons
    for (var i = 0; i < this._btns.length; i++)
    {
        this._btns[i].removeEventListener(this._MOUSEDOWNEVENT, this._mouseDown, false);
    }

    if (this._buttonOnFocus != null)
    {
        this._buttonOnFocus.removeEventListener(this._MOUSEUPEVENT, this._mouseUp, false);
        this._buttonOnFocus.removeEventListener(this._MOUSEENTEREVENT, this._mouseEnter, false);
        this._buttonOnFocus.removeEventListener(this._MOUSELEAVEEVENT, this._mouseLeave, false);
    }

    document.removeEventListener(this._MOUSEUPEVENT, this._mouseDocumentUp, false);

    // remove properties
    this.properties.length = 0;

    clearTimeout(this._longPressTimeoutId);
    clearTimeout(this._digitTransformTimeout);
    this._longPressTimeoutId = null;
    this._digitTransformTimeout = null;
};

// Register Loaded with Framework
framework.registerCtrlLoaded('DialPad2Ctrl');
