/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: warnguideApp.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author:TCS
 Date:  21-Jan-2013
 __________________________________________________________________________
 
 Description: IHU GUI warning guidance Application
 ______________________________________________________________________
 Revisions:
 v0.1 (21-Jan-2013)
 v0.2 (15-Mar-2013) // changed warning images. and updated some part of code in the highpriorty warning dialog.
 v0.3 (26-Apr-2013) // changed warning images, updated high priority strings and handled warning msg in such a way that,
                    //warning list doesn't get update when context is "WarningList."
 v0.4 (6-May-2013)  //SW00116124, SW00116185 has been fixed.[No warning icon display issue and warning list update issue].
 v0.5 (7-May-2013)  //SW0011287  has been fixed and updated new images with latest enable and disable images.
 v.0.6(22-May-2013) //SW00119113 has been fixed [Mismatch in warnings for warning numbers 82,83 and 84.].
 v.0.7(07-June-2013)//Updated the warning icons names as per studio generation. Added needed logs.
                    //Removed Check of context from "warningStatusmsgHandler", as it is handled from mmui and blm.
                    //Updated with Destination related changes to display warning icons depending on destination. 
 v.0.8(24-June-2013)//Hide Home button on HighPriority context(SW00125540).
 v.0.8(13-Aug-2013) //Fix for SCR SW00128042-Warning description is not shown after speed restriction is removed and High alert pop-up dismissed. 
 v.0.9(28-May-2014) - J71 changes - avalajh
 v.0.10(9-June-2014) - J36 image changes - avalajh
 v.0.11(25-July-2014) - J12A interface changes 
 v.0.12(2-Sep-2014) - Typo mistake for image 72_73_74 - avalajh 
 v.0.13(20-Nov-2014) - Changes are done to reduce the message size
 */
log.addSrcFile("warnguideApp.js", "warnguide");
log.setLogLevel("warnguide", "debug");
function warnguideApp(uiaId)
{
    baseApp.init(this, uiaId);
    
    //Variables initialization
	this._FSCType = null;
    this._highPriorityValues = null;
    this._warningCount = null;
    this._currentWarningId = null;
    this._cachedDetail = null;
    this._cachedWarningsArrayToPopulate = new Array();
    this._warningDetailsCtxtDataList = null;
    this._warningDetailTitle = null;        //Structure to display warning title
    this._createWarningDatabase();
    this._cachedDetailWarningName = null;
    this._cachedDetailWarningDescription = null;
    this._cachedDetailedWarningImage = null;
}

/*********************************************************************************************/
/**
 * The function below is called just after the application is instantiated by the framework
 */
warnguideApp.prototype.appInit = function()
{
    if (framework.debugMode)
    {
        utility.loadScript("apps/warnguide/test/warnguideAppTest.js");
    }
    
    this.warningListCtxtDataList = null;                    // data provider for warning list
    this._activeWarning = null;                             //temp array variable to store active warnings.
    this._imageEnable = null;                               // variable to hold enabled image of the active waring
    this._imageDisable = null;                              // variable to hold disabled image of the active waring
    this._atSpeedVal = null;                                // variable to store atspreed treshold condition.
    //For J03
	this._cachedVehicleType = null;
    
    //Context table 
    this._contextTable = {
        //This context is for the warning list display
        "WarningList" :
        {
            "template"                  : "List2Tmplt",
            "sbNameId"                  : "WarningGuidance",
            "leftBtnStyle"              : "goBack",
            "controlProperties"         : 
            {
                "List2Ctrl"             :
                {
                    "dataList"          : this.warningListCtxtDataList,
                    titleConfiguration  :'listTitle',
                    title               : 
                    {
                    	titleStyle:'style03',
                    	text1Id:"Warnings",
                    },
                    "selectCallback" : this._listItemClickCallback.bind(this)
                }
            },
            "readyFunction" : this._warningListReadyToDisplay.bind(this)
        },
    
        
    //This context is for the pop up display of the high priority warning pop up
    "HighPriorityAlert"                           :
      {
          "template"                        : "Dialog3Tmplt",
          "hideHomeBtn"                     : true,
          "controlProperties"               :
          {
              "Dialog3Ctrl"                 :
              {
                  "contentStyle"            : "style20",
                  "fullScreen"              : false,
                  "titleStyle"              : "titleStyle02",
                  "titleId"                 : "WarningGuidance",
                  "titleSubMap" : null,
                  "buttonCount"             : 1,
                  "buttonConfig"            : 
                  {
                      "button1"             :
                      {                            
                          selectCallback    : this._dialogClickCallback.bind(this), 
                          buttonColor       : "normal",
                          buttonBehavior    : "shortPressOnly",
                          labelId           : "common.Ok", 
                          appData           : "Global.Yes",
                          disabled          : false
                      }
                 },
                 "text1Id" : null
              }
           },
           "readyFunction" : this._highAlertReadyToDisplay.bind(this)
       },
       
       
       //This context is for warning details display 
       "WarningDetail"                       :
       {
           "template"                        : "ScrollDetailTmplt",
           "sbNameId"                        : "WarningGuidance",
           "leftBtnStyle"                    : "goBack",
           "controlProperties"               : 
           {
               "ScrollDetailCtrl"                   :
               {
                   controlStyle : "style2",
               }
           }, // end of list of controlProperties
           "readyFunction" : this._warningDetailReadyToDisplay.bind(this)
       }
       
    };// end of this.contextTable

    /*******************List Of Message Table*****************/

    this._messageTable = 
    {
        "WarningStatus"                       : this._WarningStatusMsgHandler.bind(this),
        "SelectedWarning"                     : this._SelectedWarningMsgHandler.bind(this),
        "HighAlert"                           : this._HighalertMsgHandler.bind(this),
        "Global.AtSpeed"                      : this._AtSpeedMsgHandler.bind(this),
        "Global.NoSpeed"                      : this._NoSpeedMsgHandler.bind(this),
		"FSCType"                      		  : this._FSCTypeMsgHandler.bind(this),
    };
    /** *****************End Of List Of Message Table**************** */
};

/*******************End Of List Of the application initialization function*****************/

/*******************Beginning Of Message Handlers***************/
/**
 * Warning status message handler on receiving the WarningStatus msg payload from MMUI
 */
warnguideApp.prototype._WarningStatusMsgHandler = function(msg)
{
    log.debug("called [_WarningStatusMsgHandler] Current Context is :: "+this._currentContex);
    
    if (msg && msg.params && msg.params.payload && msg.params.payload.WarningList && msg.params.payload.WarningList.Warning_count
         && msg.params.payload.WarningList.Warning_Values )
    {
        this._cachedVWMValues = msg.params.payload.WarningList.Warning_Values;//Assigns the values of the warnings in the array
        //this._warningPriority = msg.params.payload.WarningList.Warning_Priority;// Assigns the priority to app variable [future use]
    }
    
    this._warningCount = msg.params.payload.WarningList.Warning_count;//Assigns the total number of warning counts
    log.debug("Received warnings from the MMUI :: "+this._cachedVWMValues +"Received Warning Count is :: "+this._warningCount);

};

/**
 *  
 * _AtSpeedMsgHandler message handler.Called when the speed exceeds threshold value.
 */
warnguideApp.prototype._AtSpeedMsgHandler = function(msg) 
{
    this._cachedDetail = [];                            //temp variable to store safety msg.
    this._atSpeedVal = true;                            // Speed threshold crossed.
    
    // if the current context is "WarningList" then populate list with diabled items.
    if (this._currentContextTemplate && this._currentContext 
            && this._currentContext.ctxtId === "WarningList") 
    {
        log.debug("[_AtSpeedMsgHandler] Current context is warninglist ,Hence about to disable warninglist");
        this._disableWarningList();
        this._populateWarningList();
    }

 // if the current context is "WarningDetail" then show the display detail.
    if (this._currentContextTemplate && this._currentContext
            && this._currentContext.ctxtId === "WarningDetail") 
    {
        log.debug("[_AtSpeedMsgHandler] Current context is warningdetail ,Hence abt to show safety msg");
        
        //Set properties of warning detail screen in an array(Safety message).
        //If the present context is display of warning details a safety message is displayed on the screen.
        this._cachedDetail =
    	{
    		controlStyle : "style3",
        	scrollDetailIcn : null,
    		scrollDetailTitleId : null,
    		scrollDetailTitle : null,
    		scrollDetailBodyId : "WarningSafetyMessage"
    	};
        this._populateWarningDetails( this._cachedDetail);
    }
};

/**
 *  
 * _NoSpeed message handler.Called when the speed is normal
 */
