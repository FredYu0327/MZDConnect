/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: InCall2Ctrl.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: aupparv
 Date: 04.02.2013
 __________________________________________________________________________

 Description: IHU GUI InCall2Ctrl

 Revisions:
 v0.1 (02-April-2013) Created InCall2Ctrl
 */

log.addSrcFile("InCall2Ctrl.js", "common");

function InCall2Ctrl(uiaId, parentDiv, controlId, properties)
{    
    this.uiaId = uiaId;             // (String) UIA ID of the App instantiating this control
    this.parentDiv = parentDiv;     // (HTMLElement) Reference to the parent div of this control
    this.controlId = controlId;     // (String) ID of this control as assigned by GUIFramework
    this.divElt = null;             // (HTMLElement) Reference to the top level div element of this control
    
    this.umpCtrl = null;

    this._contact1ElapsedTimeSecs = null;  // (Number) Elapsed Time in seconds. Defaults to null so that no time is displayed until App sets it
    this._contact2ElapsedTimeSecs = null;  // (Number) Elapsed Time in seconds. Defaults to null so that no time is displayed until App sets it
    this._mobile911ElapsedTimeSecs = null; // (Number) Elapsed Time in seconds. Defaults to null so that no time is displayed until App sets it

    this._styles = {
        "OneCall":{"contact1ImageFrame":"InCall2ContactImageFrame",
                   "contact1Name":"InCall2ContactName",
                   "contact1PhoneNumber":"InCall2ContactPhoneNumber",
                   "contact1ElapsedTime":"InCall2ContactElapsedTime",

                   "contact2ImageFrame":null,
                   "contact2Name":null,
                   "contact2PhoneNumber":null,
                   "contact2PhoneType":null,
                   "contact2ElapsedTime":null,

                   "mobile911IconFrame":null,
                   "mobile911ImageFrame":null,
                   "mobile911ServiceName":null,
                   "mobile911MessageText":null,
                   "mobile911ElapsedTime":null},

        "TwoCall":{"contact1ImageFrame":"InCall2ContactImageFrame",
                   "contact1Name":"InCall2ContactName",
                   "contact1PhoneNumber":"InCall2ContactPhoneNumber",
                   "contact1ElapsedTime":"InCall2ContactElapsedTime",

                   "contact2ImageFrame":"InCall2ContactImageFrame",
                   "contact2Name":"InCall2ContactName",
                   "contact2PhoneNumber":"InCall2ContactPhoneNumber",
                   "contact2ElapsedTime":"InCall2ContactElapsedTime",

                   "mobile911IconFrame":null,
                   "mobile911ImageFrame":null,
                   "mobile911ServiceName":null,
                   "mobile911MessageText":null,
                   "mobile911ElapsedTime":null},

        "Mobile911":{"contact1ImageFrame":null,
                   "contact1Name":null,
                   "contact1PhoneNumber":null,
                   "contact1PhoneType":null,
                   "contact1ElapsedTime":null,

                   "contact2ImageFrame":null,
                   "contact2Name":null,
                   "contact2PhoneNumber":null,
                   "contact2PhoneType":null,
                   "contact2ElapsedTime":null,
                   
                   "mobile911IconFrame":"InCall2Mobile911IconFrame",
                   "mobile911ImageFrame":"InCall2Mobile911ImageFrame",
                   "mobile911ServiceName":"InCall2Mobile911ServiceName",
                   "mobile911MessageText":"InCall2Mobile911MessageText",
                   "mobile911ElapsedTime":"InCall2Mobile911ElapsedTime"},
    }
    
    //@formatter:off
    this.properties = {
        "umpConfig" : null,
        "ctrlStyle" : null,
        "ctrlTitle" : null,
        "ctrlTitleId" : null,
        "subMap" : null,
        "contact1Details" : null,
        "contact2Details" : null,
        "mobile911Details" : null
    };
    //@formatter:on

    for(var i in properties)
    {
        this.properties[i] = properties[i];
    }
    
    this._createStructure(); 
}

