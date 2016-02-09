/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: btaudioApp.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author:
 Date:
 __________________________________________________________________________

 Description: IHU GUI BT Audio App

 Revisions:
 v0.1 (30-Jun-2012) btaudioApp created for initial testing of active panel content
 v0.2 (30-Jun-2012) updated btaudio for new debug system. Added btaudioAppTest.js
 v0.3 (30-Jun-2012) filled out context data for full ListCtrl buttons -aganesar
 v0.4 (30-Jun-2012) Added dictionaires and functionality for Japanese -aganesar
 v0.5 (30-Jun-2012) Updated app standard functions.
 v0.6 (12-Sep-2012) Merged ump control changes as per SCR - SCR00098475.
 v0.7 (30-Oct-2012) Added nowplayingtmplt2 and done string changes - ajhalan
 v0.8 (12-Dec-2012) Icons are updated - ajhalan
 v0.9 (18-Jan-2013) Moved to NowPlaying3Tmplt & code corrections - aalangs
 v0.10 (18-Jan-2013) Moved to NowPlaying3Tmplt & code corrections - aalangs
 v0.11 (19-Feb-2013) Changes in file navigation browsing - avalajh
 v0.12 (12-Mar-2013) migration from List to List2 control- avalajh
 v0.13 (26-Mar-2013) Changes for ScanPlay ump visibility- avalajh
 v0.14 (23-April-2013) Clear the cached value - avalajh
 v0.15 (03-May-2013) New feature tooltip is implemented - avalajh
 v0.16 (17-May-2013) Updates are done for elapsed time - avalajh
 v0.17 (27-May-2013) Changes are done for GoBack - avalajh
 v0.18 (11-June-2013) Changes for timer and device name - avalajh
 v0.19 (17-June-2013) Changes are made for scrolling purpose in needdatacallback - avalajh
 v0.20 (18-June-2013) Changes for elapsed time and VUI support - avalajh
 v0.21 (23-July-2013) Made changes in file navigation context for highlight issue - avalajh
 v0.22 (27-July-2013) Changes are done when subItemCount is 0 - avalajh
 v0.23 (31-July-2013) Changes are made for Shuffle state and root menu - avalajh
 v0.24 (8-Aug-2013) Icons are change - avalajh
 v0.25 (16-Aug-2013) Removed NoDevice context - avalajh
 v0.26 (22-Aug-2013) Unknown will display when itemlabel will be blank - avalajh
 v0.27 (24-Aug-2013) Title/menu up is set in current folder message - avalajh
 v0.28 (30-Aug-2013) Remove check before calling api folderItem - avalajh
 v0.29 (10-Sept-2013) Changes in request chunk size in needdata callback - avalajh
 v0.30 (12-Sept-2013) Replace stringId for Root Menu string - avalajh
 v0.31 (17-Sept-2013) Made changes in file navigation to dispaly cached data - avalajh
                      Change the state of Scan Play state of Group - avalajh
 v0.32 (4-Oct-2013)   Setting datalist also when subitemCount is 0 so that no line number will display on blank screen - avalajh
 v0.33 (11-Oct-2013)  Introducing progress bar - avalajh
 v0.34 (13-Nov-2013)  Changes for blank screen on scroll - avalajh
 v0.35 (25-Nov-2013)  Retain the state of Repeat/Shuffle/Scan - avalajh
 v0.36 (20-Dec-2013)  Made changes in file navigation context, clearing list at every point - avalajh
 v0.37 (7-Jan-2014)   Made changes for left button style - avalajh
 v0.38 (10-Jan-2014)  Made changes for blank items - avalajh
 v0.39 (28-Mar-2014)  Changes are made for progress bar resetting - avalajh
 v0.40 (4-April-2014) Remove context in function of AVRCP13/14 - avalajh
 v0.41 (2-June-2014)  Changes are done for ump - shuffle,repeat and scan - avalajh
                      Goback scenarios for file navigation ump - avalajh
 v0.42 (2-July-2014)  Changes done for elapsed time display -adialac
 v0.43 (8-Aug-2014)   Changes are made in needdatacallback to reduce the request to MMUI -avalajh
 v0.44 (26-Sep-2014)  Changes done for progress bar.
 v0.45 (13-Oct-2014)  Changes done for progress bar and value of this._enteredelapsedtimehandler. - avalajh
 v0.46 (10-Nov-2014)  Changes done for sbNameId in File Navigation - avalajh
 v0.47 (12-Nov-2014)  Porting SCR SW00157870 - avalajh
 
 (27-Nov-2014)  Called _resetFileNavigationVar() in contextOut of fineNavigation in place of ready of messageResponse. need to check if it works
 (28-Nov-2014)  Changes are done for SCR SW00159594 with change in text1Id for typeE sbn.(_Sbn_ObjectInfoMsgHandler)
 
 __________________________________________________________________________

 */
log.addSrcFile("btaudioApp.js", "btaudio");

/*******************************************************************************
 * Start of Base App Implementation
 *
 * Code in this section should not be modified except for function names based
 * on the appname
 ******************************************************************************/

function btaudioApp(uiaId)
{
    log.debug("constructor called...");

    // Base application functionality is provided in a common location via this
    // call to baseApp.init().
    // See framework/js/BaseApp.js for details.
    baseApp.init(this, uiaId);

    // All feature-specific initialization is done in appInit()
}

/*******************************************************************************
 * Standard App Functions *
 ******************************************************************************/
/*
 * Called just after the app is instantiated by framework.
 */
