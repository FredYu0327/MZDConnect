/*
Copyright 2012 by Johnson Controls
__________________________________________________________________________

Filename: vdtApp.js
__________________________________________________________________________

Project: JCI-IHU
Language: EN
Author: asiddhs
Date:   11-Jun-2013 
__________________________________________________________________________

Description: IHU GUI Vehicle Data Transfer Application
______________________________________________________________________

Revisions:
v0.1 (11-Jun-2013) //File created according to UI spec "dri_vdt_details.docx" v:0.3.80
v0.2 (21-Aug-2013) //File updated after code review
v0.3 (23-Jul-2014) //File updated after code review as per new UI-SPEC.
v0.4 (13-Aug-2014) //File updates for the issue (Default settings for Phone settings should be ON).
v0.5 (27-Aug-2014) //File updates with new event (SelectClearDriveData) and changes in UmassProgressReadyToDisplay
v0.6 (03-Sep-2014) //File updates with migration to new spec 3.3
v0.7 (25-Sep-2014) //File updates with migration to new spec 3.12
v0.8 (26-Sep-2014) //File updates with changes related to SCR SW00153942
v0.9 (28-Oct-2014) //File updates with changes related to SCR SW00155707 (VDT Changes 1-1-C Drop Auto Record)
v0.10(31-Oct-2014) //File updates with changes related to SCR SW00156328 (SR_VDT-1246 : Display error wink if PIN set as Super User PIN)
v0.11(03-Nov-2014) //File updates with changes related to SCR SW00157323 (CMU Stuck at "Enter your PIN" Screen after pressing the OK button )
v0.12(13-Nov-2014) //File updates with changes with Baseline updatation
v0.13(12-Nov-2014) //SCR SW00156868	and SW00156870
v0.14(19-Nov-2014) //File updates with changes related to SCR SW00158171.(jinesh)
v0.15(27-Nov-2014) //File updates with changes in hvd_settingcb and two variables has been updated every time when we get checked/unchecked values of both settings 
v0.16(11-Dec-2014) //[VDT] "Start Recording Drive Log" is speed restricted
v0.17(19-Dec-2014) //[SC0323 Code Change] VDT UI FlowChange 
v0.18(9-Jan-2015) //[CI-1061][VDT UI Code Changes] VDT v0.3.09 changes
v0.19(12-Jan-2015) //[VDT] Drive Log Characters overlapping [Use of thickItems as true in drivechartdetails context]
v0.20(21-Jan-2015) //[GUI_VDT] :: "DriveChartDataDeleteSuccess" screen not shown(Wink alert id changed)
v0.21(03-Feb-2015) // [VDT UI] Cursor focus can moving to Drive Record which is under writing
v0.22(04-Feb-2015) //MY15 CMU VDT: The CMU does't set correctly 'Phone Data Transfer' setting option.
v0.23(26-Feb-2015) //[GUI_VDT] Drive Log Deletion needs to be tried 3 times in failure cases [Addition : "RetryDelete with eventData"]


__________________________________________________________________________ */

log.addSrcFile("vdtApp.js", "vdt");
log.setLogLevel("vdt", "debug");


/**
* App constructor
* =========================
* @param {string} - uiaid of the app
* @return {vdtApp} - extends baseApp
*/
function vdtApp(uiaId)
{
    log.debug("In vdtApp constructor...");

    // Base application functionality is provided in a common location via this call to baseApp.init().
    // See framework/js/BaseApp.js for details.
    baseApp.init(this, uiaId);
}


/**************************
* Standard App Functions *
**************************/


