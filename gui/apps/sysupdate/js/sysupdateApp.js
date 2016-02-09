/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: sysupdateApp.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: avorotp / TCS
 Date: 29-June-2012
 __________________________________________________________________________

 Description: IHU GUI SysUpdate App

 Revisions:
 v0.1 (29-June-2012)
 v0.2 (28-August-2012) Swithced to Common for Global events
 v0.3 (31-August-2012) Swithced to updated controls
 v0.4 (10-Sep-2012)  : All contexts are implemented. Fixed missing context Id bug. Formatting issues
                       are fixed. - agandhs
 v0.5 (10-Dec-2012)  : Handled enabling and disabling of search for updates list item. - agandhs
 v0.6 (22-Jan-2013)  : Shifted to dialog2 control - arsu
 v0.7 (01-Feb-2013)  : Migrated to Spec 3.62 - arsu
 v0.8 (06-Feb-2013)  : Software related context added as per the new spec - arsu
 v0.9 (13-Feb-2013)  : Fail safe update related context are added as per new Spec - arsu
 v1.0 (01-Apr-2013)  : Implemented time out for auto mass update - agandhs
 v1.1 (16-Apr-2013)  : Speed restriction behavior is handled - agandhs
 v1.2 (18-Apr-2012)  : Enabled current version in Available packages of music/software packages list - agandhs
 v1.3 (23-Aug-2013)  : Updated software-info screen for Not Available. - agandhs
 v1.4 (09-Oct-2013)  : Music update in normal mode and failsafe version in about screen
 v1.5 (15-Oct-2013)  : "Not Available"  text support added for contexts ConfirmMusicUpdateInstall and ConfirmSoftwareUpdateInstall.
 v1.6 (17-Oct-2013)  : Dynamically updating version info in software info context
 v1.7 (08-Nov-2013)  : Report "Fail-Safe Version Not Available" in about screen if failsafe update fails
 v1.8 (16-June-2013)  : Added 'WebsiteInformation' in 'SearchMusicDBUpdates'
 __________________________________________________________________________

 */

log.addSrcFile("sysupdateApp.js", "sysupdate");

/**********************************************
 * Start of Base App Implementation
 *
 * Code in this section should not be modified
 * except for function names based on the appname
 *********************************************/

