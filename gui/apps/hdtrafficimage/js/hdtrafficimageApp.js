/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: hdtrafficimageApp.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: atiwarc
 Date:  05-Feb-2013
 __________________________________________________________________________

 Description: IHU GUI HD Traffic Image App
 Revisions:
 v0.1 (05-February-2013)  HDTrafficApp created - atiwarc
  _________________________________________________________________________

 */
log.addSrcFile("hdtrafficimageApp.js", "hdtrafficimage");

function hdtrafficimageApp(uiaId)
{
    log.debug("HDTraffic constructor called...");
    baseApp.init(this, uiaId);
}

/**************************
 * Standard App Functions *
 **************************/

/*
 * Called just after the app is instantiated by framework.
 */
hdtrafficimageApp.prototype.appInit = function()
{
    log.debug(" hdtraffic appInit  called...");
    if (framework.debugMode)
    {
        utility.loadScript("apps/hdtrafficimage/test/hdtrafficimageAppTest.js");
    }

    this.mapTypeInfo = new Array();

    // cache values
    this.mapInfo = new Array();
    this.currentMapType = null;
    this.time = null;
    this.pixelX=null;
    this.pixelY=null;
    this.gpsPosition=null;
    this.position=null;
    this._cachedMapInfo = new Array();
    this._tileCheck=false;
    this._countMapLoad=0;
    this._checkDefaultScroll=0;

    this._reInitialiseCachedMapInfo();
    
    //this.currentBannerPath="./apps/hdtrafficimage/controls/Traffic/images/hd_bright.png";
     this._hdLogoStatus = 0;
    log.debug("hdtraffic appInit  called");
    //@formatter:off
    this._contextTable = {
        //HDTraffic
        "HDTrafficImage" :{
            "template" : "TrafficTmplt",
            "sbNameId" : "HDRadio",
            "templatePath" : "apps/hdtrafficimage/templates/TrafficTmplt",
            "leftBtnStyle" : "goBack",
            "controlProperties" : {
                "TrafficCtrl" : {
                    defaultImagepath : this._cachedMapInfo,
                    defaultUpdatedTime : null,
                    trafficLogoPath : null,
                    trafficBannerpath : this.currentBannerPath,
                    bgColor:{R : null,G : null,B : null}
                }
            },
            "readyFunction" : this._HDTrafficImageCtxtTmpltReadyToDisplay.bind(this),
            "noLongerDisplayedFunction" : this._HDTrafficImageNoLongerDisplayedFunction.bind(this),
        },// end of "hdtraffic"
    };// end of this.contextTable

    //@formatter:off
    this._messageTable = {
        // Message handlers
        UpdatedMapInfo : this.updatedMapInfoMsgHandler.bind(this),
        BGColorInfo : this.bgColorInfoMsgHandler.bind(this),
        GPSInfo : this.gpsInfoMsgHandler.bind(this),
        HDTuneStatus : this.hDLogoInfoMsgHandler.bind(this),
        TestModeText : this.TestModeTextMsgHandler.bind(this),
        LastTileUpdateTime : this.LastTileUpdateTimeMsgHandler.bind(this)
    };// end of this._messageTable

    //@formatter:on
    this.populateMapTypeTmplt(); // populate map type info as per MMUI payload and parse it
    
};

