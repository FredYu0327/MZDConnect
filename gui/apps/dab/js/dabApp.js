/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: dabApp.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: aupparv
 Date: 12th December 2013
 __________________________________________________________________________

 Description: IHU GUI dab App
 Revisions:
 v0.1 (15-August-2012) dabApp created with Nowplaying - aupparv
_____________________________________________________________________________________________
*/

function dabApp(uiaId)
{
    baseApp.init(this, uiaId);
}


/**************************
 * Standard App Functions *
 **************************/

/*
 * Called just after the app is instantiated by framework.
 */
dabApp.prototype.appInit = function()
{
    if (framework.debugMode)
    {
        utility.loadScript("apps/dab/test/dabAppTest.js");
    }

    // cache added by asethab
    this._cachedChannelNum = "";
    this._cachedEnsembleName = "";
    this._cachedComponentName = "";
    this._cachedServiceName = "";
    this._cachedRadioText = "";
    this._cachedScanState = false;
    this._cachedTAState = false;
    this._cachedFavState = false;
    this._cachedUpdatedMetaData = null;
    this._operationMode = null;
    this._cachedErrorStatus = null;
    //newly added variables
    this._cachedStationList = new Array();
    this._cachedEnsembleList = new Array();
    this._cachedComponentList = new Array();
    this._startLoading = false;
    this._updateComplete = false;
    this._requestCountforComponentList = 0;
    this._responseCountforComponentList = 0;
    this._currentEnsId = null;
    this._currentCompId = null;
    this._currentServId = null;
    this._dabLinkSetting = true;
    this._fmLinkSetting = true;
    this._radioTextSetting = true;
    this._bandSetting = "BAND_BAND3";
    this._currentlySelectedEnsembleId = 0;
    this._currentlyFocusedStationIndex = 0;

    this._dlPlusMessage = true;
    this._stageCount = 0;
    // Datalist for the HDChannels
    this._hdChannelsDataList = null;
    this._cachedOperationMode = null;
    //added for DAB DL+ implementation
    this._cachedSongName = "";
    this._cachedArtistName = "";
    this._cachedAlbumName = "";
    this._cachedGenre = "";

    // Buttons Config for DAB -DAB
    this._umpDABNowPlaying = new Object();

    //Source
    this._umpDABNowPlaying["SelectSource"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpEntMenu",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectSource"
    };

    //Station List
    this._umpDABNowPlaying["DisplayStationList"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpCurrentList",
        disabled : false,
        buttonClass : "normal",
        appData : "DisplayStationList"
    };

    //favorites
    this._umpDABNowPlaying["SelectFavorites"] =
    {
        buttonBehavior : "shortAndLong",
        imageBase : "IcnUmpFavorite",
        currentState:"Unfavorite",
        stateArray: [
            {
                state:"Unfavorite", labelId :"common.TooltipFavorites"
            }
        ],
        appData : "SelectFavorites"
    };

    //Scan
    this._umpDABNowPlaying["SelectScan"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpScan",
        currentState:"Unsel",
        stateArray: [
            {
                state:"Unsel"
            },
            {
                state:"Sel"
            }
        ],
        disabled : false,
        buttonClass : "normal",
        appData : "SelectScan"
    };

    //Scan
    this._umpDABNowPlaying["TAToggle"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpTrafficAlert",
        currentState:"Unsel",
        stateArray: [
            {
                state:"Unsel",labelId : "DABTrafficAlertOn"
            },
            {
                state:"Sel",labelId : "DABTrafficAlertOff"
            }
        ],
        disabled : false,
        buttonClass : "normal",
        appData : "TAToggle"
    };

    //SelectSeekPrevious
    this._umpDABNowPlaying["SelectSeekPrevious"] =
    {
        buttonBehavior : "shortAndHold",
        imageBase : "IcnUmpPreviousAudio",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectSeekPrevious"
    };

    //SelectSeekNext
    this._umpDABNowPlaying["SelectSeekNext"] =
    {
        buttonBehavior : "shortAndHold",
        imageBase : "IcnUmpNextAudio",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectSeekNext"
    };

    //DAB Settings
    this._umpDABNowPlaying["DisplayDABSettings"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpCtrlPanel",
        disabled : false,
        labelId: "DABSettings",
        buttonClass : "normal",
        appData : "DisplayDABSettings"
    };

    //Settings
    this._umpDABNowPlaying["SelectSettings"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpEqualizer",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectSettings"
    };
    // DAB

    //Ensemble List data
    this._ensembleListCtxtDataList = {
        itemCountKnown : true,
        itemCount : 0,
        vuiSupport : true,
        items: []
    };

    //Station List data
    this._stationListCtxtDataList = {
            itemCountKnown : true,
            itemCount : 2,
            vuiSupport : true,
            items: [
                    { appData : "UpdateStationList", text1Id : "DABUpdateList", itemStyle : "style02", disabled : false, hasCaret:false},
                    { appData : "DisplayEnsembleList", text1Id : "DABSelectEnsemble", itemStyle : "style02", disabled : true, hasCaret:true},
                ]
        };

    this._settingsListCtxtDataList = {
        itemCountKnown : true,
        itemCount : 0,
        vuiSupport : false,
        items: []
    };

    this._bandSettingsListCtxtDataList = {
        itemCountKnown : true,
        itemCount : 3,
        vuiSupport : false,
        items: [
            { appData : "BandIIISelected", text1Id : "DABBandIII", itemStyle : "style03", hasCaret : false, checked : false, image1:'tick' },
            { appData : "LBandSelected", text1Id : "DABLBand", itemStyle : "style03", hasCaret : false, checked : false, image1:'tick' },
            { appData : "BOTHSelected", text1Id : "DABBoth", itemStyle : "style03", hasCaret : false, checked : false, image1:'tick' }
        ]
    };

    //@formatter:off
    this._contextTable = {
        //Nowplaying DAB
        "NowPlaying" : {
            "template" : "NowPlaying4Tmplt",
            "sbNameId" : "DABRadio",
            "controlProperties" : {
                "NowPlayingCtrl" : {
                    "ctrlStyle" : "Style7",
                    "loadingIcon" : false,
                    "umpConfig" : {
                        "buttonConfig" : this._umpDABNowPlaying,
                        "fullConfig"    : false,
                        "defaultSelectCallback" : this._umpDefaultSelectCallback.bind(this),
                        "defaultHoldStartCallback" : this._umpDefaultHoldStartCallback.bind(this),
                        "defaultHoldStopCallback" : this._umpDefaultHoldStopCallback.bind(this),
                        "defaultLongPressCallback" : this._umpDefaultLongPressCallback.bind(this),
                        "umpStyle" : "fullWidth",
                        "hasScrubber" : false,
                        "title" : {
                            titleStyle : "oneLine"
                        },
                    }
                } // end of properties for "NowPlayingCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._DABNowPlayingCtxtReadyToDisplay.bind(this)
        },// end of NowPlaying

        "EnsembleList" : {
            "template" : "List2Tmplt",
            "sbNameId" : "DABRadio",
            "leftBtnStyle": "goBack",
            "controlProperties" : {
                "List2Ctrl" : {
                    numberedList : true,
                    titleConfiguration : 'listTitle',
                    title : {
                        text1Id : "DABEnsembleListTitle2",
                        titleStyle : "style02"
                    },
                    protectDataList : true,
                    selectCallback : this._listItemClickCallback.bind(this)
                } // end of properties for "ListCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._EnsembleListCtxtReadyToDisplay.bind(this)
        }, // end of "GenreList"

       "StationList" : {
            "template" : "List2Tmplt",
            "sbNameId" : "DABRadio",
            "leftBtnStyle": "goBack",
            "controlProperties" : {
                "List2Ctrl" : {
                    numberedList : true,
                    titleConfiguration : 'listTitle',
                    title : {
                        text1Id : "StationListTab",
                        titleStyle : "style02"
                    },
                    protectDataList : true,
                    selectCallback : this._listItemClickCallback.bind(this),
                    longPressCallback : this._listLongPressCallback.bind(this)
                } // end of properties for "ListCtrl"
            }, // end of list of controlProperties
            "readyFunction"         :  this._StationListCtxtReadyToDisplay.bind(this),
            "contextInFunction"     :  null,
            "displayedFunction"     :  this._StationListCtxtDisplayed.bind(this)
        }, // end of "GenreList"

        //DABSettings
        "DABSettings" : {
            "template" : "List2Tmplt",
            "sbNameId" : "DABRadio",
            "leftBtnStyle": "goBack",
            "controlProperties" : {
                "List2Ctrl" : {
                    numberedList : false,
                    titleConfiguration : 'listTitle',
                    title : {
                        text1Id : "DABSettings",
                        titleStyle : "style02"
                    },
                    selectCallback : this._listItemClickCallback.bind(this)
                } // end of properties for "ListCtrl"
            }, // end of list of controlProperties
            "readyFunction"     : null,
            "contextInFunction" :  null,
            "displayedFunction" :  this._DabSettingsCtxtTmpltDisplayed.bind(this)
        },//end of "DABSettings"

        //DABBands
        "DABBands" : {
            "template" : "List2Tmplt",
            "sbNameId" : "DABRadio",
            "leftBtnStyle": "goBack",
            "controlProperties" : {
                "List2Ctrl" : {
                    numberedList : false,
                    dataList : this._bandSettingsListCtxtDataList,
                    titleConfiguration : 'listTitle',
                    title : {
                        text1Id : "DABBandSettingsTitle",
                        titleStyle : "style02"
                    },
                    selectCallback : this._listItemClickCallback.bind(this)
                } // end of properties for "ListCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._DABBandsCtxtTmpltReadyToDisplay.bind(this)
        },//end of "DABBands"

        "StationListNotAvailable" : {
            "template" : "Dialog3Tmplt",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),
                    "contentStyle" : "style23",
                    "buttonCount" : 2,
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "common.Cancel",
                            appData : "Global.Cancel"
                        },
                        "button2" : {
                            labelId : "DABUpdate",
                            appData : "UpdateStationList"
                        }
                    }, // end of buttonConfig
                    "text1Id" : "DABListNotAvailable",
                    "text2Id" : "DABUpdateStation",
                } // end of properties for "Dialog3Ctrl"
            }, // end of list of controlProperties
            "readyFunction" : this._StationListNotAvailableReadyToDisplay.bind(this)
        }, // end of "StationListNotAvailable"

    };// end of this.contextTable

    //@formatter:off
    this._messageTable = {
        "ChannelInfo" : this._ChannelInfoMsgHandler.bind(this),
        "MeataDataInfoChange" : this._MeataDataInfoChangeMsgHandler.bind(this),
        "ClearLabel" : this._ClearLabelMsgHandler.bind(this),
        "ScanStatus" : this._ScanStatusMsgHandler.bind(this),
        "DABTAStatus" : this._DABTAStatusHandler.bind(this),
        "EnsembleListStatus" : this._EnsembleListStatusHandler.bind(this),
        "ComponentListStatus" : this._ComponentListStatusHandler.bind(this),
        "FullListUpdateStatus" : this._FullListUpdateStatusHandler.bind(this),
        "NewListAvailable" : this._NewListAvailableStatusHandler.bind(this),
        "SaveFavStationFrmList" : this._SaveFavStationFrmListHandler.bind(this),
        "DabTunerStatus" : this._DabTunerStatusHandler.bind(this),
        "DabLinkSettingInfo" : this._DabLinkSettingInfoHandler.bind(this),
        "RadioTextSettingStatus" : this._RadioTextSettingStatusHandler.bind(this),
        "BandSettingStatus" : this._BandSettingStatusHandler.bind(this),
        // SBN messages
        "SBNStationListStatus" : this._SBNStationListStatusHandler.bind(this),
		"TimedSBN_NowPlayingInfo" : this._TimedSBN_NowPlayingInfoHandler.bind(this), 
        //VUI messages
        "ShowLoadingMeterOnVui" : this._ShowLoadingMeterOnVuiHandler.bind(this),
    };// end of this._messageTable

    //@formatter:on
};

