/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: pandoraApp.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: avorotp
 Date: 29-June-2012
 __________________________________________________________________________

 Description: IHU GUI Pandora App

 Revisions:
 v0.1 (29-June-2012)
 v0.2 (28-August-2012) Swithced to Common for Global events
 v0.3 (3-September-2012) Swithced to updated controls
 v0.4 (4-September-2012) Updating according the latest spreadsheets and wireframes
 v0.5 (11-September-2012) Updated to use latest UMP configuration -avorotp
 v0.6 (27-September-2012) New message handler added _TrackAlbumArtHandler -apopoval
 v0.7 (16-October-2012) ctrlTitle > ctrlTitleId
 v0.8 (17-October-2012) thumbs up/down icon changes to match the updated ump control
 v0.9 (17-October-2012) nowPlaying ctrlTitle workaround
 v0.10 (29-October-2012) event AudioSettings is now GoAudioSetting, event GoSysEntertainment used to send "this.uiaId", now sends this.uiaId
 v0.11 (7-November-2012) buffering in now playing context, StationList context update
 v0.12 (19-November-2012) dictionary typo fix. Converted log.infos to log.debug. Show status bar name
 v0.13 (4-December-2012) transition to the new UMP style.
 v0.14 (20-December-2012) transition to the new UMP style.
 v0.15 (22-Jan-2013) Transition to List2Ctrl.
 v0.16 (22-Jan-2013) Transition to UI Specs v3.57
 v0.16 (30-Jan-2013) Transition to NowPlaying3
 v0.17 (31-Jan-2013) Added SBN msgs
 v1.00 (01-Feb-2013) Stabilzed UI Specs v3.57
 v1.01 (08-Feb-2013) Fixed issue with disappearing station name, added ActiveStation msg
 v1.02 (11-Feb-2013) Show "Buffering" while loading the station list
 v1.03 (15-Feb-2013) Added "type" to TrackInfo
 v1.04 (18-Feb-2013) Fixed caching of album art
 v1.05 (22-Feb-2013) Added handling for empty context payload on NowPlaying
 v1.06 (04-Mar-2013) Removed Quickmix station
 v1.07 (05-Mar-2013) Added disabling buttons on buffering
 v1.08 (14-Mar-2013) No longer disabling StationList button on Advertisement
 v1.09 (20-Mar-2013) Added "Cancel" button in Loading context, Removed bookmark payload
 v1.10 (25-Mar-2013) Added "numberedList" List2Ctrl property to StationList (SW00110109)
 v1.11 (10-Apr-2013) Fixed station list caching issue (SW00114021)
 v1.12 (22-Apr-2013) Updated tool tips (SW00116074)
 v1.13 (22-Apr-2013) Updated to NowPlaying3aTmplt (SW00116074)
 v1.14 (24-Apr-2013) Added elapsed time (SW00116525)
 v1.15 (25-Apr-2013) Added BluetoothAudioLost error condition
 v1.16 (26-Apr-2013) Fixed "undefined"  title labels in errorCondition ctxt (SW00116681)
 v1.17 (21-May-2013) Migrated to NowPlaying4Ctrl and added respective metadata icons (SW00118833)
 v1.18 (21-May-2013) VUI Configuration (SW00118874)
 v1.19 (30-May-2013) 3.9.0 dictionaries (SW00119369) and empty artwork handling (SW00119904)
 v1.20 (04-Jun-2013) Fixed common string IDs (SW00120271)
 v1.21 (06-Jun-2013) Removed framework.localize.loadAppDict("pandora") (SW00120372)
 v1.22 (06-Jun-2013) Rating buttons are disabled during ads (SW00118996)
 v1.23 (06-Jun-2013) On rating only the selected button is greyed-out (SW00119796)
 v1.24 (15-Jun-2013) Implemented new callback strategy when Radio, Checkbox, or Tick items (SW00120649)
 v1.25 (15-Jun-2013) Disabling rating buttons on shared stations (SW00121657)
 v2.00 (18-Jun-2013) Implemented buffering strategy (SW00111821)
 v2.01 (20-Jun-2013) Changed Settings icon (SW00122077)
 v2.02 (25-Jun-2013) Added totalTime to scrubber (SW00122509)
 v2.03 (26-Jun-2013) Added missing thumbsUp/Down tooltips
 v2.04 (27-Jun-2013) NowPlaying title is updated through ActiveStation only
 v2.05 (03-Jul-2013) Added bookmark button highlight support (SW00113809)
 v2.06 (04-Jul-2013) Added bookmarked song/artist highlight support (SW00123889)
 v2.07 (04-Jul-2013) Added currently streaming station indication in StationList (SW00119460)
 v2.08 (04-Jul-2013) Fixed bug causing rate buttons to stay disabled (SW00123838)
 v2.09 (09-Jul-2013) Migrated to Dialog3, updated logo in Loading context (SW00123994)
 v3.00 (10-Jul-2013) Shuffle icon displayed in StationList (SW00119490)
 v3.01 (18-Jul-2013) Added NoCurrentStation context and TimedSbn_StationDeleted msg handler (SW00125338)
 v3.02 (23-Jul-2013) Fixed playpause flickering (SW00125701)
 v3.03 (24-Jul-2013) Added permanent active station indication (SW00125003)
 v3.04 (26-Jul-2013) Fixed skip track rating issue (SW00120369)
 v3.05 (30-Jul-2013) Added handling for "NotSupportedVersion" in ErrorCondition (SW00126723)
 v3.06 (30-Jul-2013) Added shared station icon in StationList (SW00119481)
 v3.07 (30-Jul-2013) Clearing artwork image on skip track (SW00126448)
 v3.08 (03-Aug-2013) Added workaround for multistate UMP buttons (SW00126679)
 v3.09 (19-Aug-2013) Udated Now Playing icon (SW00128136)
 v3.10 (20-Aug-2013) Dictionaries updated (ES, JP, US) (SW00128899)
 v3.11 (21-Aug-2013) Added 'Licensing restrictions' and 'Insufficient Connectivity' errors SBNs (SW00129115)
 V3.12 (22-Aug-2013) Fixed bug causing prev. track elapsed time to be shown while buffering new track
 v3.13 (27-Aug-2013) Updated US, CN, FR, IT dictionaries (SW00130321)
 v3.14 (28-Aug-2013) Updated SA, DK, GR dictionaries (SW00130466)
 v3.15 (29-Aug-2013) Fixed station list caching issue connected with sorting on CMU and MD (SW00129887)
 v3.16 (02-Sep-2013) Fixed race condition caused by multiple clicking on the play/pause button (SW00129207)
 v3.17 (09-Sep-2013) Dictionaries updated (SW00131466)
 v3.18 (11-Sep-2013) Dictionaries updated for BG, GR, AU, HU, RO, SK, RS, DE languages (SW00131772)
 v3.19 (13-Sep-2013) Dictionaries updated (SW00132037)
 v3.20 (17-Sep-2013) Dictionaries updated (SW00132324)
 v3.21 (20-Sep-2013) Pandora should display loading while in recoverable error state (SW00132906)
 v3.22 (25-Sep-2013) Thumbs up / down buttons should be grayed out, while Pandora is in buffering state. (SW00133382)
 v3.23 (03-Oct-2013) Pandora Checkboxes changed to ticks (SW00132636)
 v3.24 (03-Oct-2013) VUI line number selection now works in SortBy and Bookmark contexts (SW00133995)
 v3.25 (07-Oct-2013) Pandora now shows "Loading", while in buffering state, and during song changes(SW00134283)
 v3.26 (16-Oct-2013) Bookmark icon no longer disappears when clicked. (SW00134909)
 v3.27 (25-Oct-2013) Pandora now has focus on the first list when station list is selected (SW00135987)
 v4.00 (09-Dec-2013) Pandora bookmark context updates properly on song change (SW00138956)
 v4.01 (02-Jan-2014) Fixed bug causing progress bar flickering between song changes (SW00139466)
 v4.02 (18-Feb-2014) Implemented improvement for station list loading time (SW00141446)
 v4.03 (11-Jun-2014) J03G: GUI Assets: Asset changes for gui Pandora - IHU (Temporary : Green Color) (SW00149888)
 v4.04 (09-Jul-2014) Pause button grayed out during an advertisement (SW00151581)
 v4.05 (07-Nov-2014) Disable ump buttons while Ad is on.(SW00155348), Sort button text missing in Station list after user normally scrolls down and then back up(SW00155327),  Progress bar is not updated correctly for duration 0(SW00155347)
 v4.05 (10-Dec-2014) MY15 [FQIR-2569] Display shows song title with display off setting (SW00154419)
