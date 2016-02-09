/*


 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: TrafficCtrl.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: atiwarc
 Date: 05.02.2013
 __________________________________________________________________________

 Description: IHU GUI Control for HD Traffic Image

 Revisions:
 v0.1 (05-February-2013)  HDTraffic created - atiwarc
 v0.2 (19-February-2013)  Fixed dynamic updation problem - atiwarc
 v0.3 (05-March-2013)  Added Support For Touch on HDTraffic .Drag/slide supported implemented -schands9
 _________________________________________________________________________

 */
log.addSrcFile("TrafficCtrl.js", "common");



function TrafficCtrl(uiaId, parentDiv, ctrlId, properties)
{

    /*This is the constructor of the TrafficCtrl Component
     Create, set dimensions and assign default name*/
    log.debug("TrafficCtrl Control constructor called with uiaId " + this.uiaId);
    this.id = ctrlId;
    this.uiaId = uiaId;
    this.parentDiv = parentDiv;

    //@formatter:off
    this.properties = {
        defaultImagepath : null,
        defaultUpdatedTime : null,
        trafficLogoPath : null,
        trafficBannerpath: null,
        bgColor:{R : "",G : "",B : ""}
    };
    //@formatter:on
    for (var i in properties)
    {
        this.properties[i] = properties[i];
    }

    // initialize
    this.touchMove = this.TrafficCtrl_TouchMove.bind(this);
    this.touchUp = this.TrafficCtrl_TouchUp.bind(this);
    this.touchDown = this.TrafficCtrl_TouchDown.bind(this);
    this.init();
}




//Event handling variables For MapArea(hdTrafficimage Touch)
/* this.Xcords = new Array();
this.Ycords = new Array(); */
this.xFlag = 0;
this.yFlag = 0;
this.flag = 0;


//Cache Array For Storing Co-ordinates
this.Xcords_Cache = new Array();
this.Ycords_Cache = new Array();
this.Xcords_First = 0;
this.Ycords_First = 0;
this.Xcords_Last = 0;
this.Ycords_Last = 0;
this.eventCheck=0;
this.eventId=0;
this.checklongpress = 0;

TrafficCtrl.prototype.init = function()
{
    // for scrolling indicator
    this.InitialScrollPos=0;
    this.markerHeight=0;
    this.eventCheck=0;
    this.eventId=0;
    this.checklongpress = 0;
    this._defaultBGColorR = this.properties.bgColor.R;
    this._defaultBGColorG = this.properties.bgColor.G;
    this._defaultBGColorB = this.properties.bgColor.B;
    this._cachedDiff = 0.5;
    this.divElt = document.createElement('div');
    this.divElt.className = 'trafficCtrl';
    this._hasFocus = true;
    
    this.mapArea = document.createElement('div');
    this.mapArea.className = "mapArea";
    this.mapArea.id= "maparea";

    this.mapImage = document.createElement('div');
    this.mapImage.className = "mapImage";
    this.mapImage.id = "mapImage";
    this.mapArea.appendChild(this.mapImage);

    /*Creating Gps Marker Area*/
    this.gpsMarkerArea = document.createElement('div');
    this.gpsMarkerArea.className = "gpsMarkerArea";
    this.gpsMarkerImage = document.createElement('div');
    this.gpsMarkerImage.id = "gpsMarkerImage";
    this.gpsMarkerImage.className = "gpsMarkerImage";
     
    this.gpsMarkerPoorImage = document.createElement('div');
    this.gpsMarkerPoorImage.id = "gpsMarkerPoorImage";
    this.gpsMarkerPoorImage.className = "gpsMarkerPoorImage";
    this.gpsMarkerArea.appendChild(this.gpsMarkerImage);
    this.gpsMarkerArea.appendChild(this.gpsMarkerPoorImage);
    this.mapArea.appendChild(this.gpsMarkerArea);
    this.mapArea.appendChild(this.gpsMarkerArea);
    
    this._addMapTiles();

    this.banner = document.createElement('div');
    this.banner.className = "bannerImage disableBannerImage";
    this.banner.id = "bannerImage";
    this.mapArea.appendChild(this.banner);
    this.divElt.appendChild(this.mapArea);

    this.footerArea = document.createElement('div');
    this.footerArea.className = "footerArea";

    this.HDLogo = document.createElement('div');
    this.HDLogo.className = "HDLogoDisabledImage";
    this.footerArea.appendChild(this.HDLogo);
    
    this.testModeText = document.createElement('div');
    this.testModeText.className = "testModeText";
    this.footerArea.appendChild(this.testModeText);

    this.logo = document.createElement('div');
    this.logo.className = "trafficLogo";
    this.logo.style.background = "url("+this.properties.trafficBannerpath+") center no-repeat";
    
    this.footerArea.appendChild(this.logo);
    
    this.updatedText = document.createElement('div');
    this.updatedText.className = "updatedText";
    this.footerArea.appendChild(this.updatedText);
    
    // add scrolling indicator 
    this.scrollIndicatorWrapper = document.createElement('div');
    this.scrollIndicatorWrapper.className = 'TrafficCtrlScrollIndicatorWrapper';
    this.scrollIndicatorWrapper.id = 'TrafficCtrlScrollIndicatorWrapper';
    this.scrollIndicator = document.createElement('div');
    this.scrollIndicator.className = 'TrafficCtrlScrollIndicator';
    this.scrollIndicator.id = 'TrafficCtrlScrollIndicator';
    this.scrollIndicatorWrapper.appendChild(this.scrollIndicator);
    this.divElt.appendChild(this.scrollIndicatorWrapper);
    this.arc = document.createElement('div');
    this.arc.className = 'TrafficCtrlArc';
    this.arc.id = 'TrafficCtrlArc';
    this.divElt.appendChild(this.arc);
    
    this.divElt.appendChild(this.footerArea);

    this.parentDiv.appendChild(this.divElt);

    //Determine horizontal and Vertical ScrollBars
    var map_id_area= document.getElementById("maparea");

    // Adding EventListener
    this.mapArea.addEventListener("mousemove" , this.touchMove,false);
    this.mapArea.addEventListener("mouseup" , this.touchUp,false);
    this.mapArea.addEventListener("mousedown",this.touchDown,false);
    document.addEventListener("mouseup",this.touchUp,false);
};


