/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: IdmCtrl.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: atiwarc
 Date: 04-01-2012
 __________________________________________________________________________

 Description: IHU GUI IdmCtrl
 v0.1 (04-01-2013)  Initial implementation (As per 0.1.00  spec)
 v0.2 (26-08-2014)  Introduce one more case in function setCurrentStageNumber to display '--' - avalajh 
 __________________________________________________________________________

 */

log.addSrcFile("IdmCtrl.js", "common");

function IdmCtrl(uiaId, parentDiv, controlId, properties)
{    
    this.uiaId = uiaId;
    this.divElt = parentDiv;
    this.controlId = controlId;
    this.context = null;
    this.upperContext = null;
    
    this._totalBars = 11;
    this._youngestBarDataId = this._totalBars - 2;
    this._newBarDataId = this._totalBars - 1;
    this._currentBarDataId = this._totalBars;
    this._GraphBarValues  = new Array();
    
    this._maxAngleLeft = 128 ;
    this._maxAngleRight = 130 ;
    this._maxRegion = 10 ;
    this._regionLeft = 0 ;
    this._regionRight = 0 ;
    this._umpPanelStatus = false;
    this.switchViewButtonCtrl = null;
    this._cbGraphLeftAnimationEnd = null;
    
    this.currentScore=0;
    this.averageScore=0;
    this.breakWhiteFinish = false;
    this.breakBlueFinish = false;
    this.steerWhiteFinish = false;
    this.steerBlueFinish = false;
    this.accelerateWhiteFinish = false;
    this.accelerateBlueFinish = false;
    this.stChanged = false;
    
    this._CSSConstants = 
    {
            // Width (in pixels) of a bar
        "GraphBarWidth"         : 30,
        // Space between/around bars
        "GraphBarSpacing"       : 13,
        "GraphBarMargin"        : 8,
        "GraphVisibleHeight"    : 136
    };
    
    
    
    this.properties =
    {
        "subMap"                   : null,
        "ctrlStyle"                : "",
        "selectCallback"           : null,
        "switchViewId"             : "",
        "switchViewText"           : "",
        "umpButtonConfig"                :  null,
        "defaultSelectCallback"    : null,
        "defaultSlideCallback"          : null,
        "defaultHoldStartCallback" : null,
        "defaultHoldStopCallback"  : null,
        "dataList"                            : null,
        "umpStyle"                            : null,
        "umpPanelStatus"               : false
    };
    
    
    
    //@formatter:on
    // Copy properties from the app
    for (var key in properties)
    {
        this.properties[key] = properties[key];
    }
    this._loadStyleAndCordinateInfo();
    
    // Create DOM elements
    this._createStructure();
    if(this.properties.ctrlStyle === 'simple')
    {
          this._CSSConstants["GraphVisibleHeight"] = 275;
    }
}


/*******************/
/* Private Methods */
/*******************/

IdmCtrl.prototype._init = function()
{
    log.info("IdmCtrl: _init() called...");
      
    this._setGraphBarPositions();
    
    if(this.properties.scoreGraphObj)
    {
          this.initializeBarGraph(this.properties.scoreGraphObj.initialBarValues);
    }
    // Set the switch view button label
    var buttonLabel = this._translateString(this.properties.switchViewId,
                                            this.properties.switchViewText,
                                            this.properties.subMap); 
    this.switchViewButtonCtrl.setButtonLabel(buttonLabel);
    
    this._cbGraphLeftAnimationEnd = this._cbGraphLeftAnimationEndFunction.bind(this);
};

IdmCtrl.prototype._cbGraphLeftAnimationEndFunction = function(e)
{
    this.actualGraphSurface.removeEventListener('oTransitionEnd', this._cbGraphLeftAnimationEnd, false);

    // Stop propagating the event
    e.stopPropagation();

    this._resetBarGraphs(false);
}