/**
* App init routine
* Called just after the app is instantiated by framework.
* =========================
* @return {void}
*/
vdtApp.prototype.appInit = function()
{
    log.debug("In vdtApp.prototype.appInit...");

/* ------------------------------
* TEST APPLICATION
* ------------------------------
*/
if (framework.debugMode)
{
    utility.loadScript("apps/vdt/test/vdtAppTest.js");
}

//Initialization of variables for PhoneTransferSettings Context
//Context Data List variable
//this._phoneTransferCtxtDataList           = null;
this._driveChartDetailsCtxtDataList = null;
this._phoneTransferCtxtDataList=null;
//Cache variable to store driver files
this._cached_VDTData                = null;
//this._isAutoRecordingOn               = null;

// Variable to store recording state
this._isRecordingOn                 = false;    // Default value taken false.

// Variable that stores the stop recording text. Its values will be stop recording and writing to file
// It is taken 'stop recording' by default. It will be 'writing to file' when user clicks stop recording and will remain that until MMUI sends activateDeavtivate true message
this._stopRecordingText             = "StartRecording";


//Variable to change screen from current pin to new pin
this._changePinScreen               = true; // Default value taken true.

//Variable to store checkbox value for both settings
this._driveChartData                = true;
this._myDoctorData                  = true;

// Variable that stores the stop recording enabled/disabled grey out status.
// It is taken false by default. It will be true when user clicks stop recording and will remain true until MMUI sends message
this._isStopRecordingDisabled       = true;

// Timer variable which stores timer that updates the seconds count in recording on state.
this._recordInterval                = null;     // Reference to the record interval timer

// Timer variables used to store time when countdown is going on
this._timerSeconds                  = 0;
this._timerMinutes                  = 0;
this._timerStart                    = null;

// Cache variable to store row number to delete
this._rowNoToDelete                 = null;

//Cache variable to store check values of toggle on MDD and DCD in VDTMenu
//this._toggleMDDTransferPhone        = true;
//this._toggleDCDTransferPhone        = true;

this._mdstatus						= false;

this._winkMessage                   = null;


//Protect Delete Structure to pass enum values.
this.protectDeleteStruct = new Array();
this.protectDeleteStruct["delete_request"] = "CMU_FILE_DELETE_REQUEST";
this.protectDeleteStruct["protect_on_request"] = "CMU_PROTECT_FILE_ON_REQUEST";
this.protectDeleteStruct["protect_off_request"] = "CMU_PROTECT_FILE_OFF_REQUEST";

/* 
* NOTE:
* Every time a function is bound (using bind()), a new
* function is created in memory. Whenever possible,
* only bind the same function once and use reference.
*/
// Function variables
this._listItemClickCallbackFunction = this._listItemClickCallback.bind(this);
this._dialogDefaultSelectCallbackFunction = this._dialogDefaultSelectCallback.bind(this);

/* ------------------------------
* DATALISTS
* Default datalists for list contexts
* ------------------------------
*/
this._driveChartDetailsCtxtDataList =    // Data List for DriveChartDetails Context
{
    itemCountKnown : true,
    itemCount : 1,
    items : [
                        { itemStyle : 'style02',appData : "SelectStartRecording", text1Id : "StartRecording", value : 1, hasCaret : false ,disabled : true},
                    ]
};

this._phoneTransferCtxtDataList =    // Data List for DataTransferToUSBDevice Context
{
    itemCountKnown : true,
    itemCount : 1,
    items : [
                { itemStyle : 'style02',appData : "SelectCDCSetting", text1Id : "PhoneDataTransfer",itemStyle : 'styleOnOff',hasCaret : false,labelWidth:'wide',value : this._driveChartData?1:2},            
            ]
};
this._cached_VDTData =
{
    "Log_Count"      : 0,
    "DriverId"       : "John",
    "DriverName"     : "John",
    "Driver_Files"   : []
};

/* ------------------------------
* CONTEXT TABLE
* Context descriptions and default content
* ------------------------------
*/
//@formatter:off
this._contextTable = {
"DriveChartDetails" :
{
    "template"                         : "List2Tmplt", 
    "leftBtnStyle"                     : "goBack",
    "sbNameId"                         : "DriveRecord",
    "sbNameIcon"                       : "common/images/icons/IcnSbnApps.png", 
    "controlProperties" :
    {
        "List2Ctrl" :
        {
            "dataList"                 : this._driveChartDetailsCtxtDataList, 
            titleConfiguration : 'listTitle', 
			thickItems		   : true,
            title : 
            {
                text1Id : "DriveRecord",
                titleStyle : "style02"
            }, 
            "selectCallback"            : this._listItemClickCallbackFunction,     //call back Function for DriveChartDetails
        } // end of properties for "List2Ctrl"
    }, // end of list of controlProperties
    "readyFunction"                    : this._DriveChartDetailsReadyToDisplay.bind(this),
  
}, // end of "DriveChartDetails" Context 


"ConfirmClearDriveChartData" :
{ 
    "template"                         : "Dialog3Tmplt",
    "sbNameId"                         : "DriveRecord",
    "controlProperties"    :
    {
        "Dialog3Ctrl" :
        {
            "defaultSelectCallback" : this._dialogDefaultSelectCallbackFunction,    //Call back function for ConfirmClearDriveChartData
            "contentStyle"             : "style02",
            "fullScreen"             : false,

            "buttonConfig" :
            {
                "button1" :
                {
                    buttonColor        : "normal",
                    buttonBehavior     : "shortPressOnly",
                    labelId            : "CancelButton",
                    appData         : "Global.Cancel",
                    disabled         : false
                },
                "button2" :
                {
                    buttonColor        : "normal",
                    buttonBehavior     : "shortPressOnly",
                    labelId            : "DeleteButton",
                    appData         : "SelectClearDriveData",
                    disabled         : false
                },
            }, // end of buttonConfig
            "text1Id"                 : "DeleteDriveChart",
        } // end of properties for "Dialog3Ctrl"
    }, // end of list of controlProperties
    "readyFunction"                    : this._ConfirmClearDriveChartDataReadyToDisplay.bind(this),
}, // end of "ConfirmClearDriveChartData" Context

"ConfirmONPhoneDataTransfer" : 
{ 
    "template"                         : "Dialog3Tmplt",
    "sbNameId"                         : "VTT",
    "sbNameIcon"                       : "common/images/icons/IcnSbnApps.png", 

    "controlProperties": 
    {
        "Dialog3Ctrl" :
        {
            "defaultSelectCallback" : this._dialogDefaultSelectCallbackFunction,//Call back function for ClearAllDataConfirm

            "contentStyle"             : "style02",
            "fullScreen"            : false,
			
			"initialFocus"			: 1,
            "buttonConfig" :
            {
                "button1" :
                {
                    buttonColor        : "normal",
                    buttonBehavior     : "shortPressOnly",
                    labelId            : "BackButton",
                    appData            : "Global.GoBack",
                    disabled           : false
                },
                "button2" : 
                {
                    buttonColor        : "normal",
                    buttonBehavior     : "shortPressOnly",
                    labelId            : "TurnONButton",
                    appData            : "TurnSettingON",
                    disabled           : false
                },
            }, // end of buttonConfig
            "text1Id"                 : "ConfirmTurnONPhoneDataTransfer", // Use string id :ConfirmTurnONPhoneDataTransfer 
        } // end of properties for "Dialog3Ctrl"
    }, // end of list of controlProperties
    "readyFunction"                    : this._ConfirmONPhoneDataTransferReadyToDisplay.bind(this),
}, // end of "ConfirmONPhoneDataTransfer" Context

"PhoneTransferSettings" :
{
    "template"                         : "List2Tmplt", 
    "leftBtnStyle"                     : "goBack",
    "sbNameId"                         : "VTT",
    
    "controlProperties" :
    {
        "List2Ctrl" :
        {
            "dataList"                 : this._phoneTransferCtxtDataList, 
            "selectCallback"           : this._listItemClickCallbackFunction,     //Delete call back Function for PhoneTransferSettings
        } // end of properties for "List2Ctrl"
    }, // end of list of controlProperties
    "readyFunction"                    : this._phoneTransferReadyToDisplay.bind(this),
   
}, // end of "PhoneTransferSettings" Context 


"RetryDelete" : 
{ 
    "template"                         : "Dialog3Tmplt",
    "sbNameId"                         : "DriveRecord",
    "sbNameIcon"                       : "common/images/icons/IcnSbnApps.png", 
    "controlProperties": 
    {
        "Dialog3Ctrl" :
        {
            "defaultSelectCallback" : this._dialogDefaultSelectCallbackFunction,//Call back function for RetryDelete
            //"titleStyle"             : "titleStyle02",
            //"titleId"                 : "ClearDataTitle",
            "contentStyle"             : "style02",
            "fullScreen"            : false,
            "initialFocus": 2,
            "buttonConfig" :
            {
                "button1" :
                {
                    buttonColor        : "normal",
                    buttonBehavior     : "shortPressOnly",
                    labelId            : "CancelButton",
                    appData         : "Global.Cancel",
                    disabled         : false
                },
                "button2" : 
                {
                    buttonColor        : "normal",
                    buttonBehavior     : "shortPressOnly",
                    labelId            : "RetryButton",
                    appData         : "SelectRetry",
                    disabled         : false
                },
            }, // end of buttonConfig
            "text1Id"                 : "DeleteDriveChartRetry",

        } // end of properties for "Dialog3Ctrl"
    }, // end of list of controlProperties
    "readyFunction"                    : this._ClearDataRetryReadyToDisplay.bind(this),
}, // end of "RetryDelete" Context




"ProtectionError" : 
{ 
    "template"                         : "Dialog3Tmplt",
    "controlProperties": 
    {
        "Dialog3Ctrl" : 
        {
            "defaultSelectCallback" : this._dialogDefaultSelectCallbackFunction,//Call back function for ProtectionError
            "contentStyle"             : "style02",
            "fullScreen"             : false,
            "buttonConfig" :
            {
                "button1" : 
                {
                    buttonColor        : "normal",
                    buttonBehavior     : "shortPressOnly",
                    labelId            : "common.Ok",
                    appData         : "Global.Yes",
                    disabled         : false
                },    
            }, // end of buttonConfig
            "text1Id"                 : "ProtectionErrorDialogText",
        } // end of properties for "Dialog3Ctrl"
    }, // end of list of controlProperties
    "readyFunction"                    : this._ProtectionErrorReadyToDisplay.bind(this),
}, // end of "ProtectionError" Context


};// end of this.contextTables
//@formatter:off



/* ------------------------------
* MESSAGE TABLE
* Message handlers
* ------------------------------
*/


    this._messageTable =
    {

        "RecordingTimeElapses"                  : this._RecordingTimeElapsesHandler.bind(this),
        "DriveFileList"                         : this._DriveFileList.bind(this),
        "SBNMessage"                            : this._SBNMessageHandler.bind(this),
        "activateDeactivate"                    : this._activateDeactivateMsgHandler.bind(this),
        "EOLConfig"                             : this._EOLConfigMsgHandler.bind(this), 
        "HVD_Setting"                           : this._HVD_SettingMsgHandler.bind(this),
        "EnableStopRecording"                   : this._enableStopRecording.bind(this),
        "Global.AtSpeed"                        : this._speedMsgHandler.bind(this),
        "Global.NoSpeed"                        : this._speedMsgHandler.bind(this),
		"MDStatus"                  			 : this._MDStatusMsgHandler.bind(this),   
    };// end of messageTable
};    //End of appInit function


/**************************
* vdtApp App Functions *
**************************/

