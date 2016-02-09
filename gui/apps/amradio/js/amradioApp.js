/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: amradioApp.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: arsu
 Date: 15 AUGUST 2012
 __________________________________________________________________________

 Description: IHU GUI AMRadio App

 Revisions:
 v0.1 (15-August-2012) AmRadioApp created with Nowplaying and Tune - arsu
 v0.2 (03-Sept-2012)   Merged to match the SCR framework related changes - arsu
 v0.3 (12-Sept-2012)   Updated to use new UMP updates - arsu
 v0.4 (24-Sep-2012)    Generated English dictionary using dictionary compiler.
                       Closed GENERAL COMMENTS ACROSS APPS given by Arun - arsu
 v0.5 (12-Oct-2012)    TrafficAlert Message Handler is added - arsu
 v0.6 (17-Oct-2012)    Changes made for controlTilte as per SCR raised - arsu
 v0.7 (24-Oct-2012)    DialogList is added for TrafficAlertStations - arsu
 v0.8 (30-Oct-2012)    Workaround for Title in Nowplaying Template - arsu
 v0.9 (06-Nov-2012)    Event for Favourites long press is added - arsu
 v0.10 (20-Nov-2012)   ShortAndHold is changed to ShortAndLong and callback is added
                       for the same - arsu
 v1.0 (05-Dec-2012)    DBAPI implementation added for AutoMemoryList - arsu
 v1.1 (08-Dec-2012)    DBAPI implementation added for Metadata - arsu
 v1.3 (11-Dec-2012)    changes made as per the new UI Spec - arsu
 v1.4 (12-Dec-2012)    Tuner2 control is added - arsu
 v1.5 (31-Dec-2012)    Focus highlight of ump button is fixed - arsu
 v1.6 (04-Jan-2013)    TrafficAlert context is implemented - arsu
 v1.7 (04-Jan-2013)    Weak Hd is implemented - arsu
 v1.8 (08-Jan-2013)    Updated with album art message - arsu
 v1.9 (11-Jan-2013)    Deprecated images are removed - arsu
 v2.0 (17-Jan-2013)    Two events added for Tune - arsu
 v2.1 (18-Jan-2013)    Changes made for Radiotuner Status - arsu
 v2.2 (22-Jan-2013)    ITune tagging implementation is added - arsu
 v2.3 (25-Jan-2013)    SBN Implementation added - arsu
 v2.4 (25-Jan-2013)    Wink/alert implementation is added - arsu
 v2.5 (11-Feb-2013)    Tuner2 is replaced by Tuner3 - asahum
                       Frequecncy wrapping support is available - asahum
 v2.6 (25-Feb-2013)    Metadata clear message handler is added - arsu
 v2.7 (13-Mar-2013)    Shifted to List2 control - arsu
 v2.8 (20-Mar-2013)    Removed setlog level - arsu
 v2.9 (19-Apr-2013)    Tuner4 is added - arsu
 v2.9 (19-Apr-2013)    HD Logo display in Nowplaying is added - arsu
 v3.0 (10-May-2013)   "settleTime" : 0 is removed from Tune context - arsu
 v3.1 (29-May-2013)    Shifting to NowPlaying4 from NowPlaying3a - asahum
 v3.2 (10-July-2013)   Shifting ti Dailogue3 control from Dialogue2- arsu
 v3.3 (15-July-2013)   Deprecated icon in dialogue is updated with the new - arsu
 v3.4 (18-July-2013)   UMP ordering is corrected - arsu
 v3.5 (24-July-2013)   Subregion info added - arsu
 v3.6 (25-July-2013)   Added VUI message for Automemory - arsu
 v3.7 (21-August-2013) Removed Genre and added SIS data in USA HD Nowpalying screen - arsu
_________________________________________________________________________

 */

log.addSrcFile("amradioApp.js", "amradio");


/*******************************************************************************
 * Start of Base App Implementation
 *
 * Code in this section should not be modified except for function names based
 * on the appname
 ******************************************************************************/


function amradioApp(uiaId)
{
    log.debug("AMRadio App constructor called...");

    baseApp.init(this, uiaId);
}

/**************************
 * Standard App Functions *
 **************************/

/*
 * Called just after the app is instantiated by framework.
 */