IdmCtrl.prototype._createStructure = function()
{
    log.info("creating structure for style: " + this.properties.ctrlStyle);
    
    // Create the div for control
    this.controlDiv = document.createElement('div');
    this.controlDiv.className = "IdmCtrl";
    
    this.stageTitleWrapper = document.createElement('div');
    this.stageTitleWrapper.className = "IdmCtrlStageTitleWrapper";
    this.controlDiv.appendChild(this.stageTitleWrapper);
    
    this.stageTitle = document.createElement('div');
    this.stageTitle.className = "IdmCtrlStageTitle";
    this.stageTitle.innerHTML=this._stringToHTML('<span>'+this._translateToStr("stage1")+'</span>');
    this.stageTitleWrapper.appendChild(this.stageTitle);
    
    this.umpPanelDiv = document.createElement('div');
    this.umpPanelDiv.className = "UmpPanelDivDisable";
    
    this.stageAreaDiv = document.createElement('div');
    this.stageAreaDiv.className = "IdmCtrlStageArea";
    
    this.trendAreaDiv = document.createElement('div');
    this.textAreaDiv = document.createElement('div');
    
    this.transitionTextWrapper = document.createElement('div');
    this.transitionTextWrapper.className = 'IdmCtrlTransitionTextWrapper';
    
    this.transitionText = document.createElement('div');   
    this.transitionText.innerHTML = this._stringToHTML('<span>'+this._translateToStr("scoreTransition")+'</span>');
    this.transitionText.className = 'IdmCtrlTransitionText';
    
    this.transitionTextWrapper.appendChild(this.transitionText);
    this.controlDiv.appendChild(this.transitionTextWrapper);
    
    this.graphClipMask = document.createElement('div');
    this.graphClipMask.className = 'IdmCtrlGraphClipMask';
    
    this.actualGraphSurface = document.createElement('div');
    this.actualGraphSurface.className = 'IdmCtrlActualGraphSurface';
    
    for (var i = 1; i <= this._totalBars; i++)
    {
        var curBar = document.createElement('div');
        curBar.id = 'curBar' + i;
        
        var curBarCap = document.createElement('div');
        curBarCap.className = 'IdmCtrlBarGraphCoreCap';
        
        switch (i)
        {
            case this._newBarDataId :
            	 curBar.className = 'IdmCtrlBarGraphCurrentCore';
            	 this.GraphCurrentBar = curBar;
            	 
                break;
            case this._currentBarDataId :
            	curBar.className = 'IdmCtrlBarGraphCurrentCore';
            	
                break;
            default:
            	curBar.className = 'IdmCtrlBarGraphCore';
                break;
        }
        
        curBar.appendChild(curBarCap);
        this.actualGraphSurface.appendChild(curBar);
    }
    
    
    if(this.properties.mode === "live")
    {
	    this.graphClipMask.appendChild(this.actualGraphSurface);
	    this.controlDiv.appendChild(this.graphClipMask);
	    this._addXAxisLabel(this.properties.ctrlStyle);
    }
    
    this.currentScoreArea = document.createElement('div');
    this.controlDiv.appendChild(this.currentScoreArea);
    
    this.driverNameWrapper = document.createElement('div');
    this.driverNameWrapper.className = 'IdmCtrlDriverNameWrapper';
    this.driverName = document.createElement('div');
    this.driverName.className = 'IdmCtrlDriverName';
    this.driverName.innerHTML = '';
    
    this.currentScoreTitleWrapper = document.createElement('div');
    this.currentScoreTitle = document.createElement('div');
    this.currentScoreValueWrapper = document.createElement('div');
    this.currentScoreValue = document.createElement('div');
    this.currentScoreValue.innerHTML = this._stringToHTML('<span>--</span>');
    
    this.controlDiv.appendChild(this.driverNameWrapper);
    this.driverNameWrapper.appendChild(this.driverName);
    this.controlDiv.appendChild(this.currentScoreTitleWrapper);
    this.currentScoreTitleWrapper.appendChild(this.currentScoreTitle);
    this.controlDiv.appendChild(this.currentScoreValueWrapper);
    this.currentScoreValueWrapper.appendChild(this.currentScoreValue);
    
    this.avgScoreTitleWrapper = document.createElement('div');
    this.avgScoreTitle = document.createElement('div');
    this.avgScoreValueWrapper = document.createElement('div');
    this.avgScoreValue = document.createElement('div');
    this.avgScoreValue.innerHTML = '--';
    
    this.avgStar= document.createElement('img');
    this.avgStar.src = "apps/idm/controls/Idm/images/iDM_star_gold.png";
    
    this.controlDiv.appendChild(this.avgScoreTitleWrapper);
    this.avgScoreTitleWrapper.appendChild(this.avgScoreTitle);
    this.controlDiv.appendChild(this.avgScoreValueWrapper);
    this.avgScoreValueWrapper.appendChild(this.avgScoreValue);
    
    this.controlDiv.appendChild(this.textAreaDiv);
    this.controlDiv.appendChild(this.trendAreaDiv);
   
    // Attach control to parent        
    this.divElt.appendChild(this.controlDiv);
    
    if(this.properties.mode === "live")
    {
    	  this.textAreaDiv.className = "IdmCtrlHidden";
          this.divElt.appendChild(this.umpPanelDiv);
          
          switch(this.properties.ctrlStyle)
          {
                case 'simple':
                	
                	  this._attachClassNamesSimple();
                	  this.controlDiv.className = "IdmCtrl IdmCtrlSimpleMode";
               
                	  this.trendAreaDiv.className = "IdmCtrlHidden";
                      this._addLastbarLabel();
                      this.actualGraphSurface.className = 'IdmCtrlActualGraphSurface IdmCtrlActualGraphSurfaceSimple';
                      this.graphClipMask.className = 'IdmCtrlGraphClipMask IdmCtrlGraphClipMaskSimple';
                      break;
                
                case 'training':
                	
                	  this._attachClassNamesTraining();
                	  this.controlDiv.className = "IdmCtrl";
                	  this._createTrendSection(this.properties.mode);
                	  
                	  this.actualGraphSurface.className = 'IdmCtrlActualGraphSurface IdmCtrlActualGraphSurfaceTraining';
                      this.graphClipMask.className = 'IdmCtrlGraphClipMask IdmCtrlGraphClipMaskTraining';
                      this._addLastbarLabel();
                      this.divElt.appendChild(this.umpPanelDiv);
                	 
                	  break;
                default :
                      log.warn('Control style did not match with existing styles provided !!!');
                      break;
          }
    }
    else if(this.properties.mode === "ending")
    {
    	  this.transitionTextWrapper.className = 'IdmCtrlTransitionTextWrapper IdmCtrlTransitionTextEndingScreen';
    	  this.transitionText.innerHTML = this._stringToHTML('<span>'+this._translateToStr("drvAdvice")+'</span>');
    	  this.stageTitleWrapper.className = "IdmCtrlStageTitleWrapperEnding";
    	  this.stageTitle.className = "IdmCtrlStageTitleEnding";
    	  this.driverNameWrapper.className = 'IdmCtrlDriverNameTrainingWrapper';
    	  this.driverName.className = 'IdmCtrlDriverNameTraining';
    	  
    	  switch(this.properties.ctrlStyle) 
          {
                case 'simple':
                	
                	 this._attachClassNamesSimple();
                	 this.currentScoreArea.className = 'IdmCtrlCurrentScoreArea IdmCtrlCurrentScoreAreaEndingSimple';
                	 this.controlDiv.className = "IdmCtrl IdmCtrlEndingSimple";
                	 this.avgStar.className = 'IdmCtrlAvgScoreStarSimple';
                	
                	 this._createDriverAdviceSection("simple");
                	 break;
                	 
                case 'training':
                
                	 this._attachClassNamesTraining();
               	     this.currentScoreArea.className = 'IdmCtrlCurrentScoreAreaSimpleTraining IdmCtrlCurrentScoreAreaEndingTraining';
               	     this.controlDiv.className = "IdmCtrl";
               	     this.avgStar.className = 'IdmCtrlAvgScoreStarTraining';
               	     
               	     this._createDriverAdviceSection("training");
                	 this._createTrendSection(this.properties.mode);
	               	
	               	  break;
	               	  
                default :
                      log.warn('Control style did not match with existing styles provided !!!');
                      break;
          }
    	  this.controlDiv.appendChild(this.avgStar);
    	  
    	  for(i=1;i<=5;i++)
          {
        		this.image = document.createElement('img');
        		this.image.className='IdmCtrlStageStars'+i;
        		this.image.id="img"+i;
        		this.image.src = "apps/idm/controls/Idm/images/iDM_star_black.png";
        		this.controlDiv.appendChild(this.image); 
          }	
    	  
    	 
    }
    else
    {
          log.warn('Can not create structure as mode did not match !!!');
    }
    
    
    
    /*
        this.properties.modeMsgTitleText = this._translateString(this.properties.modeMsgTitleId,
                                            this.properties.modeMsgTitleText,
                                           this.properties.subMap);
    }*/
    
   
	    var umpConfig = {
	            "buttonConfig" : this.properties['umpButtonConfig'],
	            "defaultSelectCallback" : this.properties['defaultSelectCallback'],
	            "umpStyle" : this.properties['umpStyle'],
	            "hasScrubber" : this.properties['hasScrubber'],
	            "scrubberConfig" : this.properties['scrubberConfig'],
	            "retracted" : true
	        };
	    
	  //@formatter:on
	    log.info("Instantiating umpCtrl...");
	    this.umpCtrl = framework.instantiateControl(this.uiaId, this.umpPanelDiv, "Ump3Ctrl", umpConfig);
	    
	 // Instantiate the "Switch View" button
	    //@formatter:off
	    var btnInstanceProperties =
	    {
	        "selectCallback" : this._selectHandler.bind(this),
	        "enabledClass" : "IdmStatusCtrl_SwitchView",
	        "disabledClass" : null,
	        "focusedClass": null,
	        "downClass" : "IdmStatusCtrl_SwitchView_Hit",
	        "heldClass" : "IdmStatusCtrl_SwitchView_Hit",
	        "appData" : this.properties.appData,
	    };
	    
	   if(this.properties.mode === "live")
	   {
	    	//@formatter:on
	    	this.switchViewButtonCtrl = framework.instantiateControl(this.uiaId, this.controlDiv, "ButtonCtrl", btnInstanceProperties);
	    	this._init();
	   }    
};

IdmCtrl.prototype.hideDisplay = function(){
	this.controlDiv.className = "IdmCtrlHidden";
};

IdmCtrl.prototype._translateToStr = function(strId){
	var str = "" ;
	if(strId !== null){
		str = framework.localize.getLocStr(this.uiaId, strId);
	}else{		
	}
	return str ;
};
/*  Create Driver Advice Section */ 
IdmCtrl.prototype._createDriverAdviceSection = function(ctrlStyle)
{
	log.info("IdmCtrl: _createDriverAdviceSection() called ");
	this.adviceDiv=document.createElement('div');
    this.controlDiv.appendChild(this.adviceDiv);
    
    this.adviceText = document.createElement('h2');
    this.controlDiv.appendChild(this.adviceText);
    
    this.adviceDivComment1 = document.createElement('h2');
    this.controlDiv.appendChild(this.adviceDivComment1);
    
    if(ctrlStyle==="simple")
	{
		this.adviceDiv.className = 'IdmCtrlAdvice';
		this.adviceText.className = 'IdmCtrlAdviceText';
	    this.adviceDivComment1.className = 'IdmCtrlAdviceComment1';
	}
	else if(ctrlStyle==="training")
	{
		this.adviceDiv.className = 'IdmCtrlAdvice IdmCtrlAdviceTraining';
        this.adviceText.className = 'IdmCtrlAdviceTrainingText';
        this.adviceDivComment1.className = 'IdmCtrlAdviceTrainingComment1';
	}
};