warnguideApp.prototype._NoSpeedMsgHandler = function(msg)
{
    log.debug("Called _NoSpeedMsgHandler");
    var imageIndex = null;                        //hold index of the active warning.
    this._cachedDetail = [];                      // array to hold the details of the selected warning.
    this._atSpeedVal = false;                      //speed is not crossed threshold lavel
    
    //Restore the warninglist. 
    for ( var warningNumber = 0; warningNumber < this._cachedWarningsArrayToPopulate.length; warningNumber++)
    {
        imageIndex =this._activeWarning[warningNumber];
        this._cachedWarningsArrayToPopulate[warningNumber].disabled = false;
        
        //Check for availability of images 
        this._chooseDestination(imageIndex);
        
        if(imageIndex !== undefined)
        {
        	log.debug("Image index is ::"+imageIndex +"Image ::" +this._imageEnable);
          this._cachedWarningsArrayToPopulate[warningNumber].image1 = this._imageEnable;
        }
    };
    //Restrore the selected warning detail. 
    this._cachedDetail =
	{
    	controlStyle : "style2",
    	scrollDetailIcn : this._cachedDetailedWarningImage,
		scrollDetailTitleId : this._cachedDetailWarningName,
		scrollDetailBodyId : this._cachedDetailWarningDescription
	};
    
    //check if the context is "WarningList" or "WarningDetail"display the currently active warnings.
    if (this._currentContextTemplate && this._currentContext
            && this._currentContext.ctxtId === "WarningList")
    {
        log.debug("[_NoSpeedMsgHandler] Current context is warninglist ,Hence about to enable warninglist");
        this._populateWarningList();                 // populate the warninglist.
    }
    else if (this._currentContextTemplate && this._currentContext
            && this._currentContext.ctxtId === "WarningDetail") 
    {
        //Set properties of warning detail screen in an array.
        log.debug(" [_NoSpeedMsgHandler] warning details image ::" +this._cachedDetailedWarningImage +"warning name ::"+this._cachedDetailWarningName +"Warning Detail"+this._cachedDetailWarningDescription);
        this._populateWarningDetails( this._cachedDetail);
    }
};

/**
 * This handler act upon the warning selected message and shows the warning details.
 * @param msg
 */
warnguideApp.prototype._SelectedWarningMsgHandler = function(msg)
{
    log.debug("called _SelectedWarningMsgHandler");
    
    this._cachedDetail =[];                      // array to hold the details of the selected warning.
    
    if (msg && msg.params && msg.params.payload /*&&  msg.params.payload.WarningID*/)
    {
        // caching the data received from MMUI
        this._currentWarningId = msg.params.payload.WarningID;
        log.debug("[_SelectedWarningMsgHandler] Received warning Id is :: "+this._currentWarningId);
        for ( var warningNumber = 0; warningNumber < this._warningsDataBase.length; warningNumber++)
        {
            if (this._warningsDataBase[warningNumber].warning_Id === this._currentWarningId || this._warningsDataBase[warningNumber].warning_no === this._currentWarningId)
            {
                this._chooseDestination(warningNumber);              //function decides the destination and selects warning images accordingly.
                
                this._cachedDetailWarningName = this._warningsDataBase[warningNumber].warning_Name; // keep a copy of selected warning name.
                this._cachedDetailWarningDescription = this._warningsDataBase[warningNumber].detailed_Description;// keep a copy of selected warning description.
                this._cachedDetailedWarningImage = this._imageEnable;                                             //keep a copy of selected warning image.
                
                
                //Set properties of warning detail screen in an array.
                this._cachedDetail =
            	{
                	controlStyle : "style2",
            		scrollDetailIcn : this._cachedDetailedWarningImage,
            		scrollDetailTitleId : this._cachedDetailWarningName,
            		scrollDetailBodyId : this._cachedDetailWarningDescription
            	};
                log.debug("[_SelectedWarningMsgHandler]warning details image ::" +this._cachedDetailedWarningImage +"warning name ::"+this._cachedDetailWarningName +"Warning Detail"+this._cachedDetailWarningDescription);
            }
        }

        // checking if "WarningDetail" context are active if its active , then populate list along with its resp title.
        if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "WarningDetail")
        {
            log.debug("About to display warning detail");
            this._populateWarningDetails(this._cachedDetail);
        }
    }
};
/**
 *  
 * High priority message handler
 */
warnguideApp.prototype._HighalertMsgHandler = function(msg)
{
    log.debug("called _HighalertMsgHandler");
    var tempArray = [];
    
    if (msg && msg.params && msg.params.payload && msg.params.payload.HAWarningList 
            && msg.params.payload.HAWarningList.Warning_HA_Values && msg.params.payload.HAWarningList.Warning_HA_Values_Priority) 
    {
        this._highPriorityValues = msg.params.payload.HAWarningList.Warning_HA_Values;
        log.debug("[_HighalertMsgHandler] High priority values received:: " +this._highPriorityValues);
       // this._highAlertPriorityValue = msg.params.payload.HAWarningList.Warning_HA_Values_Priority;  //For future use
    }
    //Getting the details of received warning from the DataBase and pushing it to a temporary array in the required format
    for ( var dbWarning = 0; dbWarning < this._warningsDataBase.length; dbWarning++)
    {
        if (this._highPriorityValues === this._warningsDataBase[dbWarning].warning_Id || this._highPriorityValues === this._warningsDataBase[dbWarning].warning_no)
        {
            this._chooseDestination(dbWarning);              //function decides the destination and selects warning images accordingly.
              tempArray.push({
                appData : {
                    eventName : "SelectWarning"
                },
                text1Id : this._warningsDataBase[dbWarning].warning_Name,
                itemStyle : "style17",
                image1 : this._imageEnable
            });
            break;
        }
    }
            this._cachedWarningsArrayToPopulate = tempArray
            .concat(this._cachedWarningsArrayToPopulate);

    // checking if all context are active
    if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "HighPriorityAlert" ) 
    {
        log.debug("[_HighalertMsgHandler] About to populate HighAlert");
        this._populatehighPriorityAlert();
    }
};


/** FSC Type Message Handeler  #J71 Changes **/
warnguideApp.prototype._FSCTypeMsgHandler = function(msg)
{
	if (msg && msg.params && msg.params.payload && msg.params.payload.type) 
    {
		this._FSCType = msg.params.payload.type;
	}
}


/*******************End Of Message Handlers *****************/

/*******************Beginning Of Ready to display *****************/

