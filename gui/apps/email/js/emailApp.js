/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: emailApp.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: avorotp / TCS
 Date: 29-June-2012
 __________________________________________________________________________

 Description: IHU GUI Email App

 Revisions:
 v0.1 (29-June-2012)
 v0.2 (14-Sep-2012) Contexts implementation for phase 1. -asethab
 v0.3 (08-oct-2012) Contexts implementation for phase 2. -asethab
 v0.4 (18-Jan-2013) Contexts implementation for phase 3.- asethab
 __________________________________________________________________________

 */

log.addSrcFile("emailApp.js", "email");
log.setLogLevel("email","debug");

/**********************************************
 * Start of Base App Implementation
 *
 * Code in this section should not be modified
 * except for function names based on the appname
 *********************************************/

function emailApp(uiaId)
{
    log.debug("constructor called...");
    // Base application functionality is provided in a common location via this call to baseApp.init().
    // See framework/js/BaseApp.js for details.
    baseApp.init(this, uiaId);

    // All feature-specific initialization is done in appInit()
}

/**************************
 * Standard App Functions *
 **************************/

/*
 * Called just after the app is instantiated by framework.
 */
emailApp.prototype.appInit = function()
{
    log.debug(" emailApp appInit called...");

    if (framework.debugMode)
    {
        utility.loadScript("apps/email/test/emailAppTest.js");
    }
    // Contact id's from database for contacts disambiguation
    this._contactIDlist = [
        {
            contactId : ""
        }
    ];
    // Phone Numbers for Phone Contact disambiguation
    this._phoneNumberList = [
        {
            phoneNumber : ""
        }
    ];
    //Account names and Id's
    this._accountsData = [
        {
            id : "",
            text : ""
        }
    ];
    //Preset message Id and text
    this._presetMsgObject = [
        {
            id : "",
            msgText : ""
        }
    ];
    // Id of the email
    this._emailIdForMsg = [
        {
            msgId : ""
        }
    ];
    // cache
    this._timeout = null;
    this._flag = false;
    this._dataListInboxItems = new Array();
    this._pause = true;
    this._cachedDownloadedMessageId = new Array();
    this._cachedDownloadedMessagesPayload = new Array();
    this._cachedPlaybackStatePayload = null;
    this._toData = new Array();
    this._cachedMailDetails = null;
    this._eventToMMUIOnSend = null;
    this._sendSuccess = true;
    this._eventFromUMP = null;
    this._cachedPresetMsgs = null;
    this._eventToMMUIInboxSelectorList = null;
    this._umpButtonConfig = new Object();
    this._prevInboxAcc = "";
    this._inboxAccount = "";
    this._emailId = null;
    this._cachedContacts = null;
    this._cachedPhoneContacts = null;
    this._newMessage = false;
    this._vehicleMotionState = null;
    this._isContactsDbOpen = false;
    this._phonenumbers = null;
    this._cachedErrorCondition = null;
    this._cachedErrorConditionRetry = null;
    this._PreviousCachedErrorConditionRetry = null;
    this._cachedInboxSelectorAccounts = null;
    this._deviceId = 0;
    this._ContactCount = null;
    this._contactIdList = new Array();
    this._cachedEmailDisambiguation = new Array();
    this._continueMessage = false;
    this._autoDownload = false;
    this._startLoading = false;
    this._cachedInstance = null;
    this._typeMask = null;
    this._contactID = null;
    this._tempFlag = true;
    this._isEmptyList = false;
    this._newMsgNotificationFromMMUI = false;
    this._winkMessageAlert = null;
    this._tempNextPrevFlag = true;
    this._requestFromDevice = false;
    this._mapConnected = false;
    this._cachedPlaybackState = null;
    this._callBackCalled = true;
    this._instanceDisconnected = false;
    this._disconnectedInstances = new Array();
    this._listErrorCondition = false;
    this._AppSDKErrorCondition = false;
    this._sendErrorCondition = false;
    this._deleteErrorCondition = false;
    this._contactsArray = new Array();
    this._disableRetryForSend = false;
    this._disableRetryForDelete = false;
    this._eventToMMUIOnUpdate = false;
    this._commonLoadingFlag = true;
    this._isMsgDisambiguate = false;
    this._instanceIdOfReply = null;
    this._instanceIdOfDetail = null;
    this._connectionIn = null;
    this.totalContactsCount = 0 ;
    this._newMsgReadOverDetail = false;
    this._AppSDKBusy = false;
    //@formatter:off
    this._umpButtonConfig["communication"] =
    {
        index : 0,
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpCommMenu",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectCommunication"
    };
    this._umpButtonConfig["inboxlist"] =
    {
        index : 1,
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpCurrentList",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectInbox",
        labelId : "Inbox"
    };
    this._umpButtonConfig["playpause"] =
    {
        index : 2,
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpPlayPause",
        currentState:"Play",
        stateArray: [
            {
                state:"Play", label:null, labelId: null
            }, 
            {
                state:"Pause", label:null, labelId: null
            }
        ],
        disabled : true,
        buttonClass : "normal",
        appData : "Play/Pause"
    };
    this._umpButtonConfig["prev"] =
    {
        index : 3,
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpPreviousAudio",
        disabled : true,
        buttonClass : "normal",
        appData : "Global.Previous"
    };
    this._umpButtonConfig["next"] =
    {
        index : 4,
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpNextAudio",
        disabled : true,
        buttonClass : "normal",
        appData : "Global.Next"
    };
    this._umpButtonConfig["reply"] =
    {
        index : 5,
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpReply",
        disabled : true,
        buttonClass : "normal",
        appData : "SelectReply"
    };
    this._umpButtonConfig["replyall"] =
    {
        index : 6,
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpReplyToAll",
        disabled : true,
        buttonClass : "normal",
        appData : "SelectReplyAll"
    };
    this._umpButtonConfig["call"] =
    {
        index : 7,
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpCall",
        disabled : true,
        buttonClass : "normal",
        appData : "SelectCall"
    };
    this._umpButtonConfig["delete"] =
    {
        index : 8,
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpDelete",
        disabled : true,
        buttonClass : "normal",
        appData : "SelectDelete"
    };
    //@formatter:on
    this._emailInboxCtxtDataList = {
        itemCountKnown : true,
        itemCount : 2,
        items: [
            { appData : "SelectImportEmail", text1Id : "DownloadedEmailMessages", itemStyle : "style02", image1 : "common/images/icons/IcnListImport_En.png", image2: "", "hasCaret" : false},
            { appData : "SelectInboxSelector", text1Id : null, text1SubMap : null, label1Id: "Inbox", itemStyle : "style14" , image1 : "common/images/icons/IcnListEmail_En.png", "hasCaret" : false, text1Align:"right"}
        ],
        vuiSupport : true
    };
    this._emailReplyCtxtDataList = {
        itemCountKnown : true,
        itemCount : 5,
        items: [
            { appData : "", text1Id : "To", text1SubMap : {To : ""}, itemStyle : "style17", disabled :true, hasCaret : false},
            { appData : "", text1Id : "From", text1SubMap : {From: ""}, itemStyle : "style17", disabled :true, hasCaret : false},
            { appData : "", text1Id : "Subject", text1SubMap : {Sub : ""}, itemStyle : "style17", disabled :true, hasCaret : false},
            { appData : "SelectMessage", text1Id : "Message", text1SubMap : {Msg : ""}, itemStyle : "style17", disabled :false, hasCaret : false},
            { appData : "SelectSendMessage", text1Id : "Send", itemStyle : "style20", disabled :true, hasCaret : false}
        ],
        vuiSupport : true
    };
    this._presetMessageListCtxtDataList = {
        itemCountKnown : true,
        itemCount : 0,
        items: [],
        vuiSupport : true
    };
    this._dataListInbox = {
        itemCountKnown : true,
        itemCount : 0,
        items: [],
        vuiSupport : true
        };
    this._contactsDisambiguationDataList = {
        itemCountKnown : true,
        itemCount : 0,
        items: [],
        vuiSupport : true
    };
    this._contactDisambiguationListCtxtDataList = {
        itemCountKnown : true,
        itemCount : 0,
        items: [],
        vuiSupport : true
    };
    this._msgDisambiguateCtxtDataList = {
        itemCountKnown : true,
        itemCount : 0,
        items: [],
        vuiSupport : true
    };
    //@formatter:off
    this._contextTable = {

        "EmailInbox" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack" ,
            "sbNameId" : "Email",
            "controlProperties": {
                "List2Ctrl" : {
                    "thickItems" : false,
                    "numberedList" : true,
                    "protectDataList" : true,
                    selectCallback : this._listItemClickCallback.bind(this)
                } // end of properties for "List2Ctrl"
            }, // end of list of controlProperties
            "readyFunction" : this._EmailInboxCtxtTmpltReadyToDisplay.bind(this)
        }, // end of "EmailInbox"

        "InboxSelector" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack" ,
            "sbNameId" : "Email",
            "controlProperties": {
                "List2Ctrl" : {
                    "titleConfiguration" : "listTitle",
                    "title" : {
                        text1Id : "InboxSelector",
                        titleStyle : "style02"
                    },
                    "thickItems" : false,
                    "numberedList" : true,
                    "dataList" : this._dataListInbox,
                    "selectCallback" : this._listItemClickCallback.bind(this)
                } // end of properties for "List2Ctrl"
            }, // end of list of controlProperties
            "readyFunction" : this._InboxSelectorCtxtTmpltReadyToDisplay.bind(this),
            "contextOutFunction" : this._InboxSelectorCtxtTmpltOutOfFocus.bind(this)
        }, // end of "InboxSelector"

        "EmailMessageDetail" : {
            "template" : "Messaging2Tmplt",
            "sbNameId" : "Email",
            "properties": 
            {
                leftButtonVisible: false,
            },
            "controlProperties": {
                "Messaging2Ctrl" : 
                {
                    "messageAttachments" : false,
                    "messageStyle" : "email",
                    "umpConfig" : 
                    {
                        "buttonConfig" : this._umpButtonConfig,
                        "defaultSelectCallback" : this._umpDefaultSelectCallback.bind(this),
                    } // end of umpConfig
                } // end of properties for "Messaging2Ctrl"
            }, // end of list of controlProperties
            "readyFunction" : this._EmailMessageDetailWithUmpCtxtTmpltReadyToDisplay.bind(this),
            "contextOutFunction" : this._EmailMessageDetailCtxtTmpltOutOfFocus.bind(this)
        }, // end of "EmailMessageDetail"

        "EmailReply" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack" ,
            "sbNameId" : "Email",
            "controlProperties": {
                "List2Ctrl" : {
                    "numberedList" : true,
                    "dataList":this._emailReplyCtxtDataList,
                    "titleConfiguration" : "listTitle",
                    title : {
                        text1Id : "Reply",
                        titleStyle : "style02"
                    },
                    "selectCallback" : this._listItemClickCallback.bind(this)
                } // end of properties for "ListCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._EmailReplyCtxtTmpltReadyToDisplay.bind(this),
            "contextOutFunction" : this._EmailReplyCtxtTmpltOutOfFocus.bind(this)
        }, // end of "EmailReply"

        "VUIConfirmSend" : {
            "template" : "Dialog3Tmplt",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),
                    "contentStyle" : "style02",
                    "buttonCount" : 2,
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "common.No",
                            appData : "Global.No"
                        },
                        "button2" : {
                            labelId : "common.Yes",
                            appData : "Global.Yes"
                        }
                    }, // end of buttonConfig
                    "text1Id" : "VUIConfirmSend"
                } // end of properties for "Dialog3Ctrl"
            }, // end of list of controlProperties
            "readyFunction" : this._VUIConfirmSendCtxtTmpltReadyToDisplay.bind(this),
        }, // end of "VUIConfirmSend"

        "PresetMessages" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack" ,
            "sbNameId" : "Email",
            "controlProperties": {
                "List2Ctrl" : {
                    "numberedList" : true,
                    "titleConfiguration" : "listTitle",
                    "title" : {
                        text1Id : "MessagePreset",
                        titleStyle : "style02"
                    },
                    "selectCallback" : this._listItemClickCallback.bind(this)
                } // end of properties for "ListCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._PresetMessagesListCtxtReadyToDisplay.bind(this),
            "contextOutFunction" : this._presetMessagesCtxtTmpltOutOfFocus.bind(this)
        }, // end of "PresetMessages"

        "DiscardConfirm" : {
            "template" : "Dialog3Tmplt",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "defaultSelectCallback" :  this._dialogDefaultSelectCallback.bind(this),
                    "contentStyle" : "style02",
                    "buttonCount" : 2,
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "common.No",
                            appData : "Global.No"
                        },
                        "button2" : {
                            labelId : "common.Yes",
                            appData : "Global.Yes"
                        }
                    }, // end of buttonConfig
                    "text1Id" : "DiscardConfirm"
                }// end of properties for "Dialog3Ctrl"
            },// end of list of controlProperties
            "readyFunction" : this._DiscardConfirmCtxtTmpltReadyToDisplay.bind(this)
        }, // end of "DiscardConfirm"

        "EmailDeleteConfirm" : {
            "template" : "Dialog3Tmplt",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),
                    "contentStyle" : "style02",
                    "buttonCount" : 2,
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "Back",
                            appData : "Global.GoBack"
                        },
                        "button2" : {
                            labelId : "Delete",
                            appData : "SelectDelete"
                        }
                    }, // end of buttonConfig
                    "text1Id" : "EmailDeleteConfirm"
                } // end of properties for "Dialog3Ctrl"
            }, // end of list of controlProperties
            "readyFunction" : this._EmailDeleteConfirmCtxtTmpltReadyToDisplay.bind(this),
        }, // end of "EmailDeleteConfirm"

        "UnfinishedEmailMessage" : {
            "template" : "Dialog3Tmplt",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),
                    "contentStyle" : "style02",
                    "buttonCount" : 2,
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "Return",
                            appData : "SelectReturn"
                        },
                        "button2" : {
                            labelId : "Discard",
                            appData : "SelectDiscard"
                        }
                    }, // end of buttonConfig
                    "text1Id" : "UnfinishedEmailMessage"
                } // end of properties for "Dialog3Ctrl"
            } // end of list of controlProperties
        }, // end of "UnfinishedEmailMessage"

        "ErrorCondition" : {
            "template" : "Dialog3Tmplt",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),
                    "contentStyle" : "style23",
                    "buttonCount" : 1,
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "common.Ok",
                            appData : "Global.Yes"
                        }
                    }, // end of buttonConfig
                    "text1Id" : null
                } // end of properties for "Dialog3Ctrl"
            }, // end of list of controlProperties
            "readyFunction" : this._ErrorConditionCtxtTmpltReadyToDisplay.bind(this),
            "contextInFunction" : this._ErrorConditionContextInFunction.bind(this)
        }, // end of "ErrorCondition"

        "ErrorConditionRetry" : {
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
                            labelId : "Retry",
                            appData : "SelectRetry"
                        }
                    }, // end of buttonConfig
                    "text1Id" : null,
                    "text2Id" : null
                } // end of properties for "Dialog3Ctrl"
            }, // end of list of controlProperties
            "readyFunction" : this._ErrorConditionRetryCtxtTmpltReadyToDisplay.bind(this),
            "contextInFunction" : this._ErrorConditionRetryContextInFunction.bind(this)
        }, // end of "ErrorConditionRetry"

        "ContactsDisambiguation" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack" ,
            "sbNameId" : "Email",
            "controlProperties": {
                "List2Ctrl" : {
                    "numberedList" : true,
                    "dataList": this._contactsDisambiguationDataList,
                    selectCallback : this._listItemClickCallback.bind(this),
                    "titleConfiguration" : "listTitle",
                    title : {
                        text1Id : "SelectContact",
                        titleStyle : "style02"
                    }
                } // end of properties for "ListCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._ContactsDisambiguationCtxtReadyToDisplay.bind(this),
            "contextInFunction" : this._ContactsDisambiguationContextInFunction.bind(this)
        }, // end of "ContactsDisambiguation"

        "ContactPhoneDisambiguation" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack" ,
            "sbNameId" : "TextMessages",
            "controlProperties": {
                "List2Ctrl" :{
                    "thickItems" : false,
                    "numberedList" : true,
                    "dataList" : this._contactDisambiguationListCtxtDataList,
                    "selectCallback" : this._listItemClickCallback.bind(this),
                    "titleConfiguration" : "listTitle",
                    title : {
                        text1Id : null,
                        titleStyle : "style05",
                        image1 : null
                     }
                } // end of properties for "ListCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._ContactPhoneDisambiguationCtxtReadyToDisplay.bind(this),
            "contextOutFunction" : this._ContactPhoneDisambiguationCtxtTmpltOutOfFocus.bind(this)
        }, // end of "ContactPhoneDisambiguation"

        "EmailDisambiguation" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack" ,
            "sbNameId" : "Email",
            "controlProperties": {
                "List2Ctrl" : {
                    "numberedList" : true,
                    "dataList" : this._msgDisambiguateCtxtDataList,
                    selectCallback : this._listItemClickCallback.bind(this),
                    "titleConfiguration" : 'listTitle',
                    title : {
                        text1Id : "SelectMessage",
                        titleStyle : "style02"
                    }
                } // end of properties for "ListCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._EmailDisambiguationCtxtReadyToDisplay.bind(this),
            "contextOutFunction" : this._EmailDisambiguationCtxtTmpltOutOfFocus.bind(this)
        } // end of "EmailDisambiguation"
    }; // end of this._contextTable

    this._messageTable = {
        "AppDownloadedMessagesPayload" : this._DownloadedMessagesPayloadMsgHandler.bind(this),
        "ListRequestRejected" : this._ListRequestRejectedHandler.bind(this),
        "SelectEmailItemPayload" : this._MailDetailsMsgHandler.bind(this),
        "NewMsgReadOverDetail" : this._NewMsgReadOverDetail.bind(this),
        "AppsdkListAvailable" : this._AppsdkListAvailable.bind(this),
        "SelectInboxSelectorPayload" : this._InboxSelectorMsgHandler.bind(this),
        "SelectReplyPayload" : this._ReplyMsgHandler.bind(this),
        "SelectReplyAllPayload" : this._ReplyAllMsgHandler.bind(this),
        "DraftMessageData" : this._UpdateEmailReplyContextHandler.bind(this),
        "NotificationPayload" : this._SendNotificationHandler.bind(this),
        "ContactPhoneDisambiguationPayload" : this._ContactPhoneDisambiguationHandler.bind(this),
        "PlayBackState" : this._PlaybackStateHandler.bind(this),
        "MainListAccountDetails" : this._OneAccountDetailsHandler.bind(this),
        "RequestFromDevice" : this._RequestFromDeviceHandler.bind(this),
        "ContinueMessagePayload" : this._ContinueMessagePayloadHandler.bind(this),
        "Global.AtSpeed" : this._AtSpeedHandler.bind(this),
        "Global.NoSpeed" : this._NoSpeedHandler.bind(this),
        "AutoDownloadStatus" : this._AutoDownloadStatusHandler.bind(this),
        "InstanceDisconnected" : this._InstanceDisconnectedHandler.bind(this),
        "DisableRetryForSend" : this._DisableRetryForSendHandler.bind(this),
        "DisableRetryForDelete" : this._DisableRetryForDeleteHandler.bind(this),
        "SentStatusPayload" : this._SentStatusPayloadHandler.bind(this),
        // SBN messages
        "SBNAutoDownloadComplete" : this._AutoDownloadCompleteStateHandler.bind(this),
        "SBNMessageSentStatus" :this._MessageSentStatusHandler.bind(this),
        //VUI Messages
        "VUI_Action_Update_To_GUI" : this._VUIActionUpdateToGUIHandler.bind(this),
        //TUI Messages
        "TUI_Action_Update_To_GUI" : this.TUIActionUpdateToGUIHandler.bind(this)
    }; // end of this._messageTable
    //@formatter:on
};
/**************************
 * General App Functions
 **************************/
