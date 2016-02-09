/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: idmApp.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: atiwarc
 Date: 04-01-2013
 __________________________________________________________________________

 Description: IHU GUI IDM  application

 Revisions:
 v0.1 (04-01-2013)  Initial development
 v0.2 (26-08-2014)  Changes are done for stage number. SCR SW00148649 - avalajh
 v0.3 (09-10-2014)  Changes are done for SCR SW00155839 - avalajh
 _________________________________________________________________________

 */

log.addSrcFile("idmApp.js", "idm");
//log.setLogLevel("idm", "debug");

function idmApp(uiaId) {
    log.info("Constructor called.");
	
    // Base application functionality is provided in a common location via this call to baseApp.init().
    baseApp.init(this, uiaId);
}

/***********************************************************/
/* App Init is a standard function called by the framework */
/***********************************************************/

/*
 * Called just after the app is instantiated by framework.
 * All variables local to this app should be declared in this function
 */
idmApp.prototype.appInit = function() {
    log.info("idmApp appInit called...");

    if (framework.debugMode) {
        utility.loadScript("apps/idm/test/idmAppTest.js");
    }

    this._equippedCtrlStyle                 = "simple";        // The equipped control style, 
    // Two Style -- 1. simple   2. training                                                                

    this.currScore              = null;
    this.avgScore               = null ;
    this.highScore               = null ;
    this.brakeTrendVal          = null ;
    this.accelerateTrendVal     = null ;
    this.steerTrendVal          = null ;
    this.transitionBarScoreData = null ;
    this.cachedDriverIdName     = null ;
    this.cachedDriverNameExist  = false ;
    this.cachedcurrBarData      = null ;
    this.cachedStageNumber      = "ONE" ;
    this.cachedStageValue       = null ;
    this._atSpeedVal            = null;                      //variable used to cache the speed threshold status 
    this._commonImagePath       = "./apps/idm/images/";
    this._currentControl = null;
    this._cachedEndingScreenToggleStatus  = null;                        //used to cache the status of endingscreentoggle button
    this._cachedMeterAmbientToggleStatus  = null;                               //used to cache the status of resettoggle button
    this._cachedEndingScreenSupportStatus  = null;                     //used to cache the support of ending screen.
    this._cachedMeterAmbSupportStatus  = null;                     //used to cache the support of Meter Ambient Display.
    this._cachedMeterAmbGrayOutStatus  = "OFF";  
    this._multiplicationFactor  = 0.1;
    this.advices = null;
    this._isUmpPanelOpen   = false;
    this._idmContext       = false;
    this._updateCurrentStage = false;
    this.stageChanged = false;
    this._IgnitionStatus = "OFF"; //used to cache the ignition status
    this.cachedBlankStageNumber = "BLANK"; // SR_IDM_1039 - to display '--' as stage number
    this._checkIgnitionValue = false;// to store ignition status
	
    this._cachedScoreGraphObj = {
            initialBarValues : '',
            yAxisLimitValue  : 5
    };
    
    this._cachedStageObj = {
    };
    
    this._cachedDriveTrendObj = {
            brake :{
                positiveTrend : 0,
                negativeTrend : 0
            }, 
            accelerate : {
                positiveTrend : 0,
                negativeTrend : 0
            },
            steer : {
                positiveTrend : 0,
                negativeTrend : 0
            }
    };
    /**
     * Ump panel button config for Training context
     */
    this._umpButtonConfigIdm = new Object();
    this._umpButtonConfigIdm["HidePanel"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : this._commonImagePath+"IcnUmp_CloseUmp",
        disabled : false, 
        buttonClass : "normal",
        labelId : 'HidePanel',
        appData : "HidePanel",
        selectCallback: this._umpDefaultSelectCallback.bind(this)	
    };
    
    this._umpButtonConfigIdm["SelectApplications"] = 
    {
        buttonBehavior : "shortPressOnly",
        imageBase : this._commonImagePath+"IcnUmpApps",
        disabled : false, 
        buttonClass : "normal",
        labelId : 'ApplicationsMenu',
        appData : "ApplicationsMenu",
        selectCallback: this._umpDefaultSelectCallback.bind(this)	
    };
    	
    this._umpButtonConfigIdm["SwitchView"] =
    {
        buttonBehavior : "shortPressOnly",
        imageBase : this._commonImagePath+"IcnUmp_ScreenSwitch1",
        disabled : false, 
        buttonClass : "normal",
        labelId : 'SwitchView',
        appData : "SwitchView",
        selectCallback: this._umpDefaultSelectCallback.bind(this)
    };
    
    this._umpButtonConfigIdm["SelectSettings"] = 
    {
        buttonBehavior : "shortPressOnly",
        imageBase : this._commonImagePath+"IcnUmpSettings",
        disabled : false, 
        buttonClass : "normal",
        labelId : 'SelectSettings',
        appData : "SelectSettings",
        selectCallback: this._umpDefaultSelectCallback.bind(this)	
    };
    
  //Idm Setting static list
    this._idmSettingList  = {
          itemCountKnown : true,
          
          itemCount      : 2,
          items           : [
                             { appData : 'SelectEndingScreen', text1Id : 'endingScreen', itemStyle : 'styleOnOff', hasCaret : false, value : 1}, 
                             { appData : 'SelectMeterAmbDisplay',      text1Id : 'meterAmbientDisplay', itemStyle : 'styleOnOff',hasCaret : false, value : 2}
                            ]  
  };
    
    /* 
     * NOTE:
     * Every time a function is bound (using bind()), a new
     * function is created in memory. Whenever possible,
     * only bind the same function once and use reference.
     */
    
    var contextInCbIdmSimple = this.idmContextInSimple.bind(this); 
    var readyCbIdmSimple     = this.idmReadyToDisplaySimpleMode.bind(this);
    var contextInCbIdmTraining = this.idmContextInTraining.bind(this);
    var readyCbIdmTraining     = this.idmReadyToDisplayTrainingMode.bind(this);
    var contextInIdmSettingscreen = this.contextInIdmSettingscreen.bind(this);
    var readyIdmSettings = this.readyIdmSettings.bind(this);
    var contextInEndingSimpleIdm = this.IdmcontextInEndingSimple.bind(this);
    var readyToDisplayEndingSimpleIdm = this.IdmreadyToDisplayEndingSimple.bind(this);
    var contextInCbIdmEndingTraining = this.IdmcontextInEndingTraining.bind(this);
    var readyCbIdmEndingTraining =  this.IdmreadyToDisplayEndingTraining.bind(this);
    var selectCb 	   =  this.selectCallbackHandler.bind(this);
    
    // Context table
    //@formatter:off
    this._contextTable = {
        "Simple"             : {
            "template"                  : "IdmTmplt",
            "templatePath"              : "apps/idm/templates/Idm",
            //"leftBtnStyle"              : "menuUp",
            "sbNameId"                  : "simpleMode",
            "controlProperties"     : {
                "IdmCtrl"     : {
                    "subMap"                             : this._subMap,
                    "selectCallback"                     : selectCb,
                    "ctrlStyle"                          : "simple", // and training
                    "mode"                               : "live", // and ending
                    "scoreGraphObj"                      : this._cachedScoreGraphObj,
                    "scoreStageObj"                      : this._cachedStageObj,
                    "driveTrendObj"                      : this._cachedDriveTrendObj,
                    "umpButtonConfig"                    : this._umpButtonConfigIdm,
                    "defaultSelectCallback"              : this._umpDefaultSelectCallback.bind(this),
                    "switchViewId"                       : "SwitchView",
                    "umpStyle"                           : "fullWidth",
                    "umpPanelStatus"                     : false
                }
            }, // end of list of controlProperties
            "contextInFunction"         : contextInCbIdmSimple,
            "readyFunction"             : readyCbIdmSimple
        }, // end of "IDm"
        "Training"             : {
            "template"                  : "IdmTmplt",
            "templatePath"              : "apps/idm/templates/Idm",
            //"leftBtnStyle"              : "menuUp",
            "sbNameId"                  : "trainingMode",
            "controlProperties"     : {
                "IdmCtrl"     : {
                    "subMap"                             : this._subMap,
                    "selectCallback"                     : selectCb,
                    "ctrlStyle"                          : "training", // and training
                    "mode"                               : "live", // and ending
                    "scoreGraphObj"                      : this._cachedScoreGraphObj,
                    "scoreStageObj"                      : this._cachedStageObj,
                    "driveTrendObj"                      : this._cachedDriveTrendObj,
                    "umpButtonConfig"                    : this._umpButtonConfigIdm,
                    "switchViewId"                       : "SwitchView",
                    "umpStyle" : "fullWidth",
                    
                }
            }, // end of list of controlProperties
            "contextInFunction"         : contextInCbIdmTraining,
            "readyFunction"             : readyCbIdmTraining
        },//end of training mode
        "EndingSimple"             : {
            "template"                  : "IdmTmplt",
            "hideHomeBtn"               : true,
            "templatePath"              : "apps/idm/templates/Idm",
            //"leftBtnStyle"              : "menuUp",
            "sbNameId"                  : "settingIDM",
            "controlProperties"     : {
                "IdmCtrl"     : {
                    "subMap"                             : this._subMap,
                    "selectCallback"                     : selectCb,
                    "ctrlStyle"                          : "simple", // and training
                    "mode"                               : "ending", // and ending
                    "scoreGraphObj"                      : this._cachedScoreGraphObj,
                    "scoreStageObj"                      : this._cachedStageObj,
                    "driveTrendObj"                      : this._cachedDriveTrendObj,
                    "umpButtonConfig"                    : this._umpButtonConfigIdm,
                    "defaultSelectCallback"              : this._umpDefaultSelectCallback.bind(this),
                    "switchViewId"                       : "SwitchView",
                    "umpStyle"                           : "fullWidth",
                    "umpPanelStatus"                     : false
                }
            }, // end of list of controlProperties
            "contextInFunction"         : contextInEndingSimpleIdm,
            "readyFunction"             : readyToDisplayEndingSimpleIdm
        },
        "EndingTraining"             : {
            "template"                  : "IdmTmplt",
            "hideHomeBtn"               : true,
            "templatePath"              : "apps/idm/templates/Idm",
            //"leftBtnStyle"              : "menuUp",
            "sbNameId"                  : "settingIDM",
            "controlProperties"     : {
                "IdmCtrl"     : {
                    "subMap"                             : this._subMap,
                    "selectCallback"                     : selectCb,
                    "ctrlStyle"                          : "training", // and training
                    "mode"                               : "ending", // and ending
                    "scoreGraphObj"                      : this._cachedScoreGraphObj,
                    "scoreStageObj"                      : this._cachedStageObj,
                    "driveTrendObj"                      : this._cachedDriveTrendObj,
                    "umpButtonConfig"                    : this._umpButtonConfigIdm,
                    "switchViewId"                       : "SwitchView", 
                    "umpStyle" : "fullWidth", 
                    
                }
            }, // end of list of controlProperties
            "contextInFunction"         : contextInCbIdmEndingTraining,
            "readyFunction"             : readyCbIdmEndingTraining
        },//end of training mode
      //Start of "Setting Context"
        "Settings" :
        {
            "template"                  : "List2Tmplt",
            "sbNameId"                  : "settingIDM",
            "leftBtnStyle"              : "goBack",
            "controlProperties"         : 
            {
                "List2Ctrl"             :
                {
                    "dataList"          : this._idmSettingList,
                    titleConfiguration  :'listTitle',
                    title               : 
                    {
                          text1Id   :"settings",
                          titleStyle:'style02'
                    },
                    "selectCallback" : this._settingsItemClickCallback.bind(this)
                }
            },
            "readyFunction" : readyIdmSettings,
            "contextInFunction"         : contextInIdmSettingscreen
        },//end of Setting context
        "AmbientRetry" :
        {
            "template"             : "Dialog3Tmplt",
            "sbNameId"             : "settingIDM",
            "leftBtnStyle"         : "goBack",
            "controlProperties"    :
            {
                "Dialog3Ctrl"      :
                {
                	"defaultSelectCallback" : this._dialogCtrlAmbientRetryClickCallback.bind(this),
                    "contentStyle"          : "style02",
                    "fullScreen"            : false,
                    "buttonCount"           : 2,
                    "buttonConfig" :
                    {
                        "button1" : 
                        {                            
                            labelId: "CancelBtn", 
                            appData : "Global.Cancel",
                        	disabled : false
                        },
                        "button2" :
                        {
                             labelId: "RetryBtn", 
                             appData : "Retry",
                             disabled : false
                        }
                    }, // end of buttonConfig
                    "text1Id" : "AmbienceRetryMsg",
                } // end of properties for "Style12Dialog"                                      
            }, // end of list of controlProperties
        },
		"Loading" : 
		{
            "template" : "Dialog3Tmplt",
            "sbNameId" : "settingIDM" , 
            "controlProperties" : {
                "Dialog3Ctrl" : {
				"defaultSelectCallback" : this._dialogCtrlLoadingClickCallback.bind(this),
                "buttonCount" : 1,
                    "buttonConfig" : {
                        "button1" : {                            
                            buttonColor: "normal",
                            buttonBehavior : "shortPressOnly",                        
                            labelId: "common.ApplicationsMenu",                           
							subMap : null,
                            appData : "SelectApplications",
                            disabled : false
                        },                       
                    }, // end of buttonConfig	
                    "contentStyle" : "style14",
                    "fullScreen" : false,                  
                    "text1Id" : "LoadiDM",
                    "text1SubMap" : null,
                    "meter" : {"meterType":"indeterminate", "meterPath":"common/images/IndeterminateMeter.png"}
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._LoadingCtxtTmpltReadyToDisplay.bind(this),  
            "contextInFunction" : null, 
            "displayedFunction" : null
        }, // end of "Loading"
		"IdmPreparing" : 
		{
            "sbNameId": "settingIDM",
            "template" : "EmNaviBlackTmplt",
            "templatePath": "apps/emnavi/templates/EmNaviBlack", 
        }, // end of "Blank"		
    }; // end of this.contextTable object
    
    this._messageTable =
    {
        'callAnim' : this.callAnimHanlder.bind(this),
        'CurrBarData': this.updateCurrentBar.bind(this),
        'CurrDriverScore':this.updateCurrDriverScore.bind(this),
        'AvgDriverScore':this.updateAvgDriverScore.bind(this),
        'AccelTrendzData':this.updateAccelTrendzData.bind(this),
        'BreakTrendzData':this.updateBrakeTrendzData.bind(this),
        'SteerTrendzData':this.updateSteerTrendzData.bind(this),
        'Message_TransitionBarScoreData':this.updateMessage_TransitionBarScoreData.bind(this),
        'DriverNickNameAndId':this.updateDriverIdName.bind(this),
        'CurrStageNumber' : this.updateCurrStageNumber.bind(this),
        'Global.AtSpeed' : this._msgHandler_GlobalAtSpeed.bind(this),
        'Global.NoSpeed' : this._msgHandler_GlobalNoSpeed.bind(this),
        'StageData' : this.updateStageData.bind(this),
        'DriverAdviceComment' : this.DriverAdviceComment.bind(this),
        'DriverHighScore' : this.setDriverHighScore.bind(this),
        'EndScrn' : this.EndScrnStatus.bind(this),
        'MeterAmbSetting' : this.MeterAmbSettingStatus.bind(this),
        'ambientMeterRetryReq' : this.ambientMeterRetryReqStatus.bind(this),
        'EOLEndingScreen' : this.showHideEOLEndingScreenSetting.bind(this),
        'IgnitionStatus' : this.showAmbientGrayOut.bind(this),
    };
};

/**************************
 * Context and Ready To Display Functions
 **************************/

 
// loading In Process Context
idmApp.prototype._LoadingCtxtTmpltReadyToDisplay = function()
{
     this._flag = true;
};	
 
idmApp.prototype._dialogCtrlLoadingClickCallback = function(dialogBtnCtrlObj, appData, params)
{
 log.debug("_dialogCtrlLoadingClickCallback  called..." +appData);
 if(this._currentContext.ctxtId)
    {
        switch (appData)
        {           
            case "SelectApplications":
                framework.sendEventToMmui("system", "SelectApplications");
                break;
        }
    }
}; 
 
idmApp.prototype.idmContextInSimple = function(context) {
	log.info("idmContextInSimpleMode");
	 if(this._isUmpPanelOpen)
     {
         this._idmContext = true; 
     }
};

idmApp.prototype.idmReadyToDisplaySimpleMode = function() {
    log.info("idmReadyToDisplaySimpleMode");
    this._atSpeedVal = framework.common.getAtSpeedValue();                                        //get the status of speed threshold from the framework. 
    
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId ==="Simple")
    {
		
		
    	
       if(this.currScore)
       {
         this._currentContextTemplate.idmCtrl.setCurrScore(this.currScore);
       }
      
       if(this.avgScore){
         this._currentContextTemplate.idmCtrl.setAvgScore(this.avgScore);
        }
       
        if(this.transitionBarScoreData){
         log.info("this.transitionBarScoreData "+this.transitionBarScoreData );
         this._currentContextTemplate.idmCtrl.initializeBarGraph(this.transitionBarScoreData);
        }
       
        if(this.cachedDriverIdName){
           log.info("this.cachedDriverIdName "+this.cachedDriverIdName);
           this._currentContextTemplate.idmCtrl.setDriverNameId(this.cachedDriverIdName,this.cachedDriverNameExist);
        }
        if(this.cachedcurrBarData){
            log.info("this.cachedcurrBarData "+this.cachedcurrBarData);
            this._currentContextTemplate.idmCtrl.insertCurrentBarGraph(this.cachedcurrBarData);
        }
        if(this._IgnitionStatus === "OFF" && this._checkIgnitionValue == false) // SR_IDM_1039 - to display '--' as stage number
		{			
			this.cachedBlankStageNumber = "BLANK";
			this._currentContextTemplate.idmCtrl.setCurrentStageNumber(this.cachedBlankStageNumber) ;
		}
		else
		{		
			if(this.cachedStageNumber)
			{
				this._currentContextTemplate.idmCtrl.setCurrentStageNumber(this.cachedStageNumber) ;
			}
		}
        if(this.transitionBarScoreData){
        	this._currentContextTemplate.idmCtrl.initializeBarGraph(this.transitionBarScoreData);
        }
        this._currentControl = this._currentContextTemplate.idmCtrl;
     }
    this._togglePanel();
    this._cachedAtSpeedChanged();
};

idmApp.prototype.idmContextInTraining= function() {
	log.info("idmContextInTrainingMode");
	 if(this._isUmpPanelOpen)
     {
         this._idmContext = true; 
     }
};

idmApp.prototype.idmReadyToDisplayTrainingMode = function() {
    log.info("idmReadyToDisplayTrainingMode");	 
     this._atSpeedVal = framework.common.getAtSpeedValue();                                        //get the status of speed threshold from the framework.
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "Training")
    {
      
        this._currentControl = this._currentContextTemplate.idmCtrl;
        if(this.currScore)
        {
           this._currentContextTemplate.idmCtrl.setCurrScore(this.currScore);
        }
        if(this.avgScore){
           this._currentContextTemplate.idmCtrl.setAvgScore(this.avgScore);
        }
        if(this.accelerateTrendVal){
           log.info("this.accelerateTrendVal"+this.accelerateTrendVal);
           this._currentContextTemplate.idmCtrl.updateAccelerateTrend(this.accelerateTrendVal);
        }
        if(this.brakeTrendVal){
           log.info("this.brakeTrendVal "+this.brakeTrendVal );
           this._currentContextTemplate.idmCtrl.updateBrakeTrend(this.brakeTrendVal );
        }
        if(this.steerTrendVal){
           log.info("this.steerTrendVal "+this.steerTrendVal );
           this._currentContextTemplate.idmCtrl.updateSteeringTrend(this.steerTrendVal);
        }
        if(this.transitionBarScoreData){
           log.info("this.transitionBarScoreData "+this.transitionBarScoreData );
           this._currentContextTemplate.idmCtrl.initializeBarGraph(this.transitionBarScoreData);
        }
        if(this.cachedcurrBarData){
            log.info("this.cachedcurrBarData "+this.cachedcurrBarData);
            this._currentContextTemplate.idmCtrl.insertCurrentBarGraph(this.cachedcurrBarData);
        }
        if(this.cachedDriverIdName){
            log.info("this.cachedDriverIdName "+this.cachedDriverIdName);
            this._currentContextTemplate.idmCtrl.setDriverNameId(this.cachedDriverIdName,this.cachedDriverNameExist);
        }
        if(this._IgnitionStatus === "OFF" && this._checkIgnitionValue == false) // SR_IDM_1039 - to display '--' as stage number
		{			
			this.cachedBlankStageNumber = "BLANK";
			this._currentContextTemplate.idmCtrl.setCurrentStageNumber(this.cachedBlankStageNumber) ;
		}
		else
		{		
			if(this.cachedStageNumber)
			{
				this._currentContextTemplate.idmCtrl.setCurrentStageNumber(this.cachedStageNumber) ;
			}
		}
        if(this.transitionBarScoreData){
        	this._currentContextTemplate.idmCtrl.initializeBarGraph(this.transitionBarScoreData);
        }
     }
     this._togglePanel();
     this._cachedAtSpeedChanged();
};