warnguideApp.prototype._warningListReadyToDisplay = function()
{
    this._atSpeedVal = framework.common.getAtSpeedValue();// check for the speed threshould.
    log.debug("[_warningListReadyToDisplay] speed Threshould crossed :: "+this._atSpeedVal);
    this._activeWarning = [];
    
    // check if the _currentContextTemplate is active, if actibe then populate the currently available warnings.
    if(this._currentContextTemplate)
    {
        this._cachedWarningsArrayToPopulate = []; // create new array only if current context is not warningDetail. 
        if ( this._warningCount > 0)//Checks whether any warnings are present or not, if present then cache it.
        {
			//For J03
			this._cachedVehicleType = framework.getSharedData("syssettings","VehicleType");
			if((this._cachedVehicleType !== "SETTINGS_VehicleModelType_J36") /*&& (this._cachedVehicleType !== "SETTINGS_VehicleModelType_J12A")*/ )
			{				
				this._warningsDataBase[37].imagePathEnable = "apps/warnguide/images/IcnWrn37_J03_En.png",
				this._warningsDataBase[37].imagePathDisable = "apps/warnguide/images/IcnWrn37_J03_Ds.png"		
				
				this._warningsDataBase[39].warning_no = 39;
				this._warningsDataBase[39].warning_Name = "AutoLevelSystemErrorShrtJ03",
				this._warningsDataBase[39].detailed_Description = "HeadlightSystemErrorLongJ03",
				this._warningsDataBase[39].imagePathEnable = "apps/warnguide/images/IcnWrn40_J03_En.png",
				this._warningsDataBase[39].imagePathDisable = "apps/warnguide/images/IcnWrn40_J03_Ds.png"
			}
			else
			{
				this._warningsDataBase[37].imagePathEnable = "apps/warnguide/images/IcnWrn37_En.png",
				this._warningsDataBase[37].imagePathDisable = "apps/warnguide/images/IcnWrn37_Ds.png"
				
				this._warningsDataBase[39].warning_no = 39;
				this._warningsDataBase[39].warning_Name = "AutoLevelSystemErrorShrt",
				this._warningsDataBase[39].detailed_Description = "AutoLevelSystemErrorLong",
				this._warningsDataBase[39].imagePathEnable = "apps/warnguide/images/IcnWrn40_En.png",
				this._warningsDataBase[39].imagePathDisable = "apps/warnguide/images/IcnWrn40_Ds.png"
			
			}
			// For warning no 70 according to id need to display warning
			for ( var i = 0; i < this._warningCount; i++) 
			{                
				if (this._cachedVWMValues[i] === 67)
				{				
					// Warning number 70 according to UI spec
					this._warningsDataBase[67].warning_no = 67;
					this._warningsDataBase[67].warning_Id = "LDWS_Inspection_Required";
					this._warningsDataBase[67].warning_Priority = "Low";
					this._warningsDataBase[67].warning_Name = "LDWSSysErrorShrt";
					this._warningsDataBase[67].detailed_Description = "LDWSSysErrorLong";
					this._warningsDataBase[67].imagePathEnable = "apps/warnguide/images/IcnWrn70_En.png";
					this._warningsDataBase[67].imagePathDisable = "apps/warnguide/images/IcnWrn70_Ds.png";	
					break;
					
				} 
				else if (this._cachedVWMValues[i] === 68)
				{	
					this._warningsDataBase[67].warning_no = 68;
					this._warningsDataBase[67].warning_Id = "LKA_Malfunction";
					this._warningsDataBase[67].warning_Priority = "Low";
					this._warningsDataBase[67].warning_Name = "LDWSSysErrorShrt_2";
					this._warningsDataBase[67].detailed_Description = "LDWSSysErrorLong_2";
					this._warningsDataBase[67].imagePathEnable = "apps/warnguide/images/IcnWrn70_En.png";
					this._warningsDataBase[67].imagePathDisable = "apps/warnguide/images/IcnWrn70_Ds.png";			
					break;
				}			
			}
		
			// Warning number 71 according to UI spec
			if(this._FSCType == 10 || this._FSCType == 11)
			{
				this._warningsDataBase[68].warning_no = 69;
				this._warningsDataBase[68].warning_Name = "HBCSysErrorShrt_2";
				this._warningsDataBase[68].detailed_Description = "HBCSysErrorLong_2";
				this._warningsDataBase[68].imagePathEnable = "apps/warnguide/images/IcnWrn71_En.png";
				this._warningsDataBase[68].imagePathDisable = "apps/warnguide/images/IcnWrn71_Ds.png";			
						
			}
			else if(this._FSCType != 10 && this._FSCType != 11)
			{
				this._warningsDataBase[68].warning_no = 69;
				this._warningsDataBase[68].warning_Name = "HBCSysErrorShrt";
				this._warningsDataBase[68].detailed_Description = "HBCSysErrorLong";
				this._warningsDataBase[68].imagePathEnable = "apps/warnguide/images/IcnWrn71_En.png";
				this._warningsDataBase[68].imagePathDisable = "apps/warnguide/images/IcnWrn71_Ds.png";			
			}
			
			if(this._FSCType == 12)
			{
				// Warning number 72 according to UI spec
				this._warningsDataBase[69].warning_no = 70;
				this._warningsDataBase[69].warning_Name = "HBCLLDWSCamDisconnectShrt_2";// No string is available for HBC/LAS Camera Malfunction
				this._warningsDataBase[69].detailed_Description = "HBCLLDWSCamDisconnectLong_2";
				this._warningsDataBase[69].imagePathEnable = "apps/warnguide/images/IcnWrn72_73_74_En.png";
				this._warningsDataBase[69].imagePathDisable = "apps/warnguide/images/IcnWrn72_73_74_Ds.png";
				
				// Warning number 73 according to UI spec
				this._warningsDataBase[70].warning_no = 71;
				this._warningsDataBase[70].warning_Name = "HBCLDWSSysErrorShrt_2";
				this._warningsDataBase[70].detailed_Description = "HBCLDWSSysErrorLong_2";
				this._warningsDataBase[70].imagePathEnable = "apps/warnguide/images/IcnWrn72_73_74_En.png";
				this._warningsDataBase[70].imagePathDisable = "apps/warnguide/images/IcnWrn72_73_74_Ds.png";
				
				// Warning number 74 according to UI spec
				this._warningsDataBase[71].warning_no = 72;
				this._warningsDataBase[71].warning_Name = "HBCLDWSWindshieldFogShrt_2";
				this._warningsDataBase[71].detailed_Description = "HBCLDWSWindshieldFogLong_2";
				this._warningsDataBase[71].imagePathEnable = "apps/warnguide/images/IcnWrn72_73_74_En.png";
				this._warningsDataBase[71].imagePathDisable = "apps/warnguide/images/IcnWrn72_73_74_Ds.png";
			
			}
			else if(this._FSCType == 10)
			{
				// Warning number 72 according to UI spec
				this._warningsDataBase[69].warning_no = 70;
				this._warningsDataBase[69].warning_Name = "HBCLLDWSCamDisconnectShrt_3"; 
				this._warningsDataBase[69].detailed_Description = "HBCLLDWSCamDisconnectLong_3";
				this._warningsDataBase[69].imagePathEnable = "apps/warnguide/images/IcnWrn72_73_74_En.png";
				this._warningsDataBase[69].imagePathDisable = "apps/warnguide/images/IcnWrn72_73_74_Ds.png";
				
				// Warning number 73 according to UI spec
				this._warningsDataBase[70].warning_no = 71;
				this._warningsDataBase[70].warning_Name = "HBCLDWSSysErrorShrt_3";
				this._warningsDataBase[70].detailed_Description = "HBCLDWSSysErrorLong_3";
				this._warningsDataBase[70].imagePathEnable = "apps/warnguide/images/IcnWrn72_73_74_En.png";
				this._warningsDataBase[70].imagePathDisable = "apps/warnguide/images/IcnWrn72_73_74_Ds.png";
				
				// Warning number 74 according to UI spec
				this._warningsDataBase[71].warning_no = 72;
				this._warningsDataBase[71].warning_Name = "HBCLDWSWindshieldFogShrt_3";
				this._warningsDataBase[71].detailed_Description = "HBCLDWSWindshieldFogLong_3";
				this._warningsDataBase[71].imagePathEnable = "apps/warnguide/images/IcnWrn72_73_74_En.png";
				this._warningsDataBase[71].imagePathDisable = "apps/warnguide/images/IcnWrn72_73_74_Ds.png";
			
			}
			else if(this._FSCType == 11)
			{
				// Warning number 72 according to UI spec
				this._warningsDataBase[69].warning_no = 70;
				this._warningsDataBase[69].warning_Name = "HBCLLDWSCamDisconnectShrt_4";
				this._warningsDataBase[69].detailed_Description = "HBCLLDWSCamDisconnectLong_4";
				this._warningsDataBase[69].imagePathEnable = "apps/warnguide/images/IcnWrn72_73_74_En.png";
				this._warningsDataBase[69].imagePathDisable = "apps/warnguide/images/IcnWrn72_73_74_Ds.png";
				
				// Warning number 73 according to UI spec
				this._warningsDataBase[70].warning_no = 71;
				this._warningsDataBase[70].warning_Name = "HBCLDWSSysErrorShrt_4";
				this._warningsDataBase[70].detailed_Description = "HBCLDWSSysErrorLong_4";
				this._warningsDataBase[70].imagePathEnable = "apps/warnguide/images/IcnWrn72_73_74_En.png";
				this._warningsDataBase[70].imagePathDisable = "apps/warnguide/images/IcnWrn72_73_74_Ds.png";
				
				// Warning number 74 according to UI spec
				this._warningsDataBase[71].warning_no = 72;
				this._warningsDataBase[71].warning_Name = "HBCLDWSWindshieldFogShrt_4";
				this._warningsDataBase[71].detailed_Description = "HBCLDWSWindshieldFogLong_4";
				this._warningsDataBase[71].imagePathEnable = "apps/warnguide/images/IcnWrn72_73_74_En.png";
				this._warningsDataBase[71].imagePathDisable = "apps/warnguide/images/IcnWrn72_73_74_Ds.png";
			
			}
			else if(this._FSCType != 10 && this._FSCType != 11 && this._FSCType != 12)
			{
				// Warning number 72 according to UI spec
				this._warningsDataBase[69].warning_no = 70;
				this._warningsDataBase[69].warning_Name = "HBCLLDWSCamDisconnectShrt";
				this._warningsDataBase[69].detailed_Description = "HBCLLDWSCamDisconnectLong";
				this._warningsDataBase[69].imagePathEnable = "apps/warnguide/images/IcnWrn72_73_74_En.png";
				this._warningsDataBase[69].imagePathDisable = "apps/warnguide/images/IcnWrn72_73_74_Ds.png";
				
				// Warning number 73 according to UI spec
				this._warningsDataBase[70].warning_no = 71;
				this._warningsDataBase[70].warning_Name = "HBCLDWSSysErrorShrt";
				this._warningsDataBase[70].detailed_Description = "HBCLDWSSysErrorLong";
				this._warningsDataBase[70].imagePathEnable = "apps/warnguide/images/IcnWrn72_73_74_En.png";
				this._warningsDataBase[70].imagePathDisable = "apps/warnguide/images/IcnWrn72_73_74_Ds.png";
				
				// Warning number 74 according to UI spec
				this._warningsDataBase[71].warning_no = 72;
				this._warningsDataBase[71].warning_Name = "HBCLDWSWindshieldFogShrt";
				this._warningsDataBase[71].detailed_Description = "HBCLDWSWindshieldFogLong";
				this._warningsDataBase[71].imagePathEnable = "apps/warnguide/images/IcnWrn72_73_74_En.png";
				this._warningsDataBase[71].imagePathDisable = "apps/warnguide/images/IcnWrn72_73_74_Ds.png";
			
			}	
			//This part is to check the incoming warnings with the warnings present in the database 
			for ( var mmuiWarning = 0; mmuiWarning < this._warningCount; mmuiWarning++)
			{
				for ( var dbWarning = 0; dbWarning < this._warningsDataBase.length; dbWarning++)
				{
					/*if (this._cachedVWMValues[mmuiWarning] === this._warningsDataBase[dbWarning].warning_Id)*/
					if (this._cachedVWMValues[mmuiWarning] === this._warningsDataBase[dbWarning].warning_no)
					
					
					{
						this._activeWarning.push(dbWarning);
						
						//get the warning images according to the destination.
						this._chooseDestination(dbWarning);
						//To push the matched warnings into an array which will eventually be displayed as a list
								this._cachedWarningsArrayToPopulate
										.push({
											appData : {
												eventName : "SelectWarning"
											},
											disabled : false,
											text1Id : this._warningsDataBase[dbWarning].warning_Name,
											itemStyle : "style17",
											image1 : this._imageEnable,
											hasCaret : false,
										});
					}
				}
			}
			if(this._atSpeedVal)                                 // if vehicle has crossed speed threshold then disable the list items.
			{
				this._disableWarningList();
			}            
        }
        else                           // if warnings are not present then show "No Warning" msg.
        {
            log.debug("warningCount is zero so populating default msg");
            this._cachedWarningsArrayToPopulate.push({
                disabled : true,
                text1Id : "NoWarnings",
                itemStyle : "style17",
                hasCaret : false,
    
            });
        }
    }
    
    
    if (this._currentContextTemplate && this._currentContext)
    {
        log.debug("[_warningListReadyToDisplay] About to populate warning list");
        this._populateWarningList();                  // populate currently active warnings.
    }
};
//End of Ready to display function for maintenanceList Context

