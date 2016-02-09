/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: favoritesApp.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: Brian Ensink (briane@spindance.com)
 Date: 11.02.2012
 __________________________________________________________________________

 Description:favorites

 Revisions:
 v0.1 (Nov 12 2012)        - All contexts viewable, no MMUI events or messages implemented.
 v0.2 (Jan 8 2013)         - Finished and unit tested all contexts for radio and communications favorites.
 v0.3 (Jan 25 2013)        - Finished Navi favorites.
 v0.4 (Jan 29 2013)        - Finished changes for 3.8
 v0.5 (Feb 5 2013)         - Modified changes for 3.8
 v0.6 (Feb 18 2013)        - Graying out Comm/Navi tab, Showing Icon for Tabs Radio/Comm/Navi - animjim
 v0.7 (March 18 2013)      - FavoritesContactDetails showing as per UI specs, UI migrate to v43 event spreadsheet - animjim
 v0.8 (March 22 2013)      - Implement new NNG method for Move Navigation, fetching GetFavoriteList every time it leaves the list - animjim
 v0.9 (April 2 2013)       - GPSLocation not available wink Implementation for Navigation - animjim
 v1.0 (April 8 2013)       - Head icon is displaying in selectcontact screen,NNG move method update and DBAPI changes for new parameter changes - animjim
 v1.1 (April 18 2013)      - Removing  Navigation Tab if navigation setup is not equipped.Graying out Address in favorite Contact if navigation is disabled- animjim
 v1.2 (April 24 2013)      - CheckIn for All Language Dictionary Files
 v1.3 (April 30 2013)      - CheckIn for Disabling "AddEdit" button and Favorites list when device is disconnected and Adding Alphabetic List for SelectContactComm and SelectContactNavi - animjim
 v1.4 (May 03 2013)        - CheckIn for SCR SW00116876 SW00117300 -animjim 
 v1.5 (May 10 2013)        - CheckIn for SCR SW00117786, SW00117450 -animjim
 v1.6 (May 13 2013)        - CheckIn for SCR SW00109658  -animjim
 v1.7 (May 22 2013)        - CheckIn for SCR SW00117944  -animjim
 v1.8 (May 28 2013)        - CheckIn for SCR SW00119342 (Specifying the TabsGroup)  -animjim 
 v1.8 (May 30 2013)        - CheckIn for SCR SW00119397 (Update GUI dictionary files in GUI_FAVORITES-IHU for all languages based on 3.9GUI)  -animjim
 v1.8 (May 31 2013)        - CheckIn for SCR SW00119642 (Add implementation for overwriting Radio Favorite for EU)  -animjim
 v1.9 (June 13 2013)       - CheckIn for SCR SW00121460 (Add check on return value of AppSDK callback) -animjim
 v2.0 (June 24 2013)       - CheckIn for SCR SW00121958 (Adding Navigation Favorite from Contacts, Contact List not scrollable with more than 6 contacts) -animjim 
 v2.1 (July 03 2013)       - CheckIn for SCR SW00122558 and SW00122429 -animjim
 v2.2 (July 11 2013)       - CheckIn for SCR SW00122900 and SW00123999 -animjim
 v2.3 (July 15 2013)       - CheckIn for SCR SW00124498 -animjim
 v2.4 (July 17 2013)       - CheckIn for SCR SW00125010,SW00124851,SW00125087,SW00123053 and SW00124775 -animjim
 v2.5 (July 22 2013)       - CheckIn for SCR SW00124509 -animjim 
 v2.6 (july 26 2013)       - CheckIn for SCR SW00124980 and SW00125696 - animjim
 v2.7 (july 31 2013)       - CheckIn for SCR SW00126758 - animjim
 v2.8 (Aug 7 2013)         - CheckIn for SCR SW00127551 - animjim
 v2.9 (Aug 9 2013)         - CheckIn for SCR SW00127596 - animjim
 v3.0 (Aug 14 2013)        - CheckIn for SCR SW00128199 -animjim
 v3.4 (Aug 23 2013)        - CheckIn for SCR SW00129796 -animjim
 v3.5 (Aug 25 2013)        - CheckIn for SCR SW00129771 -animjim
 v3.6 (Aug 27 2013)        - CheckIn for SCR SW00130331 and SW00129389 -animjim
 v3.6 (Aug 27 2013)        - CheckIn for SCR SW00130405 -animjim 
 v3.8 (Aug 30 2013)        - CheckIn for SCR SW00130538 and SCR SW00130001 -animjim 
 v3.9 (Sep 4 2013)         - CheckIn for SCR SW00130967 -animjim
 v4.0 (Dictionary Changes) - CheckIn for SCR SW00131389 -animjim
 v4.1 (Dictionary Changes) - CheckIn for SCR SW00131481 -animjim
 v4.2 (Dictionary Changes) - CheckIn for SCR SW00131787 -animjim
 v4.3 (Dictionary Changes) - CheckIn for SCR SW00132053 -animjim
 v4.4 (Dictionary Changes) - CheckIn for SCR SW00132340 -animjim
 v4.5 (Dictionary Changes) - CheckIn for SCR SW00132578 -animjim
 v4.6 (Dictionary Changes) - CheckIn for SCR SW00132578 -animjim
 v4.7 (Dictionary Changes) - CheckIn for SCR SW00132709 -animjim
 v4.8 (Sep 23 2013)        - CheckIn for SCR SW00132831 -animjim
 v4.9 (Sep 25 2013)        - CheckIn for SCR SW00133237 and SCR SW00131870 -animjim 
 v5.0 (Sep 26 2013)        - CheckIn for SCR SW00133323 -animjim 
 v5.1 (Oct 1 2013)         - Changes in address text for JP region -animjim
 v5.2 (Oct 4 2013)         - Changes in SCR:SW00129796 and SCR:SW00134200 -animjim 
 v5.3 (Oct 9 2013)         - Changes in SCR:SW00134652 -animjim 
 v5.4 (Oct 18 2013)        - Changes in SCR:SW00135017 -animjim 
 v5.5 (Nov 1 2013)         - Changes in SCR:SW00136589 - ashindey
 v5.6 (Nov 5 2013)         - Changes in SCR:SW00136846 - ashindey
 v5.7 (Nov 8 2013)         - Changes in SCR:SW00136988 - animjim
 v5.8 (Nov 12 2013)        - Changes in SCR:SW00137068 - animjim
 v5.9 (Nov 20 2013)        - Changes in SCR:SW00137735 - animjim
 v6.0 (Dec 04 2013)        - Changes in SCR:SW00138401 - animjim
 v6.1 (Jan 17 2014)        - Changes in SCR:SW00138442 - avalajh
 v6.1B(Jan 22 2014)        - Changes in SCR:SW00140440 - avalajh
 v6.2(Jan 31 2014)         - Changes in SCR:SW00140004 - avalajh
 v6.3(Feb 14 2014)         - Changes in SCR:SW00140439 - avalajh
 v6.4(Feb 26 2014)         - Changes in SCR:SW00143005 - avalajh
 v6.5(Mar 3 2014)          - Changes in SCR:SW00143618 - avalajh
 v6.6(Apr 23 2014)          - Changes in SCR:SW00146765 - aalatek - Included Dab Radio
 v6.7(May 13 2014)          - Added Navigation Edit Home and Delete Home options on the main edit list 
 v6.8(May 21 2014)          - Changes in SCR:SW00146397 - avalajh
 v6.9(Aug 22 2014)          - Changes in SCR:SW00154227 - Replaced deprecated code for listCtrl with list2Ctrl
 v7.1(Sep 10 2014)          - SW00154722 - Implemented navi fav support for multiple calls using needdatacallback
 v7.1(Sep 10 2014)          - SW00155909 - Enabled default display image in Comm Tab
_________________________________________________________________________
 */

log.addSrcFile("favoritesApp.js", "favorites");
//log.setLogLevel("favorites", "info");
function favoritesApp(uiaId)
{
    log.debug("Constructor called.");
    // Base application functionality is provided in a common location via this call to baseApp.init().
    // See framework/js/BaseApp.js for details.
    baseApp.init(this, uiaId);
}

/**************************
 * App Init is standard function called by framework *
 **************************/

/*
 * Called just after the app is instantiated by framework.
 * All variables local to this app should be declared in this function
 */
