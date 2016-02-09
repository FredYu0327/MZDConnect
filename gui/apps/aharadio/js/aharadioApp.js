/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: aharadioApp.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: ayonchn
 Date: 17-December-2012
 __________________________________________________________________________

 Description: IHU GUI aharadio App

 Revisions:
 v0.1 (17-Dec-2012)
 v0.2 (13-Feb-2013) Changes in EpisodesList, ContentsList, added SetContentSelectedIndex, TimedSbn_SetContentTitle
 v0.3 (18-Feb-2013) Changes in _updateItem
 v0.4 (26-Feb-2013) Added address and image path to episodes
 v0.5 (27-Feb-2013) Added scrolling to selected station/episode - FIXME: used setTimeout workaround for setting focussedItem
 v0.6 (28-Feb-2013) Added selectedIndex caching, SetStationTitle and SetPlayerStatus
 v0.7 (29-Feb-2013) Added changes in cache clearing, fixed selected button configuration
 v0.8 (03-Mar-2013) Fixed button state issues, fixed missing decimal point in tempreture and distance
 v0.9 (05-Mar-2013) Removed requestMoreDataCallback
 v1.0 (06-Mar-2013) Added dynamic loading of new Episodes
 v1.1 (08-Mar-2013) Changed buttons order configuration
 v1.2 (12-Mar-2013) Added stop button
 v1.3 (14-Mar-2013) Fixed stop button, caching issue fixed
 v1.4 (19-Mar-2013) Added "Cancel" button in SplashScreen context
 v1.5 (25-Mar-2013) Minor bugfix in MainMenu
 v1.6 (03-Apr-2013) ErrorCondition showing all errors
 v1.7 (09-Apr-2013) Added SetElapsedTime msg
 v1.8 (09-Apr-2013) Added 3.9 labels
 v1.9 (10-Apr-2013) Fixed elapsed time caching issue
 v1.10 (15-Apr-2013) Added additional elapsed time parameters
 v1.11 (18-Apr-2013) Added tool tip support
 v1.12 (22-Apr-2013) Updated to NowPlaying3aTmplt
 v1.13 (24-Apr-2013) Changed how playpause and playstop are set
 v1.14 (24-Apr-2013) Changed how SetPlayerStatus works
 v2.00 (09-May-2013) Updated to NowPlaying4, added station branding (SW00117603)
 v2.01 (13-May-2013) Added dynamic UMP button image path  (SW00117264)
 v2.02 (13-May-2013) Changed NowPlaying4 style for LBS to 5 (SW00117597)
 v2.03 (14-May-2013) Added SetContentRatingImage (SW00117597)
 v2.04 (14-May-2013) Fixed LBS brandingImage cache issue
 v2.05 (16-May-2013) Removed scrubber from LBSDetail (SW00118006)
 v2.06 (17-May-2013) Added UMP button checks before calling setButtonState
 v2.07 (17-May-2013) Switched MainMenu and Episodes UMP buttons (SW00118545)
 v2.08 (20-May-2013) Added Forward 30 seconds UMP icon (SW00114563)
 v2.09 (20-May-2013) Moved forward30s icon to aha/images
 v2.10 (22-May-2013) Fixed shout timer increment (SW00116027)
 v2.11 (23-May-2013) Added StartShout event (SW00116027)
 v2.12 (29-May-2013) Added VUI support for selectByLine (SW00118876)
 v2.13 (31-May-2013) Added Aha logo in the statusbar (SW00117999, SW00108799)
 v2.14 (04-Jun-2013) Changed common.OK to common.Ok (SW00120269)
 v2.15 (04-Jun-2013) Specified tabsGroup (SW00119338)
 v2.16 (04-Jun-2013) Added validation in ShoutRecording (SW00120378)
 v2.17 (15-Jun-2013) Added missing SBNs (SW00121653)
 v2.18 (15-Jun-2013) Replaced common/images/icons/IcnSbMusic.png with IcnSbEnt.png
 v2.19 (27-Jun-2013) Migrated to Dialog3, SplashScreen logo dimensions changed (SW00122686)
 v2.20 (10-Jul-2013) Removed cancel button from ErrorCondition context (SW00124318)
 v2.21 (26-Jul-2013) Preserved UMP buttons focus when setting button configuration (SW00125037)
 v2.22 (29-Jul-2013) Added custom image rating in LBSDetail (SW00119697)
 v2.23 (03-Aug-2013) Added missing UMP buttons tooltips (SW00127054)
 v2.24 (17-Aug-2013) List items style changed, hasCaret set to false (SW00127921)
 v2.25 (17-Aug-2013) Added branding image in Episodes (SW00127920)
 v2.26 (17-Aug-2013) Changed tooltips to Like/Dislike (SW00128503)
 v2.27 (23-Aug-2013) Dictionaries updated for all languages (SW00129751)
 v2.28 (24-Aug-2013) Removed cache clearing causing missing metadata (SW00129153)
 v2.29 (24-Aug-2013) Added address to LBS Episodes list (SW00128053)
 v2.30 (26-Aug-2013) Removed Yelp branding from the main Episodes list (SW00129880)
 v2.31 (27-Aug-2013) Dictionaries updated for MX and CN languages (SW00130315)
 v2.32 (30-Aug-2013) Changed aha logo icon in the SBN to smaller icon, without text (SW00127909)
 v2.33 (29-Aug-2013) Fixed playpause button tooltip flicker (SW00130191)
 v2.34 (30-Aug-2013) Fixed bug causing wrong error display for AhaNotFound (SW00130220)
 v2.35 (02-Sep-2013) Changed the structure of the error handling context and added some fixme's (SW00130220)
 v2.36 (09-Sep-2013) Dictionaries updated for CS, EE, FI, HR, JP, LT, LV, NL, NO, PL, PT, SE, TR languages. (SW00131469)
 v2.37 (10-Sep-2013) Dictionaries updated for BG, GR, AU, HU, RO, SK, RS languages (SW00131775)
 v2.38 (13-Sep-2013) Dictionaries updated (SW00132041)
 v2.39 (17-Sep-2013) Dictionaries updated (SW00132327)
 v2.40 (19-Sep-2013) Distance and PhoneNumber visualisation and position fixed (SW00129869, SW00127918, SW00127917)
 v2.41 (20-Sep-2013) Fixed bug causing not smooth scrolling through the episode list with first entry = empty (SW00131360)
 v2.42 (25-Sep-2013) Remove Branding Image from aha Episodes Screens iSC607 (SW00133217)
 v2.43 (26-Sep-2013) Distance and PhoneNumber configuration
 v2.44 (27-Sep-2013) Rearrange Error received strings (SW00133523)
 v2.45 (30-Sep-2013) Fixed bug causing tool tip flickr (SW00131392)
 v2.46 (30-Sep-2013) Fixed bug causing user to be able to long press shortPressOnly-buttons (SW00131343)
 v2.47 (02-Sep-2013) Fixed bug causing cached station list to be not cleared from previous aha session (SW00133434)
 v2.48 (23-Oct-2013) Changed the stringId of the InsufficientConnectivity_Alert to display correct text in the wink and SBN (SW00135802)
 v2.49 (07-Nov-2013) Changed the buffering logic in order to change stations appropriately and display correct metadata (SW00136607)
 v2.50 (18-Nov-2013) aha Progress Bar / Buffering status API implementation (SW00134589, SW00127729)
 v2.51 (19-Nov-2013) UMP Configuration setting fixes when one configuration is being sent twice (SW00137579)
 v2.52 (19-Nov-2013) Fixes for proper UMP configuration setting (SW00137577)
 v2.53 (13-Feb-2014) Fixed bug causing wrong behaviour of call-button (SW00141654)
 v2.54 (30-May-2014) Fixed bug causing Aha to reboot - for MY15 (SW00149185)
 v2.55 (09-Jun-2014) Cleaning of the graphic assets (SW00150182)
 v2.56 (11-Jun-2014) Background base color changed from Red to Blue (Temporary Green until studio releases blue) (SW00149881)
 ______________________________________________________________________
 */

log.addSrcFile("aharadioApp.js", "aharadio");

/**
 * App constructor
 * =========================
 * @param {string} - uiaid of the app
 * @return {aharadioApp} - extends baseApp
 */
function aharadioApp(uiaId)
{

    log.debug("constructor called...");

    // Base application functionality is provided in a common location via this call to baseApp.init().
    // See framework/js/BaseApp.js for details.
    baseApp.init(this, uiaId);

    // All feature-specific initialization is done in appInit()

}

/**
 * =========================
 * Standard App Functions
 * =========================
 */

/**
 * App init routine
 * Called just after the app is instantiated by framework.
 * =========================
 * @return {void}
 */
