/*
    Copyright 2012 by Johnson Controls
    __________________________________________________________________________
    
    Filename: Dialog3Ctrl.js
    __________________________________________________________________________
    
    Project: JCI-IHU
    Language: EN
    Author: agohsmbr
    Date: 
    __________________________________________________________________________
    
    Description: IHU GUI Dialog Control
    
    Revisions:
    v0.1 - 20013-04-25 - Dialog3 Control - agohsmbr
    __________________________________________________________________________
    
*/

log.addSrcFile("Dialog3Ctrl.js", "common");

/* 
 * Constructor function of the control
 * @param uiaId (String) - uiaId of the owning app
 * @param parentDiv (DOM Element) - control parent element for placing the content
 * @param controlId (String) - control Id
 * @param properties (Object) - control configuration
 * @return self (Dialog3Ctrl)
 */
function Dialog3Ctrl(uiaId, parentDiv, controlId, properties)
{
    
    // control properties
    this.uiaId = uiaId;
    this.parentDiv = parentDiv;
    this.controlId = controlId;
    
    // multicontroller
    this._inputMode = "controllerActive";
    this._prevButtonIndex = null;
    this._buttonSelectIndex = -1;
    this._buttonCount = 0;
    this._BUTTON_BAR_WIDTH = 660;
    
    // Determinate meter
    this._scrubberX = 0;                     // Horizontal position of right edge of scrubber
    this._SLIDER_WIDTH = 640;                 // Total pixel width of scrubber
    this._sliderValue = 0;                   // Slider value in non-specific units
    
    //@formatter:off
    this.properties = {     
        "defaultSelectCallback" : null,
        "contentStyle" : null,
        "splashStyle" : "normal",
        "fullScreen" : false,
        "buttonConfig" : null,
        "initialFocus" : null,
        "title" : null,
        "titleId" : null,
        "titleSubMap" : null,
        "text1" : null,
        "text1Id" : null,
        "text1SubMap" : null,
        "text2" : null,
        "text2Id" : null,
        "text2SubMap" : null,
        "text3" : null,
        "text3Id" : null,
        "text3SubMap" : null,
        "text4" : null,
        "text4Id" : null,
        "text4SubMap" : null,
        "text5" : null,
        "text5Id" : null,
        "text5SubMap" : null,
        "text6" : null,
        "text6Id" : null,
        "text6SubMap" : null,
        "text7" : null,
        "text7Id" : null,
        "text7SubMap" : null,
        "text8" : null,
        "text8Id" : null,
        "text8SubMap" : null,
        "text9" : null,
        "text9Id" : null,
        "text9SubMap" : null,
        "text10" : null,
        "text10Id" : null,
        "text10SubMap" : null,
        "imagePath1" : null,
        "imagePath2" : null,
        "meter" : null
    };
    //@formatter:on

    for (var i in properties)
    {
        this.properties[i] = properties[i];
    }
    
    for (var hashId in this.properties.buttonConfig)
    {
        this._buttonCount++;
    }
    
    if (this._buttonCount > 4)
    {
        this._buttonCount = 4;
        log.warn("Dialog3Ctrl does not support more than 4 buttons. Only the first 4 will be displayed.");
    }
    
    if (this._buttonCount > 0)
    {
        // Check for specified index
        if (utility.toType(this.properties.initialFocus) == 'number')
        {
            if (this.properties.initialFocus > this._buttonCount - 1)
            {
                log.warn("Only " + this._buttonCount + " buttons were defined. initialFocus cannot be greater than " + (this._buttonCount - 1));
                this.properties.initialFocus = this._buttonCount - 1;
            }
            else if (this.properties.initialFocus < 0)
            {
                log.warn("initialFocus cannot be less than 0");
                this.properties.initialFocus = 0;
            }
            this._buttonSelectIndex = this.properties.initialFocus;
        }
        else
        {
            this._buttonSelectIndex = 0;
        }
    }
    
    this._createStructure(); 
}

/* 
 * Control init
 * @return void
 */
Dialog3Ctrl.prototype._init = function()
{
    this._setDialogConfig(this.properties);
}

/* 
 * Create control's DOM structure
 * @return void
 */