amradioApp.prototype.appInit = function()
{
    log.debug(" amradioApp appInit  called...");
    if (framework.debugMode)
    {
        utility.loadScript("apps/amradio/test/amradioAppTest.js");
    }
    // cache
    this._cachedRadioDetails = null;
    this._cachedRegion = "REGION_USA";
    this._updateStationList = false;
    this._cachedMetadata = new Object();
    this._hdStatus = null;
    this._taStatusFlag = false;
    this._hdStatusFlag = false;
    this._cachedWeekHDStatus = false;
    this._harFreq = 1620 + " khz ";
    this._cachedCurrentFreq = null;
    this._countSubStations = 0;
    this._CountHDSupported = 0;//HD Substation for AM is 0
    this._cachedScanState = false;
    this._isTaggingSupport = false;
    this._taStatus = "TA_OFF";
    this._cachedOperationMode = null;
    this._cachedSubRegion = null;
    this._isEUTAURegion = false;
	this._FreqSeekTimer = 40;//40 ms Frequency timer for the default NA region for other timer will be 20 ms
	
    this._umpButtonConfig = new Object();
    // Default config
    //@formatter:off
	
	this._amRadiostepCountData = {
		"REGION_USA" :{
									"stepInc" 			  : 10,
									"low"          		  : 530,
									"high"         		  : 1710,
								 },
		"REGION_EU" : {
									"stepInc" 			  : 9,
									"low"          	     : 153,
									"high" 				 : 279,
									"low2"				 :531,
									"high2"              : 1602,
								 },
		"REGION_JPN" : {
									"stepInc" 			  : 9,
									"low"          		  : 522,
									"high"         		  : 1629,
								 },
		"REGION_CHINATAIWAN" : {
									"stepInc" 			  : 9,
									"low"          	     : 153,
									"high" 				 : 279,
									"low2"				 :531,
									"high2"              : 1602,
								 },
		"REGION_4A" : {
						"REGION_5K": {
									"stepInc" 			  : 5,
									"low"          		  : 530,
									"high"         		  : 1620,
								 },
						"REGION_9K":{
									"stepInc" 			  : 9,
									"low"          		  : 522,
									"high"         		  : 1629,
								 },
						"REGION_AUSTRALIA" :{
									"stepInc" 			  : 9,
									"low"          		  : 531,
									"high"         		  : 1602,
								 },
						"REGION_OTHER" :{
									"stepInc" 			  : 9,
									"low"          	     : 153,
									"high" 				 : 279,
									"low2"				 :531,
									"high2"              : 1602,
								 },
					  }
	}

    this._umpButtonConfig["SelectSource"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpEntMenu",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectSource"
    };
    this._umpButtonConfig["SelectAutoMemory"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpAutoMem",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectAutoMemory"
    };
    this._umpButtonConfig["SelectFavoritesAudio"] =
    {
        buttonBehavior : "shortAndLong",
        imageBase : "IcnUmpFavorite",
        currentState:"Unfavorite",
        stateArray: [
            {
                state:"Unfavorite", labelId :"favorites_Tooltip"
            }
        ],
        buttonClass : "normal",
		disabled : false,
        appData : "SelectFavoritesAudio"
    };
    this._umpButtonConfig["SelectHD"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpHD",
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
        appData : "SelectHD"
    };
    this._umpButtonConfig["SelectScan"] =
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
    this._umpButtonConfig["SelectTune"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpTune",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectTune"
    };
    this._umpButtonConfig["SelectiTunesTagging"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpItunesTag",
        currentState:"Untagged",
        stateArray: [
            {
                state:"Untagged"
            },
            {
                state:"Tagged",labelId:"TagCaptured"
            }
        ],
        disabled : true,
        buttonClass : "normal",
        appData : "SelectiTunesTagging"
    };
    this._umpButtonConfig["SelectSeekPrevious"] =
    {
        buttonBehavior : "shortAndHold",
        imageBase : "IcnUmpPreviousAudio",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectSeekPrevious"
    };
    this._umpButtonConfig["SelectSeekNext"] =
    {
        buttonBehavior : "shortAndHold",
        imageBase : "IcnUmpNextAudio",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectSeekNext"
    };
    this._umpButtonConfig["SelectSettings"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpEqualizer",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectSettings"
    };
    //Button config for Japan

    this._umpButtonConfigJpn = new Object();
    // Default config
    //@formatter:off
    this._umpButtonConfigJpn["SelectSource"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpEntMenu",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectSource"
    };
    this._umpButtonConfigJpn["SelectAutoMemory"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpAutoMem",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectAutoMemory"
    };
    this._umpButtonConfigJpn["SelectFavoritesAudio"] =
    {
        buttonBehavior : "shortAndLong",
        imageBase : "IcnUmpFavorite",
        currentState:"Unfavorite",
        stateArray: [
            {
                state:"Unfavorite", labelId :"favorites_Tooltip"
            }
        ],
        buttonClass : "normal",
		disabled : false,
        appData : "SelectFavoritesAudio"
    };
    this._umpButtonConfigJpn["SelectScan"] =
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
    this._umpButtonConfigJpn["SelectTune"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpTune",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectTune"
    };
    this._umpButtonConfigJpn["SelectSeekPrevious"] =
    {
        buttonBehavior : "shortAndHold",
        imageBase : "IcnUmpPreviousAudio",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectSeekPrevious"
    };
    this._umpButtonConfigJpn["SelectSeekNext"] =
    {
        buttonBehavior : "shortAndHold",
        imageBase : "IcnUmpNextAudio",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectSeekNext"
    };
    this._umpButtonConfigJpn["SelectSettings"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpEqualizer",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectSettings"
    };

    //EU Region
    this._umpButtonConfigEU = new Object();

    this._umpButtonConfigEU["SelectSource"] = this._umpButtonConfigJpn["SelectSource"];
    this._umpButtonConfigEU["SelectAutoMemory"] = this._umpButtonConfigJpn["SelectAutoMemory"];
    this._umpButtonConfigEU["SelectFavoritesAudio"] = this._umpButtonConfigJpn["SelectFavoritesAudio"];
    this._umpButtonConfigEU["SelectScan"] = this._umpButtonConfigJpn["SelectScan"];
    this._umpButtonConfigEU["SelectTune"] = this._umpButtonConfigJpn["SelectTune"];
    //TrafficAlert Toggle button
    this._umpButtonConfigEU["SelectTafficalert"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpTrafficAlert",
        currentState:"Unsel",
        stateArray: [
            {
                state:"Sel",labelId : "TrafficAlertOff"
            },
            {
                state:"Unsel",labelId : "TrafficAlertOn"
            }
        ],
        disabled : false,
        buttonClass : "normal",
        appData : "SelectTafficalert",
    };

    this._umpButtonConfigEU["SelectSeekPrevious"] = this._umpButtonConfigJpn["SelectSeekPrevious"];
    this._umpButtonConfigEU["SelectSeekNext"] = this._umpButtonConfigJpn["SelectSeekNext"];
    this._umpButtonConfigEU["SelectSettings"] = this._umpButtonConfigJpn["SelectSettings"];

    //AutoMemory Datalist
    this._autoMemoryDataList = {
        itemCountKnown : true,
        itemCount : 1,
        vuiSupport : true,
        items: [
            { appData : { eventName : "UpdateAutoMemory" } , text1Id : "UpdateStationList", itemStyle : "style02", image1 : null , hasCaret : false }
        ]
    };
    /*
     * NOTE:
     * Every time a function is bound (using bind()), a new
     * function is created in memory. Whenever possible,
     * only bind the same function once and use reference.
     */
    this._stepCallbackBound = this._stepCallback.bind(this);
    this._holdStartCallbackBound = this._holdStartCallback.bind(this);
    this._holdStopCallbackBound = this._holdStopCallback.bind(this);
    this._hdSubstationChangeCallbackBound = this._hdSubstationChangeCallback.bind(this);
    this._backBtnSelectCallbackBound = this._backBtnSelectCallback.bind(this);
	this._TimedSbn_StatusBarStationInfoMsgHandler = this._TimedSbnStatusBarStationInfoAnalogMsgHandler.bind(this)
    //@formatter:off
    this._contextTable = {

        "NowPlaying" : {
            "template" : "NowPlaying4Tmplt",
            "sbNameId" : "AMRadio",
            "controlProperties": {
                "NowPlayingCtrl" : {
                    "ctrlStyle" : "Style2",
                    "umpConfig" : {
                        "buttonConfig" : this._umpButtonConfig,
                        "fullConfig"    : false,
                        "defaultSelectCallback" : this._umpDefaultSelectCallback.bind(this),
                        "defaultHoldStartCallback" : this._umpDefaultHoldStartCallback.bind(this),
                        "defaultHoldStopCallback"  : this._umpDefaultHoldStopCallback.bind(this),
                        "defaultLongPressCallback" : this._umpDefaultLongPressCallback.bind(this),
                        "umpStyle" : "fullWidth",
                        "hasScrubber" : false,
                        "dataList": null,
                        "title" : {
                            titleStyle : "oneLine"
                        },
                    }
                } // end of properties for "NowPlayingCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._AMNowPlayingCtxtTmpltReadyToDisplay.bind(this),
            "contextInFunction" : null,
            "displayedFunction": null
        }, // end of "NowPlaying"

        "Tune" : {
            "template" : "Tuner4Tmplt",
            "sbNameId" : "AMRadio",
            "leftBtnStyle": "goBack",
            "controlProperties": {
                "Tuner4Ctrl" : {
                    "appData" : {TuneUp : "TuneUp" , TuneDown : "TuneDown"},
                    "region" : "NA",
                    "band" : "AM",
                    "stepCallback" : this._stepCallbackBound,
                    "holdStartCallback" : this._holdStartCallbackBound,
                    "holdStopCallback" : this._holdStopCallbackBound,
                    "hdSubstationChangeCallback" : this._hdSubstationChangeCallbackBound,
                    "backBtnSelectCallback" : this._backBtnSelectCallbackBound,
                    "centeredBtnSelectCallback" : this._centeredBtnSelectCallback.bind(this),
                    "centeredBtnLongPressCallback" : this._centeredBtnLongPressCallback.bind(this)
                }
            },
            "leftBtnStyle": "goBack",
            "readyFunction" : this._TuneCtxtTmpltReadyToDisplay.bind(this),
            "contextInFunction" : this._TuneCtxtIn.bind(this),
            "displayedFunction": null
        }, //end of Tune

        "AutoMemory" : {
            "template" : "List2Tmplt",
            "sbNameId" : "AMRadio",
            "controlProperties": {
               "List2Ctrl" : {
                    dataList : this._autoMemoryDataList,
                    titleConfiguration : 'listTitle',
                    title : {
                        text1Id : "AutoMemory",
                        titleStyle : "style02"
                    },
                    selectCallback : this._listItemClickCallback.bind(this),
                    longPressCallback : this._listLongPressCallback.bind(this)
                } // end of properties for "ListCtrl"
            }, // end of list of controlProperties
            "leftBtnStyle": "goBack",
            "readyFunction" : this._AutoMemoryCtxtTmpltReadyToDisplay.bind(this),
            "contextInFunction" : null,
            "displayedFunction": null
        },//end of AutoMemory

        "TrafficAlert" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "AMRadio",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),
                    "contentStyle" : "style03",
                    "fullScreen" : false,
                    "buttonConfig" : {
                        "button1" : {
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            label : "Back",
                            labelId : "Back",
                            subMap : null,
                            appData : "SelectSource"
                        },
                        "button2" : {
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            label : "Settings",
                            labelId: "Settings",
                            subMap: null,
                            appData : "SelectSettings",
                            selectCallback : null
                        },
                        "button3" : {
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            label : "1620 / 1629",
                            labelId : null,
                            subMap : null,
                            appData : "SelectChangeStation"
                        },
                    }, // end of buttonConfig
                    "text1" : this._harFreq ,
                    "imagePath1" : "common/images/icons/IcnDialogSpeaker.png"
                }
            },
            "readyFunction" : this._TrafficAlertCtxtTmpltReadyToDisplay.bind(this),
            "contextInFunction" : null,
            "displayedFunction": null
        }, // end of "TrafficAlert"
    }; // end of this.contextTable
    //@formatter:on

    //@formatter:off
    this._messageTable = {
        "RadioTunerStatus" : this._RadioTunerStatusMsgHandler.bind(this),
        "RegionInformation" : this._RegionStatusMsgHandler.bind(this),
        "MetaDataInformation" : this._MetaDataInfoMsgHandler.bind(this),
        "AutoMStatusInfo" : this._AutoMStatusInfoMsgHandler.bind(this),
        "HdStatusInfo" : this._HdStatusInfoMsgHandler.bind(this),
        "TAStatusInfo" : this._TAStatusInfoMsgHandler.bind(this),
        "HDTunerStatusInfo" : this._HDTunerStatusMsgHandler.bind(this),
        "TrafficAlertStatusInfo" : this._TrafficAlertStatusInfoMsgHandler.bind(this), //Trafficalert context
        "TaggingStates" : this._TaggingStatesMsgHandler.bind(this), //Tagging button status
        "MetaDataArtisticInfo" : this._MetaDataArtisticInfoMsgHandler.bind(this), //Album Art info
        "TimedSbn_TaggingStoreStatus" : this._TimedSbnTaggingStoreStatusMsgHandler.bind(this),
        "TimedSbn_StatusBarStationInfoHD" : this._TimedSbn_StatusBarStationInfoMsgHandler,
        "TimedSbn_StatusBarStationInfoAnalog" : this._TimedSbn_StatusBarStationInfoMsgHandler,
        "MetaDataChangeNotification" : this._MetaDataChangeNotificationMsgHandler.bind(this),
        "SelectFocusedStationAsFavorite" : this._SelectFocusedStationAsFavoriteMsgHandler.bind(this),
        "ScanStatus" : this._ScanStatusMsgHandler.bind(this),
        "RADIO_4A_region_info" : this._RadioFourARegionInfoMsgHandler.bind(this),
        //VUI Messages
        "VUIAutoMUpdate" : this._VUIAutoMUpdateInfoMsgHandler.bind(this),
    }; // end of this._messageTable
    //@formatter:on
}


/**************************
 * Context handlers
 **************************/

// AMRadio NowPlaying Context

amradioApp.prototype._AMNowPlayingCtxtTmpltReadyToDisplay = function()
{
    log.debug("amradioApp _AMNowPlayingCtxtTmpltReadyToDisplay called...");
    var state = "Unsel";
    if(this._hdStatus === "HD_ON")
    {
        this._hdStatusFlag = true;
        state = "Sel";
    }
    else if(this._hdStatus === "HD_OFF")
    {
        this._hdStatusFlag = false;
        state = "Unsel";
    }
    this._setUmpButtonConfig();  //Set the UMPbutton config for Different Region
    this._setScanToggleUMPCtrl(this._currentContextTemplate,"Unsel");
    if (this._cachedRegion === "REGION_USA" && this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying")
    {
        this._setUMPButtonHD("SelectHD",state);
        if (this._hdStatus === "HD_OFF")
        {
            this._setiTunesUMPCtrl(this._currentContextTemplate,"Untagged",true);
        }
        else
        {
            this._setiTunesButtonState(this._currentContextTemplate);
        }
    }
}

//Tune context template
amradioApp.prototype._TuneCtxtIn = function()
{
    log.debug("amradioApp _TuneCtxtIn called...");
    var region = null;
    switch (this._cachedRegion)
    {
        case "REGION_JPN" :
            region = "JA";
            break;
        case "REGION_EU" :
            region = "EU";
            break;
        case "REGION_USA" :
        case "REGION_OTHER" :
            region = "NA";
            break;
        case "REGION_4A" :
            switch(this._cachedSubRegion)
            {
                case "REGION_5K" :
                    region = "RW5k";
                    break;
                case "REGION_9K" :
                    region = "RW9k";
                    break;
                case "REGION_AUSTRALIA" :
                    region = "ADR";
                    break;
                case "REGION_OTHER" :
                    region = "RWOther";
                    break;
                default :
                    region = "ADR";
                    break;
            }
            break;
        case "REGION_CHINATAIWAN" :
            region = "CH";
            break;
        default :
            region = "NA";
            break;
    }
    this._contextTable.Tune.controlProperties.Tuner4Ctrl.region = region;
}

amradioApp.prototype._TuneCtxtTmpltReadyToDisplay = function()
{
    log.debug("amradioApp _TuneCtxtTmpltReadyToDisplay called...");
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "Tune")
    {
        this._setTunerFrequency(this._currentContextTemplate)
    }
}

//Auto memory Ctxt Tmplt
amradioApp.prototype._AutoMemoryCtxtTmpltReadyToDisplay = function()
{
    log.debug("amradioApp _AutoMemoryCtxtTmpltReadyToDisplay called...");
    if(this._cachedAutoMStatus === "UPDATING" && this._currentOperationMode === "AUTO_M_MODE")
    {
        this._cachedAutoMStatus = "UPDATING"; //if this._currentOperationMode is AUTO_M_MODE then "this._cachedAutoMStatus" should be "UPDATING".
        this._populateAutoMemUpdatingStationListCtrl();
    }
    else
    {
        this._cachedAutoMStatus = "NONE";
        var params = {};
        framework.sendRequestToDbapi(this.uiaId, this._getAutoMemoryCallbackFn.bind(this), "radio", "AmAutoMemoryList", params);
    }
}