// HDTrafficImage context
hdtrafficimageApp.prototype._HDTrafficImageCtxtTmpltReadyToDisplay = function(params)
{
    log.debug("In _HDTrafficImageCtxtTmpltReadyToDisplay..");
    if(params && params.skipRestore !== null)
    {
        params.skipRestore = true;
    }
    if (this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId == "HDTrafficImage")
    {
       if(this.pixelX && this.pixelY && this.gpsPosition)
       {
            this._countMapLoad = 0;
            if((this.gpsPosition === "Good" || this.gpsPosition === "Poor") && this.pixelY > 370 && this._checkDefaultScroll === 1)
            {
                this._currentContextTemplate.trafficCtrl.MapPosition(this.pixelY,this._checkDefaultScroll);
                this._checkDefaultScroll = 0;
            }
       }  
        this._showHDLogoStatus();
        if(this.bgColorR && this.bgColorG && this.bgColorB)
        {
            this._currentContextTemplate.trafficCtrl.setMapBackground(this.bgColorR,this.bgColorG,this.bgColorB);
        }
        if(this.updateTime !== null)
        {   
            this._setTime(this.updateTime);
        }
        if(this.testText)
        {
            this._setTestModeText(this.testText);
        }
        if(this.mapInfo && this.currentMapType)
        {
            this._updateAllMapTiles(this.mapInfo,this.currentMapType);
        }
        if(this.pixelX && this.pixelY && this.gpsPosition)
        {
            this._populateGPSInfo();
        }
    }
};

// HDTrafficImage context
hdtrafficimageApp.prototype._HDTrafficImageNoLongerDisplayedFunction = function()
{
    log.debug("In _HDTrafficImageNoLongerDisplayedFunction..");
    this._reInitialiseCachedMapInfo();
    this._tileCheck = false;
};

hdtrafficimageApp.prototype.hDLogoInfoMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload)
    {
        var payloadParam = msg.params.payload;
        if(payloadParam.HDStatus !== null)
        {
            this._hdLogoStatus = payloadParam.HDStatus;
            if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "HDTrafficImage")
            {
                this._showHDLogoStatus();
            }
        }
    }
}

hdtrafficimageApp.prototype.updatedMapInfoMsgHandler = function(msg)
{
    log.debug("inside updatedMapInfoMsgHandler");
    if(msg && msg.params && msg.params.payload)
    {
        var payloadParam = msg.params.payload;
        if(payloadParam.MapInfo)
        {
            this.mapInfo = payloadParam.MapInfo;
        }
        if(payloadParam.MapType)
        {
            this.currentMapType = payloadParam.MapType;
        }
        log.debug("Current Map Type Received : " + this.currentMapType);
        if(this.currentMapType == "MapType_All" || this.currentMapType == "MapType_Tmt_All")
        {
            this._tileCheck = false;
            log.debug("Using updatedMapInfoMsgHandler if currentMapType is MapType_All, isTileLoaded : "+this._tileCheck);
            this._reInitialiseCachedMapInfo();
        }
        this._mapTilesToArray(this.mapInfo);
        if(this.mapInfo.length != 0)
        {
            for(var index = 0; index < 9; index++)
            {
                if ( this._cachedMapInfo && this._cachedMapInfo[index] && this._cachedMapInfo[index].mapName != "none" )
                {
                    this._tileCheck = true;
                    if(this._countMapLoad === 0)
                    {
                        this._checkDefaultScroll = 1;
                        this._countMapLoad = 1;
                    }
                    log.debug("TileChecking is made to: "+this._tileCheck);
                }
            }
        }
        if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId === "HDTrafficImage")
        {
            this._updateAllMapTiles();
            //update GPS marker position
            if(this.gpsPosition === "Good" || this.gpsPosition === "Poor")
            {
                log.debug("GpsPosition :"+this.gpsPosition);
                if(this.mapInfo.length!=0 && this._tileCheck==true)
                {
                    log.debug("Map loaded : "+this._tileCheck);
                    if((this.gpsPosition === "Good" || this.gpsPosition === "Poor") && this.pixelY > 370 && this._checkDefaultScroll==1)
                    {
                        this._currentContextTemplate.trafficCtrl.MapPosition(this.pixelY,this._checkDefaultScroll);
                    }
                    this._currentContextTemplate.trafficCtrl.updateGpsPosition(this.pixelX,this.pixelY,this.gpsPosition,this._checkDefaultScroll);
                    this._checkDefaultScroll=0;
                    this._currentContextTemplate.trafficCtrl.showGpsMarker();
                }
                else
                {
                    log.debug("Map not loaded");
                    this._currentContextTemplate.trafficCtrl.hideGpsMarker(false);
                }
            }
        }       
    }
};

