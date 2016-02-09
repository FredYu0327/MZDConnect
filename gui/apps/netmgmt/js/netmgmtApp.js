/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: netmgmtApp.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: ayonchn
 Date: 07.30.2012
 __________________________________________________________________________

 Description: IHU GUI Net Management App

 Revisions:
 v0.1 (30-Jul-2012) Initial release
 v0.2 (28-Aug-2012) Swithced to Common for Global events
 v0.3 (30-Aug-2012) AddNetwork context added - avorotp
 v0.4 (31-Aug-2012) Control select callbacks update - avorotp
 v0.4 (02-Oct-2012) Events & payloads update (client) - avorotp
 v0.5 (05-Oct-2012) Events & payloads update (hotspot) - avorotp
 v0.6 (05-Nov-2012) Modem and events & payloads update - avorotp
 v0.7 (05-Nov-2012) Dictionary update - avorotp
 v0.8 (23-Aug-2013) Dictionary update - aikonot
 v0.9 (28-Aug-2013) Updated dictionaries for SA and BG languages - aikonot
 v1.0 (09-Sep-2013) Dictionaries updated - aikonot
 v1.1 (10-Oct-2013) WPA keyboard always uses english as it's input language (SW00134783)
 v1.2 (11-Oct-2013) Previously entered data is kept, when switching keyboard layouts (SW00134828)
 v1.3 (25-Oct-2013) Added indentation for the found/deleteable wifi networks (SW00129854)
 v1.4 (17-Dec-2013) Gray out the Delete button of Delete Confirmation if the user crosses the speed threshold (SW00138924)
 _________________________________ _________________________________________

 */

log.addSrcFile("netmgmtApp.js", "netmgmt");

/**
 * App constructor
 * =========================
 * @param {string} - uiaid of the app
 * @return {netmgmtApp} - extends baseApp
 */
function netmgmtApp(uiaId)
{

    log.debug("constructor called...");

    // Base application functionality is provided in a common location via this call to baseApp.init().
    // See framework/js/BaseApp.js for details.
    baseApp.init(this, uiaId);

    // All feature-specific initialization is done in appInit()
}

/**
 * =========================
 * Standard App Functions
 * =========================
 */

/**
 * App init routine
 * Called just after the app is instantiated by framework.
 * =========================
 * @return {void}
 */
