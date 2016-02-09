/*
 Copyright 2014 by Johnson Controls
 ________________________________________________________________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: apetrops
 Date: 21-July-2014
 _________________________________________________________________________________________________________________________________

 Description: IHU GUI NowPlayingInfo Control
 Revisions:
 v0.1 Create basic control for showing the now playing information
 v0.2 SW00156529 fixed- Added changes for SW00156529 GUI_EMNAVI: MICWARE Split Screen AHA feature implementation
 _________________________________________________________________________________________________________________________________

 */

log.addSrcFile("NowPlayingInfoCtrl.js", "common");

/*
 * =========================
 * Constructor
 * =========================
 * Creates an area on the screen, that displays the currently selected music source, and the information about it.
 */

function NowPlayingInfoCtrl(uiaId, parentDiv, ctrlId, properties) 
{
    this.id = ctrlId;
    this.divElt = null;
    this.uiaId = null;
    this.parentDiv = null;
    /* This flag is maintained because in case of AHA nd Sticher we need to display Song,Artist,Album name but not the image.
       So AS per to current implementation for SetSongName,setArtistName etc we add an check for showIcon.
       ShowIcon is kept false for AHA, Stitcher and hence Icon for them not displayed.*/
    this._showIcon = true;
    
    this.properties = {
        "visible" : null,
        "mediaSource" : null,
        "selectCallback" : null,
        "appData" : null,
    };

    for (var i in properties) {
        if(this.properties.hasOwnProperty(i)) 
        {
            this.properties[i] = properties[i];
        }
    }

    this.id = ctrlId;
    this.parentDiv = parentDiv;
    this.uiaId = uiaId;
    
    this.init();

    //set the initial visibility
    this.divElt.style.visibility = this.properties.visible ? "visible" : "hidden";
    this._setPlayingSourceText(this.properties.mediaSource);
    this._hideRedundantDivs();

}

NowPlayingInfoCtrl.prototype.init = function() 
{
    this.divElt = document.createElement("div");
    this.divElt.className = "infoContainer";
    this.divElt.addEventListener('click', this._fireSelectCallback.bind(this)); 
    this._createStructure(this.divElt);
    this.parentDiv.appendChild(this.divElt);
};

/**
 * Creates the relevant <div> elements, used for displaying the relevant information.
 * @returns {void}
 */
NowPlayingInfoCtrl.prototype._createStructure  = function(container) 
{

    this.titleField = document.createElement("div");
    this.titleField.className = "nowPlayingInfoTitle";

    this.titleImage = document.createElement("div");
    this.titleImage.className = "nowPlayingInfoTitleImage";
    this.titleField.appendChild(this.titleImage);

    this.titleFieldText = document.createElement("div");
    this.titleFieldText.className = "titleFieldText";
    this.titleFieldText.appendChild(document.createTextNode(""));
    this.titleField.appendChild(this.titleFieldText);

    container.appendChild(this.titleField);

    this.textGeneric = document.createElement("div");
    this.textGeneric.className = "textGeneric";
    this.textGeneric.appendChild(document.createTextNode(""));
    container.appendChild(this.textGeneric);

    this.imageTitle = document.createElement("div");
    this.imageTitle.className = "imageTitle";
    container.appendChild(this.imageTitle);

    this.imageArtist = document.createElement("div");
    this.imageArtist.className = "imageArtist";
    container.appendChild(this.imageArtist);

    this.imageAlbum = document.createElement("div");
    this.imageAlbum.className = "imageAlbum";
    container.appendChild(this.imageAlbum);

    this.textTitle = document.createElement("div");
    this.textTitle.className = "textTitle";
    this.textTitle.appendChild(document.createTextNode(""));
    container.appendChild(this.textTitle);

    this.textArtist = document.createElement("div");
    this.textArtist.className = "textArtist";
    this.textArtist.appendChild(document.createTextNode(""));
    container.appendChild(this.textArtist);

    this.textAlbum = document.createElement("div");
    this.textAlbum.className = "textAlbum";
    this.textAlbum.appendChild(document.createTextNode(""));
    container.appendChild(this.textAlbum);

};

/**
 * Sets the control title
 * @params:  {string}
 * @returns: {void}
 */
NowPlayingInfoCtrl.prototype._setPlayingSourceText = function(name) {
    if(name === "AMRADIO")
    {
        name = "AM";
    }
    else if(name === "FMRADIO")
    {
        name = "FM";
    }
    else if(name === "AHA")
    {
        name = "aha";
    }
	else if(name === "STITCHER") // ADDED 
	{
		name = "Stitcher";
	}
    this.titleFieldText.innerHTML = name;
};

/**
 * Executes the function passed as the selectCallback property to the constructor properties
 * @returns: {void}
 */
