/*
 Copyright 2012 by Johnson Controls
__________________________________________________________________________

Filename: cdApp.js
__________________________________________________________________________
 Project: JCI-IHU
 Language: EN
 Author: apopoval
 Date: July 25.2012
 __________________________________________________________________________
 Description: IHU GUI System App
 Revisions:NowPlayingPanelCtrl
 v0.1 August 01, 2012 cdApp created for initial testing of active panel content
 v0.2 August 14, 2012 updated cdApp for Context table.
 v0.3 August 24, 2012 Updated app standard functions.
 v0.4 September 05, 2012 Changes in disk loading and content list.
 v0.5 September 11, 2012 Creating 2 nowplaying for CD and DataCD.
 v0.6 September 13, 2012 Implementing the cdApp with new GUI Baseline V.211.
 v0.7 October 08, 2012 Implementing the cdApp with new GUI Baseline V.0351
 v0.8 October 09, 2012 Changes in message handling due to new json file
 v0.9 November 07, 2012 Changes in populateNowPlaying2
 v1.0 November 15, 2012 Added DataCD buttonConfig
 v1.1 (16-Nov-2012) Added holdStartCallback and holdStopCallback functions
 v1.2 (23-Nov-2012) Removed RepeatFolder from _umpButtonConfigAudio
 v1.3 (26-Nov-2012) Added Scan active icon, using Global.SelectSettingsTab, disabled Tracklist button
 v1.4 (27-Nov-2012) Added handling for OperationStatus playing,paused and scan
 v1.5 (05-Dec-2012) Removed NowPlayingCtxtOut function causing Play/Pause button misbehaviour
 v1.6 (14-Dec-2012) Removed scrubber
 v1.7 (21-Dec-2012) Changed RepeatDisk to RepeatTrack, switched shuffle and repeat buttons places in NowPlaying DataCD
 v1.8 (04-Jan-2013) Added status bar notifications
 v1.9 (11-Jan-2013) Implemented browsing using AppSDK
 v2.0 (14-Jan-2013) Browsing updated
 v2.1 (24-Jan-2013) Updated status bar notifications
 v2.2 (30-Jan-2013) Added TimedSbn_Metadata, TotalTrackNumber, integrated NowPlaying3, updated events, changed source btn icon
 v2.3 (31-Jan-2013) Added Shuffle_Voice, Repeat_Voice, Updated status bar notifications
 v2.4 (01-Feb-2013) Changed TotalTrackNumber payload, MechanicalErrorNotification context, added ElapsedTime
 v2.5 (04-Feb-2013) NowPlaying context style changed, now displaying track number and count
 v2.6 (20-Feb-2013) Browsing updated
 v2.7 (22-Feb-2013) Added 3.8 dictionaries
 v2.8 (01-Mar-2013) Browsing updated
 v2.9 (04-Mar-2013) Back button now sends GoBack events instead of GoLeft
 v3.0 (05-Mar-2013) Back button sends menuUp in ContentList and GoBack in TrackList
 v3.1 (06-Mar-2013) Browsing updated
 v3.2 (07-Mar-2013) Scan button is deselected on operationStatus != 'scanning'
 v3.3 (25-Mar-2013) Added current/total track count workaround (SW00111127)
 v3.3 (25-Mar-2013) Added statusbar labels (SW00112581)
 v3.4 (27-Mar-2013) Added scrubber (SW00112078)
 v3.5 (09-Apr-2013) Added tooltip labelIds (SW00113034)
 v3.6 (10-Apr-2013) Fixed playpause flicker (SW00107233)
 v3.7 (12-Apr-2013) Added "Loading" item to ContentList and TrackList contexts
 v3.8 (19-Apr-2013) Fixed browsing bug where menuUp is showing blank screen (SW00113664)
 v3.9 (24-Apr-2013) Fixed control focus issues in ContentList
 v4.0 (25-Apr-2013) Added ClearMetadata msg handler (SW00116593)
 v4.1 (07-May-2013) Fixed missing leading zeroes in elapsedTime (SW00115319)
 v4.2 (07-May-2013) Removed scrubber, Added NowPlaying4 (SW00104008)
 v4.3 (08-May-2013) Added non-interactive scrubber (SW00104008)
 v4.4 (09-May-2013) Updated repeat icons (SW00117192)
 v4.5 (09-May-2013) Switched RootFolder and CurrentFolder icons (SW00117816)
 v4.6 (10-May-2013) Fixed Shuffle/Repeat/PlayPause state cycle issue (SW00118078)
 v4.7 (10-May-2013) Fixed missing CurrentTrackNumber in AudioCD issue (SW00118074)
 v4.8 (13-May-2013) Fixed Metadata SBN (SW00117640)
 v4.9 (13-May-2013) Fixed blinking tool tips (SW00118253)
 v5.0 (14-May-2013) Added additional checks in SongInfo sbn case
 v5.1 (20-May-2013) Changed event names to match the latest event matrix (SW00118594)
 v5.3 (21-May-2013) Buttons setState changed to prevent flicker (SW00119022)
 v5.4 (21-May-2013) Removed DataCD states from AudioCD buttons (SW00119024)
 v5.5 (22-May-2013) Added VUI support for selectByLine (SW00098493)
 v5.6 (23-May-2013) Added small fix for vuiSupport (SW00098493)
 v5.7 (23-May-2013) Fixed flicker back/menuUp button (SW00113991)
 v6.0 (28-May-2013) Fixed browsing issues (SW00118805,SW00114506)
 v6.1 (29-May-2013) Implemented Global.GoBack strategy (SW00109652)
 v6.2 (29-May-2013) Added params.fromVui to list sendEventToMmui calls
 v6.3 (04-Jun-2013) Changed common.OK to common.Ok (SW00120274)
 v6.4 (04-Jun-2013) Changed browsing implementation (SW00120197)
 v6.5 (07-Jun-2013) Fixed missing metadata issue on ACC cycle (SW00120219)
 v6.6 (07-Jun-2013) Removed track index from browsing (it was added for debugging purposes)
 v6.7 (10-Jun-2013) Fixed browsing bug (SW00120922)
 v6.8 (24-Jun-2013) Added AppSDK response type check (SW00121458)
 v6.9 (26-Jun-2013) Updated VR commands handling (SW00120329)
 v7.0 (09-Jul-2013) Migrated to Dialog3, DiscLoading context removed (SW00124000)
 v7.1 (11-Jul-2013) Changed audio settings icon IcnUmpSettings from to IcnUmpEqualizer (SW00124412)
 v7.2 (11-Jul-2013) Fixed current track = 0 issue (SW00122110)
 v7.3 (17-Jul-2013) Changed audioTitleIcon to match the visual style guide (SW00122068)
 v7.4 (23-Jul-2013) Added missing semicolon to _contextTable declaration (SW00123967)
 v7.5 (23-Jul-2013) Allow Pause action during Scan (SW00125349)
 v7.6 (03-Aug-2013) Added workaround for missing tooltips on multistate UMP buttons (SW00120485)
 v7.7 (03-Aug-2013) Fixed "loading" logic in NowPlaying (SW00125699)
 v7.8 (10-Aug-2013) Another fix in "loading" logic (SW00125699)
 v7.9 (14-Aug-2013) Implemented song duration and current position on the progress bar (SW00128030)
 v8.0 (20-Aug-2013) Fixed play/pause tooltip flicker (SW00128240) and updated track title according to (SW00128066)
 v8.1 (10-Sep-2013) Fixed root list was not working (SW00131200)
 v8.2 (27-Sep-2013) Added dictionary submap handling for nowPlayingCtxt title (SW00133624)
 v8.3 (01-Oct-2013) CD track count not shown correctly for the current song/cd (SW00133546)
 v8.4 (01-Oct-2013) SBN's for CD are shown now (SW00133418)
 v8.5 (02-Oct-2013) song list in now playing/root displaying blank lines if scrolled fast using touch (SW00120922)
 v8.6 (04-Oct-2013) Fixed play/pause button flickering. (SW00134319)
 v8.7 (18-June-2014) GUI_CD: MY15 Graphic Asset Update and Clean Up (SW00150291)
 V8.9 (17-Dec-2014) Fixed file paths for folder icon image (IcnListFolder.png) (SW00153397)
 __________________________________________________________________________
 */
log.addSrcFile("cdApp.js", "cd");

/*******************************************************************************
 * Start of Base App Implementation
 *
 * Code in this section should not be modified except for function names based
 * on the appname
 ******************************************************************************/

function cdApp(uiaId)
{
    log.debug("Constructor called...");
    baseApp.init(this, uiaId);
}
/*******************************************************************************
 * Standard App Functions *
 ******************************************************************************/

/*
 * Called just after the app is instantiated by framework.
 */