aharadioApp.prototype.appInit = function()
{
    log.debug("aharadioApp appInit called...");

    framework.localize.loadAppDict("aharadio");

    /* ------------------------------
     * TEST APPLICATION
     * ------------------------------
     */
    if (framework.debugMode)
    {
        utility.loadScript("apps/aharadio/test/aharadioAppTest.js");
    }


    /* ------------------------------
     * INTERNAL PROPERTIES AND CONFIG
     * ------------------------------
     */
    this._recordinInterval = null; // reference to the record interval timer
    this._sliderValue = 0;         // meter value
    this._timerStarted = null;         // meter value
    this._listRequestCount = 20;   // request size
    this._setButtonQueue = [];     // queue for setButton messages to be applied when the player is not in buffering
    this._currentlyFocussedButton = {buttonId : null, buttonIndex : -1}; // holds the id of the currently focused button to attempt focus placement
    this._cacheRecoverableErrorState = false;


    /* ------------------------------
     * MESSAGE CACHE
     * ------------------------------
     */
    this._cacheEpisodesList = null;
    this._cacheStationLists = {};
    this._cacheStationData = {
    	contentTitle : '',
        contentName : '',
        brandingImage : '',
        detail2 : '',
        detail3 : '',
        detail4 : '',
        contentArt : '',
    };
    this._cacheLBSDetails = {
    	contentTitle : '',
        contentName : '',
        brandingImage : '',
        detail2 : '',
        detail3 : '',
        detail4 : '',
        contentArt : '',
    };
    this._cachePlayMode = null;
    this._cacheElapsedTime = null;
    this._cacheTotalTime = null;
    this._cacheRating = null;
    this._cachePhoneNumber = null;
    this._cacheDistance = null;
    this._selectedTab = 0;


    /* ------------------------------
     * UMP CONFIG
     * ------------------------------
     */
    this._buffering = false;
    var selectCallback = this._umpDefaultSelectCallback.bind(this);
    var holdStartCallback = this._umpHoldStartCallback.bind(this);
    var holdStopCallback = this._umpHoldStopCallback.bind(this);
    var dialogSelectCallback = this._dialogSelectCallback.bind(this);

    // button-to-id dictionary
    // this._buttonsIdTable = ["playpause", "thumbsUp", "thumbsDown", "source", "episodes", "previous", "next", "rewind", "fastforward", "navi", "call", "soundsettings", "shout", "mainmenu"];
    this._buttonsIdTable = ["source", "mainmenu", "episodes", "shout", "navi", "call", "thumbsUp", "thumbsDown", "rewind", "previous", "playpause", "playstop", "next", "fastforward", "soundsettings"];
    //@formatter:off
    // FIXME: dislike and like are missing

    this._umpButtonMinimalConfig = new Object();
    this._umpButtonMinimalConfig["playpause"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpPlayPause",
        currentState:"Play",
        stateArray: [
            {
                state:"Play", labelId: "common.Tooltip_IcnUmpPlayPause_Play"
            },
            {
                state:"Pause", labelId: "common.Tooltip_IcnUmpPlayPause_Pause"
            },
        ],
        disabled : false,
        appData : "playpause",
        selectCallback: selectCallback
    };

    this._umpButtonMinimalConfig["source"] =
    {
        buttonBehavior : "shortPressOnly",
        disabled : false,
        imageBase : "IcnUmpEntMenu",
        appData : "source",
        selectCallback: selectCallback
    };
    this._umpButtonMinimalConfig["soundsettings"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpEqualizer",
        disabled : false,
        appData : "soundsettings",
        selectCallback: selectCallback,
    };
    this._umpButtonMinimalConfig["mainmenu"] =
    {
        buttonBehavior : "shortPressOnly",
        disabled : false,
        imageBase : "IcnUmpCurrentList",
        appData : "mainmenu",
        labelId : "MainList_Tooltip",
        selectCallback: selectCallback
    };

    ///////////////////////////
    this._umpButtonConfig = new Object();
    this._umpButtonConfig["source"] =
    {
        buttonBehavior : "shortPressOnly",
        disabled : false,
        imageBase : "IcnUmpEntMenu",
        appData : "source",
        selectCallback: selectCallback
    };

    this._umpButtonConfig["mainmenu"] =
    {
        buttonBehavior : "shortPressOnly",
        disabled : false,
        imageBase : "IcnUmpCurrentList",
        appData : "mainmenu",
        labelId : "MainList_Tooltip",
        selectCallback: selectCallback
    };

    this._umpButtonConfig["episodes"] =
    {
        buttonBehavior : "shortPressOnly",
        disabled : false,
        imageBase : "IcnUmpTopList",
        appData : "episodes",
        labelId : "Episodes_Tooltip",
        selectCallback: selectCallback
    };

    this._umpButtonConfig["previous"] =
    {
        buttonBehavior : "shortAndHold",
        imageBase : "IcnUmpPreviousAudio",
        disabled : false,
        appData : "previous",
        selectCallback: selectCallback,
    };

    this._umpButtonConfig["rewind"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpBack15s",
        disabled : false,
        appData : "rewind",
        selectCallback: selectCallback,
    };

    this._umpButtonConfig["fastforward"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpFwd30s",
        disabled : false,
        appData : "fastforward",
        selectCallback: selectCallback,
    };

    this._umpButtonConfig["soundsettings"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpEqualizer",
        disabled : false,
        appData : "soundsettings",
        selectCallback: selectCallback,
    };

    this._umpButtonConfig["shout"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpMic",
        disabled : null,
        appData : "shout",
        selectCallback: selectCallback,
    };

    this._umpButtonConfig["playpause"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpPlayPause",
        currentState:"Play",
        stateArray: [
            {
                state:"Play", labelId: "common.Tooltip_IcnUmpPlayPause_Play"
            },
            {
                state:"Pause", labelId: "common.Tooltip_IcnUmpPlayPause_Pause"
            },
        ],
        disabled : false,
        appData : "playpause",
        selectCallback: selectCallback
    };
    this._umpButtonConfig["playstop"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpPlayPause",
        currentState:"Stop",
        stateArray: [
            {
                state:"Play", labelId: "common.Tooltip_IcnUmpPlayPause_Play"
            },
            {
                state:"Stop", labelId: "common.Tooltip_IcnUmpPlayPause_Stop"
            },

        ],
        disabled : false,
        appData : "playstop",
        selectCallback: selectCallback
    };
    this._umpButtonConfig["thumbsUp"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpThumbsUp",
        currentState:"Unsel",
        stateArray: [
            {
                state:"Sel", labelId: "LikeTooltip"
            },
            {
                state:"Unsel"  , labelId: "LikeTooltip"
            },

        ],
        disabled : false,
        appData : "thumbsUp",
        selectCallback: selectCallback
    };

    this._umpButtonConfig["thumbsDown"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpThumbsDown",
        currentState:"Unsel",
        stateArray: [
            {
                state:"Sel",   labelId: "DislikeTooltip"
            },
            {
                state:"Unsel", labelId: "DislikeTooltip"
            },

        ],
        disabled : false,
        appData : "thumbsDown",
        selectCallback: selectCallback
    };

    this._umpButtonConfig["next"] =
    {
        buttonBehavior : "shortAndHold",
        imageBase : "IcnUmpNextAudio",
        disabled : false,
        appData : "next",
        selectCallback: selectCallback,
    };

    this._umpButtonConfig["navi"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpMap",
        disabled : false,
        appData : "navi",
        selectCallback: selectCallback,
    };

    this._umpButtonConfig["call"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpCall",
        disabled : null,
        appData : "call",
        selectCallback: selectCallback,
    };

    this._umpButtonConfig["like"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "",
        disabled : null,
        appData : "like",
        label : null,
        labelId : "LikeTooltip",
        selectCallback: selectCallback,
    };

    this._umpButtonConfig["dislike"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "",
        disabled : null,
        appData : "dislike",
        label : null,
        labelId : "DislikeTooltip",
        selectCallback: selectCallback,
    };
    //@formatter:on

    this._scrubberConfig = {
        scrubberStyle : "Style01",
        mode : "progress",
        slideCallback : null, //slideCallback,
        minChangeInterval : 0, //250,
        settleTime: 1000,
        min : 0,
        max : 1,
        increment : 0.01,
        elapsedTime : "00:00",
        totalTime : "00:00",
        value : 0,
        appData : null,
        disabled : false,
        buffering : false
    };


    this._umpConfig =
    {
        hasScrubber                 : true,
        scrubberVisible 			: false,
        retracted                   : false,
        tooltipsEnabled             : true,
        initialButtonFocus          : "source",
        buttonConfig                : this._umpButtonMinimalConfig,
        scrubberConfig              : this._scrubberConfig,
        defaultSelectCallback       : this._umpDefaultSelectCallback.bind(this),
        defaultLongPressCallback    : null,
        defaultScrubberCallback     : null,
        defaultHoldStartCallback    : this._umpHoldStartCallback.bind(this),
        defaultHoldStopCallback     : this._umpHoldStopCallback.bind(this),
        defaultFocusCallback        : this._umpFocusCallback.bind(this),
    };

    this._umpConfigLBS =
    {
        hasScrubber                 : true,
        scrubberVisible 			: false,
        retracted                   : false,
        tooltipsEnabled             : true,
        initialButtonFocus          : "source",
        buttonConfig                : this._umpButtonMinimalConfig,
        scrubberConfig              : this._scrubberConfig,
        defaultSelectCallback       : this._umpDefaultSelectCallback.bind(this),
        defaultLongPressCallback    : null,
        defaultScrubberCallback     : null,
        defaultHoldStartCallback    : this._umpHoldStartCallback.bind(this),
        defaultHoldStopCallback     : this._umpHoldStopCallback.bind(this),
        defaultFocusCallback        : this._umpFocusCallback.bind(this),
    };

    /* ------------------------------
     * DATALISTS
     * Default datalists for list contexts
     * ------------------------------
     */
    var dataList = {
        itemCountKnown : true,
        vuiSupport : true,
        itemCount : 0,
        items : []
    };


    /* ------------------------------
     * CONTEXT TABLE
     * Context descriptions and default content
     * ------------------------------
     */
    //@formatter:off
    this._contextTable = {

        "SplashScreen" : {
            // sbNameId : "",
            sbNameImage : "apps/aharadio/images/IcnSbLogo_Aha.png",
            template : "Dialog3Tmplt",
        	controlProperties : {
        		Dialog3Ctrl : {

        			contentStyle : "style09",
			        fullScreen : false,
			        backgroundStyle : "black",
			        buttonCount : 1,
			        buttonConfig : {
			            "button1" : {
			                selectCallback: selectCallback,
			                buttonColor: "normal",
			                buttonBehavior : "shortPressOnly",
			                labelId: "entMenu",
			                subMap : null,
			                appData : "source",
			                disabled : false
			            }
			        }, // end of buttonConfig
			        imagePath1 : "apps/aharadio/images/LogoSplashAha.png",
			        meter : {"meterType":"indeterminate", "meterPath":"common/images/IndeterminateMeter.png"},
        		}
        	},
        	"contextInFunction" : this._SplashScreenCtxtIn.bind(this),
        }, // end of "SplashScreen"

        "NowPlaying" : {
            // sbNameId : "",
            sbNameImage : "apps/aharadio/images/IcnSbLogo_Aha.png",
            "template" : "NowPlaying4Tmplt",
            "controlProperties": {
                "NowPlayingCtrl" : {
                    ctrlStyle : 'Style4',
                    ctrlTitleObj :{
                                    "ctrlTitleId"    : null,
                                    "subMap"         : null,
                                    "ctrlTitleText"  : null,
                                    "ctrlTitleIcon"  : null,
                                  },
                    umpConfig : this._umpConfig,
                } // end of properties for "NowPlayingCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._NowPlayingCtxtReadyToDisplay.bind(this),
            "contextInFunction" : this._NowPlayingCtxtIn.bind(this),
        }, // end of "NowPlaying"

        "LBSDetail" : {
            // sbNameId : "",
            sbNameImage : "apps/aharadio/images/IcnSbLogo_Aha.png",
            "template" : "NowPlaying4Tmplt",
            "controlProperties": {
                "NowPlayingCtrl" : {
                    ctrlStyle : 'Style5',
                    ctrlTitleObj :{
                                    "ctrlTitleId"    : null,
                                    "subMap"         : null,
                                    "ctrlTitleText"  : null,
                                    "ctrlTitleIcon"  : null,
                                  },
                    umpConfig : this._umpConfigLBS,
                } // end of properties for "NowPlayingCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._LBSDetailCtxtReadyToDisplay.bind(this),
            "contextInFunction" : this._LBSDetailCtxtIn.bind(this),
        }, // end of "LBSDetail"

        "AhaMainMenu" : {
            // sbNameId : "",
            sbNameImage : "apps/aharadio/images/IcnSbLogo_Aha.png",
            "template" : "List2Tmplt",
            leftBtnStyle : "goBack",
            "controlProperties": {
                "List2Ctrl" : {
                    "dataList": dataList,
                    numberedList : true,
                    titleConfiguration : "tabsTitle",
                    tabsButtonConfig : {
                        "style":"tabsStyle1",
                        "defaultSelectCallback":null,
                        "numTabs":2,
                        "currentlySelectedTab":0,
                        "tabsGroup":"aha",
                        "tabsConfig":[
                            {
                                "selectCallback" : this._listItemClickCallback.bind(this),
                                "label"         : null,
                                "labelId"       : "Preset",         //(string)
                                "subMap"        : null,
                                "tabStyle" : "tabsStyle1",
                                "appData" : {
                                    name: "presets"
                                }
                            },
                            {
                                "selectCallback" : this._listItemClickCallback.bind(this),
                                "label"         : null,
                                "labelId"       : "LBS",         //(string)
                                "subMap"        : null,
                                "tabStyle" : "tabsStyle1",
                                "appData" : {
                                    name: "LBS"
                                }
                            },
                    ],},
                    fullWidth : true,
                    selectCallback : this._listItemClickCallback.bind(this),
                    needDataCallback : this._requestMoreDataCallback.bind(this),
                }
            },
            "contextInFunction" : this._AhaMainMenuCtxtContextIn.bind(this),
            "readyFunction" : this._AhaMainMenuCtxtReadyToDisplay.bind(this),
            "contextOutFunction": this._AhaMainMenuCtxtOut.bind(this),
        }, // EOF AhaMainMenu

        "Episodes" : {
            // sbNameId : "",
            sbNameImage : "apps/aharadio/images/IcnSbLogo_Aha.png",
            template : "List2Tmplt",
            leftBtnStyle : "goBack",
            controlProperties: {
                List2Ctrl : {
                    dataList : dataList,
                    numberedList : true,
                    thickItems : true,
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',
                    },
                    selectCallback : this._listItemClickCallback.bind(this),   // this is called when an item is selected
                    needDataCallback : this._requestMoreDataCallback.bind(this),
                }
            },
            readyFunction: this._EpisodesTemplateReady.bind(this)
        }, // end of "Episodes"

        "ErrorCondition" : {
            // sbNameId : "",
            sbNameImage : "apps/aharadio/images/IcnSbLogo_Aha.png",
            "template" : "Dialog3Tmplt",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "titleStyle" : "titleStyle01",
                    "titleId" : "MobileDeviceError",
                    "contentStyle" : "style02",
                    "fullScreen" : false,
                    "buttonCount" : 1,
                    "buttonConfig" : {
                        "button1" : {
                            selectCallback: dialogSelectCallback,
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            labelId: "common.Ok",
                            appData : "Global.OK",
                            disabled : false
                        }
                    }, // end of buttonConfig
                    "text1Id" : "FunctioningProperly",
                } // end of properties for "Style03aDialog"
            }, // end of list of controlProperties
            "contextInFunction" : this._ErrorConditionCtxtIn.bind(this),
            "readyFunction" : this._ErrorConditionCtxtReadyToDisplay.bind(this),
        }, // EOF ErrorCondition

        "NoDevice" : {
            // sbNameId : "",
            sbNameImage : "apps/aharadio/images/IcnSbLogo_Aha.png",
            "template" : "Dialog3Tmplt",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "titleStyle" : "titleStyle01",
                    "titleId" : "NoDeviceConnected",
                    "contentStyle" : "style02",
                    "fullScreen" : false,
                    "buttonCount" : 2,
                    "buttonConfig" : {
                        "button1" : {
                            selectCallback: dialogSelectCallback,
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            labelId: "Back",
                            appData : "Global.GoBack",
                            disabled : false
                        },
                        "button2" : {
                            selectCallback: dialogSelectCallback,
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            labelId: "Connect",
                            appData : "Connect",
                            disabled : false
                        }
                    }, // end of buttonConfig
                    "text1Id" : "SetupBluetooth",
                } // end of properties for "Style03aDialog"
            }, // end of list of controlProperties
        }, // EOF NoDevice

        "ShoutCountDown" : {
            // sbNameId : "",
            sbNameImage : "apps/aharadio/images/IcnSbLogo_Aha.png",
            "template" : "Dialog3Tmplt",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "titleStyle" : "titleStyle01",
                    "titleId" : "ShoutReady",
                    "contentStyle" : "style02",
                    "fullScreen" : false,
                    "buttonCount" : 1,
                    "buttonConfig" : {
                        "button1" : {
                            selectCallback: dialogSelectCallback,
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            labelId: "common.Cancel",
                            appData : "Global.Cancel",
                            disabled : false
                        },
                    }, // end of buttonConfig
                } // end of properties for "Style03aDialog"
            }, // end of list of controlProperties
            "readyFunction" : this._ShoutCountDownTemplateReady.bind(this),
        }, // EOF NoDevice
        "ShoutRecording" : {
            // sbNameId : "",
            sbNameImage : "apps/aharadio/images/IcnSbLogo_Aha.png",
            "template" : "Dialog3Tmplt",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "titleStyle" : "titleStyle01",
                    "titleId" : "ShoutRecording",
                    // "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),
                    "contentStyle" : "style03",
                    "fullScreen" : false,
                    "imagePath1" : "common/controls/Dialog2/images/MicrophoneIcon.png",
                    "meter" : {"meterType":"determinate", "min":0, "max":1, "currentValue":0, "elapsedValue":"0:00", "totalValue":"0:00"},
                    "buttonCount" : 2,
                    "buttonConfig" : {
                        "button1" : {
                            selectCallback: dialogSelectCallback,
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            labelId: "common.Cancel",
                            appData : "Global.Cancel",
                            disabled : false
                        },
                        "button2" : {
                            selectCallback: dialogSelectCallback,
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            labelId: "Save",
                            appData : "Save",
                            disabled : false
                        }
                    }, // end of buttonConfig
                } // end of properties for "Style11Dialog"
            }, // end of list of controlProperties
            "contextInFunction": this._ShoutRecordingCtxtIn.bind(this),
            "readyFunction" : this._ShoutRecordingTemplateReady.bind(this),
            "displayedFunction": this._ShoutRecordingTemplateDisplayed.bind(this),
            "contextOutFunction": this._ShoutRecordingOut.bind(this),
        }, // end of "Style11Dialog"
        "ShoutLimit" : {
            // sbNameId : "",
            sbNameImage : "apps/aharadio/images/IcnSbLogo_Aha.png",
            "template" : "Dialog3Tmplt",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "contentStyle" : "style02",
                    "fullScreen" : false,
                    "buttonCount" : 2,
                    "buttonConfig" : {
                        "button1" : {
                            selectCallback: dialogSelectCallback,
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            labelId: "Discard",
                            appData : "Discard",
                            disabled : false
                        },
                        "button2" : {
                            selectCallback: dialogSelectCallback,
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            labelId: "Save",
                            appData : "Save",
                            disabled : false
                        }
                    }, // end of buttonConfig
                    "text1Id" : "RecordingLimit",
                } // end of properties for "Style03aDialog"
            }, // end of list of controlProperties
        }, // EOF NoDevice

    }; // end of this._contextTable
    //@formatter:on


    /* ------------------------------
     * MESSAGE TABLE
     * Message handlers
     * ------------------------------
     */
    //@formatter:off
    this._messageTable = {
        "SetContentTitle" :         this._SetContentTitleMsgHandler.bind(this),             // received in NowPlaying, LBSDetail
        "SetContentDetails":        this._SetContentDetailsMsgHandler.bind(this),           // received in NowPlaying, LBSDetail
        "SetContentPhoneNumber":    this._SetContentPhoneNumberMsgHandler.bind(this),
        "SetContentDistance":       this._SetContentDistanceMsgHandler.bind(this),
        "ContentsList":             this._ContentsListMsgHandler.bind(this),                // received in AhaMainMenu
        "EpisodesList":             this._EpisodesListMsgHandler.bind(this),                // received in Episodes
        "SetContentsListIcon":      this._SetContentsListIconMsgHandler.bind(this),         // received in AhaMainMenu
        "SetContentArt":            this._SetContentArtMsgHandler.bind(this),               // received in NowPlaying, LBSDetail
        "SetContentBrandingImage":  this._SetContentBrandingImageMsgHandler.bind(this),     // received in NowPlaying, LBSDetail
        "SetBuffering":             this._SetBufferingMsgHandler.bind(this),                // received in NowPlaying, LBSDetail
        "EnableBuffering":          this._EnableBufferingMsgHandler.bind(this),             // received in NowPlaying, LBSDetail
        "SetCountdown":             this._SetCountdownMsgHandler.bind(this),                // received in ShoutCountDown
        "SetButton" :               this._SetButtonMsgHandler.bind(this),                   // received in NowPlaying, LBSDetail
        "SetContentSelectedIndex":  this._SetContentSelectedIndexMsgHandler.bind(this),
        "TimedSbn_SetContentTitle": this._TimedSbn_SetContentTitleMsgHandler.bind(this),
        "SetStationTitle":          this._SetStationTitleMsgHandler.bind(this),             // received in NowPlaying, LBSDetail
        "SetPlayerStatus":          this._SetPlayerStatusMsgHandler.bind(this),             // received in NowPlaying, LBSDetail
        "SetPlayMode":              this._SetPlayModeMsgHandler.bind(this),                 // received in NowPlaying, LBSDetail
        "ElapsedTime":              this._ElapsedTimeMsgHandler.bind(this),                 // received in NowPlaying, LBSDetail
        "SetContentRatingImage":    this._SetContentRatingImageMsgHandler.bind(this),       // received in LBSDetail
        "RecoverableError":         this._RecoverableErrorMsgHandler.bind(this),

        "TimedSbn_ErrorMaintenance":            this._TimedSbn_ErrorMaintenanceMsgHandler.bind(this),
        "TimedSbn_ErrorMobileDevice":           this._TimedSbn_ErrorMobileDeviceMsgHandler.bind(this),
        "TimedSbn_ErrorNoNetworkConnection":    this._TimedSbn_ErrorNoNetworkConnection.bind(this),
        "TimedSbn_ErrorNetworkConnectionLost":  this._TimedSbn_ErrorNetworkConnectionLostMsgHandler.bind(this),
        "TimedSbn_InsufficientConnectivity":    this._TimedSbn_InsufficientConnectivityMsgHandler.bind(this),
		 "TimedSbn_LikeDislikeStatus" :  this._TimedSbnLikeDislikeStatusHandler.bind(this),
    }; // end of this._messageTable
    //@formatter:on

}