netmgmtApp.prototype.appInit = function()
{
    log.debug(" netmgmtApp appInit  called...");

    /* ------------------------------
     * TEST APPLICATION
     * ------------------------------
     */
    if (framework.debugMode)
    {
        framework.debugMode = true;
        utility.loadScript("apps/netmgmt/test/netmgmtAppTest.js");
    }


    /* ------------------------------
     * INTERNAL PROPERTIES AND CONFIG
     * ------------------------------
     */
    this._lastKeyboardType = null;      // {Integer} Holds the last shown keyboard type (to be used in the InvalidPassword context)
    this._onOffStatus = 0;              // {Integer} Current wifi client on / off status
    this._caseSensitiveSorting = false; // {Boolean} Whether character casing is ignored when sorting the networks


    /* ------------------------------
     * DATALISTS
     * Default datalists for list contexts
     * ------------------------------
     */
    var dataList_NetworkOptions = {
        itemCountKnown : true,
        itemCount : 3,
        items: [
            { itemStyle : 'styleOnOff', appData : 'wifiSwitch', text1Id : 'WiFi', value : 2, hasCaret : false },
            { itemStyle : 'style01', appData : 'otherNetwork', text1Id : 'OtherNetwork', disabled : true, hasCaret : false },
            { itemStyle : 'style01', appData : 'deleteNetwork', text1Id : 'DeleteNetwork', disabled : true, hasCaret : false },
        ]
    };

    var dataList_OtherNetwork = {
        itemCountKnown : true,
        itemCount : 4,
        items: [
            { itemStyle : 'style06', appData : 'ssid', text1Id : 'NameSSID', hasCaret : false },
            { itemStyle : 'style06', appData : 'securityOptions', text1Id : 'SecurityOptions', label1Id : 'None', hasCaret : false },
            { itemStyle : 'style01', appData : 'password', text1Id : 'Password', disabled : true, hasCaret : false },
            { itemStyle : 'style01', appData : 'connect', text1Id : 'Connect', disabled : true, hasCaret : false },
        ]
    };

    var dataList_Connect = {
        itemCountKnown : true,
        itemCount : 2,
        items: [
            { itemStyle : 'style01', appData : 'password', text1Id : 'Password', hasCaret : false },
            { itemStyle : 'style01', appData : 'connect', text1Id : 'ConnectTo', hasCaret : false, disabled : true },
        ]
    };

    var dataList_Disconnect = {
        itemCountKnown : true,
        itemCount : 1,
        items: [
            { itemStyle : 'style01', appData : 'disconnect', text1Id : 'Disconnect', hasCaret : false },
        ]
    };

    var dataList_SecurityOptions = {
        itemCountKnown : true,
        itemCount : 5,
        items: [

            /* Raw security types enum
            typedef enum BLM_WIFI_Security_Types_e
            {
                BLM_WIFI_Security_Types_NONE = 0,
                BLM_WIFI_Security_Types_WEP = 1<<1,
                BLM_WIFI_Security_Types_WPA = 1<<2,
                BLM_WIFI_Security_Types_WPA2 = 1<<3,
                BLM_WIFI_Security_Types_WPAWPA2 = BLM_WIFI_Security_Types_WPA | BLM_WIFI_Security_Types_WPA2,
                BLM_WIFI_Secutiry_Types_UNKOWN = 1<<30
            } BLM_NMS_WIFI_Security_Types_t;
            */

            { itemStyle : 'style03', appData : 0, text1Id : 'None', image1 : 'tick', checked : true, hasCaret : false },
            { itemStyle : 'style03', appData : 2, text1Id : 'WEP', image1 : 'tick', hasCaret : false },
            { itemStyle : 'style03', appData : 4, text1Id : 'WPA', image1 : 'tick', hasCaret : false },
            { itemStyle : 'style03', appData : 8, text1Id : 'WPA2', image1 : 'tick', hasCaret : false },
            { itemStyle : 'style03', appData : 12, text1Id : 'WPAWPA2', image1 : 'tick', hasCaret : false },
        ]
    };

    var dataList_DeleteNetwork = {
        itemCountKnown : true,
        itemCount : 0,
        items: []
    };


    /* ------------------------------
     * CONTEXT TABLE
     * Context descriptions and default content
     * ------------------------------
     */
    //@formatter:off
    this._contextTable = {

        "NetworkOptions" : {
            sbNameId : 'NetworkConnection',
            leftBtnStyle : "goBack",
            template : 'List2Tmplt',
            controlProperties : {
                List2Ctrl : {
                    dataList : dataList_NetworkOptions,
                    selectCallback : this._listSelectCallback.bind(this)
                }
            },
            readyFunction : this._NetworkOptionsReady.bind(this),
            contextOutFunction : this._NetworkOptionsOut.bind(this)
        }, // end of "NetworkOptions"

        "Connect" : {
            sbNameId : 'NetworkConnection',
            leftBtnStyle : "goBack",
            template : 'List2Tmplt',
            controlProperties : {
                List2Ctrl : {
                    dataList: dataList_Connect,
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02'
                    },
                    selectCallback : this._listSelectCallback.bind(this),
                }
            },
            readyFunction : this._ConnectReady.bind(this)
        }, // end of "Connect"

        "Disconnect" : {
            sbNameId : 'NetworkConnection',
            leftBtnStyle : "goBack",
            template : 'List2Tmplt',
            controlProperties : {
                List2Ctrl : {
                    dataList: dataList_Disconnect,
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02'
                    },
                    selectCallback : this._listSelectCallback.bind(this),
                }
            },
            readyFunction : this._DisconnectReady.bind(this)
        }, // end of "Disconnect"

        "OtherNetwork" : {
            sbNameId : 'NetworkConnection',
            leftBtnStyle : "goBack",
            template : 'List2Tmplt',
            controlProperties : {
                List2Ctrl : {
                    dataList: dataList_OtherNetwork,
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',
                        text1Id : 'OtherNetwork'
                    },
                    selectCallback : this._listSelectCallback.bind(this),
                }
            },
            readyFunction : this._OtherNetworkReady.bind(this)
        }, // end of "OtherNetwork"

        "SecurityOptions" : {
            sbNameId : 'NetworkConnection',
            leftBtnStyle : "goBack",
            template : 'List2Tmplt',
            controlProperties : {
                List2Ctrl : {
                    dataList: dataList_SecurityOptions,
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',
                        text1Id : 'SecurityType'
                    },
                    selectCallback : this._listSelectCallback.bind(this),
                }
            },
            readyFunction : this._SecurityOptionskReady.bind(this)
        }, // end of "SecurityOptions"

        "Connecting" : {
            sbNameId : 'NetworkConnection',
            template : 'Dialog3Tmplt',
            controlProperties : {
                Dialog3Ctrl : {
                    contentStyle : "style03",
                    text1Id : 'Connecting',
                    meter : { meterType : "indeterminate", meterPath : "common/images/IndeterminateMeter.png" },
                    buttonCount : 1,
                    buttonConfig : {
                        button1 : {
                            labelId : 'common.Cancel',
                            appData : 'cancel',
                            buttonColor: 'normal',
                            buttonBehavior : 'shortPressOnly'
                        }
                    },
                    defaultSelectCallback : this._dialogSelectCallback.bind(this),
                }
            },
        }, // end of "Connecting"

        "Aborting" : {
            sbNameId : 'NetworkConnection',
            template : 'Dialog3Tmplt',
            controlProperties : {
                Dialog3Ctrl : {
                    contentStyle : "style03",
                    text1Id : 'Disconnecting',
                    meter : { meterType : "indeterminate", meterPath : "common/images/IndeterminateMeter.png" },
                    buttonCount : 0,
                }
            },
        }, // end of "Aborting"

        "KeyboardInput" : {
            sbNameId : 'EnterPassword',
            template : 'KeyboardTmplt',
            controlProperties : {
                KeyboardCtrl : {
                    okBtnCallback : this._keyboardCallback.bind(this, 'ok'),
                    cancelBtnCallback : this._keyboardCallback.bind(this, 'cancel'),
                    value : null,
                    required : false,
                    validationRule : null,
                    appData : null,
                    isPassword : false,
                }
            },
            contextInFunction : this._KeyboardInputIn.bind(this),
            readyFunction : this._KeyboardInputReady.bind(this)
        }, // end of "KeyboardInput"

        "WEPKeyboard" : {
            sbNameId : 'EnterPassword',
            template : 'KeyboardTmplt',
            controlProperties : {
                KeyboardCtrl : {
                    okBtnCallback : this._keyboardCallback.bind(this, 'ok'),
                    cancelBtnCallback : this._keyboardCallback.bind(this, 'cancel'),
                    value : null,
                    required : false,
                    validationRule : null,
                    appData : null,
                    isPassword : true,
                    uniqueLayout : "hex"
                }
            },
            contextInFunction : this._WEPKeyboardIn.bind(this),
            readyFunction : this._WEPKeyboardReady.bind(this)
        }, // end of "WEPKeyboard"

        "InvalidPassword" : {
            sbNameId : 'NetworkConnection',
            template : 'Dialog3Tmplt',
            controlProperties : {
                Dialog3Ctrl : {
                    contentStyle : "style02",
                    text1Id : 'InvalidPassword',
                    buttonCount : 1,
                    buttonConfig : {
                        button1 : {
                            labelId : 'common.Ok',
                            appData : 'ok',
                            buttonColor: 'normal',
                            buttonBehavior : 'shortPressOnly'
                        }
                    },
                    defaultSelectCallback : this._dialogSelectCallback.bind(this),
                }
            },
        }, // end of "InvalidPassword"

        "ConnectionError" : {
            sbNameId : 'NetworkConnection',
            template : 'Dialog3Tmplt',
            controlProperties : {
                Dialog3Ctrl : {
                    contentStyle : "style02",
                    titleStyle : 'titleStyle01',
                    titleId : 'ConnectionError',
                    buttonCount : 2,
                    initialFocus : 1,
                    buttonConfig : {
                        button1 : {
                            labelId : 'common.Cancel',
                            appData : 'cancel',
                            buttonColor: 'normal',
                            buttonBehavior : 'shortPressOnly'
                        },
                        button2 : {
                            labelId : 'Retry',
                            appData : 'retry',
                            buttonColor: 'normal',
                            buttonBehavior : 'shortPressOnly'
                        }
                    },
                    defaultSelectCallback : this._dialogSelectCallback.bind(this),
                }
            },
            readyFunction : this._ConnectionErrorReady.bind(this)
        }, // end of "ConnectionError"

        "ConnectionRequired" : {
            sbNameId : 'NetworkConnection',
            template : 'Dialog3Tmplt',
            controlProperties : {
                Dialog3Ctrl : {
                    contentStyle : "style02",
                    titleStyle : 'titleStyle01',
                    titleId : 'NoNetworkConnectivity',
                    text1Id : 'DoYouWantToConnect',
                    buttonCount : 2,
                    initialFocus : 1,
                    buttonConfig : {
                        button1 : {
                            labelId : 'common.Cancel',
                            appData : 'cancel',
                            buttonColor: 'normal',
                            buttonBehavior : 'shortPressOnly'
                        },
                        button2 : {
                            labelId : 'ConnectionSetup',
                            appData : 'setup',
                            buttonColor: 'normal',
                            buttonBehavior : 'shortPressOnly'
                        }
                    },
                    defaultSelectCallback : this._dialogSelectCallback.bind(this),
                }
            },
        }, // end of "ConnectionRequired"

        "DisconnectInfo" : {
            sbNameId : 'NetworkConnection',
            template : 'Dialog3Tmplt',
            controlProperties : {
                Dialog3Ctrl : {
                    contentStyle : "style02",
                    text1Id : 'NetworkDisconnected'
                }
            },
            readyFunction : this._DisconnectInfoReady.bind(this)
        }, // end of "DisconnectInfo"

        "MaxNetwork" : {
            sbNameId : 'NetworkConnection',
            template : 'Dialog3Tmplt',
            controlProperties : {
                Dialog3Ctrl : {
                    contentStyle : "style13",
                    text1Id : 'MaxNetworksReached',
                    text2Id : 'DeleteANetwork',
                    buttonCount : 2,
                    buttonConfig : {
                        button1 : {
                            labelId : 'common.Cancel',
                            appData : 'cancel',
                            buttonColor: 'normal',
                            buttonBehavior : 'shortPressOnly'
                        },
                        button2 : {
                            labelId : 'Delete',
                            appData : 'delete',
                            buttonColor: 'normal',
                            buttonBehavior : 'shortPressOnly'
                        }
                    },
                    defaultSelectCallback : this._dialogSelectCallback.bind(this),
                }
            },
            readyFunction : this._MaxNetworkReady.bind(this)
        }, // end of "MaxNetwork"

        "DeleteNetwork" : {
            sbNameId : 'NetworkConnection',
            leftBtnStyle : "goBack",
            template : 'List2Tmplt',
            controlProperties : {
                List2Ctrl : {
                    dataList: dataList_DeleteNetwork,
                    titleConfiguration : 'listTitle',
                    title : {
                        titleStyle : 'style02',
                        text1Id : 'SavedNetworks'
                    },
                    selectCallback : this._listSelectCallback.bind(this),
                }
            },
            readyFunction : this._DeleteNetworkReady.bind(this)
        }, // end of "DeleteNetwork"

        "DeleteConfirmation" : {
            sbNameId : 'NetworkConnection',
            template : 'Dialog3Tmplt',
            controlProperties : {
                Dialog3Ctrl : {
                    contentStyle : "style02",
                    text1Id : 'DeleteConfirmation',
                    buttonCount : 2,
                    buttonConfig : {
                        button1 : {
                            labelId : 'common.Cancel',
                            appData : 'cancel',
                            buttonColor: 'normal',
                            buttonBehavior : 'shortPressOnly'
                        },
                        button2 : {
                            labelId : 'Delete',
                            appData : 'delete',
                            buttonColor: 'normal',
                            buttonBehavior : 'shortPressOnly'
                        }
                    },
                    defaultSelectCallback : this._dialogSelectCallback.bind(this),
                }
            },
            readyFunction : this._DeleteConfirmationReady.bind(this)
        } // end of "DeleteConfirmation"

    }; // end of this._contextTable
    //@formatter:on


    /* ------------------------------
     * MESSAGE TABLE
     * Message handlers and cache
     * ------------------------------
     */
    //@formatter:off
    this._messageTable = {

        "Global.AtSpeed" :      this._SpeedHandler.bind(this),                      // received anywhere (even when not in focus)
        "Global.NoSpeed" :      this._SpeedHandler.bind(this),                      // received anywhere (even when not in focus)
        "WifiStatus" :          this._WifiStatusHandler.bind(this),                 // received anywhere (even when not in focus)

        "wifiOnOff" :           this._wifiOnOffHandler.bind(this),                  // received in NetworkOptions
        "ScannedNetworksList" : this._ScannedNetworksListHandler.bind(this),        // received in WiFiNetworks
        "HiddenNetworkInfo" :   this._HiddenNetworkInfoHandler.bind(this),          // received in OtherNetwork
        "RememberedNetworksList" : this._RememberedNetworksListHandler.bind(this),  // received in DeleteNetwork
        "NewNetworkPassword" :  this._NewNetworkPasswordHandler.bind(this),         // received in Connect

        "TimedSbn_WifiNetworkLost" : this._TimedSbnHandler.bind(this),              // received when not in focus

    }; // end of this._messageTable
    //@formatter:on

    this._cachedwifiOnOff = null;
    this._cachedScannedNetworksList = null;
    this._cachedHiddenNetworkInfo = null;
    this._cachedRememberedNetworksList = null;
    this._cachedNewNetworkPassword = null;
};