NowPlayingInfoCtrl.prototype._fireSelectCallback = function() 
{
    if('function' === typeof(this.properties.selectCallback))
    {
        this.properties.selectCallback();
    }
};

/**
 * The control creates some <div> elements, used to display the metadata information.
 * The number of div elements differs for every metadata source, so this function 
 * takes care of hiding/showing the relevant <div> elements
 * @returns: {void}
 */
NowPlayingInfoCtrl.prototype._hideRedundantDivs = function() {
    log.info("ENTER _hideRedundantDivs this.properties.visible:"+ this.properties.visible +", mediasource :" + this.properties.mediaSource);
	//Show Full Screen
    if(this.properties.visible === false) 
    {
        this.divElt.style.visibility = "hidden";
        this.textGeneric.style.visibility = "hidden";
        this.imageTitle.style.visibility = "hidden";
        this.imageAlbum.style.visibility = "hidden";
        this.imageArtist.style.visibility = "hidden";
        this.textArtist.style.visibility = "hidden";
        this.textAlbum.style.visibility = "hidden";
        this.textTitle.style.visibility = "hidden";
        this.titleImage.style.visibility = "hidden";
        this.titleFieldText.style.visibility = "hidden";
        this._showIcon = false;
        return;
    }
    //Show Split Screen
    else if(this.properties.visible === true)
    {
        switch(this.properties.mediaSource) 
        {
            case "AMRADIO": 
            /* INTENTIONAL FALLTHROUGH */
            case "FMRADIO": {
                log.info("Hiding redundant fields for source: " + this.properties.mediaSource);

                this.divElt.style.visibility = "visible";
                this.divElt.style.background = "rgba(0,0,0,1)";
                this.textGeneric.style.visibility = "visible";
                this.imageTitle.style.visibility = "hidden";
                this.imageAlbum.style.visibility = "hidden";
                this.imageArtist.style.visibility = "hidden";
                this.textArtist.style.visibility = "hidden";
                this.textAlbum.style.visibility = "hidden";
                this.textTitle.style.visibility = "hidden";
                this.titleImage.style.visibility = "visible";
                this.titleFieldText.style.visibility = "visible";
                this._showIcon = false;
            }
            break;
            case "CD":
            /* INTENTIONAL FALLTHROUGH */
            case "USBAUDIO": {
                log.info("Nothing has to be hidden when the source is " + this.properties.mediaSource);

                this.divElt.style.visibility = "visible";
                this.divElt.style.background = "rgba(0,0,0,1)";
                this.textGeneric.style.visibility = "visible";
                this.imageTitle.style.visibility = "hidden";
                this.imageAlbum.style.visibility = "hidden";
                this.imageArtist.style.visibility = "hidden";
                this.textArtist.style.visibility = "visible";
                this.textAlbum.style.visibility = "visible";
                this.textTitle.style.visibility = "visible";
                this.titleImage.style.visibility = "visible";
                this.titleFieldText.style.visibility = "visible";
                this._showIcon = true;
            }
            break;
            
            case "BTAUDIO": {
                log.info("Hiding reduntant fields for source :  " + this.properties.mediaSource);

                this.divElt.style.visibility = "visible";
                this.divElt.style.background = "rgba(0,0,0,1)";
                this.textGeneric.style.visibility = "hidden";
                this.imageTitle.style.visibility = "hidden";
                this.imageAlbum.style.visibility = "hidden";
                this.imageArtist.style.visibility = "hidden";
                this.textArtist.style.visibility = "visible";
                this.textAlbum.style.visibility = "visible";
                this.textTitle.style.visibility = "visible";
                this.titleImage.style.visibility = "visible";
                this.titleFieldText.style.visibility = "visible";
                this._showIcon = true;
            }
            break;
            
            case "AUX": {
                log.info("Hiding reduntant fields for source :  " + this.properties.mediaSource);

                this.divElt.style.visibility = "visible";
                this.divElt.style.background = "rgba(0,0,0,1)";
                this.textGeneric.style.visibility = "hidden";
                this.imageTitle.style.visibility = "hidden";
                this.imageAlbum.style.visibility = "hidden";
                this.imageArtist.style.visibility = "hidden";
                this.textArtist.style.visibility = "hidden";
                this.textAlbum.style.visibility = "hidden";
                this.textTitle.style.visibility = "hidden";
                this.titleImage.style.visibility = "visible";
                this.titleFieldText.style.visibility = "visible";
                this._showIcon = false;
            }
            break;
            
            case "TV" : 
            /* INTENTIONAL FALLTHROUGH */
            case "DVD": {
                log.info("Split Screen is hidden because source is: " + this.properties.mediaSource);

                this.divElt.style.visibility = "visible";
                this.divElt.style.background = "rgba(0,0,0,1)"; //changed to 1
                this.textGeneric.style.visibility = "visible";
                this.imageTitle.style.visibility = "hidden";
                this.imageAlbum.style.visibility = "hidden";
                this.imageArtist.style.visibility = "hidden";
                this.textArtist.style.visibility = "visible";
                this.textAlbum.style.visibility = "visible";
                this.textTitle.style.visibility = "visible";
                this.titleImage.style.visibility = "visible";
                this.titleFieldText.style.visibility = "visible";
                this._showIcon = false;
            }
            break;
            case "STITCHER": 
            case "AHA": {
                log.info("Hiding reduntant fields for source : " + this.properties.mediaSource);

                this.divElt.style.visibility = "visible";
                this.divElt.style.background = "rgba(0,0,0,1)"; 
                this.textGeneric.style.visibility = "visible";
                this.imageTitle.style.visibility = "hidden";
                this.imageAlbum.style.visibility = "hidden";
                this.imageArtist.style.visibility = "hidden";
                this.textArtist.style.visibility = "visible";
                this.textAlbum.style.visibility = "visible";
                this.textTitle.style.visibility = "visible";
                this.titleImage.style.visibility = "visible";
                this.titleFieldText.style.visibility = "visible";
                this._showIcon = false;
            }
            break;
            default: {
                this.textGeneric.style.visibility = "hidden";
                this.divElt.style.visibility = "hidden";
                this.divElt.style.background = "rgba(0,0,0,1)";
                this.imageTitle.style.visibility = "hidden";
                this.imageAlbum.style.visibility = "hidden";
                this.imageArtist.style.visibility = "hidden";
                this.textArtist.style.visibility = "hidden";
                this.textAlbum.style.visibility = "hidden";
                this.textTitle.style.visibility = "hidden";
                this.titleImage.style.visibility = "hidden";
                this.titleFieldText.style.visibility = "hidden";
                this._showIcon = false;
            }
            break;
        }
    }

};