amradioApp.prototype._TrafficAlertCtxtTmpltReadyToDisplay = function()
{
    log.debug("amradioApp _TrafficAlertCtxtTmpltReadyToDisplay called...");
    this._setTrafficalertText(this._currentContextTemplate);
}

/**************************
 * Message handlers
 **************************/

amradioApp.prototype._RadioTunerStatusMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.radioTunerStatus)
    {
        
        if(msg.params.payload.radioTunerStatus.freq === -1)
		{
			this._isFreqCleared = true;
			this._lastClearedFreq = this._cachedRadioDetails.freq;
			this._lastClearedStationName = this._cachedRadioDetails.stationName;
			
			this._cachedRadioDetails.freq = "";
			this._cachedRadioDetails.stationName = "";
			
			if(this._currentContextTemplate && this._currentContext && (this._currentContext.ctxtId === "NowPlaying" ))
			//this._populateAMNowPlayingCtrl(this._currentContextTemplate);
			this._currentContextTemplate.nowPlaying4Ctrl.setCtrlTitle({ctrlTitleText : ""}); 
			//cleared the freq on -1 and return
			
			log.info("Last Frequency and station name cleared and stored as " +this._lastClearedFreq+" , "+this._lastClearedStationName);
			
			return;
		}
		
		log.info("Frequency is not cleared");
		
		if(this._isFreqCleared && (this._lastClearedFreq === msg.params.payload.radioTunerStatus.freq))
		{
			log.info("return:: Frequency is same as last one");
			return;
		}
		this._isFreqCleared = false;
		
		this._cachedRadioDetails = msg.params.payload.radioTunerStatus;
		
		log.info("Inside Radio Tuner Status : Operation Mode received = "+this._cachedRadioDetails.operationMode +" and Frequency received ="+this._cachedRadioDetails.freq);

		
		
		if(this._cachedRadioDetails.operationMode)
        {
            this._currentOperationMode = this._cachedRadioDetails.operationMode;
        }
		
		//Clear the timer if already running
		clearTimeout(this._freqTimerStarted);
        this._freqTimerStarted = null;
		
		//Clear the timer if already running
		clearTimeout(this._freqTimerStartedSBN);
        this._freqTimerStartedSBN = null;
		
		if(this._cachedRegion == "REGION_4A")
		{
			stepCount = this._amRadiostepCountData[this._cachedRegion][this._cachedSubRegion].stepInc;
		}
		else
		{
			stepCount = this._amRadiostepCountData[this._cachedRegion].stepInc;
		}
		this._stepCount = stepCount;
		
		if((this._currentOperationMode === "SCAN_UP_MODE" || this._currentOperationMode === "SEEK_UP_MODE" || this._currentOperationMode === "SEEK_DOWN_MODE") && this._cachedCurrentFreq)
		{
			var displayedFreq = this._cachedCurrentFreq;
			var newFreqRecived = this._cachedRadioDetails.freq;
			
			this._newFreqRecived = newFreqRecived;
			this._displayedFreq = displayedFreq;
		
			if(this._cachedCurrentFreq !== this._cachedRadioDetails.freq)
			{				
				this._cachedCurrentFreq = this._cachedRadioDetails.freq;
				this._newFreqRecieved = this._cachedRadioDetails.freq;
				this._cachedMetadata["trackTitle"] = "";
				this._cachedMetadata["albumName"] = "";
				this._cachedMetadata["artistName"] = "";
				this._cachedMetadata["albumArtPath"] = "";
				this._cachedMetadata["sisData"] = "";
				
			}
			
			switch (this._currentContext.ctxtId )
			{
				case "NowPlaying" :
					if((this._cachedOperationMode ==="SEEK_UP_MODE" || this._cachedOperationMode ==="SEEK_DOWN_MODE" || this._cachedOperationMode ==="SCAN_UP_MODE" || this._cachedOperationMode ==="SCAN_RECEIVE_MODE") &&
						(this._currentOperationMode ==="SEEK_UP_MODE" || this._currentOperationMode ==="SEEK_DOWN_MODE" || this._currentOperationMode ==="SCAN_UP_MODE" || this._currentOperationMode ==="SCAN_RECEIVE_MODE"))
					{
						//Do Nothing
					}
					else
					{
						this._cachedOperationMode = this._currentOperationMode;
						this._populateAMNowPlayingCtrl(this._currentContextTemplate);
					}
					break;
				case "Tune" :
					this._setTunerFrequency(this._currentContextTemplate);
					break;
				default :
					break;
			}
			
			if(!this._freqTimerStarted)
			{
				var populateScanFreqFunction = this._populateScanFreqNowPlayingCtrl.bind(this,this._currentContextTemplate);
				this._freqTimerStarted = setInterval(populateScanFreqFunction,this._FreqSeekTimer);
			}
		}
		else
		{
			if(this._cachedRadioDetails.freq)
			{
				if(this._cachedCurrentFreq !== this._cachedRadioDetails.freq)
				{
					this._cachedCurrentFreq = this._cachedRadioDetails.freq;
					this._newFreqRecieved = this._cachedRadioDetails.freq;
					this._cachedMetadata["trackTitle"] = "";
					this._cachedMetadata["albumName"] = "";
					this._cachedMetadata["artistName"] = "";
					this._cachedMetadata["albumArtPath"] = "";
					this._cachedMetadata["sisData"] = "";
				}
			}
			if ( this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId )
			{
				switch (this._currentContext.ctxtId )
				{
					case "NowPlaying" :
						if((this._cachedOperationMode ==="SEEK_UP_MODE" || this._cachedOperationMode ==="SEEK_DOWN_MODE" || this._cachedOperationMode ==="SCAN_UP_MODE" || this._cachedOperationMode ==="SCAN_RECEIVE_MODE") &&
							(this._currentOperationMode ==="SEEK_UP_MODE" || this._currentOperationMode ==="SEEK_DOWN_MODE" || this._currentOperationMode ==="SCAN_UP_MODE" || this._currentOperationMode ==="SCAN_RECEIVE_MODE"))
						{
							this._cachedOperationMode = this._currentOperationMode;
							this._populateFreqNowPlayingCtrl(this._currentContextTemplate);

						}
						else
						{
							this._cachedOperationMode = this._currentOperationMode;
							this._populateAMNowPlayingCtrl(this._currentContextTemplate);
						}
						break;
					case "Tune" :
						this._setTunerFrequency(this._currentContextTemplate);
						break;
					default :
						break;
				}
			}
		}
    }
}

amradioApp.prototype._populateScanFreqNowPlayingCtrl = function (tmplt)
{
	var frequency = "";
    var ctrlTitleItem = null;
	var freqToDisplay = 0;
	
	freqToDisplay = this._populateScanFreq();
	var newFreqToDisplay = freqToDisplay;
	var newFormattedFreqRecived = this._newFreqRecived; 
	
	if(!(newFreqToDisplay != newFormattedFreqRecived))
	{
		clearTimeout(this._freqTimerStarted);
        this._freqTimerStarted = null;
	}
	this._cachedCurrentFreq = freqToDisplay;

	//shows the metadata information along with the title
	frequency = freqToDisplay;
	this._displayedFreq = freqToDisplay;
	if(tmplt && this._currentContext && this._currentContext.ctxtId === "NowPlaying")
	{
		if(this._currentOperationMode !== "AUTO_M_MODE")
		{
			ctrlTitleItem = frequency;
			log.info("Frequency going to display :: "+frequency);
			tmplt.nowPlaying4Ctrl.setCtrlTitle({ctrlTitleText : ctrlTitleItem});
		}
	}	
};

amradioApp.prototype._populateScanFreqSBNCtrl = function (tmplt)
{
    var frequency = "";
	var freqToDisplay = 0;
	
	freqToDisplay = this._freqToDisplay;
	var newFreqToDisplay = freqToDisplay;
	var newFormattedFreqRecived = this._newFreqRecived; 
	
	if(!(newFreqToDisplay != newFormattedFreqRecived)) // if new freq and received freq same then clear the timer
	{
		clearTimeout(this._freqTimerStartedSBN);
        this._freqTimerStartedSBN = null;
	}

	this._cachedCurrentFreq = freqToDisplay;
	
	//shows the metadata information along with the title
	frequency = freqToDisplay;
	this._displayedFreq = freqToDisplay;
	if(framework.getCurrCtxtId() !== "NowPlaying")
	{
		if(this._currentOperationMode !== "AUTO_M_MODE") 
		{ 
			var sbnText = frequency;
			framework.common.startTimedSbn(this.uiaId, "StationsbnInfo", "typeE",
			{ sbnStyle : "Style02",imagePath1 : "common/images/icons/IcnListBtConnType_Music.png", text1Id : "system.AmRadio" , text2 : sbnText }); 
		} 
	} 	
}

//msg info from MMUI to Send details of focused item to MMUI .
amradioApp.prototype._SelectFocusedStationAsFavoriteMsgHandler = function(msg)
{
    if (this._currentContextTemplate && this._currentContextTemplate.list2Ctrl)
    {
        var focussedItem = null;
        var stationList = null;
        var frequency = null;
        var stationName = null;
        var eventName = null;
        var piCode = null;
        if(this._currentContextTemplate.list2Ctrl.focussedItem != null)
        {
            focussedItem = this._currentContextTemplate.list2Ctrl.focussedItem;
        }
        if(this._currentContextTemplate.list2Ctrl.dataList)
        {
            stationList = this._currentContextTemplate.list2Ctrl.dataList;
        }
        if(stationList && stationList.items[focussedItem] && stationList.items[focussedItem].appData)
        {
            if(stationList.items[focussedItem].appData.stations)
            {
                frequency = stationList.items[focussedItem].appData.stations;
            }
            if(stationList.items[focussedItem].appData.stationName)
            {
                stationName = stationList.items[focussedItem].appData.stationName;
            }
            if(stationList.items[focussedItem].appData.eventName)
            {
                eventName = stationList.items[focussedItem].appData.eventName;
            }
            if(stationList.items[focussedItem].appData.piCode)
            {
                piCode = stationList.items[focussedItem].appData.piCode;
            }
        }
		log.warn(stationList.items[focussedItem].appData);
		log.info(eventName);
        if ( focussedItem != null)
        {
			switch(eventName){
				case "SelectStationFrequency":
					framework.sendEventToMmui(this.uiaId, "SelectFavoritesStation" ,
					{payload:{radioData: { stationType : "AM", frequency : frequency, stationName : stationName, PICode : piCode, HDSPS : "SPS_NONE", satRadioData : null }}});
					break;
				case "UpdateAutoMemory":
					framework.sendEventToMmui(this.uiaId, "NoFavoriteSelected" , {payload:{}},true);
					break;
				default:
					log.info("Defaulted for focussed item[" + eventName + "]") ;
					break;
			}
        }
    }
}