cdApp.prototype.appInit = function()
{
    log.debug(" cdApp appInit  called...");
    if (framework.debugMode)
    {
        utility.loadScript("apps/cd/test/cdAppTest.js");
    }

    this._cachedCurrentTrackNumber = null;

    // message cache
    this._cachedDiskType = null;
    this._cachedRepeatSetting = null;
    this._cachedShuffleSetting = null;
    this._cachedOperationStatus = null;
    this._cachedCurrentTrackPlayStatus = null;
    this._cachedCurrentMeta = null;
    this._cachedAlbumArt = null;
    this._cachedNotification = null;
    this._cachedTrackCount = null;
    this._cachedFolderIsRoot = false;
    this._cachedDiscIsCDDA = false;
    this._cachedSelectionName = "";
    this._lastFocusedItem = null;

    // internal properties
    this._readyForRequest = false;
    this._inScan = false;       // player scan state
    this._loading = true;
    var slideCallback = this._umpScrubberSlideCallback.bind(this);
    var selectCallback = this._umpBtnSelectCallback.bind(this);
    var holdStopCallback = this._umpBtnHoldStopCallback.bind(this);
    var holdStartCallback = this._umpBtnHoldStartCallback.bind(this);


    // Browsing cache
    this._requestChunkSize = 30;        // This is the no. of records GUI requests for a single request from AppSDK
    this._listTotalCount = 0;           // Total no of items that are available

    this._displayLoadingTimeout = 10000;

    // umpButtonConfig for Data CD
    this._umpButtonConfigData = new Object();

    this._umpButtonConfigData["source"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpEntMenu",
        disabled : false,
        appData : "source",
        selectCallback: selectCallback
    };


    this._umpButtonConfigData["rootfolder"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpCurrentList",
        disabled : false,
        appData : "rootfolder",
        labelId: "SelectRootFolderTooltip",
        selectCallback: selectCallback
    };
    this._umpButtonConfigData["currentfolder"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpTopList",
        disabled : false,
        appData : "currentfolder",
        labelId: "SelectCurrentFolderTooltip",
        selectCallback: selectCallback
    };

    this._umpButtonConfigData["repeat"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpRepeat",
        currentState:"None",
        stateArray: [
            {
                state:"None"
            },
            {
                state:"Song"
            },
            {
                state:"List"
            }
        ],
        disabled : null,
        appData:"repeat",
        selectCallback: selectCallback
    };

    this._umpButtonConfigData["shuffle"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpShuffle",
        currentState:"Off",
        stateArray: [
            {
                state:"Off"
            },
            {
                state:"On"
            },
            {
                state:"Folder"
            }
        ],
        disabled : false,
        appData : "shuffle",
        selectCallback: selectCallback
    };

    this._umpButtonConfigData["scan"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpScan",
        currentState:"Unsel",
        stateArray: [
            {
                state:"Unsel", labelId: "common.Tooltip_IcnUmpScan_Unsel"
            },
            {
                state:"Sel", labelId: "common.Tooltip_IcnUmpScan_Sel"
            },
        ],
        disabled : false,
        appData : "scan",
        selectCallback: selectCallback
    };

    this._umpButtonConfigData["prev"] =
    {
        buttonBehavior : "shortAndHold",
        imageBase : "IcnUmpPreviousAudio",
        disabled : false,
        appData : "prev",
        selectCallback: selectCallback,
        holdStartCallback : holdStartCallback,
        holdStopCallback : holdStopCallback,
    };

    this._umpButtonConfigData["playpause"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpPlayPause",
        currentState:"Pause",
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

    this._umpButtonConfigData["next"] =
    {
        buttonBehavior : "shortAndHold",
        imageBase : "IcnUmpNextAudio",
        disabled : false,
        appData : "next",
        selectCallback: selectCallback,
        holdStartCallback : holdStartCallback,
        holdStopCallback : holdStopCallback,

    };

    this._umpButtonConfigData["settings"] =
    {
        buttonBehavior : "shortPressOnly",
        disabled : false,
        imageBase : "IcnUmpEqualizer",
        appData : "settings",
        selectCallback: selectCallback
    };


    this._scrubberConfigData = {
        "scrubberStyle" : "Style01",
        "mode" : 'progress',
        "slideCallback" : null, //slideCallback,
        "minChangeInterval" : 0, //250,
        "settleTime": 1000,
        "min" : 0.0,
        "max" : 1.0,
        "increment" : 0.01,
        "value" : 0,
        "appData" : null,
        "disabled" : false,
        "buffering" : false
    };

    this._umpConfig =
    {
        hasScrubber                 : true,
        retracted                   : false,
        tooltipsEnabled             : true,
        initialButtonFocus          : "source",
        buttonConfig                : this._umpButtonConfigData,
        scrubberConfig              : this._scrubberConfigData,
    };
    //End of button config

    // umpButtonConfig for Audio CD
    this._umpButtonConfigAudio = new Object();
    this._umpButtonConfigAudio["source"] = this._umpButtonConfigData["source"];
    this._umpButtonConfigAudio["tracklist"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpCurrentList",
        disabled : false,
        appData : "tracklist",
        label : null,
        labelId : "SelectTrackListTooltip",
        selectCallback: selectCallback
    };

    this._umpButtonConfigAudio["repeat"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpRepeat",
        currentState:"None",
        stateArray: [
            {
                state:"None", labelId: "common.Tooltip_IcnUmpRepeat_None"
            },
            {
                state:"Song", labelId: "common.Tooltip_IcnUmpRepeat_Song"
            },
        ],
        disabled : null,
        appData:"repeat",
        selectCallback: selectCallback
    };

    this._umpButtonConfigAudio["shuffle"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpShuffle",
        currentState:"Off",
        stateArray: [
            {
                state:"Off", labelId: "common.Tooltip_IcnUmpShuffle_Off"
            },
            {
                state:"On", labelId: "common.Tooltip_IcnUmpShuffle_On"
            },
        ],
        disabled : false,
        appData : "shuffle",
        selectCallback: selectCallback
    };

    this._umpButtonConfigAudio["scan"] = this._umpButtonConfigData["scan"];

    this._umpButtonConfigAudio["prev"] = this._umpButtonConfigData["prev"];

    this._umpButtonConfigAudio["playpause"] = this._umpButtonConfigData["playpause"];

    this._umpButtonConfigAudio["next"] = this._umpButtonConfigData["next"];

    this._umpButtonConfigAudio["settings"] = this._umpButtonConfigData["settings"];
    //End of button config


    this.TrackListCtxtDataList = {
        itemCountKnown : false,
        vuiSupport : true,
        itemCount : -1,
        items: [ ]
    };

    // @formatter:off
    this._contextTable = {

        // now playing
        "NowPlaying" : {
            sbNameId : "sbNameId",
            leftBtnStyle : "goBack",
            template : "NowPlaying4Tmplt",
            controlProperties : {
                NowPlayingCtrl : {
                    ctrlStyle : 'Style4',
                    umpConfig : this._umpConfig,
                }
            },
            "contextInFunction" : this._NowPlayingCtxtIn.bind(this),
            "readyFunction" : this._NowPlayingCtxtTmpltReadyToDisplay.bind(this),
            "contextOutFunction" : null
        }, // end of "NowPlaying"

        // track listing of AUDIO CD
        "TrackList" : {
            sbNameId : "sbNameId",
            template : "List2Tmplt",
            leftBtnStyle : "goBack",
            controlProperties: {
                List2Ctrl : {
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',
                        text1 : '',
                    },
                    requestSize : 30,
                    numberedList : false,
                    dataList: this.TrackListCtxtDataList,
                    selectCallback : this._listItemClickCallback.bind(this),
                    needDataCallback : this._TrackListNeedDataCallback.bind(this),
                    needDataTimeout : this._displayLoadingTimeout,
                } // end of properties for "List2Ctrl"
            }, // end of list of controlProperties
            "readyFunction" : this._PlaylistsCtxtTmpltReadyToDisplay.bind(this),
            "contextInFunction" : this._PlaylistsCtxtContextIn.bind(this),
            "contextOutFunction" : this._PlaylistsCtxtContextOut.bind(this),
        }, // end of "Tracklist"

        // content listing of DATA CD
        "ContentList" : {
            sbNameId : "sbNameId",
            template : "List2Tmplt",
            leftBtnStyle : "menuUp",
            controlProperties: {
                List2Ctrl : {
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',
                        text1 : '',
                    },
                    enableSecondaryItemRequest : false,
                    numberedList : true,
                    dataList: this.TrackListCtxtDataList,
                    selectCallback : this._listItemClickCallback.bind(this),
                    needDataCallback : this._TrackListNeedDataCallback.bind(this),
                    needDataTimeout : this._displayLoadingTimeout,
                    requestSize : 30,
                } // end of properties for "List2Ctrl"
            }, // end of list of controlProperties
            "readyFunction" : this._PlaylistsCtxtTmpltReadyToDisplay.bind(this),
            "contextInFunction" : this._PlaylistsCtxtContextIn.bind(this),
            "contextOutFunction" : this._PlaylistsCtxtContextOut.bind(this),
        }, // end of "ContentList"

        "DiscErrorNotification" : {
            sbNameId : "sbNameId",
            "template" : "Dialog3Tmplt",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "contentStyle" : "style02",
                    "text1Id" : "DiscErrorNotification",
                    "buttonCount" : 1,
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "common.Ok",
                            appData : "Global.OK",
                            selectCallback : this._dialogDefaultSelectCallback.bind(this)
                        },
                    } // end of buttonConfig
                } //end of properties
            },
            "readyFunction" : this._DiscErrorNotificationTmpltReadyToDisplay.bind(this),
        }, // end of "DiscErrorNotification"

        "MechanicalErrorNotification" : {
            sbNameId : "sbNameId",
            "template" : "Dialog3Tmplt",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "contentStyle" : "style02",
                    "text1Id" : "MechanicalErrorNotification",
                    "buttonCount" : 1,
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "common.Ok",
                            appData : "Global.OK",
                            selectCallback : this._dialogDefaultSelectCallback.bind(this)
                        },
                    } // end of buttonConfig
                } //end of properties
            },
            "readyFunction" : this._MechanicalErrorNotificationTmpltReadyToDisplay.bind(this),
        }, // end of "MechanicalErrorNotification"
    };
    // end of this._contextTable

    this._messageTable = {
        "DiscType"                      : this._DiscTypeMsgHandler.bind(this),
        "AlbumArt"                      : this._AlbumArtMsgHandler.bind(this),
        "Repeat_Voice"                  : this._Repeat_VoiceMsgHandler.bind(this),
        "Shuffle_Voice"                 : this._Shuffle_VoiceMsgHandler.bind(this),
        "ClearMetadata"                 : this._ClearMetadataMsgHandler.bind(this),
        "RepeatSetting"                 : this._RepeatSettingMsgHandler.bind(this),
        "ShuffleSetting"                : this._ShuffleSettingMsgHandler.bind(this),
        "OperationStatus"               : this._OperationStatusMsgHandler.bind(this),
        "CurrentMetaData"               : this._CurrentMetaDataMsgHandler.bind(this),
        "TotalTrackNumber"              : this._TotalTrackNumberMsgHandler.bind(this),
        "UserSelection"                 : this._UserSelectionMsgHandler.bind(this),
        "TimedSbn_Notification"         : this._TimedSbn_NotificationMsgHandler.bind(this),
        "CurrentTrackPlayStatus"        : this._CurrentTrackPlayStatusMsgHandler.bind(this),
        "TimedSbn_MetadataNotification" : this._TimedSbn_MetadataNotificationMsgHandler.bind(this),
        "Go_Back_CD_Event"              : this._Go_Back_CD_EventMsgHandler.bind(this),
        "TimedSbn_SongInfo"             : this._TimedSbn_SongInfoMsgHandler.bind(this),
    };
    // end of this._messageTable
    // @formatter:on
};

/*******************************************************************************
 * Context handlers
 ******************************************************************************/