function sysupdateApp(uiaId)
{
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
sysupdateApp.prototype.appInit = function()
{
    if (framework.debugMode)
    {
        utility.loadScript("apps/sysupdate/test/sysupdateAppTest.js");
    }

    // cache
    this._cachedOSVersion = null;
    this._cachedGracenoteVersion = null;
    this._error = null;
    this._installSoftwarePackage = null;
    this._installFailSafeImage = null;
    this._newVersion = null;
    
    //text used to display when version info is not available in confirm install dialogs
    this._notAvailable = "-----";
    
    this._progressValue = 0;//Determinate bar value
    this._screenTimeOut = 3000; // Screen timeout value in ms.
    this._cachedSpeed = false;
    this._musicUpdatesDataList = {
    itemCountKnown : true,
    itemCount : 1,
    items: [
            { appData : "CurrentVersion", text1Id : "CurrentVersion", disabled : true, itemStyle:'style06',hasCaret : false }
        ]
    };

    this._softwareUpdatesDataList = {
    itemCountKnown : true,
    itemCount : 1,
    items: [
            { appData : "CurrentOSVersion", text1Id : "CurrentOSVersion", disabled : true, itemStyle:'style06',hasCaret : false }
        ]
    };

    //@formatter:off
    this._contextTable = {
        //New Spec 3.62
        "SearchMusicDBUpdates" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "SystemUpdate" ,
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "contentStyle" : "style13",
                    "fullScreen" : false,
                    "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),
                    "initialFocus" : 1,
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "common.Cancel",
                            appData : "Global.Cancel"
                        },
                        "button2" : {
                            labelId : "Search",
                            appData : "SearchForUpdates",
                        }
                    }, // end of buttonConfig
                    "text1Id" : "SearchMusicDBUpdate",
                    "text2Id" : "WebsiteInformation",
                } // end of properties for "DialogCtrl"
            }, // end of controlProperties
            "readyFunction" : this._SearchMusicDBUpdatesCtxtTmpltReadyToDisplay.bind(this)
        }, // end of "SearchMusicDBUpdates"

        "SearchingForMusicUpdates" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "SystemUpdate" ,
            "controlProperties": {
                "Dialog3Ctrl" : {
                    //"titleStyle" : "titleStyle03",
                    "contentStyle" : "style03",
                    "fullScreen" : false,
                    "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),
                    "meter" : {"meterType":"indeterminate", "meterPath":"common/images/IndeterminateMeter_2.png"},
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "common.Cancel",
                            appData : "Global.Cancel"
                        }
                    }, // end of buttonConfig
                    "text1Id" : "SearchingForMusicUpdates"
                } // end of properties for "DialogCtrl"
            } // end of controlProperties
        }, // end of "SearchingForMusicUpdates"

        "AvailableMusicPackages" : {
            "template" : "List2Tmplt",
            "sbNameId" : "SystemUpdate",
            "controlProperties": {
                "List2Ctrl" : {
                    dataList : this._musicUpdatesDataList,
                    titleConfiguration : 'listTitle',
                    title : {
                        text1Id : "AvailablePackages",
                        titleStyle : "style02"
                    },
                    selectCallback : this._listItemClickCallback.bind(this)
                } // end of properties for "List2Ctrl"
            }, // end of controlProperties
            "leftBtnStyle": "goBack",
            "readyFunction" : this._AvailableMusicPackagesCtxtTmpltReadyToDisplay.bind(this)
        }, // end of "AvailableMusicPackages"

        "MusicUpdateSearchFailed" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "SystemUpdate" ,
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "contentStyle" : "style13",
                    "fullScreen" : false,
                    "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),
                    "initialFocus" : 1,
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "common.Cancel",
                            appData : "Global.Cancel"
                        },
                        "button2" : {
                            labelId : "common.Retry",
                            appData : "SelectRetry"
                        }
                    }, // end of buttonConfig
                    "text1Id" : "SearchFailed",
                } // end of properties for "DialogCtrl"
            }, // end of controlProperties
            "readyFunction" : this._MusicUpdateSearchFailedCtxtTmpltReadyToDisplay.bind(this),
        }, // end of "MusicUpdateSearchFailed"

        "NoNewMusicPackages" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "SystemUpdate" ,
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "contentStyle" : "style02",
                    "fullScreen" : false,
                    "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "common.Ok",
                            appData : "Global.Yes"
                        }
                    }, // end of buttonConfig
                    "text1Id" : "NoNewMusicPackages"
                } // end of properties for "DialogCtrl"
            } // end of controlProperties
        }, // end of "NoNewMusicPackages"

        "NeedFailSafeImageUpdate" : {//not getting
            "template" : "Dialog3Tmplt",
            "sbNameId" : "SystemUpdate" ,
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "contentStyle" : "style02",
                    "fullScreen" : false,
                    "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "common.Ok",
                            appData : "Global.Yes"
                        }
                    }, // end of buttonConfig
                    "text1Id" : "NeedFailSafeImageUpdate"
                } // end of properties for "DialogCtrl"
            } // end of controlProperties
        }, // end of "NeedFailSafeImageUpdate"

        "ConfirmMusicUpdateInstall" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "SystemUpdate" ,
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "contentStyle" : "style23",
                    "fullScreen" : false,
                    "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),
                    "initialFocus" : 1,
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "common.Back",
                            appData : "Global.GoBack"
                        },
                        "button2" : {
                            labelId : "Install",
                            appData : "ConfirmInstall"
                        }
                    } // end of buttonConfig
                } // end of properties for "DialogCtrl"
            }, // end of controlProperties
            "readyFunction" : this._ConfirmMusicUpdateInstallCtxtTmpltReadyToDisplay.bind(this),
            "contextInFunction" : this._ConfirmMusicUpdateInstallCtxtTmpltCtxtIn.bind(this)                                     
        }, // end of "ConfirmMusicUpdateInstall"

        "MusicRebootReflash" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "SystemUpdate" ,
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "contentStyle" : "style03",
                    "fullScreen" : false,
                    "text1Id" : "RebootReflash",
                    "meter" : {"meterType":"indeterminate", "meterPath":"common/images/IndeterminateMeter_2.png"}
                } // end of properties for "DialogCtrl"
            } // end of controlProperties
        }, // end of "MusicRebootReflash"

        "MusicDBPkgValidationFailed" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "SystemUpdate" ,
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "contentStyle" : "style13",
                    "fullScreen" : false,
                    "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "common.Ok",
                            appData : "Global.Yes"
                        }
                    }, // end of buttonConfig
                    "text1Id" : "ValidationFailed"
                } // end of properties for "DialogCtrl"
            }, // end of controlProperties
            "readyFunction" : this._MusicDBPkgValidationFailedCtxtTmpltReadyToDisplay.bind(this)
        }, // end of "MusicDBPkgValidationFailed"

        "MusicDBPkgRetryValidationFailed" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "SystemUpdate" ,
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "titleStyle" : "titleStyle02",
                    "contentStyle" : "style17",
                    "fullScreen" : false,
                    "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "common.Ok",
                            appData : "Global.Yes"
                        }
                    }, // end of buttonConfig
                    "titleId" : "ValidationFailed",
                    "text3Id" : "SysCatalogRestart",
                } // end of properties for "DialogCtrl"
            }, // end of controlProperties
            "readyFunction" : this._MusicDBPkgRetryValidationFailedCtxtTmpltReadyToDisplay.bind(this)
        }, // end of "MusicDBPkgRetryValidationFailed"
        
        "FailSafeImageUpdateNotify" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "SystemUpdate" ,
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "contentStyle" : "style02",
                    "fullScreen" : false,
                    "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "Continue",
                            appData : "Global.Yes"
                        },
                    },
                    "text1Id" : "FailSafeImageUpdateNotify"
                } // end of properties for "DialogCtrl"
            } // end of controlProperties
        }, // end of "FailSafeImageUpdateNotify"

        //12th feb
        "SearchSoftwareUpdates" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "SystemUpdate" ,
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "contentStyle" : "style02",
                    "fullScreen" : true,
                    "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),
                    "initialFocus" : 1,
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "common.Cancel",
                            appData : "Global.Cancel"
                        },
                        "button2" : {
                            labelId : "Search",
                            appData : "SearchForUpdates"
                        }
                    }, // end of buttonConfig
                    "text1Id" : "SearchSoftwareUpdates"
                } // end of properties for "DialogCtrl"
            }, // end of controlProperties
            "readyFunction" : this._searchSoftwareUpdatesCtxtReadyToDisplay.bind(this)
        }, // end of "SearchSoftwareUpdates"

        "SearchingForSoftwareUpdates" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "SystemUpdate" ,
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "contentStyle" : "style03",
                    "fullScreen" : false,
                    "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "common.Cancel",
                            appData : "Global.GoBack"
                        }
                    },
                    "text1Id" : "SearchingForSoftwareUpdates",
                    "meter" : {"meterType":"indeterminate", "meterPath":"common/images/IndeterminateMeter_2.png"}
                } // end of properties for "DialogCtrl"
            } // end of controlProperties
        }, // end of "SearchingForSoftwareUpdates"

        "SoftwareUpdateSearchFailed" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "SystemUpdate" ,
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "contentStyle" : "style13",
                    "fullScreen" : false,
                    "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),
                    "initialFocus" : 1,
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "common.Cancel",
                            appData : "Global.Cancel"
                        },
                        "button2" : {
                            labelId : "common.Retry",
                            appData : "SelectRetry"
                        }
                    }, // end of buttonConfig
                    "text1Id" : "SearchFailed"
                } // end of properties for "DialogCtrl"
            }, // end of controlProperties
            "readyFunction" : this._SoftwareUpdateSearchFailedCtxtTmpltReadyToDisplay.bind(this)
        }, // end of "SoftwareUpdateSearchFailed"

        "NoNewSoftwarePackages" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "SystemUpdate" ,
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "contentStyle" : "style02",
                    "fullScreen" : false,
                    "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "common.Ok",
                            appData : "Global.Yes"
                        }
                    },
                    "text1Id" : "NoNewSoftwarePackages"
                } // end of properties for "DialogCtrl"
            } // end of controlProperties
        }, // end of "NoNewSoftwarePackages"

        "AvailableSoftwarePackages" : {
            "template" : "List2Tmplt",
            "sbNameId" : "SystemUpdate",
            "controlProperties": {
                "List2Ctrl" : {
                    dataList : this._softwareUpdatesDataList,
                    titleConfiguration : 'listTitle',
                    title : {
                        text1Id : "AvailableSoftwarePackages",
                        titleStyle : "style02"
                    },
                    selectCallback : this._listItemClickCallback.bind(this)
                } // end of properties for "List2Ctrl"
            }, // end of controlProperties
            "leftBtnStyle": "goBack",
            "readyFunction" : this._AvailableSoftwarePackagesCtxtTmpltReadyToDisplay.bind(this)
        }, // end of "AvailableSoftwarePackages"

        "ConfirmSoftwareUpdateInstall" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "SystemUpdate" ,
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "contentStyle" : "style23",
                    "fullScreen" : false,
                    "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),
                    "initialFocus" : 1,
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "common.Back",
                            appData : "Global.GoBack"
                        },
                        "button2" : {
                            labelId : "Install",
                            appData : "ConfirmInstall"
                        }
                    } // end of buttonConfig
                } // end of properties for "DialogCtrl"
            }, // end of controlProperties
            "readyFunction" : this._ConfirmSoftwareUpdateInstallCtxtTmpltReadyToDisplay.bind(this),
         "contextInFunction" : this._ConfirmSoftwareUpdateInstallCtxtTmpltCtxtIn.bind(this)

        }, // end of "ConfirmSoftwareUpdateInstall"

        "SoftwareRebootReflash" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "SystemUpdate" ,
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "contentStyle" : "style03",
                    "fullScreen" : true,
                    "text1Id" : "RebootReflash",
                    "meter" : {"meterType":"indeterminate", "meterPath":"common/images/IndeterminateMeter_2.png"}
                } // end of properties for "DialogCtrl"
            } // end of controlProperties
        }, // end of "SoftwareRebootReflash"

        "SoftwarePkgValidationFailed" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "SystemUpdate" ,
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "contentStyle" : "style13",
                    "fullScreen" : false,
                    "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "common.Ok",
                            appData : "Global.Yes"
                        }
                    }, // end of buttonConfig
                    "text1Id" : "ValidationFailed"
                } // end of properties for "DialogCtrl"
            }, // end of controlProperties
            "readyFunction" : this._SoftwarePkgValidationFailedCtxtTmpltReadyToDisplay.bind(this)
        }, // end of "SoftwarePkgValidationFailed"

        //15th feb
        "ConfirmFailSafeSystemUpdateInst" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "SystemUpdate" ,
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "contentStyle" : "style02",
                    "fullScreen" : false,
                    "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),
                    "initialFocus" : 1,
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "common.Back",
                            appData : "Global.GoBack"
                        },
                        "button2" : {
                            labelId : "Install",
                            appData : "ConfirmInstall"
                        }
                    }, // end of buttonConfig
                    "text1Id" : "ConfirmFailSafeUpdateInstall",
                } // end of properties for "DialogCtrl"
            }, // end of controlProperties
            "readyFunction" : this._ConfirmFailSafeSystemUpdateInstCtxtTmpltReadyToDisplay.bind(this),
            "contextInFunction" : this._ConfirmFailSafeSystemUpdateInstCtxtTmpltCtxtIn.bind(this)
        }, // end of "ConfirmFailSafeSystemUpdateInst"

        "InstallingFailSafeSystemUpdate" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "SystemUpdate" ,
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),
                    "contentStyle" : "style03",
                    "fullScreen" : true,
                    "text1Id" : "InstallingFailsafeSystem",
                    "meter" : {"meterType":"determinate", "min":0, "max":1, "currentValue":0},
                    "text2Id" : "DonotRestart"
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._InstallingFailSafeSystemUpdateCtxtTmpltReadyToDisplay.bind(this),
            "contextOutFunction" : this._InstallingFailSafeSystemUpdateCtxtOut.bind(this)
        }, // end of "InstallingFailSafeSystemUpdate"

        "FailSafeSystemInstallSuccess" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "SystemUpdate" ,
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "contentStyle" : "style13",
                    "fullScreen" : false,
                    "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "common.Ok",
                            appData : "Global.Yes"
                        }
                    },
                    "text1Id" : "InstallSuccessful",
                    "text2Id" : "NoReboot"
                } // end of properties for "DialogCtrl"
            } // end of controlProperties
        }, // end of "FailSafeSystemInstallSuccess"

        "FailSafeSystemInstallNoSuccess" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "SystemUpdate" ,
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "contentStyle" : "style17",
                    "fullScreen" : false,
                    "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),
                    "initialFocus" : 1,
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "common.Ok",
                            appData : "Global.Yes"
                        },
                        "button2" : {
                            labelId : "common.Retry",
                            appData : "SelectRetry"
                        }
                    }, // end of buttonConfig
                    "text1Id" : "InstallUnsuccessful",
                    "text2Id" : "UpdatesNA"
                } // end of properties for "DialogCtrl"
            }, // end of controlProperties
            "readyFunction" : this._FailSafeSystemInstallNoSuccessCtxtTmpltReadyToDisplay.bind(this)
        }, // end of "FailSafeSystemInstallNoSuccess"

       "SoftwareInfo" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "SystemUpdate" ,
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "contentStyle" : "style23",
                    "fullScreen" : false,
                    "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "common.Ok",
                            appData : "Global.Yes"
                        }
                    } // end of buttonConfig
                } // end of properties for "DialogCtrl"
            }, // end of controlProperties
            "readyFunction" : this._SoftwareInfoCtxtTmpltReadyToDisplay.bind(this)
        }, // end of "SoftwareInfo"
    
    "InstallingMusicDBUpdates" : {
        "template" : "Dialog3Tmplt",
        "sbNameId" : "SystemUpdate" ,
        "controlProperties": {
            "Dialog3Ctrl" : {
                "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),                
                "contentStyle" : "style03",
                "fullScreen" : true,
                "text2Id" : "DonotRestart",
                "meter" : {"meterType":"determinate", "min":0, "max":1, "currentValue":0}
            } // end of properties for "DialogCtrl"
        }, // end of controlProperties
        "readyFunction" : this._InstallMusicDBUpdatesCtxtTmpltReadyToDisplay.bind(this),
        "contextOutFunction" : this._InstallMusicDBUpdatesCtxtOut.bind(this)
    }, // end of "InstallingMusicDBUpdates"
    
    "RetryingMusicDBUpdates" : {
        "template" : "Dialog3Tmplt",
        "sbNameId" : "SystemUpdate" ,
        "controlProperties": {
            "Dialog3Ctrl" : {
                "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),                
                "contentStyle" : "style03",
                "fullScreen" : true,
                "text2Id" : "DonotRestart",
                "meter" : {"meterType":"determinate", "min":0, "max":1, "currentValue":0}
            } // end of properties for "DialogCtrl"
        }, // end of controlProperties
        "readyFunction" : this._RetryingMusicDBUpdatesCtxtTmpltReadyToDisplay.bind(this),
        "contextOutFunction" : this._RetryingMusicDBUpdatesCtxtOut.bind(this)
    }, // end of "RetryingMusicDBUpdates"
    
    "UpdateMusicDBSuccess" : {
        "template" : "Dialog3Tmplt",
        "sbNameId" : "SystemUpdate" ,
        "controlProperties": {
            "Dialog3Ctrl" : {
                "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),                
                "contentStyle" : "style13",
                "fullScreen" : true,
                "buttonConfig" : {
                    "button1" : {
                        labelId : "common.Ok",
                        appData : "Global.Yes"
                    }
                }, // end of buttonConfig
            } // end of properties for "DialogCtrl"
        }, // end of controlProperties
        "readyFunction" : this._UpdateMusicDBSuccessCtxtTmpltReadyToDisplay.bind(this)
    }, // end of "UpdateMusicDBSuccess"  
    
    "FunctionNotAvailable" : {
        "template" : "Dialog3Tmplt",
        "sbNameId" : "SystemUpdate" ,
        "controlProperties": {
            "Dialog3Ctrl" : {
                "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),                
                "contentStyle" : "style13",
                "fullScreen" : true,
                "text1Id" : "FunctionNA",
                "text2Id" : "SysCatalogRestart",
                "buttonConfig" : {
                    "button1" : {
                        labelId : "common.Ok",
                        appData : "Global.Yes"
                    }
                }, // end of buttonConfig
            } // end of properties for "DialogCtrl"
        }// end of controlProperties
    }, //end of  "FunctionNotAvailable"
    
    "UpdateMusicDBNoSuccess" : {
        "template" : "Dialog3Tmplt",
        "sbNameId" : "SystemUpdate" ,
        "controlProperties": {
            "Dialog3Ctrl" : {
                "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),                
                "contentStyle" : "style13",
                "fullScreen" : false,
                "text1Id" : "FunctionNA",
                "text2Id" : "SysCatalogRestart",
                "initialFocus": 1,
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
            } // end of properties for "DialogCtrl"
        }// end of controlProperties
    },//end of "UpdateMusicDBNoSuccess"
    
    "NoNewFailSafePkg" : {
        "template" : "Dialog3Tmplt",
        "sbNameId" : "SystemUpdate" ,
        "controlProperties": {
            "Dialog3Ctrl" : {
                "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),                
                "contentStyle" : "style17",
                "fullScreen" : false,
                "text1Id" : "ValidationFailed",
                "text3Id" : "FailsafeAvailable",
                "buttonConfig" : {
                    "button1" : {
                        labelId : "common.Ok",
                        appData : "Global.Yes"
                    }
                }, // end of buttonConfig
            } // end of properties for "DialogCtrl"
        },
    // end of controlProperties
    "readyFunction" : this._NoNewFailSafePkgCtxtTmpltReadyToDisplay.bind(this)
    }, //end of  "NoNewFailSafePkg" 
    
    "FailSafePkgValidationFailed" : {
        "template" : "Dialog3Tmplt",
        "sbNameId" : "SystemUpdate" ,
        "controlProperties": {
            "Dialog3Ctrl" : {
                "defaultSelectCallback" : this._dialogDefaultSelectCallback.bind(this),                
                "contentStyle" : "style17",
                "fullScreen" : false,
                "text1Id" : "ValidationFailed",
                "text3Id" : "UpdatesNA",
                "buttonConfig" : {
                    "button1" : {
                        labelId : "common.Ok",
                        appData : "Global.Yes"
                    }
                }, // end of buttonConfig
            } // end of properties for "DialogCtrl"
        },// end of controlProperties
    "readyFunction" : this._FailSafePkgValidationFailedCtxtTmpltReadyToDisplay.bind(this)
    }, //end of  "NoNewFailSafePkg" 
    }; // end of this._contextTable


    //@formatter:off
    this._messageTable = {
        "OSVersion" : this._OSVersionMsgHandler.bind(this),
        "GraceNoteVersion" : this._GraceNoteVersionVersionMsgHandler.bind(this),
        "AvailableUpdates" : this._AvailableUpdatesMsgHandler.bind(this),
        "ReasonForError" : this._ErrorHandler.bind(this),
        "UpdateProgress" : this._UpdateProgressMsgHandler.bind(this),
        "AutoMassSystemUpdate" : this._AutoMassUpdateHandler.bind(this),
        "Global.AtSpeed" : this._AtSpeedMsgHandler.bind(this),
        "Global.NoSpeed" : this._NoSpeedMsgHandler.bind(this),
        "FailSafeVersion" : this._FailSafeVersionMsgHandler.bind(this)
    }; // end of this._messageTable
    //@formatter:on
}