/*contextInIdmSettingscreen*/
idmApp.prototype.contextInIdmSettingscreen = function(msg){
	log.info("contextInIdmSettingscreen");
	this._idmContext = false;
	this._isUmpPanelOpen = false;
	
	if(msg && msg.params && msg.params.payload && msg.params.payload.endingScreen && msg.params.payload.ambMeterDspl)
     {
		 this._cachedEndingScreenToggleStatus = msg.params.payload.endingScreen;                    //Cache the status of ending screen toggle button.
         this._cachedMeterAmbientToggleStatus = msg.params.payload.ambMeterDspl;                     //Cache the status of reset toggle button.
		 log.info("Ending screen toggle status :: "+this._cachedEndingScreenToggleStatus +"ambient meter status :: "+this._cachedMeterAmbientToggleStatus); 
    } 
};

/*readyIdmSettings*/
idmApp.prototype.readyIdmSettings = function(){
	log.info("idmReadyToDisplaySettingScreen");
	 this._atSpeedVal = framework.common.getAtSpeedValue();                                        //get the status of speed threshold from the framework.
	 if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "Settings")
     {
        this._populateSettingList();
     } 
};

/*contextInEndingIdm*/
idmApp.prototype.IdmcontextInEndingSimple = function(msg) {
	this._idmContext = false;
	this._isUmpPanelOpen = false;
	
	log.info("IdmcontextInEndingSimple");
	if(this.stageUp )
    {	
		log.info("stage up is true");
		this._contextTable["EndingSimple"].sbNameId  = "stageUp" ;
    }
	else
	{
		log.info("stage up is false");
		this._contextTable["EndingSimple"].sbNameId  = "settingIDM" ;
	}
};