Dialog3Ctrl.prototype._createStructure = function()
{   
    /*
     * Build all necessary DIV's for the given Dialog style
     */
    
    // Create the div for control
    this.divElt = document.createElement('div');
        this.divElt.id = this.controlId;
        this.divElt.className = "Dialog3Ctrl";
        
        if (this.properties.fullScreen === true)
        {
            // Change height and background for full-screen
            this.divElt.classList.add("Dialog3CtrlFs");
        }
    
    this._dialogContainer = document.createElement('div');
        this._dialogContainer.className = "Dialog3CtrlContainer";
        
        if (this.properties.fullScreen === true)
        {
            // Change position of top attribute for full-screen
            this._dialogContainer.classList.add("Dialog3CtrlContainerFs");
        }
        this.divElt.appendChild(this._dialogContainer);
    
    // Conditionally create div(s) for title
    if (this.properties.titleStyle)
    {
        // Create title container
        this._dialogTitle = document.createElement('div');
            this._dialogTitle.className = "Dialog3Ctrl_Title";
            this._dialogContainer.appendChild(this._dialogTitle);
        
        // Create text title div
        this._titleText = document.createElement('div');
            this._dialogTitle.appendChild(this._titleText);
        
        // Create title separator
        this.titleSeparator = document.createElement('div');
            this.titleSeparator.className = "Dialog3Ctrl_Title_Separator";
            this._dialogTitle.appendChild(this.titleSeparator);
        
        // Set title style class and possible image  
        switch(this.properties.titleStyle)
        {
            case "titleStyle01":
                this._titleText.className = "Dialog3Ctrl_TitleStyle01_Text1";
                break;
            case "titleStyle02":
                this._titleText.className = "Dialog3Ctrl_TitleStyle02_Text1";
                
                // Create image div
                this._titleImage = document.createElement('div');
                    this._titleImage.className = "Dialog3Ctrl_TitleStyle02_Image1";
                    this._dialogTitle.appendChild(this._titleImage);
                break;
            case "titleStyle03":
                this._titleText.className = "Dialog3Ctrl_TitleStyle03_Text1";
                break;
            default:
                // Not a valid titleStyle
                break;
        }
    }
    
    // Create container div for content
    this._dialogContent = document.createElement('div');
        this._dialogContainer.appendChild(this._dialogContent);
    
    // Create div for text1
    this._text1 = document.createElement('div');
        this._dialogContent.appendChild(this._text1);
    
    // Create div for text2
    this._text2 = document.createElement('div');
        this._dialogContent.appendChild(this._text2);
           
    // Create div for text3
    this._text3 = document.createElement('div');
        this._dialogContent.appendChild(this._text3);
    /*
     * Conditionally create additional text areas
     */
    
    // Only Style18 and Style19 needs more than 3 text areas
    if (this.properties.contentStyle == "style18" || this.properties.contentStyle == "style19")
    {
        // Create div for text 4
        this._text4 = document.createElement('div');
            this._dialogContent.appendChild(this._text4);
    }
    
    
    // Only Style19 needs more than 3 text areas
    if (this.properties.contentStyle == "style19")
    {
        // Need 9 text areas            
        this._text5 = document.createElement('div');
            this._dialogContent.appendChild(this._text5);
            
        this._text6 = document.createElement('div');
            this._dialogContent.appendChild(this._text6);
            
        this._text7 = document.createElement('div');
            this._dialogContent.appendChild(this._text7);
            
        this._text8 = document.createElement('div');
            this._dialogContent.appendChild(this._text8);
            
        this._text9 = document.createElement('div');
            this._dialogContent.appendChild(this._text9);
            
        this._text10 = document.createElement('div');
            this._dialogContent.appendChild(this._text10);
    }
    
    // Create div for image1
    this._imagePath1 = document.createElement('div');
        this._dialogContent.appendChild(this._imagePath1);
    
    // Create div for image2
    this._imagePath2 = document.createElement('div');
        this._dialogContent.appendChild(this._imagePath2);
    
    // Check for PIN style and create DIVs. 
    if (this.properties.contentStyle == "style16")
    {
        // Create PIN number DIVs
        this._pinDiv1 = document.createElement('div');
            this._dialogContent.appendChild(this._pinDiv1);
        this._pinDiv2 = document.createElement('div');
            this._dialogContent.appendChild(this._pinDiv2);
        this._pinDiv3 = document.createElement('div');
            this._dialogContent.appendChild(this._pinDiv3);
        this._pinDiv4 = document.createElement('div');
            this._dialogContent.appendChild(this._pinDiv4);
    }
        
    // Check for Determinate Meter
    if (this.properties.meter)
    {
        if (this.properties.meter.meterType == "determinate")
        {
            // Create divs for determinate meter
            
            // Create meter div
            this._determinateMeter = document.createElement('div');
            
            // Create meter highlight div
            this._determinateMeterHighlight = document.createElement('div');
                this._determinateMeter.appendChild(this._determinateMeterHighlight);
            
            // Create meter labels
            this._determinateMeterLeftLabel = document.createElement('div');
            this._determinateMeterRightLabel = document.createElement('div');
            
            this._dialogContent.appendChild(this._determinateMeter);                
            this._dialogContent.appendChild(this._determinateMeterLeftLabel);
            this._dialogContent.appendChild(this._determinateMeterRightLabel);
        }
        else
        {
            // Indeterminate
            this._indeterminateMeter = document.createElement('div');
        }
    }
    
    /*
     * Set CSS styling
     */
    
    // Determine content style. Set classes.
    switch(this.properties.contentStyle)
    {
        case "style01":
            this._dialogContent.className = "Dialog3Ctrl_Style01";
            this._text1.className = "Dialog3Ctrl_Style01_Text1";
            break;
        case "style02":
            this._dialogContent.className = "Dialog3Ctrl_Style02";
            this._text1.className = "Dialog3Ctrl_Style02_Text1 Dialog3Ctrl_Style02_Item";
            break;
        case "style03":
            this._dialogContent.className = "Dialog3Ctrl_Style03";
            
            // style03, with a determinate meter, needs
            // a multi-line text area for text1
            if(this._determinateMeter)
            {
                // Determinate meter
                this._text1.className = "Dialog3Ctrl_Style03_Text1_determinate";
            }
            else
            {
                // Indeterminate meter or image
                this._text1.className = "Dialog3Ctrl_Style03_Text1";
            }
            
            this._text2.className = "Dialog3Ctrl_Style03_Text2";
            this._imagePath1.className = "Dialog3Ctrl_Style03_Image1";
            
            /*
             * NOTE: style03 may, or may not, use a meter
             */
            
            // Check for possible determinate meter
            if (this._determinateMeter && this._determinateMeterHighlight)
            {
                this._determinateMeter.className = "Dialog3Ctrl_Determinate_Meter_01";
                this._determinateMeterHighlight.className = "Dialog3Ctrl_Determinate_Meter_01_Highlight";
                this._determinateMeterLeftLabel.className = "Dialog3Ctrl_Determinate_Meter_01_LeftLabel";
                this._determinateMeterRightLabel.className = "Dialog3Ctrl_Determinate_Meter_01_RightLabel";
            }
            
            // Check for possible indeterminate meter
            if (this._indeterminateMeter)
            {
                this._indeterminateMeter.className = "Dialog3Ctrl_Indeterminate_Meter_01";
            }
            break;
        case "style04":
            this._dialogContent.className = "Dialog3Ctrl_Style04";
            this._text1.className = "Dialog3Ctrl_Style04_Text1";
            this._text2.className = "Dialog3Ctrl_Style04_Text2";
            this._imagePath1.className = "Dialog3Ctrl_Style04_Image1";
            break;
        case "style05":
            this._dialogContent.className = "Dialog3Ctrl_Style05";
            this._text1.className = "Dialog3Ctrl_Style05_Text1";
            this._text2.className = "Dialog3Ctrl_Style05_Text2";
            this._text3.className = "Dialog3Ctrl_Style05_Text3";
            break;
        case "style06":
            this._dialogContent.className = "Dialog3Ctrl_Style06";
            this._imagePath1.className = "Dialog3Ctrl_Style06_Image1";
            break;
        case "style07":
            // NOTE: Depricated
            break;
        case "style08":
            // NOTE: Depricated
            break;
        case "style09":
            this._dialogContent.className = "Dialog3Ctrl_Style09";
            this._imagePath1.className = "Dialog3Ctrl_Style09_Image1";
            this._imagePath2.className = "Dialog3Ctrl_Style09_Image2";
            
            // Check for possible indeterminate meter
            if (this._indeterminateMeter)
            {
                this._indeterminateMeter.className = "Dialog3Ctrl_Indeterminate_Meter_01";
            }
            break;
        case "style10":
            this._dialogContent.className = "Dialog3Ctrl_Style10";
            this._text1.className = "Dialog3Ctrl_Style10_Text1";
            break;
        case "style11":
            this._dialogContent.className = "Dialog3Ctrl_Style11";
            this._imagePath1.className = "Dialog3Ctrl_Style11_Image1";
            
            // Check for possibledeterminate meter
            if (this._determinateMeter && this._determinateMeterHighlight)
            {
                this._determinateMeter.className = "Dialog3Ctrl_Determinate_Meter_02";
                this._determinateMeterHighlight.className = "Dialog3Ctrl_Determinate_Meter_02_Highlight";
                this._determinateMeterLeftLabel.className = "Dialog3Ctrl_Determinate_Meter_02_LeftLabel";
                this._determinateMeterRightLabel.className = "Dialog3Ctrl_Determinate_Meter_02_RightLabel";
            }
            break;
        case "style12":
            // NOTE: Depricated
            break;
        case "style13":
            this._dialogContent.className = "Dialog3Ctrl_Style13";
            this._text1.className = "Dialog3Ctrl_Style13_Text1 Dialog3Ctrl_Style13_Item";
            // this._text1Inner.className = "Dialog3Ctrl_Style13_Text1_Inner";
            this._text2.className = "Dialog3Ctrl_Style13_Text2 Dialog3Ctrl_Style13_Item";
            // this._text2Inner.className = "Dialog3Ctrl_Style13_Text2_Inner";
            break;
        case "style14":
            this._dialogContent.className = "Dialog3Ctrl_Style14";
            this._text1.className = "Dialog3Ctrl_Style14_Text1";
            this._imagePath1.className = "Dialog3Ctrl_Style14_Image1";
            
            // Check for possible indeterminate meter
            if (this._indeterminateMeter)
            {
                this._indeterminateMeter.className = "Dialog3Ctrl_Indeterminate_Meter_01";
            }
            else
            {
                log.warn("Dialog3Ctrl: style14 specified with no meter.");
            }
            break;
        case "style16":
            this._dialogContent.className = "Dialog3Ctrl_Style16";
            this._text1.className = "Dialog3Ctrl_Style16_Text1";
            this._imagePath1.className = "Dialog3Ctrl_Style16_Image1";
            
            // Set PIN DIVs
            this._pinDiv1.className = "Dialog3Ctrl_Style16_Pin1";
            this._pinDiv2.className = "Dialog3Ctrl_Style16_Pin2";
            this._pinDiv3.className = "Dialog3Ctrl_Style16_Pin3";
            this._pinDiv4.className = "Dialog3Ctrl_Style16_Pin4";
            break;
        case "style17":
            this._dialogContent.className = "Dialog3Ctrl_Style17";
            this._text1.className = "Dialog3Ctrl_Style17_Text1";
            this._text2.className = "Dialog3Ctrl_Style17_Text2";
            this._text3.className = "Dialog3Ctrl_Style17_Text3";
            break;
        case "style18":
            this._dialogContent.className = "Dialog3Ctrl_Style18";
            this._text1.className = "Dialog3Ctrl_Style18_Text1";
            this._text2.className = "Dialog3Ctrl_Style18_Text2";
            this._text3.className = "Dialog3Ctrl_Style18_Text3";
            this._text4.className = "Dialog3Ctrl_Style18_Text4";
            break;
           case "style19":
            this._dialogContent.className = "Dialog3Ctrl_Style19";
            this._text1.className = "Dialog3Ctrl_Style19_Text1 Dialog3Ctrl_Style19_Item";
            this._text2.className = "Dialog3Ctrl_Style19_Text2 Dialog3Ctrl_Style19_Item";
            this._text3.className = "Dialog3Ctrl_Style19_Text3 Dialog3Ctrl_Style19_Item";
            this._text4.className = "Dialog3Ctrl_Style19_Text4 Dialog3Ctrl_Style19_Item";
            this._text5.className = "Dialog3Ctrl_Style19_Text5 Dialog3Ctrl_Style19_Item";
            this._text6.className = "Dialog3Ctrl_Style19_Text6 Dialog3Ctrl_Style19_Item";
            this._text7.className = "Dialog3Ctrl_Style19_Text7 Dialog3Ctrl_Style19_Item";
            this._text8.className = "Dialog3Ctrl_Style19_Text8 Dialog3Ctrl_Style19_Item";
            this._text9.className = "Dialog3Ctrl_Style19_Text9 Dialog3Ctrl_Style19_Item";
            this._text10.className = "Dialog3Ctrl_Style19_Text10 Dialog3Ctrl_Style19_Item";
            break;
        case "style20":
            this._dialogContent.className = "Dialog3Ctrl_Style20";
            this._imagePath1.className = "Dialog3Ctrl_Style20_Image1";
            this._text1.className = "Dialog3Ctrl_Style20_Text1 Dialog3Ctrl_Style20_Item";
            break;
        case "style22":
            this._dialogContent.className = "Dialog3Ctrl_Style22";
            this._text1.className = "Dialog3Ctrl_Style22_Text1";
            this._text2.className = "Dialog3Ctrl_Style22_Text2";
            this._text3.className = "Dialog3Ctrl_Style22_Text3";
            break;
        case "style23":
            this._dialogContent.className = "Dialog3Ctrl_Style23";
            this._text1.className = "Dialog3Ctrl_Style23_Text1";
            this._text2.className = "Dialog3Ctrl_Style23_Text2";
            this._text3.className = "Dialog3Ctrl_Style23_Text3";
            break;
        default:
            break;
    }
    
    // Create buttons    
    var buttonIndex = 0;
    var stylePrefix = "Dialog3Ctrl_";
    
    // Conditionally create buttons container/background
    if (this._buttonCount > 0)
    {
        this.dialogButtons = document.createElement('div');
            this.dialogButtons.className = "Dialog3Ctrl_Buttons";
            this._dialogContainer.appendChild(this.dialogButtons);
    }
    
    switch(this._buttonCount)
    {
        case 0:
            // No buttons
            break;
        case 1:
            stylePrefix += "ButtonStyle01";
            break;
        case 2:
            stylePrefix += "ButtonStyle02";
            break;
        case 3:
            stylePrefix += "ButtonStyle03";
            break;
        case 4:
            stylePrefix += "ButtonStyle04";
            break;
        default:
            break;
    } 
    
    var selectCallback = this._buttonSelectCallback.bind(this);
    var onFocusCallback = this._buttonFocusedCallback.bind(this);
    var buttonGroupObj = new Object();
    
    // Iterate through buttonConfig and build buttons
    for(var key in this.properties.buttonConfig)
    {
        if (buttonIndex > 4)
        {
            // limit max displayed buttons to 4
            break;
        }
        // Store the original value of appData from the app.
        var originalAppData = this.properties.buttonConfig[key].appData;
        
        /*
         * NOTE: In order to support the inCall use case, we need to 
         * check the buttonColor property for non-default button colors
         * Currently only effects the "enabled" button state.
         * NOTE: Only available for 2 and 3 button configurations.
         */
        var enabledClass = "";
        switch(this.properties.buttonConfig[key].buttonColor)
        {
            case "red":
                if (this._buttonCount == 2 || this._buttonCount == 3)
                {
                    enabledClass = stylePrefix + "_Red_En";
                }
                else
                {
                    log.warn("Dialog3Ctrl: A red button can only be specified for a 2 or 3 button configuration.");
                }
                break;
            case "green":
                if (this._buttonCount == 2 || this._buttonCount == 3)
                {
                    enabledClass = stylePrefix + "_Green_En";
                }
                else
                {
                    log.warn("Dialog3Ctrl: A green button can only be specified for a 2 or 3 button configuration.");
                }
                break;
            default:
                // Default to "normal"
                enabledClass = stylePrefix + "_En";
                break;
        }
        
        var thisButtonConfig = {
            // Set button style
            "useDebugClasses" : false,
            "canStealFocus": true,
            "groupFocusObj": buttonGroupObj,
            "onFocusCallback": onFocusCallback,
            "selectCallback" : selectCallback,
            "longPressCallback" : null,
            "holdStartCallback" : null,
            "holdStopCallback" : null,
            "appData" : {"hashId" : key, "buttonIndex": buttonIndex, "originalAppData" : originalAppData}, // Add hashId to identify button calls
            "label" : this.properties.buttonConfig[key].label,
            "labelId" : this.properties.buttonConfig[key].labelId,
            "subMap" : this.properties.buttonConfig[key].subMap,
            "buttonBehavior" : this.properties.buttonConfig[key].buttonBehavior,
            "enabledClass" : enabledClass,
            "disabledClass" : stylePrefix + "_Ds",
            "focusedClass" : stylePrefix + "_focused",
            "downClass" : stylePrefix + "_down",
            "heldClass" : null,
            "icon" : null,
            "buttonStyle" : this.properties.buttonConfig[key].buttonStyle,
            "checkBoxData" : this.properties.buttonConfig[key].checkBoxData
        };
        
        // Instantiate button
        this["buttonCtrl_" + buttonIndex] = framework.instantiateControl(this.uiaId, this.dialogButtons, "ButtonCtrl", thisButtonConfig);
        
        // If more than one button, calculate and set left 
        // position for each. 
        if (this._buttonCount > 1)
        {
            var leftPos = (this._BUTTON_BAR_WIDTH / this._buttonCount) * buttonIndex + 1;
            this["buttonCtrl_" + buttonIndex].divElt.style.left = leftPos + "px";
        }
        
        // Set initial state
        this["buttonCtrl_" + buttonIndex].handleControllerEvent(this._inputMode);
           
           // Check for button focus
        if (buttonIndex == this._buttonSelectIndex)
        {
            this["buttonCtrl_" + buttonIndex].handleControllerEvent("acceptFocusInit");
        }
        
        // Check for disabled property
        if (this.properties.buttonConfig[key].disabled != null)
        {
            this.setDisabled(key, this.properties.buttonConfig[key].disabled);
        }
        
        buttonIndex++;
    }
    
    this.parentDiv.appendChild(this.divElt);
    
    this._init();
}