/**
 * =========================
 * Context Handlers
 * =========================
 * WiFi Context List
 * - NetworkOptions     (list)
 * - OtherNetwork       (list)
 * - SecurityOptions    (list)
 * - Connect            (list)
 * - Disconnect         (list)
 * - DisconnectInfo     (dialog)
 * - Connecting         (dialog)
 * - Aborting           (dialog)
 * - ConnectionError    (dialog)
 * - ConnectionRequired (dialog)
 * - KeyboardInput      (keyboard)
 * - WEPKeyboard        (keyboard)
 * - InvalidPassword    (dialog)
 * - MaxNetwork         (dialog)
 * - DeleteNetwork      (list)
 * - DeleteConfirmation (dialog)
 * =========================
 */


/**
 * Ready Callback (NetworkOptions)
 * =========================
 * @return {void}
 */
netmgmtApp.prototype._NetworkOptionsReady = function(captureData)
{
    log.debug("_NetworkOptionsReady called...");

    // skip focus restore
    if (captureData && captureData.hasOwnProperty('skipRestore'))
    {
        captureData.skipRestore = true;
    }

    // clear cache
    this._clearCache();

    // update wifi switch
    if (null != this._cachedwifiOnOff)
    {
        this._updateNetworkOptionsWiFiSwitch();
    }

    // update network list
    if (null != this._cachedScannedNetworksList)
    {
        this._updateNetworkOptionsNetworkList();
    }

};

/**
 * Out Callback (NetworkOptions)
 * =========================
 * @return {void}
 */
netmgmtApp.prototype._NetworkOptionsOut = function()
{
    // clear cache
    this._cachedScannedNetworksList = null;
};


/**
 * Ready Callback (Connect)
 * =========================
 * @return {void}
 */
netmgmtApp.prototype._ConnectReady = function()
{
    log.debug("_ConnectReady called...");

    // update context
    this._updateConnect();

    // enable / disable connect button
    this._setConnectDisabled();
};


/**
 * Ready Callback (Disconnect)
 * =========================
 * @return {void}
 */
netmgmtApp.prototype._DisconnectReady = function()
{
    log.debug("_DisconnectReady called...");

    // update context
    this._updateDisconnect();
};


/**
 * Ready Callback (OtherNetwork)
 * =========================
 * @return {void}
 */
netmgmtApp.prototype._OtherNetworkReady = function()
{
    log.debug("_OtherNetworkReady called...");

    // update context
    if (null != this._cachedHiddenNetworkInfo)
    {
        this._updateOtherNetwork();
    }
};


/**
 * Ready Callback (SecurityOptions)
 * =========================
 * @return {void}
 */
netmgmtApp.prototype._SecurityOptionskReady = function()
{
    log.debug("_SecurityOptionskReady called...");

    // update context
    this._updateSecurityOptions();
};


/**
 * Context In Callback (KeyboardInput)
 * =========================
 * @return {void}
 */
netmgmtApp.prototype._KeyboardInputIn = function()
{
    log.debug("_KeyboardInputIn called...");

    // make default value null
    this._contextTable['KeyboardInput']['controlProperties']['KeyboardCtrl']['value'] = null;
    this._contextTable['KeyboardInput']['controlProperties']['KeyboardCtrl']['isPassword'] = false;

    if (this._hasContextPayload())
    {
        var contextPayload = this._getContextPayload();
        this._contextTable['KeyboardInput']['controlProperties']['KeyboardCtrl']['value'] = (contextPayload.value) ? contextPayload.value : null;
        this._contextTable['KeyboardInput']['controlProperties']['KeyboardCtrl']['isPassword'] = (contextPayload.isPassword) ? true : false;
        this._contextTable['KeyboardInput']['sbNameId'] = (contextPayload.isPassword) ? 'EnterPassword' : 'NetworkConnection';
    }
};


/**
 * Ready Callback (KeyboardInput)
 * =========================
 * @return {void}
 */
netmgmtApp.prototype._KeyboardInputReady = function(captureData)
{
    log.debug("_KeyboardInputReady called...");

    // speed restrict keyboard if needed
    this._speedRestrictKeyboard();
};


/**
 * Context In Callback (WEPKeyboard)
 * =========================
 * @return {void}
 */
netmgmtApp.prototype._WEPKeyboardIn = function()
{
    log.debug("_WEPKeyboardIn called...");

    // make default value null
    this._contextTable['WEPKeyboard']['controlProperties']['KeyboardCtrl']['value'] = null;

    if (this._hasContextPayload())
    {
        var contextPayload = this._getContextPayload();
        this._contextTable['WEPKeyboard']['controlProperties']['KeyboardCtrl']['value'] = (contextPayload.value) ? contextPayload.value : null;
    }
};


/**
 * Ready Callback (WEPKeyboard)
 * =========================
 * @return {void}
 */
netmgmtApp.prototype._WEPKeyboardReady = function(captureData)
{
    log.debug("_WEPKeyboardReady called...");

    // speed restrict keyboard if needed
    this._speedRestrictKeyboard();
};


/**
 * Ready Callback (DisconnectInfo)
 * =========================
 * @return {void}
 */
netmgmtApp.prototype._DisconnectInfoReady = function()
{
    log.debug("_DisconnectInfoReady called...");

    // update context
    this._updateDisconnectInfo();
};


/**
 * Ready Callback (ConnectionError)
 * =========================
 * @return {void}
 */
netmgmtApp.prototype._ConnectionErrorReady = function()
{
    log.debug("_ConnectionErrorReady called...");

    // update context
    this._updateConnectionError();
};


/**
 * Ready Callback (MaxNetwork)
 * =========================
 * @return {void}
 */
netmgmtApp.prototype._MaxNetworkReady = function()
{
    log.debug("_MaxNetworkReady called...");

    // update context
    this._updateMaxNetwork();
};


/**
 * Ready Callback (DeleteNetwork)
 * =========================
 * @return {void}
 */
netmgmtApp.prototype._DeleteNetworkReady = function()
{
    log.debug("_DeleteNetworkReady called...");

    if (this._currentContextTemplate)
    {
        // force no loading
        var currentList = this._currentContextTemplate.list2Ctrl;
        if (currentList.inLoading)
        {
            currentList.setLoading(false);
        }
    }

    // update context
    this._updateDeleteNetwork();
};


/**
 * Ready Callback (DeleteConfirmation)
 * =========================
 * @return {void}
 */
netmgmtApp.prototype._DeleteConfirmationReady = function()
{
    log.debug("_DeleteConfirmationReady called...");

    // update context
    this._updateDeleteConfirmation();
    
    // speed restrict if needed
    this._speedRestrictDeleteConfirmation();
};



