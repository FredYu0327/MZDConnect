/*
 Copyright 2012 by Johnson Controls

 __________________________________________________________________________

 Filename: driveridApp.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: TCS.
 Date:   03-May-2013
  __________________________________________________________________________

 Description: IHU GUI Driver id
 Revisions:
 v0.1 (03 -May-2013)  driveridApp created - TCS
 v0.2 (25-June-2014)  Changes are made for SCR SW00150063 - avalajh
 v0.3 (06-Aug-2014)   Changes are made for SCR SW00153219
  _________________________________________________________________________

 */
log.addSrcFile("driveridApp.js", "driverid");
//log.setLogLevel("driverid", "debug");

function driveridApp(uiaId)
{
    log.debug("DriverId constructor called...");
    // Base application functionality is provided in a common location via this call to baseApp.init().
    // See framework.js/BaseApp.js for details.
    baseApp.init(this, uiaId);
}

/***********************************************************/
/* App Init is a standRard function called by the framework */
/***********************************************************/

/*
 * Called just after the app is instantiated by framework.
 * All variables local to this app should be declared in this function
 */
driveridApp.prototype.appInit = function()
{
    log.debug(" driverid appInit  called...");

    if(framework.debugMode)
    {
      utility.loadScript("apps/driverid/test/driveridAppTest.js");
    }

    //Global variables or constants. 
    this._keyboardInput         = null;             // Used to store the entered value in the app.
	this._DuplicateEntry        = 0;                // User to store the Duplicate entry notification Flag
    this._itemIndexValue        = null;             // Used to store the clicked index of list item.
    this._driverMenuOnOffStatus = null;             // Used to store the drivermenu on-off check button status.
    this._UnknownItemIndex      = 6;                // Unknown driver index.
    this._itemcount             = 0;
    this._driverMenuStatus      = null;             // Used to cached the drivermenustatus sent by MMUI.
    this._DRIVER                = "Driver ";        //Constant
    
    this._cachedWinkMsg         = null;             // Used to store the driver id received from wink or sbn msg.
    
    // Cached data from message handlers
    this._cacheCurrentDriverName = "null";             //Used to cache current driver Nick Name.
    this._sbnMessageStatus = null;                   //Used to store SBN message received from mmui.
    this._cacheIndexValue = null;                //Used to cache the index value received from MMui.
    this._driverIdSettingStatus = null;              //Used to Cache Setting status message.
    this._cacheDriverName = "";                    //Used to cache driver name.
    this._atSpeed = false;                           //Used to cache the speed value.
    this._cachedDriverListCount = null;              //Used to store the length of driver menu.
    this._currentDriver = null;

    //DriverMenu static data list.
    this._driverListCtxtDataList =
    {
      itemCountKnown : true, 
      itemCount : 8, 
      items : 
            [
                { appData : "SelectDriverIDOnOff",    text1Id : "DriverSelection",     itemStyle : "styleOnOff", hasCaret : false ,value : 1},
                { appData : "SelectDriverID",         text1Id : "DriverOne",           itemStyle : "style01" ,   disabled : false,   image1:"common/images/icons/IcnListCheckmark.png",  hasCaret : false, indented:true }, 
                { appData : "SelectDriverID",         text1Id : "DriverTwo",           itemStyle : "style01",    disabled : false,   image1:null,  hasCaret : false, indented:true }, 
                { appData : "SelectDriverID",         text1Id : "DriverThree",         itemStyle : "style01" ,   disabled : false,   image1:null,  hasCaret : false, indented:true }, 
                { appData : "SelectDriverID",         text1Id : "Driverfour",          itemStyle : "style01",    disabled : false,   image1:null,  hasCaret : false, indented:true }, 
                { appData : "SelectDriverID",         text1Id : "Driverfive",          itemStyle : "style01" ,   disabled : false,   image1:null,  hasCaret : false, indented:true }, 
                { appData : "Unknown",                text1Id : "UnknownDriver",       itemStyle : "style01" ,   disabled : true,    image1:null,  hasCaret : false, indented:true },
                { appData : "SelectEditNickname",     text1Id : "EditDriverName",      itemStyle : "style01" ,   disabled : false,   image1:null,  hasCaret : false},
            ]
    };
    
      /* 
       * NOTE:
       * Every time a function is bound (using bind()), a new
       * function is created in memory. Whenever possible,
       * only bind the same function once and use reference.
       */

/******************************************Start of Context table**************************/
this._contextTable =                                                                   // Context table Start
{
    "DriverMenu" :                                                                     //Start of DriverMenu Context.
    {
        "template"                      : "List2Tmplt", 
        "sbNameId"                      : "DriverSelection",
        "leftBtnStyle"                  : "goBack",
        "controlProperties"             :                                              //Start of controlProperties.
        {
            "List2Ctrl"                 :                                              //Start of properties of "ListCtrl".
            {
                "dataList"              : this._driverListCtxtDataList,                //Data provider for the list control.
                selectCallback          : this._listItemClickCallback.bind(this)
            }                                                                          //End of properties for "ListCtrl".
        },                                                                             //End of  controlProperties.
        "readyFunction"                 : this._DriverMenuReadyToDisplay.bind(this),   //Ready function for DriverMenu context.
        "contextInFunction"             : null,                                        //ContextIn for DriverMenu context.
    },                                                                                 // end of DriverMenu context.

    "Keyboard" :                                                                       //Start of Keyboard Context.
    {
        "template"                      : "KeyboardTmplt",
        "sbNameId"                      : "DriverSelection",
        "leftBtnStyle"                  : "goBack",
        "controlProperties"             :                                              //Start of controlProperties.
        {
            "KeyboardCtrl"              :                                              //Start of properties of "KeyboardCtrl".
            {
                
                okBtnCallback           : this._KeyboardQwertyOk.bind(this),           //Callback for OK button of keyboard.
                cancelBtnCallback       : this._KeyboardQwertyCancel.bind(this),       //Callback for CANCEL button of keyboard.
                value                   : null,
                locale                  : framework.localize.getCurrentLanguage(),
                validationRule          : null,
                appData                 : "NickNameData",
                /* Fix for SCR SW00131550, iSC M602 changes Start*/ 
                maxChars                : 8
                /* Fix for SCR SW00131550, iSC M602 changes End*/ 
            }                                                                          //End of properties of "KeyboardCtrl"
        },                                                                             //End of  controlProperties.
        "readyFunction"                 : this._KeyBoardReadyToDisplay.bind(this),                                        //Ready function for Keyboard context.
        "contextInFunction"             : null,                                        //ContextIn for Keyboard context.
    },                                                                                 //End of Keyboard context.

    "Nickname" :                                                                       //Start of Nickname Context.
    {
        "template"                      : "Dialog3Tmplt",
        "controlProperties"             :                                              //Start of controlProperties.
        {
            "Dialog3Ctrl"               :                                              //Start of properties of "Dialog2Ctrl".
            {
                "contentStyle"          : "style02",
                "fullScreen"            : false,
                "buttonCount"           : 1,
                "buttonConfig"          : 
                {
                    "button1"           :                                              //Button configuration
                    {
                        selectCallback  : this._dialogClickCallback.bind(this), 
                        buttonColor     : "normal",
                        buttonBehavior  : "shortPressOnly", 
                        labelId         : "common.Ok", 
                        appData         : "Global.Yes",
                        disabled        : false
                    }
                },
                "text1Id"               : "DuplicateNickname"
            }                                                                            //end of dialog2Ctrl.
        }, 
    }                                                                                    //End of Nickname context.
};                                                                                       //ContextTable Ends

/******************************************End of Context table**************************/

/******************************************Start of Message table**************************/

this._messageTable =
{   
   //Driver Menu context msg
   "DriverList"                         : this._driverListMsgHandler.bind(this),            //Handler to update nickname.
   "CurrentDriverDataAsync"             : this._currentDriverdataAsyncMsgHandler.bind(this),//Handler to receive the data from mmui.
   "Setting"                            : this._settingMsgHandler.bind(this),               //Handler which gives initial parameters of driver menu on/off.

   //Key board context msg
   "ShowKeyboardData"                   : this._showkeyboardDataMsgHandler.bind(this),      //Handler to show the respective nickname in text field.
   "Duplicate_Nickname"                 : this._duplicateNicknameMSgHandler.bind(this),     // Handler for Checking Duplicate Name. 
   
   //Current driver display msg
   "SBNMessage"                         : this._showSBNMsgCtrl.bind(this),                  //Handler to show SBN.
   
   //Speed threshold msg
   "Global.AtSpeed"                     : this._AtSpeedMsgHandler.bind(this),               //Handler used to disable the list when the speed above the limit. 
   "Global.NoSpeed"                     : this._NoSpeedMsgHandler.bind(this),               //Handler to enable the list when the speed is in control.
   /*Acc status*/
   "Acc_Status"							: this._AccStateMsgHandler.bind(this),               //Handler for acc status.
};

/******************************************Stop of Message table**************************/
};



