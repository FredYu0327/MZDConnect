log.addSrcFile("tutorialApp.js", "tutorial");
/**********************************************
 * Start of Base App Implementation
 *
 * Code in this section should not be modified
 * except for function names based on the appname
 *********************************************/

function tutorialApp(uiaId)
{
    log.info("tutorialApp called...");
    // Base application functionality is provided in a common location via this call to baseApp.init().
    // See framework/js/BaseApp.js for details.
    baseApp.init(this, uiaId);
    // All feature-specific initialization is done in appInit()
}

tutorialApp.prototype.appInit = function()
{
    log.info(" tutorialApp appInit called...");
    if (framework.debugMode)
    {
        utility.loadScript("apps/tutorial/test/tutorialAppTest.js");
    }
 
    
this._contextTable = {
        "TutorialSelection" : {            
            "template" : "Dialog3Tmplt",
            "controlProperties": {
                "Dialog3Ctrl" : {                                 
                    "titleStyle" : "titleStyle01",
                    "title" : null,
                    "titleId" : "TutorialSelection",
                    "titleSubMap" : null,
                    "contentStyle" : "style18",
                    "fullScreen" : false,
                    "text1" : null,
                    "text1Id" : "GeneralTutorial",
                    "text1SubMap" : null,
                    "text2" : null,
                    "text2Id" : "AudioTutorial",
                    "text2SubMap" : null,
                    "text3" : null,
                    "text3Id" : "PhoneTutorial",
                    "text3SubMap" : null,
                    "text4" :null,
                    "text4Id" : "AdvancedVoiceTutorial",
                    "text4SubMap" : null
                    
                } // end of properties for "Style18Dialog"                                      
            }, // end of list of controlProperties
        }, // end of "Style18Dialog"
        
            
        
        "Tutorial1" : {
            "template" : "Dialog3Tmplt",          
            "controlProperties": {
                "Dialog3Ctrl" : {
                  //  "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),                
                    "titleStyle" : "titleStyle03",
                    "title" : null,
                    "titleId" : "GeneralVoiceCtrlTutorial",
                    "titleSubMap" : null,
                    "contentStyle" : "style19",
                    "fullScreen" : false,
                    "text1" : null,
                    "text1Id" : "Entertainment",
                    "text1SubMap" : null,
                    "text2Id" : "Communications",
                    "text3Id" : "Navigation",
                    "text4Id" : "Applications",
                    "text5Id" : "Favorites",
                    "text6Id" : "Settings",
                    "text7Id" : "MainMenu",
                    "text8Id" : "Call",
                    "text9Id" : "PlayAlbum",
                    
                } // end of properties for "Style19Dialog"                                      
            }, // end of list of controlProperties
        }, // end of "Style19Dialog
        
        "Tutorial2" : {
              "template" : "Dialog3Tmplt",          
              "controlProperties": {
                  "Dialog3Ctrl" : {
                    //  "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),                
                      "titleStyle" : "titleStyle03",
                      "title" : null,
                      "titleId" : "AudioCtrlTutorial",
                      "titleSubMap" : null,
                      "contentStyle" : "style19",
                      "fullScreen" : false,
                      "text1" : null,
                      "text1Id" : "FMRadio",
                      "text1SubMap" : null,
                      "text2Id" : "AMRadio",
                      "text3Id" : "CDPlayer",
                      "text4Id" : "USBAudio",
                      "text5Id" : "TuneFreq",
                      "text6Id" : "PlayArtist",
                      "text7Id" : "BrowseSongs"
                    //  "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),                
                  } // end of properties for "Style19Dialog"                                      
              }, // end of list of controlProperties
              "readyFunction":this._TutorialCtxtTmpltReadyToDisplay.bind(this),
          }, // end of "Style19Dialog
    
        
        
        "Tutorial3" : {
             "template" : "Dialog3Tmplt",          
             "controlProperties": {
                 "Dialog3Ctrl" : {
                   //  "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),                
                     "titleStyle" : "titleStyle03",
                     "title" : null,
                     "titleId" : "PhoneTutorialTitle",
                     "titleSubMap" : null,
                     "contentStyle" : "style19",
                     "fullScreen" : false,
                     "text1" : null,
                     "text1Id" : "CallName",
                     "text1SubMap" : null,
                     "text2Id" : "DialPad",
                     "text3Id" : "Redial",
                     "text4Id" : "CallBack",
                     "text5Id" : "BrowseContacts",
                     "text6Id" : "RecentCalls",
                     "text7Id" : "ShowMessage",
                     "text8Id" : "GoToEmail",
                 } // end of properties for "Style19Dialog"                                      
             }, // end of list of controlProperties
         }, // end of "Style19Dialog
             
      
        
        "Tutorial4" : {
             "template" : "Dialog3Tmplt",          
             "controlProperties": {
                 "Dialog3Ctrl" : {
                   //  "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),                
                     "titleStyle" : "titleStyle03",
                     "title" : null,
                     "titleId" : "AdvancedVoice",
                     "titleSubMap" : null,
                     "contentStyle" : "style19",
                     "fullScreen" : false,
                     "text1" : null,
                     "text1Id" : "TalkIntPrompt",
                     "text1SubMap" : null,
                     "text2Id" : "SpeakAfterBeep",
                     "text3Id" : "SpeakAvoidPause",
                     "text4Id" : "MinimizeNoise",
                     "text5Id" : "Help",
                     "text6Id" : "StepByStep",
                     "text7Id" : "CombineVoice",
                     "text8Id" : null,
                     
                 } // end of properties for "Style19Dialog"                                      
             }, // end of list of controlProperties
         }, // end of "Style19Dialog             
            
       
        
    }; // end of this._contextTable


    };

