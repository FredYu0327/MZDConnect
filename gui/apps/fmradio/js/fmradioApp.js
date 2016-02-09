/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: fmradioApp.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: asahum
 Date: 15 AUGUST 2012
 __________________________________________________________________________

 Description: IHU GUI FMRadio App
 Revisions:
 v0.1 (15-August-2012) FMRadioApp created with Nowplaying and Tune - asahum
 v0.2 (03-Sept-2012)   Merged to match the SCR framework related changes - asahum
 v0.3 (12-Sept-2012)   Updated to use new UMP updates - asahum
 v0.4 (24-Sep-2012)    Generated English dictionary using dictionary compiler - asahum
                       Closed GENERAL COMMENTS ACROSS APPS given by Arun - asahum
 v0.5 (24-Oct-2012)    DialogList added for HDStations - asahum
 v0.6 (07-Nov-2012)    Favurites long press callback is added - asahum
 v0.10 (20-Nov-2012)   ShortAndHold is changed to ShortAndLong and callback is added
                       for the same - arsu
 v0.11 (03-Dec-2012)   DBAPI implementation for AutoMemory , StationList and Metadata access from DBAPI - asahum
 v0.12 (20-Dec-2012)   NowPlaying changes According to UI Specs 3.6 - asahum
                       One new item "Genre Seek" in AutoMemory dataList - asahum
 v0.13 (21-Dec-2012)  "SelectFocusedStationAsFavorite" message handler is implemented to send details of focused
                       item to MMUI - asahum
 v0.14 (24-Dec-2012)  "GenreSeek" and "ChangeGenre" context is created - asahum
 v0.15 (31-Dec-2012)  "TADialog" and "TADialog" context is created - asahum
                       this._setTAToggleUMPCtrl(),this._setScanToggleUMPCtrl() is added to toggle TA and Scan.- asahum
                       Focus highlight of ump button is fixed - asahum
 v0.16 (07-Jan-2013)   implemented "this._populateWeekHDNowPlayingCtrl" for WeekHD Screen and "this._populateHDLostNowPlayingCtrl"
                       for HDSubstationsLost Screen - asahum
                       fix for iTT button issues - asahum
 v0.17 (10-Jan-2013)   removed use of deprecated images - asahum
                       AlbumArt and StationLogo implemented - asahum
 v0.18 (11-Jan-2013)   clearing the AlbumArt and StationLogo implemented when MMUI sends "RADIO_METADATA_DISPLAY_CLEAR" - asahum
 v0.19 (14-Jan-2013)   workaround removed for float sending to MMUI by (freq multiplying by 1000 is removed) - asahum
 v0.20 (17-Jan-2013)   TuneToFrequency is replaced by TuneUp and TuneDown - asahum
 v0.21 (25-Jan-2013)   SBN and Alert implementation - asahum
                       Removed deprecated method "TaggingStoreStatus" from message table - asahum
 v0.22 (08-Feb-2013)   GenreSeek is disabled for EU region - asahum
 v0.23 (11-Feb-2013)   Tuner2 is replaced by Tuner3 - asahum
                       Frequecncy wrapping support is available - asahum
 v0.24 (19-Feb-2013)   "framework._currentApp" is removed by "framework.getCurrentApp()" - asahum
 v0.25 (25-Feb-2013)    Metadata clear message handler is added - asahum
 v0.26 (13-Mar-2013)    Shifting to List2Ctrl from ListCtrl - asahum
 v0.27 (20-Mar-2013)    Removed setlog level .
 v0.28 (25-Mar-2013)    Fixed for "FM Radio Error: passing null region to Tuner3 Control"
 v0.29 (26-Mar-2013)    Shifting to 3.81 specs - asahum
 v0.30 (19-Apr-2013)    Toolstip implementation - asahum
 v0.31 (28-May-2013)    Line number display added for VUI - arsu
 v0.32 (29-May-2013)    Shifting to NowPlaying4 from NowPlaying3a - asahum
 v0.33 (10-July-2013)   Incorrect Genre in StationList issue is fixed - arsu
 v0.34 (10-July-2013)   Shifting t0 Dailogue3 control from Dialogue2- arsu
 v0.35 (15-July-2013)   Deprecated icon in dialogue is updated with the new - arsu
 v0.36 (03-feb -2014)   Changes for Genre Seek text sbNameId - avalajh
 v0.37 (23-July-2014)	Changes for HD screen(USA HD,WeekHD and HDsubstationLost)
 v0.38 (14-nov-2014)	Changes for scr SW00156823
_____________________________________________________________________________________________
*/
log.addSrcFile("fmradioApp.js", "fmradio");

function fmradioApp(uiaId)
{
    log.debug("fmradioApp constructor called...");
    baseApp.init(this, uiaId);
}


/**************************
 * Standard App Functions *
 **************************/

/*
 * Called just after the app is instantiated by framework.
 */