favoritesApp.prototype.appInit = function()
{
    log.debug("favoritesApp appInit called...");
    if (framework.debugMode)
    {
        utility.loadScript("apps/favorites/test/favoritesAppTest.js");
    }
    this._EnumTabComm        = "Communication";
    this._EnumTabRadio       = "Radio";
    this._EnumTabNavi        = "Navigation";
    this._EnumSuccess        = "Success";
    
    this._ctxTabRadio        = "FavoritesRadioTab" ;
    this._ctxTabComm         = "FavoritesCommTab"
    this._ctxTabNavi         = "FavoritesNaviTab"
 
    // Values to "type" field of a favorite returned by AppSDK GetFavoriteList method.
    this._EnumFavTypeAM      = 0;
    this._EnumFavTypeFM      = 1;
    this._EnumFavTypeSAT     = 2;
    this._EnumFavTypeDAB     = 3;
    this._EnumFavTypeContact = 0;
    this._EnumFavTypePhone   = 1;

    // Categories for APP SDK GetFavoriteList method
    this._EnumGetFavListCategoryRadio = 0;
    this._EnumGetFavListCategoryComm = 1;
    
    //Flag to set Radio Title
    this.isRadioTitleReq = false ;
    //Flag to set comm Title
    this.isCommTitleReq  = false ;

    //Implementation removing loading from move/delete/rename
    this.cachedListCountFavMove = 0 ;
    this.isRadioFavAdded = false ;  
    this.isContactFavAdded = false ;
    this.isNaviFavAdded = false ;

    //cached dataList editNaviFavorites
    this._cachedListData = new Array() ;
    this._cachedDataListEditnavi = {
            itemCountKnown: true,
            itemCount: 8,
            items: [
                {
                    appData : "SelectReplaceLocation",
                    text1Id : "replaceWithCurrentLocation",
                    selected : false,
                    disabled : false,
                    toggled : 0,
                    itemStyle : "style01",
                    hasCaret : false,
                    image1 : "common/images/icons/IcnListNavPoi_En.png",
                },
                {
                    appData : "SelectReplaceDestination",
                    text1Id : "replaceWithCurrentDestination",
                    selected : false,
                    disabled : false,
                    toggled : 0,
                    itemStyle : "style01",
                    hasCaret : false,
                    image1 : "common/images/icons/IcnListNavPoi_En.png",
                },
                {
                    appData : "SelectReplaceContactAddress",
                    text1Id : "replaceWithAddress",
                    selected : false,
                    disabled : false,
                    toggled : 0,
                    itemStyle : "style01",
                    hasCaret : false,
                    image1 : "common/images/icons/IcnListContact_En.png",
                },
                {
                    appData : "SelectEditMove",
                    text1Id : "moveFavorite",
                    selected : false,
                    disabled : false,
                    toggled : 0,
                    itemStyle : "style01",
                    hasCaret : false,
                    image1 : "common/images/icons/IcnListMove_En.png",
                },
                {
                    appData : "SelectEditRename",
                    text1Id : "renameFavorite",
                    selected : false,
                    disabled : false,
                    toggled : 0,
                    itemStyle : "style01",
                    hasCaret : false,
                    image1 : "common/images/icons/IcnListRename_En.png",
                },
                {
                    appData : "SelectEditDelete",
                    text1Id : "deleteFavorite",
                    selected : false,
                    disabled : false,
                    toggled : 0,
                    itemStyle : "style01",
                    hasCaret : false,
                    image1 : "common/images/icons/IcnListDelete_En.png",
                },
                {
                    appData : "SelectDeleteHome",
                    text1Id : "UnsetHome",
                    selected : false,
                    disabled : false,
                    toggled : 0,
                    image1 : null, //"common/images/icons/IcnListDelete_En.png",
                    itemStyle : "style01",
                    hasCaret : false,
                },
                {
                    appData : "SelectEditHome",
                    text1Id : "EditHome",
                    selected : false,
                    disabled : false,
                    toggled : 0,
                    image1 : null, //"common/images/icons/IcnListDelete_En.png",
                    itemStyle : "style01",
                    hasCaret : false,
                }
            ],
        } ;
    // Callback binder functions
    this._favoritesTabClickBinder = this._favoritesTabClick.bind(this);
    this._selectFavToActionItemCallbackBinder = this._selectFavToActionItemCallback.bind(this);
    
    // Define the set of tab buttons 
    this._tabsConfig = [
        {
            "selectCallback" : this._favoritesTabClickBinder,
            "label"         : null,            
            "subMap"        : null,
            "imageBase"     : "IcnTabEnt",       
            "disabled"      : false,
            "tabStyle"      : "tabsStyle1",
            "appData"       : this._EnumTabRadio,
        },
        {
            "selectCallback" : this._favoritesTabClickBinder,
            "label"         : null,            
            "subMap"        : null,
            "imageBase"     : "IcnTabComm",
            "disabled"      : true,
            "tabStyle"      : "tabsStyle1",
            "appData"       : this._EnumTabComm,
        },
        {
            "selectCallback" : this._favoritesTabClickBinder,
            "label"         : null,            
            "subMap"        : null,
            "imageBase"     : "IcnTabNav",
            "disabled"      : true,
            "tabStyle"      : "tabsStyle1",
            "appData"       : this._EnumTabNavi,
        }
    ];

    this._fakeDataList = new Array() ;
    //Context table
    //@formatter:off
    this._contextTable = {
        "FavoritesRadioTab" : {
            "leftBtnStyle" : "goBack",
            "template" : "List2Tmplt",
            "sbNameId" : "appTitle",
            "readyFunction" : this._readyFavoritesRadioTab.bind(this),
            "contextInFunction" : this._contextInCheckNaviFavoritesState.bind(this),
            "displayedFunction" : this._displayedFavoritesRadioTab.bind(this),
            "controlProperties": {
                "List2Ctrl" : {
                    selectCallback : this._radioFavoriteSelected.bind(this),
                    longPressCallback : this._radioFavoritesLongPress.bind(this),
                    dataList: this._fakeDataList,
                    titleConfiguration : "tabsTitle",
                    tabsButtonConfig : { 
                        "style" : "tabsStyle1", 
                        "defaultSelectCallback" : null, 
                        "currentlySelectedTab" : 0, 
                        "tabsConfig" : this._tabsConfig,
                        "tabsGroup":"favorites" 
                    },                    
                    fullWidth : true,
                } // end of "List2Ctrl"                                   
            }, // end of controlProperties
        }, // end of "FavoritesRadioTab"

        "FavoritesCommTab" : {
            "leftBtnStyle" : "goBack",
            "template" : "List2Tmplt",
            "sbNameId" : "appTitle",
            "readyFunction" : this._readyFavoritesCommTab.bind(this),
            "contextInFunction" : this._contextInCheckNaviFavoritesState.bind(this),
            "displayedFunction" : this._displayedFavoritesCommTab.bind(this),
            "controlProperties": {
                "List2Ctrl" : {
                    selectCallback : this._commFavoriteSelected.bind(this),
                    longPressCallback : this._commFavoritesLongPress.bind(this),
                    dataList: this._fakeDataList,
                    titleConfiguration : "tabsTitle",
                    tabsButtonConfig : { 
                        "style" : "tabsStyle1", 
                        "defaultSelectCallback" : null, 
                        "currentlySelectedTab" : 1, 
                        "tabsConfig" : this._tabsConfig,
                        "tabsGroup":"favorites" 
                    },
                    fullWidth : true,
                } // end of "List2Ctrl"                                   
            }, // end of controlProperties
        }, // end of "FavoritesCommTab"
        
        "FavoritesNaviTab" : {
            "leftBtnStyle" : "goBack",
            "template" : "List2Tmplt",
            "sbNameId" : "appTitle",
            "readyFunction" : this._readyFavoritesNaviTab.bind(this),
            "contextInFunction" : this._contextInCheckNaviFavoritesState.bind(this),
            "controlProperties": {
                "List2Ctrl" : {
                    selectCallback : this._naviFavoriteSelected.bind(this),
                    longPressCallback : this._naviFavoritesLongPress.bind(this),
                    needDataCallback : this._naviFavoriteNeedDataCallback.bind(this),
                    dataList: this._fakeDataList,
                    titleConfiguration : "tabsTitle",
                    tabsButtonConfig : { 
                        "style" : "tabsStyle1", 
                        "defaultSelectCallback" : null, 
                        "currentlySelectedTab" : 2, 
                        "tabsConfig" : this._tabsConfig,
                        "tabsGroup":"favorites" 
                    },
                    fullWidth : true,
                } // end of "List2Ctrl"
            }, // end of controlProperties
        }, // end of "FavoritesNaviTab"

        "AddEditFavoritesRadio" : {
            "leftBtnStyle" : "goBack",
            "template" : "List2Tmplt",
            "sbNameId" : "appTitle",
            "readyFunction" : this._readyAddEditFavoritesRadio.bind(this),
            "controlProperties": {
                "List2Ctrl" : {
                    selectCallback: this._addEditFavoritesRadioItemCallback.bind(this),
                    titleConfiguration: "listTitle",
                    title : {
                        titleStyle : "style02",
                        text1Id : "addEditFavoritesRadioTitle",
                    },
                    dataList : {
                        itemCountKnown: true,
                        itemCount: 3,
                        items: [
                            {
                                appData : "SelectAddRadioCurrent",
                                text1Id : "storeRadioFavorite",
                                text1SubMap: { frequency: "" },
                                selected : false,
                                disabled : false,
                                toggled : 0,
                                image1 : null,
                                itemStyle : "style01",
                                hasCaret : false,
                            },
                            {
                                appData : "SelectMove",
                                text1Id : "moveFavorite",
                                selected : false,
                                disabled : false,
                                toggled : 0,
                                image1 : "common/images/icons/IcnListMove_En.png",
                                itemStyle : "style01",
                                hasCaret : false,
                            },
                            {
                                appData : "SelectDelete",
                                text1Id : "deleteFavorite",
                                selected : false,
                                disabled : false,
                                toggled : 0,
                                image1 : "common/images/icons/IcnListDelete_En.png",
                                itemStyle : "style01",
                                hasCaret : false,
                            }
                        ],
                    },
                },
            }, // end of controlProperties
        }, // end of "FavoritesNaviTab"

        "EditFavoritesRadio" : {
            "leftBtnStyle" : "goBack",
            "template" : "List2Tmplt",
            "sbNameId" : "appTitle",
            "readyFunction" : this._readyEditFavoritesRadio.bind(this),
            "controlProperties": {
                "List2Ctrl" : {
                    selectCallback: this._editFavoritesRadioItemCallback.bind(this),
                    titleConfiguration: "listTitle",
                    title : {
                        titleStyle : "style02",
                        text1 : "",
                    },
                    dataList : {
                        itemCountKnown: true,
                        itemCount: 3,
                        items: [
                            {
                                appData : "SelectEditReplace",
                                text1Id : "replacewithRadioStation",
                                text1SubMap: { frequency: "" },
                                selected : false,
                                disabled : false,
                                toggled : 0,
                                image1 : null,
                                itemStyle : "style01",
                                hasCaret : false,
                            },
                            {
                                appData : "SelectEditMove",
                                text1Id : "moveFavorite",
                                selected : false,
                                disabled : false,
                                toggled : 0,
                                image1 : "common/images/icons/IcnListMove_En.png",
                                itemStyle : "style01",
                                hasCaret : false,
                            },
                            {
                                appData : "SelectEditDelete",
                                text1Id : "deleteFavorite",
                                selected : false,
                                disabled : false,
                                toggled : 0,
                                image1 : "common/images/icons/IcnListDelete_En.png",
                                itemStyle : "style01",
                                hasCaret : false,
                            }
                        ],
                    },
                },
            }, // end of controlProperties
        }, // end of EditFavoritesRadio

        "MaxFavoritesNotification" : {
            "leftBtnStyle" : "goBack",
            "template" : "Dialog3Tmplt",
            "sbNameId" : null,
            "readyFunction" : this._readyMaxFavoritesNotification.bind(this),
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "defaultSelectCallback" : this._dialogButtonCallback.bind(this),
                    "titleStyle" : null,
                    "contentStyle" : "style13",
                    "fullScreen" : false,
                    "buttonCount" : 2,
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "dialogBackButton",
                            appData : "Global.GoBack"
                        },
                        "button2" : {
                            labelId : "replaceButtonText",
                            appData : "Global.Yes"
                        }
                    }, // end of buttonConfig
                    "text1"   : null,
                    "text2Id" : "replaceExistingFavorite",
                    "text3"   : null,
                } // end of properties for dialog                                      
            }, // end of controlProperties
        }, // end of "MaxFavoritesNotification"

        "SelectFavoriteToReplace" : {
            "leftBtnStyle" : "goBack",
            "template" : "List2Tmplt",
            "sbNameId" : "appTitle",
            "contextInFunction" : this._contextInSelectFavAction.bind(this),
            "readyFunction"     : this._readySelectFavAction.bind(this),
            "controlProperties": {
                "List2Ctrl" : {
                    numberedList : false,
                    vuiSupport : false,
                    selectCallback: this._selectFavToActionItemCallbackBinder.bind(this),
                    needDataCallback : this._NeedDataSelectFavoriteCallback.bind(this,false),
                    titleConfiguration: "listTitle",
                    title : {
                        titleStyle : "style02",
                        text1Id : "selectFavoriteToReplace",
                    },
                    dataList : this._fakeDataList,
                }, 
            }, // end of controlProperties
        }, // end of "SelectFavoriteToReplace"

        "SelectFavoriteToMove" : {
            "leftBtnStyle" : "goBack",
            "template" : "List2Tmplt",
            "sbNameId" : "appTitle",
            "contextInFunction" : this._contextInSelectFavAction.bind(this),
            "readyFunction"     : this._readySelectFavAction.bind(this),
            "controlProperties": {
                "List2Ctrl" : {
                    numberedList : false,
                    vuiSupport : false,
                    selectCallback: this._selectFavToActionItemCallbackBinder.bind(this),
                    needDataCallback : this._NeedDataSelectFavoriteCallback.bind(this,false),
                    titleConfiguration: "listTitle",
                    title : {
                        titleStyle : "style02",
                        text1Id : "selectFavoriteToMove",
                    },
                    dataList : this._fakeDataList,
                },
            }, // end of controlProperties
        }, // end of "SelectFavoriteToMove"

        "SelectFavoriteToDelete" : {
            "leftBtnStyle" : "goBack",
            "template" : "List2Tmplt",
            "sbNameId" : "appTitle",
            "contextInFunction" : this._contextInSelectFavAction.bind(this),
            "readyFunction"     : this._readySelectFavAction.bind(this),
            "controlProperties": {
                "List2Ctrl" : {
                    numberedList : false,
                    vuiSupport : false,
                    selectCallback: this._selectFavToActionItemCallbackBinder.bind(this),
                    needDataCallback : this._NeedDataSelectFavoriteCallback.bind(this,false),
                    titleConfiguration: "listTitle",
                    title : {
                        titleStyle : "style02",
                        text1Id : "selectFavoriteToDelete",
                    },
                    dataList : this._fakeDataList,
                },
            }, // end of controlProperties
        }, // end of "SelectFavoriteToDelete"

        "SelectFavoriteToRename" : {
            "leftBtnStyle" : "goBack",
            "template" : "List2Tmplt",
            "sbNameId" : "appTitle",
            "contextInFunction" : this._contextInSelectFavAction.bind(this),
            "readyFunction"     : this._readySelectFavAction.bind(this),
            "controlProperties": {
                "List2Ctrl" : {
                    numberedList : false,
                    vuiSupport : false,
                    selectCallback: this._selectFavToActionItemCallbackBinder.bind(this),
                    needDataCallback : this._NeedDataSelectFavoriteCallback.bind(this,false),
                    titleConfiguration: "listTitle",
                    title : {
                        titleStyle : "style02",
                        text1Id : "selectFavoriteToRename",
                    },
                    dataList : this._fakeDataList,
                },
            }, // end of controlProperties
        }, // end of "SelectFavoriteToRename"

        "SelectPosition" : {
            "leftBtnStyle" : "goBack",
            "template" : "List2Tmplt",
            "sbNameId" : "appTitle",
            "contextInFunction" : this._contextInSelectPosition.bind(this),
            "displayedFunction" : this._displayedFunctionSelectPosition.bind(this),
            "controlProperties": {
                "List2Ctrl" : {
                    selectCallback: this._selectPositionItemCallback.bind(this),
                    needDataCallback : this._NeedDataSelectFavoriteCallback.bind(this,false),
                    titleConfiguration: "listTitle",
                    title : {
                        titleStyle : "style02",
                        text1Id : "selectPosition",
                    },
                    listReorder: true,
                    dataList : this._fakeDataList,
                    protectDataList : true,
                },
            }, // end of controlProperties
        }, // end of "SelectPosition"

        "DeleteConfirmation" : {
            "leftBtnStyle" : "goBack",
            "template" : "Dialog3Tmplt",
            "sbNameId" : null,
            "readyFunction" : this._readyDeleteConfirmation.bind(this),
            "controlProperties": {
                "Dialog3Ctrl" : {
                    "defaultSelectCallback" : this._dialogButtonCallback.bind(this),
                    "titleStyle" : null,
                    "contentStyle" : "style02",
                    "buttonConfig" : {
                        "button1" : {
                            labelId : "dialogBackButton",
                            appData : "Global.GoBack"
                        },
                        "button2" : {
                            labelId : "deleteFavorite",
                            appData : "SelectDelete"  //Changed from Global.Yes to SelectDelete 
                        }
                    }, // end of buttonConfig
                    "text1" : null,
                    "text2" : null,
                    "text3" : null,
                } // end of properties for dialog
            }, // end of controlProperties
        }, // end of "DeleteConfirmation"

        "FavoritesContactDetails" : {
            "leftBtnStyle" : "goBack",
            "template" : "List2Tmplt",
            "sbNameId" : "appTitle",
            "readyFunction" : this._readyFavoritesContactDetails.bind(this),
            "controlProperties": {
                "List2Ctrl" : {
                    selectCallback: this._favoritesContactDetailsItemCallback.bind(this),
                    titleConfiguration: "listTitle",
                    title : {
                        titleStyle : "style05",
                        text1 : "",
                        text2 : "",
                        image1: null,
                    },
                    dataList : this._fakeDataList,
                },
            }, // end of controlProperties
        }, // end of "FavoritesContactDetails"

        "AddEditFavoritesComm" : {
            "leftBtnStyle" : "goBack",
            "template" : "List2Tmplt",
            "sbNameId" : "appTitle",
            "readyFunction" : this._readyAddEditFavoritesComm.bind(this),
            "controlProperties": {
                "List2Ctrl" : {
                    selectCallback: this._addEditFavoritesCommItemCallback.bind(this),
                    titleConfiguration: "listTitle",
                    title : {
                        titleStyle : "style02",
                        text1Id : "addEditFavoritesCommTitle",
                    },
                    dataList : {
                        itemCountKnown: true,
                        itemCount: 5,
                        items: [
                            {
                                appData : "SelectAddContactFull",
                                text1Id : "addNewContact",
                                selected : false,
                                disabled : false,
                                toggled : 0,
                                image1 : "common/images/icons/IcnListContact_En.png",
                                itemStyle : "style01",
                                hasCaret : false,
                            },
                            {
                                appData : "SelectAddContactNumber",
                                text1Id : "addNewContactDetails",
                                selected : false,
                                disabled : false,
                                toggled : 0,
                                image1 : "common/images/icons/IcnListContact_En.png",
                                itemStyle : "style01",
                                hasCaret : false,
                            },
                            {
                                appData : "SelectMove",
                                text1Id : "moveFavorite",
                                selected : false,
                                disabled : false,
                                toggled : 0,
                                image1 : "common/images/icons/IcnListMove_En.png",
                                itemStyle : "style01",
                                hasCaret : false,
                            },
                            {
                                appData : "SelectRename",
                                text1Id : "renameFavorite",
                                selected : false,
                                disabled : false,
                                toggled : 0,
                                image1 : "common/images/icons/IcnListRename_En.png",
                                itemStyle : "style01",
                                hasCaret : false,
                            },
                            {
                                appData : "SelectDelete",
                                text1Id : "deleteFavorite",
                                selected : false,
                                disabled : false,
                                toggled : 0,
                                image1 : "common/images/icons/IcnListDelete_En.png",
                                itemStyle : "style01",
                                hasCaret : false,
                            }
                        ],
                    },
                }, 
            }, // end of controlProperties
        }, // end of "AddEditFavoritesComm"

        "EditFavoritesComm" : {
            "leftBtnStyle" : "goBack",
            "template" : "List2Tmplt",
            "sbNameId" : "appTitle",
            "readyFunction" : this._readyEditFavoritesComm.bind(this),
            "controlProperties": {
                "List2Ctrl" : {
                    selectCallback: this._editFavoritesCommItemCallback.bind(this),
                    titleConfiguration: "listTitle",
                    title : {
                        titleStyle : "style02",
                        text1 : null,
                    },
                    dataList : {
                        itemCountKnown: true,
                        itemCount: 5,
                        items: [
                            {
                                appData : "SelectReplaceContactFull",
                                text1Id : "replaceWithContact",
                                selected : false,
                                disabled : false,
                                toggled : 0,
                                image1 : "common/images/icons/IcnListContact_En.png",
                                itemStyle : "style01",
                                hasCaret : false,
                            },
                            {
                                appData : "SelectReplaceContactNumber",
                                text1Id : "replaceWithContactDetail",
                                selected : false,
                                disabled : false,
                                toggled : 0,
                                image1 : "common/images/icons/IcnListContact_En.png",
                                itemStyle : "style01",
                                hasCaret : false,
                            },
                            {
                                appData : "SelectEditMove",
                                text1Id : "moveFavorite",
                                selected : false,
                                disabled : false,
                                toggled : 0,
                                image1 : "common/images/icons/IcnListMove_En.png",
                                itemStyle : "style01",
                                hasCaret : false,
                            },
                            {
                                appData : "SelectEditRename",
                                text1Id : "renameFavorite",
                                selected : false,
                                disabled : false,
                                toggled : 0,
                                image1 : "common/images/icons/IcnListRename_En.png",
                                itemStyle : "style01",
                                hasCaret : false,
                            },
                            {
                                appData : "SelectEditDelete",
                                text1Id : "deleteFavorite",
                                selected : false,
                                disabled : false,
                                toggled : 0,
                                image1 : "common/images/icons/IcnListDelete_En.png",
                                itemStyle : "style01",
                                hasCaret : false,
                            }
                        ],
                    },
                }, 
            }, // end of controlProperties
        }, // end of EditFavoritesComm
        
        "SelectContactComm":{
            "leftBtnStyle" : "goBack",
            "template" : "List2Tmplt",
            "sbNameId" : "appTitle",
            "readyFunction" : this._readySelectContactComm.bind(this),
            "contextOutFunction" : this._contextOutSelectContactComm.bind(this),
            "noLongerDisplayedFunction" : this._noLongerDisplayedSelectContactCommOrDetails.bind(this),
            "controlProperties": {
                "List2Ctrl" : {
                    hasLetterIndex : true,
                    selectCallback: this._selectContactCommItemCallback.bind(this),
                    needDataCallback : this._selectContactCommNeedDataCallback.bind(this),
                    requestSize : 6,
                    titleConfiguration : "listTitle",
                    title : {
                        text1Id : "selectContactTitle",
                        titleStyle : "style02"
                    },
                    dataList : this._cachedContactsList,
                },
            }, // end of controlProperties
        },
        
        "SelectContactCommDetails":{
            "leftBtnStyle" : "goBack",
            "template" : "List2Tmplt",
            "sbNameId" : "appTitle",
            "readyFunction" : this._readySelectContactCommDetails.bind(this),
            "noLongerDisplayedFunction" : this._noLongerDisplayedSelectContactCommOrDetails.bind(this),
            "controlProperties": {
                "List2Ctrl" : {
                    selectCallback: this._selectContactCommDetailsItemCallback.bind(this),
                    titleConfiguration : "listTitle",
                    title : {
                        text1Id : "selectContactTitle",
                        titleStyle : "style02"
                    },
                    dataList : null,
                },
            }, // end of controlProperties
        }, // end of "SelectContactCommDetails"
        "SelectContactNavi":{
            "leftBtnStyle" : "goBack",
            "template" : "List2Tmplt",
            "sbNameId" : "appTitle",
            "readyFunction" : this._readySelectContactNavi.bind(this),
            "contextOutFunction" : this._contextOutSelectContactNavi.bind(this),
            "noLongerDisplayedFunction" : this._noLongerDisplayedSelectContactNaviOrDetails.bind(this),
            "controlProperties": {
                "List2Ctrl" : {
                    hasLetterIndex : true,
                    selectCallback: this._selectContactNaviItemCallback.bind(this),
                    needDataCallback : this._selectContactNaviNeedDataCallback.bind(this),
                    requestSize : 6,
                    titleConfiguration : "listTitle",
                    title : {
                        text1Id : "selectContactTitle",
                        titleStyle : "style02"
                    },
                    dataList : this._cachedContactsList,
                },
            }, // end of controlProperties
        },//end of selectContactNavi        
        "SelectContactNaviDetails":{
            "leftBtnStyle" : "goBack",
            "template" : "List2Tmplt",
            "sbNameId" : "appTitle",
            "readyFunction" : this._readySelectContactNaviDetails.bind(this),
            "noLongerDisplayedFunction" : this._noLongerDisplayedSelectContactNaviOrDetails.bind(this),
            "controlProperties": {
                "List2Ctrl" : {
                    selectCallback: this._selectContactNaviDetailsItemCallback.bind(this),
                    titleConfiguration : "listTitle",
                    title : {
                        text1Id : "selectContactTitle",
                        titleStyle : "style02"
                    },
                    dataList : this._fakeDataList,
                },
            }, // end of controlProperties
        }, // end of "SelectContactDetails"
        "AddEditFavoritesNavi" : {
            "leftBtnStyle" : "goBack",
            "template" : "List2Tmplt",
            "sbNameId" : "appTitle",
            "readyFunction" : this._readyAddEditFavoritesNavi.bind(this),
            "controlProperties": {
                "List2Ctrl" : {
                    selectCallback: this._addEditFavoritesNaviItemCallback.bind(this),
                    titleConfiguration: "listTitle",
                    title : {
                        titleStyle : "style02",
                        text1Id : "addEditFavoritesNaviTitle",
                    },
                    dataList : {
                        itemCountKnown: true,
                        itemCount: 8,
                        items: [
                            {
                                appData : "SelectAddLocation",
                                text1Id : "storeCurrentLocation",
                                selected : false,
                                disabled : false,
                                toggled : 0,
                                image1 : "common/images/icons/IcnListNavPoi_En.png",
                                itemStyle : "style01",
                                hasCaret : false,
                            },
                            {
                                appData : "SelectAddDestination",
                                text1Id : "storeCurrentDestination",
                                selected : false,
                                disabled : false,
                                toggled : 0,
                                image1 : "common/images/icons/IcnListNavPoi_En.png",
                                itemStyle : "style01",
                                hasCaret : false,
                            },
                            {
                                appData : "SelectAddContactAddress",
                                text1Id : "addFromContact",
                                selected : false,
                                disabled : false,
                                toggled : 0,
                                image1 : "common/images/icons/IcnListContact_En.png",
                                itemStyle : "style01",
                                hasCaret : false,
                            },
                            {
                                appData : "SelectMove",
                                text1Id : "moveFavorite",
                                selected : false,
                                disabled : false,
                                toggled : 0,
                                image1 : "common/images/icons/IcnListMove_En.png",
                                itemStyle : "style01",
                                hasCaret : false,
                            },
                            {
                                appData : "SelectRename",
                                text1Id : "renameFavorite",
                                selected : false,
                                disabled : false,
                                toggled : 0,
                                image1 : "common/images/icons/IcnListRename_En.png",
                                itemStyle : "style01",
                                hasCaret : false,
                            },
                            {
                                appData : "SelectDelete",
                                text1Id : "deleteFavorite",
                                selected : false,
                                disabled : false,
                                toggled : 0,
                                image1 : "common/images/icons/IcnListDelete_En.png",
                                itemStyle : "style01",
                                hasCaret : false,
                            },
                            {
                                appData : "SelectDeleteHome",
                                text1Id : "UnsetHome",
                                selected : false,
                                disabled : false,
                                toggled : 0,
                                image1 : null, //"common/images/icons/IcnListDelete_En.png",
                                itemStyle : "style01",
                                hasCaret : false,
                            },
                            {
                                appData : "SelectEditHome",
                                text1Id : "EditHome",
                                selected : false,
                                disabled : false,
                                toggled : 0,
                                image1 : null, //"common/images/icons/IcnListDelete_En.png",
                                itemStyle : "style01",
                                hasCaret : false,
                            }
                        ],
                    },
                },
            }, // end of controlProperties
        }, // end of "AddEditFavoritesNavi"

        "EditFavoritesNavi" : {
            "leftBtnStyle" : "goBack",
            "template" : "List2Tmplt",
            "sbNameId" : "appTitle",
            "readyFunction" : this._readyEditFavoritesNavi.bind(this),
            "controlProperties": {
                "List2Ctrl" : {
                    selectCallback: this._editFavoritesNaviItemCallback.bind(this),
                    titleConfiguration: "listTitle",
                    title : {
                        titleStyle : "style02",
                        text1Id : null,
                    },
                    dataList : this._cachedListData
                },
            }, // end of controlProperties
        }, // end of "EditFavoritesNavi"

        "QwertyEntry" : {
            "leftBtnStyle" : "goBack",
            "template" : "KeyboardTmplt",
            "sbName" : null,
            "contextInFunction" : this._contextInQwertyEntry.bind(this),
            "noLongerDisplayedFunction" : this._noLongerDisplayedQwertyEntry.bind(this),
            "controlProperties": {
                "KeyboardCtrl" : {
                    okBtnCallback : this._qwertyEntryOk.bind(this),
                    cancelBtnCallback : this._qwertyEntryCancel.bind(this),
                    value : null,           // (string)
                    locale : framework.localize.getCurrentLanguage(),
                    required : false,
                    validationRule : null,
                    appData : null
                } // end of properties for "KeyboardCtrl"
            }, // end of  controlProperties
        }, // end of "TestTabs1Apps"

    }; // end of this.contextTable object 
    //@formatter:on

    //message table
    //@formatter:off
    this._messageTable =
    {
        "PhoneStatus" : this._msgHandler_PhoneStatus.bind(this),
        "NaviSdCardStatus" : this._msgHandler_NaviSdCardStatus.bind(this),
        "AudioStatusRadioPlay" : this._msgHandler_AudioStatusRadioPlay.bind(this),
        "ResultFavoriteAdd" : this._msgHandler_ResultFavoriteAdd.bind(this),
        "ResultFavoriteDelete" : this._msgHandler_ResultFavoriteDelete.bind(this),
        "ResultFavoriteRename" : this._msgHandler_ResultFavoriteRename.bind(this),
        "ResultFavoriteMove" : this._msgHandler_ResultFavoriteMove.bind(this),
        "ResultFavoriteReplace" : this._msgHandler_ResultFavoriteReplace.bind(this),
        "Global.AtSpeed" : this._msgHandler_GlobalAtSpeed.bind(this),
        "Global.NoSpeed" : this._msgHandler_GlobalNoSpeed.bind(this),
        "RadioFavoritesListStatus" : this._msgHandler_NoRadioFavListStatus.bind(this), //New SBN Implt
		"ActiveFavId" : this._msgHandler_ActiveFavId.bind(this)
		};
    // end of this._messageTable
    // @formatter:on
	
	this._cachedActiveFavId = null;
	this._cachedFavPlayStatus = null;
	
    this._lastViewedTab = "";
    this._cachedCurrentRadioStation = null;
    //Added for SCR SW00148489 
    this._cachedPreviousRadioStation = null;
    this._cachedRadioFavorites = [];
    this._hasRequestedRadioFavorites = false;
    this._cachedCommFavorites = [];
    this._hasRequestedCommFavorites = false;
    this._cachedNaviFavorites = [];
    this._cachedNaviFavoritesCount = 0;
    this._hasRequestedNaviFavorites = false;

    // Phone connection and Contacts and DBAPI phonebook related variables
    this._isPhoneConnected = false;
    this._phoneDeviceId = null;
    this._isContactsDbOpen = false;
    this._contactIdFreeList = [];
    this._dbSeqNo = []; 
    this._requestChunkSize = 10; //contact item count request send to PB

    // SD Card connected status
    this._isSdCardConnected = false;
    this._prevSdCardStatus = false;

    //To check if the navi State checking is done
    this._hasRequestedNaviState = false;
    
    this._checkSDCardStatus = true;

    // msg cache
    this._contactsListActualDataCount = 0;      // Number of items that are actually fetched and populated in the list
    this._contactsListCount = 0;                // Number of items count requested to DBAPI
    this._contactsNaviListCount = 0 ;
    // App SDK params.requestId counter
    this._appSdkParamsRequestId = 0;
    
    //new variable declearation for navigation Delete Home Impl
    this.isHomeSet = false ;
    
    this._isUpdateReplaceNaviList = true ;  
};

favoritesApp.prototype._localize = function(stringId, values)
{
    return framework.localize.getLocStr(this.uiaId, stringId, values);
};

/**************************
 * Tabs Click Handler Functions *
 **************************/
favoritesApp.prototype._favoritesTabClick = function(controlRef, appData, params)
{
    if (appData !== this._lastViewedTab)
    {
        framework.sendEventToMmui(this.uiaId, "SelectFavoritesTab", { payload: { favoritesTab: appData }} );
    }
};

/**************************
 * Context handlers
 **************************/
//RadioTab Context
favoritesApp.prototype._readyFavoritesRadioTab = function()
{
    this._lastViewedTab = this._EnumTabRadio;
    if(this._currentContextTemplate)
	{
      if(this._currentContext.ctxtId === this._ctxTabRadio)
	  {
      log.debug("#fav:_readyFavoritesRadioTab");
      this._clearCachedRadioFavorites(); //intentionally clearing the flag to call FavoriteList appSdk
      this._lazyRequestFavorites(this._EnumTabRadio);
      var dataList = this._getFavoritesRadioTabListData();
      var list2Ctrl = this._getCurrentContextListCtrl();
        if (list2Ctrl)
        {
            list2Ctrl.setDataList(dataList);
            list2Ctrl.updateItems(0, dataList.itemCount - 1);
        }
       }//end of context check
    }//end of template check
};

//CommunicationTab Context
favoritesApp.prototype._readyFavoritesCommTab = function()
{
    this._lastViewedTab = this._EnumTabComm;
    if(this._currentContextTemplate){
       if(this._currentContext.ctxtId === this._ctxTabComm){
          log.debug("#fav:_readyFavoritesCommTab");
          this._clearCachedCommFavorites();  //intentionally clearing the flag to call FavoriteList appSdk
          this._lazyRequestFavorites(this._EnumTabComm);
          var dataList = this._getFavoritesCommTabListData();
          var list2Ctrl = this._getCurrentContextListCtrl();
          if (list2Ctrl)
          {
            if(this._isPhoneConnected){
             dataList.items[0].disabled = false ;
             //New Implt for Speed Restriction for SCR: SW00129389
             if(framework.common.getAtSpeedValue()){
                 dataList.items[0].disabled = true ; 
             }else{
                 dataList.items[0].disabled = false ;
             }
            }else{
             dataList.items[0].disabled = true ;
             dataList.itemCount = 1 ;
            }
            list2Ctrl.setDataList(dataList);
            if (this._currentContextTemplate.list2Ctrl.inLoading && dataList.itemCount === 1) 
            {
                 this._currentContextTemplate.list2Ctrl.setLoading(false);
            }
            list2Ctrl.updateItems(0,dataList.itemCount - 1);
        }
      }//end of context check
    }//end of template check
};
//NavigationTab Context
favoritesApp.prototype._readyFavoritesNaviTab = function()
{
    this._lastViewedTab = this._EnumTabNavi;
    if(this._currentContextTemplate){
      if(this._currentContext.ctxtId === this._ctxTabNavi){
         log.debug("#fav:_readyFavoritesNaviTab");
         this._clearCachedNaviFavorites();   // Always request new Navi favorites
         this._lazyRequestFavorites(this._EnumTabNavi);  
            if(this._isSdCardConnected){
                //set Navi Tab disabled
                this._currentContextTemplate.list2Ctrl.tabsCtrl.setTabDisabled(2, !this._isSdCardConnected);
               }
      }//end of context check
    }//end of template check
};

//This is used to check the Navigation Equipped State
favoritesApp.prototype._contextInCheckNaviFavoritesState = function()
{
   this._contextTable["FavoritesNaviTab"]['controlProperties']['List2Ctrl']['dataList'] = this._fakeDataList;
  
  if(this._hasRequestedNaviState && this._isSdCardConnected){
    this._tabsConfig[2].disabled = !this._isSdCardConnected;
   }else{
    log.debug("_contextInCheckNaviFavoritesState:in else");
   }
};

//AddEditFavoritesRadio Context
favoritesApp.prototype._readyAddEditFavoritesRadio = function()
{
 log.debug("#Fav:_readyAddEditFavoritesRadio:");
 // Update the "Store" current frequency item 
 this.isRadioTitleReq = false ; //title is not required set false
 this._addCurrentFreqItem(); 
};

//EditFavoritesRadio Context
favoritesApp.prototype._readyEditFavoritesRadio = function()
{
 // Update title with the favorite"s name
 this.isRadioTitleReq = true ;
 log.debug("#Fav_readyEditFavoritesRadio");
 this._addCurrentFreqItem();
};

//MaxFavoritesNotification Context
favoritesApp.prototype._readyMaxFavoritesNotification = function()
{
    var payload = this._getContextPayload();
    if (payload)
    {
        if (payload.favoritesTab === this._EnumTabComm)
        {
            if(this._currentContextTemplate)
            this._currentContextTemplate.dialog3Ctrl.setText1Id("maxCommFavorites");
        }
        else if (payload.favoritesTab === this._EnumTabRadio)
        {
            if(this._currentContextTemplate)
            this._currentContextTemplate.dialog3Ctrl.setText1Id("maxRadioFavorites");
        }
        else if (payload.favoritesTab === this._EnumTabNavi)
        {
            if(this._currentContextTemplate)
            this._currentContextTemplate.dialog3Ctrl.setText1Id("maxNavFavorites");
        }
    }
    this._dialogSpeedRestriction();
};

favoritesApp.prototype._dialogSpeedRestriction = function()
{
    if(framework.common.getAtSpeedValue())
    {       
        this._currentContextTemplate.dialog3Ctrl.setDisabled("button2", true); 
    }
    else
    {       
        this._currentContextTemplate.dialog3Ctrl.setDisabled("button2", false);
    } 
}

//SelectPosition Context
favoritesApp.prototype._contextInSelectPosition = function()
{  
 // Fill list with favorite items
 var payload = this._getContextPayload();
 if (payload)
 {
     
     if(payload.currentPosition === undefined || payload.currentPosition === null)
     {
        payload.currentPosition = 0;
     }
     this._currentPosition = payload.currentPosition;
     
     // A move-favorite operation is starting. Prepare part of the event data
     // that will be needed to finish the move.
     this._pendingMoveEventData = { payload: {
         favoritesTab: payload.favoritesTab,
         favId: payload.favId,
         oldPosition: payload.currentPosition,
         newPosition: null,  // NOTE: This is filled in when the user completes the move
     } };

     var data = {
       itemCountKnown: true,
       itemCount: 0,
       items: this._getFavoritesAsListItems(payload.favoritesTab)
     };
     data.itemCount = data.items.length;
     // Update context values
     log.info("_contextInSelectPosition :: data.itemCount "+data.itemCount)
     var context = this._contextTable["SelectPosition"];
     context.controlProperties.List2Ctrl.dataList = data;
     context.controlProperties.List2Ctrl.focussedItem = payload.currentPosition;
        
 }
};

favoritesApp.prototype._displayedFunctionSelectPosition = function(){
    log.debug("#Fav:_displayedFunctionSelectPosition");
};

//DeleteConfirmation Context
favoritesApp.prototype._readyDeleteConfirmation = function()
{
 var payload = this._getContextPayload();
 if (payload)
 {
     var fav = this._lookupFavorite(payload.favoritesTab, payload.favId);
     if(payload.favoritesTab === "Navigation" && payload.favId === 0){
        this._currentContextTemplate.dialog3Ctrl.setText1Id("deleteHomeConfirmation");
     }else{
        if (fav)
         {
             if(this._currentContextTemplate)
             this._currentContextTemplate.dialog3Ctrl.setText1Id("deleteConfirmation", { name: fav.name } );
         }
     }
 }
    this._dialogSpeedRestriction();
};

