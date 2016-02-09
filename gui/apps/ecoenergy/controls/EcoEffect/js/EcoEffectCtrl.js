/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: EcoEffectCtrl.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: atiwarc
 Date: 12-03-2012
 __________________________________________________________________________

 Description: IHU GUI EcoEffectCtrl
 __________________________________________________________________________
  
 Revisions: 
 v0.1 (01-18-2013)  Initial implementation (to 0.3.05 spec) (atiwarc)
 v0.2 (02-18-2013)  Tree Animation support for Studio Images and Design Related Changes (atiwarc)
 v0.3 (03-13-2013)  Implementation of UMP Control panel (atiwarc)
 v0.4 (04-24-2013)  Spec Migration to 3.56 (UMP3 support and Spec changes)(atiwarc)
 v0.5 (05-15-2013)  Go back implementation (atiwarc)
 v0.6 (06-24-2013)  Code Clean up to remove deprecated methods and API's(atiwarc) 
 __________________________________________________________________________

 */

log.addSrcFile("EcoEffectCtrl.js", "common");

function EcoEffectCtrl(uiaId, parentDiv, controlId, properties)
{    
    this.uiaId = uiaId;
    this.divElt = parentDiv;
    this.controlId = controlId;
    this._switchViewButtonCtrl = null;
    this._treeLvl = 1;
    this._umpPanelStatus = false;

        
    //@formatter:off
    this.properties =
    {
        "subMap"                   : null,
        "ctrlStyle"                : "",
        "selectCallback"           : null,
        "switchViewId"             : "",
        "switchViewTitleText"      : "",
        "iEloopConfig"             : null,
        "iStopEffRate"             : null,
        "iStopConfig"              : null,
        "treeConfig"               : null,
        "mode"                     : null,
        "modeMsgTitleText"         : null,
        "umpButtonConfig" 		   : null,
        "defaultSelectCallback"    : null,
        "defaultSlideCallback" 	   : null,
        "defaultHoldStartCallback" : null,
        "defaultHoldStopCallback"  : null,
        "dataList" 				   : null,
        "umpStyle" 				   : null,
        "hasScrubber" 			   : false,
        "umpPanelStatus"		   : false
    };
    
    //@formatter:on
    // Copy properties from the app
    for (var key in properties)
    {
        this.properties[key] = properties[key];
    }
    
    // Create DOM elements
	this._loadAllGlobalVariables();
    this._createStructure();
}


/*******************/
/* Private Methods */
/*******************/

EcoEffectCtrl.prototype._init = function()
{
    log.debug("EcoEffectCtrl: _init() called...");
    
        
            if(this.properties.iStopConfig)
            {
                this.properties.iStopConfig.iStopTitleText = this._translateString(this.properties.iStopConfig.iStopTitleId,
                        this.properties.iStopConfig.iStopTitleText,this.properties.subMap);
                this.effiStopLabel.innerHTML = this._stringToHTML(this.properties.iStopConfig.iStopTitleText);
                
                this.properties.iStopConfig.actuationTimeTitleText = this._translateString(this.properties.iStopConfig.actuationTimeTitleId,
                        this.properties.iStopConfig.actuationTimeTitleText,this.properties.subMap);
                this.effActualTimeLabel.innerHTML = this._stringToHTML(this.properties.iStopConfig.actuationTimeTitleText);
                
                this.properties.iStopConfig.stopTimeTitleText =  this._translateString(this.properties.iStopConfig.stopTimeTitleId,
                        this.properties.iStopConfig.stopTimeTitleText,this.properties.subMap);
                this.effStopTimeLabel.innerHTML = this._stringToHTML(this.properties.iStopConfig.stopTimeTitleText);

                this.effActualTimeValue.innerHTML = this.properties.iStopConfig.actuationTimeValue;
                this.effStopTimeValue.innerHTML = this.properties.iStopConfig.stopTimeValue;
                
                this.properties.iStopConfig.iStopRangeBoostedText = this._translateString(this.properties.iStopConfig.iStopRangeBoostedId,
                        this.properties.iStopConfig.iStopRangeBoostedText,this.properties.subMap);
                this.effBoostedText.innerHTML = this._stringToHTML(this.properties.iStopConfig.iStopRangeBoostedText);
                
                if(typeof(this.properties.iStopEffRate) == "number")
                {
                	this.setiStopEffRate(this.properties.iStopEffRate);
                }
            }
        
};

EcoEffectCtrl.prototype._createStructure = function()
{
    log.debug("creating structure for style: " + this.properties.ctrlStyle);

    // Create the div for control
    this.controlDiv = document.createElement('div');
    this.controlDiv.className = "EcoEffectCtrl";
    this.umpPanelDiv = document.createElement('div');
    this.umpPanelDiv.className = "UmpPanelDivDisable";
    
    // Create structure for Effectiveness control
    this._createStructureForEffectiveness(this.controlDiv);
       
    //Set the mode properties depending on the style
    if(this.properties.mode === "ending")
    {
        
    }
    else
    {
        this.effiStopEnding.className = "EcoEffectCtrlHidden";
    }
    /**************************************************************/
    /* Create DOM structure for mode-dependent UI elements */
    /**************************************************************/
 
    // Attach control to parent        
    this.divElt.appendChild(this.controlDiv);
    this.divElt.appendChild(this.umpPanelDiv);
    
    var umpConfig = {
        "buttonConfig" : this.properties['umpButtonConfig'],
        "defaultSelectCallback" : this.properties['defaultSelectCallback'],
        "defaultLongPressCallback" : this.properties['defaultLongPressCallback'],
        "defaultScrubberCallback" : this.properties['defaultScrubberCallback'],
        "defaultHoldStartCallback" : this.properties['defaultHoldStartCallback'],
        "defaultHoldStopCallback" : this.properties['defaultHoldStopCallback'],
        "umpStyle" : this.properties['umpStyle'],
        "hasScrubber" : this.properties['hasScrubber'],
        "scrubberConfig" : this.properties['scrubberConfig'],
        "retracted" : true
    };

    // Child UMP3 Control
    this.umpCtrl = framework.instantiateControl(this.uiaId, this.umpPanelDiv, "Ump3Ctrl", umpConfig);
    
    // show ump button control
    var btnInstanceProperties =
    {
        "selectCallback" : this._switchViewButtonHandler.bind(this),
        "enabledClass" : "switchElementBtn",
        "disabledClass" : null,
        "focusedClass": null,
        "downClass" : "switchElementBtnHit",
        "heldClass" : null,
        "appData" : this.properties.appData,
        "labelId" : this.properties.switchViewId,
        "subMap" : this.properties.subMap,
    };
    //@formatter:on
    if(this.properties.mode !== 'ending' )
    {
    	this._switchViewButtonCtrl = framework.instantiateControl(this.uiaId,
  			this.effTreeArea, "ButtonCtrl", btnInstanceProperties);
   	
    }
    
    this._init();
};


