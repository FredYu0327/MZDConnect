/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: Localization.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: awoodhc
 Date: 04.27.2012
 __________________________________________________________________________

 Description: IHU GUI Localization Module

 Revisions:
 v0.1 - Initial Revision (27-Apr-2012)
 v0.2 - (04-May-2012) setLang() now accepts language codes ("en_US") instead of literal strings ("english")
 Language Dictionaries separated in .js files.
 v0.3 - (15-May-2012) getLocStr now takes subMap as optional argument. Certain stringIds will expect a subMap
 v0.4 - (4-June-2012) Removed _dictNames object. Dictionaries are now retrieved directly from uiaId.
 v0.5 (23-July-2012) Removed _appHasDictFiles object. Apps should now report lang support in registerAppLoaded
 v0.6 (14-Aug-2012) loadAppDict now supports dictionaries only as Objects (Apps should remove JSON.parse from their dictionaries)
 v0.7 (23-Oct-2012) getLocStr now checks if subMap is of type Object and throws warning if not
 v0.8 (26-Oct-2012) Added API for getting a language code based on MMUI Enum
 v0.9 (5-Nov-2012) Added APIs for storing Apps with Language Support
 v1.0 (03-Dec-2012) Add APIs setter and getter APIs for regional settings and language change (aganesar)
 v1.1 (19-Feb-2013) Updated region enum values
 __________________________________________________________________________

 */

log.addSrcFile("Localization.js", "framework");

/*
 * =========================
 * API's constructor
 * =========================
 * Localization will be set up once for the framework and then should be accessed via
 * Framework.localize.getLocStr(this.uiaId, "menuArtists");
 */