/*readyToDisplayEndingIdm*/
idmApp.prototype.IdmreadyToDisplayEndingSimple = function(context) {
	log.info("idmReadyToDisplayEndingScreen");
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId ==="EndingSimple")
    {
       this._currentControl = this._currentContextTemplate.idmCtrl;
       if(this.stageChanged)
       {
    	   this._currentContextTemplate.idmCtrl.stateChanged();
       }
       if(this.currScore)
       {
         this._currentContextTemplate.idmCtrl.setCurrScore(this.currScore);
       }
       if(this.avgScore){
         this._currentContextTemplate.idmCtrl.setAvgScore(this.avgScore);
        }
        if(this.cachedDriverIdName){
           log.info("this.cachedDriverIdName "+this.cachedDriverIdName);
           this._currentContextTemplate.idmCtrl.setDriverNameId(this.cachedDriverIdName,this.cachedDriverNameExist);
        }
        if(this.cachedStageNumber){
           this._currentContextTemplate.idmCtrl.setCurrentStageNumber(this.cachedStageNumber) ;
        }
        if(this.advices){
        	this._currentContextTemplate.idmCtrl.setAdviceText(this.advices);
        }
        if(this.stageAchieved){
        	this._currentContextTemplate.idmCtrl.setStarValues(this.stageAchieved);
        };
     }
     this._startEndingTimer();
};

