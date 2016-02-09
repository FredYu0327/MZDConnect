/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: phoneApp.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: avorotp
 Date: 26-June-2012
 __________________________________________________________________________

 Description: IHU GUI Phone App

 Revisions:
 v0.1 (26-June-2012)  
 v0.2 (28-August-2012)    Swithced to Common for Global events
 v0.3 (31-August-2012)    Swithced to updated controls
 v0.4 (08-October-2012)   Mute functionality is added
 v0.5 (23-October-2012)   Transfer to handset functionality and Call history is implemented - avalajh
 v0.6 (30-October-2012)   Switched to updated DialPad control - avalajh
 v0.7 (07-November-2012)  Implementation of ConferenceCall - avalajh
 v0.8 (10-December-2012)  Implementation of image request is done - avalajh
 v0.9 (19-December-2012)  Extra parameter are removed from OpenCallHistoryDb call - avalajh
 v0.10 (31-December-2012) Changes in implentation of OpenContactDb and OpenCallHistory call - avalajh
 v0.11 (08-January-2013)  Changes in implentation of ContactsDisambiguation and NumberDisambiguation context - avalajh
 v0.12 (09-January-2013)  Implementation of setting input field in DialPad is done - avalajh
 v0.13 (14-January-2013)  Implementation of removing input field in DialPad is done - avalajh
 v0.14 (22-January-2013)  Implementation as per new spec - avalajh
 v0.15 (25-January-2013)  Implementation of timer is changed - avalajh
 v0.16 (30-January-2013)  Implementation of Tab for RecentCalls is changed - avalajh
 v0.17 (31-January-2013)  Updated with error check for ctxt, tmplt & ctrlData - avalajh
 v0.18 (05-February-2013) Changes for Add Call feature - avalajh 
 v0.19 (08-February-2013) Updated to new dialPad events and dtmf button - avalajh
 v0.20 (11-February-2013) Changes are made in mute icon status - avalajh
                          Changes are made for "LastAll" category icons - avalajh
 v0.21 (19-February-2013) Implementation of long press functionality - avalajh
 v0.22 (20-February-2013) Changes in calling of OpenContactsDB - avalajh                          
                          Changes in calling of close call history DB - avalajh 
                          Implementation of hiding home button - avalajh 
 v0.23 (05-March-2013)    Made changes in implementation of ump - avalajh    
 v0.24 (06-March-2013)    Migrate from List control to List2 - avalajh                          
                          Made changes for source type - avalajh   
 v0.24 (14-March-2013)    Dialpad changes- avalajh   
 v0.25 (22-March-2013)    Made changes according to Contact Sort Order- avalajh   
 v0.26 (26-March-2013)    Made changes according for DTMF digit- avalajh 
 v0.27 (5-April-2013)     Implemented as per the new UI spec 3.90- avalajh 
 v0.28 (10-April-2013)    Remove firstName and LastName parameter- avalajh 
 v0.29 (15-April-2013)    Changes are made for Call Confirmation string- avalajh 
 v0.30 (23-April-2013)    Remove depreceated Alert Control- avalajh 
 v0.31 (30-April-2013)    Call waiting context is migrated from Dialog to Dialog2 control- avalajh 
 v0.32 (03-May-2013)      Implement new feature tooltip- avalajh 
 v0.32 (07-May-2013)      Clear cache value- avalajh 
 v0.33 (27-May-2013)      Changes are done for GoBack - avalajh 
 v0.34 (4-June-2013)      Required dictionary changes - avalajh 
 v0.35 (10-June-2013)     Changes for timer as well phone number flicker - avalajh 
 v0.36 (17-June-2013)     Changes are done VUI support. Added this._vuiFlag for listItemClickCallBack - avalajh 
 v0.37 (18-June-2013)     Migration to DialPad2 and added labelwidth property - avalajh 
 v0.38 (25-June-2013)     Changes are done or timer, when backup camera is in focus at time timer do not need to reset - avalajh 
 v0.39 (01-July-2013)     Changes are done for hold call state - avalajh
                          Added maxdigit property - avalajh
                          Changes in open/close DB request - avalajh
 v0.40 (3-July-2013)      Changes are made for Open/Close DB - avalajh 
 v0.41 (9-July-2013)      Changes are made for timer when it is on different context - avalajh 
 v0.42 (17-July-2013)     Wink style is changed from style01 to style03 - avalajh 
 v0.43 (18-July-2013)     Changes are made for DialPad, VUI and Unknown - avalajh 
 v0.44 (22-July-2013)     Populating data when error comes in response - avalajh 
 v0.45 (26-July-2013)     Changes in loading for call history screen. - avalajh 
 v0.46 (1-Aug-2013)       Category is not getting displayed on Call Confirmation screen - avalajh 
 v0.47 (5-Aug-2013)       Changes are done for contact disambiguation and call history loading screen - avalajh 
 v0.48 (7-Aug-2013)       Changes are done for contact disamb and call confirmation screen. - avalajh
 v0.49 (8-Aug-2013)       Made changes in icons - avalajh 
 v0.50 (9-Aug-2013)       Made changes in icons - avalajh 
 v0.51 (16-Aug-2013)      Added new message for TypeDisambiguation - avalajh 
 v0.52 (20-Aug-2013)      Updated formatDateTime api according to new fwk.(2 params) - avalajh
                          Removed TransferCall msg.
 v0.51 (21-Aug-2013)      Updated formatDate/time api - avalajh 
 v0.52 (23-Aug-2013)      As per the dictionary made changes in api of NumberDisambiguation, TypeDisambiguation, CallConfirmation - avalajh 
 v0.53 (23-Aug-2013)      MergeCall and SwapCall buttons are disabled on ActiveCall1/2 - avalajh 
 v0.54 (28-Aug-2013)      Changes are done for flicker on Active Call/1/2/Merged - avalajh 
 v0.55 (10-Sept-2013)     Changes in filter of GetContactIndex- avalajh 
 v0.56 (11-Sept-2013)      Added \u00A0 instead of &nbsp - avalajh 
 v0.57 (13-Sept-2013)     Changes in Call confirmation screen - avalajh 
 v0.58 (30-Sept-2013)     Removed DialPad context out api - avalajh 
 v0.59 (3-Oct-2013)       Changes are done in Callwaiting & ActiveCall1/2 screen for Japan region - avalajh 
 v0.60 (16-Oct-2013)      Changes are made for phone type - avalajh 
 v0.61 (6-June-2014)      Changes are made for imporved contact matching - avalajh 
 v0.62 (6-June-2014)      Changes are made for loading on call history - avalajh 
 v0.63 (2-July-2014)      Changes are made for swap calls icon - avalajh 
 __________________________________________________________________________

 */

log.addSrcFile("phoneApp.js", "phone");

/**********************************************
 * Start of Base App Implementation
 *             
 * Code in this section should not be modified
 * except for function names based on the appname
 *********************************************/

function phoneApp(uiaId)
{
    
    log.debug("constructor called...");
    
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
phoneApp.prototype.appInit = function()
{
    log.debug(" phoneApp appInit called...");
    
    if (framework.debugMode)
    {
        utility.loadScript("apps/phone/test/phoneAppTest.js");
    }    
    // cache
    this._cachedActiveCallInfo = null;    
    this._state = "off";    
    this._cachedCallId  = null;    
    this._cachedCmuOrPhone = "Vehicle";
    this._cachedPhoneNumber = null;    

    this._deviceStatus = "noDevice";
    this._devId = -1;
    this._cachedCallsChunk = null;    
    this._requestCallsChunkSize = 10; // This is the no. of records GUI requests for a single request from DBAPI 
    this._callListTotalCount = 0; // Total no of items that are available 
    this._missedCallListTotalCount = 0; // Total no of items that are available 
    this._callListActualDataCount = 0; // No o f items that are actually fetched and populated in the list
    this._callListCurrentOffset = 0; // Value from DBAPI response
    this._callListNeedDataOffsetIndex = 0; // Value from list need data Callback
    this._missedCallListNeedDataOffsetIndex = 0;
    this._cachedCallsList = new Array(); // This is the app's copy of the list data displayed  
    this._cachedMissedCallsList = new Array();
    this._callListMissedOffset = 0; // Value from list need data Callback
    this._missedCallListActualDataCount = 0;
    this._isMissedItemsPopulatedBefore = false;
    this._isAllItemsPopulatedBefore = false;
    this._contactFlag = false; // Flags for DB 
    this._callHistoryFlag = false;   
    this._contactsDbOpenStatus = false;
    this._callHistoryDbOpenStatus = false;
    
    // Contact List
    this._isItemsPopulatedBefore = false;
    this._cachedContactsChunk = null;
    this._cachedIconsChunk = null;
    this._requestChunkSize = 20; // This is the no. of records GUI requests for a single request from DBAPI
    this._listTotalCount = 0; // Total no of items that are available
    this._listActualDataCount = 0; // No o f items that are actually fetched and populated in the list
    this._listCurrentOffset = 0; // Value from DBAPI response
    this._listNeedDataOffsetIndex = 0; // Value from list need data Callback
    this._cachedContactsList = new Array(); // This is the app's copy of the list data displayed
    

    this._activeCallId = "";
    this._contact1Details = new Object();
    this._contact2Details = new Object();
    this._activeCallPhoneNumber = null;  

    this._cachedInputPhoneNumber = null; // Previous number set in input field of DialPad template

    // Call Confirmation Screen    
    this._cachedContactId = null;
    this._cachedPhoneNumber = null;
    this._cachedByVoice = null;
        
    this._cachedRecentTab = 1; // Recent tab which is selected in call histroy 
    this._cachedSbnCallId = null; // Store call id which have to show in SBN.
    /*For Timer Handling*/
    this._resetTimerValues();   
    this._cachedDtmfPhoneNumber = null; // To display the dtmf number send by MMUI
    this._cachedSbnType = null;    
    
    /* For new DBAPI Imterface*/
    this._freeObjectContactId = []; // To free contact object required contact Id array.
    this._freeObjectDbSeqId = [];// To free contact object required Db Sequence Id array.
    
    this._ctxtName = "";
    this._activeCallCtoPath = "common/images/icons/IcnDialogNoContactImage.png";
    this._vuiFlag = false; // VUI support flag 
    this._cachedCnfPhoneNumber = null;
    this._cachedConferenceType = ""; // Status of conference call either in connecting state or active state.
    
    this._dataListItems = new Array(); // For contact disambiguation screen datalist is created
    this._isActive = true; // To see whether call is on hold or in active state
    this._isActive1 = true; // To see whether call is on hold or in active state
    this._isActive2 = true; // To see whether call is on hold or in active state
    this._cachedGreyOutContactDb = true;
    this._cachedGreyOutCHDb = true;    
    this._callConfirmationStringOne = "";
    this._callConfirmationString = "";
    this._cachedCHAutoStatus = true; // AutoDownload is on
    
    this._CMUEvent = false;
    this._MuteEvent = false;
    this._SwapEvent = false;
    
    
    
   
   
    var selectCallback = this._selectCallback.bind(this);
    
    this._umpButtonConfigs = new Object();
    
    this._umpButtonConfigs["SelectComMenu"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpCommMenu",
        disabled : false,
        appData : "SelectComMenu",
        label : null,
        labelId : null,
        selectCallback: selectCallback,
    };    
    
    this._umpButtonConfigs["SelectEndCall"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpHangup",
        disabled : false,
        appData : "SelectEndCall",
        label : null,
        labelId : null,
        selectCallback: selectCallback,
    };
    this._umpButtonConfigs["SelectCMUAudio"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpPhoneRoute",
        currentState : "Handset",
        stateArray : [
            {
                state : "Handset",                
                label : null,
                labelId : null
            }, 
            {
                state : "Vehicle",                
                label : null,
                labelId : null
            }, 
        ],
        disabled : null,
        appData : "SelectCMUAudio",
        selectCallback: selectCallback,
    };
    this._umpButtonConfigs["SelectMuteCall"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpMuteUnmute",
        currentState : "Mute",
        stateArray : [
            {
                state : "Mute",              
                label : null,
                labelId : null
            }, 
            {
                state : "Unmute",               
                label : null,
                labelId : null
            }, 
        ],
        disabled : false,
        appData : "SelectMuteCall",
        selectCallback: selectCallback,
    };
    this._umpButtonConfigs["SelectAddCall"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpAddCall",
        disabled : false,
        appData : "SelectAddCall",
        label : null,
        labelId : null,
        selectCallback: selectCallback,
    };
    
    this._umpButtonConfigs["swapcalls_disabled"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpSwapCalls",
        currentState : "01",
        stateArray : [
            {
                state : "01",                
                label : null,
                labelId : null,
            }, 
            {
                state : "02",              
                label : null,
                labelId : null,
            }, 
        ],
        disabled : true,
        appData : "SelectSwitchCall",
        label : null,
        labelId : null,
        selectCallback: selectCallback,
    };
    this._umpButtonConfigs["swapcalls_enabled_call1active"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpSwapCalls",
        currentState : "01",
        stateArray : [
            {
                state : "01",             
                label : null,
                labelId : null,
            }, 
            {
                state : "02",            
                label : null,
                labelId : null,
            }, 
        ],
        disabled : false,
        appData : "SelectSwitchCall",
        label : null,
        labelId : null,
        selectCallback: selectCallback,
    };
    this._umpButtonConfigs["swapcalls_enabled_call2active"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpSwapCalls",
        currentState : "02",
        stateArray : [
            {
                state : "01",              
                label : null,
                labelId : null,
            }, 
            {
                state : "02",             
                label : null,
                labelId : null,
            }, 
        ],
        disabled : false,
        appData : "SelectSwitchCall",
        label : null,
        labelId : null,
        selectCallback: selectCallback,
    };    
    
    this._umpButtonConfigs["SelectDtmfShow"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpDialpad",
        disabled : false,
        appData : "SelectDtmfShow",
        label : null,
        labelId : null,
        selectCallback: selectCallback,
    };

    this._umpButtonConfigs["SelectMergeCall"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpMergecall",
        disabled : false,
        appData : "SelectMergeCall",
        label : null,
        labelId : null,
        selectCallback: selectCallback,
    }; 
    
    // Default config
    //@formatter:off
     //@formatter:on
     
     this._addCallCtxtDataList =
    {
        itemCountKnown : true, 
        itemCount : 3, 
        items : [           
            { appData : "SelectContacts", text1Id : "common.Contacts", itemStyle : "style02" , hasCaret : false},
            { appData : "SelectRecentCalls" , text1Id : "CallHistory", itemStyle : "style02", hasCaret : false},           
            { appData : "SelectDialPad", text1Id : "Dial", itemStyle : "style02", hasCaret : false}
        ]
    };

    this.tabClick = this._tabBtnClickCallback.bind(this);

    //Tabs Config
    this._tabsConfig = 
    [
        {
            "selectCallback" : this.tabClick,
            "label"         : null,
            "labelId"       : "AllCalls",
            "subMap"        : null,
            "tabStyle" : "tabsStyle1",
            "appData" : "AllCalls"
        },
        {
            "selectCallback" : this.tabClick,
            "label"         : null,
            "labelId"       : "MissedCalls",
            "subMap"        : null,
            "tabStyle" : "tabsStyle1",
            "appData" : "MissedCalls"
        },
   ]
    

    //@formatter:off
    this._contextTable = {
         "DialPad" : {
            "template" : "DialPad2Tmplt",
            "sbNameId" : "DialPad",
            "properties": {
                leftButtonVisible: true,
            },
            "controlProperties": {
                "DialPad2Ctrl" : {
                    defaultSelectCallback : this._dialpadEnterCallback.bind(this),
                    ctrlStyle : "DialpadStyle02",
                    appData : "DialPadPhone",
                    maxDigits: 40,
                    value: null,
                } // end of properties for "DialPad2Ctrl"                                       
            }, // end of list of controlProperties
            "leftBtnStyle": "goBack",
            "readyFunction" :this._DialPadCtxtTmpltReadyToDisplay.bind(this),
            "contextInFunction" : null,              
            "displayedFunction":  this._DialPadCtxtTmpltDisplayed.bind(this),
        }, // end of "DialPad"     
        "RecentCalls" : {
            "template" : "List2Tmplt",
            "sbNameId" : "CallHistory",
            "controlProperties": {
                "List2Ctrl" : {
                    "numberedList" : true,
                    "dataList": null,
                    titleConfiguration : 'tabsTitle',
                    title : {
                        titleStyle : 'style02',                       
                    },                 
                    tabsButtonConfig : {
                                    "style":"tabsStyle1",
                                    "defaultSelectCallback":null,
                                    "currentlySelectedTab":0,
                                    "tabsConfig":this._tabsConfig,
                                    "tabsGroup":"phone",                                    
                                    },
                    fullWidth : false,
                    selectCallback : this._listItemClickCallback.bind(this), 
                    longPressCallback : this._longPressCallback.bind(this),
                    needDataCallback : this._RecentCallsNeedDataCallback.bind(this),
                } // end of properties for "ListCtrl"                                       
            }, // end of list of controlProperties
            "leftBtnStyle": "goBack",
            "contextInFunction" : this._RecentCallsCtxtIn.bind(this),
            "readyFunction" : this._RecentCallsCtxtTmpltReadyToDisplay.bind(this),
        }, // end of "RecentCalls"
        "ChoosePhoneContact" : {
            "template" : "List2Tmplt",
            "sbNameId" : "Phone",
            "controlProperties": {
                "List2Ctrl" : {
                    hasLetterIndex : true,
                    numberedList : true,
                    dataList : this._cachedContactsList,   
                    titleConfiguration : 'listTitle',
                    title : {
                        text1Id : "SelectContact",
                        titleStyle : 'style02'                       
                    },
                    requestSize : 6,
                    selectCallback : this._listItemClickCallback.bind(this), 
                    needDataCallback : this._choosePhoneContactsNeedDataCallback.bind(this),
                } // end of properties for "ListCtrl"                                       
            }, // end of list of controlProperties
            "leftBtnStyle": "goBack",
            "readyFunction" : this._ChoosePhoneContactsCtxtTmpltReadyToDisplay.bind(this),
            "contextInFunction" : null,           
            "displayedFunction": null
        }, // end of "ChoosePhoneContacts" 
        "ContactsDisambiguation" : {
            "template" : "List2Tmplt",
            "sbNameId" : "Phone",
            "controlProperties": {
                "List2Ctrl" : {
                    "numberedList" : true,                  
                    titleConfiguration : 'listTitle',
                    title : {
                        text1Id : "SelectContact",
                        titleStyle : 'style02'                       
                    },                   
                    selectCallback : this._listItemClickCallback.bind(this), 
                    needDataCallback : null 
                } // end of properties for "ListCtrl"                                       
            }, // end of list of controlProperties
            "leftBtnStyle": "goBack",
            "readyFunction" : this._ContactDisambiguationCtxtTmpltReadyToDisplay.bind(this),
            "contextInFunction" : null,           
            "displayedFunction": null
        }, // end of "ContactsDisambiguation"
        "NumberDisambiguation" : {
            "template" : "List2Tmplt",
            "sbNameId" : "Phone",
            "controlProperties": {
                "List2Ctrl" : {
                    "numberedList" : true,
                    titleConfiguration : 'listTitle',
                    title : {
                        text1Id : "SelectNumber",
                        titleStyle : 'style02'                       
                    },                   
                    selectCallback : this._listItemClickCallback.bind(this), 
                    needDataCallback : null 
                } // end of properties for "ListCtrl"                                       
            }, // end of list of controlProperties
            "leftBtnStyle": "goBack",
            "readyFunction" : this._NumberDisambiguationCtxtTmpltReadyToDisplay.bind(this),
            "contextInFunction" : null,           
            "displayedFunction": null
        }, // end of "NumberDisambiguation"     
        "TypeDisambiguation" : {
            "template" : "List2Tmplt",
            "sbNameId" : "Phone",
            "controlProperties": {
                "List2Ctrl" : {
                    "numberedList" : true,
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02'                       
                    },  
                    selectCallback : this._listItemClickCallback.bind(this), 
                    needDataCallback : null 
                } // end of properties for "ListCtrl"                                       
            }, // end of list of controlProperties
            "leftBtnStyle": "goBack",
            "readyFunction" : this._TypeDisambiguationCtxtTmpltReadyToDisplay.bind(this),
            "contextInFunction" : null,           
            "displayedFunction": null
        }, // end of "TypeDisambiguation"               
        "CallConfirmation" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Phone",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "contentStyle" : "style17",
                    "titleStyle" : "titleStyle02",
                    "titleId" : "Call",
                    defaultSelectCallback :  this._dialogDefaultSelectCallback.bind(this),
                    buttonCount : 2,            
                    "buttonConfig" : {
                        "button1" : {                            
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",              
                            label: "No", 
                            labelId : "common.No",
                            subMap : null,
                            appData : "Global.No",
                            disabled : false
                        },
                        "button2" : {                            
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",                          
                            label: "Yes", 
                            labelId : "common.Yes",
                            subMap : null,
                            appData : "Global.Yes",
                            disabled : false
                        },
                    }, // end of buttonConfig                  
                    "initialFocus": 1,  
                } // end of properties for "DialogCtrl"                                       
            }, // end of list of controlProperties
            "readyFunction" : this._CallConfirmationCtxtTmpltReadyToDisplay.bind(this),
            "contextInFunction" : null,           
            "displayedFunction": null
        }, // end of "CallConfirmation"             
        "IncomingCall" : {
            "template" : "Dialog3Tmplt",
            "hideHomeBtn" : true,
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),              
                    "contentStyle" : "style04",
                    "titleStyle" : "titleStyle02",
                    "titleId" : "IncomingCall",
                    "fullScreen" : false,
                    "buttonCount" : 2,
                    "buttonConfig" : {
                        "button1" : {                            
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            buttonColor: "red",
                            label: "Ignore", 
                            labelId : "Ignore",
                            subMap : null,
                            appData : "SelectIgnore",
                            disabled : false
                        },
                        "button2" : {                            
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            buttonColor: "green",
                            label: "Answer", 
                            labelId : "Answer",
                            subMap : null,
                            appData : "SelectAnswer",
                            disabled : false
                        },
                    }, // end of buttonConfig
                    "initialFocus": 1,            
                } // end of properties for "DialogCtrl"                                       
            }, // end of list of controlProperties
            "readyFunction" : this._IncomingCallCtxtTmpltReadyToDisplay.bind(this),
            "contextInFunction" : null,           
            "displayedFunction": null
        }, // end of "IncomingCall" 
        "CallWaiting" : {
            "template" : "Dialog3Tmplt",           
            "hideHomeBtn" : true,
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),              
                    "contentStyle" : "style04",
                    "titleStyle" : "titleStyle02",
                    "titleId" : "IncomingCall",
                    "fullScreen" : false,
                    "buttonCount" : 3,
                    "buttonConfig" : {
                        "button1" : {                            
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            label: "Ignore", 
                            labelId: "Ignore", 
                            buttonColor: "red",
                            subMap : null,
                            appData : "SelectIgnore",
                            disabled : false
                        },
                        "button2" : {                            
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            label: "HoldAnswer", 
                            labelId: "HoldAnswer", 
                            subMap : null,
                            appData : "SelectHoldAnswer",
                            disabled : false
                        },   
                        "button3" : {                            
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            label: "EndAnswer", 
                            labelId: "EndAnswer", 
                            buttonColor: "green",
                            subMap : null,
                            appData : "SelectEndAnswer",
                            disabled : false
                        },                          
                    }, // end of buttonConfig
                    "initialFocus": 1,   
                } // end of properties for "Dialog2Ctrl"                                      
            }, // end of list of controlProperties
            "readyFunction" : this._CallWaitngCtxtTmpltReadyToDisplay.bind(this),
            "contextInFunction" : null,           
            "displayedFunction": null
        }, // end of "CallWaiting"
        "NoCallHistoryData" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Phone",
            "controlProperties": {
                "Dialog3Ctrl" : {          
                    "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),              
                    "contentStyle" : "style05",
                    "fullScreen" : false,
                    "buttonCount" : 1,
                    "buttonConfig" : {
                        "button1" : {                            
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            label: "ok", 
                            labelId: "common.Ok", 
                            subMap : null,
                            appData : "Global.Yes",
                            disabled : false
                        },                                          
                    }, // end of buttonConfig
                    text1Id : "NoCallHistoryData"
                } // end of properties for "DialogCtrl"                   
            },// End of Control Properties                    
            "readyFunction" : null,
            "contextInFunction" : null,           
            "displayedFunction": null
        }, // end of "NoCallHistoryData"  
       "NumberOrName" : {
            "template" : "Dialog3Tmplt",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),              
                    "contentStyle" : "style05",
                    "fullScreen" : false,
                    "buttonCount" : 2,
                    "buttonConfig" : {
                        "button1" : {                            
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            label: "Number", 
                            labelId: "Number", 
                            subMap : null,
                            appData : "SelectByNumber",
                            disabled : false
                        },
                        "button2" : {                            
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            label: "Name", 
                            labelId: "Name", 
                            subMap : null,
                            appData : "SelectByName",
                            disabled : false
                        },                       
                    }, // end of buttonConfig
                    "initialFocus": 1,  
                    "text1Id" : "NumberorName",
                } // end of properties for "NumberOrName"                                      
            }, // end of list of controlProperties
            "readyFunction" : this._NumberOrNameCtxtTmpltReadyToDisplay.bind(this),
            "contextInFunction" : null,           
            "displayedFunction": null
        }, // end of "NumberOrName"
        "RedialNoData" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Phone",
            "controlProperties": {
                "Dialog3Ctrl" : {                    
                    "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),              
                    "contentStyle" : "style05",
                    "fullScreen" : false,
                    "buttonCount" : 2,
                    "buttonConfig" : {
                        "button1" : {                            
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            label: "common.No", 
                            labelId: "common.No", 
                            subMap : null,
                            appData : "Global.No",
                            disabled : false
                        },
                        "button2" : {                            
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            label: "common.Yes", 
                            labelId: "common.Yes", 
                            subMap : null,
                            appData : "Global.Yes",
                            disabled : false
                        },                       
                    }, // end of buttonConfig
                    "initialFocus": 1,  
                    "text1Id" : "RedialNoDataFirst",
                    "text2Id" : "RedialNoDataSecond",
                } // end of properties for "DialogCtrl"                                       
            }, // end of list of controlProperties
            "readyFunction" : null,
            "contextInFunction" : null,           
            "displayedFunction": null
        }, // end of "RedialNoData"
        "AddCall" :  {
            "template" : "List2Tmplt", 
            "sbNameId" : "Phone",
            "controlProperties" : {
                "List2Ctrl" : {
                    "dataList" : this._addCallCtxtDataList,
                    titleConfiguration : 'listTitle',
                    title : {
                        text1Id : "AddCall",
                        titleStyle : 'style02'                       
                    }, 
                    selectCallback : this._listItemClickCallback.bind(this), 
                    needDataCallback : null 
                } // end of properties for "ListCtrl"
            }, // end of list of controlProperties
            "leftBtnStyle": "goBack",
            "readyFunction" : this._AddCallCtxtTmpltReadyToDisplay.bind(this), 
            "contextInFunction" : null, 
            "contextOutFunction" : null, 
            "displayedFunction" : null
        }, // end of "AddCall"
        "ActiveCall" :
        {
            "template" : "InCall2Tmplt",
            "sbNameId" : "Phone",
            "controlProperties" :
            {
                "InCall2Ctrl" :
                {
                    "ctrlStyle" : "OneCall",  
                    "contact1Details" : {
                        "isActive" : true,
                    },
                    "umpConfig" : {
                        "buttonConfig": {
                            "SelectComMenu"        : this._umpButtonConfigs["SelectComMenu"],
                            "SelectEndCall"        : this._umpButtonConfigs["SelectEndCall"],
                            "SelectCMUAudio"       : this._umpButtonConfigs["SelectCMUAudio"],
                            "SelectMuteCall"       : this._umpButtonConfigs["SelectMuteCall"],
                            "SelectAddCall"        : this._umpButtonConfigs["SelectAddCall"],
                            "swapcalls_disabled"   : this._umpButtonConfigs["swapcalls_disabled"],
                            "SelectDtmfShow"       : this._umpButtonConfigs["SelectDtmfShow"],
                        },
                        "umpStyle"                : "fullWidth",
                        "hasScrubber" : false
                    },
                } // end of properties for "inCall2Ctrl"
            }, // end of list of controlProperties
            "readyFunction" : this._ActiveCallCtxtTmpltReadyToDisplay.bind(this),
            "displayedFunction" : null,
        }, // end of "ActiveCall"        
        "ActiveCallDTMF" : {
            "template" : "DialPad2Tmplt",
            "sbNameId" : "ActiveCallDTMF",
            "sbNameIcon" : "common/images/icons/IcnSbnComm.png", 
            "properties": {
                leftButtonVisible: false,
            },
            "controlProperties": {
                "DialPad2Ctrl" : {
                    defaultSelectCallback : this._dtmfDialpadEnterCallback.bind(this),
                    ctrlStyle : "DialpadStyle01",
                    appData : "DialPadDtmf",
                }, // end of properties for "DialPad2Ctrl"                                       
            }, // end of list of controlProperties
            "leftBtnStyle": "goBack",
            "readyFunction" : this._DtmfReadyToDisplay.bind(this),
            "contextInFunction" : null,        
            "displayedFunction": null
        }, // end of "ActiveCallDTMF"       
        "ActiveCall1" :
        {
            "template" : "InCall2Tmplt",
            "contextFocusGroup" : "ActiveCallGroup",
            "sbNameId" : "Phone",
            "controlProperties": {
                "InCall2Ctrl" : {
                    "ctrlStyle" : "TwoCall",
                    "ctrlTitleId" : "Call1Active",   
                    "contact1Details" : {
                            "isActive" : true,
                    },
                    "contact2Details" : {
                            "isActive" : false,
                    }, 
                    "umpConfig" : {
                        "buttonConfig": {
                            "SelectComMenu"        : this._umpButtonConfigs["SelectComMenu"],
                            "SelectEndCall"        : this._umpButtonConfigs["SelectEndCall"],
                            "SelectCMUAudio"       : this._umpButtonConfigs["SelectCMUAudio"],
                            "SelectMuteCall"       : this._umpButtonConfigs["SelectMuteCall"],
                            "SelectMergeCall"      : this._umpButtonConfigs["SelectMergeCall"],
                            "swapcalls_enabled_call1active"  : this._umpButtonConfigs["swapcalls_enabled_call1active"],
                            "SelectDtmfShow"       : this._umpButtonConfigs["SelectDtmfShow"],
                        },                    
                    "umpStyle" : "fullWidth",
                    "hasScrubber" : false,
                    },
                }, // end of properties for "InCallCtrl"                              
            }, // end of list of controlProperties
            "readyFunction" : this._ActiveCall1CtxtTmpltReadyToDisplay.bind(this),
            "displayedFunction" : null,
        }, // end of "InCallActiveCall1"      
        "ActiveCall1DTMF" : {
            "template" : "DialPad2Tmplt",
            "properties": {
                leftButtonVisible: false,
            },
            "sbNameId" : "ActiveCall1DTMF",
            "sbNameIcon" : "common/images/icons/IcnSbnComm.png", 
            "controlProperties": {
                "DialPad2Ctrl" : {
                    defaultSelectCallback : this._dtmfDialpadEnterCallback.bind(this),
                    ctrlStyle : "DialpadStyle01",
                    appData : "ActiveCallDialPadDtmf",
                }, // end of properties for "DialPad2Ctrl"                                       
            }, // end of list of controlProperties
            "leftBtnStyle": "goBack",
            "readyFunction" : this._DtmfReadyToDisplay.bind(this),
            "contextInFunction" : null,           
            "displayedFunction": null
        }, // end of "ActiveCall1DTMF"        
        "ActiveCall2" :
        {
            "template" : "InCall2Tmplt",
            "contextFocusGroup" : "ActiveCallGroup",
            "sbNameId" : "Phone",
            "controlProperties": {
                "InCall2Ctrl" : {
                    "ctrlStyle" : "TwoCall",
                    "ctrlTitleId" : "Call2Active", 
                    "contact1Details" : {
                              "isActive" : false,
                    },
                    "contact2Details" : {
                              "isActive" : true,
                    },
                   "umpConfig" : {
                       
                       "buttonConfig": {
                        "SelectComMenu"        : this._umpButtonConfigs["SelectComMenu"],
                        "SelectEndCall"        : this._umpButtonConfigs["SelectEndCall"],
                        "SelectCMUAudio"       : this._umpButtonConfigs["SelectCMUAudio"],
                        "SelectMuteCall"       : this._umpButtonConfigs["SelectMuteCall"],
                        "SelectMergeCall"      : this._umpButtonConfigs["SelectMergeCall"],
                        "swapcalls_enabled_call2active" : this._umpButtonConfigs["swapcalls_enabled_call2active"],
                        "SelectDtmfShow"       : this._umpButtonConfigs["SelectDtmfShow"],
                     },                    
                    "umpStyle" : "fullWidth",
                    "hasScrubber" : false,
                   },
                }, // end of properties for "InCallCtrl"                              
            }, // end of list of controlProperties
            "readyFunction" : this._ActiveCall2CtxtTmpltReadyToDisplay.bind(this),
            "displayedFunction" : null,
        }, // end of "InCallActiveCall1"      
        "ActiveCall2DTMF" : {
            "template" : "DialPad2Tmplt",
            "properties": {
                leftButtonVisible: false,
            },
            "sbNameId" : "ActiveCall2DTMF",
            "sbNameIcon" : "common/images/icons/IcnSbnComm.png", 
            "controlProperties": {
                "DialPad2Ctrl" : {
                    defaultSelectCallback : this._dtmfDialpadEnterCallback.bind(this),
                    ctrlStyle : "DialpadStyle01",
                    appData : "ActiveCall2DialPadDtmf",
                }, // end of properties for "DialPad2Ctrl"                                       
            }, // end of list of controlProperties
            "leftBtnStyle": "goBack",
            "readyFunction" : this._DtmfReadyToDisplay.bind(this),
            "contextInFunction" : null,           
            "displayedFunction": null
        }, // end of "ActiveCall2DTMF"    
        "ActiveCallMerged" :
        {
            "template" : "InCall2Tmplt",
            "sbNameId" : "Phone",
            "controlProperties": {
                "InCall2Ctrl" : {
                    "ctrlStyle" : "TwoCall",
                    "ctrlTitleId" : "ConferenceCall",
                    "contact1Details" : {
                         "isActive" : true,
                    },
                    "contact2Details" : {
                         "isActive" : true,
                    },
                    "umpConfig" : {
                        "buttonConfig": {
                        "SelectComMenu"        : this._umpButtonConfigs["SelectComMenu"],
                        "SelectEndCall"        : this._umpButtonConfigs["SelectEndCall"],
                        "SelectCMUAudio"       : this._umpButtonConfigs["SelectCMUAudio"],
                        "SelectMuteCall"       : this._umpButtonConfigs["SelectMuteCall"],
                        "SelectAddCall"        : this._umpButtonConfigs["SelectAddCall"],
                        "swapcalls_disabled"   : this._umpButtonConfigs["swapcalls_disabled"],
                        "SelectDtmfShow"       : this._umpButtonConfigs["SelectDtmfShow"],
                    },                    
                    "umpStyle" : "fullWidth",
                    "hasScrubber" : false,
                    },
                }, // end of properties for "InCallCtrl"                              
            }, // end of list of controlProperties
            "readyFunction" : this._ActiveCallMergedCtxtTmpltReadyToDisplay.bind(this),
            "displayedFunction" : null,
        }, // end of "InCallActiveCallMerged"      
        "ActiveCallMergedDTMF" : {
            "template" : "DialPad2Tmplt",
            "properties": {
                leftButtonVisible: false,
            },
            "sbNameId" : "ActiveCallMergedDTMF",
            "sbNameIcon" : "common/images/icons/IcnSbnComm.png", 
            "controlProperties": {
                "DialPad2Ctrl" : {
                    defaultSelectCallback : this._dtmfDialpadEnterCallback.bind(this),
                    ctrlStyle : "DialpadStyle01",
                    appData : "ActiveCallMergedDialPadDtmf",
                }, // end of properties for "DialPad2Ctrl"                                       
            }, // end of list of controlProperties
            "leftBtnStyle": "goBack",
            "readyFunction" : this._DtmfReadyToDisplay.bind(this),
            "contextInFunction" : null,           
            "displayedFunction": null
        }, // end of "ActiveCallMergedDTMF"         
    }; // end of this._contextTable 
    //@formatter:on   
    
    //@formatter:off
    this._messageTable = {
        "MuteStatus" : this._MuteStatusMsgHandler.bind(this),
        "PbConnectStatus" : this._RecentCallsConnectStatusMsgHandler.bind(this),        
        "ContactDisambiguation" : this._SendContactIdMsgHandler.bind(this), 
        "NumberDisambiguation" : this._NumberDisambiguationMsgHandler.bind(this),        
        "TypeDisambiguation" : this._TypeDisambiguationMsgHandler.bind(this),
        "CallIdInfo" :  this._CallIdInfoMsgHandler.bind(this),
        "ActiveCallInfo" :  this._ActiveCallInfoMsgHandler.bind(this),
        "ConferenceCallInfo" : this._ConferenceCallInfoMsgHandler.bind(this),
        "FocusStatus" : this._CtxtFocusStatusMsgHandler.bind(this),
        "CallConfirmation" : this._CallConfirmationMsgHandler.bind(this),     
        "DialpadNumber" : this._DialPadUpdateNumbericFieldMsgHandler.bind(this),
        "GetLastDialledNo" : this._GetLastDialledNoMsgHandler.bind(this),
        "ShowCallEndSbn" : this._ShowCallEndSbnMsgHandler.bind(this),
        "GetFocusedData" : this._GetFocusedDataMsgHandler.bind(this),
        "ShowDtmfDigit" : this._ShowDtmfDigitMsgHandler.bind(this),
        "ShowDialFailedSbn" : this._ShowDialFailedSbnMsgHandler.bind(this),
        "DbGreyOut" : this._DbGreyOutMsgHandler.bind(this),
        "ResetTimer" : this._ResetTimerMsgHandler.bind(this),
        "ContactDetail" : this._ContactDetailMsgHandler.bind(this),
        "NoCallState" : this._NoCallStateMsgHandler.bind(this),       
        "CHAutoStatus" : this._CHAutoStatusMsgHandler.bind(this),       
    }; // end of this._messageTable 
    //@formatter:on
}


