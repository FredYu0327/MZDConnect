/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: contactsApp.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: milobeyo.com
 Date: 04-July-2012
 __________________________________________________________________________

 Description: IHU GUI Contacts App

 Revisions:
 v0.1 (29-July-2012)
 v0.2 (31-August-2012) Switched to updated controls
 v0.3 (11-September-2012) Updated as per the latest details document - aalangs
 v0.4 (03-October-2012) Implemented dbapi interaction for contacts - aalangs
 v0.5 (17-October-2012) Code Cleanup and List item corrections - avalajh
 v0.6 (22-October-2012) Added call functionality on list item click - avalajh
 v0.7 (18-December-2012) Implementation for scrolling and image - avalajh
 v0.8 (28-December-2012) Implemented String changes - avalajh
 v0.9 (20-March-2012) Implementation Of Contact Index Searching- avalajh
 v0.10 (19-March-2014) Remove Contact item should be grey out when vehcile at speed- avalajh
 v0.10 (26-March-2014) Made changes in data items of Contacts context - avalajh
 v0.11 (10-April-2014) Changes are made for contact details screen for VUI- avalajh
 v0.12 (8-May-2014) Made changes for disabling Add Contact to Favorites in ContactDetails screen - avalajh

 __________________________________________________________________________

 */

log.addSrcFile("contactsApp.js", "contacts");

/**********************************************
 * Start of Base App Implementation
 *
 * Code in this section should not be modified
 * except for function names based on the appname
 *********************************************/

function contactsApp(uiaId)
{
    log.debug("contactsApp called...");
    // Base application functionality is provided in a common location via this call to baseApp.init().
    // See framework/js/BaseApp.js for details.
    baseApp.init(this, uiaId);
    // All feature-specific initialization is done in appInit()
}

contactsApp.prototype.appInit = function()
{
    log.debug(" contactsApp appInit called...");
    if (framework.debugMode)
    {
        utility.loadScript("apps/contacts/test/contactsAppTest.js");
    }
    // cache
    this._importProgressBarStatus=0;
    this._cachedImportedEntries = 0;
    this._cachedTotalEntries = 0;
    this._cachedImportType = 0;
    this._cachedImportStatus = "Done";
    this._cachedImportErrorStatus = null;
    this._cachedVehicleAtSpeed = false;
    this._serviceId = null;
    this._deviceConnStatus = "noDevice";
    this._deviceId = null;
    this._isContactsDbOpen = false;
    this._isItemsPopulatedBefore = false;
    this._cachedContactsChunk = null;
    this._cachedIconsChunk = null;
    this._requestChunkSize = 15; // This is the no. of records GUI requests for a single request from DBAPI
    this._listTotalCount = 0; // Total no of items that are available
    this._listActualDataCount = 0; // No of items that are actually fetched and populated in the list
    this._listCurrentOffset = 0; // Value from DBAPI response
    this._listNeedDataOffsetIndex = 0; // Value from list need data Callback
    this._cachedContactsList = new Array(); // This is the app's copy of the list data displayed
    this._title = "";   
    this.ctoPath = "";
    this._appIdContactDetails = 0;
    this._isImportDone = false;
    this._cancellingImportTimeout = 2;
    this._INITIAL_TIMER_VALUE = 3;
    this._errorReasonRetryImport=null;
    this._errorReasonNoRetryImport=null;
    this._importTypeContacts = 16;
    this._importTypeHistory = 1;
    this._importTypePush = 131072;
    
    this._DbResponse = false;
    this._phoneNumberListCount = 0;
    this._totalListItemCountInDetails = 3;
    this._cachedFocusIn = false;
    this._cachedImportNotification = null;
    this._importInProgress = false;
    this._DownloadClicked = false;
    this._CancelImportClicked = false;
    //For new DBAPI interface for deleting images from tmp folder
    this._freeDbContactId = []; // To Free Contact Object, contact Id Array
    this._freeDbSeqId = []; //  To Free Contact Object, Seq Id Array
    this._disambiguateListPopulated = false;
    
    this._listDisambiguateContactsId = new Array();
    this._listDisambiguateContacts = new Array();
    this._listDisambiguateContactsCtoPath = new Array();    
    
    /* new implementation*/
    this._actualDataCount = 0;
    this._flag = false;   
    this._closeDbConnectionInProgress = false;
    this._openDbConnectionInProgress = false;
    this._openDbCount = 0;
    this._closeDbCount = 0;
    this._reopenDbConnection = false;
    this._vuiContactsFlag = false;// for new param params.fromVui added in sendeventtommui
    this._cachePbConnectionStatus = true;
    // Default config
    //@formatter:off

    // edit contacts context data list
    this._editContactsCtxtDataList =
    {
        itemCountKnown : true,
        itemCount : 2,
        items : [
            { appData : "ImportAll", text1Id : "ImportAllContacts", itemStyle : "style01", image1:'common/images/icons/IcnListAddRecipient_En.png',disabled : false, hasCaret:false },
            { appData : "ImportSingle", text1Id : "SelectedContactImport", itemStyle : "style01",image1:'common/images/icons/IcnListAddRecipient_En.png', disabled : false, hasCaret:false },
                ]
    };
    this._contactDataList = {
            itemCountKnown : true,
            itemCount : 0,
            vuiSupport : true,
            items : []
        };

    //@formatter:off
    this._contextTable = {
        //Contacts context
       "Contacts" : {
            "sbNameId" : "common.Contacts",
            "template" : "List2Tmplt",
            "controlProperties": {
                "List2Ctrl" : {
                    hasLetterIndex : true,
                    dataList : this._contactDataList,
                    numberedList : true,
                    titleConfiguration : 'noTitle',
                    title : {
                        titleStyle : 'style02',
                        text1Id : 'common.Contacts',
                    },
                    requestSize : 6,
                    selectCallback : this._listItemClickCallback.bind(this),                    
                    longPressCallback  : this._longPressCallback.bind(this),
                    needDataCallback : this._contactsNeedDataCallback.bind(this)
                }// end of properties for "ListCtrl"    
            },// end of list of controlProperties
            "leftBtnStyle": "goBack",
            "readyFunction" : this._ContactsCtxtTmpltReadyToDisplay.bind(this)
        },//end of "Contacts
        
        //Contacts TypeDisambiguation
        "TypeDisambiguation" : {
            "template" : "List2Tmplt",
            "sbNameId" : "common.Contacts",
            "controlProperties" : {
                "List2Ctrl" : {
                     titleConfiguration : "listTitle",
                    dataList : this._cachedContactsList,
                    numberedList : true,
                    title : {
                        text1Id : "TypeDisambTitle",
                        titleStyle : "style02"
                    },
                    selectCallback : this._listItemClickCallback.bind(this)                   
                } // end of properties for "ListCtrl"    
            }, // end of list of controlProperties
            "leftBtnStyle": "goBack",
            "readyFunction": this._TypeDisambiguationCtxtTmpltReadyToDisplay.bind(this)
        }, // end of "TypeDisambiguation"        
  
        //Import Confirm Context
        "ImportConfirm" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "common.Contacts",
            "controlProperties" : {
                "Dialog3Ctrl" : {
                    "defaultSelectCallback" : this._dialogCtrlClickCallback.bind(this),
                    "contentStyle" : "style02",
                    "buttonCount" : 1,
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "common.Download",
                            appData : "SelectDownload"
                        }
                    }, // end of buttonConfig
                    "text1Id" : "ImportConfirm",
                    "text2Id" : null,
                    "text3Id" : null,
                    "imagePath1" : null
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "leftBtnStyle": "goBack",
            "readyFunction" : this._DialogTmpltReadyToDisplay.bind(this),
            "contextInFunction" : null,
            "displayedFunction" :null,
        }, // end of "ImportConfirm"
        
        //ContactReadUnsuccess Context
        "ContactReadUnsuccess" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "common.Contacts",
            "controlProperties" : {
                "Dialog3Ctrl" : {
                    "defaultSelectCallback" : this._dialogCtrlClickCallback.bind(this),
                    "contentStyle" : "style02",
                    "buttonCount" : 1,
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "common.Ok",
                            appData : "Global.Yes"
                        }
                    }, // end of buttonConfig
                    "text1Id" : "ContactReadUnsuccess",
                    "text2Id" : null,
                    "text3Id" : null,
                    "imagePath1" : null
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "leftBtnStyle": "goBack",
            "readyFunction" : this._DialogTmpltReadyToDisplay.bind(this),
            "contextInFunction" : null,
            "displayedFunction" :null,
        }, // end of "ContactReadUnsuccess"
        
        //Contacts Details context
        "ContactDetails" : {
            "template" : "List2Tmplt",
            "sbNameId" : "common.Contacts",
            "controlProperties" : {
                "List2Ctrl" : {
                    thickItems : true,
                    titleConfiguration : "listTitle",
                    numberedList : true,
                    title : {
                        text1Id : "common.Contacts",
                        titleStyle : "style05"
                    },
                    selectCallback : this._listItemClickCallback.bind(this),
                    //Added for long press event
                    longPressCallback  : this._longPressCallback.bind(this),
                } // end of properties for "ListCtrl"
            }, // end of list of controlProperties
            "leftBtnStyle": "goBack",
            "readyFunction": this._ContactDetailsCtxtTmpltReadyToDisplay.bind(this),
        }, // end of "Contacts Details"

        //WhichNumber  context
        "WhichNumber" : {
            "template" : "List2Tmplt",
            "sbNameId" : "common.Contacts",
            "controlProperties" : {
                "List2Ctrl" : {
                titleConfiguration : "listTitle",
                numberedList : true,
                    title : {
                        text1Id : "common.Contacts",
                        titleStyle : "style05"
                    },
                    selectCallback : this._listItemClickCallback.bind(this)
                } // end of properties for "ListCtrl"
            }, // end of list of controlProperties
            "leftBtnStyle": "goBack",
            "readyFunction": this._WhichNumberCtxtTmpltReadyToDisplay.bind(this),
        }, // end of "Which Number"
        
        //ContactsDisambiguation context
        "ContactsDisambiguation" : {
            "template" : "List2Tmplt",
            "sbNameId" : "common.Contacts",
            "controlProperties" : {
                "List2Ctrl" : {
                      titleConfiguration : "listTitle",
                      numberedList : true,
                    title : {
                         titleStyle : "style02",
                         text1Id : "SelectContact"
                       
                    },
                    selectCallback : this._listItemClickCallback.bind(this)
                } // end of properties for "ListCtrl"
            }, // end of list of controlProperties
            "leftBtnStyle": "goBack",
            "readyFunction": this._ContactsDisambiguationCtxtTmpltReadyToDisplay.bind(this),
            "contextInFunction" : this._ContactsDisambiguationCtxtTmpltContextIn.bind(this),
        }, // end of "Contacts"

        // EditContacts context
        "EditContacts" : {
            "template" : "List2Tmplt",
            "sbNameId" : "common.Contacts",
            "controlProperties" : {
                "List2Ctrl" : {
                    dataList: this._editContactsCtxtDataList,
                    titleConfiguration : "listTitle",
                    numberedList : true,
                    title : {
                        text1Id : "EditContacts",
                        titleStyle : "style02"
                    },
                    selectCallback : this._listItemClickCallback.bind(this)
                } // end of properties for "ListCtrl"
            }, // end of list of controlProperties
            "leftBtnStyle": "goBack",
            "readyFunction" : this._EditContactsCtxtTmpltReadyToDisplay.bind(this),
            "contextInFunction" : null,
            "displayedFunction" : null
        }, // end of "EditContacts"

        // WaitForPhoneData context
        "WaitForPhoneData" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "common.Contacts",
            "controlProperties" : {
                "Dialog3Ctrl" : {
                    "defaultSelectCallback" : this._dialogCtrlClickCallback.bind(this),
                    "contentStyle" : "style13",
                    "buttonCount" : 1,
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "common.Cancel",
                            appData : "Global.Cancel"
                        }
                    }, // end of buttonConfig
                    "text1Id" : "WaitForPhoneData",
                    "text2Id" : "TimeOut",
                    "text3Id" : null,
                    "imagePath1" : null
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "leftBtnStyle": "goBack",
            "readyFunction" : this._WaitForPhoneDataCtxtTmpltReadyToDisplay.bind(this),
            "contextInFunction" : null,
            "displayedFunction" : this._WaitForPhoneDataCtxtTmpltDisplayed.bind(this),
        }, // end of "WaitForPhoneData"

        // RemoveContactConfirmation context
        "RemoveContactConfirmation" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "common.Contacts",
             "controlProperties" : {
                "Dialog3Ctrl" : {
                    "defaultSelectCallback" : this._dialogCtrlClickCallback.bind(this),
                    "contentStyle" : "style02",
                    "initialFocus" : 1,
                    "buttonCount" : 2,
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "common.Back",
                            appData : "Global.GoBack"
                        },
                        "button2" : {
                            labelId : "common.Remove",
                            appData : "SelectRemove"                            
                        }
                    }, // end of buttonConfig
                    "text1Id" : "SelectRemove",
                    "text2Id" : null,
                    "text3Id" : null,
                    "imagePath1" : null
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "leftBtnStyle": "goBack",
            "readyFunction" : this._RemoveContactConfirmationCtxtTmpltReadyToDisplay.bind(this),
            "displayedFunction" : null
        },// end of "RemoveContactConfirmation"

        // DeleteInProgress context
        "DeleteInProgress" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "common.Contacts",
            "controlProperties" : {
                "Dialog3Ctrl" : {
                    contentStyle : "style14",
                    text1Id : "DeleteInProgress",
                    imagePath1 : "common/images/IndeterminateMeter.png"
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "leftBtnStyle": "goBack",
            "readyFunction" :this._DialogTmpltReadyToDisplay.bind(this),
            "contextInFunction" : null,
            "displayedFunction" : null
        }, // end of "DeleteInProgress"       

        // ImportProgress context
        "ImportProgress" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "common.Contacts",
            "controlProperties" : {
                "Dialog3Ctrl" : {
                    contentStyle : "style14",
                    text1Id : "ImportProgress",
                    imagePath1 : "common/images/IndeterminateMeter.png"
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "leftBtnStyle": "goBack",
            "readyFunction" : this._DialogTmpltReadyToDisplay.bind(this),
            "contextInFunction" : null,
            "displayedFunction" : null
        }, // end of "ImportProgress"
        
        //Import Error Retry
        "ImportErrorRetry" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "common.Contacts",
            "controlProperties" : {
                "Dialog3Ctrl" : {
                    "defaultSelectCallback" : this._dialogCtrlClickCallback.bind(this),
                    "contentStyle" : "style02",
                    "initialFocus" : 1,
                    "titleStyle" : "titleStyle01",
                    "titleId" : null,
                    "buttonCount" : 2,
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "common.Back",
                            appData : "Global.GoBack"
                        },
                        "button2" : {
                            labelId : "common.Retry",
                            appData : "SelectRetry"
                        }
                        
                    }, // end of buttonConfig
                    "text1Id" : null,
                    "text2Id" : null,
                    "text3Id" : null,
                    "imagePath1" : null
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "leftBtnStyle": "goBack",
            "readyFunction" : this._ImportErrorRetryCtxtTmpltReadyToDisplay.bind(this),
            "contextInFunction" :this._ImportErrorRetryCtxtTmpltContextIn.bind(this),
            "displayedFunction" : null
        },
        //End of Import Error Retry
        
        // ImportError No Retry context
        "ImportError" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "common.Contacts",
            "controlProperties" : {
                "Dialog3Ctrl" : {
                    "defaultSelectCallback" : this._dialogCtrlClickCallback.bind(this),
                    "contentStyle" : "style02",
                    "initialFocus" : 1,
                    "titleStyle" : "titleStyle01",
                    "titleId" : null,
                    "buttonCount" : 1,
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "common.Ok",
                            appData : "Global.Yes"
                        }
                    }, // end of buttonConfig
                    "text1Id" : null,
                    "text2Id" : null,
                    "text3Id" : null,
                    "imagePath1" : null
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "leftBtnStyle": "goBack",
            "readyFunction" : this._ImportErrorNoRetryCtxtTmpltReadyToDisplay.bind(this),
            "contextInFunction" : this._ImportErrorNoRetryCtxtTmpltContextIn.bind(this),
            "displayedFunction" : null
        }, // end of "ImportError No retry"    

        // CancellingImport context
        "CancellingImport" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "common.Contacts",
            "controlProperties" : {
                "Dialog3Ctrl" : {
                    contentStyle : "style14",
                    text1Id : "CancellingImport",
                    text1SubMap : {timeout : this._INITIAL_TIMER_VALUE},
                    imagePath1 : "common/images/IndeterminateMeter.png"
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "leftBtnStyle": "goBack",
            "readyFunction" : this._DialogTmpltReadyToDisplay.bind(this),
            "contextInFunction" : null,
            "displayedFunction" : this._CancellingImportCtxtTmpltDisplayed.bind(this)
        }, // end of "CancellingImport"

        // DeleteError context
        "DeleteError" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "common.Contacts",
            "controlProperties" : {
                "Dialog3Ctrl" : {
                    "defaultSelectCallback" : this._dialogCtrlClickCallback.bind(this),
                    "contentStyle" : "style17",
                    "initialFocus" : 1,
                    "buttonCount" : 2,
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "common.Back",
                            appData : "Global.GoBack"
                        },
                        "button2" : {
                            labelId : "common.Retry",
                            appData : "SelectRetry"
                        },
                    }, // end of buttonConfig
                    "text1Id" : "DeleteError",
                    "text2Id" : null,
                    "text3Id" : null,
                    "imagePath1" : null
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "leftBtnStyle": "goBack",
            "readyFunction" : this._DialogTmpltReadyToDisplay.bind(this),
            "contextInFunction" : null,
            "displayedFunction" : null
        }, // end of "DeleteError"

        // DeleteSuccess context
        "DeleteSuccess" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "common.Contacts",
            "controlProperties" : {
                "Dialog3Ctrl" : {
                    "defaultSelectCallback" : this._dialogCtrlClickCallback.bind(this),
                    "contentStyle" : "style02",
                    "initialFocus" : 1,
                    "titleStyle" : "titleStyle01",
                    "titleId" : "DeleteSuccessSingle",
                    "contentStyle" : "style02",
                    "buttonCount" : 1,
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "common.Ok",
                            appData : "Global.Yes"
                        }
                    }, // end of buttonConfig
                    "text1Id" : "ContactRestoredInfo",
                    //"text2Id" : "ContactRestoredInfo",
                    "text3Id" : null,
                    "imagePath1" : null
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "leftBtnStyle": "goBack",
            "readyFunction" : this._DialogTmpltReadyToDisplay.bind(this),
            } // end of "DeleteSuccess"
    };
    // end of this._contextTable
    //@formatter:on

    //@formatter:off
    this._messageTable = {
        "PhoneConnectionStatus" : this._PhoneConnectionStatusMsgHandler.bind(this),
        "ImportedContactsStatus" : this._ImportedContactsStatusMsgHandler.bind(this),
        "SendContactId" : this._SendContactIdMsgHandler.bind(this),
        "FocusStatus" : this._FocusStatusMsgHandler.bind(this),
        "NotifyImportStatus" : this._NotifyImportStatusMsgHandler.bind(this),
        "SendPhoneTypeCalled" : this._SendPhoneTypeMsgHandler.bind(this), //Added for Type Disambiguation
        "SendFocusFavorites" : this._SendFocusFavoritesMsgHandler.bind(this),
        "Global.AtSpeed" :this._VehicleAtSpeedMsgHandler.bind(this), 
        "Global.NoSpeed" :this._VehicleNoSpeedMsgHandler.bind(this), 
        "ImportedCallHistoryStatus" : this._ImportedCallHistroyStatusMsgHandler.bind(this),
        "PBConnectStatus" : this._PbConnectStatusMsgHandler.bind(this),
    };
    // end of this._messageTable
    //@formatter:on
};