idmApp.prototype.IdmcontextInEndingTraining = function(msg) {
	this._idmContext = false;
	this._isUmpPanelOpen = false;
	
	log.info("IdmcontextInEndingTraining");
	
	if(this.stageUp)
    {	
		log.info("stage up is true");
		this._contextTable['EndingTraining'].sbNameId  = "stageUp" ;
    }
	else 
	{
		log.info("stage up is false");
		this._contextTable['EndingTraining'].sbNameId  = "settingIDM" ;
	}
};

idmApp.prototype.IdmreadyToDisplayEndingTraining = function(context) 
{
	log.info("idmReadyToDisplayTrainingEndingMode");
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId ==="EndingTraining")
    {
       
        this._currentControl = this._currentContextTemplate.idmCtrl;
        if(this.stageChanged)
        {
     	   this._currentContextTemplate.idmCtrl.stateChanged();
        }
        if(this.currScore)
        {
           this._currentContextTemplate.idmCtrl.setCurrScore(this.currScore);
        }
        if(this.avgScore){
           this._currentContextTemplate.idmCtrl.setAvgScore(this.avgScore);
        }
        if(this.accelerateTrendVal){
           log.info("this.accelerateTrendVal"+this.accelerateTrendVal);
           this._currentContextTemplate.idmCtrl.updateAccelerateTrend(this.accelerateTrendVal);
        }
        if(this.brakeTrendVal){
           log.info("this.brakeTrendVal "+this.brakeTrendVal );
           this._currentContextTemplate.idmCtrl.updateBrakeTrend(this.brakeTrendVal );
        }
        if(this.steerTrendVal){
           log.info("this.steerTrendVal "+this.steerTrendVal );
           this._currentContextTemplate.idmCtrl.updateSteeringTrend(this.steerTrendVal);
        }
        if(this.cachedDriverIdName){
            log.info("this.cachedDriverIdName "+this.cachedDriverIdName);
            this._currentContextTemplate.idmCtrl.setDriverNameId(this.cachedDriverIdName,this.cachedDriverNameExist);
        }
        if(this.cachedStageNumber){
          this._currentContextTemplate.idmCtrl.setCurrentStageNumber(this.cachedStageNumber) ;
        }
        if(this.advices){
        	this._currentContextTemplate.idmCtrl.setAdviceText(this.advices);
        }
        if(this.stageAchieved){
        	this._currentContextTemplate.idmCtrl.setStarValues(this.stageAchieved);
        }
    }
    this._startEndingTimer();
};
 
/**************************
 * Message Handler
 **************************/