hdtrafficimageApp.prototype.LastTileUpdateTimeMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.UpdateTime !== null)
    {
        this.updateTime = msg.params.payload.UpdateTime;
        log.debug("In LastTileUpdateTimeMsgHandler, UpdateTime = " + this.updateTime);
        if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId  === "HDTrafficImage")
        {
            this._setTime(this.updateTime);  
        }
    }
};

hdtrafficimageApp.prototype.TestModeTextMsgHandler = function(msg)
{
    if(msg && msg.params && msg.params.payload && msg.params.payload.TestText)
    {
       // this.time = msg.params.payload.timeValue.time;
        this.testText = msg.params.payload.TestText;
        log.debug("in TestModeTextMsgHandler , TestMode = " + this.testText);
        if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId  === "HDTrafficImage")
        {
            this._setTestModeText(this.testText); 
        }
    }
};

hdtrafficimageApp.prototype.bgColorInfoMsgHandler = function(msg)
{
    log.debug("inside bgColorInfoMsgHandler ");
    if(msg && msg.params && msg.params.payload)
    {
        var payLoadMsg = msg.params.payload;
        if(payLoadMsg.ColorR !== null)
        {
            if(payLoadMsg.ColorR === 1000)
            {
                this.bgColorR = null;
            }
            else
            {
                this.bgColorR = payLoadMsg.ColorR;
            }
        }
        if(payLoadMsg.ColorG !== null)
        {
            if(payLoadMsg.ColorG === 1000)
            {
                this.bgColorG = null;
            }
            else
            {
                this.bgColorG = payLoadMsg.ColorG;
            }
        }
        if(payLoadMsg.ColorB !== null)
        {
            if(payLoadMsg.ColorB === 1000)
            {
                this.bgColorB = null;
            }
            else
            {
                this.bgColorB = payLoadMsg.ColorB;
            }
        }
        if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId  === "HDTrafficImage")
        {
            this._currentContextTemplate.trafficCtrl.setMapBackground(this.bgColorR,this.bgColorG,this.bgColorB);
            this._updateAllMapTiles()
        }
    }
};

hdtrafficimageApp.prototype.gpsInfoMsgHandler = function(msg)
{
    log.debug("inside gpsInfoMsgHandler ");
    if(msg && msg.params && msg.params.payload && msg.params.payload.pixelX !== null && msg.params.payload.pixelY !== null && msg.params.payload.position !== null)
    {
       this.pixelX=msg.params.payload.pixelX;
       this.pixelY=msg.params.payload.pixelY;
       this.gpsPosition = msg.params.payload.position;
       this._populateGPSInfo();
    }
};

hdtrafficimageApp.prototype._populateGPSInfo = function()
{
    if(this._currentContext && this._currentContextTemplate && this._currentContext.ctxtId  === "HDTrafficImage")
    {
        if(this.gpsPosition === "Good" || this.gpsPosition === "Poor")
        {
            log.debug("In _populateGPSInfo(), GpsPosition : "+this.gpsPosition);
            if(this.mapInfo.length!=0 && this._tileCheck==true)
            {
                log.debug("In _populateGPSInfo(), Map loaded : "+this._tileCheck);
                if((this.gpsPosition === "Good" || this.gpsPosition === "Poor") && this.pixelY > 370 && this._checkDefaultScroll==1)
                {
                    this._currentContextTemplate.trafficCtrl.MapPosition(this.pixelY,this._checkDefaultScroll);
                }
                this._currentContextTemplate.trafficCtrl.updateGpsPosition(this.pixelX,this.pixelY,this.gpsPosition,this._checkDefaultScroll);
                this._checkDefaultScroll=0;
                this._currentContextTemplate.trafficCtrl.showGpsMarker();
            }
            else
            {
                log.debug("Map not loaded");
                this._currentContextTemplate.trafficCtrl.hideGpsMarker(false);
            }
        }
        else
        {
            this._checkDefaultScroll = 1;
            log.debug("Gps position invalid");
            this._currentContextTemplate.trafficCtrl.hideGpsMarker();
        }
    }
}