/**************************
 * Phone App Functions *
 **************************/

// Update ActiveCall2 Contact Details
phoneApp.prototype._updateActiveCall2ContactDetails = function(contactsInfoActiveCall2)
{
    if(this._cachedFavName2 != null && this._cachedConferenceCallNumberSecond == this._cachedFavPhoneNum2)
    {
        this._call2ContactName = this._cachedFavName2;
    }
    else
    { 
        this._call2DisplayName = contactsInfoActiveCall2.displayName;
        this._call2ContactName = this._call2DisplayName;                                    
    }
    if(contactsInfoActiveCall2.ctoPath)
    {
        this._call2CtoPath = contactsInfoActiveCall2.ctoPath;
        this._freeObjectContactId.push(contactsInfoActiveCall2.contactId);
        this._freeObjectDbSeqId.push(contactsInfoActiveCall2.dbSeqNo);
    }
    if(contactsInfoActiveCall2.numbers)
    {
        this._call2Numbers = contactsInfoActiveCall2.numbers;
    }
    this._call2ContactNumbers = new Object();
    if(this._call2Numbers)
    {
        for(var j=0; j<this._call2Numbers.length; j++)
        {
            this._call2ContactNumbers = this._call2Numbers[j];           
            
            if(this._call2ContactNumbers.category)
            {
                if(this._cachedConferenceCallNumberSecond === this._call2ContactNumbers.number)
                {
                    this._call2Type = this._phoneTypeValue(this._call2ContactNumbers.category);                 
                    break;
                }                                           
            }
        }
    }  
}

// Update ActiveCall1 Contact Details
phoneApp.prototype._updateActiveCall1ContactDetails = function(contactsInfoActiveCall1)
{    
    if(this._cachedFavName1 != null &&  this._cachedConferenceCallNumberFirst == this._cachedFavPhoneNum1)
    {
        this._call1ContactName = this._cachedFavName1;
    }        
    else
    {
        this._call1DisplayName = contactsInfoActiveCall1.displayName;
        this._call1ContactName = this._call1DisplayName;                                    
    }
    if(contactsInfoActiveCall1.ctoPath)
    {
        this._call1CtoPath = contactsInfoActiveCall1.ctoPath;
        this._freeObjectContactId.push(contactsInfoActiveCall1.contactId);
        this._freeObjectDbSeqId.push(contactsInfoActiveCall1.dbSeqNo);
    }

    if(contactsInfoActiveCall1.numbers)
    {
        this._call1Numbers = contactsInfoActiveCall1.numbers;
    }
    this._call1ContactNumbers = new Object();
    
    if(this._call1Numbers)
    {
        for(var j=0; j<this._call1Numbers.length; j++)
        {
            this._call1ContactNumbers = this._call1Numbers[j];            
            if(this._call1ContactNumbers.category)
            {
                if(this._cachedConferenceCallNumberFirst === this._call1ContactNumbers.number)
                {
                    this._call1Type = this._phoneTypeValue(this._call1ContactNumbers.category);                  
                    break;
                }                                           
            }
        }
    }    
}

// Update ActiveCall Contact Details 
phoneApp.prototype._updateActiveCallContactDetails = function(contactsInfoActiveCall)
{
    
    if(this._cachedFavName1 != null && this._activeCallPhoneNumber == this._cachedFavPhoneNum1 && this._activeCallId === "call1")
    {
        this.contactName = this._cachedFavName1;
    }
    else if(this._cachedFavName2 != null && this._activeCallPhoneNumber == this._cachedFavPhoneNum2 && this._activeCallId === "call2")
    {
        this.contactName = this._cachedFavName2;
    }
    else
    {
        this._cachedFavName1 = null;
        this._cachedFavName2 = null;
        this._cachedFavCallId = "";
        this._cachedFavPhoneNum1 = "";
        this._cachedFavPhoneNum2 = "";
        this.displayName = contactsInfoActiveCall.displayName;
        this.contactName = this.displayName;                                    
    }
    if(contactsInfoActiveCall.ctoPath)
    {
        this._activeCallCtoPath = contactsInfoActiveCall.ctoPath;
        this._freeObjectContactId.push(contactsInfoActiveCall.contactId);
        this._freeObjectDbSeqId.push(contactsInfoActiveCall.dbSeqNo);
    }
    if(contactsInfoActiveCall.numbers)
    {
        this.numbers = contactsInfoActiveCall.numbers;
    }
    this._contactNumbers = new Object();
    if(this.numbers)
    {
        for(var j=0; j<this.numbers.length; j++)
        {
            this._contactNumbers = this.numbers[j];
            
            if(this._contactNumbers.category)
            {             
                if(this._currentContext.ctxtId ==="IncomingCall" || this._currentContext.ctxtId === "CallWaiting" )
                {
                    if(this._cachedPhoneNumber === this._contactNumbers.number)
                    {
                        this._activeCallSourceType = this._phoneTypeValue(this._contactNumbers.category);                  
                        break;
                    }
                
                }
                if(this._currentContext.ctxtId === "ActiveCall")
                {
                    if(this._activeCallPhoneNumber === this._contactNumbers.number)
                    {
                        this._activeCallSourceType = this._phoneTypeValue(this._contactNumbers.category);                  
                        break;
                    }
                
                }                                                                        
            }
        }
    }
}

// Update Contact Details
phoneApp.prototype._updateContactDetails = function(contactsInfo)
{
    if(this._cachedFavName1 != null && this._cachedCnfPhoneNumber == this._cachedFavPhoneNum1 && this._activeCallId === "")
    {
        this.contactNameOfCall2 = this._cachedFavName1;
    }
    else 
    {
        this.displayNameOfCall2 = contactsInfo.displayName;
        this.contactNameOfCall2 = this.displayNameOfCall2;                                    
    }
    if(contactsInfo.ctoPath)
    {
        this._activeCallCtoPathForCall2 = contactsInfo.ctoPath;
        this._freeObjectContactId.push(contactsInfo.contactId);
        this._freeObjectDbSeqId.push(contactsInfo.dbSeqNo);
    }
    if(contactsInfo.numbers)
    {
        this.numbersOfCall2 = contactsInfo.numbers;
    }
    this._contactNumbersOfCall2 = new Object();
    if(this.numbersOfCall2)
    {
        for(var j=0; j<this.numbersOfCall2.length; j++)
        {
            this._contactNumbersOfCall2 = this.numbersOfCall2[j];
            if(this._contactNumbersOfCall2.category)
            {
                if(this._cachedCnfPhoneNumber === this._contactNumbersOfCall2.number)
                {
                    this._typeOfCall2 = this._contactNumbersOfCall2.category;
                    if((this._typeOfCall2 === "Mobile"))
                    {
                        this._typeOfCall2 = "Mobile";
                    }
                    else if((this._typeOfCall2 === "Home") || (this._typeOfCall2 === "Phone") || (this._typeOfCall2 === "Home_Phone"))
                    {                      
                        this._typeOfCall2 = "Home";
                    }
                    else if((this._typeOfCall2 === "Work") || (this._typeOfCall2 === "Office_Phone") || (this._typeOfCall2 === "Office_Mobile"))
                    {                      
                        this._typeOfCall2 = "Work";
                    }                
                    else if((this._typeOfCall2 === "Other")|| (this._typeOfCall2 === "Pager") ||  (this._typeOfCall2 === "Car") ||
                    (this._typeOfCall2 === "Any") || (this._typeOfCall2 === "Voice")|| (this._typeOfCall2 === "Pref"))
                    {                       
                        this._typeOfCall2 = "Other";
                    }
                    break;
                }
                                                
            }
        }
    }
}

/**************************
 * Context handlers
 **************************/
// ActiveCall Context
phoneApp.prototype._ActiveCallCtxtTmpltReadyToDisplay = function()
{ 
    
    this._ctxtName = "ActiveCall";
    this._updateActiveCallTimer();  
    log.debug("_ActiveCallCtxtTmpltReadyToDisplay..");
    if(this._currentContextTemplate)
    {          
        if(this._cachedActiveCallInfo)
        {
            this._populateActiveCallTitle();
        }
        log.debug("phoneApp _ActiveCallCtxtTmpltReadyToDisplay called...");            
        this._updateTransferToHandset(); 
       
        if (!this._contactsDbOpenStatus)
        {
            this._sendOpenContactDbRequest(this._deviceStatusId);
        }
        else
        {
            var params = {"deviceId" : this._deviceStatusId, "number" : this._activeCallPhoneNumber, "ctoType":"ThumbnailImage"};
            framework.sendRequestToDbapi(this.uiaId, this._getContactNameCallbackFn.bind(this), "pb", "GetContactByMatchedNumber", params);
        }      
    }
}

// ActiveCall1 Context
phoneApp.prototype._ActiveCall1CtxtTmpltReadyToDisplay = function()
{
    this._ctxtName = "ConferenceCall";
    this._updateConferenceCallTimer();    
    if(this._currentContextTemplate)
    {
        if(this._cachedConferenceCallInfoMsg)
        {
            this._populateActiveCallScreenTitle();
        }
        log.debug("phoneApp _ActiveCall1CtxtTmpltReadyToDisplay called...");
        this._updateTransferToHandset(); 
        if (!this._contactsDbOpenStatus)
        {
            this._sendOpenContactDbRequest(this._deviceStatusId);
        }
        else
        {       
            
            var params = {"deviceId" : this._deviceStatusId, "number" : this._cachedConferenceCallNumberFirst, "ctoType":"ThumbnailImage"};
            framework.sendRequestToDbapi(this.uiaId, this._getNumbrOneDetailsCallbackFn.bind(this), "pb", "GetContactByMatchedNumber", params);
                
            var params = {"deviceId" : this._deviceStatusId, "number" : this._cachedConferenceCallNumberSecond, "ctoType":"ThumbnailImage"};
            framework.sendRequestToDbapi(this.uiaId, this._getNumberTwoDetailsCallbackFn.bind(this), "pb", "GetContactByMatchedNumber", params);            
        }           
    }
    this.firstName = "";
    this.lastName = "";
    this.contactName = "";
    this.displayName = "";   
    this._type = "";
    this._activeCallSourceType = ""
    this._activeCallCtoPath = "common/images/icons/IcnDialogNoContactImage.png";
    
    this._call1FirstName = "";
    this._call1LastName = "";
    this._call1ContactName = "";
    this._call1DisplayName = "";
    this._call1CtoPath = "";
    this._call1Type = "";
    
    this._call2FirstName = "";
    this._call2LastName = "";
    this._call2ContactName = "";
    this._call2DisplayName = "";
    this._call2CtoPath = "";
    this._call2Type = "";
}

// ActiveCall2 Context
phoneApp.prototype._ActiveCall2CtxtTmpltReadyToDisplay = function()
{
    this._ctxtName = "ConferenceCall";
    this._updateConferenceCallTimer();    
    if(this._currentContextTemplate)
    { 
        if(this._cachedConferenceCallInfoMsg)
        {
            this._populateActiveCallScreenTitle();
        }
        log.debug("phoneApp _ActiveCall2CtxtTmpltReadyToDisplay called...");
        this._updateTransferToHandset();
        if (!this._contactsDbOpenStatus)
        {
            this._sendOpenContactDbRequest(this._deviceStatusId);
        }
        else
        {               
            var params = {"deviceId" : this._deviceStatusId, "number" : this._cachedConferenceCallNumberFirst, "ctoType":"ThumbnailImage"};
            framework.sendRequestToDbapi(this.uiaId, this._getNumbrOneDetailsCallbackFn.bind(this), "pb", "GetContactByMatchedNumber", params);
                
            var params = {"deviceId" : this._deviceStatusId, "number" : this._cachedConferenceCallNumberSecond, "ctoType":"ThumbnailImage"};
            framework.sendRequestToDbapi(this.uiaId, this._getNumberTwoDetailsCallbackFn.bind(this), "pb", "GetContactByMatchedNumber", params);
        }                      
    }
}