//Destroy Control
emailApp.prototype._destroyControl = function(controlObj)
{
    if (!controlObj)
    {
        log.info("control object passed as null");
        return;
    }
    log.info("DestroyControl called for control: " + controlObj.divElt.id);
    controlObj.cleanUp();
    utility.removeHTMLElement(controlObj.divElt.id);
};

//Disable UMP buttons
emailApp.prototype._disableUMPButtons = function()
{
    log.info("Disabling all UMP buttons!!!");
    this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("playpause", true);
    this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("reply", true);
    this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("replyall", true);
    this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("call", true);
    this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("delete", true);
};

/*
 * This function is called by Common whenever a msgType="alert" comes from MMUI.
 * This function should return a properties Object to use for the WinkCtrl.
 */
emailApp.prototype.getWinkProperties = function(alertId, params)
{
    log.info("common is looking for wink properties:", alertId, params);
    var winkProperties = null;
    switch(alertId)
    {
        case "GUI_EmailSent_Alert":
            log.debug("Email successfully sent. Now displaying sent success wink.");
            winkProperties = {
                "style": "style03",
                "text1Id": "EmailSent",
            };
            this._sendSuccess = true;
            if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailReply")
            {
                if(this._cachedReplyDetails)
                {
                    log.debug("Populating Email Reply and enabling send button.");
                    this._populateReply(this._cachedReplyDetails);
                }
            }
            if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "VUIConfirmSend")
            {
                log.info("Enabling Yes of VUIConfirmSend screen because previous message is successfully sent.");
                this._currentContextTemplate.dialog3Ctrl.setDisabled("button2",false);
            }
            break;
        default:
            // if alertId cannot be found, winkProperties will return null and Common will display default Wink
            log.info("Cannot provide properties for unrecognized alertId: " + alertId);
            break;
    }
    // return the properties to Common
    return winkProperties;
};

//Clear Values of any particular error on Error condition retry screen
emailApp.prototype._clearOnCancel = function(errorConditionRetryType)
{
    log.info("Inside clearOnCancel() function...");
    log.info("Clearing Values of error type = " +errorConditionRetryType+ " on Error condition retry screen...");
    this._eventToMMUIInboxSelectorList = null;
    switch(errorConditionRetryType)
    {
        case "EMAIL_MSG_LISTDOWNLOAD_FAIL_NON_CACHED":
        case "EMAIL_MSG_LISTDOWNLOAD_FAIL_CACHED":
            log.debug("value of this._prevInboxAcc= "+this._prevInboxAcc);
            if(this._cachedInstance)
            {
                this._inboxAccount = this._prevInboxAcc;
            }
            else
            {
                this._prevInboxAcc = this._inboxAccount;
            }
            this._startLoading = false;
            this._eventToMMUIOnUpdate = false;
            this._listErrorCondition = false;
            break;
        case "EMAIL_MSG_LISTDOWNLOAD_FAIL_APPSDK":
            this._cachedInstance = null;
            this._eventToMMUIOnUpdate = false;
            this._AppSDKErrorCondition = false;
            break;
        case "EMAIL_MSG_SEND_FAIL_Type":
            this._eventToMMUIOnSend = null;
            this._disableRetryForSend = false;
            this._sendSuccess = true;
            this._sendErrorCondition = false;
            break;
        case "EMAIL_MSG_DELETE_FAIL_Type":
            this._disableRetryForDelete = false;
            this._eventFromUMP = null;
            this._deleteErrorCondition = false;
            break;
        default:
            log.info("The error : " +errorConditionRetryType+ " is not handled.");
            break;
    }
};

/**************************
 * Context handlers
 **************************/

// EmailInbox Context.
emailApp.prototype._EmailInboxCtxtTmpltReadyToDisplay = function(params)
{
    log.info("EmailInboxCtxtTmpltReadyToDisplay called...");
    log.info("Value of this._connectionIn inside EmailInboxCtxtTmpltReadyToDisplay = "+this._connectionIn );
    log.info("Value of this._cachedInstance inside EmailInboxCtxtTmpltReadyToDisplay = "+this._cachedInstance );
    log.info("Value of this._callBackCalled inside EmailInboxCtxtTmpltReadyToDisplay = "+this._callBackCalled);
    log.info("Value of this._autoDownload inside EmailInboxCtxtTmpltReadyToDisplay = "+this._autoDownload );
    log.info("Value of this._eventFromUMP inside EmailInboxCtxtTmpltReadyToDisplay = "+this._eventFromUMP );
    log.info("Value of this._requestFromDevice inside EmailInboxCtxtTmpltReadyToDisplay = "+this._requestFromDevice);
    log.info("Value of this._newMsgReadOverDetail inside EmailInboxCtxtTmpltReadyToDisplay = "+this._newMsgReadOverDetail);
    this._isEmptyList = false;
    this._disableRetryForSend = false;
    this._disableRetryForDelete = false;
    this._cachedDownloadedMessageId = new Array();
    this._cachedDownloadedMessagesPayload = new Array();
    this._typeMask = 0;
    this._contactID = 0;
    if(this._eventToMMUIInboxSelectorList === "SelectAccountName" || this._eventToMMUIInboxSelectorList === "SelectAllAccounts")
    {
        if(this._cachedInstance && this._callBackCalled)
        {
            this._callBackCalled = false;
            this._cachedInstance = this._emailId;
            log.debug("Calling populateEmailInboxList function with empty list from EmailInboxCtxtTmpltReadyToDisplay and rotating indeterminate meter.");
            this._startLoading = true;
            this._populateEmailInboxList(this._cachedDownloadedMessagesPayload);
            if(this._eventFromUMP == "SelectDelete")
                this._AppSDKBusy = true;
            if(this._eventFromUMP !== "SelectDelete")
            {
                var params = 
                {
                    "connection_in": this._connectionIn,
                    "context_in": 0,
                    "filter_sz": 
                    {
                        "sender_sz":
                        {
                            "addressList_sz": 
                            {
                                "addresses_sz": 1
                            }
                        }
                    }, 
                    "filter": 
                    {
                        "instanceID": this._cachedInstance,
                        "sender": 
                        {
                            "typeMask": this._typeMask,
                            "contactID" : this._contactID,
                            "addressList": 
                            {
                                "count":1, 
                                "addresses": 
                                [
                                    {
                                        "type": 1, 
                                        "subTypeMask": 0,
                                        "address": ""
                                    }
                                ]
                            }
                        }
                    }, 
                    "request_type": 1
                };
                log.debug("Sending GetMessageList request to AppSDK when selected Inbox Selector");
                framework.sendRequestToAppsdk(this.uiaId, this._downloadMessageCallbackFn.bind(this),"msg","GetMessageList", params);
            }
        }
        else
        {
            log.info("Populating Email Inbox list when selected Inbox Selector");
            this._populateEmailInboxList(this._cachedDownloadedMessagesPayload);
        }
    }
    else if (this._autoDownload === true && this._callBackCalled && this._mapConnected === true && this._eventFromUMP !== "SelectDelete"
            && !this._newMsgReadOverDetail)
    {
        if(this._requestFromDevice === true)
        {
            if(this._flag)
            {
                this._inboxAccount = "All Inboxes";
            }
            else
            {
                log.debug("this._inboxAccount= " +this._inboxAccount);
                this._inboxAccount = "";
            }
            log.debug("this._inboxAccount= " +this._inboxAccount);
            this._requestFromDevice = false;
            this._eventToMMUIOnUpdate = true;
            this._startLoading = true;
            this._populateEmailInboxList(this._cachedDownloadedMessagesPayload);
            this._callBackCalled = false;
            log.debug("AutoDownload = TRUE :: Calling populateEmailInboxList function with empty list from EmailInboxCtxtTmpltReadyToDisplay and rotating indeterminate meter.");
            framework.sendEventToMmui(this.uiaId, "SelectImportEmail");
        }
        else if(this._cachedInstance)
        {
            this._callBackCalled = false;
            log.debug("AutoDownload = TRUE :: Calling populateEmailInboxList function with empty list from EmailInboxCtxtTmpltReadyToDisplay and rotating indeterminate meter.");
            this._startLoading = true;
            this._populateEmailInboxList(this._cachedDownloadedMessagesPayload);
            var params = 
            {
                "connection_in": this._connectionIn,
                "context_in": 1,
                "filter_sz": 
                {
                    "sender_sz":
                    {
                         "addressList_sz":
                        {   
                            "addresses_sz": 1
                        }
                    }
                }, 
                "filter": 
                {
                    "instanceID": this._cachedInstance,
                    "sender": 
                    {
                        "typeMask": this._typeMask,
                        "contactID" : this._contactID,
                        "addressList": 
                        {
                            "count":1,
                            "addresses":
                            [
                                {
                                    "type": 0,
                                    "subTypeMask":0,
                                    "address":""
                                }
                            ]
                        }
                    }
                }, 
                "request_type": 1
            };
            log.debug("AutoDownload = TRUE :: Sending GetMessageList request to AppSDK with params: " , params , "inside EmailInboxCtxtTmpltReadyToDisplay");
            framework.sendRequestToAppsdk(this.uiaId, this._downloadMessageCallbackFn.bind(this), "msg", "GetMessageList", params);
        }
        else
        {
            log.info("AutoDownload = TRUE :: Populating EmailInbox List ctrl from EmailInboxCtxtTmpltReadyToDisplay");
            this._populateEmailInboxList(this._cachedDownloadedMessagesPayload);
        }
    }
    else if (this._cachedInstance && this._callBackCalled && this._autoDownload === false && this._eventFromUMP !== "SelectDelete"
            && !this._newMsgReadOverDetail)
    {
        log.debug("AutoDownload = FALSE :: Calling populateEmailInboxList function with empty list from EmailInboxCtxtTmpltReadyToDisplay rotating indeterminate meter.");
        this._callBackCalled = false;
        this._startLoading = true;
        this._populateEmailInboxList(this._cachedDownloadedMessagesPayload);
        var params = 
        {
            "connection_in": this._connectionIn,
            "context_in": 0,
            "filter_sz": 
            {
                "sender_sz":
                {
                    "addressList_sz": 
                    {
                        "addresses_sz": 1
                    }
                }
            }, 
            "filter": 
            {
                "instanceID": this._cachedInstance,
                "sender": 
                {
                    "typeMask": this._typeMask,
                    "contactID": this._contactID,
                    "addressList": 
                    {
                        "count":1, 
                        "addresses": 
                        [
                            {
                                "type": 1, 
                                "subTypeMask": 0,
                                "address": ""
                            }
                        ]
                    }
                }
            }, 
            "request_type": 1
        };
        log.debug("AutoDownload = FALSE :: Sending GetMessageList request to AppSDK with params: " ,params, "inside EmailInboxCtxtTmpltReadyToDisplay");
        framework.sendRequestToAppsdk(this.uiaId, this._downloadMessageCallbackFn.bind(this),"msg","GetMessageList", params);
    }
    else
    {
        log.debug("Populating Email Inbox list in EmailInboxCtxtTmpltReadyToDisplay");
        if(this._newMsgReadOverDetail && this._eventFromUMP !== "SelectDelete" && (this._autoDownload === true || this._cachedInstance)) 
            this._startLoading = true;
        this._populateEmailInboxList(this._cachedDownloadedMessagesPayload);
    }
};

// EmailMessageDetail Context.
emailApp.prototype._EmailMessageDetailWithUmpCtxtTmpltReadyToDisplay = function()
{
    if (this._currentContextTemplate)
    {
        log.debug("emailApp EmailMessageDetailWithUmpCtxtTmpltReadyToDisplay called...");
        //temp Code commented (for TTS thing)
        /*this._eventFromUMP = null;
        this._pause = true;
        this._tempFlag = true;
        this._cachedPlaybackState = null;*/
        this._eventFromUMP = null;
        this._vehicleMotionState = framework.common.getAtSpeedValue();
        this._disableUMPButtons();
        this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("next", true);
        this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("prev", true);
        log.info("value of this._vehicleMotionState from Common = "+this._vehicleMotionState);
        // The below function is necessary to call in case of new message
        // If we are already in message display and suddenly new message comes up,
        // then all fields will first get blank and then the new message details will be displayed.
        this._populateEmailMessageDetail(this._cachedMailDetails);
    }
};

//EmailMessageDetail Context Out Of Focus
emailApp.prototype._EmailMessageDetailCtxtTmpltOutOfFocus = function()
{
    log.info("EmailMessageDetailCtxtTmpltOutOfFocus called.");
    this._cachedMailDetails = null;
};

// InboxSelector Context.
emailApp.prototype._InboxSelectorCtxtTmpltReadyToDisplay = function()
{
    log.debug("InboxSelectorCtxtTmpltReadyToDisplay is called");
    log.info("this._cachedInboxSelectorAccounts is = " +this._cachedInboxSelectorAccounts);
    this._dataListInboxItems = new Array();
    if(this._cachedInboxSelectorAccounts)
    {
        this._populateInboxSelectorAccounts(this._cachedInboxSelectorAccounts);
    }
};

//InboxSelector Context Out of Focus.
emailApp.prototype._InboxSelectorCtxtTmpltOutOfFocus = function()
{
    log.info("InboxSelectorCtxtTmpltOutOfFocus called");
    this._cachedInboxSelectorAccounts = null;
};

// EmailReply Context.
emailApp.prototype._EmailReplyCtxtTmpltReadyToDisplay = function()
{
    log.debug("Inside EmailReplyCtxtTmpltReadyToDisplay");
    log.debug("Populating Email Reply from EmailReplyCtxtTmpltReadyToDisplay");
    this._populateReply(this._cachedReplyDetails); 
};

//EmailReply Context Out of Focus.
emailApp.prototype._EmailReplyCtxtTmpltOutOfFocus = function()
{
    log.info("EmailReplyCtxtTmpltOutOfFocus called");
    this._cachedReplyDetails = null;
};

// MsgPresetList Context.
emailApp.prototype._PresetMessagesListCtxtReadyToDisplay = function()
{
    log.debug("Inside PresetMessagesListCtxtReadyToDisplay");
    log.debug("value of this._connectionIn in preset messages is = "+this._connectionIn);
    this._presetMsgObject = [
        {
            id : "",
            msgText : ""
        }
    ];
    log.debug("Populating empty Preset Message List from PresetMessagesListCtxtReadyToDisplay");
    var params = 
    {
        "connection_in": this._connectionIn,
        "context_in": 0,
        "type": 0
    };
    framework.sendRequestToAppsdk(this.uiaId, this._ShowPresetMessageCallbackFn.bind(this), "msg", "GetPresetMessageList", params);
};

//PresetMessages Context Template Out Of Focus
emailApp.prototype._presetMessagesCtxtTmpltOutOfFocus = function()
{
    log.info("PresetMessagesCtxtTmpltOutOfFocus called.");
    this._cachedPresetMsgs = null;
};

//Discard Confirm Context Ready To Display
emailApp.prototype._DiscardConfirmCtxtTmpltReadyToDisplay = function()
{
    log.debug("Inside _DiscardConfirmCtxtTmpltReadyToDisplay");
    if(this._instanceDisconnected)
    {
        log.debug("Disable No button because instance is disconnected.");
        this._currentContextTemplate.dialog3Ctrl.setDisabled("button1",true);
        this._currentContextTemplate.dialog3Ctrl._selectBtn(1);
    }
    else
    {
        this._currentContextTemplate.dialog3Ctrl.setDisabled("button1",false);
    }
};

//Email Delete Confirm Context Ready To Display
emailApp.prototype._EmailDeleteConfirmCtxtTmpltReadyToDisplay = function()
{
    log.debug("Inside _EmailDeleteConfirmCtxtTmpltReadyToDisplay");
    if(this._instanceDisconnected)
    {
        log.debug("Disable Yes button because instance is disconnected.");
        this._currentContextTemplate.dialog3Ctrl.setDisabled("button2",true);
    }
    else
    {
        this._currentContextTemplate.dialog3Ctrl.setDisabled("button2",false);
    }
};

//VUIConfirmSend Context Ready To Display
emailApp.prototype._VUIConfirmSendCtxtTmpltReadyToDisplay = function()
{
    log.debug("Inside _VUIConfirmSendCtxtTmpltReadyToDisplay");
    if(this._instanceDisconnected || !this._sendSuccess)
    {
        log.debug("Disable Yes button because instance is disconnected.");
        this._currentContextTemplate.dialog3Ctrl.setDisabled("button2",true);
    }
    else
    {
        this._currentContextTemplate.dialog3Ctrl.setDisabled("button2",false);
    }
};

//Contacts Disambiguation Context In function
emailApp.prototype._ContactsDisambiguationContextInFunction = function(msg)
{
    log.info("Inside ContactsDisambiguationContextInFunction");
    if(msg && msg.params && msg.params.payload && msg.params.payload.ContactListDetails)
    {
        this._ContactCount = null;
        this._contactIdList = new Array();
        this._cachedContacts = msg.params.payload.ContactListDetails;
    }
};