______________________________________________________________________________

 */

log.addSrcFile("pandoraApp.js", "pandora");

/**********************************************
 * Start of Base App Implementation
 *
 * Code in this section should not be modified
 * except for function names based on the appname
 *********************************************/

function pandoraApp(uiaId)
{

    log.debug("Pandora constructor called...");

    // Base application functionality is provided in a common location via this call to baseApp.init().
    // See framework/js/BaseApp.js for details.
    baseApp.init(this, uiaId);
}

/**************************
 * Standard App Functions *
 **************************/

/*
 * Called just after the app is instantiated by framework.
 */
pandoraApp.prototype.appInit = function()
{
    log.debug("pandoraApp appInit called...");


    if (framework.debugMode)
    {
        utility.loadScript("apps/pandora/test/pandoraAppTest.js");
    }

    // cache
    this._cachedStationList = null;
    this._cachedTrackInfo = null;
    this._cachedError = null;
    this._cachedTrackRating = null;
    this._cachedNowPlaying = null;
    this._cachedAlbumArt = null;
    this._cacheElapsedTime = null;
    this._cacheRecoverableErrorState = false;
    this._cachedStartIndex = 0;
    this._cachedArrayCount = 0;
    this._cachedTotalCount = 0;
    this._cachedEmpty = false;
    this._cachedSortBy = null;

    // last selected station
    this._lastActiveStation = -1;
    this._cachedActiveStationName = null;
    this._cachedActiveStationId = null;
    this._cachedActiveStationType = null;

    // bookmark
    this._cachedSongName = null;
    this._cachedArtistName = null;
    this._cachedBookmarked = null;
    this._cachedBookmarkStatus = null;
    // player state
    this._playerState = 'idle';
    this._dataList = [];
    this._items = [];
    this._stationsCount = 20;

    /*
     * ===================
     * UMP CONFIG
     * ===================
     */

    //@formatter:off
    var scrubberConfig = {
        "scrubberStyle": "Style01",
        "mode" : "progress",
        "hasActiveState" : false,
        "value" : 0,
        "min" : 0.0,
        "max" : 1.0,
        "increment" : 0.01,
        "currentValue" : 0,
        "minChangeInterval" : 250,
        "settleTime" : 1000,
        "slideCallback": this._umpSlideCallback.bind(this),
        "appData" : "scrubber",
        "elapsedTime" : "00:00",
        "totalTime" : "00:00",
        "disabled" : true,
        "buffering" : false
    };


    var umpButtonConfig = new Object();
    umpButtonConfig["source"] =
    {
        index : 0,
        buttonBehavior : "shortPressOnly",
        disabled : false,
        imageBase : "IcnUmpEntMenu",
        appData : "source",
        selectCallback: this._umpSelectCallback.bind(this)
    };

    umpButtonConfig["stationlist"] =
    {
        index : 1,
        buttonBehavior : "shortPressOnly",
        disabled : false,
        imageBase : "IcnUmpCurrentList",
        appData : "stationlist",
        selectCallback: this._umpSelectCallback.bind(this)
    };

    umpButtonConfig["thumbsdown"] =
    {
        index : 2,
        buttonBehavior : "shortPressOnly",
        disabled : false,
        imageBase : "IcnUmpThumbsDown",
        currentState:"UnSel",
        stateArray: [
            { state:"UnSel", labelId: "common.Tooltip_IcnUmpThumbsDown_Sel" },
            { state:"Sel",   labelId: "common.Tooltip_IcnUmpThumbsDown_Sel" },
        ],
        appData : "thumbsdown",
        selectCallback: this._umpSelectCallback.bind(this)
    };

    umpButtonConfig["thumbsup"] =
    {
        index : 3,
        buttonBehavior : "shortPressOnly",
        disabled : false,
        imageBase : "IcnUmpThumbsUp",
        currentState:"UnSel",
        stateArray: [
            { state:"UnSel", labelId: "common.Tooltip_IcnUmpThumbsUp_Sel" },
            { state:"Sel"  , labelId: "common.Tooltip_IcnUmpThumbsUp_Sel" },
        ],
        appData : "thumbsup",
        selectCallback: this._umpSelectCallback.bind(this)
    };

    umpButtonConfig["bookmark"] =
    {
        index : 4,
        buttonBehavior : "shortPressOnly",
        disabled : false,
        imageBase : "IcnUmpBookmark_Sel",
        labelId: "common.Tooltip_IcnUmpBookmark",
        appData : "bookmark",
        selectCallback: this._umpSelectCallback.bind(this)
    };

    umpButtonConfig["playpause"] =
    {
        index : 5,
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
        selectCallback: this._umpSelectCallback.bind(this)
    };

    umpButtonConfig["skip"] =
    {
        index : 6,
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpNextAudio",
        disabled : false,
        appData : "skip",
        selectCallback: this._umpSelectCallback.bind(this),
    };

    umpButtonConfig["settings"] =
    {
        index : 7,
        buttonBehavior : "shortPressOnly",
        disabled : false,
        imageBase : "IcnUmpEqualizer",
        appData : "settings",
        selectCallback: this._umpSelectCallback.bind(this)
    };
    //@formatter:on

    var bookmarkCtxtDataList = {
        itemCountKnown : true,
        itemCount : 2,
        items: [
            { appData : 'song',   text1Id : 'BookmarkSong',   selected : false, disabled : false, hasCaret: false, itemStyle : 'style01'},
            { appData : 'artist', text1Id : 'BookmarkArtist', selected : false, disabled : false, hasCaret: false, itemStyle : 'style01'}
        ],
        vuiSupport : true,
    };

    var sortByCtxtDataList = {
        itemCountKnown : true,
        itemCount : 2,
        items: [
            { appData : 'Date', text1Id : 'Date', hasCaret : false, itemStyle : 'style03', image1: 'tick'},
            { appData : 'Alphabetically', text1Id : 'AZ', hasCaret : false, itemStyle : 'style03', image1: 'tick'},
        ],
        vuiSupport : true,
    };

    this.StationListCtxtDataList = {
        itemCountKnown : true,
        itemCount : 0,
        items: []
    };

    //@formatter:off
    this._contextTable = {

        "Loading" : {
            template : "Dialog3Tmplt",
            sbNameId : "sbNameId",
            controlProperties: {
                Dialog3Ctrl : {
                    "contentStyle" : "style09",
                    "fullScreen" : false,
                    "splashStyle" : "full",
                    "imagePath1" : "apps/pandora/images/LogoSplashPandora.png",
                    "meter" : {"meterType":"indeterminate", "meterPath":"common/images/IndeterminateMeter.png"},
                    "buttonCount" : 1,
                    "buttonConfig" : {
                        "button1" : {
                            selectCallback: this._dialogDefaultSelectCallback.bind(this),
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            labelId: "entMenu",
                            subMap : null,
                            appData : "source",
                            disabled : false
                        }
                    }, // end of buttonConfig
                } // end of properties for "Loading"
            }, // end of list of controlProperties
        }, // end of "Loading"

        "StationList" : {
            sbNameId : "sbNameId",
            template : "List2Tmplt",
            leftBtnStyle : "goBack",
            controlProperties : {
                List2Ctrl : {
                    numberedList: true,
                    dataList: this.StationListCtxtDataList,
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',
                        text1Id : 'StationList',
                    },
                    selectCallback : this._listItemClickCallback.bind(this),
                    needDataCallback : this._requestMoreDataCallback.bind(this)
                }
            },
            contextInFunction : this._StationListCtxtContextIn.bind(this),
            readyFunction : this._StationListCtxtTmpltReadyToDisplay.bind(this)
        }, // end of "StationList"

        "SortBy" : {
            sbNameId : "sbNameId",
            template : "List2Tmplt",
            leftBtnStyle : "goBack",
            controlProperties : {
                "List2Ctrl" : {
                    numberedList : false,
                    dataList : sortByCtxtDataList,
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',
                        text1Id : 'SortBy',
                    },
                    selectCallback : this._listItemClickCallback.bind(this)
                }
            },
            readyFunction : this._SortByCtxtTmpltReadyToDisplay.bind(this)
        }, // end of "SortBy"

        "NowPlaying" : {
            sbNameId : "sbNameId",
            template : "NowPlaying4Tmplt",
            leftBtnStyle : "goBack",
            controlProperties : {
                NowPlayingCtrl : {
                    ctrlStyle : 'Style2',
                    ctrlTitleObj : null,
                    audioTitleObj : null,
                    detailLine1Obj : null,
                    detailLine2Obj : null,
                    detailLine3Obj : null,
                    artworkImagePath : null,
                    umpConfig : {
                        hasScrubber : true,
                        scrubberConfig : scrubberConfig,
                        retracted : false,
                        tooltipsEnabled : true,
                        defaultSelectCallback : this._umpSelectCallback.bind(this),
                        defaultLongPressCallback : null,
                        defaultSlideCallback : null,
                        defaultHoldStartCallback : null,
                        defaultHoldStopCallback : null,
                        defaultFocusCallback : null,
                        buttonConfig : umpButtonConfig
                    }
                }
            },
            readyFunction       : this._NowPlayingCtxtTmpltReadyToDisplay.bind(this),
            displayedFunction   : this._NowPlayingCtxtTmpltDisplayed.bind(this)
        }, // end of "NowPlaying"

        "OverLimit" : {
            template : "Dialog3Tmplt",
            sbNameId : "sbNameId",
            controlProperties: {
                Dialog3Ctrl : {
                    contentStyle : "style02",
                    text1Id : "OverLimit",
                    buttonCount : 1,
                    buttonConfig : {
                        button1 : {
                            selectCallback: this._dialogDefaultSelectCallback.bind(this),
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            labelId: "common.Ok",
                            appData : "yes",
                        },
                    },
                } // end of properties for "OverLimit"
            }, // end of list of controlProperties
            readyFunction : this._OverLimitCtxtTmpltReadyToDisplay.bind(this)
        }, // end of "OverLimit"

        "Bookmark" : {
            sbNameId : "sbNameId",
            template : "List2Tmplt",
            leftBtnStyle : "goBack",
            controlProperties : {
                "List2Ctrl" : {
                    numberedList : false,
                    dataList : bookmarkCtxtDataList,
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',
                        text1Id : 'Bookmark',
                    },
                    selectCallback : this._listItemClickCallback.bind(this)
                }
            },
            readyFunction : this._BookmarkCtxtTmpltReadyToDisplay.bind(this)
        }, // end of "Bookmark"

        "ErrorCondition" : {
            template : "Dialog3Tmplt",
            sbNameId : "sbNameId",
            controlProperties: {
                Dialog3Ctrl : {
                    titleId : "MobileDevice1",
                    text1Id : "MobileDevice2",
                    titleStyle : "titleStyle01",
                    contentStyle : "style02",
                    buttonCount : 1,
                    buttonConfig : {
                        button1 : {
                            selectCallback: this._dialogDefaultSelectCallback.bind(this),
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            labelId: "common.Ok",
                            appData : "yes",
                        },
                    },
                } // end of properties for "ErrorCondition"
            }, // end of list of controlProperties
            readyFunction : this._ErrorConditionCtxtTmpltReadyToDisplay.bind(this)
        }, // end of "ErrorCondition"

        "NoCurrentStation" : {
            template : "Dialog3Tmplt",
            sbNameId : "sbNameId",
            controlProperties: {
                Dialog3Ctrl : {
                    titleId : "NoCurrentStation",
                    text1Id : "SelectStation",
                    titleStyle : "titleStyle01",
                    contentStyle : "style02",
                    buttonCount : 1,
                    buttonConfig : {
                        button1 : {
                            selectCallback: this._dialogDefaultSelectCallback.bind(this),
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            labelId: "common.Ok",
                            appData : "yes",
                        },
                    },
                } // end of properties for "NoCurrentStation"
            }, // end of list of controlProperties
            // readyFunction : this._NoCurrentStationCtxtTmpltReadyToDisplay.bind(this)
        }, // end of "NoCurrentStation"

    }; // end of this._contextTable
    //@formatter:on

    //@formatter:off
    this._messageTable = {
        "Station_list_chunk" : this._Station_list_chunkMsgHandler.bind(this),
        "TrackInfo" : this._TrackInfoMsgHandler.bind(this),
        "TrackRating" : this._TrackRatingHandler.bind(this),
        "TrackAlbumArt" : this._TrackAlbumArtHandler.bind(this),
        "ClearTrackInfo" : this._ClearTrackInfoHandler.bind(this),
        "ActiveStation" : this._ActiveStationInfoHandler.bind(this),
        "SetElapsedTime" : this._SetElapsedTimeMsgHandler.bind(this),
        "RecoverableError": this._RecoverableErrorMsgHandler.bind(this),
        "SendBookmarkStatus" : this._SendBookmarkStatusMsgHandler.bind(this),

        "TimedSbn_ErrorConditionReceived" : this._TimedSbn_ErrorConditionReceivedHandler.bind(this),
        "TimedSbn_ErrorBookmarking" : this._TimedSbn_ErrorBookmarkingHandler.bind(this),
        "TimedSbn_ErrorRating"  : this._TimedSbn_ErrorRatingHandler.bind(this),
        "TimedSbn_OverLimit"  : this._TimedSbn_OverLimitHandler.bind(this),
        "TimedSbn_SongChanges" : this._TimedSbn_SongChangesHandler.bind(this),
        "TimedSbn_StationDeleted"  : this._TimedSbn_StationDeletedHandler.bind(this),
        "TimedSbn_LicensingRestriction"  : this._TimedSbn_ErrorConditionReceivedHandler.bind(this),
        "TimedSbn_InsufficientConnectivity"  : this._TimedSbn_ErrorConditionReceivedHandler.bind(this),
		"TimedSbn_ThumbsInfo" : this._TimedSbn_ThumbsInfoHandler.bind(this),    // received when not in focus		
    }; // end of this._messageTable
    //@formatter:on

};