function Localization()
{
    // (Object) Language ENUMS defined by CPP_LANG with corresponding GUI codes      
    this.LANG_CODES = {
        "LANGS_US_ENGLISH"     : "en_US",               /* US (North American) English */
        "LANGS_NA_SPANISH"     : "es_MX",               /* North American Spanish */
        "LANGS_CN_FRENCH"      : "fr_CN",               /* Canadian (North American) French */
        "LANGS_UK_ENGLISH"     : "en_UK",               /* UK English */
        "LANGS_JA_JAPANESE"    : "ja_JP",               /* Japanese */
        "LANGS_SP_SPANISH"     : "es_ES",               /* Castilian (European) Spanish */
        "LANGS_FR_FRENCH"      : "fr_FR",               /* European French */
        "LANGS_IT_ITALIAN"     : "it_IT",               /* Italian */
        "LANGS_DE_GERMAN"      : "de_DE",               /* German */
        "LANGS_NL_DUTCH"       : "nl_NL",               /* Dutch */
        "LANGS_PT_PORTUGUESE"  : "pt_PT",               /* European Portuguese */
        "LANGS_BR_PORTUGUESE"  : "pt_BR",               /* Brazilain Portuguese */
        "LANGS_AU_ENGLISH"     : "en_AU",               /* Australian English */
        "LANGS_RU_RUSSIAN"     : "ru_RU",               /* Russian */
        "LANGS_FI_FINNISH"     : "fi_FI",               /* Finnish */
        "LANGS_SW_SWEDISH"     : "sv_SE",               /* Swedish */
        "LANGS_DA_DANISH"      : "da_DK",               /* Danish */
        "LANGS_TW_CHINESE"     : "zh_TW",               /* Traditional Chinese */     /* character set - Traditional , dialect - Mandarin */
        "LANGS_CN_CHINESE"     : "zh_CN",               /* Simplified Chinese */      /* character set - Simplified , dialect - Mandarin */
        "LANGS_HK_CANTONESE"   : "cn_HK",               /* Cantonese */               /* character set - Traditional , dialect - Hongkong Cantonese */
        "LANGS_TW_MANDARIN"    : "mn_TW",               /* Taiwanese */               /* character set - Traditional , dialect - Taiwanese Mandarin */
        "LANGS_GCC_ARABIC"     : "ar_SA",               /* Arabic */
        "LANGS_CZ_CZECH"       : "cs_CS",               /* Czech Republic */
        "LANGS_HU_HUNGARIAN"   : "hu_HU",               /* Hungarian */
        "LANGS_NO_NORWEGIAN"   : "no_NO",               /* Norwegian */
        "LANGS_PL_POLISH"      : "pl_PL",               /* Polish */
        "LANGS_SK_SLOVAK"      : "sk_SK",               /* Slovakia */
        "LANGS_TR_TURKISH"     : "tr_TR",               /* Turkish */   
        "LANGS_ET_ESTONIAN"    : "et_EE",               /* Estonian */
        "LANGS_LV_LATVIAN"     : "lv_LV",               /* Latvian */
        "LANGS_LT_LITHUANIAN"  : "lt_LT",               /* Lithuanian */
        "LANGS_GR_GREEK"       : "el_GR",               /* Greek */
        "LANGS_CN_CROATIAN"    : "hr_HR",               /* Croatian */
        "LANGS_BG_BULGARIAN"   : "bg_BG",               /* Bulgarian */
        "LANGS_RO_ROMANIAN"    : "ro_RO",               /* Romanian */
        "LANGS_SE_SERBIAN"     : "sr_RS",               /* Serbian */
        "LANGS_HB_HEBREW"      : "he_IL",               /* Hebrew */
        "LANGS_BS_MALAYSIA"    : "ms_MY",               /* Bahasa Malaysia */
        "LANGS_TH_THAI"        : "th_TH",               /* Thai */
        "LANGS_IN_INDONESIA"   : "id_ID",               /* Indonesia */
    };

    // Generate reverse lookup map
    this._REVERSE_LANG_CODES = {};
    for (var prop in this.LANG_CODES)
    {
        if (this.LANG_CODES.hasOwnProperty(prop))
        {
            var value = this.LANG_CODES[prop];
            this._REVERSE_LANG_CODES[value] = prop;
        }
    }

    this.REGIONS = {
        "Undefined"    : "Undefined",
        "Europe"       : "Region_Europe",
        "NorthAmerica" : "Region_NorthAmerica",
        "4A"           : "Region_4A",
        "Japan"        : "Region_Japan",
        "ChinaTaiwan"  : "Region_ChinaTaiwan"                
    };    
   
    this.TIME_FORMATS = {
        "Undefined" : "Undefined",
        "T12hrs" : "12hrs",
        "T24hrs" : "24hrs",                
    };    
    
    this.VOLUME_UNITS = {
        "Undefined" : "Undefined",
        "Gallons": "Gallons",
        "Liters" : "Liters"               
    };
    
    this.TMPRTURE_UNITS = {
        "Undefined" : "Undefined",
        "Fahrenheit": "Fahrenheit",
        "Celsius" : "Celsius"               
    };
    
    this.DISTANCE_UNITS = {
        "Undefined" : "Undefined",
        "Miles" : "Miles",
        "Kilometers" : "Kilometers"               
    };
    
    this.DISPLAY_THEMES = {
        "DisplayTheme_Undefined" : "DisplayTheme_Undefined",
        "DisplayTheme_01" : "DisplayTheme_01",
        "DisplayTheme_02" : "DisplayTheme_02",
        "DisplayTheme_03" : "DisplayTheme_03",
        "DisplayTheme_04" : "DisplayTheme_04",
        "DisplayTheme_05" : "DisplayTheme_05",
        "DisplayTheme_06" : "DisplayTheme_06",
        "DisplayTheme_07" : "DisplayTheme_07",
        "DisplayTheme_08" : "DisplayTheme_08",
        "DisplayTheme_09" : "DisplayTheme_09",
        "DisplayTheme_99" : "DisplayTheme_99"               
    };

    /* NOTE: Default language is set to US English because Common dictionary cannot load if a language is not set at first.
     * If default language is changed, it may be necessary to update common.scss default settings as well.
     */
    this._currentLang = this.LANG_CODES.LANGS_US_ENGLISH;    //  Currently selected language
    this._prevLang = null; // (String) Previously set language. Note: This stays cached. _prevAppDicts can be used to identify when there are prev dictionaries in memory
    this._currLangVrSupport = true;
    
    this._currentRegion = null;        //  Currently selected region
    this._currentTimeFormat = null;    //  Currently selected time format

    //TODO: Because feature team has not specified a volume unit, framework sets the default voulme unit
    this._currentVolumeUnit = "Gallons";    //  Currently selected volume unit
    this._currentTmprtureUnit = null;    //  Currently selected temperature unit
    this._currentDistanceUnit = null;    //  Currently selected distance unit
    this._currentDisplayTheme = null;    //  Currently selected display theme
    this._currentKeyboardLang = null;   // Currently selected Keyboard language
    this._appLangChangeCallback = null; // Stores the app language complete callback
    // Note: vehicle type is stored as shared data in GUI Framework
    
    this._appDicts = new Object();  // (Object) holds all currently loaded dictionary objects
    // Initialize _prevAppDicts to null, rather than new Object(), to avoid dictionary misses when changing language
    // to the same language & language change fails.  Also matches postcondition for successful language changes.
    this._prevAppDicts = null;  // (Object) holds all previously loaded dictionary objects
    this._appsWithLangSupport = new Object(); // (Object) holds uiaIds of all Apps that have reported they have dictionaries

    // initialize
    this.init();
}