// create structure for Effectiveness
EcoEffectCtrl.prototype._createStructureForEffectiveness = function(controlDiv)
{
    this.effiStopArea = document.createElement('div');
    this.effiStopArea.className = 'istopArea';

  
    this.effiStopEnding = document.createElement('div');
    this.effiStopArea.appendChild(this.effiStopEnding);
        
    this.effiStopValueFrame = document.createElement('div');
    this.effiStopValueFrame.className = 'iStopValues';
    this.effiStopArea.appendChild(this.effiStopValueFrame);

    this.effStopTimeValueFrame = document.createElement('div');
    this.effStopTimeValueFrame.className = 'timeValues';
    this.effiStopArea.appendChild(this.effStopTimeValueFrame);

    this.effiStopLabel = document.createElement('div');
    this.effiStopLabel.className = 'iStopText';
    this.effiStopValueFrame.appendChild(this.effiStopLabel);


	
	
	
    this.effiStopValue = document.createElement('canvas');	
	this.effiStopValue.width=246;
	this.effiStopValue.height=296;
    this.effiStopValue.id='EcoIstopEffectiveRateDrawingCanvas';
    this.effiStopValue.style.zIndex = '10';
    this.contextiStop = this.effiStopValue.getContext('2d');
	this.contextiStop.scale(2,2);
    this.effiStopValueFrame.appendChild(this.effiStopValue);

	this.percent = document.createElement('div');
    this.percent.className = 'percentDiv';
	this.percent.style.zIndex = '10';
	this.effiStopValueFrame.appendChild(this.percent);
	
    this.effActualTimeLabel = document.createElement('div');
    this.effActualTimeLabel.className = 'actualTime';
    this.effStopTimeValueFrame.appendChild(this.effActualTimeLabel);

    this.effActualTimeValue = document.createElement('div');
    this.effActualTimeValue.className = 'actualTimeValue';
    this.effStopTimeValueFrame.appendChild(this.effActualTimeValue);
    
    this.effStopTimeLabel = document.createElement('div');
    this.effStopTimeLabel.className = 'stopTime';
    this.effStopTimeValueFrame.appendChild(this.effStopTimeLabel);

    this.effStopTimeValue = document.createElement('div');
    this.effStopTimeValue.className = 'stopTimeValue';
    this.effStopTimeValueFrame.appendChild(this.effStopTimeValue);


    this.effTreeArea = document.createElement('div');
    this.effTreeArea.className = 'CO2Consumption';
    this._drawTreeUpdate(this.effTreeArea);

    this.effBoostedText = document.createElement('div');
    this.effBoostedText.className = 'iStopBoostText';
    this.effTreeArea.appendChild(this.effBoostedText);
    
    this.effBoostedValue=document.createElement('div');
    this.effBoostedValue.className='iStopBoostValue';
    this.effTreeArea.appendChild(this.effBoostedValue);


    this.effIStopOnlyBackground = document.createElement('div');
	this.effIEloopOnlyBackground = document.createElement('div');
	this.effiStopArea.appendChild(this.effIStopOnlyBackground);
    
    controlDiv.appendChild(this.effiStopArea);
    controlDiv.appendChild(this.effTreeArea);
};


// create structure for tree and add it to the parent div
EcoEffectCtrl.prototype._drawTreeUpdate = function(parentDiv) {
    
    var plantControl = document.createElement('div');
    plantControl.className = "plantControl";

    var topLeafDiv = document.createElement('div');
    topLeafDiv.id = 'topLeafDiv';
    topLeafDiv.className = 'treeWithTwoLeaves';
    
    var treeBackground = document.createElement('div');
    treeBackground.className = 'treeBackground';
    
    var tree = document.createElement('div');
    tree.className = 'tree';

    this.treeNumber = document.createElement('div');
    this.treeNumber.className = 'treeValue';
    this.treeNumber.innerHTML = '--';

    plantControl.appendChild(topLeafDiv);

    parentDiv.appendChild(treeBackground);
    parentDiv.appendChild(tree);
    parentDiv.appendChild(this.treeNumber);
    parentDiv.appendChild(plantControl);
};

/*
 * Utility function to look up a translatable string ID and/or accept a default text string.
 */
EcoEffectCtrl.prototype._translateString = function(strId, strText, subMap)
{

    var translatedText = null;

    if (strId)
    {
        translatedText = framework.localize.getLocStr(this.uiaId, strId, subMap);
    }
    else if (strText)
    {
        translatedText = strText;
    }

    return translatedText;
};

