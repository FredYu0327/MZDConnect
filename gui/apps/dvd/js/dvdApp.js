/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: dvdApp.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: apopoval
 Date: 23-Oct-2012
 __________________________________________________________________________

 Description: IHU GUI DVD App

 Revisions:
 v0.1 (23-Oct-2012) Initial Version using 3.5 UI spec
 v0.2 (26-Oct-2012) Added surfaces manipulation
 v0.3 (05-Dec-2012) Added DVDGraphic, DVDSettings, AspectRatio, ParentalLock, ParentalLockRating, PINEntryUnlock, PinEntryNew, PinEntryReset
 v0.4 (07-Dec-2012) Added TopMenuGraphic, VUIConfirmNewPIN, VideoSettings
 v0.5 (13-Dec-2012) Added proper events in VideoNowPlaying, PlayStatus msg handling
 v0.6 (14-Dec-2012) Fixed Global events, now sent to common
 v0.7 (19-Dec-2012) Updated events
 v0.8 (19-Dec-2012) populateUmpCtrl bug fixed
 v0.9 (16-Jan-2013) Updated key event focus management
 v0.9 (16-Jan-2013) Surface changed from NATGUI_SURFACE to BACKUPCAM_SURFACE_ID
 v1.0 (28-Jan-2013) Migrated to NowPlaying3, require ctrlStyle: "Style5" !
 v1.1 (22-Feb-2013) Added 3.8 dictionaries
 v1.2 (15-Mar-2013) Added Global.GoBack behavior, added List2Ctrl
 v1.3 (23-Apr-2013) Added speed restricted behavior (SW00112857)
 v1.4 (07-May-2013) Added tool tips (SW00113037)
 v1.5 (13-May-2013) Changed NowPlaying4Tmplt style to 0
 v1.6 (04-Jun-2013) Changed radio buttons to ticks
 v1.7 (04-Jun-2013) Changed common.OK casing (SW00120275)
 v2.0 (11-Jun-2013) Added SBNs (SW00116240)
 v2.1 (13-Jun-2013) Use new ListCtrl item style for check-box On/Off toggle (SW00116333)
 v2.2 (18-Jun-2013) Added missing contexts
 v2.3 (24-Jun-2013) Updated event names (SW00122083)
 v2.4 (03-Jul-2013) DialPadCtrl titles moved to statusbar (SW00109846)
 v2.5 (11-Jul-2013) Fixed UMP button configs, updated some event names (SW00124180)
 v2.6 (12-Jul-2013) Migrated to the latest controls (SW00123968)
 v2.7 (16-Jul-2013) Removed surface manipulation
 v2.8 (17-Jul-2013) Added status bar in NowPlaying contexts
 v2.9 (23-Jul-2013) Added scrubber in VideoNowPlaying context (SW00125250)
 v3.0 (24-Jul-2013) UMP is hidden after 3 seconds (SW00125249)
 v3.1 (25-Jul-2013) Fixed toggle buttons style (SW00119155)
 v3.2 (25-Jul-2013) Added selectByLine support (SW00121004)
 v3.3 (25-Jul-2013) Updating the UMP buttons based on MMUI signals (SW00126129)
 v3.4 (31-Jul-2013) Added DVDMenuCtrl (SW00107887)
 v3.5 (22-Aug-2013) LV Dictionary updated (SW00128919)
 v3.6 (23-Aug-2013) Null checks implemented in to prevent State Timeouts (SW00128443)
 v3.7 (24-Aug-2013) Added this._previousContext null check (SW00127910)
 v3.8 (28-Aug-2013) Fixed tooltip for subtitles button (SW00130100)  //TODO: change the icon and fix the tooltip for entertainment menu button.
 v3.9 (28-Aug-2013) Fixed tooltip for setting button (SW00130099)
 v4.0 (02-Sep-2013) Fixed aspect ratio change (SW00130675)
 v4.1 (02-Sep-2013) Fixed subtitle_setting signal sending needing 2 button presses (SW00130101)
 v4.2 (03-Sep-2013) Implemented total and elapsed time, and progress on the scrubber (SW00130917)
 v4.3 (04-Sep-2013) Total/elapsed time message handling changed to use new interface (SW00131063)
 v4.4 (04-Sep-2013) Implemented scrubber bar control (SW00130910)
 v4.5 (11-Sep-2013) Fixed text on DVD on-screen controller (SW00131436)
 v4.5 (15-Sep-2013) After an inactivity timeout the Controller should disappear (SW00132160), Implement Parental Control (SW00131084), Fixed text on on-screen controller (SW00131436)
 v4.6 (18-Jun-2014) GUI_DVD: MY15 Graphic Asset Update and Clean Up (SW00150277)
 __________________________________________________________________________

 */
log.addSrcFile("dvdApp.js", "dvd");

function dvdApp(uiaId)
{
    log.debug("Constructor called.");

    // Base application functionality is provided in a common location via this call to baseApp.init().
    // See framework/js/BaseApp.js for details.
    baseApp.init(this, uiaId);
}


/**************************
 * App Init is standard function called by framework *
 **************************/

/*
 * Called just after the app is instantiated by framework.
 * All variables local to this app should be declared in this function
 */