/**************************
 * Pandora App Functions *
 **************************/



/**************************
 * Context handlers
 **************************/

// General Context
pandoraApp.prototype._ctxtTmpltReadyToDisplay = function()
{
    log.debug("pandoraApp _ctxtTmpltReadyToDisplay called...");
};

pandoraApp.prototype._ctxtTmpltDisplayed = function()
{
    log.debug("pandoraApp _ctxtTmpltDisplayed called...");
};

// SortBy Context
pandoraApp.prototype._SortByCtxtTmpltReadyToDisplay = function()
{
    log.debug("pandoraApp _SortByCtxtTmpltReadyToDisplay called...");

    if (this._currentContext.params &&
        this._currentContext.params.payload &&
        this._currentContext.params.payload.sortByMethod)
    {
        // store
        var sortMethod = this._currentContext.params.payload.sortByMethod;
        // update
        if (sortMethod == "Date")
        {
            this._currentContextTemplate.list2Ctrl.setTick(0, true);
        }
        if (sortMethod == "Alphabetically")
        {
            this._currentContextTemplate.list2Ctrl.setTick(1, true);
        }
    }
};

pandoraApp.prototype._StationListCtxtContextIn = function()
{
    if (this._currentContext && this._currentContext.params && this._currentContext.params.payload)
    {
        this._cachedSortBy = this._currentContext.params.payload.sortByMethod;
    }
};

// Station List Context
pandoraApp.prototype._StationListCtxtTmpltReadyToDisplay = function()
{
    log.debug("pandoraApp _StationListCtxtTmpltReadyToDisplay called...");

    this._lastActiveStation = -1;
    framework.sendEventToMmui(this.uiaId, "GetListChunk", {payload:{startIndex: 0, reqCount: this._stationsCount}});
    // Set Buffering
    if (this._currentContext && this._currentContext.params && this._currentContext.params.payload)
    {
        this._cachedSortBy = this._currentContext.params.payload.sortByMethod;
    }
    else
    {
        this._currentContextTemplate.list2Ctrl.setDataList(this.StationListCtxtDataList);
        this._currentContextTemplate.list2Ctrl.updateItems(0, 0);
    }
};

// NowPlaying Context