TrafficCtrl.prototype.TrafficCtrl_TouchDown = function()
{
    if(!this.flag)
    {
        this.xFlag=0;
        this.yFlag=0;
        this.flag=1;
    }
    this.Xcords = new Array();
    this.Ycords = new Array();
};

TrafficCtrl.prototype.TrafficCtrl_TouchMove = function(e)
{
    if(this.flag)
    {
        var map_id = document.getElementById("maparea");
        var x = e.clientX - map_id .offsetLeft;
        var y = e.clientY - map_id .offsetTop;
        this.Xcords[this.xFlag] = x;
        this.Ycords[this.yFlag] = y;
        this.xFlag++;
        this.yFlag++;
        this.TrafficCtrl_MouseMovement(this.Ycords);
    }
};

TrafficCtrl.prototype.TrafficCtrl_MouseMovement = function(Ycords)
{
    if(!this._hasFocus)
    {
        framework.common.stealFocus();
        this._hasFocus = true;
    }
    if(this._hasFocus)
    {
        var FirstPos,LastPos;
        var j=0;
        var d = document.getElementById("maparea");
        var localDiff = null;
        var lDiff = null;
        //Determine lenght of Yco-ords Just testing Remove in Final Code and use Length
        if(Ycords.length!=0)
        {
            this.flag =1;
            while(j!=Ycords.length)
            {
                j++;
            }
            FirstPos = Ycords[0];
            LastPos = Ycords[j-1];
            localDiff = (FirstPos - LastPos)/35;

            if(localDiff > this._cachedDiffer)
            {
                lDiff = localDiff - this._cachedDiffer;
            }
            else
            {
                lDiff = this._cachedDiffer - localDiff;
            }

            if((FirstPos > LastPos) && (FirstPos - LastPos ) >= 10 )
            {
                if(lDiff > 0.08)
                {
                  
                    if(LastPos > this._cachedLastPos)
                    {
                        d.scrollTop = d.scrollTop - ((FirstPos - LastPos)/20);
                    }
                    else
                    {
                        d.scrollTop = d.scrollTop + ((FirstPos - LastPos)/20);
                    }
                    this._cachedLastPos = LastPos;
                    this.InitialScrollPos=d.scrollTop;

                    document.getElementById('TrafficCtrlScrollIndicator').style.clip="rect("+this.InitialScrollPos+"px,28px,"+(this.InitialScrollPos+125)+"px, 0px)";         
                    if((this.InitialScrollPos+125)==360)
                    {
                    document.getElementById('TrafficCtrlScrollIndicator').style.clip="rect("+this.InitialScrollPos+"px,28px,"+(this.InitialScrollPos+135)+"px, 0px)";  
                    }
                }
                this._cachedDiffer = localDiff;
            }
            else if(LastPos > FirstPos && (LastPos - FirstPos ) >= 10)
            {
                if(lDiff > 0.08)
                {           
                    if(LastPos < this._cachedLastPos)
                    {
                        d.scrollTop = d.scrollTop + ((LastPos - FirstPos)/20);
                    }
                    else
                    {
                        d.scrollTop = d.scrollTop - ((LastPos - FirstPos)/20);
                    }
             
                    this._cachedLastPos = LastPos;
             
                    this.InitialScrollPos=d.scrollTop;
                    document.getElementById('TrafficCtrlScrollIndicator').style.clip="rect("+this.InitialScrollPos+"px,28px,"+(this.InitialScrollPos+125)+"px, 0px)";
                    if((this.InitialScrollPos+125)==360)
                    {
                    document.getElementById('TrafficCtrlScrollIndicator').style.clip="rect("+this.InitialScrollPos+"px,28px,"+(this.InitialScrollPos+135)+"px, 0px)";  
                    }
                }
                this._cachedDiffer = localDiff;
            }
        }
    }
};