/******************* Start of Context callback functions  *******************/
/* 
 * This is a callback function called when we come to DriverMenu Context.
 * Context argument will be the original context change message from MMUI 
 */
 
driveridApp.prototype._DriverMenuReadyToDisplay = function(msg)
{
     this._atSpeed = framework.common.getAtSpeedValue();// check for the speed threshould.
     log.debug("[DriverMenuReadyToDisplay]  currtn driver index :: "+this._cacheIndexValue +"Speed thresholud :: "+this._atSpeed);
     this._updateDataList();
};

/* 
 * This is a callback function called when we come to KeyBoard Context.
 * Context argument will be the original context change message from MMUI 
 */
driveridApp.prototype._KeyBoardReadyToDisplay = function(msg)
{
     this._atSpeed = framework.common.getAtSpeedValue();// check for the speed threshould.
     log.debug("[_KeyBoardReadyToDisplay]  currtn driver index :: "+this._cacheIndexValue +"Speed thresholud :: "+this._atSpeed);
     this._updateKeyBoard();
};


/******************* Stop of Context callback functions  *******************/


/********************** Start of Message handlers ***************************************/

/*
 * Handler used to get the driverlist to display drivermenu.
 * (This data would normally come from MMUI)
 */
driveridApp.prototype._driverListMsgHandler = function(msg)
{
    log.debug(" [driverlistMsgHandler] is Called......");
    var listitem = 0;                                                              //variable atcs as counter in driverlist
	var updDataListCount = 0;													   //variable acts as counter for calling updateDataList function	
   if(msg && msg.params && msg.params.payload && msg.params.payload.di_drv_list )
    {
        
        this._cachedDriverListCount  = msg.params.payload.di_drv_list.drvCount;                                  //cache the driver count from the mmui data.
        for(listitem ; listitem < this._cachedDriverListCount ; listitem++)
        {
           if(msg.params.payload.di_drv_list.drvList[listitem].drvNickname != ""&& (this._driverListCtxtDataList.items[listitem+1].text1 != msg.params.payload.di_drv_list.drvList[listitem].drvNickname))
           {
				updDataListCount++;
				this._driverListCtxtDataList.items[listitem+1].text1Id = "";
				this._driverListCtxtDataList.items[listitem+1].text1 = msg.params.payload.di_drv_list.drvList[listitem].drvNickname;     // set text of driver menu to the values received frok mmui
                log.debug(" [driverlistMsgHandler] Driver name received from MMUI ::"+msg.params.payload.di_drv_list.drvList[listitem].drvNickname);
           }
        }
        log.debug("updDataListCount :"+updDataListCount); 
        //Check for template and context existance before populating the data on the control.
        if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "DriverMenu" && updDataListCount!=0)
        {
             log.debug(" [driverlistMsgHandler] About to update Driver menu......");
             this._updateDataList();                                                                              //Call to  update DriverMenu.
        }
    }
};