pandoraApp.prototype._NowPlayingCtxtTmpltDisplayed = function()
{
    if (this._cachedActiveStationName)
    {
        this._updateNowPlayingTitle(this._cachedActiveStationName);
    }
};

pandoraApp.prototype._NowPlayingCtxtTmpltReadyToDisplay = function()
{
    log.debug("pandoraApp _NowPlayingCtxtTmpltReadyToDisplay called...");
    //currentStation
    if (this._currentContext.params &&
        this._currentContext.params.payload &&
        // this._currentContext.params.payload.stationId &&
        this._currentContext.params.payload.stationName)
    {
        // store
        this._cachedActiveStationId = this._currentContext.params.payload.stationName;
        this._cachedActiveStationName = this._currentContext.params.payload.stationName;
    }
    else
    {
        // this._updateNowPlayingTitle();
    }

    // update
    if (this._cachedActiveStationName)
    {
        this._updateNowPlayingTitle(this._cachedActiveStationName);
    }

    if (this._cachedTrackInfo)
    {
        log.debug("Populating Playing Song Control from _NowPlayingCtxtTmpltReadyToDisplay");
        this._updateNowPlayingCtrl(this._cachedTrackInfo);
        this._updateButtonState();
    }

    if (this._cachedTrackRating != null)
    {
        log.debug('Populating Track Rating in UMP');
        this._updateTrackRating();
    }
    if (this._cachedAlbumArt)
    {
        log.debug('Populating Album Art in NowPlaying');
        this._currentContextTemplate.nowPlaying4Ctrl.setArtworkImagePath(this._cachedAlbumArt);
    }

    this._setRecoverableError();
};

// OverLimit Context
pandoraApp.prototype._OverLimitCtxtTmpltReadyToDisplay = function()
{
    log.debug("pandoraApp _OverLimitCtxtTmpltReadyToDisplay called...");
};

// Bookmark Context
pandoraApp.prototype._BookmarkCtxtTmpltReadyToDisplay = function()
{
    log.debug("pandoraApp _BookmarkCtxtTmpltReadyToDisplay called...");

    if (this._currentContext.params &&
        this._currentContext.params.payload &&
        this._currentContext.params.payload.BookmarkInfo
    )
    {
        this._cachedSongName = this._currentContext.params.payload.BookmarkInfo.songName;
        this._cachedArtistName = this._currentContext.params.payload.BookmarkInfo.artistName;
        this._cachedBookmarked = this._currentContext.params.payload.BookmarkInfo.AlreadyBookmarked;
    }
        this._manageTicks();
};
// ErrorCondition Context
pandoraApp.prototype._ErrorConditionCtxtTmpltReadyToDisplay = function()
{
    log.debug("pandoraApp _ErrorConditionCtxtTmpltReadyToDisplay called...");

    if (this._currentContext.params &&
        this._currentContext.params.payload &&
        this._currentContext.params.payload.errorReceived)
    {
        this._cachedError = this._currentContext.params.payload.errorReceived;
        switch (this._cachedError)
        {
            case "NoPandora":
                this._currentContextTemplate.dialog3Ctrl.setTitleId("NoPandora1");
                this._currentContextTemplate.dialog3Ctrl.setText1Id("NoPandora2");
                break;
            case "NoStations":
                this._currentContextTemplate.dialog3Ctrl.setTitleId("NoStationFound1");
                this._currentContextTemplate.dialog3Ctrl.setText1Id("NoStationFound2");
                break;
            case "LicenseError":
                this._currentContextTemplate.dialog3Ctrl.setTitleId("LicensingRestriction1");
                this._currentContextTemplate.dialog3Ctrl.setText1Id("LicensingRestriction2");
                break;
            case "LoginError":
                this._currentContextTemplate.dialog3Ctrl.setTitleId("InvalidLogin1");
                this._currentContextTemplate.dialog3Ctrl.setText1Id("InvalidLogin2");
                break;
            case "Timeout":
                this._currentContextTemplate.dialog3Ctrl.setTitleId("ConnectionLost1");
                this._currentContextTemplate.dialog3Ctrl.setText1Id("ConnectionLost2");
                break;
            case "Device":
                this._currentContextTemplate.dialog3Ctrl.setTitleId("MobileDevice1");
                this._currentContextTemplate.dialog3Ctrl.setText1Id("MobileDevice2");
                break;
            case "Maintenance":
                this._currentContextTemplate.dialog3Ctrl.setTitle("");
                this._currentContextTemplate.dialog3Ctrl.setText1Id("PandoraMaintinence");
                break;
            case "InsufficientConnectivity":
                this._currentContextTemplate.dialog3Ctrl.setTitle("");
                this._currentContextTemplate.dialog3Ctrl.setText1Id("InsufficientConnectivity");
                break;
            case "BTAudioDisconnected":
                this._currentContextTemplate.dialog3Ctrl.setTitle("");
                this._currentContextTemplate.dialog3Ctrl.setText1Id("BluetoothAudioLost");
                break;
            case "NotSupportedVersion":
                this._currentContextTemplate.dialog3Ctrl.setTitle("");
                this._currentContextTemplate.dialog3Ctrl.setText1Id("NotSupportedVersion1");
                break;
        }
    }
};

/**************************
 * Message handlers
 **************************/

// StationList
pandoraApp.prototype._Station_list_chunkMsgHandler = function(msg)
{
    //log.error("StationList received", msg);

    // store
    this._cachedStationList = msg.params.payload.stationList;
    this._cachedStartIndex = msg.params.payload.startIndex;
    this._cachedArrayCount = msg.params.payload.arrayCount;
    this._cachedTotalCount = msg.params.payload.totalCount;

    // check for active station in the list
    var as = this._getActiveStation(this._cachedStationList.list);
    if (-1 != as)
    {
        // we have an active station in the list -> use that one when populating
        this._lastActiveStation = as;
    }
    //log.error("current ctxt id", this._currentContext.ctxtId);
    //log.error("current ctxt Template", this._currentContextTemplate);
    // update
    if (this._currentContext && this._currentContextTemplate && "StationList" === this._currentContext.ctxtId)
    {
        this._populateListCtrl(this._cachedStationList);
    }
};

// TrackRating - Contains the track rating
pandoraApp.prototype._TrackRatingHandler = function(msg)
{
    log.debug("TrackRating received", msg);

    // store
    this._cachedTrackRating = msg.params.payload.track;

    // update
    if (this._currentContext && this._currentContextTemplate && 'NowPlaying' === this._currentContext.ctxtId)
    {
        this._updateTrackRating();
    }
};

// TrackInfo - Contains the currently playing song info
pandoraApp.prototype._TrackInfoMsgHandler = function(msg)
{
    log.debug("TrackInfo received", msg);

    // store
    this._cachedTrackInfo = msg.params.payload.track;

    //msg.params.payload.track.type
    //0 = song
    //1 = ad

    // set player state
    switch (msg.params.payload.track.state)
    {
        case 0 :
            this._playerState = 'idle';
            break;
        case 1 :
            this._playerState = 'buffering';
            break;
        case 2 :
            this._playerState = 'playing';
            break;
        case 3 :
            this._playerState = 'paused';
            break;
        case 4 :
            this._playerState = 'stopped';
            break;
        case 5 :
            this._playerState = 'max';
            break;
        default:
            log.debug("TrackInfo received unhandled payload");
            break;
    }

    // update
    if (this._currentContext && this._currentContextTemplate && 'NowPlaying' === this._currentContext.ctxtId)
    {
        this._updateButtonState();
        this._updateNowPlayingCtrl(this._cachedTrackInfo);
    }
};

//Bookmark status message, used to keep track of the current bookmark status while inside bookmark ctxt
pandoraApp.prototype._SendBookmarkStatusMsgHandler = function(msg)
{
        //cache the contents of the message
        this._cachedBookmarked = msg.params.payload.BookmarkStatus;
        // update the ticks of the context
        if (this._currentContext && this._currentContextTemplate && "Bookmark" === this._currentContext.ctxtId)
        {
            this._manageTicks();
        }
};
// TrackAlbumArt - Currently playing song image
pandoraApp.prototype._TrackAlbumArtHandler = function(msg)
{
    log.debug("_TrackAlbumArt received", msg);

    // store and make it unique ignoring any cache
    this._cachedAlbumArt = (msg.params.payload.fileName != '') ? msg.params.payload.fileName + '?' + new Date().getTime() : '';

    // update
    if (this._currentContext && this._currentContextTemplate && "NowPlaying" === this._currentContext.ctxtId)
    {
        this._currentContextTemplate.nowPlaying4Ctrl.setArtworkImagePath(this._cachedAlbumArt);
    }
};