btaudioApp.prototype.appInit = function()
{
    log.debug(" btaudioApp appInit  called...");

    if (framework.debugMode)
    {
        utility.loadScript("apps/btaudio/test/btaudioAppTest.js");
    }


    this._leftButtonStyle = "goBack";

    this._cachedSliderValue = 0.0;

    this._cachedRandomCapability = false;
    this._cachedRepeatCapability = false;
    this._cachedScanCapability = false;
    this._cachedRandomState = "Off";
    this._cachedRepeatState = "None";
    this._cachedScanState = "Unsel";

    this._cachedSongDetails = {};
    this._playerState = "PLAYING";
    this._scanPlayState = null;
    this._cachedFolderName  = "";
    this._cachedFolderItem = null;
    this._cachedScreenTitle = null;
    this._cachedDeviceCapability = null;
    this._lineNumber = null;
    
    /* For new implementation of File Navigation */
    this._subItemCount = 0;
    this._requestChunkSize = 25; // Chunk Size request from MMUI.
    this._offset = 0;
    this._actualDataCount = 0;
    this._min = -1;
    this._sec = -1;
	this._enteredelapsedtimehandler = 0;

    this._shuffleState = "Off";
    this._repeatState = "None";
    this._scanState = "Unsel";
    
    var slideCallback = this._slideCallback.bind(this);
    this._min1 = 0; // Minutes for total time
    this._sec1 = 0; // Seconds for total time    
    this._cachedIndex = -2;  // Compare index coming from MMUI in file navigation context
    
    this._temp = true; // At a time of goback scenario
    this._focusLost = false; // At a time of goback scenario
    this._SupportedSettings = null; // For ump
    //A2DP Button configuration
    this._umpButtonConfigA2DP = new Object();
    // Default config
    // @formatter:off
    //umpButtonConfig for buttons

    this._umpButtonConfigA2DP["SelectSource"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpEntMenu",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectSource",
        selectCallback: this._umpDefaultSelectCallback.bind(this)
    };
    this._umpButtonConfigA2DP["Play/Pause"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpPlayPause",
        currentState:"Play",
        stateArray: [
            {
                state:"Play", label:null, labelId:null
            },
            {
                state:"Pause", label:null, labelId:null
            },

        ],
        disabled : false,
        buttonClass : "normal",
        appData : "Play/Pause",
        selectCallback: this._umpDefaultSelectCallback.bind(this)
    };    
    this._umpButtonConfigA2DP["SelectSettings"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpEqualizer",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectSettings",
        selectCallback: this._umpDefaultSelectCallback.bind(this)
    };
    
    this._umpButtonConfig1 =
    {
        hasScrubber                 : false,
        retracted                   : false,
        tooltipsEnabled             : true,
        defaultSelectCallback       : this._umpDefaultSelectCallback.bind(this),
        defaultHoldStartCallback    : this._umpDefaultHoldStartCallback.bind(this),
        defaultHoldStopCallback     : this._umpDefaultHoldStopCallback.bind(this),
        defaultSlideCallback        : this._umpDefaultSlideCallback.bind(this),
        buttonConfig                : this._umpButtonConfigA2DP,
        scrubberConfig              : {},     
    };    

    // Ump For AVRCP10
    this._umpButtonConfigAVRCP10 = new Object();
    this._scrubberAVRCP10 = {
            "scrubberStyle": "Style03",
            "mode" : "slider",
            "slideCallback" : this._slideCallback.bind(this),
            "minChangeInterval" : 250,
            "settleTime": 1000,
            "min" : 0.0,
            "max" : 1.0,
            "increment" : 0.01,
            "hasActiveState" : true,
            "value" : 0,        
            "appData" : null,
            "disabled" : false,
            "buffering" : false
        };  
    
    this._umpButtonConfigAVRCP10["SelectSource"] =
    {
            buttonBehavior : "shortPressOnly",
            imageBase : "IcnUmpEntMenu",
            disabled : false,
            buttonClass : "normal",
            appData : "SelectSource",
            selectCallback: this._umpDefaultSelectCallback.bind(this)
    };
    this._umpButtonConfigAVRCP10["Global.Previous"] =
    {
        buttonBehavior : "shortAndHold",
        imageBase : "IcnUmpPreviousAudio",
        disabled : false,
        buttonClass : "normal",
        appData : "Global.Previous",
        selectCallback: this._umpDefaultSelectCallback.bind(this)
    };
    this._umpButtonConfigAVRCP10["Play/Pause"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpPlayPause",
        currentState:"Play",
        stateArray: [
            {
                state:"Play", label:null, labelId:null
            },
            {
                state:"Pause", label:null, labelId:null
            },

        ],
        disabled : false,
        buttonClass : "normal",
        appData : "Play/Pause",
        selectCallback: this._umpDefaultSelectCallback.bind(this)
    };  
    this._umpButtonConfigAVRCP10["Global.Next"] =
    {
        buttonBehavior : "shortAndHold",
        imageBase : "IcnUmpNextAudio",
        disabled : false,
        buttonClass : "normal",
        appData : "Global.Next",
        selectCallback: this._umpDefaultSelectCallback.bind(this)
    };
    this._umpButtonConfigAVRCP10["SelectSettings"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpEqualizer",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectSettings",
        selectCallback: this._umpDefaultSelectCallback.bind(this)
    };
    
    this._umpButtonConfig2 =
    {
        hasScrubber                 : false,
        retracted                   : false,
        tooltipsEnabled             : true,
        defaultSelectCallback       : this._umpDefaultSelectCallback.bind(this),
        defaultHoldStartCallback    : this._umpDefaultHoldStartCallback.bind(this),
        defaultHoldStopCallback     : this._umpDefaultHoldStopCallback.bind(this),
        defaultSlideCallback        : this._umpDefaultSlideCallback.bind(this),
        buttonConfig                : this._umpButtonConfigAVRCP10,
        scrubberConfig              : this._scrubberAVRCP10,     
    };

    // Ump for AVRCP13
    this._umpButtonConfigAVRCP13 = new Object();
    // @formatter:off    
    this._scrubberAVRCP13 = {
            "scrubberStyle": "Style01",
            "mode" : "progress",
            "slideCallback" : this._slideCallback.bind(this),
            "minChangeInterval" : 250,
            "settleTime": 1000,
            "min" : 0.0,
            "max" : 1.0,
            "increment" : 0.01,
            "hasActiveState" : true,
            "value" : 0,        
            "appData" : null,
            "disabled" : false,
            "buffering" : false
        };   
    
    this._umpButtonConfigAVRCP13["SelectSource"] =
    {
            buttonBehavior : "shortPressOnly",
            imageBase : "IcnUmpEntMenu",
            disabled : false,
            buttonClass : "normal",
            appData : "SelectSource",
            selectCallback: this._umpDefaultSelectCallback.bind(this)
    };
    this._umpButtonConfigAVRCP13["ToggleRepeat"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpRepeat",
        currentState:"None",
        stateArray: [
            {
                state:"None",  label: null, labelId: null
            },
            {
                state:"Song",  label: null, labelId: null
            },
            {
                state:"List", label: null, labelId: null
            }
        ],
        disabled : null,
        appData:"ToggleRepeat",
        selectCallback: this._umpDefaultSelectCallback.bind(this)
    };
    this._umpButtonConfigAVRCP13["ToggleShuffle"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpShuffle",
        currentState:"Off",
        stateArray: [
            {
                state:"Off", label:null, labelId:null
            },
            {
                state:"Folder",label:null, labelId:null
            },
            {
                state:"On",  label:null, labelId:null
            }
        ],
        disabled : false,
        appData:"ToggleShuffle",
        selectCallback: this._umpDefaultSelectCallback.bind(this)
    };
    this._umpButtonConfigAVRCP13["ScanPlay"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase :  "IcnUmpScan",
        currentState:"Unsel",
        stateArray: [
            {
                state:"Unsel", label:null, labelId:null
            },
            {
                state:"Sel",  label:null, labelId:null
            },
            {
                state:"Folder", label:null, labelId:null
            },
        ],

        disabled : false,
        buttonClass : "normal",
        appData : "ScanPlay",
        selectCallback: this._umpDefaultSelectCallback.bind(this)
    };
    
    this._umpButtonConfigAVRCP13["Global.Previous"] =
    {
        buttonBehavior : "shortAndHold",
        imageBase : "IcnUmpPreviousAudio",
        disabled : false,
        buttonClass : "normal",
        appData : "Global.Previous",
        selectCallback: this._umpDefaultSelectCallback.bind(this)
    };
    this._umpButtonConfigAVRCP13["Play/Pause"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase :  "IcnUmpPlayPause",
        currentState:"Play",
        stateArray: [
            {
                state:"Play", label:null, labelId:null
            },
            {
                state:"Pause",  label:null, labelId:null
            },
        ],
        disabled : false,
        buttonClass : "normal",
        appData : "Play/Pause",
        selectCallback: this._umpDefaultSelectCallback.bind(this)
    };
    this._umpButtonConfigAVRCP13["Global.Next"] =
    {
        buttonBehavior : "shortAndHold",
        imageBase : "IcnUmpNextAudio",
        disabled : false,
        buttonClass : "normal",
        appData : "Global.Next",
        selectCallback: this._umpDefaultSelectCallback.bind(this)
    };
    this._umpButtonConfigAVRCP13["SelectSettings"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpEqualizer",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectSettings",
        selectCallback: this._umpDefaultSelectCallback.bind(this)
    };
    
    this._umpButtonConfig3 =
    {
        hasScrubber                 : true,
        retracted                   : false,
        tooltipsEnabled             : true,
        defaultSelectCallback       : this._umpDefaultSelectCallback.bind(this),
        defaultHoldStartCallback    : this._umpDefaultHoldStartCallback.bind(this),
        defaultHoldStopCallback     : this._umpDefaultHoldStopCallback.bind(this),
        defaultSlideCallback        : this._umpDefaultSlideCallback.bind(this),
        buttonConfig                : this._umpButtonConfigAVRCP13,
        scrubberConfig              : this._scrubberAVRCP13,     
    };
    
    
    
    this._umpButtonConfigAVRCP14 = new Object();

    this._scrubberAVRCP14 = {
            "scrubberStyle": "Style01",
            "mode" : "progress",
            "slideCallback" : this._slideCallback.bind(this),
            "minChangeInterval" : 250,
            "settleTime": 1000,
            "min" : 0.0,
            "max" : 1.0,
            "increment" : 0.01,
            "hasActiveState" : true,
            "value" : 0,        
            "appData" : null,
            "disabled" : false,
            "buffering" : false
        };
    
    this._umpButtonConfigAVRCP14["SelectSource"] =
    {
            buttonBehavior : "shortPressOnly",
            imageBase : "IcnUmpEntMenu",
            disabled : false,
            buttonClass : "normal",
            appData : "SelectSource",
            selectCallback: this._umpDefaultSelectCallback.bind(this)
    };
   this._umpButtonConfigAVRCP14["SelectRootMenu"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase :  "IcnUmpCurrentList",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectRootMenu",
        label : null,
        labelId : "TooltipRootMenu",
        selectCallback: this._umpDefaultSelectCallback.bind(this)
    };
   this._umpButtonConfigAVRCP14["ToggleRepeat"] =
   {
       buttonBehavior : "shortPressOnly",
       imageBase : "IcnUmpRepeat",
       currentState:"None",
       stateArray: [
           {
               state:"None",  label: null, labelId: null
           },
           {
               state:"Song",  label: null, labelId: null
           },
           {
               state:"List", label: null, labelId: null
           }
       ],
       disabled : null,
       appData:"ToggleRepeat",
       selectCallback: this._umpDefaultSelectCallback.bind(this)
   };
   this._umpButtonConfigAVRCP14["ToggleShuffle"] =
   {
       buttonBehavior : "shortPressOnly",
       imageBase : "IcnUmpShuffle",
       currentState:"Off",
       stateArray: [
           {
               state:"Off", label:null, labelId:null
           },
           {
               state:"Folder",label:null, labelId:null
           },
           {
               state:"On",  label:null, labelId:null
           }
       ],
       disabled : false,
       appData:"ToggleShuffle",
       selectCallback: this._umpDefaultSelectCallback.bind(this)
   };
   this._umpButtonConfigAVRCP14["ScanPlay"] =
   {
       buttonBehavior : "shortPressOnly",
       imageBase :  "IcnUmpScan",
       currentState:"Unsel",
       stateArray: [
           {
               state:"Unsel", label:null, labelId:null
           },
           {
               state:"Sel",  label:null, labelId:null
           },
           {
               state:"Folder", label:null, labelId:null
           },
       ],

       disabled : false,
       buttonClass : "normal",
       appData : "ScanPlay",
       selectCallback: this._umpDefaultSelectCallback.bind(this)
    };
    this._umpButtonConfigAVRCP14["Global.Previous"] =
    {
        buttonBehavior : "shortAndHold",
        imageBase : "IcnUmpPreviousAudio",
        disabled : false,
        buttonClass : "normal",
        appData : "Global.Previous",
        selectCallback: this._umpDefaultSelectCallback.bind(this)
    };
    this._umpButtonConfigAVRCP14["Play/Pause"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase :  "IcnUmpPlayPause",
        currentState:"Play",
        stateArray: [
            {
                state:"Play", label:null, labelId:null
            },
            {
                state:"Pause",  label:null, labelId:null
            },
        ],
        disabled : false,
        buttonClass : "normal",
        appData : "Play/Pause",
        selectCallback: this._umpDefaultSelectCallback.bind(this)
    };
    this._umpButtonConfigAVRCP14["Global.Next"] =
    {
        buttonBehavior : "shortAndHold",
        imageBase : "IcnUmpNextAudio",
        disabled : false,
        buttonClass : "normal",
        appData : "Global.Next",
        selectCallback: this._umpDefaultSelectCallback.bind(this)
    };
    this._umpButtonConfigAVRCP14["SelectSettings"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpEqualizer",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectSettings",
        selectCallback: this._umpDefaultSelectCallback.bind(this)
    };
    
    this._umpButtonConfig4 =
    {
        hasScrubber                 : true,
        retracted                   : false,
        tooltipsEnabled             : true,
        defaultSelectCallback       : this._umpDefaultSelectCallback.bind(this),
        defaultHoldStartCallback    : this._umpDefaultHoldStartCallback.bind(this),
        defaultHoldStopCallback     : this._umpDefaultHoldStopCallback.bind(this),
        defaultSlideCallback        : this._umpDefaultSlideCallback.bind(this),
        buttonConfig                : this._umpButtonConfigAVRCP14,
        scrubberConfig              : this._scrubberAVRCP14,     
    };    

    // For incoming call need to cache the data    
    this._cachedDataList = 
    {
            itemCountKnown : true,
            itemCount : 0,
            items : []
    }
    
    
    //End of button config
    // @formatter:on
    // @formatter:off
    this._contextTable =
    {
        "Disconnect" : {
            "template" : "Dialog3Tmplt",
            "controlProperties": {            
                 "Dialog3Ctrl" : {          
                    "defaultSelectCallback" : this._dialogCtrlClickCallback.bind(this),          
                    "contentStyle" : "style13",
                    "fullScreen" : false,
                    "buttonCount" : 1,
                    "buttonConfig" : {
                        "button1" : {                            
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            label: "common.Ok", 
                            labelId: "common.Ok", 
                            subMap : null,
                            appData : "Global.Yes",
                            disabled : false
                        },                       
                    }, // end of buttonConfig
                    text1Id : "Disconnect",                   
                } // end of properties for "DialogCtrl"      
            },//end of control properties
            "readyFunction" : this._DialogCtxtTmpltReadyToDisplay.bind(this)
        }, // end of "Disconnect"
        "FileNavigation" : {
            "template" : "List2Tmplt",
			"sbNameId"	: " ",
			"sbNameSubMap" : {"deviceName" : ""},
            "controlProperties" : {
                "List2Ctrl" : {
                    titleConfiguration : "listTitle", 
                    dataList : this._cachedDataList,
                    numberedList : true,
                    title : {
                        titleStyle : 'style02',
                    },
                    selectCallback : this._listItemClickCallback.bind(this),
                    needDataCallback : this._FileNavigationNeedDataCallback.bind(this),
                    enableSecondaryItemRequest : false,
                    enableItemRequestOnScroll : true,
                } // end of properties for "ListCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._FileNavigationCtxtTmpltReadyToDisplay.bind(this),
            "contextInFunction" : this._FileNavigationCtxtIn.bind(this),
            "displayedFunction" : null,
            "contextOutFunction" : this._FileNavigationCtxtOutFunction.bind(this)   
         }, // end of "FileNavigation"
        "DeviceUnsupported" : {
            "template" : "Dialog3Tmplt",
            "controlProperties" : {                
                 "Dialog3Ctrl" : {          
                    "defaultSelectCallback" : this._dialogCtrlClickCallback.bind(this),          
                    "contentStyle" : "style13",
                    "fullScreen" : false,
                    "buttonCount" : 2,
                    "buttonConfig" : {
                        "button1" : {                            
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            label: "common.Back", 
                            labelId: "common.Back", 
                            subMap : null,
                            appData : "Global.GoBack",
                            disabled : false
                        },  
                        "button2" : {                            
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            label: "common.Connect", 
                            labelId: "common.Connect", 
                            subMap : null,
                            appData : "Global.Setup",
                            disabled : false
                        },  
                    }, // end of buttonConfig
                    text1Id : "DeviceUnsupported",
                    text2Id : "DeviceUnsupportedDescription"
                } // end of properties for "DialogCtrl"        
            },
            "readyFunction" : this._DialogCtxtTmpltReadyToDisplay.bind(this)
        }, // end of "DeviceUnsupported"
        "MobileDeviceError" : {
            "template" : "Dialog3Tmplt",
            "controlProperties" : {            
                "Dialog3Ctrl" : {          
                    "defaultSelectCallback" : this._dialogCtrlClickCallback.bind(this),          
                    "contentStyle" : "style13",
                    "fullScreen" : false,
                    "buttonCount" : 1,
                    "buttonConfig" : {
                        "button1" : {                            
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            label: "common.Ok", 
                            labelId: "common.Ok", 
                            subMap : null,
                            appData : "Global.Yes",
                            disabled : false
                        },                       
                    }, // end of buttonConfig
                    text1Id : "MobileDeviceError",  
                    text2Id : "MobileDeviceErrorDescription",  
                } // end of properties for "DialogCtrl"                 
            },
            "readyFunction" : this._DialogCtxtTmpltReadyToDisplay.bind(this)
        }, // end of "MobileDeviceError"
        "SongUnsupported" : {
            "template" : "Dialog3Tmplt",
            "controlProperties" : {
                "Dialog3Ctrl" : {          
                    "defaultSelectCallback" : this._dialogCtrlClickCallback.bind(this),          
                    "contentStyle" : "style13",
                    "fullScreen" : false,
                    "buttonCount" : 1,
                    "buttonConfig" : {
                        "button1" : {                            
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            label: "common.Ok", 
                            labelId: "common.Ok", 
                            subMap : null,
                            appData : "Global.Yes",
                            disabled : false
                        },                       
                    }, // end of buttonConfig
                    text1Id : "SongUnsupported",                    
                } // end of properties for "DialogCtrl"         
            },
            "readyFunction" : this._DialogCtxtTmpltReadyToDisplay.bind(this)
        }, // end of "SongUnsupported"
        "BrowsingUnsupported" :{
            "template" : "Dialog3Tmplt",
            "controlProperties" : {              
                "Dialog3Ctrl" : {          
                    "defaultSelectCallback" : this._dialogCtrlClickCallback.bind(this),          
                    "contentStyle" : "style13",
                    "fullScreen" : false,
                    "buttonCount" : 1,
                    "buttonConfig" : {
                        "button1" : {                            
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            label: "common.Ok", 
                            labelId: "common.Ok", 
                            subMap : null,
                            appData : "Global.Yes",
                            disabled : false
                        },                       
                    }, // end of buttonConfig
                    text1Id : "BrowsingUnsupported",                    
                } // end of properties for "DialogCtrl"     
            },
            "readyFunction" : this._DialogCtxtTmpltReadyToDisplay.bind(this)
        }, // end of "BrowsingUnsupported"
        "NowPlayingA2DP" : {
            "template" : "NowPlaying4Tmplt",
			"sbNameId"	: " ",
			"sbNameSubMap" : {"deviceName" : ""},
            "controlProperties" : {
                "NowPlayingCtrl" : {                    
                    ctrlStyle           : "Style0",
                    umpConfig           : this._umpButtonConfig1,
                } // end of properties for "NowPlayingCtrl for A2DP"
            }, // end of list of controlProperties
            "readyFunction" : this._NowPlayingA2DPCtxtReadyToDisplay.bind(this),
            "displayedFunction" : null
        }, // end of "NowPlayingA2DP"
        "NowPlayingAVRCP10" : {
            "template" : "NowPlaying4Tmplt",
			"sbNameId"	: " ",
			"sbNameSubMap" : {"deviceName" : ""},
            "controlProperties" : {
                "NowPlayingCtrl" : {                    
                    ctrlStyle           : "Style0",
                    umpConfig           : this._umpButtonConfig2,
                } // end of properties for "NowPlayingCtrl for AVRCP10"
            }, // end of list of controlProperties
            "readyFunction" : this._NowPlayingAVRCP10CtxtReadyToDisplay.bind(this),
            "displayedFunction" : null
        }, // end of "NowPlayingAVRCP10"
        "NowPlayingAVRCP13" : {
            "template" : "NowPlaying4Tmplt",
			"sbNameId"	: " ",
			"sbNameSubMap" : {"deviceName" : ""},
            "controlProperties" : {
                "NowPlayingCtrl" : {
                    ctrlStyle           : "Style2",
                    umpConfig           : this._umpButtonConfig3,
                } // end of properties for "NowPlayingCtrl for AVRCP13"
            }, // end of list of controlProperties
            "readyFunction" : this._NowPlayingAVRCP13CtxtReadyToDisplay.bind(this),           
            "displayedFunction" : null
        }, // end of "NowPlayingAVRCP13"
        "NowPlayingAVRCP14" : {
            "template" : "NowPlaying4Tmplt",
			"sbNameId"	: " ",
			"sbNameSubMap" : {"deviceName" : ""},
            "controlProperties" : {
                "NowPlayingCtrl" : {
                    ctrlStyle           : "Style2",
                    umpConfig           : this._umpButtonConfig4,
                } // end of properties for "NowPlayingCtrl for AVRCP14"
            }, // end of list of controlProperties
            "readyFunction" : this._NowPlayingAVRCP14CtxtReadyToDisplay.bind(this),           
            "displayedFunction" : null
        }, // end of "NowPlayingAVRCP14"
    };
    // end of this._contextTable
    // @formatter:on
    // @formatter:off
    this._messageTable = {
        "ObjectInfo" : this._ObjectInfoMsgHandler.bind(this),
        "PlayerState" : this._PlayerStateMsgHandler.bind(this),
        "ScanState" : this._ScanPlayMsgHandler.bind(this),
        "ShuffleState" : this._ToggleRandomStateMsgHandler.bind(this),
        "RepeatState" : this._ToggleRepeatStateMsgHandler.bind(this),
        "DeviceCapability" : this._DeviceCapabilityMsgHanlder.bind(this),
        "CurrentFolder" : this._CurrentFolderMsgHandler.bind(this),
        "FolderItem" : this._FolderItemMsgHandler.bind(this),
        "DeviceInfo" : this._DeviceInfoMsgHanlder.bind(this),
        "SelectItemAtLine" : this._SelectItemAtLineMsgHandler.bind(this),
        "ElapsedTime" : this._ElapsedTimeMsgHandler.bind(this),
        "MobileDeviceErrorMsg" : this._MobileDeviceErrorMsgMsgHandler.bind(this),
        "SettingsSupported" : this._SettingsSupportedMsgMsgHandler.bind(this),
        "BtaudioLostFocus" : this._BtaudioLostFocusMsgMsgHandler.bind(this),
		"SBN_ObjectInfo" : this._Sbn_ObjectInfoMsgHandler.bind(this) /*Sandesh*/

    };
    // end of this._messageTable
    // @formatter:on
}

/*******************************************************************************
 * Context handlers
 ******************************************************************************/
 
// General dialog ctxt
btaudioApp.prototype._DialogCtxtTmpltReadyToDisplay = function()
{
    log.debug("_DialogCtxtTmpltReadyToDisplay called...");
    if(this._btDeviceName)
    {
        this._populateDeviceName();
    }
}


// FileNavigation ctxt
btaudioApp.prototype._FileNavigationCtxtTmpltReadyToDisplay = function(params)
{ 
    log.info("_FileNavigationCtxtTmpltReadyToDisplay called...");
    if(this._focusLost)
    {
        log.info("this._focusLost true");
        this._cachedListClear = false;
        this._temp = false;
        this._focusLost = false;
    }
    else
    {
        log.info("this._focusLost false");
        this._cachedListClear = true;
        this._temp = true;
        if(params)
        {
            log.debug("Value of params is" + JSON.stringify(params));
            params.skipRestore = true;        
        }
        else
        {
            log.debug("No params");
        }
    }

    if(this._leftButtonStyle)
    {
        framework.common.setLeftBtnStyle(this._leftButtonStyle);
    }
    if(this._btDeviceName)
    {
        this._populateDeviceName();
    }
    if(this._cachedFolderName === "Unknown")
    {
        var ctrlData =
        {
            titleStyle : "style02",
            text1Id : this._cachedFolderName
        }                
    }
    else
    {
        var ctrlData =
        {
            titleStyle : "style02",
            text1 : this._cachedFolderName
        }                
    }    
    this._currentContextTemplate.list2Ctrl.setTitle(ctrlData); 
    
    if (!this._temp)
    {
        log.info("in if");
        this._temp = true;
        var dataList = this._cachedDataList;        
        dataList.itemCountKnown = true;
        dataList.itemCount = this._subItemCount;
        dataList.vuiSupport = true; 
        log.info("Value of subitemcount" +this._subItemCount);        
        if (this._currentContextTemplate)
        {
            this._currentContextTemplate.list2Ctrl.setDataList(dataList);
            if(dataList.itemCount)
            {
                this._currentContextTemplate.list2Ctrl.updateItems(0, dataList.itemCount - 1);
            }            
        }
    }
}

// File Navigation Context In function
btaudioApp.prototype._FileNavigationCtxtIn = function(params)
{    
    log.info("_FileNavigationCtxtIn");    
    this._cachedIndexIn = this._currentContext.params.payload.index;    
}

// NowPlayingA2DP Context
btaudioApp.prototype._NowPlayingA2DPCtxtReadyToDisplay = function()
{
    log.debug("_NowPlayingA2DPCtxtReadyToDisplay called...");
    if(this._btDeviceName)
    {
        this._populateDeviceName();
    }
    if (this._cachedSongDetails)
    {
        log.debug("Populating now playing ctrl from _NowPlayingA2DPCtxtReadyToDisplay");
        this._populateNowPlayingCtrl(this._currentContextTemplate);
    }
    if(this._currentContextTemplate)
    {
        this._updatePlayPauseButton(this._currentContextTemplate);
    }
}

// NowPlayingAVRCP10 Context
btaudioApp.prototype._NowPlayingAVRCP10CtxtReadyToDisplay = function()
{
    log.debug("_NowPlayingAVRCP10CtxtReadyToDisplay called...");
    if(this._btDeviceName)
    {
        this._populateDeviceName();
    }
    if (this._cachedSongDetails)
    {
        log.debug("Populating now playing ctrl from _NowPlayingAVRCP10CtxtReadyToDisplay");
        this._populateNowPlayingCtrl(this._currentContextTemplate);
    }
    if(this._currentContextTemplate)
    {
        this._updatePlayPauseButton(this._currentContextTemplate);
    }
}

// NowPlayingAVRCP13 Context
btaudioApp.prototype._NowPlayingAVRCP13CtxtReadyToDisplay = function()
{
    log.debug("_NowPlayingAVRCP13CtxtReadyToDisplay called...");
    if(this._currentContextTemplate)
    {
        this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setUmpConfig(this._umpButtonConfigAVRCP13);
		this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl._umpScrubber.setMoveIncrement(0, 1, 0.01);
    }   
    if(this._btDeviceName)
    {
        this._populateDeviceName();
    }
    if (this._cachedSongDetails)
    {
        log.debug("Populating now playing ctrl from _NowPlayingAVRCP13CtxtReadyToDisplay");
        this._populateNowPlayingCtrl(this._currentContextTemplate, this._cachedSongDetails);
    }

    if(this._currentContextTemplate)
    {
        this._updatePlayPauseButton(this._currentContextTemplate);

        if(this._cachedRandomCapability)
        {            
            this._cachedRandomState = this._shuffleState;
            this._setRandomButtonState(this._currentContextTemplate);
        }
        if(this._cachedRepeatCapability)
        {            
            this._cachedRepeatState = this._repeatState;
            this._setRepeatButtonState(this._currentContextTemplate);
        }
        if(this._cachedScanCapability)
        {            
            this._cachedScanState = this._scanState;
            this._setScanButtonState(this._currentContextTemplate);
        }
        if(this._min != -1 || this._sec != -1)
        {
            this._scrubberElapsedTime();
        }
        if(this._cachedSongDetails.trackDuration != 0 && this._cachedSongDetails.trackDuration != undefined)
        {
            this._setTotalElapsedTime();
        }        
    }
}

// NowPlayingAVRCP14 Context
btaudioApp.prototype._NowPlayingAVRCP14CtxtReadyToDisplay = function()
{
    log.debug("_NowPlayingAVRCP14CtxtReadyToDisplay called...");
    if(this._currentContextTemplate)
    {
        this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setUmpConfig(this._umpButtonConfigAVRCP14);
		this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl._umpScrubber.setMoveIncrement(0, 1, 0.01);
    }
    if(this._btDeviceName)
    {
        this._populateDeviceName();
    }
    if (this._cachedSongDetails)
    {
        log.debug("Populating now playing ctrl from _NowPlayingAVRCP14CtxtReadyToDisplay");
        this._populateNowPlayingCtrl(this._currentContextTemplate, this._cachedSongDetails);
    }

    if(this._currentContextTemplate)
    {
        this._updatePlayPauseButton(this._currentContextTemplate);

        if(this._cachedRandomCapability)
        {            
            this._cachedRandomState = this._shuffleState;
            this._setRandomButtonState(this._currentContextTemplate);           
        }
        if(this._cachedRepeatCapability)
        {
            this._cachedRepeatState = this._repeatState;
            this._setRepeatButtonState(this._currentContextTemplate);
        }
        if(this._cachedScanCapability)
        {
            this._cachedScanState = this._scanState;
            this._setScanButtonState(this._currentContextTemplate);
        }
        if(this._min != -1 || this._sec != -1)
        {
            this._scrubberElapsedTime();
        }
        if(this._cachedSongDetails.trackDuration != 0 && this._cachedSongDetails.trackDuration != undefined)
        {
            this._setTotalElapsedTime();
        }
    }
}

//FileNavigation ctxt

//_resetFileNavifationVar() is called here in contextOut function instead of ready or msgResponse functions
btaudioApp.prototype._FileNavigationCtxtOutFunction = function()
{
    this._cachedFolderItem = null;
//	this._resetFileNavigationVar();		//check if this solution works or not
}

/*******************************************************************************
 * Message handlers
 ******************************************************************************/

// Change Left button config
btaudioApp.prototype._CurrentFolderMsgHandler = function(msg)
{    
    log.debug("_CurrentFolderMsgHandler called..");
    if(msg && msg.params && msg.params.payload)
    {
        this._temp = true;
        this._resetFileNavigationVar();
        
        if(msg.params.payload.folderName)
        {
            this._cachedFolderName = msg.params.payload.folderName;   
        }
        else
        {
            this._cachedFolderName = "Unknown";   
        }        
        if(msg.params.payload.subItemCount)
        {
            this._subItemCount = msg.params.payload.subItemCount;            
            if(this._subItemCount < 25)
            {
                this._requestChunkSize = this._subItemCount;                
            }
            else
            {
                this._requestChunkSize = 25;                
            }
        }
        if(msg.params.payload.isRootFolder === true)
        {
            this._leftButtonStyle = "goBack";
        }
        else if(msg.params.payload.isRootFolder === false)
        {
            if(msg.params.payload.isPlaylist === true)
            {
                this._leftButtonStyle = "goBack";
            }
            else
            {
                this._leftButtonStyle = "menuUp";
            }            
        }                    
        if (this._currentContext.ctxtId === "FileNavigation")
        {                
            this._populateFileNavigation();
        }        
    }
}

// Folder Item Msg
btaudioApp.prototype._FolderItemMsgHandler = function(msg)
{
    log.debug("_FolderItemMsgHandler called..");
    if(msg && msg.params && msg.params.payload && msg.params.payload.folderItem)
    {        
        this._cachedFolderItem = msg.params.payload.folderItem; 
		log.info("_FolderItemMsgHandler called with index.."+this._cachedFolderItem.index);
        this._populateFileNavigationFolderItem();        
    }
}

// Scan Play Msg
btaudioApp.prototype._ScanPlayMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.scan)
    {
        var id = msg.params.payload.scan;
        switch(id)
        {
            case "Off":
                this._cachedScanState = "Unsel";
                break;
            case "Group":
                this._cachedScanState = "Folder";
                break;
            case "All":
                this._cachedScanState = "Sel";
                break;
        }
        this._scanState = this._cachedScanState;
        if (this._currentContext && this._currentContextTemplate)
        {
            switch(this._currentContext.ctxtId)
            {
                case "NowPlayingAVRCP14":
                    //Intentional fallthrough
                case "NowPlayingAVRCP13":
                    this._setScanButtonState(this._currentContextTemplate);
                    break;
                default :
                    log.debug("Current Context not found ");
                    break;
            }
        }
    }
}