/*
 * Handler used to get the data to show SBN.
 * (This data would normally come from MMUI)
 */
driveridApp.prototype._showSBNMsgCtrl = function(msg)
{
    log.debug(" [_showSBNMsgCtrl] is called....." +this._cacheIndexValue);
    
    if(msg && msg.params && msg.params.payload && msg.params.payload.sbnmessage)
    {
	    this._sbnMessageStatus = msg.params.payload.sbnmessage;                       //Cache variable  Used to Store Sbn message from Mmui                     //cache the current driverid/nickname received from the MMUI.
	    this._sbnmessage = "EnjoyDriving";
	    if(this._sbnMessageStatus === "driveridSBNMessage")
	    {
	        this._showSBN(this._cacheCurrentDriverName);                              //call this function to show SBN.    
	    }
	    if(this._sbnMessageStatus === "Unknown Driver")
	    {
	        this._showSBN("");                                    //call this function to show SBN.    
	    }
    }
    log.debug("[_showSBNMsgCtrl] sbnMessageStatus :: "+this._sbnMessageStatus +"cacheIndexValue :: " +this._cacheIndexValue);
};

/*
 * Handler used to get the data to show driver name in the edittext field.
 * (This data would normally come from MMUI)
 */
driveridApp.prototype._showkeyboardDataMsgHandler = function(msg)
{
    log.debug("[_showkeyboardDataMsgHandler] is called..... ");
    if(msg && msg.params && msg.params.payload && msg.params.payload.di_keyboard_show 
           && msg.params.payload.di_keyboard_show.drvNickname)
    {
        this._cacheDriverName = msg.params.payload.di_keyboard_show.drvNickname;                         //cached the driver nickname received from mmui.
        this._contextTable.Keyboard.controlProperties.KeyboardCtrl.value = this._cacheDriverName;        //To display the nickname value in the text field.
        log.debug("[_showkeyboardDataMsgHandler] this._cacheDriverName :: "+this._cacheDriverName );
    }
};