// ContactsDisambiguation Context.
emailApp.prototype._ContactsDisambiguationCtxtReadyToDisplay = function()
{
    log.debug("ContactsDisambiguationCtxtReadyToDisplay called");
    log.info("value of this._isContactsDbOpen inside ContactsDisambiguationCtxtReadyToDisplay = " +this._isContactsDbOpen);
    this._contactsArray = new Array();
    if (this._isContactsDbOpen)
    {
        log.info(" Inside ContactsDisambiguationCtxtReadyToDisplay, DB access is no more required. close the DB");
        var params = {"deviceId": this._deviceId};
        framework.sendRequestToDbapi(this.uiaId, this._closeContactsDbCallbackFn.bind(this), "pb", "CloseContactsDb", params);
    }
    else
    {
        log.info("Populating populateContactsDisambiguationCtxt from ContactsDisambiguationCtxtReadyToDisplay because db is already close.");
        this._populateContactsDisambiguationCtxt(this._cachedContacts);
    }
};

// Contact PhoneDisambiguate ReadyToDisplay Context.
emailApp.prototype._ContactPhoneDisambiguationCtxtReadyToDisplay = function()
{
    log.debug("Inside Contact PhoneDisambiguate Context ReadyToDisplay");
    this._populateContactPhoneDisambiguation(this._cachedPhoneContacts);
};

//Contact PhoneDisambiguate Out of Focus Context.
emailApp.prototype._ContactPhoneDisambiguationCtxtTmpltOutOfFocus = function()
{
    log.debug("Inside Contact PhoneDisambiguate Context OutOfFocus");
    this._cachedPhoneContacts = null;
};

// EmailDisambiguation Context.
emailApp.prototype._EmailDisambiguationCtxtReadyToDisplay = function()
{
    log.info("Inside EmailDisambiguationCtxtReadyToDisplay");
    this._populateEmailDisambiguation(this._cachedEmailDisambiguation);
};

//EmailDisambiguation Context Out of Focus.
emailApp.prototype._EmailDisambiguationCtxtTmpltOutOfFocus = function()
{
    log.info("EmailDisambiguationCtxtTmpltOutOfFocus called");
    this._commonLoadingFlag = true;
    this._cachedEmailDisambiguation = new Array();
};

//ErrorCondition Context In function
emailApp.prototype._ErrorConditionContextInFunction = function(msg)
{
    log.debug("Inside ErrorConditionContextInFunction");
    if(msg && msg.params && msg.params.payload && msg.params.payload.errorConditionType)
    {
        this._cachedErrorCondition = msg.params.payload.errorConditionType;
    }
};

//ErrorCondition context
emailApp.prototype._ErrorConditionCtxtTmpltReadyToDisplay = function()
{
    log.info("Inside ErrorConditionCtxtTmpltReadyToDisplay" +this._cachedErrorCondition);
    if(this._cachedErrorCondition)
    {
        this._populateDialogCtrl();
    }
};

//ErrorConditionRetry Context In function
emailApp.prototype._ErrorConditionRetryContextInFunction = function(msg)
{
    log.debug("Inside ErrorConditionRetryContextInFunction");
    if(msg && msg.params && msg.params.payload && msg.params.payload.errorConditionType)
    {
        this._cachedErrorConditionRetry = msg.params.payload.errorConditionType;
    }
};

//ErrorConditionRetry context
emailApp.prototype._ErrorConditionRetryCtxtTmpltReadyToDisplay = function()
{
    log.info("Inside ErrorConditionRetryCtxtTmpltReadyToDisplay");
    log.info("Value of this._cachedErrorConditionRetry = " +this._cachedErrorConditionRetry);
    log.info("Value of this._PreviousCachedErrorConditionRetry = " +this._PreviousCachedErrorConditionRetry);
    this._currentContextTemplate.dialog3Ctrl.setDisabled("button2",false);
    if(this._cachedErrorConditionRetry)
    {
        if(this._PreviousCachedErrorConditionRetry == null)
        {
            this._PreviousCachedErrorConditionRetry = this._cachedErrorConditionRetry;
        }
        else
        {
            this._clearOnCancel(this._PreviousCachedErrorConditionRetry);
            this._PreviousCachedErrorConditionRetry = this._cachedErrorConditionRetry;
        }
        
    }
    else
    {
        this._cachedErrorConditionRetry = this._PreviousCachedErrorConditionRetry;
    }
    this._populateDialogCtrl();
    this._cachedErrorConditionRetry = null;
};

/**************************
 * Message handlers
 **************************/

// Downloaded messages payload handler.
emailApp.prototype._DownloadedMessagesPayloadMsgHandler = function(msg)
{
    log.debug("DownloadedMessagesPayloadMsgHandler called");
    log.info("Value of this._autoDownload inside DownloadedMessagesPayloadMsgHandler is = " +this._autoDownload);
    var cachedNumber = null;
    this._isEmptyList = false;
    this._callBackCalled = true;
    this._cachedDownloadedMessagesPayload = new Array();
    this._cachedDownloadedMessageId = new Array();
    this._cachedEmailDisambiguation = new Array();
    if(this._AppSDKBusy)
    {
        this._AppSDKBusy = false;
        this._eventFromUMP = null;
        if (this._cachedInstance && this._callBackCalled)
        {
            log.debug("Calling _populateEmailInboxList function with empty list from AppsdkListAvailable and rotating indeterminate meter.");
            this._callBackCalled = false;
            var params = 
            {
                "connection_in": this._connectionIn,
                "context_in": 0,
                "filter_sz": 
                {
                    "sender_sz":
                    {
                        "addressList_sz": 
                        {
                            "addresses_sz": 1
                        }
                    }
                }, 
                "filter": 
                {
                    "instanceID": this._cachedInstance,
                    "sender": 
                    {
                        "typeMask": 0,
                        "contactID": 0,
                        "addressList": 
                        {
                            "count":1, 
                            "addresses": 
                            [
                                {
                                    "type": 1, 
                                    "subTypeMask": 0,
                                    "address": ""
                                }
                            ]
                        }
                    }
                }, 
                "request_type": 1
            };
            log.debug("Sending GetMessageList request to AppSDK with params: " , params , "inside AppsdkListAvailable");
            framework.sendRequestToAppsdk(this.uiaId, this._downloadMessageCallbackFn.bind(this), "msg", "GetMessageList", params);
        }
    }
    else
    {
        if(msg && msg.params && msg.params.payload && msg.params.payload.messageList)
        {
            log.info("inside check of messageList");
            cachedNumber = msg.params.payload.messageList;
            if(cachedNumber)
            {
                this._showEmailInbox(cachedNumber);
            }
        }
    }
};

//Request Rejected for List from BLM. Hence requesting list from AppSDK
emailApp.prototype._ListRequestRejectedHandler = function()
{
    log.debug("ListRequestRejectedHandler called");
    log.debug("Value of this._autoDownload inside ListRequestRejectedHandler is = " +this._autoDownload);
    this._isEmptyList = false;
    this._callBackCalled = true;
    this._cachedDownloadedMessagesPayload = new Array();
    this._cachedDownloadedMessageId = new Array();
    this._cachedInstance = 65535;
    this._typeMask = 0;
    this._contactID = 0;
    var params = 
    {
        "connection_in": this._connectionIn,
        "context_in": 1,
        "filter_sz": 
        {
            "sender_sz":
            {
                 "addressList_sz":
                {   
                    "addresses_sz": 1
                }
            }
        }, 
        "filter": 
        {
            "instanceID": this._cachedInstance,
            "sender": 
            {
                "typeMask": this._typeMask,
                "contactID" : this._contactID,
                "addressList": 
                {
                    "count":1,
                    "addresses":
                    [
                        {
                            "type": 0,
                            "subTypeMask":0,
                            "address":""
                        }
                    ]
                }
            }
        }, 
        "request_type": 1
    };
    log.debug("Sending GetMessageList request to AppSDK from ListRequestRejectedHandler with params: " ,params);
    this._callBackCalled = false;
    framework.sendRequestToAppsdk(this.uiaId, this._downloadMessageCallbackFn.bind(this), "msg", "GetMessageList", params);
};

// PlaybackStateHandler
emailApp.prototype._PlaybackStateHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.messagePlaybackState)
    {
        log.debug("Inside PlaybackStateHandler..");
        this._cachedPlaybackStatePayload = msg.params.payload.messagePlaybackState;
        log.info("Playback Status is =" +this._cachedPlaybackStatePayload);
        if(this._cachedPlaybackStatePayload === "MSG_MESSAGE_PLAYBACK_STATUS_STARTED")
        {
            log.debug("Pause is false..");
            this._pause = false;
            this._tempFlag = false;
            if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailMessageDetail")
            {
                this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonState("playpause", "Pause");
            }
        }
        else if(this._cachedPlaybackStatePayload === "MSG_MESSAGE_PLAYBACK_STATUS_STOPPED" || 
                this._cachedPlaybackStatePayload === "MSG_MESSAGE_PLAYBACK_STATUS_COMPLETE"||
                this._cachedPlaybackStatePayload === "MSG_MESSAGE_PLAYBACK_STATUS_PAUSED")
        {
            log.debug("Pause is true..");
            this._pause = true;
            this._tempFlag = true;
            if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailMessageDetail")
            {
                this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonState("playpause", "Play");
            }
        }
        else if(this._cachedPlaybackStatePayload === "MSG_MESSAGE_PLAYBACK_STATUS_FAILED" || 
                this._cachedPlaybackStatePayload === "MSG_MESSAGE_PLAYBACK_STATUS_REJECTED" ||
                this._cachedPlaybackStatePayload === "MSG_MESSAGE_PLAYBACK_STATUS_TIMEOUT")
        {
            this._cachedPlaybackState = "error";
        }
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailMessageDetail")
        {
            if(this._eventFromUMP !== "Play/Pause" 
               && this._eventFromUMP !== "Global.Previous"
               && this._eventFromUMP !== "Global.Next")
             {
                 log.info("Handling Playback State of Play and Pause");
                 this._populateEmailMessageDetail(this._cachedMailDetails);
             }
        }
    }
};

// Email item payload handler.
emailApp.prototype._MailDetailsMsgHandler = function(msg)
{
    log.debug("MailDetails received", msg);
    if(msg && msg.params && msg.params.payload)
    {
        this._cachedMailDetails = msg.params.payload;
        if(this._cachedMailDetails)
        {
            if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailMessageDetail")
            {
                log.debug("Populating EmailMessageDetail....");
                this._populateEmailMessageDetail(this._cachedMailDetails);
            }
        }
    }
};

//Clearing cache i.e. this._cachedMailDetails when clicked on Read from new message notification popup
emailApp.prototype._NewMsgReadOverDetail = function()
{
    //log.info("Clearing cache i.e. this._cachedMailDetails when clicked on Read from new message notification popup.");
    log.info("_NewMsgReadOverDetail called");
    this._newMsgReadOverDetail = true;
    this._cachedMailDetails = null;
};

//_AppsdkListAvailable message
emailApp.prototype._AppsdkListAvailable = function()
{
    log.info("_AppsdkListAvailable called");
    this._newMsgReadOverDetail = false;
    if(this._autoDownload === true && this._cachedInstance == null)
    {
        this._cachedInstance = 65535;
    }
    if (this._cachedInstance && this._callBackCalled && this._eventFromUMP !== "SelectDelete")
    {
        log.debug("Calling _populateEmailInboxList function with empty list from AppsdkListAvailable and rotating indeterminate meter.");
        this._callBackCalled = false;
        var params = 
        {
            "connection_in": this._connectionIn,
            "context_in": 0,
            "filter_sz": 
            {
                "sender_sz":
                {
                    "addressList_sz": 
                    {
                        "addresses_sz": 1
                    }
                }
            }, 
            "filter": 
            {
                "instanceID": this._cachedInstance,
                "sender": 
                {
                    "typeMask": 0,
                    "contactID": 0,
                    "addressList": 
                    {
                        "count":1, 
                        "addresses": 
                        [
                            {
                                "type": 1, 
                                "subTypeMask": 0,
                                "address": ""
                            }
                        ]
                    }
                }
            }, 
            "request_type": 1
        };
        log.debug("Sending GetMessageList request to AppSDK with params: " , params , "inside AppsdkListAvailable");
        framework.sendRequestToAppsdk(this.uiaId, this._downloadMessageCallbackFn.bind(this), "msg", "GetMessageList", params);
    }
};

//EmailInbox Account Details Handler. 
emailApp.prototype._OneAccountDetailsHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.accountDetails)
    {
        if(msg.params.payload.accountDetails.name && msg.params.payload.accountDetails.id)
        {
            this._inboxAccount = msg.params.payload.accountDetails.name;
            this._emailId = msg.params.payload.accountDetails.id;
            if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "EmailInbox")
            {
                this._populateEmailInboxList(this._cachedDownloadedMessagesPayload);
            }
        }
    }
};

// Inbox selector accounts payload handler.
emailApp.prototype._InboxSelectorMsgHandler = function(msg)
{
    log.debug("MailDetails received" +msg);
    if(msg && msg.params && msg.params.payload)
    {
        this._cachedInboxSelectorAccounts = msg.params.payload;
        if(this._cachedInboxSelectorAccounts)
        {
            if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "InboxSelector")
            {
                log.debug("Populating InboxSelector Accounts");
                this._dataListInboxItems = new Array();
                this._populateInboxSelectorAccounts(this._cachedInboxSelectorAccounts);
            }
        }
    }
};

// Reply payload handler.
emailApp.prototype._ReplyMsgHandler = function(msg)
{
    log.debug("MailDetails received", msg);
    if(msg && msg.params && msg.params.payload && msg.params.payload.composePayload)
    {
        this._cachedReplyDetails = msg.params.payload.composePayload;
        this._msgData = "";
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "EmailReply")
        {
            log.debug("Populating Email Reply");
            this._populateReply(this._cachedReplyDetails); 
        }
    }
};

// Reply all payload handler.
emailApp.prototype._ReplyAllMsgHandler = function(msg)
{
    log.debug("MailDetails received", msg);
    if(msg && msg.params && msg.params.payload && msg.params.payload.composePayload)
    {
        this._cachedReplyDetails = msg.params.payload.composePayload;
        this._msgData = "";
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailReply")
        {
            log.debug("Populating Email Reply To All");
            this._populateReply(this._cachedReplyDetails); 
        }
    }
};

// Update Email Reply context whenever its fields are edited.
emailApp.prototype._UpdateEmailReplyContextHandler = function(msg)
{
    log.debug("MailDetails received", msg);
    this._msgData = "";
    if(msg && msg.params && msg.params.payload && msg.params.payload.composePayload)
    {
        this._cachedReplyDetails = msg.params.payload.composePayload;
        if(msg.params.payload.composePayload.body)
        {
            this._msgData = this._cachedReplyDetails.body;
        }
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailReply") 
        {
            this._populateReply(this._cachedReplyDetails);
        }
    }
};

//Continue Message Payload Handler
emailApp.prototype._ContinueMessagePayloadHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload)
    {
        if(msg.params.payload.isActiveContinue === true)
        { 
            this._continueMessage = true;
        }
        else if(msg.params.payload.isActiveContinue === false)
        { 
            this._continueMessage = false;
        }
        log.info("value of  this._continueMessage =  "+this._continueMessage);
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailInbox")
        {
            this._populateEmailInboxList(this._cachedDownloadedMessagesPayload);
        }
    }
};

//AtSpeed Handler
emailApp.prototype._AtSpeedHandler = function(msg)
{
    this._vehicleMotionState = framework.common.getAtSpeedValue();
    if(this._cachedMailDetails)
    {
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailMessageDetail")
        {
            log.debug("Populating EmailMessageDetail....");
            this._populateEmailMessageDetail(this._cachedMailDetails);
        }
    }
};

//NoSpeed Handler
emailApp.prototype._NoSpeedHandler = function(msg)
{
    this._vehicleMotionState = framework.common.getAtSpeedValue();
    if(this._cachedMailDetails)
    {
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailMessageDetail")
        {
            log.debug("Populating EmailMessageDetail....");
            this._populateEmailMessageDetail(this._cachedMailDetails);
        }
    }
};

//Initializing all variables again
emailApp.prototype._clearAll = function()
{
    log.debug("Clear all of Email called");
    this._timeout = null;
    this._flag = false;
    this._dataListInboxItems = new Array();
    this._pause = true;
    this._cachedDownloadedMessageId = new Array();
    this._cachedDownloadedMessagesPayload = new Array();
    this._cachedPlaybackStatePayload = null;
    this._toData = new Array();
    this._cachedMailDetails = null;
    this._eventToMMUIOnSend = null;
    this._sendSuccess = true;
    this._eventFromUMP = null;
    this._cachedPresetMsgs = null;
    this._eventToMMUIInboxSelectorList = null;
    this._prevInboxAcc = "";
    this._inboxAccount = "";
    this._emailId = null;
    this._cachedContacts = null;
    this._cachedPhoneContacts = null;
    this._newMessage = false;
    this._vehicleMotionState = null;
    this._isContactsDbOpen = false;
    this._phonenumbers = null;
    this._cachedErrorCondition = null;
    this._cachedErrorConditionRetry = null;
    this._PreviousCachedErrorConditionRetry = null;
    this._cachedInboxSelectorAccounts = null;
    this._deviceId = 0;
    this._continueMessage = false;
    this._ContactCount = null;
    this._contactIdList = new Array();
    this._cachedEmailDisambiguation = new Array();
    this._autoDownload = false;
    this._startLoading = false;
    this._cachedInstance = null;
    this._typeMask = null;
    this._contactID = null;
    this._tempFlag = true;
    this._isEmptyList = false;
    this._newMsgNotificationFromMMUI = false;
    this._winkMessageAlert = null;
    this._tempNextPrevFlag = true;
    this._requestFromDevice = false;
    this._mapConnected = false;
    this._cachedPlaybackState = null;
    this._callBackCalled = true;
    this._instanceDisconnected = false;
    this._disconnectedInstances = new Array();
    this._listErrorCondition = false;
    this._AppSDKErrorCondition = false;
    this._sendErrorCondition = false;
    this._deleteErrorCondition = false;
    this._contactsArray = new Array();
    this._disableRetryForSend = false;
    this._disableRetryForDelete = false;
    this._eventToMMUIOnUpdate = false;
    this._commonLoadingFlag = true;
    this._isMsgDisambiguate = false;
    this._instanceIdOfReply = null;
    this._instanceIdOfDetail = null;
    this._AppSDKBusy = false;
};