//readyFavoritesContactDetail Context
favoritesApp.prototype._readyFavoritesContactDetails = function()
{
 var payload = this._getContextPayload();
 if (payload)
 {
     this._requestGetFavoriteContactDetail(payload.favoriteId);
 }
};

//AddEditFavoritesComm Context
favoritesApp.prototype._readyAddEditFavoritesComm = function()
{
   log.debug("#Fav:readyAddEditFavoritesComm");
   this.isCommTitleReq = false ;
   this._addFavoritesCommItem(); 
};

//EditFavoritesComm Context
favoritesApp.prototype._readyEditFavoritesComm = function()
{
     log.debug("#Fav:_readyAddEditFavoritesComm");
     this.isCommTitleReq = true ;
     this._addFavoritesCommItem();
};

//SelectContactComm Context
favoritesApp.prototype._readySelectContactComm = function()
{
 // We never have a list coming into this context so call DBAPI to get some
 this._lazyOpenContactsDb(function() {

     if (this._isContactsDbOpen)
     {
         this._contactsIndex();
         this._sendRequestGetContactsComm(0);
     }
     else
     {
         log.warn("Unable to open contacts db");
     }

 }.bind(this));
};

favoritesApp.prototype._contactsIndex = function()
{
    var params = null ;
    if(this._currentContext.ctxtId == "SelectContactComm"){
        log.debug("[#Fav:_contactsIndex:requesting for GetContactsIndex using SelectContactComm]");
        params = {"deviceId":this._getPhoneDeviceId(), "sort":"OrderId","filter":"Calls"};//Earlier Sorting is Display_Name
    }else if(this._currentContext.ctxtId == "SelectContactNavi"){
        log.debug("[#Fav:_contactsIndex:requesting for GetContactsIndex using SelectContactNavi]");
        params = {"deviceId":this._getPhoneDeviceId(), "sort":"OrderId","filter":"Addresses"};//Earlier Sorting is Display_Name
    }
    framework.sendRequestToDbapi(this.uiaId, this._getContactsIndexCallbackFn.bind(this), "pb", "GetContactsIndex", params);
};

favoritesApp.prototype._getContactsIndexCallbackFn = function(msg)
{
    if (msg.msgContent.params.eCode === 0)
    {       
        log.debug("[#Fav:_getContactsIndexCallbackFn]");
        var currList = this._currentContextTemplate.list2Ctrl;
        var indexArray = [];
        this._indexList = new Array();
        this._indexList = msg.msgContent.params.indexList;
        this._indexCount = msg.msgContent.params.count;        
        for(var i=0; i <this._indexList.length; i++ )
        {
            log.debug("#Fav:_getContactsIndexCallbackFn:i::"+i+"::"+ this._indexList[i].index);
            indexArray[i] = {label : this._indexList[i].label,itemIndex : (-1 != this._indexList[i].index) ? this._indexList[i].index : -1 };  
            log.debug("#Fav:_getContactsIndexCallbackFn + 1"+ indexArray[i].itemIndex);
        }
        currList.setLetterIndexData(indexArray);
    };
};
//SelectContactNavi Context
favoritesApp.prototype._readySelectContactNavi = function()
{
  // We never have a list coming into this context so call DBAPI to get some
  this._lazyOpenContactsDb(function() {

  if (this._isContactsDbOpen)
  {
      this._contactsIndex();
      this._sendRequestGetContactsNavi(0);
  }
  else
  {
      log.warn("Unable to open contacts db");
  }
}.bind(this));
};

//AddEdit FavoritesComm ItemClick Callback
favoritesApp.prototype._addEditFavoritesCommItemCallback = function(controlRef, appData, params)
{
 switch (appData)
 {
     case "SelectAddContactFull":     // intentional fallthrough
     case "SelectAddContactNumber":   // intentional fallthrough
     case "SelectMove":               // intentional fallthrough
     case "SelectRename":             // intentional fallthrough
     case "SelectDelete":
         framework.sendEventToMmui(this.uiaId, appData);
         break;
     default:
         break;
 }
};

//Edit FavoritesComm ItemClick Callback
favoritesApp.prototype._editFavoritesCommItemCallback = function(controlRef, appData, params)
{
 switch (appData)
 { 
     case "SelectReplaceContactFull":        // intentional fallthrough
     case "SelectReplaceContactNumber":      // intentional fallthrough
     case "SelectEditMove":                  // intentional fallthrough
     case "SelectEditRename":                // intentional fallthrough
     case "SelectEditDelete":
         var context = this._getContextPayload();           
         if (context)
         {
             var data = { 
                 payload : {
                     favId: context.favId,
                     position: context.position
                 }
             };

             framework.sendEventToMmui(this.uiaId, appData, data);
         }
         break;
     default:
         break;
 }
};

/**************************
 * Message handlers
 **************************/

//Phone Status handler
favoritesApp.prototype._msgHandler_PhoneStatus = function(msg)
{
    if (msg && msg.params && msg.params.payload)
    {
        log.debug("#Fav:PhoneStatus MessageHandler");
        if(msg.params.payload.phoneStatus){
            this._isPhoneConnected = msg.params.payload.phoneStatus === "Connected";
         }
        if (this._isPhoneConnected)
        {
            this._phoneDeviceId = msg.params.payload.phoneDeviceID;
        }
        else
        {
            this._closeContactsDb();
            this._phoneDeviceId = -1;
        }
        this._isPhoneConnectedChanged();
    }else{
       log.debug("#Fav:wrong PhoneStatus payload received");
    }
};

//NaviSD Card Status handler
favoritesApp.prototype._msgHandler_NaviSdCardStatus = function(msg)
{
    if (msg && msg.params && msg.params.payload)
    {
        log.debug("#Fav:PhoneStatus NaviSDCardStatus");
        var payload = msg.params.payload;
        if(payload.naviSdStatus){
           this._prevSdCardStatus = this._isSdCardConnected;
           this._isSdCardConnected = payload.naviSdStatus === "Available";
           this._hasRequestedNaviState = true ;
           if(this._prevSdCardStatus != this._isSdCardConnected)
           {
                this._checkSDCardStatus = true;
           }
        }
        else{
           this._hasRequestedNaviState = false ;
         }
        this._isSdCardConnectedChanged();
    }else{
       log.debug("#Fav:wrong NaviSDCard payload received");
    }
};

 
favoritesApp.prototype._msgHandler_AudioStatusRadioPlay = function(msg)
{
    log.debug("#Fav:AudioStatusRadioPlay");
    if (msg.params.payload === null || msg.params.payload.radioPlay === "None")
    {
        this._cachedCurrentRadioStation = null;
        this._cachedPreviousRadioStation = null;
    }
    else
    {
        this._cachedPreviousRadioStation = this._cachedCurrentRadioStation;
        this._cachedCurrentRadioStation = msg.params.payload;
        this._cachedCurrentRadioStationChanged();
    }
    
};

//FavoriteAdded Message handler
favoritesApp.prototype._msgHandler_ResultFavoriteAdd = function(msg)
{
    log.debug("#Fav:FavoriteAdd Handler");
    var resultInfo = msg.params.payload.resultInfo;
    if (resultInfo.result === this._EnumSuccess)
    {
        if (resultInfo.favoritesTab === this._EnumTabRadio)
        {
            var newFav = {
                id   : resultInfo.favId,
                name : resultInfo.displayName,
                type : this._convertFromMMUIRadioType( resultInfo.radioType ),
            };
            this.isRadioFavAdded = true; 
            this._cachedRadioFavorites.push(newFav);
            this._cachedRadioFavoritesChanged();
        }
        else if (resultInfo.favoritesTab === this._EnumTabComm)
        {            
            var newFav = {
                id   : resultInfo.favId,
                name : resultInfo.displayName,
                type : this._convertFromMMUIContactType( resultInfo.contactType ),
            };
            this.isContactFavAdded = true;
            this._cachedCommFavorites.push(newFav);
            this._cachedCommFavoritesChanged();
        }
        else if (resultInfo.favoritesTab === this._EnumTabNavi)
        {
            var newFav = {
                id   : resultInfo.favId,
                name : resultInfo.displayName
            };
            this.isNaviFavAdded = true ; //navigation favorites is added
            log.debug("#Fav:Result Favorites Added::"+this.isNaviFavAdded);
            this._cachedNaviFavorites.push(newFav);
            this._favoritesTotalCount = this._favoritesTotalCount + 1;
            this._cachedNaviFavoritesChanged();
        }
    }else{
       log.debug("#Fav:Error with ResultFavoritesAdd");
    }
};

//FavoriteDelete Message handler
favoritesApp.prototype._msgHandler_ResultFavoriteDelete = function(msg)
{
    log.info("#Fav:FavoriteDelete Handler");
    var resultInfo = msg.params.payload.resultInfo;
    if (resultInfo.result === this._EnumSuccess)
    {
        if (resultInfo.favoritesTab === this._EnumTabRadio)
        {
            var index = this._indexOfFavorite(resultInfo.favoritesTab, resultInfo.favId);
            if (index !== -1)
            {
                this._cachedRadioFavorites.splice(index, 1);
                this._renumberRadioFavoriteIDs();
                this._cachedRadioFavoritesChanged();
            }
        }
        else if (resultInfo.favoritesTab === this._EnumTabComm)
        {
            var index = this._indexOfFavorite(resultInfo.favoritesTab, resultInfo.favId);
            if (index !== -1)
            {
                this._cachedCommFavorites.splice(index, 1);
                this._renumberCommFavoriteIDs();
                this._cachedCommFavoritesChanged();
            }
        }
        else if (resultInfo.favoritesTab === this._EnumTabNavi)
        {
            var index = this._indexOfFavorite(resultInfo.favoritesTab, resultInfo.favId);
            if (index !== -1)
            {
                this._cachedNaviFavorites.splice(index, 1);
                this._favoritesTotalCount = this._favoritesTotalCount - 1;
                this._cachedNaviFavoritesChanged();
            }
        }
    }else{
       log.debug("#Fav:Error with ResultFavoritesDelete");
    }
};

//FavoriteRename Message handler
favoritesApp.prototype._msgHandler_ResultFavoriteRename = function(msg)
{
    log.debug("#Fav:FavoritRename Handler");
    var resultInfo = msg.params.payload.resultInfo;
    if (resultInfo.result === this._EnumSuccess)
    {
        if (resultInfo.favoritesTab === this._EnumTabRadio)
        {
            var fav = this._lookupFavorite(resultInfo.favoritesTab, resultInfo.favId);
            if (fav)
            {
                fav.name = resultInfo.displayName;
                this._cachedRadioFavoritesChanged();
            }
        }
        else if (resultInfo.favoritesTab === this._EnumTabComm)
        {
            var fav = this._lookupFavorite(resultInfo.favoritesTab, resultInfo.favId);
            if (fav)
            {
                fav.name = resultInfo.displayName;
                this._cachedCommFavoritesChanged();
            }
        }
        else if (resultInfo.favoritesTab === this._EnumTabNavi)
        {
            var fav = this._lookupFavorite(resultInfo.favoritesTab, resultInfo.favId);
            if (fav)
            {
                fav.name = resultInfo.displayName;
                this._cachedNaviFavoritesChanged();
            }
        }
    }else{
       log.debug("#Fav:Error with ResultFavoritesRename");
    }
};

//FavoriteMove Message handler
favoritesApp.prototype._msgHandler_ResultFavoriteMove = function(msg)
{
    log.debug("#Fav:FavoriteMove Handler");
    var resultInfo = msg.params.payload.resultInfo;
    if (resultInfo.result === this._EnumSuccess)
    {
        if (resultInfo.favoritesTab === this._EnumTabRadio)
        {
            var index = this._indexOfFavorite(resultInfo.favoritesTab, resultInfo.favId);
            if (index !== -1)
            {
                // Split out the favorite then splice it back in at newPosition.
                var spliceAtIndex = this._cachedRadioFavorites.splice(index, 1)[0];
                this._cachedRadioFavorites.splice(msg.params.payload.newPosition, 0, spliceAtIndex);
                this._renumberRadioFavoriteIDs();
                this._cachedRadioFavoritesChanged();
            }
        }
        else if (resultInfo.favoritesTab === this._EnumTabComm)
        {
            var index = this._indexOfFavorite(resultInfo.favoritesTab, resultInfo.favId);
            if (index !== -1)
            {
                // Split out the favorite then splice it back in at newPosition.
                var spliceAtIndex = this._cachedCommFavorites.splice(index, 1)[0];
                this._cachedCommFavorites.splice(msg.params.payload.newPosition, 0, spliceAtIndex);
                this._renumberCommFavoriteIDs();
                this._cachedCommFavoritesChanged();
            }
        }
        else if (resultInfo.favoritesTab === this._EnumTabNavi)
        {
            var index = this._indexOfFavorite(resultInfo.favoritesTab, resultInfo.favId);
            if (index !== -1)
            {
                // Split out the favorite then splice it back at a newPosition.
                var spliceAtIndex = this._cachedNaviFavorites.splice(index, 1)[0];
                this._cachedNaviFavorites.splice(msg.params.payload.newPosition, 0, spliceAtIndex);
                this._cachedNaviFavoritesChanged();
            }    
        }
    }else{
       log.debug("#Fav:Error with ResultFavoritesMove");
    }
};

//FavoriteReplace Message handler
favoritesApp.prototype._msgHandler_ResultFavoriteReplace = function(msg)
{
    log.debug("#Fav:FavoriteReplace Handler");
    var resultInfo = msg.params.payload.resultInfo;
    if (resultInfo.result === this._EnumSuccess)
    {
        if (resultInfo.favoritesTab === this._EnumTabRadio)
        {
            var fav = this._lookupFavorite(resultInfo.favoritesTab, msg.params.payload.replaceFavId);
            if (fav)
            {
                fav.id = resultInfo.favId;
                fav.name = resultInfo.displayName;
                fav.type = this._convertFromMMUIRadioType( resultInfo.radioType );
                this._cachedRadioFavoritesChanged();
            }
        }
        else if (resultInfo.favoritesTab === this._EnumTabComm)
        {
            var fav = this._lookupFavorite(resultInfo.favoritesTab, msg.params.payload.replaceFavId);
            if (fav)
            {
                fav.id = resultInfo.favId;
                fav.name = resultInfo.displayName;
                fav.type = this._convertFromMMUIContactType( resultInfo.contactType ),
                this._cachedCommFavoritesChanged();
            }
        }
        else if (resultInfo.favoritesTab === this._EnumTabNavi)
        {
            var fav = this._lookupFavorite(resultInfo.favoritesTab, msg.params.payload.replaceFavId);
            if (fav)
            {
                fav.id = resultInfo.favId;
                fav.name = resultInfo.displayName;
                this._cachedNaviFavoritesChanged();
            }
        }
    }else{
       log.debug("#Fav:Error with ResultFavoritesReplace");
    }
};

//AtSpeed Message handler
favoritesApp.prototype._msgHandler_GlobalAtSpeed = function(msg)
{
    log.debug("#Fav:GlobalAtSpeed Handler");
    this._cachedAtSpeedChanged();
};

//NoSpeed Message handler
favoritesApp.prototype._msgHandler_GlobalNoSpeed = function(msg)
{
    log.debug("#Fav:GlobalAtNoSpeed Handler");
    this._cachedAtSpeedChanged();
};

//SBN Implt
favoritesApp.prototype._msgHandler_NoRadioFavListStatus = function(msg){
  log.debug("#Fav::SBN Called No Radio Favorites Available");
  framework.common.startTimedSbn(this.uiaId, "RadioFavoritesListStatus", "errorNotification" , {sbnStyle : "Style01",text1Id:"NoRadioFavorites", "imagePath1" : ""});
};

favoritesApp.prototype._msgHandler_ActiveFavId = function(msg)
{
	if(msg && msg.params && msg.params.payload && msg.params.payload.favId != null && msg.params.payload.favId != undefined
	&& msg.params.payload.favPlayStatus != null && msg.params.payload.favPlayStatus != undefined)
	{
		log.info("FavId " + msg.params.payload.favId+ " favPlayStatus "+msg.params.payload.favPlayStatus);
		this._cachedActiveFavId = msg.params.payload.favId;
		this._cachedFavPlayStatus = msg.params.payload.favPlayStatus;
		if(this._currentContext && this._currentContext.ctxtId === "FavoritesRadioTab" && this._currentContextTemplate)
		{
			if(this._cachedFavPlayStatus == true)
			{
				log.info("inside message handler. Requested index for fav id : this._cachedActiveFavId = " + this._cachedActiveFavId)
				var index = this._indexOfFavorite(this._EnumTabRadio,this._cachedActiveFavId);
				for(i=1;i <= this._currentContextTemplate.list2Ctrl.dataList.itemCount -1;i++)
				{
					this._currentContextTemplate.list2Ctrl.dataList.items[i].image2 = null;
				}
				this._currentContextTemplate.list2Ctrl.dataList.items[index+1].image2 = "common/images/icons/IcnListEntNowPlaying_En.png";
			}
		this._currentContextTemplate.list2Ctrl.updateItems(0,this._currentContextTemplate.list2Ctrl.dataList.itemCount -1);
		}
	}
};

/**************************
 * DBAPI / PhoneBook helpers*
 **************************/
//Opens the contacts database if it is not already open then invokes the callback function.
favoritesApp.prototype._lazyOpenContactsDb = function(callback)
{
    log.debug("#Fav:OpenContactDb Handler");
    if (this._isContactsDbOpen)
    {
        log.debug("#Fav:DB Open");
        callback();
    }
    else
    {
        if (this._isPhoneConnected)
        {
            var openCallbackFn = function(msg) {
                this._contactIdFreeList = [];
                this._dbSeqNo = [];
                this._isContactsDbOpen = msg.msgContent.params.eCode === 0;
                callback();
            };
            var params = {
                "deviceId" : this._getPhoneDeviceId(), 
            };

            framework.sendRequestToDbapi(this.uiaId, openCallbackFn.bind(this), "pb", "OpenContactsDb", params);
        }
        else
        {
            callback();
        }
    }
};

favoritesApp.prototype._closeContactsDb = function()
{
    if (this._isContactsDbOpen)
    {
        log.debug("::phoneDisconnected::ClosingContactDb() Called::");
        var params = {
            "deviceId" : this._getPhoneDeviceId(),
            "ctoType" : "ThumbnailImage",
            "contactObjects":[]
        };
        
        if(this._contactIdFreeList.length > 0){
           for(var i in this._contactIdFreeList){
              params.contactObjects.push({ 
                "contactId" : this._contactIdFreeList[i],
                "dbSeqNo"   : this._dbSeqNo[i]
            });
          }
        }
        framework.sendRequestToDbapi(this.uiaId, this._freeContactObjectCallbackFn.bind(this), "pb", "FreeContactObjectsByIds", params);

        var params = {
            "deviceId" : this._getPhoneDeviceId(),
        };
        framework.sendRequestToDbapi(this.uiaId,this._closeContactsDbCallbackFn.bind(this), "pb", "CloseContactsDb", params);
    }else{
        log.debug("::phoneDisconnected::ContactDb is closed::");
    }
};

favoritesApp.prototype._freeContactObjectCallbackFn = function(msg){
    log.debug("::FreeContactObjectsByIds called::");
    this._contactIdFreeList = [];
    this._dbSeqNo = [];
};

favoritesApp.prototype._closeContactsDbCallbackFn = function(msg){
    log.debug("::closeContactsDbCallbackFn called::");
    this._isContactsDbOpen = false;
};

/**************************
 * App SDK related code *
 **************************/
favoritesApp.prototype._getNextAppSdkParamsRequestId = function()
{
    var value = this._appSdkParamsRequestId;
    this._appSdkParamsRequestId += 1;
    return value;
};

favoritesApp.prototype._lazyRequestFavorites = function(favoritesTab)
{
    if (favoritesTab === this._EnumTabComm)
    {
        this._lazyRequestCommFavorites();
    }
    else if (favoritesTab === this._EnumTabRadio)
    {
        this._lazyRequestRadioFavorites();
    }
    else if (favoritesTab === this._EnumTabNavi)
    {
        this._lazyRequestNaviFavorites();
    }
};

favoritesApp.prototype._lazyRequestRadioFavorites = function()
{
    this._clearCachedCommFavorites();
    this._clearCachedNaviFavorites();
  //Checking context for FavoritesRadioTab
  if(this._currentContextTemplate){
      if(this._currentContext.ctxtId === this._ctxTabRadio){
        if (!this._hasRequestedRadioFavorites)
        {
          this._hasRequestedRadioFavorites = true;
          var params = { 
            "requestId" : this._getNextAppSdkParamsRequestId(),
            "deviceId": this._getPhoneDeviceId(),
            "category" : this._EnumGetFavListCategoryRadio, 
            "startIndex" : 0, 
            "maxItems" : 50 
         };
        framework.sendRequestToAppsdk(this.uiaId, this._handleAppSdkResponse.bind(this), "fav", "GetFavoriteList", params);
       }
     }
  }else{
        //Context Template is not Defined "Current context is SelectFavoriteToReplace" Outside the Favorites Scenario
          if(this._currentContext.ctxtId === "SelectFavoriteToReplace"){
              var params = { 
                      "requestId" : this._getNextAppSdkParamsRequestId(),
                      "deviceId": this._getPhoneDeviceId(),
                      "category" : this._EnumGetFavListCategoryRadio, 
                      "startIndex" : 0, 
                      "maxItems" : 50 
                 };
                 log.debug("lazyRequestRadioFavorites::Sending Request to APPSDK:GetFavoriteList") ;
                 framework.sendRequestToAppsdk(this.uiaId, this._handleAppSdkResponse.bind(this), "fav", "GetFavoriteList", params);
         }
      }
};
favoritesApp.prototype._lazyRequestCommFavorites = function()
{
    this._clearCachedRadioFavorites();
    this._clearCachedNaviFavorites();
  //Checking context for FavoritesCommTab
  if(this._currentContextTemplate){
      if(this._currentContext.ctxtId === this._ctxTabComm){   
        if (!this._hasRequestedCommFavorites)
        {
          this._hasRequestedCommFavorites = true;
          var params = { 
                "requestId" : this._getNextAppSdkParamsRequestId(),
                "deviceId": this._getPhoneDeviceId(),
                "category" : this._EnumGetFavListCategoryComm, 
                "startIndex" : 0, 
                "maxItems" : 50 
           };
           log.debug("lazyRequestCommFavorites::Sending Request to APPSDK:GetFavoriteList") ;
           framework.sendRequestToAppsdk(this.uiaId, this._handleAppSdkResponse.bind(this), "fav", "GetFavoriteList", params);
        }
      }
  }else{
    //Context Template is not Defined "Current context is SelectFavoriteToReplace" Outside the Favorites Scenario
      if(this._currentContext.ctxtId === "SelectFavoriteToReplace"){
          var params = { 
                  "requestId" : this._getNextAppSdkParamsRequestId(),
                  "deviceId": this._getPhoneDeviceId(),
                  "category" : this._EnumGetFavListCategoryComm, 
                  "startIndex" : 0, 
                  "maxItems" : 50 
             };
             log.debug("lazyRequestCommFavorites::Sending Request to APPSDK:GetFavoriteList") ;
             framework.sendRequestToAppsdk(this.uiaId, this._handleAppSdkResponse.bind(this), "fav", "GetFavoriteList", params);
     }
  }
};

favoritesApp.prototype._lazyRequestNaviFavorites = function()
{
    this._clearCachedRadioFavorites();
    this._clearCachedCommFavorites();
    //Checking context for FavoritesNaviTab
    if(this._currentContextTemplate){
         if(this._currentContext.ctxtId === this._ctxTabNavi)
         {
             if(this._isSdCardConnected)
             {
                // do initial items request
                var callBackForCount = this._GetAppSDKResponseForCountCallback.bind(this);
                framework.sendRequestToAppsdk(this.uiaId, callBackForCount, "navifav", "GetFavoritesCount");
                
                var callBackForList = this._GetAppSDKResponseForListCallback.bind(this);
                var offset = Math.max(this._contextTable['FavoritesNaviTab']['controlProperties']['List2Ctrl']['scrollTo'] - 10, 0);
                if(offset === null || isNaN(offset) || offset === undefined)
                {
                    offset = 0;
                }
                if (!this._hasRequestedNaviFavorites)
                  {
                    this._hasRequestedNaviFavorites = true;
                    var params = {
                      "StartIndex" : offset,
                      "MaxItems" : 20
                   };
                 this._cachedOffset = offset;
                framework.sendRequestToAppsdk(this.uiaId, callBackForList, "navifav", "GetFavoriteList", params);
             }
          }
         else
         {
            this._populateFavNaviTab();
         }
        }
   }
};