/**************************
 * aharadio App Functions *
 **************************/

/**
 * =========================
 * Context Handlers
 * =========================
 * Aha Context List
 * - SplashScreen       (dialog)
 * - NowPlaying         (ump)
 * - LBSDetail          (list)
 * - AhaMainMenu        (list)
 * - Episodes           (list)
 * - ErrorCondition     (dialog)
 * - NoDevice           (dialog)
 * - ShoutCountDown     (dialog)
 * - ShoutRecording     (dialog)
 * - ShoutLimit         (dialog)
 * =========================
 */


/**
 * Context In Callback (ErrorCondition)
 * =========================
 * @return {void}
 */

aharadioApp.prototype._ErrorConditionCtxtIn = function()
{
    if(this._hasContextPayload() && this._currentContext.params.payload.errorReason)
    {

        if(this._currentContext.params.payload.errorReason === "AhaMaintenance" || this._currentContext.params.payload.errorReason === "ConnectionLost")
        {
            this._contextTable['ErrorCondition'].controlProperties.Dialog3Ctrl.titleId = null;
            this._contextTable['ErrorCondition'].controlProperties.Dialog3Ctrl.titleStyle = null;
        }
        else
        {
            this._contextTable['ErrorCondition'].controlProperties.Dialog3Ctrl.titleStyle = 'titleStyle01';
        }
    }

}

aharadioApp.prototype._ErrorConditionCtxtReadyToDisplay = function ()
{

    if(this._hasContextPayload() && this._currentContext.params.payload.errorReason)
    {
        var errorCondition = this._currentContext.params.payload.errorReason;

        switch (errorCondition)
        {
            case 'MobileDeviceError' :
                this._currentContextTemplate.dialog3Ctrl.setTitleId('MobileDeviceError');
                this._currentContextTemplate.dialog3Ctrl.setText1Id("FunctioningProperly");
                break;
            case 'NoNetworkAvailable' :
                this._currentContextTemplate.dialog3Ctrl.setTitleId('NoNetworkAvailable');
                this._currentContextTemplate.dialog3Ctrl.setText1Id('CheckConnection');
                break;
            case 'AhaNotFound' :
                this._currentContextTemplate.dialog3Ctrl.setTitleId('AhaNotFound');
                this._currentContextTemplate.dialog3Ctrl.setText1Id("MakeSureAhaIsInstalled");
                break;
            case 'ConnectionLost' :
                this._currentContextTemplate.dialog3Ctrl.setText1Id("ConnectionLost");
                break;
            case 'AhaMaintenance' :
                this._currentContextTemplate.dialog3Ctrl.setText1Id('AhaMaintenance');
                break;
            case "InsufficientConnectivity":
                this._currentContextTemplate.dialog3Ctrl.setText1Id("InsufficientConnectivity_Alert");
                break;
            default :
                this._currentContextTemplate.dialog3Ctrl.setTitle('');
                this._currentContextTemplate.dialog3Ctrl.setText1Id(errorCondition);
                break;
        }

    }

}

/**
 * Context In Callback (SplashScreen)
 * =========================
 * @return {void}
 */
aharadioApp.prototype._SplashScreenCtxtIn = function()
{
    this._cacheStationData = {};
}

/**
 * Context In Callback (NowPlaying)
 * =========================
 * @return {void}
 */
aharadioApp.prototype._NowPlayingCtxtIn = function()
{
    this._currentlyFocussedButton = {buttonId : null, buttonIndex : -1};
}

/**
 * Context In Callback (LBSDetail)
 * =========================
 * @return {void}
 */
aharadioApp.prototype._LBSDetailCtxtIn = function()
{
    this._currentlyFocussedButton = {buttonId : null, buttonIndex : -1};
}

/**
 * Ready Callback (NowPlaying)
 * =========================
 * @return {void}
 */
aharadioApp.prototype._NowPlayingCtxtReadyToDisplay = function()
{
    log.debug("aharadioApp _NowPlayingCtxtReadyToDisplay called...");

    // reset setButton queue
    this._setButtonQueue = [];

    // set station title
    if (this._cacheStationData && this._cacheStationData.contentName)
    {
        this._setTitle(this._cacheStationData);
    }

    // set button config
    this._setUmpConfig(this._cacheUmpConfig, this._contextTable.NowPlaying);

    // set button states
    if(this._cachePlayMode)
    {
        if(this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.properties.buttonConfig.playstop)
        {
            this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonState("playstop", "Stop");
        }
        if(this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.properties.buttonConfig.playpause)
        {
            this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonState("playpause", "Pause");
        }
    }
    else
    {
        if(this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.properties.buttonConfig.playstop)
        {
            this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonState("playstop", "Play");
        }
        if(this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.properties.buttonConfig.playpause)
        {
            this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonState("playpause", "Play");
        }
    }

    if(this._cacheElapsedTime)
    {
        this._updateScrubber(this._currentContextTemplate);
        this._updateElapsedTime(this._currentContextTemplate);
    }

    // set branding image
    if(this._cacheStationData && this._cacheStationData.brandingImage)
    {
        this._setBrandingImage(this._cacheStationData);
    }

    // clone currently focussed button
    var tmp = this._currentlyFocussedButton;
    var initbut = this._contextTable.NowPlaying.controlProperties.NowPlayingCtrl.umpConfig.initialButtonFocus;
    var umpc = this._contextTable.NowPlaying.controlProperties.NowPlayingCtrl.umpConfig.buttonConfig;

    // attempt focus placement
    if (tmp)
    {
        if ((umpc.hasOwnProperty(tmp.buttonId) && umpc[tmp.buttonId].buttonIndex == tmp.buttonIndex) &&  initbut != tmp.buttonId)
        {
            // set focus
            this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonFocus(tmp.buttonId);
            // save it in the context table
            this._contextTable.NowPlaying.controlProperties.NowPlayingCtrl.umpConfig.initialButtonFocus = this._currentlyFocussedButton.buttonId;

        }
    }

    // set buffering
    this._setBuffering();

    // update recoverable state
    this._setRecoverableError();

}

/**
 * Ready Callback (LBSDetail)
 * =========================
 * @return {void}
 */
aharadioApp.prototype._LBSDetailCtxtReadyToDisplay = function ()
{
    log.debug("aharadioApp _LBSDetailCtxtReadyToDisplay called...");

    // reset setButton queue
    this._setButtonQueue = [];

    // set station title
    if (this._cacheLBSDetails && this._cacheLBSDetails.contentName)
    {
        this._setTitle(this._cacheLBSDetails);
    }

    // set button config
    this._setUmpConfig(this._cacheUmpConfig, this._contextTable.LBSDetail);

    // set button states
    if(this._cachePlayMode)
    {
        if(this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.properties.buttonConfig.playstop)
        {
            this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonState("playstop", "Stop");
        }
        if(this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.properties.buttonConfig.playpause)
        {
            this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonState("playpause", "Pause");
        }
    }
    else
    {
        if(this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.properties.buttonConfig.playstop)
        {
            this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonState("playstop", "Play");
        }
        if(this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.properties.buttonConfig.playpause)
        {
            this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonState("playpause", "Play");
        }
    }

    if(this._cacheElapsedTime)
    {
        this._updateScrubber(this._currentContextTemplate);
        this._updateElapsedTime(this._currentContextTemplate);
    }

    // set branding image
    if(this._cacheLBSDetails && this._cacheLBSDetails.brandingImage)
    {
        this._setBrandingImage(this._cacheLBSDetails);
    }

    // set rating
    if(this._cacheRating)
    {
        this._currentContextTemplate.nowPlaying4Ctrl.setCustomRatingImg(this._cacheRating);
    }
    else
    {
        this._currentContextTemplate.nowPlaying4Ctrl.setRating(-1);
    }

    // clone currently focussed button
    var tmp = this._currentlyFocussedButton;
    var initbut = this._contextTable.LBSDetail.controlProperties.NowPlayingCtrl.umpConfig.initialButtonFocus;
    var umpc = this._contextTable.LBSDetail.controlProperties.NowPlayingCtrl.umpConfig.buttonConfig;

    // attempt focus placement
    if (tmp)
    {
        if ((umpc.hasOwnProperty(tmp.buttonId) && umpc[tmp.buttonId].buttonIndex == tmp.buttonIndex) &&  initbut != tmp.buttonId)
        {
        	// set focus
            this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonFocus(tmp.buttonId);
            // save it in the context table
            this._contextTable.LBSDetail.controlProperties.NowPlayingCtrl.umpConfig.initialButtonFocus = this._currentlyFocussedButton.buttonId;
        }
    }

    // set buffering
    this._setBuffering();

    // update recoverable state
    this._setRecoverableError();
}