/*
 * =========================
 * Module's init
 * =========================
 */

Localization.prototype.init = function()
{
    log.debug("Localization module started successfully.");
};

/*
 * =========================
 * The following APIs are for internal use within 
 * the GUI Framework Component
 * =========================
 */

/*
 * (internal) Sets the new language and reloads any currently loaded dictionaries.
 * open Apps.
 * @param   language    (string) the language code to change to (e.g. "en_US" or "fr_FR" see language_dictionaries folder for
 * codes)
 *
 */
Localization.prototype.setLang = function(language)
{
    log.warn("setLang() FUNCTION DEPRECATED USE setlanguage()"); 
    if(this._currentLang == language)
    {
        //skip this step if we try to set the same language twice.
        log.debug("Language is already set to " + language);
        return;
    }
    log.debug("Setting language to " + language);
    this._currentLang = language;
};

/*
 * (internal) Called by Framework. Adds a uiaId to the language support list
 */
Localization.prototype.addLangSupport = function(uiaId)
{
    this._appsWithLangSupport[uiaId] = true;
}


/*
 * (internal removes script tags of the langCode passed in 
 * @param   langCode
 * 
 */
Localization.prototype._removeScriptNodes = function(langCode)
{
    log.debug("Localization.prototype._removeScriptNodes called with langCode "+ langCode);
    var head = document.querySelector("head");
    var scripts = head.querySelectorAll("script");    
    for (var j = 0; j < scripts.length; j++)
    {        
        if (scripts[j].lang == langCode)
        {
            log.debug("    Removing a language script", scripts[j].lang);
            scripts[j].parentNode.removeChild(scripts[j]);
        }
    }
}


/*
 * (internal) Unloads the dictionaries based on language change status.
 * This is called by Common.js after a language change has finished in MMUI_SYSSETTINGS with Success or Failure
 * @param   langCode    String   language code to unload dictionaries for
 * @param   status      Boolean  true if the language change was successful
 * 
 */
Localization.prototype.unloadDictionaries = function(langCode, status)
{
    log.debug("Localization.prototype.unloadDictionaries called with langCode "+ langCode + " and status "+ status);
    if (langCode == this._currentLang && status)
    {
        if (this._prevAppDicts == null)
        {
            log.warn("No previous dictionaries exist, so there is nothing to remove.");
            return;
        }
        
        // Remove the script tags
        this._removeScriptNodes(this._prevLang);
        this._prevAppDicts = null; // null all at once
        this.deleteAppDictRef(this._prevLang);
        
    }
    else if (langCode == this._currentLang && (!status))
    {
        if (this._prevAppDicts == null)
        {
            log.error("Attempt to remove previous dictionaries failed. No previous dictionaries exist to go back to.");
            return;
        }

        // Revert Styling changes
        log.info("Language change failed. Reverting to previous language styling: " + this._prevLang);
        framework._setLanguageSpecificStyling(this._prevLang);

        // Remove the script tags
        this._removeScriptNodes(this._currentLang);
        this._appDicts = this._prevAppDicts; // all at once
        this._prevAppDicts = null; // null all at once
        this.deleteAppDictRef(this._currentLang);

        // Make the previous language as current language
        this._currentLang = this._prevLang;
        this._currLangVrSupport = this._prevLangVrSupport;
    }    
}