TrafficCtrl.prototype._addMapTiles = function()
{
    var noOfRows = 3;
    var noOfCols = 3;
    var index = 0;
    for(var row = 1; row <= noOfRows; row++)
    {
        for(var col = 1; col <= noOfCols; col++)
        {
            this.addElement = document.createElement('div');
            this.addElement.id = "tile"+"Row"+row+"Col"+col;
            (col == 1) ? this.addElement.className = "tile columnMarginLeft" : this.addElement.className = "tile";
            this.addElement.style.background = "url("+this.properties.defaultImagepath[index].mapName+") center no-repeat";
            this.mapImage.appendChild(this.addElement);
            index++;
        }
    }
};

//SmoothScroll Implementaion
TrafficCtrl.prototype.TrafficCtrl_elmYPosition = function(eID)
{
    var elm = document.getElementById(eID);
    var y = elm.offsetTop;
    var node = elm;
    while (node.offsetParent && node.offsetParent != document.body)
    {
        node = node.offsetParent;
        y += node.offsetTop;
    } 
    return y;
};

TrafficCtrl.prototype.TouchEventHandler_LoginEngine = function(Xcord,Ycord)
{
    var Sum_X =0;
    var Sum_Y =0;
    //Create Logic For Touch Gesture using x,y co-ordinates
    //Determine Sum Of x,y co-ordinates
    var i=0;

    //Perform Sum Action
    if(Xcord && Xcord.length)
    {
        while(i!=Xcord.length)
        {
            Sum_X = Sum_X +Xcord[i];
            Sum_Y = Sum_Y +Ycord[i];
            i++;
        }
        //Perform Get First and Last Co-ordinates Of the Map

        this.Xcords_First = Xcord[0];
        this.Ycords_First = Ycord[0];
        this.Xcords_Last = Xcord[i-1];
        this.Ycords_Last = Ycord[i-1];
    }
}; //Function TouchEventHandler_LoginEngine

TrafficCtrl.prototype.TrafficCtrl_TouchUp = function()
{
    clearTimeout(this._smoothScroll);
    if(this.flag)
    {
        //Resetting Cache Data
        this.Xcords_Cache = new Array();
        this.Ycords_Cache = new Array();

        //copied Data Y/Xcords into X/Ycords_Cache
        this.Xcords_Cache = this.Xcords;
        this.Ycords_Cache = this.Ycords;

        //Resetting Array For Co-ordiatesData
        this.Xcords = new Array();
        this.Ycords = new Array();
        this.xFlag =0;
        this.yFlag =0;
        this.flag=0;

        this.TouchEventHandler_LoginEngine(this.Xcords_Cache , this.Ycords_Cache);
    } //If Then Ends
};

