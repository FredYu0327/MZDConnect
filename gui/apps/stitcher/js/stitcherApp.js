/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: stitcherApp.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: avorotp
 Date: 12-November-2012
 __________________________________________________________________________

 Description: IHU GUI Stitcher App

 Revisions:
 v0.1 (12-November-2012) - initial revision
 v0.2 (09-September-2013) - Dictionaries updated for CS, LV, NO, TR, JP languages.
 v0.3 (11-September-2013) - Dictionaries updated for GR, DE, BG languages.
 v0.4 (13-September-2013) - Dictionaries updated. (SW00132051)
 v0.5 (17-September-2013) - Dictionaries updated for NL, JP, IL, DE, CS, BG, SA languages. (SW00132338)
 v0.6 (23-September-2013) - Fixed bug causing "image" text to be shown when image is not dispayed
 v0.7 (24-September-2013) - Changed checkboxes in ManageCustomFavorites to ticks. (SW00127927)
 v0.8 (11-October-2013) - Changed the Stitcher logo iamge (in Stitcher loading screen) with an image with smaller size (SW00132372)
 v0.9 (11-June-2014) - J03G: GUI Assets: Asset changes for gui stitcher (Temporary : Green Color) (SW00149890)
 v1.0 (12-June-2014) - GUI_STITCHER: MY15 Graphic Asset Update and Clean Up (SW00150285)
 v1.1 (3-Nov-2014) - -Favorites button toggles (SW00155623)
 v1.2 (11-Nov-2014) - Thumbs up and thumbs down functionality corrected (SW00155870)
 __________________________________________________________________________

 */

log.addSrcFile("stitcherApp.js", "stitcher");

/**********************************************
 * Start of Base App Implementation
 *
 * Code in this section should not be modified
 * except for function names based on the appname
 *********************************************/

function stitcherApp(uiaId)
{

    log.debug("constructor called...");

    // Base application functionality is provided in a common location via this call to baseApp.init().
    // See framework/js/BaseApp.js for details.
    baseApp.init(this, uiaId);

    // All feature-specific invvitialization is done in appInit()

}

/**************************
 * Standard App Functions *
 **************************/

/*
 * Called just after the app is instantiated by framework.
 */