// Elapsed Time Msg
btaudioApp.prototype._ElapsedTimeMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.time)
    {
        this._elapsedTime = msg.params.payload.time;        
        if (this._currentContext && this._currentContextTemplate)
        {
            switch(this._currentContext.ctxtId)
            {                
                case "NowPlayingAVRCP14":
                    //Intentional Fallthrough
                case "NowPlayingAVRCP13":
                    this._scrubberElapsedTime();
                    break;
                default :
                    log.debug("Current Context not found ");
                    break;
            }
        }
    }
}

//Device Capability msg
btaudioApp.prototype._DeviceCapabilityMsgHanlder = function(msg)
{
    log.debug("In devicecapabilty message handler");

    if(msg && msg.params && msg.params.payload && msg.params.payload.capability)
    {
        this._updateUMPCtrl(msg.params.payload.capability);     
    }
}

// Object Info Msg
btaudioApp.prototype._ObjectInfoMsgHandler = function(msg)
{
    var tempTrackInfo =  this._cachedSongDetails.titleInfo;
	
    if(msg && msg.params && msg.params.payload && msg.params.payload.songDetails)
    {
        this._cachedSongDetails = msg.params.payload.songDetails;

        // Update control if context is bound to a template
        if (this._currentContext && this._currentContextTemplate)
        {
            switch(this._currentContext.ctxtId)
            {
                case "NowPlayingAVRCP10":
                    //Intentional Fallthrough
                case "NowPlayingA2DP":
                    this._populateNowPlayingCtrl(this._currentContextTemplate);
                    break;
                case "NowPlayingAVRCP14":
                    //Intentional Fallthrough
                case "NowPlayingAVRCP13":
                    this._populateNowPlayingCtrl(this._currentContextTemplate, this._cachedSongDetails);
                    if(this._cachedSongDetails.trackDuration != 0)
                    {
                        this._setTotalElapsedTime();
                    }
                    if(this._cachedSongDetails.titleInfo != tempTrackInfo && this._elapsedTime<=2147483647)
                    {
                        this._elapsedTime = 0;
                    }
					if(this._enteredelapsedtimehandler === 1)
					{
						this._enteredelapsedtimehandler = 0;
						this._scrubberElapsedTime();
					}
                    this._setUpdateScrubber();
                    break;
                default :
                    log.debug("Current Context not found ");
                    break;
            }
        }
    }
}