/*
 * Utility function to make a text string suitable for HTML block-rendering
 */
EcoEffectCtrl.prototype._stringToHTML = function(textStr)
{
    var htmlText;

    if (textStr)
    {
        htmlText = textStr + "<br/>";
    }
    else
    {
        htmlText = "";
    }

    return htmlText;
};

/*
 * Utility function to readably format a duration (expressed in milliseconds)
 */
EcoEffectCtrl.prototype._formatDurationString = function(durationMs)
{
    var durationStr = "";

    if (utility.toType(durationMs) === "number")
    { 
        var durationSec = Math.floor(durationMs / 1000);
        var hours       = Math.floor(durationSec / 3600);
        var minutes     = Math.floor((durationSec - (hours * 3600)) / 60);
        var seconds     = durationSec - (hours * 3600) - (minutes * 60);

        if (hours > 0)
        {
            durationStr += hours + '<span class="EcoEffectCtrl_timeUnit">h </span>';
        }
        if ((durationStr !== "") ||
            (minutes > 0))
        {
        	if(minutes < 10)
        	{
        		minutes = "0"+minutes;
        	}
            durationStr += minutes + '<span class="EcoEffectCtrl_timeUnit">m </span>';
        }
        if ((durationStr !== "") || 
            (seconds > 0))
        {
        	if(seconds < 10)
        	{
        		seconds = "0"+seconds;
        	}
            durationStr += seconds + '<span class="EcoEffectCtrl_timeUnit">s';
        }
    }
    else
    {
        log.warn("passed-in duration is not a Date object!");
        durationStr = "--";
    } 

    log.debug("_formatDurationString returning \"" + durationStr + "\"");

    return durationStr;
};


/******************/
/* Public Methods */
/******************/

// sets the iStop effective rate with no animation

EcoEffectCtrl.prototype.setiStopEffRateNoAnimation = function(stopRate) {
	clearInterval(this.rateGraphs.iStopGraph.intervalContext.animateDown);
	this.properties.iStopEffRate = stopRate;
	clearInterval(this.rateGraphs.iStopGraph.intervalContext.animateUp);
	this.rateGraphs.iStopGraph.intervalContext.animateDown = null;
	this.rateGraphs.iStopGraph.intervalContext.animateUp = null;
	//this._scroll(this.rateGraphs.iStopGraph,stopRate,this.contextiStop);
	this.rateGraphs.iStopGraph.textOriginalMid=stopRate;
	this._drawStaticText(this.rateGraphs.iStopGraph,this.contextiStop);
	if(stopRate === "100" || stopRate === 100)
	{
		this.percent.style.left = '257px';
	}
	else
	{
		this.percent.style.left = '250px';
	}
};

// sets the iStop effective rate

EcoEffectCtrl.prototype.setiStopEffRate = function(stopRate) {
	clearInterval(this.rateGraphs.iStopGraph.intervalContext.animateDown);
	this.properties.iStopEffRate = stopRate;
	clearInterval(this.rateGraphs.iStopGraph.intervalContext.animateUp);
	this.rateGraphs.iStopGraph.intervalContext.animateDown = null;
	this.rateGraphs.iStopGraph.intervalContext.animateUp = null;
	this._scroll(this.rateGraphs.iStopGraph,stopRate,this.contextiStop);
	if(stopRate === "100" || stopRate === 100)
	{
		this.percent.style.left = '257px';
	}
	else
	{
		this.percent.style.left = '250px';
	}
};

// sets the iStop effective time , time is set in millisecond. 
// _formatDurationString to be used once ready in the framework to format the time to string
EcoEffectCtrl.prototype.setiStopEffTime = function(actuationTime, stopTime, totalTime) 
{
    this.effActualTimeValue.innerHTML = this._formatDurationString(actuationTime);
    this.effStopTimeValue.innerHTML = this._formatDurationString(stopTime);
};

// sets the number of trees 
EcoEffectCtrl.prototype.setTreeNumber = function(treeNumber) {
    
    this.treeNumber.innerHTML = this._stringToHTML("<span>x</span>"+treeNumber);
};

// sets the current tree level to show the tree graphic
EcoEffectCtrl.prototype.setTreeCurrLevel = function(currentLevel) {
    this._treeLvl = currentLevel++; 
    var  element = document.getElementById('topLeafDiv');
    
    switch (currentLevel) {
    case 1:
        element.className = 'treeWithTwoLeaves';
        break;
    case 2:
    	element.className = 'treeWithThreeLeaves';
    	break;
    case 3:
    	element.className = 'fullBlownTree';
    	break;
    default:
    	 element.className = 'treeWithTwoLeaves';
        break;
    }
   
};

// Set the iStop Boost range along with the unit provided

EcoEffectCtrl.prototype.setIstopBoostRange = function(value, unit)
{
	var boostUnit = '';
	if(unit)
	{
		boostUnit = this._translateString(unit,unit,this.properties.subMap);
	}
	this.effBoostedValue.innerHTML = this._stringToHTML(value + '<span class="EcoEffectBoostUnit">'+boostUnit+'</span>');
};

/*
 * Callback for "Switch View" button selections -- when called, trigger the
 * configured application callback.
 */
EcoEffectCtrl.prototype._switchViewButtonHandler = function(buttonObj, appData, params)
{
	 if (typeof(this.properties.selectCallback) === "function")
	 {
	    this.properties.selectCallback(this, appData, null);
	 }
	 else
	 {
		 log.warn("EcoEffectCtrl: no valid selectCallback configured");
	 }
};
 /*
  * toggle Ump panel | status == "hidePanel" OR status == "showPanel"
  */