//Msg handler for RegionInformation
amradioApp.prototype._RegionStatusMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload)
    {
        if(msg.params.payload.region !== this._cachedRegion)
        {
            this._cachedRegion = msg.params.payload.region;
            if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying" && this._cachedRegion !== "REGION_4A") //If region is 4A then wait for subregion
            {
                this._setUmpButtonConfig(); //To set the buttonconfig for Different region
            }
        }
    }
}

//Msg Handler for Metadata
amradioApp.prototype._MetaDataInfoMsgHandler = function(msg)
{
    //DBAPI implementation for metadata
    if (msg && msg.params && msg.params.payload && (msg.params.payload.metaDataSts !== "NONE" || msg.params.payload.metaDataSts !== "PSD_PTY_UPDATED"))
    {
        var params = { "region": "Other" };
        this._metaDataSts = msg.params.payload.metaDataSts;
        framework.sendRequestToDbapi(this.uiaId, this._getMetaDataUpdateCallbackFn.bind(this), "radio", "AmNowPlayingMetadata", params);
    }
}

//AutoMemory List Message handler
amradioApp.prototype._AutoMStatusInfoMsgHandler = function(msg)
{
    var status = null;
    if (msg && msg.params && msg.params.payload && msg.params.payload.AutoMStatus)
    {
        status = msg.params.payload.AutoMStatus;
        if(this._updateStationList && status === "AVAILABLE")
        {
            //Send request to DBAPI
            var params = {};
            framework.sendRequestToDbapi(this.uiaId, this._getAutoMemoryCallbackFn.bind(this), "radio", "AmAutoMemoryList", params);
            this._updateStationList = false; //send request to DBAPI only on click of update station list
        }
        else if(this._updateStationList && msg.params.payload.AutoMStatus !== "UPDATING")
        {
            if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "AutoMemory")
            {
                this._populateAutoMemUpdateStationListCtrl(this._currentContextTemplate);
                this._updateStationList = false;
            }
        }
        else if(status !== this._cachedAutoMStatus &&  msg.params.payload.AutoMStatus === "UPDATING")
        {
            if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "AutoMemory")
            {
                this._populateAutoMemUpdatingStationListCtrl();
            }
        }
        this._cachedAutoMStatus = status;
    }
}