/**************************
 * Contacts App Functions *
 **************************/

// Timer function
/*contactsApp.prototype._sendTimeoutToMmui = function()
{
    framework.sendEventToMmui(this.uiaId, "Timeout");
};*/
/**************************
 * Context handlers
 **************************/

contactsApp.prototype._DialogTmpltReadyToDisplay = function()
{
   this._contactsFocus(true);
   this._cachedVehicleAtSpeed = framework.common.getAtSpeedValue();
    if(this._currentContext.ctxtId === "DeleteError")
    {
        if(this._cachedVehicleAtSpeed)
        {
            this._VehicleAtSpeedMsgHandler();
        }
        else
        {
            this._VehicleNoSpeedMsgHandler();
        }
    }
};

contactsApp.prototype._ContactsCtxtTmpltReadyToDisplay = function()
{
    this._contactsFocus(true);
    
    var currentList = this._currentContextTemplate.list2Ctrl;
    currentList.dataList.itemCountKnown = true;
    currentList.dataList.itemCount = 0;
    currentList.setDataList({});
    if (this._currentContextTemplate)
    {
        if (this._deviceConnStatus === "CONNECTED")
        { 
            if(this._importInProgress)
            {
                framework.common.showStateSbn(this.uiaId, "ImportedContactsStatus", "deviceConnected", {sbnStyle : "Style06",text1Id:"ConatctImport", text1 : null, meter : {meterType:"determinate", min:0, max:1, currentValue:this._importProgressBarStatus}}); // add/update a state SBN in the display queue
            } 
            var config = {
                    loadingTextId : "EditContacts"                    
            }
            currentList.setLoadingConfig(config);    
            if(this._isContactsDbOpen) // contacts were automatically or manually downloaded. List is not fetched from DB yet
            {
                this._resetVariableValues(); 
                log.info("In _ContactsCtxtTmpltReadyToDisplay calling _contactsIndex ");
                this._contactsIndex();                
                this._cachedVehicleAtSpeed = framework.common.getAtSpeedValue();
                //Send Get Contacts Request to DBAPI
                var params = {"deviceId":this._getDeviceId(), "limit":this._requestChunkSize, "offset":(this._listNeedDataOffsetIndex),"ctoType":"ThumbnailImage","sort":"OrderId","filter":"All"};
                framework.sendRequestToDbapi(this.uiaId, this._getContactsCallbackFn.bind(this), "pb", "GetContacts", params);  
            }
            else
            {
                this._resetVariableValues(); 
                this._cachedVehicleAtSpeed = framework.common.getAtSpeedValue();            
                this._openDbConnection();
            }
        }
        else
        { 
            log.info("inside ready to.. else");
            this._resetVariableValues();
            this._cachedVehicleAtSpeed = framework.common.getAtSpeedValue();             
            this._populateContactsCtxtList();
        }       
    }   
};


// ContactDetails Context
contactsApp.prototype._ContactDetailsCtxtTmpltReadyToDisplay = function()
{
    log.info("ContactDetailsCtxtTmpltReadyToDisplay ");
    this._contactsFocus(true);
    this._cachedVehicleAtSpeed = framework.common.getAtSpeedValue();
    if (this._currentContextTemplate)
    {

        if(framework.localize.getRegion() === framework.localize.REGIONS.Japan)
        {
             log.debug("In japan region ....")
             var params = {"deviceId":this._getDeviceId(), "contactId":this._cachedContactId, "ctoType":"ThumbnailImage", "region" : "Japan"};
        }
        else
        {
            log.debug("In Other region ....")
            var params = {"deviceId":this._getDeviceId(), "contactId":this._cachedContactId, "ctoType":"ThumbnailImage", "region" : "Other"};
        }
        //var params = {"deviceId" : this._getDeviceId(), "contactId" : this._cachedContactId};
        if(this._isContactsDbOpen)
        {
            log.info("ContactDetailsCtxtTmpltReadyToDisplay ..if");

            framework.sendRequestToDbapi(this.uiaId, this._getContactDetailsCallbackFn.bind(this), "pb", "GetContactDetails", params);
        }
        else
        {
            log.info("ContactDetailsCtxtTmpltReadyToDisplay ..else");

            log.debug("Inside SendContactIdMsgHandler else ");
            this._openDbConnection();          
        }
    }
};

// Type Disambiguation Context
contactsApp.prototype._TypeDisambiguationCtxtTmpltReadyToDisplay = function()
{
    this._contactsFocus(true);
    if (this._currentContextTemplate)
    {
        this._populateTypeDisambiguation();
    }
};

// WhichNumber Context
contactsApp.prototype._WhichNumberCtxtTmpltReadyToDisplay = function()
{
    this._contactsFocus(true);
    if (this._currentContextTemplate)
    {
        this._populateWhichNumberList();
    }
};

// ContactDetails Context
contactsApp.prototype._ContactsDisambiguationCtxtTmpltReadyToDisplay = function()
{
    this._contactsFocus(true);
    log.info("Inside _ContactsDisambiguationCtxtTmpltReadyToDisplay");
    if (this._currentContextTemplate)
    {
        if (this._deviceConnStatus === "CONNECTED")
        {
            if(this._disambiguateListPopulated == true)
            {
            log.info("_ContactsDisambiguationCtxtTmpltReadyToDisplay no need to fetch the contacts list again");
            }
            else
            {
            log.info("_ContactsDisambiguationCtxtTmpltReadyToDisplay Need to fetch the contacts list");
            log.info(" Inside _ContactsDisambiguationCtxtTmpltReadyToDisplay,Device is connected");
            if(this._isContactsDbOpen) // contacts were automatically or manually downloaded. List is not fetched from DB yet
            {        
                log.info("Inside _ContactsDisambiguationCtxtTmpltReadyToDisplay, Contact DB is open. Get contact details");
                // Contact DB is already Open
                // Send multiple request to DB to get contact details
                for(var i=0; i<this._listDisambiguateContactsId.length; i++)
                {
                    var params = {"deviceId" : this._getDeviceId(), "contactId" : this._listDisambiguateContactsId[i]};
                    framework.sendRequestToDbapi(this.uiaId, this._getContactDetailsForDisambiguityCallbackFn.bind(this), "pb", "GetContactDetails", params);
                }
            }
            else
            {
                // Contact DB is not open. This can happen if 
                // we come to this context due to top level event
                log.info("Inside _ContactsDisambiguationCtxtTmpltReadyToDisplay, Open Contact DB.");
                // open contact DB
                this._openDbConnection();
            }
            }
        }
        //this._populateContactsDisambiguation();
    }
};

// EditContacts Context
contactsApp.prototype._EditContactsCtxtTmpltReadyToDisplay = function()
{
    this._contactsFocus(true);
    //Send CloseDB request to DBAPI
    if (this._isContactsDbOpen)
    {
        log.info(" Inside _EditContactsCtxtTmpltReadyToDisplay, DB access is no more required. close the DB");
        this._resetVariableValues();        
        this._closeDbConnection();
    }
    if (this._currentContextTemplate)
    {
        this._cachedVehicleAtSpeed = framework.common.getAtSpeedValue();        
        this._populateEditContactsList();
    }
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EditContacts")
    {
        framework.common.endStateSbn(this.uiaId, "ImportedContactsStatus", "deviceConnected");
    }
};

// WaitForPhoneData Context
contactsApp.prototype._WaitForPhoneDataCtxtTmpltReadyToDisplay = function()
{

    this._contactsFocus(true);    
    log.info("_WaitForPhoneDataCtxtTmpltReadyToDisplay called...");
    if (this._currentContextTemplate)
    {
        this._waitForPhoneDataTimeout = 180;
        
        var text2Id = this._contextTable.WaitForPhoneData.controlProperties.Dialog3Ctrl.text2Id;
        var subMap = {"timeout" : this._waitForPhoneDataTimeout};
        this._currentContextTemplate.dialog3Ctrl.setText2Id(text2Id,subMap);
        
        if (this._waitForPhoneDataTimer!== null)
        {
            clearInterval(this._waitForPhoneDataTimer);
            this._waitForPhoneDataTimer = null;
        }
        this._waitForPhoneDataTimer = setInterval(contactsApp.prototype._WaitForPhoneDataCountDownCallback.bind(this), 1000);
    }
};

contactsApp.prototype._RemoveContactConfirmationCtxtTmpltReadyToDisplay = function()
{
    this._contactsFocus(true);
    this._cachedVehicleAtSpeed = framework.common.getAtSpeedValue();
    log.info("_RemoveContactConfirmationCtxtTmpltReadyToDisplay called...");
    // We are entering into context which will require DB Access
    if (this._isContactsDbOpen)
    {
        this._resetVariableValues();      
        this._closeDbConnection();
    }
    if(this._cachedVehicleAtSpeed)
    {
        this._VehicleAtSpeedMsgHandler();
    }
    else
    {
        this._VehicleNoSpeedMsgHandler();
    }
};

//function for Import Error Retry
contactsApp.prototype._ImportErrorRetryCtxtTmpltContextIn = function(msg)
{
    log.info("_ImportErrorRetryCtxtTmpltContextIn called...");
     // This context comes along with data
    
    if(msg && msg.params && msg.params.payload && msg.params.payload.errorReasonRetry)
    {      
        this._errorReasonRetryImport = msg.params.payload.errorReasonRetry;        
    }    
};

//function for Import Error No Retry
contactsApp.prototype._ImportErrorNoRetryCtxtTmpltContextIn = function(msg)
{
    log.info("In _ImportErrorNoRetryCtxtTmpltContextIn called ...")
    
    // This context comes along with data
    if(msg && msg.params && msg.params.payload && msg.params.payload.errorReasonNoRetry )
    {      
        this._errorReasonNoRetryImport = msg.params.payload.errorReasonNoRetry;
    }
};

// Function for ContactsDisambiguation
contactsApp.prototype._ContactsDisambiguationCtxtTmpltContextIn = function(msg)
{
    // This context comes along with data
    if(msg && msg.params && msg.params.payload && msg.params.payload.contactIdList && msg.params.payload.contactIdList.contactIdList)
    {
        this._listDisambiguateContactsId = new Array();
        this._listDisambiguateContacts = new Array();
        this._listDisambiguateContactsCtoPath = new Array(); 
        this._disambiguateListPopulated = false;
        for(var i=0; i < msg.params.payload.contactIdList.contactIdList.length ; i++)
        {
            if(msg.params.payload.contactIdList.contactIdList[i] !== 0)
            this._listDisambiguateContactsId[i] = msg.params.payload.contactIdList.contactIdList[i];
        }
    }
    else
    {
        log.info("_ContactsDisambiguationCtxtTmpltContextIn called, Contact Id list is not available");
    }
};

