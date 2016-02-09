/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: schedmaintApp.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author:avoram
 Date:  11-Jan-2013  
 __________________________________________________________________________

 Description: IHU GUI schedule maintenance Application
 ______________________________________________________________________
 
 Revisions:
 v0.1 (21-Jan-2013) //Schedmaint 3.5 CheckIn
 v0.2 (15-Mar-2013) //Schedmaint 3.8 CheckIn
 v0.3 (07-May-2013) //Control migration from list control to list2 control
 v0.4 (23-May-2013) //Slider min values updated from 1000 kM to 500 KM & 500 MILE to 250 MILE.
 v0.5 (23-May-2013) //Need to correct Min distance slider value setting.
 v0.6 (28-May-2013) //Need to correct ConfirmReset and ConfirmOff confirmation message.
 v0.7 (04-Jun-2013) //Added necessary logs.
 v0.8 (07-Jun-2013) //Added necessary dictionary strings and changed 1 month value to 31 days.
 v0.9 (10-Jun-2013) //Added necessary logs for auto oil testing.
 v1.0 (11-Jun-2013) //Changed default time after reset to 4 months
 v1.1 (11-Jun-2013) //Oil life greater than 100% and less than 0% will show --%
 v1.2 (25-Jun-2013) //Control migration from slider control to +/- control
 v1.3 (01-jul-2013) //Removed contextIn function for MaintenanceList Screen and added an extra message.
 v1.4 (04-jul-2013) //min time +/- control value as 30 days,red font color property added,distance slider increment to 500 Miles
                      or 1000 Km, Tire rotation change while other maintenance off,making other maintenance type unavailable.
 v1.5(16 jul 13)    //Spec migration to 4.0 checkIn
 v1.6(22 Jul 13) //  In Scheduled Maintenance the +/- GUI control is not matching with the requirement(SW00125297)
 v1.7(25 Jul 13) //  In Scheduled Maintenance the +/- GUI control is not working properly for less than 30 days(SW00119872)
 v1.8(26 Jul 13) //  In Scheduled Maintenance, distance option is not present need to update Oil Settings (SW00125148)
 v1.9(28 jul 13) // CMU loses the focus that either distance is selected or time is selected(SW00125602)
                 // touch input to update the distance was stopped working while changing the distance(SW00126353)
 v2.0(3 Aug 13)  //  Provide red font color support on ScheduleMaintenanceDetail, TireRotationDetail and OilChangeDetail contexts when maintenance is due(SW00127255)
 v2.1(9 Aug 13)  //  OilChangeDetail screen NoFlexible screen is not proper
 v2.2(12 Aug 13) // Update focus on MaintenanceList context
 v2.3(13 aug 13) //<SchedMnt> setting time slowly causes flicker(SW00127620)
                 //Settings, Scheduled Maintenance - Distance and Time Fields' Values Flickering, Stuttering and Jumping if User Twists Commander
                   Multiple 'Clicks' CW or CCW(SW00128064)
 v2.4(14 Aug 13) //<SchedMnt> Truncation Issue in Reset Confirmation Dialog (SW00128632)
 v2.5(19 Aug 13) //In Maintenance, in all the sub-menus(Scheduled, Oil change and tire rotation) numbers/values are not displayed while setting is ON. 
                   (EU version)(SW00129003)
 v2.6(05 Sep 13) // time value flicker as 0-30 and 30-0 days while rotating commander left frequently.(SW00131033)
                 //Remove excessive logs (SW00130114)
 v2.7 (12-Sep-2013) //Implementation of iSC M517 – Schedule Maint Distance setting Change(SW00131928)
 v2.8 (22-Nov-2013) //When speed-restricting items, setting an entire new dataList should not be used(SW00138045)
 v2.9 (09-Dec-2013) //Both Fixed and OFF options in OilChange are selected when after selecting Off option, back button on the popup is pressed(SW00138533)
 v3.0 (18-June-2014) Changes are made for background image for J03G. (avalajh)
 v3.1 (25-July-2014) Changes are done for J12A interface.
 v3.2 (20-Aug-2014) Made changes for SW00151051: Rectified display of '-' sign
 v3.3 (15-Sep-2014) Made changes for SW00155143: Only one item is being updated instead of whole list - avalajh
__________________________________________________________________________ */

log.addSrcFile("schedmaintApp.js", "schedmaint");

function schedmaintApp(uiaId)
{
    log.info("schedmaintApp.js constructor called..");
    baseApp.init(this, uiaId);
}

/**************************
 * Standard App Functions *
 **************************/

/*
 * Called just after the App is instantiated by framework.
 */
schedmaintApp.prototype.appInit = function()
{
    //Initialization of variables
    //Variables used in MaintenanceList Context
    this._distanceDisplayFlag = null;
    this._oilMaintenanceModeCountry = null;
    this._distIncScale = null;
    this._distIncScaleMile = null;
    this._timeIncScale = null;
    this._distanceDueKM = null;
    this._distanceDueMILE = null;
    this._timeDue = null;
    this._schedmaintDistance = 0;
    this._schedmaintDuration = 0;
    this._tireRotationDistance = 0;
    this._oilMaintDistance = 0;
    this._scheduleMaintenanceMode = null;
    this._tireMaintenanceMode = null;
    this._oilMaintenanceMode = null;
    this._distanceUnit = null;
    this._maintenanceListData = null;
    
    //Variables used in ScheduleMaintenanceDetail Context
    this._country = null;
    this._schedmaintTime = 0;
    this._schedmaintDue = null;
    this._timeUnit = null;
    this._scheduleMaintenanceSettingMode = null;
    
    //Variables used in TireRotationDetail Context
    this._tiremaintDue = null;
    this._tireRotationSettingMode = null;
    
    //Variables used in OilChangeDetail Context
    this._oilDeteriorationLevel = 0;  
    this._oilmaintDue = null;
    this._oilMaintSetting = null;
    this._oilChangeSettingMode = null; 
    this._oilMaintenanceStatus = null;
    this._oilLifeValue = "0 %";
    
    //General variables
    this._schedmaintDueData = null;
    this._schMntSetting = null;
    this._cachedSpeed = null;
    this._buttonClicked = null;
    this._newDistanceValue = 0;
    this._newTimeValue = 0;
    this._minIncreamentValue = 0;
    this._maxIncreamentValue = 0;
    this._increamentScale = 0;
    this._increamentScaleTime = 0;
    this._newTimeValue = null;
    this._checkedFlexible = false;
    this._checkedFixed = false;
    this._checkedOff = false;
    this._schedmaintTimeDue = null;
    this._schedmaintDistanceDue = null;
    this._oilSettingShow = null;
    this._oilDistanceDue = null;
    this._oilLifeDue = null;
    this._responseDistanceTime = 30; //To check schedmaint distance response time from BLM
    this._responseTime = 30; //To check schedmaint time value response time from BLM
    this._timerDistanceRequest = 0;
    this._timerDistanceResponse = 0;
    this._timerTimeResponse = 0;
    this._timerTimeRequest = 0;
    this._UpdateTime = null;
    this._timerTireDistanceResponse = 0;
    this._timerTireDistanceRequest = 0;
    this._timerOilDistanceResponse = 0;
    this._timerOilDistanceRequest = 0;
    this._responseDistanceOilTime = null; //To check oil distance response time from BLM
    this._responseDistanceTireTime = null; //To check tire distance response time from BLM
    //For J03
    this._cachedVehicleType = null;
    
    if (framework.debugMode)
    {
        utility.loadScript("apps/schedmaint/test/schedmaintAppTest.js");
    }
    
    
    /*******************Contexts data Lists *******************/
    this._MaintenanceListCtxtDataList =
    {
        itemCountKnown : true, 
        itemCount : 3, 
        items : [
                  { appData : "SelectScheduledMaintenance", text1Id : "scheduled", label1 :this._scheduleMaintenanceMode,hasCaret : true, itemStyle : "style06"},
                  { appData : "SelectTireRotation", text1Id : "tireRotation",label1 :this._tireMaintenanceMode,hasCaret : true, itemStyle : "style06"},
                  { appData : "SelectOilChange", text1Id : "oilChange",label1 :this._oilMaintenanceMode,hasCaret : true, itemStyle : "style06"}
                ]
    };
    
    this._schedmaintCtxtDataList =        // Data List for ScheduledMaintenanceDetail Context
    {
       itemCountKnown : true, 
       itemCount : 4, 
       items : [
                { appData : "SetSchedMaintOnOff", text1Id : "Setting", itemStyle : "styleOnOff",hasCaret : false, value :1},
                { appData: "SetTimeValue", itemStyle:'styleStep', text1Id:'scheduledDueIn', label1Id:'Time',label2:this._schedmaintTime ,label2Id: this._timeUnit, label2SubMap : {"value" : this._schedmaintTime}, hasCaret : false,value : this._schedmaintTime,min:1, max:36, increment : this._increamentScaleTime, styleMod : 'hint' },
                { appData: "SetDistanceValue" ,itemStyle:'styleStep', text1Id:'scheduledDueIn', label1Id:'Distance',label2:this._schedmaintDistance, label2Id:this._distanceUnit, label2SubMap : {"value" : this._schedmaintDistance}, hasCaret : false, value : this._schedmaintDistance,min:this._minIncreamentValue, max:this._maxIncreamentValue, increment:this._increamentScale, styleMod : 'hint' },
                { appData : "SelectReset", text1Id : "Reset",hasCaret : false, itemStyle : "style01" }
               ]
   };
    
    this._tireRotationCtxtDataList =        // Data List for TireRotationDetail Context
    {
        itemCountKnown : true, 
        itemCount : 3, 
        items : [
                    { appData : "SetTireRotationOnOff", text1Id : "Setting",itemStyle : "styleOnOff",hasCaret : false, value : 1 },
                    { appData:  "SetDistanceValue" ,itemStyle:'styleStep', text1Id:'scheduledDueIn', label1Id:'Distance',label2:this._tireRotationDistance, label2Id:this._distanceUnit, label2SubMap : {"value" : this._tireRotationDistance}, hasCaret : false, value : this._tireRotationDistance,min:this._minIncreamentValue, max:this._maxIncreamentValue, increment:this._increamentScale, styleMod : 'hint' },
                    { appData : "SelectReset", text1Id : "Reset",hasCaret : false, itemStyle : "style01" }
                ]
    };
    
    this._oilChangeCtxtDataList =        // Data List for OilChangeDetail Context
    {
            itemCountKnown : true, 
            itemCount : 3, 
            items : [
                     { appData:  "SelectSettingInterval" ,text1Id :  "settingInterval",label1Id : this._oilMaintenanceMode, itemStyle : 'style06',hasCaret : true,labelWidth:'wide'},
                     { appData:  "SetDistanceValue" ,itemStyle:'styleStep', text1Id:'scheduledDueIn', label1Id:'Distance',label2:this._oilMaintDistance, label2Id:this._distanceUnit, label2SubMap : {"value" : this._oilMaintDistance}, hasCaret : false, value : this._oilMaintDistance,min:this._minIncreamentValue, max:this._maxIncreamentValue, increment:this._increamentScale, styleMod : 'hint' },
                     { appData : "SelectReset", text1Id : "Reset",hasCaret : false, itemStyle : "style01" }
                    ]
    };
    this._settingIntervalCtxtDataList =
    {
             itemCountKnown : true, 
             itemCount : 3,
             items : [
                        { appData:"SetOilChange", itemStyle:'style03',  text1Id:'Flexible', image1:'radio', hasCaret:false },
                        { appData:"SetOilChange", itemStyle:'style03',  text1Id:'Fixed', image1:'radio', hasCaret:false },
                        { appData:"SetOilChange", itemStyle:'style03',  text1Id:'Off', image1:'radio', hasCaret:false }
                     ]
    };
    
    /**********************End Of Contexts data Lists*************/
    
    
    /**********************Contexts Table ************************/
    //@formatter:off
    this._contextTable = {
            "MaintenanceList" : {
                "template" : "List2Tmplt", 
                "leftBtnStyle" : "goBack",
                "sbNameId" : "Maintenance",
                "controlProperties" : {
                    "List2Ctrl" : {
                        "dataList" : this._MaintenanceListCtxtDataList,
                         selectCallback : this._listItemClickCallback.bind(this),     //Call back Function for MaintenanceList
                    } // end of properties for "List2Ctrl"
                }, // end of list of controlProperties
                "readyFunction": this._maintenanceListReadyToDisplay.bind(this),
           }, // end of "MaintenanceList Context"   
              
            "ScheduledMaintenanceDetail" : {
                "template" : "List2Tmplt", 
                "leftBtnStyle" : "goBack",
                "sbNameId" : "Maintenance",
                "controlProperties" : {
                    "List2Ctrl" : {
                        "dataList" : this._schedmaintCtxtDataList,
                        "titleConfiguration" : 'listTitle',
                         title : {
                             text1Id : "scheduled",
                             titleStyle : "style02"
                                 },
                        selectCallback : this._listItemClickCallback.bind(this),  //Call back Function for ScheduledMaintenanceDetail
                    } // end of properties for "List2Ctrl"
                }, // end of list of controlProperties
                "displayedFunction" : this._ScheduledMaintenanceDetailContextDisplayed.bind(this),
                 "readyFunction" : this._ScheduledMaintenanceDetailReadyToDisplay.bind(this)//schedule maintenance detail ready to display function
                
            }, // end of "ScheduledMaintenanceDetail"   
            
            "TireRotationDetail" : {
                "template" : "List2Tmplt",
                "leftBtnStyle" : "goBack",
                "sbNameId" : "Maintenance",
                "controlProperties" : {
                    "List2Ctrl" : {
                        "dataList" : this._tireRotationCtxtDataList,
                        "titleConfiguration" : 'listTitle',  
                         title : {
                            text1Id : "tireRotation",
                            titleStyle : "style02"
                                 },
                        selectCallback : this._listItemClickCallback.bind(this),  //Call back Function for TireRotationDetail
                    } // end of properties for "List2Ctrl"
                }, // end of list of controlProperties
                "displayedFunction" : this._TireRotationDetailContextDisplayed.bind(this),
                 "readyFunction" :this._TireRotationDetailReadyToDisplay.bind(this)   //Tire rotation detail ready to display function
                 
            }, // end of "TireRotationDetail" 
            
            "OilChangeDetail" : {
                "template" : "List2Tmplt",
                "leftBtnStyle" : "goBack",
                "sbNameId" : "Maintenance",
                "controlProperties" : {
                    "List2Ctrl" : {
                        "dataList" : this._oilChangeCtxtDataList, 
                        "titleConfiguration" : 'listTitle',  
                         title : {
                            text1Id : "oilChange",
                            titleStyle : "style02"
                                },
                        selectCallback : this._listItemClickCallback.bind(this),   //Call back Function for OilChangeDetail
                    } // end of properties for "List2Ctrl"
                }, // end of list of controlProperties 
                "displayedFunction" : this._OilChangeDetailContextDisplayed.bind(this),
                "readyFunction" : this._OilChangeDetailReadyToDisplay.bind(this) //Oil Change detail ready to display function
                
            }, // end of "OilChangeDetail" 
            
            "ConfirmReset" : { 
                "template" : "Dialog3Tmplt",
                "controlProperties": {
                    "Dialog3Ctrl" : {
                        "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),  //Call back Function for ConfirmReset
                        "contentStyle" : "style02",
                        "fullScreen" : false,
                        "buttonConfig" : {
                            "button1" : {    // Back Button Configuration 
                                buttonColor: "normal",
                                buttonBehavior : "shortPressOnly",
                                labelId: "Back",
                                appData : "Global.GoBack",
                                disabled : false
                             },
                            "button2" : {    // Reset Button Configuration
                                buttonColor: "normal",
                                buttonBehavior : "shortPressOnly",
                                labelId: "Reset",
                                appData : "Global.Yes",
                                disabled : false
                             },
                           }, // end of buttonConfig
                        } // end of properties for "Dialog3Ctrl"
                    }, 
                    
                    "readyFunction" : this._confirmResetReadyToDisplay.bind(this)//Oil Change detail ready to display function
                }, // end of "ConfirmReset"

                "ResetRetry" : {  
                    "template" : "Dialog3Tmplt",
                    "controlProperties": {
                        "Dialog3Ctrl" : {
                            "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),     // Call back function for ResetFail
                            "titleStyle" : "titleStyle01",
                            "titleId" : "resetFail",
                            "contentStyle" : "style02",
                            "fullScreen" : false,
                            "buttonConfig" : {
                                "button1" : {        // Back Button Configuration
                                    buttonColor: "normal",
                                    buttonBehavior : "shortPressOnly",
                                    labelId: "Cancel",
                                    appData : "Global.Cancel",
                                    disabled : false
                                 },
                                "button2" : {        // Retry Button Configuration
                                    buttonColor: "normal",
                                    buttonBehavior : "shortPressOnly",
                                    labelId: "Retry",
                                    appData : "SelectRetry",
                                    disabled : false
                                 },
                            }, // end of buttonConfig
                             "text1Id" : "tryAgain",
                          
                        } // end of properties for "Dialog3Ctrl"
                    }, // end of list of controlProperties
                }, // end of "ResetFail"
                  
                "ConfirmOff" : { 
                    "template" : "Dialog3Tmplt",
                    "controlProperties": {
                        "Dialog3Ctrl" : {
                            "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),//Call back function for ConfirmOff
                            "contentStyle" : "style02",
                            "fullScreen" : false,
                            "buttonConfig" : {
                                "button1" : {
                                    buttonColor: "normal",
                                    buttonBehavior : "shortPressOnly",
                                    labelId: "Back",
                                    appData : "Global.GoBack",
                                    disabled : false
                                },
                                "button2" : {
                                    buttonColor: "normal",
                                    buttonBehavior : "shortPressOnly",
                                    labelId: "turnOff",
                                    appData : "Global.Yes",
                                    disabled : false
                                },
                            }, // end of buttonConfig
                         } // end of properties for "Dialog3Ctrl"
                    }, // end of list of controlProperties
                  "readyFunction" : this._confirmOffReadyToDisplay.bind(this)//Oil Change detail ready to display function
                }, // end of "ConfirmOff"
                       
                "OilChangeFlexible" : { 
                    "template" : "Dialog3Tmplt",
                    "controlProperties": {
                        "Dialog3Ctrl" : {
                            "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),//Call back function for OilChangeAuto
                            "contentStyle" : "style02",
                            "fullScreen" : false,
                            "buttonConfig" : {
                                "button1" : {
                                    buttonColor: "normal",
                                    buttonBehavior : "shortPressOnly",
                                    labelId: "Back",
                                    appData : "Global.GoBack",
                                    disabled : false
                                },
                                "button2" : {
                                    buttonColor: "normal",
                                    buttonBehavior : "shortPressOnly",
                                    labelId: "OK",
                                    appData : "Global.Yes",
                                    disabled : false
                                },
                            }, // end of buttonConfig
                            "text1Id" : "flexibleOilChange",
                        } // end of properties for "Dialog3Ctrl"
                    }, // end of list of controlProperties
                }, // end of "OilChangeFlexible"
                
                "OffRetry" : { 
                    "template" : "Dialog3Tmplt",
                    "controlProperties": {
                        "Dialog3Ctrl" : {
                            "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),//Call back function for ConfirmOff
                            "contentStyle" : "style02",
                            "fullScreen" : false,
                            "titleStyle" : "titleStyle01",
                            "titleId" : "retryOff",
                            "buttonConfig" : {
                                "button1" : {
                                    buttonColor: "normal",
                                    buttonBehavior : "shortPressOnly",
                                    labelId: "Cancel",
                                    appData : "Global.Cancel",
                                    disabled : false
                                },
                                "button2" : {
                                    buttonColor: "normal",
                                    buttonBehavior : "shortPressOnly",
                                    labelId: "Retry",
                                    appData : "SelectRetry",
                                    disabled : false
                                },
                            }, // end of buttonConfig
                            "text1Id" : "tryAgain",
                        } // end of properties for "Dialog3Ctrl"
                    }, // end of list of controlProperties
                 }, // end of "OffRetry"
                 
                 "ConfirmFixed" : { 
                     "template" : "Dialog3Tmplt",
                     "controlProperties": {
                         "Dialog3Ctrl" : {
                             "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),//Call back function for ConfirmOff
                             "contentStyle" : "style02",
                             "fullScreen" : false,
                             "buttonConfig" : {
                                 "button1" : {
                                     buttonColor: "normal",
                                     buttonBehavior : "shortPressOnly",
                                     labelId: "Back",
                                     appData : "Global.GoBack",
                                     disabled : false
                                 },
                                 "button2" : {
                                     buttonColor: "normal",
                                     buttonBehavior : "shortPressOnly",
                                     labelId: "OK",
                                     appData : "Global.Yes",
                                     disabled : false
                                 },
                             }, // end of buttonConfig
                             "text1Id" : "fixedConfirm",
                         } // end of properties for "Style02Dialog"
                     }, // end of list of controlProperties
                 }, // end of "ConfirmFixed"
                 
                 "FixedRetry" : { 
                     "template" : "Dialog3Tmplt",
                     "controlProperties": {
                         "Dialog3Ctrl" : {
                             "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),//Call back function for ConfirmOff
                             "contentStyle" : "style02",
                             "titleStyle" : "titleStyle01",
                             "titleId" : "retryFixed",
                             "fullScreen" : false,
                             "buttonConfig" : {
                                 "button1" : {
                                     buttonColor: "normal",
                                     buttonBehavior : "shortPressOnly",
                                     labelId: "Cancel",
                                     appData : "Global.Cancel",
                                     disabled : false
                                 },
                                 "button2" : {
                                     buttonColor: "normal",
                                     buttonBehavior : "shortPressOnly",
                                     labelId: "Retry",
                                     appData : "SelectRetry",
                                     disabled : false
                                 },
                             }, // end of buttonConfig
                             "text1Id" : "tryAgain",
                         } // end of properties for "Style02Dialog"
                     }, // end of list of controlProperties
                  }, // end of "FixedRetry"
                  
                  "FlexibleRetry" : {
                      "template" : "Dialog3Tmplt",
                      "controlProperties": {
                          "Dialog3Ctrl" : {
                              "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),//Call back function for ConfirmOff
                              "contentStyle" : "style23",
                              "fullScreen" : false,
                              "buttonConfig" : {
                                  "button1" : {
                                      buttonColor: "normal",
                                      buttonBehavior : "shortPressOnly",
                                      labelId: "Cancel",
                                      appData : "Global.Cancel",
                                      disabled : false
                                  },
                                  "button2" : {
                                      buttonColor: "normal",
                                      buttonBehavior : "shortPressOnly",
                                      labelId: "Retry",
                                      appData : "SelectRetry",
                                      disabled : false
                                  },
                              }, // end of buttonConfig
                                     "text1Id" : "retryFlexible",
                                     "text2Id" : "tryAgain",
                              
                          } // end of properties for "Style02Dialog"
                      }, // end of list of controlProperties
                   }, // end of "FlexibleRetry"
                   
                   "SettingInterval" : {
                       "template" : "List2Tmplt",
                       "leftBtnStyle" : "goBack",
                       "sbNameId" : "Maintenance",
                       "controlProperties" : {
                           "List2Ctrl" : {
                               "dataList" : this._settingIntervalCtxtDataList,
                               "titleConfiguration" : 'listTitle',  
                                title : {
                                   text1Id : "settingInterval",
                                   titleStyle : "style02"
                                        },
                               selectCallback : this._listItemClickCallback.bind(this),  //Call back Function for TireRotationDetail
                           } // end of properties for "List2Ctrl"
                       }, // end of list of controlProperties
                        "readyFunction" :this._settingIntervalReadyToDisplay.bind(this)   //Tire rotation detail ready to display function
                        
                   }, // end of "TireRotationDetail" 
                   
             };// end of this.contextTable
    
    //@formatter:off
    
   /************End OF Contexts Table**********/
    
    //Message Table
    
     this._messageTable = {
      "OilLife" : this._oilLifeMSgHandler.bind(this),
      "SchMntSettingStatus" : this._schMntSettingStatusMSgHandler.bind(this),
      "SchedMaintDue" : this._schedMaintDueMSgHandler.bind(this),
      "OilMaintenanceDistanceChange" : this._oilMaintenanceDistanceChangeMSgHandler.bind(this),
      "SchedMaintDistRemaining" : this._schedMaintDistRemainingMSgHandler.bind(this),
      "TireRotationDistRemaining" : this._tireRotationDistRemainingMSgHandler.bind(this),
      "SchedMaintTimeRemaining" : this._schedMaintTimeRemainingMSgHandler.bind(this),
      "SchedMaintSetting" : this._schedMaintSettingMSgHandler.bind(this),
      "TireRotationSetting" : this._tireRotationSettingMSgHandler.bind(this),
      "OilMaintSetting" : this._oilMaintSettingMSgHandler.bind(this),
      "Global.AtSpeed" : this._AtSpeedMsgHandler.bind(this),
      "Global.NoSpeed" : this._NoSpeedMsgHandler.bind(this),
      "MaintenanceListData" : this._MaintenanceListDataMsgHandler.bind(this),
      "SettingMessage" : this._settingMessageHandler.bind(this),
      "OilChangeSettingDynamic" : this._oilChangeSettingDynamicMessageHandler.bind(this),
      //"BackFlag" : this._BackFlagMessageHandler.bind(this)
    };// end of messageTable

};
//End of appInit function