/**************************
 * Context handlers
 **************************/
//Music Update SearchFailed context
sysupdateApp.prototype._MusicUpdateSearchFailedCtxtTmpltReadyToDisplay = function()
{
    if (this._currentContextTemplate)
    {
        if(this._error)
        {
            this._setErrorText(this._error);
        }
        this._cachedSpeed = framework.common.getAtSpeedValue();
        if(this._cachedSpeed != null)
        {
            this._setButtonState(this._currentContextTemplate, "button2")
        }
    }
}

sysupdateApp.prototype._SearchMusicDBUpdatesCtxtTmpltReadyToDisplay = function()
{
    this._cachedSpeed = framework.common.getAtSpeedValue();
    if(this._cachedSpeed != null)
    {
        this._setButtonState(this._currentContextTemplate, "button2")
    }
}

// AvailablePackages Context
sysupdateApp.prototype._AvailableMusicPackagesCtxtTmpltReadyToDisplay = function()
{
    var listDisable = false;
    this._cachedSpeed = framework.common.getAtSpeedValue();
    if(this._cachedSpeed != null)
    {
        listDisable = this._cachedSpeed;
    }
    if (this._versionsUpdates)
    {
        if (this._currentContext && this._currentContextTemplate)
        {
            //To update the package list
            this._updateAvailablePackagesList(this._versionsUpdates, listDisable);
        }
    }
    if (this._currentContext && this._currentContextTemplate)
    {
        //To update the current version
        this._updateCurrentGracenoteVersion(this._cachedGracenoteVersion);
    }
}

