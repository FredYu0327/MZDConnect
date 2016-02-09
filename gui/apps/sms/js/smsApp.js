/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: smsApp.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: avorotp / TCS
 Date: 29-June-2012
 __________________________________________________________________________

 Description: IHU GUI Sms App

 Revisions:
 v0.1 (29-June-2012)
 v0.2 (14-Sep-2012) Contexts implementation for phase 1.- asethab
 v0.3 (08-Oct-2012) Contexts implementation for phase 2.- asethab
 v0.4 (18-Jan-2013) Contexts implementation for phase 3.- asethab
 __________________________________________________________________________

 */

log.addSrcFile("smsApp.js", "sms");
log.setLogLevel("sms","debug");

/**********************************************
 * Start of Base App Implementation
 *
 * Code in this section should not be modified
 * except for function names based on the appname
 *********************************************/

function smsApp(uiaId)
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
smsApp.prototype.appInit = function()
{
    log.debug(" smsApp appInit called...");
    if (framework.debugMode)
    {
        utility.loadScript("apps/sms/test/smsAppTest.js");
    }
    this._smsIdForMsg = [
        {
            msgId : 0
        }
    ];
    // Contact id's from database for contacts disambiguation
    this._contactIDlist = [
        {
            contactId : ""
        }
    ];
    this._presetMsgData = [
        {
            presetMsgId : "",
            presetMsgText : ""
        }
    ];
    // Id of the message
    this._msgIdForMsg = [
        {
            msgId : ""
        }
    ];
    
    //cache
    this._timeout = null;
    this._cachedDownloadedMessagesPayload = new Array();
    this._cachedDownloadedMessageId = new Array();
    this._cachedPlaybackStatePayload = null;
    this._cachedSelectConversationPayload = null;
    this._eventToMMUIOnSend = null;
    this._sendSuccess = true;
    this._umpButtonConfig = new Object();
    this._eventFromUMP = null;
    this._cachedPresetMsgs = null;
    this._pause = true;
    this._cachedContacts = null;
    this._newMessage = false;
    this._vehicleMotionState = null;
    this._cachedErrorCondition = null;
    this._cachedErrorConditionRetry = null;
    this._PreviousCachedErrorConditionRetry = null;
    this._deviceId = 0;
    this._ContactCount = null;
    this._isContactsDbOpen = false;
    this._contactIdList = new Array();
    this._cachedMessageDisambiguation = new Array();
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
    //@formatter:off
    this._umpButtonConfig["communication"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpCommMenu",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectCommunication"
    };
    this._umpButtonConfig["inboxlist"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpCurrentList",
        disabled : false,
        buttonClass : "normal",
        appData : "SelectInbox",
        labelId : "Inbox"
    };
    this._umpButtonConfig["playpause"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpPlayPause",
        currentState:"Play",
        stateArray: [
            {
                state:"Play", label:null, labelId: null
            }, 
            {
                state:"Pause", label:null, labelId: null
            }, 
        ],
        disabled : true,
        buttonClass : "normal",
        appData : "Play/Pause"
    };
    this._umpButtonConfig["prev"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpPreviousAudio",
        disabled : true,
        buttonClass : "normal",
        appData : "Global.Previous"
    };
    this._umpButtonConfig["next"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpNextAudio",
        disabled : true,
        buttonClass : "normal",
        appData : "Global.Next"
    };
    this._umpButtonConfig["reply"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpReply",
        disabled : true,
        buttonClass : "normal",
        appData : "Reply"
    };
    this._umpButtonConfig["call"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpCall",
        disabled : true,
        buttonClass : "normal",
        appData : "CallPhoneNumber"
    };
    this._umpButtonConfig["delete"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : "IcnUmpDelete",
        disabled : true,
        buttonClass : "normal",
        appData : "Delete"
    };
    //@formatter:on
    this._inboxCtxtDataList =
    {
        itemCountKnown : true,
        itemCount : 1,
        items: [
            { appData : "ImportMessages", text1Id : "DownloadSmsMessages", disabled : false, itemStyle : "style02", image1 : "common/images/icons/IcnListInbox_En.png", image2: "", "hasCaret" : false}
        ],
        vuiSupport : true
     };
    this._smsReplyCtxtDataList = {
        itemCountKnown : true,
        itemCount : 3,
        items: [
            { appData : "AddToContact", text1Id : "To", text1SubMap : {To : ""}, itemStyle : "style17", disabled : true, hasCaret : false },
            { appData : "SelectBody", text1Id : "Message", text1SubMap : {Msg : ""}, itemStyle : "style17", disabled : false, hasCaret : false },
            { appData : "Send", text1Id : "Send", itemStyle : "style20", disabled : true, hasCaret : false }
        ],
        vuiSupport : true
    };
    this._messagePresetListCtxtDataList = {
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
    this._msgDisambiguateCtxtDataList = {
        itemCountKnown : true,
        itemCount : 0,
        items: [],
        vuiSupport : true
    };
    //@formatter:off
    this._contextTable = {

        "SMSInbox" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack" ,
            "sbNameId" : "TextMessages" ,
            "controlProperties": {
                "List2Ctrl" : {
                    "thickItems" : false,
                    "numberedList" : true,
                    "protectDataList" : true,
                    "selectCallback" : this._listItemClickCallback.bind(this)
                } // end of properties for "List2Ctrl"
            }, // end of list of controlProperties
            "readyFunction" : this._SMSInboxCtxtTmpltReadyToDisplay.bind(this)
        }, // end of "SMSInbox"

        "SMSDeleteConfirm" : {
            "template" : "Dialog3Tmplt",
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),
                    "contentStyle" : "style02",
                    "fullScreen" : false,
                    "buttonCount" : 2,
                    "buttonConfig" : {
                        "button1" : {
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",
                            label: null, 
                            labelId: "Back",
                            subMap : null,
                            appData : "Global.GoBack",
                            disabled : false
                        },
                        "button2" : {
                            labelId : "Delete",
                            appData : "Delete"
                        }
                    }, // end of buttonConfig
                    "text1Id" : "SMSDeleteConfirm"
                } // end of properties for "Dialog3Ctrl"
            }, // end of list of controlProperties
            "readyFunction" : this._SMSDeleteConfirmCtxtTmpltReadyToDisplay.bind(this),
        }, // end of "SMSDeleteConfirm"
        
        "DiscardConfirm" : {
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
                    "text1Id" : "DiscardConfirm"
                } // end of properties for "Dialog3Ctrl"
            }, // end of list of controlProperties
            "readyFunction" : this._DiscardConfirmCtxtTmpltReadyToDisplay.bind(this),
        }, // end of "DiscardConfirm"

        "UnfinishedTextMessage" : {
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
                    "text1Id" : "UnfinishedTextMessage"
                } // end of properties for "Dialog3Ctrl"
            } // end of list of controlProperties
        }, // end of "UnfinishedTextMessage"

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
                    "text1Id" : ""
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
                    "text1Id" : "",
                    "text2Id" : ""
                } // end of properties for "Dialog3Ctrl"
            }, // end of list of controlProperties
            "readyFunction" : this._ErrorConditionRetryCtxtTmpltReadyToDisplay.bind(this),
            "contextInFunction" : this._ErrorConditionRetryContextInFunction.bind(this)
        }, // end of "ErrorConditionRetry"

        "SMSMessageDetail" : {
            "template" : "Messaging2Tmplt",
            "sbNameId" : "TextMessages" ,
            "controlProperties": {
                "Messaging2Ctrl" : 
                {
                    "messageAttachments" : false,
                    "messageStyle" : "sms",
                    "umpConfig" : 
                    {
                        "buttonConfig" : this._umpButtonConfig,
                        "defaultSelectCallback" : this._umpDefaultSelectCallback.bind(this),
                    } // end of umpConfig
                } // end of properties for "Messaging2Ctrl"
            }, // end of list of controlProperties
            "readyFunction" : this._SMSMessageDetailCtxtTmpltReadyToDisplay.bind(this),
            "contextOutFunction" : this._SMSMessageDetailCtxtTmpltOutOfFocus.bind(this)
        }, // end of "SMSMessageDetail"

        "PresetMessages" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack",
            "sbNameId" : "TextMessages" ,
            "controlProperties": {
                "List2Ctrl" : {
                    "numberedList" : true,
                    "titleConfiguration" : "listTitle",
                    title : {
                        text1Id : "MessagePreset",
                        titleStyle : "style02"
                    },
                    selectCallback : this._listItemClickCallback.bind(this)
                } // end of properties for "ListCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._presetMessagesCtxtReadyToDisplay.bind(this),
            "contextOutFunction" : this._presetMessagesCtxtTmpltOutOfFocus.bind(this)
        }, // end of "PresetMessages"

        "SMSReply" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack",
            "sbNameId" : "TextMessages" ,
            "controlProperties": {
                "List2Ctrl" : {
                    "numberedList" : true,
                    "dataList":this._smsReplyCtxtDataList,
                    "titleConfiguration" : 'listTitle',
                    title : {
                        text1Id : "Reply",
                        titleStyle : "style02"
                    },
                    "selectCallback" : this._listItemClickCallback.bind(this),
                    "focussedItem" : 1
                } // end of properties for "ListCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._SMSReplyCtxtTmpltReadyToDisplay.bind(this),
            "contextOutFunction" : this._SMSReplyCtxtTmpltOutOfFocus.bind(this)
        }, // end of "SMSReply"

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
                    "text1Id" : "SendConfirm"
                } // end of properties for "Dialog3Ctrl"
            }, // end of list of controlProperties
            "readyFunction" : this._VUIConfirmSendCtxtTmpltReadyToDisplay.bind(this),
        }, // end of "VUIConfirmSend"

        "MessageDisambiguation" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack" ,
            "sbNameId" : "TextMessages",
            "controlProperties": {
                "List2Ctrl" : {
                    "numberedList" : true,
                    "dataList" : this._msgDisambiguateCtxtDataList,
                    "selectCallback" : this._listItemClickCallback.bind(this),
                    "titleConfiguration" : 'listTitle',
                    title : {
                        text1Id : "SelectMessage",
                        titleStyle : "style02"
                    }
                } // end of properties for "ListCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._MessageDisambiguationCtxtReadyToDisplay.bind(this),
            "contextOutFunction" : this._MessageDisambiguationCtxtTmpltOutOfFocus.bind(this)
        }, // end of "MessageDisambiguation"

        "ContactsDisambiguation" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack" ,
            "sbNameId" : "TextMessages",
            "controlProperties": {
                "List2Ctrl" : {
                    "numberedList" : true,
                    "dataList": this._contactsDisambiguationDataList,
                    "selectCallback" : this._listItemClickCallback.bind(this),
                    "titleConfiguration" : 'listTitle',
                    title : {
                        text1Id : "SelectContact",
                        titleStyle : "style02"
                    }
                } // end of properties for "ListCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._ContactsDisambiguationCtxtReadyToDisplay.bind(this),
            "contextInFunction" : this._ContactsDisambiguationContextInFunction.bind(this)
        }, // end of "ContactsDisambiguation"
    }; // end of this._contextTable

    //@formatter:off
    this._messageTable = {
        "DownloadedMessagesPayload" : this._DownloadedMessagesPayloadMsgHandler.bind(this),
        "ListRequestRejected" : this._ListRequestRejectedHandler.bind(this),
        "SelectConversationPayload" : this._SelectConversationPayloadMsgHandler.bind(this),
        "NewMsgReadOverDetail" : this._NewMsgReadOverDetail.bind(this),
        "AppsdkListAvailable" : this._AppsdkListAvailable.bind(this),
        "ReplyOrSavePayload" : this._SMSReplyMsgHandler.bind(this),
        "NotificationPayload" : this._NotifyMsgHandler.bind(this),
        "PlayBackState" : this._PlaybackStateHandler.bind(this),
        "UnfinishedMessageState" : this._UnfinishedMessageStateHandler.bind(this),
        "RequestFromDevice" : this._RequestFromDeviceHandler.bind(this),
        "Global.AtSpeed" : this._AtSpeedHandler.bind(this),
        "Global.NoSpeed" : this._NoSpeedHandler.bind(this),
        "AutoDownloadStatus" : this._AutoDownloadStatusHandler.bind(this),
        "InstanceDisconnected" : this._InstanceDisconnectedHandler.bind(this),
        "DisableRetryForSend" : this._DisableRetryForSendHandler.bind(this),
        "DisableRetryForDelete" : this._DisableRetryForDeleteHandler.bind(this),
        "SentStatusPayload" : this._SentStatusPayloadHandler.bind(this),
        //SBN messages
        "AutoDownloadCompleteState" : this._AutoDownloadCompleteStateHandler.bind(this),
        "MessageSentStatusInSBN" :this._MessageSentStatusHandler.bind(this),
        //VUI Messages
        "VUI_Action_Update_To_GUI" : this._VUIActionUpdateToGUIHandler.bind(this),
        //TUI Messages
        "TUI_Action_Update_To_GUI" : this._TUIActionUpdateToGUIHandler.bind(this)
    };
    //end of this._messageTable
    //@formatter:on
};