/**
 * Context In Callback (MainMenu)
 * =========================
 * @return {void}
 */
aharadioApp.prototype._AhaMainMenuCtxtContextIn = function ()
{
    if (this._hasContextPayload() && this._currentContext.params.payload.activeTab == "PRS")
    {
        this._contextTable.AhaMainMenu.controlProperties.List2Ctrl.tabsButtonConfig.currentlySelectedTab = 0;
    }
    else if (this._hasContextPayload() && this._currentContext.params.payload.activeTab == "LBS")
    {
        this._contextTable.AhaMainMenu.controlProperties.List2Ctrl.tabsButtonConfig.currentlySelectedTab = 1;
    }
    else
    {
        this._contextTable.AhaMainMenu.controlProperties.List2Ctrl.tabsButtonConfig.currentlySelectedTab = 0;
    }
}

/**
 * Ready Callback (MainMenu)
 * =========================
 * @return {void}
 */
aharadioApp.prototype._AhaMainMenuCtxtReadyToDisplay = function ()
{

    var contextType = 0;
    if (this._hasContextPayload() && this._currentContext.params.payload.activeTab == "PRS")
    {
        contextType = 0;
    }
    else if (this._hasContextPayload() && this._currentContext.params.payload.activeTab == "LBS")
    {
        contextType = 1;
    }
    log.debug("aharadioApp GetListChunk called from _AhaMainMenuCtxtReadyToDisplay");
    framework.sendEventToMmui(this.uiaId, "GetListChunk", {payload:{firstIndex: 0, type: contextType}});

    if (this._hasContextPayload())
    {
        this._populateAhaMainMenu(this._currentContext.params.payload.activeTab);
    }
    else
    {
        this._populateAhaMainMenu("PRS");
    }
}
/**
 * Ctxt Out Callback (MainMenu)
 * =========================
 * @return {void}
 */
aharadioApp.prototype._AhaMainMenuCtxtOut = function ()
{
}

/**
 * Ready Callback (Episodes)
 * =========================
 * @return {void}
 */
aharadioApp.prototype._EpisodesTemplateReady = function ()
{
    if (this._hasContextPayload())
    {
        this._currentContextTemplate.list2Ctrl.setTitle({titleStyle : 'style02', text1: this._currentContext.params.payload.stationName});
    }

    // if (this._cacheEpisodesList)
    // {
        // this._populateEpisodes(this._currentContextTemplate, this._cacheEpisodesList);
    // }

    log.debug("aharadioApp GetListChunk called from _EpisodesTemplateReady");
    framework.sendEventToMmui(this.uiaId, "GetListChunk", {payload:{firstIndex: 0, type: 3}});


}

/**
 * Ready Callback (ShoutCountDown)
 * =========================
 * @return {void}
 */
aharadioApp.prototype._ShoutCountDownTemplateReady = function ()
{
    if (this._hasContextPayload())
    {
        this._currentContextTemplate.dialog3Ctrl.setText1(this._currentContext.params.payload.time);
    }
}

/**
 * Context In Callback (ShoutRecording)
 * =========================
 * @return {void}
 */
aharadioApp.prototype._ShoutRecordingCtxtIn = function ()
{
    this._contextTable["ShoutRecording"].controlProperties.Dialog3Ctrl.meter.max = this._currentContext.params.payload.maxtime;
    this._contextTable["ShoutRecording"].controlProperties.Dialog3Ctrl.meter.totalValue = "0:" + this._currentContext.params.payload.maxtime;
}

/**
 * Ready Callback (ShoutRecording)
 * =========================
 * @return {void}
 */
aharadioApp.prototype._ShoutRecordingTemplateReady = function ()
{
    // if (this._hasContextPayload())
    // {
        // this._currentContextTemplate.dialog3Ctrl.setText2(this._currentContext.params.payload.maxtime);
    // }
}

/**
 * Displayed Callback (ShoutRecording)
 * =========================
 * @return {void}
 */
aharadioApp.prototype._ShoutRecordingTemplateDisplayed = function ()
{
    framework.sendEventToMmui(this.uiaId, "StartShout");
    this._startMeter();
}

/**
 * Context Out Callback (ShoutRecording)
 * =========================
 * @return {void}
 */
aharadioApp.prototype._ShoutRecordingOut = function ()
{
    this._stopMeter();
}


/**
 * =========================
 * Message Handlers
 * =========================
 * Aha Message List
 * - SetContentTitle            (NowPlaying, LBSDetail)
 * - SetContentDetails          (NowPlaying, LBSDetail)
 * - ContentsList               (AhaMainMenu)
 * - EpisodesList               (Episodes)
 * - SetContentsListIcon        (AhaMainMenu)
 * - SetContentArt              (NowPlaying, LBSDetail)
 * - SetContentBrandingImage    (NowPlaying, LBSDetail)
 * - SetBuffering               (NowPlaying, LBSDetail)
 * - SetCountdown               (ShoutCountDown)
 * - SetButton                  (NowPlaying, LBSDetail)
 * =========================
 */

/**
 * Message Handler (ContentsList)
 * handled in AhaMainMenu
 * =========================
 * @param {object}
 * @return {void}
 */
aharadioApp.prototype._ContentsListMsgHandler = function (msg)
{
    if (msg.params.payload.type == 0)
    {
        // cache data
        this._cacheStationLists.PRS = msg.params.payload;

        // handle in AhaMainMenu
        if (this._hasContextPayload() && this._currentContext.ctxtId == "AhaMainMenu" && this._currentContextTemplate)
        {
            this._populateAhaMainMenu(this._currentContext.params.payload.activeTab);
        }
        else if (this._currentContext.ctxtId == "AhaMainMenu" && this._currentContextTemplate)
        {
            this._populateAhaMainMenu("PRS");
        }
    }
    else if (msg.params.payload.type == 1)
    {
        // cache data
        this._cacheStationLists.LBS = msg.params.payload;

        // handle in AhaMainMenu
        if (this._hasContextPayload() && this._currentContext.ctxtId == "AhaMainMenu" && this._currentContextTemplate)
        {
            this._populateAhaMainMenu(this._currentContext.params.payload.activeTab);
        }
    }
}


/**
 * Message Handler (SetContentTitle)
 * buffering-dependent
 * =========================
 * @param {object}
 * @return {void}
 */
aharadioApp.prototype._SetContentTitleMsgHandler = function (msg)
{
    // cache data
    if (msg.params.payload.type == 0)
    {
        this._cacheStationData.contentTitle = msg.params.payload.title;
    }
    else if (msg.params.payload.type == 1)
    {
        this._cacheLBSDetails.contentTitle = msg.params.payload.title;
    }

    // set buffering
    this._setBuffering();
}

aharadioApp.prototype._TimedSbn_SetContentTitleMsgHandler = function (msg)
{
    framework.common.startTimedSbn(this.uiaId, "AhaRadioPlayingContent", "typeE", {sbnStyle: "Style02", imagePath1: "IcnSbnEnt.png",text1Id : "system.AhaRadio", text2: msg.params.payload.title});
}

/**
 * Message Handler (RecoverableError)
 * =========================
 * @param {object}
 * @return {void}
 */
aharadioApp.prototype._RecoverableErrorMsgHandler = function (msg)
{
    // cache data
    if (msg.params.payload.statusOn == 1)
    {
        this._cacheRecoverableErrorState = true;
    }
    else
    {
        this._cacheRecoverableErrorState = false;
    }

    // handle in NowPlaying / LBSDetail
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId && (this._currentContext.ctxtId == "NowPlaying" || this._currentContext.ctxtId == "LBSDetail"))
    {
        this._setRecoverableError();
    }
}

/**
 * Message Handler (SetStationTitle)
 * buffering-independent
 * =========================
 * @param {object}
 * @return {void}
 */
aharadioApp.prototype._SetStationTitleMsgHandler = function (msg)
{
    log.debug("aharadioApp _SetStationTitleMsgHandler called...", msg);

    /* 0=presets, 1 = LBS,  2 = episodes  */
    if (msg.params.payload.type == 0 || msg.params.payload.type == 2) //presets, episodes
    {
        // cache data
        this._cacheStationData.contentName = msg.params.payload.title;

        // handle in NowPlaying
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId && this._currentContext.ctxtId == "NowPlaying")
        {
            this._setTitle(this._cacheStationData);
        }
    }
    else if (msg.params.payload.type == 1) // LBS
    {
        // cache data
        this._cacheLBSDetails.contentName = msg.params.payload.title;

        // handle in LBSDetail
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId && this._currentContext.ctxtId == "LBSDetail")
        {
            this._setTitle(this._cacheLBSDetails);
        }
    }
}

/**
 * Message Handler (SetPlayerStatus)
 * =========================
 * @param {object}
 * @return {void}
 */

aharadioApp.prototype._SetPlayerStatusMsgHandler = function (msg)
{
    log.debug("aharadioApp _SetPlayerStatusMsgHandler called...", msg);

    // cache data
    this._cacheUmpConfig = msg.params.payload;


    // handle in NowPlaying / LBSDetail
    if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId && this._currentContext.ctxtId == "LBSDetail")
    {
        this._setUmpConfig(this._cacheUmpConfig, this._contextTable.LBSDetail);
        this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setScrubberVisible((this._cacheUmpConfig.hasProgressBar == 1) ? true : false);
		if (this._cacheUmpConfig.hasProgressBar == 0)
		{
			this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setElapsedTime(null);
			this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setTotalTime(null);
		}
    }
    if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId && this._currentContext.ctxtId == "NowPlaying")
    {
        this._setUmpConfig(this._cacheUmpConfig, this._contextTable.NowPlaying);
        this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setScrubberVisible((this._cacheUmpConfig.hasProgressBar == 1) ? true : false);
		if (this._cacheUmpConfig.hasProgressBar == 0)
		{
			this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setElapsedTime(null);
			this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setTotalTime(null);
		}
    }

    // set buffering
    this._setBuffering();
}


/**
 * Message Handler (SetPlayMode)
 * =========================
 * @param {object}
 * @return {void}
 */
aharadioApp.prototype._SetPlayModeMsgHandler = function (msg)
{
    log.debug("aharadioApp _SetPlayModeMsgHandler called...", msg);

    // cache data
    this._cachePlayMode= msg.params.payload.playing;

    // handle in NowPlaying / LBSDetail
    if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId && (this._currentContext.ctxtId == "LBSDetail" || this._currentContext.ctxtId == "NowPlaying"))
    {
        var ump = this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl;

        if(this._cachePlayMode)
        {
            if (ump.properties.buttonConfig.hasOwnProperty("playpause") && ump.properties.buttonConfig.playpause.currentState != "Pause")
            {
                this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonState("playpause", "Pause");
            }
            if (ump.properties.buttonConfig.hasOwnProperty("playstop") && ump.properties.buttonConfig.playstop.currentState != "Stop")
            {
                this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonState("playstop", "Stop");
            }
        }
        else
        {
            if (ump.properties.buttonConfig.hasOwnProperty("playpause") && ump.properties.buttonConfig.playpause.currentState != "Play")
            {
                this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonState("playpause", "Play");
            }
            if (ump.properties.buttonConfig.hasOwnProperty("playstop") && ump.properties.buttonConfig.playstop.currentState != "Play")
            {
                this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonState("playstop", "Play");
            }
        }
    }
}

/**
 * Message Handler (ElapsedTime)
 * =========================
 * @param {object}
 * @return {void}
 */
aharadioApp.prototype._ElapsedTimeMsgHandler = function (msg)
{
    log.debug("aharadioApp _ElapsedTimeMsgHandler called...", msg);

    this._cacheElapsedTime = msg.params.payload.elapsedTime;
    this._cacheTotalTime = msg.params.payload.totalTime;

    if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId && (this._currentContext.ctxtId == "LBSDetail" || this._currentContext.ctxtId == "NowPlaying"))
    {
        this._updateScrubber(this._currentContextTemplate);
        this._updateElapsedTime(this._currentContextTemplate);
    }

}

/**
 * Message Handler (SetContentRatingImage)
 * buffering-independent
 * =========================
 * @param {object}
 * @return {void}
 */