/* 
 * Set control configuration
 * @param config (Object) - control configuration
 * @return void
 */
Dialog3Ctrl.prototype._setDialogConfig = function(config)
{
    // Set dialog element styles

    // Set title text
    if (config.titleId)
    {
        this.setTitleId(config.titleId, config.titleSubMap);
    }
    else if (config.title)
    {
        this.setTitle(config.title);
    }
    
    // Set title icon
    if (config.titleImage)
    {
        if (this.properties.titleStyle == "titleStyle02")
        {
            this._titleImage.style.backgroundImage = "url(" + config.titleImage + ")";
        }
        else
        {
            log.warn("Dialog3Ctrl: titleImage only supported by titleStyle02.");
        }
    }
    
    // Set text element values
    /*
     * text1
     */
    if (config.text1Id)
    {
        this.setText1Id(config.text1Id, config.text1SubMap);
    }
    else if (config.text1)
    {
        this.setText1(config.text1);
    }
    
    /*
     * text2
     */    
    if (config.text2Id)
    {
        this.setText2Id(config.text2Id, config.text2SubMap);
    }
    else if (config.text2)
    {
        this.setText2(config.text2);
    }
    
    /*
     * text3
     */    
    if (config.text3Id)
    {
        this.setText3Id(config.text3Id, config.text3SubMap);
    }
    else if (config.text3)
    {
        this.setText3(config.text3);
    }
    
    /*
     * text4
     */
    
    if (config.text4Id)
    {
        this.setText4Id(config.text4Id, config.text4SubMap);
    }
    else if (config.text4)
    {
        this.setText4(config.text4);
    }
    
    /*
     * text5 - text10
     */
    if (config.text5Id)
    {
        this.setText5Id(config.text5Id, config.text5SubMap);
    }
    else if (config.text5)
    {
        this.setText5(config.text5);
    }
    
    if (config.text6Id)
    {
        this.setText6Id(config.text6Id, config.text6SubMap);
    }
    else if (config.text6)
    {
        this.setText6(config.text6);
    }
    
    if (config.text7Id)
    {
        this.setText7Id(config.text7Id, config.text7SubMap);
    }
    else if (config.text7)
    {
        this.setText7(config.text7);
    }
    
    if (config.text8Id)
    {
        this.setText8Id(config.text8Id, config.text8SubMap);
    }
    else if (config.text8)
    {
        this.setText8(config.text8);
    }
    
    if (config.text9Id)
    {
        this.setText9Id(config.text9Id, config.text9SubMap);
    }
    else if (config.text9)
    {
        this.setText9(config.text9);
    }
    
    if (config.text10Id)
    {
        this.setText10Id(config.text10Id, config.text10SubMap);
    }
    else if (config.text10)
    {
        this.setText10(config.text10);
    }
    
    /*
     * imagePath1
     */
    
    if (config.imagePath1)
    {
        // Check for style09
        if (config.contentStyle == "style09")
        {
            /*
             * Style09 is unique. It may use a smaller branding image or
             * a full-dialog branding image (Pandora only). 
             * Determine appropriate background.
             */
            if (config.splashStyle != null && config.splashStyle == "full")
            {
                // Expect a full-dialog splash screen
                // Use branding image as dialog content background
                this.divElt.style.backgroundImage = "url(" + config.imagePath1 + ")";
            }
            else
            {
                // Expect a "normal" branding image
                // Use black dialog content background
                this.divElt.style.backgroundImage = "url(common/controls/Dialog3/images/DialogBG_AppLoadScreens.png)";
                // Set branding image as imagePath1
                this._imagePath1.style.backgroundImage = "url(" + config.imagePath1 + ")";
            }
        }
        else
        {
            // Treat as typical image
            this._imagePath1.style.backgroundImage = "url(" + config.imagePath1 + ")";
        }
    }
    
    /*
     * imagePath2
     */
    
    if (config.imagePath2)
    {
        this._imagePath2.style.backgroundImage = "url(" + config.imagePath2 + ")";
    }
    
    /*
     * determinate / indeterminate meter
     */
    
    if (config.meter && config.meter.meterType == "indeterminate")
    {
        /*
         * NOTE: An indeterminate meter cannot be set as a background 
         * image as it is an Animated PNG - Need an <img> tag or the
         * animation will not occur.
         */

        var image = document.createElement("img");
        image.src = config.meter.meterPath;

        switch(this.properties.contentStyle)
        {
            case "style03":
                // style03 displays an indeterminate meter in the image1 position
                this._indeterminateMeter.appendChild(image);
                this._imagePath1.appendChild(this._indeterminateMeter);
                break;
            case "style09":
                // style03 displays an indeterminate meter in the image2 position
                this._indeterminateMeter.appendChild(image);
                this._imagePath2.appendChild(this._indeterminateMeter);
                break;
            case "style14":
                // style14 displays an indeterminate meter in the image1 position
                this._indeterminateMeter.appendChild(image);
                this._imagePath1.appendChild(this._indeterminateMeter);
                break;
            default:
                // Invalid style
                log.warn("Dialog3Ctrl: received an indeterminate meter for an unsupported style.");
                break;
        }
    }
    else if (config.meter && config.meter.meterType == "determinate")
    {
        if (this.properties.contentStyle == "style03" || this.properties.contentStyle == "style11")
        {
            if (config.meter.currentValue)
            {
                this.setSliderValue(config.meter.currentValue);
            }
            else
            {
                this.setSliderValue(0);
            }
            if (config.meter.elapsedValue)
            {
                this.setElapsedValue(config.meter.elapsedValue);
            }
            else
            {
                this.setElapsedValue("");
            }
            if (config.meter.totalValue)
            {
                this.setTotalValue(config.meter.totalValue);
            }
            else
            {
                this.setTotalValue("");
            }
        }
        else
        {
            log.warn("Dialog3Ctrl: received a determinate meter for an unsupported style.");
        }
    }
}