/*  Attach Css Classes to simple screen Elements */
IdmCtrl.prototype._attachClassNamesSimple = function()
{
	  this.currentScoreArea.className = 'IdmCtrlCurrentScoreArea';
	  this.currentScoreTitleWrapper.className = 'IdmCtrlCurrScoreTitleWrapper';
	  this.currentScoreTitle.className = 'IdmCtrlCurrScoreTitle';
	  this.currentScoreValueWrapper.className = 'IdmCtrlCurrScoreValueWrapper';
	  this.currentScoreValue.className = 'IdmCtrlCurrScoreValue';
	  
	  this.avgScoreTitleWrapper.className = 'IdmCtrlAvgScoreTitleWrapper';
	  this.avgScoreTitle.className = 'IdmCtrlAvgScoreTitle';
	  this.avgScoreValueWrapper.className = 'IdmCtrlAvgScoreValueWrapper';
	  this.avgScoreValue.className = 'IdmCtrlAvgScoreValue';
	  
	  this.currentScoreTitle.innerHTML = this._stringToHTML('<span>'+this._translateToStr("currScore")+'</span>');
	  this.avgScoreTitle.innerHTML = this._stringToHTML('<span>'+this._translateToStr("avgScore")+'</span>');
};

/*  Attach Css Classes to Training screen Elements */
IdmCtrl.prototype._attachClassNamesTraining = function()
{
	  this.currentScoreArea.className = 'IdmCtrlCurrentScoreAreaSimpleTraining';
	  this.currentScoreTitleWrapper.className = 'IdmCtrlCurrScoreTitleTrainingWrapper';
 	  this.currentScoreTitle.className = 'IdmCtrlCurrScoreTitleTraining';
 	  this.currentScoreValueWrapper.className = 'IdmCtrlCurrScoreValueTrainingWrapper';
 	  this.currentScoreValue.className = 'IdmCtrlCurrScoreValueTraining';
 	  
 	  this.avgScoreTitleWrapper.className = 'IdmCtrlAvgScoreTitleTrainingWrapper';
 	  this.avgScoreTitle.className = 'IdmCtrlAvgScoreTitleTraining';
 	  this.avgScoreValueWrapper.className = 'IdmCtrlAvgScoreValueTrainingWrapper';
 	  this.avgScoreValue.className = 'IdmCtrlAvgScoreValueTraining';
 	  
 	  this.currentScoreTitle.innerHTML = this._stringToHTML('<span>'+this._translateToStr("currScore")+'</span>');
	  this.avgScoreTitle.innerHTML = this._stringToHTML('<span>'+this._translateToStr("avgScore")+'</span>');
};

/*  Create Current Trend(Accelerate,Break,Steering) Section */ 
IdmCtrl.prototype._createTrendSection = function(mode)
{
	log.info("IdmCtrl: _createTrendSection() called ");
	this.trendAreaDiv.className = "IdmCtrlTrendArea";
	
    this.EndingBackground = document.createElement('div');
    this.EndingBackground.className = 'EndingBackground';
    
    this.EndingTransparentBackground = document.createElement('div');
    if(mode==="live")
    {
    	this.EndingTransparentBackground.className = 'IdmCtrlSimpleTraining';
    }
    else if(mode==="ending")
    {
    	this.EndingTransparentBackground.className = 'IdmCtrlEndingTraining';
    }
    
    this.controlDiv.appendChild(this.EndingBackground);
    this.controlDiv.appendChild(this.EndingTransparentBackground);
    
    this.trendTitle = document.createElement('h2');
    this.trendTitle.className = 'IdmCtrlTrendTitle';
    this.trendTitle.innerHTML = this._stringToHTML(this._translateToStr("currDrvTrnd"));
    
    this.brakeArea = document.createElement('div');
    this.brakeArea.className = 'IdmCtrlBrakeArea';
                          
    this.steerArea = document.createElement('div');
    this.steerArea.className = 'IdmCtrlSteerArea';
                          
    this.accArea = document.createElement('div');
    this.accArea.className = 'IdmCtrlAccArea';
    
    this.controlDiv.appendChild(this.trendTitle);
    this.controlDiv.appendChild(this.brakeArea);
    this.controlDiv.appendChild(this.steerArea);
    this.controlDiv.appendChild(this.accArea);
    
    this.brakeTextWrapper = document.createElement('div');
    this.brakeTextWrapper.className = 'IdmCtrlBrakeTextWrapper';
    this.brakeText = document.createElement('div');
    this.brakeText.className = 'IdmCtrlTrendSectionText';
    this.brakeText.innerHTML = this._translateToStr("brake");
    this.brakeTextWrapper.appendChild(this.brakeText);
    this.controlDiv.appendChild(this.brakeTextWrapper);
    
    this.SteerTextWrapper = document.createElement('div');
    this.SteerTextWrapper.className = 'IdmCtrlSteerTextWrapper';
    this.SteerText = document.createElement('div');
    this.SteerText.className = 'IdmCtrlTrendSectionText';
    this.SteerText.innerHTML = this._translateToStr("steer");
    this.SteerTextWrapper.appendChild(this.SteerText);
    this.controlDiv.appendChild(this.SteerTextWrapper);
    
    this.AccTextWrapper = document.createElement('div');
    this.AccTextWrapper.className = 'IdmCtrlAccTextWrapper';
    this.AccText = document.createElement('div');
    this.AccText.className = 'IdmCtrlTrendSectionText';
    this.AccText.innerHTML = this._translateToStr("acc");
    this.AccTextWrapper.appendChild(this.AccText);
    this.controlDiv.appendChild(this.AccTextWrapper);
    
    //This will create the brakeModule
    this._createBrakeModule();
    
    //This will create the steeringModule
    this._createSteeringModule();
    
    //This will create the accelerationModule
    this._createAccelerationModule();
};

IdmCtrl.prototype.initializeBarGraph = function(initialBarValues)
{  
  log.info("IdmCtrl: initializeBarGraph() called: initialBarValues = " +
              initialBarValues);
  if (initialBarValues)
  {
      for (var idx = 0; idx <= this._youngestBarDataId; idx++)
      {
          if (initialBarValues[idx])
          {
        	  if(initialBarValues[idx] > 5.0)
        	  {
        		  this._GraphBarValues[this._youngestBarDataId - idx] = 5.0;
        	  }
        	  else
        	  {
        		  this._GraphBarValues[this._youngestBarDataId - idx] = initialBarValues[idx] ;
        	  }
          }
          else
          {
              this._GraphBarValues[this._youngestBarDataId - idx] = 0;
          }
      }
      // Initialize the "hidden" slot for new data
      this._GraphBarValues[this._newBarDataId] = 0;
  }
  
  if(initialBarValues[0] == 0)
  {
	  this.lastBarLabelText.innerHTML = '--';
  }
  else if(initialBarValues[0])
  {
  	this.lastBarLabelText.innerHTML = initialBarValues[0];
  }
  else
  {
	  this.lastBarLabelText.innerHTML = '--';
  }
  
  this._resetBarGraphs(true);
      
};

IdmCtrl.prototype.insertCurrentBarGraph = function(currentBarValue)
{
	
    log.info("IdmCtrl: insertCurrentBarGraph() called: currentBarValue = " +
                currentBarValue);
    
    if(currentBarValue == 0)
    {
  	  this.lastBarLabelText.innerHTML = '--';
    }
    else if(currentBarValue)
    {
    	this.lastBarLabelText.innerHTML = currentBarValue;
    }
    else
    {
    	this.lastBarLabelText.innerHTML = '--';
    }

    // Add the new bar value to the data set
    if (currentBarValue) 
    {
    	if(currentBarValue >5.0)
    	{
    		this._GraphBarValues[this._newBarDataId] = 5.0;
    	}
    	else
    	{
    		this._GraphBarValues[this._newBarDataId] = currentBarValue;
    	}
    }
    else
    {
        this._GraphBarValues[this._newBarDataId] = 0;
    }

    this._setGraphBarHeight(this._newBarDataId);

    this.GraphCurrentBar.className = 'IdmCtrlBarGraphCore';
    
    // Turn on left transitions for the CDFE graph (for the next animation)
    this.actualGraphSurface.style.OTransition = 'left 0.6s ease 0s';

    
    
    this.actualGraphSurface.addEventListener('oTransitionEnd', this._cbGraphLeftAnimationEnd, false);

   
    this.actualGraphSurface.style.left = '-' + (this._CSSConstants["GraphBarWidth"] + 
                                            this._CSSConstants["GraphBarSpacing"]) + 'px';

    // Update the data sets to discard the oldest historical data
    for (var i = 0; i <= this._youngestBarDataId; i++)
    {
        this._GraphBarValues[i] = this._GraphBarValues[i + 1];
    }

    // Re-initialize the "hidden" slot for new data
    this._GraphBarValues[this._newBarDataId] = 0;
}