fmradioApp.prototype.appInit = function()
{
    log.debug(" fmradioApp appInit  called...");
    if (framework.debugMode)
    {
        utility.loadScript("apps/fmradio/test/fmradioAppTest.js");
    }

    // cache
    this._receivedpty = 0;
    this._ptyGenreFormat = "ALL";
    this._cachedGenre = "AllStations";
    this._updateAutoMRequest  = false;
    this._listNeedDataOffsetIndex = 0; // Value from list need data Callback
    this._listActualDataCount = 0; // No of items that are actually fetched and populated in the list
    this._isHDOff = true;
    this._isNowPlayingWeekHD = false;   //checking for Week HD Screen
    this._isNowPlayingHDLost = false;   //Checking for HD Lost Screen
    this._countSubStations = 0;
    this._cachedCurrentFreq = null;
    this._cachedRegion = "REGION_USA";
    this._cachediTunesState = new Object();
    this._cachediTunesState.state = null;
    this._cachediTunesState.isDisabled = false;
    // Datalist for the HDChannels
    this._hdChannelsDataList = null;
    this._cachedScanState = false;
    this._cachedOperationMode = null;
    this._region = "NA";// this region Info needs to pass to DBAPI
    this._TAState = "Unsel";
    this._cachedTAState = null;
    this._isAFOn = false;
    this._isEUTAURegion = false;
    this._TADialogTimeout = 10000;//10 Secs Timer needed for TADialog Screen
	
	this._FreqSeekTimer = 40;//40 ms Frequency timer for the default NA region for other timer will be 20 ms
    //asethab
    this._tempgenreList = null;
	this._userAction = false;
    
	this._stepCountData = {
		"REGION_USA" :{
									"stepInc" 			  : 0.2,
									"low"          		  : 87.7,
									"high"         		  : 107.9,
								 },
		"REGION_EU" : {
									"stepInc" 			  : 0.1,
									"low"          		  : 87.5,
									"high"         		  : 108.0,
								 },
		"REGION_JPN" : {
									"stepInc" 			  : 0.1,
									"low"          		  : 76.0,
									"high"         		  : 90.0,
								 },
		"REGION_CHINATAIWAN" : {
									"stepInc" 			  : 0.1,
									"low"          		  : 87.5,
									"high"         		  : 108.5,
								 },
		"REGION_4A" : {
						"REGION_5K": {
									"stepInc" 			  : 0.1,
									"low"          		  : 87.5,
									"high"         		  : 108.0,
								 },
						"REGION_9K":{
									"stepInc" 			  : 0.05,
									"low"          		  : 87.50,
									"high"         		  : 108.00,
								 },
						"REGION_AUSTRALIA" :{
									"stepInc" 			  : 0.1,
									"low"          		  : 87.5,
									"high"         		  : 108.0,
								 },
						"REGION_OTHER" :{
									"stepInc" 			  : 0.1,
									"low"          		  : 87.5,
									"high"         		  : 108.0,
								 },
					  }
	}
	
	
    this._ptyRDSText = {
        dbapiGenre :[
            { dbapiAppData : "ALL"},
            { dbapiAppData : "News"},
            { dbapiAppData : "Affairs"},
            { dbapiAppData : "Info"},
            { dbapiAppData : "Sport"},
            { dbapiAppData : "Educate"},
            { dbapiAppData : "Drama"},
            { dbapiAppData : "Culture"},
            { dbapiAppData : "Science"},
            { dbapiAppData : "Varied"},
            { dbapiAppData : "Pop M"},
            { dbapiAppData : "Rock M"},
            { dbapiAppData : "Easy M"},
            { dbapiAppData : "Light M"},
            { dbapiAppData : "Classics"},
            { dbapiAppData : "Other M"},
            { dbapiAppData : "Weather"},
            { dbapiAppData : "Finance"},
            { dbapiAppData : "Children"},
            { dbapiAppData : "Social"},
            { dbapiAppData : "Religion"},
            { dbapiAppData : "Phone In"},
            { dbapiAppData : "Travel"},
            { dbapiAppData : "Leisure"},
            { dbapiAppData : "Jazz"},
            { dbapiAppData : "Country"},
            { dbapiAppData : "Nation M"},
            { dbapiAppData : "Oldies"},
            { dbapiAppData : "Folk M"},
            { dbapiAppData : "Document"}
        ]
    };
    
    // Button configs for USA
    this._umpButtonConfigUSA = new Object();

    //Source
    this._umpButtonConfigUSA["SelectSource"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpEntMenu",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectSource"
    };

    //AutoM
    this._umpButtonConfigUSA["SelectAutoMemory"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpAutoMem",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectAutoMemory"
    };

    //favorites
    this._umpButtonConfigUSA["SelectFavorites"] =
    {
        buttonBehavior : "shortAndLong",
        imageBase : "IcnUmpFavorite",
        currentState:"Unfavorite",
        stateArray: [
            {
                state:"Unfavorite", labelId :"common.TooltipFavorites"
            }
        ],
		disabled : false,
        appData : "SelectFavorites"
    };

    //HD
    this._umpButtonConfigUSA["SelectHDChannels"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpHD",
        currentState:"Unsel",
        stateArray: [
            {
                state:"Unsel",labelId : "hdChannels_Tooltip"
            },
            {
                state:"Sel",labelId : "hdChannels_Tooltip"
            }
        ],
        disabled : false,
        buttonClass : "normal",
        appData : "SelectHDChannels",
		autoStateChange :	"false"
    };

    //Scan
    this._umpButtonConfigUSA["SelectScan"] =
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

    //Tune
    this._umpButtonConfigUSA["SelectTune"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpTune",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectTune"
    };

    //Tag
    this._umpButtonConfigUSA["SelectiTunesTagging"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpItunesTag",
        currentState:"Untagged",
        stateArray: [
            {
                state:"Untagged"
            },
            {
                state:"Tagged",labelId :"TagCaptured"
            }
        ],
        disabled : true,
        buttonClass : "normal",
        appData : "SelectiTunesTagging"
    };

    //SelectSeekPrevious
    this._umpButtonConfigUSA["SelectSeekPrevious"] =
    {
        buttonBehavior : "shortAndHold",
        imageBase : "IcnUmpPreviousAudio",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectSeekPrevious"
    };

    //SelectSeekNext
    this._umpButtonConfigUSA["SelectSeekNext"] =
    {
        buttonBehavior : "shortAndHold",
        imageBase : "IcnUmpNextAudio",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectSeekNext"
    };

    //Settings
    this._umpButtonConfigUSA["SelectSettings"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpEqualizer",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectSettings"
    };

    //Buttons config for Other
    this._umpButtonConfigOther = new Object();

    //Source
    this._umpButtonConfigOther["SelectSource"] = this._umpButtonConfigUSA["SelectSource"];

    //auto memory
    this._umpButtonConfigOther["SelectAutoMemory"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpAutoMem",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectAutoMemory"
    };

    //Favourites
    this._umpButtonConfigOther["SelectFavorites"] = this._umpButtonConfigUSA["SelectFavorites"];

    //Scan
    this._umpButtonConfigOther["SelectScan"] = this._umpButtonConfigUSA["SelectScan"];

    //Tune
    this._umpButtonConfigOther["SelectTune"] = this._umpButtonConfigUSA["SelectTune"];

    //SelectSeekPrevious
    this._umpButtonConfigOther["SelectSeekPrevious"] = this._umpButtonConfigUSA["SelectSeekPrevious"];

    //SelectSeekNext
    this._umpButtonConfigOther["SelectSeekNext"] =  this._umpButtonConfigUSA["SelectSeekNext"];

    //Settings
    this._umpButtonConfigOther["SelectSettings"] =  this._umpButtonConfigUSA["SelectSettings"];


    //Button configs for EU
    this._umpButtonConfigEU = new Object();

    //Source
    this._umpButtonConfigEU["SelectSource"] =  this._umpButtonConfigUSA["SelectSource"];

    //station List
    this._umpButtonConfigEU["SelectStationList"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpCurrentList",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectStationList"
    };

    //favorites
    this._umpButtonConfigEU["SelectFavorites"] = this._umpButtonConfigUSA["SelectFavorites"];

    //Scan
    this._umpButtonConfigEU["SelectScan"] = this._umpButtonConfigUSA["SelectScan"];

    //tune
    this._umpButtonConfigEU["SelectTune"] = this._umpButtonConfigUSA["SelectTune"];

    //TrafficAlert
    this._umpButtonConfigEU["SelectTrafficAlert"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpTrafficAlert",
        currentState:"Unsel",
        stateArray: [
            {
                state:"Unsel",labelId : "TrafficAlertOn"
            },
            {
                state:"Sel",labelId : "TrafficAlertOff"
            }
        ],
        disabled : false,
        buttonClass : "normal",
        appData : "SelectTrafficAlert",
    };

    //SelectSeekPrevious
    this._umpButtonConfigEU["SelectSeekPrevious"] = this._umpButtonConfigUSA["SelectSeekPrevious"];

    //SelectSeekNext
    this._umpButtonConfigEU["SelectSeekNext"] =  this._umpButtonConfigUSA["SelectSeekNext"];

    //Settings
    this._umpButtonConfigEU["SelectFMSettings"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpSettings",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectFMSettings",
        labelId : "Tooltip_IcnUmpFMSettings" //Changed the tooltip for FM Setting
    };
    //Settings
    this._umpButtonConfigEU["SelectSettings"] =  this._umpButtonConfigUSA["SelectSettings"];

    //Station data
    //@formatter:off
    this._stationListCtxtDataList = {
        itemCountKnown : true,
        itemCount : 1,
        vuiSupport : true,
        items: [
            { appData : { eventName : 'SelectChangeGenre' }, text1Id : "Genre"+this._cachedGenre, itemStyle : "style01", hasCaret:true},
        ]
    };

    // Button configs for USA
    this._umpButtonConfigGenreSeek = new Object();

    //Source
    this._umpButtonConfigGenreSeek["Global.GoBack"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpBack",
        disabled : false,
        buttonClass : "normal",
        appData : "Global.GoBack"
    };

    //ChangeGenre
    this._umpButtonConfigGenreSeek["SelectChangeGenre"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpGenre",
        buttonClass : "normal",
        appData : "SelectChangeGenre",
        disabled : false
    };

    this._umpButtonConfigGenreSeek["SelectSeekPrevious"] = this._umpButtonConfigUSA["SelectSeekPrevious"];
    this._umpButtonConfigGenreSeek["SelectSeekNext"] = this._umpButtonConfigUSA["SelectSeekNext"];

    //workaround : GenreList is not coming from MMUI , So Hardcoded in GUI
    //Genre data
    this._genreListCtxtDataList = {
        itemCountKnown : true,
        itemCount : 30,
        vuiSupport : true,
        items: [
            { appData : "SelectStationAll", text1Id : "AllStations", itemStyle : "style01", hasCaret:false},
            { appData : "SelectStationGenre", text1Id : "News", itemStyle : "style01", hasCaret:false ,index : 1},
            { appData : "SelectStationGenre", text1Id : "Affairs", itemStyle : "style01", hasCaret:false ,index : 2},
            { appData : "SelectStationGenre", text1Id : "Info", itemStyle : "style01", hasCaret:false ,index : 3},
            { appData : "SelectStationGenre", text1Id : "Sport", itemStyle : "style01", hasCaret:false ,index : 4},
            { appData : "SelectStationGenre", text1Id : "Education", itemStyle : "style01", hasCaret:false ,index : 5},
            { appData : "SelectStationGenre", text1Id : "Drama", itemStyle : "style01", hasCaret:false ,index : 6},
            { appData : "SelectStationGenre", text1Id : "Culture", itemStyle : "style01", hasCaret:false ,index : 7},
            { appData : "SelectStationGenre", text1Id : "Science", itemStyle : "style01", hasCaret:false ,index : 8},
            { appData : "SelectStationGenre", text1Id : "Varied", itemStyle : "style01", hasCaret:false ,index : 9},
            { appData : "SelectStationGenre", text1Id : "Pop", itemStyle : "style01", hasCaret:false ,index : 10},
            { appData : "SelectStationGenre", text1Id : "Rock", itemStyle : "style01", hasCaret:false ,index : 11},
            { appData : "SelectStationGenre", text1Id : "Mor", itemStyle : "style01", hasCaret:false ,index : 12},
            { appData : "SelectStationGenre", text1Id : "Light", itemStyle : "style01", hasCaret:false ,index : 13},
            { appData : "SelectStationGenre", text1Id : "Classics", itemStyle : "style01", hasCaret:false ,index : 14},
            { appData : "SelectStationGenre", text1Id : "Other", itemStyle : "style01", hasCaret:false ,index : 15},
            { appData : "SelectStationGenre", text1Id : "Weather", itemStyle : "style01", hasCaret:false ,index : 16},
            { appData : "SelectStationGenre", text1Id : "Finance", itemStyle : "style01", hasCaret:false ,index : 17},
            { appData : "SelectStationGenre", text1Id : "Childrens", itemStyle : "style01", hasCaret:false ,index : 18},
            { appData : "SelectStationGenre", text1Id : "Social", itemStyle : "style01", hasCaret:false ,index : 19},
            { appData : "SelectStationGenre", text1Id : "Religion", itemStyle : "style01", hasCaret:false ,index : 20},
            { appData : "SelectStationGenre", text1Id : "PhoneIn", itemStyle : "style01", hasCaret:false ,index : 21},
            { appData : "SelectStationGenre", text1Id : "Travel", itemStyle : "style01", hasCaret:false ,index : 22},
            { appData : "SelectStationGenre", text1Id : "Leisure", itemStyle : "style01", hasCaret:false ,index : 23},
            { appData : "SelectStationGenre", text1Id : "Jazz", itemStyle : "style01", hasCaret:false ,index : 24},
            { appData : "SelectStationGenre", text1Id : "Country", itemStyle : "style01", hasCaret:false ,index : 25},
            { appData : "SelectStationGenre", text1Id : "National", itemStyle : "style01", hasCaret:false ,index : 26},
            { appData : "SelectStationGenre", text1Id : "Oldies", itemStyle : "style01", hasCaret:false ,index : 27},
            { appData : "SelectStationGenre", text1Id : "Folk", itemStyle : "style01", hasCaret:false ,index : 28},
            { appData : "SelectStationGenre", text1Id : "Documentary", itemStyle : "style01", hasCaret:false ,index : 29}
        ]
    };
    
    this._rbds_genreListCtxtDataList = {
        itemCountKnown : true,
        itemCount : 28,
        vuiSupport : true,
        items: [
            { appData : "SelectStationAll", text1Id : "AllStations", itemStyle : "style01", hasCaret:false},
            { appData : "SelectStationGenre", text1Id : "rbds_News", itemStyle : "style01", hasCaret:false ,index : 1},
            { appData : "SelectStationGenre", text1Id : "rbds_Info", itemStyle : "style01", hasCaret:false ,index : 2},
            { appData : "SelectStationGenre", text1Id : "rbds_Sports", itemStyle : "style01", hasCaret:false ,index : 3},
            { appData : "SelectStationGenre", text1Id : "rbds_Talk", itemStyle : "style01", hasCaret:false ,index : 4},
            { appData : "SelectStationGenre", text1Id : "rbds_Rock", itemStyle : "style01", hasCaret:false ,index : 5},
            { appData : "SelectStationGenre", text1Id : "rbds_Class", itemStyle : "style01", hasCaret:false ,index : 6},
            { appData : "SelectStationGenre", text1Id : "rbds_Adult", itemStyle : "style01", hasCaret:false ,index : 7},
            { appData : "SelectStationGenre", text1Id : "rbds_SoftRock", itemStyle : "style01", hasCaret:false ,index : 8},
            { appData : "SelectStationGenre", text1Id : "rbds_Top40", itemStyle : "style01", hasCaret:false ,index : 9},
            { appData : "SelectStationGenre", text1Id : "rbds_Country", itemStyle : "style01", hasCaret:false ,index : 10},
            { appData : "SelectStationGenre", text1Id : "rbds_Oldies", itemStyle : "style01", hasCaret:false ,index : 11},
            { appData : "SelectStationGenre", text1Id : "rbds_Soft", itemStyle : "style01", hasCaret:false ,index : 12},
            { appData : "SelectStationGenre", text1Id : "rbds_Nostalgia", itemStyle : "style01", hasCaret:false ,index : 13},
            { appData : "SelectStationGenre", text1Id : "rbds_Jazz", itemStyle : "style01", hasCaret:false ,index : 14},
            { appData : "SelectStationGenre", text1Id : "rbds_Classical", itemStyle : "style01", hasCaret:false ,index : 15},
            { appData : "SelectStationGenre", text1Id : "rbds_Rhythym", itemStyle : "style01", hasCaret:false ,index : 16},
            { appData : "SelectStationGenre", text1Id : "rbds_SoftRB", itemStyle : "style01", hasCaret:false ,index : 17},
            { appData : "SelectStationGenre", text1Id : "rbds_Foreign", itemStyle : "style01", hasCaret:false ,index : 18},
            { appData : "SelectStationGenre", text1Id : "rbds_ReligousM", itemStyle : "style01", hasCaret:false ,index : 19},
            { appData : "SelectStationGenre", text1Id : "rbds_ReligousT", itemStyle : "style01", hasCaret:false ,index : 20},
            { appData : "SelectStationGenre", text1Id : "rbds_Personality", itemStyle : "style01", hasCaret:false ,index : 21},
            { appData : "SelectStationGenre", text1Id : "rbds_Public", itemStyle : "style01", hasCaret:false ,index : 22},
            { appData : "SelectStationGenre", text1Id : "rbds_College", itemStyle : "style01", hasCaret:false ,index : 23},
            { appData : "SelectStationGenre", text1Id : "rbds_Hablar", itemStyle : "style01", hasCaret:false ,index : 24},
            { appData : "SelectStationGenre", text1Id : "rbds_Musica", itemStyle : "style01", hasCaret:false ,index : 25},
            { appData : "SelectStationGenre", text1Id : "rbds_HipHop", itemStyle : "style01", hasCaret:false ,index : 26},
            { appData : "SelectStationGenre", text1Id : "rbds_Weather", itemStyle : "style01", hasCaret:false ,index : 29},
            //Commented as not needed to display the Test Genres
            //{ appData : "SelectStationGenre", text1Id : "rbds_EmergencyTest", itemStyle : "style01", hasCaret:false},
            //{ appData : "SelectStationGenre", text1Id : "rbds_Emergency", itemStyle : "style01", hasCaret:false},
        ]
    };

    //Auto memory list
     this._fmradioMemoryDataList = {
        itemCountKnown : true,
        itemCount : 2,
        vuiSupport : true,
        items: [
            { appData : {eventName : 'UpdateAutoMemory' }, text1Id : "UpdateStationList", itemStyle : "style01", hasCaret:false},
            { appData : {eventName : 'SelectGenreSeek' }, text1Id : "GenreSeek", itemStyle : "style01", hasCaret:false}
        ]
    };

    //Settings EU Datalist
    this._settingsEUDataList = {
        itemCountKnown : true,
        itemCount : 2,
        vuiSupport : true,
        items: [
            { appData : "AlternativeFrequency", text1Id : "AlternativeFrequency", itemStyle : "styleOnOff", hasCaret:false, value : 2 },
            { appData : "RegionLock", text1Id : "RegionLock", itemStyle : "styleOnOff", hasCaret:false, value : 2, disabled : true}
        ]
    };

    //HDChannels Datalist
    this._hdChannelsDataList = {
        itemCountKnown : true,
        itemCount : 1,
        vuiSupport : true,
        items: [
            { appData : {eventName : "HDRadio" }, text1Id : "HDRadio", itemStyle : "styleOnOff", hasCaret:false, value : 2 }
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
    this._TimedSbn_StatusBarStationInfoMsgHandler = this._TimedSbn_StatusBarStationInfoMsgHandler.bind(this);
    this._backBtnSelectCallbackBound = this._backBtnSelectCallback.bind(this);
    //@formatter:off
    this._contextTable = {
        //Nowplaying FM
        "NowPlaying" : {
            "template" : "NowPlaying4Tmplt",
            "sbNameId" : "FMRadio",
            "controlProperties" : {
                "NowPlayingCtrl" : {
                    "ctrlStyle" : "Style2",
                    "umpConfig" : {
                        "buttonConfig" : this._umpButtonConfigUSA,
                        "fullConfig"    : false,
                        "defaultSelectCallback" : this._umpDefaultSelectCallback.bind(this),
                        "defaultHoldStartCallback" : this._umpDefaultHoldStartCallback.bind(this),
                        "defaultHoldStopCallback" : this._umpDefaultHoldStopCallback.bind(this),
                        "defaultLongPressCallback" : this._umpDefaultLongPressCallback.bind(this),
                        "umpStyle" : "fullWidth",
                        "hasScrubber" : false,
                        "dataList" : null,
                        "title" : {
                            titleStyle : "oneLine"
                        },
                    }
                } // end of properties for "NowPlayingCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._FMNowPlayingCtxtTmpltDisplay.bind(this),
        },// end of NowPlaying
        //Tune
        "Tune" : {
            "template" : "Tuner4Tmplt",
            "sbNameId" : "FMRadio",
            "leftBtnStyle": "goBack",
            "controlProperties": {
                "Tuner4Ctrl" : {
                    "appData" : {TuneUp : "TuneUp" , TuneDown : "TuneDown"},
                    "region" : "NA",
                    "band" : "FM",
                    "stepCallback" : this._stepCallbackBound,
                    "holdStartCallback" : this._holdStartCallbackBound,
                    "holdStopCallback" : this._holdStopCallbackBound,
                    "hdSubstationChangeCallback" : this._hdSubstationChangeCallbackBound,
                    "backBtnSelectCallback" : this._backBtnSelectCallbackBound,
                    "centeredBtnSelectCallback" : this._centeredBtnSelectCallback.bind(this),
                    "centeredBtnLongPressCallback" : this._centeredBtnLongPressCallback.bind(this)
                }
            }, // end of list of controlProperties
            "readyFunction" :  this._TuneCtxtTmpltDisplay.bind(this),
            "contextInFunction" : this._TuneCtxtInFunction.bind(this),
            "displayedFunction": null
        }, //end of Tune
        "StationList" : {
            "template" : "List2Tmplt",
            "sbNameId" : "FMRadio",
            "leftBtnStyle": "goBack",
            "controlProperties" : {
                "List2Ctrl" : {
                    scrollTo : 0,
                    numberedList : true,
                    thickItems : false,
                    titleConfiguration : 'listTitle',
                    title : {
                        text1Id : "StationList",
                        titleStyle : "style02"
                    },
                    selectCallback : this._listItemClickCallback.bind(this),
                    needDataCallback : this._fmStationsNeedDataCallback.bind(this),
                    longPressCallback : this._listLongPressCallback.bind(this)
                } // end of properties for "ListCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._StationListCtxtTmpltReadyToDisplay.bind(this),
            "displayedFunction" : null
        }, // end of "StationList"
        "GenreList" : {
            "template" : "List2Tmplt",
            "sbNameId" : "FMRadio",
            "leftBtnStyle": "goBack",
            "controlProperties" : {
                "List2Ctrl" : {
                    dataList : this._genreListCtxtDataList,
                    titleConfiguration : 'listTitle',
                    title : {
                        text1Id : "GenreList",
                        titleStyle : "style02"
                    },
                    selectCallback : this._listItemClickCallback.bind(this)
                } // end of properties for "ListCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._GenreListCtxtTmpltReadyToDisplay.bind(this)
        }, // end of "GenreList"
        //Auto memory
        "AutoMemory" : {
            "template" : "List2Tmplt",
            "sbNameId" : "FMRadio",
            "leftBtnStyle": "goBack",
            "controlProperties" : {
                "List2Ctrl" : {
                    titleConfiguration : 'listTitle',
                    title : {
                        text1Id : "AutoMemoryList",
                        titleStyle : "style02"
                    },
                    selectCallback : this._listItemClickCallback.bind(this),
                    longPressCallback : this._listLongPressCallback.bind(this)
                } // end of properties for "ListCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._AutoMemoryCtxtTmpltReadyDisplay.bind(this),
             "contextInFunction" : this._AutoMemoryCtxtInTmplt.bind(this),
        },// end of "AutoMemory"
        //Settings
        "Settings" : {
            "template" : "List2Tmplt",
            "sbNameId" : "FMRadio",
            "leftBtnStyle": "goBack",
            "controlProperties" : {
                "List2Ctrl" : {
                    dataList : null,
                    titleConfiguration : 'listTitle',
                    title : {
                        text1Id : "FMSettings",
                        titleStyle : "style02"
                    },
                    selectCallback : this._listItemClickCallback.bind(this)
                } // end of properties for "ListCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._FMListCtxtTmpltReadyToDisplay.bind(this)
        },//end of "Settings"
        "HDChannels" : {
            "template" : "List2Tmplt",
            "sbNameId" : "FMRadio",
            "leftBtnStyle": "goBack",
            "controlProperties" : {
                "List2Ctrl" : {
                        dataList : this._hdChannelsDataList,
                        titleConfiguration : 'listTitle',
                        title : {
                            text1Id : "HDStations",
                            titleStyle : "style02"
                        },
                        selectCallback : this._listItemClickCallback.bind(this)
                } // end of properties for "ListCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._HDChannelsCtxtTmpltReadyToDisplay.bind(this)
        },//end of "HDChannels"
        //GenreSeek FM
        "GenreSeek" : {
            "template" : "NowPlaying4Tmplt",
            "sbNameId" : "GenreSeek",
            "leftBtnStyle": "goBack",
            "controlProperties" : {
                "NowPlayingCtrl" : {
                    "ctrlStyle" : "Style2",
                    "umpConfig" : {
                        "buttonConfig" : this._umpButtonConfigGenreSeek,
                        "fullConfig"    : false,
                        "defaultSelectCallback" : this._umpDefaultSelectCallback.bind(this),
                        "defaultHoldStartCallback" : this._umpDefaultHoldStartCallback.bind(this),
                        "defaultHoldStopCallback" : this._umpDefaultHoldStopCallback.bind(this),
                        "defaultLongPressCallback" : this._umpDefaultLongPressCallback.bind(this),
                        "umpStyle" : "fullWidth",
                        "hasScrubber" : false,
                        "dataList" : null,
                        title : {
                            titleStyle : "oneLine"
                        }
                    }
                } // end of properties for "NowPlayingCtrl"
            }, // end of list of controlProperties
            "contextInFunction" : this._FMGenreSeekCtxtInFunction.bind(this),
            "readyFunction" : this._FMGenreSeekCtxtTmpltReadyToDisplay.bind(this)
        },//end of "GenreSeek"
         "ChangeGenre" : {
            "template" : "List2Tmplt",
            "sbNameId" : "GenreSeek",
            "leftBtnStyle": "goBack",
            "controlProperties" : {
                "List2Ctrl" : {
                    dataList : this._rbds_genreListCtxtDataList,
                    titleConfiguration : 'listTitle',
                    title : {
                        text1Id : "ChangeGenre",
                        titleStyle : "style02"
                    },
                    selectCallback : this._listItemClickCallback.bind(this)
                } // end of properties for "ListCtrl"
            }, // end of list of controlProperties
            "contextInFunction" : this._ChangeGenreCtxtInFunction.bind(this),
            "readyFunction" : this._ChangeGenreCtxtTmpltReadyToDisplay.bind(this)
        }, // end of "ChangeGenre"
        "TADialog" : {
            "template" : "Dialog3Tmplt",
            "hideHomeBtn" : true,
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),
                    "contentStyle" : "style03",
                    "fullScreen" : false,
                    "buttonConfig" : {
                        "button1" : {
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            labelId: "TAOff",
                            appData : "SellectTurnOff",
                        },
                        "button2" : {
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            labelId: "common.Cancel",
                            appData : "Global.Cancel",
                        },
                        "button3" : {
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            labelId: "Close",
                            appData : "SelectClose",
                        }
                    }, // end of buttonConfig
                    "text1Id" : "TrafficAlert",
                    "imagePath1" : "common/images/icons/IcnDialogSpeaker.png"
                }
            },
            "readyFunction" : this._TADialogCtxtTmpltReadyToDisplay.bind(this),
        },// end of "TADialog"
        "TADialogAudio" : {
            "template" : "Dialog3Tmplt",
            "hideHomeBtn" : true,
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),
                    "contentStyle" : "style03",
                    "fullScreen" : false,
                    "buttonConfig" : {
                        "button2" : {
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            labelId: "common.Cancel",
                            appData : "Global.Cancel",
                        }
                    }, // end of buttonConfig
                    "text1Id" : "TrafficAlert",
                    "imagePath1" : "common/images/icons/IcnDialogSpeaker.png"
                }
            }
        }// end of "TADialogAudio"
    };// end of this.contextTable

    //@formatter:off
    this._messageTable = {
        "SettingStatus" : this._SettingStatusMsgHandler.bind(this),
        "RadioTunerStatus" : this._RadioTunerStatusMsgHandler.bind(this),
        "RegionInformation" : this._RegionInformationMsgHandler.bind(this),
        "MetaDataInformation" : this._MetaDataInfoMsgHandler.bind(this),
        "MetaDataArtInformation" : this._MetaDataArtInformationInfoMsgHandler.bind(this),
        "StationListStatusInfo" : this._RadioStationInfoMsgHandler.bind(this),
        "AutoMStatusInfo" : this._AutoMemStationFreqMsgHandler.bind(this),
        "PtyStatus" : this._PtyStatusMsgHandler.bind(this),
        "HDTunerStatusInfo" : this._HDTunerStatusMsgHandler.bind(this),
        "TaggingStates" : this._TaggingStatesMsgHandler.bind(this),
        "SelectFocusedStationAsFavorite" : this._SelectFocusedStationAsFavoriteMsgHandler.bind(this),
        "TimedSbn_StatusBarStationInfoAnalog" : this._TimedSbn_StatusBarStationInfoMsgHandler,
        "TimedSbn_StatusBarStationInfoHD" : this._TimedSbn_StatusBarStationInfoMsgHandler,
        "TimedSbn_TaggingStoreStatus" : this._TimedSbn_TaggingStoreStatusMsgHandler.bind(this),
        "MetaDataChangeNotification" : this._MetaDataChangeNotificationMsgHandler.bind(this),
        "ScanStatus" : this._ScanStatusMsgHandler.bind(this),
        "RADIO_4A_region_info" : this._RADIO_4A_region_infoMsgHandler.bind(this),
        "AutoMUpdateVUIEvent" : this._VUIAutoMUpdateInfoMsgHandler.bind(this),
        "HDVUIEvent" : this._HDVUIEventInfoMsgHandler.bind(this),
		"StartUserAction" : this._StartUserActionMsgHandler.bind(this),
    };// end of this._messageTable

    //@formatter:on
};

/**************************
 * Context handlers
 **************************/
// FM NowPlaying Template :
fmradioApp.prototype._FMNowPlayingCtxtTmpltDisplay = function()
{
    log.debug("fmradioApp _FMNowPlayingCtxtTmpltDisplay called...");
    if (this._currentContextTemplate)
    {
        //Clearing all the cached meta data
        this._cachedTrackTitle = null;
        this._cachedAlbumName = null;
        this._cachedArtistName = null;
        this._cachedMetadataGenre = null;
        this._cachedRadioText = null;
        this._cachedAlbumArtPath = null;
        this._contextTable.NowPlaying.controlProperties.NowPlayingCtrl.umpButtonConfig = this._getUMPConfig();
        this._setScanToggleUMPCtrl(this._currentContextTemplate,"Unsel");
        if (this._cachedRegion === "REGION_USA" && this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying")
        {
            this._setItunesButton(this._currentContextTemplate);
        }

        var status = 2;
        if(this._cachedOnOffStatus && this._cachedOnOffStatus.setting_mode)
        {
            // if status is missed in the message handler then by default it will take status as 2 (means "OFF")
            switch(this._cachedOnOffStatus.setting_mode)
            {
                case "ON" :
                    status = 1;
                    if(this._cachedRegion === "REGION_USA" && this._cachedOnOffStatus.setting_type === "HD_SETTING")
                    {
                        this._isHDOff = false;
                    }
                    break;
                case "OFF" :
                    status = 2;
                    if(this._cachedRegion === "REGION_USA"  && this._cachedOnOffStatus.setting_type === "HD_SETTING")
                    {
                        this._isHDOff = true;
                    }
                    break;
                case "NONE" :
                    // No need to change the button status
                    break;
                default :
                    break;
            }
        }
        if (this._cachedOnOffStatus && this._currentContextTemplate)
        {
            this._settingStatusFM(status);
        }

        var params = { "region": this._region };
        framework.sendRequestToDbapi(this.uiaId, this._getMetadataCallbackFn.bind(this), "radio", "FmNowPlayingMetadata", params);
    }
};

//TuneMenu Template
fmradioApp.prototype._TuneCtxtInFunction = function()
{
    log.debug("fmradioApp _TuneCtxtInFunction called...");
    var region = null;
    switch(this._cachedRegion)
    {
        case "REGION_OTHER" :
        case "REGION_USA" :
            region = "NA";
            break;
        case "REGION_EU" :
            region = "EU";
            break;
        case "REGION_JPN" :
            region = "JA";
            break;
        case "REGION_4A" :
            switch(this._cachedSubRegion4A)
            {
                case "REGION_AUSTRALIA" :
                    region = "ADR";
                    break;
                case "REGION_5K" :
                    region = "RW5k";
                    break;
                case "REGION_9K" :
                    region = "RW9k";
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
};
//TuneMenu Template
fmradioApp.prototype._TuneCtxtTmpltDisplay = function()
{
    log.debug("fmradioApp _TuneCtxtTmpltDisplay called...");
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "Tune")
    {
        this._populateTunerCtrl(this._currentContextTemplate);
    }
};

// FMRadio Station List Context
fmradioApp.prototype._StationListCtxtTmpltReadyToDisplay = function(params)
{
    log.debug("fmradioApp _StationListCtxtTmpltReadyToDisplay called...");
    if(this._currentContextTemplate && params && params.templateContextCapture && params.templateContextCapture.controlData && params.templateContextCapture.controlData.focussedItem !== null)
    {
        this._populateCachedStationList();
    }
    else
    {
        log.info("Waiting for Available Status for StationList");
    }
};

//auto memory template
fmradioApp.prototype._AutoMemoryCtxtInTmplt = function()
{
    log.info("Value of this._cachedRegion is = "+this._cachedRegion);
    if(this._cachedRegion !== "REGION_USA")// If the region is other then NA then "GenreSeek" wont be shown
    {
        this._fmradioMemoryDataList.itemCount = 1;
    }
    this._contextTable.AutoMemory.controlProperties.List2Ctrl.dataList = this._fmradioMemoryDataList;
};

//auto memory template
fmradioApp.prototype._AutoMemoryCtxtTmpltReadyDisplay = function()
{
    log.info("Value of this._cachedAutoMStatus is = "+this._cachedAutoMStatus +" , Value of this._currentOperationMode is = "+this._currentOperationMode);
    if(this._cachedAutoMStatus === "UPDATING" && this._currentOperationMode === "AUTO_M_MODE")
    {
        this._cachedAutoMStatus = "UPDATING"; //if this_currentOperationMode is AUTO_M_MODE then "this._cachedAutoMStatus" should be "UPDATING".
        this._populateAutoMemUpdatingStationListCtrl();
    }
    else
    {
        this._cachedAutoMStatus = "NONE";
        var params = {};
        log.info("Sending request to DBAPI for FmAutoMemoryList from AutoMemoryCtxtTmpltReadyDisplay...");
        framework.sendRequestToDbapi(this.uiaId, this._getAutoMemoryCallbackFn.bind(this), "radio", "FmAutoMemoryList", params);
    }
};

//Settings
//List context template
fmradioApp.prototype._FMListCtxtTmpltReadyToDisplay = function()
{
    if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "Settings" && (this._cachedRegion === "REGION_EU" || this._isEUTAURegion))
    {
        this._populateListCtrl(this._currentContextTemplate);
    }
};

// Genre List context
fmradioApp.prototype._GenreListCtxtTmpltReadyToDisplay = function()
{
    if (this._currentContextTemplate && this._currentContext &&
        ( this._currentContext.ctxtId === "GenreList" ))
    {
        log.debug("fmradioApp _GenreListCtxtTmpltReadyToDisplay called...");
        this._populateGenreListCtrl(this._currentContextTemplate);
    }
};

//Change Genre context
fmradioApp.prototype._ChangeGenreCtxtTmpltReadyToDisplay = function()
{
    if (this._currentContextTemplate && this._currentContext &&
        ( this._currentContext.ctxtId === "ChangeGenre" ))
    {
        log.debug("fmradioApp _ChangeGenreCtxtTmpltReadyToDisplay called...");
        this._populateChangeGenreListCtrl(this._currentContextTemplate);
    }
};

// FM HDChannels context
fmradioApp.prototype._HDChannelsCtxtTmpltReadyToDisplay = function(params)
{
    log.debug("fmradioApp _HDChannelsCtxtTmpltReadyToDisplay called...");
    if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "HDChannels")
    {
        if(this._isHDOff && this._cachedRegion === "REGION_USA")   //HD is off, HDchannels context will have one toggle button only
        {
            if(params && params.skipRestore !== null)
            {
                params.skipRestore = true;
            }
            this._resetingHDChannelDataList();
            this._populateListCtrl(this._currentContextTemplate);
        }
        else        // HD is on ,HDchannels context will have one toggle button with available HD channels
        {
            this._populateHDChannelsListCtrl(this._currentContextTemplate);
            if(this._hdChannelsDataList && this._hdChannelsDataList.itemCount)
            {
                if(params && params.templateContextCapture && params.templateContextCapture.controlData &&
                    params.templateContextCapture.controlData.focussedItem !== null)
                {
                    var focusedItem = params.templateContextCapture.controlData.focussedItem;
                    if((this._hdChannelsDataList.itemCount - 1 ) < (focusedItem ))
                    {
                        params.templateContextCapture.controlData.focussedItem = this._hdChannelsDataList.itemCount - 1 ;
                    }
                }
            }
        }
    }
};
// FM GenreSeek Template
fmradioApp.prototype._FMGenreSeekCtxtInFunction = function()
{
    this._contextTable.GenreSeek.controlProperties.NowPlayingCtrl.umpButtonConfig = this._umpButtonConfigGenreSeek;
};

// Genre List context
fmradioApp.prototype._FMGenreSeekCtxtTmpltReadyToDisplay = function()
{
    log.debug("fmradioApp _FMNowPlayingCtxtTmpltDisplay called...");
    if (this._currentContextTemplate)
    {
        //initialized button config according to the region
        this._UmpButtonConfig = this._umpButtonConfigGenreSeek;
        this._cachedTrackTitle = null;
        this._cachedAlbumName = null;
        this._cachedArtistName = null;
        this._cachedMetadataGenre = null;
        this._cachedRadioText = null;
        this._cachedAlbumArtPath = null;
        var params = { "region": this._region };
        framework.sendRequestToDbapi(this.uiaId, this._getMetadataCallbackFn.bind(this), "radio", "FmNowPlayingMetadata", params);
    }
};

// Change Genre context
fmradioApp.prototype._ChangeGenreCtxtInFunction = function()
{
    log.info("fmradioApp _FMNowPlayingCtxtTmpltDisplay called...");
    if(this._region === "NA")
    {
        this._contextTable.ChangeGenre.controlProperties.List2Ctrl.dataList = this._rbds_genreListCtxtDataList;
    }
    else
    {
        this._contextTable.ChangeGenre.controlProperties.List2Ctrl.dataList = this._genreListCtxtDataList;
    }
};

//TADialog and TADialogAudio
fmradioApp.prototype._TADialogCtxtTmpltReadyToDisplay = function()
{
    this._clearTADialogTimer();//If timer already running then clearing the TA timer
    var settleTATimeCallback = this._settleTATimeCallback.bind(this);
    this._settleTATimeOut = setTimeout(settleTATimeCallback, this._TADialogTimeout);//Timout added for 10 secs.
};

/**************************
 * Message handlers
 **************************/
//Display the Station Info in SBN
fmradioApp.prototype._TimedSbn_StatusBarStationInfoMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload)
    {
        var frequency = null;
        var subStationPlaying = null;
        var picode = 0;
        var psnName = null;
        if(msg.params.payload.Frequency && msg.params.payload.Frequency !== 0)
        {
            frequency = msg.params.payload.Frequency;
        }
        if(msg.params.payload.SubPlayingStation)
        {
            subStationPlaying = msg.params.payload.SubPlayingStation;
        }
        if(msg.params.payload.picode)
        {
            picode = msg.params.payload.picode;
        }
        if(msg.params.payload.StationName)
        {
            psnName = msg.params.payload.StationName;
            log.debug("PSN Received is "+psnName);
        }
		
		clearTimeout(this._freqTimerStartedSBN);
		this._freqTimerStartedSBN = null;
		
        // Current app is not "fmradio" and current context is not "NowPlaying" display the notification in SBN
        this._showFrequencySBN(frequency,picode,subStationPlaying,psnName);
    }
};