//Confirm Music UpdateInstall context
sysupdateApp.prototype._ConfirmMusicUpdateInstallCtxtTmpltReadyToDisplay = function()
{
    if (this._currentContext && this._currentContextTemplate)
    {
        this._setConfirmMusicUpdateText(); //Update the dialog text
        this._cachedSpeed = framework.common.getAtSpeedValue();
        if(this._cachedSpeed != null)
        {
            this._setButtonState(this._currentContextTemplate, "button2")
        }
    }
}

//Confirm Music Update Install context In.
sysupdateApp.prototype._ConfirmMusicUpdateInstallCtxtTmpltCtxtIn = function()
{
    if (this._autoUpdate)
    {
       //set timeout
       this._autoUpdate = false;
       this._autoUpdateTimeout = setTimeout(this._autoUpdateSendEvent.bind(this), this._screenTimeOut); // 3 secs
    }
}

sysupdateApp.prototype._searchSoftwareUpdatesCtxtReadyToDisplay = function()
{
    if (this._currentContext && this._currentContextTemplate)
    {
        this._cachedSpeed = framework.common.getAtSpeedValue();
        if(this._cachedSpeed != null)
        {
            this._setButtonState(this._currentContextTemplate, "button2")
        }
    }
}

//Music Update Pckg Validation Failed context
sysupdateApp.prototype._MusicDBPkgValidationFailedCtxtTmpltReadyToDisplay = function()
{
    if (this._currentContextTemplate && this._error)
    {
        //To set the error message
        this._setErrorText(this._error);
    }
}

//Music Update Pckg Retry Validation Failed context
sysupdateApp.prototype._MusicDBPkgRetryValidationFailedCtxtTmpltReadyToDisplay = function()
{
    if (this._currentContextTemplate && this._error)
    {
        //To set the error message
        this._setErrorText(this._error);
    }
}

//Confirm Software UpdateInstall context -- 12th feb
sysupdateApp.prototype._ConfirmSoftwareUpdateInstallCtxtTmpltReadyToDisplay = function()
{
    if (this._currentContextTemplate)
    {
        this._setConfirmSoftwareUpdateInstallText(this._currentContextTemplate);
        this._cachedSpeed = framework.common.getAtSpeedValue();
        if(this._cachedSpeed != null)
        {
            this._setButtonState(this._currentContextTemplate, "button2")
        }
    }
}