/* PUBLIC APIS */

/**
 * Sets the value of the song name
 * @param: {string}
 * @returns: {void}
 */
NowPlayingInfoCtrl.prototype.setSongName = function(name) 
{
   /* if(name.length > 14) 
    {
        name = name.slice(0,11);
        name += "...";
    } */
	if(this.properties.mediaSource === "DVD" || this.properties.mediaSource === "TV")
    {	
		this.textTitle.style.fontSize = "28px";
	}
	else
	{
		this.textTitle.style.fontSize = "35px";
	}

    this.textTitle.innerHTML = name;
    if(name === "" || !this.properties.visible)
    {
    
        this.imageTitle.style.visibility = "hidden";
    }
    else 
    {
        if(this._showIcon === true)
        {
         this.imageTitle.style.visibility = "visible";
        }
        else
        {
         this.imageTitle.style.visibility = "hidden";
        }
    }
};

/**
 * Sets the value of the artist name
 * @param: {string}
 * @returns: {void}
 */
NowPlayingInfoCtrl.prototype.setArtistName = function(name) 
{
    /*if(name.length > 14) 
    {
        name = name.slice(0,11);
        name += "...";
    } */
	if((this.properties.mediaSource === "DVD" || this.properties.mediaSource === "TV"))
    {	
	this.textArtist.style.fontSize = "28px";
	}
    this.textArtist.innerHTML = name;
    if(name === "" || !this.properties.visible)
    {
        this.imageArtist.style.visibility = "hidden";
    }
    else 
    {
        if(this._showIcon === true)
        {
        this.imageArtist.style.visibility = "visible";
        }
        else
        {
        this.imageArtist.style.visibility = "hidden";
        }
    }
};

/**
 * Sets the value of the album name
 * @param: {string}
 * @returns: {void}
 */
NowPlayingInfoCtrl.prototype.setAlbumName = function(name) 
{
    /*if(name.length > 14) 
    {
        name = name.slice(0,11);
        name += "...";
    }*/
	if((this.properties.mediaSource === "DVD" || this.properties.mediaSource === "TV"))
    {	
	this.textAlbum.style.fontSize = "28px";
	}
    this.textAlbum.innerHTML = name;
    if(name === "" || !this.properties.visible)
    {
        this.imageAlbum.style.visibility = "hidden";
    }
    else 
    {
        if(this._showIcon === true)
        {
         this.imageAlbum.style.visibility = "visible";
        }
        else
        {
         this.imageAlbum.style.visibility = "hidden";
        }
    }
};

/**
 * Sets the title for the now playing source
 * @param: {string}
 * @returns: {void}
 */