// ActiveCallMerged Context
phoneApp.prototype._ActiveCallMergedCtxtTmpltReadyToDisplay = function()
{
    this._ctxtName = "ConferenceCall";
    this._updateConferenceCallTimer();    
    if(this._currentContextTemplate)
    { 
        if(this._cachedConferenceCallInfoMsg)
        {
            this._populateActiveCallScreenTitle();
        }
        log.debug("phoneApp _ActiveCallMergedCtxtTmpltReadyToDisplay called...");
        this._updateTransferToHandset();
        if (!this._contactsDbOpenStatus)
        {
            this._sendOpenContactDbRequest(this._deviceStatusId);
        }
        else
        {            

            var params = {"deviceId" : this._deviceStatusId, "number" : this._cachedConferenceCallNumberFirst, "ctoType":"ThumbnailImage"};
            framework.sendRequestToDbapi(this.uiaId, this._getNumbrOneDetailsCallbackFn.bind(this), "pb", "GetContactByMatchedNumber", params);
                
            var params = {"deviceId" : this._deviceStatusId, "number" : this._cachedConferenceCallNumberSecond, "ctoType":"ThumbnailImage"};
            framework.sendRequestToDbapi(this.uiaId, this._getNumberTwoDetailsCallbackFn.bind(this), "pb", "GetContactByMatchedNumber", params);                
        }                       
    }
}

// IncomingCall ctxt
phoneApp.prototype._IncomingCallCtxtTmpltReadyToDisplay = function()
{
    if(this._currentContextTemplate)
    {        
        log.debug("phoneApp _IncomingCallCtxtTmpltReadyToDisplay called...");        
        if (this._cachedCallIdInfoMsg)
        {  
            log.debug("Populating Dialog ctrl from _IncomingCallCtxtTmpltReadyToDisplay");         
            this._disableIncomingButtons();
            if (!this._contactsDbOpenStatus)
            {
                this._sendOpenContactDbRequest(this._deviceStatusId);
            }
            else
            {
                var params = {"deviceId" : this._deviceStatusId, "number" : this._cachedPhoneNumber, "ctoType":"ThumbnailImage"};
                framework.sendRequestToDbapi(this.uiaId, this._getContactNameCallbackFn.bind(this), "pb", "GetContactByMatchedNumber", params);                
            }                   
        }
    }    
}

//DialPad ctxt
phoneApp.prototype._DialPadCtxtTmpltReadyToDisplay = function(captureData)
{
    log.debug("DialPad Ctxt ready to display..");
    if (captureData)
    {
       captureData.templateContextCapture.controlData.inputValue = "";
    }
}

phoneApp.prototype._DialPadCtxtTmpltDisplayed = function()
{    
    log.debug("DialPad Ctxt displayed..");
    if(this._currentContextTemplate)
    {        
        log.debug("DialPad Ctxt displayed.. currentctxttmplt");
        this._populateDialPadCtrl();
    }
}

// CallWaitng ctxt
phoneApp.prototype._CallWaitngCtxtTmpltReadyToDisplay = function()
{
    if(this._currentContextTemplate)
    { 
        log.debug("phoneApp _CallWaitngCtxtTmpltReadyToDisplay called...");
         
        if (this._cachedCallIdInfoMsg)
        {  
            log.debug("Populating Dialog ctrl from _CallWaitngCtxtTmpltReadyToDisplay");      
            this._disableCallWaitingButtons();
            if (!this._contactsDbOpenStatus)
            {
                this._sendOpenContactDbRequest(this._deviceStatusId);
            }
            else
            {
                var params = {"deviceId" : this._deviceStatusId, "number" : this._cachedPhoneNumber, "ctoType":"ThumbnailImage"};
                framework.sendRequestToDbapi(this.uiaId, this._getContactNameCallbackFn.bind(this), "pb", "GetContactByMatchedNumber", params);                
            }                  
        }   
    }
}

// ContactDisambiguation Context
phoneApp.prototype._ContactDisambiguationCtxtTmpltReadyToDisplay = function()
{ 
    this._dataListItems = new Array();
    log.debug("Contacts dis ready to display");   
    if(this._currentContextTemplate)
    {        
        if (!this._contactsDbOpenStatus)
        {                   
            this._sendOpenContactDbRequest(this._deviceStatusId);
        } 
        else
        {               
            for(var i=0; i<this._cachedContactCount; i++)
            {
                var params = {"deviceId" : this._deviceStatusId, "contactId" : this._cachedContactIdList[i], "ctoType":"ThumbnailImage"};
                framework.sendRequestToDbapi(this.uiaId, this._getContactForDisambiguityCallbackFn.bind(this), "pb", "GetContactDetails", params);
            }       
        }      
    }
}

// Number Disambiguation Context
phoneApp.prototype._NumberDisambiguationCtxtTmpltReadyToDisplay = function()
{
    if(this._currentContextTemplate)
    {        
        if (!this._contactsDbOpenStatus)
        {
            this._sendOpenContactDbRequest(this._deviceStatusId);
        } 
        else
        {
            var params = {"deviceId" : this._deviceStatusId, "contactId" : this._cachedContactNumberId, "ctoType":"ThumbnailImage"};
            framework.sendRequestToDbapi(this.uiaId, this._getContactDetailsCallbackFn.bind(this), "pb", "GetContactDetails", params);
        }       
    }
}

// TypeDisambiguation Context
phoneApp.prototype._TypeDisambiguationCtxtTmpltReadyToDisplay = function()
{
    if(this._currentContextTemplate)
    {        
        if (!this._contactsDbOpenStatus)
        {                   
            this._sendOpenContactDbRequest(this._deviceStatusId);
        }
        else
        {
            var params = {"deviceId" : this._deviceStatusId, "contactId" : this._cachedContactNumberId, "ctoType":"ThumbnailImage"};
            framework.sendRequestToDbapi(this.uiaId, this._getContactDetailsCallbackFn.bind(this), "pb", "GetContactDetails", params);
        }       
    }
}

// CallConfirmation Context
phoneApp.prototype._CallConfirmationCtxtTmpltReadyToDisplay = function()
{
    if(this._currentContextTemplate)
    {        
        if (!this._contactsDbOpenStatus)
        {
            this._sendOpenContactDbRequest(this._deviceStatusId);
        }
        else
        {
            var params = {"deviceId" : this._deviceStatusId, "number" : this._cachedCnfPhoneNumber, "ctoType":"ThumbnailImage"};
            framework.sendRequestToDbapi(this.uiaId, this._getContactNameCallbackFnForCall2.bind(this), "pb", "FindContactsByNumber", params);
        }
    }
}

//Context in function called before the template is instantiated
phoneApp.prototype._RecentCallsCtxtIn = function()
{
    log.debug("In _RecentCallsCtxtIn ...");
    if(this._currentContext && this._currentContext.ctxtId)
    {
        switch(this._currentContext.ctxtId)
        {
            case "RecentCalls" :
                if(this._currentContext.params && this._currentContext.params.payload && this._currentContext.params.payload.recentTab)
                {
                    this._cachedRecentTab = this._currentContext.params.payload.recentTab;
                }
                if(this._cachedRecentTab == 1)
                {
                    this._contextTable.RecentCalls.controlProperties.List2Ctrl.tabsButtonConfig.currentlySelectedTab = 0;
                }
                else if(this._cachedRecentTab == 2)
                {
                    this._contextTable.RecentCalls.controlProperties.List2Ctrl.tabsButtonConfig.currentlySelectedTab = 1;
                }
                break;
            default :
                // do nothing
                break;
        }
    }
}   
 
// RecentCalls ctxt 
phoneApp.prototype._RecentCallsCtxtTmpltReadyToDisplay = function(params)
{ 
    if(params)
    {
        log.debug("Value of params is" + JSON.stringify(params));
        params.skipRestore = true;        
    }
    else
    {
        log.debug("No params");
    }
    log.debug("_RecentCallsCtxtTmpltReadyToDisplay..");
    
    if (this._currentContextTemplate)
    { 
        if(this._cachedGreyOutCHDb)
        {
            if(!this._cachedCHAutoStatus)
            {
                if(this._cachedRecentTab == 1)
                {                
                    this._populateRecentCallCtxtList();
                }
                else if(this._cachedRecentTab == 2)
                {
                     this._populateMissedRecentCallCtxtList();                
                }            
            }
            else
            {
                this._startCallHistoryTimer();            
            }
        }
        else
        {
            if (!this._callHistoryDbOpenStatus)
            {
                log.debug("if.._RecentCallsCtxtTmpltReadyToDisplay..this._callHistoryDbOpenStatus" + this._callHistoryDbOpenStatus);
                this._sendOpenCallHistoryDbRequest(this._devId);
            }
            else
            {
                log.debug("else..this._callHistoryDbOpenStatus" + this._callHistoryDbOpenStatus);
                if(this._callHistoryDbOpenStatus)
                {
                    if(this._cachedRecentTab == 1)
                    {
                        this._resetCallHistoryVariableValues();  
                        var params = {"deviceId":this._devId, "limit":this._requestCallsChunkSize, "offset":(this._callListNeedDataOffsetIndex), "category":"LastAll", "sort":"OrderId"}; 
                        framework.sendRequestToDbapi(this.uiaId, this._getRecentCallsCallbackFn.bind(this), "pb", "GetCallHistory", params);            
                    }  
                    else if(this._cachedRecentTab == 2)
                    {
                        this._resetCallHistoryVariableValues();
                        var params = {"deviceId":this._devId, "limit":this._requestCallsChunkSize, "offset":(this._missedCallListNeedDataOffsetIndex), "category":"Missed"}; 
                        framework.sendRequestToDbapi(this.uiaId, this._getMissedCallsCallbackFn.bind(this), "pb", "GetCallHistory", params);            
                    }          
                }        
            }         
        }
    }
}

// ChoosePhoneContacts ctxt
phoneApp.prototype._ChoosePhoneContactsCtxtTmpltReadyToDisplay = function()
{
    if (this._currentContextTemplate)
    {        
        if (!this._contactsDbOpenStatus)
        {
            this._sendOpenContactDbRequest(this._deviceStatusId);
        }
        else
        {
            this._resetVariableValues();
            this._choosePhoneContactIndex();
            //Send Get Contacts Request to DBAPI
            var params = {"deviceId":this._deviceStatusId, "limit":this._requestChunkSize, "offset":(this._listNeedDataOffsetIndex),"ctoType":"ThumbnailImage", "sort" : "OrderId" , "filter" : "Calls"};
            framework.sendRequestToDbapi(this.uiaId, this._getContactsCallbackFn.bind(this), "pb", "GetContacts", params);
        }       
    }
}

// Add Call Context Ready To Display
phoneApp.prototype._AddCallCtxtTmpltReadyToDisplay = function()
{
    if (this._currentContextTemplate)
    { 
        log.debug("_AddCallCtxtTmpltReadyToDisplay");
        this._populateGreyOutListCtrl();
    }
}

//Number or Name Context Ready To Display
phoneApp.prototype._NumberOrNameCtxtTmpltReadyToDisplay = function()
{
    if (this._currentContextTemplate)
    { 
        log.debug("_AddCallCtxtTmpltReadyToDisplay");
        this._populateGreyOutNumberOrName();
    }
}

phoneApp.prototype._DtmfReadyToDisplay = function()
{
    if(this._currentContextTemplate)
    {
        this._populateDtmfDialPadCtrl();
    }
}

/**************************
 * Message handlers
 **************************/

phoneApp.prototype._SendContactIdMsgHandler = function(msg)
{
    log.debug("_SendContactIdMsgHandler.." + msg);
    if (msg && msg.params && msg.params.payload && msg.params.payload.contactsCount && msg.params.payload.contactIdList)
    {
        this._cachedContactCount = msg.params.payload.contactsCount;
        this._cachedContactIdList = new Array();
        this.listOfContactsAb = new Array();
        this.numbers = new Array();// Store numbers from Dbapi
        this.contactIdctr = 0;
        this._cachedContactIdList = msg.params.payload.contactIdList;      
        this._dataListItems = new Array();
        this.listOfContacts = "";
        this.contactIdList = "";
    }
}

phoneApp.prototype._RecentCallsConnectStatusMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.connStatus && msg.params.payload.deviceId)  
    {  
        log.debug(" _PbConnectStatusMsgHandler  called...",msg);    
        this._deviceStatus = msg.params.payload.connStatus;
            
        if (this._deviceStatus === "connected")
        {
            this._devId = msg.params.payload.deviceId;
            this._deviceStatusId = msg.params.payload.deviceId;
        }        
        
        else if (this._deviceStatus === "noDevice")
        {
            this._resetTimerValues(); 
            this._freeContactObject();
            //Send CloseDB request to DBAPI                       
            this._sendCloseContactDbRequest(this._deviceStatusId);
                   
            this._deviceStatusId = msg.params.payload.deviceId; // update deviceId after closing contacts db        
            this._cachedContactsList.splice(0,this._listActualDataCount);
            this._listNeedDataOffsetIndex = 0;
            this._listActualDataCount = 0;
            this._listTotalCount = 0;
            this._isItemsPopulatedBefore = false;
            this._cachedContactsChunk = null;
            this._cachedIconsChunk = null;
            this._cachedGreyOutCHDb = true;  
            this._cachedGreyOutContactDb = true;
            
            //Send CloseDB request to DBAPI
             log.debug(" value in disconnect.. this._callHistoryDbOpenStatus" + this._callHistoryDbOpenStatus);     
                       
            this._sendCloseCallHistoryDbRequest(this._devId);
            
            this._devId = msg.params.payload.deviceId; // update deviceId after closing contacts db        
                        
            // empty the list   
            if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "RecentCalls")
            {          
                if(this._cachedRecentTab == 1)
                {                
                    this._populateRecentCallCtxtList();
                }
                else if(this._cachedRecentTab == 2)
                {
                     this._populateMissedRecentCallCtxtList();
                    
                }
            }             
        }
    }    
}

// CallIdInfo Msg handler
phoneApp.prototype._CallIdInfoMsgHandler = function(msg)
{
    this.firstName = "";
    this.lastName = "";
    this.contactName = "";
    this.displayName = "";   
    this._activeCallSourceType = "";
    this._activeCallCtoPath = "common/images/icons/IcnDialogNoContactImage.png";
    
    this._cachedPhoneNumber = "";
    log.debug("CallIdInfoMsgHandler received", msg);    
    if(msg && msg.params && msg.params.payload && msg.params.payload.callIdInfoMsg && msg.params.payload.callIdInfoMsg.callId && msg.params.payload.callIdInfoMsg.cmuorphone)
    {
        this._cachedCallIdInfoMsg = msg.params.payload.callIdInfoMsg; 
        this._cachedCallId = msg.params.payload.callIdInfoMsg.callId;
        this._cachedCmuOrPhone = msg.params.payload.callIdInfoMsg.cmuorphone;
        
        if(msg.params.payload.callIdInfoMsg.phoneNumber)
        {
            this._cachedPhoneNumber = msg.params.payload.callIdInfoMsg.phoneNumber;
        }
        else
        {
            this._cachedPhoneNumber = null;
        }
     
        if (!this._contactsDbOpenStatus)
        {
            this._sendOpenContactDbRequest(this._deviceStatusId);
        }
        else
        {
            var params = {"deviceId" : this._deviceStatusId, "number" : this._cachedPhoneNumber, "ctoType":"ThumbnailImage"};
            framework.sendRequestToDbapi(this.uiaId, this._getContactNameCallbackFn.bind(this), "pb", "GetContactByMatchedNumber", params);            
        }             
        if (this._currentContext && this._currentContextTemplate)
        {
            switch(this._currentContext.ctxtId)
            {
                case "IncomingCall":
                    this._disableIncomingButtons();
                    break;
                case "CallWaiting":
                    this._disableCallWaitingButtons();
                    break;                    
                default :                   
                    break
            }
        } 
    }    
}

// ActiveCallInfo Msg handler
phoneApp.prototype._ActiveCallInfoMsgHandler = function(msg)
{
    log.debug("Active CAll info msg handler");
    this.firstName = "";
    this.lastName = "";
    this.contactName = "";
    this.displayName = ""; 
    this._activeCallSourceType = "";
    this._activeCallCtoPath = "";
    this._activeCallPhoneNumber = null;    
    if(msg && msg.params && msg.params.payload && msg.params.payload.activeCallInfoMsg 
                && msg.params.payload.activeCallInfoMsg.type && msg.params.payload.activeCallInfoMsg.callId 
                            && msg.params.payload.activeCallInfoMsg.cmuorphone && msg.params.payload.activeCallInfoMsg.mute)
    {
        log.debug(msg);
        this._cachedActiveCallInfo = msg.params.payload.activeCallInfoMsg.type;
        this._activeCallId =  msg.params.payload.activeCallInfoMsg.callId;
        this._cachedCmuOrPhone = msg.params.payload.activeCallInfoMsg.cmuorphone;
        this._cachedMute = msg.params.payload.activeCallInfoMsg.mute;
        if(this._cachedCmuOrPhone)
        {
            this._CMUEvent = false; // Value is setting as false in response of msg
        }
        if(this._cachedMute)
        {
            this._MuteEvent = false; // Value is setting as false in response of msg
        }
        if(msg.params.payload.activeCallInfoMsg.phoneNumber)
        {
            this._activeCallPhoneNumber =  msg.params.payload.activeCallInfoMsg.phoneNumber;
        }
        else
        {
            this._activeCallPhoneNumber = null;
        }
        if(msg.params.payload.activeCallInfoMsg.isActive)
        {
            this._isActive =  true;
        }
        else
        {
            this._isActive =  false;
        }

        if(this._cachedMute === "on")
        {
             this._cachedMute = "Unmute";                
        }
        else if(this._cachedMute === "off")
        {
            this._cachedMute = "Mute";                
        }  
        
        
        this._ctxtName = "ActiveCall";
        this._updateActiveCallTimer();
        if (this._currentContext && this._currentContextTemplate)
        {
            switch (this._currentContext.ctxtId)            
            {                
                case "ActiveCall":  
                    if (!this._contactsDbOpenStatus)
                    {
                        this._sendOpenContactDbRequest(this._deviceStatusId);
                    }
                    else
                    {
                        var params = {"deviceId" : this._deviceStatusId, "number" : this._activeCallPhoneNumber, "ctoType":"ThumbnailImage"};
                        framework.sendRequestToDbapi(this.uiaId, this._getContactNameCallbackFn.bind(this), "pb", "GetContactByMatchedNumber", params);
                    }
                    this._updateTransferToHandset();                
                    this._populateActiveCallTitle();                    
                    break;             
                default:
                    log.debug("Do nothing");
                    break;
            }
        }                  
    }    
}

// ConferenceCall Info Msg 
phoneApp.prototype._ConferenceCallInfoMsgHandler = function(msg)
{ 
    this._cachedConferenceCallInfoMsg = "";
    this._call1FirstName = "";
    this._call1LastName = "";
    this._call1ContactName = "";
    this._call1DisplayName = "";
    this._call1CtoPath = "";
    this._call1Type = "";   
    this._call2FirstName = "";
    this._call2LastName = "";
    this._call2ContactName = "";
    this._call2DisplayName = "";
    this._call2CtoPath = "";
    this._call2Type = "";   
    this._cachedConferenceType = ""; // Status of conference call either in connecting state or active state.
    log.debug("_ConferenceCallInfoMsgHandler received", msg);
    if(msg && msg.params && msg.params.payload && msg.params.payload.conferenceCallInfoMsg)
    {
        this._SwapEvent = false; // Value is setting as false in response of msg
        this._cachedConferenceCallInfoMsg = msg.params.payload.conferenceCallInfoMsg;
        this._cachedConferenceType = msg.params.payload.conferenceCallInfoMsg.type;
        if(msg.params.payload.conferenceCallInfoMsg.phoneNumber1)
        {
           this._cachedConferenceCallNumberFirst = msg.params.payload.conferenceCallInfoMsg.phoneNumber1;
        }
        else
        {
             this._cachedConferenceCallNumberFirst = null;
        }
        if(msg.params.payload.conferenceCallInfoMsg.phoneNumber2)
        {
           this._cachedConferenceCallNumberSecond = msg.params.payload.conferenceCallInfoMsg.phoneNumber2;
        }
        else
        {
             this._cachedConferenceCallNumberSecond = null;
        }   
        if(msg.params.payload.conferenceCallInfoMsg.cmuorphone)
        {
            this._cachedCmuOrPhone = msg.params.payload.conferenceCallInfoMsg.cmuorphone;
            this._CMUEvent = false; // Value is setting as false in response of msg
        }
        if(msg.params.payload.conferenceCallInfoMsg.mute)
        {
            this._cachedMute = msg.params.payload.conferenceCallInfoMsg.mute;
            this._MuteEvent = false; // Value is setting as false in response of msg
        }
        if(msg.params.payload.conferenceCallInfoMsg.isActive1)
        {
            this._isActive1 =  true;
        }
        else
        {
            this._isActive1 =  false;
        }
        if(msg.params.payload.conferenceCallInfoMsg.isActive2)
        {
            this._isActive2 =  true;
        }
        else
        {
            this._isActive2 =  false;
        }

        if(this._cachedMute === "on")
        {
             this._cachedMute = "Unmute";                
        }
        else if(this._cachedMute === "off")
        {
            this._cachedMute = "Mute";                
        }        
        this._ctxtName = "ConferenceCall";
        this._updateConferenceCallTimer();   
        if (this._currentContext && this._currentContextTemplate)
        {
            switch (this._currentContext.ctxtId)            
            {                
                case "ActiveCall1":                   
                case "ActiveCall2":                  
                case "ActiveCallMerged": 
                    if (!this._contactsDbOpenStatus)
                    {
                        this._sendOpenContactDbRequest(this._deviceStatusId);
                    }
                    else
                    {            
                        var params = {"deviceId" : this._deviceStatusId, "number" : this._cachedConferenceCallNumberFirst, "ctoType":"ThumbnailImage"};
                        framework.sendRequestToDbapi(this.uiaId, this._getNumbrOneDetailsCallbackFn.bind(this), "pb", "GetContactByMatchedNumber", params);
                        
                        var params = {"deviceId" : this._deviceStatusId, "number" : this._cachedConferenceCallNumberSecond, "ctoType":"ThumbnailImage"};
                        framework.sendRequestToDbapi(this.uiaId, this._getNumberTwoDetailsCallbackFn.bind(this), "pb", "GetContactByMatchedNumber", params);
                    }
                    this._updateTransferToHandset();
                    this._populateActiveCallScreenTitle();
                    break;              
                default:
                    log.debug("Do nothing");
                    break;
            }
        }                       
    }
}

// MuteStatus msg
phoneApp.prototype._MuteStatusMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.mute)
    {
        this._MuteEvent = false;
        var id = msg.params.payload.mute;
        switch(id)
        {
            case "on":
                this._cachedMute = "Unmute";                
                break;
            case "off":
                this._cachedMute = "Mute";                
                break;            
            default :
                break;
        }
        if (this._currentContext && this._currentContextTemplate)
        {
            switch(this._currentContext.ctxtId)
            {
                case "ActiveCall":
                case "ActiveCall1":
                case "ActiveCall2":
                case "ActiveCallMerged":                
                    this._updateMute();
                    break;
                default :                   
                    break
            }
        }
    }    
}

// CtxtFocusStatus msg 
phoneApp.prototype._CtxtFocusStatusMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.FocusOut)
    {
        this._cachedFocusOut = msg.params.payload.FocusOut;
        if(this._cachedFocusOut == 1)
        {
            log.debug("cached focus sout is one");                          
            this._sendCloseContactDbRequest(this._deviceStatusId);                     
        }
        else if(this._cachedFocusOut == 2)
        {                     
            this._sendCloseCallHistoryDbRequest(this._devId);               
        }
        else if(this._cachedFocusOut == 3)
        {                        
            this._sendCloseContactDbRequest(this._deviceStatusId);            
            //Send CloseDB request to DBAPI                 
            this._sendCloseCallHistoryDbRequest(this._devId);                      
        }    
    }   
}

// NumberDisambiguation msg handler
phoneApp.prototype._NumberDisambiguationMsgHandler = function(msg)
{
    log.debug("_NumberDisambiguationMsgHandler..");
    if (msg && msg.params && msg.params.payload && msg.params.payload.contactId && msg.params.payload.contactType)
    {
        this._cachedContactNumberId = msg.params.payload.contactId;
        this._cachedContactNumberType = msg.params.payload.contactType;
    }
}

// TypeDisambiguation msg handler
phoneApp.prototype._TypeDisambiguationMsgHandler = function(msg)
{
    log.debug("_TypeDisambiguationMsgHandler..");
    if (msg && msg.params && msg.params.payload && msg.params.payload.contactId && msg.params.payload.contactType)
    {
        this._cachedContactNumberId = msg.params.payload.contactId;
        this._cachedTypeDisambType = msg.params.payload.contactType;
    }
}