/*
 * (internal) Loads the Applciation-specific dictionary into memory.
 * @param   uiaId   (string) The uiaId of the app to load a dictionary for.
 */
Localization.prototype.loadAppDict = function(uiaId)
{
    //Retrieve the file name based on the currently set language
    var appDictName = "Localization_" + uiaId + "AppDict_" + this._currentLang;
    
    if (!window[appDictName])
    {
        log.warn("Localization could not find specified dictionary \"" + appDictName + "\". Possibly the script file has not been loaded.");
        return;
    }
    
    // get the Object from the window space
    var dict = window[appDictName]; 
    // Store the new language's dictionary
    this._appDicts[uiaId] = dict;
    
};

/*
 * (internal) Unloads the Application specific dictionary
 * @param   langCode
 */
Localization.prototype.deleteAppDictRef = function(langCode)
{   
    if (langCode == null)
    {
        log.error("deleteAppDictRef called with invalid argument:", langCode);
        return;
    }
    var appDicts = this.getAppsWithLangSupport();
    
    if (appDicts.length > 0)
    {
        for(var i = 0; i < appDicts.length; i++)
        {
            var uiaId = appDicts[i];
            var appDictName = "Localization_" + uiaId + "AppDict_" + langCode;
            //delete the window reference for garbage collection
            window[appDictName] = null; // set to null here. delete doesn't work on window Objects'
            delete window[appDictName];
              
        }
    }
};

/*
 * Test whether the currently loaded dictionary for an app contains the given stringId.
 * @return true if the given stringId is found or false if not.
 */
Localization.prototype.testLocStr = function(defaultAppName, stringId)
{
    var uiaId = defaultAppName;    

    if (defaultAppName && stringId)
    {
        if (stringId.indexOf('.') != -1)
        {
            var strings = stringId.split('.');
            uiaId = strings[0];
            stringId = strings[1];
        }

        if (this._appDicts[uiaId] && this._appDicts[uiaId][stringId])
        {
            return true;
        }
    }
    return false;
}

/*
 * Returns the localized version for the stringId
 * This API is to be used by GUI Controls. In general, it should NOT be called by an App.
 * 
 * @param   defaultAppName  (string) The uiaId of the app the control is in
 * @param   stringId        (string) The id of the string to be localized (e.g. menuArtists). Including the uiaId of a different
 *      app here will override the defaultAppName (e.g. common.Yes or usbaudio.menuArtists)
 * @param   subMap          (object) An optional object containing values that will replace unique keys in the localized string
 * @return  (string) The localized string. If a dictionary cannot be found (or is not loaded) for the given values, the
 * provided stringId will be returned.
 */