aharadioApp.prototype._SetContentRatingImageMsgHandler = function (msg)
{
    log.debug("aharadioApp _SetContentRatingImageMsgHandler called...", msg);

    // cache data
    this._cacheRating = msg.params.payload.path;

    // handle it in LBSDetail
    if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId && this._currentContext.ctxtId == "LBSDetail")
    {
        if (this._cacheRating)
        {
            this._currentContextTemplate.nowPlaying4Ctrl.setCustomRatingImg(this._cacheRating);
        }
        else
        {
            this._currentContextTemplate.nowPlaying4Ctrl.setRating(-1);
        }

    }
}

aharadioApp.prototype._TimedSbn_ErrorMaintenanceMsgHandler = function ()
{
    framework.common.startTimedSbn(this.uiaId, "AhaRadioPlayingContent", "errorNotification", {sbnStyle: "Style02", imagePath1: "IcnSbnEnt.png", text1Id: "AhaMaintenance"});
}
aharadioApp.prototype._TimedSbn_ErrorMobileDeviceMsgHandler = function ()
{
    framework.common.startTimedSbn(this.uiaId, "AhaRadioPlayingContent", "errorNotification", {sbnStyle: "Style02", imagePath1: "IcnSbnEnt.png", text1Id: "MobileDeviceError"});
}
aharadioApp.prototype._TimedSbn_ErrorNoNetworkConnection = function ()
{
    framework.common.startTimedSbn(this.uiaId, "AhaRadioPlayingContent", "errorNotification", {sbnStyle: "Style02", imagePath1: "IcnSbnEnt.png", text1Id: "NoNetworkAvailable"});
}
aharadioApp.prototype._TimedSbn_ErrorNetworkConnectionLostMsgHandler = function ()
{
    framework.common.startTimedSbn(this.uiaId, "AhaRadioPlayingContent", "errorNotification", {sbnStyle: "Style02", imagePath1: "IcnSbnEnt.png", text1Id: "ConnectionLost"});
}
aharadioApp.prototype._TimedSbn_InsufficientConnectivityMsgHandler = function ()
{
    framework.common.startTimedSbn(this.uiaId, "AhaRadioPlayingContent", "errorNotification", {sbnStyle: "Style02", imagePath1: "IcnSbnEnt.png", text1Id: "InsufficientConnectivity_Alert"});
}
aharadioApp.prototype._TimedSbnLikeDislikeStatusHandler = function(msg)
{
if(framework.getCurrCtxtId() !== "NowPlaying")
{
if(msg.params.payload.Like === true)
			{
            framework.common.startTimedSbn('aha', 'SBN_ShowThumbsInfo', 'typeE', {
                sbnStyle : 'Style02',
                imagePath1 : 'common/images/icons/IcnSbnEnt.png',
                text1Id : "system.AhaRadio",
				text2 : framework.localize.getLocStr(this.uiaId, "LikeTooltip"),
				}
            );
			}
			else if(msg.params.payload.Dislike === true)
			{
            framework.common.startTimedSbn('aha', 'SBN_ShowThumbsInfo', 'typeE', {
                sbnStyle : 'Style02',
                imagePath1 : 'common/images/icons/IcnSbnEnt.png',
                text1Id : "system.AhaRadio",	
				text2 : framework.localize.getLocStr(this.uiaId, "DislikeTooltip"),
				}
            );
			}
}
};

/**
 * Message Handler (SetContentDetails)
 * buffering-dependent
 * =========================
 * @param {object}
 * @return {void}
 */
aharadioApp.prototype._SetContentDetailsMsgHandler = function (msg)
{
    // cache data
    if (msg.params.payload.type == 0)
    {
    	// TODO: detail1
        this._cacheStationData.detail2 = msg.params.payload.detail2;
        this._cacheStationData.detail3 = msg.params.payload.detail3;
        this._cacheStationData.detail4 = msg.params.payload.detail4;
    }
    else if (msg.params.payload.type == 1)
    {
    	// TODO: detail1
        this._cacheLBSDetails.detail2 = msg.params.payload.detail2;
    }

    // set buffering
    this._setBuffering();
}

/**
 * Message Handler (SetContentPhoneNumber)
 * buffering-dependent
 * =========================
 * @param {object}
 * @return {void}
 */
aharadioApp.prototype._SetContentPhoneNumberMsgHandler = function (msg)
{
    // cache data
    this._cachePhoneNumber = (msg.params.payload.phonenumber) ? msg.params.payload.phonenumber : null;

    // set buffering
    this._setBuffering();
}

/**
 * Message Handler (SetContentDistance)
 * buffering-dependent
 * =========================
 * @param {object}
 * @return {void}
 */
aharadioApp.prototype._SetContentDistanceMsgHandler = function (msg)
{
    // cache data
    this._cacheDistance = (msg.params.payload.distance) ? msg.params.payload.distance : null;

    // set buffering
    this._setBuffering();
}

/**
 * Message Handler (EpisodesList)
 * Handled in Episodes
 * =========================
 * @param {object}
 * @return {void}
 */
aharadioApp.prototype._EpisodesListMsgHandler = function (msg)
{
    // cache data
    this._cacheEpisodesList = msg.params.payload;

    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "Episodes")
    {
        this._populateEpisodes(this._currentContextTemplate, this._cacheEpisodesList);
    }
}

/**
 * Message Handler (SetContentsListIcon)
 * Handled in AhaMainMenu / Episodes
 * =========================
 * @param {object}
 * @return {void}
 */
aharadioApp.prototype._SetContentsListIconMsgHandler = function (msg)
{
    if (msg.params.payload.type == 0)
    {
        /** AhaMainMenu payload is the tab to show as active, PRS or LBS **/
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "AhaMainMenu" && this._hasContextPayload() && this._currentContext.params.payload.activeTab == "PRS")
        {
            this._updateItem(msg.params.payload.index, msg.params.payload.path);
        }
        else if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "AhaMainMenu" && !this._hasContextPayload())
        {
            log.warn("Aha Radio: AhaMainMenu PRS context with empty payload!");
            this._updateItem(msg.params.payload.index, msg.params.payload.path);
        }
    }
    else if (msg.params.payload.type == 1)
    {
        /** AhaMainMenu payload is the tab to show as active, PRS or LBS **/
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "AhaMainMenu" && this._hasContextPayload() && this._currentContext.params.payload.activeTab == "LBS")
        {
            this._updateItem(msg.params.payload.index, msg.params.payload.path);
        }
        else if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "AhaMainMenu" && !this._hasContextPayload())
        {
            log.warn("Aha Radio: AhaMainMenu LBS context with empty payload!");
            this._updateItem(msg.params.payload.index, msg.params.payload.path);
        }
    }
    else if (msg.params.payload.type == 2)
    {
        /** Episodes payload is the station's (or LBS') name **/
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "Episodes")
        {
            this._updateItem(msg.params.payload.index, msg.params.payload.path);
        }
        else if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "Episodes" && !this._hasContextPayload())
        {
            log.warn("Aha Radio: Episodes context with empty payload!");
            this._updateItem(msg.params.payload.index, msg.params.payload.path);
        }
    }
}

/**
 * Message Handler (SetContentArt)
 * buffering-independent
 * =========================
 * @param {object}
 * @return {void}
 */
aharadioApp.prototype._SetContentArtMsgHandler = function (msg)
{
    if (msg.params.payload.type == 0)
    {
        this._cacheStationData.contentArt = msg.params.payload.path;

        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "NowPlaying")
        {
            this._setContentArt(this._cacheStationData);
        }
    }
    else if (msg.params.payload.type == 1)
    {
        this._cacheLBSDetails.contentArt = msg.params.payload.path;

        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "LBSDetail")
        {
            this._setContentArt(this._cacheLBSDetails);
        }
    }
}


/**
 * Message Handler (SetContentBrandingImage)
 * buffering-independent
 * =========================
 * @param {object}
 * @return {void}
 */
aharadioApp.prototype._SetContentBrandingImageMsgHandler = function (msg)
{
    if (msg.params.payload.type == 0)
    {
        this._cacheStationData.brandingImage = msg.params.payload.path;

        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "NowPlaying")
        {
            this._setBrandingImage(this._cacheStationData);
        }
    }
    else if (msg.params.payload.type == 1)
    {
        this._cacheLBSDetails.brandingImage = msg.params.payload.path;

        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "LBSDetail")
        {
            this._setBrandingImage(this._cacheLBSDetails);
        }
    }

}


/**
 * Message Handler (SetBuffering)
 * =========================
 * @param {object}
 * @return {void}
 */
aharadioApp.prototype._SetBufferingMsgHandler = function (msg)
{
    // deprecated
}

/**
 * Message Handler (EnableBuffering)
 * =========================
 * @param {object}
 * @return {void}
 */
aharadioApp.prototype._EnableBufferingMsgHandler = function (msg)
{
    if (msg.params.payload.enabled == 0)
    {
        this._buffering = false;
    }
    else if (msg.params.payload.enabled == 1)
    {
        this._buffering = true;
    }

    this._setBuffering();
}

/**
 * Message Handler (SetCountdown)
 * =========================
 * @param {object}
 * @return {void}
 */
aharadioApp.prototype._SetCountdownMsgHandler = function (msg)
{
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "ShoutCountDown")
    {
        this._currentContextTemplate.dialog3Ctrl.setText1(msg.params.payload.time);
    }
}

/**
 * Message Handler (SetButton)
 * Receivded when a button needs to have its state changed
 * =========================
 * @param {object}
 * @return {void}
 */
aharadioApp.prototype._SetButtonMsgHandler = function (msg)
{
    // ensure proper payload
    if (msg.params.payload && msg.params.payload.properties)
    {
        // enqueue the setButton message
        this._setButtonQueue.push(msg.params.payload.properties);

        // if we are not in buffering -> update button
        if (!this._buffering)
        {
            this._updateUmpButton(msg.params.payload.properties);
        }
    }
}

aharadioApp.prototype._SetContentSelectedIndexMsgHandler = function (msg)
{
    // "type":4, /* 0=presets, 1=lbs, 2=episodes */
    // "selectedIndex":13

    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "Episodes" && msg.params.payload.type == 2)
    {
        if(msg.params.payload.selectedIndex < this._currentContextTemplate.list2Ctrl.dataList.itemCount)
        {
            for (var i=0; i < this._currentContextTemplate.list2Ctrl.dataList.itemCount; i++)
            {
                this._currentContextTemplate.list2Ctrl.dataList.items[i].image2 = '';
            }
            this._currentContextTemplate.list2Ctrl.dataList.items[msg.params.payload.selectedIndex].image2 = 'common/images/icons/IcnListEntNowPlaying_En.png';
            this._currentContextTemplate.list2Ctrl.updateItems(0, this._currentContextTemplate.list2Ctrl.dataList.itemCount-1);
        }
    }
}



/**
 * =========================
 * Control Callbacks
 * =========================
 */

/**
 * List Select Callback
 * =========================
 * @param {List2Ctrl}
 * @param {string}
 * @param {object}
 * @return {void}
 */
aharadioApp.prototype._listItemClickCallback = function (listCtrlObj, appData, params)
{
    switch (this._currentContext.ctxtId)
    {
        case "AhaMainMenu":
            switch (appData.name)
            {
                case "presets":
                    this._selectedTab = 0;
                    framework.sendEventToMmui(this.uiaId, "SelectPresetsTab");
                    break;
                case "LBS":
                    this._selectedTab = 1;
                    framework.sendEventToMmui(this.uiaId, "SelectLBSTab");
                    break;
                case "loading":
                    // Do nothing for now but it could fire event to get the items again.
                    break;
                default:
                    if (this._currentContext.params.payload.activeTab == "PRS")
                    {
                        framework.sendEventToMmui(this.uiaId, "SelectPresetStation", {payload:{id: appData.id}}, params.fromVui);
                    }
                    else if (this._currentContext.params.payload.activeTab == "LBS")
                    {
                        // this._cacheStationData = null;
                        framework.sendEventToMmui(this.uiaId, "SelectLocationBasedService", {payload:{id: appData.id}}, params.fromVui);
                    }
                    break;
            }
            break;
        case "Episodes":
            framework.sendEventToMmui(this.uiaId, "SelectItem", {payload:{id: appData.id}}, params.fromVui);
            break;
    }

}

/**
 * UMP Select Callback
 * =========================
 * @param {UmpCtrl}
 * @param {string}
 * @param {object}
 * @return {void}
 */