//Display the Tag in SBN
fmradioApp.prototype._TimedSbn_TaggingStoreStatusMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.tagging_store_status)
    {
        var status = msg.params.payload.tagging_store_status;
        // Current app is not "fmradio" and current context is not "NowPlaying" display the notification in SBN
        this._showTagSBN(status);
    }
};

//Get the radio station info from MMUI and cached the status.
fmradioApp.prototype._RadioStationInfoMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.StationListStatus )
    {
        //Get stations from DBAPI
        var status = msg.params.payload.StationListStatus;
        if(status === "AVAILABLE")
        {
            if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "StationList")
            {
                this._currentContextTemplate.list2Ctrl.focussedItem = 0;
                this._currentContextTemplate.list2Ctrl.dataList = null;
                var offset = Math.max(this._contextTable['StationList']['controlProperties']['List2Ctrl']['scrollTo'] - 10, 0);
                this._listNeedDataOffsetIndex = offset;
                //Get stations from DBAPI
                var params = {"genre":this._ptyGenreFormat, "region": this._region , index : this._listNeedDataOffsetIndex , limit : 20};
                framework.sendRequestToDbapi(this.uiaId, this._addItemsToList.bind(this), "radio", "FmStationList", params);
            }
        }
    }
};

//Get the auto memory station info from MMUI and cached the status.
fmradioApp.prototype._AutoMemStationFreqMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.AutoMStatus )
    {
        var status = msg.params.payload.AutoMStatus;
        if( this._updateAutoMRequest && status === "AVAILABLE")
        {
            this._updateAutoMRequest = false;
            //DBAPI interaction
            var params = {};
            framework.sendRequestToDbapi(this.uiaId, this._getAutoMemoryCallbackFn.bind(this), "radio", "FmAutoMemoryList", params);
        }
        else if (this._updateAutoMRequest && status !== "UPDATING")
        {
            this._populateAutoMemUpdateStationListCtrl(this._currentContextTemplate);
            this._updateAutoMRequest = false;
        }
        else if (status !== this._cachedAutoMStatus && status === "UPDATING")
        {
            this._populateAutoMemUpdatingStationListCtrl();
        }
        else
        {
            log.info(status +" message is ignorned!!");
        }
        this._cachedAutoMStatus = status;
    }
};

// Change the state of Tag Button.
fmradioApp.prototype._TaggingStatesMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.tagging_state)
    {
        this._cachedTaggingState = msg.params.payload.tagging_state;
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NowPlaying" )
        {
            this._setItunesButton(this._currentContextTemplate);
        }
    }
};

//Get the HD tuner status from MMUI and cached the status.
fmradioApp.prototype._HDTunerStatusMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.HDTunerStatus)
    {
        this._cachedHDTunerStatus = msg.params.payload.HDTunerStatus;
        this._prevTransmissionType = msg.params.payload.PrevTransmission_type;
        this._prevChannelType = msg.params.payload.PrevChannelType;
        //No error then populate the CurrentPlayingSPS in title of "NowPlaying".
        if(this._cachedHDTunerStatus && this._cachedHDTunerStatus.current_playing_sps && this._cachedHDTunerStatus.HD_radio_error === false)
        {
            
            log.info("prevChannelType is "+this._prevChannelType+" ,prevTransmissionType is "+this._prevTransmissionType
            +" ,Current channel_type is "+this._cachedHDTunerStatus.channel_type+" ,Current transmission_type is "+this._cachedHDTunerStatus.transmission_type);
            if(this._cachedHDTunerStatus.current_playing_sps !== "MAX")
            {
                this._cachedCurrentPlayingSPS = this._cachedHDTunerStatus.current_playing_sps;
            }
            if(this._cachedHDTunerStatus.available_sps)
            {
                this._storeHDStationsList();
            }
           if (((this._prevChannelType !== this._cachedHDTunerStatus.channel_type || this._prevTransmissionType !== this._cachedHDTunerStatus.transmission_type))
           || (this._cachedHDTunerStatus.channel_type === "DIGITAL_CHANNEL" && this._cachedHDTunerStatus.transmission_type === "DIGITAL_TRANSMISSION"))
           {
                this._isNowPlayingWeekHD = false;
                this._isNowPlayingHDLost = false;
                this._isNowPlayingHDAcquring = false;
                this._isHDLogoSupport = false;
                //check for requried screen like NowPlaying(WeekHD,SiganlLost,HD,Analog),Tune,HDChannels
                this._checkingRequiredScreen();
            }
            else
            {
                if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "NowPlaying")
                {
                    this._populateFMNowPlayingCtrl(this._currentContextTemplate);
                }
                else if (this._currentContext && this._currentContext.ctxtId === "Tune")
                {
                    this._populateTunerCtrl(this._currentContextTemplate);
                }
                else if (this._currentContext && this._currentContext.ctxtId === "HDChannels" && this._currentContextTemplate)
                {
                    if(this._isHDOff && this._cachedRegion === "REGION_USA")   //HD is off, HDchannels context will have one toggle button only
                    {
                        this._resetingHDChannelDataList();
                        this._populateListCtrl(this._currentContextTemplate);
                    }
                    else        // HD is on ,HDchannels context will have one toggle button with available HD channels
                    {
                        this._populateHDChannelsListCtrl(this._currentContextTemplate);
                        if(this._hdChannelsDataList && this._hdChannelsDataList.itemCount)
                        {
                            if(this._currentContextTemplate.list2Ctrl && this._currentContextTemplate.list2Ctrl.focussedItem !== null)
                            {
                                if((this._hdChannelsDataList.itemCount - 1 ) < (this._currentContextTemplate.list2Ctrl.focussedItem ))
                                {
                                    this._currentContextTemplate.list2Ctrl.focussedItem = this._hdChannelsDataList.itemCount - 1 ;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

fmradioApp.prototype._StartUserActionMsgHandler = function(msg)
{
	if (msg && msg.params && msg.params.payload)
	{
		this._userAction = msg.params.payload.UserAction;
		log.info("User action : "+this._userAction);
	}
}	

//Get the radio tuner status from MMUI and cached the status.
fmradioApp.prototype._RadioTunerStatusMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.radioTunerStatus)
    {
        
		if(msg.params.payload.radioTunerStatus.freq === -1)
		{
			this._isFreqCleared = true;
			if(this._cachedRadioDetails )
			{
				this._lastClearedFreq = this._cachedRadioDetails.freq;
				this._lastClearedStationName = this._cachedRadioDetails.stationName;
				
				this._cachedRadioDetails.freq = "";
				this._cachedRadioDetails.stationName = "";
			}
			if(this._currentContextTemplate && this._currentContext && (this._currentContext.ctxtId === "NowPlaying" || this._currentContext.ctxtId === "GenreSeek"))
			//this._populateFMNowPlayingCtrl(this._currentContextTemplate);
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
		
		//cleared SBN Freq if shown
		clearTimeout(this._freqTimerStartedSBN);
		this._freqTimerStartedSBN = null;
		
		var stepCount = 0;
		if(this._cachedRegion == "REGION_4A")
		{
			stepCount = this._stepCountData[this._cachedRegion][this._cachedSubRegion4A].stepInc;
		}
		else
		{
			stepCount = this._stepCountData[this._cachedRegion].stepInc;
		}
		this._stepCount = stepCount;
		
		if((this._currentOperationMode === "SCAN_UP_MODE" || this._currentOperationMode === "SEEK_UP_MODE" || this._currentOperationMode === "SEEK_DOWN_MODE") && this._cachedCurrentFreq)
		{
			var displayedFreq = this._cachedCurrentFreq;
			var newFreqRecived = this._cachedRadioDetails.freq;
			this._newFreqRecived = newFreqRecived;
			this._displayedFreq = displayedFreq;
			this._cachedCurrentFreq = this._cachedRadioDetails.freq;
			this._newFreqRecieved = this._cachedRadioDetails.freq;
			this._cachedTrackTitle = null;
			this._cachedAlbumName = null;
			this._cachedArtistName = null;
			this._cachedMetadataGenre = null;
			this._cachedRadioText = null;
			this._cachedAlbumArtPath = null;
			this._cachedSISData = null;
			
			if ( this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId )
			{
				switch (this._currentContext.ctxtId )
				{
					case "NowPlaying" :
					case "GenreSeek" :
						switch(this._cachedOperationMode)
						{
						 case "SEEK_UP_MODE":
						 case "SEEK_DOWN_MODE":
						 case "SCAN_UP_MODE":
						 case "SCAN_RECEIVE_MODE":
						 case "PTY_SEARCH_UP_MODE":
						 case "PTY_SEARCH_DOWN_MODE":
							switch(this._currentOperationMode)
							{
								case "SEEK_UP_MODE":
								case "SEEK_DOWN_MODE":
								case "SCAN_UP_MODE":
								case "SCAN_RECEIVE_MODE":
								case "PTY_SEARCH_UP_MODE":
								case "PTY_SEARCH_DOWN_MODE":
									//DO nothing
								break;
								default:
									this._cachedOperationMode = this._currentOperationMode;
									this._populateFMNowPlayingCtrl(this._currentContextTemplate);
								break;
							}
						 break;
						default:
							this._cachedOperationMode = this._currentOperationMode;
							this._populateFMNowPlayingCtrl(this._currentContextTemplate);
						 break;                     
						}
						break;
					case "Tune" :
						if(!this._isAFOn)
						{
							this._populateTunerCtrl(this._currentContextTemplate);
						}
						else 
						{
							if(true == this._userAction)
							{
								this._populateTunerCtrl(this._currentContextTemplate);
							}
							else
							{
								log.info("AF on but UserAction false");
							}
						}
						break;
					default :
						break;
				}
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
					this._cachedTrackTitle = null;
					this._cachedAlbumName = null;
					this._cachedArtistName = null;
					this._cachedMetadataGenre = null;
					this._cachedRadioText = null;
					this._cachedAlbumArtPath = null;
					this._cachedSISData = null;
				}
			}
			// Update control if context is bound to a template
			if ( this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId )
			{
				switch (this._currentContext.ctxtId )
				{
					case "NowPlaying" :
					case "GenreSeek" :
						switch(this._cachedOperationMode)
						{
						 case "SEEK_UP_MODE":
						 case "SEEK_DOWN_MODE":
						 case "SCAN_UP_MODE":
						 case "SCAN_RECEIVE_MODE":
						 case "PTY_SEARCH_UP_MODE":
						 case "PTY_SEARCH_DOWN_MODE":
							switch(this._currentOperationMode)
							{
								case "SEEK_UP_MODE":
								case "SEEK_DOWN_MODE":
								case "SCAN_UP_MODE":
								case "SCAN_RECEIVE_MODE":
								case "PTY_SEARCH_UP_MODE":
								case "PTY_SEARCH_DOWN_MODE":
									this._cachedOperationMode = this._currentOperationMode;
									this._populateFreqNowPlayingCtrl(this._currentContextTemplate);
								break;
								default:
									this._cachedOperationMode = this._currentOperationMode;
									this._populateFMNowPlayingCtrl(this._currentContextTemplate);
								break;
							}
						 break;
						default:
							this._cachedOperationMode = this._currentOperationMode;
							this._populateFMNowPlayingCtrl(this._currentContextTemplate);
						 break;                     
						}
						break;
					case "Tune" :
						if(!this._isAFOn )
                    	{
                        	this._populateTunerCtrl(this._currentContextTemplate);
                    	}
						else 
						{
							if(true == this._userAction)
							{
								this._populateTunerCtrl(this._currentContextTemplate);
							}
							else
							{
								log.info("AF on but UserAction false");
							}
						}
						break;
					default :
						break;
				}
			}
		}
    }
};

//Get the toggle button status from MMUI and cached the status.And according to the msg recieved
//update the button status in GUI by calling "this._populateListCtrl" method
fmradioApp.prototype._SettingStatusMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload)
    {
        this._cachedOnOffStatus = msg.params.payload;
        var status = 2;
        if(this._cachedOnOffStatus && this._cachedOnOffStatus.setting_mode)
        {
            // if status is missed in the message handler then by default it will take status as 2 (means "OFF")
            switch(this._cachedOnOffStatus.setting_mode)
            {
                case "ON" :
                    status = 1;
                    if(this._cachedRegion === "REGION_USA" && this._cachedOnOffStatus.setting_type === "HD_SETTING")
                    {
                        this._isHDOff = false;
                    }
                    break;
                case "OFF" :
                    status = 2;
                    if(this._cachedRegion === "REGION_USA" && this._cachedOnOffStatus.setting_type === "HD_SETTING")
                    {
                        this._isHDOff = true;
                    }
                    break;
                case "NONE" :
                    // No need to change the button status
                    break;
                default :
                    break;
            }
        }
        if (this._cachedOnOffStatus)
        {
            this._settingStatusFM(status);
        }
    }
};

//Get the region info  from MMUI and cached the status.
fmradioApp.prototype._RegionInformationMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload)
    {
        this._cachedRegionInfo = msg.params.payload;
        if(this._cachedRegionInfo.region && this._cachedRegionInfo.region !== this._cachedRegion && this._cachedRegionInfo.region !== "REGION_4A") //If region is 4A then wait for sub-region 
        {
            //set the button config in nowplaying according to the region received from MMUI
            this._setButtonConfig();
        }
    }
};

//Get the meta data  info  from MMUI and changed  info  from MMUI and call to dbapi to get data from DB.
fmradioApp.prototype._MetaDataInfoMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.metaDataStatus && msg.params.payload.metaDataStatus !== "NONE" )
    {
        this._cachedUpdatedMetaData = msg.params.payload.metaDataStatus;
        var params = { "region": this._region };
        framework.sendRequestToDbapi(this.uiaId, this._getUpdatedMetadataCallbackFn.bind(this), "radio", "FmNowPlayingMetadata",params);
    }
};

//Get the Album Art and Station Logo changed  info  from MMUI and call to dbapi to get data from DB.
fmradioApp.prototype._MetaDataArtInformationInfoMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && ( msg.params.payload.metaDataArtInfo !== "DISPLAY_NONE" &&
        msg.params.payload.metaDataArtInfo !== "DISPLAY_CLEAR"))
    {
        //clearing the meta data
        this._cachedAlbumArtPath = null;
        var params = { "region": this._region };
        framework.sendRequestToDbapi(this.uiaId, this._getMetadataArtInformationCallbackFn.bind(this), "radio", "FmNowPlayingMetadata",params);
    }
    else if(msg && msg.params && msg.params.payload && msg.params.payload.metaDataArtInfo === "DISPLAY_CLEAR")
    {
        this._cachedAlbumArtPath = "";
        if (this._currentContext && this._currentContextTemplate && (this._currentContext.ctxtId === "NowPlaying" || this._currentContext.ctxtId === "GenreSeek"))
        {
            this._updateAlbumArtNowPlayingCtrl(this._currentContextTemplate);
        }
    }
};