/**************************
 * General App Functions
 **************************/

//Destroy Control
smsApp.prototype._destroyControl = function(controlObj)
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
smsApp.prototype._disableUMPButtons = function()
{
    log.info("Disabling all UMP buttons!!!");
    this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("playpause", true);
    this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("reply", true);
    this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("call", true);
    this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("delete", true);
};

/*
 * This function is called by Common whenever a msgType="alert" comes from MMUI.
 * This function should return a properties Object to use for the WinkCtrl.
 */
smsApp.prototype.getWinkProperties = function(alertId, params)
{
    log.info("common is looking for wink properties:", alertId, params);
    var winkProperties = null;
    switch(alertId)
    {
        case "GUI_SMSSent_Alert":
            log.info("Message successfully sent. Now displaying sent success wink.");
            winkProperties = {
                "style": "style03",
                "text1Id": "TextMessageSent",
            };
            this._sendSuccess = true;
            if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId == "SMSReply")
            {
                if(this._cachedReplyDetails)
                {
                    log.info("Populating SMS Reply from GUI_SMSSent_Alert");
                    this._populateSMSReply(this._cachedReplyDetails);
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
smsApp.prototype._clearOnCancel = function(errorConditionRetryType)
{
    log.info("Inside clearOnCancel() function...");
    log.info("Clearing Values of error type = " +errorConditionRetryType+ " on Error condition retry screen...");
    switch(errorConditionRetryType)
    {
        case "SMS_MSG_LISTDOWNLOAD_FAIL_Type":
            this._startLoading = false;
            this._eventToMMUIOnUpdate = false;
            this._listErrorCondition = false;
            break;
        case "SMS_APPSDK_LISTDOWNLOAD_FAIL_Type":
            this._cachedInstance = null;
            this._eventToMMUIOnUpdate = false;
            this._AppSDKErrorCondition = false;
            break;
        case "SMS_MSG_SEND_FAIL_Type":
            this._disableRetryForSend = false;
            this._eventToMMUIOnSend = null;
            this._sendSuccess = true;
            this._sendErrorCondition = false;
            break;
        case "SMS_MSG_DELETE_FAIL_Type":
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

// SMSInbox Context
smsApp.prototype._SMSInboxCtxtTmpltReadyToDisplay = function()
{
    log.info("smsApp SMSInboxCtxtTmpltReadyToDisplay called...");
    log.info("Value of this._connectionIn inside SMSInboxCtxtTmpltReadyToDisplay = "+this._connectionIn );
    log.info("Value of this._cachedInstance inside SMSInboxCtxtTmpltReadyToDisplay = "+this._cachedInstance );
    log.info("Value of this._callBackCalled inside _SMSInboxCtxtTmpltReadyToDisplay = "+this._callBackCalled);
    log.info("Value of this._autoDownload inside SMSInboxCtxtTmpltReadyToDisplay = "+this._autoDownload );
    log.info("Value of this._eventFromUMP inside SMSInboxCtxtTmpltReadyToDisplay = "+this._eventFromUMP );
    log.info("Value of this._requestFromDevice inside _SMSInboxCtxtTmpltReadyToDisplay = "+this._requestFromDevice);
    log.info("Value of this._newMsgReadOverDetail inside _SMSInboxCtxtTmpltReadyToDisplay = "+this._newMsgReadOverDetail);
    this._isEmptyList = false;
    this._disableRetryForSend = false;
    this._disableRetryForDelete = false;
    this._cachedDownloadedMessageId = new Array();
    this._cachedDownloadedMessagesPayload = new Array();
    this._typeMask = 0;
    this._contactID = 0;
    if (this._autoDownload === true && this._callBackCalled && this._mapConnected === true && this._eventFromUMP !== "Delete"
        && !this._newMsgReadOverDetail)
    {
        if(this._requestFromDevice === true)
        {
            log.debug("AutoDownload = TRUE :: Sending event 'ImportMessages' to MMUI because this._requestFromDevice is true");
            this._eventToMMUIOnUpdate = true;
            this._requestFromDevice = false;
            this._startLoading = true;
            this._populateInbox(this._cachedDownloadedMessagesPayload);
            this._callBackCalled = false;
            log.debug("AutoDownload = TRUE :: Calling populateInbox function with empty list from SMSInboxCtxtTmpltReadyToDisplay and rotating indeterminate meter.");
            framework.sendEventToMmui(this.uiaId, "ImportMessages");
        }
        else if(this._cachedInstance)
        {
            log.debug("AutoDownload = TRUE :: Calling populateInbox function with empty list from SMSInboxCtxtTmpltReadyToDisplay and rotating indeterminate meter.");
            this._callBackCalled = false;
            this._startLoading = true;
            this._populateInbox(this._cachedDownloadedMessagesPayload);
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
            log.debug("AutoDownload = TRUE :: Sending GetMessageList request to AppSDK with params: " , params , "inside SMSInboxCtxtTmpltReadyToDisplay");
            framework.sendRequestToAppsdk(this.uiaId, this._downloadMessageCallbackFn.bind(this), "msg", "GetMessageList", params);
        }
        else
        {
            log.debug("AutoDownload = TRUE :: Populating SMSInbox List ctrl from SMSInboxCtxtTmpltReadyToDisplay");
            this._populateInbox(this._cachedDownloadedMessagesPayload);
        }
    }
    else if (this._cachedInstance && this._callBackCalled && this._autoDownload === false && this._eventFromUMP !== "Delete"
        && !this._newMsgReadOverDetail)
    {
        log.debug("AutoDownload = FALSE :: Calling populateInbox function with empty list from SMSInboxCtxtTmpltReadyToDisplay and rotating indeterminate meter.");
        this._callBackCalled = false;
        this._startLoading = true;
        this._populateInbox(this._cachedDownloadedMessagesPayload);
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
        log.debug("AutoDownload = FALSE :: Sending GetMessageList request to AppSDK with params: " , params , "inside SMSInboxCtxtTmpltReadyToDisplay");
        framework.sendRequestToAppsdk(this.uiaId, this._downloadMessageCallbackFn.bind(this), "msg", "GetMessageList", params);
    }
    else
    {
        log.debug("Populating SMSInbox List ctrl from SMSInboxCtxtTmpltReadyToDisplay");
        if(this._newMsgReadOverDetail && this._eventFromUMP !== "Delete" && (this._autoDownload === true || this._cachedInstance)) 
            this._startLoading = true;
        this._populateInbox(this._cachedDownloadedMessagesPayload);
    }
};

// SMSMessageDetail context
smsApp.prototype._SMSMessageDetailCtxtTmpltReadyToDisplay = function()
{
    if (this._currentContextTemplate)
    {
        log.debug("smsApp SMSMessageDetailCtxtTmpltReadyToDisplay called...");
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
        log.debug("smsApp SMSMessageDetailCtxtTmpltReadyToDisplay called...");
        // The below function is necessary to call in case of new message
        // If we are already in message display and suddenly new message comes up,
        // then all fields will first get blank and then the new message details will be displayed.
        this._populateMessageDisplay(this._cachedSelectConversationPayload);
    }
};

//SMSMessageDetail Context Template Out Of Focus
smsApp.prototype._SMSMessageDetailCtxtTmpltOutOfFocus = function()
{
    log.info("SMSMessageDetailCtxtTmpltOutOfFocus called.");
    this._cachedSelectConversationPayload = null;
};

//PresetMessages context
smsApp.prototype._presetMessagesCtxtReadyToDisplay = function()
{
    log.debug("Inside PresetMessagesListCtxtReadyToDisplay");
    log.debug("value of this._connectionIn in preset messages is = "+this._connectionIn);
    this._presetMsgData =[
        {
            presetMsgId : "",
            presetMsgText : ""
        }
    ];
    log.debug("Populating empty Preset Message List from presetMessagesCtxtReadyToDisplay");
    var params = 
    {
        "connection_in": this._connectionIn,
        "context_in": 0,
        "type": 0
    };
    framework.sendRequestToAppsdk(this.uiaId, this._ShowPresetMessageCallbackFn.bind(this), "msg", "GetPresetMessageList", params);
};

//PresetMessages Context Template Out Of Focus
smsApp.prototype._presetMessagesCtxtTmpltOutOfFocus = function()
{
    log.info("PresetMessagesCtxtTmpltOutOfFocus called.");
    this._cachedPresetMsgs = null;
};

// SMSReply context
smsApp.prototype._SMSReplyCtxtTmpltReadyToDisplay = function()
{
    log.debug("smsApp SMSReplyCtxtTmpltReadyToDisplay called...");
    log.debug("Populating SMS Reply from SMSReplyCtxtTmpltReadyToDisplay");
    this._populateSMSReply(this._cachedReplyDetails);
};

//SMS Reply Context Out of Focus.
smsApp.prototype._SMSReplyCtxtTmpltOutOfFocus = function()
{
    log.info("SMSReplyCtxtTmpltOutOfFocus called");
    this._cachedReplyDetails = null;
};

//MessageDisambiguation context Ready to Display
smsApp.prototype._MessageDisambiguationCtxtReadyToDisplay = function()
{
    log.info("MessageDisambiguationCtxtReadyToDisplay called");
    this._populateMessageDisambiguation(this._cachedMessageDisambiguation);
    
};

//MessageDisambiguation Context Out of Focus.
smsApp.prototype._MessageDisambiguationCtxtTmpltOutOfFocus = function()
{
    log.info("MessageDisambiguationCtxtTmpltOutOfFocus called");
    this._commonLoadingFlag = true;
    this._cachedMessageDisambiguation = new Array();
};

//Contacts Disambiguation Context In function
smsApp.prototype._ContactsDisambiguationContextInFunction = function(msg)
{
    log.info("Inside ContactsDisambiguationContextInFunction");
    if(msg && msg.params && msg.params.payload && msg.params.payload.ContactListDetails)
    {
        this._ContactCount = null;
        this._contactIdList = new Array();
        this._cachedContacts = msg.params.payload.ContactListDetails;
    }
};

//Contacts Disambiguation context ReadyToDisplay
smsApp.prototype._ContactsDisambiguationCtxtReadyToDisplay = function()
{
    log.info("ContactsDisambiguationCtxtReadyToDisplay called");
    log.info("value of this._isContactsDbOpen = " +this._isContactsDbOpen);
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

//Discard Confirm Context Ready To Display
smsApp.prototype._DiscardConfirmCtxtTmpltReadyToDisplay = function()
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

//VUIConfirmSend Context Ready To Display
smsApp.prototype._VUIConfirmSendCtxtTmpltReadyToDisplay = function()
{
    log.info("Inside _VUIConfirmSendCtxtTmpltReadyToDisplay");
    if(this._instanceDisconnected || !this._sendSuccess)
    {
        log.info("Disable Yes button because instance is disconnected.");
        this._currentContextTemplate.dialog3Ctrl.setDisabled("button2",true);
    }
    else
    {
        this._currentContextTemplate.dialog3Ctrl.setDisabled("button2",false);
    }
};

//SMS Delete Confirm Context Ready To Display
smsApp.prototype._SMSDeleteConfirmCtxtTmpltReadyToDisplay = function()
{
    log.debug("Inside _SMSDeleteConfirmCtxtTmpltReadyToDisplay");
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

//ErrorCondition Context In function
smsApp.prototype._ErrorConditionContextInFunction = function(msg)
{
    log.debug("Inside ErrorConditionContextInFunction");
    if(msg && msg.params && msg.params.payload && msg.params.payload.errorConditionType)
    {
        this._cachedErrorCondition = msg.params.payload.errorConditionType;
    }
};

//ErrorCondition context
smsApp.prototype._ErrorConditionCtxtTmpltReadyToDisplay = function()
{
    log.debug("Inside ErrorConditionCtxtTmpltReadyToDisplay");
    if(this._cachedErrorCondition)
    {
        this._populateDialogCtrl();
    }
};

//ErrorConditionRetry Context In function
smsApp.prototype._ErrorConditionRetryContextInFunction = function(msg)
{
    log.info("Inside ErrorConditionRetryContextInFunction");
    if(msg && msg.params && msg.params.payload && msg.params.payload.errorConditionType)
    {
        this._cachedErrorConditionRetry = msg.params.payload.errorConditionType;
    }
};

//ErrorConditionRetry context
smsApp.prototype._ErrorConditionRetryCtxtTmpltReadyToDisplay = function()
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

// Download messages
smsApp.prototype._DownloadedMessagesPayloadMsgHandler = function(msg)
{
    log.debug("DownloadedMessagesPayloadMsgHandler called");
    log.debug("Value of this._autoDownload inside DownloadedMessagesPayloadMsgHandler is = " +this._autoDownload);
    var cachedNumber = null;
    this._isEmptyList = false;
    this._callBackCalled = true;
    this._cachedDownloadedMessageId = new Array();
    this._cachedDownloadedMessagesPayload = new Array();
    this._cachedMessageDisambiguation = new Array();
    if(msg && msg.params && msg.params.payload && msg.params.payload.messageList)
    {
        log.debug("Inside check of messageList");
        cachedNumber = msg.params.payload.messageList;
        if(cachedNumber)
        {
            this._showInbox(cachedNumber);
        }
    }
};

//Request Rejected for List from BLM. Hence requesting list from AppSDK
smsApp.prototype._ListRequestRejectedHandler = function()
{
    log.info("ListRequestRejectedHandler called");
    log.info("Value of this._autoDownload inside ListRequestRejectedHandler is = " +this._autoDownload);
    this._isEmptyList = false;
    this._callBackCalled = true;
    this._cachedDownloadedMessageId = new Array();
    this._cachedDownloadedMessagesPayload = new Array();
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
smsApp.prototype._PlaybackStateHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.messagePlaybackState)
    {
        this._cachedPlaybackStatePayload = msg.params.payload.messagePlaybackState;
        log.info("Playback Status is =" +this._cachedPlaybackStatePayload);
        if(this._cachedPlaybackStatePayload === "MSG_MESSAGE_PLAYBACK_STATUS_STARTED")
        {
            log.debug("Pause is false..");
            this._pause = false;
            this._tempFlag = false;
            if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "SMSMessageDetail")
            {
                this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonState("playpause", "Pause");
            }
        }
        else if(this._cachedPlaybackStatePayload === "MSG_MESSAGE_PLAYBACK_STATUS_STOPPED"||
                this._cachedPlaybackStatePayload === "MSG_MESSAGE_PLAYBACK_STATUS_COMPLETE"||
                this._cachedPlaybackStatePayload === "MSG_MESSAGE_PLAYBACK_STATUS_PAUSED")
        {
            log.debug("Pause is true..");
            this._pause = true;
            this._tempFlag = true;
            if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "SMSMessageDetail")
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
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "SMSMessageDetail")
        {
            if(this._eventFromUMP !== "Play/Pause" 
               && this._eventFromUMP !== "Global.Previous"
               && this._eventFromUMP !== "Global.Next")
            {
                log.info("Handling Playback State of Play and Pause");
                this._populateMessageDisplay(this._cachedSelectConversationPayload);
            }
        }
    }  
};

// Message details of selected message
smsApp.prototype._SelectConversationPayloadMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.messageDisplay)
    {
        this._cachedSelectConversationPayload = msg.params.payload.messageDisplay;
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "SMSMessageDetail")
            {
                log.debug("Populating Message Details Control from SelectConversationPayloadMsgHandler");
                this._populateMessageDisplay(this._cachedSelectConversationPayload);
            }
        }
    }
};