stitcherApp.prototype.appInit = function()
{
    log.debug(" stitcherApp appInit called...");

    // load test app
    if (framework.debugMode)
    {
        utility.loadScript("apps/stitcher/test/stitcherAppTest.js");
    }

    // player state
    this._playerState = 'idle';     // possible values: idle, buffering, playing, paused, stopped
    // buffering level
    this._bufferingLevel = null;
    // context stack
    this._contextStack = [];
    // request size
    this._requestSize = 20;
    // app has gone through StationList ctxt.
    this._stationListFlag = null;

    //button settle time
    this._umpCtrlButtonSettleTime = null;

    /*
     * ===================
     * UMP CONFIG
     * ===================
     */
    var umpButtonConfig = new Object();

    //@formatter:off
    var scrubberConfig = {
        scrubberStyle: "Style01",
        mode : 'progress',
        value : 0,
        min : 0.0,
        max : 1.0,
        increment : 0.01,
        currentValue : 0,
        elapsedTime : "00:00",
        totalTime : "00:00",
        disabled : true,
        buffering : false,
    };

    umpButtonConfig["source"] =
    {
        index : 0,
        buttonBehavior : "shortPressOnly",
        disabled : false,
        imageBase : "IcnUmpEntMenu",
        appData : "source",
        selectCallback : this._umpSelectCallback.bind(this)
    };

    umpButtonConfig["stationlist"] =
    {
        index : 1,
        buttonBehavior : "shortPressOnly",
        disabled : false,
        imageBase : "IcnUmpCurrentList",
        appData : "stationlist",
        selectCallback : this._umpSelectCallback.bind(this)
    };

    umpButtonConfig["thumbsdown"] =
    {
        index : 2,
        buttonBehavior : "shortPressOnly",
        disabled : false,
        imageBase : "IcnUmpThumbsDown",
        currentState:"UnSel",
        stateArray: [
            { state:"UnSel", labelId:"common.Tooltip_IcnUmpThumbsDown_UnSel" },
            { state:"Sel", labelId:"common.Tooltip_IcnUmpThumbsDown_Sel" }
        ],
        appData : "thumbsdown",
        selectCallback : this._umpSelectCallback.bind(this)
    };

    umpButtonConfig["thumbsup"] =
    {
        index : 3,
        buttonBehavior : "shortPressOnly",
        disabled : false,
        imageBase : "IcnUmpThumbsUp",
        currentState:"UnSel",
        stateArray: [
            { state:"UnSel", labelId:"common.Tooltip_IcnUmpThumbsUp_UnSel" },
            { state:"Sel", labelId:"common.Tooltip_IcnUmpThumbsUp_Sel" }
        ],
        appData : "thumbsup",
        labelId : "ThumbsUp",
        selectCallback : this._umpSelectCallback.bind(this)
    };

    umpButtonConfig["favorite"] =
    {
        index : 4,
        buttonBehavior : "shortPressOnly",
        disabled : false,
        imageBase : "apps/stitcher/images/IcnUmpFavorite",
        currentState:"Unfavorite",
        stateArray: [
            { state:"Unfavorite", labelId:"common.Tooltip_IcnUmpFavorite_Unfavorite" },
            { state:"Favorite", labelId:"common.Tooltip_IcnUmpFavorite_Favorite" }
        ],
        appData : "favorite",
        labelId : "Favorite",
        selectCallback : this._umpSelectCallback.bind(this),
    };

    umpButtonConfig["rewind"] =
    {
        index : 5,
        buttonBehavior : "shortPressOnly",
        disabled : false,
        imageBase : "IcnUmpBack30s",
        appData : "rewind",
        selectCallback : this._umpSelectCallback.bind(this)
    };

    umpButtonConfig["playpause"] =
    {
        index : 6,
        buttonBehavior : "shortPressOnly",
        disabled : false,
        imageBase : "IcnUmpPlayPause",
        currentState:"Play",
        stateArray: [
            { state:"Play" },
            { state:"Pause" }
        ],
        appData : "playpause",
        selectCallback : this._umpSelectCallback.bind(this)
    };

    umpButtonConfig["next"] =
    {
        index : 7,
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpNextAudio",
        disabled : false,
        appData : "next",
        selectCallback : this._umpSelectCallback.bind(this),
    };

    umpButtonConfig["settings"] =
    {
        index : 8,
        buttonBehavior : "shortPressOnly",
        disabled : false,
        imageBase : "IcnUmpEqualizer",
        appData : "settings",
        selectCallback : this._umpSelectCallback.bind(this)
    };
    //@formatter:on


    /*
     * ===================
     * DATALISTS
     * ===================
     */


    /*
     * ===================
     * CONTEXT TABLE
     * ===================
     */
    //@formatter:off
    this._contextTable = {

        /*
         * Show loading splash image
         * This context is automatically cleared
         */
        "Loading" : {
            sbNameId : "sbNameId",
            sbNameIcon : "common/images/icons/IcnSbnEnt.png",
            template : "Dialog3Tmplt",
            controlProperties : {
                Dialog3Ctrl : {
                    contentStyle : "style09",
                    fullScreen : false,
                    buttonCount : 1,
                    buttonConfig : {
                        button1 : {
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            labelId: "entMenu",
                            appData : "source",
                        }
                    },
                    imagePath1 : "apps/stitcher/images/Stitcher.png",
                    meter : { meterType : "indeterminate", meterPath : "common/images/IndeterminateMeter.png" },
                    defaultSelectCallback : this._dialogSelectCallback.bind(this),
                }
            },
        }, // end of "Loading"

        /*
         * Main playing context
         * All the buttons configuration
         * is received in a PlayerStatus message
         */
        "NowPlayingOnDemand" : {
            sbNameId : "sbNameId",
            sbNameIcon : "common/images/icons/IcnSbnEnt.png",
            template : "NowPlaying4Tmplt",
            leftBtnStyle : "menuUp",
            controlProperties : {
                NowPlayingCtrl : {

                    // style
                    ctrlStyle : 'Style2',

                    // title and metadata
                    ctrlTitleObj : null,
                    audioTitleObj : null,
                    detailLine1Obj : null,
                    detailLine2Obj : null,
                    detailLine3Obj : null,
                    artworkImagePath : null,

                    // ump
                    umpConfig : {
                        // scrubber
                        hasScrubber : true,
                        scrubberConfig : scrubberConfig,
                        // buttons
                        retracted : false,
                        buttonConfig : umpButtonConfig,
                        // callbacks
                        defaultSelectCallback : this._umpSelectCallback.bind(this),
                        defaultLongPressCallback : null,
                        defaultSlideCallback : null,
                        defaultHoldStartCallback : null,
                        defaultHoldStopCallback : null,
                        defaultFocusCallback : null,
                    }
                }
            },
            contextInFunction : this._NowPlayingOnDemandIn.bind(this),
            readyFunction : this._NowPlayingOnDemandReady.bind(this),
        }, // end of "NowPlaying"

        /*
         * Top-level listing
         * Entry point for the sublevels
         */
        "StationList" : {
            sbNameId : "sbNameId",
            sbNameIcon : "common/images/icons/IcnSbnEnt.png",
            template : "List2Tmplt",
            leftBtnStyle : "menuUp",
            controlProperties: {
                List2Ctrl : {
                    thickItems : false,
                    numberedList : true,
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',
                        text1Id : 'Browse',
                    },
                    selectCallback : this._listSelectCallback.bind(this),
                    needDataCallback : this._listNeedDataCallback.bind(this)
                }
            },
            contextInFunction : this._StationListIn.bind(this),
            contextOutFunction : this._StationListLeave.bind(this),
            readyFunction : this._StationListReady.bind(this),
            displayedFunction : this._StationListDisplayed.bind(this)
        }, // end of "StationList"

        /*
         * Add show to favorites
         */
        "ManageCustomFavorites" : {
            sbNameId : "sbNameId",
            sbNameIcon : "common/images/icons/IcnSbnEnt.png",
            template : "List2Tmplt",
            leftBtnStyle : "goBack",
            controlProperties : {
                List2Ctrl : {
                    thickItems : false,
                    numberedList : true,
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',
                        text1Id : 'SlectTheStations',
                    },
                    selectCallback : this._listSelectCallback.bind(this)
                }
            },
            readyFunction : this._ManageCustomFavoritesReady.bind(this)
        }, // end of "ManageCustomFavorites"

        /*
         * This context shows the user some info of the
         * nature of the error.
         */
        "ErrorCondition" : {
            sbNameId : "sbNameId",
            sbNameIcon : "common/images/icons/IcnSbnEnt.png",
            template : "Dialog3Tmplt",
            controlProperties : {
                Dialog3Ctrl : {
                    defaultSelectCallback :  this._dialogSelectCallback.bind(this),
                    contentStyle : "style02",
                    titleStyle : "titleStyle01",
                    fullScreen : false,
                    buttonCount : 1,
                    buttonConfig : {
                        button1 : {
                            labelId : "common.Ok",
                            appData : "ok",
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly"
                        }
                    }
                }
            },
            readyFunction : this._ErrorConditionReady.bind(this)
        } // end of "ErrorCondition"

    }; // end of this._contextTable
    //@formatter:on


    /*
     * ===================
     * MESSAGE TABLE AND MESSAGE CACHE
     * ===================
     */
    //@formatter:off
    this._messageTable = {
        "StationList" : this._StationListMsgHandler.bind(this),         // received in StationList
        "CategoryList" : this._CategoryListMsgHandler.bind(this),       // received in StationList
        "ShowList" : this._ShowListMsgHandler.bind(this),               // received in StationList
        "EmptyList" : this._EmptyListHandler.bind(this),                // received in StationList

        "ShowStationInfo" : this._ShowStationInfoMsgHandler.bind(this), // received in NowPlayingOnDemand
        "PlayerStatus" : this._PlayerStatusMsgHandler.bind(this),       // received in NowPlayingOnDemand
        "ElapsedTime" : this._ElapsedTimeMsgHandler.bind(this),         // received in NowPlayingOnDemand
        "ShowInfo" : this._ShowInfoMsgHandler.bind(this),               // received in NowPlayingOnDemand
        "ShowArt" : this._ShowArtMsgHandler.bind(this),                 // received in NowPlayingOnDemand

        "FavStationsList" : this._FavStationsListHandler.bind(this),    // received in ManageCustomFavorites

        "TimedSbn_ErrorCondition" : this._TimedSbnHandler.bind(this),   // received when not in focus
        "TimedSbn_ShowInfo" : this._TimedSbnHandler.bind(this),         // received when not in focus
        "TimedSbn_AddFavoriteFailure" : this._TimedSbnHandler.bind(this),       // received when not in focus
        "TimedSbn_RemoveFavoriteFailure" : this._TimedSbnHandler.bind(this),    // received when not in focus
        "TimedSbn_ThumbsDownFailure" : this._TimedSbnHandler.bind(this),        // received when not in focus
        "TimedSbn_ThumbsUpFailure" : this._TimedSbnHandler.bind(this),          // received when not in focus
		"SBN_ShowThumbsInfo" : this._TimedSbnHandler.bind(this),
    }; // end of this._messageTable
    //@formatter:on

    // message cache
    this._cachedList = null;
    this._cachedShowStationInfo = null;
    this._cachedPlayerStatus = null;
    this._cachedElapsedTime = null;
    this._cachedShowInfo = null;
    this._cachedShowArt = null;
    this._cachedFavStationsList = null;

};