/**
* =========================
* Context Handlers
* =========================
* VDT Context List
* - DriveChartDetails           (list)  
* - ConfirmCleariDMData     (dialog)
* - ConfirmClearAllData     (dialog)
* - ClearDataRetry              (dialog)
* - RetryDelete             (dialog)
* - SendDataRetry               (dialog)
* - USBMemoryFull               (dialog)
* - InsertUSB                   (dialog)
* - InsertUSB                   (dialog)
* - ProtectionError         (dialog)
* - USBTransferProgress     (dialog)
* =========================
*/


/**
* Context In Callback (VDTMenu)
* =========================
* @return {void}
*/

vdtApp.prototype._DriveChartDetailsReadyToDisplay = function(params)
{
    log.debug("In vdtApp.prototype._DriveChartDetailsReadyToDisplay");
    this._cachedSpeed = framework.common.getAtSpeedValue();
    if(this._cachedSpeed)
    {
        for(var dataListCount = 0; dataListCount < this._driveChartDetailsCtxtDataList.itemCount; dataListCount++ )
        {
            this._driveChartDetailsCtxtDataList.items[dataListCount].disabled = this._cachedSpeed;
        }
		this._rebuildCtxtDataLists();
        this._refreshScreens();
    }
    else
    {
        //Recording status

        this._driveChartDetailsCtxtDataList.items[0].disabled = this._cachedSpeed | this._isStopRecordingDisabled;
        //this._driveChartDetailsCtxtDataList.items[0].disabled=false;

        for(var dataListCount = 1; dataListCount < this._driveChartDetailsCtxtDataList.itemCount; dataListCount++ )
        {
            this._driveChartDetailsCtxtDataList.items[dataListCount].disabled = this._cachedSpeed;
        }
        this._rebuildCtxtDataLists();
        this._refreshScreens();
    }
}; //End of _DriveChartDetailsReadyToDisplay function


vdtApp.prototype._phoneTransferReadyToDisplay = function(params)
{
    log.debug("In vdtApp.prototype._phoneTransferReadyToDisplay");
    this._cachedSpeed = framework.common.getAtSpeedValue();
    log.info("this._cachedSpeed : "+this._cachedSpeed);
	var value =	this._driveChartData;
		if(this._cachedSpeed)
		{
			this._phoneTransferCtxtDataList.items[0].disabled = true;
			this._currentContextTemplate.list2Ctrl.setToggleValue(0, value ? 1 : 2);
			//this._phoneTransferCtxtDataList.items[0].value=this._driveChartData?1:2;
		}
		else
		{
			
			this._phoneTransferCtxtDataList.items[0].disabled = false;
			this._currentContextTemplate.list2Ctrl.setToggleValue(0, value ? 1 : 2);
			//this._phoneTransferCtxtDataList.items[0].value=this._driveChartData?1:2;
			this._rebuildCtxtDataLists();	
		}
        this._refreshScreens();
    
};    //End of _phoneTransferReadyToDisplay function

/**
* Ready Callback (ConfirmCleariDMData)
* =========================
* @return {void}
*/
vdtApp.prototype._ConfirmClearDriveChartDataReadyToDisplay = function(params)
{
    log.debug("In vdtApp.prototype._ConfirmCleariDMDataReadyToDisplay");
    log.warn("Value of this._cachedSpeed is = "+this._cachedSpeed);
    if(this._cachedSpeed)
    {
        log.warn("Disable Delete button because Vehicle Speed is not within the limit.");
        this._currentContextTemplate.dialog3Ctrl.setDisabled("button2",true);
        this._currentContextTemplate.dialog3Ctrl._selectBtn(0);
    }
    else
    {
        this._currentContextTemplate.dialog3Ctrl.setDisabled("button2",false);
    }
};    //End of _ConfirmCleariDMDataReadyToDisplay function



/**
* Ready Callback (ClearDataRetry)
* =========================
* @return {void}
*/
vdtApp.prototype._ClearDataRetryReadyToDisplay = function(params)
{
    log.debug("In vdtApp.prototype._ClearDataRetryReadyToDisplay");
};    //End of _ClearDataRetryReadyToDisplay function


vdtApp.prototype._ConfirmONPhoneDataTransferReadyToDisplay = function(params)
{
    log.info("In vdtApp.prototype._ConfirmONPhoneDataTransferReadyToDisplay");
    if(this._cachedSpeed)
    {
		
        log.warn("Disable Delete button because Vehicle Speed is not within the limit.");
        this._currentContextTemplate.dialog3Ctrl.setDisabled("button2",true);
    }
    else
    {
        this._currentContextTemplate.dialog3Ctrl.setDisabled("button2",false);
    }
};    //End of _ConfirmONPhoneDataTransferReadyToDisplay function

/**
* Ready Callback (ProtectionError)
* =========================
* @return {void}
*/
vdtApp.prototype._ProtectionErrorReadyToDisplay = function(params)
{
log.debug("In vdtApp.prototype._ProtectionErrorReadyToDisplay");
};    //End of _ProtectionErrorReadyToDisplay function





/**
* =========================
* Message Handlers
* =========================
* - RecordingTimeElapses                   (PhoneTransferSettings)
* - DriveFileList                         (PhoneTransferSettings)
* - EnableStartRecording                 (PhoneTransferSettings)
* - StopRecording                         (PhoneTransferSettings)
* - Global.AtSpeed                        (USBTransfer, PhoneTransferSettings)
* - Global.NoSpeed                       (USBTransfer, PhoneTransferSettings)
* =========================
*/


/**
* Message Handler (DriveFileList)
* =========================
* @param {object}
* @return {void}
*/
vdtApp.prototype._DriveFileList = function(msg)
{
    log.debug("In vdtApp.prototype._DriveFileList");
    this._cached_VDTData = null;
    /*
    * Handler used to get the driver log files to show.
    * (This data would normally come from MMUI)
    */

    if(msg && msg.params && msg.params.payload && msg.params.payload.FileList)
    {
        this._cached_VDTData = msg.params.payload.FileList;
        
        /*   
        this._isAutoRecordingOn = false;
        if(this._cached_VDTData && this._cached_VDTData.Log_Count>0)
        {

        for(var i=0; i<this._cached_VDTData.Log_Count; i++)
        {

        if(this._cached_VDTData.Driver_Files[i].isAutoRecordingOn == true)
        {
        log.info("this._cached_VDTData.Driver_Files[i].isAutoRecordingOn"+this._cached_VDTData.Driver_Files[i].isAutoRecordingOn);
        this._isAutoRecordingOn = true;
        this._startRecording();
        break;
        }
        }
        }*/

        this._rebuildCtxtDataLists();
        this._refreshScreens();
    }
};     //End of _DriveFileList function