warnguideApp.prototype._warningDetailReadyToDisplay = function()
{
	this._atSpeedVal = framework.common.getAtSpeedValue();// check for the speed threshold.
	
    log.debug("called _warningDetailReadyToDisplay n speed thrshold is :: "+this._atSpeedVal);
    //Check weather _currentContextTemplate is active and for availabilty of warning detail in cache(this._cachedDetail)
    if (this._currentContextTemplate && this._cachedDetail != null) 
    {
        log.debug("[_warningDetailReadyToDisplay] About to display warning detail");
        // If spped has crossed the thrshold level then disaplay Safety Message.
        if(this._atSpeedVal)
        	{
        	 this._cachedDetail =
             {
         		controlStyle : "style3",
             	scrollDetailIcn : null,
         		scrollDetailTitleId : null,
         		scrollDetailTitle : null,
         		scrollDetailBodyId : "WarningSafetyMessage"
         	 };
        	}
        this._populateWarningDetails(this._cachedDetail);
    }
};

warnguideApp.prototype._highAlertReadyToDisplay = function() 
{
    log.debug("called _highAlertReadyToDisplay");
    //Check weather _currentContextTemplate is active
    if (this._currentContextTemplate)
    {
        this._populatehighPriorityAlert();
    }
};

/*******************End Of Ready to display *****************/

/*******************Beginning Of Populate Functions *****************/
/*********************************************************************/
/**
 *
 * This method populates warning list
 */
warnguideApp.prototype._populateWarningList = function()
{
    log.debug("called _populateWarningList "+this._cachedWarningsArrayToPopulate.length);
   // check for availability of warnings in cache values to display
    if (this._cachedWarningsArrayToPopulate.length && this._cachedWarningsArrayToPopulate.length !=0)
    {
        this.warningListCtxtDataList = {
            appData : "WarningListSelected",
            itemCountKnown : true,
            itemCount : this._cachedWarningsArrayToPopulate.length,
            items : this._cachedWarningsArrayToPopulate,
            itemStyle : "style17",
            hasCaret : false
        };
        this._currentContextTemplate.list2Ctrl
                .setDataList(this.warningListCtxtDataList);
        this._currentContextTemplate.list2Ctrl.updateItems(0,
                this.warningListCtxtDataList.itemCount - 1);
    }
};

/**
 * 
 * This method populate the High Priroty Warning
 */
warnguideApp.prototype._populatehighPriorityAlert = function()
{
    log.debug("called _populatehighPriorityAlert");
    //check if highpriority warning is available
    if (this._highPriorityValues)
    {
        // populating the pop up dialog box context with received MMUI values
        for ( var populateHighalert = 0; populateHighalert < this._warningsDataBase.length; populateHighalert++)
        {
            if (this._highPriorityValues == this._warningsDataBase[populateHighalert].warning_Id || this._highPriorityValues == this._warningsDataBase[populateHighalert].warning_no)
            {
                //get the warning images according to the destination.
                this._chooseDestination(populateHighalert);
                
                if(this._warningsDataBase[populateHighalert].dialogText !== null && this._imageEnable !== null)
                {
                    log.debug("Dialog text is :: " +this._warningsDataBase[populateHighalert].dialogText);
                    log.debug("Dialog IMAGE PATH IS  :: " +this._warningsDataBase[populateHighalert].imagePathEnable);
                    this._currentContextTemplate.dialog3Ctrl
                            .setText1Id(this._warningsDataBase[populateHighalert].dialogText);
                            
                    this._currentContextTemplate.dialog3Ctrl.setImagePath1(this._warningsDataBase[populateHighalert].imagePathEnable);
                }
            }
        }
    }
};


/**
 * 
 * This method populate the WarningDetails screen 
 */
warnguideApp.prototype._populateWarningDetails = function(warningDetail)
{
    log.debug("called _populateWarningDetails");
    this._currentContextTemplate.scrollDetailCtrl.setConfig(warningDetail);
};
/** *****************End Of Populate Functions **************** */



/*******************Beginning Of Call backs *****************/
/*************************************************************/

/**
 * 
 * This method gets called when BUTTON on dialog gets clicked. 
 */
warnguideApp.prototype._dialogClickCallback = function() 
{
    if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "HighPriorityAlert")
    {
        log.debug("[_dialogClickCallback] about to send Global.Yes event to MMUI");
        framework.sendEventToMmui("common", "Global.Yes", null);
    }
};


/**
 * 
 * This method gets called when list item gets clicked.
 */
warnguideApp.prototype._listItemClickCallback = function(listCtrlObj, appData,
        params) {
    switch (this._currentContext.ctxtId)
    {
        case "WarningList":
            switch (appData.eventName)
            {
                case "SelectWarning":
                    var paramsPayLoad =
                    {
                        "payload" :
                        {
                            "WarningID" : this._cachedVWMValues[params.itemIndex]
                        }
                    };
                    framework.sendEventToMmui(this.uiaId, appData.eventName,
                            paramsPayLoad);
                    break;
                case "GoBack":
                    framework.sendEventToMmui(this.uiaId, appData.eventName, null);
                    break;
                default:
                    log.warn("No such context is defined");
                    break;
            }
            break;
        case "WarningDetail":
            switch (appData.eventName)
            {
                case "GoBack":
                    framework.sendEventToMmui(this.uiaId, appData.eventName, null);
                    break;
                default:
                    log.warn("No such context is defined");
                    break;
            }
            break;
        default:
            log.warn("No such context is defined");
            break;
    }
};
/*******************End of call backs*****************/

/***************************** Helper functions *********************/
/**
 * 
 * This method disables the warning list. 
 */ 

warnguideApp.prototype._disableWarningList = function()
{
    log.debug("called _disableWarningList");
    var imageIndex = null;
    for ( var warningNumber = 0; warningNumber < this._cachedWarningsArrayToPopulate.length; warningNumber++)
    {
        imageIndex =this._activeWarning[warningNumber];
        this._cachedWarningsArrayToPopulate[warningNumber].disabled = true;
        
      //get the warning images according to the destination.
        this._chooseDestination(imageIndex);
        
        //Check weahter image is present to display.
        if(imageIndex != undefined)
        {
          this._cachedWarningsArrayToPopulate[warningNumber].image1 = this._imageDisable;
          log.debug("Disable image path is :: "+this._imageDisable);
        }
    }
};
/**
 * 
 * This method returns the warning images as per the destination. 
 */ 