/**************************
 * Stitcher App Functions *
 **************************/



/**************************
 * Context handlers
 **************************/
// StationList Context
stitcherApp.prototype._StationListIn = function()
{
    // deprecated
};
stitcherApp.prototype._StationListReady = function(restoreData)
{
    // define vars
    var parentId = 0;
    var title = '';
    var requestIndex = 0;
    var currentList = this._currentContextTemplate.list2Ctrl;
    var fromMenuUp = false;
    var requestAdjust = 7;

    // get parent id and title from context payload
    if (this._hasContextPayload())
    {
        var contextPayload = this._getContextPayload();
        parentId = contextPayload.parentId;
        title = contextPayload.title;

        // set title
        var titleObj = {
            text1 : title,
            text1Id : ('' === title) ? 'Browse' : null,
            titleStyle : 'style02',
        };
        currentList.setTitle(titleObj);

        // check wheter we are entering after menuUp action
        fromMenuUp = contextPayload.fromMenuUp;
    }

    // make list request from where we left off
    // when we have goBack to upper level (hasFocus determines this)
    if (restoreData)
    {
        if (restoreData.templateContextCapture && // valid context capture
            restoreData.templateContextCapture.controlData && // valid control data
            restoreData.templateContextCapture.controlData.topItem >= 0 && // valid top item
            restoreData.templateContextCapture.controlData.hasFocus) // list had previously focus
        {
            // create request index
            requestIndex = Math.max(restoreData.templateContextCapture.controlData.topItem-requestAdjust, 0);
        }
    }
    // when we have menuUp to upper level
    else if (fromMenuUp)
    {
        var stackEntry = this._getContextStackEntry();
        if (null != stackEntry)
        {
            // preset focus position
            log.info('Setting scroll position: ', stackEntry.focussedItem, stackEntry.scrollTo);
            currentList.properties.focussedItem = stackEntry.focussedItem;
            currentList.properties.scrollTo = stackEntry.scrollTo;
            this._removeFromContextStack();
        }
        else
        {
            // reset everything to default
            log.info('Resetting: ', 0, 0);
            currentList.properties.focussedItem = 0;
            currentList.properties.scrollTo = 0;
        }

        // create requet index
        requestIndex = Math.max(currentList.properties.scrollTo-requestAdjust, 0);
    }
    else
    {
        // reset everything to default
        log.info('Resetting: ', 0, 0);
        currentList.properties.focussedItem = 0;
        currentList.properties.scrollTo = 0;
    }

    // request list
    framework.sendEventToMmui(this.uiaId, "RequestMore", { payload : {index : requestIndex, count : this._requestSize, parentId : parentId, name : title} });
};
stitcherApp.prototype._StationListDisplayed = function()
{
    // update list
    this._populateStationListByRequestId();
};
stitcherApp.prototype._StationListLeave = function()
{
    // deprecated
};

// NowPlayingOnDemand Context
stitcherApp.prototype._NowPlayingOnDemandIn = function()
{
    // deprecated
};
stitcherApp.prototype._NowPlayingOnDemandReady = function()
{
    log.debug("_NowPlayingOnDemandReady called...");

    // update player status
    if (this._cachedPlayerStatus)
    {
        this._updatePlayerStatus(this._cachedPlayerStatus);
    }

    // update elapsed time
    if (this._cachedElapsedTime)
    {
        this._updateElapsedTime(this._cachedElapsedTime);
    }

    // update now playing title
    if (this._cachedShowStationInfo)
    {
        this._updateNowPlayingTitle(this._cachedShowStationInfo);
    }

    // update show image
    this._updateShowArt(this._cachedShowArt);

};

// ManageCustomFavorites Context
stitcherApp.prototype._ManageCustomFavoritesReady = function()
{
    log.debug("_ManageCustomFavoritesReady called...");

    // populate ManageCustomFavorites
    if (this._cachedFavStationsList)
    {
        this._populateManageCustomFavorites(this._cachedFavStationsList);
    }
};

// ErrorCondition Context
stitcherApp.prototype._ErrorConditionReady = function()
{
    log.debug("_ErrorConditionReady called...");

    // update now playing title
    if (this._hasContextPayload())
    {
        // get context payload
        var contextPayload = this._getContextPayload();

        // update text
        this._updateErrorCondition(contextPayload);

    }
};


/**************************
 * Message handlers
 **************************/

// StationList
stitcherApp.prototype._StationListMsgHandler = function(msg)
{
    log.debug("StationList received", msg);

    // ensure proper payload structure
    if (!msg.params.payload)
        return;

    // store
    this._cachedList = msg.params.payload.stationList;

    // update list
    this._populateStationListByRequestId();
};

// CategoryList
stitcherApp.prototype._CategoryListMsgHandler = function(msg)
{
    log.debug("CategoryList received", msg);

    // ensure proper payload structure
    if (!msg.params.payload)
        return;

    // store
    this._cachedList = msg.params.payload.stationList;

    // update list
    this._populateStationListByRequestId();
};