dvdApp.prototype.appInit = function()
{
    log.debug("dvdApp appInit  called...");

    if (framework.debugMode)
    {
        utility.loadScript("apps/dvd/test/dvdAppTest.js");
    }

    this.listItemClick = this._listItemClickCallback.bind(this);

    var selectCallback = this._umpBtnSelectCallback.bind(this);
    var holdStartCallback = this._umpBtnHoldStartCallback.bind(this);
    var holdStopCallback = this._umpBtnHoldStopCallback.bind(this);

    // CACHE
    this._cachedNowPlayingConfig = {
        playing   : 0,
        subtitles : {status: 0, available: 1},
        camangle  : {status: 0, available: 1},
        aspect    : {type  : "Unknown"},
        elapsed   : {hours:0, minutes:0, seconds:0},
        total : {hours:0, minutes:0, seconds:0}
    };

    // Aspect Ratio Config
    this._aspectRatioConfig = [
        "Wide",
        "FullLetterbox",
        "FullPanScan"
    ];

    this._cachedParentalLockRating = null;
    this._cachedSetAspectRatio = null;
    this._slideProgressValue = null;
    this._stopElapsedUpdate = false;
    this._cachedRegion = null;

    // ump slider
    this._finalAdjustmentTimeout = null;
    this._setTimeProgressTimeout = null;

    var closeButtonAppData = {
        bumpToClose : "GoToCloseAdjustmentCtxt", // Real event ID is unknown. Check with MMUI team to determine real event ID.
        selectClose: "SelectClose" // Event ID will be different depending on callback received. UI Spec behavior is unusual.
    };

    //========================= Start of UMP button config =============================

    //Define all buttons here, refer them later
    this._umpButtons = new Object();
    this._umpButtons["select"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpPlayPause_Play",
        disabled : false,
        appData : "SendSelect",
        labelId: "SelectController",
        selectCallback: selectCallback
    };
    this._umpButtons["up"] =
    {
        buttonBehavior : "shortPressOnly",
        disabled : false,
        imageBase : "IcnUmpScrollUp",
        appData : "SendMoveUp",
        label: "Up",
        labelId: "Up",
        selectCallback: selectCallback
    };
    this._umpButtons["down"] =
    {
        buttonBehavior : "shortPressOnly",
        disabled : false,
        imageBase : "IcnUmpScrollDown",
        appData : "SendMoveDown",
        label: "Down",
        labelId: "Down",
        selectCallback: selectCallback
    };
    this._umpButtons["left"] =
    {
        buttonBehavior : "shortPressOnly",
        disabled : false,
        imageBase : "IcnUmpPreviousAudio",
        appData : "SendMoveLeft",
        selectCallback: selectCallback
    };
    this._umpButtons["right"] =
    {
        buttonBehavior : "shortPressOnly",
        disabled : false,
        imageBase : "IcnUmpNextAudio",
        appData : "SendMoveRight",
        selectCallback: selectCallback
    };
    this._umpButtons["source"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpEntMenu",
        disabled : false,
        appData : "SelectSource",
        selectCallback: selectCallback
    };
    this._umpButtons["play"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpPlayPause_Play",
        disabled : false,
        appData : "SelectPlay",
        selectCallback: selectCallback
    };
    this._umpButtons["DVDsettings"] =
    {
        buttonBehavior : "shortPressOnly",
        disabled : false,
        imageBase : "IcnUmpSettings",
        appData : "SelectSettings",
        selectCallback: selectCallback
    };
    this._umpButtons["Audiosettings"] =
    {
        buttonBehavior : "shortPressOnly",
        disabled : false,
        imageBase : "IcnUmpEqualizer",
        appData : "SelectSettings",
        selectCallback: selectCallback
    };
    this._umpButtons["menu"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpCurrentList",
        labelId : "SelectRootMenuTooltip",
        disabled : false,
        appData : "SelectRootMenu",
        selectCallback: selectCallback
    };
    this._umpButtons["prev"] =
    {
        buttonBehavior : "shortAndHold",
        imageBase : "IcnUmpPreviousAudio",
        disabled : false,
        appData : "Global.Previous",
        selectCallback: selectCallback,
        holdStartCallback : holdStartCallback,
        holdStopCallback : holdStopCallback,
    };
    this._umpButtons["playpause"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpPlayPause",
        currentState:"Pause",
        stateArray: [
            {
                state:"Play"
            },
            {
                state:"Pause"
            },

        ],
        disabled : false,
        appData : "playpause",
        selectCallback: selectCallback
    };
    this._umpButtons["next"] =
    {
        buttonBehavior : "shortAndHold",
        imageBase : "IcnUmpNextAudio",
        disabled : false,
        appData : "Global.Next",
        selectCallback: selectCallback,
        holdStartCallback : holdStartCallback,
        holdStopCallback : holdStopCallback,
    };
    this._umpButtons["camangle"] =
    {
        buttonBehavior : "shortPressOnly",
        disabled : false,
        imageBase : "IcnUmpCamAngle_Unsel",
        labelId : "common.Tooltip_IcnUmpCamAngle",
        appData : "SelectCameraAngle",
        selectCallback: selectCallback
    };
    this._umpButtons["subtitles"] =
    {
        buttonBehavior : "shortPressOnly",
        disabled : false,
        imageBase : "IcnUmpSubtitles",
        currentState:"Unsel",
        stateArray: [
            {
                state:"Unsel", labelId : "common.Tooltip_IcnUmpSubtitles"
            },
            {
                state:"Sel" , labelId :"common.Tooltip_IcnUmpSubtitles"
            },

        ],
        disabled : false,
        appData : "ToggleSubtitles",
        selectCallback: selectCallback
    };
    this._umpButtons["lock"] =
    {
        buttonBehavior : "shortPressOnly",
        disabled : false,
        imageBase : "IcnUmpLock_Locked",
        labelId : "ParentalLock",
        appData : "SelectParentLock",
        selectCallback: selectCallback
    };
    this._umpButtons["adjustments"] =
    {
        buttonBehavior : "shortPressOnly",
        disabled : false,
        imageBase : "IcnUmpVideoSet",
        appData : "SelectVideoSettings",
        selectCallback: selectCallback
    };

    // TopMenu UMP Button config
    this._umpButtonConfigTopMenu = new Object();
    this._umpButtonConfigTopMenu["select"]  = this._umpButtons["select"];
    this._umpButtonConfigTopMenu["up"]      = this._umpButtons["up"];
    this._umpButtonConfigTopMenu["down"]    = this._umpButtons["down"];
    this._umpButtonConfigTopMenu["left"]    = this._umpButtons["left"];
    this._umpButtonConfigTopMenu["right"]   = this._umpButtons["right"];

    // TopMenuGraphic UMP Button config
    this._umpButtonConfigTopMenuGraphic = new Object();
    this._umpButtonConfigTopMenuGraphic["source"]   = this._umpButtons["source"];
    this._umpButtonConfigTopMenuGraphic["play"]     = this._umpButtons["play"];
    this._umpButtonConfigTopMenuGraphic["settings"] = this._umpButtons["Audiosettings"];

    // VideoNowPlaying and DVDGraphic UMP Button config
    this._umpButtonConfigDVD = new Object();
    this._umpButtonConfigDVD["source"]      = this._umpButtons["source"];
    this._umpButtonConfigDVD["menu"]        = this._umpButtons["menu"];
    this._umpButtonConfigDVD["prev"]        = this._umpButtons["prev"];
    this._umpButtonConfigDVD["playpause"]   = this._umpButtons["playpause"];
    this._umpButtonConfigDVD["next"]        = this._umpButtons["next"];
    this._umpButtonConfigDVD["camangle"]    = this._umpButtons["camangle"];
    this._umpButtonConfigDVD["subtitles"]   = this._umpButtons["subtitles"];
    this._umpButtonConfigDVD["lock"]        = this._umpButtons["lock"];
    this._umpButtonConfigDVD["settings"]    = this._umpButtons["DVDsettings"];
    this._umpButtonConfigDVD["adjustments"] = this._umpButtons["adjustments"];

    // TitleGraphic and TitleScreen UMP Button config
    this._umpButtonConfigTitle = new Object();
    this._umpButtonConfigTitle["source"]    = this._umpButtons["source"];
    this._umpButtonConfigTitle["prev"]      = this._umpButtons["prev"];
    this._umpButtonConfigTitle["playpause"] = this._umpButtons["playpause"];
    this._umpButtonConfigTitle["next"]      = this._umpButtons["next"];

    //========================= End of button config =============================

    this._scrubberConfig = {
        "scrubberStyle": "Style01",
        "mode" : "scrubber",
        "slideCallback" : this._umpSlideCallback.bind(this),
        "minChangeInterval" : 250,
        "settleTime": 2000,
        "min" : 0.0,
        "max" : 1.0,
        "increment" : 0.01,
        "value" : 0,
        "appData" : null,
        "disabled" : false,
        "buffering" : false
    };


    this._DVDSettingsCtxtDataList = {
        vuiSupport : true,
        itemCountKnown : true,
        itemCount : 2,
        items: [
            { appData : 'SelectSettings',    text1Id : 'AudioSettings', disabled : false, hasCaret: false, itemStyle : 'style01' },
            { appData : 'SelectAspectRatio', text1Id : 'AspectRatio'  , disabled : false, hasCaret: true, itemStyle : 'style06', labelWidth : 'wide' },

        ]
    };
    this._AspectRatioCtxtDataList = {
        vuiSupport : true,
        itemCountKnown : true,
        itemCount : 3,
        items: [
            { appData : 'SelectAspectRatioItem', text1Id : 'Widescreen', itemStyle : 'style03', hasCaret: false, image1:'tick' },
            { appData : 'SelectAspectRatioItem', text1Id : 'Letterbox', itemStyle : 'style03', hasCaret: false, image1:'tick' },
            { appData : 'SelectAspectRatioItem', text1Id : 'Panscan', itemStyle : 'style03', hasCaret: false, image1:'tick' },
        ]
    };

    this._ParentalLockRatingCtxtDataList = {
        vuiSupport : true,
        itemCountKnown : true,
        itemCount : 4,
        items: [
            { appData : 'SelectParentLockRating', text1Id : 'None', checked : false, itemStyle : 'style03', hasCaret: false, image1:'tick'  },
            { appData : 'SelectParentLockRating', text1 : 'G',  checked : false, itemStyle : 'style03', hasCaret: false, image1:'tick'  },
            { appData : 'SelectParentLockRating', text1Id : 'PG13', checked : false, itemStyle : 'style03', hasCaret: false, image1:'tick'  },
            { appData : 'SelectParentLockRating', text1Id : 'R15',  checked : false, itemStyle : 'style03', hasCaret: false, image1:'tick'  },

        ]
    };

    // Tabs Config
    this._tabsConfig = [
        {
            "labelId"       : "Brightness",
            "itemConfig"    :
            {
                style: "pivot",
                minChangeInterval: 250,
                settleTime: 1000,
                min: -5,
                max: 5,
                increment: 1,
                value: 0,
                appData: "brightnessTab",
            }
        },
        {
            "labelId"       : "Contrast",
            "itemConfig"    :
            {
                style: "pivot",
                minChangeInterval: 250,
                settleTime: 1000,
                min: -5,
                max: 5,
                increment: 1,
                value: 0,
                appData: "contrastTab",
            }
        },
        {
            "labelId"       : "Tint",
            "itemConfig"    :
            {
                style: "pivot",
                minChangeInterval: 250,
                settleTime: 1000,
                min: -5,
                max: 5,
                increment: 1,
                value: 0,
                appData: "tintTab",
            }
        },
        {
            "labelId"       : "Color",
            "itemConfig"    :
            {
                style: "pivot",
                minChangeInterval: 250,
                settleTime: 1000,
                min: -5,
                max: 5,
                increment: 1,
                value: 0,
                appData: "colorTab",
            }
        },
        {
            "labelId"       : "Reset",
            "itemConfig"    : { appData : "ResetAll", style : "oneButton", buttonId : "Reset" }
        }
    ];

    //Context table
    //@formatter:off
    this._contextTable = {

        /* DIALOGS */

        "DiscErrorNotification" : {
            sbNameId : "DVD",
            sbNameIcon : "common/images/icons/IcnSbnEnt.png",
            template : "Dialog3Tmplt",
            controlProperties : {
                "Dialog3Ctrl" : {
                    "contentStyle" : "style02",
                    "text1Id" : "DiscErrorNotification",
                    "text2Id" : "SongsNotPlayable",
                    "buttonCount" : 1,
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "common.Ok",
                            appData : "ok",
                            selectCallback : this._dialogDefaultSelectCallback.bind(this)
                        },
                    }
                }
            },
            contextInFunction : this._prepareDialog.bind(this),
        },

        "MechanicalErrorNotification" : {
            sbNameId : "DVD",
            sbNameIcon : "common/images/icons/IcnSbnEnt.png",
            template : "Dialog3Tmplt",
            controlProperties : {
                "Dialog3Ctrl" : {
                    "contentStyle" : "style02",
                    "text1Id" : "MechanicalError",
                    "buttonCount" : 1,
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "common.Ok",
                            appData : "ok",
                            selectCallback : this._dialogDefaultSelectCallback.bind(this)
                        },
                    }
                }
            },
            contextInFunction : this._prepareDialog.bind(this),
        },

        "DVDRegionViolation" : {
            sbNameId : "DVD",
            sbNameIcon : "common/images/icons/IcnSbnEnt.png",
            template : "Dialog3Tmplt",
            controlProperties : {
                "Dialog3Ctrl" : {
                    "contentStyle" : "style02",
                    "text1Id" : "DVDRegionViolation",
                    "buttonCount" : 1,
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "common.Ok",
                            appData : "ok",
                            selectCallback : this._dialogDefaultSelectCallback.bind(this)
                        },
                    }
                }
            },
            contextInFunction : this._prepareDialog.bind(this),
        },

        "VUIConfirmNewPIN" : {
            sbNameId : "DVD",
            sbNameIcon : "common/images/icons/IcnSbnEnt.png",
            template : "Dialog3Tmplt",
            controlProperties : {
                "Dialog3Ctrl" : {
                    contentStyle : "style05",
                    defaultSelectCallback :  this._dialogDefaultSelectCallback.bind(this),
                    buttonCount : 2,
                    buttonConfig : {
                        button1 : {
                            labelId : "common.No",
                            appData : "no"
                        },
                        button2 : {
                            labelId : "common.Yes",
                            appData : "yes"
                        },
                    },
                    text1Id : 'IsThisCorrect',
                    text2 : '',
                }
            },
            contextInFunction : this._prepareDialog.bind(this),
        },

         /* NP AND DVD */

        "TitleGraphic" : {
            sbNameId : "DVD",
            sbNameIcon : "common/images/icons/IcnSbnEnt.png",
            template : "SpeedRestrictedVideoTmplt",
            "templatePath": "apps/dvd/templates/SpeedRestrictedVideo",
            controlProperties : {
                "SpeedRestrictedVideoCtrl" : {
                    text1Id: "VideoNotDisplayed",
                    umpConfig : {
                        buttonConfig: this._umpButtonConfigTitle,
                        defaultFocusCallback : this._umpFocusCallback.bind(this),
                    },
                }
            },
            readyFunction : this._TitleGraphicReady.bind(this),
        }, // end of "TitleGraphic"

        "TitleScreen" : {
            sbNameId : "DVD",
            sbNameIcon : "common/images/icons/IcnSbnEnt.png",
            template : "NowPlaying4Tmplt",
            properties : {
                "customBgImage" : "common/images/FullTransparent.png",
                "isDialog" : false,
                statusBarVisible : true,
                displaySbUmpByActivity : true,
                displaySbUmpActivityTypes : "both",
            },
            controlProperties : {
                "NowPlayingCtrl" : {
                    ctrlStyle: "Style0",
                    umpConfig : {
                        buttonConfig: this._umpButtonConfigTitle,
                        defaultFocusCallback : this._umpFocusCallback.bind(this),
                    },
                }
            },
            readyFunction : this._TitleScreenReady.bind(this),
        }, // end of "TitleScreen"

        "TopMenuGraphic" : {
            sbNameId : "DVD",
            sbNameIcon : "common/images/icons/IcnSbnEnt.png",
            template : "SpeedRestrictedVideoTmplt",
            "templatePath": "apps/dvd/templates/SpeedRestrictedVideo",
            controlProperties : {
                "SpeedRestrictedVideoCtrl" : {
                    text1Id: "VideoNotDisplayed",
                    umpConfig : {
                        buttonConfig: this._umpButtonConfigTopMenuGraphic,
                        defaultFocusCallback : this._umpFocusCallback.bind(this),
                    },
                }
            },
            readyFunction : this._TopMenuGraphicReady.bind(this),
        }, // end of "TopMenuGraphic"

        "TopMenu" : {
            sbNameId : "DVD",
            sbNameIcon : "common/images/icons/IcnSbnEnt.png",
            template : "dvdMenuTmplt",
            templatePath : "apps/dvd/templates/dvdMenu",
            properties :{
                "customBgImage" : "common/images/FullTransparent.png",
                "isDialog" : false,
                statusBarVisible : true,
                displaySbUmpByActivity : true,
                displaySbUmpActivityTypes : "touch",
            },
            controlProperties : {
                "dvdMenuCtrl" : {
                    buttonConfig : this._umpButtonConfigTopMenu,
                },
            },
        }, // end of "TopMenu"

        "DVDGraphic" : {
            sbNameId : "DVD",
            sbNameIcon : "common/images/icons/IcnSbnEnt.png",
            template : "SpeedRestrictedVideoTmplt",
            "templatePath": "apps/dvd/templates/SpeedRestrictedVideo",
            controlProperties : {
                "SpeedRestrictedVideoCtrl" : {
                    text1Id: "VideoNotDisplayed",
                    umpConfig : {
                        buttonConfig: this._umpButtonConfigDVD,
                        defaultFocusCallback : this._umpFocusCallback.bind(this),
                    },
                }
            },
            readyFunction : this._DVDGraphicReady.bind(this),
        }, // end of "DVDGraphic"

        "VideoNowPlaying" : {
            sbNameId : "DVD",
            sbNameIcon : "common/images/icons/IcnSbnEnt.png",
            template : "NowPlaying4Tmplt",
            properties :{
                "customBgImage" : "common/images/FullTransparent.png",
                "isDialog" : false,
                statusBarVisible : true,
                displaySbUmpByActivity : true,
                displaySbUmpActivityTypes : "both",
            },
            controlProperties : {
                "NowPlayingCtrl" : {
                    ctrlStyle: "Style0",
                    umpConfig : {
                        hasScrubber    : true,
                        scrubberConfig : this._scrubberConfig,
                        buttonConfig   : this._umpButtonConfigDVD,
                        defaultFocusCallback : this._umpFocusCallback.bind(this),
                    },
                },
            },
            readyFunction : this._VideoNowPlayingReady.bind(this),
        }, // end of "VideoNowPlaying"

        /* LIST */

        "DVDSettings" : {
            sbNameId : "DVD",
            sbNameIcon : "common/images/icons/IcnSbnEnt.png",
            template : "List2Tmplt",
            leftBtnStyle : "goBack",
            controlProperties: {
                "List2Ctrl" : {
                    numberedList : true,
                    dataList: this._DVDSettingsCtxtDataList,
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',
                        text1Id : 'Settings',
                    },
                    selectCallback : this.listItemClick.bind(this),
                } // end of properties for "List2Ctrl"
            }, // end of list of controlProperties
            readyFunction : this._DVDSettingsCtxtReady.bind(this),
        }, // end of "DVDSettings"

        "AspectRatio" : {
            sbNameId : "DVD",
            sbNameIcon : "common/images/icons/IcnSbnEnt.png",
            template : "List2Tmplt",
            leftBtnStyle : "goBack",
            controlProperties : {
                "List2Ctrl" : {
                    numberedList : true,
                    dataList: this._AspectRatioCtxtDataList,
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',
                        text1Id : 'AspectRatio',
                    },
                    selectCallback : this.listItemClick.bind(this),
                } // end of properties for "List2Ctrl"
            }, // end of list of controlProperties
            readyFunction : this._AspectRatioCtxtReady.bind(this),
        }, // end of "AspectRatio"

        "ParentalLock" : {
            sbNameId : "DVD",
            sbNameIcon : "common/images/icons/IcnSbnEnt.png",
            template : "List2Tmplt",
            leftBtnStyle : "goBack",
            controlProperties : {
                "List2Ctrl" : {
                    numberedList : true,
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',
                        text1Id : 'ParentalLock',
                    },
                    selectCallback : this.listItemClick.bind(this),
                } // end of properties for "List2Ctrl"
            }, // end of list of controlProperties
            readyFunction : this._ParentalLockReadyToDisplay.bind(this),
        }, // end of "ParentalLock"

        "ParentalLockRating" : {
            sbNameId : "DVD",
            sbNameIcon : "common/images/icons/IcnSbnEnt.png",
            template : "List2Tmplt",
            leftBtnStyle : "goBack",
            controlProperties : {
                "List2Ctrl" : {
                    numberedList : true,
                    dataList: this._ParentalLockRatingCtxtDataList,
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',
                        text1Id : 'ChooseMaxAllowRating',
                    },
                    selectCallback : this.listItemClick.bind(this),
                } // end of properties for "List2Ctrl"
            }, // end of list of controlProperties
            readyFunction : this._ParentalLockRatingReadyToDisplay.bind(this),
        }, // end of "ParentalLockRating"

        "PinEntryUnlock" : {
            sbNameId : "EnterPIN",
            template : "DialPad2Tmplt",
            controlProperties : {
                "DialPad2Ctrl" : {
                    defaultSelectCallback : this._dialPadHandler.bind(this),
                    ctrlStyle : "DialpadStyle03",
                    appData : "testDialPadPinCode",
                    isPassword : true,
                    value: ""
                } // end of properties for "DialPadCtrl"
            }, // end of list of controlProperties
            readyFunction : this._PinEntryUnlockReady.bind(this),
        }, // end of "PINEntryUnlock"

        "PinEntryNew" : {
            sbNameId : "EnterNewPin",
            template : "DialPad2Tmplt",
            controlProperties: {
                "DialPad2Ctrl" : {
                    defaultSelectCallback : this._dialPadHandler.bind(this),
                    ctrlStyle : "DialpadStyle03",
                    appData : "testDialPadPinCode",
                    isPassword : true,
                    value: ""
                } // end of properties for "DialPadCtrl"
            }, // end of list of controlProperties
            readyFunction : this._PinEntryNewReady.bind(this),
        }, // end of "PinEntryNew"

        "PinEntryReset" : {
            sbNameId : "EnterFactoryPIN",
            template : "DialPad2Tmplt",
            controlProperties: {
                "DialPad2Ctrl" : {
                    defaultSelectCallback : this._dialPadHandler.bind(this),
                    ctrlStyle : "DialpadStyle03",
                    appData : "testDialPadPinCode",
                    isPassword : true,
                    value: ""
                } // end of properties for "DialPadCtrl"
            }, // end of list of controlProperties
            readyFunction : this._PinEntryResetReady.bind(this),
        }, // end of "PinEntryReset"


        "VideoSettings" : {
            sbNameId : "DVD",
            sbNameIcon : "common/images/icons/IcnSbnEnt.png",
            template : "ScreenSettings2Tmplt",
            properties : {
                "statusBarVisible" : false,
            },
            controlProperties: {
                "ScreenSettings2Ctrl" : {
                    style : "bottom",
                    adjustButtonConfig : {"enabled": true, "selectCallback": this._adjustBtnHandler.bind(this)},
                    tabsButtonConfig : {"visible": true, "currentlySelectedTab": 0, "tabsConfig": this._tabsConfig},
                    secondaryButtonConfig : null,   //These parameters are null (or omitted),
                    secondaryButtonCallback : null, //to not include a secondary button in this context
                    secondaryButtonAniTime : null,
                    slideCallback : this._slideHandler.bind(this), // called when an item is dragged
                    selectCallback : this._selectHandler.bind(this), // called when a button is pressed
                } // end of properties for "ScreenSettings2Ctrl"
            }, // end of list of controlProperties
            readyFunction : this._VideoSettingsReadyToDisplay.bind(this)
        },
    }; //
    //@formatter:on

    this._messageTable = {
        "Subtitles" :           this._SubtitlesMsgHandler.bind(this),
        "Multiangle" :          this._MultiangleMsgHandler.bind(this),
        "PlayStatus" :          this._PlayStatusMsgHandler.bind(this),
        "RetractUMP" :          this._RetractUMPMsgHandler.bind(this),
        "UserInput" :           this._UserInputMsgHandler.bind(this),
        "VideoSettingsValues":  this._VideoSettingsValuesMsgHandler.bind(this),
        "SetTimeProgress" :     this._SetTimeProgressMsgHandler.bind(this),
        "AspectRatio" :         this._AspectRatioMsgHandler.bind(this),
        "ClearPINField" :       this._ClearPINFieldMsgHandler.bind(this),
        "SetParentalLockRating" : this._SetParentalLockRatingMsgHandler.bind(this),
        "SetRegion" :           this._SetRegionMsgHandler.bind(this),

        "Global.AtSpeed" :      this._SpeedHandler.bind(this), // received anywhere (even when not in focus)
        "Global.NoSpeed" :      this._SpeedHandler.bind(this), // received anywhere (even when not in focus)

        "TimedSbn_DiscError" :  this._TimedSbn_DiscErrorMsgHandler.bind(this),            // received when not in focus
        "TimedSbn_MechanicalError" : this._TimedSbn_MechanicalErrorMsgHandler.bind(this), // received when not in focus
        "TimedSbn_RegionViolation" : this._TimedSbn_RegionViolationMsgHandler.bind(this), // received when not in focus
        "TimedSbn_EjectingDisc"    : this._TimedSbn_EjectingDiscMsgHandler.bind(this),    // received when not in focus
        "TimedSbn_DiscInserted"    : this._TimedSbn_DiscInsertedHandler.bind(this),       // received when not in focus
		"TimedSbn_TrackNumber"     : this._TimedSbn_TrackNumber.bind(this),               // Recived When Not in Focus
    };

};