IdmCtrl.prototype._resetBarGraphs = function(animateBars)
{

	log.info("_resetBarGraphs called animateBars "+animateBars);
    this.actualGraphSurface.style.OTransition = 'none';

    this._setGraphBarHeightTransitions(animateBars);

    this.GraphCurrentBar.className = 'IdmCtrlBarGraphCurrentCore';

    this.actualGraphSurface.style.left = '0px';
    this._setGraphBarHeights();

    this._setGraphBarHeightTransitions(!animateBars);
};

IdmCtrl.prototype._setGraphBarHeight = function(barIdx)
{
    var bar = document.getElementById('curBar' + (barIdx + 1));
    if (bar)
    {
        bar.style.height = this._scaleDataToGraphY(this._CSSConstants["GraphVisibleHeight"],
        										   this._GraphBarValues[barIdx],
                                                   this.properties.scoreGraphObj.yAxisLimitValue,
                                                   false) + 'px';
    }
};

IdmCtrl.prototype._setGraphBarHeights = function()
{
	    // Cache reused values
	    var graphHeight = this._CSSConstants["GraphVisibleHeight"];
	    var yLimit =  this.properties.scoreGraphObj.yAxisLimitValue;

	    for (var i = 0; i < this._totalBars; i++)
	    {
	        var bar = document.getElementById('curBar' + (i + 1));
	        if (bar)
	        {
	            bar.style.height = this._scaleDataToGraphY(graphHeight,
	                                                       this._GraphBarValues[i],
	                                                       yLimit,
	                                                       false) + 'px';
	        }
	    }
};

IdmCtrl.prototype._setGraphBarHeightTransitions = function(isEnabled)
{
    var transitionStr;

    if (!isEnabled)
    {
        transitionStr = 'height 0.6s ease 0s';
    }
    else
    {
        transitionStr = 'none';
    }

    for (var i = 0; i <= this._youngestBarDataId; i++)
    {
        var bar = document.getElementById('curBar' + (i + 1));
        if (bar)
        {
            bar.style.OTransition = transitionStr;
        }
    }
}

IdmCtrl.prototype._scaleDataToGraphY = function(maxY, dataValue, maxDataValue, invertY)
{
    var yVal = Math.floor(dataValue / maxDataValue * maxY);

    if (invertY)
    {
        yVal = maxY - yVal;
    }
    
    return yVal;
};

IdmCtrl.prototype._setGraphBarPositions = function()
{
      var leftInc = this._CSSConstants["GraphBarWidth"]
                  + this._CSSConstants["GraphBarSpacing"];
      var currentLeft = this._CSSConstants["GraphBarMargin"];
    
    for (var i = 1; i <= this._totalBars; i++)
    {
        var bar = document.getElementById('curBar' + i);
        if (bar)
        {
           bar.style.marginLeft = currentLeft + 'px';
        }
        
        currentLeft += leftInc;
    }
};

IdmCtrl.prototype._addXAxisLabel = function(style)
{
      var leftLabel = document.createElement('div');
      leftLabel.className = 'IdmCtrlLeftXLabel';
      leftLabel.innerHTML = this._stringToHTML('10');
      var middleLabel = document.createElement('div');
      middleLabel.className = 'IdmCtrlMiddleXLabel';
      middleLabel.innerHTML = this._stringToHTML('5');
      var rightLabel = document.createElement('div');
      rightLabel.className = 'IdmCtrlRightXLabel';
      rightLabel.innerHTML = this._stringToHTML('0 '+this._translateToStr('min'));
      if(style === 'simple')
      {
            leftLabel.className = 'IdmCtrlLeftXLabel IdmCtrlLeftXLabelSimple';
            middleLabel.className = 'IdmCtrlMiddleXLabel IdmCtrlMiddleXLabelSimple';
            rightLabel.className = 'IdmCtrlRightXLabel IdmCtrlRightXLabelSimple';
      }
      this.controlDiv.appendChild(leftLabel);
      this.controlDiv.appendChild(middleLabel);
      this.controlDiv.appendChild(rightLabel);
};

//Add label to top of the last bar
IdmCtrl.prototype._addLastbarLabel = function(style)
{
	log.info("_addLastbarLabel Called");
	  this.lastBarLabelTextWrapper = document.createElement('div');
      this.lastBarLabelText = document.createElement('div');
      this.lastBarLabelText.className = 'IdmCtrlLastBarValueText';
      this.lastBarLabelText.innerHTML = '--';
      
      this.lastBarLabelTextWrapper.className = 'IdmCtrlLastBarValueWrapper';
     
      this.lastBarLabelTextWrapper.appendChild(this.lastBarLabelText);
      this.controlDiv.appendChild(this.lastBarLabelTextWrapper);
};

/*
 * Utility function to look up a translatable string ID and/or accept a default text string.
 */
IdmCtrl.prototype._translateString = function(strId, strText, subMap)
{
//    log.info("_translateString called: strId = " + strId + ", strText = " + strText);

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
IdmCtrl.prototype._stringToHTML = function(textStr)
{
//    log.info("_stringToHTML called: textStr = " + textStr);

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
IdmCtrl.prototype._formatDurationString = function(durationMs)
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
            durationStr += hours + "h ";
        }
        if ((durationStr !== "") ||
            (minutes > 0))
        {
            durationStr += minutes + "m ";
        }
        if ((durationStr !== "") || 
            (seconds > 0))
        {
            durationStr += seconds + "s";
        }
    }
    else
    {
        log.warn("passed-in duration is not a Date object!");
        durationStr = "--";
    } 

    log.info("_formatDurationString returning \"" + durationStr + "\"");
    
    return durationStr;
};
/**
 * Canvas drawing Methods for Trend Animated Elements 
 */

/*
 *  Load and populate all the style and coordinate informations needed for drawing
 */
IdmCtrl.prototype._loadStyleAndCordinateInfo = function()
{	
      //TODO:1
      this.coOrdinate = {
                  brake : {
                        prevpos_cnt : -1,
                        prevneg_cnt : -1
                  },
                  steer : {
                        prevpos_cnt : -1,
                        prevneg_cnt : -1
                  },
                  accelerate : {
                        prevpos_cnt : -1,
                        prevneg_cnt : -1
                  }
            };
};      

 /**
 * Canvas Drawing Methods End
 */
/******************/

/*
 *  Publicly exposed methods for the TrendAnimation Elements 
 *  Use strictly these methods only to control the current drive trend elements such as 
 *  brake, acceleration and steering.
 */


IdmCtrl.prototype.showStars = function ()
{
	log.info("IdmCtrl :: showStars");
	if (this.stChanged == false)
	{
		for(var i=1; i<= this.noStars;i++)
	 	{
	 		log.info("In second for");
	 		document.getElementById("img"+i).src="apps/idm/controls/Idm/images/iDM_star_gold.png";
	 	}
	}
};

IdmCtrl.prototype.grayOutStars = function ()
{
	log.info("IdmCtrl :: grayOutStars");
    for(var i=1;i<=5;i++)
	{
    	document.getElementById("img"+i).src="apps/idm/controls/Idm/images/iDM_star_black.png";
	}
};

/*setting the current score*/
IdmCtrl.prototype.setHighScore = function(score)
{
	log.info("IdmCtrl :: setHighScore " + score);
	this.grayOutStars();
	for(var i=1; i<= score;i++)
	{
		document.getElementById("img"+i).src="apps/idm/controls/Idm/images/iDM_star_gold.png";
	}
};

/*setting the star values*/
IdmCtrl.prototype.setStarValues = function(starObj)
{	
	log.info("IdmCtrl :: Received Star values in control"+starObj.stars);
	this.noStars = starObj.stars ;
	
	if(this.averageScore < 4.8 && this.currentScore >= 1.0 && this.properties.mode === "ending")
	{
		this.grayOutStars();
	}
	else if (this.properties.mode === "ending")
	{
		this.grayOutStars();
		this.showStars();
	}
};