sysupdateApp.prototype._ConfirmSoftwareUpdateInstallCtxtTmpltCtxtIn = function()
{
    if (this._autoUpdate)
    {
       //set timeout
       this._autoUpdate = false;
       this._autoUpdateTimeout = setTimeout(this._autoUpdateSendEvent.bind(this), this._screenTimeOut); // 3 secs
    }
}

//Available Software Packages context
sysupdateApp.prototype._AvailableSoftwarePackagesCtxtTmpltReadyToDisplay = function()
{
    var packageDisabled = false;
    if (this._currentContext && this._currentContextTemplate)
    {
        this._updateCurrentOSVersion(this._cachedOSVersion);
    }
    this._cachedSpeed = framework.common.getAtSpeedValue();
    if(this._cachedSpeed != null)
    {
        packageDisabled = this._cachedSpeed;
    }
    if (this._versionsUpdates)
    {
        if (this._currentContext && this._currentContextTemplate)
        {
            this._updateAvailableSoftwarePackagesList(this._versionsUpdates, packageDisabled);
        }
    }
}

//Software Pckg Validation Failed context
sysupdateApp.prototype._SoftwarePkgValidationFailedCtxtTmpltReadyToDisplay = function()
{
    if (this._currentContextTemplate && this._error)
    {
        this._setErrorText(this._error);
    }
}

//Software Update SearchFailed context
sysupdateApp.prototype._SoftwareUpdateSearchFailedCtxtTmpltReadyToDisplay = function()
{
    if (this._currentContextTemplate)
    {
        if(this._error)
        {
            this._setErrorText(this._error);
        }
        this._cachedSpeed = framework.common.getAtSpeedValue();
        if(this._cachedSpeed != null)
        {
            this._setButtonState(this._currentContextTemplate, "button2")
        }
    }
}

//15th feb
//Confirm FailSafe SystemUpdate Install context
sysupdateApp.prototype._ConfirmFailSafeSystemUpdateInstCtxtTmpltReadyToDisplay = function()
{
    if (this._currentContextTemplate )
    {
        //Update the failsafe image version
        if(this._installFailSafeImage)
        {
            this._setFailSafeSystemUpdateInstVersion(this._currentContextTemplate);
        }
        this._cachedSpeed = framework.common.getAtSpeedValue();
        if(this._cachedSpeed != null)
        {
            this._setButtonState(this._currentContextTemplate, "button2")
        }
    }
}

sysupdateApp.prototype._ConfirmFailSafeSystemUpdateInstCtxtTmpltCtxtIn = function()
{
    if (this._autoUpdate)
    {
       //set timeout
       this._autoUpdate = false;
       this._autoUpdateTimeout = setTimeout(this._autoUpdateSendEvent.bind(this), this._screenTimeOut); // 3 secs
    }
}

//Installing FailSafe SystemUpdate context
sysupdateApp.prototype._InstallingFailSafeSystemUpdateCtxtTmpltReadyToDisplay = function()
{
    if ( this._progressValue && this._currentContextTemplate )
    {
        //Update the progress bar
        this._updateInstallProgress(this._currentContextTemplate, this._progressValue);
    }
}

//Remove progress value on context out
sysupdateApp.prototype._InstallingFailSafeSystemUpdateCtxtOut = function()
{
    this._progressValue = 0;
}

//SoftwareInfo context
sysupdateApp.prototype._SoftwareInfoCtxtTmpltReadyToDisplay = function()
{
    if (this._currentContextTemplate )
    {
        this._setSoftwareInfoText(this._currentContextTemplate)
    }
}

//FailSafe SystemInstall NoSuccess context
sysupdateApp.prototype._FailSafeSystemInstallNoSuccessCtxtTmpltReadyToDisplay = function()
{
    if (this._currentContextTemplate)
    {
        //Update the Error message
        if(this._error)
        {
            this._setErrorText(this._error);
        }
        this._cachedSpeed = framework.common.getAtSpeedValue();
        if(this._cachedSpeed != null)
        {
            this._setButtonState(this._currentContextTemplate, "button2")
        }
        
        // since failure, clear the cache
        this._installFailSafeImage = null;
    }
}

//Install Music DB Update Context
sysupdateApp.prototype._InstallMusicDBUpdatesCtxtTmpltReadyToDisplay = function()
{
    if (this._currentContext && this._currentContextTemplate)
    {
        this._currentContextTemplate.dialog3Ctrl.setText1Id("InstallMusic" , {MusicVersion : this._installPackage});
        this._updateInstallProgress(this._currentContextTemplate, this._progressValue);
    }
}

//Retrying Music DB Update Context
sysupdateApp.prototype._RetryingMusicDBUpdatesCtxtTmpltReadyToDisplay = function()
{
    if (this._currentContext && this._currentContextTemplate)
    {
        this._currentContextTemplate.dialog3Ctrl.setText1Id("InstallMusic" , {MusicVersion : this._installPackage});
        this._updateInstallProgress(this._currentContextTemplate, this._progressValue);
    }
}

//Install Music DB Update Context Out
sysupdateApp.prototype._InstallMusicDBUpdatesCtxtOut = function()
{
    this._progressValue = 0;
}

//Retrying Music DB Update Context Out
sysupdateApp.prototype._RetryingMusicDBUpdatesCtxtOut = function()
{
    this._progressValue = 0;
}

//Update Music DBSuccess Context
sysupdateApp.prototype._UpdateMusicDBSuccessCtxtTmpltReadyToDisplay = function()
{
    if (this._currentContext && this._currentContextTemplate)
    {
        this._currentContextTemplate.dialog3Ctrl.setText1Id("MusicInstallSuccess" , {MusicVersion : this._installPackage});
        this._currentContextTemplate.dialog3Ctrl.setText2Id("SystemRestart");
    }
}

//No New FailSafe Pkg Context
sysupdateApp.prototype._NoNewFailSafePkgCtxtTmpltReadyToDisplay = function()
{
    if (this._currentContextTemplate)
    {
        if(this._error)
        {
            this._setErrorText(this._error);
        }
    }
}

//Fail Safe Pkg Validation Failed Context
sysupdateApp.prototype._FailSafePkgValidationFailedCtxtTmpltReadyToDisplay = function()
{
    if (this._currentContextTemplate)
    {
        if(this._error)
        {
            this._setErrorText(this._error);
        }
    }
}

/**************************
 * Message handlers
 **************************/

// OSVersion
sysupdateApp.prototype._OSVersionMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.version)
    {
        this._cachedOSVersion = msg.params.payload.version;
        if (this._currentContext && this._currentContextTemplate &&
           (this._currentContext.ctxtId === "AvailableSoftwarePackages" || this._currentContext.ctxtId === "SoftwareInfo"))
        {
            this._updateCurrentOSVersion(this._cachedOSVersion);
        }
    }
}