/**************************
 *Utility functions
 **************************/
tutorialApp.prototype._TutorialCtxtTmpltReadyToDisplay = function()
{
  this._populateTutorialCtxtList();
};

tutorialApp.prototype._populateTutorialCtxtList = function()
{ 
	var cachedVehicleType = framework.getSharedData("syssettings","VehicleType");
	var cachedregion = framework.localize.getRegion();
	log.debug("#Tutorial_Region Check::"+framework.localize.getRegion());
	if(cachedregion && cachedregion === framework.localize.REGIONS.NorthAmerica && cachedVehicleType && cachedVehicleType != "SETTINGS_VehicleModelType_J03G")
    {
         if(this._currentContextTemplate){
        //Updating the String based on the Language...
        this._currentContextTemplate.dialog3Ctrl.setText5Id("XMRadio");
        this._currentContextTemplate.dialog3Ctrl.setText6Id("TuneFreq");
        this._currentContextTemplate.dialog3Ctrl.setText7Id("TuneChnlName");
        this._currentContextTemplate.dialog3Ctrl.setText8Id("PlayArtist");
        this._currentContextTemplate.dialog3Ctrl.setText9Id("BrowseSongs");
		}else{
			log.debug("#Tutorial Current context not defined...");
		}
	}
    if(framework.localize.getRegion() === framework.localize.REGIONS.Japan)
      {
      	  if(this._currentContextTemplate){
      	// Updating the strings for the Japan region
      	this._currentContextTemplate.dialog3Ctrl.setText3Id("TutorialBluetooth");
      	this._currentContextTemplate.dialog3Ctrl.setText4Id("USBAudio");
		this._currentContextTemplate.dialog3Ctrl.setText5Id("CDPlayer");
		this._currentContextTemplate.dialog3Ctrl.setText6Id("TutorialAUX");
		this._currentContextTemplate.dialog3Ctrl.setText7Id("TutorialTV");
		this._currentContextTemplate.dialog3Ctrl.setText8Id("TuneFreq");
		this._currentContextTemplate.dialog3Ctrl.setText9Id("PlayArtist");
		this._currentContextTemplate.dialog3Ctrl.setText10Id("BrowseSongs");
		}else{
			log.debug("#Tutorial Current context not defined...");
      	}
      }
      else
    {
      log.debug("#Tutorial Region is other than NA, JP...");
    }
};


/**************************
 * Framework register
 **************************/
framework.registerAppLoaded("tutorial", null, true);