/*
 * Handler used to get current driver name and the index.
 * (This data would normally come from MMUI)
 */
driveridApp.prototype._currentDriverdataAsyncMsgHandler = function(msg)
{
    log.debug("[currentDriverdataAsyncMsgHandler] MsgHandler is called....");

    this._currentDriver = this._cacheIndexValue = msg.params.payload.di_curr_drv_async.drvId;              //cache the driverid value received from MMui.
    if(msg && msg.params && msg.params.payload && msg.params.payload.di_curr_drv_async)
    {
    	if(this._cacheIndexValue >= 0 && this._cacheIndexValue < 6)
    	{
    		if(this._cacheIndexValue === 0)
    		{
    			this._currentDriver = 6;
	    		this._cacheCurrentDriverName = "";
    		}
    		else
    		{
    			
    			if(msg.params.payload.di_curr_drv_async.drvName_exist === false)
    			{
    				if(this._cacheIndexValue === 1)
    				{
    					this._cacheCurrentDriverName = framework.localize.getLocStr(this.uiaId, "DriverOne"); 
    				}
    				else if(this._cacheIndexValue === 2)
    				{
    					this._cacheCurrentDriverName = framework.localize.getLocStr(this.uiaId, "DriverTwo"); 
    				}
    				else if(this._cacheIndexValue === 3)
    				{
    					this._cacheCurrentDriverName = framework.localize.getLocStr(this.uiaId, "DriverThree"); 
    				}
    				else if(this._cacheIndexValue === 4)
    				{
    					this._cacheCurrentDriverName = framework.localize.getLocStr(this.uiaId, "Driverfour"); 
    				}
    				else if(this._cacheIndexValue === 5)
    				{
    					this._cacheCurrentDriverName = framework.localize.getLocStr(this.uiaId, "Driverfive"); 
    				}	
    				else{}
    			}
    			else
    			{
    				this._cacheCurrentDriverName = msg.params.payload.di_curr_drv_async.drvNickname;
    			}
    		}
    		
    	}
    	else
    	{
    		this._cacheCurrentDriverName = "";
    	}
    }
    
    if(this._currentContextTemplate && this._currentContext)
    {
    	this._updateDataList();
    }		
    log.debug(" [_currentDriverdataAsyncMsgHandler] current driver :: "+this._cacheIndexValue +"cacheCurrentDriverName :: "+this._cacheCurrentDriverName +"this._currentDriver" +this._currentDriver);
};

    /*
     * Handler for duplicate name confirmation.
     * (This data would normally come from MMUI)
     */