// ShowList
stitcherApp.prototype._ShowListMsgHandler = function(msg)
{
    log.debug("ShowList received", msg);

    // ensure proper payload structure
    if (!msg.params.payload)
        return;

    // store
    this._cachedList = msg.params.payload.stationList;

    // update list
    this._populateStationListByRequestId();
};

// EmptyList
stitcherApp.prototype._EmptyListHandler = function(msg)
{
    log.debug("EmptyList received", msg);

    // empty the list
    if (this._currentContext && this._currentContextTemplate && "StationList" === this._currentContext.ctxtId)
    {
        this._currentContextTemplate.list2Ctrl.setDataList({});
        this._currentContextTemplate.list2Ctrl.setLoading(false);
    }
};

// ShowStationInfo
stitcherApp.prototype._ShowStationInfoMsgHandler = function(msg)
{
    log.debug("ShowStationInfo received", msg);

    // store
    this._cachedShowStationInfo = msg.params.payload.showStation;

    // update
    if (this._currentContext && this._currentContextTemplate && "NowPlayingOnDemand" === this._currentContext.ctxtId)
    {
        this._updateNowPlayingTitle(this._cachedShowStationInfo);
    }
};

// PlayerStatus
stitcherApp.prototype._PlayerStatusMsgHandler = function(msg)
{
    log.debug("PlayerStatus received", msg);

    // ensure proper payload structure
    if (!msg.params.payload)
        return;

    // store
    this._cachedPlayerStatus = msg.params.payload;

    // set player state
    switch (msg.params.payload.playingStatus)
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
    }

    // update
    if (this._currentContext && this._currentContextTemplate && "NowPlayingOnDemand" === this._currentContext.ctxtId)
    {
        this._updatePlayerStatus(this._cachedPlayerStatus);
    }
};

// ElapsedTime
stitcherApp.prototype._ElapsedTimeMsgHandler = function(msg)
{
    log.debug("ElapsedTime received", msg);

    // ensure proper payload structure
    if (!msg.params.payload)
        return;

    // store
    this._cachedElapsedTime = msg.params.payload;

    // update
    if (this._currentContext && this._currentContextTemplate && "NowPlayingOnDemand" === this._currentContext.ctxtId)
    {
        this._updateElapsedTime(this._cachedElapsedTime);
    }
};

// ShowInfo
stitcherApp.prototype._ShowInfoMsgHandler = function(msg)
{
    log.debug("ShowInfo received", msg);

    // ensure proper payload structure
    if (!msg.params.payload)
        return;

    // set default image on new show
    if (this._cachedShowInfo && msg.params.payload.show.name != this._cachedShowInfo.name)
    {
        this._cachedShowArt = null;
    }

    // store new show info
    this._cachedShowInfo = msg.params.payload.show;

    // update
    if (this._currentContext && this._currentContextTemplate && "NowPlayingOnDemand" === this._currentContext.ctxtId)
    {
        this._updateShowArt(this._cachedShowArt);
        this._updateBuffering();
    }
};

// ShowArt
stitcherApp.prototype._ShowArtMsgHandler = function(msg)
{
    log.debug("ShowArt received", msg);

    // ensure proper payload structure
    if (!msg.params.payload)
        return;

    // store
    this._cachedShowArt = msg.params.payload.path;

    // update
    if (this._currentContext && this._currentContextTemplate && "NowPlayingOnDemand" === this._currentContext.ctxtId)
    {
        this._updateShowArt(this._cachedShowArt);
    }
};

// FavStationsList
stitcherApp.prototype._FavStationsListHandler = function(msg)
{
    log.debug("FavStationsList", msg);

    // ensure proper payload structure
    if (!msg.params.payload)
        return;

    // store
    this._cachedFavStationsList = msg.params.payload;

    // update
    if (this._currentContext && this._currentContextTemplate && "ManageCustomFavorites" === this._currentContext.ctxtId)
    {
        this._populateManageCustomFavorites(this._cachedFavStationsList);
    }
};


/**************************
 * SBN Handlers
 **************************/
stitcherApp.prototype._TimedSbnHandler = function(msg)
{
    log.debug("_TimedSbnHandler called...");
    log.debug("    SBN: ", msg);

    switch (msg.msgId)
    {
        case 'TimedSbn_ErrorCondition' :

            var errorStringId = 'MobileDeviceError';
            switch (msg.params.payload.errorID)
            {
                case 'MobileDeviceError' :
                    errorStringId = 'MobileDeviceError';
                    break;

                case 'NoConnection' : // TODO: Check translation for this (not defined in the UI Flow)
                case 'ConnectionLost' :
                    errorStringId = 'ConnectionLost';
                    break;
            }
            // framework.common.cancelTimedSbn('stitcher', 'TimedSbn_ErrorCondition', 'errorNotification');
            framework.common.startTimedSbn('stitcher', 'TimedSbn_ErrorCondition', 'errorNotification', {
                sbnStyle : 'Style01',
                text1Id : errorStringId
            });
            break;

        case 'TimedSbn_ShowInfo' :
            // framework.common.cancelTimedSbn('stitcher', 'TimedSbn_ShowInfo', 'entertainmentInfo');
            framework.common.startTimedSbn('stitcher', 'TimedSbn_ShowInfo', 'typeE', {
                sbnStyle : 'Style02',
                imagePath1 : 'common/images/icons/IcnSbnEnt.png',
                text1Id : "system.StitcherItem",
				text2 : msg.params.payload.name,
            });
            break;
		case 'SBN_ShowThumbsInfo' :
            // framework.common.cancelTimedSbn('stitcher', 'TimedSbn_ShowInfo', 'entertainmentInfo');
			if(msg.params.payload.thumbsUp === true)
			{
            framework.common.startTimedSbn('stitcher', 'SBN_ShowThumbsInfo', 'typeE', {
                sbnStyle : 'Style02',
                imagePath1 : 'common/images/icons/IcnSbnEnt.png',
                text1Id : "system.StitcherItem",
				text2 : framework.localize.getLocStr(this.uiaId, "like"),
				}
            );
			}
			else if(msg.params.payload.thumbsDown === true)
			{
            framework.common.startTimedSbn('stitcher', 'SBN_ShowThumbsInfo', 'typeE', {
                sbnStyle : 'Style02',
                imagePath1 : 'common/images/icons/IcnSbnEnt.png',
                text1Id : "system.StitcherItem",
				text2 : framework.localize.getLocStr(this.uiaId, "dislike"),
				}
            );
			}
			break;
        case 'TimedSbn_AddFavoriteFailure' :
            // framework.common.cancelTimedSbn('stitcher', 'TimedSbn_AddFavoriteFailure', 'entertainmentInfo');
            framework.common.startTimedSbn('stitcher', 'TimedSbn_AddFavoriteFailure', 'entertainmentInfo', {
                sbnStyle : 'Style01',
                text1Id : 'Global_UnableToAddFavorite',
            });
            break;

        case 'TimedSbn_RemoveFavoriteFailure' :
            // framework.common.cancelTimedSbn('stitcher', 'TimedSbn_RemoveFavoriteFailure', 'entertainmentInfo');
            framework.common.startTimedSbn('stitcher', 'TimedSbn_RemoveFavoriteFailure', 'entertainmentInfo', {
                sbnStyle : 'Style01',
                text1Id : 'Global_UnableToRemoveFavorite',
            });
            break;

        case 'TimedSbn_ThumbsUpFailure' :
            // framework.common.cancelTimedSbn('stitcher', 'TimedSbn_ThumbsUpFailure', 'entertainmentInfo');
            framework.common.startTimedSbn('stitcher', 'TimedSbn_ThumbsUpFailure', 'entertainmentInfo', {
                sbnStyle : 'Style01',
                text1Id : 'Global_UnableToAddRating',
            });
            break;

        case 'TimedSbn_ThumbsDownFailure' :
            // framework.common.cancelTimedSbn('stitcher', 'TimedSbn_ThumbsDownFailure', 'entertainmentInfo');
            framework.common.startTimedSbn('stitcher', 'TimedSbn_ThumbsDownFailure', 'entertainmentInfo', {
                sbnStyle : 'Style01',
                text1Id : 'Global_UnableToAddRating',
            });
            break;
    }
};