/* 
 * Set elapsed value (left label) on a determinate meter
 * @param value (String) - control elapsed time value
 * @return void
 */
Dialog3Ctrl.prototype.setElapsedValue = function(value)
{
    if (this._determinateMeterLeftLabel)
    {
        this._determinateMeterLeftLabel.innerText = value;
    }
    else
    {
        log.warn("Dialog3Ctrl: setElapsedValue() called with no label field present.");
    }
}

/* 
 * Set total value (right label) on a determinate meter
 * @param value (String) - control total time value
 * @return void
 */
Dialog3Ctrl.prototype.setTotalValue = function(value)
{
    if (this._determinateMeterRightLabel)
    {
        this._determinateMeterRightLabel.innerText = value;
    }
    else
    {
        log.warn("Dialog3Ctrl: setTotalValue() called with no label field present.");
    }
}

/* 
 * Set slider value (progress position) on a determinate meter
 * @param value (Number)
 * @return void
 */
Dialog3Ctrl.prototype.setSliderValue = function(value)
{
    // Set value
    this._sliderValue = value;

    // Update slider
    this._updateScrubber();
}

/* 
 * Updates progress position on a determinate meter
 * @return void
 */
Dialog3Ctrl.prototype._updateScrubber = function()
{
    // Determine scrubberX (in pixels) based on the value of this._sliderValue
    this._scrubberX = (this._SLIDER_WIDTH * this._sliderValue) / this.properties.meter.max;

    // Check for out-of-bounds
    if (this._scrubberX > this._SLIDER_WIDTH)
    {
        this._scrubberX = this._SLIDER_WIDTH;
    }
    if (this._scrubberX < 0)
    {
        this._scrubberX = 0;
    }
    
    // Set width of progress bar
    this._determinateMeterHighlight.style.width = this._scrubberX + "px";
}