Localization.prototype.getLocStr = function(defaultAppName, stringId, subMap)
{
    var uiaId = defaultAppName;
    var originalStringId = stringId;
    var localStr;

    if (defaultAppName && stringId)
    {
        if (stringId.indexOf('.') != -1)
        {
            // Check for the dot override
            var strings = stringId.split('.');
            // split into first part and second part
            uiaId = strings[0];
            stringId = strings[1];
        }

        if (this._appDicts[uiaId])
        {
            if (this._appDicts[uiaId].hasOwnProperty(stringId))
            {
                // make sure this dict is loaded AND the string is available
                localStr = this._appDicts[uiaId][stringId];
                if (subMap)
                {
                    if (utility.toType(subMap) == 'object')
                    {
                        // new functionality to map values into the localized string
                        for(var key in subMap)
                        {
                            // search and replace for each key in the subMap
                            log.debug("Localization.getLocStr changing for key " + key);
                            var regex = new RegExp('\\{' + key + '\\}', 'g');

                            // using a function as the second argument eliminates unintended special pattern matching
                            localStr = localStr.replace(regex, function(){ return subMap[key]; });
                        }
                    }
                    else
                    {
                        log.error("Invalid subMap passed with stringId: " + stringId + ". SubMaps must be of type Object.");
                    }
                }

                if (localStr.length === 0)
                {
                    log.error("App dictionary miss (" + this._currentLang + "): " + defaultAppName + " requested '" + originalStringId + "' but the translated string is blank in the dictionary.");
                    localStr = stringId;
                    if (guiConfig.showStringIdFailure)
                    {
                       localStr = this._currentLang + ":" + stringId;
                    }
                }
            }
            else
            {
                log.error("App dictionary miss (" + this._currentLang + "): " + defaultAppName + " requested '" + originalStringId + "' but that stringId is not found.");
                localStr = stringId;
                if (guiConfig.showStringIdFailure)
                {
                   localStr = this._currentLang + ":" + stringId;
                }
            }
        }
        else
        {
            log.error("App dictionary miss (" + this._currentLang + "): " + defaultAppName + " requested '" + originalStringId + "' but that translation file is not loaded. Does the file exist?");
            localStr = stringId;
            if (guiConfig.showStringIdFailure)
            {
               localStr = this._currentLang + ":" + stringId;
            }
        }
    }
    else
    {
        log.warn("Invalid call to framework.localize.getLocStr(): defaultAppName and stringId cannot be null or undefined.");
    }
    return localStr;
};

/* 
 * (internal) Returns an array of all uiaIds with loaded dictionaries
 */
Localization.prototype.getLoadedDicts = function()
{
    return Object.keys(this._appDicts);
};

/* 
 * (internal) Returns an array of all apps that are loaded and have language support
 */
Localization.prototype.getAppsWithLangSupport = function()
{
    return Object.keys(this._appsWithLangSupport);
}
/*
 * !!!!! FRAMEWORK INTERNAL !!!!!!!!
 *
 * Gets called by framework when language change is complete
 *
 * @param   status Boolean  true if the language change was successful
 * @return  none
 */
Localization.prototype._langChangeCallback = function(status)
{
    log.debug("Localization.prototype._langChangeCallback called");
    
    
    // If lang change failed within GUI, unload the new language dictionaries and switch to previous language 
    if (!status)
    {
       this.unloadDictionaries(this._currentLang,false);
    }
    
    if ( typeof this._appLangChangeCallback == "function" )
    {     
        this._appLangChangeCallback(status);
    }
    else
    {
        log.warn("Invalid callback function passed by the app to the localization module");
    }
}

/*
 * Call framework.initGui if it has not yet been called and all required loczliation parameters have been set.
 */
Localization.prototype._tryInitGui = function()
{
    if (!framework.initGuiCalled)
    {
        if (this._currentLang && 
            this._currentTimeFormat && 
            this._currentTmprtureUnit && 
            this._currentDistanceUnit &&
            this._currentKeyboardLang &&
            this._currentRegion &&
            framework.getSharedData('syssettings', 'VehicleType')
            )
        {
            framework.initGui();
        }
    }
}



/*
 * =========================
 * Module's public APIs
 * The followig methods are available for
 * public access.
 * =========================
 */

/*Returns the current language code*/
/********************* FUNCTION DEPRECATED USE getlanguage() ***********************************/
Localization.prototype.getCurrLang = function()
{
    log.warn("getCurrLang() FUNCTION DEPRECATED USE getCurrentlanguage()"); 
    return this._currentLang;
}

/*
 * Sets the new language of the GUI Framework
 *
 * @param   enumKey String  An ENUM value from this.LANG_CODES variable
 * @param   vrSupport 
 * @param   reloadAll - (Boolean), deprecated and ignored
 * @param   callbackFn - (Function) callback function invoked after GUI framework changes the language.
 * @return  none
 */