/******Ready to Display functions***********/

schedmaintApp.prototype._maintenanceListReadyToDisplay = function(params) //Ready to display function for maintenanceList Context
{
    //if(this._backFlag == false) //This condition checks the focus on MaintenanceList context.When App selected from Application menu then focus on first item required.
    //{
        if(params)
        {
            params.skipRestore = false; 
        //  this._backFlag = true;
        }   
    //}
    
    this._updateListTestCtrl(); //Function to populate Data List
    this._updateDataDueControl(); //If maintenance is due this function will add red color to fonts and add spanner icon in front of maintenance type
};

schedmaintApp.prototype._ScheduledMaintenanceDetailReadyToDisplay = function() //Ready to display function for ScheduledMaintenanceDetail Context
{
        this._cachedSpeed = framework.common.getAtSpeedValue();
        
        //For J03
        this._cachedVehicleType = framework.getSharedData("syssettings","VehicleType");
        
        //Setting Background of ScheduledMaintenanceDetail Context
        var currList = this._currentContextTemplate.list2Ctrl;
        
        if(this._cachedVehicleType == "SETTINGS_VehicleModelType_J03A" || this._cachedVehicleType == "SETTINGS_VehicleModelType_J03E")
            currList.setListBackground('apps/schedmaint/images/Maintenance_Schedule_J03A.png');
        else if(this._cachedVehicleType =="SETTINGS_VehicleModelType_J03K" || this._cachedVehicleType =="SETTINGS_VehicleModelType_J53")
            currList.setListBackground('apps/schedmaint/images/Maintenance_Schedule_SUV_J03K.png');
        else if(this._cachedVehicleType =="SETTINGS_VehicleModelType_J36" || this._cachedVehicleType =="SETTINGS_VehicleModelType_J71")
            currList.setListBackground('apps/schedmaint/images/Maintenance_Schedule_J7136.png');
        else if(this._cachedVehicleType =="SETTINGS_VehicleModelType_J12A")
            currList.setListBackground('apps/schedmaint/images/Maintenance_Schedule_J12A.png');
        else if(this._cachedVehicleType =="SETTINGS_VehicleModelType_J03G")
            currList.setListBackground(null);
        else
            currList.setListBackground('apps/schedmaint/images/List_CarNormal.png');
        this._currentRunningApp = "Scheduled Maintenance";
        this._updateScheduleMaintenanceCtrl(); //Helper function to set the maintenance data list.
};

//Displayed function to set default min value so that '-' sign is not displayed for values less than default value
schedmaintApp.prototype._ScheduledMaintenanceDetailContextDisplayed = function() 
{
    if(this._scheduleMaintenanceMode !== "Off")
    {
        if(this._distanceUnit === "MILE")
        {
            if(this._schedmaintDistance < 500)
            {
                this._schedmaintCtxtDataList.items[2].min = 500; //To disable "-" button less than or equal to 500 miles. 
            }
        }
        else if(this._distanceUnit === "KM")
        {
            if(this._schedmaintDistance < 1000)
            {
                this._schedmaintCtxtDataList.items[2].min = 1000; //To disable "-" button less than or equal to 1000 Km. 
            }
        }
    }
}

//Ready to display function for TireRotationDetail Context
schedmaintApp.prototype._TireRotationDetailReadyToDisplay = function() 
{
    this._cachedSpeed = framework.common.getAtSpeedValue();
    //For J03
    this._cachedVehicleType = framework.getSharedData("syssettings","VehicleType");
    
    //Setting Background of TireRotationDetail Context
    var currList = this._currentContextTemplate.list2Ctrl;
    if(this._cachedVehicleType == "SETTINGS_VehicleModelType_J03A" || this._cachedVehicleType == "SETTINGS_VehicleModelType_J03E")
        currList.setListBackground('apps/schedmaint/images/Maintenance_TireRotation_J03A.png');
    else if(this._cachedVehicleType =="SETTINGS_VehicleModelType_J03K" || this._cachedVehicleType =="SETTINGS_VehicleModelType_J53")
        currList.setListBackground('apps/schedmaint/images/Maintenance_TireRotation_SUV_J03K.png');
    else if(this._cachedVehicleType =="SETTINGS_VehicleModelType_J36" || this._cachedVehicleType =="SETTINGS_VehicleModelType_J71")
        currList.setListBackground('apps/schedmaint/images/Maintenance_TireRotation_J7136.png');
    else if(this._cachedVehicleType =="SETTINGS_VehicleModelType_J12A")
        currList.setListBackground('apps/schedmaint/images/Maintenance_TireRotation_J12A.png');
    else if(this._cachedVehicleType =="SETTINGS_VehicleModelType_J03G")
            currList.setListBackground(null);
    else
        currList.setListBackground('apps/schedmaint/images/List_TireRotation.png');
    
    this._currentRunningApp = "Tire Rotation";
    this._updateTireMaintenanceCtrl(); //helper function to populate the tire rotation data list
};

//Displayed function to set default min value so that '-' sign is not displayed for values less than default value
schedmaintApp.prototype._TireRotationDetailContextDisplayed = function() 
{
    if(this._tireMaintenanceMode !== "Off")
    {
        if(this._distanceUnit === "MILE")
        {
            if(this._tireRotationDistance < 500)
            {
                this._tireRotationCtxtDataList.items[1].min = 500; //To disable "-" button less than or equal to 500 miles. 
            }
        }
        else if(this._distanceUnit === "KM")
        {
            if(this._tireRotationDistance < 1000)
            {
                this._tireRotationCtxtDataList.items[1].min = 1000; //To disable "-" button less than or equal to 1000 Km. 
            }
        }
    }
}


//Ready to display function for OilChangeDetail Context
schedmaintApp.prototype._OilChangeDetailReadyToDisplay = function() 
{
    this._cachedSpeed = framework.common.getAtSpeedValue();
    //For J03
    this._cachedVehicleType = framework.getSharedData("syssettings","VehicleType");
    
    //Setting Background of OilChangeDetail Context
    var currList = this._currentContextTemplate.list2Ctrl;
    
    if(this._cachedVehicleType == "SETTINGS_VehicleModelType_J03A" || this._cachedVehicleType == "SETTINGS_VehicleModelType_J03E")
        currList.setListBackground('apps/schedmaint/images/Maintenance_Oil_J03A.png');
    else if(this._cachedVehicleType =="SETTINGS_VehicleModelType_J03K" || this._cachedVehicleType =="SETTINGS_VehicleModelType_J53")
        currList.setListBackground('apps/schedmaint/images/Maintenance_Oil_SUV_J03K.png');
    else if(this._cachedVehicleType =="SETTINGS_VehicleModelType_J36" || this._cachedVehicleType =="SETTINGS_VehicleModelType_J71")
        currList.setListBackground('apps/schedmaint/images/Maintenance_Oil_J7136.png');  
    else if(this._cachedVehicleType =="SETTINGS_VehicleModelType_J12A")
        currList.setListBackground('apps/schedmaint/images/Maintenance_Oil_J12A.png');
    else if(this._cachedVehicleType =="SETTINGS_VehicleModelType_J03G")
            currList.setListBackground(null);
    else
        currList.setListBackground('apps/schedmaint/images/ListBackground_CarEngine.png');
    this._currentRunningApp = "Oil Change";
    this._updateOilMaintenanceCtrl();
};

//Displayed function to set default min value so that '-' sign is not displayed for values less than default value
schedmaintApp.prototype._OilChangeDetailContextDisplayed = function() 
{
    if(this._oilMaintenanceMode !== "Off")
    {
        if(this._distanceUnit === "MILE")
        {
            if(this._oilMaintDistance < 500)
            {
                this._oilChangeCtxtDataList.items[1].min = 500; //To disable "-" button less than or equal to 500 miles. 
            }
        }
        else if(this._distanceUnit === "KM")
        {
            if(this._oilMaintDistance < 1000)
            {
                this._oilChangeCtxtDataList.items[1].min = 1000; //To disable "-" button less than or equal to 1000 Km. 
            }
    
        }
    }
    
}

//Ready to display function for Confirm Off Context
schedmaintApp.prototype._confirmOffReadyToDisplay = function()
{
    if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "ConfirmOff")
    {
        this._updateOffMessageCtrl();
    }
};

//Ready to display function for Confirm Reset Context
schedmaintApp.prototype._confirmResetReadyToDisplay = function()
{
    if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "ConfirmReset")
    {
        this._updateResetMessageCtrl();
    }
};

//Ready to display function for SettingInterval Context
schedmaintApp.prototype._settingIntervalReadyToDisplay = function()
{
       this._cachedSpeed = framework.common.getAtSpeedValue();
       //For J03
       this._cachedVehicleType = framework.getSharedData("syssettings","VehicleType");
    
       //Setting Background of OilChangeDetail Context
       var currList = this._currentContextTemplate.list2Ctrl;
        if(this._cachedVehicleType =="SETTINGS_VehicleModelType_J03A" || this._cachedVehicleType =="SETTINGS_VehicleModelType_J03E")
            currList.setListBackground('apps/schedmaint/images/Maintenance_Oil_J03A.png');
        else if(this._cachedVehicleType =="SETTINGS_VehicleModelType_J03K"|| this._cachedVehicleType =="SETTINGS_VehicleModelType_J53")
            currList.setListBackground('apps/schedmaint/images/Maintenance_Oil_SUV_J03K.png');
        else if(this._cachedVehicleType =="SETTINGS_VehicleModelType_J36" || this._cachedVehicleType =="SETTINGS_VehicleModelType_J71")
            currList.setListBackground('apps/schedmaint/images/Maintenance_Oil_J7136.png');  
        else if(this._cachedVehicleType =="SETTINGS_VehicleModelType_J12A")
            currList.setListBackground('apps/schedmaint/images/Maintenance_Oil_J12A.png');
        else if(this._cachedVehicleType =="SETTINGS_VehicleModelType_J03G")
            currList.setListBackground(null);
        else
            currList.setListBackground('apps/schedmaint/images/ListBackground_CarEngine.png');
        
       this._updateSettingIntervalTestCtrl();
};

/******End of Ready to Display functions***********/

/**************************
 * Message handlers
 **************************/
//OilLife
schedmaintApp.prototype._oilLifeMSgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload)
    {
        this._oilDeteriorationLevel = msg.params.payload.oillife;
        
        if(this._oilLifeValue !== this._oilDeteriorationLevel+" %") //Condition test to update oil value  when it is not changed
        {
            this._updateOilValue = true; 
        }
        else if(this._oilLifeValue === this._oilDeteriorationLevel+" %") //Condition test to update oil value only when it is changed
        {
            this._updateOilValue = false; 
        }
        
        if( this._oilDeteriorationLevel > 100 || this._oilDeteriorationLevel < 0)
        {
           this._oilLifeValue = "--%";
        }
        else if(this._oilDeteriorationLevel <= 100 && this._oilDeteriorationLevel >= 0)
        {
            this._oilLifeValue = this._oilDeteriorationLevel+" %";
        }
        log.debug("in _oilLifeMSgHandler and this._oilDeteriorationLevel "+this._oilDeteriorationLevel);
        if (this._currentContextTemplate && this._currentContext && (this._currentContext.ctxtId === "MaintenanceList" || this._currentContext.ctxtId === "OilChangeDetail"))
        {
            this._updateDataOilLifeCtrl();
        }
    }
};
// SchMntSettingStatus 
schedmaintApp.prototype._schMntSettingStatusMSgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload)
    {
       this._schMntSetting = msg.params.payload.schmntsettingstatus;
       if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "ScheduledMaintenanceDetail")
       {
           this._updateScheduleMaintenanceCtrl();
       } 
    }
};

//SchedMaintDue
schedmaintApp.prototype._schedMaintDueMSgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.schedmaintdue)
    {
        this._schedmaintDueData = msg.params.payload.schedmaintdue.VWM_ScheduleMaintDue;
        this._dueStatus = msg.params.payload.schedmaintdue.status;
        
        log.debug("In _schedMaintDueMSgHandler and this._schedmaintDueData "+this._schedmaintDueData +" and status is "+ this._dueStatus);
        
        if(this._schedmaintDueData == 0) //Condition check when schedmaint time is due
        {
            if(this._dueStatus)
            {
                 this._schedmaintDue = "true";
                 this._schedmaintTimeDue = true;
            }
            else
            {
                 this._schedmaintDue = "false";
                 this._schedmaintTimeDue = false;
            }   
        }
        else if(this._schedmaintDueData == 1) //Condition check when schedmaint distance is due
        {
            if(this._dueStatus)
            {
                 this._schedmaintDue = "true";
                 this._schedmaintDistanceDue = true;
            }
            else
            {
                 this._schedmaintDue = "false";
                 this._schedmaintDistanceDue = false;
            }   
        }
        else if(this._schedmaintDueData == 2) //Condition check when tire rotation distance is due
        {
            if(this._dueStatus)
            {
                 this._tiremaintDue = "true";
            }
            else
            {
                 this._tiremaintDue = "false";
            }   
        }
        else if(this._schedmaintDueData == 3) //Condition check when oil maintenance distance is due
        {
            if(this._dueStatus)
            {
                 this._oilmaintDue = "true";
                 this._oilDistanceDue = true;
            }
            else
            {
                 this._oilmaintDue = "false";
                 this._oilDistanceDue = false;
            }   
        }
        else if(this._schedmaintDueData == 4) //Condition check when oil life is due
        {
            if(this._dueStatus)
            {
                 this._oilmaintDue = "true";
                 this._oilLifeDue = true;
            }
            else
            {
                 this._oilmaintDue = "false";
                 this._oilLifeDue = false;
            }   
        }
        
        if (this._currentContextTemplate && this._currentContext)
        {
            if (this._currentContext.ctxtId === "OilChangeDetail")
            {               
				if(this._oilmaintDue !== null)
				{
				 this._titleCheck(); //To set the title of tire maintenance
				}
				if(this._oilMaintenanceMode !== "Off")
				{
					if(this._oilmaintDue === "true") //Condition check for making label font color red when maintenance due
					{
						if(this._country !== "Japan")
						{
							if(this._oilMaintenanceMode === "Flexible" && this._oilLifeDue)
							{
								this._oilChangeCtxtDataList.items[1].label1Warning = true;
							}
							if(this._oilMaintenanceMode === "Fixed" && this._oilDistanceDue)
							{
								this._oilChangeCtxtDataList.items[1].warning = true;
							}
						}
						else
						{
							if(this._oilDistanceDue && (this._oilMaintenanceMode === "Fixed" || this._oilMaintenanceMode === "On"))
							{
								this._oilChangeCtxtDataList.items[1].warning = true;
							}   
						}   
					}
					this._currentContextTemplate.list2Ctrl.updateItems(1, 1);				
				}				
            }
            else if (this._currentContext.ctxtId === "MaintenanceList")
            {
                this._updateDataDueControl(); //Helper function for MaintenanceList Context
            }
            else if (this._currentContext.ctxtId === "ScheduledMaintenanceDetail")
            {               
				if(this._schedmaintDue !== null)
				{
					this._titleCheck(); //this function set the title when maintenance is due or not due
				}
				if(this._scheduleMaintenanceMode !== "Off")
				{
					if(this._schedmaintTimeDue) //Condition check for making time label font color red when maintenance due
					{
						this._schedmaintCtxtDataList.items[1].warning = true;	
						this._currentContextTemplate.list2Ctrl.updateItems(1, 1);
					}
					if(this._schedmaintDistanceDue && this._country !== "Japan" ) //Condition check for making distance label font color red when maintenance due
					{
						this._schedmaintCtxtDataList.items[2].warning = true;
						this._currentContextTemplate.list2Ctrl.updateItems(2, 2);
					}				
				}								
            }
            else if (this._currentContext.ctxtId === "TireRotationDetail")
            {               
				if(this._tiremaintDue !== null)
				{
					this._titleCheck(); //To set the title of tire maintenance
				}
				if(this._tireMaintenanceMode == "On")
				{
					if(this._tiremaintDue === "true") //condition check to add font color red when maintenance is due.
					{
						this._tireRotationCtxtDataList.items[1].warning = true;
					}	
					this._currentContextTemplate.list2Ctrl.updateItems(1, 1);				
				}				
            }
        }
    }
};