// GraceNote Version
sysupdateApp.prototype._GraceNoteVersionVersionMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.version)
    {
        this._cachedGracenoteVersion = msg.params.payload.version;
        if (this._currentContext && this._currentContextTemplate && 
           (this._currentContext.ctxtId === "AvailableMusicPackages" || this._currentContext.ctxtId === "SoftwareInfo"))
        {
            this._updateCurrentGracenoteVersion(this._cachedGracenoteVersion);
        }
    }
}
//FailSafe Version
sysupdateApp.prototype._FailSafeVersionMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload)
    {
        if (msg.params.payload.version)
            this._installFailSafeImage = msg.params.payload.version;
        else
            this._installFailSafeImage = null;

        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "SoftwareInfo")
        {
            //Dialog doesn't update the text on runtime using the API setText.
            this._updateCurrentFailSafeVersion(this._installFailSafeImage);
        }
    }
}

// AvailableUpdates
sysupdateApp.prototype._AvailableUpdatesMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.updates)
    {
        this._versionsUpdates = msg.params.payload.updates;
        
        if(this._versionsUpdates && this._versionsUpdates.updatesList[0] && this._versionsUpdates.updatesList[0].version)
        {
            this._versionType = msg.params.payload.updates.updatesList[0].type;
            this._newVersion = this._versionsUpdates.updatesList[0].version;
            switch(this._versionType)
            {
                case "FAILSAFEOS" :
                    this._installFailSafeImage = this._newVersion;
                    break;
                case "GRACENOTE" :
                    this._installPackage = this._newVersion;
                    break;
                case "SYSTEM" :
                case "REINSTALL" :
                    this._installSoftwarePackage = this._newVersion;
                    break;
                default :
                    log.info(this._versionType + "Unknown version : " + this._newVersion);
                    break;
            }
        }
        if (this._currentContext && this._currentContextTemplate)
        {
            switch(this._currentContext.ctxtId)
            {
                case "AvailableMusicPackages" :
                    this._updateAvailablePackagesList(this._versionsUpdates, false);
                    break;
                case "AvailableSoftwarePackages" :
                    this._updateAvailableSoftwarePackagesList(this._versionsUpdates, false);
                    break;
                default :
                    break;
            }
        }
    }
}

//Error handler
sysupdateApp.prototype._ErrorHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.reasonForError)
    {
        this._error = msg.params.payload.reasonForError;
        if ( this._currentContext && this._currentContextTemplate && (this._currentContext.ctxtId === "MusicUpdateSearchFailed" ||
        this._currentContext.ctxtId === "MusicDBPkgValidationFailed" || this._currentContext.ctxtId === "SoftwarePkgValidationFailed"
        || this._currentContext.ctxtId === "SoftwareUpdateSearchFailed" || this._currentContext.ctxtId === "FailSafeSystemInstallNoSuccess" || this._currentContext.ctxtId==="NoNewFailSafePkg" || this._currentContext.ctxtId==="MusicDBPkgRetryValidationFailed"))
        {
            this._setErrorText(this._error);
        }
    }
}

// Progress bar update handler
sysupdateApp.prototype._UpdateProgressMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.updateProgress &&
    msg.params.payload.updateProgress.progress )
    {
        this._progressValue = msg.params.payload.updateProgress.progress;
        if (this._currentContext && this._currentContextTemplate &&
        this._currentContext.ctxtId === "InstallingFailSafeSystemUpdate" || this._currentContext.ctxtId === "InstallingMusicDBUpdates" || this._currentContext.ctxtId === "RetryingMusicDBUpdates")
        {
            this._updateInstallProgress(this._currentContextTemplate, this._progressValue);
        }
    }
}

sysupdateApp.prototype._AutoMassUpdateHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.autoMassSystemUpdateStatus)
    {
        this._autoUpdate = msg.params.payload.autoMassSystemUpdateStatus;
    }
}

sysupdateApp.prototype._AtSpeedMsgHandler = function(msg)
{
    if (msg)
    {
        // cache the value sent by GUI common for later use
        this._cachedSpeed = true;
        switch(this._currentContext.ctxtId)
        {
            case "AvailableMusicPackages" : 
                this._updateAvailablePackagesList(this._versionsUpdates, this._cachedSpeed);
                break;
            case "AvailableSoftwarePackages" :
                this._updateAvailableSoftwarePackagesList(this._versionsUpdates, this._cachedSpeed);
                break;
            default : 
                this._setButtonState(this._currentContextTemplate, "button2");
                break;
        }
    }
}

// At Speed - false
sysupdateApp.prototype._NoSpeedMsgHandler = function(msg)
{
    if (msg)
    {
        // cache the value sent by GUI common for later use
        this._cachedSpeed = false;
        switch(this._currentContext.ctxtId)
        {
            case "AvailableMusicPackages" : 
                this._updateAvailablePackagesList(this._versionsUpdates, this._cachedSpeed);
                break;
            case "AvailableSoftwarePackages" :
                this._updateAvailableSoftwarePackagesList(this._versionsUpdates, this._cachedSpeed);
                break;
            default : 
                this._setButtonState(this._currentContextTemplate, "button2");
                break;
        }
    }
}
/**************************
 * Control callbacks
 **************************/

// List Control
sysupdateApp.prototype._listItemClickCallback = function(listCtrlObj, appData, params)
{
    var itemIndex = params.itemIndex;
    switch (this._currentContext.ctxtId)
    {
        case "AvailableMusicPackages" :
            this._installPackage = listCtrlObj.dataList.items[itemIndex].label1;
            if(appData !== "CurrentVersion")
            {
                framework.sendEventToMmui(this.uiaId, "SelectPackage", { payload : { package : appData } });
            }
            break;
            if(appData=="CurrentVersion")
            {
                framework.sendEventToMmui(this.uiaId, appData);             
            }
        case "AvailableSoftwarePackages" :
            var itemType = listCtrlObj.dataList.items[itemIndex].text1Id;
            if (itemType === "FailSafeImage")
            {
                this._installFailSafeImage = listCtrlObj.dataList.items[itemIndex].label1;
            }
            else
            {
                this._installSoftwarePackage = listCtrlObj.dataList.items[itemIndex].label1;
            }
            if(appData !== "CurrentOSVersion")
            {
                framework.sendEventToMmui(this.uiaId, "SelectPackage", { payload : { package : appData } });
            }
            break;
        default :
            log.warn("sysupdateApp: Unknown context", this._currentContext.ctxtId);
            break;
    }
}
// EOF: List Control

// Dialog Control
sysupdateApp.prototype._dialogDefaultSelectCallback = function(dialogBtnCtrlObj, appData, params)
{
    switch (appData)
    {
        case "Global.Cancel" :
        case "Global.GoBack" :
        case "Global.Yes" :
            framework.sendEventToMmui("common", appData);
            log.info("Sysupdate : Global Event Injected : " + appData);
            if (this._autoUpdateTimeout != null)
            {
                clearTimeout(this._autoUpdateTimeout);
                this._autoUpdateTimeout = null;
            }
            break;
        default :
            framework.sendEventToMmui(this.uiaId, appData);
            log.info("Sysupdate : System update app Event : " + appData);
            break;
    }
}
// EOF: Dialog Control