/**************************
 * General App Functions
 **************************/
/*
 * This function is called by Common whenever a msgType="alert" comes from MMUI.
 * This function should return a properties Object to use for the WinkCtrl.
 */
dabApp.prototype.getWinkProperties = function(alertId, params)
{
    var winkProperties = null;
    switch(alertId)
    {
        case "StationListUpdateFailed_Alert":
            winkProperties = {
                "style": "style01",
                "text1Id": "DABStationListUpdateFailedSelect",
            };
            break;
        default:
            // if alertId cannot be found, winkProperties will return null and Common will display default Wink
            break;
    }
    // return the properties to Common
    return winkProperties;
};

// compareWithLongList function
dabApp.prototype._compareWithLongList = function(index)
{
    var compId = null;
    var ensId = null;
    var srvId = null;
    var playComponentDetails = {
            "chNum":null , "ens_id" : null, "serv_id" : null, "comp_id" : null
    };
    compId = this._stationListCtxtDataList.items[index].appData.compID;
    ensId = this._stationListCtxtDataList.items[index].appData.ensID;
    srvId = this._stationListCtxtDataList.items[index].appData.srvId;
    for(var i = 0; i < this._cachedComponentList.length; i++)
    {
        if(compId == this._cachedComponentList[i].cmpId && ensId == this._cachedComponentList[i].ensId
            && srvId == this._cachedComponentList[i].srvId)
        {
            playComponentDetails.chNum = this._cachedComponentList[i].chNum;
            playComponentDetails.ens_id = this._cachedComponentList[i].ensId;
            playComponentDetails.serv_id = this._cachedComponentList[i].srvId;
            playComponentDetails.comp_id = this._cachedComponentList[i].cmpId;
            break;
        }
    }
    return playComponentDetails;
};

// Set Focus on Ensemble
dabApp.prototype._setFocusEnsemble = function()
{
    for(var i=0; i<this._stationListCtxtDataList.items.length; i++)
    {
        if(this._stationListCtxtDataList.items[i].appData.ensID == this._currentlySelectedEnsembleId)
        {
            //Settings the Focus In side!!!
            this._currentlyFocusedStationIndex = i;
            break;
        }
    }
};

//_clearRadioTextItems function
dabApp.prototype._clearRadioTextItems = function(index)
{
    this._cachedRadioText = "";
    this._dlPlusMessage = false;
    this._cachedSongName = "";
    this._cachedArtistName = "";
    this._cachedAlbumName = "";
    this._cachedGenre = "";
};
/**************************
 * Context handlers
 **************************/
// DAB NowPlaying Template :
dabApp.prototype._DABNowPlayingCtxtReadyToDisplay = function()
{
    //Populate Now Playing Template
    this._currentlyFocusedStationIndex = 0;
    this._currentlySelectedEnsembleId = 0;
    if(this._currentContextTemplate)
    {
        var params = {};
        //Clearing All Fields
        this._cachedEnsembleName = "";
        this._cachedComponentName = "";
        this._cachedServiceName = "";
        //Clear Radio Text Fields
        this._clearRadioTextItems();

        //Scan State
        if(this._cachedScanState)
            this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonState("SelectScan", "Sel");
        else
            this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonState("SelectScan", "Unsel");
        //TA State
        if(this._cachedTAState)
            this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonState("TAToggle", "Sel");
        else
            this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonState("TAToggle", "Unsel");

        if(this._cachedErrorStatus && this._cachedErrorStatus != "STATUS_NO_SIGNAL" && this._operationMode != "DAB_LINK_SEARCH_MODE" && this._operationMode != "POWER_OFF_MODE"
            && this._operationMode != "ENSEMBLE_SEEK_UP_CHANGE_MODE" && this._operationMode != "ENSEMBLE_SEEK_DOWN_CHANGE_MODE")
        {
            if(this._operationMode != "FM_LINK_MODE" && this._radioTextSetting == true)
            {
                if(this._cachedUpdatedMetaData && this._cachedUpdatedMetaData.dlplus_content_type != "DLPLUS_NONE")
                {
                    //send request to DBAPI to fetch the DL+ data
                    framework.sendRequestToDbapi(this.uiaId, this._getDABDLPlusMetadataCallbackFn.bind(this), "radio", "DabDLPlusNowPlayingMetadata",params);
                }
                framework.sendRequestToDbapi(this.uiaId, this._getRadioTextCallbackFn.bind(this), "radio", "DabNowPlayingMetadata", params);
            }
            framework.sendRequestToDbapi(this.uiaId, this._getMetadataCallbackFn.bind(this), "radio", "DabNowPlayingContext", params);
        }
        else
        {
            this._populateNowPlayingDab();
        }
    }
};

// dab Ensemble List Context
dabApp.prototype._EnsembleListCtxtReadyToDisplay = function()
{
    this._populateEnsembleList(this._cachedEnsembleList);
};

//dab Station List Context ReadyToDisplay
dabApp.prototype._StationListCtxtReadyToDisplay = function()
{
    if((this._cachedEnsembleList.length <= 0) && (this._stageCount == 0))
    {
        this._RequestFullStationList();
    }
    else
    {
        this._populateStationStage(this._stageCount);
    }
};

//dab Station List Context Displayed
dabApp.prototype._StationListCtxtDisplayed = function()
{
    if(this._stageCount == 4 || this._stageCount == 5)
    {
        this._setFocusEnsemble();
        var focusMode = this._currentContextTemplate.list2Ctrl.getFocusMode();
        if(focusMode == 'mainList')
        {
            this._currentContextTemplate.list2Ctrl._showFocus(this._currentlyFocusedStationIndex);
        }
    }
};

//Dab Settings Ready To Display
dabApp.prototype._DabSettingsCtxtTmpltDisplayed = function()
{
    this._populateDabSettingsList();
};

//Band Settings Ready To Display
dabApp.prototype._DABBandsCtxtTmpltReadyToDisplay = function()
{
    this._currentContextTemplate.list2Ctrl.setTick(0, false);//setTick(itemIndex, value)
    this._currentContextTemplate.list2Ctrl.setTick(1, false);
    this._currentContextTemplate.list2Ctrl.setTick(2, false);

    if(this._bandSetting == "BAND_BAND3")
        this._currentContextTemplate.list2Ctrl.setTick(0, true);
    else if(this._bandSetting == "BAND_LBAND")
        this._currentContextTemplate.list2Ctrl.setTick(1, true);
    else if(this._bandSetting == "BAND_BOTH")
        this._currentContextTemplate.list2Ctrl.setTick(2, true);
};