//Clearing cache i.e. this._cachedSelectConversationPayload when clicked on Read from new message notification popup
smsApp.prototype._NewMsgReadOverDetail = function()
{
    //log.info("Clearing cache i.e. this._cachedSelectConversationPayload when clicked on Read from new message notification popup.");
    log.info("_NewMsgReadOverDetail called");
    this._newMsgReadOverDetail = true;
    this._cachedSelectConversationPayload = null;
};

//_AppsdkListAvailable message
smsApp.prototype._AppsdkListAvailable = function()
{
    log.info("_AppsdkListAvailable called");
    this._newMsgReadOverDetail = false;
    if(this._autoDownload === true && this._cachedInstance == null)
    {
        this._cachedInstance = 65535;
    }
    if (this._cachedInstance && this._callBackCalled && this._eventFromUMP !== "Delete")
    {
        log.debug("Calling populateInbox function with empty list from AppsdkListAvailable and rotating indeterminate meter.");
        this._callBackCalled = false;
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
                    "typeMask": 0,
                    "contactID" : 0,
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
        log.debug("Sending GetMessageList request to AppSDK with params: " , params , "inside AppsdkListAvailable");
        framework.sendRequestToAppsdk(this.uiaId, this._downloadMessageCallbackFn.bind(this), "msg", "GetMessageList", params);
    }
};