//AppSDK Response Handler for total count
favoritesApp.prototype._GetAppSDKResponseForCountCallback = function(response)
{
    if(response.msgType === "methodResponse"){
        if (response.serviceName === "navifav" && response.methodName === "GetFavoritesCount")
        {
            this._favoritesTotalCount = response.params.count;
        }
    }
}


favoritesApp.prototype._populateFavNaviSelectFav = function ()
{
    // extract data of interest
    var currList = this._currentContextTemplate.list2Ctrl;
    var currCtxtId = this._currentContext.ctxtId;
    var list = this._cachedNaviFavoritesFromAppSDK;
    var count = this._cachedNaviFavoritesCount;
    var totalCount = this._favoritesTotalCount;
    var offset = this._cachedSelectFavoriteIndex;
    var  dataList = null;
    // do we have a dataList, i.e. are first entering into this context
    if (!currList.hasDataList())
    {
        // the current list doesn't have a dataList -> set one
        dataList = {
            itemCountKnown : true,
            itemCount : totalCount,
            items : []
        }
    
        
        // are we not in the beginning?
        if (offset > 0)
        {
        
            // create empty datalist
            for (var i=0; i<totalCount; i++)
            {
                if(list[i-offset].id === 0)
                {
                    this._homeIdAvailable = true;
                     //this._favoritesTotalCount = this._favoritesTotalCount + 1;
                     //dataList.itemCount = dataList.itemCount + 1;
                    continue;
                }
               var imagePath = null;
            if (list[i-offset].name === "")
            {
                list[i-offset].text1 = " ";
            }
            imagePath = list[i-offset].image;
            //favorite tab is comm/navi
            if(imagePath === "" || imagePath === null || imagePath === " " || imagePath === undefined){
                log.debug("::ImagePath send by AppSdk is blank, calling default image::");
                imagePath = this._getIconForFavoriteType(this._EnumTabNavi);    
            }else{
                log.debug("::ImagePath successfully got from AppSdk::"+imagePath);
                imagePath = list[i-offset].image+"?"+unix ;
            }
                // and fill only the received items
                if (i>=offset && i<offset+count)
                {
                    
                    dataList.items[dataList.items.length] = { itemStyle:'style01', appData:list[i-offset].id, text1:list[i-offset].name, hasCaret:false,image1 : imagePath,itemBehavior:'shortAndLong'};
                }
                // otherwise add empty items (they will be requested as the user scrolls)
                else
                {
                    dataList.items[dataList.items.length] = { itemStyle:'style01', appData:1, text1:'', hasCaret:false};
                }

            }
        }

        // nope, we are in the beginning
        else
        {
            // fil the first <count> elements
            log.debug("_populateFavNaviSelectFav :: offset "+ offset + "lenght of List :: "+list.length);
            for (var i=0; i<count; i++)
            {
                if(list[i].id === 0)
                {
                    this._homeIdAvailable = true;
                    continue;
                }
                var imagePath = null;
                if (list[i].name === "")
                {
                    list[i].text1 = " ";
                }
                imagePath = list[i].image;
                //favorite tab is comm/navi
                if(imagePath === "" || imagePath === null || imagePath === " " || imagePath === undefined){
                    log.debug("::ImagePath send by AppSdk is blank, calling default image::");
                    imagePath = this._getIconForFavoriteType(this._EnumTabNavi);    
                }else{
                    log.debug("::ImagePath successfully got from AppSdk::"+imagePath);
                    imagePath =  list[i].image+"?"+unix ;
                }
                dataList.items[dataList.items.length] = { itemStyle:'style01', appData:list[i].id, text1:list[i].name, hasCaret:false,image1 : imagePath,itemBehavior:'shortAndLong'};
            }
        }
        
        if(this._isSdCardConnected){
            dataList.items[0].disabled = false ;
            dataList.items[1].disabled = false ;
            //New Updated for Speed Restriction accrd to UI Spec SCR SW00129389 for Navigation Tab
            if (this._isSdCardConnected){
                if(framework.common.getAtSpeedValue()){
                    dataList.items[0].disabled = true ; 
                }else{
                    dataList.items[0].disabled = false ;
                }
            }
           }else{
            dataList.items[0].disabled = true ;
            dataList.items[1].disabled = true ;
       }
        
        // set datalist and update everything
        currList.setDataList(dataList);
        currList.updateItems(0, dataList.itemCount-1);
        currList.topItem = this._contextTable[currCtxtId]['controlProperties']['List2Ctrl']['scrollTo'];
        currList.focussedItem = 0;
        
        log.debug("this._currentPosition : "+this._currentPosition);
    }

    // we have a datalist -> just update the received items
    else
    {
       // update the new items
        
        log.info("_populateFavNaviSelectFav :: offset "+ offset + "count "+ count);

        for (var i=offset; i<offset+count; i++)
        {
            if(list[i-offset].id === 0)
            {
                this._homeIdAvailable = true;
                continue;
            }
            
            var imagePath = null;
            if (list[i-offset].name === "")
            {
                list[i-offset].text1 = " ";
            }
            imagePath = list[i-offset].image;
            //favorite tab is comm/navi
            if(imagePath === "" || imagePath === null || imagePath === " " || imagePath === undefined){
                log.debug("::ImagePath send by AppSdk is blank, calling default image::");
                imagePath = this._getIconForFavoriteType(this._EnumTabNavi);    
            }else{
                log.debug("::ImagePath successfully got from AppSdk::"+imagePath);
                imagePath =  list[i-offset].image+"?"+unix ;
            }
            
             if(this.isHomeSet)
            {
                currList.dataList.items[i-1] = { itemStyle:'style01', appData:list[i-offset].id, text1:list[i-offset].name, hasCaret:false,image1 : imagePath,itemBehavior:'shortAndLong'};
            }
            else {
                currList.dataList.items[i] = { itemStyle:'style01', appData:list[i-offset].id, text1:list[i-offset].name, hasCaret:false,image1 : imagePath,itemBehavior:'shortAndLong'};
            }
        }
         if(this.isHomeSet)
        {
            var int1 = offset-1;
            var int2 = offset+count-2;
            log.info('updateItems(offset-1, (offset+count)-2);' + '(' + int1 + ',' + int2 + ');');
            currList.updateItems(offset-1, (offset+count)-2);
        }
        else 
        {
            var int1 = offset;
            var int2 = offset+count-1;
            log.info('updateItems(offset, (offset+count)-1);' + ' ( ' + int1 + ' , ' + int2 + ' ); ');
            currList.updateItems(offset, (offset+count)-1);
        }
        dataList = currList.dataList;
    }
    if(this.isHomeSet)
    {
        this._cachedNaviFavorites[0] = { id : 0,name: "Home", image : ""};
        for(var i = 0;i< dataList.items.length;i++)
       {
            this._cachedNaviFavorites[i+1] = { id : dataList.items[i].appData,name: dataList.items[i].text1, image : dataList.items[i].image1}
       }
   }
   else
   {
        for(var i = 0;i< dataList.items.length;i++)
       {
            
            this._cachedNaviFavorites[i] = { id : dataList.items[i].appData,name: dataList.items[i].text1, image : dataList.items[i].image1}
       }
   }
    this._homeIdAvailable = false;
    this._updateDone = true;
    return dataList;
    
}

favoritesApp.prototype._populateFavNaviTab = function ()
{
    // extract data of interest
    var currList = this._currentContextTemplate.list2Ctrl;
    var currCtxtId = this._currentContext.ctxtId;
    var list = this._cachedNaviFavoritesFromAppSDK;
    var count = this._cachedNaviFavoritesCount;
    var totalCount = this._favoritesTotalCount;
    var offset = this._cachedOffset;
    var dataList = null;
    var output = '';
    
    // do we have a dataList, i.e. are first entering into this context
    if (!currList.hasDataList())
    {
        // the current list doesn't have a dataList -> set one
        dataList = {
            itemCountKnown : true,
            itemCount : 2,
            items : []
        }

        dataList.items[0] = {
                appData : "SelectAddEditFavorite",
                text1Id : "addEditNaviFavorite",
                selected : false,
                disabled : false,
                toggled : 0,
                itemStyle : "style01",
                hasCaret : false
            }
        dataList.items[1] = {
                appData : "SelectHome",
                text1Id : "Home",
                itemStyle : "style01",
                hasCaret : false,
                itemBehavior:'shortAndLong'
            };
        //Enable/Disable first 2 items.
        if(!this._isSdCardConnected)
        {
            dataList.items[0].disabled = true ;
            dataList.items[1].disabled = true ;
        } 
        else 
        {
            dataList.items[0].disabled = false ;
            dataList.items[1].disabled = false ;
            //New Updated for Speed Restriction accrd to UI Spec SCR SW00129389 for Navigation Tab
            if(framework.common.getAtSpeedValue())
            {
                dataList.items[0].disabled = true ; 
            }
            /*
                Update the list items now
            */
            //Log the items
            dataList.itemCount += totalCount;
            // are we not in the beginning?
            if (offset > 0)
            {
                // create empty datalist
                for (var i=0; i<totalCount; i++)
                {
                    if(list[i-offset].id === 0)
                    {
                        this._homeIdAvailable = true;
                         //this._favoritesTotalCount = this._favoritesTotalCount + 1;
                        // dataList.itemCount = dataList.itemCount - 1;
                        continue;
                    }
                    var imagePath = null;
                    if (list[i-offset].name === "")
                    {
                        list[i-offset].text1 = " ";
                    }
                    imagePath = list[i-offset].image;
                    //favorite tab is comm/navi
                    if(imagePath === "" || imagePath === null || imagePath === " " || imagePath === undefined)
                    {
                        log.debug("::ImagePath send by AppSdk is blank, calling default image::");
                        imagePath = this._getIconForFavoriteType(this._EnumTabNavi);    
                    }
                    else
                    {
                        log.debug("::ImagePath successfully got from AppSdk::"+imagePath);
                        imagePath = list[i-offset].image+"?"+unix ;
                    }
                    // and fill only the received items
                    if (i>=offset && i<offset+count)
                    {
                        dataList.items[dataList.items.length] = { itemStyle:'style01', appData:list[i-offset].id, text1:list[i-offset].name, hasCaret:false,image1 : imagePath,itemBehavior:'shortAndLong'};
                    }
                    // otherwise add empty items (they will be requested as the user scrolls)
                    else
                    {
                        dataList.items[dataList.items.length] = { itemStyle:'style01', appData:1, text1:'', hasCaret:false};
                    }
                }
            }
            // nope, we are in the beginning
            else
            {
                // fil the first <count> elements
                for (var i=0; i<count; i++)
                {
                    if(list[i].id === 0)
                    {
                        this._homeIdAvailable = true;
                        //this._favoritesTotalCount = this._favoritesTotalCount + 1;
                        //dataList.itemCount = dataList.itemCount - 1;
                        continue;
                    }
                    var imagePath = null;
                    if (list[i].name === "")
                    {
                        list[i].text1 = " ";
                    }
                    imagePath = list[i].image;
                    //favorite tab is comm/navi
                    if(imagePath === "" || imagePath === null || imagePath === " " || imagePath === undefined)
                    {
                        log.debug("::ImagePath send by AppSdk is blank, calling default image::");
                        imagePath = this._getIconForFavoriteType(this._EnumTabNavi);    
                    }
                    else
                    {
                        log.debug("::ImagePath successfully got from AppSdk::"+imagePath);
                        imagePath =  list[i].image+"?"+unix ;
                    }
                    dataList.items[dataList.items.length] = { itemStyle:'style01', appData:list[i].id, text1:list[i].name, hasCaret:false,image1 : imagePath,itemBehavior:'shortAndLong'};
                }
            }
        }

        // set datalist and update everything
        currList.setDataList(dataList);
        currList.updateItems(0, dataList.itemCount-1);
        currList.topItem = this._contextTable[currCtxtId]['controlProperties']['List2Ctrl']['scrollTo'];
        currList.focussedItem = 0;
    }

    // we have a datalist -> just update the received items.
    //will not be executed for the first call.
    else
    {
       // update the new items
        for (var i=offset; i<offset+count; i++)
        {
            if(list[i-offset].id === 0)
            {
                this._homeIdAvailable = true;
                //this._favoritesTotalCount = this._favoritesTotalCount + 1;
                //currList.dataList.itemCount = currList.dataList.itemCount - 1;
                continue;
            }
            
            var imagePath = null;
            if (list[i-offset].name === "")
            {
                list[i-offset].text1 = " ";
            }
            imagePath = list[i-offset].image;
            //favorite tab is comm/navi
            if(imagePath === "" || imagePath === null || imagePath === " " || imagePath === undefined)
            {
                log.debug("::ImagePath send by AppSdk is blank, calling default image::");
                imagePath = this._getIconForFavoriteType(this._EnumTabNavi);    
            }
            else
            {
                log.debug("::ImagePath successfully got from AppSdk::"+imagePath);
                imagePath =  list[i-offset].image+"?"+unix ;
            }
             if(this._homeIdAvailable)
            {
                //currList.dataList.items[i] = { itemStyle:'style01', appData:list[i-offset].id, text1:list[i-offset].name, hasCaret:false,image1 : imagePath,itemBehavior:'shortAndLong'};
            }
            else
            {
                //currList.dataList.items[i+1] = { itemStyle:'style01', appData:list[i-offset].id, text1:list[i-offset].name, hasCaret:false,image1 : imagePath,itemBehavior:'shortAndLong'};
            }
            currList.dataList.items[i+1] = { itemStyle:'style01', appData:list[i-offset].id, text1:list[i-offset].name, hasCaret:false,image1 : imagePath,itemBehavior:'shortAndLong'};
        }
        if(this._homeIdAvailable)
        {
            //currList.updateItems(offset, (offset+count)-1);
            //currList.dataList.items[i+1] = { itemStyle:'style01', appData:list[i-offset].id, text1:list[i-offset].name, hasCaret:false,image1 : imagePath,itemBehavior:'shortAndLong'};
        }
        else
        {
            //currList.updateItems(offset+1, (offset+count));
            //currList.dataList.items[i+2] = { itemStyle:'style01', appData:list[i-offset].id, text1:list[i-offset].name, hasCaret:false,image1 : imagePath,itemBehavior:'shortAndLong'};
        }
        currList.updateItems(offset+1, (offset+count));
        dataList = currList.dataList;
    }
    if(this._homeIdAvailable)
    {
        this._cachedNaviFavorites[0] = { id : 0,name: "Home", image : ""};
        for(var i = 0;i< dataList.items.length-2;i++)
        {
            this._cachedNaviFavorites[i+1] = { id : dataList.items[i+2].appData,name: dataList.items[i+2].text1, image : dataList.items[i+2].image1}
        }
    }
    else
    {
        for(var i = 0;i< dataList.items.length-2;i++)
        {
            this._cachedNaviFavorites[i] = { id : dataList.items[i+2].appData,name: dataList.items[i+2].text1, image : dataList.items[i+2].image1}
        }
    }
    return dataList;
}

//AppSDK Response Handler for total count
favoritesApp.prototype._GetFavoritesItemsCallback = function(response)
{
    if(response.msgType === "methodResponse"){
        log.info("msgType:methodResponse from Appsdk");
        if (response.serviceName === "navifav" && response.methodName === "GetFavoriteList")
        {
            this._cachedNaviFavoritesFromAppSDK = response.params.FavoriteList.favoriteList;
            this._cachedNaviFavoritesCount = response.params.FavoriteList.count ; 
            //this._blockNeedDataCallback = false;
            this._populateFavNaviSelectFav();
        }
    }
}

//AppSDK Response Handler for total count
favoritesApp.prototype._GetAppSDKResponseForListCallback = function(response)
{
    //Adding condition for appsdk response
    if(response.msgType === "methodResponse"){
        log.debug("msgType:methodResponse from Appsdk");
        if (response.serviceName === "navifav" && response.methodName === "GetFavoriteList")
        {
            this._cachedNaviFavoritesFromAppSDK = response.params.FavoriteList.favoriteList;
            this._cachedNaviFavoritesCount = response.params.FavoriteList.count ; 
            this._populateFavNaviTab();
        }
        
    }else if (response.msgType === "methodErrorResponse"){
        if (response.serviceName === "fav" && response.methodName === "GetFavoriteContactDetail")
        {
           this._contextTable["FavoritesContactDetails"].controlProperties.List2Ctrl.loadingOverlayEnabled = false;
           this._contextTable["FavoritesContactDetails"].controlProperties.List2Ctrl.hideLoadingOverlayTimeout = 0 ;
           this._currentContextTemplate.list2Ctrl.setLoading(false);
        }
    log.debug("msgType:methodErrorResponse from Appsdk");
    }
}

favoritesApp.prototype._requestGetFavoriteContactDetail = function(favId)
{
    var params = {
        "requestId": this._getNextAppSdkParamsRequestId(), 
        "deviceId": this._getPhoneDeviceId(),
        "favId": favId, 
    };
    framework.sendRequestToAppsdk(this.uiaId, this._handleAppSdkResponse.bind(this), "fav", "GetFavoriteContactDetail", params);
};

//AppSDK Response Handler
favoritesApp.prototype._handleAppSdkResponse = function(response)
{
    //Adding condition for appsdk response
    if(response.msgType === "methodResponse"){
        if (response.serviceName === "navifav" && response.methodName === "GetFavoriteList")
        {
            this._cachedNaviFavorites = response.params.FavoriteList.favoriteList;
            this._cachedNaviFavoritesCount = response.params.FavoriteList.count ; 
            this._cachedNaviFavoritesChanged();            
        }
        else if (response.serviceName === "fav" && response.methodName === "GetFavoriteList")
        {
            if (response.params.favList && response.params.favList.arr_fav)
            {
                //category 0 for radio 1 for comm
                if (response.params.return_category === this._EnumGetFavListCategoryRadio)
                {
                    this._cachedRadioFavorites = response.params.favList.arr_fav;
                    this._cachedRadioFavoritesChanged();
                }
                else if (response.params.return_category === this._EnumGetFavListCategoryComm)
                {
                    this._cachedCommFavorites = response.params.favList.arr_fav;
                    this._cachedCommFavoritesChanged();
                }
            }
        }
        else if (response.serviceName === "fav" && response.methodName === "GetFavoriteContactDetail")
        {
            this._fillFavoritesContactDetails(response.params);
        }
    }else if (response.msgType === "methodErrorResponse"){
        if (response.serviceName === "fav" && response.methodName === "GetFavoriteContactDetail")
        {
           this._contextTable["FavoritesContactDetails"].controlProperties.List2Ctrl.loadingOverlayEnabled = false;
           this._contextTable["FavoritesContactDetails"].controlProperties.List2Ctrl.hideLoadingOverlayTimeout = 0 ;
           this._currentContextTemplate.list2Ctrl.setLoading(false);
        }
    log.debug("msgType:methodErrorResponse from Appsdk");
    }
};

//Clearing the Flag for appsdk call for Radio
favoritesApp.prototype._clearCachedRadioFavorites = function()
{
    this._cachedRadioFavorites = [];
    this._hasRequestedRadioFavorites = false;
};

//Clearing the Flag for appsdk call for Comm
favoritesApp.prototype._clearCachedCommFavorites = function()
{
    this._cachedCommFavorites = [];
    this._hasRequestedCommFavorites = false;
};

//Clearing the Flag for appsdk call for Navi
favoritesApp.prototype._clearCachedNaviFavorites = function()
{
    this._cachedNaviFavorites = [];
    this._cachedNaviFavoritesCount = 0 ;
    this._hasRequestedNaviFavorites = false;
};

//Converts a MMUI UIA_FAVORITES_RadioType to the enum numbers found
//in the data returned by AppSDK.
favoritesApp.prototype._convertFromMMUIRadioType = function(radioType)
{
  switch (radioType)
  {
    case "AM":
      return this._EnumFavTypeAM;
    break;
    
    case "FM":
     return this._EnumFavTypeFM;
    break;

    case "DAB":
     return this._EnumFavTypeDAB;
    break;
    
    case "SAT":
      return this._EnumFavTypeSAT;
     break;
 
    default:
      return null;
    break;
  }
};

//Converts a MMUI UIA_FAVORITES_ContactType_t to the enum numbers found
//in the data returned by AppSDK.
favoritesApp.prototype._convertFromMMUIContactType = function(contactType)
{
switch (contactType)
{
 case "FullContact":
     return this._EnumFavTypeContact;
     break;

 case "PhoneNumber":
     return this._EnumFavTypePhone;
     break;

 default:
     return "";
     break;
}
};

//The favorite ID is nothing more than a 1-based index into BLM"s array of favorites, it is
//not a stable reference like a primary key. Therefore the ID values for all favorites 
//could change after a move or delete operation. The solution is to renumber the "IDs".
favoritesApp.prototype._renumberRadioFavoriteIDs = function()
{
for (var i = 0; i < this._cachedRadioFavorites.length; i++)
{
    this._cachedRadioFavorites[i].id = i + 1;
}
};

//The favorite ID is nothing more than a 1-based index into BLM"s array of favorites, it is
//not a stable reference like a primary key. Therefore the ID values for all favorites 
//could change after a move or delete operation. The solution is to renumber the "IDs".
favoritesApp.prototype._renumberCommFavoriteIDs = function()
{
for (var i = 0; i < this._cachedCommFavorites.length; i++)
{
    this._cachedCommFavorites[i].id = i + 1;
}
};

/**************************
 *Utility functions
 **************************/
//Get the List2Ctrl in the current ListTmplt or List2Tmplt context.
favoritesApp.prototype._getCurrentContextListCtrl = function() 
{
    var list2Ctrl = null;
    if (this._currentContextTemplate)   
    {
        if (typeof this._currentContextTemplate.list2Ctrl !== "undefined")
        {
            list2Ctrl = this._currentContextTemplate.list2Ctrl;
        }
    }
    return list2Ctrl;
};

favoritesApp.prototype._getSelectFavoriteListSelectionValue = function(favoritesTab, favId)
{
    var fav = this._lookupFavorite(favoritesTab, favId);
    if (fav !== null)
    {
        if (favoritesTab === this._EnumTabComm)
        {
            if (fav.type === this._EnumFavTypeContact)
            {
                return "CommContact";
            }
            else if (fav.type === this._EnumFavTypePhone)
            {
                return "CommPhone";
            }
        }
        else if (favoritesTab === this._EnumTabRadio)
        {
            if (fav.type === this._EnumFavTypeAM)
            {
                return "RadioAM";
            }
            else if (fav.type === this._EnumFavTypeFM)
            {
                return "RadioFM";
            }
            else if (fav.type === this._EnumFavTypeDAB)
            {
                return "RadioDAB";
            }
            else if (fav.type === this._EnumFavTypeSAT)
            {
                return "RadioSAT";
            }
        }
        else if (favoritesTab === this._EnumTabNavi)
        {
            return "Navi";
        }
    }
    return "Other";
};

//Given a favoritesTab and favorite type, this returns the icon used to display the favorite item.
favoritesApp.prototype._getIconForFavoriteType = function(favoritesTab, type)
{
    if (favoritesTab === this._EnumTabComm)
    {
        if (type === this._EnumFavTypeContact)
        {
            return "common/images/icons/IcnListContact_Placeholder.png";
        }
        else if (type === this._EnumFavTypePhone)
        {
            return "common/images/icons/IcnListPhone_En.png";
        }
    }
    else if (favoritesTab === this._EnumTabRadio)
    {
        // Also handle MMUI radio type strings here.
        if (type === this._EnumFavTypeAM || type === "AM")
        {
            return "common/images/icons/IcnListAm_En.png";
        }
        else if (type === this._EnumFavTypeFM || type === "FM")
        {
            return "common/images/icons/IcnListFm_En.png";
        }
        else if (type === this._EnumFavTypeDAB || type === "DAB")
        {
            return "common/images/icons/IcnListDab_En.png";
        }
        else if (type === this._EnumFavTypeSAT || type === "SAT")
        {
            return "common/images/icons/IcnListXm_En.png";
        }
    }
    else if (favoritesTab === this._EnumTabNavi)
    {
        // Always the same icon for navigation favorites
        return "common/images/icons/IcnListNavPoi_En.png";
    }

   return "";
};