//OilMaintenanceDistanceChange
schedmaintApp.prototype._oilMaintenanceDistanceChangeMSgHandler = function(msg)
{
    var incrementScaleDistance = 0;
    var date = new Date();
    this._timerOilDistanceResponse = date.getTime();
    this._responseDistanceOilTime = this._timerOilDistanceResponse - this._timerOilDistanceRequest;
    
    if(msg && msg.params && msg.params.payload)
    {

        this._oilMaintDistance = msg.params.payload.distance.Distance;
        this._distanceUnit = msg.params.payload.distance.Unit;
        incrementScaleDistance = this._incrementScaleDistance(this._oilMaintDistance); //This function will return the distance increment factor
        if(this._distanceUnit === "KM")  //To define the min/max value and increment factor according to unit KM.
        {
              this._minIncreamentValue = 1000;
              this._maxIncreamentValue = 99500;
              if(this._oilMaintDistance < 1000)
              {
                this._increamentScale = 1000 - this._oilMaintDistance;
              }
              else
              { 
                this._increamentScale = incrementScaleDistance;
              } 
        }
        else if(this._distanceUnit === "MILE") //To define the min/max value and increment factor according to unit MILE.
        {
            this._minIncreamentValue = 500;
            this._maxIncreamentValue = 99750;
            this._increamentScale = 250;
            
            if(this._oilMaintDistance < 500)
            {
                this._increamentScale = 500 - this._oilMaintDistance;
            }
            else
            {   
                this._increamentScale = incrementScaleDistance;
            }  
        }
        
        log.debug(" In _oilMaintenanceDistanceChangeMSgHandler and this._oilMaintDistance "+this._oilMaintDistance);
        if (this._currentContextTemplate && this._currentContext && (this._currentContext.ctxtId === "MaintenanceList" || this._currentContext.ctxtId === "OilChangeDetail" ))
        {
            this._updateDataOilDistanceCtrl();//Helper function to update the oil maintenance distance
        }
    }
};

//SchedMaintDistRemaining
schedmaintApp.prototype._schedMaintDistRemainingMSgHandler = function(msg)
{   
    var incrementScaleDistance = 0;
    var date = new Date();
    this._timerDistanceResponse = date.getTime(); //time in millisecond when message for distance change
    this._responseDistanceTime = this._timerDistanceResponse - this._timerDistanceRequest; //time difference between request for distance change from GUI and response from BLM occurs.
    
    if(msg && msg.params && msg.params.payload)
    {
        this._schedmaintDistance = msg.params.payload.schedmaintdistance.Distance;
        this._distanceUnit = msg.params.payload.schedmaintdistance.Unit;
        
        incrementScaleDistance = this._incrementScaleDistance(this._schedmaintDistance); //This function will return the distance increment factor
        if(this._distanceUnit === "KM")  //To define the min/max value and increment factor according to unit KM.
        {
              this._minIncreamentValue = 1000;
              this._maxIncreamentValue = 99500;
              if(this._schedmaintDistance < 1000)
              {
                this._increamentScale = 1000 - this._schedmaintDistance;
              }
              else
              { 
                this._increamentScale = incrementScaleDistance;
              } 
        }
        else if(this._distanceUnit === "MILE") //To define the min/max value and increment factor according to unit MILE.
        {
            this._minIncreamentValue = 500;
            this._maxIncreamentValue = 99750;
            if(this._schedmaintDistance < 500)
            {
                this._increamentScale = 500 - this._schedmaintDistance;
            }
            else
            {   
                this._increamentScale = incrementScaleDistance;
            }  
        }
        log.debug("In _schedMaintDistRemainingMSgHandler and this._schedmaintDistance "+this._schedmaintDistance);
        if (this._currentContextTemplate && this._currentContext && (this._currentContext.ctxtId === "ScheduledMaintenanceDetail" || this._currentContext.ctxtId === "MaintenanceList" ))
        {
            this._updateDataDistanceCtrl(); //Helper function to update the schedule maintenance distance
        }
    }
};

//TireRotationDistRemaining
schedmaintApp.prototype._tireRotationDistRemainingMSgHandler = function(msg)
{
    var incrementScaleDistance = 0;
    var date = new Date();
    this._timerTireDistanceResponse = date.getTime(); //time in millisecond when message for distance change
    this._responseDistanceTireTime = this._timerTireDistanceResponse - this._timerTireDistanceRequest; //time difference between request for distance change from GUI and response from BLM occurs.
    
    if(msg && msg.params && msg.params.payload)
    {
        this._tireRotationDistance = msg.params.payload.tirerotationdistance.Distance;
        this._distanceUnit = msg.params.payload.tirerotationdistance.Unit;
        incrementScaleDistance = this._incrementScaleDistance(this._tireRotationDistance); //This function will return the distance increment factor
        if(this._distanceUnit === "KM")  //To define the min/max value and increment factor according to unit KM.
        {
              this._minIncreamentValue = 1000;
              this._maxIncreamentValue = 99500;
              if(this._tireRotationDistance < 1000)
              {
                 this._increamentScale = 1000 - this._tireRotationDistance;
              }
              else
              { 
                 this._increamentScale = incrementScaleDistance;
              } 
        }
        else if(this._distanceUnit === "MILE") //To define the min/max value and increment factor according to unit MILE.
        {
              this._minIncreamentValue = 500;
              this._maxIncreamentValue = 99750;
              this._increamentScale = 250;
                
              if(this._tireRotationDistance < 500)
              {
                 this._increamentScale = 500 - this._tireRotationDistance;
              }
              else
              { 
                 this._increamentScale = incrementScaleDistance;
              }  
        }
        
        log.debug("In _tireRotationDistRemainingMSgHandler and this._tireRotationDistance "+this._tireRotationDistance);
        if (this._currentContextTemplate && this._currentContext && (this._currentContext.ctxtId === "TireRotationDetail" || this._currentContext.ctxtId === "MaintenanceList" ))
        {
            this._updateDataTireDistanceCtrl(); //Helper function to update the tire maintenance distance
        }
       
    }
};

//SchedMaintTimeRemaining
schedmaintApp.prototype._schedMaintTimeRemainingMSgHandler = function(msg)
{
        var date = new Date();
        this._timerTimeResponse = date.getTime();
        this._responseTime = this._timerTimeResponse - this._timerTimeRequest;
        
        if(msg && msg.params && msg.params.payload)
        {
            this._schedmaintDuration = msg.params.payload.schedmaintTime;
            if(this._schedmaintDuration < 30) //To define the increment factor when time is less than or equal to 30 days.
            {
                this._increamentScaleTime = 30 - this._schedmaintDuration;
            }
            
            else if(this._schedmaintDuration >= 30) //To define the increment factor when time is less than or equal to 30 days.
            {
               this._increamentScaleTime = 1;   
            }
            log.debug(" In _schedMaintTimeRemainingMSgHandler and this._schedmaintDuration "+this._schedmaintDuration);
            if (this._currentContextTemplate && this._currentContext && (this._currentContext.ctxtId === "ScheduledMaintenanceDetail" || this._currentContext.ctxtId === "MaintenanceList" ))
            {
                this._updateDataTimeCtrl(); //Helper function to update the schedule maintenance time
            }
        }
};

//MaintenanceListData
schedmaintApp.prototype._MaintenanceListDataMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.MaintenanceList)
    {
         this._maintenanceListData = msg.params.payload.MaintenanceList;
         if(this._maintenanceListData != null)
         {    
             this._initializeMaintenanceList();
         }   
         if (this._currentContextTemplate && this._currentContext && (this._currentContext.ctxtId === "MaintenanceList"))
         {
             this._updateListTestCtrl();
         }
    }
};

//SchedMaintSetting   
schedmaintApp.prototype._schedMaintSettingMSgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.schedmaintsetting )
    {
        this._schedMaintSetting = msg.params.payload;
        this._scheduleMaintenanceMode = this._schedMaintSetting.schedmaintsetting;
        
        log.debug("In _schedMaintSettingMSgHandler and this._scheduleMaintenanceMode "+this._scheduleMaintenanceMode);
        if(this._currentContextTemplate && this._currentContext)
        {
            if (this._currentContext.ctxtId === "ScheduledMaintenanceDetail")
            {
                this._updateScheduleMaintenanceCtrl(); //Helper function to update the schedule maintenance setting when context is ScheduledMaintenanceDetail
            }
            else if (this._currentContext.ctxtId === "MaintenanceList" )
            {
                this._updateListTestCtrl(); //Helper function to update the schedule maintenance setting when context is MaintenanceList
            }
        }   
    }
};

//TireRotationSetting   
schedmaintApp.prototype._tireRotationSettingMSgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.tirerotationsetting)
    {
        this._tireMaintenanceMode = msg.params.payload.tirerotationsetting;
        log.debug(" In _tireRotationSettingMSgHandler and this._tireMaintenanceMode "+this._tireMaintenanceMode);
        if(this._currentContextTemplate && this._currentContext)
        {
            if (this._currentContext.ctxtId === "TireRotationDetail")
            {
                this._updateTireMaintenanceCtrl(); //Helper function to update the tire maintenance setting when context is TireRotationDetail
            }
            else if (this._currentContext.ctxtId === "MaintenanceList" )
            {
                this._updateListTestCtrl(); //Helper function to update the tire maintenance setting when context is MaintenanceList
            }
        }   
        
    }
};

//OilMaintSetting    
schedmaintApp.prototype._oilMaintSettingMSgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.oilmaintsetting)
    {
        this._oilMaintSetting = msg.params.payload;
        this._oilMaintenanceMode = this._oilMaintSetting.oilmaintsetting;
        
        log.debug("In _oilMaintSettingMSgHandler and this._oilMaintenanceMode "+this._oilMaintenanceMode);
        if(this._currentContextTemplate && this._currentContext)
        {
            if (this._currentContext.ctxtId === "SettingInterval")
            {
                this._updateSettingIntervalTestCtrl(); //Helper function to update the oil maintenance setting when context is SettingInterval
            }
            else if (this._currentContext.ctxtId === "MaintenanceList")
            {
                this._updateListTestCtrl(); //Helper function to update the oil maintenance setting when context is MaintenanceList
            }
            else if(this._currentContext.ctxtId === "OilChangeDetail")
            {
                this._updateOilMaintenanceCtrl(); //Helper function to update the oil maintenance setting when context is OilChangeDetail
            }
        }   
        
    }
};

schedmaintApp.prototype._AtSpeedMsgHandler = function()
{
    this._cachedSpeed = true;
    if (this._currentContextTemplate && this._currentContext && (this._currentContext.ctxtId === "ScheduledMaintenanceDetail" ||this._currentContext.ctxtId === "TireRotationDetail"||this._currentContext.ctxtId === "OilChangeDetail" ||this._currentContext.ctxtId === "SettingInterval"))
    {
        this._setDataListSpeed();
    }  
};

schedmaintApp.prototype._NoSpeedMsgHandler = function()
{
    this._cachedSpeed = false;
    if (this._currentContextTemplate && this._currentContext && (this._currentContext.ctxtId === "ScheduledMaintenanceDetail" ||this._currentContext.ctxtId === "TireRotationDetail"||this._currentContext.ctxtId === "OilChangeDetail" ||this._currentContext.ctxtId === "SettingInterval"))
    {
        this._setDataListSpeed();
    }
};

//SettingMessage
schedmaintApp.prototype._settingMessageHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.settingmessage)
    {
        this._scheduleMaintenanceMode = msg.params.payload.settingmessage.SMSetting;
        this._tireMaintenanceMode = msg.params.payload.settingmessage.TRSetting;
        this._oilMaintenanceMode = msg.params.payload.settingmessage.OilSetting;
        
        if(this._currentContextTemplate && this._currentContext)
        {
            if (this._currentContext.ctxtId === "SettingInterval" )
            {
               this._updateSettingIntervalTestCtrl(); //Helper function to update the oil maintenance setting when context is SettingInterval
            }
            else if (this._currentContext.ctxtId === "MaintenanceList")
            {
                this._updateSettingControl(); //Helper function to update the all maintenance setting when context is MaintenanceList
            }
            else if (this._currentContext.ctxtId === "ScheduledMaintenanceDetail")
            {
                this._updateScheduleMaintenanceCtrl(); //Helper function to update the schedule maintenance setting when context is ScheduledMaintenanceDetail
            }
            else if (this._currentContext.ctxtId === "TireRotationDetail")
            {
                this._updateTireMaintenanceCtrl(); //Helper function to update the tire maintenance setting when context is TireRotationDetail
            }
            else if (this._currentContext.ctxtId === "OilChangeDetail" )
            {
               this._updateOilMaintenanceCtrl(); //Helper function to update the oil maintenance setting when context is OilChangeDetail
            }
        }
    }
};

//OilChangeSettingDynamic
schedmaintApp.prototype._oilChangeSettingDynamicMessageHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.oilchangesettingdynamic)
    {
        this._oilMaintenanceModeCountry = msg.params.payload.oilchangesettingdynamic;
        log.info("In _oilChangeSettingDynamicMessageHandler and Oil setting is "+this._oilMaintenanceModeCountry);
        
        this._selectCountry(); //This function select the country condition or oil setting condition accordind to mode received
        
        if (this._currentContextTemplate && this._currentContext)
        {
            if (this._currentContext.ctxtId === "SettingInterval")
            {
                this._updateSettingIntervalTestCtrl(); //The helper function update the oil setting on settingInterval context as Auto_Only/Manual_Only so on 
            }
            else if (this._currentContext.ctxtId === "OilChangeDetail")
            {
                this._updateOilMaintenanceCtrl(); //The helper function update the oil setting on OilChangeDetail context as Auto_Only/Manual_Only so on 
            }
        }
    }
};

//BackFlag
//schedmaintApp.prototype._BackFlagMessageHandler = function(msg) //This message handler sets the focus on MaintenanceList context
//{
  //  if(msg && msg.params && msg.params.payload)
    //{
    //  this._backFlag = msg.params.payload.backflag;
    //}
//};

//End Of Message handlers

/**************************
 * Helper functions
 **************************/

schedmaintApp.prototype._setDataListSpeed = function() // Helper function to disable or enable the data list during AtSpeed and NoSpeed condition
{
    if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "ScheduledMaintenanceDetail")
    {
        for(var dataListCount = 0; dataListCount < this._schedmaintCtxtDataList.itemCount; dataListCount++ )
        {
            this._schedmaintCtxtDataList.items[dataListCount].disabled = this._cachedSpeed;
        }
        this._currentContextTemplate.list2Ctrl.updateItems(0, this._schedmaintCtxtDataList.itemCount - 1);
    }    
    else if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "TireRotationDetail")
    {
        for(var dataListCount = 0; dataListCount < this._tireRotationCtxtDataList.itemCount; dataListCount++ )
        {
            this._tireRotationCtxtDataList.items[dataListCount].disabled = this._cachedSpeed;
        }
        this._currentContextTemplate.list2Ctrl.updateItems(0, this._tireRotationCtxtDataList.itemCount - 1);
    }  
    else if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "OilChangeDetail")
    {
        for(var dataListCount = 0; dataListCount < this._oilChangeCtxtDataList.itemCount; dataListCount++ )
        {
            this._oilChangeCtxtDataList.items[dataListCount].disabled = this._cachedSpeed;
        }
        this._currentContextTemplate.list2Ctrl.updateItems(0, this._oilChangeCtxtDataList.itemCount - 1);
    }
    else if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "SettingInterval")
    {
        for(var dataListCount = 0; dataListCount < this._settingIntervalCtxtDataList.itemCount; dataListCount++ )
        {
            if(this._cachedSpeed) //If vehicle is at AtSpeed condition then all option should be disabled
            {
                this._settingIntervalCtxtDataList.items[dataListCount].disabled = this._cachedSpeed;
            }
            else //If vehicle is at NoSpeed condition then check for oil settings to enable only perticular items.
            {
                if(this._flexibleDisabled) //If flexible option is disabled because of oil setting Auto_disabledAndManual
                {
                    if(dataListCount == 0)
                    {
                        this._settingIntervalCtxtDataList.items[dataListCount].disabled = true;
                    }
                    else
                    {
                            this._settingIntervalCtxtDataList.items[dataListCount].disabled = this._cachedSpeed;
                    }   
                }
                else if(this._allDisabled) //If all options are disabled because of oil setting All_disabled
                {
                    this._settingIntervalCtxtDataList.items[dataListCount].disabled = true;
                }
                else //If not above two conditions
                {
                    this._settingIntervalCtxtDataList.items[dataListCount].disabled = this._cachedSpeed;
                }   
            }   
        }
        this._currentContextTemplate.list2Ctrl.updateItems(0, this._settingIntervalCtxtDataList.itemCount - 1);
    } 
};

schedmaintApp.prototype._setTimeData = function() // Helper function to set the time value with time units
{
    this._schedmaintTime = Math.ceil(this._schedmaintDuration/30);    //To convert Schedule Maintenance time in Months
    if(this._schedmaintTime > 36)
    {
      this._schedmaintTime = 36;
    }
    if(this._schedmaintTime > 1)
    {
        this._timeUnit = "months";
    }
    else if(this._schedmaintTime == 1)
    {
        this._schedmaintTime = this._schedmaintDuration;
        this._timeUnit = "days";
    }
    if(this._schedmaintDuration <= 1)
    {
       this._schedmaintTime = this._schedmaintDuration;
       this._timeUnit = "day";
    }
};

schedmaintApp.prototype._selectCountry = function() //Function to set different regions and Oil settings
{
    if(this._distanceDisplayFlag == true || this._distanceDisplayFlag === "True")
    {
        if(this._oilMaintenanceModeCountry === "AutoAndManual")
        {
             this._country = "US";
             this._oilSettingShow = "All";
             this._allDisabled = false;
             this._flexibleDisabled = false;
        }
        else if(this._oilMaintenanceModeCountry === "Auto_Only")
        {
             this._country = "EU";
             this._allDisabled = false;
             this._flexibleDisabled = false;
        }
        else if(this._oilMaintenanceModeCountry === "Manual_Only")
        {
             this._country = "US";
             this._oilSettingShow = "OnOff";
             this._allDisabled = false;
             this._flexibleDisabled = false;
        }
        else if(this._oilMaintenanceModeCountry === "Auto_disabledAndManual")
        {
             this._country = "US";
             this._flexibleDisabled = true;
             this._allDisabled = false;
        }
        else if(this._oilMaintenanceModeCountry === "All_disabled")
        {
             this._country = "US";
             this._allDisabled = true;
             this._flexibleDisabled = false;
        }
        else
        {
             this._country = "US";
             this._oilSettingShow = "All";
             this._allDisabled = false;
             this._flexibleDisabled = false;
        }   
    }   
    else if(this._distanceDisplayFlag == false || this._distanceDisplayFlag === "False")
    {
        this._country = "Japan"; 
    }
    else
    {
        log.debug("No Country condition found");
    }   
    log.info("Disp_distance "+this._distanceDisplayFlag + " and Oil_setting_disp "+this._oilMaintenanceModeCountry);
};