// Message notification handler.
emailApp.prototype._SendNotificationHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.NotifyPayload)
    {
        var notificationType = msg.params.payload.NotifyPayload.NotificationType;
        log.info("Notification recieved from MMUI is = "+notificationType);
        if(notificationType)
        {
            switch(notificationType)
            {
                case "NOTIFICATION_TYPE_NEW_MESSAGES_INFO" :
                    this._newMsgNotificationFromMMUI = msg.params.payload.NotifyPayload.AvailableForDownload;
                    log.info("Value of this._newMsgNotificationFromMMUI inside NOTIFICATION_TYPE_NEW_MESSAGES_INFO = " +this._newMsgNotificationFromMMUI);
                    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailInbox"
                        && this._eventFromUMP !== "SelectDelete")
                    {
                        log.info("Value of this._cachedInstance inside NOTIFICATION_TYPE_NEW_MESSAGES_INFO = "+this._cachedInstance);
                        log.info("Value of this._callBackCalled inside NOTIFICATION_TYPE_NEW_MESSAGES_INFO = "+this._callBackCalled);
                        log.info("Value of this._newMessage inside NOTIFICATION_TYPE_NEW_MESSAGES_INFO = "+this._newMessage);
                        this._cachedDownloadedMessageId = new Array();
                        this._cachedDownloadedMessagesPayload = new Array();
                        if(this._cachedInstance && this._callBackCalled)
                        {
                            this._callBackCalled = false;
                            this._startLoading = true;
                            this._populateEmailInboxList(this._cachedDownloadedMessagesPayload);
                            var params = 
                            {
                                "connection_in": this._connectionIn,
                                "context_in": 0,
                                "filter_sz": 
                                {
                                    "sender_sz":
                                    {
                                        "addressList_sz": 
                                        {
                                            "addresses_sz": 1
                                        }
                                    }
                                }, 
                                "filter": 
                                {
                                    "instanceID": this._cachedInstance,
                                    "sender": 
                                    {
                                        "typeMask": this._typeMask,
                                        "contactID": this._contactID,
                                        "addressList": 
                                        {
                                            "count":1, 
                                            "addresses": 
                                            [
                                                {
                                                    "type": 1, 
                                                    "subTypeMask": 0,
                                                    "address": ""
                                                }
                                            ]
                                        }
                                    }
                                }, 
                                "request_type": 1
                            };
                            log.info("AutoDownload = FALSE :: Sending GetMessageList request to AppSDK with params: " , params , "inside NOTIFICATION_TYPE_NEW_MESSAGE");
                            framework.sendRequestToAppsdk(this.uiaId, this._downloadMessageCallbackFn.bind(this), "msg", "GetMessageList", params);
                        }
                        else
                        {
                            this._newMessage = this._newMsgNotificationFromMMUI;
                            this._populateEmailInboxList(this._cachedDownloadedMessagesPayload);
                        }
                    }
                    else if (!this._cachedInstance && this._callBackCalled && this._autoDownload === false && this._eventFromUMP !== "Delete")
                    {
                        log.info("Current context is not EmailInbox and also the emails in mobile is empty so it would just display new message icon.");
                        this._cachedDownloadedMessagesPayload = new Array();
                        this._newMessage = this._newMsgNotificationFromMMUI;
                    }
                    break;
                case "NOTIFICATION_TYPE_MAP_CONNECTED" :
                    log.info("Map is Connected");
                    //Send data to syssettings to notify it to remove email settings
                    framework.setSharedData(this.uiaId, "emailSupported", true);
                    this._mapConnected = true;
                    this._flag = true;
                    this._inboxAccount = "All Inboxes";
                    this._prevInboxAcc = this._inboxAccount;
                    log.debug("Value of this._autoDownload inside NOTIFICATION_TYPE_MAP_CONNECTED = "+this._autoDownload);
                    if(!this._connectionIn)
                    {
                        //Send Request to AppSDK of CONNECT type
                        var params = 
                        {
                            "context_in": 0,
                            "client_type_in": 1,
                            "callbacks_in": 0
                        };
                        framework.sendRequestToAppsdk(this.uiaId, this._ConnectionValueCallbackFn.bind(this), "msg", "Connect", params);
                        log.info("sending request to AppSDK of Connect");
                    }
                    if (this._autoDownload === true)
                    {
                        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailInbox")
                        {
                            log.debug("AutoDownload = TRUE :: Calling populateEmailInboxList function with empty list from NOTIFICATION_TYPE_MAP_CONNECTED and rotating indeterminate meter.");
                            this._requestFromDevice = false;
                            this._startLoading = true;
                            this._populateEmailInboxList(this._cachedDownloadedMessagesPayload);
                            log.info("AutoDownload = TRUE :: Sending event 'SelectImportEmail' to MMUI because autodownload was true");
                            this._eventToMMUIOnUpdate = true;
                            this._callBackCalled = false;
                            framework.sendEventToMmui(this.uiaId, "SelectImportEmail");
                        }
                    }
                    if (this._autoDownload === false)
                    {
                        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailInbox")
                        {
                            log.info("AutoDownload = FALSE :: Calling populateEmailInboxList function with empty list from NOTIFICATION_TYPE_MAP_CONNECTED and showing Inbox account as All Inboxes.");
                            this._populateEmailInboxList(this._cachedDownloadedMessagesPayload);
                        }
                    }
                    break;
                case "NOTIFICATION_TYPE_MAP_DISCONNECTED" :
                    this._clearAll();
                    log.info("Map is Disconnected.");
                    //Send data to syssettings to notify it to remove email settings
                    framework.setSharedData(this.uiaId, "emailSupported", false);
                    if(this._connectionIn)
                    {
                        //Send Request to AppSDK of DISCONNECT type
                        var params = 
                        {
                            "context_in": 0,
                            "connection_in": this._connectionIn
                        };
                        framework.sendRequestToAppsdk(this.uiaId, this._DisconnectionValueCallbackFn.bind(this), "msg", "Disconnect", params);
                        log.info("sending request to AppSDK of Disconnect");
                    }
                    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailInbox")
                    {
                        log.info("Calling _populateEmailInboxList when MAP is disconnected.");
                        this._populateEmailInboxList(this._cachedDownloadedMessagesPayload);
                    }
                    break;
                default:
                    log.info("Notification type is not supported..");
                    break;
            }
        }
    }
};

// Contact Phone Disambiguate handler.
emailApp.prototype._ContactPhoneDisambiguationHandler = function(msg)
{
    log.debug("inside ContactPhoneDisambiguationHandler");
    if(msg && msg.params && msg.params.payload)
    {
        this._cachedPhoneContacts = msg.params.payload;
        if(this._cachedPhoneContacts)
        {
            if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "ContactPhoneDisambiguation")
            {
                log.debug("populating contact phone disambiguate");
                this._populateContactPhoneDisambiguation(this._cachedPhoneContacts);
            }
        }
    }
};

//Message Sent Status Handler
emailApp.prototype._MessageSentStatusHandler = function(msg)
{
    this._eventToMMUIOnSend = null;
    this._sendSuccess = true;
    if (msg && msg.params && msg.params.payload && msg.params.payload.MessageSentstate === true)
    {
        framework.common.startTimedSbn(this.uiaId, "EmailSentStatus", "emailSent", {sbnStyle : "Style02", imagePath1 : "IcnListEmail_En.png", text1Id : "EmailSent"}); // add/update a state SBN in the display queue 
    }
};

//Auto Download Complete Handler
emailApp.prototype._AutoDownloadCompleteStateHandler = function(msg)
{
    framework.common.startTimedSbn(this.uiaId, "EmailAutoDownloadCompleteState", "AutoDownload", {sbnStyle : "Style02", imagePath1 : "IcnListEmail_En.png", text1Id : "AutoDownload"}); // add/update a state SBN in the display queue
};

//Auto Download ON/OFF Status
emailApp.prototype._AutoDownloadStatusHandler = function(msg)
{
    log.debug("Inside _AutoDownloadStatusHandler");
    if(msg && msg.params && msg.params.payload)
    {
        if(msg.params.payload.Status)
        {
            this._autoDownload = true;
        }
        else
        {
            this._autoDownload = false;
        }
        log.debug("Value of this._autoDownload inside AutoDownloadStatusHandler = " +this._autoDownload);
    }
};

//Request From Device Handler
emailApp.prototype._RequestFromDeviceHandler = function()
{
    log.info("Handler would be called whenever user enters into email from communication.");
    this._requestFromDevice = true;
    //this._newMsgReadOverDetail = false;
    this._PreviousCachedErrorConditionRetry = null;
    this._eventToMMUIInboxSelectorList = null;
    if(this._listErrorCondition)
    {
        log.debug("value of this._prevInboxAcc= "+this._prevInboxAcc);
        if(this._cachedInstance)
        {
            this._inboxAccount = this._prevInboxAcc;
        }
        else
        {
            this._prevInboxAcc = this._inboxAccount;
        }
        this._startLoading = false;
        this._eventToMMUIOnUpdate = false;
        this._listErrorCondition = false;
    }
    if(this._AppSDKErrorCondition)
    {
        this._cachedInstance = null;
        this._eventToMMUIOnUpdate = false;
        this._AppSDKErrorCondition = false;
    }
    if(this._sendErrorCondition)
    {
        this._eventToMMUIOnSend = null;
        this._disableRetryForSend = false;
        this._sendSuccess = true;
        this._sendErrorCondition = false;
    }
    if(this._deleteErrorCondition)
    {
        this._disableRetryForDelete = false;
        this._eventFromUMP = null;
        this._deleteErrorCondition = false;
    }
};

//Instance Disconnected Handler
emailApp.prototype._InstanceDisconnectedHandler = function(msg)
{
    log.info("Instance Disconnected handler called.");
    if(msg && msg.params && msg.params.payload)
    {
        this._disconnectedInstances = msg.params.payload.DisconnectedInstances;
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailReply")
        {
            if(this._cachedReplyDetails)
            {
                log.info("Populating Email Reply and disabling send button because instance is disconnected.");
                this._populateReply(this._cachedReplyDetails);
            }
        }
        else if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "VUIConfirmSend")
        {
            for(var i=0; i<this._disconnectedInstances.length; i++)
            {
                log.info("Disconnected instance is: " +this._disconnectedInstances[i]);
                log.info("Value of this._instanceIdOfReply inside _InstanceDisconnectedHandler is = "+this._instanceIdOfReply);
                if(this._instanceIdOfReply === this._disconnectedInstances[i])
                {
                    this._instanceDisconnected = true;
                    break;
                }
                else
                    this._instanceDisconnected = false;
            }
            if(this._instanceDisconnected)
            {
                log.debug("Disable Yes button because instance is disconnected.");
                this._currentContextTemplate.dialog3Ctrl.setDisabled("button2",true);
                this._currentContextTemplate.dialog3Ctrl._selectBtn(0);
            }
            else
                this._currentContextTemplate.dialog3Ctrl.setDisabled("button2",false);
        }
        else if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailDeleteConfirm")
        {
            for(var i=0; i<this._disconnectedInstances.length; i++)
            {
                log.info("Disconnected instance is: " +this._disconnectedInstances[i]);
                log.info("Value of this._instanceIdOfDetail inside _InstanceDisconnectedHandler is = "+this._instanceIdOfDetail);
                if(this._instanceIdOfDetail === this._disconnectedInstances[i])
                {
                    this._instanceDisconnected = true;
                    break;
                }
                else
                    this._instanceDisconnected = false;
            }
            if(this._instanceDisconnected)
            {
                log.debug("Disable Yes button because instance is disconnected.");
                this._currentContextTemplate.dialog3Ctrl.setDisabled("button2",true);
                this._currentContextTemplate.dialog3Ctrl._selectBtn(0);
            }
            else
                this._currentContextTemplate.dialog3Ctrl.setDisabled("button2",false);
        }
        else if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailMessageDetail")
        {
            if(this._cachedMailDetails)
            {
                this._populateEmailMessageDetail(this._cachedMailDetails);
            }
        }
    }
};

//Disable Retry For Send Handler
emailApp.prototype._DisableRetryForSendHandler = function()
{
    log.info("DisableRetryForSendHandler would be called when instance for that particular email gets disconnected.");
    this._disableRetryForSend = true;
};

//Disable Retry For Delete Handler
emailApp.prototype._DisableRetryForDeleteHandler = function()
{
    log.info("DisableRetryForDeleteHandler would be called when instance for that particular email gets disconnected.");
    this._disableRetryForDelete = true;
};

//Sent Status Payload Handler Handler
emailApp.prototype._SentStatusPayloadHandler = function(msg)
{
    log.info("Handler would be called when message would be succcessfully sent or failed.");
    if(msg && msg.params && msg.params.payload)
    {
        if(msg.params.payload.SentStatus === "MESSAGE_SENT_SUCCESS")
        {
            this._eventToMMUIOnSend = null;
            if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailInbox")
            {
                log.info("Populating EMAIL inbox list when sending is completed.");
                this._populateEmailInboxList(this._cachedDownloadedMessagesPayload);
            }
        }
        if(msg.params.payload.SentStatus === "MESSAGE_SENT_FAILED")
        {
            this._eventToMMUIOnSend = null;
            this._sendSuccess = true;
        }
    }
};

//VUI _VUIActionUpdateToGUI Handler
emailApp.prototype._VUIActionUpdateToGUIHandler = function(msg)
{
    log.info("Inside _VUIActionUpdateToGUIHandler");
    var VUIUpdateType = null;
    if(msg && msg.params && msg.params.payload)
    {
        VUIUpdateType = msg.params.payload.VUI_UpdateType;
    }
    if(VUIUpdateType)
    {
        log.info("Value of VUI_UpdateType recieved from MMUI is = "+VUIUpdateType);
        switch(VUIUpdateType)
        {
            case "Update_Inbox_VUI":
                this._cachedDownloadedMessagesPayload = new Array();
                this._requestFromDevice = false;
                this._callBackCalled = false;
                this._eventToMMUIOnUpdate = true;
                if(this._flag)
                {
                    this._inboxAccount = "All Inboxes";
                }
                else
                {
                    log.debug("this._inboxAccount= " +this._inboxAccount);
                    this._inboxAccount = "";
                }
                log.info("this._inboxAccount inside Update_Inbox_VUI = " +this._inboxAccount);
                if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailInbox")
                {
                    log.info("Update Inbox command said.");
                    this._isEmptyList = false;
                    this._startLoading = true;
                    this._populateEmailInboxList(this._cachedDownloadedMessagesPayload);
                }
                break;
            case "Selected_Account_VUI":
                this._eventToMMUIInboxSelectorList = "SelectAccountName";
                this._emailId = this._accountsData[params.itemIndex].id;
                var emailAccount = this._accountsData[params.itemIndex].text;
                log.info("Value of this._emailId  inside Selected_Account_VUI = "+this._emailId);
                log.info("Value of this._prevInboxAcc inside Selected_Account_VUI = " + this._prevInboxAcc);
                this._inboxAccount = emailAccount;
                this._prevInboxAcc = this._inboxAccount;
                break;
            case "All_Account_VUI":
                this._eventToMMUIInboxSelectorList = "SelectAllAccounts";
                this._emailId = this._accountsData[0].id;
                log.info("Value of this._emailId inside All_Account_VUI = "+this._emailId);
                this._inboxAccount = "All Inboxes";
                this._prevInboxAcc = this._inboxAccount;
                break;
            case "Seek_Previous_VUI":
                if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailMessageDetail")
                {
                    log.info("Previous command said.");
                    this._tempNextPrevFlag = false;
                    this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("next", true);
                    this._disableUMPButtons();
                }
                break;
            case "Toggle_Play_Pause_VUI":
                if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailMessageDetail")
                {
                    log.info("Value of this._pause inside Toggle_Play_Pause_VUI = " +this._pause);
                    log.info("Value of this._tempFlag inside Toggle_Play_Pause_VUI = " +this._tempFlag);
                    log.info("Value of this._cachedPlaybackState inside Toggle_Play_Pause_VUI = " +this._cachedPlaybackState);
                    if(this._pause === true)
                    {
                        log.info("Play command said.");
                        this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonState("playpause", "Play");
                        this._tempFlag = null;
                        this._cachedPlaybackState = null;
                    }
                    else if(this._pause === false)
                    {
                        log.info("Pause command said.");
                        this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonState("playpause", "Pause");
                        this._tempFlag = null;
                        this._cachedPlaybackState = null;
                    }
                }
                break;
            case "Seek_Next_VUI":
                if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailMessageDetail")
                {
                    log.info("Next command said.");
                    this._tempNextPrevFlag = false;
                    this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("prev", true);
                    this._disableUMPButtons();
                }
                break;
            case "Reply_VUI":
                if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailMessageDetail")
                {
                    log.info("Reply command said");
                    this._contextTable.EmailReply.controlProperties.List2Ctrl.focussedItem = 3;
                }
                break;
            case "ReplyAll_VUI":
                if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailMessageDetail")
                {
                    log.info("Reply All command said");
                    this._contextTable.EmailReply.controlProperties.List2Ctrl.focussedItem = 4;
                }
                break;
            case "Confirmed_Delete_VUI":
                if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailDeleteConfirm")
                {
                    log.info("Delete command said");
                    this._eventFromUMP = "SelectDelete";
                }
                break;
            case "Send_Message_VUI":
                if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "VUIConfirmSend")
                {
                    log.info("Send command said.");
                    this._eventToMMUIOnSend = "SelectSendMessage";
                    this._sendSuccess = false;
                }
                break;
            case "Error_Cancel_VUI":
                if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "ErrorConditionRetry")
                {
                    log.info("Cancel command said on ErrorConditionRetry.");
                    this._PreviousCachedErrorConditionRetry = null;
                    this._eventToMMUIInboxSelectorList = null;
                    if(this._listErrorCondition)
                    {
                        log.info("value of this._prevInboxAcc inside Error_Cancel_VUI = "+this._prevInboxAcc);
                        if(this._cachedInstance)
                        {
                            this._inboxAccount = this._prevInboxAcc;
                        }
                        else
                        {
                            this._prevInboxAcc = this._inboxAccount;
                        }
                        this._startLoading = false;
                        this._eventToMMUIOnUpdate = false;
                        this._listErrorCondition = false;
                    }
                    if(this._AppSDKErrorCondition)
                    {
                        this._cachedInstance = null;
                        this._eventToMMUIOnUpdate = false;
                        this._AppSDKErrorCondition = false;
                    }
                    if(this._sendErrorCondition)
                    {
                        this._eventToMMUIOnSend = null;
                        this._disableRetryForSend = false;
                        this._sendSuccess = true;
                        this._sendErrorCondition = false;
                    }
                    if(this._deleteErrorCondition)
                    {
                        this._disableRetryForDelete = false;
                        this._eventFromUMP = null;
                        this._deleteErrorCondition = false;
                    }
                }
                break;
            case "Error_Retry_VUI":
                if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "ErrorConditionRetry")
                {
                    log.debug("Retry command said on ErrorConditionRetry.");
                    this._PreviousCachedErrorConditionRetry = null;
                    if(this._listErrorCondition)
                    {
                        this._startLoading = true;
                        this._listErrorCondition = false;
                    }
                    if(this._AppSDKErrorCondition)
                    {
                        this._AppSDKErrorCondition = false;
                    }
                    if(this._sendErrorCondition)
                    {
                        this._eventToMMUIOnSend = "SelectSendMessage";
                        this._sendSuccess = false;
                        this._sendErrorCondition = false;
                    }
                    if(this._deleteErrorCondition)
                    {
                        this._eventFromUMP = "SelectDelete";
                        this._deleteErrorCondition = false;
                    }
                }
                break;
            default:
                log.info("Message " +VUIUpdateType+ " is not handled by GUI.");
        }
    }
};