InCall2Ctrl.prototype._init = function()
{
    this.setInCallConfig(this.properties);
}

InCall2Ctrl.prototype._createStructure = function()
{
    // create the div for control
    this.divElt = document.createElement('div');
        this.divElt.className = "InCall2Ctrl";
        this.divElt.id = this.controlId;
    
    // create div for group title
    this._ctrlTitle = document.createElement('div');
    this._ctrlTitle.className = "InCall2CtrlTitle";
        this.divElt.appendChild(this._ctrlTitle);
    
    //Create Structure for the OneCall or TwoCall or Mobile911 Configurations
    this._createContactStructure();
        
    // attach control to parent    
    this.parentDiv.appendChild(this.divElt);

    log.debug("Instantiating umpCtrl...");
    this.umpCtrl = framework.instantiateControl(this.uiaId, this.divElt, "Ump3Ctrl", this.properties.umpConfig);
    this._init();
}

InCall2Ctrl.prototype._createContactStructure = function()
{
    // create image for first contact's picture (so we can center/scale it)
    if ((this.properties.ctrlStyle === "OneCall") || (this.properties.ctrlStyle === "TwoCall")|| (this.properties.ctrlStyle === "Mobile911"))
    {
        if ((this.properties.ctrlStyle === "OneCall") || (this.properties.ctrlStyle === "TwoCall"))
        {
             this._contact1Info = document.createElement('div');
                 this._contact1Info.className = "InCall2Contact1";
                 this.divElt.appendChild(this._contact1Info);

             this._contact1LineSeperator = document.createElement("span");
                    this._contact1LineSeperator.className = "InCall2CtrlTitleContactRuleLine";
                    this._contact1Info.appendChild(this._contact1LineSeperator);
            
             // create div for first active call indicator
             this._inCallPhoneIconContact1 = document.createElement('div');
                 this._inCallPhoneIconContact1.className = "InCall2CallContactIcon";
                 this._contact1Info.appendChild(this._inCallPhoneIconContact1);

             // create div for first contact's picture
             this._contact1ImageFrame = document.createElement('div');
                 this._contact1ImageFrame.className = this._styles[this.properties.ctrlStyle].contact1ImageFrame;
                 this._contact1Info.appendChild(this._contact1ImageFrame);
            
             this._contact1Image = document.createElement('img');
                 this._contact1ImageFrame.appendChild(this._contact1Image);
    
             // create span for first contact's name
             this._contact1Name = document.createElement("span"); 
                 this._contact1Name.className = this._styles[this.properties.ctrlStyle].contact1Name;
                 this._contact1Info.appendChild(this._contact1Name);
    
             // create span for first contact's phone number
             this._contact1PhoneNumber = document.createElement("span"); 
                 this._contact1PhoneNumber.className = this._styles[this.properties.ctrlStyle].contact1PhoneNumber;
                 this._contact1Info.appendChild(this._contact1PhoneNumber);
    
             // create span for first contact's elapsed time counter
             this._contact1ElapsedTime = document.createElement("span"); 
                 this._contact1ElapsedTime.className = this._styles[this.properties.ctrlStyle].contact1ElapsedTime;
                 this._contact1Info.appendChild(this._contact1ElapsedTime);
                 
             
             this.divElt.classList.add("InCall2InCallBG");
        }
    

    // create image for second contact's picture (so we can center/scale it)
        if (this.properties.ctrlStyle === "TwoCall")
        {
            this._contact2Info = document.createElement('div');
             this._contact2Info.className = "InCall2Contact2";
             this.divElt.appendChild(this._contact2Info);
        
             // create div for first active call indicator
             this._inCallPhoneIconContact2 = document.createElement('div');
                 this._inCallPhoneIconContact2.className = "InCall2CallContactIcon";
                 this._contact2Info.appendChild(this._inCallPhoneIconContact2);
            
             // create div for second contact's picture
             this._contact2ImageFrame = document.createElement('div');
                 this._contact2ImageFrame.className = this._styles[this.properties.ctrlStyle].contact2ImageFrame;
                 this._contact2Info.appendChild(this._contact2ImageFrame);

             this._contact2Image = document.createElement('img');
             this._contact2ImageFrame.appendChild(this._contact2Image);
    
             // create span for second contact's name
             this._contact2Name = document.createElement("span"); 
                 this._contact2Name.className = this._styles[this.properties.ctrlStyle].contact2Name;
                 this._contact2Info.appendChild(this._contact2Name);
    
             // create span for second contact's phone number
             this._contact2PhoneNumber = document.createElement("span");
                 this._contact2PhoneNumber.className = this._styles[this.properties.ctrlStyle].contact2PhoneNumber; 
                 this._contact2Info.appendChild(this._contact2PhoneNumber);
    
             // create span for second contact's elapsed time counter
             this._contact2ElapsedTime = document.createElement("span"); 
                 this._contact2ElapsedTime.className = this._styles[this.properties.ctrlStyle].contact2ElapsedTime;
                 this._contact2Info.appendChild(this._contact2ElapsedTime);
        
             this._contact2LineSeperator = document.createElement("span");
                 this._contact2LineSeperator.className = "InCall2CtrlTitleContactRuleLine";
                 this._contact2Info.appendChild(this._contact2LineSeperator);
         }

         // create image for mobile911 service's picture (so we can center/scale it)
         if (this.properties.ctrlStyle === "Mobile911")
         {
             this._mobile911Info = document.createElement('div');
                  this._mobile911Info.className = "InCall2Contact1";
                  this.divElt.appendChild(this._mobile911Info);
                  
        	// create div for mobile911 service's phone icon
         	  this._mobile911IconFrame = document.createElement('div');
                  this._mobile911IconFrame.className = this._styles[this.properties.ctrlStyle].mobile911IconFrame;
                  this._mobile911Info.appendChild(this._mobile911IconFrame);            
    
             // create div for mobile911 service's image
             this._mobile911ImageFrame = document.createElement('div');
                 this._mobile911ImageFrame.className = this._styles[this.properties.ctrlStyle].mobile911ImageFrame;
                 this._mobile911Info.appendChild(this._mobile911ImageFrame);
    
        this._mobile911Image = document.createElement('img');
            this._mobile911ImageFrame.appendChild(this._mobile911Image);
    
             // create span for mobile 911 service's name
             this._mobile911ServiceName = document.createElement("span"); 
                 this._mobile911ServiceName.className = this._styles[this.properties.ctrlStyle].mobile911ServiceName;
                 this._mobile911Info.appendChild(this._mobile911ServiceName);
    
             // create span for mobile 911 message text
             this._mobile911MessageText = document.createElement("span"); 
                 this._mobile911MessageText.className = this._styles[this.properties.ctrlStyle].mobile911MessageText;
                 this._mobile911Info.appendChild(this._mobile911MessageText);
    
             // create span for mobile911's elapsed time counter
             this._mobile911ElapsedTime = document.createElement("span");
                 this._mobile911ElapsedTime.className = this._styles[this.properties.ctrlStyle].mobile911ElapsedTime; 
                 this._mobile911Info.appendChild(this._mobile911ElapsedTime);
                 
             this.divElt.classList.add("InCall2Mob911BG");
         }
    }
    else
    {
        //Log warning indicating the properties is updated with invalid control style details
        log.warn("InCall2Ctrl: createContactStructure() called with an invalid ctrlStyle.");
    }
}