Localization.prototype.setLanguage = function(enumKey, vrSupport, reloadAll, callbackFn)
{
    log.debug ("Localization.prototype.setLanguage called ", enumKey, vrSupport, callbackFn);
    if ((!(this._currentLang == enumKey)) && (enumKey.toUpperCase() != "UNDEFINED"))
    { 
        this._prevAppDicts = utility.deepCopy(this._appDicts);
        this._prevLang = this._currentLang;
        this._prevLangVrSupport = this._currLangVrSupport;
        this._currentLang = enumKey;
        this._currLangVrSupport = vrSupport;
        this._appLangChangeCallback = callbackFn;
                       
        framework.changeLanguage(enumKey, this._langChangeCallback.bind(this));
    }
    else
    {
        log.debug ("Language is already set to " + enumKey + " OR enumKey " + enumKey + " is not a valid value");
    }

    this._tryInitGui();
}

/*
 * Gets the current language of the GUI Framework
 *
 * @param   none
 * @return  value   String  Current language of the GUI Framework stored in this._currentLang variable
 */
Localization.prototype.getCurrentLanguage = function()
{
    return (this._currentLang);
}

/*
 * Validate a sys settings value.
 */
Localization.prototype._validateSetting = function(value, enumObject)
{
    if (value)
    {
        for (var prop in enumObject)
        {
            if (enumObject.hasOwnProperty(prop) && enumObject[prop] === value)
            {
                return true;
            }
        }
    }
    return false;
}

/*
 * Sets the keyboard language of the CMU
 *
 * @param   enumKey String  The name of a keyboard layout as defined in the Keyboard Control SDD in GUI_COMMON.
 * @return  none
 */
Localization.prototype.setKeyboardLanguage = function(enumKey)
{
    if (enumKey)
    {
        this._currentKeyboardLang = enumKey;
        this._tryInitGui();
    }
}

/*
 * Gets the current language of the GUI Framework
 *
 * @param   none
 * @return  value   String  Keyboard language of the CMU stored in this._currentKeyboardLang variable
 */
Localization.prototype.getKeyboardLanguage = function()
{
    return (this._currentKeyboardLang);
}

/*
 * Gets the previous language of the GUI Framework
 *
 * @param   none
 * @return  value   String  Current language of the GUI Framework stored in this._prevLang variable
 */
Localization.prototype.getPreviousLanguage = function()
{
    return (this._prevLang);
}


/*
 * Sets the new region of the GUI Framework
 *
 * @param   enumKey String  An ENUM value from this.REGIONS variable
 * @return  none
 */
Localization.prototype.setRegion = function(enumKey)
{
    if (this._validateSetting(enumKey, this.REGIONS))
    {
        this._currentRegion = enumKey;
        this._tryInitGui();
    } 
    else
    {
        log.warn("setRegion() called with invalid value and ignored: " + enumKey);
    } 
}

/*
 * Gets the current region of the GUI Framework 
 *
 * @param   none
 * @return  value   String  Current region of the GUI Framework stored in this._currentRegion variable
 */
Localization.prototype.getRegion = function()
{
    return this._currentRegion;
}

/*
 * Sets the new time format of the GUI Framework
 *
 * @param   enumKey String  An ENUM value from this.TIME_FORMATS variable
 * @return  none
 */
Localization.prototype.setTimeFormat = function(enumKey)
{
    if (this._validateSetting(enumKey, this.TIME_FORMATS))
    {
        this._currentTimeFormat = enumKey;
        this._tryInitGui();
    } 
    else
    {
        log.warn("setTimeFormat() called with invalid value and ignored: " + enumKey);
    }
}

/*
 * Gets the current time format of the GUI Framework
 *
 * @param   none
 * @return  value   String  Current region of the GUI Framework stored in this._currentTimeFormat variable
 */
Localization.prototype.getTimeFormat = function()
{
    return this._currentTimeFormat;
}

/*
 * Deprecated
 */
Localization.prototype.setDateFormat = function(enumKey)
{
    log.warn("setDateFormat() FUNCTION DEPRECATED");
}

/*
 * Deprecated
 */
Localization.prototype.getDateFormat = function()
{
    log.warn("getDateFormat() FUNCTION DEPRECATED");
}

/*
 * Sets the new distance unit of the GUI Framework
 *
 * @param   enumKey String  An ENUM value from this.VOLUME_UNITS variable
 * @return  none
 */