// Message details for Reply
smsApp.prototype._SMSReplyMsgHandler = function(msg)
{
    log.debug("MessageDetails received = " +msg);
    if(msg && msg.params && msg.params.payload && msg.params.payload.composePayload)
    {
        log.debug("Inside SMSReplyMsgHandler");
        this._cachedReplyDetails = msg.params.payload.composePayload;
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "SMSReply")
        {
            log.debug("Populating SMS reply");
            this._populateSMSReply(this._cachedReplyDetails);
        }
    }
};

//Unfinished Message State Handler
smsApp.prototype._UnfinishedMessageStateHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload)
    {
        if(msg.params.payload.unfinishedmessagestate === true)
        { 
            this._continueMessage = true;
        }
        else if(msg.params.payload.unfinishedmessagestate === false)
        {
            this._continueMessage = false;
        }
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "SMSInbox")
        {
            this._populateInbox(this._cachedDownloadedMessagesPayload);
        }
    }
};

// AtSpeed Handler
smsApp.prototype._AtSpeedHandler = function(msg)
{
    this._vehicleMotionState = framework.common.getAtSpeedValue();
    if (this._cachedSelectConversationPayload)
    {
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "SMSMessageDetail")
        {
            this._populateMessageDisplay(this._cachedSelectConversationPayload);
        }
    }
};

//NoSpeed Handler
smsApp.prototype._NoSpeedHandler = function(msg)
{
    this._vehicleMotionState = framework.common.getAtSpeedValue();
    if (this._cachedSelectConversationPayload)
    {
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "SMSMessageDetail")
        {
            this._populateMessageDisplay(this._cachedSelectConversationPayload);
        }
    }
};

// Clearing all arrays and variables
smsApp.prototype._clearAll = function()
{
    log.debug("Clear all function called");
    this._timeout = null;
    this._cachedDownloadedMessagesPayload = new Array();
    this._cachedDownloadedMessageId = new Array();
    this._cachedPlaybackStatePayload = null;
    this._cachedSelectConversationPayload = null;
    this._eventToMMUIOnSend = null;
    this._sendSuccess = true;
    this._eventFromUMP = null;
    this._cachedPresetMsgs = null;
    this._pause = true;
    this._deviceId = 0;
    this._continueMessage = false;
    this._cachedContacts = null;
    this._newMessage = false;
    this._vehicleMotionState = null;
    this._cachedErrorCondition = null;
    this._cachedErrorConditionRetry = null;
    this._PreviousCachedErrorConditionRetry = null;
    this._ContactCount = null;
    this._isContactsDbOpen = false;
    this._contactIdList = new Array();
    this._cachedMessageDisambiguation = new Array();
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
    this._newMsgReadOverDetail = false;
};

// Message sent notification
smsApp.prototype._NotifyMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.notifyPayload)
    {
        var notificationType = msg.params.payload.notifyPayload.NotificationType;
        log.info("Notification recieved from MMUI is = "+notificationType);
        if(notificationType)
        {
            switch(notificationType)
            {
                case "NOTIFICATION_TYPE_NEW_MESSAGES_INFO" :
                    this._newMsgNotificationFromMMUI = msg.params.payload.notifyPayload.AvailableForDownload;
                    log.info("Value of this._newMsgNotificationFromMMUI inside NOTIFICATION_TYPE_NEW_MESSAGES_INFO = " +this._newMsgNotificationFromMMUI);
                    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "SMSInbox"
                        && this._eventFromUMP !== "Delete")
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
                            this._populateInbox(this._cachedDownloadedMessagesPayload);
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
                            log.info("Sending GetMessageList request to AppSDK with params: " , params , "inside NOTIFICATION_TYPE_NEW_MESSAGES_INFO");
                            framework.sendRequestToAppsdk(this.uiaId, this._downloadMessageCallbackFn.bind(this), "msg", "GetMessageList", params);
                        }
                        else
                        {
                            this._newMessage = this._newMsgNotificationFromMMUI;
                            this._populateInbox(this._cachedDownloadedMessagesPayload);
                        }
                    }
                    else if (!this._cachedInstance && this._callBackCalled && this._autoDownload === false && this._eventFromUMP !== "Delete")
                    {
                        log.debug("Current context is not SMSInbox and also the messages in mobile is empty so it would just display new message icon.");
                        this._cachedDownloadedMessagesPayload = new Array();
                        this._newMessage = this._newMsgNotificationFromMMUI;
                    }
                    break;
                case "NOTIFICATION_TYPE_MAP_CONNECTED" :
                    log.info("Map is Connected");
                    log.info("Value of this._autoDownload inside NOTIFICATION_TYPE_MAP_CONNECTED = "+this._autoDownload);
                    this._mapConnected = true;
                    if(!this._connectionIn)
                    {
                        //Send Request to AppSDK of CONNECT type
                        var params = 
                        {
                            "context_in": 0,
                            "client_type_in": 2,
                            "callbacks_in": 0
                        };
                        framework.sendRequestToAppsdk(this.uiaId, this._ConnectionValueCallbackFn.bind(this), "msg", "Connect", params);
                        log.info("sending request to AppSDK of Connect");
                    }
                    if (this._autoDownload === true)
                    {
                        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "SMSInbox")
                        {
                            log.info("AutoDownload = TRUE :: Calling populateInbox function with empty list from NOTIFICATION_TYPE_MAP_CONNECTED and rotating indeterminate meter.");
                            this._requestFromDevice = false;
                            this._startLoading = true;
                            this._populateInbox(this._cachedDownloadedMessagesPayload);
                            log.info("AutoDownload = TRUE :: Sending event 'ImportMessages' to MMUI because autodownload was true");
                            this._eventToMMUIOnUpdate = true;
                            this._callBackCalled = false;
                            framework.sendEventToMmui(this.uiaId, "ImportMessages");
                        }
                    }
                    break;
                case "NOTIFICATION_TYPE_MAP_DISCONNECTED" :
                    this._clearAll();
                    log.info("Map is Disconnected.");
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
                    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "SMSInbox")
                    {
                        log.info("Calling _populateInbox when MAP is disconnected.");
                        this._populateInbox(this._cachedDownloadedMessagesPayload);
                    }
                    break;
                default:
                    log.info("NotificationType is not supported");
                    break;
            }
        }
    }
};

//Message Sent Status Handler
smsApp.prototype._MessageSentStatusHandler = function(msg)
{
    this._eventToMMUIOnSend = null;
    this._sendSuccess = true;
    log.debug("Inside MessageSentStatusHandler");
    log.info("value of MessageSentstate is = " +msg.params.payload.MessageSentstate);
    if (msg && msg.params && msg.params.payload && msg.params.payload.MessageSentstate === true)
    {
        framework.common.startTimedSbn(this.uiaId, "MessageSentStatus", "smsSent", {sbnStyle : "Style02", imagePath1 : "IcnListEmail_En.png", text1Id : "TextMessageSent"}); // add/update a state SBN in the display queue 
    }
};

//Auto Download Complete Handler
smsApp.prototype._AutoDownloadCompleteStateHandler = function(msg)
{
    log.debug("Inside AutoDownloadCompleteStateHandler");
    framework.common.startTimedSbn(this.uiaId, "SMSAutoDownloadCompleteState", "AutoDownload", {sbnStyle : "Style02", imagePath1 : "IcnListEmail_En.png", text1Id : "AutoDownload"}); // add/update a state SBN in the display queue 
};

//Auto Download ON/OFF Status
smsApp.prototype._AutoDownloadStatusHandler = function(msg)
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
        log.info("Value of this._autoDownload inside AutoDownloadStatusHandler = " +this._autoDownload);
    }
};