// TrackList / ContentList Context
cdApp.prototype._PlaylistsCtxtContextIn = function ()
{
    log.debug("_PlaylistsCtxtContextIn called...");
	if(this._currentContext && this._currentContext.ctxtId == "ContentList")
	{
		this._contextTable.ContentList.controlProperties.List2Ctrl.title.text1 = "";
	}

};

cdApp.prototype._PlaylistsCtxtTmpltReadyToDisplay = function (functionParams)
{
    log.debug("_PlaylistsCtxtTmpltReadyToDisplay called with params ", functionParams);

    if (this._currentContext.params.hasOwnProperty("payload") && this._currentContext.params.payload.hasOwnProperty("content") && this._currentContext.params.payload.content.hasOwnProperty("Selection_Name"))
    {
            // make immediate request the BLM is at the correct state
            if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "ContentList" && !this._cachedFolderIsRoot)
            {
                this._currentContextTemplate.list2Ctrl.setTitle({titleStyle : 'style02', text1 : this._cachedSelectionName });
            }
            else if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "TrackList" && !this._cachedDiscIsCDDA)
            {
                if ((this._cachedSelectionName != null && this._cachedSelectionName != undefined) && (this._cachedSelectionName == "" || this._cachedSelectionName.toLowerCase() == "track list"))
                {
                    this._currentContextTemplate.list2Ctrl.setTitle({titleStyle : 'style02', text1Id : "SelectTrackListTooltip"});
                }
                else
                {
                    this._currentContextTemplate.list2Ctrl.setTitle({titleStyle : 'style02', text1 : this._cachedSelectionName });
                }
            }
            else if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "TrackList" && this._cachedDiscIsCDDA)
            {
                this._currentContextTemplate.list2Ctrl.setTitle({titleStyle : 'style02', text1Id : "SelectTrackListTooltip" });
            }
            else if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "ContentList" && this._cachedFolderIsRoot)
            {
                this._currentContextTemplate.list2Ctrl.setTitle({titleStyle : 'style02', text1Id : "Disc" });
            }
    }
	if(this._listTotalCount != 0)
	{
	    log.debug("APPSDK REQUEST FROM BUC");
        var params = {"index":0, "itemsCount":this._requestChunkSize};
	    framework.sendRequestToAppsdk(this.uiaId, this._getTrackListCallbackFn.bind(this), "cd", "GetFolderContents_Req", params);
		this._listTotalCount = 0;           // Total no of items that are available

        this._currentContextTemplate.list2Ctrl.dataList = {};
        this._currentContextTemplate.list2Ctrl.dataList.itemCountKnown = true;
        this._currentContextTemplate.list2Ctrl.dataList.itemCount = 0;


        this._readyForRequest = false;
	}	
};

cdApp.prototype._PlaylistsCtxtContextOut = function ()
{
    log.debug("_PlaylistsCtxtContextOut called...");
    if(this._outgoingContextTemplate.list2Ctrl) 
    {
        this._lastFocusedItem = this._outgoingContextTemplate.list2Ctrl._lastItemWithFocus;
    }
};

cdApp.prototype._DiscErrorNotificationTmpltReadyToDisplay = function()
{
    log.debug("_DiscErrorNotificationTmpltReadyToDisplay called...");
};

cdApp.prototype._MechanicalErrorNotificationTmpltReadyToDisplay = function()
{
    log.debug("_MechanicalErrorNotificationTmpltReadyToDisplay called...");
};

// NowPlaying Context
cdApp.prototype._NowPlayingCtxtIn = function ()
{
    if(this._previousContext && this._previousContext.ctxtId == "ContentList")
    {
        this._contextTable.NowPlaying.leftBtnStyle = "menuUp";
    }
    else
    {
        this._contextTable.NowPlaying.leftBtnStyle = "goBack";
    }

    if (this._currentContext.params &&
        this._currentContext.params.payload &&
        this._currentContext.params.payload.diskType )
    {
        this._cachedDiskType = this._currentContext.params.payload.diskType;
    }

    if (this._cachedDiskType == 'AudioCD')
    {
        this._contextTable["NowPlaying"].controlProperties.NowPlayingCtrl.umpConfig.buttonConfig = this._umpButtonConfigAudio;
    }
    else if (this._cachedDiskType == 'DataCD')
    {
        this._contextTable["NowPlaying"].controlProperties.NowPlayingCtrl.umpConfig.buttonConfig =  this._umpButtonConfigData;
    }
};

cdApp.prototype._NowPlayingCtxtTmpltReadyToDisplay = function()
{
    log.debug("_NowPlayingCtxtTmpltReadyToDisplay called...");


    if(this._loading)
    {
        this._startLoading();
        if(this._cachedShuffleSetting != null && this._cachedShuffleSetting != undefined)
        {
             this._updateShuffleButton(this._currentContextTemplate);
        }
        if(this._cachedRepeatSetting != null && this._cachedRepeatSetting != undefined)
        {
             this._updateRepeatButton(this._currentContextTemplate);
        }
    }
     else
     {
         this._populateCoverArt(this._cachedAlbumArt);
         this._populatenowPlaying4Ctrl(this._currentContextTemplate);
         if(this._cachedOperationStatus)
         {
             this._updatePlayPauseState(this._cachedOperationStatus);
         }
         this._updateTime();
         this._updateTitle(this._currentContextTemplate);
         this._updateRepeatButton(this._currentContextTemplate);
         this._updateShuffleButton(this._currentContextTemplate);
         this._updateScanningButton(this._currentContextTemplate);
     }
};

/*******************************************************************************
 * Message handlers
 ******************************************************************************/
cdApp.prototype._Go_Back_CD_EventMsgHandler = function(msg)
{
    if (this._currentContext && (this._currentContext.ctxtId === "ContentList" || this._currentContext.ctxtId === "TrackList"))
    {
        var params = null;
        if(this._lastFocusedItem) 
        {
            if(this._listTotalCount - this._lastFocusedItem > 6) 
            {
                params = {"index": this._lastFocusedItem - 15, "itemsCount":this._requestChunkSize};
            }
            else 
            {
                params = {"index" : this._lastFocusedItem - 30, "itemsCount" : this._requestChunkSize};
            }
            if(params.index <= 0)
            {
                params.index = 0;
            }
            this._lastFocusedItem = null;
        }
        else 
        {
                params = {"index" : 0, "itemsCount" : this._requestChunkSize};
        }
        framework.sendRequestToAppsdk(this.uiaId, this._getTrackListCallbackFnGoBack.bind(this), "cd", "GetFolderContents_Req", params);
    }
};
// RepeatSetting
cdApp.prototype._RepeatSettingMsgHandler = function(msg)
{
    log.info("_RepeatSettingMsgHandler called with msg ", msg);

    // store it locally
    this._cachedRepeatSetting = msg.params.payload.repeatSetting;
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying")
    {
        this._updateRepeatButton(this._currentContextTemplate);
    }
};

// ShuffleSetting
cdApp.prototype._ShuffleSettingMsgHandler = function(msg)
{
    log.info("_ShuffleSettingMsgHandler called with msg", msg.params.payload.shuffleSetting);

    // store it locally
    this._cachedShuffleSetting = msg.params.payload.shuffleSetting;
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying")
    {
	    this._updateShuffleButton(this._currentContextTemplate);      
    }
};

// OperationStatus
cdApp.prototype._OperationStatusMsgHandler = function(msg)
{
    log.debug("_OperationStatusMsgHandler called with msg ",msg);

    // store it locally
    this._cachedOperationStatus = msg.params.payload.status;
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying")
    {
        this._processOperationStatus(this._currentContextTemplate);
        if(this._cachedOperationStatus != "Scanning")
        {
            this._updatePlayPauseState(this._cachedOperationStatus);
        }
    }
};
// CurrentMetaData
cdApp.prototype._CurrentMetaDataMsgHandler = function(msg)
{
    log.info("_CurrentMetaDataMsgHandler called with msg ", msg);

    this._cachedCurrentMeta = msg.params.payload.status;
    this._loading = false;
    // populate npc
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying")
    {
        this._populatenowPlaying4Ctrl(this._currentContextTemplate);
        this._updateShuffleButton(this._currentContextTemplate);
    }
};
// CurrentTrackPlayStatus
cdApp.prototype._CurrentTrackPlayStatusMsgHandler = function(msg)
{
    log.debug("_CurrentTrackPlayStatusMsgHandler called with msg", msg);
    this._cachedCurrentTrackPlayStatus = msg.params.payload.status;

    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying")
    {
        //set song duration
        this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setTotalTime(this._formatTime(this._cachedCurrentTrackPlayStatus.length));

        //set elapsed time
        this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setElapsedTime(this._formatTime(this._cachedCurrentTrackPlayStatus.elapsed));

        //update scrubber position
        this._updateProgressBar(this._cachedCurrentTrackPlayStatus.length, this._cachedCurrentTrackPlayStatus.elapsed);

        // update context title
        this._updateTitle(this._currentContextTemplate);
    }
};

// Track Album Art
cdApp.prototype._AlbumArtMsgHandler = function(msg)
{
    log.info("_AlbumArtMsg received", msg);
    this._cachedAlbumArt = msg.params.payload.fileName;

    if (this._currentContext && this._currentContextTemplate)
    {
        switch (this._currentContext.ctxtId)
        {
            case "NowPlaying":
                this._populateCoverArt(this._cachedAlbumArt);
                break;

            default:
                log.debug("Do nothing");
                break;
        }
    }
};