//StationListNotAvailable ReadyToDisplay
dabApp.prototype._StationListNotAvailableReadyToDisplay = function()
{
    this._currentContextTemplate.dialog3Ctrl._selectBtn(1);
};

/**************************
 * Message handlers
 **************************/

//Get Channel info from MMUI
dabApp.prototype._ChannelInfoMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.ChannelInfo)
    {
        this._cachedChannelNum = msg.params.payload.ChannelInfo.chNum;
        this._currentEnsId = msg.params.payload.ChannelInfo.ensId;
        this._currentServId = msg.params.payload.ChannelInfo.sid;
        this._currentCompId = msg.params.payload.ChannelInfo.cmpId;
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying")
        {
            this._populateNowPlayingDab();
        }
        else if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "StationList")
        {
            this._populateStationStage(this._stageCount);
        }
    }
};

//Get the meta data  info  from MMUI and changed  info  from MMUI and call to dbapi to get data from DB.
dabApp.prototype._MeataDataInfoChangeMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.MetadataChangeDetails)
    {
        var params = {};
        this._cachedUpdatedMetaData = msg.params.payload.MetadataChangeDetails;

        if(this._operationMode != "FM_LINK_MODE" && this._radioTextSetting == true)
        {
            if(this._cachedUpdatedMetaData != null && this._cachedUpdatedMetaData.metadata_radio_text_changed)
            {
                if(this._cachedUpdatedMetaData.dlplus_content_type != "DLPLUS_NONE")
                {
                    framework.sendRequestToDbapi(this.uiaId, this._getDABDLPlusMetadataCallbackFn.bind(this), "radio", "DabDLPlusNowPlayingMetadata",params);
                }
                else
                {
                    this._clearRadioTextItems();
                }
            }
            //Send Request to fetch Radio Text
            framework.sendRequestToDbapi(this.uiaId, this._getRadioTextCallbackFn.bind(this), "radio", "DabNowPlayingMetadata", params);
            //Send Request to fetch Updated
            framework.sendRequestToDbapi(this.uiaId, this._getUpdatedMetadataCallbackFn.bind(this), "radio", "DabNowPlayingContext",params);
        }
        else
        {
            framework.sendRequestToDbapi(this.uiaId, this._getUpdatedMetadataCallbackFn.bind(this), "radio", "DabNowPlayingContext",params);
        }
    }
};

//DabTunerStatusHandler called
dabApp.prototype._DabTunerStatusHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.DabTunerStatus)
    {
        var params = {};
        this._operationMode = msg.params.payload.DabTunerStatus.operation_mode;
        this._cachedErrorStatus = msg.params.payload.DabTunerStatus.error_status;

        if(this._operationMode == "FM_LINK_MODE")
        {
            this._clearRadioTextItems();
        }

        if(this._operationMode != "SCAN_MODE")
        {
            this._cachedScanState = false;
            if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying")
            {
                this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonState("SelectScan", "Unsel");
            }
        }

        if(this._operationMode == "LIST_UPDATE_MODE")
        {
            this._startLoading = true;
            if(this._stageCount<1)
                this._stageCount = 1;
            if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "StationList")
            {
                this._populateStationStage(this._stageCount);
            }
        }
        if(this._operationMode != "POWER_OFF_MODE")
        {
            if(this._cachedErrorStatus && this._cachedErrorStatus != "STATUS_NO_SIGNAL" && this._operationMode != "DAB_LINK_SEARCH_MODE" 
                && this._operationMode != "ENSEMBLE_SEEK_UP_CHANGE_MODE" && this._operationMode != "ENSEMBLE_SEEK_DOWN_CHANGE_MODE")
            {
                if(this._operationMode != "FM_LINK_MODE" && this._radioTextSetting == true)
                {
                    if(this._cachedUpdatedMetaData != null && this._cachedUpdatedMetaData.metadata_radio_text_changed)
                    {
                        if(this._cachedUpdatedMetaData.dlplus_content_type != "DLPLUS_NONE")
                        {
                            framework.sendRequestToDbapi(this.uiaId, this._getDABDLPlusMetadataCallbackFn.bind(this), "radio", "DabDLPlusNowPlayingMetadata",params);
                        }
                        else
                        {
                            this._clearRadioTextItems();
                        }
                    }
                    framework.sendRequestToDbapi(this.uiaId, this._getRadioTextCallbackFn.bind(this), "radio", "DabNowPlayingMetadata", params);
                }
                framework.sendRequestToDbapi(this.uiaId, this._getMetadataCallbackFn.bind(this), "radio", "DabNowPlayingContext",params);
            }
            else if(this._cachedErrorStatus == "STATUS_NO_SIGNAL" ||
                    this._operationMode == "ENSEMBLE_SEEK_UP_CHANGE_MODE" ||
                    this._operationMode == "ENSEMBLE_SEEK_DOWN_CHANGE_MODE")
            {
                //Clearing All Fields
                this._cachedEnsembleName = "";
                this._cachedComponentName = "";
                this._cachedServiceName = "";
                //Clear Radio Text items
                this._clearRadioTextItems();
            }

            if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying")
            {
                this._populateNowPlayingDab();
            }
        
        }
    }
};

//ClearLabelMsgHandler called
dabApp.prototype._ClearLabelMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.LabelFieldDeatils)
    {
        var LabelFieldDeatils = msg.params.payload.LabelFieldDeatils;

        if(LabelFieldDeatils.ens_field)
            this._cachedEnsembleName = "";

        if(LabelFieldDeatils.compo_field)
            this._cachedComponentName = "";

        if(LabelFieldDeatils.ch_field)
            this._cachedChannelNum = "";

        if(LabelFieldDeatils.radio_text_field)
        {
            this._clearRadioTextItems();
        }

        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying")
        {
            this._populateNowPlayingDab();
        }
    }
};

//Scan Status message received from MMUI
dabApp.prototype._ScanStatusMsgHandler = function(msg)
{
    var scanState = false;
    if (msg && msg.params && msg.params.payload)
    {
        scanState = msg.params.payload.ScanOn;
        if(scanState != this._cachedScanState)
        {
            var scanSel_Unsel = "Unsel";
            this._cachedScanState = scanState;
            if(this._cachedScanState)
            {
                scanSel_Unsel = "Sel";
            }
            this._setScanToggleUMPCtrl(this._currentContextTemplate, scanSel_Unsel);
        }
    }
};

//Traffic Alert Status received from MMUI
dabApp.prototype._DABTAStatusHandler = function(msg)
{
    var TAState = false;
    if (msg && msg.params && msg.params.payload)
    {
        TAState = msg.params.payload.DABTASetting;
        if(TAState != this._cachedTAState)
        {
            var TASel_Unsel = "Unsel";
            this._cachedTAState = TAState;
            if(this._cachedTAState)
            {
                TASel_Unsel = "Sel";
            }
            this._setTAToggleUMPCtrl(this._currentContextTemplate, TASel_Unsel);
        }
    }
};

//_RequestFullStationList
dabApp.prototype._RequestFullStationList = function()
{
    this._updateComplete = false;
    this._startLoading = true;
    this._stageCount = 1;
    this._cachedStationList = new Array();
    this._cachedEnsembleList = new Array();
    this._cachedComponentList = new Array();
    this._requestCountforComponentList = 0;
    this._responseCountforComponentList = 0;
    if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "StationList")
    {
        this._populateStationStage(this._stageCount);
    }
    var params =
    {
        "index": 0,
        "limit": 255
    };
    framework.sendRequestToDbapi(this.uiaId, this._getEnsembleAndComponentListCallbackFn.bind(this), "radio", "DabEnsembleAndComponentList", params);
};

// EnsembleListStatusHandler
dabApp.prototype._EnsembleListStatusHandler = function(msg)
{
    var listStatus = null;
    this._requestCountforComponentList = 0;
    this._responseCountforComponentList = 0;
    if (msg && msg.params && msg.params.payload)
    {
        listStatus = msg.params.payload.ListStatus;
        if(listStatus == true)
        {
            var params =
            {
                "index": 0,
                "limit": 255
            };
            framework.sendRequestToDbapi(this.uiaId, this._getEnsembleListCallbackFn.bind(this), "radio", "DabEnsembleList", params);
        }
    }
};

//_ComponentListStatusHandler
dabApp.prototype._ComponentListStatusHandler = function(msg)
{
    var listStatus = null;
    var ensId = null;
    if (msg && msg.params && msg.params.payload)
    {
        listStatus = msg.params.payload.ListStatus.status;
        ensId = msg.params.payload.ListStatus.ens_id;
        if(listStatus == true && ensId>=0)
        {
            this._requestCountforComponentList++;
            var params =
            {
                "ensId": ensId,
                "index": 0,
                "limit": 255
            };
            framework.sendRequestToDbapi(this.uiaId, this._getComponentListCallbackFn.bind(this), "radio", "DabComponentList", params);
        }
        else if(listStatus == false && ensId>=0)
        {
            if(this._cachedStationList.ensembleList)
            {
                for (var i = 1; i < this._cachedStationList.ensembleList.length; i++)
                {
                    if(ensId == this._cachedStationList.ensembleList[i].ensId)
                    {
                        this._cachedStationList.ensembleList.splice(i, 1);
                        //change in this._cachedEnsembleList also
                        this._cachedEnsembleList.splice(i-1, 1);
                    }
                }
            }
        }
    }
};