driveridApp.prototype._duplicateNicknameMSgHandler = function(msg)
{
    log.debug("[_duplicateNicknameMSgHandler] is called......");
    if(msg && msg.params && msg.params.payload && msg.params.payload.di_dup_nickname)
    {
        this._duplicateNameStatus = msg.params.payload.di_dup_nickname;
     
        if(this._duplicateNameStatus == "FAILURE")
        {
            this._cacheCurrentDriverName = this._keyboardInput;
            if(this._cacheCurrentDriverName != "")
             {
             this._driverListCtxtDataList.items[this._cacheIndexValue].text1Id = "";
             this._driverListCtxtDataList.items[this._cacheIndexValue].text1 = this._cacheCurrentDriverName;
             }
        }
        log.debug("[_duplicateNicknameMSgHandler] Duplicate Nick name status :: "+this._duplicateNameStatus +"Driver new name  :: "+this._cacheCurrentDriverName);
    }
};
/***********************************End of Function definition for _duplicateNicknameMSgHandler**************************/

/***********************************AtSpeed Msg Handler function definition******************************************/
/*
 * Handler called when vehicle excceds the threshold speed.
 * (This data would normally come from MMUI)
 */
driveridApp.prototype._AtSpeedMsgHandler = function(msg)
{
	log.debug("[_AtSpeedMsgHandler] called ");
    this._atSpeed = true;
    if (this._currentContextTemplate && this._currentContext  )
    {
        if(this._currentContext.ctxtId === "DriverMenu")
        {
            this._updateDataList();
        }
        else if(this._currentContext.ctxtId === "Keyboard")
        {
            this._updateKeyBoard();
        }
        else
        {
            log.warn("Context is other than DriverMenu and KeyBoard");
        }
    }
};
/******************************************************************/

/***********************************NoSpeed Msg handler function definition*******************************************/
/*
 * Handler called when vehicle comes back to the normal sped from AtSpeed.
 * (This data would normally come from MMUI)
 */
driveridApp.prototype._NoSpeedMsgHandler = function(msg)
{
	log.debug("[_NoSpeedMsgHandler] called ");
    this._atSpeed = false;
    if (this._currentContextTemplate && this._currentContext  )
    {
        if(this._currentContext.ctxtId === "DriverMenu")
        {
            this._updateDataList();
        }
        else if(this._currentContext.ctxtId === "Keyboard")
        {
            this._updateKeyBoard();
        }
        else
        {
            log.warn("Context is other than DriverMenu and KeyBoard");
        }
    }
};

/*
 * Handler gives the status about the Driver menu.
 * (This data would normally come from MMUI)
 */
driveridApp.prototype._settingMsgHandler = function(msg)
{
    log.debug("[_settingMsgHandler] called ... ");
    if(msg && msg.params && msg.params.payload && msg.params.payload.di_sett)
        {
            this._driverMenuStatus = msg.params.payload.di_sett;
        }
    log.debug("[_settingMsgHandler] Drivermenu status ::"+this._driverMenuStatus);
};

/*
 * Handler is called to show SBN.
 * (This data would normally come from MMUI)
 */
driveridApp.prototype._showSBN = function(sbnMessage)
{
    log.debug("[_showSBN] called......");
    //This function is called to show SBN.
    framework.common.startTimedSbn(this.uiaId, "DriverIdSBN", "driverId", {sbnStyle : "Style01", text1Id : this._sbnmessage, text1SubMap :{"nickname" : sbnMessage}});  // add/update a state SBN in the display queue
};
/*Acc status*/
driveridApp.prototype._hideSBN = function()
{
    log.debug("[_showSBN] called......");
    //This function is called to show SBN.
    framework.common.endStateSbn(this.uiaId, "DriverIdSBN", "driverId");  // hide SBN in the display queue/or displayed
};
/***********************************Acc Status msg handler**************************************/
driveridApp.prototype._AccStateMsgHandler = function(msg)
{
	var accOffOn = null;
	log.debug("[_AccStateMsgHandler] called ");
   
    if((msg && msg.params && msg.params.payload) &&(msg.params.payload.di_acc_state != null))
    {
		accOffOn = msg.params.payload.di_acc_state;
		if(accOffOn == false)
		{
			this._hideSBN();
		}
    }
};

/******************************************************************/


/************** Helper Functions start ***********/