schedmaintApp.prototype._setDueList = function() //This function adds spanner icon when in front of titlen when maintenance is due
{
    if(this._schedmaintDue != null) //When schedmaint due is either true or false
    {
        if(this._schedmaintDue === "true" && this._scheduleMaintenanceMode !== "Off") //When Schedule maintenanace is due
        {
            if(this._country === "Japan")
            {
                if(this._schedmaintTimeDue)
                {
                    this._MaintenanceListCtxtDataList.items[0].image1 = "apps/schedmaint/images/Icn_Warning_75.png";
                }   
            }
            else
            {
                this._MaintenanceListCtxtDataList.items[0].image1 = "apps/schedmaint/images/Icn_Warning_75.png";
            }   
        }
        else if(this._schedmaintDue === "false") //When Schedule maintenanace is not due
        {
            if(this._country === "Japan")
            {
                if(!this._schedmaintTimeDue)
                {
                    this._MaintenanceListCtxtDataList.items[0].image1 = "";
                }   
            }
            else
            {
                this._MaintenanceListCtxtDataList.items[0].image1 = "";
            }
        }
    }   
    
    if(this._tiremaintDue != null) //When tiremaint due is either true or false
    {
        if(this._tiremaintDue === "true" && this._tireMaintenanceMode !== "Off") //When Tire Maintenance is due
        {
            if(this._country !== "Japan")
            {
                this._MaintenanceListCtxtDataList.items[1].image1 = "apps/schedmaint/images/Icn_Warning_75.png";
            }   
        }
        else if(this._tiremaintDue === "false") //When Tire Maintenance is not due
        {
            if(this._country !== "Japan")
            {
                this._MaintenanceListCtxtDataList.items[1].image1 = "";
            }   
        }
    }   
    
    if(this._oilmaintDue != null) //When tiremaint due is either true or false
    {
        if(this._oilmaintDue === "true" && this._oilMaintenanceMode !== "Off") //When oil maintenanace is due
        {
             if(this._country === "Japan")
             {
                  if(this._oilDistanceDue) //When oil Maintenanace Distance due is true
                  {
                     this._MaintenanceListCtxtDataList.items[1].image1 = "apps/schedmaint/images/Icn_Warning_75.png"; 
                  } 
             }  
             else
             {
                 if(this._oilMaintenanceMode === "Fixed" && this._oilDistanceDue)
                 {
                     this._MaintenanceListCtxtDataList.items[2].image1 = "apps/schedmaint/images/Icn_Warning_75.png";
                 }
                 else if(this._oilMaintenanceMode === "Flexible" && this._oilLifeDue)
                 {
                     this._MaintenanceListCtxtDataList.items[2].image1 = "apps/schedmaint/images/Icn_Warning_75.png";
                 }
             }
        }
        if(this._oilmaintDue === "false") ////When Oil Maintenance is not due
        {
             if(this._country === "Japan")
             {
                 if(!this._oilDistanceDue) //When oil Maintenanace Distance due is false in japan condition
                 { 
                     this._MaintenanceListCtxtDataList.items[1].image1 = ""; 
                 }   
             }
             else
             {
                 if(this._oilMaintenanceMode === "Fixed" && (!this._oilDistanceDue))
                 {
                     this._MaintenanceListCtxtDataList.items[2].image1 = "";
                 }
                 else if(this._oilMaintenanceMode === "Flexible" && (!this._oilLifeDue))
                 {
                    this._MaintenanceListCtxtDataList.items[2].image1 = "";
                 }
                 else if(this._oilMaintenanceMode === "Off")
                 {
                    this._MaintenanceListCtxtDataList.items[2].image1 = "";
                 }
             }  
        }
    }

};

schedmaintApp.prototype._initializeMaintenanceList = function() //This function sets data on MaintenanceList context
{
    this._distanceDisplayFlag = this._maintenanceListData.Disp_distance;  // used for country condition 
    this._oilMaintenanceModeCountry = this._maintenanceListData.Oil_setting_disp; //used for country condition too
    this._distIncScale = this._maintenanceListData.DistIncr_scale;
    this._distIncScaleMile = this._maintenanceListData.DistIncr_scale_mile;  
    this._timeIncScale = this._maintenanceListData.TimeIncr_scale;
    this._distanceDueKM = this._maintenanceListData.DistanceDue_KM; //To show font color red for distance in maintenance list screen
    this._distanceDueMILE = this._maintenanceListData.DistanceDue_MILE; //To show font color red for distance in maintenance list screen
    this._timeDue = this._maintenanceListData.TimeDue; //To show font color red for time vale in maintenance list screen
    this._schedmaintDistance = this._maintenanceListData.SchedMaintsetDistDefault; 
    this._schedmaintDuration = this._maintenanceListData.SchedMntSetTimeDefault; 
    this._tireRotationDistance = this._maintenanceListData.TireRotationSetDistDefault;
    this._oilMaintDistance = this._maintenanceListData.OilSetDistDefault;
    this._scheduleMaintenanceMode = this._maintenanceListData.ScdMaintSetting;
    this._tireMaintenanceMode = this._maintenanceListData.TireRotationSetting;
    this._oilMaintenanceMode = this._maintenanceListData.OilChangeSetting; 
    this._distanceUnit = this._maintenanceListData.Unit;
};

schedmaintApp.prototype._setDueTitle = function(str) //Function to set the title
{
    if(this._currentContextTemplate && this._currentContext)
    {
        this._currentContextTemplate.list2Ctrl.setTitle(str);
    }
};

schedmaintApp.prototype._updateDataList = function() //To set and update the data of contexts when context is in readytoDisplay
{
    if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "MaintenanceList")
    {
        this._currentContextTemplate.list2Ctrl.setDataList(this._MaintenanceListCtxtDataList);
        if(this._MaintenanceListCtxtDataList != null)
        {    
            this._currentContextTemplate.list2Ctrl.updateItems(0, this._MaintenanceListCtxtDataList.itemCount - 1);
        }
    }
    else if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "ScheduledMaintenanceDetail")
    {
        for(var dataListCount = 0; dataListCount < this._schedmaintCtxtDataList.itemCount; dataListCount++ )
        {
            this._schedmaintCtxtDataList.items[dataListCount].disabled = this._cachedSpeed;
        }
        this._currentContextTemplate.list2Ctrl.setDataList(this._schedmaintCtxtDataList);
        this._currentContextTemplate.list2Ctrl.updateItems(0, this._schedmaintCtxtDataList.itemCount - 1);
    }    
    else if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "TireRotationDetail")
    {
        for(var dataListCount = 0; dataListCount < this._tireRotationCtxtDataList.itemCount; dataListCount++ )
        {
            this._tireRotationCtxtDataList.items[dataListCount].disabled = this._cachedSpeed;
        }
        this._currentContextTemplate.list2Ctrl.setDataList(this._tireRotationCtxtDataList);
        this._currentContextTemplate.list2Ctrl.updateItems(0, this._tireRotationCtxtDataList.itemCount - 1);
    }  
    else if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "OilChangeDetail")
    {
        for(var dataListCount = 0; dataListCount < this._oilChangeCtxtDataList.itemCount; dataListCount++ )
        {
            this._oilChangeCtxtDataList.items[dataListCount].disabled = this._cachedSpeed;
        }
        this._currentContextTemplate.list2Ctrl.setDataList(this._oilChangeCtxtDataList);
        this._currentContextTemplate.list2Ctrl.updateItems(0, this._oilChangeCtxtDataList.itemCount - 1);
    }
    else if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "SettingInterval")
    {
        for(var dataListCount = 0; dataListCount < this._settingIntervalCtxtDataList.itemCount; dataListCount++ )
        {
            if(this._cachedSpeed) //If vehicle is at AtSpeed condition then all option should be disabled
            {
                this._settingIntervalCtxtDataList.items[dataListCount].disabled = this._cachedSpeed;
            }
            else //If vehicle is at NoSpeed condition then check for oil settings to enable only perticular items.
            {
                if(this._flexibleDisabled) //If flexible option is disabled because of oil setting Auto_disabledAndManual
                {
                    if(dataListCount == 0)
                    {
                        this._settingIntervalCtxtDataList.items[dataListCount].disabled = true;
                    }
                    else
                    {
                            this._settingIntervalCtxtDataList.items[dataListCount].disabled = this._cachedSpeed;
                    }   
                }
                else if(this._allDisabled) //If all options are disabled because of oil setting All_disabled
                {
                    this._settingIntervalCtxtDataList.items[dataListCount].disabled = true;
                }
                else //If not above two conditions
                {
                    this._settingIntervalCtxtDataList.items[dataListCount].disabled = this._cachedSpeed;
                }   
            }   
        }
        this._currentContextTemplate.list2Ctrl.setDataList(this._settingIntervalCtxtDataList);
        this._currentContextTemplate.list2Ctrl.updateItems(0, this._settingIntervalCtxtDataList.itemCount - 1);
    } 
};

schedmaintApp.prototype._updateContextData = function() //To updated the data of contexts when context is already displayed
{
    if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "ScheduledMaintenanceDetail")
    {
        for(var dataListCount = 0; dataListCount < this._schedmaintCtxtDataList.itemCount; dataListCount++ )
        {
            this._schedmaintCtxtDataList.items[dataListCount].disabled = this._cachedSpeed;
        }
        if(this._currentContextTemplate.list2Ctrl.dataList.itemCount)
        {
            this._currentContextTemplate.list2Ctrl.updateItems(0, this._schedmaintCtxtDataList.itemCount - 1);
        }
    }    
    if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "TireRotationDetail")
    {
        for(var dataListCount = 0; dataListCount < this._tireRotationCtxtDataList.itemCount; dataListCount++ )
        {
            this._tireRotationCtxtDataList.items[dataListCount].disabled = this._cachedSpeed;
        }
        if(this._currentContextTemplate.list2Ctrl.dataList.itemCount)
        {
            this._currentContextTemplate.list2Ctrl.updateItems(0, this._tireRotationCtxtDataList.itemCount - 1);
        }
    }  
    if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "OilChangeDetail")
    {
        for(var dataListCount = 0; dataListCount < this._oilChangeCtxtDataList.itemCount; dataListCount++ )
        {
            this._oilChangeCtxtDataList.items[dataListCount].disabled = this._cachedSpeed;
        }
        if(this._currentContextTemplate.list2Ctrl.dataList.itemCount)
        {
            this._currentContextTemplate.list2Ctrl.updateItems(0, this._oilChangeCtxtDataList.itemCount - 1);
        }
    }
};

schedmaintApp.prototype._rangeExceedCheck = function() //This function assure the distance value for all maintenance type within max range
{
    if(this._schedmaintDistance > 99750 && this._distanceUnit === "MILE")
    {
        this._schedmaintDistance = 99750;
    }
    else if(this._schedmaintDistance > 99500 && this._distanceUnit === "KM")
    {
        this._schedmaintDistance = 99500;
    }
    if(this._tireRotationDistance > 99750 && this._distanceUnit === "MILE")
    {
        this._tireRotationDistance = 99750;
    }
    else if(this._tireRotationDistance > 99500 && this._distanceUnit === "KM")
    {
        this._tireRotationDistance = 99500;
    }
    if(this._oilMaintDistance > 99750 && this._distanceUnit === "MILE")
    {
        this._oilMaintDistance = 99750;
    }
    else if(this._oilMaintDistance > 99500 && this._distanceUnit === "KM")
    {
        this._oilMaintDistance = 99500;
    }
};

schedmaintApp.prototype._labelIdForMaintenanceList = function() //Function to show diffent labelId according to units on MaintenanceList context.
{
    if(this._distanceUnit === "KM")
    {
        this._dueUnitDistance = "dueInKm";
    }
    else if(this._distanceUnit === "MILE")
    {
        this._dueUnitDistance = "dueInMile";
    }
    
    if(this._oilMaintenanceMode === "Fixed" || this._oilMaintenanceMode === "On")
    {
        if(this._distanceUnit === "KM")
        {
           this._dueUnitOil = "dueUnitOilKm";
        }
        if(this._distanceUnit === "MILE")
        {
           this._dueUnitOil = "dueUnitOilMile";
        }
    }
    else if(this._oilMaintenanceMode === "Flexible")
    {
        this._dueUnitOil = "dueUnitFlexible";
    }
    
    if(this._timeUnit === "months")
    {
        this._dueTimeId = "dueInTimeMonths";
    }
    else if(this._timeUnit === "days")
    {
        this._dueTimeId = "dueInTimeDays";
    }
    else if(this._timeUnit === "day")
    {
        this._dueTimeId = "dueInTimeDay";
    }
};

schedmaintApp.prototype._updateListTestCtrl = function() //Helper function calls every time when MaintenanceList context datalist need to be set and update
{
    if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "MaintenanceList") /**In Context MaintenanceList**/
    {   
        if((this._oilMaintenanceModeCountry || this._distanceDisplayFlag)!= null)
        {    
            this._selectCountry();
        }

        if(this._schedmaintDuration != null)
        {
            this._setTimeData();
        }
        
        this._rangeExceedCheck(); //Function to verify the distance value in specified range.
        this._labelIdForMaintenanceList(); //Function to specify the label Id corrosponding to unit of time or distance or oil settings
        
        if(this._country === "Japan")
        {   
            if(this._oilMaintenanceMode === "Fixed" || this._oilMaintenanceMode === "On")
            {
                this._oilMaintenanceMode = "Fixed";
            }    
            if(this._scheduleMaintenanceMode === "On" || this._scheduleMaintenanceMode === "Manual")
            {    
                if(this._oilMaintenanceMode === "Fixed")
                {
                   this._MaintenanceListCtxtDataList =
                   {
                           itemCountKnown : true, 
                           itemCount : 2, 
                           items : [
                                     { appData : "SelectScheduledMaintenance", text1Id : "scheduled", label1Id : this._dueTimeId,label1SubMap : {"dueInTime" : this._schedmaintTime},itemStyle : 'style06',hasCaret : true,labelWidth:'wide',label1Align:'left'},
                                     { appData : "SelectOilChange", text1Id : "oilChange",label1Id : this._dueUnitOil,label1SubMap : {"dueInOil" : this._oilMaintDistance }, itemStyle : "style06",hasCaret : true,labelWidth:'wide',label1Align:'left'},
                                   ]
                   };
                }
                
                else if(this._oilMaintenanceMode === "Off")
                {
                    this._MaintenanceListCtxtDataList =
                    {
                        itemCountKnown : true, 
                        itemCount : 2, 
                        items : [
                                 { appData : "SelectScheduledMaintenance", text1Id : "scheduled", label1Id : this._dueTimeId,label1SubMap : {"dueInTime" : this._schedmaintTime},itemStyle : 'style06',hasCaret : true,labelWidth:'wide',label1Align:'left'},
                                 { appData : "SelectOilChange", text1Id : "oilChange",label1Id :this._oilMaintenanceMode,hasCaret : true, itemStyle : "style06",label1Align:'center'}
                                ]
                    };
                }
             }
            else if(this._scheduleMaintenanceMode === "Off")
             {
                 if(this._oilMaintenanceMode === "Fixed")
                 {
                    this._MaintenanceListCtxtDataList =
                    {
                            itemCountKnown : true, 
                            itemCount : 2, 
                            items : [
                                         { appData : "SelectScheduledMaintenance", text1Id : "scheduled", label1Id :this._scheduleMaintenanceMode,hasCaret : true,itemStyle : "style06",label1Align:'center'},
                                         { appData : "SelectOilChange", text1Id : "oilChange",label1Id : this._dueUnitOil,label1SubMap : {"dueInOil" : this._oilMaintDistance }, itemStyle : "style06",hasCaret : true,labelWidth:'wide',label1Align:'left'},
                                    ]
                    };
                 }
                 
                 else if(this._oilMaintenanceMode === "Off")
                 {
                     this._MaintenanceListCtxtDataList =
                     {
                         itemCountKnown : true, 
                         itemCount : 2, 
                         items : [
                                  { appData : "SelectScheduledMaintenance", text1Id : "scheduled", label1Id :this._scheduleMaintenanceMode,hasCaret : true, itemStyle : "style06",label1Align:'center'},
                                  { appData : "SelectOilChange", text1Id : "oilChange",label1Id :this._oilMaintenanceMode,hasCaret : true, itemStyle : "style06",label1Align:'center'}
                                 ]
                     };
                 }
             }
        }
        if(this._country === "US" || this._country === "EU" || this._country !== "Japan")
        {
            if(this._oilMaintenanceMode === "Fixed" || this._oilMaintenanceMode === "On")
            {
                this._oilMaintenanceStatus = this._oilMaintDistance;
            } 
            else if(this._oilMaintenanceMode === "Flexible")
            {
                if(this._oilDeteriorationLevel > 100 || this._oilDeteriorationLevel < 0)
                {
                    this._oilMaintenanceStatus = "--";  
                }
                else
                {    
                    this._oilMaintenanceStatus = this._oilDeteriorationLevel;
                }
            }
            
            if(this._scheduleMaintenanceMode === "On" && this._tireMaintenanceMode === "On" && this._oilMaintenanceMode !== "Off")
            {
                this._MaintenanceListCtxtDataList =
                {
                    itemCountKnown : true, 
                    itemCount : 3, 
                    items : [
                             { appData : "SelectScheduledMaintenance", text1Id : "scheduled", label1Id :this._dueTimeId,label1SubMap : {"dueInTime" : this._schedmaintTime}, label2Id :this._dueUnitDistance,label2SubMap : {"dueInDistance" : this._schedmaintDistance}, itemStyle : 'style07',hasCaret : true,labelWidth:'wide',label1Align:'left',label2Align:'left'},
                             { appData : "SelectTireRotation", text1Id : "tireRotation",label1Id : this._dueUnitDistance, label1SubMap : {"dueInDistance" : this._tireRotationDistance}, itemStyle :'style06',hasCaret : true,labelWidth:'wide',label1Align:'left'},
                             { appData : "SelectOilChange", text1Id : "oilChange",label1Id : this._dueUnitOil,label1SubMap : {"dueInOil" : this._oilMaintenanceStatus }, itemStyle : "style06",hasCaret : true,labelWidth:'wide',label1Align:'left'}
                            ]
                };
            }
            else if(this._scheduleMaintenanceMode === "On" && this._tireMaintenanceMode === "On" && this._oilMaintenanceMode === "Off")
            {
                this._MaintenanceListCtxtDataList =
                {
                    itemCountKnown : true, 
                    itemCount : 3, 
                    items : [
                             { appData : "SelectScheduledMaintenance", text1Id : "scheduled", label1Id :this._dueTimeId,label1SubMap : {"dueInTime" : this._schedmaintTime }, label2Id :this._dueUnitDistance,label2SubMap : {"dueInDistance" : this._schedmaintDistance}, itemStyle : 'style07',hasCaret : true,labelWidth:'wide',label1Align:'left',label2Align:'left'},
                             { appData : "SelectTireRotation", text1Id : "tireRotation",label1Id : this._dueUnitDistance, label1SubMap : {"dueInDistance" : this._tireRotationDistance}, itemStyle :'style06',hasCaret : true,labelWidth:'wide',label1Align:'left'},
                             { appData : "SelectOilChange", text1Id : "oilChange",label1Id :this._oilMaintenanceMode,hasCaret : true, itemStyle : "style06",label1Align:'center'}
                            ]
                }; 
            }
            else if(this._scheduleMaintenanceMode === "Off" && this._tireMaintenanceMode === "On" && this._oilMaintenanceMode !== "Off" )
            {
                this._MaintenanceListCtxtDataList =
                {
                    itemCountKnown : true, 
                    itemCount : 3, 
                    items : [
                             { appData : "SelectScheduledMaintenance", text1Id : "scheduled", label1Id :this._scheduleMaintenanceMode,hasCaret : true, itemStyle : "style06",label1Align:'center'},
                             { appData : "SelectTireRotation", text1Id : "tireRotation",label1Id : this._dueUnitDistance, label1SubMap : {"dueInDistance" : this._tireRotationDistance}, itemStyle :'style06',hasCaret : true,labelWidth:'wide',label1Align:'left'},
                             { appData : "SelectOilChange", text1Id : "oilChange",label1Id : this._dueUnitOil,label1SubMap : {"dueInOil" : this._oilMaintenanceStatus }, itemStyle : "style06",hasCaret : true,labelWidth:'wide',label1Align:'left'},
                            ]
                };
            }
            else if(this._scheduleMaintenanceMode === "Off" && this._tireMaintenanceMode === "On" && this._oilMaintenanceMode === "Off" )
            {
                this._MaintenanceListCtxtDataList =
                {
                    itemCountKnown : true, 
                    itemCount : 3, 
                    items : [
                             { appData : "SelectScheduledMaintenance", text1Id : "scheduled", label1Id :this._scheduleMaintenanceMode,hasCaret : true, itemStyle : "style06",label1Align:'center'},
                             { appData : "SelectTireRotation", text1Id : "tireRotation",label1Id : this._dueUnitDistance, label1SubMap : {"dueInDistance" : this._tireRotationDistance}, itemStyle :'style06',hasCaret : true,labelWidth:'wide',label1Align:'left'},
                             { appData : "SelectOilChange", text1Id : "oilChange",label1Id :this._oilMaintenanceMode,hasCaret : true, itemStyle : "style06",label1Align:'center'}
                            ]
                };
            }
            else if(this._tireMaintenanceMode === "Off" && this._scheduleMaintenanceMode === "On" && this._oilMaintenanceMode !== "Off")
            {
                this._MaintenanceListCtxtDataList =
                {
                    itemCountKnown : true, 
                    itemCount : 3, 
                    items : [
                              { appData : "SelectScheduledMaintenance", text1Id : "scheduled", label1Id :this._dueTimeId,label1SubMap : {"dueInTime" : this._schedmaintTime }, label2Id :this._dueUnitDistance,label2SubMap : {"dueInDistance" : this._schedmaintDistance}, itemStyle : 'style07',hasCaret : true,labelWidth:'wide',label1Align:'left',label2Align:'left'},
                              { appData : "SelectTireRotation", text1Id : "tireRotation",label1Id :this._tireMaintenanceMode,hasCaret : true, itemStyle : "style06",label1Align:'center'},
                              { appData : "SelectOilChange", text1Id : "oilChange",label1Id : this._dueUnitOil,label1SubMap : {"dueInOil" : this._oilMaintenanceStatus }, itemStyle : "style06",hasCaret : true,labelWidth:'wide',label1Align:'left'}
                            ]
                };
            }
            else if(this._tireMaintenanceMode === "Off" && this._scheduleMaintenanceMode === "On" && this._oilMaintenanceMode === "Off")
            {
                this._MaintenanceListCtxtDataList =
                {
                    itemCountKnown : true, 
                    itemCount : 3, 
                    items : [
                              { appData : "SelectScheduledMaintenance", text1Id : "scheduled", label1Id :this._dueTimeId,label1SubMap : {"dueInTime" : this._schedmaintTime }, label2Id :this._dueUnitDistance,label2SubMap : {"dueInDistance" : this._schedmaintDistance}, itemStyle : 'style07',hasCaret : true,labelWidth:'wide',label1Align:'left',label2Align:'left'},
                              { appData : "SelectTireRotation", text1Id : "tireRotation",label1Id :this._tireMaintenanceMode,hasCaret : true, itemStyle : "style06",label1Align:'center'},
                              { appData : "SelectOilChange", text1Id : "oilChange",label1Id :this._oilMaintenanceMode,hasCaret : true,itemStyle : "style06",label1Align:'center'}
                            ]
                };
            }
            else if(this._tireMaintenanceMode === "Off" && this._scheduleMaintenanceMode === "Off" && this._oilMaintenanceMode !== "Off")
            {
                this._MaintenanceListCtxtDataList =
                {
                    itemCountKnown : true, 
                    itemCount : 3, 
                    items : [
                             { appData : "SelectScheduledMaintenance", text1Id : "scheduled", label1Id :this._scheduleMaintenanceMode,hasCaret : true, itemStyle : "style06",label1Align:'center'},
                             { appData : "SelectTireRotation", text1Id : "tireRotation",label1Id :this._tireMaintenanceMode,hasCaret : true, itemStyle : "style06",label1Align:'center'},
                             { appData : "SelectOilChange", text1Id : "oilChange",label1Id : this._dueUnitOil,label1SubMap : {"dueInOil" : this._oilMaintenanceStatus }, itemStyle : "style06",hasCaret : true,labelWidth:'wide',label1Align:'left'}
                            ]
                };
            }
            else if(this._tireMaintenanceMode === "Off" && this._scheduleMaintenanceMode === "Off" && this._oilMaintenanceMode === "Off")
            {
                this._MaintenanceListCtxtDataList =
                {
                    itemCountKnown : true, 
                    itemCount : 3, 
                    items : [
                             { appData : "SelectScheduledMaintenance", text1Id : "scheduled", label1Id :this._scheduleMaintenanceMode,hasCaret : true, itemStyle : "style06",label1Align:'center'},
                             { appData : "SelectTireRotation", text1Id : "tireRotation",label1Id :this._tireMaintenanceMode,hasCaret : true, itemStyle : "style06",label1Align:'center'},
                             { appData : "SelectOilChange", text1Id : "oilChange",label1Id :this._oilMaintenanceMode,hasCaret : true, itemStyle : "style06",label1Align:'center'}
                            ]
                };
            }
        }
        
        this._updateDataList(); //To set and update the data on MaintenanceList context
    }
};    
/********** End of updateListTestCtrl ******************/