//Message Handler for Trend Animation
idmApp.prototype.callAnimHanlder = function(msg)
{
	this._cachedDriveTrendObj = msg.params.payload;
	
	if(this._currentContextTemplate &&  this._currentContext && (this._currentContext.ctxtId === "Training" || this._currentContext.ctxtId === "EndingTraining") && msg.params.payload)
	{
	    this._currentContextTemplate.idmCtrl.updateBrakeTrend(this._cachedDriveTrendObj.brake);
	    this._currentContextTemplate.idmCtrl.updateSteeringTrend(this._cachedDriveTrendObj.steer);
	    this._currentContextTemplate.idmCtrl.updateAccelerateTrend(this._cachedDriveTrendObj.accelerate);
	}		
};

//Message Handler for updating last bar value of graph and shift others
idmApp.prototype.updateCurrentBar = function(msg)
{
    log.info("::updateCurrentBar messageHandler::");
    this.cachedcurrBarData = msg.params.payload.Curr_Bar_Data * this._multiplicationFactor;
    this.cachedcurrBarData = this.cachedcurrBarData.toFixed(1);
    
    if(this._currentContextTemplate &&  this._currentContext && (this._currentContext.ctxtId === "Simple" || this._currentContext.ctxtId === "Training") && (msg.params.payload.Curr_Bar_Data || msg.params.payload.Curr_Bar_Data == 0))
	{
        this._currentContextTemplate.idmCtrl.insertCurrentBarGraph(this.cachedcurrBarData);
    }
};

//Message Handler for updating current driver score
idmApp.prototype.updateCurrDriverScore = function(msg)
{	
    log.info("updateCurrDriverScore::");
    this.currScore = msg.params.payload.CurrScore ;
    this.currScore = this.currScore * this._multiplicationFactor;
	this.currScore = this.currScore.toFixed(1);
	
    if(this._currentContextTemplate &&  this._currentContext && (this._currentContext.ctxtId !=="Settings") && (msg.params.payload || msg.params.payload.CurrScore == 0))
    {  
	      if(this.currScore || this.currScore == 0)
	      {
	    	  this._currentContextTemplate.idmCtrl.setCurrScore(this.currScore);
	      }
    }
}; 

//Message Handler for updating average driver score
idmApp.prototype.updateAvgDriverScore = function(msg)
{
    log.info("updateAvgDriverScore::");
    this.avgScore = msg.params.payload.AvgScore ;
    this.avgScore = this.avgScore * this._multiplicationFactor;
	this.avgScore = this.avgScore.toFixed(1);
	
    if(this._currentContextTemplate &&  this._currentContext && (this._currentContext.ctxtId !=="Settings") && (msg.params.payload || msg.params.payload.AvgScore == 0))
    { 
	    if( this.avgScore || this.avgScore ==0)
	    {
	    	this._currentContextTemplate.idmCtrl.setAvgScore(this.avgScore);
	    }
	}
};

//Message handler for receiving High Score
idmApp.prototype.setDriverHighScore = function(msg)
{
	log.info("setDriverHighScore handler called " + msg.params.payload.HighScore);
	this.highScore = msg.params.payload.HighScore ;
	
    if(this._currentContextTemplate &&  this._currentContext && ( this._currentContext.ctxtId == "EndingSimple" || this._currentContext.ctxtId == "EndingTraining") && (msg.params.payload || msg.params.payload.HighScore == 0))
    { 
	    if( this.highScore || this.highScore == 0)
	    {
	    	this._currentContextTemplate.idmCtrl.setHighScore(this.highScore);
	    }
	}
};


//Message Handler for updating Accelerate Trend
idmApp.prototype.updateAccelTrendzData = function(msg)
{
    log.info("updateAccelTrend::");
    this.accelerateTrendVal = msg.params.payload.CurrAccel ;
	log.info("this.accelerateTrendVal "+ this.accelerateTrendVal);
	
    if(this._currentContextTemplate &&  this._currentContext && (this._currentContext.ctxtId === "Training" || this._currentContext.ctxtId === "EndingTraining") && msg.params.payload.CurrAccel)
    {
        this._currentContextTemplate.idmCtrl.updateAccelerateTrend(this.accelerateTrendVal);
    }
};

//Message Handler for updating Brake Trend
idmApp.prototype.updateBrakeTrendzData = function(msg)
{
    log.info("updateBrakeTrend::");
    this.brakeTrendVal = msg.params.payload.CurrBreak ;
    log.info("this.brakeTrendVal " + this.brakeTrendVal );
    
    if(this._currentContextTemplate &&  this._currentContext && (this._currentContext.ctxtId === "Training" || this._currentContext.ctxtId === "EndingTraining") && msg.params.payload.CurrBreak)
    {
       this._currentContextTemplate.idmCtrl.updateBrakeTrend(this.brakeTrendVal);
    }
};

//Message Handler for updating Steering Trend
idmApp.prototype.updateSteerTrendzData = function(msg)
{
    log.info("updateSteerTrendzData::");
    this.steerTrendVal = msg.params.payload.CurrSteer ;
    log.info("this.steerTrendVal " + this.steerTrendVal);
    
    if(this._currentContextTemplate &&  this._currentContext && (this._currentContext.ctxtId === "Training" || this._currentContext.ctxtId === "EndingTraining") && msg.params.payload.CurrSteer)
    {
       this._currentContextTemplate.idmCtrl.updateSteeringTrend(this.steerTrendVal);
    }
};

idmApp.prototype.updateMessage_TransitionBarScoreData = function(msg)
{
    log.info("updateMessage_TransitionBarScoreData::");
    log.info("this.transitionBarScoreData send from mmui::"+ this.transitionBarScoreData);
    this.transitionBarScoreData = msg.params.payload.TransitionBarValues.transBarData.scoreTrans ;
    
    for(var i=0; i< this.transitionBarScoreData.length;i++)
    {
  	  this.transitionBarScoreData[i] = this.transitionBarScoreData[i] * this._multiplicationFactor;
  	  this.transitionBarScoreData[i] = this.transitionBarScoreData[i].toFixed(1);
    }
    
    if(this._currentContextTemplate &&  this._currentContext && (this._currentContext.ctxtId === "Simple" || this._currentContext.ctxtId === "Training") && msg.params.payload.TransitionBarValues.transBarData.scoreTrans)
    {
      log.info("this.transitionBarScoreData");
      this._currentContextTemplate.idmCtrl.initializeBarGraph(this.transitionBarScoreData);  
    }
};

//Message Handler for updating Driver Name
idmApp.prototype.updateDriverIdName = function(msg)
{
    log.info("updateDriverIdName MessageHandler");
   
    if(msg.params.payload.Driver_Info.drvId == 0)
    {
    	this.cachedDriverNameExist = false;
    	this.cachedDriverIdName= "";
    }
    else
    {
        this.cachedDriverNameExist = msg.params.payload.Driver_Info.drvName_exist ;
        if(this.cachedDriverNameExist)
        {
        	this.cachedDriverIdName = msg.params.payload.Driver_Info.drvNickname ;
        }
        else
        {
        	this.cachedDriverIdName = msg.params.payload.Driver_Info.drvId ;
        }
    }
    if(this._currentContextTemplate &&  this._currentContext && this._currentContext.ctxtId !== "Settings" && msg.params.payload)
    {
    	this._currentContextTemplate.idmCtrl.setDriverNameId(this.cachedDriverIdName,this.cachedDriverNameExist);
    }
};

