/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: btpairingApp.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: ayonchn / TCS
 Date:
 __________________________________________________________________________

 Description: IHU GUI Btpairing App

 Revisions:
 v0.1 (25-Sept-2012) btpairingApp modified for dictionary implementation
 v0.2 (29-Oct-2012) btpairingApp modified for DeviceName and ON/OFF toggle - avalajh
 v0.3 (7-Nov-2012) btpairingApp modified for disable some listItems - avalajh
 v0.4 (15-Jan-2013) btpairingApp modified for New UI Specs migration - ajhalan
 v0.5 (27-March-2014) Add one new context "DeleteiOS" - avalajh
 v0.6 (4-April-2014) Made changes for SCR SW00143886 - avalajh
 
 __________________________________________________________________________

 */

log.addSrcFile("btpairingApp.js", "btpairing");

/*******************************************************************************
 * Start of Base App Implementation
 *
 * Code in this section should not be modified except for function names based
 * on the appname
 ******************************************************************************/

function btpairingApp(uiaId)
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
btpairingApp.prototype.appInit = function()
{
    log.debug(" btpairingApp appInit  called...");

    if (framework.debugMode)
    {
        utility.loadScript("apps/btpairing/test/btpairingAppTest.js");
    }

    // cache
    this._cachedBTStatusAndList = null;
    this._cachedDeleteWhichDevice = null;
    this._cachedDiscoverable = null;
    this._cachedNumericConfirmSSP= null;
    this._cachedNumericConfirmLegacy= null;
    this._cachedDeviceName = null;
    this._cachedAudioPhone = null;
    this._cachedPartialSuccess = null;
    this._cachedDeviceInfo = null;
    this._cachedAudioPhoneConnect = null;
    this._timeout = null;
    this._discoverableTimer = null;
    this._discoverableTimeout = 180;
    this._speedThreshold = false;
    this._deviceListCount = 0;
    this._bluetoothOffSent = false;
    this._flag = null;
    this._cachedCurrentDeviceId = 0;
    this._MusicBatteryStrength = null;
    this._PhoneBatteryStrength = null;
    this._cachedErrorMessage = null;
    this._PhoneSignalStrength = -1;
    this._PhoneCharging = false;
    this._ispairexiterror_populatedonce = false;

    // Default config
    this._BTConnectionManagerCtxtDataList =
    {
        itemCountKnown : true, 
        itemCount : 3, 
        items : [
            // Bluetooth ON/OFF button is added
            { appData : {name: "Bluetooth"} , text1Id : "Bluetooth", itemStyle : "styleOnOff", value : 1, hasCaret : false },
            { appData : {name: "SelectBluetoothSettings"}, text1Id : "Settings", itemStyle : "style02" ,hasCaret : false },
            { appData : {name: "AddNewDevice"}, text1Id : "AddNewDevice", disabled : true, itemStyle : "style02" ,hasCaret : false}
        ]
    };

    this._bluetoothSettingsCtxtDataList =
    {
        itemCountKnown : true, 
        itemCount : 3, 
        items : [
            { appData : "SelectBluetoothInfo", text1Id : "BluetoothInformation", itemStyle : "style02" ,hasCaret : false  },
            { appData : "ChangePairCode", text1Id : "ChangePaircode", itemStyle : "style02" ,hasCaret : false  },
            { appData : "RemoveDevice", text1Id : "RemoveDevice", itemStyle : "style02" ,hasCaret : false }
        ]
    };

    this._deleteWhichDeviceCtxtDataList =
    {
        itemCountKnown : true, 
        itemCount : 1, 
        items : [
            { appData : "SelectAllDevices", text1Id : "RemoveDevice", image1 : "./apps/btpairing/images/IcnListRemoveItem.gif", itemStyle : "style02" , hasCaret : false}
        ]
    };

    this._connectionTypeCtxtDataList =
    {
        itemCountKnown : true, 
        itemCount : 5, 
        items : [
            { appData : "SelectPhoneAndAudio", text1Id : "PhoneAndAudio", radio : true , itemStyle : "style03" , image1:"radio" , image2: "common/images/icons/IcnListBtConnType_Phone.png" , image3:"common/images/icons/IcnListBtConnType_Music.png" , hasCaret : false , checked : false },
            { appData : "SelectPhoneOnly", text1Id : "PhoneOnly", radio : true, itemStyle : "style03"  , image1:"radio" , image2: "common/images/icons/IcnListBtConnType_Phone.png" , hasCaret : false , checked : false },
            { appData : "SelectAudioOnly", text1Id : "AudioOnly", radio : true, itemStyle : "style03"  ,image1:"radio" ,  image2: "common/images/icons/IcnListBtConnType_Music.png" , hasCaret : false , checked : false },
            { appData : "SelectDisconnect", text1Id : "Disconnect", itemStyle : "style03" ,  hasCaret : false , disabled : true },
            { appData : "RemovePairedDevice", text1Id : "RemovePairDevice", itemStyle : "style03" , hasCaret : false}
       ]
    };

    //@formatter:off
    this._contextTable = {

        "BTConnectionManager" :  {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack" ,
            "sbNameId" : "Setting", 
            "controlProperties" : {
                "List2Ctrl" : {
                    "dataList" : this._BTConnectionManagerCtxtDataList,
                     titleConfiguration : 'listTitle', 
                    title : {
                         text1Id : "BluetoothConnection",
                         titleStyle : "style03"
                    }, 
                    selectCallback : this._listItemClickCallback.bind(this), 
                    needDataCallback : null 
                } // end of properties for "ListCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._BTConnectionManagerCtxtTmpltReadyToDisplay.bind(this),  
            "contextInFunction" : null, 
            "contextOutFunction" : null, 
            "displayedFunction" : null
        }, // end of "BTConnectionManager"

        "BluetoothSettings" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack" ,
            "sbNameId" : "Setting" , 
            "controlProperties" : {
                "List2Ctrl" : {
                    "dataList" : this._bluetoothSettingsCtxtDataList, 
                    titleConfiguration : 'listTitle',
                    title : {
                        text1Id : "Settings", 
                        titleStyle : "style03"
                    }, 
                    selectCallback : this._listItemClickCallback.bind(this), 
                    needDataCallback : null 
                } // end of properties for "ListCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._BluetoothSettingsTmpltReadyToDisplay.bind(this), 
            "contextInFunction" : null, 
            "contextOutFunction" : null, 
            "displayedFunction" : null
        }, // end of "BluetoothSettings"
        
        "DeleteWhichDevice" : {
            "template" : "List2Tmplt",
            "leftBtnStyle" : "goBack" ,
            "sbNameId" : "Setting" , 
            "controlProperties" : {
                "List2Ctrl" : {
                    "dataList" : this._deleteWhichDeviceCtxtDataList, 
                    titleConfiguration : 'listTitle',
                    title : {
                        text1Id : "SelectDeviceToRemove", 
                        titleStyle : "style02"
                    }, 
                    selectCallback : this._listItemClickCallback.bind(this), 
                    needDataCallback : null 
                } // end of properties for "ListCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._DeleteWhichDeviceCtxtTmpltReadyToDisplay.bind(this), 
            "contextInFunction" : null, 
            "contextOutFunction" : null, 
            "displayedFunction" : null
        }, // end of "DeleteWhichDevice"
        
        "Discoverable" : {
            "template" : "Dialog3Tmplt", 
            "sbNameId" : "Setting" ,
            "controlProperties" : {
                "Dialog3Ctrl" : {
                    "contentStyle" : "style22", 
                    defaultSelectCallback : this._dialogCtrlClickCallback.bind(this),
                    buttonCount : 1, 
                    buttonConfig : {
                        button1 : {
                            labelId : "common.Cancel", 
                            appData : "Global.Cancel", 
                        }
                    },
                    text1Id : "Discoverable",
					text2Id : " ",
                    text3Id : "DiscoverableTimeout"
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._DiscoverableCtxtTmpltReadyToDisplay.bind(this), 
            "contextInFunction" : null, 
            "displayedFunction" : this._DiscoverableCtxtTmpltDisplayed.bind(this)
        }, // end of "Discoverable"
        
        "NumericConfirmSSP" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Setting" , 
            "controlProperties" : {
                "Dialog3Ctrl" : {
                    "contentStyle" : "style05",
                    "defaultSelectCallback" : this._dialogCtrlClickCallback.bind(this),
                    buttonCount : 3, 
                    buttonConfig : {
                        button1 : {
                            labelId : "common.Cancel", 
                            appData : "Global.Cancel"                            
                        }, 
                        button2 : {
                            labelId : "common.No", 
                            appData : "Global.No" 
                        }, 
                        button3 : {
                            labelId : "common.Yes", 
                            appData : "Global.Yes" 
                        }
                    }, 
                    text1Id : "NumericConfirmSSP"
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._NumericConfirmSSPCtxtTmpltReadyToDisplay.bind(this), 
            "contextInFunction" : null, 
            "displayedFunction" : null 
        }, // end of "NumericConfirmSSP"
        
        "NumericConfirmLegacy" : {
            "template" : "Dialog3Tmplt", 
            "sbNameId" : "Setting" ,
            "controlProperties" : {
                "Dialog3Ctrl" : {
                    "contentStyle" : "style05",
                    defaultSelectCallback : this._dialogCtrlClickCallback.bind(this),
                    buttonCount : 1, 
                    buttonConfig : {
                        button1 : {
                            labelId : "common.Cancel", 
                            appData : "Global.Cancel", 
                        }
                    }, 
                    text1Id : "NumericConfirmLegacy",
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._NumericConfirmLegacyCtxtTmpltReadyToDisplay.bind(this), 
            "contextInFunction" : null, 
            "displayedFunction" : null 
        }, // end of "NumericConfirmLegacy"
        
        "PairingInProcess" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Setting" , 
            "controlProperties" : {
                "Dialog3Ctrl" : {
                    "contentStyle" : "style03", 
                    text1Id : "PairingInProcess",
                    text2Id : "PairingInProcessConnection", 
                    imagePath1 : "common/images/IndeterminateMeter_2.png"
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._PairingInProcessCtxtTmpltReadyToDisplay.bind(this),  
            "contextInFunction" : null, 
            "displayedFunction" : null
        }, // end of "PairingInProcess"
        
        "PairSuccess" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Setting" , 
            "controlProperties" : {
                "Dialog3Ctrl" : {
                    contentStyle : "style03",
                    text1Id : "PairSuccess",
                    text2Id : "PairSuccessConnection",
                    imagePath1 : "common/images/IndeterminateMeter_2.png"
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._PairSuccessCtxtTmpltReadyToDisplay.bind(this), 
            "contextInFunction" : null,
            "displayedFunction" : null 
        }, // end of "PairSuccess"

        "ConnectingDevice" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Setting" , 
            "controlProperties" : {
                "Dialog3Ctrl" : {
                    contentStyle : "style14", 
                    text1Id : "ConnectingDevice", 
                    meter : {"meterType":"indeterminate", "meterPath":"common/images/IndeterminateMeter_2.png"}
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._ConnectingDeviceCtxtTmpltReadyToDisplay.bind(this),  
            "contextInFunction" : null, 
            "displayedFunction" : null 
        }, // end of "ConnectingDevice"
        
        "ConnectSuccess" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Setting" , 
            "controlProperties" : {
                "Dialog3Ctrl" : {
                    contentStyle : "style02",
                    text1Id  : "ConnectSuccess"
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._ConnectSuccessCtxtTmpltReadyToDisplay.bind(this), 
            "contextInFunction" : null, 
            "displayedFunction" : null
        }, // end of "ConnectSuccess"
        
        "DisconnectFailed" : {
            "template" : "Dialog3Tmplt",
            "leftBtnStyle" : "goBack" , 
            "sbNameId" : "Setting" ,
            "controlProperties" : {
                "Dialog3Ctrl" : {
                    contentStyle : "style02",
                    defaultSelectCallback : this._dialogCtrlClickCallback.bind(this),
                    initialFocus : 1,
                    buttonCount : 2, 
                    buttonConfig : {
                        button1 : {
                            labelId : "Back", 
                            appData : "Global.GoBack", 
                        }, 
                        button2 : {
                           labelId : "Retry", 
                           appData : "SelectRetry",
                        }
                    },
                    text1Id : "DisconnectFailed",
                }// end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._DialogTmpltReadyToDisplay.bind(this),  
            "contextInFunction" : null, 
            "displayedFunction" : null
        }, // end of "DisconnectFailed"

        "NoPairDisconnectFail" : {
            "template" : "Dialog3Tmplt",
            "leftBtnStyle" : "goBack" , 
            "sbNameId" : "Setting" ,
            "controlProperties" : {
                "Dialog3Ctrl" : {
                    contentStyle : "style02", 
                    defaultSelectCallback : this._dialogCtrlClickCallback.bind(this),
                    initialFocus : 1,
                    buttonCount : 2, 
                    buttonConfig : {
                        button1 : {
                            labelId : "Back", 
                            appData : "Global.GoBack", 
                        }, 
                        button2 : {
                            labelId : "Retry", 
                            appData : "SelectRetry", 
                        }
                    },
                    text1Id : "NoPairDisconnectFail",
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._DialogTmpltReadyToDisplay.bind(this),  
            "contextInFunction" : null, 
            "displayedFunction" : null
        }, // end of "NoPairDisconnectFail"

        "DisconnectSuccess" : {
            "template" : "Dialog3Tmplt",
            "sbNameId" : "Setting" , 
            "controlProperties" : {
                "Dialog3Ctrl" : {
                    contentStyle : "style02",
                    text1Id : "DisconnectSuccess"
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._DisconnectSuccessCtxtTmpltReadyToDisplay.bind(this), 
            "contextInFunction" : null,
            "displayedFunction" : null
        }, // end of "DisconnectSuccess"

        "DeleteComplete" : {
            "template" : "Dialog3Tmplt", 
            "sbNameId" : "Setting" ,
            "controlProperties" : {
                "Dialog3Ctrl" : {
                    contentStyle : "style02",
                    text1Id : null,                      
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._DeleteCompleteCtxtTmpltReadyToDisplay.bind(this), 
            "contextInFunction" : null,
            "displayedFunction" : null
        }, // end of "DeleteComplete"

        "DisconnectingDevice" : {
            "template" : "Dialog3Tmplt", 
            "sbNameId" : "Setting" ,
            "controlProperties" : {
                "Dialog3Ctrl" : {
                    contentStyle : "style14", 
                    text1Id : "DisconnectingDevice", 
                    meter : {"meterType":"indeterminate", "meterPath":"common/images/IndeterminateMeter_2.png"}
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._DisconnectingDeviceCtxtTmpltReadyToDisplay.bind(this), 
            "contextInFunction" : null, 
            "displayedFunction" : null 
        }, // end of "DisconnectingDevice"
        
        "PairCancelling" : {
            "template" : "Dialog3Tmplt", 
            "sbNameId" : "Setting" ,
            "controlProperties" : {
                "Dialog3Ctrl" : {
                    "contentStyle" : "style14", 
                    text1Id : "PairCancelling", 
                    imagePath1 : "common/images/IndeterminateMeter_2.png"
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "readyFunction" : null, 
            "contextInFunction" : null, 
            "displayedFunction" : null
        }, // end of "PairCancelling"
        
        "DeleteDevice" : {
            "template" : "Dialog3Tmplt", 
            "sbNameId" : "Setting" ,
            "controlProperties" : {
                "Dialog3Ctrl" : {
                    contentStyle : "style14", 
                    text1Id : "DeleteDevice", 
                    imagePath1 : "common/images/IndeterminateMeter_2.png"
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "readyFunction" : null, 
            "contextInFunction" : null, 
            "displayedFunction" : null
        }, // end of "DeleteDevice"

        "DisconnectingToPair" : {
            "template" : "Dialog3Tmplt", 
            "sbNameId" : "Setting" ,
            "controlProperties" : {
                "Dialog3Ctrl" : {
                    contentStyle : "style03", 
                    defaultSelectCallback : this._dialogCtrlClickCallback.bind(this),
                    buttonCount : 1, 
                    buttonConfig : {

                        button1 : {
                            labelId : "common.Cancel", 
                            appData : "Global.Cancel", 
                        }
                    }, 
                    text1Id : "DisconnectingToPair", 
                    imagePath1 : "common/images/IndeterminateMeter_2.png"
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._DialogTmpltReadyToDisplay.bind(this),
            "contextInFunction" : null, 
            "displayedFunction" : null
        }, // end of "DisconnectingToPair"

        "PairExitPopUp" : {
            "template" : "Dialog3Tmplt",
            "leftBtnStyle" : "goBack" , 
            "sbNameId" : "Setting" ,
            "controlProperties" : {
                "Dialog3Ctrl" : {
                    contentStyle : "style13", 
                    defaultSelectCallback : this._dialogCtrlClickCallback.bind(this),
                    initialFocus : 1,
                    buttonCount : 2, 
                    buttonConfig : {
                        button1 : {
                            labelId : "Back", 
                            appData : "Global.GoBack", 
                        }, 
                        button2 : {
                            labelId : "Retry", 
                            appData : "SelectRetry", 
                        }
                    },
                    text1Id : "PairingDevice",                  
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._PairExitPopUpTmpltReadyToDisplay.bind(this),
            "contextInFunction" : null, 
            "displayedFunction" : null
        }, // end of "PairExitPopUp"

        "ConnectFailed" : {
            "template" : "Dialog3Tmplt", 
            "leftBtnStyle" : "goBack" , 
            "sbNameId" : "Setting" ,
            "controlProperties" : {
                "Dialog3Ctrl" : {
                    contentStyle : "style13",
                    defaultSelectCallback : this._dialogCtrlClickCallback.bind(this),
                    initialFocus : 1,
                    buttonCount : 2, 
                    buttonConfig : {
                        button1 : {
                            labelId : "Back", 
                            appData : "Global.GoBack", 
                        }, 
                        button2 : {
                            labelId : "Retry", 
                            appData : "SelectRetry", 
                        }
                    },
                    text1Id : "ConnectFailed",
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._ConnectFailedTmpltReadyToDisplay.bind(this),
            "contextInFunction" : null, 
            "displayedFunction" : null
        }, // end of "ConnectFailed"
        
        "DeleteFailed" : {
            "template" : "Dialog3Tmplt", 
            "leftBtnStyle" : "goBack" ,
            "sbNameId" : "Setting" ,
            "controlProperties" : {
                "Dialog3Ctrl" : {
                    contentStyle : "style02",
                    defaultSelectCallback : this._dialogCtrlClickCallback.bind(this),
                    initialFocus : 1,
                    buttonCount : 2, 
                    buttonConfig : {
                        button1 : {
                            labelId : "Back", 
                            appData : "Global.GoBack", 
                        }, 
                        button2 : {
                            labelId : "Retry", 
                            appData : "SelectRetry", 
                        }
                    },
                    text1Id : null,
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._DialogTmpltReadyToDisplay.bind(this),
            "contextInFunction" : null, 
            "displayedFunction" : null
        }, // end of "DeleteFailed"

        "PartialSuccess" : {
            "template" : "Dialog3Tmplt", 
            "sbNameId" : "Setting" ,
            "controlProperties" : {
                "Dialog3Ctrl" : {
                    contentStyle : "style02",                    
                    defaultSelectCallback : this._dialogCtrlClickCallback.bind(this),
                    buttonCount : 1,
                    buttonConfig : {
                        button1 : {
                            labelId : "common.Ok", 
                            appData : "Global.Yes", 
                        }
                    },
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._PartialSuccessCtxtTmpltReadyToDisplay.bind(this), 
            "contextInFunction" : null, 
            "displayedFunction" : null
        }, // end of "PartialSuccess"

        "BluetoothInformation" : {
            "template" : "Dialog3Tmplt", 
            "sbNameId" : "Setting" ,
            "controlProperties" : {
                "Dialog3Ctrl" : {
                    contentStyle : "style17", 
                    defaultSelectCallback : this._dialogCtrlClickCallback.bind(this),
                    buttonCount : 1, 
                    buttonConfig : {
                        button1 : {
                            labelId : "common.Ok",
                            appData : "Global.Yes"
                        }
                    },
                    text1Id : "BluetoothInformation"                   
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._BluetoothInformationCtxtTmpltReadyToDisplay.bind(this), 
            "contextInFunction" : null, 
            "displayedFunction" : null
        }, // end of "BluetoothInformation"

        "Mobile911Enable" : {
            "template" : "Dialog3Tmplt", 
            "sbNameId" : "Setting" ,
            "controlProperties" : {
                "Dialog3Ctrl" : {
                    contentStyle : "style02", 
                    defaultSelectCallback : this._dialogCtrlClickCallback.bind(this),
                    initialFocus : 1,
                    buttonCount : 2, 
                    buttonConfig : {
                        button1 : {
                            labelId : "common.No", 
                            appData : "Global.No", 
                        }, 
                        button2 : {
                            labelId : "common.Yes", 
                            appData : "Global.Yes", 
                        }
                    }, 
                    text1Id : "Mobile911Enable",
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "readyFunction" : null, 
            "contextInFunction" : null, 
            "displayedFunction" : null
        }, // end of "Mobile911Enable"
        
        "ConfirmDelete" : {
            "template" : "Dialog3Tmplt", 
            "sbNameId" : "Setting" ,
            "controlProperties" : {
                "Dialog3Ctrl" : {
                    contentStyle : "style02",
                    defaultSelectCallback : this._dialogCtrlClickCallback.bind(this),
                    initialFocus : 0,
                    buttonCount : 2, 
                    buttonConfig : {
                        button1 : {
                            labelId : "common.No", 
                            appData : "Global.No", 
                        }, 
                        button2 : {
                            labelId : "common.Yes", 
                            appData : "Global.Yes", 
                        }
                    },
                    text1Id : null, 
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._DialogTmpltReadyToDisplay.bind(this),
            "contextInFunction" : null, 
            "displayedFunction" : null
        }, // end of "ConfirmDelete"

        "InvalidLegacyPIN" : {
            "template" : "Dialog3Tmplt", 
            "sbNameId" : "Setting" ,
            "controlProperties" : {
                "Dialog3Ctrl" : {           
                    "contentStyle" : "style02",
                    "fullScreen" : false,                                        
                    text1Id : "InvalidLegacyPIN" 
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._InvalidLegacyPinCtxtTmpltReadyToDisplay.bind(this), 
            "contextInFunction" : null, 
            "displayedFunction" : null
        }, // end of "InvalidLegacyPIN"

        "MaxDevices" : {
            "template" : "Dialog3Tmplt", 
            "sbNameId" : "Setting" ,
            "controlProperties" : {
                "Dialog3Ctrl" : {
                    contentStyle : "style05",
                    defaultSelectCallback : this._dialogCtrlClickCallback.bind(this),
                    initialFocus : 1,
                    buttonCount : 2, 
                    buttonConfig : {
                        button1 : {
                            labelId : "common.No", 
                            appData : "Global.No", 
                        }, 
                        button2 : {
                            labelId : "common.Yes", 
                            appData : "Global.Yes", 
                        }
                    }, 
                    text1Id : "MaxDevices"
                } // end of properties for "DialogCtrl"
            }, // end of list of controlProperties
            "readyFunction" : null, 
            "contextInFunction" : null, 
            "displayedFunction" : null
        }, // end of "MaxDevices"

        "ChangePairCode" : {
            "template" : "DialPad2Tmplt",
            "sbNameId" : "Enterpaircode" , 
            "controlProperties" : {
                "DialPad2Ctrl" : {
                   defaultSelectCallback :  this._dialPadHandler.bind(this),
                   ctrlStyle : "DialpadStyle03",
                   value : null
                } // end of properties for "DialPadCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._ChangePairCodeCtxtTmpltReadyToDisplay.bind(this), 
            "contextInFunction" : null, 
            "displayedFunction" : null
        }, // end of "ChangePairCode"

        "ConnectionType" : {
            "template" : "List2Tmplt",
            "sbNameId" : "Setting",
            "leftBtnStyle" : "goBack" ,
            "controlProperties" : {
                "List2Ctrl" : {
                    "dataList" : this._connectionTypeCtxtDataList, 
                     selectCallback : this._listItemClickCallback.bind(this), 
                     titleConfiguration : "listTitle",
                     title : {
                        titleStyle : "style03",
                        text1Id : "ConnectoinTypeTitle",
                        text1SubMap : null,
                    }
                } // end of properties for "ListCtrl"
            }, // end of list of controlProperties
            "readyFunction" : this._ConnectionTypeCtxtTmpltReadyToDisplay.bind(this) , 
            "contextInFunction" : null,
            "contextOutFunction" : null, 
            "displayedFunction" : null
        }, // end of "ConnectionType"
		
		"DeleteiOS" : {
			"template" : "Dialog3Tmplt", 
			"sbNameId" : "Setting" ,
			"controlProperties" : {
				"Dialog3Ctrl" : {
					contentStyle : "style02",                    
					defaultSelectCallback : this._dialogCtrlClickCallback.bind(this),
					buttonCount : 1,
					buttonConfig : {
						button1 : {
							labelId : "common.Ok", 
							appData : "Global.Yes", 
						}
					},
					text1Id : "BTPairingDeleteiOS",
				} // end of properties for "DialogCtrl"
			}, // end of list of controlProperties
			"readyFunction" : null, 
			"contextInFunction" : null, 
			"displayedFunction" : null
		}, // end of "DeleteiOS"
    };
    // end of this._contextTable
    //@formatter:on

    //@formatter:off
    this._messageTable =
    {
        "BTStatusAndList" : this._BTStatusAndListMsgHandler.bind(this), 
        "DeleteWhichDevice" : this._DeleteWhichDeviceMsgHandler.bind(this), 
        "Connect" : this._ConnectMsgHandler.bind(this), 
        "PairDevice" : this._PairDeviceMsgHandler.bind(this),         
        "DeviceName" : this._DeviceNameMsgHandler.bind(this),
        "ConnectionType" : this._ConnectionTypeMsgHandler.bind(this),
        "ConnectedProfile" : this._ConnectedProfileMsgHandler.bind(this),
        "PartialSuccess" : this._PartialSuccessMsgHandler.bind(this),
        "DeviceInfo" : this._DeviceInfoMsgHandler.bind(this),
        "PairingFailedErrorCode" : this._PairingFailedErrorCodeMsgHandler.bind(this),
        "Global.AtSpeed" : this._AtSpeedMsgHandler.bind(this),
        "Global.NoSpeed" : this._NoSpeedMsgHandler.bind(this),
        "inputValue": this._InputValueMsgHandler.bind(this),
        "SbnPhoneConnectionStatus" : this._SbnPhoneConnectionStatusMsgHandler.bind(this),
        "SbnAudioConnectionStatus" : this._SbnAudioConnectionStatusMsgHandler.bind(this),
        "SbnPairingSuccessStatus" : this._SbnPairingSuccessStatusMsgHandler.bind(this),
        "RoamingStatus" : this._RoamingStatusMsgHandler.bind(this),
        "BatteryStatus" : this._BatteryStatusMsgHandler.bind(this),
        "SignalStrengthStatus" : this._SignalStrengthStatusMsgHandler.bind(this),
        "CurrentDisplayedDevice" : this._CurrentDisplayedDeviceMsgHandler.bind(this),
        "PhoneChargingStatus" : this._SbnPhoneChargingStatusMsgHandler.bind(this),
        "MusicBatteryStatus" : this._SbnMusicBatteryStatusMsgHandler.bind(this), 
    };
    // end of this._messageTable
    //@formatter:on

};
/**************************
 * General App Functions
 **************************/
// Timer function
btpairingApp.prototype._setTimer = function()
{
     switch (this._currentContext.ctxtId)
     {
        case "NumericConfirmSSP": 
            // intentional case fallthough
        case "NumericConfirmLegacy": 
            // intentional case fallthough
        case "DeleteComplete":
            // intentional case fallthough
        case "InvalidLegacyPIN":
            // intentional case fallthough
        case "ConnectSuccess":
            // intentional case fallthough
        case "PairSuccess":
            // intentional case fallthough
        case "DisconnectSuccess":
            framework.sendEventToMmui(this.uiaId, "TimeOut");
            break;
            // intentional case fallthough
        default:
            log.warn("btpairingApp: Unknown context", this._currentContext.ctxtId);
            break;
     }
};

/*
 * This function is called by Common whenever a msgType="alert" comes from MMUI.
 * This function should return a properties Object to use for the WinkCtrl.
 */
btpairingApp.prototype.getWinkProperties = function(alertId, params)
{
    log.debug("common is looking for wink properties:", alertId, params);
    var winkProperties = null;
    switch(alertId)
    {
        case "PhoneConnectionLost_Alert":
            winkProperties = {
                "style": "style01",
                "text1Id": "PhoneConnectionLost",
            };
            break;
        default:
            // if alertId cannot be found, winkProperties will return null and Common will display default Wink
            log.info("Cannot provide properties for unrecognized alertId: " + alertId);
            break;
    }
    // return the properties to Common
    return winkProperties;
};

/**************************
 * Context handlers
 **************************/

btpairingApp.prototype._BluetoothSettingsTmpltReadyToDisplay = function()
{
    if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "BluetoothSettings")
    {
        if (this._cachedBTStatusAndList != null)
        {
            this._speedThreshold = framework.common.getAtSpeedValue();
            this._populateListCtrl();
            if(this._speedThreshold)
            {
               this._populateBluetoothSettingsList();    
            }
        }
    }    
};

btpairingApp.prototype._ChangePairCodeCtxtTmpltReadyToDisplay = function()
{
    this._speedThreshold = framework.common.getAtSpeedValue();
    if(this._speedThreshold)
    {
        this._AtSpeedMsgHandler();
    }
    else
    {
        this._NoSpeedMsgHandler();
    }
};

// Connection Type Context
btpairingApp.prototype._ConnectionTypeCtxtTmpltReadyToDisplay = function()
{
    if(this._currentContextTemplate)
    {
        this._populateDeviceName(); 
        this._populateConnectionType();
        if(this._cachedAudioPhoneConnect.connected)
        {
            this._populateConnectedProfile();
        }
        this._speedThreshold = framework.common.getAtSpeedValue();
        if(this._speedThreshold)
        {
            this._populateConnectionTypeList();
        }
    }
};

// Partial Success Context
btpairingApp.prototype._DialogTmpltReadyToDisplay = function()
{
    if(this._currentContextTemplate)
    {
        this._populateDeviceName();
    }
    if(this._currentContext.ctxtId === "ConfirmDelete" || this._currentContext.ctxtId === "DeleteFailed")
    {
        if(this._speedThreshold)
        {
            this._AtSpeedMsgHandler();
        }
        else
        {
            this._NoSpeedMsgHandler();
        }
    }
};

// Pairing In Process Context
btpairingApp.prototype._PairingInProcessCtxtTmpltReadyToDisplay = function()
{
     this._flag = true;
};

// BTConnectionManager context
btpairingApp.prototype._BTConnectionManagerCtxtTmpltReadyToDisplay = function()
{
    if (this._cachedBTStatusAndList != null)
    {
        this._speedThreshold = framework.common.getAtSpeedValue();
        this._populateListCtrl();
    }

};

// Discoverable Context
btpairingApp.prototype._DiscoverableCtxtTmpltReadyToDisplay = function()
{
    log.debug("btpairingApp _DiscoverableCtxtTmpltReadyToDisplay called...");
    var subMap;
    if (this._cachedDiscoverable != null)
    {
        this._populateDiscoverable();
    }
    this._discoverableTimeout = 180;
    var text2Id = this._contextTable.Discoverable.controlProperties.Dialog3Ctrl.text3Id;
    subMap = {"discoverableTimeout" : this._discoverableTimeout};
    this._currentContextTemplate.dialog3Ctrl.setText3Id(text2Id,subMap);
    
    if(this._cachedDeviceInfo != null)
    {
        subMap = {"modelName" : this._cachedDeviceInfo.deviceName};
        var text1Id = this._contextTable.Discoverable.controlProperties.Dialog3Ctrl.text1Id;
        this._currentContextTemplate.dialog3Ctrl.setText1Id(text1Id, subMap);
    }

    if (this._discoverableTimer != null)
    {
        clearInterval(this._discoverableTimer);
        this._discoverableTimer = null;
    }
    this._discoverableTimer = setInterval(btpairingApp.prototype._DiscoverableCountDownCallback.bind(this), 1000);
};

btpairingApp.prototype._DiscoverableCtxtTmpltDisplayed = function()
{
    log.debug("btpairingApp _DiscoverableCtxtTmpltDisplayed called...");
    var text2Id = this._contextTable.Discoverable.controlProperties.Dialog3Ctrl.text3Id;
    var subMap = {"discoverableTimeout" : this._discoverableTimeout};
    this._currentContextTemplate.dialog3Ctrl.setText3Id(text2Id,subMap);
};

// Delete Which Device Context
btpairingApp.prototype._DeleteWhichDeviceCtxtTmpltReadyToDisplay = function()
{    
    log.debug("btpairingApp _DeleteWhichDeviceCtxtTmpltReadyToDisplay called...");
    if (this._cachedDeleteWhichDevice != null)
    {
        this._populateDeleteWhichDevice();
    }

    this._speedThreshold = framework.common.getAtSpeedValue();
    if(this._speedThreshold)
    { 
        this._populateDeleteWhichDeviceList();   
    }
};

btpairingApp.prototype._PairExitPopUpTmpltReadyToDisplay = function()
{
    log.debug("btpairingApp _PairExitPopUpTmpltReadyToDisplay called...");
   if (this._cachedErrorMessage != null)
    {
		this._populateErrorMessage();	//This will update the Cached Error Message. Can comment out if Flicker seen. Kept for Rainy day!!!
		this._ispairexiterror_populatedonce = false;
	}
    if(this._speedThreshold)
    {
        this._AtSpeedMsgHandler();
    }
    else
    {
		
        this._NoSpeedMsgHandler();
    }
};

//Connect Failed Context.
btpairingApp.prototype._ConnectFailedTmpltReadyToDisplay = function()
{
     log.debug("btpairingApp _ConnectFailedTmpltReadyToDisplay called...");
     if (this._cachedErrorMessage != null)
     {
         this._populateErrorMessage();
     }
};

// Numeric Confirm Context
btpairingApp.prototype._NumericConfirmSSPCtxtTmpltReadyToDisplay = function()
{
    log.debug("btpairingApp _NumericConfirmSSPCtxtTmpltReadyToDisplay called...");
    if (this._cachedNumericConfirmSSP != null)
    {
        this._populateNumericConfirmSSP();
    }
    
    this._currentContextTemplate.dialog3Ctrl._selectBtn(2); 
    
    // remove any existing timer
    if (this._timeout != null)
    {
        clearTimeout(this._timeout);
    }
    this._timeout = setTimeout(btpairingApp.prototype._setTimer.bind(this), 30000);
};

btpairingApp.prototype._NumericConfirmLegacyCtxtTmpltReadyToDisplay = function()
{
    log.debug("btpairingApp _NumericConfirmLegacyCtxtTmpltReadyToDisplay called...");
    if (this._cachedNumericConfirmLegacy != null)
    {
        this._populateNumericConfirmLegacy();
    }

    // remove any existing timer
    if (this._timeout != null)
    {
        clearTimeout(this._timeout);
    }
    this._timeout = setTimeout(btpairingApp.prototype._setTimer.bind(this), 30000);
};

// Delete Complete Context
btpairingApp.prototype._DeleteCompleteCtxtTmpltReadyToDisplay = function()
{
    log.debug("btpairingApp _DeleteCompleteCtxtTmpltReadyToDisplay called...");
    if(this._currentContextTemplate)
    {
        this._populateDeviceName();
    }
    setTimeout(btpairingApp.prototype._setTimer.bind(this), 3000);
};

// Disconnecting Device Context
btpairingApp.prototype._DisconnectingDeviceCtxtTmpltReadyToDisplay = function()
{
    log.debug("btpairingApp _DisconnectingDeviceCtxtTmpltReadyToDisplay called...");
    if(this._currentContextTemplate)
    {
        if(this._cachedDeviceName)
        {
            this._populateDeviceName();
        }
    }
};

// Connecting Device Context
btpairingApp.prototype._ConnectingDeviceCtxtTmpltReadyToDisplay = function()
{
    log.debug("btpairingApp _ConnectingDeviceCtxtTmpltReadyToDisplay called...");
    if(this._currentContextTemplate)
    {
        if(this._cachedDeviceName)
        {
            this._populateDeviceName();
        }
    }
};

//InvalidLegacyPin Context
btpairingApp.prototype._InvalidLegacyPinCtxtTmpltReadyToDisplay = function()
{
    log.debug("btpairingApp _InvalidLegacyPinCtxtTmpltReadyToDisplay called...");
    setTimeout(btpairingApp.prototype._setTimer.bind(this), 3000);
};

//ConnectSuccess Context
btpairingApp.prototype._ConnectSuccessCtxtTmpltReadyToDisplay = function()
{
    log.debug("btpairingApp _ConnectSuccessCtxtTmpltReadyToDisplay called...");
    if(this._currentContextTemplate)
    {
        if(this._cachedDeviceName)
        {
            this._populateDeviceName();
        }
    }
    setTimeout(btpairingApp.prototype._setTimer.bind(this), 3000);
};

//PairSuccess Context
btpairingApp.prototype._PairSuccessCtxtTmpltReadyToDisplay = function()
{
    log.debug("btpairingApp _PairSuccessCtxtTmpltReadyToDisplay called...");
    if(this._currentContextTemplate)
    {
        if(this._cachedDeviceName)
        {
            this._populateDeviceName();
        }
    }
    if(this._flag)
    {
        this._flag = false;
        setTimeout(btpairingApp.prototype._setTimer.bind(this), 3000);
    }
};

//Partial Success Context
btpairingApp.prototype._PartialSuccessCtxtTmpltReadyToDisplay = function()
{
    log.debug("btpairingApp _PartialSuccessCtxtTmpltReadyToDisplay called...");
    if(this._currentContextTemplate)
    {
        if(this._cachedPartialSuccess)
        {
            this._populatePartialSuccess();
        }
    }
};

// Bluetooth Information context
btpairingApp.prototype._BluetoothInformationCtxtTmpltReadyToDisplay = function()
{
    log.debug("btpairingApp _BluetoothInformationCtxtTmpltReadyToDisplay called...");
    if(this._currentContextTemplate)
    {
        if(this._cachedDeviceInfo)
        {
            this._populateBluetoothInformation();
        }
    }
};

//Disconnect Success Context
btpairingApp.prototype._DisconnectSuccessCtxtTmpltReadyToDisplay = function()
{
    if(this._currentContextTemplate)
    {
        if(this._cachedDeviceName)
        {
            this._populateDeviceName();
        }
    }
    setTimeout(btpairingApp.prototype._setTimer.bind(this), 3000);
};

/**************************
 * Message handlers
 **************************/

// Display Phone Connected on SBN - State
btpairingApp.prototype._SbnPhoneConnectionStatusMsgHandler = function(msg)
{  
   
    if (msg && msg.params && msg.params.payload && msg.params.payload.SbnPhoneStatus === true)
    {
        log.debug("PhoneConnected SBN");
        framework.common.cancelTimedSbn(this.uiaId, "PhoneConnectionStatus", "deviceConnected");
        framework.common.startTimedSbn(this.uiaId, "PhoneConnectionStatus", "deviceConnected", {sbnStyle : "Style02", text1Id : "PhoneConnected", "imagePath1" : "common/images/icons/IcnSbBluetooth.png" }); // add/update a state SBN in the display queue 
    }
    else if(msg && msg.params && msg.params.payload && msg.params.payload.SbnPhoneStatus === false)
    {
        log.debug("PhoneDisconnected SBN");
        framework.common.cancelTimedSbn(this.uiaId, "PhoneConnectionStatus", "deviceConnected");
        framework.common.startTimedSbn(this.uiaId, "PhoneConnectionStatus", "deviceConnected" , {sbnStyle : "Style02", text1Id : "PhoneDisconnected", "imagePath1" : "common/images/icons/IcnSbBluetooth.png"}); // add/update a state SBN in the); // end state SBN in the display queue 
    }
};

// Display Phone Connected on SBN - State
btpairingApp.prototype._SbnAudioConnectionStatusMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload && msg.params.payload.SbnAudioStatus === true)
    {
        log.debug("AudioConnected SBN");
        framework.common.cancelTimedSbn (this.uiaId, "AudioConnectionStatus", "deviceConnected");
        framework.common.startTimedSbn(this.uiaId, "AudioConnectionStatus", "deviceConnected", {sbnStyle : "Style02", text1Id : "AudioConnected", "imagePath1" : "common/images/icons/IcnSbBluetooth.png" }); // add/update a state SBN in the display queue 
    }
    
    else if(msg && msg.params && msg.params.payload && msg.params.payload.SbnAudioStatus === false)
    {
        log.debug("AudioDisconnected SBN");
        framework.common.cancelTimedSbn (this.uiaId, "AudioConnectionStatus", "deviceConnected");
        framework.common.startTimedSbn(this.uiaId, "AudioConnectionStatus", "deviceConnected" , {sbnStyle : "Style02", text1Id : "AudioDisconnected", "imagePath1" : "common/images/icons/IcnSbBluetooth.png"}); // end state SBN in the display queue 
    }
};


// Display Pairing Success on SBN - State

btpairingApp.prototype._SbnPairingSuccessStatusMsgHandler = function(msg)

{

    if (msg && msg.params && msg.params.payload && msg.params.payload.SbnPairingStatus === true)

    {
        log.info("Satish - Pairing Success SBN");
        framework.common.startTimedSbn(this.uiaId, "PairingSuccessStatus", "deviceConnected", {sbnStyle : "Style02", text1Id : "PairingSuccess", "imagePath1" : "common/images/icons/IcnSbBluetooth.png"}); // add/update a state SBN in the display queue 

    }
    else
    {
        framework.common.startTimedSbn(this.uiaId, "PairingSuccessStatus", "deviceConnected", {sbnStyle : "Style02", text1Id : "PairingDevice", "imagePath1" : "common/images/icons/IcnSbBluetooth.png"}); // add/update a state SBN in the display queue 
    }
}; 

// BT Status And List
btpairingApp.prototype._BTStatusAndListMsgHandler = function(msg)
{

    log.debug("BTStatusAndList received" + msg);
    if(msg && msg.params && msg.params.payload && msg.params.payload.pairedDeviceList)
    {
        this._cachedBTStatusAndList = msg.params.payload.pairedDeviceList;
        this._displaySBNStatus();
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "BTConnectionManager")
            {
                this._populateListCtrl();
            }
       }
   }
};
// CurrentDeviceIdMsgHandler
btpairingApp.prototype._CurrentDisplayedDeviceMsgHandler = function(msg)
{
    log.debug("CurrentDisplayedDevice received", msg);
    if(msg && msg.params && msg.params.payload && msg.params.payload.CurrentDeviceId)
    {
        this._cachedCurrentDeviceId = msg.params.payload.CurrentDeviceId;
    }
};

// ConnectionTypeMsgHandler
btpairingApp.prototype._ConnectionTypeMsgHandler = function(msg)
{
    log.debug("ConnectionType received", msg);
    if(msg && msg.params && msg.params.payload && msg.params.payload.audiophoneconnect)
    {
        this._cachedAudioPhoneConnect = msg.params.payload.audiophoneconnect;

        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "ConnectionType")
            {
                if(this._cachedCurrentDeviceId == this._cachedAudioPhoneConnect.connectionDeviceId)
                this._populateConnectionType();
           }
        }
    }
};

// ConnectedProfile Message Handler
btpairingApp.prototype._ConnectedProfileMsgHandler = function(msg)
{ 
    log.debug("ConnectedProfile received", msg);
    if(msg && msg.params && msg.params.payload && msg.params.payload.audiophone)
    {
        this._cachedAudioPhone = msg.params.payload.audiophone;
        //this._displaySBNStatus();

        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "ConnectionType")
            {
                if(this._cachedCurrentDeviceId == this._cachedAudioPhoneConnect.connectionDeviceId)
                this._populateConnectedProfile();
            }
        }
    }
};

// Discoverable Message Handler
btpairingApp.prototype._ConnectMsgHandler = function(msg)
{
    log.debug("Discoverable received", msg);
    if(msg && msg.params && msg.params.payload && msg.params.payload.code)
    {
        this._cachedDiscoverable = msg.params.payload.code;

        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "Discoverable")
            {
                this._populateDiscoverable();
            }
        }
   }
};

// Discoverable Message Handler
btpairingApp.prototype._PairingFailedErrorCodeMsgHandler = function(msg)
{
    log.debug("PairingFailedErrorCodeMsgHandler received");
	if(msg && msg.params && msg.params.payload && msg.params.payload.errormessage)
    {
		if(this._ispairexiterror_populatedonce === false)
		{
			if(msg.params.payload.errormessage === "Invalid code entry")
			{
				this._cachedErrorMessage = "InvalidCodeEntry";
			}
			if(msg.params.payload.errormessage === "Time limit exceeded")
			{
				this._cachedErrorMessage = "TimeLimitExceeded";
			}
			if(msg.params.payload.errormessage === "Unknown error")
			{
				this._cachedErrorMessage = "UnknownError";
			}
			if(msg.params.payload.errormessage === "Vehicle speed exceeded")
			{
				this._cachedErrorMessage = "Vehiclespeed";
			}
		
			this._ispairexiterror_populatedonce = true;
		}
        if (this._currentContext && this._currentContextTemplate)
        {
			if (this._currentContext.ctxtId === "PairExitPopUp")
            {
				this._populateErrorMessage();
                log.debug("In handler _PairingFailedErrorCodeMsgHandler : this._ispairexiterror_populatedonce : "+ this._ispairexiterror_populatedonce);
            }
        }
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "ConnectFailed")
            {
                this._populateErrorMessage();
            }
        }
   }
};


// DeleteWhichDevice Message Handler
btpairingApp.prototype._DeleteWhichDeviceMsgHandler = function(msg)
{
    log.debug("DeleteWhichDevice received", msg);
    if(msg && msg.params && msg.params.payload && msg.params.payload.pairedDeviceList)
    {
        this._cachedDeleteWhichDevice = msg.params.payload.pairedDeviceList;

        if (this._currentContext && this._currentContextTemplate)

        {
            if (this._currentContext.ctxtId === "DeleteWhichDevice")
            {
                this._populateDeleteWhichDevice();
            }
        }
    }
};


btpairingApp.prototype._AtSpeedMsgHandler = function(msg)
{
    this._speedThreshold = true;
    if (this._currentContext && this._currentContextTemplate)
        {
            switch(this._currentContext.ctxtId)
            {
                case "BluetoothSettings":
                    this._populateBluetoothSettingsList();
                    break;
                case "BTConnectionManager":
                    this._BTConnectionManagerGreyOut();
                    //this._populateBTConnectionManagerList();
                    break;
                case "DeleteWhichDevice":
                    this._populateDeleteWhichDeviceList();
                    break;
                case "ConnectionType" :
                     this._populateConnectionTypeList(); 
                case "ChangePairCode" :
                     this._currentContextTemplate.dialPad2Ctrl.setAtSpeed(this._speedThreshold);
                     break;
                case "PairExitPopUp" : 
                    this._currentContextTemplate.dialog3Ctrl.setDisabled("button2", true);
                    break;
                case "ConfirmDelete" :
                    this._currentContextTemplate.dialog3Ctrl.setDisabled("button2", true);
                    break;
                case "DeleteFailed" :
                    this._currentContextTemplate.dialog3Ctrl.setDisabled("button2", true);
                    break;
                default:
                    break;
             }            
        } 
};
btpairingApp.prototype._NoSpeedMsgHandler = function(msg)
{
    this._speedThreshold = false;
    if (this._currentContext && this._currentContextTemplate)
        {
            switch(this._currentContext.ctxtId)
            {
                case "BluetoothSettings":
                    this._populateBluetoothSettingsList();
                    break;
                case "BTConnectionManager":
                    this._BTConnectionManagerGreyOut();
                    //this._populateBTConnectionManagerList();
                    break;
                case "DeleteWhichDevice":
                    this._populateDeleteWhichDeviceList();
                    break;
                case "ConnectionType" :
                     this._populateConnectionTypeList(); 
                case "ChangePairCode" :
                    this._currentContextTemplate.dialPad2Ctrl.setAtSpeed(this._speedThreshold);
                    break;
                case "PairExitPopUp" : 
                    this._currentContextTemplate.dialog3Ctrl.setDisabled("button2", false);
                    break;
                case "ConfirmDelete" :
                    this._currentContextTemplate.dialog3Ctrl.setDisabled("button2", false);
                    break;
                case "DeleteFailed" :
                    this._currentContextTemplate.dialog3Ctrl.setDisabled("button2", false);
                    break;
                default:
                    break;
            }            
        } 
};
// DeviceName Message Handler
btpairingApp.prototype._DeviceNameMsgHandler = function(msg)
{
    log.debug("DeviceName received", msg);
    if(msg && msg.params && msg.params.payload )
    {
        this._cachedDeviceName = msg.params.payload.deviceName;
    }
    
};

// PairDevice Message Handler
btpairingApp.prototype._PairDeviceMsgHandler = function(msg)
{
    log.debug("PairDevice received", msg);
    if(msg && msg.params && msg.params.payload && msg.params.payload.sixDigitCode.code)
    {
        var s = "000000" + msg.params.payload.sixDigitCode.code;
        this._cachedNumericConfirmSSP = s.substr(s.length-6);
        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "NumericConfirmSSP")
            {
                 this._populateNumericConfirmSSP();
            }
        }
    }
};

btpairingApp.prototype._ConnectMsgHandler = function(msg)
{
    log.debug("PairDevice received", msg);
    if(msg && msg.params && msg.params.payload && msg.params.payload.fourDigitCode.code)
    {
        var s = "0000" + msg.params.payload.fourDigitCode.code;
        this._cachedNumericConfirmLegacy = s.substr(s.length-4);

        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "NumericConfirmLegacy")
            {
                 this._populateNumericConfirmLegacy();
            }
        }
    }
};

//Partial Success Msg Handler
btpairingApp.prototype._PartialSuccessMsgHandler = function(msg)
{
    log.debug("PartialSuccess received", msg);
    if(msg && msg.params && msg.params.payload && msg.params.payload.PartialSuccessMsg)
    {
        this._cachedPartialSuccess = msg.params.payload.PartialSuccessMsg;

        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "PartialSuccess")
            {
                 this._populatePartialSuccess();
            }
        }
    }
};

// DeviceInfoMsgHandler
btpairingApp.prototype._DeviceInfoMsgHandler = function(msg)
{
    log.debug("Device Information received", msg);
            
    if(msg && msg.params && msg.params.payload && msg.params.payload.DeviceInfoMsg)
    {
        this._cachedDeviceInfo = msg.params.payload.DeviceInfoMsg;

        if (this._currentContext && this._currentContextTemplate)
        {
            if (this._currentContext.ctxtId === "BluetoothInformation")
            {
                 this._populateBluetoothInformation();
            }
        }
    }
};

/**************************
 * Control callbacks
 **************************/

// DialPad Control callback
btpairingApp.prototype._dialPadHandler = function(ctrlObj,appData, params)
{
    switch (params.btnSelected)
    {
        case "OK":
            framework.sendEventToMmui(this.uiaId, "ChangePairCodeYes", {payload:{input: params.input}});
            break;
        case "Cancel":
            framework.sendEventToMmui("Common", "Global.Cancel");
            break;
    }
};
 
btpairingApp.prototype._InputValueMsgHandler = function (msg)
{
    if (this._currentContext && this._currentContextTemplate)
    {
        this._currentContextTemplate.dialPadCtrl.setInputValue(msg.params.payload.value);
    }
};

// Discoverable Count Down callback
btpairingApp.prototype._DiscoverableCountDownCallback = function()
{
    log.debug("btpairingApp _DiscoverableCountDownCallback called...");
    this._discoverableTimeout--;

    if (this._discoverableTimeout <= 0)
    {
        clearInterval(this._discoverableTimer);
        this._discoverableTimer = null;
    }

    if (this._currentContext && this._currentContextTemplate)
    {
        if (this._currentContext.ctxtId === "Discoverable")
        {
            var text2Id = this._contextTable.Discoverable.controlProperties.Dialog3Ctrl.text3Id;
            var subMap = {"discoverableTimeout" : this._discoverableTimeout};
            this._currentContextTemplate.dialog3Ctrl.setText3Id(text2Id,subMap);
        }
    }
};

// List Control
btpairingApp.prototype._listItemClickCallback = function(listCtrlObj, appData, params)
{
    log.debug("btpairingApp _listItemClickCallback called...");
    log.debug("   for context" + this._currentContext.ctxtId);
    
    var itemIndex = params.itemIndex;
    var buttonClicked = params.additionalData;
    var currList = this._currentContextTemplate.list2Ctrl;
    var currCtxtId = this._currentContext.ctxtId;
    //var status = "off";
	var status = 0;
    if(this._cachedBTStatusAndList != null)
    {
        status = this._cachedBTStatusAndList.status;
    }
    
    
    switch (this._currentContext.ctxtId)
    {
        case "BTConnectionManager" :
            switch (appData.name)
            {
                case "Bluetooth" :
                    var currStatus = parseInt(buttonClicked);
                    var prevStatus ;
                    //if(status === "on" )
					if(status === 1 )
                    {
                        prevStatus = 1;
                    }
                    else
                    {
                        prevStatus = 2;
                    }
                    
                    if(currStatus == prevStatus)
                    {
                        
                    }
                    
                    else
                    {
                     
                    if (currStatus == 1)
                    {
                        this.changeInderminateStyle();
                        this._bluetoothOffSent = false;
                        framework.sendEventToMmui(this.uiaId, "ToggleBluetoothOn");
                    }
                    else if (currStatus == 2)
                    {
                        this.changeInderminateStyle();
                        this._bluetoothOffSent = true;
                        framework.sendEventToMmui(this.uiaId, "ToggleBluetoothOff");
                    }
                    else
                    {
                        log.debud("No value has been sent");
                    }
              }
                    break;
                case "AddNewDevice" :
                case "SelectBluetoothSettings"    :
                    framework.sendEventToMmui(this.uiaId, appData.name);
                    break;
                case "SelectDevice" :
                    var deviceLabel = this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData.deviceName;
                    framework.sendEventToMmui(this.uiaId, appData.name , {payload:{deviceName: deviceLabel}});
                    break;
                default:
                    log.warn("btpairingApp: Unknown Appdata", appData);
                    break;

            }
            break;

        case "BluetoothSettings" :   
           switch(appData)
            {
                case "SelectBluetoothInfo" :
                case "ChangePairCode" :
                case "RemoveDevice" :
                    framework.sendEventToMmui(this.uiaId, appData);
                    break;
                default:
                    log.warn("btpairingApp: Unknown Appdata", appData);
                    break;
            }
            break;
        case "DeleteWhichDevice" :
            switch (appData.itemData)
            {
                case "SelectDevice" :
                    var name = this._currentContextTemplate.list2Ctrl.dataList.items[itemIndex].appData.deviceNameLabel;
                    framework.sendEventToMmui(this.uiaId, appData.itemData , {payload:{deviceName: name}});
                    break;
                case "SelectAllDevices" :
                    framework.sendEventToMmui(this.uiaId, appData.itemData);
                    break;
                default:
                    log.warn("btpairingApp: Unknown Appdata", appData);
                    break;
            }
            break;

        case "ConnectionType" :
            switch (appData)
            {
                case "SelectPhoneAndAudio" :
                case "SelectPhoneOnly" :
                case "SelectAudioOnly" :
                    framework.sendEventToMmui(this.uiaId, appData);
                    if (!currList.dataList.items[params.itemIndex].checked)
                    {
                    // check radio
                        currList.setRadio(params.itemIndex, true);
                    }
                    break;
                case "SelectDisconnect" :                
                    framework.sendEventToMmui(this.uiaId, appData);
                    break;
                case "RemovePairedDevice" :
                    framework.sendEventToMmui(this.uiaId, appData, {payload:{deviceName: this._cachedDeviceName }});
                    break;
                default:
                    log.warn("btpairingApp: Unknown Appdata", appData);
                    break;
            }
            break;
        default:
            log.warn("btpairingApp: Unknown context", this._currentContext.ctxtId);
            break;
    }
}

// EOF: List Control

// Dialog Control
btpairingApp.prototype._dialogCtrlClickCallback = function(dialogBtnCtrlObj, appData, extraParams)
{
    log.debug("btpairingApp _dialogCtrlClickCallback called...");
    log.debug("   for context" + this._currentContext.ctxtId);
    log.debug("   appData: " + appData);

    switch (this._currentContext.ctxtId)
    {
        case "Discoverable" :
            switch (appData)
            {
                case "Global.Cancel" :
                    framework.sendEventToMmui("Common", appData);
                    clearInterval(this._discoverableTimer);
                    this._discoverableTimer = null;
                    break;
                default:
                    log.warn("btpairingApp: Unknown Appdata", appData);
                    break;
            }
            break;

        case "NumericConfirmSSP" :
            switch (appData)
            {
                case "Global.Cancel" :
                    framework.sendEventToMmui("Common", appData);
                    break;
                case "Global.Yes" :
                    framework.sendEventToMmui("Common", appData);
                    break;
                case "Global.No" :
                    framework.sendEventToMmui("Common", appData);
                    break;
                default:
                    log.warn("btpairingApp: Unknown Appdata", appData);
                    break;
            }
            clearTimeout(this._timeout);
            break;
            
        case "NumericConfirmLegacy" :
            switch (appData)
            {
                case "Global.Cancel" :
                    framework.sendEventToMmui("Common", appData);
                    break;
                default:
                    log.warn("btpairingApp: Unknown Appdata", appData);
                    break;
            }
            clearTimeout(this._timeout);
            break;

        case "DisconnectFailed":
        case "NoPairDisconnectFail":
        case "PairExitPopUp":
        case "ConnectFailed":
        case "DeleteFailed":        
            switch (appData)
            {
                case "Global.GoBack":
                    framework.sendEventToMmui("Common", appData);
                    break;
                case "SelectRetry":
                    framework.sendEventToMmui(this.uiaId, appData);
                    break;
                default:
                    log.warn("btpairingApp: Unknown Appdata", appData);
                    break;
            }
            break;
		case "DeleteiOS" :
        case "BluetoothInformation" :
        case "PartialSuccess":
            switch (appData)
            {
                case "Global.Yes":
                    log.warn("btpairingAppBluetoothinformation: Unknown Appdata", appData);
                    framework.sendEventToMmui("Common", appData);
                    break;
                default:
                    log.warn("btpairingApp: Unknown Appdata", appData);
                    break;
            }
            break;  
        case "Mobile911Enable":
        case "ConfirmDelete":
        case "DisconnectingToPair" :
        case "MaxDevices":
            framework.sendEventToMmui("Common", appData);
            break;
        case "PairExitPopUp":
             break;
        
        default:
            log.warn("btpairingApp: Unknown context", this._currentContext.ctxtId);
            break;
    }
}
// EOF: Dialog Control


/**************************
 * Helper functions
 **************************/

// Populate DeleteWhichDevice Control
btpairingApp.prototype._populateDeleteWhichDevice = function()
{
    log.debug("btpairingApp _populateDeleteWhichDevice called...");
    var dataListItems = new Array();
    var deviceCount = 0;
    
    for (var i = 0; i < this._cachedDeleteWhichDevice.listItem.length; i++)
    {
        if (this._cachedDeleteWhichDevice.listItem[i].itemLabel === "")
        {
             continue;
        }
        deviceCount++;
        
        var itemLabel  = this._cachedDeleteWhichDevice.listItem[i].itemLabel;

        dataListItems.push(
            {appData : {itemData : "SelectDevice" , deviceNameLabel :itemLabel} , text1 : itemLabel, itemStyle : "style01", image1 : "./apps/btpairing/images/IcnListRemoveItem.gif" , indented:true }
          )
    }
    
    if(deviceCount == 0)
    {
        dataListItems.push(
        { appData : {itemData :"SelectAllDevices"}, text1Id : "RemoveDevice", disabled : true, itemStyle : "style01", image1 : "./apps/btpairing/images/IcnListRemoveItem.gif" }
        )
    }
    else
    {
        dataListItems.push(
        { appData : {itemData :"SelectAllDevices"}, text1Id : "RemoveDevice", itemStyle : "style01", image1 : "./apps/btpairing/images/IcnListRemoveItem.gif" }
        )
    }

    this._deleteWhichDeviceCtxtDataList = {
        itemCountKnown : true, 
        itemCount :dataListItems.length, 
        items : dataListItems 
        };

    this._currentContextTemplate.list2Ctrl.setDataList(this._deleteWhichDeviceCtxtDataList);
    this._currentContextTemplate.list2Ctrl.updateItems(0, this._deleteWhichDeviceCtxtDataList.itemCount - 1);
}

// Populate Discoverable Dialog
btpairingApp.prototype._populateDiscoverable = function()
{
    log.debug("btpairingApp _populateDiscoverable called...");
    this._currentContextTemplate.dialog3Ctrl.setText3(this._cachedDiscoverable);
}

// Populate Numeric Confirm SSP Dialog
btpairingApp.prototype._populateNumericConfirmSSP = function()
{
    log.debug("btpairingApp _populateNumericConfirmSSP called...");
    this._currentContextTemplate.dialog3Ctrl.setText2(this._cachedNumericConfirmSSP);
}

// Populate Numeric Confirm Legacy Dialog
btpairingApp.prototype._populateNumericConfirmLegacy = function()
{
    log.debug("btpairingApp _populateNumericConfirmLegacy called...");
    this._currentContextTemplate.dialog3Ctrl.setText2(this._cachedNumericConfirmLegacy);
}

// Populate Pair Exit Pop Up Dialog
btpairingApp.prototype._populateErrorMessage = function()
{
    log.debug("btpairingApp _populateErrorMessage called...");
    this._currentContextTemplate.dialog3Ctrl.setText2Id(this._cachedErrorMessage);
}

// Populate Partial Success Ctrl
btpairingApp.prototype._populatePartialSuccess = function()
{
    var subMap = {"partialDeviceName" : this._cachedPartialSuccess.deviceName};
    log.debug("btpairingApp _populatePartialSuccess called...");
    if(this._cachedPartialSuccess.deviceName != null)
    {
        if(this._cachedPartialSuccess.audioConnected)
        {
            var text1Id = "PartialSuccessAudio";
            this._currentContextTemplate.dialog3Ctrl.setText1Id(text1Id,subMap);
        }

        else if(this._cachedPartialSuccess.phoneConnected)
        {
            var text1Id = "PartialSuccessPhone";
            this._currentContextTemplate.dialog3Ctrl.setText1Id(text1Id,subMap);
        }
    }
}

// Populate Bluetooth Information
btpairingApp.prototype._populateBluetoothInformation = function()
{
    log.debug("btpairingApp _populateBluetoothInformation called...");
    if(this._cachedDeviceInfo.deviceName && this._cachedDeviceInfo.deviceAddr != null)
    {
        this._currentContextTemplate.dialog3Ctrl.setText2(this._cachedDeviceInfo.deviceName);
        this._currentContextTemplate.dialog3Ctrl.setText3(this._cachedDeviceInfo.deviceAddr);
    }
}
 
// Populate Device Name Ctrl
btpairingApp.prototype._populateDeviceName = function()
{
    var subMap = {"deviceName" : this._cachedDeviceName};
    
    log.debug("btpairingApp _populateConnectSuccessCtrl called...");
    switch (this._currentContext.ctxtId)
        {
            case "ConnectSuccess" : 
                var text1Id = this._contextTable.ConnectSuccess.controlProperties.Dialog3Ctrl.text1Id;
                this._currentContextTemplate.dialog3Ctrl.setText1Id(text1Id, subMap);
                break;
            case "DisconnectSuccess" : 
                var text1Id = this._contextTable.DisconnectSuccess.controlProperties.Dialog3Ctrl.text1Id;
                this._currentContextTemplate.dialog3Ctrl.setText1Id(text1Id, subMap);
                break;
            case "PartialSuccess" : 
                var text1Id = this._contextTable.PartialSuccess.controlProperties.Dialog3Ctrl.text1Id;
                this._currentContextTemplate.dialog3Ctrl.setText1Id(text1Id, subMap);
                break;
            case "ConnectFailed" : 
                var text1Id = this._contextTable.ConnectFailed.controlProperties.Dialog3Ctrl.text1Id;
                this._currentContextTemplate.dialog3Ctrl.setText1Id(text1Id, subMap);
                break;
            case "DisconnectSuccess" : 
                var text1Id = this._contextTable.DisconnectSuccess.controlProperties.Dialog3Ctrl.text1Id;
                this._currentContextTemplate.dialog3Ctrl.setText1Id(text1Id, subMap);
                break;
            case "DeleteComplete" : 
                if(this._cachedDeviceName == "")
                {
                    deleteComplete = "allDevices";
                    this._currentContextTemplate.dialog3Ctrl.setText1Id(deleteComplete);
                }
                else
                {
                    var text1Id = "DeleteComplete";
                    this._currentContextTemplate.dialog3Ctrl.setText1Id(text1Id, subMap);
                }
                break;
            case "PairSuccess" : 
                var text1Id = this._contextTable.PairSuccess.controlProperties.Dialog3Ctrl.text1Id;
                this._currentContextTemplate.dialog3Ctrl.setText1Id(text1Id, subMap);
                break;
            case "DisconnectFailed" : 
                var text1Id = this._contextTable.DisconnectFailed.controlProperties.Dialog3Ctrl.text1Id;
                this._currentContextTemplate.dialog3Ctrl.setText1Id(text1Id, subMap);
                break;
            case "ConfirmDelete" : 
                if(this._cachedDeviceName == "")
                {
                   confirmdelete = "All";
                   this._currentContextTemplate.dialog3Ctrl.setText1Id(confirmdelete);
                }
                else
                {
                    var text1Id = "ConfirmDelete";
                    this._currentContextTemplate.dialog3Ctrl.setText1Id(text1Id, subMap);
                }
                break;
            case "DisconnectFailed" : 
                var text1Id = this._contextTable.DisconnectFailed.controlProperties.Dialog3Ctrl.text1Id;
                this._currentContextTemplate.dialog3Ctrl.setText1Id(text1Id, subMap);
                break;
            case "DeleteFailed" : 
                if(this._cachedDeviceName == "")
                {
                   deleteFailed = "UnableToRemove";
                   this._currentContextTemplate.dialog3Ctrl.setText1Id(deleteFailed);
                }
                else
                {
                    var text1Id = "DeleteFailed";
                    this._currentContextTemplate.dialog3Ctrl.setText1Id(text1Id, subMap);
                }
                break;
            case "NoPairDisconnectFail" : 
                var text1Id = this._contextTable.NoPairDisconnectFail.controlProperties.Dialog3Ctrl.text1Id;
                this._currentContextTemplate.dialog3Ctrl.setText1Id(text1Id, subMap);
                break;
            case "DisconnectingToPair" : 
                var text1Id = this._contextTable.DisconnectingToPair.controlProperties.Dialog3Ctrl.text1Id;
                this._currentContextTemplate.dialog3Ctrl.setText1Id(text1Id, subMap);
                break;
            case "ConnectingDevice" : 
                var text1Id = this._contextTable.ConnectingDevice.controlProperties.Dialog3Ctrl.text1Id;
                this._currentContextTemplate.dialog3Ctrl.setText1Id(text1Id, subMap);
                break;
            case "DisconnectingDevice" : 
                var text1Id = this._contextTable.DisconnectingDevice.controlProperties.Dialog3Ctrl.text1Id;
                this._currentContextTemplate.dialog3Ctrl.setText1Id(text1Id, subMap);
                break;
            case "ConnectionType" : 
                 subMap = {"DeviceName" : this._cachedDeviceName};
                 var title_structure = 
                 {
                    titleStyle : 'style02',
                    text1Id : "ConnectoinTypeTitle",
                    text1SubMap : subMap
                 }
                 this._currentContextTemplate.list2Ctrl.setTitle(title_structure);
                 break;
            default:
                log.warn("btpairingApp: Unknown context", this._currentContext.ctxtId);
                break;
    } 
}

// ConnectionType Ctrl
btpairingApp.prototype._populateConnectionType = function()
{
        var dataListItems = new Array();
      
         if(this._cachedAudioPhoneConnect.connected)
         {
            if (this._cachedAudioPhoneConnect.phoneSupported && this._cachedAudioPhoneConnect.audioSupported)
            {
                var dataListItems = [
                { appData : "SelectPhoneAndAudio", text1Id : "PhoneAndAudio", radio : true,itemStyle : "style03" ,image1:"radio" , image2: "common/images/icons/IcnListBtConnType_Phone.png" , image3:"common/images/icons/IcnListBtConnType_Music.png" , hasCaret : false  },
                { appData : "SelectPhoneOnly", text1Id : "PhoneOnly", radio : true,  itemStyle : "style03"  ,image1:"radio" ,  image2: "common/images/icons/IcnListBtConnType_Phone.png" , hasCaret : false},
                { appData : "SelectAudioOnly", text1Id : "AudioOnly", radio : true, itemStyle : "style03"  ,image1:"radio" ,  image2: "common/images/icons/IcnListBtConnType_Music.png" , hasCaret : false },
                { appData : "SelectDisconnect", text1Id : "Disconnect", itemStyle : "style03" , hasCaret : false },
                { appData : "RemovePairedDevice", text1Id : "RemovePairDevice", itemStyle : "style03" , hasCaret : false }
                ];
            }
            else if (this._cachedAudioPhoneConnect.phoneSupported)
            {
                var dataListItems = [
                { appData : "SelectPhoneAndAudio", text1Id : "PhoneAndAudio", itemStyle : "style03" , disabled : true , image1:"radio"},
                { appData : "SelectPhoneOnly", text1Id : "PhoneOnly", itemStyle : "style03"  , image1:"radio" , image2: "common/images/icons/IcnListBtConnType_Phone.png" , hasCaret : false },
                { appData : "SelectAudioOnly", text1Id : "AudioOnly", itemStyle : "style03"  , image1:"radio" , image2: "common/images/icons/IcnListBtConnType_Music.png" , hasCaret : false , disabled : true},
                { appData : "SelectDisconnect", text1Id : "Disconnect", itemStyle : "style03" , hasCaret : false },
                { appData : "RemovePairedDevice", text1Id : "RemovePairDevice", itemStyle : "style03" , hasCaret : false }
                ];
            }
            else if (this._cachedAudioPhoneConnect.audioSupported)
            {
                var dataListItems = [
                { appData : "SelectPhoneAndAudio", text1Id : "PhoneAndAudio",  itemStyle : "style03" , image1:"radio" , image2: "common/images/icons/IcnListBtConnType_Phone.png" , image3:"common/images/icons/IcnListBtConnType_Music.png" , hasCaret : false,disabled : true},
                { appData : "SelectPhoneOnly", text1Id : "PhoneOnly",  itemStyle : "style03"  ,image1:"radio" ,  image2: "common/images/icons/IcnListBtConnType_Phone.png" , hasCaret : false , disabled : true},
                { appData : "SelectAudioOnly", text1Id : "AudioOnly",  itemStyle : "style03"  , image1:"radio" , image2: "common/images/icons/IcnListBtConnType_Music.png" , hasCaret : false },
                { appData : "SelectDisconnect", text1Id : "Disconnect", itemStyle : "style03" , hasCaret : false },
                { appData : "RemovePairedDevice", text1Id : "RemovePairDevice", itemStyle : "style03" , hasCaret : false}
                ];
            }

        this._connectionTypeCtxtDataList = { itemCountKnown : true, itemCount : dataListItems.length, items : dataListItems };

        }
        else
        {
            if (this._cachedAudioPhoneConnect.phoneSupported && this._cachedAudioPhoneConnect.audioSupported)
            {
                var dataListItems = [
                { appData : "SelectPhoneAndAudio", text1Id : "PhoneAndAudio",  itemStyle : "style03" ,image1:"radio" , image2: "common/images/icons/IcnListBtConnType_Phone.png" , image3:"common/images/icons/IcnListBtConnType_Music.png" , hasCaret : false  },
                { appData : "SelectPhoneOnly", text1Id : "PhoneOnly",   itemStyle : "style03"  , image1:"radio" , image2: "common/images/icons/IcnListBtConnType_Phone.png" , hasCaret : false  },
                { appData : "SelectAudioOnly", text1Id : "AudioOnly",  itemStyle : "style03"  , image1:"radio" , image2: "common/images/icons/IcnListBtConnType_Music.png" , hasCaret : false },
                { appData : "SelectDisconnect", text1Id : "Disconnect", itemStyle : "style03"  ,disabled : true , hasCaret : false},
                { appData : "RemovePairedDevice", text1Id : "RemovePairDevice", itemStyle : "style03" , hasCaret : false }
                ];
            }
            else if (this._cachedAudioPhoneConnect.phoneSupported)
            {  
                var dataListItems = [
                { appData : "SelectPhoneAndAudio", text1Id : "PhoneAndAudio",  itemStyle : "style03" ,image1:"radio" , image2: "common/images/icons/IcnListBtConnType_Phone.png" , image3:"common/images/icons/IcnListBtConnType_Music.png" , hasCaret : false ,disabled : true },
                { appData : "SelectPhoneOnly", text1Id : "PhoneOnly",  itemStyle : "style03"  , image1:"radio" , image2: "common/images/icons/IcnListBtConnType_Phone.png" , hasCaret : false },
                { appData : "SelectAudioOnly", text1Id : "AudioOnly",  itemStyle : "style03"  , image1:"radio" , image2: "common/images/icons/IcnListBtConnType_Music.png" , hasCaret : false,disabled : true },
                { appData : "SelectDisconnect", text1Id : "Disconnect", itemStyle : "style03"  ,disabled : true, hasCaret : false},
                { appData : "RemovePairedDevice", text1Id : "RemovePairDevice", itemStyle : "style03" , hasCaret : false }
                ];
            }
            else if (this._cachedAudioPhoneConnect.audioSupported)
            {   
                var dataListItems = [
                { appData : "SelectPhoneAndAudio", text1Id : "PhoneAndAudio", radio : true, itemStyle : "style03" ,image1:"radio" , image2: "common/images/icons/IcnListBtConnType_Phone.png" , image3:"common/images/icons/IcnListBtConnType_Music.png" , hasCaret : false ,disabled : true },
                { appData : "SelectPhoneOnly", text1Id : "PhoneOnly", radio : true,  itemStyle : "style03"  , image1:"radio" , image2: "common/images/icons/IcnListBtConnType_Phone.png" , hasCaret : false, disabled : true },
                { appData : "SelectAudioOnly", text1Id : "AudioOnly", radio : true, itemStyle : "style03"  , image1:"radio" , image2: "common/images/icons/IcnListBtConnType_Music.png" , hasCaret : false , },
                { appData : "SelectDisconnect", text1Id : "Disconnect", itemStyle : "style03"  ,disabled : true , hasCaret : false},
                { appData : "RemovePairedDevice", text1Id : "RemovePairDevice", itemStyle : "style03" , hasCaret : false }
                ];
            }
            else
            {
               var dataListItems = [

                { appData : "SelectPhoneAndAudio", text1Id : "PhoneAndAudio", radio : true, itemStyle : "style03" ,image1:"radio" , image2: "common/images/icons/IcnListBtConnType_Phone.png" , image3:"common/images/icons/IcnListBtConnType_Music.png" , hasCaret : false ,disabled : true },
                { appData : "SelectPhoneOnly", text1Id : "PhoneOnly", radio : true,  itemStyle : "style03"  , image1:"radio" , image2: "common/images/icons/IcnListBtConnType_Phone.png" , hasCaret : false, disabled : true },
                { appData : "SelectAudioOnly", text1Id : "AudioOnly", radio : true, itemStyle : "style03"  , image1:"radio" , image2: "common/images/icons/IcnListBtConnType_Music.png" , hasCaret : false  ,disabled : true },
                { appData : "SelectDisconnect", text1Id : "Disconnect", itemStyle : "style03"  ,disabled : true , hasCaret : false},
                { appData : "RemovePairedDevice", text1Id : "RemovePairDevice", itemStyle : "style03" , hasCaret : false }
                ];
             
            }
            this._connectionTypeCtxtDataList = { itemCountKnown : true, itemCount : dataListItems.length, items : dataListItems };
     }
     if(this._speedThreshold)
     {
          this._connectionTypeCtxtDataList.items[4].disabled = true;
     }
     else
     {
         this._connectionTypeCtxtDataList.items[4].disabled = false;
     }
        this._contextTable.ConnectionType.controlProperties.List2Ctrl.dataList = this._connectionTypeCtxtDataList;
        this._currentContextTemplate.list2Ctrl.setDataList(this._connectionTypeCtxtDataList);
        this._currentContextTemplate.list2Ctrl.updateItems(0, this._connectionTypeCtxtDataList.itemCount - 1);
       
  
}

btpairingApp.prototype._populateConnectedProfile = function()
{
    if(this._cachedAudioPhoneConnect.connected)
    {
       
        log.debug(" value is " , + this._cachedAudioPhoneConnect.phoneSupported , +  this._cachedAudioPhoneConnect.audioSupported );
        if (this._cachedAudioPhoneConnect.phoneSupported && this._cachedAudioPhoneConnect.audioSupported)
        { 
           
            if(this._cachedAudioPhone.audio && this._cachedAudioPhone.phone)
            {
               
                // Phone and Audio is connected so select index 0
                this._currentContextTemplate.list2Ctrl.setRadio(0,true);
            }
            else if(this._cachedAudioPhone.phone)
            {
                // Only Phone is connected so select index 1
                this._currentContextTemplate.list2Ctrl.setRadio(1, true);
            }
            else if(this._cachedAudioPhone.audio)
            {
                // Only Audio is connected so select index 2
                this._currentContextTemplate.list2Ctrl.setRadio(2 ,true);
            }
        }
        else if (this._cachedAudioPhoneConnect.phoneSupported)
        {
            
            if(this._cachedAudioPhone.phone)
            {
                
                // Only Phone is supported and Phone is connected
                this._currentContextTemplate.list2Ctrl.setRadio(1, true);
            }
        }
        else if (this._cachedAudioPhoneConnect.audioSupported)
        {  
            if(this._cachedAudioPhone.audio)
            {  
                // Only audio is supported and audio is connected.
                this._currentContextTemplate.list2Ctrl.setRadio(2,true);

            }
        }
    }
}

btpairingApp.prototype._populateBluetoothSettingsList = function()
{
    var dataList = null;
    var listLength = 0;
    var ctxtId = this._currentContext.ctxtId;    
    if(this._speedThreshold)
    {   
        this._bluetoothSettingsCtxtDataList.items[1].disabled = true;
        this._bluetoothSettingsCtxtDataList.items[2].disabled = true;  
        listLength = this._bluetoothSettingsCtxtDataList.itemCount - 1;
        dataList = this._bluetoothSettingsCtxtDataList;                 
    }
    else
    {
        this._bluetoothSettingsCtxtDataList.items[1].disabled = false;
		if(this._deviceListCount == 0)
		{
			this._bluetoothSettingsCtxtDataList.items[2].disabled = true;
		}
		else
		{
			this._bluetoothSettingsCtxtDataList.items[2].disabled = false;
		}         
        listLength = this._bluetoothSettingsCtxtDataList.itemCount - 1;
        dataList = this._bluetoothSettingsCtxtDataList;   
    }
    this._currentContextTemplate.list2Ctrl.setDataList(dataList);
    this._currentContextTemplate.list2Ctrl.updateItems(0, listLength);        
}

btpairingApp.prototype._populateConnectionTypeList = function()
{
    var dataList = null;
    var listLength = 0;
    var ctxtId = this._currentContext.ctxtId;    
    if(this._speedThreshold)
    {
        this._connectionTypeCtxtDataList.items[4].disabled = true; 
        listLength = this._connectionTypeCtxtDataList.itemCount - 1;
        dataList = this._connectionTypeCtxtDataList;                 
    }
    else
    {
        this._connectionTypeCtxtDataList.items[4].disabled = false;  
        listLength = this._connectionTypeCtxtDataList.itemCount - 1;
        dataList = this._connectionTypeCtxtDataList;   
    }
    this._currentContextTemplate.list2Ctrl.setDataList(dataList);
    this._currentContextTemplate.list2Ctrl.updateItems(0, listLength);        
}

btpairingApp.prototype._populateBTConnectionManagerList = function()
{
    this._populateListCtrl();  
}

btpairingApp.prototype._populateDeleteWhichDeviceList = function()
{
    if(this._speedThreshold)
    {           
        for (var i = 0; i < this._deleteWhichDeviceCtxtDataList.items.length; i++)
        {                
            this._deleteWhichDeviceCtxtDataList.items[i].disabled = true;                    
        }
        listLength = this._deleteWhichDeviceCtxtDataList.itemCount - 1;
        dataList = this._deleteWhichDeviceCtxtDataList;
        
    }
    else
    {
        for (var i = 0; i < this._deleteWhichDeviceCtxtDataList.items.length; i++)
        {
             this._deleteWhichDeviceCtxtDataList.items[i].disabled = false;                    
        }
        listLength = this._deleteWhichDeviceCtxtDataList.itemCount - 1;
        dataList = this._deleteWhichDeviceCtxtDataList;
                       
    }        
    this._currentContextTemplate.list2Ctrl.setDataList(dataList);
    this._currentContextTemplate.list2Ctrl.updateItems(0, listLength);    
}


// Update List items
btpairingApp.prototype._populateListCtrl = function(itemIndex)
{
    var listLength = 0;
    var ctxtId = this._currentContext.ctxtId;
    switch(ctxtId)
    {
        
        case "BTConnectionManager" :
                
                if(this._bluetoothOffSent == true)
                {
                    //if (this._cachedBTStatusAndList.status === "on")
					if (this._cachedBTStatusAndList.status === 1)
                    {
                        log.debug("BTStatusAndList is on...")  
                    }
                    else
                    {
                        this._bluetoothOffSent = false; 
                    }
                }
                
                if(this._bluetoothOffSent == false)
                {
                    //if (this._cachedBTStatusAndList.status === "on")
					if (this._cachedBTStatusAndList.status === 1)
                    {
                        if(this._speedThreshold)//if speed is more then disable the buttons
                        { 
                            var dataListItems = [
                            // Bluetooth On/Off button
                            { appData : {name: "Bluetooth"} , text1Id : "Bluetooth", itemStyle : "styleOnOff", value : 1 , hasCaret : false, disabled : true },
                            { appData : {name: "SelectBluetoothSettings"}, text1Id : "Settings", itemStyle : "style02" , hasCaret : false, disabled : true },
                            { appData : {name: "AddNewDevice"}, text1Id : "AddNewDevice",itemStyle : "style02" , hasCaret : false , disabled : true }
                            ];
                        }
                        else
                        {
                            var dataListItems = [
                            // Bluetooth On/Off button
                            { appData : {name: "Bluetooth"} , text1Id : "Bluetooth", itemStyle : "styleOnOff", value : 1 , hasCaret : false },
                            { appData : {name: "SelectBluetoothSettings"}, text1Id : "Settings", itemStyle : "style02" , hasCaret : false },
                            { appData : {name: "AddNewDevice"}, text1Id : "AddNewDevice",itemStyle : "style02" , hasCaret : false }
                            ];
                        }
                        this._deviceListCount = 0;
                        for (var i = 0; i < this._cachedBTStatusAndList.listItem.length; i++)
                        {
                            if (this._cachedBTStatusAndList.listItem[i].itemLabel === "")
                            {
                                continue;
                            } 
                            this._deviceListCount++;
                            var deviceNameLabel = this._cachedBTStatusAndList.listItem[i].itemLabel;
                            var deviceStatusLabel = this._cachedBTStatusAndList.listItem[i].status;
                            var deviceConnectionLabel = this._cachedBTStatusAndList.listItem[i].connect_disconnect_Success;

                            //if(deviceStatusLabel === "Connected")
							if(deviceStatusLabel === 1)
                            {
                                if(deviceConnectionLabel == 1)
                                {
                                    dataListItems.push(
                                    { appData : {name: "SelectDevice", deviceName: deviceNameLabel}, text1 : deviceNameLabel , text2 : deviceStatusLabel , itemStyle : "style03" , image2:"common/images/icons/IcnListBtConnType_Phone.png" , image1:"tick" , checked : true , indented:true}
                                    );
                                }
                            
                                else if (deviceConnectionLabel== 2)
                                { 
                                    dataListItems.push(
                                    { appData : {name: "SelectDevice", deviceName: deviceNameLabel}, text1 : deviceNameLabel , text2 : deviceStatusLabel , itemStyle : "style03" , image2:"common/images/icons/IcnListBtConnType_Music.png"  , image1:"tick" , checked : true , indented:true}
                                    );
                                }
                                else 
                                { 
                                    dataListItems.push(
                                    { appData : {name: "SelectDevice", deviceName: deviceNameLabel}, text1 : deviceNameLabel , text2 : deviceStatusLabel , itemStyle : "style03" , image2:"common/images/icons/IcnListBtConnType_Phone.png" , image3:"common/images/icons/IcnListBtConnType_Music.png"  , image1:"tick" , checked : true , indented:true}
                                    );
                                }
                            }
                            else
                            {
                                dataListItems.push(
                                { appData : {name: "SelectDevice", deviceName: deviceNameLabel}, text1 : deviceNameLabel , text2 : deviceStatusLabel , itemStyle : "style03" , indented:true}
                                );
                            }
                        }
                     
                        dataList =
                        { itemCountKnown : true, itemCount : dataListItems.length, items : dataListItems };
                    }
                    else
                    {
                        if(this._speedThreshold)//if speed is more then disable the buttons
                        {
                            var dataListItems = [
                            // Bluetooth On/Off button
                            { appData : {name: "Bluetooth"} , text1Id : "Bluetooth", itemStyle : "styleOnOff", value : 2 , hasCaret : false ,disabled : true},
                            { appData : {name: "SelectBluetoothSettings"}, text1Id : "Settings", itemStyle : "style02" , hasCaret : false, disabled : true },
                            { appData : {name: "AddNewDevice"}, text1Id : "AddNewDevice",itemStyle : "style02" , hasCaret : false , disabled : true }
                            ];
                        }
                        else
                        {
                           this._deviceListCount = 0;
                           var dataListItems = [
                           { appData : {name: "Bluetooth"}, text1Id : "Bluetooth", itemStyle : "styleOnOff", value : 2 , hasCaret : false },
                           { appData : {name: "SelectBluetoothSettings"}, text1Id : "Settings", itemStyle : "style02" , hasCaret : false },
                           { appData : {name: "AddNewDevice"}, text1Id : "AddNewDevice", disabled : true, itemStyle : "style02" , hasCaret : false   }
                           ];
                        }
    
                      dataList =
                      { itemCountKnown : true, itemCount : dataListItems.length, items : dataListItems };
                   }
                   listLength = dataList.itemCount - 1;
                   var currentFocusItem = this._currentContextTemplate.list2Ctrl.focussedItem;
                   this._currentContextTemplate.list2Ctrl.setDataList(dataList);
                   this._currentContextTemplate.list2Ctrl.updateItems(0, listLength);
                   this._currentContextTemplate.list2Ctrl.focussedItem = currentFocusItem; 
                   }
               break;            
        case "BluetoothSettings" :
            if(this._deviceListCount == 0)
            {
                this._bluetoothSettingsCtxtDataList.items[2].disabled = true;  
                listLength = this._bluetoothSettingsCtxtDataList.itemCount - 1;
                dataList = this._bluetoothSettingsCtxtDataList;                
            }
            else
            {
                this._bluetoothSettingsCtxtDataList.items[2].disabled = false;
                listLength = this._bluetoothSettingsCtxtDataList.itemCount - 1; 
                dataList = this._bluetoothSettingsCtxtDataList; 
            }
            this._currentContextTemplate.list2Ctrl.setDataList(dataList);
            this._currentContextTemplate.list2Ctrl.updateItems(0, listLength);
            break;
        default : 
            log.warn("No such context is defined");
            break;
    } 
    this._tempdatalist = dataListItems;
}

btpairingApp.prototype.changeInderminateStyle = function()
{
    if(this._speedThreshold)
    {
    var dataListItems = [
                           // Bluetooth On/Off button
                           { appData : {name: "Bluetooth"} , text1Id : "Bluetooth", itemStyle : "styleOnOff", value : 1 , hasCaret : false, disabled : true },
                           { appData : {name: "SelectBluetoothSettings"}, text1Id : "Settings", itemStyle : "style02" , hasCaret : false,disabled : true },
                           { appData : {name: "AddNewDevice"}, text1Id : "AddNewDevice",itemStyle : "style02" , hasCaret : false , disabled : true}
                           ];
    }
    else
    {
    var dataListItems = [
                           // Bluetooth On/Off button
                           { appData : {name: "Bluetooth"} , text1Id : "Bluetooth", itemStyle : "styleOnOff", value : 1 , hasCaret : false },
                           { appData : {name: "SelectBluetoothSettings"}, text1Id : "Settings", itemStyle : "style02" , hasCaret : false },
                           { appData : {name: "AddNewDevice"}, text1Id : "AddNewDevice",itemStyle : "style02" , hasCaret : false , disabled : true}
                           ];
    }
    
    var dataList = { itemCountKnown : true, itemCount : dataListItems.length, items : dataListItems };
    this._currentContextTemplate.list2Ctrl.setDataList(dataList);
    var listLength = dataList.itemCount - 1;
    this._currentContextTemplate.list2Ctrl.updateItems(0, listLength);
    this.setMeter(true, this._currentContextTemplate.list2Ctrl, 0);
};

btpairingApp.prototype.setMeter = function(state, list, itemIndex)
{
    var currentValue = (1 === list.dataList.items[itemIndex].value) ? 1 : 2;

    if (state)
    {
        list.dataList.items[itemIndex].itemStyle = 'style03';
        list.dataList.items[itemIndex].image2 = 'common/images/IcnStatBgFunctions_Refreshing.png';
        list.dataList.items[itemIndex].image3 = 1 === currentValue ? 'common/controls/List2/images/IcnListCheck_Checked_En.png' : 'common/controls/List2/images/IcnListCheck_Unchecked_En.png';
        list.dataList.items[itemIndex].disabled = true;
        list.updateItems(itemIndex,itemIndex);
    
    }
    else
    {
        list.dataList.items[itemIndex].itemStyle = 'styleOnOff';
        list.dataList.items[itemIndex].image2 = '';
        list.dataList.items[itemIndex].image3 = '';
        list.dataList.items[itemIndex].disabled = false;
        list.updateItems(itemIndex,itemIndex);
    }
};


// Display Signal Strength status on Status Bar
btpairingApp.prototype._SignalStrengthStatusMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload)
    {
        this._PhoneSignalStrength = msg.params.payload.signalStrengthValue;
        log.debug("Signal strength value is "+this._PhoneSignalStrength);
        if(this._PhoneSignalStrength < 0)
        {
            framework.common.setSbIcon("PhoneSignal", false);
            return;
        }
        //appending 0 as framework needs 1 as "01" , 2 as "02" ...
        var state  = "0"+this._PhoneSignalStrength ;
        if(this._PhoneSignalStrength > 5)
        {
            state  = "05";
        }
        framework.common.setSbIcon("PhoneSignal", true, state);
    }
}
// Display Roaming status on Status Bar
btpairingApp.prototype._RoamingStatusMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload)
    {
        var currValue = msg.params.payload.RoamingOnOff;
        if(currValue === true)
        {
            framework.common.setSbIcon("Roaming",true);
        }
        else
        {
           framework.common.setSbIcon("Roaming",false);
        }
        return;
        //appending 0 as framework needs 1 as "01" , 2 as "02" ...
    }
}
//Display Phone Charging status on SBN - State
btpairingApp.prototype._SbnPhoneChargingStatusMsgHandler = function(msg)
{  
   
    if (msg && msg.params && msg.params.payload)
    {
        var currValue = msg.params.payload.phoneCharging;
        if(currValue == true)
        {
            var state  = "05";
        if(this._PhoneSignalStrength < 0)//phone is connected and signal strength is not available
        {
            framework.common.setSbIcon("Bluetooth", false);

        }

            framework.common.setSbIcon("Batt", true, state);
            this._PhoneCharging = true;
            return;
        }
        else
        {
            framework.common.setSbIcon("Batt", false);
            this._PhoneCharging = false;
            if(this._PhoneBatteryStrength == null)
            {
                 
            }
            else
            {
                log.debug("In else Condition");
                state = "0"+this._PhoneBatteryStrength;
                framework.common.setSbIcon("Batt", true, state); 
            }

        }
    }
}
//Display Battery status on Status Bar
btpairingApp.prototype._BatteryStatusMsgHandler = function(msg)
{
    if (msg && msg.params && msg.params.payload)
    {
        var currValue = msg.params.payload.currValue;
        var phoneBatterystatusAvailable = msg.params.payload.PhoneBatteryStatusAvailable; 
        if(phoneBatterystatusAvailable == true)
        {
            if(currValue < 0)
            {
                framework.common.setSbIcon("Batt", false);
                this._PhoneBatteryStrength = 0;
                return;
            }
            //appending 0 as framework needs 1 as "01" , 2 as "02" ...
            var state  = "0"+currValue;
            this._PhoneBatteryStrength = currValue ;
            if(currValue == 3)
            {
                state = "04";
                this._PhoneBatteryStrength = 4;
            }
            
            if(currValue > 4)
            {
                state  = "04";
                this._PhoneBatteryStrength = 4;
            }
         if(this._PhoneSignalStrength < 0)//phone is connected and signal strength is not available
        {
            framework.common.setSbIcon("Bluetooth", false);

        }
        if(this._PhoneCharging)
        {
        }
        else
        {
            framework.common.setSbIcon("Batt", true, state);
        }
        }
        else
        {
            framework.common.setSbIcon("Batt", false);
            this._PhoneBatteryStrength = null;
            //display the music icon and battery status of Audio device
            if(this._MusicBatteryStrength == null)
            {
                framework.common.setSbIcon("Batt", false);

            }
            else
            {
                state = "0"+this._MusicBatteryStrength;
                framework.common.setSbIcon("Batt", true, state); 
            
            }
        }
       
    }
}
//Display Phone Connected on SBN - State
btpairingApp.prototype._SbnMusicBatteryStatusMsgHandler = function(msg)
{  
        if (msg && msg.params && msg.params.payload)
        {
            this._MusicBatteryStrength = msg.params.payload.currValue  ;
            var musicBatterystatusAvailable = msg.params.payload.MusicBatteryStatusAvailable;
            
            if(musicBatterystatusAvailable == true)
            {
                if(this._cachedAudioPhone != null)
                { 
                      if(!this._cachedAudioPhone.phone)
                      {      
                            if(this._MusicBatteryStrength < 0)
                            {
                                framework.common.setSbIcon("Batt", false);
                                return;
                            }
                            //appending 0 as framework needs 1 as "01" , 2 as "02" ...
                            var state  = "0"+this._MusicBatteryStrength;
                            
                            if(this._MusicBatteryStrength == 3)
                            {
                                state = "04";
                                this._MusicBatteryStrength = 4;
                            }
                            
                            framework.common.setSbIcon("Batt", true, state);  
                            framework.common.setSbIcon("Music", true); 
                            
                        }
                }
            }
            else
            {
                framework.common.setSbIcon("Batt", false);
                this._MusicBatteryStrength = null;
                //display the music icon and battery status of Audio device
                if(this._PhoneBatteryStrength == null)
                {
                    framework.common.setSbIcon("Batt", false);
                }
                else
                {
                    if(this._PhoneCharging)
                    {
                        var state  = "05";
                        framework.common.setSbIcon("Batt", true, state);
                    }
                    else
                    {
                        state = "0"+this._PhoneBatteryStrength;
                        framework.common.setSbIcon("Batt", true, state); 
                    }
                }
            }
       }
}
btpairingApp.prototype._displaySBNStatus = function()
{
    var displayMusicIcon = true;
    var displayBluetooth = true;
    for (var i = 0; i < this._cachedBTStatusAndList.listItem.length; i++)
    {
        if (this._cachedBTStatusAndList.listItem[i].itemLabel === "")
        {
            continue;
        } 
        var deviceNameLabel = this._cachedBTStatusAndList.listItem[i].itemLabel;
        var deviceStatusLabel = this._cachedBTStatusAndList.listItem[i].status;
        var deviceConnectionLabel = this._cachedBTStatusAndList.listItem[i].connect_disconnect_Success;

        //if(deviceStatusLabel === "Connected")
		if(deviceStatusLabel === 1)
        {
            displayBluetooth = false;
            if(deviceConnectionLabel != 2)
            {
                displayMusicIcon = false;
            }
        }
    }
    if(displayBluetooth == true)//no device is connected
    {
        //if(this._cachedBTStatusAndList.status === "on" )
		if(this._cachedBTStatusAndList.status === 1 )
        {
            framework.common.setSbIcon("Bluetooth", true,"Ds");
        }
        else 
        {
            framework.common.setSbIcon("Bluetooth", false);    
        }
    }
    else if(displayMusicIcon == true)//connected with audio profile
    {
        framework.common.setSbIcon("Music", true);
    }
    else//phone is connected so display from handler
    {
        if((this._PhoneSignalStrength < 0)&&(this._PhoneBatteryStrength == null))
        {
            framework.common.setSbIcon("Batt", false);
            framework.common.setSbIcon("Bluetooth", true);
        }
        else
        {
            if(this._PhoneSignalStrength < 0)
            {
                framework.common.setSbIcon("Bluetooth", false);
            }
            else
            {
                 log.debug("Phone connected 3"+this._PhoneSignalStrength);
                 var state  = "0"+this._PhoneSignalStrength ;
                 if(this._PhoneSignalStrength > 5)
                 {
                      state  = "05";
                 }
                 framework.common.setSbIcon("PhoneSignal", true, state);
            }
            if(this._PhoneBatteryStrength == null)
            {
                 framework.common.setSbIcon("Batt", false);
            }
            else
            {
                if(this._PhoneCharging)
                {
                    log.debug("In if condition:");
                }
                else
                {
                    var state = "0"+this._PhoneBatteryStrength;
                    framework.common.setSbIcon("Batt", true, state); 
                }
            }
        }
        log.debug("Phone is connected ");
    }
}

btpairingApp.prototype._BTConnectionManagerGreyOut = function()
{
    log.debug("In _BTConnectionManagerGreyOut function...")
    this._tempdatalist[0].disabled = this._speedThreshold;
    this._tempdatalist[1].disabled = this._speedThreshold;
    this._tempdatalist[2].disabled = this._speedThreshold;
    this._currentContextTemplate.list2Ctrl.updateItems(0,2);
};
/**************************
 * Framework register
 **************************/
framework.registerAppLoaded("btpairing",null, true);