schedmaintApp.prototype._updateScheduleMaintenanceCtrl = function() //This function will be called when Schedule Maintenance data list need to set and update
{
    if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "ScheduledMaintenanceDetail")
    {
        if(this._schedmaintDue !== null)
        {
            this._titleCheck(); //this function set the title when maintenance is due or not due
        }
        if(this._schedmaintDuration != null)
        {
            this._setTimeData();
        }
        
        this._rangeExceedCheck(); //Condition check if data received more than distance value range;
        this._incrementScaleCheck(); //Function to check increment scale of time or distance value
        
        if(this._country !== "Japan")
        {
            if(this._scheduleMaintenanceMode === "On")
            {
                this._schedmaintCtxtDataList =
                {
                   itemCountKnown : true, 
                   itemCount : 4, 
                   items : [
                             { appData : "SetSchedMaintOnOff", text1Id : "Setting",itemStyle : "styleOnOff",hasCaret : false, value :1},
                             { appData:  "SetTimeValue", itemStyle:'styleStep', text1Id:'scheduledDueIn', label1Id:'Time',label2:this._schedmaintTime ,label2Id: this._timeUnit, label2SubMap : {"value" : this._schedmaintTime}, hasCaret : false,value : this._schedmaintTime,min:1, max:36, increment : this._increamentScaleTime, styleMod : 'hint' },
                             { appData:  "SetDistanceValue" ,itemStyle:'styleStep', text1Id:'scheduledDueIn', label1Id:'Distance',label2:this._schedmaintDistance, label2Id:this._distanceUnit, label2SubMap : {"value" : this._schedmaintDistance}, hasCaret : false, value : this._schedmaintDistance,min:this._minIncreamentValue, max:this._maxIncreamentValue, increment:this._increamentScale, styleMod : 'hint' },
                             { appData : "SelectReset", text1Id : "Reset",hasCaret : false, itemStyle : "style01" },
                           ]
               };
            }
        }
        else if(this._country === "Japan")
        {
            if(this._scheduleMaintenanceMode === "Manual" || this._scheduleMaintenanceMode === "On" ) 
            {
                 this._schedmaintCtxtDataList =
                 {
                    itemCountKnown : true, 
                    itemCount : 3, 
                    items : [
                                { appData : "SetSchedMaintOnOff", text1Id : "Setting", itemStyle : "styleOnOff",hasCaret : false, value :1},
                                { appData:  "SetTimeValue", itemStyle:'styleStep', text1Id:'scheduledDueIn', label1Id:'Time',label2:this._schedmaintTime ,label2Id: this._timeUnit, label2SubMap : {"value" : this._schedmaintTime}, hasCaret : false,value : this._schedmaintTime,min:1, max:36, increment : this._increamentScaleTime, styleMod : 'hint' },
                                { appData : "SelectReset", text1Id : "Reset",hasCaret : false, itemStyle : "style01" },
                            ]
                 };
             }
        }
        if(this._scheduleMaintenanceMode !== "Off")
        {
             if(this._timeUnit === "days" || this._timeUnit === "day" )
             {
                    this._schedmaintCtxtDataList.items[1].min = this._schedmaintDuration; //To disable "-" button less than or equal to 30 days. 
             }
             if(this._distanceUnit === "MILE")
             {
                    if(this._country !== "Japan")
                    {
                        if(this._schedmaintDistance < 500)
                        {
                            this._schedmaintCtxtDataList.items[2].min = this._schedmaintDistance; //To disable "-" button less than or equal to 500 miles. 
                        }
                    }
             }
             else if(this._distanceUnit === "KM")
             {
                    if(this._country !== "Japan")
                    {
                        if(this._schedmaintDistance < 1000)
                        {
                            this._schedmaintCtxtDataList.items[2].min = this._schedmaintDistance; //To disable "-" button less than or equal to 1000 km. 
                        }
                    }
              }
              if(this._schedmaintTimeDue) //Condition check for making time label font color red when maintenance due
              {
                     this._schedmaintCtxtDataList.items[1].warning = true;
              }
              if(this._schedmaintDistanceDue && this._country !== "Japan" ) //Condition check for making distance label font color red when maintenance due
              {
                     this._schedmaintCtxtDataList.items[2].warning = true;
              }
         }  
         else if(this._scheduleMaintenanceMode === "Off")
         {
              var str = 
              {    
                     text1Id : "scheduled",
                     titleStyle : "style02"
              };
              this._setDueTitle(str);
              this._schedmaintCtxtDataList =
              {
                     itemCountKnown : true, 
                     itemCount : 1, 
                     items : [
                                 { appData : "SetSchedMaintOnOff", text1Id : "Setting",itemStyle : "styleOnOff",hasCaret : false, value : 2 },
                             ]
              };
          }
       
         if(this._scheduleMaintenanceMode === "Off" || this._selectedButtonSchedmaint === "On")
         {
              this._updateDataList(); //If Maintenance Mode is Off or then On Data List need to be updated
         }
         else
         {
              this._currentContextTemplate.list2Ctrl.setDataList(this._schedmaintCtxtDataList);
              this._currentContextTemplate.list2Ctrl.updateItems(0, this._schedmaintCtxtDataList.itemCount - 1);
              this._updateContextData(); 
         }
    };
};

schedmaintApp.prototype._updateTireMaintenanceCtrl = function() //This function will be called when Tire Maintenance data list need to set and update
{
    if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "TireRotationDetail")
    {
           if(this._tiremaintDue !== null)
           {
                this._titleCheck(); //To set the title of tire maintenance
           } 
           this._rangeExceedCheck(); //To check whether the distance value is in defined range
           this._incrementScaleCheck(); //To define the increment factor using +/- control
  
           if(this._tireMaintenanceMode === "On")
           {
               this._tireRotationCtxtDataList =
               {
                   itemCountKnown : true, 
                   itemCount : 3, 
                   items : [
                              { appData : "SetTireRotationOnOff", text1Id : "Setting", itemStyle : "styleOnOff",hasCaret : false, value : 1 },
                              { appData:  "SetDistanceValue" ,itemStyle:'styleStep', text1Id:'scheduledDueIn', label1Id:'Distance',label2:this._tireRotationDistance, label2Id:this._distanceUnit, label2SubMap : {"value" : this._tireRotationDistance}, hasCaret : false, value : this._tireRotationDistance,min:this._minIncreamentValue, max:this._maxIncreamentValue, increment:this._increamentScale, styleMod : 'hint' },
                              { appData : "SelectReset", text1Id : "Reset",hasCaret : false, itemStyle : "style01" },
                           ]
               };
           }
           else if(this._tireMaintenanceMode === "Off")
           {
               var str = 
               {    
                     text1Id : "tireRotation",
                     titleStyle : "style02"
               };
               this._setDueTitle(str);
               this._tireRotationCtxtDataList =
               {
                     itemCountKnown : true, 
                     itemCount : 1, 
                     items : [
                                 { appData : "SetTireRotationOnOff", text1Id : "Setting", itemStyle : "styleOnOff",hasCaret : false, value : 2 },
                             ]
               };
           }
           
           if(this._tireMaintenanceMode == "On")
           {
               if(this._distanceUnit === "MILE") //To disable "-" button less than or equal to 500 miles. 
               {
                   if(this._tireRotationDistance < 500)
                   {
                        this._tireRotationCtxtDataList.items[1].min = this._tireRotationDistance;
                   }
               }
               else if(this._distanceUnit === "KM") //To disable "-" button less than or equal to 1000 km. 
               {
                   if(this._tireRotationDistance < 1000)
                   {
                        this._tireRotationCtxtDataList.items[1].min = this._tireRotationDistance; 
                   }
               }
               
               if(this._tiremaintDue === "true") //condition check to add font color red when maintenance is due.
               {
                    this._tireRotationCtxtDataList.items[1].warning = true;
               }
           }    
           
           if(this._tireMaintenanceMode === "Off" || this._selectedButtonTiremaint === "On" )
           {
                this._updateDataList();
           }
           else
           {
                this._currentContextTemplate.list2Ctrl.setDataList(this._tireRotationCtxtDataList);
                this._currentContextTemplate.list2Ctrl.updateItems(0, this._tireRotationCtxtDataList.itemCount - 1);
                this._updateContextData();
           }
    };
};

schedmaintApp.prototype._updateOilMaintenanceCtrl = function() //This function will be called when Oil Maintenance data list need to set and update
{
    if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "OilChangeDetail") //Edit OilChangeDetail context by Payload
    {
         if(this._oilmaintDue !== null)
         {
             this._titleCheck(); //To set the title of tire maintenance
         }
         this._rangeExceedCheck(); //To check whether the distance value is in defined range
         this._incrementScaleCheck(); //To define the increment factor using +/- control
         
         if(this._country !== "Japan" )
         {
              if(this._oilMaintenanceMode === "Fixed") //Country is US or EU in Fixed Mode
              {   
                  this._oilChangeCtxtDataList =
                  {
                        itemCountKnown : true, 
                        itemCount : 3, 
                        items : [
                                     { appData:  "SelectSettingInterval" ,text1Id :  "settingInterval",label1Id : this._oilMaintenanceMode, itemStyle : 'style06',hasCaret : true,labelWidth:'wide'},
                                     { appData:  "SetDistanceValue" ,itemStyle:'styleStep', text1Id:'scheduledDueIn', label1Id:'Distance',label2:this._oilMaintDistance, label2Id:this._distanceUnit, label2SubMap : {"value" : this._oilMaintDistance}, hasCaret : false, value : this._oilMaintDistance,min:this._minIncreamentValue, max:this._maxIncreamentValue, increment:this._increamentScale, styleMod : 'hint' },
                                     { appData : "SelectReset", text1Id : "Reset",hasCaret : false, itemStyle : "style01" }
                                ]
                  };
              }    
              else if(this._oilMaintenanceMode === "Flexible")//Country is US or EU in Auto Mode
              {
                  if(this._country === "US")
                  {
                     this._oilChangeCtxtDataList =
                     {
                            itemCountKnown : true, 
                            itemCount : 3, 
                            items : [
                                        { appData:  "SelectSettingInterval" ,text1Id :  "settingInterval",label1Id : this._oilMaintenanceMode, itemStyle : 'style06',hasCaret : true,labelWidth:'wide'},
                                        { text1Id :  "oilLife",label1 :this._oilLifeValue, itemStyle : 'style06',hasCaret : false,label1Align:'center',labelWidth:'wide' },
                                        { appData : "SelectReset", text1Id : "Reset",hasCaret : false, itemStyle : "style01" },
                                    ]
                     };
                  }
                  else if(this._country === "EU") //Only Flexible setting is available (FlexibleEU subcontext)
                  {   
                     this._oilChangeCtxtDataList =
                     {
                            itemCountKnown : true, 
                            itemCount : 3, 
                            items : [
                                        { appData : "SelectSettingInterval", text1Id : "settingInterval", label1Id:"Flexible", itemStyle : "style06" ,hasCaret : false,label1Align:'center',labelWidth:'wide'},
                                        { text1Id :  "oilLife",label1 :this._oilLifeValue, itemStyle : 'style06',hasCaret : false,label1Align:'center',labelWidth:'wide' },
                                        { appData : "SelectReset", text1Id : "Reset",hasCaret : false, itemStyle : "style01" },
                                    ]
                     };
                  }
             }  
             else if(this._oilMaintenanceMode === "Off")//Country is US or EU in Off Mode
             {
                  var str = 
                  {    
                        text1Id : "oilChange",
                        titleStyle : "style02"
                  };
                  this._setDueTitle(str);  // To remove due notification if setting is Off
                  this._oilChangeCtxtDataList =
                  {
                        itemCountKnown : true, 
                        itemCount : 1, 
                        items : [
                                    { appData:  "SelectSettingInterval" ,text1Id : "settingInterval",label1Id : this._oilMaintenanceMode, itemStyle : 'style06',hasCaret : true,labelWidth:'wide'},
                                ]
                  };
             }
             if(this._oilSettingShow === "OnOff") //This is case when flexible setting not available and oil setting is Manual_Only
             {
                 if(this._oilMaintenanceMode === "Fixed" || this._oilMaintenanceMode === "On")    //This is On condition when Oil setting is Manual_Only so On/Off button will only be present
                 {
                      this._oilChangeCtxtDataList =
                      {
                            itemCountKnown : true,
                            itemCount : 3, 
                            items : [
                                        { appData : "SelectSettingInterval", text1Id : "settingInterval",itemStyle : "styleOnOff",hasCaret : false, value : 1 },
                                        { appData:  "SetDistanceValue" ,itemStyle:'styleStep', text1Id:'scheduledDueIn', label1Id:'Distance',label2:this._oilMaintDistance, label2Id:this._distanceUnit, label2SubMap : {"value" : this._oilMaintDistance}, hasCaret : false, value : this._oilMaintDistance,min:this._minIncreamentValue, max:this._maxIncreamentValue, increment:this._increamentScale, styleMod : 'hint' },
                                        { appData : "SelectReset", text1Id : "Reset",hasCaret : false, itemStyle : "style01" },
                                    ]
                      };
                 }
                 else if(this._oilMaintenanceMode === "Off")    //This is Off condition when Oil setting is Manual_Only so On/Off button will only be present
                 {
                      var str = 
                      {    
                            text1Id : "oilChange",
                            titleStyle : "style02"
                      };
                      this._setDueTitle(str);  // To remove due notification if setting is Off
                      this._oilChangeCtxtDataList =
                      {
                            itemCountKnown : true, 
                            itemCount : 1, 
                            items : [
                                        { appData : "SelectSettingInterval", text1Id : "settingInterval",itemStyle : "styleOnOff",hasCaret : false, value :2 },
                                    ]
                      };
                 }
             }
       }
    
       else if(this._country === "Japan")  //When Country is Japan
       {
             if(this._oilMaintenanceMode === "Off")    //Country is Japan in Off Oil maintenance Mode
             {
                var str = 
                {    
                         text1Id : "oilChange",
                         titleStyle : "style02"
                };
                this._setDueTitle(str);  // To remove due notification if setting is Off
                this._oilChangeCtxtDataList =
                {
                    itemCountKnown : true, 
                    itemCount : 1, 
                    items : [
                                { appData : "SelectSettingInterval", text1Id : "settingInterval",itemStyle : "styleOnOff",hasCaret : false, value :2 },
                            ]
                };
    
             }
             else if(this._oilMaintenanceMode === "Fixed" || this._oilMaintenanceMode === "On")    //Country is Japan in Off Oil maintenance Mode
             {
                this._oilChangeCtxtDataList =
                {
                    itemCountKnown : true,
                    itemCount : 3, 
                    items : [
                                { appData : "SelectSettingInterval", text1Id : "settingInterval",itemStyle : "styleOnOff",hasCaret : false, value : 1 },
                                { appData:  "SetDistanceValue" ,itemStyle:'styleStep', text1Id:'scheduledDueIn', label1Id:'Distance',label2:this._oilMaintDistance, label2Id:this._distanceUnit, label2SubMap : {"value" : this._oilMaintDistance}, hasCaret : false, value : this._oilMaintDistance,min:this._minIncreamentValue, max:this._maxIncreamentValue, increment:this._increamentScale, styleMod : 'hint' },
                                { appData : "SelectReset", text1Id : "Reset",hasCaret : false, itemStyle : "style01" },
                            ]
                };
             }
        }
        if(this._oilMaintenanceMode !== "Off")
        {
            if(this._distanceUnit === "MILE") //To disable "-" button less than or equal to 500 miles. 
            {
                if(this._oilMaintDistance < 500)
                {
                    this._oilChangeCtxtDataList.items[1].min = this._oilMaintDistance; 
                }
            }
            else if(this._distanceUnit === "KM") //To disable "-" button less than or equal to 1000 km.
            {
                if(this._oilMaintDistance < 1000)
                {
                    this._oilChangeCtxtDataList.items[1].min = this._oilMaintDistance;  
                }
            }
            if(this._oilmaintDue === "true") //Condition check for making label font color red when maintenance due
            {
                if(this._country !== "Japan")
                {
                    if(this._oilMaintenanceMode === "Flexible" && this._oilLifeDue)
                    {
                        this._oilChangeCtxtDataList.items[1].label1Warning = true;
                    }
                    if(this._oilMaintenanceMode === "Fixed" && this._oilDistanceDue)
                    {
                        this._oilChangeCtxtDataList.items[1].warning = true;
                    }
                }
                else
                {
                    if(this._oilDistanceDue && (this._oilMaintenanceMode === "Fixed" || this._oilMaintenanceMode === "On"))
                    {
                        this._oilChangeCtxtDataList.items[1].warning = true;
                    }   
                }   
            }
        }   
        
        if(this._oilMaintenanceMode === "Off")
        {
             this._updateDataList();
        }
        else
        {
             this._currentContextTemplate.list2Ctrl.setDataList(this._oilChangeCtxtDataList);
             this._currentContextTemplate.list2Ctrl.updateItems(0, this._oilChangeCtxtDataList.itemCount - 1);
             this._updateContextData();
        }
    };
};