contactsApp.prototype._ImportErrorRetryCtxtTmpltReadyToDisplay = function()
{
    this._cachedVehicleAtSpeed = framework.common.getAtSpeedValue();
    if (this._isContactsDbOpen)
    {
       this._resetVariableValues();
       this._closeDbConnection();
    }
    if (this._currentContextTemplate)
    {
        if (this._errorReasonRetryImport)
        {
            this._populateImportErrorRetryMsg();
        }
    }
    if(this._cachedVehicleAtSpeed)
    {
        this._VehicleAtSpeedMsgHandler();
    }
    else
    {
        this._VehicleNoSpeedMsgHandler();
    }
};

//Import Error No Retry Function
contactsApp.prototype._ImportErrorNoRetryCtxtTmpltReadyToDisplay = function()
{
    if (this._isContactsDbOpen)
    {
       this._resetVariableValues();
       this._closeDbConnection();
    }
    if (this._currentContextTemplate)
    {
        if (this._errorReasonNoRetryImport)
        {
            this._populateImportErrorNoRetryMsg();
        }
    }
};

//Wait For Phone Data Function
contactsApp.prototype._WaitForPhoneDataCtxtTmpltDisplayed = function()
{
    if (this._currentContextTemplate)
    {
        log.info("btpairingApp _WaitForPhoneDataCtxtTmpltDisplayed called...");
        var text2Id = this._contextTable.WaitForPhoneData.controlProperties.Dialog3Ctrl.text2Id;
        var subMap = {"timeout" : this._waitForPhoneDataTimeout};
        this._currentContextTemplate.dialog3Ctrl.setText2Id(text2Id,subMap);
    }
};

// CancellingImport Context
contactsApp.prototype._CancellingImportCtxtTmpltDisplayed = function()
{
    if (this._currentContextTemplate)
    {
        if (this._cancellingImportTimer !== null)
        {
            clearInterval(this._cancellingImportTimer);
            this._cancellingImportTimer = null;
        }
        this._cancellingImportTimer = setInterval(contactsApp.prototype._cancellingImportCountDownCallback.bind(this), 1000);
    }
};
/**************************
 * Message handlers
 **************************/

// PhoneConnectionStatus message handler
contactsApp.prototype._PhoneConnectionStatusMsgHandler = function(msg)
{ 
    if (msg && msg.params && msg.params.payload && msg.params.payload.phoneStatus.phoneConnStatus)
    {
        this._deviceConnStatus = msg.params.payload.phoneStatus.phoneConnStatus;
    }
    /*if(msg && msg.params && msg.params.payload && msg.params.payload.phoneStatus.serviceId)
    {
        this._serviceId = msg.params.payload.phoneStatus.serviceId;
    }*/
    if (this._deviceConnStatus === "CONNECTED")
    {
        if(msg && msg.params && msg.params.payload && msg.params.payload.phoneStatus.deviceId)
        {
            this._deviceId = msg.params.payload.phoneStatus.deviceId;
        }      
    }
    else if ( this._deviceConnStatus === "DISCONNECTED")
    {
        log.info(" Device Disconnected.....device id: " + this._deviceId);

        this._closeDbConnection();

        this._resetVariableValues();
        // empty the list
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "Contacts")
        {
            this._populateContactsCtxtList();
        }        
      
        framework.common.endStateSbn(this.uiaId, "ImportedContactsStatus", "deviceConnected");
    }
   /* if(this._serviceId === "HANDSFREE")
    {
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EditContacts")
        {
            this._populateEditContactsList();
        }
    }*/
};

//_VehicleAtSpeedMsgHandler
contactsApp.prototype._VehicleAtSpeedMsgHandler = function(msg)
{
    log.info("_VehicleAtSpeedMsgHandler called...");
    this._cachedVehicleAtSpeed = true;
    if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "EditContacts")
            {
                log.debug("Populating edit contacts list from _VehicleAtSpeedMsgHandler");
                this._populateEditContactsList();
            }
            if (this._currentContext.ctxtId === "Contacts")
            {
                log.debug("Updating Contact list from _VehicleAtSpeedMsgHandler ");
                this._populateContactsCtxtList();
            }
            if(this._currentContext.ctxtId === "ContactDetails")
            {
                log.debug("Updating Contact list from  ImportErrorRetry ");
                this._ContactsDetailsgreyOut();
            }
            if (this._currentContext.ctxtId === "RemoveContactConfirmation")
            {
                log.debug("Updating Contact list from  RemoveContactConfirmation ");
                this._populateGreyOutbutton();
            }
            if(this._currentContext.ctxtId === "ImportErrorRetry")
            {
                log.debug("Updating Contact list from  ImportErrorRetry ");
                this._populateGreyOutbutton();
            }
            if(this._currentContext.ctxtId === "DeleteError")
            {
                log.debug("Updating Contact list from  ImportErrorRetry ");
                this._populateGreyOutbutton();
            }
        }
    }

//_VehicleNoSpeedMsgHandler
contactsApp.prototype._VehicleNoSpeedMsgHandler = function(msg)
{   
    log.info("_VehicleNoSpeedMsgHandler called...");
    this._cachedVehicleAtSpeed = false;
    if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "EditContacts")
            {
                log.debug("Populating edit contacts list from _VehicleNoSpeedMsgHandler");
                this._populateEditContactsList();
            }
            if (this._currentContext.ctxtId === "Contacts")
            {
                log.debug("Updating Contact list from _VehicleNoSpeedMsgHandler");
                this._populateContactsCtxtList();
            }
            if(this._currentContext.ctxtId === "ContactDetails")
            {
                log.debug("Updating Contact list from  ImportErrorRetry ");
                this._ContactsDetailsgreyOut();
            }
            if (this._currentContext.ctxtId === "RemoveContactConfirmation")
            {
                log.debug("Updating Contact list from  RemoveContactConfirmation ");
                this._populateGreyOutbutton();
            }
            if(this._currentContext.ctxtId === "ImportErrorRetry")
            {
                log.debug("Updating Contact list from  ImportErrorRetry ");
                this._populateGreyOutbutton();
            }
            if(this._currentContext.ctxtId === "DeleteError")
            {
                log.debug("Updating Contact list from  ImportErrorRetry ");
                this._populateGreyOutbutton();
            }
        }
    }

contactsApp.prototype._SendContactIdMsgHandler = function(msg)
{   
    log.info("In SendContactId Message Handler....");
    this._title = "";
    this.ctoPath = "";
    this.homeNumber = [];
    this.mobileNumber = [];
    this.workNumber = [];
    this.otherNumber = [];
    this.companyName = [];
    this.address = null;
    
    if (msg && msg.params && msg.params.payload && msg.params.payload.contactId)
    {
        this._cachedContactId = msg.params.payload.contactId;
        if(framework.localize.getRegion() === framework.localize.REGIONS.Japan)
        {
             log.debug("In japan region ....")
             var params = {"deviceId":this._getDeviceId(), "contactId":this._cachedContactId, "ctoType":"ThumbnailImage", "region" : "Japan"};
        }
        else
        {
            log.debug("In Other region ....")
            var params = {"deviceId":this._getDeviceId(), "contactId":this._cachedContactId, "ctoType":"ThumbnailImage", "region" : "Other"};
        }
        //var params = {"deviceId" : this._getDeviceId(), "contactId" : this._cachedContactId};
        if(this._isContactsDbOpen)
        {
            framework.sendRequestToDbapi(this.uiaId, this._getContactDetailsCallbackFn.bind(this), "pb", "GetContactDetails", params);
        }
        else
        {
            log.debug("Inside SendContactIdMsgHandler else ");
            this._openDbConnection();          
        }
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "ContactDetails")
            {
                log.debug("Populating ContactDetails list from  _SendContactIdMsgHandler");
                this._populateContactDetails();
            }
            else if(this._currentContext.ctxtId === "WhichNumber")
            {
                log.debug("Populating WhichNumber list from  _SendContactIdMsgHandler");
                this._populateWhichNumberList();
            }
        }
    }
}

//PBConnectStatusMsHandler Added for Scr SW00128124.
contactsApp.prototype._PbConnectStatusMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload)
    {
        this._cachePbConnectionStatus = msg.params.payload.status;
        if(!this._cachePbConnectionStatus)
        {
            //this._DownloadClicked = false;
            this._cachedImportStatus = "Done";
        }
        if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId == "EditContacts")
        {
            this._populateEditContactsList();
        }
    }
}

//ImportedCallHistroyStatus
contactsApp.prototype._ImportedCallHistroyStatusMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.importedCallHistoryDetails)
    {
        if(msg.params.payload.importedCallHistoryDetails.importType)
        {
            this._cachedImportType = msg.params.payload.importedCallHistoryDetails.importType;
        }
        
    }
    
}

// ImportedContactsStatus
contactsApp.prototype._ImportedContactsStatusMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.importedContactsDetails)
    {
        if ( this._deviceConnStatus === "DISCONNECTED")
       {
            framework.common.endStateSbn(this.uiaId, "ImportedContactsStatus", "deviceConnected");
       }
        var importedContactsDetails = msg.params.payload.importedContactsDetails;
        this._cachedImportedEntries=0;
        this._cachedTotalEntries=0;
        if (importedContactsDetails.importedEntries)
        {
            this._cachedImportedEntries = importedContactsDetails.importedEntries;
        }
        if (importedContactsDetails.totalEntries)
        {
            this._cachedTotalEntries = importedContactsDetails.totalEntries;
        }
         if (importedContactsDetails.importType)
        {
            this._cachedImportType = importedContactsDetails.importType;
        }
        if (importedContactsDetails.importStatus)
        {
            log.debug("Contacts import status "+importedContactsDetails.importStatus);
            {
                this._cachedImportStatus = importedContactsDetails.importStatus;
            }
        }
        if (importedContactsDetails.importErrorStatus)
        {
            this._cachedImportErrorStatus = importedContactsDetails.importErrorStatus;
        }        
        
        switch(this._cachedImportStatus)
        {            
            case "Done" :  
                this._importInProgress = false;
                this._importProgressBarStatus=1;
                clearInterval(this._waitForPhoneDataTimer);
                log.info("Contact Import is complete");
                this._isImportDone = true;
                if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EditContacts")
                {
                    this._populateEditContactsList();
                }
                if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "Contacts")
                {   
                     log.debug("In _ImportedContactsStatusMsgHandler");
                    if (this._isContactsDbOpen)
                    {
                       this._reopenDbConnection = true;
                       this._closeDbConnection();
                    }
                     else
                    {
                        log.debug("_ImportedContactsStatusMsgHandler sending request for OpenDb");
                        this._openDbConnection();
                    }
                }
                framework.common.endStateSbn(this.uiaId, "ImportedContactsStatus", "deviceConnected");
                break;
            case"Importing":
                this._importInProgress = true;
                this._importProgressBarStatus=0.05;
                if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EditContacts")
                {
                    this._populateEditContactsList();
                }
                else
                {
                framework.common.showStateSbn(this.uiaId, "ImportedContactsStatus", "deviceConnected", {sbnStyle : "Style06",text1Id:"ConatctImport", text1 : null, meter : {meterType:"determinate", min:0, max:1, currentValue:this._importProgressBarStatus}}); // add/update a state SBN in the display queue
                }
                break;
            case "ExtractionStarted":
                this._importInProgress = true;
                this._importProgressBarStatus=0.15;
                if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EditContacts")
                {
                    this._populateEditContactsList();
                }
                else
                {
                    framework.common.showStateSbn(this.uiaId, "ImportedContactsStatus", "deviceConnected", {sbnStyle : "Style06",text1Id:"ConatctImport", text1 : null, meter : {meterType:"determinate", min:0, max:1, currentValue:this._importProgressBarStatus}}); // add/update a state SBN in the display queue
                }
                break;
            case "Parsing":
                this._importInProgress = true;
                this._importProgressBarStatus=0.30;
                if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EditContacts")
                {
                    this._populateEditContactsList();
                }
                else
                {
                framework.common.showStateSbn(this.uiaId, "ImportedContactsStatus", "deviceConnected", {sbnStyle : "Style06",text1Id:"ConatctImport", text1 : null, meter : {meterType:"determinate", min:0, max:1, currentValue:this._importProgressBarStatus}}); // add/update a state SBN in the display queue        
                }
                break;
            case "Sorting":
                this._importInProgress = true;
                this._importProgressBarStatus=0.45;
                if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EditContacts")
                {
                    this._populateEditContactsList();
                }
                else
                {
                    framework.common.showStateSbn(this.uiaId, "ImportedContactsStatus", "deviceConnected", {sbnStyle : "Style06",text1Id:"ConatctImport", text1 : null, meter : {meterType:"determinate", min:0, max:1, currentValue:this._importProgressBarStatus}}); // add/update a state SBN in the display queue
                }
                break; 
            case "Photos":
                this._importInProgress = true;
                this._importProgressBarStatus=0.60;
                if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EditContacts")
                {
                    this._populateEditContactsList();
                }
                else
                {
                    framework.common.showStateSbn(this.uiaId, "ImportedContactsStatus", "deviceConnected", {sbnStyle : "Style06",text1Id:"ConatctImport", text1 : null, meter : {meterType:"determinate", min:0, max:1, currentValue:this._importProgressBarStatus}}); // add/update a state SBN in the display queue
                }
                break; 
            case "ExtractionDone":
                this._importInProgress = true;
                this._importProgressBarStatus=0.75;
                if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EditContacts")
                {
                    this._populateEditContactsList();
                }
                else
                {
                framework.common.showStateSbn(this.uiaId, "ImportedContactsStatus", "deviceConnected", {sbnStyle : "Style06",text1Id:"ConatctImport", text1 : null, meter : {meterType:"determinate", min:0, max:1, currentValue:this._importProgressBarStatus}}); // add/update a state SBN in the display queue
                }
                break;                
            case "DB_UpdatePending":
                this._importInProgress = true;
                this._importProgressBarStatus=0.90;
                if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EditContacts")
                {
                    this._populateEditContactsList();                   
                }
                else
                {
                    framework.common.showStateSbn(this.uiaId, "ImportedContactsStatus", "deviceConnected", {sbnStyle : "Style06",text1Id:"ConatctImport", text1 : null, meter : {meterType:"determinate", min:0, max:1, currentValue:this._importProgressBarStatus}}); // add/update a state SBN in the display queue
                }
                break;      
            case "OPP_FileProcessed":
                this._importInProgress = true;
                this._importProgressBarStatus=0.75;
                log.info("#Contact:OPP_FileProcessed this._cachedImportErrorStatus::"+this._cachedImportErrorStatus);
                if (this._currentContext)
                {
                    framework.common.showStateSbn(this.uiaId, "ImportedContactsStatus", "deviceConnected", {sbnStyle : "Style06",text1Id:"ConatctImport", text1 : null, meter : {meterType:"determinate", min:0, max:1, currentValue:this._importProgressBarStatus}}); // add/update a state SBN in the display queue
                }
                if(this._cachedImportErrorStatus === "ImportLimitReached"){
                  log.info("#Contact:Error::ImportLimitReached Ending the Sbn");
                  framework.common.endStateSbn(this.uiaId, "ImportedContactsStatus", "errorNotification");
                }
                break;  
            case "Failed":
            case "Canceling":
            case "Disconnecting":
            case "OPP_Timeout":
                this._importInProgress = false;
                this._isImportDone = false;  
                clearInterval(this._waitForPhoneDataTimer);
                if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EditContacts")
                {
                    this._populateEditContactsList();
                }
                framework.common.endStateSbn(this.uiaId, "ImportedContactsStatus", "deviceConnected");
                break;                
            case "FlashUpdating":
                this._importInProgress = true;
                this._importProgressBarStatus=0.95;
                if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EditContacts")
                {
                    this._populateEditContactsList(); 
                }
                else
                {
                framework.common.showStateSbn(this.uiaId, "ImportedContactsStatus", "deviceConnected", {sbnStyle : "Style06",text1Id:"ConatctImport", text1 : null, meter : {meterType:"determinate", min:0, max:1, currentValue:this._importProgressBarStatus}}); // add/update a state SBN in the display queue
                }
                break; 
            default :
                log.info("Unknown Import Status");
                break;
        }    
      }
    };
    
    //Focus Status Message Handler