TrafficCtrl.prototype.showBannerImage = function(bannerUrl)
{
    this.logo.style.background = "url("+bannerUrl+") center no-repeat";
};

//HDLogo control isBright = true or false
TrafficCtrl.prototype.showHDLogoImage = function(iSBright)
{
    if(iSBright)
    {
        this.HDLogo.className = "HDLogoBrightImage";
    }
    else
    {
        this.HDLogo.className = "HDLogoDisabledImage";
    }
};


/**
 * Update the GPS pointer position
 * xPos: GPS Marker X-coordinate
 * yPos: GPS Marker Y-coordinate
 */
TrafficCtrl.prototype.MapPosition = function(yPos,defaultScroll)
{
    var map = document.getElementById("maparea");
    map.scrollTop = map.scrollTop + 235;
    document.getElementById('TrafficCtrlScrollIndicator').style.clip="rect(235px,28px,370px, 0px)";
    this.InitialScrollPos = 235;
};

TrafficCtrl.prototype.updateGpsPosition = function(xPos,yPos,markerPos,defaultScroll)
{   
    var gpsMarkerRef = null;
    if(markerPos=="Poor")
    {
        gpsMarkerRef = document.getElementById("gpsMarkerPoorImage");
        var markerHeightX = 50;
        var markerHeightY = 50;
    }
    else
    {  
        gpsMarkerRef = document.getElementById("gpsMarkerImage");
        var markerHeightX = 16;
        var markerHeightY = 16;
    }
    this.markerHeight=markerHeightX;
    this.mapHeight = document.getElementById("mapImage").offsetHeight;
    this.mapWidth = document.getElementById("mapImage").offsetWidth;

    //element *current map tile
    var element = document.getElementById("tileRow1Col1").offsetLeft;

    var markerX = xPos - (markerHeightX/2);
    var markerY = yPos - (markerHeightY/2);

    var leftPos = element + markerX ;
    var topPos = (-(this.mapHeight) + markerY) ;

    //Setting the marker position
    gpsMarkerRef.style.marginLeft = leftPos + 'px' ;
    gpsMarkerRef.style.marginTop = topPos + 'px' ;
};

/**
 * Hide the marker
 */
TrafficCtrl.prototype.hideGpsMarker = function()
{
    document.getElementById("gpsMarkerImage").style.display = "none" ;
    document.getElementById("gpsMarkerPoorImage").style.display = "none" ;
};

/**
 * Show the marker
 */
TrafficCtrl.prototype.showGpsMarker = function(state){
    if(this.markerHeight==50)
    {
     document.getElementById("gpsMarkerImage").style.display = "none" ;
     document.getElementById("gpsMarkerPoorImage").style.display = "block" ;
    }
    else
    {
     document.getElementById("gpsMarkerImage").style.display = "block" ;
     document.getElementById("gpsMarkerPoorImage").style.display = "none" ;
    }
};

/**
 * update all the map tiles in Map Image
 * mapIndex : all
 * mapPath  : array of strings
 */

TrafficCtrl.prototype.updateAllMapTiles = function(mapInfo)
{
    var noOfRows = 3;
    var noOfCols = 3;
    var index = 0;
    var unix = Math.round(+new Date()/1000);
    for(var row = 1; row <= noOfRows; row++)
    {
        for(var col = 1; col <= noOfCols; col++)
        {
            var element = document.getElementById("tile"+"Row"+row+"Col"+col);
            log.debug("in updateAllMapTiles , MapType = " +mapInfo[index].mapType);
            log.debug("in updateAllMapTiles : index = " +index);
            if(mapInfo[index] && mapInfo[index].mapType !== "MapType_None" && mapInfo[index].mapName && mapInfo[index].mapName.trim())
            {
                log.debug("setting the map : "+mapInfo[index].mapName);
                element.style.background = "url("+mapInfo[index].mapName+"?timeStamp="+unix+") center no-repeat";
                element.style.backgroundColor  = "rgb("+this._defaultBGColorR+","+this._defaultBGColorG+","+this._defaultBGColorB+")";
            }
            else
            {
                log.debug("in updateAllMapTiles image is missing");
                this.imageMissing(element);
            }
             index++;
        }
    }
};

/**
 * Image is missig
 */