/*
 * ClearTrackInfo
 * This is sent when overLimit is reached and rating
 * operation should not be taken into account, i.e. it
 * has failed and rating buttons reset is needed.
 */
pandoraApp.prototype._ClearTrackInfoHandler = function(msg)
{
    log.debug("ClearTrackInfo received", msg);

    if (this._currentContext && this._currentContextTemplate && "NowPlaying" === this._currentContext.ctxtId)
    {
        var currentNowPlayingCtrl = this._currentContextTemplate.nowPlaying4Ctrl;
        currentNowPlayingCtrl.umpCtrl.setButtonState("thumbsup", 'UnSel');
        currentNowPlayingCtrl.umpCtrl.setButtonState("thumbsdown", 'UnSel');
        if ('buffering' == this._playerState)
        {
            currentNowPlayingCtrl.umpCtrl.setButtonDisabled("thumbsup", true);
            currentNowPlayingCtrl.umpCtrl.setButtonDisabled("thumbsdown", true);
        }
        else
        {
            currentNowPlayingCtrl.umpCtrl.setButtonDisabled("thumbsup", false);
            currentNowPlayingCtrl.umpCtrl.setButtonDisabled("thumbsdown", false);
        }
    }
};
// ActiveStation
pandoraApp.prototype._ActiveStationInfoHandler = function(msg)
{
    log.debug("_ActiveStationInfoHandler received", msg);

    this._cachedActiveStationId = msg.params.payload.stationName;
    this._cachedActiveStationName = msg.params.payload.stationName;
    this._cachedActiveStationType = msg.params.payload.stationType;

    if (this._currentContext && this._currentContextTemplate && "NowPlaying" === this._currentContext.ctxtId)
    {
        this._updateNowPlayingTitle(this._cachedActiveStationName);
        this._updateNowPlayingCtrl(this._cachedTrackInfo);

    }
};

pandoraApp.prototype._SetElapsedTimeMsgHandler = function(msg)
{
    log.debug("_SetElapsedTimeMsgHandler received", msg);
    this._cacheElapsedTime = msg.params.payload;
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId && this._currentContext.ctxtId == "NowPlaying")
    {
        if (this._cacheRecoverableErrorState == true)
        {
            this._RecoverableErrorReloadData();
            this._cacheRecoverableErrorState = false;
        }
        // set elapsed time and update scrubber only when we are not in recoverable error
        else if (this._cacheRecoverableErrorState != true && 'buffering' != this._playerState && 'max' != this._playerState)
        {
            this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setElapsedTime(this._getElapsedTime(this._cacheElapsedTime));
            if(this._cachedTrackInfo && this._cachedTrackInfo.duration)
            {
                this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.updateScrubber(this._cacheElapsedTime.total / this._cachedTrackInfo.duration);
            }

            // clear buffering state
            this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setBuffering(false);
        }
    }
};

pandoraApp.prototype._RecoverableErrorMsgHandler = function (msg)
{
    if (msg.params.payload.statusOn == 1)
    {
        this._cacheRecoverableErrorState = true;
    }
    else
    {
        this._cacheRecoverableErrorState = false;
    }

    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId && this._currentContext.ctxtId == "NowPlaying")
    {
        this._setRecoverableError();
    }
};

pandoraApp.prototype._TimedSbn_SongChangesHandler = function(msg)
{
    log.debug("_TimedSbn_SongChangesHandler received");

    if (msg.params.payload.songName)
    {
        framework.common.startTimedSbn(this.uiaId, 'Pandora_Song_SBN', 'typeE', {
            sbnStyle : 'Style02',
            imagePath1 : 'IcnSbnEnt.png',
            text1Id : "system.Pandora",
			text2 : msg.params.payload.songName,
        });
    }
};

pandoraApp.prototype._TimedSbn_StationDeletedHandler = function(msg)
{
    log.debug("_TimedSbn_StationDeletedHandler received");

    framework.common.startTimedSbn(this.uiaId, 'Pandora_Song_SBN', 'entertainmentInfo', {
        sbnStyle : 'Style02',
        imagePath1 : 'IcnSbnEnt.png',
        text1Id : "sbnStationDeleted",
    });
};

pandoraApp.prototype._TimedSbn_OverLimitHandler = function(msg)
{
    log.debug("_TimedSbn_OverLimitHandler received");

    framework.common.startTimedSbn(this.uiaId, 'Pandora_Error_SBN', 'errorNotification', {
        sbnStyle : 'Style02',
        imagePath1 : 'IcnSbnEnt.png',
        text1Id : "sbnOverLimit",
    });
};

pandoraApp.prototype._TimedSbn_ErrorRatingHandler = function(msg)
{
    log.debug("_TimedSbn_ErrorRatingHandler received");

    framework.common.startTimedSbn(this.uiaId, 'Pandora_Error_SBN', 'errorNotification', {
        sbnStyle : 'Style02',
        imagePath1 : 'IcnSbnEnt.png',
        text1Id : "sbnRatingFailed",
    });
};

pandoraApp.prototype._TimedSbn_ErrorBookmarkingHandler = function(msg)
{
    log.debug("_TimedSbn_ErrorBookmarkingHandler received");

    framework.common.startTimedSbn(this.uiaId, 'Pandora_Error_SBN', 'errorNotification', {
        sbnStyle : 'Style02',
        imagePath1 : 'IcnSbnEnt.png',
        text1Id : "sbnBookmarkFailed",
    });
};

pandoraApp.prototype._TimedSbn_ThumbsInfoHandler = function(msg)
{
	log.debug("_TimedSbn_ThumbsInfoHandler received");
		if ( msg.msgId == 'TimedSbn_ThumbsInfo' )
		{
			if(msg.params.payload.thumbsUp === true)
			{
				framework.common.startTimedSbn('pandora', 'TimedSbn_ThumbsInfo', 'typeE', {
                sbnStyle : 'Style02',
                imagePath1 : 'common/images/icons/IcnSbnEnt.png',
                text1Id : "system.Pandora",
				text2 : framework.localize.getLocStr(this.uiaId, "ThumbsUp"),
				}
				);
			}
			else if(msg.params.payload.thumbsDown === true)
			{
				framework.common.startTimedSbn('pandora', 'TimedSbn_ThumbsInfo', 'typeE', {
                sbnStyle : 'Style02',
                imagePath1 : 'common/images/icons/IcnSbnEnt.png',
                text1Id : "system.Pandora",
				text2 : framework.localize.getLocStr(this.uiaId, "ThumbsDown"),
				}
				);
			}
		}
}


pandoraApp.prototype._TimedSbn_ErrorConditionReceivedHandler = function(msg)
{
    log.debug("_TimedSbn_ErrorConditionReceivedHandler received", msg );

    var errStringId = null;
    if (msg.params.payload.errorReceived)
    {
        switch (msg.params.payload.errorReceived)
        {
            case "Timeout":
                errStringId = "sbnConnectionError";
                break;
            case "Device":
                errStringId = "sbnMobileDeviceError";
                break;
            case "InsufficientConnectivity":
                errStringId = "sbnConnectivityError";
                break;
            case "LicenseError":
                errStringId = "LicensingRestriction1";
                break;
            case "Maintenance":
            case "NoPandora" :
            case "NoStations":
                errStringId = "sbnPandoraMaintErr";
                break;
        }
        framework.common.startTimedSbn(this.uiaId, 'Pandora_Error_SBN', 'errorNotification', {
            sbnStyle : 'Style02',
            imagePath1 : 'IcnSbnEnt.png',
            text1Id : errStringId,
        });
    }
};

/**
 * This function is called by Common whenever a msgType="alert" comes from MMUI.
 * This function should return a properties Object to use for the WinkCtrl.
 * @param {string}
 * @param {object}
 * @return {object}
 */