favoritesApp.prototype._getContextPayload = function()
{
    if (this._currentContext.params && this._currentContext.params.payload)
    {
        return this._currentContext.params.payload;
    }
    return null;
};

// Returns the cached favorite object with the given id or null if not found.
favoritesApp.prototype._lookupFavorite = function(favoritesTab, favId)
{
    
    log.info(" insde _lookupFavorite  "+favId);
    var cached = null;
    if (favoritesTab === this._EnumTabComm)
    {
        cached = this._cachedCommFavorites;
    }
    else if (favoritesTab === this._EnumTabRadio)
    {
        cached = this._cachedRadioFavorites;
    }
    else if (favoritesTab === this._EnumTabNavi)
    {
        cached = this._cachedNaviFavorites;
    }

    if (cached)
    {
        for (var i = 0; i < cached.length; i += 1)
        {
            if (cached[i].id === favId)
            {
                log.info("Return :: "+cached[i].id);
                return cached[i];
            }
        }
    }
    return null;
};

//Returns the index of the given favorite or -1 if not found.
favoritesApp.prototype._indexOfFavorite = function(favoritesTab, favId)
{
    var cached = null;
    if (favoritesTab === this._EnumTabComm)
    {
        cached = this._cachedCommFavorites;
    }
    else if (favoritesTab === this._EnumTabRadio)
    {
        cached = this._cachedRadioFavorites;
    }
    else if (favoritesTab === this._EnumTabNavi)
    {
        cached = this._cachedNaviFavorites;
    }
	log.info("favId :" + favId);
    if (cached)
    {
        for (var i = 0; i < cached.length; i += 1)
        {
			log.info("i , cached[i].id, " + i + cached[i].id);
            if (cached[i].id === favId)
            {
				log.info("Returning i :" + i);
                return i;
            }
        }
    }
    return -1;
};

// Returns an array of favorites suitable to use as items in List2Ctrl data. 
// The second parameter "itemBehavior" is optional and defaults to "shortPressOnly"
favoritesApp.prototype._getFavoritesAsListItems = function(favoritesTab, itemBehavior)
{
    if (itemBehavior == null || typeof itemBehavior === "undefined")
    {
        itemBehavior = "shortPressOnly";
    }

    var cached = null;
    if (favoritesTab === this._EnumTabComm)
    {
        cached = this._cachedCommFavorites;
    }
    else if (favoritesTab === this._EnumTabRadio)
    {
        cached = this._cachedRadioFavorites;
    }
    else if (favoritesTab === this._EnumTabNavi)
    {
        cached = this._cachedNaviFavorites;
        this._checkSetHomeStatus();
    }
    var items = [];
    //checking the image path sended by appsdk 
    var imagePath = null ;
    var unix = Math.round(+new Date()/1000);
    if (cached)
    {
        for (var i = 0; i < cached.length; i += 1)
        {
            //Below Condition is used to check the Home in Item List  
            if(i === this.idPosition && favoritesTab === this._EnumTabNavi && this.idPosition != null){
                continue; // Skip the addition of Home in item List
            }else{            
                    var item = {
                        appData : cached[i].id,
                        text1 : cached[i].name,
                        itemStyle : "style02",
                        image1 : null,
                        hasCaret : false,
                        itemBehavior : itemBehavior,
                    };
                    if (item.text1 === "" && (favoritesTab !== this._EnumTabNavi))
                    {
                        item.text1 = " ";
                    }
                    imagePath = cached[i].image;             
                    log.debug("imagePath from Appsdk::"+ imagePath);
                    if(favoritesTab === this._EnumTabRadio){
                        log.debug("FavoriteTab is Radio::calling default imagePath");
                        item.image1 = this._getIconForFavoriteType(favoritesTab, cached[i].type);
                    }else
                    {
                        //favorite tab is comm/navi
                        if(imagePath === "" || imagePath === null || imagePath === " " || imagePath === undefined){
                            log.debug("::ImagePath send by AppSdk is blank, calling default image::");
                            if(item.text1 && (favoritesTab === this._EnumTabNavi || favoritesTab === this._EnumTabComm))
                            item.image1 = this._getIconForFavoriteType(favoritesTab, cached[i].type);    
                        }else{
                            log.debug("::ImagePath successfully got from AppSdk::"+imagePath);
                            item.image1 = cached[i].image+"?"+unix ;
                        }
                    }            
                    items.push(item); 
                }
        }
    }
    return items;
};

favoritesApp.prototype._checkSetHomeStatus = function(){
    //Checking for NaviFavoritesItem Count
     log.debug("#Fav_checkSetHomeStatus:this._cachedNaviFavoritesCount::"+this._cachedNaviFavoritesCount);
    if(this._cachedNaviFavoritesCount === 0)
    {
         log.debug("::In FavoritesNaviTab this._cachedNaviFavoritesCount is 0 resetting flag");
         this.idPosition = null ;
         this.isHomeSet = false ;
    }
    else
    {
        log.debug("::In FavoritesNaviTab this._cachedNaviFavoritesCount is not 0 checking for home set");

        this._homeIdAvailable = false;
        for(var i = 0; i < this._cachedNaviFavorites.length; i++){
            if(this._cachedNaviFavorites[i].id === undefined){
                log.debug("In FavoritesNaviTab this._cachedNaviFavorites[i].id is undefined "+i);
            }else{
                log.debug("In FavoritesNaviTab this._cachedNaviFavorites[i].id is defined"+i);
            }
            if(this._cachedNaviFavorites[i].id === 0 && this._cachedNaviFavorites[i].id !== undefined){
                this.idPosition = i; 
                log.debug("Home is set::enable the Delete Home Button::IdPosition is::"+this.idPosition +"   "+i);
                this.isHomeSet = true ;
                break;
            }else{
                this.idPosition = null ;
                log.debug("Home is not set::disable the Delete Home Button::idPosition is"+this.idPosition +"   "+i);
                this.isHomeSet = false ;
            }
        }
    }
};

//Call this function when the cached radio favorites data has changed.
//This function will determine if the current context displays radio
//favorites and if so it will update the list data in the current context.
favoritesApp.prototype._cachedRadioFavoritesChanged = function()
{
 if (this._currentContext && this._currentContextTemplate)
 {
     if (this._currentContext.ctxtId === "FavoritesRadioTab")
     {
         var data = this._getFavoritesRadioTabListData();  
         this._updateCurrentContextListData(data);
		 
		 //This code adds the current playing icon to the active station
		log.info("favid : "+this._cachedActiveFavId+ " favstatus : "+this._cachedFavPlayStatus);
		if(this._cachedFavPlayStatus == true)
		{
			log.info("inside _cachedRadioFavoritesChanged. Requested index for fav id : this._cachedActiveFavId = " + this._cachedActiveFavId)
			var index = this._indexOfFavorite(this._EnumTabRadio,this._cachedActiveFavId );
			log.info("index"+index);
			for(i=1;i <= this._currentContextTemplate.list2Ctrl.dataList.itemCount -1;i++)
			{
				this._currentContextTemplate.list2Ctrl.dataList.items[i].image2 = null;
			}
			this._currentContextTemplate.list2Ctrl.dataList.items[index+1].image2 = "common/images/icons/IcnListEntNowPlaying_En.png";
			log.info("image "+this._currentContextTemplate.list2Ctrl.dataList.items[index+1].image2);
		}
		this._currentContextTemplate.list2Ctrl.updateItems(0,this._currentContextTemplate.list2Ctrl.dataList.itemCount -1);
     }
     else
     {
         var payload = this._getContextPayload();
         if (payload && payload.favoritesTab === this._EnumTabRadio)
         {
             this._updateSelectFavActionContext();
         }
     }
 }
};

//Call this function when the cached comm favorites data has changed.
//This function will determine if the current context displays comm
//favorites and if so it will update the list data in the current context.
favoritesApp.prototype._cachedCommFavoritesChanged = function()
{
 if (this._currentContext && this._currentContextTemplate)
 {
     if (this._currentContext.ctxtId === this._ctxTabComm)
     {
         var data = this._getFavoritesCommTabListData();
         for(var i = 0 ;i < data.itemCount; i++){
           //phone is disconnected disable all data
           if(this._isPhoneConnected){
             log.debug("phone is conn enabling list");
             data.items[i].disabled = false ;
             // New Implt for Speed Restriction for SCR: SW00129389
             if(framework.common.getAtSpeedValue()){
                data.items[0].disabled = true ; 
             }else{
                data.items[0].disabled = false ;
             }
           }else{
             log.debug("phone is disconn disabling list");
             data.items[i].disabled = true ;
           }
         }
         this._updateCurrentContextListData(data);
     }
     else
     {
         var payload = this._getContextPayload();
         if (payload && payload.favoritesTab === this._EnumTabComm)
         {
             this._updateSelectFavActionContext();
         }
     }
 }
};

//Call this function when the cached navi favorites data has changed.
//This function will determine if the current context displays comm
//favorites and if so it will update the list data in the current context.
favoritesApp.prototype._cachedNaviFavoritesChanged = function()
{
 if (this._currentContext && this._currentContextTemplate)
 {
     if (this._currentContext.ctxtId === "FavoritesNaviTab")
     {
         var data = this._getFavoritesNaviTabListData();
         for(var i = 0 ;i < data.items.length; i++){
             //SD Card is removed disable all data
             if(this._isSdCardConnected){
             
            if(data.items[i])
            {
                data.items[i].disabled = false ; 
            }
            //New Updated for Speed Restriction accrd to UI Spec SCR SW00129389 for Navigation Tab
           if (this._isSdCardConnected){
               if(framework.common.getAtSpeedValue()){
                  data.items[0].disabled = true ; 
               }else{
                  data.items[0].disabled = false ;
               }
           }
        }
        else{
          if(data.items[i])
               data.items[i].disabled = true ;
             }
         }
         this._updateCurrentContextListData(data);

         // Check for context payload and scroll to the updated favorite.
         // This only has to be done for FavoritesNaviTab because this tab
         // *always* fetches a new array of favorites from AppSDK (due to NNG"s
         // ability to add a favorite within the NNG app there is no notification to GUI favorites
         // so a cached array of favorites is assumed invalid in this context).
         
     //FavoritesNavigation is added
     if(this.isNaviFavAdded){
         this.isNaviFavAdded = false;
         var payload = this._getContextPayload();
         if (payload && typeof payload.updatedFavId === "number")
         {
            var index = this._indexOfFavorite(this._EnumTabNavi, payload.updatedFavId);
            if (index !== -1)
             {
             var list2Ctrl = this._getCurrentContextListCtrl();
             if (list2Ctrl) 
             {
                 var indexItem = (index + 1) ;
                 list2Ctrl.topItem = indexItem;
                 log.info("#Fav:_cachedNaviFavoritesChanged::List item added topItem index is::"+indexItem);
                 setTimeout(function() {
                     lis2tCtrl.focussedItem = indexItem; 
                 }, 10);                
              }
            }
          }
     }else{
            log.info("Navigation Favorites is not added setting default focus");
         }
     }
     else
     {
         var payload = this._getContextPayload();
         if (payload && payload.favoritesTab === this._EnumTabNavi)
         {
             this._updateSelectFavActionContext();
         }
     }
 }
};

//Updates the List2Ctrl of the currently displayed context with new data.
//This function copies data item-by-item so as to preserve selection and scroll state of the List2Ctrl.
//newData - full list-data object with all items. 
favoritesApp.prototype._updateCurrentContextListData = function(newData)
{
 // Find the existing List2Ctrl of the current context.
 var list2Ctrl = this._getCurrentContextListCtrl(); 
 if (list2Ctrl)
 {
     // List2Ctrl.updateItems does not seem to handle the case when the number of
     // items changes. For now, if the number of items has changed we call setDataList instead.
     //if count is 1 then list2Ctrl contain element as add/edit..
     if (list2Ctrl.dataList.itemCount !== newData.itemCount)
     {
         list2Ctrl.setDataList(newData);
         list2Ctrl.updateItems(0, newData.itemCount - 1);
     }
     else
     {
         var oldData = list2Ctrl.dataList;
         for (var i = 0; i < newData.items.length; i += 1)
         {
             // Add new item to oldData if needed
             if (i >= oldData.items.length)
             {
                 oldData.items.push(newData.items[i]);
             }
             else
             {
                 // Just copy possibly updated values
                 oldData.items[i].appData = newData.items[i].appData;
                 oldData.items[i].text1 = newData.items[i].text1;
                 oldData.items[i].image1 = newData.items[i].image1;
                 if(this._currentContext.ctxtId === "FavoritesNaviTab"){
                     if(this._isSdCardConnected){
                       oldData.items[i].disabled = false;
                     //New Updated for Speed Restriction accrd to UI Spec SCR SW00129389 for Navigation Tab
                           if(framework.common.getAtSpeedValue()){
                              oldData.items[0].disabled = true ; 
                           }else{
                              oldData.items[0].disabled = false ;
                           }
                     }else{
                       oldData.items[i].disabled = true;
                     }
                 }else if(this._currentContext.ctxtId === "FavoritesCommTab"){
                    oldData.items[i].disabled = !this._isPhoneConnected;
                  //New Updated for Speed Restriction accrd to UI Spec SCR SW00129389 for Communcation Tab
                    if (this._isPhoneConnected){
                        if(framework.common.getAtSpeedValue()){
                            oldData.items[0].disabled = true ; 
                        }else{
                            oldData.items[0].disabled = false ;
                        }
                    }
                 }
                 
             }
         }
         oldData.itemCount = newData.itemCount;
         if (this._currentContextTemplate.list2Ctrl.inLoading && oldData.itemCount === 1) {
             this._currentContextTemplate.list2Ctrl.setLoading(false);
             list2Ctrl.updateItems(0,1); //updating 1 item as we have Add/Edit Item
         }else{
             list2Ctrl.updateItems(0, oldData.itemCount - 1);
         }
     }
 }
};

//Update any context that is displaying the current radio station
favoritesApp.prototype._cachedCurrentRadioStationChanged = function()
{
 if (this._currentContext && this._currentContextTemplate)
 {
     switch (this._currentContext.ctxtId)
     {
         case "FavoritesRadioTab":
             if(this._cachedPreviousRadioStation && (this._cachedPreviousRadioStation.radioPlay != this._cachedCurrentRadioStation.radioPlay || this._cachedPreviousRadioStation.displayName != this._cachedCurrentRadioStation.displayName || this._cachedPreviousRadioStation.stationName != this._cachedCurrentRadioStation.stationName))
             {
                this._updateAddEditRadioFavoriteItem();
             }
             else if(this._cachedPreviousRadioStation === null && this._cachedCurrentRadioStation)
             {
                this._updateAddEditRadioFavoriteItem();
             }
             break;

         case "AddEditFavoritesRadio":
             if(this._cachedPreviousRadioStation && (this._cachedPreviousRadioStation.radioPlay != this._cachedCurrentRadioStation.radioPlay || this._cachedPreviousRadioStation.displayName != this._cachedCurrentRadioStation.displayName || this._cachedPreviousRadioStation.stationName != this._cachedCurrentRadioStation.stationName))
             {
                this._readyAddEditFavoritesRadio();
             }
             else if(this._cachedPreviousRadioStation === null && this._cachedCurrentRadioStation)
             {
                this._readyAddEditFavoritesRadio();
             }
             break;
         case "EditFavoritesRadio":
             if(this._cachedPreviousRadioStation && (this._cachedPreviousRadioStation.radioPlay != this._cachedCurrentRadioStation.radioPlay || this._cachedPreviousRadioStation.displayName != this._cachedCurrentRadioStation.displayName || this._cachedPreviousRadioStation.stationName != this._cachedCurrentRadioStation.stationName))
             {
                this._readyEditFavoritesRadio();
             }
             else if(this._cachedPreviousRadioStation === null && this._cachedCurrentRadioStation)
             {
                this._readyEditFavoritesRadio();
             }
             break;
         default:
             break;
     }
 }
};

favoritesApp.prototype._getCachedCurrentRadioStationLabel = function()
{
    // NOTE: MMUI is sending two fields here because we (GUI and MMUI people) don"t know which one should be used.
    // This code prefers displayName but will use stationName if displayName is blank.
    var label = "";
    if (this._cachedCurrentRadioStation)
    {
        if (typeof this._cachedCurrentRadioStation.displayName === "string" && this._cachedCurrentRadioStation.displayName.length > 0)
        {
            label = this._cachedCurrentRadioStation.displayName;
        }
        else if (typeof this._cachedCurrentRadioStation.stationName === "string" && this._cachedCurrentRadioStation.stationName.length > 0)
        {
            label = this._cachedCurrentRadioStation.stationName;    
        }
    }
    return label;
};

// Update any speed restricted items in the current context.
favoritesApp.prototype._cachedAtSpeedChanged = function()
{
    if (this._currentContext && this._currentContextTemplate)
    {
        switch (this._currentContext.ctxtId)
        {
            case "FavoritesRadioTab":
                this._updateAddEditRadioFavoriteItem();
                break;

            case "EditFavoritesRadio":
                this._readyEditFavoritesRadio();
                break;

            case "AddEditFavoritesRadio":
                this._readyAddEditFavoritesRadio();
                break;

            case "AddEditFavoritesComm":
                this._readyAddEditFavoritesComm();
                break;

            case "EditFavoritesComm":
                this._readyEditFavoritesComm();
                break;

            case "AddEditFavoritesNavi":
                this._readyAddEditFavoritesNavi();
                break;

            case "EditFavoritesNavi":
                this._readyEditFavoritesNavi();
                break;

            case "FavoritesCommTab":         // intentional fallthrough
            case "FavoritesNaviTab":
                // NOTE: According to sys_favorites_details 3.60 long press is not speed restricted in FavoritesRadioTab
                var list2Ctrl = this._getCurrentContextListCtrl();
                if (list2Ctrl)
                {
                    var itemBehavior = "shortAndLong" ;
                    for (var i = 1; i < list2Ctrl.dataList.items.length; i++)
                    {
                        list2Ctrl.dataList.items[i].itemBehavior = itemBehavior;
                    }
                    
                  //New Updated for Speed Restriction accrd to UI Specs for SCR SW00129389 for Communication Tab
                    if (this._isPhoneConnected && this._currentContext.ctxtId === this._ctxTabComm){
                        if(framework.common.getAtSpeedValue()){
                            list2Ctrl.dataList.items[0].disabled = true ; 
                        }else{
                            list2Ctrl.dataList.items[0].disabled = false ;
                        }
                    }
                    //New Updated for Speed Restriction accrd to UI Spec SCR SW00129389 for Navigation Tab
                    if (this._isSdCardConnected && this._currentContext.ctxtId === this._ctxTabNavi){
                        if(framework.common.getAtSpeedValue()){
                            list2Ctrl.dataList.items[0].disabled = true ; 
                        }else{
                            list2Ctrl.dataList.items[0].disabled = false ;
                        }
                    }
                    list2Ctrl.updateItems(0, list2Ctrl.dataList.items.length - 1);
                }
                break;

            case "SelectFavoriteToMove":     // intentional fallthrough
            case "SelectFavoriteToDelete":   // intentional fallthrough
            case "SelectFavoriteToReplace":  // intentional fallthrough
            case "SelectFavoriteToRename":   // intentional fallthrough            
                this._disableAllFavoriteListItems(); //SCR:SW00134200
                break;
            case "SelectPosition":
                this._disableAllFavoriteListItems(); //SCR:SW00134200
                this._currentContextTemplate.list2Ctrl.setReorder(false);
                break;

            case "QwertyEntry":
                this._currentContextTemplate.keyboardCtrl.setAtSpeed(framework.common.getAtSpeedValue());
                break;
            case "MaxFavoritesNotification":
                this._dialogSpeedRestriction();
                break;
            case "DeleteConfirmation":
                this._dialogSpeedRestriction();
                break;
            default:
                break;
        }
    }
};

/**************************
 * Wink HANDLERS *
 **************************/
favoritesApp.prototype.getWinkProperties = function(alertId, params)
{
    log.debug("#JV : Inside getWinkProperties");
    var wink = null ;     
    switch (alertId)
    {
        case "FavoriteAdded":
            wink = {
                "style": "style03",
                "text1Id": "FavoriteAdded",
            };
            break;

        case "FavoriteAlreadyAvailable":
            wink = {
                "style": "style03",
                "text1Id": "FavoriteAlreadyAvailable",
            };
        break;
        
        case "GPSlocation":    
            wink = {
                "style": "style03",
                "text1Id": "GPSlocation",
            };
            log.debug("#JV : Inside getWinkProperties.. case GPS location");
            break;
        case "InvalidAddress":
            wink = {
                "style": "style01",
                "text1Id": "InvalidAddress",
            };
            log.debug("#JV : Inside getWinkProperties.. case InvalidAddress");
            break;
        case "FavoriteUpdated":
            wink = {
                "style": "style01",
                "text1Id": "FavoriteUpdated",
            };
            break;
        case "DeleteHome":
            wink = {
                "style": "style01",
                "text1Id": "DeleteHome",
            };
            break;
       default:
       log.debug("Nothing to display in wink");
            break;   
    }
};

/**************************
 * Helper functions
 **************************/
//helper function
favoritesApp.prototype._addCurrentFreqItem = function(){
    
    log.info("inside _addCurrentFreqItem");
     var list2Ctrl = this._getCurrentContextListCtrl();
     var data = list2Ctrl.dataList;
     
     if(!this.isRadioTitleReq){
       log.info("@_addCurrentFreqItem:title not required");
     }else{
        log.info("@_addCurrentFreqItem:title required");
         var context = this._getContextPayload();
         var title = null ;
         if (context)
         {
             var fav = this._lookupFavorite(this._EnumTabRadio, context.favId);
             if (fav)
             {
                 list2Ctrl.setTitle( { titleStyle: "style02", text1: fav.name } );
             }
         }
     }
     log.info("this._cachedCurrentRadioStation" +this._cachedCurrentRadioStation);
    // Update the "Replace" current frequency item
     if (this._cachedCurrentRadioStation)
     {
         data.items[0].text1SubMap = { frequency: this._getCachedCurrentRadioStationLabel() };
         data.items[0].disabled = false;
         data.items[0].image1 = this._getIconForFavoriteType(this._EnumTabRadio, this._cachedCurrentRadioStation.radioPlay);
         log.info("this._cachedCurrentRadioStation inside if");
     }
     else
     {
         data.items[0].text1SubMap = { frequency: "" };
         data.items[0].disabled = true;
         data.items[0].image1 = "common/images/icons/IcnListStore_Ds.png";
         log.info("this._cachedCurrentRadioStation inside else");
     }

     // Update the speed restricted items
     if (framework.common.getAtSpeedValue())
     {
         data.items[1].disabled = true;
         data.items[1].image1 = "common/images/icons/IcnListMove_Ds.png";
         data.items[2].disabled = true;
         data.items[2].image1 = "common/images/icons/IcnListDelete_Ds.png";
          log.info("getAtSpeedValue inside if");
     }
     else
     {
         data.items[1].disabled = false;
         data.items[1].image1 = "common/images/icons/IcnListMove_En.png";
         data.items[2].disabled = false;
         data.items[2].image1 = "common/images/icons/IcnListDelete_En.png";
         log.info("getAtSpeedValue inside else");
     }
     list2Ctrl.updateItems(0, 2);
};