IdmCtrl.prototype.setAdvice = function()
{
	if(this.currentScore == 5.0)
	{
		log.info ("IdmCtrl :: current score is greater than 5");
		this.adviceText.innerHTML = this._translateToStr("Excellent");
		this.adviceDivComment1.innerHTML = this._translateToStr("DroveAsExpected");
	}
	else if(this.currentScore >= 4.0 && this.currentScore <= 4.9)
	{
		log.info ("IdmCtrl :: current score is greater than equal 4.0 and less than equal 4.9");
		this.adviceText.innerHTML = this._translateToStr("VeryGood");
		this.adviceDivComment1.innerHTML = this._translateToStr("HaveAFeel");
	}
	else if(this.currentScore >= 2.0 && this.currentScore <= 3.9 && (this.currentScore >= this.averageScore))
	{
		log.info ("IdmCtrl :: current score is greater than equal 2.0 and less than equal 3.9 and this.currentScore >= this.averageScore");
		this.adviceText.innerHTML = this._translateToStr("Good");
		this.adviceDivComment1.innerHTML = this._translateToStr("HangOfIt");
	}
	else if(this.currentScore >= 2.0 && this.currentScore <= 3.9 && (this.currentScore < this.averageScore) && this.adviceNo != null )
	{
		this.adviceText.innerHTML = this._translateToStr("Good");
		log.info ("IdmCtrl :: this.adviceNo " + this.adviceNo);
		switch(this.adviceNo)
		{
			case 'ADVICE_1' :
				     this.adviceDivComment1.innerHTML = this._translateToStr("NoFrequentAccel");
					 break;
			case 'ADVICE_2' : 
				     this.adviceDivComment1.innerHTML = this._translateToStr("NoFrequentBrake");
			         break;
			case 'ADVICE_3' : 
				     this.adviceDivComment1.innerHTML = this._translateToStr("NoFrequentSteer");
			 		 break;
			case 'ADVICE_4' : 
				     this.adviceDivComment1.innerHTML = this._translateToStr("AccelSmoothly");
	 		 		 break;			
	 		case 'ADVICE_5' :
	 			     this.adviceDivComment1.innerHTML = this._translateToStr("DecelSmoothly");
			 		 break;
	 		case 'ADVICE_6' : 
	 			     this.adviceDivComment1.innerHTML = this._translateToStr("GentleSteering");
	 		 		 break;
	 		case 'ADVICE_7' : 
	 			     this.adviceDivComment1.innerHTML = this._translateToStr("OperateClutch");
			 		 break;
	 		default: break;
		}
	}
	else if(this.currentScore >= 1.0 && this.currentScore <= 1.9 && this.adviceNo != null)
	{
		this.adviceText.innerHTML = this._translateToStr("GoodWork");
		log.info ("IdmCtrl ::  this.adviceNo " + this.adviceNo);
		switch(this.adviceNo)
		{
			case 'ADVICE_1' : this.adviceDivComment1.innerHTML = this._translateToStr("NoFrequentAccel");
					 break;
			case 'ADVICE_2' : this.adviceDivComment1.innerHTML = this._translateToStr("NoFrequentBrake");
			         break;
			case 'ADVICE_3' : this.adviceDivComment1.innerHTML = this._translateToStr("NoFrequentSteer");
			 		 break;
			case 'ADVICE_4' : this.adviceDivComment1.innerHTML = this._translateToStr("AccelSmoothly");
	 		 		 break;			
	 		case 'ADVICE_5' : this.adviceDivComment1.innerHTML = this._translateToStr("DecelSmoothly");
			 		 break;
	 		case 'ADVICE_6' : this.adviceDivComment1.innerHTML = this._translateToStr("GentleSteering");
	 		 		 break;
	 		case 'ADVICE_7' : this.adviceDivComment1.innerHTML = this._translateToStr("OperateClutch");
			 		 break;
	 		default: break;
		}
	}
	else if(this.currentScore >= 0 && this.currentScore <= 0.9)
	{
		this.adviceText.innerHTML = this._translateToStr("GoodJob");
		this.adviceDivComment1.innerHTML = this._translateToStr("NotEnoughData");
	}
};

/*Setting the advice Text*/
IdmCtrl.prototype.setAdviceText = function(adviceText)
{
	log.info("IdmCtrl :: setAdviceText called adviceText = : " + adviceText);
	this.adviceNo = adviceText;
	this.setAdvice();
};

/*setting the current score*/
IdmCtrl.prototype.setCurrScore = function(score)
{	
	log.info("IdmCtrl: setCurrScore called score = : " + score);
	this.currentScore = score ;
	if(this.currentScore < 1.0)
	{
		this.currentScoreValue.innerHTML = '--';
	}
	else
	{
		this.currentScoreValue.innerHTML = this.currentScore; 
	}
	
	if(this.averageScore >= 4.8 && this.currentScore >= 1.0 && this.properties.mode === "ending")
	{	
		this.showAvgStar();
	}
	else if(this.properties.mode === "ending")
	{
		this.hideAvgStar();
	}
	
	if(this.averageScore < 4.8 && this.currentScore >= 1.0 && this.properties.mode === "ending")
	{
		this.grayOutStars();
	}
	else if (this.properties.mode === "ending")
	{
		this.showStars();
	}
	
	if(this.properties.mode === "ending")
	{
		this.setAdvice();
	}
};

//for setting the average score of driver
IdmCtrl.prototype.setAvgScore = function(score)
{	
	log.info("IdmCtrl :: setAvgScore called score = : " + score);
	this.averageScore = score ;
	
	if(this.averageScore < 1.0)
	{
		this.avgScoreValue.innerHTML = '--';
	}
	else
	{
		this.avgScoreValue.innerHTML = this.averageScore; 
	}
	
	if(this.averageScore >= 4.8 && this.currentScore >= 1 && this.properties.mode === "ending")
	{	
		this.showAvgStar();
	}
	else if ( this.properties.mode === "ending" )
	{
		this.hideAvgStar();
	}
	
	if(this.averageScore < 4.8 && this.currentScore >= 1.0 && this.properties.mode === "ending")
	{
		this.grayOutStars();
	}
	else if (this.properties.mode === "ending")
	{
		this.showStars();
	}
	
	if(this.properties.mode === "ending")
	{
		this.setAdvice();
	}
	
};

IdmCtrl.prototype.showAvgStar = function()
{
	log.info("IdmCtrl :: showAvgStar Called");
	this.avgScoreSimpleClassName = document.querySelector('.IdmCtrlAvgScoreStarSimple') ;
	this.avgScoreTrainingClassName = document.querySelector('.IdmCtrlAvgScoreStarTraining') ;
	
	if(this.properties.mode === "ending" && this.properties.ctrlStyle == "simple" )
	{
		this.avgScoreSimpleClassName.style.cssText = "display:inline";
	}
	else if(this.properties.mode === "ending" && this.properties.ctrlStyle == "training")
	{
		this.avgScoreTrainingClassName.style.cssText = "display:inline";
	}
};

IdmCtrl.prototype.hideAvgStar = function()
{
	log.info("IdmCtrl :: hideAvgStar Called");
	this.avgScoreSimpleClassName = document.querySelector('.IdmCtrlAvgScoreStarSimple') ;
	this.avgScoreTrainingClassName = document.querySelector('.IdmCtrlAvgScoreStarTraining') ;
	if(this.properties.mode === "ending" && this.properties.ctrlStyle == "simple" )
	{
		this.avgScoreSimpleClassName.style.cssText = "display:none";
	}
	else if(this.properties.mode === "ending" && this.properties.ctrlStyle == "training")
	{
		this.avgScoreTrainingClassName.style.cssText = "display:none";
	}
};

/*Setting Driver Name*/
IdmCtrl.prototype.setDriverNameId = function(data,drvNameExist){
	log.info("IdmCtrl :: setDriverNameId called data = : " + data);
    var driverName = data ;
    
    if(driverName == '')
	{
		this.driverName.innerHTML = '';
	}	
    else if(!drvNameExist)
    {
    	this.driverName.innerHTML =  this._translateToStr("driver")  + " " +  driverName;
    }
	else if(drvNameExist)
	{
		this.driverName.innerHTML = this._stringToHTML(driverName);
	}
	else
	{
		log.info("IdmCtrl :: setDriverNameId No condition matched");
	}
};