aharadioApp.prototype._umpDefaultSelectCallback = function(umpCtrlObj, appData, additionalData)
{
    log.debug("_umpDefaultSelectCallback called...", appData);
    switch (appData)
    {

        case "soundsettings":
            framework.sendEventToMmui(this.uiaId, "SelectSettings");
            break;
        case "source":
            framework.sendEventToMmui(this.uiaId, "SelectSource");
            break;
        case "playpause":
            if (additionalData.state == "Pause")
            {
                framework.sendEventToMmui("Common", "Global.Resume");
            }
            else if (additionalData.state == "Play")
            {
                framework.sendEventToMmui("Common", "Global.Pause");
            }
            break;
        case "playstop":
            if (additionalData.state == "Stop")
            {
                this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonDisabled("playstop", true);
                framework.sendEventToMmui("Common", "Global.Resume");
            }
            else if (additionalData.state == "Play")
            {
                framework.sendEventToMmui("Common", "Global.Pause");
            }

            break;
        case "episodes":
            framework.sendEventToMmui(this.uiaId, "SelectEpisodes");
            break;
        case "mainmenu":
            framework.sendEventToMmui(this.uiaId, "SelectMainList");
            break;
        case "next":
			if (this._currentContext && this._currentContext.ctxtId && this._currentContext.ctxtId == "NowPlaying")
			{
				framework.sendEventToMmui(this.uiaId, "PlayNext");
            }
			else
			{
				framework.sendEventToMmui("Common", "Global.Next");
			}
			break;
        case "previous":
			if (this._currentContext && this._currentContext.ctxtId && this._currentContext.ctxtId == "NowPlaying")
			{
				framework.sendEventToMmui(this.uiaId, "PlayPrevious");
			}
			else
			{
				framework.sendEventToMmui("Common", "Global.Previous");
			}
            break;
        case "rewind":
            framework.sendEventToMmui("Common", "Global.Rewind");
            break;
        case "fastforward":
            framework.sendEventToMmui("Common", "Global.FastForward");
            break;
        case "thumbsUp":
            framework.sendEventToMmui(this.uiaId, "SelectThumbsUp");

            break;
        case "thumbsDown":
            framework.sendEventToMmui(this.uiaId, "SelectThumbsDown");
            break;
        case "shout":
            framework.sendEventToMmui(this.uiaId, "SelectShout");
            break;
        case "navi":
            framework.sendEventToMmui(this.uiaId, "SelectMap");
            break;
        case "call":
            framework.sendEventToMmui(this.uiaId, "SelectCall");
            break;
        case "like":
            framework.sendEventToMmui(this.uiaId, "SelectThumbsUp");
            break;
        case "dislike":
            framework.sendEventToMmui(this.uiaId, "SelectThumbsDown");
            break;
    }

}

/**
 * UMP Hold Start Callback
 * =========================
 * @param {UmpCtrl}
 * @param {string}
 * @param {object}
 * @return {void}
 */
aharadioApp.prototype._umpHoldStartCallback = function (ctrlObj, appData, params)
{
    log.debug("_umpHoldStartCallback called...", appData);

    if (appData == "next")
    {
        framework.sendEventToMmui("Common", "Global.FastForward");
    }
    else if (appData == "previous")
    {
        framework.sendEventToMmui("Common", "Global.Rewind");
    }
}

/**
 * UMP Hold Stop Callback
 * =========================
 * @param {UmpCtrl}
 * @param {string}
 * @param {object}
 * @return {void}
 */
aharadioApp.prototype._umpHoldStopCallback = function (ctrlObj, appData, params)
{
    log.debug("_umpHoldStartCallback called...", appData);
    if (appData == "next")
    {
        framework.sendEventToMmui(this.uiaId, "EndFastForward");
    }
    else if (appData == "previous")
    {
        framework.sendEventToMmui(this.uiaId, "EndRewind");
    }
}

/**
 * UMP Focus Callback
 * =========================
 * @param {UmpCtrl}
 * @param {string}
 * @param {object}
 * @return {void}
 */
aharadioApp.prototype._umpFocusCallback = function(ctrlObj, appData, params)
{
    // find button id based on the fucussed button's appdata
    if (ctrlObj && ctrlObj.properties && ctrlObj.properties.buttonConfig && typeof ctrlObj.properties.buttonConfig == 'object')
    {
        var buttonConfig = ctrlObj.properties.buttonConfig;
        for (var i in buttonConfig)
        {
            if (buttonConfig[i].appData === appData)
            {
                // set currently focussed button in the context table
                this._currentlyFocussedButton = {buttonId : i, buttonIndex : buttonConfig[i].buttonIndex};
                if (this._currentContext && this._currentContext.ctxtId && this._currentContext.ctxtId == "NowPlaying")
                {
                      this._contextTable.NowPlaying.controlProperties.NowPlayingCtrl.umpConfig.initialButtonFocus = this._currentlyFocussedButton.buttonId;
                }
                else if (this._currentContext && this._currentContext.ctxtId && this._currentContext.ctxtId == "LBSDetail")
                {
                      this._contextTable.LBSDetail.controlProperties.NowPlayingCtrl.umpConfig.initialButtonFocus = this._currentlyFocussedButton.buttonId;
                }
                break;
            }
        }
    }
}

/**
 * Dialog Select Callback
 * =========================
 * @param {Dialog3Ctrl}
 * @param {string}
 * @param {object}
 * @return {void}
 */
aharadioApp.prototype._dialogSelectCallback = function (ctrlObj, appData, params)
{
    switch(this._currentContext.ctxtId)
    {
        case "SplashScreen":
            switch (appData)
            {
                case "source":
                    framework.sendEventToMmui("aharadio", "SelectSource");
                    break;
            }
            break;
        case "ErrorCondition":
            switch (appData)
            {
                case "Global.OK":
                    framework.sendEventToMmui("Common", "Global.Yes");
                    break;
                case "Global.Cancel":
                    framework.sendEventToMmui("Common", "Global.Cancel");
                    break;
            }
            break;
        case "NoDevice":
            switch(appData)
            {
                case "Global.GoBack":
                    framework.sendEventToMmui("Common", "Global.GoBack");
                    break;
                case "Connect":
                    framework.sendEventToMmui(this.uiaId, "SelectSetup");
                    break;
            }
            break;
        case "ShoutCountDown":
            switch(appData)
            {
                case "Global.Cancel":
                    framework.sendEventToMmui("Common", "Global.Cancel");
                    break;
            }
            break;
        case "ShoutRecording":
            switch(appData)
            {
                case "Global.Cancel":
                    this._stopMeter();
                    framework.sendEventToMmui("Common", "Global.Cancel");
                    break;
                case "Save":
                    this._stopMeter();
                    framework.sendEventToMmui(this.uiaId, "SelectSave");
                    break;
            }
            break;
        case "ShoutLimit":
            switch(appData)
            {
                case "Discard":
                    framework.sendEventToMmui(this.uiaId, "SelectDiscard");
                    break;
                case "Save":
                    framework.sendEventToMmui(this.uiaId, "SelectSave");
                    break;
            }
            break;
    }

}


/**
 * =========================
 * Helper functions
 * =========================
 */

aharadioApp.prototype._setRecoverableError = function ()
{
	if (this._cacheRecoverableErrorState == true)
    {
        // disable all buttons
        this._disableUmpButtons();
    }
    else
    {
        // enable respective ump buttons
        this._enableUmpButtons();
    }
}

aharadioApp.prototype._requestMoreDataCallback = function (index)
{
    log.debug("_requestMoreDataCallback called...", index);
    var contextType = 0;
    if (this._currentContext.ctxtId == "AhaMainMenu" && this._hasContextPayload() && this._currentContext.params.payload.activeTab == "PRS")
    {
        contextType = 0;
    }
    else if (this._currentContext.ctxtId == "AhaMainMenu" && this._hasContextPayload() && this._currentContext.params.payload.activeTab == "LBS")
    {
        contextType = 1;
    }
    else if (this._currentContext.ctxtId == "Episodes")
    {
        contextType = 3;
    }
    else
    {
        log.warn("Aha Radio: uknown context: ", this._currentCotnext.ctxtId)
    }

    log.debug("aharadioApp GetListChunk called from _requestMoreDataCallback");
    framework.sendEventToMmui(this.uiaId, "GetListChunk", {payload:{firstIndex: index, type: contextType}});
}
aharadioApp.prototype._startMeter = function ()
{

    clearInterval(this._recordinInterval);
    this._sliderValue = 0;
    var incrementSlider = this._increment.bind(this);
    this._timerStarted = new Date();
    this._recordinInterval = setInterval(incrementSlider, 50);
}

aharadioApp.prototype._stopMeter = function ()
{
    this._sliderValue = 0;
    this._timerStarted = null;
    clearInterval(this._recordinInterval);
}

aharadioApp.prototype._increment = function ()
{
    var timeShift = (new Date() - this._timerStarted) / 1000;

    // this._sliderValue += 0.05;
    this._sliderValue += timeShift;
    if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "ShoutRecording")
    {
        if(this._sliderValue > this._contextTable["ShoutRecording"].controlProperties.Dialog3Ctrl.meter.max)
        {
            this._stopMeter();
            return;


        }
        this._currentContextTemplate.dialog3Ctrl.setSliderValue(this._sliderValue);
        var elapsedTime = this._getFormattedTime(this._sliderValue);
        this._currentContextTemplate.dialog3Ctrl.setElapsedValue(elapsedTime.m + ":" + elapsedTime.s);
    }

    this._timerStarted = new Date();
}

aharadioApp.prototype._setBuffering = function ()
{
	var level = null;

    // validate context
    if (!this._currentContext || !this._currentContextTemplate || ("NowPlaying" !== this._currentContext.ctxtId && "LBSDetail" !== this._currentContext.ctxtId))
    {
        return level;
    }

    // determine level per context
    switch (this._currentContext.ctxtId)
    {
        // determine buffering level for NowPlaying
        case 'NowPlaying' :
            if (this._buffering && (
                Boolean(this._cacheStationData.contentTitle) ||
                Boolean(this._cacheStationData.detail2) ||
                Boolean(this._cacheStationData.detail3) ||
                Boolean(this._cacheStationData.detail4)
            ))
            {
                level = 'partial';
            }
            else if (!this._buffering && (
                Boolean(this._cacheStationData.contentTitle) ||
                Boolean(this._cacheStationData.detail2) ||
                Boolean(this._cacheStationData.detail3) ||
                Boolean(this._cacheStationData.detail4)
            ))
            {
                level = 'no';
            }
            else if (this._buffering &&
                !Boolean(this._cacheStationData.contentTitle) &&
                !Boolean(this._cacheStationData.detail2) &&
                !Boolean(this._cacheStationData.detail3) &&
                !Boolean(this._cacheStationData.detail4)
            )
            {
                level = 'full';
            }
            break;

        // determine buffering level for LBSDetail
        case 'LBSDetail' :
            if (this._buffering && (
                Boolean(this._cachePhoneNumber) ||
                Boolean(this._cacheDistance) ||
                Boolean(this._cacheLBSDetails.contentTitle) ||
                Boolean(this._cacheLBSDetails.detail2) ||
                Boolean(this._cacheLBSDetails.detail3) ||
                Boolean(this._cacheLBSDetails.detail4)
            ))
            {
                level = 'partial';
            }
            else if (!this._buffering && (
                Boolean(this._cachePhoneNumber) ||
                Boolean(this._cacheDistance) ||
                Boolean(this._cacheLBSDetails.contentTitle) ||
                Boolean(this._cacheLBSDetails.detail2) ||
                Boolean(this._cacheLBSDetails.detail3) ||
                Boolean(this._cacheLBSDetails.detail4)
            ))
            {
                level = 'no';
            }
            else if (this._buffering &&
                !Boolean(this._cachePhoneNumber) &&
                !Boolean(this._cacheDistance) &&
                !Boolean(this._cacheLBSDetails.contentTitle) &&
                !Boolean(this._cacheLBSDetails.detail2) &&
                !Boolean(this._cacheLBSDetails.detail3) &&
                !Boolean(this._cacheLBSDetails.detail4)
            )
            {
                level = 'full';
            }
            break;
    }

    switch (level)
    {
        case 'full' :

            // disable all buttons
	        this._disableUmpButtons();

	        // clear now playing fields and show Loading
	        this._currentContextTemplate.nowPlaying4Ctrl.setAudioTitle({audioTitleId:'common.Loading'});
	        this._currentContextTemplate.nowPlaying4Ctrl.setDetailLine1(null);
		    this._currentContextTemplate.nowPlaying4Ctrl.setDetailLine2(null);
		    this._currentContextTemplate.nowPlaying4Ctrl.setDetailLine3(null);
		    this._currentContextTemplate.nowPlaying4Ctrl.setPhoneNumber(null);
		    this._currentContextTemplate.nowPlaying4Ctrl.setDistanceDirection(null);

		    // set buffering bar
		    this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setBuffering(true);
			this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setElapsedTime(null);
			this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setTotalTime(null);
		    break;

        case 'partial' :

			// disable all buttons
			this._disableUmpButtons();

			// populate NowPlaying with cached data
            if (this._currentContext.ctxtId == "NowPlaying")
		    {
		        this._populateNowPlaying(this._cacheStationData);
		        this._setContentArt(this._cacheStationData);
		        this._setAudioTitle(this._cacheStationData);
		    }
		    // populate LBSDetail with cached data
		    else if (this._currentContext.ctxtId == "LBSDetail")
		    {
				this._populateNowPlaying(this._cacheLBSDetails);
				this._setContentArt(this._cacheLBSDetails);
		        this._setAudioTitle(this._cacheLBSDetails);
				this._currentContextTemplate.nowPlaying4Ctrl.setPhoneNumber(this._cachePhoneNumber);
		    	this._currentContextTemplate.nowPlaying4Ctrl.setDistanceDirection(this._cacheDistance);
		    }

			// set buffering bar
            this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setBuffering(true);
            break;

        case 'no' :

		    var umpConfig = null;

		    // enable buttons and set details
		    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "NowPlaying")
		    {
		        umpConfig = this._applySetButton(this._cacheUmpConfig); // apply setButton modification if needed

		        this._enableUmpButtons();
		        this._populateNowPlaying(this._cacheStationData);
		        this._setContentArt(this._cacheStationData);
		        this._setAudioTitle(this._cacheStationData);
		    }
		    else if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "LBSDetail")
		    {
		        umpConfig = this._applySetButton(this._cacheUmpConfig); // apply setButton modification if needed

		        this._enableUmpButtons();
		        this._populateNowPlaying(this._cacheLBSDetails);
		        this._setContentArt(this._cacheLBSDetails);
		        this._setAudioTitle(this._cacheLBSDetails);
		        this._currentContextTemplate.nowPlaying4Ctrl.setPhoneNumber(this._cachePhoneNumber);
		        this._currentContextTemplate.nowPlaying4Ctrl.setDistanceDirection(this._cacheDistance);
		    }

		    // set buffering bar
			this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setBuffering(false);
			if (!this._cacheUmpConfig || !this._cacheUmpConfig.hasProgressBar)
			{
				this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setScrubberVisible(false);
				this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setElapsedTime(null);
				this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setTotalTime(null);
			}
			else if (this._cacheUmpConfig && this._cacheUmpConfig.hasProgressBar == 1)
			{
			    this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setScrubberVisible(true);
			}

		    break;
    }

    return level;
}