TrafficCtrl.prototype.imageMissing = function(el)
{
    if(this._defaultBGColorR || this._defaultBGColorG || this._defaultBGColorB || 
        (this._defaultBGColorR === 0 && this._defaultBGColorG === 0 && this._defaultBGColorB === 0))
    {
        log.debug("inside imagemissing,setting the RGB : "+this._defaultBGColorR+" , "+this._defaultBGColorG+" , "+this._defaultBGColorB);
        el.style.background  = "rgb("+this._defaultBGColorR+","+this._defaultBGColorG+","+this._defaultBGColorB+")";
    }
    else
    {
        log.debug("inside imagemissing, RGB not available");
        el.style.background = "";
    }
}

/**
 * set a tile image in map matrix
 */
TrafficCtrl.prototype.updateMapTile = function(row, column, imagePath)
{
    var element = null;
    if(row && column)
    {
        element  = document.getElementById("tile"+"Row"+row+"Col"+column);
        log.debug("imagePath received in Conrol : imagePath = "+imagePath);
        log.debug("tile -- "+" Row : "+row+" Col : "+column);
        if(imagePath && imagePath.mapType !== "MapType_None" && imagePath.mapName && imagePath.mapName.trim())
        {
            var unix = Math.round(+new Date()/1000);
            log.debug("Map path received in Control : "+imagePath.mapName);
            log.debug("setting the map : "+imagePath.mapName);
            element.style.background = "url("+imagePath.mapName+"?timeStamp="+unix+") center no-repeat";
            element.style.backgroundColor  = "rgb("+this._defaultBGColorR+","+this._defaultBGColorG+","+this._defaultBGColorB+")";
        }
        else
        {
            log.debug("in updateMapTile image is missing");
            this.imageMissing(element);
        }
    }
};

/**
 * set a background color in tile
 */
TrafficCtrl.prototype.setMapBackground = function(r,g,b)
{
    log.debug("inside setMapBackground :: rcvd bgColorInfo is "+r+" "+g+" "+b);
    this._defaultBGColorR = r;
    this._defaultBGColorG = g;
    this._defaultBGColorB = b;
};

// Set the updated Time
TrafficCtrl.prototype.setTime = function(text)
{
    if(text)
    {
        this.updatedText.innerHTML = text;
    }
    else
    {
        this.updatedText.innerHTML = "";
    }
};

// Set the updated Time
TrafficCtrl.prototype.setTimeId = function(textId,textSubMap)
{
    if(textId)
    {
        var localizedTime = framework.localize.getLocStr(this.uiaId, textId, textSubMap);
        this.setTime(localizedTime);
    }
};

//set the TestMode
TrafficCtrl.prototype.setTestModeText = function(testText)
{
    this.testModeText.innerHTML = testText;
};

TrafficCtrl.prototype.TrafficCtrl_MultiController = function(Event_Id)
{
    this.Map_Area  = document.getElementById("maparea");
    switch(Event_Id)
    {
        case "up":
        case "ccw":
        {
            this.Map_Area.scrollTop =this.Map_Area.scrollTop  - 40;
            var shift=this.InitialScrollPos - 40;
            if(shift <= 0)
            {
                shift = 0;
            }
            document.getElementById('TrafficCtrlScrollIndicator').style.clip="rect("+shift+"px,28px,"+(shift+125)+"px, 0px)";
            this.InitialScrollPos=shift;
        }
        break;
        case "down":
        case "cw":
            this.Map_Area.scrollTop =this.Map_Area.scrollTop  + 40;
            var shift=this.InitialScrollPos + 40;
            if((shift + 125) >= 360)
            {
                shift = 235;
            }
            document.getElementById('TrafficCtrlScrollIndicator').style.clip="rect("+shift+"px,28px,"+(shift+125)+"px, 0px)";
            if((shift+125)==360)
            {
                 document.getElementById('TrafficCtrlScrollIndicator').style.clip="rect("+shift+"px,28px,"+(shift+135)+"px, 0px)";
            }
            this.InitialScrollPos=shift;
            break;
        default :
            break;
    }
};