cdApp.prototype._UserSelectionMsgHandler = function(msg)
{
    log.info("_UserSelectionMsgHandler received", msg);

    if(msg.params.payload.hasOwnProperty("content") && msg.params.payload.content.hasOwnProperty("Selection_Name"))
    {
        this._cachedSelectionName = msg.params.payload.content.Selection_Name;
    }

    if(msg.params.payload.hasOwnProperty("content") && msg.params.payload.content.hasOwnProperty("DiscIsCDDA"))
    {
        this._cachedDiscIsCDDA = msg.params.payload.content.DiscIsCDDA;
    }

    if(msg.params.payload.hasOwnProperty("content") && msg.params.payload.content.hasOwnProperty("FolderIsRoot"))
    {
        this._cachedFolderIsRoot = msg.params.payload.content.FolderIsRoot;
    }

    if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "ContentList" && !this._cachedFolderIsRoot)
    {
        this._currentContextTemplate.list2Ctrl.setTitle({titleStyle : 'style02', text1 : this._cachedSelectionName });
    }
    else if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "TrackList" && !this._cachedDiscIsCDDA)
    {
        if ((this._cachedSelectionName != null && this._cachedSelectionName != undefined) && (this._cachedSelectionName == "" || this._cachedSelectionName.toLowerCase() == "track list"))
        {
            this._currentContextTemplate.list2Ctrl.setTitle({titleStyle : 'style02', text1Id : "SelectTrackListTooltip"});
        }
        else if (this._cachedSelectionName == null || this._cachedSelectionName == undefined)
        {
            this._cachedSelectionName = "track list";
            this._currentContextTemplate.list2Ctrl.setTitle({titleStyle : 'style02', text1Id : "SelectTrackListTooltip"});
        }
        else
        {
            this._currentContextTemplate.list2Ctrl.setTitle({titleStyle : 'style02', text1 : this._cachedSelectionName });
        }
    }
    else if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "TrackList" && this._cachedDiscIsCDDA)
    {
        this._currentContextTemplate.list2Ctrl.setTitle({titleStyle : 'style02', text1Id : "SelectTrackListTooltip" });
    }
    else if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "ContentList" && this._cachedFolderIsRoot)
    {
        this._currentContextTemplate.list2Ctrl.setTitle({titleStyle : 'style02', text1Id : "Disc" });
    }

    this._readyForRequest = true;
    if(this._currentContext && this._currentContextTemplate && (this._currentContext.ctxtId == "TrackList" || this._currentContext.ctxtId == "ContentList"))
    {
        //--------------Make AppSDK request--------------
        log.debug("APPSDK REQUEST FROM UserSelectionMsgHandler");
        var params = {"index":0, "itemsCount":this._requestChunkSize};
        framework.sendRequestToAppsdk(this.uiaId, this._getTrackListCallbackFn.bind(this), "cd", "GetFolderContents_Req", params);
        this._listTotalCount = 0;           // Total no of items that are available

        this._currentContextTemplate.list2Ctrl.dataList = {};
        this._currentContextTemplate.list2Ctrl.dataList.itemCountKnown = true;
        this._currentContextTemplate.list2Ctrl.dataList.itemCount = 0;


        this._readyForRequest = false;
        //--------------------------------------------------------
    }
};

cdApp.prototype._TimedSbn_SongInfoMsgHandler = function(msg) 
{
  if(framework.getCurrCtxtId() !== "NowPlaying")
  {
    var params = {
        sbnStyle : 'Style02',
        imagePath1 : 'IcnSbnEnt.png',
        text2 : null,
        text1Id : null,
    };
	if(this._cachedDiskType == "DataCD")
	{
		if(msg.params.payload.songName !== null) 
		{
        params.text1Id = "system.CdPlayer";
		params.text2 = msg.params.payload.songName;
        framework.common.startTimedSbn(this.uiaId, 'TimedSbn_CD_Status', "typeE", params);
		}
	}
	else if(this._cachedDiskType == "AudioCD")
	{
		if(msg.params.payload.trackNumber !== null) 
		{
			var submap = {"trackNumber" : msg.params.payload.trackNumber};
			params.text1Id = "system.CdPlayer";
			params.text2   = framework.localize.getLocStr(this.uiaId,"Track",submap);
			framework.common.startTimedSbn(this.uiaId, 'TimedSbn_CD_Status', "typeE", params);
		}
	}
 }
};

cdApp.prototype._TimedSbn_NotificationMsgHandler = function(msg)
{
    log.info("_TimedSbn_NotificationMsgHandler received", msg);
    this._cachedNotification = null;

    var params = {
        sbnStyle : 'Style02',
        imagePath1 : 'IcnSbnEnt.png',
        text1 : null,
        text1Id : null,
    };

    if(msg.params.payload.notification != undefined)
    {
        switch(msg.params.payload.notification)
        {
            case "DiscInserted":
                this._cachedTrackCount = "-";
                params.text1Id = "DiscInserted";
                if (params.text1Id || params.text1)
                {
                     framework.common.startTimedSbn(this.uiaId, 'TimedSbn_CD_Status', 'deviceConnected', params);
                }
                break;
            case "DiscLoading":
                params.text1Id = "Loading";
                if (params.text1Id || params.text1)
                {
                     framework.common.startTimedSbn(this.uiaId, 'TimedSbn_CD_Status', 'deviceConnected', params);
                }
                break;
            case "SongInfo":
                if (this._cachedCurrentMeta && this._cachedCurrentMeta.trackMetadata)
                {
                    if (this._cachedCurrentMeta.trackMetadata.artistName && this._cachedCurrentMeta.trackMetadata.songName)
                    {
                        params.text1 = this._cachedCurrentMeta.trackMetadata.artistName + " - " + this._cachedCurrentMeta.trackMetadata.songName;
                    }
                    else if(this._cachedCurrentMeta.trackMetadata.artistName && !this._cachedCurrentMeta.trackMetadata.songName)
                    {
                        params.text1 = this._cachedCurrentMeta.trackMetadata.artistName;
                    }
                    else if(!this._cachedCurrentMeta.trackMetadata.artistName && this._cachedCurrentMeta.trackMetadata.songName)
                    {
                        params.text1 = this._cachedCurrentMeta.trackMetadata.songName;
                    }
                    if (params.text1Id || params.text1)
                    {
                         framework.common.startTimedSbn(this.uiaId, 'TimedSbn_CD_Status', 'entertainmentInfo', params);
                    }
                }
                break;
            case "EjectingDisc":
                params.text1Id = "EjectingDisc";
                if (params.text1Id || params.text1)
                {
                     framework.common.startTimedSbn(this.uiaId, 'TimedSbn_CD_Status', 'deviceRemoved', params);
                }
                break;
            case "EjectedDisc":
                params.text1Id = "EjectedDisc";
                if (params.text1Id || params.text1)
                {
                     framework.common.startTimedSbn(this.uiaId, 'TimedSbn_CD_Status', 'deviceRemoved', params);
                }
                break;
            case "NoDiscInserted":
                params.text1Id = "NoDiscInserted";
                if (params.text1Id || params.text1)
                {
                     framework.common.startTimedSbn(this.uiaId, 'TimedSbn_CD_Status', 'errorNotification', params);
                }
                break;
            case "MechanicalError":
                params.text1Id = "MechanicalError";
                if (params.text1Id || params.text1)
                {
                     framework.common.startTimedSbn(this.uiaId, 'TimedSbn_CD_Status', 'errorNotification', params);
                }
                break;
            case "DiscError":
                params.text1Id = "DiscError";
                if (params.text1Id || params.text1)
                {
                     framework.common.startTimedSbn(this.uiaId, 'TimedSbn_CD_Status', 'errorNotification', params);
                }
                break;
            case "Updating":
                params.text1Id = "Updating";
                if (params.text1Id || params.text1)
                {
                     framework.common.startTimedSbn(this.uiaId, 'TimedSbn_CD_Status', 'errorNotification', params);
                }
                break;
            case "UpdateComplete":
                params.text1Id = "UpdateComplete";
                if (params.text1Id || params.text1)
                {
                     framework.common.startTimedSbn(this.uiaId, 'TimedSbn_CD_Status', 'errorNotification', params);
                }
                break;
            default:
                params.text1Id = "error";
                log.error("_TimedSbn_NotificationMsgHandler invalid notification", msg.params.payload.notification);
                break;
        }
    }
};
cdApp.prototype._TimedSbn_MetadataNotificationMsgHandler = function(msg)
{
    log.info("_TimedSbn_MetadataNotificationMsgHandler received", msg);

    if(msg.params.payload.notification)
    {
        framework.common.startTimedSbn(this.uiaId, 'CD_State_Sbn', 'songPlaying', {
            sbnStyle : 'Style02',
            imagePath1 : 'IcnSbnEnt.png',
            text1 : msg.params.payload.notification,
        });
    }
};

cdApp.prototype._TotalTrackNumberMsgHandler = function(msg)
{
    log.info("_TotalTrackNumberMsgHandler received", msg);

    if (msg.params.hasOwnProperty("payload") && msg.params.payload.number)
    {
        this._cachedTrackCount = msg.params.payload.number;
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "NowPlaying")
        {
            this._populatenowPlaying4Ctrl(this._currentContextTemplate);
        }
    }
};

cdApp.prototype._DiscTypeMsgHandler = function(msg)
{
    log.info("_DiscTypeMsgHandler received", msg);

    if(msg.params.hasOwnProperty("payload") &&  msg.params.payload.type)
    {
        this._cachedDiskType = msg.params.payload.type;
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "NowPlaying")
        {
            this._populatenowPlaying4Ctrl(this._currentContextTemplate);
        }
    }
};