/**************************
 * Helper functions
 **************************/

// Update Available Packages List
sysupdateApp.prototype._updateAvailablePackagesList = function(packages, disable)
{
    if(packages.updatesList && packages.count > 0 )
    {
        var dataList = {
            itemCountKnown : true
        };
        var dataItems = new Array();
        var gracenoteItems = new Array();
        var gracenoteList = 0;
        var versionType = "";
        var unknownUpdates = 0;
        for(var i = 0; i < packages.count; i++)
        {
            versionType = packages.updatesList[i].type;
            if(versionType)
            {
                switch(versionType)
                {
                    case "GRACENOTE" :
                        gracenoteItems[gracenoteList] = {
                            appData : packages.updatesList[i].id,
                            version : packages.updatesList[i].version
                        };
                        gracenoteList++;
                        break;
                    default :
                        log.warn(unknownUpdates+" Updates with unknown version types are found.");
                        unknownUpdates++;
                        break;
                }
            }
            else
            {
                log.warn("Version not available.");
            }
        }

        if(this._cachedGracenoteVersion)
        {
            dataItems[0] = {
                text1Id : "CurrentVersion",
                label1 : this._cachedGracenoteVersion,
                itemStyle:'style06',
                appData : "CurrentVersion",
                hasCaret : false,
                disabled : false
            };
        }
        else
        {
            dataItems[0] = {
                text1Id : "CurrentVersion",
                label1 : null,
                itemStyle:'style06',
                appData : "CurrentVersion",
                hasCaret : false,
                disabled : false
            };
        }

        if(gracenoteItems.length > 0 )
        {
            for (var i = 0; i < gracenoteItems.length ; i++)
            {
                dataItems[dataItems.length] = {
                appData : gracenoteItems[i].appData,
                text1Id : "GracenoteVersion",
                label1 : gracenoteItems[i].version,
                itemStyle:'style06',
                hasCaret : false,
                disabled : disable
                };
            }
        }
        //Set the datalist and update
        dataList.items = dataItems;
        dataList.itemCount = dataItems.length;
        this._musicUpdatesDataList = dataList;
        this._currentContextTemplate.list2Ctrl.setDataList(dataList);
        this._currentContextTemplate.list2Ctrl.updateItems(0, dataList.items.length-1);
    }
}

//Update Error text
sysupdateApp.prototype._setErrorText = function(errormsg)
{
    var text2Id = null;
    if (errormsg)
    {
        //Update the error message in dialog
        text2Id = errormsg;
        if(this._currentContext.ctxtId === "FailSafeSystemInstallNoSuccess")
        {
            this._currentContextTemplate.dialog3Ctrl.setText3Id(text2Id);
        }
        else
        {
            this._currentContextTemplate.dialog3Ctrl.setText2Id(text2Id);
        }
    }
}

//Update dialog text
sysupdateApp.prototype._setConfirmMusicUpdateText = function()
{
    //update the dialog text
    if(this._cachedGracenoteVersion != null)
    {
        this._currentContextTemplate.dialog3Ctrl.setText1Id("CurrentDatabase" , { CurrentVersion : this._cachedGracenoteVersion});
    }
    else
    {
        this._currentContextTemplate.dialog3Ctrl.setText1Id("CurrentDatabase" , { CurrentVersion : this._notAvailable});
    }
    if (this._installPackage !=null)
    {
        this._currentContextTemplate.dialog3Ctrl.setText2Id("InstallDatabase", {InstallVersion : this._installPackage});
    }
    this._currentContextTemplate.dialog3Ctrl.setText3Id("SystemNA");
}

//update Available Software PackagesList
sysupdateApp.prototype._updateAvailableSoftwarePackagesList = function(packages, disable)
{
    if(packages.updatesList && packages.count > 0 )
    {
        var dataList = {
            itemCountKnown : true
        };
        var dataItems = new Array();
        var softwareUpdateItems = new Array();
        var ReinstallItems = new Array();
        var failSafeItems = new Array();
        var softwareUpdateList = reinstallList = 0;
        var failSafeList = 0;
        var versionType = "";
        var unknownUpdates = 0;

        for(var i = 0; i < packages.count; i++)
        {
            versionType = packages.updatesList[i].type;
            if(versionType)
            {
                switch(versionType)
                {
                    case "SYSTEM" :
                        softwareUpdateItems[softwareUpdateList] = {
                            appData : packages.updatesList[i].id,
                            version : packages.updatesList[i].version
                        };
                        softwareUpdateList++;
                        break;
                    case "REINSTALL" :
                        ReinstallItems[reinstallList] = {
                            appData : packages.updatesList[i].id,
                            version : packages.updatesList[i].version
                        };
                        reinstallList++;
                        break;
                    case "FAILSAFEOS" :
                        failSafeItems[failSafeList] = {
                            appData : packages.updatesList[i].id,
                            version : packages.updatesList[i].version
                        };
                        failSafeList++;
                        break;
                    default :
                        log.warn(unknownUpdates+" Updates with unknown version types are found.");
                        unknownUpdates++;
                        break;
                }
            }
            else
            {
                log.warn("Version not available.");
            }
        }

        //Update Software Version
        if(this._cachedOSVersion)
        {
            dataItems[0] = {
                text1Id : "CurrentOSVersion",
                label1 : this._cachedOSVersion,
                itemStyle:'style06',
                appData : "CurrentOSVersion",
                hasCaret : false,
                disabled : false
            };
        }
        else
        {
            dataItems[0] = {
                text1Id : "CurrentOSVersion",
                label1 : null,
                itemStyle:'style06',
                appData : "CurrentOSVersion",
                hasCaret : false,
                disabled : false
            };
        }

        if(softwareUpdateItems.length > 0 )
        {
            for (var i = 0; i < softwareUpdateItems.length ; i++)
            {
                dataItems[dataItems.length] = {
                    appData : softwareUpdateItems[i].appData,
                    text1Id : "SoftwareVersion",
                    label1 : softwareUpdateItems[i].version,
                    itemStyle:'style06',
                    hasCaret : false,
                    disabled : disable
                };
            }
        }

        if(ReinstallItems.length > 0 )
        {
            for (var i = 0; i < ReinstallItems.length ; i++)
            {
                dataItems[dataItems.length] = {
                    appData : ReinstallItems[i].appData,
                    text1Id : "ReinstallationPackage",
                    label1 : ReinstallItems[i].version,
                    itemStyle:'style06',
                    hasCaret : false,
                    disabled : disable
                };
            }
        }
        if(failSafeItems.length > 0 )
        {
            for (var i = 0; i < failSafeItems.length ; i++)
            {
                dataItems[dataItems.length] = {
                    appData : failSafeItems[i].appData,
                    text1Id : "FailSafeImage",
                    label1 : failSafeItems[i].version,
                    itemStyle:'style06',
                    hasCaret : false,
                    disabled : disable
                };
            }
        }
        //Set the datalist and update
        dataList.items = dataItems;
        dataList.itemCount = dataItems.length;
        this._softwareUpdatesDataList = dataList;
        this._currentContextTemplate.list2Ctrl.setDataList(dataList);
        this._currentContextTemplate.list2Ctrl.updateItems(0, dataList.items.length-1);
    }
}