/**
 * =========================
 * Message Handlers
 * =========================
 * WiFi Message List
 * - Global.AtSpeed         (Anywhere)
 * - Global.NoSpeed         (Anywhere)
 * - WifiStatus             (Anywhere)
 * - wifiOnOff              (NetworkOptions)
 * - ScannedNetworksList    (NetworkOptions)
 * - HiddenNetworkInfo      (OtherNetwork)
 * - RememberedNetworksList (DeleteNetwork)
 * - NewNetworkPassword     (Connect)
 * =========================
 */

/**
 * Message Handler (AtSpeed / NoSpeed)
 * =========================
 * @param {object}
 * @return {void}
 */
netmgmtApp.prototype._SpeedHandler = function(msg)
{
    if (this._currentContext && this._currentContextTemplate)
    {
        switch (this._currentContext.ctxtId)
        {
            case 'NetworkOptions' :
                this._speedRestrictNetworkOptions();
                break;

            case 'Connect' :
                this._speedRestrictConnect();
                break;

            case 'DeleteNetwork' :
                this._speedRestrictDeleteNetwork();
                break;
                
             case 'DeleteConfirmation' :
                this._speedRestrictDeleteConfirmation();
                break;
                
            case 'MaxNetwork' :
                this._speedRestrictMaxNetwork();
                break;

            case 'OtherNetwork' :
                this._speedRestrictOtherNetwork();
                break;

            case 'KeyboardInput' :
            case 'WEPKeyboard' :
                this._speedRestrictKeyboard();
                break;

            default :
                // nothing to handle -> disregard
                break;
        }

    }
};

/**
 * Message Handler (WifiStatus)
 * =========================
 * @param {object}
 * @return {void}
 */
netmgmtApp.prototype._WifiStatusHandler = function(msg)
{
    log.debug("_WifiStatusHandler called...");

    if (msg.params.hasOwnProperty('payload'))
    {
        this._updateSBIcon(msg.params.payload);
    }
    else
    {
        log.error("Improper WifiStatus message received");
    }
};

/**
 * Message Handler (wifiOn)
 * =========================
 * @param {object}
 * @return {void}
 */
netmgmtApp.prototype._wifiOnOffHandler = function(msg)
{
    log.debug("_wifiOnOffHandler called...");

    // save
    if (msg.params.hasOwnProperty('payload'))
    {
        this._cachedwifiOnOff = msg.params.payload.isOn;
    }

    // update
    if (this._currentContext && this._currentContextTemplate && 'NetworkOptions' === this._currentContext.ctxtId)
    {
        this._updateNetworkOptionsWiFiSwitch();
    }
};

/**
 * Message Handler (ScannedNetworksList)
 * =========================
 * @param {object}
 * @return {void}
 */
netmgmtApp.prototype._ScannedNetworksListHandler = function(msg)
{
    log.debug("_ScannedNetworksListHandler called...");

    // save
    if (msg.params.hasOwnProperty('payload'))
    {
        this._cachedScannedNetworksList = msg.params.payload;
    }

    // update
    if (this._currentContext && this._currentContextTemplate && 'NetworkOptions' === this._currentContext.ctxtId)
    {
        this._updateNetworkOptionsNetworkList();
    }
};

/**
 * Message Handler (HiddenNetworkInfo)
 * =========================
 * @param {object}
 * @return {void}
 */
netmgmtApp.prototype._HiddenNetworkInfoHandler = function(msg)
{
    log.debug("_HiddenNetworkInfoHandler called...");

    // save
    if (msg.params.hasOwnProperty('payload'))
    {
        this._cachedHiddenNetworkInfo = msg.params.payload;
    }

    // update
    if (this._currentContext && this._currentContextTemplate && 'OtherNetwork' === this._currentContext.ctxtId)
    {
        this._updateOtherNetwork();
    }
};

/**
 * Message Handler (RememberedNetworksList)
 * =========================
 * @param {object}
 * @return {void}
 */
netmgmtApp.prototype._RememberedNetworksListHandler = function(msg)
{
    log.debug("_RememberedNetworksListHandler called...");

    // save
    if (msg.params.hasOwnProperty('payload'))
    {
        this._cachedRememberedNetworksList = msg.params.payload;
    }

    // update
    if (this._currentContext && this._currentContextTemplate && 'DeleteNetwork' === this._currentContext.ctxtId)
    {
        this._updateDeleteNetwork();
    }
};

/**
 * Message Handler (NewNetworkPassword)
 * =========================
 * @param {object}
 * @return {void}
 */
netmgmtApp.prototype._NewNetworkPasswordHandler = function(msg)
{
    log.debug("_NewNetworkPasswordHandler called...");

    // save
    if (msg.params.hasOwnProperty('payload') && msg.params.payload.hasOwnProperty('password'))
    {
        this._cachedNewNetworkPassword = msg.params.payload.password;
    }

    // update
    if (this._currentContext && this._currentContextTemplate && 'Connect' === this._currentContext.ctxtId)
    {
        this._setConnectDisabled();
    }
};


/**************************
 * SBN Handlers
 **************************/
netmgmtApp.prototype._TimedSbnHandler = function(msg)
{
    log.debug("_TimedSbnHandler called...");
    log.debug("    SBN: ", msg);

    if ('TimedSbn_WifiNetworkLost' === msg.msgId)
    {
        framework.common.startTimedSbn('netmgmt', 'TimedSbn_WifiNetworkLost', 'errorNotification', {
            sbnStyle : 'Style01',
            text1Id : 'GUI_WifiNetworkLost_Alert'
        });
    }
};


/**
 * =========================
 * Control Callbacks
 * =========================
 */

/**
 * List Select Callback
 * =========================
 * @param {List2Ctrl}
 * @param {string}
 * @param {object}
 * @return {void}
 */
netmgmtApp.prototype._listSelectCallback = function(listCtrlObj, appData, extraParams)
{
    log.debug("_listSelectCallback called...");
    log.debug("   context: " + this._currentContext.ctxtId);
    log.debug("   appData: " + appData);
    log.debug("   itemIndex: "+ extraParams.itemIndex);

    switch (this._currentContext.ctxtId)
    {
        case 'NetworkOptions' :
            switch (appData)
            {
                case 'wifiSwitch' :
                    var offOn =  (extraParams.additionalData === 1) ? 1 : 0;
                    var params = { payload : { offOn : offOn } };
                    framework.sendEventToMmui(this.uiaId, 'SetWifiConnection', params);

                    // clear any shown networks if OFF is selected preventing the user from selecting a network when WIFI is off
                    if (offOn === 0)
                    {
                        this._cachedScannedNetworksList = {size:0, list:[]};
                        this._updateNetworkOptionsNetworkList(2);
                        this._cachedScannedNetworksList = null;
                    }

                    // show indeterminate meter and immediately disable Other Networks and Delete Network
                    var listItem = null;
                    if (listItem = listCtrlObj.getItemByData('otherNetwork'))
                        listItem.item.disabled = true;
                    if (listItem = listCtrlObj.getItemByData('deleteNetwork'))
                        listItem.item.disabled = true;
                    listCtrlObj.updateItems(1, listCtrlObj.dataList.itemCount-1);
                    break;

                case 'otherNetwork' :
                    framework.sendEventToMmui(this.uiaId, 'SelectOtherNetwork');
                    break;

                case 'deleteNetwork' :
                    framework.sendEventToMmui(this.uiaId, 'SelectDeleteWiFiNetwork');
                    break;

                default :
                    var params = { payload: { wifiNetwork: {
                        ssid : appData.name,
                        bssid : appData.bssid,
                        netId : appData.id,
                        connState : appData.connectionState,
                        secType : appData.securityType,
                        stateFlags : appData.stateFlags
                    }}};
                    framework.sendEventToMmui(this.uiaId, 'SelectNetwork', params);
                    break;
            }
            break;

        case 'Connect' :
            switch (appData)
            {
                case 'password' :
                    var bssid = (this._hasContextPayload()) ? this._getContextPayload().bssid : null;
                    framework.sendEventToMmui(this.uiaId, 'SelectPassword', { payload : { bssid : bssid }});
                    break;
                case 'connect' :
                    var bssid = (this._hasContextPayload()) ? this._getContextPayload().bssid : null;
                    framework.sendEventToMmui(this.uiaId, 'SelectVisibleNetworkConnect', { payload : { bssid : bssid }});
                    break;
                default :
                    log.warn('Unknown list item selected: ' + appData);
                    break;
            }
            break;

        case 'Disconnect' :
            switch (appData)
            {
                case 'disconnect' :
                    framework.sendEventToMmui(this.uiaId, "SelectDisconnect");
                    break;
                default :
                    log.warn('Unknown list item selected: ' + appData);
                    break;
            }
            break;

        case 'OtherNetwork' :
            switch (appData)
            {
                case 'ssid' :
                    framework.sendEventToMmui(this.uiaId, 'SelectNameSSID');
                    break;

                case 'securityOptions' :
                    framework.sendEventToMmui(this.uiaId, 'SelectSecurity');
                    break;

                case 'password' :
                    framework.sendEventToMmui(this.uiaId, 'SelectPassword');
                    break;

                case 'connect' :
                    framework.sendEventToMmui(this.uiaId, 'SelectConnect');
                    break;
            }
            break;

        case 'SecurityOptions' :
            framework.sendEventToMmui(this.uiaId, 'SelectSecurityType', { payload : { securityType : appData }});
            break;

        case 'DeleteNetwork' :
            framework.sendEventToMmui(this.uiaId, 'SelectRememberedNetwork', { payload : { netId : appData.id, name:appData.name }});
            break;

        default :
            log.warn('No handling for this contex: ' + this._currentContext.ctxtId);
            break;

    }
};