// SBN msg
phoneApp.prototype._ShowCallEndSbnMsgHandler = function(msg)
{
    log.debug("_ShowCallEndSbnMsgHandler");
    if (msg && msg.params && msg.params.payload && msg.params.payload.callId)
    {
        log.debug("inside payload of sbn");
        this._cachedSbnCallId = msg.params.payload.callId;        
        this._populateCallEndSbn();                
    }
}

// CallConfirmation msg handler
phoneApp.prototype._CallConfirmationMsgHandler = function(msg)
{
    this._callConfirmationString = "";
    this._callConfirmationStringOne = "";
    this.firstNameOfCall2 = "";
    this.lastNameOfCall2 = "";
    this.contactNameOfCall2 = "";
    this.displayNameOfCall2 = "";
    this._contactNumbersOfCall2 = new Object();
    this._typeOfCall2 = "";  
    this._cachedCnfPhoneNumber = "";
    if (msg && msg.params && msg.params.payload && msg.params.payload.phoneNumber)
    {
        this._cachedContactId = msg.params.payload.contactId;        
        if(this._cachedContactId != 0)
        {
            this._cachedContactIdForSearch = this._cachedContactId;
        }
        this._cachedCnfPhoneNumber = msg.params.payload.phoneNumber;        
        this._cachedByVoice = msg.params.payload.byVoice;     
        
        if (!this._contactsDbOpenStatus)
        {
            this._sendOpenContactDbRequest(this._deviceStatusId);
        }
        else
        {
            var params = {"deviceId" : this._deviceStatusId, "number" : this._cachedCnfPhoneNumber, "ctoType":"ThumbnailImage"};
            framework.sendRequestToDbapi(this.uiaId, this._getContactNameCallbackFnForCall2.bind(this), "pb", "FindContactsByNumber", params);
        } 
    }
}

// Update input field of Dial Pad template

phoneApp.prototype._DialPadUpdateNumbericFieldMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload)
    {       
        this._cachedInputPhoneNumber = msg.params.payload.phoneNumber;   
        
        if (this._currentContext && this._currentContextTemplate)
        {            
            if(this._currentContext.ctxtId === "DialPad")
            {                
                this._populateDialPadCtrl();
            }           
        }
    }
}

// Get Last Dialled Number
phoneApp.prototype._GetLastDialledNoMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload)
    {       
        if (!this._callHistoryDbOpenStatus)
        {
            log.debug("Get last dialled no.... if");         
            this._sendOpenCallHistoryDbRequest(this._devId);
        } 
        else
        {
            if (this._callHistoryDbOpenStatus)
            {
                log.debug("Get last dialled no.... else");
                var params = {"deviceId":this._devId, "category":"Dialled"}; 
                framework.sendRequestToDbapi(this.uiaId, this._getDialledCallbackFn.bind(this), "pb", "GetCallHistory", params);
            }
        }                    
    }
}

// Get Focussed Data
phoneApp.prototype._GetFocusedDataMsgHandler = function(msg)
{
    log.debug(" GetFocusedData");
    if (msg && msg.params && msg.params.payload)
    {       
        if (this._currentContext && this._currentContextTemplate)
        {            
            if(this._currentContext.ctxtId === "RecentCalls")
            {
               this._getFocussedData();              
            }           
        }
    }    
}

// Display dtmf digit
phoneApp.prototype._ShowDtmfDigitMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.number)
    {
        this._cachedDtmfPhoneNumber = msg.params.payload.number;
        if (this._currentContext && this._currentContextTemplate)
        {
            switch(this._currentContext.ctxtId)
            {
                case "ActiveCallDTMF":
                case "ActiveCall1DTMF":
                case "ActiveCall2DTMF":
                case "ActiveCallMergedDTMF":
                    this._populateDtmfDialPadCtrl();
                break;                
            }                      
        }
    }    
}


//Display Dial Failed Sbn
phoneApp.prototype._ShowDialFailedSbnMsgHandler = function(msg)
{
    log.debug("_ShowDialFailedSbnMsgHandler");
    if (msg && msg.params && msg.params.payload && msg.params.payload.dummy)
    {       
        this._cachedSbnType = msg.params.payload.dummy;
        this._populateDialFailedSbn(this._cachedSbnType);       
    }        
}

//Db Grey Out Message
phoneApp.prototype._DbGreyOutMsgHandler = function(msg)
{
    log.debug("_DbGreyOutMsgHandler");
    if (msg && msg.params && msg.params.payload)
    {       
        this._cachedGreyOutContactDb = msg.params.payload.ContactsDb;
        this._cachedGreyOutCHDb = msg.params.payload.CallHistoryDb;    
        if (this._currentContext && this._currentContextTemplate)
        {
            switch(this._currentContext.ctxtId)
            {
                case "NumberOrName":
                    this._populateGreyOutNumberOrName();
                    break;
                case "AddCall":
                    this._populateGreyOutListCtrl();
                    break;
                case "RecentCalls":
                    this._updateCallHistroy();
                    break;
                case "ActiveCall":
                case "ActiveCall1":
                case "ActiveCall2":
                case "ActiveCallMerged":
                case "IncomingCall":
                case "CallWaiting":
                case "ContactsDisambiguation":
                case "NumberDisambiguation":
                case "TypeDisambiguation":
                case "ChoosePhoneContact":
                    if(!this._cachedGreyOutContactDb)
                    {
                        if (!this._contactsDbOpenStatus)
                        {
                            this._sendOpenContactDbRequest(this._deviceStatusId);
                        }
                    }
                    else
                    {
                        log.debug("Contact DB is unavailable");
                    }
                    break;                    
                default:
                    break;
            }                      
        }
    }        
}

phoneApp.prototype._ResetTimerMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.dummy)
    {
        this._resetTimerValues();
    }    
}

phoneApp.prototype._ContactDetailMsgHandler = function(msg)
{
    this._cachedFavCallId = "";
    if (msg && msg.params && msg.params.payload)
    {
        if( msg.params.payload.callId)
        {
            this._cachedFavCallId = msg.params.payload.callId;
        }
        if(this._cachedFavCallId === "call1")
        {
            this._cachedFavName1 = msg.params.payload.name;
        }
        else
        {
            this._cachedFavName2 = msg.params.payload.name;
        }        
        if( msg.params.payload.phoneNumber)
        {
            if(this._cachedFavCallId === "call1")
            {
                this._cachedFavPhoneNum1 = msg.params.payload.phoneNumber;
            }
            else
            {
                this._cachedFavPhoneNum2 = msg.params.payload.phoneNumber;
            }
        }        
    }  
}

phoneApp.prototype._NoCallStateMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload)
    {
        this._activeCallId = "";
        this._cachedFavName1 = null;
        this._cachedFavName2 = null;
        this._cachedFavCallId = "";
        this._cachedFavPhoneNum1 = ""; 
        this._cachedFavPhoneNum2 = ""; 
        this._timer1Start = false;
        this._timer2Start = false;
        clearInterval(this._contact1ElapsedTimeTimer);
        this._contact1ElapsedTimeTimer = null;
        clearInterval(this._contact2ElapsedTimeTimer);
        this._contact2ElapsedTimeTimer = null;
        this._ctxtName = "";
    }
}

phoneApp.prototype._CHAutoStatusMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload)
    {
        this._cachedCHAutoStatus = msg.params.payload.status;
    }
}

//..............................
// DBAPI callbacks
//..............................

// Call back for Open ContactsDB
phoneApp.prototype._openContactsDbCallbackFn = function(msg)
{

    if (msg.msgContent.params.eCode == 0)
    {
        if(this._contactFlag)
        {
            this._contactsDbOpenStatus = true;  
        }
    }
    if(this._contactsDbOpenStatus)
    {
        if(this._currentContext && this._currentContextTemplate)
        {
            switch(this._currentContext.ctxtId)
            {
                case "ContactsDisambiguation":
                    log.debug("opencontact db... contact dis");
                    for(var i=0; i<this._cachedContactCount; i++)
                    {
                        var params = {"deviceId" : this._deviceStatusId, "contactId" : this._cachedContactIdList[i], "ctoType":"ThumbnailImage"};
                        framework.sendRequestToDbapi(this.uiaId, this._getContactForDisambiguityCallbackFn.bind(this), "pb", "GetContactDetails", params);
                    }
                    break;
                case "NumberDisambiguation":
                case "TypeDisambiguation":
                    log.debug("opencontact db... number dis");
                    var params = {"deviceId" : this._deviceStatusId, "contactId" : this._cachedContactNumberId, "ctoType":"ThumbnailImage"};
                    framework.sendRequestToDbapi(this.uiaId, this._getContactDetailsCallbackFn.bind(this), "pb", "GetContactDetails", params);
                    break;
                case "ChoosePhoneContact":
                    log.debug("opencontact db... choose phone contact");
                    this._resetVariableValues(); 
                    this._choosePhoneContactIndex();
                    //Send Get Contacts Request to DBAPI
                    var params = {"deviceId":this._deviceStatusId, "limit":this._requestChunkSize, "offset":(this._listNeedDataOffsetIndex),"ctoType":"ThumbnailImage", "sort" : "OrderId" , "filter" : "Calls"};
                    framework.sendRequestToDbapi(this.uiaId, this._getContactsCallbackFn.bind(this), "pb", "GetContacts", params);
                    break;
                case "CallConfirmation":
                    log.debug("opencontact db... call confirmation");
                    var params = {"deviceId" : this._deviceStatusId, "number" : this._cachedCnfPhoneNumber, "ctoType":"ThumbnailImage"};
                    framework.sendRequestToDbapi(this.uiaId, this._getContactNameCallbackFnForCall2.bind(this), "pb", "FindContactsByNumber", params);
                    break;
                case "IncomingCall":
                case "CallWaiting":
                    log.debug("opencontact db... incoming call. call waitng");
                    var params = {"deviceId" : this._deviceStatusId, "number" : this._cachedPhoneNumber, "ctoType":"ThumbnailImage"};
                    framework.sendRequestToDbapi(this.uiaId, this._getContactNameCallbackFn.bind(this), "pb", "GetContactByMatchedNumber", params);
                    break;
                case "ActiveCall":
                    log.debug("opencontact db... active call");
                    var params = {"deviceId" : this._deviceStatusId, "number" : this._activeCallPhoneNumber, "ctoType":"ThumbnailImage"};
                    framework.sendRequestToDbapi(this.uiaId, this._getContactNameCallbackFn.bind(this), "pb", "GetContactByMatchedNumber", params);
                    break;
                case "ActiveCall1":
                case "ActiveCall2":
                case "ActiveCallMerged":
                    log.debug("opencontact db... active call1/2/merged");
                    var params = {"deviceId" : this._deviceStatusId, "number" : this._cachedConferenceCallNumberFirst, "ctoType":"ThumbnailImage"};
                    framework.sendRequestToDbapi(this.uiaId, this._getNumbrOneDetailsCallbackFn.bind(this), "pb", "GetContactByMatchedNumber", params);
                    var params = {"deviceId" : this._deviceStatusId, "number" : this._cachedConferenceCallNumberSecond, "ctoType":"ThumbnailImage"};
                    framework.sendRequestToDbapi(this.uiaId, this._getNumberTwoDetailsCallbackFn.bind(this), "pb", "GetContactByMatchedNumber", params);
                    break;
                default :                   
                    break
            }          
        }    
    }
    else
    {     
        log.debug("Contacts DB Open failed");
        this._contactFlag = false;
        if(this._currentContext && this._currentContextTemplate)
        {
            switch(this._currentContext.ctxtId)
            {          
                case "CallConfirmation":                    
                case "IncomingCall":
                case "CallWaiting":
                    this._populateDialogCtrl();
                    break;
                case "ActiveCall":
                    this._populateActiveCallData();
                    break;
                case "ActiveCall1":
                case "ActiveCall2":
                case "ActiveCallMerged":
                    this._populateActiveCall1Data();
                    this._populateActiveCall2Data();
                    break;             
                default :                   
                    break
            }          
        }    
    }
}

// Call back for Close ContactsDB
phoneApp.prototype._closeContactsDbCallbackFn = function(msg)
{
    log.debug(" _closeContactsDbCallbackFn  called...");

    if (msg.msgContent.params.eCode == 0)
    {
        this._contactsDbOpenStatus = false;
        log.debug("Contacts DB Close Success");
    }
    else
    {
        log.debug("Contacts DB Close failed");
    }

}

// Call back for Open RecentCallsDB
phoneApp.prototype._openRecentCallsDbCallbackFn = function(msg)
{
    log.debug(" _openRecentCallsDbCallbackFn  called...");
    this._resetCHTimer();
    if (msg.msgContent.params.eCode == 0)
    {
        if(this._callHistoryFlag)
        {
            this._callHistoryDbOpenStatus = true;
        }
    }
    if(this._callHistoryDbOpenStatus)
    {    
        log.debug("in openrecentcallback...this._callHistoryDbOpenStatus" + this._callHistoryDbOpenStatus);
        if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "RecentCalls")
        {
            if(this._callHistoryDbOpenStatus)
            {                
                log.debug("open recent call. recent call");
                if(this._cachedRecentTab == 1)
                {
                    log.debug("open recent call. recent call... tab1");
                    var params = {"deviceId":this._devId, "limit":this._requestCallsChunkSize, "offset":(this._callListNeedDataOffsetIndex), "category":"LastAll", "sort":"OrderId"}; 
                    framework.sendRequestToDbapi(this.uiaId, this._getRecentCallsCallbackFn.bind(this), "pb", "GetCallHistory", params);            
                }  
                else if(this._cachedRecentTab == 2)
                {                       
                    log.debug("open recent call. recent call... tab2");
                    var params = {"deviceId":this._devId, "limit":this._requestCallsChunkSize, "offset":(this._missedCallListNeedDataOffsetIndex), "category":"Missed"}; 
                    framework.sendRequestToDbapi(this.uiaId, this._getMissedCallsCallbackFn.bind(this), "pb", "GetCallHistory", params);            
                }
            }            
        }
        if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "DialPad")
        {
            if (this._callHistoryDbOpenStatus)
            {
                log.debug("open recent call. recent call... Dialled call");
                var params = {"deviceId":this._devId, "category":"Dialled"}; 
                framework.sendRequestToDbapi(this.uiaId, this._getDialledCallbackFn.bind(this), "pb", "GetCallHistory", params);
            }    
        }    
    }
    else
    {
        this._callHistoryFlag = false;
        if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "RecentCalls")
        {
            if(this._cachedRecentTab == 1)
            {                
                this._populateRecentCallCtxtList();
            }
            else if(this._cachedRecentTab == 2)
            {
                 this._populateMissedRecentCallCtxtList();
                
            }
        }     
        log.debug("Call Histroy DB Open failed");    
    }
}

// Call back for Fetching RecentCallsDB - All Calls
phoneApp.prototype._getRecentCallsCallbackFn = function(msg)
{
    log.debug(" _getRecentCallsCallbackFn  called...",msg);
    log.debug ("Recent Call back");
        
   if (msg.msgContent.params.eCode == 0)
   {
        if(this._callHistoryDbOpenStatus)
        {        
            var count = msg.msgContent.params.count;
            log.debug ("Inside ecode of recentcalls");
            this._cachedCallsChunk = msg.msgContent.params.callHistories;
            this._callListTotalCount = msg.msgContent.params.totalCount;
            this._callListActualDataCount = this._callListActualDataCount + count;
            this._callListCurrentOffset =  msg.msgContent.params.offset;    
            
            log.debug("Value of total count" +   this._callListTotalCount + "Actual data count" + this._callListActualDataCount + "Value iof offseti is" + this._callListCurrentOffset);    
            
            if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "RecentCalls")
            {            
                this._addItemsToListRecentCalls (this._cachedCallsChunk, this._callListCurrentOffset, this._callListActualDataCount);
            }    
        }
    }
    else
    {
        log.debug("GetContacts operation failed");
        if(this._currentContextTemplate && this._currentContext.ctxtId === "RecentCalls")
        {            
            log.debug(" Blank dispalyed");            
            this._currentContextTemplate.list2Ctrl.setLoading(false);    
        }
    }
}

// Call back for fetching RecentCallsDB - Missed Calls
phoneApp.prototype._getMissedCallsCallbackFn = function(msg)
{
   if (msg.msgContent.params.eCode == 0)
   {
       if(this._callHistoryDbOpenStatus)
       {
           log.debug("getMissedCalls.. eocde");
           var count = msg.msgContent.params.count;
           log.debug ("eCode returns success");
           this._cachedMissedCallsChunk = msg.msgContent.params.callHistories;
           this._missedCallListTotalCount = msg.msgContent.params.totalCount;
           this._missedCallListActualDataCount = this._missedCallListActualDataCount + count;
           this._callListMissedOffset =  msg.msgContent.params.offset;        
            
           if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "RecentCalls")
           {         
               this._addItemsToListMissedRecentCalls (this._cachedMissedCallsChunk, this._callListMissedOffset, this._missedCallListActualDataCount);
           }     
       }
    }
    else
    {
        log.debug("GetContacts for Missed call operation failed");
        if(this._currentContextTemplate && this._currentContext.ctxtId === "RecentCalls")
        {            
            log.debug(" Blank dispalyed");            
            this._currentContextTemplate.list2Ctrl.setLoading(false);    
        }
    }
}

// Call back for Close RecentCallsDB
phoneApp.prototype._closeRecentCallsDbCallbackFn = function(msg)
{
    log.debug("_closeRecentCallsDbCallbackFn  called...");
    if (msg.msgContent.params.eCode == 0)
    {
        this._callHistoryDbOpenStatus = false;
        log.debug("Contacts DB Close Success");         
    }
    else
    {
        log.debug("Contacts DB Close failed");
    }
}

// List Scroll callback - AllCalls
phoneApp.prototype._RecentCallsNeedDataCallback = function(index)
{
    
    log.debug(" _RecentCallsNeedDataCallback  called...");    
    log.debug("Value of index is" + index);  

    if(this._callHistoryDbOpenStatus)
    {    
        if(this._cachedRecentTab == 1)
        {
            this._callListNeedDataOffsetIndex = index;  
            var params = {"deviceId":this._devId, "limit":this._requestCallsChunkSize, "offset":(this._callListNeedDataOffsetIndex), "category":"LastAll", "sort":"OrderId"}; 
            framework.sendRequestToDbapi(this.uiaId, this._getRecentCallsCallbackFn.bind(this), "pb", "GetCallHistory", params);            
        }  
        else if(this._cachedRecentTab == 2)
        {
            this._missedCallListNeedDataOffsetIndex = index; 
            log.debug("Value of missed call index is" + this._missedCallListNeedDataOffsetIndex);
            var params = {"deviceId":this._devId, "limit":this._requestCallsChunkSize, "offset":(this._missedCallListNeedDataOffsetIndex), "category":"Missed"}; 
            framework.sendRequestToDbapi(this.uiaId, this._getMissedCallsCallbackFn.bind(this), "pb", "GetCallHistory", params);            
        }
        else 
        {
             log.debug("Contacts DB not open, can't fetch more data while scrolling");       
        }    
    }
    else
    {
        log.debug("Else part of _RecentCallsNeedDataCallback");
    }    
}

// Get Details 
phoneApp.prototype._getNumbrOneDetailsCallbackFn = function(msg)
{
    log.debug("_getNumbrOneDetailsCallbackFn");
    this._call1FirstName = "";
    this._call1LastName = "";
    this._call1ContactName = "";
    this._call1DisplayName = "";
    this._call1CtoPath = "";
    this._call1ContactNumbers = new Object();
    this._call1Type = "";   
    
    if (msg.msgContent.params.eCode == 0)
    {        
        if(msg.msgContent.params.contacts)
        {
            this.call1ContactsDetails = msg.msgContent.params.contacts;
        }
     
        this._call1ContactsInfo = new Object();
        
        if(this.call1ContactsDetails)
        {            
            this._updateActiveCall1ContactDetails(this.call1ContactsDetails[0]);
            
            for(var i=0; i<this.call1ContactsDetails.length; i++)
            {                
                this._call1ContactsInfo = this.call1ContactsDetails[i];
                // check if the contact id matches...
                if(this._cachedContactIdForSearch === this.call1ContactsDetails[i].contactId)
                {
                    this._updateActiveCall1ContactDetails(this._call1ContactsInfo);
                }
            }
        } 
    }
    else
    {
        log.debug("Get Contact Details operation failed");
        if(this._cachedFavName1 != null && this._cachedConferenceCallNumberFirst == this._cachedFavPhoneNum1)
        {
            this._call1ContactName = this._cachedFavName1;
        }
    }
    if(this._currentContext && this._currentContextTemplate)
    {
        log.debug("_getNumberOneDetailsCallbackFn.... current ctxt");
        switch(this._currentContext.ctxtId)
        {
            case "ActiveCall1":              
            case "ActiveCall2":              
            case "ActiveCallMerged":
                this._populateActiveCall1Data();
                break;
            default:
                break;        
        }
    }
}

phoneApp.prototype._getNumberTwoDetailsCallbackFn = function(msg)
{
    log.debug("_getNumberTwoDetailsCallbackFn");
    this._call2FirstName = "";
    this._call2LastName = "";
    this._call2ContactName = "";
    this._call2DisplayName = "";
    this._call2CtoPath = "";
    this._call2ContactNumbers = new Object();
    this._call2Type = "";   
    
    if (msg.msgContent.params.eCode == 0)
    {        
        if(msg.msgContent.params.contacts)
        {
            this.call2ContactsDetails = msg.msgContent.params.contacts;
        }
     
        this._call2ContactsInfo = new Object();
        
        if(this.call2ContactsDetails)
        {            
            this._updateActiveCall2ContactDetails(this.call2ContactsDetails[0]);
            for(var i=0; i<this.call2ContactsDetails.length; i++)
            {                
                this._call2ContactsInfo = this.call2ContactsDetails[i];
                // check if the contact id matches...
                if(this._cachedContactIdForSearch === this.call2ContactsDetails[i].contactId)
                {
                    this._updateActiveCall2ContactDetails(this._call2ContactsInfo);
                }
            }
        }        
    }
    else
    {
        log.debug("Get Contact Details operation failed");
        if(this._cachedFavName2 != null && this._cachedConferenceCallNumberSecond == this._cachedFavPhoneNum2)
        {
            this._call2ContactName = this._cachedFavName2;
        }
    }
    if(this._currentContext && this._currentContextTemplate)
    {
        log.debug("_getNumberTwoDetailsCallbackFn.... current ctxt");
        switch(this._currentContext.ctxtId)
        {
            case "ActiveCall1":         
            case "ActiveCall2":              
            case "ActiveCallMerged":            
                this._populateActiveCall2Data();
                break;
            default:
                break;        
        }
    }
}

phoneApp.prototype._getContactNameCallbackFn = function(msg)
{
    log.debug("In _getContactNameCallbackFn.");
    this.firstName = "";
    this.lastName = "";
    this.contactName = "";
    this.displayName = "";
    this._contactNumbers = new Object(); 
    this._souceType = "";
    
    if (msg.msgContent.params.eCode == 0)
    {        
        if(msg.msgContent.params.contacts)
        {
            this.contactsDetails = msg.msgContent.params.contacts;
        }
     
        this._contactsInfo = new Object();
        
        if(this.contactsDetails)
        {            
            this._updateActiveCallContactDetails(this.contactsDetails[0]);
            for(var i=0; i<this.contactsDetails.length; i++)
            {                
                this._contactsInfo = this.contactsDetails[i];
                // check if the contact id matches...
                if(this._cachedContactIdForSearch === this.contactsDetails[i].contactId)
                {
                    this._updateActiveCallContactDetails(this._contactsInfo);
                }
            }
        }      
    }
    else
    {
        log.debug("Get Contact Details operation failed");
        if(this._currentContext.ctxtId === "ActiveCall")
        {
            if(this._cachedFavName1 != null && this._activeCallPhoneNumber == this._cachedFavPhoneNum1 && this._activeCallId === "call1")
            {
                this.contactName = this._cachedFavName1;
            }
            else if(this._cachedFavName2 != null && this._activeCallPhoneNumber == this._cachedFavPhoneNum2 && this._activeCallId === "call2")
            {
                this.contactName = this._cachedFavName2;
            }
                    
        }        
    }
      switch (this._currentContext.ctxtId)
        {
            case "IncomingCall" : 
            case "CallWaiting" : 
                 log.debug("In _getContactNameCallbackFn...incoming..call waiting" + this.contactName);
                 this._populateDialogCtrl();
                 break;
            case "ActiveCall" : 
                log.debug("In _getContactNameCallbackFn..... active call" + this.contactName);             
                this._populateActiveCallData();
                break;
            default:
                break;    
        }
}