//TUI Error Condition Retry Back
emailApp.prototype.TUIActionUpdateToGUIHandler = function()
{
    log.info("Inside _TUIActionUpdateToGUIHandler");
    var TUIUpdateType = null;
    if(msg && msg.params && msg.params.payload)
    {
        TUIUpdateType = msg.params.payload.TUI_UpdateType;
    }
    if(TUIUpdateType)
    {
        log.info("Value of TUI_UpdateType recieved from MMUI is = "+TUIUpdateType);
        this._PreviousCachedErrorConditionRetry = null;
        switch(TUIUpdateType)
        {
            case "TUI_Send_Error_Back":
                this._eventToMMUIOnSend = null;
                this._disableRetryForSend = false;
                this._sendSuccess = true;
                this._sendErrorCondition = false;
                break;
            case "TUI_List_Error_Back":
                log.info("value of this._prevInboxAcc inside TUI_List_Error_Back = "+this._prevInboxAcc);
                if(this._cachedInstance)
                {
                    this._inboxAccount = this._prevInboxAcc;
                }
                else
                {
                    this._prevInboxAcc = this._inboxAccount;
                }
                this._startLoading = false;
                this._eventToMMUIOnUpdate = false;
                this._listErrorCondition = false;
                break;
            case "TUI_AppSDK_List_Error_Back":
                this._cachedInstance = null;
                this._eventToMMUIOnUpdate = false;
                this._AppSDKErrorCondition = false;
                break;
            case "TUI_Delete_Error_Back":
                this._disableRetryForDelete = false;
                this._eventFromUMP = null;
                this._deleteErrorCondition = false;
                break;
            default:
                log.info("Message " +TUIUpdateType+ " is not handled by GUI.");
        }
    }
};

/**************************
 * Control callbacks
 **************************/

// List Control
emailApp.prototype._listItemClickCallback = function(listCtrlObj, appData, params)
{
    log.info("emailApp listItemClickCallback called...");
    log.info("ItemIndex: "+ params.itemIndex + " AppData: "+ appData);
    var vuiFlag = false;
    if (params && params.fromVui)
    {
        vuiFlag = true;
    }
    log.info("VuiFlag is : "+vuiFlag);
    if(this._currentContext && this._currentContext.ctxtId)
    {
        switch (this._currentContext.ctxtId)
        {
            case "EmailInbox" :
                switch(appData)
                {
                    case "SelectEmailItem" :
                        log.debug("this._continueMessage = "+this._continueMessage);
                        var emailId = "";
                        if(this._continueMessage === true && this._eventToMMUIOnSend === "SelectSendMessage")
                        {
                            emailId = this._cachedDownloadedMessageId[params.itemIndex-4];
                        }
                        else if(this._continueMessage === true)
                        {
                            emailId = this._cachedDownloadedMessageId[params.itemIndex-3];
                        }
                        else if(this._eventToMMUIOnSend === "SelectSendMessage")
                        {
                            emailId = this._cachedDownloadedMessageId[params.itemIndex-3];
                        }
                        else
                        {
                            emailId = this._cachedDownloadedMessageId[params.itemIndex-2];
                        }
                        log.debug("value of email Id is = "+emailId);
                        var payloadParams = { payload:{emailItem: emailId} };
                        framework.sendEventToMmui(this.uiaId, appData, payloadParams, vuiFlag);
                        break;
                    case "SelectImportEmail" :
                        log.info("Value of this._startLoading when Update Inbox clicked is = "+this._startLoading);
                        log.info("Value of this._isEmptyList when Update Inbox clicked is = "+this._isEmptyList);
                        if(!this._startLoading)// && !this._isEmptyList)
                        {
                            this._cachedDownloadedMessagesPayload = new Array();
                            this._eventToMMUIOnUpdate = true;
                            this._requestFromDevice = false;
                            if(this._flag)
                            {
                                this._inboxAccount = "All Inboxes";
                            }
                            else
                            {
                                log.debug("this._inboxAccount= " +this._inboxAccount);
                                this._inboxAccount = "";
                            }
                            log.debug("this._inboxAccount= " +this._inboxAccount);
                            if (this._currentContext.ctxtId === "EmailInbox")
                            {
                                this._isEmptyList = false;
                                this._startLoading = true;
                                this._populateEmailInboxList(this._cachedDownloadedMessagesPayload);
                            }
                            this._callBackCalled = false;
                            framework.sendEventToMmui(this.uiaId, appData, null, vuiFlag);
                        }
                        break;
                    case "SelectInboxSelector" :
                        framework.sendEventToMmui(this.uiaId, appData, null, vuiFlag);
                        break;
                    case "SelectSenderName":
                        var params =
                        {
                            "payload":
                            {
                                "ContactListDetails":
                                {
                                    "ContactCount":4,
                                    "ContactIdList":
                                    [
                                        1,2,3,12
                                    ]
                                }
                            }
                        };
                        framework.sendEventToMmui(this.uiaId, appData, params, vuiFlag);
                        break;
                    default :
                        if(appData)
                        {
                            framework.sendEventToMmui(this.uiaId, appData, null, vuiFlag);
                        }
                        else
                        {
                            log.debug("Event not found");
                        }
                        break;
                }
                break;
            case "EmailReply" :
                switch(appData)
                {
                    case "SelectMessage" :
                        if(this._cachedReplyDetails)
                            framework.sendEventToMmui(this.uiaId, appData, null, vuiFlag);
                        break;
                    case "SelectSendMessage" :
                        if(vuiFlag)
                            framework.sendEventToMmui(this.uiaId, "SelectSend", null, vuiFlag);
                        else
                        {
                            this._eventToMMUIOnSend = appData;
                            this._sendSuccess = false;
                            framework.sendEventToMmui(this.uiaId, appData, null, vuiFlag);
                        }
                        break;
                    default :
                        if(vuiFlag)
                        {
                            log.info("vuiFlag is true. Returning sendAck to list2Ctrl.");
                            return "sendAck";
                        }
                        else
                            log.info("Event Not Found.");
                        break;
                }
                break;
            case "PresetMessages" :
                switch(appData)
                {
                    case "SelectPreset" :
                        var presetMsgText = null;
                        log.debug("value of params.itemIndex inside preset message is = "+params.itemIndex);
                        presetMsgText = this._presetMsgObject[params.itemIndex+1].msgText;
                        if(presetMsgText)
                        {
                            var presetlistParams = {"payload" : {"presetMessage" : presetMsgText}};
                            framework.sendEventToMmui(this.uiaId, appData, presetlistParams, vuiFlag);
                        }
                        break;
                    default :
                        log.debug("Event not found");
                        break;
                }
                break;
            case "InboxSelector" :
                switch (appData)
                {
                    case "SelectAllAccounts" :
                        this._eventToMMUIInboxSelectorList = appData;
                        this._emailId = this._accountsData[params.itemIndex].id;
                        log.debug("Value of this._emailId = "+this._emailId);
                        this._inboxAccount = "All Inboxes";
                        this._prevInboxAcc = this._inboxAccount;
                        framework.sendEventToMmui(this.uiaId, "SelectAllAccounts", null, vuiFlag);
                        break;
                    case "SelectAccountName" :
                        this._eventToMMUIInboxSelectorList = appData;
                        this._emailId = this._accountsData[params.itemIndex].id;
                        var emailAccount = this._accountsData[params.itemIndex].text;
                        log.debug("Value of this._emailId = "+this._emailId);
                        log.debug("Value of this._prevInboxAcc = " + this._prevInboxAcc);
                        this._inboxAccount = emailAccount;
                        this._prevInboxAcc = this._inboxAccount;
                        var payloadParams =
                        {
                            "payload":
                            {
                                "InstanceID": this._emailId,
                                "accountName" : emailAccount
                            }
                        };
                        framework.sendEventToMmui(this.uiaId, "SelectAccountName",payloadParams, vuiFlag);
                        break;
                    default :
                        log.debug("Event not found");
                        break;
                }
                break;
            case "ContactsDisambiguation" :
                switch(appData)
                {
                    case "SelectContactName" :
                        var selectedContactID = null;
                        selectedContactID = this._contactIDlist[params.itemIndex].contactId;
                        if(selectedContactID)
                        {
                            var ContactDetails = 
                            {
                                "payload":
                                {
                                    "ContactId": selectedContactID
                                }
                            };
                            framework.sendEventToMmui(this.uiaId, appData, ContactDetails, vuiFlag);
                        }
                        break;
                    default :
                        log.debug("Event not found");
                        break;
                }
                break;
            case "ContactPhoneDisambiguation" :
                switch(appData)
                {
                    case "SelectPhoneNumber" :
                        var selectedphoneNumber = null;
                        selectedphoneNumber = this._phoneNumberList[params.itemIndex].phoneNumber;
                        if(selectedphoneNumber)
                        {
                            var phoneNumber = 
                            {
                                "payload":
                                {
                                    "phoneNumber": selectedphoneNumber
                                }
                            };
                            framework.sendEventToMmui(this.uiaId, appData, phoneNumber, vuiFlag);
                        }
                        break;
                    default :
                        log.debug("Event not found");
                        break;
                }
                break;
            case "EmailDisambiguation" :
                switch(appData)
                {
                    case "SelectEmailItem" :
                        var selectedMsgId = this._emailIdForMsg[params.itemIndex].msgId;
                        var selectedEmailItem = { payload:{emailItem: selectedMsgId} };
                        framework.sendEventToMmui(this.uiaId, appData, selectedEmailItem, vuiFlag);
                        break;
                    default :
                        log.debug("Event not found");
                        break;
                }
                break;
            default :
                log.debug("emailApp: Unknown context", this._currentContext.ctxtId);
                break;
        }
    }
};
// EOF: List Control

//Call back called on selecting UMP buttons
emailApp.prototype._umpDefaultSelectCallback = function(ctrlObj, appData, params)
{
    log.debug("_umpDefaultSelectCallback called...", appData);
    if(this._currentContextTemplate)
    {
        switch(appData)
        {
            case  "Play/Pause" :
                log.info("Value of this._pause = " +this._pause);
                log.info("Value of this._tempFlag = " +this._tempFlag);
                log.info("Value of this._cachedPlaybackState = " +this._cachedPlaybackState);
                this._eventFromUMP = appData;
                if(this._pause === true)
                {
                    this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonState("playpause", "Play");
                    if(this._tempFlag === true || this._cachedPlaybackState === "error")
                        framework.sendEventToMmui("common", "Global.Resume");
                    this._tempFlag = null;
                    this._cachedPlaybackState = null;
                }
                else if(this._pause === false)
                {
                    this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonState("playpause", "Pause");
                    if(this._tempFlag === false || this._cachedPlaybackState === "error")
                        framework.sendEventToMmui("common", "Global.Pause");
                    this._tempFlag = null;
                    this._cachedPlaybackState = null;
                }
                break;
            case "Global.Previous" :
                this._eventFromUMP = appData;
                if(this._umpButtonConfig["prev"].disabled)
                {
                    break;
                }
                if(this._tempNextPrevFlag === true)
                    framework.sendEventToMmui("common", appData);
                this._tempNextPrevFlag = false;
                this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("next", true);
                this._disableUMPButtons();
                break;
            case "Global.Next" :
                this._eventFromUMP = appData;
                if(this._umpButtonConfig["next"].disabled)
                {
                    break;
                }
                if(this._tempNextPrevFlag === true)
                    framework.sendEventToMmui("common", appData);
                this._tempNextPrevFlag = false;
                this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("prev", true);
                this._disableUMPButtons();
                break;
            default:
                if(appData)
                {
                    if(appData === "SelectReply")
                    {
                        this._contextTable.EmailReply.controlProperties.List2Ctrl.focussedItem = 3;
                    }
                    else if(appData === "SelectReplyAll")
                    {
                        this._contextTable.EmailReply.controlProperties.List2Ctrl.focussedItem = 4;
                    }
                    framework.sendEventToMmui(this.uiaId, appData);
                }
                else
                    log.info("Event not found");
                break;
        }
    }
};
// EOF: UMP Control

// Dialog control
emailApp.prototype._dialogDefaultSelectCallback = function(dialogBtnCtrlObj, appData, params)
{
    log.debug("_dialogDefaultSelectCallback called. data: ", appData);
    if(this._currentContext && this._currentContext.ctxtId)
    {
        switch (this._currentContext.ctxtId)
        {
            case "DiscardConfirm" :
                switch(appData)
                {
                    case "Global.No" :
                    case "Global.Yes" :
                        framework.sendEventToMmui("common", appData);
                        break;
                    default:
                        log.debug("Event not found");
                        break;
                }
                break;
            case "UnfinishedEmailMessage" :
                log.debug("UnfinishedEmailMessage");
                switch (appData)
                {
                    case "SelectReturn" :
                        log.debug("SelectReturn CLICKED");
                        framework.sendEventToMmui(this.uiaId, appData);
                        break;
                    case "SelectDiscard" :
                        log.debug("SelectDiscard CLICKED");
                        framework.sendEventToMmui(this.uiaId, appData);
                        break;
                    default :
                        log.debug("Event not found." +appData);
                        break;
                }
                break;
            case "EmailDeleteConfirm" :
                log.debug("EmailDeleteConfirm");
                switch (appData)
                {
                    case "Global.GoBack" :
                        log.debug("Back CLICKED");
                        framework.sendEventToMmui("common", appData);
                        break;
                    case "SelectDelete" :
                        log.debug("Delete CLICKED");
                        this._eventFromUMP = appData;
                        framework.sendEventToMmui(this.uiaId, appData);
                        break;
                    default :
                        log.debug("Event not found." +appData);
                        break;
                }
                break;
            case "VUIConfirmSend" :
                switch (appData)
                {
                    case "Global.No" :
                        framework.sendEventToMmui("common", appData);
                        break;
                    case "Global.Yes" :
                        this._eventToMMUIOnSend = "SelectSendMessage";
                        this._sendSuccess = false;
                        framework.sendEventToMmui("common", appData);
                        break;
                    default :
                        log.debug("Event not found.");
                        break;
                }
                break;
            case "ErrorCondition" :
                switch (appData)
                {
                    case "Global.Yes" :
                        framework.sendEventToMmui("common", appData);
                        break;
                    default :
                        log.debug("Event not found.");
                        break;
                }
                break;
            case "ErrorConditionRetry" :
                switch (appData)
                {
                    case "Global.Cancel" :
                        this._PreviousCachedErrorConditionRetry = null;
                        this._eventToMMUIInboxSelectorList = null;
                        if(this._listErrorCondition)
                        {
                            log.debug("value of this._prevInboxAcc= "+this._prevInboxAcc);
                            if(this._cachedInstance)
                            {
                                this._inboxAccount = this._prevInboxAcc;
                            }
                            else
                            {
                                this._prevInboxAcc = this._inboxAccount;
                            }
                            this._startLoading = false;
                            this._eventToMMUIOnUpdate = false;
                            this._listErrorCondition = false;
                        }
                        if(this._AppSDKErrorCondition)
                        {
                            this._cachedInstance = null;
                            this._eventToMMUIOnUpdate = false;
                            this._AppSDKErrorCondition = false;
                        }
                        if(this._sendErrorCondition)
                        {
                            this._eventToMMUIOnSend = null;
                            this._disableRetryForSend = false;
                            this._sendSuccess = true;
                            this._sendErrorCondition = false;
                        }
                        if(this._deleteErrorCondition)
                        {
                            this._disableRetryForDelete = false;
                            this._eventFromUMP = null;
                            this._deleteErrorCondition = false;
                        }
                        framework.sendEventToMmui("common", appData);
                        break;
                    case "SelectRetry" :
                        this._PreviousCachedErrorConditionRetry = null;
                        if(this._listErrorCondition)
                        {
                            this._startLoading = true;
                            this._listErrorCondition = false;
                        }
                        if(this._AppSDKErrorCondition)
                        {
                            this._AppSDKErrorCondition = false;
                        }
                        if(this._sendErrorCondition)
                        {
                            this._eventToMMUIOnSend = "SelectSendMessage";
                            this._sendSuccess = false;
                            this._sendErrorCondition = false;
                        }
                        if(this._deleteErrorCondition)
                        {
                            this._eventFromUMP = "SelectDelete";
                            this._deleteErrorCondition = false;
                        }
                        framework.sendEventToMmui(this.uiaId, appData);
                        break;
                    default :
                        log.debug("Event not found.");
                        break;
                }
                break;
            default:
                log.debug(this._currentContext.ctxtId+" context is not found");
                break;
        }
    }
};
// EOF: Dialog Control

/**************************
 * Helper functions
 **************************/