/**************************
 * Control callbacks
 **************************/

// List Select Callback
stitcherApp.prototype._listSelectCallback = function(listCtrlObj, appData, params)
{
    log.debug("_listSelectCallback called...");
    log.debug("   for context" + this._currentContext.ctxtId);
    log.debug("   appData: "+ appData + ' appData: '+ params);

    switch (this._currentContext.ctxtId)
    {
        case "StationList" :
            if (appData)
            {
                // add to stack
                this._addToContextStack(listCtrlObj);

                framework.sendEventToMmui(this.uiaId, "SelectStation", { payload : {id : appData.id, name : appData.name, index:params.itemIndex} }, params.fromVui);

                // clear any cached list
                this._cachedList = null;
            }
            break;

        case "ManageCustomFavorites" :
            if ('save' === appData)
            {
                framework.sendEventToMmui(this.uiaId, "SaveFavorites", null, params.fromVui);
            }
            else
            {
            	this._toggleTick(listCtrlObj, params.itemIndex);
                framework.sendEventToMmui(this.uiaId, "SelectStation", { payload : {id : appData.stationId, name : appData.stationName} }, params.fromVui);
            }
            break;

        default :
            log.warn("Unknown context", this._currentContext.ctxtId);
            break;
    }
};
// EOF: List Select Callback


// List Need Data Callback
stitcherApp.prototype._listNeedDataCallback = function(index)
{
    log.debug("_listNeedDataCallback called...");
    log.debug("   index: "+ index);

    // get parent id and title
    var parentId = 0;
    var title = '';
    if (this._hasContextPayload())
    {
        var contextPayload = this._getContextPayload();
        parentId = contextPayload.parentId;
        title = contextPayload.title;
    }

    // request more data
    framework.sendEventToMmui(this.uiaId, "RequestMore", { payload : {index : index, count : this._requestSize, parentId : parentId, name : title} });
};
// EOF: List Select Callback


// UMP Control
stitcherApp.prototype._umpSelectCallback = function(umpCtrlObj, appData, params)
{
    log.debug("_umpSelectCallback called...", appData);
    switch (appData)
    {
        case 'source':
            framework.sendEventToMmui(this.uiaId, "SelectSource");
            break;

        case 'stationlist':
            framework.sendEventToMmui(this.uiaId, "SelectStationList");
            break;

        case 'thumbsdown':
            framework.sendEventToMmui(this.uiaId, "ThumbsDown");
            break;

        case 'thumbsup':
            framework.sendEventToMmui(this.uiaId, "ThumbsUp");
            break;

        case 'favorite':
            framework.sendEventToMmui(this.uiaId, "FavoriteThis");
            break;

        case "playpause":
            if (params.state == "Play")
            {
                if(this._umpCtrlButtonSettleTime == null)
                {
                    this._umpCtrlButtonSettleTime = setTimeout(function() { framework.sendEventToMmui("Common", "Global.Pause")}.bind(this), 250);
                }
                else
                {
                    clearTimeout(this._umpCtrlButtonSettleTime);
                    this._umpCtrlButtonSettleTime = setTimeout(function() { framework.sendEventToMmui("Common", "Global.Pause")}.bind(this), 250);
                }
            }
            else if (params.state == "Pause")
            {
                if(this._umpCtrlButtonSettleTime == null)
                {
                    this._umpCtrlButtonSettleTime = setTimeout(function() { framework.sendEventToMmui("Common", "Global.Resume")}.bind(this), 250);
                }
                else
                {
                    clearTimeout(this._umpCtrlButtonSettleTime)
                    this._umpCtrlButtonSettleTime = setTimeout(function() { framework.sendEventToMmui("Common", "Global.Resume")}.bind(this), 250);
                }
            }
            // Note: Play/Pause button is automatically updated by the control
            break;

        case "next":
            framework.sendEventToMmui(this.uiaId, "Skip");
            break;

        case "rewind":
            framework.sendEventToMmui("Common", "Global.Rewind");
            break;

        case "settings":
            framework.sendEventToMmui(this.uiaId, "SelectSettings");
            break;

        default:
            log.warn('Unrecognized UMP button selected', appData);
    }
};
// EOF: UMP Control