//Helper function for adding AddEdit/Edit Comm Items
favoritesApp.prototype._addFavoritesCommItem = function()
{
    var list2Ctrl = this._getCurrentContextListCtrl();
    var data = list2Ctrl.dataList;
   if(!this.isCommTitleReq){
          log.debug("@_addFavoritesCommItem:title not required");
        }else{
            // Update title with the favorite"s name
            var context = this._getContextPayload();
            if (context)
            {
                var fav = this._lookupFavorite(this._EnumTabComm, context.favId);
                if (fav)
                {
                    list2Ctrl.setTitle( { titleStyle: "style02", text1: fav.name } );
                }
            }
       }
// Update the add from (phone) contact items
   if (this._isPhoneConnected)
   {
       //New Updated for Speed Restriction accrd to UI Spec SCR SW00129389 for Communication Tab
       if(framework.common.getAtSpeedValue()){
           data.items[0].disabled = true;
           data.items[0].image1 = "common/images/icons/IcnListContact_Ds.png";
           data.items[1].disabled = true;
           data.items[1].image1 = "common/images/icons/IcnListContact_Ds.png";
       }else{
           data.items[0].disabled = false;
           data.items[0].image1 = "common/images/icons/IcnListContact_En.png";
           data.items[1].disabled = false;
           data.items[1].image1 = "common/images/icons/IcnListContact_En.png";
       }
   }
   else
   {
       data.items[0].disabled = true;
       data.items[0].image1 = "common/images/icons/IcnListContact_Ds.png";
       data.items[1].disabled = true;
       data.items[1].image1 = "common/images/icons/IcnListContact_Ds.png";
   }

   // Update the speed restricted items
   if (framework.common.getAtSpeedValue())
   {
       data.items[2].disabled = true;
       data.items[2].image1 = "common/images/icons/IcnListMove_Ds.png";
       
       data.items[3].disabled = true;
       data.items[3].image1 = "common/images/icons/IcnListRename_Ds.png";

       data.items[4].disabled = true;
       data.items[4].image1 = "common/images/icons/IcnListDelete_Ds.png";
   }
   else
   {
       data.items[2].disabled = false;
       data.items[2].image1 = "common/images/icons/IcnListMove_En.png";

       data.items[3].disabled = false;
       data.items[3].image1 = "common/images/icons/IcnListRename_En.png";

       data.items[4].disabled = false;
       data.items[4].image1 = "common/images/icons/IcnListDelete_En.png";
   }

   list2Ctrl.updateItems(0, 4);

};
favoritesApp.prototype._dialogButtonCallback = function(controlRef, appData, params)
{
    switch (appData)
    {
        case "Global.GoBack":   // intentional fallthrough
        case "Global.Cancel":   // intentional fallthrough
        case "Global.Yes":
            framework.sendEventToMmui("common", appData);
            break;
        case "SelectDelete":
            framework.sendEventToMmui(this.uiaId, appData);
            break;
        default:
            break;
    }
};

favoritesApp.prototype._getPhoneDeviceId = function()
{
    if (typeof this._phoneDeviceId === "undefined" || this._phoneDeviceId === null)
    {
        return -1;
    }
    else
    {
        return this._phoneDeviceId;
    }
};

// Determines if the current context needs to be updated and updates it.
favoritesApp.prototype._isPhoneConnectedChanged = function()
{
    this._tabsConfig[1].disabled = !this._isPhoneConnected;
    if (this._currentContext && this._currentContextTemplate)
    {
        switch (this._currentContext.ctxtId)
        {
            case "AddEditFavoritesNavi":
                this._readyAddEditFavoritesNavi();
                break;

            case "AddEditFavoritesComm":
                this._readyAddEditFavoritesComm();
                break;

            case "EditFavoritesComm":
                this._readyEditFavoritesComm();
                break;

            case "EditFavoritesNavi":
                this._readyEditFavoritesNavi();
                break;

            case "FavoritesRadioTab":
            case "FavoritesNaviTab": 
                 this._currentContextTemplate.list2Ctrl.tabsCtrl.setTabDisabled(1, !this._isPhoneConnected);    
                break;
            case "FavoritesCommTab":
                  this._changeCommTabListData(); //if phone is disconnected disabled gray out all the list data under comm
                break;
            default:
                break;
        }
    }
};

// Determines if the current context needs to be updated and updates it.
favoritesApp.prototype._isSdCardConnectedChanged = function()
{
   if(this._checkSDCardStatus){
     if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId != "FavoritesContactDetails")
     {
        log.debug("_isSdCardConnectedChanged:SDCard Inserted show Tab with if condn");
        if(this._currentContextTemplate.list2Ctrl.tabsCtrl)
        {
            log.info("_isSdCardConnected "+this._isSdCardConnected);
            this._currentContextTemplate.list2Ctrl.tabsCtrl.setTabDisabled(2, !this._isSdCardConnected);
        }
        else
        {
            log.info("Currentcontexttmplt doesn't have tabsCtrl");
        }
            
     }else{
        log.debug("_isSdCardConnectedChanged:SDCard Inserted show Tab with else condn");
        this._tabsConfig[2].disabled = !this._isSdCardConnected;
     }
     this._checkSDCardStatus = false ;
    }else{
        log.debug("_isSdCardConnectedChanged:else cond");
    } 
    if (this._currentContext && this._currentContextTemplate)
    {
        switch (this._currentContext.ctxtId)
        {
            case "FavoritesRadioTab":   
            case "FavoritesCommTab":    
                break;
            case "FavoritesNaviTab":
                this._changeNaviTabListData();
                break;
            case "FavoritesContactDetails":
                this._readyContactAddressForSD();
                break;
            default:
                break;
        }
    }
};

//Change the FavoritesContact Address detail when SD card enable/disable
favoritesApp.prototype._readyContactAddressForSD = function(){
    var list2Ctrl = this._getCurrentContextListCtrl();
    var data = list2Ctrl.dataList;
    if(data)
    {
      if(this._isSdCardConnected){
          for(var i = 0 ;i < data.itemCount ; i++){
          if(data.items[i].appData.kind === "address"){
              data.items[i].disabled = false;
              log.debug("::sdCard available show address detail::");
          }
          }
       }
      else{
           for(var i = 0 ;i < data.itemCount ; i++){
              if(data.items[i].appData.kind === "address"){
                  data.items[i].disabled = true;
                  log.debug("::sdCard removed disabled address detail::");
              }
            }
          }
      list2Ctrl.setDataList(data);
      list2Ctrl.updateItems(0, data.itemCount - 1);
    }
    
};

//Gray out all the list2Ctrl data if phone disconnects
favoritesApp.prototype._changeCommTabListData = function(){
   //New Updation for Comm Favorites
   if(this._isPhoneConnected){
      this._hasRequestedCommFavorites = false ;
      this._lazyRequestFavorites(this._EnumTabComm);    
   }else{
        var list2Ctrl = this._getCurrentContextListCtrl();
        var data = list2Ctrl.dataList;
        var cachedList = this._cachedCommFavorites ;
        if(data.items){
            for(var i = 0 ; i < data.itemCount ; i++){
                   data.items[i].disabled = !this._isPhoneConnected ;
                   if(i >= 1){
                        var imagePath = cachedList[i-1].image ;
                        if(imagePath === "" || imagePath === null || imagePath === " " || imagePath === undefined){
                            var path = data.items[i].image1.split("_") ;
                            data.items[i].image1 = path[0]+"_Ds.png" ; 
                       }
                   }
                   list2Ctrl.updateItems(0,data.itemCount-1);
            }
        }
   }
   this._currentContextTemplate.list2Ctrl.tabsCtrl.setTabDisabled(1, !this._isPhoneConnected);
};

//Gray out all the list2Ctrl data if sd Card disconnects
favoritesApp.prototype._changeNaviTabListData = function(){
    //New Updation for Navi Favorites
    if(this._isSdCardConnected){
      this._hasRequestedNaviFavorites = false ;
      
       if(this._currentContext.ctxtId === "FavoritesNaviTab")
            {
                var dataList = {
                itemCountKnown : true,
                itemCount : 0,
                items : []
                }
                
                var currList = this._currentContextTemplate.list2Ctrl;
                currList.setDataList(dataList);
                currList.updateItems(0, dataList.itemCount-1);
                 currList.topItem = 0;
            } 
      
      
      this._lazyRequestFavorites(this._EnumTabNavi);    
   }else{
      var list2Ctrl = this._getCurrentContextListCtrl();
      var data = list2Ctrl.dataList;
      //validating data is available
      if(data.items){
      data.itemCount = 2 ;//latest impl
      for(var i = 0 ; i < data.itemCount ; i++){
          data.items[i].disabled = !this._isSdCardConnected;
        }
        list2Ctrl.setDataList(data);//latest impl
        list2Ctrl.updateItems(0,data.itemCount-1); 
      }
   }
    //this._currentContextTemplate.list2Ctrl.tabsCtrl.setTabDisabled(2, !this._isSdCardConnected);
};

//populate FavoritesRadio list
favoritesApp.prototype._getFavoritesRadioTabListData = function()
{
    var data = {
      itemCountKnown: true,
      itemCount: 2,
      items: [{
            appData : "SelectAddEditFavorite",
            text1Id : "addEditRadioFavorite",
            itemStyle : "style01",
            hasCaret : false
        }],
    };

    // NOTE: According to sys_favorites_details 3.60 long press is not speed restricted in FavoritesRadioTab
    data.items[0].disabled = (this._cachedCurrentRadioStation === null && framework.common.getAtSpeedValue());
    data.items = data.items.concat(this._getFavoritesAsListItems(this._EnumTabRadio, "shortAndLong"));
    data.itemCount = data.items.length;
    return data;
};

favoritesApp.prototype._displayedFavoritesRadioTab = function()
{
    // Scroll to the updated favorite -- if any
    var payload = this._getContextPayload();
    if (payload && typeof payload.updatedFavId === "number")
    {
        var index = this._indexOfFavorite(this._EnumTabRadio, payload.updatedFavId);
        
        //Below code is used to manually change the Focus of Added Item in List2. Implt for SCR SW00128113
        if(this.isRadioFavAdded){
            this.isRadioFavAdded = false ;
            if (index !== -1)
            {
               var list2Ctrl = this._getCurrentContextListCtrl();
               if (list2Ctrl) 
               {
                  var indexItem = (index + 1) ;
                  list2Ctrl.topItem = indexItem;
                  log.debug("#Fav:_displayedFavoritesRadioTab::List2 item added topItem index is::"+indexItem);
                  setTimeout(function() {
                    list2Ctrl.focussedItem = indexItem;    
                  }, 10);                
               }
            }
        }else{
           log.debug("#Fav::Nothing is added, Global.goback will Handler the focus...");
        }
		//This code adds the current playing icon to the active station
		log.info("favid : "+this._cachedActiveFavId+ " favstatus : "+this._cachedFavPlayStatus);
		if(this._cachedFavPlayStatus == true)
		{
			log.info("inside ready function. Requested index for fav id : this._cachedActiveFavId = " + this._cachedActiveFavId)
			var index = this._indexOfFavorite(this._EnumTabRadio,this._cachedActiveFavId );
			log.info("index"+index);
			for(i=1;i <= this._currentContextTemplate.list2Ctrl.dataList.itemCount -1;i++)
			{
				this._currentContextTemplate.list2Ctrl.dataList.items[i].image2 = null;
			}
			this._currentContextTemplate.list2Ctrl.dataList.items[index+1].image2 = "common/images/icons/IcnListEntNowPlaying_En.png";
			log.info("image "+this._currentContextTemplate.list2Ctrl.dataList.items[index+1].image2);
		}
		this._currentContextTemplate.list2Ctrl.updateItems(0,this._currentContextTemplate.list2Ctrl.dataList.itemCount -1);
    }
};


favoritesApp.prototype._updateAddEditRadioFavoriteItem = function()
{
    var list2Ctrl = this._getCurrentContextListCtrl();
    if (list2Ctrl && list2Ctrl.dataList && list2Ctrl.dataList.items.length > 0)
    {
        list2Ctrl.dataList.items[0].disabled = (this._cachedCurrentRadioStation === null && framework.common.getAtSpeedValue());  
        list2Ctrl.updateItems(0, 0);
    }
};

favoritesApp.prototype._radioFavoriteSelected = function(controlRef, appData, params)
{
    if (appData === "SelectAddEditFavorite")
    {
        framework.sendEventToMmui(this.uiaId, appData);
    }
    else if (typeof appData === "number")
    {
        var fav = this._lookupFavorite(this._EnumTabRadio, appData);
        if (fav)
        {
            var eventData = { 
                payload : {
                    favoritesTab: this._EnumTabRadio,
                    favId: fav.id,
                    position: this._indexOfFavorite(this._EnumTabRadio, fav.id),
                    selection: this._getSelectFavoriteListSelectionValue(this._EnumTabRadio, fav.id),
                } 
            };
            framework.sendEventToMmui(this.uiaId, "SelectFavoriteList", eventData);
        }
    }
};

favoritesApp.prototype._radioFavoritesLongPress = function(controlRef, appData, params)
{
    var fav = this._lookupFavorite(this._EnumTabRadio, appData);
    if (fav)
    {
        var eventData = { 
            payload : {
                favoritesTab: this._EnumTabRadio,
                favId: fav.id,
                position: this._indexOfFavorite(this._EnumTabRadio, fav.id),
            }
        };
        framework.sendEventToMmui(this.uiaId, "SelectFavoriteListLong", eventData);
    }
};

favoritesApp.prototype._addEditFavoritesRadioItemCallback = function(controlRef, appData, params)
{
    switch (appData)
    {
        case "SelectAddRadioCurrent":   // intentional fallthrough
        case "SelectMove":              // intentional fallthrough
        case "SelectDelete":
            framework.sendEventToMmui(this.uiaId, appData);
            break;
        default:
            break;
    }
};

favoritesApp.prototype._editFavoritesRadioItemCallback = function(controlRef, appData, params)
{
    switch (appData)
    {
        case "SelectEditReplace":       // intentional fallthrough
        case "SelectEditMove":          // intentional fallthrough
        case "SelectEditDelete":
            var context = this._getContextPayload();            
            if (context)
            {
                var data = { 
                    payload : {
                        favId: context.favId,
                        position: context.position
                    }
                };
                framework.sendEventToMmui(this.uiaId, appData, data);
            }
            break;
        default:
            break;
    }
};

///////////////////////////////////////////////////////////////////////////////
// SelectFavoriteToReplace
// SelectFavoriteToMove
// SelectFavoriteToDelete
// SelectFavoriteToRename
///////////////////////////////////////////////////////////////////////////////

favoritesApp.prototype._disableAllFavoriteListItems = function()
{
    var list2Ctrl = this._getCurrentContextListCtrl();
    var payload = this._getContextPayload();
    if (list2Ctrl)
    {
        for (var i = 0; i < list2Ctrl.dataList.items.length; i += 1)
        {
            list2Ctrl.dataList.items[i].disabled = framework.common.getAtSpeedValue(); //For SCR SW00134200
            var imagePath = list2Ctrl.dataList.items[i].image1.split("_") ;
            if(framework.common.getAtSpeedValue()){
               list2Ctrl.dataList.items[i].image1 = imagePath[0]+"_Ds.png" ;
            }else{
              list2Ctrl.dataList.items[i].image1 = imagePath[0]+"_En.png" ;
            }
        }
        if(list2Ctrl.dataList.items.length !== 0)
        list2Ctrl.updateItems(0, list2Ctrl.dataList.items.length - 1);
    }
};

// Updates the list2Ctrl data in one of these supported contexts.
favoritesApp.prototype._updateSelectFavActionContext = function()
{
    var payload = this._getContextPayload();
    if (payload)
    {
        switch (this._currentContext.ctxtId)
        {
            case "SelectFavoriteToMove":     // intentional fallthrough
            case "SelectFavoriteToDelete":   // intentional fallthrough
            case "SelectFavoriteToRename":   // intentional fallthrough
            case "SelectFavoriteToReplace":
                var newData = {
                  itemCountKnown: true,
                  itemCount: 0,
                  items: this._getFavoritesAsListItems(payload.favoritesTab)
                };
                newData.itemCount = newData.items.length;
                this._updateCurrentContextListData(newData);
                break;
           default:
                break; 
        }
    }
};

// Fills one of the several similar contexts with list of favorites).
favoritesApp.prototype._contextInSelectFavAction = function()
{
    var payload = this._getContextPayload();
    if (payload)
    {
       //if(payload.favoritesTab !== this._EnumTabNavi){
        this._lazyRequestFavorites(payload.favoritesTab);

        var data = {
          itemCountKnown: true,
          itemCount: 0,
          items: this._getFavoritesAsListItems(payload.favoritesTab)
        };
        data.itemCount = data.items.length;
        this.cachedListCountFavMove = data.items.length ;
        var ctxtId = this._currentContext.ctxtId;
        this._contextTable[ctxtId].controlProperties.List2Ctrl.dataList = data;
        //this._contextTable[ctxtId].controlProperties.List2Ctrl.scrollTo = 0;
        //}
    }
};

//To Hide the loading if no list item available
favoritesApp.prototype._readySelectFavAction = function(par){
  if(this._currentContextTemplate){
     if(this.cachedListCountFavMove === 0){
         log.debug("@_readySelectFavAction::Item List Not Available Hiding loading forcefully.") ;
         this._currentContextTemplate.list2Ctrl.setLoading(false);
     }else{
         log.debug("@_readySelectFavAction::Item List Available.") ;
     
     }
     if(this._lastViewedTab === this._EnumTabNavi)
     {
     
     
     
     var callBackForList = this._GetFavoritesItemsCallback.bind(this);
      var params = {
                  "StartIndex" : 0,
                  "MaxItems" : 20
               };
             this._cachedSelectFavoriteIndex = 0;
            framework.sendRequestToAppsdk(this.uiaId, callBackForList, "navifav", "GetFavoriteList", params);
     }
  }
  this._disableAllFavoriteListItems();
};
favoritesApp.prototype._selectFavToActionItemCallback = function(controlRef, appData, params)
{
    var payload = this._getContextPayload();
    log.info("payload obj = ", payload)
    log.info("last tab :::",this._lastViewedTab);
    log.info("appData :::",appData);
    if (payload && typeof appData === "number")
    {        
        log.info("payload payload.favoritesTab = "+payload.favoritesTab)
        var fav = this._lookupFavorite(payload.favoritesTab, appData);
        log.info("fav :::"+fav);
        if (fav)
        {
            var eventData = { payload: {
                favoritesTab: payload.favoritesTab,
                favId: fav.id,
                position: params.itemIndex,
                selection: this._getSelectFavoriteListSelectionValue(payload.favoritesTab, fav.id),
            } };
            framework.sendEventToMmui(this.uiaId, "SelectFavoriteList", eventData);
        }
    }
    else//consider for NAVI TAB
    {
        if(this._lastViewedTab)
        {
            var fav = this._lookupFavorite(this._lastViewedTab, appData);
            if (fav)
            {
                var eventData = { payload: {
                    favoritesTab: this._lastViewedTab,
                    favId: fav.id,
                    position: params.itemIndex,
                    selection: this._getSelectFavoriteListSelectionValue(this._lastViewedTab, fav.id),
                } };
                log.info("Event Sent from Else");
                framework.sendEventToMmui(this.uiaId, "SelectFavoriteList", eventData);
            }
        }
    }
};

favoritesApp.prototype._selectPositionItemCallback = function(controlRef, appData, params)
{
    var payload = this._getContextPayload();
    
    // Checking the ID of the item selected "Destination item"    
        log.info("Checking the Tab --> "+payload.favoritesTab)
    if(payload.favoritesTab === this._EnumTabNavi)
    {
        
      if (this._pendingMoveEventData){
       var favId = 0;
         if(params.itemIndex === 0){
            //Sending favId as 0 for navi move to 0 moveFavorites(ID,0) ;
            this._pendingMoveEventData.payload.favId = 0 ;
            this._pendingMoveEventData.payload.newPosition = params.itemIndex;
         }
         else{
            this._pendingMoveEventData.payload.newPosition = params.itemIndex;
            var oldPos = this._pendingMoveEventData.payload.oldPosition;
            var newPos = this._pendingMoveEventData.payload.newPosition
           
                if(oldPos < newPos)
            {
                favId = this._lookUpFavoriteId(payload.favoritesTab,(params.itemIndex));
                
                if(!favId)
                {
                    favId = this._lookUpFavoriteId(payload.favoritesTab,(params.itemIndex-1));
                }
            }
            else
            {
                favId = this._lookUpFavoriteId(payload.favoritesTab,(params.itemIndex-1));
            }
            this._pendingMoveEventData.payload.favId = favId ;
         }
       }
    }
    else{
        if (this._pendingMoveEventData)
        {
            this._pendingMoveEventData.payload.newPosition = params.itemIndex;
        }
    }
    log.info("FavId to Move after:: "+this._pendingMoveEventData.payload.favId);
    log.info("FavId to newPosition :: "+this._pendingMoveEventData.payload.newPosition);
    log.info("FavId to oldPosition :: "+this._pendingMoveEventData.payload.oldPosition);
    framework.sendEventToMmui(this.uiaId, "MoveFavorite", this._pendingMoveEventData);
    this._pendingMoveEventData = null;
};

//Looking for FavoriteId to replace with
favoritesApp.prototype._lookUpFavoriteId = function(favoritesTab,itemIndex){
    //Need to fetch the appData from the item selected (itemIndex)
    var arrData = this._getFavoritesAsListItems(favoritesTab) ;
    return arrData[itemIndex].appData ;    
};

//populate favoritecommunication list
favoritesApp.prototype._getFavoritesCommTabListData = function()
{
    var data = {
      itemCountKnown: true,
      itemCount: 1,
      items: [{
            appData : "SelectAddEditFavorite",
            text1Id : "addEditCommFavorite",
            selected : false,
            disabled : false,
            toggled : 0,
            itemStyle : "style01",
            hasCaret : false
        }],
    };

    var itemBehavior = "shortAndLong" ;
    if(this._isPhoneConnected){
       data.items = data.items.concat(this._getFavoritesAsListItems(this._EnumTabComm, itemBehavior));
       data.itemCount = data.items.length;
    }else{
        data.items[0].disabled = true ;
        data.itemCount = 1;
    }
    return data;
};

favoritesApp.prototype._displayedFavoritesCommTab = function()
{
    // Scroll to the updated favorite -- if any
    var payload = this._getContextPayload();
    if (payload && typeof payload.updatedFavId === "number")
    {
        var index = this._indexOfFavorite(this._EnumTabComm, payload.updatedFavId);
      //Below if condition is used to manually change the focus to the last added/updated List Item.Implt for SCR SW00128113 
        if(this.isContactFavAdded){
          this.isContactFavAdded = false ;
           if (index !== -1)
           {
             var list2Ctrl = this._getCurrentContextListCtrl();
             if (list2Ctrl) 
             {
                list2Ctrl.topItem = index + 1;
                setTimeout(function() {
                    list2Ctrl.focussedItem = index + 1;    
                }, 1);
             }
           } 
        }else{
          log.debug("Nothing is added, goback handle the default focus...");
        }//END of Impl for SCR SW00128113
    }
};

favoritesApp.prototype._commFavoriteSelected = function(controlRef, appData, params)
{
    if (appData === "SelectAddEditFavorite")
    {
        framework.sendEventToMmui(this.uiaId, appData);
    }
    else if (typeof appData === "number")
    {
        // appData is the favorite id
        var fav = this._lookupFavorite(this._EnumTabComm, appData);
        if (fav)
        {
            var eventData = { 
                payload : {
                    favoritesTab: this._EnumTabComm,
                    favId: fav.id,
                    position: this._indexOfFavorite(this._EnumTabComm, fav.id),
                    selection: this._getSelectFavoriteListSelectionValue(this._EnumTabComm, fav.id),
                }
            };
            framework.sendEventToMmui(this.uiaId, "SelectFavoriteList", eventData);
        }
    }
};

favoritesApp.prototype._commFavoritesLongPress = function(controlRef, appData, params)
{
    var fav = this._lookupFavorite(this._EnumTabComm, appData);
    if (fav)
    {
        var eventData = { 
            payload : {
                favoritesTab: this._EnumTabComm,
                favId: fav.id,
                position: this._indexOfFavorite(this._EnumTabComm, fav.id),
            }
        };
        framework.sendEventToMmui(this.uiaId, "SelectFavoriteListLong", eventData);
    }
};


// Given a phone number category from a GetFavoriteContactDetail method return, this
// function returns two values: 1) a dictionary ID to display a name for the category,
// and 2) a string of type UIA_FAVORITES_PhoneNumberType_t to be sent to MMUI in an event.
favoritesApp.prototype._convertFromAppSDKPhoneNumberCategory = function(category)
{
    if (category === 1002)
    {
        // Mobile
        return { dictionaryId: "phoneNumberCategoryMobile", mmuiCategory: "Mobile" };
    }
    else if (category === 1000 || category === 1500)
    {
        // Home
        return { dictionaryId: "phoneNumberCategoryHome", mmuiCategory: "Home_Phone" };
    }
    else if (category === 10000 || category === 10002)
    {
        // Work
        return { dictionaryId: "phoneNumberCategoryWork", mmuiCategory: "Office_Phone" };
    }
    else
    {
        // Other
        return { dictionaryId: "phoneNumberCategoryOther", mmuiCategory: "Other" };
    }
};