//HD toggle button status message handler
amradioApp.prototype._HdStatusInfoMsgHandler = function(msg)
{
    if ( msg && msg.params && msg.params.payload && msg.params.payload.hdStatus)
    {
        var state = this._umpButtonConfig["SelectHD"].currentState;
        var previousHdStatus = this._hdStatus;
        this._hdStatus = msg.params.payload.hdStatus;
        if (previousHdStatus !== this._hdStatus)
        {
            if(this._hdStatus === "HD_ON")
            {
                this._hdStatusFlag = true;
                state = "Sel";
            }
            else if(this._hdStatus === "HD_OFF")
            {
                this._hdStatusFlag = false;
                state = "Unsel";
            }

            if (this._cachedRegion === "REGION_USA" && this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying")
            {
                if (previousHdStatus !== this._hdStatus)
                {
                    this._setUMPButtonHD("SelectHD",state);
                }
                if (this._hdStatus === "HD_OFF")
                {
                    this._setiTunesUMPCtrl(this._currentContextTemplate,"Untagged",true);
                }
            }
        }
    }
}

//TA toggle button status handler
amradioApp.prototype._TAStatusInfoMsgHandler = function(msg)
{
    log.debug("amradioApp _TAStatusInfoMsgHandler called...");
    var trafficStatus = this._taStatus;
    if ( msg && msg.params && msg.params.payload && msg.params.payload.taStatus )
    {
        var taState = this._umpButtonConfigEU["SelectTafficalert"].currentState;
        this._taStatus = msg.params.payload.taStatus;
        if ( trafficStatus !== this._taStatus )
        {
            if(this._taStatus === "TA_ON")
            {
                this._taStatusFlag = true;
                taState = "Sel";
                this._umpButtonConfigEU["SelectTafficalert"].currentState = "Sel";
            }
            else if(this._taStatus === "TA_OFF")
            {
                this._taStatusFlag = false;
                taState = "Unsel";
                this._umpButtonConfigEU["SelectTafficalert"].currentState = "Unsel";
            }
            if ((this._cachedRegion === "REGION_EU" || this._isEUTAURegion) && this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying")
            {
                this._setUMPButtonState("SelectTafficalert",taState);
            }
        }
    }
}

//Weak HD status handler.
amradioApp.prototype._HDTunerStatusMsgHandler = function(msg)
{
    if ( msg && msg.params && msg.params.payload && msg.params.payload.HDTunerStatus )
    {
        this._cachedHDTunerStatus = msg.params.payload.HDTunerStatus;

        if (this._cachedHDTunerStatus.current_playing_sps)
        {
            this._cachedCurrentPlayingSPS = this._cachedHDTunerStatus.current_playing_sps;
        }
        if(this._cachedHDTunerStatus.available_sps)
        {
            this._storeHDStationsList();
        }

        if ( this._cachedHDTunerStatus && this._cachedHDTunerStatus.HD_radio_error === false )
        {
            this._isHDLogoSupport = false;
            if( this._cachedHDTunerStatus.channel_type && this._cachedHDTunerStatus.transmission_type)
            {
                this._isHDLogoSupport = true;
                if(this._cachedHDTunerStatus.channel_type === "ANALOG_CHANNEL" && this._cachedHDTunerStatus.transmission_type === "ANALOG_TRANSMISSION")
                {
                    this._isHDLogoSupport = false;
                    if ( this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying")
                    {
                        this._setiTunesUMPCtrl(this._currentContextTemplate,"Untagged",true);
                    }
                }
                if(this._cachedHDTunerStatus.channel_type === "DIGITAL_CHANNEL" && this._cachedHDTunerStatus.transmission_type === "DIGITAL_TRANSMISSION")
                {
                    this._cachedWeekHDStatus = false;
                    this._isTaggingSupport = true;
                }
                else if(this._cachedHDTunerStatus.channel_type === "DIGITAL_CHANNEL" && this._cachedHDTunerStatus.transmission_type === "ANALOG_TRANSMISSION")
                {
                    this._cachedWeekHDStatus = true;
                    this._isTaggingSupport = true;
                }
            }
            //USA HD SCREEN
            if(this._currentContextTemplate && this._hdStatusFlag && this._cachedHDTunerStatus.transmission_type === "DIGITAL_TRANSMISSION" && this._cachedHDTunerStatus.channel_type === "DIGITAL_CHANNEL")
            {
                this._isTaggingSupport = true;
                this._isHDLogoSupport = true;
            }
            //USA ANALOG SCREEN
            else if((!this._hdStatusFlag) || (this._currentContextTemplate && this._hdStatusFlag && this._cachedHDTunerStatus.channel_type === "ANALOG_CHANNEL"))
            {
                this._isTaggingSupport = false;
                this._isHDLogoSupport = false;
            }
            //Display Week HD Screens
            else if(this._cachedCurrentPlayingSPS === "SPS_NONE" && this._hdStatusFlag && this._cachedHDTunerStatus && this._cachedHDTunerStatus.transmission_type === "ANALOG_TRANSMISSION" && this._cachedHDTunerStatus.channel_type === "DIGITAL_CHANNEL")
            {
                this._isTaggingSupport = true;
                this._isHDLogoSupport = true;
            }
        }
        if ( this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying")
        {
            this._populateAMNowPlayingCtrl(this._currentContextTemplate);
        }
        if ( this._currentContextTemplate && this._currentContext.ctxtId === "Tune")
        {
            this._setTunerFrequency(this._currentContextTemplate);
        }
    }
}

//TrafficAlert Context message handler
amradioApp.prototype._TrafficAlertStatusInfoMsgHandler = function(msg)
{
    if ( msg && msg.params && msg.params.payload && msg.params.payload.trafficAlertStatus )
    {
        if ( msg.params.payload.trafficAlertStatus.har_freq )
        {
            var harFreq = msg.params.payload.trafficAlertStatus.har_freq;
            switch (harFreq)
            {
                case "FREQ1620" :
                    this._harFreq = 1620 + " khz ";
                    break;
                case "FREQ1629" :
                    this._harFreq = 1629 + " khz ";
                    break;
                default :
                    break;
            }
        }
        if ( this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "TrafficAlert" )
        {
            this._setTrafficalertText(this._currentContextTemplate);
        }
    }
}

//iTune button status handler
amradioApp.prototype._TaggingStatesMsgHandler = function(msg)
{
    if ( msg && msg.params && msg.params.payload && msg.params.payload.tagging_state )
    {

        this._cachedTaggingState = msg.params.payload.tagging_state;
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying" )
        {
            this._setiTunesButtonState(this._currentContextTemplate);
        }
    }
}

//MetaDataArtistic Info MsgHandler
amradioApp.prototype._MetaDataArtisticInfoMsgHandler = function(msg)
{
    if ( msg && msg.params && msg.params.payload && msg.params.payload.MetaDataArtistInfo )
    {
        var imageinfo = msg.params.payload.MetaDataArtistInfo
        if ( imageinfo === "DISPLAY_ALBUMART" )
        {
            //Send DBAPI request for Album Art path
            var params = { "region": "Other" };
            framework.sendRequestToDbapi(this.uiaId, this._getMetaDataArtisticInfoCallbackFn.bind(this), "radio", "AmNowPlayingMetadata", params);
        }
        else if (imageinfo === "DISPLAY_CLEAR")
        {
            this._albumArtPath = "";
            if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying" )
            {
                this._UpdateAlbumArtImage(this._currentContextTemplate);
            }
        }
    }
}

//SBN callback
amradioApp.prototype._TimedSbnTaggingStoreStatusMsgHandler = function(msg)
{
    if ( msg && msg.params && msg.params.payload && msg.params.payload.tagging_store_status )
    {
        var tagStatus = msg.params.payload.tagging_store_status;
        var sbnText = null;
		var showTypeFSBN = false;
		var showTypeESBN = false;
        switch ( tagStatus )
        {
            case "TagSaved" :
            case "TagTransferSuccess" :
            case "TagSavedtoIpod" :
            case "TagSavedtoSystem" :
			case "TagDuplicate" :
                sbnText = "TagSavedsbn";
				showTypeESBN=true;
                break;
			case "TagSavedIpodFull" :
			case "AllTagsTransferredIpodFull" :
			case "TagTransferIpodFull" :
			case "TagDuplicateIpodFull" :
			case "TagTransferNoMemory" :
                sbnText = "IopdFull";
				showTypeFSBN=true;
                break;	
            case "TagDuplicateIpodFull" :
                break;
            case "ErrorNoMemoryAll" :
            case "ErrorNoMemorySystem" :
                sbnText = "MemoryFullsbn";
				showTypeFSBN=true;
                break;
            case "ErrorIpodFail" :
				sbnText = "ErrorIpodFail";
				showTypeFSBN=true;
                break;
            case "ErrorConnection" :
				sbnText = "ErrorConnection";
				showTypeFSBN=true;
                break;                
            case "TagNotYetProcessed" :
                sbnText = "TagNotYetProcessed";
                break;
            default :
                break;

        }
        //Call TimedSbn function in Common
        if (showTypeFSBN)
        {
            framework.common.startTimedSbn(this.uiaId, "TaggingsbnInfo", "typeF", { sbnStyle : "Style02",imagePath1 : "common/images/icons/IcnListBtConnType_Music.png", text1Id : sbnText , text2 : null });
			showTypeFSBN=false;
		}
		if (showTypeESBN)
        {
            framework.common.startTimedSbn(this.uiaId, "TaggingsbnInfo", "typeE", { sbnStyle : "Style02",imagePath1 : "common/images/icons/IcnListBtConnType_Music.png", text1Id : sbnText , text2 : null });
			showTypeESBN=false;
		}
    }
}

//Status Bar Station info message handler for Analog
amradioApp.prototype._TimedSbnStatusBarStationInfoAnalogMsgHandler = function(msg)
{
    var StationInfo = null;
    var frequency = "";
    var picode = null;
	
	//Clear the timer if already running
	clearTimeout(this._freqTimerStartedSBN);
	this._freqTimerStartedSBN = null;
	
    if ( msg && msg.params && msg.params.payload)
    {
		StationInfo= msg.params.payload;
		
		//For Seek only freq will be shown
		if((this._currentOperationMode === "SEEK_UP_MODE" || this._currentOperationMode === "SEEK_DOWN_MODE") && this._cachedCurrentFreq)
		{
			this._newFreqRecived = StationInfo.Frequency;
			
			if(!this._displayedFreq)
			{
				this._displayedFreq = this._cachedCurrentFreq;
			}
			if(!this._freqTimerStartedSBN && this._cachedCurrentFreq)
			{
				var populateScanFreqFunction = this._populateScanFreqSBNCtrl.bind(this,this._currentContextTemplate);
				this._freqTimerStartedSBN = setInterval(populateScanFreqFunction,this._FreqSeekTimer);
			}
		}
		else
		{
			if (StationInfo.Frequency)
			{
				frequency = StationInfo.Frequency;
				
			}
			if(StationInfo.SubPlayingStation && this._cachedRegion === "REGION_USA" && this._hdStatusFlag === true)
			{
				frequency = frequency + " HD"
			}
			framework.common.startTimedSbn(this.uiaId, "AnalogsbnInfo", "typeE", { sbnStyle : "Style02",imagePath1 : "common/images/icons/IcnListBtConnType_Music.png", text1Id : "system.AmRadio" , text2 : frequency}); 
		}
    }
}

amradioApp.prototype._MetaDataChangeNotificationMsgHandler = function(msg)
{
    if ( msg && msg.params && msg.params.payload && msg.params.payload.metaDataChangeNote )
    {
        var metaDataChangeNote = msg.params.payload.metaDataChangeNote;
        if ( this._cachedMetadata )
        {
            if ( metaDataChangeNote.Radio_metadata_psd_sis_changed === true )
            {
                //Clear sis Data
                this._cachedMetadata.sisData = null;

            }
            if ( metaDataChangeNote.Radio_metadata_psd_track_changed === true )
            {
                //Clear song title
                this._cachedMetadata.trackTitle = null;

            }
            if ( metaDataChangeNote.Radio_metadata_psd_artist_changed === true )
            {
                //Clear artist name
                this._cachedMetadata.artistName = null;
            }
            if ( metaDataChangeNote.Radio_metadata_psd_album_changed === true )
            {
                //Clear Album name
                this._cachedMetadata.albumName = null;
            }
        }
    }

    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying" )
    {
        this._populateAMNowPlayingCtrl(this._currentContextTemplate);
    }
}

//Scan Status message received from MMUI
amradioApp.prototype._ScanStatusMsgHandler = function(msg)
{
    var scanState = false;
    if (msg && msg.params && msg.params.payload)
    {
        scanState = msg.params.payload.ScanOn;
        if(scanState != this._cachedScanState)
        {
            var scanSel_Unsel = "Unsel"
            this._cachedScanState = scanState;
            if(this._cachedScanState)
            {
                scanSel_Unsel = "Sel";
            }
            this._setScanToggleUMPCtrl(this._currentContextTemplate,scanSel_Unsel);
        }
    }
}

amradioApp.prototype._RadioFourARegionInfoMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.subRegion4AInfo)
    {
        if(msg.params.payload.subRegion4AInfo !== this._cachedSubRegion)
        {
            this._cachedSubRegion = msg.params.payload.subRegion4AInfo;
            //set the button config in nowplaying according to the region received from MMUI
            this._setUmpButtonConfig();
        }
    }
}

//VUI for Automemory
amradioApp.prototype._VUIAutoMUpdateInfoMsgHandler = function()
{
    if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "AutoMemory")
    {
        this._populateAutoMemUpdatingStationListCtrl();
    }
}

/**************************
 * Control callbacks
 **************************/
// Callback notification from the Tuner4 control that the user has pressed the back button
amradioApp.prototype._backBtnSelectCallback = function(tunerRef, appData, params)
{
    log.debug(" amradioApp._backBtnSelectCallback : ");

    // Make sure we're active
    if (this._currentContext && this._currentContextTemplate)
    {
        // Issue global goBack message
        framework.sendEventToMmui("common", "Global.GoBack");
    }
};

/*
 * Callback from Tuner4Ctrl Centre dial is clicked.
 */
amradioApp.prototype._centeredBtnSelectCallback = function(tunerRef, appData, params)
{
    log.info(" testtuner4App._centeredBtnSelectCallback : ");
    framework.sendEventToMmui(this.uiaId, "StationFrequencyShortPress");
};

/*
 * Callback from Tuner4Ctrl Centre dial is Long pressed.
 */

amradioApp.prototype._centeredBtnLongPressCallback = function(tunerRef, appData, params)
{
    log.info(" testtuner4App._centeredBtnLongPressCallback : ");
    framework.sendEventToMmui("common", "Global.AddToFavorites");
};

/*
 * Callback from Tuner3Ctrl Tune button is clicked.
 */
amradioApp.prototype._stepCallback = function(tunerRef, appData, params)
{
    log.debug(" amradioApp._stepCallback      : " + params.direction + " " + params.stepCount + " to frequency " + params.frequency);
    if(params && params.direction)
    {
        var stepParams = {};
        if(params.stepCount)
        {
            stepParams = { payload : { "stepCount" : params.stepCount}};
        }
        switch(params.direction)
        {
            case "up":
                framework.sendEventToMmui(this.uiaId, appData.TuneUp, stepParams);
                break;
            case "down":
                framework.sendEventToMmui(this.uiaId, appData.TuneDown, stepParams);
                break;
            default:
                break;
        }
    }
}

/*
 * Callback from Tuner3Ctrl Tune button is clicked.
 */
amradioApp.prototype._holdStartCallback = function(tunerRef, appData, params)
{
    log.debug(" amradioApp._holdStartCallback : " + params.direction);
     var stepParams = {};
    if(params.stepCount)
    {
        stepParams = { payload : { "stepCount" : 1}};
    }
    switch(params.direction)
    {
        case "up":
            //framework.sendEventToMmui(this.uiaId, "HoldTuneUp",stepParams); TODO : Need to decide event name for long press start
            break;
        case "down":
            //framework.sendEventToMmui(this.uiaId, "HoldTuneDown",stepParams); TODO : Need to decide event name for long press start
            break;
        default:
            break;
    }
}

/*
 * Callback from Tuner3Ctrl Tune button is clicked.
 */
amradioApp.prototype._holdStopCallback = function(tunerRef, appData, params)
{
    log.debug(" amradioApp._holdStopCallback   : " + params.direction + " " + params.stepCount + " to frequency " + params.frequency);
    if(params && params.direction)
    {
        var stepParams = {};
        if(params.stepCount)
        {
            stepParams = { payload : { "stepCount" : params.stepCount}};
        }
        switch(params.direction)
        {
            case "up":
                framework.sendEventToMmui(this.uiaId, appData.TuneUp, stepParams);
                break;
            case "down":
                framework.sendEventToMmui(this.uiaId, appData.TuneDown, stepParams);
                break;
            default:
                break;
        }
    }
}
/*
 * Callback from Tuner3Ctrl when a HD is playing Tune button is clicked.
 */
amradioApp.prototype._hdSubstationChangeCallback = function(tunerRef, appData, params)
{
    log.debug(" amradioApp._hdSubstationChangeCallback : " + params.direction + " to frequency " + params.frequency + " and substation " + params.substation);
    if(params && params.direction)
    {
        var stepParams = {};
        if(params.substation)
        {
            stepParams = { payload : { "stepCount" : 1}};
        }
        switch(params.direction)
        {
           case "up":
                framework.sendEventToMmui(this.uiaId, appData.TuneUp, stepParams);
                break;
            case "down":
                framework.sendEventToMmui(this.uiaId, appData.TuneDown, stepParams);
                break;
            default:
                break;
        }
    }
}

//Ump control for button select

amradioApp.prototype._umpDefaultSelectCallback = function(ctrlObj, appData, params)
{
    log.debug("amradioApp _umpDefaultSelectCallback called...");
    var buttonConfig = this._buttonConfig[appData].disabled;
    if(this._currentContext && this._currentContext.ctxtId === "NowPlaying" && this._currentContextTemplate)
    {
        if(params && params.state && appData === "SelectScan")
        {
            var currentStateOfScan = params.state;
            var nextStateOfScan = null;
            if(currentStateOfScan === "Unsel")
            {
                nextStateOfScan = "Unsel";
            }
            else
            {
                nextStateOfScan = "Sel";
            }
            //As setButtonState() is taken care by control. No need to call this function from default select callback
            //this._setScanToggleUMPCtrl(this._currentContextTemplate,nextStateOfScan);
        }
    }

    if(!buttonConfig )
    {
        switch(appData)
        {
            case "SelectAutoMemory" :
                framework.sendEventToMmui(this.uiaId, appData);
                break;
            case "SelectFavoritesAudio" :
                framework.sendEventToMmui(this.uiaId, "SelectFavorites");
                break;
            case "SelectScan" :
                framework.sendEventToMmui(this.uiaId, appData);
                break;
            case "SelectTafficalert" :
                if(this._taStatusFlag === true)
                {
                    this._taStatusFlag = false;
                    this._taStatus = "TA_OFF";
                    framework.sendEventToMmui(this.uiaId, "SelectTrafficAlertOff");
                }
                else if (this._taStatusFlag === false)
                {
                    this._taStatusFlag = true;
                    this._taStatus = "TA_ON";
                    framework.sendEventToMmui(this.uiaId, "SelectTrafficAlertOn");
                }
                break;
            case "SelectHD" :
                var state = this._umpButtonConfig["SelectHD"].currentState;
                switch (state)
                {
                    case "Sel" :
                        this._hdStatusFlag = true;
                        this._hdStatus = "HD_ON";
                        break;
                    case "Unsel" :
                        this._hdStatusFlag = false;
                        this._hdStatus = "HD_OFF";
                        this._setiTunesUMPCtrl(this._currentContextTemplate,"Untagged",true);
                        break;
                    default :
                        break;
                }
                framework.sendEventToMmui(this.uiaId, appData);
                this._populateAMNowPlayingCtrl(this._currentContextTemplate);
                break;
            case "SelectiTunesTagging" :
                var tagState = null;
                if(params && params.state)
                {
                    tagState = params.state;
                    switch(tagState)
                    {
                        case "Untagged":
                            this._setiTunesUMPCtrl(this._currentContextTemplate,"Tagged");
                            break;
                        case "Tagged":
                            this._setiTunesUMPCtrl(this._currentContextTemplate,"Untagged");
                            break;
                        default :
                            this._setiTunesUMPCtrl(this._currentContextTemplate,"Tagged");
                            break;
                    }
                    if(this._cachedRegion === "REGION_USA" && tagState === "Tagged")
                    {
                        framework.sendEventToMmui(this.uiaId, appData);
                    }
                }
                break;
            default:
                framework.sendEventToMmui(this.uiaId, appData);
                break;
        }
    }
}

//long press for ump control button
amradioApp.prototype._umpDefaultHoldStartCallback = function(ctrlObj, appData, params)
{
    switch(appData)
    {
        case "SelectSeekNext" :
            framework.sendEventToMmui(this.uiaId, "ForcedSeekNextStart");
            break;
        case "SelectSeekPrevious" :
            framework.sendEventToMmui(this.uiaId, "ForcedSeekPreviousStart");
            break;
        default:
            break;
    }
}

amradioApp.prototype._umpDefaultHoldStopCallback = function(ctrlObj, appData, params)
{
    log.debug("amradioApp _umpDefaultHoldStopCallback called..." );
    switch(appData)
    {
        case "SelectSeekNext" :
            framework.sendEventToMmui(this.uiaId, "ForcedSeekNextStop");
            break;
        case "SelectSeekPrevious" :
            framework.sendEventToMmui(this.uiaId, "ForcedSeekPreviousStop");
            break;
        default:
            break;
    }
}

//LongPress CAllback for Favorites
amradioApp.prototype._umpDefaultLongPressCallback = function(ctrlObj, appData, params)
{
    log.debug("amradioApp _umpDefaultLongPressCallback called...");
    switch(appData)
    {
        case "SelectFavoritesAudio" :
            framework.sendEventToMmui("common", "Global.AddToFavorites");
            break;
        default:
            break;
    }
}

//List Long press callback
amradioApp.prototype._listLongPressCallback = function(listCtrlObj, appData, params)
{
    log.debug('_ListLongPressCallback called...', listCtrlObj, appData, params);
    switch(this._currentContext.ctxtId)
    {
        case "AutoMemory" :
            var piCode = appData.piCode;
            var stationName = appData.stationName;
            var frequency = appData.stations;
            framework.sendEventToMmui(this.uiaId, "SelectFavoritesStation" ,
                {payload:{radioData: { stationType : "AM", frequency : frequency, stationName : stationName, PICode : piCode, HDSPS : "SPS_NONE", satRadioData : null }}});
            break;
        default :
            break;
    }
}
// EOF: UMP Control

//List Item callback
amradioApp.prototype._listItemClickCallback = function(listCtrlObj, appData, params)
{
    var vuiFlag = false;
    if(params && params.fromVui)
    {
        vuiFlag = params.fromVui;
    }
    switch(this._currentContext.ctxtId)
    {
        case "AutoMemory" :
            switch(appData.eventName)
            {
                case "UpdateAutoMemory" :
                    if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "AutoMemory")
                    {
                        this._populateAutoMemUpdatingStationListCtrl();
                    }
                    this._cachedAutoMStatus = "UPDATING";
                    framework.sendEventToMmui(this.uiaId, appData.eventName, vuiFlag);
                    break;
                case "SelectStationFrequency" :
                    var selectedStation = appData.stations;
                    var PiCodeInfo = appData.piCode;
                    var HDSpsNo = "SPS_NONE";
                    framework.sendEventToMmui(this.uiaId, appData.eventName , {payload : { AMStationData : { AMFrequency : selectedStation, AMHDSpsNo : HDSpsNo, AMPicode : PiCodeInfo}}}, vuiFlag);
                    break;
                default:
                    log.debug('No such button handler');
                    break;
            }
            break;
        default :
            log.debug('No such button handler');
            break;
    }
}