aharadioApp.prototype._setAudioTitle = function (contentData)
{
    this._currentContextTemplate.nowPlaying4Ctrl.setAudioTitle({audioTitleText: contentData.contentTitle});
}

aharadioApp.prototype._setTitle = function (contentData)
{
    if(contentData.contentName)
    {
        this._currentContextTemplate.nowPlaying4Ctrl.setCtrlTitle({ctrlTitleText: contentData.contentName});
    }
}

aharadioApp.prototype._setBrandingImage = function (contentData)
{
    this._currentContextTemplate.nowPlaying4Ctrl.setBrandImage(contentData.brandingImage);
}

aharadioApp.prototype._setContentArt = function (contentData)
{
    this._currentContextTemplate.nowPlaying4Ctrl.setArtworkImagePath(contentData.contentArt);
}

aharadioApp.prototype._updateItem = function (itemIndex, imagePath)
{
    if (itemIndex!= null && itemIndex != undefined && imagePath && this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex])
    {
        // for (var i=0; i<this._currentContextTemplate.list2Ctrl.dataList.items.length; i++)
        // {
            // if (this._currentContextTemplate.list2Ctrl.dataList.items[i].appData.id == itemIndex)
            // {
                this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].image1 = imagePath;
                this._currentContextTemplate.list2Ctrl.updateItems(itemIndex, itemIndex);
                // break;
            // }
        // }
    }
}

aharadioApp.prototype._populateAhaMainMenu = function (menuId)
{
    if (menuId == "PRS" && this._cacheStationLists.PRS)
    {
        if (!this._currentContextTemplate.list2Ctrl.hasDataList() || (this._currentContextTemplate.list2Ctrl.dataList.itemCount != this._cacheStationLists.PRS.count))
        {
            var dataList = {
                itemCountKnown : true,
                vuiSupport : true,
                itemCount : this._cacheStationLists.PRS.count,
                items: []
            };
            this._currentContextTemplate.list2Ctrl.setDataList(dataList);
        }
        var contextControl = this._currentContextTemplate.list2Ctrl;
        if (this._cacheStationLists.PRS.count == 0)
        {
            contextControl.dataList.items = null;
            contextControl.dataList.vuiSupport = true;
            contextControl.dataList.items = new Array();
            contextControl.dataList.itemCount = 1;
            contextControl.dataList.items[0] = {
                disabled: true,
                appData: {
                    name: "Empty"
                },
                text1Id: "EmptyList",
                itemStyle: "style01",
                hasCaret : false

            };
            contextControl.updateItems(0, 0);
        }
        else if (this._cacheStationLists.PRS.count != 0)
        {
            if ((this._cacheStationLists.PRS.firstIndex + this._listRequestCount) > this._cacheStationLists.PRS.count)
            {
                endIndex = this._cacheStationLists.PRS.count;
            }
            else
            {
                endIndex = this._cacheStationLists.PRS.firstIndex + this._listRequestCount;
            }

            var j = 0;
            for (var i=this._cacheStationLists.PRS.firstIndex; i<endIndex; i++)
            {
                if(this._cacheStationLists.PRS.list[j].selected == 0)
                {
                    contextControl.dataList.items[i] = {
                        appData : {
                            name: this._cacheStationLists.PRS.list[j].name,
                            id: this._cacheStationLists.PRS.list[j].id,
                        },
                        text1 : this._cacheStationLists.PRS.list[j].name,
                        image1: this._cacheStationLists.PRS.list[j].path,
                        image2: '',
                        itemStyle : 'style02',
                        hasCaret : false
                    };
                }
                else
                {
                    contextControl.dataList.items[i] = {
                        appData : {
                            name: this._cacheStationLists.PRS.list[j].name,
                            id: this._cacheStationLists.PRS.list[j].id,
                        },
                        text1 : this._cacheStationLists.PRS.list[j].name,
                        image1: this._cacheStationLists.PRS.list[j].path,
                        image2: 'common/images/icons/IcnListEntNowPlaying_En.png',
                        itemStyle : 'style02',
                        hasCaret : false
                    };
                }
                j++;
            }

            contextControl.updateItems(this._cacheStationLists.PRS.firstIndex, endIndex - 1);
        }

        this._cacheStationLists.PRS = null;

    }
    else if (menuId == "LBS" && this._cacheStationLists.LBS)
    {
        
        if (!this._currentContextTemplate.list2Ctrl.hasDataList() || (this._currentContextTemplate.list2Ctrl.dataList.itemCount != this._cacheStationLists.LBS.count))
        {
            var dataList = {
                itemCountKnown : true,
                vuiSupport : true,
                itemCount : this._cacheStationLists.LBS.count,
                items: []
            };
            this._currentContextTemplate.list2Ctrl.setDataList(dataList);
        }
        if ((this._cacheStationLists.LBS.firstIndex + this._listRequestCount) > this._cacheStationLists.LBS.count)
        {
            endIndex = this._cacheStationLists.LBS.count;
        }
        else
        {
            endIndex = this._cacheStationLists.LBS.firstIndex + this._listRequestCount;
        }

        var contextControl = this._currentContextTemplate.list2Ctrl;
        var j = 0;
        for (var i=this._cacheStationLists.LBS.firstIndex; i < endIndex; i++)
        {
            if(this._cacheStationLists.LBS.list[j].selected == 0)
            {
                contextControl.dataList.items[i] = {
                    appData : {
                        name: this._cacheStationLists.LBS.list[j].name,
                        id: this._cacheStationLists.LBS.list[j].id,
                    },
                    text1 : this._cacheStationLists.LBS.list[j].name,
                    image1: this._cacheStationLists.LBS.list[j].path,
                    image2: '',
                    itemStyle : 'style02',
                    hasCaret : false
                };

            }
            else
            {
                contextControl.dataList.items[i] = {
                    appData : {
                        name: this._cacheStationLists.LBS.list[j].name,
                        id: this._cacheStationLists.LBS.list[j].id,
                    },
                    text1 : this._cacheStationLists.LBS.list[j].name,
                    image1: this._cacheStationLists.LBS.list[j].path,
                    image2: 'common/images/icons/IcnListEntNowPlaying_En.png',
                    itemStyle : 'style02',
                    hasCaret : false
                };

            }
            j++;
        }

        contextControl.updateItems(this._cacheStationLists.LBS.firstIndex, endIndex - 1);
        this._cacheStationLists.LBS = null;
       
    }
};
aharadioApp.prototype._populateNowPlaying = function (details)
{
    log.debug("_populateNowPlaying called...");

    var ctrlData = {
        "contentTitle": (details && details.contentTitle) ? details.contentTitle : "",
        "detailLine2": (details && details.detail2) ? details.detail2 : "",
        "detailLine3": (details && details.detail3) ? details.detail3 : "",
        "detailLine4": (details && details.detail4) ? details.detail4 : "",
    };

    this._currentContextTemplate.nowPlaying4Ctrl.setAudioTitle({audioTitleText: ctrlData.contentTitle});
    this._currentContextTemplate.nowPlaying4Ctrl.setDetailLine1({detailText: ctrlData.detailLine2});
    this._currentContextTemplate.nowPlaying4Ctrl.setDetailLine2({detailText: ctrlData.detailLine3});
    this._currentContextTemplate.nowPlaying4Ctrl.setDetailLine3({detailText: ctrlData.detailLine4});



};

aharadioApp.prototype._updateScrubber = function (tmplt)
{

    log.debug("_updateScrubber called...");

	var progress = 0;

    if (this._cacheTotalTime > 0)
    {
        progress = this._cacheElapsedTime / this._cacheTotalTime;
    }

    tmplt.nowPlaying4Ctrl.umpCtrl.updateScrubber(progress);

}

// Update ElapsedTime
aharadioApp.prototype._updateElapsedTime = function(tmplt)
{

	// update elapsed time field
	if(this._cacheElapsedTime != null && this._cacheElapsedTime != -1)
    {
        tmplt.nowPlaying4Ctrl.umpCtrl.setElapsedTime(this._getTime(this._cacheElapsedTime));
    }
    else
    {
        tmplt.nowPlaying4Ctrl.umpCtrl.setElapsedTime(null);
    }

    if(this._cacheTotalTime != null && this._cacheTotalTime != -1)
    {
        tmplt.nowPlaying4Ctrl.umpCtrl.setTotalTime(this._getTime(this._cacheTotalTime));
    }
    else
    {
        tmplt.nowPlaying4Ctrl.umpCtrl.setTotalTime(null);
    }



}

/**
 * Checks whether the current context has payload
 * =========================
 * @return {boolean}
 */
aharadioApp.prototype._hasContextPayload = function ()
{
    var returnValue = false;
    if (this._currentContext &&
        this._currentContext.params &&
        this._currentContext.params.payload)
        {
            returnValue = true;
        }
        return returnValue;
}

/**
 * Set UMP configuration
 * =========================
 * @param {object}
 * @param {object}
 * @return {void}
 */