favoritesApp.prototype._fillFavoritesContactDetails = function(params)
{
    var list2Ctrl = this._getCurrentContextListCtrl();
    if (list2Ctrl)
    {
        // Set title 
        var title = { 
            titleStyle : "style05", 
            text1 : params.return_displayName,
            text2 : params.return_companyName,
            image1: params.return_image,
        };
        list2Ctrl.setTitle(title);

        // Set list2Ctrl data
        var data = {
            itemCountKnown: true,
            itemCount: 0,
            items: [],
        };
        
        //Below code is written for loading spinner, condition can be removed if loading spineer imp is done
        if(this._checkBlankFavContactDetail(params)){
           log.debug("Valid Detail entry available");
        }else{
           log.debug("Valid Detail entry not available stop the loading spinner");
           this._contextTable["FavoritesContactDetails"].controlProperties.List2Ctrl.loadingOverlayEnabled = false;
           this._contextTable["FavoritesContactDetails"].controlProperties.List2Ctrl.hideLoadingOverlayTimeout = 0 ;
           this._currentContextTemplate.list2Ctrl.setLoading(false);
           return ;
        }//End of the loading spinner condition
        
        
        // Add phone numbers
        for (var i = 0; i < params.favCommNum.arr_favComm.length; i += 1)
        {
            var phoneNum = params.favCommNum.arr_favComm[i].number;
            if (typeof phoneNum === "string" && phoneNum.length > 0) 
            {
                var flag = this._validatePhoneNumber(phoneNum);
                if(flag){
                    var convertedValues = this._convertFromAppSDKPhoneNumberCategory(params.favCommNum.arr_favComm[i].category);
                    var item = {
                        appData: { 
                            kind: "number", 
                            value: phoneNum,
                            category: convertedValues.mmuiCategory, 
                            displayName: params.return_displayName,
                        },
                        //text1Id: convertedValues.dictionaryId,
                        //label1: phoneNum,
                        label1Id : convertedValues.dictionaryId,
                        text1 : phoneNum,
                        itemStyle: "style14",
                        hasCaret : false,
                        labelWidth : "wide"
                    };
                    data.items.push(item);
                    log.debug('::Valid phone number::');
                }else{
                  log.debug('::phone number is not valid::');
                }
                
            }
        }

        // Add address
        if (params.favCommAddr)
        {
            // Make address line1 and line2
            var street = params.favCommAddr.street || "";
            var locality = params.favCommAddr.city || "";
            var region = params.favCommAddr.region || "";
            var country = params.favCommAddr.country || "";
            var zip = params.favCommAddr.zipCode || "";

            var line1 = street;
            var line2 = locality;

            if (region.length > 0)
            {
                if (line2.length > 0)
                {
                    line2 = line2 + " ";
                }
                line2 = line2 + region;
            }
            if (country.length > 0)
            {
                if (line2.length > 0)
                {
                    line2 = line2 + " ";
                }
                line2 = line2 + country;
            }
            if (zip.length > 0)
            {
                if (line2.length > 0)
                {
                    line2 = line2 + " ";
                }
                line2 = line2 + zip;
            }
            if ( (line1 !== null && line1.length > 0) || (line2 !== null && line2.length > 0) )
            {
                var item = {
                    appData: { 
                        kind: "address", 
                        favCommAddr: params.favCommAddr, 
                        displayName: params.return_displayName 
                    },
                    label1Id : "phoneNumberCategoryAddress",
                    itemStyle: "style17", 
                    hasCaret : false,
                    labelWidth : "wide"
                };
                if(!this._isSdCardConnected){
                    item.disabled = true ;
                }else{
                    item.disabled = false ;
                }
                this.defaultRegionSet = this._checkRegionDetail();
                if(this.defaultRegionSet !=null && this.defaultRegionSet != undefined){
                    log.debug("#Fav::Region value in favorites::"+this.defaultRegionSet);
                   switch (this.defaultRegionSet) {
                    case framework.localize.REGIONS.Europe:
                       item.text1 = " " + street + ", "+zip+ ", "+ locality + ", " + country ; 
                    break;
                    case "Region_4A":
                    case framework.localize.REGIONS.NorthAmerica:
                       item.text1 = " " + street + ", "+locality +" "+ region+ ", "+ zip + ", " + country ;
                       break;
                    case framework.localize.REGIONS.Japan:
                       item.text1 = " "+ region + locality + street + ", "+ zip +", "+ country;
                    break;
                    default:
                       item.text1 = " " + street + ", "+locality +" "+ region+ ", "+ zip + ", " + country ;
                    break;
                   }
                }else{
                    log.debug("#Fav:DefaultRegion Not found showing the Default Address Style");
                    item.text1 = " " + street + ", "+locality +" "+ region+ ", "+ zip + ", " + country ;
                }
                data.items.push(item);
            }//End of SCR SW00127938
        }
        data.itemCount = data.items.length;
        list2Ctrl.setDataList(data);
        list2Ctrl.updateItems(0, data.itemCount - 1);
    }
};

//Below Code is used to check the Region
favoritesApp.prototype._checkRegionDetail = function(){
   var defaultRegion = framework.localize.getRegion();
   return defaultRegion ;
};

//function to check the blank contact detail
favoritesApp.prototype._checkBlankFavContactDetail = function(params){
  var isPhoneAvail = false;
  var isAddressAvail = false;
  
  if(params){
     //check for Valid number
     if(params.favCommNum || params.favCommAddr){
        if(params.favCommNum.arr_favComm.length > 0){
           for(var i in params.favCommNum.arr_favComm){
               log.debug("Contact Detail has Numbers");
               if(params.favCommNum.arr_favComm[i].number != null && params.favCommNum.arr_favComm[i].number.length > 0){
                   isPhoneAvail = true ;
                   break; //if got any number break the condition
               }else{
                   isPhoneAvail = false ;
               }
           }
        }else{
           isPhoneAvail = false ;
        }
        if(params.favCommAddr){
            log.debug("Checking Address");
            var street = params.favCommAddr.street || "";
            var city = params.favCommAddr.city || "";
            var region = params.favCommAddr.region || "";
            var country = params.favCommAddr.country || "";
            var zip = params.favCommAddr.zipCode || "";
            
            if(street!=null && street.length > 0 || city!=null && city.length > 0 || region!=null && region.length > 0 || country!=null && country.length > 0 || zip!=null && zip.length>0){
                isAddressAvail = true ;
            }else{
                log.debug("Address is not available");
                isAddressAvail = false ;
            }
         }
        if(isAddressAvail || isPhoneAvail){
             return true ;
        }else{
             return false ;
        }
     }
  }
};

favoritesApp.prototype._favoritesContactDetailsItemCallback = function(controlRef, appData, params)
{    
    if ( appData.kind === "number" )
    {
        var data = {
            payload: {
                contactId: 0,
                deviceId: this._getPhoneDeviceId(),
                displayName: appData.displayName,
                phoneNumber: appData.value,
                numberType: appData.category,
            }
        };
        framework.sendEventToMmui(this.uiaId, "SelectDetailsNumber", data);
    }
    //below condition is added if the 
    else if( appData.kind === "address" )
    {
        var data = {
            payload: {
                contactId: 0,
                displayName: appData.displayName,
                "streetAddress" : {
                    "addressLine1"  : appData.favCommAddr.street,
                    "addressLine2"  : "",
                    "city"          : appData.favCommAddr.city,
                    "stateProvince" : appData.favCommAddr.region,
                    "country"       : appData.favCommAddr.country,
                    "code"          : appData.favCommAddr.zipCode,
                }
            }
        };
        framework.sendEventToMmui(this.uiaId, "SelectDetailsAddress", data);
    }
};



favoritesApp.prototype._sendRequestGetContactsComm = function(index)
{
    var params = {
        "deviceId" : this._getPhoneDeviceId(), 
        "limit" : this._requestChunkSize, 
        "offset" : index, 
        "ctoType" : "ThumbnailImage",
        "sort" : "OrderId",//Earlier Sorting is Display_Name
        "filter" : "All",
    };
    
    var payload = this._getContextPayload();
    if (payload && payload.detailSelection)
    {
        if (payload.detailSelection === "Detail" || payload.detailSelection === "Full")
        {
            params.filter = "Calls";
        }        
    }
    framework.sendRequestToDbapi(this.uiaId, this._getContactsCommCallbackFn.bind(this), "pb", "GetContacts", params);
};


favoritesApp.prototype._sendRequestGetContactsNavi = function(index)
{
    var params = {
        "deviceId" : this._getPhoneDeviceId(), 
        "limit" : this._requestChunkSize, 
        "offset" : index, 
        "ctoType" : "ThumbnailImage",
        "sort" : "OrderId",//Earlier Sorting is Display_Name
        "filter" : "All",
    };
    
    // Removed the previous condition checking for contact type as context is break for Comm/Navi Tab 
    params.filter = "Addresses";
    framework.sendRequestToDbapi(this.uiaId, this._getContactsNaviCallbackFn.bind(this), "pb", "GetContacts", params);
};

favoritesApp.prototype._contextOutSelectContactComm = function()
{
    this._contactsListActualDataCount = 0 ;
    this._contextTable["SelectContactComm"].controlProperties.List2Ctrl.dataList = null;
};


favoritesApp.prototype._contextOutSelectContactNavi = function()
{
    this._contactsListActualDataCount = 0 ;    
    this._contextTable["SelectContactNavi"].controlProperties.List2Ctrl.dataList = null;
};

 
favoritesApp.prototype._noLongerDisplayedSelectContactCommOrDetails = function()
{
    var currCtxtId = "";
    if (this._currentContext && this._currentContext.ctxtId)
    {
        currCtxtId = this._currentContext.ctxtId;
    }
    var prevCtxtId = "";
    if (this._previousContext && this._previousContext.ctxtId)
    {
        prevCtxtId = this._previousContext.ctxtId;
    }

    var isSelectContactOrDetails = 
        (currCtxtId === "SelectContactComm"        && prevCtxtId === "SelectContactCommDetails") || 
        (currCtxtId === "SelectContactCommDetails" && prevCtxtId === "SelectContactComm");

    if ( isSelectContactOrDetails && framework.getCurrentApp() === this.uiaId )
    {
        // Keep DBAPI PB open
    }
    else
    {
        this._closeContactsDb();
    }
};

favoritesApp.prototype._noLongerDisplayedSelectContactNaviOrDetails = function()
{
    var currCtxtId = "";
    if (this._currentContext && this._currentContext.ctxtId)
    {
        currCtxtId = this._currentContext.ctxtId;
    }
    var prevCtxtId = "";
    if (this._previousContext && this._previousContext.ctxtId)
    {
        prevCtxtId = this._previousContext.ctxtId;
    }

    var isSelectContactOrDetails = 
        (currCtxtId === "SelectContactNavi"        && prevCtxtId === "SelectContactNaviDetails") || 
        (currCtxtId === "SelectContactNaviDetails" && prevCtxtId === "SelectContactNavi");

    if ( isSelectContactOrDetails && framework.getCurrentApp() === this.uiaId )
    {
        // Keep DBAPI PB open
    }
    else
    {
        this._closeContactsDb();
    }
};

favoritesApp.prototype._getContactsCommCallbackFn = function(msg)
{
    if(msg.msgContent.params.eCode === 0){
        this._contactsListActualDataCount = this._contactsListActualDataCount + msg.msgContent.params.contacts.length;
        this._contactsListCount = msg.msgContent.params.count;
        if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "SelectContactComm")
         {
           this._addContactsToList(msg.msgContent.params.contacts, msg.msgContent.params.offset, msg.msgContent.params.totalCount);
         }
      }else{
           log.warn("#Fav::getContactDbComm Failed");
           this._currentContextTemplate.list2Ctrl.setLoading(false);
      }
};


favoritesApp.prototype._getContactsNaviCallbackFn = function(msg)
{
    if(msg.msgContent.params.eCode === 0){
       this._contactsListActualDataCount = this._contactsListActualDataCount + msg.msgContent.params.contacts.length;    
       this._contactsNaviListCount = msg.msgContent.params.count;
       if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "SelectContactNavi")
         { 
           this._addContactsToNaviList(msg.msgContent.params.contacts, msg.msgContent.params.offset, msg.msgContent.params.totalCount);
         }
    }
    else{
      log.debug("#Fav:_sendRequestGetContactsNavi::getContacts request fail");
      this._currentContextTemplate.list2Ctrl.setLoading(false);
    }
};

favoritesApp.prototype._selectContactCommNeedDataCallback = function(index)
{
    if (this._isContactsDbOpen)
    {
        this._sendRequestGetContactsComm(index);
    }
};


favoritesApp.prototype._selectContactNaviNeedDataCallback = function(index)
{
    if (this._isContactsDbOpen)
    {
        this._sendRequestGetContactsNavi(index);
    }
};

// Add contact items to the list2 control
favoritesApp.prototype._addContactsToList = function(itemsList, offset, totalCount)
{
    if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "SelectContactComm")
    {
    var currentList = this._currentContextTemplate.list2Ctrl;
    var j = 0 ;
    if (!currentList.hasDataList())
    {
        var dataList = {};
        dataList.itemCountKnown = true;
        dataList.itemCount = totalCount;
        dataList.items = [];
        for (var i = offset ; i < totalCount; i++)
        {
            //this._contactsListCount is the total count requested
            if(i >= 0 && i < (offset+this._contactsListCount)){
               var item = { 
                    appData : { contactId : itemsList[j].contactId, displayName : itemsList[j].displayName },
                    text1 : itemsList[j].displayName,      
                    itemStyle : "style01",
                    image1:null,
                    hasCaret : false
                };
                if (typeof itemsList[j].ctoPath === "string" && itemsList[j].ctoPath.length > 0)
                {
                    item.image1 = itemsList[j].ctoPath;
                    if(this._contactIdFreeList.indexOf(itemsList[j].contactId) == -1){
                        log.debug("_addContactsToList contactId Present"+this._contactIdFreeList.indexOf(itemsList[j].contactId));
                        this._contactIdFreeList.push(itemsList[j].contactId);
                        this._dbSeqNo.push(itemsList[j].dbSeqNo);
                    }else{
                        log.debug("#Fav:_addContactsToList contactId Already Present");
                    }
                    log.debug("::SelectContactComm ctoPath found::");
                }            
                else if(itemsList[j].ctoPath === null || itemsList[j].ctoPath === "" || itemsList[j].ctoPath === undefined){
                    //Setting default Image when ctoPath from Appsdk is null or blank
                    item.image1 = "common/images/icons/IcnListContact_Placeholder.png";
                    log.debug("::SelectContactComm ctoPath not found::");
                }
                dataList.items.push(item);
                j+=1;
            }
            else
            {           var item = { 
                        appData : null,
                        text1 : '',
                        itemStyle : "style01",
                        image1:null,
                        hasCaret : false
                    };
                dataList.items.push(item);
            }
        }
        currentList.setDataList(dataList);
    }
    else
    {
        // This condition is called when scrolling the contact // Add items to existing dataList
        for (var i = offset ; i < (offset+this._contactsListCount); i++)
        {
                currentList.dataList.items[i].appData = { contactId : itemsList[j].contactId, displayName : itemsList[j].displayName },
                currentList.dataList.items[i].text1 = itemsList[j].displayName; 
                if (typeof itemsList[j].ctoPath === "string" && itemsList[j].ctoPath.length > 0)
                {
                    currentList.dataList.items[i].image1 = itemsList[j].ctoPath;
                    if(this._contactIdFreeList.indexOf(itemsList[j].contactId) == -1){
                        log.debug("_addContactsToList contactId Present"+this._contactIdFreeList.indexOf(itemsList[j].contactId));
                        this._contactIdFreeList.push(itemsList[j].contactId);
                        this._dbSeqNo.push(itemsList[j].dbSeqNo);
                    }else{
                        log.debug("#Fav:_addContactsToList contactId Already Present");
                    }
                }
                else
                {
                    //Setting the default path for contact images if no ctopath from appsdk
                    currentList.dataList.items[i].image1 = "common/images/icons/IcnListContact_Placeholder.png";
                    
                }
                currentList.dataList.items[i].itemStyle = "style01";
                currentList.dataList.items[i].hasCaret = false;
                j+=1;
        }
    }
    var listUpdateCount = totalCount - 1; //list count starts from 0.
    currentList.updateItems(offset, listUpdateCount);
    }
};

//SelectContactCommItemCallback
favoritesApp.prototype._selectContactCommItemCallback = function(controlRef, appData, params)
{
    var payload = this._getContextPayload();    
    if (payload && payload.detailSelection)
    {        
        var params = {
            payload : {
                contactId : appData.contactId, 
                deviceId : this._getPhoneDeviceId(),
                displayName : appData.displayName
            }
        };         
        framework.sendEventToMmui(this.uiaId, "SelectContactList", params );
    }
};

//Add contact items to the list2 control
favoritesApp.prototype._addContactsToNaviList = function(itemsList, offset, totalCount)
{
    if (this._currentContextTemplate && this._currentContext && this._currentContext.ctxtId === "SelectContactNavi")
    {
    var currentList = this._currentContextTemplate.list2Ctrl;
    var j = 0 ;
    if (!currentList.hasDataList())
    {
        // Set initial dataList
        var dataList = {};
        dataList.itemCountKnown = true;
        dataList.itemCount = totalCount;
        dataList.items = [];

        for (var i = offset ; i < totalCount; i++)
        {
            //this._contactsListCount is the total count requested
            if(i >= 0 && i < (offset+this._contactsNaviListCount)){
               var item = { 
                    appData : { contactId : itemsList[j].contactId, displayName : itemsList[j].displayName },
                    text1 : itemsList[j].displayName,      
                    itemStyle : "style01",
                    image1:null,
                    hasCaret : false
                };
                if (typeof itemsList[j].ctoPath === "string" && itemsList[j].ctoPath.length > 0)
                {
                    item.image1 = itemsList[j].ctoPath;
                    if(this._contactIdFreeList.indexOf(itemsList[j].contactId) == -1){
                        log.debug("_addContactsToList contactId Present"+this._contactIdFreeList.indexOf(itemsList[j].contactId));
                        this._contactIdFreeList.push(itemsList[j].contactId);
                        this._dbSeqNo.push(itemsList[j].dbSeqNo);
                    }else{
                        log.debug("_addContactsToList contactId Already Present");
                    }
                    log.debug("::SelectContactNavi ctoPath found::");
                }            
                else if(itemsList[j].ctoPath === null || itemsList[j].ctoPath === "" || itemsList[j].ctoPath === undefined){
                    item.image1 = "common/images/icons/IcnListContact_Placeholder.png";
                    log.debug("::SelectContactNavi ctoPath not found::");
                }
                dataList.items.push(item);
                j+=1;
            }
            else
            {
                var item = { 
                        appData : null,
                        text1 : '',
                        itemStyle : "style01",
                        image1:null,
                        hasCaret : false
                    };
                dataList.items.push(item);
            }
        } 
        currentList.setDataList(dataList);
    }
    else
    {
        for (var i = offset ; i < (offset+this._contactsNaviListCount); i++)
        {
                currentList.dataList.items[i].appData = { contactId : itemsList[j].contactId, displayName : itemsList[j].displayName },
                currentList.dataList.items[i].text1 = itemsList[j].displayName; 
                if (typeof itemsList[j].ctoPath === "string" && itemsList[j].ctoPath.length > 0)
                {
                    currentList.dataList.items[i].image1 = itemsList[j].ctoPath;
                    if(this._contactIdFreeList.indexOf(itemsList[j].contactId) == -1){
                        log.debug("_addContactsToList contactId Present"+this._contactIdFreeList.indexOf(itemsList[j].contactId));
                        this._contactIdFreeList.push(itemsList[j].contactId);
                        this._dbSeqNo.push(itemsList[j].dbSeqNo);
                    }else{
                        log.debug("_addContactsToList contactId Already Present");
                    }
                }
                else
                {
                    //Setting the default path for contact images if no ctopath from appsdk
                    currentList.dataList.items[i].image1 = "common/images/icons/IcnListContact_Placeholder.png";
                    
                }
                currentList.dataList.items[i].itemStyle = "style01";
                currentList.dataList.items[i].hasCaret = false;
                j+=1;
        }
    }
    var listUpdateCount = totalCount - 1; //list count starts from 0.
    currentList.updateItems(offset, listUpdateCount);
   }
};
//SelectContactNaviItemCallback
favoritesApp.prototype._selectContactNaviItemCallback = function(controlRef, appData, params)
{   
    // Call DBAPI PB to get contact details and then send SelectContactListAddress event
    if (this._isContactsDbOpen)
    {         
        var params = {
            "deviceId" : this._getPhoneDeviceId(),
            "contactId" : appData.contactId,
            "displayName" : appData.displayName,
        };
        framework.sendRequestToDbapi(this.uiaId, this._contactDetailsToSelectContactListAddress.bind(this), "pb", "GetContactDetails", params);
    }     
};

favoritesApp.prototype._contactDetailsToSelectContactListAddress = function(msg)
{
    if (msg && msg.msgContent && msg.msgContent.params)
    {
        var contact = msg.msgContent.params;

        var params = {
            payload : {
                "contactId" : contact.contactId,
                "deviceId" : this._getPhoneDeviceId(),
                "displayName" : contact.displayName
            }
        };
        framework.sendEventToMmui(this.uiaId, "SelectContactList", params );
    }
};

// SelectContactCommDetails
favoritesApp.prototype._readySelectContactCommDetails = function(params)
{
    var payload = this._getContextPayload();
    if(!this._isContactsDbOpen){
        log.debug("contact db is not open, opening the contactDB with devId:: "+this._getPhoneDeviceId());
         var params = {
                 "deviceId" : this._getPhoneDeviceId(), 
             };
             framework.sendRequestToDbapi(this.uiaId, this._openContactsDbCallbackFn.bind(this), "pb", "OpenContactsDb", params);
     }else{
        log.debug("contact db is already open");
     }
    if (payload !== null && this._isContactsDbOpen)
    {
        var params = {
            "deviceId" : this._getPhoneDeviceId(),
            "contactId" : payload.contactId,
            "ctoType" : "None",
        };
        framework.sendRequestToDbapi(this.uiaId, this._getContactCommDetailsCallbackFn.bind(this), "pb", "GetContactDetails", params);
    }
};

//SelectContactNaviDetails
favoritesApp.prototype._readySelectContactNaviDetails = function(params)
{
 var payload = this._getContextPayload();
 if(!this._isContactsDbOpen){
      var params = {
              "deviceId" : this._getPhoneDeviceId(), 
          };
          framework.sendRequestToDbapi(this.uiaId, this._openContactsDbNaviCallbackFn.bind(this), "pb", "OpenContactsDb", params);
  }else{
     log.debug("contact db is already open");
  }
 if (payload !== null && this._isContactsDbOpen)
 {
     var params = {
         "deviceId" : this._getPhoneDeviceId(),
         "contactId" : payload.contactId,
         "ctoType" : "None",
     };
     framework.sendRequestToDbapi(this.uiaId, this._getContactNaviDetailsCallbackFn.bind(this), "pb", "GetContactDetails", params);
 }
};

favoritesApp.prototype._openContactsDbCallbackFn = function(msg){
     if (msg.msgContent.params.eCode == 0){
        if(this._currentContext && this._currentContextTemplate)
        {
            log.debug("setting flag to true");
            this._isContactsDbOpen = true ;
            var payload = this._getContextPayload();
            var params = {
              "deviceId" : this._getPhoneDeviceId(),
              "contactId" : payload.contactId,
              "ctoType" : "None",
           };
           framework.sendRequestToDbapi(this.uiaId, this._getContactCommDetailsCallbackFn.bind(this), "pb", "GetContactDetails", params);
        }
    }
};

favoritesApp.prototype._openContactsDbNaviCallbackFn = function(msg){
    if (msg.msgContent.params.eCode == 0){
       if(this._currentContext && this._currentContextTemplate)
       {
           log.debug("setting flag to true");
           this._isContactsDbOpen = true ;
           var payload = this._getContextPayload();
           var params = {
             "deviceId" : this._getPhoneDeviceId(),
             "contactId" : payload.contactId,
             "ctoType" : "None",
          };
           framework.sendRequestToDbapi(this.uiaId, this._getContactNaviDetailsCallbackFn.bind(this), "pb", "GetContactDetails", params);
       }
   }
};