/* 
 * Set a button's disabled value
 * @param buttonId (String) - button hash value
 * @param disabled (Boolean) - disabled state
 * @return void
 */
Dialog3Ctrl.prototype.setDisabled = function(buttonId, disabled)
{
    var buttonIndex = 0;
    
    for(var key in this.properties.buttonConfig)
    {
        if (key == buttonId)
        {
            this.properties.buttonConfig[key].disabled = disabled;
            if (disabled)
            {
                this["buttonCtrl_" + buttonIndex].setEnabled(false);
            }
            else
            {
                this["buttonCtrl_" + buttonIndex].setEnabled(true);
            }
            break;
        }
        buttonIndex++;
    }
}

/* 
 * Select specified button
 * @param btnId (Int) - id of the button to be focussed
 * @return void
 */
Dialog3Ctrl.prototype._selectBtn = function(btnId)
{
    if (this._buttonCount > 0)
    {
        // remove old highlight
        this['buttonCtrl_' + this._buttonSelectIndex].handleControllerEvent("lostFocus");
        
        // ensure the new highlight is between 0 and the buttonCount
        this._buttonSelectIndex = Math.min(Math.max(btnId, 0), this._buttonCount);
        
        // highlight the new button
        this['buttonCtrl_' + this._buttonSelectIndex].handleControllerEvent("acceptFocusInit");
    }
}

/* 
 * Deselect currently selected button
 * @return void
 */
Dialog3Ctrl.prototype._deselectBtn = function()
{
    if (this._buttonCount > 0)
    {
        // remove highlight
        this['buttonCtrl_' + this._buttonSelectIndex].handleControllerEvent("lostFocus");
    }
}

/* 
 * Set individual PIN values
 * @param pinArray (Array)
 * @return void
 */
Dialog3Ctrl.prototype._setPinValues = function(pinArray)
{
    if (pinArray.length == 4)
    {
        this._pinDiv1.innerText = pinArray[0];
        this._pinDiv2.innerText = pinArray[1];
        this._pinDiv3.innerText = pinArray[2];
        this._pinDiv4.innerText = pinArray[3];
    }
    else
    {
        log.warn("Dialog3Ctrl: Received invalid PIN value. Must be 4 digits.");
    }
}

/* 
 * Set title text
 * @param text (String)
 * @return void
 */
Dialog3Ctrl.prototype.setTitle = function(text)
{
    this._titleText.innerText = text;
}

/* 
 * Localize and set title text
 * @param textId (String) - string id to be localized
 * @param textSubMap (String) - submap for dynamic text
 * @return void
 */
Dialog3Ctrl.prototype.setTitleId = function(textId, textSubMap)
{
    this.properties.title = framework.localize.getLocStr(this.uiaId, textId, textSubMap);
    this.setTitle(this.properties.title);
}

/* 
 * Deal with and adjust multi-line text areas that need to be
 * vertically centered regardless of line count.
 * @param textRef (Object) - Reference to text area (DIV)
 * @return void
 */
Dialog3Ctrl.prototype._setWrapClass = function(textRef)
{
    log.debug("_setWrapClass() called...");
    log.debug("   textRef.clientWidth: " + textRef.clientWidth);
    log.debug("   textRef.offsetwidth: " + textRef.offsetWidth);
    log.debug("   textRef.width: " + textRef.width);
    
    // Remove any previously set classes from the
    // text area
    switch(this.properties.contentStyle)
    {
        case "style02":
            textRef.classList.remove("Dialog3Ctrl_Style02_Wrap");
            textRef.classList.remove("Dialog3Ctrl_Style02_Nowrap");
            break;
        case "style13":
            textRef.classList.remove("Dialog3Ctrl_Style13_Wrap");
            textRef.classList.remove("Dialog3Ctrl_Style13_Nowrap");
            break;
        case "style19":
            textRef.classList.remove("Dialog3Ctrl_Style19_Wrap");
            textRef.classList.remove("Dialog3Ctrl_Style19_Nowrap");
            break;
        case "style20":
            textRef.classList.remove("Dialog3Ctrl_Style20_Wrap");
            textRef.classList.remove("Dialog3Ctrl_Style20_Nowrap");
            break;
        default:
            break;
    }
    
    if(this.properties.contentStyle == "style02")
    {
        log.debug("      Checking against 646...");
        if (textRef.clientWidth > 646)
        {
            textRef.classList.add("Dialog3Ctrl_Style02_Wrap");
        }
        else
        {
            textRef.classList.add("Dialog3Ctrl_Style02_Nowrap");
        }
        
        /*
         * style02 can have anywhere from 1 - 5 lines of text. Any
         * of those must be vertically centered. Any beyond must be
         * truncated with ellipsis. 
         */
       
        // NOTE: The number 42 is the line-height value in the SASS
        // file for Dialog3Ctrl_Style02_Text1. 233 is the max height
        // of the text area. Opera does not appear to properly read
        // the CSS line-height attribute when multiple styles are 
        // applied to an element. 
        //
        // DO NOT CHANGE HERE WITHOUT ALSO CHANGING IN SASS
        var lineHeight = 42;        // line-height value in SASS file
        var textAreaHeight = 233;    // max height specified by Studio
        var maxNumLines = 5;
        
        // Calculate the number of lines of text
        var numLines = (textRef.offsetHeight / lineHeight);
        
        // Check for overrun and vertically center
        if(numLines > maxNumLines)
        {
            // Vertically center as if only 5 lines. Will truncate
            // with ellipsis.
            var textHeight = (maxNumLines * lineHeight);
            var newTop = Math.round((textAreaHeight - textHeight) / 2);
            textRef.style.top = newTop + "px";
            // Here, a hard height must be set to force truncation.
            // Set to match height used for vertical centering.
            textRef.style.height = textHeight + 5 + "px";
        }
        else
        {
            // Adjust top to vertically center text line(s)
            var newTop = Math.round((textAreaHeight - textRef.offsetHeight) / 2);
            textRef.style.top = newTop + "px";
            // Here, no height is set to allow DIV to collapse and give
            // accurate offsetHeight
        }        
    }
    
    if(this.properties.contentStyle == "style13")
    {
        log.debug("      Checking against 646 for style13");
        if (textRef.clientWidth > 646)
        {
            textRef.classList.add("Dialog3Ctrl_Style13_Wrap");
        }
        else
        {
            textRef.classList.add("Dialog3Ctrl_Style13_Nowrap");
        }
    }
    
    // Check each text area for multi-line and apply additional
    // styling as appropriate
    if(this.properties.contentStyle == "style19")
    {
        log.debug("      Checking against 318 for style19...");
        if (textRef.clientWidth > 318)
        {
            textRef.classList.add("Dialog3Ctrl_Style19_Wrap");
        }
        else
        {
            textRef.classList.add("Dialog3Ctrl_Style19_Nowrap");
        }
    }
    
    if(this.properties.contentStyle == "style20")
    {
        log.debug("      Checking against 646 for style20");
        if (textRef.clientWidth > 646)
        {
            textRef.classList.add("Dialog3Ctrl_Style20_Wrap");
        }
        else
        {
            textRef.classList.add("Dialog3Ctrl_Style20_Nowrap");
        }
        
        /*
         * style20 can have anywhere from 1 - 4 lines of text. Any
         * of those must be vertically centered. Any beyond must be
         * truncated with ellipsis. 
         */
       
        // NOTE: The number 42 is the line-height value in the SASS
        // file for Dialog3Ctrl_Style20_Text1. 183 is the max height
        // of the text area. Opera does not appear to properly read
        // the CSS line-height attribute when multiple styles are 
        // applied to an element. 
        //
        // DO NOT CHANGE HERE WITHOUT ALSO CHANGING IN SASS
        var lineHeight = 42;        // line-height value in SASS file
        var textAreaHeight = 183;    // max height specified by Studio
        var maxNumLines = 4;
        var minTop = 50;
        // Calculate the number of lines of text
        var numLines = (textRef.offsetHeight / lineHeight);
        
        // Check for overrun and vertically center
        if(numLines > maxNumLines)
        {
            // Vertically center as if only 5 lines. Will truncate
            // with ellipsis.
            var textHeight = (maxNumLines * lineHeight);
            var newTop = Math.round((textAreaHeight - textHeight) / 2) + minTop;
            textRef.style.top = newTop + "px";
            // Here, a hard height must be set to force truncation.
            // Set to match height used for vertical centering.
            textRef.style.height = textHeight + "px";
        }
        else
        {
            // Adjust top to vertically center text line(s)
            var newTop = Math.round((textAreaHeight - textRef.offsetHeight) / 2) + minTop;
            textRef.style.top = newTop + "px";
            // Here, no height is set to allow DIV to collapse and give
            // accurate offsetHeight
        }        
    }
}

