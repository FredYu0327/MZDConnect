/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: akulshk
 Date: 12.18.2012
 __________________________________________________________________________

 Description: IHU GUI Wink Control
 Revisions:
 v0.1 (18-Dec-2012) Created Wink Control
 __________________________________________________________________________

 */

log.addSrcFile("WinkCtrl.js", "common");

/*
 * =========================
 * Constructor
 * =========================
 * Wink Control is a popup that will be displayed when MMUI sends msgType "wink".
 * Winks are handled by System App.
 * A Wink does not cause a context change.
 */
function WinkCtrl(uiaId, parentDiv, controlId, properties)
{

    /*This is the constructor of the WinkCtrl Component
     Create, set dimensions and assign default name*/
    
    log.debug("browser version " + window.opera.version());
    
    if (window.opera)
    {
        if (window.opera.version() >= 12.10)
        {
            this._VENDOR = "";
        }
        else
        {
            this._VENDOR = "o";
        }
    }
    else
    {
        log.fatal("GUI can only run in the Opera Browser. Please re-open the GUI using Opera 12+");
    }

    this.controlId = controlId;
    this.divElt = null;
    this.uiaId = uiaId;
    
    
    // Styles for the Wink
    this.styles = {
        "style01":{"text1":"WinkStyle1Text1", "text2":"WinkStyle1Text2", "text3":null},
        "style02":{"text1":"WinkStyle2Text1", "text2":"WinkStyle2Text2", "text3":"WinkStyle2Text3"},
        "style03":{"text1":"WinkStyle3Text1", "text2":null, "text3":null},
        "style04":{"text1":"WinkStyle4Text1", "text2":"WinkStyle4Text2", "text3":null},
        "style05":{"text1":null, "text2":null, "text3":null}
    };
    
    //@formatter:off
    this.properties = {
        "alertId"           : null,     // (String) Unique identifier String sent from MMUI that should be stored in the Wink
        "style"             : null,     // (String) Identifies the style of the wink
        "text1"             : null,     // (String) literal for text1 type
        "text1Id"           : null,     // (String) id for the text1(will trigger localization)
        "text1SubMap"       : null,     // (Object) optional submap for localization for text1
        "text2"             : null,     // (String) literal for text2 type
        "text2Id"           : null,     // (String) id for the text2(will trigger localization)
        "text2SubMap"       : null,     // (Object) optional submap for localization for text2
        "text3"             : null,     // (String) literal for text3 type
        "text3Id"           : null,     // (String) id for the text3(will trigger localization)
        "text3SubMap"       : null,     // (Object) optional submap for localization for text3
        "winkTimeout"       : 3000,     // (Number) Time in which wink times out(fades for 1 sec as timeout happens)
        "completeCallback"  : null,     // Callback to app which resets cached variables and cleanup DOM
        "appData"           : null,     // (Object) any data the app needs assigned to wink
        "image1"            : null,     // (String) Image path
    };
    //@formatter:on
    
    for (var i in properties)
    {
        this.properties[i] = properties[i];
    }

    if (!this.properties.style)
    {
        log.error("Wink property 'style' cannot be null. Style was not set for Wink with alertId: " + this.properties.alertId);
        return;
    }

	this._createStructure();
	parentDiv.appendChild(this.divElt);
	
}

/* 
 * Control init
 * @return void
 */
WinkCtrl.prototype._init = function()
{
    this._setWinkConfig(this.properties);
    if (this.properties.winkTimeout)
    {
        this._timeoutId = setTimeout(this._fadeout.bind(this), this.properties.winkTimeout);
    }
}

/* 
 * Create control's DOM structure
 * @return void
 */
WinkCtrl.prototype._createStructure = function()
{
    // Creating WinkCtrl Window
    this.divElt = document.createElement('div');
    this.divElt.id = this.controlId;

    this.divElt.className = 'WinkCtrl';
    
    // The Internal Wink Box
    this.divInternalWink = document.createElement('div');
    this.divElt.appendChild(this.divInternalWink);
    
    this.divInternalWink.className = 'WinkCtrlBox';
   
    // create div for text1
    this.text1 = document.createElement('div');
        this.divInternalWink.appendChild(this.text1);
        
    /* Creating additional div to support overflow property in multi-line text for Style03*/
    if(this.properties.style === "style03")
    {
        this.innerDivStyle03 = document.createElement('div');
        this.text1.appendChild(this.innerDivStyle03);
    }
    
    // create div for text2
    this.text2 = document.createElement('div');
        this.divInternalWink.appendChild(this.text2);
    
    if(this.properties.style === "style04")
    {
        this.innerDivStyle04 = document.createElement('div');
        this.text2.appendChild(this.innerDivStyle04);
    }
    
    if(this.properties.style === "style05")
    {
        this.winkImage1 = document.createElement('div');
        this.divInternalWink.appendChild(this.winkImage1);
        this.divElt.className = "WinkCtrlStyle05";
    }
    
    // create div for text3
    this.text3 = document.createElement('div');
        this.divInternalWink.appendChild(this.text3);

    this._init();
}

WinkCtrl.prototype.winkFadeCallback = function()
{
    log.debug("WinkCtrl winkFadeCallback called");
    
    this.divElt.removeEventListener(this._VENDOR + 'AnimationEnd', this._winkFadeCallbackRef);
    this.divElt.classList.remove('WinkFadeOut');
    
    this._onCompleteHandler();
}