/**
* Message Handler (Global.AtSpeed, Global.NoSpeed)
* =========================
* @param {object}
* @return {void}
*/
vdtApp.prototype._speedMsgHandler = function()
{
    log.info("In vdtApp.prototype._speedMsgHandler");
    this._cachedSpeed = framework.common.getAtSpeedValue();
    log.info("this._cachedSpeed:"+this._cachedSpeed);

    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId)
    {
        switch (this._currentContext.ctxtId)
        {
			case "DriveChartDetails":
            {
                //Recording status
                this._driveChartDetailsCtxtDataList.items[0].disabled = this._isStopRecordingDisabled; 		//SW00158927
                //Logs
                for(var dataListCount = 1; dataListCount < this._driveChartDetailsCtxtDataList.itemCount; dataListCount++ )
                {
                    this._driveChartDetailsCtxtDataList.items[dataListCount].disabled = this._cachedSpeed;
                }
                this._refreshScreens();
            }
            break;
			
            case "PhoneTransferSettings":
            {
				
				if(this._cachedSpeed)
				{
					this._phoneTransferCtxtDataList.items[0].disabled = true;
				}
				else
				{
					this._phoneTransferCtxtDataList.items[0].disabled = this._mdstatus;
				}
                this._refreshScreens();
            }
            break;

            case "ConfirmClearDriveChartData":
            {
                if(this._cachedSpeed)
                {
                    log.warn("Disable Delete button because Vehicle Speed is not within the limit.");
                    this._currentContextTemplate.dialog3Ctrl.setDisabled("button2",true);

                }
                else
                {
                    this._currentContextTemplate.dialog3Ctrl.setDisabled("button2",false);
                }
            }
            break;


            case "ConfirmONPhoneDataTransfer":  
            {
                if(this._cachedSpeed)
                {
                    log.warn("Disable Delete button because Vehicle Speed is not within the limit.");
                    this._currentContextTemplate.dialog3Ctrl.setDisabled("button2",true);
					this._currentContextTemplate.dialog3Ctrl.setDisabled("button1",true);
                }
                else
                {
                    this._currentContextTemplate.dialog3Ctrl.setDisabled("button2",false);
					this._currentContextTemplate.dialog3Ctrl.setDisabled("button1",false);
                }
            }
            break;

            
            case "RetryDelete" :
            {
                if(this._cachedSpeed)
                {
                    log.warn("Disable Delete button because Vehicle Speed is not within the limit.");
                    this._currentContextTemplate.dialog3Ctrl.setDisabled("button2",true);
                }
                else
                {
                    this._currentContextTemplate.dialog3Ctrl.setDisabled("button2",false);
                }
            }
            break;


            default:
                log.warn("vdtApp: Unknown context:"+this._currentContext.ctxtId+" for vdtApp.prototype._speedMsgHandler.");
            break;
        }
    }  
};     //End of _speedMsgHandler function


/**
* Message Handler (SBNMessage)
* =========================
* @param {object}
* @return {void}
*/
vdtApp.prototype._SBNMessageHandler = function(msg)
{
    log.debug("In vdtApp.prototype._SBNMessageHandler");
    if(msg.params.payload.sbnmessage)
    {
        switch (msg.params.payload.sbnmessage)
        {
            case "ShowSuccessfulDataDeleteSBN":
            this._TimedSbn_DriveChartDeletedSuccessful();
            break;

            case "ShowDataCouldNotbeDeletedSBN":
            this._TimedSbn_DriveChartDeletedFailure();
            break;

            default:
            log.warn("vdtApp: SBN Received:"+this._currentContext.ctxtId+" for vdtApp.prototype._SBNMessageHandler.");
            break;
        }
    }
};     //End of _SBNMessageHandler function



/**
* Message Handler (_TimedSbn_DriveChartDeletedSuccessful)
* =========================
* @param {object}
* @return {void}
*/
vdtApp.prototype._TimedSbn_DriveChartDeletedSuccessful = function()
{
    framework.common.startTimedSbn(this.uiaId, "DriveChartDeletedSuccessful", "DriveChartDeletedSuccessful", {sbnStyle : "Style02", imagePath1 : 'IcnSbnApps.png', text1Id : "DriveChartDeleteSuccess"}); // add/update a state SBN in the display queue
};     //End of _TimedSbn_DriveChartDeletedSuccessful function




/**
* Message Handler (_TimedSbn_DriveChartDeletedFailure)
* =========================
* @param {object}
* @return {void}
*/
vdtApp.prototype._TimedSbn_DriveChartDeletedFailure = function()
{
    framework.common.startTimedSbn(this.uiaId, "DriveChartDeletedFailure", "DriveChartDeletedFailure", {sbnStyle : "Style02", imagePath1 : 'IcnSbnApps.png', text1Id : "DriveChartDeleteFailure"}); // add/update a state SBN in the display queue
};     //End of _TimedSbn_DriveChartDeletedFailure function



/**
* Message Handler (RecordingTimeElapses)
* =========================
* @param {object}
* @return {void}
*/
vdtApp.prototype._RecordingTimeElapsesHandler = function(msg)
{
    log.debug("In vdtApp.prototype._RecordingTimeElapsesHandler");
    if(msg.params.payload.RecordingTimeElapses != null && (msg.params.payload.RecordingTimeElapses=="True" || msg.params.payload.RecordingTimeElapses=="true"))
    {
        this._stopRecording();
    }
};     //End of _RecordingTimeElapsesHandler function




/**
* Message Handler (_activateDeactivateMsgHandler)
* =========================
* @param {object}
* @return {void}
*/
vdtApp.prototype._activateDeactivateMsgHandler = function(msg)
{
    log.debug("In vdtApp.prototype._activateDeactivateMsgHandler");
    if(msg.params.payload.recordingStatus)
    {
        switch (msg.params.payload.recordingStatus) 
        {
            case "FILE_WRITE_INPROGRESS" :
            //Do nothing. The Recording option should be greyed out while we get this message
            break;
            case "FILE_WRITE_COMPLETE" :
            // This was sent while recording was on. Change 'Writing to file..' text and stop recording process
            if(this._isRecordingOn)
            {
                this._stopRecording();                    
                this._isRecordingOn = false;
                this._rebuildCtxtDataLists();
                this._refreshScreens();
            }
            break;
            case "MANUAL_RECORDING_DISABLE" :
            {
                this._isStopRecordingDisabled = true;
                this._rebuildCtxtDataLists();
                this._refreshScreens();
            }
            break;
            case "MANUAL_RECORDING_ENABLE" :
            {
                this._isStopRecordingDisabled = false;
                this._rebuildCtxtDataLists();
                this._refreshScreens();
            }
            break;
            case "RECORDING_MAX" :
            //Do nothing. This value is not expected.
            break;

        }
    }   
};     //End of _activateDeactivateMsgHandler function


/**
* Message Handler (_EOLConfigMsgHandler)
* =========================
* @param {object}
* @return {void}
*/