//_FullListUpdateStatusHandler
dabApp.prototype._FullListUpdateStatusHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload)
    {
        this._fullListUpdate = msg.params.payload.FullListUpdate;

        this._updateComplete = true;
        this._startLoading = false;
        if(this._fullListUpdate == "FULL_LIST_SUCCESSFUL")
        {
            //Check if request and response from DBAPI for Component are equal...
            if(this._requestCountforComponentList == this._responseCountforComponentList)
            {
                this._stageCount = 4;
                if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "StationList")
                {
                    this._populateStationStage(this._stageCount);
                }
            }
        }
        else if(this._fullListUpdate == "FULL_LIST_NOT_SUCCESSFUL")
        {
            this._cachedStationList = new Array();
            this._cachedEnsembleList = new Array();
            this._cachedComponentList = new Array();
            this._requestCountforComponentList = 0;
            this._responseCountforComponentList = 0;
            //Request for For Ensemble and Component List
            this._RequestFullStationList();
        }
    }
};

//_NewListAvailableStatus Handler
dabApp.prototype._NewListAvailableStatusHandler = function()
{
    var params =
    {
        "index": 0,
        "limit": 255
    };
    framework.sendRequestToDbapi(this.uiaId, this._getEnsembleAndComponentListCallbackFn.bind(this), "radio", "DabEnsembleAndComponentList", params);
};

//_SaveFavStationFrmListHandler Handler
dabApp.prototype._SaveFavStationFrmListHandler = function()
{
    if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "StationList")
    {
        var focussedItem = null;
        var stationList = null;
        var eventName = null;
        if(this._currentContextTemplate.list2Ctrl.focussedItem)
        {
            focussedItem = this._currentContextTemplate.list2Ctrl.focussedItem;
        }
        if(this._currentContextTemplate.list2Ctrl.dataList)
        {
            stationList = this._currentContextTemplate.list2Ctrl.dataList;
        }
        if(stationList.items[focussedItem] && stationList.items[focussedItem].appData && typeof(stationList.items[focussedItem].appData) == "object")
        {
            if(stationList.items[focussedItem].appData.eventName)
            {
                eventName = stationList.items[focussedItem].appData.eventName;
            }
            if (focussedItem && eventName === "PlayComponent")
            {
                var params =
                {
                    "payload":
                    {
                        "componentDetails":
                        {
                            "chNum": stationList.items[focussedItem].appData.chNum,
                            "ens_id": stationList.items[focussedItem].appData.ensID,
                            "serv_id": stationList.items[focussedItem].appData.srvId,
                            "comp_id": stationList.items[focussedItem].appData.compID,
                            "componentName": stationList.items[focussedItem].appData.compName,
                            "ensembleName": stationList.items[focussedItem].appData.ensName,
                            "serviceName": stationList.items[focussedItem].appData.srvName,
                        }
                    }
                };
                framework.sendEventToMmui(this.uiaId, "SelectFavoriteStation", params);
            }
        }
    }
};

//_DabLinkSettingInfoHandler
dabApp.prototype._DabLinkSettingInfoHandler = function(msg)
{
    var linkInfo = null;
    if (msg && msg.params && msg.params.payload && msg.params.payload.LinkInfo)
    {
        linkInfo = msg.params.payload.LinkInfo;
        if(linkInfo.setting_type == "DAB_LINK_SETTING")
        {
            if(linkInfo.setting_mode == "LINK_SETTING_ON")
                this._dabLinkSetting = true;
            else if(linkInfo.setting_mode == "LINK_SETTING_OFF")
                this._dabLinkSetting = false;
        }
        else if(linkInfo.setting_type == "FM_LINK_SETTING")
        {
            if(linkInfo.setting_mode == "LINK_SETTING_ON")
                this._fmLinkSetting = true;
            else if(linkInfo.setting_mode == "LINK_SETTING_OFF")
                this._fmLinkSetting = false;
        }
    }
};

//_RadioTextSettingStatusHandler
dabApp.prototype._RadioTextSettingStatusHandler = function(msg)
{
    var textMode = null;
    var params = {};
    if (msg && msg.params && msg.params.payload && msg.params.payload.TextMode)
    {
        textMode = msg.params.payload.TextMode;
        if(textMode == "RADIO_TEXT_SETTING_ON")
            this._radioTextSetting = true;
        else if(textMode == "RADIO_TEXT_SETTING_OFF")
        {
            this._radioTextSetting = false;
            this._clearRadioTextItems();
        }
        //Check if this message i.e. RadioTextSettings comes in NowPlaying Context

        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying")
        {
            if(this._cachedErrorStatus && this._cachedErrorStatus != "STATUS_NO_SIGNAL" && this._operationMode != "DAB_LINK_SEARCH_MODE" && this._operationMode != "POWER_OFF_MODE"
                && this._operationMode != "ENSEMBLE_SEEK_UP_CHANGE_MODE" && this._operationMode != "ENSEMBLE_SEEK_DOWN_CHANGE_MODE")
            {
                if(this._operationMode != "FM_LINK_MODE" && this._radioTextSetting == true)
                {
                    if(this._cachedUpdatedMetaData && this._cachedUpdatedMetaData.dlplus_content_type != "DLPLUS_NONE")
                    {
                        //send request to DBAPI to fetch the DL+ data
                        framework.sendRequestToDbapi(this.uiaId, this._getDABDLPlusMetadataCallbackFn.bind(this), "radio", "DabDLPlusNowPlayingMetadata",params);
                    }
                    framework.sendRequestToDbapi(this.uiaId, this._getRadioTextCallbackFn.bind(this), "radio", "DabNowPlayingMetadata", params);
                }
                else
                {
                    this._populateNowPlayingDab();
                }
            }
        }
    }
};

//_BandSettingStatusHandler
dabApp.prototype._BandSettingStatusHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.Band)
    {
        this._bandSetting = msg.params.payload.Band;

        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "DABBands")
        {
            this._currentContextTemplate.list2Ctrl.setTick(0, false);//setTick(itemIndex, value)
            this._currentContextTemplate.list2Ctrl.setTick(1, false);
            this._currentContextTemplate.list2Ctrl.setTick(2, false);

            if(this._bandSetting == "BAND_BAND3")
                this._currentContextTemplate.list2Ctrl.setTick(0, true);
            else if(this._bandSetting == "BAND_LBAND")
                this._currentContextTemplate.list2Ctrl.setTick(1, true);
            else if(this._bandSetting == "BAND_BOTH")
                this._currentContextTemplate.list2Ctrl.setTick(2, true);
        }
    }
};

//SBNStationListStatus Handler
dabApp.prototype._SBNStationListStatusHandler = function(msg)
{
    //Common.prototype.startTimedSbn = function(uiaId, sbnId, type, properties)
    if (msg && msg.params && msg.params.payload)
    {
        var stationListStatus = msg.params.payload.StationListStatus;
        if(stationListStatus)
            framework.common.startTimedSbn(this.uiaId, "DABStationListUpdated", "unknown",
                    {sbnStyle : "Style02", imagePath1 : "IcnSbnEnt.png", text1Id : "DABStationListUpdated"});
        else
            framework.common.startTimedSbn(this.uiaId, "DABStationListUpdateFailedSelect", "unknown",
                    {sbnStyle : "Style02", imagePath1 : "IcnSbnEnt.png", text1Id : "DABStationListUpdateFailedSelect"});
    }
};
//TimedSBN_NowPlayingInfo Handler
dabApp.prototype._TimedSBN_NowPlayingInfoHandler = function(msg)
{
	if (msg && msg.params && msg.params.payload && msg.params.payload.MetadataChangeDetails)
    {
	    var params = {};
        this._cachedUpdatedMetaData = msg.params.payload.MetadataChangeDetails;
            
		if(this._cachedUpdatedMetaData != null && this._cachedUpdatedMetaData.metadata_svc_label_changed)
		{
			framework.sendRequestToDbapi(this.uiaId, this._startSbn.bind(this), "radio", "DabNowPlayingContext",params);
		}
		else if(this._cachedUpdatedMetaData != null && this._cachedUpdatedMetaData.metadata_compo_label_changed)
		{
			framework.sendRequestToDbapi(this.uiaId, this._startSbn.bind(this), "radio", "DabNowPlayingContext",params);
		}
    }    
};