//Message Handler for updating Stage No 
idmApp.prototype.updateCurrStageNumber = function(msg)
{
    log.info("updateStageNumber MessageHandler");
    
    /*if (this._updateCurrentStage)
    {
    	if(this.cachedStageNumber != msg.params.payload.StageNum)
    	{
    		this.stageChanged = true;
    	}
    }*/
    
    this.cachedStageNumber = msg.params.payload.StageNum;
    if(this.cachedStageNumber != "ONE")
    {
    	if (this._currentContextTemplate &&  this._currentContext && (this._currentContext.ctxtId =="EndingSimple" || this._currentContext.ctxtId =="EndingTraining") )
    	{
    		this._currentContextTemplate.idmCtrl.stateChanged();
    	}
    }
    
    if(this._currentContextTemplate &&  this._currentContext && (this._currentContext.ctxtId !=="Settings") && msg.params.payload.StageNum)
    {
        log.info("updateStageNumber MessageHandler data " + this.cachedStageNumber);		
		if (this._currentContextTemplate && this._currentContext && ((this._currentContext.ctxtId === "Simple") ||(this._currentContext.ctxtId === "Training")))
		{
			if(this._IgnitionStatus === "OFF" && this._checkIgnitionValue == false) // SR_IDM_1039 - to display '--' as stage number
			{			
				this.cachedBlankStageNumber = "BLANK";
				this._currentContextTemplate.idmCtrl.setCurrentStageNumber(this.cachedBlankStageNumber) ;
			}
			else
			{		
				if(this.cachedStageNumber)
				{
					this._currentContextTemplate.idmCtrl.setCurrentStageNumber(this.cachedStageNumber) ;
				}
			}
		}
		else
		{
			this._currentContextTemplate.idmCtrl.setCurrentStageNumber(this.cachedStageNumber) ;
		}
    };
    
    /*if(this._updateCurrentStage == false)
    {
    	this._updateCurrentStage = true;
    }*/
};

//AtSpeed Message handler
idmApp.prototype._msgHandler_GlobalAtSpeed = function(msg)
{
	log.info("_msgHandler_GlobalAtSpeed MessageHandler Called");
	this._atSpeedVal = true;
    this._cachedAtSpeedChanged();
};

//NoSpeed Message handler
idmApp.prototype._msgHandler_GlobalNoSpeed = function(msg)
{
	log.info("_msgHandler_GlobalNoSpeed MessageHandler Called");
	this._atSpeedVal = false;
    this._cachedAtSpeedChanged();
};

//StageData MessageHandler
idmApp.prototype.updateStageData = function(msg)
{
	  log.info("updateStageData MessageHandler");
	  this.stageAchieved = msg.params.payload.Stage_achieved;
	  this.stageUp = msg.params.payload.Stage_achieved.stage_up;
	  
	  if(this._currentContextTemplate &&  this._currentContext && (this._currentContext.ctxtId === "EndingSimple" || this._currentContext.ctxtId === "EndingTraining") && msg.params.payload )
	  {
		if(this.stageUp )
	    {	
			log.info("stage up is true in message handler");
			framework.common.setSbNameId(this.uiaId,"stageUp");
	    }
		else
		{
			log.info("stage up is false in message handler");
			framework.common.setSbNameId(this.uiaId,"settingIDM");
		}
	  
	   if(msg.params.payload.Stage_achieved.stars >= 0 && msg.params.payload.Stage_achieved.stars <= 5)
		 {
			 log.info("Received Starvalues " + msg.params.payload.Stage_achieved.stars);
		     this._currentContextTemplate.idmCtrl.setStarValues(this.stageAchieved); 
		 }
		 else
		 {
			 log.info("Did not Receive Starvalues or Incorrect starvalues");
		 }
	}
};

//Driver Advice Message Handler
idmApp.prototype.DriverAdviceComment = function(msg)
{
	log.info("DriverAdviceComment MessageHandler Called");
	this.advices = msg.params.payload.advices;
	if(this._currentContextTemplate &&  this._currentContext && (this._currentContext.ctxtId === "EndingSimple" || this._currentContext.ctxtId === "EndingTraining") && msg.params.payload.advices)
    {
		 this._currentContextTemplate.idmCtrl.setAdviceText(this.advices);
	}
};

//EndScrn Message Handler
idmApp.prototype.EndScrnStatus = function(msg)
{
	log.info("EndScrnStatus handler called");
	if(msg && msg.params && msg.params.payload)
	{
		this.endingScreenData = msg.params.payload.EndScrnSet;
		this._cachedEndingScreenToggleStatus = this.endingScreenData ;
	}
	
	if(this._currentContextTemplate &&  this._currentContext && (this._currentContext.ctxtId === "Settings") && msg.params.payload.EndScrnSet)
    {	
		if(this._idmSettingList.items.length == 2)
        {
			if(this.endingScreenData == "ON")
			{
				this._idmSettingList.items[0].value = 1;
			}
			else if(this.endingScreenData == "OFF")
			{
				this._idmSettingList.items[0].value = 2;
			}
        }
        else if(this._idmSettingList.items.length == 1)
        {
        	if (this._idmSettingList.items[0].text1Id == "endingScreen")
        	{
        		if(this.endingScreenData == "ON")
        		{
        			this._idmSettingList.items[0].value = 1;
        		}
        		else if(this.endingScreenData == "OFF")
        		{
        			this._idmSettingList.items[0].value = 2;
        		}
        	}
        }
		this._updateList();
    }
};

//MeterAmbSetting Message Handler
idmApp.prototype.MeterAmbSettingStatus = function(msg)
{
	log.info("MeterAmbSetting handler called");
	if(msg && msg.params && msg.params.payload)
	{
		this.AmbSettingData = msg.params.payload.AmbSetting ;
		this._cachedMeterAmbientToggleStatus = this.AmbSettingData;
		if ( this.AmbSettingData == "NOT_ADPT" )
		{
			this._cachedMeterAmbSupportStatus = "OFF";
		}else
		{
			this._cachedMeterAmbSupportStatus = "ON";
		}
		if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "Settings")
	    {
			this._populateSettingList();
	    }
	}
	
	if(this._currentContextTemplate &&  this._currentContext && (this._currentContext.ctxtId === "Settings") && msg.params.payload.AmbSetting)
    {
		log.info("MeterAmbSetting handler called " + this.AmbSettingData);
		
		if(this._idmSettingList.items.length == 2)
        {
			if(this.AmbSettingData == "ON")
			{
				this._idmSettingList.items[1].value = 1;
			}
			else if(this.AmbSettingData == "OFF")
			{
				this._idmSettingList.items[1].value = 2;
			}
			this._updateList();
        }
        else if(this._idmSettingList.items.length == 1)
        {
        	if (this._idmSettingList.items[0].text1Id == "meterAmbientDisplay")
        	{
        		if(this.AmbSettingData == "ON")
        		{
        			this._idmSettingList.items[0].value = 1;
        		}
        		else if(this.AmbSettingData == "OFF")
        		{
        			this._idmSettingList.items[0].value = 2;
        		}
        		this._updateList();
        	}
        }
    }
};