//Clear metadata from Screen.
fmradioApp.prototype._MetaDataChangeNotificationMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.metaDataChangeNote)
    {
        this._cachedChangedMetaData = msg.params.payload.metaDataChangeNote;
        if(this._cachedChangedMetaData.Radio_metadata_psd_sis_changed === true)
        {
            this._cachedSISData = null;
        }
        if(this._cachedChangedMetaData.Radio_metadata_psd_track_changed === true)
        {
            this._cachedTrackTitle = null;
        }
        if(this._cachedChangedMetaData.Radio_metadata_psd_artist_changed === true)
        {
            this._cachedArtistName = null;
        }
        if(this._cachedChangedMetaData.Radio_metadata_psd_genre_changed === true)
        {
            this._cachedMetadataGenre = null;
        }
        if(this._cachedChangedMetaData.Radio_metadata_psd_album_changed === true)
        {
            this._cachedAlbumName = null;
        }
        if(this._cachedChangedMetaData.Radio_metadata_rds_pty_changed === true)
        {
            this._cachedMetadataGenre = null;
        }
        if(this._cachedChangedMetaData.Radio_metadata_rds_text_changed === true)
        {
            this._cachedRadioText = null;
        }
        if (this._currentContext && this._currentContextTemplate && (this._currentContext.ctxtId === "NowPlaying" || this._currentContext.ctxtId === "GenreSeek"))
        {
            this._populateFMNowPlayingCtrl(this._currentContextTemplate);
        }
    }
};

//Get the pty msg info from MMUI and cached the status.
fmradioApp.prototype._PtyStatusMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload)
    {
        this._cachedPtyInfo = msg.params.payload;

        // cached the pty
        this._storePtyInfo();
    }
};

//msg info from MMUI to Send details of focused item to MMUI .
fmradioApp.prototype._SelectFocusedStationAsFavoriteMsgHandler = function(msg)
{
    if (this._currentContextTemplate && this._currentContextTemplate.list2Ctrl)
    {
        var focussedItem = null;
        var topItem = null;
        var stationList = null;
        var frequency = null;
        var stationName = null;
        var eventName = null;
        var piCode = null;
        if(this._currentContextTemplate.list2Ctrl.focussedItem != null )
        {
            focussedItem = this._currentContextTemplate.list2Ctrl.focussedItem;
        }
        if(this._currentContextTemplate.list2Ctrl.topItem != null)
        {
            topItem = this._currentContextTemplate.list2Ctrl.topItem;
        }
        if(this._currentContextTemplate.list2Ctrl.dataList)
        {
            stationList = this._currentContextTemplate.list2Ctrl.dataList;
        }
        if(stationList.items[focussedItem] && stationList.items[focussedItem].appData)
        {
            if(stationList.items[focussedItem].appData.frequency)
            {
                frequency = stationList.items[focussedItem].appData.frequency;
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
        if ( focussedItem != null )
        {
		
			switch(eventName) {
			case "SelectStationName":
				framework.sendEventToMmui(this.uiaId, "SelectFavoritesStation" ,
					{payload:{radioData: { stationType : "FM", frequency : frequency, stationName : stationName, PICode : piCode, HDSPS : "SPS_NONE", satRadioData : null }}},true);
				break;
			case "UpdateAutoMemory":
				framework.sendEventToMmui(this.uiaId, "NoFavoriteSelected" , {payload:{}},true);
				break;
			case "SelectGenreSeek":
				log.debug("Do nothing");
				break;
			default:
				log.info("Defaulted for focussed item[" + eventName + "]") ;
				break;
			}

        }
    }
};

//Scan Status message received from MMUI
fmradioApp.prototype._ScanStatusMsgHandler = function(msg)
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
            this._setScanToggleUMPCtrl(this._currentContextTemplate,scanSel_Unsel);
        }
    }
};

//Sub region info for 4A Region message received from MMUI
fmradioApp.prototype._RADIO_4A_region_infoMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.subRegion4AInfo)
    {
        if(msg.params.payload.subRegion4AInfo !== this._cachedSubRegion4A)
        {
            this._cachedSubRegion4A = msg.params.payload.subRegion4AInfo;
            //set the button config in nowplaying according to the region received from MMUI
            this._setButtonConfig();
        }
    }
};

//VUI for Automemory
fmradioApp.prototype._VUIAutoMUpdateInfoMsgHandler = function()
{
    if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "AutoMemory")
    {
        this._populateAutoMemUpdatingStationListCtrl();
    }
};

//VUI for Automemory
fmradioApp.prototype._HDVUIEventInfoMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.HD_mode)
    {
        var hdMode = msg.params.payload.HD_mode;
        switch(hdMode)
        {
            case "ON" :
                if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "HDChannels")
                {
                    this._populateHDChannelsListCtrl(this._currentContextTemplate);
                }
                break;
            case "OFF" :
                this._resetingHDChannelDataList();
                this._populateListCtrl(this._currentContextTemplate);
                break;
            default:
                this._resetingHDChannelDataList();
                this._populateListCtrl(this._currentContextTemplate);
                break;
        }
    }
};
/**************************
 * Control callbacks
 **************************/