/**************************
 * CONTEXT HANDLERS *
 **************************/

dvdApp.prototype._prepareDialog = function()
{
    log.debug("_prepareDialog called ");

    this._contextTable["VUIConfirmNewPIN"].controlProperties.Dialog3Ctrl.fullScreen = false;
    this._contextTable["DVDRegionViolation"].controlProperties.Dialog3Ctrl.fullScreen = false;
    this._contextTable["DiscErrorNotification"].controlProperties.Dialog3Ctrl.fullScreen = false;
    this._contextTable["MechanicalErrorNotification"].controlProperties.Dialog3Ctrl.fullScreen = false;

    if (this._previousContext && this._previousContext.ctxtId)
    {
        if (this._previousContext.ctxtId == "TitleGraphic" ||
            this._previousContext.ctxtId == "TitleScreen" ||
            this._previousContext.ctxtId == "TopMenu" ||
            this._previousContext.ctxtId == "TopMenuGraphic" ||
            this._previousContext.ctxtId == "VideoNowPlaying" ||
            this._previousContext.ctxtId == "VideoSettings" ||
            this._previousContext.ctxtId == "DVDGraphic" )
        {
            this._contextTable["VUIConfirmNewPIN"].controlProperties.Dialog3Ctrl.fullScreen = true;
            this._contextTable["DVDRegionViolation"].controlProperties.Dialog3Ctrl.fullScreen = true;
            this._contextTable["DiscErrorNotification"].controlProperties.Dialog3Ctrl.fullScreen = true;
            this._contextTable["MechanicalErrorNotification"].controlProperties.Dialog3Ctrl.fullScreen = true;
        }
    
    }
    
    if(this._currentContext.params.payload != null && this._currentContext.params.payload !== undefined) 
    {
        this._contextTable["VUIConfirmNewPIN"].controlProperties.Dialog3Ctrl.text2 = this._currentContext.params.payload.FourDigitPin;
    }
};