contactsApp.prototype._FocusStatusMsgHandler = function(msg)
{
    log.info("In FocusStatusMsgHandler:");
    if (msg && msg.params && msg.params.payload)
    {
        this._cachedFocusIn = msg.params.payload.FocusIn;       
        var focus = this._cachedFocusIn;
        this._contactsFocus(focus);       
    }
}
//Added for obtaining focus in Contacts application
contactsApp.prototype._contactsFocus = function(isFocus)
{
    if (isFocus==true)
    {
        log.debug("in _contactsFocus: value of isFocus: " +isFocus);
        this._cachedFocusIn=true;
    }
    log.debug("in _contactsFocus: value of this._cachedFocusIn" +this._cachedFocusIn);
    
    if(this._cachedFocusIn)
    {
        log.info("Entered in Contacts UIA");
    }
    else
    {
        log.info("Exiting Contacts UIA");
        this._closeDbConnection();
        this._resetVariableValues();
        clearInterval(this._waitForPhoneDataTimer);
        if(this._importInProgress)
        {
            framework.common.showStateSbn(this.uiaId, "ImportedContactsStatus", "deviceConnected", {sbnStyle : "Style06",text1Id:"ConatctImport", text1 : null, meter : {meterType:"determinate", min:0, max:1, currentValue:this._importProgressBarStatus}}); // add/update a state SBN in the display queue
        }           
    }
};

//Added for closing DB in case of focus lost/disconnection when freeing images
contactsApp.prototype._closeContactsAppDb = function()
{
    if (this._isContactsDbOpen)
    {
        var params = {"deviceId":this._getDeviceId()};
        framework.sendRequestToDbapi(this.uiaId, this._closeContactsDbCallbackFn.bind(this), "pb", "CloseContactsDb", params); 
        log.debug("In _closeContactsAppDb value of this._closeDbCount: "+this._closeDbCount);
    }
    else
    {
        log.debug(" in _closeContactsAppDb....ContactDb is already closed::");
        this._closeDbConnectionInProgress = false;
        this._reopenDbConnection = false;
    }
};


//Added for opening DB 
contactsApp.prototype._openDbConnection = function()
{
    log.debug("inside _openDbConnection ");
    if ((this._openDbConnectionInProgress==true)||(this._closeDbConnectionInProgress==true)||(this._isContactsDbOpen==true))
    {
        log.info("inside _openDbConnection returning");
        this._reopenDbConnection = false;
        return;
    }
    
    this._openDbConnectionInProgress = true;
    var params = {"deviceId":this._getDeviceId()};
    framework.sendRequestToDbapi(this.uiaId, this._openContactsDbCallbackFn.bind(this), "pb", "OpenContactsDb", params);
};


//Added for images to be deleted from tmp folder
contactsApp.prototype._closeDbConnection = function()
{
    if ( this._closeDbConnectionInProgress == true || this._isContactsDbOpen == false)
    {
        log.debug("inside _closeDbConnection,closeDbConnection is in progress or DB is already closed");
        // DB close operation is in progress or DB is already closed. do not act.
      //  this._reopenDbConnection = false;
        return;
    }
    this._closeDbConnectionInProgress = true;
    var contactObjects = [];
    // the array is defined and has at least one element    
    if ( this._freeDbContactId.length>0)
    {   
        for(var i=0; i< this._freeDbContactId.length; i++)
        {
            log.debug("contactObjects is not null");
            contactObjects.push({"contactId" : this._freeDbContactId[i], "dbSeqNo" : this._freeDbSeqId[i]});
        }
        var params = {"deviceId" : this._getDeviceId(),"ctoType":"ThumbnailImage", "contactObjects" :contactObjects};
        framework.sendRequestToDbapi(this.uiaId, this._freeContactObjectCallbackFn.bind(this), "pb", "FreeContactObjectsByIds", params);    
    }
    else
    {
        log.debug("No ContactId with images are present to be deleted");   
        this._closeContactsAppDb();
    }
}

//call back function for freecontact object
contactsApp.prototype._freeContactObjectCallbackFn = function(msg)
{
    if (this._isContactsDbOpen)
    {
        log.info("_freeContactObjectCallbackFn called...");
        var params = {"deviceId": this._getDeviceId()};
        log.info("in_freeContactObjectCallbackFn.....calling Contacts DB close function");
        this._closeContactsAppDb();
    }
    else
    {
        log.info("In _freeContactObjectCallbackFn, contacts DB is closed.... ");
        this._closeDbConnectionInProgress = false;
        this._reopenDbConnection = false;
    }
    this._freeDbContactId = [];
    this._freeDbSeqId = [];
    if (msg.msgContent.params.eCode == 0)
    {
        log.debug(" In _freeContactObjectCallbackFn freeobjects success "+this._freeDbContactId);
        log.debug("In _freeContactObjectCallbackFn ,deviceId  "+this._getDeviceId());
    }    
    else
    {
        log.debug(" In _freeContactObjectCallbackFn freeobjects failure");
        
    }
}

//collecting msg from MMUI for further reference
contactsApp.prototype._NotifyImportStatusMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.ImportNotification)
    {
        this._cachedImportNotification = msg.params.payload.ImportNotification;
        if(this._cachedImportType != this._importTypeHistory)
        {
            if(this._cachedImportNotification=="Success")
            {
                framework.common.startTimedSbn(this.uiaId, "ImportedContactsStatus", "deviceConnected", {sbnStyle : "Style02", text1Id : "ImportSuccessSbn", "imagePath1" : ""}); // add/update a state SBN in the); // end state SBN in the display queue 
            }
            else
            {
                framework.common.startTimedSbn(this.uiaId, "ImportedContactsStatus", "deviceConnected", {sbnStyle : "Style02", text1Id : "ImportFailureSbn", "imagePath1" : ""}); // add/update a state SBN in the); // end state SBN in the display queue
            }
        }
    }
}

//Send Phone Type Message Handler
contactsApp.prototype._SendPhoneTypeMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload)
    {
        this._cachedphoneType = msg.params.payload.phoneType;
        log.info("this._cachedphoneType "+this._cachedphoneType);
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "TypeDisambiguation")
            {
                log.info("Populating ContactDetails msg handler");
                this._populateTypeDisambiguation();
            }
        }    
    }
}

contactsApp.prototype._SendFocusFavoritesMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload)
    {
        if(msg.params.payload.FavoritesInFocus)
        {
            if((this._currentContext && this._currentContext.ctxtId === "Contacts") || (this._currentContext && this._currentContext.ctxtId === "ContactDetails"))
            {
                this._addFocusedItemToFavorites();
            }
        }
    }
}

/**************************
 * DBAPI METHOD RESPONSE HANDLERS *
 **************************/

contactsApp.prototype._openContactsDbCallbackFn = function(msg)
{
    this._openDbConnectionInProgress = false;    
    this._DbResponse = false;
    if (msg.msgContent.params.eCode === 0)
    {
         this._openDbCount =this._openDbCount+1;
         log.info("this._openDbCount: "+this._openDbCount + "this._closeDbCount: " + this._closeDbCount);
         this._isContactsDbOpen = true;
         if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "Contacts")
         {
            log.info(" _openContactsDbCallbackFn...  calling contactsindex method");
            this._contactsIndex();  
            // Api for GetContactIndex Data            
            //Send Get Contacts Request to DBAPI
            log.info("in _openContactsDbCallbackFn..........caaling GetContacts......... ");
            var params = {"deviceId":this._getDeviceId(), "limit":this._requestChunkSize, "offset":(this._listNeedDataOffsetIndex),"ctoType":"ThumbnailImage","sort":"OrderId","filter":"All"};
            framework.sendRequestToDbapi(this.uiaId, this._getContactsCallbackFn.bind(this), "pb", "GetContacts", params);            
         }
         else if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "ContactsDisambiguation")
         {
            if(this._listDisambiguateContactsId)
            {
                //Send Get Contactsdetails Request to DBAPI
                for(var i=0; i<this._listDisambiguateContactsId.length; i++)
                {
                    var params = {"deviceId" : this._getDeviceId(), "contactId" : this._listDisambiguateContactsId[i]};
                    framework.sendRequestToDbapi(this.uiaId, this._getContactDetailsForDisambiguityCallbackFn.bind(this), "pb", "GetContactDetails", params);
                }
            }
         }
         else
         {
             if(framework.localize.getRegion() === framework.localize.REGIONS.Japan)
                {
                     log.debug("In japan region ....")
                     var params = {"deviceId":this._getDeviceId(), "contactId":this._cachedContactId, "ctoType":"ThumbnailImage", "region" : "Japan"};
                }
                else
                {
                    log.debug("In Other region ....")
                     var params = {"deviceId":this._getDeviceId(), "contactId":this._cachedContactId, "ctoType":"ThumbnailImage", "region" : "Other"};
                }
            //var params = {"deviceId" :this._getDeviceId(), "contactId" : this._cachedContactId};
            framework.sendRequestToDbapi(this.uiaId, this._getContactDetailsCallbackFn.bind(this), "pb", "GetContactDetails", params);
         }
    }
    else
    {
        log.debug("Contacts DB Open failed");
        this._isContactsDbOpen = false;
        if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "Contacts")
        {
            this._populateContactsCtxtList();
        }
    }
}
//in case of normal DB close in focus
contactsApp.prototype._closeContactsDbCallbackFn = function(msg)
{
    log.debug(" _closeContactsDbCallbackFn  called...");
    this._closeDbConnectionInProgress = false;
    if ( this._deviceConnStatus === "DISCONNECTED")
    {
        this._deviceId = -1;
        log.debug("in _closeContactsDbCallbackFn then deviceId "+this._getDeviceId());
    }    
     this._isContactsDbOpen = false;    
    if (msg.msgContent.params.eCode === 0)
    {
        this._closeDbCount=this._closeDbCount+1;
        log.info("this._openDbCount: "+this._openDbCount + "this._closeDbCount: " + this._closeDbCount);
        log.debug("in _closeContactsDbCallbackFn.... Contacts DB Close Success...");
    }
    else
    {
        log.debug("in _closeContactsDbCallbackFn....Contacts DB Close failed....value of  this._isContactsDbOpen "+ this._isContactsDbOpen);
    }
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "Contacts" && this._reopenDbConnection== true)
     {
       this._reopenDbConnection = false;
       this._openDbConnection(); 
     }     
     
}


contactsApp.prototype._getDeviceId = function()
{
    if (typeof this._deviceId === "undefined" || this._deviceId === null)
    {
        return -1;
    }
    else
    {
        return this._deviceId;
    }
};

contactsApp.prototype._getContactsCallbackFn = function(msg)
{
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "Contacts")
    {
		var config = {
				loadingTextId : "common.Loading"                    
		}
		this._currentContextTemplate.list2Ctrl.setLoadingConfig(config); 
        this._DbResponse = true;
        if (msg.msgContent.params.eCode === 0)
        {                  
            this._cachedContactsChunk = msg.msgContent.params.contacts;
            this._listTotalCount = msg.msgContent.params.totalCount + 1;         
            this._listActualDataCount = msg.msgContent.params.count;
            this._listCurrentOffset =  msg.msgContent.params.offset;
            log.info(".... :  Inside_getContactsCallbackFn, this._listTotalCount: " + this._listTotalCount + " this._listActualDataCount: " + this._listActualDataCount + " this._listCurrentOffset" + this._listCurrentOffset);
            this._addItemsToList(this._cachedContactsChunk, this._listCurrentOffset, this._listActualDataCount);
        }
        else
        {
            log.debug("_getContactsCallbackFn called.....GetContacts operation failed");
            this._populateContactsCtxtList();
            this._closeDbConnection();
        }
    }
}

contactsApp.prototype._getContactForDisambiguityCallbackFn = function(msg)
{   
    log.info(" _getContactForDisambiguityCallbackFn  called...");
    if (msg.msgContent.params.eCode === 0)
    {
        if(msg.msgContent.params.contacts)
        {
            this.listOfContacts[this.contactIdctr] = msg.msgContent.params.contacts[this.contactIdctr].displayName;
            this.contactIdList[this.contactIdctr] = msg.msgContent.params.contacts[this.contactIdctr].contactId;
            this.contactIdctr++;
        }
        if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "ContactsDisambiguation")
        {
            this._populateContactsDisambiguation();
        }
    }
    else
    {
        this._closeDbConnection();
        log.info("getContactForDisambiguity operation failed, closing DB");
    }
}

//get individual contact contact callback
contactsApp.prototype._getContactDetailsCallbackFn = function(msg)
{
    log.info("In _getContactDetailsCallbackFn function")
    this._title = "";
    this.ctoPath = "./common/images/icons/IcnContactImagePlaceholder_Active.png";
    this.displayName = "";
    
    if (msg.msgContent.params.eCode === 0)
    {
        if(msg.msgContent.params.displayName)
        {
           this.displayName = msg.msgContent.params.displayName;
           this._title = this.displayName;
        }
        if(msg.msgContent.params.contactId)
        {
            this.contactId = msg.msgContent.params.contactId;
        }
        if(msg.msgContent.params.numbers)
        {
            this.numbers = msg.msgContent.params.numbers;
        }
        if(msg.msgContent.params.orderId)
        {
            this.orderId = msg.msgContent.params.orderId;
        }
        if(msg.msgContent.params.ctoPath)
        {            
            //Added to delete images from tmp folder 
            log.info("indexOf() returned " + this._freeDbContactId.indexOf(msg.msgContent.params.contactId) + "for contactId" + msg.msgContent.params.contactId);
            
            if(this._freeDbContactId.indexOf(msg.msgContent.params.contactId) == -1)
            {
                log.info(" In _getContactDetailsCallbackFn,contact id not present so pushing it in the list"+msg.msgContent.params.contactId);
                this._freeDbContactId.push(msg.msgContent.params.contactId);
                this._freeDbSeqId.push(msg.msgContent.params.dbSeqNo);
            }
            this.ctoPath = msg.msgContent.params.ctoPath;            
        }
        this._contactNumbers = new Object();
        this._type = new Array();
        this.homeNumber = [];
        this.mobileNumber = [];
        this.workNumber = [];
        this.otherNumber = [];
        this.companyName = [];
        this.address = new Object();
        this.address = null;
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
                    if(this._type[i] === "CompanyName")
                    {
                       this.companyName[j++] = this._contactNumbers.number;
                    }
                    if((this._type[i] === "Other")|| (this._type[i] === "Pager") ||  (this._type[i] === "Car") ||
                     (this._type[i] === "Any") || (this._type[i] === "Voice")|| (this._type[i] === "Pref"))
                    {
                       this.otherNumber[p++] = this._contactNumbers.number;
                    }
                };
            }
        }
        if(msg.msgContent.params.address)
        {
            this.address = msg.msgContent.params.address;
        }
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "ContactDetails")
        {
            this._populateContactDetails();
        }
        else if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "WhichNumber")
        {
            this._populateWhichNumberList();
        }
    }
    else
    {
        this._closeDbConnection();
        log.debug("Get Contact Details operation failed,closing DB");
    }
}