/**
 * Dialog Select Callback
 * =========================
 * @param {Dialog3Ctrl}
 * @param {string}
 * @param {object}
 * @return {void}
 */
netmgmtApp.prototype._dialogSelectCallback = function(dialogCtrlObj, appData, extraParams)
{
    log.debug("_dialogSelectCallback called...");
    log.debug("   context: " + this._currentContext.ctxtId);
    log.debug("   appData: " + appData);

    switch (this._currentContext.ctxtId)
    {
        case 'Connecting' :
            if ('cancel' === appData)
            {
                framework.sendEventToMmui('Common', 'Global.Cancel');
            }
            break;

        case 'InvalidPassword' :
            if ('ok' === appData)
            {
                framework.sendEventToMmui('Common', 'Global.Yes');
            }
            break;

        case 'ConnectionError' :
            switch(appData)
            {
                case 'cancel' :
                    framework.sendEventToMmui('Common', 'Global.Cancel');
                    break;
                case 'retry' :
                    framework.sendEventToMmui(this.uiaId, 'RetryConnection');
                    break;
            }
            break;

        case 'ConnectionRequired' :
            switch(appData)
            {
                case 'cancel' :
                    framework.sendEventToMmui('Common', 'Global.Cancel');
                    break;
                case 'setup' :
                    framework.sendEventToMmui(this.uiaId, 'ConnectionSetup');
                    break;
            }
            break;

        case 'DisconnectInfo' :
            // nothing to do
            break;

        case 'MaxNetwork' :
            switch(appData)
            {
                case 'delete' :
                    framework.sendEventToMmui(this.uiaId, 'SelectDeleteWiFiNetwork');
                    break;
                case 'cancel' :
                    framework.sendEventToMmui('Common', 'Global.Cancel');
                    break;
            }
            break;

        case 'DeleteConfirmation' :
            switch(appData)
            {
                case 'delete' :
                    framework.sendEventToMmui(this.uiaId, 'SelectDelete');
                    break;
                case 'cancel' :
                    framework.sendEventToMmui('Common', 'Global.Cancel');
                    break;
            }
            break;

        default :
            log.warn('No handling for this contex: ' + this._currentContext.ctxtId);
            break;
    }
};


/**
 * Keyboard Callback
 * =========================
 * @param {KeyboardCtrl}
 * @param {string}
 * @param {object}
 * @return {void}
 */
netmgmtApp.prototype._keyboardCallback = function(keyPressed, btnObj, appData, extraParams)
{
    log.debug("_keyboardCallback called...");
    log.debug("   context: " + this._currentContext.ctxtId);

    switch (keyPressed)
    {
        case 'ok' :
            switch (this._currentContext.ctxtId)
            {

                case 'KeyboardInput' :
                    if (this._hasContextPayload())
                    {
                        var contextPayload = this._getContextPayload();
                        // type : wep | name | pass
                        var type = (contextPayload.isPassword) ? 'pass' : 'name';
                        var isValid = this._validatePassword(extraParams.input, type);
                        framework.sendEventToMmui(this.uiaId, 'SubmitKeyboardInput', {payload : { input:extraParams.input, type:type, isValid:isValid }});
                    }
                    break;

                case 'WEPKeyboard' :
                    var isValid = this._validatePassword(extraParams.input, 'wep');
                    framework.sendEventToMmui(this.uiaId, 'SubmitKeyboardInput', {payload : { input:extraParams.input, type:'wep', isValid:isValid }});
                    break;

            }

            break;
        case 'cancel' :
            framework.sendEventToMmui('Common', 'Global.Cancel');
            break;
    }
};


/**
 * =========================
 * Helper functions
 * =========================
 */

/**
 * Update WiFi Switch (NetworkOptions)
 * =========================
 * @param {object} - status information containing on/off state; connected state; transmission state; signal strength
 * @return {void}
 */
netmgmtApp.prototype._updateSBIcon = function(status)
{
    // validate input
    if (!status.hasOwnProperty('onOffState') ||
        !status.hasOwnProperty('connectedState') ||
        !status.hasOwnProperty('transmissionState') ||
        !status.hasOwnProperty('signalStrength'))
    {
        return;
    }

    /* Decide what icon to show
     * onOffState : 1 | 0
     * connectedState :  -1 (Invalid) | 0 (Disconnected) | 1 (Disconnecting) | 2 (Connecting) | 3 (Connected)
     * transmissionState : 0 (NoTransmission) | 1 (Receive) | 2 (Send) | 3 (ReceiveAndSend)
     */

    if (status.onOffState > 0)
    {
        // wifi is on
        if (status.connectedState > 0)
        {
            var level = this._signalStrengthToLevel(status.signalStrength);

            // we are connected
            if (status.transmissionState > 0)
            {
                // we are transmitting
                framework.common.setSbIcon('WifiSignal', true, level + '_active');
            }
            else
            {
                // we are not transmitting
                framework.common.setSbIcon('WifiSignal', true, level);
            }
        }
        else
        {
            // we are not connected
            framework.common.setSbIcon('WifiSignal', true, '00');
        }
    }
    else
    {
        // wifi is off
        framework.common.setSbIcon('WifiSignal', false, '00');
    }

};

/**
 * Update WiFi Switch (NetworkOptions)
 * =========================
 * @return {void}
 */
netmgmtApp.prototype._updateNetworkOptionsWiFiSwitch = function()
{
    // validate input
    if (null == this._cachedwifiOnOff)
    {
        return;
    }

    // get at speed
    var atSpeed = framework.common.getAtSpeedValue();

    // get current list
    var currentList = this._currentContextTemplate.list2Ctrl;

    var items = [];

    if (1 === this._cachedwifiOnOff)
    {
        // update local reference
        this._contextTable['NetworkOptions']['controlProperties']['List2Ctrl']['dataList']['items'][0]['value'] = 1;
        this._contextTable['NetworkOptions']['controlProperties']['List2Ctrl']['dataList']['items'][1]['disabled'] = false;
        this._contextTable['NetworkOptions']['controlProperties']['List2Ctrl']['dataList']['items'][2]['disabled'] = false;

        // if we turn on the wifi and we already have network list -> show it and exit
        if (this._cachedScannedNetworksList)
        {
            this._updateNetworkOptionsNetworkList();
            return;
        }
        // we turn on the wifi for the first time
        else
        {
            items.push({ itemStyle : 'styleOnOff', appData : 'wifiSwitch', text1Id : 'WiFi', value : 1, hasCaret : false });
            items.push({ itemStyle : 'style01', appData : 'otherNetwork', text1Id : 'OtherNetwork', disabled : atSpeed, hasCaret : false });
            items.push({ itemStyle : 'style01', appData : 'deleteNetwork', text1Id : 'DeleteNetwork', disabled : atSpeed, hasCaret : false });
        }
    }
    else if (0 === this._cachedwifiOnOff)
    {
        // update local reference
        this._contextTable['NetworkOptions']['controlProperties']['List2Ctrl']['dataList']['items'][0]['value'] = 2;
        this._contextTable['NetworkOptions']['controlProperties']['List2Ctrl']['dataList']['items'][1]['disabled'] = true;
        this._contextTable['NetworkOptions']['controlProperties']['List2Ctrl']['dataList']['items'][2]['disabled'] = true;

        items.push({ itemStyle : 'styleOnOff', appData : 'wifiSwitch', text1Id : 'WiFi', value : 2, hasCaret : false });
        items.push({ itemStyle : 'style01', appData : 'otherNetwork', text1Id : 'OtherNetwork', disabled : true, hasCaret : false });
        items.push({ itemStyle : 'style01', appData : 'deleteNetwork', text1Id : 'DeleteNetwork', disabled : true, hasCaret : false });
    }
    else
    {
        log.warn('Unknown WiFi status: ' + this._cachedwifiOnOff);
    }

    // set datalist
    var dataList_NetworkOptions = {
        itemCountKnown : true,
        itemCount : items.length,
        items: items
    };
    currentList.setDataList(dataList_NetworkOptions);
    currentList.updateItems(0, dataList_NetworkOptions.itemCount-1);

    // update local wifi on / off status
    this._onOffStatus = this._cachedwifiOnOff;
};