dabApp.prototype._startSbn = function(msg)
{
    if (msg.msgContent.params.eCode === 0)
    {
        var params = msg.msgContent.params;
		var sbnText = "";
		if(params.componentName)
        {
            var compName = params.componentName; //Can use trim() also. But it is not supported by all the browsers.
            sbnText = compName;
        }
        else if(params.serviceName)
        {
            sbnText = params.serviceName;
        }
		if ( this._currentContext.ctxtId != "NowPlaying")
		{
			framework.common.startTimedSbn(this.uiaId, "stationChangeESbn", "typeE",{sbnStyle : "Style02",imagePath1 : "IcnSbnEnt.png", text1Id :  "system.DabRadio",text2 : sbnText});
		}
		else if(this._currentContextTemplate===null && this._currentContext.ctxtId === "NowPlaying") 
		{
			framework.common.startTimedSbn(this.uiaId, "stationChangeESbn", "typeE",{sbnStyle : "Style02",imagePath1 : "IcnSbnEnt.png", text1Id :  "system.DabRadio",text2 : sbnText});
		}
    }		
}

//ShowLoadingMeterOnVuiHandler Handler
dabApp.prototype._ShowLoadingMeterOnVuiHandler = function(msg)
{
    this._startLoading = true;
    this._stageCount = 1;
    this._cachedStationList = new Array();
    this._cachedEnsembleList = new Array();
    this._cachedComponentList = new Array();
    this._updateComplete = false;
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "StationList")
    {
        this._populateStationStage(this._stageCount);
    }
};

/**************************
 * Control callbacks
 **************************/
//List Control
dabApp.prototype._listItemClickCallback = function(listCtrlObj, appData, params)
{
    var itemIndex = params.itemIndex;
    //var extraData = params.additionalData;
    var vuiFlag = false;
    if (params && params.fromVui)
    {
        vuiFlag = true;
    }
    // List Events Handler
    switch(this._currentContext.ctxtId)
    {
        /* There are multiple Contexts which have lists
           therefore the context has to be resolved and handled
           accordingly*/
        case "EnsembleList":
            switch(appData)
            {
                case "SelectEnsembleID" :
                    var ensembleID = null;
                    ensembleID = this._cachedEnsembleList[itemIndex].ensId;
                    var params =
                    {
                        "payload":
                        {
                            "ensembleID": ensembleID
                        }
                    };
                    this._currentlySelectedEnsembleId = ensembleID;
                    framework.sendEventToMmui(this.uiaId, appData, params, vuiFlag);
                    break;
                default:
                    break;
            }
            break;
        case "StationList":
            switch(appData)
            {
                case "UpdateStationList":
                    this._stageCount = null;
                    if(this._operationMode == "LIST_UPDATE_MODE")
                    {
                        this._startLoading = true;
                        if(this._stageCount<1)
                            this._stageCount = 1;
                    }
                    
                    this._cachedStationList = new Array();
                    this._cachedEnsembleList = new Array();
                    this._cachedComponentList = new Array();
                    this._updateComplete = false;
                    if (this._currentContext.ctxtId === "StationList")
                    {
                        this._populateStationStage(this._stageCount);
                    }
                    framework.sendEventToMmui(this.uiaId, appData, null, vuiFlag);
                    break;
                case "DisplayEnsembleList":
                    framework.sendEventToMmui(this.uiaId, appData, null, vuiFlag);
                    break;
            }
            if(appData && appData.eventName == "PlayComponent")
            {
                var playComponentDetails = {};
                playComponentDetails = this._compareWithLongList(itemIndex);
                var params =
                {
                    "payload":
                    {
                        "ComponentDetails":
                        {
                            "chNum": playComponentDetails.chNum,
                            "ens_id": playComponentDetails.ens_id,
                            "serv_id": playComponentDetails.serv_id,
                            "comp_id": playComponentDetails.comp_id
                        }
                    }
                };
                framework.sendEventToMmui(this.uiaId, appData.eventName, params, vuiFlag);
                break;
            }
            break;
        case "DABSettings" :
            switch(appData)
            {
                case "DisplayBandSettings" :
                    framework.sendEventToMmui(this.uiaId, appData, null, vuiFlag);
                    break;
                case "Update_DAB_FM_Link" :
                    var OnOffFlag = this._settingsListCtxtDataList.items[1].value;
                    if(OnOffFlag == 1)
                        OnOffFlag = true;
                    else
                        OnOffFlag = false;
                    var params =
                    {
                        "payload":
                         {
                             "OnOffFlag": OnOffFlag
                         }
                    };
                    framework.sendEventToMmui(this.uiaId, appData, params, vuiFlag);
                    break;
                case "Update_DAB_DAB_Link" :
                    var OnOffFlag = this._settingsListCtxtDataList.items[2].value;
                    if(OnOffFlag == 1)
                        OnOffFlag = true;
                    else
                        OnOffFlag = false;
                    var params =
                    {
                        "payload":
                         {
                             "OnOffFlag": OnOffFlag
                         }
                    };
                    framework.sendEventToMmui(this.uiaId, appData, params, vuiFlag);
                    break;
                case "UpdateRadioText" :
                    var OnOffFlag = this._settingsListCtxtDataList.items[3].value;
                    if(OnOffFlag == 1)
                        OnOffFlag = true;
                    else
                        OnOffFlag = false;
                    var params =
                    {
                        "payload":
                         {
                             "OnOffFlag": OnOffFlag
                         }
                    };
                    framework.sendEventToMmui(this.uiaId, appData, params, vuiFlag);
                    break;
            }
            break;
        case "DABBands" :
            framework.sendEventToMmui(this.uiaId, appData, null, vuiFlag);
            break;
        default:
            break;
    }
};

//List Long press callback
dabApp.prototype._listLongPressCallback = function(listCtrlObj, appData, params)
{
    switch(this._currentContext.ctxtId)
    {
        case "StationList":
            var params =
            {
                "payload":
                {
                    "componentDetails":
                    {
                        "chNum": appData.chNum,
                        "ens_id": appData.ensID,
                        "serv_id": appData.srvId,
                        "comp_id": appData.compID,
                        "componentName": appData.compName,
                        "ensembleName": appData.ensName,
                        "serviceName": appData.srvName,
                    }
                }
            };
            framework.sendEventToMmui(this.uiaId, "SelectFavoriteStation", params);
            break;
        default :
            break;
    }
};

 // Callback from Dialog3Ctrl when a button is clicked.
dabApp.prototype._dialogDefaultSelectCallback = function(dialogBtnCtrlObj, appData, params)
{
   if(this._currentContext && this._currentContext.ctxtId)
   {
       switch (this._currentContext.ctxtId)
       {
           case "StationListNotAvailable" :
               switch (appData)
               {
                   case "Global.Cancel" :
                       framework.sendEventToMmui("common", appData);
                       break;
                   case "UpdateStationList" :
                       this._stageCount = null;
                       if(this._operationMode == "LIST_UPDATE_MODE")
                       {
                           this._startLoading = true;
                           if(this._stageCount<1)
                               this._stageCount = 1;
                           if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "StationList")
                           {
                               this._populateStationStage(this._stageCount);
                           }
                       }
                       this._cachedStationList = new Array();
                       this._cachedEnsembleList = new Array();
                       this._cachedComponentList = new Array();
                       this._updateComplete = false;
                       framework.sendEventToMmui(this.uiaId, appData);
                       break;
                   default :
                       break;
               }
               break;
       }
   }
};

//Call back called on selecting UMP buttons
dabApp.prototype._umpDefaultSelectCallback = function(ctrlObj, appData, params)
{
    var buttonStatus = null;
    if(this._umpDABNowPlaying[appData] && this._umpDABNowPlaying[appData].disabled != null)
    {
        buttonStatus = this._umpDABNowPlaying[appData].disabled;
    }
    //check for the UMP button whether it is clickable or not
    if (!buttonStatus)
    {
        //UMP Events Handler
        switch(appData)
        {
            case "DisplayDABSettings" :
                framework.sendEventToMmui(this.uiaId, appData);
                break;
            case "TAToggle" :
                var currentStateOfTA = params.state;
                var TAStateToMMUI= null;
                if(currentStateOfTA === "Unsel")
                    TAStateToMMUI = false;
                else
                    TAStateToMMUI = true;
                var parameters =
                {
                    "payload":
                     {
                         "OnOffFlag": TAStateToMMUI
                     }
                };
                framework.sendEventToMmui(this.uiaId, appData, parameters);
                break;
            default:
                framework.sendEventToMmui(this.uiaId,appData);
                break;
        }
    }
};

//long press of button Start
dabApp.prototype._umpDefaultHoldStartCallback = function(ctrlObj, appData, params)
{
    switch(appData)
    {
        case "SelectSeekNext" :
            framework.sendEventToMmui(this.uiaId, "ForcedSeekNextStart");
            break;
        case "SelectSeekPrevious" :
            framework.sendEventToMmui(this.uiaId, "ForcedSeekPreviousStart");
            break;
        default :
            break;
    }
};

//long press of button Stop
dabApp.prototype._umpDefaultHoldStopCallback = function(ctrlObj, appData, params)
{
    switch(appData)
    {
        case "SelectSeekPrevious" :
            framework.sendEventToMmui(this.uiaId, "ForcedSeekPreviousStop");
            break;
        case "SelectSeekNext" :
            framework.sendEventToMmui(this.uiaId, "ForcedSeekNextStop");
            break;
        default :
            break;
    }
};

//LongPress CAllback for Favorites
dabApp.prototype._umpDefaultLongPressCallback = function(ctrlObj, appData, params)
{
    switch(appData)
    {
        case "SelectFavorites" :
            framework.sendEventToMmui("common", "Global.AddToFavorites");
            break;
        default :
            break;
    }
};