EcoEffectCtrl.prototype.toggleUmpPanel = function(status)
{
	if(status === "hidePanel")
	{
		this.umpPanelDiv.className = "UmpPanelDivDisable";
		this.umpCtrl.setRetracted(true);
		this._umpPanelStatus = false;
	}
	else if(status === "showPanel")
	{
		this.umpPanelDiv.className = "UmpPanelDivEnable";
		this.umpCtrl.setRetracted(false);
		this._umpPanelStatus = true;
	}
	else
	{
		log.warn("_triggerUmpPanel called with an unxpected argument: "+status);
	}
};

/** CONTEXT CAPTURE AND RESTORE **/

/**
 * Context capture
 * TAG: framework, public
 * =========================
 * @return {object} - capture data
 */

EcoEffectCtrl.prototype.getContextCapture = function()
{
    log.debug("EcoEffectCtrl: getContextCapture() called...");
    var controlContextCapture = this.umpCtrl.getContextCapture();
    return controlContextCapture;
};


EcoEffectCtrl.prototype.finishPartialActivity = function()
{
    log.debug("EcoEffectCtrl: finishPartialActivity() called...");
    this.umpCtrl.finishPartialActivity();
}


/**
 * Context restore
 * TAG: framework, public
 * =========================
 * @return {object} - capture data
 */

EcoEffectCtrl.prototype.restoreContext = function(controlContextCapture)
{
    log.debug("EcoEffectCtrl: restoreContext() "+ controlContextCapture);
    this.umpCtrl.restoreContext(controlContextCapture);
};

/*
 * Forward all multi controller events to our only child control, the "SwitchView" button
 */
EcoEffectCtrl.prototype.handleControllerEvent = function(eventId)
{
    log.debug("EcoEffectCtrl: handleControllerEvent() called: " + eventId);
    if(this._umpPanelStatus && this.umpCtrl)
    {
    	response = this.umpCtrl.handleControllerEvent(eventId);
        return response;
    }
    else if(!this._umpPanelStatus && this._switchViewButtonCtrl)
    {
        response = this._switchViewButtonCtrl.handleControllerEvent(eventId);
        return response;
    }
};

EcoEffectCtrl.prototype.cleanUp = function()
{
     clearInterval(this.treeAnimTimeout);
     this.treeAnimTimeout = null;
     if(this.umpCtrl)
     {
     	this.umpCtrl.cleanUp();
     }
     if(this._switchViewButtonCtrl)
     {
    	 this._switchViewButtonCtrl.cleanUp();
     }
};


EcoEffectCtrl.prototype._loadAllGlobalVariables = function()
{
	this.ALLTEXTS=new Array();
	for (var i=0; i<=100; i++)
	{
		this.ALLTEXTS[i]=i;
	}

	this.FIXED_POSITION_Y=[29,51,90,111,132,161];

	this.rateGraphs = 
	{		
		iStopGraph:
		{
			//line_YCordinates:[0,10,25,50,75,90,100],			
			textOriginalMid :0,
			move_by:0,
			intervalContext:
			{
				animateUp:null,
				animateDown:null
			},
			ARRAY_INDEX:
			{
				first:0,
				second:0,
				third:0,
				fourth:0,
				fifth:0,
				empty:0
			},
			POSITIONS :
			{
				text1:{
					x: 57,
					y: this.FIXED_POSITION_Y[0],
					fontSize:18
				},
				text2:{
					x:57,
					y:this.FIXED_POSITION_Y[1],
					fontSize:18
				},
				text3:{
					x:57,
					y:this.FIXED_POSITION_Y[2],
					fontSize:42
				},
				text4:{
					x:57,
					y:this.FIXED_POSITION_Y[3],
					fontSize:18
				},
				text5:{
					x:57,
					y:this.FIXED_POSITION_Y[4],
					fontSize:18
				},
				emptytext:{
					x:57,
					y:0,
					fontSize:18
				}
			}
		},
		iEloopGraph:
		{
			//line_YCordinates:[0,10,25,50,75,90,100],
			
			textOriginalMid :0,
			move_by:0,
			intervalContext:
			{
				animateUp:null,
				animateDown:null
			},
			ARRAY_INDEX:
			{
				first:0,
				second:0,
				third:0,
				fourth:0,
				fifth:0,
				empty:0
			},
			POSITIONS:
			{
				text1:{
					x: 45,
					y: this.FIXED_POSITION_Y[0],
					fontSize:12
				},
				text2:{
					x:45,
					y:this.FIXED_POSITION_Y[1],
					fontSize:12
				},
				text3:{
					x:45,
					y:this.FIXED_POSITION_Y[2],
					fontSize:28
				},
				text4:{
					x:45,
					y:this.FIXED_POSITION_Y[3],
					fontSize:12
				},
				text5:{
					x:45,
					y:this.FIXED_POSITION_Y[4],
					fontSize:12
				},
				emptytext:{
					x:45,
					y:0,
					fontSize:12
				}
			}
		}
	}
}