InCall2Ctrl.prototype._setActiveContact = function(contact, active)
{
    if (contact == 'contact1')
    {
        if (active == 'Active')
        {
            this._contact1Info.classList.add("InCall2ContactActiveBkg");
            this._contact1LineSeperator.classList.add("InCall2CtrlTitleContactRuleLine");
            this._inCallPhoneIconContact1.classList.remove("InCall2InactivePhone");
            this._contact1Name.classList.remove("InCall2InactiveFontColor");
            this._contact1PhoneNumber.classList.remove("InCall2InactiveFontColor");
            this._contact1ElapsedTime.classList.remove("InCall2InactiveFontColor");
            
            this._inCallPhoneIconContact1.classList.add("InCall2ActivePhone");
            this._contact1Name.classList.add("InCall2ActiveFontColor");
            this._contact1PhoneNumber.classList.add("InCall2ActiveFontColor");
            this._contact1ElapsedTime.classList.add("InCall2ActiveFontColor");
        }
        else
        {
            this._contact1Info.classList.remove("InCall2ContactActiveBkg");
            if(this.properties.ctrlStyle === "OneCall")
            {
            	this._contact1LineSeperator.classList.remove("InCall2CtrlTitleContactRuleLine");
            }            
            this._inCallPhoneIconContact1.classList.add("InCall2InactivePhone");
            this._contact1Name.classList.add("InCall2InactiveFontColor");
            this._contact1PhoneNumber.classList.add("InCall2InactiveFontColor");
            this._contact1ElapsedTime.classList.add("InCall2InactiveFontColor");
        }
    }
    else
    {
        if (active == 'Active')
        {
            this._inCallPhoneIconContact2.classList.remove("InCall2InactivePhone");
            this._contact2Name.classList.remove("InCall2InactiveFontColor");
            this._contact2PhoneNumber.classList.remove("InCall2InactiveFontColor");
            this._contact2ElapsedTime.classList.remove("InCall2InactiveFontColor");
            
            this._contact2Info.classList.add("InCall2ContactActiveBkg");
            this._inCallPhoneIconContact2.classList.add("InCall2ActivePhone");
            this._contact2Name.classList.add("InCall2ActiveFontColor");
            this._contact2PhoneNumber.classList.add("InCall2ActiveFontColor");
            this._contact2ElapsedTime.classList.add("InCall2ActiveFontColor");
        }
        else
        {
            this._contact2Info.classList.remove("InCall2ContactActiveBkg");
            this._inCallPhoneIconContact2.classList.add("InCall2InactivePhone");
            this._contact2Name.classList.add("InCall2InactiveFontColor");
            this._contact2PhoneNumber.classList.add("InCall2InactiveFontColor");
            this._contact2ElapsedTime.classList.add("InCall2InactiveFontColor");
        }
    }
}