Localization.prototype.setVolumeUnit = function(enumKey)
{
    if (this._validateSetting(enumKey, this.VOLUME_UNITS))
    {
        this._currentVolumeUnit = enumKey;
        this._tryInitGui();
    }
    else
    {
        log.warn("setVolumeUnit() called with invalid value and ignored: " + enumKey);
    }
}

/*
 * Gets the current volume unit of the GUI Framework
 *
 * @param   none
 * @return  value   String  Current volume unit of the GUI Framework stored in this.volumeUnit variable
 */
Localization.prototype.getVolumeUnit = function()
{
    return this._currentVolumeUnit;
}

/*
 * Sets the new temperature unit of the GUI Framework
 *
 * @param   enumKey String  An ENUM value from this.TMPRTURE_UNITS variable
 * @return  none
 */
Localization.prototype.setTemperatureUnit = function(enumKey)
{
    if (this._validateSetting(enumKey, this.TMPRTURE_UNITS))
    {
        this._currentTmprtureUnit = enumKey;
        this._tryInitGui();
    }
    else
    {
        log.warn("setTemperatureUnit() called with invalid value and ignored: " + enumKey);
    }
}

/*
 * Gets the current temperature unit of the GUI Framework
 *
 * @param   none
 * @return  value   String  Current temperature unit of the GUI Framework stored in this._currentTmprtureUnit variable
 */
Localization.prototype.getTemperatureUnit = function()
{
    return this._currentTmprtureUnit;
}

/*
 * Sets the new distance unit of the GUI Framework
 *
 * @param   enumKey String  An ENUM value from this.DISTANCE_UNITS variable
 * @return  none
 */
Localization.prototype.setDistanceUnit = function(enumKey)
{
    if (this._validateSetting(enumKey, this.DISTANCE_UNITS))
    {
        this._currentDistanceUnit = enumKey;
        this._tryInitGui();
    }
    else
    {
        log.warn("setDistanceUnit() called with invalid value and ignored: " + enumKey);
    }
}

/*
 * Gets the current distance unit of the GUI Framework
 *
 * @param   none
 * @return  value   String  Current distance unit of the GUI Framework stored in this.distanceUnit variable
 */
Localization.prototype.getDistanceUnit = function()
{
    return this._currentDistanceUnit;
}

/*
 * Sets the new display theme of the GUI Framework
 *
 * @param   enumKey String  An ENUM value from this.DISPLAY_THEMES variable
 * @return  none
 */
Localization.prototype.setDisplayTheme = function(enumKey)
{
    if (this._validateSetting(enumKey, this.DISPLAY_THEMES))
    {
        this._currentDisplayTheme = enumKey;
        this._tryInitGui();
    }
    else
    {
        log.warn("setDisplayTheme() called with invalid input and ignored: " + enumKey);
    }
}

/*
 * Gets the current display theme of the GUI Framework
 *
 * @param   none
 * @return  value   String  Current display theme of the GUI Framework stored in this._currentDisplayTheme variable
 */
Localization.prototype.getDisplayTheme = function()
{
    return this._currentDisplayTheme;
}

/*
 * Sets the vehicle type in the GUI Framework
 * This value can be retrieved with framework.getSharedData('syssettings', 'VehicleType');
 *
 * @param   type String  A value representing the vehicle type
 * @return  none
 */
Localization.prototype.setVehicleType = function(type)
{
    if (type != null)
    {
        // set the shared data on behalf of syssettings. This is needed here so that we can still check this
        // as a startup setting
        framework.setSharedData('syssettings', 'VehicleType', type);
        this._tryInitGui();
    }
    else
    {
        log.warn("setVehicleType() called with invalid input and ignored: " + type);
    }
};

/*
 * Gets the current language in MMUI Format
 *
 * @param   none
 * @return  String language in MMUI Format e.g: LANGS_JA_JAPANESE
 */
Localization.prototype.getLangInMmuiFormat= function(enumKey)
{
    return this._REVERSE_LANG_CODES[enumKey];
}

/*
 * Gets the current language in GUI Format
 *
 * @param   none
 * @return  String language in GUI Format e.g: ja_JP
 */
Localization.prototype.getLangInGuiFormat= function(enumKey)
{
    return this.LANG_CODES[enumKey];
}