contactsApp.prototype._getContactDetailsCallbackFnForMmui = function(msg)
{
    log.debug(" In function _getContactDetailsCallbackFnForMmui")
    this.paramsToMmui = new Object();
    this.name = "";
    this._title = "";
    this.phoneticDisplayName = "";
    this.ctoPath = "./common/images/icons/IcnContactImagePlaceholder_Active.png";
    if (msg.msgContent.params.eCode === 0)
    {
        if(msg.msgContent.params.displayName)
        {
            this.name = msg.msgContent.params.displayName;
        }
        if(msg.msgContent.params.phoneticDisplayName)
        {
            this.phoneticDisplayName = msg.msgContent.params.phoneticDisplayName;
            log.debug("Value from dbapi:- "+this.phoneticDisplayName)
        }

        if(msg.msgContent.params.ctoPath && msg.msgContent.params.ctoPath !== "")
        {
            log.info("indexOf() returned " + this._freeDbContactId.indexOf(msg.msgContent.params.contactId) + "for contactId" + msg.msgContent.params.contactId);
            if(this._freeDbContactId.indexOf(msg.msgContent.params.contactId) == -1)
            {
                log.info(" In _getContactDetailsCallbackFnForMmui,contact id not present so pushing it in the list"+ msg.msgContent.params.contactId);
                this._freeDbContactId.push(msg.msgContent.params.contactId);
                this._freeDbSeqId.push(msg.msgContent.params.dbSeqNo); 
            }
            this.ctoPath = msg.msgContent.params.ctoPath;
        }
        if(msg.msgContent.params.numbers)
        {
            this.numbers = msg.msgContent.params.numbers;
        }

        this._title = this.name;
        this.contactNumbers = new Object();
        this.type = new Array();
        this.homeNumber = [];
        this.mobileNumber = [];
        this.workNumber = [];
        this.otherNumber = [];
        this.companyName = [];
        this.address = new Object();

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
                    }
                    else if((this.type[i] === "Home") || (this.type[i] === "Phone") || (this.type[i] === "Home_Phone"))
                    {                      
                        this.homeNumber.push(this.contactNumbers.number);                       
                    }
                    else if((this.type[i] === "Work") || (this.type[i] === "Office_Phone") || (this.type[i] === "Office_Mobile"))
                    {                      
                        this.workNumber.push(this.contactNumbers.number);                      
                    }
                    else if((this.type[i] === "CompanyName") || (this.type[i] === "Company"))
                    {                      
                        this.companyName.push(this.contactNumbers.number);
                    }
                    else if((this.type[i] === "Other")|| (this.type[i] === "Pager") ||  (this.type[i] === "Car") ||
                     (this.type[i] === "Any") || (this.type[i] === "Voice")|| (this.type[i] === "Pref"))
                    {                       
                        this.otherNumber.push(this.contactNumbers.number);
                    }
                }
            }
        }

            this.paramsToMmui =
            {
                "contactDetails":
                    {
                      "contactName" : this.name,
                      "id" : this._appIdContactDetails,
                      "orderId" : 0,
                      "totalHomeNumbers" : this.homeNumber.length,
                      "totalWorkNumbers" : this.workNumber.length,
                      "totalMobileNumbers" : this.mobileNumber.length,
                      "totalOtherNumbers" : this.otherNumber.length,
                      "homeNumber" : this.homeNumber[0],
                      "workNumber" : this.workNumber[0],
                      "mobileNumber" : this.mobileNumber[0],
                      "otherNumber" : this.otherNumber[0],
                      "address" : null,
                      "totalAmbiguousContacts" : 0,
                      "ambiguousContactsIdList" : "",
                      "phoneticName" : this.phoneticDisplayName
                    }
            }
  
        if(msg.msgContent.params.address)
        {
            log.debug("Address present");
            this.address = msg.msgContent.params.address;
            
            this.paramsToMmui.contactDetails.address = 
            {
                  "addressLine1" : this.address.street,
                  "addressLine2" : "",
                  "city" : this.address.city,
                  "stateProvince" : this.address.region,
                  "country" : this.address.country,
                  "code" : this.address.zipcode
            }
        }
        else
        {
            log.debug("Address not present");
            //this.address = null;
            this.paramsToMmui.contactDetails.address = 
            {
                  "addressLine1" : "",
                  "addressLine2" : "",
                  "city" : "",
                  "stateProvince" : "",
                  "country" : "",
                  "code" : ""
            }
       }
        
    }
    else
    {
         this._closeDbConnection();
         log.info("Get Contact Details operation failed,closing DB");
    }
    framework.sendEventToMmui(this.uiaId, "BrowseContactName", {payload : this.paramsToMmui},this._vuiContactsFlag);
}

contactsApp.prototype._getContactDetailsForDisambiguityCallbackFn = function(msg)
{
    log.debug("Inside _getContactDetailsForDisambiguityCallbackFn");
    var ctoPath = "./common/images/icons/IcnContactImagePlaceholder_Active.png";
    if (msg.msgContent.params.eCode === 0)
    {
        this._listDisambiguateContacts.push(msg.msgContent.params.displayName);
        if(msg.msgContent.params.ctoPath && msg.msgContent.params.ctoPath !== "")
        {
            if(this._freeDbContactId.indexOf(msg.msgContent.params.contactId) == -1)
            {
                log.debug(" In _getContactDetailsForDisambiguityCallbackFn,contact id not present so pushing it in the list"+msg.msgContent.params.contactId);
                this._freeDbContactId.push(msg.msgContent.params.contactId);
                this._freeDbSeqId.push(msg.msgContent.params.dbSeqNo); 
            }
            ctoPath = msg.msgContent.params.ctoPath;
        }
        this._listDisambiguateContactsCtoPath.push(ctoPath);
        if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "ContactsDisambiguation")
        {
            this._populateContactsDisambiguation();
        }
    }
    else
    {
        this._closeDbConnection();
        log.debug("Get Contact Details operation failed, closing DB");
    }
}

contactsApp.prototype._getContactsIndexCallbackFn = function(msg)
{
    if (msg.msgContent.params.eCode === 0)
    {
        var currList = this._currentContextTemplate.list2Ctrl;
        var indexArray = [];
        this._indexList = new Array();
        this._indexList = msg.msgContent.params.indexList;
        this._indexCount = msg.msgContent.params.count;        
        for(var i=0; i <this._indexList.length; i++ )
        {
            log.debug(".... : Value of index " + this._indexList[i].index);
            indexArray[i] = {label : this._indexList[i].label,itemIndex : (-1 != this._indexList[i].index) ? this._indexList[i].index + 1 : -1 }  
        }
        currList.setLetterIndexData(indexArray);    
    }    
    else 
    {
        this._closeDbConnection();
        log.debug("_getContactsIndexCallbackFn operation failed, closing DB");
    }
}

/**************************
 * Control callbacks
 **************************/

//WaitForPhoneDataCountDownCallback
contactsApp.prototype._WaitForPhoneDataCountDownCallback = function()
{  
    this._waitForPhoneDataTimeout--;
    /*if(this._waitForPhoneDataTimeout == 170)
    {
        if(this._cachePbConnectionStatus == false)
        {
            framework.sendEventToMmui(this.uiaId, "ImportFailure", {payload :{errorReason:2}},false);
            clearInterval(this._waitForPhoneDataTimer);
            this._waitForPhoneDataTimer = null;
        }
    }*/
    if (this._waitForPhoneDataTimeout <= 0)
    {
        clearInterval(this._waitForPhoneDataTimer);
        this._waitForPhoneDataTimer = null; 
    }
    if (this._currentContext && this._currentContextTemplate)
    {
        if (this._currentContext.ctxtId === "WaitForPhoneData")
        {
            var text2Id = this._contextTable.WaitForPhoneData.controlProperties.Dialog3Ctrl.text2Id;
            var subMap = {"timeout" : this._waitForPhoneDataTimeout};
            this._currentContextTemplate.dialog3Ctrl.setText2Id(text2Id,subMap);
        }
    }
}

//CancellingImportCountDownCallback
contactsApp.prototype._cancellingImportCountDownCallback = function()
{
    if (this._cancellingImportTimeout <= 0)
    {
        clearInterval(this._cancellingImportTimer);
        this._cancellingImportTimer = null;
        //this._sendTimeoutToMmui();
        this._cancellingImportTimeout = 0;
    }

    if (this._currentContext && this._currentContextTemplate)
    {      
        if (this._currentContext.ctxtId === "CancellingImport")
        {
        this._currentContextTemplate.dialog3Ctrl.setText1Id("CancellingImport",
        {
            timeout : this._cancellingImportTimeout
        });      
    }
    this._cancellingImportTimeout--;
}
}
// List Control
contactsApp.prototype._listItemClickCallback = function(listCtrlObj, appData, params)
{  
    this._vuiContactsFlag = false;
    if (params && params.fromVui)
    {
        this._vuiContactsFlag = true;        
    }
    log.info("Value of this._vuiContactsFlag in Contacts"+this._vuiContactsFlag);
    switch (this._currentContext.ctxtId)
    {
        case "Contacts" :
            switch(appData)
            {
                case "ImportContacts" :
                    framework.sendEventToMmui(this.uiaId, appData,null,this._vuiContactsFlag);                    
                    break;          
                default :
                    log.debug("_listItemClickCallback called...No event has been defined for Contacts!");
                    break;
            }
            if(appData.name)
            {
                //fetch contact details using contact id from dbapi
                this._appIdContactDetails = appData.id;
                this._cachedContactId = appData.id;
                
                if(framework.localize.getRegion() === framework.localize.REGIONS.Japan)
                {
                     log.debug("In japan region ....")
                     var params = {"deviceId":this._getDeviceId(), "contactId":this._cachedContactId, "ctoType":"ThumbnailImage", "region" : "Japan"};
                }
                else
                {
                    log.debug("In Other region ....")
                     var params = {"deviceId":this._getDeviceId(), "contactId":this._cachedContactId, "ctoType":"ThumbnailImage", "region" : "Other"};
                }
                framework.sendRequestToDbapi(this.uiaId, this._getContactDetailsCallbackFnForMmui.bind(this), "pb", "GetContactDetails", params);               
            }
            break;
        case "ContactsDisambiguation" :
            switch(appData.eventName)
            {
                case "BrowseContactName" :
                    //fetch contact details using contact id from dbapi
                    this._appIdContactDetails = appData.id;
                    this._cachedContactId = appData.id;
                    if(framework.localize.getRegion() === framework.localize.REGIONS.Japan)
                    {
                        log.debug("In japan region ....")
                        var params = {"deviceId":this._getDeviceId(), "contactId":appData.id, "ctoType":"ThumbnailImage", "region" : "Japan"};
                    }
                    else
                    {
                        log.debug("In Other region ....")
                        var params = {"deviceId":this._getDeviceId(), "contactId":appData.id, "ctoType":"ThumbnailImage", "region" : "Other"};
                    }
                    //var params = {"deviceId":this._getDeviceId(), "contactId":appData.id, "ctoType":"ThumbnailImage"};
                    framework.sendRequestToDbapi(this.uiaId, this._getContactDetailsCallbackFnForMmui.bind(this), "pb", "GetContactDetails", params);
                    break;
                default :
                    log.debug("_listItemClickCallback called...No event has been defined for ContactsDisambiguation!");
                    break;
            }
            break;
        case "TypeDisambiguation" :
            switch (appData.eventName)
            {                
                case "SelectPhoneNumber" :
                    var numberValue = appData.phoneNumber;
                    framework.sendEventToMmui(this.uiaId, appData.eventName, {payload: {phoneNumber : numberValue}},this._vuiContactsFlag);
                    log.info("In _listItemClickCallback, TypeDisambiguation event, value from this._vuiContactsFlag"+this._vuiContactsFlag);
                    break;             
                default:
                    log.warn("phoneApp: Unknown Appdata", appData);
                    break;
            }
            break;
        case "EditContacts":
            switch(appData)
            {
                case "ImportAll" :
                    framework.sendEventToMmui(this.uiaId, appData,null,this._vuiContactsFlag);
                    break;
                case "ImportCancel" :            
                    if((this._cachedImportStatus)&&((this._cachedImportStatus !== "Failed")||(this._cachedImportStatus !== "FlashUpdating")||(this._cachedImportStatus !== "FlashUpdated")||(this._cachedImportStatus !== "Done")||(this._cachedImportStatus !== "DB_UpdatePending")))
                    { 
                        framework.sendEventToMmui(this.uiaId, appData,null,this._vuiContactsFlag);
                        //this._CancelImportClicked = true;
                        this._cachedImportStatus = "CancelImportClicked";
                        
                    }
                    
                    break;
                case "ImportSingle" :
                    framework.sendEventToMmui(this.uiaId, appData,null,this._vuiContactsFlag);
                    break;
                default :
                    log.warn("No event has been defined!");
                    break;
            }
            break;
        case "ContactDetails" :
            switch(appData.eventName)
            {
                case "SelectPhoneNumber" :
                    var paramsTommui = {
                            phoneNumber : appData.phoneNumber
                            }
                        framework.sendEventToMmui(this.uiaId, appData.eventName, {payload : paramsTommui},this._vuiContactsFlag);  
                        log.info("In _listItemClickCallback, SelectPhoneNumber event, value from this._vuiContactsFlag"+this._vuiContactsFlag);
                        break;               
                case "ShowSelectedAddress":
                    var paramsTommui =
                    {
                    streetAddress:
                    {
                        addressLine1:appData.address.streetAddress.addressLine1,
                        addressLine2:"",
                        city:appData.address.streetAddress.city,
                        stateProvince:appData.address.streetAddress.stateProvince,
                        country:appData.address.streetAddress.country,
                        code:appData.address.streetAddress.code
                    }
                    }
                    framework.sendEventToMmui(this.uiaId, appData.eventName, {payload : paramsTommui},this._vuiContactsFlag); 
                    log.info("In _listItemClickCallback, ShowSelectedAddress event, value from this._vuiContactsFlag"+this._vuiContactsFlag);
                    break;
                case "RemoveContact":
                    framework.sendEventToMmui(this.uiaId, appData.eventName,null,this._vuiContactsFlag);
                    break;
                case "SelectReadContactName":
                    framework.sendEventToMmui(this.uiaId ,appData.eventName,null,this._vuiContactsFlag);
                    log.info("In _listItemClickCallback, SelectReadContactName event, value from this._vuiContactsFlag"+this._vuiContactsFlag);
                    break;         
                case "SelectFavoritesCurrentContact" :                    
                  framework.sendEventToMmui(this.uiaId ,appData.eventName,null,this._vuiContactsFlag);
                    break;
                default :
                    break;
            }
            break;
        case "WhichNumber" :       
            switch(appData.eventName)
            {
                case "SelectPhoneNumber" :
                    var paramsTommui = { phoneNumber : appData.phoneNumber };
                    framework.sendEventToMmui(this.uiaId, appData.eventName, {payload : paramsTommui},this._vuiContactsFlag);
                    log.info("In _listItemClickCallback, SelectPhoneNumber event, value from this._vuiContactsFlag"+this._vuiContactsFlag);
                    break;
                default :
                    log.debug("_listItemClickCallback called...No event has been defined for WhichNumber!");
                    break;
            }
            break;
        default :
            log.debug("_listItemClickCallback called. Unknown context");
            break;
    }
}
// EOF: List Control
// Long press Control
contactsApp.prototype._longPressCallback = function(longPressCtrlObj, appData, params)
{
    log.debug("_longPressCallback called......");
    switch (this._currentContext.ctxtId)
    {     
    case "ContactDetails" :       
        switch(appData.eventName)
        {
        case "SelectPhoneNumber":            
            var numberValue = appData.phoneNumber;            
            framework.sendEventToMmui(this.uiaId, "SelectFavoritesNumber", {payload: {phoneNumber : numberValue}});        
            break;
        case "ShowSelectedAddress":
            var paramsTommui =
            {
                 streetAddress:
                 {
                     addressLine1:appData.address.streetAddress.addressLine1,
                     addressLine2:"",
                     city:appData.address.streetAddress.city,
                     stateProvince:appData.address.streetAddress.stateProvince,
                     country:appData.address.streetAddress.country,
                     code:appData.address.streetAddress.code
                 }
            }              
            framework.sendEventToMmui(this.uiaId,"SelectFavoritesAddress", {payload : paramsTommui});
            break;
        default :
            log.debug("_longPressCallback called....No event has been defined for ContactDetails");
            break;
        }
      case "Contacts":
           if(appData.name)
           {
               framework.sendEventToMmui(this.uiaId, "SelectFavoritesContact",   {"payload":{"contactInfo":{"contactId":appData.id,"contactName":appData.name}}});
           }
    }
}
//End of Long Press Control