//showHideEOLEndingScreenSetting Message Handler
idmApp.prototype.showHideEOLEndingScreenSetting = function(msg)
{
	log.info("showHideEOLEndingScreenSetting handler called");
	if(msg.params.payload.EolEndScrnSet)
    {
		log.info("msg.params.payload.EolEndScrnSet " + msg.params.payload.EolEndScrnSet);
		this._cachedEndingScreenSupportStatus = msg.params.payload.EolEndScrnSet;
    }
	else
	{
		log.info("In else :: msg.params.payload.EolEndScrnSet " + msg.params.payload.EolEndScrnSet);
	}
	
	if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "Settings")
    {
		this._populateSettingList();
    }
};

//showAmbientGrayOut Message Handler
idmApp.prototype.showAmbientGrayOut = function(msg)
{
    log.info("showAmbientGrayOut handler called");
    if(msg.params.payload.IgnSts)
    {
        log.info("msg.params.payload.IgnSts " + msg.params.payload.IgnSts);
        this._cachedMeterAmbGrayOutStatus = msg.params.payload.IgnSts;
        // SCR SW00148649, If ignition status is off then display '--' as stage number
        if(this._cachedMeterAmbGrayOutStatus === "OFF") 
        {
            this._IgnitionStatus = "OFF";			
        }
        else
        {			
            this._IgnitionStatus = "ON";	
			this._checkIgnitionValue = true; //set as true for ignition on status
        }
    }
    else
    {
        log.info("In else :: msg.params.payload.IgnSts " + msg.params.payload.IgnSts);
    }
    if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "Settings")
    {
		this._populateSettingList();
    }
	 if (this._currentContextTemplate && this._currentContext && ((this._currentContext.ctxtId === "Simple") ||(this._currentContext.ctxtId === "Training")))
    {
        if(this._IgnitionStatus === "OFF" && this._checkIgnitionValue == false) // SR_IDM_1039 - to display '--' as stage number
        {			
            this.cachedBlankStageNumber = "BLANK";
            this._currentContextTemplate.idmCtrl.setCurrentStageNumber(this.cachedBlankStageNumber) ;
        }
        else
        {		
            if(this.cachedStageNumber)
            {
                this._currentContextTemplate.idmCtrl.setCurrentStageNumber(this.cachedStageNumber) ;
            }
        }
    }
};

//ambientMeterRetryReq Message Handler
idmApp.prototype.ambientMeterRetryReqStatus = function(msg)
{
	log.info("ambientMeterRetryReq handler called");
};

/**************************
 * Callback functions
 **************************/

idmApp.prototype.selectCallbackHandler = function(controlObj, appData, params)
{
	   log.info("Select Callback handler called");
	   this._currentControl.toggleUmpPanel("showPanel");
	   this._isUmpPanelOpen = true;
   // this._cachedAtSpeedChanged();
};

//Update any speed restricted items in the current context.
idmApp.prototype._cachedAtSpeedChanged = function()
{
	log.info("cachedAtSpeedChanged called");
    if (this._currentContext && this._currentContextTemplate)
    {
        switch (this._currentContext.ctxtId)
        {
        case "Simple":
            this.updateSimpleModeContextData();
        break;
        case "Training":
            this.updateTrainingModeContextData();
        break;
        case "Settings":
        	this._populateSettingList();
        	break;
        default:
        break;
        }
    }
};

idmApp.prototype._umpDefaultSelectCallback = function(ctrlObj, appData, params)
{    
	log.info("_umpDefaultSelectCallback called");
	switch(appData)
     {
        case "ApplicationsMenu":
           framework.sendEventToMmui(this.uiaId, "SelectSourceMenu", null);
           log.info("SelectSourceMenu");
           break;
        case "SwitchView":
           framework.sendEventToMmui(this.uiaId, "SelectSwitchView", null);
           log.info("SelectSwitchView");
           break;
        case "SelectSettings":
           framework.sendEventToMmui(this.uiaId, "SelectSettings", null);
           log.info("SelectSettings");
           break;
        case "HidePanel":
           this._currentControl.toggleUmpPanel("hidePanel");
           log.info("hidePanel");
           this._isUmpPanelOpen = false;
           break;
        default:
           log.warn("Can not identify the AppData..Something went wrong !!!"); 
     }
     log.info("_umpDefaultSelectCallback");
};

/*Setting context ItemClickCallback*/
idmApp.prototype._settingsItemClickCallback = function(listCtrlObj, appData,params){
	log.info("idmApp :: _settingsItemClickCallback called appdata = " + appData + "params.additionalData " + params.additionalData);
    switch(appData)
    {
    case "SelectEndingScreen": 
        switch(params.additionalData)
        {
            case 1:
                this._cachedEndingScreenToggleStatus = "ON";
                framework.sendEventToMmui(this.uiaId, "SetEndingScreenOnOff",
                { payload : {endingScreen : "ON"}});
            break;
            case 2:
                this._cachedEndingScreenToggleStatus = "OFF";
                framework.sendEventToMmui(this.uiaId, "SetEndingScreenOnOff",
                 { payload : { endingScreen : "OFF"}});
                break;
            default:
            	log.info("In default case");
                break;
        }
        break;
    case "SelectMeterAmbDisplay": 
        switch(params.additionalData)
        {
            case 1:
                this._cachedMeterAmbientToggleStatus = "ON";
                framework.sendEventToMmui(this.uiaId, "SetMeterAmbientDisplayOnOff",
                { payload : {meterAmbientDisplay : "ON"}});
            break;
            case 2:
                this._cachedMeterAmbientToggleStatus = "OFF";
                framework.sendEventToMmui(this.uiaId, "SetMeterAmbientDisplayOnOff",
                 { payload : { meterAmbientDisplay : "OFF"}});
                break;
            default:
                log.info("In default case");
                break;
        }
        break;
        default:
          log.info("_settingsItemClickCallback default case") ;
        break;
    }
};

idmApp.prototype._dialogCtrlAmbientRetryClickCallback = function(dialogBtnCtrlObj, appData, params){
	log.info("idmApp :: _dialogCtrlAmbientRetryClickCallback called");
    if(this._currentContext.ctxtId)
    {
     switch (appData)
     {
       case "Retry":
            framework.sendEventToMmui(this.uiaId, "SelectRetry");
            break;
       case "Global.Cancel":
            framework.sendEventToMmui("Common", "Global.Cancel");
            break;
       default:
            break;
      }
    }
};

/**************************
 * Helper functions
 **************************/