/*  Sandesh */
btaudioApp.prototype._Sbn_ObjectInfoMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.titleInfo)
    {
		var sbnEdata = msg.params.payload.titleInfo;	
		framework.common.startTimedSbn(this.uiaId, "SbnTrackInfo", "TypeE", {sbnStyle : "Style02",imagePath1 : 'common/images/icons/IcnSbnEnt.png', text1Id : "system.BT" , text2: sbnEdata});
	}
	//framework.common.startTimedSbn(this.uiaId, "SbnTrackInfo", "SbnTrackInfo", {sbnStyle : "Style01", text1 : sbnEdata, text2:sbnEdata});
	//framework.common.startTimedSbn(this.uiaId, "SbnTrackInfo", "SbnTrackInfo", {sbnStyle : "Style01", text1 : sbnEdata});
	//framework.common.startTimedSbn(this.uiaId, "SbnTrackInfo", "TypeE", {sbnStyle : "Style02",imagePath1 : 'common/images/icons/IcnSbMusic.png', text1Id : "system.BT" , text2: sbnEdata});
}

// Player state msg
btaudioApp.prototype._PlayerStateMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.playerState)
    {
       this._playerState = msg.params.payload.playerState;
        if (this._currentContext && this._currentContextTemplate)
        {
            switch(this._currentContext.ctxtId)
            {
                case "NowPlayingAVRCP10":
                case "NowPlayingA2DP":
                case "NowPlayingAVRCP14":
                case "NowPlayingAVRCP13":
                    this._updatePlayPauseButton(this._currentContextTemplate);
                    break;
                default:
                    log.debug("Current Context not found ");
                    break
            }
        }
    }
}