// Dialog Control
contactsApp.prototype._dialogCtrlClickCallback = function(dialogBtnCtrlObj, appData, extraParams)
{
    log.debug("_dialogCtrlClickCallback called......");
    switch (this._currentContext.ctxtId)
    {
        case "RemoveContactConfirmation" :
            switch (appData)
            {
                case "Global.GoBack" :
                    framework.sendEventToMmui("common", appData);
                    break;
                case "SelectRemove" :
                    framework.sendEventToMmui(this.uiaId, appData);
                    break;
                default:
                    log.debug(" _dialogCtrlClickCallback called.....invalid app data for RemoveContactConfirmation");
                    break;
            }
            break;
        case "WaitForPhoneData" :
            switch (appData)
            {
                case "Global.Cancel" :
                    framework.sendEventToMmui("common", appData);
                    clearInterval(this._waitForPhoneDataTimer);
                    this._waitForPhoneDataTimer = null;
                    this._importInProgress = false;;
                    break;
                default:
                    log.debug(" _dialogCtrlClickCallback called.....invalid app data for WaitForPhoneData");
                    break;
            }
            break;
        case "ImportError" :
        case "DeleteSuccess" :
            switch (appData)
            {
                case "Global.Yes" :
                    framework.sendEventToMmui("common", appData);
                    break;
                default:
                    log.debug(" _dialogCtrlClickCallback called.....invalid app data for DeleteSuccess,ImportError");
                    break;
            }
            break;
        case "ImportConfirm" :
            switch (appData)
            {
                case "SelectDownload" :
                    framework.sendEventToMmui(this.uiaId, appData);
                    //this._DownloadClicked = true;
                    this._cachedImportStatus = "ImportRequested"
                    break;
                default:
                    log.debug(" _dialogCtrlClickCallback called.....invalid app data for ImportConfirm");
                    break;
            }
            break;
        case "DeleteError" :
        case "ImportErrorRetry":
            switch (appData)
            {
                case "Global.GoBack" :
                    framework.sendEventToMmui("common", appData);
                    break;
                case "SelectRetry" :
                    framework.sendEventToMmui(this.uiaId, appData);
                    if(this._cachedImportType == this._importTypeContacts)
                    {
                      this._cachedImportStatus = "ImportRequested";
                    }
                    break;
                default:
                    log.debug(" _dialogCtrlClickCallback called.....invalid app data for ImportErrorRetry,DeleteError");
                    break;
            }
            break;
        case "ContactReadUnsuccess" :
            switch (appData)
            {
                case "Global.Yes" :
                    framework.sendEventToMmui("common", appData);
                    break;
                default:
                    log.debug(" _dialogCtrlClickCallback called.....invalid app data for ContactReadUnsuccess");
                    break;
            }
            break;     
        default:
            log.debug("_dialogCtrlClickCallback called.....contactApp Unknown context", this._currentContext.ctxtId);
            break;
    }
}
// EOF: Dialog Control

// this is called when list needs more data to display when scrolling
contactsApp.prototype._contactsNeedDataCallback = function(index)
{ 
    log.debug(".... : _contactsNeedDataCallback called...");    
    log.debug(".... : _contactsNeedDataCallback called...value of index is" + index);    
    if(this._DbResponse)
    {
        log.debug(".... :  Contacts need data call back... dbresponse true");
        this._listNeedDataOffsetIndex = index - 1;        
        //Send Get Contacts Request to DBAPI
        if (this._isContactsDbOpen)
        {
            var params = {"deviceId":this._getDeviceId(), "limit":this._requestChunkSize, "offset":(this._listNeedDataOffsetIndex), "ctoType":"ThumbnailImage","sort":"OrderId","filter":"All"}; //deviceId is usually received from MMUI on phone connected
            framework.sendRequestToDbapi(this.uiaId, this._getContactsCallbackFn.bind(this), "pb", "GetContacts", params);
            this._DbResponse = false;
            log.debug(".... :  Contacts need data call back... dbresponse false");
        }
        else
        {
            log.debug(".... :  Contacts DB not open, can't fetch more data while scrolling");
        }        
   }
}

/**************************
 * Helper functions
 **************************/

// Add/Update items to list control
contactsApp.prototype._addItemsToList = function(itemsList, offset, count)
{
    log.debug(".... : _addItemsToList");
    var dummyOffset = offset + 1;//Because one item is already present
    if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "Contacts")
    { 
        // reference to the list control        
        var currentList = this._currentContextTemplate.list2Ctrl;
        var j = 0;
        if (!this._isItemsPopulatedBefore)//items not populated
        {
            var dataList = {
                itemCountKnown : true,
                itemCount : this._listTotalCount,
                vuiSupport : true,
                items : []
            };
                
            if(this._cachedVehicleAtSpeed)
            {
                dataList.items[0] = 
                {
                        appData : "ImportContacts",
                        text1Id : "EditContacts",
                        itemStyle : "style01",
                        disabled : true,
                        hasCaret:false,
                        itemBehavior : "shortPressOnly",
                        image1 : "common/images/icons/IcnListAddRecipient_Ds.png"                
                };      
            }
            else
            {  
                dataList.items[0] = 
                {
                        appData : "ImportContacts",
                        text1Id : "EditContacts",
                        itemStyle : "style01",
                        disabled : false,
                        hasCaret:false,
                        itemBehavior : "shortPressOnly",
                        image1 : "common/images/icons/IcnListAddRecipient_En.png"                
                };        
            }
            if(itemsList)
            {
                for (var i = 1; i < this._listTotalCount; i++)
                {
                    if(i >= dummyOffset && i <= (offset+count))
                    {                        
                        // skip empty items
                        if (itemsList[j].displayName === "")
                        {
                            continue;
                        }
                        if(itemsList[j].ctoPath === "")
                        {
                            itemsList[j].ctoPath = "./common/images/icons/IcnListContact_En.png";
                        } 
                        else
                        {
                            if(this._freeDbContactId.indexOf(itemsList[j].contactId) == -1)
                            {
                                this._freeDbContactId.push(itemsList[j].contactId);
                                this._freeDbSeqId.push(itemsList[j].dbSeqNo); 
                            }
                        }
                        var items = new Object();
                        items = {
                            appData : { name : itemsList[j].displayName, id : itemsList[j].contactId },
                            text1 : itemsList[j].displayName,  // Using text1 because contact names doesn't have to be localized
                            image1 : itemsList[j].ctoPath,
                            itemStyle : "style01",
                            itemBehavior : "shortAndLong",
                            hasCaret : false
                        };                       
                        dataList.items[dataList.items.length] = items;
                        j++;
                    }
                    else
                    {                       
                        dataList.items[dataList.items.length] = { itemStyle:'style01', appData:null, text1:'', hasCaret:false};
                    }
                }
            }           
            currentList.setDataList(dataList);
            this._isItemsPopulatedBefore = true;
        }
        else
        {            
            for (var i = dummyOffset; i <= (offset+count); i++)
            {                
                // skip empty items
                if (itemsList[j].displayName === "")
                {
                    continue;
                }
                if(itemsList[j].ctoPath === "")
                {
                    itemsList[j].ctoPath = "./common/images/icons/IcnListContact_En.png";
                } 
                else
                    {
                        if(this._freeDbContactId.indexOf(itemsList[j].contactId) == -1)
                        {
                            this._freeDbContactId.push(itemsList[j].contactId);//Adding contact Id to delete images from tmp folder
                            this._freeDbSeqId.push(itemsList[j].dbSeqNo);//Adding sequence number for a contact  to delete images from tmp folder
                        }
                    }
                var items = new Object();
                items = {
                    appData : { name : itemsList[j].displayName, id : itemsList[j].contactId },
                    text1 : itemsList[j].displayName,  // Using text1 because contact names doesn't have to be localized
                    image1 : itemsList[j].ctoPath,
                    itemStyle : "style01",
                    itemBehavior : "shortAndLong",
                    hasCaret : false
                };
                log.debug(".... : Value of actual data count" + this._actualDataCount);
                currentList.dataList.items[i] = items;
                this._actualDataCount++;
                j++;
            }           
        }
        // update items
       currentList.updateItems(offset, (offset+count));     
    }    
}

// Populate contact list
contactsApp.prototype._populateContactsCtxtList = function()
{
    log.info(" _populateContactsCtxtList");
    if (this._currentContext.ctxtId === "Contacts")
    {
        var currentList = this._currentContextTemplate.list2Ctrl;
        //if phone is disconnected,  deleting the cached contacts list
        if ( this._deviceConnStatus === "DISCONNECTED")
        {
            this._currentContextTemplate.list2Ctrl.setDataList({});
            log.debug("in _populateContactsCtxtList,if  phone disconnected with device id "+this._deviceId);
        }
              
        if(this._cachedVehicleAtSpeed)
        {
            currentList.dataList.items[0] = 
            {
                    appData : "ImportContacts",
                    text1Id : "EditContacts",
                    itemStyle : "style01",
                    disabled : true,
                    hasCaret:false,
                    itemBehavior : "shortPressOnly",
                    image1 : "common/images/icons/IcnListAddRecipient_Ds.png"                
            };      
        }
        else
        {  
            currentList.dataList.items[0] = 
            {
                    appData : "ImportContacts",
                    text1Id : "EditContacts",
                    itemStyle : "style01",
                    disabled : false,
                    hasCaret:false,
                    itemBehavior : "shortPressOnly",
                    image1 : "common/images/icons/IcnListAddRecipient_En.png"                
            };        
        }    
        currentList.dataList.itemCountKnown = true;
        if (!currentList.hasDataList())
        {
            currentList.dataList.itemCount = 1;
            var dataList = currentList.dataList;           
            currentList.setDataList(dataList);             
        }
        currentList.updateItems(0, 0);
        currentList.dataList.vuiSupport = true;
    }
}