//UpdateDataList Message Handler
idmApp.prototype._updateList = function()
{
	this._currentContextTemplate.list2Ctrl.setDataList(this._idmSettingList);
	this._currentContextTemplate.list2Ctrl.updateItems(0,this._idmSettingList.itemCount - 1);
	this._currentContextTemplate.list2Ctrl.setLoading(false);
}

//To show the UMP panel if it was open in the previous context...
idmApp.prototype._togglePanel = function()
{
    if(this._idmContext)
    {
        this._currentControl.toggleUmpPanel("showPanel");
        this._idmContext = false;
    }
};

/*this function gets called when vehicle speed exceeds threshold*/
idmApp.prototype.updateSimpleModeContextData = function(){
      if(this._atSpeedVal){
          this.disableUmpSettings();
      }else{
          this.enableUmpSettings();
      }
};

/*this function gets called when vehicle speed exceeds threshold*/
idmApp.prototype.updateTrainingModeContextData = function(){
	if(this._atSpeedVal){
       this.disableUmpSettings();
   }else{
       this.enableUmpSettings();
   }
};

idmApp.prototype.disableUmpSettings = function(){
    this._umpButtonConfigIdm["SelectSettings"].disabled = true ;
    //this._currentControl.umpCtrl.setUmpConfig(this._umpButtonConfigIdm);
	this._currentControl.umpCtrl.setButtonDisabled("SelectSettings",true); 
};

idmApp.prototype.enableUmpSettings = function(){
    this._umpButtonConfigIdm["SelectSettings"].disabled = false ;
    //this._currentControl.umpCtrl.setUmpConfig(this._umpButtonConfigIdm);
	this._currentControl.umpCtrl.setButtonDisabled("SelectSettings",false); 
};

//Start the timer for Ending screen for 5 seconds
idmApp.prototype._startEndingTimer = function() 
{
    this.endingTimer = setTimeout(this._stopEndingTimer.bind(this), 5000);
};

// Send event to mmui and clear the ending timeout
idmApp.prototype._stopEndingTimer = function() 
{
    framework.sendEventToMmui(this.uiaId, "EndingTimeout", null);
    clearTimeout(this.endingTimer);
    this.endingTimer = null;
};


//helper fuction to populate the idm setting list
idmApp.prototype._populateSettingList = function()
{
    var dataListItems  = this._idmSettingList.items;
    log.info("Vehicle crossed threshold speed ::" +this._atSpeedVal);
   
    log.info("[populateSettingList] Ending screen toggle status :: "+this._cachedEndingScreenToggleStatus +" Meter Ambient :: "+this._cachedMeterAmbientToggleStatus);
    log.info("[populateSettingList] Ending screen show/hide status :: "+ this._cachedEndingScreenSupportStatus +" Meter Ambient show/hide  :: "+this._cachedMeterAmbSupportStatus);
    log.info("[populateSettingList] meter Ambient Gray Out Status " + this._cachedMeterAmbGrayOutStatus);
    
    //set endingscreen toggle button and reset toggle button "on"  or "off" state  wrt gui click/ update from MMUI. 
	    
        if(this._cachedEndingScreenToggleStatus === "ON")
        {
            this.CESTS = 1 ; 
        }
        else if(this._cachedEndingScreenToggleStatus === "OFF")
        {
        	this.CESTS = 2 ; 
        }
        
        if(this._cachedMeterAmbientToggleStatus === "ON")
        {   
            this.CMATS = 1;
        }
        else if(this._cachedMeterAmbientToggleStatus === "OFF")
        {
        	 this.CMATS = 2;
        } 
        
        if (this._cachedEndingScreenSupportStatus == "OFF"  &&  this._cachedMeterAmbSupportStatus == "OFF"  )             
        {
            	this._idmSettingList  = {
        	          itemCountKnown : true,
        	          itemCount      : 0,
        	          items           : [ ]
        	  };
        	  dataListItems  = this._idmSettingList.items;
        }
        else if(this._cachedEndingScreenSupportStatus == "OFF" )
        {
        	this._idmSettingList  = {
      	          itemCountKnown : true,
      	          
      	          itemCount      : 1,
      	          items           : [
      	                             { appData : 'SelectMeterAmbDisplay',      text1Id : 'meterAmbientDisplay', itemStyle : 'styleOnOff',  hasCaret : false, value : this.CMATS }
      	                            ]  
      	  };
      	  dataListItems  = this._idmSettingList.items;
        }
        else if(this._cachedMeterAmbSupportStatus == "OFF")
        {
        	this._idmSettingList  = {
      	          itemCountKnown : true,
      	          
      	          itemCount      : 1,
      	          items           : [
      	                           { appData : 'SelectEndingScreen', text1Id : 'endingScreen', itemStyle : 'styleOnOff', hasCaret : false, value : this.CESTS}, 
      	                            ]  
      	  };
      	  dataListItems  = this._idmSettingList.items;
        }
        else
        {
	    	this._idmSettingList  = {
	  	          itemCountKnown : true,
	  	          itemCount      : 2,
	  	          items           : [{ appData : 'SelectEndingScreen', text1Id : 'endingScreen', itemStyle : 'styleOnOff', hasCaret : false, value : this.CESTS}, 
	  	                             { appData : 'SelectMeterAmbDisplay',      text1Id : 'meterAmbientDisplay', itemStyle : 'styleOnOff', hasCaret : false, value : this.CMATS}
	  	                            ]
	  	  };
	  	  dataListItems  = this._idmSettingList.items;
        }

   
    //check for vehicle speed if it exceeds the threshold range then greyout the ecosetting list items. 
    //else if ending screen support is not thr than disable first item in the list.
    // if both the above condition doesn't satisfy then display the complete enabled list.
        
        log.info("dataListItems.length = " + dataListItems.length );
        for (var listItem in dataListItems)
   	    {
           dataListItems[listItem].disabled = this._atSpeedVal;
   	    }
        
        if(this._cachedMeterAmbGrayOutStatus === "OFF" && dataListItems.length == 2)
        {
        	dataListItems[1].disabled = true;
        }
        else if(this._cachedMeterAmbGrayOutStatus === "OFF" && dataListItems.length == 1 && dataListItems[0].text1Id == "meterAmbientDisplay")
        {
        	dataListItems[0].disabled = true;
        }
    
        dataList = { itemCountKnown : true, itemCount : dataListItems.length, items : dataListItems };
    
    this._listLength = dataList.itemCount - 1 ; 
    
   //set datalist on listcontrol
    this._currentContextTemplate.list2Ctrl.setDataList(dataList);
    this._currentContextTemplate.list2Ctrl.updateItems(0, this._listLength); 
    this._currentContextTemplate.list2Ctrl.setLoading(false);
    
};

/*  IDM handlers end  */

/*************************** Helper Functions ends ****************************************/

//Tell framework this .js file has finished loading

framework.registerAppLoaded("idm", null, true);