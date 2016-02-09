/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: GuiConfig.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: aganesar
 Date: 09.07.2012
 __________________________________________________________________________

 Description:

 Revisions:
 v0.1 - New Gui Config logic 
 v0.2 (21-Sept-2012) Added automatic IP logic for board HTTP server and improved commenting -awoodhc
 v0.3 (26-Sept-2012) Added static surface IDs -avorotp 
 v0.4 (26-Sept-2012) Added DBAPI socket - aganesar
 v0.5 (03-Dec-2012) Added config param for ignoring dictionary load failure - aganesar
 __________________________________________________________________________

 */

/*
 * Constructor. 
 */
function GuiConfig()
{       
    // Below are the config parameters for GUI
    
    //----------- BEGIN CONFIG OPTIONS -------------//
     
    /* 
     * Should always be FALSE when checking into Dimensions and when integrating GUI with MMUI
     * Setting debugMode to false will disable all Test.js files (fake MMUI messages will not occur)
     */ 
    this.debugMode = true;
    
    /*
     * Should always be FALSE when checking into Dimensions
     * Setting testMode to true will enable the GUI's local auto-testing framework (e.g. JasmineManager) and related files
     */
    this.testMode = false;
    
    /*
     * Should always be FALSE when checking into Dimensions.
     * If true, Opera will ask for a board IP address when it first loads. This is useful for running the GUI on PC, while
     * connected to the Target. (not available in debugMode)
     */ 
    this.promptForIp = false;
    
    /*
     * Should always be FALSE when checking into Dimensions.
     * Having it TRUE during development helps see the message exchange between GUI and MMUI on the debug panel 
     * Setting debugPanelEnabled to false will disable the right-side debug panel and freeze its log messages.
     * This does NOT disable Test.js files.
     */
    this.debugPanelEnabled = true;    
    
    /*
     * Should always be FALSE when checking into Dimensions.
     * Setting to true will display the GUI Framework's current context as a named label on screen.
     */
    this.screenNameLabelEnabled = true; 
    
    /*
     * Set to TRUE or FALSE based on the need. 
     * If TRUE disables all GUI console logs.
     */
    this.disableLogs = false;
    
    /*
     * Set to TRUE or FALSE based on preference.
     * Set to TRUE to show an alert (wink) in the DOM when a framework state timeout error occurs
     */
    this.showFrameworkErrorAlerts = false;
    
    /*
     * Set to TRUE for logging in PC browser, FALSE in Target hardware
     * PC Logging displays console lines in a different format than Target logging
     */
    this.pcLogging = true;
    
     /*
     * If TRUE GUI will not return error if few language dictionaries failed to load and vice-versa when FALSE     
     */
    this.ignoreDictsFailure = true;
    
    /*
     * If TRUE GUI will display language codes next to missing String IDs (e.g. "en_US:") to indicate a failure
     */
    this.showStringIdFailure = false;
    
    
    /*
     * When checking in, always set IP to 127.0.0.1
     * The IP address will be used when the httpserver is not available. 127.0.0.1 is localhost.
     * If debugMode is false while on PC, this can be set to the IP of the Target to connect to the board, or
     * this.promptForIp can be set to true and the browser will prompt for the address.
     */
    var defaultIpAddress = "127.0.0.1";
    
    //----------- END CONFIG OPTIONS -------------//
    
    
    //----------- BEGIN COMMON STYLE OPTIONS -------------//
    
    this.winkTimeout = 3000; // (Number) milliseconds a Wink will stay on screen
    
    //----------- END COMMON STYLE OPTIONS -------------//
    
        
    
    //----------- DO NOT EDIT BELOW THIS LINE -------------//
    
    
    // Test the url of the document. If it is an http host, use the ip, otherwise use localhost
    var reg = new RegExp("http://([^/:]+)")
    var m = reg.exec(document.URL)
    var ip = (null != m ? m[1] : defaultIpAddress);
    
    // If ip is local and not in debugMode, prompt to connect to board
    if (this.promptForIp && !this.debugMode)
    {
        ip = prompt("Enter Target IP:","10.6.xxx.xxx");
    }
    
    this.appsdkSocket = {"uri": "ws://" + ip +":2800", "protocol": "ihu-appsdk-protocol"};
    
    this.mmuiSocket = {"uri": "ws://" + ip +":2700", "protocol": "ihu-guiifm-protocol"};   
    
    this.dbapiSocket = {"uri": "ws://" + ip +":2766", "protocol": "ihu-dbapi-protocol"};     
}

/*
 * Called by developer_mode_GuiConfig.js when that file is copied into a special directory
 * by developer_mode.sh
 */
GuiConfig.prototype._setDeveloperMode = function(flag)
{
    if (flag)
    {
        this.screenNameLabelEnabled = true;
        this.showFrameworkErrorAlerts = true;
        this.showStringIdFailure = true;
    }
    else
    {
        this.screenNameLabelEnabled = false;
        this.showFrameworkErrorAlerts = false;
        this.showStringIdFailure = false;
    }
}

// Global object. This file needs to instantiate itself so that it is
// immediately accessable to other files that are loaded.
var guiConfig = new GuiConfig();