InCall2Ctrl.prototype.setInCallConfig = function(config)
{
    log.debug("InCall2Ctrl: setInCallConfig_org() called...");

    if (config != null)
    {
        if ((config.ctrlStyle != null) && (config.ctrlStyle != this.properties.ctrlStyle))
        {
            // Control has been passed a different style than instantiated with
            log.warn("InCall2Ctrl: setIncallConfig() called with different ctrlStyle than it was instantiated with.");
        }
        else
        {        
            // Control Title (localize if necessary)
            if (config.ctrlTitleId)
            {
                this.properties.ctrlTitle = framework.localize.getLocStr(this.uiaId, config.ctrlTitleId, config.subMap);
                this._ctrlTitle.innerText = this.properties.ctrlTitle;
            }
            else if (config.ctrlTitle)
            {
                this._ctrlTitle.innerText = config.ctrlTitle;
            }
            else
            {
                this._ctrlTitle.innerText = "";
            }
            
            
            if ((this.properties.ctrlStyle === "OneCall") || (this.properties.ctrlStyle === "TwoCall"))
            {
                if(config.contact1Details != null)
                {
                    this.setContact1Config(config.contact1Details);
                }
            }
            
            if (this.properties.ctrlStyle === "TwoCall")
            {
                if(config.contact2Details != null)
                {
                    this.setContact2Config(config.contact2Details);
                }
            }
            
            if (this.properties.ctrlStyle === "Mobile911")
            {
                if(config.mobile911Details != null)
                {
                    this.setMobile911Config(config.mobile911Details);
                }
            }
        }
    }
    else
    {
        log.warn("InCall2Ctrl: setInCallConfig() called with null config value.");
    }
}