// TitleGraphic
dvdApp.prototype._TitleGraphicReady = function()
{
    log.debug("TitleGraphic context is ready to display");
    // this._currentContextTemplate.nowPlaying4Ctrl.showBackgroundImage(false);
    this._populateSpeedRestrictedVideoCtrl(this._currentContextTemplate);
};

// TitleScreen
dvdApp.prototype._TitleScreenReady = function()
{
    // update buttons (should be only play/pause)
    this._populatenowPlaying4Ctrl(this._currentContextTemplate);
};

// TopMenuGraphic
dvdApp.prototype._TopMenuGraphicReady = function()
{
    log.debug("TopMenuGraphic context is ready to display");
    // this._currentContextTemplate.nowPlaying4Ctrl.showBackgroundImage(false);
    this._currentContextTemplate.speedRestrictedVideoCtrl.umpCtrl.setButtonDisabled("settings", false);
};

// VideoNowPlaying
dvdApp.prototype._VideoNowPlayingReady = function()
{
    log.debug("VideoNowPlaying context is ready to display");

    // reset elapsed update flag
    this._stopElapsedUpdate = false;

    this._currentContextTemplate.nowPlaying4Ctrl.showBackgroundImage(false);
    this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonDisabled("menu", false);
    this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonDisabled("camangle", false);
    this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonDisabled("subtitles", false);
    this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonDisabled("lock", false);
    this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonDisabled("adjustments", false);
    this._updateTimeAndProgress();
    this._populatenowPlaying4Ctrl(this._currentContextTemplate);
};

// DVDGraphic
dvdApp.prototype._DVDGraphicReady = function()
{
    log.debug("DVDGraphic context is ready to display");
    // this._currentContextTemplate.nowPlaying4Ctrl.showBackgroundImage(false);
    this._currentContextTemplate.speedRestrictedVideoCtrl.umpCtrl.setButtonDisabled("menu", true);
    this._currentContextTemplate.speedRestrictedVideoCtrl.umpCtrl.setButtonDisabled("camangle", true);
    this._currentContextTemplate.speedRestrictedVideoCtrl.umpCtrl.setButtonDisabled("subtitles", true);
    this._currentContextTemplate.speedRestrictedVideoCtrl.umpCtrl.setButtonDisabled("lock", true);
    this._currentContextTemplate.speedRestrictedVideoCtrl.umpCtrl.setButtonDisabled("adjustments", true);
    this._populateSpeedRestrictedVideoCtrl(this._currentContextTemplate);
};


dvdApp.prototype._VideoSettingsReadyToDisplay = function()
{
    log.debug("_VideoSettingsReadyToDisplay ready to display");
    if (this._currentContext.params &&
        this._currentContext.params.payload &&
        this._currentContext.params.payload.VideoSettings)
    {
        var settings = this._currentContext.params.payload.VideoSettings;
        this._currentContextTemplate.screenSettings2Ctrl.update(0,settings.brightness);
        this._currentContextTemplate.screenSettings2Ctrl.update(1,settings.contrast);
        this._currentContextTemplate.screenSettings2Ctrl.update(2,settings.tint);
        this._currentContextTemplate.screenSettings2Ctrl.update(3,settings.color);
    }

    // set initial speed restriction value
    var atSpeed = framework.common.getAtSpeedValue();
    this._currentContextTemplate.screenSettings2Ctrl.setAtSpeed(atSpeed);
};

dvdApp.prototype._DVDSettingsCtxtReady = function()
{
    log.debug("DVDSettings context ready to display called");

    if (this._cachedSetAspectRatio != null)
    {
        this._updateDVDSettingsAspectRatio(this._cachedSetAspectRatio);
    }
};

dvdApp.prototype._AspectRatioCtxtReady = function()
{
    log.debug("AspectRatio context ready to display called");

    if (this._cachedSetAspectRatio != null)
    {
        this._updateAspectRatio(this._cachedSetAspectRatio);
    }
};


dvdApp.prototype._ParentalLockRatingReadyToDisplay = function()
{
    log.debug("ParentalLockRating context ready to display called");

    if (this._cachedParentalLockRating != null)
    {
        this._updateParentalRating(this._cachedParentalLockRating);
    }

    // set initial speed restriction value
    var atSpeed = framework.common.getAtSpeedValue();
    this._speedRestrictParentalLockRating(this._currentContextTemplate, atSpeed);
};