/* 
 * Set Text 1
 * @param text (String) - textual content of text area
 * @return void
 */
Dialog3Ctrl.prototype.setText1 = function(text)
{
    log.debug("setText1() called...");
    if (this._validateTextNum(1))
    {
        this._text1.innerText = text;
        if(this.properties.contentStyle == "style02" || this.properties.contentStyle == "style13" || this.properties.contentStyle == "style19" || this.properties.contentStyle == "style20")
        {
            this._setWrapClass(this._text1);
        }
    }
}

/* 
 * Set Text 1 Id
 * @param textId (String) - stringId of the text
 * @param textSubMap (Object) - submap for dynamic text
 * @return void
 */
Dialog3Ctrl.prototype.setText1Id = function(textId, textSubMap)
{
    log.debug("setTextId() called...");
    if (this._validateTextNum(1))
    {
        this.properties.text1 = framework.localize.getLocStr(this.uiaId, textId, textSubMap);
        this.setText1(this.properties.text1);
    }
}

/* 
 * Set Text 2
 * @param text (String) - textual content of text area
 * @return void
 */
Dialog3Ctrl.prototype.setText2 = function(text)
{
    if (this._validateTextNum(2))
    {
        if (this.properties.contentStyle == "style16")
        {
            // Parse pin into array
            var pinArray = text.split('');
            this._setPinValues(pinArray);
        }
        else
        {
            this._text2.innerText = text;
            
            if(this.properties.contentStyle == "style13" || this.properties.contentStyle == "style19")
            {
                this._setWrapClass(this._text2);
            }
        }
    }
}

/* 
 * Set Text 2 Id
 * @param textId (String) - stringId of the text
 * @param textSubMap (Object) - submap for dynamic text
 * @return void
 */
Dialog3Ctrl.prototype.setText2Id = function(textId, textSubMap)
{
    if (this._validateTextNum(2))
    {
        this.properties.text2 = framework.localize.getLocStr(this.uiaId, textId, textSubMap);
        this.setText2(this.properties.text2);
    }
}

/* 
 * Set Text 3
 * @param text (String) - textual content of text area
 * @return void
 */
Dialog3Ctrl.prototype.setText3 = function(text)
{
    if (this._validateTextNum(3))
    {
        this._text3.innerText = text;
        if (this.properties.contentStyle == "style19")
        {
            this._setWrapClass(this._text3);
        }
    }
}

/* 
 * Set Text 3 Id
 * @param textId (String) - stringId of the text
 * @param textSubMap (Object) - submap for dynamic text
 * @return void
 */
Dialog3Ctrl.prototype.setText3Id = function(textId, textSubMap)
{
    if (this._validateTextNum(3))
    {
        this.properties.text3 = framework.localize.getLocStr(this.uiaId, textId, textSubMap);
        this.setText3(this.properties.text3);
    }
}

/* 
 * Set Text 4
 * @param text (String) - textual content of text area
 * @return void
 */
Dialog3Ctrl.prototype.setText4 = function(text)
{
    if (this._validateTextNum(4))
    {
        if (this.properties.contentStyle == "style18" || this.properties.contentStyle == "style19")
        {
            this._text4.innerText = text;
            this._setWrapClass(this._text4);
        }
    }
}

/* 
 * Set Text 4 Id
 * @param textId (String) - stringId of the text
 * @param textSubMap (Object) - submap for dynamic text
 * @return void
 */
Dialog3Ctrl.prototype.setText4Id = function(textId, textSubMap)
{
    if (this._validateTextNum(4))
    {
        this.properties.text4 = framework.localize.getLocStr(this.uiaId, textId, textSubMap);
        this.setText4(this.properties.text4);
    }
}

/* 
 * Set Text 5
 * @param text (String) - textual content of text area
 * @return void
 */
Dialog3Ctrl.prototype.setText5 = function(text)
{
    if (this._validateTextNum(5))
    {
        if (this.properties.contentStyle == "style19")
        {
            this._text5.innerText = text;
            this._setWrapClass(this._text5);
        }
    }
}

/* 
 * Set Text 5 Id
 * @param textId (String) - stringId of the text
 * @param textSubMap (Object) - submap for dynamic text
 * @return void
 */
Dialog3Ctrl.prototype.setText5Id = function(textId, textSubMap)
{
    if (this._validateTextNum(5))
    {
        this.properties.text5 = framework.localize.getLocStr(this.uiaId, textId, textSubMap);
        this.setText5(this.properties.text5);
    }
}

/* 
 * Set Text 6
 * @param text (String) - textual content of text area
 * @return void
 */
Dialog3Ctrl.prototype.setText6 = function(text)
{
    if (this._validateTextNum(6))
    {
        if (this.properties.contentStyle == "style19")
        {
            this._text6.innerText = text;
            this._setWrapClass(this._text6);
        }
    }
}

/* 
 * Set Text 6 Id
 * @param textId (String) - stringId of the text
 * @param textSubMap (Object) - submap for dynamic text
 * @return void
 */
Dialog3Ctrl.prototype.setText6Id = function(textId, textSubMap)
{
    if (this._validateTextNum(6))
    {
        this.properties.text6 = framework.localize.getLocStr(this.uiaId, textId, textSubMap);
        this.setText6(this.properties.text6);
    }
}