schedmaintApp.prototype._updateSettingIntervalTestCtrl = function() //helper function to change the oil settings on SettingInterval context
{
    if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "SettingInterval")  //if Context is SettingInterval
    {
        if(this._oilSettingShow === "All")
        {
           this._settingIntervalCtxtDataList =
            {
                itemCountKnown : true, 
                itemCount : 3, 
                items : [
                          { appData:"SetOilChange", itemStyle:'style03',  text1Id:'Flexible', image1:'radio', hasCaret:false},
                          { appData:"SetOilChange", itemStyle:'style03',  text1Id:'Fixed', image1:'radio', hasCaret:false },
                          { appData:"SetOilChange", itemStyle:'style03',  text1Id:'Off', image1:'radio', hasCaret:false }
                        ]
            };
        }      
        if(this._oilMaintenanceMode === "Flexible")
        {
            this._settingIntervalCtxtDataList.items[0].checked = true;
            this._settingIntervalCtxtDataList.items[1].checked = false;
            this._settingIntervalCtxtDataList.items[2].checked = false;
        }
        else if(this._oilMaintenanceMode === "Fixed")
        {
            this._settingIntervalCtxtDataList.items[0].checked = false;
            this._settingIntervalCtxtDataList.items[1].checked = true;
            this._settingIntervalCtxtDataList.items[2].checked = false;
        }
        else if(this._oilMaintenanceMode === "Off")
        {
            this._settingIntervalCtxtDataList.items[0].checked = false;
            this._settingIntervalCtxtDataList.items[1].checked = false;
            this._settingIntervalCtxtDataList.items[2].checked = true;
        }
        else
        {
            log.info("No Oil Setting Matching the condition");
        }   
        
        if(this._flexibleDisabled) //If Flexible option need to be disabled because of  oil setting Auto_disabledAndManual
        {
            this._settingIntervalCtxtDataList.items[0].disabled = true;
        }
        else if(this._allDisabled) //If all list items need to be disabled because of  oil setting All_disabled
        {
            for(var dataListCount = 0; dataListCount < this._settingIntervalCtxtDataList.itemCount; dataListCount++ )
            {
                this._settingIntervalCtxtDataList.items[dataListCount].disabled = true;
            }
        }
        if(this._cachedSpeed) // If vehicle is atSpeed then all option should be disabled not depends on oil settings
        {
            for(var dataListCount = 0; dataListCount < this._settingIntervalCtxtDataList.itemCount; dataListCount++ )
            {
                this._settingIntervalCtxtDataList.items[dataListCount].disabled = true;
            }
        }   
        this._currentContextTemplate.list2Ctrl.setDataList(this._settingIntervalCtxtDataList);
        this._currentContextTemplate.list2Ctrl.updateItems(0, this._settingIntervalCtxtDataList.itemCount - 1);
    };
    
};//End Of updateSettingIntervalTestCtrl()

schedmaintApp.prototype._updateDataTimeCtrl = function() //This function will be called when there is call back for time updation
{
    if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "ScheduledMaintenanceDetail")
    {
        if(this._schedmaintDuration != null)
        {
            if(this._schedmaintDuration != this._schedmaintTime*30)
            {
                this._UpdateTime = true; //The condtion check variable to update the value only when it has changes
            }
            else
            {
                this._UpdateTime = false;
            }   
            this._setTimeData();
        }
        if(this._scheduleMaintenanceMode !== "Off")
        {
            if(this._timeUnit === "days" || this._timeUnit === "day" )
            {
                this._schedmaintCtxtDataList.items[1].min = this._schedmaintDuration; //To disable "-" button less than or equal to 30 days. 
            }
            else
            {
                this._schedmaintCtxtDataList.items[1].min = 1;
            }
            this._schedmaintCtxtDataList.items[1].label2 = this._schedmaintTime;
            this._schedmaintCtxtDataList.items[1].label2Id = this._timeUnit;
            this._schedmaintCtxtDataList.items[1].label2SubMap = {"value" : this._schedmaintTime};
            this._schedmaintCtxtDataList.items[1].value = this._schedmaintTime;
            this._schedmaintCtxtDataList.items[1].increment = this._increamentScaleTime;
            if(this._responseTime >= 200 && this._UpdateTime )
            {
                this._currentContextTemplate.list2Ctrl.updateItems(1,1);
            }
        }
    }
    if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "MaintenanceList" )
    {
        if(this._schedmaintDuration != null)
        {
            this._setTimeData();
        }
        this._labelIdForMaintenanceList(); //Function to specify the label Id corrosponding to unit of time or distance or oil settings

        if(this._scheduleMaintenanceMode !== "Off")
        {
             if(this._country !== "Japan")
             {
                 this._MaintenanceListCtxtDataList.items[0].label1Id = this._dueTimeId;
                 this._MaintenanceListCtxtDataList.items[0].label1SubMap = {"dueInTime" : this._schedmaintTime};
                 this._MaintenanceListCtxtDataList.items[0].itemStyle = "style07";
                 this._MaintenanceListCtxtDataList.items[0].label1Align = "left";
                 this._MaintenanceListCtxtDataList.items[0].labelWidth = "wide";
             }
             else if(this._country === "Japan")
             {
                 this._MaintenanceListCtxtDataList.items[0].label1Id = this._dueTimeId;
                 this._MaintenanceListCtxtDataList.items[0].label1SubMap = {"dueInTime" : this._schedmaintTime};
                 this._MaintenanceListCtxtDataList.items[0].itemStyle = "style06";
                 this._MaintenanceListCtxtDataList.items[0].label1Align = "left";
                 this._MaintenanceListCtxtDataList.items[0].labelWidth = "wide";
             }
             else
             {
                 log.debug("No Condition matches");
             }
             
             this._currentContextTemplate.list2Ctrl.updateItems(0,0);
        }
    }
};

schedmaintApp.prototype._updateDataDistanceCtrl = function() //This function will be called when there is call back for distance updation
{
    if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "ScheduledMaintenanceDetail")
    {
         if(this._scheduleMaintenanceMode !== "Off")
         {
                if(this._distanceUnit === "MILE")
                {
                    if(this._schedmaintDistance < 500)
                    {
                        this._schedmaintCtxtDataList.items[2].min = this._schedmaintDistance; //To disable "-" button less than or equal to 500 miles. 
                    }
                    else
                    {
                        this._schedmaintCtxtDataList.items[2].min = this._minIncreamentValue;
                    }   
                }
                if(this._distanceUnit === "KM")
                {
                    if(this._schedmaintDistance < 1000)
                    {
                        this._schedmaintCtxtDataList.items[2].min = this._schedmaintDistance; //To disable "-" button less than or equal to 1000 km. 
                    }
                    else
                    {
                        this._schedmaintCtxtDataList.items[2].min = this._minIncreamentValue;
                    }   
                }
                 var distanceComparison = this._schedmaintCtxtDataList.items[2].value;
                 this._schedmaintCtxtDataList.items[2].label2 = this._schedmaintDistance;
                 this._schedmaintCtxtDataList.items[2].label2Id = this._distanceUnit;
                 this._schedmaintCtxtDataList.items[2].label2SubMap = {"value" : this._schedmaintDistance};
                 this._schedmaintCtxtDataList.items[2].value = this._schedmaintDistance;
                 this._schedmaintCtxtDataList.items[2].increment = this._increamentScale;
                 if( this._responseDistanceTime >= 200 && (distanceComparison != this._schedmaintDistance) )
                 {
                    this._currentContextTemplate.list2Ctrl.updateItems(2,2);
                 }
                 else if (distanceComparison == this._schedmaintDistance)
                 {
                    this._currentContextTemplate.list2Ctrl.updateItems(2,2);
                 }
                 
                //Re-initialize for minimum boundary condition so that the - sign is displayed correctly.
                //Handles the case for < 1000 km
                this._schedmaintCtxtDataList.items[2].min = this._minIncreamentValue;
          }
     }
     if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "MaintenanceList" )
     {
         this._rangeExceedCheck(); //Function to verify the distance value in specified range.
         this._labelIdForMaintenanceList(); //Function to specify the label Id corrosponding to unit of time or distance or oil settings

         if(this._scheduleMaintenanceMode !== "Off")
         {
             if(this._country !== "Japan")
             {
                 this._MaintenanceListCtxtDataList.items[0].label2Id = this._dueUnitDistance;
                 this._MaintenanceListCtxtDataList.items[0].label2SubMap = {"dueInDistance" : this._schedmaintDistance};
                 this._MaintenanceListCtxtDataList.items[0].itemStyle = "style07";
                 this._MaintenanceListCtxtDataList.items[0].label2Align = "left";
                 this._MaintenanceListCtxtDataList.items[0].labelWidth = "wide";
                 
                 this._currentContextTemplate.list2Ctrl.updateItems(0,0);
             }
        }
    }   
};

schedmaintApp.prototype._updateDataTireDistanceCtrl = function()
{
     if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "TireRotationDetail")
     {
          if(this._tireMaintenanceMode !== "Off")
          {
                if(this._distanceUnit === "MILE")
                {
                    if(this._tireRotationDistance < 500)
                    {
                        this._tireRotationCtxtDataList.items[1].min = this._tireRotationDistance; //To disable "-" button less than or equal to 500 miles. 
                    }
                    else
                    {
                        this._tireRotationCtxtDataList.items[1].min = this._minIncreamentValue;
                    }   
                }
                else if(this._distanceUnit === "KM")
                {
                    if(this._tireRotationDistance < 1000)
                    {
                        this._tireRotationCtxtDataList.items[1].min = this._tireRotationDistance; //To disable "-" button less than or equal to 1000 Km. 
                    }
                    else
                    {
                        this._tireRotationCtxtDataList.items[1].min = this._minIncreamentValue;
                    }   
                }   
             
                var distanceComparison = this._tireRotationCtxtDataList.items[1].value;
                this._tireRotationCtxtDataList.items[1].label2 = this._tireRotationDistance;
                this._tireRotationCtxtDataList.items[1].label2Id = this._distanceUnit;
                this._tireRotationCtxtDataList.items[1].label2SubMap = {"value" : this._tireRotationDistance};
                this._tireRotationCtxtDataList.items[1].value = this._tireRotationDistance;
                this._tireRotationCtxtDataList.items[1].increment = this._increamentScale;
             
                if( this._responseDistanceTireTime >= 200 && (distanceComparison != this._tireRotationDistance) )
                {
                    this._currentContextTemplate.list2Ctrl.updateItems(1,1);
                }
                else if(distanceComparison == this._tireRotationDistance)
                {
                    this._currentContextTemplate.list2Ctrl.updateItems(1,1);
                }
                
                //Re-initialize for minimum boundary condition so that the - sign is displayed correctly.
                //Handles the case for < 1000 km
                this._tireRotationCtxtDataList.items[1].min = this._minIncreamentValue;
           }     
      }
      else if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "MaintenanceList" )
      {
           this._rangeExceedCheck(); //Function to verify the distance value in specified range.
           this._labelIdForMaintenanceList(); //Function to specify the label Id corrosponding to unit of time or distance or oil settings

           if(this._tireMaintenanceMode !== "Off")
           {
               if(this._country !== "Japan")
               {
                    this._MaintenanceListCtxtDataList.items[1].label1Id = this._dueUnitDistance;
                    this._MaintenanceListCtxtDataList.items[1].label1SubMap = {"dueInDistance" : this._tireRotationDistance};
                    this._MaintenanceListCtxtDataList.items[1].labelWidth = "wide";
                    this._MaintenanceListCtxtDataList.items[1].label1Align = "left";
                    this._currentContextTemplate.list2Ctrl.updateItems(1,1);
               }
           } 
      }
};

schedmaintApp.prototype._updateDataOilDistanceCtrl = function()
{
    if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "OilChangeDetail")
    {
        if(this._oilMaintenanceMode !== "Off")
        {
                if(this._distanceUnit === "MILE")
                {
                    if(this._oilMaintDistance < 500)
                    {
                        this._oilChangeCtxtDataList.items[1].min = this._oilMaintDistance; //To disable "-" button less than or equal to 500 miles. 
                    }
                    else
                    {
                        this._oilChangeCtxtDataList.items[1].min = this._minIncreamentValue;
                    }   
                }
                else if(this._distanceUnit === "KM")
                {
                    if(this._oilMaintDistance < 1000)
                    {
                        this._oilChangeCtxtDataList.items[1].min = this._oilMaintDistance; //To disable "-" button less than or equal to 1000 Km. 
                    }
                    else
                    {
                        this._oilChangeCtxtDataList.items[1].min = this._minIncreamentValue;
                    }   
                }   
                var distanceComparison = this._oilChangeCtxtDataList.items[1].value;
                this._oilChangeCtxtDataList.items[1].label2 = this._oilMaintDistance;
                this._oilChangeCtxtDataList.items[1].label2Id = this._distanceUnit;
                this._oilChangeCtxtDataList.items[1].label2SubMap = {"value" : this._oilMaintDistance};
                this._oilChangeCtxtDataList.items[1].value = this._oilMaintDistance;
                this._oilChangeCtxtDataList.items[1].increment = this._increamentScale;
                if( this._responseDistanceOilTime >= 200 && (distanceComparison != this._oilMaintDistance) )
                {
                    this._currentContextTemplate.list2Ctrl.updateItems(1,1);
                }
                else if(distanceComparison == this._oilMaintDistance)
                {
                    this._currentContextTemplate.list2Ctrl.updateItems(1,1);
                }
                
                //Re-initialize for minimum boundary condition so that the - sign is displayed correctly.
                //Handles the case for < 1000 km
                this._oilChangeCtxtDataList.items[1].min = this._minIncreamentValue;
        }
      }
      else if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "MaintenanceList")
      {
           if(this._oilMaintenanceMode !== "Off")
           {
                this._rangeExceedCheck();  // function to check distance values within range
                this._labelIdForMaintenanceList();  //Function to assign label Ids
                
                if(this._country === "US" || this._country === "EU" || this._country !== "Japan")
                {
                    if(this._oilMaintenanceMode === "Fixed" || this._oilMaintenanceMode === "On")
                    {
                        this._oilMaintenanceStatus = this._oilMaintDistance;
                    } 
                    
                    this._MaintenanceListCtxtDataList.items[2].label1Id = this._dueUnitOil;
                    this._MaintenanceListCtxtDataList.items[2].label1SubMap = {"dueInOil" : this._oilMaintenanceStatus};
                    this._currentContextTemplate.list2Ctrl.updateItems(2,2);
                }
                else if(this._country === "Japan")
                {
                    if(this._oilMaintenanceMode === "Fixed" || this._oilMaintenanceMode === "On")
                    {
                        this._oilMaintenanceMode = "On";
                    }
                    
                    this._MaintenanceListCtxtDataList.items[1].label1Id = this._dueUnitOil;
                    this._MaintenanceListCtxtDataList.items[1].label1SubMap = {"dueInOil" : this._oilMaintDistance};
                    this._currentContextTemplate.list2Ctrl.updateItems(1,1);
                }
           }
      }
 };

schedmaintApp.prototype._updateDataOilLifeCtrl = function() //Helper function to update oil life value
{
    if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "OilChangeDetail")
    {
         if(this._updateOilValue) //Update only if value has updated
         {
             if(this._oilMaintenanceMode !== "Off")
             {
                 this._oilChangeCtxtDataList.items[1].label1 = this._oilLifeValue;
                 this._currentContextTemplate.list2Ctrl.updateItems(1,1);
             }
         }
    }
    else if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "MaintenanceList")
    {
        if(this._updateOilValue) //Update only if value has updated
        {
            if(this._country === "US" || this._country === "EU" || this._country !== "Japan")
            {
                 this._labelIdForMaintenanceList(); //Function to assign label Ids
                 if(this._oilMaintenanceMode === "Flexible")
                 {
                     if(this._oilDeteriorationLevel > 100 || this._oilDeteriorationLevel < 0)
                     {
                          this._oilMaintenanceStatus = "--";  
                     }
                     else
                     {    
                          this._oilMaintenanceStatus = this._oilDeteriorationLevel;
                     }
                     
                     this._MaintenanceListCtxtDataList.items[2].label1Id = this._dueUnitOil;
                     this._MaintenanceListCtxtDataList.items[2].label1SubMap = {"dueInOil" : this._oilMaintenanceStatus };
                     this._currentContextTemplate.list2Ctrl.updateItems(2,2);
                 }
            }
        }
    }
};