cdApp.prototype._Repeat_VoiceMsgHandler = function(msg)
{
    log.info("_Repeat_VoiceMsgHandler received", msg);

    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "NowPlaying")
    {
        var umpCtrl = this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl;
        var additionalData = {state: umpCtrl.properties.buttonConfig.repeat.currentState, fromVui: true};
        umpCtrl.setButtonState("shuffle","Off");

        if(this._cachedDiskType == "AudioCD")
        {
            if (msg.params.payload.status == "RepeatTrack")
            {
                framework.sendEventToMmui(this.uiaId, "SelectRepeatMusic", {payload: {repeatMusicSetting : "RepeatTrack"}}, additionalData.fromVui);
                umpCtrl.setButtonState("repeat","Song");

            }
            else if (msg.params.payload.status == "RepeatOff")
            {
                framework.sendEventToMmui(this.uiaId, "SelectRepeatMusic", {payload: {repeatMusicSetting : "RepeatOff"}}, additionalData.fromVui);
                umpCtrl.setButtonState("repeat","None");
            }
            else if (msg.params.payload.status == "RepeatOn")
            {
                  framework.sendEventToMmui(this.uiaId, "SelectRepeatMusic", {payload: {repeatMusicSetting : "RepeatTrack"}}, additionalData.fromVui);
                  umpCtrl.setButtonState("repeat","Song");
            }
            else if (msg.params.payload.status = "Repeat")
            {
                if (additionalData.state == "None")
                {
                    framework.sendEventToMmui(this.uiaId, "SelectRepeatMusic", {payload: {repeatMusicSetting : "RepeatTrack"}}, additionalData.fromVui);
                    umpCtrl.setButtonState("repeat","Song");
                }
                else if (additionalData.state == "Song")
                {
                    framework.sendEventToMmui(this.uiaId, "SelectRepeatMusic", {payload: {repeatMusicSetting : "RepeatOff"}}, additionalData.fromVui);
                    umpCtrl.setButtonState("repeat","None");
                }
            }
            else
            {
                log.error("_Repeat_VoiceMsgHandler unhandled case AudioCD");
            }
        }
        else if(this._cachedDiskType == "DataCD")
        {

            if (msg.params.payload.status == "RepeatTrack")
            {
                framework.sendEventToMmui(this.uiaId, "SelectRepeatData", {payload: {repeatDataSetting : "RepeatTrack"}}, additionalData.fromVui);
                umpCtrl.setButtonState("repeat","Song");
            }
            else if (msg.params.payload.status == "RepeatFolder")
            {
                framework.sendEventToMmui(this.uiaId, "SelectRepeatData", {payload: {repeatDataSetting : "RepeatFolder"}}, additionalData.fromVui);
                umpCtrl.setButtonState("repeat","List");
            }
            else if (msg.params.payload.status == "RepeatOff")
            {
                framework.sendEventToMmui(this.uiaId, "SelectRepeatData", {payload: {repeatDataSetting : "RepeatOff"}}, additionalData.fromVui);
                umpCtrl.setButtonState("repeat","None");
            }
            else if (msg.params.payload.status == "RepeatOn")
            {
                  framework.sendEventToMmui(this.uiaId, "SelectRepeatData", {payload: {repeatDataSetting : "RepeatTrack"}}, additionalData.fromVui);
                  umpCtrl.setButtonState("repeat","Song");
            }
            else if (msg.params.payload.status = "Repeat")
            {
                if (additionalData.state == "None")
                {
                    framework.sendEventToMmui(this.uiaId, "SelectRepeatData", {payload: {repeatDataSetting : "RepeatTrack"}}, additionalData.fromVui);
                    umpCtrl.setButtonState("repeat","Song");
                }
                else if (additionalData.state == "Song")
                {
                    framework.sendEventToMmui(this.uiaId, "SelectRepeatData", {payload: {repeatDataSetting : "RepeatFolder"}}, additionalData.fromVui);
                    umpCtrl.setButtonState("repeat","List");
                }
                else if (additionalData.state == "List")
                {
                framework.sendEventToMmui(this.uiaId, "SelectRepeatData", {payload: {repeatDataSetting : "RepeatOff"}}, additionalData.fromVui);
                umpCtrl.setButtonState("repeat","None");
                }
            }

            else
            {
                log.error("_Repeat_VoiceMsgHandler unhandled case DataCD");
            }
        }
    }
};

cdApp.prototype._Shuffle_VoiceMsgHandler = function(msg)
{
    log.info("_Shuffle_VoiceMsgHandler received", msg);


    if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "NowPlaying")
    {
        var umpCtrl = this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl;
        var additionalData = {state: umpCtrl.properties.buttonConfig.shuffle.currentState, fromVui: true};
        umpCtrl.setButtonState("repeat", "None");

        if(this._cachedDiskType == "AudioCD")
        {
            if (msg.params.payload.status == "ShuffleDisk")
            {
                framework.sendEventToMmui(this.uiaId, "SelectShuffleMusic", {payload: {shuffleMusicSetting : "ShuffleDisk"}}, additionalData.fromVui);
				this._cachedShuffleSetting = "ShuffleDisk";
                umpCtrl.setButtonState("shuffle","On");
            }
            else if (msg.params.payload.status == "ShuffleOff")
            {
                framework.sendEventToMmui(this.uiaId, "SelectShuffleMusic", {payload: {shuffleMusicSetting : "ShuffleOff"}}, additionalData.fromVui);
				this._cachedShuffleSetting = "ShuffleOff";
                umpCtrl.setButtonState("shuffle","Off");
            }
            else if(msg.params.payload.status == "ShuffleOn")
            {
                framework.sendEventToMmui(this.uiaId, "SelectShuffleMusic", {payload: {shuffleMusicSetting : "ShuffleDisk"}}, additionalData.fromVui);
				this._cachedShuffleSetting = "ShuffleOn";
                umpCtrl.setButtonState("shuffle","On");
            }
            else if (msg.params.payload.status = "Shuffle")
            {
                if (additionalData.state == "Off")
                {
                    framework.sendEventToMmui(this.uiaId, "SelectShuffleMusic", {payload: {shuffleMusicSetting : "ShuffleDisk"}}, additionalData.fromVui);
					this._cachedShuffleSetting = "ShuffleDisk";
                    umpCtrl.setButtonState("shuffle","On");
                }
                else if (additionalData.state == "On")
                {
                    framework.sendEventToMmui(this.uiaId, "SelectShuffleMusic", {payload: {shuffleMusicSetting : "ShuffleOff"}}, additionalData.fromVui);
					this._cachedShuffleSetting = "ShuffleOff";
                    umpCtrl.setButtonState("shuffle","Off");
                }
            }
        }
        else if(this._cachedDiskType == "DataCD")
        {
            if (msg.params.payload.status == "ShuffleDisk")
            {
                framework.sendEventToMmui(this.uiaId, "SelectShuffleData", {payload: {shuffleDataSetting : "ShuffleDisk"}}, additionalData.fromVui);
				this._cachedShuffleSetting = "ShuffleDisk";
                umpCtrl.setButtonState("shuffle","On");
            }
            else if (msg.params.payload.status == "ShuffleFolder")
            {
                framework.sendEventToMmui(this.uiaId, "SelectShuffleData", {payload: {shuffleDataSetting : "ShuffleFolder"}}, additionalData.fromVui);
				this._cachedShuffleSetting = "ShuffleFolder";
                umpCtrl.setButtonState("shuffle","Folder");
            }
            else if (msg.params.payload.status == "ShuffleOff")
            {
                framework.sendEventToMmui(this.uiaId, "SelectShuffleData", {payload: {shuffleDataSetting : "ShuffleOff"}}, additionalData.fromVui);
				this._cachedShuffleSetting = "ShuffleOff";
                umpCtrl.setButtonState("shuffle","Off");
            }
            else if (msg.params.payload.status == "ShuffleOn")
            {
                framework.sendEventToMmui(this.uiaId, "SelectShuffleData", {payload: {shuffleDataSetting : "ShuffleFolder"}}, additionalData.fromVui);
				this._cachedShuffleSetting = "ShuffleFolder";
                umpCtrl.setButtonState("shuffle","Folder");
            }
            else if (msg.params.payload.status = "Shuffle")
            {
                if (additionalData.state == "Off")
                {
                    framework.sendEventToMmui(this.uiaId, "SelectShuffleData", {payload: {shuffleDataSetting : "ShuffleDisk"}}, additionalData.fromVui);
					this._cachedShuffleSetting = "ShuffleDisk";
                    umpCtrl.setButtonState("shuffle","On");
                }
                else if (additionalData.state == "On")
                {
                    framework.sendEventToMmui(this.uiaId, "SelectShuffleData", {payload: {shuffleDataSetting : "ShuffleFolder"}}, additionalData.fromVui);
					this._cachedShuffleSetting = "ShuffleFolder";
                    umpCtrl.setButtonState("shuffle","Folder");
                }
                else if (additionalData.state == "Folder")
                {
                    framework.sendEventToMmui(this.uiaId, "SelectShuffleData", {payload: {shuffleDataSetting : "ShuffleOff"}}, additionalData.fromVui);
					this._cachedShuffleSetting = "ShuffleOff";
                    umpCtrl.setButtonState("shuffle","Off");
                }
            }
        }
    }
};

cdApp.prototype._ClearMetadataMsgHandler = function(msg)
{
    log.info("_ClearMetadataMsgHandler received", msg);
    this._loading = true;
    if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "NowPlaying")
    {
        this._startLoading();

    }
};




/*******************************************************************************
 * Control callbacks
 ******************************************************************************/

// List control callback
cdApp.prototype._listItemClickCallback = function(list2CtrlObj, appData, params)
{
    log.debug("_listItemClickCallback called...");
    log.debug("   for context" + this._currentContext.ctxtId);
    log.debug("   itemIndex: " + params.itemIndex + " appData: " + appData);
    var itemIndex = params.itemIndex;

    switch (appData.appData)
    {
        // we are in audio cd
        case "SelectFolderName" :
            framework.sendEventToMmui(this.uiaId, "SelectFolderName", {payload:{ folderIndex: itemIndex }}, params.fromVui);
            break;
        case "SelectAudioFileName" :
            framework.sendEventToMmui(this.uiaId, "SelectAudioFileName", {payload:{ audioFileIndex: itemIndex }}, params.fromVui);
            break;
        case "SelectTrackNumber" :
            framework.sendEventToMmui(this.uiaId, "SelectTrackNumber", {payload:{ trackNumber: itemIndex }}, params.fromVui);
            this._cachedCurrentTrackNumber = itemIndex+1;
            break;
        default:
            log.debug("unknown appdata ", appData);
            break;
    }
};