//Used to update  keyboard.
driveridApp.prototype._updateKeyBoard = function()
{
	log.debug("[_updateKeyBoard] About to update keyboard");
	if( this._currentContextTemplate  && this._currentContext && this._currentContext.ctxtId === "Keyboard" )
	{
	 this._contextTable.Keyboard.controlProperties.KeyboardCtrl.value = this._cacheCurrentDriverName;              //To display the nickname value in the text field.
     this._currentContextTemplate.keyboardCtrl.setAtSpeed(this._atSpeed);
	}
};


//Called when the list item is clicked
driveridApp.prototype._listItemClickCallback = function(listCtrlObj, appData, params)
{
	log.debug("[_listItemClickCallback] called ");
    this._driverMenuOnOffStatus = params.additionalData;         // to store value of click button.
    if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "DriverMenu")
    {
        switch(this._driverListCtxtDataList.items[params.itemIndex].appData)
        {
            case "SelectDriverID" :
                 this._cacheCurrentDriverName = this._driverListCtxtDataList.items[params.itemIndex].text1;
                 this._itemIndexValue = params.itemIndex;             //get the index of selected list item.
                
                 this._currentDriver = this._cacheIndexValue = this._itemIndexValue;
                 this._getSelectedDriver(this._itemIndexValue);
                 var params = 
                 {
                     "payload" : 
                     {
                         "driverID" : this._itemIndexValue
                     }
                 };
                 log.debug("[SelectDriverID] curren drv name ::"+this._cacheCurrentDriverName +"seleted item :: "+this._itemIndexValue);
				 this._updateDataList();
                 framework.sendEventToMmui(this.uiaId, appData, params);
                 break;
                 
            case "SelectEditNickname" : 
                 this._contextTable.Keyboard.controlProperties.KeyboardCtrl.value = this._cacheCurrentDriverName;              //To display the nickname value in the text field.
                 log.debug("[SelectEditNickname] Current Driver ::"+this._cacheCurrentDriverName);
                 framework.sendEventToMmui(this.uiaId, appData);
                 break;
                 
            case "SelectDriverIDOnOff" :
                 //Condition for Checking Whether "ON" button is click or not in driverMenu Context.
                 if(this._driverMenuOnOffStatus === 1)
                 {
                     this._driverMenuStatus = "ON";
                 }
                 //Condition for Checking Whether "OFF" button is click or not in driverMenu Context.
                 if(this._driverMenuOnOffStatus === 2)
                 {
                     this._driverMenuStatus = "OFF";
                     this._cacheIndexValue = 0;                     // set current driver to 0 to avoid flicker.
                     this._currentDriver = 6;
                 }
                 
                 var params =
                 {
                     "payload" :
                     {
                         "driverIDOnOff" : this._driverMenuStatus,
                     }
                 };
                 log.debug("[SelectDriverIDOnOff] cacheIndexValue :: "+this._cacheIndexValue +" Driver Menu status :: "+this._driverMenuStatus);
                 framework.sendEventToMmui(this.uiaId, appData, params);
                 this._updateDataList();
                 break; 
                 
            default  :
                 log.warn("driverid: Unknown Appdata", appData);
                 break;
        }
    }
};

//This function called when "OK" button on the keyboard is clicked.
driveridApp.prototype._KeyboardQwertyOk = function(btnRef, appData, params)
{
    this._keyboardInput  =  params.input;               //Variable for storing input value i.e name.
    if(this._keyboardInput === "")                      //Condition for checking the null value of text field 
    {
        return;
    }
    this._DuplicateEntry = 0;
	switch(appData)
    {
        case "NickNameData" :                      
			var params =
			{
				"payload" : 
				{
					"nickname"  : this._keyboardInput,
				}
			};
            this._CheckForDuplicates(this._DuplicateEntry);		 
			log.debug("[_KeyboardQwertyOk] About to send new driver name to mmui :: "+this._DuplicateEntry);

			if (this._DuplicateEntry == 1)
			{
				params.payload.nickname = "";
			}else
			{
				this._cacheCurrentDriverName = this._keyboardInput;
				if(this._cacheCurrentDriverName != "")
				{
					this._driverListCtxtDataList.items[this._cacheIndexValue].text1Id = "";
					this._driverListCtxtDataList.items[this._cacheIndexValue].text1 = this._cacheCurrentDriverName;
				}
			}
			framework.sendEventToMmui(this.uiaId, appData, params);
			break;
        default :
             log.warn("driverid: Unknown Appdata", appData);
             break;
    }
};