// Dialog Control
stitcherApp.prototype._dialogSelectCallback = function(dialogBtnCtrlObj, appData, params)
{
    log.debug("_dialogSelectCallback called. appData: ", appData);

    switch (this._currentContext.ctxtId)
    {
        case 'ErrorCondition' :
            if ("ok" === appData)
            {
                framework.sendEventToMmui("Common", "Global.Yes");
            }
            break;
        case "Loading":
            if ("source" === appData)
            {
                framework.sendEventToMmui(this.uiaId, "SelectSource");
            }
            break;
        default :
            // nothing to do
            break;

    }

};
// EOF: Dialog Control



/**************************
 * Helper functions
 **************************/

// Populate StationList
stitcherApp.prototype._populateStationList = function(itemsList)
{
    // extract data of interest
    var currList = this._currentContextTemplate.list2Ctrl;
    var list = itemsList.list;
    var count = itemsList.count;
    var totalCount = itemsList.totalCount;
    var offset = itemsList.currentIndex;

    // decide whether to set the datalist or update it
    if (!currList.hasDataList())
    {

        // the dataList
        var dataList = {
            itemCountKnown : true,
            itemCount : totalCount,
            items : [],
            vuiSupport : true,
        };

        // are we not in the beginning?
        if (offset > 0)
        {
            // create empty datalist
            for (var i=0; i<totalCount; i++)
            {
                // and fill only the received items
                if (i>=offset && i<offset+count)
                {
                    dataList.items[dataList.items.length] = {
                        appData : { id : list[i-offset].id, name : list[i-offset].name },
                        text1 : list[i-offset].name,
                        itemStyle : 'style02',
                        hasCaret : (list[i-offset].hasContents) ? true : false,
                    };
                }
                // otherwise add empty items (they will be requested as the user scrolls)
                else
                {
                    dataList.items[dataList.items.length] = { appData : null, text1 : '', itemStyle : 'style02', hasCaret : false };
                }
            }
        }

        // no, we are in the beginning
        else
        {
            // fil the first <count> elements
            for (var i=0; i<count; i++)
            {
                dataList.items[dataList.items.length] = {
                    appData : { id : list[i].id, name : list[i].name },
                    text1 : list[i].name,
                    itemStyle : 'style02',
                    hasCaret : (list[i].hasContents) ? true : false,
                };
            }
        }

        // set datalist and update everything
        currList.setDataList(dataList);

        // NOTE: This needs to be handled in the List control

        // perform focussed index recovery if it at the bottom
        var performRecovery = false;
        if (currList.properties.focussedItem == dataList.itemCount-1)
        {
            currList.properties.focussedItem--;
            performRecovery = true;
        }

        currList.updateItems(0, dataList.itemCount-1);

        // recover focus
        if (performRecovery)
        {
            currList.properties.focussedItem++;
            currList.focussedItem = currList.properties.focussedItem;
        }

        setTimeout(function() {
            currList.focussedItem = currList.properties.focussedItem;
        }, 10);
    }

    // we already have data -> update the new items
    else
    {
        // update the new items
        for (var i=offset; i<offset+count; i++)
        {
            currList.dataList.items[i] = {
                appData : { id : list[i-offset].id, name : list[i-offset].name },
                text1 : list[i-offset].name,
                itemStyle : 'style02',
                hasCaret : (list[i-offset].hasContents) ? true : false,
            };
        }
        currList.updateItems(offset, (offset+count)-1);
    }

};

// Populate ManageCustomFavorites
stitcherApp.prototype._populateManageCustomFavorites = function(itemsList)
{
    var items = [];
    var dataList = {};

    // add save item
    items.push({
        appData : 'save',
        text1Id : 'SaveChanges',
        itemStyle : 'style01',
        hasCaret : false,
    });

    // Favorites
    for (var i = 0; i < itemsList.list.length; i++)
    {
        // filter empty items
        if ('' === itemsList.list[i].stationName)
        {
            break;
        }

        items.push({
            appData : { stationId : itemsList.list[i].stationId, stationName : itemsList.list[i].stationName },
            text1 : itemsList.list[i].stationName,
            image1 : '',
            itemStyle : 'style01',
            hasCaret : false,
        });
    }

    dataList['itemCountKnown'] = true;
    dataList['itemCount'] = items.length;
    dataList['items'] = items;
    dataList['vuiSupport'] = true;

    this._currentContextTemplate.list2Ctrl.setDataList(dataList);
    this._currentContextTemplate.list2Ctrl.updateItems(0, dataList.itemCount-1);
};

stitcherApp.prototype._toggleTick = function(listCtrl, itemIndex)
{
	var currentImage = listCtrl.dataList.items[itemIndex].image1;
	if (currentImage !== '')
	{
		listCtrl.dataList.items[itemIndex].image1 = '';
	}
	else
	{
		listCtrl.dataList.items[itemIndex].image1 = 'common/images/icons/IcnListCheckmark.png';
	}
	listCtrl.updateItems(itemIndex, itemIndex);
};

/*
 * Update PlayerStatus
 * Ths updates the UMP buttons to their respective state
 * reported by the MMUI in the PlayerStatus msg
 */