//Callback from DialogCtrl when a button is clicked.
amradioApp.prototype._dialogDefaultSelectCallback = function(buttonRef, appData, params)
{
    log.debug("_dialogDefaultSelectCallback  called...", buttonRef, appData, params);
    switch (appData)
    {
        case "Global.GoBack" :
            framework.sendEventToMmui("common", appData);
            break;
        default :
            framework.sendEventToMmui(this.uiaId, appData);
            break;
    }
}


/**************************
 * Helper functions
 **************************/

//Populate Now playing control
amradioApp.prototype._populateAMNowPlayingCtrl = function(tmplt)
{
    var trackTitle = "";
    var artistName = "";
    var albumName = "";
    var stationName = "";
    var frequency = "";
    var albumArtPath = "";
    var controlConfigObj = new Object();
    controlConfigObj.fullConfig = false;
    controlConfigObj.ctrlStyle = "Style2";
    if (this._cachedRadioDetails)
    {
        if ( this._cachedRadioDetails.stationName )
        {
            stationName = this._cachedRadioDetails.stationName;
        }
        if ( this._cachedRadioDetails.freq )
        {
            frequency = this._cachedRadioDetails.freq;
        }
    }
    if ( this._cachedMetadata )
    {
        if( this._cachedMetadata.sisData )
        {
            stationName = this._cachedMetadata.sisData;
        }
        if( this._cachedMetadata.trackTitle )
        {
            trackTitle = this._cachedMetadata.trackTitle;
        }
        if( this._cachedMetadata.albumName )
        {
            albumName = this._cachedMetadata.albumName;
        }
        if( this._cachedMetadata.artistName )
        {
            artistName = this._cachedMetadata.artistName;
        }
    }

    if( this._albumArtPath )
    {
        albumArtPath = this._albumArtPath;
    }

    if ( this._cachedRegion === "REGION_USA" && this._hdStatusFlag === true && this._cachedWeekHDStatus === false)
    {
        controlConfigObj["ctrlTitleObj"]  =
        {
            "ctrlTitleId"    : null,
            "ctrlTitleText"  : frequency + " " + stationName,
        }
        controlConfigObj["audioTitleObj"] =
        {
            "audioTitleId"    : null,
            "audioTitleText"  : trackTitle,
            "audioTitleIcon" : "common/images/icons/IcnListEntNowPlaying_En.png"
        }
        controlConfigObj["detailLine1Obj"] =
        {
            "detailTextId"   : null,
            "detailText"     : artistName,
            "detailIcon"     : "common/images/icons/IcnListContact_Placeholder.png"
        }
        controlConfigObj["detailLine2Obj"] =
        {
            "detailTextId"   : null,
            "detailText"     : albumName,
            "detailIcon"     : "common/images/icons/IcnListCdPlayer_En.png"
        }

        log.info("HD is supported TRUE - yes/ FALSE - No :: "+this._isHDLogoSupport);
        if (this._hdSubstList && this._isHDLogoSupport)
        {
            controlConfigObj["hdConfigObj"] =
            {
                "hdStatus"   : "Locked",
                "hdSubstList"  : this._CountHDSupported
            }
        }
    }

    else if (this._cachedRegion === "REGION_USA" && this._hdStatusFlag === true && this._cachedWeekHDStatus === true)
    {
        controlConfigObj["ctrlTitleObj"] =
        {
            "ctrlTitleId"    : null,
            "ctrlTitleText"  : frequency ,
            "ctrlTitleIcon"  :null,
        }
        if (this._hdSubstList && this._isHDLogoSupport)
        {
            controlConfigObj["hdConfigObj"] =
            {
                "hdStatus"    : "NoLock",
                "hdSubstList"  : this._CountHDSupported
            }
        }
    }

    else
    {
        controlConfigObj["ctrlTitleObj"] =
        {
            "ctrlTitleId"    : null,
            "ctrlTitleText"  : frequency ,
            "ctrlTitleIcon"  :null,
        }
    }
	//Current operation Mode is SEEK or SCAN and dont update the NowPlaying Screen
	if(!(this._currentOperationMode === "SCAN_UP_MODE" || this._currentOperationMode === "SEEK_UP_MODE" || this._currentOperationMode === "SEEK_DOWN_MODE"))
	{
		if(this._currentContext.ctxtId === "NowPlaying")
		{
		if(this._currentOperationMode !== "AUTO_M_MODE")
			{
			tmplt.nowPlaying4Ctrl.setNowPlayingConfig(controlConfigObj);
			}
			tmplt.nowPlaying4Ctrl.setArtworkImagePath(albumArtPath);
		}
	}
	else
	{
		log.info("Current operation mode is seek or scan so blocked freq is "+frequency);
	}
}

//AutoMemory UpdateStationList control
amradioApp.prototype._populateAutoMemUpdateStationListCtrl = function(tmplt)
{
    var stations = null;
    var stationPiCodeInfo = null;
    var listLength = null;
    var listTotalCount = null;
    var autoMemoryCount = null;
    var frequency = null;

    if(this._cachedAutoMemoryList && this._cachedAutoMemoryList.eCode == 0 && this._cachedAutoMemoryList.totalCount > 0
    && this._cachedAutoMemoryList.autoMemoryList)
    {
        listTotalCount = this._cachedAutoMemoryList.totalCount;
        autoMemoryCount = this._cachedAutoMemoryList.autoMemoryList.length;

        var dataList =
            {
                itemCountKnown : true,
                itemCount : autoMemoryCount + 1,
                vuiSupport : true
            };
        var items = new Array();
        this._autoMemoryDataList.items[0].text1Id = "UpdateStationList";
        this._autoMemoryDataList.items[0].image2 = null;
        items = this._autoMemoryDataList.items;

        for(i = 0 ; i < autoMemoryCount ; i++)
        {
            if(this._cachedAutoMemoryList.autoMemoryList[i].frequency)
            {
                frequency = this._cachedAutoMemoryList.autoMemoryList[i].frequency;
            }
            if(this._cachedAutoMemoryList.autoMemoryList[i].piCode)
            {
                stationPiCodeInfo = this._cachedAutoMemoryList.autoMemoryList[i].piCode;
            }
            if(this._cachedAutoMemoryList.autoMemoryList[i].stationName)
            {
                stations = this._cachedAutoMemoryList.autoMemoryList[i].stationName;
            }
            items[i+1] =
            {
                appData : { eventName : 'SelectStationFrequency', piCode : stationPiCodeInfo , stations : frequency , stationName : stations },
                text1 : frequency ,
                itemStyle : "style02",
                hasCaret : false,
                itemBehavior : "shortAndLong"
            };
        }
    }
    //If data is empty or error in fetching data then display "No results found"
    else
    {
        var dataList =
            {
                itemCountKnown : true,
                itemCount : 2,
                vuiSupport : true
            };
        var items = new Array();
        this._autoMemoryDataList.items[0].text1Id = "UpdateStationList";
        this._autoMemoryDataList.items[0].image2 = null;
        items = this._autoMemoryDataList.items;
        items[1] =
            {
                text1Id : "Noresultsfound",
                itemStyle : "style02",
                disabled : true,
                hasCaret : false
            };

    }
    dataList.items = items;
    this._autoMemoryDataList = dataList;
    tmplt.list2Ctrl.setDataList(dataList);
    tmplt.list2Ctrl.updateItems(0, dataList.itemCount - 1);
}