/*Setting Current Stage*/
IdmCtrl.prototype.stateChanged = function(){
	this.grayOutStars();
	this.stChanged = true;
};

/*Setting Current Stage*/
IdmCtrl.prototype.setCurrentStageNumber = function(data){
  
	log.info("IdmCtrl :: setCurrentStageNumber called data = : " + data);
	switch(data){
    case "ONE" :
        this.cachedStageValue = this._translateToStr("stage1") ;
        break;
    case "TWO" :
        this.cachedStageValue = this._translateToStr("stage2") ;
        break;
    case "THREE" :
        this.cachedStageValue = this._translateToStr("stage3") ;
         break;
    case "FOUR" :
        this.cachedStageValue = this._translateToStr("stage4") ;
        break;
    case "FIVE" :
        this.cachedStageValue = this._translateToStr("stage5") ;
        break;
    case "BLANK" :
        this.cachedStageValue = '--' ;
        break;
    default:
        this.cachedStageValue = this._translateToStr("stageinvalid") ;
        break;
 }
 this.stageTitle.innerHTML =  this.cachedStageValue;
};

IdmCtrl.prototype._createBrakeModule = function(){
   //'brake' is the CSS class name
   this._createModule('brake');
   
   className = "brake";
   this.counterWhitebrake = document.createElement('div');
   this.counterWhitebrake.className = 'counterWhite'+className;
   this.counterBluebrake = document.createElement('div');
   this.counterBluebrake.className = 'counterBlue'+className;
   
   this.counterWhitebrakeInner = document.createElement('div');
   this.counterWhitebrakeInner.className = 'counterWhitebrake0';
   this.counterBluebrakeInner = document.createElement('div');
   this.counterBluebrakeInner.className = 'counterBluebrake0';
   
   this.controlDiv.appendChild(this.counterWhitebrakeInner);
   this.controlDiv.appendChild(this.counterWhitebrake);
   this.controlDiv.appendChild(this.counterBluebrakeInner);
   this.controlDiv.appendChild(this.counterBluebrake);
};

IdmCtrl.prototype._createSteeringModule = function(){
   //'steer' is the CSS class name
   this._createModule('steer');
   
   className = "steer";
   this.counterWhitesteer = document.createElement('div');
   this.counterWhitesteer.className = 'counterWhite'+className;
   this.counterBluesteer = document.createElement('div');
   this.counterBluesteer.className = 'counterBlue'+className;
   
   this.counterWhitesteerInner = document.createElement('div');
   this.counterWhitesteerInner.className = 'counterWhitesteer';
   this.counterBluesteerInner = document.createElement('div');
   this.counterBluesteerInner.className = 'counterBluesteer';
   
   this.controlDiv.appendChild(this.counterWhitesteerInner);
   this.controlDiv.appendChild(this.counterWhitesteer);
   this.controlDiv.appendChild(this.counterBluesteerInner);
   this.controlDiv.appendChild(this.counterBluesteer);
   
   
};

IdmCtrl.prototype._createAccelerationModule = function(){
   //'accelerate' is the CSS class name
   this._createModule('accelerate');
   
   className = "acc";
   this.counterWhiteaccelerate = document.createElement('div');
   this.counterWhiteaccelerate.className = 'counterWhite'+className;
   this.counterBlueaccelerate = document.createElement('div');
   this.counterBlueaccelerate.className = 'counterBlue'+className;
   
   this.counterWhiteaccelerateInner = document.createElement('div');
   this.counterWhiteaccelerateInner.className = 'counterWhiteacc0';
   this.counterBlueaccelerateInner = document.createElement('div');
   this.counterBlueaccelerateInner.className = 'counterBlueacc0';
   
   this.controlDiv.appendChild(this.counterWhiteaccelerateInner);
   this.controlDiv.appendChild(this.counterWhiteaccelerate);
   this.controlDiv.appendChild(this.counterBlueaccelerateInner);
   this.controlDiv.appendChild(this.counterBlueaccelerate);  
};

// For Creating the Break,Acceleter,Strrring trend Section
IdmCtrl.prototype._createModule = function(className)
{	
	log.info("IdmCtrl :: _createModule called classanme = : " + className);
	this.brakeInnerDiv = document.createElement('div');
    this.brakeInnerDiv.className = 'IdmInnerDiv'+className+ ' IdmCtrlCenterDiv';
    this.controlDiv.appendChild(this.brakeInnerDiv);
    
	this.brakeOuterDiv = document.createElement('div');
    this.brakeOuterDiv.className = 'IdmOuterDiv'+className + ' IdmCtrlOuterDiv';
    this.controlDiv.appendChild(this.brakeOuterDiv);
};

/* Public Methods */
/******************/                                                 


/*
 * Forward all multi controller events to our only child control, the "SwitchView" button
 */
IdmCtrl.prototype.handleControllerEvent = function(eventId)
{
    log.info("IdmCtrl: handleControllerEvent() called: " + eventId);
    if(this._umpPanelStatus && this.umpCtrl)
    {
    	  log.info("IdmCtrl handleControllerEvent: umpctrl in focus");
          response = this.umpCtrl.handleControllerEvent(eventId);
          return response;
    }
    else if(!this._umpPanelStatus && this.switchViewButtonCtrl)
    {
    	 log.info("IdmCtrl handleControllerEvent: switchViewButtonCtrl in focus");
          response = this.switchViewButtonCtrl.handleControllerEvent(eventId);
          return response;
    }
};

IdmCtrl.prototype.getContextCapture = function()
{
    log.debug("IdmCtrl: getContextCapture() called...");
    var controlContextCapture = this.umpCtrl.getContextCapture();
    return controlContextCapture;
};


IdmCtrl.prototype.finishPartialActivity = function()
{
    log.debug("IdmCtrl: finishPartialActivity() called...");
    this.umpCtrl.finishPartialActivity();
};


/**
 * Context restore
 * TAG: framework, public
 * =========================
 * @return {object} - capture data
 */

IdmCtrl.prototype.restoreContext = function(controlContextCapture)
{
    log.debug("IdmCtrl: restoreContext() "+ controlContextCapture);
    this.umpCtrl.restoreContext(controlContextCapture);
};

IdmCtrl.prototype.cleanUp = function()
{
     if(this.umpCtrl)
     this.umpCtrl.cleanUp();
      
      if(this.switchViewButtonCtrl)
            this.switchViewButtonCtrl.cleanUp();
};
/*
 * toggle Ump panel | status == "hidePanel" OR status == "showPanel"
 */