stitcherApp.prototype._updatePlayerStatus = function(status)
{
    // check buffering status
    var bufferingState = this._updateBuffering();
    if ('no' !== bufferingState)
    {
        return;
    }

    var currNpCtrl = this._currentContextTemplate.nowPlaying4Ctrl;

    // update play/pause status
    if (this._playerState != 'playing' && this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.properties.buttonConfig["playpause"].currentState != "Play")
    {
        this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonState('playpause', 'Play');
    }
    else if (this._playerState === 'playing' && this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.properties.buttonConfig["playpause"].currentState != "Pause")
    {
        this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonState('playpause', 'Pause');
    }

    // set thumbs disabled state
    if (1 == status.thumbsEnabled)
    {
        currNpCtrl.umpCtrl.setButtonDisabled('thumbsdown', false);
        currNpCtrl.umpCtrl.setButtonDisabled('thumbsup', false);
    }
    else
    {
        currNpCtrl.umpCtrl.setButtonDisabled('thumbsdown', true);
        currNpCtrl.umpCtrl.setButtonDisabled('thumbsup', true);
    }


    // set thumbs selected state
    switch (status.thumbs)
    {
        case '' :
            currNpCtrl.umpCtrl.setButtonState('thumbsdown', 'UnSel');
            currNpCtrl.umpCtrl.setButtonState('thumbsup', 'UnSel');
            break;
        case 'UP' :
            currNpCtrl.umpCtrl.setButtonState('thumbsdown', 'UnSel');
            currNpCtrl.umpCtrl.setButtonState('thumbsup', 'Sel');
		    break;
        case 'DOWN' :
            currNpCtrl.umpCtrl.setButtonState('thumbsdown', 'Sel');
            currNpCtrl.umpCtrl.setButtonState('thumbsup', 'UnSel');
            break;
    }

    // set favorites selected state
    if (status.favorites)
    {
        currNpCtrl.umpCtrl.setButtonState('favorite', 'Favorite');
    }
    else
    {
        currNpCtrl.umpCtrl.setButtonState('favorite', 'Unfavorite');
    }

    // set favorites disabled state
    if (1 == status.favoritesEnabled)
    {
        currNpCtrl.umpCtrl.setButtonDisabled('favorite', false);
    }
    else
    {
        currNpCtrl.umpCtrl.setButtonDisabled('favorite', true);
    }

    // set rewind disabled state
    if (1 == status.rewindEnabled)
    {
        currNpCtrl.umpCtrl.setButtonDisabled('rewind', false);
    }
    else
    {
        currNpCtrl.umpCtrl.setButtonDisabled('rewind', true);
    }

    // set next disabled state
    if (1 == status.nextEnabled)
    {
        currNpCtrl.umpCtrl.setButtonDisabled('next', false);
    }
    else
    {
        currNpCtrl.umpCtrl.setButtonDisabled('next', true);
    }

    // remove play pause disabled state
    currNpCtrl.umpCtrl.setButtonDisabled('playpause', false);

};

// Update ElapsedTime
stitcherApp.prototype._updateElapsedTime = function(time)
{
    // time : { "totalTime":4981, elapsedTime":24 }

    // ignore any elapsed time updates if we have full buffering
    if ('full' === this._bufferingLevel)
    {
        return;
    }

    var currentUmpCtrl = this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl;

    var totalTime = parseInt(time.totalTime);
    var elapsedTime = parseInt(time.elapsedTime);
    var progress = 0;

    if (totalTime > 0)
    {
        progress = elapsedTime / totalTime;
    }

    currentUmpCtrl.setElapsedTime(this._formatTime(time.elapsedTime));
    currentUmpCtrl.setTotalTime(this._formatTime(time.totalTime));
    currentUmpCtrl.updateScrubber(progress);

};

stitcherApp.prototype._updateNowPlayingTitle = function(title)
{
    var currNpCtrl = this._currentContextTemplate.nowPlaying4Ctrl;
    currNpCtrl.setCtrlTitle({
        ctrlTitleId : null,
        ctrlTitleText : title,
        ctrlTitleIcon : null,
    });
};

// Update ShowInfo
stitcherApp.prototype._updateShowInfo = function(info)
{
    // validate input
    if (!info)
        return;

    var currNpCtrl = this._currentContextTemplate.nowPlaying4Ctrl;
    var durationMinutes = Math.floor(info.duration / 60);
    var durationSeconds = info.duration % 60;
    durationSeconds = (durationSeconds < 10) ? '0' + durationSeconds : durationSeconds; // add leading 0

    // set audio title -> show name
    currNpCtrl.setAudioTitle({
        audioTitleText : info.name,
        audioTitleIcon : null,
    });

    // set detail line 1 -> show age
    currNpCtrl.setDetailLine1({
        detailText: info.age,
    });

    // set detail line 2 -> show duration
    currNpCtrl.setDetailLine2({
        detailTextId : 'ShowDuration',
        subMap : { duration : durationMinutes + ':' + durationSeconds },
    });
};

// Update ShowArt
stitcherApp.prototype._updateShowArt = function(path)
{
    log.debug("_updateShowArt called...");

    // counter any cache
    var path = (null == path || "" == path) ? null : path + '?' + new Date().getTime();

    var currNpCtrl = this._currentContextTemplate.nowPlaying4Ctrl;
    currNpCtrl.setArtworkImagePath(path);
};

/**
 * Update Buffering
 * @return {string} - no, partial, full
 */
stitcherApp.prototype._updateBuffering = function()
{
    var level = null;

    // validate context
    if (!this._currentContext || !this._currentContextTemplate || "NowPlayingOnDemand" !== this._currentContext.ctxtId)
    {
        this._bufferingLevel = level;
        return level;
    }

    // determine level
    if (this._cachedShowInfo && '' === this._cachedShowInfo.name)
    {
        level = 'full';
    }
    else if (this._cachedShowInfo && '' !== this._cachedShowInfo.name && 'buffering' === this._playerState)
    {
        level = 'partial';
    }
    else
    {
        level = 'no';
    }

    // get current NP control
    var currNpCtrl = this._currentContextTemplate.nowPlaying4Ctrl;

    switch (level)
    {
        case 'full' :

            // set loading string
            currNpCtrl.setAudioTitle({
                audioTitleId : 'common.Loading',
                audioTitleIcon : null,
            });

            // clear detail line 1 and 2
            currNpCtrl.setDetailLine1({ detailTextId : null, detailText: '', detailIcon : null });
            currNpCtrl.setDetailLine2({ detailTextId : null, detailText: '', detailIcon : null });

            // disable buttons preventing invalid user input
            currNpCtrl.umpCtrl.setButtonDisabled('thumbsdown', true);
            currNpCtrl.umpCtrl.setButtonDisabled('thumbsup', true);
            currNpCtrl.umpCtrl.setButtonDisabled('favorite', true);
            currNpCtrl.umpCtrl.setButtonDisabled('rewind', true);
            currNpCtrl.umpCtrl.setButtonDisabled('playpause', true);
            currNpCtrl.umpCtrl.setButtonDisabled('next', true);

            // clear elapsed and total times
            currNpCtrl.umpCtrl.setElapsedTime(this._formatTime(0));
            currNpCtrl.umpCtrl.setTotalTime(this._formatTime(0));

            // set buffering state of the progress bar
            currNpCtrl.umpCtrl.setBuffering(true);

            break;

        case 'partial' :

            // update show info
            this._updateShowInfo(this._cachedShowInfo);

            // disable buttons preventing invalid user input
            currNpCtrl.umpCtrl.setButtonDisabled('thumbsdown', true);
            currNpCtrl.umpCtrl.setButtonDisabled('thumbsup', true);
            currNpCtrl.umpCtrl.setButtonDisabled('favorite', true);
            currNpCtrl.umpCtrl.setButtonDisabled('rewind', true);
            currNpCtrl.umpCtrl.setButtonDisabled('playpause', true);
            currNpCtrl.umpCtrl.setButtonDisabled('next', true);

            // set buffering state of the progress bar
            currNpCtrl.umpCtrl.setBuffering(true);

            break;

        case 'no' :

            // update show info
            this._updateShowInfo(this._cachedShowInfo);

            // remove buffering state of the progress bar
            currNpCtrl.umpCtrl.setBuffering(false);

            break;
    }

    this._bufferingLevel = level;
    return level;
};