// Toggle Random msg
btaudioApp.prototype._ToggleRandomStateMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.shuffle)
    {
        var id = msg.params.payload.shuffle;
        switch(id)
        {
            case "Off":
                this._cachedRandomState = "Off";
                break;
            case "Group":
                this._cachedRandomState = "Folder";
                break;
            case "All":
                this._cachedRandomState = "On";
                break;
            default :
                log.debug("Current State not found ");
                break
        }
        this._shuffleState = this._cachedRandomState;
        // Update if context is bound to a template
        if (this._currentContext && this._currentContextTemplate)
        {
            switch(this._currentContext.ctxtId)
            {
                case "NowPlayingAVRCP14":
                case "NowPlayingAVRCP13":
                    this._setRandomButtonState(this._currentContextTemplate);
                    break;
                default :
                    log.debug("Current Context not found ");
                    break;
            }
        }
    }
}

// Device Info
btaudioApp.prototype._DeviceInfoMsgHanlder = function(msg)
{
    if(msg && msg.params && msg.params.payload)
    {
        this._connStatus = msg.params.payload.connected;
        if(msg.params.payload.deviceName)
        {
             this._btDeviceName = msg.params.payload.deviceName;
        }       

        // We are inside Bluetooth Audio App
        if(this._connStatus)
        {
            if (this._currentContext && this._currentContextTemplate)
            {
                this._populateDeviceName();            
            }
        }
        else
        {
            this._min = -1;
            this._sec = -1;
            this._btDeviceName = null;
            this._cachedSongDetails = {};
            this._min1 = 0;
            this._sec1 = 0;
            this._SupportedSettings = null;
			this._enteredelapsedtimehandler = 0;
			this._elapsedTime = 0;
        }      
    }
}

// Item Line msg
btaudioApp.prototype._SelectItemAtLineMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.lineNumber)
    {
        var lineNumber = msg.params.payload.lineNumber;
        if (this._currentContext && this._currentContextTemplate)
        {
            var eventName = this._currentContextTemplate.list2Ctrl.dataList.items[lineNumber].appData.eventName;
            if(eventName === "SelectTrack")
            {
                var name = this._currentContextTemplate.list2Ctrl.dataList.items[lineNumber].appData.track;
                var listItemIndex = this._currentContextTemplate.list2Ctrl.dataList.items[lineNumber].appData.listIndex;
                var folderItemAttribute = this._currentContextTemplate.list2Ctrl.dataList.items[lineNumber].appData.attribute;
                framework.sendEventToMmui(this.uiaId, "SelectTrack", {payload:{track: name , index:listItemIndex , attribute: folderItemAttribute}});
            }
            else
            {
                var name = this._currentContextTemplate.list2Ctrl.dataList.items[lineNumber].appData.folder;
                var listItemIndex = this._currentContextTemplate.list2Ctrl.dataList.items[lineNumber].appData.listIndex;
                var folderItemAttribute = this._currentContextTemplate.list2Ctrl.dataList.items[lineNumber].appData.attribute;
                framework.sendEventToMmui(this.uiaId, "SelectFolder" , {payload:{folder: name , index:listItemIndex , attribute: folderItemAttribute}});
            }
        }
    }
}

// Toggle Repeat Msg
btaudioApp.prototype._ToggleRepeatStateMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.repeat)
    {
        var id = msg.params.payload.repeat;
        switch(id)
        {
            case "Off":
                this._cachedRepeatState = "None";
                break;
            case "Single":
                this._cachedRepeatState = "Song";
                break;
            case "All":
                this._cachedRepeatState = "List";
                break;
            default :
                log.debug("Current State not found ");
                break
        }
        // Update if context is bound to a template
        this._repeatState = this._cachedRepeatState;
        if (this._currentContext && this._currentContextTemplate)
        {
            switch(this._currentContext.ctxtId)
            {
                case "NowPlayingAVRCP14":
                case "NowPlayingAVRCP13":
                    //this._updateRepeat(this._currentContextTemplate);
                    this._setRepeatButtonState(this._currentContextTemplate);
                    break;
                default :
                    log.debug("Current Context not found ");
                    break
            }
        }
    }
}

//Mobile device error
btaudioApp.prototype._MobileDeviceErrorMsgMsgHandler = function(msg)
{
    if(msg && msg.params)
    {
        this._MobileDeviceError();
    }    
}

//SettingsSupport
btaudioApp.prototype._SettingsSupportedMsgMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.SupportedSettings)
    {
       this._SupportedSettings = msg.params.payload.SupportedSettings;
    }     
}


btaudioApp.prototype._BtaudioLostFocusMsgMsgHandler = function(msg)
{   
        this._focusLost = true;       
}

/*******************************************************************************
 * Control callbacks
 ******************************************************************************/

 // List item click
btaudioApp.prototype._listItemClickCallback = function(listCtrlObj, appData, params)
{
    log.debug("_listItemClickCallback called...");
    
    switch(this._currentContext.ctxtId)
    {
        case "FileNavigation":
        
            // get appData
            var eventName = appData.eventName;
            var itemListIndex = appData.listIndex;
            var folderItemAttribute = appData.attribute;
            var vuiBtaudioFlag = false;
            if (params && params.fromVui)
            {
                vuiBtaudioFlag = true;
            }
            
            switch(eventName)
            {
                // we are selecting a track
                case "SelectTrack" :
                    // get track name
                    var name = appData.track;
                    framework.sendEventToMmui(this.uiaId, eventName , {payload:{track: name , index:itemListIndex , attribute: folderItemAttribute}}, vuiBtaudioFlag);
                    this._actualDataCount = 0;                   
                    this._cachedFolderName = "";
                    if(this._currentContextTemplate)
                    {
                        // set empty datalist as we don't have any items yet
                        this._currentContextTemplate.list2Ctrl.setDataList({});        
                    }
                    this._cachedDataList = 
                    {
                            itemCountKnown : true,
                            itemCount : 0,
                            items : []
                    }
                    // empty the dataList
                    break;
                
                // we are selecting a folder
                case "SelectFolder" :
                    // get folder name
                    var name = appData.folder;
                    var folderItemType = appData.itemType;
                    framework.sendEventToMmui(this.uiaId, eventName , {payload:{folder: name , index:itemListIndex , attribute: folderItemAttribute, type : folderItemType}},vuiBtaudioFlag);
                    this._actualDataCount = 0;
                    this._cachedFolderName = "";
                    if(this._currentContextTemplate)
                    {
                        // set empty datalist as we don't have any items yet
                        this._currentContextTemplate.list2Ctrl.setDataList({});        
                    }
                    this._cachedDataList = 
                    {
                            itemCountKnown : true,
                            itemCount : 0,
                            items : []
                    }
                    // empty the dataList                    
                    break;
                    
                default :
                    // do nothing
                    break;
            }
        default:
            break;
    }
}