// UMP Control functions/callbacks
cdApp.prototype._umpBtnSelectCallback = function(umpCtrlObj, appData, additionalData)
{
    log.debug("_umpDefaultSelectCallback called...", appData);

    if (this._currentContextTemplate && this._currentContextTemplate.hasOwnProperty("nowPlaying4Ctrl") &&
        this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.properties.buttonConfig["scan"].currentState == "Sel" && appData !="scan")
        {
            umpCtrlObj.setButtonState("scan","Unsel");
        }

    if (!additionalData.hasOwnProperty("fromVui"))
    {
        additionalData.fromVui = false;
    }

    switch (appData)
    {
        case "source":
            framework.sendEventToMmui(this.uiaId, "SelectSource");
            break;
        // data-specific
        case "rootfolder":
            framework.sendEventToMmui(this.uiaId, "SelectRootFolder");
            break;
        // data-specific
        case "currentfolder":
            framework.sendEventToMmui(this.uiaId, "SelectCurrentFolder");
            break;
        case "tracklist":
            framework.sendEventToMmui(this.uiaId, "SelectTrackList");
            break;
        case "repeat":
            if(this._cachedDiskType == "AudioCD")
            {
                if (additionalData.state == "None")
                {
                    framework.sendEventToMmui(this.uiaId, "SelectRepeatMusic", {payload: {repeatMusicSetting : "RepeatOff"}}, additionalData.fromVui);

                }
                else if (additionalData.state == "Song")
                {
                    framework.sendEventToMmui(this.uiaId, "SelectRepeatMusic", {payload: {repeatMusicSetting : "RepeatTrack"}}, additionalData.fromVui);
                }
            }
            else if(this._cachedDiskType == "DataCD")
            {
                if (additionalData.state == "None")
                {
                    framework.sendEventToMmui(this.uiaId, "SelectRepeatData", {payload: {repeatDataSetting : "RepeatOff"}}, additionalData.fromVui);
                }
                else if (additionalData.state == "Song")
                {
                    framework.sendEventToMmui(this.uiaId, "SelectRepeatData", {payload: {repeatDataSetting : "RepeatTrack"}}, additionalData.fromVui);
                }
                else if (additionalData.state == "List")
                {
                    framework.sendEventToMmui(this.uiaId, "SelectRepeatData", {payload: {repeatDataSetting : "RepeatFolder"}}, additionalData.fromVui);
                }
            }
            break;
        case "shuffle":
            if(this._cachedDiskType == "AudioCD")
            {
                if (additionalData.state == "On")
                {
                    framework.sendEventToMmui(this.uiaId, "SelectShuffleMusic", {payload: {shuffleMusicSetting : "ShuffleDisk"}}, additionalData.fromVui);
                }
                else if (additionalData.state == "Off")
                {
                    framework.sendEventToMmui(this.uiaId, "SelectShuffleMusic", {payload: {shuffleMusicSetting : "ShuffleOff"}}, additionalData.fromVui);
                }
            }
            else if(this._cachedDiskType == "DataCD")
            {
                if (additionalData.state == "On")
                {
                    framework.sendEventToMmui(this.uiaId, "SelectShuffleData", {payload: {shuffleDataSetting : "ShuffleDisk"}}, additionalData.fromVui);
                }
                else if (additionalData.state == "Off")
                {
                    framework.sendEventToMmui(this.uiaId, "SelectShuffleData", {payload: {shuffleDataSetting : "ShuffleOff"}}, additionalData.fromVui);
                }
                else if (additionalData.state == "Folder")
                {
                    framework.sendEventToMmui(this.uiaId, "SelectShuffleData", {payload: {shuffleDataSetting : "ShuffleFolder"}}, additionalData.fromVui);
                }
            }
            break;
        case "prev":
            framework.sendEventToMmui("common", "Global.Previous");
            break;
        case "next":
            framework.sendEventToMmui("common", "Global.Next");
            break;
        case "settings":
            framework.sendEventToMmui(this.uiaId, "GoSettings", {payload: {TabID : 5}});
            break;
        case "scan":
            if (additionalData.state == "Unsel")
            {
                framework.sendEventToMmui(this.uiaId, "HandleStopScan");
            }
            else
            {
                framework.sendEventToMmui(this.uiaId, "HandleStartScan");
            }
            break;
        case "playpause":
            if (additionalData.state == "Pause")
            {
                framework.sendEventToMmui("common", "Global.Resume");
            }
            else if (additionalData.state == "Play")
            {
                framework.sendEventToMmui("common", "Global.Pause");
            }
            break;
    }


};

cdApp.prototype._umpBtnHoldStartCallback = function(umpCtrlObj, appData, additionalData)
{
    log.debug("_umpBtnHoldStartCallback called...", appData);

    if (this._currentContextTemplate && this._currentContextTemplate.hasOwnProperty("nowPlaying4Ctrl") &&
        this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.properties.buttonConfig["scan"].currentState == "Sel" && appData != "scan")
        {
            umpCtrlObj.setButtonState("scan","Unsel");
        }

    switch (appData)
    {
        case "prev":
            framework.sendEventToMmui("common", "Global.Rewind");
            break;
        case "next":
            framework.sendEventToMmui("common", "Global.FastForward");
            break;

    }
};
cdApp.prototype._umpBtnHoldStopCallback = function(umpCtrlObj, appData, additionalData)
{
    log.debug("_umpBtnHoldStopCallback called...", appData);

    switch (appData)
    {
        case "prev":
            framework.sendEventToMmui("common", "Global.Resume");
            break;
        case "next":
            framework.sendEventToMmui("common", "Global.Resume");
            break;

    }
};


cdApp.prototype._umpScrubberSlideCallback = function ()
{
    log.debug("Scrubber slide callback called");
};

/*
 * Callback from Dialog3Ctrl of CD when Eject button is clicked.
 */
cdApp.prototype._dialogDefaultSelectCallback = function (dialogBtnCtrlObj, appData, params)
{
    log.debug("_dialogDefaultSelectCallback  called, appData: " + appData);

    if (this._currentContext && this._currentContextTemplate)
    {
        switch (this._currentContext.ctxtId)
        {
            case 'DiscErrorNotification' :
                framework.sendEventToMmui("common", "Global.Yes");
                break;
            case 'MechanicalErrorNotification' :
                framework.sendEventToMmui("common", "Global.Yes");
                break;
        }
    }
};

/**************************
 * APPSDK METHOD RESPONSE HANDLERS
 **************************/

cdApp.prototype._getTrackListCallbackFnGoBack = function(msg)
{
    // alert("APPSDK CALLBACK");
    log.debug(" _getTrackListCallbackFn  called...",msg);


    if (msg.msgType === "methodResponse")
    {
        this._listTotalCount = msg.params.totalItemsInFolder;

        if (this._currentContext && this._currentContextTemplate && (this._currentContext.ctxtId == "TrackList" || this._currentContext.ctxtId == "ContentList"))
        {
            this._addItemsToListGoBack(msg.params.itemList.item_List, msg.params.itemList.item_List[0].item_Index , msg.params.listSize);
        }

    }
    else if (msg.msgType === "methodErrorResponse")
    {
        log.error(" _getTrackListCallbackFn: AppSDK returned methodErrorResponse ", msg);
    }


};
cdApp.prototype._getTrackListCallbackFn = function(msg)
{
    // alert("APPSDK CALLBACK");
    log.debug(" _getTrackListCallbackFn  called...",msg);


    if (msg.msgType === "methodResponse")
    {
        this._listTotalCount = msg.params.totalItemsInFolder;

        if (this._currentContext && this._currentContextTemplate && (this._currentContext.ctxtId == "TrackList" || this._currentContext.ctxtId == "ContentList"))
        {
            this._addItemsToList(msg.params.itemList.item_List, msg.params.itemList.item_List[0].item_Index , msg.params.listSize);
        }

    }
    else if (msg.msgType === "methodErrorResponse")
    {
        log.error(" _getTrackListCallbackFn: AppSDK returned methodErrorResponse ", msg);
    }


};

// this is called when list needs more data to display when scrolling
cdApp.prototype._TrackListNeedDataCallback = function(index)
{
    log.info(" _TrackListNeedDataCallback  called with index ", index);
    var params = {"index": index, "itemsCount":this._requestChunkSize};
    framework.sendRequestToAppsdk(this.uiaId, this._getTrackListCallbackFn.bind(this), "cd", "GetFolderContents_Req", params);
};

/*******************************************************************************
 * Helper functions
 ******************************************************************************/
 // Add/Update items to list control on go back
cdApp.prototype._addItemsToListGoBack = function(itemsList, offset, count)
{
    log.debug("cdApp _addItemsToList  called...", itemsList);
    log.info ("addItems offset " + offset +" count "+ count);

    // reference to the list control
    var currentList = this._currentContextTemplate.list2Ctrl;
    var items = [];

    for(var i = 0; i < offset; i++)
    {
        items.push({appData: '', text1: '', hasCaret: false, image1: '', itemStyle : "empty"});
    }

    for (var i = 0; i< count; i++)
    {
        var actualIndex = i + offset + 1;

        // skip empty items
        if (itemsList[i].item_Name === '')
        {
            log.warn('Empty item found in list: ' + actualIndex);
            continue;
        }

       switch(itemsList[i].item_Type)
        {
            case 84:
                if(this._cachedDiskType == "AudioCD" && !this._cachedDiscIsCDDA)
                {
                    items.push({
                        appData : {"appData" : "SelectTrackNumber", "type" : itemsList[i].item_Type, "index" : itemsList[i].item_Index},
                        text1 : itemsList[i].item_Name,
                        hasCaret : false,
                        image1 : 'common/images/icons/IcnListSong.png',
                        itemStyle : 'style01'
                    });
                }
                else if (this._cachedDiskType == "AudioCD" && this._cachedDiscIsCDDA)
                {
                    items.push({
                        appData : {"appData" : "SelectTrackNumber", "type" : itemsList[i].item_Type, "index" : itemsList[i].item_Index},
                        text1Id : "Track",
                        text1SubMap: {trackNumber: actualIndex},
                        hasCaret : false,
                        image1 : 'common/images/icons/IcnListSong.png',
                        itemStyle : 'style01'
                    });
                }
                else if(this._cachedDiskType == "DataCD" && this._currentContextTemplate.contextInfo.ctxtId === "ContentList")
                {
                    items.push({
                        appData : {"appData" : "SelectAudioFileName", "type" : itemsList[i].item_Type, "index" : itemsList[i].item_Index},
                        text1 : itemsList[i].item_Name,
                        hasCaret : false,
                        image1 : 'common/images/icons/IcnListSong.png',
                        itemStyle : 'style01'
                    });
                }
                else if(this._cachedDiskType == "DataCD" && this._currentContextTemplate.contextInfo.ctxtId === "TrackList")
                {
                    items.push({
                        appData : {"appData" : "SelectTrackNumber", "type" : itemsList[i].item_Type, "index" : itemsList[i].item_Index},
                        text1 : itemsList[i].item_Name,
                        hasCaret : false,
                        image1 : 'common/images/icons/IcnListSong.png',
                        itemStyle : 'style01'
                    });
                }
                break;
            case 70:
                items.push({
                    appData : {"appData" : "SelectFolderName", "type" : itemsList[i].item_Type, "index" : itemsList[i].item_Index},
                    text1 : itemsList[i].item_Name,
                    hasCaret : false,
                    image1 : 'common/images/icons/IcnListFolder.png',
                    itemStyle : 'style01'
                });
                break;
        } 
    }
        
    currentList.setLoading(false);
    // we still don't have a datalist -> set datalist
    var dataList = {};
    dataList.vuiSupport = true;
    dataList.itemCountKnown = true;
    dataList.itemCount = this._listTotalCount; // total no. of items in folder , not the no. of items in chunk

    log.error(" _addItemsToList  hasDataList, _listTotalCount = ",this._listTotalCount);

    dataList.items = items;
    currentList.setDataList(dataList);
    currentList.updateItems(0, this._listTotalCount <= offset + count - 1 ? this._listTotalCount : offset + count - 1 );

};