schedmaintApp.prototype._updateDataDueControl = function() //Helper function to update the status of maintenance due
{
    if(this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "MaintenanceList")
    {
        if(this._schedmaintDue != null) //List Item in red font color when schedule maintenance is due
        {
               if(this._schedmaintTimeDue != null) //List Item in red font color when schedule maintenance time is due
               {
                    if(this._schedmaintTimeDue)
                    {
                        if(this._scheduleMaintenanceMode !== "Off")
                        {
                            this._MaintenanceListCtxtDataList.items[0].label1Warning = true;
                        }    
                    }
                    else
                    {
                        this._MaintenanceListCtxtDataList.items[0].label1Warning = false;
                    }   
               }
                    
               if(this._schedmaintDistanceDue != null) //List Item in red font color when schedule maintenance distance is due
               {
                    if(this._schedmaintDistanceDue)
                    {
                        if(this._scheduleMaintenanceMode !== "Off")
                        {
                            this._MaintenanceListCtxtDataList.items[0].label2Warning = true;
                        }
                    }
                    else
                    {
                        this._MaintenanceListCtxtDataList.items[0].label2Warning = false;
                    }   
               }
        }
        if(this._tiremaintDue != null) //List Item in red font color when Tire Rotation is due
        {
                 if(this._country !== "Japan")
                 {
                     if(this._tiremaintDue === "true")
                     {
                        if(this._tireMaintenanceMode !== "Off")
                        {
                            this._MaintenanceListCtxtDataList.items[1].label1Warning = true;
                        }
                     }
                     else if(this._tiremaintDue === "false")
                     {
                        this._MaintenanceListCtxtDataList.items[1].label1Warning = false;
                     }
                     else
                     {
                         log.debug("No Condition matching for tire maintenance due");
                     }   
                 }   
        }
        if(this._oilmaintDue != null) //List Item in red font color when Oil Change is due
        {
                if(this._country === "Japan")
                {
                        if(this._oilmaintDue === "true")
                        {
                            if(this._oilMaintenanceMode !== "Off")
                            {
                                this._MaintenanceListCtxtDataList.items[1].label1Warning = true;
                            }
                        }
                        else if(this._oilmaintDue === "false")
                        {
                             this._MaintenanceListCtxtDataList.items[1].label1Warning = false;
                        }   
                        else
                        {
                             log.debug("No Condition matching for Oil maintenance due when country is Japan");
                        }   
                }
                else
                {
                    if(this._oilMaintenanceMode === "Fixed" && this._oilDistanceDue)
                    {
                        if(this._oilMaintenanceMode !== "Off")
                        {
                            this._MaintenanceListCtxtDataList.items[2].label1Warning = true;
                        }   
                    }
                    else if(this._oilMaintenanceMode === "Fixed" && (!this._oilDistanceDue))
                    {
                        this._MaintenanceListCtxtDataList.items[2].label1Warning = false;
                    }
                    else if(this._oilMaintenanceMode === "Flexible" && this._oilLifeDue)
                    {
                        if(this._oilMaintenanceMode !== "Off")
                        {
                            this._MaintenanceListCtxtDataList.items[2].label1Warning = true;
                        }
                    }
                    else if(this._oilMaintenanceMode === "Flexible" && (!this._oilLifeDue))
                    {
                        this._MaintenanceListCtxtDataList.items[2].label1Warning = false;
                    }
                    else if(this._oilMaintenanceMode === "Off")
                    {
                        this._MaintenanceListCtxtDataList.items[2].label1Warning = false;
                    }   
                    else
                    {
                        log.debug("No Condition matching for Oil maintenance due");
                    }   
                }
        }
        if((this._schedmaintDue || this._tiremaintDue || this._oilmaintDue ) != null )  // Changing title "Schedule Maintenance Due" if it is true
        {
            this._setDueList();
        }
        this._currentContextTemplate.list2Ctrl.updateItems(0, this._MaintenanceListCtxtDataList.itemCount - 1);
    }
};

schedmaintApp.prototype._updateSettingControl = function() //Helper function to change the settings of all three maintenance on MaintenanceList context
{
    if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "MaintenanceList")
    {
        this._rangeExceedCheck(); //Function to verify the distance value in specified range.
        this._labelIdForMaintenanceList(); //Function to specify the label Id corrosponding to unit of time or distance or oil settings
        
        //When Maintenance modes are Off
        if(this._scheduleMaintenanceMode === "Off")
        {
            this._MaintenanceListCtxtDataList.items[0].itemStyle = "style06";
            this._MaintenanceListCtxtDataList.items[0].label1Align = "center";
            this._MaintenanceListCtxtDataList.items[0].labelWidth = "normal";
            this._MaintenanceListCtxtDataList.items[0].label1Id = this._scheduleMaintenanceMode;
        }
        if(this._tireMaintenanceMode === "Off")
        {
            if(this._country !== "Japan")
            {
                   this._MaintenanceListCtxtDataList.items[1].label1Id = this._tireMaintenanceMode;
                   this._MaintenanceListCtxtDataList.items[1].label1Align = "center";
                   this._MaintenanceListCtxtDataList.items[1].labelWidth = "normal";
            }   
        }
        if(this._oilMaintenanceMode === "Off")
        {
            if(this._country === "Japan")
            {
                  this._MaintenanceListCtxtDataList.items[1].label1Id = this._oilMaintenanceMode;
                  this._MaintenanceListCtxtDataList.items[1].label1Align = "center";
                  this._MaintenanceListCtxtDataList.items[1].labelWidth = "normal";
            }
            if(this._country !== "Japan")
            {
                  this._MaintenanceListCtxtDataList.items[2].label1Id = this._oilMaintenanceMode;
                  this._MaintenanceListCtxtDataList.items[2].label1Align = "center";
                  this._MaintenanceListCtxtDataList.items[2].labelWidth = "normal";
            }
        }
        //When Maintenance modes are On
        if(this._scheduleMaintenanceMode === "On")
        {
            if(this._country === "Japan")
            {
                  this._MaintenanceListCtxtDataList.items[0].itemStyle = "style06";
                  this._MaintenanceListCtxtDataList.items[0].label1Id = this._dueTimeId;
                  this._MaintenanceListCtxtDataList.items[0].label1SubMap = {"dueInTime" : this._schedmaintTime};
                  this._MaintenanceListCtxtDataList.items[0].label1Align = "left";
                  this._MaintenanceListCtxtDataList.items[0].labelWidth = "wide";
            }
            else if(this._country !== "Japan")
            {
                  this._MaintenanceListCtxtDataList.items[0].itemStyle = "style07";
                  this._MaintenanceListCtxtDataList.items[0].label1Id = this._dueTimeId;
                  this._MaintenanceListCtxtDataList.items[0].label1SubMap = {"dueInTime" : this._schedmaintTime};
                  this._MaintenanceListCtxtDataList.items[0].label1Align = "left";
                  this._MaintenanceListCtxtDataList.items[0].label2Id = this._dueUnitDistance;
                  this._MaintenanceListCtxtDataList.items[0].label2SubMap = {"dueInDistance" : this._schedmaintDistance};
                  this._MaintenanceListCtxtDataList.items[0].label2Align = "left";
                  this._MaintenanceListCtxtDataList.items[0].labelWidth = "wide";
            }
            
        }
        if(this._tireMaintenanceMode === "On")
        {
            if(this._country !== "Japan")
            {
                 this._MaintenanceListCtxtDataList.items[1].label1Id = this._dueUnitDistance;
                 this._MaintenanceListCtxtDataList.items[1].label1SubMap = {"dueInDistance" : this._tireRotationDistance};
                 this._MaintenanceListCtxtDataList.items[1].label1Align = "left";
                 this._MaintenanceListCtxtDataList.items[1].labelWidth = "wide";
            }   
        }
        if(this._oilMaintenanceMode !== "Off")
        {
                if(this._country === "Japan")
                {
                    this._MaintenanceListCtxtDataList.items[1].label1Id = this._dueUnitOil;
                    this._MaintenanceListCtxtDataList.items[1].label1SubMap = {"dueInOil" : this._oilMaintDistance };
                    this._MaintenanceListCtxtDataList.items[1].label1Align = "left";
                    this._MaintenanceListCtxtDataList.items[1].labelWidth = "wide";
                }
                else if(this._country !== "Japan")
                {
                    if(this._oilMaintenanceMode === "Fixed" || this._oilMaintenanceMode === "On")
                    {
                        this._oilMaintenanceStatus = this._oilMaintDistance;
                    } 
                    if(this._oilMaintenanceMode === "Flexible")
                    {
                        if(this._oilDeteriorationLevel > 100 || this._oilDeteriorationLevel < 0)
                        {
                            this._oilMaintenanceStatus = "--";  
                        }
                        else
                        {    
                            this._oilMaintenanceStatus = this._oilDeteriorationLevel;
                        }
                    }
                    
                    this._MaintenanceListCtxtDataList.items[2].label1Id = this._dueUnitOil;
                    this._MaintenanceListCtxtDataList.items[2].label1SubMap = {"dueInOil" : this._oilMaintenanceStatus};
                    this._MaintenanceListCtxtDataList.items[2].label1Align = "left";
                    this._MaintenanceListCtxtDataList.items[2].labelWidth = "wide";
                }
         }
         this._currentContextTemplate.list2Ctrl.updateItems(0, this._MaintenanceListCtxtDataList.itemCount - 1);
    }   
};

schedmaintApp.prototype._updateOffMessageCtrl = function() //Helper function to set the ConfirmOff message according to the maintenance type
{
    if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "ConfirmOff")
    {
        switch(this._currentRunningApp)
        {
            case "Scheduled Maintenance":
            {
                this._currentContextTemplate.dialog3Ctrl.setText1Id("confirmOffSchedule");
            }
            break;
            case "Tire Rotation":
            {
                this._currentContextTemplate.dialog3Ctrl.setText1Id("confirmOffTire");
            }
            break;
            case "Oil Change" :
            {
                this._currentContextTemplate.dialog3Ctrl.setText1Id("confirmOffOil");
            }
            break;
            default:
                log.debug("Context not found");
        }
    }   
};

schedmaintApp.prototype._updateResetMessageCtrl = function() //Helper function to set the ConfirmReset message according to the maintenance type
{
    if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "ConfirmReset")
    {
        switch(this._currentRunningApp)
        {
            case "Scheduled Maintenance":
            {
                this._currentContextTemplate.dialog3Ctrl.setText1Id("confirmResetSchedule");
            }
            break;
            case "Tire Rotation":
            {
                this._currentContextTemplate.dialog3Ctrl.setText1Id("confirmResetTire");
            }
            break;
            case "Oil Change" :
            {
                this._currentContextTemplate.dialog3Ctrl.setText1Id("confirmResetOil");
            }
            break;
            default:
                log.debug("Context not found");
        }
    }   
};

schedmaintApp.prototype._titleCheck = function() //Helper function to set the title for all three maintenance types
{
    var str = 0;
    if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "ScheduledMaintenanceDetail")
    {
        if(this._schedmaintDue === "true" || this._schedmaintDue === "True") //Change title of schedule maintenance is due
        {
              if(this._country !== "Japan")
              {
                   str = 
                   {        
                         titleStyle : "style02a",
                         text1Id : "scheduledMaintenanceDue",
                         image1:'apps/schedmaint/images/Icn_Warning_75.png',
                         styleMod : 'both'
                   };
              }
              else
              {
                   if(this._schedmaintTimeDue == true)
                   {
                         str = 
                         {        
                                 titleStyle : "style02a",
                                 text1Id : "scheduledMaintenanceDue",
                                 image1:'apps/schedmaint/images/Icn_Warning_75.png',
                                 styleMod : 'both'
                         };
                   }    
              }
        }
        else if(this._schedmaintDue === "false" || this._schedmaintDue === "False")    //Changing title "Schedule Maintenance" if it is false 
        {
              if(this._country !== "Japan")
              {
                   str = 
                   {    
                             text1Id : "scheduled",
                             titleStyle : "style02"
                   };
              }
              else
              {
                   if(this._schedmaintTimeDue == false) //Japan country only have time due setting not the distance due
                   {
                        str = 
                        {    
                                 text1Id : "scheduled",
                                 titleStyle : "style02"
                        };
                   }    
              } 
         }
    }
    
    else if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "TireRotationDetail")
    {
        if(this._tiremaintDue === "true" || this._tiremaintDue === "True") //Change title of Tire maintenance when maintenance is due
        {
             str = 
             {    
                     text1Id : "tireRotationDue",
                     titleStyle : "style02a",
                     image1:'apps/schedmaint/images/Icn_Warning_75.png',
                     styleMod : 'both'
             };
        }   
        else if(this._tiremaintDue === "false" || this._tiremaintDue === "False") //Change title of Tire maintenance when maintenance is not due
        {
             str = 
             {    
                    text1Id : "tireRotation",
                    titleStyle : "style02"
             };
        }
    }
    
    else if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "OilChangeDetail")
    {
        if(this._oilmaintDue === "true" || this._oilmaintDue === "True") //Change title of Oil  maintenance when maintenance is due
        {
                if(this._country !== "Japan")
                {
                    if(this._oilMaintenanceMode === "Fixed" && this._oilDistanceDue == true)
                    {
                        str = 
                        {    
                                 text1Id : "oilChangeDue",
                                 titleStyle : "style02a",
                                 image1:'apps/schedmaint/images/Icn_Warning_75.png',
                                 styleMod : 'both'
                        };
                    }
                    else if(this._oilMaintenanceMode === "Flexible" && this._oilLifeDue == true )
                    {
                        str = 
                        {    
                                 text1Id : "oilChangeDue",
                                 titleStyle : "style02a",
                                 image1:'apps/schedmaint/images/Icn_Warning_75.png',
                                 styleMod : 'both'
                        };
                    }   

                }
                else
                {
                    if(this._oilDistanceDue == true)
                    {
                        str = 
                        {    
                                 text1Id : "oilChangeDue",
                                 titleStyle : "style02a",
                                 image1:'apps/schedmaint/images/Icn_Warning_75.png',
                                 styleMod : 'both'
                        };
                    }   
                }   
                this._setDueTitle(str);
        }   
        else if(this._oilmaintDue === "false" || this._oilmaintDue === "False") //Change title of Oil maintenance when maintenance is due
        {
                if(this._country !== "Japan")
                {
                    if(this._oilMaintenanceMode === "Fixed" && this._oilDistanceDue == false)
                    {
                        str = 
                        {    
                                text1Id : "oilChange",
                                titleStyle : "style02"
                        };
                    }
                    else if(this._oilMaintenanceMode === "Flexible" && this._oilLifeDue == false )
                    {
                         str = 
                         {    
                                text1Id : "oilChange",
                                titleStyle : "style02"
                         };
                    }
               }
               else
               {
                    if(this._oilDistanceDue == false)
                    {
                       str = 
                       {    
                                text1Id : "oilChange",
                                titleStyle : "style02"
                       };
                    }   
               }
               this._setDueTitle(str);
         }
    }
    
    this._setDueTitle(str);
};

schedmaintApp.prototype._incrementScaleCheck = function() //To set the increament scale when time or distance is changed using +/- button
{
    var incrementScaleDistance = 0;
    if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "ScheduledMaintenanceDetail")
    {
        incrementScaleDistance = this._incrementScaleDistance(this._schedmaintDistance); //This function will return the distance increment factor
        if(this._distanceUnit === "KM")  //To define the min/max value and increment factor.
        {
              this._minIncreamentValue = 1000;
              this._maxIncreamentValue = 99500;
              
              if(this._schedmaintDistance < 1000)
              {
                  this._increamentScale = 1000 - this._schedmaintDistance;
              }
              else
              { 
                  this._increamentScale = incrementScaleDistance;
              } 
        }
        else if(this._distanceUnit === "MILE") //To define the min/max value and increment factor.
        {
              this._minIncreamentValue = 500;
              this._maxIncreamentValue = 99750;
              if(this._schedmaintDistance < 500)
              {
                  this._increamentScale = 500 - this._schedmaintDistance;
              }
              else
              { 
                  this._increamentScale = incrementScaleDistance;
              }  
        }
        
        if(this._schedmaintDuration < 30) //To define the increment factor when time is less than or equal to 30 days.
        {
             this._increamentScaleTime = 30 - this._schedmaintDuration;
        }
        
        else if(this._schedmaintDuration >= 30) //To define the increment factor when time is less than or equal to 30 days.
        {
             this._increamentScaleTime = 1; 
        }
    }
    
    else if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "TireRotationDetail")
    {
        incrementScaleDistance = this._incrementScaleDistance(this._tireRotationDistance); //This function will return the distance increment factor
        if(this._distanceUnit === "KM")  //To define the min/max value and increment factor.
        {
              this._minIncreamentValue = 1000;
              this._maxIncreamentValue = 99500;
              if(this._tireRotationDistance < 1000)
              {
                this._increamentScale = 1000 - this._tireRotationDistance;
              }
              else
              { 
                  this._increamentScale = incrementScaleDistance;
              } 
        }
        else if(this._distanceUnit === "MILE") //To define the min/max value and increment factor.
        {
            this._minIncreamentValue = 500;
            this._maxIncreamentValue = 99750;
            
            if(this._tireRotationDistance < 500)
            {
                this._increamentScale = 500 - this._tireRotationDistance;
            }
            else
            {   
              this._increamentScale = incrementScaleDistance;
            }  
        } 
    }
    
    else if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "OilChangeDetail")
    {
        incrementScaleDistance = this._incrementScaleDistance(this._oilMaintDistance); //This function will return the distance increment factor
        if(this._distanceUnit === "KM")  //To define the min/max value and increment factor.
        {
             this._minIncreamentValue = 1000;
             this._maxIncreamentValue = 99500;
             if(this._oilMaintDistance < 1000)
             {
                 this._increamentScale = 1000 - this._oilMaintDistance;
             }
             else
             {  
                 this._increamentScale = incrementScaleDistance;
             } 
        }
        else if(this._distanceUnit === "MILE") //To define the min/max value and increment factor.
        {
             this._minIncreamentValue = 500;
             this._maxIncreamentValue = 99750;
             if(this._oilMaintDistance < 500)
             {
                 this._increamentScale = 500 - this._oilMaintDistance;
             }
             else
             {  
                 this._increamentScale = incrementScaleDistance;
             }  
        }
    }
};

schedmaintApp.prototype._incrementScaleDistance = function(distanceValue,controlValue)
{
    var modulesFactorDistance = 0;
    var incrementScaleDistance = 0;
    if(this._distanceUnit === "MILE")
    {
        modulesFactorDistance = distanceValue % 250;
        incrementScaleDistance = 250 - modulesFactorDistance;
    }
    else if(this._distanceUnit === "KM")
    {
        modulesFactorDistance = distanceValue % 500;
        incrementScaleDistance = 500 - modulesFactorDistance;
    }
    else
    {
        log.debug("No Distance unit found");
    }
    if(controlValue) //Control value is value return from pressing + or - button  and distance value is current distance value
    {
        if(controlValue < distanceValue)
        {
            if(this._distanceUnit === "MILE")
            {
                modulesFactorDistance = distanceValue % 250;
                incrementScaleDistance = modulesFactorDistance;
            }
            else if(this._distanceUnit === "KM")
            {
                modulesFactorDistance = distanceValue % 500;
                incrementScaleDistance = modulesFactorDistance;
            }
            else
            {
                log.debug("No Condition found");
            }   
        }
        else if(controlValue == distanceValue)
        {
            incrementScaleDistance = 0; //No increment or decrement required.
        }
    }   
    return incrementScaleDistance;
};

//End Of Helper fuctions

/****List Item Click Call Back function***/