warnguideApp.prototype._chooseDestination = function(imageIndex)
{	
    //get the present destination from the framework.
    var destination = framework.getSharedData("syssettings", "DestinationCode") ;
    log.debug("Destination received from framework is  :: "+destination);
    //Check for destination and select the warning images accordingly
    if(destination === "SETTINGS_Destination_NA" || destination === "SETTINGS_Destination_MX")
    {		
        switch(this._warningsDataBase[imageIndex].warning_Id || this._warningsDataBase[imageIndex].warning_no)
        {
        case "Brake_System_Inspection_Required":
        case "Brake_Fluid_Level_low":
        case "Brake_Inspection_Required":
            this._imageEnable = "apps/warnguide/images/IcnWrn12_NA_En.png";
            this._imageDisable ="apps/warnguide/images/IcnWrn12_NA_Ds.png";
			break;
		case "ECB_System_Inspection_Required":
			this._imageEnable = "apps/warnguide/images/IcnWrn13_NA_En.png";
            this._imageDisable ="apps/warnguide/images/IcnWrn13_NA_Ds.png";
			break;
		case "Electric_Parking_Brake_Malfunction_1":
			this._imageEnable = "apps/warnguide/images/IcnWrn86_NA_En.png";
            this._imageDisable ="apps/warnguide/images/IcnWrn86_NA_Ds.png";
			break;
		case "Electric_Vacuum_Pump_System_Malfunction":
			this._imageEnable = "apps/warnguide/images/IcnWrn89_NA_En.png";
            this._imageDisable ="apps/warnguide/images/IcnWrn89_NA_Ds.png";	
			break;
        default:
            this._imageEnable = this._warningsDataBase[imageIndex].imagePathEnable;
            this._imageDisable = this._warningsDataBase[imageIndex].imagePathDisable;
            break;
        }
    }
    else
    {
     this._imageEnable = this._warningsDataBase[imageIndex].imagePathEnable;
     this._imageDisable = this._warningsDataBase[imageIndex].imagePathDisable;
    }
    log.debug("Enabled image path is  :: "+this._imageEnable );
    log.debug("Disabled image path is  :: "+this._imageDisable );
};


/***************************** End Helper functions *********************/