vdtApp.prototype._EOLConfigMsgHandler = function(msg)
{
    log.debug("In vdtApp.prototype._EOLConfigMsgHandler");
    var setting_type=msg.params.payload.Type;
    var setting_value=msg.params.payload.Value;
	
    if(msg.params.payload.Type)
    {

        log.info("In vdtApp.prototype._EOLConfigMsgHandler");
        log.info("setting_type"+setting_type);
		log.info("setting_value"+setting_value);
	

        switch(setting_type)
        {
            case "EOL_DRIVECHART_DISPLAY" :
            {
				this._drivechart_status=setting_value;
				log.info("this._drivechart_status : "+this._drivechart_status);
				log.info("this._mydoctor_status : "+this._mydoctor_status);
				log.info("this._driveChartData : "+this._driveChartData);
                if(this._mydoctor_status)
                {
                    if(this._driveChartData)
                    {
						/*
                        this._phoneTransferCtxtDataList =    // Data List for PhoneTransferSettings Context
                        {
                            itemCountKnown : true,
                            itemCount : 4,
                            items : 
                            [
                                { itemStyle : 'style02',appData : "SelectPhoneDataTransfer", text1Id : "PhoneDataTransfer", hasCaret : true,labelWidth:'wide'},            
                                { itemStyle : 'style02',appData : "SelectUSBDataTransfer", text1Id : "USBTransferTitle", hasCaret : true,labelWidth:'wide'},            
                                { itemStyle : 'style02',appData : "SelectDriveChartDetails", text1Id : "DriveChartDetails", hasCaret :true,labelWidth:'wide'},
                                { itemStyle : 'style02',appData : "SelectClearAllData", text1Id : "ClearAllData", hasCaret :true,labelWidth:'wide'}
                            ]
                        };
						*/
                    }   

                    this._phoneTransferSettingsCtxtDataList =    // Data List for phoneTransferSettings Context
                    {
                        itemCountKnown : true,
                        itemCount : 2,
                        items : 
                        [
                            { itemStyle : 'style02',appData : "SelectCDCSetting", text1Id : "DriveChartDataTransfer", itemStyle : "styleOnOff",  hasCaret : false,value : this._toggleDCDTransfer?1:2,disabled : !this._drivechart_status},
                            { itemStyle : 'style02',appData : "SelectMDDSetting", text1Id : "MyDoctorDataTransfer", itemStyle : "styleOnOff", hasCaret : false,value : this._toggleMDDTransfer?1:2 ,disabled : !this._mydoctor_status},        
                        ]
                    };

                }
                else
                {
					this._phoneTransferSettingsCtxtDataList =    // Data List for phoneTransferSettings Context
                    {
                        itemCountKnown : true,
                        itemCount : 2,
                        items : 
                        [
                            { itemStyle : 'style02',appData : "SelectCDCSetting", text1Id : "DriveChartDataTransfer", itemStyle : "styleOnOff", hasCaret : false ,value : this._toggleDCDTransfer?1:2,disabled : !this._drivechart_status},
                            { itemStyle : 'style02',appData : "SelectMDDSetting", text1Id : "MyDoctorDataTransfer", itemStyle : "styleOnOff", hasCaret : false,value : this._toggleMDDTransfer?1:2,disabled : !this._mydoctor_status },
                        ]
                    };
                }
             //   this._drivechart_status=false;
                this._rebuildCtxtDataLists();
                this._refreshScreens(); 
            }
            break;

            case "EOL_MYDOCTOR_DISPLAY" :
            {
				this._mydoctor_status=setting_value;
                log.info("this._drivechart_status : "+this._drivechart_status);
                log.info("this._driveChartData : "+this._driveChartData);
                if(this._drivechart_status)
                {   /*
					this._phoneTransferCtxtDataList =    // Data List for VDTMenu Context
                    {
                        itemCountKnown : true,
                        itemCount : 2,
                        items : 
                        [
                            { itemStyle : 'style02',appData : "SelectPhoneDataTransfer", text1Id : "PhoneDataTransfer", hasCaret : true,labelWidth:'wide'},            
                            { itemStyle : 'style02',appData : "SelectUSBDataTransfer", text1Id : "USBTransferTitle", hasCaret : true,labelWidth:'wide'}         
                        ]
                    };
					*/

                    this._phoneTransferSettingsCtxtDataList =    // Data List for phoneTransferSettings Context
                    {
                        itemCountKnown : true,
                        itemCount : 2,
                        items : 
                        [
                            { itemStyle : 'style02',appData : "SelectCDCSetting", text1Id : "DriveChartDataTransfer", itemStyle : "styleOnOff",  hasCaret : false,value : this._toggleDCDTransfer?1:2,disabled : !this._drivechart_status},
                            { itemStyle : 'style02',appData : "SelectMDDSetting", text1Id : "MyDoctorDataTransfer", itemStyle : "styleOnOff", hasCaret : false,value : this._toggleMDDTransfer?1:2 ,disabled : !this._mydoctor_status},        

                        ]
                    };
                    
                    //this._refreshScreens();       
                }
                else
                {
					
					log.info("this._drivechart_status : "+this._drivechart_status);
					this._phoneTransferSettingsCtxtDataList =    // Data List for phoneTransferSettings Context
                    {
                        itemCountKnown : true,
                        itemCount : 2,
                        items : 
                        [
                            { itemStyle : 'style02',appData : "SelectCDCSetting", text1Id : "DriveChartDataTransfer", itemStyle : "styleOnOff", hasCaret : false ,value : this._toggleDCDTransfer?1:2,disabled :true},
                            { itemStyle : 'style02',appData : "SelectMDDSetting", text1Id : "MyDoctorDataTransfer", itemStyle : "styleOnOff", hasCaret : false,value : this._toggleMDDTransfer?1:2,disabled :false},
                        ]
                    };
                    

                }

                //this._mydoctor_status=false;
                this._rebuildCtxtDataLists();
                this._refreshScreens(); 
            }
            break;

            default :
            break


        }


    }
};







/*
* Message Handler (_HVD_SettingMsgHandler)
* =========================
* @param {object}
* @return {void}
*/
vdtApp.prototype._HVD_SettingMsgHandler = function(msg)
{
    var setting_Type=msg.params.payload.VDT_Setting_Type;
    var status=msg.params.payload.is_HVDOnOff;
    //var OnOff_status=msg.params.payload.is_HVDOnOff;

    log.debug("In vdtApp.prototype._HVD_SettingMsgHandler");
	log.info("this._driveChartData:"+this._driveChartData);
    if(msg.params.payload.VDT_Setting_Type)
    {
        log.info("In vdtApp.prototype._HVD_SettingMsgHandler");
        switch (setting_Type) 
        {
            case "HVD_DriveChartDataMD" :
            {
                if(status)
                {
						log.info("status : "+status);
                    this._toggleDCDTransfer=true;

                    this._phoneTransferSettingsCtxtDataList.items[0].value = 1;//this._toggleDCDTransfer?1:2;
                    
                   
                    this._driveChartData=true;
                    this._refreshScreens(); 
                }
				else
				{
					log.info("status : "+status);
					this._toggleDCDTransfer=false;
                    this._phoneTransferSettingsCtxtDataList.items[0].value = 2;//this._toggleDCDTransfer?1:2;
                    
                    
                    this._driveChartData=false;
                    this._refreshScreens(); 
				
				}

            }
            break; 
            case "HVD_MyDoctorDataMD" :
            {   
                if(status)
                {
                    this._toggleMDDTransfer=true;
                    this._phoneTransferSettingsCtxtDataList.items[1].value = this._toggleMDDTransfer?1:2;
                    this._myDoctorData=true;
                    this._refreshScreens(); 
                }

            }    
            break;
            default :
            break;
        }
    }


};     //End of _HVD_SettingMsgHandler function


vdtApp.prototype._enableStopRecording = function(msg)
{
    log.debug("In vdtApp.prototype._enableStopRecording");
    if(msg.params.payload.enablestoprecording != null)
    {
        if(msg.params.payload.enablestoprecording === true || msg.params.payload.enablestoprecording === "true" || msg.params.payload.enablestoprecording === "True")
        {
            this._stopRecording();
        }
    }
};     //End of _enableStopRecording function



/*******************************************************************************
* This function is called by Common whenever a msgType="alert" comes from MMUI *
* This function should return a properties Object to use for the WinkCtrl *
*******************************************************************************/

vdtApp.prototype.getWinkProperties = function(alertId, params)
{
    log.info("common is looking for wink properties: "+alertId);
    var winkProperties = null;
    switch (alertId)
    {
        case "GUI_SuccessfulDataDelete_Alert" :
            winkProperties = {
            "style": "style03",
            "text1Id": "DriveChartDataDeleted", 
            //"text2Id": "Deleted"
            };
	
		log.info("GUI_SuccessfulDataDelete_Alert");

            this._isCopyingData = false;
            this._rebuildCtxtDataLists();
            this._refreshScreens();
        break;


     

        default:
            log.info("No case found for alertId:"+alertId);
        break;
    }
    // return the properties to Common
    return winkProperties;
};


/**
* =========================
* Control Callbacks
* =========================
*/