// Populate Edit Contacts List
contactsApp.prototype._populateEditContactsList = function()
{
    if (this._currentContextTemplate)
    {
        var dataList =
        {
            itemCountKnown : true,
            itemCount : 2
        };
        var listItems = new Array();
        var vehicleAtSpeed = false;
        if(this._cachedVehicleAtSpeed)
        {
            vehicleAtSpeed = true;
        }
        else
        {
            vehicleAtSpeed = false;
        }
        if(this._cachedImportStatus === null)
        {
            listItems = [
            { appData : "ImportAll", text1Id : "ImportAllContacts", selected : false, disabled : vehicleAtSpeed, itemStyle : "style01",image1:'common/images/icons/IcnListAddRecipient_En.png',hasCaret:false },
            { appData : "ImportSingle", text1Id : "SelectedContactImport", selected : false, disabled : vehicleAtSpeed, itemStyle : "style01",image1:'common/images/icons/IcnListAddRecipient_En.png',hasCaret:false },
            ]
        }
        else
        {
            log.debug("Test else"+this._importProgressBarStatus);
            switch(this._cachedImportStatus)
            {          
            case "Canceling":
            case "Done" :  
            case "Failed":
            case "Disconnecting":
                 {
                    if(vehicleAtSpeed)
                    {
                       listItems = [
                                       { appData : "ImportAll", text1Id : "ImportAllContacts", selected : false, disabled : vehicleAtSpeed, itemStyle : "style01",image1:'common/images/icons/IcnListAddRecipient_Ds.png', hasCaret:false },
                                       { appData : "ImportSingle", text1Id : "SelectedContactImport", selected : false, disabled : vehicleAtSpeed, itemStyle : "style01",image1:'common/images/icons/IcnListAddRecipient_Ds.png', hasCaret:false },
                                    ]
                    }
                    else
                    {
                         listItems = [
                                         { appData : "ImportAll", text1Id : "ImportAllContacts", selected : false, disabled : vehicleAtSpeed, itemStyle : "style01",image1:'common/images/icons/IcnListAddRecipient_En.png', hasCaret:false },
                                         { appData : "ImportSingle", text1Id : "SelectedContactImport", selected : false, disabled : vehicleAtSpeed, itemStyle : "style01",image1:'common/images/icons/IcnListAddRecipient_En.png', hasCaret:false },
                                     ]
                    }
                 }
                 //this._CancelImportClicked = false;
                 break;
            case "Importing":
            case "ExtractionStarted":
            case "Parsing":
            case "Sorting":
            case "Photos":
            case "ExtractionDone":                
                {
				 
				 var dataList =
				{
				itemCountKnown : true,
				itemCount : 3
				};
					if(vehicleAtSpeed)
                    {
                        listItems = [
                                        { appData : "ImportCancel", text1Id : "CancelImport", selected : false, image1:'common/images/icons/IcnListCancelImport_Ds.png', disabled : vehicleAtSpeed, itemStyle : "style01",hasCaret:false },
										{ appData : "style28", text1Id : "", disabled : vehicleAtSpeed, itemStyle :"style28", hasCaret:false, min : 0, max : 1, increment : 0.05, value : this._importProgressBarStatus,  allowAdjust : false },
                                        { appData : "ImportSingle", text1Id : "SelectedContactImport", selected : false, disabled : true, itemStyle : "style01", image1:'common/images/icons/IcnListAddRecipient_Ds.png',hasCaret:false },
                                    ]
                    }
                    else
                    {
                        listItems = [
                                        { appData : "ImportCancel", text1Id : "CancelImport", selected : false, image1:'common/images/icons/IcnListCancelImport_Ds.png', disabled : vehicleAtSpeed, itemStyle : "style01",hasCaret:false },
										{ appData : "style28", text1Id : "", disabled : vehicleAtSpeed, itemStyle :"style28", hasCaret:false, min : 0, max : 1, increment : 0.05, value : this._importProgressBarStatus,  allowAdjust : false },
                                        { appData : "ImportSingle", text1Id : "SelectedContactImport", selected : false, disabled :true, itemStyle : "style01", image1:'common/images/icons/IcnListAddRecipient_Ds.png',hasCaret:false },
                                    ]
                    }
                }
                //this._DownloadClicked = false;       
                break;
            case "DB_UpdatePending":                    
            case "FlashUpdating": 
            case "FlashUpdated":                 
                {
				var dataList =
				{
				itemCountKnown : true,
				itemCount : 3
				};
                    listItems = [
                                    { appData : "ImportCancel", text1Id : "CancelImport", selected : false, disabled : true, image1:'common/images/icons/IcnListCancelImport_Ds.png', itemStyle : "style01",hasCaret:false },
									{ appData : "style28", text1Id : "", disabled : true, itemStyle :"style28", hasCaret:false, min : 0, max : 1, increment : 0.05, value : this._importProgressBarStatus,  allowAdjust : false },
                                    { appData : "ImportSingle", text1Id : "SelectedContactImport", selected : false, disabled : true, itemStyle : "style01", image1:'common/images/icons/IcnListAddRecipient_Ds.png',hasCaret:false },
								]
                 }
                    break;
            case "ImportRequested" :
                 {
				var dataList =
				{
				itemCountKnown : true,
				itemCount : 3
				};
                    if(vehicleAtSpeed)
                       {
                            listItems = [
                                            { appData : "ImportCancel", text1Id : "CancelImport", selected : false, image1:'common/images/icons/IcnListCancelImport_Ds.png', disabled : vehicleAtSpeed, itemStyle : "style01",hasCaret:false },
											{ appData : "style28", text1Id : "", disabled : vehicleAtSpeed, itemStyle :"style28", hasCaret:false, min : 0, max : 1, increment : 0.05, value : this._importProgressBarStatus,  allowAdjust : false },
											{ appData : "ImportSingle", text1Id : "SelectedContactImport", selected : false, disabled :true, itemStyle : "style01", image1:'common/images/icons/IcnListAddRecipient_Ds.png',hasCaret:false },
                                        ]
                       }
                       else
                       {
                          listItems = [
                                        { appData : "ImportCancel", text1Id : "CancelImport", selected : false, image1:'common/images/icons/IcnListCancelImport_Ds.png', disabled : vehicleAtSpeed, itemStyle : "style01",hasCaret:false },
										{ appData : "style28", text1Id : "", disabled : vehicleAtSpeed, itemStyle :"style28", hasCaret:false, min : 0, max : 1, increment : 0.05, value : this._importProgressBarStatus,  allowAdjust : false },
										{ appData : "ImportSingle", text1Id : "SelectedContactImport", selected : false, disabled :true, itemStyle : "style01", image1:'common/images/icons/IcnListAddRecipient_Ds.png',hasCaret:false },
									  ]
                       }
                 }
                 break;
            case "CancelImportClicked":
                    {
					var dataList =
					{
					itemCountKnown : true,
					itemCount : 3
					};
                        listItems = [
						{ appData : "ImportCancel", text1Id : "CancelImport", selected : false, image1:'common/images/icons/IcnListCancelImport_Ds.png', disabled : vehicleAtSpeed, itemStyle : "style01",hasCaret:false },
                        { appData : "ImportCancel", text1Id : "CancelImport", disabled : true, itemStyle :"style12", labelLeftId : null, labelLeftSubMap : null, labelLeft : "", labelRightId : null, labelRightSubMap : null, labelRight : "", image1:'common/images/icons/IcnListCancelImport_Ds.png',hasCaret:false, min : 0, max : 1, increment : 0.05, value : this._importProgressBarStatus,  allowAdjust : false },
                        { appData : "ImportSingle", text1Id : "SelectedContactImport", selected : false, disabled : true, itemStyle : "style01", image1:'common/images/icons/IcnListAddRecipient_Ds.png',hasCaret:false },
                        ]
                    }
                    break;
            default :
                    if(vehicleAtSpeed)
                    {
                        listItems = [
                                        { appData : "ImportAll", text1Id : "ImportAllContacts", selected : false, disabled : vehicleAtSpeed, itemStyle : "style01",image1:'common/images/icons/IcnListAddRecipient_Ds.png', hasCaret:false },
                                        { appData : "ImportSingle", text1Id : "SelectedContactImport", selected : false, disabled : vehicleAtSpeed, itemStyle : "style01",image1:'common/images/icons/IcnListAddRecipient_Ds.png', hasCaret:false },
                                    ]
                    }
                    else
                    {
                        listItems = [
                                        { appData : "ImportAll", text1Id : "ImportAllContacts", selected : false, disabled : vehicleAtSpeed, itemStyle : "style01",image1:'common/images/icons/IcnListAddRecipient_En.png', hasCaret:false },
                                        { appData : "ImportSingle", text1Id : "SelectedContactImport", selected : false, disabled : vehicleAtSpeed, itemStyle : "style01",image1:'common/images/icons/IcnListAddRecipient_En.png', hasCaret:false },
                                    ]
                    }
                    break;
            }
        }
        
      /*  if(this._CancelImportClicked)
        {
                    listItems = [
                    { appData : "ImportCancel", text1Id : "CancelImport", disabled : true, itemStyle :"style12", labelLeftId : null, labelLeftSubMap : null, labelLeft : "", labelRightId : null, labelRightSubMap : null, labelRight : "", image1:'common/images/icons/IcnListCancelImport_Ds.png',hasCaret:false, min : 0, max : 1, increment : 0.05, value : this._importProgressBarStatus,  allowAdjust : false },
                    { appData : "ImportSingle", text1Id : "SelectedContactImport", selected : false, disabled : true, itemStyle : "style01", image1:'common/images/icons/IcnListAddRecipient_Ds.png',hasCaret:false },
                    ]
        }*/

        dataList.items = listItems;
        if (this._currentContextTemplate)
        {
            this._currentContextTemplate.list2Ctrl.setDataList(dataList);
            this._currentContextTemplate.list2Ctrl.updateItems(0, dataList.itemCount - 1);
            this._currentContextTemplate.list2Ctrl.dataList.vuiSupport = true;
        }
    }
}

// Populate Contacts Details
contactsApp.prototype._populateContactDetails = function()
{
    var count = 0;
    var mobileNumCount = 0;
    var homeNumCount = 0;
    var workNumCount = 0;
    var otherNumCount = 0;
    var addressCount = 0;
    this._phoneNumberListCount = 0;
    this._totalListItemCountInDetails = 3;//for Read, Favorites and Remove list items
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
    if (this.address !== null)
    {
        if((this.address.street ==="")&&(this.address.region === "")&&(this.address.city === "")&&(this.address.country === "")&&(this.address.zipcode === ""))
        {
            addressCount = 0;
            log.debug("In address not there");
        }
        else
        {
            addressCount = 1;
            log.debug("In address not there");
        }
    }
   
    count = mobileNumCount + homeNumCount + workNumCount + otherNumCount + addressCount + 3;
    this._phoneNumberListCount = mobileNumCount + homeNumCount + workNumCount + otherNumCount;
    this._totalListItemCountInDetails = count;
    var dataList =
    {
        itemCountKnown : true,
        itemCount : count
    };

    var items = new Array();
    var i = 0;
    var k = 0;
    var l = 0;
    var m = 0;
    var n = 0;

    for(i = 0; i < mobileNumCount; i++)
    {
        items[i] = { appData : {eventName : "SelectPhoneNumber", phoneNumber : this.mobileNumber[i]}, text1 : this.mobileNumber[i], label1Id : 'MobilePhnNumber', itemStyle : "style14",hasCaret:false, itemBehavior :"shortAndLong"};
    }
    for(k = 0; k < homeNumCount; k++)
    {
        items[i++] = { appData : {eventName : "SelectPhoneNumber", phoneNumber : this.homeNumber[k]}, text1 : this.homeNumber[k], label1Id : 'HomePhnNumber' ,itemStyle : "style14",hasCaret:false, itemBehavior :"shortAndLong"};
    }
    for(l = 0; l < workNumCount; l++)
    {
        items[i++] = { appData : {eventName : "SelectPhoneNumber", phoneNumber : this.workNumber[l]}, text1 : this.workNumber[l], label1Id : 'WorkPhnNumber' ,itemStyle : "style14",hasCaret:false, itemBehavior :"shortAndLong"};
    }
    for(n = 0; n < otherNumCount; n++)
    {
        items[i++] = { appData : {eventName : "SelectPhoneNumber", phoneNumber : this.otherNumber[n]}, text1 : this.otherNumber[n], label1Id : 'OtherPhnNumber',itemStyle : "style14",hasCaret:false, itemBehavior :"shortAndLong"};
    }   
    if(addressCount)
    {
        log.debug("In address valid");
        var params = {
            "streetAddress" : {
                "addressLine1" : this.address.street,
                "addressLine2" : "",
                "city" : this.address.city,
                "stateProvince" : this.address.region,
                "country" : this.address.country,
                "code" : this.address.zipcode
            }
        }
        if(framework.localize.getRegion() === framework.localize.REGIONS.NorthAmerica ||
        framework.localize.getRegion() == framework.localize.REGIONS["4A"])
        {
               items[i++] = {
                       appData : {
                           eventName : "ShowSelectedAddress",
                           address : params
                               },
                           label1Id : "Address",
                           text1 : " "+this.address.street + ", " + this.address.city + ", "+ this.address.region + ", " + this.address.zipcode + ", " + this.address.country,
                           itemStyle : "style17",hasCaret:false, itemBehavior :"shortAndLong"
                               };
        }
        else if(framework.localize.getRegion() === framework.localize.REGIONS.Japan)
        {
            items[i++] = {
                    appData : {
                        eventName : "ShowSelectedAddress",
                        address : params
                            },
                        label1Id : "Address",
                        text1 : " "+this.address.region + this.address.city +  this.address.street + ", "+this.address.zipcode +", "+ this.address.country,
                        itemStyle : "style17",hasCaret:false, itemBehavior :"shortAndLong"
                            };
        }
        else if(framework.localize.getRegion() === framework.localize.REGIONS.Europe)
        {
            items[i++] = {
                    appData : {
                        eventName : "ShowSelectedAddress",
                        address : params
                            },
                        label1Id : "Address",
                        text1 : " "+this.address.street + ", " + this.address.zipcode + ", " + this.address.city + ", " + this.address.country,
                        itemStyle : "style17",hasCaret:false, itemBehavior :"shortAndLong"
                            };
        }
        else
        {
            items[i++] = {
                       appData : {
                           eventName : "ShowSelectedAddress",
                           address : params
                               },
                           label1Id : "Address",
                           text1 : " "+this.address.street + ", " + this.address.city +", "+ this.address.region + ", " + this.address.zipcode + ", " + this.address.country,
                           itemStyle : "style17",hasCaret:false, itemBehavior :"shortAndLong"
                               };
        }
        
    }
    items[i++] = { appData : {eventName : "SelectReadContactName"}, text1Id : "ReadContact", itemStyle : "style01",hasCaret:false};
    items[i++] = { appData : {eventName : "SelectFavoritesCurrentContact"}, text1Id : "SelectFavoritesCurrentContact", disabled : this._cachedVehicleAtSpeed, itemStyle : "style01",hasCaret:false, itemBehavior :"shortPressOnly"};
    items[i++] = { appData : {eventName : "RemoveContact"}, text1Id : "RemoveContact", disabled : this._cachedVehicleAtSpeed, itemStyle : "style01",hasCaret:false};

    if(this.companyName[0] === undefined || this.companyName[0] === null)
    {
        this.companyName[0] = ""; // just to ensure that company name is not shown as undefined...
    }

    dataList.items = items;
    
    if(this._title === undefined || this._title === null)
    {
        this._title = "";
    }
    
    var title =
    {
        titleStyle : "style05",
        text1Id : null,
        text1SubMap : null,
        text1 : this._title,
        text2 :this.companyName[0],
        text2Id : null,
        text2SubMap : null,
        image1 :  this.ctoPath,
        //itemBehavior :"shortPressOnly"
    };
    this._ContactDetaildatalist = dataList;
    if (this._currentContextTemplate)
    {
        this._currentContextTemplate.list2Ctrl.setTitle(title);
        this._currentContextTemplate.list2Ctrl.setDataList(dataList);
        this._currentContextTemplate.list2Ctrl.updateItems(0, dataList.items.length - 1);
        //this._currentContextTemplate.list2Ctrl.itemBehavior = "shortAndHold";
        this._currentContextTemplate.list2Ctrl.dataList.vuiSupport = true;
        
    }
}
//End Populate Contact Details

//Populate Phone Type for TypeDisambiguation
contactsApp.prototype._populateTypeDisambiguation = function()
{
    var mobileNumCount = 0;
    var homeNumCount = 0;
    var workNumCount = 0;
    var otherNumCount = 0;
  
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
    
    if (this._cachedphoneType === "MobilePhone")
    {
        for(i = 0; i < mobileNumCount; i++)
        {
            items[i] = { appData : {eventName : "SelectPhoneNumber", phoneNumber : this.mobileNumber[i]}, text1 : this.mobileNumber[i], label1Id : 'MobilePhnNumber',itemStyle : "style14",hasCaret:false };
        }
    }
    else if(this._cachedphoneType === "HomePhone")
    {    
        for(i = 0; i < homeNumCount; i++)
        {
            items[i] = { appData : {eventName : "SelectPhoneNumber", phoneNumber : this.homeNumber[i]}, text1 : this.homeNumber[i], label1Id : 'HomePhnNumber',itemStyle : "style14",hasCaret:false };
        }
    }
    else if (this._cachedphoneType === "WorkPhone")
    { 
        for(i = 0; i < workNumCount; i++)
        {
            items[i] = { appData : {eventName : "SelectPhoneNumber", phoneNumber : this.workNumber[i]}, text1 : this.workNumber[i], label1Id : 'WorkPhnNumber',itemStyle : "style14",hasCaret:false };
        }
    }
    else if (this._cachedphoneType === "OtherPhone")
    {
        for(i = 0; i < otherNumCount; i++)
        {
            items[i] = { appData : {eventName : "SelectPhoneNumber", phoneNumber : this.otherNumber[i]}, text1 : this.otherNumber[i], label1Id : 'OtherPhnNumber',itemStyle : "style14",hasCaret:false };
        } 
    }
    var dataList =
    {
        itemCountKnown : true,
        itemCount : items.length
    };
    dataList.items = items;

    if (this._currentContextTemplate)
    {
        this._currentContextTemplate.list2Ctrl.setDataList(dataList);
        this._currentContextTemplate.list2Ctrl.updateItems(0, dataList.items.length - 1);
       this._currentContextTemplate.list2Ctrl.dataList.vuiSupport = true;
        
    }
}

