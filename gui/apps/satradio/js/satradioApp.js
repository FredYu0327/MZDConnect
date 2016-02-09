/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: satradioApp.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: TCS
 Date: 30-August-2012
 __________________________________________________________________________

 Description: IHU GUI Sat Radio App
 Revisions:
 v0.1 (30-August-2012 )   Sat Radio App created with Nowplaying and Loading
 v0.2 (12-September-2012) Merged to match the SCR framework related changes
                          Updated to use new UMP updates
 v0.3 (22-October-2012)   ChannelList implemented
 V0.4 (20-November-2012)  Changes made for event cancel.
 V0.5 (31-December-2012)  NowPlaying2tmpt changed to NowPlaying3tmpt
 V0.6 (09-January-2013)   Channel Zero Implementation.
 V0.7 (12-January-2013)   fix for Radio ID display
 V0.8 (14-January-2013)   Metadata read from dbapi Implementation.
 v0.9 (20-Feb-2013)       Changes made as per new spec 3.55 .
 v1.0 (01-March-2013)     Changegenre context added as per 3.55 .
 v1.1 (05-March-2013)     DBAPI implementation added for Categorylist.
 v1.2 (07-March-2013)     New events for digit entering in Dialpad is added.
 v1.3 (07-March-2013)     Parental lock subscreens added .
 v1.4 (08-March-2013)     Alert implementation added.
 v1.5 (19-April-2013)     Tooltips implementation.
 v1.6 (23-April-2013)     Duplicate channels issue fixed.
 v1.7 (07-May-2013)       Shifting to NowPlaying4 from NowPlaying3a.
 v1.8 (31-May-2013)       Error0 subscreen added.
 v1.9 (13-june-2013)      Tooltip added for Lock button.
 v2.0 (17-june-2013)      Quick scroll thruogh touch is fixed for ChannelList.
 v2.1 (25-July-2013)      Added contextdata for VUINewpin in contextdisplay.
 V2.2 (29-Aug-2013)       Category : All Channels in ChannelList is localized .
 V2.3 (23-Jul-2014)       MY15 Mazda CMU[PIT]:   [XM GUI ]  XM SCAN tooltip flickering
 V2.4 (24-Jul-2014)       Mazda Vehicle Test - XM Radio - Selecting Parental Lock causes the tooltip to flicker briefly.
 _________________________________________________________________________

 */

log.addSrcFile("satradioApp.js", "satradio");

function satradioApp(uiaId)
{
    log.debug("satradio App constructor called...");
    baseApp.init(this, uiaId);
}

/**************************
 * Standard App Functions *
 **************************/

/*
 * Called just after the app is instantiated by framework.
 */