dvdApp.prototype._ParentalLockReadyToDisplay = function()
{
    // set default value
    var pinInitialized;

    if (this._hasContextPayload())
    {
        // get pin initialized status and cast it to Boolean
        pinInitialized = Boolean(this._getContextPayload().PinInitialized);
    }
    else
    {
        // context has no payload. Assuming that PIN is initialized.
        pinInitialized = true;
        log.warn('DVD Entered into ParentalLock context with no payload. Assuming pinInitialized = True.');
    }

    // prepare data
    var dataList = {
        vuiSupport : true,
        itemCountKnown : true,
        items : []
    };

    var itemsJapan = [
        { appData : 'SelectParentLockJap', text1Id : 'ParentalLockRating', itemStyle : 'style01', hasCaret : false, disabled : (!pinInitialized) },
        { appData : 'SelectEditPin', text1Id : (pinInitialized) ? 'EditPinCode' : 'InitializePINCode', itemStyle : 'style01', hasCaret: false },
        { appData : 'SelectResetPin', text1Id : 'ResetPinCode', itemStyle : 'style01', hasCaret: false, disabled : (!pinInitialized) },
    ];

    var toggleValue = 2;
    if (this._cachedParentalLockRating != undefined && this._cachedParentalLockRating != null && this._cachedParentalLockRating !== "None")
    {
        toggleValue = 1;
    }

    var items4A = [
        { appData : 'SelectParentLock4A', text1Id : 'ParentalLock', itemStyle : 'styleOnOff', value : toggleValue, hasCaret: false, disabled : (!pinInitialized) },
        { appData : 'SelectEditPin', text1Id : (pinInitialized) ? 'EditPinCode' : 'InitializePINCode', itemStyle : 'style01', hasCaret: false },
        { appData : 'SelectResetPin', text1Id : 'ResetPinCode', itemStyle : 'style01', hasCaret: false, disabled : (!pinInitialized) },
    ];

    // set items
    switch (this._cachedRegion)
    {
        case 'Japan' :
            dataList.items = itemsJapan;
            break;
        case 'A4' :
            dataList.items = items4A;
            break;
        default :
            dataList.items = itemsJapan;
            break;
    }

    // set itemCount
    dataList.itemCount = dataList.items.length;

    // bind data
    this._currentContextTemplate.list2Ctrl.setDataList(dataList);
    this._currentContextTemplate.list2Ctrl.updateItems(0, dataList.itemCount-1);

    // set initial speed restriction value
    var atSpeed = framework.common.getAtSpeedValue();
    this._speedRestrictParentalLock(this._currentContextTemplate, atSpeed);
};

dvdApp.prototype._PinEntryUnlockReady = function()
{
    // set initial speed restriction value
    var atSpeed = framework.common.getAtSpeedValue();
    this._currentContextTemplate.dialPad2Ctrl.setAtSpeed(atSpeed);
};

dvdApp.prototype._PinEntryNewReady = function()
{
    // set initial speed restriction value
    var atSpeed = framework.common.getAtSpeedValue();
    this._currentContextTemplate.dialPad2Ctrl.setAtSpeed(atSpeed);
};

dvdApp.prototype._PinEntryResetReady = function()
{
    // set initial speed restriction value
    var atSpeed = framework.common.getAtSpeedValue();
    this._currentContextTemplate.dialPad2Ctrl.setAtSpeed(atSpeed);
};

/**************************
 * MESSAGE HANDLERS
 **************************/

/**
 * Message Handler (TimedSbn_DiscError)
 * @param {object}
 * @return {void}
 */
dvdApp.prototype._TimedSbn_DiscErrorMsgHandler = function(msg)
{
    var params = {
        sbnStyle : 'Style02',
        text1Id : 'DiscError',
        imagePath1 : 'common/images/icons/IcnSbnEnt.png',
    };
    framework.common.startTimedSbn(this.uiaId, 'TimedSbn_DiscError', 'errorNotification', params);
};

/**
 * Message Handler (TimedSbn_MechanicalError)
 * @param {object}
 * @return {void}
 */
dvdApp.prototype._TimedSbn_MechanicalErrorMsgHandler = function(msg)
{
    var params = {
        sbnStyle : 'Style02',
        text1Id : 'MechanicalError',
        imagePath1 : 'common/images/icons/IcnSbnEnt.png',
    };
    framework.common.startTimedSbn(this.uiaId, 'TimedSbn_MechanicalError', 'errorNotification', params);
};

/**
 * Message Handler (TimedSbn_RegionViolation)
 * @param {object}
 * @return {void}
 */
dvdApp.prototype._TimedSbn_RegionViolationMsgHandler = function(msg)
{
    var params = {
        sbnStyle : 'Style02',
        text1Id : 'DVDRegionViolation',
        imagePath1 : 'common/images/icons/IcnSbnEnt.png',
    };
    framework.common.startTimedSbn(this.uiaId, 'TimedSbn_RegionViolation', 'errorNotification', params);
};

/**
 * Message Handler (TimedSbn_EjectingDisc)
 * @param {object}
 * @return {void}
 */
dvdApp.prototype._TimedSbn_EjectingDiscMsgHandler = function(msg)
{
    var params = {
        sbnStyle : 'Style02',
        text1Id : 'EjectingDisc',
        imagePath1 : 'common/images/icons/IcnSbnEnt.png',
    };
    framework.common.startTimedSbn(this.uiaId, 'TimedSbn_EjectingDisc', 'deviceRemoved', params);
};

/**
 * Message Handler (TimedSbn_DiscInserted)
 * @param {object}
 * @return {void}
 */
dvdApp.prototype._TimedSbn_DiscInsertedHandler = function(msg)
{
    // deprecated
};

/**
 * Message Handler (TimedSbn_DiscInserted)
 * @param {object}
 * @return {void}
 */
dvdApp.prototype._TimedSbn_TrackNumber = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.trackNumber)
    {
	    var sbnText = msg.params.payload.trackNumber;
		var LocChapter = framework.localize.getLocStr(this.uiaId, "Chapter");
		sbnText = LocChapter + " " + sbnText;
        framework.common.startTimedSbn(this.uiaId, "trackInfoSBN", "typeE",{sbnStyle : "Style02",imagePath1 : 'IcnSbnEnt.png', text1Id : "system.DVDItem",text2 :sbnText });
	}
};


/**
 * Message Handler (SetTimeProgress)
 * @param {object}
 * @return {void}
 */
dvdApp.prototype._SetTimeProgressMsgHandler = function(msg)
{
    log.debug("SetTimeProgress received", msg);

    // cache values
    this._cachedNowPlayingConfig.elapsed.hours = parseInt(msg.params.payload.elapsed.hours);
    this._cachedNowPlayingConfig.elapsed.minutes = parseInt(msg.params.payload.elapsed.minutes);
    this._cachedNowPlayingConfig.elapsed.seconds = parseInt(msg.params.payload.elapsed.seconds);
    this._cachedNowPlayingConfig.total.hours = parseInt(msg.params.payload.total.hours);
    this._cachedNowPlayingConfig.total.minutes = parseInt(msg.params.payload.total.minutes);
    this._cachedNowPlayingConfig.total.seconds = parseInt(msg.params.payload.total.seconds);

    // time progress is handled only in VideoNowPlaying context
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "VideoNowPlaying")
    {
        this._updateTimeAndProgress();
    }
};

/**
 * Message Handler (AspectRatio)
 * Aspect ratio status
 * @param {object}
 * @return {void}
 */
dvdApp.prototype._AspectRatioMsgHandler = function(msg)
{
    log.debug("AspectRatio received", msg);

    this._cachedSetAspectRatio = msg.params.payload.value;

    if (this._currentContext && this._currentContextTemplate)
    {
        if (this._currentContext.ctxtId === "AspectRatio")
        {
            this._updateAspectRatio(this._cachedSetAspectRatio);
        }
        else if (this._currentContext.ctxtId === "DVDSettings")
        {
            this._updateDVDSettingsAspectRatio(this._cachedSetAspectRatio);
        }
    }
};

/**
 * Message Handler (Subtitles)
 * Subtitle status message
 * @param {object}
 * @return {void}
 */
dvdApp.prototype._SubtitlesMsgHandler = function(msg)
{
    log.debug("Subtitles received", msg);

    this._cachedNowPlayingConfig.subtitles = msg.params.payload;

    // subtitles are handled only in VideoNowPlaying context
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "VideoNowPlaying")
    {
        this._populatenowPlaying4Ctrl(this._currentContextTemplate);
    }
};

/**
 * Message Handler (Multiangle)
 * Camera angle message
 * @param {object}
 * @return {void}
 */
dvdApp.prototype._MultiangleMsgHandler = function(msg)
{
    log.debug("_MultiangleMsgHandler received", msg);

    this._cachedNowPlayingConfig.camangle = msg.params.payload;

    // multiangle is handled only in VideoNowPlaying context
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "VideoNowPlaying")
    {
        this._populatenowPlaying4Ctrl(this._currentContextTemplate);
    }
};

/**
 * Message Handler (PlayStatus)
 * Play/Pause button status
 * @param {object}
 * @return {void}
 */