// Add/Update items to list control 
cdApp.prototype._addItemsToList = function(itemsList, offset, count)
{
    log.debug("cdApp _addItemsToList  called...", itemsList);
    log.info ("addItems offset " + offset +" count "+ count);

    // reference to the list control
    var currentList = this._currentContextTemplate.list2Ctrl;
    var items = [];

    for (var i=0; i<count; i++)
    {
        var actualIndex = i + offset + 1;

        // skip empty items
        if (itemsList[i].item_Name == '')
        {
            log.warn('Empty item found in list: ' + actualIndex);
            continue;
        }

        switch(itemsList[i].item_Type)
        {
            case 84:
                if(this._cachedDiskType == "AudioCD" && !this._cachedDiscIsCDDA)
                {
                    items.push({
                        appData : {"appData" : "SelectTrackNumber", "type" : itemsList[i].item_Type, "index" : itemsList[i].item_Index},
                        text1 : itemsList[i].item_Name,
                        hasCaret : false,
                        image1 : 'common/images/icons/IcnListSong.png',
                        itemStyle : 'style01'
                    });
                }
                else if (this._cachedDiskType == "AudioCD" && this._cachedDiscIsCDDA)
                {
                    items.push({
                        appData : {"appData" : "SelectTrackNumber", "type" : itemsList[i].item_Type, "index" : itemsList[i].item_Index},
                        text1Id : "Track",
                        text1SubMap: {trackNumber: actualIndex},
                        hasCaret : false,
                        image1 : 'common/images/icons/IcnListSong.png',
                        itemStyle : 'style01'
                    });
                }
                else if(this._cachedDiskType == "DataCD" && this._currentContextTemplate.contextInfo.ctxtId === "ContentList")
                {
                    items.push({
                        appData : {"appData" : "SelectAudioFileName", "type" : itemsList[i].item_Type, "index" : itemsList[i].item_Index},
                        text1 : itemsList[i].item_Name,
                        hasCaret : false,
                        image1 : 'common/images/icons/IcnListSong.png',
                        itemStyle : 'style01'
                    });
                }
                else if(this._cachedDiskType == "DataCD" && this._currentContextTemplate.contextInfo.ctxtId === "TrackList")
                {
                    items.push({
                        appData : {"appData" : "SelectTrackNumber", "type" : itemsList[i].item_Type, "index" : itemsList[i].item_Index},
                        text1 : itemsList[i].item_Name,
                        hasCaret : false,
                        image1 : 'common/images/icons/IcnListSong.png',
                        itemStyle : 'style01'
                    });
                }
                break;
            case 70:
                items.push({
                    appData : {"appData" : "SelectFolderName", "type" : itemsList[i].item_Type, "index" : itemsList[i].item_Index},
                    text1 : itemsList[i].item_Name,
                    hasCaret : false,
                    image1 : 'common/images/icons/IcnListFolder.png',
                    itemStyle : 'style01'
                });
                break;
        }
    }

    if (currentList.hasDataList())
    {
        // we already have a datalist -> set new items
        currentList.dataList.vuiSupport = true;
        for (var i = 0; i < items.length; i++)
        {
            var currentIndex = items[i].appData.index;
            switch(items[i].appData.type)
            {
                case 84:
                    if(this._cachedDiskType == "AudioCD" && !this._cachedDiscIsCDDA)
                    {
                        currentList.dataList.items[currentIndex].appData = {"appData" : "SelectTrackNumber", "type" : items[i].appData.type, "index" : items[i].appData.item_Index};
                        currentList.dataList.items[currentIndex].text1 = items[i].text1;
                        currentList.dataList.items[currentIndex].hasCaret = false;
                        currentList.dataList.items[currentIndex].image1 = 'common/images/icons/IcnListSong.png';
                        currentList.dataList.items[currentIndex].itemStyle = 'style01';
                    }
                    else if(this._cachedDiskType == "AudioCD" && this._cachedDiscIsCDDA)
                    {
                        currentList.dataList.items[currentIndex].appData = {"appData" : "SelectTrackNumber", "type" : items[i].appData.type, "index" : items[i].appData.item_Index};
                        currentList.dataList.items[currentIndex].text1Id = items[i].text1Id;
                        currentList.dataList.items[currentIndex].text1SubMap = items[i].text1SubMap;
                        currentList.dataList.items[currentIndex].hasCaret = false;
                        currentList.dataList.items[currentIndex].image1 = 'common/images/icons/IcnListSong.png';
                        currentList.dataList.items[currentIndex].itemStyle = 'style01';
                    }
                    else if(this._cachedDiskType == "DataCD")
                    {
                        currentList.dataList.items[currentIndex].appData = {"appData" : "SelectAudioFileName", "type" : items[i].appData.type, "index" : items[i].appData.item_Index};
                        currentList.dataList.items[currentIndex].text1 = items[i].text1;
                        currentList.dataList.items[currentIndex].hasCaret = false;
                        currentList.dataList.items[currentIndex].image1 = 'common/images/icons/IcnListSong.png';
                        currentList.dataList.items[currentIndex].itemStyle = 'style01';
                    }
                    break;
                case 70:
                    currentList.dataList.items[currentIndex].appData = {"appData" : "SelectFolderName", "type" : items[i].appData.type, "index" : items[i].appData.item_Index};
                    currentList.dataList.items[currentIndex].text1 = items[i].text1;
                    currentList.dataList.items[currentIndex].hasCaret = false;
                    currentList.dataList.items[currentIndex].image1 = 'common/images/icons/IcnListFolder.png';
                    currentList.dataList.items[currentIndex].itemStyle = 'style01';
                    break;
            }
        }
        currentList.updateItems(offset, offset+count-1);
    }
    else
    {
        currentList.setLoading(false);
        // we still don't have a datalist -> set datalist
        var dataList = {};
        dataList.vuiSupport = true;
        dataList.itemCountKnown = true;
        dataList.itemCount = this._listTotalCount; // total no. of items in folder , not the no. of items in chunk

        log.error(" _addItemsToList  hasDataList, _listTotalCount = ",this._listTotalCount);

        dataList.items = items;
        currentList.setDataList(dataList);
        currentList.updateItems(0, count-1);
    }
};

cdApp.prototype._processOperationStatus = function (tmplt)
{
    if(this._cachedOperationStatus && this._cachedOperationStatus.operationStatus)
    {
        var sbLabelId = "";
        switch(this._cachedOperationStatus.operationStatus)
        {
            case "NoStatus":
                break;
            case "EjectingDisc":
                break;
            case "DiscEjected":
                break;
            case "LoadingDisc":
                break;
            case "DiscLoaded":
                break;
            case "Rewind":
                break;
            case "FastForward":
                break;
            case "TrackChanged":
                break;
            case "FolderChanged":
                break;
            case "SoftwareUpdating":
                break;
            case "SoftwareUpdateDone":
                break;
            case "Scanning":
                if (tmplt.nowPlaying4Ctrl.umpCtrl.properties.buttonConfig["scan"].currentState != "Sel")
                {
                    tmplt.nowPlaying4Ctrl.umpCtrl.setButtonState("scan","Sel");
                }
                if (tmplt.nowPlaying4Ctrl.umpCtrl.properties.buttonConfig["playpause"].currentState != "Pause")
                {
                    tmplt.nowPlaying4Ctrl.umpCtrl.setButtonState("playpause","Pause");
                }
                break;
            case "SlowFF":
                break;
            case "SlowREW":
                break;
            case "Standby":
                break;
            default:
                log.debug("Unknown operation status: " + this._cachedOperationStatus);
                break;
        }
    }
    if(this._cachedOperationStatus && (this._cachedOperationStatus.operationStatus != "Scanning" && this._cachedOperationStatus.operationStatus != "TrackChanged"))
    {
        if (tmplt.nowPlaying4Ctrl.umpCtrl.properties.buttonConfig["scan"].currentState != "Unsel")
        {
            tmplt.nowPlaying4Ctrl.umpCtrl.setButtonState("scan","Unsel");
        }

    }
};

// Populate NowPlaying control
cdApp.prototype._populatenowPlaying4Ctrl = function(tmplt)
{
    //Set track metadata and playstatus
    if (this._cachedDiskType == "AudioCD")
    {
        if (this._cachedCurrentMeta)
        {
            //Set song name
            if(this._cachedCurrentMeta.trackMetadata.songName)
            {
                var songName = {
                    "audioTitleId"   : null,
                    "audioTitleText" : this._cachedCurrentMeta.trackMetadata.songName,
                    "audioTitleIcon" : 'common/images/icons/IcnListSong.png',
                };
                tmplt.nowPlaying4Ctrl.setAudioTitle(songName,null);
            }
            //Set artist name
            if(this._cachedCurrentMeta.trackMetadata.artistName)
            {
                var detailLine1Obj = {
                    "detailTextId"   : null,
                    "detailText"     : this._cachedCurrentMeta.trackMetadata.artistName,
                    "detailIcon"     : "common/images/icons/IcnListContact_Placeholder.png",
                };
                tmplt.nowPlaying4Ctrl.setDetailLine1(detailLine1Obj,null);
            }
            //Set disc name
            if(this._cachedCurrentMeta.trackMetadata.discName)
            {
                var detailLine2Obj = {
                    "detailTextId"   : null,
                    "detailText"     : this._cachedCurrentMeta.trackMetadata.discName,
                    "detailIcon"     : "common/images/icons/IcnListCdPlayer_En.png",
                };
                tmplt.nowPlaying4Ctrl.setDetailLine2(detailLine2Obj,null);
            }
        }
    }


    if (this._cachedDiskType == "DataCD")
    {
        if (this._cachedCurrentMeta)
        {
            //Set song name
            if(this._cachedCurrentMeta.trackMetadata.songName)
            {
                var songName = {
                    "audioTitleId"   : null,
                    "audioTitleText" : this._cachedCurrentMeta.trackMetadata.songName,
                    "audioTitleIcon" : 'common/images/icons/IcnListSong.png',
                };
                tmplt.nowPlaying4Ctrl.setAudioTitle(songName,null);
            }
            //Set artist name
            if(this._cachedCurrentMeta.trackMetadata.artistName)
            {
                var detailLine1Obj = {
                    "detailTextId"   : null,
                    "detailText"     : this._cachedCurrentMeta.trackMetadata.artistName,
                    "detailIcon"     : "common/images/icons/IcnListContact_Placeholder.png",
                };
                tmplt.nowPlaying4Ctrl.setDetailLine1(detailLine1Obj,null);
            }
            //Set album name
            if(this._cachedCurrentMeta.trackMetadata.albumName)
            {
                var detailLine2Obj = {
                    "detailTextId"   : null,
                    "detailText"     : this._cachedCurrentMeta.trackMetadata.albumName,
                    "detailIcon"     : "common/images/icons/IcnListCdPlayer_En.png",
                };
                tmplt.nowPlaying4Ctrl.setDetailLine2(detailLine2Obj,null);
            }
            //Set folder/playlist name
            if(this._cachedCurrentMeta.trackMetadata.folderName)
            {
                var detailLine3Obj = {
                    "detailTextId"   : null,
                    "detailText"     : this._cachedCurrentMeta.trackMetadata.folderName,
                    "detailIcon"     : "common/images/icons/IcnListFolder.png",
                };
                tmplt.nowPlaying4Ctrl.setDetailLine3(detailLine3Obj,null);
            }
        }
    }

};
cdApp.prototype._setContentArt = function (imagePath)
{
    // this._currentContextTemplate.nowPlaying4Ctrl.setImagePath(imagePath);
};