satradioApp.prototype.appInit = function()
{

    log.debug(" satradioApp appInit  called...");
    if (framework.debugMode)
    {
        utility.loadScript("apps/satradio/test/satradioAppTest.js");
    }

    this._umpButtonConfig = new Object();
    this._cachedChannelsDetails = null;
    this._cachedMetaImagePath = null;
    this._categoryNumber = 255;
    this._cachedSelectedGenre= "All Channels";
    this._cachedmetaDatainformation = new Object();
    this._listNeedDataOffsetIndex = 0; // Value from list need data Callback
    this._listActualDataCount = 0; // No of items that are actually fetched and populated in the list
    this._pinCodeStatus = "PIN_NOT_SET"; //Parental lock PIN status
    this._requestsent = false; //For channellist DBAPI
    this._lockButtonStatus = null;
    this._cachedScanState = false;
    this._audioTitleIcon = null;
    this._detailIcon = null;
    this._indexOfCurrentPlayingChannel = 0;  //Default value of Index of Current Playing Channel is set to Zero
    this._cachedIndexOfCurrentPlayingChannel = this._indexOfCurrentPlayingChannel ; //Caching the IndexOfCurrentPlayingChannel before initialising it to Zero.
	this._prevErrorCondition = "NONE";
	this._sbnChnnelNumber = 0;
    //@formatter:off

    //source
    this._umpButtonConfig["SelectSource"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpEntMenu",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectSource"
    };

    //Channel List
    this._umpButtonConfig["SelectStationList"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpCurrentList",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectStationList",
        labelId : "ChannelList"
    };

    //Favourites
    this._umpButtonConfig["SelectFavorites"] =
    {
        buttonBehavior : "shortAndLong",
        imageBase : "IcnUmpFavorite",
        currentState:"Unfavorite",
        stateArray: [
            {
                state:"Unfavorite", labelId:"common.TooltipFavorites"
            }
        ],
        buttonClass : "normal",
		disabled : false,
        appData : "SelectFavorites"
    };

    //Parental Lock
    this._umpButtonConfig["SelectParentalLock"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpLock",
        currentState:"Unlocked",
        stateArray: [
            {
                state:"Unlocked"
            },
            {
                state:"Locked"
            }
        ],
        disabled : false,

        buttonClass : "normal",
        appData : "SelectParentalLock",
		autoStateChange	:	false
    };

    //Scan
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

    //Previous channel
    this._umpButtonConfig["SeekPrevious"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpPreviousAudio",
        disabled : false,
        buttonClass : "normal",
        appData : "SeekPrevious"
    };

    //Next channel
    this._umpButtonConfig["SeekNext"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpNextAudio",
        disabled : false,
        buttonClass : "normal",
        appData : "SeekNext"
    };

    //Setting Equalizer
    this._umpButtonConfig["SelectSettings"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpEqualizer",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectSettings"
    };

    //Settings parentalLock Datalist
    this._parentalLockDataList = {
        itemCountKnown : true,
        itemCount : 4,
        vuiSupport : true,
        items: [
            { appData : "SetChannelLock", text1Id : "LockCurrentChannel", itemStyle : "styleOnOff", value : 2 , hasCaret:false , disabled:true },
            { appData : "SetParentalLock", text1Id : "SessionLock", itemStyle : "styleOnOff", value : 2 , hasCaret:false , disabled:true },
            { appData : "InitializeLockCode", text1Id : "InitializePINCode", itemStyle : "style01" , hasCaret:true },
            { appData : "ResetLockCode", text1Id : "ResetPINCode", itemStyle : "style01" , hasCaret:true , disabled:true }
        ]
    };

    //Channel Datalist
    this._stationListCtxtDataList = {
        itemCountKnown : true,
        itemCount : 1,
        vuiSupport : true,
        items: [
            { appData : { eventName : 'SelectChangeCategory' }, text1Id : "CategoryAllChannels", itemStyle : "style01" },
        ]
    };

    //generelist
    this._categoryListCtxtDataList = {
        itemCountKnown : true,
        itemCount : 1,
        vuiSupport : true,
        items: [
            { appData : { eventName : 'SelectStationAll' , categoryID : 255 }, text1Id : "AllChannels", itemStyle : "style01" , hasCaret : false }
        ]
    };

    //@formatter:off
    this._contextTable = {
        "NowPlaying" : {
            "template" : "NowPlaying4Tmplt",
            "sbNameId" : "XM",
            "controlProperties": {
                "NowPlayingCtrl" : {
                    "ctrlStyle" : "Style2",
                    "umpConfig" : {
                        "buttonConfig" : this._umpButtonConfig,
                        "fullConfig"    : true,
                        "defaultSelectCallback" : this._umpDefaultSelectCallback.bind(this),
                        "defaultLongPressCallback" : this._umpDefaultLongPressCallback.bind(this),
                        "umpStyle" : "fullWidth",
                        "hasScrubber" : false,
                    }
                } // end of properties for "NowPlayingCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._NowPlayingCtxtTmpltReadyToDisplay.bind(this),
            "contextInFunction" : null,//this._NowPlayingCtxtIn.bind(this),
            "displayedFunction": null
        },//end of NowPlaying

        "ChannelList" : {
            "template" : "List2Tmplt",
            "sbNameId" : "XM",
            "leftBtnStyle": "goBack",
            "controlProperties" : {
                "List2Ctrl" : {
                    scrollTo : 0,
                    focussedItem : 0,
                    numberedList : true,
                    thickItems : true,
                    //dataList : this._stationListCtxtDataList,
                    titleConfiguration : 'listTitle',
                    title : {
                        text1Id : "ChannelList",
                        titleStyle : "style02"
                    },
                    selectCallback : this._listItemClickCallback.bind(this),
                    longPressCallback : this._ListLongPressCallback.bind(this),
                    needDataCallback : this._XmChannelNeedDataCallback.bind(this)
                } // end of properties for "ListCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._ChannelListCtxtTmpltReadyToDisplay.bind(this),
            "contextInFunction" : this._ChannelListCtxtIn.bind(this),
            "displayedFunction" : null
        }, // end of "ChannelList"

        //As per the New Spec 3.55
        "CategoryList" : {
            "template" : "List2Tmplt",
            "sbNameId" : "XM",
            "leftBtnStyle": "goBack",
            "controlProperties" : {
                "List2Ctrl" : {
                    dataList : this._categoryListCtxtDataList,
                    titleConfiguration : 'listTitle',
                    title : {
                        text1Id : "CategoryList",
                        titleStyle : "style02"
                    },
                    selectCallback : this._listItemClickCallback.bind(this)
                } // end of properties for "ListCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._CategoryListCtxtTmpltReadyToDisplay.bind(this)
        },// end of "GenreList"

        "ParentalLock" : {
            "template" : "List2Tmplt",
            "sbNameId" : "XM",
            "leftBtnStyle": "goBack",
            "controlProperties" : {
                "List2Ctrl" : {
                    dataList : this._parentalLockDataList,
                    titleConfiguration : 'listTitle',
                    title : {
                        text1Id : "ParentalLock",
                        titleStyle : "style02"
                    },
                    selectCallback : this._listItemClickCallback.bind(this)
                } // end of properties for "ListCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._ParentalLockCtxtTmpltReadyToDisplay.bind(this)
        },// end of "ParentalLock"

        "PinEntryUnlock" : {
            "template" : "DialPad2Tmplt",
            "properties": {
                leftButtonVisible: false,
            },
            "sbNameId" : "EnterPIN",
            "leftBtnStyle": "goBack",
            "controlProperties": {
                "DialPad2Ctrl" : {
                    defaultSelectCallback : this._dialpadSelectCallback.bind(this),
                    value : "",
                    ctrlStyle : "DialpadStyle03",
                    isPassword: true,
                } // end of properties for "DialPad2Ctrl"
            }, // end of list of controlProperties
            "readyFunction" : null,
            "contextInFunction" : null,
            "displayedFunction": null
        }, // end of "PinEntryUnlock"

        "PinEntryReset" : {
            "template" : "DialPad2Tmplt",
            "properties": {
                leftButtonVisible: false,
            },
            "sbNameId" : "EnterFactoryPINToReset",
            "leftBtnStyle": "goBack",
            "controlProperties": {
                "DialPad2Ctrl" : {
                    defaultSelectCallback : this._dialpadSelectCallback.bind(this),
                    ctrlStyle : "DialpadStyle03",
                    isPassword: true,
                    value : "",
                } // end of properties for "DialPad2Ctrl"
            }, // end of list of controlProperties
            "readyFunction" : null,
            "contextInFunction" : null,
            "displayedFunction": null
        }, // end of "PinEntryReset"

        "PinEntryNew" : {
            "template" : "DialPad2Tmplt",
            "properties": {
                leftButtonVisible: false,
            },
            "sbNameId" : "EnterNewPIN",
            "leftBtnStyle": "goBack",
            "controlProperties": {
                "DialPad2Ctrl" : {
                    defaultSelectCallback : this._dialpadSelectCallback.bind(this),
                    ctrlStyle : "DialpadStyle03",
                    isPassword: true,
                    value : "",
                } // end of properties for "DialPad2Ctrl"
            }, // end of list of controlProperties
            "readyFunction" : null,
            "contextInFunction" : null,
            "displayedFunction": null
        }, // end of "PinEntryNew"

        "VuiConfirmNewPIN" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "XM",
            "leftBtnStyle": "goBack",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    contentStyle : "style16",
                    fullScreen : false,
                    text1Id : "IsThisCorrect",
                    text2 : "",
                    defaultSelectCallback : this._dialogCtrlClickCallback.bind(this),
                    "buttonCount" : 2,
                    "buttonConfig" : {
                        "button1" : {
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            labelId : "common.No",
                            appData : "Global.No"
                        },
                        "button2" : {
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            labelId : "common.Yes",
                            appData : "Global.Yes"
                        }
                    }, // end of buttonConfig
                } // end of properties for "Dialog3Ctrl"
            }, // end of list of controlProperties
            "readyFunction" : this._VUIConfirmNewPinCtxtTmpltReadyToDisplay.bind(this),
            "contextInFunction" : null,
            "displayedFunction": null
        } // end of "VuiConfirmNewPIN"
    };

    //@formatter:on

    //@formatter:off
    this._messageTable = {
        "XMTunerStatus" : this._XMTunerStatusMsgHandler.bind(this),
        "ErrorNotification" : this._ErrorNotificationMsgHandler.bind(this),
        "CategorySelected" : this._CategorySelectedMsgHandler.bind(this),
        "MetaDataAvailable" : this._MetaDataAvailableInfoMsgHandler.bind(this),
        "MetaDataChange" : this._MetaDataChangeInfoMsgHandler.bind(this),
        "StatusBarNotification" : this._StatusBarNotificationMsgHandler.bind(this),
        "SessionLockStatus" : this._SessionLockStatusMsgHandler.bind(this),
        "ParentalPinStatus" : this._ParentalPinStatusMsgHandler.bind(this),
        "ChannelLockStatus" : this._ChannelLockStatusMsgHandler.bind(this),
        "SelectFocusedStationAsFavorite" : this._SelectFocusedStationAsFavoriteMsgHandler.bind(this),
        "PinClearedStatus" : this._PinClearedStatusMsgHandler.bind(this),
        "ScanStatus" : this._ScanStatusMsgHandler.bind(this),
		"ChannelInfoSBN" : this._ChannelInfoSBNMsgHandler.bind(this)
    }; // end of this._messageTable
    //@formatter:on
}

/**************************
 * General App Functions
 **************************/

// Send TimeOut event
satradioApp.prototype._sendTimeoutEvent = function()
{
    framework.sendEventToMmui(this.uiaId, "TimeOut");
}

/**************************
 * Context handlers
 **************************/
 //NowPlaying
 /*
 //Now Playing ContextIn
 satradioApp.prototype._NowPlayingCtxtIn = function()
 {
	log.info("satradioApp _NowPlayingCtxtIn called...");
	if (this._cachedChannelsDetails && this._cachedChannelsDetails.ch_lock_sts === 0 &&
		this._cachedError.errorCondition !=="CHANNEL_LOCKED" && this._prevErrorCondition === "CHANNEL_LOCKED")
	{
		this._lockButtonStatus = "Unlocked"; // Set lock ump button
		this._setUMPLockButtonState("SelectParentalLock", this._lockButtonStatus);
		log.info("_NowPlayingCtxtIn LockCurrentState Unlocked ");
	}
	if (this._cachedChannelsDetails && this._cachedChannelsDetails.ch_lock_sts === 1 &&
            this._cachedError.errorCondition ==="CHANNEL_LOCKED")
	{
		this._lockButtonStatus = "Locked"; // Set lock ump button
		this._setUMPLockButtonState("SelectParentalLock", this._lockButtonStatus);
		log.info("_NowPlayingCtxtIn LockCurrentState Locked ");
	}
	
 }*/

satradioApp.prototype._NowPlayingCtxtTmpltReadyToDisplay = function(contextObj)
{
    log.debug("satradioApp _NowPlayingCtxtTmpltReadyToDisplay called...");
    if(this._currentContextTemplate)
    {
        this._setScanToggleUMPCtrl(this._currentContextTemplate,"Unsel");
        if (this._lockButtonStatus)
        {
            //Set Lock button State
            this._setUMPLockButtonState("SelectParentalLock", this._lockButtonStatus);
        }
        var params = {};
        framework.sendRequestToDbapi(this.uiaId, this._getMetadataCallbackFn.bind(this), "radio", "XmNowPlayingMetadata", params);
        //Send request to DBAPI for Categorylist
        this._resetCategoryList();
        var params = {};
        framework.sendRequestToDbapi(this.uiaId, this._getXmCategoryListCallbackFn.bind(this), "radio", "XmCategoryList", params);
    }
}

//Channel List ContextIn
satradioApp.prototype._ChannelListCtxtIn = function()
{
    if (this._cachedSelectedGenre !== "All Channels")
    {
        this._contextTable.ChannelList.controlProperties.List2Ctrl.thickItems = false;
        this._cachedIndexOfCurrentPlayingChannel = this._indexOfCurrentPlayingChannel ; //Caching the IndexOfCurrentPlayingChannel before initialising it to Zero.
        this._indexOfCurrentPlayingChannel = 0;
    }
    else
    {
        this._contextTable.ChannelList.controlProperties.List2Ctrl.thickItems = true;
    }
    log.info("If any category selected then index will always as 0 other wise , Index of current Playing Channel is "+this._indexOfCurrentPlayingChannel);
    this._contextTable["ChannelList"]["controlProperties"]["List2Ctrl"]["scrollTo"] = this._indexOfCurrentPlayingChannel;
    this._contextTable["ChannelList"]["controlProperties"]["List2Ctrl"]["focussedItem"] = this._indexOfCurrentPlayingChannel;
}

//Channel List Context
satradioApp.prototype._ChannelListCtxtTmpltReadyToDisplay = function(params)
{
    log.debug("satradioApp _ChannelListCtxtTmpltReadyToDisplay called...");
    if(params && params.templateContextCapture && params.templateContextCapture.controlData && params.templateContextCapture.controlData.focussedItem !== null)
    {
        //Back is pressed , If Genre is selected as "All Channels" then focus should be moved to the 
        //current playing channel (Not to the previous focussed item)
        if (this._cachedSelectedGenre === "All Channels")
        {
            params.templateContextCapture.controlData.focussedItem = this._indexOfCurrentPlayingChannel;
        }
        this._populateCachedChannelList();
    }
    else if (this._requestsent === false)
    {
        var offset = Math.max(this._contextTable['ChannelList']['controlProperties']['List2Ctrl']['scrollTo'] - 10, 0);
        this._listNeedDataOffsetIndex = offset;
        //Get stations from DBAPI
        var params = {"filterByCategory" : this._categoryNumber, index : offset , limit : 20};
        framework.sendRequestToDbapi(this.uiaId, this._addItemsToList.bind(this), "radio", "XmChannelList", params);
        this._requestsent = true;
    }
}

//Category List context
satradioApp.prototype._CategoryListCtxtTmpltReadyToDisplay = function()
{
    log.debug("satradioApp _CategoryListCtxtTmpltReadyToDisplay called...");
    this._resetCategoryList();
    var params = {};
    framework.sendRequestToDbapi(this.uiaId, this._getXmCategoryListCallbackFn.bind(this), "radio", "XmCategoryList", params);
}

//Parental Lock context
satradioApp.prototype._ParentalLockCtxtTmpltReadyToDisplay = function()
{
    log.debug("satradioApp _ParentalLockCtxtTmpltReadyToDisplay called...");

    if (this._pinCodeStatus !== "PIN_NOT_SET" && this._currentContextTemplate)
    {
         if(this._channelLockStatus)
        {
            this._setChannelLockStatus(this._currentContextTemplate);
        }
        this._populateParentalLocklListControl(this._currentContextTemplate);
    }
}

//VUI Confirm NewPin Ctxt
satradioApp.prototype._VUIConfirmNewPinCtxtTmpltReadyToDisplay = function()
{
    log.debug("satradioApp _VUIConfirmNewPinCtxtTmpltReadyToDisplay called...");
    if(this._currentContext && this._currentContext.params && this._currentContext.params.payload
    && this._currentContext.params.payload.fourDigitPIN)
    {
        var pin = this._currentContext.params.payload.fourDigitPIN;
        this._currentContextTemplate.dialog3Ctrl.setText2(pin);
    }
}

/**************************
 * Message handlers
 **************************/

satradioApp.prototype._MetaDataChangeInfoMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.metaDataChangeStatus)
    {
        this._changedMetaData = msg.params.payload.metaDataChangeStatus;
        if(this._changedMetaData.channel_name)
        {
            this._cachedChannelName = "";
        }
        if(this._changedMetaData.category_name)
        {
            this._cachedMetadataCategory = "";
        }
        if(this._changedMetaData.song_name)
        {
            this._cachedTrackTitle = "";
        }
        if(this._changedMetaData.artist_name)
        {
            this._cachedArtistName = "";
        }
        if(this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying")
        {
            this._populateSATNowPlayingCtrl(this._currentContextTemplate);
        }
    }
}