// Dialog click
btaudioApp.prototype._dialogCtrlClickCallback = function(dialogBtnCtrlObj, appData, extraParams)
{
    log.debug("btpairingApp _dialogCtrlClickCallback called...");

    switch (this._currentContext.ctxtId)
    {
        case "Disconnect" :
            switch (appData)
            {
                case "Global.Yes" :
                    framework.sendEventToMmui("common", "Global.GoBack");
                    break;
                default :
                    log.debug("No such button");
                    break;
            }
            break;
        case "MobileDeviceError" :
        case "SongUnsupported" :
        case "BrowsingUnsupported" :
            switch (appData)
            {
                case "Global.Yes":
                    framework.sendEventToMmui("common", appData);
                    break;
                default :
                    log.debug("No such button");
                    break
            }
            break;
        case "DeviceUnsupported" :
        case "NoDevice" :
            switch(appData)
            {
                case "Global.GoBack" :
                    framework.sendEventToMmui("common", appData);
                    break;
                case "Global.Setup" :
                    framework.sendEventToMmui(this.uiaId, "SelectConnect");
                    break;
                default :
                    log.debug("No such button");
                    break
            }
        default :
            log.debug("No such context");
            break;
    }
}

// UMP Callback
btaudioApp.prototype._umpDefaultSelectCallback = function(ctrlObj, appData, params)
{
    if (appData === "Play/Pause")
    {
        if (this._playerState === "PAUSED" || this._playerState === "STOPPED")
        {
            framework.sendEventToMmui("common", "Global.Resume");
        }
        else if (this._playerState === "PLAYING" || this._playerState === "SCAN_FWD" || this._playerState === "SCAN_BKD")
        {
            framework.sendEventToMmui("common", "Global.Pause");
        }
    }
    switch (appData)
    {
        case "Global.MenuUp":
        case "Global.Next":
        case "Global.Previous":
            framework.sendEventToMmui("common" , appData);
            break;
        case "ToggleShuffle":
            if(!this._umpButtonConfigAVRCP14["ToggleShuffle"].disabled || !this._umpButtonConfigAVRCP13["ToggleShuffle"].disabled)
            {         
                framework.sendEventToMmui(this.uiaId, appData);
            }
            break;
        case "ToggleRepeat":
            if(!this._umpButtonConfigAVRCP14["ToggleRepeat"].disabled || !this._umpButtonConfigAVRCP13["ToggleRepeat"].disabled)
            {        
                framework.sendEventToMmui(this.uiaId, appData);
            }
            break;
        case "SelectRootMenu" :
            this._cachedDataList = 
            {
                    itemCountKnown : true,
                    itemCount : 0,
                    items : []
            }
            this._cachedFolderName = "";
            framework.sendEventToMmui(this.uiaId, appData);
            break;
        case "SelectSettings" :
            framework.sendEventToMmui(this.uiaId, appData);
            break;
        case "ScanPlay":
            if(!this._umpButtonConfigAVRCP14["ScanPlay"].disabled || !this._umpButtonConfigAVRCP13["ScanPlay"].disabled)
            {           
                framework.sendEventToMmui(this.uiaId, appData);
            }
            break;
        case "SelectSource":
            framework.sendEventToMmui(this.uiaId, appData);
            break;
        default:
            log.debug(" Invalid Button for _umpDefaultSelectCallback ...");
            break;
    }
}

btaudioApp.prototype._umpDefaultHoldStartCallback = function(ctrlObj, appData, params)
{
    log.debug("_umpDefaultHoldStartCallback called...");
    if (appData === "Global.Next")
    {
        framework.sendEventToMmui("common", "Global.FastForward");
    }
    else if (appData === "Global.Previous")
    {
        framework.sendEventToMmui("common", "Global.Rewind");
    }
}

btaudioApp.prototype._umpDefaultHoldStopCallback = function(ctrlObj, appData, params)
{
    log.debug("_umpDefaultHoldStopCallback called...");
    if (appData === "Global.Next")
    {
        framework.sendEventToMmui("common", "Global.Resume");
    }
    else if (appData === "Global.Previous")
    {
        framework.sendEventToMmui("common", "Global.Resume");
    }
}

// UMP Scrubber CallBack for Default
btaudioApp.prototype._umpDefaultSlideCallback = function(ctrlObj, appData, params)
{
    log.debug("_umpDefaultSlideCallback called...", ctrlObj, appData, params);
}
// UMP Slider CallBack
btaudioApp.prototype._slideCallback = function(buttonRef, appData, params)
{
    log.debug("btaudioApp: _slideCallback() called...", buttonRef, appData, params);
    this.sliderValue = params.sliderValue;
}

//List Scroll callback 
btaudioApp.prototype._FileNavigationNeedDataCallback = function(index, params)
{
	log.info("FileNavigationNeedDataCallback  called with index : " + index + " params.topItem : " + params.topItem);
	log.debug("Value of ranges is" + params.ranges); 
	this._requestChunkSize = (this._subItemCount - index) > 25 ? 25 : this._subItemCount - index;
    // we have run of of data. Need to request more
    if((index > this._offset && index <((this._requestChunkSize+this._offset)-10)) || index == 0)
    {
		//We already have the data.
		log.info('Need data not processed for index : ' + index);
        return;  
    }
    else
    {    
        this._offset = index;
        log.info("Data to be requested from offset : " + this._offset + " and for chunkSize : " + this._requestChunkSize);        
        framework.sendEventToMmui(this.uiaId, "GetSongList", {payload:{count:this._requestChunkSize, offset : this._offset}});
    }
}

/*******************************************************************************
 * Helper functions
 ******************************************************************************/