//AutoMemory displays updating List with progress bar
amradioApp.prototype._populateAutoMemUpdatingStationListCtrl = function()
{
    this._resetAutoMemoryDatalist();
    this._updateStationList = true; //set updateStationList to true
    this._autoMemoryDataList.items[0].text1Id = "UpdatingStationList";
    this._autoMemoryDataList.items[0].image2 = 'indeterminate';
    this._autoMemoryDataList.items[0].hasCaret = false;
    this._currentContextTemplate.list2Ctrl.setDataList(this._autoMemoryDataList);
    this._currentContextTemplate.list2Ctrl.focussedItem = 0;
    var length = this._autoMemoryDataList.itemCount;
    this._currentContextTemplate.list2Ctrl.updateItems(0, length - 1);
}

//Helper function for Setting UMPButton Config
amradioApp.prototype._setUmpButtonConfig = function()
{
    this._isEUTAURegion = false;
    this._buttonConfig = null;
    if (this._cachedRegion)
    {
        switch (this._cachedRegion)
        {
            case "REGION_JPN" :
            case "REGION_OTHER" :
                this._buttonConfig = this._umpButtonConfigJpn;
                break;
            case "REGION_EU" :
                this._buttonConfig = this._umpButtonConfigEU;
                this._isEUTAURegion = true;
                break;
            case "REGION_USA" :
                this._buttonConfig = this._umpButtonConfig;
                break;
            case "REGION_CHINATAIWAN" :
                this._buttonConfig = this._umpButtonConfigEU;
                this._isEUTAURegion = true;
                break;
            case "REGION_4A" :
                switch(this._cachedSubRegion)
                {
                    case "REGION_5K" :
                        this._buttonConfig = this._umpButtonConfigJpn;
                        break;
                    case "REGION_9K" :
                        this._buttonConfig = this._umpButtonConfigJpn;
                        break;
                    case "REGION_AUSTRALIA" :
                        this._buttonConfig = this._umpButtonConfigEU;
                        this._isEUTAURegion = true;
                        break;
                    case "REGION_OTHER" :
                        this._buttonConfig = this._umpButtonConfigEU;
                        this._isEUTAURegion = true;
                        break;
                    default :
                        this._buttonConfig = this._umpButtonConfigEU;
                        this._isEUTAURegion = true;
                        break;
                }
                break;
            default :
                this._buttonConfig = this._umpButtonConfig;
                log.debug("loading other UMP for default");
                break;
        }
    }
    if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "NowPlaying")
    {
        this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setUmpConfig(this._buttonConfig);
        this._populateAMNowPlayingCtrl(this._currentContextTemplate);
    }
}

//Resetting Automemory
amradioApp.prototype._resetAutoMemoryDatalist = function()
{
    this._autoMemoryDataList = {
        itemCountKnown : true,
        itemCount : 1,
        vuiSupport : true,
        items: [
            { appData : { eventName : "UpdateAutoMemory" } , text1Id : "UpdateStationList", itemStyle : "style02" , hasCaret : false }
        ]
    };
}

//UMP button State Update
amradioApp.prototype._setUMPButtonState = function(lableName,state)
{
    log.debug("_setUMPButtonState  called...");
    if ( this._currentContextTemplate )
    {
        this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonState(lableName,state);
    }
}

//set Scan UMP Button Light ON/ Light OFF
amradioApp.prototype._setScanToggleUMPCtrl = function(tmplt,state)
{
    if(tmplt && this._currentContext && this._currentContext.ctxtId === "NowPlaying")
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
        tmplt.nowPlaying4Ctrl.umpCtrl.setButtonState("SelectScan",state);
    }
}

//set itunes UMP Button
amradioApp.prototype._setiTunesUMPCtrl = function(tmplt,state,isDisabled)
{
    if(tmplt && this._currentContext && this._currentContext.ctxtId === "NowPlaying" && this._cachedRegion === "REGION_USA")
    {
        tmplt.nowPlaying4Ctrl.umpCtrl.setButtonState("SelectiTunesTagging",state);
        if(isDisabled === undefined)
        {
            isDisabled = false;
        }
        switch(state)
        {
            case "Untagged" :
                tmplt.nowPlaying4Ctrl.umpCtrl.setButtonDisabled("SelectiTunesTagging",isDisabled);
                break;
            case "Tagged" :
                tmplt.nowPlaying4Ctrl.umpCtrl.setButtonDisabled("SelectiTunesTagging",false);
                break;
            default :
                break;
        }
    }
}

//UMP HD button Update
amradioApp.prototype._setUMPButtonHD = function(lableName,state)
{
    log.debug("_setUMPButtonState  called..."+lableName);
    if ( this._currentContextTemplate )
    {
        this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonState(lableName,state);
        this._populateAMNowPlayingCtrl(this._currentContextTemplate);
    }
}
//Helper function for setting frequency in Trafficalert context
amradioApp.prototype._setTrafficalertText = function(tmplt)
{
    tmplt.dialog3Ctrl.setText1(this._harFreq);
}

//Set Tuner Frequency
amradioApp.prototype._setTunerFrequency = function(tmplt)
{
    var frequency = "";
    var hdConfigObj = null;
    if ( this._cachedRadioDetails && this._cachedRadioDetails.freq )
    {
        frequency = this._cachedRadioDetails.freq;
        if(this._hdSubstList && this._isHDLogoSupport)
        {
            if ( this._cachedRegion === "REGION_USA" && this._hdStatusFlag === true && this._cachedWeekHDStatus === false )
            {
                hdConfigObj = {"hdStatus":"Locked","hdSubstList":this._CountHDSupported };
            }
            else if (this._cachedRegion === "REGION_USA" && this._hdStatusFlag === true && this._cachedWeekHDStatus === true)
            {
                hdConfigObj = {"hdStatus":"NoLock","hdSubstList":this._CountHDSupported };
            }
            else
            {
                hdConfigObj = {"hdStatus":"Disabled","hdSubstList":this._CountHDSupported };
            }
            tmplt.tuner4Ctrl.setFrequency(frequency,hdConfigObj);
        }
        else
        {
            hdConfigObj = {"hdStatus":"Disabled","hdSubstList":this._CountHDSupported };
            tmplt.tuner4Ctrl.setFrequency(frequency,hdConfigObj);
        }
    }
}

//Update Album Art image in Nowplaying
amradioApp.prototype._UpdateAlbumArtImage = function(tmplt)
{
    if( this._albumArtPath != null )
    {
        var albumArtPath = this._albumArtPath;
        tmplt.nowPlaying4Ctrl.setArtworkImagePath(albumArtPath);
    }
}

//iTune button state update
amradioApp.prototype._setiTunesButtonState = function(tmplt)
{
    //iTune tagging in Nowplaying context
    if(this._cachedRegion === "REGION_USA")
    {
        //iTT states change
        var isDisabled = true;
        var state = null;
        if(this._cachedTaggingState)
        {
            switch(this._cachedTaggingState)
            {
                case "ENABLE_TAGGING" :
                    state = "Untagged";
                    isDisabled = false;
                    break;
                case "DISABLE_TAGGING" :
                    state = "Untagged";
                    break;
                case "TEMP_DISABLE_TAGGING" :
                    state = "Tagged";
                    isDisabled = false;
                    break;
                default :
                    state = "Untagged";
                    break;
            }
            if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "NowPlaying" && this._hdStatusFlag)
            {
                this._setiTunesUMPCtrl(this._currentContextTemplate,state,isDisabled);
            }
        }
    }
}

//storing HD Channels into in an array
amradioApp.prototype._storeHDStationsList = function()
{
    var availablesChannel = this._cachedHDTunerStatus.available_sps;
    var countSubStations = 0;
    var hdSubstList = new Array();
    var currentSPS = this._cachedCurrentPlayingSPS;
    for (var i = 0; i < availablesChannel.length; i++)
    {
        if (currentSPS === "SPS_NONE")
        {
            currentSPS = "SPS0";
        }
        if (availablesChannel[i])
        {
            countSubStations ++;
            var sps = "SPS"+i;
            if(currentSPS === sps)
            {
                hdSubstList.push("Active");
            }
            else
            {
                hdSubstList.push("Inactive");
            }
        }
        else
        {
            hdSubstList.push("Unavailable");
        }
    }
    this._hdSubstList = hdSubstList;
    this._countSubStations = countSubStations;
}


/*******************************************************************************
 * This function is called by Common whenever a msgType="alert" comes from MMUI *
 * This function should return a properties Object to use for the WinkCtrl *
 *******************************************************************************/