//Get the radio station info from MMUI and cached the status.
satradioApp.prototype._MetaDataAvailableInfoMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.metaDataType )
    {
        //Get Metadata from DBAPI
        var params = {};
        framework.sendRequestToDbapi(this.uiaId, this._getMetadataCallbackFn.bind(this), "radio", "XmNowPlayingMetadata", params);
    }
}


// Tuner status handler
satradioApp.prototype._XMTunerStatusMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload)
    {
        this._cachedChannelsDetails = msg.params.payload;
        if ( this._cachedChannelsDetails.ch_lock_sts != null )
        {
            var status = this._cachedChannelsDetails.ch_lock_sts;
            switch ( status )
            {
                case 0 :
                    this._lockButtonStatus = "Unlocked"; // Set unlock ump button
                    break;
                case 1 :
                    this._lockButtonStatus = "Locked"; // Set lock ump button
                    break;
                default :
                    break;
            }
            if (this._lockButtonStatus)
            {
                //Set Lock ump button state
                this._setUMPLockButtonState("SelectParentalLock", this._lockButtonStatus);
            }
        }

        if (this._cachedChannelsDetails.ch === 0)
        {
            var params = {};
            framework.sendRequestToDbapi(this.uiaId, this._getMetadataCallbackFn.bind(this), "radio", "XmNowPlayingMetadata", params);
        }
        
        if ( this._cachedChannelsDetails.ChannelIndex != null )
        {
            this._indexOfCurrentPlayingChannel = this._cachedChannelsDetails.ChannelIndex;
        }
        
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying")
        {
            this._populateSATNowPlayingCtrl(this._currentContextTemplate);
        }
    }
}

// GenreSelected Msg handler
satradioApp.prototype._CategorySelectedMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.categoryID !==null)
    {
        this._categoryNumber = msg.params.payload.categoryID;
        var categoryList = null;
        if (this._categoryNumber === 255)
        {
            this._cachedSelectedGenre = "All Channels";
        }
        else
        {
            if (this._xmCategoryList && this._xmCategoryList.categoryList)
            {
                categoryList = this._xmCategoryList.categoryList;
                var index = utility.getArrayItemByPropertyValue(categoryList , "categoryNumber" , this._categoryNumber)
                if ( index )
                {
                    this._cachedSelectedGenre = categoryList[index.index].categoryName;
                }
            }
        }
    }
}

// Error Notification handler
satradioApp.prototype._ErrorNotificationMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload)
    {
		if(!this._cachedError)
		{
			this._prevErrorCondition = "NONE";
		}
		else
		{
			this._prevErrorCondition = this._cachedError.errorCondition;
		}
        this._cachedError = msg.params.payload;
        // Update control if context is bound to a template
        if (this._currentContext && this._currentContextTemplate &&
        this._currentContext.ctxtId === "NowPlaying")
        {
            this._populateSATNowPlayingCtrl(this._currentContextTemplate);
        }
    }
}

// Error Notification handler
satradioApp.prototype._StatusBarNotificationMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload)
    {
		if(!this._cachedError)
		{
			this._prevErrorCondition = "NONE";
		}
		else
		{
			this._prevErrorCondition = this._cachedError.errorCondition;
		}
        this._cachedError = msg.params.payload;
        this._populateStatusBarCtrl(this._currentContextTemplate);
    }
}

//Parental lock context message handler for session
satradioApp.prototype._SessionLockStatusMsgHandler = function(msg)
{
    log.debug("SessionLockStatusMsgHandler called");
    if( msg && msg.params && msg.params.payload.status )
    {
        var status = msg.params.payload.status;
        switch ( status )
        {
            case "LOCK_ON" :
                this._parentalLockDataList.items[0].disabled = true;
                this._parentalLockDataList.items[1].value = 1;
                this._parentalLockDataList.items[2].disabled = true;
                break;
            case "LOCK_OFF" :
                this._parentalLockDataList.items[0].disabled = false;
                this._parentalLockDataList.items[1].value = 2;
                this._parentalLockDataList.items[2].disabled = false;
                break;
            default :
                break;
        }

        if (this._currentContext && this._currentContextTemplate &&
        this._currentContext.ctxtId === "ParentalLock" && this._pinCodeStatus !=="PIN_NOT_SET")
        {
            this._populateParentalLocklListControl(this._currentContextTemplate);
        }
    }
}

satradioApp.prototype._ChannelLockStatusMsgHandler = function(msg)
{
    if( msg && msg.params && msg.params.payload.status )
    {
        this._channelLockStatus = msg.params.payload.status;
        if (this._currentContext && this._currentContextTemplate)
        {
            switch(this._currentContext.ctxtId)
            {
                case "ParentalLock" :
                    this._setChannelLockStatus(this._currentContextTemplate);
                    this._populateParentalLocklListControl(this._currentContextTemplate);
                    break;
                case "NowPlaying" :
                    this._populateSATNowPlayingCtrl(this._currentContextTemplate);
                    break;
            }
        }
    }
}