EcoEffectCtrl.prototype._findPositions = function(effectiveRate)
{
	var originalPosition=0;
	originalPosition=effectiveRate.textOriginalMid;
	if(originalPosition===0)
	{
		effectiveRate.ARRAY_INDEX.empty=originalPosition+3;
		effectiveRate.ARRAY_INDEX.first=originalPosition+2;
		effectiveRate.ARRAY_INDEX.second=originalPosition+1;
		effectiveRate.ARRAY_INDEX.third=originalPosition;
		effectiveRate.ARRAY_INDEX.fourth=100;
		effectiveRate.ARRAY_INDEX.fifth=99;
	}
	else if(originalPosition===1)
	{
		effectiveRate.ARRAY_INDEX.empty=originalPosition+3;
		effectiveRate.ARRAY_INDEX.first=originalPosition+2;
		effectiveRate.ARRAY_INDEX.second=originalPosition+1;
		effectiveRate.ARRAY_INDEX.third=originalPosition;
		effectiveRate.ARRAY_INDEX.fourth=0;
		effectiveRate.ARRAY_INDEX.fifth=100;
	}
	else if(originalPosition===99)
	{
		effectiveRate.ARRAY_INDEX.first=0;
		effectiveRate.ARRAY_INDEX.second=originalPosition+1;
		effectiveRate.ARRAY_INDEX.third=originalPosition;
		effectiveRate.ARRAY_INDEX.fourth=98;
		effectiveRate.ARRAY_INDEX.fifth=97;
		effectiveRate.ARRAY_INDEX.empty=96;
	}
	else if(originalPosition===100)
	{
		effectiveRate.ARRAY_INDEX.first=1;
		effectiveRate.ARRAY_INDEX.second=0;
		effectiveRate.ARRAY_INDEX.third=originalPosition;
		effectiveRate.ARRAY_INDEX.fourth=99;
		effectiveRate.ARRAY_INDEX.fifth=98;
		effectiveRate.ARRAY_INDEX.empty=97;
	}
	else
	{
		effectiveRate.ARRAY_INDEX.first=originalPosition+2;
		effectiveRate.ARRAY_INDEX.second=originalPosition+1;
		effectiveRate.ARRAY_INDEX.third=originalPosition;
		effectiveRate.ARRAY_INDEX.fourth=originalPosition-1;
		effectiveRate.ARRAY_INDEX.fifth=originalPosition-2;
	}
}

EcoEffectCtrl.prototype._drawStaticText = function(effectiveRate,context)
{	
	
	this._findPositions(effectiveRate);

	
	context.shadowColor = "#000";
	context.shadowOffsetX = 4;
	context.shadowOffsetY = 0;
	context.shadowBlur = 6;
	
	context.font = " "+effectiveRate.POSITIONS.text1.fontSize+"px Tipperary";
	context.textAlign="center";
	context.fillStyle="rgba(255, 255, 255,0.3";
	//context.fillStyle="white,0.2"; 
	context.fillText(this.ALLTEXTS[effectiveRate.ARRAY_INDEX.first]+"",effectiveRate.POSITIONS.text1.x, this.FIXED_POSITION_Y[0]);
	

	
	context.font = " "+effectiveRate.POSITIONS.text2.fontSize+"px Tipperary";
	context.textAlign="center";
	context.fillStyle="rgba(255, 255, 255,0.8";
	//context.fillStyle="white,0.5"; 
	context.fillText(this.ALLTEXTS[effectiveRate.ARRAY_INDEX.second]+"",effectiveRate.POSITIONS.text2.x, this.FIXED_POSITION_Y[1]);


	context.font = "bold "+effectiveRate.POSITIONS.text3.fontSize+"px Tipperary";
	context.textAlign="center";
	context.fillStyle="rgba(255, 255, 255,1.0";
	//context.fillStyle="white,1.0";	
	context.fillText(this.ALLTEXTS[effectiveRate.ARRAY_INDEX.third]+"",effectiveRate.POSITIONS.text3.x, this.FIXED_POSITION_Y[2]);
	
	
	context.font = " "+effectiveRate.POSITIONS.text4.fontSize+"px Tipperary";
	context.textAlign="center";
	context.fillStyle="rgba(255, 255, 255,0.8";
	//context.fillStyle="white,0.5";
	context.fillText(this.ALLTEXTS[effectiveRate.ARRAY_INDEX.fourth]+"",effectiveRate.POSITIONS.text4.x, this.FIXED_POSITION_Y[3]);
	
	
	context.font = " "+effectiveRate.POSITIONS.text5.fontSize+"px Tipperary";
	context.textAlign="center";
	context.fillStyle="rgba(255, 255, 255,0.3";
	//context.fillStyle="white,0.2"; 
	context.fillText(this.ALLTEXTS[effectiveRate.ARRAY_INDEX.fifth]+"",effectiveRate.POSITIONS.text5.x, this.FIXED_POSITION_Y[4]);
	
}