//update dialog text
sysupdateApp.prototype._setConfirmSoftwareUpdateInstallText = function(tmplt)
{
    if (this._cachedOSVersion != null)
    {
        tmplt.dialog3Ctrl.setText1Id("CurrentSoftwareVersion" , { CurrentOsVersion : this._cachedOSVersion});
    }
    else
    {
        tmplt.dialog3Ctrl.setText1Id("CurrentSoftwareVersion" , { CurrentOsVersion : this._notAvailable});
    }
    if (this._installSoftwarePackage != null)
    {
        tmplt.dialog3Ctrl.setText2Id("UpdateToSoftwareVersion" , {InstallOsVersion : this._installSoftwarePackage});
    }
    tmplt.dialog3Ctrl.setText3Id("SystemRestart");
}

//Update the text for SoftwareInfo context
sysupdateApp.prototype._setSoftwareInfoText = function(tmplt)
{
    if (this._cachedOSVersion != null)
    {
        var regionAndNAVVersion = this._getRegionAndNAVEngineVersion();
		tmplt.dialog3Ctrl.setText1Id("OSVersion" , { CurrentOsVersion : this._cachedOSVersion + " " +regionAndNAVVersion});
    }
    else
    {
        tmplt.dialog3Ctrl.setText1Id("OSNotAvailable");
    }
    if (this._cachedGracenoteVersion != null)
    {
        tmplt.dialog3Ctrl.setText2Id("MusicDBVersion", { CurrentVersion : this._cachedGracenoteVersion});        
    }
    else
    {
        tmplt.dialog3Ctrl.setText2Id("NotAvailable");
    }
    if (this._installFailSafeImage != null)
    {
        tmplt.dialog3Ctrl.setText3Id("FailSafeVersion", {CurrentFailSafeVersion : this._installFailSafeImage});     
    }
    else
    {
        tmplt.dialog3Ctrl.setText3Id("FailSafeNotAvailable");
    }
}

//Update the FailSafe Image version
sysupdateApp.prototype._setFailSafeSystemUpdateInstVersion = function(tmplt)
{
    //Set the Failsafe image version in dialog
    tmplt.dialog3Ctrl.setText1Id("ConfirmFailSafeUpdateInstall", { FailsafeImageVersion : this._installFailSafeImage });
}

//Update the progress bar
sysupdateApp.prototype._updateInstallProgress = function(tmplt,progress)
{
    var progress = (parseInt(progress) / 100) ;
    //Update the progress bar
    tmplt.dialog3Ctrl.setSliderValue(progress);
}

// send event to mmui after 3 secs of automass update display
sysupdateApp.prototype._autoUpdateSendEvent = function()
{
    log.info("Sending ConfirmInstall to MMUI");
    framework.sendEventToMmui(this.uiaId, "ConfirmInstall");
}

/**************************
 * SysUpdate App Functions *
 **************************/

sysupdateApp.prototype._updateCurrentGracenoteVersion = function(version)
{

    if (this._currentContext.ctxtId === "AvailableMusicPackages")
    {
        // get label
        var versionItem = this._currentContextTemplate.list2Ctrl.getItemByData("CurrentVersion");
        // update context table
        this._contextTable.AvailableMusicPackages.controlProperties.List2Ctrl.dataList.items[0].text1Id = "CurrentVersion";
        this._contextTable.AvailableMusicPackages.controlProperties.List2Ctrl.dataList.items[0].label1 = version;
        // update list
        this._currentContextTemplate.list2Ctrl.dataList.items[versionItem.itemId].text1Id = "CurrentVersion";
        this._currentContextTemplate.list2Ctrl.dataList.items[versionItem.itemId].label1 = version;

        this._currentContextTemplate.list2Ctrl.updateItems(versionItem.itemId, versionItem.itemId);
    }
    else if (this._currentContext.ctxtId === "SoftwareInfo")
    {
        this._currentContextTemplate.dialog3Ctrl.setText2Id("MusicDBVersion", { CurrentVersion : this._cachedGracenoteVersion}); 
    }
}

sysupdateApp.prototype._updateCurrentFailSafeVersion = function(version)
{
    if (version != null)
    {
        this._currentContextTemplate.dialog3Ctrl.setText3Id("FailSafeVersion", {CurrentFailSafeVersion : version});
    }
    else
    {
        this._currentContextTemplate.dialog3Ctrl.setText3Id("FailSafeNotAvailable");
    }
}

sysupdateApp.prototype._updateCurrentOSVersion = function(version)
{
    if (this._currentContext.ctxtId === "AvailableSoftwarePackages")
    {
        // get label
        var versionItem = this._currentContextTemplate.list2Ctrl.getItemByData("CurrentOSVersion");
        // update context table
        this._contextTable.AvailableMusicPackages.controlProperties.List2Ctrl.dataList.items[0].text1Id = "CurrentOSVersion";
        this._contextTable.AvailableMusicPackages.controlProperties.List2Ctrl.dataList.items[0].label1 = version;
        // update list
        this._currentContextTemplate.list2Ctrl.dataList.items[versionItem.itemId].text1Id = "CurrentOSVersion";
        this._currentContextTemplate.list2Ctrl.dataList.items[versionItem.itemId].label1 = version;

        this._currentContextTemplate.list2Ctrl.updateItems(versionItem.itemId, versionItem.itemId);
    }
    else if (this._currentContext.ctxtId === "SoftwareInfo")
    {
        var regionAndNAVVersion = this._getRegionAndNAVEngineVersion();
		this._currentContextTemplate.dialog3Ctrl.setText1Id("OSVersion" , { CurrentOsVersion : this._cachedOSVersion + " " +regionAndNAVVersion});
    }
}

//Helper function to return Region Info and NAV Engine Version
sysupdateApp.prototype._getRegionAndNAVEngineVersion = function()
{
    var region = framework.localize.getRegion();
	var regionAndNAVEngineVer = null;
	
	switch(region)
	{
		case "Region_Europe":
			regionAndNAVEngineVer = "EU N";
			break;
		case "Region_NorthAmerica":
			regionAndNAVEngineVer = "NA N";
			break;
		case "Region_4A":
			regionAndNAVEngineVer = "4A N";
			break;
		case "Region_Japan":
			regionAndNAVEngineVer = "JP M";
			break;
		case "Region_ChinaTaiwan":
			regionAndNAVEngineVer = "HKM N";
			break;
		case "Undefined":
			regionAndNAVEngineVer = "";
			break;
		default :
			regionAndNAVEngineVer =  "";
			break;
	}
	return 	regionAndNAVEngineVer;
	
}

sysupdateApp.prototype._setButtonState = function(tmplt, buttonId)
{
    tmplt.dialog3Ctrl.setDisabled(buttonId, this._cachedSpeed);
}

/**************************
 * Framework register
 **************************/
framework.registerAppLoaded("sysupdate", null, true);