satradioApp.prototype._ParentalPinStatusMsgHandler = function(msg)
{
    if( msg && msg.params && msg.params.payload.status )
    {
        this._pinCodeStatus = msg.params.payload.status;
        var sessionLockstatus = this._parentalLockDataList.items[1].value;
        if (this._pinCodeStatus === "PIN_SET")
        {
            this._parentalLockDataList.items[2].text1Id = "EditPINCode";
            this._parentalLockDataList.items[2].appData = "ChangeLockCode";
            if (sessionLockstatus === 1)
            {
                this._parentalLockDataList.items[0].disabled = true;
                this._parentalLockDataList.items[2].disabled = true;
            }
            else if (sessionLockstatus === 2)
            {
                this._parentalLockDataList.items[0].disabled = false;
                this._parentalLockDataList.items[2].disabled = false;
            }
            this._parentalLockDataList.items[1].disabled = false;
            this._parentalLockDataList.items[3].disabled = false;
        }
        else if (this._pinCodeStatus === "PIN_NOT_SET")
        {
            this._parentalLockDataList.items[2].text1Id = "InitializePINCode";
            this._parentalLockDataList.items[2].appData = "InitializeLockCode";
            this._parentalLockDataList.items[0].disabled = true;
            this._parentalLockDataList.items[1].disabled = true;
            this._parentalLockDataList.items[3].disabled = true;
            this._parentalLockDataList.items[2].disabled = false;
        }

        if (this._currentContext && this._currentContextTemplate &&
        this._currentContext.ctxtId === "ParentalLock")
        {
            this._populateParentalLocklListControl(this._currentContextTemplate);
        }
    }
}

satradioApp.prototype._SelectFocusedStationAsFavoriteMsgHandler = function(msg)
{
    if (this._currentContextTemplate && this._currentContextTemplate.list2Ctrl &&
    this._currentContext.ctxtId === "ChannelList")
    {
        var stationId = null;
        var stationName = null;
        var sid = null;
        var stationList = null;
        var focussedItem = null;
        var categoryName = null;
        if (this._currentContextTemplate.list2Ctrl.focussedItem !== null)
        {
            focussedItem = this._currentContextTemplate.list2Ctrl.focussedItem;
        }

        if (this._currentContextTemplate.list2Ctrl.dataList)
        {
            stationList = this._currentContextTemplate.list2Ctrl.dataList;
        }

        if (stationList && stationList.items[focussedItem] && stationList.items[focussedItem].appData)
        {
            if (stationList.items[focussedItem].appData.stationId !==null)
            {
                stationId = stationList.items[focussedItem].appData.stationId;
            }
            if (stationList.items[focussedItem].appData.stationName !== null)
            {
                stationName = stationList.items[focussedItem].appData.stationName;
            }
            if (stationList.items[focussedItem].appData.genreName)
            {
                categoryName = stationList.items[focussedItem].appData.genreName;
            }
            if (stationList.items[focussedItem].appData.sid !== null)
            {
                sid = stationList.items[focussedItem].appData.sid;
            }
        }

        var xm_Category = null;
        if (this._xmCategoryList && this._xmCategoryList.categoryList)
        {
            var categoryList = this._xmCategoryList.categoryList;
            var index = utility.getArrayItemByPropertyValue(categoryList , "categoryName" , categoryName);
            if ( index && categoryList[index.index] && categoryList[index.index].categoryNumber !==null)
            {
                xm_Category = categoryList[index.index].categoryNumber;
            }
        }
        if ( focussedItem && focussedItem!==1)
        {
            framework.sendEventToMmui(this.uiaId, "SelectFavoritesStation" ,
                {payload:{radioData: { stationType : "Sat",stationName : stationName, satRadioData : { XM_Category : xm_Category, XM_Channel : stationId, XM_SID : sid} }}},true);

        }
    }
}

//Msg from MMUI to clear the entered PIN from all PIN Entry screen
satradioApp.prototype._PinClearedStatusMsgHandler = function(msg)
{
    if( msg && msg.params && msg.params.payload )
    {
        var isPinCleared = msg.params.payload.isPinCleared;
        if(isPinCleared)
        {
            this._clearPin();
        }
    }
}

//Scan Status message received from MMUI
satradioApp.prototype._ScanStatusMsgHandler = function(msg)
{
    var scanState = false;
    if (msg && msg.params && msg.params.payload && msg.params.payload.scanOn !== null)
    {
        scanState = msg.params.payload.scanOn;
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

//Channel Info SBN message received from MMUI
satradioApp.prototype._ChannelInfoSBNMsgHandler = function(msg)
{
	var params = {};
	this._sbnChnnelNumber = 0;
	if (msg && msg.params && msg.params.payload && msg.params.payload.channelID !== null)
    {
		this._sbnChnnelNumber = msg.params.payload.channelID;
		log.info("Received ChNum "+ this._sbnChnnelNumber);
		

		framework.sendRequestToDbapi(this.uiaId, this._showChannelInfoSBN.bind(this), "radio", "XmNowPlayingMetadata", params);

	}

}

//showing status bar notification for Channel ID changed
satradioApp.prototype._showChannelInfoSBN = function(msg)
{
	var params = msg.msgContent.params;
	var ChannelName = "";
	if(params.channelName)
        {
            ChannelName = params.channelName;
        }
	
	if(this._sbnChnnelNumber)
	{	
		var sbnText = "CH."+this._sbnChnnelNumber +" "+ ChannelName;
		
		framework.common.startTimedSbn(this.uiaId, "channelInfo", "typeE",
        { sbnStyle : "Style02",imagePath1 : "IcnSbnEnt.png", text1Id : "system.SdarsRadio" , text2 : sbnText });
	}
}


/***************************
 * Control callbacks
 ***************************/

// List Control
satradioApp.prototype._listItemClickCallback = function(listCtrlObj, appData, params)
{
    log.debug("_listItemClickCallback called...params.itemIndex :::::"+params.itemIndex);
    var itemIndex = params.itemIndex;
    var vuiFlag = false
    if(params && params.fromVui)
    {
        vuiFlag = params.fromVui;
    }
    switch(this._currentContext.ctxtId)
        {
            case "ChannelList" :
                switch(appData.eventName)
                {
                    case "SelectChangeCategory" :
                        var params = null;
                        framework.sendEventToMmui(this.uiaId, appData.eventName,params,vuiFlag);
                        break;
                    case "SelectStation":
                        var stationId = parseInt(appData.stationId);
                        var sid = parseInt(appData.sid);
                        framework.sendEventToMmui(this.uiaId, appData.eventName,{payload:{stationID: {ChID:stationId, SID:sid}}}, vuiFlag);
                        break;
                    default :
                        break;
                }
                break;
            case "CategoryList" :
                var params = null;
                var genreSelected = null;
                if (appData.eventName === "SelectStationCategory")
                {
                    //params is available only for  "SelectStationCategory" appData.
                    params = {
                        payload :
                        {
                            categoryID : appData.categoryID
                        }
                    };
                    genreSelected = {params : { payload : {categoryID : appData.categoryID}}};
                    log.info("Category selected as "+params.payload.categoryID);
                    log.info("Earlier categoryNumber "+this._categoryNumber);
                }
                else if(appData.eventName === "SelectStationAll")
                {
                    genreSelected = {params : { payload : {categoryID : 255 }}};
                    log.info("Category selected as "+genreSelected.params.payload.categoryID);
                    log.info("Earlier categoryNumber "+this._categoryNumber);
                    this._indexOfCurrentPlayingChannel = this._cachedIndexOfCurrentPlayingChannel;
                }
                
                if(params && params.payload && (this._categoryNumber !== params.payload.categoryID))
                {
                    this._cachedIndexOfCurrentPlayingChannel = this._indexOfCurrentPlayingChannel ; //Caching the IndexOfCurrentPlayingChannel before initialising it to Zero.
                    this._indexOfCurrentPlayingChannel = 0; // As category is changed then GUI will set the default index for Current Playing Channel                
                }
                
                this._CategorySelectedMsgHandler(genreSelected);
                framework.sendEventToMmui(this.uiaId, appData.eventName, params , vuiFlag);
                break;
            case "ParentalLock" :
                switch(appData)
                {
                    case "SetChannelLock" :
                        var input = null;
                        switch (params.additionalData)
                        {
                            case 1 :
                                input = "YES";
                                this._channelLockStatus = input;
                                this._parentalLockDataList.items[0].value = 1;
                                break;
                            case 2 :
                                input = "NO";
                                this._channelLockStatus = input;
                                this._parentalLockDataList.items[0].value = 2;
                                break;
                        }
                        this._populateParentalLocklListControl(this._currentContextTemplate);
                        framework.sendEventToMmui(this.uiaId, appData , {payload:{channelLock:input}} , vuiFlag);
                        break;
                    case "SetParentalLock" :
                        var extradata = params.additionalData;
                        var input = null;
                        if(extradata === 1)
                        {
                            this._parentalLockDataList.items[1].value = 1;
                            this._parentalLockDataList.items[0].disabled = true;
                            this._parentalLockDataList.items[2].disabled = true;
                            input = "LOCK_ON";
                        }
                        else if(extradata === 2)
                        {
                            this._parentalLockDataList.items[1].value = 2;
                            this._parentalLockDataList.items[0].disabled = false;
                            this._parentalLockDataList.items[2].disabled = false;
                            input = "LOCK_OFF";
                        }
                        this._populateParentalLocklListControl(this._currentContextTemplate);
                        framework.sendEventToMmui(this.uiaId, appData , {payload:{parentalLock:input}} , vuiFlag);
                        break;
                    default :
                        var params = null;
                        framework.sendEventToMmui(this.uiaId, appData ,params, vuiFlag);
                        break;
                }
                break;
            default :
                var params = null;
                framework.sendEventToMmui(this.uiaId, appData ,params, vuiFlag);
                break;
        }

}

//Long press callback
satradioApp.prototype._ListLongPressCallback = function(listCtrlObj, appData, params)
{
    log.debug('_ListLongPressCallback called...', listCtrlObj, appData, params);
    switch(this._currentContext.ctxtId)
    {
        case "ChannelList" :
            var stationId = parseInt(appData.stationId);
            var stationName = appData.stationName;
            var xm_Category = null;
            var categoryName = null;
            if (this._xmCategoryList && this._xmCategoryList.categoryList)
            {
                var categoryList = this._xmCategoryList.categoryList;
                categoryName = appData.genreName;
                var index = utility.getArrayItemByPropertyValue(categoryList , "categoryName" , categoryName);
                if ( index )
                {
                    xm_Category = categoryList[index.index].categoryNumber;
                }
            }
            var sid = appData.sid;
            framework.sendEventToMmui(this.uiaId, "SelectFavoritesStation" ,
                {payload:{radioData: { stationType : "Sat",stationName : stationName, satRadioData : { XM_Category : xm_Category, XM_Channel : stationId, XM_SID : sid} }}});
            break;
        default :
            break;
    }
}

//Ump control for button select
satradioApp.prototype._umpDefaultSelectCallback = function(ctrlObj, appData, params)
{
    log.debug("satradioradioApp _umpDefaultSelectCallback called...");

    switch (this._currentContext.ctxtId)
    {
        case "NowPlaying" :
            var buttonStatus = this._umpButtonConfig[appData].disabled;
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
                    //As for the default select callback for the seButtonState(), is taken care by control. 
					//so no need to set the button state in the dafault select callback.
                    //this._setScanToggleUMPCtrl(this._currentContextTemplate,nextStateOfScan);
                }
            }
            if(!buttonStatus)
            {
                switch(appData)
                {
                    case "SeekPrevious" :
                    case "SeekNext" :
                        framework.sendEventToMmui(this.uiaId, appData);
                        break;
                    case "SelectStationList" :
                        framework.sendEventToMmui(this.uiaId, appData);
                        break;
                    case "SelectParentalLock" :
                        framework.sendEventToMmui(this.uiaId, appData);
                        break;
                    default :
                        framework.sendEventToMmui(this.uiaId, appData);
                        break;
                }
            }
            break;
        default :
            break;
    }
}