NowPlayingInfoCtrl.prototype.setSourceTitle = function(name) 
{
    this._setPlayingSourceText(name);
};

/**
 * Sets the value of the genere/track/station text
 * @param: {string}
 * @returns: {void}
 */
NowPlayingInfoCtrl.prototype.setGenericText = function(name) 
{
    /*if(name.length > 14) 
    {
        name = name.slice(0,11);
        name += "...";
    }*/
	//this.textGeneric.font-size = 30px;
	if(this.properties.mediaSource === "DVD" || this.properties.mediaSource === "TV")
    {	
		this.textGeneric.style.fontSize = "28px";
	}
	else
	{
		this.textGeneric.style.fontSize = "35px";
	}
    this.textGeneric.innerHTML = name;
};

/**
 * Sets the currently Now Playing Source
 * @param: {string}
 * @returns: {void}
 */
NowPlayingInfoCtrl.prototype.setEntertainmentSource = function(name) 
{
    this.properties.mediaSource = name;
    this._hideRedundantDivs();
};

/**
 * Toggles TV/DVD atSpeed behaivior, setting the split screen surface as transparent,
 * when we're not at speed, or displaying a caution when we're at speed.
 * @param: {boolean}
 * @returns: {void}
 */
NowPlayingInfoCtrl.prototype.dvdTvSetAtSpeed = function(atSpeed) 
{
    log.info("set DVD/TV At Speed to : " + atSpeed);
    if(atSpeed === null || atSpeed === undefined)
    {
        log.info("atSpeed is null or undefined");
        return;
    }
    if(!atSpeed && (this.properties.mediaSource === "DVD" || this.properties.mediaSource === "TV")) 
    {
        log.info("atSpeed receieved, but media source != DVD/TV, ignoring");
        return;
    }
    
    if(!atSpeed && this.properties.visible)
    {
        this.divElt.style.visibility = "visible";
        this.divElt.style.background = "rgba(0,0,0,0.01)";
        this.textGeneric.style.visibility = "hidden";
        this.imageTitle.style.visibility = "hidden";
        this.imageAlbum.style.visibility = "hidden";
        this.imageArtist.style.visibility = "hidden";
        this.textArtist.style.visibility = "hidden";
        this.textAlbum.style.visibility = "hidden";
        this.textTitle.style.visibility = "hidden";
        this.titleImage.style.visibility = "hidden";
        this.titleFieldText.style.visibility = "hidden";
    }
    else if (atSpeed && this.properties.visible)
    {
        this.divElt.style.visibility = "visible";
        this.divElt.style.background = "rgba(0,0,0,1)";
        this.textGeneric.style.visibility = "visible";
        this.imageTitle.style.visibility = "hidden";
        this.imageAlbum.style.visibility = "hidden";
        this.imageArtist.style.visibility = "hidden";
        this.textArtist.style.visibility = "hidden";
        this.textAlbum.style.visibility = "hidden";
        this.textTitle.style.visibility = "hidden";
        this.titleImage.style.visibility = "visible";
        this.titleFieldText.style.visibility = "visible";

    }
    else if(!atSpeed && !this.properties.visible)
    {
        this.divElt.style.visibility = "hidden";
        this.divElt.style.background = "rgba(0,0,0,1)";
        this.textGeneric.style.visibility = "hidden";
        this.imageTitle.style.visibility = "hidden";
        this.imageAlbum.style.visibility = "hidden";
        this.imageArtist.style.visibility = "hidden";
        this.textArtist.style.visibility = "hidden";
        this.textAlbum.style.visibility = "hidden";
        this.textTitle.style.visibility = "hidden";
        this.titleImage.style.visibility = "hidden";
    }
    else if(atSpeed && !this.properties.visible)
    {
        this.divElt.style.visibility = "hidden";
        this.divElt.style.background = "rgba(0,0,0,1)";
        this.textGeneric.style.visibility = "hidden";
        this.imageTitle.style.visibility = "hidden";
        this.imageAlbum.style.visibility = "hidden";
        this.imageArtist.style.visibility = "hidden";
        this.textArtist.style.visibility = "hidden";
        this.textAlbum.style.visibility = "hidden";
        this.textTitle.style.visibility = "hidden";
        this.titleImage.style.visibility = "hidden";
    }
};

/*END OF PUBLIC APIS */

NowPlayingInfoCtrl.prototype.handleControllerEvent = function(eventID) 
{
    log.info("Handle controller event called, ignored");
    return "ignored";
};

NowPlayingInfoCtrl.prototype.cleanUp = function() 
{
    log.info("Clean up called, destroying NowPlayingInfoCtrl");
    this.divElt.removeEventListener('click', this._fireSelectCallback);
};

framework.registerCtrlLoaded('NowPlayingInfoCtrl');