//This function called when "Cancel" button on the keyboard is clicked.
driveridApp.prototype._KeyboardQwertyCancel = function(btnRef, appData, params)
{
    log.debug("[_KeyboardQwertyCancel] is called....");
    /*
     *This function called when "Cancel" button on the keyboard is clicked.
     */
    if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "Keyboard")
    {
        //this._currentContextTemplate.keyboardCtrl._setPlaceholder('');             //clear the edit text field.
    	this._contextTable.Keyboard.controlProperties.KeyboardCtrl.value = "";
    	log.debug("[_KeyboardQwertyCancel]About to Send Global.GoBack to MMUI");
        framework.sendEventToMmui("common", "Global.GoBack");
    }
};

//This function called when "OK" button on the dialog is clicked.
driveridApp.prototype._dialogClickCallback = function() 
{
	log.debug("[_dialogClickCallback] called ");
	//Condition for Checking that the Given context must be "Nickname" 
    if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "Nickname")
    {
        framework.sendEventToMmui("common","Global.Yes", null);
    }
};

//This function called to remove winkcontrol.
driveridApp.prototype._destroyControl = function(controlObj)
{
	log.debug("[_destroyControl] called ");
    if(!controlObj)
    {
        return;
    }
    controlObj.cleanUp();
    utility.removeHTMLElement(controlObj.divElt.id);
    clearTimeout(this._timeOutForWink);                 //clear respective wink timer. 
    this._timeOutForWink = null;
};

//Function define for setting the Icon in front of the driver list
driveridApp.prototype._setIcon = function(driverId)
{
    log.debug("[_setIcon] called......Driver index :: "+driverId);
    this._resetIcon();                                                                                                // remove the previously set image
    if(driverId)
	{
	this._driverListCtxtDataList.items[driverId].image1 = "common/images/icons/IcnListCheckmark.png";  //set images on respected list index.
	} 
};

//Reset the icon
driveridApp.prototype._resetIcon = function()
{
	log.debug("[_resetIcon] called ");
    var item = 0;
    for(item in this._driverListCtxtDataList.items)
    {
        this._driverListCtxtDataList.items[item].image1 = null;           //clear images from the list. 
    }
};

//Updated data list
driveridApp.prototype._CheckForDuplicates = function(DuplicateEntry)
{
	log.debug(" [_CheckForDuplicates] is Called......");

    var listitem = 0;                                                                                            //variable atcs as counter in driverlist
	log.debug(" [Driver Nickname] _cacheIndexValue......"+this._cacheIndexValue);
	log.debug(" [Driver Nickname] ......"+this._keyboardInput);
	
    for(listitem ; listitem < this._cachedDriverListCount ; listitem++)
   {
		log.debug(" [Driver Nickname] Index......"+listitem);
		log.debug(" [Driver Nickname] ......"+this._driverListCtxtDataList.items[listitem+1].text1);
		if (this._cacheIndexValue != (listitem+1))
		{
			if(this._keyboardInput === this._driverListCtxtDataList.items[listitem+1].text1)
		   {
				log.debug(" [Driver Nickname] ......"+this._keyboardInput);
				this._DuplicateEntry = 1;
		   }
		}
    }
};



//Updated data list
driveridApp.prototype._updateDataList = function()
{
    log.debug("[_updateDataList] Called....." +this._cacheIndexValue );
    if( this._currentContextTemplate  && this._currentContext && this._currentContext.ctxtId === "DriverMenu" )
    { 
    	//If Driver menu status is on then enable driver list
		if(this._driverMenuStatus === "ON")
		 {
		     this._ContentEnable();
		 }
		
		//if vehicle speed exceeds the threshold value then disable edit optin.
		this._getEditNickNameItem();
		
		 //If Driver menu status is on then enable driver list
		if(this._driverMenuStatus === "OFF")
		{
		    this._ContentDisable();
		}
		 
		this._setIcon(this._currentDriver);
		log.debug("[_updateDataList] current driver index :: "+this._cacheIndexValue +"this._atSpeed :: "+this._atSpeed +"this._currentDriver ::"+this._currentDriver);
		this._currentContextTemplate.list2Ctrl.setDataList(this._driverListCtxtDataList);
		this._currentContextTemplate.list2Ctrl.updateItems(0,this._driverListCtxtDataList.itemCount - 1);
    }
};