/**************************
 * Helper functions
 **************************/

//set Scan UMP Button Light ON/ Light OFF
dabApp.prototype._setScanToggleUMPCtrl = function(tmplt,state)
{
    this._cachedScanState = false;
    switch(state)
    {
        case "Unsel":
          this._cachedScanState = false;
          break;
        case "Sel":
          this._cachedScanState = true;
          break;
        default :
            break;
    }
    if(tmplt && this._currentContext && this._currentContext.ctxtId === "NowPlaying")
    {
        tmplt.nowPlaying4Ctrl.umpCtrl.setButtonState("SelectScan",state);
    }
};

//set TA UMP Button Light ON/ Light OFF
dabApp.prototype._setTAToggleUMPCtrl = function(tmplt,state)
{
    this._cachedTAState = false;
    switch(state)
    {
        case "Unsel":
          this._cachedTAState = false;
          break;
        case "Sel":
          this._cachedTAState = true;
          break;
        default :
            break;
    }
    if(tmplt && this._currentContext && this._currentContext.ctxtId === "NowPlaying")
    {
        tmplt.nowPlaying4Ctrl.umpCtrl.setButtonState("TAToggle",state);
    }
};

// Update NowPlaying Control
dabApp.prototype._populateNowPlayingDab = function()
{
    var controlConfigObj = new Object();
    var ctrlTitlePath = null;
    var ctrlTitleText = "";
    var ctrlSubtitleTitleText = "";

    //Clearing All Control Items
    if(this._currentContextTemplate)
    {
        controlConfigObj.fullConfig = false;
        controlConfigObj.ctrlStyle = "Style7";
        this._currentContextTemplate.nowPlaying4Ctrl.setNowPlayingConfig(controlConfigObj);

        this._currentContextTemplate.nowPlaying4Ctrl.setCtrlSubtitle(null);
        this._currentContextTemplate.nowPlaying4Ctrl.setUnformattedText(null);
        this._currentContextTemplate.nowPlaying4Ctrl.setCtrlTitle(null);
        this._currentContextTemplate.nowPlaying4Ctrl.setBrandImage(null);
        this._currentContextTemplate.nowPlaying4Ctrl.setLoadingIcon(false);
        this._currentContextTemplate.nowPlaying4Ctrl.setAudioTitle(null);
        this._currentContextTemplate.nowPlaying4Ctrl.setDetailLine1(null);
        this._currentContextTemplate.nowPlaying4Ctrl.setDetailLine2(null);
        this._currentContextTemplate.nowPlaying4Ctrl.setDetailLine3(null);
    };

    if(this._operationMode == "LIST_UPDATE_MODE")
    {
        controlConfigObj["ctrlTitleObj"] =
        {
            "ctrlTitleId"    : "DABUpdatingListNowPlaying",
            "ctrlTitleText"  :  null,
            "ctrlTitleIcon"  :  null
        };
        this._currentContextTemplate.nowPlaying4Ctrl.setCtrlTitle(controlConfigObj["ctrlTitleObj"]);
        this._currentContextTemplate.nowPlaying4Ctrl.setLoadingIcon(true);
    }
    else if(this._operationMode != "DAB_LINK_SEARCH_MODE" && this._cachedErrorStatus === "STATUS_NO_SIGNAL")
    {
        if(this._cachedChannelNum)
            ctrlSubtitleTitleText = this._cachedChannelNum + "\u00A0\u00A0\u00A0\u00A0";

        controlConfigObj["ctrlSubtitleObj"] =
        {
            "ctrlSubtitleId"    : "DABSignalLost",
            "subMap"            : { ChNum : ctrlSubtitleTitleText },
        };
        this._currentContextTemplate.nowPlaying4Ctrl.setCtrlSubtitle(controlConfigObj["ctrlSubtitleObj"]);      
        
        controlConfigObj["audioTitleObj"] =
        {
            "audioTitleId"    : "DABChangeEnsemble",
            "audioTitleIcon"  :  " ",
            "audioTitleText"  :  null,
            "subMap"          :  null,
        };
        this._currentContextTemplate.nowPlaying4Ctrl.setAudioTitle(controlConfigObj["audioTitleObj"]);
    }
    else
    {
        if(this._operationMode == "DAB_LINK_SEARCH_MODE")
        {
            controlConfigObj["ctrlTitleObj"] =
            {
                "ctrlTitleId"    : "DABSignalSearch",
                "ctrlTitleText"  : null,
                "ctrlTitleIcon"  : null
            };
            this._currentContextTemplate.nowPlaying4Ctrl.setCtrlTitle(controlConfigObj["ctrlTitleObj"]);
            this._currentContextTemplate.nowPlaying4Ctrl.setLoadingIcon(true);
        }
        else
        {
            //Setting Image
            if(this._operationMode == "FM_LINK_MODE")
            {
                ctrlTitlePath = "common/images/icons/IcnDab_Ds.png";
            }
            else if(this._operationMode == "ENSEMBLE_SEEK_UP_CHANGE_MODE" || this._operationMode == "ENSEMBLE_SEEK_DOWN_CHANGE_MODE")
            {
                ctrlTitlePath = null;
            }
            else
                ctrlTitlePath = "common/images/icons/IcnDab_En.png";

            //Setting Component/Service Name
            if(this._cachedComponentName)
                ctrlTitleText = this._cachedComponentName;
            else if(this._cachedServiceName)
                ctrlTitleText = this._cachedServiceName;

            controlConfigObj["ctrlTitleObj"] =
            {
                "ctrlTitleId"    : null,
                "ctrlTitleText"  : ctrlTitleText,
            };
            this._currentContextTemplate.nowPlaying4Ctrl.setCtrlTitle(controlConfigObj["ctrlTitleObj"]);
            this._currentContextTemplate.nowPlaying4Ctrl.setBrandImage(ctrlTitlePath);

            if(this._cachedChannelNum && this._cachedEnsembleName)
                ctrlSubtitleTitleText = this._cachedChannelNum +"\u00A0\u00A0\u00A0\u00A0\u00A0"+ this._cachedEnsembleName;
            else if(this._cachedChannelNum)
                ctrlSubtitleTitleText = this._cachedChannelNum;
            else if(this._cachedEnsembleName)
                ctrlSubtitleTitleText = this._cachedEnsembleName;
            controlConfigObj["ctrlSubtitleObj"] =
            {
                "ctrlSubtitleId"    : null,
                "ctrlSubtitleText"  : ctrlSubtitleTitleText,
            };
            this._currentContextTemplate.nowPlaying4Ctrl.setCtrlSubtitle(controlConfigObj["ctrlSubtitleObj"]);

            //updated for DAB DL+ implementation
            if(this._dlPlusMessage)
            {
                controlConfigObj["audioTitleObj"] =
                {
                    "audioTitleId"   : null,
                    "subMap"         : null,
                    "audioTitleIcon" : "common/images/icons/IcnListSong.png",
                    "audioTitleText" : this._cachedSongName
                };
                this._currentContextTemplate.nowPlaying4Ctrl.setAudioTitle(controlConfigObj["audioTitleObj"]);

                controlConfigObj["detailLine1Obj"] =
                {
                    "detailTextId"   : null,
                    "subMap"         : null,
                    "detailIcon"     : "common/images/icons/IcnListContact_Placeholder.png",
                    "detailText"     : this._cachedArtistName
                };
                this._currentContextTemplate.nowPlaying4Ctrl.setDetailLine1(controlConfigObj["detailLine1Obj"]);

                controlConfigObj["detailLine2Obj"] =
                {
                    "detailTextId"   : null,
                    "subMap"         : null,
                    "detailIcon"     : "common/images/icons/IcnListCdPlayer_En.png",
                    "detailText"     : this._cachedAlbumName
                };
                this._currentContextTemplate.nowPlaying4Ctrl.setDetailLine2(controlConfigObj["detailLine2Obj"]);

                controlConfigObj["detailLine3Obj"] =
                {
                    "detailTextId"   : null,
                    "subMap"         : null,
                    //"detailIcon"     : "common/images/icons/IcnListDealerInfo_En.png",
                    "detailText"     : this._cachedGenre
                };
                this._currentContextTemplate.nowPlaying4Ctrl.setDetailLine3(controlConfigObj["detailLine3Obj"]);
            }
            else if(this._cachedRadioText)
            {
                controlConfigObj["unformattedTextObj"] =
                {
                    "unformattedTextId"     : null,
                    "unformattedText"       : this._cachedRadioText,
                    "subMap"                : null
                };
                this._currentContextTemplate.nowPlaying4Ctrl.setUnformattedText(controlConfigObj["unformattedTextObj"]);
            }
        }
    }
};