//LongPress CAllback for Favorites
satradioApp.prototype._umpDefaultLongPressCallback = function(ctrlObj, appData, params)
{
    log.debug("satradioApp _umpDefaultLongPressCallback called...");
    switch(appData)
    {
        case "SelectFavorites" :
            framework.sendEventToMmui("common", "Global.AddToFavorites");
            break;
        default :
            break;
    }
}

//Dialog3 button select callback
satradioApp.prototype._dialogCtrlClickCallback = function(dialogBtnCtrlObj, appData, extraParams)
{
    log.debug("satradioradioApp _dialogCtrlClickCallback called...");
    framework.sendEventToMmui("common", appData);
}

// DialPad2 Control callback
satradioApp.prototype._dialpadSelectCallback = function(dialPadCtrlObj,appData, params)
{
    log.debug("satradioradioApp _dialpadSelectCallback called...");
    switch(params.btnSelected)
    {
        case "Cancel" :
            framework.sendEventToMmui("common", "Global.Cancel");
            break;
        case "OK" :
            framework.sendEventToMmui("common", "Global.Yes");
            break;
        case "Tone":
            var input = parseInt(params.input);
            framework.sendEventToMmui(this.uiaId, "EnterDigit", { payload: {digit: input} });
            break;
        case "Clear":
            framework.sendEventToMmui(this.uiaId, "DeleteDigit");
            break;
        default :
            break;
    }
}

/**************************
 * Helper functions
 **************************/
//helper function to clear the PIN
satradioApp.prototype._clearPin = function()
{
    if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId)
    {
        switch(this._currentContext.ctxtId)
        {
            case "PinEntryUnlock" :
            case "PinEntryReset" :
            case "PinEntryNew" :
                this._currentContextTemplate.dialPad2Ctrl.setInputValue(null);
                break;
            default :
                //Do nothing
                break;
        }
    }
}