vdtApp.prototype._listItemClickCallback = function(listCtrlObj, appData, params)
{
    log.debug("In vdtApp.prototype._listItemClickCallback");

    var buttonClicked = params.additionalData;
    var status = "off";
    switch (this._currentContext.ctxtId)
    {

	
    case "PhoneTransferSettings" :
        log.info("sending value :" + appData);
        log.info("entering into listcallback this._driveChartData : " + this._driveChartData);
        switch(appData)
        {
            case "SelectCDCSetting" :
                if(this._driveChartData)
                {
					this._driveChartData=false;
                    framework.sendEventToMmui(this.uiaId,"SelectCDCSetting",{payload:{onOffValue :  "DriveChartDataMD_OFF"}});
                    log.info("on sending off value , this._driveChartData :" + this._driveChartData);		
                }
                else
                {	
                    this._driveChartData=false;
                    framework.sendEventToMmui(this.uiaId, "SelectCDCSetting",{payload:{onOffValue : "DriveChartDataMD_ON"}});
                    log.info(" on sending tru value , this._driveChartData :" + this._driveChartData);
                }
            break;
        }
        this._rebuildCtxtDataLists();
        this._refreshScreens();
    break;
	
    case "DriveChartDetails" :
    // If click is on log files, and not on Start/Stop recording menu item(itemindex=0)
    if(params.itemIndex > 0)
    {

        // Declare the variable payload which will be sent to MMUI
        var payloadData = null;

        // If user has clicked delete.
        if(params.additionalData === "delete")
        {
            this._rowNoToDelete = this._driveChartDetailsCtxtDataList.items[params.itemIndex].appData.logNo;
            payloadData =
            {
            "payload":
            {
            "driverID_logNumber"     : this._driveChartDetailsCtxtDataList.items[params.itemIndex].appData.logNo,
            "deleteRequest"     : this.protectDeleteStruct["delete_request"]        /* see VDT_CMU_File_Prot_Del_Request_e */
            }
            };
            framework.sendEventToMmui(this.uiaId, "SelectClearLogData", payloadData );
            break;

        }

        // If user has clicked unlock
        else if(params.additionalData === "unlock")
        {
            // If click is on same log, unlock it.
            payloadData = 
            {
                "payload" :
                {
                    "logNumber"         : this._driveChartDetailsCtxtDataList.items[params.itemIndex].appData.logNo,
                    "onOffValue"        : this.protectDeleteStruct["protect_off_request"]       /* see VDT_CMU_File_Prot_Del_Request_e */
                }
            };
            framework.sendEventToMmui(this.uiaId, "SetProtectFilesOnOff",payloadData );
        }

        // If user has clicked lock
        else if(params.additionalData === "lock")
        {
            payloadData = 
            {
                "payload" :
                {
                    "logNumber"         : this._driveChartDetailsCtxtDataList.items[params.itemIndex].appData.logNo,
                    "onOffValue"        : this.protectDeleteStruct["protect_on_request"]       /* see VDT_CMU_File_Prot_Del_Request_e */
                }
            };
            framework.sendEventToMmui(this.uiaId, "SetProtectFilesOnOff", payloadData);
        }
    }

    // params.itemIndex is 0 which means user has clicked on start/stop recording
    else
    {
        switch(appData)
        {
            case "SelectStartRecording" :
                //    this._cached_VDTData = null;
                this._isStopRecordingDisabled=false;
                this._stopRecordingText="StopRecording";
                this._startRecording();
                this._rebuildCtxtDataLists();
                this._refreshScreens();
                framework.sendEventToMmui(this.uiaId, appData);
            break;

            case "SelectStopRecording" :
                // Stop recording clicked. Goto Writing to file state
                this._stopRecordingText = "writingToFile";
                this._isStopRecordingDisabled = false;
                // Stop the timer as it refreshes the list every second.
                clearInterval(this._recordInterval);
                this._rebuildCtxtDataLists();
                this._refreshScreens();
                framework.sendEventToMmui(this.uiaId, appData);
            break;

            default:
                log.warn("vdtApp: Unknown Appdata", appData);
            break;
        }
    }
    break;

   
    default:
        log.warn("vdtApp: Unknown context", this._currentContext.ctxtId);
    break;
    }
};     //End of _listItemClickCallback function


/**
* Dialog Select Callback
* =========================
* @param {Dialog3Ctrl}
* @param {string}
* @param {object}
* @return {void}
*/
vdtApp.prototype._dialogDefaultSelectCallback = function(dialogBtnCtrlObj, appData, params)
{
    log.debug("In vdtApp.prototype._dialogDefaultSelectCallback");
    if(this._currentContext && this._currentContext.ctxtId)
    {
        switch(this._currentContext.ctxtId)
        {
                case "ConfirmClearDriveChartData" :
                switch(appData)
                {
                    case "Global.Cancel" :
                        framework.sendEventToMmui("common","Global.Cancel", null);
                    break;


                    case "SelectClearDriveData": 
                        log.debug("case SelectClearDriveData. this._rowNoToDelete:"+this._rowNoToDelete);
                        payloadData =
                        {
                            "payload":
                            {
                                "driverID_logNumber"    : this._rowNoToDelete,
                                "deleteRequest"         :  this.protectDeleteStruct["delete_request"]        /* see VDT_CMU_File_Prot_Del_Request_e */
                            }
                        };

                        framework.sendEventToMmui(this.uiaId, appData,payloadData);
                    break;

                    default:
                        log.debug("Event not found");
                    break;
                }
                break;

            case "DriveChartDetails" :
                switch(appdata)
                {
                    case "Global.GoBack" :
                    framework.sendEventToMmui("common","Global.GoBack", null);
                    break;
                }
            break;
            case "ConfirmONPhoneDataTransfer" :
                switch(appData)
                {
                    case "Global.GoBack" :
                        this._driveChartData=false;
                        framework.sendEventToMmui("common",appData, null);
                    break;

                    case "TurnSettingON" :
                        this._driveChartData=true;
                        framework.sendEventToMmui(this.uiaId,appData);
                    break;
                }
            break;


            case "RetryDelete" :
                switch(appData)
                {
                    case "Global.Cancel" :
                        this._isClearingData = false;
                        this._rebuildCtxtDataLists();
                        this._refreshScreens();
                        framework.sendEventToMmui("common",appData, null);
                    break;

                    case "SelectRetry":   
                        this._isClearingData = true;
                        this._rebuildCtxtDataLists();
                        this._refreshScreens();
						payloadData =
                        {
                            "payload":
                            {
                                "driverID_logNumber"    : this._rowNoToDelete,
                                "deleteRequest"         :  this.protectDeleteStruct["delete_request"]        /* see VDT_CMU_File_Prot_Del_Request_e */
                            }
                        };
                        framework.sendEventToMmui(this.uiaId,appData, payloadData);
                    break;
    
                    default:
                        log.debug("Event not found");
                    break;
                }
            break;

            case "ProtectionError" :
                switch(appData)
                {
                    case "Global.Yes" :
                    framework.sendEventToMmui("common",appData, null);
                    break;

                    default:
                    log.debug("Event not found");
                    break;
                }
            break;

            default:
                log.debug(this._currentContext.ctxtId+" context is not found");
            break;
        }
    }
};     //End of _dialogDefaultSelectCallback function


/**
* =========================
* Helper functions
* =========================
*/