//Function to disable the driver list 
driveridApp.prototype._ContentDisable = function()
{
    log.debug("[_ContentDisable] called ");
    if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "DriverMenu")
    {
        for(this._itemcount in this._driverListCtxtDataList.items)
        {
            if(this._itemcount != 0)
            {
                
                this._driverListCtxtDataList.items[this._itemcount].disabled = true;                      //It disable the DriverId list.
                this._driverListCtxtDataList.items[this._itemcount].image1 = null;                        //It clear the set Icon in front of DriverId list.
            }
        }
        this._driverListCtxtDataList.items[0].value = 2;                                                  //set check mark OFF.
    }
};

//function to convert select the driver num from int to enum
driveridApp.prototype._getSelectedDriver = function(selectedDriver)
{
    log.debug("[_getSelectedDriver] selected driver :: "+selectedDriver);
    
    switch(selectedDriver)
    {
    case 0 :     
            this._itemIndexValue = "UNKNOWN" ;
            break;
    case 1 :     
            this._itemIndexValue = "ONE" ;
            break;
    case 2 :     
            this._itemIndexValue = "TWO" ;
            break;
    case 3 :     
            this._itemIndexValue = "THREE" ;
            break;
    case 4 :     
            this._itemIndexValue = "FOUR" ;
            break;
    case 5 :     
            this._itemIndexValue = "FIVE" ;
            break;
    case 6 :     
            this._itemIndexValue = "INVALID" ;
            break;
    default:
            log.warn("In default case");
            break;
    }
    log.debug("[_getSelectedDriver] RETURN selected driver :: "+selectedDriver);
};


//Function to enable all the list items
driveridApp.prototype._ContentEnable = function()
{
    log.debug("[_ContentEnable] Called.");
    if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "DriverMenu")
    {
        var tempcount = this._driverListCtxtDataList.itemCount;//Storing value of ItemCount in local variable.
        var listItem = 1;                                      //Acts as counter of driver list.
        
        //Condition for Enabling The number of items in the DriverId list
        for(listItem ; listItem < tempcount ; listItem++)
        {
            //Condition for Checking IndexValue is 6 i.e for Unknown then the IndexItem must be disable.
            if(listItem !== this._UnknownItemIndex)
            {
                this._driverListCtxtDataList.items[listItem].disabled = false;
            }
            else
            {
                this._driverListCtxtDataList.items[listItem].disabled = true;
            }
        }
        this._driverListCtxtDataList.items[0].value = 1;         //Set check mark as ON.
    }
};

//Function to enable or disable editnickname listitem ,if vehicle speed exceeds the threshold value or driver is unknown.
driveridApp.prototype._getEditNickNameItem = function()
{
	if(this._cacheIndexValue === 0|| this._atSpeed)
	{
    this._driverListCtxtDataList.items[7].disabled =  true;
	}
	else
	{
	this._driverListCtxtDataList.items[7].disabled =  false;
	}
};

//Funtion to get wink properties
driveridApp.prototype.getWinkProperties = function(alertId, params)
{
    log.debug("driverID wink properties for: ", alertId, params);
    var winkProperties = null;
    this._winkmessage = "EnjoyDriving";	
    log.debug("[_getWinkProperties] wink property " + alertId);
    
    switch(alertId)
    {
        case "DriverIdentified":
            winkProperties = {
                "style": "style01",
                "text1Id": this._winkmessage,
                "text1SubMap": {"nickname": this._cacheCurrentDriverName},
            };
            break;
        case "DriverUnIdentified":
             winkProperties = {
                "style": "style01",
                "text1Id": this._winkmessage,
                "text1SubMap": {"nickname": ""},
            };        	
        	break;
        default:
            // Display default Wink
            log.debug("No properties found for wink: " + alertId);
            break;
    }
    // return the properties to Common
    return winkProperties;
}; 
/**************************
 * Framework register
 **************************/
framework.registerAppLoaded("driverid", null, true);                     //Tell framework this .js file has finished loading