IdmCtrl.prototype.toggleUmpPanel = function(status)
{
	  log.info("toggleUmpPanel called");
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

/*
 * Callback for "Switch View" button selections -- when called, trigger the
 * configured application callback.
 */
IdmCtrl.prototype._selectHandler = function(buttonObj, appData, params)
{
    log.info("_click handler for switch button");
    if (typeof(this.properties.selectCallback) === "function")
    {
        this.properties.selectCallback(this, appData, null);   
    }
    else
    {
        log.warn("IdmStatusCtrl: no valid selectCallback configured");
    }
};

//Update Brake trend
IdmCtrl.prototype.updateBrakeTrend = function(brakeObj)
{
	  log.info("IdmCtrl :: updateBrakeTrend Called");
	  clearInterval(this.handleBreakWhitePlus);
	  clearInterval(this.handleBreakWhiteMinus);
	  clearInterval(this.handleBreakBluePlus);
	  clearInterval(this.handleBreakBlueMinus);
	  
	  if(this.coOrdinate.brake.prevneg_cnt == -1 && this.coOrdinate.brake.prevpos_cnt == -1 && this.breakWhiteFinish == false && this.breakBlueFinish ==  false)
	  {
		  this.prevbreakneg = this.prevbreakpos = 0;
		  this.currbreakneg = this.coOrdinate.brake.prevneg_cnt  = brakeObj.neg_cnt ;
		  this.currbreakpos = this.coOrdinate.brake.prevpos_cnt  = brakeObj.pos_cnt ;
	  }
	  else if(this.breakWhiteFinish == false && this.breakBlueFinish ==  false)
	  {
		  this.currbreakpos = this.coOrdinate.brake.prevpos_cnt = brakeObj.pos_cnt ;
		  this.currbreakneg = this.coOrdinate.brake.prevneg_cnt = brakeObj.neg_cnt ;
	  }	 
	  else if(this.breakWhiteFinish ==  false)
	  {
		  this.prevbreakpos = this.coOrdinate.brake.prevpos_cnt  ; 
		  this.currbreakneg = this.coOrdinate.brake.prevneg_cnt = brakeObj.neg_cnt ;
		  this.currbreakpos = this.coOrdinate.brake.prevpos_cnt = brakeObj.pos_cnt ;
	  }	
	  else if(this.breakBlueFinish ==  false)
	  {
		  this.prevbreakneg = this.coOrdinate.brake.prevneg_cnt  ;
		  this.currbreakneg = this.coOrdinate.brake.prevneg_cnt = brakeObj.neg_cnt ;
		  this.currbreakpos = this.coOrdinate.brake.prevpos_cnt = brakeObj.pos_cnt ;
	  }	 
	  else if (this.breakWhiteFinish == true && this.breakBlueFinish ==  true)
	  {
		  this.prevbreakneg = this.coOrdinate.brake.prevneg_cnt  ;
		  this.prevbreakpos = this.coOrdinate.brake.prevpos_cnt  ; 
		  this.currbreakneg = this.coOrdinate.brake.prevneg_cnt = brakeObj.neg_cnt ;
		  this.currbreakpos = this.coOrdinate.brake.prevpos_cnt = brakeObj.pos_cnt ;
	  }
	  
	  if(this.currbreakpos > this.prevbreakpos)
	  {
		  this.handleBreakBluePlus = setInterval(this.breakUpdateBluePlus.bind(this),50);
	  }
	  else if(this.currbreakpos < this.prevbreakpos)
	  {
		  this.handleBreakBlueMinus = setInterval(this.breakUpdateBlueMinus.bind(this),50);
	  } 
	  
	  if(this.currbreakneg > this.prevbreakneg)
	  {
		  this.handleBreakWhitePlus = setInterval(this.breakUpdateWhitePlus.bind(this),50);
	  }
	  else if(this.currbreakneg < this.prevbreakneg)
	  {
		  this.handleBreakWhiteMinus = setInterval(this.breakUpdateWhiteMinus.bind(this),50);
	  } 
};

//Increase White Brake
IdmCtrl.prototype.breakUpdateWhitePlus = function()
{	
	log.info("IdmCtrl :: breakUpdateWhitePlus Called");
	if(this.prevbreakneg == this.currbreakneg)
	{
		clearInterval(this.handleBreakWhitePlus);
		this.breakWhiteFinish = true;
		return;
	}
	else
	{
		this.breakWhiteFinish = false;
	}
	this.counterWhitebrakeInner.className = "counterWhitebrake"+ (++this.prevbreakneg) ;
};

//Decrease White Brake
IdmCtrl.prototype.breakUpdateWhiteMinus = function()
{	
	log.info("IdmCtrl :: breakUpdateWhiteMinus Called");
	if(this.prevbreakneg == this.currbreakneg)
	{
		clearInterval(this.handleBreakWhiteMinus);
		this.breakWhiteFinish = true;
		return;
	}
	else
	{
		this.breakWhiteFinish = false;
	}
	this.counterWhitebrakeInner.className = "counterWhitebrake"+ (--this.prevbreakneg) ;
};

//Increase Blue Brake
IdmCtrl.prototype.breakUpdateBluePlus = function()
{	
	log.info("IdmCtrl :: breakUpdateBluePlus Called");
	if(this.prevbreakpos == this.currbreakpos)
	{
		clearInterval(this.handleBreakBluePlus);
		this.breakBlueFinish = true;
		return;
	}
	else
	{
		this.breakBlueFinish = false;
	}
	this.counterBluebrakeInner.className = "counterBluebrake"+ (++this.prevbreakpos) ;
};

//Decrease Blue Brake
IdmCtrl.prototype.breakUpdateBlueMinus = function()
{	
	log.info("IdmCtrl :: breakUpdateBlueMinus Called");
	if(this.prevbreakpos == this.currbreakpos)
	{
		clearInterval(this.handleBreakBlueMinus);
		this.breakBlueFinish = true;
		return;
	}
	else
	{
		this.breakBlueFinish = false;
	}
	this.counterBluebrakeInner.className = "counterBluebrake"+ (--this.prevbreakpos) ;
};


//Update Steering Trend
IdmCtrl.prototype.updateSteeringTrend = function(steerObj)
{
	  log.info("IdmCtrl :: updateSteeringTrend Called");
	  clearInterval(this.handlesteerWhitePlus);
	  clearInterval(this.handlesteerWhiteMinus);
	  clearInterval(this.handlesteerBluePlus);
	  clearInterval(this.handlesteerBlueMinus);
	  
	  if(this.coOrdinate.steer.prevneg_cnt == -1 && this.coOrdinate.steer.prevpos_cnt == -1 && this.steerWhiteFinish == false && this.steerBlueFinish ==  false)
	  {
		  this.prevsteerneg = this.prevsteerpos = 0;
		  this.currsteerneg = this.coOrdinate.steer.prevneg_cnt  = steerObj.neg_cnt ;
		  this.currsteerpos = this.coOrdinate.steer.prevpos_cnt  = steerObj.pos_cnt ;
	  }
	  else if(this.steerWhiteFinish == false && this.steerBlueFinish ==  false)
	  {
		  this.currsteerpos = this.coOrdinate.steer.prevpos_cnt = steerObj.pos_cnt ;
		  this.currsteerneg = this.coOrdinate.steer.prevneg_cnt = steerObj.neg_cnt ;
	  }	 
	  else if(this.steerWhiteFinish ==  false)
	  {
		  this.prevsteerpos = this.coOrdinate.steer.prevpos_cnt  ; 
		  this.currsteerneg = this.coOrdinate.steer.prevneg_cnt = steerObj.neg_cnt ;
		  this.currsteerpos = this.coOrdinate.steer.prevpos_cnt = steerObj.pos_cnt ;
	  }	
	  else if(this.steerBlueFinish ==  false)
	  {
		  this.prevsteerneg = this.coOrdinate.steer.prevneg_cnt  ;
		  this.currsteerneg = this.coOrdinate.steer.prevneg_cnt = steerObj.neg_cnt ;
		  this.currsteerpos = this.coOrdinate.steer.prevpos_cnt = steerObj.pos_cnt ;
	  }	 
	  else if (this.steerWhiteFinish == true && this.steerBlueFinish ==  true)
	  {
		  this.prevsteerneg = this.coOrdinate.steer.prevneg_cnt  ;
		  this.prevsteerpos = this.coOrdinate.steer.prevpos_cnt  ; 
		  this.currsteerneg = this.coOrdinate.steer.prevneg_cnt = steerObj.neg_cnt ;
		  this.currsteerpos = this.coOrdinate.steer.prevpos_cnt = steerObj.pos_cnt ;
	  }
	  
	 if(this.currsteerpos > this.prevsteerpos)
	  {
		  this.handlesteerBluePlus = setInterval(this.steerUpdateBluePlus.bind(this),50);
	  }
	  else if(this.currsteerpos < this.prevsteerpos)
	  {
		  this.handlesteerBlueMinus = setInterval(this.steerUpdateBlueMinus.bind(this),50);
	  } 
	  
	  if(this.currsteerneg > this.prevsteerneg)
	  {
		  this.handlesteerWhitePlus = setInterval(this.steerUpdateWhitePlus.bind(this),50);
	  }
	  else if(this.currsteerneg < this.prevsteerneg)
	  {
		  this.handlesteerWhiteMinus = setInterval(this.steerUpdateWhiteMinus.bind(this),50);
	  }
};

//Increase White Steering
IdmCtrl.prototype.steerUpdateWhitePlus = function()
{	
	log.info("IdmCtrl :: steerUpdateWhitePlus Called");
	if(this.prevsteerneg == this.currsteerneg)
	{
		clearInterval(this.handlesteerWhitePlus);
		this.steerWhiteFinish = true;
		return;
	}
	else
	{
		this.steerWhiteFinish = false;
	}
	this.counterWhitesteerInner.className = "counterWhitesteer"+ (++this.prevsteerneg) ;
};

//Decrease White Steering
IdmCtrl.prototype.steerUpdateWhiteMinus = function()
{	
	log.info("IdmCtrl :: steerUpdateWhiteMinus Called");
	if(this.prevsteerneg == this.currsteerneg)
	{
		clearInterval(this.handlesteerWhiteMinus);
		this.steerWhiteFinish = true;
		return;
	}
	else
	{
		this.steerWhiteFinish = false;
	}
	this.counterWhitesteerInner.className = "counterWhitesteer"+ (--this.prevsteerneg) ;
};

//Increase Blue Steering
IdmCtrl.prototype.steerUpdateBluePlus = function()
{	
	log.info("IdmCtrl :: steerUpdateBluePlus Called");
	if(this.prevsteerpos == this.currsteerpos)
	{
		clearInterval(this.handlesteerBluePlus);
		this.steerBlueFinish = true;
		return;
	}
	else
	{
		this.steerBlueFinish = false;
	}
	this.counterBluesteerInner.className = "counterBluesteer"+ (++this.prevsteerpos) ;
};

//Decrease White Steering
IdmCtrl.prototype.steerUpdateBlueMinus = function()
{	
	log.info("IdmCtrl :: steerUpdateBlueMinus Called");
	if(this.prevsteerpos == this.currsteerpos)
	{
		clearInterval(this.handlesteerBlueMinus);
		this.steerBlueFinish = true;
		return;
	}
	else
	{
		this.steerBlueFinish = false;
	}
	this.counterBluesteerInner.className = "counterBluesteer"+ (--this.prevsteerpos) ;
};

//Update Acceleration Trend
IdmCtrl.prototype.updateAccelerateTrend = function(accelerateObj)
{
   	  log.info("IdmCtrl :: updateAccelerateTrend Called");
	  clearInterval(this.handleAccelerateWhitePlus);
	  clearInterval(this.handleAccelerateWhiteMinus);
	  clearInterval(this.handleAccelerateBluePlus);
	  clearInterval(this.handleAccelerateBlueMinus);
	  
	  if(this.coOrdinate.accelerate.prevneg_cnt == -1 && this.coOrdinate.accelerate.prevpos_cnt == -1 && this.accelerateWhiteFinish == false && this.accelerateBlueFinish ==  false)
	  {
		  this.prevaccelerateneg = this.prevacceleratepos = 0;
		  this.curraccelerateneg = this.coOrdinate.accelerate.prevneg_cnt  = accelerateObj.neg_cnt ;
		  this.curracceleratepos = this.coOrdinate.accelerate.prevpos_cnt  = accelerateObj.pos_cnt ;
	  }
	  else if(this.accelerateWhiteFinish == false && this.accelerateBlueFinish ==  false)
	  {
		  this.curracceleratepos = this.coOrdinate.accelerate.prevpos_cnt = accelerateObj.pos_cnt ;
		  this.curraccelerateneg = this.coOrdinate.accelerate.prevneg_cnt = accelerateObj.neg_cnt ;
	  }	 
	  else if(this.accelerateWhiteFinish ==  false)
	  {
		  this.prevacceleratepos = this.coOrdinate.accelerate.prevpos_cnt  ; 
		  this.curraccelerateneg = this.coOrdinate.accelerate.prevneg_cnt = accelerateObj.neg_cnt ;
		  this.curracceleratepos = this.coOrdinate.accelerate.prevpos_cnt = accelerateObj.pos_cnt ;
	  }	
	  else if(this.accelerateBlueFinish ==  false)
	  {
		  this.prevaccelerateneg = this.coOrdinate.accelerate.prevneg_cnt  ;
		  this.curraccelerateneg = this.coOrdinate.accelerate.prevneg_cnt = accelerateObj.neg_cnt ;
		  this.curracceleratepos = this.coOrdinate.accelerate.prevpos_cnt = accelerateObj.pos_cnt ;
	  }	 
	  else if (this.accelerateWhiteFinish == true && this.accelerateBlueFinish ==  true)
	  {
		  this.prevaccelerateneg = this.coOrdinate.accelerate.prevneg_cnt  ;
		  this.prevacceleratepos = this.coOrdinate.accelerate.prevpos_cnt  ; 
		  this.curraccelerateneg = this.coOrdinate.accelerate.prevneg_cnt = accelerateObj.neg_cnt ;
		  this.curracceleratepos = this.coOrdinate.accelerate.prevpos_cnt = accelerateObj.pos_cnt ;
	  }
	  
	  if(this.curraccelerateneg > this.prevaccelerateneg)
	  {
		  this.handleAccelerateWhitePlus = setInterval(this.accelerateUpdateWhitePlus.bind(this),50);
	  }
	  else if(this.curraccelerateneg < this.prevaccelerateneg)
	  {
		  this.handleAccelerateWhiteMinus = setInterval(this.accelerateUpdateWhiteMinus.bind(this),50);
	  } 
	  
	  if(this.curracceleratepos > this.prevacceleratepos)
	  {
		  this.handleAccelerateBluePlus = setInterval(this.accelerateUpdateBluePlus.bind(this),50);
	  }
	  else if(this.curracceleratepos < this.prevacceleratepos)
	  {
		  this.handleAccelerateBlueMinus = setInterval(this.accelerateUpdateBlueMinus.bind(this),50);
	  }
};

//Increase White Acceleration
IdmCtrl.prototype.accelerateUpdateWhitePlus = function()
{	
	log.info("IdmCtrl :: accelerateUpdateWhitePlus Called");
	if(this.prevaccelerateneg == this.curraccelerateneg)
	{
		clearInterval(this.handleAccelerateWhitePlus);
		this.accelerateWhiteFinish = true;
		return;
	}
	else
	{
		this.accelerateWhiteFinish = false;
	}
	this.counterWhiteaccelerateInner.className = "counterWhiteacc"+ (++this.prevaccelerateneg) ;
};

//Decrease White Acceleration
IdmCtrl.prototype.accelerateUpdateWhiteMinus = function()
{	
	log.info("IdmCtrl :: accelerateUpdateWhiteMinus Called");
	if(this.prevaccelerateneg == this.curraccelerateneg)
	{
		clearInterval(this.handleAccelerateWhiteMinus);
		this.accelerateWhiteFinish = true;
		return;
	}
	else
	{
		this.accelerateWhiteFinish = false;
	}
	this.counterWhiteaccelerateInner.className = "counterWhiteacc"+ (--this.prevaccelerateneg) ;
};

//Increase Blue Acceleration
IdmCtrl.prototype.accelerateUpdateBluePlus = function()
{	
	log.info("IdmCtrl :: accelerateUpdateBluePlus Called");
	if(this.prevacceleratepos == this.curracceleratepos)
	{
		clearInterval(this.handleAccelerateBluePlus);
		this.accelerateBlueFinish = true;
		return;
	}
	else
	{
		this.accelerateBlueFinish = false;
	}
	this.counterBlueaccelerateInner.className = "counterBlueacc"+ (++this.prevacceleratepos) ;
};

//Decrease Blue Acceleration
IdmCtrl.prototype.accelerateUpdateBlueMinus = function()
{	
	log.info("IdmCtrl :: accelerateUpdateBlueMinus Called");
	if(this.prevacceleratepos == this.curracceleratepos)
	{
		clearInterval(this.handleAccelerateBlueMinus);
		this.accelerateBlueFinish = true;
		return;
	}
	else
	{
		this.accelerateBlueFinish = false;
	}
	this.counterBlueaccelerateInner.className = "counterBlueacc"+ (--this.prevacceleratepos) ;
};

framework.registerCtrlLoaded("IdmCtrl");