cdApp.prototype._clearNowPlayingData = function ()
{
    this._setContentArt("./common/images/no_artwork_icon.png");
    this._currentContextTemplate.nowPlaying4Ctrl.setAudioTitle({audioTitleText: ""});
    this._currentContextTemplate.nowPlaying4Ctrl.setDetailLine1({detailTextId: ""});
    this._currentContextTemplate.nowPlaying4Ctrl.setDetailLine2({detailText: ""});
    this._currentContextTemplate.nowPlaying4Ctrl.setDetailLine3({detailText: ""});
    this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.updateScrubber(0);

};

cdApp.prototype._startLoading = function ()
{
    // disable buttons if in now playing
    // clear cache but do not clear repeat, shuffle and play buttons states
    this._cachedOperationStatus = null;
    this._cachedCurrentMeta = null;
    this._cachedAlbumArt = null;
    this._cachedNotification = null;
    this._cachedUserSelection  = null;
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "NowPlaying")
    {
        // clear now playing fields
        this._clearNowPlayingData();
    }
    this._loading = false;
};

// populate cover art
cdApp.prototype._populateCoverArt = function (coverArt)
{
    if (coverArt)
    {
        // this._currentContextTemplate.nowPlaying4Ctrl.setImagePath(coverArt);
    }
    else
    {
        // this._currentContextTemplate.nowPlaying4Ctrl.setImagePath("./common/images/no_artwork_icon.png");
    }
};

cdApp.prototype._formatTime = function(time)
{
    if (time.hours == undefined) time.hours = "0";
    if (time.minutes == undefined) time.minutes = "0";
    if (time.seconds == undefined) time.seconds = "0";


    time.hours = time.hours.toString();
    time.minutes = time.minutes.toString();
    time.seconds = time.seconds.toString();

    if (time.hours.length == 1)
    {
        time.hours = "0" + time.hours;
    }

    if (time.minutes.length == 1)
    {
        time.minutes = "0" + time.minutes;
    }

    if (time.seconds.length == 1)
    {
        time.seconds = "0" + time.seconds;
    }

    var formattedTime = "";
    formattedTime = time.hours + ":" + time.minutes + ":" + time.seconds;
    return formattedTime;
};

cdApp.prototype._updateProgressBar = function(total,elapsed)
{
    var elapsedSeconds = (parseInt(elapsed.hours, 10) * 3600) + (parseInt(elapsed.minutes, 10) * 60) + parseInt(elapsed.seconds, 10);
    var totalSeconds = (parseInt(total.hours, 10) * 3600) + (parseInt(total.minutes, 10) * 60) + parseInt(total.seconds, 10);

    var progress = elapsedSeconds/totalSeconds;
    this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.updateScrubber(progress);
};

cdApp.prototype._updateTime = function()
{
    if(this._cachedCurrentTrackPlayStatus)
	{
		
		if (this._cachedCurrentTrackPlayStatus.length != undefined)
		{
			this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setTotalTime(this._formatTime(this._cachedCurrentTrackPlayStatus.length));
		}
		if (this._cachedCurrentTrackPlayStatus.elapsed != undefined)
		{
			this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setElapsedTime(this._formatTime(this._cachedCurrentTrackPlayStatus.elapsed));
		}
		if (this._cachedCurrentTrackPlayStatus.length != undefined && this._cachedCurrentTrackPlayStatus.elapsed != undefined)
		{
			this._updateProgressBar(this._cachedCurrentTrackPlayStatus.length, this._cachedCurrentTrackPlayStatus.elapsed);
		}
	}
	else
	{
	  log.debug(" current track play status info not received yet so not updating the time..");
	}
};

cdApp.prototype._updatePlayPauseState = function(status)
{
    switch(status.operationStatus)
    {
        case "Playing":
        if (this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.properties.buttonConfig["playpause"].currentState != "Pause")
        {
            this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonState("playpause","Pause");
        }
        break;
        case "Paused":
        if (this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.properties.buttonConfig["playpause"].currentState != "Play")
        {
            this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonState("playpause","Play");
        }
        break;
    }
};

cdApp.prototype._updateTitle = function (tmplt)
{
    if(this._cachedDiskType == "AudioCD")
    {
		if(this._cachedCurrentTrackPlayStatus)
		{
			// check if the metadata is correct and create the title object
			if (this._cachedCurrentTrackPlayStatus.currentTrackNumber === undefined || this._cachedCurrentTrackPlayStatus.currentTrackNumber === null)
			{
					this._cachedCurrentTrackPlayStatus.currentTrackNumber = 0;
			}
		
			if (this._cachedTrackCount == null || this._cachedTrackCount == undefined)
			{
				this._cachedTrackCount = "-";
			}

			var titleObj  = {
				"ctrlTitleId" : "NowPlayingCurrentTrack",
				"ctrlTitleIcon" : null ,
				"subMap" : {currentFile : this._cachedCurrentTrackPlayStatus.currentTrackNumber, totalFiles : this._cachedTrackCount},
			};

			tmplt.nowPlaying4Ctrl.setCtrlTitle(titleObj);
		}
    }
    else
    {
		if(this._cachedCurrentTrackPlayStatus)
		{
			// check if the metadata is correct and create the title object
			if(this._cachedCurrentTrackPlayStatus.currentTrackNumber === undefined || this._cachedCurrentTrackPlayStatus.currentTrackNumber === null)
			{
				this._cachedCurrentTrackPlayStatus.currentTrackNumber = 0;
			}
			
			if (this._cachedTrackCount == null || this._cachedTrackCount == undefined)
			{
				this._cachedTrackCount = "-";
			}

			var titleObj  = {
				"ctrlTitleId" : "NowPlayingCurrentFileNumber",
				"ctrlTitleIcon" : null ,
				"subMap" : {currentFile : this._cachedCurrentTrackPlayStatus.currentTrackNumber, totalFiles : this._cachedTrackCount},
			};

			tmplt.nowPlaying4Ctrl.setCtrlTitle(titleObj);
		}
    }
};

cdApp.prototype._updateShuffleButton = function (tmplt)
{
    //Set the shuffle button
    if(this._cachedShuffleSetting == "ShuffleOff")
    {
        if (tmplt.nowPlaying4Ctrl.umpCtrl.properties.buttonConfig["shuffle"].currentState != "Off")
        {
            tmplt.nowPlaying4Ctrl.umpCtrl.setButtonState("shuffle","Off");
        }
    }
    if(this._cachedShuffleSetting == "ShuffleDisk")
    {
        if (tmplt.nowPlaying4Ctrl.umpCtrl.properties.buttonConfig["shuffle"].currentState != "On")
        {
            tmplt.nowPlaying4Ctrl.umpCtrl.setButtonState("shuffle","On");
        }
    }
    if(this._cachedShuffleSetting == "ShuffleFolder")
    {
        if (tmplt.nowPlaying4Ctrl.umpCtrl.properties.buttonConfig["shuffle"].currentState != "Folder")
        {
            tmplt.nowPlaying4Ctrl.umpCtrl.setButtonState("shuffle","Folder");
        }
    }
};

cdApp.prototype._updateRepeatButton = function (tmplt)
{
        //Set the repeat button
    if(this._cachedRepeatSetting == "RepeatOff")
    {
        if (tmplt.nowPlaying4Ctrl.umpCtrl.properties.buttonConfig["repeat"].currentState != "None")
        {
            tmplt.nowPlaying4Ctrl.umpCtrl.setButtonState("repeat","None");
        }

    }
    if(this._cachedRepeatSetting == "RepeatTrack")
    {
        if (tmplt.nowPlaying4Ctrl.umpCtrl.properties.buttonConfig["repeat"].currentState != "Song")
        {
            tmplt.nowPlaying4Ctrl.umpCtrl.setButtonState("repeat","Song");
        }
    }
    if(this._cachedRepeatSetting == "RepeatFolder")
    {
        if (tmplt.nowPlaying4Ctrl.umpCtrl.properties.buttonConfig["repeat"].currentState != "List")
        {
            tmplt.nowPlaying4Ctrl.umpCtrl.setButtonState("repeat","List");
        }
    }
};

cdApp.prototype._updateScanningButton = function(tmplt)
{
    if(!this._cachedOperationStatus)
    {
        return
    }
    if(this._cachedOperationStatus.operationStatus == "Scanning")
    {
        tmplt.nowPlaying4Ctrl.umpCtrl.setButtonState("scan", "Sel");
    }
    else
    {
        tmplt.nowPlaying4Ctrl.umpCtrl.setButtonState("scan", "Unsel");
    }
}


// Let framework know that this file has finished loading
framework.registerAppLoaded("cd", null, true);