dvdApp.prototype._PlayStatusMsgHandler = function(msg)
{
    log.debug("_PlayStatusMsgHandler received", msg);

    this._cachedNowPlayingConfig.playing = msg.params.payload;

    // playstatus is handled in VideoNowPlaying context and TitleScreen context
    if (this._currentContext && this._currentContextTemplate &&
        (this._currentContext.ctxtId === "VideoNowPlaying" || this._currentContext.ctxtId === "TitleScreen"))
    {
        this._populatenowPlaying4Ctrl(this._currentContextTemplate);
    }
    else if (this._currentContext && this._currentContextTemplate &&
        (this._currentContext.ctxtId === "TitleGraphic" || this._currentContext.ctxtId === "DVDGraphic"))
    {
        this._populateSpeedRestrictedVideoCtrl(this._currentContextTemplate);
    }
};

/**
 * Message Handler (RetractUMP)
 * Message for retracting / showing the UMP
 * @param {object}
 * @return {void}
 */
dvdApp.prototype._RetractUMPMsgHandler = function(msg)
{
    // deprecated
};

/**
 * Message Handler (UserInput)
 * Message informing the GUI for a user input
 * @param {object}
 * @return {void}
 */
dvdApp.prototype._UserInputMsgHandler = function(msg)
{
    // deprecated
};

/**
 * Message Handler (Global.AtSpeed / Global.NoSpeed)
 * Message informing the GUI for speed threshold crossing
 * @param {object}
 * @return {void}
 */
dvdApp.prototype._SpeedHandler = function(msg)
{
    log.debug("_SpeedHandler called", msg);
    var atSpeed = framework.common.getAtSpeedValue();

    if (this._currentContext && this._currentContextTemplate)
    {
        switch (this._currentContext.ctxtId)
        {
            case 'DVDGraphic' :
                this._speedRestrictDVDGraphic(this._currentContextTemplate, atSpeed);
                break;
            case 'VideoSettings' :
                this._currentContextTemplate.screenSettings2Ctrl.setAtSpeed(atSpeed);
                break;
            case 'ParentalLock' :
                this._speedRestrictParentalLock(this._currentContextTemplate, atSpeed);
                break;
            case 'ParentalLockRating' :
                this._speedRestrictParentalLockRating(this._currentContextTemplate, atSpeed);
                break;
            case 'PinEntryUnlock' :
            case 'PinEntryNew' :
            case 'PinEntryReset' :
                this._currentContextTemplate.dialPad2Ctrl.setAtSpeed(atSpeed);
                break;

            default :
                // nothing to do
                break;
        }
    }
};

/**
 * Message Handler (VideoSettingsValues)
 * Message carying current video settings values
 * @param {object}
 * @return {void}
 */
dvdApp.prototype._VideoSettingsValuesMsgHandler = function (msg)
{
    var settings = msg.params.payload.values;
    if (this._currentContext &&
        this._currentContextTemplate &&
        this._currentContext.ctxtId == "VideoSettings")
        {
            this._currentContextTemplate.screenSettings2Ctrl.update(0,settings.brightness);
            this._currentContextTemplate.screenSettings2Ctrl.update(1,settings.contrast);
            this._currentContextTemplate.screenSettings2Ctrl.update(2,settings.tint);
            this._currentContextTemplate.screenSettings2Ctrl.update(3,settings.color);
        }
};

/**
 * Message Handler (ClearPINField)
 * Message for clearing the PIN Field
 * @param {object}
 * @return {void}
 */
dvdApp.prototype._ClearPINFieldMsgHandler = function (msg)
{
    log.debug("clear PIN Field msg recieved");
    if (this._currentContext && this._currentContextTemplate)
    {
        if (this._currentContext.ctxtId === "PinEntryUnlock" || this._currentContext.ctxtId === "PinEntryNew" || this._currentContext.ctxtId === "PinEntryReset")
        {
            this._currentContextTemplate.dialPad2Ctrl.setInputValue("");
        }

    }
};

/**
 * Message Handler (ClearPINField)
 * Message for clearing the PIN Field
 * @param {object}
 * @return {void}
 */
dvdApp.prototype._SetParentalLockRatingMsgHandler = function (msg)
{
    log.debug("SetParentalLock msg recieved with payload" + msg);

    this._cachedParentalLockRating = msg.params.payload.ratingIdValue;

    if (this._currentContext && this._currentContextTemplate && (this._currentContext.ctxtId == "ParentalLockRating" || this._currentContext.ctxtId == "ParentalLock"))
    {
        this._updateParentalRating(this._cachedParentalLockRating);
    }

};

/**
 * Message Handler (SetRegion)
 * @param {object}
 * @return {void}
 */
dvdApp.prototype._SetRegionMsgHandler = function (msg)
{
    this._cachedRegion = msg.params.payload.region;
};

/**
 * This function is called by Common whenever a msgType="alert" comes from MMUI.
 * This function should return a properties Object to use for the WinkCtrl.
 * @param {string}
 * @param {object}
 * @return {object}
 */
dvdApp.prototype.getWinkProperties = function(alertId, params)
{
    var winkProperties = null;

    switch (alertId)
    {
        case "PinHasBeenSet_Alert":
            winkProperties = {
                style: "style03",   // default wink style
                text1Id: "PINSet",
            };
            break;

        case "PinIncorrect_Alert":
            winkProperties = {
                style: "style03",   // default wink style
                text1Id: "WrongPIN",
            };
            break;

        default:
            log.debug("Cannot provide properties for unrecognized alertId: " + alertId);
            break;
    }

    // return the properties to Common
    return winkProperties;
};


/**************************
 * CONTROL HANDLERS *
 **************************/

/**************************
 * SCREEN SETTINGS *
 **************************/

/*
 * Callback for sliders within the tabs
 */
dvdApp.prototype._slideHandler = function(ctrlObj, appData, params)
{
    log.debug(" _slideHandler  called...", appData, params);

    switch (appData)
    {
      case "brightnessTab" :
          framework.sendEventToMmui(this.uiaId, "SetBrightnessValue", {"payload": {"brightnessValue": params.value, "final": params.finalAdjustment}});
          break;
      case "contrastTab" :
          framework.sendEventToMmui(this.uiaId, "SetContrastValue", {"payload": {"contrastValue": params.value, "final": params.finalAdjustment}});
          break;
      case "tintTab" :
          framework.sendEventToMmui(this.uiaId, "SetTintValue", {"payload": {"tintValue": params.value, "final": params.finalAdjustment}});
          break;
      case "colorTab" :
          framework.sendEventToMmui(this.uiaId, "SetColorValue", {"payload": {"colorValue": params.value, "final": params.finalAdjustment}});
          break;
    }

};


dvdApp.prototype._adjustBtnHandler = function(ctrlObj, appData, params)
{
    log.debug("_adjustBtnHandler called: " + appData, params);

    framework.sendEventToMmui(this.uiaId, "SelectClose");
};

dvdApp.prototype._selectHandler = function(ctrlObj, appData, params)
{
    log.debug("_selectHandler called: " + appData, params);

    framework.sendEventToMmui(this.uiaId, appData);
};


/**************************
 * DIALOG *
 **************************/

dvdApp.prototype._dialogDefaultSelectCallback = function(dialogBtnCtrlObj, appData, params)
{
    log.debug("_dialogDefaultSelectCallback  called...", dialogBtnCtrlObj.properties.label, appData);

    switch (appData)
    {
        case 'ok':
        case 'yes':
            framework.sendEventToMmui("common", "Global.Yes");
            break;
        case 'no':
            framework.sendEventToMmui("common", "Global.No");
            break;
    }
};


/**************************
 * LIST *
 **************************/

dvdApp.prototype._listItemClickCallback = function(listCtrlObj, appData, params)
{
    log.debug("_listItemClickCallback called for context " + this._currentContext.ctxtId);

    switch (appData)
    {
        case "SelectSettings":
            framework.sendEventToMmui("common", "Global.IntentSettingsTab", { payload : { settingsTab : "Sound"} }, params.fromVui );
            break;

        case "SelectAspectRatioItem":
            framework.sendEventToMmui(this.uiaId, "SelectAspectRatioItem", { payload : { aspectID : this._aspectRatioConfig[params.itemIndex] } }, params.fromVui);
            break;

        case "SelectParentLockJap":
            framework.sendEventToMmui(this.uiaId, "SelectParentLockRating", null, params.fromVui);
            break;

        case "SelectParentLock4A":
            if (params.additionalData == 1)
            {
                framework.sendEventToMmui(this.uiaId, "SelectParentLockOn", {payload: {}}, params.fromVui);
            }
            else if (params.additionalData == 2)
            {
                framework.sendEventToMmui(this.uiaId, "SelectParentLockOff", {payload: {}}, params.fromVui);
            }
            break;

        case "SelectParentLockRating":
            var tempIndex = null;
            switch (params.itemIndex)
            {
                case 0 :
                    tempIndex = "None";
                    break;
                case 1 :
                    tempIndex = "G";
                    break;
                case 2 :
                    tempIndex = "PG12";
                    break;
                case 3 :
                    tempIndex = "R15";
                    break;
            }
            if (this._currentContext.ctxtId == "ParentalLockRating")
            {
                framework.sendEventToMmui(this.uiaId, "SelectParentLockRatingMax", { payload : { ratingid : tempIndex} }, params.fromVui);
            }
            else
            {
                framework.sendEventToMmui(this.uiaId, "SelectParentLockRatingMax", null, params.fromVui);
            }
            break;

        default:
            framework.sendEventToMmui(this.uiaId, appData, null, params.fromVui);
            break;
    }
};


/**************************
 * DIALPAD *
 **************************/