InCall2Ctrl.prototype.setContact1Config = function(contact1Details)
{
    log.debug("InCall2Ctrl: setContact1Config() called...");
    
    if (contact1Details != null)
    {
        if ((this.properties.ctrlStyle === "OneCall") || (this.properties.ctrlStyle === "TwoCall"))
        {
            // Update the first contact's image path (or configure placeholder)
            if (contact1Details.imagePath)
            {
                this._contact1Image.src = contact1Details.imagePath;
            }
            else
            {
                // May be inactive. Use conditional placeholder
                this._contact1Image.src = "common/images/icons/IcnContactImagePlaceholder_" +
                                         (contact1Details.isActive ? "Active" : "Inactive") +
                                         ".png";
            }
    
            // Update the first contact's name field
            if (contact1Details.contactName)
            {
                this._contact1Name.innerText = contact1Details.contactName;
            }
            else
            {
                this._contact1Name.innerText = "";
            }
    
            // Update the first contact's phone number
            if (contact1Details.phoneTypeId && (contact1Details.phoneTypeId != ""))
            {
                this._contact1PhoneNumber.innerText = framework.localize.getLocStr(this.uiaId, contact1Details.phoneTypeId, contact1Details.subMap);
            }
            else if (contact1Details.phoneType)
            {
                this._contact1PhoneNumber.innerText = contact1Details.phoneType;
            }
            else if (contact1Details.phoneNumber)
            {
                this._contact1PhoneNumber.innerText = contact1Details.phoneNumber;
            }
            else
            {
            	this._contact1PhoneNumber.innerText = "";
            }
            
            if (this.properties.ctrlStyle === "TwoCall")
            {
                // Set mask styling in TwoCall controls for active/inactive contacts
                this._setActiveContact('contact1', (contact1Details.isActive ? "Active" : "Inactive"));
            }
            else
            {
                if (this.properties.ctrlStyle === "OneCall")
                {
                    this._setActiveContact('contact1', (contact1Details.isActive === false ? "Inactive" : "Active"));
                }
            }
            // Make sure the elapsed time display is updated
            this.setContact1ElapsedTime(this._contact1ElapsedTimeSecs);
        }
        else
        {
            log.warn("InCall2Ctrl: setContact1Config() called when not in OneCall or TwoCall style.");
        }
    }
    else
    {
        log.warn("InCall2Ctrl: setContact1Config() called with null contact1Details.");
    }
}

InCall2Ctrl.prototype.setContact2Config = function(contact2Details)
{
    log.debug("InCall2Ctrl: setContact2Config() called...");
    
    if (contact2Details != null)
    {
        if (this.properties.ctrlStyle === "TwoCall")
        {
            // Update the second contact's image path (or configure placeholder)
            if (contact2Details.imagePath)
            {
                this._contact2Image.src = contact2Details.imagePath;
            }
            else
            {
                this._contact2Image.src = "common/images/icons/IcnContactImagePlaceholder_" +
                                         (contact2Details.isActive ? "Active" : "Inactive") + ".png";
            }
    
            // Update the second contact's name field
            if (contact2Details.contactName)
            {
                this._contact2Name.innerText = contact2Details.contactName;
            }
            else
            {
                this._contact2Name.innerText = "";
            }
    
            // Update the second contact's phone number
            if (contact2Details.phoneTypeId && (contact2Details.phoneTypeId != ""))
            {
                this._contact2PhoneNumber.innerText = framework.localize.getLocStr(this.uiaId, contact2Details.phoneTypeId, contact2Details.subMap);
            }
            else if (contact2Details.phoneType)
            {
                this._contact2PhoneNumber.innerText = contact2Details.phoneType;
            }
            else if (contact2Details.phoneNumber)
            {
                this._contact2PhoneNumber.innerText = contact2Details.phoneNumber;
            }
            else
            {
            	this._contact2PhoneNumber.innerText = "";
            }

            // Set mask styling in TwoCall controls for active/inactive contacts
            this._setActiveContact('contact2', (contact2Details.isActive ? "Active" : "Inactive"));
            
            // Make sure the elapsed time display is updated
            this.setContact2ElapsedTime(this._contact2ElapsedTimeSecs);
        }
        else
        {
            log.warn("InCall2Ctrl: setContact2Config() called when not in TwoCall style.");
        }
        
    }
    else
    {
        log.warn("InCall2Ctrl: setContact2Config() called with null contact2Details.");
    }
}