phoneApp.prototype._getContactNameCallbackFnForCall2 = function(msg)
{
    log.debug("_getContactNameCallbackFnForCall2");
    this.firstNameOfCall2 = "";
    this.lastNameOfCall2 = "";
    this.contactNameOfCall2 = "";
    this.displayNameOfCall2 = "";
    this._contactNumbersOfCall2 = new Object();
    this._typeOfCall2 = "";   
                        
    if (msg.msgContent.params.eCode == 0)
    {
        if(msg.msgContent.params.contacts)
        {
            this.contactsDetailsForCall2 = msg.msgContent.params.contacts;
        }
        this._contactsInfo = new Object();
        
        if(this.contactsDetailsForCall2)
        {            
            this._updateContactDetails(this.contactsDetailsForCall2[0]);
            for(var i=0; i<this.contactsDetailsForCall2.length; i++)
            {                
                this._contactsInfo = this.contactsDetailsForCall2[i];
                // check if the contact id matches...
                if(this._cachedContactIdForSearch === this.contactsDetailsForCall2[i].contactId)
                {
                    this._updateContactDetails(this._contactsInfo);
                }
            }
        }                  
    }
    else
    {
        log.debug("Get Contact Details operation failed");
       if(this._cachedFavName1 != null && this._cachedCnfPhoneNumber == this._cachedFavPhoneNum1  && this._activeCallId === "")
        {
            this.contactNameOfCall2 = this._cachedFavName1;
        } 
    }
    switch (this._currentContext.ctxtId)
    {                  
        case "CallConfirmation" :
            log.debug("_getContactNameCallbackFnForCal... incoming...callwaiting...call confirmation");
            this._populateDialogCtrl();
            break;
        default:
            break;    
    }    
}

phoneApp.prototype._getContactForDisambiguityCallbackFn = function(msg)
{
    this.listOfContacts = "";
    this.contactIdList = "";
    this._contactDisambNumber = "";
    this._contactDisambCount = 0;
    this.numbers = new Array();// Store numbers from Dbapi
    log.debug("_getContactForDisambiguityCallbackFn");
    if (msg.msgContent.params.eCode == 0)
    {
        if(msg.msgContent.params)
        {
            if(msg.msgContent.params.displayName)
            {
                this.listOfContacts = msg.msgContent.params.displayName;
               
            }
            if(msg.msgContent.params.contactId)
            {
                this.contactIdList = msg.msgContent.params.contactId;
            }            
            if(msg.msgContent.params.numbers)
            {
                this.numbers = msg.msgContent.params.numbers;
            }  
            if(msg.msgContent.params.ctoPath)
            {
                this._freeObjectContactId.push(msg.msgContent.params.contactId);
                this._freeObjectDbSeqId.push(msg.msgContent.params.dbSeqNo);
            }  
            this.contactNumbers = new Object();    
            this.type = new Array();
            this.homeNumber = [];
            this.mobileNumber = [];
            this.workNumber = [];
            this.emails = [];
            this.otherNumber = [];
            this.companyName = [];
            var j=0;

            if(this.numbers)
            {    
                for(var i=0; i<this.numbers.length; i++)
                {    
                    this.contactNumbers = this.numbers[i];    
                    if(this.contactNumbers.category)
                    {
                        this.type[i] = this.contactNumbers.category;
                    }    
                    if(this.contactNumbers.number)
                    {
                        if(this.type[i] === "Mobile")
                        {                        
                            this.mobileNumber.push(this.contactNumbers.number);
                            this._contactDisambNumber = this.contactNumbers.number;
                        }
                        else if((this.type[i] === "Home") || (this.type[i] === "Phone") || (this.type[i] === "Home_Phone"))
                        {                      
                            this.homeNumber.push(this.contactNumbers.number);
                            this._contactDisambNumber = this.contactNumbers.number;
                        }
                        else if((this.type[i] === "Work") || (this.type[i] === "Office_Phone") || (this.type[i] === "Office_Mobile"))
                        {                   
                            this.workNumber.push(this.contactNumbers.number);
                            this._contactDisambNumber = this.contactNumbers.number;
                        }
                        else if(this.type[i] === "Email" || this.type[i] === "Office_Email")
                        {                       
                            this.emails.push(this.contactNumbers.number);                            
                        }
                        else if((this.type[i] === "Other")|| (this.type[i] === "Pager") ||  (this.type[i] === "Car") ||
                         (this.type[i] === "Any") || (this.type[i] === "Voice")|| (this.type[i] === "Pref"))
                        {                       
                            this.otherNumber.push(this.contactNumbers.number);
                            this._contactDisambNumber = this.contactNumbers.number;
                        }
                    }
                }
                this._contactDisambCount = this.mobileNumber.length + this.homeNumber.length + this.workNumber.length + this.otherNumber.length;
            }
            this.contactIdctr++;           
        }        
        if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "ContactsDisambiguation")
        {
            log.debug("_getContactForDisambiguityCallbackFn.... ctxt id");
            this._populateContactDisambiguation();
        }
    }    
    else
    {
		if(this._currentContextTemplate && this._currentContext.ctxtId === "ContactsDisambiguation")
        { 
			log.debug("GetContacts operation failed");
			this._currentContextTemplate.list2Ctrl.setLoading(false);
		}
    }        
}

phoneApp.prototype._getContactDetailsCallbackFn = function(msg)
{
    log.debug("_getContactDetailsCallbackFn.... ");
    this.firstName ="";
    this.lastName ="";
    this._title = "";
    var phoneNumber = "";
    if (msg.msgContent.params.eCode == 0)
    {
        if(msg.msgContent.params.displayName)
        {
           this.displayName = msg.msgContent.params.displayName;
           this._title = this.displayName;
        }
        if(msg.msgContent.params.ctoPath)
        {           
            this._freeObjectContactId.push(msg.msgContent.params.contactId);
            this._freeObjectDbSeqId.push(msg.msgContent.params.dbSeqNo);            
            this.ctoPath = msg.msgContent.params.ctoPath;
        }

        if(msg.msgContent.params.orderId)
        {
            this.orderId = msg.msgContent.params.orderId;
        }

        if(msg.msgContent.params.contactId)
        {
            this.contactId = msg.msgContent.params.contactId;
        }

        if(msg.msgContent.params.numbers)
        {
            this.numbers = msg.msgContent.params.numbers;
        }

        this._contactNumbers = new Object();

        this._type = new Array();
        this.homeNumber = [];
        this.mobileNumber = [];
        this.workNumber = [];
        this.emails = [];
        this.otherNumber = [];
        this.companyName = [];

        var j = 0;
        var k = 0;
        var l = 0;
        var m = 0;
        var n = 0;
        var p = 0;

        if(this.numbers)
        {
            for(var i=0; i<this.numbers.length; i++)
            {
                this._contactNumbers = this.numbers[i];

                if(this._contactNumbers.category)
                {
                    this._type[i] = this._contactNumbers.category;
                }

                if(this._contactNumbers.number)
                {
                    if(this._type[i] === "Mobile")
                    {
                        this.mobileNumber[k++] = this._contactNumbers.number;
                    }
                    if((this._type[i] === "Home") || (this._type[i] === "Phone") || (this._type[i] === "Home_Phone"))
                    {
                        this.homeNumber[l++] = this._contactNumbers.number;
                    }
                    if((this._type[i] === "Work") || (this._type[i] === "Office_Phone") || (this._type[i] === "Office_Mobile"))
                    {
                        this.workNumber[m++] = this._contactNumbers.number;
                    }
                    if(this._type[i] === "Email" || this._type[i] === "Office_Email")
                    {
                       this.emails[n++] = this._contactNumbers.number;
                    }
                    if(this._type[i] === "CompanyName")
                    {
                       this.companyName[j++] = this._contactNumbers.number;
                    }
                    if((this._type[i] === "Other")|| (this._type[i] === "Pager") ||  (this._type[i] === "Car") ||
                     (this._type[i] === "Any") || (this._type[i] === "Voice")|| (this._type[i] === "Pref"))
                    {
                       this.otherNumber[p++] = this._contactNumbers.number;
                    }
                }
            }
        }

        if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "NumberDisambiguation")
        {
            this._populateNumberList();
        }
        
        if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "TypeDisambiguation")
        {
            this._populateNumberTypeList();
        }
              
        if(this.homeNumber.length > 0)
        {
            phoneNumber = this.homeNumber[0]
        }
        else  if(this.workNumber.length > 0)
        {
            phoneNumber = this.workNumber[0]
        }
        else  if(this.mobileNumber.length > 0)
        {
            phoneNumber = this.mobileNumber[0]
        }
        else  if(this.otherNumber.length > 0)
        {
            phoneNumber = this.otherNumber[0]
        }     
       this.paramsToMmui =
       {
            "contactId" : this.contactId,
            "numberCount":this.homeNumber.length + this.workNumber.length + this.mobileNumber.length + this.otherNumber.length,
            "phoneNumber" : phoneNumber         
       }
    }
    else
    {
        log.debug("Get Contact Details operation failed");
    }
    if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "ChoosePhoneContact")
    {
       framework.sendEventToMmui(this.uiaId, "SelectContactName", {payload : this.paramsToMmui},this._vuiFlag);
    }
}

phoneApp.prototype._getContactsCallbackFn = function(msg)
{
    log.debug("_getContactsCallbackFn");
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "ChoosePhoneContact")
    {
        this._DbResponse = true;
        if (msg.msgContent.params.eCode == 0)
        {
            var count = msg.msgContent.params.count;
            
            this._cachedContactsChunk = msg.msgContent.params.contacts;
            this._listTotalCount = msg.msgContent.params.totalCount;
            this._listActualDataCount = msg.msgContent.params.count;;
            this._listCurrentOffset =  msg.msgContent.params.offset;

            log.debug("this._listTotalCount: " + this._listTotalCount + " this._listActualDataCount: " + this._listActualDataCount + " this._listCurrentOffset" + this._listCurrentOffset);
            this._addItemsToList(this._cachedContactsChunk, this._listCurrentOffset, this._listActualDataCount);
        }
        else
        {
            log.debug("GetContacts operation failed");
			this._currentContextTemplate.list2Ctrl.setLoading(false);
        }
    }
}

phoneApp.prototype._choosePhoneContactsNeedDataCallback = function(index)
{ 
    log.debug("phone need data call back... dbresponse true");
    log.debug("Value of index is" + index);  

    if(this._contactsDbOpenStatus && this._DbResponse)
    {
        log.debug("phone need data call back... dbresponse true");
        this._listNeedDataOffsetIndex = index;        
        //Send Get Contacts Request to DBAPI
        if (this._contactsDbOpenStatus)
        {
            var params = {"deviceId":this._deviceStatusId, "limit":this._requestChunkSize, "offset":(this._listNeedDataOffsetIndex), "ctoType":"ThumbnailImage", "sort" : "OrderId" , "filter" : "Calls"}; 
            framework.sendRequestToDbapi(this.uiaId, this._getContactsCallbackFn.bind(this), "pb", "GetContacts", params);
            this._DbResponse = false;
            log.debug("phone need data call back... dbresponse false");
        }
        else
        {
             log.debug("Contacts DB not open, can't fetch more data while scrolling");
        }
        log.debug("In phone need data call back");
   }
}

phoneApp.prototype._getDialledCallbackFn = function(msg)
{
    log.debug(" Inside get dialled call back");
    this._dialledNoToMmui = new Object();
    log.debug(" _getDialledCallbackFn  called...");
    this._cachedDialledCallsChunk = new Array();
    if(msg.msgContent.params)
    {
        log.debug(" _getDialledCallbackFn  called...msg.msgContent.params");
        this._cachedDialledCallsChunk[0] = msg.msgContent.params.callHistories[0].number;
    }
    
    if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "DialPad")
    {
        log.debug("Setting input value in dialpad" + this._cachedDialledCallsChunk[0]);
        this._currentContextTemplate.dialPad2Ctrl.setInputValue(this._cachedDialledCallsChunk[0]);
        framework.sendEventToMmui(this.uiaId, "DialpadUpdateNumericField", {payload:{phoneNumber:this._cachedDialledCallsChunk[0]}});
        this._cachedDialledCallsChunk[0] = null;
        
    }
    else
    {
        this._dialledNoToMmui =  {        
            "phoneNumber" : this._cachedDialledCallsChunk[0]
        }
        framework.sendEventToMmui(this.uiaId, "SystemRedial", {payload : this._dialledNoToMmui});
        
    }
                   

        this._sendCloseCallHistoryDbRequest(this._devId);            
      
}

phoneApp.prototype._freeContactObjectCallbackFn = function(msg)
{
    if (msg.msgContent.params.eCode == 0)
    {
        this._freeObjectContactId = [];
        this._freeObjectDbSeqId = [];
        log.debug("_freeContactObjectCallbackFn..");
    }    
}

phoneApp.prototype._getContactsIndexCallbackFn = function(msg)
{
    if (msg.msgContent.params.eCode == 0)
    {       
        log.debug(".... : _getContactsIndexCallbackFn");
        var currList = this._currentContextTemplate.list2Ctrl;
        var indexArray = [];
        this._indexList = new Array();
        this._indexList = msg.msgContent.params.indexList;
        this._indexCount = msg.msgContent.params.count;        
        for(var i=0; i <this._indexList.length; i++ )
        {
            log.debug(".... : Value of index " + this._indexList[i].index);
            indexArray[i] = {label : this._indexList[i].label,itemIndex : this._indexList[i].index}  
            log.debug("Value of index is +1 :"+ indexArray[i].itemIndex);
        }
        currList.setLetterIndexData(indexArray);    
    }    
}


/**************************
 * Control callbacks
 **************************/

// Tab click callback
phoneApp.prototype._tabBtnClickCallback = function(btnRef, appData, params)
{
    log.debug("In _tabBtnClickCallback..");

    switch(appData)
    {
        case  "AllCalls" :    
            framework.sendEventToMmui(this.uiaId, "SelectRecentCallsToggle", {payload:{recentTab : 1}});
            break;
        case  "MissedCalls" : 
            framework.sendEventToMmui(this.uiaId, "SelectRecentCallsToggle", {payload:{recentTab : 2}});
            break; 
        default :
            // do nothing
            log.debug("Invalid tab clicked..");
            break;
    }
}
 
// DialPad Control callback
phoneApp.prototype._dialpadEnterCallback = function(dialPadCtrlObj,appData, params)

{
    log.debug("_dialpadEnterCallback..");
    var phnNumber = null;
    switch (params.btnSelected)
    {
        case "Call":
            if(params && params.input)
            {
                framework.sendEventToMmui(this.uiaId, "CallDialpadNumber");
            }
            else
            {
                if (!this._callHistoryDbOpenStatus)
                {
                    this._sendOpenCallHistoryDbRequest(this._devId);
                }
                else
                {
                    if (this._callHistoryDbOpenStatus)
                    {
                        log.debug("Request for dialled entry");
                        var params = {"deviceId":this._devId, "category":"Dialled"}; 
                        framework.sendRequestToDbapi(this.uiaId, this._getDialledCallbackFn.bind(this), "pb", "GetCallHistory", params);
                    }                
                }
            }
            break;
        case "Tone":
            if(params && params.input)
            {
                if(this._currentContextTemplate)
                {
                    phnNumber = this._currentContextTemplate.dialPad2Ctrl.getInputValue();
                    this._cachedInputPhoneNumber = phnNumber;
                }
                framework.sendEventToMmui(this.uiaId, "DialpadUpdateNumericField", {payload:{phoneNumber: phnNumber}});
            }
            break;
        case "Clear":
            if(params && params.input)
            {
                if(this._currentContextTemplate)
                {
                    phnNumber = this._currentContextTemplate.dialPad2Ctrl.getInputValue();
                }
                framework.sendEventToMmui(this.uiaId, "DialpadUpdateNumericField", {payload:{phoneNumber: phnNumber}});
            }
            break;
        default:
            log.debug("phoneApp: Unknown btn selected");   
            break;
    }
}

// DTMF DialPad Control callback
phoneApp.prototype._dtmfDialpadEnterCallback = function(dialPadCtrlObj,appData, params)
{
    log.debug("in _dtmfDialpadEnterCallback");
    switch (params.btnSelected)
    {
        case "Tone":
            if(params && params.input)
            {
                if(this._currentContextTemplate)
                {
                    framework.sendEventToMmui(this.uiaId, "SelectKeypadDigit", {payload:{digit: params.input}});
                }
            }
            break;
        case "CloseDtmf":
            framework.sendEventToMmui(this.uiaId, "SelectDtmfHide");
            break;
        default:
            log.debug("phoneApp: Unknown btn selected");   
            break;
    }
}
// List Control
phoneApp.prototype._listItemClickCallback = function(listCtrlObj, appData, params)
{
    log.debug("phoneApp _listItemClickCallback called...");
    log.debug("   for context" + this._currentContext.ctxtId);
    log.debug("   itemIndex: "+ params.itemIndex + "appData: "+ appData);
    
    var buttonClicked = null;
    var itemIndex = null;
    var callNumber = null;
    var callId = null;
    var numberCount = null;
    
    if(params)
    {
        var buttonClicked = params.additionalData;
        var itemIndex = params.itemIndex;
    }
    this._vuiFlag = false;
    if (params && params.fromVui)
    {
        this._vuiFlag = true;
    }
    
    if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId)
    {
    switch (this._currentContext.ctxtId) 
    {
        case "RecentCalls":
            switch(appData.eventName) 
            {
                    case "CallRecent" :
                        if(this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex] && 
                                this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData &&
                                        this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData.number)
                    { 
                            callNumber = this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData.number;
                    }
                    if(this._vuiFlag)
                    {
                        framework.sendEventToMmui(this.uiaId, "CallRecentByLine", {payload:{phoneNumber : callNumber }},this._vuiFlag);
                    }
                    else
                    {
                        framework.sendEventToMmui(this.uiaId, appData.eventName, {payload:{phoneNumber : callNumber }},this._vuiFlag);
                    }                    
                    break;                
                default :
                    log.debug("phoneApp: Unknown AppData");   
                    break;
            }
            break;
        case "AddCall" :
            var params = null;
            switch (appData)
            {
                case "SelectContacts" :
                case "SelectDialPad" :
                case "SelectRecentCalls" :                  
                    framework.sendEventToMmui(this.uiaId, appData, params, this._vuiFlag);
                    break;                
                default:
                    log.debug("phoneApp: Unknown Appdata", appData);
                    break;
            }
            break;
        case "ContactsDisambiguation" :
            switch (appData.eventName)
            {                
                case "SelectContactName" :
                        if(this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex] &&
                                this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData)
                        {
                            if(this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData.id &&
                                    this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData.number &&
                                            this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData.numberCount)
                            {
                                callId = this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData.id;
                                callNumber = this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData.number;                   
                                numberCount = this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData.numberCount;  
                            }
                        }                   
                        framework.sendEventToMmui(this.uiaId, appData.eventName, {payload: {contactId : callId , numberCount : numberCount , phoneNumber : callNumber}},this._vuiFlag);
                    break;             
                default:
                    log.debug("phoneApp: Unknown Appdata", appData);
                    break;
            }
            break;
        case "NumberDisambiguation" :
            switch (appData.eventName)
            {                
                case "SelectPhoneNumber" :
                        if(this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex] &&
                                this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData)
                        {
                            if(this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData.id &&
                                    this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData.phoneNumber)
                            {
                                callNumber = this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData.phoneNumber;
                                callId = this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData.id;
                                callType = this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData.phoneType;
                            }
                        }                 
                    this._cachedContactIdForSearch = callId;
                    log.debug("Value of numberCount is " + callNumber);                   
                    framework.sendEventToMmui(this.uiaId, appData.eventName, {payload: {phoneNumber : callNumber, contactId : callId, contactType  : callType}},this._vuiFlag);
                    break;             
                default:
                    log.debug("phoneApp: Unknown Appdata", appData);
                    break;
            }
            break;
        case "TypeDisambiguation" :
            switch (appData.eventName)
            {                
                case "SelectPhoneNumber" :
                        if(this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex] &&
                                this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData)
                        {
                            if(this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData.id &&
                                    this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData.phoneNumber)
                            {
                                callNumber = this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData.phoneNumber;
                                callId = this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData.id;
                                callType = this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData.phoneType;
                            }
                        }
                    this._cachedContactIdForSearch = callId;
                    log.debug("Value of numberCount is " + callNumber);              
                    framework.sendEventToMmui(this.uiaId, appData.eventName, {payload: {phoneNumber : callNumber, contactId : callId, contactType  : callType}},this._vuiFlag);
                    break;             
                default:
                    log.debug("phoneApp: Unknown Appdata", appData);
                    break;
            }
            break;
        case "ChoosePhoneContact" :
            switch (appData.eventName)
            {                
                case "SelectContactName" :
                        if(this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex] &&
                                this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData)
                        {
                            if(this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData.id)
                            {
                                contactId = this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData.id;
                            }
                        }
                        log.debug("Selected Contact ID is " + contactId);                        
                    var params = {"deviceId":this._deviceStatusId, "contactId":contactId, "ctoType":"ThumbnailImage"};
                    framework.sendRequestToDbapi(this.uiaId, this._getContactDetailsCallbackFn.bind(this), "pb", "GetContactDetails", params);
                    break;             
                default:
                    log.debug("phoneApp: Unknown Appdata", appData);
                    break;
            }
            break;
        default :
            log.debug("phoneApp: Unknown context", this._currentContext.ctxtId);   
            break;
    }
}
}
// EOF: List Control

// Dialog Control
phoneApp.prototype._dialogDefaultSelectCallback = function(dialogBtnCtrlObj, appData, params)
{
    log.debug("_dialogDefaultSelectCallback  called, appData: " + appData);
    
    if (this._currentContext && this._currentContextTemplate)
    {
        switch (this._currentContext.ctxtId)
        {
            // IncomingCall dialog
            case "IncomingCall" :
                switch (appData)
                {
                    case "SelectAnswer" :
                        framework.sendEventToMmui(this.uiaId, appData);
                        break;                    
                    case "SelectIgnore" :
                        framework.sendEventToMmui(this.uiaId, appData);
                        break;
                    default :
                        log.debug("phoneApp: Unknown AppData");   
                        break;                        
                }
                break;
            case "CallWaiting" :
                switch (appData)
                {
                    case "SelectEndAnswer" :
                        framework.sendEventToMmui(this.uiaId, appData);
                        break;                        
                    case "SelectHoldAnswer" :
                        framework.sendEventToMmui(this.uiaId, appData);
                        break;                     
                    case "SelectIgnore" :
                        framework.sendEventToMmui(this.uiaId, appData);
                        break;
                    default :
                        log.debug("phoneApp: Unknown AppData");   
                        break;                        
                }
                break;                
            case "CallConfirmation":
                switch (appData)
                {
                    case "Global.Yes" :
                        framework.sendEventToMmui("common", appData);
                        break;                        
                    case "Global.No" :
                        framework.sendEventToMmui("common", appData);
                        break;                    
                    default :
                        log.debug("phoneApp: Unknown AppData");   
                        break;                        
                }
                break;
            case "NoCallHistoryData" :
                switch (appData)
                {
                    case "Global.Yes" :
                        framework.sendEventToMmui("common", appData);
                        break;                                    
                    default :
                        log.debug("phoneApp: Unknown AppData");   
                        break;                        
                }
                break;
            case "NumberOrName" :
                switch (appData)
                {
                    case "SelectByNumber" :
                        framework.sendEventToMmui(this.uiaId, appData);
                        break;  
                    case "SelectByName" :
                        framework.sendEventToMmui(this.uiaId, appData);
                        break;                                    
                    default :
                        log.debug("phoneApp: Unknown AppData");   
                        break;                        
                }
                break;
            case "RedialNoData":
                switch (appData)
                {
                    case "Global.Yes" :
                        framework.sendEventToMmui("common", appData);
                        break;                        
                    case "Global.No" :
                        framework.sendEventToMmui("common", appData);
                        break;                    
                    default :
                        log.debug("phoneApp: Unknown AppData");   
                        break;                        
                }
                break;
            default :
                log.debug("phoneApp: Unknown context", this._currentContext.ctxtId);   
                break;
        }
    }    
}
// EOF: Dialog Control