// Update the UMP Control
btaudioApp.prototype._updateUMPCtrl = function(params)
{
    this._umpButtonConfigAVRCP13 = new Object();
    this._umpButtonConfigAVRCP14 = new Object();
    this._umpButtonConfigAVRCP13["SelectSource"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpEntMenu",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectSource",
        selectCallback: this._umpDefaultSelectCallback.bind(this)
    };
    
    this._umpButtonConfigAVRCP14["SelectSource"] = this._umpButtonConfigAVRCP13["SelectSource"];
    
    this._umpButtonConfigAVRCP14["SelectRootMenu"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase :  "IcnUmpCurrentList",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectRootMenu",
        labelId : "TooltipRootMenu",
        selectCallback: this._umpDefaultSelectCallback.bind(this)
    };

    if(params.repeat === "ON")
    {
        this._cachedRepeatCapability = true;   
        if(this._SupportedSettings.RepeatOff && this._SupportedSettings.RepeatSingle &&  this._SupportedSettings.RepeatAll)
        {
            this._umpButtonConfigAVRCP13["ToggleRepeat"] =
            {
                buttonBehavior : "shortPressOnly",
                imageBase : "IcnUmpRepeat",
                currentState:"None",
                stateArray: [
                    {
                        state:"None",  label: null, labelId: null
                    },
                    {
                        state:"Song",  label: null, labelId: null
                    },
                    {
                        state:"List", label: null, labelId: null
                    }
                ],
                disabled : null,
                appData:"ToggleRepeat",
                selectCallback: this._umpDefaultSelectCallback.bind(this)
            };
        }else if(this._SupportedSettings.RepeatOff && this._SupportedSettings.RepeatSingle)
        {
            this._umpButtonConfigAVRCP13["ToggleRepeat"] =
            {
                buttonBehavior : "shortPressOnly",
                imageBase : "IcnUmpRepeat",
                currentState:"None",
                stateArray: [
                    {
                        state:"None",  label: null, labelId: null
                    },
                    {
                        state:"Song",  label: null, labelId: null
                    },                  
                ],
                disabled : null,
                appData:"ToggleRepeat",
                selectCallback: this._umpDefaultSelectCallback.bind(this)
            };      
        }
        else if(this._SupportedSettings.RepeatOff && this._SupportedSettings.RepeatAll)
        {
            this._umpButtonConfigAVRCP13["ToggleRepeat"] =
            {
                buttonBehavior : "shortPressOnly",
                imageBase : "IcnUmpRepeat",
                currentState:"None",
                stateArray: [
                    {
                        state:"None",  label: null, labelId: null
                    },              
                    {
                        state:"List", label: null, labelId: null
                    }
                ],
                disabled : null,
                appData:"ToggleRepeat",
                selectCallback: this._umpDefaultSelectCallback.bind(this)
            };
        }
        this._umpButtonConfigAVRCP14["ToggleRepeat"] = this._umpButtonConfigAVRCP13["ToggleRepeat"];
    }
    else
    {
        this._cachedRepeatCapability = false;
    }

    if(params.random === "ON")
    {
        this._cachedRandomCapability = true;      
        if(this._SupportedSettings.ShuffleOff && this._SupportedSettings.ShuffleAll &&  this._SupportedSettings.ShuffleGroup)
        {
            this._umpButtonConfigAVRCP13["ToggleShuffle"] =
            {
                buttonBehavior : "shortPressOnly",
                imageBase : "IcnUmpShuffle",
                currentState:"Off",
                stateArray: [
                    {
                        state:"Off", label:null, labelId:null
                    },
                    {
                        state:"Folder",label:null, labelId:null
                    },
                    {
                        state:"On",  label:null, labelId:null
                    }
                ],
                disabled : false,
                appData:"ToggleShuffle",
                selectCallback: this._umpDefaultSelectCallback.bind(this)
            };
        }
        else if (this._SupportedSettings.ShuffleOff && this._SupportedSettings.ShuffleAll)
        {       
            this._umpButtonConfigAVRCP13["ToggleShuffle"] =
            {
                buttonBehavior : "shortPressOnly",
                imageBase : "IcnUmpShuffle",
                currentState:"Off",
                stateArray: [
                    {
                        state:"Off", label:null, labelId:null
                    },                  
                    {
                        state:"On",  label:null, labelId:null
                    }
                ],
                disabled : false,
                appData:"ToggleShuffle",
                selectCallback: this._umpDefaultSelectCallback.bind(this)
            };
        }
        else if (this._SupportedSettings.ShuffleOff && this._SupportedSettings.ShuffleGroup)
        {
            this._umpButtonConfigAVRCP13["ToggleShuffle"] =
            {
                buttonBehavior : "shortPressOnly",
                imageBase : "IcnUmpShuffle",
                currentState:"Off",
                stateArray: [
                    {
                        state:"Off", label:null, labelId:null
                    },
                    {
                        state:"Folder",label:null, labelId:null
                    }                   
                ],
                disabled : false,
                appData:"ToggleShuffle",
                selectCallback: this._umpDefaultSelectCallback.bind(this)
            };
        }        
        this._umpButtonConfigAVRCP14["ToggleShuffle"] = this._umpButtonConfigAVRCP13["ToggleShuffle"];
    }
    else
    {
        this._cachedRandomCapability = false;
    }
    
    if(params.scanPlay === "ON")
    {
        this._cachedScanCapability = true;    
        if(this._SupportedSettings.ScanOff && this._SupportedSettings.ScanAll &&  this._SupportedSettings.ScanGroup)
        {
            this._umpButtonConfigAVRCP13["ScanPlay"] =
            {
                buttonBehavior : "shortPressOnly",
                imageBase :  "IcnUmpScan",
                currentState:"Unsel",
                stateArray: [
                    {
                        state:"Unsel", label:null, labelId:null
                    },
                    {
                        state:"Sel",  label:null, labelId:null
                    },
                    {
                        state:"Folder", label:null, labelId:null
                    },
                ],

                disabled : false,
                buttonClass : "normal",
                appData : "ScanPlay",
                selectCallback: this._umpDefaultSelectCallback.bind(this)
            };
        }
        else if(this._SupportedSettings.ScanOff && this._SupportedSettings.ScanAll)
        {
            this._umpButtonConfigAVRCP13["ScanPlay"] =
            {
                buttonBehavior : "shortPressOnly",
                imageBase :  "IcnUmpScan",
                currentState:"Unsel",
                stateArray: [
                    {
                        state:"Unsel", label:null, labelId:null
                    },
                    {
                        state:"Sel",  label:null, labelId:null
                    },                  
                ],

                disabled : false,
                buttonClass : "normal",
                appData : "ScanPlay",
                selectCallback: this._umpDefaultSelectCallback.bind(this)
            };      
        }
        else if(this._SupportedSettings.ScanOff && this._SupportedSettings.ScanGroup)
        {
            this._umpButtonConfigAVRCP13["ScanPlay"] =
            {
                buttonBehavior : "shortPressOnly",
                imageBase :  "IcnUmpScan",
                currentState:"Unsel",
                stateArray: [
                    {
                        state:"Unsel", label:null, labelId:null
                    },                  
                    {
                        state:"Folder", label:null, labelId:null
                    },
                ],

                disabled : false,
                buttonClass : "normal",
                appData : "ScanPlay",
                selectCallback: this._umpDefaultSelectCallback.bind(this)
            };      
        }        
        this._umpButtonConfigAVRCP14["ScanPlay"] = this._umpButtonConfigAVRCP13["ScanPlay"];
    }
    else
    {
        this._cachedScanCapability = false;
    }
    this._umpButtonConfigAVRCP13["Global.Previous"] =
    {
        buttonBehavior : "shortAndHold",
        imageBase : "IcnUmpPreviousAudio",
        disabled : false,
        buttonClass : "normal",
        appData : "Global.Previous",
        selectCallback: this._umpDefaultSelectCallback.bind(this)
    };
    this._umpButtonConfigAVRCP13["Play/Pause"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase :  "IcnUmpPlayPause",
        currentState:"Play",
        stateArray: [
            {
                state:"Play", label:null, labelId:null
            },
            {
                state:"Pause",  label:null, labelId:null
            },
        ],
        disabled : false,
        buttonClass : "normal",
        appData : "Play/Pause",
        selectCallback: this._umpDefaultSelectCallback.bind(this)
    };
    this._umpButtonConfigAVRCP13["Global.Next"] =
    {
        buttonBehavior : "shortAndHold",
        imageBase : "IcnUmpNextAudio",
        disabled : false,
        buttonClass : "normal",
        appData : "Global.Next",
        selectCallback: this._umpDefaultSelectCallback.bind(this)
    };
    this._umpButtonConfigAVRCP13["SelectSettings"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpEqualizer",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectSettings",
        selectCallback: this._umpDefaultSelectCallback.bind(this)
    };
    this._umpButtonConfigAVRCP14["Global.Previous"] = this._umpButtonConfigAVRCP13["Global.Previous"];
    
    this._umpButtonConfigAVRCP14["Play/Pause"] = this._umpButtonConfigAVRCP13["Play/Pause"];
    
    this._umpButtonConfigAVRCP14["Global.Next"] = this._umpButtonConfigAVRCP13["Global.Next"];
    
    this._umpButtonConfigAVRCP14["SelectSettings"] = this._umpButtonConfigAVRCP13["SelectSettings"]
   
 
}
// Update NowPlaying Control
btaudioApp.prototype._populateNowPlayingCtrl = function(tmplt,songDetails)
{
    log.debug("inside populate now playing vtrl");
    // For NowPlayingA2DP and NowPlayingAVRCP10 only ctrl title needed
    var controlConfigObj = new Object();
    if(arguments.length == 1)
    {
        log.debug("inside populate now playing vtrl...1");
        controlConfigObj["ctrlTitleObj"]  =
        {
            "ctrlTitleId"    : null,
            "ctrlTitleText" : null,
        }
    }

     // For NowPlayingAVRCP13 and NowPlayingAVRCP14 all details needed
    else
    {
        log.debug("inside populate now playing vtrl..else");
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NowPlayingAVRCP14")
        {
            this._cachedScreenTitle = null;
        }
        else if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NowPlayingAVRCP13")
        {
            this._cachedScreenTitle = null;
        }
        
        controlConfigObj["ctrlStyle"] =  "Style2",
        
        controlConfigObj["ctrlTitleObj"]  =
        {
            "ctrlTitleId"    : null,
            "ctrlTitleText"  : this._cachedScreenTitle
        }
        
        if(songDetails.titleInfo === "")
        {
            controlConfigObj["audioTitleObj"] =
            {
                "audioTitleId"    : "Unknown",
                "audioTitleText"  : null,
                "audioTitleIcon" : "common/images/icons/IcnListSong.png"
            }
        }
        else
        {
            controlConfigObj["audioTitleObj"] =
            {
                "audioTitleId"    : null,
                "audioTitleText"  : songDetails.titleInfo,
                "audioTitleIcon" : "common/images/icons/IcnListSong.png"
            }            
        }
        
        if(songDetails.artistInfo === "")
        {
            controlConfigObj["detailLine1Obj"] =
            {
                "detailTextId"   : "Unknown",
                "detailText"     : null,
                "detailIcon"     : "common/images/icons/IcnListContact_Placeholder.png"
            }
        }
        else
        {
            controlConfigObj["detailLine1Obj"] =
            {
                "detailTextId"   : null,
                "detailText"     : songDetails.artistInfo,
                "detailIcon"     : "common/images/icons/IcnListContact_Placeholder.png"
            }
            
        }
        if(songDetails.albumInfo === "")
        {
            controlConfigObj["detailLine2Obj"] =
            {
                "detailTextId"   : "Unknown",
                "detailText"     : null,
                "detailIcon"     : "common/images/icons/IcnListCdPlayer_En.png"
            }
        }
        else
        {
            controlConfigObj["detailLine2Obj"] =
            {
                "detailTextId"   : null,
                "detailText"     : songDetails.albumInfo,
                "detailIcon"     : "common/images/icons/IcnListCdPlayer_En.png"
            }            
        }
    }
    log.debug("inside populate now playing vtrl..setnowplaying");
    this._currentContextTemplate.nowPlaying4Ctrl.setNowPlayingConfig(controlConfigObj, null);
}

// file Navigation update
btaudioApp.prototype._populateFileNavigation = function()
{   
    log.debug("btaudioApp _populateFileNavigation called...");
    switch (this._currentContext.ctxtId)
    {
        case "FileNavigation":
            if(this._subItemCount != 0)
            {
                if(this._leftButtonStyle)
                {
                    framework.common.setLeftBtnStyle(this._leftButtonStyle);
                }
                if(this._cachedFolderName === "Unknown")
                {
                    var ctrlData =
                    {
                        titleStyle : "style02",
                        text1Id : this._cachedFolderName
                    }                
                }
                else
                {
                    var ctrlData =
                    {
                        titleStyle : "style02",
                        text1 : this._cachedFolderName
                    }                
                }    
                if(this._currentContextTemplate)
                {
                    this._currentContextTemplate.list2Ctrl.setTitle(ctrlData);  
                        this._currentContextTemplate.list2Ctrl.setDataList({
                        itemCountKnown : true,
                        itemCount : this._subItemCount,
                        items : []
                    });
                    this._currentContextTemplate.list2Ctrl.updateItems(0, this._subItemCount-1);
                }
                framework.sendEventToMmui(this.uiaId, "GetSongList", {payload:{count:this._requestChunkSize, offset : this._offset}});
            }
            else
            {
                if(this._leftButtonStyle)
                {
                    framework.common.setLeftBtnStyle(this._leftButtonStyle);
                }
                if(this._btDeviceName)
                {
                    this._populateDeviceName();
                }
                if(this._cachedFolderName === "Unknown")
                {
                    var ctrlData =
                    {
                        titleStyle : "style02",
                        text1Id : this._cachedFolderName
                    }                
                }
                else
                {
                    var ctrlData =
                    {
                        titleStyle : "style02",
                        text1 : this._cachedFolderName
                    }                
                }                    
                this._currentContextTemplate.list2Ctrl.setTitle(ctrlData);  
                if(this._currentContextTemplate)
                {
                    this._currentContextTemplate.list2Ctrl.setLoading(false);
                        this._currentContextTemplate.list2Ctrl.setDataList({
                        itemCountKnown : true,
                        itemCount : this._subItemCount,
                        items : []
                    });
                }
            }
            break;
        default:
            break;        
    }
}