//Send request to AppSDK to get message list
emailApp.prototype._showEmailInbox = function(message)
{
    log.debug("value of this._connectionIn inside showEmailInbox is = "+this._connectionIn);
    var dirtyFlag = true;
    this._isMsgDisambiguate = message.isMsgDisambiguate;
    if(message && message.instanceID)
    {
        this._cachedInstance = message.instanceID;
    }
    else if(message && message.instanceID == 0 && !this._isMsgDisambiguate)
    {
        this._cachedInstance = null;
    }
    else if(message && message.instanceID == 0 && this._isMsgDisambiguate)
    {
        dirtyFlag = false;
    }
    this._typeMask = message.sender.typeMask;
    this._contactID = message.sender.contactID;
    log.info("value of instance is= " +this._cachedInstance);
    log.info("value of dirtyFlag is= " +dirtyFlag);
    log.info("value of isMsgDisambiguate is= " +this._isMsgDisambiguate);
    log.info("value of typeMask is= " +this._typeMask);
    log.info("value of contactID is= " +this._contactID);
    log.info("Value of this._callBackCalled inside showInbox = "+this._callBackCalled);
    if (this._cachedInstance && this._callBackCalled && dirtyFlag)
    {
        var params = 
        {
            "connection_in": this._connectionIn,
            "context_in": 0,
            "filter_sz": 
            {
                "sender_sz":
                {
                    "addressList_sz": 
                    {
                        "addresses_sz": 1
                    }
                }
            }, 
            "filter": 
            {
                "instanceID": this._cachedInstance,
                "sender": 
                {
                    "typeMask": this._typeMask,
                    "contactID": this._contactID,
                    "addressList": 
                    {
                        "count":1, 
                        "addresses": 
                        [
                            {
                                "type": 1, 
                                "subTypeMask": 0,
                                "address": ""
                            }
                        ]
                    }
                }
            }, 
            "request_type": 1
        };
        log.debug("Sending GetMessageList request to AppSDK with params: " ,params);
        this._callBackCalled = false;
        framework.sendRequestToAppsdk(this.uiaId, this._downloadMessageCallbackFn.bind(this),"msg","GetMessageList", params);
    }
    else if ((this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailInbox")
             && this._callBackCalled === true
             && !this._isMsgDisambiguate)
    {
        log.info("Either Instance Id OR this._callBackCalled is null hence stopping indeterminate meter.");
        this._cachedDownloadedMessagesPayload = new Array();
        this._eventToMMUIInboxSelectorList = null;
        this._isEmptyList = true;
        this._eventFromUMP = null;
        this._startLoading = false;
        this._populateEmailInboxList(this._cachedDownloadedMessagesPayload);
    }
    else if (((this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailDisambiguation")
              || this._isMsgDisambiguate) 
              && this._callBackCalled === true)
    {
        log.info("Received empty payload from MMUI. Hence stopping Loading item and displaying empty list.");
        this._commonLoadingFlag = false;
        this._isMsgDisambiguate = false;
        if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailDisambiguation")
        {
            log.info("Since current context is EmailDisambiguation, thereby stopping loading meter.");
            this._currentContextTemplate.list2Ctrl.setLoading(false);
        }
    }
};

//Call back function for Download Email Message
emailApp.prototype._downloadMessageCallbackFn = function(msg)
{
    log.info("downloadMessageCallbackFn received", msg);
    var checkstatus = null;
    this._cachedDownloadedMessagesPayload = new Array();
    this._cachedDownloadedMessageId = new Array();
    this._callBackCalled = true;
    if(msg && msg.params && msg.params.status)
    {
        checkstatus = msg.params.status;
    }
    if(msg && msg.msgType === "methodResponse" && checkstatus === 100)
    {
        log.info("####AppSDK Success####");
        this._newMsgNotificationFromMMUI = false;
        this._eventToMMUIOnUpdate = false;
        if(this._cachedInstance === 65535)
        {
            this._emailId = 65535;
        }
        if(msg && msg.params && msg.params.message_list)
        {
            this._cachedDownloadedMessageObject = msg.params.message_list;
            log.debug("Total no. of messages = "+this._cachedDownloadedMessageObject.messages.length);
            if (((this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailInbox")
                  || this._autoDownload === true)
                && !this._isMsgDisambiguate)
            {
                log.info("Value of this._newMsgNotificationFromMMUI inside downloadMessageCallbackFn = "+this._newMsgNotificationFromMMUI);
                log.info("Value of newMessagesAvailable in AppSDK is = "+this._cachedDownloadedMessageObject.newMessagesAvailable);
                if(this._cachedDownloadedMessageObject.newMessagesAvailable)
                {
                    this._newMessage = this._cachedDownloadedMessageObject.newMessagesAvailable;
                }
                else
                {
                    this._newMessage = false;
                }
                log.debug("Value of this._newMessage inside downloadMessageCallbackFn = " +this._newMessage);
                if(this._cachedDownloadedMessageObject.messages)
                {
                    for(var i=0; i<this._cachedDownloadedMessageObject.messages.length; i++)
                    {
                        this._cachedDownloadedMessageId.push(this._cachedDownloadedMessageObject.messages[i].id);
                        log.debug("this._cachedDownloadedMessageId = " +this._cachedDownloadedMessageId[i]);
                        this._cachedDownloadedMessagesPayload.push(this._cachedDownloadedMessageObject.messages[i]);
                    }
                    if(this._cachedDownloadedMessageObject.totalMessagesCount === 0)
                    {
                        this._startLoading = false;
                    }
                    this._eventFromUMP = null;
                    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailInbox")
                    {
                        log.info("Populating Email Inbox List");
                        this._populateEmailInboxList(this._cachedDownloadedMessagesPayload);
                    }
                }
            }
            if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailDisambiguation"
                || this._isMsgDisambiguate)
            {
                this._isMsgDisambiguate = false;
                if(this._cachedDownloadedMessageObject.messages)
                {
                    for(var i=0; i<this._cachedDownloadedMessageObject.messages.length; i++)
                    {
                        this._cachedEmailDisambiguation.push(this._cachedDownloadedMessageObject.messages[i]);
                    }
                    if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailDisambiguation")
                    {
                        log.info("Populating Email Disambiguate............");
                        this._populateEmailDisambiguation(this._cachedEmailDisambiguation);
                    }
                    else
                        log.info("Received message first for EmailDisambiguation.");
                }
            }
        }
    }
    else if(msg && msg.msgType === "methodResponse" && checkstatus !== 100)
    {
        log.info("####AppSDK Unknown Status####");
        log.info("Value of CheckStatus = " +checkstatus);
        this._newMsgNotificationFromMMUI = false;
        this._eventToMMUIOnUpdate = false;
        if(this._cachedInstance === 65535)
        {
            this._emailId = 65535;
        }
        if(msg && msg.params && msg.params.message_list)
        {
            this._cachedDownloadedMessageObject = msg.params.message_list;
            log.info("Total no. of messages = "+this._cachedDownloadedMessageObject.messages.length);
            log.info("Value of newMessagesAvailable in AppSDK is = "+this._cachedDownloadedMessageObject.newMessagesAvailable);
            if(this._cachedDownloadedMessageObject.newMessagesAvailable)
            {
                this._newMessage = this._cachedDownloadedMessageObject.newMessagesAvailable;
            }
            else
            {
                this._newMessage = false;
            }
        }
        if ((this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailInbox")
                && !this._isMsgDisambiguate)
        {
            log.info("AppSDK returned empty message.");
            this._eventToMMUIInboxSelectorList = null;
            this._isEmptyList = true;
            this._eventFromUMP = null;
            this._startLoading = false;
            this._populateEmailInboxList(this._cachedDownloadedMessagesPayload);
        }
    }
    else if(msg && msg.msgType === "methodErrorResponse" && checkstatus !== 100)
    {
        log.info("####AppSDK Failure####");
        log.info("AppSDK returned the following Error : " +msg.errorType);
        this._eventToMMUIInboxSelectorList = null;
        this._isEmptyList = true;
        this._eventFromUMP = null;
        this._startLoading = false;
        var params = 
        {
            "payload":{"errorConditionRetry" : "EMAIL_MSG_LISTDOWNLOAD_FAIL_APPSDK"}
        };
        framework.sendEventToMmui(this.uiaId, "SystemErrorConditionRetry", params);
    }
    else
    {
        log.info("####AppSDK STATUS_NOT_FOUND####");
        log.info("Value of CheckStatus = " +checkstatus);
        if ((this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailInbox")
             && !this._isMsgDisambiguate)
        {
            log.info("AppSDK didn't return any message, hence stopping indeterminate meter..Displaying Cached List..");
            this._eventToMMUIInboxSelectorList = null;
            this._isEmptyList = true;
            this._eventFromUMP = null;
            this._startLoading = false;
            this._populateEmailInboxList(this._cachedDownloadedMessagesPayload);
        }
        else if ((this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailDisambiguation")
                 || this._isMsgDisambiguate) 
        {
            log.info("AppSDK didn't return any message, hence stopping loading meter of Common and displaying empty list in email disambiguate.");
            this._commonLoadingFlag = false;
            this._isMsgDisambiguate = false;
            if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "EmailDisambiguation")
            {
                log.info("Since current context is EmailDisambiguation, thereby stopping loading meter.");
                this._currentContextTemplate.list2Ctrl.setLoading(false);
            }
        }
    }
    
};

// Populate Main List with downloaded messages.
emailApp.prototype._populateEmailInboxList = function(itemsList)
{
    if(this._currentContextTemplate)
    {
        log.info("this._eventToMMUIInboxSelectorList in populateEmailInboxList = " +this._eventToMMUIInboxSelectorList);
        log.info("Value of this._autoDownload inside populateEmailInboxList= "+this._autoDownload);
        log.info("Value of this._isEmptyList inside populateEmailInboxList= "+this._isEmptyList);
        log.info("Value of this._startLoading in populateEmailInboxList = " +this._startLoading);
        log.info("Value of this._inboxAccount inside populateEmailInboxList= " +this._inboxAccount);
        log.info("Value of this._newMessage inside populateEmailInboxList= " +this._newMessage);
        var emailInboxLength = null;
        var getDateTime = null;
        var setDateTime = null;
        var contactImage = null;
        var styleMod = null;
        var loadingImage = null;
        var tempIndex = null;
        var dataMainListItems = [
            { appData : "SelectImportEmail", text1Id : "DownloadedEmailMessages", itemStyle : "style02", image1 : "common/images/icons/IcnListImport_En.png", image2: "", "hasCaret" : false},
            { appData : "SelectInboxSelector", text1Id : null, text1SubMap : null, label1Id: "Inbox", itemStyle : "style14" , image1 : "common/images/icons/IcnListEmail_En.png", "hasCaret" : false, text1Align:"right"}
        ];
        if(this._inboxAccount === "All Inboxes")
        {
            dataMainListItems[1].text1Id = "NowViewingAllInboxes";
            dataMainListItems[1].text1SubMap = null;
        }
        else
        {
            if(this._inboxAccount)
            {
                dataMainListItems[1].text1Id = "NowViewing";
                dataMainListItems[1].text1SubMap = {"AccountSelected" : this._inboxAccount};
            }
            else
                dataMainListItems[1].text1 = null;
        }
        if(this._startLoading === true && this._isEmptyList === false && this._eventToMMUIOnUpdate)
        {
            dataMainListItems[0].text1Id = "Updating";
            dataMainListItems[0].image2 = "indeterminate"; 
            dataMainListItems[0].disabled = false;
            dataMainListItems[1].image1 = "common/images/icons/IcnListEmail_Ds.png";
            dataMainListItems[1].disabled = true;
            log.debug("Updating...");
        }
        if(this._continueMessage)
        {
            dataMainListItems[dataMainListItems.length] = dataMainListItems[1];
            log.info("Item list showing continue message..");
            dataMainListItems[1] = {
                appData : "SelectContinueEmail",
                text1Id : "ContinueEmail",
                disabled : false,
                itemStyle : "style01",
                styleMod : 'hint',
                image1 : "common/images/icons/IcnListDrafts_En.png",
                hasCaret : false
            };
        }
        if(this._eventToMMUIOnSend && this._eventToMMUIOnSend === "SelectSendMessage")
        {
            dataMainListItems[dataMainListItems.length] = {
                text1Id : "Sending",
                image1 : "",
                image2: "indeterminate",
                disabled : true,
                itemStyle : "style02",
                styleMod : "bold",
                hasCaret : false
            };
        }
        if(this._eventFromUMP && this._eventFromUMP === "SelectDelete")
        {
            dataMainListItems[dataMainListItems.length] = {
                text1Id : "Updating",
                image1 : "",
                image2: "indeterminate",
                disabled : true,
                itemStyle : "style02",
                styleMod : "bold",
                hasCaret : false
            };
            itemsList = new Array();
            this._cachedDownloadedMessagesPayload = new Array();
        }
        if(itemsList.length)
        {
            for (var i = 0; i < itemsList.length; i++)
            {
                if (itemsList[i].sender === "")
                {
                    log.debug("Sender is empty");
                    continue;
                }
                if(itemsList[i].senderPhotoPath !== "")
                {
                    contactImage = itemsList[i].senderPhotoPath;
                }
                else
                {
                    contactImage = "common/images/icons/IcnListContact_Placeholder.png";
                }
                getDateTime = itemsList[i].datetime;
                if(getDateTime < 1)
                {
                    getDateTime = 1;
                }
                setDateTime = utility.formatSmartDateTime(getDateTime,false);
                log.debug("value of setDateTime is = "+setDateTime);
                styleMod = (itemsList[i].status === 1) ? 'both' : (itemsList[i].status === 2) ? 'hint' : null;
                dataMainListItems.push({
                    appData : "SelectEmailItem",
                    text1 : itemsList[i].sender,
                    label1 : setDateTime,
                    label2 : itemsList[i].instance,
                    image1 : contactImage,
                    itemStyle : "style07",
                    styleMod : styleMod,
                    hasCaret : false,
                    labelWidth: "wide"
                });
                log.debug("value of styleMod for status " +itemsList[i].status +" is = "+dataMainListItems[i+2].styleMod);
            }
        }
        else
        {
            if(this._startLoading === true && this._isEmptyList === false && !this._eventToMMUIOnUpdate)
            {
                if(this._callBackCalled === true && this._newMessage && !this._eventToMMUIOnUpdate)
                {
                    log.info("New mail is available. Hence showing the green circle.");
                    loadingImage = "common/images/icons/IcnListEmailPending.png";
                }
                else 
                    loadingImage = "common/images/icons/IcnListEmail_En.png";
                var config = {
                        "loadingTextId" : "Updating",
                        "loadingImage1" : loadingImage,
                    };
                    log.info("Setting empty Control Data");
                    this._currentContextTemplate.list2Ctrl.setLoadingConfig(config);
                    return;
            }
            else
            {
                log.info("Email Item List is Empty");
                if(this._callBackCalled === true && this._newMessage && !this._eventToMMUIOnUpdate)
                {
                    log.debug("New email is available. Hence showing the green circle.");
                    dataMainListItems[0].image2 = "common/images/icons/IcnListEmailPending.png";
                }
                this._emailInboxCtxtDataList.items = dataMainListItems;
                this._emailInboxCtxtDataList.itemCount = dataMainListItems.length;
                this._currentContextTemplate.list2Ctrl.setDataList(this._emailInboxCtxtDataList);
                if(this._emailInboxCtxtDataList.itemCount)
                {
                    this._currentContextTemplate.list2Ctrl.updateItems(0, this._emailInboxCtxtDataList.itemCount - 1);
                }
                
            }
            return;
        }
        this._emailInboxCtxtDataList.items = dataMainListItems;
        this._emailInboxCtxtDataList.itemCount = dataMainListItems.length;
        if(this._continueMessage && this._eventToMMUIOnSend)
        {
            emailInboxLength = this._emailInboxCtxtDataList.items.length -4;
            tempIndex = 2;
        }
        else if(this._continueMessage || this._eventToMMUIOnSend)
        {
            emailInboxLength = this._emailInboxCtxtDataList.items.length -3;
            if(this._continueMessage)
                tempIndex = 2;
            else if(this._eventToMMUIOnSend)
                tempIndex = 1;
        }
        else
        {
            emailInboxLength = this._emailInboxCtxtDataList.items.length -2;
            tempIndex = 1;
        }
        if(itemsList.length && this._startLoading === true && this._isEmptyList === false)
        {
            if(emailInboxLength !== this._cachedDownloadedMessageObject.totalMessagesCount)
            {
                log.debug("Still Updating...");
                dataMainListItems[0].text1Id = "Updating";
                dataMainListItems[0].image2 = "indeterminate"; 
                dataMainListItems[0].disabled = true;
                dataMainListItems[1].disabled = true;
            }
            else
            {
                log.debug("Updating Stopped!!!");
                this._eventToMMUIInboxSelectorList = null;
                this._startLoading = false;
                dataMainListItems[0].text1Id = "DownloadedEmailMessages";
                dataMainListItems[0].image2 = "";
                dataMainListItems[0].disabled = false;
                dataMainListItems[tempIndex].image1 = "common/images/icons/IcnListEmail_En.png";
                dataMainListItems[tempIndex].disabled = false;
                if(this._continueMessage)
                {
                    dataMainListItems[2].disabled = false;
                }
            }
        }
        if(this._newMessage)
        {
            log.debug("New email is available. Hence showing the green circle.");
            dataMainListItems[0].image2 = "common/images/icons/IcnListEmailPending.png";
        }
        this._currentContextTemplate.list2Ctrl.setDataList(this._emailInboxCtxtDataList);
        if(this._emailInboxCtxtDataList.itemCount)
        {
            this._currentContextTemplate.list2Ctrl.updateItems(0, this._emailInboxCtxtDataList.itemCount - 1);
        }
        //Sending event DataLoaded so that VUI can be informed that list is loaded on the screen.
        framework.sendEventToMmui(this.uiaId, "DataLoaded");
    }
};

// Display message details.
emailApp.prototype._populateEmailMessageDetail = function(message)
{
    if(this._currentContextTemplate)
    {
        if(message)
        {
            var getDateTime = null;
            var setDateTime = null;
            var senderName = null;
            var contacts = new Array();
            var toFieldName = new Array();
            var ccFieldName = new Array();
            var subject = "";
            var messageHasAttachments = null;
            var noAttachmentSupportIcon = null;
            var body = null;
            var senderAddressListCount = null;
            var ctrlData = null;
            var speedRestrictionMsgId = null;
            this._instanceIdOfDetail = null;
            var senderPhotoPath = null;
            //check if instance is connected or not..
            if(message && message.message_display)
            {
                this._instanceIdOfDetail = message.message_display.instance.id;
                log.info("Value of instanceId of message in populateEmailMessageDetail is = "+this._instanceIdOfDetail);
                log.info("No. of disconnected instances  in populateEmailMessageDetail are: " +this._disconnectedInstances.length);
                for(var i=0; i<this._disconnectedInstances.length; i++)
                {
                    log.info("Disconnected instance in populateEmailMessageDetail is: " +this._disconnectedInstances[i]);
                    if(this._instanceIdOfDetail === this._disconnectedInstances[i])
                    {
                        this._instanceDisconnected = true;
                        break;
                    }
                    else
                        this._instanceDisconnected = false;
                }
            }
            //DateTime
            if(message && message.message_display)
            {
                getDateTime = message.message_display.datetime;
                log.info("Date time value recived from MMUI is = "+getDateTime);
                if(getDateTime < 1)
                {
                    getDateTime = 1;
                }
                log.info("Date time value from GUI is = "+getDateTime);
                setDateTime = utility.formatDateTime(getDateTime,false);
            }
            //Sender PhotoPath
            if(message && message.message_display && message.message_display.sender && message.message_display.sender.photoPath)
            {
                senderPhotoPath = message.message_display.sender.photoPath;
            }
            else
            {
                senderPhotoPath = "common/images/icons/IcnListContact_En.png";
            }
            //From field
            if(message && message.message_display && message.message_display.sender && message.message_display.sender.name)
            {
                senderName = message.message_display.sender.name;
            }
            //To and Cc field
            if(message && message.message_display && message.message_display.recipients && message.message_display.recipients.contacts)
            {
                contacts = message.message_display.recipients.contacts;
                for(i=0; i<contacts.length; i++)
                {
                    if(contacts[i].type === "MSG_CONTACT_RECIPIENT_TO")
                    {
                        toFieldName[toFieldName.length] = message.message_display.recipients.contacts[i].name;
                    }
                    else if(contacts[i].type === "MSG_CONTACT_RECIPIENT_CC")
                    {
                        ccFieldName[ccFieldName.length] = message.message_display.recipients.contacts[i].name;
                    }
                }
            }
            //Subject field
            if(message && message.message_display && message.message_display.subject)
            {
                subject = message.message_display.subject;
            }
            //Attachments field
            if(message && message.message_display && message.message_display.hasAttachments)
            {
                messageHasAttachments = message.message_display.hasAttachments;
                noAttachmentSupportIcon = "common/images/icons/IcnListAttachmentDisallowed.png";
            }
            //Body
            if(message && this._vehicleMotionState)
            {
                speedRestrictionMsgId = "SpeedRestriction";
            }
            else if(message && message.message_display && message.message_display.body)
            {
                body = message.message_display.body;
            }
            //Play/Pause
            if(!body && !subject)
            {
                this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("playpause", true);
            }
            else
                this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("playpause", false);
            if(this._pause === true)
            {
                this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonState("playpause", "Play");
            }
            if(this._pause === false)
            {
                this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonState("playpause", "Pause");
            }
            //Previous/Next Buttons
            log.info("Value of isFirst is = " +message.message_display.isFirst);
            log.info("Value of isLast is = " +message.message_display.isLast);
            if(message && message.message_display && message.message_display.isFirst)
            {
                log.info("Previous Disabled");
                this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonFocus("communication");
                this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("prev", true);
            }
            else
            {
                log.info("Previous Enabled");
                this._tempNextPrevFlag = true;
                this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("prev", false);
            }
            if(message && message.message_display && message.message_display.isLast)
            {
                log.info("Next Disabled");
                this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonFocus("communication");
                this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("next", true);
            }
            else
            {
                log.info("Next Enabled");
                this._tempNextPrevFlag = true;
                this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("next", false);
            }
            //Call
            if(message && message.message_display && message.message_display.sender && message.message_display.sender.addressList)
            {
                senderAddressListCount = message.message_display.sender.addressList.count;
                log.info("value of senderAddressListCount = "+senderAddressListCount);
                if(senderAddressListCount === 1)
                {
                    this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("call", true);
                }
                else
                {
                    this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("call", false);
                }
            }
            //Reply, Reply All and Delete
            if(this._instanceDisconnected)
            {
                //Disabling Reply and Reply All
                this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("reply", true);
                this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("replyall", true);
                //Delete
                this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("delete", true);
            }
            else
            {
                if(message && message.message_display && message.message_display.isReply)
                {
                    //Disabling Reply and ReplyAll
                    log.info("Disabling Reply button because MMUI is sending isReply as true");
                    this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("reply", true);
                    this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("replyall", true);
                }
                else
                {
                    //Enabling Reply and ReplyAll
                    this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("reply", false);
                    this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("replyall", false);
                }
                if(message && message.message_display && message.message_display.isDelete)
                {
                    //Disabling Delete
                    log.info("Disabling Delete button because MMUI is sending isDelete as true");
                    this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("delete", true);
                }
                else
                {
                    //Enabling Delete
                    this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("delete", false);
                }
            }
            //Set Control Data
            ctrlData = {
                "messageTimestamp" : setDateTime,
                "messageSenderIcon" : senderPhotoPath,
                "messageSender" : senderName,
                "messageSenderSubMap" : {"From" : senderName},
                "messageRecipientsId" : "To",
                "messageRecipientsSubMap" : {"To" : toFieldName},
                "messageRecipientsCcId"     : "Cc",
                "messageRecipientsCcSubMap" : {"Cc" : ccFieldName},
                "messageSubjectId" : "Subject",
                "messageSubjectSubMap" : {"Sub" : subject},
                "messageBody" : body,
                "messageHasAttachments" : messageHasAttachments,
                "noAttachmentSupportTextId" : "AttachmentsNotSupported",
                "noAttachmentSupportIcon" : noAttachmentSupportIcon,
                "catchedRestrictedSpeed" : this._vehicleMotionState,
                "speedRestrictionMsgId" : speedRestrictionMsgId
            };
            log.info("Setting Control Data");
            this._currentContextTemplate.messaging2Ctrl.setConfig(ctrlData);
            //Sending event DataLoaded so that VUI can be informed that list is loaded on the screen.
            framework.sendEventToMmui(this.uiaId, "DataLoaded");
        }
        else
        {
            log.info("Since no message recived from MMUI hence displaying empty fields.");
            if(this._pause === true)
            {
                this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonState("playpause", "Play");
            }
            if(this._pause === false)
            {
                this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonState("playpause", "Pause");
            }
            //Set Control Data
            ctrlData = {
                "messageTimestamp" : "",
                "messageSender" : "",
                "messageRecipients" : "",
                "messageRecipientsCc" : "",
                "messageSubject" : "",
                "messageHasAttachments" : "",
                "messageBody" : ""
            };
            log.info("Setting Empty Control Data");
            this._currentContextTemplate.messaging2Ctrl.setConfig(ctrlData);
        }
    }
};

// Populate accounts.
emailApp.prototype._populateInboxSelectorAccounts = function(message)
{
    log.debug("_populateInboxSelectorAccounts called...");
    log.info("Value of this._emailId inside populateInboxSelectorAccounts is = " +this._emailId);
    if (message && message.emailInstances)
    {
        if(this._dataListInboxItems)
        {
            var accountNames = message.emailInstances.instances;
            var allAccountsText = this._dataListInboxItems.length;
            this._dataListInbox = {
                itemCountKnown : true,
                itemCount : message.emailInstances.count + allAccountsText,
                vuiSupport : true
            };
            for (var i = 0; i < message.emailInstances.count; i++)
            {
                log.debug("message.emailInstances.count = "+message.emailInstances.count);
                if (accountNames[i] && accountNames[i].name === "")
                {
                    log.debug("Account is empty");
                    continue;
                }
                else if(accountNames[i] && accountNames[i].id === 65535)
                {
                    log.debug("Account is All accounts");
                    this._dataListInboxItems.push({
                        appData : "SelectAllAccounts",
                        text1Id : "NEW-AllAccounts",
                        itemStyle : "style01",
                        hasCaret : false
                    });
                    this._accountsData[this._dataListInboxItems.length-1] = {
                        id : accountNames[i].id,
                        text : accountNames[i].name
                    };
                    log.debug("Pushing the Inbox instance = "+accountNames[i].name);
                }
                else
                {
                    log.debug("Account is different");
                    this._dataListInboxItems.push({
                        appData : "SelectAccountName",
                        text1 : accountNames[i].name,
                        itemStyle : "style01",
                        hasCaret : false
                    });
                    this._accountsData[this._dataListInboxItems.length-1] = {
                        id : accountNames[i].id,
                        text : accountNames[i].name
                    };
                    log.debug("Pushing the Inbox instance = "+accountNames[i].name);
                }
                //Setting the CheckMark Image
                if(this._dataListInboxItems.length !== null)
                {
                    log.debug("value of this._emailId = "+this._emailId);
                    log.debug("value of accountNames[i].id = "+accountNames[i].id);
                    if(this._emailId === accountNames[i].id)
                    {
                        log.debug("Setting the CheckMark Image");
                        this._dataListInboxItems[i].image1 = "common/images/icons/IcnListCheckmark.png";
                    }
                    else if(!this._emailId && this._mapConnected)
                    {
                        log.debug("Setting the CheckMark Image by default to All Accounts");
                        this._dataListInboxItems[0].image1 = "common/images/icons/IcnListCheckmark.png";
                    }
                }
            }
            if(message.emailInstances.count === 0)
            {
                this._currentContextTemplate.list2Ctrl.setLoading(false);
            }
            log.debug("length of this._dataListInbox.itemCount = "+this._dataListInbox.itemCount);
            this._dataListInbox.items = this._dataListInboxItems;
            if(this._currentContextTemplate)
            {
                this._currentContextTemplate.list2Ctrl.setDataList(this._dataListInbox);
                if(this._dataListInbox.itemCount)
                {
                    this._currentContextTemplate.list2Ctrl.updateItems(0,this._dataListInbox.items.length-1);
                }
            }
        }
    }
};

// Populate recipients and clear other data on compose context.
emailApp.prototype._populateReply = function(message)
{
    this._toData = new Array();
    this._subData = "";
    this._instanceIdOfReply = null;
    if(message)
    {
        var recipientLabel = "";
        var addressLabel = "";
        var recipientsInTo = new Array();
        var recipientsInCc = new Array();
        var recipientsInBcc = new Array();
        var recipientsInFrom = new Array();
        this._subData = message.subject;
        if(message.instanceID)
        {
            this._instanceIdOfReply = message.instanceID.id;
            log.info("Value of instanceId in populateReply of reply message is = "+this._instanceIdOfReply);
            log.info("No. of disconnected instances in populateReply are: " +this._disconnectedInstances.length);
            for(var i=0; i<this._disconnectedInstances.length; i++)
            {
                log.info("Disconnected instance in populateReply is: " +this._disconnectedInstances[i]);
                if(this._instanceIdOfReply === this._disconnectedInstances[i])
                {
                    this._instanceDisconnected = true;
                    break;
                }
                else
                    this._instanceDisconnected = false;
            }
        }
        for(var recipents = 0; recipents < message.recipients.count; recipents++)
        {
            recipientLabel  = message.recipients.contacts[recipents];
            addressLabel = recipientLabel.addressList.addresses[0];
            if((recipientLabel && recipientLabel.name && recipientLabel.name !== "") || 
               (addressLabel && addressLabel.address && addressLabel.address !== ""))
            {
                if(recipientLabel.type && recipientLabel.type === "MSG_CONTACT_RECIPIENT_TO")
                {
                    recipientsInTo[recipientsInTo.length] = {
                        "type": recipientLabel.type,
                        "name": recipientLabel.name,
                        "photoPath": recipientLabel.photoPath,
                        "addressList":
                        {
                            "count": message.recipients.contacts[recipents].addressList.count,
                            "addresses": [
                                {
                                    "type": addressLabel.type,
                                    "address": addressLabel.address,
                                    "subTypeMask": addressLabel.subTypeMask
                                }
                            ]
                        }
                    };
                }
                if(recipientLabel.type && recipientLabel.type === "MSG_CONTACT_RECIPIENT_CC")
                {
                    recipientsInCc[recipientsInCc.length] = {
                        "type": recipientLabel.type,
                        "name": recipientLabel.name,
                        "photoPath": recipientLabel.photoPath,
                        "addressList": 
                        {
                            "count": message.recipients.contacts[recipents].addressList.count,
                            "addresses": [
                                {
                                    "type": addressLabel.type,
                                    "address": addressLabel.address,
                                    "subTypeMask": addressLabel.subTypeMask
                                }
                            ]
                        }
                    };
                }
                if(recipientLabel.type && recipientLabel.type === "MSG_CONTACT_RECIPIENT_BCC")
                {
                    recipientsInBcc[recipientsInBcc.length] = {
                        "type": recipientLabel.type,
                        "name": recipientLabel.name,
                        "photoPath": recipientLabel.photoPath,
                        "addressList":
                        {
                            "count": message.recipients.contacts[recipents].addressList.count,
                            "addresses": [
                                {
                                    "type": addressLabel.type,
                                    "address": addressLabel.address,
                                    "subTypeMask": addressLabel.subTypeMask
                                }
                            ]
                        }
                    };
                }
            }
        }
        // Populating from feild 
        // We are populating this field outside the loop as from field is outside recipient structure
        recipientsInFrom[recipientsInFrom.length] = 
        {
            "type": "MSG_CONTACT_SENDER",
            "name": message.instanceID.name,
            "photoPath": null, // It won't have any photo path
            "addressList":
            {
                "count": 0, //It will always contain a name in from field so we won't populate address
                "addresses": [
                    {
                        "type": "",
                        "address": "",
                        "subTypeMask": ""
                    }
                ]
            }
        };
        if(recipientsInTo.length)
        {
            for(var to=0; to<recipientsInTo.length; to++)
            {
                this._toData[this._toData.length] = recipientsInTo[to];
            }
        }
        if(recipientsInCc.length)
        {
            for(var cc=0; cc<recipientsInCc.length; cc++)
            {
                this._toData[this._toData.length] = recipientsInCc[cc];
            }
        }
        if(recipientsInBcc.length)
        {
            for(var bcc=0; bcc<recipientsInBcc.length; bcc++)
            {
                this._toData[this._toData.length] = recipientsInBcc[bcc];
            }
        }
        if(recipientsInFrom.length)
        {
            for(var from=0; from<recipientsInFrom.length; from++)
            {
                this._toData[this._toData.length] = recipientsInFrom[from];
            }
        }
        if(this._currentContext && this._currentContext.ctxtId === "EmailReply")
        {
            this._getListItemsForEmailReplyCtxt(this._toData, this._subData, this._msgData);
        }
    }
    else //If no value recieved from MMUI, display empty fields.
    {
        log.info("Since no value recieved from MMUI, hence displaying empty list.");
        var dataListForCompose= [
            { text1Id : "To", text1SubMap : {To : ""}, itemStyle : "style17", disabled :true, hasCaret : false},
            { text1Id : "From", text1SubMap : {From: ""}, itemStyle : "style17", disabled :true, hasCaret : false},
            { text1Id : "Subject", text1SubMap : {Sub : ""}, itemStyle : "style17", disabled :true, hasCaret : false},
            { appData : "SelectMessage", text1Id : "Message", text1SubMap : {Msg : ""}, itemStyle : "style17", disabled :false, hasCaret : false},
            { appData : "SelectSendMessage", text1Id : "Send", itemStyle : "style20", disabled :true, hasCaret : false}
        ];
        if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId == "EmailReply")
        {
            this._emailReplyCtxtDataList.items = dataListForCompose;
            this._emailReplyCtxtDataList.itemCount = dataListForCompose.length;
            this._currentContextTemplate.list2Ctrl.setDataList(this._emailReplyCtxtDataList);
            if(this._emailReplyCtxtDataList.itemCount)
            {
                this._currentContextTemplate.list2Ctrl.updateItems(0,dataListForCompose.length-1);
            }
        }
    }
};

// Get and populate list items.
emailApp.prototype._getListItemsForEmailReplyCtxt = function(to, sub, msg)
{
    log.info("entering _getListItemsForEmailReplyCtxt");
    var dataListForCompose = new Array();
    var contactValueTo = null;
    var contactValueCc = new Array();
    var contactValueBcc = null;
    var contactValueFrom = null;
    var temp = false;
    for(var populateRecipients = 0; populateRecipients < to.length; populateRecipients++)
    {
        if(to[populateRecipients] && to[populateRecipients].type === "MSG_CONTACT_RECIPIENT_TO")
        {
            if(to[populateRecipients].name)
            {
                contactValueTo = to[populateRecipients].name;
            }
            else if(to[populateRecipients].addressList.addresses[0].address)
            {
                contactValueTo = to[populateRecipients].addressList.addresses[0].address;
            }
            log.debug("contactValueTo =" +contactValueTo);
                dataListForCompose.push({
                    text1Id : "To",
                    text1SubMap : { To : contactValueTo },
                    itemStyle : "style17",
                    disabled : false,
                    vuiSelectable: false,
                    hasCaret : false
                });
        }
        else if(to[populateRecipients] && to[populateRecipients].type === "MSG_CONTACT_RECIPIENT_CC")
        {
            if(to[populateRecipients].name)
            {
                contactValueCc.push(to[populateRecipients].name);
            }
            else if(to[populateRecipients].addressList.addresses[0].address)
            {
                contactValueCc.push(to[populateRecipients].addressList.addresses[0].address);
            }
            if(temp)
            {
                dataListForCompose[dataListForCompose.length-1].text1SubMap.Cc[dataListForCompose[dataListForCompose.length-1].text1SubMap.Cc.length] = contactValueCc[contactValueCc.length-1];
            }
            else
            {
                dataListForCompose.push({
                    text1Id : "Cc",
                    text1SubMap : { Cc : [contactValueCc[contactValueCc.length-1]]},
                    itemStyle : "style17",
                    disabled : false,
                    vuiSelectable: false,
                    hasCaret : false
                });
                temp = true;
            }
        }
        else if(to[populateRecipients] && to[populateRecipients].type === "MSG_CONTACT_RECIPIENT_BCC")
        {
             if(to[populateRecipients].name)
            {
                contactValueBcc = to[populateRecipients].name;
            }
            else if(to[populateRecipients].addressList.addresses[0].address)
            {
                contactValueBcc = to[populateRecipients].addressList.addresses[0].address;
            }
                dataListForCompose.push({
                    text1Id : "Bcc",
                    text1SubMap : { Bcc : contactValueBcc },
                    itemStyle : "style17",
                    disabled : false,
                    vuiSelectable: false,
                    hasCaret : false
                });
        }
        else if(to[populateRecipients] && to[populateRecipients].type === "MSG_CONTACT_SENDER")
        {
            if(to[populateRecipients].name)
            {
                contactValueFrom = to[populateRecipients].name;
            }
            dataListForCompose.push({
                text1Id : "From",
                text1SubMap : {From: contactValueFrom},
                itemStyle : "style17",
                disabled : false,
                vuiSelectable: false,
                hasCaret : false
            });
        }
    }
    dataListForCompose[dataListForCompose.length] = {
        text1Id : "Subject",
        text1SubMap : {Sub : sub},
        itemStyle : "style17",
        disabled : false,
        vuiSelectable: false,
        hasCaret : false
    };
    dataListForCompose[dataListForCompose.length] = {
        appData : "SelectMessage",
        text1Id : "Message",
        text1SubMap : {Msg : msg},
        itemStyle : "style17",
        disabled : false,
        hasCaret : false
    };
    dataListForCompose[dataListForCompose.length] = {
        appData : "SelectSendMessage",
        text1Id : "Send",
        disabled : false,
        itemStyle : "style20",
        hasCaret : false
    };
    log.debug("Value of this._instanceDisconnected = "+this._instanceDisconnected);
    log.debug("Value of this._sendSuccess = "+this._sendSuccess);
    if(this._instanceDisconnected || !this._sendSuccess)
    {
        log.info("If instance is diconnected or if previous message is already getting send then disable send button.");
        dataListForCompose[dataListForCompose.length-1].disabled = true;
        this._currentContextTemplate.list2Ctrl.focussedItem = dataListForCompose.length-2;
    }
    this._emailReplyCtxtDataList.items = dataListForCompose;
    this._emailReplyCtxtDataList.itemCount = dataListForCompose.length;
    this._currentContextTemplate.list2Ctrl.focussedItem = dataListForCompose.length-2;
    if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId == "EmailReply")
    {
        this._currentContextTemplate.list2Ctrl.setDataList(this._emailReplyCtxtDataList);
        if(this._emailReplyCtxtDataList.itemCount)
        {
            this._currentContextTemplate.list2Ctrl.updateItems(0,dataListForCompose.length-1);
        }
    }
};

// Call back function for preset messages
emailApp.prototype._ShowPresetMessageCallbackFn = function(msg)
{
    if(msg && msg.msgType === "methodResponse")
    {
        if(msg && msg.params && msg.params.list)
        {
            this._cachedPresetMsgs = msg.params.list;
            if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "PresetMessages")
            {
                if(this._cachedPresetMsgs)
                {
                    log.debug("Populating Preset Message List");
                    this._populatePresetMessagesList(this._cachedPresetMsgs);
                }
            }
        }
    }
    else if(msg && msg.msgType === "methodErrorResponse")
    {
        log.info("####AppSDK Failure for Preset Messages####");
        log.debug("AppSDK returned the following Error : " +msg.errorType );
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "PresetMessages")
        {
            var tempPresetDataList = new Array();
            this._presetMessageListCtxtDataList.items = tempPresetDataList;
            this._presetMessageListCtxtDataList.itemCount = tempPresetDataList.length;
            this._currentContextTemplate.list2Ctrl.setDataList(this._presetMessageListCtxtDataList);
            this._currentContextTemplate.list2Ctrl.updateItems(0, this._presetMessageListCtxtDataList.items.length-1);
            this._currentContextTemplate.list2Ctrl.setLoading(false);
        }
    }
};