// Callback notification from the Tuner4 control that the user has pressed the back button
fmradioApp.prototype._backBtnSelectCallback = function(tunerRef, appData, params)
{
    log.info(" testtuner4App._backBtnSelectCallback : ");
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
fmradioApp.prototype._centeredBtnSelectCallback = function(tunerRef, appData, params)
{
    log.info(" testtuner4App._centeredBtnSelectCallback : ");
    framework.sendEventToMmui(this.uiaId, "StationFrequencyShortPress");
};

/*
 * Callback from Tuner4Ctrl Centre dial is Long pressed.
 */

fmradioApp.prototype._centeredBtnLongPressCallback = function(tunerRef, appData, params)
{
    log.info(" testtuner4App._centeredBtnLongPressCallback : ");
    framework.sendEventToMmui("common", "Global.AddToFavorites");
};
 /*
 * Callback from Tuner4Ctrl Tune button is clicked.
 */
fmradioApp.prototype._stepCallback = function(tunerRef, appData, params)
{
    log.info(" testtuner4App._stepCallback      : " + params.direction + " " + params.stepCount + " to frequency " + params.frequency);
    if(params && params.direction)
    {
        var stepParams = {};
        var frequency = null;
        if(params.frequency)
        {
            frequency = params.frequency;
        }
        if(params.stepCount !== null)
        {
            stepParams = { payload : { "stepCount" : params.stepCount , "HD_ON" : false, "FMHDSpsNo":"SPS_NONE","FMFrequency": frequency}};
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
};

/*
 * Callback from Tuner4Ctrl Tune button is clicked.
 */
fmradioApp.prototype._holdStartCallback = function(tunerRef, appData, params)
{
    log.info(" testtuner4App._holdStartCallback      : " + params.direction + " " + params.stepCount + " to frequency " + params.frequency);
    var stepParams = {};
    var frequency = null;
    if(params.frequency)
    {
        frequency = params.frequency;
    }
    if(params.stepCount !== null)
    {
        stepParams = { payload : { "stepCount" : 1 , "HD_ON" : false, "FMHDSpsNo":"SPS_NONE","FMFrequency": frequency}};
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
};

/*
 * Callback from Tuner4Ctrl Tune button is clicked.
 */
fmradioApp.prototype._holdStopCallback = function(tunerRef, appData, params)
{
    log.info(" testtuner4App._holdStopCallback   : " + params.direction + " " + params.stepCount + " to frequency " + params.frequency);
    if(params && params.direction)
    {
        var stepParams = {};
        var frequency = null;
        if(params.frequency)
        {
            frequency = params.frequency;
        }
        if(params.stepCount !== null)
        {
            stepParams = { payload : { "stepCount" : params.stepCount , "HD_ON" : false,"FMHDSpsNo":"SPS_NONE","FMFrequency":frequency}};
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
};
/*
 * Callback from Tuner4Ctrl when a HD is playing Tune button is clicked.
 */
fmradioApp.prototype._hdSubstationChangeCallback = function(tunerRef, appData, params)
{
    log.info(" testtuner4App._hdSubstationChangeCallback : " + params.direction + " to frequency " + params.frequency + " and substation " + params.substation);
    if(params && params.direction)
    {
        var stepParams = {};
        var frequency = null;
        var fmHDSps = null;
        if(params.frequency)
        {
            frequency = params.frequency;
        }
        if(params.substation)
        {
            if(params.substation === 1)
            {
                fmHDSps = "SPS_NONE";
            }
            else
            {
                fmHDSps = "SPS"+(params.substation - 1);
            }
            stepParams = { payload : { stepCount : 1 , "HD_ON" : true, FMFrequency : frequency , FMHDSpsNo :fmHDSps}};
            this._currentContextTemplate.tuner4Ctrl.setActiveHdSubstation(params.substation);
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
};

/*
 * Callback from Dialog3Ctrl when a button is clicked.
 */
fmradioApp.prototype._dialogDefaultSelectCallback = function(buttonRef, appData, params)
{
   log.debug("DialogDefaultSelectCallback  called...", buttonRef, appData, params);
   //User does selection on TADialog screen, clearing the TA timer
   this._clearTADialogTimer();//If timer already running then clearing the TA timer
   switch(appData)
   {
        case "Global.Cancel" :
            framework.sendEventToMmui("common", appData);
            break;
        default :
            framework.sendEventToMmui(this.uiaId, appData);
            break;
   }
};

// List Control Callback
fmradioApp.prototype._listItemClickCallback = function(listCtrlObj, appData, params)
{
    log.debug("_listItemClickCallback called...");
    var itemIndex = params.itemIndex;
    log.debug("   for context" + this._currentContext.ctxtId);
    var extraData = params.additionalData;
    var vuiFlag = false;
    if (params && params.fromVui)
    {
        vuiFlag = true;
    }
    switch(this._currentContext.ctxtId)
    {
        case "StationList" :
            var stationId = null;
            var stationName = null;
            var piCode = null;
            var params = null;
            if (appData.eventName === "SelectStationName")
            {
                frequency = appData.frequency;
                piCode = appData.piCode;
                stationName = appData.stationName
                var hdSpsNo = "SPS_NONE";
                if( this._cachedRegion === "REGION_USA" && this._cachedCurrentPlayingSPS)
                {
                    hdSpsNo = this._cachedCurrentPlayingSPS;
                }
                params = {
                    payload :
                    {
                        FMStationName : stationName ,
                        FMStationData :
                        {
                            FMFrequency : frequency ,
                            FMPiCode : piCode,
                            FMHDSpsNo : "SPS_NONE"
                        }
                    }
                };
            }
            framework.sendEventToMmui(this.uiaId, appData.eventName, params, vuiFlag);
            break;
        //automemory list callback
        case "AutoMemory" :
            var stationId = null;
            var stationName = null;
            var params = null;
            var piCode = null;
            var hdSpsNo = "SPS_NONE";
            if( this._cachedRegion === "REGION_USA" && this._cachedCurrentPlayingSPS)
            {
                hdSpsNo = this._cachedCurrentPlayingSPS;
            }
            if (appData.eventName === "SelectStationName")
            {
                stationId = appData.frequency;
                piCode = appData.piCode;
                stationName = appData.stationName;
                //params is available only for  "SelectStationName" appData.
                params = {
                    payload :
                    {
                        FMStationName : stationName ,
                        FMStationData :
                        {
                            FMFrequency : stationId ,
                            FMPiCode : piCode,
                            FMHDSpsNo : "SPS_NONE"
                        }
                    }
                };
            }
            else if (appData.eventName === "UpdateAutoMemory")
            {
                if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "AutoMemory")
                {
                    this._populateAutoMemUpdatingStationListCtrl();
                }
                this._cachedAutoMStatus = "UPDATING";
            }
            framework.sendEventToMmui(this.uiaId, appData.eventName, params, vuiFlag);
            break;
        case "GenreList" :
        case "ChangeGenre" :
          var params = null;
          var index = null;
          if(this._currentContext.ctxtId == "GenreList")
              index = this._tempgenreList.items[itemIndex].index;
          else if(this._currentContext.ctxtId == "ChangeGenre")
              index = this._rbds_genreListCtxtDataList.items[itemIndex].index;
          if (appData === "SelectStationGenre")
          {
              params = {
                      payload :
                      {
                          genreName : index
                      }
                  };
          }
          framework.sendEventToMmui(this.uiaId, appData, params, vuiFlag);
          break;
        case "TuneMenu" :
            var params = null;
            framework.sendEventToMmui(this.uiaId, appData, params, vuiFlag);
            break;
        case "Settings" :
            var eventId = appData;
            switch(appData)
            {
                case "AlternativeFrequency" :
                    if (extraData == 1)
                    {
                        eventId = "TurnOnAF";
                        this._cachedOnOffStatus = {"setting_type":"AF_SETTING","setting_mode":"ON"}; // Setting the AF to ON 
                        this._isAFOn = true;// this can be checked at Tuner Scale::The Tuner needle should not update if AF is ON
                        this._settingsEUDataList.items[1].disabled = false;
                    }
                    else
                    {
                        eventId = "TurnOffAF";
                        this._cachedOnOffStatus = {"setting_type":"AF_SETTING","setting_mode":"OFF"}; // Setting the AF to OFF
                        this._isAFOn = false;// this can be checked at Tuner Scale::The Tuner needle should not update if AF is ON
                        this._settingsEUDataList.items[1].disabled = true;
                    }
                    if (this._cachedRegion === "REGION_EU" || this._isEUTAURegion)
                    {
                        this._populateListCtrl(this._currentContextTemplate);
                    }
                    break;
                case "RegionLock" :
                    if (extraData == 1)
                    {
                        eventId = "TurnOnREG";
                        this._cachedOnOffStatus = {"setting_type":"REG_SETTING","setting_mode":"ON"}; // Setting the REG to ON
                    }
                    else
                    {
                        eventId = "TurnOffREG";
                        this._cachedOnOffStatus = {"setting_type":"REG_SETTING","setting_mode":"OFF"}; // Setting the REG to OFF
                    }
                    if (this._cachedRegion === "REGION_EU" || this._isEUTAURegion)
                    {
                        this._populateListCtrl(this._currentContextTemplate);
                    }
                    break;
                default :
                    break;
            }
            var params = null;
            framework.sendEventToMmui(this.uiaId, eventId, params, vuiFlag);
            break;
        case "HDChannels" :
            switch(appData.eventName)
            {
                case "HDRadio" :
                    var extradata = params.additionalData;
                    this._resetingHDChannelDataList();
                    if(extradata === 1)
                    {
                        var params = null;
                        framework.sendEventToMmui(this.uiaId, "SelectHDRadioOn", params, vuiFlag);
                        if(this._currentContext && this._currentContext.ctxtId === "HDChannels")
                        {
                            this._populateHDChannelsListCtrl(this._currentContextTemplate);
                        }
                    }
                    else if(extradata === 2)
                    {
                        var params = null;
                        framework.sendEventToMmui(this.uiaId, "SelectHDRadioOff", params, vuiFlag);
                        if(this._currentContext && this._currentContext.ctxtId === "HDChannels")
                        {
                            this._populateListCtrl(this._currentContextTemplate);
                        }
                    }
                    break;
                case "SelectHDChannel" :
                    var stationID = appData.hdChannel;
                    var frequency = null;
                    var picode = 0;
                    if(stationID === "MPS")
                    {
                        stationID = "SPS_NONE";
                    }
                    if(this._cachedRadioDetails)
                    {
                        if (this._cachedRadioDetails.freq)
                        {
                            frequency = this._cachedRadioDetails.freq;
                        }
                        if (this._cachedRadioDetails.picode)
                        {
                            picode = this._cachedRadioDetails.picode;
                        }
                    }
                    framework.sendEventToMmui(this.uiaId, "SelectHDChannel",{payload:{FMStationData : {FMFrequency : frequency, FMPiCode : picode, FMHDSpsNo : stationID}}}, vuiFlag);
                    break;
            }
            break;
        case "TADialog" :
            var params = null;
            framework.sendEventToMmui(this.uiaId, appData, params, vuiFlag);
            break;
        default:
            log.warn("FMRadioApp: Unknown context");
            break;
    }
};

//List Long press callback
fmradioApp.prototype._listLongPressCallback = function(listCtrlObj, appData, params)
{
    log.debug('_ListLongPressCallback called...', listCtrlObj, appData, params);
    switch(this._currentContext.ctxtId)
    {
        case "StationList" :
        case "AutoMemory" :
            var piCode = appData.piCode;
            var stationName = appData.stationName;
            var frequency = appData.frequency;
            framework.sendEventToMmui(this.uiaId, "SelectFavoritesStation" ,
                {payload:{radioData: { stationType : "FM", frequency : frequency, stationName : stationName, PICode : piCode, HDSPS : "SPS_NONE", satRadioData : null }}});
            break;
        default :
            break;
    }
};

//UMP control for selected button
fmradioApp.prototype._umpDefaultSelectCallback = function(ctrlObj, appData, params)
{
    log.debug("fmradioApp _umpDefaultSelectCallback called..."+appData);
    if(this._UmpButtonConfig[appData] && this._UmpButtonConfig[appData].disabled !== null)
    {
        var buttonStatus = this._UmpButtonConfig[appData].disabled;
    }
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
			//so no need to set the button state in the dafault select callback
            //this._setScanToggleUMPCtrl(this._currentContextTemplate,nextStateOfScan);
        }
    }
    //check for the UMP button whether it is clickable or not
    if (!buttonStatus)
    {
        log.debug("event sent ,buttonStatus =  "+buttonStatus);
        switch(appData)
        {
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
            case "SelectTrafficAlert" :
                if(this._umpButtonConfigEU["SelectTrafficAlert"].currentState === "Sel")
                {
                    framework.sendEventToMmui(this.uiaId, "SelectTrafficAlertOn");
                    this._cachedOnOffStatus = {"setting_type":"TA_SETTING","setting_mode":"ON"}; // Setting the TA to ON
                }
                else
                {
                    framework.sendEventToMmui(this.uiaId, "SelectTrafficAlertOff");
                    this._cachedOnOffStatus = {"setting_type":"TA_SETTING","setting_mode":"OFF"}; // Setting the TA to OFF
                }
                break;
            case "Global.GoBack" :
                framework.sendEventToMmui("common", appData);
                break;
            case "SelectHDChannels" :
                if(this._cachedRegion === "REGION_USA")
                {
                    var hdCurrentState = null;
                    if(params && params.state)
                    {
                        hdCurrentState = params.state;
                    }
                    var hdEvent = null;
                    framework.sendEventToMmui(this.uiaId, appData);
                }
                break;
            default:
                framework.sendEventToMmui(this.uiaId, appData);
                break;
        }
    }
};

//long press of button Start
fmradioApp.prototype._umpDefaultHoldStartCallback = function(ctrlObj, appData, params)
{
    log.debug("fmradioApp _umpDefaultHoldStartCallback called...");
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
fmradioApp.prototype._umpDefaultHoldStopCallback = function(ctrlObj, appData, params)
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
fmradioApp.prototype._umpDefaultLongPressCallback = function(ctrlObj, appData, params)
{
    log.debug("fmradioApp _umpDefaultLongPressCallback called...");
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
//helper functions HDAcquiring screen
fmradioApp.prototype._showHDAcquirng = function()
{
    //Display Week HD Screens
    if(this._cachedCurrentPlayingSPS === "SPS_NONE" && !this._isHDOff && this._cachedHDTunerStatus && this._cachedHDTunerStatus.transmission_type === "ANALOG_TRANSMISSION" && this._cachedHDTunerStatus.channel_type === "DIGITAL_CHANNEL")
    {
        this._isNowPlayingHDAcquring = true;
        this._isHDLogoSupport = true;
        log.info("inside _HDTunerStatusMsgHandler (Current HDAcquring : USA WEEK HD SCREEN After 10 Secs), this._isHDLogoSupport value changed to "+this._isHDLogoSupport);
        if(!this._timerStarted)
        {
            var populateWeekHDFunction = this._populateWeekHDNowPlayingCtrl.bind(this);
            this._timerStarted = setTimeout(populateWeekHDFunction,10000);
        }
    }
    //Display HD SubstationLost
    else if(this._cachedCurrentPlayingSPS !== "SPS_NONE" && !this._isHDOff && this._cachedHDTunerStatus.transmission_type === "ANALOG_TRANSMISSION" && this._cachedHDTunerStatus.channel_type === "DIGITAL_CHANNEL")
    {
        this._isNowPlayingHDAcquring = true;
        this._isHDLogoSupport = true;
        log.info("inside _HDTunerStatusMsgHandler (Current HDAcquring : USA HD Lost SCREEN After 10 Secs), this._isHDLogoSupport value changed to "+this._isHDLogoSupport);
        if(!this._timerStarted)
        {
            var populateHDLostFunction = this._populateHDLostNowPlayingCtrl.bind(this);
            this._timerStarted = setTimeout(populateHDLostFunction,10000);
        }
    }
    this._populateHDAcquiringNowPlayingCtrl();
};

//set Scan UMP Button Light ON/ Light OFF
fmradioApp.prototype._setScanToggleUMPCtrl = function(tmplt,state)
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
};

//set TA UMP Button Light ON/ Light OFF
fmradioApp.prototype._setTAToggleUMPCtrl = function(tmplt,state)
{
    if(tmplt && this._currentContext && this._currentContext.ctxtId === "NowPlaying")
    {
        if(this._cachedTAState !== state) //Check previous TA state. If changed then set the tool tip
        {
            tmplt.nowPlaying4Ctrl.umpCtrl.setButtonState("SelectTrafficAlert",state);
        }
        this._cachedTAState = state; //Cached the current state
    }
};

//set HD UMP Button Light ON/ Light OFF
fmradioApp.prototype._setHDToggleUMPCtrl = function(tmplt)
{
    if(tmplt && this._currentContext && this._currentContext.ctxtId === "NowPlaying" && this._cachedRegion === "REGION_USA")
    {
       var hdState = "Unsel";
       if(this._isHDOff)
        {
            hdState = "Unsel";
        }
        else
        {
            hdState = "Sel";
        }
        if(this._cachedHDState !== hdState)
        {
            tmplt.nowPlaying4Ctrl.umpCtrl.setButtonState("SelectHDChannels",hdState);
        }
        this._cachedHDState = hdState;
    }
};

//set itunes UMP Button
fmradioApp.prototype._setiTunesUMPCtrl = function(tmplt,state,isDisabled)
{
    if(tmplt && this._currentContext && this._currentContext.ctxtId === "NowPlaying" && this._cachedRegion === "REGION_USA")
    {
        this._cachediTunesState = { state : state, isDisabled : isDisabled };
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
                tmplt.nowPlaying4Ctrl.umpCtrl.setButtonDisabled("SelectiTunesTagging",isDisabled);
                break;
        }
    }
};

fmradioApp.prototype._populateTunerCtrl = function(tmplt)
{
     var hdConfigObj = null;
    if(this._cachedRadioDetails && this._cachedRadioDetails.freq)
    {
        var frequency = this._cachedRadioDetails.freq;
        log.debug("inside _populateTunerCtrl : this._isHDLogoSupport = "+this._isHDLogoSupport);
        if(this._hdSubstList && this._isHDLogoSupport)
        {
            if(this._cachedRegion === "REGION_USA" && this._isHDOff === false && !(this._isNowPlayingWeekHD || this._isNowPlayingHDLost || this._isNowPlayingHDAcquring))
            {
                hdConfigObj = {"hdStatus":"Locked","hdSubstList":this._hdSubstList};
            }
            else if (this._cachedRegion === "REGION_USA" && this._isHDOff === false)
            {
                hdConfigObj = {"hdStatus":"NoLock","hdSubstList":this._hdSubstList};
            }
            else
            {
                hdConfigObj = {"hdStatus":"Disabled","hdSubstList":this._hdSubstList};
            }
			if(tmplt)
			{
				tmplt.tuner4Ctrl.setFrequency(frequency,hdConfigObj);
			}            
        }
        else
        {
            hdConfigObj = {"hdStatus":"Disabled","hdSubstList":0};
			if(tmplt)
			{
				tmplt.tuner4Ctrl.setFrequency(frequency,hdConfigObj);
			}            
        }
    }

};

//Populate Now playing control
fmradioApp.prototype._populateFMNowPlayingCtrl = function(tmplt)
{
    if(!this._isHDOff && this._isNowPlayingWeekHD && this._cachedRegion === "REGION_USA")
    {
        this._populateWeekHDNowPlayingCtrl();
    }
    else if(!this._isHDOff && this._isNowPlayingHDLost && this._cachedRegion === "REGION_USA")
    {
        this._populateHDLostNowPlayingCtrl();
    }
    else if(!this._isHDOff && this._isNowPlayingHDAcquring && this._cachedRegion === "REGION_USA")
    {
        this._populateHDAcquiringNowPlayingCtrl();
    }
    else
    {
        var audioTitle = null;
        var artist = null;
        var album = null;
        var genre = null;
        var stationName = null;
        var frequency = null;
        var currentRegion = this._cachedRegion;
        var controlConfigObj = new Object();
        if(!this._isHDOff && this._cachedAlbumArtPath)
        {
            controlConfigObj["artworkImagePath"] = this._cachedAlbumArtPath;
        }
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
                frequency = this._frequencyFormatting(frequency);
            }
        }
        // initialising with space so that if any of these value will be missed from MMUI ,
        //then it will not display any message(null/undefined) in GUI
        if(!frequency)
        {
            frequency = "";
        }
        if(!stationName)
        {
            stationName = "";
        }

        if(this._cachedRegion === "REGION_USA" && this._isHDOff === false && this._cachedSISData)
        {
            stationName = this._cachedSISData;
        }
        if(this._currentContext && this._currentContext.ctxtId === "GenreSeek") // prototype metadata display for GenreSeek will always similar to USA
        {
            currentRegion = "GenreSeek";
        }
        switch(currentRegion)
        {
            case "REGION_OTHER" :
            case "REGION_JPN" :                       
                controlConfigObj.fullConfig = false;
                controlConfigObj.ctrlStyle = "Style2";
                controlConfigObj["ctrlTitleObj"] =
                {
                    "ctrlTitleId"    : null,
                    "ctrlTitleText"  : frequency + " " + stationName,
                    "ctrlTitleIcon"  :null
                };
                break;
            case "REGION_USA" :
				var currentPlayingSPS = "";
				
                audioTitle = this._cachedTrackTitle;
                artist = this._cachedArtistName;
                album = this._cachedAlbumName;
                if(!this._isHDOff)
                {
                    log.info("inside _populateNowPlayingCtrl Region USA : this._isHDLogoSupport = "+this._isHDLogoSupport);
                    if(this._hdSubstList && this._isHDLogoSupport)
                    {
                        currentPlayingSPS = this._spsToHD(this._cachedCurrentPlayingSPS);
						log.info(currentPlayingSPS);
						controlConfigObj["hdConfigObj"] =
                        {
                            "hdStatus"   : "Locked",
                            "hdSubstList"     : this._hdSubstList,
                        };
                    }
                }
                if(!this._isHDOff && (audioTitle || artist || album || this._isHDLogoSupport))
                {
                    controlConfigObj.fullConfig = true;
                    controlConfigObj.ctrlStyle = "Style2";
                    controlConfigObj["audioTitleObj"] =
                    {
                        "audioTitleId"   : null,
                        "audioTitleText" : audioTitle,
                        "audioTitleIcon" : "common/images/icons/IcnListEntNowPlaying_En.png"
                    };
                    controlConfigObj["detailLine1Obj"] =
                    {
                        "detailTextId"   : null,
                        "detailText"     : artist,
                        "detailIcon"     : "common/images/icons/IcnListContact_Placeholder.png"
                    };
                    controlConfigObj["detailLine2Obj"] =
                    {
                        "detailTextId"   : null,
                        "detailText"     : album,
                        "detailIcon"     : "common/images/icons/IcnListCdPlayer_En.png"
                     };
                }
                else
                {
                    controlConfigObj.fullConfig = false;
                    controlConfigObj.ctrlStyle = "Style2";
                    audioTitle = this._cachedRadioText;
                    controlConfigObj["imagePath"] = null;
                    controlConfigObj["audioTitleObj"] =
                    {
                        "audioTitleId"   : null,
                        "audioTitleText" : audioTitle,
                        "audioTitleIcon" : " "
                    };
                    if(this._cachedMetadataGenre)
                    {
                        // Genre : None will not be shown in screen because before actual station got flashed genre None always comes from DBAPI which cause flicker
                        if(this._cachedMetadataGenre === "TBD" || this._currentOperationMode !== "NORMAL_MODE" || this._cachedMetadataGenre === "None")
                        {
                            genre = null;
                        }
                        else
                        {
                            genre = "rbds_genre_"+this._cachedMetadataGenre;
                        }
                    }
                    controlConfigObj["detailLine1Obj"] =
                    {
                        "detailTextId"   : genre,
                        "detailText"     : null,
                        "detailIcon"     : " "
                    };
                }
                controlConfigObj["ctrlTitleObj"] =
                {
                    "ctrlTitleId"    : null,
                    "ctrlTitleText"  : frequency + " " + stationName+" "+currentPlayingSPS,
                    "ctrlTitleIcon"  :null
                };
                break;
            case "REGION_EU" :
            case "REGION_CHINATAIWAN" :
            case "REGION_4A" : 
                if(this._isEUTAURegion)
                {
                    var controlTitle = "";
                    controlConfigObj.fullConfig = false;
                    controlConfigObj.ctrlStyle = "Style3";
                    audioTitle = this._cachedRadioText;
                    controlConfigObj["audioTitleObj"] =
                    {
                        "audioTitleId"   : null,
                        "audioTitleText" : audioTitle,
                        "audioTitleIcon" : null
                    };
                    if(this._cachedMetadataGenre)
                    {
                        if(this._cachedMetadataGenre === "TBD" || this._currentOperationMode !== "NORMAL_MODE" || this._cachedMetadataGenre === "None")
                        {
                            genre = null;
                        }
                        else
                        {
                            var genreIndex = utility.getArrayItemByPropertyValue(this._ptyRDSText.dbapiGenre,"dbapiAppData",this._cachedMetadataGenre);
                            if(genreIndex && genreIndex.index !== null)
                            {
                                var rdsGenre = this._genreListCtxtDataList.items[genreIndex.index].text1Id;
                                genre = "Genre"+rdsGenre;
                            }
                            
                        }
                        controlConfigObj["detailLine1Obj"] =
                        {
                            "detailTextId"   : genre,
                            "detailText"     : null,
                            "detailIcon"     : null
                         };
                    }
                    controlConfigObj["imagePath"] = null;
                    if(stationName)
                    {
                        controlTitle = stationName;
                    }
                    else
                    {
                        controlTitle = frequency;
                    }
                    controlConfigObj["ctrlTitleObj"] =
                    {
                        "ctrlTitleId"    : null,
                        "ctrlTitleText"  : controlTitle,
                        "ctrlTitleIcon"  :null
                    };
                }
                else
                {
                     controlConfigObj.fullConfig = false;
                     controlConfigObj.ctrlStyle = "Style2";
                     controlConfigObj["ctrlTitleObj"] =
                     {
                         "ctrlTitleId"    : null,
                         "ctrlTitleText"  : frequency + " " + stationName,
                         "ctrlTitleIcon"  :null
                     };
                }
                break;
            case "GenreSeek" :
                controlConfigObj.fullConfig = true;
                controlConfigObj.ctrlStyle = "Style2";
                audioTitle = this._cachedTrackTitle;
                controlConfigObj["imagePath"] = null;
                controlConfigObj["audioTitleObj"] =
                {
                    "audioTitleId"   : null,
                    "audioTitleText" : audioTitle,
                    "audioTitleIcon" : "common/images/icons/IcnListEntNowPlaying_En.png"
                };
                artist = this._cachedArtistName;
                controlConfigObj["detailLine1Obj"] =
                {
                    "detailTextId"   : null,
                    "detailText"     : artist,
                    "detailIcon"     : "common/images/icons/IcnListContact_Placeholder.png"
                 };
                album = this._cachedAlbumName;
                controlConfigObj["detailLine2Obj"] =
                {
                    "detailTextId"   : null,
                    "detailText"     : album,
                    "detailIcon"     : "common/images/icons/IcnListCdPlayer_En.png"
                 };

                controlConfigObj["ctrlTitleObj"] =
                {
                    "ctrlTitleId"    : null,
                    "ctrlTitleText"  : frequency + " " + stationName,
                    "ctrlTitleIcon"  :null
                };
                break;
            default :
                controlConfigObj.fullConfig = false;
                controlConfigObj.ctrlStyle = "Style2";
                controlConfigObj["ctrlTitleObj"] =
                {
                    "ctrlTitleId"    : null,
                    "ctrlTitleText"  : frequency + " " + stationName,
                    "ctrlTitleIcon"  :null
                };
                controlConfigObj["imagePath"] = null;
                break;
        }
        log.info("HD is set to ON(true)/OFF(false) : "+!this._isHDOff+" and HD Logo Visible : "+this._isHDLogoSupport
            +" , FirstLineText : "+audioTitle+", SecondLineText(artist) : "+artist+" / SecondLineText(Genre) : " +genre+ " , ThirdLineText : "+album
            +" , Title Text (if Region is US): "+frequency + " " + stationName+" / Title Text (if Region is EU): "+controlTitle);
        this._setHDToggleUMPCtrl(tmplt);
        if (this._currentContext && this._currentContext.ctxtId === "NowPlaying" && (this._cachedRegion === "REGION_EU" || this._isEUTAURegion))
        {
            this._setTAToggleUMPCtrl(this._currentContextTemplate,this._TAState);
        }
		
		//Current operation Mode is SEEK or SCAN and dont update the NowPlaying Screen
		if(!(this._currentOperationMode === "SCAN_UP_MODE" || this._currentOperationMode === "SEEK_UP_MODE" || this._currentOperationMode === "SEEK_DOWN_MODE"))
		{
			if(this._currentContext && (this._currentContext.ctxtId === "NowPlaying" || this._currentContext.ctxtId === "GenreSeek"))
			{
				if(this._currentOperationMode !== "AUTO_M_MODE") 
				{ 
					tmplt.nowPlaying4Ctrl.setNowPlayingConfig(controlConfigObj);
				} 
			}
		}
		else
		{
			log.info("Current operation mode is seek or scan so blocked freq is "+frequency);
		}
    }
};

//return current_playing_sps in HD format
fmradioApp.prototype._spsToHD = function(sps)
{
    var spsHDFormat = null;
    switch(sps)
    {
        case "SPS_NONE":
            spsHDFormat = "HD1";
            break;
        case "SPS1":
            spsHDFormat = "HD2";
            break;
        case "SPS2":
            spsHDFormat = "HD3";
            break;
        case "SPS3":
            spsHDFormat = "HD4";
            break;
        case "SPS4":
            spsHDFormat = "HD5";
            break;
        case "SPS5":
            spsHDFormat = "HD6";
            break;
        case "SPS6":
            spsHDFormat = "HD7";
            break;
        case "SPS7":
            spsHDFormat = "HD8";
            break;
        default:
            break;
    }
    return spsHDFormat;
};

//Populate WeekHD Now playing control
fmradioApp.prototype._populateWeekHDNowPlayingCtrl = function()
{
    this._isNowPlayingWeekHD = true;
    var frequency = null;
    var controlConfigObj = new Object();
    //shows the metadata information along with the title
    if (this._cachedRadioDetails)
    {
        if (this._cachedRadioDetails.freq)
        {
            frequency = this._cachedRadioDetails.freq;
            frequency = this._frequencyFormatting(frequency);
        }
    }
    // initialising with space so that if any of these value will be missed from MMUI ,
    //then it will not display any message(null/undefined) in GUI
    if(!frequency)
    {
        frequency = "";
    }

    controlConfigObj.fullConfig = false;
    controlConfigObj.ctrlStyle = "Style2";
    controlConfigObj["ctrlTitleObj"] =
    {
        "ctrlTitleId"    : null,
        "ctrlTitleText"  : frequency,
        "ctrlTitleIcon"  :null
    };
    log.info("Week HD Screen , isHDLogoSupport = "+this._isHDLogoSupport);
	if(this._hdSubstList && this._isHDLogoSupport)
    {
        controlConfigObj["hdConfigObj"] =
        {
            "hdStatus"    : "NoLock",
            "hdSubstList"  : this._hdSubstList,
        };
    }
	
    if(this._currentContext && this._currentContext.ctxtId === "NowPlaying" && this._currentContextTemplate && this._cachedRegion === "REGION_USA")
    {
        if(this._cachediTunesState && this._cachediTunesState.state !== "Untagged" && this._cachediTunesState.isDisabled !== true)
        {
            this._setiTunesUMPCtrl(this._currentContextTemplate,"Untagged",true);
        }
        this._setHDToggleUMPCtrl(this._currentContextTemplate);
		if(this._currentOperationMode !== "AUTO_M_MODE") 
        { 
            this._currentContextTemplate.nowPlaying4Ctrl.setNowPlayingConfig(controlConfigObj);
        } 
        clearTimeout(this._timerStarted);
        this._timerStarted = null;
    }
};

//Populate HD Lost Now playing control
fmradioApp.prototype._populateHDLostNowPlayingCtrl = function()
{
    this._isNowPlayingHDLost = true;
	var currentPlayingSPS = "";
	var frequency = null;
    var controlConfigObj = new Object();
    //shows the metadata information along with the title
    if (this._cachedRadioDetails)
    {
        if (this._cachedRadioDetails.freq)
        {
            frequency = this._cachedRadioDetails.freq;
            frequency = this._frequencyFormatting(frequency);
        }
    }
    // initialising with space so that if any of these value will be missed from MMUI ,
    //then it will not display any message(null/undefined) in GUI
    if(!frequency)
    {
        frequency = "";
    }

	if(this._cachedCurrentPlayingSPS)
	{
		currentPlayingSPS = this._spsToHD(this._cachedCurrentPlayingSPS);
	}
	
    controlConfigObj.fullConfig = false;
    controlConfigObj.ctrlStyle = "Style2";
    controlConfigObj["ctrlTitleObj"] =
    {
        "ctrlTitleId"    : null,
        "ctrlTitleText"  : frequency+" "+currentPlayingSPS,
        "ctrlTitleIcon"  :null
    };
	
    controlConfigObj["audioTitleObj"] =
    {
        "audioTitleId"   : "SignalLost",
        "audioTitleText" : null,
        "audioTitleIcon" : " ",//No title image needed for  HD Lost Screen
    };
    log.info("HDLost Screen, Region USA , isHDLogoSupport::"+this._isHDLogoSupport);
	if(this._hdSubstList && this._isHDLogoSupport)
    {
        controlConfigObj["hdConfigObj"] =
        {
            "hdStatus"    : "NoLock",
            "hdSubstList"  : this._hdSubstList,
        };
    }
	
    if(this._currentContext && this._currentContext.ctxtId === "NowPlaying" && this._currentContextTemplate && this._cachedRegion === "REGION_USA")
    {
        if(this._cachediTunesState && this._cachediTunesState.state !== "Untagged" && this._cachediTunesState.isDisabled !== true)
        {
            this._setiTunesUMPCtrl(this._currentContextTemplate,"Untagged",true);
        }
        this._setHDToggleUMPCtrl(this._currentContextTemplate);
		if(this._currentOperationMode !== "AUTO_M_MODE") 
        { 
            this._currentContextTemplate.nowPlaying4Ctrl.setNowPlayingConfig(controlConfigObj);
        } 
        clearTimeout(this._timerStarted);
        this._timerStarted = null;
    }
};

//Display HDAquaring Screen for 10 secs before showing WeekHD or HDLost Screen
fmradioApp.prototype._populateHDAcquiringNowPlayingCtrl = function()
{
    var frequency = null;
    var controlConfigObj = new Object();
    //shows the metadata information along with the title
    if (this._cachedRadioDetails)
    {
        if (this._cachedRadioDetails.freq)
        {
            frequency = this._cachedRadioDetails.freq;
            frequency = this._frequencyFormatting(frequency);
        }
    }
    // initialising with space so that if any of these value will be missed from MMUI ,
    //then it will not display any message(null/undefined) in GUI
    if(!frequency)
    {
        frequency = "";
    }

    controlConfigObj.fullConfig = false;
    controlConfigObj.ctrlStyle = "Style2";
    controlConfigObj["ctrlTitleObj"] =
    {
        "ctrlTitleId"    : null,
        "ctrlTitleText"  : frequency,
        "ctrlTitleIcon"  :null
    };
    log.info("HDAcquring Screen, isHDLogoSupport = "+this._isHDLogoSupport);
    if(this._hdSubstList && this._isHDLogoSupport)
    {
        controlConfigObj["hdConfigObj"] =
        {
            "hdStatus"    : "NoLock",
            "hdSubstList"  : this._hdSubstList,
        };
    }
    if(this._currentContext && this._currentContext.ctxtId === "NowPlaying" && this._currentContextTemplate && this._cachedRegion === "REGION_USA")
    {
        if(this._cachediTunesState && (this._cachediTunesState.state !== "Untagged" || this._cachediTunesState.isDisabled !== true))
        {
            this._setiTunesUMPCtrl(this._currentContextTemplate,"Untagged",true);
        }
        this._setHDToggleUMPCtrl(this._currentContextTemplate);
		if(this._currentOperationMode !== "AUTO_M_MODE") 
        { 
            this._currentContextTemplate.nowPlaying4Ctrl.setNowPlayingConfig(controlConfigObj);
        } 
    }
};

//setting Itunes UMP according to the states
fmradioApp.prototype._setItunesButton = function(tmplt)
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
    }
    if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "NowPlaying" && !this._isHDOff)
    {
        if(this._cachediTunesState && (this._cachediTunesState.state !== state || this._cachediTunesState.isDisabled !== isDisabled))
        {
            this._setiTunesUMPCtrl(this._currentContextTemplate,state,isDisabled);
        }
    }
};