pandoraApp.prototype.getWinkProperties = function(alertId, params)
{
    var winkProperties = null;

    switch (alertId)
    {
        case "LicensingRestriction_Alert":
            winkProperties = {
                style: "style03",   // default wink style
                text1Id: "LicensingRestrictions_Alert",
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
 * Control callbacks
 **************************/

// List Control
pandoraApp.prototype._listItemClickCallback = function(listCtrlObj, appData, params)
{
    log.debug("pandoraApp _listItemClickCallback called...");
    log.debug("   for context" + this._currentContext.ctxtId);
    log.debug("   appData: "+ appData + ' appData: '+ params);

    switch (this._currentContext.ctxtId)
    {
        case "StationList" :
            switch (appData)
            {
                case 'sort' :
                    framework.sendEventToMmui(this.uiaId, "SelectSortBy", params.fromVui);
                    this._cachedStationList = null;
                    break;

                default :
                    // store last selected station
                    this._cachedTrackInfo = null;
                    this._cachedActiveStationName = null;
                    this._lastActiveStation = appData.id;
                    framework.sendEventToMmui(this.uiaId, "SelectActiveStation", { payload : { stationId : appData.id } }, params.fromVui);
                    // Note: The active station indicator is automatically changed when selected
                    break;
            }
            break;
        case "Bookmark" :
            switch (appData)
            {
                case 'song' :
                    framework.sendEventToMmui(this.uiaId, "BookmarkSong", params.fromVui);
                    this._setTick(0, true);
                    break;
                case 'artist' :
                    framework.sendEventToMmui(this.uiaId, "BookmarkArtist", params.fromVui);
                    this._setTick(1, true);
                    break;
            }
            break;
        case 'SortBy' :
          switch (appData)
          {
              case 'Date':
                framework.sendEventToMmui(this.uiaId, "ShowByDate", params.fromVui);
                this._cachedStationList = null;
                break;
              case 'Alphabetically':
                framework.sendEventToMmui(this.uiaId, "ShowByAZ", params.fromVui);
                this._cachedStationList = null;
                break;
          }
          break;
        default :
            log.warn("pandoraApp: Unknown context", this._currentContext.ctxtId);
            break;
    }
};

// UMP Control
// select
pandoraApp.prototype._umpSelectCallback = function(umpCtrlObj, appData, additionalData)
{
    log.debug("_umpSelectCallback called...", appData);

    switch (appData)
    {
        case "source":
            framework.sendEventToMmui(this.uiaId, "SelectSource");
            break;
        case "stationlist":
            framework.sendEventToMmui(this.uiaId, "SelectStationList");
            this._cachedStationList = null;
            break;
        case "thumbsdown":
            if (additionalData.state == "Sel")
            {
                framework.sendEventToMmui(this.uiaId, "ThumbsDown");
            }
            // immediately disable both buttons
            if (additionalData.state == "UnSel")
            {
                umpCtrlObj.setButtonState("thumbsdown", "Sel");
            }
            umpCtrlObj.setButtonDisabled("thumbsdown",true);
            break;
        case "thumbsup":
            if (additionalData.state == "Sel")
            {
                framework.sendEventToMmui(this.uiaId, "ThumbsUp");
            }
            if (additionalData.state == "UnSel")
            {
                umpCtrlObj.setButtonState("thumbsup", "Sel");
            }
            // immediately disable both buttons
            umpCtrlObj.setButtonDisabled("thumbsup",true);
            break;
        case "bookmark":
            framework.sendEventToMmui(this.uiaId, "ShowBookmarkOptions");
            break;
        case "playpause":
            if (additionalData.state == "Play")
            {
                framework.sendEventToMmui("Common", "Global.Pause");
            }
            else if (additionalData.state == "Pause")
            {
                framework.sendEventToMmui("Common", "Global.Resume");
            }
            // Note: Play/Pause button is automatically updated by the control
            break;
        case "skip":
            framework.sendEventToMmui(this.uiaId, "Skip");
            break;
        case "settings":
            framework.sendEventToMmui(this.uiaId, "SelectSettings");
            break;
    }

};

pandoraApp.prototype._umpSlideCallback = function(umpCtrlObj, appData, params)
{
    log.debug("_umpSlideCallback called...", appData);
};
// EOF: UMP Control

// Dialog Control
pandoraApp.prototype._dialogDefaultSelectCallback = function(dialogBtnCtrlObj, appData, extraParams)
{
    log.debug("_dialogDefaultSelectCallback called. appData: ", appData);

    switch (this._currentContext.ctxtId)
    {
        case "Loading":
            switch (appData)
            {
                case "source":
                    framework.sendEventToMmui("pandora", "SelectSource");
                    break;
            }
            break;
        case 'OverLimit' :
        case 'ErrorCondition' :
        case 'NoCurrentStation' :
            framework.sendEventToMmui("Common", "Global.Yes");
            break;
    }

};
// EOF: Dialog Control

/**************************
 * Helper functions
 **************************/

pandoraApp.prototype._requestMoreDataCallback = function (index)
{
    log.debug("_requestMoreDataCallback called...", index);
    framework.sendEventToMmui(this.uiaId, "GetListChunk", {payload:{startIndex: index - 1, reqCount: this._stationsCount}});
};

pandoraApp.prototype._setRecoverableError = function ()
{
    var tmpltUmp = this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl;
    tmpltUmp.setBuffering(this._cacheRecoverableErrorState);
    var adDisabled = false;
    if(this._cachedTrackInfo && this._cachedTrackInfo.type == "Ad")
    {
        adDisabled =  true;
    }
	else
	{
		tmpltUmp.setButtonDisabled("playpause", this._cacheRecoverableErrorState);
	}
	
    tmpltUmp.setButtonDisabled("stationlist", this._cacheRecoverableErrorState);
    tmpltUmp.setButtonDisabled("bookmark", this._cacheRecoverableErrorState | adDisabled);
    
    tmpltUmp.setButtonDisabled("skip", this._cacheRecoverableErrorState | adDisabled);
    if (this._cacheRecoverableErrorState == true)
    {
        tmpltUmp.setButtonDisabled("thumbsdown", this._cacheRecoverableErrorState | adDisabled);
        tmpltUmp.setButtonDisabled("thumbsup", this._cacheRecoverableErrorState | adDisabled);
        tmpltUmp.setElapsedTime("");
        tmpltUmp.setTotalTime("");

        this._currentContextTemplate.nowPlaying4Ctrl.setAudioTitle({
            audioTitleId : 'common.Loading',
            audioTitleText : '',
            audioTitleIcon : "none",
        });

        this._currentContextTemplate.nowPlaying4Ctrl.setDetailLine1({ detailTextId : null, detailText: '', detailIcon : null });
        this._currentContextTemplate.nowPlaying4Ctrl.setDetailLine2({ detailTextId : null, detailText: '', detailIcon : null });

        this._currentContextTemplate.nowPlaying4Ctrl.setArtworkImagePath('');
    }
    else
    {
        this._updateTrackRating();
        this._RecoverableErrorReloadData();
    }
};

// Populate List
pandoraApp.prototype._populateListCtrl = function(itemsList)
{

    if (!this._currentContextTemplate.list2Ctrl.hasDataList())
    {
         this._dataList = [];
         this._items = [];
         this._cachedEmpty = true;
    }

    var currentList = this._currentContextTemplate.list2Ctrl;
    var currentTopItem = currentList.topItem;
    var currentFocussedItem = currentList.focussedItem;

    if (itemsList.list.length > 0)
    {
            // if we have station list items
            this._dataList = {
                itemCountKnown : true,
                itemCount : this._cachedTotalCount + 1, // plus sorting
                vuiSupport : true,
            };

        if (this._cachedSortBy)
        {
            // toggle item
            this._items[0] = {
                appData : 'sort',
                text1Id : (this._cachedSortBy == "Date") ? "SortByDate" : "SortByAZ",
                itemStyle : 'style01'
            };
        }
        else
        {
            // toggle item
            this._items[0] = {
                appData : 'sort',
                text1 : "SortBy:",
                itemStyle : 'style01'
            };
            log.warn("There is no string for SortBy method.");
        }

        var j=0;
        for (var i = this._cachedStartIndex; i < this._cachedArrayCount + this._cachedStartIndex; i++)
        {
            var iconPath = "";
            switch (itemsList.list[j].stationType)
            {
                case "IsNotShared":
                    iconPath = "";
                    break;
                case "Shared":
                    iconPath = "common/images/icons/IcnListPandoraShareStat_En.png";
                    break;
                case "Shuffle":
                    iconPath = "common/images/icons/IcnUmpShuffle_Off_En.png";
                    break;

            }

            this._items[i+1] = {
                appData : { id : itemsList.list[j].id, name : itemsList.list[j].name },
                text1 : itemsList.list[j].name,
                selected : false,
                disabled : false,
                hasCaret: false,
                itemStyle : 'style02',
                image1 : (this._lastActiveStation == itemsList.list[j].id) ? 'common/images/icons/IcnListEntNowPlaying_En.png' : '',
                image2 : iconPath,
            };
            j++;
        }
    }
    else
    {
        // if we have empty list (show Buffering)
        this._dataList = this.StationListCtxtDataList;

    } // endif (itemsList.list.length > 0)

    this._dataList.items = this._items;
    if (this._cachedEmpty)
    {
        currentList.setDataList(this._dataList);
        //log.error("Items List length:", itemsList.list.length);
        currentList.updateItems(0, itemsList.count);
        this._cachedEmpty = false;
    }
    else
    {
        //log.error("Items List length if empty:", itemsList.list.length);
        //Update SortBy item
        currentList.updateItems(0, 0);
        //Update Remaining Items
        currentList.updateItems(this._cachedStartIndex + 1, this._cachedArrayCount + this._cachedStartIndex);
    }
    // preserve current position
    currentList.topItem = currentTopItem;
    currentList.focussedItem = currentFocussedItem;

    this._cachedStationList = null;
};

// Populate Playing Song Control
pandoraApp.prototype._updateNowPlayingCtrl = function(station)
{
    log.debug("_updateNowPlayingCtrl called...");

    // reference to the current NowPlaying control
    var currentNowPlayingCtrl = this._currentContextTemplate.nowPlaying4Ctrl;

    if (this._playerState == 'buffering')
    {
        this._setBuffering();
        return;
    }

    if (!station)
    {
        station = {};
        station.songName = null;
        station.artistName = null;
        station.albumName = null;
        station.type = null;
        station.bookmarked = null;
    }
    // set audio title
    currentNowPlayingCtrl.setAudioTitle({
        audioTitleId : null,
        submap : null,
        audioTitleText : station.songName,
        audioTitleIcon : 'common/images/icons/IcnListSong.png',
    });

    // set detail line 1
    currentNowPlayingCtrl.setDetailLine1({
        detailTextId : null,
        submap : null,
        detailText: station.artistName,
        detailIcon : 'common/images/icons/IcnListPerson.png',
    });

    // set detail line 2
    currentNowPlayingCtrl.setDetailLine2({
        detailTextId : null,
        submap : null,
        detailText: station.albumName,
        detailIcon : 'common/images/icons/IcnListCdPlayer_En.png',
    });

    if (this._cacheElapsedTime)
    {
        currentNowPlayingCtrl.umpCtrl.setElapsedTime(this._getElapsedTime(this._cacheElapsedTime));
    }

    // clear buffering state
    currentNowPlayingCtrl.umpCtrl.setBuffering(false);

    if (station.bookmarked)
    {
        this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.properties.buttonConfig.bookmark.imageBase = "IcnUmpBookmark_Sel";
    }
    else
    {
        this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.properties.buttonConfig.bookmark.imageBase = "IcnUmpBookmark_Unsel";
    }


    if (this._cachedActiveStationType == "Shared")
    {
        currentNowPlayingCtrl.umpCtrl.setButtonDisabled("thumbsdown",true);
        currentNowPlayingCtrl.umpCtrl.setButtonDisabled("thumbsup",true);
    }
    //Disable controls on buffering, enable on everything else
    if (this._playerState == "buffering")
    {
        currentNowPlayingCtrl.umpCtrl.setButtonDisabled("thumbsdown",true);
        currentNowPlayingCtrl.umpCtrl.setButtonDisabled("thumbsup",true);
        currentNowPlayingCtrl.umpCtrl.setButtonDisabled("bookmark",true);
        currentNowPlayingCtrl.umpCtrl.setButtonDisabled("skip",true);
        currentNowPlayingCtrl.umpCtrl.setButtonDisabled("playpause",true);
        currentNowPlayingCtrl.umpCtrl.setButtonState("thumbsup", 'UnSel');
        currentNowPlayingCtrl.umpCtrl.setButtonState("thumbsdown", 'UnSel');
    }
    else
    {
        currentNowPlayingCtrl.umpCtrl.setButtonDisabled("stationlist",false);
        currentNowPlayingCtrl.umpCtrl.setButtonDisabled("bookmark",false);
        currentNowPlayingCtrl.umpCtrl.setButtonDisabled("skip",false);
        currentNowPlayingCtrl.umpCtrl.setButtonDisabled("playpause",false);

        if (this._cachedActiveStationType && this._cachedActiveStationType == "IsNotShared" && this._cachedTrackRating)
        {
            if (this._cachedTrackRating.thumbsUp === 0)
            {
                currentNowPlayingCtrl.umpCtrl.setButtonDisabled("thumbsup",false);
            }
            if(this._cachedTrackRating.thumbsUp === 1)
            {
                currentNowPlayingCtrl.umpCtrl.setButtonDisabled("thumbsup", true);
            }
            if (this._cachedTrackRating.thumbsDown === 0)
            {
            currentNowPlayingCtrl.umpCtrl.setButtonDisabled("thumbsdown",false);
            }
            if(this._cachedTrackRating.thumbsDown === 1)
            {
                currentNowPlayingCtrl.umpCtrl.setButtonDisabled("thumbsdown",true);
            }
        }

        if (this._cachedAlbumArt)
        {
            log.debug('Populating Album Art in _updateNowPlayingCtrl');
            this._currentContextTemplate.nowPlaying4Ctrl.setArtworkImagePath(this._cachedAlbumArt);
        }

    }

    //Disable controls on advertisements, enable on track
    if (station.type == "Ad")
    {
        currentNowPlayingCtrl.umpCtrl.setButtonDisabled("thumbsdown",true);
        currentNowPlayingCtrl.umpCtrl.setButtonDisabled("thumbsup",true);
        currentNowPlayingCtrl.umpCtrl.setButtonDisabled("bookmark",true);
        currentNowPlayingCtrl.umpCtrl.setButtonDisabled("skip",true);
        currentNowPlayingCtrl.umpCtrl.setButtonDisabled("playpause",false);
        currentNowPlayingCtrl.umpCtrl.setButtonState("thumbsup", 'UnSel');
        currentNowPlayingCtrl.umpCtrl.setButtonState("thumbsdown", 'UnSel');
    }

    if (station.duration)
    {
        // currentNowPlayingCtrl.umpCtrl.setScrubberDuration(station.duration)
        currentNowPlayingCtrl.umpCtrl.setTotalTime(this._getElapsedTime(this._getTotalTime(station.duration)));
        if (this._cacheElapsedTime && this._cachedTrackInfo && this._cachedTrackInfo.duration && typeof(this._cacheElapsedTime.total) === "number")
        {
            currentNowPlayingCtrl.umpCtrl.updateScrubber(this._cacheElapsedTime.total / this._cachedTrackInfo.duration);
        }
    }

};

// Update now playing title
pandoraApp.prototype._updateNowPlayingTitle = function(title)
{
    log.debug("_updateNowPlayingTitle called...");

    // set title
    this._currentContextTemplate.nowPlaying4Ctrl.setCtrlTitle({
        ctrlTitleId : null,
        ctrlTitleText : title,
        ctrlTitleIcon : null,
    });
};

// Set buffering - clear now playing control
pandoraApp.prototype._setBuffering = function()
{
    // reference to the current NowPlaying control
    var currentNowPlayingCtrl = this._currentContextTemplate.nowPlaying4Ctrl;

    // set buffering string
    currentNowPlayingCtrl.setAudioTitle({
        audioTitleId : 'common.Loading',
        audioTitleText : '',
        audioTitleIcon : "none",
    });

     // clear detail line 1 and 2
    currentNowPlayingCtrl.setDetailLine1({ detailTextId : null, detailText: '', detailIcon : null });
    currentNowPlayingCtrl.setDetailLine2({ detailTextId : null, detailText: '', detailIcon : null });

    // set generic artwork
    currentNowPlayingCtrl.setArtworkImagePath('');

    // unselect any ratings
    currentNowPlayingCtrl.umpCtrl.setButtonState("thumbsup", 'UnSel');
    currentNowPlayingCtrl.umpCtrl.setButtonState("thumbsdown", 'UnSel');
    currentNowPlayingCtrl.umpCtrl.updateScrubber(0);

    this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.properties.buttonConfig.bookmark.imageBase = "IcnUmpBookmark_Unsel";
    // hide elapsed time
    currentNowPlayingCtrl.umpCtrl.setElapsedTime("");
    currentNowPlayingCtrl.umpCtrl.setTotalTime("");

    if (this._cacheElapsedTime && this._cacheElapsedTime.total)
    {
        this._cacheElapsedTime.total = null;
    }
    if (this._cachedTrackInfo && this._cachedTrackInfo.duration)
    {
        this._cachedTrackInfo.duration = null;
    }

    for (var i = 2; i < 7; i++)
    {
        currentNowPlayingCtrl.umpCtrl.setButtonDisabled(currentNowPlayingCtrl.umpCtrl._buttonArray[i].appData, true);
    }

    // set buffering state on the progress bar
    currentNowPlayingCtrl.umpCtrl.setBuffering(true);

};

// Update track rating
pandoraApp.prototype._updateTrackRating = function()
{
    // reference to the current NowPlaying control
    var currentNowPlayingCtrl = this._currentContextTemplate.nowPlaying4Ctrl;

    if (this._playerState == 'buffering')
    {
        return;
    }

    if (null != this._cachedTrackRating)
    {
        // determine selected button
        if (this._cachedTrackRating.thumbsUp == '0')
        {
            currentNowPlayingCtrl.umpCtrl.setButtonState("thumbsup", 'UnSel');
            currentNowPlayingCtrl.umpCtrl.setButtonDisabled("thumbsup",false);
        }
        else if (this._cachedTrackRating.thumbsUp == '1')
        {
            currentNowPlayingCtrl.umpCtrl.setButtonState("thumbsup", 'Sel');
            currentNowPlayingCtrl.umpCtrl.setButtonDisabled("thumbsup",true);
        }
        else
        {
            log.warn('Problem with setting thumbs up property', this._cachedTrackRating.thumbsUp);
        }

        if (this._cachedTrackRating.thumbsDown == '0')
        {
            currentNowPlayingCtrl.umpCtrl.setButtonState("thumbsdown", 'UnSel');
            currentNowPlayingCtrl.umpCtrl.setButtonDisabled("thumbsdown",false);
        }
        else if (this._cachedTrackRating.thumbsDown == '1')
        {
            currentNowPlayingCtrl.umpCtrl.setButtonState("thumbsdown", 'Sel');
            currentNowPlayingCtrl.umpCtrl.setButtonDisabled("thumbsdown",true);
        }
        else
        {
            log.warn('Problem with setting thumbs down property', this._cachedTrackRating.thumbsDown);
        }

        // determine disabled state of the buttons
        if (this._cachedTrackInfo && (this._cachedTrackInfo.type == "Ad" || this._cachedActiveStationType == "Shared"))
        {
            currentNowPlayingCtrl.umpCtrl.setButtonDisabled("thumbsup",true);
            currentNowPlayingCtrl.umpCtrl.setButtonDisabled("thumbsdown",true);
        }

    }
};

// Update Error Dialog Control
pandoraApp.prototype._updateErrorDialog = function(errorType)
{
    log.debug("_updateErrorDialog called...");

    this._currentContextTemplate.dialog3Ctrl.setText1Id(errorType);
};

/**
 * Get active station from the station list if any
 * @param {array} - station list as received by the MMUI
 * @return {number} - stationId of the active station or -1 when no active station is found
 */
pandoraApp.prototype._getActiveStation = function(list)
{
    var as = -1;

    // validate input
    if (!list || !(list instanceof Array))
    {
        return as;
    }

    list.forEach(function(v,i,a) {
        if (v.hasOwnProperty('IsActive') && 1 == v.IsActive)
        {
            // active station found
            as = v.id;
        }
    }, this);

    return as;
};

pandoraApp.prototype._getElapsedTime = function (elapsed)
{
    var string = "";
    if (elapsed.h != "0")
    {
        string = (elapsed.h.toString().length == 1) ? "0" + elapsed.h : elapsed.h;
        string += ":";
    }
    string += (elapsed.m.toString().length == 1) ? "0" + elapsed.m :elapsed.m;
    string += ":";
    string += (elapsed.s.toString().length == 1) ? "0" + elapsed.s : elapsed.s;

    return string;
};

pandoraApp.prototype._getTotalTime = function (total)
{
    var hours   = Math.floor(total / 3600);
    var minutes = Math.floor((total - (hours * 3600)) / 60);
    var seconds = total - (hours * 3600) - (minutes * 60);

    return {h: hours, m: minutes, s: seconds};
};

pandoraApp.prototype._updateButtonState = function()
{

    if (this._playerState != 'playing' && this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.properties.buttonConfig["playpause"].currentState != "Play")
    {
        this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonState('playpause', 'Play');
    }
    else if (this._playerState === 'playing' && this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.properties.buttonConfig["playpause"].currentState != "Pause")
    {
       this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonState('playpause', 'Pause');
    }
};

pandoraApp.prototype._RecoverableErrorReloadData = function ()
{

    //recover audio title
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId && this._currentContext.ctxtId == "NowPlaying")
    {
        var currentNPC = this._currentContextTemplate.nowPlaying4Ctrl;

        if (this._cachedTrackInfo != null)
        {

            if (this._cachedTrackInfo.songName != null && this._cachedTrackInfo.songName != undefined)
            {
                currentNPC.setAudioTitle({
                audioTitleId : null,
                submap : null,
                audioTitleText : this._cachedTrackInfo.songName,
                audioTitleIcon : 'common/images/icons/IcnListSong.png',
                });
            }

            //recover artist name

            if (this._cachedTrackInfo.artistName != null && this._cachedTrackInfo.artistName != undefined)
            {
                currentNPC.setDetailLine1({
                detailTextId : null,
                submap : null,
                detailText: this._cachedTrackInfo.artistName,
                detailIcon : 'common/images/icons/IcnListPerson.png',
                });
            }

            //recover album name

            if (this._cachedTrackInfo.albumName != null && this._cachedTrackInfo.albumName != undefined)
            {
                currentNPC.setDetailLine2({
                detailTextId : null,
                submap : null,
                detailText: this._cachedTrackInfo.albumName,
                detailIcon : 'common/images/icons/IcnListCdPlayer_En.png',
                 });
            }

       }
        //recover thumbs button state
        this._updateTrackRating();


        //recover cover art
        if (this._cachedAlbumArt != null)
        {
            currentNPC.setArtworkImagePath(this._cachedAlbumArt);
        }

        //recover progress bar info and position
        if (this._cachedTrackInfo && this._cachedTrackInfo.duration)
        {
            currentNPC.umpCtrl.setTotalTime(this._getElapsedTime(this._getTotalTime(this._cachedTrackInfo.duration)));

            if (this._cacheElapsedTime && this._cacheElapsedTime.total)
            {
                currentNPC.umpCtrl.updateScrubber(this._cacheElapsedTime.total / this._cachedTrackInfo.duration);
            }
        }
    }
};

pandoraApp.prototype._setTick = function (index, toggleValue)
{
    var currentImage = this._currentContextTemplate.list2Ctrl.dataList.items[index].image1;
    if (toggleValue == true)
    {
       this._currentContextTemplate.list2Ctrl.dataList.items[index].image1 = 'common/images/icons/IcnListCheckmark.png';
    }
    else
    {
        this._currentContextTemplate.list2Ctrl.dataList.items[index].image1 = '';
    }
    this._currentContextTemplate.list2Ctrl.updateItems(index, index);

};

pandoraApp.prototype._manageTicks = function()
{

    switch(this._cachedBookmarked)
    {
        case "Song":
            this._setTick(0,true);
            this._setTick(1,false);
            break;
        case "Artist":
            this._setTick(0,false);
            this._setTick(1,true);
            break;
        case "Both":
            this._setTick(0,true);
            this._setTick(1,true);
            break;
        default:
            this._setTick(0,false);
            this._setTick(1,false);
            break;
    }
};
/**************************
 * Framework register
 **************************/
framework.registerAppLoaded("pandora", null, true);