hdtrafficimageApp.prototype.populateMapTypeTmplt = function()
{
    var noOfRows = 3;
    var noOfCols = 3;
    for(var row = 1; row <= noOfRows; row++)
    {
        for(var col = 1; col <= noOfCols; col++)
        {
            var mapType = "MapType_Tmt_"+row+col;
            this.mapTypeInfo[mapType] = new Object();
            this.mapTypeInfo[mapType].row = row;
            this.mapTypeInfo[mapType].column = col;
        }
    }
};

/*************************
 *  Utility method to print an array or an object for debuggin purpose
 ************************/

hdtrafficimageApp.prototype._dumpObject = function(object)
{
    if(object == null || object == "undefined")
    {
        return;
    }
    log.debug("***** START **** \n" + JSON.stringify(object, null, 1) + "\n ********** END ******");
};

//Helper function to update tiles
hdtrafficimageApp.prototype._updateAllMapTiles = function()
{
    log.debug("In _updateAllMapTiles...");
    if(this.currentMapType == "MapType_Tmb")  // Only Banner Image
    {
        if(this._currentContextTemplate)
        {
            this._currentContextTemplate.trafficCtrl.showBannerImage(this.currentBannerPath);
        }
    }
    else if(this.currentMapType === "MapType_All") // All Nine tiles images along with banner
    {
        log.debug("Received Banner path : " + this.currentBannerPath);
        this._dumpObject(this._cachedMapInfo);
        if(this._currentContextTemplate && this._currentContextTemplate.trafficCtrl)
        {
            this._currentContextTemplate.trafficCtrl.updateAllMapTiles(this._cachedMapInfo);
            this._currentContextTemplate.trafficCtrl.showBannerImage(this.currentBannerPath);
        }
    }
    else if(this.currentMapType === "MapType_Tmt_All") // All nine tiles are updated, no banner
    {
        this._dumpObject(this._cachedMapInfo);
        if(this._currentContextTemplate)
        {
            this._currentContextTemplate.trafficCtrl.updateAllMapTiles(this._cachedMapInfo);
        }
    }
    else // only a single tile is updated
    {
        if(this.mapInfo && this.mapInfo[0])
        {
            var mapType = this.mapInfo[0].mapType;
            var mapPath = this.mapInfo[0].mapName;
            var mapInfo = {mapType : mapType , mapName : mapPath}
            log.debug("Map Type of the HD Traffic Image : " + mapType);
           
            if(mapType !== "MapType_Tmb" && this.mapTypeInfo[mapType])
            {
                var row = this.mapTypeInfo[mapType].row;
                var col = this.mapTypeInfo[mapType].column;
            }
            log.debug("Row, Column Type Updated  : "+this.mapTypeInfo[mapType]+" , "+col+ " and URL : "+ mapPath);
            if(this._currentContextTemplate)
            {
                this._currentContextTemplate.trafficCtrl.updateAllMapTiles(this._cachedMapInfo);
                this._currentContextTemplate.trafficCtrl.updateMapTile(row, col, mapInfo);
            }
        }
    }
};

//Helper function to update tiles
hdtrafficimageApp.prototype._setTime = function(time)
{
    if(this._currentContextTemplate)
    {
        if(time != null)
        {
            switch(time)
            {
                case 0:
                    this._currentContextTemplate.trafficCtrl.setTimeId("UpdateNow");
                    break;
                case 5:
                case 10:
                case 15:
                case 20:
                case 25:
                case 30:
                case 35:
                case 40:
                case 45:
                    this._currentContextTemplate.trafficCtrl.setTimeId("UpdateTime",{"time" : time});
                    break;
                case 1000:
                    this._currentContextTemplate.trafficCtrl.setTime("");
                    break;
                default:
                    this._currentContextTemplate.trafficCtrl.setTime("");
                    break;
            }
        }
    }
};