phoneApp.prototype._selectCallback = function(buttonRef, appData, params)
{
    log.debug("_selectCallback() called...", buttonRef, appData, params);
    
    switch (appData)
    {
        case "SelectComMenu":
            framework.sendEventToMmui(this.uiaId, appData);
            break;
        case "SelectEndCall":
            framework.sendEventToMmui(this.uiaId, appData);
            break;
        case "SelectCMUAudio":
            if(!this._CMUEvent)
            {            
                framework.sendEventToMmui(this.uiaId, appData);
                this._CMUEvent = true; // Value is set as true so that no event send to MMUI until response comes from MMUI.                
                if(this._cachedCmuOrPhone === "Handset")
                this._currentContextTemplate.inCall2Ctrl.umpCtrl.setButtonState("SelectCMUAudio", "Vehicle");
                else if(this._cachedCmuOrPhone === "Vehicle")
                this._currentContextTemplate.inCall2Ctrl.umpCtrl.setButtonState("SelectCMUAudio", "Handset");
                log.info("event generated.. CMU");
            }
            else
            {    
                if(this._cachedCmuOrPhone === "Handset")
                this._currentContextTemplate.inCall2Ctrl.umpCtrl.setButtonState("SelectCMUAudio", "Vehicle");
                else if(this._cachedCmuOrPhone === "Vehicle")
                this._currentContextTemplate.inCall2Ctrl.umpCtrl.setButtonState("SelectCMUAudio", "Handset");   
                log.info("event not generated.. CMU");            
            }
            break;
        case "SelectMuteCall":
            if(!this._MuteEvent)
            {
                framework.sendEventToMmui(this.uiaId, appData);
                this._MuteEvent = true; // Value is set as true so that no event send to MMUI until response comes from MMUI.
                this._currentContextTemplate.inCall2Ctrl.umpCtrl.setButtonState("SelectMuteCall", this._cachedMute);
                log.info("event generated.. Mute");
            }
            else
            {
                this._currentContextTemplate.inCall2Ctrl.umpCtrl.setButtonState("SelectMuteCall", this._cachedMute);
                log.info("event not generated.. Mute");
            }
            break;
        case "SelectAddCall":
            framework.sendEventToMmui(this.uiaId, appData);
            break;
        case "SelectMergeCall":
            framework.sendEventToMmui(this.uiaId, appData);
            break;
        case "SelectSwitchCall":
            if(!this._SwapEvent)
            {
                framework.sendEventToMmui(this.uiaId, appData);
                this._SwapEvent = true; // Value is set as true so that no event send to MMUI until response comes from MMUI.
               /* if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "ActiveCall1")
                {                    
                    this._currentContextTemplate.inCall2Ctrl.umpCtrl.setButtonState("swapcalls_enabled_call1active", "01");        
                }
                if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "ActiveCall2")
                {                    
                    this._currentContextTemplate.inCall2Ctrl.umpCtrl.setButtonState("swapcalls_enabled_call2active", "02");    
                }*/
				this._swapUMPStateChangedInCurrentContext = true;
                log.info("event generated.. swap");            
            }
            else
            {
                /*if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "ActiveCall1")
                {                    
                    this._currentContextTemplate.inCall2Ctrl.umpCtrl.setButtonState("swapcalls_enabled_call1active", "01");        
                }
                if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "ActiveCall2")
                {                    
                    this._currentContextTemplate.inCall2Ctrl.umpCtrl.setButtonState("swapcalls_enabled_call2active", "02");    
                }*/
                log.info("event not generated.. swap");                
            }
            break;
        case "SelectDtmfShow":
            framework.sendEventToMmui(this.uiaId, appData);
            break;  
        default:
            log.debug("phoneapp: Unrecognized ump button clicked");
            break;
    }
}

//Long press Control
phoneApp.prototype._longPressCallback = function(longPressCtrlObj, appData, params)
{
    if(params)
    {
        var buttonClicked = params.additionalData;
        var itemIndex = params.itemIndex;
    }
    log.debug("for context" + this._currentContext.ctxtId);
    log.debug("appData: " + appData);
    log.debug("Inside long press");
    log.debug("for context" + this._currentContext.ctxtId);
    log.debug("appData: " + appData);   
    switch (this._currentContext.ctxtId)
    {     
    case "RecentCalls" :       
        switch(appData.eventName) 
        {
                case "CallRecent" :
                    var callNumber = null;
                    var callHistoryContactId = null;
                    var callHistoryName = null;
                    if(this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex] && 
                            this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData &&
                                    this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData.number)
                { 
                        callNumber = this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData.number;
                }
                    if(this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex] && 
                            this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData &&
                                    this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData.id)
                { 
                        callHistoryContactId = this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData.id;
                }
                    if(this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex] && 
                            this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData &&
                                    this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData.name)
                { 
                        callHistoryName = this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData.name;
                }
                framework.sendEventToMmui(this.uiaId, "SelectFavoritesNumber", {payload:{phoneNumber : callNumber , contactId : callHistoryContactId, name : callHistoryName}});
                break;                
            default :
                log.debug("phoneApp: Unknown AppData");   
                break;
        }
        break; 
          
    }
}
//End of Long Press Control



/**************************
 * Helper functions
 **************************/
phoneApp.prototype._sendOpenContactDbRequest = function(deviceId)
{
    if(!this._contactFlag)
    {       
        this._contactFlag = true;
        var params = {"deviceId":deviceId}; 
        framework.sendRequestToDbapi(this.uiaId, this._openContactsDbCallbackFn.bind(this), "pb", "OpenContactsDb", params);
    }
    else
    {
        log.debug("Else part of _sendOpenContactDbRequest");
    }
}
 
phoneApp.prototype._sendOpenCallHistoryDbRequest = function(deviceId)
{
    if(!this._callHistoryFlag)
    {       
        this._callHistoryFlag = true;
        var params = {"deviceId":this._devId};            
        framework.sendRequestToDbapi(this.uiaId, this._openRecentCallsDbCallbackFn.bind(this), "pb", "OpenCallHistoryDb", params);
    }
    else
    {
        log.debug("Else part of _sendOpenCallHistoryDbRequest");
    }
}

phoneApp.prototype._sendCloseContactDbRequest = function(deviceId)
{
    this._freeContactObject();  
    if(this._contactFlag)
    {        
        this._contactFlag = false;
        this._contactsDbOpenStatus = false;
        var params = {"deviceId":deviceId};         
        framework.sendRequestToDbapi(this.uiaId, this._closeContactsDbCallbackFn.bind(this), "pb", "CloseContactsDb", params);
    }
}

phoneApp.prototype._sendCloseCallHistoryDbRequest = function(deviceId)
{
             
    if(this._callHistoryFlag)
    {
        this._callHistoryFlag = false;
        this._callHistoryDbOpenStatus = false;
        var params = {"deviceId":deviceId};
        framework.sendRequestToDbapi(this.uiaId, this._closeRecentCallsDbCallbackFn.bind(this), "pb", "CloseCallHistoryDb", params);        
    }
    this._resetCallHistoryVariableValues();  
}

phoneApp.prototype._populateActiveCallUmp = function()
{
    if(this._cachedActiveCallInfo === "ActiveCall")
    {
        this._enableGeneralFunction("SelectEndCall"); 
        this._enableGeneralFunction("SelectAddCall");
        this._enableGeneralFunction("SelectDtmfShow");  
        this._enableGeneralFunction("SelectMuteCall");
        this._currentContextTemplate.inCall2Ctrl.umpCtrl.setButtonState("SelectMuteCall", this._cachedMute); 
        
    }
    else if(this._cachedActiveCallInfo === "Connecting")
    {
        this._enableGeneralFunction("SelectEndCall");        
        this._disableGeneralFunction("SelectAddCall"); 
        this._disableGeneralFunction("SelectDtmfShow"); 
        this._disableGeneralFunction("swapcalls_disabled");
        this._currentContextTemplate.inCall2Ctrl.umpCtrl.setButtonState("swapcalls_disabled", "01");         
        this._disableGeneralFunction("SelectMuteCall");
        this._currentContextTemplate.inCall2Ctrl.umpCtrl.setButtonState("SelectMuteCall", this._cachedMute);   
        
    }    
}

phoneApp.prototype._populateActiveCallData = function()
{    
    log.debug("_populateActiveCallData..this.contactName.." + this.contactName); 
    
    
    if(this._cachedCmuOrPhone === "Handset")
    {
        this._blankContactDetailsActiveCall();
    }
    else if(this._cachedCmuOrPhone === "Vehicle")
    {        
        // set default values
        var ctrlData =
        {
            "ctrlStyle" : "OneCall",
            "ctrlTitleId" : "Connecting",
            "contact1Details" : {
                "contactName" : "",
                "phoneNumber" : "",                
                "phoneTypeId" : "",
                "imagePath" : "",
                "isActive" : this._isActive
            },
        }    
        if(this._currentContextTemplate)
        {
            if(this._cachedActiveCallInfo === "ActiveCall")
            {
                log.debug("Active call");
                if(this.contactName)
                {
                    
                    log.debug("this.contactname");
                    ctrlData =
                    {
                         "ctrlStyle" : "OneCall",
                        "ctrlTitleId" : "ActiveCall",
                        "contact1Details" : {
                            "contactName" : this.contactName,
                            "phoneTypeId" : this._activeCallSourceType,                        
                            "imagePath" : this._activeCallCtoPath, 
                            "isActive" : this._isActive
                        },
                    }               
                }
                else if (this._activeCallPhoneNumber)
                {
                    log.debug("this.activeCallPhoneNumber");
                    ctrlData =
                    {
                            "ctrlStyle" : "OneCall",
                            "ctrlTitleId" : "ActiveCall",
                            "contact1Details" : { 
                            "contactName" : this._activeCallPhoneNumber,                  
                            "phoneTypeId" : this._activeCallSourceType,                       
                            "imagePath" : this._activeCallCtoPath , 
                            "isActive" : this._isActive
                        },
                    }
                }     
                if(ctrlData) 
                {
                    this._currentContextTemplate.inCall2Ctrl.setInCallConfig(ctrlData);   
                }
            }
            else if(this._cachedActiveCallInfo === "Connecting")
            {
                log.debug("Connecting");             
                if(this.contactName)
                {
                    log.debug(" inside active call ctxt..connecting.. contact name");
                    ctrlData =
                    {
                        "ctrlStyle" : "OneCall",
                        "ctrlTitleId" : "Connecting",
                        "contact1Details" : {
                                "contactName" : this.contactName,
                                "phoneTypeId" : this._activeCallSourceType,                          
                                "imagePath" : this._activeCallCtoPath ,  
                                "isActive" : true
                        },
                    }
                }
                else if (this._activeCallPhoneNumber)
                {
                    log.debug("inside active call ctxt..connecting.. phone number");
                    ctrlData =
                    {
                        "ctrlStyle" : "OneCall",
                        "ctrlTitleId" : "Connecting",
                        "contact1Details" : { 
                                "contactName" : this._activeCallPhoneNumber,                   
                                "phoneTypeId" : this._activeCallSourceType,       
                                "imagePath" : this._activeCallCtoPath, 
                                "isActive" : true
                        },
                    }
                }                     
                this._currentContextTemplate.inCall2Ctrl.setInCallConfig(ctrlData);        
            }   
        }    
    }    
}

phoneApp.prototype._populateActiveCall1Data = function()
{
    if(this._cachedCmuOrPhone === "Handset")
    {
        this._blankContactDetails();
    }
    else if(this._cachedCmuOrPhone === "Vehicle")
    {    
        log.debug("_populateActiveCall1Data..");
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "ActiveCall1")
        {
            var ctrlData =
            {
                "ctrlTitleId" : "Call1Active"       
            }         
        }
        else if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "ActiveCall2")
        {
            var ctrlData =
            {
                "ctrlTitleId" : "Call2Active"       
            }         
        }
        else if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "ActiveCallMerged")
        {
            var ctrlData =
            {
                "ctrlTitleId" : "ConferenceCall"       
            }         
        }                                    
        if(this._currentContextTemplate)
        {
            if(ctrlData)
            {
                this._currentContextTemplate.inCall2Ctrl.setInCallConfig(ctrlData);
            }
            if(this._call1ContactName)
            {                
                this._contact1Details["contactName"] = this._call1ContactName;  
                this._contact1Details["phoneTypeId"] = this._call1Type;
                this._contact1Details["imagePath"] = this._call1CtoPath;
                this._contact1Details["isActive"] = this._isActive1;  
            }
            else if (this._cachedConferenceCallNumberFirst)
            {            
                this._contact1Details["contactName"] = this._cachedConferenceCallNumberFirst;
                this._contact1Details["phoneTypeId"] = this._call1Type;
                this._contact1Details["imagePath"] = this._call1CtoPath;
                this._contact1Details["isActive"] = this._isActive1;                  
                 
            }
            this._currentContextTemplate.inCall2Ctrl.setContact1Config(this._contact1Details, null);
        }
    }    
}

phoneApp.prototype._populateActiveCall2Data = function()
{
    if(this._cachedCmuOrPhone === "Handset")
    {
        this._blankContactDetails();
    }
    else if(this._cachedCmuOrPhone === "Vehicle")
    {        
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "ActiveCall1")
        {
            var ctrlData =
            {
                "ctrlTitleId" : "Call1Active"       
            }         
        }
        else if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "ActiveCall2")
        {
            var ctrlData =
            {
                "ctrlTitleId" : "Call2Active"       
            }         
        }
        else if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "ActiveCallMerged")
        {
            var ctrlData =
            {
                "ctrlTitleId" : "ConferenceCall"       
            }         
        }                                  
        if(this._currentContextTemplate)
        {
            if(ctrlData)
            {
                 this._currentContextTemplate.inCall2Ctrl.setInCallConfig(ctrlData);
            }          
            if(this._call2ContactName)
            {                
                this._contact2Details["contactName"] = this._call2ContactName;
                this._contact2Details["phoneTypeId"] = this._call2Type;
                this._contact2Details["imagePath"] = this._call2CtoPath;
                this._contact2Details["isActive"] = this._isActive2;
                       
            }
            else if (this._cachedConferenceCallNumberSecond)
            {                
                this._contact2Details["contactName"] = this._cachedConferenceCallNumberSecond;
                this._contact2Details["phoneTypeId"] = this._call2Type;
                this._contact2Details["imagePath"] = this._call2CtoPath;
                this._contact2Details["isActive"] = this._isActive2;
                  
            }   
            this._currentContextTemplate.inCall2Ctrl.setContact2Config(this._contact2Details, null); 
        }    
    }    
}

// Populate Dialog Ctrl
phoneApp.prototype._populateDialogCtrl = function()
{    
    log.debug("phoneApp _populateDialogCtrl called..." + this._currentContext.ctxtId);
    if (this._currentContext && this._currentContextTemplate)
    {
        switch (this._currentContext.ctxtId)
        {            
            case "IncomingCall":                             
               var ctrlData =  null;
               if(this.contactName)
                {
                    ctrlData = {
                        "contentStyle" : "style04",
                        "text1" : this.contactName,
                        "text2Id" : this._activeCallSourceType,                       
                        "imagePath1" : this._activeCallCtoPath
                    };                                               
                } 
                else
                {
                   ctrlData = {
                        "contentStyle" : "style04",
                        "text1" : this._cachedPhoneNumber,
                        "text2Id" : this._activeCallSourceType,                       
                        "imagePath1" : this._activeCallCtoPath
                    };    
                }                
                if(ctrlData)
                {
                    this._currentContextTemplate.dialog3Ctrl._setDialogConfig(ctrlData);                             
                }
                this._disableIncomingButtons();
                break;
             case "CallWaiting":                
                //TODO: When Caller Id will present set Text2 to caller id/ Unknown if name is not present.
                               var ctrlData =  null;
               if(this.contactName)
                {
                    ctrlData = {
                        "contentStyle" : "style04",
                        "text1" : this.contactName,
                        "text2Id" : this._activeCallSourceType,                       
                        "imagePath1" : this._activeCallCtoPath
                    };                                               
                } 
                else
                {
                   ctrlData = {
                        "contentStyle" : "style04",
                        "text1" : this._cachedPhoneNumber,
                        "text2Id" : this._activeCallSourceType,                       
                        "imagePath1" : this._activeCallCtoPath
                    };    
                }                
                if(ctrlData)
                {
                    this._currentContextTemplate.dialog3Ctrl._setDialogConfig(ctrlData);      
                }
                this._disableCallWaitingButtons();
                break;
            case "CallConfirmation":                
                if(this._cachedByVoice)
                {                    
                    log.debug("Inside dialog ctrl of call confirmation");                    
                    if(this.contactNameOfCall2)
                    {
                        this._callConfirmationStringOne = this.contactNameOfCall2;
                        this._currentContextTemplate.dialog3Ctrl.setText1(this._callConfirmationStringOne);
                    }                    
                    if(this._typeOfCall2)
                    {
                        var text2Id = this._typeOfCall2;
                        if(text2Id === "Mobile")
                        {                     
                            text2Id =  framework.localize.getLocStr(this.uiaId, text2Id) + " " + this._cachedCnfPhoneNumber;
                        }
                        else if(text2Id === "Home")
                        {                   
                            text2Id =  framework.localize.getLocStr(this.uiaId, text2Id) + " " + this._cachedCnfPhoneNumber;
                        }
                        else if(text2Id === "Work")
                        {                        
                            text2Id =  framework.localize.getLocStr(this.uiaId, text2Id) + " " + this._cachedCnfPhoneNumber;
                        }
                        else if(text2Id === "Other")
                        {                      
                            text2Id =  framework.localize.getLocStr(this.uiaId, text2Id) + " " + this._cachedCnfPhoneNumber;
                        }                        
                        this._currentContextTemplate.dialog3Ctrl.setText2(text2Id);        
                    }
                    else
                    {
                        this._callConfirmationString = this._cachedCnfPhoneNumber;
                        this._currentContextTemplate.dialog3Ctrl.setText2(this._callConfirmationString);    
                    } 
                    
                    log.debug("Value of call confirmation" + this._callConfirmationString);                    
                    var text3Id = "CallConfirmationTextThird";
                    this._currentContextTemplate.dialog3Ctrl.setText3Id(text3Id);     
                } 
                else
                {
                   if(this.contactNameOfCall2)
                    {
                        this._callConfirmationStringOne = this.contactNameOfCall2;
                        this._currentContextTemplate.dialog3Ctrl.setText1(this._callConfirmationStringOne);
                    }                    
                    if(this._typeOfCall2)
                    {
                        var text2Id = this._typeOfCall2;
                        if(text2Id === "Mobile")
                        {                       
                            text2Id =  framework.localize.getLocStr(this.uiaId, text2Id) + " " + this._cachedCnfPhoneNumber;
                        }
                        else if(text2Id === "Home")
                        {                       
                            text2Id =  framework.localize.getLocStr(this.uiaId, text2Id) + " " + this._cachedCnfPhoneNumber;
                        }
                        else if(text2Id === "Work")
                        {              
                            text2Id =  framework.localize.getLocStr(this.uiaId, text2Id) + " " + this._cachedCnfPhoneNumber;
                        }
                        else if(text2Id === "Other")
                        {                           
                            text2Id =  framework.localize.getLocStr(this.uiaId, text2Id) + " " + this._cachedCnfPhoneNumber;
                        }                        
                        this._currentContextTemplate.dialog3Ctrl.setText2(text2Id);        
                    }
                    else
                    {
                        this._callConfirmationString = this._cachedCnfPhoneNumber;
                        this._currentContextTemplate.dialog3Ctrl.setText2(this._callConfirmationString);
                    }   
                    log.debug("2. Value of call confirmation" + this._callConfirmationString);                    
                    var text3 = " ";
                    this._currentContextTemplate.dialog3Ctrl.setText3(text3);      
                }                   
                break;
            default:
                break;
        }
    }    
}

phoneApp.prototype._convert = function(secs)
{
        var hr = Math.floor(secs / 3600);
        var min = Math.floor((secs - (hr * 3600))/60);
        var sec = secs - (hr * 3600) - (min * 60);
        
        if(min < 10)
        {
            min = '0' + min;
        }
        if(sec < 10)
        {
            sec = '0' + sec;
        }
        if(hr < 10)
        {
            hr = '0' + hr;
        }
        
        return hr +':'+ min + ':' + sec;
}

// Populate  All Calls List
phoneApp.prototype._populateRecentCallCtxtList = function()
{
    if (this._currentContextTemplate)
    {
        var dataList = {};
        dataList.itemCountKnown = true;
        dataList.itemCount = 0; // total no. of contacts received from DBAPI, not the no. of items requested in chunks
        dataList.items = this._cachedCallsList;
        this._currentContextTemplate.list2Ctrl.setLoading(false);        
        this._currentContextTemplate.list2Ctrl.setDataList(dataList);
        this._currentContextTemplate.list2Ctrl.dataList.vuiSupport = true;
        if(dataList.itemCount)
        {
            this._currentContextTemplate.list2Ctrl.updateItems(0, dataList.itemCount - 1);
        }
    }
}

// Populate Missed Calls List
phoneApp.prototype._populateMissedRecentCallCtxtList = function()
{
    if (this._currentContextTemplate)
    {
        var dataList = {};
        dataList.itemCountKnown = true;
        dataList.itemCount = 0; // total no. of contacts received from DBAPI, not the no. of items requested in chunks
        dataList.items = this._cachedMissedCallsList;
        this._currentContextTemplate.list2Ctrl.setLoading(false);        
        this._currentContextTemplate.list2Ctrl.setDataList(dataList);
        this._currentContextTemplate.list2Ctrl.dataList.vuiSupport = true;
        if(dataList.itemCount)
        {
            this._currentContextTemplate.list2Ctrl.updateItems(0, dataList.itemCount - 1);
        }
    }
}

//populate Number List
phoneApp.prototype._populateNumberList = function()
{
    log.debug("_populateNumberList..");
    if (this._currentContextTemplate)
    {
        var count = 0;
        var mobileNumCount = 0;
        var homeNumCount = 0;
        var workNumCount = 0;
        var otherNumCount = 0;
    
        var contactId = null;
        
        if(this.contactId)
        {
            contactId = this.contactId;
        }
        
        if (this.mobileNumber)
        {
            mobileNumCount = this.mobileNumber.length;
        }
        if (this.homeNumber)
        {
            homeNumCount = this.homeNumber.length;
        }
        if (this.workNumber)
        {
            workNumCount = this.workNumber.length;
        }
        if (this.otherNumber)
        {
            otherNumCount = this.otherNumber.length;
        }
    
    
    
        var items = new Array();        

        var i = 0;
    
        if(this._cachedContactNumberType === "WorkPhone")
        {
            for(i = 0; i < workNumCount; i++)
            {
                items[i] = { appData : {eventName : "SelectPhoneNumber", phoneNumber : this.workNumber[i], id : contactId, phoneType : "WorkPhone"}, text1 : this.workNumber[i], label1Id: "Work",  itemStyle : "style14", hasCaret : false};
            }
            count = workNumCount;
        }
        else if(this._cachedContactNumberType === "HomePhone")
        {
            for(i = 0; i < homeNumCount; i++)
            {
                items[i] = { appData : {eventName : "SelectPhoneNumber", phoneNumber : this.homeNumber[i], id : contactId, phoneType : "HomePhone"}, text1 : this.homeNumber[i], label1Id: "Home", itemStyle : "style14", hasCaret : false};
            }            
            count = homeNumCount;
        }
        else if(this._cachedContactNumberType === "MobilePhone")
        {
            for(i = 0; i < mobileNumCount; i++)
            { 
                items[i] = { appData : {eventName : "SelectPhoneNumber", phoneNumber : this.mobileNumber[i], id : contactId, phoneType : "MobilePhone"}, text1 : this.mobileNumber[i], label1Id: "Mobile", itemStyle : "style14", hasCaret : false};
            }            
            count = mobileNumCount;
        }
        else if(this._cachedContactNumberType === "OtherPhone")
        {
            for(i = 0; i < otherNumCount; i++)
            { 
                items[i] = { appData : {eventName : "SelectPhoneNumber", phoneNumber : this.otherNumber[i], id : contactId, phoneType : "OtherPhone"}, text1 : this.otherNumber[i], label1Id: "Other", itemStyle : "style14", hasCaret : false};
            }
            count = otherNumCount;
        }
        else if(this._cachedContactNumberType === "All")
        {
            for(i = 0; i < mobileNumCount; i++)
            {                            
                items[i] = { appData : {eventName : "SelectPhoneNumber", phoneNumber : this.mobileNumber[i], id : contactId, phoneType : "MobilePhone"}, text1 : this.mobileNumber[i], label1Id: "Mobile", itemStyle : "style14", hasCaret : false};
            }
            count = mobileNumCount;
        
            for(i = 0; i < homeNumCount; i++)
            {              
                items[count + i] = { appData : {eventName : "SelectPhoneNumber", phoneNumber : this.homeNumber[i], id : contactId, phoneType : "HomePhone"}, text1 : this.homeNumber[i], label1Id: "Home", itemStyle : "style14", hasCaret : false};               
            }
            count = count + homeNumCount;
        
            for(i = 0; i < workNumCount; i++)
            {                            
                items[count + i] = { appData : {eventName : "SelectPhoneNumber", phoneNumber : this.workNumber[i], id : contactId, phoneType : "WorkPhone"}, text1 : this.workNumber[i], label1Id: "Work",itemStyle : "style14", hasCaret : false};              
            }
            count = count + workNumCount;
        
            for(i = 0; i < otherNumCount; i++)
            {                            
                items[count + i] = { appData : {eventName : "SelectPhoneNumber", phoneNumber : this.otherNumber[i], id : contactId, phoneType : "OtherPhone"}, text1 : this.otherNumber[i], label1Id: "Other", itemStyle : "style14", hasCaret : false};               
            }            
            count = count + otherNumCount;         
        }
           
        var dataList =
        {
            itemCountKnown : true,
            itemCount : count,
            items : items
        };
                
        if (this._currentContextTemplate)
        {
            this._currentContextTemplate.list2Ctrl.setDataList(dataList);
            this._currentContextTemplate.list2Ctrl.dataList.vuiSupport = true;
            this._currentContextTemplate.list2Ctrl.updateItems(0, dataList.items.length - 1);
        }
    }
}