//Populate Ensemble List Control
dabApp.prototype._populateEnsembleList = function(itemsList)
{
    var dataListItems = new Array();
    var currentPlayingImage = null;
    if(itemsList.length)
    {

        for (var i = 0; i < itemsList.length; i++)
        {
            if(this._currentEnsId == itemsList[i].ensId)
            {
                currentPlayingImage = "common/images/icons/IcnListCheckmark.png";
            }
            else
                currentPlayingImage = null;
            dataListItems.push({
                appData : "SelectEnsembleID",
                text1 : itemsList[i].ensName,
                disabled : false,
                itemStyle : "style01",
                image1 : currentPlayingImage,
                hasCaret : false,
            });
        }
    }
    //Setting DataList
    this._ensembleListCtxtDataList.items = dataListItems;
    this._ensembleListCtxtDataList.itemCount = dataListItems.length;
    this._currentContextTemplate.list2Ctrl.setDataList(this._ensembleListCtxtDataList);
    if(this._ensembleListCtxtDataList.itemCount)
    {
        this._currentContextTemplate.list2Ctrl.updateItems(0, this._ensembleListCtxtDataList.itemCount - 1);
    }
};

//Populate Station List Control
dabApp.prototype._populateStationStage = function(stageCount)
{

    var currentPlayingImage = null;
    var temp = null;
    var ensName = null;
    var dataListItems =[
        { appData : "UpdateStationList", text1Id : "DABUpdateList", itemStyle : "style02", disabled : false, hasCaret:false},
        { appData : "DisplayEnsembleList", text1Id : "DABSelectEnsemble", itemStyle : "style02", disabled : true, hasCaret:true},
    ];

    if(this._startLoading == true || stageCount == 1)
    {
        dataListItems[0].appData = null;
        dataListItems[0].text1Id = "DABUpdatingList";
        dataListItems[0].image2 = "indeterminate";
        dataListItems[0].disabled = false;
    }
    switch(stageCount)
    {
        case 0: //Stage 0 There was no data in database and there is no trigger from the user to update the list
            dataListItems =[
                { appData : "UpdateStationList", text1Id : "DABUpdateList", itemStyle : "style02", disabled : false, hasCaret:false},
                { appData : "DisplayEnsembleList", text1Id : "DABSelectEnsemble", itemStyle : "style02", disabled : true, hasCaret:true},
            ];
            dataListItems.push({
                text1Id : "DABPleaseUpdateList",
                disabled : true,
                itemStyle : "style01",
                image1 : currentPlayingImage,
                hasCaret : false,
                indented : true,
            });
            break;
        case 1: //Stage 1 When the user has triggered the Update of Station List
            //code already implemented before switch statement (when this._startLoading = true)
            /*dataListItems[0].appData = null;
            dataListItems[0].text1Id = "DABUpdatingList";
            dataListItems[0].image2 = "indeterminate";
            dataListItems[0].disabled = false;
            log.info("Updating Station List....");
            this._startLoading = true;*/
            break;
        case 2: //Stage 2 When the GUI received the intimation from BLM that Ensemble list is updated in Database and can be read
            for (var i = 0; i < this._cachedEnsembleList.length; i++)
            {
                dataListItems.push({
                    text1 : this._cachedEnsembleList[i].ensName,
                    disabled : true,
                    itemStyle : "style01",
                    image1 : currentPlayingImage,
                    hasCaret : false,
                });
            }
            this._responseCountforComponentList = 0;
            break;
        case 3:  //Stage 3 When the GUI received the intimation from BLM that Component List for a particular ensemble has been received
        case 4:  //Stage 4 When BLM has intimated that it is done with Updating the Station List
        case 5:  //Stage 5 When GUI gets full Ensemble and Component list from DBAPI method DabEnsembleAndComponentList
            var disabled = null;
            if(stageCount == 3)
            {
                disabled = true;
            }
            else if(stageCount == 4 || stageCount == 5)
            {
                disabled = false;
                dataListItems[1].disabled = false;
            }

            for(var i = 0; i< this._cachedEnsembleList.length; i++)
            {
                currentPlayingImage = null;
                ensName = null;
                temp = true;
                for(var j = 0; j< this._cachedComponentList.length; j++)
                {
                    if(this._cachedEnsembleList[i].ensId == this._cachedComponentList[j].ensId)
                    {
                        if(temp)
                        {
                            ensName = this._cachedComponentList[j].ensName;
                            dataListItems.push({
                                appData : {     eventName : null, ensID : null ,
                                                compID : null, compName : null,
                                                srvId : null, srvName : null,
                                                ensName : null, chNum : null
                                },
                                text1 : ensName,
                                disabled : true,
                                disabledStyleMod: "white",
                                background : "lightGrey",
                                itemStyle : "style01",
                                image1 : "apps/dab/images/IcnListAnsamble_En.png",
                                hasCaret : false,
                                vuiSelectable: false
                            });
                            temp = false;
                        }
                        if(ensName == this._cachedComponentList[j].ensName)
                        {
                            if((this._currentCompId == this._cachedComponentList[j].cmpId) && (this._currentEnsId == this._cachedComponentList[j].ensId)
                                    && (this._currentServId == this._cachedComponentList[j].srvId))
                            {
                                currentPlayingImage = "common/images/icons/IcnListEntNowPlaying_En.png";
                            }
                            else
                                currentPlayingImage = null;
                            dataListItems.push({
                                appData : {   eventName : 'PlayComponent', ensID : this._cachedComponentList[j].ensId ,
                                              compID : this._cachedComponentList[j].cmpId, compName : this._cachedComponentList[j].cmpName,
                                              srvId : this._cachedComponentList[j].srvId, srvName : this._cachedComponentList[j].srvName,
                                              ensName : this._cachedComponentList[j].ensName, chNum : this._cachedComponentList[j].chNum
                                          },
                                text1 : this._cachedComponentList[j].cmpName,
                                itemBehavior : "shortAndLong",
                                disabled : disabled,
                                itemStyle : "style01",
                                image1 : currentPlayingImage,
                                hasCaret : false,
                                indented : true,
                            });
                        }
                    }
                }
            }
            break;
    }

    //Setting DataList
    this._stationListCtxtDataList.items = dataListItems;
    this._stationListCtxtDataList.itemCount = dataListItems.length;
    this._currentContextTemplate.list2Ctrl.setDataList(this._stationListCtxtDataList);
    if(this._stationListCtxtDataList.itemCount)
    {
        this._currentContextTemplate.list2Ctrl.updateItems(0, this._stationListCtxtDataList.itemCount - 1);
    }
};

//Populate DAB Settings Control
dabApp.prototype._populateDabSettingsList = function()
{
    var dataListItems =[
        { appData : "DisplayBandSettings", text1Id : "DABBandSettingsList", itemStyle : "style06", label1Id : null ,hasCaret: true},
        { appData : "Update_DAB_FM_Link", text1Id : "DABFMLink", itemStyle : "styleOnOff", hasCaret : false, value:2 },
        { appData : "Update_DAB_DAB_Link", text1Id : "DABDABLink", itemStyle : "styleOnOff", hasCaret : false, value:2 },
        { appData : "UpdateRadioText", text1Id : "DABRadioText", itemStyle : "styleOnOff", hasCaret : false, value:2 }
    ];

    //Setting label1 of Band Setting text
    if(this._bandSetting == "BAND_BAND3")
        dataListItems[0].label1Id = "DABBandIII";
    else if(this._bandSetting == "BAND_LBAND")
        dataListItems[0].label1Id = "DABLBand";
    else if(this._bandSetting == "BAND_BOTH")
        dataListItems[0].label1Id = "DABBoth";

    //Setting styleOnOff of rest of the list
    if(this._fmLinkSetting)
        dataListItems[1].value = 1;
    if(this._dabLinkSetting)
        dataListItems[2].value = 1;
    if(this._radioTextSetting)
        dataListItems[3].value = 1;

    //Setting DataList
    this._settingsListCtxtDataList.items = dataListItems;
    this._settingsListCtxtDataList.itemCount = dataListItems.length;
    this._currentContextTemplate.list2Ctrl.setDataList(this._settingsListCtxtDataList);
    if(this._stationListCtxtDataList.itemCount)
    {
        this._currentContextTemplate.list2Ctrl.updateItems(0, this._settingsListCtxtDataList.itemCount - 1);
    }
};

/**************************
 * DBAPI METHOD RESPONSE HANDLERS *
 **************************/

//Helper function  to Read Metadata  from DBAPI
dabApp.prototype._getMetadataCallbackFn = function(msg)
{
    if (msg.msgContent.params.eCode === 0)
    {
        var params = msg.msgContent.params;
        this._cachedEnsembleName = "";
        this._cachedComponentName = "";
        this._cachedServiceName = "";

        if(params.ensembleName)
        {
            this._cachedEnsembleName = params.ensembleName;
        }
        if(params.componentName)
        {
            var compName = params.componentName.replace(/^\s+|\s+$/gm,''); //Can use trim() also. But it is not supported by all the browsers.
            this._cachedComponentName = compName;
        }
        if(params.serviceName)
        {
            this._cachedServiceName = params.serviceName;
        }

        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying")
        {
            this._populateNowPlayingDab();
        }
    }
    else
    {
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying")
        {
            this._populateNowPlayingDab();
        }
    }
};

//Helper function  to Read radioText  from DBAPI
dabApp.prototype._getRadioTextCallbackFn = function(msg)
{
    this._cachedRadioText = "";
    if (msg.msgContent.params.eCode == 0)
    {
        var params = msg.msgContent.params;
        if(params.radioText)
        {
            this._cachedRadioText = params.radioText;
        }
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying")
        {
            this._populateNowPlayingDab();
        }
    }
    else
    {
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying")
        {
            this._populateNowPlayingDab();
        }
    }
};