// Update folder Item in FileNavigation

btaudioApp.prototype._populateFileNavigationFolderItem = function()
{
    log.debug("btaudioApp _populateFileNavigationFolderItem called...");  
    
    if (this._currentContext.ctxtId === "FileNavigation" && this._currentContextTemplate)
    {
        var currentList = this._currentContextTemplate.list2Ctrl;     
  
        // don't we have a data list?
        if (!currentList.hasDataList())
        {
            // set empty datalist as we don't have any items yet
            currentList.setDataList({
                itemCountKnown : true,
                itemCount : this._subItemCount,
                items : []
            });
            currentList.updateItems(0, this._subItemCount-1);
        }
    }
    // now proceed filling the items
    var itemLabel = this._cachedFolderItem.name;
    var listItemIndex = this._cachedFolderItem.index;
    var folderItemAttribute = this._cachedFolderItem.attribute;
    var type = this._cachedFolderItem.type;
    var itemData;
    var item;    
    
    log.debug("Value of listitemindex is" +listItemIndex);

    if (this._cachedFolderItem.type === "File")
    {
        if(itemLabel)
        {
            // create track item
            itemData = { eventName : "SelectTrack", track : itemLabel , listIndex : listItemIndex , attribute : folderItemAttribute, itemType : type};
            item = {
                appData : itemData,
                text1 : itemLabel,
                itemStyle : 'style02',
                image1 : "common/images/icons/IcnListSong.png",
                hasCaret : false
            }
        }
        else
        {            
            itemLabel = "Unknown";
            // create track item
            itemData = { eventName : "SelectTrack", track : itemLabel , listIndex : listItemIndex , attribute : folderItemAttribute, itemType : type};
            item = {
                appData : itemData,
                text1Id : itemLabel,
                itemStyle : 'style02',
                image1 : "common/images/icons/IcnListSong.png",
                hasCaret : false
            }
        
        }
        
    }
    else if (this._cachedFolderItem.type === "Folder")
    {
        if(itemLabel)
        {
            // create folder item
            itemData = { eventName : "SelectFolder", folder : itemLabel , listIndex : listItemIndex , attribute : folderItemAttribute, itemType : type};
            item = {
                appData : itemData,
                text1 : itemLabel,
                itemStyle : 'style02', 
                image1 : "common/images/icons/IcnListFolder.png",
                hasCaret : false
            }            
        }
        else
        {
            itemLabel = "Unknown";
            // create folder item
            itemData = { eventName : "SelectFolder", folder : itemLabel , listIndex : listItemIndex , attribute : folderItemAttribute, itemType : type};
            item = {
                appData : itemData,
                text1Id : itemLabel,
                itemStyle : 'style02', 
                image1 : "common/images/icons/IcnListFolder.png",
                hasCaret : false
            }            
        }            
    }
    else if (this._cachedFolderItem.type === "Playlist")
    {
        if(itemLabel)
        {
            // create folder item
            itemData = { eventName : "SelectFolder", folder : itemLabel , listIndex : listItemIndex , attribute : folderItemAttribute, itemType : type};
            item = {
                appData : itemData,
                text1 : itemLabel,
                itemStyle : 'style02', 
                image1 : "common/images/icons/IcnListPlaylist_En.png",
                hasCaret : false
            }            
        }
        else
        {
            itemLabel = "Unknown";
            // create folder item
            itemData = { eventName : "SelectFolder", folder : itemLabel , listIndex : listItemIndex , attribute : folderItemAttribute, itemType : type};
            item = {
                appData : itemData,
                text1Id : itemLabel,
                itemStyle : 'style02', 
                image1 : "common/images/icons/IcnListPlaylist_En.png",
                hasCaret : false
            }            
        }            
    }

    log.debug("btaudioApp _populateFileNavigationFolderItem called...value of listItemIndex - 1 is" + (listItemIndex - 1));
    
    
    // update item
    if (this._currentContext.ctxtId === "FileNavigation" && this._currentContextTemplate)
    {
        var currentList = this._currentContextTemplate.list2Ctrl;        
        currentList.dataList.items[listItemIndex - 1] = item;
		log.info("Before update items in app for index " +(listItemIndex - 1));
        currentList.updateItems(listItemIndex - 1, listItemIndex - 1);
		log.info("After update items in app for index " +(listItemIndex - 1));
        currentList.dataList.vuiSupport = true;
        // this pushes the item to a local dataList copy if needed
        this._cachedDataList = this._currentContextTemplate.list2Ctrl.dataList; 
    }
    else
    {
        log.debug("Inside else");
        this._cachedDataList.items[listItemIndex - 1] = item;
    }    
} 


// Update Play Pause button
btaudioApp.prototype._updatePlayPauseButton = function(template)
{
    if (this._playerState === "PLAYING" || this._playerState === "SCAN_FWD" ||    this._playerState === "SCAN_BKD")
    {
        state = "Pause";
        template.nowPlaying4Ctrl.umpCtrl.setButtonState("Play/Pause", state)
    }
    else
    {
         state = "Play";
         template.nowPlaying4Ctrl.umpCtrl.setButtonState("Play/Pause", state)
    }
}

// Set Shuffle state
btaudioApp.prototype._setRandomButtonState = function(template)
{
    if(this._cachedRandomCapability)
    {
        template.nowPlaying4Ctrl.umpCtrl.setButtonState("ToggleShuffle", this._cachedRandomState);
    }    
}

// Set Repeat status
btaudioApp.prototype._setRepeatButtonState = function(template)
{
    if(this._cachedRepeatCapability)
    {
        template.nowPlaying4Ctrl.umpCtrl.setButtonState("ToggleRepeat", this._cachedRepeatState);
    }    
}

// Set Scan Button status
btaudioApp.prototype._setScanButtonState = function(template)
{
    if(this._cachedScanCapability)
    {
        template.nowPlaying4Ctrl.umpCtrl.setButtonState("ScanPlay", this._cachedScanState);
    }    
}


// Populate Device Name in sbName
btaudioApp.prototype._populateDeviceName = function()
{
    var subMap = {"deviceName" : this._btDeviceName};
    var text1Id = "BTAudio";
    if(this._currentContext && this._currentContext.ctxtId)
    {
        if(this._btDeviceName)
        {
            switch(this._currentContext.ctxtId)
            {
                case "NoDevice":
                case "Disconnect" :
                case "FileNavigation" :
                case "DeviceUnsupported" :
                case "MobileDeviceError" :
                case "SongUnsupported" :
                case "BrowsingUnsupported" :
                case "NowPlayingA2DP" :
                case "NowPlayingAVRCP10" :
                case "NowPlayingAVRCP13" :
                case "NowPlayingAVRCP14" :
                    framework.common.setSbNameId(this.uiaId, text1Id, subMap);
                    break;
                default :
                    log.debug("btaudioApp: Unknown context", this._currentContext.ctxtId);
                    break;
            }
        }
    }
}

btaudioApp.prototype._resetFileNavigationVar = function()
{
    this._subItemCount = 0;
    this._requestChunkSize = 25; // Chunk Size request from MMUI.
    this._offset = 0;
    this._actualDataCount = 0;    
    if(this._currentContextTemplate)
    {
        // set empty datalist as we don't have any items yet
        this._currentContextTemplate.list2Ctrl.setDataList({});        
    }
    this._cachedDataList = 
    {
            itemCountKnown : true,
            itemCount : 0,
            items : []
    }  
}

btaudioApp.prototype._scrubberElapsedTime = function()
{
 
  this._enteredelapsedtimehandler = 1;
  log.info("this._elapsedTime"+this._elapsedTime);
  if(this._elapsedTime<=2147483647)
  {
		this._min = (this._elapsedTime) / (1000*60);
		this._sec = Math.floor((this._elapsedTime % (1000*60)) / 1000);
		log.info("this._min"+this._min);
		log.info("this._sec"+this._sec);
		if(this._sec < 10)
		{
			this._sec = '0' + this._sec;
		}
		string = Math.floor(this._min) + ":" + this._sec;  
		log.info("string"+string);	
		this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setElapsedTime(string);    
		this._setUpdateScrubber();
  }
  else
  {
		string="";
		this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setElapsedTime(string); 
		this._sec =-1;
		this._min =-1;
  }
}


btaudioApp.prototype._setUpdateScrubber = function()
{
    log.debug("_setUpdateScrubber");
    if(this._cachedSongDetails.trackDuration != 0 && this._elapsedTime<=2147483647)
    {
        var progress = this._elapsedTime / this._cachedSongDetails.trackDuration;
        this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.updateScrubber(progress);
    }
    else
    {
        this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.updateScrubber(0);
    }
}

btaudioApp.prototype._setTotalElapsedTime = function()
{
    this._min1 = (this._cachedSongDetails.trackDuration) / (1000*60);
    this._sec1 = Math.floor((this._cachedSongDetails.trackDuration  % (1000*60)) / 1000);
    if(this._sec1 < 10)
    {
        this._sec1 = '0' + this._sec1;
    }
    string1 = Math.floor(this._min1) + ":" + this._sec1;   
    this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setTotalTime(string1);
}


btaudioApp.prototype._slideCallback = function(buttonRef, appData, params)
{
    log.debug("btaudioApp: _slideCallback() called...", buttonRef, appData, params);    
}


btaudioApp.prototype._MobileDeviceError = function()
{
    framework.common.startTimedSbn(this.uiaId, "MobileDeviceError", "MobileDeviceError", {sbnStyle : "Style01", text1Id : "MobileDeviceError"}); // add/update a state SBN in the display queue
}


/**************************
 * Framework register
 **************************/
framework.registerAppLoaded("btaudio",null, true);