favoritesApp.prototype._getContactCommDetailsCallbackFn = function(msg)
{
    var params = msg.msgContent.params;
    var payload = this._getContextPayload();
    
    if (payload != null && params.eCode === 0)
    {
        var list2Ctrl = this._getCurrentContextListCtrl();

        if (list2Ctrl)
        {
            // Set title
            //check whether firstName is present
            if(params.firstName)
            {
                var contact = { name: params.firstName };
            }
            else
            {
                var contact = { name: params.lastName };
            }
            var title = {
                text1 : this._localize("selectContactDetailsTitle", contact),
                titleStyle : "style02"
            };
            list2Ctrl.setTitle(title);

            // Set list2Ctrl data
            var data = {
                itemCountKnown: true,
                itemCount: null,
                items: [],
            };            
            var _itemCount = 0 ; // this is to track the itemcount
            // Only numbers are shown with comm favorites
            for (var i = 0; i < params.numbers.length; i++)
            {
             var flag = this._validatePhoneNumber(params.numbers[i].number);
             if(flag){
                var contactAppData = {
                    type: "number",
                    contactId : params.contactId,
                    displayName : params.displayName,
                    number : params.numbers[i].number,
                    category : params.numbers[i].category
                };
                data.items.push({
                    appData : contactAppData,
                    text1 : params.numbers[i].number,
                    label1Id : this._convertContactDetailsNumberCategoryToDictionaryId(params.numbers[i].category), 
                    itemStyle : "style14",
                    hasCaret : false,
                    //text1Align : "left"
                });
                if(this._contactIdFreeList.indexOf(params.contactId) == -1){
                    this._contactIdFreeList.push(params.contactId); 
                    this._dbSeqNo.push(params.dbSeqNo);
                }else{
                    log.debug("_getContactCommDetailsCallbackFn contactId Already Present");
                }
                _itemCount+=1;
                log.debug("::SelectContactCommDetail::Valid phone number::");
            }else{
               log.debug("::SelectContactCommDetail::Invalid phone number::");
            }
            }
            data.itemCount = _itemCount ;
            list2Ctrl.setDataList(data);
            list2Ctrl.updateItems(0, data.itemCount - 1);
        }
    }
    else{
        log.warn("#Fav::getContactCommDetails Failed");
        this._currentContextTemplate.list2Ctrl.setLoading(false);
   }
};


favoritesApp.prototype._getContactNaviDetailsCallbackFn = function(msg)
{
    var params = msg.msgContent.params;
    var payload = this._getContextPayload();
    
    if (payload != null && params.eCode === 0)
    {
        var list2Ctrl = this._getCurrentContextListCtrl();

        if (list2Ctrl)
        {
            // Set title
            //check whether firstName is present
            if(params.firstName)
            {
                var contact = { name: params.firstName };
            }
            else
            {
                var contact = { name: params.lastName };
            }
            var title = {
                text1 : this._localize("selectContactNaviDetailsTitle", contact),
                titleStyle : "style02"
            };
            list2Ctrl.setTitle(title);

            // Set list2Ctrl data
            var data = {
                itemCountKnown: true,
                itemCount: 1, //since need to show one list2Ctrl of address
                items: [],
            };            
          //Code for hide the Loading Spinner when no valid addres is avail
            if(params.address.street!=null && params.address.street!="" || params.address.city!=null && params.address.city!="" ||
               params.address.region!=null && params.address.region!="" ||
               params.address.country!=null && params.address.country!="" || params.address.zipcode!=null && params.address.zipcode!=""){
               log.debug("#Fav:Valid entry Available");
            }else{
               data.itemCount = 0 ;
               this._currentContextTemplate.list2Ctrl.setLoading(false);
               return ;
            }//End of code validation
            var addressDetail = "" ;
            this.defaultRegionSetNavi = this._checkRegionDetail();
            if(this.defaultRegionSetNavi !=null && this.defaultRegionSetNavi != undefined){
               switch (this.defaultRegionSetNavi) {
                case framework.localize.REGIONS.Europe:
                   addressDetail = params.address.street +", "+ params.address.zipcode + ", " + params.address.city + ", " + params.address.country ;
                break;
                case "Region_4A":
                case framework.localize.REGIONS.NorthAmerica:
                   addressDetail = params.address.street +", "+ params.address.city + ", "+ params.address.region +" "+ params.address.zipcode + ", " + params.address.country ;
                   break;
                case framework.localize.REGIONS.Japan:
                    addressDetail = " "+params.address.region + params.address.city +  params.address.street + ", "+params.address.zipcode +", "+ params.address.country;
                break;
                default:
                   addressDetail = params.address.street +", "+ params.address.city + ", "+ params.address.region +" "+ params.address.zipcode + ", " + params.address.country ;
                break;
               }
            }else{
                   addressDetail = params.address.street +", "+ params.address.city + ", "+ params.address.region +" "+ params.address.zipcode + ", " + params.address.country ;
            }
            
            // Only address is shown with navi favorites
                data.items.push({
                    appData : {
                        type: "address",
                        displayName:params.displayName,
                        favNaviAddr:{
                        street:params.address.street,
                        city:params.address.city,
                        region:params.address.region,
                        country:params.address.country,
                        zipCode:params.address.zipcode
                        }
                    },
                    label1Id : "phoneNumberCategoryAddress",
                    text1 : addressDetail,
                    itemStyle : "style17",
                    hasCaret : false,
                    labelWidth : "wide"
                });
            }    
            list2Ctrl.setDataList(data);
            list2Ctrl.updateItems(0, data.itemCount - 1);
    }
    else{
        log.warn("#Fav::getContactNaviDetails Failed");
        this._currentContextTemplate.list2Ctrl.setLoading(false);
   }    
};

// Given a phone number category from DBAPI PB GetContactDetails, this function returns
// a favorites dictionary ID to use to display that category.
favoritesApp.prototype._convertContactDetailsNumberCategoryToDictionaryId = function(category)
{
    switch (category)
    {
        case "Mobile":
        case "Home_Mobile":
            return "phoneNumberCategoryMobile";
            break;

        case "Phone":
        case "Home_Phone":
            return "phoneNumberCategoryHome";
            break;

        case "Office_Phone":
        case "Office_Mobile":
            return "phoneNumberCategoryWork";
            break;

        default:
            return "phoneNumberCategoryOther";
            break;
    }
};

favoritesApp.prototype._selectContactCommDetailsItemCallback = function(controlRef, appData, params)
{        
    if (appData.type === "number")
    { 
        var params = {
            payload : {
                contactId : appData.contactId,
                deviceId : this._getPhoneDeviceId(),
                displayName : appData.displayName,
                phoneNumber : appData.number,
                numberType : appData.category,
            }
        };
        framework.sendEventToMmui(this.uiaId, "SelectDetailsNumber", params );
    }
};

favoritesApp.prototype._selectContactNaviDetailsItemCallback = function(controlRef, appData, params)
{      
    if ( appData.type === "address" )
    {
        var data = {
            payload: {
                contactId: 0,
                displayName: appData.displayName,
                "streetAddress" : {
                    "addressLine1"  : appData.favNaviAddr.street,
                    "addressLine2"  : "",
                    "city"          : appData.favNaviAddr.city,
                    "stateProvince" : appData.favNaviAddr.region,
                    "country"       : appData.favNaviAddr.country,
                    "code"          : appData.favNaviAddr.zipCode,
                }                
            }
        };         
        framework.sendEventToMmui(this.uiaId, "SelectDetailsAddress", data);
    }
};

// FavoritesNaviTab
favoritesApp.prototype._getFavoritesNaviTabListData = function()
{
    var data = {
      itemCountKnown: true,
      itemCount: 1,
      items: [{
            appData : "SelectAddEditFavorite",
            text1Id : "addEditNaviFavorite",
            selected : false,
            disabled : false,
            toggled : 0,
            itemStyle : "style01",
            hasCaret : false
        },
        {
            appData : "SelectHome",
            text1Id : "Home",
            itemStyle : "style01",
            hasCaret : false,
            itemBehavior:'shortAndLong'
        }],
    };
    log.debug("[SelectHome event _getFavoritesNaviTabListData]");
    var itemBehavior = "shortAndLong" ;
    if(this._isSdCardConnected){
       data.items = data.items.concat(this._getFavoritesAsListItems(this._EnumTabNavi, itemBehavior));
       data.itemCount = this._favoritesTotalCount + 2;
    }else{
        data.items[0].disabled = true ;
        data.items[1].disabled = true ;
        data.itemCount = 2;
    }
    return data;
};

//
favoritesApp.prototype._NeedDataSelectFavoriteCallback = function(bool,index, params)
{
    log.info('_NeedDataSelectFavoriteCallback :: (bool,index,params) :: '  +  bool + ' , ' + index + ' , ' , params );
    log.debug('Index will be incremented depending on value of this.isHomeSet: ' + this.isHomeSet);

    //if(this._blockNeedDataCallback === false)
    {
        //this._cachedSelectFavoriteIndex = index;
        var callback = this._GetFavoritesItemsCallback.bind(this);
          
        if(this.isHomeSet)
        {
            index = index + 1;
        }
        log.debug("index "+index);


        var params = {
            "StartIndex" : index,
            "MaxItems" : 20
        };

        //if(this._updateDone)
        if(index > this._cachedSelectFavoriteIndex  && index <(this._cachedSelectFavoriteIndex + 15) || index == 0)
        {
            //We already have the data.
            log.warn('Need data not processed for index : ' + index);
            return;  
        }
        else
        {
            this._cachedSelectFavoriteIndex = index;
            this._updateDone = false;
            log.warn("_NeedDataSelectFavoriteCallback :: Calling 'GetFavoriteList' with StartIndex: " + params.StartIndex);
            framework.sendRequestToAppsdk(this.uiaId, callback ,"navifav", "GetFavoriteList", params);
        }
    }
};

// this is called when list needs more data to display when scrolling
favoritesApp.prototype._naviFavoriteNeedDataCallback = function(index)
{
    log.debug('_naviFavoriteNeedDataCallback :: (index) :: ('  + index  + ')');
    this._cachedOffset = index;
    if(this._cachedOffset > 2)
    {
        this._cachedOffset = this._cachedOffset - 1;
    }

    var params = {
        "StartIndex" : this._cachedOffset,
        "MaxItems" : 20
    };
               
    framework.sendRequestToAppsdk(this.uiaId, this._GetAppSDKResponseForListCallback.bind(this) ,"navifav", "GetFavoriteList", params);
}



favoritesApp.prototype._naviFavoriteSelected = function(controlRef, appData, params)
{     
    if (appData === "SelectAddEditFavorite")
    {
        framework.sendEventToMmui(this.uiaId, appData);
    }
    else if (appData === "SelectHome")
    {
        var eventData = { 
                payload : {
                    favoritesTab: this._EnumTabNavi,
                    favId: 0
                }
            };
        
        log.debug("[SelectHome event sended::]");
        framework.sendEventToMmui(this.uiaId, "SelectHome",eventData);
    }
    else if (typeof appData === "number")
    {
        
        var fav = this._lookupFavorite(this._EnumTabNavi, appData);
        var pos = null;
        if(fav === null){
            fav = new Object();
            fav["id"] = appData;
            pos = appData - 1;
        }
        else{
            pos = this._indexOfFavorite(this._EnumTabNavi, fav.id);
        }
        if (fav)
        {
            var eventData = { 
                payload : {
                    favoritesTab: this._EnumTabNavi,
                    favId: fav.id,
                    position: pos ,
                    selection: this._getSelectFavoriteListSelectionValue(this._EnumTabNavi, fav.id),
                }
            };
            
            log.debug("NaviFavorite:: SelectFavoriteList (Single Press) event send to mmui"); 
            framework.sendEventToMmui(this.uiaId, "SelectFavoriteList", eventData);
        }
    }
};

favoritesApp.prototype._naviFavoritesLongPress = function(controlRef, appData, params)
{
    if(appData === "SelectHome"){
        var eventData = { 
                payload : {
                    favoritesTab: this._EnumTabNavi,
                    favId: 2000,
                    position:2000
                }
            };        
        log.debug("[SelectHome event sended::]");
        framework.sendEventToMmui(this.uiaId, "SelectFavoriteListLong",eventData);
        log.debug("Long Pressed on SelectHome");
    }else{
        var fav = this._lookupFavorite(this._EnumTabNavi, appData);
        var pos = null;
        if(fav === null){
            fav = new Object();
            fav["id"] = appData;
            pos = appData -1;
        }else{
            pos = this._indexOfFavorite(this._EnumTabNavi, fav.id);
        }
        if (fav)
        {
        var eventData = { 
            payload : {
                favoritesTab: this._EnumTabNavi,
                favId: fav.id,
                position: pos
            }
        };
        log.debug("NaviFavorite:: SelectFavoriteListLong (Long Press) event send to mmui"); 
        framework.sendEventToMmui(this.uiaId, "SelectFavoriteListLong", eventData);
      }
   }
};

// AddEditFavoritesNavi
favoritesApp.prototype._readyAddEditFavoritesNavi = function()
{
    var list2Ctrl = this._getCurrentContextListCtrl();
    var data = list2Ctrl.dataList;
    //New Updated for Speed Restriction accrd to UI Spec SCR SW00129389 for Navigation Tab
    this._populateAddEditNaviFavoritesItemList(list2Ctrl,data);
};

//Since the icons and speedRestriction requirement are similar for AddEditFavoritesNavi and EditFavoritesNavi, implemented both here 
favoritesApp.prototype._populateAddEditNaviFavoritesItemList = function(list2Ctrl,data){
    // Update the add from destination item if there is a destination
    var payload = this._getContextPayload();
    if (payload != null)
    {
        var hasRoute = payload.naviDestination === "RouteExists";
        var imgPath = "common/images/icons/IcnListNavPoi_En.png" ;
        //New Updated for Speed Restriction accrd to UI Spec SCR SW00129389 for Navigation Tab
        if(hasRoute){
           if(framework.common.getAtSpeedValue()){
             imgPath = "common/images/icons/IcnListNavPoi_Ds.png" ;
             data.items[1].disabled = true ;
             data.items[1].image1 = imgPath ;
           }else{
             imgPath = "common/images/icons/IcnListNavPoi_En.png" ;
             data.items[1].disabled = !hasRoute;
             data.items[1].image1 = imgPath ;
           }
        }else{
            log.debug("Route not exist");
            data.items[1].disabled = !hasRoute;
            data.items[1].image1 = "common/images/icons/IcnListNavPoi_Ds.png" ;
        }
    }

    // Updte the add from (phone) contact item
    if (this._isPhoneConnected)
    {
        //New Updated for Speed Restriction accrd to UI Spec SCR SW00129389 for Navigation Tab
        if(framework.common.getAtSpeedValue()){
            data.items[2].disabled = true;
            data.items[2].image1 = "common/images/icons/IcnListContact_Ds.png";
        }else{
            data.items[2].disabled = false;
            data.items[2].image1 = "common/images/icons/IcnListContact_En.png";
        }
    }
    else
    {
        data.items[2].disabled = true;
        data.items[2].image1 = "common/images/icons/IcnListContact_Ds.png";
    }

    // Update the speed restricted items
    if (framework.common.getAtSpeedValue())
    {
        //New Updated for Speed Restriction accrd to UI Spec SCR SW00129389 for Navigation Tab
        data.items[0].disabled = true;
        data.items[0].image1 = "common/images/icons/IcnListNavPoi_Ds.png";
        
        log.debug("Vehicle at speed, disabling speed restricted entry"); 
        data.items[3].disabled = true;
        data.items[3].image1 = "common/images/icons/IcnListMove_Ds.png";

        data.items[4].disabled = true;
        data.items[4].image1 = "common/images/icons/IcnListRename_Ds.png";

        data.items[5].disabled = true;
        data.items[5].image1 = "common/images/icons/IcnListDelete_Ds.png";
    }
    else
    {
        //New Updated for Speed Restriction accrd to UI Spec SCR SW00129389 for Navigation Tab
        data.items[0].disabled = false;
        data.items[0].image1 = "common/images/icons/IcnListNavPoi_En.png";
        
        log.debug("Vehicle speed below threshold , enabling speed restricted entry"); 
        data.items[3].disabled = false;
        data.items[3].image1 = "common/images/icons/IcnListMove_En.png";

        data.items[4].disabled = false;
        data.items[4].image1 = "common/images/icons/IcnListRename_En.png";

        data.items[5].disabled = false;
        data.items[5].image1 = "common/images/icons/IcnListDelete_En.png";
    }
    log.debug("#Fav:AddEditFavoritesNavi Context:: populateAddEditNaviFavoritesItemList called IsHomeSet flag is::"+this.isHomeSet);
    //AddEditFavoritesNavi - includes additional logic for DeleteHome
    if(this._currentContext && this._currentContext.ctxtId === "AddEditFavoritesNavi")
    {
        this._checkSetHomeStatus();
        log.debug("#Fav:AddEditFavoritesNavi Context:: populateAddEditNaviFavoritesItemList after calling this._checkSetHomeStatus()::IsHomeSet flag is::"+this.isHomeSet);
        if(this.isHomeSet){
            data.items[6].disabled = false ;
        }else{
            data.items[6].disabled = true ;
        }
        list2Ctrl.updateItems(0, 7);
    }
    //Check for EditFavoritesNavi
    else if(this._currentContext && this._currentContext.ctxtId === "EditFavoritesNavi")
    {
        log.debug("#Fav:this._isUpdateReplaceNaviList::"+this._isUpdateReplaceNaviList)
        if(this._isUpdateReplaceNaviList && this._currentContext.ctxtId === "EditFavoritesNavi")
        {
              this._isUpdateReplaceNaviList = false;              
              this._checkSetHomeStatus();
              log.info("#Fav:AddEditFavoritesNavi Context:: populateAddEditNaviFavoritesItemList after calling this._checkSetHomeStatus()::IsHomeSet flag is::"+this.isHomeSet);
              if(this.isHomeSet)
              {
                data.items[6].disabled = false ;
              }
              else
              {
                data.items[6].disabled = true ;
              }
        }
        else
        {
              log.debug("#Fav:this._isUpdateReplaceNaviList is false")
        }
        list2Ctrl.setDataList(data);
        list2Ctrl.updateItems(0, 7);
    }
};

favoritesApp.prototype._addEditFavoritesNaviItemCallback = function(controlRef, appData, params)
{
    switch (appData)
    {
        case "SelectAddLocation":        // intentional fallthrough
        case "SelectAddDestination":     // intentional fallthrough
        case "SelectAddContactAddress":  // intentional fallthrough
        case "SelectMove":               // intentional fallthrough
        case "SelectDelete":             // intentional fallthrough
        case "SelectRename":             // intentional fallthrough
        case "SelectEditHome":  
            framework.sendEventToMmui(this.uiaId, appData);
            break;
        case "SelectDeleteHome": 
            this._favoritesTotalCount = this._favoritesTotalCount - 1 ;
            framework.sendEventToMmui(this.uiaId, appData);
            break;
        default:
         break;
    }
};

// EditFavoritesNavi
favoritesApp.prototype._readyEditFavoritesNavi = function()
{
    var list2Ctrl = this._getCurrentContextListCtrl();
    var data = list2Ctrl.dataList;
    // Update title with the favorite"s name
    var context = this._getContextPayload();
    if (context)
    {
        if(context.favId === 2000){
            list2Ctrl.setTitle( { titleStyle: "style02", text1Id: "Home" } );
            this._isUpdateReplaceNaviList = true ;
            this._populateUnSetHomeList();
        }else{
              var fav = this._lookupFavorite(this._EnumTabNavi, context.favId);
              if (fav)
              {
                  list2Ctrl.setTitle( { titleStyle: "style02", text1: fav.name } );
              }
              this._populateEditFavoritesNaviList();
        }
    }
};
//helper function
favoritesApp.prototype._populateUnSetHomeList = function(){
    //var currentList = this._currentContextTemplate.list2Ctrl;
    var currentList = this._getCurrentContextListCtrl() ;
    currentList.dataList.items[0] = 
    {
            appData : "EditHome",
            text1Id: "EditHome",
            itemStyle : "style01",
            disabled : false,
            hasCaret:false,
            itemBehavior : "shortPressOnly",
            image1 : null
    };
    currentList.dataList.items[1] = 
    {
            appData : "DeleteHome",
            text1Id: "UnsetHome",
            itemStyle : "style01",
            disabled : false,
            hasCaret:false,
            itemBehavior : "shortPressOnly",
            image1 : null
    };
    log.debug("#Fav:EditFavoritesNavi Context:: populateUnSetHomeListHome called IsHomeSet flag is::"+this.isHomeSet);
    this._checkSetHomeStatus();
    log.debug("#Fav:EditFavoritesNavi Context:: populateUnSetHomeListHome after calling this._checkSetHomeStatus()::IsHomeSet flag is::"+this.isHomeSet);
    if(this.isHomeSet){
        currentList.dataList.items[1].disabled = false ;
    }else{
        currentList.dataList.items[1].disabled = true ;
    }
    currentList.dataList.itemCount = 2;
    var dataList = currentList.dataList;
    currentList.setDataList(dataList);
    currentList.updateItems(0, 1);
};

favoritesApp.prototype._populateEditFavoritesNaviList = function(){
   var currentList = this._getCurrentContextListCtrl() ;
   currentList.dataList.itemCountKnown = true;
   currentList.dataList.itemCount = 6;
   currentList.dataList = this._cachedDataListEditnavi ;
   var dataList = currentList.dataList;
   //New Updated for Speed Restriction accrd to UI Spec SCR SW00129389 for Navigation Tab
   this._populateAddEditNaviFavoritesItemList(currentList,dataList);
};

favoritesApp.prototype._editFavoritesNaviItemCallback = function(controlRef, appData, params)
{
    switch (appData)
    {
        case "SelectReplaceLocation":        // intentional fallthrough
        case "SelectReplaceDestination":     // intentional fallthrough
        case "SelectReplaceContactAddress":  // intentional fallthrough
        case "SelectEditMove":               // intentional fallthrough
        case "SelectEditRename":             // intentional fallthrough
        case "SelectEditDelete":
            var context = this._getContextPayload();
            if (context)
            {
                var data = { 
                    payload : {
                        favId: context.favId,
                        position: context.position
                    }
                };
                framework.sendEventToMmui(this.uiaId, appData, data);
            }
            break;
        case "DeleteHome" :
            framework.sendEventToMmui(this.uiaId, "SelectDeleteHome", null);
          break;
          case "EditHome":
            framework.sendEventToMmui(this.uiaId, "SelectEditHome", null);
          break;
        default:
            break;
    }
};

// QwertyEntry
favoritesApp.prototype._contextInQwertyEntry = function()
{
    var payload = this._getContextPayload();
    if (payload !== null)
    {
        var fav = this._lookupFavorite(payload.favoritesTab, payload.favId);
        if (fav !== null)
        {
            this._contextTable["QwertyEntry"].sbName = this._localize("renameFavoriteTitle", { name: fav.name } );
            this._contextTable["QwertyEntry"].controlProperties.KeyboardCtrl.value = fav.name;
        }
    }
    log.debug("::contextInQwertyEntry::");
};

favoritesApp.prototype._noLongerDisplayedQwertyEntry = function(){
    this._contextTable["QwertyEntry"].controlProperties.KeyboardCtrl.value = "";
};

favoritesApp.prototype._qwertyEntryOk = function(controlRef, appData, params)
{
    var payload = this._getContextPayload();
    if (payload !== null)
    {
        var data = { 
            payload : {
                favId : payload.favId,
                favoritesTab : payload.favoritesTab,
                displayName : params.input,
            }
        };
        framework.sendEventToMmui(this.uiaId, "RenameFavorite", data);
    }
};

favoritesApp.prototype._qwertyEntryCancel = function(controlRef, appData, params)
{
    framework.sendEventToMmui("common", "Global.GoBack");
};

//Below function is used to validate the phone number 
favoritesApp.prototype._validatePhoneNumber = function(number){
    //below regular expression is used to validate the phone Number('allowed number [0-9],.,(),+,-') 
     var pattern=new RegExp(/^[0-9+\(\+\*\)#\.\s\/ext-]+$/);
     return pattern.test(number);
};

/**************************
 * Framework register
 **************************/
framework.registerAppLoaded("favorites", null, true);