//AutoMemory UpdateStationList control
fmradioApp.prototype._populateAutoMemUpdateStationListCtrl = function(tmplt)
{
    var stations = null;
    var stationPiCodeInfo = null;
    var listTotalCount = null;
    var frequency = null;
    var frequencyAppData = null;

    if(this._cachedAutoMemoryList && this._cachedAutoMemoryList.eCode == 0 && this._cachedAutoMemoryList.totalCount > 0)
    {
        listTotalCount = this._cachedAutoMemoryList.totalCount;
        var dataList =
        {
            itemCountKnown : true,
            itemCount : listTotalCount + 2,
            vuiSupport : true
        };
        var items = new Array();
        this._fmradioMemoryDataList.items[0].text1Id = "UpdateStationList";
        this._fmradioMemoryDataList.items[0].itemStyle = "style01";
        
        if(this._cachedRegion !== "REGION_USA")// If the region is other then NA then "GenreSeek" wont be shown
        {
            this._fmradioMemoryDataList.itemCount = 1;
            dataList.itemCount = listTotalCount + 1;
        }
        else
        {
            this._fmradioMemoryDataList.itemCount = 2;
            this._fmradioMemoryDataList.items[1].text1Id = "GenreSeek";
            this._fmradioMemoryDataList.items[1].disabled = false;
            dataList.itemCount = listTotalCount + 2;
        }
        items = this._fmradioMemoryDataList.items;

        for(var i = 0 ; i < listTotalCount ; i++)
        {
            if(this._cachedAutoMemoryList.autoMemoryList[i].frequency)
            {
                frequency = this._cachedAutoMemoryList.autoMemoryList[i].frequency;
                frequencyAppData = frequency;
                frequency = this._frequencyFormatting(frequency);
            }
            if(this._cachedAutoMemoryList.autoMemoryList[i].piCode)
            {
                stationPiCodeInfo = this._cachedAutoMemoryList.autoMemoryList[i].piCode;
            }
            if(this._cachedAutoMemoryList.autoMemoryList[i].stationName)
            {
                stations = this._cachedAutoMemoryList.autoMemoryList[i].stationName;
            }
            items[i + this._fmradioMemoryDataList.itemCount] =
            {
                appData : { eventName : 'SelectStationName', piCode : stationPiCodeInfo , frequency : frequencyAppData , stationName : stations},
                text1 : frequency,
                itemStyle : "style01",
                hasCaret:false,
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
            itemCount : 3,
            vuiSupport : true
        };
        var items = new Array();
        this._fmradioMemoryDataList.items[0].text1Id = "UpdateStationList";
        this._fmradioMemoryDataList.items[0].itemStyle = "style01";
        
       if(this._cachedRegion !== "REGION_USA")// If the region is other then NA then "GenreSeek" wont be shown
        {
            dataList.itemCount = 2;
        }
        else
        {
            dataList.itemCount = 3;
            this._fmradioMemoryDataList.items[1].text1Id = "GenreSeek";
            this._fmradioMemoryDataList.items[1].disabled = false;
        }
        items = this._fmradioMemoryDataList.items;
        items[dataList.itemCount - 1] =
        {
            text1Id : "Noresultsfound",
            itemStyle : "style01",
            hasCaret:false,
            disabled : true
        };
    }
    dataList.items = items;
    this._fmradioMemoryDataList = dataList;
    if(tmplt && tmplt.list2Ctrl && this._currentContext && this._currentContext.ctxtId === "AutoMemory")
    {
        tmplt.list2Ctrl.setDataList(dataList);
        tmplt.list2Ctrl.updateItems(0, dataList.itemCount - 1);
    }
};

//AutoMemory displays updating List with progress bar
fmradioApp.prototype._populateAutoMemUpdatingStationListCtrl = function()
{
    this._resetingAutoMemoryCtxDataList();
    this._updateAutoMRequest  = true;
    if(this._currentContextTemplate && this._currentContextTemplate.list2Ctrl && this._currentContext && this._currentContext.ctxtId === "AutoMemory")
    {
        this._currentContextTemplate.list2Ctrl.setDataList(this._fmradioMemoryDataList);
        this._currentContextTemplate.list2Ctrl.focussedItem = 0;
        var length = this._fmradioMemoryDataList.itemCount;
        this._currentContextTemplate.list2Ctrl.updateItems(0, length - 1);
    }
};

//populate Settings List Control
fmradioApp.prototype._populateListCtrl = function(tmplt)
{
    //initialize the local variables
    var listLength = 0;
    var region = this._cachedRegion;
    var dataList = null;

    //according to the cached region , setting the "dataList" and "listLength" and populating the "Settings" context
    switch(region)
    {
        case "REGION_EU" :
        case "REGION_CHINATAIWAN" :
        case "REGION_4A" :
            if(this._isEUTAURegion)
            {
                dataList = this._settingsEUDataList;
                listLength = (this._settingsEUDataList.itemCount);
            }
            break;
        case "REGION_USA":
            if(tmplt && tmplt.list2Ctrl)
            {
                tmplt.list2Ctrl.focussedItem = 0;
            }
            dataList = this._hdChannelsDataList;
            listLength = (this._hdChannelsDataList.itemCount);
            break;
        default :
            break;
    }
    if(tmplt && tmplt.list2Ctrl)
    {
        tmplt.list2Ctrl.setDataList(dataList);
        tmplt.list2Ctrl.updateItems(0, listLength - 1);
    }
};


//populate the HDChannels List
fmradioApp.prototype._populateHDChannelsListCtrl = function(tmplt)
{
    var hdChannel = null;
    var sps = null;
    this._hdChannelsDataList = null; // initialising as null to get and store new available HD Channels List
    var items = new Array();
    var dataList = null;
    if(this._hdSubstList)
    {
        var listLength = 1;

        if(listLength > 0)
        {
            var hdChannelStateArray = new Array();
            items[0] =
            {
                appData : {eventName : "HDRadio" },
                text1Id : "HDRadio",
                itemStyle : "styleOnOff",
                hasCaret:false,
                value : 1
            };

            for(var i in this._hdSubstList)
            {
                var hdChannelState = this._hdSubstList[i];
                var hdString = "HD";
                var subHD = (parseInt(i) + 1 );
                switch(hdChannelState)
                {
                    case "Active":
                    case "Inactive":
                        hdChannelStateArray.push(hdString+subHD);
                        break;
                    case "Unavailable":
                        break;
                    default:
                        break;
                }
            }
            listLength = hdChannelStateArray.length + 1;
            for (var i = 0; i < hdChannelStateArray.length; i++)
            {
                var hdChannel = hdChannelStateArray[i];
                if(hdChannel)
                {
                    switch(hdChannel)
                    {
                        case "HD1":
                            sps = "SPS_NONE";
                            break;
                        case "HD2":
                            sps = "SPS1";
                            break;
                        case "HD3":
                            sps = "SPS2";
                            break;
                        case "HD4":
                            sps = "SPS3";
                            break;
                        case "HD5":
                            sps = "SPS4";
                            break;
                        case "HD6":
                            sps = "SPS5";
                            break;
                        case "HD7":
                            sps = "SPS6";
                            break;
                        case "HD8":
                            sps = "SPS7";
                            break;
                        default:
                            break;
                    }
                    items[i+1] =
                    {
                        appData : { eventName : 'SelectHDChannel', hdChannel : sps },
                        text1 : hdChannel,
                        itemStyle : "style01",
                        hasCaret:false
                    };
                }
            }
            dataList =
            {
                itemCountKnown : true,
                vuiSupport : true,
                itemCount : listLength
            };

        }

    }
    else
    {
        listLength = 1;
        dataList =
        {
            itemCountKnown : true,
            vuiSupport : true,
            itemCount : listLength
        };
        items[0] =
        {
            appData : {eventName : "HDRadio" },
            text1Id : "HDRadio",
            itemStyle : "styleOnOff",
            hasCaret:false,
            value : 1
        };
    }
    dataList.items = items;
    this._hdChannelsDataList = dataList;
    if(tmplt)
    {
        tmplt.list2Ctrl.setDataList(dataList);
        tmplt.list2Ctrl.updateItems(0, listLength - 1);
    }
};

//helper function for FM setting screen
fmradioApp.prototype._settingStatusFM = function(status)
{
    if(this._cachedOnOffStatus && this._cachedOnOffStatus.setting_type)
    {
        switch(this._cachedOnOffStatus.setting_type)
        {
            case "HD_SETTING" :
                this._resetingHDChannelDataList();
                var hdToggleState = null;
                if(status === 2)  //HD is off
                {
                    if(this._cachediTunesState && (this._cachediTunesState.state !== "Untagged" || this._cachediTunesState.isDisabled !== true))
                    {
                        this._setiTunesUMPCtrl(this._currentContextTemplate,"Untagged",this._isHDOff);
                    }
                    hdToggleState = "Unsel";
                }
                else //HD is on
                {
                    hdToggleState = "Sel";
                }
                //check for requried screen like NowPlaying(WeekHD,SiganlLost,HD,Analog),Tune,HDChannels
                this._checkingRequiredScreen();
                break;
            case "AF_SETTING" :
                this._settingsEUDataList.items[0].value = status;
                if(status === 2)
                {
                    this._isAFOn = false;// this can be checked at Tuner Scale::The Tuner needle should not update if AF is ON
                    this._settingsEUDataList.items[1].disabled = true;
                }
                else
                {
                    this._isAFOn = true;// this can be checked at Tuner Scale::The Tuner needle should not update if AF is ON
                    this._settingsEUDataList.items[1].disabled = false;
                }
                if (this._currentContext && this._currentContext.ctxtId === "Settings" && (this._cachedRegion === "REGION_EU" || this._isEUTAURegion))
                {
                    this._populateListCtrl(this._currentContextTemplate);
                }
                break;
            case "REG_SETTING":
                this._settingsEUDataList.items[1].value = status;
                if (this._currentContext && this._currentContext.ctxtId === "Settings" && (this._cachedRegion === "REGION_EU" || this._isEUTAURegion))
                {
                    this._populateListCtrl(this._currentContextTemplate);
                }
                break;
            case "TA_SETTING" :
                this._TAState = null;
                if(status === 1)
                {
                    this._TAState = "Sel";
                }
                else
                {
                    this._TAState = "Unsel";
                }
                if (this._currentContext && this._currentContext.ctxtId === "NowPlaying" && (this._cachedRegion === "REGION_EU" || this._isEUTAURegion))
                {
                    this._setTAToggleUMPCtrl(this._currentContextTemplate,this._TAState);
                }
                break;
            case "SETTING_TYPE_NONE" :
                // No need to change the button status
                break;
            default :
                break;
        }
    }
};

//update the album art in NowPlaying Screen
fmradioApp.prototype._updateAlbumArtNowPlayingCtrl = function(tmplt)
{
    if(this._cachedRegion === "REGION_USA")
    {
        if(this._currentContext && !this._isHDOff && (this._currentContext.ctxtId === "NowPlaying" || this._currentContext.ctxtId === "GenreSeek"))
        {
            var albumArtPath = this._cachedAlbumArtPath;
            tmplt.nowPlaying4Ctrl.setArtworkImagePath(albumArtPath);
        }
    }
    else
    {
        if(this._currentContext && (this._currentContext.ctxtId === "NowPlaying" || this._currentContext.ctxtId === "GenreSeek"))
        {
            tmplt.nowPlaying4Ctrl.setArtworkImagePath(null);// HD is off , setting genric art
        }
    }
};


//clear the album art in NowPlaying Screen
fmradioApp.prototype._clearMetaDataNowPlayingCtrl = function(tmplt)
{
    if(this._currentContext && this._currentContext.ctxtId === "NowPlaying" )
    {
        var controlConfigObj = new Object();
        controlConfigObj.fullConfig = false;
        controlConfigObj.ctrlStyle = "Style2";
		if(this._currentOperationMode !== "AUTO_M_MODE") 
        { 
            tmplt.nowPlaying4Ctrl.setNowPlayingConfig(controlConfigObj);
        } 
		
    }
};

//populate the genreList making the cached genre as selected = true
fmradioApp.prototype._populateGenreListCtrl = function(tmplt)
{
    var indexOfSelectedStation = 0;
    var stationAllOrGenre = this._cachedGenre;
    this._tempgenreList = {
            itemCountKnown : true,
            itemCount : 30,
            vuiSupport : true,
            items  : [
                          { appData : "SelectStationAll", text1Id : "AllStations", itemStyle : "style01", hasCaret:false},
                  ]
    };
    var list = [
                    { appData : "SelectStationGenre", text1Id : "News", itemStyle : "style01", hasCaret:false ,index : 1},
                    { appData : "SelectStationGenre", text1Id : "Affairs", itemStyle : "style01", hasCaret:false ,index : 2},
                    { appData : "SelectStationGenre", text1Id : "Info", itemStyle : "style01", hasCaret:false ,index : 3},
                    { appData : "SelectStationGenre", text1Id : "Sport", itemStyle : "style01", hasCaret:false ,index : 4},
                    { appData : "SelectStationGenre", text1Id : "Education", itemStyle : "style01", hasCaret:false ,index : 5},
                    { appData : "SelectStationGenre", text1Id : "Drama", itemStyle : "style01", hasCaret:false ,index : 6},
                    { appData : "SelectStationGenre", text1Id : "Culture", itemStyle : "style01", hasCaret:false ,index : 7},
                    { appData : "SelectStationGenre", text1Id : "Science", itemStyle : "style01", hasCaret:false ,index : 8},
                    { appData : "SelectStationGenre", text1Id : "Varied", itemStyle : "style01", hasCaret:false ,index : 9},
                    { appData : "SelectStationGenre", text1Id : "Pop", itemStyle : "style01", hasCaret:false ,index : 10},
                    { appData : "SelectStationGenre", text1Id : "Rock", itemStyle : "style01", hasCaret:false ,index : 11},
                    { appData : "SelectStationGenre", text1Id : "Mor", itemStyle : "style01", hasCaret:false ,index : 12},
                    { appData : "SelectStationGenre", text1Id : "Light", itemStyle : "style01", hasCaret:false ,index : 13},
                    { appData : "SelectStationGenre", text1Id : "Classics", itemStyle : "style01", hasCaret:false ,index : 14},
                    { appData : "SelectStationGenre", text1Id : "Other", itemStyle : "style01", hasCaret:false ,index : 15},
                    { appData : "SelectStationGenre", text1Id : "Weather", itemStyle : "style01", hasCaret:false ,index : 16},
                    { appData : "SelectStationGenre", text1Id : "Finance", itemStyle : "style01", hasCaret:false ,index : 17},
                    { appData : "SelectStationGenre", text1Id : "Childrens", itemStyle : "style01", hasCaret:false ,index : 18},
                    { appData : "SelectStationGenre", text1Id : "Social", itemStyle : "style01", hasCaret:false ,index : 19},
                    { appData : "SelectStationGenre", text1Id : "Religion", itemStyle : "style01", hasCaret:false ,index : 20},
                    { appData : "SelectStationGenre", text1Id : "PhoneIn", itemStyle : "style01", hasCaret:false ,index : 21},
                    { appData : "SelectStationGenre", text1Id : "Travel", itemStyle : "style01", hasCaret:false ,index : 22},
                    { appData : "SelectStationGenre", text1Id : "Leisure", itemStyle : "style01", hasCaret:false ,index : 23},
                    { appData : "SelectStationGenre", text1Id : "Jazz", itemStyle : "style01", hasCaret:false ,index : 24},
                    { appData : "SelectStationGenre", text1Id : "Country", itemStyle : "style01", hasCaret:false ,index : 25},
                    { appData : "SelectStationGenre", text1Id : "National", itemStyle : "style01", hasCaret:false ,index : 26},
                    { appData : "SelectStationGenre", text1Id : "Oldies", itemStyle : "style01", hasCaret:false ,index : 27},
                    { appData : "SelectStationGenre", text1Id : "Folk", itemStyle : "style01", hasCaret:false ,index : 28},
                    { appData : "SelectStationGenre", text1Id : "Documentary", itemStyle : "style01", hasCaret:false ,index : 29}
                ];
    var topItem = tmplt.list2Ctrl.topItem; // Save position
    tmplt.list2Ctrl.hideFocus(); // Item that is being focused initially, call this method to save the last focussed element
    
    for(var i=0; i<list.length; i++)
    {
        list[i].text = framework.localize.getLocStr(this.uiaId, list[i].text1Id, null);
    }
    
    function SortByName(x,y) {
        return ((x.text == y.text) ? 0 : ((x.text > y.text) ? 1 : -1 ));
      }
      
    list.sort(SortByName);
      
    for(var i=0; i<list.length; i++)
    {
        this._tempgenreList.items.push(list[i]);
    }
    
    var listLength = this._tempgenreList.items.length;
    
    if(stationAllOrGenre === "ALL")
    {
        stationAllOrGenre = "All Stations";
    }
    else if(stationAllOrGenre)
    {
        stationAllOrGenre = stationAllOrGenre.replace(/\s/g,''); //for other genre : Removing the inbetween spaces from the name.
    }
    var index = utility.getArrayItemByPropertyValue(this._tempgenreList.items,"text1Id",stationAllOrGenre);
    if(index && index.index)
    {
        indexOfSelectedStation = index.index;
    }
    for(var i = 0 ; i < listLength ;i++)
    {
        if(i === indexOfSelectedStation)
        {
            tmplt.list2Ctrl.dataList.items[i].selected = true;
            this._tempgenreList.items[i].selected = true;
        }
        else
        {
            tmplt.list2Ctrl.dataList.items[i].selected = false;
            this._tempgenreList.items[i].selected = false;
        }
    }
    tmplt.list2Ctrl.setDataList(this._tempgenreList);
    tmplt.list2Ctrl.updateItems(0, listLength - 1);
    tmplt.list2Ctrl.topItem = indexOfSelectedStation; // Restore position
};

//populate the Change genreList
fmradioApp.prototype._populateChangeGenreListCtrl = function(tmplt)
{
    var list = [
            { appData : "SelectStationGenre", text1Id : "rbds_News", itemStyle : "style01", hasCaret:false ,index : 1},
            { appData : "SelectStationGenre", text1Id : "rbds_Info", itemStyle : "style01", hasCaret:false ,index : 2},
            { appData : "SelectStationGenre", text1Id : "rbds_Sports", itemStyle : "style01", hasCaret:false ,index : 3},
            { appData : "SelectStationGenre", text1Id : "rbds_Talk", itemStyle : "style01", hasCaret:false ,index : 4},
            { appData : "SelectStationGenre", text1Id : "rbds_Rock", itemStyle : "style01", hasCaret:false ,index : 5},
            { appData : "SelectStationGenre", text1Id : "rbds_Class", itemStyle : "style01", hasCaret:false ,index : 6},
            { appData : "SelectStationGenre", text1Id : "rbds_Adult", itemStyle : "style01", hasCaret:false ,index : 7},
            { appData : "SelectStationGenre", text1Id : "rbds_SoftRock", itemStyle : "style01", hasCaret:false ,index : 8},
            { appData : "SelectStationGenre", text1Id : "rbds_Top40", itemStyle : "style01", hasCaret:false ,index : 9},
            { appData : "SelectStationGenre", text1Id : "rbds_Country", itemStyle : "style01", hasCaret:false ,index : 10},
            { appData : "SelectStationGenre", text1Id : "rbds_Oldies", itemStyle : "style01", hasCaret:false ,index : 11},
            { appData : "SelectStationGenre", text1Id : "rbds_Soft", itemStyle : "style01", hasCaret:false ,index : 12},
            { appData : "SelectStationGenre", text1Id : "rbds_Nostalgia", itemStyle : "style01", hasCaret:false ,index : 13},
            { appData : "SelectStationGenre", text1Id : "rbds_Jazz", itemStyle : "style01", hasCaret:false ,index : 14},
            { appData : "SelectStationGenre", text1Id : "rbds_Classical", itemStyle : "style01", hasCaret:false ,index : 15},
            { appData : "SelectStationGenre", text1Id : "rbds_Rhythym", itemStyle : "style01", hasCaret:false ,index : 16},
            { appData : "SelectStationGenre", text1Id : "rbds_SoftRB", itemStyle : "style01", hasCaret:false ,index : 17},
            { appData : "SelectStationGenre", text1Id : "rbds_Foreign", itemStyle : "style01", hasCaret:false ,index : 18},
            { appData : "SelectStationGenre", text1Id : "rbds_ReligousM", itemStyle : "style01", hasCaret:false ,index : 19},
            { appData : "SelectStationGenre", text1Id : "rbds_ReligousT", itemStyle : "style01", hasCaret:false ,index : 20},
            { appData : "SelectStationGenre", text1Id : "rbds_Personality", itemStyle : "style01", hasCaret:false ,index : 21},
            { appData : "SelectStationGenre", text1Id : "rbds_Public", itemStyle : "style01", hasCaret:false ,index : 22},
            { appData : "SelectStationGenre", text1Id : "rbds_College", itemStyle : "style01", hasCaret:false ,index : 23},
            { appData : "SelectStationGenre", text1Id : "rbds_Hablar", itemStyle : "style01", hasCaret:false ,index : 24},
            { appData : "SelectStationGenre", text1Id : "rbds_Musica", itemStyle : "style01", hasCaret:false ,index : 25},
            { appData : "SelectStationGenre", text1Id : "rbds_HipHop", itemStyle : "style01", hasCaret:false ,index : 26},
            { appData : "SelectStationGenre", text1Id : "rbds_Weather", itemStyle : "style01", hasCaret:false ,index : 29},
        ];
    
    for(var i=0; i<list.length; i++)
    {
        list[i].text = framework.localize.getLocStr(this.uiaId, list[i].text1Id, null);
    }
    
    function SortByName(x,y) {
        return ((x.text == y.text) ? 0 : ((x.text > y.text) ? 1 : -1 ));
      }
      
    list.sort(SortByName);
    
    this._rbds_genreListCtxtDataList.items = new Array();
    
    this._rbds_genreListCtxtDataList.items[this._rbds_genreListCtxtDataList.items.length] = {
        appData : "SelectStationAll", 
        text1Id : "AllStations", 
        itemStyle : "style01", 
        hasCaret : false
    };
    
    for(var i=0; i<list.length; i++)
    {
        this._rbds_genreListCtxtDataList.items.push(list[i]);
    }
    tmplt.list2Ctrl.setDataList(tmplt.list2Ctrl.dataList);
    tmplt.list2Ctrl.updateItems(0, this._rbds_genreListCtxtDataList.items.length - 1);
};

fmradioApp.prototype._populateCachedStationList = function()
{
    var dataList = {};	
    dataList.itemCountKnown = true;
    dataList.itemCount = this._listTotalCount; // total no. of contacts received from DBAPI, not the no. of items requested in chunks
    dataList.vuiSupport = true;
	
	dataList.items = new Array();
	
    if (this._cacheddata && this._cacheddata.items)
    {
        dataList.items = this._cacheddata.items;
    }
	if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "StationList")
    {
		this._currentContextTemplate.list2Ctrl.setDataList(dataList);
		this._currentContextTemplate.list2Ctrl.updateItems(0, dataList.itemCount - 1);
	}
};