WinkCtrl.prototype._fadeout = function(config)
{
    log.debug("winkFadeout called");

    this._winkFadeCallbackRef = this.winkFadeCallback.bind(this);

    this.divElt.addEventListener(this._VENDOR + 'AnimationEnd', this._winkFadeCallbackRef);

    this.divElt.classList.add('WinkFadeOut');       // Adding class for fadeout effect
}

/* 
 * Set control configuration
 * @param config (Object) - control configuration
 * @return void
 */

WinkCtrl.prototype._setWinkConfig = function(config)        //config = this.properties
{
    //	Set wink element styles, depends on which style has been selected 
    if (this.styles[config.style].text1)
    {
        this.text1.className = this.styles[config.style].text1;     //className
        /* Setting class to additional div created for style03*/
        if(config.style === 'style03')
        {
            this.innerDivStyle03.className = "WinkStyle3InnerDivText1";
        }
    }
    else if (!(this.styles[config.style].text1) && config.text1Id || config.text1)       // Check if style does not support text
    {
        log.warn("The given Wink style does not support the use of text1");
    }
    
    if (this.styles[config.style].text2)
    {
        this.text2.className = this.styles[config.style].text2;     //className
        
        if(config.style === 'style04')
        {
            this.innerDivStyle04.className = "WinkStyle4InnerDivText2";
        }        
    }
    else if (!(this.styles[config.style].text2) && config.text2Id || config.text2)       // Check if style does not support text
    {
        log.warn("The given Wink style does not support the use of text2");
    }
    
    if (this.styles[config.style].text3)
    {
        this.text3.className = this.styles[config.style].text3;     //className
    }
    else if (!(this.styles[config.style].text3) && config.text3Id || config.text3)       // Check if style does not support text
    {
        log.warn("The given Wink style does not support the use of text3");
    }
    
    if(config.style === 'style05')
    {
        this.winkImage1.className = "WinkStyle5Image1";
        this.winkImage1.style.backgroundImage = "url(" + this.properties.image1 + ")";
    }

    /*
     * text1
     */
    
    if (config.text1Id && this.styles[config.style].text1)	// Dont set If style text is null
    {
        this.properties.text1 = framework.localize.getLocStr(this.uiaId, config.text1Id, config.text1SubMap);
        this.setText1(this.properties.text1);
    }
    else if (config.text1 && this.styles[config.style].text1)   // Dont set If style text is null
    {
        this.setText1(config.text1);
    }
    
    /*
     * text2
     */
    
    if (config.text2Id && this.styles[config.style].text2)  // Dont set If style text is null
    {
        this.properties.text2 = framework.localize.getLocStr(this.uiaId, config.text2Id, config.text2SubMap);
        this.setText2(this.properties.text2);
    }
    else if (config.text2 && this.styles[config.style].text2)   // Dont set If style text is null
    {
        this.setText2(config.text2);
    }
    
    /*
     * text3
     */
    
    if (config.text3Id && this.styles[config.style].text3)  // Dont set If style text is null
    {
        this.properties.text3 = framework.localize.getLocStr(this.uiaId, config.text3Id, config.text3SubMap);
        this.setText3(this.properties.text3);
    }
    else if (config.text3 && this.styles[config.style].text3)   // Dont set If style text is null
    {
        this.setText3(config.text3);
    }    
}

/* 
 * Set Text 1
 * @param text (String) - textual content of the button label
 * @return void
 */
WinkCtrl.prototype.setText1 = function(text)
{
    if(this.properties.style === "style03")
    {
        this.innerDivStyle03.innerText = text;
    }
    else
    {
        this.text1.innerText = text;
    }
}

/* 
 * Set Text 1
 * @param text (String) - textual content of the button label
 * @return void
 */

WinkCtrl.prototype.setText2 = function(text)
{
    if(this.properties.style === "style04")
    {
        this.innerDivStyle04.innerText = text;
    }
    else
    {
        this.text2.innerText = text;
    }
}

/* 
 * Set Text 1
 * @param text (String) - textual content of the button label
 * @return void
 */

WinkCtrl.prototype.setText3 = function(text)
{
    this.text3.innerText = text;
}

/*
 * Assigns the complete callback function
 * @param   callback    Function
 */
WinkCtrl.prototype.setCallback = function(callback)
{
    log.debug("WinkCtrl.prototype.setCallback  called");

    if (callback != null)
    {
        this.properties.completeCallback = callback;
    }
}

/*
 * Called after the wink times out
 */
WinkCtrl.prototype._onCompleteHandler = function()
{
    log.debug("WinkCtrl.prototype._onCompleteHandler  called");
    
    if (this.properties.completeCallback != null)
    {
        this.properties.completeCallback(this, this.properties.appData, null);
    }
}

/* (internal - standard API)
 * Called by framework when control is destroyed. Remove event listeners and any other nulling should be done here.
 */
WinkCtrl.prototype.cleanUp = function()
{
    clearTimeout(this._timeoutId);
    // clear the timeout in case the user dismisses the wink early.
    delete this.properties;
}

// Tell framework this control has finished loading
framework.registerCtrlLoaded("WinkCtrl");