/**
 * Update Network List (NetworkOptions)
 * =========================
 * @return {void}
 */
netmgmtApp.prototype._updateNetworkOptionsNetworkList = function(forcedOnOffValue)
{
    // validate input
    if (null == this._cachedScannedNetworksList)
    {
        return;
    }

    // check for network list before doing anything
    if (0 == this._cachedScannedNetworksList.size && 0 == this._onOffStatus)
    {
        return;
    }

    // get at speed
    var atSpeed = framework.common.getAtSpeedValue();

    // get current list
    var currentList = this._currentContextTemplate.list2Ctrl;

    // get current top item and focussed index
    var currentTop = currentList.topItem;
    var currentFocus = currentList.focussedItem;

    var items = [];

    // wifi toggle item
    items.push({ itemStyle : 'styleOnOff', appData : 'wifiSwitch', text1Id : 'WiFi', value : (forcedOnOffValue) ? forcedOnOffValue : 1, hasCaret : false });

    // sort networks
    this._cachedScannedNetworksList.list.sort(this._sortNetworks.bind(this));

    // network items
    for (var i = 0; i < this._cachedScannedNetworksList.size; i++)
    {
        // get fields
        var connectionState = (1 === this._cachedScannedNetworksList.list[i].connectionState) ? 1 : 0;
        var signalStrength = parseInt(this._cachedScannedNetworksList.list[i].signalStrength);
        var securityType = this._cachedScannedNetworksList.list[i].securityType;
        var bssid = this._cachedScannedNetworksList.list[i].bssid;
        var id = this._cachedScannedNetworksList.list[i].id;
        var name = (this._cachedScannedNetworksList.list[i].name != '') ? this._cachedScannedNetworksList.list[i].name : bssid;
        var stateFlags = this._cachedScannedNetworksList.list[i].stateFlags;

        // get checkmark image
        var checkedImage = (connectionState) ? './common/images/icons/IcnListCheckmark.png' : '';

        // get signal strength image
        var signalStrengthImage = this._getSignalStrengthImage(signalStrength);

        // get security type string id
        var secTypeStringId = this._getSecurityTypeStringId(securityType);

        // make data
        var data = {name:name, connectionState:connectionState, signalStrength:signalStrength, securityType:securityType, bssid:bssid, id:id, stateFlags:stateFlags};

        // make item
        items.push({ itemStyle : 'style22', appData : data, text1 : name, label1Id : secTypeStringId, image1 : checkedImage, image2 : signalStrengthImage, hasCaret : false, indented  : true });
    }

    // other networks item
    items.push({ itemStyle : 'style01', appData : 'otherNetwork', text1Id : 'OtherNetwork', disabled : atSpeed, hasCaret : false });

    // delete networks item
    items.push({ itemStyle : 'style01', appData : 'deleteNetwork', text1Id : 'DeleteNetwork', disabled : atSpeed, hasCaret : false });

    // set datalist
    var dataList_NetworkOptions = {
        itemCountKnown : true,
        itemCount : items.length,
        items: items
    };
    currentList.setDataList(dataList_NetworkOptions);
    currentList.updateItems(0, dataList_NetworkOptions.itemCount-1);

    // restore scroll position and focussed item
    currentList.topItem = currentTop;
    currentList.focussedItem = currentFocus;

    // update local wifi status to ON
    this._onOffStatus = 1;
};

/**
 * Update Connect (Connect)
 * =========================
 * @return {void}
 */
netmgmtApp.prototype._updateConnect = function()
{
    // validate input
    if (!this._hasContextPayload())
    {
        return;
    }

    // get at speed
    var atSpeed = framework.common.getAtSpeedValue();

    // get context payload
    var contextPayload = this._getContextPayload();

    // get current list
    var currentList = this._currentContextTemplate.list2Ctrl;

    // make title
    var titleObj = {
        text1 : contextPayload.networkName,
        titleStyle : 'style02'
    };

    // update title
    currentList.setTitle(titleObj);

    // disable password if we are at speed
    var listItem = currentList.getItemByData('password');
    if (listItem)
    {
        listItem.item.disabled = atSpeed;
        // update items
        currentList.updateItems(listItem.itemId, listItem.itemId);
    }

    listItem = currentList.getItemByData('connect');
    if (listItem)
    {
        listItem.item.text1Id = 'ConnectTo';
        listItem.item.text1SubMap = {networkName:contextPayload.networkName};
        // update items
        currentList.updateItems(listItem.itemId, listItem.itemId);
    }
};


/**
 * Enable / Disable connect (Connect)
 * =========================
 * @return {void}
 */
netmgmtApp.prototype._setConnectDisabled = function()
{
    // validate input
    if (null == this._cachedNewNetworkPassword)
    {
        return;
    }

    // state is dependent on valid password
    var state = ('' == this._cachedNewNetworkPassword);

    // get current list
    var currentList = this._currentContextTemplate.list2Ctrl;

    var listItem = currentList.getItemByData('connect');
    if (listItem)
    {
        // set item enabled/disabled
        listItem.item.disabled = state;

        // update items
        currentList.updateItems(listItem.itemId, listItem.itemId);

        /*
        // clear cache after processing
        this._cachedNewNetworkPassword = null;
        */
    }
};


/**
 * Update Disconnect (Disconnect)
 * =========================
 * @return {void}
 */
netmgmtApp.prototype._updateDisconnect = function()
{
    // validate input
    if (!this._hasContextPayload())
    {
        return;
    }

    // get context payload
    var contextPayload = this._getContextPayload();

    // get current list
    var currentList = this._currentContextTemplate.list2Ctrl;

    // make title
    var titleObj = {
        text1 : contextPayload.networkName,
        titleStyle : 'style02'
    };

    // update title
    currentList.setTitle(titleObj);
};



/**
 * Update Other Network (OtherNetwork)
 * =========================
 * @return {void}
 */
netmgmtApp.prototype._updateOtherNetwork = function()
{
    if (null == this._cachedHiddenNetworkInfo)
    {
        return;
    }

    var details = this._cachedHiddenNetworkInfo;

    // get at speed
    var atSpeed = framework.common.getAtSpeedValue();

    // get current list
    var currentList = this._currentContextTemplate.list2Ctrl;

    // enable/disable items
    currentList.dataList.items[0].label1 = ('' != details.networkName) ? details.networkName : '';      // name/ssid
    currentList.dataList.items[0].disabled = atSpeed;                                                   // name/ssid
    currentList.dataList.items[1].label1Id = this._getSecurityTypeStringId(details.securityType);       // security options
    currentList.dataList.items[1].disabled = atSpeed;                                                   // security options
    currentList.dataList.items[2].disabled = (!details.securityType || atSpeed);                        // password
    currentList.dataList.items[3].disabled = (!this._valdateSecurityOptions(details));                  // connect (not at-speed dependent)

    // update items
    currentList.updateItems(0, 3);
};


/**
 * Update Security Options (SecurityOptions)
 * =========================
 * @return {void}
 */