//populate Number List
phoneApp.prototype._populateNumberTypeList = function()
{
    log.debug("_populateNumberTypeList..");
    if (this._currentContextTemplate)
    {
        var count = 0;
        var mobileNumCount = 0;
        var homeNumCount = 0;
        var workNumCount = 0;
        var otherNumCount = 0;
    
        var contactId = null;
        
        if(this.contactId)
        {
            contactId = this.contactId;
        }
        
        if (this.mobileNumber)
        {
            mobileNumCount = this.mobileNumber.length;
        }
        if (this.homeNumber)
        {
            homeNumCount = this.homeNumber.length;
        }
        if (this.workNumber)
        {
            workNumCount = this.workNumber.length;
        }
        if (this.otherNumber)
        {
            otherNumCount = this.otherNumber.length;
        }   

    
        var items = new Array();
    
        var i = 0;  
    
        if(this._cachedTypeDisambType === "WorkPhone")
        {
            for(i = 0; i < workNumCount; i++)
            {
                items[i] = { appData : {eventName : "SelectPhoneNumber", phoneNumber : this.workNumber[i], id : contactId, phoneType : "WorkPhone"}, text1 : this.workNumber[i], label1Id: "Work", itemStyle : "style14", hasCaret : false};
            }
            count = workNumCount;
        }
        else if(this._cachedTypeDisambType === "HomePhone")
        {
            for(i = 0; i < homeNumCount; i++)
            { 
                items[i] = { appData : {eventName : "SelectPhoneNumber", phoneNumber : this.homeNumber[i], id : contactId, phoneType : "HomePhone"}, text1 : this.homeNumber[i], label1Id: "Home", itemStyle : "style14", hasCaret : false};
            }            
            count = homeNumCount;
        }
        else if(this._cachedTypeDisambType === "MobilePhone")
        {
            for(i = 0; i < mobileNumCount; i++)
            { 
                items[i] = { appData : {eventName : "SelectPhoneNumber", phoneNumber : this.mobileNumber[i], id : contactId, phoneType : "MobilePhone"}, text1 : this.mobileNumber[i], label1Id: "Mobile", itemStyle : "style14", hasCaret : false};
            }            
            count = mobileNumCount;
        }
        else if(this._cachedTypeDisambType === "OtherPhone")
        {
            for(i = 0; i < otherNumCount; i++)
            { 
                items[i] = { appData : {eventName : "SelectPhoneNumber", phoneNumber : this.otherNumber[i], id : contactId, phoneType : "OtherPhone"}, text1 : this.otherNumber[i], label1Id: "Other", itemStyle : "style14", hasCaret : false};
            }
            count = otherNumCount;
        }
        else if(this._cachedTypeDisambType === "All")
        {
            for(i = 0; i < mobileNumCount; i++)
            {                               
                items[i] = { appData : {eventName : "SelectPhoneNumber", phoneNumber : this.mobileNumber[i], id : contactId, phoneType : "MobilePhone"}, text1 : this.mobileNumber[i], label1Id: "Mobile", itemStyle : "style14", hasCaret : false};
            }
            count = mobileNumCount;
        
            for(i = 0; i < homeNumCount; i++)
            {              
                items[count + i] = { appData : {eventName : "SelectPhoneNumber", phoneNumber : this.homeNumber[i], id : contactId, phoneType : "HomePhone"},  text1 : this.homeNumber[i], label1Id: "Home", itemStyle : "style14", hasCaret : false};
            }
            count = count + homeNumCount;
        
            for(i = 0; i < workNumCount; i++)
            {                               
                items[count + i] = { appData : {eventName : "SelectPhoneNumber", phoneNumber : this.workNumber[i], id : contactId, phoneType : "WorkPhone"}, text1 : this.workNumber[i], label1Id: "Work", itemStyle : "style14", hasCaret : false};
            }
            count = count + workNumCount;
        
            for(i = 0; i < otherNumCount; i++)
            {                              
                items[count + i] = { appData : {eventName : "SelectPhoneNumber", phoneNumber : this.otherNumber[i], id : contactId, phoneType : "OtherPhone"}, text1 : this.otherNumber[i], label1Id: "Other", itemStyle : "style14", hasCaret : false};
            }            
            count = count + otherNumCount;
        }
           
        var dataList =
        {
            itemCountKnown : true,
            itemCount : count,
            items : items
        };
    
        var title =
        {
            text1 : this._title,            
            titleStyle : "style02"
        };
        
        if (this._currentContextTemplate)
        {
            this._currentContextTemplate.list2Ctrl.setTitle(title);
            this._currentContextTemplate.list2Ctrl.setDataList(dataList);
            this._currentContextTemplate.list2Ctrl.dataList.vuiSupport = true;
            this._currentContextTemplate.list2Ctrl.updateItems(0, dataList.items.length - 1);
        }
    }
}

phoneApp.prototype._updateMute = function()
{
    if(this._currentContextTemplate)
    {
        if(this._cachedMute === "Mute")
        {            
            this._currentContextTemplate.inCall2Ctrl.umpCtrl.setButtonState("SelectMuteCall", this._cachedMute);
        }
        else if(this._cachedMute === "Unmute")
        {            
            this._currentContextTemplate.inCall2Ctrl.umpCtrl.setButtonState("SelectMuteCall", this._cachedMute);
        }    
    }
}

phoneApp.prototype._updateTransferToHandset = function()
{
    log.debug("_updateTransferToHandset..");
    if(this._currentContext && this._currentContext.ctxtId)
    {
    if(this._cachedCmuOrPhone === "Handset")
    {
        log.debug("Inside updatetransfer to handset... inside call to handset")
        this._currentContextTemplate.inCall2Ctrl.setInCallOnHandset(true);  
        this._currentContextTemplate.inCall2Ctrl.umpCtrl.setButtonState("SelectCMUAudio", "Vehicle");
        switch (this._currentContext.ctxtId)
        {
            case "ActiveCall" :
                this._disableActiveCallUmp();                
                break;         
            case "ActiveCall1" :
            case "ActiveCall2" :               
                this._updateMute();    
                this._disableActiveCall1Ump();
                break; 
            case "ActiveCallMerged" :              
                this._disableActiveCallUmp(); 
                break;            
            default:
            break;
        }     
    }
    else if(this._cachedCmuOrPhone === "Vehicle")
    {
        log.debug("inside vehiccle");
        this._currentContextTemplate.inCall2Ctrl.setInCallOnHandset(false);        
        this._currentContextTemplate.inCall2Ctrl.umpCtrl.setButtonState("SelectCMUAudio", "Handset");
        switch (this._currentContext.ctxtId)
        {
            case "ActiveCall" :
                this._updateMute();   
                this._populateActiveCallUmp();
                break;
            case "ActiveCall1" :
                this._updateMute();
                if(this._cachedConferenceType === "Connecting")
                {
                    this._populateDisableActiveCall1Ump();
                }
                else
                {
                    this._populateEnableActiveCall1Ump();
                }                
                break;                
            case "ActiveCall2" :
                this._updateMute();
                if(this._cachedConferenceType === "Connecting")
                {
                    this._populateDisableActiveCall1Ump();
                }
                else
                {
                    this._populateEnableActiveCall1Ump();
                }
                break;
            case "ActiveCallMerged" :
                this._updateMute();
                this._populateEnableActiveCallMergedUmp();
                this._disableGeneralFunction("SelectAddCall");    
                this._disableGeneralFunction("swapcalls_disabled"); 
                this._currentContextTemplate.inCall2Ctrl.umpCtrl.setButtonState("swapcalls_disabled", "01"); 
                break;
            default:
            break;        
        }
    }
}
}

phoneApp.prototype._blankContactDetailsActiveCall = function()
{
    log.debug(" inside blacnk");
    var ctrlData =
    {
        "ctrlStyle" : "OneCall",
        "ctrlTitleId" : "CallOnHandset",
        "contact1Details" : {
        "contactName" : null,
        "phoneNumber" : null,                
        "phoneTypeId" : null,
        "imagePath" : null,
        "isActive" : this._isActive
            },                                       
    }   
    
    if(this._currentContextTemplate && ctrlData)
    {
        log.debug("inside blacnk current ctxt");
        this._currentContextTemplate.inCall2Ctrl.setInCallConfig(ctrlData);               
    }
    
}


phoneApp.prototype._blankContactDetails = function()
{
    log.debug("In _blankContactDetails..");
    var ctrlData =
        {
            "ctrlTitleId" : "CallOnHandset",
            "contact1Details" : {
            "contactName" : "",
            "phoneNumber" : "",                
            "phoneTypeId" : "",
            "imagePath" : "",
            "isActive" : this._isActive1
                },
            "contact2Details" : {
            "contactName" : "",
            "phoneNumber" : "",                
            "phoneTypeId" : "",
            "imagePath" : "",
            "isActive" : this._isActive2
                },
        }                       
    if(this._currentContextTemplate && ctrlData)
    {
        this._currentContextTemplate.inCall2Ctrl.setInCallConfig(ctrlData);    
    }
}

phoneApp.prototype._disableActiveCallUmp = function()
{
    log.debug("Inside disable active call ump");
    this._disableGeneralFunction("SelectEndCall"); 
    this._disableGeneralFunction("SelectMuteCall");
    this._currentContextTemplate.inCall2Ctrl.umpCtrl.setButtonState("SelectMuteCall", this._cachedMute);
    this._disableGeneralFunction("SelectAddCall");
    this._disableGeneralFunction("swapcalls_disabled");
    this._currentContextTemplate.inCall2Ctrl.umpCtrl.setButtonState("swapcalls_disabled", "01"); 
    this._disableGeneralFunction("SelectDtmfShow");  
}

phoneApp.prototype._disableActiveCall1Ump = function()
{
    this._disableGeneralFunction("SelectEndCall"); 
    this._disableGeneralFunction("SelectMuteCall");
    this._currentContextTemplate.inCall2Ctrl.umpCtrl.setButtonState("SelectMuteCall", this._cachedMute);
    this._disableGeneralFunction("SelectMergeCall");
    this._disableGeneralFunction("SelectDtmfShow");
    if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "ActiveCall1")
    {
        this._disableGeneralFunction("swapcalls_enabled_call1active");
        this._currentContextTemplate.inCall2Ctrl.umpCtrl.setButtonState("swapcalls_enabled_call1active", "01");        
    }
    if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "ActiveCall2")
    {
        this._disableGeneralFunction("swapcalls_enabled_call2active");
        this._currentContextTemplate.inCall2Ctrl.umpCtrl.setButtonState("swapcalls_enabled_call2active", "02");    
    } 
}

phoneApp.prototype._disableGeneralFunction = function(buttonId)
{
    if(this._currentContextTemplate)
    {
        log.debug(" disable genral function");
        log.debug(" disable genral function");
        this._currentContextTemplate.inCall2Ctrl.umpCtrl.setButtonDisabled(buttonId, true); 
        log.debug(" after disable genral function");
    }
}

phoneApp.prototype._enableGeneralFunction = function(buttonId)
{
    if(this._currentContextTemplate)
    {
        log.debug(".. inside enable genral function");
        this._currentContextTemplate.inCall2Ctrl.umpCtrl.setButtonDisabled(buttonId, false);   
    }
}

phoneApp.prototype._populateDisableActiveCall1Ump = function()
{
    this._disableGeneralFunction("SelectMergeCall");
    if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "ActiveCall1")
    {
        this._disableGeneralFunction("swapcalls_enabled_call1active");
        this._currentContextTemplate.inCall2Ctrl.umpCtrl.setButtonState("swapcalls_enabled_call1active", "01");        
    }
    if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "ActiveCall2")
    {
        this._disableGeneralFunction("swapcalls_enabled_call2active");  
        this._currentContextTemplate.inCall2Ctrl.umpCtrl.setButtonState("swapcalls_enabled_call2active", "02");        
    } 

}


phoneApp.prototype._populateEnableActiveCall1Ump = function()
{
    this._enableGeneralFunction("SelectEndCall"); 
    if(framework.localize.getRegion() === framework.localize.REGIONS.Japan)
    {
        this._disableGeneralFunction("SelectMergeCall");
    }
    else
    {
        this._enableGeneralFunction("SelectMergeCall");
    }
    this._enableGeneralFunction("SelectDtmfShow"); 
    this._enableGeneralFunction("SelectMuteCall");
        
    if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId)
    {
        this._currentContextTemplate.inCall2Ctrl.umpCtrl.setButtonState("SelectMuteCall", this._cachedMute); 
        if(this._currentContext.ctxtId === "ActiveCall1")
        {
            this._currentContextTemplate.inCall2Ctrl.umpCtrl.setButtonDisabled ("swapcalls_enabled_call1active", false);
            if(!this._swapUMPStateChangedInCurrentContext)
			{
				this._currentContextTemplate.inCall2Ctrl.umpCtrl.setButtonState("swapcalls_enabled_call1active", "01"); 
			}
			this._swapUMPStateChangedInCurrentContext = false;
        }
        if(this._currentContext.ctxtId === "ActiveCall2")
        {
            this._currentContextTemplate.inCall2Ctrl.umpCtrl.setButtonDisabled("swapcalls_enabled_call2active", false);
            if(!this._swapUMPStateChangedInCurrentContext)
			{
				this._currentContextTemplate.inCall2Ctrl.umpCtrl.setButtonState("swapcalls_enabled_call2active", "02");  
			}
			this._swapUMPStateChangedInCurrentContext = false;
        }    
    }
}

phoneApp.prototype._populateEnableActiveCallMergedUmp = function()
{
    this._enableGeneralFunction("SelectEndCall");   
    this._enableGeneralFunction("SelectDtmfShow");
    this._enableGeneralFunction("SelectMuteCall");
    if(this._currentContextTemplate)
    {
    this._currentContextTemplate.inCall2Ctrl.umpCtrl.setButtonState("SelectMuteCall", this._cachedMute);  
    }
}

// Add/Update items to list control
phoneApp.prototype._addItemsToListRecentCalls  = function(itemsList, offset, count)
{
    log.debug("_addItemsToListRecentCalls.." + offset + "count.." + count);
    if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "RecentCalls")
    {         
        var strAll = new Array(); 
        var strAllImage = new Array();
        var getdatetime = new Array();
        var setdate  = new Array();
        var settime  = new Array();        
        // reference to the list control        
        var currentList = this._currentContextTemplate.list2Ctrl;       
        log.debug("offset: " + offset + " count" + count + "itemsList.length.." + itemsList.length);        
        
        for (var i = offset, j = -1; i < count; i++)
        {
            if (j < itemsList.length)
            {
                j++;            
            }
            
            if(itemsList[i-offset].displayName != "") 
            {
                strAll[j] = itemsList[i-offset].displayName;
            }            
            else if(itemsList[i-offset].number != "") 
            {
                strAll[j] = itemsList[i-offset].number;    
            }
            else  
            {
                strAll[j] = "Unknown";    
            }
            
           
            if(itemsList[i-offset].category === "Missed")
            {
               strAllImage[j] = "./common/images/icons/IcnListCall_Missed.png";  
            }
            else if(itemsList[i-offset].category === "Dialled")
            {
                strAllImage[j] = "./common/images/icons/IcnListOutgoingCalls.png";  
            }
            else if(itemsList[i-offset].category === "Received")
            {               
                strAllImage[j] = "./common/images/icons/IcnListIncomingCalls.png";
            }             
            if(itemsList[i - offset].timestamp == 0)
            {
                getdatetime[j] = "";         
                settime[j] = "";
                setdate[j] = "";
            }
            else
            {
                getdatetime[j] = itemsList[i - offset].timestamp;         
                settime[j] = utility.formatTime(getdatetime[j],false);
                setdate[j] = utility.formatDate(getdatetime[j]);   
            }
            
            
            log.debug("Adding " + itemsList[i-offset].displayName);
            log.debug("Adding " + itemsList[i-offset].number); 
            if(strAll[j] === "Unknown")
            {
                this._cachedCallsList.push({
                appData : {eventName : "CallRecent", id : itemsList[i-offset].id , number : itemsList[i-offset].number, callCategory: itemsList[i-offset].category, timeStamp : itemsList[i-offset].timestamp, name : itemsList[i-offset].displayName},
                text1Id : strAll[j],  
                label1 : settime[j],
                label2 : setdate[j],
                image1 : strAllImage[j],
                hasCaret : false, 
                itemBehavior : 'shortAndLong', 
                itemStyle : 'style07',
                labelWidth:'wide'
                });
            }
            else
            {
                this._cachedCallsList.push({
                appData : {eventName : "CallRecent", id : itemsList[i-offset].id , number : itemsList[i-offset].number, callCategory: itemsList[i-offset].category, timeStamp : itemsList[i-offset].timestamp, name : itemsList[i-offset].displayName},
                text1 : strAll[j],  
                label1 : settime[j],
                label2 : setdate[j],
                image1 : strAllImage[j],
                hasCaret : false, 
                itemBehavior : 'shortAndLong', 
                itemStyle : 'style07',
                labelWidth:'wide'
                });
            }            
        }
        if (!this._isAllItemsPopulatedBefore)
        {   
            
            // we still don't have a datalist -> set datalist
            var dataList = {};
            dataList.itemCountKnown = true;
            dataList.itemCount = this._callListTotalCount; 
            dataList.items = this._cachedCallsList;
            currentList.setDataList(dataList);
            currentList.dataList.vuiSupport = true;
            this._isAllItemsPopulatedBefore = true;
        }
        else
        {            
            log.debug("itemsList.length.. " + itemsList.length);
            log.debug("Else case.. offset & count.. " + offset + "Count.." + count);
            // we already have a datalist -> set new items
            for (var i = offset, j = -1; i < count; i++)
            {
                if (j < itemsList.length)
                {
                    j++;
                }
               
                currentList.dataList.items[i].appData = { eventName : "CallRecent", id : itemsList[j].id , number : itemsList[j].number , callCategory: itemsList[j].category, timeStamp : itemsList[j].timestamp};
                if(strAll[j] === "Unknown")
                {
                    currentList.dataList.items[i].text1Id = strAll[j]; 
                }
                else
                {
                    currentList.dataList.items[i].text1 = strAll[j];
                }                
                currentList.dataList.items[i].image1 = strAllImage[j];
                currentList.dataList.items[i].label1 = settime[j];
                currentList.dataList.items[i].label2 = setdate[j];
                currentList.dataList.items[i].hasCaret = false;
                currentList.dataList.items[i].itemBehavior = 'shortAndLong';
                currentList.dataList.items[i].labelWidth = 'wide';
                currentList.dataList.items[i].itemStyle = 'style07';
            }
        }        
        // update items
        log.debug("Update items.." +  count + "..offset.." + offset);
        currentList.dataList.vuiSupport = true;        
        currentList.updateItems(offset, (count-1));               
    }
}

// Add/Update items to list control
phoneApp.prototype._addItemsToListMissedRecentCalls  = function(itemsList, offset, count)
{
    log.debug("_addItemsToListMissedRecentCalls");
    if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "RecentCalls")
    {
        var strMissed = new Array();
        var strMissedImage = new Array();
        var getdatetime = new Array();
        var settime  = new Array(); 
        var setdate  = new Array(); 
        // reference to the list control        
        var currentList = this._currentContextTemplate.list2Ctrl;        
        log.debug("offset: " + offset + " count" + count);
        
         for (var i = offset, j = -1; i < count; i++)
         {
            if (j < itemsList.length)
            {
                j++;            
            }
            if(itemsList[i-offset].displayName != "") 
            {
                strMissed[j] = itemsList[i-offset].displayName;
            }            
            else if(itemsList[i-offset].number != "")
            {
                strMissed[j] = itemsList[i-offset].number;    
            }
            else
            {
                strMissed[j] = "Unknown";
            }
            
            
            if(itemsList[i-offset].category === "Missed")
            {
               strMissedImage[j] = "./common/images/icons/IcnListCall_Missed.png";  
            }
            else if(itemsList[i-offset].category === "Dialled")
            {
                strMissedImage[j] = "./common/images/icons/IcnListCall_Outgoing.png";  
            }
            else if(itemsList[i-offset].category === "Received")
            {                
                strMissedImage[j] = "./common/images/icons/IcnListCall_Incoming.png"; 
            }     
            if(itemsList[i - offset].timestamp == 0)
            {
                getdatetime[j] = "";         
                settime[j] = "";
                setdate[j] = "";
            }
            else
            {
                getdatetime[j] = itemsList[i - offset].timestamp;         
                settime[j] = utility.formatTime(getdatetime[j],false);   
                setdate[j] = utility.formatDate(getdatetime[j]); 
            }
            
            log.debug("Adding Missed" + itemsList[i-offset].displayName);
            log.debug("Adding Missed" + itemsList[i-offset].number);  
            if(strMissed[j] === "Unknown")
            {
                this._cachedMissedCallsList.push({
                appData : {eventName : "CallRecent", id : itemsList[i-offset].id , number : itemsList[i-offset].number, callCategory: itemsList[i-offset].category, timeStamp : itemsList[i-offset].timestamp, name : itemsList[i-offset].displayName},
                text1Id : strMissed[j],  // Using text1 because contact names doesn't have to be localized
                label1 : settime[j],
                label2 : setdate[j],
                image1 : strMissedImage[j],
                hasCaret : false, 
                itemBehavior : 'shortAndLong', 
                itemStyle : 'style07',
                labelWidth:'wide'
                });
            }
            else
            {
                this._cachedMissedCallsList.push({
                appData : {eventName : "CallRecent", id : itemsList[i-offset].id , number : itemsList[i-offset].number, callCategory: itemsList[i-offset].category, timeStamp : itemsList[i-offset].timestamp, name : itemsList[i-offset].displayName},
                text1 : strMissed[j],  // Using text1 because contact names doesn't have to be localized
                label1 : settime[j],
                label2 : setdate[j],
                image1 : strMissedImage[j],
                hasCaret : false, 
                itemBehavior : 'shortAndLong', 
                itemStyle : 'style07',
                labelWidth:'wide'
                });
            }            
        }        
        if (!this._isMissedItemsPopulatedBefore)
        {           
            // we still don't have a datalist -> set datalist
            var dataList = {};
            dataList.itemCountKnown = true;
            dataList.itemCount = this._missedCallListTotalCount; 
            dataList.items = this._cachedMissedCallsList;
            currentList.setDataList(dataList);
            currentList.dataList.vuiSupport = true;
            this._isMissedItemsPopulatedBefore = true;
        }
        else
        {            
            // we already have a datalist -> set new items
            for (var i = offset, j = -1; i < count; i++)
            {
                if (j < itemsList.length)
                {
                    j++;
                }
               
                currentList.dataList.items[i].appData = { eventName : "CallRecent", id : itemsList[j].id , number : itemsList[j].number , callCategory: itemsList[j].category, timeStamp : itemsList[j].timestamp};
                if(strMissed[j] === "Unknown")
                {
                    currentList.dataList.items[i].text1Id = strMissed[j]; 
                }
                else
                {
                    currentList.dataList.items[i].text1 = strMissed[j]; 
                }                
                currentList.dataList.items[i].image1 = strMissedImage[j];
                currentList.dataList.items[i].label1 = settime[j];
                currentList.dataList.items[i].label2 = setdate[j];
                currentList.dataList.items[i].hasCaret = false;
                currentList.dataList.items[i].itemBehavior = 'shortAndLong'; 
                currentList.dataList.items[i].labelWidth = 'wide';
                currentList.dataList.items[i].itemStyle = 'style07';
            }
        }      
        // update items
        currentList.dataList.vuiSupport = true;        
        currentList.updateItems(offset, (count-1));               
    }
}

//populate ContactDisambiguation
phoneApp.prototype._populateContactDisambiguation = function()
{
    log.debug("_populateContactDisambiguation");
    if (this._currentContextTemplate)
    {           
        this._dataListItems.push({     
            appData : {eventName : "SelectContactName", id : this.contactIdList, number : this._contactDisambNumber, numberCount : this._contactDisambCount},
            text1 : this.listOfContacts,
            image1 : null,
            itemStyle : "style02",
            hasCaret : false
        });
        
        contactDisambCtxtDataList = {
                itemCountKnown : true,
                itemCount :this._dataListItems.length,
                items : this._dataListItems
            };

        if (this._currentContextTemplate)
        {
            this._currentContextTemplate.list2Ctrl.setDataList(contactDisambCtxtDataList);
            this._currentContextTemplate.list2Ctrl.dataList.vuiSupport = true;
            this._currentContextTemplate.list2Ctrl.updateItems(0, contactDisambCtxtDataList.itemCount - 1);           
        }
    }  
}

/*
 * This function is called by Common whenever a msgType="alert" comes from MMUI.
 * This function should return a properties Object to use for the WinkCtrl.
 */