//setting button config according to the cached region
fmradioApp.prototype._setButtonConfig = function()
{
    this._isEUTAURegion = false;
    if (this._cachedRegionInfo && this._cachedRegionInfo.region)
    {
        this._cachedRegion = this._cachedRegionInfo.region; //getting the cached region
    }
    switch(this._cachedRegion)
    {
        case "REGION_OTHER" :
        case "REGION_JPN" :
            this._UmpButtonConfig = this._umpButtonConfigOther;
            this._region = "Other";
			this._FreqSeekTimer = 20;
            break;
        case "REGION_USA" :
            this._UmpButtonConfig = this._umpButtonConfigUSA;
            this._region = "NA";
			this._FreqSeekTimer = 40;
            break;
        case "REGION_EU" :
            this._UmpButtonConfig = this._umpButtonConfigEU;
            this._region = "Other";
            this._isEUTAURegion = true;
			this._FreqSeekTimer = 20;
            break;
        case "REGION_CHINATAIWAN" :
            this._UmpButtonConfig = this._umpButtonConfigEU;
            this._region = "Other";
            this._isEUTAURegion = true;
			this._FreqSeekTimer = 20;
            break;
        case "REGION_4A" :
            this._region = "Other";
			this._FreqSeekTimer = 20;
            switch(this._cachedSubRegion4A)
            {
                case "REGION_AUSTRALIA" :
                    this._UmpButtonConfig = this._umpButtonConfigEU;
                    this._isEUTAURegion = true;
                    break;
                case "REGION_5K" :
                    this._UmpButtonConfig = this._umpButtonConfigOther;
                    break;
                case "REGION_9K" :
                    this._UmpButtonConfig = this._umpButtonConfigOther;
                    break;
                case "REGION_OTHER" :
                    this._UmpButtonConfig = this._umpButtonConfigEU;
                    this._isEUTAURegion = true;
                    break;
                default :                    
                    this._UmpButtonConfig = this._umpButtonConfigEU;
                    this._isEUTAURegion = true;
                    break;
            }
            break;
        default :
            this._FreqSeekTimer = 40;
			this._region = "NA";// if region is not available then default will be "NA"
            this._UmpButtonConfig = this._umpButtonConfigUSA;
            log.debug("loading other UMP for default");
            break;
    }
    if(this._currentContextTemplate && this._currentContext && (this._currentContext.ctxtId === "NowPlaying" || this._currentContext.ctxtId === "GenreSeek"))
    {
        this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setUmpConfig(this._UmpButtonConfig);
        this._populateFMNowPlayingCtrl(this._currentContextTemplate);
    }
};

//get the UMP config as per the cached region
fmradioApp.prototype._getUMPConfig = function()
{
    this._UmpButtonConfig = this._umpButtonConfigUSA;
    if (this._cachedRegionInfo && this._cachedRegionInfo.region)
    {
        this._cachedRegion = this._cachedRegionInfo.region; //getting the cached region
    }
    switch(this._cachedRegion)
    {
        case "REGION_OTHER" :        
        case "REGION_JPN" :
            this._UmpButtonConfig = this._umpButtonConfigOther;
            break;
        case "REGION_USA" :
            this._UmpButtonConfig = this._umpButtonConfigUSA;
            break;
        case "REGION_EU" :
        case "REGION_CHINATAIWAN" :
            this._UmpButtonConfig = this._umpButtonConfigEU;
            break;
        case "REGION_4A" :
            switch(this._cachedSubRegion4A)
            {
                case "REGION_OTHER" :
                case "REGION_AUSTRALIA" :
                    this._UmpButtonConfig = this._umpButtonConfigEU;                   
                    break;
                case "REGION_5K" :
                case "REGION_9K" :
                    this._UmpButtonConfig = this._umpButtonConfigOther;
                    break;
                default :
                    this._UmpButtonConfig = this._umpButtonConfigEU;                    
                    break ;
            }
            break;
        default :
            log.debug("loading other UMP for default");
            this._UmpButtonConfig = this._umpButtonConfigUSA;
            break;
    }
    this._currentContextTemplate.nowPlaying4Ctrl.umpCtrl.setUmpConfig(this._UmpButtonConfig);
    return this._UmpButtonConfig;
};

//setting button config according to the cached region
fmradioApp.prototype._storePtyInfo = function()
{
    this._receivedpty = null;
    if (this._cachedPtyInfo )
    {
        if(this._cachedPtyInfo.received_pty !== null)
        {
            this._receivedpty = this._cachedPtyInfo.received_pty; //getting receivedpty from MMUI
        }
        this._cachedGenre = this._genreListCtxtDataList.items[this._receivedpty].text1Id;
        
        if(this._receivedpty !== null)
        {
            this._ptyGenreFormat = this._ptyRDSText.dbapiGenre[this._receivedpty].dbapiAppData;
            log.info("PtyGenreFormat = "+this._ptyGenreFormat);
        }
        //Station List is belongs to the EU region and RDS genre only
        if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "StationList")
        {
            this._currentContextTemplate.list2Ctrl.focussedItem = 0;
            this._currentContextTemplate.list2Ctrl.dataList = null;
            var offset = Math.max(this._contextTable['StationList']['controlProperties']['List2Ctrl']['scrollTo'] - 10, 0);
            this._listNeedDataOffsetIndex = offset;
            //Get stations from DBAPI
            var params = {"genre":this._ptyGenreFormat, "region": this._region , index : this._listNeedDataOffsetIndex , limit : 20};
            framework.sendRequestToDbapi(this.uiaId, this._addItemsToList.bind(this), "radio", "FmStationList", params);
        }
        else
        {
            this._resetingStationListCtxDataList();
        }
    }
};

//storing HD Channels into in an array
fmradioApp.prototype._storeHDStationsList = function()
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
};

//Reseting the datalist of StationList Context
fmradioApp.prototype._resetingStationListCtxDataList = function()
{
    //@formatter:off
    this._stationListCtxtDataList = {
        itemCountKnown : true,
        itemCount : 1,
        vuiSupport : true,
        items: [
            { appData : { eventName : 'SelectChangeGenre' }, text1Id : "Genre"+this._cachedGenre, itemStyle : "style01", hasCaret:false},
        ]
    };
    if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "StationList")
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
};

//Resetting The HDChannel datalist
fmradioApp.prototype._resetingHDChannelDataList = function()
{
    this._hdChannelsDataList = {
        itemCountKnown : true,
        itemCount : 1,
        vuiSupport : true,
        items: [
            { appData : {eventName : "HDRadio" }, text1Id : "HDRadio", itemStyle : "styleOnOff", hasCaret:false, value : 2 }
        ]
    };
};

//Reseting the datalist of AutoMemory Context
fmradioApp.prototype._resetingAutoMemoryCtxDataList = function()
{
    //@formatter:off
    this._fmradioMemoryDataList = {
        itemCountKnown : true,
        itemCount : 2,
        vuiSupport : true,
        items: [
            { appData : {eventName : 'UpdateAutoMemory' }, text1Id : "UpdatingStationList", itemStyle : "style02", hasCaret:false, image2:'indeterminate'},
            { appData : {eventName : 'SelectGenreSeek' }, text1Id : "GenreSeek", itemStyle : "style01", hasCaret:false, disabled : true }
        ]
    };
    //@formatter:on
    if(this._cachedRegion !== "REGION_USA")// If the region is other then NA then "GenreSeek" wont be shown
    {
        this._fmradioMemoryDataList.itemCount = 1;
    }
};

//Alert complete callback to clear cached values
fmradioApp.prototype._alertCompleteCallback = function()
{
    log.debug("completecallback");
    framework.destroyControl(this._fmradioTagAlert);    // Destoying control to allow cleanup of DOM
    this._cachedTagMessage    = null;        // Just to make sure random style test works
    this._fmradioTagAlert     = null;
};

// Add/Update items to list control
fmradioApp.prototype._addItemsToList = function(msg)
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
            if (msg.msgContent.params.stationList)
            {
                list = msg.msgContent.params.stationList;
            }
            if (msg.msgContent.params.count)
            {
                count = msg.msgContent.params.count;
            }
            if (msg.msgContent.params.totalCount)
            {
                totalCount = msg.msgContent.params.totalCount;
            }
            this._listTotalCount = totalCount + 1;
            var offset = this._listNeedDataOffsetIndex;
            var stationName = "";
            var frequency = null;
            var genreName = null;
            var piCode = null;

            // do we have a dataList, i.e. are first entering into this context
            if (!currList.hasDataList())
            {
               // the current list doesn't have a dataList -> set one
                var dataList = {
                    itemCountKnown : true,
                    itemCount : totalCount+1,
                    vuiSupport : true,
                    items : []
                };
                dataList.items[0] = { appData : { eventName : 'SelectChangeGenre' }, text1Id : "Genre"+this._cachedGenre, itemStyle : "style01" , hasCaret:true };
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
                                genreName = list[i-offset].genre;
                                if(this._receivedpty !== 0)
                                {
                                    genreName = "";
                                }
                                else if(genreName)
                                {
                                    if(genreName === "None")
                                    {
                                        genreName = "rbds_None";
                                    }
                                    else
                                    {
                                        var genreIndex = utility.getArrayItemByPropertyValue(this._ptyRDSText.dbapiGenre,"dbapiAppData",genreName);
                                        if(genreIndex && genreIndex.index !== null)
                                        {
                                            genreName = this._genreListCtxtDataList.items[genreIndex.index].text1Id;
                                        }
                                    }
                                }
                                if (list[i-offset].stationName !==null)
                                {
                                    stationName = list[i].stationName;
                                }
                                if (list[i-offset].stationName === "")
                                {
                                    if (list[i-offset].frequency)
                                    {
                                        stationName = this._frequencyFormatting(list[i-offset].frequency);
                                    }
                                }
                                if (list[i-offset].piCode !==null)
                                {
                                    piCode = list[i-offset].piCode;
                                }
                                dataList.items[dataList.items.length] =  {itemBehavior:"shortAndLong", itemStyle:'style06', appData:{ eventName : 'SelectStationName', stationName : list[i-offset].stationName , piCode : list[i-offset].piCode, frequency : list[i-offset].frequency}, text1 : stationName, label1Id:genreName, hasCaret:false};
                            }
                        }
                        // otherwise add empty items (they will be requested as the user scrolls)
                        else
                        {
                            dataList.items[dataList.items.length] = { itemStyle:'style01', appData:null, text1:'spacae', hasCaret:false};
                        }
                    }
                }
                // nope, we are in the beginning
                else
                {
                    // fil the first <count> elements
                    for (var i=0; i<count; i++)
                    {
                        genreName = list[i].genre;
                        if(this._receivedpty !== 0)
                        {
                            genreName = "";
                        }
                        else if(genreName)
                        {
                            if(genreName === "None")
                            {
                                genreName = "rbds_None";
                            }
                            else
                            {
                                var genreIndex = utility.getArrayItemByPropertyValue(this._ptyRDSText.dbapiGenre,"dbapiAppData",genreName);
                                if(genreIndex && genreIndex.index !== null)
                                {
                                    genreName = this._genreListCtxtDataList.items[genreIndex.index].text1Id;
                                }
                            }
                        }
                        if (list[i].stationName !==null)
                        {
                            stationName = list[i].stationName;
                        }
                        if (list[i].stationName === "")
                        {
                            if (list[i].frequency)
                            {
									
                                stationName = this._frequencyFormatting(list[i].frequency);
                            }
                        }
                        if (list[i].piCode !==null)
                        {
                            piCode = list[i].piCode;
                        }
                        dataList.items[dataList.items.length] =  {itemBehavior:"shortAndLong", itemStyle:'style06', appData:{ eventName : 'SelectStationName', stationName : list[i].stationName , piCode : list[i].piCode, frequency : list[i].frequency }, text1 : stationName,label1Id:genreName, hasCaret:false};
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
                    genreName = list[(i - offset)].genre;
                    if(this._receivedpty !== 0)
                    {
                        genreName = "";
                    }
                    else if(genreName)
                    {
                        if(genreName === "None")
                        {
                            genreName = "rbds_None";
                        }
                        else
                        {
                            var genreIndex = utility.getArrayItemByPropertyValue(this._ptyRDSText.dbapiGenre,"dbapiAppData",genreName);
                            if(genreIndex && genreIndex.index !== null)
                            {
                                genreName = this._genreListCtxtDataList.items[genreIndex.index].text1Id;
                            }
                        }
                    }
                    if (list[(i - offset)].stationName !==null)
                    {
                        stationName = list[(i - offset)].stationName;
                    }
                    if (list[(i - offset)].stationName === "")
                    {
                        if (list[(i - offset)].frequency)
                        {
                            stationName = this._frequencyFormatting(list[(i - offset)].frequency);
                        }
                    }
                    if (list[(i - offset)].piCode !==null)
                    {
                        piCode = list[(i - offset)].piCode;
                    }
                    currList.dataList.items[i+1] = {itemBehavior:"shortAndLong", itemStyle:'style06', appData:{ eventName : 'SelectStationName', stationName : list[(i - offset)].stationName , piCode : list[(i - offset)].piCode, frequency : list[(i - offset)].frequency }, text1 : stationName, label1Id:genreName, hasCaret:false};
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
                };
            dataList.items[0] = { appData : { eventName : 'SelectChangeGenre' }, text1Id : "Genre"+this._cachedGenre, itemStyle : "style01" };
            currList.setDataList(dataList);
            currList.updateItems(0, dataList.itemCount-1);
            currList.topItem = this._contextTable[currCtxtId]['controlProperties']['List2Ctrl']['scrollTo'];
        }
    }
};

// this is called when list needs more data to display when scrolling
fmradioApp.prototype._fmStationsNeedDataCallback = function(index)
{
    log.debug(" _testdbapiNeedDataCallback  called...");
    this._listNeedDataOffsetIndex = index;
   // var listIndex = 0;
    if(this._listNeedDataOffsetIndex > 1)
    {
        this._listNeedDataOffsetIndex = this._listNeedDataOffsetIndex - 1;
    }
    //Get stations from DBAPI
    var params = {"genre":this._ptyGenreFormat, "region": this._region , index : this._listNeedDataOffsetIndex , limit : 20};
    framework.sendRequestToDbapi(this.uiaId, this._addItemsToList.bind(this), "radio", "FmStationList", params);
};

/**************************
 * DBAPI METHOD RESPONSE HANDLERS *
 **************************/

//Helper function  for AutoMemory DBAPI
fmradioApp.prototype._getAutoMemoryCallbackFn = function(msg)
{
    //AutoMemory DBAPI callback
    if ( msg && msg.msgContent.params )
    {
        this._cachedAutoMemoryList = msg.msgContent.params;
        this._populateAutoMemUpdateStationListCtrl(this._currentContextTemplate);
    }
};

//Helper function  to Read Metadata  from DBAPI
fmradioApp.prototype._getMetadataCallbackFn = function(msg)
{
    log.debug(" _getContactsCallbackFn  called...",msg);
    if (msg.msgContent.params.eCode === 0)
    {
        var params = msg.msgContent.params;
        this._cachedTrackTitle = null;
        this._cachedAlbumName = null;
        this._cachedArtistName = null;
        this._cachedMetadataGenre = null;
        this._cachedRadioText = null;
        this._cachedAlbumArtPath = null;
        this._cachedSISData = null;
        if(params.trackTitle)
        {
            this._cachedTrackTitle = params.trackTitle;
        }
        if(params.albumName)
        {
            this._cachedAlbumName = params.albumName;
        }
        if(params.artistName)
        {
            this._cachedArtistName = params.artistName;
        }
        if(params.genre)
        {
            this._cachedMetadataGenre = params.genre;
        }
        if(params.radioText)
        {
            this._cachedRadioText = params.radioText;
        }
        if(params.sisData)
        {
            this._cachedSISData = params.sisData;
        }
        //if album art is available , show album art if not show Station logo
        if(params.albumArtPath)
        {
            this._cachedAlbumArtPath = params.albumArtPath;
        }
        else if(params.stationLogoPath)
        {
            this._cachedAlbumArtPath = params.stationLogoPath;
        }
		
		//If spaces then initialized with NULL
		this._checkSpacesForMetaData();
		
        if (this._currentContext && this._currentContextTemplate && (this._currentContext.ctxtId === "NowPlaying" || this._currentContext.ctxtId === "GenreSeek"))
        {
            this._populateFMNowPlayingCtrl(this._currentContextTemplate);
        }
    }
    else
    {
        log.info("GetMetaData operation failed");
    }
};