TrafficCtrl.prototype.TrafficCtrl_MultiControllerContinuouslyPressed = function(Event_Id)
{ 
    log.debug("Inside TrafficCtrl_MultiControllerContinuouslyPressed.....");
    this.Map_Area  = document.getElementById("maparea");
    this.checklongpress = 1;
    if(this.eventId == "upStart")
    {
        log.debug("Event_Id is..."+this.eventId+"..EventCheck is.."+this.eventCheck);
        this.Map_Area.scrollTop =this.Map_Area.scrollTop  - 25;
        var shift=this.InitialScrollPos - 25;
        if(shift<=0)
        {
            shift=0;
        }
        document.getElementById('TrafficCtrlScrollIndicator').style.clip="rect("+shift+"px,28px,"+(shift+125)+"px, 0px)";
        this.InitialScrollPos=shift;

        this.settleTimeOut = setTimeout(this.TrafficCtrl_MultiControllerContinuouslyPressed.bind(this),25);     
    }
    else if(this.eventId == "downStart")
    {
        this.Map_Area.scrollTop =this.Map_Area.scrollTop  + 25;  
        var shift=this.InitialScrollPos + 25;
        if((shift+125)>=360)
        {
            shift=235;
        }
        document.getElementById('TrafficCtrlScrollIndicator').style.clip="rect("+shift+"px,28px,"+(shift+125)+"px, 0px)";
        if((shift+125)==360)
        {
             document.getElementById('TrafficCtrlScrollIndicator').style.clip="rect("+shift+"px,28px,"+(shift+135)+"px, 0px)";
        }
        this.InitialScrollPos=shift;
        
        this.settleTimeOut = setTimeout(this.TrafficCtrl_MultiControllerContinuouslyPressed.bind(this),25);  
    }
};
/*
 * =========================
 * MULTICONTROLLER
 * =========================
 */

TrafficCtrl.prototype.handleControllerEvent = function(eventID)
{
    log.debug("TrafficCtrl: handleController() called, eventID: " + eventID);
    var returnValue = null;
    this.eventId=eventID;
    switch(eventID)
    {
        case "up":
        case "cw":
            clearTimeout(this.settleTimeOut);
            this.eventCheck=1;
            if(this.checklongpress == 1)
            {
                this.checklongpress = 0;
            }
            else
            { 
                this.TrafficCtrl_MultiController(eventID);  
            }
            returnValue = "consumed";
            break;
        case "down":
        case "ccw":
            clearTimeout(this.settleTimeOut);
            this.eventCheck=2;
            if(this.checklongpress == 1)
            {
                this.checklongpress = 0;
            }
            else
            {
                this.TrafficCtrl_MultiController(eventID);  
            }
            returnValue = "consumed";
            break; 
        case "upStart":
            this.eventCheck=3;
            if(this.settleTimeOut)
            {
                clearTimeout(this.settleTimeOut);
                this.settleTimeOut = null;
            }
            var settleTimeCallback = this.TrafficCtrl_MultiControllerContinuouslyPressed.bind(this);
            this.settleTimeOut = setTimeout(settleTimeCallback, 600);
            returnValue = "consumed";
            break;
       case "downStart":
            this.eventCheck=4;
            if(this.settleTimeOut)
            {
                clearTimeout(this.settleTimeOut);
                this.settleTimeOut = null;
            }
            var settleTimeCallback = this.TrafficCtrl_MultiControllerContinuouslyPressed.bind(this);
            this.settleTimeOut = setTimeout(settleTimeCallback, 600);
            returnValue = "consumed";
           break;
        case "leftStart":
            this._hasFocus = false;
            returnValue = "giveFocusLeft";
            break;
        case "rightStart":
            this._hasFocus = true;
            returnValue = "giveFocusRight";
            break;
        case "lostFocus":
            this._hasFocus = false;
            returnValue = "consumed";
            break;
        case "acceptFocusInit" :
        case "acceptFocusFromRight" :
        case "acceptFocusFromTop" :
        case "acceptFocusFromBottom" :
        case "touchActive" :
        case "acceptFocusFromLeft":
            this._hasFocus = true;
            returnValue = "consumed";
            break;
        default:
            // No action
            returnValue = "ignored";
            break;
    }
    return returnValue;
};
/*
 * =========================
 * Clean Up
 * =========================
 */
TrafficCtrl.prototype.cleanUp = function()
{
     // Clean up timeouts or handlers if any
     clearTimeout(this.settleTimeOut);
};

framework.registerCtrlLoaded("TrafficCtrl");