hdtrafficimageApp.prototype._setTestModeText = function(testText)
{
    if(this._currentContextTemplate)
    {
        if(testText != null)
        {
            this._currentContextTemplate.trafficCtrl.setTestModeText(testText);
        }
    }
};

hdtrafficimageApp.prototype._mapTilesToArray = function(mapInfo)
{
    var i = 0;
    while (i != mapInfo.length)
    {
        var currentMapInfoIndex = null;
        log.debug(mapInfo.length + " MapType_All :: map Info length :" + mapInfo[i].mapType);
        if (mapInfo[i].mapType == "MapType_Tmt_11")
        {
            this._cachedMapInfo[0] = { mapType : mapInfo[i].mapType, mapName : mapInfo[i].mapName};
        }
        else if (mapInfo[i].mapType == "MapType_Tmt_12")
        {
            this._cachedMapInfo[1] = { mapType : mapInfo[i].mapType, mapName : mapInfo[i].mapName};
        }
        else if (mapInfo[i].mapType == "MapType_Tmt_13")
        {
            this._cachedMapInfo[2] = { mapType : mapInfo[i].mapType, mapName : mapInfo[i].mapName};
        }
        else if (mapInfo[i].mapType == "MapType_Tmt_21")
        {
            this._cachedMapInfo[3] = { mapType : mapInfo[i].mapType, mapName : mapInfo[i].mapName};
        }
        else if (mapInfo[i].mapType == "MapType_Tmt_22")
        {
            this._cachedMapInfo[4] = { mapType : mapInfo[i].mapType, mapName : mapInfo[i].mapName};
        }
        else if (mapInfo[i].mapType == "MapType_Tmt_23")
        {
            this._cachedMapInfo[5] = { mapType : mapInfo[i].mapType, mapName : mapInfo[i].mapName};
        }
        else if (mapInfo[i].mapType == "MapType_Tmt_31")
        {
            this._cachedMapInfo[6] = { mapType : mapInfo[i].mapType, mapName : mapInfo[i].mapName};
        }
        else if (mapInfo[i].mapType == "MapType_Tmt_32")
        {
            this._cachedMapInfo[7] = { mapType : mapInfo[i].mapType, mapName : mapInfo[i].mapName};
        }
        else if (mapInfo[i].mapType == "MapType_Tmt_33")
        {
            this._cachedMapInfo[8] = { mapType : mapInfo[i].mapType, mapName : mapInfo[i].mapName};
        }
        else if (mapInfo[i].mapType == "MapType_Tmb")
        {
            this.currentBannerPath = mapInfo[i].mapName;
        }
        else
        {
            log.warn("Ignore the Map Type None !!!");
        }
        i++;
    }
    for(var i = 0; i < this._cachedMapInfo.length; i++)
    {
        if(!this._cachedMapInfo[i])
        {
            this._cachedMapInfo[i] = { mapType : "MapType_None", mapName : "none"};
        }
    }
}

hdtrafficimageApp.prototype._reInitialiseCachedMapInfo = function(mapInfo)
{
    this._cachedMapInfo = new Array();
    for(var index = 0; index < 9; index++)
    {
        this._cachedMapInfo[index] = new Object();
        this._cachedMapInfo[index]["mapName"] = "none";
        this._cachedMapInfo[index]["mapType"] = "MapType_None";
    }
    this._tileCheck = false;
    
    log.info("inside reInitialiseCachedMapInfo");
}

hdtrafficimageApp.prototype._showHDLogoStatus = function()
{
    if(this._currentContextTemplate)
    {
        var isBright = false;
        switch(this._hdLogoStatus)
        {
            case 0:
                isBright = false;
                break;
            case 1:
                isBright = true;
                break;
            default:
                isBright = false;
                break;
        }
        this._currentContextTemplate.trafficCtrl.showHDLogoImage(isBright);
    }
}

/**************************
 * Framework register
 **************************/

framework.registerAppLoaded("hdtrafficimage", null, true);