/* 
 * Set Text 7
 * @param text (String) - textual content of text area
 * @return void
 */
Dialog3Ctrl.prototype.setText7 = function(text)
{
    if (this._validateTextNum(7))
    {
        if (this.properties.contentStyle == "style19")
        {
            this._text7.innerText = text;
            this._setWrapClass(this._text7);
        }
    }
}

/* 
 * Set Text 7 Id
 * @param textId (String) - stringId of the text
 * @param textSubMap (Object) - submap for dynamic text
 * @return void
 */
Dialog3Ctrl.prototype.setText7Id = function(textId, textSubMap)
{
    if (this._validateTextNum(7))
    {
        this.properties.text7 = framework.localize.getLocStr(this.uiaId, textId, textSubMap);
        this.setText7(this.properties.text7);
    }
}

/* 
 * Set Text 8
 * @param text (String) - textual content of text area
 * @return void
 */
Dialog3Ctrl.prototype.setText8 = function(text)
{
    if (this._validateTextNum(8))
    {
        if (this.properties.contentStyle == "style19")
        {
            this._text8.innerText = text;
            this._setWrapClass(this._text8);
        }
    }
}

/* 
 * Set Text 8 Id
 * @param textId (String) - stringId of the text
 * @param textSubMap (Object) - submap for dynamic text
 * @return void
 */
Dialog3Ctrl.prototype.setText8Id = function(textId, textSubMap)
{
    if (this._validateTextNum(8))
    {
        this.properties.text8 = framework.localize.getLocStr(this.uiaId, textId, textSubMap);
        this.setText8(this.properties.text8);
    }
}

/* 
 * Set Text 9
 * @param text (String) - textual content of text area
 * @return void
 */
Dialog3Ctrl.prototype.setText9 = function(text)
{
    if (this._validateTextNum(9))
    {
        if (this.properties.contentStyle == "style19")
        {
            this._text9.innerText = text;
            this._setWrapClass(this._text9);
        }
    }
}

/* 
 * Set Text 9 Id
 * @param textId (String) - stringId of the text
 * @param textSubMap (Object) - submap for dynamic text
 * @return void
 */
Dialog3Ctrl.prototype.setText9Id = function(textId, textSubMap)
{
    if (this._validateTextNum(9))
    {
        this.properties.text9 = framework.localize.getLocStr(this.uiaId, textId, textSubMap);
        this.setText9(this.properties.text9);
    }
}

/* 
 * Set Text 10
 * @param text (String) - textual content of text area
 * @return void
 */
Dialog3Ctrl.prototype.setText10 = function(text)
{
    if (this._validateTextNum(10))
    {
        if (this.properties.contentStyle == "style19")
        {
            this._text10.innerText = text;
            this._setWrapClass(this._text10);
        }
    }
}

/* 
 * Set Text 10 Id
 * @param textId (String) - stringId of the text
 * @param textSubMap (Object) - submap for dynamic text
 * @return void
 */
Dialog3Ctrl.prototype.setText10Id = function(textId, textSubMap)
{
    if (this._validateTextNum(10))
    {
        this.properties.text10 = framework.localize.getLocStr(this.uiaId, textId, textSubMap);
        this.setText10(this.properties.text10);
    }
}

/*
 * Helper function. Validates whether the text number can be set in the current style.
 * @param   num (Number) - The text or text ID number to validate
 * @return  Boolean True if the text is supported by the current style
 */
Dialog3Ctrl.prototype._validateTextNum = function(num)
{
    var valid = false;
    var currStyle = this.properties.contentStyle;
    
    if (num < 1 || num > 10)
    {
        log.error("Text number provided is outside range of 1 - 10");
        return false;
    }
    
    switch (currStyle)
    {
        case "style01": // intentional fallthrough.
        case "style06":
        case "style07":
        case "style08":
        case "style12":
        case "style15":
            // deprecated
            break;
        case "style09": // This style does not support text
            valid = false;
            break;
        case "style02": // intentional fallthrough. These styles support text 1 only
        case "style10":
        case "style14":
        case "style20":
            if (num == 1)
            {
                valid = true;
            }
            break;
        case "style03": // intentional fallthrough. These styles support text 1 - 2
        case "style04":
        case "style05":
        case "style11":
        case "style13":
        case "style16":
            if (num <= 2)
            {
                valid = true;
            }
            break;
        case "style17": // This style supports text 1 - 3
        case "style22":
        case "style23":
            if (num <= 3)
            {
                valid = true;
            }
            break;
        case "style18": // This style supports text 1 - 4
            if (num <= 4)
            {
                valid = true;
            }
            break;
        case "style19": // This style supports text 1 - 10
            if (num <= 10)
            {
                valid = true;
            }
            break;
        default:
            log.error("Cannot validate text for unknown style: " + currStyle);
            return false;
            break;
    }
    
    if (valid == false)
    {
        log.warn("Dialog3Ctrl: text" + num + " is not supported by the current contentStyle: " + currStyle);
    }
    
    return valid;
}

/* 
 * Set image path 1
 * @param imagePath (String) - content image path
 * @return void
 */
Dialog3Ctrl.prototype.setImagePath1 = function(imagePath)
{
    this._imagePath1.style.backgroundImage = "url(" + imagePath + ")";
}

/* 
 * Set image path 2
 * @param imagePath (String) - content image path
 * @return void
 */
Dialog3Ctrl.prototype.setImagePath2 = function(imagePath)
{
    this._imagePath2.style.backgroundImage = "url(" + imagePath + ")";
}

/* 
 * Set Input Mode
 * @param mode (String) - input mode for event handling
 * @return void
 */
Dialog3Ctrl.prototype._setInputMode = function(mode)
{
    this._inputMode = mode;

    switch (mode)
    {
        case "controllerActive":
            // Enable highlight
            break;
        case "touchActive":
            // Hide highlight
            break;
        default:
            // invalid option
            break;
    }
}

Dialog3Ctrl.prototype._getNextValidIndex = function(direction)
{
    log.debug("Dialog3Ctrl: _getNextValidIndex()", direction);

    var currentIndex = this._buttonSelectIndex;
    
    // Determine which row we are in
    var start = 0;
    var end = (this._buttonCount - 1);    
    var buttonIndex;
    var nextValid = null;
   
   if(direction == "right")
    {
        buttonIndex = start;
        for(var i=start;i<=end;i++)
        {
            if(buttonIndex == (currentIndex + 1))
            {
                // Found match
                
                if(this["buttonCtrl_" + buttonIndex].isEnabled == false){
                    // skip
                    currentIndex++;
                    
                    if(currentIndex > end){
                        // There is no next valid to the right
                        break;
                    }
                    else
                    {
                        // Check next button...
                    }
                }
                else
                {
                    nextValid = buttonIndex;
                    break;
                }
            }
            else
            {
                // Keep checking
            }
            buttonIndex++;
        }
    }
    
    if(direction == "left")
    {
        buttonIndex = end;
        
        for(var i = end; i >= start; i--)
        {
            if(buttonIndex == (currentIndex - 1))
            {
                // Check for disabled button
                if(this["buttonCtrl_" + buttonIndex].isEnabled == false)
                {
                    // Cannot be selected. Skip.
                    currentIndex--;

                    // Keep checking...
                }
                else
                {
                    // Button can be selected. Choose.
                    nextValid = buttonIndex;
                    break;
                }
            }
            else
            {
                // Keep checking...
            }
            
            buttonIndex--;
        }
    }
    
    return nextValid;
}