// Update ErrorCondition
stitcherApp.prototype._updateErrorCondition = function(errorType)
{
    log.debug("_updateErrorCondition called...");

    switch (errorType.errorID)
    {
        /*
typedef enum MMUI_Stitcher_Possible_Errors_e
{
    MMUI_Stitcher_Possible_Errors_NoConnection,
    MMUI_Stitcher_Possible_Errors_ConnectionLost,
    MMUI_Stitcher_Possible_Errors_MobileDeviceError,
    MMUI_Stitcher_Possible_Errors_StitcherNotFound,
    MMUI_Stitcher_Possible_Errors_NotLoggedIn,
    MMUI_Stitcher_Possible_Errors_Invalid
} MMUI_Stitcher_Possible_Errors_t;
         */

        case 'NoConnection' :
        case 'ConnectionLost' :
            this._currentContextTemplate.dialog3Ctrl.setTitleId('ConnectionLost');
            this._currentContextTemplate.dialog3Ctrl.setText1Id('ConnectionLostDetails');
            break;

        case 'MobileDeviceError' :
            this._currentContextTemplate.dialog3Ctrl.setTitleId('MobileDeviceError');
            this._currentContextTemplate.dialog3Ctrl.setText1Id('MobileDeviceErrorDetails');
            break;

        case 'StitcherNotFound' :
            this._currentContextTemplate.dialog3Ctrl.setTitleId('StitcherNotFound');
            this._currentContextTemplate.dialog3Ctrl.setText1Id('StitcherNotFoundDetails');
            break;

        case 'NotLoggedIn' :
            this._currentContextTemplate.dialog3Ctrl.setTitleId('LoginFirst');
            this._currentContextTemplate.dialog3Ctrl.setText1Id('LoginFirstDetails');
            break;

        case 'DeviceDisconnect' :
            this._currentContextTemplate.dialog3Ctrl.setTitle(null);
            this._currentContextTemplate.dialog3Ctrl.setText1Id('BTAudioConnectionLost');
            break;

        default :
            this._currentContextTemplate.dialog3Ctrl.setTitleId('MobileDeviceError');
            this._currentContextTemplate.dialog3Ctrl.setText1Id('MobileDeviceErrorDetails');
            break;
    }
};


/**************************
 * Utilities
 **************************/

stitcherApp.prototype._addToContextStack = function(listCtrlObj)
{
    var scrollTo = 0;
    var focussedItem = 0;
    var title = '';
    var item = null;
    var itemCount = 0;

    // get title
    if (this._hasContextPayload())
    {
        var contextPayload = this._getContextPayload();
        var title = contextPayload.title;
    }

    // get current values
    if (listCtrlObj)
    {
        scrollTo = listCtrlObj.topItem;
        focussedItem = listCtrlObj.focussedItem;
        item = listCtrlObj.dataList.items[focussedItem];
        itemCount = listCtrlObj.dataList.itemCount;
    }

    // store
    this._contextStack[this._contextStack.length] = {
        title : title,
        scrollTo : scrollTo,
        focussedItem : focussedItem,
        item : item
    };

    // return
    return this._contextStack;
};

stitcherApp.prototype._removeFromContextStack = function()
{
    var entry = null;
    var title = '';

    // get context payload
    if (this._hasContextPayload())
    {
        var contextPayload = this._getContextPayload();
        title = contextPayload.title;
    }

    for (var i=0; i<this._contextStack.length; i++)
    {
        if (this._contextStack[i].title === title)
        {
            this._contextStack.splice(i,1);
            break;
        }
    }
    return this._contextStack;
};

stitcherApp.prototype._getContextStackEntry = function()
{
    var entry = null;
    var title = '';

    // get context payload
    if (this._hasContextPayload())
    {
        var contextPayload = this._getContextPayload();
        title = contextPayload.title;
    }

    for (var i=0; i<this._contextStack.length; i++)
    {
        if (this._contextStack[i].title === title)
        {
            entry = this._contextStack[i];
            break;
        }
    }
    return entry;
};

stitcherApp.prototype._hasContextPayload = function()
{
    return (this._currentContext.params && this._currentContext.params.payload);
};

stitcherApp.prototype._getContextPayload = function()
{
    return this._currentContext.params.payload;
};

/**
 * Get cached message by request id
 */
stitcherApp.prototype._populateStationListByRequestId = function()
{
    if (this._currentContext && this._currentContextTemplate && "StationList" === this._currentContext.ctxtId)
    {
        var requestId = '';

        if (this._hasContextPayload())
        {
            var contextPayload = this._getContextPayload();
            requestId = contextPayload.title;
        }

        if (this._cachedList && this._cachedList.hasOwnProperty('requestId') && this._cachedList.requestId == requestId)
        {
            var currentList = this._cachedList;
            this._populateStationList(currentList);
        }
    }
};

/**
 * Convert seconds to proper format
 * @param {integer} - seconds
 * @reutn {string} - formatted time string
 */
stitcherApp.prototype._formatTime = function (seconds)
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
};


/**************************
 * Framework register
 **************************/
framework.registerAppLoaded("stitcher", null, true);