// Populate message presetlist.
emailApp.prototype._populatePresetMessagesList= function(presetMsgPayload)
{
    var dataListInbox = new Array();
    if(presetMsgPayload && presetMsgPayload.presetMessagesCount)
    {
        for (var i = 0; i < presetMsgPayload.presetMessagesCount; i++)
        {
            dataListInbox.push({
                appData : "SelectPreset",
                text1 : presetMsgPayload.presetMessages[i],
                itemStyle : "style17",
                disabled : false,
                hasCaret : false
            });
            this._presetMsgObject.push({
                msgText : presetMsgPayload.presetMessages[i]
            });
        }
    }
    else
    {
        dataListInbox[0] = {
                text1 : "",
                itemStyle : "style17",
                disabled : false,
                hasCaret : false
            };
    }
    this._presetMessageListCtxtDataList.items = dataListInbox;
    this._presetMessageListCtxtDataList.itemCount = dataListInbox.length;
    if(this._currentContextTemplate)
    {
        this._currentContextTemplate.list2Ctrl.setDataList(this._presetMessageListCtxtDataList);
        this._currentContextTemplate.list2Ctrl.updateItems(0, this._presetMessageListCtxtDataList.items.length-1);
    }
};

// Populate Dialog Ctrl
emailApp.prototype._populateDialogCtrl = function()
{
    log.info("PopulateDialogCtrl called and current context is = " + this._currentContext.ctxtId);
    var text1Id = null;
    var text2Id = null;
    this._callBackCalled = true;
    if (this._currentContext && this._currentContextTemplate)
    {
        switch (this._currentContext.ctxtId)
        {
            case "ErrorCondition":
                log.info("Type of error is = " +this._cachedErrorCondition); 
                // conditions for ErrorCondition context
                if(this._cachedErrorCondition === "EMAIL_MEMORY_FULL_Type")
                {
                    text2Id = "common.MemoryFull";
                }
                if(this._cachedErrorCondition === "EMAIL_TTS_READ_FAIL_Type")
                {
                    text2Id = "TTSReadFail";
                }
                if(this._cachedErrorCondition === "EMAIL_NOTIFICATION_NOT_SUPPORTED_Type")
                {
                    text2Id = "NotificationNotSupported";
                }
                if(this._cachedErrorCondition === "EMAIL_INSTANCE_DISCONNECTED")
                {
                    text1Id = "DownloadFail";
                    text2Id = "InstanceDisconnectDesc";
                }
                if(text1Id)
                {
                    this._currentContextTemplate.dialog3Ctrl.setText1Id(text1Id);
                }
                if(text2Id)
                {
                    this._currentContextTemplate.dialog3Ctrl.setText2Id(text2Id);
                }
                break;
            case "ErrorConditionRetry":
                log.info("Type of error is = "+this._cachedErrorConditionRetry);
                // conditions for ErrorConditionRetry context
                if(this._cachedErrorConditionRetry === "EMAIL_MSG_DOWNLOAD_FAIL_Type")
                {
                    text1Id = "DownloadFail";
                    text2Id = "DownloadFailDesc";
                }
                if(this._cachedErrorConditionRetry === "EMAIL_MSG_LISTDOWNLOAD_FAIL_NON_CACHED"
                   || this._cachedErrorConditionRetry === "EMAIL_MSG_LISTDOWNLOAD_FAIL_CACHED"
                   || this._cachedErrorConditionRetry === "EMAIL_MSG_LISTDOWNLOAD_FAIL_APPSDK")
                {
                    if (this._cachedErrorConditionRetry === "EMAIL_MSG_LISTDOWNLOAD_FAIL_APPSDK")
                        this._AppSDKErrorCondition = true;
                    else
                        this._listErrorCondition = true;
                    text1Id = "ListDownloadFail";
                    text2Id = "DownloadFailDesc";
                }
                if(this._cachedErrorConditionRetry === "EMAIL_MSG_SEND_FAIL_Type")
                {
                    log.info("Value of this._disableRetryForSend inside populateDialogCtrl = "+this._disableRetryForSend);
                    if(this._disableRetryForSend)
                    {
                        log.info("Disable Retry button because instance is disconnected.");
                        this._currentContextTemplate.dialog3Ctrl.setDisabled("button2",true);
                    }
                    else
                    {
                        this._currentContextTemplate.dialog3Ctrl.setDisabled("button2",false);
                    }
                    this._sendErrorCondition = true;
                    text1Id = "SendFail";
                    text2Id = "SendFailDesc";
                }
                if(this._cachedErrorConditionRetry === "EMAIL_MSG_DELETE_FAIL_Type")
                {
                    log.info("Value of this._disableRetryForDelete inside populateDialogCtrl = "+this._disableRetryForDelete);
                    if(this._disableRetryForDelete)
                    {
                        log.info("Disable Retry button because instance is disconnected.");
                        this._currentContextTemplate.dialog3Ctrl.setDisabled("button2",true);
                    }
                    else
                    {
                        this._currentContextTemplate.dialog3Ctrl.setDisabled("button2",false);
                    }
                    this._deleteErrorCondition = true;
                    text1Id = "DeleteFail";
                    text2Id = "DeleteFailDesc";
                }
                if(text1Id)
                {
                    this._currentContextTemplate.dialog3Ctrl.setText1Id(text1Id);
                }
                if(text2Id)
                {
                    this._currentContextTemplate.dialog3Ctrl.setText2Id(text2Id);
                }
            break;
        default:
            log.info("The current context is not defined");
            log.debug("The currentContext is = " +this._currentContext.ctxtId);
            break;
        }
    }
};