// This function is used to refresh the screen(list2ctrl) with latest DataLists
vdtApp.prototype._refreshScreens = function()
{
    log.debug("In vdtApp.prototype._refreshScreens");
    
    if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "DriveChartDetails")
    {
		if(this._cachedSpeed)			//SCR SW00158927
		{	
			this._driveChartDetailsCtxtDataList.items[0].disabled = false;
	 		for(var dataListCount = 1; dataListCount < this._driveChartDetailsCtxtDataList.itemCount; dataListCount++ )
        	{
            	this._driveChartDetailsCtxtDataList.items[dataListCount].disabled = this._cachedSpeed;
        	}
		}
		
		if(this._cached_VDTData.Log_Count>0 && this._driveChartDetailsCtxtDataList.items[0].text1Id!="StartRecording")
		{
			log.info("this._stopRecordingText : "+this._stopRecordingText);
			this._driveChartDetailsCtxtDataList.items[1].disabled = (this._stopRecordingText=="StopRecording" || "writingToFile")?true:this._cachedSpeed;
		}
		
        if(this._driveChartDetailsCtxtDataList != null && this._currentContextTemplate && this._currentContextTemplate.list2Ctrl)
        {   
            this._currentContextTemplate.list2Ctrl.setDataList(this._driveChartDetailsCtxtDataList);
            this._currentContextTemplate.list2Ctrl.updateItems(0, this._driveChartDetailsCtxtDataList.itemCount - 1);
        }
    }
	
	if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "PhoneTransferSettings")
    {
        if(this._phoneTransferCtxtDataList != null && this._currentContextTemplate && this._currentContextTemplate.list2Ctrl)
        {   
            this._currentContextTemplate.list2Ctrl.setDataList(this._phoneTransferCtxtDataList);
            this._currentContextTemplate.list2Ctrl.updateItems(0, this._phoneTransferCtxtDataList.itemCount - 1);
        }
    }
    
};    //End of _refreshScreens function


// This function is used to build context data lists from cached data variables.
vdtApp.prototype._rebuildCtxtDataLists = function()
{
    log.debug("In vdtApp.prototype._rebuildCtxtDataLists");
    log.warn("value of this._cached_VDTData = "+this._cached_VDTData);
    log.warn("value of this._currentContext = "+this._currentContext);
    log.warn("value of this._isRecordingOn = "+this._isRecordingOn);
    //log.warn("value of this._isAutoRecordingOn = "+this._isAutoRecordingOn);
    log.warn("value of this._isStopRecordingDisabled = "+this._isStopRecordingDisabled);



    if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "DriveChartDetails")
    {
        var getdatetime = new Array();
        var settime  = new Array(); 
        var setdate  = new Array(); 
        
		/*variable to convert drive file name according to selected language*/
		var drvnickname = new Array();
        var lognumbr = new Array();
		var finlstrng = new Array();
		
        for(var i=0; i<this._cached_VDTData.Log_Count; i++)
        {
            getdatetime[i] = this._cached_VDTData.Driver_Files[i].DriverTimeStamp;         
            settime[i] = utility.formatTime(getdatetime[i],false);   
            setdate[i] = utility.formatDate(getdatetime[i]); 
            
        }
		

		for(var i=0; i<this._cached_VDTData.Log_Count; i++)
        {
			var subMap = {"logNumber" : this._cached_VDTData.Driver_Files[i].DrvLogNum};
            drvnickname[i]=framework.localize.getLocStr(this.uiaId, this._cached_VDTData.Driver_Files[i].DrvNickName);
			lognumbr[i]=framework.localize.getLocStr(this.uiaId,"DriveLog", subMap);
			if(drvnickname[i]!="UNKNOWN")
			{
				finlstrng[i]=drvnickname[i]+" "+lognumbr[i];
			}
			else
			{
				finlstrng[i]=lognumbr[i];
			}
			
        }
		
        if(this._stopRecordingText ==="StartRecording")
        {
            this._driveChartDetailsCtxtDataList =    // Data List for VDTMenu Context
            {
            itemCountKnown : true,
            itemCount : 1,
            items : [
            { itemStyle : 'style02', appData : "SelectStartRecording", text1Id : "StartRecording", hasCaret : false , disabled : this._isStopRecordingDisabled},
            ]
            };
        }
        else
        {
            this._driveChartDetailsCtxtDataList =    // Data List for VDTMenu Context
            {
            itemCountKnown : true,
            itemCount : 1,
            items : [
            { itemStyle : 'style02', appData : "SelectStopRecording", text1Id : "StopRecording", hasCaret : false , disabled : this._isStopRecordingDisabled},
            ]
            };

            //this._isAutoRecordingOn=false;

        }

        if(this._cached_VDTData && (this._isRecordingOn === true/* || this._isAutoRecordingOn === true*/))
        {

            log.info("In timerlabel");
            // Build the timer variable from cache variables. Append '0' if it is a single digit 9 -> 09
            var timerLabel;
            if(this._timerSeconds < 10)
            {
            if(this._timerMinutes < 10)
            {
            timerLabel = "0"+this._timerMinutes+":0"+this._timerSeconds;
            }
            else
            {
            timerLabel = this._timerMinutes+":0"+this._timerSeconds;
            }
            }
            else
            {
            if(this._timerMinutes < 10)
            {
            timerLabel = "0"+this._timerMinutes+":"+this._timerSeconds;
            }
            else
            {
            timerLabel = this._timerMinutes+":"+this._timerSeconds;
            }
            }

            if((this._stopRecordingText ==="StopRecording" ||this._stopRecordingText ==="StartRecording") && this._cached_VDTData)
            {
            // Add first row as Stop Recording.
            // If it is normal stop recording then show normal entry
            log.info("into either StartRecording or StopRecording");
            //if(!this._isAutoRecordingOn)
            //{

            this._driveChartDetailsCtxtDataList =    // Data List for VDTMenu Context
            {
            itemCountKnown : true,
            itemCount : this._cached_VDTData.Log_Count+1,
            items : [
            { 
            itemStyle   : 'style06', 
            appData     : "SelectStopRecording", 
            label1      : timerLabel, 
            styleMod    : 'hint', 
            text1Id     : this._stopRecordingText, 
            hasCaret    : false, 
            disabled    : this._isStopRecordingDisabled
            }
            ]
            };
            //}

            // Just a check to avoid null pointer exceptions.
            if(this._cached_VDTData.Driver_Files.length>0)
            {

            if(this._cached_VDTData && this._cached_VDTData.Driver_Files[0].DrvNickName)
            {
            log.info("value : "+this._cached_VDTData.Driver_Files[0].DrvNickName);
            log.info("ignition on");
            // We have to show this currently recorded log greyed out if writing to file. This is acheived via same this._isStopRecordingDisabled variable
            // If recording is on, show first file with spinner. 
            this._driveChartDetailsCtxtDataList.itemCount = this._driveChartDetailsCtxtDataList.items.push({
            appData     : { 'eventName' : 'logs', 'logNo' : this._cached_VDTData.Driver_Files[0].DrvLogNum},
            text1       : finlstrng[0],
            itemStyle   : 'style02',
            image2      : 'indeterminate',
            hasCaret    : false,
	        disabled    : true,
            });
            }
            }
            }
            else if(this._stopRecordingText === "writingToFile")
            {
            log.info("into writingToFile");
            // Add first row as Stop Recording.
            // If it is Writing to file state, show with spinner and greyed out. 
            this._driveChartDetailsCtxtDataList =    // Data List for VDTMenu Context
            {
            itemCountKnown : true,
            itemCount : this._cached_VDTData.Log_Count+1,
            items : [
            { itemStyle : 'style02', image2    :'indeterminate', appData : "SelectStopRecording", styleMod : 'hint', text1Id : this._stopRecordingText, hasCaret : false, disabled : true}
            ]
            };

            // Just a check to avoid null pointer exceptions.
            if(this._cached_VDTData.Driver_Files.length > 0)
            {
            if(this._cached_VDTData.Driver_Files[0].DrvNickName)
            {
            // We have to show this currently recorded log greyed out if writing to file. This is acheived via same this._isStopRecordingDisabled variable
            // If recording is on, show first file with spinner and second log without spinner
            this._driveChartDetailsCtxtDataList.itemCount = this._driveChartDetailsCtxtDataList.items.push({
            appData     : { 'eventName' : 'logs', 'logNo' : this._cached_VDTData.Driver_Files[0].DrvLogNum},
            text1       : finlstrng[0],
            itemStyle   : 'style02',
            hasCaret    : false,
            image2      : 'indeterminate',
            disabled    : this._isStopRecordingDisabled,
            });
            }
            }
            }

            // Show rest of files.
            for(var i=1; i < this._cached_VDTData.Log_Count; i++)
            {
                var isLocked = false;
                if(this._cached_VDTData.Driver_Files[i].Protected_Status === "true" || this._cached_VDTData.Driver_Files[i].Protected_Status === "True" || this._cached_VDTData.Driver_Files[i].Protected_Status  === true)
                {
                isLocked = true;
                log.info("index :"+this._cached_VDTData.Log_Count);
                log.info("islocked "+isLocked);

                }
                this._driveChartDetailsCtxtDataList.itemCount = this._driveChartDetailsCtxtDataList.items.push({
                itemStyle   : 'styleLock',
                appData     : { eventName : 'logs', 'logNo' : this._cached_VDTData.Driver_Files[i].DrvLogNum},
                text1       : finlstrng[i],
                text2       : setdate[i]+' '+settime[i],
                locked      : isLocked,
                hasCaret    : false,
                });
            }
        }
        else if(this._isRecordingOn === false && this._cached_VDTData)
        {

            // Add first row as Start Recording.
            this._driveChartDetailsCtxtDataList =    // Data List for DriveChartDetails Context
            {
                itemCountKnown : true,
                itemCount : this._cached_VDTData.Log_Count+1,
                items :
                [
                    { itemStyle : 'style02', appData : "SelectStartRecording", text1Id : "StartRecording", hasCaret : false, disabled : this._isStopRecordingDisabled},
                ]
            };

        // Show rest of files.

            for(var i=0; i < this._cached_VDTData.Log_Count; i++)
            {

                var isLocked = false;
                if(this._cached_VDTData.Driver_Files[i].Protected_Status  === "true" || this._cached_VDTData.Driver_Files[i].Protected_Status  === "True" || this._cached_VDTData.Driver_Files[i].Protected_Status  === true)
                {
                    isLocked = true;
                }
                this._driveChartDetailsCtxtDataList.items.push(
                {
                    itemStyle   : 'styleLock',
                    appData     : { eventName : 'logs', 'logNo' : this._cached_VDTData.Driver_Files[i].DrvLogNum},
                    text1       : finlstrng[i],
                    text2       : setdate[i]+' '+settime[i],
                    locked      : isLocked,
                    hasCaret    : false,
                });
            }
        }
    }
	
	
	 if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "PhoneTransferSettings")
	{
		log.info("In rebuild : this._mdstatus : "+this._mdstatus);
		if(this._mdstatus)
		{
			this._phoneTransferCtxtDataList.items[0].disabled = true; 
		}
		else
		{
			this._phoneTransferCtxtDataList.items[0].disabled = false; 
		}
		
	
	}
};    //End of _rebuildCtxtDataLists function