//Request From Device Handler
smsApp.prototype._RequestFromDeviceHandler = function()
{
    log.info("RequestFromDeviceHandler is called. User enters into SMS from communication.");
    this._requestFromDevice = true;
    //this._newMsgReadOverDetail = false;
    this._PreviousCachedErrorConditionRetry = null;
    if(this._listErrorCondition)
    {
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
        this._disableRetryForSend = false;
        this._eventToMMUIOnSend = null;
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
smsApp.prototype._InstanceDisconnectedHandler = function(msg)
{
    log.info("Instance Disconnected handler called.");
    if(msg && msg.params && msg.params.payload)
    {
        this._disconnectedInstances = msg.params.payload.DisconnectedInstances;
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "SMSReply")
        {
            if(this._cachedReplyDetails)
            {
                log.debug("Populating SMS Reply and disabling send button because instance is disconnected.");
                this._populateSMSReply(this._cachedReplyDetails);
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
        else if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "SMSDeleteConfirm")
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
        else if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "SMSMessageDetail")
        {
            if (this._cachedSelectConversationPayload)
            {
                this._populateMessageDisplay(this._cachedSelectConversationPayload);
            }
        }
    }
};

//Disable Retry For Send Handler
smsApp.prototype._DisableRetryForSendHandler = function()
{
    log.info("DisableRetryForSendHandler would be called when instance for that particular message gets disconnected.");
    this._disableRetryForSend = true;
};

//Disable Retry For Delete Handler
smsApp.prototype._DisableRetryForDeleteHandler = function()
{
    log.info("DisableRetryForDeleteHandler would be called when instance for that particular message gets disconnected.");
    this._disableRetryForDelete = true;
};

//Sent Status Payload Handler Handler
smsApp.prototype._SentStatusPayloadHandler = function(msg)
{
    log.info("Handler would be called when message would be succcessfully sent or failed.");
    if(msg && msg.params && msg.params.payload)
    {
        if(msg.params.payload.SentStatus === "MESSAGE_SENT_SUCCESS")
        {
            this._eventToMMUIOnSend = null;
            if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "SMSInbox")
            {
                log.info("Populating SMS inbox list when sending is completed.");
                this._populateInbox(this._cachedDownloadedMessagesPayload);
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
smsApp.prototype._VUIActionUpdateToGUIHandler = function(msg)
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
                this._eventToMMUIOnUpdate = true;
                this._requestFromDevice = false;
                this._callBackCalled = false;
                if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "SMSInbox")
                {
                    log.info("Update Inbox command said.");
                    this._isEmptyList = false;
                    this._startLoading = true;
                    this._populateInbox(this._cachedDownloadedMessagesPayload);
                }
                break;
            case "Seek_Previous_VUI":
                if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "SMSMessageDetail")
                {
                    log.info("Previous command said.");
                    this._tempNextPrevFlag = null;
                    this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("next", true);
                    this._disableUMPButtons();
                }
                break;
            case "Toggle_Play_Pause_VUI":
                if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "SMSMessageDetail")
                {
                    log.info("Value of this._pause in Toggle_Play_Pause_VUI = " +this._pause);
                    log.info("Value of this._tempFlag in Toggle_Play_Pause_VUI = " +this._tempFlag);
                    log.info("Value of this._cachedPlaybackState in Toggle_Play_Pause_VUI= " +this._cachedPlaybackState);
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
                if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "SMSMessageDetail")
                {
                    log.info("Next command said.");
                    this._tempNextPrevFlag = null;
                    this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("prev", true);
                    this._disableUMPButtons();
                }
                break;
            case "Confirmed_Delete_VUI":
                if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "SMSDeleteConfirm")
                {
                    log.info("Delete command said");
                    this._eventFromUMP = "Delete";
                }
                break;
            case "Send_Message_VUI":
                if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "VUIConfirmSend")
                {
                    log.info("Send command said.");
                    this._eventToMMUIOnSend = "SelectSend";
                    this._sendSuccess = false;
                }
                break;
            case "Error_Cancel_VUI":
                if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "ErrorConditionRetry")
                {
                    log.info("Cancel command said on ErrorConditionRetry.");
                    this._PreviousCachedErrorConditionRetry = null;
                    if(this._listErrorCondition)
                    {
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
                        this._disableRetryForSend = false;
                        this._eventToMMUIOnSend = null;
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
                    log.info("Retry command said on ErrorConditionRetry.");
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
                        this._eventToMMUIOnSend = "Send";
                        this._sendSuccess = false;
                        this._sendErrorCondition = false;
                    }
                    if(this._deleteErrorCondition)
                    {
                        this._eventFromUMP = "Delete";
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
smsApp.prototype._TUIActionUpdateToGUIHandler = function(msg)
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
                this._disableRetryForSend = false;
                this._eventToMMUIOnSend = null;
                this._sendSuccess = true;
                this._sendErrorCondition = false;
                break;
            case "TUI_List_Error_Back":
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

//List Control
smsApp.prototype._listItemClickCallback = function(listCtrlObj, appData, params)
{
    log.info("smsApp listItemClickCallback called...");
    log.info("Current Context is = " + this._currentContext.ctxtId);
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
            case "SMSInbox" :
                switch(appData)
                {
                    case "SelectConversation" :
                        this._cachedSelectConversationPayload = null;
                        var smsId = null;
                        if(this._cachedDownloadedMessageId)
                        {
                            if(this._continueMessage === true && (this._eventToMMUIOnSend === "Send" || this._eventToMMUIOnSend === "SelectSend"))
                            {
                                smsId = this._cachedDownloadedMessageId[params.itemIndex-3];
                            }
                            else if(this._continueMessage === true)
                            {
                                smsId = this._cachedDownloadedMessageId[params.itemIndex-2];
                            }
                            else if(this._eventToMMUIOnSend === "Send" || this._eventToMMUIOnSend === "SelectSend")
                            {
                                smsId = this._cachedDownloadedMessageId[params.itemIndex-2];
                            }
                            else
                            {
                                smsId = this._cachedDownloadedMessageId[params.itemIndex-1];
                            }
                            log.info("SMSId = "+smsId);
                            var params = { "payload":{"conversation" : smsId}};
                            framework.sendEventToMmui(this.uiaId, appData, params, vuiFlag);
                        }
                        else
                            log.debug("SMSId is invalid. Value is = "+this._cachedDownloadedMessageId);
                        break;
                    case "ImportMessages" :
                        log.info("Value of this._startLoading when Update Inbox clicked is = "+this._startLoading);
                        log.info("Value of this._isEmptyList when Update Inbox clicked is = "+this._isEmptyList);
                        if(!this._startLoading)// && !this._isEmptyList)
                        {
                            this._cachedDownloadedMessagesPayload = new Array();
                            this._eventToMMUIOnUpdate = true;
                            this._requestFromDevice = false;
                            if (this._currentContext.ctxtId === "SMSInbox")
                            {
                                log.debug("ImportMessages is Clicked");
                                this._isEmptyList = false;
                                this._startLoading = true;
                                this._populateInbox(this._cachedDownloadedMessagesPayload);
                            }
                            this._callBackCalled = false;
                            framework.sendEventToMmui(this.uiaId, appData, null, vuiFlag);
                        }
                        break;
                    case "SayAnyConversation":
                        var params =
                        {
                            "payload":
                            {
                                "ContactListDetails":
                                {
                                    "contactCount":4,
                                    "contactIdList":
                                    [
                                        1,2,3,12
                                    ]
                                }
                            }
                        };
                        framework.sendEventToMmui(this.uiaId, appData, params, vuiFlag);
                        break;
                    case "SelectMessageDisambiguate":
                        framework.sendEventToMmui(this.uiaId, appData, null, vuiFlag);
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
            case "SMSReply" :
                switch(appData)
                {
                    case "SelectBody" :
                        if(this._cachedReplyDetails)
                            framework.sendEventToMmui(this.uiaId, appData, null, vuiFlag);
                        break;
                    case "Send" :
                        if(vuiFlag)
                            framework.sendEventToMmui(this.uiaId, "SelectSend", null, vuiFlag);
                        else
                        {
                            this._eventToMMUIOnSend = appData;
                            this._sendSuccess = false;
                            framework.sendEventToMmui(this.uiaId, appData, null, vuiFlag);
                        }
                        break;
                    default:
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
                if(this._presetMsgData)
                {
                    var msgSelected = this._presetMsgData[params.itemIndex+1].presetMsgText;
                    var presetMsgParams = {"payload":{"body": msgSelected}};
                    log.debug("itemIndex: "+ params.itemIndex + "appData: "+ appData);
                    framework.sendEventToMmui(this.uiaId, appData, presetMsgParams, vuiFlag);
                }
                break;
            case "MessageDisambiguation" :
                switch(appData)
                {
                    case "SelectConversation" :
                        var selectedMsgId = this._msgIdForMsg[params.itemIndex].msgId;
                        var selectedMsgItem = { payload:{conversation: selectedMsgId} };
                        framework.sendEventToMmui(this.uiaId, appData, selectedMsgItem, vuiFlag);
                        break;
                    default :
                        break;
                }
                break;
            case "ContactsDisambiguation" :
                switch(appData)
                {
                    case "SelectContactName" :
                        var selectedContactID = this._contactIDlist[params.itemIndex].contactId;
                        var ContactDetails = 
                        {
                            "payload":
                            {
                                "contactId": selectedContactID
                            }
                        };
                        framework.sendEventToMmui(this.uiaId, appData, ContactDetails, vuiFlag);
                        break;
                    default :
                        break;
                }
                break;
            default :
                log.debug("smsApp: Unknown context", this._currentContext.ctxtId);
                break;
        }
    }
};

//UMP defaultSelect callback
smsApp.prototype._umpDefaultSelectCallback = function(ctrlObj, appData, params)
{
    if(this._currentContextTemplate)
    {
        switch(appData)
        {
            case  "Play/Pause" :
                this._eventFromUMP = appData;
                log.info("Value of this._pause = " +this._pause);
                log.info("Value of this._tempFlag = " +this._tempFlag);
                log.info("Value of this._cachedPlaybackState = " +this._cachedPlaybackState);
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
                this._tempNextPrevFlag = null;
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
                this._tempNextPrevFlag = null;
                this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("prev", true);
                this._disableUMPButtons();
                break;
            default:
                if(appData)
                    framework.sendEventToMmui(this.uiaId, appData);
                else
                    log.info("Event not found");
            break;
        }
    }
};

// Dialog default select callback
smsApp.prototype._dialogDefaultSelectCallback = function(dialogBtnCtrlObj, appData, params)
{
    log.debug("_dialogDefaultSelectCallback called. data: ", appData);
    if(this._currentContext && this._currentContext.ctxtId)
    {
        switch (this._currentContext.ctxtId)
        {
            case "SMSDeleteConfirm" :
                log.debug("SMSDeleteConfirm");
                switch (appData)
                {
                    case "Global.GoBack" :
                        log.debug("Back CLICKED");
                        framework.sendEventToMmui("common", appData);
                        break;
                    case "Delete" :
                        log.debug("Delete CLICKED");
                        this._eventFromUMP = appData;
                        framework.sendEventToMmui(this.uiaId, appData);
                        break;
                    default :
                        log.debug("Event not found." +appData);
                        break;
                }
                break;
            case "UnfinishedTextMessage" :
                log.debug("UnfinishedTextMessage");
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
            case "DiscardConfirm" :
                switch (appData)
                {
                    case "Global.No" :
                    case "Global.Yes" :
                        framework.sendEventToMmui("common", appData);
                        break;
                    default :
                        log.debug("Event not found.");
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
                        this._eventToMMUIOnSend = "SelectSend";
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
                        if(this._listErrorCondition)
                        {
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
                            this._disableRetryForSend = false;
                            this._eventToMMUIOnSend = null;
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
                            this._eventToMMUIOnSend = "Send";
                            this._sendSuccess = false;
                            this._sendErrorCondition = false;
                        }
                        if(this._deleteErrorCondition)
                        {
                            this._eventFromUMP = "Delete";
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

/**************************
 * Helper functions
 **************************/

// populate Inbox context
smsApp.prototype._showInbox = function(message)
{
    log.debug("value of this._connectionIn inside showinbox is = "+this._connectionIn);
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
        log.debug("Sending GetMessageList request to AppSDK with params: " ,params);
        this._callBackCalled = false;
        framework.sendRequestToAppsdk(this.uiaId, this._downloadMessageCallbackFn.bind(this), "msg", "GetMessageList", params);
    }
    else if((this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "SMSInbox")
            && this._callBackCalled === true
            && !this._isMsgDisambiguate)
    {
        log.info("Either Instance Id OR this._callBackCalled is null hence stopping indeterminate meter.");
        this._isEmptyList = true;
        this._eventFromUMP = null;
        this._startLoading = false;
        this._cachedDownloadedMessagesPayload = new Array();
        this._populateInbox(this._cachedDownloadedMessagesPayload);
    }
    else if(((this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "MessageDisambiguation")
             || this._isMsgDisambiguate) 
             && this._callBackCalled === true)
    {
        log.info("Received empty payload from MMUI. Hence stopping Loading item and displaying empty list.");
        this._commonLoadingFlag = false;
        this._isMsgDisambiguate = false;
        if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "MessageDisambiguation")
        {
            log.info("Since current context is EmailDisambiguation, thereby stopping loading meter.");
            this._currentContextTemplate.list2Ctrl.setLoading(false);
        }
    }
};

// Download Message Callback Fn
smsApp.prototype._downloadMessageCallbackFn = function(message)
{
    var checkstatus = null;
    this._cachedDownloadedMessagesPayload = new Array();
    this._cachedDownloadedMessageId = new Array();
    this._callBackCalled = true;
    if(message && message.params && message.params.status)
    {
        checkstatus = message.params.status;
        log.debug("Value of checkstatus = "+checkstatus);
    }
    if(message && message.msgType === "methodResponse" && checkstatus === 100)
    {
        log.info("####AppSDK Success####");
        this._newMsgNotificationFromMMUI = false;
        this._eventToMMUIOnUpdate = false;
        if(message && message.params && message.params.message_list)
        {
            this._cachedDownloadedMessageObject = message.params.message_list;
            log.debug("Total no. of messages = "+this._cachedDownloadedMessageObject.messages.length);
            if (((this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "SMSInbox")
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
                    if(this._cachedDownloadedMessageObject.totalMessagesCount == 0)
                    {
                        this._startLoading = false;
                    }
                    this._eventFromUMP = null;
                    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "SMSInbox")
                    {
                        log.info("Populating Message Inbox List");
                        this._populateInbox(this._cachedDownloadedMessagesPayload);
                    }
                }
            }
            if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "MessageDisambiguation"
                || this._isMsgDisambiguate)
            {
                this._isMsgDisambiguate = false;
                if(this._cachedDownloadedMessageObject.messages)
                {
                    for(var i=0; i<this._cachedDownloadedMessageObject.messages.length; i++)
                    {
                        this._cachedMessageDisambiguation.push(this._cachedDownloadedMessageObject.messages[i]);
                    }
                    if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "MessageDisambiguation")
                    {
                        log.info("Populating Message Disambiguate............");
                        this._populateMessageDisambiguation(this._cachedMessageDisambiguation);
                    }
                    else
                        log.info("Received message first for MessageDisambiguation.");
                }
            }
        }
    }
    else if(message && message.msgType === "methodResponse" && checkstatus !== 100)
    {
        log.info("####AppSDK Unknown Status####");
        log.info("Value of CheckStatus = " +checkstatus);
        this._newMsgNotificationFromMMUI = false;
        this._eventToMMUIOnUpdate = false;
        if(message && message.params && message.params.message_list)
        {
            this._cachedDownloadedMessageObject = message.params.message_list;
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
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "SMSInbox"
            && !this._isMsgDisambiguate)
        {
            log.info("AppSDK returned empty message.");
            this._isEmptyList = true;
            this._eventFromUMP = null;
            this._startLoading = false;
            this._populateInbox(this._cachedDownloadedMessagesPayload);
        }
    }
    else if(message && message.msgType === "methodErrorResponse" && checkstatus !== 100)
    {
        log.info("####AppSDK Failure####");
        log.info("AppSDK returned the following Error : " +message.errorType );
        this._isEmptyList = true;
        this._eventFromUMP = null;
        this._startLoading = false;
        var params = 
        {
            "payload":{"errorCondition" : "SMS_APPSDK_LISTDOWNLOAD_FAIL_Type"}
        };
        framework.sendEventToMmui(this.uiaId, "SystemErrorCondition", params);
    }
    else
    {
        log.info("####AppSDK Exceptional Case####");
        log.info("Value of CheckStatus = " +checkstatus);
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "SMSInbox"
            && !this._isMsgDisambiguate)
        {
            log.debug("AppSDK didn't return any message, hence stopping indeterminate meter..Displaying Cached List..");
            this._isEmptyList = true;
            this._eventFromUMP = null;
            this._startLoading = false;
            this._populateInbox(this._cachedDownloadedMessagesPayload);
        }
        else if ((this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "MessageDisambiguation")
                || this._isMsgDisambiguate) 
        {
            log.info("AppSDK didn't return any message, hence stopping loading meter of Common and displaying empty list in message disambiguate.");
            this._commonLoadingFlag = false;
            this._isMsgDisambiguate = false;
            if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "MessageDisambiguation")
            {
                log.info("Since current context is MessageDisambiguation, thereby stopping loading meter.");
                this._currentContextTemplate.list2Ctrl.setLoading(false);
            }
        }
    }
};