EcoEffectCtrl.prototype._drawDownAnimation = function(effectiveRate,originalRate,stopRate,context)
{
	var speed = 2;
	var multiplicationFactor=speed;
	var multiplicationFactor=1;
	var steps =4;
	
	
	var firstY  = this.FIXED_POSITION_Y[0];
	var secondY = this.FIXED_POSITION_Y[1]-this.FIXED_POSITION_Y[0];
	var thirdY  = this.FIXED_POSITION_Y[2]-this.FIXED_POSITION_Y[1];
	var fourthY = this.FIXED_POSITION_Y[3]-this.FIXED_POSITION_Y[2];
	var fifthY  = this.FIXED_POSITION_Y[4]-this.FIXED_POSITION_Y[3];
	var sixthY  = this.FIXED_POSITION_Y[5]-this.FIXED_POSITION_Y[4];
	
	
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	context.save();
	
	this._findPositions(effectiveRate);

	if(effectiveRate.ARRAY_INDEX.first===100)
	{
		effectiveRate.ARRAY_INDEX.empty=0;
	}
	else
	{
		effectiveRate.ARRAY_INDEX.empty=effectiveRate.ARRAY_INDEX.first+1;
	}
	
	if((effectiveRate.textOriginalMid<originalRate+steps)||(effectiveRate.textOriginalMid>=stopRate-steps))
	//if(effectiveRate.textOriginalMid<=stopRate+steps)
	{
		if(effectiveRate.POSITIONS.text4.y<this.FIXED_POSITION_Y[4])
		{
			multiplicationFactor=speed;

			effectiveRate.POSITIONS.emptytext.y=effectiveRate.POSITIONS.emptytext.y+((multiplicationFactor*firstY)/14);
			effectiveRate.POSITIONS.text1.y=effectiveRate.POSITIONS.text1.y+((multiplicationFactor*secondY)/14);
			effectiveRate.POSITIONS.text2.y=effectiveRate.POSITIONS.text2.y+((multiplicationFactor*thirdY)/14);
			effectiveRate.POSITIONS.text3.y=parseFloat(effectiveRate.POSITIONS.text3.y+((multiplicationFactor*fourthY)/14));
			effectiveRate.POSITIONS.text4.y=effectiveRate.POSITIONS.text4.y+((multiplicationFactor*fifthY)/14);
			effectiveRate.POSITIONS.text5.y=effectiveRate.POSITIONS.text5.y+((multiplicationFactor*sixthY)/14);
			
			
			if(effectiveRate.POSITIONS.text2.fontSize<42)
			{
				effectiveRate.POSITIONS.text2.fontSize=effectiveRate.POSITIONS.text2.fontSize+((multiplicationFactor*24)/14);
			}
			else
			{
				effectiveRate.POSITIONS.text2.fontSize=42;
			}
			if(effectiveRate.POSITIONS.text3.fontSize>18)
			{
				effectiveRate.POSITIONS.text3.fontSize=effectiveRate.POSITIONS.text3.fontSize-((multiplicationFactor*24)/14);
			}
			else
			{
				effectiveRate.POSITIONS.text2.fontSize=18;
			}
		}
		else
		{
			//effectiveRate.move_by=0;
			effectiveRate.move_by=effectiveRate.move_by-1;
			effectiveRate.textOriginalMid=effectiveRate.textOriginalMid+1;
			
			effectiveRate.POSITIONS.emptytext.y=0;//this.FIXED_POSITION_Y[5];
			effectiveRate.POSITIONS.text1.y=this.FIXED_POSITION_Y[0];
			effectiveRate.POSITIONS.text2.y=this.FIXED_POSITION_Y[1];
			effectiveRate.POSITIONS.text3.y=this.FIXED_POSITION_Y[2];
			effectiveRate.POSITIONS.text4.y=this.FIXED_POSITION_Y[3];
			effectiveRate.POSITIONS.text5.y=this.FIXED_POSITION_Y[4];
			
			effectiveRate.POSITIONS.text1.fontSize=18;
			effectiveRate.POSITIONS.text2.fontSize=18;
			effectiveRate.POSITIONS.text3.fontSize=42;
			effectiveRate.POSITIONS.text4.fontSize=18;
			effectiveRate.POSITIONS.text5.fontSize=18;
			effectiveRate.POSITIONS.emptytext.fontSize=18;
			
			this._findPositions(effectiveRate);
		}
	}
	else
	{
		effectiveRate.POSITIONS.emptytext.y=0;
		effectiveRate.POSITIONS.text1.y=this.FIXED_POSITION_Y[0];
		effectiveRate.POSITIONS.text2.y=this.FIXED_POSITION_Y[1];
		effectiveRate.POSITIONS.text3.y=this.FIXED_POSITION_Y[2];
		effectiveRate.POSITIONS.text4.y=this.FIXED_POSITION_Y[3];
		effectiveRate.POSITIONS.text5.y=this.FIXED_POSITION_Y[4];

		//effectiveRate.textOriginalMid=effectiveRate.textOriginalMid-1;
		effectiveRate.textOriginalMid=stopRate-steps;
		//effectiveRate.move_by=effectiveRate.move_by-1;
		effectiveRate.move_by=steps;
			
		this._findPositions(effectiveRate);
		
		effectiveRate.POSITIONS.text1.fontSize=18;
		effectiveRate.POSITIONS.text2.fontSize=18;
		effectiveRate.POSITIONS.text3.fontSize=42;
		effectiveRate.POSITIONS.text4.fontSize=18;
		effectiveRate.POSITIONS.text5.fontSize=18;
		effectiveRate.POSITIONS.emptytext.fontSize=18;
		
	}
	
	context.shadowColor = "#000";
	context.shadowOffsetX = 2;
	context.shadowOffsetY = 0;
	context.shadowBlur = 3;
	
	context.font = " "+effectiveRate.POSITIONS.emptytext.fontSize+"px Tipperary";
	context.textAlign="center";
	//context.fillStyle=my_gradient;
	context.fillStyle="rgba(255, 255, 255,0.3";
	context.fillText(this.ALLTEXTS[effectiveRate.ARRAY_INDEX.empty]+"",effectiveRate.POSITIONS.emptytext.x, effectiveRate.POSITIONS.emptytext.y);

	context.font = " "+effectiveRate.POSITIONS.text1.fontSize+"px Tipperary";
	context.textAlign="center";
	//context.fillStyle="white";
	context.fillStyle="rgba(255, 255, 255,0.3";
	context.fillText(this.ALLTEXTS[effectiveRate.ARRAY_INDEX.first]+"",effectiveRate.POSITIONS.text1.x, effectiveRate.POSITIONS.text1.y);

	context.font = " "+effectiveRate.POSITIONS.text2.fontSize+"px Tipperary";
	context.textAlign="center";
	//context.fillStyle="white";
	context.fillStyle="rgba(255, 255, 255,0.8";
	context.fillText(this.ALLTEXTS[effectiveRate.ARRAY_INDEX.second]+"",effectiveRate.POSITIONS.text2.x, effectiveRate.POSITIONS.text2.y);

	context.font = "bold "+effectiveRate.POSITIONS.text3.fontSize+"px Tipperary";
	context.textAlign="center";
	//context.fillStyle="white";
	context.fillStyle="rgba(255, 255, 255,1.0";
	context.shadowColor="black";
	//context.shadowBlur="";
	context.fillText(this.ALLTEXTS[effectiveRate.ARRAY_INDEX.third]+"",effectiveRate.POSITIONS.text3.x, effectiveRate.POSITIONS.text3.y);

	context.font = " "+effectiveRate.POSITIONS.text4.fontSize+"px Tipperary";
	context.textAlign="center";
	//context.fillStyle="white";
	context.fillStyle="rgba(255, 255, 255,0.8";
	context.fillText(this.ALLTEXTS[effectiveRate.ARRAY_INDEX.fourth]+"",effectiveRate.POSITIONS.text4.x, effectiveRate.POSITIONS.text4.y);

	
	context.font = " "+effectiveRate.POSITIONS.text5.fontSize+"px Tipperary";
	context.textAlign="center";
	context.fillStyle="rgba(255, 255, 255,0.3";
	context.fillText(this.ALLTEXTS[effectiveRate.ARRAY_INDEX.fifth]+"",effectiveRate.POSITIONS.text5.x, effectiveRate.POSITIONS.text5.y);

	context.restore();
	
	if(effectiveRate.move_by===0)
	{
		clearInterval(effectiveRate.intervalContext.animateDown);
		effectiveRate.intervalContext.animateDown = null;
		effectiveRate.textOriginalMid = stopRate;
	}
}