//Helper function to get DAB DL+ metadata
dabApp.prototype._getDABDLPlusMetadataCallbackFn = function(msg)
{

    if (msg.msgContent.params.eCode === 0)
    {
        var params = msg.msgContent.params;
        this._clearRadioTextItems();
        this._dlPlusMessage = true;

        if(params.songName)
        {
            this._cachedSongName = params.songName;
        }
        if(params.artistName)
        {
            this._cachedArtistName = params.artistName;
        }
        if(params.albumName)
        {
            this._cachedAlbumName = params.albumName;
        }
        if(params.genre)
        {
            this._cachedGenre = params.genre;
        }
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying")
        {
            this._populateNowPlayingDab();
        }
    }
    else
    {
        this._dlPlusMessage = false;
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying")
        {
            this._populateNowPlayingDab();
        }
    }
};


//Helper function  to get Updated Metadata  from DBAPI
dabApp.prototype._getUpdatedMetadataCallbackFn = function(msg)
{
    var params = msg.msgContent.params;
    if (msg.msgContent.params.eCode === 0)
    {
        //if(this._cachedUpdatedMetaData.metadata_ensemble_label_changed)
        {
            //if(params.ensembleName)
            {
                this._cachedEnsembleName = params.ensembleName;
            }
        }

        //if(this._cachedUpdatedMetaData.metadata_svc_label_changed)
        {
            //if(params.serviceName)
            {
                this._cachedServiceName = params.serviceName;
            }
        }

        //if(this._cachedUpdatedMetaData.metadata_compo_label_changed)
        {
            //if(params.componentName)
            {
                var compName = params.componentName.replace(/^\s+|\s+$/gm,''); //Can use trim() also. But it is not supported by all the browsers.
                this._cachedComponentName = compName;
            }
        }
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying")
        {
            this._populateNowPlayingDab();
        }
    }
    else
    {
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying")
        {
            this._populateNowPlayingDab();
        }
    }
};

//Helper function  to get Ensemble List from DBAPI
dabApp.prototype._getEnsembleListCallbackFn = function(msg)
{
    var ensembleList = new Array();
    this._cachedEnsembleList = new Array();
    this._cachedStationList = {
            "ensembleList":
                [
                    {
                        "ensId": null,
                        "chNumber": null,
                        "ensName": null
                    },
                ],
            "stationList":
                [
                    {
                        "chNum" : null,
                        "ensId": null,
                        "cmpId": null,
                        "ensName": null,
                        "cmpName": null,
                        "srvId": null,
                        "srvName": null
                    },
                ]
        };

    var params = msg.msgContent.params;
    if (params.eCode === 0)
    {
        this._stageCount = 2;

        if(params.totalCount <=0)
        {
            //TODO requirement not clear as of now
        }
        else
        {
            ensembleList = params.ensembleList;
            for (var i = 0; i < ensembleList.length; i++)
            {
                this._cachedStationList.ensembleList.push({
                    ensId : ensembleList[i].ensId,
                    chNumber : ensembleList[i].chNumber,
                    ensName : ensembleList[i].ensName
                });
            }

            //Copy
            for(var i=0; i<this._cachedStationList.ensembleList.length -1 ; i++)
            {
                this._cachedEnsembleList[i] = this._cachedStationList.ensembleList[i+1];
            }

            if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "StationList")
            {
                this._populateStationStage(this._stageCount);
            }
        }
    }
    else
    {
        //TODO Requirement not clear as of now
        this._startLoading = false;
        this._cachedStationList = new Array();
        this._cachedEnsembleList = new Array();
        this._cachedComponentList = new Array();
        this._updateComplete = false;

        this._requestCountforComponentList = 0;
        this._responseCountforComponentList = 0;
        this._stageCount = 0;
        if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "StationList")
        {
            this._populateStationStage(this._stageCount);
        }
    }
};

//Helper function  to get Component List from DBAPI
dabApp.prototype._getComponentListCallbackFn = function(msg)
{
    var componentList = new Array();
    this._cachedComponentList = new Array();
    this._responseCountforComponentList ++;

    var params = msg.msgContent.params;
    if (params.eCode === 0)
    {
        this._stageCount = 3;

        if(params.totalCount <=0)
        {
          //TODO Requirement not clear as of now
        }
        else
        {
            if(this._cachedStationList.ensembleList)
            {
                componentList = params.componentList;
                for (var i = 0; i < componentList.length; i++)
                {
                    this._cachedStationList.stationList.push({
                        ensId : componentList[i].ensId,
                        cmpId : componentList[i].cmpId,
                        cmpName : componentList[i].cmpName,
                        srvId : componentList[i].srvId,
                        srvName : componentList[i].srvName
                    });
                }

                for (var i = 1; i < this._cachedStationList.ensembleList.length; i++)
                {
                    for (var j = 1; j < this._cachedStationList.stationList.length; j++)
                    {
                        if(this._cachedStationList.ensembleList[i].ensId == this._cachedStationList.stationList[j].ensId)
                        {
                            this._cachedStationList.stationList[j].ensName = this._cachedStationList.ensembleList[i].ensName;
                            this._cachedStationList.stationList[j].chNum = this._cachedStationList.ensembleList[i].chNumber;
                        }
                    }
                }

                //Copy
                for(var i=0; i<this._cachedStationList.stationList.length -1 ; i++)
                {
                    this._cachedComponentList[i] = this._cachedStationList.stationList[i+1];
                }

                if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "StationList")
                {
                    this._populateStationStage(this._stageCount);
                }
            }
        }
    }
    else
    {
      //TODO Requirement not clear as of now
    }

    //Check if request and response from DBAPI are equal...
    if(this._updateComplete && this._fullListUpdate == "FULL_LIST_SUCCESSFUL" && (this._requestCountforComponentList == this._responseCountforComponentList))
     {
         this._stageCount = 4;
         if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "StationList")
         {
             this._populateStationStage(this._stageCount);
         }
         else if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying")
         {
             this._populateNowPlayingDab();
         }
     }
};

//Helper function  to get both Enasemble and Component List from DBAPI
dabApp.prototype._getEnsembleAndComponentListCallbackFn = function(msg)
{
    var ensembleList = new Array();
    var componentList = new Array();
    this._cachedEnsembleList = new Array();
    this._cachedComponentList = new Array();
    this._startLoading = false;
    this._cachedStationList = {
            "ensembleList":
                [
                    {
                        "ensId": null,
                        "chNumber": null,
                        "ensName": null
                    },
                ],
            "stationList":
                [
                    {
                        "chNum" : null,
                        "ensId": null,
                        "cmpId": null,
                        "ensName": null,
                        "cmpName": null,
                        "srvId": null,
                        "srvName": null
                    },
                ]
        };

    var params = msg.msgContent.params;
    if (params.eCode === 0)
    {
        this._stageCount = 5;
        //Ensemble List
        ensembleList = params.ensList;
        for (var i = 0; i < ensembleList.length; i++)
        {
            this._cachedStationList.ensembleList.push({
                ensId : ensembleList[i].ensId,
                chNumber : ensembleList[i].chNumber,
                ensName : ensembleList[i].ensName
            });
        }

        //Copy
        for(var i=0; i<this._cachedStationList.ensembleList.length -1 ; i++)
        {
            this._cachedEnsembleList[i] = this._cachedStationList.ensembleList[i+1];
        }


        //Component List
        if(this._cachedStationList.ensembleList)
        {
            componentList = params.ensList;
            for (var i = 0; i < componentList.length; i++)
            {

                for (var j = 0; j < componentList[i].cmpList.length; j++)
                {
                    this._cachedStationList.stationList.push({
                        ensId : componentList[i].ensId,
                        chNum : componentList[i].chNumber,
                        ensName : componentList[i].ensName,
                        cmpId : componentList[i].cmpList[j].cmpId,
                        cmpName : componentList[i].cmpList[j].cmpName,
                        srvId : componentList[i].cmpList[j].srvId,
                        srvName : componentList[i].cmpList[j].srvName
                    });
                }
            }
            //Copy
            for(var i=0; i<this._cachedStationList.stationList.length -1 ; i++)
            {
                this._cachedComponentList[i] = this._cachedStationList.stationList[i+1];
            }
        }
        if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "StationList")
        {
            this._populateStationStage(this._stageCount);
        }
        else if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying")
        {
            this._populateNowPlayingDab();
        }
    }
    else
    {
        //TODO Requirement not clear as of now
        this._startLoading = false;
        this._cachedStationList = new Array();
        this._cachedEnsembleList = new Array();
        this._cachedComponentList = new Array();
        this._updateComplete = false;

        this._requestCountforComponentList = 0;
        this._responseCountforComponentList = 0;
        this._stageCount = 0;
        if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "StationList")
        {
            this._populateStationStage(this._stageCount);
        }
        else if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying")
        {
            this._populateNowPlayingDab();
        }
    }

};

/**************************
 * Framework register
 **************************/
framework.registerAppLoaded("dab", null, true);