warnguideApp.prototype._createWarningDatabase = function() 
{
    this._warningsDataBase = new Array(new Array());//buffer array to store the warnings list
    //TODO:This is a work around for the database.This needs to be reviewed again.
    
    this._warningsDataBase[0] = {
			"warning_no" : 0,
            "warning_Id" : "Hybrid_System_Inspection_Required",
            "warning_Priority" : "High",
            "warning_Name" : "HybridSysErrorShrt",
            "detailed_Description" : "HybridSysErrorLong",
            "dialogText":"HybrdSysMalHighPrt",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn7_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn7_Ds.png"
        };
        this._warningsDataBase[1] = {
			"warning_no" : 1,
            "warning_Id" : "Charging_System_Inspection_Required",
            "warning_Priority" : "High",
            "warning_Name" : "ChargingSysErrorShrt",
            "detailed_Description" : "ChargingSysErrorLong",
            "dialogText":"ChargSysMalHighPrt",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn10_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn10_Ds.png"
        };
        this._warningsDataBase[2] = {
			"warning_no" : 2,
            "warning_Id" : "Charging_System_Inspection_Required_1",
            "warning_Priority" : "High",
            "warning_Name" : "ChrgSysErrorShrt",
            "detailed_Description" : "ChrgSysErrorLong",
            "dialogText":"ChargSysMalHighPrt",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn10_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn10_Ds.png"
        };

        this._warningsDataBase[3] = {
			"warning_no" : 3,
            "warning_Id" : "Charging_System_Inspection_Required_2",
            "warning_Priority" : "High",
            "warning_Name" : "ChrgSysErrorShrt",
            "detailed_Description" : "ChrgSysErrorLong",
            "dialogText":"ChargSysMalHighPrt",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn10_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn10_Ds.png"
        };

        this._warningsDataBase[4] = {
			"warning_no" : 4,
            "warning_Id" : "iELOOP_Energy_pre_charging",
            "warning_Priority" : "High",
            "warning_Name" : "EloopChargingShrt",
            "detailed_Description" : "EloopChargingLong",
            "dialogText":"IeloopChrgHighPrt",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn20_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn20_Ds.png"
        };
        this._warningsDataBase[5] = {
			"warning_no" : 5,
            "warning_Id" : "Engine_Coolant_Temperature_High",
            "warning_Priority" : "High",
            "warning_Name" : "EngCoolntTempHighOnShrt",
            "detailed_Description" : "EngCoolntTempHighOnLong",
            "dialogText":"EngnCoolTempHighHighPrt",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn24_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn24_Ds.png"
        };

        this._warningsDataBase[6] = {
			"warning_no" : 6,
            "warning_Id" : "Low_12V_Battery",
            "warning_Priority" : "Low",
            "warning_Name" : "AuxBattLowShrt",
            "detailed_Description" : "AuxBattLowLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn3_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn3_Ds.png"
        };
        this._warningsDataBase[7] = {
			"warning_no" : 7,
            "warning_Id" : "Low_HV_Battery",
            "warning_Priority" : "Low",
            "warning_Name" : "DriveBattDropShrt",
            "detailed_Description" : "DriveBattDropLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn4_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn4_Ds.png"
        };
        this._warningsDataBase[8] = {
			"warning_no" : 8,
            "warning_Id" : "P_Lock_fault",
            "warning_Priority" : "Low",
            "warning_Name" : "ControlSystemErrorShrt",
            "detailed_Description" : "ControlSystemErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn5_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn5_Ds.png"
        };
        this._warningsDataBase[9] = {
			"warning_no" : 9,
            "warning_Id" : "Hybrid_System_Over_Heat_Protection",
            "warning_Priority" : "Low",
            "warning_Name" : "HybridSysOverheatShrt",
            "detailed_Description" : "HybridSysOverheatLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn8_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn8_Ds.png"
        };
        this._warningsDataBase[10] = {
			"warning_no" : 10,
            "warning_Id" : "Set_shift_lever_to_P_position",
            "warning_Priority" : "Low",
            "warning_Name" : "PpositionRequestShrt",
            "detailed_Description" : "PpositionRequestLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn9_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn9_Ds.png"
        };
        this._warningsDataBase[11] = {
			"warning_no" : 11,
            "warning_Id" : "Brake_System_Inspection_Required",
            "warning_Priority" : "Low",
            "warning_Name" : "BrakeSysErrorShrt",
            "detailed_Description" : "BrakeSysErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn12_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn12_Ds.png"
        };
        this._warningsDataBase[12] = {
			"warning_no" : 12,
            "warning_Id" : "ECB_System_Inspection_Required",
            "warning_Priority" : "Low",
            "warning_Name" : "EcbSysErrorShrt",
            "detailed_Description" : "EcbSysErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn13_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn13_Ds.png"
        };
        this._warningsDataBase[13] = {
			"warning_no" : 13,
            "warning_Id" : "ABS_System_Inspection_Required",
            "warning_Priority" : "Low",
            "warning_Name" : "AbsSysErrorShrt",
            "detailed_Description" : "AbsSysErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn14_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn14_Ds.png"
        };
        this._warningsDataBase[14] = {
			"warning_no" : 14,
            "warning_Id" : "ESC_System_Inspection_Required",
            "warning_Priority" : "Low",
            "warning_Name" : "DscSysErrorShrt",
            "detailed_Description" : "DscSysErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn15_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn15_Ds.png"

        };
        this._warningsDataBase[15] = {
			"warning_no" : 15,
            "warning_Id" : "Key_Battery_low",
            "warning_Priority" : "Low",
            "warning_Name" : "DropKeyBattChrgShrt",
            "detailed_Description" : "DropKeyBattChrgLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn16_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn16_Ds.png"
        };
        this._warningsDataBase[16] = {
			"warning_no" : 16,
            "warning_Id" : "Engine_Oil_Pressure_Inspection_Required",
            "warning_Priority" : "Low",
            "warning_Name" : "EngOilPressureErrorShrt",
            "detailed_Description" : "EngOilPressureErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn6_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn6_Ds.png"
        };
        this._warningsDataBase[17] = {
			"warning_no" : 17,
            "warning_Id" : "Engine_Oil_Pressure_Inspection_Required_1",
            "warning_Priority" : "Low",
            "warning_Name" : "EngOilPressureErrorShrt",
            "detailed_Description" : "EngOilPressureErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn6_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn6_Ds.png"
        };
        this._warningsDataBase[18] = {
			"warning_no" : 18,
            "warning_Id" : "iELOOP_Inspection_Required",
            "warning_Priority" : "Low",
            "warning_Name" : "EloopSysErrorShrt",
            "detailed_Description" : "EloopSysErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn19_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn19_Ds.png"
        };
        this._warningsDataBase[19] = {
			"warning_no" : 19,
            "warning_Id" : "Brake_Fluid_Level_low",
            "warning_Priority" : "Low",
            "warning_Name" : "LowBrakeFluidShrt",
            "detailed_Description" : "LowBrakeFluidLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn12_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn12_Ds.png"
        };
        this._warningsDataBase[20] = {
			"warning_no" : 20,
            "warning_Id" : "Brake_Inspection_Required",
            "warning_Priority" : "Low",
            "warning_Name" : "BrakeSystemErrorShrt",
            "detailed_Description" : "BrakeSystemErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn12_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn12_Ds.png"
        };
        this._warningsDataBase[21] = {
			"warning_no" : 21,
            "warning_Id" : "Check_Tyre_Pressure",
            "warning_Priority" : "Low",
            "warning_Name" : "LowTireAirPressureShrt",
            "detailed_Description" : "LowTireAirPressureLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn23_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn23_Ds.png"
        };
        this._warningsDataBase[22] = {
			"warning_no" : 22,
            "warning_Id" : "Check_Tyre_Pressure_1",
            "warning_Priority" : "Low",
            "warning_Name" : "LowTireAirPressureShrt",
            "detailed_Description" : "LowTireAirPressureLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn23_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn23_Ds.png"
        };
        this._warningsDataBase[23] = {
			"warning_no" : 23,
            "warning_Id" : "Engine_Coolant_Temperature_High_1",
            "warning_Priority" : "Low",
            "warning_Name" : "EngineWaterTempRiseShrt",
            "detailed_Description" : "EngineWaterTempRiseLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn25_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn25_Ds.png"
        };
        this._warningsDataBase[24] = {
			"warning_no" : 24,
            "warning_Id" : "Stop_Vehicle_at_safe_area",
            "warning_Priority" : "Low",
            "warning_Name" : "SystemInspectionShrt",
            "detailed_Description" : "SystemInspectionLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn26_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn26_Ds.png"
        };
        this._warningsDataBase[25] = {
			"warning_no" : 25,
            "warning_Id" : "Soot_Accumulation_in_DPF_high",
            "warning_Priority" : "Low",
            "warning_Name" : "AccumulationDpfShrt",
            "detailed_Description" : "AccumulationDpfLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn27_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn27_Ds.png"
        };
        this._warningsDataBase[26] = {
			"warning_no" : 26,
            "warning_Id" : "Potentially_Icy_Road_Condition",
            "warning_Priority" : "Low",
            "warning_Name" : "RoadSurfaceIcingCautionShrt",
            "detailed_Description" : "RoadSurfaceIcingCautionLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn28_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn28_Ds.png"
        };
        this._warningsDataBase[27] = {
			"warning_no" : 27,
            "warning_Id" : "Refill_Fuel_Tank",
            "warning_Priority" : "Low",
            "warning_Name" : "LowFuelShrt",
            "detailed_Description" : "LowFuelLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn29_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn29_Ds.png"
        };
        this._warningsDataBase[28] = {
			"warning_no" : 28,
            "warning_Id" : "Check_Fuel_Cap",
            "warning_Priority" : "Low",
            "warning_Name" : "FuelCapInspectionShrt",
            "detailed_Description" : "FuelCapInspectionLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn30_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn30_Ds.png"
        };
        this._warningsDataBase[29] = {
			"warning_no" : 29,
            "warning_Id" : "Check_Fuel_Cap_1",
            "warning_Priority" : "Low",
            "warning_Name" : "FuelCapInspectionShrt",
            "detailed_Description" : "FuelCapInspectionLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn30_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn30_Ds.png"
        };
        this._warningsDataBase[30] = {
			"warning_no" : 30,
            "warning_Id" : "Power_Steering_System_Inspection_Required",
            "warning_Priority" : "Low",
            "warning_Name" : "PowerSteeringSysErrorShrt",
            "detailed_Description" : "PowerSteeringSysErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn31_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn31_Ds.png"
        };
        this._warningsDataBase[31] = {
			"warning_no" : 31,
            "warning_Id" : "Engine_Inspection_Required",
            "warning_Priority" : "Low",
            "warning_Name" : "EngSystemErrorShrt",
            "detailed_Description" : "EngSystemErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn32_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn32_Ds.png"
        };
        this._warningsDataBase[32] = {
			"warning_no" : 32,
            "warning_Id" : "Engine_Inspection_Required_1",
            "warning_Priority" : "Low",
            "warning_Name" : "EngSystemErrorShrt",
            "detailed_Description" : "EngSystemErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn32_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn32_Ds.png"
        };
        this._warningsDataBase[33] = {
			"warning_no" : 33,
            "warning_Id" : "RCM_System_Inspection_Required",
            "warning_Priority" : "Low",
            "warning_Name" : "AirbagSysPretensionerSysErrorShrt",
            "detailed_Description" : "AirbagSysPretensionerSysErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn33_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn33_Ds.png"
        };
        this._warningsDataBase[34] = {
			"warning_no" : 34,
            "warning_Id" : "ABS_System_Inspection_Required_1",
            "warning_Priority" : "Low",
            "warning_Name" : "AbsSystemErrorShrt",
            "detailed_Description" : "AbsSystemErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn34_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn34_Ds.png"
        };
        this._warningsDataBase[35] = {
			"warning_no" : 35,
            "warning_Id" : "ESC_System_Inspection_Required_1",
            "warning_Priority" : "Low",
            "warning_Name" : "DscSystemErrorShrt",
            "detailed_Description" : "DscSystemErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn15_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn15_Ds.png"
        };
        this._warningsDataBase[36] = {
			"warning_no" : 36,
            "warning_Id" : "RVM_System_Inspection_Required",
            "warning_Priority" : "Low",
            "warning_Name" : "RvmSysErrorShrt",
            "detailed_Description" : "RvmSysErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn36_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn36_Ds.png"
        };
        this._warningsDataBase[37] = {
			"warning_no" : 37,
            "warning_Id" : "BSM_System_Inspection_Required",
            "warning_Priority" : "Low",
            "warning_Name" : "BsmSystemErrorShrt",
            "detailed_Description" : "BsmSystemErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn37_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn37_Ds.png"
        };
        this._warningsDataBase[38] = {
			"warning_no" : 38,
            "warning_Id" : "AFLS_System_Inspection_Required",
            "warning_Priority" : "Low",
            "warning_Name" : "AfsSystemErrorShrt",
            "detailed_Description" : "AfsSystemErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn39_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn39_Ds.png"
        };
           this._warningsDataBase[39] = {
			"warning_no" : 39,
            "warning_Id" : "ALM_System_Inspection_Required",
            "warning_Priority" : "Low",
            "warning_Name" : "AutoLevelSystemErrorShrt",
            "detailed_Description" : "AutoLevelSystemErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn40_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn40_Ds.png"
        };
        this._warningsDataBase[40] = {
			"warning_no" : 40,
            "warning_Id" : "iStop_System_Inspection_Required",
            "warning_Priority" : "Low",
            "warning_Name" : "IstopSysErrorShrt",
            "detailed_Description" : "IstopSysErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn42_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn42_Ds.png"
        };
        this._warningsDataBase[41] = {
			"warning_no" : 41,
            "warning_Id" : "TPMS_Inspection_Required",
            "warning_Priority" : "Low",
            "warning_Name" : "TpmsSysErrorShrt",
            "detailed_Description" : "TpmsSysErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn23_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn23_Ds.png"
        };

        this._warningsDataBase[42] = {
			"warning_no" : 42,
            "warning_Id" : "TPMS_Inspection_Required_1",
            "warning_Priority" : "Low",
            "warning_Name" : "TpmsSysErrorShrt",
            "detailed_Description" : "TpmsSysErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn23_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn23_Ds.png"
        };
        this._warningsDataBase[43] = {
			"warning_no" : 43,
            "warning_Id" : "Keyless_System_inspection_Required",
            "warning_Priority" : "Low",
            "warning_Name" : "KeylesSysErrorShrt",
            "detailed_Description" : "KeylesSysErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn16_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn16_Ds.png"
        };
        this._warningsDataBase[44] = {
			"warning_no" : 44,
            "warning_Id" : "FWD_System_Inspection_Required",
            "warning_Priority" : "Low",
            "warning_Name" : "FWDSysErrorShrt",
            "detailed_Description" : "FWDSysErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn26_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn26_Ds.png"
        };
        this._warningsDataBase[45] = {
			"warning_no" : 45,
            "warning_Id" : "DPF_Inspection_Required",
            "warning_Priority" : "Low",
            "warning_Name" : "DPFErrorShrt",
            "detailed_Description" : "DPFErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn27_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn27_Ds.png"
        };
        this._warningsDataBase[46] = {
			"warning_no" : 46,
            "warning_Id" : "Auto_trans_System_Inspection_Required",
            "warning_Priority" : "Low",
            "warning_Name" : "AutoTransSysErrorShrt",
            "detailed_Description" : "AutoTransSysErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn49_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn49_Ds.png"
        };
        this._warningsDataBase[47] = {
			"warning_no" : 47,
            "warning_Id" : "Battery_Management_System_Inspection_Required",
            "warning_Priority" : "Low",
            "warning_Name" : "BattManagSysErrorShrt",
            "detailed_Description" : "BattManagSysErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn19_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn19_Ds.png"
        };
        this._warningsDataBase[48] = {
			"warning_no" : 48,
            "warning_Id" : "Brake_Override_System_Inspection_Required",
            "warning_Priority" : "Low",
            "warning_Name" : "BrakOverrideSysErrorShrt",
            "detailed_Description" : "BrakOverrideSysErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn19_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn19_Ds.png"
        };
        this._warningsDataBase[49] = {
			"warning_no" : 49,
            "warning_Id" : "MRCC_System_Inspection_Required",
            "warning_Priority" : "Low",
            "warning_Name" : "MRCCSysErrorShrt",
            "detailed_Description" : "MRCCSysErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn52_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn52_Ds.png"
        };
        this._warningsDataBase[50] = {
			"warning_no" : 50,
            "warning_Id" : "SBS_System_Inspection_Required",
            "warning_Priority" : "Low",
            "warning_Name" : "SBSSysErrorShrt",
            "detailed_Description" : "SBSSysErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn53_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn53_Ds.png"
        };
        this._warningsDataBase[51] = {
			"warning_no" : 51,
            "warning_Id" : "FOW_System_Inspection_Required",
            "warning_Priority" : "Low",
            "warning_Name" : "FOWSysError",
            "detailed_Description" : "FOWSysErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn53_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn53_Ds.png"
        };
        this._warningsDataBase[52] = {
			"warning_no" : 52,
            "warning_Id" : "DRSS_System_Inspection_Required",
            "warning_Priority" : "Low",
            "warning_Name" : "DRSSSysErrorShrt",
            "detailed_Description" : "DRSSSysErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn53_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn53_Ds.png"
        };
        this._warningsDataBase[53] = {
			"warning_no" : 53,
            "warning_Id" : "FOW_Radar_Blocked",
            "warning_Priority" : "Low",
            "warning_Name" : "FOW Radar Blocked",
            "detailed_Description" : "FOW Radar Blocked.Check the face of Radar",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn52_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn52_Ds.png"
        };
        this._warningsDataBase[54] = {
			"warning_no" : 54,
            "warning_Id" : "FOW_DRSS_Radar_Blocked",
            "warning_Priority" : "Low",
            "warning_Name" : "FOW DRSS Radar Blocked",
            "detailed_Description" : "FOW/DRSS Radar Blocked.  Check the face of Radar",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn52_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn52_Ds.png"
        };
        this._warningsDataBase[55] = {
			"warning_no" : 55,
            "warning_Id" : "FOW_MRCC_Radar_Blocked",
            "warning_Priority" : "Low",
            "warning_Name" : "FOWMRCCRadarSoilingShrt",
            "detailed_Description" : "FOWMRCCRadarSoilingLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn58_59_61_63_66_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn58_59_61_63_66_Ds.png"
       };
        this._warningsDataBase[56] = {
			"warning_no" : 56,
            "warning_Id" : "FOW_MRCC_DRSS_Radar_Blocked",
            "warning_Priority" : "Low",
            "warning_Name" : "FOWMRCCDRSSRadarSoilingShrt",
            "detailed_Description" : "FOWMRCCDRSSRadarSoilingLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn58_59_61_63_66_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn58_59_61_63_66_Ds.png"
        };
        this._warningsDataBase[57] = {
			"warning_no" : 57,
            "warning_Id" : "SBS_Radar_Blocked",
            "warning_Priority" : "Low",
            "warning_Name" : "SBS Radar Blocked",
            "detailed_Description" : "SBS Radar Blocked.  Check the face of Radar",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn52_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn52_Ds.png"
        };
        this._warningsDataBase[58] = {
			"warning_no" : 58,
            "warning_Id" : "SBS_MRCC_Radar_Blocked",
            "warning_Priority" : "Low",
            "warning_Name" : "SBSMRCCRadarSoilingShrt",
            "detailed_Description" : "SBSMRCCRadarSoilingLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn58_59_61_63_66_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn58_59_61_63_66_Ds.png"
        };
        this._warningsDataBase[59] = {
			"warning_no" : 59,
            "warning_Id" : "SBS_DRSS_Radar_Blocked",
            "warning_Priority" : "Low",
            "warning_Name" : "SBS DRSS Radar Blocked",
            "detailed_Description" : "SBS/DRSS Radar Blocked.Check the face of Radar",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn52_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn52_Ds.png"
        };
        this._warningsDataBase[60] = {
			"warning_no" : 60,
            "warning_Id" : "SBS_MRCC_DRSS_Radar_Blocked",
            "warning_Priority" : "Low",
            "warning_Name" : "SBSMRCCDRSSRadarSoilingShrt",
            "detailed_Description" : "SBSMRCCDRSSRadarSoilingLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn58_59_61_63_66_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn58_59_61_63_66_Ds.png"
        };
        this._warningsDataBase[61] = {
			"warning_no" : 61,
            "warning_Id" : "MRCC_Not_Available",
            "warning_Priority" : "Low",
            "warning_Name" : "MRCCUnavailableShrt",
            "detailed_Description" : "MRCCUnavailableLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn52_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn52_Ds.png"
        };
        this._warningsDataBase[62] = {
			"warning_no" : 62,
            "warning_Id" : "SBS_Brake_Not_Available",
            "warning_Priority" : "Low",
            "warning_Name" : "SBSBrakeUnavailableShrt",
            "detailed_Description" : "SBSBrakeUnavailableLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn53_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn53_Ds.png"
        };
        this._warningsDataBase[63] = {
			"warning_no" : 63,
            "warning_Id" : "SBS_Brake_MRCC_Not_Available",
            "warning_Priority" : "Low",
            "warning_Name" : "SBSBrakeMRCCUnavailableShrt",
            "detailed_Description" : "SBSBrakeMRCCUnavailableLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn58_59_61_63_66_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn58_59_61_63_66_Ds.png"
        };
        this._warningsDataBase[64] = {
			"warning_no" : 64,
            "warning_Id" : "SCBS_Inspection_Required",
            "warning_Priority" : "Low",
            "warning_Name" : "SCBSSysErrorShrt",
            "detailed_Description" : "SCBSSysErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn53_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn53_Ds.png"
        };
        this._warningsDataBase[65] = {
			"warning_no" : 65,
            "warning_Id" : "SCBS_Clear_windshield_completely",
            "warning_Priority" : "Low",
            "warning_Name" : "SCBSWindshieldSoilingShrt",
            "detailed_Description" : "SCBSWindshieldSoilingLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn53_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn53_Ds.png"
        };
        this._warningsDataBase[66] = {
			"warning_no" : 66,
            "warning_Id" : "SCBS_Not_Available",
            "warning_Priority" : "Low",
            "warning_Name" : "SCBSUnavailableShrt",
            "detailed_Description" : "SCBSUnavailableLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn53_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn53_Ds.png"
        };
        this._warningsDataBase[67] = { /*J71 Changes*/
			"warning_no" : 67,
            "warning_Id" : "LDWS_Inspection_Required",
            "warning_Priority" : "Low",
            "warning_Name" : "LDWSSysErrorShrt",
            "detailed_Description" : "LDWSSysErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn70_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn70_Ds.png"
        };
		
		this._warningsDataBase[68] = { /*J71 Changes*/
			"warning_no" : 69,
            "warning_Id" : "HBC_System_Inspection_Required",
            "warning_Priority" : "Low",
            "warning_Name" : "HBCSysErrorShrt", 
            "detailed_Description" : "HBCSysErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn71_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn71_Ds.png"
        };
		
		this._warningsDataBase[69] = { /*J71 Changes*/
			"warning_no" : 70,
            "warning_Id" : "HBC_LDWS_Camera_Malfunction",
            "warning_Priority" : "Low",
            "warning_Name" : "HBCLLDWSCamDisconnectShrt",
            "detailed_Description" : "HBCLLDWSCamDisconnectLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn72_73_74_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn72_73_74_Ds.png"
        };
		
		this._warningsDataBase[70] = { /*J71 Changes*/
			"warning_no" : 71,
			"warning_Id" : "HBC_LDWS_System_Malfunction",
			"warning_Priority" : "Low",
			"warning_Name" : "HBCLDWSSysErrorShrt", 	
			"detailed_Description" : "HBCLDWSSysErrorLong",
			"imagePathEnable" : "apps/warnguide/images/IcnWrn72_73_74_En.png",
			"imagePathDisable" :"apps/warnguide/images/IcnWrn72_73_74_Ds.png"
        };
		
		this._warningsDataBase[71] = { /*J71 Changes*/
			"warning_no" : 72,
			"warning_Id" : "HBC_LDWS_System_Malfunction_1",
			"warning_Priority" : "Low",
			"warning_Name" : "HBCLDWSWindshieldFogShrt", 	
			"detailed_Description" : "HBCLDWSWindshieldFogLong",
			"imagePathEnable" : "apps/warnguide/images/IcnWrn72_73_74_En.png",
			"imagePathDisable" :"apps/warnguide/images/IcnWrn72_73_74_Ds.png"
        };

        this._warningsDataBase[72] = {
			"warning_no" : 73,
            "warning_Id" : "Drain_Water_from_Fuel_Filter",
            "warning_Priority" : "Low",
            "warning_Name" : "SedimenterWarningShrt",
            "detailed_Description" : "SedimenterWarningLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn75_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn75_Ds.png"
        };
        this._warningsDataBase[73] = {
			"warning_no" : 74,
            "warning_Id" : "Replace_Fuel_Filter",
            "warning_Priority" : "Low",
            "warning_Name" : "FuelAirFilterCartReplacePeriodShrt",
            "detailed_Description" : "FuelAirFilterCartReplacePeriodLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn75_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn75_Ds.png"

        };
        this._warningsDataBase[74] = {
			"warning_no" : 75,
            "warning_Id" : "Vehicle_Communication_System_Inspection_Required",
            "warning_Priority" : "Low",
            "warning_Name" : "VehicleSysErrorShrt",
            "detailed_Description" : "VehicleSysErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn19_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn19_Ds.png"
        };
        this._warningsDataBase[75] = {
			"warning_no" : 76,
            "warning_Id" : "Vehicle_Communication_System_Inspection_Required_1",
            "warning_Priority" : "Low",
            "warning_Name" : "VehicleSysErrorShrt",
            "detailed_Description" : "VehicleSysErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn19_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn19_Ds.png"
        };
        this._warningsDataBase[76] = {
			"warning_no" : 77,
            "warning_Id" : "Vehicle_Communication_System_Inspection_Required_2",
            "warning_Priority" : "Low",
            "warning_Name" : "VehicleSysErrorShrt",
            "detailed_Description" : "VehicleSysErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn19_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn19_Ds.png"
        };
        this._warningsDataBase[77] = {
			"warning_no" : 78,
            "warning_Id" : "Vehicle_Communication_System_Inspection_Required_3",
            "warning_Priority" : "Low",
            "warning_Name" : "VehicleSysErrorShrt",
            "detailed_Description" : "VehicleSysErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn19_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn19_Ds.png"
        };
        this._warningsDataBase[78] = {
			"warning_no" : 79,
            "warning_Id" : "Vehicle_Communication_System_Inspection_Required_4",
            "warning_Priority" : "Low",
            "warning_Name" : "VehicleSysErrorShrt",
            "detailed_Description" : "VehicleSysErrorLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn19_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn19_Ds.png"
            };
        this._warningsDataBase[79] = {
			"warning_no" : 80,
            "warning_Id" : "Refill_w_screen_washer",
            "warning_Priority" : "Low",
            "warning_Name" : "LowWasheFluidShrt",
            "detailed_Description" : "LowWasheFluidLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn81_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn81_Ds.png"
        };
        this._warningsDataBase[80] = {
			"warning_no" : 81,
            "warning_Id" : "Engine_Coolant_Temperature_Low",
            "warning_Priority" : "Low",
            "warning_Name" : "EngineWaterTempDropShrt",
            "detailed_Description" : "EngineWaterTempDropLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn82_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn82_Ds.png"
        };
        this._warningsDataBase[81] = {
			"warning_no" : 82,
            "warning_Id" : "Heating_Glow_Plug",
            "warning_Priority" : "Low",
            "warning_Name" : "PreheatingDispLampShrt",
            "detailed_Description" : "PreheatingDispLampLong",
            "imagePathEnable" : "apps/warnguide/images/IcnWrn83_En.png",
            "imagePathDisable" :"apps/warnguide/images/IcnWrn83_Ds.png"
        };
		
		this._warningsDataBase[82] = { /*J71 Changes New Warnings added*/
			"warning_no" : 83,
			"warning_Id" : "Electric_Parking_Brake_Malfunction",
			"warning_Priority" : "Low",
			"warning_Name" : "ElectricParkingBrakeShrt", 	
			"detailed_Description" : "ElectricParkingBrakeLong",
			"imagePathEnable" : "apps/warnguide/images/IcnWrn85_En.png", 
			"imagePathDisable" :"apps/warnguide/images/IcnWrn85_Ds.png"
        };
		
		this._warningsDataBase[83] = { /*J71 Changes New Warnings added*/
			"warning_no" : 84,
			"warning_Id" : "Electric_Parking_Brake_Malfunction_1",
			"warning_Priority" : "Low",
			"warning_Name" : "ElectricParkingBrakeShrt", 	
			"detailed_Description" : "ElectricParkingBrakeHighLong",
			"imagePathEnable" : "apps/warnguide/images/IcnWrn86_En.png", 
			"imagePathDisable" :"apps/warnguide/images/IcnWrn86_Ds.png"
        };
		
		this._warningsDataBase[84] = {/*J71 Changes New Warnings added*/
			"warning_no" : 85,
			"warning_Id" : "Active_Bonnet_System_Malfunction",
			"warning_Priority" : "Low",
			"warning_Name" : "ActiveBonnetSystemMalfunctionShrt", 	
			"detailed_Description" : "ActiveBonnetSystemMalfunctionLong",
			"imagePathEnable" : "apps/warnguide/images/IcnWrn88_En.png", 
			"imagePathDisable" :"apps/warnguide/images/IcnWrn88_Ds.png"
        };
		
		this._warningsDataBase[85] = { /*J71 Changes New Warnings added*/
			"warning_no" : 86,
			"warning_Id" : "Low_Tire_Air_Pressure",
			"warning_Priority" : "Low",
			"warning_Name" : "LowTireAirPressureShrt", 	
			"detailed_Description" : "LowTireAirPressureFlatLong",
			"imagePathEnable" : "apps/warnguide/images/IcnWrn87_En.png", 
			"imagePathDisable" :"apps/warnguide/images/IcnWrn87_Ds.png"
        };
		
		this._warningsDataBase[86] = { /*J71 Changes New Warnings added*/
			"warning_no" : 87,
			"warning_Id" : "Electric_Vacuum_Pump_System_Malfunction",
			"warning_Priority" : "Low",
			"warning_Name" : "ElectricVacuumPumpSystemMalfunctionShrt", 	
			"detailed_Description" : "ElectricVacuumPumpSystemMalfunctionLong",
			"imagePathEnable" : "apps/warnguide/images/IcnWrn89_En.png", 
			"imagePathDisable" :"apps/warnguide/images/IcnWrn89_Ds.png", 
        };
		
		this._warningsDataBase[87] = { /*J71 Changes New Warnings added*/
			"warning_no" : 88,
			"warning_Id" : "Electric_Vacuum_Pump_System_Malfunction_1",
			"warning_Priority" : "Low",
			"warning_Name" : "ElectricVacuumPumpSystemMalfunctionShrt", 	
			"detailed_Description" : "ElectricVacuumPumpSystemMalfunctionLong",
			"imagePathEnable" : "apps/warnguide/images/IcnWrn90_En.png", 
			"imagePathDisable" :"apps/warnguide/images/IcnWrn90_Ds.png", 
        };		

};
/************************
 * Framework register
 **************************/

framework.registerAppLoaded("warnguide", null, true);