// populate SMSInbox context
smsApp.prototype._populateInbox = function(itemsList)
{
    if(this._currentContextTemplate)
    {
        log.info("this._eventToMMUIOnSend in populateInbox = " +this._eventToMMUIOnSend);
        log.info("this._eventFromUMP in populateInbox = " +this._eventFromUMP);
        log.info("this._eventToMMUIOnUpdate in populateInbox = " +this._eventToMMUIOnUpdate);
        log.info("Value of this._autoDownload inside populateInbox= "+this._autoDownload);
        log.info("Value of this._isEmptyList inside populateInbox= "+this._isEmptyList);
        log.info("value of this._startLoading inside populateInbox = " +this._startLoading);
        log.info("Value of this._newMessage inside populateInbox= " +this._newMessage);
        var contactImage = null;
        var smsInboxLength = null;
        var getDateTime = null;
        var setDateTime = null;
        var styleMod = null;
        var loadingImage = null;
        var dataListItems =[
                { appData : "ImportMessages", text1Id : "DownloadSmsMessages", disabled : false, itemStyle : "style02", image1 : "common/images/icons/IcnListInbox_En.png", image2: "", "hasCaret" : false}
            ];
        
        if(this._startLoading === true && this._isEmptyList === false && this._eventToMMUIOnUpdate)
        {
            dataListItems[0].text1Id = "Updating";
            dataListItems[0].image2 = "indeterminate"; 
            dataListItems[0].disabled = false;
            log.info("Updating....");
        }
        if(this._continueMessage)
        {
            log.debug("Item list showing continue message..");
            dataListItems[dataListItems.length] = {
                appData : "SelectContinueTextMessage",
                text1Id : "ContinueMessage",
                disabled : false,
                itemStyle : "style01",
                styleMod : 'hint',
                image1 : "common/images/icons/IcnListDrafts_En.png",
                hasCaret : false
            };
        }
        if(this._eventToMMUIOnSend && (this._eventToMMUIOnSend === "Send" || this._eventToMMUIOnSend === "SelectSend"))
        {
            dataListItems.push({
                text1Id : "SendingMessage",
                image1 : "",
                image2: "indeterminate",
                disabled : true,
                itemStyle : "style02",
                styleMod : "bold",
                hasCaret : false
            });
        }
        if(this._eventFromUMP && this._eventFromUMP === "Delete")
        {
            dataListItems.push({
                text1Id : "Updating",
                image1 : "",
                image2: "indeterminate",
                List2CtrlLoading : true,
                disabled : true,
                itemStyle : "style02",
                styleMod : 'bold',
                hasCaret : false
            });
            itemsList = new Array();
            this._cachedDownloadedMessagesPayload = new Array();
        }
        if(itemsList.length)
        {
            log.debug("Inside itemsList");
            for (var i = 0; i < itemsList.length; i++)
            {
                //setting sender's name
                if (itemsList[i].sender === "")
                {
                    log.debug("Sender is empty");
                    continue;
                }
                //setting sender's photopath
                if(itemsList[i].senderPhotoPath)
                {
                    contactImage = itemsList[i].senderPhotoPath;
                }
                else
                {
                    contactImage = "common/images/icons/IcnListContact_Placeholder.png";
                }
                //setting sender's DateTime
                getDateTime = itemsList[i].datetime;
                if(getDateTime < 1)
                {
                    getDateTime = 1;
                }
                setDateTime = utility.formatSmartDateTime(getDateTime,false);
                log.debug("value of setDateTime is = "+setDateTime);
                styleMod = (itemsList[i].status === 1) ? 'both' : (itemsList[i].status === 2) ? 'hint' : null;
                dataListItems.push({
                    appData : "SelectConversation",
                    text1 : itemsList[i].sender,
                    label1 : setDateTime,
                    disabled : false,
                    image1 : contactImage,
                    itemStyle : "style06",
                    styleMod : styleMod,
                    hasCaret : false,
                    labelWidth: "wide"
                });
                log.debug("value of styleMod for status " +itemsList[i].status +" is = "+dataListItems[i+1].styleMod);
            }
        }
        else
        {
            if(this._startLoading === true && this._isEmptyList === false && !this._eventToMMUIOnUpdate)
            {
                log.info("Since itemsList.length was 0 that's why the code got returned");
                if(this._callBackCalled === true && this._newMessage && !this._eventToMMUIOnUpdate)
                {
                    log.info("New message is available. Hence showing the green circle.");
                    loadingImage = "common/images/icons/IcnListSMSPending.png";
                }
                else 
                    loadingImage = "common/images/icons/IcnListInbox_En.png";
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
                log.info("Since itemsList.length was 0 that's why the code got returned");
                if(this._callBackCalled === true && this._newMessage && !this._eventToMMUIOnUpdate)
                {
                    log.info("New message is available. Hence showing the green circle.");
                    dataListItems[0].image2 = "common/images/icons/IcnListSMSPending.png";
                }
                this._inboxCtxtDataList.items = dataListItems;
                this._inboxCtxtDataList.itemCount = dataListItems.length;
                this._currentContextTemplate.list2Ctrl.setDataList(this._inboxCtxtDataList);
                if(this._inboxCtxtDataList.itemCount)
                {
                    this._currentContextTemplate.list2Ctrl.updateItems(0, this._inboxCtxtDataList.itemCount - 1);
                }
            }
            return;
        }
        this._inboxCtxtDataList.items = dataListItems;
        this._inboxCtxtDataList.itemCount = dataListItems.length;
        if(this._continueMessage && this._eventToMMUIOnSend)
        {
            smsInboxLength = this._inboxCtxtDataList.items.length -3;
            log.debug("value of smsInboxLength=  "+smsInboxLength);
        }
        else if(this._continueMessage || this._eventToMMUIOnSend) 
        {
            smsInboxLength = this._inboxCtxtDataList.items.length -2;
            log.debug("value of smsInboxLength=  "+smsInboxLength);
        }
        else
        {
            smsInboxLength = this._inboxCtxtDataList.items.length -1;
            log.debug("value of smsInboxLength=  "+smsInboxLength);
        }
        if(itemsList.length && this._startLoading === true && this._isEmptyList === false)
        {
            log.debug("Total number of messages are = " +this._cachedDownloadedMessageObject.totalMessagesCount);
            if(smsInboxLength !== this._cachedDownloadedMessageObject.totalMessagesCount)
            {
                log.debug("Still Updating...");
                dataListItems[0].text1Id = "Updating";
                dataListItems[0].image2 = "indeterminate"; 
                dataListItems[0].disabled = true;
            }
            else
            {
                log.debug("Update Complete...");
                this._startLoading = false;
                dataListItems[0].text1Id = "DownloadSmsMessages";
                dataListItems[0].image2 = "";
                dataListItems[0].disabled = false;
            }
        }
        if(this._newMessage)
        {
            log.debug("New message is available. Hence showing the green circle.");
            dataListItems[0].image2 = "common/images/icons/IcnListSMSPending.png";
        }
        this._currentContextTemplate.list2Ctrl.setDataList(this._inboxCtxtDataList);
        if(this._inboxCtxtDataList.itemCount)
        {
            this._currentContextTemplate.list2Ctrl.updateItems(0, this._inboxCtxtDataList.itemCount - 1);
        }
        //Sending event DataLoaded so that VUI can be informed that list is loaded on the screen.
        framework.sendEventToMmui(this.uiaId, "DataLoaded");
    }
};