Dialog3Ctrl.prototype._buttonMoveHelper = function(direction)
{
    log.debug("Dialog3Ctrl: _buttonMoveHelper() ", direction);
    
    var response = "consumed";
    
    // Set currently selected button as previously selected button
    this._prevButtonIndex = this._buttonSelectIndex;
    
    if(direction == "right")
    {
        // Check for next valid button index to the right...
        var nextValidIndex = this._getNextValidIndex("right");
        
        if((this._prevButtonIndex + 1) <= (this._buttonCount - 1) && nextValidIndex != null)
        {
            // Found a valid index
            this._buttonSelectIndex = nextValidIndex;
            
            // Deselect previous button
            var prevBtnResponse = this["buttonCtrl_" + this._prevButtonIndex].handleControllerEvent("lostFocus");

            // Select new button
            response = this["buttonCtrl_" + this._buttonSelectIndex].handleControllerEvent("acceptFocusInit");
        }
        else
        {
            // There is no further to go. Do nothing.
            response = "ignored";
        }
    }
    else if(direction == "left")
    {
        // Check for next valid button index to the left...
        var nextValidIndex = this._getNextValidIndex("left");                
        if((this._prevButtonIndex - 1) >= 0 && nextValidIndex != null)
        {
            this._buttonSelectIndex = nextValidIndex;
            
            // Deselect previous button
            var prevBtnResponse = this["buttonCtrl_" + this._prevButtonIndex].handleControllerEvent("lostFocus");

            // Select new button
            response = this["buttonCtrl_" + this._buttonSelectIndex].handleControllerEvent("acceptFocusInit");
        }
        else
        {
            // There is no further to go. Do nothing.
            response = "ignored";
        }
    }
    else
    {
        log.warn("Dialog3Ctrl: _buttonMoveHelper() only accepts \'left\' or \'right\' as a parameter.");
        response = "ignored";
    }
    
    return response;
}

/* 
 * Handle Multicontroller event
 * @param eventId (String) - eventId comming from the multicontroller module
 * @return (String) - consumed status of the event
 */
Dialog3Ctrl.prototype.handleControllerEvent = function(eventId)
{    
    var response = "";

    switch (eventId)
    {
        case "touchActive":
            // input mode change to touch
            this._setInputMode(eventId);
            response = "consumed";
            break;
            
        case "controllerActive":
            // input mode change to multicontroller
            // otherwise handle it here
            this._setInputMode(eventId);
            response = "consumed";
            break;
            
        case "cw":
            // Go to next valid button
            response = this._buttonMoveHelper("right");
            break;
        case "ccw":
            // Go to next valid button
            response = this._buttonMoveHelper("left");
            break;
            
        case "selectStart":
        case "select":
            if (this._buttonCount > 0)
            {
                // Ignore first select if in touch mode
                if (this._inputMode != "touchActive")
                {
                    // Fire selectCallback for currently selected button
                    this['buttonCtrl_' + this._buttonSelectIndex].handleControllerEvent(eventId);
                }
            }            
            response = "consumed";          
            break;          
        case "left":
            // Tilt Left
            // the event is consumed by the buttons
            // Go to next valid button
            response = this._buttonMoveHelper("left");
            break;                     
        case "right":
            // Tilt Right            
            // the event is consumed by the buttons
            // Go to next valid button
            response = this._buttonMoveHelper("right");
            break;            
        case "up":
            // Tilt Up
            response = "giveFocusUp";
            break;
        case "down":
            // Tilt Down
            response = "giveFocusDown";
            break;
        case "lostFocus":
            if (this._buttonCount > 0)
            {
                response = this['buttonCtrl_' + this._buttonSelectIndex].handleControllerEvent("lostFocus");
            }
            break;
        default:
            // No action
            response = "ignored";
            break;
    }
    
    return response;
}

/* 
 * Button Select Callback
 * @param ctrlRef (DialogBtnControl) - reference to the clicked button
 * @param btnData (Object) - appData (set by the app) to be passed in the callback
 * @param btnParams (Object) - any additional params to be passed in the callback 
 * @return void
 */
Dialog3Ctrl.prototype._buttonSelectCallback = function(ctrlRef, btnData, btnParams)
{
    // ctrlRef, here, is reference to button
    // replace (on outgoing call to app) with reference to this control
    log.debug("_buttonSelectCallback called...");
    log.debug("   btnData.hashId: " + btnData.hashId);
    log.debug("   btnData.originalAppData: " + btnData.originalAppData);
    
    var params = {
        "buttonId": btnData.hashId,
        "buttonIndex": btnData.buttonIndex
    };
    
    if (typeof(this.properties.buttonConfig[btnData.hashId].selectCallback) == "function")
    {
        // Specific callback
        this.properties.buttonConfig[btnData.hashId].selectCallback(this, btnData.originalAppData, params);
    }
    else if (typeof this.properties.defaultSelectCallback == 'function')
    {
        // Use default
        this.properties.defaultSelectCallback(this, btnData.originalAppData, params);
    }    
}

/* 
 * Button Select Callback
 * @param ctrlRef (DialogBtnControl) - reference to the clicked button
 * @param btnData (Object) - appData (set by the app) to be passed in the callback
 * @param btnParams (Object) - any additional params to be passed in the callback 
 * @return void
 */
Dialog3Ctrl.prototype._buttonFocusedCallback = function(ctrlRef, btnData, btnParams)
{
    if (btnParams.focusStolen == true)
    {
        // move focused button index
        this._buttonSelectIndex = btnData.buttonIndex;
    }
}

Dialog3Ctrl.prototype.getContextCapture = function()
{
    log.debug("Dialog3Ctrl: getContextCapture() called...");
    // Return controlContextCapture
    //@formatter:off
    var controlContextCapture = {
        "focusedButton" : this._buttonSelectIndex
    };
    //@formatter:on
    
    return controlContextCapture;
}

Dialog3Ctrl.prototype.restoreContext = function(controlContextCapture)
{
    log.debug("Dialog3Ctrl: restoreContext() ", controlContextCapture);
    // TODO: Once transitions notifications exist, focus should
    // wait to be set until notification is received.
    
    if (this._buttonCount > 0)
    {
        // Store any current button index
        this._prevButtonIndex = this._buttonSelectIndex;
        
        // Get previous button index
        this._buttonSelectIndex = controlContextCapture.focusedButton;
        
        if (this._prevButtonIndex != this._buttonSelectIndex)
        {
            // Remove focus        
            this["buttonCtrl_" + this._prevButtonIndex].handleControllerEvent("lostFocus");
        }
        
        // Set focus 
        this["buttonCtrl_" + this._buttonSelectIndex].handleControllerEvent("acceptFocusInit");
    }
}

Dialog3Ctrl.prototype.finishPartialActivity = function()
{
    if (this._buttonCount > 0)
    {
        for (var i=0;i<this._buttonCount;i++)
        {
            this["buttonCtrl_" + i].finishPartialActivity();
        }
    }
}

/* 
 * Garbage collection
 * @return void
 */
Dialog3Ctrl.prototype.cleanUp = function()
{
    for(var i = 0; i < this._buttonCount; i++)
    {
        this["buttonCtrl_" + i].cleanUp();
    }
}

// Register with the framework
framework.registerCtrlLoaded("Dialog3Ctrl");