InCall2Ctrl.prototype.setMobile911Config = function(mobile911Details)
{
    log.debug("InCall2Ctrl: setMobile911Config() called...");

    if(mobile911Details != null)
    {
        if(this.properties.ctrlStyle === "Mobile911")
        {
            // Update the mobile 911 icon path (no placeholder)
            // if (mobile911Details.iconPath)
            // {
                // this._mobile911IconFrame.style.backgroundImage = "url(" + mobile911Details.iconPath + ")";
            // }
    
            // Update the mobile 911 image path (no placeholder)
            if (mobile911Details.imagePath)
            {
                this._mobile911Image.src = mobile911Details.imagePath;
            }
    
            // Update the mobile 911 service's name field (localize if necessary)
            if (mobile911Details.serviceNameId)
            {
                mobile911Details.serviceName = framework.localize.getLocStr(this.uiaId, mobile911Details.serviceNameId, mobile911Details.serviceNameSubMap);
                this._mobile911ServiceName.innerText = mobile911Details.serviceName;
            }
            else if (mobile911Details.serviceName)
            {
                this._mobile911ServiceName.innerText = mobile911Details.serviceName;
            }
            else
            {
                this._mobile911ServiceName.innerText = "";
            }
    
            // Update the mobile 911 message text (localize if necessary)
            if (mobile911Details.messageTextId)
            {
                mobile911Details.messageText = framework.localize.getLocStr(this.uiaId, mobile911Details.messageTextId, mobile911Details.messageTextSubMap);
                this._mobile911MessageText.innerText = mobile911Details.messageText;
            }
            else if (mobile911Details.messageText)
            {
                this._mobile911MessageText.innerText = mobile911Details.messageText;
            }
            else
            {
                this._mobile911MessageText.innerText = "";
            }
        
            // Make sure the elapsed time display is updated
            this.setMobile911ElapsedTime(this._mobile911ElapsedTimeSecs);
            this._mobile911IconFrame.classList.add("InCall2ActivePhone");
            this._mobile911ServiceName.classList.add("InCall2ActiveFontColor");
            this._mobile911MessageText.classList.add("InCall2ActiveFontColor");
            this._mobile911ElapsedTime.classList.add("InCall2ActiveFontColor");
        }
    }
    else
    {
        log.warn("InCall2Ctrl: setMobile911Config() called with null mobile911Details.");
    }
}

InCall2Ctrl.prototype.setInCallOnHandset = function(onHandset)
{
   if(onHandset)
   {
   	   if(this.properties.ctrlStyle === "OneCall")
       {
           this._inCallPhoneIconContact1.style.display = 'none';
       }
       else if(this.properties.ctrlStyle === "TwoCall")
       {
           this._inCallPhoneIconContact1.style.display = 'none';
           this._inCallPhoneIconContact2.style.display = 'none';
       }
       else{
       	   this._mobile911IconFrame.style.display = 'none';
       }
   }
   else{
   	   if(this.properties.ctrlStyle === "OneCall")
       {
           this._inCallPhoneIconContact1.style.display = 'block';
       }
       else if(this.properties.ctrlStyle === "TwoCall")
       {
           this._inCallPhoneIconContact1.style.display = 'block';
           this._inCallPhoneIconContact2.style.display = 'block';
       }
       else{
       	   this._mobile911IconFrame.style.display = 'block';
       }
   }
}