vdtApp.prototype._startRecording = function ()
{
    log.debug("In vdtApp.prototype._startRecording");

    this._isRecordingOn = true;    
    this._timerMinutes = 60;
    this._timerSeconds = 00;

    // Clear the variable holding timer first.
    clearInterval(this._recordInterval);

    // Storing the _updateTime function that will be called every second.
    var updateTime = this._updateTime.bind(this);

    // Start the timer and store it in _recordInterval variable so that it will be used to clear timer later on.
    this._recordInterval = setInterval(updateTime, 1000);
};    //End of _startRecording function


vdtApp.prototype._stopRecording = function ()
{
    log.debug("In vdtApp.prototype._stopRecording");
    this._isRecordingOn = false;
    //this._isAutoRecordingOn = false;
    this._isStopRecordingDisabled = false;
    this._stopRecordingText = "StopRecording";

    // Stop the timer.
    clearInterval(this._recordInterval);

    this._rebuildCtxtDataLists();
    this._refreshScreens();
};    //End of _stopRecording function


vdtApp.prototype._updateTime = function ()
{
log.debug("In vdtApp.prototype._updateTime");
// Decrease seconds on each call
    this._timerSeconds--;
if(this._timerSeconds == -1)
{
    log.debug("this._timerMinutes:"+this._timerMinutes);
    this._timerMinutes--;
    this._timerSeconds=59;
}
log.debug("this._timerSeconds:"+this._timerSeconds);

if(this._timerMinutes == -1)
{
    this._stopRecording();
    return;
}

// Update the time in list
    if(this._currentContextTemplate && this._currentContextTemplate.list2Ctrl && this._currentContext.ctxtId === "DriveChartDetails")
    {
        if(this._timerSeconds < 10)
        {
            if(this._timerMinutes < 10)
            {
                this._currentContextTemplate.list2Ctrl.dataList.items[0].label1 = "0"+this._timerMinutes+":0"+this._timerSeconds;
            }
            else
            {
                this._currentContextTemplate.list2Ctrl.dataList.items[0].label1 = this._timerMinutes+":0"+this._timerSeconds;
            }
        }
        else
        {
            if(this._timerMinutes < 10)
            {
                this._currentContextTemplate.list2Ctrl.dataList.items[0].label1 = "0"+this._timerMinutes+":"+this._timerSeconds;
            }
            else
            {
                this._currentContextTemplate.list2Ctrl.dataList.items[0].label1 = this._timerMinutes+":"+this._timerSeconds;
            }
        }
    }
    if(this._currentContextTemplate && this._currentContextTemplate.list2Ctrl)
    {
        this._currentContextTemplate.list2Ctrl.updateItems(0, 0);
    }
};    //End of _updateTime function


/**
* Message Handler (_MDStatusMsgHandler)
* =========================
* @param {object}
* @return {void}
*/
vdtApp.prototype._MDStatusMsgHandler = function(msg)
{
    var device_status=msg.params.payload.MDProcessStatus;

    log.debug("In vdtApp.prototype._MDStatusMsgHandler");
    log.info("msg.params.payload.MDProcessStatus"+msg.params.payload.MDProcessStatus);
    if(msg.params.payload.MDProcessStatus)
    {
        switch(device_status)
        {
            case "MD_TRANSFER_INPROGRESS" :            
				this._phoneTransferCtxtDataList.items[0].disabled = true; 
				this._mdstatus = true;
			    this._rebuildCtxtDataLists();
                this._refreshScreens();
            break;

            case "MD_TRANSFER_SUCCESS" :
				this._phoneTransferCtxtDataList.items[0].disabled = false; 
				this._mdstatus =false;
                this._rebuildCtxtDataLists();
                this._refreshScreens();
            break;


            case "MD_TRANSFER_FAILURE" :
                this._phoneTransferCtxtDataList.items[0].disabled = false; 
				this._mdstatus =false;
                this._rebuildCtxtDataLists();
                this._refreshScreens();
            break;

            default:
            break;
        }
    }

    else
    {
	log.info("no debug");
       // alert("no debug");
    }
};

/**************************
* Framework register
**************************/

framework.registerAppLoaded("vdt",null,true);