amradioApp.prototype.getWinkProperties = function(alertId, params)
{
    log.debug("common is looking for wink properties:", alertId, params);

    var winkProperties = null;
    var tagsProperties = null;
    var numberOfTagsRemaining = null;
    if ( params && params.payload )
    {
        var tagsProperties = params.payload;
        if ( tagsProperties.tagging_store_status )
        {
            switch ( tagsProperties.tagging_store_status )
            {
                case "TagSaved":
                case "TagSavedtoSystem" :
                case "TagTransferSuccess" :
                    if ( tagsProperties.accessoryFreeSlots )
                    {
                        numberOfTagsRemaining = tagsProperties.accessoryFreeSlots;
                    }
                    winkProperties = {
                        "style": "style01",
                        "text1Id": tagsProperties.tagging_store_status,
                        "text2Id": "Remaining",
                        "text2SubMap": {"numberOfTags": numberOfTagsRemaining}
                    };
                    break;
                case "TagSavedtoIpod" :
                    if ( tagsProperties.accessoryFreeSlots )
                    {
                        numberOfTagsRemaining = tagsProperties.accessoryFreeSlots;
                    }
                    winkProperties = {
                        "style": "style01",
                        "text1Id": "TagSaved",
                        "text2Id": "Remaining",
                        "text2SubMap": {"numberOfTags": numberOfTagsRemaining}
                    };
                    break;
                case "TagDuplicate":
                if ( tagsProperties.accessoryFreeSlots )
                    {
                        numberOfTagsRemaining = tagsProperties.accessoryFreeSlots;
                    }
                    winkProperties = {
                        "style": "style01",
                        "text1Id": "TagDuplicateIpodFull",
                        "text2Id": "Remaining",
                        "text2SubMap": {"numberOfTags": numberOfTagsRemaining}
                    };
                    break;
                case "TagDuplicateIpodFull":
                case "TagTransferNoMemory" :
                    winkProperties = {
                        "style": "style01",
                        "text1Id": "IopdFull",
                        "text2Id": tagsProperties.tagging_store_status
                    };
                    break;
                case "TagSavedIpodFull":
                    if ( tagsProperties.accessoryFreeSlots )
                    {
                        numberOfTagsRemaining = tagsProperties.accessoryFreeSlots;
                    }
                    winkProperties = {
                        "style": "style02",
                        "text1Id": "IopdFull",
                        "text2Id": "TagSavedtoSystem",
                        "text3Id": "Remaining",
                        "text3SubMap": {"numberOfTags": numberOfTagsRemaining}
                    };
                    break;
                case "ErrorNoMemorySystem" :
                    winkProperties = {
                        "style": "style01",
                        "text1Id": "ErrorNoMemorySystem",
                        "text2Id": "ConnectiPod"
                    };
                    break;
                case "ErrorNoMemoryAll" :
                    winkProperties = {
                        "style": "style01",
                        "text1Id": "ErrorNoMemoryAll",
                        "text2Id": "CannotBesaved"
                    };
                    break;
                case "ErrorIpodFail" :
                    winkProperties = {
                        "style": "style01",
                        "text1Id": "ErrorIpodFail",
                        "text2Id": "Reconnect"
                    };
                    break;
                case "TagTransferIpodFull" :
                    winkProperties = {
                        "style": "style01",
                        "text1Id": "PartialTransfer",
                        "text2Id": "IopdFull"
                    };
                    break;
                case "AllTagsTransferredIpodFull" :
                    winkProperties = {
                        "style": "style01",
                        "text1Id": "TagTransferIpodFull",
                        "text2Id": "IopdFull"
                    };
                    break;
                case "TagNotYetProcessed" :
                case "ErrorConnection" :
                    winkProperties = {
                        "style": "style03",
                        "text1Id": tagsProperties.tagging_store_status
                    };
                    break;
                default:
                    // if alertId cannot be found, winkProperties will return null and Common will display default Wink
                    log.warn("Cannot provide properties for unrecognized alertId: " + alertId);
                    break;
            }
        }
    }

    else
    {
        log.warn("MMUI did not send payload with alert message: " + alertId + ". Payload was expected.");
        return;
    }

    // return the properties to Common
    return winkProperties;
}

/**************************
 * DBAPI METHOD RESPONSE HANDLERS *
 **************************/

//AutoMemory DBAPI callback
amradioApp.prototype._getAutoMemoryCallbackFn = function(msg)
{
    if ( msg && msg.msgContent.params )
    {
        this._cachedAutoMemoryList = msg.msgContent.params;
        if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "AutoMemory")
        {
            this._populateAutoMemUpdateStationListCtrl(this._currentContextTemplate);
        }
    }
}

//DBAPI metadata callback
amradioApp.prototype._getMetaDataUpdateCallbackFn = function(msg)
{
    if ( msg && msg.msgContent.params && msg.msgContent.params.eCode === 0)
    {
        switch ( this._metaDataSts )
        {
            case "NONE" :
                break;
            case "SIS_UPDATED" :
                if(msg.msgContent.params.sisData)
                {
                    this._cachedMetadata.sisData = msg.msgContent.params.sisData;
                }
                break;
            case "PSD_TRACK_UPDATED" :
                if(msg.msgContent.params.trackTitle)
                {
                    this._cachedMetadata.trackTitle = msg.msgContent.params.trackTitle;
                }
                break;
            case "PSD_ARTIST_UPDATED" :
                if(msg.msgContent.params.artistName)
                {
                    this._cachedMetadata.artistName = msg.msgContent.params.artistName;
                }
                break;
            case "PSD_ALBUM_UPDATED" :
                if(msg.msgContent.params.albumName)
                {
                    this._cachedMetadata.albumName = msg.msgContent.params.albumName;
                }
                break;
            default :
                break;
        }
        if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "NowPlaying")
        {
            this._populateAMNowPlayingCtrl(this._currentContextTemplate);
        }
    }
}

//DBAPI metadata callback for Album Art
amradioApp.prototype._getMetaDataArtisticInfoCallbackFn = function(msg)
{
    if ( msg && msg.msgContent.params && msg.msgContent.params.eCode === 0 && msg.msgContent.params.albumArtPath )
    {
        this._albumArtPath = msg.msgContent.params.albumArtPath;
        if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "NowPlaying")
        {
            this._UpdateAlbumArtImage(this._currentContextTemplate);
        }
    }
}


amradioApp.prototype._populateFreqNowPlayingCtrl = function (tmplt)
{
    log.info("inside _populateFreqNowPlayingCtrl for seek and scan mode");
    var  stationName = "";
    var frequency = "";
    var ctrlTitleItem = null;

    //shows the metadata information along with the title
    if (this._cachedRadioDetails)
    {
        if (this._cachedRadioDetails.stationName)
        {
            stationName = this._cachedRadioDetails.stationName;
        }

        if (this._cachedRadioDetails.freq)
        {
            frequency = this._cachedRadioDetails.freq;
            //frequency = this._frequencyFormatting(frequency);
        }
    }

    if(this._currentContext && this._currentContext.ctxtId === "NowPlaying")
    {
        if(this._cachedRegion === "REGION_USA")
        {
            ctrlTitleItem = frequency + " " + stationName;
        }
        else
        {
            ctrlTitleItem = frequency;

        }
		log.info("Frequency going to display :: "+ctrlTitleItem);	
		if(this._currentOperationMode !== "AUTO_M_MODE")
		{
        tmplt.nowPlaying4Ctrl.setCtrlTitle({ctrlTitleText : ctrlTitleItem});
		}
    }
}

amradioApp.prototype._populateScanFreq = function (tmplt)
{
	var disPlayedFreq = this._displayedFreq;
	var freqToDisplay = 0;
	switch(this._currentOperationMode)
	{
		case "SCAN_UP_MODE":
		case "SEEK_UP_MODE":
			if(this._cachedRegion == "REGION_4A")
			{

				if(this._cachedSubRegion == "REGION_OTHER")
				{
					if(disPlayedFreq ==  this._amRadiostepCountData[this._cachedRegion][this._cachedSubRegion].high)
					{
						freqToDisplay = this._amRadiostepCountData[this._cachedRegion][this._cachedSubRegion].low2;
					}
					else if (disPlayedFreq ==  this._amRadiostepCountData[this._cachedRegion][this._cachedSubRegion].high2)
					{
						freqToDisplay = this._amRadiostepCountData[this._cachedRegion][this._cachedSubRegion].low;
					}
					else
					{
						freqToDisplay = this._displayedFreq + this._stepCount;
					}
				}
				else
				{
					if(disPlayedFreq ==  this._amRadiostepCountData[this._cachedRegion][this._cachedSubRegion].high)
					{
						freqToDisplay = this._amRadiostepCountData[this._cachedRegion][this._cachedSubRegion].low;
					}
					else
					{
						freqToDisplay = this._displayedFreq + this._stepCount;
					}
				}
			}
			else
			{
				
				if(this._cachedRegion == "REGION_EU" || this._cachedRegion == "REGION_CHINATAIWAN")
				{
					if(disPlayedFreq ==  this._amRadiostepCountData[this._cachedRegion].high)
					{
						freqToDisplay = this._amRadiostepCountData[this._cachedRegion].low2;
					}
					else if (disPlayedFreq ==  this._amRadiostepCountData[this._cachedRegion].high2)
					{
						freqToDisplay = this._amRadiostepCountData[this._cachedRegion].low;
					}
					else
					{
						freqToDisplay = this._displayedFreq + this._stepCount;
					}
				}
				else
				{
					if(disPlayedFreq ==  this._amRadiostepCountData[this._cachedRegion].high)
					{
						freqToDisplay = this._amRadiostepCountData[this._cachedRegion].low;
					}
					else
					{
						freqToDisplay = this._displayedFreq + this._stepCount;
					}
				}
			}
			break;
		case "SEEK_DOWN_MODE":
			if(this._cachedRegion == "REGION_4A")
			{
				if(this._cachedSubRegion == "REGION_OTHER")
				{
					if(disPlayedFreq ==  this._amRadiostepCountData[this._cachedRegion][this._cachedSubRegion].low)
					{
						freqToDisplay = this._amRadiostepCountData[this._cachedRegion][this._cachedSubRegion].high2;
					}
					else if (disPlayedFreq ==  this._amRadiostepCountData[this._cachedRegion][this._cachedSubRegion].low2)
					{
						freqToDisplay = this._amRadiostepCountData[this._cachedRegion][this._cachedSubRegion].high;
					}
					else
					{
						freqToDisplay = this._displayedFreq - this._stepCount;
					}
				}
				else
				{
					if(disPlayedFreq ==  this._amRadiostepCountData[this._cachedRegion][this._cachedSubRegion].low)
					{
						freqToDisplay = this._amRadiostepCountData[this._cachedRegion][this._cachedSubRegion].high;
					}
					else
					{
						freqToDisplay = this._displayedFreq - this._stepCount;
					}
				}
			}
			else
			{
				if(this._cachedRegion == "REGION_EU" || this._cachedRegion == "REGION_CHINATAIWAN")
				{
					
					if(disPlayedFreq ==  this._amRadiostepCountData[this._cachedRegion].low)
					{
						freqToDisplay = this._amRadiostepCountData[this._cachedRegion].high2;
					}
					else if (disPlayedFreq ==  this._amRadiostepCountData[this._cachedRegion].low2)
					{
						freqToDisplay = this._amRadiostepCountData[this._cachedRegion].high;
					}
					else
					{
						freqToDisplay = this._displayedFreq - this._stepCount;
					}
				}
				else
				{
					if(disPlayedFreq ==  this._amRadiostepCountData[this._cachedRegion].low)
					{
						freqToDisplay = this._amRadiostepCountData[this._cachedRegion].high;
					}
					else
					{
						freqToDisplay = this._displayedFreq - this._stepCount;
					}
				}
			}
			break;
		default:
		break;
	}
	this._freqToDisplay = freqToDisplay;
	return freqToDisplay;
}
/**************************
 * Framework register
 **************************/
framework.registerAppLoaded("amradio",null,true);