/*
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
InCall2Ctrl.prototype.getContextCapture = function()
{
    var controlContextCapture = this.umpCtrl.getContextCapture();
    return controlContextCapture;
}

/*
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
InCall2Ctrl.prototype.restoreContext = function(controlContextCapture)
{
    // TODO: Check if focus to be restored on the control or subControl
    // Set the corresponding properties of control and subControl.
    this.umpCtrl.restoreContext(controlContextCapture);
}

InCall2Ctrl.prototype._sec2HHMMSS = function (seconds)
{
    log.debug("_sec2HHMMSS() ", seconds);
    
    var sec_numb    = parseInt(seconds);
    var hours       = Math.floor(sec_numb / 3600);
    var minutes     = Math.floor((sec_numb - (hours * 3600)) / 60);
    var seconds     = sec_numb - (hours * 3600) - (minutes * 60);

    if (hours   < 10) { hours   = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    if(hours == 0)
    {
        var time = minutes + ':' + seconds;
    }
    else
    {
        var time = hours + ':' + minutes + ':' + seconds;
    }
    return time;
}

InCall2Ctrl.prototype.setContact1ElapsedTime = function(elapsedTimeSeconds)
{
    log.debug("InCall2Ctrl: setContact1ElapsedTime() ", elapsedTimeSeconds);
    // First contact's elapsed time
    if (elapsedTimeSeconds === null)
    {
        this._contact1ElapsedTime.innerText = "";
    }
    else
    {
        this._contact1ElapsedTimeSecs = elapsedTimeSeconds;
        this._contact1ElapsedTime.innerText = this._sec2HHMMSS(this._contact1ElapsedTimeSecs);
    }
}

InCall2Ctrl.prototype.setContact2ElapsedTime = function(elapsedTimeSeconds)
{
    log.debug("InCall2Ctrl: setContact2ElapsedTime() ", elapsedTimeSeconds);
    // Second contact's elapsed time
    if (elapsedTimeSeconds === null)
    {
        this._contact2ElapsedTime.innerText = "";
    }
    else
    {
        this._contact2ElapsedTimeSecs = elapsedTimeSeconds;
        this._contact2ElapsedTime.innerText = this._sec2HHMMSS(this._contact2ElapsedTimeSecs);
    }
}

InCall2Ctrl.prototype.setMobile911ElapsedTime = function(elapsedTimeSeconds)
{
    log.debug("InCall2Ctrl: setMobile911ElapsedTime() ", elapsedTimeSeconds);
    // Mobile 911 service's elapsed time
    if (elapsedTimeSeconds != null && this.properties.ctrlStyle == "Mobile911")
    {
        this._mobile911ElapsedTimeSecs = elapsedTimeSeconds;
        
        if (this.properties.mobile911Details.showElapsed)
        {
            this._mobile911ElapsedTime.innerText = this._sec2HHMMSS(this._mobile911ElapsedTimeSecs);
        }
        else
        {
            this._mobile911ElapsedTime.innerText = "";
        }
    }
    else
    {
        log.warn("InCall2Ctrl: setMobile911ElapsedTime() called with a null/invalid value.");
    }
}

InCall2Ctrl.prototype.handleControllerEvent = function(eventId)
{
    log.debug("InCall2Ctrl: handleControllerEvent " + eventId);

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
    
    switch (eventId) 
    {
        case "acceptFocusInit":
        case "acceptFocusFromLeft":
        case "acceptFocusFromRight":
        case "acceptFocusFromtTop":
        case "acceptFocusFromBottom":
            // No action
            if (this.umpCtrl)
            {
                 var response = this.umpCtrl.handleControllerEvent(eventId);
            } 
            break;
        case "lostFocus":
            if (this.umpCtrl)
            {
                 var response = this.umpCtrl.handleControllerEvent(eventId);
            } 
            break;
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
            if (this.umpCtrl)
            {
                 var response = this.umpCtrl.handleControllerEvent(eventId);
            } 
            break;
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
}

InCall2Ctrl.prototype.cleanUp = function()
{
    // InCall2 currently has no cleanup
    if (this.umpCtrl)
    {
        this.umpCtrl.cleanUp();
    }
}

framework.registerCtrlLoaded("InCall2Ctrl");