EcoEffectCtrl.prototype._drawUpAnimation=function(effectiveRate,originalRate,stopRate,context)
{
	var speed = 2;
	var multiplicationFactor=speed;
	var steps = 4;
	
	var firstY  = this.FIXED_POSITION_Y[0];
	var secondY = this.FIXED_POSITION_Y[1]-this.FIXED_POSITION_Y[0];
	var thirdY  = this.FIXED_POSITION_Y[2]-this.FIXED_POSITION_Y[1];
	var fourthY = this.FIXED_POSITION_Y[3]-this.FIXED_POSITION_Y[2];
	var fifthY  = this.FIXED_POSITION_Y[4]-this.FIXED_POSITION_Y[3];
	var sixthY  = this.FIXED_POSITION_Y[5]-this.FIXED_POSITION_Y[4];
	
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	context.save();
	
	this._findPositions(effectiveRate);

	if(effectiveRate.ARRAY_INDEX.fifth===0)
	{
		effectiveRate.ARRAY_INDEX.empty=100;
	}
	else
	{
		effectiveRate.ARRAY_INDEX.empty=effectiveRate.ARRAY_INDEX.fifth-1;
	}

	if((effectiveRate.textOriginalMid>originalRate-steps)||(effectiveRate.textOriginalMid<=stopRate+steps))
	//if((effectiveRate.textOriginalMid>originalRate+steps)||(effectiveRate.textOriginalMid<=stopRate-steps))
	{
		if(effectiveRate.POSITIONS.text5.y>this.FIXED_POSITION_Y[3])
		{
			multiplicationFactor=speed;
			
			effectiveRate.POSITIONS.emptytext.y=effectiveRate.POSITIONS.emptytext.y-((multiplicationFactor*sixthY)/14);
			effectiveRate.POSITIONS.text1.y=effectiveRate.POSITIONS.text1.y-((multiplicationFactor*firstY)/14);
			effectiveRate.POSITIONS.text2.y=effectiveRate.POSITIONS.text2.y-((multiplicationFactor*secondY)/14);
			effectiveRate.POSITIONS.text3.y=effectiveRate.POSITIONS.text3.y-((multiplicationFactor*thirdY)/14);
			effectiveRate.POSITIONS.text4.y=effectiveRate.POSITIONS.text4.y-((multiplicationFactor*fourthY)/14);
			effectiveRate.POSITIONS.text5.y=parseFloat(effectiveRate.POSITIONS.text5.y-((multiplicationFactor*fifthY)/14));
			
			if(effectiveRate.POSITIONS.text3.fontSize>18)
			{
				effectiveRate.POSITIONS.text3.fontSize=effectiveRate.POSITIONS.text3.fontSize-((multiplicationFactor*24)/14);
			}
			else
			{
				effectiveRate.POSITIONS.text3.fontSize=18;
			}
			if(effectiveRate.POSITIONS.text4.fontSize<42)
			{
				effectiveRate.POSITIONS.text4.fontSize=effectiveRate.POSITIONS.text4.fontSize+((multiplicationFactor*24)/14);
			}
			else
			{
				effectiveRate.POSITIONS.text4.fontSize=42;
			}
		}
		else
		{
			//effectiveRate.move_by=0;
			effectiveRate.move_by=effectiveRate.move_by-1;
			effectiveRate.textOriginalMid=effectiveRate.textOriginalMid-1;
			
			effectiveRate.POSITIONS.emptytext.y=this.FIXED_POSITION_Y[5];
			effectiveRate.POSITIONS.text1.y=this.FIXED_POSITION_Y[0];
			effectiveRate.POSITIONS.text2.y=this.FIXED_POSITION_Y[1];
			effectiveRate.POSITIONS.text3.y=this.FIXED_POSITION_Y[2];
			effectiveRate.POSITIONS.text4.y=this.FIXED_POSITION_Y[3];
			effectiveRate.POSITIONS.text5.y=this.FIXED_POSITION_Y[4];
			
			effectiveRate.POSITIONS.text1.fontSize=18;
			effectiveRate.POSITIONS.text2.fontSize=18;
			effectiveRate.POSITIONS.text3.fontSize=42;
			effectiveRate.POSITIONS.text4.fontSize=18;
			effectiveRate.POSITIONS.text5.fontSize=18;
			effectiveRate.POSITIONS.emptytext.fontSize=18;
			
			this._findPositions(effectiveRate);
		}
	}
	else
	{
		effectiveRate.POSITIONS.emptytext.y=this.FIXED_POSITION_Y[5];
		effectiveRate.POSITIONS.text1.y=this.FIXED_POSITION_Y[0];
		effectiveRate.POSITIONS.text2.y=this.FIXED_POSITION_Y[1];
		effectiveRate.POSITIONS.text3.y=this.FIXED_POSITION_Y[2];
		effectiveRate.POSITIONS.text4.y=this.FIXED_POSITION_Y[3];
		effectiveRate.POSITIONS.text5.y=this.FIXED_POSITION_Y[4];

		//effectiveRate.textOriginalMid=effectiveRate.textOriginalMid+1;
		effectiveRate.textOriginalMid=stopRate+steps;
		//effectiveRate.move_by=effectiveRate.move_by-1;
		effectiveRate.move_by=steps;
			
		this._findPositions(effectiveRate);
		
		effectiveRate.POSITIONS.text1.fontSize=18;
		effectiveRate.POSITIONS.text2.fontSize=18;
		effectiveRate.POSITIONS.text3.fontSize=42;
		effectiveRate.POSITIONS.text4.fontSize=18;
		effectiveRate.POSITIONS.text5.fontSize=18;
		effectiveRate.POSITIONS.emptytext.fontSize=18;
	}
	
	context.shadowColor = "#000";
	context.shadowOffsetX = 2;
	context.shadowOffsetY = 0;
	context.shadowBlur = 3;
	
	context.font = " "+effectiveRate.POSITIONS.emptytext.fontSize+"px Tipperary";
	context.textAlign="center";
	//context.fillStyle=my_gradient;
	context.fillStyle="rgba(255, 255, 255,0.3";
	context.fillText(this.ALLTEXTS[effectiveRate.ARRAY_INDEX.empty]+"",effectiveRate.POSITIONS.emptytext.x, effectiveRate.POSITIONS.emptytext.y);

	context.font = " "+effectiveRate.POSITIONS.text1.fontSize+"px Tipperary";
	context.textAlign="center";
	//context.fillStyle=my_gradient;
	context.fillStyle="rgba(255, 255, 255,0.3";
	context.fillText(this.ALLTEXTS[effectiveRate.ARRAY_INDEX.first]+"",effectiveRate.POSITIONS.text1.x, effectiveRate.POSITIONS.text1.y);

	context.font = " "+effectiveRate.POSITIONS.text2.fontSize+"px Tipperary";
	context.textAlign="center";
	//context.fillStyle="white";
	context.fillStyle="rgba(255, 255, 255,0.8";
	context.fillText(this.ALLTEXTS[effectiveRate.ARRAY_INDEX.second]+"",effectiveRate.POSITIONS.text2.x, effectiveRate.POSITIONS.text2.y);

	context.font = "bold "+effectiveRate.POSITIONS.text3.fontSize+"px Tipperary";
	context.textAlign="center";
	//context.fillStyle="white";
	context.fillStyle="rgba(255, 255, 255,1.0";
	context.fillText(this.ALLTEXTS[effectiveRate.ARRAY_INDEX.third]+"",effectiveRate.POSITIONS.text3.x, effectiveRate.POSITIONS.text3.y);

	context.font = " "+effectiveRate.POSITIONS.text4.fontSize+"px Tipperary";
	context.textAlign="center";
	//context.fillStyle="white";
	context.fillStyle="rgba(255, 255, 255,0.8";
	context.fillText(this.ALLTEXTS[effectiveRate.ARRAY_INDEX.fourth]+"",effectiveRate.POSITIONS.text4.x, effectiveRate.POSITIONS.text4.y);

	context.font = " "+effectiveRate.POSITIONS.text5.fontSize+"px Tipperary";
	context.textAlign="center";
	//context.fillStyle="white";
	context.fillStyle="rgba(255, 255, 255,0.3";
	context.fillText(this.ALLTEXTS[effectiveRate.ARRAY_INDEX.fifth]+"",effectiveRate.POSITIONS.text5.x, effectiveRate.POSITIONS.text5.y);

	context.restore();
	
	if(effectiveRate.move_by===0)
	{
		clearInterval(effectiveRate.intervalContext.animateUp);
		effectiveRate.intervalContext.animateUp = null;
		effectiveRate.textOriginalMid = stopRate;
	}
}