dvdApp.prototype._dialPadHandler = function (ctrlObj, appData, params)
{
    log.debug("Dialpad btn selected. appData is: " + appData + "  params.input: " + params.input + " params.btnSelected: " + params.btnSelected);
    var tempInput = null;
    switch (params.btnSelected)
    {
        case "OK":
            framework.sendEventToMmui("common", "Global.Yes");
            break;
        case "Cancel":
            framework.sendEventToMmui("common", "Global.Cancel");
            break;
        case "Tone" :
            tempInput = this._currentContextTemplate.dialPad2Ctrl.getInputValue();
            tempInput = tempInput + params.input;
            framework.sendEventToMmui(this.uiaId, "GUIUpdatePinInField",{payload:{UserPin: tempInput}});
            break;
        case "Clear" :
            tempInput = this._currentContextTemplate.dialPad2Ctrl.getInputValue();
            framework.sendEventToMmui(this.uiaId, "GUIUpdatePinInField",{payload:{UserPin: tempInput}});
            break;

    }
};


/**************************
 * TABS *
 **************************/


/**************************
 * UMP *
 **************************/

dvdApp.prototype._umpFocusCallback = function(umpCtrlObj, appData, additionalData)
{
    // no behavior yet
};

dvdApp.prototype._umpBtnSelectCallback = function(umpCtrlObj, appData, additionalData)
{

    switch (appData)
    {
        case "playpause":

            framework.sendEventToMmui(this.uiaId, "SelectPlayPause", {payload:{PlayingState: (umpCtrlObj._buttonArray[3].currentState == "Pause") ? "Play" : "Pause"}});
            break;

        case "ToggleSubtitles":
            if (additionalData.state == "Sel")
            {
                framework.sendEventToMmui(this.uiaId, "SelectSubtitleOn");
            }
            else if (additionalData.state == "Unsel")
            {
                framework.sendEventToMmui(this.uiaId, "SelectSubtitleOff");
            }
            break;

        case "SelectCameraAngle":
            framework.sendEventToMmui(this.uiaId, "SelectCameraAngle");
            break;

        case "Global.Previous":
            framework.sendEventToMmui("common", "Global.Previous");
            break;

        case "Global.Next":
            framework.sendEventToMmui("common", "Global.Next");
            break;

        default:
            framework.sendEventToMmui(this.uiaId, appData);
            break;
    }
};

dvdApp.prototype._umpBtnHoldStartCallback = function(umpCtrlObj, appData, additionalData)
{
    switch (appData)
    {
        case "Global.Previous":
            framework.sendEventToMmui("common", "Global.PreviousHoldStart");
            break;
        case "Global.Next":
            framework.sendEventToMmui("common", "Global.NextHoldStart");
            break;
    }
};

dvdApp.prototype._umpBtnHoldStopCallback = function(umpCtrlObj, appData, additionalData)
{
    switch (appData)
    {
        case "Global.Previous":
            framework.sendEventToMmui("common", "Global.PreviousHoldStop");
            break;
        case "Global.Next":
            framework.sendEventToMmui("common", "Global.NextHoldStop");
            break;
    }
};

dvdApp.prototype._umpSlideCallback = function(umpCtrlObj, appData, params)
{
    // clear any redundant timeouts
    clearTimeout(this._finalAdjustmentTimeout);
    clearTimeout(this._setTimeProgressTimeout);
    this._finalAdjustmentTimeout = null;
    this._setTimeProgressTimeout = null;

    if (params.finalAdjustment !== true)
    {
        // set new jump to position timeout
        this._finalAdjustmentTimeout = setTimeout(this._jumpToPosition.bind(this), this._scrubberConfig.settleTime);
    }

    // constrain params value
    params.value = Math.min(Math.max(params.value, 0), 1);

    // save slideProgressValue
    this._slideProgressValue = params.value;

    this._stopElapsedUpdate = false;

    if (appData == "scrubber" && params.finalAdjustment == true)
    {
        this._stopElapsedUpdate = false;
    }

    // convert total and elapsed to seconds
    var totalSeconds = (this._cachedNowPlayingConfig.total.hours * 3600) + (this._cachedNowPlayingConfig.total.minutes * 60) + this._cachedNowPlayingConfig.total.seconds;
    var elapsedSeconds = (this._cachedNowPlayingConfig.elapsed.hours * 3600) + (this._cachedNowPlayingConfig.elapsed.minutes * 60) + this._cachedNowPlayingConfig.elapsed.seconds;

    if (params.finalAdjustment == true && (((Math.abs(elapsedSeconds - totalSeconds)) * params.value) > 2))
    {
        // this is the final adjustment ->send this event

        // get percent
        var percent = Math.round(params.value * 100);

        // update cached values
        if (this._slideProgressValue != null && this._slideProgressValue != undefined)
        {
            this._cachedNowPlayingConfig.elapsed = this._secondsToHHMMSS(totalSeconds * this._slideProgressValue);
        }

        // send event
        framework.sendEventToMmui(this.uiaId, "SelectScrubber", {payload:{timePercent: percent}});

        // prevent any updates for the next 2 seconds
        this._stopElapsedUpdate = true;

        // set time and progress timeout
        this._setTimeProgressTimeout = setTimeout(this._updateTimeAndProgressHandler.bind(this), this._scrubberConfig.settleTime);
    }
    else if (params.finalAdjustment == false)
    {
        // do not send this event so not to flood the communication channel
        this._stopElapsedUpdate = true;

        // update cached values
        if (this._slideProgressValue != null && this._slideProgressValue != undefined)
        {
            this._cachedNowPlayingConfig.elapsed = this._secondsToHHMMSS(totalSeconds * this._slideProgressValue);
        }
    }

    // update elapsed and total time
    var currentUmp = (this._currentContextTemplate && this._currentContextTemplate.nowPlaying4Ctrl && this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl) ?  this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl : null;
    if (currentUmp)
    {
        currentUmp.setTotalTime(this._parseTime(this._cachedNowPlayingConfig.total));
        currentUmp.setElapsedTime(this._parseTime(this._cachedNowPlayingConfig.elapsed));
    }

};

dvdApp.prototype._jumpToPosition = function ()
{
    this._stopElapsedUpdate = true;
    var totalSeconds = (this._cachedNowPlayingConfig.total.hours * 3600) + (this._cachedNowPlayingConfig.total.minutes * 60) + this._cachedNowPlayingConfig.total.seconds;
    this._cachedNowPlayingConfig.elapsed = this._secondsToHHMMSS(totalSeconds * this._slideProgressValue);

    var percent = this._getProgress(this._cachedNowPlayingConfig.elapsed, this._cachedNowPlayingConfig.total);
    percent = Math.round(percent * 100);
    framework.sendEventToMmui(this.uiaId, "SelectScrubber", {payload:{timePercent: percent}});

    log.debug("jump to position called with params " + percent);
};

dvdApp.prototype._updateTimeAndProgressHandler = function()
{
    this._stopElapsedUpdate = false;
};

/**************************
 * HELPERS *
 **************************/

dvdApp.prototype._populatenowPlaying4Ctrl= function(tmplt)
{
    log.debug("_populatenowPlaying4Ctrl called");

    var currUmpCtrl = tmplt.nowPlaying4Ctrl.umpCtrl;

    // Set the Play/Pause button state
    if (currUmpCtrl.properties.buttonConfig["playpause"])
    {
        if (this._cachedNowPlayingConfig.playing.status == 0)
        {
            if (currUmpCtrl.properties.buttonConfig["playpause"].currentState != "Play")
            {
                currUmpCtrl.setButtonState("playpause","Play");
            }
        }
        else if (this._cachedNowPlayingConfig.playing.status == 1)
        {
            if (currUmpCtrl.properties.buttonConfig["playpause"].currentState != "Pause")
            {
                currUmpCtrl.setButtonState("playpause","Pause");
            }
        }
    }

    // Set the camera angle button availability
    if (currUmpCtrl.properties.buttonConfig["camangle"])
    {
        currUmpCtrl.setButtonDisabled("camangle" , (this._cachedNowPlayingConfig.camangle.available ) ? false: true);
    }

    // Set the subtitles button state
    if (currUmpCtrl.properties.buttonConfig["subtitles"])
    {
        if (this._cachedNowPlayingConfig.subtitles.status == 0 && currUmpCtrl.properties.buttonConfig["subtitles"].currentState != "Unsel" )
        {
            currUmpCtrl.setButtonState("subtitles", "Unsel");
        }
        else if (this._cachedNowPlayingConfig.subtitles.status == 1 && currUmpCtrl.properties.buttonConfig["subtitles"].currentState != "Sel")
        {
            currUmpCtrl.setButtonState("subtitles", "Sel");
        }

        currUmpCtrl.setButtonDisabled("subtitles", (this._cachedNowPlayingConfig.subtitles.available) ? false: true);
    }

};

dvdApp.prototype._populateSpeedRestrictedVideoCtrl = function (tmplt)
{
    var currUmpCtrl = tmplt.speedRestrictedVideoCtrl.umpCtrl;

    // Set the Play/Pause button state
    if (currUmpCtrl.properties.buttonConfig["playpause"])
    {
        if (this._cachedNowPlayingConfig.playing.status == 0)
        {
            if (currUmpCtrl.properties.buttonConfig["playpause"].currentState != "Play")
            {
                currUmpCtrl.setButtonState("playpause","Play");
            }
        }
        else if (this._cachedNowPlayingConfig.playing.status == 1)
        {
            if (currUmpCtrl.properties.buttonConfig["playpause"].currentState != "Pause")
            {
                currUmpCtrl.setButtonState("playpause","Pause");
            }
        }
    }
};