aharadioApp.prototype._setUmpConfig = function (config, contextTable)
{
    // validate input
    if (!config || !contextTable)
    {
        return;
    }

    var umpConfiguration = new Array();
    for (var i=0; i<config.playerStatus.buttons.length; i++)
    {
        if (config.playerStatus.buttons[i].available && this._umpButtonConfig[this._buttonsIdTable[config.playerStatus.buttons[i].id]] != null && this._umpButtonConfig[this._buttonsIdTable[config.playerStatus.buttons[i].id]] != undefined)
        {
        	// Note: this copies the _umpButtonConfig object by reference
        	
        	// We need a deep copy of it - use utility function
        	if (utility.deepCopy)
        	{
        		umpConfiguration[this._buttonsIdTable[config.playerStatus.buttons[i].id]] = utility.deepCopy(this._umpButtonConfig[this._buttonsIdTable[config.playerStatus.buttons[i].id]]);
        	}
            else
            { 
            	umpConfiguration[this._buttonsIdTable[config.playerStatus.buttons[i].id]] = this._umpButtonConfig[this._buttonsIdTable[config.playerStatus.buttons[i].id]];
            }
            	
            if (!config.playerStatus.buttons[i].enabled)
            {
                umpConfiguration[this._buttonsIdTable[config.playerStatus.buttons[i].id]].disabled = true;
            }
            else
            {
                umpConfiguration[this._buttonsIdTable[config.playerStatus.buttons[i].id]].disabled = false;

                if (this._buttonsIdTable[config.playerStatus.buttons[i].id] == "shout")
                {
                    // disabled = null so proper UMP icon is loaded
                    umpConfiguration[this._buttonsIdTable[config.playerStatus.buttons[i].id]].disabled = null;
                }
            }

            if (config.playerStatus.buttons[i].selected)
            {
                if (this._buttonsIdTable[config.playerStatus.buttons[i].id] == "playpause")
                {
                    if (this._cachePlayMode != 1)
                    {
                        umpConfiguration[this._buttonsIdTable[config.playerStatus.buttons[i].id]].currentState = "Play";
                    }
                }
                else if (this._buttonsIdTable[config.playerStatus.buttons[i].id] == "playstop")
                {
                    if (this._cachePlayMode != 1)
                    {
                        umpConfiguration[this._buttonsIdTable[config.playerStatus.buttons[i].id]].currentState = "Play";
                    }
                }
                else
                {
                    umpConfiguration[this._buttonsIdTable[config.playerStatus.buttons[i].id]].currentState = "Sel";
                }
            }
            else if (config.playerStatus.buttons[i].selected != null && config.playerStatus.buttons[i].selected != undefined)
            {
                if (this._buttonsIdTable[config.playerStatus.buttons[i].id] == "playpause")
                {
                    umpConfiguration[this._buttonsIdTable[config.playerStatus.buttons[i].id]].currentState = "Pause";
                }
                else if (this._buttonsIdTable[config.playerStatus.buttons[i].id] == "playstop")
                {
                    umpConfiguration[this._buttonsIdTable[config.playerStatus.buttons[i].id]].currentState = "Stop";
                }
                else
                {
                    umpConfiguration[this._buttonsIdTable[config.playerStatus.buttons[i].id]].currentState = "Unsel";
                }
            }

            if (config.playerStatus.buttons[i].imagepath)
            {
                umpConfiguration[this._buttonsIdTable[config.playerStatus.buttons[i].id]].imageBase = config.playerStatus.buttons[i].imagepath;
                if (umpConfiguration[this._buttonsIdTable[config.playerStatus.buttons[i].id]].stateArray)
                {
                    umpConfiguration[this._buttonsIdTable[config.playerStatus.buttons[i].id]].stateArray[umpConfiguration[this._buttonsIdTable[config.playerStatus.buttons[i].id]].currentState] = {imageBase: config.playerStatus.buttons[i].imagePath};
                }
                umpConfiguration[this._buttonsIdTable[config.playerStatus.buttons[i].id]].enabled = null;
                umpConfiguration[this._buttonsIdTable[config.playerStatus.buttons[i].id]].disabled = null;
            }
        }
    }

	// check new configuration
	var isDifferent = false;
	var oldConfig = this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.properties.buttonConfig;

	var oldConfigKeys = Object.keys(oldConfig);
	var umpConfigurationKeys = Object.keys(umpConfiguration);

	for (var i=0; i<umpConfigurationKeys.length; i++)
	{
	    var currentKey = umpConfigurationKeys[i];
		if (!oldConfig[currentKey])
		{
			// old config does not contain the new button
			isDifferent = true;
			break;
		}
		else if (currentKey != oldConfigKeys[i])
		{
			// old button's index is different than the new one
			isDifferent = true;
		}
		else if (oldConfig[currentKey].imageBase != umpConfiguration[currentKey].imageBase)
		{
			// old button's image base is different than the new one
			isDifferent = true;
		}
		else if (/\//.test(umpConfiguration[currentKey].imageBase))
		{
			// the new image contains custom image -> always refresh
			isDifferent = true;
		}
	}

	// set the new config only if it is different than the old one
	if (isDifferent)
	{
		// get currently focussed button
    	var tmp = this._currentlyFocussedButton.buttonId;

    	// set ump configuration
    	this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setUmpConfig(umpConfiguration);
    	this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl._umpScrubber.setMoveIncrement(0, 1, 0.01);

    	// set initial button focus
	    if (this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.properties.buttonConfig[tmp])
	    {
			this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonFocus(tmp);
	    }
	}
	else
	{
		// the config is the same. We need to update the states
		// traverse the new config
		for (var i in umpConfiguration)
		{
			// get the new disabled status
			var disabled = (true === umpConfiguration[i].disabled || false === umpConfiguration[i].disabled) ? umpConfiguration[i].disabled : null;
			// get the new state
			var state = (umpConfiguration[i].currentState) ? umpConfiguration[i].currentState : null;

			// set new disabled status
			if (null !== disabled)
			{
				this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonDisabled(i, disabled);
			}
			// set new state
			if (null != state)
			{
				this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonState(i, state);
			}
		}
	}

    // the configuration of the current context in the context table
    contextTable.controlProperties.NowPlayingCtrl.umpConfig.buttonConfig = umpConfiguration;

}

aharadioApp.prototype._populateEpisodes = function (tmplt, msg)
{
	var currentTopItem = this._currentContextTemplate.list2Ctrl.topItem;
    var currentFocussedItem = this._currentContextTemplate.list2Ctrl.focussedItem;
    
    if (msg.firstIndex == 0)
    {
        var dataList = {
            itemCountKnown : true,
            vuiSupport : true,
            itemCount : msg.count,
            items: []
        };
        tmplt.list2Ctrl.setDataList(dataList);
    }

    var endIndex = 0;
    if ((msg.firstIndex+this._listRequestCount) > msg.count)
    {
        endIndex = msg.count;
    }
    else
    {
        endIndex = msg.firstIndex+this._listRequestCount;
    }
    var j = 0;
    for (var i=msg.firstIndex; i < endIndex; i++)
    {
        if (msg.list[j].selected == 0)
        {
           	  tmplt.list2Ctrl.dataList.items[i] = {
                 itemStyle: msg.list[j].address ? 'style05' : 'style02',
                 appData:{
                     id: msg.list[j].id,
                     name: msg.list[j].name,
                     phonenumber: msg.list[j].phonenumber,
                     address: msg.list[j].address
                 },
                 text1: msg.list[j].name,
                 text2: msg.list[j].address,
                 image1: msg.list[j].path,
                 hasCaret : false
             };  	 
        }
        else
        {
            tmplt.list2Ctrl.dataList.items[i] = {
                itemStyle: msg.list[j].address ? 'style05' : 'style02',
                appData:{
                    id: msg.list[j].id,
                    name: msg.list[j].name,
                    phonenumber: msg.list[j].phonenumber,
                    address: msg.list[j].address
                },
                text1: msg.list[j].name,
                text2: msg.list[j].address,
                image1: msg.list[j].path,
                image2: 'common/images/icons/IcnListEntNowPlaying_En.png',
                hasCaret : false
            };
        }
        j++;
    }

    if (msg.firstIndex == 0)
    {
	    tmplt.list2Ctrl.dataList.itemCount = msg.count;
	    tmplt.list2Ctrl.dataList.vuiSupport = true;
	    tmplt.list2Ctrl.setDataList(tmplt.list2Ctrl.dataList);
    }

    // check for empty items before applying update
    for (var i=0, l=tmplt.list2Ctrl.dataList.items.length; i<l; i++)
    {
    	if ('' === tmplt.list2Ctrl.dataList.items[i].text1)
    	{
    		// empty element found -> clear needDataTimeout
    		tmplt.list2Ctrl.properties.needDataTimeout = 0;
    		break;
    	}
    }

    // update list only if there are some items to update
    if (endIndex > 0)
    {
        tmplt.list2Ctrl.updateItems(msg.firstIndex, endIndex - 1);
    }
    
    this._cacheEpisodesList = null;
    
    this._currentContextTemplate.list2Ctrl.topItem = currentTopItem;
    this._currentContextTemplate.list2Ctrl.focussedItem = currentFocussedItem;
};

/**
 * Disable all UMP buttons
 * =========================
 * @return {void}
 */
aharadioApp.prototype._disableUmpButtons = function ()
{
    var ump = this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl;
    for (var i=0; i<ump._buttonArray.length; i++)
    {
        if (ump._buttonArray[i].appData != "source" && ump._buttonArray[i].appData != "episodes" && ump._buttonArray[i].appData != "mainmenu" && ump._buttonArray[i].appData != "soundsettings")
        {
        	if (null !== ump._buttonArray[i].disabled)
        	{
        		ump.setButtonDisabled(ump._buttonArray[i].appData, true);
        	}

        }
    }
}

/**
 * Enable all UMP buttons
 * =========================
 * @return {void}
 */
aharadioApp.prototype._enableUmpButtons = function ()
{
    var ump = this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl;
    var btns = [];
    if (this._cacheUmpConfig && this._cacheUmpConfig.hasOwnProperty("playerStatus") && this._cacheUmpConfig.playerStatus.hasOwnProperty("buttons"))
    {
	    for(var j=0; j<this._cacheUmpConfig.playerStatus.buttons.length; j++)
	    {
	    	if (1 === this._cacheUmpConfig.playerStatus.buttons[j].available)
	    	{
	    		btns[btns.length] = this._cacheUmpConfig.playerStatus.buttons[j];
	    	}
	    }
	
	    for (var i=0; i<ump._buttonArray.length; i++)
	    {
	    	if (null !== ump._buttonArray[i].disabled && btns[i].enabled == 1)
	    	{
	    		ump.setButtonDisabled(ump._buttonArray[i].appData, false);
	    	}
	    }
    }
    else 
    {
    	    for (var i=0; i<ump._buttonArray.length; i++)
	    {
	    	if (null !== ump._buttonArray[i].disabled)
	    	{
	    		ump.setButtonDisabled(ump._buttonArray[i].appData, false);
	    	}
	    }
    }
};

/**
 * Apply setButton modification from the queue
 * =========================
 * @param {object}
 * @return {object}
 */
aharadioApp.prototype._applySetButton = function(config)
{
    // check _setButtonQueue
    if (!this._setButtonQueue.length)
    {
        return config;
    }

    // validate input
    if (!config || !config.hasOwnProperty('playerStatus') || !config.playerStatus.hasOwnProperty('buttons'))
    {
        return config;
    }

    // prevent shallow copy
    var config = config;

    // traverse the queue
    for (var i=0; i<this._setButtonQueue.length; i++)
    {
        // get current button id
        var buttonId = this._setButtonQueue[i].id;

        // traverse the config for the current item in the queue
        for (var j=0; j<config.playerStatus.buttons.length; j++)
        {
            if (config.playerStatus.buttons[j].id == buttonId)
            {
                // we found a match in the config to update it with the queue item
                config.playerStatus.buttons[j] = this._setButtonQueue[i];
                break;
            }
        }
    }

    // return modified config
    return config;
}

/**
 * Update the state of specific UMP button
 * =========================
 * @param {object} - UMP button config: { id:2, available:0|1, enabled:0|1, selected:0|1, imagepath: "url/to/image.png" }
 *                   the id is according to _buttonsIdTable
 * @return {void}
 */
aharadioApp.prototype._updateUmpButton = function(msg)
{
    // validate input
    if (!msg)
    {
        return;
    }

    // validate app context
    if (!this._currentContext || !this._currentContextTemplate || !this._currentContext.ctxtId)
    {
        return;
    }

    // check for proper context
    if ("LBSDetail" === this._currentContext.ctxtId || "NowPlaying" === this._currentContext.ctxtId)
    {
        // get reference to the UMP
        var ump = this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl;

        // get btnId
        var btnId = this._buttonsIdTable[msg.id];

        // decide what to do depending on the btnId
        switch (btnId)
        {

            case 'thumbsUp' :
            case 'thumbsDown' :
                ump.setButtonState(btnId, (msg.selected) ? 'Sel' : 'Unsel');
                ump.setButtonDisabled(btnId, (msg.enabled) ? false : true);
                break;
            case 'playstop':
                ump.setButtonState(btnId, (msg.selected) ? 'Play' : 'Stop');
                ump.setButtonDisabled(btnId, (msg.enabled) ? false : true);
                break;
            case 'playpause' :
                ump.setButtonState(btnId, (msg.selected) ? 'Play' : 'Pause');
                ump.setButtonDisabled(btnId, (msg.enabled) ? false : true);
                break;

            case 'source' :
            case 'episodes' :
            case 'previous' :
            case 'next' :
            case 'rewind' :
            case 'fastforward' :
            case 'navi' :
            case 'call' :
            case 'soundsettings' :
            case 'shout' :
            case 'mainmenu' :
                ump.setButtonDisabled(btnId, (msg.enabled) ? false : true);
                break;

            default :
                // no button to update
                break;
        }


    }
}

aharadioApp.prototype._clearNowPlayingData = function ()
{
    this._setContentArt("./common/images/no_artwork_icon.png");
    this._currentContextTemplate.nowPlaying4Ctrl.setDetailLine1({detailText: ""});
    this._currentContextTemplate.nowPlaying4Ctrl.setDetailLine2({detailText: ""});
    this._currentContextTemplate.nowPlaying4Ctrl.setDetailLine3({detailText: ""});
    this._currentContextTemplate.nowPlaying4Ctrl.setPhoneNumber(null);
    this._currentContextTemplate.nowPlaying4Ctrl.setDistanceDirection(null);
}

aharadioApp.prototype._getFormattedTime = function (seconds)
{
    var hours   = Math.round(seconds / 3600).toString();
    var minutes = Math.round((seconds - (hours * 3600)) / 60).toString();
    var seconds = Math.round(seconds - (hours * 3600) - (minutes * 60)).toString();

    if (hours.length < 2)
    {
        hours = "0" + hours;
    }
    if (minutes.length < 2)
    {
        minutes = "0" + minutes;
    }
    if (seconds.length < 2)
    {
        seconds = "0" + seconds;
    }


    return {h: hours, m: minutes, s: seconds}
}

aharadioApp.prototype._getTime = function (seconds)
{
    // Validate input
    if (isNaN(seconds))
    {
        log.warn('Only numbers are accepted');
        return;
    }

    // Create Date object
    var date = new Date();
    date.setUTCHours(0);
    date.setUTCMinutes(0);
    date.setUTCSeconds(seconds);

    // Extraxt data
    var dateString = date.toUTCString();
    var lessThanAnHour = /.*00:(\d{2}:\d{2}).*/;
    var moreThanAnHour = /.*(\d{2}:\d{2}:\d{2}).*/;
    return lessThanAnHour.test(dateString) ? dateString.replace(lessThanAnHour, "$1") : dateString.replace(moreThanAnHour, "$1");
}


/**
 * =========================
 * Framework register
 * =========================
 */
framework.registerAppLoaded("aharadio", null, true);