netmgmtApp.prototype._updateSecurityOptions = function()
{
    // validate input
    if (!this._hasContextPayload())
    {
        return;
    }

    // get context payload
    var contextPayload = this._getContextPayload();

    // get current list
    var currentList = this._currentContextTemplate.list2Ctrl;

    // get current security type item
    var currentItem = currentList.getItemByData(contextPayload.currentSecurityType);
    if (currentItem)
    {
        currentList.setTick(currentItem.itemId, true);
    }
};


/**
 * Update Disconnect Info (DisconnectInfo)
 * =========================
 * @return {void}
 */
netmgmtApp.prototype._updateDisconnectInfo = function()
{
    // validate input
    if (!this._hasContextPayload())
    {
        return;
    }

    // get context payload
    var contextPayload = this._getContextPayload();

    // get current dialog
    var currentDialog = this._currentContextTemplate.dialog3Ctrl;

    // get network name
    var networkName = contextPayload.networkName;

    // set string id
    currentDialog.setText1Id('NetworkDisconnected', {networkName:networkName});
};


/**
 * Update Connection Error (ConnectionError)
 * =========================
 * @return {void}
 */
netmgmtApp.prototype._updateConnectionError = function()
{

    // validate input
    if (!this._hasContextPayload())
    {
        return;
    }

    // get context payload
    var contextPayload = this._getContextPayload();

    // get current dialog
    var currentDialog = this._currentContextTemplate.dialog3Ctrl;

    // get error string id
    var errorStrId = this._getErrorStringId(contextPayload.reasonId);

    // set error
    currentDialog.setText1Id(errorStrId);
};


/**
 * Update Max Network (MaxNetwork)
 * =========================
 * @return {void}
 */
netmgmtApp.prototype._updateMaxNetwork = function()
{
    // get at speed
    var atSpeed = framework.common.getAtSpeedValue();

    // get current dialog
    var currentDialog = this._currentContextTemplate.dialog3Ctrl;

    // disable Delete button
    currentDialog.setDisabled('button2', atSpeed);
};


/**
 * Update Delete Network List (DeleteNetwork)
 * =========================
 * @return {void}
 */
netmgmtApp.prototype._updateDeleteNetwork = function()
{
    // validate input
    if (null == this._cachedRememberedNetworksList)
    {
        return;
    }

    // get at speed
    var atSpeed = framework.common.getAtSpeedValue();

    // get current list
    var currentList = this._currentContextTemplate.list2Ctrl;

    var items = [];

    // network items
    for (var i = 0; i < this._cachedRememberedNetworksList.size; i++)
    {
        // get fields
        var connectionState = (1 === this._cachedRememberedNetworksList.list[i].connectionState) ? 1 : 0;
        var signalStrength = parseInt(this._cachedRememberedNetworksList.list[i].signalStrength);
        var securityType = this._cachedRememberedNetworksList.list[i].securityType;
        var bssid = this._cachedRememberedNetworksList.list[i].bssid;
        var id = this._cachedRememberedNetworksList.list[i].id;
        var name = (this._cachedRememberedNetworksList.list[i].name != '') ? this._cachedRememberedNetworksList.list[i].name : bssid;

        // get security type string id
        var secTypeStringId = this._getSecurityTypeStringId(securityType);

        // get signal strength image
        var signalStrengthImage = this._getSignalStrengthImage(signalStrength);

        // make data
        var data = {name:name, connectionState:connectionState, signalStrength:signalStrength, securityType:securityType, bssid:bssid, id:id};

        //check connected state
        var checkedImage = (connectionState) ? './common/images/icons/IcnListCheckmark.png' : '';

        // make item
        items.push({ itemStyle : 'style22', appData : data, text1 : name, label1Id : secTypeStringId, image1 : checkedImage, image2 : signalStrengthImage, disabled : atSpeed, hasCaret : false , indented : true});
    }

        items.sort(function(item1, item2) {
            if(item1.image1 === "") {
                return 1;
            } else {
                return -1;
            }
        });

    // set datalist
    var dataList_DeleteNetwork = {
        itemCountKnown : true,
        itemCount : items.length,
        items: items
    };
    currentList.setDataList(dataList_DeleteNetwork);
    currentList.updateItems(0, dataList_DeleteNetwork.itemCount-1);

    if (0 == items.length)
    {
        currentList.setLoading(false);
    }
};


/**
 * Update Delete Confirmation (DeleteConfirmation)
 * =========================
 * @return {void}
 */
netmgmtApp.prototype._updateDeleteConfirmation = function()
{
    // validate input
    
    if (!this._hasContextPayload())
    {
        return;
    }

    // get context payload
    var contextPayload = this._getContextPayload();

    // get current dialog
    var currentDialog = this._currentContextTemplate.dialog3Ctrl;

    // get network name
    var networkName = contextPayload.networkName;

    // set string id
    currentDialog.setText1Id('DeleteConfirmation', {networkName:networkName});
};

/**
 * =========================
 * Speed Restrict Helpers
 * =========================
 */

/**
 * Speed restrict Network Options (NetworkOptions)
 * =========================
 * @return {void}
 */
netmgmtApp.prototype._speedRestrictNetworkOptions = function()
{
    // get at speed
    var atSpeed = framework.common.getAtSpeedValue();

    // state is dependent on whether the wifi is on and if we are at sped
    var state = (!this._onOffStatus || atSpeed);

    // get current list
    var currentList = this._currentContextTemplate.list2Ctrl;

    // get other networks item
    var listItem = currentList.getItemByData('otherNetwork');
    if (listItem)
    {
        // set item enabled/disabled
        listItem.item.disabled = state;
        // update item
        currentList.updateItems(listItem.itemId, listItem.itemId);
    }

    // get delete network item
    var listItem = currentList.getItemByData('deleteNetwork');
    if (listItem)
    {
        // set item enabled/disabled
        listItem.item.disabled = state;
        // update item
        currentList.updateItems(listItem.itemId, listItem.itemId);
    }
};

/**
 * Speed restrict Connect (Connect)
 * =========================
 * @return {void}
 */
netmgmtApp.prototype._speedRestrictConnect = function()
{
    // get at speed
    var atSpeed = framework.common.getAtSpeedValue();

    // get current list
    var currentList = this._currentContextTemplate.list2Ctrl;

    // get password item
    var listItem = currentList.getItemByData('password');
    if (listItem)
    {
        // set item enabled/disabled
        listItem.item.disabled = atSpeed;
        // update item
        currentList.updateItems(listItem.itemId, listItem.itemId);
    }

    // TODO: consider calling directly this._updateConnect()
};

/**
 * Speed restrict DeleteConfirmation (DeleteConfirmation)
 * =========================
 * @return {void}
 */
netmgmtApp.prototype._speedRestrictDeleteConfirmation = function()
{
    // get at speed
    var atSpeed = framework.common.getAtSpeedValue();

    // get current dialog
    var currentDialog = this._currentContextTemplate.dialog3Ctrl;

    // disable Delete button
    currentDialog.setDisabled('button2', atSpeed);
};

/**
 * Speed restrict Delete Network (DeleteNetwork)
 * =========================
 * @return {void}
 */
netmgmtApp.prototype._speedRestrictDeleteNetwork = function()
{
    // get at speed
    var atSpeed = framework.common.getAtSpeedValue();

    // get current list
    var currentList = this._currentContextTemplate.list2Ctrl;

    // disable/enable everything
    for (var i=0, l=currentList.dataList.items.length; i<l; i++)
    {
        currentList.dataList.items[i].disabled = atSpeed;
    }
    currentList.updateItems(0, currentList.dataList.itemCount-1);
};

/**
 * Speed restrict Max Network (MaxNetwork)
 * =========================
 * @return {void}
 */
netmgmtApp.prototype._speedRestrictMaxNetwork = function()
{
    // get at speed
    var atSpeed = framework.common.getAtSpeedValue();

    // get current dialog
    var currentDialog = this._currentContextTemplate.dialog3Ctrl;

    // disable Delete button
    currentDialog.setDisabled('button2', atSpeed);

    // TODO: consider calling directly this._updateMaxNetwork()
};


/**
 * Speed restrict Other Network (OtherNetwork)
 * =========================
 * @return {void}
 */
netmgmtApp.prototype._speedRestrictOtherNetwork = function()
{
    // force context update
    this._updateOtherNetwork();
};