dvdApp.prototype._updateDVDSettingsAspectRatio = function(aspectRatio)
{
    var currList = this._currentContextTemplate.list2Ctrl;

    switch (aspectRatio)
    {
        case "Wide":
            this._DVDSettingsCtxtDataList.items[1].label1Id = "Widescreen";
            currList.dataList.items[1].label1Id = "Widescreen";
            break;
        case "FullLetterbox":
            this._DVDSettingsCtxtDataList.items[1].label1Id = "Letterbox";
            currList.dataList.items[1].label1Id = "Letterbox";
            break;
        case "FullPanScan":
            this._DVDSettingsCtxtDataList.items[1].label1Id = "Panscan";
            currList.dataList.items[1].label1Id = "Panscan";
            break;
        default:
            this._DVDSettingsCtxtDataList.items[1].label1Id = "";
            currList.dataList.items[1].label1Id = "";
            log.warn('Unknown aspect ratio received: ' + aspectRatio);
            break;
    }

    currList.updateItems(1,1);
};

dvdApp.prototype._updateAspectRatio = function(aspectRatio)
{
    var currList = this._currentContextTemplate.list2Ctrl;

    switch (aspectRatio)
    {
        case "Wide":
            currList.setTick(0, true);
            break;

        case "FullLetterbox":
            currList.setTick(1, true);
            break;

        case "FullPanScan":
            currList.setTick(2, true);
            break;

        default:
            log.warn('Unknown aspect ratio received: ' + aspectRatio);
            break;
    }
};

dvdApp.prototype._updateParentalRating = function (rating)
{
    var currList = this._currentContextTemplate.list2Ctrl;

    if (this._cachedRegion == "A4")
    {
        if (rating == "None")
        {
            currList.setToggleValue(0,2);
        }
        else
        {
            currList.setToggleValue(0,1);
        }
        return;
    }
    else
    {
        switch (rating)
        {
            case "None":
                currList.setTick(0, true);
                break;

            case "G":
                currList.setTick(1, true);
                break;

            case "PG12":
                currList.setTick(2, true);
                break;

            case "R15":
                currList.setTick(3, true);
                break;

            default:
                log.warn('Unknown parental rating  received: ' + rating);
                break;
        }
    }

};

dvdApp.prototype._speedRestrictDVDGraphic = function(tmplt, atSpeed)
{
    log.debug("_speedRestrictDVDGraphic called, atSpeed = " + atSpeed);

    // do not enable DVD buttons. They will be anbled in VideoNowPlaying
    if (!atSpeed)
    {
        return;
    }

    tmplt.speedRestrictedVideoCtrl.umpCtrl.setButtonDisabled("menu", atSpeed);
    tmplt.speedRestrictedVideoCtrl.umpCtrl.setButtonDisabled("camangle", atSpeed);
    tmplt.speedRestrictedVideoCtrl.umpCtrl.setButtonDisabled("subtitles", atSpeed);
    tmplt.speedRestrictedVideoCtrl.umpCtrl.setButtonDisabled("lock", atSpeed);
    tmplt.speedRestrictedVideoCtrl.umpCtrl.setButtonDisabled("adjustments", atSpeed);
};

/**
 * Restrict some items in the ParentalLock context
 * @param {object} - current template
 * @param {boolean} - speed value
 * @return {void}
 */
dvdApp.prototype._speedRestrictParentalLock = function(tmplt, atSpeed)
{
    log.debug("_speedRestrictParentalLock called, atSpeed = " + atSpeed);

    // get current list
    var currList = tmplt.list2Ctrl;

    if (atSpeed)
    {
        // disable all items
        for (var i=0; i<currList.dataList.itemCount; i++)
        {
            currList.dataList.items[i].disabled = atSpeed;
        }
        currList.updateItems(0, currList.dataList.itemCount-1);
    }
    else
    {
        // set default value
        var pinInitialized;

        if (this._hasContextPayload())
        {
            // get pin initialized status and cast it to Boolean
            pinInitialized = Boolean(this._getContextPayload().PinInitialized);
        }
        else
        {
            // context has no payload. Assuming that PIN is initialized.
            pinInitialized = true;
        }

        // enable selected items
        for (var i=0; i<currList.dataList.itemCount; i++)
        {
            // SelectEditPin is governed by the speed
            if ("SelectEditPin" === currList.dataList.items[i].appData)
            {
                currList.dataList.items[i].disabled = atSpeed;
            }
            // everything else is governed by the pin init status
            else
            {
                currList.dataList.items[i].disabled = (!pinInitialized);
            }
        }

        // apply modifications
        currList.updateItems(0, currList.dataList.itemCount-1);
    }

};

/**
 * Restrict some items in the ParentalLockRating context
 * @param {object} - current template
 * @param {boolean} - speed value
 * @return {void}
 */
dvdApp.prototype._speedRestrictParentalLockRating = function(tmplt, atSpeed)
{
    log.debug("_speedRestrictParentalLockRating called, atSpeed = " + atSpeed);

    // disable all items
    var currList = tmplt.list2Ctrl;
    for (var i=0; i<currList.dataList.itemCount; i++)
    {
        currList.dataList.items[i].disabled = atSpeed;
    }
    currList.updateItems(0, currList.dataList.itemCount-1);
};

/* =========================
 * UMP AUTO HIDE
 * =========================
 */

dvdApp.prototype._hideUMPControl = function(isHidden, inContext)
{
    // check whether this executes in the calling context
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId && this._currentContext.ctxtId == inContext)
    {
        this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setRetracted(isHidden);
    }
};

dvdApp.prototype._hideTopMenuButton = function(isHidden, inContext)
{
    // check whether this executes in the calling context
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId && this._currentContext.ctxtId == inContext)
    {
        this._currentContextTemplate.dvdMenuCtrl.divElt.hidden = isHidden;
    }
};

/**************************
 * UTILITIES *
 **************************/

/**
 * Parse elapsed/total time objects to displayable string
 * @param {object}
 * @return {string}
 */
dvdApp.prototype._parseTime = function (time)
{
    // validate input
    if (!time.hasOwnProperty('hours') || !time.hasOwnProperty('minutes') || !time.hasOwnProperty('seconds'))
    {
        return "00:00:00";
    }

    // break shallow copy
    var hours = time.hours;
    var minutes = time.minutes;
    var seconds = time.seconds;

    // define hours, minutes and seconds components
    if (!hours) hours = 0;
    if (!minutes) minutes = 0;
    if (!seconds) seconds = 0;

    // stringify
    hours = hours.toString();
    minutes = minutes.toString();
    seconds = seconds.toString();

    // add additional zeroes
    if (hours.length == 1)
    {
        hours = "0" + hours;
    }
    if (minutes.length == 1)
    {
        minutes = "0" + minutes;
    }
    if (seconds.length == 1)
    {
        seconds = "0" + seconds;
    }

    // build formatted time
    var formattedTime = hours + ":" + minutes + ":" + seconds;

    // return formatted time
    return formattedTime;
};

/**
 * Get progress (in percent) from elapsed/total time objects
 * @param {object}
 * @param {object}
 * @return {number}
 */
dvdApp.prototype._getProgress = function(elapsed, total)
{
    // validate elapsed input
    if (!elapsed.hasOwnProperty('hours') || !elapsed.hasOwnProperty('minutes') || !elapsed.hasOwnProperty('seconds'))
    {
        return 0;
    }

    // validate total input
    if (!total.hasOwnProperty('hours') || !total.hasOwnProperty('minutes') || !total.hasOwnProperty('seconds'))
    {
        return 0;
    }

    // calculate progress
    var elapsedSeconds = (elapsed.hours * 3600) + (elapsed.minutes * 60) + elapsed.seconds;
    var totalSeconds = (total.hours * 3600) + (total.minutes * 60) + total.seconds;
    var progress = elapsedSeconds / totalSeconds;

    return progress;
};

dvdApp.prototype._updateTimeAndProgress = function()
{
    // validate context
    if (!this._currentContext || !this._currentContextTemplate || this._currentContext.ctxtId !== "VideoNowPlaying")
    {
        // we are not in the right context or we don't have a template -> exit
        return;
    }

    if (this._stopElapsedUpdate !== true)
    {
        // set total time
        this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setTotalTime(this._parseTime(this._cachedNowPlayingConfig.total));

        // set elapsed time
        this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setElapsedTime(this._parseTime(this._cachedNowPlayingConfig.elapsed));

        // set progress
        this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.updateScrubber(this._getProgress(this._cachedNowPlayingConfig.elapsed, this._cachedNowPlayingConfig.total));
    }
};

dvdApp.prototype._secondsToHHMMSS = function (seconds)
{
    var hr = Math.floor(seconds / 3600);
    var min = Math.floor(seconds /60);
    var sec = Math.floor(seconds - (min * 60));

    if (hr != 0)
    {
        min = min - (60 * hr);
    }

    var time = {hours : hr, minutes : min, seconds : sec};

    return time;
};

dvdApp.prototype._hasContextPayload = function()
{
    return (this._currentContext.params && this._currentContext.params.payload);
};

dvdApp.prototype._getContextPayload = function()
{
    return this._currentContext.params.payload;
};


//Tell framework this .js file has finished loading, it has no controls to load, and it has no dictionaries
framework.registerAppLoaded("dvd", null, true);