// Populate Contacts disambiguate screen.
emailApp.prototype._populateContactsDisambiguationCtxt = function(contacts)
{
    if(contacts)
    {
        var params;
        if(contacts.ContactCount)
        {
            this._ContactCount = contacts.ContactCount;
            this.totalContactsCount = contacts.ContactCount;
            log.info("value of this._ContactCount is= " +this._ContactCount);
            for(var i=0; i<contacts.ContactCount; i++)
            {
                this._contactIdList[i] = contacts.ContactIdList[i];
                log.info("value of this._contactIdList[" +i+ "] is = "+this._contactIdList[i]);
            }
        }
        if (!this._isContactsDbOpen)
        {
            log.debug("value of device ID is = " +this._deviceId);
            params = {"deviceId":this._deviceId};
            framework.sendRequestToDbapi(this.uiaId, this._openContactsDbCallbackFn.bind(this), "pb", "OpenContactsDb", params);
        }
    }
};

// Populate Contact disambiguate screen.
emailApp.prototype._populateContactPhoneDisambiguation = function(numberdisambiguate)
{
    var tempphoneNumberList = new Array();
    var type =  new Array();
    var numberType = null;
    var titleStructure = null;
    var contactImage = null;
    if(this._currentContextTemplate)
    {
        if(numberdisambiguate)
        {
            var numberDisambiguationDataList = new Array();
            if(numberdisambiguate.phoneNumberList)
            {
                tempphoneNumberList = numberdisambiguate.phoneNumberList;
            }
            //setting contact image
            if(numberdisambiguate.senderPhotoPath)
            {
                contactImage = numberdisambiguate.senderPhotoPath;
            }
            else
            {
                contactImage = "common/images/icons/IcnContactImagePlaceholder_Active.png";
            }
            //setting title structure
            titleStructure = {
                "titleStyle" : "style05",
                "text1" : numberdisambiguate.sender,
                "image1" : contactImage
            };
            log.debug("numberdisambiguate.displayName = " +numberdisambiguate.sender);
            this._currentContextTemplate.list2Ctrl.setTitle(titleStructure);
            //checking for PhoneNumberList(if present)
            if(tempphoneNumberList)
            {
                for(var number = 0; number < numberdisambiguate.count; number++)
                {
                    //Setting Type of phone number
                    type[number] =  tempphoneNumberList[number].senderType;
                    if(type[number] === "EMAIL_CONTACT_ADDR_MOBILE")
                    {
                        numberType = "mobile";
                    }
                    else if(type[number] === "EMAIL_CONTACT_ADDR_OFFICE")
                    {
                        numberType = "work";
                    }
                    else if(type[number] === "EMAIL_CONTACT_ADDR_HOME")
                    {
                        numberType = "home";
                    }
                    else if(type[number] === "EMAIL_CONTACT_ADDR_DEFAULT")
                    {
                        numberType = "other";
                    }
                    if(numberType)
                    {
                        //Pushing Numbers into Array
                        numberDisambiguationDataList.push({
                                appData : "SelectPhoneNumber",
                                label1Id : numberType,
                                text1 : tempphoneNumberList[number].PhoneNumber,
                                disabled : false,
                                itemStyle : "style14",
                                styleMod : "hint",
                                hasCaret : false
                        });
                        this._phoneNumberList[numberDisambiguationDataList.length-1] = {
                            phoneNumber : tempphoneNumberList[number].PhoneNumber
                        };
                    }
                }
            }
            if(numberdisambiguate.count === 0)
            {
                this._currentContextTemplate.list2Ctrl.setLoading(false);
            }
            this._contactDisambiguationListCtxtDataList.items = numberDisambiguationDataList;
            this._contactDisambiguationListCtxtDataList.itemCount = numberDisambiguationDataList.length;
            this._currentContextTemplate.list2Ctrl.setDataList(this._contactDisambiguationListCtxtDataList);
            this._currentContextTemplate.list2Ctrl.updateItems(0, this._contactDisambiguationListCtxtDataList.itemCount-1);
        }
        else
        {
            log.debug("Displaying Empty List");
            //setting title structure
            titleStructure = {
                "titleStyle" : "style05",
                "text1" : "",
                "image1" : ""
            };
            this._currentContextTemplate.list2Ctrl.setTitle(titleStructure);
            var numberDisambiguationDataList = new Array();
            this._contactDisambiguationListCtxtDataList.items = numberDisambiguationDataList;
            this._contactDisambiguationListCtxtDataList.itemCount = numberDisambiguationDataList.length;
            this._currentContextTemplate.list2Ctrl.setDataList(this._contactDisambiguationListCtxtDataList);
            this._currentContextTemplate.list2Ctrl.updateItems(0, this._contactDisambiguationListCtxtDataList.itemCount-1);
        }
    }
};

/**************************
 * DBAPI METHOD RESPONSE HANDLERS *
 **************************/

//DBAPI open db callback
emailApp.prototype._openContactsDbCallbackFn = function(msg)
{
    log.debug(" _openContactsDbCallbackFn  called...");
    var params;
    if (msg.msgContent.params.eCode == 0)
    {
        this._isContactsDbOpen = true;
        //Send Get Contacts Request to DBAPI
        if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "ContactsDisambiguation")
        {
            for(var i=0; i<this._ContactCount; i++)
            {
                params = {"deviceId":this._deviceId, "contactId":this._contactIdList[i]};
                framework.sendRequestToDbapi(this.uiaId, this._getContactDetailsCallbackFn.bind(this), "pb", "GetContactDetails", params);
            }
        }
    }
    else
    {
        this._isContactsDbOpen = false;  
        log.debug("Contacts DB Open failed");
    }
};

//DBAPI open db callback
emailApp.prototype._closeContactsDbCallbackFn = function(msg)
{
    log.info(" _closeContactsDbCallbackFn  called...");
    if (msg.msgContent.params.eCode === 0)
    {
        this._isContactsDbOpen = false;
        log.info("Contacts DB Close Success");
        if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId == "ContactsDisambiguation")
        {
            log.info("Populating populateContactsDisambiguationCtxt from closeContactsDbCallbackFn because db is now closed.");
            this._populateContactsDisambiguationCtxt(this._cachedContacts);
        }
    }
    else
    {
        log.debug("Contacts DB Close failed");
    }
};

//DBAPI GetContactDetails callback
emailApp.prototype._getContactDetailsCallbackFn = function(msg)
{
    if(msg && msg.msgContent && msg.msgContent.params)
    {
        if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "ContactsDisambiguation")
        {
            var displayName = msg.msgContent.params.displayName;
            var contactid = msg.msgContent.params.contactId;
            this._contactsArray.push({
                appData : "SelectContactName",
                text1 : displayName,
                itemStyle : "style01",
                image1 : "common/images/icons/IcnListContact_Placeholder.png",
                disabled : false,
                hasCaret : false
            });
            this._contactIDlist[this._contactsArray.length-1] = {
                contactId : contactid
            };
            this._contactsDisambiguationDataList.items = this._contactsArray;
            this._contactsDisambiguationDataList.itemCount = this._contactsArray.length;
            log.info("#Email:this._contactsDisambiguationDataList.itemCount"+this._contactsDisambiguationDataList.itemCount+"::this.totalContactsCount::"+this.totalContactsCount);
            //Updating the datalist when the complete response is comming from DBAPI
            if(this._contactsDisambiguationDataList.itemCount === this.totalContactsCount){
              log.info("#Email: Updating the contactDisambigution DataList"+JSON.stringify(this._contactsDisambiguationDataList));
              this.updateContactDisambigutionDataList(this._contactsDisambiguationDataList);
            }
        }
    }
};

emailApp.prototype.updateContactDisambigutionDataList = function(data){
      log.info("#Email:updating the dataList with values::"+JSON.stringify(data)) ;
      this._currentContextTemplate.list2Ctrl.setDataList(data);
      this._currentContextTemplate.list2Ctrl.updateItems(0,data.itemCount-1);
};
    
// Call back function for Connection_in value 
emailApp.prototype._ConnectionValueCallbackFn = function(msg)
{
    if(msg && msg.params)
    {
        if(msg.params.status == 100)
        {
            this._connectionIn = msg.params.connection;
            log.info("Value of this._connectionIn = "+this._connectionIn);
        }
    }
};

//Call back function for Disconnection_in value 
emailApp.prototype._DisconnectionValueCallbackFn = function(msg)
{
    log.info("Inside DisconnectionValueCallbackFn..");
    if(msg && msg.params)
    {
        if(msg.params.status == 100)
        {
            if(msg.params.connection_out == this._connectionIn)
            {
                log.info("Clearing value of this._connectionIn..");
                this._connectionIn = null;
            }
        }
    }
};

// Populate Email Disambiguate screen.
emailApp.prototype._populateEmailDisambiguation = function(itemsList)
{
    if(this._currentContextTemplate)
    {
        var dataListEmailDisambiguation = new Array();
        var contactImage = null;
        var getDateTime = null;
        var setDateTime = null;
        log.info("Value of this._commonLoadingFlag inside populateEmailDisambiguation is = "+this._commonLoadingFlag);
        if(itemsList.length)
        {
            log.debug("inside itemsList");
            for (var i = 0; i < itemsList.length; i++)
            {
                if (itemsList[i].sender === "")
                {
                    log.debug("Sender is empty");
                    continue;
                }
                if(itemsList[i].senderPhotoPath)
                {
                    contactImage = itemsList[i].senderPhotoPath;
                }
                else
                {
                    contactImage = "common/images/icons/IcnListContact_Placeholder.png";
                }
                getDateTime = itemsList[i].datetime;
                if(getDateTime < 1)
                {
                    getDateTime = 1;
                }
                setDateTime = utility.formatSmartDateTime(getDateTime,false);
                dataListEmailDisambiguation.push({
                    appData : "SelectEmailItem",
                    text1 : itemsList[i].sender,
                    label1 : setDateTime,
                    label2 : itemsList[i].instance,
                    image1 : contactImage,
                    itemStyle : "style07",
                    styleMod : "hint",
                    hasCaret : false,
                    labelWidth: "wide"
                });
                this._emailIdForMsg[dataListEmailDisambiguation.length -1] = {
                    msgId : itemsList[i].id
                };
            }
        }
        this._msgDisambiguateCtxtDataList.items = dataListEmailDisambiguation;
        this._msgDisambiguateCtxtDataList.itemCount = dataListEmailDisambiguation.length;
        this._currentContextTemplate.list2Ctrl.setDataList(this._msgDisambiguateCtxtDataList);
        if(this._msgDisambiguateCtxtDataList.itemCount)
            this._currentContextTemplate.list2Ctrl.updateItems(0, this._msgDisambiguateCtxtDataList.itemCount - 1);
        else
        {
            if(this._commonLoadingFlag === false)
            {
                this._currentContextTemplate.list2Ctrl.setLoading(false);
            }
            else
            {
                this._currentContextTemplate.list2Ctrl.updateItems(0, 0);
            }
        }
    }
};

/**************************
 * Framework register
 *************************/
framework.registerAppLoaded("email", null, true);