//populate ContactsDisambiguation
contactsApp.prototype._populateContactsDisambiguation = function()
{
    if (this._currentContextTemplate)
    {
        if(this._listDisambiguateContacts && this._listDisambiguateContactsCtoPath)
        {
            var dataList =
            {
                itemCountKnown : true,
                itemCount : this._listDisambiguateContacts.length
            };    
            var items = new Array();    
            for(i = 0; i < this._listDisambiguateContacts.length; i++)
            {
                items.push({
                    appData : {eventName : "BrowseContactName", id : this._listDisambiguateContactsId[i]},
                    text1 : this._listDisambiguateContacts[i],                   
                    image1 :  "./common/images/icons/IcnListContact_En.png",
                    itemStyle : "style01",
                    hasCaret  : false    
                });
            }
            dataList.items = items;
            if (this._currentContextTemplate)
            {
                this._currentContextTemplate.list2Ctrl.setDataList(dataList);
                this._currentContextTemplate.list2Ctrl.updateItems(0, dataList.itemCount - 1);
                this._currentContextTemplate.list2Ctrl.selectLine(dataList.itemCount); 
                this._currentContextTemplate.list2Ctrl.dataList.vuiSupport = true;
            }
            log.info("_populateContactsDisambiguation list item count" +this._currentContextTemplate.list2Ctrl.dataList.itemCount , this._listDisambiguateContactsId.length);
            if(dataList.itemCount == this._listDisambiguateContactsId.length)
            {
                this._disambiguateListPopulated = true;
            }
        }
    }
    
}

//populate WhichNumber
contactsApp.prototype._populateWhichNumberList = function()
{
    if (this._currentContextTemplate)
    {
        var count = 0;
        var mobileNumCount = 0;
        var homeNumCount = 0;
        var workNumCount = 0;
        var otherNumCount = 0;    
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
        count = mobileNumCount + homeNumCount + workNumCount + otherNumCount;    
        var dataList =
        {
            itemCountKnown : true ,
            itemCount : count
        };
        var items = new Array();    
        var i = 0;
        var j = 0;        
        if(this.mobileNumber)
        {
            for(j = 0; j < mobileNumCount; j++)
            {
                items[i++] = { appData : {eventName : "SelectPhoneNumber", phoneNumber : this.mobileNumber[j]}, text1 : this.mobileNumber[j], label1Id : 'MobilePhnNumber',itemStyle : "style14",hasCaret:false};
            }
        }        
        if(this.homeNumber)
        {
            for(j = 0; j < homeNumCount; j++)
            {
                items[i++] = { appData : {eventName : "SelectPhoneNumber", phoneNumber : this.homeNumber[j]}, text1 : this.homeNumber[j], label1Id : 'HomePhnNumber',itemStyle : "style14",hasCaret:false};
            }
        }    
        if(this.workNumber)
        {
            for(j = 0; j < workNumCount; j++)
            {
                items[i++] = { appData : {eventName : "SelectPhoneNumber", phoneNumber : this.workNumber[j]}, text1 : this.workNumber[j], label1Id : 'WorkPhnNumber',itemStyle : "style14",hasCaret:false};
            }
        }        
        if(this.otherNumber)
        {
            for(j = 0; j < otherNumCount; j++)
            {
                items[i++] = { appData : {eventName : "SelectPhoneNumber", phoneNumber : this.otherNumber[j]}, text1 : this.otherNumber[j], label1Id : 'OtherPhnNumber',itemStyle : "style14",hasCaret:false};
            }
        }        
        dataList.items = items;    
        var title =
        {
            text1 : this._title,
            text2 : this.companyName[0],
            titleStyle : "style05",
            image1 :  this.ctoPath
        };        
        if (this._currentContextTemplate)
        {
            this._currentContextTemplate.list2Ctrl.setTitle(title);
            this._currentContextTemplate.list2Ctrl.setDataList(dataList);
            this._currentContextTemplate.list2Ctrl.updateItems(0, dataList.items.length - 1);
            this._currentContextTemplate.list2Ctrl.dataList.vuiSupport = true;
        }
    }
}

//Populate Import error Retry
contactsApp.prototype._populateImportErrorRetryMsg = function()
{
    if (this._errorReasonRetryImport)
    {
        var errorReason = null;
        switch(this._errorReasonRetryImport)
        {
            case "ConnectionLost" :
            errorReason = "ConnectionLost";
                 break;
            case "CONNECTION_FAILED" :
                errorReason = "DeviceConnectFailed";
                break;
            case "Timeout" :
                 if(this._importTypePush == this._cachedImportType)
                 {
                 errorReason = "SingleImportTimeout";
                 }
                 else
                {
                     errorReason = "UnknownError";
                }
                break;
            default :
                errorReason = "UnknownError";
                log.debug("_populateImportErrorRetryMsg called....No error reason has been defined!");
                break;
        }
        if (this._currentContextTemplate)
        {
            if(this._cachedImportType == this._importTypeHistory)
            {
                importTypeHistory = "CHDownloadFailed";
                this._currentContextTemplate.dialog3Ctrl.setTitleId(importTypeHistory);
            }
            else
            {
                importTypeContacts = "ImportError";
                this._currentContextTemplate.dialog3Ctrl.setTitleId(importTypeContacts);
            }
            this._currentContextTemplate.dialog3Ctrl.setText1Id(errorReason);
        }
    }
}

//Populate Import error Retry
contactsApp.prototype._populateImportErrorNoRetryMsg = function()
{
    if (this._errorReasonNoRetryImport)
    {
        var errorReason1 = null;        
        switch(this._errorReasonNoRetryImport)
        {
            case "ImportNotSupported" :
                errorReason1 = "ImportUnsupported";
                break;
            case "ImportLimitReached" :
                errorReason1 = "ContactsFull";
                break;
            case "PhonebookFull" :
                errorReason1 = "ContactsFull";
                break;
            case "AccessDenied" :
                errorReason1 = "AccessDenied";
                break;
            case "MaxSpeed" :
                errorReason1 = "SpeedThresholdExceeded";
                break;
            case "HFT_NotAvail" :
                errorReason1 = "PhonebookNotAvailable";
                break;
            default :
                errorReason1 = "UnknownError";
                log.debug("_populateImportErrorNoRetryMsgcalled....No error reason has been defined!");
                break;
        }
        if (this._currentContextTemplate)
        {
            if(this._cachedImportType == this._importTypeHistory)
            {
                importTypeHistory = "CHDownloadFailed";
                this._currentContextTemplate.dialog3Ctrl.setTitleId(importTypeHistory);
            }
            else
            {
                importTypeContacts = "ImportError";
                this._currentContextTemplate.dialog3Ctrl.setTitleId(importTypeContacts);
            }
            this._currentContextTemplate.dialog3Ctrl.setText1Id(errorReason1);
        }
    }
}

/*
 * This function is called by Common whenever a msgType="alert" comes from MMUI.
 * This function should return a properties Object to use for the WinkCtrl.
 */
contactsApp.prototype.getWinkProperties = function(alertId, params)
    {
        log.debug("Inside getWinkProperties");
        var wink = null;     
        switch (alertId)
            {
                case "GUI_ImportXofYSuccess_Alert":
                        if(this._cachedFocusIn)
                            {
                             if (!params || !params.payload) //Note: If payload is expected, check if it exists before trying to access it
                             {
                                 log.info("MMUI did not send payload with alert message: " + alertId + ". Payload was expected.");
                                 return;
                             }
                            wink = {
                                "style": "style03",
                                "text1Id": "ImportSuccess",
                                "text1SubMap": {
                                    
                                    "ImportedEntries": params.payload.entriesImported,
                                    "TotalEntries" : params.payload.entriesTotal                
                                } 
                            
                            };
                            }
                        else
                        {
                            framework.common.endStateSbn(this.uiaId, "ImportedContactsStatus", "deviceConnected");
                        }
                        this._cachedImportStatus = "Done"; // hard coding - workaround - to change the text back to Import All in EditContacts
                        if(this._currentContext)
                        {
                            switch (this._currentContext.ctxtId)    
                            {
                                case "EditContacts" :
                                    this._populateEditContactsList(); //To update the first item to importall
                                    framework.common.endStateSbn(this.uiaId, "ImportedContactsStatus", "deviceConnected");
                                    break;    
                                default :
                                    break;
                            }
                        }
                break;
                default:
                    // if alertId cannot be found, winkProperties will return null and Common will display default Wink
                    log.debug("No properties  found for unknown alertId: " + alertId);        
                    break;
            }
       return wink;
};

contactsApp.prototype._resetVariableValues = function()
{
    this._cachedContactsList.splice(1,this._cachedContactsList.length-1);
    this._listNeedDataOffsetIndex = 0;
    this._listActualDataCount = 0;
    this._listTotalCount = 0;
    this._isItemsPopulatedBefore = false;
    this._cachedContactsChunk = null;
    this._cachedIconsChunk = null;
    this._listCurrentOffset = 0;
    this._actualDataCount = 0;
}

contactsApp.prototype._addFocusedItemToFavorites = function()
{    
    if (this._currentContextTemplate)
    {
        // Get current item in focus
        // Fetch contact id
        if(this._currentContext.ctxtId === "Contacts")
        {
            this._getfocusedMode = this._currentContextTemplate.list2Ctrl.getFocusMode();
            log.info("Value of getFocusMode "+this._getfocusedMode)
            
            if(this._getfocusedMode === "mainList")
            {
                log.info("In if condition after getting Main list  "+this._getfocusedMode)
                this._focused = this._currentContextTemplate.list2Ctrl.focussedItem;
                var contactName = this._currentContextTemplate.list2Ctrl.dataList.items[this._focused].appData.name;
                var contactId = this._currentContextTemplate.list2Ctrl.dataList.items[this._focused].appData.id;
                log.info("_addFocusedItemToFavorites called....Current focused element"+this._focused, +contactName, +contactId);
                
                if(this._focused)
                {
                    var paramsTommui = {"contactInfo":{"contactId":contactId,"contactName":contactName}};
                    framework.sendEventToMmui(this.uiaId, "SelectFavoritesContact", {payload : paramsTommui});
                }
                else
                {
                    log.debug("_addFocusedItemToFavoritescalled.....No item in focus");
                    framework.sendEventToMmui(this.uiaId, "NoFavoriteSelected");
                }
            }
            
            else
            {
                log.debug("_addFocusedItemToFavoritescalled.....No item in focus");
                framework.sendEventToMmui(this.uiaId, "NoFavoriteSelected");
            }
        }
        else
        {
            this._focused = this._currentContextTemplate.list2Ctrl.focussedItem;            
            if((this._focused >= 0)&&((this._focused+1) <= (this._totalListItemCountInDetails - 3)))
            {
                if((this._focused+1)  > this._phoneNumberListCount)
                {
                    var addressLine1 = this._currentContextTemplate.list2Ctrl.dataList.items[this._focused].appData.address.streetAddress.addressLine1;
                    //var addressLine2 = this._currentContextTemplate.list2Ctrl.dataList.items[this._focused].appData.address.streetAddress.addressLine2;
                    var city = this._currentContextTemplate.list2Ctrl.dataList.items[this._focused].appData.address.streetAddress.city;
                    var stateProvince = this._currentContextTemplate.list2Ctrl.dataList.items[this._focused].appData.address.streetAddress.stateProvince;
                    var country = this._currentContextTemplate.list2Ctrl.dataList.items[this._focused].appData.address.streetAddress.country;
                    var code = this._currentContextTemplate.list2Ctrl.dataList.items[this._focused].appData.address.streetAddress.code;                    
                    //inject event for address
                    var paramsTommui = {
                                           streetAddress:
                                           {
                                               addressLine1:addressLine1,
                                               addressLine2:"",
                                               city:city,
                                               stateProvince:stateProvince,
                                               country:country,
                                               code:code
                                           }
                                       };
                                       framework.sendEventToMmui(this.uiaId, "SelectFavoritesAddress", {payload : paramsTommui});
                }
                else
                {
                    var phoneNumber = this._currentContextTemplate.list2Ctrl.dataList.items[this._focused].appData.phoneNumber;        
                    //inject event for number
                    var paramsTommui = { phoneNumber : phoneNumber };
                    framework.sendEventToMmui(this.uiaId, "SelectFavoritesNumber", {payload : paramsTommui});
                }
            }
            else
            {
                framework.sendEventToMmui(this.uiaId, "NoFavoriteSelected");
            }
        }
    }
}

contactsApp.prototype._contactsIndex = function()
{
    if(this._isContactsDbOpen) // contacts were automatically or manually downloaded. List is not fetched from DB yet
    {
        //Send Get Contacts Request to DBAPI
        var params = {"deviceId":this._getDeviceId(), "sort":"OrderId","filter":"All"};
        framework.sendRequestToDbapi(this.uiaId, this._getContactsIndexCallbackFn.bind(this), "pb", "GetContactsIndex", params);
    }
    else
    {
        this._openDbConnection();
    }
}
//ContactDetailsgreyout function definition.
contactsApp.prototype._ContactsDetailsgreyOut = function()
{
    var count = this._totalListItemCountInDetails;
    this._ContactDetaildatalist.items[count-1].disabled = this._cachedVehicleAtSpeed;
    this._ContactDetaildatalist.items[count-2].disabled = this._cachedVehicleAtSpeed;
    this._currentContextTemplate.list2Ctrl.updateItems(0,count-1);    
};

//PopulateGreyOutbutton function Definition.
contactsApp.prototype._populateGreyOutbutton = function()
{
     if (this._currentContext.ctxtId === "RemoveContactConfirmation")
     {
         if(this._cachedVehicleAtSpeed)
         {
             this._currentContextTemplate.dialog3Ctrl.setDisabled("button2", true);
         }
         else
         {
            this._currentContextTemplate.dialog3Ctrl.setDisabled("button2", false);
         }
     }
     if (this._currentContext.ctxtId === "ImportErrorRetry")
     {
         if(this._cachedVehicleAtSpeed)
         {
             this._currentContextTemplate.dialog3Ctrl.setDisabled("button2", true);
         }
         else
         {
            this._currentContextTemplate.dialog3Ctrl.setDisabled("button2", false);
         }
     }
     if (this._currentContext.ctxtId === "DeleteError")
     {
         if(this._cachedVehicleAtSpeed)
         {
             this._currentContextTemplate.dialog3Ctrl.setDisabled("button2", true);
         }
         else
         {
            this._currentContextTemplate.dialog3Ctrl.setDisabled("button2", false);
         }
     }
};   
/**************************
 * Framework register
 **************************/
framework.registerAppLoaded("contacts", null, true);