EcoEffectCtrl.prototype._scroll= function(effectiveRate,stopRate,context)
{

	effectiveRate.move_by=effectiveRate.textOriginalMid - stopRate;
	

	if((effectiveRate.textOriginalMid - stopRate) != 0)
	{
		
		if((effectiveRate.textOriginalMid - stopRate) <0)
		{
			clearInterval(effectiveRate.intervalContext.animateUp);
			effectiveRate.intervalContext.animateUp =null;
			
			effectiveRate.POSITIONS.emptytext.y=0;
			effectiveRate.move_by = -(effectiveRate.move_by);
			effectiveRate.intervalContext.animateDown = setInterval(this._drawDownAnimation.bind(this,effectiveRate,effectiveRate.textOriginalMid,stopRate,context), 8);//8);
	
		}
		else
		{
			
			clearInterval(effectiveRate.intervalContext.animateDown);
			effectiveRate.intervalContext.animateDown =null;
			
			effectiveRate.POSITIONS.emptytext.y=this.FIXED_POSITION_Y[5];
			
			effectiveRate.intervalContext.animateUp = setInterval(this._drawUpAnimation.bind(this,effectiveRate,effectiveRate.textOriginalMid,stopRate,context), 8);//8);
		}
	}
	else
	{
		this._drawStaticText(effectiveRate,context);
	}
};

framework.registerCtrlLoaded("EcoEffectCtrl");