// Populate Message Details Control
smsApp.prototype._populateMessageDisplay = function(message)
{
    if(this._currentContextTemplate)
    {
        if(message)
        {
            var getDateTime = null;
            var setDateTime = null;
            var body = null;
            var senderName = null;
            var messageHasAttachments = null;
            var noAttachmentSupportIcon = null;
            var ctrlData = null;
            var speedRestrictionMsgId = null;
            this._instanceIdOfDetail = null;
            var senderPhotoPath = null;
            //check if instance is connected or not..
            if(message && message.instance)
            {
                this._instanceIdOfDetail = message.instance.instanceID;
                log.info("Value of instanceId of message is = "+this._instanceIdOfDetail);
                log.info("No. of disconnected instances are: " +this._disconnectedInstances.length);
                for(var i=0; i<this._disconnectedInstances.length; i++)
                {
                    log.info("Disconnected instances are: " +this._disconnectedInstances[i]);
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
            getDateTime = message.datetime;
            log.info("Date time value recived from MMUI is = "+getDateTime);
            if(getDateTime < 1)
            {
                getDateTime = 1;
            }
            log.info("Date time value from GUI is = "+getDateTime);
            setDateTime = utility.formatDateTime(getDateTime,false);
            //Sender PhotoPath
            if(message && message.sender && message.sender.senderPhotoPath)
            {
                senderPhotoPath = message.sender.senderPhotoPath;
            }
            else
            {
                senderPhotoPath = "common/images/icons/IcnListContact_En.png";
            }
            //From Field
            if(message && message.sender && message.sender.name)
            {
                senderName = message.sender.name;
            }
            //Attachments field
            if(message && message.hasAttachments)
            {
                messageHasAttachments = message.hasAttachments;
                noAttachmentSupportIcon = "common/images/icons/IcnListAttachmentDisallowed.png";
            }
            //Body
            if(message && this._vehicleMotionState)
            {
                speedRestrictionMsgId = "SpeedRestriction";
            }
            else if(message && message.body)
            {
                body = message.body;
            }
            //Play/Pause
            if(message && message.OPTION_Play)
            {
                this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("playpause", false);
            }
            else
            {
                this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("playpause", true);
            }
            if(this._pause === true)
            {
                this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonState("playpause", "Play");
            }
            if(this._pause === false)
            {
                this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonState("playpause", "Pause");
            }
            //Previous/Next Buttons
            log.info("isfirst is = "+message.isFirst);
            log.info("isLast is = "+message.isFirst);
            if(message && message.isFirst)
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
            if(message && message.isLast)
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
            //Reply and Delete
            if(this._instanceDisconnected)
            {
                //Disabling Reply and Delete
                log.info("Disabling Reply and Delete buttons because instance is disconnected");
                //Reply
                this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("reply", true);
                //Delete
                this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("delete", true);
            }
            else
            {
                if(message && message.OPTION_Reply)
                {
                    //Enabing Reply
                    this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("reply", false);
                }
                else
                {
                    //Disabling Reply
                    log.info("Disabling Reply button because MMUI is sending OPTION_Reply as true");
                    this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("reply", true);
                }
                if(message && message.OPTION_Delete)
                {
                    //Enabing Delete
                    this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("delete", false);
                }
                else
                {
                    //Disabling Delete
                    log.info("Disabling Delete button because MMUI is sending OPTION_Delete as true");
                    this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("delete", true);
                }
            }
            //UMP button Call
            if(message && message.OPTION_Call)
            {
                this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("call", false);
            }
            else
            {
                this._currentContextTemplate.messaging2Ctrl._umpCtrl.setButtonDisabled("call", true);
            }
            //Set Control Data
            ctrlData = {
                "messageTimestamp" : setDateTime,
                "messageSenderIcon" : senderPhotoPath,
                "messageSender" : senderName,
                "messageBody" : body,
                "messageHasAttachments" : messageHasAttachments,
                "noAttachmentSupportTextId" : "AttachmentNotSupported",
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
                "messageTimestamp" :  "",
                "messageSender" : "",
                "messageHasAttachments" : "",
                "messageBody" : ""
            };
            log.info("Setting Empty Control Data");
            this._currentContextTemplate.messaging2Ctrl.setConfig(ctrlData);
        }
    }
};

// populate reply/replyall information in SMSReply context
smsApp.prototype._populateSMSReply = function(message)
{
    if(message)
    {
        var dataListForSMSReply = new Array();
        var body = message.body;
        var recipientLabel = null;
        var addressLabel = null;
        var contactValue = null;
        this._instanceIdOfReply = null;
        recipientLabel = message.recipients.contacts[0];
        addressLabel = recipientLabel.addressList.addresses[0];
        if(message.instance)
        {
            this._instanceIdOfReply = message.instance.instanceID;
            log.info("Value of instanceId of reply message is = "+this._instanceIdOfReply);
            log.info("No. of disconnected instances are: " +this._disconnectedInstances.length);
            for(var i=0; i<this._disconnectedInstances.length; i++)
            {
                log.info("Disconnected instances are: " +this._disconnectedInstances[i]);
                if(this._instanceIdOfReply === this._disconnectedInstances[i])
                {
                    this._instanceDisconnected = true;
                    break;
                }
                else
                    this._instanceDisconnected = false;
            }
        }
        if(recipientLabel.type && recipientLabel.type === "MSG_CONTACT_RECIPIENT_TO")
        {
            if(recipientLabel.name && recipientLabel.name)
            {
                contactValue = recipientLabel.name;
                log.debug("value of contactValue = "+contactValue);
            }
            else if(addressLabel.address)
            {
                contactValue = addressLabel.address;
                log.debug("value of contactValue = "+contactValue);
            }
            if(contactValue)
            {
                dataListForSMSReply[dataListForSMSReply.length] = {
                    text1Id : "To",
                    text1SubMap : { To : contactValue },
                    itemStyle : "style17",
                    disabled : false,
                    vuiSelectable: false,
                    hasCaret : false
                };
            }
        }
        else
            log.debug("The contact is not of the correct type");
        dataListForSMSReply[dataListForSMSReply.length] = {
            appData : "SelectBody",
            text1Id : "Message",
            text1SubMap : {Msg : body},
            disabled : false,
            itemStyle : "style17",
            hasCaret : false
        };
        dataListForSMSReply[dataListForSMSReply.length] = {
            appData : "Send",
            text1Id : "Send",
            disabled : false,
            itemStyle : "style20",
            hasCaret : false
        };
        log.debug("Value of this._instanceDisconnected = "+this._instanceDisconnected);
        log.debug("Value of this._sendSuccess = "+this._sendSuccess);
        if(this._instanceDisconnected || !this._sendSuccess)
        {
            log.debug("If instance is diconnected then disable send button.");
            dataListForSMSReply[dataListForSMSReply.length-1].disabled = true;
            this._currentContextTemplate.list2Ctrl.focussedItem = dataListForSMSReply.length-2;
        }
        this._smsReplyCtxtDataList.items = dataListForSMSReply;
        this._smsReplyCtxtDataList.itemCount = dataListForSMSReply.length;
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "SMSReply")
        {
            this._currentContextTemplate.list2Ctrl.setDataList(this._smsReplyCtxtDataList);
            if(this._smsReplyCtxtDataList.itemCount)
            {
                this._currentContextTemplate.list2Ctrl.updateItems(0, this._smsReplyCtxtDataList.itemCount - 1);
            }
        }
    }
    else
    {
        var dataListForSMSReply = [
            { appData : "AddToContact", text1Id : "To", text1SubMap : {To : ""}, itemStyle : "style17", disabled : true, hasCaret : false },
            { appData : "SelectBody", text1Id : "Message", text1SubMap : {Msg : ""}, itemStyle : "style17", disabled : false, hasCaret : false },
            { appData : "Send", text1Id : "Send", itemStyle : "style20", disabled : true, hasCaret : false }
        ];
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "SMSReply")
        {
            log.debug("Populating list2ctrl for smsReply Context when fields are empty");
            this._smsReplyCtxtDataList.items = dataListForSMSReply;
            this._smsReplyCtxtDataList.itemCount = dataListForSMSReply.length;
            this._currentContextTemplate.list2Ctrl.setDataList(this._smsReplyCtxtDataList);
            if(this._smsReplyCtxtDataList.itemCount)
            {
                this._currentContextTemplate.list2Ctrl.updateItems(0, this._smsReplyCtxtDataList.itemCount - 1);
            }
        }
    }
};