schedmaintApp.prototype._listItemClickCallback = function(listCtrlObj, appData, params)
{
    this._selectedButtonSchedmaint = null;
    this._selectedButtonTiremaint = null;
    var selectedButtonOilmaint = null;
    this._buttonClicked = params.additionalData; // Variable to store value of clicked button 
    this._itemIndex = params.itemIndex;        // For selecting list item data
    var value = params.value;

    switch (this._currentContext.ctxtId)
    {
        case "MaintenanceList" :   //_listItemClickCallback for MaintenanceList Context
           switch(appData)
            {
                case "SelectScheduledMaintenance" :
                    framework.sendEventToMmui(this.uiaId, appData);
                    break;
                                    
                case "SelectTireRotation" :
                    framework.sendEventToMmui(this.uiaId, appData);
                    break;
                    
                case "SelectOilChange" :
                    framework.sendEventToMmui(this.uiaId, appData);
                    break;
                default:
                    log.debug("schedmaintApp: Unknown Appdata", appData);
                    break;
            }
           
           break;   //End of_listItemClickCallback for MaintenanceList Context
           
        case "ScheduledMaintenanceDetail" :   //listItemClickCallback for ScheduledMaintenanceDetail Context
            switch(appData)
             {
                 case "SetSchedMaintOnOff" :
                     this._schedmaintCtxtDataList.items[0].selected = this._buttonClicked;
                     this._scheduleMaintenanceSettingMode = this._schedmaintCtxtDataList.items[0].selected;
                     
                     if (this._scheduleMaintenanceSettingMode == 1) // When On button is  clicked
                     {
                         this._selectedButtonSchedmaint = "On";
                     }

                     else if (this._scheduleMaintenanceSettingMode == 2) // When Off button is clicked
                     {
                         this._selectedButtonSchedmaint = "Off";
                     }
                     var params =
                     {
                         "payload" :
                             {
                                 "schedMaint" : this._selectedButtonSchedmaint
                             }
                     };
                     framework.sendEventToMmui(this.uiaId, appData, params);
                     break;

                 case "SetTimeValue":
                    var currentLabelId = listCtrlObj.dataList.items[this._itemIndex].label2Id;
                    if ("months" === currentLabelId && value == 1)
                    {
                          // label and value don't match -> label should change to plural
                            this._schedmaintCtxtDataList.items[1].min = 30;     //To disable "-" button at 30 days value
                            listCtrlObj.dataList.items[this._itemIndex].value = 30;
                            listCtrlObj.dataList.items[this._itemIndex].label2Id = "days";
                            listCtrlObj.updateItems(this._itemIndex, this._itemIndex);
                            this._newTimeValue = 1;
                    }
                   else if ( "days" === currentLabelId && value < 30)
                   {
                          // label and value don't match -> label should change to plural
                            this._schedmaintCtxtDataList.items[1].min = value;
                            this._schedmaintDays = value;
                            listCtrlObj.dataList.items[this._itemIndex].label2Id = "days";
                            listCtrlObj.updateItems(this._itemIndex, this._itemIndex);
                            this._newTimeValue = 0;
                   }
                  else if ( "days" === currentLabelId && value == 30)
                   {
                          // label and value don't match -> label should change to plural
                            this._schedmaintCtxtDataList.items[1].min = 30; 
                            listCtrlObj.dataList.items[this._itemIndex].value = 30;
                            this._schedmaintDays = value;
                            listCtrlObj.dataList.items[this._itemIndex].label2Id = "days";
                            listCtrlObj.updateItems(this._itemIndex, this._itemIndex);
                            this._newTimeValue = 1;
                  }
                  else if ( "day" === currentLabelId && value <= 1)
                  {
                           // label and value don't match -> label should change to plural
                           this._schedmaintCtxtDataList.items[1].min = value;
                           this._schedmaintDays = value;
                           listCtrlObj.dataList.items[this._itemIndex].label2Id = "day";
                           listCtrlObj.updateItems(this._itemIndex, this._itemIndex);
                           this._newTimeValue = 0;
                  }
                 else if ( "day" === currentLabelId && value == 30)
                 {
                           // label and value don't match -> label should change to plural
                           this._schedmaintCtxtDataList.items[1].min = value;
                           this._schedmaintDays = value;
                           listCtrlObj.dataList.items[this._itemIndex].label2Id = "days";
                           listCtrlObj.updateItems(this._itemIndex, this._itemIndex);
                           this._newTimeValue = 1;
                 }  

                 else if ("days" === currentLabelId && value > 30)
                 {
                        // label and value don't match -> label should change to plural
                          this._schedmaintCtxtDataList.items[1].min = 1;
                          listCtrlObj.dataList.items[this._itemIndex].value = 2;
                          listCtrlObj.dataList.items[this._itemIndex].label2Id = "months";
                          listCtrlObj.updateItems(this._itemIndex, this._itemIndex);
                          this._newTimeValue = 2;
                 }
                 else
                 {
                          listCtrlObj.dataList.items[this._itemIndex].value = value;
                          this._newTimeValue = value;
                 }
                    
                 var date = new Date();
                 this._timerTimeRequest = date.getTime(); //Time in millisecond while request from GUI
                 log.debug("Setting time by user in ScheduledMaintenanceDetail"+this._newTimeValue);
                 if(this._newTimeValue != 0)
                 {
                     payload = { "payload" : { "TimeValue" : this._newTimeValue }};
                     framework.sendEventToMmui(this.uiaId, appData, payload);
                 }   
                 break;

                 case "SetDistanceValue":
                     currentLabelId = listCtrlObj.dataList.items[this._itemIndex].label2Id;
                     var incrementScaleDistance = 0;
                     
                     if(currentLabelId === "MILE")
                     {
                         if(value < 500)  //To disable "-" button at less than 500 miles.
                         {
                             listCtrlObj.dataList.items[this._itemIndex].increment = 500 - value;
                             this._schedmaintCtxtDataList.items[2].min = this._schedmaintDistance; 
                         }
                         else  //To disable "-" button at more than or equal to 500 miles. 
                         {
                             listCtrlObj.dataList.items[this._itemIndex].increment = 250;
                             this._schedmaintCtxtDataList.items[2].min = 500;
                         }
                         if( value % 250 != 0) //This condition will invoke when schedmaint distance value is not multiple of 250 and user is decresing the value.
                         {
                             incrementScaleDistance = this._incrementScaleDistance(this._schedmaintDistance, value);
                             this._schedmaintCtxtDataList.items[this._itemIndex].value = this._schedmaintDistance - incrementScaleDistance;
                             this._currentContextTemplate.list2Ctrl.updateItems(this._itemIndex, this._itemIndex);
                             value = this._schedmaintCtxtDataList.items[this._itemIndex].value;
                         }
                     }
                     else if(currentLabelId === "KM") //To disable "-" button at less than 1000 km.
                     {
                         if(value < 1000)
                         {
                             listCtrlObj.dataList.items[this._itemIndex].increment = 1000 - value;
                             this._schedmaintCtxtDataList.items[2].min = this._schedmaintDistance;  
                         }
                         else     //To disable "-" button at more than or equal to 1000 km. 
                         {
                             listCtrlObj.dataList.items[this._itemIndex].increment = 500;
                             this._schedmaintCtxtDataList.items[2].min = 1000; 
                         }
                         if( value % 500 != 0) //This condition will invoke when schedmaint distance value is not multiple of 500 and user is decresing the value.
                         {
                            incrementScaleDistance = this._incrementScaleDistance(this._schedmaintDistance, value);
                            this._schedmaintCtxtDataList.items[this._itemIndex].value = this._schedmaintDistance - incrementScaleDistance;
                            this._currentContextTemplate.list2Ctrl.updateItems(this._itemIndex, this._itemIndex);
                            value = this._schedmaintCtxtDataList.items[this._itemIndex].value;
                         }
                     }
                     else
                     {
                        log.debug("No condition for distance unit");
                     }
                     
                     this._newDistanceValue = value;
                     var date = new Date();
                     this._timerDistanceRequest = date.getTime(); //Time in millisecond while request from GUI
                     
                     log.debug("Setting distance by user in ScheduledMaintenanceDetail"+this._newDistanceValue);
                     payload = { "payload" : { "DistanceValue" : this._newDistanceValue }};
                     framework.sendEventToMmui(this.uiaId, appData, payload);
                     break;
                     
                 case "SelectReset" : 
                     framework.sendEventToMmui(this.uiaId, appData);
                     break;   

                 default:
                     log.debug("schedmaintApp: Unknown Appdata", appData);
                     break;
             }
            
             break; //End of_listItemClickCallback for ScheduledMaintenanceDetail Context
             
        case "TireRotationDetail" :   //listItemClickCallback for TireRotationDetail Context
            switch(appData)
             {
                 case "SetTireRotationOnOff" : 
                     
                    this._tireRotationCtxtDataList.items[0].selected = this._buttonClicked;
                    this._tireRotationSettingMode = this._tireRotationCtxtDataList.items[0].selected;
                    
                    if(this._tireRotationSettingMode == 1)
                    {
                        this._selectedButtonTiremaint = "On";
                    }
                    
                    else if(this._tireRotationSettingMode == 2)
                    {
                        this._selectedButtonTiremaint = "Off";
                    }
                    var params =
                    {
                        "payload" :
                         {
                             "tireRotation" :this._selectedButtonTiremaint                                  
                         }
                    };
                    
                    framework.sendEventToMmui(this.uiaId, appData, params);
                    break;
                     
                 case "SetDistanceValue" :
                     currentLabelId = listCtrlObj.dataList.items[this._itemIndex].label2Id;
                     var incrementScaleDistance = 0;
                     
                     if(currentLabelId === "MILE")
                     {
                         if(value < 500)
                         {
                             listCtrlObj.dataList.items[this._itemIndex].increment = 500 - value;
                             this._tireRotationCtxtDataList.items[1].min = this._tireRotationDistance; 
                         }
                         else
                         {
                             listCtrlObj.dataList.items[this._itemIndex].increment = 250;
                             this._tireRotationCtxtDataList.items[1].min = 500; 
                         }
                         if( value % 250 != 0) //This condition will invoke when tire distance value is not multiple of 250 and user is decresing the value.
                         {
                             incrementScaleDistance = this._incrementScaleDistance(this._tireRotationDistance, value);
                             this._tireRotationCtxtDataList.items[this._itemIndex].value = this._tireRotationDistance - incrementScaleDistance;
                             this._currentContextTemplate.list2Ctrl.updateItems(this._itemIndex, this._itemIndex);
                             value = this._tireRotationCtxtDataList.items[this._itemIndex].value;
                         }
                     }
                     else if(currentLabelId === "KM")
                     { 
                         if(value < 1000)
                         {
                             listCtrlObj.dataList.items[this._itemIndex].increment = 1000 - value;
                             this._tireRotationCtxtDataList.items[1].min = this._tireRotationDistance;  
                         }
                         else
                         {
                             listCtrlObj.dataList.items[this._itemIndex].increment = 500;
                             this._tireRotationCtxtDataList.items[1].min = 1000;  
                         }
                         if( value % 500 != 0) //This condition will invoke when tire distance value is not multiple of 500 and user is decresing the value.
                         {
                             incrementScaleDistance = this._incrementScaleDistance(this._tireRotationDistance, value);
                             this._tireRotationCtxtDataList.items[this._itemIndex].value = this._tireRotationDistance - incrementScaleDistance;
                             this._currentContextTemplate.list2Ctrl.updateItems(this._itemIndex, this._itemIndex);
                             value = this._tireRotationCtxtDataList.items[this._itemIndex].value;
                         }
                     }
                     
                     this._newDistanceValue = value;
                     var date = new Date();
                     this._timerTireDistanceRequest = date.getTime();  //Time in millisecond while request from GUI
                     
                     log.debug("Setting distance by user in TireRotationDetail"+this._newDistanceValue);
                     payload = { "payload" : { "DistanceValue" : this._newDistanceValue }};
                    
                     framework.sendEventToMmui(this.uiaId, appData, payload);
                     break;
                     
                 case "SelectReset" :  
                     framework.sendEventToMmui(this.uiaId, appData);
                     break;   
                     
                 default:
                     log.debug("schedmaintApp: Unknown Appdata", appData);
                     break;
             }
             break; //End of_listItemClickCallback for TireRotationDetail Context
      

      case "OilChangeDetail" :   //listItemClickCallback for OilChangeDetail Context
            switch(appData)
             {
               case "SelectSettingInterval" :
                     if(this._country === "US")
                     {
                          selectedButtonOilmaint = "Setting";
                     }
                     else if(this._country === "Japan") 
                     {
                          this._oilChangeSettingMode = this._buttonClicked; // Variable to store value of clicked button 
                          if(this._oilChangeSettingMode == 1)
                          {
                               selectedButtonOilmaint = "On";
                          }
                          else if(this._oilChangeSettingMode == 2)
                          {
                                 selectedButtonOilmaint = "Off";
                          }
                     }
                     if(this._oilSettingShow === "OnOff")
                     {
                          this._oilChangeSettingMode = this._buttonClicked; // Variable to store value of clicked button 
                          if(this._oilChangeSettingMode == 1)
                          {
                               selectedButtonOilmaint = "On";
                          }
                                             
                          if(this._oilChangeSettingMode == 2)
                          {
                               selectedButtonOilmaint = "Off";
                          }
                     }
                     var params =
                     {
                         "payload" :
                          {
                               "settingValue" : selectedButtonOilmaint
                          }
                     };

                     if(this._country !== "EU")
                     {
                         framework.sendEventToMmui(this.uiaId, appData, params);
                     }   
                     break;
                     
                 case "SetDistanceValue" :
                     currentLabelId = listCtrlObj.dataList.items[this._itemIndex].label2Id;
                     if(currentLabelId === "MILE")
                     { 
                         if(value < 500)
                         {
                             listCtrlObj.dataList.items[this._itemIndex].increment = 500 - value;
                             this._oilChangeCtxtDataList.items[1].min = this._oilMaintDistance; 
                         }
                         else
                         {
                             listCtrlObj.dataList.items[this._itemIndex].increment = 250;
                             this._oilChangeCtxtDataList.items[1].min = 500; 
                         }
                         if( value % 250 != 0) //This condition will invoke when oil distance value is not multiple of 250 and user is decresing the value.
                         {
                             incrementScaleDistance = this._incrementScaleDistance(this._oilMaintDistance, value);
                             this._oilChangeCtxtDataList.items[this._itemIndex].value = this._oilMaintDistance - incrementScaleDistance;
                             this._currentContextTemplate.list2Ctrl.updateItems(this._itemIndex, this._itemIndex);
                             value = this._oilChangeCtxtDataList.items[this._itemIndex].value;
                         }
                     }
                     else if(currentLabelId === "KM")
                     { 
                         if(value < 1000)
                         {
                             listCtrlObj.dataList.items[this._itemIndex].increment = 1000 - value;
                             this._oilChangeCtxtDataList.items[1].min = this._oilMaintDistance; 
                         }
                         else
                         {
                             listCtrlObj.dataList.items[this._itemIndex].increment = 500;
                             this._oilChangeCtxtDataList.items[1].min = 1000; 
                         }
                         if( value % 500 != 0) //This condition will invoke when oil distance value is not multiple of 500 and user is decresing the value.
                         {
                             incrementScaleDistance = this._incrementScaleDistance(this._oilMaintDistance, value);
                             this._oilChangeCtxtDataList.items[this._itemIndex].value = this._oilMaintDistance - incrementScaleDistance;
                             this._currentContextTemplate.list2Ctrl.updateItems(this._itemIndex, this._itemIndex);
                             value = this._oilChangeCtxtDataList.items[this._itemIndex].value;
                         }
                     }
                     
                     this._newDistanceValue = value;
                     var date = new Date();
                     this._timerOilDistanceRequest = date.getTime();  //Time in millisecond while request from GUI
                     
                     log.debug("Setting distance by user in OilChangeDetail "+this._newDistanceValue);
                     payload = { "payload" : { "DistanceValue" : this._newDistanceValue }};
                     
                     framework.sendEventToMmui(this.uiaId, appData, payload);
                     break;
                     
                 case "SelectReset" :  
                     framework.sendEventToMmui(this.uiaId, appData);
                     break;   
                 default:
                     log.debug("schedmaintApp: Unknown Appdata", appData);
                     break;
             }
             break; //End of_listItemClickCallback for OilChangeDetail Context
      
            case "SettingInterval" :   //listItemClickCallback for OilChangeDetail Context
                var SelectedSetting = null;
                switch(appData)
                {
                    case "SetOilChange" :
                        //Setting Data list when Setting interval list item is selected to select desired setting
                        for(var radioCheck = 0; radioCheck < this._settingIntervalCtxtDataList.itemCount; radioCheck++ )
                        {
                            if(this._settingIntervalCtxtDataList.items[radioCheck].checked == true)
                            {
                                if(this._settingIntervalCtxtDataList.items[radioCheck].text1Id !== this._oilMaintenanceMode)
                                {
                                    //To prevent context change if user clicks same radio button of setting.
                                    SelectedSetting = this._settingIntervalCtxtDataList.items[radioCheck].text1Id;
                                }
                            }   
                        }
                        var params =
                        {
                            "payload" :
                            {
                                "oilChange" : SelectedSetting
                            }
                        };
                        if( SelectedSetting != null)
                        {   
                            framework.sendEventToMmui(this.uiaId, appData, params);
                        }
                        break;
                            
                }
                break; //End of_listItemClickCallback for SettingInterval Context
                
            default:
            log.debug("schedmaintApp: Unknown context", this._currentContext.ctxtId);
            break;
    }
};

//Dialog control
schedmaintApp.prototype._dialogDefaultSelectCallback = function(dialogBtnCtrlObj, appData, params)
{
    if(this._currentContext && this._currentContext.ctxtId)
    {
        switch (this._currentContext.ctxtId)
        {
            case "ConfirmOff" :
                switch(appData)
                {
                    case "Global.GoBack" :
                        framework.sendEventToMmui("common","Global.GoBack", null);
                        break;
                        
                    case "Global.Yes":   
                        framework.sendEventToMmui("common","Global.Yes", null);
                        break;
                        
                    default:
                        log.debug("Event not found");
                        break;
                }
                break;
                
            case "OilChangeFlexible" :
                switch(appData)
                {
                    case "Global.GoBack" :
                        framework.sendEventToMmui("common","Global.GoBack", null);
                        break;
                    case "Global.Yes" :
                        framework.sendEventToMmui("common","Global.Yes", null);
                        break;
                    default:
                        log.debug("Event not found");
                        break;
                }
                
                break;
                
            case "ConfirmReset" :
                switch(appData)
                {
                    case "Global.GoBack" :
                        framework.sendEventToMmui("common","Global.GoBack", null);
                        break;
                    case "Global.Yes" :
                        framework.sendEventToMmui("common","Global.Yes", null);
                        break; 
                    default:
                        log.debug("Event not found");
                        break;
                }
                break;
                
            case "ResetRetry" :
                switch(appData)
                {
                    case "Global.Cancel" :
                        framework.sendEventToMmui("common","Global.Cancel", null);
                        break;
                    case "SelectRetry" :
                        framework.sendEventToMmui(this.uiaId,appData);
                        break; 
                    default:
                        log.debug("Event not found");
                        break;
                }
                break;
             case "OffRetry" :
                switch(appData)
                {
                    case "Global.Cancel" :
                        framework.sendEventToMmui("common","Global.Cancel", null);
                        break;
                    case "SelectRetry" :
                        framework.sendEventToMmui(this.uiaId,appData);
                        break;
                    default:
                        log.debug("Event not found");
                        break;
                }
                break;
                case "FlexibleRetry" :
                    switch(appData)
                    {
                        case "Global.Cancel" :
                            framework.sendEventToMmui("common","Global.Cancel", null);
                            break;
                        case "SelectRetry" :
                            framework.sendEventToMmui(this.uiaId,appData);
                            break;   
                        default:
                            log.debug("Event not found");
                            break;
                    }
                    break;
                    
                case "ConfirmFixed" :
                    switch(appData)
                    {
                        case "Global.GoBack" :
                            framework.sendEventToMmui("common","Global.GoBack", null);
                            break;
                        case "Global.Yes" :
                            framework.sendEventToMmui("common","Global.Yes", null);
                            break;   
                        default:
                            log.debug("Event not found");
                            break;
                    }
                    break;
                    
                case "FixedRetry" :
                    switch(appData)
                    {
                        case "Global.Cancel" :
                            framework.sendEventToMmui("common","Global.Cancel", null);
                            break;
                        case "SelectRetry" :
                            framework.sendEventToMmui(this.uiaId,appData);
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
};

/**************************
 * Framework register
 **************************/
framework.registerAppLoaded("schedmaint",null,true);