/**
 * Speed restrict Keyboard (KeyboardInput / WEPKeyboard)
 * =========================
 * @return {void}
 */
netmgmtApp.prototype._speedRestrictKeyboard = function()
{
    // get at speed
    var atSpeed = framework.common.getAtSpeedValue();

    // get current keyboard
    var currentKeyboard = this._currentContextTemplate.keyboardCtrl;

    // set atSpeed
    currentKeyboard.setAtSpeed(atSpeed);
};


/**
 * Clear cached data
 * =========================
 * @return {void}
 */
netmgmtApp.prototype._clearCache = function()
{
    this._cachedRememberedNetworksList = null;  // used in DeleteNetwork
    this._cachedHiddenNetworkInfo = null;       // used in OtherNetwork
    this._cachedNewNetworkPassword = null;      // used in Connect
};


/**
 * =========================
 * Utilities
 * =========================
 */

netmgmtApp.prototype._disableAllItems = function(listCtrl)
{
    for (var i=0; i<listCtrl.dataList.itemCount; i++)
    {
        listCtrl.dataList.items[i].disabled = true;
    }
    listCtrl.updateItems(0, listCtrl.dataList.itemCount-1);
};

netmgmtApp.prototype._getSecurityTypeStringId = function(securityTypeId)
{
    var strId = '';

    /* Raw security types enum
    typedef enum BLM_WIFI_Security_Types_e
    {
        BLM_WIFI_Security_Types_NONE = 0,
        BLM_WIFI_Security_Types_WEP = 1<<1,
        BLM_WIFI_Security_Types_WPA = 1<<2,
        BLM_WIFI_Security_Types_WPA2 = 1<<3,
        BLM_WIFI_Security_Types_WPAWPA2 = BLM_WIFI_Security_Types_WPA | BLM_WIFI_Security_Types_WPA2,
        BLM_WIFI_Secutiry_Types_UNKOWN = 1<<30
    } BLM_NMS_WIFI_Security_Types_t;
    */

    switch (securityTypeId)
    {
        case 0 :
            strId = 'None';
            break;
        case 2 :
            strId = 'WEP';
            break;
        case 4 :
            strId = 'WPA';
            break;
        case 8 :
            strId = 'WPA2';
            break;
        case 12 :
            strId = 'WPAWPA2';
            break;
        default :
            strId = 'Unknown';
            break;
    }

    return strId;
};

netmgmtApp.prototype._getErrorStringId = function(errorId)
{
    var strId = '';

    /*
    typedef enum MMUI_NETMGMT_CONNECTION_STATUS_e
    {
        MMUI_NETMGMT_CONNECTION_STATUS_SUCCESS = 0,
        MMUI_NETMGMT_CONNECTION_STATUS_TIMEOUT,
        MMUI_NETMGMT_CONNECTION_STATUS_ABORTED,
        MMUI_NETMGMT_CONNECTION_STATUS_WRONG_PASS,
        MMUI_NETMGMT_CONNECTION_STATUS_DHCP_FAILED,
        MMUI_NETMGMT_CONNECTION_STATUS_GENERAL
    } MMUI_NETMGMT_CONNECTION_STATUS_t;
    */

    switch (errorId)
    {
        case 1 :
            strId = 'ErrorNetwork';
            break;
        case 2 :
            strId = 'ErrorInternal';
            break;
        case 3 :
            strId = 'ErrorNetwork';
            break;
        case 4 :
            strId = 'ErrorDHCP';
            break;
        default :
            strId = 'ErrorInternal';
            break;
    }

    return strId;
};


netmgmtApp.prototype._getSignalStrengthImage = function(signal)
{
    var imageSrc = '';

    if (signal == 0) {
        imageSrc = "./common/images/icons/IcnListSignalG_00.png";
    }
    else if (signal <= 20)
    {
        imageSrc = "./common/images/icons/IcnListSignalG_01.png";
    }
    else if (signal <= 40)
    {
        imageSrc = "./common/images/icons/IcnListSignalG_02.png";
    }
    else if (signal <= 60)
    {
        imageSrc = "./common/images/icons/IcnListSignalG_03.png";
    }
    else if (signal <= 80)
    {
        imageSrc = "./common/images/icons/IcnListSignalG_04.png";
    }
    else if (signal <= 100)
    {
        imageSrc = "./common/images/icons/IcnListSignalG_05.png";
    }
    else
    {
        log.warn('Wrong signal strength', signal);
    }

    return imageSrc;
};

netmgmtApp.prototype._signalStrengthToLevel = function(signal)
{
    var level = '';

    if (signal == 0) {
        level = "00";
    }
    else if (signal <= 25)
    {
        level = "01";
    }
    else if (signal <= 50)
    {
        level = "02";
    }
    else if (signal <= 75)
    {
        level = "03";
    }
    else if (signal <= 100)
    {
        level = "04";
    }
    else
    {
        log.warn('Wrong signal strength', signal);
    }

    return level;
};

netmgmtApp.prototype._valdateSecurityOptions = function(securityOptions)
{
    // check for properly configured security options -> false
    if (securityOptions == null ||
        !securityOptions.hasOwnProperty('networkName') ||
        !securityOptions.hasOwnProperty('password') ||
        !securityOptions.hasOwnProperty('securityType')
    )
        return false;

    // check if there's no security and the name is empty -> false
    if ( (0 == securityOptions.securityType || '' == securityOptions.securityType) &&
         ('' == securityOptions.networkName)
    )
        return false;

    // check if there's a security and the name is empty or the password is empty -> false
    if ( ('' != securityOptions.securityType && 0 != securityOptions.securityType) &&
         ('' == securityOptions.networkName || '' == securityOptions.password)
    )
        return false;

    // if all the checks fail -> true
    return true;
};

netmgmtApp.prototype._sortNetworks = function(a, b)
{
    /*
     * Network sorting function
     * Sorting rules:
     * - Connection state (connected > not connected)
     * - Signal strength ( higher signal > lower signal )
     * - Security type ( Open(0) < WEP(2) < WPA(4) < WPA2(8) < WPAWPA2(12) )
     * - Name (a > b)
     */

    // validate input
    if (!a || !b)
    {
        return 0;
    }

    // validate proper structure
    if (!a.hasOwnProperty('connectionState') ||
        !a.hasOwnProperty('signalStrength') ||
        !a.hasOwnProperty('securityType') ||
        !b.hasOwnProperty('connectionState') ||
        !b.hasOwnProperty('signalStrength') ||
        !b.hasOwnProperty('securityType'))
    {
        return 0;
    }

    // sort by connection state
    if (a.connectionState != b.connectionState)
    {
        return (a.connectionState > b.connectionState) ? -1 : 1;
    }
    // sort by signal strength
    else if (a.signalStrength != b.signalStrength)
    {
        return (a.signalStrength > b.signalStrength) ? -1 : 1;
    }
    // sort by security type
    else if (a.securityType != b.securityType)
    {
        return (a.securityType > b.securityType) ? -1 : 1;
    }
    // sort by name
    else if (a.name != b.name)
    {
        if (this._caseSensitiveSorting)
        {
            // compareResult = a.name.localeCompare(b.name); // TODO: Check why this doesn't work
            return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
        }
        else
        {
            // compareResult = a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase()); // TODO: Check why this doesn't work
            return a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase() ? -1 : a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase() ? 1 : 0;
        }
    }

    // return equal by default
    return 0;

};

netmgmtApp.prototype._validatePassword = function(password, rule)
{
    var isValid = false;

    // name | pass | wep
    switch (rule)
    {
        case 'name' :
            // input is always valid
            isValid = true;
            break;
        case 'pass' :
            // input should be betwen 8 and 63 characters
            isValid = /^(.{8,63})$/gi.test(password);
            break;
        case 'wep' :
            // input should be exactly 10 or 26 HEX characters
            isValid = /^([A-F0-9]{10}|[A-F0-9]{26})$/gi.test(password);
            break;
    }

    return isValid;
};

netmgmtApp.prototype._hasContextPayload = function()
{
    return (this._currentContext.params && this._currentContext.params.payload);
};

netmgmtApp.prototype._getContextPayload = function()
{
    return this._currentContext.params.payload;
};

/**
 * =========================
 * Framework register
 * =========================
 */
framework.registerAppLoaded("netmgmt", null, true);