//Helper function  to Read Metadata  from DBAPI
fmradioApp.prototype._getUpdatedMetadataCallbackFn = function(msg)
{
    log.debug(" _getContactsCallbackFn  called...",msg);
    if (msg.msgContent.params.eCode === 0)
    {
        var params = msg.msgContent.params;
        
		if(params.trackTitle)
        {
            this._cachedTrackTitle = params.trackTitle;
        }
        if(params.albumName)
        {
            this._cachedAlbumName = params.albumName;
        }
        if(params.artistName)
        {
            this._cachedArtistName = params.artistName;
        }
        if(params.genre)
        {
            this._cachedMetadataGenre = params.genre;
        }
        if(params.radioText)
        {
            this._cachedRadioText = params.radioText;
        }
        if(params.sisData)
        {
            this._cachedSISData = params.sisData;
        }
		
		//If spaces then initialized with NULL
		this._checkSpacesForMetaData();
		
        if (this._currentContext && this._currentContextTemplate && (this._currentContext.ctxtId === "NowPlaying" || this._currentContext.ctxtId === "GenreSeek"))
        {
            this._populateFMNowPlayingCtrl(this._currentContextTemplate);
        }
    }
    else
    {
        log.info("GetMetaData operation failed");
    }
};

//Helper function  to Read Metadata Art Information from DBAPI
fmradioApp.prototype._getMetadataArtInformationCallbackFn = function(msg)
{
    log.debug(" _getContactsCallbackFn  called...",msg);

    if (msg && msg.msgContent && msg.msgContent.params && msg.msgContent.params.eCode === 0)
    {
        var params = msg.msgContent.params;
        this._cachedAlbumArtPath = null;
        //if album art is available , show album art if not show Station logo
        if(params.albumArtPath)
        {
            this._cachedAlbumArtPath = params.albumArtPath;
        }
        else if(params.stationLogoPath)
        {
            this._cachedAlbumArtPath = params.stationLogoPath;
        }
        if (this._currentContextTemplate)
        {
           this._updateAlbumArtNowPlayingCtrl(this._currentContextTemplate);
        }
    }
    else
    {
        log.info("GetAlbumArt operation failed");
    }
};
//showing status bar notification for frequency changed
fmradioApp.prototype._showFrequencySBN = function(frequency,picode,subPlayingStation,psnName)
{
    if(frequency && frequency !== 0)
    {
		//For Seek only freq will be shown
		if((this._currentOperationMode === "SEEK_UP_MODE" || this._currentOperationMode === "SEEK_DOWN_MODE") && this._cachedCurrentFreq)
		{
			this._newFreqRecived = frequency;
			
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
			frequency = this._frequencyFormatting(frequency);
			var sbnText = frequency;
			
			if(this._isEUTAURegion)
			{
				//For EU Tau If station name is available then show only station name
				if(psnName && psnName.trim())
				{
					sbnText = psnName;
				}
				
			}
			else
			{
				var spsToHD = this._spsToHD(subPlayingStation);
				if(spsToHD && this._cachedRegion === "REGION_USA" && !this._isHDOff && this._isHDLogoSupport)
				{
					sbnText = sbnText +" - "+spsToHD;
				}
			}
			log.info("Freq SBN displayed :: "+sbnText)
			framework.common.startTimedSbn(this.uiaId, "StationsbnInfo", "typeE",
			{ sbnStyle : "Style02",imagePath1 : "common/images/icons/IcnListBtConnType_Music.png", text1Id : "system.FmRadio" , text2 : sbnText });
			}
    }
};

//showing status bar notification for itunes tagging
fmradioApp.prototype._showTagSBN = function(status)
{
    if(status)
    {
        var sbnText = null;
		var showTypeFSBN = false;
		var showTypeESBN = false;
        switch (status)
        {
            case "TagSaved" :
            case "TagTransferSuccess" :
            case "TagSavedtoSystem" :
            case "TagSavedtoIpod" :
			case "TagDuplicate" :
			sbnText = "TagSaved";
			showTypeESBN=true;
			break;
            case "TagSavedIpodFull" :
			case "AllTagsTransferredIpodFull" :
			case "TagTransferIpodFull" :
			case "TagDuplicateIpodFull" :
			case "TagTransferNoMemory" :
                sbnText = "IpodFull";
				showTypeFSBN=true;
                break;
            case "ErrorNoMemoryAll" :
            case "ErrorNoMemorySystem" :
                sbnText = "TagMemoryFull";
				showTypeFSBN=true;
                break;
            case "ErrorIpodFail" :
				sbnText = "IpodError";
				showTypeFSBN=true;
				break;
            case "ErrorConnection" :
				sbnText = "ErrorConnection";
				showTypeFSBN=true;
				break;                
            default :
                break;
        }
		if(showTypeFSBN)
        {
        framework.common.startTimedSbn(this.uiaId, "TagsbnInfo", "typeF",
        { sbnStyle : "Style02",imagePath1 : "common/images/icons/IcnListBtConnType_Music.png", text1Id : sbnText , text2 : null });
		showTypeFSBN=false;
		}
		if(showTypeESBN)
        {
        framework.common.startTimedSbn(this.uiaId, "TagsbnInfo", "typeE",
        { sbnStyle : "Style02",imagePath1 : "common/images/icons/IcnListBtConnType_Music.png", text1Id : sbnText , text2 : null });
		showTypeESBN=false;
		}
    }
};

/*
 * This function is called by Common whenever a msgType="alert" comes from MMUI.
 * This function should return a properties Object to use for the WinkCtrl.
 */
fmradioApp.prototype.getWinkProperties = function(alertId, params)
{
    var messageToDisplay = null;
    var subMap = null;
    var text1String = null;
    var text2String = null;
    var text3String = null;
    var subMap2 = null;
    var subMap3 = null;
    var winkProperties = null;
    var style = null;
    if(params && params.payload && params.payload.tagging_store_status)
    {
         messageToDisplay = params.payload.tagging_store_status;
         text1String = messageToDisplay;
         if(params.payload.accessoryFreeSlots)
         {
             switch(messageToDisplay)
             {
                case "TagSaved" :
                case "TagSavedtoSystem" :
                case "TagSavedtoIpod" :
                case "TagDuplicate" :
                case "TagSavedIpodFull":
                case "TagTransferSuccess":
                    subMap = params.payload.accessoryFreeSlots;
                    break;
                default :
                    break;
             }
         }
         switch(messageToDisplay)
         {
            case "TagSaved" :
                text1String = "TagSaved";
                text2String = "Remaining";
                subMap2 = { "numberOfTags" : subMap };
                style = "style01";
                break;
            case "TagSavedtoSystem" :
                text1String = "TagSavedtoSystem";
                text2String = "Remaining";
                subMap2 = { "numberOfTags" : subMap };
                style = "style01";
                break;
            case "TagSavedtoIpod" :
                text1String = "TagSavedtoIpod";
                text2String = "Remaining";
                subMap2 = { "numberOfTags" : subMap };
                style = "style01";
                break;
            case "TagDuplicate" :
                text1String = "TagAlreadySaved";
                text2String = "Remaining";
                subMap2 = { "numberOfTags" : subMap };
                style = "style01";
                break;
            case "TagSavedIpodFull":
                text1String = "IpodFull";
                text2String = "TagSavedtoSystem";
                text3String = "Remaining";
                subMap3 = { "numberOfTags" : subMap };
                style = "style02";
                break;
            case "TagTransferSuccess":
                text1String = "TagTransferredtoiPod";
                text2String = "Remaining";
                subMap2 = { "numberOfTags" : subMap };
                style = "style01";
                break;
            case "AllTagsTransferredIpodFull" :
                text1String = "AllTagsTransferred";
                text2String = "IpodFull";
                style = "style01";
                break;
            case "TagTransferIpodFull":
                text1String = "PartialTransfer";
                text2String = "IpodFull";
                style = "style01";
                break;
            case "ErrorNoMemorySystem":
                text1String = "MemoryFull";
                text2String = "ConnectIPod";
                style = "style01";
                break;
            case "ErrorNoMemoryAll":
                text1String = "AllMemoryFull";
                text2String = "TagsCannotBeSaved";
                style = "style01";
                break;
            case "TagDuplicateIpodFull":
                text1String = "IpodFull";
                text2String = "TagAlreadySaved";
                style = "style01";
                break;
            case "TagTransferNoMemory":
                text1String = "IpodFull";
                text2String = "CannotTransferTags";
                style = "style01";
                break;
            case "ErrorConnection":
                text1String = "ErrorConnection";
                style = "style03";
                break;
            case "ErrorIpodFail":
                text1String = "IpodError";
                text2String = "UnplugAndReconnect";
                style = "style01";
                break;
            case "TagNotYetProcessed":
                text1String = "TagNotYetProcessed";
                style = "style03";
                break;
            default :
                break;
         }
         winkProperties = {
            "style"           : style,
            "text1Id"         : text1String,
            "text1SubMap"     : null,
            "text2Id"         : text2String,
            "text2SubMap"     : subMap2,
            "text3Id"         : text3String,
            "text3SubMap"     : subMap3,
            "alertTimeout"    : 3000
        };
        return winkProperties;
    }
};

//check for requried screen like NowPlaying(WeekHD,SiganlLost,HD,Analog),Tune,HDChannels
fmradioApp.prototype._checkingRequiredScreen = function(msg)
{
    if(this._cachedHDTunerStatus)
    {
        if(!this._isHDOff && this._prevChannelType === "ANALOG_CHANNEL" && this._prevTransmissionType === "ANALOG_TRANSMISSION"
                && this._cachedHDTunerStatus.channel_type === "DIGITAL_CHANNEL" && this._cachedHDTunerStatus.transmission_type === "ANALOG_TRANSMISSION")
        {
            this._showHDAcquirng();
        }
        else
        {
            //USA HD SCREEN
            if(!this._isHDOff && this._cachedHDTunerStatus.transmission_type === "DIGITAL_TRANSMISSION" && this._cachedHDTunerStatus.channel_type === "DIGITAL_CHANNEL")
            {
                clearTimeout(this._timerStarted);
                this._timerStarted = null;
                this._isHDLogoSupport = true;
                log.info("inside _HDTunerStatusMsgHandler (USA HD SCREEN), this._isHDLogoSupport value changed to "+this._isHDLogoSupport);
            }
            //USA ANALOG SCREEN
            else if((this._isHDOff) || (!this._isHDOff && this._cachedHDTunerStatus.channel_type === "ANALOG_CHANNEL" && this._cachedHDTunerStatus.transmission_type === "ANALOG_TRANSMISSION") && this._countSubStations === 0)
            {
                // No Setting for USA Analog Screen
                clearTimeout(this._timerStarted);
                this._timerStarted = null;
                this._isHDLogoSupport = false;
                log.info("inside _HDTunerStatusMsgHandler (USA ANALOG SCREEN), this._isHDLogoSupport value changed to "+this._isHDLogoSupport);
            }
            //Display Week HD Screens
            if(this._cachedCurrentPlayingSPS === "SPS_NONE" && !this._isHDOff && this._cachedHDTunerStatus && this._cachedHDTunerStatus.transmission_type === "ANALOG_TRANSMISSION" && this._cachedHDTunerStatus.channel_type === "DIGITAL_CHANNEL")
            {
                log.info("inside _HDTunerStatusMsgHandler (USA WEEK HD SCREEN), this._isHDLogoSupport value changed to "+this._isHDLogoSupport);
                clearTimeout(this._timerStarted);
                this._timerStarted = null;
                this._isHDLogoSupport = true;
                this._populateWeekHDNowPlayingCtrl();

            }
            //Display HD SubstationLost
            else if(this._cachedCurrentPlayingSPS !== "SPS_NONE" && !this._isHDOff && this._cachedHDTunerStatus.transmission_type === "ANALOG_TRANSMISSION" && this._cachedHDTunerStatus.channel_type === "DIGITAL_CHANNEL")
            {
                clearTimeout(this._timerStarted);
                this._timerStarted = null;
                log.info("inside _HDTunerStatusMsgHandler (USA HD Lost SCREEN), this._isHDLogoSupport value changed to "+this._isHDLogoSupport);
                this._isHDLogoSupport = true;
                this._populateHDLostNowPlayingCtrl();

            }
        }
    }
    if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "NowPlaying" && !this._timerStarted)
    {
        this._populateFMNowPlayingCtrl(this._currentContextTemplate);
    }
    else if (this._currentContext && this._currentContext.ctxtId === "Tune")
    {
        this._populateTunerCtrl(this._currentContextTemplate);
    }
    else if (this._currentContext && this._currentContext.ctxtId === "HDChannels" && this._currentContextTemplate)
    {
        if(this._isHDOff && this._cachedRegion === "REGION_USA")   //HD is off, HDchannels context will have one toggle button only
        {
            this._resetingHDChannelDataList();
            this._populateListCtrl(this._currentContextTemplate);
        }
        else        // HD is on ,HDchannels context will have one toggle button with available HD channels
        {
            this._populateHDChannelsListCtrl(this._currentContextTemplate);
            if(this._hdChannelsDataList && this._hdChannelsDataList.itemCount)
            {
                if(this._currentContextTemplate.list2Ctrl && this._currentContextTemplate.list2Ctrl.focussedItem !== null)
                {
                    if((this._hdChannelsDataList.itemCount - 1 ) < (this._currentContextTemplate.list2Ctrl.focussedItem ))
                    {
                        this._currentContextTemplate.list2Ctrl.focussedItem = this._hdChannelsDataList.itemCount - 1 ;
                    }
                }
            }
        }
    }
};

//If region is 4A 9K then 2 digit frequecy(ex - 87.90) should display else one digit(ex - 87.9) after decimal
fmradioApp.prototype._frequencyFormatting = function (frequency)
{
    if(frequency)
	{
		if(this._cachedRegion === "REGION_4A" && this._cachedSubRegion4A === "REGION_9K")
		{
			frequency = frequency.toFixed(2);
		}
		else
		{
			frequency = frequency.toFixed(1);
		}
    return frequency;
	}
};

//Added 10 Second timer to remove TA dialog this should not cancel TA rather just exit the screen as if the user pressed close.
fmradioApp.prototype._settleTATimeCallback = function ()
{
    this._clearTADialogTimer();//If timer already running then clearing the TA timer
    if (this._currentContext && this._currentContext.ctxtId === "TADialog")
    {
        framework.sendEventToMmui(this.uiaId, "SelectClose");
    }
};

//Stopping the TA timer if started
fmradioApp.prototype._clearTADialogTimer = function ()
{
    if(this._settleTATimeOut)
    {
        clearTimeout(this._settleTATimeOut);//If timer already running then clearing the TA timer
        this._settleTATimeOut = null;
    }
};

fmradioApp.prototype._populateScanFreqNowPlayingCtrl = function (tmplt)
{
    var frequency = "";
    var ctrlTitleItem = null;
	var freqToDisplay = 0;
	
	freqToDisplay = this._populateScanFreq();
	
	var newFreqToDisplay = this._frequencyFormatting(freqToDisplay);
	var newFormattedFreqRecived = this._frequencyFormatting(this._newFreqRecived); 
	
	if(!(newFreqToDisplay != newFormattedFreqRecived))
	{
		clearTimeout(this._freqTimerStarted);
        this._freqTimerStarted = null;
	}
	
	this._cachedCurrentFreq = freqToDisplay;

	//shows the metadata information along with the title
	frequency = this._frequencyFormatting(freqToDisplay);
	this._displayedFreq = freqToDisplay;
	if(tmplt && this._currentContext && (this._currentContext.ctxtId === "NowPlaying" || this._currentContext.ctxtId === "GenreSeek"))
	{
		if(this._currentOperationMode !== "AUTO_M_MODE") 
		{ 
			ctrlTitleItem = frequency; 
			log.info("Frequency going to display :: "+frequency); 
			tmplt.nowPlaying4Ctrl.setCtrlTitle({ctrlTitleText : ctrlTitleItem}); 
		} 			
	}
};


fmradioApp.prototype._populateScanFreqSBNCtrl = function (tmplt)
{
    var frequency = "";
	var freqToDisplay = 0;
	
	freqToDisplay = this._freqToDisplay;
	var newFreqToDisplay = this._frequencyFormatting(freqToDisplay);
	var newFormattedFreqRecived = this._frequencyFormatting(this._newFreqRecived); 
	
	if(!(newFreqToDisplay != newFormattedFreqRecived)) // if new freq and received freq same then clear the timer
	{
		clearTimeout(this._freqTimerStartedSBN);
        this._freqTimerStartedSBN = null;
	}

	this._cachedCurrentFreq = freqToDisplay;
	
	//shows the metadata information along with the title
	frequency = this._frequencyFormatting(freqToDisplay);
	this._displayedFreq = freqToDisplay;
	if(framework.getCurrCtxtId() !== "NowPlaying" && framework.getCurrCtxtId() !== "GenreSeek")
	{
		if(this._currentOperationMode !== "AUTO_M_MODE") 
		{ 
			var sbnText = frequency;
			log.info("Freq SBN displayed :: "+sbnText)
			framework.common.startTimedSbn(this.uiaId, "StationsbnInfo", "typeE",
			{ sbnStyle : "Style02",imagePath1 : "common/images/icons/IcnListBtConnType_Music.png", text1Id : "system.FmRadio" , text2 : sbnText }); 
		} 
	} 	
}


fmradioApp.prototype._populateScanFreq = function (tmplt)
{
	
	var freqToDisplay = 0;
	var disPlayedFreq = this._frequencyFormatting(this._displayedFreq);
	
	switch(this._currentOperationMode)
	{
		case "SCAN_UP_MODE":
		case "SEEK_UP_MODE":
			if(this._cachedRegion == "REGION_4A")
			{

				if(disPlayedFreq ==  this._stepCountData[this._cachedRegion][this._cachedSubRegion4A].high)
				{
					freqToDisplay = this._stepCountData[this._cachedRegion][this._cachedSubRegion4A].low;
				}
				else
				{
					freqToDisplay = this._displayedFreq + this._stepCount;
				}
			}
			else
			{
				if(disPlayedFreq ==  this._stepCountData[this._cachedRegion].high)
				{
					freqToDisplay = this._stepCountData[this._cachedRegion].low;
				}
				else
				{
					freqToDisplay = this._displayedFreq + this._stepCount;
				}
			}
			break;
		case "SEEK_DOWN_MODE":
			if(this._cachedRegion == "REGION_4A")
			{
				if(disPlayedFreq ==  this._stepCountData[this._cachedRegion][this._cachedSubRegion4A].low)
				{
					freqToDisplay = this._stepCountData[this._cachedRegion][this._cachedSubRegion4A].high;
				}
				else
				{
					freqToDisplay = this._displayedFreq - this._stepCount;
				}
			}
			else
			{
				if(disPlayedFreq ==  this._stepCountData[this._cachedRegion].low)
				{
					freqToDisplay = this._stepCountData[this._cachedRegion].high;
				}
				else
				{
					freqToDisplay = this._displayedFreq - this._stepCount;
				}
			}
			break;
		default:
		break;
	}
	if(this._cachedRadioDetails)
	{
		this._cachedRadioDetails["freq"] = freqToDisplay;
	}
	this._freqToDisplay = freqToDisplay;
	return freqToDisplay;
}

fmradioApp.prototype._populateFreqNowPlayingCtrl = function (tmplt)
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
            frequency = this._frequencyFormatting(frequency);
        }
    }
    
    if(this._currentContext && (this._currentContext.ctxtId === "NowPlaying" || this._currentContext.ctxtId === "GenreSeek"))
    {
        if(this._isEUTAURegion)
        {
            if(stationName)
            {
                ctrlTitleItem = stationName;
            }
            else
            {
                ctrlTitleItem = frequency;
            }
        }
        else
        {
            ctrlTitleItem = frequency + " " + stationName;
            
        }
		if(this._currentOperationMode !== "AUTO_M_MODE") 
        { 
            log.info("Frequency going to display :: "+frequency); 
            tmplt.nowPlaying4Ctrl.setCtrlTitle({ctrlTitleText : ctrlTitleItem}); 
        } 
		
    }
};

//Helper function  to Update Metadata to NULL if one space received from DBAPI
fmradioApp.prototype._checkSpacesForMetaData = function()
{
	//If any data received as one space then initializing the data with NULL so that old data will be cleared from screen.
	if(this._cachedTrackTitle === " ")
	{
		this._cachedTrackTitle = null;
	}
	if(this._cachedAlbumName === " ")
	{
		this._cachedAlbumName = null;
	}
	if(this._cachedArtistName === " ")
	{
		this._cachedArtistName = null;
	}
	if(this._cachedMetadataGenre === " ")
	{
		this._cachedMetadataGenre = null;
	}
	if(this._cachedRadioText === " ")
	{
		this._cachedRadioText = null;
	}
	if(this._cachedSISData === " ")
	{
		this._cachedSISData = null;
	}
}
/**************************
 * Framework register
 **************************/
framework.registerAppLoaded("fmradio", null, true);