//set Scan UMP Button Light ON/ Light OFF
satradioApp.prototype._setScanToggleUMPCtrl = function(tmplt,state)
{
    if(this._currentContext && this._currentContext.ctxtId === "NowPlaying")
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

//Populate Now playing control
satradioApp.prototype._populateSATNowPlayingCtrl = function(tmplt)
{
    var category = this._cachedMetadataCategory;
    var channelNumber = null;
    var title = this._cachedTrackTitle;
    var titleId = null;
    var subMap = null;
    var artist = this._cachedArtistName;
    var artistId = null;
    var ctrlTitle = null;
    var channelName = this._cachedChannelName;
    var radioId = this._cachedRadioID;
    var cachedAudioTitleObj = new Object();
    var errorCondition = false;
    cachedAudioTitleObj.fullConfig = true;
    cachedAudioTitleObj.ctrlStyle  = "Style2";
    this._cachedMetaImagePath = "";
    this._cachedTitleicon = null;
    this._cachedAudioicon = "common/images/icons/IcnListContact_Placeholder.png";
    this._audioTitleIcon = "common/images/icons/IcnListContact_Placeholder.png"
    this._detailIcon = "common/images/icons/IcnListEntNowPlaying_En.png";

    if (this._cachedChannelsDetails && this._cachedChannelsDetails.ch !== null)
    {
        channelNumber = this._cachedChannelsDetails.ch;
        this._cachedmetaDatainformation.channelNumber = channelNumber;
    }

    //Check whether channel is locked or not
    if(this._cachedChannelsDetails && this._cachedChannelsDetails.ch_lock_sts)
    {
        if (this._cachedChannelsDetails.ch_lock_sts === 1)
        {
            artistId = "SelectLockButton";
            subMap = null;
            title = null;
            artist = null;
            titleId = null;
            category = null;
            this._cachedMetaImagePath = "common/images/icons/IcnAlbumArtLock.png";
            cachedAudioTitleObj.fullConfig = false;
            cachedAudioTitleObj.ctrlStyle = "Style2";
            this._cachedTitleicon = "common/images/icons/IcnListParentalControl.png";
            this._cachedAudioicon = null;
        }
    }

    if((this._cachedError && this._cachedError.errorCondition) || this._cachedmetaDatainformation.channelNumber === 0)
    {
        cachedAudioTitleObj.fullConfig = false;
        cachedAudioTitleObj.ctrlStyle = "Style2";
        title = null;
        artist = null;
        artistId = null;
        category = null;
        titleId = null;
        subMap = null
        errorCondition = true;
        this._cachedMetaImagePath = "common/images/FullTransparent.png";
        this._cachedAudioicon = null;
        if(this._cachedmetaDatainformation.channelNumber === 0 ||  this._cachedmetaDatainformation.channelNumber)
        {
            ctrlTitle = "CH." + this._cachedmetaDatainformation.channelNumber;
        }
        if (this._cachedError && this._cachedError.errorCondition)
        {
            this._audioTitleIcon = " ";//No artist should be shown for error case
            switch(this._cachedError.errorCondition)
            {
                case "CHANNEL_NO_LONGER_AVAILABLE" :
                    artistId = "XMChannelNotAvailable";
                    break;
                case "CHANNEL_NOT_AUTHORIZED" :
                    artistId = "XMChannelNotAuthorized";
                    break;
                case "ANTENNA_NOT_CONNECTED" :
                    artistId = "CheckXMAntenna";
                    break;
                case "TUNER_DISCONNECTED" :
                    artistId = "CheckXMTuner";
                    break;
                case "LOSS_OF_SIGNAL" :
                    artistId = "NoXMSignal";
                    break;
                case "ACQUIRING_INFO" :
                    artistId = "LoadingXM";
                    break;
                case "CHANNEL_NOT_IN_SERVICE" :
                    artistId = "XMChannelOffAir";
                    break;
                case "CHANNEL_LOCKED" :
                    titleId = null;
                    artistId = "SelectLockButton";
                    subMap = null;
                    channelName = this._cachedChannelName;
                    this._cachedMetaImagePath = "common/images/icons/IcnAlbumArtLock.png";
                    this._cachedTitleicon = "common/images/icons/IcnListParentalControl.png";
                    if (channelName === null)
                    {
                        channelName = "";
                    }
                    if (this._cachedmetaDatainformation.channelNumber)
                    {
                        ctrlTitle = "CH." + this._cachedmetaDatainformation.channelNumber + "  " + channelName;
                    }
                    this._lockButtonStatus = "Locked"; // Set lock ump button
                    this._setUMPLockButtonState("SelectParentalLock", this._lockButtonStatus);
                    errorCondition = false;
                    break;
                case "NONE" :
                    if (this._cachedmetaDatainformation.channelNumber !== 0)
                    {

                        category = this._cachedMetadataCategory;
                        title = this._cachedTrackTitle;
                        artist = this._cachedArtistName;
                        channelName = this._cachedChannelName;
                        radioId = this._cachedRadioID;
                        this._cachedMetaImagePath = "";
                        cachedAudioTitleObj.ctrlStyle = "Style2";
                        this._audioTitleIcon = "common/images/icons/IcnListContact_Placeholder.png";
                        if (channelName === null)
                        {
                            channelName = "";
                        }
                        if (this._cachedmetaDatainformation.channelNumber)
                        {
                            ctrlTitle = "CH." + this._cachedmetaDatainformation.channelNumber + "  " + channelName;
                        }
                    }
                    //Check whether channel is locked or not
                    if(this._cachedChannelsDetails && this._cachedChannelsDetails.ch_lock_sts)
                    {
                        if (this._cachedChannelsDetails.ch_lock_sts === 1 && this._cachedmetaDatainformation.channelNumber !== 0)
                        {
                            artistId = "SelectLockButton";
                            subMap = null
                            title = null;
                            artist = null;
                            titleId = null;
                            category = null;
                            this._cachedMetaImagePath = "common/images/icons/IcnAlbumArtLock.png";
                            this._cachedTitleicon = "common/images/icons/IcnListParentalControl.png";
                            cachedAudioTitleObj.ctrlStyle = "Style2";
                            this._cachedAudioicon = null;
                        }
                    }
                    errorCondition = false;
                    break;
                default :
                    errorCondition = false;
                    break;
            }

            //If channel is not locked then change the lock status
            if (this._cachedChannelsDetails && this._cachedChannelsDetails.ch_lock_sts === 0 &&
            this._cachedError.errorCondition !=="CHANNEL_LOCKED" && this._prevErrorCondition === "CHANNEL_LOCKED")
            {
                this._lockButtonStatus = "Unlocked"; // Set lock ump button
                this._setUMPLockButtonState("SelectParentalLock", this._lockButtonStatus);
            }

            //Channel is zero and the channel is locked
            if(this._cachedmetaDatainformation.channelNumber === 0 && this._cachedRadioID
            && this._cachedError.errorCondition !=="CHANNEL_LOCKED")
            {
                radioId = this._cachedRadioID;
                if(radioId)
                {
                    titleId  = "RadioID";
                    subMap = {radioId : radioId};
                    cachedAudioTitleObj.ctrlStyle = "Style2";
                    this._cachedMetaImagePath = "";
                    this._detailIcon = " ";
                }
            }
        }

        else if (this._cachedmetaDatainformation.channelNumber === 0)
        {
            ctrlTitle = "CH." + this._cachedmetaDatainformation.channelNumber;
            radioId = this._cachedRadioID;
            artist = null;
            artistId = null;
            title = null;
            category = null;
            titleId = null;
            subMap = null
            if(radioId)
            {
                titleId  = "RadioID";
                subMap = {radioId : radioId};
                cachedAudioTitleObj.ctrlStyle = "Style2";
                errorCondition = false;
                this._cachedMetaImagePath = "";
                this._detailIcon = " ";
            }
        }
    }
    else if(this._cachedmetaDatainformation.channelNumber)
    {
        if(channelName === null)
        {
            channelName = "";
        }
        ctrlTitle = "CH." + this._cachedmetaDatainformation.channelNumber + "  " + channelName;
    }

    if(this._channelLockStatus === "YES")
    {
        this._cachedTitleicon = "common/images/icons/IcnListParentalControl.png";
    }
    
    if ((this._cachedChannelsDetails && this._cachedChannelsDetails.ch_lock_sts === 1) ||
    (this._cachedError && this._cachedError.errorCondition ==="CHANNEL_LOCKED"))
    {
        var controlConfigObj = new Object();
        controlConfigObj.fullConfig = false;
        controlConfigObj.ctrlStyle = "Style2";
        controlConfigObj["ctrlTitleObj"] =
        {
            "ctrlTitleId"    : null,
            "ctrlTitleText"  : ctrlTitle,
            "ctrlTitleIcon" : this._cachedTitleicon
        };
        controlConfigObj["audioTitleObj"] =
        {
            "audioTitleId"   : artistId,
            "audioTitleText" : null,
            "audioTitleIcon" : " ",//No title icon needed for  Lock screen
        }
        controlConfigObj["detailLine1Obj"] =
        {
            "detailTextId"    : titleId,
            "subMap" : subMap,
            "detailText"  : title,
            "detailIcon" : " "
        };
        tmplt.nowPlaying4Ctrl.setNowPlayingConfig(controlConfigObj);
    }
    else
    {
        cachedAudioTitleObj["ctrlTitleObj"] =
        {
            "ctrlTitleId"    : null,
            "ctrlTitleText"  : ctrlTitle,
            "ctrlTitleIcon" : this._cachedTitleicon
        };
        cachedAudioTitleObj["audioTitleObj"] =
        {
            "audioTitleId"   : artistId,
            "audioTitleText"     : artist,
            "audioTitleIcon"     : this._audioTitleIcon
        };
        cachedAudioTitleObj["detailLine1Obj"] =
        {
            "detailTextId"    : titleId,
            "subMap" : subMap,
            "detailText"  : title,
            "detailIcon" : this._detailIcon
        };

        if(category)
        {
            if(category !== "TBD")
            {
                cachedAudioTitleObj["detailLine2Obj"] =
                {
                    "detailTextId"   : null,
                    "detailText"     : category,
                    "detailIcon"     : "common/images/icons/IcnListCdPlayer_En.png"
                };
            }
        }
        tmplt.nowPlaying4Ctrl.setNowPlayingConfig(cachedAudioTitleObj);
    }

    if(errorCondition)
    {
        this._currentContextTemplate.nowPlaying4Ctrl.showArtworkImage(false);
    }
    else
    {
        this._currentContextTemplate.nowPlaying4Ctrl.setArtworkImagePath(this._cachedMetaImagePath);
    }
}

// Showing the status bar notification
satradioApp.prototype._populateStatusBarCtrl = function()
{
    if(this._cachedError && this._cachedError.errorCondition && this._cachedError.errorCondition !== "NONE")
    {
        var sbnText = null;
        switch(this._cachedError.errorCondition)
        {
            case "CHANNEL_NO_LONGER_AVAILABLE" :
                sbnText = "XMChannelNotAvailable";
                break;
            case "CHANNEL_NOT_AUTHORIZED" :
                sbnText = "XMChannelNotAuthorized";
                break;
            case "ANTENNA_NOT_CONNECTED" :
                sbnText = "CheckXMAntenna";
                break;
            case "TUNER_DISCONNECTED" :
                sbnText = "CheckXMTuner";
                break;
            case "LOSS_OF_SIGNAL" :
                sbnText = "NoXMSignal";
                break;
            case "ACQUIRING_INFO" :
                sbnText = "LoadingXM";
                break;
            case "CHANNEL_NOT_IN_SERVICE" :
                sbnText = "XMChannelOffAir";
                break;
            default :
                break;
        }
		if("ACQUIRING_INFO" == this._cachedError.errorCondition)
		{		
			framework.common.startTimedSbn(this.uiaId, "errorNotificationLoadingXM", "typeD",
			{ sbnStyle : "Style02",imagePath1 : "common/images/icons/IcnListBtConnType_Music.png", text1Id : sbnText , text2 : null });
		}
		else
		{
			framework.common.startTimedSbn(this.uiaId, "errorNotification", "typeF",
			{ sbnStyle : "Style02",imagePath1 : "common/images/icons/IcnListBtConnType_Music.png", text1Id : sbnText , text2 : null });
		}
    }
}

// Add or Update items to list control
satradioApp.prototype._addItemsToList = function(msg)
{
    var list = null;
    var count = null;
    var totalCount = null;
    if (msg && msg.msgContent && msg.msgContent.params)
    {
        var currList = this._currentContextTemplate.list2Ctrl;
        var currCtxtId = this._currentContext.ctxtId;
        if (msg.msgContent.params.eCode == 0 && msg.msgContent.params.totalCount > 0 && msg.msgContent.params.stationList != "")
        {
            // extract data of interest
            this._requestsent = false;
            if (msg.msgContent.params.stationList)
            {
                list = msg.msgContent.params.stationList;
            }
            if (msg.msgContent.params.count)
            {
                count = msg.msgContent.params.count;
                log.info("Count of channels received in this chunck:: "+count);
            }
            if (msg.msgContent.params.totalCount)
            {
                totalCount = msg.msgContent.params.totalCount;
            }
            this._listTotalCount = totalCount + 1;
            log.info("TotalCount of List:: "+this._listTotalCount);
            var offset = this._listNeedDataOffsetIndex;

            var channelNumber = "";
            var sid = null;
            var genreName = null;

            // do we have a dataList, i.e. are first entering into this context
            if (!currList.hasDataList())
            {
               // the current list doesn't have a dataList -> set one
                var dataList = {
                    itemCountKnown : true,
                    itemCount : totalCount+1,
                    vuiSupport : true,
                    items : []
                }
                if (this._cachedSelectedGenre === "All Channels")
                {
                    dataList.items[0] = { appData : { eventName : 'SelectChangeCategory' }, text1Id : "CategoryAllChannels", itemStyle : "style01" };
                }
                else
                {
                    dataList.items[0] = { appData : { eventName : 'SelectChangeCategory' }, text1Id : "Category" , text1SubMap : {"cachedSelectedGenre" : this._cachedSelectedGenre}, itemStyle : "style01" };
                }
                // are we not in the beginning?
                if (offset > 0)
                {
                    // create empty datalist
                    for (var i=0; i<totalCount; i++)
                    {
                        // and fill only the received items
                        if (i>=offset && i<(offset+count))
                        {
                            if(!list[i-offset])
                            {
                                dataList.items[dataList.items.length] = { itemStyle:'style01', appData:"", text1:"", hasCaret:false};
                            }
                            else
                            {
                                genreName = list[i-offset].categoryName;
                                if(this._cachedSelectedGenre !== "All Channels")
                                {
                                    genreName = "";
                                }
                                if (list[i-offset].channelNumber !==null)
                                {
                                    channelNumber = "CH."+list[i-offset].channelNumber;
                                }
                                if (list[i-offset].sid !==null)
                                {
                                    sid = list[i-offset].sid;
                                }
                                if(this._cachedSelectedGenre === "All Channels")
                                {
                                    dataList.items[dataList.items.length] =  {itemBehavior:"shortAndLong", itemStyle:'style04', appData:{ eventName : 'SelectStation', stationName : list[i-offset].stationName , stationId : list[i-offset].channelNumber, genreName : list[i-offset].categoryName , sid : sid}, text1:channelNumber+" "+list[i-offset].stationName,text2:genreName, hasCaret:false};
                                }
                                else
                                {
                                    dataList.items[dataList.items.length] =  {itemBehavior:"shortAndLong", itemStyle:'style01', appData:{ eventName : 'SelectStation', stationName : list[i-offset].stationName , stationId : list[i-offset].channelNumber, genreName : list[i-offset].categoryName , sid : sid}, text1:channelNumber+" "+list[i-offset].stationName,text2:genreName, hasCaret:false};
                                }
                            }
                        }
                        // otherwise add empty items (they will be requested as the user scrolls)
                        else
                        {
                            dataList.items[dataList.items.length] = { itemStyle:'style01', appData:null, text1:'', hasCaret:false};
                        }
                    }
                }
                // nope, we are in the beginning
                else
                {
                    // fil the first <count> elements
                    for (var i=0; i<count; i++)
                    {
                        genreName = list[i].categoryName;
                        if(this._cachedSelectedGenre !== "All Channels")
                        {
                            genreName = "";
                        }
                        if (list[i].channelNumber !==null)
                        {
                            channelNumber = "CH."+list[i].channelNumber;
                        }
                        if (list[i].sid !==null)
                        {
                            sid = list[i].sid;
                        }
                        dataList.itemCount = totalCount+1;
                        if(this._cachedSelectedGenre === "All Channels")
                        {
                            dataList.items[dataList.items.length] =  {itemBehavior:"shortAndLong", itemStyle:'style04', appData:{ eventName : 'SelectStation', stationName : list[i].stationName , stationId : list[i].channelNumber, genreName : list[i].categoryName , sid : sid}, text1:channelNumber +" "+list[i].stationName,text2:genreName, hasCaret:false};
                        }
                        else
                        {
                            dataList.items[dataList.items.length] =  {itemBehavior:"shortAndLong", itemStyle:'style01', appData:{ eventName : 'SelectStation', stationName : list[i].stationName , stationId : list[i].channelNumber, genreName : list[i].categoryName , sid : sid}, text1:channelNumber +" "+list[i].stationName,text2:genreName, hasCaret:false};
                        }
                    }
                }
                currList.setDataList(dataList);
                currList.updateItems(0, dataList.itemCount-1);
                currList.topItem = this._contextTable[currCtxtId]['controlProperties']['List2Ctrl']['scrollTo'];
            }
            // we have a datalist -> just update the received items
            else
            {
                for (var i=offset; i<(offset+count); i++)
                {
                    genreName = list[(i - offset)].categoryName;
                    if(this._cachedSelectedGenre !== "All Channels")
                    {
                        genreName = "";
                    }
                    if (list[(i - offset)].channelNumber !==null)
                    {
                        channelNumber = "CH."+list[(i - offset)].channelNumber;
                    }
                    if (list[(i - offset)].sid !==null)
                    {
                        sid = list[(i - offset)].sid;
                    }
                    currList.dataList.itemCount = totalCount+1;
                    currList.dataList.vuiSupport = true;
                    if (this._cachedSelectedGenre === "All Channels")
                    {
                        currList.dataList.items[i+1] = {itemBehavior:"shortAndLong", itemStyle:'style04', appData:{ eventName : 'SelectStation', stationName : list[(i - offset)].stationName , stationId : list[(i - offset)].channelNumber, genreName : list[(i - offset)].categoryName , sid : sid}, text1:channelNumber + " " +list[(i - offset)].stationName,text2:genreName, hasCaret:false};
                    }
                    else
                    {
                        currList.dataList.items[i+1] = {itemBehavior:"shortAndLong", itemStyle:'style01', appData:{ eventName : 'SelectStation', stationName : list[(i - offset)].stationName , stationId : list[(i - offset)].channelNumber, genreName : list[(i - offset)].categoryName , sid : sid}, text1:channelNumber + " " +list[(i - offset)].stationName,text2:genreName, hasCaret:false};
                    }
                }
                currList.updateItems(offset+1, (offset+count));
            }
             this._cacheddata = currList.dataList;
        }
        else
        {
             var dataList = {
                    itemCountKnown : true,
                    itemCount : 1,
                    vuiSupport : true,
                    items : []
                }
			this._listTotalCount = 1;
            if (this._cachedSelectedGenre === "All Channels")
            {
                dataList.items[0] = { appData : { eventName : 'SelectChangeCategory' }, text1Id : "CategoryAllChannels", itemStyle : "style01" };
            }
            else
            {
                dataList.items[0] = { appData : { eventName : 'SelectChangeCategory' }, text1Id : "Category" , text1SubMap : {"cachedSelectedGenre" : this._cachedSelectedGenre}, itemStyle : "style01" };
            }
			this._cacheddata = dataList;
            currList.setDataList(dataList);
            currList.updateItems(0, dataList.itemCount-1);
            currList.topItem = this._contextTable[currCtxtId]['controlProperties']['List2Ctrl']['scrollTo'];
        }
    }
    this._requestsent = false;
}

//Parental Lockl ListControl
satradioApp.prototype._populateParentalLocklListControl = function(tmplt)
{
    var listLength = this._parentalLockDataList.itemCount;
    var dataList = this._parentalLockDataList;
    tmplt.list2Ctrl.setDataList(dataList);
    tmplt.list2Ctrl.updateItems(0, listLength-1);
}

//Reseting the datalist of StationList Context
satradioApp.prototype._resetingChannelListCtxDataList = function()
{
    //@formatter:off
    this._stationListCtxtDataList = {
        itemCountKnown : true,
        itemCount : 1,
        vuiSupport : true,
        items: [
            { appData : { eventName : 'SelectChangeCategory' }, text1Id : "Category" , text1SubMap : {"cachedSelectedGenre" : this._cachedSelectedGenre}, itemStyle : "style04" },
        ]
    };

    if (this._cachedSelectedGenre === "All Channels")
    {
        this._stationListCtxtDataList.items[0].text1Id = "CategoryAllChannels";
        this._stationListCtxtDataList.items[0].text1SubMap = null;
    }

    if(this._currentContext.ctxtId == "ChannelList" && this._currentContextTemplate)
    {
        this._currentContextTemplate.list2Ctrl.setDataList(this._stationListCtxtDataList);
        this._currentContextTemplate.list2Ctrl.updateItems(0, 0);
    }
    this._stationListCtxtDataList.items.splice(1,this._listActualDataCount);
    this._listNeedDataOffsetIndex = 0;
    this._listActualDataCount = 0;
    this._listTotalCount = 0;
    this._isItemsPopulatedBefore = false;
    this._cachedStationChunk = null;
    this._cacheddata = null;
    //@formatter:on
}

// this is called when list needs more data to display when scrolling
satradioApp.prototype._XmChannelNeedDataCallback = function(index)
{
    log.debug(" _XmChannelNeedDataCallback  called..."+index);
    this._listNeedDataOffsetIndex = index;

    //Get stations from DBAPI
    if(this._listNeedDataOffsetIndex >= 1)
    {
        this._listNeedDataOffsetIndex = this._listNeedDataOffsetIndex -1 ;
    }
    var params = {"filterByCategory":this._categoryNumber, index : this._listNeedDataOffsetIndex , limit : 20};
    framework.sendRequestToDbapi(this.uiaId, this._addItemsToList.bind(this), "radio", "XmChannelList", params);
}

//Reset Category List
satradioApp.prototype._resetCategoryList = function()
{
    this._categoryListCtxtDataList = {
        itemCountKnown : true,
        itemCount : 1,
        vuiSupport : true,
        items: [
            { appData : { eventName : 'SelectStationAll' , categoryID : 255 }, text1Id : "AllChannels", itemStyle : "style01" , hasCaret : false }
        ]
    };
}

satradioApp.prototype._setChannelLockStatus = function(tmplt)
{
    if(this._channelLockStatus)
    {
        switch(this._channelLockStatus)
        {
            case "YES" :
                this._parentalLockDataList.items[0].value = 1;
                break;
            case "NO" :
                this._parentalLockDataList.items[0].value = 2;
                break;
            default :
                break;
        }
    }
}

//Category list populate function
satradioApp.prototype._populateXmCategoryListCtrl = function(tmplt)
{
    var listTotalCount = null;
    var xmCategoryCount = null;
    var categoryNumber = 0;
    var categoryName = null;

    if(this._xmCategoryList && this._xmCategoryList.eCode == 0 && this._xmCategoryList.totalCount > 0
    && this._xmCategoryList.categoryList)
    {
        listTotalCount = this._xmCategoryList.totalCount;
        xmCategoryCount = this._xmCategoryList.categoryList.length;

        var dataList =
            {
                itemCountKnown : true,
                itemCount : xmCategoryCount + 1,
                vuiSupport : true
            };

        var items = new Array();
        items = this._categoryListCtxtDataList.items;

        for(i = 0 , j = -1; i < xmCategoryCount ; i++)
        {
            if(this._xmCategoryList.categoryList[i].categoryNumber)
            {
                categoryNumber = this._xmCategoryList.categoryList[i].categoryNumber;
            }
            if(this._xmCategoryList.categoryList[i].categoryName)
            {
                categoryName = this._xmCategoryList.categoryList[i].categoryName;
                j++;
            }
            //If category name is empty ,dont display
            if(this._xmCategoryList.categoryList[i].categoryName === "")
            {
                continue;
            }
            items[j+1] =
            {
                appData : { eventName : 'SelectStationCategory', categoryID : categoryNumber },
                text1 : categoryName ,
                itemStyle : "style02",
                hasCaret : false
            };
        }

        //Update XM category List
        dataList.items = items;
        dataList.itemCount = items.length;
        this._categoryListCtxtDataList = dataList;
        tmplt.list2Ctrl.setDataList(dataList);
        tmplt.list2Ctrl.updateItems(0, dataList.itemCount - 1);
    }
    else
    {
        log.debug("No Data found");
    }
}

satradioApp.prototype._populateCachedChannelList = function()
{
    var dataList = {};
    dataList.itemCountKnown = true;
    dataList.itemCount = this._listTotalCount; // total no. of contacts received from DBAPI, not the no. of items requested in chunks
    if (this._cacheddata)
    {
        dataList = this._cacheddata;
    }
    this._currentContextTemplate.list2Ctrl.setDataList(dataList);
    this._currentContextTemplate.list2Ctrl.updateItems(0, dataList.itemCount - 1);
}

//Helper function to set Lock button
satradioApp.prototype._setUMPLockButtonState = function(lableName, state)
{
    log.debug("_setUMPLockButtonState  called..."+lableName);
    var prevState = this._umpButtonConfig["SelectParentalLock"].currentState;
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying")
    {
        if (prevState !== state)
        {
            this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setButtonState(lableName,state);
        }
    }
}

/*******************************************************************************
 * This function is called by Common whenever a msgType="alert" comes from MMUI *
 * This function should return a properties Object to use for the WinkCtrl *
 *******************************************************************************/

satradioApp.prototype.getWinkProperties = function(alertId, params)
{
    log.debug("common is looking for wink properties:", alertId, params);
    var winkProperties = null;
    switch (alertId)
    {
        case "ParentalCodeLockSet_Alert" :
            winkProperties = {
                "style": "style03",
                "text1Id": "PINSet"
            };
            break;
        case "ChannelsUnlockedSession_Alert" :
            winkProperties = {
                "style": "style03",
                "text1Id": "ChannelsUnlockedForSession"
            };
            this._lockButtonStatus = "Unlocked"; // Set lock ump button
            if(this._cachedChannelsDetails && this._cachedChannelsDetails.ch_lock_sts === 1)
            {
                this._cachedChannelsDetails.ch_lock_sts = 0;
            }
            if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying")
            {
                this._setUMPLockButtonState("SelectParentalLock", this._lockButtonStatus);
                this._populateSATNowPlayingCtrl(this._currentContextTemplate);
            }
            break;
        case "PinIncorrect_Alert" :
            switch(this._currentContext.ctxtId )
            {
                case "PinEntryReset" :
                case "PinEntryUnlock" :
                case "ParentalLock" :
                    if(this._currentContextTemplate && this._currentContextTemplate.dialPad2Ctrl)
                    {
                        var dialPadCtrl = this._currentContextTemplate.dialPad2Ctrl;
                        var passwordLength = dialPadCtrl.getInputValue().length;
                        for(var i = 0; i < passwordLength ;i++)
                        {
                            dialPadCtrl.setInputValue(null);
                            framework.sendEventToMmui(this.uiaId, "DeleteDigit");
                        }
                    }
                    break;
                default:
                break;
            }
            winkProperties = {
                "style": "style01",
                "text1Id": "WrongPIN",
                "text2Id": "PleaseTryAgain"
            };
            break;
        default :
            break;
    }
    // return the properties to Common
    return winkProperties;
}

/**************************
 * DBAPI METHOD RESPONSE HANDLERS *
 **************************/
//Helper function  to Read Metadata  from DBAPI
satradioApp.prototype._getMetadataCallbackFn = function(msg)
{
    log.debug(" _getMetadataCallbackFn  called...",msg);

    if (msg.msgContent.params.eCode === 0)
    {
        var params = msg.msgContent.params;
        this._cachedTrackTitle = "";
        this._cachedArtistName = "";
        this._cachedMetadataCategory = "";
        this._cachedChannelName = "";
        this._cachedRadioID = "";

        if(params.trackTitle)
        {
            this._cachedTrackTitle = params.trackTitle;
        }
        if(params.artistName)
        {
            this._cachedArtistName = params.artistName;
        }
        if(params.categoryName)
        {
            this._cachedMetadataCategory = params.categoryName;
        }
        if(params.channelName)
        {
            this._cachedChannelName = params.channelName;
        }
        if(params.radioId)
        {
            this._cachedRadioID = params.radioId;
        }

        if (this._currentContext && this._currentContextTemplate && ( this._currentContext.ctxtId === "NowPlaying" || this._currentContext.ctxtId === "CategorySeek" ))
        {
            this._populateSATNowPlayingCtrl(this._currentContextTemplate);
        }
    }
    else
    {
        log.debug("getMetadata operation failed");
    }
}

//Category list callback
satradioApp.prototype._getXmCategoryListCallbackFn = function(msg)
{
    if ( msg && msg.msgContent.params && msg.msgContent.params.eCode === 0 )
    {
        this._xmCategoryList = msg.msgContent.params;

        if(this._currentContext && this._currentContextTemplate && (this._currentContext.ctxtId == "CategoryList"))
        {
            this._populateXmCategoryListCtrl(this._currentContextTemplate);
        }
    }
}

// Tell framework that satradio app has finished loading
framework.registerAppLoaded("satradio" , null, true);