phoneApp.prototype.getWinkProperties = function(alertId, params)
{
    log.debug("common is looking for wink properties:", alertId, params);
    var winkProperties = null;
    switch(alertId)
    {
        case "GUI_CannotAddCall_Alert":
            winkProperties = {
                "style": "style03",
                "text1Id": "CannotAddCall",
            };
            break;
        case "GUI_DialingFailed_Alert":
            winkProperties = {
                "style": "style03",
                "text1Id": "CannotPlaceCall",
            };
            break;
        case "GUI_CallEnded_Alert":
            this._cachedCallId = params.payload.callId;
            log.debug("Value of params call id" + this._cachedCallId);
            this._winkTimer = 0;
            log.debug("Value of contact 1 elapsed time " + this._contact1ElapsedTime);
            log.debug("Value of contact 2 elapsed time " + this._contact2ElapsedTime);          
            this._winkTimer =  this._convert(this._timer1Value);
            log.debug("Value of Wink Timer " + this._winkTimer);
            winkProperties = {
                "style": "style01",
                "text1Id": "CallEnd",               
                "text1SubMap": {"callEndTimer": " "},
                "text2" : this._winkTimer
            };
            this._resetTimerValues();
            break;
        default:
            // if alertId cannot be found, winkProperties will return null and Common will display default Wink
            log.debug("Cannot provide properties for unrecognized alertId: " + alertId);
            break;
    }
    // return the properties to Common
    return winkProperties;
};

phoneApp.prototype._populateCallEndSbn = function()
{
    log.debug("_populateCallEndSbn");
    this._SbnTimer = 0;
    this._SbnTimer =  this._convert(this._timer1Value);
    this._SbnTimer = "\u00A0\u00A0" + this._SbnTimer;
    framework.common.startTimedSbn(this.uiaId, "ShowCallEndSbn", "callId", {sbnStyle : "Style01", text1Id : "CallEnd", text1SubMap : {callEndTimer : this._SbnTimer}}); // add/update a state SBN in the display queue 
    this._resetTimerValues();
}

phoneApp.prototype._populateDialFailedSbn = function(number)
{
    log.debug("_populateDialFailedSbn");  
    log.debug("_populateDialFailedSbn..value if cachedsbntype"+ this._cachedSbntype);  
    if(number)
    {       
        log.debug("_populateDialFailedSbn.. cachedSbntype");
        framework.common.startTimedSbn(this.uiaId, "ShowDialFailedSbn", "dialFailed", {sbnStyle : "Style01", text1Id : "CannotPlaceCall"}); // add/update a state SBN in the display queue 
    }
}

//populate DialPad Control
phoneApp.prototype._populateDialPadCtrl = function()
{
    log.debug("_populateDialPadCtrl");
    if (this._currentContext && this._currentContextTemplate)
    {       
        this._currentContextTemplate.dialPad2Ctrl.setInputValue(this._cachedInputPhoneNumber);        
    }
}

//Add/Update items to list control

phoneApp.prototype._addItemsToList = function(itemsList, offset, count)
{
    log.debug(".... : _addItemsToList");       
    if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "ChoosePhoneContact")
    {
        var currentList = this._currentContextTemplate.list2Ctrl;
        var j = 0 ;
        if (!currentList.hasDataList())
        {
            var dataList = {};
            dataList.itemCountKnown = true;
            dataList.itemCount =  this._listTotalCount;
            dataList.items = [];
            for (var i = offset ; i < this._listTotalCount; i++)
            {
                //this._contactsListCount is the total count requested
                if(i >= 0 && i < (offset+count)){
                   var item = { 
                        appData : { eventName : "SelectContactName",name : itemsList[j].displayName, id : itemsList[j].contactId },
                        text1 : itemsList[j].displayName,      
                        itemStyle : "style01",
                        image1:null,
                        hasCaret : false,
                        vuiSupport : true
                    };
                    if (typeof itemsList[j].ctoPath === "string" && itemsList[j].ctoPath.length > 0)
                    {
                        item.image1 = itemsList[j].ctoPath;
                        this._freeObjectContactId.push(itemsList[j].contactId);
                        this._freeObjectDbSeqId.push(itemsList[j].dbSeqNo);
                        log.debug("::SelectContactComm ctoPath found::");
                    }            
                    else if(itemsList[j].ctoPath === null || itemsList[j].ctoPath === "" || itemsList[j].ctoPath === undefined)
                    {
                        //Setting default Image when ctoPath from Appsdk is null or blank
                        item.image1 =  "./common/images/icons/IcnListContact_En.png";                  
                        log.debug("::SelectContactComm ctoPath not found::");
                    }
                    dataList.items.push(item);
                    j+=1;
                }
                else
                {           var item = { 
                            appData : null,
                            text1 : '',
                            itemStyle : "style01",
                            image1:null,
                            hasCaret : false,
                            vuiSupport : true
                        };
                    dataList.items.push(item);
                }
            }
            currentList.setDataList(dataList);
        }
        else
        {
            // This condition is called when scrolling the contact // Add items to existing dataList
            for (var i = offset ; i < ((offset+count)); i++)
            {
                    currentList.dataList.items[i].appData = {  eventName : "SelectContactName", name : itemsList[j].displayName, id : itemsList[j].contactId },
                    currentList.dataList.items[i].text1 = itemsList[j].displayName; 
                    if (typeof itemsList[j].ctoPath === "string" && itemsList[j].ctoPath.length > 0)
                    {
                        currentList.dataList.items[i].image1 = itemsList[j].ctoPath;
                        this._freeObjectContactId.push(itemsList[j].contactId);
                        this._freeObjectDbSeqId.push(itemsList[j].dbSeqNo);
                    }
                    else
                    {
                        //Setting the default path for contact images if no ctopath from appsdk
                        currentList.dataList.items[i].image1 = "./common/images/icons/IcnListContact_En.png"; 
                        
                    }
                    currentList.dataList.items[i].itemStyle = "style01";
                    currentList.dataList.items[i].hasCaret = false;
                    currentList.dataList.vuiSupport = true;
                    j+=1;
            }
        }
        currentList.dataList.vuiSupport = true;
        var listUpdateCount = this._listTotalCount - 1; //list count starts from 0.
        currentList.updateItems(offset, listUpdateCount);
    }
}

phoneApp.prototype._getFocussedData = function()
{
    log.debug("_getFocussedData");
    var callNumber = null;
    var userContactId = null;
    var userContactName = null;
    this._focussedItem = this._currentContextTemplate.list2Ctrl._getFocussedIndex();
    callNumber = this._currentContextTemplate.list2Ctrl.dataList.items[this._focussedItem].appData.number; 
    userContactId = this._currentContextTemplate.list2Ctrl.dataList.items[this._focussedItem].appData.id; 
    userContactName = this._currentContextTemplate.list2Ctrl.dataList.items[this._focussedItem].appData.name; 
    framework.sendEventToMmui(this.uiaId, "SelectFavoritesNumber", {payload:{phoneNumber : callNumber, contactId : userContactId, name : userContactName}});
}

phoneApp.prototype._resetVariableValues = function()
{
    this._cachedContactsList.splice(1,this._cachedContactsList.length-1);
    this._listNeedDataOffsetIndex = 0;
    this._listActualDataCount = 0;
    this._listTotalCount = 0;
    this._isItemsPopulatedBefore = false;
    this._cachedContactsChunk = null;
    this._cachedIconsChunk = null;
    this._listCurrentOffset = 0;
}

phoneApp.prototype._resetCallHistoryVariableValues = function()
{
    log.debug("_resetCallHistoryVariableValues..");
    
    this._cachedCallsList = new Array();
    this._cachedMissedCallsList = new Array();
      
    this._cachedCallsChunk = null; 
    this._cachedMissedCallsChunk = null;  
    this._requestCallsChunkSize = 10; // This is the no. of records GUI requests for a single request from DBAPI 
    
    this._isAllItemsPopulatedBefore = false;  
    this._callListTotalCount = 0; // Total no of items that are available 
    this._callListNeedDataOffsetIndex = 0; // Value from list need data Callback
    this._callListCurrentOffset = 0; // Value from DBAPI response
    this._callListActualDataCount = 0; // No o f items that are actually fetched and populated in the list
    
    this._isMissedItemsPopulatedBefore = false; 
    this._missedCallListTotalCount = 0;
    this._missedCallListNeedDataOffsetIndex = 0;   
    this._callListMissedOffset = 0; // Value from list need data Callback
    this._missedCallListActualDataCount = 0; 
    this._resetCHTimer();
}

phoneApp.prototype._resetTimerValues = function()
{
    log.debug("Inside reset timer values");    
    this._timer1Start = false;
    this._timer2Start = false;
    this._timer1Value = 0;
    this._timer2Value = 0;
    this._heldCallTimerVal = 0;
    
    clearInterval(this._contact1ElapsedTimeTimer);
    this._contact1ElapsedTimeTimer = null;
    this._contact1ElapsedTime = 0;  
    
    clearInterval(this._contact2ElapsedTimeTimer);
    this._contact2ElapsedTimeTimer = null;
    this._contact2ElapsedTime = 0;
    
    this._cachedActiveCallInfo = null; 
    this.contactName = null; 
    this._type = null;   
    this._cachedPhoneNumber = null;    
    this._call1ContactName = null;                 
    this._call1Type = null;              
    this._cachedConferenceCallNumberFirst= null;
    this._call2ContactName = null;                 
    this._call2Type = null;              
    this._cachedConferenceCallNumberSecond= null;  
    this._activeCallCtoPath = "common/images/icons/IcnDialogNoContactImage.png";
    this._call1CtoPath = null;  
    this._call2CtoPath = null;
     /* For fav variable */
    this._cachedFavName1 = null;
    this._cachedFavName2 = null;
    this._cachedFavCallId = "";
    this._cachedFavPhoneNum1 = "";
    this._cachedFavPhoneNum2 = "";
}

phoneApp.prototype._contact1ElapsedTimeHandler = function()
{
    if(this._activeCallId === "call2" && this._ctxtName === "ActiveCall")
    {
        this._contact2ElapsedTime += 1;
        this._timer1Value = this._contact2ElapsedTime;       
    }
    else
    {      
        this._contact1ElapsedTime += 1;
        this._timer1Value = this._contact1ElapsedTime;
    }    
    if((this._cachedActiveCallInfo === "Connecting") && (this._ctxtName === "ActiveCall"))
    {        
        this._timer1Value = 0;
        if(this._activeCallId === "call1")
        {          
            this._contact1ElapsedTime = 0;
        }
        else
        {           
            this._contact2ElapsedTime = 0;           
        }
    }
    if((this._cachedConferenceType === "Connecting") && (this._ctxtName === "ConferenceCall"))
    {      
        if(this._activeCallId === "call2")
        {           
            this._contact1ElapsedTime = 0;
            this._timer1Value = 0;
        }
    }
    
    if(this._currentContextTemplate && (this._currentContext.ctxtId === "ActiveCall" || this._currentContext.ctxtId === "ActiveCall1" || this._currentContext.ctxtId === "ActiveCall2" || this._currentContext.ctxtId === "ActiveCallMerged"))
    {       
        if(this._cachedCmuOrPhone === "Handset")
        {          
            this._currentContextTemplate.inCall2Ctrl.setContact1ElapsedTime(null);
        }
        else
        {           
            this._currentContextTemplate.inCall2Ctrl.setContact1ElapsedTime(this._timer1Value);
        }
    }
}

phoneApp.prototype._contact2ElapsedTimeHandler = function()
{  
    if(this._activeCallId === "call2" && this._ctxtName === "ActiveCall")
    {         
        this._contact1ElapsedTime += 1;
        this._timer2Value = this._contact1ElapsedTime;
    }
    else
    {       
        this._contact2ElapsedTime += 1;
        this._timer2Value = this._contact2ElapsedTime;
    }
    if((this._cachedConferenceType === "Connecting") && (this._ctxtName === "ConferenceCall"))
    {
        if(this._activeCallId === "call1")
        {          
            this._contact2ElapsedTime = 0;
            this._timer2Value = 0;           
        }
    }

    if(this._currentContextTemplate && (this._currentContext.ctxtId === "ActiveCall" || this._currentContext.ctxtId === "ActiveCall1" || this._currentContext.ctxtId === "ActiveCall2" || this._currentContext.ctxtId === "ActiveCallMerged"))
    {
        if(this._cachedCmuOrPhone === "Handset")
        {          
            this._currentContextTemplate.inCall2Ctrl.setContact2ElapsedTime(null);
        }
        else
        {         
            this._currentContextTemplate.inCall2Ctrl.setContact2ElapsedTime(this._timer2Value);
        }       
    }
}

phoneApp.prototype._updateActiveCallTimer = function()
{   
    /*If timer 1 flag is not set, start timer1*/
    if(!this._timer1Start)
    {
        this._timer1Start = true;
        this._contact1ElapsedTime = 0;
        this._contact2ElapsedTime = 0;       
        this._contact1ElapsedTimeTimer = self.setInterval(this._contact1ElapsedTimeHandler.bind(this), 1000);
    }
    
    if(this._timer2Start)
    {
        /*Clear timer2*/
        this._timer2Start = false;
        clearInterval(this._contact2ElapsedTimeTimer);
        this._contact2ElapsedTimeTimer = null;    
        
    }
    if(this._activeCallId === "call2")
    {    
        this._contact1ElapsedTime = 0;
    }
    else
    {       
        this._contact2ElapsedTime = 0;
    }
}

phoneApp.prototype._updateConferenceCallTimer = function()
{  
    /* If timer 1 flag is not set, start timer1*/
    if(!this._timer1Start)
    {
        this._timer1Start = true;
        this._contact1ElapsedTime = 0;
        this._contact2ElapsedTime = 0;      
        this._contact1ElapsedTimeTimer = self.setInterval(this._contact1ElapsedTimeHandler.bind(this), 1000);
    }
    
    if(!this._timer2Start)
    {
        this._timer2Start = true;
        if(this._activeCallId === "call1")
        {    
            this._contact2ElapsedTime = 0;         
        }
        else
        {
            this._contact1ElapsedTime = 0;
        }
        this._contact2ElapsedTimeTimer = self.setInterval(this._contact2ElapsedTimeHandler.bind(this), 1000);
    }
}

//populate DialPad Control
phoneApp.prototype._populateDtmfDialPadCtrl = function()
{
    log.debug("_populateDtmfDialPadCtrl");
    if (this._currentContext && this._currentContextTemplate)
    {       
        this._currentContextTemplate.dialPad2Ctrl.setInputValue(this._cachedDtmfPhoneNumber); 
        this._cachedDtmfPhoneNumber = null;
    }
}

phoneApp.prototype._populateGreyOutListCtrl = function()
{
    log.debug("greyoutlistctrl");
    var dataList = null;
    var listLength = 0;  
        
    if(this._cachedGreyOutContactDb && this._cachedGreyOutCHDb)
    {
        this._addCallCtxtDataList.items[0].disabled = true; 
        this._addCallCtxtDataList.items[1].disabled = true; 
        listLength = this._addCallCtxtDataList.itemCount - 1;
        dataList = this._addCallCtxtDataList; 
      
    }
    else if(this._cachedGreyOutContactDb)
    {  
        this._addCallCtxtDataList.items[1].disabled = true; 
        listLength = this._addCallCtxtDataList.itemCount - 1;
        dataList = this._addCallCtxtDataList; 
    }
    else if(this._cachedGreyOutCHDb)
    {
        this._addCallCtxtDataList.items[0].disabled = true;       
        listLength = this._addCallCtxtDataList.itemCount - 1;
        dataList = this._addCallCtxtDataList;        
       
    }
    else
    {
        this._addCallCtxtDataList.items[0].disabled = false; 
        this._addCallCtxtDataList.items[1].disabled = false; 
        listLength = this._addCallCtxtDataList.itemCount - 1;
        dataList = this._addCallCtxtDataList; 
        
    }
    this._currentContextTemplate.list2Ctrl.setDataList(dataList);
    this._currentContextTemplate.list2Ctrl.updateItems(0, listLength);   
}

phoneApp.prototype._populateGreyOutNumberOrName = function()
{
    if(this._cachedGreyOutContactDb)
    {
        this._currentContextTemplate.dialog3Ctrl.setDisabled("button2", true); 
    }
    else
    {
        this._currentContextTemplate.dialog3Ctrl.setDisabled("button2", false);
    }   
}

phoneApp.prototype._choosePhoneContactIndex = function()
{
        log.debug(".... : if..._contactsIndex");
        //Send Get Contacts Request to DBAPI
        var params = {"deviceId":this._deviceStatusId, "sort":"OrderId","filter":"Calls"};
        framework.sendRequestToDbapi(this.uiaId, this._getContactsIndexCallbackFn.bind(this), "pb", "GetContactsIndex", params);
}

phoneApp.prototype._freeContactObject = function()
{
    var contactObjects = [];
    if(this._freeObjectContactId.length)
    {
        for(var i=0; i< this._freeObjectContactId.length; i++)
        {
            contactObjects.push({ 
                "contactId" : this._freeObjectContactId[i],
                "dbSeqNo" : this._freeObjectDbSeqId[i]
            });
        } 
        var params = {"deviceId":this._deviceStatusId, "ctoType":"ThumbnailImage", "contactObjects" : contactObjects};
        framework.sendRequestToDbapi(this.uiaId, this._freeContactObjectCallbackFn.bind(this), "pb", "FreeContactObjectsByIds", params);    
    }
}

phoneApp.prototype._disableCallWaitingButtons = function()
{
    if(this._cachedCmuOrPhone === "Vehicle")
    {
        this._currentContextTemplate.dialog3Ctrl.setDisabled("button1", false); 
        this._currentContextTemplate.dialog3Ctrl.setDisabled("button2", false); 
        if(framework.localize.getRegion() === framework.localize.REGIONS.Japan)
        {
            this._currentContextTemplate.dialog3Ctrl.setDisabled("button3", true); 
        }
        else
        {
            this._currentContextTemplate.dialog3Ctrl.setDisabled("button3", false); 
        }
    }
    else if(this._cachedCmuOrPhone === "Handset")
    {
        this._currentContextTemplate.dialog3Ctrl.setDisabled("button1", true); 
        this._currentContextTemplate.dialog3Ctrl.setDisabled("button2", true); 
        this._currentContextTemplate.dialog3Ctrl.setDisabled("button3", true);         
    }   
}

phoneApp.prototype._disableIncomingButtons = function()
{
    if(this._cachedCmuOrPhone === "Vehicle")
    {
        this._currentContextTemplate.dialog3Ctrl.setDisabled("button1", false); 
        this._currentContextTemplate.dialog3Ctrl.setDisabled("button2", false); 
    }
    else if(this._cachedCmuOrPhone === "Handset")
    {
        this._currentContextTemplate.dialog3Ctrl.setDisabled("button1", true); 
        this._currentContextTemplate.dialog3Ctrl.setDisabled("button2", true); 
    }   
}

phoneApp.prototype._startCallHistoryTimer = function()
{
    if(this._currentContextTemplate && this._currentContext.ctxtId === "RecentCalls")
    {            
        this._currentContextTemplate.list2Ctrl.setDataList({});
      //  this._currentContextTemplate.list2Ctrl.updateItems(0,- 1); 
        this._currentContextTemplate.list2Ctrl.setLoading(true);        

        if(!this._CallHistoryTimer)
        {
            this._CHCount = 0;
            this._CallHistoryTimer = setInterval(phoneApp.prototype._CHCountUpCallback.bind(this), 10000);
        }
    }
}

phoneApp.prototype._updateCallHistroy = function()
{
    if(this._cachedGreyOutCHDb)
    {
         //Send CloseDB request to DBAPI    
        this._sendCloseCallHistoryDbRequest(this._devId); 
        if(!this._cachedCHAutoStatus)
        {
            if(this._cachedRecentTab == 1)
            {                
                this._populateRecentCallCtxtList();
            }
            else if(this._cachedRecentTab == 2)
            {
                 this._populateMissedRecentCallCtxtList();                
            }            
        }
        else
        {
            this._startCallHistoryTimer();            
        }
    }
    else 
    {
        if (!this._callHistoryDbOpenStatus)
        {            
            log.debug("if.._updateCallHistroy..this._callHistoryDbOpenStatus" + this._callHistoryDbOpenStatus);
            this._sendOpenCallHistoryDbRequest(this._devId);
        }
        else
        {
            log.debug("else..this._callHistoryDbOpenStatus" + this._callHistoryDbOpenStatus);
            if(this._callHistoryDbOpenStatus)
            {
                if(this._cachedRecentTab == 1)
                {                    
                    this._resetCallHistoryVariableValues();
                    var params = {"deviceId":this._devId, "limit":this._requestCallsChunkSize, "offset":(this._callListNeedDataOffsetIndex), "category":"LastAll", "sort":"OrderId"}; 
                    framework.sendRequestToDbapi(this.uiaId, this._getRecentCallsCallbackFn.bind(this), "pb", "GetCallHistory", params);            
                }  
                else if(this._cachedRecentTab == 2)
                {                    
                    this._resetCallHistoryVariableValues();
                    var params = {"deviceId":this._devId, "limit":this._requestCallsChunkSize, "offset":(this._missedCallListNeedDataOffsetIndex), "category":"Missed"}; 
                    framework.sendRequestToDbapi(this.uiaId, this._getMissedCallsCallbackFn.bind(this), "pb", "GetCallHistory", params);            
                }            
            }                  
        }         
    }   
}

phoneApp.prototype._populateActiveCallTitle = function()
{
    log.debug("populateActiveCallTitle");
    var ctrlData = null;
    if(this._cachedCmuOrPhone === "Handset")
    {
        this._blankContactDetailsActiveCall();
    }
    else if(this._cachedCmuOrPhone === "Vehicle")
    {
        if(this._currentContextTemplate)
        {
            if(this._cachedActiveCallInfo === "ActiveCall")
            {                
                ctrlData =
                {
                    "ctrlStyle" : "OneCall",
                    "ctrlTitleId" : "ActiveCall",
                   
                }        
            }
            else 
            {                
                ctrlData =
                {
                    "ctrlStyle" : "OneCall",
                    "ctrlTitleId" : "Connecting",
                   
                }    
            }
            if(ctrlData) 
            {
                if(this._currentContextTemplate)
                {                    
                    this._currentContextTemplate.inCall2Ctrl.setInCallConfig(ctrlData);   
                }
                
            }
        }
    }
}

phoneApp.prototype._populateActiveCallScreenTitle = function()
{
    var ctrlData = null;
    if(this._cachedCmuOrPhone === "Handset")
    {
        ctrlData =
        {                   
            "ctrlTitleId" : "CallOnHandset",                   
        }    
    }
    else if(this._cachedCmuOrPhone === "Vehicle")
    {
        if(this._currentContextTemplate && this._currentContext.ctxtId === "ActiveCall1")
        {
            ctrlData =
            {                   
                "ctrlTitleId" : "Call1Active",                   
            }
        }
        else if(this._currentContextTemplate && this._currentContext.ctxtId === "ActiveCall2")
        {
            ctrlData =
            {                   
                "ctrlTitleId" : "Call2Active",                   
            }
        }
        else if(this._currentContextTemplate && this._currentContext.ctxtId === "ActiveCallMerged")
        {
            ctrlData =
            {                   
                "ctrlTitleId" : "ConferenceCall",                   
            }
        }
          
    }
    if(ctrlData) 
    {
        if(this._currentContextTemplate)
        {                    
            this._currentContextTemplate.inCall2Ctrl.setInCallConfig(ctrlData);   
        }
        
    }
}

phoneApp.prototype._CHCountUpCallback = function()
{
    this._CHCount = this._CHCount+1;
    if (this._CHCount < 6)
    {    
         log.debug(" Loading is dispalyed");
         //counter ended, do something here     
    }
    else
    {
        if(this._currentContextTemplate && this._currentContext.ctxtId === "RecentCalls")
        {            
            log.debug(" Blank dispalyed");
            this._resetCHTimer();
            this._currentContextTemplate.list2Ctrl.setLoading(false);    
        }
        
    }
}

phoneApp.prototype._resetCHTimer = function()
{
    if(this._CallHistoryTimer != null)
    {
        clearInterval(this._CallHistoryTimer);
        this._CallHistoryTimer = null;
		if(this._currentContextTemplate)
		{
			this._currentContextTemplate.list2Ctrl.setLoading(false);
		}        
    }
}

phoneApp.prototype._phoneTypeValue = function(phoneType)
{
    var phoneTypeValue = "";
    log.debug("In _phoneTypeValue");
    log.info("Value of phone type" +phoneType);
    if((phoneType === "Mobile"))
    {
        phoneTypeValue = "MobileType";
    }
    else if((phoneType === "Home") || (phoneType === "Phone") || (phoneType === "Home_Phone"))
    {                      
        phoneTypeValue = "HomeType";
    }
    else if((phoneType === "Work") || (phoneType === "Office_Phone") || (phoneType === "Office_Mobile"))
    {                      
        phoneTypeValue = "WorkType";
    }                
    else 
    {                       
        phoneTypeValue = "OtherType";
    }
    return phoneTypeValue;
}


/**************************
 * Framework register
 **************************/
framework.registerAppLoaded("phone",null,true);