// Call back function for preset messages
smsApp.prototype._ShowPresetMessageCallbackFn = function(msg)
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
                    this._populatePresetMsgList(this._cachedPresetMsgs);
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
            this._messagePresetListCtxtDataList.items = tempPresetDataList;
            this._messagePresetListCtxtDataList.itemCount = tempPresetDataList.length;
            this._currentContextTemplate.list2Ctrl.setDataList(this._messagePresetListCtxtDataList);
            this._currentContextTemplate.list2Ctrl.updateItems(0, this._messagePresetListCtxtDataList.items.length-1);
            this._currentContextTemplate.list2Ctrl.setLoading(false);
        }
    }
};

// populate preset messages in PresetMessage context
smsApp.prototype._populatePresetMsgList = function(presetMsgs)
{
    var presetMsgsDataList = new Array();
    if(presetMsgs && presetMsgs.presetMessagesCount)
    {
        for(var messageItem = 0; messageItem < presetMsgs.presetMessagesCount; messageItem++)
        {
            presetMsgsDataList.push({
                appData : "SelectPresetBody",
                text1 : presetMsgs.presetMessages[messageItem],
                itemStyle : "style17",
                disabled : false,
                hasCaret : false
            });
            this._presetMsgData.push({
                presetMsgText : presetMsgs.presetMessages[messageItem]
            });
        }
    }
    else
    {
        presetMsgsDataList[0] = {
                text1 : "",
                itemStyle : "style17",
                disabled : false,
                hasCaret : false
            };
    }
    this._messagePresetListCtxtDataList.items = presetMsgsDataList;
    this._messagePresetListCtxtDataList.itemCount = presetMsgsDataList.length;
    if(this._currentContextTemplate)
    {
        this._currentContextTemplate.list2Ctrl.setDataList(this._messagePresetListCtxtDataList);
        this._currentContextTemplate.list2Ctrl.updateItems(0, this._messagePresetListCtxtDataList.itemCount - 1);
    }
};

// Populate Dialog Ctrl
smsApp.prototype._populateDialogCtrl = function()
{
    log.info("smsApp _populateDialogCtrl called in context = " + this._currentContext.ctxtId);
    var text1Id = null;
    var text2Id = null;
    this._callBackCalled = true;
    if (this._currentContext && this._currentContextTemplate)
    {
        switch (this._currentContext.ctxtId)
        {
            case "ErrorCondition":
                log.info("Type of error is = " +this._cachedErrorCondition);
                //conditions for  ErrorCondition context
                if(this._cachedErrorCondition === "SMS_MEMORY_FULL_Type")
                {
                    text2Id = "MemoryFull";
                }
                if(this._cachedErrorCondition === "SMS_TTS_READ_FAIL_Type")
                {
                    text2Id = "TTSReadFail";
                }
                if(this._cachedErrorCondition === "SMS_NOTIFICATION_NOT_SUPPORTED_Type")
                {
                    text2Id = "NotificationNotSupported";
                }
                if(this._cachedErrorCondition === "SMS_INSTANCE_DISCONNECTED")
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
                log.info("Type of error is = " +this._cachedErrorConditionRetry);
                //conditions for  ErrorConditionRetry context
                if(this._cachedErrorConditionRetry === "SMS_MSG_DOWNLOAD_FAIL_Type")
                {
                    //this._currentContextTemplate.dialog3Ctrl.setDisabled("button2",false);
                    text1Id = "DownloadFail";
                    text2Id = "DownloadFailDesc";
                }
                if(this._cachedErrorConditionRetry === "SMS_MSG_LISTDOWNLOAD_FAIL_Type" 
                   || this._cachedErrorConditionRetry === "SMS_APPSDK_LISTDOWNLOAD_FAIL_Type")
                {
                    //this._currentContextTemplate.dialog3Ctrl.setDisabled("button2",false);
                    if (this._cachedErrorConditionRetry === "SMS_APPSDK_LISTDOWNLOAD_FAIL_Type")
                        this._AppSDKErrorCondition = true;
                    else 
                        this._listErrorCondition = true;
                    text1Id = "ListDownloadFail";
                    text2Id = "DownloadFailDesc";
                }
                if(this._cachedErrorConditionRetry === "SMS_MSG_SEND_FAIL_Type")
                {
                    log.info("Value of this._disableRetryForSend inside _populateDialogCtrl = "+this._disableRetryForSend);
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
                if(this._cachedErrorConditionRetry === "SMS_MSG_DELETE_FAIL_Type")
                {
                    log.info("Value of this._disableRetryForDelete inside _populateDialogCtrl = "+this._disableRetryForDelete);
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

//populate messages in Message Disambuguate context
smsApp.prototype._populateMessageDisambiguation = function(itemsList)
{
    if(this._currentContextTemplate)
    {
        var dataListMessageDisambiguation = new Array();
        var contactImage = null;
        var getDateTime = null;
        var setDateTime = null;
        log.info("Value of this._commonLoadingFlag inside populateEmailDisambiguation is = "+this._commonLoadingFlag);
        if(itemsList.length)
        {
            log.debug("inside itemsList");
            log.debug("length of itemsList is = "+itemsList.length);
            for (var i = 0; i < itemsList.length; i++)
            {
                log.debug("value of sender is :" +itemsList[i].sender);
                //setting sender's name
                if (itemsList[i].sender === "")
                {
                    log.debug("Sender is empty");
                    continue;
                }
                //setting sender's photopath
                if(itemsList[i].senderPhotoPath)
                {
                    contactImage = itemsList[i].senderPhotoPath;
                }
                else
                {
                    contactImage = "common/images/icons/IcnListContact_Placeholder.png";
                }
                //setting DateTime
                getDateTime = itemsList[i].datetime;
                if(getDateTime < 1)
                {
                    getDateTime = 1;
                }
                setDateTime = utility.formatSmartDateTime(getDateTime,false);
                dataListMessageDisambiguation.push({
                    appData : "SelectConversation",
                    text1 : itemsList[i].sender,
                    label1 : setDateTime,
                    label2 : itemsList[i].instance,
                    image1 : contactImage,
                    itemStyle : "style07",
                    styleMod : "hint",
                    hasCaret : false
                });
                this._msgIdForMsg[dataListMessageDisambiguation.length -1] = {
                    msgId : itemsList[i].id
                };
            }
        }
        this._msgDisambiguateCtxtDataList.items = dataListMessageDisambiguation;
        this._msgDisambiguateCtxtDataList.itemCount = dataListMessageDisambiguation.length;
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

// Call back function for Connection_in value 
smsApp.prototype._ConnectionValueCallbackFn = function(msg)
{
    log.info("Inside ConnectionValueCallbackFn..");
    if(msg && msg.params)
    {
        if(msg.params.status == 100)
        {
            this._connectionIn = msg.params.connection;
            log.info("Value of this._connectionIn = "+this._connectionIn );
        }
    }
};

//Call back function for Disconnection_in value 
smsApp.prototype._DisconnectionValueCallbackFn = function(msg)
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

// Populate Contacts disambiguate screen.
smsApp.prototype._populateContactsDisambiguationCtxt = function(contacts)
{
    if(contacts)
    {
        var params;
        this._ContactCount = contacts.contactCount;
        this.totalContactsCount = contacts.contactCount;
        log.info("value of this._ContactCount = " +this._ContactCount);
        if(this._ContactCount)
        {
            for(var i=0; i<this._ContactCount; i++)
            {
               this._contactIdList[i] = contacts.contactIdList[i];
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

/**************************
 * DBAPI METHOD RESPONSE HANDLERS *
 **************************/
 
//DBAPI open db callback
smsApp.prototype._openContactsDbCallbackFn = function(msg)
{
    log.info(" _openContactsDbCallbackFn  called...");
    var params;
    if (msg.msgContent.params.eCode == 0)
    {
        this._isContactsDbOpen = true;
        log.info("Contacts DB Open Success");
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

//DBAPI close db callback
smsApp.prototype._closeContactsDbCallbackFn = function(msg)
{
    log.info(" _closeContactsDbCallbackFn  called...");
    if (msg.msgContent.params.eCode === 0)
    {
        this._isContactsDbOpen = false;
        log.info("Contacts DB Close Success");
        if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "ContactsDisambiguation")
        {
            log.info("Populating populateContactsDisambiguationCtxt from closeContactsDbCallbackFn because db is now closed.");
            this._populateContactsDisambiguationCtxt(this._cachedContacts);
        }
    }
    else
    {
        log.info("Contacts DB Close failed");
    }
};

//DBAPI GetContactDetails callback
smsApp.prototype._getContactDetailsCallbackFn = function(msg)
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
            //Changes for SCR:SW00138763
            //Updating the datalist when the complete response is coming from DBAPI
            if(this._contactsDisambiguationDataList.itemCount === this.totalContactsCount){
              this.updateContactDisambigutionDataList(this._contactsDisambiguationDataList);
            }
        }
    }
};

smsApp.prototype.updateContactDisambigutionDataList = function(data){
      this._currentContextTemplate.list2Ctrl.setDataList(data);
      this._currentContextTemplate.list2Ctrl.updateItems(0,data.itemCount-1);
};

/**************************
 * Framework register
 **************************/
framework.registerAppLoaded("sms",null,true);